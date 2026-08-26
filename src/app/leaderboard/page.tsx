'use client';

import React, { useEffect, useState } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { LeaderboardWeeklyBanner } from '@/components/leaderboard/LeaderboardWeeklyBanner';
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium';
import { LeaderboardStreamTable, LeaderRow } from '@/components/leaderboard/LeaderboardStreamTable';
import { PersonalRankBar } from '@/components/leaderboard/PersonalRankBar';
import { GuildLeaderboardStrip } from '@/components/casino/guild/GuildLeaderboardStrip';

import { useSupabaseSession } from '@/components/auth/SupabaseSessionProvider';

interface LeaderboardResponse {
  rows: LeaderRow[];
  generated_at: string;
}

type TimeframeFilter = 'weekly' | 'monthly' | 'all-time';

export default function LeaderboardPage() {
  const isMobile = useCasinoStore((s) => s.isMobile);
  const { user } = useSupabaseSession();
  const level = useCasinoStore((s) => s.level);
  const rank = useCasinoStore((s) => s.rank);
  const analytics = useCasinoStore((s) => s.analytics);

  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeFilter>('weekly');

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

  const timeframes: { id: TimeframeFilter; label: string }[] = [
    { id: 'weekly', label: 'Wöchentlich' },
    { id: 'monthly', label: 'Monatlich' },
    { id: 'all-time', label: 'Alle Zeiten' },
  ];

  return (
    <div
      style={{
        maxWidth: '1360px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '14px' : '20px',
        padding: isMobile ? '14px 16px 80px' : '16px 24px 40px',
        minHeight: 'calc(100vh - 80px)',
        position: 'relative',
      }}
    >
      {/* Header — Understated, Natural, Human-Crafted */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          padding: isMobile ? '16px' : '20px 24px',
          borderRadius: '12px',
          border: '1px solid #222222',
          background: '#111111',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <h1
            style={{
              fontSize: isMobile ? '1.4rem' : '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Leaderboard
          </h1>
          <p
            style={{
              fontSize: '0.8rem',
              color: '#737373',
              margin: 0,
              fontWeight: 400,
            }}
          >
            Live-Übersicht der erfolgreichsten Spieler und getätigten Einsätze.
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#1A1A1A',
            border: '1px solid #282828',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px',
          }}
        >
          {timeframes.map((tf) => {
            const isActive = activeTimeframe === tf.id;
            return (
              <button
                key={tf.id}
                type="button"
                onClick={() => setActiveTimeframe(tf.id)}
                style={{
                  padding: isMobile ? '6px 12px' : '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: isActive ? '#292929' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#8A8A8A',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                }}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Guild Status Strip */}
      <GuildLeaderboardStrip isMobile={isMobile} />

      {/* Tournament Stats Bar */}
      <LeaderboardWeeklyBanner
        isMobile={isMobile}
        totalWagered={totalWagered}
        activePlayersCount={rows.length}
      />

      {/* Podium Stage with Avatars */}
      {!loading && rows.length >= 3 && (
        <LeaderboardPodium topThree={rows.slice(0, 3)} isMobile={isMobile} />
      )}

      {/* High Roller Stream Table */}
      <div>
        <LeaderboardStreamTable loading={loading} rows={rows} />
      </div>

      {/* Floating Personal Rank Dock */}
      <PersonalRankBar
        username={user?.email?.split('@')[0] || 'User'}
        rank={rank}
        level={level}
        wagered={analytics?.totalWagered ?? 0}
      />
    </div>
  );
}
