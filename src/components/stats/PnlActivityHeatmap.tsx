'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { buildDailyPnlHeatmap, type HistoryRow, type DailyPnlCell } from '@/lib/casino/stats-derivation';
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
        padding: isMobile ? '12px 14px' : '16px 20px',
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(22, 24, 32, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '260px',
        justifyContent: 'space-between',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            fontSize: '0.64rem',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.45)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          PNL AKTIVITÄTS-HEATMAP
        </div>
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 800,
            color: isOverallProfit ? '#10b981' : '#ef4444',
            background: isOverallProfit ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            padding: '2px 8px',
            borderRadius: '12px',
            border: `1px solid ${isOverallProfit ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Flame size={10} color={isOverallProfit ? '#10b981' : '#ef4444'} />
          <span>28T: {isOverallProfit ? '+' : '-'}${Math.abs(totalHeatmapProfit).toFixed(2)}</span>
        </span>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem' }}>Lädt…</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Calendar Grid (4 Rows x 7 Cols) */}
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                marginBottom: '4px',
              }}
            >
              {['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'].map((d) => (
                <div
                  key={d}
                  style={{
                    textAlign: 'center',
                    fontSize: '0.52rem',
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
                gap: '4px',
              }}
            >
              {heatmapData.map((cell) => {
                const isProfit = cell.profit > 0;
                const isLoss = cell.profit < 0;
                const absP = Math.abs(cell.profit);
                const hasActivity = cell.count > 0;

                // Subtle Color calculation
                let bg = 'rgba(255, 255, 255, 0.02)';
                let border = 'rgba(255, 255, 255, 0.04)';
                let shadow = 'none';

                if (isProfit) {
                  if (absP > 200) {
                    bg = 'rgba(16, 185, 129, 0.75)';
                    border = '#10b981';
                    shadow = '0 0 6px rgba(16, 185, 129, 0.3)';
                  } else {
                    bg = 'rgba(16, 185, 129, 0.25)';
                    border = 'rgba(16, 185, 129, 0.4)';
                  }
                } else if (isLoss) {
                  if (absP > 200) {
                    bg = 'rgba(239, 68, 68, 0.75)';
                    border = '#ef4444';
                    shadow = '0 0 6px rgba(239, 68, 68, 0.3)';
                  } else {
                    bg = 'rgba(239, 68, 68, 0.25)';
                    border = 'rgba(239, 68, 68, 0.4)';
                  }
                } else if (hasActivity) {
                  bg = 'rgba(212, 175, 55, 0.15)';
                  border = 'rgba(212, 175, 55, 0.3)';
                }

                return (
                  <div
                    key={cell.date}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                      height: '24px',
                      borderRadius: '6px',
                      background: bg,
                      border: `1px solid ${border}`,
                      boxShadow: shadow,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.58rem',
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
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.68rem',
            }}
          >
            {hoveredCell ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D4AF37', fontWeight: 800 }}>
                  <CalendarDays size={11} />
                  <span>{hoveredCell.date} ({hoveredCell.count} Runden)</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 900, color: hoveredCell.profit >= 0 ? '#10b981' : '#ef4444' }}>
                  {hoveredCell.profit >= 0 ? '+' : '-'}${Math.abs(hoveredCell.profit).toFixed(2)}
                </div>
              </>
            ) : (
              <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.64rem' }}>
                Bewege die Maus über einen Tag für Details zum Tagesprofit.
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
