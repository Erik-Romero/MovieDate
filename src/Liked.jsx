import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieRow from './MovieRow';

export default function Liked({ deck }) {
  const { liked, matches } = deck;
  const [tab, setTab] = useState('mine');
  const navigate = useNavigate();

  const showing = tab === 'mine' ? liked : matches;

  return (
    <div className="screen screen-scroll">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          &larr; Back
        </button>
        <div className="tabs">
          <button
            className={`tab ${tab === 'mine' ? 'tab-on' : ''}`}
            onClick={() => setTab('mine')}
          >
            Yours ({liked.length})
          </button>
          <button
            className={`tab ${tab === 'matches' ? 'tab-on' : ''}`}
            onClick={() => setTab('matches')}
          >
            Matches ({matches.length})
          </button>
        </div>
      </header>

      {showing.length === 0 ? (
        <div className="empty-state">
          <p className="empty-head">
            {tab === 'mine' ? 'No likes yet' : 'No matches yet'}
          </p>
          <p className="empty-body">
            {tab === 'mine'
              ? 'Swipe right on something and it lands here.'
              : 'Matches appear when you like a film someone in your group already liked.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to swiping
          </button>
        </div>
      ) : (
        <ul className="rows">
          {showing.map((movie) => (
            <MovieRow
              key={movie.id}
              movie={movie}
              matchedWith={movie.matchedWith ?? []}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
