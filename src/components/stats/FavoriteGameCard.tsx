'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getFavoriteGame, type PerGameStat } from '@/lib/casino/stats-derivation';
import { getGameMeta } from './gameMeta';
import { Trophy } from 'lucide-react';

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
      perGame.map((g) => {
        const meta = getGameMeta(g.game);
        return {
          name: meta.label,
          game: g.game,
          value: g.bets,
          wagered: g.wagered,
          profit: g.profit,
          color: meta.color,
          pct: totalBets > 0 ? Math.round((g.bets / totalBets) * 100) : 0,
        };
      }),
    [perGame, totalBets],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
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
          LIEBLINGSSPIEL & GAME-AFFINITÄT (SP-2)
        </div>
        {favorite && (
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#D4AF37',
              background: 'rgba(212, 175, 55, 0.1)',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Trophy size={10} color="#D4AF37" />
            <span>TOP: {getGameMeta(favorite.game).label.toUpperCase()}</span>
          </span>
        )}
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
            Noch keine Wetten im gewählten Zeitraum.
          </span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: '16px',
            flex: 1,
          }}
        >
          {/* Donut Chart */}
          <div
            style={{ width: isMobile ? '100%' : '140px', height: '140px', position: 'relative' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          style={{
                            background: 'rgba(12, 14, 20, 0.95)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.74rem',
                            color: '#fff',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                          }}
                        >
                          <div style={{ fontWeight: 900, color: data.color }}>{data.name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem' }}>
                            {data.value} Wetten ({data.pct}%)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label inside Donut */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 950,
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono, monospace)',
                  lineHeight: 1,
                }}
              >
                {totalBets}
              </div>
              <div
                style={{
                  fontSize: '0.52rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                }}
              >
                WETTEN
              </div>
            </div>
          </div>

          {/* Breakdown List */}
          <div
            style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {chartData.map((g) => (
              <div
                key={g.game}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.74rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: g.color,
                      boxShadow: `0 0 6px ${g.color}`,
                    }}
                  />
                  <span style={{ fontWeight: 800, color: '#fff' }}>{g.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.7rem',
                    }}
                  >
                    {g.value} Runden
                  </span>
                  <span
                    style={{
                      fontWeight: 900,
                      color: g.color,
                      fontFamily: 'var(--font-mono, monospace)',
                      minWidth: '34px',
                      textAlign: 'right',
                    }}
                  >
                    {g.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
