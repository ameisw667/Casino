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
      subtitle: 'Plattform-Einsatz gesamt',
      color: '#D4AF37',
    },
    {
      title: 'TOP HIGH ROLLER',
      value: topWinnerName ? topWinnerName : '—',
      subtitle: topWinnerName
        ? `$${topWinnerWager.toLocaleString('en-US', { maximumFractionDigits: 0 })} Wagered`
        : 'Kein Einsatz',
      color: '#FFFFFF',
    },
    {
      title: 'AKTIVE SPIELER',
      value: `${activePlayersCount}`,
      subtitle: 'High Roller in dieser Runde',
      color: '#FFFFFF',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 }}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '10px' : '14px',
      }}
    >
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            padding: isMobile ? '14px 16px' : '16px 20px',
            borderRadius: '14px',
            background: '#0F131C',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            {c.title}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: isMobile ? '1.15rem' : '1.3rem',
              fontWeight: 800,
              color: c.color,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {c.value}
          </div>
          <div
            style={{
              fontSize: '0.68rem',
              color: 'rgba(255, 255, 255, 0.35)',
              fontWeight: 500,
              marginTop: '3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {c.subtitle}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
