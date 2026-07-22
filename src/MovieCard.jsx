import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Poster from './Poster';
import { genreNames } from './movies';

const THRESHOLD = 90; // px of horizontal travel before a swipe counts

export default function MovieCard({ movie, onSwipeLeft, onSwipeRight }) {
  const [drag, setDrag] = useState(null); // { x, settling }
  const [showDetails, setShowDetails] = useState(false);

  const commit = (direction) => {
    setDrag({ x: direction === 'left' ? -700 : 700, settling: true });
    // let the card fly off before the parent swaps in the next movie
    setTimeout(() => {
      direction === 'left' ? onSwipeLeft() : onSwipeRight();
    }, 260);
  };

  const handlers = useSwipeable({
    onSwiping: ({ deltaX, dir }) => {
      if (dir === 'Up' || dir === 'Down') return;
      setDrag({ x: deltaX, settling: false });
    },
    // read deltaX off the event rather than component state — reading state
    // here is what made the original version miss swipes intermittently
    onSwiped: ({ deltaX }) => {
      if (deltaX <= -THRESHOLD) commit('left');
      else if (deltaX >= THRESHOLD) commit('right');
      else setDrag({ x: 0, settling: true });
    },
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true,
  });

  const x = drag?.x ?? 0;
  const rotation = x / 18;
  const intent = x <= -40 ? 'nope' : x >= 40 ? 'like' : null;

  return (
    <div
      {...handlers}
      className="card"
      style={{
        transform: `translateX(${x}px) rotate(${rotation}deg)`,
        transition: drag?.settling ? 'transform 260ms ease-out' : 'none',
      }}
    >
      <div className="card-art">
        <Poster movie={movie} />

        {intent && (
          <span className={`stamp stamp-${intent}`}>
            {intent === 'like' ? 'LIKE' : 'NOPE'}
          </span>
        )}

        <div className="card-scrim">
          <h2 className="card-title">{movie.title}</h2>
          <p className="card-meta">
            {movie.release_year} &middot; {movie.vote_average.toFixed(1)}/10
          </p>
          <div className="chips">
            {genreNames(movie.genres).map((name) => (
              <span key={name} className="chip">
                {name}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="card-toggle"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? 'Hide details' : 'Read more'}
          </button>

          {showDetails && <p className="card-overview">{movie.overview}</p>}
        </div>
      </div>
    </div>
  );
}
