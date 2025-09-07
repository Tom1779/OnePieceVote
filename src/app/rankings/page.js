"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { supabase } from "../../contexts/auth-context";
import ImageModal from "../components/ImageModal";
import WikiLink from "../components/WikiLink";

const RankingsPage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
        /[^a-zA-Z0-9áàäâéèêëíìïîóòöôúùüûçñÁÀÄÂÉÈÊËÍÌÏÎÓÒÖÔÚÙÜÛÇÑ_-]/g,
        ""
      )}.png`;
  };

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);

        // With 3000 limit, this should get all characters in one request
        const { data, error } = await supabase
          .from("one_piece_characters")
          .select("*")
          .order("votes", { ascending: false })
          .order("name", { ascending: true })
          .limit(3000);

        if (error) throw error;

        // Deduplicate by ID
        const uniqueCharacters = Array.from(
          new Map(data.map((char) => [char.id, char])).values()
        );

        setCharacters(uniqueCharacters);
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
    <>
      <Head>
        <title>One Piece Character Rankings - Top Voted Characters</title>
        <meta
          name="description"
          content="View complete rankings of all One Piece characters based on community votes. See who ranks highest in the ultimate One Piece popularity contest!"
        />
        <link rel="canonical" href="https://www.onepiecevoting.com/rankings" />

        {/* Open Graph tags */}
        <meta
          property="og:title"
          content="One Piece Character Rankings - Top Voted Characters"
        />
        <meta
          property="og:description"
          content="View complete rankings of all One Piece characters based on community votes"
        />
        <meta
          property="og:url"
          content="https://www.onepiecevoting.com/rankings"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="One Piece Voting" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="One Piece Character Rankings - Top Voted Characters"
        />
        <meta
          name="twitter:description"
          content="View complete rankings of all One Piece characters based on community votes"
        />
      </Head>
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
          <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="grid grid-cols-[auto,1fr,auto] gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-700 bg-gray-900/50 font-semibold text-sm sm:text-base">
              <div className="w-12 sm:w-16 text-center text-gray-400">Rank</div>
              <div className="text-gray-400">Character</div>
              <div className="w-16 sm:w-24 text-center text-blue-400">
                Votes
              </div>
            </div>

            <div className="divide-y divide-gray-700">
              {characters.map((character, index) => (
                <div
                  key={character.id}
                  className="grid grid-cols-[auto,1fr,auto] gap-2 sm:gap-4 p-3 sm:p-4 items-center hover:bg-gray-900/50 transition-all duration-300"
                >
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
                    <div
                      onClick={() => openModal(generateImageSrc(character))}
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
                    <div className="font-medium text-sm sm:text-base text-gray-200 break-words min-w-0">
                      {character.name}
                    </div>
                    <WikiLink url={character.wiki_url} />
                  </div>
                  <div className="w-16 sm:w-24 text-center text-blue-400 font-medium text-sm sm:text-base">
                    {character.votes.toLocaleString()}
                  </div>
                </div>
              ))}
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
};

export default RankingsPage;
