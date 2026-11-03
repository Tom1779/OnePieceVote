"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const GIS_SRC = "https://accounts.google.com/gsi/client";

let gisPromise;
function loadGoogleIdentityServices() {
  if (typeof window === "undefined") return Promise.reject();
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => {
        gisPromise = undefined;
        reject(new Error("Failed to load Google sign-in"));
      };
      document.head.appendChild(script);
    });
  }
  return gisPromise;
}

// Supabase's ID-token flow: Google gets the SHA-256 of the nonce, Supabase gets the raw nonce
async function createNonce() {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  );
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(nonce),
  );
  const hashedNonce = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { nonce, hashedNonce };
}

export default function GoogleSignInDialog({ onCredential, onClose }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");

        const [google, { nonce, hashedNonce }] = await Promise.all([
          loadGoogleIdentityServices(),
          createNonce(),
        ]);
        if (cancelled || !buttonRef.current) return;

        google.accounts.id.initialize({
          client_id: clientId,
          nonce: hashedNonce,
          ux_mode: "popup",
          use_fedcm_for_prompt: true,
          callback: async ({ credential }) => {
            try {
              await onCredential(credential, nonce);
            } catch (err) {
              setError(err.message || "Sign-in failed");
            }
          },
        });
        google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 260,
        });
      } catch (err) {
        console.error("Google sign-in setup error:", err);
        if (!cancelled) setError("Couldn't load Google sign-in. Please try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-sign-in-title"
    >
      <div
        className="relative w-full max-w-sm rounded-sm border border-paper-edge/50 bg-wood-950 p-6 text-paper shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 text-paper-dark hover:text-paper"
        >
          <X size={20} />
        </button>
        <h2 id="google-sign-in-title" className="font-display text-2xl">
          Sign in
        </h2>
        <p className="mt-2 text-sm text-paper-dark">
          Sign in with Google to cast your daily votes.
        </p>
        <div className="mt-5 flex min-h-[44px] justify-center" ref={buttonRef} />
        {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
