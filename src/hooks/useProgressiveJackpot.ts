'use client';
import { useCallback, useEffect, useState } from 'react';
import { CasinoLogger } from '@/lib/casino/logger';

// worldmap/01_LiveProgressiveJackpot.md, L5 — bestätigt: Polling zuerst,
// Realtime als separater Folgeschritt. 12s liegt im bestätigten 10-15s-Fenster.
const POLL_INTERVAL_MS = 12_000;

interface JackpotPoolResponse {
  currentAmount: number;
  lastWonAt: string | null;
}

function formatJackpot(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Reads the server-authoritative jackpot pool via GET /api/casino/jackpot
 * and polls it. Never fabricates a value: starts at null (rendered as "—")
 * until the first successful fetch, and on a failed poll keeps showing the
 * last known-good amount instead of resetting to a placeholder (R25,
 * worldmap/01_LiveProgressiveJackpot.md) — the client never originates or
 * advances the amount itself. `jackpot` deliberately stays nullable in the
 * return value too, so a future consumer can't silently treat "unknown" as
 * a fabricated $0 the way `formatted` already avoids.
 */
export function useProgressiveJackpot() {
  const [jackpot, setJackpot] = useState<number | null>(null);

  const fetchPool = useCallback(async () => {
    try {
      const response = await fetch('/api/casino/jackpot', {
        cache: 'no-store',
        credentials: 'omit',
      });
      if (!response.ok) return;
      const raw = (await response.json()) as { data?: JackpotPoolResponse } | JackpotPoolResponse;
      const data: JackpotPoolResponse = (
        raw && 'data' in raw && raw.data ? raw.data : raw
      ) as JackpotPoolResponse;
      if (typeof data.currentAmount !== 'number' || !Number.isFinite(data.currentAmount)) return;
      setJackpot(data.currentAmount);
    } catch (error) {
      // Keep showing the last known-good value, never fabricate one — but
      // still surface the outage so a sustained failure isn't invisible.
      CasinoLogger.warn('useProgressiveJackpot', 'Failed to fetch jackpot pool', error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPool();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchPool();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchPool]);

  return {
    jackpot,
    formatted: jackpot === null ? '—' : formatJackpot(jackpot),
  };
}
