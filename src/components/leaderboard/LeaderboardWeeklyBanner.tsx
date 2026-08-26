'use client';

import React, { useSyncExternalStore } from 'react';
import { useProgressiveJackpot } from '@/hooks/useProgressiveJackpot';

interface LeaderboardWeeklyBannerProps {
  isMobile?: boolean;
  totalWagered?: number;
  activePlayersCount?: number;
}

export interface ResetTimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function getTimeUntilNextReset(now: Date = new Date()): ResetTimeRemaining {
  const current = new Date(now);
  const day = current.getUTCDay();
  const nextSunday = new Date(current);

  const daysUntilSunday = (7 - day) % 7;
  nextSunday.setUTCDate(current.getUTCDate() + daysUntilSunday);
  nextSunday.setUTCHours(23, 59, 59, 999);

  let diffMs = nextSunday.getTime() - current.getTime();
  if (diffMs <= 0) {
    nextSunday.setUTCDate(nextSunday.getUTCDate() + 7);
    diffMs = nextSunday.getTime() - current.getTime();
  }

  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds };
}

let cachedSnapshot: ResetTimeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
let cachedTotalSeconds = -1;

function getSnapshot(): ResetTimeRemaining {
  const current = getTimeUntilNextReset();
  if (current.totalSeconds !== cachedTotalSeconds) {
    cachedTotalSeconds = current.totalSeconds;
    cachedSnapshot = current;
  }
  return cachedSnapshot;
}

const serverSnapshot: ResetTimeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
function getServerSnapshot(): ResetTimeRemaining {
  return serverSnapshot;
}

function subscribe(callback: () => void) {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);
}

export function LeaderboardWeeklyBanner({
  isMobile = false,
  totalWagered = 0,
  activePlayersCount = 0,
}: LeaderboardWeeklyBannerProps) {
  const timeLeft = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { formatted: jackpotFormatted } = useProgressiveJackpot();

  const formattedCountdown = `${timeLeft.days}T ${String(timeLeft.hours).padStart(2, '0')}h ${String(timeLeft.minutes).padStart(2, '0')}m ${String(timeLeft.seconds).padStart(2, '0')}s`;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '12px' : '24px',
        padding: isMobile ? '16px' : '18px 24px',
        borderRadius: '12px',
        background: '#111111',
        border: '1px solid #222222',
      }}
    >
      {/* 1. Progressive Jackpot */}
      <div>
        <div style={{ fontSize: '0.72rem', color: '#737373', fontWeight: 500, marginBottom: '4px' }}>
          Progressiver Jackpot
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontVariantNumeric: 'tabular-nums',
            fontSize: isMobile ? '1.15rem' : '1.3rem',
            fontWeight: 700,
            color: '#D4AF37',
            letterSpacing: '-0.02em',
          }}
        >
          {jackpotFormatted !== '—' ? jackpotFormatted : '$125,480.00'}
        </div>
      </div>

      {/* 2. Wochen-Reset */}
      <div>
        <div style={{ fontSize: '0.72rem', color: '#737373', fontWeight: 500, marginBottom: '4px' }}>
          Wöchentlicher Reset
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontVariantNumeric: 'tabular-nums',
            fontSize: isMobile ? '1.05rem' : '1.2rem',
            fontWeight: 600,
            color: '#E5E5E5',
            letterSpacing: '-0.01em',
          }}
        >
          {formattedCountdown}
        </div>
      </div>

      {/* 3. Gesamt-Einsatz */}
      <div>
        <div style={{ fontSize: '0.72rem', color: '#737373', fontWeight: 500, marginBottom: '4px' }}>
          Gesamter Einsatz
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontVariantNumeric: 'tabular-nums',
            fontSize: isMobile ? '1.05rem' : '1.2rem',
            fontWeight: 600,
            color: '#E5E5E5',
            letterSpacing: '-0.01em',
          }}
        >
          ${totalWagered.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
      </div>

      {/* 4. Platzierte Spieler */}
      <div>
        <div style={{ fontSize: '0.72rem', color: '#737373', fontWeight: 500, marginBottom: '4px' }}>
          Qualifizierte Spieler
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontVariantNumeric: 'tabular-nums',
            fontSize: isMobile ? '1.05rem' : '1.2rem',
            fontWeight: 600,
            color: '#E5E5E5',
            letterSpacing: '-0.01em',
          }}
        >
          {activePlayersCount} High Roller
        </div>
      </div>
    </div>
  );
}
