"use client";

import { useState, useCallback, useTransition } from "react";
import { Search, List, Trophy, Shield, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ImageModal from "./ImageModal";
import WikiLink from "./WikiLink";
import {
  useCharacterSearch,
  useTopCharacters,
  voteForCharacter,
  useVotesRemaining
} from "../character-hooks";
import { useAuth } from "../../contexts/auth-context";

export default function HomeContent() {
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
    updateLocalVote: updateLocalVoteTop,
    fetchTopCharacters,
  } = useTopCharacters();

  const {
    votesRemaining,
    loading: votesLoading,
    updateLocalVotesRemaining,
    setVotesRemaining,
  } = useVotesRemaining();

  const generateImageSrc = (character) => {
    return `/characters/${character.name
      .toLowerCase()
      .replace(/ /g, "_")
      .replace(/[^\p{L}\p{N}_-]/gu, "")}.png`;
  };

  const handleVote = useCallback(
    async (characterId) => {
      if (!user) {
        alert("Please sign in to vote!");
        return;
      }
      if (votesRemaining <= 0) {
        alert("You've used all your votes for today!");
        return;
      }

      updateLocalVote(characterId, 1);
      updateLocalVoteTop(characterId, 1);
      updateLocalVotesRemaining(-1);

      startTransition(async () => {
        try {
          const result = await voteForCharacter(characterId);
          if (!result.success) {
            updateLocalVote(characterId, -1);
            updateLocalVoteTop(characterId, -1);
            setVotesRemaining((prev) => prev + 1);
            alert(result.error || "Failed to vote.");
          } else {
            await fetchTopCharacters();
          }
        } catch (error) {
          updateLocalVote(characterId, -1);
          updateLocalVoteTop(characterId, -1);
          setVotesRemaining((prev) => prev + 1);
          alert("An unexpected error occurred.");
        }
      });
    },
    [user, votesRemaining, updateLocalVote, updateLocalVoteTop, updateLocalVotesRemaining, fetchTopCharacters, setVotesRemaining]
  );

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <nav className="bg-gray-900/80 sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <div className="flex items-center space-x-2">
              <img src="/favicon-blue.svg" alt="Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
              <div className="text-xs sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
                One Piece Character Voting
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              <Link href="/rankings" className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-800/50 text-blue-400 hover:bg-gray-700 transition-all">
                <Trophy size={16} />
                <span className="text-[10px] sm:text-base font-medium">Rankings</span>
              </Link>
              {user ? (
                <button onClick={signOut} className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-800/50 text-red-400 hover:bg-red-700 transition-all">
                  <LogOut size={14} />
                  <span className="text-[10px] sm:text-base font-medium">Sign Out</span>
                </button>
              ) : (
                <button onClick={signIn} className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-800/50 text-blue-400 hover:bg-blue-700 transition-all">
                  <LogIn size={14} />
                  <span className="text-[10px] sm:text-base font-medium">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Voting Column */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-8">
             <h2 className="text-2xl font-bold mb-6 text-white text-center sm:text-left">Vote for Your Favorite</h2>
             <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
             </div>
             {/* Character list rendering as per your original logic */}
             <div className="h-[600px] overflow-y-auto custom-scrollbar space-y-4">
                {characters.map((char) => (
                   <div key={char.id} className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                      <Image src={generateImageSrc(char)} alt={char.name} width={64} height={64} unoptimized className="rounded-full" />
                      <div className="flex-1 min-w-0">
                         <div className="font-semibold text-gray-200">{char.name}</div>
                         <div className="text-sm text-gray-400">{char.votes || 0} votes</div>
                      </div>
                      <button 
                        onClick={() => handleVote(char.id)}
                        className="bg-blue-600 px-4 py-2 rounded-lg text-white"
                        disabled={!user || votesRemaining === 0 || isPending}
                      >
                         Vote
                      </button>
                   </div>
                ))}
             </div>
          </div>
          
          {/* Top Characters Column */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-8">
             <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Top 10
             </h2>
             <div className="space-y-4">
                {topCharacters.map((char, index) => (
                   <div key={char.id} className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                      <span className="font-bold text-xl text-gray-500">#{index + 1}</span>
                      <Image src={generateImageSrc(char)} alt={char.name} width={48} height={48} unoptimized className="rounded-full" />
                      <div className="flex-1">
                         <div className="text-white font-medium">{char.name}</div>
                         <div className="text-blue-400 text-sm">{char.votes} votes</div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </main>

      {selectedImage && <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />}
    </div>
  );
}