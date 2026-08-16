'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoinShowerProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const COIN_COUNT = 28;

interface CoinConfig {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  rotateEnd: number;
  xOffset: number;
}

// Deterministic coin trajectory configs (pure, no Math.random inside render/useMemo)
const STATIC_COINS: CoinConfig[] = Array.from({ length: COIN_COUNT }).map((_, i) => {
  const pseudoSeed = (i * 37 + 13) % 100;
  const pseudoSeed2 = (i * 53 + 29) % 100;
  return {
    id: i,
    left: 4 + (i * 92) / COIN_COUNT + ((pseudoSeed % 10) - 5),
    size: 24 + (pseudoSeed % 16),
    delay: (pseudoSeed2 % 40) / 100,
    duration: 1.5 + (pseudoSeed % 50) / 100,
    rotateEnd: (i % 2 === 0 ? 1 : -1) * (360 + pseudoSeed * 7),
    xOffset: (pseudoSeed % 80) - 40,
  };
});

export function CoinShower({ isVisible }: CoinShowerProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 40,
          }}
        >
          {STATIC_COINS.map((coin) => (
            <motion.div
              key={coin.id}
              initial={{
                top: -50,
                left: `${coin.left}%`,
                opacity: 0,
                scale: 0.6,
                rotate: 0,
                x: 0,
              }}
              animate={{
                top: '110%',
                opacity: [0, 1, 1, 0.8, 0],
                scale: [0.6, 1.1, 1, 0.9],
                rotate: coin.rotateEnd,
                x: coin.xOffset,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: coin.duration,
                delay: coin.delay,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                position: 'absolute',
                width: `${coin.size}px`,
                height: `${coin.size}px`,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 35% 35%, #FFF9D2 0%, #FFD700 40%, #B8860B 85%, #6B4E00 100%)',
                border: '1.5px solid #FFE066',
                boxShadow:
                  '0 0 12px rgba(255, 215, 0, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5C4300',
                fontFamily: 'monospace',
                fontWeight: 900,
                fontSize: `${coin.size * 0.45}px`,
                textShadow: '0 1px 1px rgba(255, 255, 255, 0.6)',
              }}
            >
              $
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
