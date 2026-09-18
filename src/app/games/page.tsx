'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCasinoStore } from '@/store/useCasinoStore';
import { GAMES, MIN_STAKE, LiveWinRibbon, Stat } from './_components';
import { WheelCarousel } from '@/components/casino/games-catalog/WheelCarousel';
import { ScrollTiltedGamesGrid } from '@/components/casino/games/ScrollTiltedGamesGrid';

export default function GamesPage() {
  const router = useRouter();
  const { isMobile, bets } = useCasinoStore();

  // Keyboard quick-launch: keys 1–5 open the corresponding game.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < GAMES.length) {
        router.push(GAMES[idx].path);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  const totalBets = bets.length;

  return (
    <div
      style={{
        maxWidth: '1400px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: isMobile ? '16px 16px 80px' : '12px 24px 32px',
      }}
    >
      {/* Monolith Header mit Live-Ticker */}
      <header
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: isMobile ? '9px 12px' : '10px 16px',
          borderRadius: '14px',
          border: '1px solid rgba(212, 175, 55, 0.18)',
          background:
            'linear-gradient(145deg, rgba(20, 24, 34, 0.82) 0%, rgba(10, 13, 20, 0.95) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(212, 175, 55, 0.12)',
        }}
      >
        {/* Ambient Top Glow Bar (Brand-Konsistenz mit WheelCarousel) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            opacity: 0.6,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontSize: isMobile ? '1.15rem' : '1.45rem',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              GAME CATALOG
            </h1>
          </div>

          <div style={{ display: 'flex', gap: isMobile ? '10px' : '16px', alignItems: 'center' }}>
            <Stat label="MIN STAKE" value={MIN_STAKE} highlight />
            <Stat label="YOUR ROUNDS" value={String(totalBets)} />
          </div>
        </div>

        {/* Live social-proof ribbon, konsolidiert in den Header */}
        <LiveWinRibbon inline />
      </header>

      {/* 3D Cylinder Selection Wheel als hervorgehobenes Highlight vor der Gesamtübersicht */}
      <WheelCarousel games={GAMES} isMobile={isMobile} />

      {/* 3D-Tilt & Specular Sheen Games Grid (Haupt-Spielauswahl) */}
      <ScrollTiltedGamesGrid games={GAMES} isMobile={isMobile} />
    </div>
  );
}
