import React from 'react';

// Card-shaped placeholder while the deck loads, so the layout doesn't jump
// when the first poster arrives.
export default function LoadingCard() {
  return (
    <div className="card card-skeleton" role="status" aria-label="Loading films">
      <div className="skeleton-lines" aria-hidden="true">
        <span className="skeleton-line" style={{ width: '70%', height: 22 }} />
        <span className="skeleton-line" style={{ width: '38%' }} />
        <span className="skeleton-line" style={{ width: '55%' }} />
      </div>
    </div>
  );
}
