import { expect, test } from '@playwright/test';

const relativeLuminance = (color: string) => {
  const channels = color
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number);
  if (!channels || channels.length !== 3) {
    throw new Error(`Unsupported computed color: ${color}`);
  }

  const normalizedChannels = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return (
    normalizedChannels[0] * 0.2126 + normalizedChannels[1] * 0.7152 + normalizedChannels[2] * 0.0722
  );
};

const contrastRatio = (foreground: string, background: string) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);

  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
};

test('uses the restrained Carbon Mineral hero and citrine navigation accent', async ({ page }) => {
  await page.goto('/testing/neon-arcade-dashboard');

  const hero = page.locator('[data-dashboard="neon-arcade"] main > section').first();
  const activeNavigation = page.getByRole('link', { name: 'Dashboard', exact: true });
  const primaryAction = page.getByRole('link', { name: 'Play the live curve', exact: true });

  await expect(hero).toBeVisible();
  await expect(activeNavigation).toBeVisible();

  const heroBackground = await hero.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  const activeNavigationColors = await activeNavigation.evaluate((element) => {
    const styles = getComputedStyle(element);
    return { background: styles.backgroundColor, foreground: styles.color };
  });
  const primaryBackground = await primaryAction.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  expect(heroBackground).toBe('rgb(15, 32, 36)');
  expect(activeNavigationColors.background).toBe('rgb(189, 200, 105)');
  expect(primaryBackground).toBe(activeNavigationColors.background);
  expect(
    contrastRatio(activeNavigationColors.foreground, activeNavigationColors.background),
  ).toBeGreaterThanOrEqual(7);
});
