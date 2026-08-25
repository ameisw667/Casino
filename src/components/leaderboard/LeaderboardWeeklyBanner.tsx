'use client';

import React, { useSyncExternalStore } from 'react';
import { Trophy, Clock, TrendingUp, Users } from 'lucide-react';
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

  const formattedCountdown = `${String(timeLeft.days).padStart(2, '0')}T : ${String(timeLeft.hours).padStart(2, '0')}Std : ${String(timeLeft.minutes).padStart(2, '0')}Min : ${String(timeLeft.seconds).padStart(2, '0')}Sek`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: isMobile ? '8px' : '16px',
        padding: isMobile ? '10px 14px' : '12px 20px',
        borderRadius: '12px',
        background: 'linear-gradient(90deg, rgba(20, 20, 28, 0.85) 0%, rgba(10, 10, 14, 0.95) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* 1. Progressive Jackpot Item */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trophy size={14} color="#D4AF37" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              PROGRESSIVE JACKPOT
            </span>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '1rem',
              fontWeight: 900,
              color: '#FFD700',
              lineHeight: 1.1,
            }}
          >
            {jackpotFormatted !== '—' ? jackpotFormatted : '$125,480.00'}
          </div>
        </div>
      </div>

      {/* Divider */}
      {!isMobile && (
        <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.08)' }} />
      )}

      {/* 2. Tournament Reset Countdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Clock size={14} color="#CBD5E1" />
        </div>
        <div>
          <div style={{ fontSize: '0.58rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            WOCHEN-RESET IN
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.1,
            }}
          >
            {formattedCountdown}
          </div>
        </div>
      </div>

      {/* Divider */}
      {!isMobile && (
        <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.08)' }} />
      )}

      {/* 3. Gesamt-Volumen */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrendingUp size={14} color="#D4AF37" />
        </div>
        <div>
          <div style={{ fontSize: '0.58rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            GESAMT-VOLUMEN
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#D4AF37',
              lineHeight: 1.1,
            }}
          >
            ${totalWagered.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Divider */}
      {!isMobile && (
        <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.08)' }} />
      )}

      {/* 4. Active Players Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Users size={14} color="#38BDF8" />
        </div>
        <div>
          <div style={{ fontSize: '0.58rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            HIGH ROLLER
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.1,
            }}
          >
            {activePlayersCount} Spieler
          </div>
        </div>
      </div>
    </div>
  );
}
