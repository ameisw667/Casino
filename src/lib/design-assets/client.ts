import type { AssetCategory, ImageSize } from './types';
import type { AssetIndex, AssetIndexEntry } from './asset-index';

export interface ResolvedAsset {
  name: string;
  url: string;
  version?: string;
  sha256?: string;
  category?: AssetCategory;
  exists: boolean;
  width: number;
  height: number;
  aspectRatio: string;
}

export const CATEGORY_DEFAULT_DIMENSIONS: Record<
  AssetCategory,
  { width: number; height: number; aspectRatio: string }
> = {
  hero: { width: 1792, height: 1024, aspectRatio: '16/9' },
  icon: { width: 1024, height: 1024, aspectRatio: '1/1' },
  badge: { width: 1024, height: 1024, aspectRatio: '1/1' },
  background: { width: 1792, height: 1024, aspectRatio: '16/9' },
  avatar: { width: 1024, height: 1024, aspectRatio: '1/1' },
  ui: { width: 1536, height: 1024, aspectRatio: '3/2' },
};

export const SIZE_DIMENSIONS: Record<
  ImageSize,
  { width: number; height: number; aspectRatio: string }
> = {
  '1024x1024': { width: 1024, height: 1024, aspectRatio: '1/1' },
  '1536x1024': { width: 1536, height: 1024, aspectRatio: '3/2' },
  '1024x1536': { width: 1024, height: 1536, aspectRatio: '2/3' },
  '1792x1024': { width: 1792, height: 1024, aspectRatio: '16/9' },
  '1024x1792': { width: 1024, height: 1792, aspectRatio: '9/16' },
};

/**
 * Löst ein Design-Asset aus einem bestehenden Index oder mit Fallback-Pfad auf.
 */
export function resolveDesignAsset(options: {
  name: string;
  index?: AssetIndex;
  fallbackUrl?: string;
  category?: AssetCategory;
  size?: ImageSize;
  explicitWidth?: number;
  explicitHeight?: number;
}): ResolvedAsset {
  const entry: AssetIndexEntry | undefined = options.index?.[options.name];
  const exists = Boolean(entry?.path);

  const category = options.category ?? entry?.category ?? 'hero';
  const defaultDims = options.size
    ? SIZE_DIMENSIONS[options.size]
    : CATEGORY_DEFAULT_DIMENSIONS[category];

  const width = options.explicitWidth ?? defaultDims.width;
  const height = options.explicitHeight ?? defaultDims.height;
  const aspectRatio = defaultDims.aspectRatio;

  const url = entry?.path ?? options.fallbackUrl ?? `/generated/design-assets/${options.name}.png`;

  return {
    name: options.name,
    url,
    version: entry?.version,
    sha256: entry?.sha256,
    category,
    exists,
    width,
    height,
    aspectRatio,
  };
}

/**
 * Typsicherer Helper zur Ermittlung von Asset-Metadaten für Frontend-Komponenten.
 */
export function getDesignAsset(
  name: string,
  overrides?: {
    index?: AssetIndex;
    fallbackUrl?: string;
    category?: AssetCategory;
    size?: ImageSize;
    explicitWidth?: number;
    explicitHeight?: number;
  },
): ResolvedAsset {
  return resolveDesignAsset({
    name,
    index: overrides?.index,
    fallbackUrl: overrides?.fallbackUrl,
    category: overrides?.category,
    size: overrides?.size,
    explicitWidth: overrides?.explicitWidth,
    explicitHeight: overrides?.explicitHeight,
  });
}
