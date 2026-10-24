import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRooms } from './hooks/useRooms';
import Icon from './components/Icon';
import { hueFor } from './lib/hue';

const STATUS = {
  lobby: { label: 'Lobby', className: 'pill' },
  running: { label: 'Live', className: 'pill pill-live' },
  done: { label: 'Done', className: 'pill pill-done' },
};

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

  const cancel = () => {
    setMode(null);
    setError('');
  };

  return (
    <div className="screen">
      <header className="page-head">
        <p className="kicker">Movie night</p>
        <h1 className="title-xl">Rooms</h1>
        <p className="lede">
          Get everyone in one room. The bracket is built from what you all liked.
        </p>
      </header>

      {mode === null && (
        <div className="tiles">
          <button type="button" className="tile tile-primary" onClick={() => setMode('create')}>
            <span className="tile-icon">
              <Icon name="plus" size={20} strokeWidth={2.4} />
            </span>
            <span>
              <span className="tile-title">Create a room</span>
              <span className="tile-body">
                You host and pick the rules
              </span>
            </span>
          </button>
          <button type="button" className="tile" onClick={() => setMode('join')}>
            <span className="tile-icon">
              <Icon name="ticket" size={20} />
            </span>
            <span>
              <span className="tile-title">Join with a code</span>
              <span className="tile-body">
                Six characters from a friend
              </span>
            </span>
          </button>
        </div>
      )}

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      {mode === 'create' && (
        <form onSubmit={submitCreate} className="panel form form-panel">
          <div className="panel-head">
            <h2 className="title-lg">Create a room</h2>
          </div>
          <div className="form-field">
            <label className="label" htmlFor="roomname">
              Room name
            </label>
            <input
              id="roomname"
              className="field"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="friday night"
              autoComplete="off"
              enterKeyHint="go"
              disabled={busy}
              autoFocus
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={cancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={submitJoin} className="panel form form-panel">
          <div className="panel-head">
            <h2 className="title-lg">Join a room</h2>
          </div>
          <div className="form-field">
            <label className="label" htmlFor="roomcode">
              Room code
            </label>
            <input
              id="roomcode"
              className="field code-input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="A1B2C3"
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="go"
              disabled={busy}
              autoFocus
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={cancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Joining…' : 'Join'}
            </button>
          </div>
        </form>
      )}

      <section className="section" aria-labelledby="your-rooms">
        <h2 id="your-rooms" className="kicker section-title">
          Your rooms
        </h2>
        {loading ? (
          <p className="hint">Loading…</p>
        ) : rooms.length === 0 ? (
          <div className="panel">
            <p className="hint">
              None yet. Create one and share the code with friends.
            </p>
          </div>
        ) : (
          <ul className="room-list">
            {rooms.map((r) => {
              const status = STATUS[r.status] ?? { label: r.status, className: 'pill' };
              const hue = hueFor(r.name);
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className="room-item"
                    onClick={() => navigate(`/room/${r.id}`)}
                  >
                    <span
                      className="room-glyph"
                      aria-hidden="true"
                      style={{
                        background: `linear-gradient(150deg, hsl(${hue} 40% 34%), hsl(${(hue + 36) % 360} 36% 18%))`,
                      }}
                    >
                      {r.name.trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="room-item-main">
                      <span className="room-item-name">{r.name}</span>
                      <span className="room-item-meta">
                        {r.member_count} {r.member_count === 1 ? 'player' : 'players'}
                        {r.is_host && ' · you host'}
                      </span>
                    </span>
                    <span className={status.className}>{status.label}</span>
                    <Icon name="chevron-right" size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
