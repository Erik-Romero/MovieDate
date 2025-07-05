// src/main.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Login from './Login.jsx';

function Main() {
  const [userInfo, setUserInfo] = useState(null);

  return userInfo ? (
    <App userInfo={userInfo} />
  ) : (
    <Login onJoin={setUserInfo} />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
