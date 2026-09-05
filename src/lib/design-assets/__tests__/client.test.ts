import { describe, expect, it } from 'vitest';
import { resolveDesignAsset } from '../client';
import type { AssetIndex } from '../asset-index';

describe('client resolveDesignAsset', () => {
  const mockIndex: AssetIndex = {
    'hero-bg-crash': {
      name: 'hero-bg-crash',
      path: '/generated/design-assets/2026-09-02_hero-bg-crash_v001.png',
      version: 'v001',
      updatedAt: '2026-09-02T12:00:00.000Z',
      sha256: 'abc123sha256',
      bytes: 204800,
      category: 'hero',
    },
  };

  it('resolves an asset that exists in the index', () => {
    const asset = resolveDesignAsset({
      name: 'hero-bg-crash',
      index: mockIndex,
    });

    expect(asset.exists).toBe(true);
    expect(asset.url).toBe('/generated/design-assets/2026-09-02_hero-bg-crash_v001.png');
    expect(asset.version).toBe('v001');
    expect(asset.sha256).toBe('abc123sha256');
    expect(asset.category).toBe('hero');
    expect(asset.width).toBe(1792);
    expect(asset.height).toBe(1024);
    expect(asset.aspectRatio).toBe('16/9');
  });

  it('provides safe fallback when asset is missing in index', () => {
    const asset = resolveDesignAsset({
      name: 'missing-badge',
      index: mockIndex,
      category: 'badge',
      fallbackUrl: '/images/default-badge.png',
    });

    expect(asset.exists).toBe(false);
    expect(asset.url).toBe('/images/default-badge.png');
    expect(asset.category).toBe('badge');
    expect(asset.width).toBe(1024);
    expect(asset.height).toBe(1024);
    expect(asset.aspectRatio).toBe('1/1');
  });

  it('respects explicit size overrides', () => {
    const asset = resolveDesignAsset({
      name: 'banner',
      size: '1536x1024',
    });

    expect(asset.width).toBe(1536);
    expect(asset.height).toBe(1024);
    expect(asset.aspectRatio).toBe('3/2');
  });

  it('respects explicit width and height overrides', () => {
    const asset = resolveDesignAsset({
      name: 'banner',
      explicitWidth: 400,
      explicitHeight: 200,
    });

    expect(asset.width).toBe(400);
    expect(asset.height).toBe(200);
  });

  it('provides getDesignAsset helper wrapper', () => {
    const asset = resolveDesignAsset({
      name: 'hero-bg-crash',
      index: mockIndex,
    });

    expect(asset.name).toBe('hero-bg-crash');
    expect(asset.exists).toBe(true);
  });
});
