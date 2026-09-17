import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR =
  'C:/Users/hambu/.gemini/antigravity/brain/55420c43-25f7-4aa8-b7b4-e35ba8f209c9';
const AUDIT_DIR = path.join(ARTIFACT_DIR, 'audit_testing_v3_6steps');

if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser for Testing V3 6-Step Audit (0%, 20%, 40%, 60%, 80%, 100%)...');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Navigate directly to the isolated laboratory route
  await page.goto('http://localhost:3015/testing/v3', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(2500);

  // Measure hero track scroll scrub distance (trackH - winH)
  const heroMetrics = await page.evaluate(() => {
    const track = document.querySelector('[data-scrolly-track="v3-hero"]');
    const tH = track ? track.offsetHeight : window.innerHeight * 3.5;
    const wH = window.innerHeight;
    return {
      trackH: tH,
      winH: wH,
      scrubDistance: tH - wH,
    };
  });
  console.log('HERO METRICS:', JSON.stringify(heroMetrics));

  // Disable smooth scrolling to ensure precise frame capture at target scroll positions
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
  });

  const auditSteps = [0, 20, 40, 60, 80, 100];

  for (const pct of auditSteps) {
    // For 100%, subtract 20px so the sticky container remains pinned in the hero track
    const targetScroll =
      pct === 100
        ? heroMetrics.scrubDistance - 20
        : Math.round((pct / 100) * heroMetrics.scrubDistance);

    await page.evaluate((st) => {
      window.scrollTo({ top: st, behavior: 'instant' });
    }, targetScroll);

    // Wait for GSAP scrub lerp, Framer Motion springs and 3D positioning to settle
    await page.waitForTimeout(800);

    const filename = `v3_audit_${String(pct).padStart(3, '0')}pct.png`;
    const filepath = path.join(AUDIT_DIR, filename);

    const logInfo = await page.evaluate(() => {
      const track = document.querySelector('[data-scrolly-track="v3-hero"]');
      const sticky = track ? track.querySelector('[style*="position: sticky"]') : null;
      const sRect = sticky ? sticky.getBoundingClientRect() : null;
      const progressText = document.querySelector('[style*="SCROLL PROGRESS"]')?.textContent;
      return {
        scrollY: window.scrollY,
        stickyTop: sRect ? sRect.top : null,
        stickyHeight: sRect ? sRect.height : null,
        progressText,
      };
    });
    console.log(`[Frame ${pct}%]`, JSON.stringify(logInfo));

    await page.screenshot({ path: filepath });
    console.log(`Saved audit frame ${pct}% -> ${filename}`);
  }

  await browser.close();
  console.log(`All 6 audit frames successfully written to ${AUDIT_DIR}`);
}

run().catch((err) => {
  console.error('Error during V3 audit capture:', err);
  process.exit(1);
});
