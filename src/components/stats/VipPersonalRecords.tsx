'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { deriveVipRecords, type HistoryRow } from '@/lib/casino/stats-derivation';
import { Trophy, Zap, Flame, Sparkles } from 'lucide-react';

interface VipPersonalRecordsProps {
  loading: boolean;
  rows: HistoryRow[];
  isMobile: boolean;
}

export function VipPersonalRecords({ loading, rows, isMobile }: VipPersonalRecordsProps) {
  const records = useMemo(() => deriveVipRecords(rows), [rows]);

  const items = [
    {
      title: 'HÖCHSTER EINZELGEWINN',
      icon: <Trophy size={14} color="#FFD700" />,
      value: loading
        ? '…'
        : `+$${records.maxSingleWin.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: records.maxSingleWin.game ? records.maxSingleWin.game.toUpperCase() : 'NOCH OFFEN',
      color: '#FFD700',
      border: 'rgba(212, 175, 55, 0.3)',
      bg: 'rgba(212, 175, 55, 0.08)',
    },
    {
      title: 'MAX. MULTIPLIKATOR',
      icon: <Zap size={14} color="#10B981" />,
      value: loading ? '…' : `${records.maxMultiplier.multiplier.toFixed(2)}x`,
      sub: records.maxMultiplier.game ? records.maxMultiplier.game.toUpperCase() : 'NOCH OFFEN',
      color: '#10B981',
      border: 'rgba(16, 185, 129, 0.3)',
      bg: 'rgba(16, 185, 129, 0.08)',
    },
    {
      title: 'LÄNGSTE SIEGESSERIE',
      icon: <Flame size={14} color="#F59E0B" />,
      value: loading ? '…' : `${records.longestWinStreak} WINS`,
      sub: 'IN FOLGE GEWONNEN',
      color: '#F59E0B',
      border: 'rgba(245, 158, 11, 0.3)',
      bg: 'rgba(245, 158, 11, 0.08)',
    },
    {
      title: 'GLÜCKS-INDEX (RTP-DELTA)',
      icon: <Sparkles size={14} color="#60A5FA" />,
      value: loading ? '…' : `${records.luckIndex}%`,
      sub: records.luckIndex >= 100 ? 'ÜBERDURCHSCHNITTLICH' : 'STATISTISCHE NORM',
      color: '#60A5FA',
      border: 'rgba(96, 165, 250, 0.3)',
      bg: 'rgba(96, 165, 250, 0.08)',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        padding: isMobile ? '16px' : '20px 24px',
        borderRadius: '16px',
        background:
          'linear-gradient(145deg, rgba(22, 24, 32, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            fontSize: '0.64rem',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.45)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          PERSÖNLICHE REKORDE & BEST-RUNS (SP-4)
        </div>
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 800,
            color: '#D4AF37',
            background: 'rgba(212, 175, 55, 0.1)',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid rgba(212, 175, 55, 0.25)',
          }}
        >
          VIP MEILENSTEINE
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '12px',
        }}
      >
        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: it.bg,
              border: `1px solid ${it.border}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {it.icon}
              <span
                style={{
                  fontSize: '0.58rem',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {it.title}
              </span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: isMobile ? '1.15rem' : '1.35rem',
                fontWeight: 950,
                color: it.color,
                lineHeight: 1.1,
              }}
            >
              {it.value}
            </div>
            <div
              style={{
                fontSize: '0.6rem',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '0.04em',
              }}
            >
              {it.sub}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
