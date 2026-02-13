// src/contexts/auth-context.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Use the shared browser client

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Initial Session Check: Sets state without triggering a router refresh
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 2. Auth State Listener: Uses an "Identity Guard" to prevent 404 loops
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;

      setUser((prevUser) => {
        // Critical: Only trigger router.refresh() if the user's ID has actually changed.
        // This prevents the infinite loop triggered when Supabase "re-discovers" 
        // the same session on a 404 page or after a domain redirect.
        const identityChanged = newUser?.id !== prevUser?.id;

        if (
          identityChanged && 
          !isRefreshing && 
          (event === 'SIGNED_IN' || event === 'SIGNED_OUT')
        ) {
          setIsRefreshing(true); // Temporary lock to prevent duplicate refreshes
          
          // Use a timeout to let the state update settle before the router reloads
          setTimeout(() => {
            router.refresh(); 
            // The full page reload on refresh will reset 'isRefreshing' to false
          }, 0);
        }
        
        return newUser;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, isRefreshing]);

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