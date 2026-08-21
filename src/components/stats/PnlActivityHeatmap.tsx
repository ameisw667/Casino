'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  buildDailyPnlHeatmap,
  type HistoryRow,
  type DailyPnlCell,
} from '@/lib/casino/stats-derivation';
import { Flame, CalendarDays } from 'lucide-react';

interface PnlActivityHeatmapProps {
  loading: boolean;
  rows: HistoryRow[];
  isMobile: boolean;
}

export function PnlActivityHeatmap({ loading, rows, isMobile }: PnlActivityHeatmapProps) {
  const heatmapData = useMemo(() => buildDailyPnlHeatmap(rows, 28), [rows]);
  const [hoveredCell, setHoveredCell] = useState<DailyPnlCell | null>(null);

  const totalHeatmapProfit = useMemo(
    () => heatmapData.reduce((acc, c) => acc + c.profit, 0),
    [heatmapData],
  );

  const isOverallProfit = totalHeatmapProfit >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            fontSize: '0.64rem',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.45)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          PNL AKTIVITÄTS-HEATMAP (SP-3)
        </div>
        <span
          style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            color: isOverallProfit ? '#10b981' : '#ef4444',
            background: isOverallProfit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '2px 8px',
            borderRadius: '12px',
            border: `1px solid ${isOverallProfit ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Flame size={10} color={isOverallProfit ? '#10b981' : '#ef4444'} />
          <span>
            28-TAGE DELTA: {isOverallProfit ? '+' : '-'}${Math.abs(totalHeatmapProfit).toFixed(2)}
          </span>
        </span>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>Lädt…</span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          {/* Calendar Grid (4 Rows x 7 Cols) */}
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
                marginBottom: '6px',
              }}
            >
              {['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'].map((d) => (
                <div
                  key={d}
                  style={{
                    textAlign: 'center',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.3)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
              }}
            >
              {heatmapData.map((cell) => {
                const isProfit = cell.profit > 0;
                const isLoss = cell.profit < 0;
                const absP = Math.abs(cell.profit);
                const hasActivity = cell.count > 0;

                // Color calculation
                let bg = 'rgba(255, 255, 255, 0.03)';
                let border = 'rgba(255, 255, 255, 0.05)';
                let shadow = 'none';

                if (isProfit) {
                  if (absP > 200) {
                    bg = 'rgba(16, 185, 129, 0.85)';
                    border = '#10b981';
                    shadow = '0 0 10px rgba(16, 185, 129, 0.4)';
                  } else {
                    bg = 'rgba(16, 185, 129, 0.35)';
                    border = 'rgba(16, 185, 129, 0.5)';
                  }
                } else if (isLoss) {
                  if (absP > 200) {
                    bg = 'rgba(239, 68, 68, 0.85)';
                    border = '#ef4444';
                    shadow = '0 0 10px rgba(239, 68, 68, 0.4)';
                  } else {
                    bg = 'rgba(239, 68, 68, 0.35)';
                    border = 'rgba(239, 68, 68, 0.5)';
                  }
                } else if (hasActivity) {
                  bg = 'rgba(212, 175, 55, 0.2)';
                  border = 'rgba(212, 175, 55, 0.4)';
                }

                return (
                  <div
                    key={cell.date}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                      aspectRatio: '1/1',
                      borderRadius: '8px',
                      background: bg,
                      border: `1px solid ${border}`,
                      boxShadow: shadow,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 800,
                      color: hasActivity ? '#fff' : 'rgba(255,255,255,0.2)',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    {cell.dayLabel.split('.')[0]}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Info / Hover Status */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
            }}
          >
            {hoveredCell ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#D4AF37',
                    fontWeight: 800,
                  }}
                >
                  <CalendarDays size={12} />
                  <span>
                    {hoveredCell.date} ({hoveredCell.count} Runden)
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 900,
                    color: hoveredCell.profit >= 0 ? '#10b981' : '#ef4444',
                  }}
                >
                  {hoveredCell.profit >= 0 ? '+' : '-'}${Math.abs(hoveredCell.profit).toFixed(2)}
                </div>
              </>
            ) : (
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.68rem' }}>
                Bewege die Maus über einen Tag für Details zum Tagesprofit.
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
