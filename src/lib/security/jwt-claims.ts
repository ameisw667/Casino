import { z } from 'zod';
import type { User } from '@supabase/supabase-js';

export const VIP_TIER_NAMES = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const;
export type VipTierName = (typeof VIP_TIER_NAMES)[number];

export const customJwtAppMetadataSchema = z.object({
  vip_tier: z
    .unknown()
    .transform((val) => {
      if (typeof val !== 'string') return 'BRONZE';
      const upper = val.toUpperCase();
      return (VIP_TIER_NAMES as readonly string[]).includes(upper) ? (upper as VipTierName) : 'BRONZE';
    })
    .default('BRONZE'),
  vip_level: z
    .unknown()
    .transform((val) => {
      const num = typeof val === 'number' ? val : Number(val);
      return Number.isInteger(num) && num >= 1 ? num : 1;
    })
    .default(1),
  user_role: z
    .unknown()
    .transform((val) => (typeof val === 'string' && val.trim().length > 0 ? val.trim() : 'authenticated'))
    .default('authenticated'),
});

export type CustomJwtAppMetadata = z.infer<typeof customJwtAppMetadataSchema>;

export interface ExtractedJwtClaims {
  vipTier: VipTierName;
  vipLevel: number;
  userRole: string;
  isAdmin: boolean;
}

/**
 * Extracts and normalizes custom JWT claims from a Supabase User object.
 * Safe fallback guarantees never throwing even if app_metadata is missing or malformed.
 */
export function getJwtClaimsFromUser(user: User | null | undefined): ExtractedJwtClaims {
  if (!user) {
    return {
      vipTier: 'BRONZE',
      vipLevel: 1,
      userRole: 'anonymous',
      isAdmin: false,
    };
  }

  const rawAppMetadata = user.app_metadata ?? {};
  const parsed = customJwtAppMetadataSchema.safeParse(rawAppMetadata);

  const vipTier: VipTierName = parsed.success ? (parsed.data.vip_tier as VipTierName) : 'BRONZE';
  const vipLevel = parsed.success ? parsed.data.vip_level : 1;
  const userRole = parsed.success ? parsed.data.user_role : 'authenticated';
  const isAdmin = userRole.toLowerCase() === 'admin';

  return {
    vipTier,
    vipLevel,
    userRole,
    isAdmin,
  };
}

/**
 * Fast-path check whether the user holds an admin role claim.
 */
export function isJwtAdminUser(user: User | null | undefined): boolean {
  return getJwtClaimsFromUser(user).isAdmin;
}
