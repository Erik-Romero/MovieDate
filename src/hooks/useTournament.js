import { useState, useEffect, useCallback, useRef } from 'react';
import { neon } from '../lib/neon';

const POLL_MS = 2000;

/**
 * Live tournament state, polled.
 *
 * tournament_state() attempts round resolution server-side on every call, so
 * polling is also what unblocks a round — if someone leaves after a partial
 * round, the next tick from anyone gets things moving again.
 */
export function useTournament(roomId) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(null);

  // Offset between the server clock and this device's. Phones drift, and a
  // countdown built on the local clock can disagree with the server's own
  // deadline check by seconds.
  const skew = useRef(0);

  const tick = useCallback(async () => {
    if (!roomId) return;
    const { data, error: e } = await neon.rpc('tournament_state', {
      rid: Number(roomId),
    });
    if (e) {
      setError(e.message ?? 'Lost the tournament.');
    } else {
      setState(data);
      if (data?.server_now) {
        skew.current = new Date(data.server_now).getTime() - Date.now();
      }
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    tick();
    const t = setInterval(tick, POLL_MS);
    return () => clearInterval(t);
  }, [roomId, tick]);

  const castVote = useCallback(
    async (matchupId, movieId) => {
      setError('');
      const { error: e } = await neon.rpc('cast_vote', {
        mid: Number(matchupId),
        choice: Number(movieId),
      });
      if (e) {
        setError(e.message ?? 'Vote did not register.');
        return false;
      }
      await tick();
      return true;
    },
    [tick]
  );

  // Poll is every 2s; tick the display every second so it doesn't stutter.
  useEffect(() => {
    const dl = state?.deadline;
    if (!dl) {
      setRemaining(null);
      return;
    }
    const end = new Date(dl).getTime();
    const compute = () =>
      setRemaining(Math.max(0, Math.round((end - (Date.now() + skew.current)) / 1000)));
    compute();
    const t = setInterval(compute, 1000);
    return () => clearInterval(t);
  }, [state?.deadline]);

  const matchups = state?.matchups ?? [];
  const yourRemaining = matchups.filter(
    (m) => m.winner_id === null && m.your_vote == null
  );

  return {
    state,
    matchups,
    loading,
    error,
    castVote,
    round: state?.round ?? null,
    roundSize: state?.round_size ?? 0,
    members: state?.members ?? 0,
    champion: state?.champion ?? null,
    isDone: state?.status === 'done',
    isHost: !!state?.is_host,
    yourRemaining,
    youAreDone: yourRemaining.length === 0 && matchups.length > 0,
    remaining,
    hasTimer: !!state?.deadline,
    bracketSize: state?.bracket_size ?? null,
  };
}
