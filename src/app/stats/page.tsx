'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import {
  type HistoryRow,
  type PerGameStat,
  deriveStatsFromRows,
} from '@/lib/casino/stats-derivation';
import { trackAllowedEvent } from '@/lib/analytics/events';
import { StatsTimeFilterBar, type StatsTimeRange } from '@/components/stats/StatsTimeFilterBar';
import { StatsSummaryTiles } from '@/components/stats/StatsSummaryTiles';
import { ProfitHistoryChart } from '@/components/stats/ProfitHistoryChart';
import { FavoriteGameCard } from '@/components/stats/FavoriteGameCard';
import { VipPersonalRecords } from '@/components/stats/VipPersonalRecords';
import { PnlActivityHeatmap } from '@/components/stats/PnlActivityHeatmap';
import { PerGameProfitBreakdown } from '@/components/stats/PerGameProfitBreakdown';

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
  const [timeRange, setTimeRange] = useState<StatsTimeRange>('ALL');
  const [dataLoadedAt, setDataLoadedAt] = useState<number>(0);

  useEffect(() => {
    void trackAllowedEvent({ name: 'stats_viewed' });
  }, []);

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
          const rawHist = (await histRes.json()) as { data?: HistoryResponse } | HistoryResponse;
          const histJson = (
            rawHist && 'data' in rawHist && rawHist.data ? rawHist.data : rawHist
          ) as HistoryResponse;
          if (!cancelled) {
            setRows(histJson.rows ?? []);
            setDataLoadedAt(Date.now());
          }
        }

        if (statsRes.ok) {
          const rawStats = (await statsRes.json()) as { data?: ServerStats } | ServerStats;
          const statsJson = (
            rawStats && 'data' in rawStats && rawStats.data ? rawStats.data : rawStats
          ) as ServerStats;
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

  // SP-1: Dynamic time filtering
  const filteredRows = useMemo(() => {
    if (timeRange === 'ALL' || dataLoadedAt === 0) return rows;
    const now = dataLoadedAt;
    return rows.filter((r) => {
      const diffMs = now - new Date(r.created_at).getTime();
      if (timeRange === '24H') return diffMs <= 24 * 60 * 60 * 1000;
      if (timeRange === '7D') return diffMs <= 7 * 24 * 60 * 60 * 1000;
      if (timeRange === '30D') return diffMs <= 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  }, [rows, timeRange, dataLoadedAt]);

  // Derived stats from filtered subset
  const derived = useMemo(() => {
    if (timeRange === 'ALL' && serverStats && serverStats.totalBets > 0) {
      return {
        totalWagered: serverStats.totalWagered,
        totalProfit: serverStats.totalProfit,
        winRate: serverStats.winRate,
        totalBets: serverStats.totalBets,
        perGame: serverStats.perGame,
      };
    }
    return deriveStatsFromRows(filteredRows);
  }, [filteredRows, timeRange, serverStats]);

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
      {/* Header */}
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
              ANALYTICS HUD
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
            Vollständige Performance-Analyse deiner Spielhistorie mit Live-Metriken & Heatmap.
          </p>
        </div>
      </motion.div>

      {/* SP-1: Globaler 4-Stufen Zeitfilter */}
      <StatsTimeFilterBar
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        filteredBetsCount={filteredRows.length}
        isMobile={isMobile}
      />

      {/* Summary Tiles */}
      <StatsSummaryTiles
        loading={loading}
        totalWagered={derived.totalWagered}
        totalProfit={derived.totalProfit}
        winRate={derived.winRate}
        totalBets={derived.totalBets}
        isMobile={isMobile}
      />

      {/* Row 1: SP-5 (PnL Chart) & SP-2 (Favorite Game Donut) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '14px' : '18px',
        }}
      >
        <ProfitHistoryChart loading={loading} rows={filteredRows} isMobile={isMobile} />
        <FavoriteGameCard loading={loading} perGame={derived.perGame} isMobile={isMobile} />
      </div>

      {/* Row 2: SP-4 (VIP Personal Records & Milestones) */}
      <VipPersonalRecords loading={loading} rows={filteredRows} isMobile={isMobile} />

      {/* Row 3: SP-3 (PnL Activity Heatmap) & Per Game Profit Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '14px' : '18px',
        }}
      >
        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
          <PnlActivityHeatmap loading={loading} rows={filteredRows} isMobile={isMobile} />
        </div>
        <PerGameProfitBreakdown loading={loading} perGame={derived.perGame} isMobile={isMobile} />
      </div>
    </div>
  );
}
