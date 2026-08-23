import type { CSSProperties } from 'react';

export interface TotalStats {
  totalBets: number;
  totalWins: number;
  totalProfit: number;
  winRate: number;
  wagered: number;
}

export const card = (extra?: CSSProperties): CSSProperties => ({
  borderRadius: '16px',
  background: 'linear-gradient(145deg, rgba(24, 24, 32, 0.7) 0%, rgba(12, 12, 18, 0.88) 100%)',
  border: '1px solid rgba(212, 175, 55, 0.12)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
  ...extra,
});
