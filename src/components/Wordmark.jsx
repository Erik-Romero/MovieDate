import React from 'react';
import { APP_NAME } from '../config';

// The app name in the display face, last word set in gold italic.
export default function Wordmark({ as = 'span', className = '' }) {
  const Tag = as;
  const i = APP_NAME.lastIndexOf(' ');
  return (
    <Tag className={`wordmark ${className}`.trim()}>
      {i > 0 ? (
        <>
          {APP_NAME.slice(0, i)} <em>{APP_NAME.slice(i + 1)}</em>
        </>
      ) : (
        APP_NAME
      )}
    </Tag>
  );
}
