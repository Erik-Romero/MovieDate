import React from 'react';
import { useNavigate } from 'react-router-dom';
import Tournament from './Tournament';

// Solo bracket over your own likes. Tournament seeds once on mount, so hold it
// back until the deck has loaded — otherwise a refresh on /tournament seeds an
// empty list and shows "Not enough movies".
export default function SoloTournament({ deck }) {
  const navigate = useNavigate();
  if (deck.loading) {
    return (
      <div className="screen screen-center">
        <p className="empty-body">Loading your likes…</p>
      </div>
    );
  }
  return (
    <Tournament
      movies={deck.liked}
      title="Your bracket"
      preSeeded={false}
      onExit={() => navigate('/')}
    />
  );
}
