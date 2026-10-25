import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from './hooks/useRoom';
import VoteRound from './VoteRound';
import Avatar from './components/Avatar';
import Icon from './components/Icon';
import LoadingScreen from './components/LoadingScreen';

export default function Lobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    room, members, you, loading, error, setError,
    setReady, start, reset, leave, allReady, isHost, status, poolSize,
  } = useRoom(id);

  const [size, setSize] = useState(16);
  const [secs, setSecs] = useState(60);
  const [watched, setWatched] = useState('prefer'); // films someone has already seen
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  // Largest bracket the room's combined likes can actually fill.
  const maxSize = poolSize >= 32 ? 32 : poolSize >= 16 ? 16 : poolSize >= 8 ? 8 : 4;

  if (loading) return <LoadingScreen label="Loading room" />;

  if (!room) {
    return (
      <div className="screen screen-center">
        <div className="empty">
          <span className="empty-icon">
            <Icon name="ticket" size={24} />
          </span>
          <p className="empty-title">Room not found</p>
          <p className="empty-body">{error || 'It may have been deleted.'}</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/rooms')}>
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

  const copyCode = async () => {
    try {
      await navigator.clipboard?.writeText(room.code);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions). The code is
      // on screen either way, so there's nothing to recover.
    }
  };

  return (
    <div className="screen">
      <header className="header">
        <button type="button" className="back-btn" onClick={() => navigate('/rooms')}>
          <Icon name="chevron-left" size={22} />
          Rooms
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-danger btn-sm"
          onClick={async () => {
            await leave();
            navigate('/rooms');
          }}
        >
          Leave room
        </button>
      </header>

      <div className="page-head page-head-tight">
        <h1 className="title-xl">{room.name}</h1>
        <p className="count">
          {readyCount} of {members.length} ready
        </p>
      </div>

      <div className="ticket">
        <div className="ticket-main">
          <p className="kicker">Share this code</p>
          <p className="ticket-code" aria-label={`Room code ${room.code.split('').join(' ')}`}>
            {room.code}
          </p>
        </div>
        <button
          type="button"
          className="ticket-stub"
          onClick={copyCode}
          data-copied={copied}
          aria-live="polite"
        >
          <Icon name={copied ? 'check' : 'copy'} size={20} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <section className="panel" aria-labelledby="players-title">
        <div className="panel-head">
          <h2 id="players-title" className="kicker">
            Players
          </h2>
          <span className="count">{members.length}</span>
        </div>
        <ul className="member-list">
          {members.map((m) => (
            <li key={m.user_id} className="member">
              <Avatar name={m.name} small />
              <span className="member-main">
                <span className="member-name">
                  {m.name}
                  {m.is_you && <span className="member-you"> (you)</span>}
                </span>
                <span className="member-likes">{m.likes} liked</span>
              </span>
              <span className={m.ready ? 'pill pill-ready' : 'pill'}>
                {m.ready ? 'Ready' : 'Not ready'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {isHost && (
        <section className="panel" aria-labelledby="settings-title">
          <div className="panel-head">
            <h2 id="settings-title" className="kicker">
              Settings
            </h2>
            <span className="count">
              {poolSize} film{poolSize === 1 ? '' : 's'} in the pool
            </span>
          </div>

          <div className="setting">
            <span className="label">Movies in the bracket</span>
            <div className="seg" role="group" aria-label="Movies in the bracket">
              {[4, 8, 16, 32].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`seg-btn ${size === n ? 'seg-on' : ''}`}
                  aria-pressed={size === n}
                  onClick={() => setSize(n)}
                  disabled={n > maxSize}
                  title={n > maxSize ? `The room only has ${poolSize} films between you` : ''}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="setting">
            <span className="label">Time per round</span>
            <div className="seg" role="group" aria-label="Time per round">
              {[
                [30, '30s'],
                [60, '1m'],
                [120, '2m'],
                [300, '5m'],
                [0, 'None'],
              ].map(([v, l]) => (
                <button
                  type="button"
                  key={v}
                  className={`seg-btn ${secs === v ? 'seg-on' : ''}`}
                  aria-pressed={secs === v}
                  onClick={() => setSecs(v)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="setting">
            <span className="label">Films someone has watched</span>
            <div className="seg" role="group" aria-label="Films someone has watched">
              {[
                ['include', 'Include'],
                ['prefer', 'Unseen first'],
                ['exclude', 'Leave out'],
              ].map(([v, l]) => (
                <button
                  type="button"
                  key={v}
                  className={`seg-btn ${watched === v ? 'seg-on' : ''}`}
                  aria-pressed={watched === v}
                  onClick={() => setWatched(v)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <p className="hint setting-hint">
            {size > maxSize && `Not enough for ${size} — it'll use ${maxSize}. `}
            {secs === 0
              ? 'Rounds wait for everyone, with no time limit. '
              : 'A round ends when everyone votes or the clock runs out. '}
            {watched === 'exclude'
              ? 'Leaving out watched films can make the bracket smaller.'
              : watched === 'prefer'
                ? 'Films nobody has seen get the better seeds.'
                : ''}
          </p>
        </section>
      )}

      <div className="dock">
        <button
          type="button"
          className={`btn btn-lg btn-block ${you?.ready ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setReady(!you?.ready)}
        >
          {you?.ready ? 'Not ready' : "I'm ready"}
        </button>

        {isHost && (
          <button
            type="button"
            className="btn btn-primary btn-lg btn-block"
            onClick={async () => {
              setError('');
              await start(size, secs, watched);
            }}
            disabled={!allReady}
            title={allReady ? 'Start' : 'Everyone has to be ready first'}
          >
            {allReady ? 'Start tournament' : `Waiting on ${members.length - readyCount}`}
          </button>
        )}

        {!isHost && allReady && <p className="hint">Waiting for the host to start…</p>}
      </div>
    </div>
  );
}
