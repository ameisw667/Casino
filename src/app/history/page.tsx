'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import { HistoryStatsCard } from '@/components/history/HistoryStatsCard';
import {
  HistoryFilterBar,
  GameFilterType,
  TimeFilterType,
  OutcomeFilterType,
} from '@/components/history/HistoryFilterBar';
import { HistoryTableStream, HistoryRow } from '@/components/history/HistoryTableStream';
import { BetReceiptModal } from '@/components/history/BetReceiptModal';

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
}

export default function HistoryPage() {
  const isMobile = useCasinoStore((s) => s.isMobile);

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [gameFilter, setGameFilter] = useState<GameFilterType>('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('ALL');
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilterType>('ALL');
  const [dataLoadedAt, setDataLoadedAt] = useState<number>(0);
  const [selectedRow, setSelectedRow] = useState<HistoryRow | null>(null);

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
          if (!cancelled) setError('Bitte einloggen um deine History zu sehen.');
          return;
        }

        if (histRes.ok) {
          const histJson = (await histRes.json()) as HistoryResponse;
          if (!cancelled) {
            setRows(histJson.rows ?? []);
            setDataLoadedAt(Date.now());
          }
        }

        if (statsRes.ok) {
          const statsJson = (await statsRes.json()) as ServerStats;
          if (!cancelled) setServerStats(statsJson);
        }
      } catch {
        if (!cancelled) setError('History konnte nicht geladen werden.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Multi-Filter criteria
  const filteredRows = rows.filter((r) => {
    // 1. Game filter
    if (gameFilter !== 'ALL') {
      const g = (r.game ?? r.type ?? '').toLowerCase();
      if (!g.includes(gameFilter.toLowerCase())) return false;
    }

    // 2. Time filter
    if (timeFilter !== 'ALL' && dataLoadedAt > 0) {
      const betTime = new Date(r.created_at).getTime();
      const diffMs = dataLoadedAt - betTime;
      if (timeFilter === 'TODAY' && diffMs > 24 * 60 * 60 * 1000) return false;
      if (timeFilter === 'WEEK' && diffMs > 7 * 24 * 60 * 60 * 1000) return false;
      if (timeFilter === 'MONTH' && diffMs > 30 * 24 * 60 * 60 * 1000) return false;
    }

    // 3. Outcome filter
    if (outcomeFilter === 'WINS' && r.amount <= 0) return false;
    if (outcomeFilter === 'LOSSES' && r.amount >= 0) return false;

    return true;
  });

  // Dynamic Live Stats derivation based on filtered rows
  const isFiltered = gameFilter !== 'ALL' || timeFilter !== 'ALL' || outcomeFilter !== 'ALL';

  const totalWagered = isFiltered
    ? filteredRows.reduce((acc, r) => acc + (r.amount < 0 ? Math.abs(r.amount) : 0), 0)
    : serverStats && serverStats.totalWagered > 0
      ? serverStats.totalWagered
      : rows.reduce((acc, r) => acc + (r.amount < 0 ? Math.abs(r.amount) : 0), 0);

  const netProfit = isFiltered
    ? filteredRows.reduce((acc, r) => acc + r.amount, 0)
    : serverStats
      ? serverStats.totalProfit
      : rows.reduce((acc, r) => acc + r.amount, 0);

  const winRate =
    filteredRows.length > 0
      ? ((filteredRows.filter((r) => r.amount > 0).length / filteredRows.length) * 100).toFixed(1)
      : '0.0';

  const totalBets = filteredRows.length;

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
              MEINE WETTEN
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
              VIP HISTORY
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
            Vollständige Historie aller gespielten Runden mit kryptografischer Verifikation.
          </p>
        </div>
      </motion.div>

      <HistoryStatsCard
        loading={loading}
        totalWagered={totalWagered}
        netProfit={netProfit}
        winRate={winRate}
        totalBets={totalBets}
        isMobile={isMobile}
        rows={filteredRows}
      />

      <HistoryFilterBar
        gameFilter={gameFilter}
        setGameFilter={setGameFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        outcomeFilter={outcomeFilter}
        setOutcomeFilter={setOutcomeFilter}
        filteredCount={filteredRows.length}
        isMobile={isMobile}
      />

      <div>
        <HistoryTableStream
          loading={loading}
          rows={filteredRows}
          isMobile={isMobile}
          onSelectRow={(row) => setSelectedRow(row)}
        />
      </div>

      {/* VIP Bet Receipt Modal (NP-4) */}
      <BetReceiptModal row={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  );
}
