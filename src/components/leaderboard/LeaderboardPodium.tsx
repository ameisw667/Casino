'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LeaderRow } from './LeaderboardStreamTable';

interface LeaderboardPodiumProps {
  topThree: LeaderRow[];
  isMobile: boolean;
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.split(/[._\s-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function LeaderboardPodium({ topThree, isMobile }: LeaderboardPodiumProps) {
  if (topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const cards = [
    {
      player: second,
      rank: 2,
      rankLabel: 'Platz 2',
      rankBadgeBg: '#262626',
      rankBadgeColor: '#E5E5E5',
      borderColor: '#262626',
      cardBg: '#121212',
      order: isMobile ? 2 : 1,
      delay: 0.05,
    },
    {
      player: first,
      rank: 1,
      rankLabel: 'Champion',
      rankBadgeBg: 'rgba(212, 175, 55, 0.15)',
      rankBadgeColor: '#D4AF37',
      borderColor: 'rgba(212, 175, 55, 0.4)',
      cardBg: '#141414',
      order: isMobile ? 1 : 2,
      delay: 0.02,
    },
    {
      player: third,
      rank: 3,
      rankLabel: 'Platz 3',
      rankBadgeBg: '#262626',
      rankBadgeColor: '#D97706',
      borderColor: '#262626',
      cardBg: '#121212',
      order: 3,
      delay: 0.08,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1.08fr 1fr',
        gap: isMobile ? '12px' : '16px',
        alignItems: isMobile ? 'stretch' : 'flex-end',
        margin: '4px 0 12px',
      }}
    >
      {cards.map((card) => {
        if (!card.player) return null;
        const isFirst = card.rank === 1;
        const initials = getInitials(card.player.username);

        return (
          <motion.div
            key={card.rank}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay, duration: 0.2 }}
            style={{
              order: card.order,
              borderRadius: '14px',
              background: card.cardBg,
              border: `1px solid ${card.borderColor}`,
              boxShadow: isFirst ? '0 10px 30px rgba(0, 0, 0, 0.6)' : '0 4px 20px rgba(0, 0, 0, 0.3)',
              padding: isMobile ? '16px' : isFirst ? '22px 24px' : '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Header: Rank Chip and Level */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: card.rankBadgeBg,
                  color: card.rankBadgeColor,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                {card.rankLabel}
              </span>

              <span style={{ fontSize: '0.72rem', color: '#737373', fontWeight: 500 }}>
                {card.player.rank} · Lv. {card.player.level}
              </span>
            </div>

            {/* Player Info with Monogram Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: isFirst ? '44px' : '38px',
                  height: isFirst ? '44px' : '38px',
                  borderRadius: '50%',
                  background: isFirst ? 'rgba(212, 175, 55, 0.2)' : '#1F1F1F',
                  border: isFirst ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid #2E2E2E',
                  color: isFirst ? '#D4AF37' : '#D4D4D4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isFirst ? '0.9rem' : '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: isFirst ? '1.25rem' : '1.05rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {card.player.username}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#737373', marginTop: '1px' }}>
                  Höchster Gewinn: +${card.player.biggest_win.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Financial Hero: Total Wagered */}
            <div
              style={{
                paddingTop: '12px',
                borderTop: '1px solid #1F1F1F',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: '#737373', fontWeight: 500 }}>
                Einsatz gesamt
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: isFirst ? '1.15rem' : '1rem',
                  fontWeight: 700,
                  color: isFirst ? '#D4AF37' : '#FFFFFF',
                  letterSpacing: '-0.02em',
                }}
              >
                ${card.player.total_wagered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
