import React, { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import Icon from './Icon';

// Avatar button in the header that opens a small account popover.
export default function AccountMenu({ userInfo, onSignOut }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!wrap.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="menu-wrap" ref={wrap}>
      <button
        type="button"
        className="avatar-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar name={userInfo.username} />
      </button>

      <div className="menu" role="menu" data-open={open} inert={!open}>
        <div className="menu-head">
          <p className="menu-name">{userInfo.username}</p>
          {userInfo.email && userInfo.email !== userInfo.username && (
            <p className="menu-email">{userInfo.email}</p>
          )}
        </div>
        <button type="button" className="menu-item" role="menuitem" onClick={onSignOut}>
          <Icon name="log-out" size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}
