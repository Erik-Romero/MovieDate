import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard, { CardFace } from './components/MovieCard';
import LoadingCard from './components/LoadingCard';
import FilterSheet from './components/FilterSheet';
import AccountMenu from './components/AccountMenu';
import Wordmark from './components/Wordmark';
import Icon from './components/Icon';
import { hueFor } from './lib/hue';

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
  const cardRef = useRef(null);
  const behindRef = useRef(null);
  // Which way each card left, so undo can bring it back from the same side.
  const directions = useRef([]);
  const [enterFrom, setEnterFrom] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtersActive = Boolean(filters.genreId || filters.startYear || filters.endYear);
  // The first load failed: nothing came back at all, so "no movies match" would be a lie.
  const loadFailed = Boolean(error) && !current && swipedCount === 0 && liked.length === 0;

  const handleSwipe = (movieId, dir) => {
    directions.current.push(dir);
    setEnterFrom(null);
    swipe(movieId, dir === 'right');
  };

  const handleUndo = () => {
    setEnterFrom(directions.current.pop() ?? null);
    undo();
  };

  return (
    <div className="screen screen-fixed">
      <header className="header">
        <Wordmark as="h1" />
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setFiltersOpen(true)}
            aria-label={filtersActive ? 'Filters, on' : 'Filters'}
          >
            <Icon name="sliders" size={18} />
            {filtersActive && <span className="icon-btn-dot" />}
          </button>
          <AccountMenu userInfo={userInfo} onSignOut={onSignOut} />
        </div>
      </header>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <div className="deck">
        {current && !loading && (
          <div
            className="deck-glow"
            style={{ '--glow-h': hueFor(current.title) }}
            aria-hidden="true"
          />
        )}

        {upNext && !loading && (
          <div key={upNext.id} ref={behindRef} className="card card-behind" aria-hidden="true" inert>
            <CardFace movie={upNext} />
            <div className="card-dim" />
          </div>
        )}

        {loading ? (
          <LoadingCard />
        ) : current ? (
          <MovieCard
            key={current.id}
            ref={cardRef}
            movie={current}
            behindRef={behindRef}
            enterFrom={enterFrom}
            onSwipe={(dir) => handleSwipe(current.id, dir)}
          />
        ) : loadFailed ? (
          <div className="card card-empty">
            <div className="empty">
              <span className="empty-icon">
                <Icon name="film" size={24} />
              </span>
              <p className="empty-title">Couldn’t load films</p>
              <p className="empty-body">The database said no — the message above has the details.</p>
              <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
                <Icon name="rotate-ccw" size={16} />
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div className="card card-empty">
            <div className="empty">
              <span className="empty-icon">
                <Icon name="film" size={24} />
              </span>
              <p className="empty-title">
                {swipedCount > 0 ? 'You’ve seen them all' : 'No movies match'}
              </p>
              <p className="empty-body">
                {swipedCount > 0
                  ? 'That’s every film in the catalog. Add more, or loosen the filters.'
                  : 'Loosen the genre or year filters to bring cards back.'}
              </p>
              {filtersActive ? (
                <button type="button" className="btn btn-secondary" onClick={() => setFiltersOpen(true)}>
                  Adjust filters
                </button>
              ) : (
                liked.length > 0 && (
                  <button type="button" className="btn btn-secondary" onClick={() => navigate('/liked')}>
                    See your likes
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div className="actions">
        <button
          type="button"
          className="action action-nope"
          onClick={() => cardRef.current?.fling('left')}
          disabled={!current || loading}
          aria-label="Dislike"
        >
          <Icon name="x" size={28} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className="action action-sm"
          onClick={handleUndo}
          disabled={!canUndo}
          aria-label="Undo last swipe"
        >
          <Icon name="undo" size={20} />
        </button>
        <button
          type="button"
          className="action action-like"
          onClick={() => cardRef.current?.fling('right')}
          disabled={!current || loading}
          aria-label="Like"
        >
          <Icon name="heart" size={26} filled />
        </button>
      </div>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setGenreId={setGenreId}
        setStartYear={setStartYear}
        setEndYear={setEndYear}
        matchCount={deck.deck.length}
      />
    </div>
  );
}
