import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('public security surface', () => {
  it('keeps the fairness engine but removes the retired public page', () => {
    expect(existsSync(resolve(root, 'src/app/fairness/page.tsx'))).toBe(false);
    expect(existsSync(resolve(root, 'src/lib/casino/provably-fair.ts'))).toBe(true);

    expect(read('src/proxy.ts')).toContain("'/fairness'");
    const visibleNavigationSources = [
      'src/components/layout/MainLayout.tsx',
      'src/components/layout/MobileNav.tsx',
      'src/components/navigation/CommandPalette.tsx',
    ].filter((path) => existsSync(resolve(root, path)));

    for (const path of visibleNavigationSources) {
      expect(read(path), path).not.toContain('/fairness');
    }
  });
});
