import React from 'react';
import { useNavigate } from 'react-router-dom';
import MovieRow from './MovieRow';

export default function Liked({ deck }) {
  const { liked, loading } = deck;
  const navigate = useNavigate();

  return (
    <div className="screen screen-scroll">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          &larr; Back
        </button>
        <h1 className="brand">Liked ({liked.length})</h1>
      </header>

      {loading ? (
        <div className="empty-state">
          <p className="empty-body">Loading…</p>
        </div>
      ) : liked.length === 0 ? (
        <div className="empty-state">
          <p className="empty-head">No likes yet</p>
          <p className="empty-body">Swipe right on something and it lands here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to swiping
          </button>
        </div>
      ) : (
        <ul className="rows">
          {liked.map((movie) => (
            <MovieRow key={movie.id} movie={movie} />
          ))}
        </ul>
      )}
    </div>
  );
}
