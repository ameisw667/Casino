import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('public/images/guide-eval');

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting Playwright browser to capture Royale Guide screenshots...');
  const browser = await chromium.launch({ headless: true });

  // ───────────────────────────────────────────────────────────────────────────
  // DESKTOP CONTEXT (1440 x 900)
  // ───────────────────────────────────────────────────────────────────────────
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Retina resolution for crisp screenshots
  });
  const page = await desktopContext.newPage();

  console.log('Navigating to http://localhost:3015/games/roulette ...');
  await page.goto('http://localhost:3015/games/roulette', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // 1. TRIGGER BUTTON (FAB)
  console.log('Capturing 01_trigger_fab.png ...');
  const triggerBtn = page.locator('button[aria-label="Open Royale Guide"]');
  await triggerBtn.waitFor({ state: 'visible', timeout: 5000 });
  const triggerBox = await triggerBtn.boundingBox();

  if (triggerBox) {
    // Add padding around the trigger button to show the gold pulse & shadow against the canvas
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01_trigger_fab.png'),
      clip: {
        x: Math.max(0, triggerBox.x - 24),
        y: Math.max(0, triggerBox.y - 20),
        width: triggerBox.width + 48,
        height: triggerBox.height + 40,
      },
    });
  } else {
    await triggerBtn.screenshot({ path: path.join(OUTPUT_DIR, '01_trigger_fab.png') });
  }

  // Open the Guide Panel
  console.log('Opening Royale Guide ...');
  await triggerBtn.click();
  await page.waitForTimeout(1000);

  const dialog = page.locator('section[role="dialog"]');
  await dialog.waitFor({ state: 'visible', timeout: 5000 });

  // 3. GROSSANSICHT & RAUMBALANCE (880px Modal)
  console.log('Capturing 03_expanded_modal_880px.png ...');
  const dialogBox = await dialog.boundingBox();
  if (dialogBox) {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03_expanded_modal_880px.png'),
      clip: {
        x: Math.max(0, dialogBox.x - 40),
        y: Math.max(0, dialogBox.y - 30),
        width: dialogBox.width + 80,
        height: dialogBox.height + 60,
      },
    });
  }

  // 4. HEADER & VIP-PERSONA-MEDAILLONS
  console.log('Capturing 04_header_persona_medallions.png ...');
  const header = dialog.locator('header');
  await header.screenshot({
    path: path.join(OUTPUT_DIR, '04_header_persona_medallions.png'),
  });

  // 5. SCHNELLZUGRIFF-SIDEBAR & NAV-CARDS
  console.log('Capturing 05_sidebar_quick_access.png ...');
  const sidebar = dialog.locator('aside');
  await sidebar.screenshot({
    path: path.join(OUTPUT_DIR, '05_sidebar_quick_access.png'),
  });

  // 9. DESIGN-SYSTEM OBSIDIAN & GOLD (ATMOSPHERIC DETAIL)
  console.log('Capturing 09_design_system_obsidian_gold.png ...');
  if (dialogBox) {
    // Crop upper-right quadrant of the modal showing persona card, velvet backdrop, and gold glow
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '09_design_system_obsidian_gold.png'),
      clip: {
        x: dialogBox.x + dialogBox.width - 340,
        y: dialogBox.y,
        width: 340,
        height: 260,
      },
    });
  }

  // 8. INPUT-BAR, VOICE- & UPLOAD-CONTROLS
  console.log('Capturing 08_input_bar_voice_controls.png ...');
  const inputForm = dialog.locator('form');
  const inputFormBox = await inputForm.boundingBox();
  if (inputFormBox) {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '08_input_bar_voice_controls.png'),
      clip: {
        x: Math.max(0, inputFormBox.x - 10),
        y: Math.max(0, inputFormBox.y - 12),
        width: inputFormBox.width + 20,
        height: inputFormBox.height + 24,
      },
    });
  }

  // Trigger a rich interaction to show tables / actions / suggestions
  console.log('Clicking sidebar topic for Roulette Quoten to populate chat ...');
  const rouletteTopic = sidebar.locator('button:has-text("Roulette Quoten")');
  if (await rouletteTopic.isVisible()) {
    await rouletteTopic.click();
    console.log('Waiting for response stream...');
    await page.waitForTimeout(4500); // Wait for response or turn render
  }

  // 6. CHAT-AREA & MARKDOWN-RENDERING
  console.log('Capturing 06_chat_area_markdown.png ...');
  const messageList = dialog.locator('div[aria-live="polite"]');
  if (await messageList.isVisible()) {
    const msgBox = await messageList.boundingBox();
    if (msgBox) {
      await page.screenshot({
        path: path.join(OUTPUT_DIR, '06_chat_area_markdown.png'),
        clip: {
          x: msgBox.x,
          y: msgBox.y,
          width: msgBox.width,
          height: Math.min(msgBox.height, 420),
        },
      });
    }
  }

  // 7. INTERAKTIVE CTAS, QUICK-CHIPS & ACTION-BUTTONS
  console.log('Capturing 07_interactive_ctas_chips.png ...');
  // Look for suggestions or action buttons inside message list
  const actionOrSuggestions = dialog.locator('div:has(button:has-text("Kopieren")), div:has(button:has-text("Vorlesen"))');
  const lastMsg = dialog.locator('div[aria-live="polite"] > div').last();
  if (await lastMsg.isVisible()) {
    const lastBox = await lastMsg.boundingBox();
    if (lastBox) {
      await page.screenshot({
        path: path.join(OUTPUT_DIR, '07_interactive_ctas_chips.png'),
        clip: {
          x: Math.max(0, lastBox.x - 10),
          y: Math.max(0, lastBox.y - 10),
          width: lastBox.width + 20,
          height: lastBox.height + 20,
        },
      });
    }
  }

  // 2. KOMPAKTANSICHT & FLOATING GEOMETRY (380px)
  console.log('Switching to Compact Mode (380px) ...');
  const minimizeBtn = dialog.locator('button[title*="Standardgröße"], button:has-text("Standard")');
  if (await minimizeBtn.isVisible()) {
    await minimizeBtn.click();
    await page.waitForTimeout(800);
  }

  console.log('Capturing 02_compact_geometry_380px.png ...');
  const compactDialogBox = await dialog.boundingBox();
  if (compactDialogBox) {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02_compact_geometry_380px.png'),
      clip: {
        x: Math.max(0, compactDialogBox.x - 20),
        y: Math.max(0, compactDialogBox.y - 20),
        width: compactDialogBox.width + 36,
        height: compactDialogBox.height + 36,
      },
    });
  }

  await page.close();
  await desktopContext.close();

  // ───────────────────────────────────────────────────────────────────────────
  // MOBILE CONTEXT (393 x 852 - iPhone 15 Pro)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('Setting up mobile viewport (393 x 852) ...');
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3015/games/blackjack', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(2000);

  const mobileTriggerBtn = mobilePage.locator('button[aria-label="Open Royale Guide"]');
  if (await mobileTriggerBtn.isVisible()) {
    await mobileTriggerBtn.click();
    await mobilePage.waitForTimeout(1000);
  }

  // 10. MOTION & RESPONSIVE RESILIENCE (MOBILE SHEET)
  console.log('Capturing 10_mobile_responsive_sheet.png ...');
  const mobileDialog = mobilePage.locator('section[role="dialog"]');
  if (await mobileDialog.isVisible()) {
    const mBox = await mobileDialog.boundingBox();
    if (mBox) {
      await mobilePage.screenshot({
        path: path.join(OUTPUT_DIR, '10_mobile_responsive_sheet.png'),
        clip: {
          x: Math.max(0, mBox.x - 12),
          y: Math.max(0, mBox.y - 12),
          width: mBox.width + 24,
          height: mBox.height + 24,
        },
      });
    } else {
      await mobilePage.screenshot({
        path: path.join(OUTPUT_DIR, '10_mobile_responsive_sheet.png'),
        fullPage: true,
      });
    }
  }

  await mobilePage.close();
  await mobileContext.close();

  await browser.close();
  console.log('All 10 screenshots captured successfully in', OUTPUT_DIR);
}

main().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
