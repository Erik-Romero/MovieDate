import { useState, useMemo, useCallback } from 'react';
import { MOVIES, MOCK_MEMBERS } from './movies';

/**
 * All the state that used to live in Supabase.
 *
 * swipes  { [movieId]: 'like' | 'dislike' }
 * history [movieId, ...] in swipe order, so undo has something to pop
 *
 * The deck is derived, not stored: filter out anything already swiped, apply
 * the active filters, sort by popularity. That means `deck[0]` is always the
 * current card and there's no index to keep in sync.
 */
export function useSwipeDeck() {
  const [swipes, setSwipes] = useState({});
  const [history, setHistory] = useState([]);
  const [genreId, setGenreId] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  const deck = useMemo(() => {
    const from = startYear ? Number(startYear) : null;
    const to = endYear ? Number(endYear) : null;
    const genre = genreId ? Number(genreId) : null;

    return MOVIES.filter((m) => !(m.id in swipes))
      .filter((m) => (genre ? m.genres.includes(genre) : true))
      .filter((m) => (from ? m.release_year >= from : true))
      .filter((m) => (to ? m.release_year <= to : true))
      .sort((a, b) => b.popularity - a.popularity);
  }, [swipes, genreId, startYear, endYear]);

  const current = deck[0] ?? null;
  const upNext = deck[1] ?? null;

  const swipe = useCallback((movieId, liked) => {
    setSwipes((prev) => ({ ...prev, [movieId]: liked ? 'like' : 'dislike' }));
    setHistory((prev) => [...prev, movieId]);
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setSwipes((s) => {
        const next = { ...s };
        delete next[last];
        return next;
      });
      return prev.slice(0, -1);
    });
  }, []);

  const reset = useCallback(() => {
    setSwipes({});
    setHistory([]);
  }, []);

  const liked = useMemo(
    () => MOVIES.filter((m) => swipes[m.id] === 'like'),
    [swipes]
  );

  /** Movies you liked that a mock group member also liked. */
  const matches = useMemo(() => {
    const likedIds = new Set(liked.map((m) => m.id));
    return MOVIES.filter((m) => likedIds.has(m.id))
      .map((m) => ({
        ...m,
        matchedWith: MOCK_MEMBERS.filter((p) => p.likedIds.includes(m.id)).map(
          (p) => p.name
        ),
      }))
      .filter((m) => m.matchedWith.length > 0)
      .sort((a, b) => b.matchedWith.length - a.matchedWith.length);
  }, [liked]);

  return {
    deck,
    current,
    upNext,
    swipe,
    undo,
    reset,
    liked,
    matches,
    swipedCount: history.length,
    canUndo: history.length > 0,
    filters: { genreId, startYear, endYear },
    setGenreId,
    setStartYear,
    setEndYear,
  };
}
