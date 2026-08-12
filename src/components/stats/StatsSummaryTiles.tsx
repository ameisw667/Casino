'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Target, Zap, LucideIcon } from 'lucide-react';

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
  icon: LucideIcon;
}

export function StatsSummaryTiles({
  loading,
  totalWagered,
  totalProfit,
  winRate,
  totalBets,
  isMobile,
}: StatsSummaryTilesProps) {
  const stats: StatItem[] = [
    {
      label: 'LIFETIME WAGERED',
      value: loading
        ? '…'
        : `$${totalWagered.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      color: 'var(--stealth-accent, #cbd5e1)',
      icon: Wallet,
    },
    {
      label: 'LIFETIME PROFIT',
      value: loading
        ? '…'
        : `${totalProfit >= 0 ? '+' : '-'}$${Math.abs(totalProfit).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      color:
        totalProfit >= 0 ? 'var(--stealth-emerald, #00e676)' : 'var(--stealth-crimson, #ff3366)',
      icon: TrendingUp,
    },
    {
      label: 'WIN RATE',
      value: loading ? '…' : `${winRate.toFixed(1)}%`,
      color: 'var(--stealth-accent, #cbd5e1)',
      icon: Target,
    },
    {
      label: 'TOTAL BETS',
      value: loading ? '…' : totalBets.toLocaleString('en-US'),
      color: 'var(--stealth-accent, #cbd5e1)',
      icon: Zap,
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
        gap: isMobile ? '10px' : '14px',
      }}
    >
      {stats.map((stat, i) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={i}
            style={{
              padding: isMobile ? '12px 14px' : '16px 18px',
              borderRadius: '8px',
              background: 'var(--stealth-surface, #141923)',
              border: '1px solid var(--stealth-border, #1e2638)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: 'hsl(var(--text-dim))',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: isMobile ? '1.1rem' : '1.35rem',
                  fontWeight: 800,
                  color: stat.color,
                  marginTop: '4px',
                }}
              >
                {stat.value}
              </div>
            </div>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                background: 'rgba(203, 213, 225, 0.06)',
                border: '1px solid rgba(203, 213, 225, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
              }}
            >
              <IconComponent size={18} />
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
