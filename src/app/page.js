"use client";

import { useState, useCallback, useTransition } from "react";
import {
  Search,
  List,
  Star,
  Trophy,
  Shield,
  LogIn,
  LogOut,
} from "lucide-react";
import ImageModal from "./components/ImageModal";
import Link from "next/link";
import Image from "next/image";
import { Preview } from "./preview";
import {
  useCharacterSearch,
  useTopCharacters,
  voteForCharacter,
} from "./character-hooks";
import { useAuth } from "../contexts/auth-context";
import { useVotesRemaining } from "./character-hooks";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPending, startTransition] = useTransition();
  const { user, signIn, signOut } = useAuth();

  const {
    characters,
    loading: searchLoading,
    error: searchError,
    updateLocalVote,
  } = useCharacterSearch(searchQuery);

  const {
    topCharacters,
    loading: topLoading,
    error: topError,
    fetchTopCharacters,
  } = useTopCharacters();

  const {
    votesRemaining,
    loading: votesLoading,
    updateLocalVotesRemaining,
  } = useVotesRemaining();

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Utility function to generate image src based on character name
  const generateImageSrc = (character) => {
    return `/characters/${character.name
      .toLowerCase()
      .replace(/ /g, "_")
      .replace(
        /[^a-zA-Z0-9áàäâéèêëíìïîóòöôúùüûçćñÁÀÄÂÉÈÊËÍÌÏÎÓÒÖÔÚÙÜÛÇĆÑ_-]/g,
        ""
      )}.png`;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleVote = useCallback(
    async (characterId) => {
      console.log("Current user in handleVote:", user);
      if (!user) {
        alert("Please sign in to vote!");
        return;
      }

      startTransition(async () => {
        try {
          const result = await voteForCharacter(characterId);
          if (result.success) {
            // Update local state instead of reloading
            updateLocalVote(characterId);
            updateLocalVotesRemaining();
            // Refresh top characters list
            await fetchTopCharacters();
          } else {
            alert(result.error || "Failed to vote. Please try again.");
          }
        } catch (error) {
          console.error("Voting error:", error);
          alert("An unexpected error occurred. Please try again.");
        }
      });
    },
    [user, updateLocalVote, updateLocalVotesRemaining, fetchTopCharacters]
  );

  return (
    <>
      <Preview
        link="https://www.onepiecevoting.com/"
        title="One Piece Voting"
        imageUrl="https://www.onepiecevoting.com/previews/home.png"
      />
      <div className="min-h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Navigation Bar - Made more compact on mobile */}
        <nav className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14 sm:h-16 items-center">
              {/* Logo and Title */}
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-500 h-4 w-4 sm:h-6 sm:w-6" />
                <div className="text-xs sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
                  One Piece Character Voting
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex items-center space-x-1 sm:space-x-4">
                <Link
                  href="/rankings"
                  className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-800/50 text-blue-400 hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <List size={14} className="sm:hidden" />
                  <Trophy size={16} className="hidden sm:block" />
                  <span className="text-[10px] sm:text-base font-medium">
                    Rankings
                  </span>
                </Link>

                <Link
                  href="/privacy"
                  className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-800/50 text-blue-400 hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <List size={14} className="sm:hidden" />
                  <Shield size={16} className="hidden sm:block" />
                  <span className="text-[10px] sm:text-base font-medium">
                    Privacy
                  </span>
                </Link>

                {user ? (
                  <button
                    onClick={signOut}
                    className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-800/50 text-red-400 hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    <LogOut size={14} className="sm:size-18" />
                    <span className="text-[10px] sm:text-base font-medium">
                      Sign Out
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={signIn}
                    className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-800/50 text-blue-400 hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    <LogIn size={14} className="sm:size-18" />
                    <span className="text-[10px] sm:text-base font-medium">
                      Sign In
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Changed to single column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 min-h-[calc(100vh-3.5rem)] py-4 sm:py-8">
            {/* Voting Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 flex flex-col h-full">
              <div className="p-4 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">
                  Vote for Your Favorite Character
                </h2>

                <div className="relative mb-4 sm:mb-6">
                  <input
                    type="text"
                    placeholder="Search characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 sm:p-4 pl-10 sm:pl-12 bg-gray-900/50 border border-gray-700 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 text-sm sm:text-base"
                  />
                  <Search
                    className="absolute left-3 sm:left-4 top-3 sm:top-4 text-gray-400"
                    size={18}
                  />
                </div>
                {!user ? (
                  <div className="text-center text-yellow-400 mb-4">
                    Please sign in to vote for characters!
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 rounded-lg mb-4">
                    <div className="text-gray-300">
                      Votes remaining today:
                      {votesLoading ? (
                        <span className="ml-2 animate-pulse">Loading...</span>
                      ) : (
                        <span
                          className={`ml-2 font-bold ${
                            votesRemaining > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {votesRemaining}
                        </span>
                      )}
                    </div>
                    {votesRemaining === 0 && (
                      <div className="text-red-400 text-sm">
                        Daily limit reached! Come back tomorrow.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search Results */}
              <div className="flex-1 mx-4 sm:mx-8 mb-4 sm:mb-8 border border-gray-700 rounded-xl p-3 sm:p-6 bg-gray-900/30 backdrop-blur-sm">
                <div className="h-[600px] sm:h-[1104px] overflow-y-auto custom-scrollbar">
                  <style>
                    {`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
        
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.5) rgba(31, 41, 55, 0.5);
        }
      `}
                  </style>
                  {searchLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : searchError ? (
                    <div className="text-red-400 text-center">
                      {searchError}
                    </div>
                  ) : characters.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {characters.map((character) => (
                        <div
                          key={character.id}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-900/50 rounded-lg sm:rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300"
                        >
                          <div
                            onClick={() =>
                              openModal(generateImageSrc(character))
                            }
                            className="flex-shrink-0"
                          >
                            <Image
                              src={generateImageSrc(character)}
                              alt={character.name}
                              width={700}
                              height={700}
                              style={{ objectFit: "contain" }}
                              unoptimized
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-700"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base sm:text-lg text-gray-200 break-words">
                              {character.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-400">
                              {character.votes || 0} votes
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              await sleep(100);
                              handleVote(character.id);
                            }}
                            className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-white text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                              user && votesRemaining > 0
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-600/50 cursor-not-allowed"
                            } ${isPending ? "opacity-50 cursor-wait" : ""}`}
                            disabled={
                              !user || votesRemaining === 0 || isPending
                            }
                          >
                            {isPending ? "..." : "Vote"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 sm:space-y-4 p-4">
                      <Search size={36} className="text-gray-600 sm:size-48" />
                      <div className="text-base sm:text-lg font-medium text-center">
                        {searchQuery
                          ? "No characters found"
                          : "Search for a character to vote"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Characters Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 flex flex-col h-full">
              <div className="p-4 sm:p-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Trophy className="text-yellow-500" size={24} />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Top 10 Characters
                  </h2>
                </div>
              </div>

              <div className="flex-1 mx-4 sm:mx-8 mb-4 sm:mb-8 overflow-y-auto space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-2 sm:pr-4">
                {topCharacters.map((character, index) => (
                  <div
                    key={character.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-900/50 rounded-lg sm:rounded-xl border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    <div
                      className={`font-bold text-lg sm:text-xl w-6 sm:w-8 ${
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
                    <div className="relative">
                      <div
                        onClick={() => openModal(generateImageSrc(character))}
                      >
                        <Image
                          src={generateImageSrc(character)}
                          alt={character.name}
                          style={{ objectFit: "contain" }}
                          width={700}
                          height={700}
                          unoptimized
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-700"
                        />
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                          <Trophy
                            className={`h-4 w-4 sm:h-6 sm:w-6 ${
                              index === 0
                                ? "text-yellow-500"
                                : index === 1
                                ? "text-gray-400"
                                : "text-amber-600"
                            } fill-current`}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base sm:text-lg text-gray-200 break-words">
                        {character.name}
                      </div>
                      <div className="text-xs sm:text-sm text-blue-400 font-medium">
                        {(character.votes || 0).toLocaleString()} votes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        {selectedImage && (
          <ImageModal
            src={selectedImage}
            alt="Character Image"
            onClose={closeModal}
          />
        )}
      </div>
    </>
  );
}
