import React from 'react';
import { hueFor } from '../lib/hue';

/**
 * Resolves artwork in three steps:
 *   1. movie.poster      — use as-is (full URL, or a local path like /posters/x.jpg)
 *   2. movie.poster_path — TMDB-style path, gets the CDN prefix
 *   3. neither           — generated one-sheet with the title set large
 *
 * Step 3 is the default in this POC, so it should look deliberate rather than
 * like a broken image. The parent owns the corner radius and clipping.
 */

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export default function Poster({ movie, lazy = false }) {
  const src = movie.poster
    ? movie.poster
    : movie.poster_path
      ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
      : null;

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="poster-img"
        draggable={false}
        loading={lazy ? 'lazy' : undefined}
        decoding="async"
      />
    );
  }

  const hue = hueFor(movie.title);

  return (
    <div
      className="poster-fallback"
      style={{
        background: `linear-gradient(160deg,
          hsl(${hue} 48% 30%) 0%,
          hsl(${(hue + 32) % 360} 40% 17%) 55%,
          hsl(${(hue + 56) % 360} 34% 8%) 100%)`,
      }}
    >
      <span className="poster-fallback-year">{movie.release_year}</span>
      <span className="poster-fallback-title">{movie.title}</span>
    </div>
  );
}
