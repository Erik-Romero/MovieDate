import React, { useState } from 'react';
import Versus from './components/Versus';
import Champion from './components/Champion';
import BracketView from './components/BracketView';
import Icon from './components/Icon';
import {
  buildBracket,
  recordPick,
  currentMatchup,
  currentMatchupIndex,
  currentRound,
  champion,
  progress,
  roundName,
  bracketRounds,
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
  const [showBracket, setShowBracket] = useState(false);

  if (!bracket) {
    return (
      <div className="screen screen-center">
        <div className="empty">
          <span className="empty-icon">
            <Icon name="trophy" size={24} />
          </span>
          <p className="empty-title">Not enough movies</p>
          <p className="empty-body">
            A bracket needs at least {MIN_SIZE} films. This pool has {movies.length}.
          </p>
          {onExit && (
            <button type="button" className="btn btn-primary" onClick={onExit}>
              Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const winner = champion(bracket);
  const { made, total } = progress(bracket);

  if (winner && showBracket) {
    return (
      <BracketView
        rounds={bracketRounds(bracket)}
        title={title}
        champion={winner}
        onBack={() => setShowBracket(false)}
      />
    );
  }

  if (winner) {
    return (
      <Champion
        movie={winner}
        subtitle={`${winner.release_year} · beat ${bracket.size - 1} others`}
      >
        <button
          type="button"
          className="btn btn-primary btn-lg btn-block"
          onClick={() => setBracket(seed())}
        >
          <Icon name="rotate-ccw" size={18} />
          Run it again
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-lg btn-block"
          onClick={() => setShowBracket(true)}
        >
          <Icon name="list-ordered" size={18} />
          See the bracket
        </button>
        {onReset && (
          <button type="button" className="btn btn-secondary btn-lg btn-block" onClick={onReset}>
            Back to lobby
          </button>
        )}
        {onExit && (
          <button type="button" className="btn btn-ghost btn-block" onClick={onExit}>
            Done
          </button>
        )}
      </Champion>
    );
  }

  const match = currentMatchup(bracket);
  const round = currentRound(bracket);
  const matchNo = currentMatchupIndex(bracket) + 1;

  const pick = (movie) => {
    setFlash(movie.id);
    // long enough to see the check land, short enough not to feel like a wait
    setTimeout(() => {
      setBracket((b) => recordPick(b, movie.id));
      setFlash(null);
    }, 260);
  };

  return (
    <div className="screen screen-fixed screen-wide">
      <header className="match-head">
        {onExit ? (
          <button type="button" className="back-btn" onClick={onExit}>
            <Icon name="x" size={20} />
            Exit
          </button>
        ) : (
          <span />
        )}
        <div className="match-title">
          <span className="match-round">{roundName(round.length)}</span>
          <span className="kicker">
            {title} · {made + 1}/{total}
          </span>
        </div>
        <span />
      </header>

      <div className="progress" aria-hidden="true">
        <div className="progress-fill" style={{ transform: `scaleX(${made / total})` }} />
      </div>

      <p className="versus-prompt">
        <strong>Which one wins?</strong>
        {round.length > 1 && (
          <span className="muted">
            {' '}
            · Match {matchNo} of {round.length}
          </span>
        )}
      </p>

      <Versus
        key={`${bracket.rounds.length}-${matchNo}`}
        a={match.a}
        b={match.b}
        picked={flash}
        onPick={pick}
      />
    </div>
  );
}
