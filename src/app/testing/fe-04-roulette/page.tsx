'use client';

import React, { useState } from 'react';
import type {
  BetType,
  BetPlacement,
  RouletteNumber,
} from '@/components/casino/games/roulette/types';
import { betTypeKey } from '@/components/casino/games/roulette/roulette-config';
import { ROULETTE_NUMBERS } from '@/components/casino/games/roulette/types';
import { TableauBoard } from './parts/TableauBoard';
import { SandboxHeader } from './parts/SandboxHeader';
import { CroupierTopRow } from './parts/CroupierTopRow';
import { WheelShowcase } from './parts/WheelShowcase';
import { ControlStrip } from './parts/ControlStrip';
import type { SpinPhase, StrategyPreset } from './parts/shared';

function pickRandomNumber(): RouletteNumber {
  return ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)];
}

export default function FE04RouletteTestingSandbox() {
  const [spinning, setSpinning] = useState(false);
  const [spinPhase, setSpinPhase] = useState<SpinPhase>('resolved');
  const [targetNumber, setTargetNumber] = useState<RouletteNumber | null>({ n: 17, c: 'BLACK' });
  const [revealedWinner, setRevealedWinner] = useState<RouletteNumber | null>({
    n: 17,
    c: 'BLACK',
  });
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(360);
  const [lastMultiplier, setLastMultiplier] = useState<number | null>(36);
  const [showRacetrack, setShowRacetrack] = useState(false);
  const [hoveredArea, setHoveredArea] = useState<BetType | null>(null);

  const [currentBets, setCurrentBets] = useState<BetPlacement[]>([
    { id: '1', type: { type: 'COLOR', value: 'RED' }, amount: 25 },
    { id: '2', type: { type: 'STRAIGHT', value: 17 }, amount: 10 },
    { id: '3', type: { type: 'DOZEN', value: 2 }, amount: 20 },
  ]);

  const [history, setHistory] = useState<RouletteNumber[]>([
    { n: 17, c: 'BLACK' },
    { n: 32, c: 'RED' },
    { n: 0, c: 'GREEN' },
    { n: 19, c: 'RED' },
    { n: 4, c: 'BLACK' },
    { n: 21, c: 'RED' },
    { n: 2, c: 'BLACK' },
    { n: 25, c: 'RED' },
    { n: 10, c: 'BLACK' },
    { n: 27, c: 'RED' },
    { n: 6, c: 'BLACK' },
    { n: 34, c: 'RED' },
    { n: 13, c: 'BLACK' },
    { n: 36, c: 'RED' },
    { n: 11, c: 'BLACK' },
  ]);

  // Action: Spin Test with Synchronous 6.25s Physics Easing
  const handleTestSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setSpinPhase('ball_launched');
    setRevealedWinner(null); // Versteckt HUD & Payout sofort bei Spin-Start!
    setLastWinAmount(null);
    setLastMultiplier(null);

    const randomPick = pickRandomNumber();
    setTargetNumber(randomPick);

    setTimeout(() => {
      setSpinPhase('no_more_bets');
    }, 2200);

    setTimeout(() => {
      setSpinPhase('drop');
    }, 4200);

    // LuxuryRouletteWheel settled intern nach 6.25s (kein Callback-Prop mehr)
    setTimeout(() => {
      handleWheelSettled(randomPick);
    }, 6250);
  };

  // Callback: Wird EXAKT bei Stillstand der Kugel im Zielfach nach 6.25s aufgerufen
  const handleWheelSettled = (settledNum: RouletteNumber) => {
    setRevealedWinner(settledNum);
    setHistory((prev) => [settledNum, ...prev.slice(0, 17)]);
    setSpinPhase('resolved');

    const isRedWin = settledNum.c === 'RED';
    const is17Win = settledNum.n === 17;
    if (is17Win) {
      setLastWinAmount(360);
      setLastMultiplier(36);
    } else if (isRedWin) {
      setLastWinAmount(50);
      setLastMultiplier(2);
    } else {
      setLastWinAmount(0);
      setLastMultiplier(0);
    }

    setTimeout(() => {
      setSpinning(false);
    }, 2500);
  };

  const handlePlaceBet = (type: BetType, amount = 10) => {
    const key = betTypeKey(type);
    setCurrentBets((prev) => {
      const idx = prev.findIndex((b) => betTypeKey(b.type) === key);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], amount: next[idx].amount + amount };
        return next;
      }
      return [...prev, { id: crypto.randomUUID(), type, amount }];
    });
  };

  const handleRemoveBet = (type: BetType, amount = 10) => {
    const key = betTypeKey(type);
    setCurrentBets((prev) => {
      const idx = prev.findIndex((b) => betTypeKey(b.type) === key);
      if (idx === -1) return prev;
      const next = [...prev];
      if (next[idx].amount <= amount) {
        next.splice(idx, 1);
      } else {
        next[idx] = { ...next[idx], amount: next[idx].amount - amount };
      }
      return next;
    });
  };

  const handleClearBets = () => setCurrentBets([]);

  const handleApplyPreset = (preset: StrategyPreset) => {
    if (preset === 'VOISINS') {
      setCurrentBets([
        { id: crypto.randomUUID(), type: { type: 'FRENCH', value: 'VOISINS' }, amount: 90 },
      ]);
    } else if (preset === 'TIERS') {
      setCurrentBets([
        { id: crypto.randomUUID(), type: { type: 'FRENCH', value: 'TIERS' }, amount: 60 },
      ]);
    } else if (preset === 'ORPHELINS') {
      setCurrentBets([
        { id: crypto.randomUUID(), type: { type: 'FRENCH', value: 'ORPHELINS' }, amount: 50 },
      ]);
    } else if (preset === 'RED_BLACK_HEDGE') {
      setCurrentBets([
        { id: crypto.randomUUID(), type: { type: 'COLOR', value: 'RED' }, amount: 25 },
        { id: crypto.randomUUID(), type: { type: 'STRAIGHT', value: 0 }, amount: 5 },
      ]);
    } else if (preset === 'ZERO_HEDGE') {
      setCurrentBets([
        { id: crypto.randomUUID(), type: { type: 'COLOR', value: 'BLACK' }, amount: 25 },
        { id: crypto.randomUUID(), type: { type: 'STRAIGHT', value: 0 }, amount: 5 },
      ]);
    }
  };

  return (
    <div
      style={{
        maxWidth: '1560px',
        margin: '0 auto',
        padding: '24px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ── 1. HEADER & CONTROL BAR ── */}
      <SandboxHeader
        spinning={spinning}
        onTestSpin={handleTestSpin}
        onClearBets={handleClearBets}
      />

      {/* ── 2. MAIN DISPLAY STAGE MIT PHOTOREALISTISCHEM KESSEL ── */}
      <div style={{ width: '100%' }}>
        <div
          style={{
            width: '100%',
            borderRadius: '32px',
            background: '#07090E',
            border: '3px solid #2B1D12',
            boxShadow:
              '0 40px 100px rgba(0, 0, 0, 0.99), inset 0 2px 6px rgba(255, 255, 255, 0.12)',
            padding: '16px',
            perspective: '1400px',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          {/* Haupt-Tischfilz */}
          <div
            style={{
              width: '100%',
              borderRadius: '24px',
              background:
                revealedWinner && !spinning
                  ? 'radial-gradient(ellipse at 50% 22%, #185239 0%, #0D3222 45%, #05160E 100%)'
                  : 'radial-gradient(ellipse at 50% 20%, #134630 0%, #0B2C1E 45%, #05160E 100%)',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              boxShadow:
                revealedWinner && !spinning
                  ? '0 0 50px rgba(212, 175, 55, 0.25), inset 0 0 80px rgba(0, 0, 0, 0.9)'
                  : '0 25px 60px rgba(0, 0, 0, 0.95), inset 0 0 80px rgba(0, 0, 0, 0.9)',
              padding: '24px 24px 34px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.6s ease',
            }}
          >
            {/* Spotlight-Fokus */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  revealedWinner && !spinning
                    ? 'radial-gradient(circle at 50% 25%, rgba(255, 220, 120, 0.25) 0%, rgba(16, 185, 129, 0.1) 50%, transparent 80%)'
                    : 'radial-gradient(circle at 50% 20%, rgba(255, 235, 170, 0.18) 0%, transparent 75%)',
                pointerEvents: 'none',
                transition: 'background 0.8s ease',
              }}
            />

            {/* ── TOP HEADER ROW: [CROUPIER LINKS] + [PERMANENZEN RECHTS] ── */}
            <CroupierTopRow
              spinning={spinning}
              spinPhase={spinPhase}
              revealedWinner={revealedWinner}
              history={history}
            />

            {/* ── DAS ROULETTE-RAD (TCS JOHN HUXLEY MARK VII) ── */}
            <WheelShowcase
              spinning={spinning}
              targetNumber={targetNumber}
              revealedWinner={revealedWinner}
              lastWinAmount={lastWinAmount}
              lastMultiplier={lastMultiplier}
            />

            {/* ── EINHEITLICHE ZEILE: KESSEL-RENNBAHN + ZENTRIERTE STRATEGY PILLS + PAYOUT ── */}
            <ControlStrip
              showRacetrack={showRacetrack}
              onToggleRacetrack={() => setShowRacetrack(!showRacetrack)}
              onApplyPreset={handleApplyPreset}
              lastWinAmount={lastWinAmount}
            />

            {/* ── 3. SALON PRIVÉ 3D BEVEL TABLEAU BOARD ── */}
            <TableauBoard
              currentBets={currentBets}
              spinning={spinning}
              revealedWinner={revealedWinner}
              hoveredArea={hoveredArea}
              onHover={setHoveredArea}
              onPlaceBet={(type) => handlePlaceBet(type)}
              onRemoveBet={(type) => handleRemoveBet(type)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
