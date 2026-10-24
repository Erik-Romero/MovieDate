import React from 'react';
import { hueFor } from '../lib/hue';

// Initial-letter circle; the hue comes from the name so each person keeps
// the same color across screens.
export default function Avatar({ name = '?', small = false }) {
  const hue = hueFor(name);
  return (
    <span
      className={`avatar ${small ? 'avatar-sm' : ''}`}
      style={{ background: `linear-gradient(150deg, hsl(${hue} 42% 40%), hsl(${(hue + 30) % 360} 40% 26%))` }}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}
