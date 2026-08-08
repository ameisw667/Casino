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

    expect(layoutContent).toContain('viewportFit: "cover"');
  });

  it('includes touch-action and mobile-dvh CSS rules in globals.css', () => {
    const cssContent = readFileSync(resolve(root, 'src/app/globals.css'), 'utf8');

    expect(cssContent).toContain('touch-action: manipulation');
    expect(cssContent).toContain('min-height: 100dvh');
    expect(cssContent).toContain('min-height: 44px');
  });
});
