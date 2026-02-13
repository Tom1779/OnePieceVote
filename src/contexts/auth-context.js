// src/contexts/auth-context.js
// src/contexts/auth-context.js
"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation"; // Add usePathname
import { supabase } from "@/lib/supabase";

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

        if (identityChanged) {
          // Only trigger a refresh if we are on a known valid page.
          // This prevents the infinite loop on the 404 page.
          const validRoutes = ["/", "/rankings", "/privacy"];
          const currentPath = window.location.pathname;
          const isSafeRoute = validRoutes.includes(currentPath);

          if (
            isSafeRoute &&
            (event === "SIGNED_IN" || event === "SIGNED_OUT")
          ) {
            // Refresh valid pages to update server-side data (like votes remaining)
            router.refresh();
          }
          // If it's NOT a safe route, we do NOTHING.
          // This allows Next.js to stay on the 404 page without refreshing or redirecting.
        }
        return newUser;
      });
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]); // Re-bind when pathname changes

  const signIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Use hardcoded domain in production to prevent origin mismatches
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Sign-in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // router.refresh() is handled automatically by the listener above
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
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
