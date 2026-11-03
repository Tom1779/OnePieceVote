"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Head from "next/head";
import { supabase } from "@/lib/supabase";
import { generateImageSrc } from "@/lib/character-image";
import ImageModal from "../components/ImageModal";
import WikiLink from "../components/WikiLink";
import PageShell from "../components/PageShell";
import CharacterImage from "../components/CharacterImage";
import WantedPoster, { Bounty } from "../components/WantedPoster";

const PODIUM_LABELS = ["Captain", "First Mate", "Second Mate"];
const RANK_COLORS = ["text-brass-dark", "text-ink-soft", "text-[#a5612b]"];

// Skeleton component to prevent layout shift
const SkeletonRow = () => (
  <div className="grid grid-cols-[3rem,1fr,auto] items-center gap-3 border-b border-ink/15 px-3 py-3 animate-pulse sm:grid-cols-[4rem,1fr,auto] sm:px-5">
    <div className="mx-auto h-4 w-8 rounded bg-paper-dark" />
    <div className="flex items-center gap-3">
      <div className="h-14 w-10 shrink-0 bg-paper-dark sm:h-16 sm:w-12" />
      <div className="h-4 w-40 rounded bg-paper-dark" />
    </div>
    <div className="h-4 w-16 rounded bg-paper-dark" />
  </div>
);

// Character row component
const CharacterRow = ({ character, index, openModal }) => {
  return (
    <div className="grid grid-cols-[3rem,1fr,auto] items-center gap-3 border-b border-ink/15 px-3 py-2.5 transition-colors last:border-b-0 hover:bg-paper-dark/40 sm:grid-cols-[4rem,1fr,auto] sm:px-5">
      <div
        className={`text-center font-display text-base sm:text-lg ${
          RANK_COLORS[index] ?? "text-ink-faint"
        }`}
      >
        {index + 1}
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => openModal(character)}
          className="shrink-0 border-2 border-ink/70"
          aria-label={`View ${character.name} full size`}
        >
          <CharacterImage character={character} sizes={96} className="h-14 w-10 sm:h-16 sm:w-12" />
        </button>
        <div className="min-w-0">
          <div className="break-words font-extrabold uppercase leading-tight tracking-wide sm:text-lg">
            {character.name}
          </div>
          <WikiLink url={character.wiki_url} />
        </div>
      </div>
      <Bounty votes={character.votes} className="justify-end text-base sm:text-lg" />
    </div>
  );
};

const Podium = ({ characters, openModal }) => (
  <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:items-end sm:gap-x-8">
    {characters.map((character, index) => (
      <div
        key={character.id}
        className={
          index === 0
            ? "col-span-2 mx-auto w-3/4 sm:order-2 sm:col-span-1 sm:w-full sm:-translate-y-6"
            : index === 1
              ? "sm:order-1"
              : "sm:order-3"
        }
      >
        <div className="mb-3 text-center">
          <div className={`font-display text-3xl sm:text-4xl ${index === 0 ? "text-brass" : "text-paper-dark"}`}>
            No. {index + 1}
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-paper-dark/70">
            {PODIUM_LABELS[index]}
          </div>
        </div>
        <WantedPoster
          character={character}
          index={index + 1}
          onImageClick={() => openModal(character)}
        />
      </div>
    ))}
  </div>
);

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [pageInput, setPageInput] = useState("");

  const getVisiblePages = () => {
    // Reduce delta on mobile for shorter pagination
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const delta = isMobile ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (pageNum && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setPageInput(""); // Clear input after successful navigation
    } else if (pageInput) {
      setPageInput("");
    }
  };

  const handlePageInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const pageButton =
    "min-w-[36px] rounded-sm px-2 py-1.5 text-sm font-bold transition-colors sm:min-w-[40px] sm:px-3 sm:py-2";

  return (
    <div className="space-y-4 py-6 sm:py-10">
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`${pageButton} flex items-center gap-1 text-paper-dark hover:bg-wood-700 disabled:opacity-40`}
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex gap-0.5 sm:gap-1">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={`${pageButton} ${
                page === currentPage
                  ? "paper"
                  : page === "..."
                    ? "cursor-default text-paper-dark/50"
                    : "text-paper-dark hover:bg-wood-700"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`${pageButton} flex items-center gap-1 text-paper-dark hover:bg-wood-700 disabled:opacity-40`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </button>
      </div>

      <form
        onSubmit={handlePageInputSubmit}
        className="flex items-center justify-center gap-2 text-sm text-paper-dark/80"
      >
        <span>Jump to page</span>
        <input
          type="text"
          inputMode="numeric"
          value={pageInput}
          onChange={handlePageInputChange}
          placeholder="#"
          className="paper w-14 rounded-sm px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-brass"
          maxLength="3"
        />
        <span>of {totalPages}</span>
        <button
          type="submit"
          className="rounded-sm bg-brass px-3 py-1 font-bold uppercase tracking-wider text-wood-950 hover:bg-brass-dark"
        >
          Go
        </button>
      </form>
    </div>
  );
};

