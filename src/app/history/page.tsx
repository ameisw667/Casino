'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import { HistoryStatsCard } from '@/components/history/HistoryStatsCard';
import { HistoryFilterBar } from '@/components/history/HistoryFilterBar';
import { HistoryTableStream, HistoryRow } from '@/components/history/HistoryTableStream';

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
  const storeBets = useCasinoStore((s) => s.bets);
  const analytics = useCasinoStore((s) => s.analytics);

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

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
          if (!cancelled) setRows(histJson.rows ?? []);
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

  const totalWagered =
    serverStats && serverStats.totalWagered > 0
      ? serverStats.totalWagered
      : (analytics?.totalWagered ??
        rows.reduce((acc, r) => acc + (r.amount < 0 ? Math.abs(r.amount) : 0), 0));

  const netProfit = serverStats
    ? serverStats.totalProfit
    : analytics
      ? analytics.totalPayout - analytics.totalWagered
      : 0;

  const winRate = serverStats
    ? serverStats.winRate.toFixed(1)
    : rows.length > 0
      ? ((rows.filter((r) => r.amount > 0).length / rows.length) * 100).toFixed(1)
      : '0.0';

  const totalBets = serverStats ? serverStats.totalBets : Math.max(storeBets.length, rows.length);
  const filteredRows = activeFilter === 'WINS' ? rows.filter((r) => r.amount > 0) : rows;

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
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h1
          style={{
            fontSize: isMobile ? '1.4rem' : '1.7rem',
            fontWeight: 900,
            letterSpacing: '-0.01em',
            color: 'var(--stealth-accent, #cbd5e1)',
          }}
        >
          BET HISTORY // TERMINAL TAPE
        </h1>
      </motion.div>

      <HistoryStatsCard
        loading={loading}
        totalWagered={totalWagered}
        netProfit={netProfit}
        winRate={winRate}
        totalBets={totalBets}
        isMobile={isMobile}
      />

      <HistoryFilterBar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        filteredCount={filteredRows.length}
      />

      <div
        style={{
          background: 'var(--stealth-surface, #141923)',
          border: '1px solid var(--stealth-border, #1e2638)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <HistoryTableStream loading={loading} rows={filteredRows} isMobile={isMobile} />
      </div>
    </div>
  );
}
