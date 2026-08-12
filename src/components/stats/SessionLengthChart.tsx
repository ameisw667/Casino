'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Clock } from 'lucide-react';
import { buildDailyActivity, type HistoryRow } from '@/lib/casino/stats-derivation';

interface SessionLengthChartProps {
  loading: boolean;
  rows: HistoryRow[];
  isMobile: boolean;
}

function formatDay(dateKey: string) {
  try {
    return new Date(dateKey).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  } catch {
    return dateKey;
  }
}

export function SessionLengthChart({ loading, rows, isMobile }: SessionLengthChartProps) {
  const activity = useMemo(() => buildDailyActivity(rows), [rows]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        gridColumn: isMobile ? 'span 1' : 'span 2',
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
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--stealth-accent, #cbd5e1)',
          }}
        >
          <Clock size={16} />
          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>SESSION-LÄNGE</span>
        </div>
        <span
          title="Näherungswert: Zeitspanne zwischen erstem und letztem Bet pro Tag — zählt Pausen zwischen Bets mit."
          style={{
            fontSize: '0.6rem',
            fontWeight: 800,
            color: 'hsl(var(--text-dim))',
            background: 'rgba(203, 213, 225, 0.08)',
            border: '1px solid var(--stealth-border, #1e2638)',
            borderRadius: '999px',
            padding: '3px 8px',
            letterSpacing: '0.04em',
            cursor: 'help',
          }}
        >
          ≈ NÄHERUNGSWERT
        </span>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'hsl(var(--text-dim))', fontSize: '0.85rem' }}>Lädt…</span>
        </div>
      ) : activity.length < 2 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'hsl(var(--text-dim))', fontSize: '0.85rem', textAlign: 'center' }}>
            Noch nicht genug Daten für einen Verlauf — spiel an mehreren Tagen.
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activity}>
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              stroke="rgba(203,213,225,0.3)"
              fontSize={10}
            />
            <YAxis stroke="rgba(203,213,225,0.3)" fontSize={10} width={40} />
            <Tooltip
              contentStyle={{
                background: '#0b0e14',
                border: '1px solid var(--stealth-border, #1e2638)',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
              formatter={(value) => [`${value ?? 0} min`, 'Session-Länge (≈)']}
              labelFormatter={(label) => formatDay(String(label ?? ''))}
            />
            <Bar dataKey="spanMinutes" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
