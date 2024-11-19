"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/contexts/auth-context";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error handling auth callback:", error);
      }

      // Redirect to home page after successful authentication
      router.push("/");
    };

    handleAuthCallback();
  }, [router]);

  return <div>Authenticating...</div>;
}
