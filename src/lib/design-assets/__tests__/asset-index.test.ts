import { describe, expect, it } from 'vitest';
import { parseAssetIndex, upsertAssetIndexEntry } from '../asset-index';

describe('asset-index', () => {
  it('adds a new entry without mutating the original index', () => {
    const original = {};

    const updated = upsertAssetIndexEntry(original, {
      name: 'hero-bg-crash',
      path: '/generated/design-assets/2026-08-31_hero-bg-crash_v001.png',
      version: 'v001',
      updatedAt: '2026-08-31T12:00:00.000Z',
    });

    expect(original).toEqual({});
    expect(updated['hero-bg-crash'].version).toBe('v001');
  });

  it('overwrites an existing entry for the same name with the newer version', () => {
    const original = upsertAssetIndexEntry(
      {},
      {
        name: 'hero-bg-crash',
        path: '/old.png',
        version: 'v001',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    );

    const updated = upsertAssetIndexEntry(original, {
      name: 'hero-bg-crash',
      path: '/new.png',
      version: 'v002',
      updatedAt: '2026-08-31T00:00:00.000Z',
    });

    expect(updated['hero-bg-crash'].path).toBe('/new.png');
    expect(Object.keys(updated)).toHaveLength(1);
  });

  it('returns an empty index for non-object input', () => {
    expect(parseAssetIndex(null)).toEqual({});
    expect(parseAssetIndex('not-an-object')).toEqual({});
  });
});
