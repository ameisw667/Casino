import { describe, it, expect } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { getJwtClaimsFromUser, isJwtAdminUser, customJwtAppMetadataSchema } from '../jwt-claims';

describe('Custom JWT Claims Extractor & Schema', () => {
  it('returns default fallback claims when user is null or undefined', () => {
    const fromNull = getJwtClaimsFromUser(null);
    expect(fromNull).toEqual({
      vipTier: 'BRONZE',
      vipLevel: 1,
      userRole: 'anonymous',
      isAdmin: false,
    });

    const fromUndefined = getJwtClaimsFromUser(undefined);
    expect(fromUndefined).toEqual({
      vipTier: 'BRONZE',
      vipLevel: 1,
      userRole: 'anonymous',
      isAdmin: false,
    });
  });

  it('returns authenticated defaults when app_metadata is missing', () => {
    const user = {
      id: 'usr_123',
      email: 'player@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-08-23T00:00:00.000Z',
    } as unknown as User;

    const claims = getJwtClaimsFromUser(user);
    expect(claims).toEqual({
      vipTier: 'BRONZE',
      vipLevel: 1,
      userRole: 'authenticated',
      isAdmin: false,
    });
    expect(isJwtAdminUser(user)).toBe(false);
  });

  it('correctly parses valid injected claims from GoTrue app_metadata', () => {
    const user = {
      id: 'usr_gold_admin',
      email: 'admin@casino.com',
      app_metadata: {
        provider: 'email',
        providers: ['email'],
        vip_tier: 'GOLD',
        vip_level: 18,
        user_role: 'admin',
      },
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2026-08-23T00:00:00.000Z',
    } as unknown as User;

    const claims = getJwtClaimsFromUser(user);
    expect(claims).toEqual({
      vipTier: 'GOLD',
      vipLevel: 18,
      userRole: 'admin',
      isAdmin: true,
    });
    expect(isJwtAdminUser(user)).toBe(true);
  });

  it('normalizes lowercase tier names to uppercase VipTier', () => {
    const user = {
      id: 'usr_plat',
      email: 'plat@example.com',
      app_metadata: {
        vip_tier: 'platinum',
        vip_level: 25,
        user_role: 'vip_player',
      },
    } as unknown as User;

    const claims = getJwtClaimsFromUser(user);
    expect(claims.vipTier).toBe('PLATINUM');
    expect(claims.vipLevel).toBe(25);
    expect(claims.userRole).toBe('vip_player');
    expect(claims.isAdmin).toBe(false);
  });

  it('falls back safely when vip_tier is unknown or invalid', () => {
    const parsed = customJwtAppMetadataSchema.safeParse({
      vip_tier: 'SUPER_DIAMOND_ULTRA',
      vip_level: -5,
      user_role: '',
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.vip_tier).toBe('BRONZE');
      expect(parsed.data.vip_level).toBe(1);
      expect(parsed.data.user_role).toBe('authenticated');
    }
  });

  it('coerces string numbers for vip_level', () => {
    const user = {
      id: 'usr_str',
      app_metadata: {
        vip_tier: 'DIAMOND',
        vip_level: '42',
        user_role: 'player',
      },
    } as unknown as User;

    const claims = getJwtClaimsFromUser(user);
    expect(claims.vipTier).toBe('DIAMOND');
    expect(claims.vipLevel).toBe(42);
  });
});
