// src/contexts/auth-context.js
// src/contexts/auth-context.js
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation"; // Add usePathname
import { supabase } from "@/lib/supabase";
import GoogleSignInDialog from "@/app/components/GoogleSignInDialog";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Track current path
  const isRefreshing = useRef(false);

  useEffect(() => {
    // src/contexts/auth-context.js

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;

      setUser((prevUser) => {
        const identityChanged = newUser?.id !== prevUser?.id;

        if (
          identityChanged &&
          (event === "SIGNED_IN" || event === "SIGNED_OUT")
        ) {
          // USE the pathname from the hook, not window.location
          const validRoutes = ["/", "/rankings", "/privacy"];

          if (validRoutes.includes(pathname)) {
            router.refresh();
          }
          // STOP: Don't do anything else. No redirects, no refreshes.
        }
        return newUser;
      });
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]); // Re-bind when pathname changes

  const [showSignIn, setShowSignIn] = useState(false);

  // Google Identity Services runs on our own origin, so Google's account
  // chooser names onepiecevoting.com instead of the supabase.co project
  const signIn = () => setShowSignIn(true);
  const closeSignIn = useCallback(() => setShowSignIn(false), []);

  const handleGoogleCredential = useCallback(async (token, nonce) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token,
      nonce,
    });
    if (error) {
      console.error("Sign-in error:", error);
      throw error;
    }
    setShowSignIn(false);
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.google?.accounts?.id?.disableAutoSelect();
      // router.refresh() is handled automatically by the listener above
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
      {showSignIn && !user && (
        <GoogleSignInDialog
          onCredential={handleGoogleCredential}
          onClose={closeSignIn}
        />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
