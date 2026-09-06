'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { resolveDesignAsset } from '@/lib/design-assets/client';
import type { AssetCategory, ImageSize } from '@/lib/design-assets/types';
import type { AssetIndex } from '@/lib/design-assets/asset-index';

export interface DesignAssetImageProps {
  name: string;
  alt: string;
  category?: AssetCategory;
  size?: ImageSize;
  mode?: 'responsive' | 'fill' | 'fixed';
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  fallbackSrc?: string;
  index?: AssetIndex;
  onLoadingComplete?: () => void;
}

/**
 * Obsidian & Gold Design-Asset Komponente:
 * Rendert generierte Assets über Next.js Image mit optimiertem Fallback-Shimmer
 * und Null-404-Garantie für noch nicht generierte Assets.
 */
export function DesignAssetImage({
  name,
  alt,
  category,
  size,
  mode = 'responsive',
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  fallbackSrc,
  index,
  onLoadingComplete,
}: DesignAssetImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const asset = resolveDesignAsset({
    name,
    index,
    fallbackUrl: fallbackSrc,
    category,
    size,
    explicitWidth: width,
    explicitHeight: height,
  });

  const shouldRenderImage = (asset.exists || Boolean(fallbackSrc)) && !hasError;
  const showPlaceholder = !isLoaded || !shouldRenderImage;

  const isFillMode = fill || mode === 'fill' || mode === 'responsive';

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-[#D4AF37]/20 bg-[#0B0E14] ${className}`}
      style={
        mode === 'responsive'
          ? { width: '100%', aspectRatio: asset.aspectRatio }
          : mode === 'fixed' && !fill
            ? { width: asset.width, height: asset.height }
            : undefined
      }
    >
      {/* Obsidian & Gold Shimmer Skeleton */}
      {showPlaceholder && (
        <div
          data-testid="design-asset-shimmer"
          className="absolute inset-0 flex animate-pulse items-center justify-center bg-gradient-to-tr from-[#0B0E14] via-[#151A23] to-[#0B0E14]"
        >
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 font-mono text-xs text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              ✦
            </div>
            <span className="font-mono text-[11px] tracking-wider text-zinc-400 uppercase">
              {hasError ? 'Asset nicht verfügbar' : `${name}`}
            </span>
          </div>
        </div>
      )}

      {/* Reales Bild via Next.js Image — Nur mounten wenn Bild physisch existiert */}
      {shouldRenderImage && (
        <Image
          src={asset.url}
          alt={alt}
          width={!isFillMode ? asset.width : undefined}
          height={!isFillMode ? asset.height : undefined}
          fill={isFillMode}
          sizes={
            isFillMode ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined
          }
          priority={priority}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} object-cover`}
          onLoad={() => {
            setIsLoaded(true);
            onLoadingComplete?.();
          }}
          onError={() => {
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}
