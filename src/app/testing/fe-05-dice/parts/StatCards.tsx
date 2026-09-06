'use client';

import { Percent, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardsProps {
  multiplier: number;
  winChance: number;
  targetPoint: number;
  isRollOver: boolean;
  onMultiplierPreset: (preset: number) => void;
  onToggleRollMode: () => void;
}

const MULTIPLIER_CARD_STYLES = {
  padding: '14px 16px',
  borderRadius: '14px',
  background: 'rgba(0, 0, 0, 0.22)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '6px',
  userSelect: 'none' as const,
  backdropFilter: 'blur(8px)',
};

function CardLabelRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {children}
    </div>
  );
}

function MetricValue({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: '1.35rem',
        fontWeight: 900,
        fontFamily: 'var(--font-mono, monospace)',
        color: '#F8FAFC',
      }}
    >
      {children}
    </span>
  );
}

function ProgressBar({ width, background }: { width: number; background: string }) {
  return (
    <div
      style={{
        height: '4px',
        width: '100%',
        borderRadius: '2px',
        background: 'rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{ height: '100%', width: `${width}%`, background }} />
    </div>
  );
}

export function StatCards({
  multiplier,
  winChance,
  targetPoint,
  isRollOver,
  onMultiplierPreset,
  onToggleRollMode,
}: StatCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginTop: '4px',
      }}
    >
      {/* Card 1: Multiplier (Subtil) */}
      <div style={MULTIPLIER_CARD_STYLES}>
        <CardLabelRow>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'rgba(212, 175, 55, 0.8)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            MULTIPLIER
          </span>
          <span style={{ fontSize: '0.72rem', color: 'rgba(212, 175, 55, 0.8)', fontWeight: 900 }}>
            ×
          </span>
        </CardLabelRow>
        <MetricValue>{multiplier.toFixed(2)}x</MetricValue>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[2, 5, 10, 50, 100].map((preset) => (
            <button
              key={`mult-${preset}`}
              type="button"
              onClick={() => onMultiplierPreset(preset)}
              style={{
                padding: '3px 7px',
                borderRadius: '5px',
                border:
                  multiplier === preset
                    ? '1px solid rgba(212, 175, 55, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                background:
                  multiplier === preset ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: multiplier === preset ? '#FFD700' : 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.65rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {preset}x
            </button>
          ))}
        </div>
      </div>

      {/* Card 2: Roll Over / Under Target (Subtil) */}
      <div style={MULTIPLIER_CARD_STYLES}>
        <CardLabelRow>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'rgba(212, 175, 55, 0.8)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {isRollOver ? 'ROLL OVER' : 'ROLL UNDER'}
          </span>
          <button
            type="button"
            onClick={onToggleRollMode}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 7px',
              borderRadius: '5px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#FFD700',
              fontSize: '0.64rem',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={9} />
            <span>SWAP</span>
          </button>
        </CardLabelRow>
        <MetricValue>{targetPoint.toFixed(2)}</MetricValue>
        <ProgressBar width={targetPoint} background={isRollOver ? '#EF4444' : '#10B981'} />
      </div>

      {/* Card 3: Win Chance (Subtil) */}
      <div style={MULTIPLIER_CARD_STYLES}>
        <CardLabelRow>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'rgba(212, 175, 55, 0.8)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            WIN CHANCE
          </span>
          <Percent size={11} color="rgba(212, 175, 55, 0.8)" />
        </CardLabelRow>
        <MetricValue>{winChance.toFixed(2)}%</MetricValue>
        <ProgressBar width={winChance} background="#10B981" />
      </div>
    </div>
  );
}
