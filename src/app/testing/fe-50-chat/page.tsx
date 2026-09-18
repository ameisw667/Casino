'use client';

import React, { useEffect } from 'react';
import { GlobalChat } from '@/components/social/GlobalChat';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function ChatTestingPage() {
  const setIsChatOpen = useCasinoStore((s) => s.setIsChatOpen);
  const setIsMobile = useCasinoStore((s) => s.setIsMobile);

  useEffect(() => {
    setIsMobile(false);
    setIsChatOpen(true);
  }, [setIsChatOpen, setIsMobile]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0E14',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ color: '#D4AF37', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.1em' }}>
          CASINO ROYALE CHAT DRAWER TEST
        </h1>
        <p style={{ color: '#88909d', fontSize: '0.875rem', marginTop: '8px' }}>
          Testing Magnetic Mini-Dock Quick Bar
        </p>
      </div>
      <GlobalChat />
    </div>
  );
}
