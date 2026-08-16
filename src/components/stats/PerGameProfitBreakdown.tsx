'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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
        padding: isMobile ? '16px' : '20px 24px',
        borderRadius: '16px',
        background: 'rgba(12, 12, 14, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '270px',
      }}
    >
      <div
        style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.35)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        PROFIT JE SPIEL
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>Lädt…</span>
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span
            style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', textAlign: 'center' }}
          >
            Noch keine Wetten vorhanden.
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" stroke="rgba(255, 255, 255, 0.2)" fontSize={10} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.5)"
              fontSize={11}
              width={76}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              contentStyle={{
                background: '#0e0e12',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              }}
              itemStyle={{ color: '#ffffff' }}
              labelStyle={{ color: '#D4AF37', fontWeight: 800, marginBottom: '2px' }}
              formatter={(value) => {
                const num = Number(value ?? 0);
                return [`${num >= 0 ? '+' : ''}$${num.toFixed(2)}`, 'Profit'];
              }}
            />
            <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
