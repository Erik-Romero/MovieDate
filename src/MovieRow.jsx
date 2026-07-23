import React from 'react';
import Poster from './Poster';
import { genreNames } from './data/movies';


export default function MovieRow({ movie, matchedWith = [] }) {
  return (
    <li className="row">
      <div className="row-art">
        <Poster movie={movie} rounded />
      </div>

      <div className="row-body">
        <h3 className="row-title">{movie.title}</h3>
        <p className="row-meta">
          {movie.release_year} &middot; {movie.vote_average.toFixed(1)}/10
        </p>

        {matchedWith.length > 0 && (
          <p className="row-match">
            Also liked by {matchedWith.join(' and ')}
          </p>
        )}

        <div className="chips chips-sm">
          {genreNames(movie.genres).map((name) => (
            <span key={name} className="chip">
              {name}
            </span>
          ))}
        </div>

        <p className="row-overview">{movie.overview}</p>
      </div>
    </li>
  );
}
