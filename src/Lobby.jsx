import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from './hooks/useRoom';
import VoteRound from './VoteRound';

export default function Lobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    room, members, you, loading, error, setError,
    setReady, start, reset, leave, allReady, isHost, status, poolSize,
  } = useRoom(id);

  const [size, setSize] = useState(16);
  const [secs, setSecs] = useState(60);

  // Largest bracket the room's combined likes can actually fill.
  const maxSize = poolSize >= 32 ? 32 : poolSize >= 16 ? 16 : poolSize >= 8 ? 8 : 4;

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
  if (status === 'running' || status === 'done') {
    return (
      <VoteRound
        roomId={id}
        roomName={room.name}
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

      {isHost && (
        <div className="panel">
          <h2 className="section-head">Settings</h2>

          <p className="label" style={{ marginTop: 0 }}>Movies in the bracket</p>
          <div className="seg">
            {[4, 8, 16, 32].map((n) => (
              <button
                key={n}
                className={`seg-btn ${size === n ? 'seg-on' : ''}`}
                onClick={() => setSize(n)}
                disabled={n > maxSize}
                title={n > maxSize ? `The room only has ${poolSize} films between you` : ''}
              >
                {n}
              </button>
            ))}
          </div>

          <p className="label">Time per round</p>
          <div className="seg">
            {[
              [30, '30s'],
              [60, '1m'],
              [120, '2m'],
              [300, '5m'],
              [0, 'None'],
            ].map(([v, l]) => (
              <button
                key={v}
                className={`seg-btn ${secs === v ? 'seg-on' : ''}`}
                onClick={() => setSecs(v)}
              >
                {l}
              </button>
            ))}
          </div>

          <p className="hint">
            {poolSize} film{poolSize === 1 ? '' : 's'} in the pool.
            {size > maxSize && ` Not enough for ${size} — it'll use ${maxSize}.`}
            {secs === 0
              ? ' Rounds wait for everyone, with no time limit.'
              : ' A round ends when everyone votes or the clock runs out.'}
          </p>
        </div>
      )}

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
              await start(size, secs);
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
