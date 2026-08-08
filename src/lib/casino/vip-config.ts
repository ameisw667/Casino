export interface VipTier {
  id: number;
  name: string;
  minXp: number;
  rakeback: number;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Rank {
  id: number;
  name: string;
  minLevel: number;
  color: string;
  rakeback: number;
  perks: string[];
  sortOrder: number;
  isActive: boolean;
}

export interface VipConfig {
  vipTiers: VipTier[];
  ranks: Rank[];
}

export const DEFAULT_VIP_CONFIG: VipConfig = {
  vipTiers: [
    { id: 1, name: 'BRONZE', minXp: 0, rakeback: 0.01, color: '#cd7f32', sortOrder: 1, isActive: true },
    { id: 2, name: 'SILVER', minXp: 5000, rakeback: 0.02, color: '#c0c0c0', sortOrder: 2, isActive: true },
    { id: 3, name: 'GOLD', minXp: 25000, rakeback: 0.03, color: '#ffd700', sortOrder: 3, isActive: true },
    { id: 4, name: 'PLATINUM', minXp: 100000, rakeback: 0.05, color: '#e5e4e2', sortOrder: 4, isActive: true },
    { id: 5, name: 'DIAMOND', minXp: 500000, rakeback: 0.10, color: '#b9f2ff', sortOrder: 5, isActive: true },
  ],
  ranks: [
    { id: 1, name: 'Bronze', minLevel: 1, color: '#CD7F32', rakeback: 0.01, perks: ['Daily Missions', 'Basic Rakeback'], sortOrder: 1, isActive: true },
    { id: 2, name: 'Silver', minLevel: 10, color: '#C0C0C0', rakeback: 0.012, perks: ['Priority Support', 'Enhanced Rakeback'], sortOrder: 2, isActive: true },
    { id: 3, name: 'Gold', minLevel: 25, color: '#FFD700', rakeback: 0.015, perks: ['Private Access', 'Weekly Bonuses'], sortOrder: 3, isActive: true },
    { id: 4, name: 'Platinum', minLevel: 50, color: '#E5E4E2', rakeback: 0.018, perks: ['VIP Manager', 'Custom Cases'], sortOrder: 4, isActive: true },
    { id: 5, name: 'Diamond', minLevel: 100, color: '#B9F2FF', rakeback: 0.02, perks: ['Instant Withdrawals', 'Global Recognition'], sortOrder: 5, isActive: true },
  ],
};

/**
 * Resolve the VIP tier for a given XP value from a sorted tier list.
 */
export function getVipTierByXp(tiers: VipTier[], xp: number): VipTier {
  return [...tiers].reverse().find(t => xp >= t.minXp) ?? tiers[0];
}

/**
 * Resolve the rank for a given level from a sorted rank list.
 */
export function getRankByLevel(ranks: Rank[], level: number): Rank {
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (level >= ranks[i].minLevel) return ranks[i];
  }
  return ranks[0];
}
