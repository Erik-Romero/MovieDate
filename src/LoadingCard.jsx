import React from 'react';

/**
 * Kept from the original so the shape is there when you reintroduce a real
 * data source. With a local array there's nothing to wait on, so App only
 * renders this during the brief artificial delay on filter change.
 */
export default function LoadingCard() {
  return (
    <div className="card card-loading">
      <span className="pulse-dot" />
      <span className="pulse-dot" />
      <span className="pulse-dot" />
    </div>
  );
}
