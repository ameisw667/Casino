import { chromium } from 'playwright';

const BASE = 'http://localhost:3015';
const PAGES = [
  { name: 'Lobby (Home)', path: '/' },
  { name: 'Games Hub', path: '/games' },
  { name: 'Dice', path: '/games/dice' },
  { name: 'Crash (Solo)', path: '/games/crash' },
  { name: 'Crash (Multiplayer)', path: '/games/crash-multiplayer' },
  { name: 'Roulette', path: '/games/roulette' },
  { name: 'Slots', path: '/games/slots' },
  { name: 'Blackjack', path: '/games/blackjack' },
  { name: 'Leaderboard', path: '/leaderboard' },
  { name: 'History (My Bets)', path: '/history' },
  { name: 'VIP Vault', path: '/vault' },
  { name: 'Stats & Charts', path: '/stats' },
  { name: 'Sign In', path: '/sign-in' },
  { name: 'Sign Up', path: '/sign-up' },
];

const VIEWPORTS = [
  { name: 'Mobile XS (320px)', width: 320, height: 640 },
  { name: 'Mobile Standard (375px)', width: 375, height: 812 },
  { name: 'Mobile Large (414px)', width: 414, height: 896 },
  { name: 'Tablet Portrait (768px)', width: 768, height: 1024 },
  { name: 'Tablet Landscape / Laptop (1024px)', width: 1024, height: 768 },
  { name: 'Desktop Standard (1280px)', width: 1280, height: 800 },
  { name: 'Desktop Large / Ultrawide (1920px)', width: 1920, height: 1080 },
];

const findings = [];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  for (const pg of PAGES) {
    const url = BASE + pg.path;
    let _status = 'ok';
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000); // allow hydration & framer motion
    } catch (err) {
      _status = 'error: ' + err.message;
      findings.push({
        page: pg.name,
        path: pg.path,
        viewport: vp.name,
        width: vp.width,
        issue: 'Navigation failed or timed out: ' + err.message,
        severity: 'Critical',
      });
      continue;
    }

    const auditResult = await page.evaluate(({ vw, vh }) => {
      const issues = [];
      const docW = document.documentElement.scrollWidth;
      const hOverflow = Math.max(0, docW - vw);

      // 1. Check Horizontal Overflow
      if (hOverflow > 1) {
        // find culprit elements
        const culprits = [];
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
          if (r.right > vw + 1 || r.left < -1) {
            const cls = (typeof el.className === 'string') ? el.className.slice(0, 40) : '';
            culprits.push(`${el.tagName.toLowerCase()}.${cls} (w:${Math.round(r.width)}px, right:${Math.round(r.right)}px)`);
          }
        }
        issues.push({
          type: 'Horizontal Overflow',
          details: `Dokument breiter als Viewport um ${Math.round(hOverflow)}px (${docW}px > ${vw}px). Täter: ${culprits.slice(0, 3).join(', ') || 'container'}`,
          severity: hOverflow > 20 ? 'Hoch' : 'Mittel',
        });
      }

      // 2. Check Overlapping Action Elements (Buttons, Inputs)
      const interactives = Array.from(document.querySelectorAll('button, a, input, select, textarea'))
        .filter(el => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return r.width > 10 && r.height > 10 && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0' && r.top < vh && r.bottom > 0;
        });

      let overlapCount = 0;
      const overlapDetails = [];
      for (let i = 0; i < interactives.length; i++) {
        for (let j = i + 1; j < interactives.length; j++) {
          const a = interactives[i];
          const b = interactives[j];
          if (a.contains(b) || b.contains(a)) continue; // child/parent relation
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();

          // Check real intersection
          const xOverlap = Math.max(0, Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left));
          const yOverlap = Math.max(0, Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top));
          const overlapArea = xOverlap * yOverlap;
          const minArea = Math.min(ra.width * ra.height, rb.width * rb.height);

          // If more than 30% overlap and they aren't hidden by z-index or tabs
          if (overlapArea > 0 && (overlapArea / minArea) > 0.35) {
            overlapCount++;
            if (overlapDetails.length < 2) {
              const textA = (a.innerText || a.getAttribute('aria-label') || a.tagName).slice(0, 20).trim();
              const textB = (b.innerText || b.getAttribute('aria-label') || b.tagName).slice(0, 20).trim();
              overlapDetails.push(`"${textA}" überlappt mit "${textB}" (Fläche: ${Math.round(overlapArea)}px²)`);
            }
          }
        }
      }

      if (overlapCount > 0) {
        issues.push({
          type: 'Element-Überlappung',
          details: `${overlapCount} überlappende interaktive Elemente erkannt: ${overlapDetails.join('; ')}`,
          severity: 'Hoch',
        });
      }

      // 3. Check Sticky / Fixed Navigation Occlusion
      // Header height or Bottom Nav occlusion
      const header = document.querySelector('header, .header, nav.fixed');
      const bottomNav = document.querySelector('nav.mobile-only, .mobile-dock, nav.fixed-bottom');
      const _headerH = header ? header.getBoundingClientRect().height : 0;
      const _bottomNavH = bottomNav ? bottomNav.getBoundingClientRect().height : 0;

      // 4. Touch Target Sizes on Mobile (< 38px)
      if (vw <= 414) {
        const smallTouchTargets = interactives.filter(el => {
          const r = el.getBoundingClientRect();
          return r.width < 32 || r.height < 32;
        });
        if (smallTouchTargets.length > 5) {
          issues.push({
            type: 'Touch-Target zu klein',
            details: `${smallTouchTargets.length} interaktive Buttons/Links haben weniger als 32px Touch-Höhe/Breite auf Mobile.`,
            severity: 'Niedrig',
          });
        }
      }

      return issues;
    }, { vw: vp.width, vh: vp.height });

    for (const issue of auditResult) {
      findings.push({
        page: pg.name,
        path: pg.path,
        viewport: vp.name,
        width: vp.width,
        type: issue.type,
        details: issue.details,
        severity: issue.severity,
      });
    }
  }
  await ctx.close();
}

await browser.close();

console.log('=== AUDIT FINISHED ===');
console.log(JSON.stringify(findings, null, 2));
