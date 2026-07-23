import { useState, useMemo, useCallback, useEffect } from 'react';
import { neon } from '../lib/neon';

/**
 * Swipe state, now backed by Neon instead of a local array.
 *
 * On mount it loads the movie catalog and this user's existing swipes in
 * parallel, so a returning user doesn't re-see films they already judged.
 * Each swipe writes to the `swipes` table; the local state updates first so
 * the card flies off instantly, and rolls back if the write fails.
 *
 * user_id is NOT sent on insert — the column defaults to auth.user_id() in
 * the database, which is both simpler and safer than trusting the client.
 */
export function useSwipeDeck() {
  const [movies, setMovies] = useState([]);
  const [swipes, setSwipes] = useState({}); // { [movieId]: 'like' | 'dislike' }
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [genreId, setGenreId] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  // --- initial load ------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [moviesRes, swipesRes] = await Promise.all([
          neon.from('movies').select('*'),
          // RLS scopes this to the current user automatically, so no .eq() on
          // user_id is needed. group_id IS NULL = the solo taste profile.
          neon.from('swipes').select('movie_id, liked').is('group_id', null),
        ]);

        if (moviesRes.error) throw moviesRes.error;
        if (swipesRes.error) throw swipesRes.error;
        if (cancelled) return;

        setMovies(moviesRes.data ?? []);

        const map = {};
        for (const s of swipesRes.data ?? []) {
          map[s.movie_id] = s.liked ? 'like' : 'dislike';
        }
        setSwipes(map);
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Failed to load.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // --- derived deck ------------------------------------------------------
  const deck = useMemo(() => {
    const from = startYear ? Number(startYear) : null;
    const to = endYear ? Number(endYear) : null;
    const genre = genreId ? Number(genreId) : null;

    return movies
      .filter((m) => !(m.id in swipes))
      .filter((m) => (genre ? (m.genres ?? []).includes(genre) : true))
      .filter((m) => (from ? m.release_year >= from : true))
      .filter((m) => (to ? m.release_year <= to : true))
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  }, [movies, swipes, genreId, startYear, endYear]);

  const current = deck[0] ?? null;
  const upNext = deck[1] ?? null;

  // --- swipe (optimistic write) ------------------------------------------
  const swipe = useCallback(async (movieId, liked) => {
    // update UI immediately
    setSwipes((prev) => ({ ...prev, [movieId]: liked ? 'like' : 'dislike' }));
    setHistory((prev) => [...prev, movieId]);

    // upsert so re-swiping the same film (e.g. after undo) updates rather than
    // erroring on the unique constraint
    const { error: writeError } = await neon
      .from('swipes')
      .upsert(
        { movie_id: movieId, liked, group_id: null },
        { onConflict: 'user_id,movie_id,group_id' }
      );

    if (writeError) {
      // roll back the optimistic update so the card comes back rather than
      // silently vanishing without being saved
      setSwipes((prev) => {
        const next = { ...prev };
        delete next[movieId];
        return next;
      });
      setHistory((prev) => prev.filter((id) => id !== movieId));
      setError('Could not save that swipe. Check your connection.');
    }
  }, []);

  // --- undo --------------------------------------------------------------
  const undo = useCallback(async () => {
    const last = history[history.length - 1];
    if (last == null) return;

    // optimistic
    setHistory((prev) => prev.slice(0, -1));
    setSwipes((prev) => {
      const next = { ...prev };
      delete next[last];
      return next;
    });

    const { error: delError } = await neon
      .from('swipes')
      .delete()
      .eq('movie_id', last)
      .is('group_id', null);

    if (delError) {
      setError('Could not undo. Refresh to see the current state.');
    }
  }, [history]);

  // --- derived views -----------------------------------------------------
  const liked = useMemo(
    () => movies.filter((m) => swipes[m.id] === 'like'),
    [movies, swipes]
  );

  return {
    deck,
    current,
    upNext,
    loading,
    error,
    swipe,
    undo,
    liked,
    swipedCount: history.length,
    canUndo: history.length > 0,
    filters: { genreId, startYear, endYear },
    setGenreId,
    setStartYear,
    setEndYear,
  };
}
