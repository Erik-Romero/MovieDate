import React from 'react';

/**
 * Resolves artwork in three steps:
 *   1. movie.poster      — use as-is (full URL, or a local path like /posters/x.jpg)
 *   2. movie.poster_path — TMDB-style path, gets the CDN prefix
 *   3. neither           — generated gradient with the title set large
 *
 * Step 3 is the default in this POC, so it should look deliberate rather than
 * like a broken image.
 */

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function hueFor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % 360;
  }
  return h;
}

export default function Poster({ movie, rounded = false }) {
  const src = movie.poster
    ? movie.poster
    : movie.poster_path
      ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
      : null;

  const radius = rounded ? '6px' : '0';

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="poster-img"
        style={{ borderRadius: radius }}
        draggable={false}
      />
    );
  }

  const hue = hueFor(movie.title);

  return (
    <div
      className="poster-fallback"
      style={{
        borderRadius: radius,
        background: `linear-gradient(150deg,
          hsl(${hue} 46% 26%) 0%,
          hsl(${(hue + 38) % 360} 38% 15%) 60%,
          hsl(${(hue + 60) % 360} 30% 9%) 100%)`,
      }}
    >
      <span className="poster-fallback-year">{movie.release_year}</span>
      <span className="poster-fallback-title">{movie.title}</span>
    </div>
  );
}
