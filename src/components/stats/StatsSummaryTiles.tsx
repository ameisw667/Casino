'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface StatsSummaryTilesProps {
  loading: boolean;
  totalWagered: number;
  totalProfit: number;
  winRate: number;
  totalBets: number;
  isMobile: boolean;
}

interface StatItem {
  label: string;
  value: string;
  color: string;
}

export function StatsSummaryTiles({
  loading,
  totalWagered,
  totalProfit,
  winRate,
  totalBets,
  isMobile,
}: StatsSummaryTilesProps) {
  const isProfit = totalProfit >= 0;

  const stats: StatItem[] = [
    {
      label: 'LEBENSZEIT-EINSATZ',
      value: loading
        ? '…'
        : `$${totalWagered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: '#D4AF37',
    },
    {
      label: 'LEBENSZEIT-PROFIT',
      value: loading
        ? '…'
        : `${isProfit ? '+' : '-'}$${Math.abs(totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: isProfit ? '#10b981' : '#ef4444',
    },
    {
      label: 'GEWINNQUOTE',
      value: loading ? '…' : `${winRate.toFixed(1)}%`,
      color: '#ffffff',
    },
    {
      label: 'WETTEN GESAMT',
      value: loading ? '…' : totalBets.toLocaleString('en-US'),
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
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '10px' : '12px',
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            padding: isMobile ? '14px 16px' : '16px 20px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.025)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
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
            {stat.label}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: isMobile ? '1.15rem' : '1.35rem',
              fontWeight: 900,
              color: stat.color,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
