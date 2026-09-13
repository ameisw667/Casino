import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const layout = readFileSync(resolve(process.cwd(), 'src/components/layout/MainLayout.tsx'), 'utf8');

describe('MainLayout initial render', () => {
  it('does not withhold every route behind a post-hydration mounted gate', () => {
    expect(layout).not.toContain('if (!mounted) {');
    expect(layout).not.toContain('INITIALIZING CASINO...');
  });
});