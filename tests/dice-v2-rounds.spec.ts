import { test, expect } from '@playwright/test';

const makeUuid = (num: number) => `00000000-0000-4000-8000-${String(num).padStart(12, '0')}`;

const mockWallet = {
  balance: 1000.0,
  xp: 1500,
  level: 5,
  rank: 'Silver',
  transactionId: makeUuid(999),
};

const mockRolls = [
  { roll: 68.25, win: true, payout: 1.98, multiplier: 1.98 },
  { roll: 24.1, win: false, payout: 0, multiplier: 1.98 },
  { roll: 82.5, win: true, payout: 1.98, multiplier: 1.98 },
  { roll: 15.75, win: false, payout: 0, multiplier: 1.98 },
  { roll: 94.4, win: true, payout: 1.98, multiplier: 1.98 },
];

test('5 rounds of Dice 3D V2 with mid-roll and landing verification', async ({ page }) => {
  let rollIndex = 0;

  // 1. Mock balance
  await page.route('**/api/user/balance', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockWallet),
    });
  });

  // 2. Mock betting endpoint with sequential mock results
  await page.route('**/api/casino/bet', async (route) => {
    const current = mockRolls[rollIndex % mockRolls.length];
    rollIndex++;

    // Realistische 100ms Server-Latenz simulieren
    await new Promise((r) => setTimeout(r, 100));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: makeUuid(rollIndex),
          gameType: 'DICE',
          roll: current.roll,
          win: current.win,
          payout: current.payout,
          multiplier: current.multiplier,
          target: 50.5,
          condition: 'OVER',
          serverSeedHash: 'abc123mockhash',
          nonce: rollIndex,
          isFirstBet: false,
          wallet: {
            balance: mockWallet.balance + (current.win ? 0.98 : -1.0),
            xp: 1500 + rollIndex * 10,
            level: 5,
            rank: 'Silver',
            transactionId: makeUuid(rollIndex),
          },
        },
      }),
    });
  });

  // 3. Navigate to /dice/v2
  await page.goto('/dice/v2', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1000);

  // Check stage loaded
  const rollBtn = page.locator('button.gold-btn');
  await expect(rollBtn).toBeVisible({ timeout: 10000 });

  // 4. Execute 5 sequential rounds to verify zero-spoiler timing
  for (let i = 0; i < 5; i++) {
    const expected = mockRolls[i];
    const expectedText = expected.roll.toFixed(2);

    // Klick auf Roll
    await rollBtn.click();

    // Mittlerer Flugzustand (nach 120ms): Würfel taumelt, Ergebnis darf noch NICHT da sein!
    await page.waitForTimeout(120);

    // History-Chips prüfen: Neuer Wert darf noch NICHT existieren
    const historyChips = page.locator('.dice-v2-main [style*="justify-content: flex-end"]');
    const historyTextBeforeLanding =
      (await historyChips.count()) > 0 ? await historyChips.innerText() : '';
    expect(historyTextBeforeLanding).not.toContain(expectedText);

    // Warten bis Würfel bei 650ms gelandet ist
    await page.waitForTimeout(650);

    // Jetzt muss das Ergebnis auf der Bühne und in der History synchron sichtbar sein
    const stageTextAfterLanding = await page.locator('.dice-v2-main').first().innerText();
    expect(stageTextAfterLanding).toContain(expectedText);

    // Kurze Pause zwischen den Runden
    await page.waitForTimeout(300);
  }
});
