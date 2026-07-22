import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';
import LoadingCard from './LoadingCard';
import Poster from './Poster';
import { GENRE_OPTIONS, YEAR_RANGE } from './movies';

export default function App({ userInfo, deck }) {
  const {
    current,
    upNext,
    swipe,
    undo,
    reset,
    canUndo,
    swipedCount,
    liked,
    filters,
    setGenreId,
    setStartYear,
    setEndYear,
  } = deck;

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Purely cosmetic: filtering a local array is instant, but flashing the
  // loading state keeps the seam where a real fetch would go.
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [filters.genreId, filters.startYear, filters.endYear]);

  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <h1 className="brand">ReelMatch</h1>
          <p className="brand-sub">
            {userInfo.username} in {userInfo.group}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/liked')}>
          Liked {liked.length > 0 && <span className="pip">{liked.length}</span>}
        </button>
      </header>

      <div className="deck">
        {upNext && !loading && (
          <div className="card card-behind" aria-hidden="true">
            <div className="card-art">
              <Poster movie={upNext} />
            </div>
          </div>
        )}

        {loading ? (
          <LoadingCard />
        ) : current ? (
          <MovieCard
            key={current.id}
            movie={current}
            onSwipeLeft={() => swipe(current.id, false)}
            onSwipeRight={() => swipe(current.id, true)}
          />
        ) : (
          <div className="card card-empty">
            <p className="empty-head">
              {swipedCount > 0 ? 'That\u2019s the whole deck' : 'Nothing matches'}
            </p>
            <p className="empty-body">
              {swipedCount > 0
                ? 'Reset to run through it again, or widen the filters.'
                : 'Loosen the genre or year filters to bring cards back.'}
            </p>
            <button className="btn btn-primary" onClick={reset}>
              Start over
            </button>
          </div>
        )}
      </div>

      <div className="actions">
        <button
          className="btn btn-round btn-nope"
          onClick={() => current && swipe(current.id, false)}
          disabled={!current}
          aria-label="Dislike"
        >
          &#10005;
        </button>
        <button
          className="btn btn-round btn-undo"
          onClick={undo}
          disabled={!canUndo}
          aria-label="Undo last swipe"
        >
          &#8630;
        </button>
        <button
          className="btn btn-round btn-like"
          onClick={() => current && swipe(current.id, true)}
          disabled={!current}
          aria-label="Like"
        >
          &#9829;
        </button>
      </div>

      <div className="filters">
        <select
          className="field"
          value={filters.genreId}
          onChange={(e) => setGenreId(e.target.value)}
          aria-label="Genre"
        >
          {GENRE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <input
          className="field field-year"
          type="number"
          inputMode="numeric"
          placeholder={String(YEAR_RANGE.min)}
          value={filters.startYear}
          onChange={(e) => setStartYear(e.target.value)}
          aria-label="From year"
        />
        <span className="dash">&ndash;</span>
        <input
          className="field field-year"
          type="number"
          inputMode="numeric"
          placeholder={String(YEAR_RANGE.max)}
          value={filters.endYear}
          onChange={(e) => setEndYear(e.target.value)}
          aria-label="To year"
        />
      </div>
    </div>
  );
}
