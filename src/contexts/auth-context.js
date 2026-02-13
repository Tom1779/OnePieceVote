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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  const newUser = session?.user ?? null;

  setUser((prevUser) => {
    const identityChanged = newUser?.id !== prevUser?.id;

    if (identityChanged && (event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
      // 1. Get the current path safely
      const path = window.location.pathname;

      // 2. Define your "Safe" valid routes
      const validRoutes = ['/', '/rankings', '/privacy', '/auth/callback'];
      const isSafeRoute = validRoutes.includes(path);

      if (isSafeRoute) {
        // Only refresh if we are on a page that actually exists
        setTimeout(() => router.refresh(), 0);
      } else {
        // If we are on a 404 or unknown path, force a redirect to home 
        // instead of refreshing a broken URL
        window.location.href = '/';
      }
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