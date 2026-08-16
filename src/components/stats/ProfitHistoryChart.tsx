'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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
  const lineColor = isPositive ? '#10b981' : '#ef4444';
  const hasEnoughData = series.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        gridColumn: isMobile ? 'span 1' : 'span 2',
        padding: isMobile ? '16px' : '20px 24px',
        borderRadius: '16px',
        background: 'rgba(12, 12, 14, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '290px',
      }}
    >
      <div
        style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.35)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        PROFIT-VERLAUF
      </div>
      <div
        style={{
          fontSize: '0.72rem',
          color: 'rgba(255, 255, 255, 0.45)',
          marginBottom: '16px',
        }}
      >
        Kumulativer Gewinn/Verlust ({rows.length} Wetten)
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>Lädt…</span>
        </div>
      ) : !hasEnoughData ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span
            style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', textAlign: 'center' }}
          >
            Noch nicht genug Daten für einen Verlauf.
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
              stroke="rgba(255, 255, 255, 0.2)"
              fontSize={10}
              minTickGap={30}
              tickLine={false}
            />
            <YAxis stroke="rgba(255, 255, 255, 0.2)" fontSize={10} width={48} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#0e0e12',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                color: '#ffffff',
              }}
              itemStyle={{ color: '#ffffff' }}
              labelStyle={{ color: '#D4AF37', fontWeight: 800, marginBottom: '2px' }}
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
