import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Login from './Login.jsx';
import Liked from './Liked.jsx';
import { useSwipeDeck } from './useSwipeDeck.js';
import './index.css';

function Main() {
  const [userInfo, setUserInfo] = useState(null);

  // Lifted here so /liked can read the same swipes /  writes. This is the
  // job Supabase was doing before.
  const deck = useSwipeDeck();

  if (!userInfo) return <Login onJoin={setUserInfo} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App userInfo={userInfo} deck={deck} />} />
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
