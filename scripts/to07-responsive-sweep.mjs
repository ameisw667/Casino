// TO-07 Responsive-Overflow-Sweep (temporäres Mess-Skript, Plan T_FRONTEND/04-TO07-responsive-sweep.md)
// Read-only Messlauf über alle öffentlich messbaren UI-Routen × 6 Viewports. Kein Code-Fix.
// Nutzung: npm run dev (Port 3015) anwerfen, dann `node scripts/to07-responsive-sweep.mjs`.
// Ausgabe: Human-Report auf Konsole; am Ende `=== TO07 RESULT ===` + JSON; Exit 1 bei Kritisch/Hoch.

import { chromium } from 'playwright';

const BASE = 'http://localhost:3015';
const SETTLE_MS = 1000;
const NAV_TIMEOUT_MS = 30000;
const OVERHANG_MIN_PX = 1;
const OVERHANG_HIGH_PX = 16;
const OVERLAP_RATIO = 0.35;

const SEVERITY = { critical: 'Kritisch', high: 'Hoch', medium: 'Mittel', low: 'Niedrig' };

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 640 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-414', width: 414, height: 896 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

const ROUTES = [
  { path: '/', group: 'produkt' },
  { path: '/games', group: 'produkt' },
  { path: '/games/dice', group: 'produkt' },
  { path: '/games/crash', group: 'produkt' },
  { path: '/games/crash-multiplayer', group: 'produkt' },
  { path: '/games/roulette', group: 'produkt' },
  { path: '/games/slots', group: 'produkt' },
  { path: '/games/slots/v2', group: 'produkt' },
  { path: '/games/blackjack', group: 'produkt' },
  { path: '/history', group: 'produkt' },
  { path: '/leaderboard', group: 'produkt' },
  { path: '/stats', group: 'produkt' },
  { path: '/vault', group: 'produkt' },
  { path: '/v2', group: 'sandbox' },
  { path: '/games-2', group: 'sandbox' },
  { path: '/refactoring', group: 'sandbox' },
  { path: '/sign-in', group: 'auth' },
  { path: '/sign-up', group: 'auth' },
  { path: '/auth/reset-password', group: 'auth' },
  { path: '/testing/7.1', group: 'testing' },
  { path: '/testing/7.2', group: 'testing' },
  { path: '/testing/7.3', group: 'testing' },
  { path: '/testing/7.4', group: 'testing' },
  { path: '/testing/7.5', group: 'testing' },
  { path: '/testing/7.6', group: 'testing' },
  { path: '/testing/audio', group: 'testing' },
  { path: '/testing/brand-showcase', group: 'testing' },
  { path: '/testing/guide-sandbox', group: 'testing' },
  { path: '/testing/lobby-bento', group: 'testing' },
  { path: '/testing/neon-arcade-dashboard', group: 'testing' },
  { path: '/testing/fe-03-blackjack', group: 'testing' },
  { path: '/testing/fe-04-roulette', group: 'testing' },
  { path: '/testing/fe-05-dice', group: 'testing' },
  { path: '/testing/fe-06-crash', group: 'testing' },
];

const MEASURE_FN = () => {
  const vw = window.innerWidth;
  const hOverflow = document.documentElement.scrollWidth - vw;
  const isVisible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const selectorOf = (el) => {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? '#' + el.id : '';
    const cls =
      typeof el.className === 'string' && el.className
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
    return tag + id + cls;
  };

  const offenders = [];
  let offenderCount = 0;
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (!isVisible(el)) continue;
    const crossesRight = r.right - vw > 1 && r.left < vw;
    const crossesLeft = r.left < -1 && r.right > 0;
    if (!crossesRight && !crossesLeft) continue;
    const over = Math.max(crossesRight ? r.right - vw : 0, crossesLeft ? -r.left : 0);
    offenderCount += 1;
    if (offenders.length < 10)
      offenders.push({ selector: selectorOf(el), over: Math.round(over * 10) / 10 });
  }
  offenders.sort((a, b) => b.over - a.over);

  const interactive = [
    ...document.body.querySelectorAll('button, a, input, select, textarea'),
  ].filter(isVisible);
  const overlapRatio = (ra, rb) => {
    const ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
    const iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (ix <= 0 || iy <= 0) return 0;
    const aArea = ra.width * ra.height;
    const bArea = rb.width * rb.height;
    if (aArea <= 0 || bArea <= 0) return 0;
    return (ix * iy) / Math.min(aArea, bArea);
  };
  const overlaps = [];
  const contains = (big, small) =>
    big.left <= small.left + 1 &&
    big.right >= small.right - 1 &&
    big.top <= small.top + 1 &&
    big.bottom >= small.bottom - 1;
  for (let i = 0; i < interactive.length && overlaps.length < 10; i++) {
    for (let j = i + 1; j < interactive.length && overlaps.length < 10; j++) {
      const ra = interactive[i].getBoundingClientRect();
      const rb = interactive[j].getBoundingClientRect();
      if (contains(ra, rb) || contains(rb, ra)) continue;
      const ratio = overlapRatio(ra, rb);
      if (ratio > 0.35)
        overlaps.push({
          a: selectorOf(interactive[i]),
          b: selectorOf(interactive[j]),
          ratio: Math.round(ratio * 100),
        });
    }
  }

  const textOverflows = [];
  for (const el of document.body.querySelectorAll('h1,h2,h3,p,span,button')) {
    if (textOverflows.length >= 10) break;
    if (el.children.length > 0) continue;
    const s = getComputedStyle(el);
    if (s.overflowX === 'hidden' || s.textOverflow === 'ellipsis') continue;
    if (el.scrollWidth > el.clientWidth + 2) {
      textOverflows.push({
        selector: selectorOf(el),
        text: (el.textContent || '').trim().slice(0, 60),
        over: el.scrollWidth - el.clientWidth,
      });
    }
  }

  return {
    vw,
    hOverflow: Math.round((document.documentElement.scrollWidth - window.innerWidth) * 10) / 10,
    offenders: offenders.slice(0, 10),
    offenderCount,
    overlaps,
    textOverflows,
  };
};

