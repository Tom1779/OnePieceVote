"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../contexts/auth-context";

const RankingsPage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("one_piece_characters")
          .select("*")
          .order("votes", { ascending: false });

        if (error) throw error;
        setCharacters(data || []);
      } catch (err) {
        console.error("Error fetching rankings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Voting
            </Link>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Character Rankings
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-[auto,1fr,auto] gap-4 p-4 border-b border-gray-700 bg-gray-900/50 font-semibold">
            <div className="w-16 text-center text-gray-400">Rank</div>
            <div className="text-gray-400">Character</div>
            <div className="w-24 text-center text-blue-400">Votes</div>
          </div>

          <div className="divide-y divide-gray-700">
            {characters.map((character, index) => (
              <div
                key={character.id}
                className="grid grid-cols-[auto,1fr,auto] gap-4 p-4 items-center hover:bg-gray-900/50 transition-all duration-300"
              >
                <div
                  className={`w-16 text-center font-bold ${
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
                <div className="flex items-center gap-4">
                  <Image
                    src={character.image_url}
                    alt={character.name}
                    width={500}
                    height={500}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                  />
                  <div className="font-medium text-gray-200">
                    {character.name}
                  </div>
                </div>
                <div className="w-24 text-center text-blue-400 font-medium">
                  {character.votes.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RankingsPage;
