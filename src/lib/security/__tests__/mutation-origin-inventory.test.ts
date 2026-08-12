import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const protectedMutationRoutes = [
  'src/app/api/admin/promo-codes/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/casino/bet/route.ts',
  'src/app/api/casino/blackjack/route.ts',
  'src/app/api/casino/redeem-code/route.ts',
  'src/app/api/casino/seeds/route.ts',
  'src/app/api/chat/bot-response/route.ts',
  'src/app/api/chat/route.ts',
  'src/app/api/user/stats/route.ts',
  'src/app/api/telegram/link/route.ts',
  'src/app/api/telegram/unlink/route.ts',
  'src/app/api/telegram/toggle/route.ts',
];

describe('browser mutation origin inventory', () => {
  it.each(protectedMutationRoutes)(
    '%s rejects cross-origin input before parsing a body',
    (path) => {
      const route = readFileSync(resolve(root, path), 'utf8');
      const guardIndex = route.indexOf('const originFailure = validateMutationOrigin(request);');
      const parseIndex = route.indexOf('await request.json()');

      expect(route).toContain('validateMutationOrigin');
      expect(guardIndex).toBeGreaterThan(-1);
      expect(guardIndex).toBeLessThan(parseIndex);
    },
  );
});
