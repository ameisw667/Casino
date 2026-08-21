import { test, expect } from '@playwright/test';

test('Admin overview route responds correctly or enforces auth boundary', async ({ page }) => {
  const response = await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 30000 });
  expect(response?.status()).toBeLessThan(500);
});

test('Admin games route responds without 500 error', async ({ page }) => {
  const response = await page.goto('/admin/games', { waitUntil: 'domcontentloaded', timeout: 30000 });
  expect(response?.status()).toBeLessThan(500);
});

test('Admin analytics route responds without 500 error', async ({ page }) => {
  const response = await page.goto('/admin/analytics', { waitUntil: 'domcontentloaded', timeout: 30000 });
  expect(response?.status()).toBeLessThan(500);
});

test('Admin users route responds without 500 error', async ({ page }) => {
  const response = await page.goto('/admin/users', { waitUntil: 'domcontentloaded', timeout: 30000 });
  expect(response?.status()).toBeLessThan(500);
});

test('Admin simulation route responds without 500 error', async ({ page }) => {
  const response = await page.goto('/admin/simulation', { waitUntil: 'domcontentloaded', timeout: 30000 });
  expect(response?.status()).toBeLessThan(500);
});
