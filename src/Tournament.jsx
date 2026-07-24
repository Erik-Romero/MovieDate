import React, { useState } from 'react';
import Poster from './components/Poster';
import {
  buildBracket,
  recordPick,
  currentMatchup,
  currentRound,
  champion,
  progress,
  roundName,
  MIN_SIZE,
} from './lib/bracket';

/**
 * Takes a movie list and runs a single-elimination bracket over it.
 *
 * Source-agnostic on purpose: pass deck.liked for a solo run, or a room's
 * frozen pool for a group run. The component doesn't know or care.
 *
 * A room pool arrives already ordered by score, and that order IS the
 * seeding. Pass preSeeded={false} to sort by popularity instead.
 */
export default function Tournament({
  movies,
  title = 'Tournament',
  onExit,
  onReset = null,
  preSeeded = true,
}) {
  const seed = () => {
    const list = preSeeded
      ? movies
      : [...movies].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    return buildBracket(list);
  };

  const [bracket, setBracket] = useState(seed);
  const [flash, setFlash] = useState(null);

  if (!bracket) {
    return (
      <div className="screen screen-center">
        <div className="empty-state">
          <p className="empty-head">Not enough movies</p>
          <p className="empty-body">
            A bracket needs at least {MIN_SIZE} films. This pool has {movies.length}.
          </p>
          {onExit && (
            <button className="btn btn-primary" onClick={onExit}>
              Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const winner = champion(bracket);
  const { made, total } = progress(bracket);

  if (winner) {
    return (
      <div className="screen screen-center">
        <div className="champion">
          <p className="champion-kicker">Winner</p>
          <div className="champion-art">
            <Poster movie={winner} />
          </div>
          <h1 className="champion-title">{winner.title}</h1>
          <p className="brand-sub">
            {winner.release_year} &middot; beat {bracket.size - 1} others
          </p>

          <div className="champion-actions">
            <button className="btn btn-primary btn-block" onClick={() => setBracket(seed())}>
              Run it again
            </button>
            {onReset && (
              <button className="btn btn-ghost btn-block" onClick={onReset}>
                Back to lobby
              </button>
            )}
            {onExit && (
              <button className="btn btn-ghost btn-block" onClick={onExit}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const match = currentMatchup(bracket);
  const round = currentRound(bracket);

  const pick = (movie) => {
    setFlash(movie.id);
    setTimeout(() => {
      setBracket((b) => recordPick(b, movie.id));
      setFlash(null);
    }, 180);
  };

  return (
    <div className="screen">
      <header className="topbar">
        {onExit ? (
          <button className="btn btn-ghost" onClick={onExit}>
            &larr; Exit
          </button>
        ) : (
          <span />
        )}
        <div className="round-label">
          <span className="round-name">{roundName(round.length)}</span>
          <span className="round-count">
            {title} &middot; {made + 1} of {total}
          </span>
        </div>
      </header>

      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${(made / total) * 100}%` }} />
      </div>

      <p className="versus-prompt">Which one wins?</p>

      <div className="versus">
        <button
          className={`contender ${flash === match.a.id ? 'contender-picked' : ''}`}
          onClick={() => pick(match.a)}
        >
          <div className="contender-art">
            <Poster movie={match.a} />
          </div>
          <span className="contender-title">{match.a.title}</span>
          <span className="contender-year">{match.a.release_year}</span>
        </button>

        <span className="versus-mark">vs</span>

        <button
          className={`contender ${flash === match.b.id ? 'contender-picked' : ''}`}
          onClick={() => pick(match.b)}
        >
          <div className="contender-art">
            <Poster movie={match.b} />
          </div>
          <span className="contender-title">{match.b.title}</span>
          <span className="contender-year">{match.b.release_year}</span>
        </button>
      </div>
    </div>
  );
}