const PageHeader = ({ subtitle }) => (
  <header className="mb-8 text-center sm:mb-12">
    <h1 className="font-display text-4xl text-paper sm:text-6xl">Bounty Rankings</h1>
    {subtitle && <p className="mt-2 text-lg text-paper-dark/80">{subtitle}</p>}
  </header>
);

const RankingsPage = () => {
  const [allCharacters, setAllCharacters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const CHARACTERS_PER_PAGE = 50;

  const openModal = (character) => {
    setSelectedImage(generateImageSrc(character));
  };

  const closeModal = () => setSelectedImage(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("one_piece_characters")
          .select("*")
          .order("votes", { ascending: false })
          .order("name", { ascending: true })
          .limit(3000);

        if (error) throw error;

        const uniqueCharacters = Array.from(
          new Map(data.map((char) => [char.id, char])).values()
        );

        setAllCharacters(uniqueCharacters);
      } catch (err) {
        console.error("Error fetching rankings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(allCharacters.length / CHARACTERS_PER_PAGE);
  const startIndex = (currentPage - 1) * CHARACTERS_PER_PAGE;
  const endIndex = startIndex + CHARACTERS_PER_PAGE;
  const currentCharacters = allCharacters.slice(startIndex, endIndex);

  // The first page shows the top 3 as a podium above the ledger
  const showPodium = currentPage === 1 && currentCharacters.length >= 3;
  const podium = showPodium ? currentCharacters.slice(0, 3) : [];
  const ledger = showPodium ? currentCharacters.slice(3) : currentCharacters;
  const ledgerStart = showPodium ? startIndex + 3 : startIndex;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>One Piece Character Rankings - Loading...</title>
          <meta
            name="description"
            content="Loading One Piece character rankings based on community votes"
          />
          <link
            rel="canonical"
            href="https://www.onepiecevoting.com/rankings"
          />
        </Head>
        <PageShell>
          <PageHeader />
          <div className="paper mx-auto max-w-4xl">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </PageShell>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - One Piece Character Rankings</title>
          <meta
            name="description"
            content="Error loading One Piece character rankings"
          />
          <link
            rel="canonical"
            href="https://www.onepiecevoting.com/rankings"
          />
        </Head>
        <PageShell>
          <PageHeader />
          <div className="paper mx-auto max-w-xl p-8 text-center">
            <div className="mb-2 font-display text-2xl text-blood">
              Error loading rankings
            </div>
            <div className="text-ink-soft">{error}</div>
          </div>
        </PageShell>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>One Piece Character Rankings - Top Voted Characters</title>
        <meta
          name="description"
          content="View complete rankings of all One Piece characters based on community votes. See who ranks highest in the ultimate One Piece popularity contest!"
        />
        <link rel="canonical" href="https://www.onepiecevoting.com/rankings" />
      </Head>

      <PageShell>
        <PageHeader
          subtitle={`${allCharacters.length.toLocaleString()} characters ranked by community votes`}
        />

        {showPodium && (
          <div className="mb-12 sm:mb-16">
            <Podium characters={podium} openModal={openModal} />
          </div>
        )}

        <div className="mx-auto max-w-4xl">
          <div className="mb-3 flex items-baseline justify-between text-sm text-paper-dark/80">
            <span className="font-display text-xl text-paper">The Ledger</span>
            <span>
              Showing {ledgerStart + 1}–{Math.min(endIndex, allCharacters.length)}
            </span>
          </div>

          <div className="paper">
            {ledger.map((character, index) => (
              <CharacterRow
                key={character.id}
                character={character}
                index={ledgerStart + index}
                openModal={openModal}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </PageShell>

      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt="Character Image"
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default RankingsPage;
