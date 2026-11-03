"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { Search, Trophy, LogIn } from "lucide-react";
import ImageModal from "../components/ImageModal";
import PageShell from "../components/PageShell";
import WantedPoster, { Bounty } from "../components/WantedPoster";
import CharacterImage from "../components/CharacterImage";
import {
  useCharacterSearch,
  useTopCharacters,
  voteForCharacter,
  useVotesRemaining
} from "../character-hooks";
import { useAuth } from "../../contexts/auth-context";
import { generateImageSrc } from "@/lib/character-image";

const DAILY_VOTES = 5;
const RANK_COLORS = ["text-brass", "text-paper-dark", "text-[#c27a3e]"];

function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onDone, 2800);
    return () => clearTimeout(id);
  }, [toast, onDone]);

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      className={`paper fixed bottom-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-toast-in px-4 py-3 text-center font-bold sm:bottom-8 ${
        toast.tone === "error" ? "text-blood" : "text-ink"
      }`}
    >
      {toast.message}
    </div>
  );
}

function VotePips({ remaining, loading }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold uppercase tracking-wider text-paper-dark">
        Votes left today
      </span>
      <div className="flex gap-1.5" aria-label={`${remaining} of ${DAILY_VOTES} votes left`}>
        {Array.from({ length: DAILY_VOTES }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border border-brass ${
              loading ? "animate-pulse" : i < remaining ? "bg-brass" : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function MostWanted({ characters, onImageClick }) {
  return (
    <section className="lg:sticky lg:top-24">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="text-brass" size={22} />
        <h2 className="font-display text-2xl text-paper">Most Wanted</h2>
      </div>
      <ol className="custom-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 lg:mx-0 lg:flex-col lg:gap-2 lg:overflow-visible lg:px-0 lg:pb-0">
        {characters.map((character, index) => (
          <li
            key={character.id}
            className="paper relative flex w-32 shrink-0 snap-start flex-col items-center gap-2 p-2 lg:w-auto lg:flex-row lg:gap-3"
          >
            <span
              className={`absolute left-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ink font-display text-sm shadow lg:static lg:shrink-0 lg:text-base ${
                RANK_COLORS[index] ?? "text-paper-dark"
              }`}
            >
              {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onImageClick(character)}
              className="block w-full border-2 border-ink/80 lg:w-12 lg:shrink-0"
              aria-label={`View ${character.name} full size`}
            >
              <CharacterImage character={character} sizes={120} className="aspect-[3/4] w-full" />
            </button>
            <div className="min-w-0 text-center lg:flex-1 lg:text-left">
              <div className="truncate text-sm font-extrabold uppercase leading-tight lg:text-base">
                {character.name}
              </div>
              <Bounty votes={character.votes} className="text-sm lg:justify-start lg:text-base" />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastVotedId, setLastVotedId] = useState(null);
  const [isPending, startTransition] = useTransition();
  const { user, signIn } = useAuth();

  const {
    characters,
    loading: searchLoading,
    error: searchError,
    updateLocalVote,
  } = useCharacterSearch(searchQuery);

  const {
    topCharacters,
    fetchTopCharacters,
    updateLocalVote: updateLocalVoteTop,
  } = useTopCharacters();

  const {
    votesRemaining,
    loading: votesLoading,
    updateLocalVotesRemaining,
    setVotesRemaining,
  } = useVotesRemaining();

  const openModal = (character) => {
    setSelectedImage(generateImageSrc(character));
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const showToast = useCallback((message, tone = "info") => {
    setToast({ id: Date.now(), message, tone });
  }, []);
  const clearToast = useCallback(() => setToast(null), []);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleVote = useCallback(
    async (character) => {
      const characterId = character.id;
      if (!user) {
        showToast("Sign in to vote!", "error");
        return;
      }

      if (votesRemaining <= 0) {
        showToast("You've used all your votes for today!", "error");
        return;
      }

      // Optimistic updates for BOTH lists
      updateLocalVote(characterId, 1); // Updates search results
      updateLocalVoteTop(characterId, 1); // Updates top characters
      updateLocalVotesRemaining(-1); // Decrease votes remaining
      setLastVotedId(characterId);

      startTransition(async () => {
        try {
          const result = await voteForCharacter(characterId);
          if (!result.success) {
            // Revert optimistic updates on BOTH lists
            updateLocalVote(characterId, -1); // Subtract the vote back
            updateLocalVoteTop(characterId, -1); // Subtract from top list too
            setVotesRemaining((prev) => prev + 1); // Add vote back
            showToast(result.error || "Failed to vote. Please try again.", "error");
          } else {
            showToast(`Bounty raised on ${character.name}!`);
            // Always refresh top characters after successful vote to ensure accuracy
            await fetchTopCharacters();
          }
        } catch (error) {
          console.error("Voting error:", error);
          // Revert optimistic updates on both lists
          updateLocalVote(characterId, -1);
          updateLocalVoteTop(characterId, -1);
          setVotesRemaining((prev) => prev + 1);
          showToast("An unexpected error occurred. Please try again.", "error");
        }
      });
    },
    [
      user,
      updateLocalVote,
      updateLocalVoteTop,
      updateLocalVotesRemaining,
      fetchTopCharacters,
      votesRemaining,
      setVotesRemaining,
      showToast,
    ],
  );

  const canVote = user && votesRemaining > 0;

  return (
    <PageShell>
      <header className="mb-6 sm:mb-10">
        <h1 className="font-display text-3xl leading-tight text-paper sm:text-5xl">
          Who&apos;s the most wanted?
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-paper-dark/80">
          Every vote raises a character&apos;s bounty. Find your favorite and
          put a price on their head.
        </p>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-md">
            <span className="sr-only">Search characters</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for a character..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="paper w-full rounded-sm py-3 pl-11 pr-4 text-lg placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brass"
            />
          </label>

          {user ? (
            <div className="flex flex-col gap-1">
              <VotePips remaining={votesRemaining} loading={votesLoading} />
              {!votesLoading && votesRemaining === 0 && (
                <span className="text-sm text-paper-dark/70">
                  Daily limit reached. Come back tomorrow!
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={signIn}
              className="inline-flex items-center gap-2 self-start text-left font-bold text-brass hover:underline sm:self-auto"
            >
              <LogIn size={18} />
              Sign in to cast your {DAILY_VOTES} daily votes
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10">
        <aside className="lg:order-2">
          <MostWanted characters={topCharacters} onImageClick={openModal} />
        </aside>

        <section className="lg:order-1" aria-live="polite">
          {searchLoading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brass border-t-transparent" />
            </div>
          ) : searchError ? (
            <div className="paper p-6 text-center text-blood">{searchError}</div>
          ) : characters.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-8 xl:grid-cols-4">
              {characters.map((character, index) => (
                <WantedPoster
                  key={character.id}
                  character={character}
                  index={index}
                  onImageClick={() => openModal(character)}
                  onVote={async () => {
                    await sleep(100);
                    handleVote(character);
                  }}
                  voteDisabled={!canVote || isPending}
                  voteLabel={isPending && lastVotedId === character.id ? "..." : "Vote"}
                  justVoted={lastVotedId === character.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-24 text-paper-dark/70">
              <Search size={40} />
              <div className="text-lg font-bold">
                {searchQuery
                  ? "No one by that name on the board"
                  : "Search for a character to vote"}
              </div>
            </div>
          )}
        </section>
      </div>

      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt="Character Image"
          onClose={closeModal}
        />
      )}
      <Toast toast={toast} onDone={clearToast} />
    </PageShell>
  );
}
