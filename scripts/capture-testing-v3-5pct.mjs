import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR =
  'C:/Users/hambu/.gemini/antigravity/brain/55420c43-25f7-4aa8-b7b4-e35ba8f209c9';
const FRAMES_DIR = path.join(ARTIFACT_DIR, 'frames_testing_v3_5pct');

if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser for Testing V3 5% step capture...');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Navigate directly to the isolated laboratory route
  await page.goto('http://localhost:3015/testing/v3', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(2500);

  // Measure total scroll distance for testing/v3 (220vh sticky track)
  const scrollDistance = await page.evaluate(() => {
    const track = document.querySelector('[style*="220vh"]');
    if (track) {
      return track.offsetHeight - window.innerHeight;
    }
    return window.innerHeight * 1.2;
  });

  console.log(`Testing V3 Scrolly total scrub distance: ${scrollDistance}px`);

  // Capture 21 frames: 0%, 5%, 10%, ... 100%
  const totalSteps = 20; // 0 to 20 -> 0% to 100%
  const generatedFiles = [];

  for (let i = 0; i <= totalSteps; i++) {
    const pct = i * 5;
    const targetScroll = Math.round((pct / 100) * scrollDistance);

    await page.evaluate((st) => {
      window.scrollTo(0, st);
    }, targetScroll);

    // Wait for GSAP scrub lerp and spring physics to settle
    await page.waitForTimeout(400);

    const filename = `v3_step_${String(pct).padStart(3, '0')}pct.png`;
    const filepath = path.join(FRAMES_DIR, filename);

    await page.screenshot({ path: filepath });
    generatedFiles.push({ pct, filename, filepath, targetScroll });
    console.log(
      `Frame ${i + 1}/${totalSteps + 1}: ${pct}% (scroll: ${targetScroll}px) saved -> ${filename}`,
    );
  }

  await browser.close();
  console.log(`All 21 frames successfully written to ${FRAMES_DIR}`);
}

run().catch((err) => {
  console.error('Error during V3 capture:', err);
  process.exit(1);
});
