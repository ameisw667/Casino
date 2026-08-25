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
  { name: 'Tablet Portrait (768px)', width: 768, height: 1024 },
  { name: 'Desktop Standard (1280px)', width: 1280, height: 800 },
];

console.log('Starting fast parallel responsive audit...');
const browser = await chromium.launch();

const allFindings = [];

// Process pages in chunks
for (const pg of PAGES) {
  const url = BASE + pg.path;
  const pageResults = await Promise.all(VIEWPORTS.map(async (vp) => {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const findings = [];
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(400);

      const res = await page.evaluate(({ vw, vh }) => {
        const issues = [];
        const docW = document.documentElement.scrollWidth;
        const hOverflow = Math.max(0, docW - vw);

        if (hOverflow > 1) {
          const culprits = [];
          for (const el of document.querySelectorAll('body *')) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
            if (r.right > vw + 1 || r.left < -1) {
              const cls = (typeof el.className === 'string') ? el.className.slice(0, 30) : '';
              culprits.push(`<${el.tagName.toLowerCase()} class="${cls}"> (w:${Math.round(r.width)}px, r:${Math.round(r.right)}px)`);
            }
          }
          issues.push({
            type: 'Horizontal Overflow',
            details: `docW=${docW}px > vw=${vw}px (+${Math.round(hOverflow)}px). Täter: ${culprits.slice(0, 2).join('; ') || 'element'}`,
            severity: hOverflow > 20 ? 'Hoch' : 'Mittel',
          });
        }

        // Check for visible clipped texts
        const clipped = [];
        for (const el of document.querySelectorAll('h1, h2, h3, p, span, button')) {
          if (el.children.length > 0) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0 || r.top > vh || r.bottom < 0) continue;
          const cs = getComputedStyle(el);
          if (cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') continue;
          if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
            clipped.push(`"${el.innerText.slice(0, 20)}" (scrollW:${el.scrollWidth}px > clientW:${el.clientWidth}px)`);
          }
        }
        if (clipped.length > 0) {
          issues.push({
            type: 'Text Overflow / Truncation',
            details: `${clipped.length} Texte ragen unkontrolliert über ihren Container hinaus: ${clipped.slice(0, 2).join(', ')}`,
            severity: 'Niedrig',
          });
        }

        // Check overlapping buttons
        const btns = Array.from(document.querySelectorAll('button, a.btn, input[type="button"]')).filter(b => {
          const r = b.getBoundingClientRect();
          const cs = getComputedStyle(b);
          return r.width > 20 && r.height > 20 && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0' && r.top < vh && r.bottom > 0;
        });
        const overlaps = [];
        for (let i = 0; i < btns.length; i++) {
          for (let j = i + 1; j < btns.length; j++) {
            const ra = btns[i].getBoundingClientRect();
            const rb = btns[j].getBoundingClientRect();
            const xO = Math.max(0, Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left));
            const yO = Math.max(0, Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top));
            if (xO > 5 && yO > 5 && (xO * yO) > 100) {
              overlaps.push(`"${(btns[i].innerText || 'btn').slice(0, 15)}" & "${(btns[j].innerText || 'btn').slice(0, 15)}"`);
            }
          }
        }
        if (overlaps.length > 0) {
          issues.push({
            type: 'Button-Überlappung',
            details: `Buttons überlappen sich: ${overlaps.slice(0, 2).join('; ')}`,
            severity: 'Hoch',
          });
        }

        return issues;
      }, { vw: vp.width, vh: vp.height });

      for (const item of res) {
        findings.push({ viewport: vp.name, ...item });
      }
    } catch (e) {
      findings.push({ viewport: vp.name, type: 'Nav-Error', details: e.message, severity: 'Kritisch' });
    } finally {
      await ctx.close();
    }
    return findings;
  }));

  const flat = pageResults.flat();
  console.log(`Audited ${pg.name} (${pg.path}): ${flat.length === 0 ? '✅ PERFEKT (0 Issues)' : `⚠️ ${flat.length} Issues`}`);
  for (const f of flat) {
    allFindings.push({ page: pg.name, path: pg.path, ...f });
    console.log(`   - [${f.viewport}] [${f.severity}] ${f.type}: ${f.details}`);
  }
}

await browser.close();

console.log('\n=== AUDIT SUMMARY ===');
console.log(`Total Findings across 14 pages: ${allFindings.length}`);
