// src/app/character-hooks.js
import { useState, useEffect } from "react";
import { supabase } from "../contexts/auth-context";
import { useAuth } from "../contexts/auth-context";

export function useCharacterSearch(searchQuery) {
  const { user } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setCharacters([]);
      return;
    }

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
  }, [searchQuery, user]);

  return { characters, loading, error };
}

export function useTopCharacters() {
  const { user } = useAuth();
  const [topCharacters, setTopCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setTopCharacters([]);
      return;
    }

    const fetchTopCharacters = async () => {
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
    };

    fetchTopCharacters();
  }, [user]);

  return { topCharacters, loading, error };
}

export async function voteForCharacter(characterId) {
  const { user } = supabase.auth.getSession();
  if (!user) {
    return { success: false, error: "Must be logged in to vote" };
  }

  try {
    const { data, error: voteError } = await supabase.rpc("increment_votes", {
      character_id: characterId,
    });

    if (voteError) throw voteError;
    return { success: true };
  } catch (err) {
    console.error("Error voting for character:", err);
    return { success: false, error: err.message };
  }
}
