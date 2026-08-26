import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../../../..');

describe('performance & mobile optimization', () => {
  it('has removed dead dependencies from package.json', () => {
    const pkgJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };

    expect(deps).not.toHaveProperty('svix');
    expect(deps).not.toHaveProperty('@types/webxr');
    expect(deps).not.toHaveProperty('@types/stats.js');
  });

  it('includes viewportFit: cover in RootLayout viewport export', () => {
    const layoutContent = readFileSync(resolve(root, 'src/app/layout.tsx'), 'utf8');

    // Quote-agnostic so the assertion survives Prettier's singleQuote config.
    expect(layoutContent).toMatch(/viewportFit:\s*['"]cover['"]/);
  });

  it('includes touch-action and mobile-dvh CSS rules in globals.css', () => {
    const cssContent = readFileSync(resolve(root, 'src/app/globals.css'), 'utf8');

    expect(cssContent).toContain('touch-action: manipulation');
    expect(cssContent).toContain('min-height: 100dvh');
    expect(cssContent).toContain('min-height: 44px');
  });

  it('bails WebGL water canvas on mobile before init and during JSX render', () => {
    const webGlContent = readFileSync(
      resolve(root, 'src/components/home/WebGlWaterRefractionCanvas.tsx'),
      'utf8',
    );

    expect(webGlContent).toContain("window.matchMedia('(max-width: 1023px)').matches");
    expect(webGlContent).toContain('return null;');
  });

  it('bails ambient background animation loop on mobile', () => {
    const bgContent = readFileSync(
      resolve(root, 'src/components/home/LobbyAmbientBackground.tsx'),
      'utf8',
    );

    expect(bgContent).toContain("window.matchMedia('(max-width: 1023px)').matches");
  });

  it('pauses HeroCinematicShowcase timers when tab is hidden or on mobile', () => {
    const heroContent = readFileSync(
      resolve(root, 'src/components/home/HeroCinematicShowcase.tsx'),
      'utf8',
    );

    expect(heroContent).toContain('visibilitychange');
    expect(heroContent).toContain("window.matchMedia('(max-width: 1023px)').matches");
  });

  it('constrains the games hub root inside the mobile scroll wrapper', () => {
    const gamesContent = readFileSync(resolve(root, 'src/app/games/page.tsx'), 'utf8');

    expect(gamesContent).toMatch(
      /maxWidth: '1400px',[\s\S]{0,120}width: '100%',[\s\S]{0,80}minWidth: 0/,
    );
  });

  it('constrains the dice game root before its mobile column layout applies', () => {
    const diceContent = readFileSync(resolve(root, 'src/app/games/dice/page.tsx'), 'utf8');

    expect(diceContent).toMatch(
      /maxWidth: '1600px',[\s\S]{0,120}width: '100%',[\s\S]{0,80}minWidth: 0/,
    );
  });

  it('stretches dice columns to the mobile container width', () => {
    const diceStyles = readFileSync(
      resolve(root, 'src/components/casino/games/dice/dice-page-styles.ts'),
      'utf8',
    );

    expect(diceStyles).toMatch(/\.dice-sidebar\s*\{[\s\S]*min-width:\s*0\s*!important;/);
    expect(diceStyles).toMatch(/\.dice-main\s*\{[\s\S]*width:\s*100%\s*!important;/);
    expect(diceStyles).toMatch(/\.dice-container\s*\{[\s\S]*flex-wrap:\s*nowrap\s*!important;/);
    expect(diceStyles).toMatch(
      /\.dice-stat-grid\s*\{[\s\S]*grid-template-columns:\s*1fr 1fr\s*!important;/,
    );
    expect(diceStyles).toContain('.dice-stat-grid > div:last-child');
    expect(diceStyles).toContain('.dice-stat-grid > div {');

    // The responsive CSS is injected by the dice page via the styles module.
    const dicePage = readFileSync(resolve(root, 'src/app/games/dice/page.tsx'), 'utf8');
    expect(dicePage).toContain('dicePageStyles');
  });

  it('allows the roulette center to shrink before the board scrolls horizontally', () => {
    const rouletteStyles = readFileSync(
      resolve(root, 'src/components/casino/games/roulette/roulette-page-styles.ts'),
      'utf8',
    );

    expect(rouletteStyles).toMatch(
      /\.roulette-center\s*\{[\s\S]*min-width:\s*0;[\s\S]*width:\s*100%;/,
    );

    // The responsive CSS is injected by RouletteClient via the styles module.
    const rouletteClient = readFileSync(
      resolve(root, 'src/app/games/roulette/RouletteClient.tsx'),
      'utf8',
    );
    expect(rouletteClient).toContain('roulettePageStyles');
  });

  it('keeps exposed QA navigation and showcase presets responsive', () => {
    for (const file of [
      'src/app/testing/7.3/GameActionButtonTestingClient.tsx',
      'src/app/testing/7.4/VibeSliderTestingClient.tsx',
      'src/app/testing/brand-showcase/BrandShowcaseClient.tsx',
    ]) {
      expect(readFileSync(resolve(root, file), 'utf8')).toContain('className="qa-route-nav"');
    }

    const showcase = readFileSync(
      resolve(root, 'src/app/testing/brand-showcase/BrandShowcaseClient.tsx'),
      'utf8',
    );
    const css = readFileSync(resolve(root, 'src/app/globals.css'), 'utf8');

    expect(showcase).toContain('className="qa-showcase-bet-row"');
    expect(css).toContain('.qa-route-nav > div');
    expect(css).toContain('.qa-showcase-bet-row');
  });

  it('fixes the MainLayout scroll-containment bug (min-height:0 + 100dvh + no outer scroll conflict)', () => {
    const layoutContent = readFileSync(
      resolve(root, 'src/components/layout/MainLayout.tsx'),
      'utf8',
    );

    expect(layoutContent).toContain("height: '100dvh',");
    expect(layoutContent).toContain("overflow: 'hidden',");
    expect(layoutContent).toMatch(/flex:\s*1,\s*minHeight:\s*0,/);
    expect(layoutContent).toContain("WebkitOverflowScrolling: 'touch'");
    expect(layoutContent).toContain("overscrollBehaviorY: 'contain'");
  });

  it('defines a responsive .auth-page-shell and flex .mobile-only for navigation bar', () => {
    const cssContent = readFileSync(resolve(root, 'src/app/globals.css'), 'utf8');

    expect(cssContent).toContain('.auth-page-shell {');
    expect(cssContent).toMatch(
      /@media \(max-width: 1023px\)\s*\{\s*\.auth-page-shell\s*\{[\s\S]*align-items:\s*flex-start;/,
    );
    expect(cssContent).toMatch(
      /@media \(max-width: 1023px\)[\s\S]*nav\.mobile-only[\s\S]*display:\s*flex\s*!important;/,
    );
  });

  it('uses the shared auth-page-shell class on both sign-up and sign-in', () => {
    const signUpContent = readFileSync(
      resolve(root, 'src/app/sign-up/[[...sign-up]]/page.tsx'),
      'utf8',
    );
    const signInContent = readFileSync(
      resolve(root, 'src/app/sign-in/[[...sign-in]]/page.tsx'),
      'utf8',
    );

    expect(signUpContent).toContain('className="auth-page-shell"');
    expect(signInContent).toContain('className="auth-page-shell"');
  });
});
