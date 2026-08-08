import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('canonical game routes', () => {
  it('uses the promoted roulette client without direct balance mutation', () => {
    expect(existsSync(resolve(root, 'src/app/games/roulette/RouletteClient.tsx'))).toBe(true);

    const page = read('src/app/games/roulette/page.tsx');
    const client = read('src/app/games/roulette/RouletteClient.tsx');

    expect(page).toContain("from './RouletteClient'");
    expect(client).not.toContain('removeBalance');
    expect(client).toContain('processGameResult({');
    expect(client).not.toContain('isSettlement: true');
  });

  it('uses the promoted slots page and canonical components', () => {
    const page = read('src/app/games/slots/page.tsx');

    expect(page).toContain("@/components/casino/games/slots/SlotReel");
    expect(page).toContain("@/components/casino/games/slots/WinLine");
    expect(page).toContain("from './symbols'");
    expect(page).toContain('ZEUS VAULT');
    expect(page).not.toContain('SlotLightsBar');
    expect(read('src/components/casino/games/slots/SlotReel.tsx')).toContain(
      'export function SlotReel',
    );
    expect(read('src/components/casino/games/slots/WinLine.tsx')).toContain(
      'export function WinLine',
    );
  });
});
