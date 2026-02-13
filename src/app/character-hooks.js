// Updated character-hooks.js with better vote handling

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "../contexts/auth-context";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedCharacters = (searchQuery) => {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(`characters_${searchQuery}`);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(`characters_${searchQuery}`);
    return null;
  }

  return data;
};

const setCachedCharacters = (searchQuery, data) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `characters_${searchQuery}`,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );
};

// Clear cache when vote happens to prevent stale data
const clearCacheForCharacter = (characterId) => {
  if (typeof window === "undefined") return;
  // Clear all character caches to prevent inconsistencies
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("characters_")) {
      localStorage.removeItem(key);
    }
  });
};

export function useCharacterSearch(searchQuery) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        if (searchQuery?.trim()) {
          const cached = getCachedCharacters(searchQuery);
          if (cached) {
            setCharacters(cached);
            setLoading(false);
            return;
          }
        }

        let data, queryError;

        if (searchQuery?.trim()) {
          // Use the new search function for ranked results
          const result = await supabase.rpc("search_characters_ranked", {
            search_term: searchQuery.trim(),
            result_limit: 50,
          });

          data = result.data;
          queryError = result.error;
        } else {
          // Default query for when no search term
          const result = await supabase
            .from("one_piece_characters")
            .select("*")
            .order("name")
            .limit(25);

          data = result.data;
          queryError = result.error;
        }

        if (queryError) throw queryError;

        setCharacters(data || []);

        // Cache the results
        if (searchQuery?.trim()) {
          setCachedCharacters(searchQuery, data || []);
        }
      } catch (err) {
        console.error("Error fetching characters:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchCharacters, 1000);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Updated to handle both increment and decrement
  const updateLocalVote = useCallback((characterId, delta = 1) => {
    setCharacters((prev) =>
      prev.map((char) =>
        char.id === characterId
          ? { ...char, votes: Math.max(0, (char.votes || 0) + delta) }
          : char
      )
    );

    // Clear cache when vote changes to prevent stale data
    if (delta !== 0) {
      clearCacheForCharacter(characterId);
    }
  }, []);

  return { characters, loading, error, updateLocalVote, setCharacters };
}

export function useTopCharacters() {
  const [topCharacters, setTopCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("one_piece_characters")
        .select("*")
        .order("votes", { ascending: false })
        .limit(10);

      if (queryError) throw queryError;
      setTopCharacters(data || []);
    } catch (err) {
      console.error("Error fetching top characters:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopCharacters();
  }, [fetchTopCharacters]);

  // Updated to handle both increment and decrement
  const updateLocalVote = useCallback((characterId, delta = 1) => {
    setTopCharacters((prev) =>
      prev.map((char) =>
        char.id === characterId
          ? { ...char, votes: Math.max(0, (char.votes || 0) + delta) }
          : char
      )
    );
  }, []);

  return {
    topCharacters,
    loading,
    error,
    updateLocalVote,
    fetchTopCharacters,
    setTopCharacters,
  };
}

export function useVotesRemaining() {
  const [votesRemaining, setVotesRemaining] = useState(5);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchVotesRemaining = useCallback(async () => {
    if (!user) {
      setVotesRemaining(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_daily_votes")
        .select("vote_count")
        .eq("user_id", user.id)
        .eq("vote_date", new Date().toISOString().split("T")[0])
        .single();

      if (error) throw error;

      setVotesRemaining(5 - (data?.vote_count || 0));
    } catch (err) {
      console.error("Error fetching votes remaining:", err);
      setVotesRemaining(5);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVotesRemaining();
  }, [fetchVotesRemaining]);

  const updateLocalVotesRemaining = useCallback((delta = -1) => {
    setVotesRemaining((prev) => Math.max(0, prev + delta));
  }, []);

  return {
    votesRemaining,
    loading,
    fetchVotesRemaining,
    updateLocalVotesRemaining,
    setVotesRemaining,
  };
}

export async function voteForCharacter(characterId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    return { success: false, error: "Must be logged in to vote" };
  }

  try {
    const { data, error: voteError } = await supabase.rpc("increment_votes", {
      character_id: characterId,
    });

    if (voteError) {
      throw new Error(voteError.message);
    }

    if (!data.success) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (err) {
    console.error("Error voting for character:", err);
    return { success: false, error: err.message };
  }
}
