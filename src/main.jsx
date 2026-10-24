import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './Login.jsx';
import SignedIn from './SignedIn.jsx';
import { useAuth } from './lib/neon.js';
import './index.css';

function Main() {
  const { user, isPending, signOut } = useAuth();

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

  // key: a different user means a fresh tree, so no state leaks between accounts.
  return <SignedIn key={user.id} user={user} onSignOut={signOut} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
