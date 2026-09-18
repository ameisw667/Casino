'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, User, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useCasinoStore } from '@/store/useCasinoStore';
import { MagneticDock, type DockItem } from '@/components/casino/navigation/MagneticDock';

export default function MobileNav() {
  const pathname = usePathname();

  const isChatOpen = useCasinoStore((state) => state.isChatOpen);
  const setIsChatOpen = useCasinoStore((state) => state.setIsChatOpen);

  const navItems: DockItem[] = [
    {
      icon: <Home size={20} strokeWidth={2.2} />,
      label: 'Lobby',
      path: '/',
      isActive: pathname === '/',
    },
    {
      icon: <Gamepad2 size={20} strokeWidth={2.2} />,
      label: 'Games',
      path: '/games',
      isActive: pathname.startsWith('/games'),
    },
    {
      icon: <MessageSquare size={20} strokeWidth={2.2} />,
      label: 'Chat',
      onClick: () => setIsChatOpen(!isChatOpen),
      isActive: isChatOpen,
    },
    {
      icon: (
        <Image
          src="/images/2026-09-06_icon-trophy-record-quantum-gold_v001.png"
          alt="Leaderboard"
          width={20}
          height={20}
          aria-hidden
          style={{ objectFit: 'contain' }}
        />
      ),
      label: 'Leader',
      path: '/leaderboard',
      isActive: pathname === '/leaderboard',
    },
    {
      icon: <User size={20} strokeWidth={2.2} />,
      label: 'Vault',
      path: '/vault',
      isActive: pathname === '/vault',
    },
  ];

  return (
    <nav
      className="mobile-only"
      aria-label="Mobile Navigation Dock"
      style={{
        position: 'fixed',
        bottom: 'calc(10px + env(safe-area-inset-bottom))',
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        paddingLeft: 'calc(12px + env(safe-area-inset-left))',
        paddingRight: 'calc(12px + env(safe-area-inset-right))',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <MagneticDock items={navItems} />
      </div>
    </nav>
  );
}
