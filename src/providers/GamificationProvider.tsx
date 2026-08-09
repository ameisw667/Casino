'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';

interface GamificationContextType {
  lastLevelUp: number | null;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const level = useCasinoStore((s) => s.level);
  const addToast = useCasinoStore((s) => s.addToast);
  const [lastLevelUp, setLastLevelUp] = useState<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (level > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastLevelUp(level);
      addToast(`LEVEL UP! You are now Level ${level} 🚀`, 'success', 5000);

      // Trigger confetti or special effect event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('celebrate-level-up', { detail: { level } }));
      }
    }
  }, [level, addToast]);

  return (
    <GamificationContext.Provider value={{ lastLevelUp }}>{children}</GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
