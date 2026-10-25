import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Versus from './components/Versus';
import Icon from './components/Icon';
import LoadingScreen from './components/LoadingScreen';
import { nextPair, pairKey, settledFraction } from './lib/ranking';

const RECENT = 12; // pairs kept out of rotation after they've been shown

/**
 * "Which do you like more?" over your own likes. Every pick nudges both films'
 * ratings, and the Liked list re-sorts from them. No end state — come back
 * whenever, a few picks at a time.
 */
export default function Rank({ deck }) {
  const navigate = useNavigate();
  const { liked, ranks, loading, compare, undoCompare } = deck;

  const films = useMemo(
    () =>
      liked.map((movie) => ({
        movie,
        rating: ranks[movie.id]?.rating ?? 1500,
        compared: ranks[movie.id]?.compared ?? 0,
      })),
    [liked, ranks]
  );

  const recent = useRef([]); // pair keys to keep out of rotation for a while
  const past = useRef([]); // pairs picked this session, newest last, for undo
  const [pair, setPair] = useState(null);
  const [dealt, setDealt] = useState(0); // bump to deal a new pair
  const [picked, setPicked] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [picks, setPicks] = useState(0); // this session, so undo can't reach further back

  const remember = (a, b) => {
    recent.current = [pairKey(a.id, b.id), ...recent.current].slice(0, RECENT);
  };
  const deal = () => setDealt((n) => n + 1);

  // Deal after the ratings from the last pick have landed, so the next pair is
  // chosen from fresh numbers — but not on every rating change by itself.
  useEffect(() => {
    if (loading || films.length < 2) return;
    setPair(nextPair(films, new Set(recent.current)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealt, loading, films.length < 2]);

  if (loading) return <LoadingScreen label="Loading your likes" />;

  if (films.length < 2) {
    return (
      <div className="screen screen-center">
        <div className="empty">
          <span className="empty-icon">
            <Icon name="list-ordered" size={24} />
          </span>
          <p className="empty-title">Not enough to rank</p>
          <p className="empty-body">Like at least two films, then come back to put them in order.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
            Back to swiping
          </button>
        </div>
      </div>
    );
  }

  const settled = settledFraction(films);

  const choose = async (winner) => {
    if (!pair || busy) return;
    const loser = pair[0].id === winner.id ? pair[1] : pair[0];
    setBusy(true);
    setPicked(winner.id);
    setError('');
    // Let the check land while the database records it.
    const [err] = await Promise.all([
      compare(winner.id, loser.id),
      new Promise((r) => setTimeout(r, 260)),
    ]);
    setPicked(null);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    remember(winner, loser);
    past.current.push(pair);
    setPicks((n) => n + 1);
    deal();
  };

  const skip = () => {
    if (!pair || busy) return;
    remember(pair[0], pair[1]);
    deal();
  };

  const undo = async () => {
    if (busy || picks === 0) return;
    setBusy(true);
    setError('');
    const err = await undoCompare();
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setPicks((n) => n - 1);
    // Put the undone matchup back on screen so it can be picked again.
    const previous = past.current.pop();
    if (previous) setPair(previous);
  };

  return (
    <div className="screen screen-fixed screen-wide">
      <header className="match-head">
        <button type="button" className="back-btn" onClick={() => navigate('/liked')}>
          <Icon name="chevron-left" size={22} />
          Liked
        </button>
        <div className="match-title">
          <span className="match-round">Rank</span>
          <span className="kicker">{Math.round(settled * 100)}% settled</span>
        </div>
        <span />
      </header>

      <div className="progress" aria-hidden="true">
        <div className="progress-fill" style={{ transform: `scaleX(${settled})` }} />
      </div>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <p className="versus-prompt">
        <strong>Which do you like more?</strong>
        {picks > 0 && (
          <span className="muted">
            {' '}
            · {picks} pick{picks === 1 ? '' : 's'} this time
          </span>
        )}
      </p>

      {pair && (
        <Versus
          key={pairKey(pair[0].id, pair[1].id)}
          a={pair[0]}
          b={pair[1]}
          picked={picked}
          onPick={choose}
        />
      )}

      <div className="rank-actions">
        <button type="button" className="btn btn-ghost" onClick={undo} disabled={busy || picks === 0}>
          <Icon name="undo" size={18} />
          Undo
        </button>
        <button type="button" className="btn btn-secondary" onClick={skip} disabled={busy}>
          Can’t decide
        </button>
      </div>
    </div>
  );
}
