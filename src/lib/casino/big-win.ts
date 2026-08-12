// Shared big-win threshold. Used by the client-side BigWinOverlay trigger (MainLayout.tsx)
// and the server-side Telegram notifier so both stay in sync — see worldmap/05_2.2_telegram.md.
export const BIG_WIN_MULTIPLIER_THRESHOLD = 20;
export const BIG_WIN_PAYOUT_THRESHOLD = 500;

export interface BigWinCandidate {
  payout: number;
  multiplier: number;
}

export function isBigWin({ payout, multiplier }: BigWinCandidate): boolean {
  return multiplier >= BIG_WIN_MULTIPLIER_THRESHOLD || payout >= BIG_WIN_PAYOUT_THRESHOLD;
}
