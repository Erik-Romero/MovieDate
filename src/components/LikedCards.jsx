import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';


const GENRE_MAP = {
  28: 'Action',
  35: 'Comedy',
  18: 'Drama',
  27: 'Horror',
  10749: 'Romance',
};

export default function LikedCard({ movie }) {
    const genreIds = movie.genre_ids || movie.genres || [];
    const genreNames = genreIds.map((id) => GENRE_MAP[id] || id).filter(Boolean);
  
    const [swipeStyle, setSwipeStyle] = useState({});
    
    const [showLabel, setShowLabel] = useState(null);
  
    
  
    return (
      <div
        
        style={{
          width: '200px',
          height: '450px',
          borderRadius: '20px',
          backgroundColor: '#2a2a2a',
          color: '#ffffff',
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          overflowY: 'auto',
          
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
         
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
              <strong>Year:</strong> {movie.release_year || movie.release_date?.split('-')[0] || 'N/A'}
            </p>
            <p style={{ fontSize: '0.9rem' }}>{movie.overview || 'No description available.'}</p>
            <p><strong>User Score:</strong> {movie.vote_average || 'N/A'}/10</p>
            <p><strong>Popularity:</strong> {movie.popularity || 'N/A'}/10</p>
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
  