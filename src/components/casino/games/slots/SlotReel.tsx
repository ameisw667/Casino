'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { SlotSymbol, type SymbolType } from '@/components/casino/SlotSymbol';
import { soundManager } from '@/lib/casino/sound-manager';

const FILLER_COUNT = 18;
export const SLOT_CELL_HEIGHT = 112;
const VISIBLE_ROWS = 3;
export const REEL_WINDOW_HEIGHT = SLOT_CELL_HEIGHT * VISIBLE_ROWS; // 336px

interface SlotReelProps {
  finalSymbols: [SymbolType, SymbolType, SymbolType];
  isSpinning: boolean;
  stopDelay: number;
  winningRows: [boolean, boolean, boolean];
  symbolPool: SymbolType[];
  isAnticipating?: boolean;
  hasWinInCabinet?: boolean;
  onStopComplete?: () => void;
}

export function SlotReel({
  finalSymbols,
  isSpinning,
  stopDelay,
  winningRows,
  symbolPool,
  isAnticipating = false,
  hasWinInCabinet = false,
  onStopComplete,
}: SlotReelProps) {
  const controls = useAnimationControls();
  const isAnimating = useRef(false);
  const prevSymbolsRef = useRef<[SymbolType, SymbolType, SymbolType]>([...finalSymbols]);
  const [strip, setStrip] = useState<SymbolType[]>([...finalSymbols]);

  // Construct strip on spin start: 3 prevSymbols + 18 filler + 3 finalSymbols = 24 items
  useLayoutEffect(() => {
    if (isSpinning && !isAnimating.current) {
      isAnimating.current = true;
      controls.set({ y: 0 });

      const filler = Array.from(
        { length: FILLER_COUNT },
        () => symbolPool[Math.floor(Math.random() * symbolPool.length)],
      );

      const fullStrip = [...prevSymbolsRef.current, ...filler, ...finalSymbols];
      setStrip(fullStrip);
    } else if (!isSpinning && !isAnimating.current) {
      prevSymbolsRef.current = [...finalSymbols];
      setStrip([...finalSymbols]);
      controls.set({ y: 0 });
    }
  }, [isSpinning, finalSymbols, symbolPool, controls]);

  // Run scroll and land precisely on index 21 (finalSymbols)
  useEffect(() => {
    if (!isSpinning || !isAnimating.current) return;

    // Distance to index 21: (3 prev + 18 filler) * 112 = -2352px
    const totalY = -((3 + FILLER_COUNT) * SLOT_CELL_HEIGHT);

    controls
      .start({
        y: totalY,
        transition: {
          duration: 1.0 + (stopDelay / 1000) * 0.25,
          delay: stopDelay / 1000,
          ease: [0.12, 0, 0.39, 0],
        },
      })
      .then(() =>
        controls.start({
          y: totalY + 8,
          transition: { duration: 0.08, ease: 'easeOut' },
        }),
      )
      .then(() =>
        controls.start({
          y: totalY,
          transition: { duration: 0.1, ease: 'easeIn' },
        }),
      )
      .then(() => {
        isAnimating.current = false;
        prevSymbolsRef.current = [...finalSymbols];
        soundManager.play('chip');
        onStopComplete?.();
      });
  }, [isSpinning, stopDelay, controls, onStopComplete, finalSymbols]);

  const symbolSize = Math.round(SLOT_CELL_HEIGHT * 0.72);

  return (
    <div
      className={`slot-reel-window${isSpinning ? 'spinning' : ''}`}
      style={{
        width: '100%',
        height: `${REEL_WINDOW_HEIGHT}px`,
        maxHeight: `${REEL_WINDOW_HEIGHT}px`,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: '12px',
        background: '#07070a',
        border: isAnticipating ? '2px solid #FFD700' : '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: isAnticipating
          ? '0 0 25px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.25)'
          : 'inset 0 0 20px rgba(0, 0, 0, 0.95)',
        transition: 'border 0.3s ease, box-shadow 0.3s ease',
        contain: 'paint',
        isolation: 'isolate',
      }}
    >
      <motion.div
        animate={controls}
        className="slot-reel-strip"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          willChange: 'transform',
        }}
      >
        {strip.map((sym, i) => {
          const isWin =
            !isSpinning &&
            (strip.length === 3
              ? winningRows[i]
              : i >= strip.length - 3 && winningRows[i - (strip.length - 3)]);

          const isDimmed = !isSpinning && hasWinInCabinet && !isWin;

          return (
            <div
              key={i}
              className={`slot-cell${isWin ? 'winning' : ''}`}
              style={{
                width: '100%',
                height: `${SLOT_CELL_HEIGHT}px`,
                minHeight: `${SLOT_CELL_HEIGHT}px`,
                maxHeight: `${SLOT_CELL_HEIGHT}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxSizing: 'border-box',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                opacity: isDimmed ? 0.38 : 1,
                filter: isDimmed ? 'grayscale(40%)' : 'none',
                transform: isWin ? 'scale(1.08)' : 'scale(1)',
                background: isWin
                  ? 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.45) 0%, rgba(10, 10, 15, 0.95) 100%)'
                  : 'transparent',
                boxShadow: isWin
                  ? '0 0 25px rgba(255, 215, 0, 0.7), inset 0 0 15px rgba(255, 215, 0, 0.4)'
                  : 'none',
                borderRadius: isWin ? '10px' : '0px',
                zIndex: isWin ? 5 : 1,
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <SlotSymbol type={sym} size={symbolSize} isWinning={Boolean(isWin)} />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
