import React from 'react';
import Poster from './Poster';
import Icon from './Icon';
import { genreNames } from '../data/movies';

export default function MovieRow({ movie, matchedWith = [] }) {
  const genres = genreNames(movie.genres);

  return (
    <li className="row">
      <div className="row-art">
        <Poster movie={movie} lazy />
      </div>

      <div className="row-body">
        <h3 className="row-title">{movie.title}</h3>
        <p className="row-meta">
          <span>{movie.release_year}</span>
          {movie.vote_average != null && (
            <span className="rating">
              <Icon name="star" size={11} />
              {Number(movie.vote_average).toFixed(1)}
            </span>
          )}
        </p>

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
