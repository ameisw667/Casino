'use client';

import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { LeaderboardWeeklyBanner } from '@/components/leaderboard/LeaderboardWeeklyBanner';
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium';
import { LeaderboardStreamTable, LeaderRow } from '@/components/leaderboard/LeaderboardStreamTable';
import { PersonalRankBar } from '@/components/leaderboard/PersonalRankBar';

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
    { id: 'weekly', label: 'WÖCHENTLICH' },
    { id: 'monthly', label: 'MONATLICH' },
    { id: 'all-time', label: 'ALL-TIME' },
  ];

  return (
    <div
      style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '14px' : '20px',
        padding: isMobile ? '14px 16px 80px' : '12px 24px 32px',
        minHeight: 'calc(100vh - 80px)',
        position: 'relative',
      }}
    >
      {/* Monolith Header — Matches /games Monolith style */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          padding: isMobile ? '14px 16px' : '18px 24px',
          borderRadius: '16px',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          background: 'linear-gradient(145deg, rgba(24, 24, 32, 0.75) 0%, rgba(12, 12, 18, 0.9) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
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
              <Flame size={12} /> PROVABLY FAIR · HIGH ROLLER TOURNAMENT
            </span>
          </div>
          <h1
            style={{
              fontSize: isMobile ? '1.4rem' : '1.85rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            GLOBAL LEADERBOARD
          </h1>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'rgba(255, 255, 255, 0.45)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Die aktivsten VIP-Spieler und High Roller im verifizierten Plattform-Vergleich.
          </p>
        </div>

        {/* Timeframe Switcher Tabs */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '4px',
            gap: '3px',
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
                  padding: isMobile ? '6px 10px' : '7px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  background: isActive ? 'linear-gradient(135deg, #D4AF37 0%, #AA8010 100%)' : 'transparent',
                  color: isActive ? '#000000' : 'rgba(255, 255, 255, 0.6)',
                  boxShadow: isActive ? '0 2px 8px rgba(212, 175, 55, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Live Tournament Ribbon */}
      <LeaderboardWeeklyBanner
        isMobile={isMobile}
        totalWagered={totalWagered}
        activePlayersCount={rows.length}
      />

      {/* Physical 3D Stepped VIP Podium Stage */}
      {!loading && rows.length >= 3 && (
        <LeaderboardPodium topThree={rows.slice(0, 3)} isMobile={isMobile} />
      )}

      {/* High Roller Stream Table */}
      <div>
        <LeaderboardStreamTable loading={loading} rows={rows} />
      </div>

      {/* Floating Sticky Personal Rank Bar */}
      <PersonalRankBar
        username={user?.email?.split('@')[0] || 'User'}
        rank={rank}
        level={level}
        wagered={analytics?.totalWagered ?? 0}
      />
    </div>
  );
}
