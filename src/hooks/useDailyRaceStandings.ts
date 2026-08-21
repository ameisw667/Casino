'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CasinoLogger } from '@/lib/casino/logger';

// worldmap/05_DAILY_TOURNAMENT.md, L5 — less time-critical than the jackpot's 12s poll
// (useProgressiveJackpot.ts), so 30s keeps the standings fresh without extra load.
const POLL_INTERVAL_MS = 30_000;
const COUNTDOWN_TICK_MS = 1_000;

export interface DailyRaceStanding {
  rank: number;
  username: string;
  wagered: number;
  prize: number;
}

interface DailyRaceResponse {
  standings: DailyRaceStanding[];
  secondsUntilResetUtc: number;
}

/**
 * Reads the server-authoritative daily race standings via GET /api/tournaments/daily-race
 * and polls it. Never fabricates entries: starts at an empty list until the first
 * successful fetch, and on a failed poll keeps showing the last known-good standings
 * instead of resetting (same principle as useProgressiveJackpot.ts). The countdown ticks
 * locally every second between polls and re-syncs to the server value on every poll, so
 * client clock drift never accumulates beyond one poll interval.
 */
export function useDailyRaceStandings() {
  const [standings, setStandings] = useState<DailyRaceStanding[]>([]);
  const [secondsUntilReset, setSecondsUntilReset] = useState<number | null>(null);
  const countdownAnchorRef = useRef<{ seconds: number; setAt: number } | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      const response = await fetch('/api/tournaments/daily-race', {
        cache: 'no-store',
        credentials: 'omit',
      });
      if (!response.ok) return;
      const data: DailyRaceResponse = await response.json();
      if (!Array.isArray(data.standings)) return;
      if (typeof data.secondsUntilResetUtc !== 'number' || !Number.isFinite(data.secondsUntilResetUtc)) {
        return;
      }
      setStandings(data.standings);
      countdownAnchorRef.current = { seconds: data.secondsUntilResetUtc, setAt: Date.now() };
      setSecondsUntilReset(data.secondsUntilResetUtc);
    } catch (error) {
      CasinoLogger.warn('useDailyRaceStandings', 'Failed to fetch daily race standings', error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStandings();
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchStandings();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(pollInterval);
  }, [fetchStandings]);

  useEffect(() => {
    const tickInterval = setInterval(() => {
      const anchor = countdownAnchorRef.current;
      if (!anchor) return;
      const elapsedSeconds = Math.floor((Date.now() - anchor.setAt) / 1000);
      setSecondsUntilReset(Math.max(0, anchor.seconds - elapsedSeconds));
    }, COUNTDOWN_TICK_MS);
    return () => clearInterval(tickInterval);
  }, []);

  return { standings, secondsUntilReset };
}

export function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}
