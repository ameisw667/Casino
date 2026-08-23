'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ShieldCheck, Layers } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import {
  GAMES,
  CATEGORIES,
  type CategoryType,
  type GameMeta,
  MIN_STAKE,
  ElevatedGameCard,
  LiveWinRibbon,
  Stat,
} from './_components';

export default function GamesPage() {
  const router = useRouter();
  const { isMobile, bets } = useCasinoStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL');

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

  const filteredGames = useMemo(() => {
    if (selectedCategory === 'ALL') return GAMES;
    return GAMES.filter((g) =>
      g.tags.includes(selectedCategory as unknown as GameMeta['tags'][number]),
    );
  }, [selectedCategory]);

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
      {/* Monolith Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          padding: isMobile ? '14px 16px' : '18px 24px',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          background:
            'linear-gradient(145deg, rgba(24, 24, 32, 0.75) 0%, rgba(12, 12, 18, 0.9) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: '#D4AF37',
                fontSize: '0.58rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <Flame size={12} /> PROVABLY FAIR · 5 ORIGINALS
            </span>
          </div>
          <h1
            style={{
              fontSize: isMobile ? '1.4rem' : '1.75rem',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: 0,
            }}
          >
            GAME CATALOG
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Stat label="MIN STAKE" value={MIN_STAKE} highlight />
          <Stat label="YOUR ROUNDS" value={String(totalBets)} />
          {!isMobile && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <ShieldCheck size={12} />
              <span>INSTANT PAYOUT</span>
            </div>
          )}
        </div>
      </header>

      {/* Category Filter Tabs (Frosted Glass Pills) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
          <Layers size={14} color="#D4AF37" />
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
            }}
          >
            Filter:
          </span>
        </div>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                border: isActive ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.06) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: isActive ? '0 0 16px rgba(212, 175, 55, 0.22)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Live social-proof ribbon */}
      <LiveWinRibbon />

      {/* 3D-Tilt & Specular Sheen Games Grid with Hover Preview Animation */}
      <motion.div
        layout
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(2, minmax(0, 1fr))'
            : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: isMobile ? '12px' : '16px',
          alignItems: 'stretch',
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredGames.map((game, index) => (
            <ElevatedGameCard key={game.id} game={game} index={index} isMobile={isMobile} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
