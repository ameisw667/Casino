'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import { buildProfitSeries, type HistoryRow } from '@/lib/casino/stats-derivation';
import { TrendingUp, BarChart2 } from 'lucide-react';

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
  const [chartMode, setChartMode] = useState<'CUMULATIVE' | 'DELTA'>('CUMULATIVE');

  const chartData = useMemo(() => {
    if (chartMode === 'CUMULATIVE') {
      const series = buildProfitSeries(rows);
      return series.map((s) => ({ time: s.time, value: s.cumulativeProfit }));
    }
    const chronological = [...rows].reverse();
    return chronological.map((r) => ({
      time: r.created_at,
      value: r.amount,
    }));
  }, [rows, chartMode]);

  const isPositive = (chartData.at(-1)?.value ?? 0) >= 0;
  const lineColor = isPositive ? '#10b981' : '#ef4444';
  const hasEnoughData = rows.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        gridColumn: isMobile ? 'span 1' : 'span 2',
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
        minHeight: '310px',
      }}
    >
      {/* Header & Mode Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.64rem',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.45)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            PROFIT-VERLAUF & PERFORMANCE-BENCHMARK (SP-5)
          </div>
          <div
            style={{
              fontSize: '0.74rem',
              color: 'rgba(255, 255, 255, 0.55)',
              marginTop: '2px',
              fontWeight: 600,
            }}
          >
            {chartMode === 'CUMULATIVE' ? 'Kumulative Gewinnkurve' : 'Einzelrunden-Gewinndelta'} (
            {rows.length} Wetten)
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '10px',
            padding: '2px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            gap: '2px',
          }}
        >
          <button
            onClick={() => setChartMode('CUMULATIVE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '8px',
              border: 'none',
              background: chartMode === 'CUMULATIVE' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              color: chartMode === 'CUMULATIVE' ? '#FFD700' : 'rgba(255, 255, 255, 0.55)',
              fontSize: '0.68rem',
              fontWeight: chartMode === 'CUMULATIVE' ? 900 : 700,
              cursor: 'pointer',
            }}
          >
            <TrendingUp size={11} />
            <span>KUMULATIV</span>
          </button>
          <button
            onClick={() => setChartMode('DELTA')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '8px',
              border: 'none',
              background: chartMode === 'DELTA' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              color: chartMode === 'DELTA' ? '#FFD700' : 'rgba(255, 255, 255, 0.55)',
              fontSize: '0.68rem',
              fontWeight: chartMode === 'DELTA' ? 900 : 700,
              cursor: 'pointer',
            }}
          >
            <BarChart2 size={11} />
            <span>DELTA</span>
          </button>
        </div>
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
            Noch nicht genug Daten für diesen Zeitraum.
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="statsProfitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.45} />
                <stop offset="60%" stopColor={lineColor} stopOpacity={0.12} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
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
            <YAxis stroke="rgba(255, 255, 255, 0.2)" fontSize={10} width={50} tickLine={false} />
            <ReferenceLine y={0} stroke="rgba(212, 175, 55, 0.4)" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{
                background: 'rgba(11, 14, 20, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '10px',
                fontSize: '0.8rem',
                color: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.65)',
              }}
              formatter={(value) => {
                const num = Number(value ?? 0);
                return [
                  `${num >= 0 ? '+' : ''}$${num.toFixed(2)}`,
                  chartMode === 'CUMULATIVE' ? 'Kumulativer Profit' : 'Runden-Delta',
                ];
              }}
              labelFormatter={(label) => {
                try {
                  return new Date(label).toLocaleString('de-DE');
                } catch {
                  return label;
                }
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              fill="url(#statsProfitGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
