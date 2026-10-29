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
 *
 * Liked films also carry a personal ranking (an Elo rating plus how many
 * head-to-head picks they've been in) and a watched flag. The rating maths
 * lives in the database (record_comparison); this hook just mirrors what it
 * returns, so every device sees the same order.
 */

const NEW_RANK = { rating: 1500, compared: 0, seen: false };
export function useSwipeDeck() {
  const [movies, setMovies] = useState([]);
  const [swipes, setSwipes] = useState({}); // { [movieId]: 'like' | 'dislike' }
  const [ranks, setRanks] = useState({}); // { [movieId]: { rating, compared, seen } } for likes
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
          neon
            .from('swipes')
            .select('movie_id, liked, rating, compared, seen')
            .is('group_id', null),
        ]);

        if (moviesRes.error) throw moviesRes.error;
        if (swipesRes.error) throw swipesRes.error;
        if (cancelled) return;

        setMovies(moviesRes.data ?? []);

        const map = {};
        const rankMap = {};
        for (const s of swipesRes.data ?? []) {
          map[s.movie_id] = s.liked ? 'like' : 'dislike';
          if (s.liked) {
            rankMap[s.movie_id] = { rating: s.rating, compared: s.compared, seen: s.seen };
          }
        }
        setSwipes(map);
        setRanks(rankMap);
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
      // hidden is set from the admin console; undefined (column not added yet) counts as visible
      .filter((m) => !m.hidden)
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
    if (liked) setRanks((prev) => ({ ...prev, [movieId]: NEW_RANK }));
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
      setRanks((prev) => {
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
    setRanks((prev) => {
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

  // --- ranking -----------------------------------------------------------
  // Fold { movie_id, rating, compared } rows from the database into ranks.
  const applyRanks = useCallback((rows) => {
    if (!Array.isArray(rows)) return;
    setRanks((prev) => {
      const next = { ...prev };
      for (const r of rows) {
        next[r.movie_id] = { ...(next[r.movie_id] ?? NEW_RANK), rating: r.rating, compared: r.compared };
      }
      return next;
    });
  }, []);

  /** You liked winnerId more than loserId. Resolves to an error message or null. */
  const compare = useCallback(
    async (winnerId, loserId) => {
      const { data, error: e } = await neon.rpc('record_comparison', {
        winner: winnerId,
        loser: loserId,
      });
      if (e) return e.message ?? 'Could not save that pick.';
      applyRanks(data);
      return null;
    },
    [applyRanks]
  );

  /** Reverts your latest pick. Resolves to an error message or null. */
  const undoCompare = useCallback(async () => {
    const { data, error: e } = await neon.rpc('undo_comparison');
    if (e) return e.message ?? 'Could not undo that pick.';
    applyRanks(data);
    return null;
  }, [applyRanks]);

  const setWatched = useCallback(
    async (movieId, watched) => {
      const was = ranks[movieId]?.seen ?? false;
      const put = (seen) =>
        setRanks((prev) => ({ ...prev, [movieId]: { ...(prev[movieId] ?? NEW_RANK), seen } }));
      put(watched); // optimistic
      const { error: e } = await neon.rpc('set_watched', { mid: movieId, watched });
      if (e) {
        put(was);
        setError('Could not update watched. Check your connection.');
      }
    },
    [ranks]
  );

  // --- derived views -----------------------------------------------------
  // Your likes, best first: by rating, then popularity so a fresh, unranked
  // list still has a sensible order.
  const liked = useMemo(
    () =>
      movies
        .filter((m) => swipes[m.id] === 'like')
        .sort(
          (a, b) =>
            (ranks[b.id]?.rating ?? 1500) - (ranks[a.id]?.rating ?? 1500) ||
            (b.popularity ?? 0) - (a.popularity ?? 0)
        ),
    [movies, swipes, ranks]
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
    ranks,
    compare,
    undoCompare,
    setWatched,
    swipedCount: history.length,
    canUndo: history.length > 0,
    filters: { genreId, startYear, endYear },
    setGenreId,
    setStartYear,
    setEndYear,
  };
}
