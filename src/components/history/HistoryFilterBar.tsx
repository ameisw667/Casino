'use client';
import React from 'react';

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
    { key: 'ALL', label: 'Alle Zeit' },
    { key: 'TODAY', label: 'Heute' },
    { key: 'WEEK', label: '7 Tage' },
    { key: 'MONTH', label: '30 Tage' },
  ];

  const outcomes: { key: OutcomeFilterType; label: string }[] = [
    { key: 'ALL', label: 'Alle' },
    { key: 'WINS', label: 'Gewinne' },
    { key: 'LOSSES', label: 'Verluste' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'rgba(14, 16, 22, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        borderRadius: '16px',
        padding: isMobile ? '12px' : '14px 18px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.45)',
      }}
    >
      {/* Row 1: Game Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
        }}
      >
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginRight: '6px',
            flexShrink: 0,
          }}
        >
          Spiel:
        </span>
        {games.map((g) => {
          const isActive = gameFilter === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setGameFilter(g.key)}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                border: isActive
                  ? '1px solid #D4AF37'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.08) 100%)'
                  : 'rgba(255, 255, 255, 0.025)',
                color: isActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.65)',
                fontWeight: 800,
                fontSize: '0.72rem',
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
                boxShadow: isActive ? '0 0 12px rgba(212, 175, 55, 0.25)' : 'none',
              }}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Row 2: Time Filter Pills & Outcome Filter Pills */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '8px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginRight: '6px',
              flexShrink: 0,
            }}
          >
            Zeitraum:
          </span>
          {times.map((t) => {
            const isActive = timeFilter === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTimeFilter(t.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: isActive
                    ? '1px solid rgba(212, 175, 55, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isActive
                    ? 'rgba(212, 175, 55, 0.15)'
                    : 'rgba(255, 255, 255, 0.02)',
                  color: isActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.55)',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Outcome Filter & Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            {outcomes.map((o) => {
              const isActive = outcomeFilter === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setOutcomeFilter(o.key)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: isActive
                      ? o.key === 'WINS'
                        ? '1px solid #10b981'
                        : o.key === 'LOSSES'
                          ? '1px solid #ef4444'
                          : '1px solid rgba(255, 255, 255, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    background: isActive
                      ? o.key === 'WINS'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : o.key === 'LOSSES'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.02)',
                    color: isActive
                      ? o.key === 'WINS'
                        ? '#10b981'
                        : o.key === 'LOSSES'
                          ? '#f87171'
                          : '#ffffff'
                      : 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.7rem',
              fontWeight: 800,
              color: '#D4AF37',
              letterSpacing: '0.04em',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              padding: '3px 8px',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {filteredCount} Wetten
          </div>
        </div>
      </div>
    </div>
  );
}
