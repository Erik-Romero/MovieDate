import React, { useState } from 'react';
import { neon } from './lib/neon';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const validate = () => {
    if (!email.trim() || !password) return 'Email and password are both required.';
    if (isSignup && !name.trim()) return 'Pick a display name.';
    if (isSignup && password.length < 8) return 'Password needs at least 8 characters.';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError('');
    try {
      // Better Auth can either return { error } or throw depending on the
      // failure. Handle both rather than betting on one.
      const res = isSignup
        ? await neon.auth.signUp.email({
            email: email.trim(),
            password,
            name: name.trim(),
          })
        : await neon.auth.signIn.email({
            email: email.trim(),
            password,
          });

      if (res?.error) {
        throw new Error(res.error.message || 'Authentication failed.');
      }
      // No redirect needed — useSession() in main.jsx picks up the new
      // session and swaps this screen out.
    } catch (err) {
      setError(err?.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const social = async (provider) => {
    setError('');
    try {
      await neon.auth.signIn.social({ provider, callbackURL: '/' });
    } catch (err) {
      setError(err?.message || `Could not sign in with ${provider}.`);
    }
  };

  return (
    <div className="screen screen-center">
      <div className="login">
        <h1 className="brand brand-lg">Movie Tourney</h1>
        <p className="brand-sub">Swipe with your group, meet in the middle.</p>

        <div className="mode-toggle" role="tablist">
          <button
            role="tab"
            aria-selected={!isSignup}
            className={`tab ${!isSignup ? 'tab-on' : ''}`}
            onClick={() => switchMode('signin')}
          >
            Sign in
          </button>
          <button
            role="tab"
            aria-selected={isSignup}
            className={`tab ${isSignup ? 'tab-on' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="login-form">
          {isSignup && (
            <>
              <label className="label" htmlFor="name">
                Display name
              </label>
              <input
                id="name"
                className="field field-block"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="erik"
                autoComplete="nickname"
                disabled={busy}
              />
            </>
          )}

          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field field-block"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            disabled={busy}
          />

          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="field field-block"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? 'at least 8 characters' : ''}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            disabled={busy}
          />

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Working\u2026' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {/* Requires enabling the provider in Neon Console -> Auth -> Configuration.
            Delete this block if you're staying email-only. */}
        <div className="divider">
          <span>or</span>
        </div>

        <div className="social-row">
          <button className="btn btn-ghost btn-block" onClick={() => social('google')} disabled={busy}>
            Continue with Google
          </button>
          <button className="btn btn-ghost btn-block" onClick={() => social('github')} disabled={busy}>
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
