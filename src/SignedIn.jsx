import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Liked from './Liked.jsx';
import Rooms from './Rooms.jsx';
import Lobby from './Lobby.jsx';
import SoloTournament from './SoloTournament.jsx';
import Rank from './Rank.jsx';
import TabLayout from './components/TabLayout.jsx';
import { useSwipeDeck } from './hooks/useSwipeDeck.js';

/**
 * Everything behind the login screen. main.jsx renders this with
 * key={user.id}, so switching accounts throws the whole tree away — the swipe
 * deck included — and the next person starts from their own data instead of
 * inheriting whatever the last person had loaded.
 */
export default function SignedIn({ user, onSignOut }) {
  // Lives here rather than in main.jsx so it only runs once there's a session
  // (the Data API rejects requests without one) and resets per user.
  const deck = useSwipeDeck();

  const userInfo = {
    id: user.id,
    username: user.name || user.email,
    email: user.email,
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Home screens share the tab bar; ranking, brackets and lobbies are full-screen. */}
        <Route element={<TabLayout likedCount={deck.liked.length} />}>
          <Route
            path="/"
            element={<App userInfo={userInfo} deck={deck} onSignOut={onSignOut} />}
          />
          <Route path="/liked" element={<Liked deck={deck} />} />
          <Route path="/rooms" element={<Rooms userInfo={userInfo} />} />
        </Route>
        <Route path="/tournament" element={<SoloTournament deck={deck} />} />
        <Route path="/rank" element={<Rank deck={deck} />} />
        <Route path="/room/:id" element={<Lobby />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
