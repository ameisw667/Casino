'use client';

import React from 'react';
import Image from 'next/image';
import { resolvePlayerAvatar } from '@/lib/casino/player-avatar';
import { motion } from 'framer-motion';

interface PersonalRankBarProps {
  username: string;
  rank: string;
  level: number;
  wagered: number;
}

export function PersonalRankBar({ username, rank, level, wagered }: PersonalRankBarProps) {
  const avatar = resolvePlayerAvatar(username);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        position: 'sticky',
        bottom: '16px',
        zIndex: 35,
        background: '#141414',
        border: '1px solid #2A2A2A',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
        borderRadius: '12px',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      {/* Left: User Avatar & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#222222',
            border: '1px solid #333333',
            color: '#D4AF37',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          <Image
            src={avatar.src}
            alt={username || avatar.initials}
            fill
            sizes="40px"
            style={{ objectFit: 'cover' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
              {username || 'VIP Spieler'}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: '#D4AF37',
                fontWeight: 600,
              }}
            >
              {rank} · Lv. {level}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Personal Wagered */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '0.75rem', color: '#737373', fontWeight: 500 }}>Dein Einsatz</span>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
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
