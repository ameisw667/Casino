'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { RouletteNumber } from './types';
import { KineticTextReveal } from '@/components/casino/typography/KineticTextReveal';

interface RouletteWinnerRevealProps {
  spinning: boolean;
  winningNumber: RouletteNumber | null;
  lastWinAmount: number | null;
  lastMultiplier: number | null;
}

/**
 * Winner number reveal HUD shown beneath the wheel once the spin settles.
 * Pure presentational — extracted verbatim from RouletteClient.tsx.
 */
export function RouletteWinnerReveal({
  spinning,
  winningNumber,
  lastWinAmount,
  lastMultiplier,
}: RouletteWinnerRevealProps) {
  return (
    <AnimatePresence>
      {!spinning && winningNumber && (
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(14, 14, 20, 0.95)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            padding: '8px 24px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.3)',
            marginTop: '-20px',
            zIndex: 40,
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                winningNumber.c === 'GREEN'
                  ? '#059669'
                  : winningNumber.c === 'RED'
                    ? '#dc2626'
                    : '#0B0E14',
              border: winningNumber.c === 'BLACK' ? '1.5px solid #D4AF37' : 'none',
              boxShadow:
                winningNumber.c === 'GREEN'
                  ? '0 0 15px rgba(16, 185, 129, 0.5)'
                  : winningNumber.c === 'RED'
                    ? '0 0 15px rgba(239, 68, 68, 0.5)'
                    : '0 0 15px rgba(212, 175, 55, 0.4)',
            }}
          >
            <KineticTextReveal
              text={String(winningNumber.n)}
              triggerKey={winningNumber.n}
              variant="impact"
              colorScheme="custom"
              customColor="#FFFFFF"
              skewAngle={12}
              fontSize="1.4rem"
              fontFamily="monospace"
              fontWeight={900}
            />
          </div>
          <div>
            <KineticTextReveal
              text={`${winningNumber.c} · ${winningNumber.n === 0 ? 'ZERO' : winningNumber.n % 2 === 0 ? 'EVEN' : 'ODD'}`}
              triggerKey={`${winningNumber.n}-${winningNumber.c}`}
              variant="smooth"
              colorScheme={winningNumber.c === 'GREEN' ? 'emerald' : winningNumber.c === 'RED' ? 'ruby' : 'gold'}
              fontSize="0.75rem"
              fontFamily="var(--font-heading, 'Cinzel', serif)"
              fontWeight={800}
              letterSpacing="0.08em"
            />
            {lastWinAmount !== null && lastWinAmount > 0 ? (
              <div
                style={{
                  color: '#4ade80',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  fontSize: '1.15rem',
                  marginTop: '2px',
                }}
              >
                +${lastWinAmount.toFixed(2)} ({lastMultiplier}×)
              </div>
            ) : (
              <div style={{ color: '#64748b', fontWeight: 800, fontSize: '0.85rem', marginTop: '2px' }}>NO WIN</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
