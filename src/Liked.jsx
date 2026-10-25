import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieRow from './components/MovieRow';
import Icon from './components/Icon';
import LoadingScreen from './components/LoadingScreen';
import { MIN_SIZE } from './lib/bracket';
import { settledFraction } from './lib/ranking';

const FILTERS = [
  ['all', 'All'],
  ['unwatched', 'To watch'],
  ['watched', 'Watched'],
];

export default function Liked({ deck }) {
  const { liked, ranks, loading, setWatched } = deck;
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  if (loading) return <LoadingScreen label="Loading your likes" />;

  const seen = (m) => Boolean(ranks[m.id]?.seen);
  const counts = {
    all: liked.length,
    watched: liked.filter(seen).length,
    unwatched: liked.filter((m) => !seen(m)).length,
  };
  // liked is already best-first, so a film's rank is its place in the full list
  const rows = liked
    .map((movie, i) => ({ movie, rank: i + 1 }))
    .filter(({ movie }) => (filter === 'all' ? true : filter === 'watched' ? seen(movie) : !seen(movie)));

  const settled = settledFraction(
    liked.map((m) => ({ compared: ranks[m.id]?.compared ?? 0 }))
  );
  const canBracket = liked.length >= MIN_SIZE;

  return (
    <div className="screen">
      <header className="page-head">
        <p className="kicker">Your shortlist</p>
        <div className="page-head-row">
          <h1 className="title-xl">Liked</h1>
          {liked.length > 0 && (
            <span className="count">
              {liked.length} film{liked.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </header>

      {liked.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">
            <Icon name="heart" size={24} />
          </span>
          <p className="empty-title">No likes yet</p>
          <p className="empty-body">Swipe right on something and it lands here.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
            Back to swiping
          </button>
        </div>
      ) : (
        <>
          {liked.length >= 2 && (
            <section className="cta-card" aria-labelledby="ranking-title">
              <span className="cta-icon">
                <Icon name="list-ordered" size={22} />
              </span>
              <div>
                <h2 id="ranking-title" className="cta-title">
                  Your ranking
                </h2>
                <p className="cta-body">
                  {settled >= 1
                    ? 'Settled. Keep picking any time to fine-tune it.'
                    : 'Pick between two at a time and your favorites rise to the top. Rooms use this order.'}
                </p>
              </div>
              <div className="cta-progress">
                <div className="progress" aria-hidden="true">
                  <div className="progress-fill" style={{ transform: `scaleX(${settled})` }} />
                </div>
                <span className="count">{Math.round(settled * 100)}% settled</span>
              </div>
              <div className="cta-actions">
                <button type="button" className="btn btn-primary" onClick={() => navigate('/rank')}>
                  Rank likes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/tournament')}
                  disabled={!canBracket}
                  title={canBracket ? 'Run a bracket over your likes' : `Like at least ${MIN_SIZE} films first`}
                >
                  <Icon name="trophy" size={16} />
                  Tourney
                </button>
              </div>
            </section>
          )}

          <div className="seg" role="group" aria-label="Show">
            {FILTERS.map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={`seg-btn ${filter === value ? 'seg-on' : ''}`}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label} <span className="seg-count">{counts[value]}</span>
              </button>
            ))}
          </div>

          {rows.length === 0 ? (
            <p className="hint list-hint">
              {filter === 'watched'
                ? 'Nothing marked watched yet. Tap “Watched” on a film you’ve seen.'
                : 'You’ve watched everything you liked. Time to swipe some more.'}
            </p>
          ) : (
            <ul className="rows">
              {rows.map(({ movie, rank }) => (
                <MovieRow
                  key={movie.id}
                  movie={movie}
                  rank={rank}
                  watched={seen(movie)}
                  onToggleWatched={() => setWatched(movie.id, !seen(movie))}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
