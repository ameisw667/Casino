import { test, expect } from '@playwright/test';

test('Sign-in page renders authentication form', async ({ page }) => {
  await page.goto('/sign-in', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page.locator('body')).toBeVisible();

  // Email input and submit button should exist
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await expect(emailInput).toBeVisible({ timeout: 10000 });
});

test('Sign-up page renders registration form', async ({ page }) => {
  await page.goto('/sign-up', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page.locator('body')).toBeVisible();

  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await expect(emailInput).toBeVisible({ timeout: 10000 });
});
