import React, { useState } from 'react';

/**
 * Was: create-or-find user, create-or-find group, create membership, all in
 * Supabase (LoginHandler.js). Now it just captures two strings and hands them
 * up. Keeps the entry flow in place for when you wire a real backend back in.
 */
export default function Login({ onJoin }) {
  const [group, setGroup] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!group.trim() || !username.trim()) {
      setError('Both fields are needed to continue.');
      return;
    }
    onJoin({ username: username.trim(), group: group.trim() });
  };

  return (
    <div className="screen screen-center">
      <div className="login">
        <h1 className="brand brand-lg">ReelMatch</h1>
        <p className="brand-sub">Swipe with your group, meet in the middle.</p>

        <form onSubmit={submit} className="login-form">
          <label className="label" htmlFor="group">
            Group name
          </label>
          <input
            id="group"
            className="field field-block"
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              setError('');
            }}
            placeholder="friday-night"
            autoComplete="off"
          />

          <label className="label" htmlFor="username">
            Your name
          </label>
          <input
            id="username"
            className="field field-block"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="erik"
            autoComplete="off"
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block">
            Start swiping
          </button>
        </form>
      </div>
    </div>
  );
}
