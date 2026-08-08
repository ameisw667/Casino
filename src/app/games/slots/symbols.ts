import type { SymbolType } from '@/components/casino/SlotSymbol'

// Index 0–7 entspricht dem Engine-Output von getSlotsResult(symbolsPerReel=8)
export const GAME_SYMBOLS: SymbolType[] = [
  'card_ten',   // 0 — niedrigste Auszahlung
  'card_jack',  // 1
  'card_queen', // 2
  'card_king',  // 3
  'card_ace',   // 4
  'chalice',    // 5
  'crown',      // 6
  'zeus',       // 7 — höchste Auszahlung
]

// Staggered Stop: Reel 1 stoppt zuerst, dann 2, 3, 4, 5
export const STAGGER_DELAYS_MS = [0, 180, 360, 540, 720]

// Gesamtdauer der Spin-Animation (letztes Reel + eigene Duration + Bounce)
export const TOTAL_SPIN_MS = 720 + 1180 + 200
