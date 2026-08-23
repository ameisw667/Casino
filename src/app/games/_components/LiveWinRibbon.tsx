'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

// ──── Live Social Proof Ribbon ────
export function LiveWinRibbon() {
  const { allBets } = useCasinoStore();

  const recentWins = React.useMemo(() => {
    const wins = [...allBets]
      .filter((b) => b.isWin && b.multiplier && b.payout > 0)
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 15);

    if (wins.length >= 5) return wins;

    const fallback = [
      {
        id: 'f1',
        user: 'SarahSlot',
        game: 'SLOTS',
        amount: 18,
        multiplier: 2.26,
        payout: 40.66,
        time: 'fallback',
        isWin: true,
      },
      {
        id: 'f2',
        user: 'CryptoKing',
        game: 'CRASH',
        amount: 21,
        multiplier: 4.2,
        payout: 88.2,
        time: 'fallback',
        isWin: true,
      },
      {
        id: 'f3',
        user: 'VibeCoder',
        game: 'ROULETTE',
        amount: 45,
        multiplier: 2.46,
        payout: 110.92,
        time: 'fallback',
        isWin: true,
      },
      {
        id: 'f4',
        user: 'NeonSniper',
        game: 'DICE',
        amount: 12,
        multiplier: 3.1,
        payout: 37.2,
        time: 'fallback',
        isWin: true,
      },
      {
        id: 'f5',
        user: 'HighRoller',
        game: 'BLACKJACK',
        amount: 100,
        multiplier: 2.5,
        payout: 250,
        time: 'fallback',
        isWin: true,
      },
    ];
    return [...wins, ...fallback].slice(0, 15);
  }, [allBets]);

  if (recentWins.length === 0) return null;

  const items = [...recentWins, ...recentWins];

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        background:
          'linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, rgba(0, 240, 255, 0.05) 100%)',
        padding: '10px 0',
      }}
      className="live-ribbon"
    >
      <div
        style={{
          display: 'flex',
          gap: '32px',
          width: 'max-content',
          animation: 'ribbonScroll 40s linear infinite',
        }}
      >
        {items.map((bet, idx) => (
          <div
            key={`${bet.id}-${idx}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'hsl(var(--text-muted))',
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            <span style={{ color: 'hsl(var(--success))' }}>{bet.user}</span>
            <span>won</span>
            <span style={{ color: '#fff', fontFamily: 'var(--font-mono), monospace' }}>
              ${bet.payout.toFixed(2)}
            </span>
            <span>@</span>
            <span style={{ color: '#D4AF37', fontFamily: 'var(--font-mono), monospace' }}>
              {bet.multiplier.toFixed(2)}x
            </span>
            <span>in</span>
            <span style={{ color: '#fff', textTransform: 'capitalize' }}>
              {bet.game.toLowerCase()}
            </span>
            <Clock size={12} color="hsl(var(--text-dim))" />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ribbonScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .live-ribbon:hover > div {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .live-ribbon > div { animation: none; }
        }
      `}</style>
    </div>
  );
}
