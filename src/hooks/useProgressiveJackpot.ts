'use client';
import { useState, useEffect } from 'react';
import { create } from 'zustand';

interface JackpotStoreState {
  jackpot: number;
  increment: (delta: number) => void;
  setJackpot: (val: number) => void;
}

export const useJackpotStore = create<JackpotStoreState>((set) => ({
  jackpot: 1489360.36,
  increment: (delta: number) => set((state) => ({ jackpot: state.jackpot + delta })),
  setJackpot: (val: number) => set({ jackpot: val }),
}));

// Shared hook that manages the single interval timer and formats the output
export function useProgressiveJackpot() {
  const jackpot = useJackpotStore((s) => s.jackpot);
  const increment = useJackpotStore((s) => s.increment);

  useEffect(() => {
    // Only run one master timer instance if window is available
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      // Micro increment between 0.15 and 2.60 to simulate live casino bets
      increment(Math.random() * 2.45 + 0.15);
    }, 2000);

    return () => clearInterval(interval);
  }, [increment]);

  const formatted = `$${jackpot.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return {
    jackpot,
    formatted,
  };
}
