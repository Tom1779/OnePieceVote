"""
Weekly sync of One Piece Wiki characters into Supabase + public/characters images.

Replaces the old get_characters.py -> update_table.py -> download_images.py flow.
Supabase is the source of truth (no local JSON needed), and characters are matched
by their wiki *page ID* rather than their name or URL, so:

  - Several list entries that link to the same page (group pages like
    "Tsumegeri Guards", or a single character listed twice) only ever get one row.
  - When a character's name is revealed and the wiki page is moved, the old URL
    redirects to the same page ID, so the existing row (and its votes) is renamed
    instead of a new row being added.
  - When a character that used to link to a group page gets their own page, the
    existing row is matched by name and its wiki_url is updated.

Rows pointing at a disambiguation page (not a character) are deleted if they have
no votes. Anything else that looks stale or duplicated is only reported.

Usage:
    python scripts/sync_characters.py            # apply changes
    python scripts/sync_characters.py --dry-run  # only print what would change
"""
from curl_cffi import requests  # pip install curl_cffi
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv
from urllib.parse import unquote, quote
from difflib import SequenceMatcher
import argparse
import os
import sys
import time

BASE_URL = "https://onepiece.fandom.com"
API_URL = f"{BASE_URL}/api.php"
CHARACTER_LISTS = {
    True: "List_of_Canon_Characters",
    False: "List_of_Non-Canon_Characters",
}
TABLE = "one_piece_characters"
IMAGE_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "characters")
SKIP_HREF_PARTS = ['category:', 'template:', 'list_of', 'chapter', 'episode', 'file:', 'help:', 'edit']

session = requests.Session(impersonate="chrome124")


def fetch_with_retry(url, params=None, retries=4, backoff=5):
    """GET a URL, retrying on 429/5xx with exponential backoff."""
    for attempt in range(retries):
        response = session.get(url, params=params, timeout=30)
        if response.status_code in (429, 500, 502, 503, 504):
            wait = backoff * (2 ** attempt)
            print(f"  HTTP {response.status_code}. Waiting {wait}s before retry...")
            time.sleep(wait)
            continue
        response.raise_for_status()
        return response
    response.raise_for_status()
    return response


def wiki_api(**params):
    params.update(format="json", formatversion="2")
    return fetch_with_retry(API_URL, params=params).json()


def title_from_url(wiki_url):
    path = wiki_url.split("/wiki/", 1)[-1].split("#", 1)[0]
    return unquote(path).replace("_", " ").strip()


def url_from_title(title):
    return f"{BASE_URL}/wiki/{quote(title.replace(' ', '_'), safe="()!,.:;'-_~/")}"


def normalize_name(name):
    return " ".join(name.split()).lower()


def similar_names(a, b):
    """Loose spelling match, e.g. "Kusunoa-kun" vs "Kusonoa Kun"."""
    a = "".join(c for c in a.lower() if c.isalnum())
    b = "".join(c for c in b.lower() if c.isalnum())
    return SequenceMatcher(None, a, b).ratio() >= 0.85


def resolve_titles(titles):
    """
    Resolve wiki titles to {title: (page_id, canonical_title, is_disambiguation)},
    following redirects (page moves). Missing pages map to (None, None, False).
    """
    resolved = {}
    titles = list(dict.fromkeys(t for t in titles if t))
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        data = wiki_api(action="query", titles="|".join(batch), redirects=1,
                        prop="pageprops", ppprop="disambiguation")["query"]
        normalized = {n["from"]: n["to"] for n in data.get("normalized", [])}
        redirects = {r["from"]: r["to"] for r in data.get("redirects", [])}
        pages = {p["title"]: p for p in data.get("pages", []) if not p.get("missing")}
        for title in batch:
            final = normalized.get(title, title)
            seen = set()
            while final in redirects and final not in seen:
                seen.add(final)
                final = redirects[final]
            page = pages.get(final)
            if page and page.get("pageid"):
                resolved[title] = (page["pageid"], final, "disambiguation" in page.get("pageprops", {}))
            else:
                resolved[title] = (None, None, False)
        time.sleep(1)
    return resolved


def get_character_image(wiki_url):
    """Return the infobox image URL of a character page, or None."""
    try:
        soup = BeautifulSoup(fetch_with_retry(wiki_url).content, "html.parser")
    except Exception as e:
        print(f"  Error getting image for {wiki_url}: {e}")
        return None
    for selector in ["figure.pi-image img.pi-image-thumbnail", "figure.pi-image img",
                     "aside.portable-infobox img"]:
        img = soup.select_one(selector)
        if img and (img.get("src") or img.get("data-src")):
            src = img.get("src") or img.get("data-src")
            if not src.startswith("data:"):
                return src
    return None


