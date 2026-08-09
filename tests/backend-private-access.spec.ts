import { expect, test } from '@playwright/test';

test('shows Jan private access without app navigation', async ({ page }) => {
  await page.goto('/backend');

  await expect(page.getByRole('heading', { name: 'Willkommen zur\u00fcck, Jan.' })).toBeVisible();
  await expect(page.getByLabel('E-Mail-Adresse')).toBeVisible();
  await expect(page.getByLabel('Passwort')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Anmelden' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Konto erstellen' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mit Google fortfahren' })).toBeVisible();
  await expect(page.getByRole('navigation')).toHaveCount(0);

  const cardBox = await page.getByRole('region', { name: 'Privater Zugang' }).boundingBox();
  expect(cardBox).not.toBeNull();
  expect(cardBox!.width).toBeLessThanOrEqual(448);
  expect(cardBox!.x).toBeGreaterThan(250);
});
