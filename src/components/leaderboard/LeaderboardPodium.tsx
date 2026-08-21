'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Trophy, Medal, Flame } from 'lucide-react';
import type { LeaderRow } from './LeaderboardStreamTable';

interface LeaderboardPodiumProps {
  topThree: LeaderRow[];
  isMobile: boolean;
}

export function LeaderboardPodium({ topThree, isMobile }: LeaderboardPodiumProps) {
  if (topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const podiumSlots = [
    {
      player: second,
      rank: 2,
      title: '2. PLATZ',
      color: '#C0C0C0',
      badgeBg: 'rgba(192, 192, 192, 0.15)',
      badgeBorder: 'rgba(192, 192, 192, 0.35)',
      height: isMobile ? '130px' : '150px',
      order: isMobile ? 2 : 1,
      icon: <Medal size={16} color="#C0C0C0" />,
      delay: 0.1,
    },
    {
      player: first,
      rank: 1,
      title: 'CHAMPION',
      color: '#FFD700',
      badgeBg: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)',
      badgeBorder: '#FFD700',
      height: isMobile ? '150px' : '180px',
      order: isMobile ? 1 : 2,
      icon: <Crown size={20} color="#FFD700" />,
      delay: 0.05,
    },
    {
      player: third,
      rank: 3,
      title: '3. PLATZ',
      color: '#CD7F32',
      badgeBg: 'rgba(205, 127, 50, 0.15)',
      badgeBorder: 'rgba(205, 127, 50, 0.35)',
      height: isMobile ? '120px' : '135px',
      order: 3,
      icon: <Trophy size={15} color="#CD7F32" />,
      delay: 0.15,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '12px' : '16px',
        alignItems: 'flex-end',
        margin: '8px 0 16px',
      }}
    >
      {podiumSlots.map((slot) => {
        if (!slot.player) return null;
        const isFirst = slot.rank === 1;

        return (
          <motion.div
            key={slot.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: slot.delay, duration: 0.35 }}
            style={{
              order: slot.order,
              position: 'relative',
              borderRadius: '16px',
              background: isFirst
                ? 'linear-gradient(180deg, rgba(30, 26, 18, 0.95) 0%, rgba(14, 14, 20, 0.98) 100%)'
                : 'linear-gradient(180deg, rgba(22, 24, 32, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
              border: isFirst
                ? '1.5px solid rgba(255, 215, 0, 0.5)'
                : `1px solid ${slot.badgeBorder}`,
              boxShadow: isFirst
                ? '0 12px 36px rgba(212, 175, 55, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                : '0 8px 24px rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(16px)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: slot.height,
            }}
          >
            {/* Top Badge & Icon */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: slot.badgeBg,
                  border: `1px solid ${slot.badgeBorder}`,
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  color: slot.color,
                  letterSpacing: '0.04em',
                }}
              >
                {slot.icon}
                <span>{slot.title}</span>
              </div>
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                LVL {slot.player.level} • {slot.player.rank}
              </span>
            </div>

            {/* Player Name */}
            <div style={{ margin: '8px 0' }}>
              <div
                style={{
                  fontSize: isFirst ? '1.15rem' : '1rem',
                  fontWeight: 1000,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {slot.player.username}
              </div>
              {isFirst && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: '#FFD700', fontSize: '0.6rem', fontWeight: 800 }}>
                  <Flame size={10} />
                  <span>SPIEL-LEADER DER WOCHE</span>
                </div>
              )}
            </div>

            {/* Financial Stats */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase' }}>
                  EINSATZ
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: isFirst ? '0.95rem' : '0.85rem',
                    fontWeight: 900,
                    color: slot.color,
                  }}
                >
                  ${slot.player.total_wagered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {slot.player.biggest_win > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase' }}>
                    TOP WIN
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#10b981',
                    }}
                  >
                    +${slot.player.biggest_win.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
