import { useState, useEffect, useCallback } from "react";
import { supabase } from "../contexts/auth-context";
import { useAuth } from "../contexts/auth-context";

export function useCharacterSearch(searchQuery) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from("one_piece_characters").select("*");

        if (searchQuery?.trim()) {
          query = query.ilike("name", `%${searchQuery}%`);
        }

        const { data, error: queryError } = await query.limit(10).order("name");

        if (queryError) throw queryError;
        setCharacters(data || []);
      } catch (err) {
        console.error("Error fetching characters:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchCharacters, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const updateLocalVote = useCallback((characterId) => {
    setCharacters((prev) =>
      prev.map((char) =>
        char.id === characterId
          ? { ...char, votes: (char.votes || 0) + 1 }
          : char
      )
    );
  }, []);

  return { characters, loading, error, updateLocalVote };
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

  const updateLocalVote = useCallback((characterId) => {
    setTopCharacters((prev) =>
      prev.map((char) =>
        char.id === characterId
          ? { ...char, votes: (char.votes || 0) + 1 }
          : char
      )
    );
  }, []);

  return { topCharacters, loading, error, updateLocalVote, fetchTopCharacters };
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
      setVotesRemaining(5); // Assume no votes if error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVotesRemaining();
  }, [fetchVotesRemaining]);

  const updateLocalVotesRemaining = useCallback(() => {
    setVotesRemaining((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    votesRemaining,
    loading,
    fetchVotesRemaining,
    updateLocalVotesRemaining,
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
