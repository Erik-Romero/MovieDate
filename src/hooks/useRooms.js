import { useState, useEffect, useCallback } from 'react';
import { neon } from '../lib/neon';

/**
 * The rooms menu: list the rooms you're in, create one, join by code.
 * Everything goes through SECURITY DEFINER functions — there's no INSERT
 * policy on rooms or room_members, so this is the only way in.
 */
export function useRooms(displayName) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: e } = await neon.rpc('my_rooms');
    if (e) setError(e.message ?? 'Could not load your rooms.');
    else setRooms(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createRoom = useCallback(
    async (name) => {
      setBusy(true);
      setError('');
      const { data, error: e } = await neon.rpc('create_room', {
        room_name: name,
        who: displayName,
      });
      setBusy(false);
      if (e) {
        setError(e.message ?? 'Could not create the room.');
        return null;
      }
      // RETURNS TABLE comes back as an array of one row
      const room = Array.isArray(data) ? data[0] : data;
      await refresh();
      return room;
    },
    [displayName, refresh]
  );

  const joinRoom = useCallback(
    async (code) => {
      setBusy(true);
      setError('');
      const { data, error: e } = await neon.rpc('join_room', {
        room_code: code,
        who: displayName,
      });
      setBusy(false);
      if (e) {
        setError(e.message ?? 'Could not join that room.');
        return null;
      }
      await refresh();
      return data; // room id
    },
    [displayName, refresh]
  );

  return { rooms, loading, error, busy, createRoom, joinRoom, refresh, setError };
}
