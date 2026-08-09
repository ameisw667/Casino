import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const api = readFileSync(resolve(root, 'src/app/api/casino/blackjack/route.ts'), 'utf8');

describe('server blackjack authority', () => {
  it('executes every player action through the stateful server route', () => {
    for (const action of ['DEAL', 'HIT', 'STAND', 'DOUBLE', 'SPLIT'])
      expect(api).toContain(`'${action}'`);
    expect(api).toContain('advanceBlackjackRound');
    expect(api).toContain('getActiveRound');
  });

  it('keeps the Blackjack client free of local settlement logic', () => {
    const client = readFileSync(resolve(root, 'src/app/games/blackjack/page.tsx'), 'utf8');
    expect(client).toContain("fetch('/api/casino/blackjack'");
    expect(client).not.toContain('BlackjackEngine.');
    expect(client).not.toContain("gameType: 'BLACKJACK'");
    expect(client).not.toContain('payout: settled');
  });
  it('does not expose the remaining deck', () => {
    expect(api).toContain('deck: []');
  });
});
