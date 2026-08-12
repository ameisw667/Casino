'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';
import { getFavoriteGame, type PerGameStat } from '@/lib/casino/stats-derivation';
import { getGameMeta } from './gameMeta';

interface FavoriteGameCardProps {
  loading: boolean;
  perGame: PerGameStat[];
  isMobile: boolean;
}

export function FavoriteGameCard({ loading, perGame, isMobile }: FavoriteGameCardProps) {
  const favorite = useMemo(() => getFavoriteGame(perGame), [perGame]);
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
        padding: isMobile ? '16px' : '24px',
        borderRadius: '12px',
        background: 'var(--stealth-surface, #141923)',
        border: '1px solid var(--stealth-border, #1e2638)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '280px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          color: 'var(--stealth-accent, #cbd5e1)',
        }}
      >
        <Star size={16} />
        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>LIEBLINGSSPIEL</span>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'hsl(var(--text-dim))', fontSize: '0.85rem' }}>Lädt…</span>
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'hsl(var(--text-dim))', fontSize: '0.85rem', textAlign: 'center' }}>
            Noch keine Bets — spiel dein erstes Spiel!
          </span>
        </div>
      ) : (
        <>
          {favorite && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(203, 213, 225, 0.06)',
              }}
            >
              {(() => {
                const meta = getGameMeta(favorite.game);
                const Icon = meta.icon;
                return <Icon size={18} color={meta.color} />;
              })()}
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                  {getGameMeta(favorite.game).label}
                </div>
                <div
                  style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', fontWeight: 700 }}
                >
                  {favorite.bets} Bets · $
                  {favorite.wagered.toLocaleString('en-US', { maximumFractionDigits: 0 })} Einsatz
                </div>
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.game} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0b0e14',
                  border: '1px solid var(--stealth-border, #1e2638)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                }}
                formatter={(value, name) => [`${value ?? 0} Bets`, String(name ?? '')]}
              />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </motion.div>
  );
}