def get_page_images(pages):
    """Return {page_id: image URL} for {page_id: wiki_url}."""
    images = {}
    for page_id, wiki_url in pages.items():
        image_url = get_character_image(wiki_url)
        if image_url:
            images[page_id] = image_url
        time.sleep(1)  # Be polite to the wiki servers
    return images


def get_list_entries(page, is_canon):
    """Scrape one character list page. Returns [{'name', 'title', 'is_canon'}]."""
    html = wiki_api(action="parse", page=page, prop="text")["parse"]["text"]
    soup = BeautifulSoup(html, "html.parser")

    table = None
    for candidate in soup.find_all("table"):
        headers = [th.get_text(strip=True).lower() for th in candidate.find_all("th")]
        if any("name" in h for h in headers):
            table = candidate
            break
    if table is None:
        raise RuntimeError(f"Could not find the character table on {page}")

    headers = [th.get_text(strip=True).lower() for th in table.find("tr").find_all("th")]
    name_col = next(i for i, h in enumerate(headers) if "name" in h)

    entries = []
    for row in table.find_all("tr")[1:]:
        cells = row.find_all(["td", "th"])
        if len(cells) <= name_col:
            continue
        link = cells[name_col].find("a")
        if not link:
            continue
        href = link.get("href", "")
        if not href.startswith("/wiki/") or any(s in href.lower() for s in SKIP_HREF_PARTS):
            continue
        name = link.get_text(strip=True)
        if not name:
            continue
        entries.append({"name": name, "title": title_from_url(href), "is_canon": is_canon})
    print(f"  {page}: {len(entries)} entries")
    return entries


def get_db_rows(supabase):
    rows, page_size, start = [], 1000, 0
    while True:
        data = supabase.table(TABLE).select("id,name,wiki_url,image_url,image_status,is_canon,votes") \
                       .range(start, start + page_size - 1).execute().data
        rows.extend(data)
        if len(data) < page_size:
            return rows
        start += page_size


def image_filename(name):
    """Must match generateImageSrc() in the frontend."""
    filename = "".join(c if c.isalnum() or c in [' ', '-', '_'] else '' for c in name)
    return filename.lower().replace(' ', '_') + ".png"


def disambiguated_name(name, title):
    """The page title if it is just the name plus a qualifier, e.g. "Wolf (World Seeker)"."""
    if title and title.lower().startswith(name.lower() + " (") and title.endswith(")"):
        return title
    return None


