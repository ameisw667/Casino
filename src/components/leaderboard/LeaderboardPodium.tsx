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

  const slots = [
    {
      player: second,
      rank: 2,
      label: '2. PLATZ',
      sublabel: 'SILVER RUNNER-UP',
      color: '#CBD5E1',
      accentBg: 'linear-gradient(180deg, rgba(203, 213, 225, 0.12) 0%, rgba(14, 15, 22, 0.95) 100%)',
      borderColor: 'rgba(203, 213, 225, 0.3)',
      podiumHeight: isMobile ? 'auto' : '230px',
      order: isMobile ? 2 : 1,
      icon: <Medal size={18} color="#CBD5E1" />,
      pedestalHeight: '28px',
      pedestalNum: '2',
      delay: 0.08,
    },
    {
      player: first,
      rank: 1,
      label: 'CHAMPION',
      sublabel: 'HIGH ROLLER OF THE WEEK',
      color: '#FFD700',
      accentBg: 'linear-gradient(180deg, rgba(42, 34, 18, 0.95) 0%, rgba(14, 12, 18, 0.98) 100%)',
      borderColor: 'rgba(212, 175, 55, 0.55)',
      podiumHeight: isMobile ? 'auto' : '275px',
      order: isMobile ? 1 : 2,
      icon: <Crown size={22} color="#FFD700" />,
      pedestalHeight: '38px',
      pedestalNum: '1',
      delay: 0.03,
    },
    {
      player: third,
      rank: 3,
      label: '3. PLATZ',
      sublabel: 'BRONZE FINISHER',
      color: '#F59E0B',
      accentBg: 'linear-gradient(180deg, rgba(245, 158, 11, 0.12) 0%, rgba(14, 15, 22, 0.95) 100%)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      podiumHeight: isMobile ? 'auto' : '210px',
      order: 3,
      icon: <Trophy size={16} color="#F59E0B" />,
      pedestalHeight: '22px',
      pedestalNum: '3',
      delay: 0.12,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1.15fr 1fr',
        gap: isMobile ? '12px' : '16px',
        alignItems: isMobile ? 'stretch' : 'flex-end',
        margin: '10px 0 20px',
        position: 'relative',
      }}
    >
      {slots.map((slot) => {
        if (!slot.player) return null;
        const isFirst = slot.rank === 1;

        return (
          <motion.div
            key={slot.rank}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: slot.delay, duration: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            style={{
              order: slot.order,
              position: 'relative',
              borderRadius: '16px',
              background: slot.accentBg,
              border: `1px solid ${slot.borderColor}`,
              boxShadow: isFirst
                ? '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.15), inset 0 1px 0 rgba(255, 215, 0, 0.25)'
                : '0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: isMobile ? '16px' : isFirst ? '22px 20px 16px' : '18px 18px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: slot.podiumHeight,
            }}
          >
            {/* Top Crown/Medal Badge & Level */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: isFirst ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${slot.borderColor}`,
                    fontSize: isFirst ? '0.68rem' : '0.62rem',
                    fontWeight: 900,
                    color: slot.color,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {slot.icon}
                  <span>{slot.label}</span>
                </div>

                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.45)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  LVL {slot.player.level} • {slot.player.rank}
                </span>
              </div>

              {/* Player Username */}
              <div
                style={{
                  fontSize: isFirst ? '1.35rem' : '1.1rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '4px',
                }}
              >
                {slot.player.username}
              </div>

              {isFirst && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#FFD700',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    marginTop: '3px',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Flame size={11} color="#FFD700" />
                  <span>SPIEL-LEADER DER PLATZIERUNG</span>
                </div>
              )}
            </div>

            {/* Financial Metrics */}
            <div style={{ marginTop: '12px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    EINSATZ
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: isFirst ? '1.05rem' : '0.9rem',
                      fontWeight: 900,
                      color: slot.color,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    ${slot.player.total_wagered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    TOP WIN
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: isFirst ? '1.05rem' : '0.9rem',
                      fontWeight: 900,
                      color: '#10B981',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    +${slot.player.biggest_win.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Physical Stepped Pedestal Base */}
              {!isMobile && (
                <div
                  style={{
                    height: slot.pedestalHeight,
                    borderRadius: '8px',
                    background: isFirst
                      ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.3) 0%, rgba(140, 110, 25, 0.5) 100%)'
                      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: `1px solid ${slot.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 900,
                    fontSize: isFirst ? '1.1rem' : '0.9rem',
                    color: slot.color,
                    letterSpacing: '0.1em',
                  }}
                >
                  #{slot.pedestalNum}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
