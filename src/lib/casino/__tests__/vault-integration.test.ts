import { describe, expect, it } from 'vitest';
import { WalletService } from '../wallet';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('Vault & Lifetime Stats Backend Integration', () => {
  it('has WalletService.getUserStats and WalletService.syncAchievement methods', () => {
    expect(WalletService.getUserStats).toBeDefined();
    expect(WalletService.syncAchievement).toBeDefined();
  });

  it('contains migration 013 for server-authoritative lifetime stats and achievements', () => {
    const migration = read('supabase/migrations/013_user_stats_achievements.sql');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.user_achievements');
    expect(migration).toContain('CREATE OR REPLACE FUNCTION public.get_user_stats');
    expect(migration).toContain('CREATE OR REPLACE FUNCTION public.sync_user_achievement');
  });

  it('exposes /api/user/stats route and allows it in proxy.ts', () => {
    const proxy = read('src/proxy.ts');
    expect(proxy).toContain("'/api/user/(.*)'");
  });

  it('VaultPage uses dynamic user session identity and server stats', () => {
    const vaultPage = read('src/app/vault/page.tsx');
    expect(vaultPage).toContain('useSupabaseSession');
    expect(vaultPage).toContain('/api/user/stats');
    expect(vaultPage).toContain('displayName');
    expect(vaultPage).not.toContain("VibeCoder_Royale</div>");
  });
});
