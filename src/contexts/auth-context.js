// src/contexts/auth-context.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        router.refresh(); // Refresh the page to update data
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          prompt: "select_account",
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear session data on client
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("supabase.auth.session");
      sessionStorage.removeItem("supabase.auth.token");
      sessionStorage.removeItem("supabase.auth.session");

      // Clear user state in AuthContext
      setUser(null);
      setLoading(true);

      // Manually clear cookies (if needed)
      document.cookie = "supabase.auth.token=; Max-Age=0; path=/"; // Clear token cookie
      document.cookie = "supabase.auth.session=; Max-Age=0; path=/"; // Clear session cookie

      // Optionally, redirect or refresh the page
      router.push("/"); // Redirect to login page or home
    } catch (error) {
      console.error("Error signing out:", error);
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

export { supabase };
