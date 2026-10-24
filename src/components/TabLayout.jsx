import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Icon from './Icon';

const TABS = [
  { to: '/', label: 'Swipe', icon: 'clapperboard', end: true },
  { to: '/liked', label: 'Liked', icon: 'heart' },
  { to: '/rooms', label: 'Rooms', icon: 'users' },
];

/**
 * Shell for the three home screens: content scrolls above a fixed tab bar.
 * Focused flows (a bracket, a room's lobby) render outside it so nothing
 * competes with the decision on screen.
 */
export default function TabLayout({ likedCount = 0 }) {
  return (
    <div className="shell">
      <main className="shell-main">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Primary">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className="tab-link">
              <Icon name={t.icon} size={22} />
              <span>{t.label}</span>
              {t.to === '/liked' && likedCount > 0 && (
                <span className="tab-badge">{likedCount > 99 ? '99+' : likedCount}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
