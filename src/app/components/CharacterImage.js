"use client";

import { useState } from "react";
import Image from "next/image";
import { generateImageSrc } from "@/lib/character-image";

// Portrait-cropped character art; most source images are full-body, so the
// crop is anchored to the top to keep faces in frame.
export default function CharacterImage({ character, className = "", sizes = 300 }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-paper-dark font-display text-3xl text-ink-faint ${className}`}
        aria-label={character.name}
      >
        ?
      </div>
    );
  }

  return (
    <Image
      src={generateImageSrc(character)}
      alt={character.name}
      width={sizes}
      height={Math.round(sizes * (4 / 3))}
      loading="lazy"
      unoptimized
      onError={() => setHasError(true)}
      className={`object-cover object-top bg-paper-dark sepia-[.15] ${className}`}
    />
  );
}
