'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { PerGameStat } from '@/lib/casino/stats-derivation';
import { getGameMeta } from './gameMeta';

interface PerGameProfitBreakdownProps {
  loading: boolean;
  perGame: PerGameStat[];
  isMobile: boolean;
}

export function PerGameProfitBreakdown({
  loading,
  perGame,
  isMobile,
}: PerGameProfitBreakdownProps) {
  const chartData = useMemo(
    () =>
      [...perGame]
        .sort((a, b) => b.profit - a.profit)
        .map((g) => ({
          name: getGameMeta(g.game).label,
          profit: Math.round(g.profit * 100) / 100,
        })),
    [perGame],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        padding: isMobile ? '16px' : '24px',
        borderRadius: '12px',
        background: 'var(--stealth-surface, #141923)',
        border: '1px solid var(--stealth-border, #1e2638)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '260px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          color: 'var(--stealth-accent, #cbd5e1)',
        }}
      >
        <BarChart3 size={16} />
        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>PROFIT JE SPIEL</span>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'hsl(var(--text-dim))', fontSize: '0.85rem' }}>Lädt…</span>
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'hsl(var(--text-dim))', fontSize: '0.85rem', textAlign: 'center' }}>
            Noch keine Bets — spiel dein erstes Spiel!
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" stroke="rgba(203,213,225,0.3)" fontSize={10} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="rgba(203,213,225,0.3)"
              fontSize={11}
              width={72}
            />
            <Tooltip
              contentStyle={{
                background: '#0b0e14',
                border: '1px solid var(--stealth-border, #1e2638)',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
              formatter={(value) => {
                const num = Number(value ?? 0);
                return [`${num >= 0 ? '+' : ''}$${num.toFixed(2)}`, 'Profit'];
              }}
            />
            <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.profit >= 0 ? '#00e676' : '#ff3366'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