const run = async () => {
  const browser = await chromium.launch();
  const findings = [];
  let checks = 0;

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    for (const route of ROUTES) {
      checks += 1;
      const base = { route: route.path, group: route.group, viewport: vp.name };
      let response;
      try {
        response = await page.goto(BASE + route.path, {
          waitUntil: 'domcontentloaded',
          timeout: NAV_TIMEOUT_MS,
        });
      } catch (error) {
        findings.push({
          ...base,
          type: 'nav-error',
          severity: SEVERITY.critical,
          details: String(error.message || error).slice(0, 200),
        });
        continue;
      }
      await page.waitForTimeout(SETTLE_MS);
      const status = response ? response.status() : 0;
      if (status >= 400) {
        findings.push({
          ...base,
          type: 'http-error',
          severity: SEVERITY.critical,
          details: `HTTP ${status}`,
        });
        continue;
      }
      const m = await page.evaluate(MEASURE_FN);
      if (m.offenderCount > 0) {
        const worst = m.offenders[0].over;
        findings.push({
          ...base,
          type: 'horizontal-overflow',
          severity: worst >= OVERHANG_HIGH_PX ? SEVERITY.high : SEVERITY.medium,
          details: `hOverflow ${m.hOverflow}px; ${m.offenderCount} offenders; worst ${worst}px; top: ${m.offenders
            .slice(0, 5)
            .map((o) => `${o.selector}(+${o.over}px)`)
            .join(', ')}`,
        });
      }
      if (m.overlaps.length > 0) {
        findings.push({
          ...base,
          type: 'interactive-overlap',
          severity: SEVERITY.medium,
          details: m.overlaps
            .slice(0, 5)
            .map((o) => `${o.a} <-> ${o.b} (${o.ratio}%)`)
            .join(' | '),
        });
      }
      if (m.textOverflows.length > 0) {
        findings.push({
          ...base,
          type: 'text-overflow',
          severity: SEVERITY.low,
          details: m.textOverflows
            .slice(0, 5)
            .map((t) => `${t.selector} (+${t.over}px) "${t.text}"`)
            .join(' | '),
        });
      }
      process.stdout.write(
        `[${vp.name}] ${route.path} status=${status} hOverflow=${m.hOverflow}px offenders=${m.offenderCount} overlaps=${m.overlaps.length} textOverflow=${m.textOverflows.length}\n`,
      );
    }
    await context.close();
  }

  await browser.close();

  const bySeverity = {};
  for (const f of findings) bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;

  console.log('=== TO07 SUMMARY ===');
  console.log(
    `checks=${checks} findings=${findings.length} bySeverity=${JSON.stringify(bySeverity)}`,
  );
  console.log('=== TO07 RESULT ===');
  console.log(
    JSON.stringify(
      {
        measuredAt: new Date().toISOString(),
        base: BASE,
        viewports: VIEWPORTS.map((v) => v.name),
        routeCount: ROUTES.length,
        checks,
        findings,
      },
      null,
      2,
    ),
  );

  if (findings.some((f) => f.severity === SEVERITY.critical || f.severity === SEVERITY.high)) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error('SWEEP CRASHED:', error);
  process.exit(1);
});
