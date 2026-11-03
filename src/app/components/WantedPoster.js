"use client";

import CharacterImage from "./CharacterImage";
import WikiLink from "./WikiLink";

// Slight, stable tilt per poster so the board looks hand-pinned
const TILTS = ["-rotate-[0.8deg]", "rotate-[0.6deg]", "-rotate-[0.3deg]", "rotate-[0.9deg]"];

export function Bounty({ votes, className = "" }) {
  return (
    <div className={`flex items-baseline justify-center gap-1 ${className}`}>
      <span className="font-display text-ink-soft">฿</span>
      <span className="font-display tabular-nums">{(votes || 0).toLocaleString()}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
        {votes === 1 ? "vote" : "votes"}
      </span>
    </div>
  );
}

export default function WantedPoster({
  character,
  index = 0,
  onImageClick,
  onVote,
  voteDisabled,
  voteLabel = "Vote",
  justVoted = false,
}) {
  return (
    <article
      className={`paper relative flex flex-col px-3 pb-3 pt-5 transition duration-200 hover:z-10 hover:-translate-y-1 hover:rotate-0 sm:px-4 sm:pb-4 ${
        TILTS[index % TILTS.length]
      }`}
    >
      <span className="tack" />
      <h3 className="text-center font-display text-2xl leading-none tracking-[0.2em] sm:text-3xl">
        WANTED
      </h3>

      <button
        type="button"
        onClick={onImageClick}
        className="mt-2 block border-[3px] border-ink/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blood"
        aria-label={`View ${character.name} full size`}
      >
        <CharacterImage character={character} className="aspect-[3/4] w-full" />
      </button>

      <div className="mt-2 text-center text-[0.6rem] font-bold uppercase tracking-[0.35em] text-ink-soft sm:text-xs">
        Dead or Alive
      </div>
      <h4 className="mt-0.5 line-clamp-2 min-h-[2.5em] text-center text-base font-extrabold uppercase leading-tight tracking-wide sm:text-lg">
        {character.name}
      </h4>

      <div className="mt-1 flex items-center justify-between gap-2 border-t border-ink/20 pt-2">
        <Bounty votes={character.votes} className="text-lg sm:text-xl" />
        <WikiLink url={character.wiki_url} />
      </div>

      {onVote && (
        <button
          type="button"
          onClick={onVote}
          disabled={voteDisabled}
          className={`stamp-btn mt-3 w-full ${justVoted ? "animate-stamp" : ""}`}
        >
          {voteLabel}
        </button>
      )}
    </article>
  );
}
