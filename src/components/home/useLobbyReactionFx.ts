'use client';

import { useEffect, useRef } from 'react';

export interface LobbyWave {
  x: number;
  y: number;
  startMs: number;
  rgb: [number, number, number];
}

export interface LobbyComet {
  startMs: number;
}

export interface LobbyReactionFxState {
  wavesRef: React.RefObject<LobbyWave[]>;
  cometsRef: React.RefObject<LobbyComet[]>;
}

export const LOBBY_HOVER_WAVE_EVENT = 'casino:lobby-hover-wave';
export const LOBBY_BIG_WIN_EVENT = 'casino:lobby-big-win';

const MAX_WAVES = 6;
const MAX_COMETS = 2;

/**
 * Collects lobby reaction triggers (game-card hover pulses, big-win comets)
 * from window events into plain ref arrays. Drawing happens in the ambient
 * background's existing rAF loop — this hook intentionally causes no React
 * re-renders. Disabled entirely under prefers-reduced-motion.
 */
export function useLobbyReactionFx(
  accentRgbRef: React.RefObject<[number, number, number]>,
): LobbyReactionFxState {
  const wavesRef = useRef<LobbyWave[]>([]);
  const cometsRef = useRef<LobbyComet[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const handleHoverWave = (e: Event) => {
      const detail = (e as CustomEvent<{ x: number; y: number }>).detail;
      if (!detail) return;
      const rgb = accentRgbRef.current ?? [212, 175, 55];
      wavesRef.current.push({ x: detail.x, y: detail.y, startMs: performance.now(), rgb });
      if (wavesRef.current.length > MAX_WAVES) wavesRef.current.shift();
    };

    const handleBigWin = () => {
      cometsRef.current.push({ startMs: performance.now() });
      if (cometsRef.current.length > MAX_COMETS) cometsRef.current.shift();
    };

    window.addEventListener(LOBBY_HOVER_WAVE_EVENT, handleHoverWave);
    window.addEventListener(LOBBY_BIG_WIN_EVENT, handleBigWin);
    return () => {
      window.removeEventListener(LOBBY_HOVER_WAVE_EVENT, handleHoverWave);
      window.removeEventListener(LOBBY_BIG_WIN_EVENT, handleBigWin);
    };
  }, [accentRgbRef]);

  return { wavesRef, cometsRef };
}
