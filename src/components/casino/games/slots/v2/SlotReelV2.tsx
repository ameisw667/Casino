'use client';
import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import type { SymbolType } from '@/components/casino/SlotSymbol';
import { SlotSymbolV2 } from './SlotSymbolV2';

const FILLER_COUNT = 18;
const DEFAULT_CELL_SIZE = 112;
// Must match .slot-v2-reel-window { height: calc(var(--slot-v2-cell-size) * 3) } in globals.css
const VISIBLE_ROWS = 3;

interface SlotReelV2Props {
  finalSymbols: [SymbolType, SymbolType, SymbolType];
  isSpinning: boolean;
  stopDelay: number;
  winningRows: [boolean, boolean, boolean];
  symbolPool: SymbolType[];
}

function useCellSize() {
  const [size, setSize] = useState(DEFAULT_CELL_SIZE);
  const frameRef = useRef<HTMLDivElement | null>(null);

  // --slot-v2-cell-size is a clamp()/min() expression — getComputedStyle
  // returns custom properties as their unresolved source string, so
  // parseFloat() on it always fails. Measure the actual rendered box
  // instead, which the browser has already resolved to real pixels.
  const measure = useCallback(() => {
    if (!frameRef.current) return;
    const parsed = frameRef.current.getBoundingClientRect().height / VISIBLE_ROWS;
    if (Number.isFinite(parsed) && parsed > 0) {
      setSize(parsed);
    }
  }, []);

  return { size, frameRef, measure };
}

export function SlotReelV2({
  finalSymbols,
  isSpinning,
  stopDelay,
  winningRows,
  symbolPool,
}: SlotReelV2Props) {
  const controls = useAnimationControls();
  const isAnimating = useRef(false);
  const spinStarted = useRef(false);
  const [strip, setStrip] = useState<SymbolType[]>([...finalSymbols]);
  const { size: symbolHeight, frameRef, measure } = useCellSize();

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const handleResize = () => measure();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measure]);

  useLayoutEffect(() => {
    if (!isSpinning) {
      spinStarted.current = false;
      return;
    }
    if (spinStarted.current) {
      setStrip((prev) => {
        const updated = [...prev];
        updated[FILLER_COUNT] = finalSymbols[0];
        updated[FILLER_COUNT + 1] = finalSymbols[1];
        updated[FILLER_COUNT + 2] = finalSymbols[2];
        return updated;
      });
      return;
    }
    spinStarted.current = true;
    controls.set({ y: 0 });
    const filler = Array.from(
      { length: FILLER_COUNT },
      () => symbolPool[Math.floor(Math.random() * symbolPool.length)],
    );
    setStrip([...filler, ...finalSymbols]);
  }, [isSpinning, finalSymbols, symbolPool, controls]);

  useEffect(() => {
    if (!isSpinning || isAnimating.current) return;
    isAnimating.current = true;

    const totalY = -(FILLER_COUNT * symbolHeight);

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
          y: totalY + Math.max(6, symbolHeight * 0.06),
          transition: { duration: 0.07, ease: 'easeOut' },
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
      });
  }, [isSpinning, stopDelay, controls, symbolHeight]);

  const symbolSize = Math.max(44, Math.round(symbolHeight * 0.72));

  return (
    <div ref={frameRef} className={`slot-v2-reel-window${isSpinning ? 'spinning' : ''}`}>
      <motion.div
        animate={controls}
        className="slot-v2-reel-strip"
        style={{ willChange: 'transform' }}
      >
        {strip.map((sym, i) => {
          const isWin = !isSpinning && i >= FILLER_COUNT && winningRows[i - FILLER_COUNT];
          return (
            <div key={i} className={`slot-v2-cell${isWin ? 'winning' : ''}`}>
              <SlotSymbolV2 type={sym} size={symbolSize} isWinning={isWin} />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
