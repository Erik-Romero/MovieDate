import React from 'react';
import Poster from './Poster';
import Icon from './Icon';
import { genreNames } from '../data/movies';

export default function MovieRow({ movie, rank = null, watched, onToggleWatched, matchedWith = [] }) {
  const genres = genreNames(movie.genres);

  return (
    <li className="row">
      <div className="row-art">
        <Poster movie={movie} lazy />
        {rank != null && (
          <span className={`row-rank ${rank <= 3 ? 'row-rank-top' : ''}`} aria-label={`Ranked ${rank}`}>
            {rank}
          </span>
        )}
      </div>

      <div className="row-body">
        <h3 className="row-title">{movie.title}</h3>
        <div className="row-meta">
          <span>{movie.release_year}</span>
          {movie.vote_average != null && (
            <span className="rating">
              <Icon name="star" size={11} />
              {Number(movie.vote_average).toFixed(1)}
            </span>
          )}
          {onToggleWatched && (
            <button
              type="button"
              className="watch-toggle"
              aria-pressed={Boolean(watched)}
              onClick={onToggleWatched}
            >
              <Icon name={watched ? 'check' : 'eye'} size={13} strokeWidth={watched ? 2.8 : 2} />
              {watched ? 'Watched' : 'Not watched'}
            </button>
          )}
        </div>

        {matchedWith.length > 0 && (
          <p className="row-match">Also liked by {matchedWith.join(' and ')}</p>
        )}

        {genres.length > 0 && (
          <div className="chips chips-sm">
            {genres.map((name) => (
              <span key={name} className="chip">
                {name}
              </span>
            ))}
          </div>
        )}

        {movie.overview && <p className="row-overview">{movie.overview}</p>}
      </div>
    </li>
  );
}
