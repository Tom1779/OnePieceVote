"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, Trophy, Shield, LogIn, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/auth-context";

const NAV_LINKS = [
  { href: "/", label: "Vote", icon: Crosshair },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/privacy", label: "Privacy", icon: Shield },
];

function useIsActive() {
  const pathname = usePathname() || "/";
  const current = pathname.replace(/\/$/, "") || "/";
  return (href) => current === href;
}

function JollyRoger({ className = "" }) {
  // favicon.svg is a black silhouette; mask it so it takes the text color
  return (
    <span
      aria-hidden
      className={`inline-block bg-current ${className}`}
      style={{
        WebkitMask: "url(/favicon.svg) center / contain no-repeat",
        mask: "url(/favicon.svg) center / contain no-repeat",
      }}
    />
  );
}

function AuthButton() {
  const { user, signIn, signOut } = useAuth();
  const Icon = user ? LogOut : LogIn;

  return (
    <button
      onClick={user ? signOut : signIn}
      className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition ${
        user
          ? "border-paper-edge/50 text-paper-dark hover:bg-wood-700"
          : "border-brass bg-brass text-wood-950 hover:bg-brass-dark"
      }`}
    >
      <Icon size={16} />
      {user ? "Sign out" : "Sign in"}
    </button>
  );
}

export default function PageShell({ children, wide = true }) {
  const isActive = useIsActive();

  return (
    <div className="board min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-black/40 bg-wood-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-paper">
            <JollyRoger className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className="font-display text-lg leading-none sm:text-2xl">
              One Piece Voting
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden items-center gap-1 sm:flex">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition ${
                    isActive(href)
                      ? "bg-paper text-ink"
                      : "text-paper-dark hover:bg-wood-700"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
            <div className="sm:ml-2">
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      <main
        className={`mx-auto px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8 ${
          wide ? "max-w-7xl" : "max-w-4xl"
        }`}
      >
        {children}
      </main>

      {/* Bottom tab bar on phones */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/40 bg-wood-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        <div className="grid grid-cols-3">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold uppercase tracking-wider ${
                isActive(href) ? "text-brass" : "text-paper-dark/70"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
