import React, { useState, useEffect } from 'react';
import Poster from './components/Poster';
import { useTournament } from './hooks/useTournament';

function clock(s) {
  if (s == null) return null;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${r}s`;
}

function label(size) {
  if (size === 1) return 'Final';
  if (size === 2) return 'Semifinals';
  if (size === 4) return 'Quarterfinals';
  return `Round of ${size * 2}`;
}

export default function VoteRound({ roomId, roomName, onExit, onReset }) {
  const {
    matchups, loading, error, castVote, roundSize, members,
    champion, isDone, isHost, yourRemaining, youAreDone,
    remaining, hasTimer,
  } = useTournament(roomId);

  const [idx, setIdx] = useState(0);
  const [flash, setFlash] = useState(null);
  const [round, setRound] = useState(null);

  // New round arrived -> jump back to its first matchup.
  const currentRound = matchups[0]?.round ?? null;
  useEffect(() => {
    if (currentRound !== round) {
      setRound(currentRound);
      setIdx(0);
    }
  }, [currentRound, round]);

  if (loading) {
    return (
      <div className="screen screen-center">
        <p className="empty-body">Loading tournament…</p>
      </div>
    );
  }

  // --- champion -----------------------------------------------------------
  if (isDone && champion) {
    return (
      <div className="screen screen-center">
        <div className="champion">
          <p className="champion-kicker">Winner</p>
          <div className="champion-art">
            <Poster movie={champion} />
          </div>
          <h1 className="champion-title">{champion.title}</h1>
          <p className="brand-sub">{champion.release_year} &middot; voted by the room</p>
          <div className="champion-actions">
            {isHost && onReset && (
              <button className="btn btn-primary btn-block" onClick={onReset}>
                Back to lobby
              </button>
            )}
            <button className="btn btn-ghost btn-block" onClick={onExit}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- you're done, others aren't ------------------------------------------
  if (youAreDone) {
    const waiting = matchups.filter((m) => m.winner_id === null);
    const slowest = waiting.length
      ? Math.min(...waiting.map((m) => m.voted))
      : members;

    return (
      <div className="screen screen-center">
        <div className="empty-state">
          <p className="champion-kicker">{label(roundSize)}</p>
          <p className="empty-head">Votes are in</p>
          <p className="empty-body">
            Waiting on the rest of the room — {slowest} of {members} have
            finished this round.
          </p>
          {hasTimer && (
            <p className={`countdown ${remaining <= 10 ? 'countdown-low' : ''}`}>
              {remaining > 0 ? clock(remaining) : 'Time!'}
            </p>
          )}
          <div className="waiting-dots">
            <span className="pulse-dot" />
            <span className="pulse-dot" />
            <span className="pulse-dot" />
          </div>
          <button className="btn btn-ghost" onClick={onExit}>
            Leave it running
          </button>
        </div>
      </div>
    );
  }

  // --- voting -------------------------------------------------------------
  const match = yourRemaining[Math.min(idx, yourRemaining.length - 1)];
  if (!match) {
    return (
      <div className="screen screen-center">
        <p className="empty-body">Tallying…</p>
      </div>
    );
  }

  const total = roundSize;
  const done = total - yourRemaining.length;

  const choose = async (movie) => {
    setFlash(movie.id);
    const ok = await castVote(match.id, movie.id);
    setFlash(null);
    if (ok) setIdx(0); // yourRemaining shrinks; always take the new first
  };

  return (
    <div className="screen">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={onExit}>
          &larr; Exit
        </button>
        <div className="round-label">
          <span className="round-name">
            {label(roundSize)}
            {hasTimer && (
              <span className={`clock-chip ${remaining <= 10 ? 'countdown-low' : ''}`}>
                {remaining > 0 ? clock(remaining) : '0s'}
              </span>
            )}
          </span>
          <span className="round-count">
            {roomName} &middot; {done + 1} of {total}
          </span>
        </div>
      </header>

      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <p className="versus-prompt">
        Your vote &middot; {match.voted} of {members} voted here
      </p>

      <div className="versus">
        <button
          className={`contender ${flash === match.a.id ? 'contender-picked' : ''}`}
          onClick={() => choose(match.a)}
        >
          <div className="contender-art">
            <Poster movie={match.a} />
          </div>
          <span className="contender-title">{match.a.title}</span>
          <span className="contender-year">
            {match.a.release_year} &middot; #{match.seed_a}
          </span>
        </button>

        <span className="versus-mark">vs</span>

        <button
          className={`contender ${flash === match.b.id ? 'contender-picked' : ''}`}
          onClick={() => choose(match.b)}
        >
          <div className="contender-art">
            <Poster movie={match.b} />
          </div>
          <span className="contender-title">{match.b.title}</span>
          <span className="contender-year">
            {match.b.release_year} &middot; #{match.seed_b}
          </span>
        </button>
      </div>
    </div>
  );
}
