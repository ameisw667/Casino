import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { CRASH_MULTIPLAYER_STYLES } from '../crash-multiplayer-styles';

describe('crash multiplayer mobile stage', () => {
  it('does not apply the expensive glass backdrop filter on mobile', () => {
    expect(CRASH_MULTIPLAYER_STYLES).toMatch(
      /@media \(max-width: 960px\) \{[\s\S]*?\.obsidian-glass \{ backdrop-filter: none; -webkit-backdrop-filter: none; \}/,
    );
  });

  it('defers the idle mobile canvas loop until the static multiplier can paint', () => {
    const loopSource = readFileSync(
      resolve(import.meta.dirname, '..', 'useCrashMultiplayerGameLoop.ts'),
      'utf8',
    );

    expect(loopSource).toContain('const MOBILE_IDLE_CANVAS_DELAY_MS = 5_000;');
  });
});
