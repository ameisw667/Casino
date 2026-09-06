export type RoundPhase = 'idle' | 'holding' | 'cashed' | 'busted';

export interface RoundState {
  phase: RoundPhase;
  startedAtMs: number;
  endedAtMs: number | null;
  crashPoint: number;
  cashedMultiplier: number | null;
}

export interface SessionState {
  cashOuts: number;
  busts: number;
  bestMultiplier: number;
}

export const MAX_CRASH_POINT = 50;
export const CRASH_GROWTH_RATE = 0.28;

/**
 * Standardverteilung visueller Crashpoints (Median ~2×, langer Schwanz):
 * drawCrashPoint erwartet uniformes rand() und klebt bei r=0 am unteren Anschlag.
 */
export function drawCrashPoint(rand: () => number): number {
  const r = Math.min(0.999999, Math.max(0, rand()));
  const raw = 0.99 / (1 - r);
  return Math.min(MAX_CRASH_POINT, Math.max(1, Math.round(raw * 100) / 100));
}

export function multiplierAt(elapsedMs: number): number {
  if (elapsedMs <= 0) return 1;
  return Math.exp(CRASH_GROWTH_RATE * (elapsedMs / 1000));
}

export function startRound(nowMs: number, crashPoint: number): RoundState {
  return {
    phase: 'holding',
    startedAtMs: nowMs,
    endedAtMs: null,
    crashPoint: Math.max(1, crashPoint),
    cashedMultiplier: null,
  };
}

export function currentMultiplier(state: RoundState, nowMs: number): number {
  if (state.phase === 'holding') return multiplierAt(nowMs - state.startedAtMs);
  return state.cashedMultiplier ?? (state.phase === 'busted' ? 0 : 1);
}

export function evaluateRound(state: RoundState, nowMs: number): RoundState {
  if (state.phase !== 'holding') return state;
  if (currentMultiplier(state, nowMs) >= state.crashPoint) {
    return { ...state, phase: 'busted', endedAtMs: nowMs };
  }
  return state;
}

export function cashOut(state: RoundState, nowMs: number): RoundState {
  if (state.phase !== 'holding') return state;
  const multiplier = Math.min(currentMultiplier(state, nowMs), state.crashPoint);
  return { ...state, phase: 'cashed', endedAtMs: nowMs, cashedMultiplier: multiplier };
}

export function initialSession(): SessionState {
  return { cashOuts: 0, busts: 0, bestMultiplier: 0 };
}

export function recordRound(session: SessionState, round: RoundState): SessionState {
  if (round.phase === 'cashed') {
    const m = round.cashedMultiplier ?? 1;
    return {
      cashOuts: session.cashOuts + 1,
      busts: session.busts,
      bestMultiplier: Math.max(session.bestMultiplier, m),
    };
  }
  if (round.phase === 'busted') {
    return {
      ...session,
      busts: session.busts + 1,
    };
  }
  return session;
}
