import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const lobby = readFileSync(resolve(process.cwd(), 'src/components/home/BentoLobbyHome.tsx'), 'utf8');
const arcadeCells = readFileSync(
  resolve(process.cwd(), 'src/components/home/bento/BentoArcadeCells.tsx'),
  'utf8',
);
const portalVisual = readFileSync(
  resolve(process.cwd(), 'src/components/home/hero-scrolly/HeroScrollyPortalVisual.tsx'),
  'utf8',
);

describe('Bento lobby initial loading', () => {
  it('uses a mobile-first server snapshot so the initial mobile layout does not collapse after hydration', () => {
    expect(lobby).toContain('useSyncExternalStore');
    expect(lobby).toContain("window.matchMedia('(max-width: 1023px)')");
    expect(lobby).toContain('getMobileFirstServerSnapshot');
    expect(lobby).toContain('return true;');
  });
  it('waits for a real mobile scroll before rendering below-the-fold cells', () => {
    expect(lobby).toContain("window.matchMedia('(max-width: 1023px)')");
    expect(lobby).toContain("window.addEventListener('scroll'");
    expect(lobby).toContain('shouldRenderDeferredContent');
    expect(lobby).toContain('<ArcadeHeroCell isMobile={isMobile} />');
    expect(lobby).toContain(
      '{shouldRenderDeferredContent && <BentoArcadeDeferredCells isMobile={isMobile} />}',
    );
    expect(arcadeCells).toContain('export function BentoArcadeDeferredCells');
  });

  it('defers below-the-fold dynamic cells until an idle slot', () => {
    expect(lobby).toContain('requestIdleCallback');
    expect(lobby).toContain('shouldRenderDeferredContent && (');
    expect(lobby).toContain('<LiveHighlightStream />');
    expect(lobby).toContain('<BentoJackpotCell isMobile={isMobile} />');
  });
});
it('keeps the above-the-fold Crash LCP cell paintable before client hydration', () => {
  expect(arcadeCells).not.toContain('initial={{ opacity: 0, y: 18 }}');
  expect(arcadeCells).toContain("sizes=\"(max-width: 1023px) 100vw, 800px\"");
});
it('keeps the above-the-fold cinematic hero and its LCP copy visible during SSR', () => {
  const cinematicHero = readFileSync(
    resolve(process.cwd(), 'src/components/home/HeroCinematicShowcase.tsx'),
    'utf8',
  );
  const headline = readFileSync(
    resolve(process.cwd(), 'src/components/home/hero-cinematic/HeroHeadlineColumn.tsx'),
    'utf8',
  );
  expect(cinematicHero).not.toContain('initial={{ opacity: 0, y: 20 }}');
  expect(cinematicHero).toContain('shouldRenderDesktopContent');
  expect(cinematicHero).toMatch(/shouldRenderDesktopContent\s*&&\s*\(\s*<GameShowcaseCard/);
  expect(cinematicHero).toContain("window.matchMedia('(min-width: 1024px)')");
  expect(headline).not.toContain('initial={{ opacity: 0, y: 15 }}');
  const textRepelHeadline = readFileSync(
    resolve(process.cwd(), 'src/components/home/hero-cinematic/TextRepelHeadline.tsx'),
    'utf8',
  );
  expect(textRepelHeadline).not.toContain('initial={{ opacity: 0, y: 15 }}');
});
it('keeps the mobile portal SSR-light and defers the animated desktop portal bundle', () => {
  expect(portalVisual).toContain("dynamic(() => import('./HeroScrollyDesktopPortalVisual')");
  expect(portalVisual).toContain('ssr: false');
  expect(portalVisual).toContain('MobilePortalInitial');
  expect(portalVisual).not.toContain('2026-09-04_brand-ace-quantum-gold_v001.png');
  expect(portalVisual).not.toContain('2026-09-05_seal-casino-royale-quantum-gold_v001.png');
});