import type { AssetCategory, ImageSize } from './types';

export interface AssetIndexEntry {
  name: string;
  path: string;
  version: string;
  updatedAt: string;
  size?: ImageSize;
  width?: number;
  height?: number;
  aspectRatio?: string;
  alt?: string;
  sha256?: string;
  bytes?: number;
  category?: AssetCategory;
}

export type AssetIndex = Record<string, AssetIndexEntry>;

/**
 * Fügt einen Eintrag hinzu/überschreibt ihn (immutable) — der Index zeigt pro `name` immer
 * nur auf die zuletzt generierte Version. Ältere Versionen bleiben als Datei erhalten
 * (siehe naming.ts), sind aber nicht mehr über den Index referenziert.
 * Frontend-Code importiert NIE einen Bildpfad direkt, sondern liest ihn aus diesem Index —
 * ein Re-Generate ändert dann nur eine Datei statt N Call-Sites.
 */
export function upsertAssetIndexEntry(
  index: Readonly<AssetIndex>,
  entry: AssetIndexEntry,
): AssetIndex {
  return { ...index, [entry.name]: entry };
}

export function parseAssetIndex(raw: unknown): AssetIndex {
  if (typeof raw !== 'object' || raw === null) return {};
  return raw as AssetIndex;
}
