'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RipplePoint {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface GameRippleTransitionProps {
  triggerSignal?: number | string | boolean;
  className?: string;
  children?: React.ReactNode;
}

export function GameRippleTransition({
  triggerSignal,
  children,
}: GameRippleTransitionProps) {
  const [ripples, setRipples] = useState<RipplePoint[]>([
    { id: 1, x: 50, y: 50, timestamp: 0 },
  ]);

  const triggerRippleAt = useCallback((xPercent: number, yPercent: number) => {
    const newRipple: RipplePoint = {
      id: Math.random(),
      x: xPercent,
      y: yPercent,
      timestamp: 0,
    };
    setRipples((prev) => [...prev.slice(-3), newRipple]);
  }, []);

  // Listen to external triggerSignal (e.g. round start/reset)
  useEffect(() => {
    if (triggerSignal !== undefined) {
      const timer = window.setTimeout(() => {
        setRipples((prev) => [
          ...prev.slice(-3),
          { id: Math.random(), x: 50, y: 50, timestamp: 0 },
        ]);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [triggerSignal]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    triggerRippleAt(x, y);
  };

  return (
    <div
      data-testid="game-ripple-transition"
      onClick={handleContainerClick}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Shockwave chromatic ripples */}
      <AnimatePresence>
        {ripples.map((rip) => (
          <div
            key={rip.id}
            style={{
              position: 'absolute',
              left: `${rip.x}%`,
              top: `${rip.y}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 15,
            }}
          >
            {/* Primary 24k Gold Shockwave Ring */}
            <motion.div
              initial={{ width: 0, height: 0, opacity: 0.85, scale: 0.2 }}
              animate={{ width: 600, height: 600, opacity: 0, scale: 2.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                borderRadius: '50%',
                border: '2px solid rgba(212, 175, 55, 0.9)',
                boxShadow:
                  '0 0 35px rgba(212, 175, 55, 0.8), inset 0 0 25px rgba(212, 175, 55, 0.4)',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Chromatic Aberration Blue/Cyan Outer Halo */}
            <motion.div
              initial={{ width: 0, height: 0, opacity: 0.6, scale: 0.3 }}
              animate={{ width: 640, height: 640, opacity: 0, scale: 2.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                borderRadius: '50%',
                border: '1.5px solid rgba(6, 182, 212, 0.7)',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Chromatic Aberration Magenta Inner Wave */}
            <motion.div
              initial={{ width: 0, height: 0, opacity: 0.5, scale: 0.15 }}
              animate={{ width: 560, height: 560, opacity: 0, scale: 2.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              style={{
                borderRadius: '50%',
                border: '1.5px solid rgba(236, 72, 153, 0.6)',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        ))}
      </AnimatePresence>

      {/* Children game content */}
      {children}
    </div>
  );
}
