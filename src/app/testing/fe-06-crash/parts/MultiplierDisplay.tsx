'use client';

import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import type { FlightState } from './crash-sandbox-types';

interface MultiplierDisplayProps {
  flightState: FlightState;
  currentMultiplier: number;
  crashPoint: number;
  cashoutGain: number | null;
}

export function MultiplierDisplay({
  flightState,
  currentMultiplier,
  crashPoint,
  cashoutGain,
}: MultiplierDisplayProps) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {flightState === 'CRASHED' ? (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.15, 1], opacity: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '3.6rem',
              fontWeight: 900,
              color: '#EF4444',
              fontFamily: 'monospace',
              filter: 'drop-shadow(0 4px 25px rgba(239, 68, 68, 0.7))',
              letterSpacing: '-0.02em',
            }}
          >
            CRASHED @ {crashPoint.toFixed(2)}×
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#F87171',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            💥 SUPERNOVA IMPACT // JET FRAGMENTIERT
          </div>
        </motion.div>
      ) : flightState === 'CASHED_OUT' ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div
            style={{
              fontSize: '3.8rem',
              fontWeight: 900,
              color: '#34D399',
              fontFamily: 'monospace',
              filter: 'drop-shadow(0 4px 20px rgba(16, 185, 129, 0.6))',
            }}
          >
            {currentMultiplier.toFixed(2)}×
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '0.88rem',
              fontWeight: 800,
            }}
          >
            <Award size={16} />
            AUSZAHLUNG +${cashoutGain?.toFixed(2)}
          </div>
        </motion.div>
      ) : (
        <div
          style={{
            fontSize: '4.4rem',
            fontWeight: 900,
            color: '#FFFDF0',
            fontFamily: 'monospace',
            letterSpacing: '-0.03em',
            filter: 'drop-shadow(0 4px 14px rgba(0, 0, 0, 0.55))',
          }}
        >
          {currentMultiplier.toFixed(2)}×
        </div>
      )}
    </div>
  );
}
