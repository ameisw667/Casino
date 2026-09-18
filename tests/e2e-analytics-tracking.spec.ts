import { test, expect } from '@playwright/test';
import {
  grantAnalyticsConsent,
  interceptPostHogCapture,
  waitForCapturedEvent,
} from './helpers/analytics';

// 05_analytics_rum_plan.md L2-L4: proves the 3 allowlisted PostHog events on the landing/
// first-game journey actually reach the capture pipeline in a real (headless) browser, and that
// a disallowed event never does — never against the real PostHog ingestion API, always
// intercepted locally (see helpers/analytics.ts).
//
// L0 finding (verified 2026-09-14 via full-repo grep): `cta_play_now_clicked` is fired by the
// `startOnboarding()` store action, whose only two callers — HeroSectionV2.tsx and
// HeroSection.tsx — are legacy components that are not mounted anywhere under src/app/**
// (HomeClientV2.tsx renders BentoLobbyHome instead). There is currently no live "Play Now" CTA
// to click. The cta_play_now_clicked case below therefore triggers the same store action a real
// click would call, through a Playwright-only bridge (src/lib/testing/e2e-analytics-hooks.ts,
// inert unless NEXT_PUBLIC_E2E_HOOKS=1) — this still exercises the real trackAllowedEvent() /
// Zod-allowlist / PostHog-capture path, only the "click a button" step is a stand-in for a CTA
// that does not currently exist in the live UI.

const mockWallet = {
  balance: 500,
  xp: 100,
  level: 2,
  rank: 'Bronze',
  transactionId: '00000000-0000-4000-8000-000000000001',
};

test.describe('Analytics tracking (PostHog, network-intercepted)', () => {
  test('fires landing_viewed when the homepage loads', async ({ page }) => {
    await grantAnalyticsConsent(page);
    const recorder = await interceptPostHogCapture(page);
    await page.route('**/api/user/balance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockWallet),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const event = await waitForCapturedEvent(recorder, 'landing_viewed');
    expect(event.properties ?? {}).toEqual({});
  });

  test('fires cta_play_now_clicked when the Play-Now action runs', async ({ page }) => {
    await grantAnalyticsConsent(page);
    const recorder = await interceptPostHogCapture(page);
    await page.route('**/api/user/balance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockWallet),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.__e2eAnalyticsHooks !== 'undefined', undefined, {
      timeout: 15000,
    });

    await page.evaluate(() => window.__e2eAnalyticsHooks?.triggerPlayNowCta());

    const event = await waitForCapturedEvent(recorder, 'cta_play_now_clicked');
    expect(event.properties ?? {}).toEqual({});
  });

  test('fires first_game_started with props.game=BLACKJACK on the first deal', async ({ page }) => {
    await grantAnalyticsConsent(page);
    const recorder = await interceptPostHogCapture(page);
    await page.route('**/api/user/balance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockWallet),
      });
    });
    await page.route('**/api/casino/blackjack', async (route) => {
      const requestBody = route.request().postDataJSON() as { action?: string };
      if (requestBody.action !== 'DEAL') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            roundId: '00000000-0000-4000-8000-000000000099',
            version: 1,
            isFirstBet: true,
            serverSeedHash: 'mock-server-seed-hash',
            nonce: 1,
            wallet: { ...mockWallet, balance: mockWallet.balance - 10 },
            gameState: {
              phase: 'PLAYER_TURN',
              deck: [],
              activeHandIndex: 0,
              canDouble: true,
              canSplit: false,
              payout: 0,
              payoutMultiplier: 0,
              playerHand: {
                cards: [
                  { suit: 'clubs', value: '10', numericValue: 10, faceDown: false },
                  { suit: 'diamonds', value: '7', numericValue: 7, faceDown: false },
                ],
                score: 17,
                isBust: false,
                isBlackjack: false,
                isSoft: false,
              },
              dealerHand: {
                cards: [
                  { suit: 'spades', value: '9', numericValue: 9, faceDown: false },
                  { suit: 'hearts', value: '6', numericValue: 6, faceDown: true },
                ],
                score: 9,
                isBust: false,
                isBlackjack: false,
                isSoft: false,
              },
            },
          },
        }),
      });
    });

    await page.goto('/games/blackjack', { waitUntil: 'domcontentloaded' });

    const dealButton = page.getByRole('button', { name: /DEAL/i });
    await expect(dealButton).toBeVisible({ timeout: 15000 });
    await dealButton.click();

    const event = await waitForCapturedEvent(recorder, 'first_game_started');
    expect(event.properties).toEqual({ game: 'BLACKJACK' });
  });

  test('never sends a disallowed event to PostHog', async ({ page }) => {
    await grantAnalyticsConsent(page);
    const recorder = await interceptPostHogCapture(page);
    await page.route('**/api/user/balance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockWallet),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.__e2eAnalyticsHooks !== 'undefined', undefined, {
      timeout: 15000,
    });

    // Proves the pipeline is actually live (otherwise the negative assertion below would be
    // vacuously true because nothing ever gets captured).
    await waitForCapturedEvent(recorder, 'landing_viewed');

    await page.evaluate(() => window.__e2eAnalyticsHooks?.captureDisallowedEvent());

    // No fixed signal exists for "this will never arrive" — wait past posthog-js's batch-flush
    // window (empirically well under 10s locally) before asserting absence.
    await page.waitForTimeout(10000);

    expect(recorder.hasEvent('fake_disallowed_event')).toBe(false);
    expect(recorder.getCapturedEvents().map((entry) => entry.event)).not.toContain(
      'fake_disallowed_event',
    );
  });
});
