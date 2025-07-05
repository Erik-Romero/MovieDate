import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
const GENRE_MAP = {
  28: 'Action',
  35: 'Comedy',
  18: 'Drama',
  27: 'Horror',
  10749: 'Romance',
 
};
export default function MovieCard({ movie, onSwipeLeft, onSwipeRight }) {
  const genreNames = movie.genre_ids?.map((id) => GENRE_MAP[id]).filter(Boolean);
  const [swipeStyle, setSwipeStyle] = useState({});
  const [rotation, setRotation] = useState(0);
  const [showLabel, setShowLabel] = useState(null);

  const handleSwipeComplete = (direction) => {
    const offScreenX = direction === 'left' ? '-100vw' : '100vw';
    setSwipeStyle({
      transform: `translateX(${offScreenX}) rotate(${direction === 'left' ? -30 : 30}deg)`,
      transition: 'transform 0.3s ease',
    });
    setShowLabel(direction === 'left' ? 'DISLIKE' : 'LIKE');
    setTimeout(() => {
      setSwipeStyle({
        transform: 'translateX(0px) rotate(0deg)',
        transition: 'none',
      });
      setRotation(0);
      setShowLabel(null);
      direction === 'left' ? onSwipeLeft() : onSwipeRight();
    }, 300);
  };

  const handlers = useSwipeable({
    onSwiping: ({ deltaX }) => {
      const newRotation = deltaX / 10;
      setRotation(newRotation);
      setSwipeStyle({
        transform: `translateX(${deltaX}px) rotate(${newRotation}deg)`,
        transition: 'none',
      });
      setShowLabel(newRotation < -5 ? 'DISLIKE' : newRotation > 5 ? 'LIKE' : null);
    },
    onSwiped: () => {
      if (rotation <= -20) {
        handleSwipeComplete('left');
      } else if (rotation >= 20) {
        handleSwipeComplete('right');
      } else {
        setSwipeStyle({
          transform: 'translateX(0px) rotate(0deg)',
          transition: 'transform 0.3s ease',
        });
        setRotation(0);
        setShowLabel(null);
      }
    },
    trackTouch: true,
    trackMouse: true,
  });

  return (
    <div
      {...handlers}
      style={{
        width: '300px',
        height: '450px',
        borderRadius: '20px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        overflowY: 'auto',
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...swipeStyle,
      }}
    >
      {showLabel && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: showLabel === 'LIKE' ? '10px' : 'auto',
            right: showLabel === 'DISLIKE' ? '10px' : 'auto',
            padding: '0.5rem 1rem',
            backgroundColor: showLabel === 'LIKE' ? '#4CAF50' : '#f44336',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            borderRadius: '10px',
            opacity: 0.9,
            zIndex: 10,
          }}
        >
          {showLabel}
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <div
          style={{
            height: '450px',
            backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.poster_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div style={{ padding: '1rem', color: 'white', backgroundColor: '#111' }}>
          <h2 style={{ margin: '0 0 0.25rem 0' }}>{movie.title}</h2>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Year:</strong> {movie.release_date?.split('-')[0]}
          </p>
          <p style={{ fontSize: '0.9rem' }}>{movie.overview || 'No description available.'}</p>
          <p><strong>User Score:</strong> {movie.vote_average || 'N/A'}/10</p>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {genreNames.map((name) => (
              <span
                key={name}
                style={{
                  backgroundColor: '#444',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}