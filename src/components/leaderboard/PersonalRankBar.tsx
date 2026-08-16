'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface PersonalRankBarProps {
  username: string;
  rank: string;
  level: number;
  wagered: number;
}

export function PersonalRankBar({ username, rank, level, wagered }: PersonalRankBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        position: 'sticky',
        bottom: '20px',
        zIndex: 20,
        background: 'rgba(12, 12, 14, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 175, 55, 0.08)',
        borderRadius: '14px',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            fontSize: '0.58rem',
            fontWeight: 800,
            color: '#D4AF37',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            padding: '3px 8px',
            borderRadius: '4px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          DEIN RANG
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
            {username || 'VIP Spieler'}
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              color: 'rgba(255, 255, 255, 0.4)',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700,
            }}
          >
            LVL {level} • {rank}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
          Dein Einsatz:
        </span>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 900,
            color: '#D4AF37',
            fontSize: '1.05rem',
            letterSpacing: '-0.02em',
          }}
        >
          ${wagered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </motion.div>
  );
}
