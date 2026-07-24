import React from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './components/MovieCard';
import LoadingCard from './components/LoadingCard';
import Poster from './components/Poster';
import { GENRE_OPTIONS, YEAR_RANGE } from './data/movies';
import { APP_NAME } from './config';

export default function App({ userInfo, deck, onSignOut }) {
  const {
    current,
    upNext,
    swipe,
    undo,
    canUndo,
    swipedCount,
    liked,
    loading,
    error,
    filters,
    setGenreId,
    setStartYear,
    setEndYear,
  } = deck;

  const navigate = useNavigate();

  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <h1 className="brand">{APP_NAME}</h1>
          <p className="brand-sub">{userInfo.username}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/liked')}>
            Liked {liked.length > 0 && <span className="pip">{liked.length}</span>}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/tournament')}
            disabled={liked.length < 4}
            title={liked.length < 4 ? 'Like at least 4 films first' : 'Start the tournament'}
          >
            Tourney
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/rooms')}>
            Rooms
          </button>
          <button className="btn btn-ghost" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      {error && <p className="error" role="alert" style={{ maxWidth: 420 }}>{error}</p>}

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
              {swipedCount > 0 ? 'You’ve seen them all' : 'No movies match'}
            </p>
            <p className="empty-body">
              {swipedCount > 0
                ? 'That’s every film in the catalog. Add more, or loosen the filters.'
                : 'Loosen the genre or year filters to bring cards back.'}
            </p>
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
