import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Login from './Login.jsx';
import Liked from './Liked.jsx';
import { useAuth } from './lib/neon.js';
import { useSwipeDeck } from './hooks/useSwipeDeck.js';
import './index.css';

function Main() {
  const { user, isPending, signOut } = useAuth();
  const deck = useSwipeDeck();

  // isPending is true on first paint while the SDK checks for an existing
  // session. Rendering <Login /> during it makes the form flash for anyone
  // already signed in.
  if (isPending) {
    return (
      <div className="screen screen-center">
        <div className="card card-loading">
          <span className="pulse-dot" />
          <span className="pulse-dot" />
          <span className="pulse-dot" />
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  const userInfo = {
    id: user.id,
    username: user.name || user.email,
    email: user.email,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<App userInfo={userInfo} deck={deck} onSignOut={signOut} />}
        />
        <Route path="/liked" element={<Liked deck={deck} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
