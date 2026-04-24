'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Trophy, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: <Home size={24} />, label: 'Lobby', path: '/' },
    { icon: <Gamepad2 size={24} />, label: 'Games', path: '/games' },
    { icon: <Trophy size={24} />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <User size={24} />, label: 'Profile', path: '/vault' },
  ];

  return (
    <nav className="glass mobile-only" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '72px',
      zIndex: 1000,
      borderTop: '1px solid var(--glass-border)',
      background: 'hsla(var(--bg-color), 0.8)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 10px',
    }}>
      {navItems.map((item, index) => {
        const active = pathname === item.path;
        const content = (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: active ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
            transition: 'color 0.2s',
          }}>
            {item.icon}
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>{item.label}</span>
          </div>
        );

        return (
          <Link key={index} href={item.path} style={{ textDecoration: 'none', padding: '8px' }}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
