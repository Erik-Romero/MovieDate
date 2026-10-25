// Picking which two liked films to show on the Rank screen. Pure functions,
// no React — the rating maths itself lives in the database (record_comparison).

/**
 * Picks a film should appear in before its spot counts as "settled". At 3 the
 * order was still visibly rough; 5 is about 2.5 taps per liked film.
 */
export const TARGET_PICKS = 5;

/** 0..1: how close the list is to every film having TARGET_PICKS picks. */
export function settledFraction(films) {
  if (films.length === 0) return 0;
  const done = films.reduce((sum, f) => sum + Math.min(f.compared, TARGET_PICKS), 0);
  return done / (films.length * TARGET_PICKS);
}

export const pairKey = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);

function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The next matchup. films: [{ movie, rating, compared }].
 *
 * Starts from the film we know least about (fewest picks), then pairs it with
 * one rated close to it — a close call says the most about the order, while a
 * #1 vs #80 pick says almost nothing. Pairs in `recent` are skipped so the
 * same two don't come straight back after a skip or undo.
 */
export function nextPair(films, recent = new Set()) {
  if (films.length < 2) return null;

  const fewest = Math.min(...films.map((f) => f.compared));
  const candidates = films.filter((f) => f.compared === fewest);
  const anchor = candidates[Math.floor(Math.random() * candidates.length)];

  const others = films.filter((f) => f.movie.id !== anchor.movie.id);
  const fresh = others.filter((f) => !recent.has(pairKey(anchor.movie.id, f.movie.id)));
  // shuffle first so equal ratings (a brand-new list) don't always pick the same rival
  const nearest = shuffle(fresh.length ? fresh : others)
    .sort((a, b) => Math.abs(a.rating - anchor.rating) - Math.abs(b.rating - anchor.rating))
    .slice(0, 4);
  const rival = nearest[Math.floor(Math.random() * nearest.length)];

  return Math.random() < 0.5 ? [anchor.movie, rival.movie] : [rival.movie, anchor.movie];
}
