'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Trophy, User, MessageSquare } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function MobileNav() {
  const pathname = usePathname();

  const isChatOpen = useCasinoStore(state => state.isChatOpen);
  const setIsChatOpen = useCasinoStore(state => state.setIsChatOpen);
  
  const navItems = [
    { icon: <Home size={22} />, label: 'Lobby', path: '/' },
    { icon: <Gamepad2 size={22} />, label: 'Games', path: '/games' },
    { icon: <MessageSquare size={22} />, label: 'Chat', onClick: () => setIsChatOpen(!isChatOpen) },
    { icon: <Trophy size={22} />, label: 'Leader', path: '/leaderboard' },
    { icon: <User size={22} />, label: 'Vault', path: '/vault' },
  ];

  return (
    <nav className="glass mobile-only" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'calc(72px + env(safe-area-inset-bottom))',
      zIndex: 1000,
      borderTop: '1px solid var(--glass-border)',
      background: 'hsla(var(--bg-color), 0.8)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 10px env(safe-area-inset-bottom) 10px',
      paddingLeft: 'calc(10px + env(safe-area-inset-left))',
      paddingRight: 'calc(10px + env(safe-area-inset-right))',
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
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

        if (item.path) {
          return (
            <Link key={index} href={item.path} style={{ textDecoration: 'none', padding: '8px' }}>
              {content}
            </Link>
          );
        }
        
        return (
          <button key={index} onClick={item.onClick} style={{ 
            background: 'none', border: 'none', padding: '8px', cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent'
          }}>
            {content}
          </button>
        );
      })}
    </nav>
  );
}
