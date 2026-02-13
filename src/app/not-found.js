// app/not-found.js
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "404 - Page Not Found | One Piece Character Voting",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 1. Background Map Layer */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 -z-10 p-4 sm:p-10">
          {" "}
          {/* Adds breathing room around the map */}
          <Image
            src="/bg/404-map.png"
            alt="Ancient pirate map"
            fill
            priority
            unoptimized
            className="object-fill"
          />
        </div>
        {/* Subtle overlay to make the UI pop against the parchment */}
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* 2. Content Layer */}
      <div className="max-w-md text-center bg-white/1 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl">
        <div className="mb-6">
          <img
            src="/favicon-blue.svg"
            alt="Logo"
            className="w-16 h-16 mx-auto opacity-80"
          />
        </div>

        <h1 className="text-7xl font-black text-[#2C241E] mb-2 drop-shadow-sm">
          404
        </h1>

        <h2 className="text-2xl font-bold text-[#2C241E] mb-4 uppercase tracking-tight">
          Lost at Sea!
        </h2>

        <p className="text-[#4A3D33] mb-8 text-lg font-medium">
          You've sailed into uncharted waters. This island isn't on the Grand
          Line or the 4 blues.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#2C241E] hover:bg-[#4A3D33] text-white rounded-xl transition-all font-bold transform hover:scale-105 shadow-lg"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to the Voting
        </Link>
      </div>
    </main>
  );
}
