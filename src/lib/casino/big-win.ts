// Shared big-win threshold. Used by the client-side BigWinOverlay trigger (MainLayout.tsx)
// and the server-side Telegram notifier so both stay in sync — see worldmap/05_2.2_telegram.md.
export const BIG_WIN_MULTIPLIER_THRESHOLD = 20;
export const BIG_WIN_PAYOUT_THRESHOLD = 500;

// Shared medium-win threshold (T_FRONTEND/Planungsdateien/02_audio_engine_plan.md, L1c/L4).
// Mirrors the "Medium Win Chime" band from xx_sop/04_design_system_ui.md §6 (5.0–19.99×) that
// sits between a standard win and BIG_WIN_MULTIPLIER_THRESHOLD. Presentation-only, like the
// constants above — used by SoundManager.playWinTier() to pick the audio escalation layer.
export const MEDIUM_WIN_MULTIPLIER_THRESHOLD = 5;

export interface BigWinCandidate {
  payout: number;
  multiplier: number;
}

export function isBigWin({ payout, multiplier }: BigWinCandidate): boolean {
  return multiplier >= BIG_WIN_MULTIPLIER_THRESHOLD || payout >= BIG_WIN_PAYOUT_THRESHOLD;
}
