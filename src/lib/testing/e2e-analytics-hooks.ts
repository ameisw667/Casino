'use client';

import { useCasinoStore } from '@/store/useCasinoStore';
import { trackAllowedEvent, type AllowedAnalyticsEvent } from '@/lib/analytics/events';

// E2E-only bridge (T_FRONTEND/Planungsdateien/05_analytics_rum_plan.md, L0-Fund): the live app
// currently has no reachable UI element that calls `startOnboarding()` — its only two callers,
// HeroSectionV2.tsx and HeroSection.tsx, are legacy components never mounted from src/app/**
// (HomeClientV2.tsx renders BentoLobbyHome instead; verified via full-repo grep 2026-09-14).
// Wiring the E2E-tracking spec to a real click therefore isn't currently possible without a
// separate product decision on whether/where to re-expose that CTA. Until then, this bridge
// calls the exact same store action a real click would call, so the Playwright spec still
// exercises the real trackAllowedEvent()/Zod-allowlist/PostHog-capture code path end-to-end —
// it only replaces the missing "click a button" step, nothing downstream of it.
//
// Gated on NEXT_PUBLIC_E2E_HOOKS so this is inert (and dead-code-eliminated at build time, since
// Next.js inlines NEXT_PUBLIC_* vars) whenever that var isn't explicitly set to '1' — which it
// never is for a Vercel preview/production build, only for the analytics-tracking-e2e.yml
// workflow and local Playwright runs (see playwright.config.ts webServer.env).
export interface E2eAnalyticsHooks {
  /** Fires cta_play_now_clicked via the real startOnboarding() store action. */
  triggerPlayNowCta: () => void;
  /** Attempts to capture an event outside the Zod allowlist — must be a silent no-op. */
  captureDisallowedEvent: () => void;
}

declare global {
  interface Window {
    __e2eAnalyticsHooks?: E2eAnalyticsHooks;
  }
}

export function installE2eAnalyticsHooks(): void {
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_E2E_HOOKS !== '1') return;
  if (window.__e2eAnalyticsHooks) return;

  window.__e2eAnalyticsHooks = {
    triggerPlayNowCta: () => {
      useCasinoStore.getState().startOnboarding();
    },
    captureDisallowedEvent: () => {
      // Deliberately not a member of AllowedAnalyticsEvent — proves trackAllowedEvent()'s Zod
      // gate rejects it before anything reaches PostHog, exercised through the real function,
      // not a re-implementation of its validation.
      void trackAllowedEvent({
        name: 'fake_disallowed_event',
      } as unknown as AllowedAnalyticsEvent);
    },
  };
}
