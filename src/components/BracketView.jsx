import React from 'react';
import Poster from './Poster';
import Avatar from './Avatar';
import Icon from './Icon';
import { roundName } from '../lib/bracket';

function Side({ movie, seed, won, decided, voters }) {
  const state = !decided ? 'open' : won ? 'won' : 'lost';
  return (
    <div className={`bout-side bout-side-${state}`}>
      <span className="bout-art">
        <Poster movie={movie} lazy />
      </span>
      <span className="bout-main">
        <span className="bout-title">{movie.title}</span>
        <span className="bout-meta">
          {seed != null && <span>#{seed}</span>}
          {movie.release_year && <span>{movie.release_year}</span>}
        </span>
        {voters && voters.length > 0 && (
          <span className="bout-voters">
            {voters.map((v) => (
              <span key={v.key} className="voter">
                <Avatar name={v.name} small />
                {v.isYou ? 'You' : v.name}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="bout-end">
        {voters && <span className="bout-count">{voters.length}</span>}
        {state === 'won' && (
          <span className="bout-check" aria-label="Advanced">
            <Icon name="check" size={14} strokeWidth={3} />
          </span>
        )}
      </span>
    </div>
  );
}

function verdict(m, votesA, votesB) {
  if (m.winnerId == null) return 'Not played';
  const [winner, loser] = m.winnerId === m.a.id ? [m.a, m.b] : [m.b, m.a];
  const line = `${winner.title} knocked out ${loser.title}`;
  if (!m.votes) return line;
  if (m.votes.length === 0) return `${line} · no votes cast`;
  const [w, l] = m.winnerId === m.a.id ? [votesA, votesB] : [votesB, votesA];
  return `${line} · ${w.length}–${l.length}`;
}

/**
 * The whole bracket after the fact: every round, who beat whom, and — for a
 * room — whose votes went where. Rounds read top to bottom, opening round
 * first, so it ends on the final.
 *
 * `rounds` is a list of rounds, each a list of
 *   { key, a, b, seedA, seedB, winnerId, votes: null | [{ key, name, movieId, isYou }] }
 * votes is null when there's nothing to show per vote (a solo run).
 */
export default function BracketView({ rounds, title, champion, onBack, loading = false, error = '' }) {
  return (
    <div className="screen screen-wide bracket">
      <header className="match-head">
        <button type="button" className="back-btn" onClick={onBack}>
          <Icon name="chevron-left" size={22} />
          Back
        </button>
        <div className="match-title">
          <span className="match-round">Bracket</span>
          {title && <span className="kicker">{title}</span>}
        </div>
        <span />
      </header>

      {champion && (
        <p className="bracket-champ">
          <Icon name="crown" size={14} />
          <span>
            <span className="kicker kicker-gold">Winner</span> {champion.title}
          </span>
        </p>
      )}

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <span className="loader bracket-loader" aria-label="Loading bracket">
          <span className="pulse-dot" />
          <span className="pulse-dot" />
          <span className="pulse-dot" />
        </span>
      )}

      {rounds.map((round, r) => (
        <section key={r} className="section bracket-round">
          <div className="page-head-row">
            <h2 className="title-lg">{roundName(round.length)}</h2>
            <span className="count">
              {round.length} {round.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
          <ol className="bouts">
            {round.map((m) => {
              const votesA = m.votes?.filter((v) => v.movieId === m.a.id) ?? null;
              const votesB = m.votes?.filter((v) => v.movieId === m.b.id) ?? null;
              const decided = m.winnerId != null;
              return (
                <li key={m.key} className="bout">
                  <Side
                    movie={m.a}
                    seed={m.seedA}
                    decided={decided}
                    won={m.winnerId === m.a.id}
                    voters={votesA}
                  />
                  <Side
                    movie={m.b}
                    seed={m.seedB}
                    decided={decided}
                    won={m.winnerId === m.b.id}
                    voters={votesB}
                  />
                  <p className="bout-verdict">{verdict(m, votesA ?? [], votesB ?? [])}</p>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
