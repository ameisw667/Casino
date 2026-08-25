'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';

interface PersonalRankBarProps {
  username: string;
  rank: string;
  level: number;
  wagered: number;
}

export function PersonalRankBar({ username, rank, level, wagered }: PersonalRankBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        position: 'sticky',
        bottom: '16px',
        zIndex: 35,
        background: '#0F131C',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        borderRadius: '14px',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UserCheck size={15} color="#D4AF37" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
            {username || 'VIP Spieler'}
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              color: '#D4AF37',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              padding: '2px 7px',
              borderRadius: '4px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
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
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 800,
            color: '#FFFFFF',
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
