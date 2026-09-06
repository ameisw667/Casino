// Fixture — nur für die Pilot-Evaluierung (Evaluation mode: 11_residue_scout).
// Simuliert eine aufrufende Stelle, die nach dem Entfernen des Components-Ordners
// src/components/casino/games/legacy-wheel/ übrig bleibt.
import { useLegacyOdds } from '@/hooks/useLegacyOdds';

export async function openLegacyWheelPanel() {
  // Der Component-Ordner legacy-wheel/ wurde entfernt; statischer Import weiter oben
  // bricht, dieser dynamische String-Verweis wurde übersehen:
  const mod = await import('@/components/casino/games/legacy-wheel/LegacyWheelPanel');
  return mod.default;
}

export function buildOddsTable(raw: unknown) {
  return normalizeOdds(useLegacyOdds(raw));
}
