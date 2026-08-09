'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { SlotReelV2 } from './SlotReelV2';
import { WinLineV2 } from './WinLineV2';
import type { SymbolType } from '@/components/casino/SlotSymbol';

type ReelSymbols = [SymbolType, SymbolType, SymbolType];
type WinningRows = [boolean, boolean, boolean];
type LastResult = { type: 'win' | 'loss' | 'idle'; amount: number };

interface SlotCabinetV2Props {
  finalReels: ReelSymbols[];
  isSpinning: boolean;
  winRows: WinningRows[];
  winningRowIndex: 0 | 1 | 2 | null;
  lastResult: LastResult;
  sessionSpins: number;
  sessionProfit: number;
  stopDelays: number[];
  symbolPool: SymbolType[];
}

const NO_WIN: WinningRows = [false, false, false];
const LIGHT_COUNT = 10;

export function SlotCabinetV2({
  finalReels,
  isSpinning,
  winRows,
  winningRowIndex,
  lastResult,
  sessionSpins,
  sessionProfit,
  stopDelays,
  symbolPool,
}: SlotCabinetV2Props) {
  const hasWin = lastResult.type === 'win';

  return (
    <div className="slot-v2-cabinet">
      <div className="slot-v2-marquee">
        <div className="slot-v2-marquee-bulbs">
          {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
            <span
              key={`t-${i}`}
              className="slot-v2-bulb"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <div className="slot-v2-marquee-plate">
          <span className="slot-v2-marquee-title">ZEUS VAULT</span>
        </div>
        <div className="slot-v2-marquee-bulbs">
          {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
            <span
              key={`b-${i}`}
              className="slot-v2-bulb"
              style={{ animationDelay: `${(LIGHT_COUNT - i) * 0.12}s` }}
            />
          ))}
        </div>
      </div>

      <div className="slot-v2-screen">
        <AnimatePresence>
          {hasWin && (
            <motion.div
              className="slot-v2-win-banner"
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
            >
              <Zap size={32} />
              <span>WIN +${lastResult.amount.toFixed(2)}</span>
              <Zap size={32} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="slot-v2-reels-frame">
          {finalReels.map((reelSyms, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="slot-v2-divider" />}
              <SlotReelV2
                finalSymbols={reelSyms}
                isSpinning={isSpinning}
                stopDelay={stopDelays[i] ?? 0}
                winningRows={winRows[i] ?? NO_WIN}
                symbolPool={symbolPool}
              />
            </React.Fragment>
          ))}
          <WinLineV2 rowIndex={winningRowIndex} isVisible={hasWin && !isSpinning} />
        </div>
      </div>

      <div className="slot-v2-deck">
        <div className="slot-v2-readout">
          <span className="slot-v2-readout-label">LAST RESULT</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={`${lastResult.type}-${lastResult.amount}`}
              className={`slot-v2-readout-value ${lastResult.type}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
            >
              {lastResult.type === 'win' && (
                <>
                  <TrendingUp size={14} />
                  +${lastResult.amount.toFixed(2)}
                </>
              )}
              {lastResult.type === 'loss' && (
                <>
                  <TrendingDown size={14} />
                  -${lastResult.amount.toFixed(2)}
                </>
              )}
              {lastResult.type === 'idle' && '—'}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="slot-v2-readout">
          <span className="slot-v2-readout-label">SPINS</span>
          <span className="slot-v2-readout-value idle">{sessionSpins}</span>
        </div>
        <div className="slot-v2-readout">
          <span className="slot-v2-readout-label">SESSION PROFIT</span>
          <span className={`slot-v2-readout-value ${sessionProfit >= 0 ? 'win' : 'loss'}`}>
            {sessionProfit >= 0 ? '+' : ''}${sessionProfit.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
