// Image path for a character, derived from its name.
// scripts/sync_characters.py writes images to public/characters/ using this
// exact rule, so keep the two in sync.
export function generateImageSrc(character) {
  return `/characters/${character.name
    .toLowerCase()
    .replace(/ /g, "_")
    .replace(/[^\p{L}\p{N}_-]/gu, "")}.png`;
}
