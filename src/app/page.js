"use client";

import { useState, useCallback, useTransition } from "react";
import { Search, Trophy, List, Star, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  useCharacterSearch,
  useTopCharacters,
  voteForCharacter,
} from "./character-hooks";
import { useAuth } from "../contexts/auth-context";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const { user, signIn, signOut } = useAuth();
  const {
    characters,
    loading: searchLoading,
    error: searchError,
  } = useCharacterSearch(searchQuery);
  const {
    topCharacters,
    loading: topLoading,
    error: topError,
  } = useTopCharacters();

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleVote = useCallback(
    (characterId) => {
      console.log("Current user in handleVote:", user);
      if (!user) {
        alert("Please sign in to vote!");
        return;
      }

      startTransition(async () => {
        try {
          const result = await voteForCharacter(characterId);
          if (result.success) {
            window.location.reload();
          } else {
            alert(result.error || "Failed to vote. Please try again.");
          }
        } catch (error) {
          console.error("Voting error:", error);
          alert("An unexpected error occurred. Please try again.");
        }
      });
    },
    [user]
  );

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-500 h-6 w-6" />
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                One Piece Character Voting
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/rankings"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 text-blue-400 hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <List size={18} />
                <span className="font-medium">Overall Rankings</span>
              </Link>
              {user ? (
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-800/50 text-red-400 hover:bg-red-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={signIn}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/50 text-blue-400 hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <LogIn size={18} />
                  <span className="font-medium">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 min-h-[calc(100vh-4rem)] py-8">
          {/* Voting Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 flex flex-col h-full">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-white">
                Vote for Your Favorite Character
              </h2>

              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-4 pl-12 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
                />
                <Search
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />
              </div>
              {!user && (
                <div className="text-center text-yellow-400 mb-4">
                  Please sign in to vote for characters!
                </div>
              )}
            </div>

            {/* Search Results */}
            <div className="flex-1 mx-8 mb-8 border border-gray-700 rounded-xl p-6 overflow-y-auto bg-gray-900/30 backdrop-blur-sm scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {searchLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : searchError ? (
                <div className="text-red-400 text-center">{searchError}</div>
              ) : characters.length > 0 ? (
                <div className="space-y-4">
                  {characters.map((character) => (
                    <div
                      key={character.id}
                      className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300"
                    >
                      <Image
                        src={character.image_url}
                        alt={character.name}
                        width={500}
                        height={500}
                        style={{ objectFit: "contain" }}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-700"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-gray-200">
                          {character.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {character.votes || 0} votes
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await sleep(100);
                          handleVote(character.id);
                        }}
                        className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                          user
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-600/50 cursor-not-allowed"
                        } ${isPending ? "opacity-50 cursor-wait" : ""}`}
                        disabled={!user || isPending}
                      >
                        {isPending ? "Voting..." : "Vote"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                  <Search size={48} className="text-gray-600" />
                  <div className="text-lg font-medium">
                    {searchQuery
                      ? "No characters found"
                      : "Search for a character to vote"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Characters Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 flex flex-col h-full">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="text-yellow-500" size={32} />
                <h2 className="text-3xl font-bold text-white">
                  Top 10 Characters
                </h2>
              </div>
            </div>

            <div className="flex-1 mx-8 mb-8 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-4">
              {topLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : topError ? (
                <div className="text-red-400 text-center">{topError}</div>
              ) : (
                topCharacters.map((character, index) => (
                  <div
                    key={character.id}
                    className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    <div
                      className={`font-bold text-xl w-8 ${
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
                      <Image
                        src={character.image_url}
                        alt={character.name}
                        style={{ objectFit: "cover" }}
                        width={500}
                        height={500}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-700"
                      />
                      {index < 3 && (
                        <div className="absolute -top-2 -right-2">
                          <Star
                            className={`h-6 w-6 ${
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
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-200">
                        {character.name}
                      </div>
                      <div className="text-sm text-blue-400 font-medium">
                        {(character.votes || 0).toLocaleString()} votes
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
