import React from 'react';

// Full-screen wait state. The label is optional and says what's loading.
export default function LoadingScreen({ label }) {
  return (
    <div className="screen screen-center" role="status" aria-live="polite">
      <span className="loader" aria-hidden="true">
        <span className="pulse-dot" />
        <span className="pulse-dot" />
        <span className="pulse-dot" />
      </span>
      <p className={label ? 'loader-label' : 'sr-only'}>{label || 'Loading'}</p>
    </div>
  );
}
