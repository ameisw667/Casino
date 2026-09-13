import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const crashStage = readFileSync(
  resolve(process.cwd(), 'src/components/casino/games/crash/CrashStage.tsx'),
  'utf8',
);
const globalStyles = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');

describe('Crash mobile stage backdrop', () => {
  it('selects a small mobile WebP through CSS rather than fetching the desktop PNG', () => {
    expect(crashStage).toContain('crash-stage-backdrop');
    expect(crashStage).toContain('crash-stage-mobile-backdrop');
    expect(crashStage).toContain('2026-09-05_backdrop-crash-quantum-nebula-mobile_v001.webp');
    expect(crashStage).toMatch(/priority\s*\/?>/);
    expect(crashStage).not.toContain('backgroundImage: "url(\'/images/2026-09-05_backdrop-crash-quantum-nebula_v001.png\')"');
    expect(globalStyles).toContain('.crash-stage-backdrop');
    expect(globalStyles).toContain('.crash-stage-mobile-backdrop');
    expect(globalStyles).toContain('2026-09-05_backdrop-crash-quantum-nebula-mobile_v001.webp');
    expect(globalStyles).toContain('@media (max-width: 1023px)');
  });
});