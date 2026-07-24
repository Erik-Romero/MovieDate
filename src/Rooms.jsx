import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRooms } from './hooks/useRooms';

export default function Rooms({ userInfo }) {
  const navigate = useNavigate();
  const { rooms, loading, error, busy, createRoom, joinRoom, setError } =
    useRooms(userInfo.username);

  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Give the room a name.');
    const room = await createRoom(name.trim());
    if (room) navigate(`/room/${room.id}`);
  };

  const submitJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return setError('Enter the code someone shared with you.');
    const id = await joinRoom(code.trim());
    if (id) navigate(`/room/${id}`);
  };

  return (
    <div className="screen screen-scroll">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1 className="brand">Rooms</h1>
      </header>

      <div className="panel">
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {mode === null && (
          <div className="room-actions">
            <button className="btn btn-primary btn-block" onClick={() => setMode('create')}>
              Create a room
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setMode('join')}>
              Join with a code
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={submitCreate} className="login-form">
            <label className="label" htmlFor="roomname">
              Room name
            </label>
            <input
              id="roomname"
              className="field field-block"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="friday night"
              autoComplete="off"
              disabled={busy}
            />
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => {
                setMode(null);
                setError('');
              }}
            >
              Cancel
            </button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={submitJoin} className="login-form">
            <label className="label" htmlFor="roomcode">
              Room code
            </label>
            <input
              id="roomcode"
              className="field field-block code-input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="A1B2C3"
              maxLength={6}
              autoCapitalize="characters"
              autoComplete="off"
              disabled={busy}
            />
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Joining…' : 'Join'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => {
                setMode(null);
                setError('');
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      <div className="panel">
        <h2 className="section-head">Your rooms</h2>
        {loading ? (
          <p className="empty-body">Loading…</p>
        ) : rooms.length === 0 ? (
          <p className="empty-body">
            None yet. Create one and share the code with friends.
          </p>
        ) : (
          <ul className="room-list">
            {rooms.map((r) => (
              <li key={r.id}>
                <button className="room-item" onClick={() => navigate(`/room/${r.id}`)}>
                  <span className="room-item-main">
                    <span className="room-item-name">{r.name}</span>
                    <span className="room-item-meta">
                      {r.member_count} {r.member_count === 1 ? 'player' : 'players'}
                      {r.is_host && ' · you host'}
                    </span>
                  </span>
                  <span className={`status-pill status-${r.status}`}>{r.status}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
