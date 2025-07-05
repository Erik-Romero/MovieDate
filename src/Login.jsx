import React, { useState } from 'react';

export default function GroupJoin({ onJoin }) {
  const [group, setGroup] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (group.trim() && username.trim()) {
      onJoin({ group: group.trim(), username: username.trim() });
    } else {
      alert('Please enter both a group name and a username.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111',
        color: '#fff',
        padding: '2rem',
      }}
    >
      <h1> Join a Movie Group</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
        <input
          type="text"
          placeholder="Group Name"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          style={{ padding: '0.75rem', fontSize: '1rem' }}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '0.75rem', fontSize: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.75rem', fontSize: '1rem' }}>Join</button>
      </form>
    </div>
  );
}
