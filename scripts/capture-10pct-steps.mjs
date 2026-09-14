import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR =
  'C:/Users/hambu/.gemini/antigravity/brain/9491d6bc-1d4c-4af1-a400-7fa59f9e04b5';
const FRAMES_DIR = path.join(ARTIFACT_DIR, 'frames_10pct');

if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser for 10% step capture...');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3015', { waitUntil: 'domcontentloaded', timeout: 25000 });

  // Wait for Stargate seal image and card to be fully loaded and decoded
  try {
    await page.waitForFunction(
      () => {
        const seal = document.querySelector('img[alt="Casino Royale Stargate Seal"]');
        const ace = document.querySelector('img[alt="Quantum Ace of Spades"]');
        return (
          seal &&
          seal.complete &&
          seal.naturalWidth > 0 &&
          ace &&
          ace.complete &&
          ace.naturalWidth > 0
        );
      },
      { timeout: 15000 },
    );
    console.log('Stargate Seal & Quantum Ace fully decoded and painted!');
  } catch (e) {
    console.warn('Selector wait fallback:', e.message);
  }
  await page.waitForTimeout(1000);

  // Measure total hero scroll distance
  const scrollDistance = await page.evaluate(() => {
    const track =
      document.querySelector('[style*="200vh"]') || document.querySelector('[style*="140vh"]');
    const sc = document.querySelector('#main-scroll-container');
    if (track && sc) {
      const diff = track.offsetHeight - sc.clientHeight;
      return Math.max(500, diff);
    }
    return 750;
  });

  console.log(`Hero Scrolly total scrub distance: ${scrollDistance}px`);

  // Capture 11 frames: 0%, 10%, 20%, ... 100%
  const totalSteps = 10; // 0 to 10 -> 0% to 100%
  const generatedFiles = [];

  for (let i = 0; i <= totalSteps; i++) {
    const pct = i * 10;
    const targetScroll = Math.round((pct / 100) * scrollDistance);

    await page.evaluate((st) => {
      const sc = document.querySelector('#main-scroll-container');
      if (sc) {
        sc.scrollTop = st;
      }
    }, targetScroll);

    // Wait for GSAP scrub lerp and spring physics to settle
    await page.waitForTimeout(1000);

    const filename = `hero_step_${String(pct).padStart(3, '0')}pct.png`;
    const filepath = path.join(FRAMES_DIR, filename);

    await page.screenshot({ path: filepath });
    generatedFiles.push({ pct, filename, filepath, targetScroll });
    console.log(
      `Frame ${i + 1}/${totalSteps + 1}: ${pct}% (scroll: ${targetScroll}px) saved -> ${filename}`,
    );
  }

  await browser.close();
  console.log('All 11 frames successfully captured in frames_10pct!');
}

run().catch((err) => {
  console.error('Error capturing frames:', err);
  process.exit(1);
});
