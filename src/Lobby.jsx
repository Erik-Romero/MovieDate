import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from './hooks/useRoom';
import Tournament from './Tournament';

export default function Lobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    room, members, you, movies, loading, error, setError,
    setReady, start, reset, leave, allReady, isHost, status,
  } = useRoom(id);

  if (loading) {
    return (
      <div className="screen screen-center">
        <p className="empty-body">Loading room…</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="screen screen-center">
        <div className="empty-state">
          <p className="empty-head">Room not found</p>
          <p className="empty-body">{error || 'It may have been deleted.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/rooms')}>
            Back to rooms
          </button>
        </div>
      </div>
    );
  }

  // --- tournament running ------------------------------------------------
  if (status === 'running') {
    if (!movies) {
      return (
        <div className="screen screen-center">
          <p className="empty-body">Seeding the bracket…</p>
        </div>
      );
    }
    return (
      <Tournament
        movies={movies}
        title={room.name}
        onExit={() => navigate('/rooms')}
        onReset={isHost ? reset : null}
      />
    );
  }

  // --- lobby --------------------------------------------------------------
  const readyCount = members.filter((m) => m.ready).length;

  return (
    <div className="screen screen-scroll">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => navigate('/rooms')}>
          ← Rooms
        </button>
        <div className="round-label">
          <span className="round-name">{room.name}</span>
          <span className="round-count">
            {readyCount} of {members.length} ready
          </span>
        </div>
      </header>

      <div className="panel">
        <p className="label" style={{ marginTop: 0 }}>Share this code</p>
        <button
          className="code-display"
          onClick={() => {
            navigator.clipboard?.writeText(room.code);
          }}
          title="Tap to copy"
        >
          {room.code}
        </button>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="panel">
        <h2 className="section-head">Players</h2>
        <ul className="member-list">
          {members.map((m) => (
            <li key={m.user_id} className="member">
              <span className={`ready-dot ${m.ready ? 'ready-on' : ''}`} />
              <span className="member-name">
                {m.name}
                {m.is_you && <span className="member-you"> (you)</span>}
              </span>
              <span className="member-likes">{m.likes} liked</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lobby-actions">
        <button
          className={`btn btn-block ${you?.ready ? 'btn-ghost' : 'btn-primary'}`}
          onClick={() => setReady(!you?.ready)}
        >
          {you?.ready ? 'Not ready' : "I'm ready"}
        </button>

        {isHost && (
          <button
            className="btn btn-primary btn-block"
            onClick={async () => {
              setError('');
              await start();
            }}
            disabled={!allReady}
            title={allReady ? 'Start' : 'Everyone has to be ready first'}
          >
            {allReady ? 'Start tournament' : `Waiting on ${members.length - readyCount}`}
          </button>
        )}

        {!isHost && allReady && (
          <p className="empty-body" style={{ textAlign: 'center' }}>
            Waiting for the host to start…
          </p>
        )}

        <button
          className="btn btn-ghost btn-block"
          onClick={async () => {
            await leave();
            navigate('/rooms');
          }}
        >
          Leave room
        </button>
      </div>
    </div>
  );
}
