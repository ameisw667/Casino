'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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
        padding: isMobile ? '16px' : '20px 24px',
        borderRadius: '16px',
        background:
          'linear-gradient(145deg, rgba(24, 24, 32, 0.7) 0%, rgba(12, 12, 18, 0.88) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(212, 175, 55, 0.12)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '270px',
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
            fontSize: '0.62rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.35)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          SESSION-LÄNGE
        </div>
        <span
          title="Näherungswert: Zeitspanne zwischen erstem und letztem Bet pro Tag."
          style={{
            fontSize: '0.58rem',
            fontWeight: 800,
            color: '#D4AF37',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '4px',
            padding: '2px 6px',
            letterSpacing: '0.06em',
            cursor: 'help',
          }}
        >
          ≈ NÄHERUNGSWERT
        </span>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>Lädt…</span>
        </div>
      ) : activity.length < 2 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span
            style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', textAlign: 'center' }}
          >
            Noch nicht genug Daten für einen Verlauf.
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activity}>
            <defs>
              <linearGradient id="sessionGoldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              stroke="rgba(255, 255, 255, 0.2)"
              fontSize={10}
              tickLine={false}
            />
            <YAxis stroke="rgba(255, 255, 255, 0.2)" fontSize={10} width={40} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              contentStyle={{
                background: 'rgba(11, 14, 20, 0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '10px',
                fontSize: '0.8rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.65)',
                color: '#ffffff',
              }}
              itemStyle={{ color: '#ffffff' }}
              labelStyle={{ color: '#D4AF37', fontWeight: 800, marginBottom: '2px' }}
              formatter={(value) => [`${value ?? 0} min`, 'Session-Dauer']}
              labelFormatter={(label) => formatDay(String(label ?? ''))}
            />
            <Bar dataKey="spanMinutes" fill="url(#sessionGoldGradient)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
