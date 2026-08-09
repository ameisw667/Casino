'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import { LeaderboardHeroStats } from '@/components/leaderboard/LeaderboardHeroStats';
import { LeaderboardStreamTable, LeaderRow } from '@/components/leaderboard/LeaderboardStreamTable';
import { PersonalRankBar } from '@/components/leaderboard/PersonalRankBar';

import { useSupabaseSession } from '@/components/auth/SupabaseSessionProvider';

interface LeaderboardResponse {
  rows: LeaderRow[];
  generated_at: string;
}

export default function LeaderboardPage() {
  const isMobile = useCasinoStore((s) => s.isMobile);
  const { user } = useSupabaseSession();
  const level = useCasinoStore((s) => s.level);
  const rank = useCasinoStore((s) => s.rank);
  const analytics = useCasinoStore((s) => s.analytics);

  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/leaderboard', { cache: 'no-store' });
        if (res.ok) {
          const json = (await res.json()) as LeaderboardResponse;
          if (!cancelled) setRows(json.rows ?? []);
        }
      } catch {
        // fail-safe fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalWagered = rows.reduce((acc, r) => acc + r.total_wagered, 0);
  const topWinner = rows[0];

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
        position: 'relative',
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
          GLOBAL LEADERBOARD // HIGH-FREQUENCY RANKINGS
        </h1>
      </motion.div>

      <LeaderboardHeroStats
        totalWagered={totalWagered}
        activePlayersCount={rows.length}
        topWinnerWager={topWinner?.total_wagered ?? 0}
        topWinnerName={topWinner?.username ?? ''}
        isMobile={isMobile}
      />

      <div
        style={{
          background: 'var(--stealth-surface, #141923)',
          border: '1px solid var(--stealth-border, #1e2638)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <LeaderboardStreamTable loading={loading} rows={rows} />
      </div>

      <PersonalRankBar
        username={user?.email?.split('@')[0] || 'User'}
        rank={rank}
        level={level}
        wagered={analytics?.totalWagered ?? 0}
      />
    </div>
  );
}
