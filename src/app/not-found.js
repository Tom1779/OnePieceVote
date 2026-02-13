import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "404 - Page Not Found | One Piece Character Voting",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden p-6">
      {/* 1. Background Map Layer */}
      <div className="absolute inset-0 -z-10">
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

      {/* Top-Down Log Pose Compass - Gold Rim with Pewter/Sea-Glass Interior */}
      <div className="absolute top-4 left-4 md:top-10 md:left-10 block opacity-90">
        <svg width="90" height="90" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="md:w-[150px] md:h-[150px]">
          {/* Outer Ring: Weathered Gold */}
          <circle cx="100" cy="100" r="92" fill="#D4AF37" stroke="#2C241E" strokeWidth="2" />
          
          {/* Inner Rim: Antique Pewter */}
          <circle cx="100" cy="100" r="86" fill="#4A5568" stroke="#2C241E" strokeWidth="1" />
          
          {/* Face: Sea-Glass Blue (Transparent) */}
          <circle cx="100" cy="100" r="82" fill="#7FA9C4" fillOpacity="0.35" stroke="#2C241E" strokeWidth="0.5" />

          {/* Compass Rose Grid */}
          <g stroke="#000000" strokeWidth="0.5" opacity="0.3">
            <line x1="100" y1="20" x2="100" y2="180" />
            <line x1="20" y1="100" x2="180" y2="100" />
            <circle cx="100" cy="100" r="45" fill="none" />
          </g>

          {/* Markers: Darker Black for legibility */}
          <g fontFamily="serif" fontWeight="900" fill="#000000" fontSize="24" textAnchor="middle">
            <text x="100" y="36">S</text>
            <text x="100" y="178">N</text>
            <text x="32" y="108">E</text>
            <text x="168" y="108">W</text>
          </g>

          {/* Stuttering Needle */}
          <g className="animate-stutter-spin" style={{ transformOrigin: '100px 100px' }}>
            <path d="M100 48 L106 100 L100 100 L94 100 Z" fill="#FDFCF0" stroke="#000000" strokeWidth="0.5" />
            <path d="M100 100 L106 100 L100 152 L94 100 Z" fill="#800000" stroke="#000000" strokeWidth="0.5" />
          </g>

          {/* Center Pin */}
          <circle cx="100" cy="100" r="6" fill="#000000" />
          
          {/* Glass Highlight */}
          <path d="M60 60 Q 80 40 110 50" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
        </svg>
      </div>

      {/* 2. Content Layer */}
      <div className="w-full max-w-[85%] md:max-w-md text-center bg-white/10 backdrop-blur-lg p-6 md:p-10 rounded-3xl border border-white/30 shadow-2xl animate-float relative z-10">
        <div className="mb-4 md:mb-6">
          <img
            src="/favicon-blue.svg"
            alt="Logo"
            className="w-14 h-14 md:w-16 md:h-16 mx-auto opacity-90 drop-shadow-lg"
          />
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-[#2C241E] mb-2 drop-shadow-md">
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