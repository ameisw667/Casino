'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter } from 'lucide-react';

export type StatsTimeRange = '24H' | '7D' | '30D' | 'ALL';

interface StatsTimeFilterBarProps {
  timeRange: StatsTimeRange;
  setTimeRange: (range: StatsTimeRange) => void;
  filteredBetsCount: number;
  isMobile?: boolean;
}

export function StatsTimeFilterBar({
  timeRange,
  setTimeRange,
  filteredBetsCount,
  isMobile = false,
}: StatsTimeFilterBarProps) {
  const ranges: { key: StatsTimeRange; label: string }[] = [
    { key: '24H', label: '24 Stunden' },
    { key: '7D', label: '7 Tage' },
    { key: '30D', label: '30 Tage' },
    { key: 'ALL', label: 'Gesamte Historie' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background:
          'linear-gradient(135deg, rgba(20, 22, 30, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        borderRadius: '16px',
        padding: isMobile ? '10px 14px' : '10px 18px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: '#D4AF37',
            fontSize: '0.66rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <Calendar size={13} color="#D4AF37" />
          <span>ZEITRAUM:</span>
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
          {ranges.map((r) => {
            const isActive = timeRange === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setTimeRange(r.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.08) 100%)'
                    : 'transparent',
                  color: isActive ? '#FFD700' : 'rgba(255, 255, 255, 0.55)',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 900 : 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? 'inset 0 0 10px rgba(212, 175, 55, 0.25)' : 'none',
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '10px',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.22)',
          fontSize: '0.66rem',
          fontWeight: 900,
          color: '#D4AF37',
          letterSpacing: '0.04em',
        }}
      >
        <Filter size={11} color="#D4AF37" />
        <span>{filteredBetsCount} WETTEN IM ZEITRAUM</span>
      </div>
    </motion.div>
  );
}
