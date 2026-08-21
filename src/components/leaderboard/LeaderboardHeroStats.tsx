'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface LeaderboardHeroStatsProps {
  totalWagered: number;
  activePlayersCount: number;
  topWinnerWager: number;
  topWinnerName: string;
  isMobile: boolean;
}

export function LeaderboardHeroStats({
  totalWagered,
  activePlayersCount,
  topWinnerWager,
  topWinnerName,
  isMobile,
}: LeaderboardHeroStatsProps) {
  const cards = [
    {
      title: 'GESAMTES VOLUMEN',
      value: `$${totalWagered.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      color: '#D4AF37',
    },
    {
      title: 'TOP HIGH ROLLER',
      value: topWinnerName
        ? `${topWinnerName} ($${topWinnerWager.toLocaleString('en-US', { maximumFractionDigits: 0 })})`
        : '—',
      color: '#10B981',
    },
    {
      title: 'AKTIVE SPIELER',
      value: `${activePlayersCount} High Roller`,
      color: '#ffffff',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '10px' : '12px',
      }}
    >
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            padding: isMobile ? '14px 16px' : '16px 20px',
            borderRadius: '14px',
            background:
              'linear-gradient(145deg, rgba(24, 24, 32, 0.7) 0%, rgba(12, 12, 18, 0.85) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.35)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            {c.title}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: isMobile ? '1.15rem' : '1.35rem',
              fontWeight: 900,
              color: c.color,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {c.value}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
