import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('seed history verifier entry point', () => {
  it('mounts the verifier inside the private settings surface without restoring the retired public route', () => {
    expect(existsSync(resolve(root, 'src/app/fairness/page.tsx'))).toBe(false);
    const layout = read('src/components/layout/MainLayout.tsx');
    expect(layout).toContain('showProvablyFair');
    expect(layout).toContain('<ProvablyFairModal');
    expect(layout).not.toContain("path: '/fairness'");
  });
});
