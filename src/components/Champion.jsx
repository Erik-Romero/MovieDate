import React from 'react';
import Poster from './Poster';
import Icon from './Icon';

// The end of a bracket. Rare enough to earn a little ceremony: a staggered
// entrance and one pass of light across the poster.
export default function Champion({ movie, subtitle, children }) {
  return (
    <div className="screen screen-center">
      <div className="champion">
        <p className="kicker champion-kicker">
          <Icon name="crown" size={14} />
          Winner
        </p>
        <div className="champion-art">
          <Poster movie={movie} />
        </div>
        <h1 className="champion-title">{movie.title}</h1>
        <p className="champion-sub">{subtitle}</p>
        <div className="champion-actions">{children}</div>
      </div>
    </div>
  );
}
