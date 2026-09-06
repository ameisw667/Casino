import type { StateCreator } from 'zustand';
import { soundManager } from '@/lib/casino/sound-manager';
import { trackAllowedEvent } from '@/lib/analytics/events';
import type { CasinoState, SettingsSlice } from './types';

export const createSettingsSlice: StateCreator<CasinoState, [], [], SettingsSlice> = (set) => ({
  soundVolume: 0.5,
  hideBalance: false,
  anonymousBetting: false,
  language: 'en',
  oddsFormat: 'decimal',
  soundEnabled: true,
  autoBetSettings: {
    dice: {
      amount: 1,
      onWin: 0,
      onLoss: 0,
      stopOnProfit: 0,
      stopOnLoss: 0,
      numberOfBets: 0,
    },
    crash: {
      amount: 1,
      cashoutAt: 2.0,
      onLoss: 'RESET',
    },
  },
  provablyFairSettings: {
    clientSeed: 'vibe-coder-default',
    serverSeedHash: '',
    nonce: 0,
  },
  affiliateRef: null,
  onboardingStep: 'NONE',
  onboardingDismissed: false,

  updateSettings: (settings) => {
    if (settings.soundEnabled !== undefined) soundManager.toggle(settings.soundEnabled);
    if (settings.soundVolume !== undefined) soundManager.setVolume(settings.soundVolume);
    set((state) => ({ ...state, ...settings }));
  },

  toggleSound: () => {
    set((state) => {
      const newEnabled = !state.soundEnabled;
      soundManager.toggle(newEnabled);
      return { soundEnabled: newEnabled };
    });
  },

  setAutoBetSettings: (game, settings) =>
    set((state) => ({
      autoBetSettings: {
        ...state.autoBetSettings,
        [game]: { ...state.autoBetSettings[game], ...settings },
      },
    })),

  setProvablyFairSettings: (settings) =>
    set((state) => ({
      provablyFairSettings: { ...state.provablyFairSettings, ...settings },
    })),

  setAffiliateRef: (ref) => set({ affiliateRef: ref }),

  startOnboarding: (force = false) => {
    void trackAllowedEvent({ name: 'cta_play_now_clicked' });
    // force = expliziter Wiedereinstieg („So funktioniert es"): volle Tour inkl. WELCOME,
    // deshalb wird ein gemerktes Dismiss aufgehoben. Der Play-Now-Default respektiert es
    // — OnboardingFlow springt bei dismissed direkt zu LOGIN.
    if (force) {
      set({ onboardingStep: 'WELCOME', onboardingDismissed: false });
      return;
    }
    set({ onboardingStep: 'WELCOME' });
  },

  dismissOnboarding: () => set({ onboardingStep: 'NONE', onboardingDismissed: true }),

  setOnboardingStep: (step) => set({ onboardingStep: step }),
});
