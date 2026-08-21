'use client';
import React from 'react';
import { motion } from 'framer-motion';

export type GameFilterType = 'ALL' | 'CRASH' | 'DICE' | 'SLOTS' | 'ROULETTE' | 'BLACKJACK';
export type TimeFilterType = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';
export type OutcomeFilterType = 'ALL' | 'WINS' | 'LOSSES';

interface HistoryFilterBarProps {
  gameFilter: GameFilterType;
  setGameFilter: (filter: GameFilterType) => void;
  timeFilter: TimeFilterType;
  setTimeFilter: (filter: TimeFilterType) => void;
  outcomeFilter: OutcomeFilterType;
  setOutcomeFilter: (filter: OutcomeFilterType) => void;
  filteredCount: number;
  isMobile?: boolean;
}

export function HistoryFilterBar({
  gameFilter,
  setGameFilter,
  timeFilter,
  setTimeFilter,
  outcomeFilter,
  setOutcomeFilter,
  filteredCount,
  isMobile = false,
}: HistoryFilterBarProps) {
  const games: { key: GameFilterType; label: string }[] = [
    { key: 'ALL', label: 'Alle Spiele' },
    { key: 'CRASH', label: 'Crash' },
    { key: 'DICE', label: 'Dice' },
    { key: 'SLOTS', label: 'Slots' },
    { key: 'ROULETTE', label: 'Roulette' },
    { key: 'BLACKJACK', label: 'Blackjack' },
  ];

  const times: { key: TimeFilterType; label: string }[] = [
    { key: 'ALL', label: 'Alle' },
    { key: 'TODAY', label: '24h' },
    { key: 'WEEK', label: '7 Tage' },
    { key: 'MONTH', label: '30 Tage' },
  ];

  const outcomes: { key: OutcomeFilterType; label: string }[] = [
    { key: 'ALL', label: 'Alle' },
    { key: 'WINS', label: 'Gewinne' },
    { key: 'LOSSES', label: 'Verluste' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background:
          'linear-gradient(135deg, rgba(20, 22, 30, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        borderRadius: '16px',
        padding: isMobile ? '12px 14px' : '10px 16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Left Segment: Game Selection Filter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          padding: '2px 0',
          maxWidth: isMobile ? '100%' : 'auto',
        }}
      >
        {games.map((g) => {
          const isActive = gameFilter === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setGameFilter(g.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: '10px',
                border: isActive ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.06)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.05) 100%)'
                  : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? '#FFD700' : 'rgba(255, 255, 255, 0.65)',
                fontSize: '0.72rem',
                fontWeight: isActive ? 900 : 700,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 0 14px rgba(212, 175, 55, 0.2)' : 'none',
              }}
            >
              <span>{g.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Segment: Time & Outcome & Result Counter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {/* Time Segmented Control */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '10px',
            padding: '2px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {times.map((t) => {
            const isActive = timeFilter === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTimeFilter(t.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                  color: isActive ? '#FFD700' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.68rem',
                  fontWeight: isActive ? 900 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? 'inset 0 0 8px rgba(212, 175, 55, 0.2)' : 'none',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Outcome Segmented Control */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '10px',
            padding: '2px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {outcomes.map((o) => {
            const isActive = outcomeFilter === o.key;
            return (
              <button
                key={o.key}
                onClick={() => setOutcomeFilter(o.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive
                    ? o.key === 'WINS'
                      ? 'rgba(16, 185, 129, 0.25)'
                      : o.key === 'LOSSES'
                        ? 'rgba(239, 68, 68, 0.25)'
                        : 'rgba(255, 255, 255, 0.12)'
                    : 'transparent',
                  color: isActive
                    ? o.key === 'WINS'
                      ? '#10b981'
                      : o.key === 'LOSSES'
                        ? '#ef4444'
                        : '#ffffff'
                    : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.68rem',
                  fontWeight: isActive ? 900 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {/* Counter Badge */}
        <div
          style={{
            padding: '4px 10px',
            borderRadius: '10px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            fontSize: '0.66rem',
            fontWeight: 900,
            color: '#D4AF37',
            letterSpacing: '0.04em',
          }}
        >
          {filteredCount} WETTEN
        </div>
      </div>
    </motion.div>
  );
}
