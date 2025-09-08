"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { supabase } from "../../contexts/auth-context";
import ImageModal from "../components/ImageModal";
import WikiLink from "../components/WikiLink";

// Skeleton component to prevent layout shift
const SkeletonRow = () => (
  <div className="grid grid-cols-[auto,1fr,auto] gap-2 sm:gap-4 p-3 sm:p-4 items-center animate-pulse">
    <div className="w-12 sm:w-16 text-center">
      <div className="h-4 bg-gray-700 rounded mx-auto w-8"></div>
    </div>
    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex-shrink-0"></div>
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-700 rounded mb-2"></div>
        <div className="h-3 bg-gray-600 rounded w-20"></div>
      </div>
    </div>
    <div className="w-16 sm:w-24 text-center">
      <div className="h-4 bg-gray-700 rounded mx-auto w-12"></div>
    </div>
  </div>
);

// Optimized character image component
const CharacterImage = ({ character, onClick }) => {
  const [hasError, setHasError] = useState(false);

  const generateImageSrc = (character) => {
    return `/characters/${character.name
      .toLowerCase()
      .replace(/ /g, "_")
      .replace(/[^\p{L}\p{N}_-]/gu, "")}.png`;
  };

  // Simple blur placeholder
  const shimmer = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#374151"/>
    </svg>`
  ).toString("base64")}`;

  return (
    <div onClick={onClick} className="flex-shrink-0 cursor-pointer">
      <Image
        src={
          hasError
            ? "/images/character-placeholder.png"
            : generateImageSrc(character)
        }
        alt={character.name}
        width={64}
        height={64}
        className="!w-12 !h-12 sm:!w-16 sm:!h-16 rounded-full object-contain border-2 border-gray-700"
        placeholder="blur"
        blurDataURL={shimmer}
        loading="lazy"
        unoptimized
        onError={() => setHasError(true)}
      />
    </div>
  );
};

// Character row component
const CharacterRow = ({ character, index, openModal }) => {
  return (
    <div className="grid grid-cols-[auto,1fr,auto] gap-2 sm:gap-4 p-3 sm:p-4 items-center hover:bg-gray-900/50 transition-all duration-300 border-b border-gray-700 last:border-b-0">
      <div
        className={`w-12 sm:w-16 text-center font-bold text-sm sm:text-base ${
          index === 0
            ? "text-yellow-500"
            : index === 1
            ? "text-gray-400"
            : index === 2
            ? "text-amber-600"
            : "text-gray-500"
        }`}
      >
        #{index + 1}
      </div>
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <CharacterImage
          character={character}
          onClick={() => openModal(character)}
        />
        <div className="font-medium text-sm sm:text-base text-gray-200 break-words min-w-0">
          {character.name}
        </div>
        <WikiLink url={character.wiki_url} />
      </div>
      <div className="w-16 sm:w-24 text-center text-blue-400 font-medium text-sm sm:text-base">
        {character.votes.toLocaleString()}
      </div>
    </div>
  );
};

// Pagination component
// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [pageInput, setPageInput] = useState("");

  const getVisiblePages = () => {
    const delta = 2;
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

  return (
    <div className="space-y-4 py-8">
      {/* Page Jump Input */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <span>Jump to page:</span>
        <form
          onSubmit={handlePageInputSubmit}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            placeholder=""
            className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            maxLength="3"
          />
          <span className="text-gray-500">of {totalPages}</span>
          <button
            type="submit"
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {/* Regular Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex gap-1">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={`px-3 py-2 rounded-lg transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : page === "..."
                  ? "text-gray-500 cursor-default"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const RankingsPage = () => {
  const [allCharacters, setAllCharacters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const CHARACTERS_PER_PAGE = 50;

  const openModal = (character) => {
    const imageSrc = `/characters/${character.name
      .toLowerCase()
      .replace(/ /g, "_")
      .replace(/[^\p{L}\p{N}_-]/gu, "")}.png`;
    setSelectedImage(imageSrc);
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Layout wrapper
  const PageLayout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <nav className="bg-gray-900/80 sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <Link
              href="/"
              className="flex items-center gap-1 sm:gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm sm:text-base">Back to Voting</span>
            </Link>
            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Character Rankings
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );

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
        <PageLayout>
          <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="grid grid-cols-[auto,1fr,auto] gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-700 bg-gray-900/50 font-semibold text-sm sm:text-base">
              <div className="w-12 sm:w-16 text-center text-gray-400">Rank</div>
              <div className="text-gray-400">Character</div>
              <div className="w-16 sm:w-24 text-center text-blue-400">
                Votes
              </div>
            </div>
            <div>
              {Array.from({ length: 15 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </div>
        </PageLayout>
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
        <PageLayout>
          <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 p-8 text-center">
            <div className="text-red-400 text-lg mb-4">
              Error loading rankings
            </div>
            <div className="text-gray-400">{error}</div>
          </div>
        </PageLayout>
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

      <PageLayout>
        <div className="space-y-6">
          {/* Stats */}
          <div className="text-center text-gray-400">
            Showing {startIndex + 1} -{" "}
            {Math.min(endIndex, allCharacters.length)} of {allCharacters.length}{" "}
            characters
          </div>

          {/* Rankings Table */}
          <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="grid grid-cols-[auto,1fr,auto] gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-700 bg-gray-900/50 font-semibold text-sm sm:text-base">
              <div className="w-12 sm:w-16 text-center text-gray-400">Rank</div>
              <div className="text-gray-400">Character</div>
              <div className="w-16 sm:w-24 text-center text-blue-400">
                Votes
              </div>
            </div>

            <div>
              {currentCharacters.map((character, index) => (
                <CharacterRow
                  key={character.id}
                  character={character}
                  index={startIndex + index}
                  openModal={openModal}
                />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </PageLayout>

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
