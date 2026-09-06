'use client';

import { motion } from 'framer-motion';
import type { DiceRollHistory } from './HistoryTopRow';

interface RollDisplayProps {
  currentRollValue: number;
  displayTicker: number | null;
  rolling: boolean;
  isNearMiss: boolean;
  lastResult: DiceRollHistory | null;
  targetPoint: number;
}

export function RollDisplay({
  currentRollValue,
  displayTicker,
  rolling,
  isNearMiss,
  lastResult,
  targetPoint,
}: RollDisplayProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '175px',
        position: 'relative',
        zIndex: 5,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'none',
        caretColor: 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          userSelect: 'none',
        }}
      >
        {/* Ziffern mit sanftem, natürlichem Eigenschatten (ohne harten schwarzen Klotz) */}
        <motion.div
          key={lastResult?.id || displayTicker || 'satin-clean'}
          initial={{ scale: 0.96, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontSize: 'min(7.6rem, 15vw)',
            fontWeight: 900,
            lineHeight: 1,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-2px',
            color: '#FFFFFF',
            filter:
              'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          {currentRollValue.toFixed(2)}
        </motion.div>

        {/* Subtile edle Statuszeile */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '20px',
            background: rolling
              ? 'rgba(0, 0, 0, 0.25)'
              : lastResult?.win
                ? 'rgba(6, 78, 59, 0.45)'
                : 'rgba(127, 29, 29, 0.4)',
            border: rolling
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : lastResult?.win
                ? '1px solid rgba(52, 211, 153, 0.35)'
                : '1px solid rgba(248, 113, 113, 0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: rolling ? '#CBD5E1' : lastResult?.win ? '#34D399' : '#FCA5A5',
            }}
          >
            {rolling
              ? 'ROLLT...'
              : lastResult?.win
                ? `GEWINN! +${lastResult.multiplier.toFixed(2)}× AUSZAHLUNG`
                : isNearMiss
                  ? `KNAPP VERFEHLT (${Math.abs(lastResult!.roll - targetPoint).toFixed(2)})`
                  : `KEIN TREFFER (${lastResult?.roll.toFixed(2)})`}
          </span>
        </div>
      </div>
    </div>
  );
}
