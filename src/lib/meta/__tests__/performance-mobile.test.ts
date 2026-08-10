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
});
