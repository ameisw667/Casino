'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiceSpotlightCanvasProps {
  isRolling: boolean;
  isWin: boolean | null;
  triggerShockwave: number; // Increment counter on each roll finish
  isMobile: boolean;
}

export function DiceSpotlightCanvas({
  isRolling,
  isWin,
  triggerShockwave,
  isMobile: _isMobile,
}: DiceSpotlightCanvasProps) {
  // Grundfarbe des Scheinwerfers (subtil, warmes Studio-Spotlight)
  const spotlightColor = useMemo(() => {
    if (isRolling) return 'rgba(255, 240, 200, 0.14)';
    if (isWin === true) return 'rgba(16, 185, 129, 0.16)';
    if (isWin === false) return 'rgba(239, 68, 68, 0.14)';
    return 'rgba(255, 240, 200, 0.09)';
  }, [isRolling, isWin]);

  const shockwaveColor = useMemo(() => {
    if (isWin === true) return 'rgba(16, 185, 129, 0.85)';
    if (isWin === false) return 'rgba(239, 68, 68, 0.8)';
    return 'rgba(212, 175, 55, 0.8)';
  }, [isWin]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        zIndex: 1,
      }}
    >
      {/* ── 1. GERICHTETER SCHEINWERFER-KEGEL (STUDIO SPOTLIGHT) ── */}
      <motion.div
        animate={{
          background: isRolling
            ? [
                `radial-gradient(circle at 50% 45%, ${spotlightColor} 0%, transparent 60%)`,
                `radial-gradient(circle at 48% 30%, ${spotlightColor} 0%, transparent 65%)`,
                `radial-gradient(circle at 53% 25%, ${spotlightColor} 0%, transparent 70%)`,
                `radial-gradient(circle at 50% 50%, ${spotlightColor} 0%, transparent 55%)`,
              ]
            : `radial-gradient(circle at 50% 40%, ${spotlightColor} 0%, transparent 60%)`,
        }}
        transition={{
          duration: isRolling ? 0.6 : 0.6,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── 2. SUBTILER ATMOSPHÄRISCHER WIN / LOSS UMSCHLAG DES FILZES ── */}
      <motion.div
        animate={{
          opacity: isWin !== null && !isRolling ? 0.18 : 0,
          background:
            isWin === true
              ? 'radial-gradient(ellipse at 50% 40%, rgba(16, 185, 129, 0.35) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at 50% 40%, rgba(239, 68, 68, 0.30) 0%, transparent 70%)',
        }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── 3. FEINE OPTISCHE LANDUNGS-SCHOCKWELLE (Zarter Impuls-Ring) ── */}
      <AnimatePresence>
        {triggerShockwave > 0 && !isRolling && (
          <motion.div
            key={triggerShockwave}
            initial={{
              width: 24,
              height: 24,
              x: '-50%',
              y: '-50%',
              opacity: 0.85,
              borderWidth: 1.5,
            }}
            animate={{
              width: [24, 420],
              height: [24, 420],
              opacity: [0.85, 0],
              borderWidth: [1.5, 0.5],
            }}
            transition={{
              duration: 0.68,
              ease: [0.1, 0.7, 0.3, 1],
            }}
            style={{
              position: 'absolute',
              top: '46%',
              left: '50%',
              borderRadius: '50%',
              borderStyle: 'solid',
              borderColor: shockwaveColor,
              boxShadow: `0 0 10px ${shockwaveColor}`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
