import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, '../wallet.ts'), 'utf8');

describe('WalletService authority', () => {
  it('uses only the new atomic idempotent RPCs', () => {
    expect(source).toContain("rpc('settle_game_bet'");
    expect(source).toContain("rpc('start_game_round'");
    expect(source).toContain("rpc('settle_game_round'");
    expect(source).not.toContain("rpc('place_bet'");
    expect(source).not.toContain("rpc('settle_bet'");
  });

  it('provisions a missing Clerk user before reading the wallet', () => {
    expect(source).toContain("onConflict: 'id'");
    expect(source).toContain('ignoreDuplicates: true');
  });
});
