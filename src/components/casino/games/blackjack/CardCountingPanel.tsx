'use client';

import React from 'react';
import { Eye, Calculator } from 'lucide-react';

interface CardCountingPanelProps {
  runningCount: number;
  cardsDealt: number;
  totalDecks?: number;
}

export default function CardCountingPanel({
  runningCount,
  cardsDealt,
  totalDecks = 6,
}: CardCountingPanelProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  const totalCards = totalDecks * 52;
  const cardsRemaining = Math.max(1, totalCards - cardsDealt);
  const decksRemaining = Math.max(0.5, parseFloat((cardsRemaining / 52).toFixed(1)));
  const trueCount = parseFloat((runningCount / decksRemaining).toFixed(1));
  const penetrationPercent = Math.min(100, Math.round((cardsDealt / totalCards) * 100));

  const isAdvantage = trueCount >= 2;
  const isDisadvantage = trueCount <= -2;

  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '14px',
        background: 'rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Header with Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calculator size={14} color="#FFD700" />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              color: '#FFD700',
              letterSpacing: '0.5px',
            }}
          >
            HI-LO COUNTING ENGINE
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.65rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <Eye size={12} />
          <span>{isOpen ? 'HIDE' : 'SHOW'}</span>
        </button>
      </div>

      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Main Counters Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {/* Running Count */}
            <div
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 800 }}>
                RUNNING COUNT
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  color: runningCount > 0 ? '#4ade80' : runningCount < 0 ? '#f87171' : '#FFF',
                }}
              >
                {runningCount > 0 ? `+${runningCount}` : runningCount}
              </div>
            </div>

            {/* True Count */}
            <div
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 800 }}>
                TRUE COUNT
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  color: trueCount > 0 ? '#4ade80' : trueCount < 0 ? '#f87171' : '#FFF',
                }}
              >
                {trueCount > 0 ? `+${trueCount}` : trueCount}
              </div>
            </div>
          </div>

          {/* Deck Penetration Bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '3px',
                fontSize: '0.58rem',
                color: '#64748b',
                fontWeight: 800,
              }}
            >
              <span>SHOE PENETRATION</span>
              <span>
                {penetrationPercent}% ({decksRemaining} Decks left)
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '5px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${penetrationPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 100%)',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Advantage Badge */}
          <div
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              background: isAdvantage
                ? 'rgba(16, 185, 129, 0.15)'
                : isDisadvantage
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(255, 255, 255, 0.04)',
              border: isAdvantage
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : isDisadvantage
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.64rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: isAdvantage ? '#4ade80' : isDisadvantage ? '#f87171' : '#94a3b8',
            }}
          >
            <span>STATUS:</span>
            <span>
              {isAdvantage
                ? '⚡ PLAYER ADVANTAGE'
                : isDisadvantage
                  ? 'HOUSE ADVANTAGE'
                  : 'NEUTRAL DECK'}
            </span>
          </div>

          {/* Quick Hi-Lo Legend */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              fontSize: '0.55rem',
              fontWeight: 800,
              textAlign: 'center',
              color: '#64748b',
              paddingTop: '2px',
            }}
          >
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                padding: '2px 0',
                borderRadius: '4px',
                color: '#4ade80',
              }}
            >
              2-6: +1
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '2px 0',
                borderRadius: '4px',
                color: '#cbd5e1',
              }}
            >
              7-9: 0
            </div>
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                padding: '2px 0',
                borderRadius: '4px',
                color: '#f87171',
              }}
            >
              10-A: -1
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
