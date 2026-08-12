'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { buildProfitSeries, type HistoryRow } from '@/lib/casino/stats-derivation';

interface ProfitHistoryChartProps {
  loading: boolean;
  rows: HistoryRow[];
  isMobile: boolean;
}

function formatTick(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
}

export function ProfitHistoryChart({ loading, rows, isMobile }: ProfitHistoryChartProps) {
  const series = useMemo(() => buildProfitSeries(rows), [rows]);
  const isPositive = (series.at(-1)?.cumulativeProfit ?? 0) >= 0;
  const lineColor = isPositive ? '#00e676' : '#ff3366';
  const hasEnoughData = series.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        gridColumn: isMobile ? 'span 1' : 'span 2',
        padding: isMobile ? '16px' : '24px',
        borderRadius: '12px',
        background: 'var(--stealth-surface, #141923)',
        border: '1px solid var(--stealth-border, #1e2638)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '280px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
          color: 'var(--stealth-accent, #cbd5e1)',
        }}
      >
        <TrendingUp size={16} />
        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>PROFIT VERLAUF</span>
      </div>
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'hsl(var(--text-dim))',
          marginBottom: '16px',
        }}
      >
        Letzte {rows.length} Bets
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'hsl(var(--text-dim))', fontSize: '0.85rem' }}>Lädt…</span>
        </div>
      ) : !hasEnoughData ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'hsl(var(--text-dim))', fontSize: '0.85rem', textAlign: 'center' }}>
            Noch nicht genug Daten für einen Verlauf — spiel ein paar Runden.
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={series}>
            <defs>
              <linearGradient id="statsProfitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tickFormatter={formatTick}
              stroke="rgba(203,213,225,0.3)"
              fontSize={10}
              minTickGap={30}
            />
            <YAxis stroke="rgba(203,213,225,0.3)" fontSize={10} width={48} />
            <Tooltip
              contentStyle={{
                background: '#0b0e14',
                border: '1px solid var(--stealth-border, #1e2638)',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
              formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Profit']}
              labelFormatter={(label) => formatTick(String(label ?? ''))}
            />
            <Area
              type="monotone"
              dataKey="cumulativeProfit"
              stroke={lineColor}
              fillOpacity={1}
              fill="url(#statsProfitGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
