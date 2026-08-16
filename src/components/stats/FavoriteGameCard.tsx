'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getFavoriteGame, type PerGameStat } from '@/lib/casino/stats-derivation';
import { getGameMeta } from './gameMeta';

interface FavoriteGameCardProps {
  loading: boolean;
  perGame: PerGameStat[];
  isMobile: boolean;
}

export function FavoriteGameCard({ loading, perGame, isMobile }: FavoriteGameCardProps) {
  const favorite = useMemo(() => getFavoriteGame(perGame), [perGame]);
  const totalBets = useMemo(() => perGame.reduce((acc, g) => acc + g.bets, 0), [perGame]);

  const chartData = useMemo(
    () =>
      perGame.map((g) => ({
        name: getGameMeta(g.game).label,
        game: g.game,
        value: g.bets,
        color: getGameMeta(g.game).color,
      })),
    [perGame],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      style={{
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
          marginBottom: '16px',
        }}
      >
        LIEBLINGSSPIEL & AKTIVITÄT
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          {favorite && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.35)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  MEISTGESPIELT
                </div>
                <div
                  style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}
                >
                  {getGameMeta(favorite.game).label}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.95rem',
                    fontWeight: 900,
                    color: '#D4AF37',
                  }}
                >
                  {favorite.bets} Wetten
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  ${favorite.wagered.toLocaleString('en-US', { maximumFractionDigits: 0 })} Einsatz
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {perGame.map((g) => {
              const meta = getGameMeta(g.game);
              const pct = totalBets > 0 ? Math.round((g.bets / totalBets) * 100) : 0;
              return (
                <div key={g.game} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{meta.label}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {g.bets} ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      borderRadius: '2px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: meta.color,
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
