import React from 'react';
import { useNavigate } from 'react-router-dom';
import Tournament from './Tournament';
import LoadingScreen from './components/LoadingScreen';

// Solo bracket over your own likes, seeded by your ranking (deck.liked comes
// sorted best-first). Tournament seeds once on mount, so hold it back until
// the deck has loaded — otherwise a refresh on /tournament seeds an empty list
// and shows "Not enough movies".
export default function SoloTournament({ deck }) {
  const navigate = useNavigate();
  if (deck.loading) return <LoadingScreen label="Loading your likes" />;
  return (
    <Tournament
      movies={deck.liked}
      title="Your bracket"
      onExit={() => navigate('/liked')}
    />
  );
}
