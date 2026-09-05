import type { ImageQuality, ImageSize, PromptEntry } from './types';

export interface PricingTier {
  size: ImageSize;
  quality: ImageQuality;
  priceUsd: number;
}

/**
 * Konservative Modell-Preistabelle für Bildgenerierungen (`gpt-image-2` / DALL-E 3 Äquivalente).
 */
export const DEFAULT_PRICING_TABLE: Record<ImageSize, Record<ImageQuality, number>> = {
  '1024x1024': {
    low: 0.04,
    medium: 0.08,
    high: 0.12,
  },
  '1536x1024': {
    low: 0.08,
    medium: 0.12,
    high: 0.16,
  },
  '1024x1536': {
    low: 0.08,
    medium: 0.12,
    high: 0.16,
  },
  '1792x1024': {
    low: 0.08,
    medium: 0.12,
    high: 0.16,
  },
  '1024x1792': {
    low: 0.08,
    medium: 0.12,
    high: 0.16,
  },
};

/**
 * Ermittelt den geschätzten Preis für ein konkretes Bild basierend auf Größe und Qualität.
 */
export function getEstimatedCostForRequest(
  size: ImageSize = '1024x1024',
  quality: ImageQuality = 'medium',
  fallbackBasePrice?: number,
): number {
  if (fallbackBasePrice !== undefined && fallbackBasePrice !== 0.25) {
    return fallbackBasePrice;
  }
  const sizeMap = DEFAULT_PRICING_TABLE[size] ?? DEFAULT_PRICING_TABLE['1024x1024'];
  const price = sizeMap[quality] ?? sizeMap.medium;
  return round2(price);
}

export interface CostGuardState {
  maxSpendUsd: number;
  spentUsd: number;
  callCount: number;
}

export function createCostGuard(maxSpendUsd: number, initialSpentUsd: number = 0): CostGuardState {
  return { maxSpendUsd, spentUsd: initialSpentUsd, callCount: 0 };
}

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  projectedSpendUsd: number;
}

/**
 * Prüft VOR jedem API-Call, ob das Budget für diesen spezifischen Call reicht.
 */
export function checkBudget(
  state: Readonly<CostGuardState>,
  costForThisImageUsd: number,
): BudgetCheckResult {
  const projectedSpendUsd = round2(state.spentUsd + costForThisImageUsd);
  if (projectedSpendUsd > state.maxSpendUsd) {
    return {
      allowed: false,
      reason: `Budget-Limit erreicht: geplanter Call (+${costForThisImageUsd} USD) würde auf ${projectedSpendUsd} USD steigen (Limit ${state.maxSpendUsd} USD).`,
      projectedSpendUsd,
    };
  }
  return { allowed: true, projectedSpendUsd };
}

/** Gibt einen neuen State zurück (immutable). */
export function recordSpend(
  state: Readonly<CostGuardState>,
  actualCostUsd: number,
): CostGuardState {
  return {
    ...state,
    spentUsd: round2(state.spentUsd + actualCostUsd),
    callCount: state.callCount + 1,
  };
}

/**
 * Berechnet die Gesamtkosten für eine Liste von Manifest-Einträgen dynamisch.
 */
export function estimateBatchCostUsd(
  entries: PromptEntry[] | number,
  fallbackCostPerImageUsd: number = 0.25,
): number {
  if (typeof entries === 'number') {
    return round2(entries * fallbackCostPerImageUsd);
  }
  const total = entries.reduce((sum, entry) => {
    const cost = getEstimatedCostForRequest(
      entry.size ?? '1024x1024',
      entry.quality ?? 'medium',
      fallbackCostPerImageUsd,
    );
    return sum + cost;
  }, 0);
  return round2(total);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
