// Programmatic horizontal-overflow + overlap detector (NO screenshots, NO aesthetic judgment).
// Pure numeric DOM measurement via Playwright headless. Output: numbers only.
import { chromium } from 'playwright';

const BASE = 'http://localhost:3015';
const PAGES = [
  ['home', '/'],
  ['dice', '/games/dice'],
  ['slots', '/games/slots'],
  ['roulette', '/games/roulette'],
  ['crash', '/games/crash'],
  ['blackjack', '/games/blackjack'],
];
const VIEWPORTS = [
  ['mobile-375', 375, 812],
  ['tablet-768', 768, 1024],
  ['desktop-1280', 1280, 800],
];

function fmt(n) { return n.toFixed(1); }

const results = [];
const browser = await chromium.launch();

for (const [vname, w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const [pname, path] of PAGES) {
    const url = BASE + path;
    let status = 'ok';
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      // Fallback: domcontentloaded + settle
      try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch { status = 'nav-error'; }
    }
    // Allow client hydration / Framer Motion mount
    await page.waitForTimeout(1200);

    const m = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const vw = window.innerWidth;
      const hOverflow = Math.max(0, docW - vw);
      // Find elements exceeding viewport horizontally (exclude fixed/sticky off-canvas like nav drawers)
      const offenders = [];
      const all = document.querySelectorAll('body *');
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const right = r.right;
        const left = r.left;
        if (right > vw + 1 || left < -1) {
          // Skip elements that are intentionally offscreen (translateX nav, hidden)
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
          const tag = el.tagName.toLowerCase();
          const cls = (el.className && typeof el.className === 'string') ? el.className.slice(0, 40) : '';
          offenders.push({
            tag,
            cls,
            left: Math.round(left),
            right: Math.round(right),
            vw,
            w: Math.round(r.width),
          });
        }
      }
      // Limit offenders
      offenders.sort((a, b) => (Math.max(b.right - b.vw, -b.left)) - (Math.max(a.right - a.vw, -a.left)));
      return {
        docW,
        vw,
        hOverflow,
        offenderCount: offenders.length,
        topOffenders: offenders.slice(0, 5),
      };
    });

    results.push({ view: vname, vw: w, page: pname, status, hOverflow: m.hOverflow, offenderCount: m.offenderCount, top: m.topOffenders });
  }
  await ctx.close();
}

// --- Drawer-coverage check (mobile menu): open hamburger, compare z-indexes (numbers only) ---
let drawerCheck = { ok: false, reason: 'not-run' };
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    try { await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch { drawerCheck.reason = 'nav-error'; }
  }
  await page.waitForTimeout(1200);
  try {
    const menuBtn = page.getByRole('button', { name: 'Open navigation menu' });
    await menuBtn.click({ timeout: 8000 });
    await page.waitForTimeout(700);
    const z = await page.evaluate(() => {
      const getZ = (el) => (el ? parseInt(getComputedStyle(el).zIndex || '0', 10) || 0 : -1);
      // Drawer = .glass-sidebar (aside); MobileNav = fixed bottom nav with class mobile-only
      const drawer = document.querySelector('.glass-sidebar');
      const mobileNav = document.querySelector('nav.mobile-only');
      // Backdrop = the motion overlay rendered when drawer open (high-opacity dark fixed div)
      let backdrop = null;
      for (const el of document.querySelectorAll('body > div, body div')) {
        const st = getComputedStyle(el);
        if (st.position === 'fixed' && parseFloat(st.opacity) > 0 && /rgba\(0,\s*0,\s*0/.test(st.background)) {
          const z = getZ(el);
          if (z > 100 && z < 2000) { backdrop = el; break; }
        }
      }
      return { drawerZ: getZ(drawer), mobileNavZ: getZ(mobileNav), backdropZ: getZ(backdrop) };
    });
    const ok = z.drawerZ > z.mobileNavZ && z.backdropZ > z.mobileNavZ;
    drawerCheck = { ok, ...z };
  } catch (e) {
    drawerCheck = { ok: false, reason: 'click-failed: ' + (e?.message || String(e)).slice(0, 80) };
  }
  await ctx.close();
}
await browser.close();

// Report
console.log('=== PROGRAMMATIC OVERFLOW MEASUREMENT (numbers only, no visual judgment) ===');
for (const r of results) {
  const overflow = r.hOverflow > 0.5;
  const flag = overflow ? 'OVERFLOW' : 'ok';
  console.log(`[${r.view} ${r.vw}px] ${r.page.padEnd(10)} status=${r.status} hOverflow=${fmt(r.hOverflow)}px offenders=${r.offenderCount} -> ${flag}`);
  if (overflow && r.top.length) {
    for (const o of r.top) {
      console.log(`     offender: <${o.tag} ${o.cls}> left=${o.left} right=${o.right} width=${o.w} (vw=${o.vw})`);
    }
  }
}
console.log('=== SUMMARY ===');
const fails = results.filter(r => r.hOverflow > 0.5);
console.log(`Total checks: ${results.length} | Overflow cases: ${fails.length}`);
// Desktop-stability: ensure no desktop page has overflow (desktop must be unchanged/clean)
const desktopFails = results.filter(r => r.view === 'desktop-1280' && r.hOverflow > 0.5);
console.log(`Desktop overflow cases (must be 0): ${desktopFails.length}`);

console.log('=== MOBILE MENU DRAWER COVERAGE (z-index numbers, no visual judgment) ===');
console.log(`drawerCheck: ok=${drawerCheck.ok} drawerZ=${drawerCheck.drawerZ ?? 'n/a'} backdropZ=${drawerCheck.backdropZ ?? 'n/a'} mobileNavZ=${drawerCheck.mobileNavZ ?? 'n/a'}${drawerCheck.reason ? ' reason=' + drawerCheck.reason : ''}`);
console.log(`Drawer covers MobileNav (drawerZ > mobileNavZ AND backdropZ > mobileNavZ): ${drawerCheck.ok}`);

process.exitCode = (fails.length > 0 || !drawerCheck.ok) ? 1 : 0;