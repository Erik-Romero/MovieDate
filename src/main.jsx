// src/main.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Login from './Login.jsx';
import Liked from './Liked.jsx';


function Main() {
  const [userInfo, setUserInfo] = useState(null);

  if (!userInfo) {
    return <Login onJoin={setUserInfo} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App userInfo={userInfo} />} />
        <Route path="/liked" element={<Liked groupId={userInfo.groupId} />} />
        {/* fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
