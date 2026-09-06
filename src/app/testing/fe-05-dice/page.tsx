'use client';

import React, { useState, useRef, useCallback } from 'react';
import { soundManager } from '@/lib/casino/sound-manager';
import { SandboxHeader } from './parts/SandboxHeader';
import { HistoryTopRow, type DiceRollHistory } from './parts/HistoryTopRow';
import { RollDisplay } from './parts/RollDisplay';
import { OddsSlider } from './parts/OddsSlider';
import { StatCards } from './parts/StatCards';

export default function FE05DiceTestingSandbox() {
  const [isRollOver, setIsRollOver] = useState(true);
  const [targetPoint, setTargetPoint] = useState(50.5);
  const [winChance, setWinChance] = useState(49.5);
  const [multiplier, setMultiplier] = useState(2.0);
  const [rolling, setRolling] = useState(false);
  const [displayTicker, setDisplayTicker] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<DiceRollHistory | null>({
    id: 'init-1',
    roll: 65.65,
    target: 50.5,
    isOver: true,
    win: true,
    multiplier: 2.0,
  });
  const [history, setHistory] = useState<DiceRollHistory[]>([
    { id: '1', roll: 65.65, target: 50.5, isOver: true, win: true, multiplier: 2.0 },
    { id: '2', roll: 93.32, target: 50.5, isOver: true, win: true, multiplier: 2.0 },
    { id: '3', roll: 99.75, target: 50.5, isOver: true, win: true, multiplier: 2.0 },
    { id: '4', roll: 74.22, target: 50.5, isOver: true, win: true, multiplier: 2.0 },
    { id: '5', roll: 23.15, target: 50.5, isOver: true, win: false, multiplier: 2.0 },
    { id: '6', roll: 88.4, target: 90.0, isOver: true, win: false, multiplier: 9.9 },
    { id: '7', roll: 12.8, target: 25.0, isOver: false, win: true, multiplier: 3.96 },
  ]);
  const [winStreak, setWinStreak] = useState(4);
  const [isNearMiss, setIsNearMiss] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculations
  const updateFromWinChance = useCallback(
    (chance: number) => {
      const val = Math.max(0.01, Math.min(98.99, chance));
      setWinChance(parseFloat(val.toFixed(2)));
      const newMult = 99 / val;
      setMultiplier(parseFloat(newMult.toFixed(4)));
      setTargetPoint(parseFloat((isRollOver ? 100 - val : val).toFixed(2)));
    },
    [isRollOver],
  );

  const updateFromMultiplier = useCallback(
    (mult: number) => {
      const val = Math.max(1.0102, Math.min(9900, mult));
      setMultiplier(parseFloat(val.toFixed(4)));
      const newChance = 99 / val;
      setWinChance(parseFloat(newChance.toFixed(2)));
      setTargetPoint(parseFloat((isRollOver ? 100 - newChance : newChance).toFixed(2)));
    },
    [isRollOver],
  );

  const updateFromTarget = useCallback(
    (target: number) => {
      const val = Math.max(0.01, Math.min(99.99, target));
      setTargetPoint(parseFloat(val.toFixed(2)));
      const newChance = isRollOver ? 100 - val : val;
      const clampedChance = Math.max(0.01, Math.min(98.99, newChance));
      setWinChance(parseFloat(clampedChance.toFixed(2)));
      setMultiplier(parseFloat((99 / clampedChance).toFixed(4)));
    },
    [isRollOver],
  );

  const toggleRollMode = () => {
    const newIsOver = !isRollOver;
    setIsRollOver(newIsOver);
    setTargetPoint(parseFloat((100 - targetPoint).toFixed(2)));
  };

  // Slider Dragging
  const handleSliderMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const percent = Math.max(0.01, Math.min(99.99, ((clientX - rect.left) / rect.width) * 100));
      updateFromTarget(percent);
    },
    [updateFromTarget],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderMove(e.clientX);
    const onMouseMove = (moveEvent: MouseEvent) => handleSliderMove(moveEvent.clientX);
    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Roll Execution
  const handleTestRoll = (forcedRoll?: number) => {
    if (rolling) return;
    setRolling(true);
    setIsNearMiss(false);
    soundManager.play('chip');

    let step = 0;
    const interval = setInterval(() => {
      setDisplayTicker(parseFloat((Math.random() * 99.99).toFixed(2)));
      step++;
      if (step >= 18) {
        clearInterval(interval);
        const finalRoll =
          forcedRoll !== undefined ? forcedRoll : parseFloat((Math.random() * 99.99).toFixed(2));
        const isWin = isRollOver ? finalRoll > targetPoint : finalRoll < targetPoint;
        const diff = Math.abs(finalRoll - targetPoint);
        const nearMiss = !isWin && diff <= 3.0;

        setDisplayTicker(null);
        const newResultItem: DiceRollHistory = {
          id: crypto.randomUUID(),
          roll: finalRoll,
          target: targetPoint,
          isOver: isRollOver,
          win: isWin,
          multiplier: isWin ? multiplier : 0,
        };

        setLastResult(newResultItem);
        setHistory((prev) => [newResultItem, ...prev.slice(0, 15)]);
        setIsNearMiss(nearMiss);

        if (isWin) {
          soundManager.play('win');
          setWinStreak((s) => s + 1);
        } else {
          setWinStreak(0);
        }

        setTimeout(() => {
          setRolling(false);
        }, 1200);
      }
    }, 45);
  };

  const currentRollValue = displayTicker !== null ? displayTicker : (lastResult?.roll ?? 50.0);

  return (
    <div
      style={{
        maxWidth: '1560px',
        margin: '0 auto',
        padding: '24px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── 1. HEADER & CONTROL BAR ── */}
      <SandboxHeader
        rolling={rolling}
        onRoll={() => handleTestRoll()}
        onNearMissRoll={() => handleTestRoll(isRollOver ? targetPoint - 1.2 : targetPoint + 1.2)}
      />

      {/* ── 2. DAS MONTE-CARLO SOVEREIGN BOARD ── */}
      <div
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
        {/* Haupt-Filzboden (Smaragd-Kaschmir mit sanftem Eigenschatten) */}
        <div
          style={{
            width: '100%',
            borderRadius: '24px',
            background:
              'radial-gradient(ellipse at 50% 28%, #144832 0%, #0B2C1E 52%, #05160E 100%)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), inset 0 0 50px rgba(0, 0, 0, 0.7)',
            padding: '28px 32px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Spotlight-Kegel */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 22%, rgba(255, 235, 170, 0.15) 0%, transparent 75%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── TOP HEADER: WIN STREAK + ROLL HISTORY ── */}
          <HistoryTopRow winStreak={winStreak} history={history} />

          {/* ── ZENTRALER ZIFFERN-BEREICH (SANFTER SCHATTEN & 100% CLEAN) ── */}
          <RollDisplay
            currentRollValue={currentRollValue}
            displayTicker={displayTicker}
            rolling={rolling}
            isNearMiss={isNearMiss}
            lastResult={lastResult}
            targetPoint={targetPoint}
          />

          {/* ── 3. DER 3D-SCHIEBEREGLER (OVER/UNDER JETZT ERGONOMISCH UNTER DEM SLIDER) ── */}
          <OddsSlider
            sliderRef={sliderRef}
            isRollOver={isRollOver}
            targetPoint={targetPoint}
            lastResult={lastResult}
            onMouseDown={handleMouseDown}
          />

          {/* ── 4. DIE 3 SUBTILEN STATISTIK- & TELEMETRIE-KARTEN ── */}
          <StatCards
            multiplier={multiplier}
            winChance={winChance}
            targetPoint={targetPoint}
            isRollOver={isRollOver}
            onMultiplierPreset={updateFromMultiplier}
            onToggleRollMode={toggleRollMode}
          />
        </div>
      </div>
    </div>
  );
}
