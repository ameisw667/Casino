import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('server-authoritative wallet boundary', () => {
  it('exposes one typed snapshot application boundary', () => {
    const contract = read('src/lib/casino/wallet-contract.ts');
    const store = read('src/store/useCasinoStore.ts');

    expect(contract).toContain('walletSnapshotSchema');
    expect(contract).toContain('transactionId');
    expect(store).toContain('applyServerWalletSnapshot');
    expect(store).toContain('walletSnapshotSchema.parse');
  });

  it('does not persist authoritative wallet fields in local storage', () => {
    const store = read('src/store/useCasinoStore.ts');
    const partialize = store.slice(store.indexOf('partialize:'));

    for (const field of ['balance', 'xp', 'level', 'rank']) {
      expect(partialize, field).toContain(`${field}: _`);
    }
  });

  it('does not gate server wallet loading behind a public feature flag', () => {
    const layout = read('src/components/layout/MainLayout.tsx');
    expect(layout).not.toContain('NEXT_PUBLIC_ENABLE_SERVER_WALLET_SYNC');
  });

  it('contains no browser-side wallet arithmetic implementations', () => {
    const store = read('src/store/useCasinoStore.ts');
    expect(store).not.toContain('balance: state.balance +');
    expect(store).not.toContain('balance: state.balance -');
    expect(store).not.toContain('xp: state.xp +');
    expect(store).not.toContain('rakebackPool: state.rakebackPool +');
  });
});