def plan_changes(entries, rows):
    """
    Match list entries to DB rows. Returns (inserts, updates, deletes, skipped, report)
    without touching the database.

    Before matching:
      - rows pointing at a disambiguation page (e.g. "Wolf (Non-Canon)" -> the list of
        everyone called Wolf) are not characters; they're deleted if they have no votes
      - rows that share an image filename (two characters both named "Wolf") are
        renamed to their page title, e.g. "Wolf (Elbaph)" and "Wolf (World Seeker)"

    Matching passes, in order:
      1. same page ID and same name               -> nothing to do
      2. same page ID, row not otherwise matched  -> rename if the wiki page was moved
      3. same name, row not otherwise matched     -> character moved to their own page
      4. row whose wiki page no longer exists and
         whose name is spelled almost the same    -> rename (redirect was deleted)
      5. nothing matched                          -> insert, using the page title as the
                                                     name if the plain name is taken
    """
    updates_by_id = {}
    deletes, skipped, report = [], [], []

    def add_update(row, change, reason):
        if row["id"] in updates_by_id:
            _, existing, existing_reason = updates_by_id[row["id"]]
            existing.update(change)
            updates_by_id[row["id"]] = (row, existing, f"{existing_reason}; {reason}")
        else:
            updates_by_id[row["id"]] = (row, dict(change), reason)

    characters = []
    for row in rows:
        if not row["disambiguation"]:
            characters.append(row)
        elif row["votes"]:
            report.append(f"Points to a disambiguation page but has votes: {row['name']} ({row['wiki_url']})")
        else:
            deletes.append(row)
    rows = characters

    # Characters sharing a name would also share an image file, so give them the
    # qualified page title instead.
    rows_by_file = {}
    for row in rows:
        rows_by_file.setdefault(image_filename(row["name"]), []).append(row)
    taken_files = set(rows_by_file)
    for same_file in rows_by_file.values():
        if len(same_file) < 2:
            continue
        for row in same_file:
            new_name = disambiguated_name(row["name"], row["title"])
            if new_name and image_filename(new_name) not in taken_files:
                taken_files.add(image_filename(new_name))
                add_update(row, {"name": new_name}, f"was \"{row['name']}\", same name as another character")
                row["name"] = new_name
        remaining = [r for r in same_file if image_filename(r["name"]) == image_filename(same_file[0]["name"])]
        if len(remaining) > 1:
            report.append("Same name, can't tell apart: " + ", ".join(f"{r['name']} ({r['wiki_url']})" for r in remaining))

    claimed = set()          # DB row ids matched to a list entry
    rows_by_page = {}
    rows_by_name = {}
    for row in rows:
        rows_by_page.setdefault(row["page_id"], []).append(row)
        rows_by_name.setdefault(normalize_name(row["name"]), []).append(row)

    # One entry per wiki page; group members that link to the same page collapse here.
    # Prefer an entry whose name is already in the DB, so we don't rename existing rows.
    entries_by_page = {}
    for entry in entries:
        if not entry["page_id"]:
            continue
        current = entries_by_page.get(entry["page_id"])
        if current is None or (normalize_name(entry["name"]) in rows_by_name
                               and normalize_name(current["name"]) not in rows_by_name):
            entries_by_page[entry["page_id"]] = entry

    inserts = []

    # A name shared by several list entries (e.g. two different "Josephine"s) is too
    # ambiguous to match on or to use as-is.
    list_name_counts = {}
    for entry in entries_by_page.values():
        list_name_counts[normalize_name(entry["name"])] = list_name_counts.get(normalize_name(entry["name"]), 0) + 1

    def free_name(entry):
        """Name to use for this entry without clashing with another character's image."""
        name = entry["name"]
        if list_name_counts[normalize_name(name)] == 1 and image_filename(name) not in taken_files:
            return name
        title = disambiguated_name(name, title_from_url(entry["wiki_url"]))
        if title and image_filename(title) not in taken_files:
            return title
        return None

    def rename(row, entry, reason):
        change = {"wiki_url": entry["wiki_url"]}
        if normalize_name(entry["name"]) != normalize_name(row["name"]):
            new_name = free_name(entry)
            if not new_name:
                skipped.append(f"rename {row['name']} -> {entry['name']}: name already used by another character")
                return
            taken_files.add(image_filename(new_name))
            change["name"] = new_name
        add_update(row, change, reason)

    pending = []
    for entry in entries_by_page.values():
        match = next((r for r in rows_by_page.get(entry["page_id"], [])
                      if normalize_name(r["name"]) == normalize_name(entry["name"])), None)
        if match:
            claimed.add(match["id"])
        else:
            pending.append(entry)

    still_pending = []
    for entry in pending:
        match = next((r for r in rows_by_page.get(entry["page_id"], []) if r["id"] not in claimed), None)
        if not match:
            still_pending.append(entry)
            continue
        claimed.add(match["id"])
        # Only rename when the page itself was moved (old title now redirects).
        # A different label in the list, e.g. "Billy" for "Billy (Pirate)", is left alone.
        if title_from_url(match["wiki_url"]) != title_from_url(entry["wiki_url"]):
            rename(match, entry, "wiki page renamed")

    pending, still_pending = still_pending, []
    for entry in pending:
        match = next((r for r in rows_by_name.get(normalize_name(entry["name"]), [])
                      if r["id"] not in claimed), None)
        if match and list_name_counts[normalize_name(entry["name"])] == 1:
            claimed.add(match["id"])
            add_update(match, {"wiki_url": entry["wiki_url"]}, "moved to own wiki page")
        else:
            still_pending.append(entry)

    dead_rows = [r for r in rows if not r["page_id"]]
    for entry in still_pending:
        match = next((r for r in dead_rows if r["id"] not in claimed
                      and similar_names(r["name"], entry["name"])), None)
        if match:
            claimed.add(match["id"])
            rename(match, entry, "old wiki page deleted, similar name")
        elif free_name(entry):
            entry["name"] = free_name(entry)
            taken_files.add(image_filename(entry["name"]))
            inserts.append(entry)
        else:
            skipped.append(f"{entry['name']} ({entry['wiki_url']}): name already used by another character")

    # Anything left is only reported.
    for page_id, page_rows in rows_by_page.items():
        if page_id and len(page_rows) > 1:
            report.append("Same wiki page: " + ", ".join(f"{r['name']} ({r['votes']} votes)" for r in page_rows))
    for row in dead_rows:
        if row["id"] not in claimed:
            report.append(f"Wiki page no longer exists: {row['name']} ({row['wiki_url']})")
    return inserts, list(updates_by_id.values()), deletes, skipped, report


