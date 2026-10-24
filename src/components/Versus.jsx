import React from 'react';
import Poster from './Poster';
import Icon from './Icon';
import { genreNames } from '../data/movies';

function Contender({ movie, seed, state, onPick }) {
  const genres = genreNames(movie.genres).slice(0, 3);
  return (
    <button
      type="button"
      className={`contender contender-${state}`}
      onClick={() => onPick(movie)}
      disabled={state !== 'idle'}
      aria-label={`${movie.title}${movie.release_year ? `, ${movie.release_year}` : ''}`}
    >
      <span className="contender-art">
        <Poster movie={movie} />
        {seed != null && <span className="contender-seed">#{seed}</span>}
        <span className="contender-check" aria-hidden="true">
          <Icon name="check" size={26} strokeWidth={3} />
        </span>
      </span>
      <span className="contender-info">
        <span className="contender-title">{movie.title}</span>
        <span className="contender-year">
          {movie.release_year}
          {movie.vote_average != null && (
            <span className="rating">
              <Icon name="star" size={10} />
              {Number(movie.vote_average).toFixed(1)}
            </span>
          )}
        </span>
        {/* only shown in the stacked (phone) layout, where there's room */}
        {genres.length > 0 && <span className="contender-genres">{genres.join(' · ')}</span>}
        {movie.overview && <span className="contender-overview">{movie.overview}</span>}
      </span>
    </button>
  );
}

/**
 * The two films in a matchup; tap the one that advances. `picked` is the id
 * of the chosen movie while the pick is being recorded — the winner gets the
 * gold ring and check, the other steps back.
 *
 * Lays out as a side-by-side face-off when there's width, and as two stacked
 * cards with synopsis on tall, narrow screens.
 */
export default function Versus({ a, b, seeds = [], picked = null, onPick }) {
  const stateOf = (m) => (picked == null ? 'idle' : picked === m.id ? 'won' : 'lost');
  return (
    <div className="versus">
      <div className="versus-inner">
        <Contender movie={a} seed={seeds[0]} state={stateOf(a)} onPick={onPick} />
        <span className="versus-mark" aria-hidden="true">
          vs
        </span>
        <Contender movie={b} seed={seeds[1]} state={stateOf(b)} onPick={onPick} />
      </div>
    </div>
  );
}
