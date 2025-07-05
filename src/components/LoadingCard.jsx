import React from 'react';
export default function LoadingCard() {
  return (
    <div
      style={{
        width: '300px',
        height: '450px',
        borderRadius: '20px',
        backgroundColor: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#aaa',
        fontSize: '1.2rem',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      }}
    >
      Loading...
    </div>
  );
}