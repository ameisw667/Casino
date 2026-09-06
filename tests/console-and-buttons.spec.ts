import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

function attachConsoleListener(page: Page, errors: string[]) {
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore known benign external connection notices in test environment
      if (!text.includes('Failed to load resource') && !text.includes('favicon.ico')) {
        errors.push(text);
      }
    }
  });
  page.on('pageerror', (err: Error) => {
    errors.push(err.message);
  });
}

// 1. Lobby
test('Route 01: / (Lobby) - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Click visible nav links / buttons
  const buttons = page.locator('button:visible');
  const count = await buttons.count();
  for (let i = 0; i < Math.min(count, 5); i++) {
    const btn = buttons.nth(i);
    if (await btn.isEnabled()) {
      await btn.click({ force: true }).catch(() => {});
    }
  }

  expect(
    errors.filter((e) => !e.includes('Hydration') && !e.includes('ResizeObserver')),
  ).toHaveLength(0);
});

// 2. Games
test('Route 02: /games - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/games', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const tabs = page.locator('button:visible');
  const count = await tabs.count();
  for (let i = 0; i < Math.min(count, 6); i++) {
    await tabs
      .nth(i)
      .click({ force: true })
      .catch(() => {});
  }

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 3. Dice
test('Route 03: /games/dice - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/games/dice', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Click Min / 1/2 / 2x / Max buttons
  const halfBtn = page.locator('button:has-text("1/2")').first();
  if (await halfBtn.isVisible()) await halfBtn.click();
  const doubleBtn = page.locator('button:has-text("2x")').first();
  if (await doubleBtn.isVisible()) await doubleBtn.click();

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 4. Crash
test('Route 04: /games/crash - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/games/crash', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const halfBtn = page.locator('button:has-text("1/2")').first();
  if (await halfBtn.isVisible()) await halfBtn.click();

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 5. Roulette
test('Route 05: /games/roulette - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/games/roulette', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const chip = page.locator('button:has-text("1"), button:has-text("5")').first();
  if (await chip.isVisible()) await chip.click();

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 6. Slots
test('Route 06: /games/slots - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/games/slots', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const doubleBtn = page.locator('button:has-text("2x")').first();
  if (await doubleBtn.isVisible()) await doubleBtn.click();

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 7. Blackjack
test('Route 07: /games/blackjack - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/games/blackjack', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const chip = page.locator('button:has-text("5")').first();
  if (await chip.isVisible()) await chip.click();

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 8. Leaderboard
test('Route 08: /leaderboard - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/leaderboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 9. History
test('Route 09: /history - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/history', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 10. Vault
test('Route 10: /vault - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/vault', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 11. Sign-in
test('Route 11: /sign-in - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/sign-in', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 12. Sign-up
test('Route 12: /sign-up - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/sign-up', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 13. Admin Overview
test('Route 13: /admin - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 14. Admin Games
test('Route 14: /admin/games - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/admin/games', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 15. Admin Analytics
test('Route 15: /admin/analytics - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/admin/analytics', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 16. Admin Users
test('Route 16: /admin/users - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});

// 17. Admin Simulation
test('Route 17: /admin/simulation - Button & Console Audit', async ({ page }) => {
  const errors: string[] = [];
  attachConsoleListener(page, errors);

  await page.goto('/admin/simulation', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
});
