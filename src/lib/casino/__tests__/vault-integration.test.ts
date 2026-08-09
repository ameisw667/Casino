import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('Vault & Lifetime Stats Backend Integration', () => {
  it('has WalletService.getUserStats and WalletService.syncAchievement methods in wallet.ts', () => {
    const walletSource = read('src/lib/casino/wallet.ts');
    expect(walletSource).toContain('getUserStats');
    expect(walletSource).toContain('syncAchievement');
    expect(walletSource).toContain("rpc('get_user_stats'");
    expect(walletSource).toContain("rpc('sync_user_achievement'");
  });

  it('contains migration 013 for server-authoritative lifetime stats and achievements', () => {
    const migration = read('supabase/migrations/013_user_stats_achievements.sql');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.user_achievements');
    expect(migration).toContain('CREATE OR REPLACE FUNCTION public.get_user_stats');
    expect(migration).toContain('CREATE OR REPLACE FUNCTION public.sync_user_achievement');
  });

  it('exposes /api/user/stats route and allows it in proxy.ts', () => {
    const proxy = read('src/proxy.ts');
    const statsRoute = read('src/app/api/user/stats/route.ts');
    expect(proxy).toContain("'/api/user/(.*)'");
    expect(statsRoute).toContain('WalletService.getUserStats');
    expect(statsRoute).toContain('WalletService.syncAchievement');
  });

  it('VaultPage uses dynamic session identity, achievement descriptions, and server stats merge', () => {
    const vaultPage = read('src/app/vault/page.tsx');
    const store = read('src/store/useCasinoStore.ts');
    expect(vaultPage).toContain('useSupabaseSession');
    expect(vaultPage).toContain('/api/user/stats');
    expect(vaultPage).toContain('displayName');
    expect(vaultPage).toContain('ach.description');
    expect(vaultPage).toContain('showAllAchievementsModal');
    expect(store).toContain('mergeServerAchievements');
    expect(store).toContain("fetch('/api/user/stats'");
  });
});
