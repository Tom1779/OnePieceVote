// app/not-found.js
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden p-6">
      {/* 1. Background Map Layer */}
      <div className="absolute inset-0 -z-10">
        
        {/* Widescreen Map (16:9): Visible on Medium screens (768px) and up */}
        <div className="hidden md:block absolute inset-0">
          <Image
            src="/bg/404-map.png"
            alt="Desktop Map"
            fill
            priority
            unoptimized
            className="object-fill"
          />
        </div>

        {/* Mobile Map (9:16): Visible on everything below 768px */}
        <div className="block md:hidden absolute inset-0">
          <Image
            src="/bg/404-map-smaller.png" 
            alt="Mobile Map"
            fill
            priority
            unoptimized
            className="object-fill"
          />
        </div>
        
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* 2. Content Layer - Optimized for Mobile Spacing */}
      <div className="w-full max-w-[85%] md:max-w-md text-center bg-white/10 backdrop-blur-lg p-6 md:p-10 rounded-3xl border border-white/30 shadow-2xl">
        <div className="mb-4 md:mb-6">
          <img
            src="/favicon-blue.svg"
            alt="Logo"
            className="w-14 h-14 md:w-16 md:h-16 mx-auto opacity-90"
          />
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-[#2C241E] mb-2">
          404
        </h1>

        <h2 className="text-xl md:text-2xl font-bold text-[#2C241E] mb-4 uppercase tracking-widest">
          Lost at Sea
        </h2>

        <p className="text-[#4A3D33] mb-8 text-sm md:text-lg leading-relaxed font-medium">
          You've sailed into uncharted waters. This island isn't on the Grand
          Line or the 4 blues.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-3 px-6 py-4 bg-[#2C241E] hover:bg-[#4A3D33] text-white rounded-2xl transition-all font-bold shadow-xl active:scale-95"
        >
          Back to the Voting
        </Link>
      </div>
    </main>
  );
}