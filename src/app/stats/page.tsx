'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import type { HistoryRow, PerGameStat } from '@/lib/casino/stats-derivation';
import { StatsSummaryTiles } from '@/components/stats/StatsSummaryTiles';
import { ProfitHistoryChart } from '@/components/stats/ProfitHistoryChart';
import { FavoriteGameCard } from '@/components/stats/FavoriteGameCard';
import { PerGameProfitBreakdown } from '@/components/stats/PerGameProfitBreakdown';
import { SessionLengthChart } from '@/components/stats/SessionLengthChart';

interface HistoryResponse {
  rows: HistoryRow[];
  count: number;
}

interface ServerStats {
  totalBets: number;
  totalWins: number;
  totalWagered: number;
  totalPayout: number;
  totalProfit: number;
  winRate: number;
  perGame: PerGameStat[];
}

export default function StatsPage() {
  const isMobile = useCasinoStore((s) => s.isMobile);

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [histRes, statsRes] = await Promise.all([
          fetch('/api/user/history', { cache: 'no-store' }),
          fetch('/api/user/stats', { cache: 'no-store' }),
        ]);

        if (histRes.status === 401 || statsRes.status === 401) {
          if (!cancelled) setError('Bitte einloggen um deine Stats zu sehen.');
          return;
        }

        if (histRes.ok) {
          const histJson = (await histRes.json()) as HistoryResponse;
          if (!cancelled) setRows(histJson.rows ?? []);
        }

        if (statsRes.ok) {
          const statsJson = (await statsRes.json()) as ServerStats;
          if (!cancelled) setServerStats(statsJson);
        }
      } catch {
        if (!cancelled) setError('Stats konnten nicht geladen werden.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const perGame = serverStats?.perGame ?? [];

  if (error) {
    return (
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '40px 16px' : '80px 24px',
          textAlign: 'center',
          color: 'hsl(var(--text-dim))',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '14px' : '18px',
        padding: isMobile ? '0 16px 40px' : '0 24px 40px',
        minHeight: 'calc(100vh - 80px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontSize: isMobile ? '1.4rem' : '1.75rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              PERSÖNLICHE STATISTIKEN
            </h1>
            <span
              style={{
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                color: '#D4AF37',
                fontSize: '0.58rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              ANALYTICS
            </span>
          </div>
          <p
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.45)',
              marginTop: '4px',
              fontWeight: 500,
            }}
          >
            Detaillierte Auswertung deines Gaming-Verlaufs, Gewinne und Lieblingsspiele.
          </p>
        </div>
      </motion.div>

      <StatsSummaryTiles
        loading={loading}
        totalWagered={serverStats?.totalWagered ?? 0}
        totalProfit={serverStats?.totalProfit ?? 0}
        winRate={serverStats?.winRate ?? 0}
        totalBets={serverStats?.totalBets ?? 0}
        isMobile={isMobile}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '14px' : '18px',
        }}
      >
        <ProfitHistoryChart loading={loading} rows={rows} isMobile={isMobile} />
        <FavoriteGameCard loading={loading} perGame={perGame} isMobile={isMobile} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '14px' : '18px',
        }}
      >
        <PerGameProfitBreakdown loading={loading} perGame={perGame} isMobile={isMobile} />
        <SessionLengthChart loading={loading} rows={rows} isMobile={isMobile} />
      </div>
    </div>
  );
}
