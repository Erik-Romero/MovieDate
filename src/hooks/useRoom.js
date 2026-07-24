import { useState, useEffect, useCallback, useRef } from 'react';
import { neon } from '../lib/neon';

const POLL_MS = 2000;

/**
 * A single room, polled.
 *
 * Neon has no realtime — no websockets, no subscriptions. The options are
 * LISTEN/NOTIFY (needs a server holding a connection), CDC, or polling.
 * For a lobby, polling wins: a 2s tick is imperceptible when you're waiting
 * on people to tap Ready, and it costs one HTTP call.
 *
 * room_state() returns everything in one jsonb blob so each tick is a single
 * request rather than three.
 */
export function useRoom(roomId) {
  const [room, setRoom] = useState(null);
  const [movies, setMovies] = useState(null); // resolved once the pool freezes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Avoids a stale-closure bug: the interval captures the first render's
  // values otherwise, and would keep re-fetching movies forever.
  const loadedPoolFor = useRef(null);

  const tick = useCallback(async () => {
    if (!roomId) return;
    const { data, error: e } = await neon.rpc('room_state', { rid: Number(roomId) });
    if (e) {
      setError(e.message ?? 'Lost the room.');
      setLoading(false);
      return;
    }
    setRoom(data);
    setLoading(false);

    // Once the host starts, resolve the frozen movie_ids into real rows —
    // but only once per pool, not on every tick.
    const ids = data?.movie_ids;
    if (Array.isArray(ids) && ids.length && loadedPoolFor.current !== ids.join(',')) {
      loadedPoolFor.current = ids.join(',');
      const { data: rows, error: me } = await neon
        .from('movies')
        .select('*')
        .in('id', ids);
      if (!me && rows) {
        // .in() returns rows in arbitrary order; movie_ids carries the seeding
        const order = new Map(ids.map((id, i) => [Number(id), i]));
        setMovies([...rows].sort((a, b) => order.get(a.id) - order.get(b.id)));
      }
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    tick();
    const t = setInterval(tick, POLL_MS);
    return () => clearInterval(t);
  }, [roomId, tick]);

  const call = useCallback(
    async (fn, args) => {
      setError('');
      const { data, error: e } = await neon.rpc(fn, args);
      if (e) {
        setError(e.message ?? 'That did not work.');
        return null;
      }
      await tick(); // reflect the change immediately rather than up to 2s later
      return data;
    },
    [tick]
  );

  const setReady = useCallback(
    (ready) => call('set_ready', { rid: Number(roomId), is_ready: ready }),
    [call, roomId]
  );

  const start = useCallback(
    () => call('start_tournament', { rid: Number(roomId) }),
    [call, roomId]
  );

  const reset = useCallback(
    () => {
      loadedPoolFor.current = null;
      setMovies(null);
      return call('reset_room', { rid: Number(roomId) });
    },
    [call, roomId]
  );

  const leave = useCallback(
    () => call('leave_room', { rid: Number(roomId) }),
    [call, roomId]
  );

  const members = room?.members ?? [];
  const you = members.find((m) => m.is_you) ?? null;

  return {
    room,
    members,
    you,
    movies,
    loading,
    error,
    setError,
    setReady,
    start,
    reset,
    leave,
    allReady: members.length > 0 && members.every((m) => m.ready),
    isHost: !!room?.is_host,
    status: room?.status ?? 'lobby',
  };
}
