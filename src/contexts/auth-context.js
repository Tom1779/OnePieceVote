// src/contexts/auth-context.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Import the shared client

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // src/contexts/auth-context.js

useEffect(() => {
  let mounted = true;

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (mounted) {
      setUser(session?.user ?? null);
      setLoading(false);
    }
  };

  checkSession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    const newUser = session?.user ?? null;
    
    // Check if the user ID has actually changed before doing anything
    setUser((prevUser) => {
      const isNewUser = newUser?.id !== prevUser?.id;

      if (isNewUser && (event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
        // Only refresh if the identity actually flipped
        // Use a small timeout to let state settle
        setTimeout(() => router.refresh(), 0);
      }
      
      return newUser;
    });
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, [router]);

  const signIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account", 
          },
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

      // Note: router.refresh() is handled by the onAuthStateChange listener above
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