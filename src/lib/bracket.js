// Single-elimination bracket. Pure functions, no React — this is the part
// most likely to be subtly wrong, so it's kept separate and testable.
//
// 16 movies -> 8 matchups -> 4 -> 2 -> 1. Fifteen head-to-head picks, one
// champion. Works at 4 and 8 too, for when you haven't liked 16 films yet.

export const MAX_SIZE = 16;
export const MIN_SIZE = 4;

/**
 * Standard tournament seeding order.
 *
 * Returns seed numbers arranged so that pairing them off gives you the
 * classic bracket: 1 plays 16, 2 plays 15, and the top seeds can't meet
 * until the final. Built by repeatedly reflecting the previous round.
 *
 *   4  -> [1,4,2,3]
 *   8  -> [1,8,4,5,2,7,3,6]
 *   16 -> [1,16,8,9,4,13,5,12,2,15,7,10,3,14,6,11]
 */
export function seedOrder(size) {
  let seeds = [1, 2];
  while (seeds.length < size) {
    const total = seeds.length * 2 + 1;
    const next = [];
    for (const s of seeds) {
      next.push(s, total - s);
    }
    seeds = next;
  }
  return seeds;
}

/** Largest power of two <= n, capped at MAX_SIZE. */
export function bracketSize(n) {
  if (n < MIN_SIZE) return 0;
  let size = MIN_SIZE;
  while (size * 2 <= Math.min(n, MAX_SIZE)) size *= 2;
  return size;
}

/** 8 matchups -> 'Round of 16', 1 -> 'Final', etc. */
export function roundName(matchupCount) {
  switch (matchupCount) {
    case 1:
      return 'Final';
    case 2:
      return 'Semifinals';
    case 4:
      return 'Quarterfinals';
    default:
      return `Round of ${matchupCount * 2}`;
  }
}

/**
 * Build the opening round.
 *
 * `movies` should already be in seed order — best first. Anything past the
 * bracket size is dropped.
 */
export function buildBracket(movies) {
  const size = bracketSize(movies.length);
  if (size === 0) return null;

  const seeded = movies.slice(0, size);
  const order = seedOrder(size);

  const matchups = [];
  for (let i = 0; i < order.length; i += 2) {
    matchups.push({
      a: seeded[order[i] - 1],
      b: seeded[order[i + 1] - 1],
      winnerId: null,
    });
  }

  return { size, rounds: [matchups] };
}

/** The round currently being played (the last one in the list). */
export function currentRound(bracket) {
  return bracket.rounds[bracket.rounds.length - 1];
}

/** Index of the next undecided matchup in the current round, or -1. */
export function currentMatchupIndex(bracket) {
  return currentRound(bracket).findIndex((m) => m.winnerId === null);
}

/** The matchup on screen right now, or null if the tournament is over. */
export function currentMatchup(bracket) {
  const i = currentMatchupIndex(bracket);
  return i === -1 ? null : currentRound(bracket)[i];
}

/** The winning movie once every round has resolved, else null. */
export function champion(bracket) {
  const last = currentRound(bracket);
  if (last.length !== 1) return null;
  const final = last[0];
  if (final.winnerId === null) return null;
  return final.winnerId === final.a.id ? final.a : final.b;
}

/**
 * Record a pick and, if that completed the round, build the next one.
 *
 * Returns a NEW bracket — never mutates, so React state updates cleanly.
 */
export function recordPick(bracket, winnerId) {
  const roundIndex = bracket.rounds.length - 1;
  const round = bracket.rounds[roundIndex];
  const matchIndex = round.findIndex((m) => m.winnerId === null);
  if (matchIndex === -1) return bracket; // already finished

  const match = round[matchIndex];
  if (winnerId !== match.a.id && winnerId !== match.b.id) return bracket;

  const nextRound = round.map((m, i) =>
    i === matchIndex ? { ...m, winnerId } : m
  );

  const rounds = [...bracket.rounds];
  rounds[roundIndex] = nextRound;

  // Round complete and more than one movie left? Pair up the winners.
  const done = nextRound.every((m) => m.winnerId !== null);
  if (done && nextRound.length > 1) {
    const winners = nextRound.map((m) =>
      m.winnerId === m.a.id ? m.a : m.b
    );
    const following = [];
    for (let i = 0; i < winners.length; i += 2) {
      following.push({ a: winners[i], b: winners[i + 1], winnerId: null });
    }
    rounds.push(following);
  }

  return { ...bracket, rounds };
}

/** How many picks made and how many total, for a progress readout. */
export function progress(bracket) {
  const total = bracket.size - 1; // single elimination: n-1 matchups
  const made = bracket.rounds
    .flat()
    .filter((m) => m.winnerId !== null).length;
  return { made, total };
}

/** Every movie knocked out, most recent first. */
export function eliminated(bracket) {
  const out = [];
  for (const round of bracket.rounds) {
    for (const m of round) {
      if (m.winnerId === null) continue;
      out.push(m.winnerId === m.a.id ? m.b : m.a);
    }
  }
  return out.reverse();
}
