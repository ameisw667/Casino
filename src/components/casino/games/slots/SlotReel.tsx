'use client';
import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { SlotSymbol, type SymbolType } from '@/components/casino/SlotSymbol';

const FILLER_COUNT = 18;
const DEFAULT_CELL_SIZE = 112;

interface SlotReelProps {
  finalSymbols: [SymbolType, SymbolType, SymbolType];
  isSpinning: boolean;
  stopDelay: number;
  winningRows: [boolean, boolean, boolean];
  symbolPool: SymbolType[];
  onStopComplete?: () => void;
}

function useCellSize() {
  const [size, setSize] = useState(DEFAULT_CELL_SIZE);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const measure = useCallback(() => {
    if (!frameRef.current) return;
    const computed = getComputedStyle(frameRef.current);
    const raw = computed.getPropertyValue('--slot-cell-size').trim();
    const parsed = parseFloat(raw);
    if (Number.isFinite(parsed) && parsed > 0) {
      setSize(parsed);
    }
  }, []);

  return { size, frameRef, measure };
}

export function SlotReel({
  finalSymbols,
  isSpinning,
  stopDelay,
  winningRows,
  symbolPool,
  onStopComplete,
}: SlotReelProps) {
  const controls = useAnimationControls();
  const isAnimating = useRef(false);
  const spinStarted = useRef(false);
  const [strip, setStrip] = useState<SymbolType[]>([...finalSymbols]);
  const { size: symbolHeight, frameRef, measure } = useCellSize();

  // Measure cell size whenever the reel frame is mounted / resized.
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
      setStrip(prev => {
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
    const filler = Array.from({ length: FILLER_COUNT }, () =>
      symbolPool[Math.floor(Math.random() * symbolPool.length)]
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
        })
      )
      .then(() =>
        controls.start({
          y: totalY,
          transition: { duration: 0.1, ease: 'easeIn' },
        })
      )
      .then(() => {
        isAnimating.current = false;
        onStopComplete?.();
      });
  }, [isSpinning, stopDelay, controls, onStopComplete, symbolHeight]);

  const symbolSize = Math.max(44, Math.round(symbolHeight * 0.72));

  return (
    <div ref={frameRef} className={`slot-reel-window${isSpinning ? ' spinning' : ''}`}>
      <motion.div animate={controls} className="slot-reel-strip" style={{ willChange: 'transform' }}>
        {strip.map((sym, i) => {
          const isWin = !isSpinning && i >= FILLER_COUNT && winningRows[i - FILLER_COUNT];
          return (
            <div key={i} className={`slot-cell${isWin ? ' winning' : ''}`}>
              <SlotSymbol type={sym} size={symbolSize} isWinning={isWin} />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