def download_image(name, image_url):
    path = os.path.join(IMAGE_FOLDER, image_filename(name))
    if os.path.exists(path):
        return False
    response = fetch_with_retry(image_url)
    with open(path, "wb") as f:
        f.write(response.content)
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="print changes without writing anything")
    args = parser.parse_args()
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows consoles choke on emoji

    load_dotenv(".env.local")
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_role_key:
        raise ValueError("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(supabase_url, service_role_key)

    print("Fetching character lists...")
    entries = []
    for is_canon, page in CHARACTER_LISTS.items():
        entries.extend(get_list_entries(page, is_canon))

    print("Loading Supabase rows...")
    rows = get_db_rows(supabase)
    print(f"  {len(rows)} rows")

    print("Resolving wiki pages (this follows renames/redirects)...")
    resolved = resolve_titles([e["title"] for e in entries] + [title_from_url(r["wiki_url"]) for r in rows])
    for entry in entries:
        entry["page_id"], canonical, disambiguation = resolved.get(entry["title"], (None, None, False))
        entry["wiki_url"] = url_from_title(canonical) if canonical else None
        if disambiguation:
            entry["page_id"] = None  # list links to "X (Disambiguation)", not a character
    for row in rows:
        row["page_id"], row["title"], row["disambiguation"] = \
            resolved.get(title_from_url(row["wiki_url"]), (None, None, False))

    inserts, updates, deletes, skipped, report = plan_changes(entries, rows)

    print(f"\n{len(inserts)} new, {len(updates)} updated, {len(deletes)} deleted, {len(skipped)} skipped")
    for row, change, reason in updates:
        print(f"  ~ {row['name']} -> {change} ({reason})")
    for entry in inserts:
        print(f"  + {entry['name']} ({entry['wiki_url']})")
    for row in deletes:
        print(f"  - {row['name']} ({row['wiki_url']} is a disambiguation page, 0 votes)")
    for line in skipped:
        print(f"  ! skipped {line}")
    if report:
        print("\nNeeds a manual look (nothing was changed for these):")
        for line in report:
            print(f"  ? {line}")

    if args.dry_run:
        print("\nDry run: nothing written.")
        return

    # New rows and renamed rows need a (possibly new) image.
    needs_image = {e["page_id"]: e["wiki_url"] for e in inserts}
    needs_image.update({row["page_id"]: change["wiki_url"] for row, change, _ in updates
                        if "name" in change and "wiki_url" in change})
    print(f"\nFetching {len(needs_image)} character images...")
    images = get_page_images(needs_image)

    for row, change, _ in updates:
        if "name" in change and images.get(row["page_id"]):
            change.update(image_url=images[row["page_id"]], image_status="success")
        supabase.table(TABLE).update(change).eq("id", row["id"]).execute()

    new_rows = [{
        "name": e["name"],
        "image_url": images.get(e["page_id"]),
        "image_status": "success" if images.get(e["page_id"]) else "no_image_found",
        "wiki_url": e["wiki_url"],
        "is_canon": e["is_canon"],
        "votes": 0,
    } for e in inserts]
    for row in deletes:
        supabase.table(TABLE).delete().eq("id", row["id"]).eq("votes", 0).execute()

    for i in range(0, len(new_rows), 25):
        supabase.table(TABLE).insert(new_rows[i:i + 25]).execute()
        time.sleep(1)

    print("\nDownloading missing images...")
    os.makedirs(IMAGE_FOLDER, exist_ok=True)
    downloaded, failed = 0, 0
    for row in get_db_rows(supabase):
        if row["image_status"] != "success" or not row["image_url"]:
            continue
        try:
            if download_image(row["name"], row["image_url"]):
                downloaded += 1
                print(f"  ✅ {row['name']}")
        except Exception as e:
            failed += 1
            print(f"  ❌ {row['name']}: {e}")
    print(f"Downloaded {downloaded} images, {failed} failed")


if __name__ == "__main__":
    main()
