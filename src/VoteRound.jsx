import React, { useState, useEffect } from 'react';
import Versus from './components/Versus';
import Champion from './components/Champion';
import BracketView from './components/BracketView';
import Icon from './components/Icon';
import LoadingScreen from './components/LoadingScreen';
import { useTournament, useTournamentBracket } from './hooks/useTournament';

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
  const [showBracket, setShowBracket] = useState(false);
  const bracket = useTournamentBracket(roomId, isDone && showBracket);

  // New round arrived -> jump back to its first matchup.
  const currentRound = matchups[0]?.round ?? null;
  useEffect(() => {
    if (currentRound !== round) {
      setRound(currentRound);
      setIdx(0);
    }
  }, [currentRound, round]);

  if (loading) return <LoadingScreen label="Loading tournament" />;

  // --- champion -----------------------------------------------------------
  if (isDone && champion && showBracket) {
    return (
      <BracketView
        rounds={bracket.rounds ?? []}
        title={roomName}
        champion={champion}
        loading={bracket.loading || (!bracket.rounds && !bracket.error)}
        error={bracket.error}
        onBack={() => setShowBracket(false)}
      />
    );
  }

  if (isDone && champion) {
    return (
      <Champion movie={champion} subtitle={`${champion.release_year} · voted by the room`}>
        {isHost && onReset && (
          <button type="button" className="btn btn-primary btn-lg btn-block" onClick={onReset}>
            Back to lobby
          </button>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-lg btn-block"
          onClick={() => setShowBracket(true)}
        >
          <Icon name="list-ordered" size={18} />
          See the bracket &amp; votes
        </button>
        <button type="button" className="btn btn-secondary btn-lg btn-block" onClick={onExit}>
          Done
        </button>
      </Champion>
    );
  }

  const low = hasTimer && remaining <= 10;

  // --- you're done, others aren't ------------------------------------------
  if (youAreDone) {
    const waiting = matchups.filter((m) => m.winner_id === null);
    const slowest = waiting.length
      ? Math.min(...waiting.map((m) => m.voted))
      : members;

    return (
      <div className="screen screen-center">
        <div className="waiting">
          <p className="kicker kicker-gold">{label(roundSize)}</p>
          <h1 className="empty-title">Votes are in</h1>
          <p className="empty-body">
            Waiting on the rest of the room — {slowest} of {members} have
            finished this round.
          </p>
          <div className="tally" aria-hidden="true">
            {Array.from({ length: members }, (_, i) => (
              <span key={i} className="tally-pip" data-on={i < slowest} />
            ))}
          </div>
          {hasTimer ? (
            <p className={`countdown ${low ? 'countdown-low' : ''}`}>
              {remaining > 0 ? clock(remaining) : 'Time!'}
            </p>
          ) : (
            <span className="loader" aria-hidden="true">
              <span className="pulse-dot" />
              <span className="pulse-dot" />
              <span className="pulse-dot" />
            </span>
          )}
          <button type="button" className="btn btn-ghost waiting-leave" onClick={onExit}>
            Leave it running
          </button>
        </div>
      </div>
    );
  }

  // --- voting -------------------------------------------------------------
  const match = yourRemaining[Math.min(idx, yourRemaining.length - 1)];
  if (!match) return <LoadingScreen label="Tallying" />;

  const total = roundSize;
  const done = total - yourRemaining.length;

  const choose = async (movie) => {
    setFlash(movie.id);
    const ok = await castVote(match.id, movie.id);
    setFlash(null);
    if (ok) setIdx(0); // yourRemaining shrinks; always take the new first
  };

  return (
    <div className="screen screen-fixed screen-wide">
      <header className="match-head">
        <button type="button" className="back-btn" onClick={onExit}>
          <Icon name="x" size={20} />
          Exit
        </button>
        <div className="match-title">
          <span className="match-round">{label(roundSize)}</span>
          <span className="kicker">
            {roomName} · {done + 1}/{total}
          </span>
        </div>
        <div className="match-head-end">
          {hasTimer && (
            <span className={`clock-chip ${low ? 'countdown-low' : ''}`} role="timer">
              <Icon name="clock" size={13} strokeWidth={2.4} />
              {remaining > 0 ? clock(remaining) : '0s'}
            </span>
          )}
        </div>
      </header>

      <div className="progress" aria-hidden="true">
        <div className="progress-fill" style={{ transform: `scaleX(${done / total})` }} />
      </div>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <p className="versus-prompt">
        <strong>Your vote</strong>
        <span className="muted">
          {' '}
          · {match.voted} of {members} voted here
        </span>
      </p>

      <Versus
        key={match.id}
        a={match.a}
        b={match.b}
        seeds={[match.seed_a, match.seed_b]}
        picked={flash}
        onPick={choose}
      />
    </div>
  );
}
