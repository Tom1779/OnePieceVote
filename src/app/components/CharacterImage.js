"use client";

import { useState } from "react";
import Image from "next/image";
import { generateImageSrc } from "@/lib/character-image";

// Images at least this wide relative to their height don't crop well into a
// 3:4 portrait frame, so they are shown whole over a blurred fill instead.
const WIDE_RATIO = 0.85;

// Portrait-framed character art. Tall (usually full-body) images are cropped
// from the top to keep faces in frame; wide ones are letterboxed.
export default function CharacterImage({ character, className = "", sizes = 300 }) {
  const [hasError, setHasError] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const src = generateImageSrc(character);

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
    <div className={`relative overflow-hidden bg-paper-dark ${className}`}>
      {isWide && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-md sepia-[.3]"
        />
      )}
      <Image
        src={src}
        alt={character.name}
        width={sizes}
        height={Math.round(sizes * (4 / 3))}
        loading="lazy"
        unoptimized
        onLoad={(e) => {
          const { naturalWidth, naturalHeight } = e.currentTarget;
          setIsWide(naturalWidth / naturalHeight >= WIDE_RATIO);
        }}
        onError={() => setHasError(true)}
        className={`relative h-full w-full sepia-[.15] ${
          isWide ? "object-contain" : "object-cover object-top"
        }`}
      />
    </div>
  );
}
