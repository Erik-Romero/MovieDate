import React, { useState } from 'react';
import { neon } from './lib/neon';

// Better Auth error codes -> something a person can act on. Anything not
// listed falls back to the server's own message.
const AUTH_ERRORS = {
  INVALID_ORIGIN:
    "This site's domain isn't trusted by the login server yet. Add it in Neon Console → Auth → Configuration → Domains.",
  USER_ALREADY_EXISTS: 'An account with that email already exists. Try signing in instead.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'An account with that email already exists. Try signing in instead.',
  INVALID_EMAIL_OR_PASSWORD: 'That email and password don’t match.',
  EMAIL_NOT_VERIFIED: 'Verify your email first — check your inbox for the link.',
  PASSWORD_TOO_SHORT: 'Password needs at least 8 characters.',
  PASSWORD_TOO_LONG: 'That password is too long.',
};

function describeAuthError(err) {
  if (!err) return 'Something went wrong. Try again.';
  if (err.code && AUTH_ERRORS[err.code]) return AUTH_ERRORS[err.code];
  if (err.status === 429) return 'Too many attempts. Wait a few seconds and try again.';
  // fetch() itself failing (offline, DNS, blocked by CORS) surfaces as a TypeError
  if (err instanceof TypeError || /failed to fetch|network/i.test(err.message ?? '')) {
    return 'Couldn’t reach the login server. Check your connection and try again.';
  }
  return err.message || 'Something went wrong. Try again.';
}

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setNotice('');
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
    setNotice('');
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
        setError(describeAuthError(res.error));
        return;
      }

      // With email verification turned on, sign-up succeeds but hands back no
      // session token — useSession() never flips, so say what happened instead
      // of leaving the form sitting there.
      if (isSignup && !res?.data?.token && !res?.data?.session) {
        setMode('signin');
        setPassword('');
        setNotice('Account created. Check your inbox to verify your email, then sign in.');
      }
      // Otherwise no redirect needed — useSession() in main.jsx picks up the
      // new session and swaps this screen out.
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const social = async (provider) => {
    setError('');
    setNotice('');
    try {
      // Absolute on purpose: the auth server lives on a different domain, so a
      // bare '/' would send people back to Neon's host instead of this app.
      const res = await neon.auth.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/`,
      });
      if (res?.error) setError(describeAuthError(res.error));
    } catch (err) {
      setError(describeAuthError(err));
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

          {notice && (
            <p className="hint" role="status">
              {notice}
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
