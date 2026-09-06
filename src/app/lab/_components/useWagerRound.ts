'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValue, type MotionValue } from 'framer-motion';
import {
  cashOut,
  evaluateRound,
  drawCrashPoint,
  initialSession,
  recordRound,
  startRound,
  currentMultiplier,
  type RoundPhase,
  type RoundState,
  type SessionState,
} from '../_lib/crashRound';
import { mulberry32 } from '../_lib/seededRandom';
import type { RefObject } from 'react';
import type { FieldHandle } from './CrashField';

const BUST_COOLDOWN_MS = 900;
const MOMENTUM_LN_SPAN = Math.log(8);

export interface WagerRound {
  phase: RoundPhase;
  session: SessionState;
  multiplier: MotionValue<number>;
  hold: () => void;
  release: () => void;
}

/**
 * Treibt den visuellen Crash-Loop („Die Wette"): Start bei Pointer-Down,
 * Multiplier exponentiell im rAF, automatischer Bust am geseedeten Crashpoint,
 * Cash-Out beim Loslassen. Kein Server, kein persistenter Bet (Sandbox-Scope).
 */
export function useWagerRound(fieldRef: RefObject<FieldHandle | null>): WagerRound {
  const round = useRef<RoundState | null>(null);
  const roundSeed = useRef(4242);
  const [phase, setPhase] = useState<RoundPhase>('idle');
  const [session, setSession] = useState<SessionState>(initialSession);
  const multiplier = useMotionValue(1);

  const finishBusted = useCallback(() => {
    const busted = round.current;
    round.current = null;
    multiplier.set(0);
    fieldRef.current?.flashBust();
    if (busted) setSession((prev) => recordRound(prev, busted));
    setPhase('busted');
    window.setTimeout(() => setPhase('idle'), BUST_COOLDOWN_MS);
  }, [fieldRef, multiplier]);

  useEffect(() => {
    if (phase !== 'holding') return;
    let frame = 0;
    const tick = () => {
      frame = window.requestAnimationFrame(tick);
      const current = round.current;
      if (!current) return;
      const now = performance.now();
      const evaluated = evaluateRound(current, now);
      if (evaluated.phase === 'busted') {
        round.current = evaluated;
        window.cancelAnimationFrame(frame);
        finishBusted();
        return;
      }
      const m = currentMultiplier(evaluated, now);
      multiplier.set(m);
      fieldRef.current?.setWager(true, Math.min(1, Math.log(m) / MOMENTUM_LN_SPAN));
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [phase, fieldRef, multiplier, finishBusted]);

  const hold = useCallback(() => {
    if (round.current) return;
    roundSeed.current = (roundSeed.current * 1664525 + 1013904223) >>> 0;
    const crashPoint = drawCrashPoint(mulberry32(roundSeed.current));
    round.current = startRound(performance.now(), crashPoint);
    multiplier.set(1);
    setPhase('holding');
  }, [multiplier]);

  const release = useCallback(() => {
    const current = round.current;
    if (!current || current.phase !== 'holding') return;
    const now = performance.now();
    const finished = evaluateRound(current, now);
    if (finished.phase === 'busted') {
      round.current = finished;
      finishBusted();
      return;
    }
    const cashed = cashOut(finished, now);
    round.current = null;
    multiplier.set(cashed.cashedMultiplier ?? 1);
    fieldRef.current?.setWager(false, 0);
    fieldRef.current?.pulseCashOut();
    setSession((prev) => recordRound(prev, cashed));
    setPhase('cashed');
    window.setTimeout(() => setPhase('idle'), BUST_COOLDOWN_MS);
  }, [fieldRef, finishBusted, multiplier]);

  return { phase, session, multiplier, hold, release };
}
