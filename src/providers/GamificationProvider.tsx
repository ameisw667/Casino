'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { Trophy, Star, Zap } from 'lucide-react';

interface GamificationContextType {
  lastLevelUp: number | null;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { level, addToast } = useCasinoStore();
  const [lastLevelUp, setLastLevelUp] = useState<number | null>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    if (level > 1) {
      setLastLevelUp(level);
      addToast(`LEVEL UP! You are now Level ${level} 🚀`, 'success', 5000);
      
      // Trigger confetti or special effect event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('celebrate-level-up', { detail: { level } }));
      }
    }
  }, [level]);

  return (
    <GamificationContext.Provider value={{ lastLevelUp }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
