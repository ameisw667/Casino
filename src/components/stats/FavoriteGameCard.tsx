'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getFavoriteGame, type PerGameStat } from '@/lib/casino/stats-derivation';
import { getGameMeta } from './gameMeta';
import { Trophy, CircleDollarSign, Layers } from 'lucide-react';

interface FavoriteGameCardProps {
  loading: boolean;
  perGame: PerGameStat[];
  isMobile: boolean;
}

export function FavoriteGameCard({ loading, perGame, isMobile }: FavoriteGameCardProps) {
  const [viewMode, setViewMode] = useState<'ROUNDS' | 'PROFIT'>('ROUNDS');
  const favorite = useMemo(() => getFavoriteGame(perGame), [perGame]);
  const totalBets = useMemo(() => perGame.reduce((acc, g) => acc + g.bets, 0), [perGame]);
  const totalProfit = useMemo(() => perGame.reduce((acc, g) => acc + g.profit, 0), [perGame]);

  const chartData = useMemo(() => {
    return perGame.map((g) => {
      const meta = getGameMeta(g.game);
      const absProfit = Math.abs(g.profit);
      const isProfitPos = g.profit >= 0;

      return {
        name: meta.label,
        game: g.game,
        bets: g.bets,
        profit: g.profit,
        wagered: g.wagered,
        // In rounds mode, value is bets count; in profit mode, value is max(absProfit, 1) to render a slice
        value: viewMode === 'ROUNDS' ? g.bets : absProfit > 0 ? absProfit : 1,
        color: viewMode === 'ROUNDS' ? meta.color : isProfitPos ? '#10b981' : '#ef4444',
        pct: totalBets > 0 ? Math.round((g.bets / totalBets) * 100) : 0,
      };
    });
  }, [perGame, totalBets, viewMode]);

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
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              fontSize: '0.64rem',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.45)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            GAME-AFFINITÄT & PNL (SP-2)
          </div>
          {favorite && (
            <span
              style={{
                fontSize: '0.58rem',
                fontWeight: 800,
                color: '#D4AF37',
                background: 'rgba(212, 175, 55, 0.08)',
                padding: '2px 6px',
                borderRadius: '8px',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Trophy size={9} color="#D4AF37" />
              <span>TOP: {getGameMeta(favorite.game).label.toUpperCase()}</span>
            </span>
          )}
        </div>

        {/* View Mode Toggle: Rounds vs Profit */}
        <div
          style={{
            display: 'inline-flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            onClick={() => setViewMode('ROUNDS')}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: viewMode === 'ROUNDS' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              border: viewMode === 'ROUNDS' ? '1px solid #D4AF37' : 'none',
              color: viewMode === 'ROUNDS' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.62rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={10} />
            <span>RUNDEN</span>
          </button>
          <button
            onClick={() => setViewMode('PROFIT')}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: viewMode === 'PROFIT' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
              border: viewMode === 'PROFIT' ? '1px solid #D4AF37' : 'none',
              color: viewMode === 'PROFIT' ? '#FFD700' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.62rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <CircleDollarSign size={10} />
            <span>PROFIT ($)</span>
          </button>
        </div>
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
                            {data.bets} Runden ({data.pct}%)
                          </div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: '0.72rem',
                              fontWeight: 900,
                              color: data.profit >= 0 ? '#10b981' : '#ef4444',
                              marginTop: '2px',
                            }}
                          >
                            PnL: {data.profit >= 0 ? '+' : ''}${data.profit.toFixed(2)}
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
                  fontSize: viewMode === 'ROUNDS' ? '0.85rem' : '0.78rem',
                  fontWeight: 950,
                  color: viewMode === 'ROUNDS' ? '#ffffff' : totalProfit >= 0 ? '#10b981' : '#ef4444',
                  fontFamily: 'var(--font-mono, monospace)',
                  lineHeight: 1,
                }}
              >
                {viewMode === 'ROUNDS'
                  ? totalBets
                  : `${totalProfit >= 0 ? '+' : ''}$${Math.abs(totalProfit).toFixed(0)}`}
              </div>
              <div
                style={{
                  fontSize: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  marginTop: '2px',
                }}
              >
                {viewMode === 'ROUNDS' ? 'WETTEN' : 'NETTO PNL'}
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
                    {g.bets} Runden
                  </span>
                  <span
                    style={{
                      fontWeight: 900,
                      color: viewMode === 'ROUNDS' ? g.color : g.profit >= 0 ? '#10b981' : '#ef4444',
                      fontFamily: 'var(--font-mono, monospace)',
                      minWidth: '46px',
                      textAlign: 'right',
                      fontSize: '0.72rem',
                    }}
                  >
                    {viewMode === 'ROUNDS'
                      ? `${g.pct}%`
                      : `${g.profit >= 0 ? '+' : ''}$${g.profit.toFixed(0)}`}
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
