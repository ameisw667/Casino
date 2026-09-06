'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { FlightState } from './crash-sandbox-types';

interface FlightStageFrameProps {
  shake: boolean;
  flightState: FlightState;
  currentMultiplier: number;
  children: ReactNode;
}

export function FlightStageFrame({
  shake,
  flightState,
  currentMultiplier,
  children,
}: FlightStageFrameProps) {
  return (
    <motion.div
      animate={shake ? { x: [-7, 7, -5, 5, -2, 2, 0], y: [-4, 4, -2, 2, 0] } : {}}
      transition={{ duration: 0.4 }}
      style={{
        width: '100%',
        borderRadius: '32px',
        background: '#07090E',
        border: '3px solid #2B1D12',
        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.99), inset 0 2px 6px rgba(255, 255, 255, 0.12)',
        padding: '16px',
        perspective: '1400px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Main Felt & Flight Deck Layer */}
      <div
        style={{
          width: '100%',
          minHeight: '520px',
          borderRadius: '24px',
          background: 'radial-gradient(ellipse at 50% 30%, #144832 0%, #0B2C1E 55%, #05160E 100%)',
          border: '1.5px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), inset 0 0 60px rgba(0, 0, 0, 0.7)',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Subtle Observatory 3D Panorama (Low Opacity) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/images/crash/observatory_backdrop.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            opacity: 0.14,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            filter: 'contrast(1.2) brightness(0.85)',
          }}
        />

        {/* Warm Gold Ambient Decken-Spotlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 18%, rgba(255, 235, 170, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Red Danger Glow on High Altitude */}
        {flightState === 'FLYING' && currentMultiplier >= 3.0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.min(0.55, (currentMultiplier - 3.0) * 0.15) }}
            style={{
              position: 'absolute',
              inset: 0,
              boxShadow: 'inset 0 0 80px 25px rgba(239, 68, 68, 0.45)',
              pointerEvents: 'none',
            }}
          />
        )}

        {children}
      </div>
    </motion.div>
  );
}
