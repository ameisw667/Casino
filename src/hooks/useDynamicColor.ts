'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  bgHue: number;
  bgSat: number;
  bgLight: number;
}

interface TimeTheme {
  name: 'dawn' | 'day' | 'dusk' | 'night' | 'midnight';
  hours: [number, number];
  palette: ColorPalette;
}

const TIME_THEMES: TimeTheme[] = [
  {
    name: 'dawn',
    hours: [5, 9],
    palette: {
      primary: '35 90% 55%',
      secondary: '25 80% 60%',
      accent: '15 75% 65%',
      bgHue: 30,
      bgSat: 15,
      bgLight: 4,
    },
  },
  {
    name: 'day',
    hours: [9, 17],
    palette: {
      primary: '45 100% 50%',
      secondary: '280 85% 60%',
      accent: '330 90% 60%',
      bgHue: 0,
      bgSat: 5,
      bgLight: 3,
    },
  },
  {
    name: 'dusk',
    hours: [17, 21],
    palette: {
      primary: '38 95% 55%',
      secondary: '310 75% 55%',
      accent: '200 80% 55%',
      bgHue: 270,
      bgSat: 20,
      bgLight: 5,
    },
  },
  {
    name: 'night',
    hours: [21, 2],
    palette: {
      primary: '48 100% 55%',
      secondary: '260 90% 65%',
      accent: '180 85% 50%',
      bgHue: 240,
      bgSat: 25,
      bgLight: 2,
    },
  },
  {
    name: 'midnight',
    hours: [2, 5],
    palette: {
      primary: '42 80% 45%',
      secondary: '250 70% 55%',
      accent: '300 60% 50%',
      bgHue: 260,
      bgSat: 30,
      bgLight: 1,
    },
  },
];

const LOSS_SERIE_PALETTE: ColorPalette = {
  primary: '180 70% 45%',
  secondary: '200 60% 50%',
  accent: '160 50% 45%',
  bgHue: 200,
  bgSat: 15,
  bgLight: 3,
};

const WIN_STREAK_PALETTE: ColorPalette = {
  primary: '45 100% 55%',
  secondary: '25 90% 60%',
  accent: '350 85% 55%',
  bgHue: 30,
  bgSat: 20,
  bgLight: 3,
};

export function useDynamicColor() {
  const bets = useCasinoStore((s) => s.bets);
  const [isAdapting, setIsAdapting] = useState(true);
  const [manualThemeIndex, setManualThemeIndex] = useState<number | null>(null);

  const getTimeTheme = useCallback(() => {
    const hour = new Date().getHours();

    for (const theme of TIME_THEMES) {
      const [start, end] = theme.hours;
      if (start < end) {
        if (hour >= start && hour < end) return theme;
      } else {
        if (hour >= start || hour < end) return theme;
      }
    }
    return TIME_THEMES[1];
  }, []);

  const analyzeUserState = useCallback(() => {
    if (bets.length < 5) return 'neutral';

    const recentBets = bets.slice(0, 10);
    const wins = recentBets.filter((b) => b.win).length;
    const losses = recentBets.filter((b) => !b.win).length;

    if (wins >= 6) return 'winning';
    if (losses >= 7) return 'losing';

    return 'neutral';
  }, [bets]);

  // Derived during render (not set-state-in-effect): palette/name depend only
  // on isAdapting, manualThemeIndex, and the current time/bet-streak inputs.
  const { palette: currentPalette, name: themeName } = useMemo(() => {
    if (!isAdapting && manualThemeIndex !== null) {
      const theme = TIME_THEMES[manualThemeIndex] || TIME_THEMES[1];
      return { palette: theme.palette, name: theme.name };
    }

    const timeTheme = getTimeTheme();
    const userState = analyzeUserState();

    if (userState === 'losing') return { palette: LOSS_SERIE_PALETTE, name: 'calm-mode' };
    if (userState === 'winning') return { palette: WIN_STREAK_PALETTE, name: 'hot-streak' };
    return { palette: timeTheme.palette, name: timeTheme.name };
  }, [isAdapting, manualThemeIndex, getTimeTheme, analyzeUserState]);

  // Effect only syncs the derived palette to the DOM (external system) — no setState here.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', currentPalette.primary);
    root.style.setProperty('--secondary', currentPalette.secondary);
    root.style.setProperty('--accent', currentPalette.accent);
    root.style.setProperty(
      '--bg-color',
      `${currentPalette.bgHue} ${currentPalette.bgSat}% ${currentPalette.bgLight}%`,
    );
    root.style.setProperty('--theme-name', `"${themeName}"`);
  }, [currentPalette, themeName]);

  const setManualTheme = useCallback((themeIndex: number) => {
    setIsAdapting(false);
    setManualThemeIndex(themeIndex);
  }, []);

  const resetToAuto = useCallback(() => {
    setIsAdapting(true);
    setManualThemeIndex(null);
  }, []);

  return {
    currentPalette,
    themeName,
    isAdapting,
    setManualTheme,
    resetToAuto,
    availableThemes: TIME_THEMES.map((t) => t.name),
  };
}
