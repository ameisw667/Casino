import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  archiveAssetFile,
  findObsoleteVersions,
  listAssetVersions,
  parseAssetFileName,
  rollbackAssetIndexEntry,
} from '../lifecycle';
import type { AssetIndex } from '../asset-index';
import { computeSha256 } from '../storage';

describe('lifecycle', () => {
  const sampleFiles = [
    '2026-08-30_hero-bg-crash_v001.png',
    '2026-08-31_hero-bg-crash_v002.png',
    '2026-09-01_hero-bg-crash_v003.png',
    '2026-09-02_hero-bg-crash_v004.png',
    '2026-09-01_other-icon_v001.png',
  ];

  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lifecycle-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('parses valid asset file names', () => {
    const parsed = parseAssetFileName('2026-09-02_hero-bg-crash_v003.png');
    expect(parsed).toEqual({
      date: '2026-09-02',
      name: 'hero-bg-crash',
      version: 3,
      extension: 'png',
    });

    expect(parseAssetFileName('invalid-name.png')).toBeNull();
  });

  it('lists versions for an asset sorted by version descending and marks active', () => {
    const activeIndex: AssetIndex = {
      'hero-bg-crash': {
        name: 'hero-bg-crash',
        path: '/generated/design-assets/2026-09-02_hero-bg-crash_v004.png',
        version: 'v004',
        updatedAt: '2026-09-02T10:00:00.000Z',
      },
    };

    const versions = listAssetVersions('hero-bg-crash', sampleFiles, activeIndex);
    expect(versions).toHaveLength(4);
    expect(versions[0].version).toBe(4);
    expect(versions[0].isActive).toBe(true);
    expect(versions[1].version).toBe(3);
    expect(versions[1].isActive).toBe(false);
  });

  it('finds obsolete versions keeping top N and protects active version', () => {
    const activeIndex: AssetIndex = {
      'hero-bg-crash': {
        name: 'hero-bg-crash',
        path: '/generated/design-assets/2026-08-30_hero-bg-crash_v001.png', // v001 ist aktiv!
        version: 'v001',
        updatedAt: '2026-09-02T10:00:00.000Z',
      },
    };

    const obsolete = findObsoleteVersions('hero-bg-crash', sampleFiles, 2, activeIndex);
    // v001 wird geschützt, daher verbleibt nur v002
    expect(obsolete).toEqual(['2026-08-31_hero-bg-crash_v002.png']);
  });

  it('rolls back asset index entry to prior version with re-hashing', () => {
    const targetFile = '2026-08-31_hero-bg-crash_v002.png';
    const fakeContent = Buffer.from('image v002 binary data');
    fs.writeFileSync(path.join(testDir, targetFile), fakeContent);

    const initialIndex: AssetIndex = {
      'hero-bg-crash': {
        name: 'hero-bg-crash',
        path: '/generated/design-assets/2026-09-02_hero-bg-crash_v004.png',
        version: 'v004',
        updatedAt: '2026-09-02T10:00:00.000Z',
      },
    };

    const rolledBack = rollbackAssetIndexEntry(
      initialIndex,
      'hero-bg-crash',
      2,
      sampleFiles,
      testDir,
      new Date('2026-09-02T12:00:00.000Z'),
    );

    expect(rolledBack['hero-bg-crash'].version).toBe('v002');
    expect(rolledBack['hero-bg-crash'].path).toBe(
      '/generated/design-assets/2026-08-31_hero-bg-crash_v002.png',
    );
    expect(rolledBack['hero-bg-crash'].sha256).toBe(computeSha256(fakeContent));
    expect(rolledBack['hero-bg-crash'].bytes).toBe(fakeContent.length);
  });

  it('throws on rollback if target version does not exist', () => {
    const initialIndex: AssetIndex = {};
    expect(() => rollbackAssetIndexEntry(initialIndex, 'hero-bg-crash', 99, sampleFiles)).toThrow(
      'existiert nicht',
    );
  });

  it('archives asset files safely without data destruction', () => {
    const src = path.join(testDir, 'source.png');
    const archiveDir = path.join(testDir, '.archive');
    fs.writeFileSync(src, 'dummy-data');

    const result = archiveAssetFile(src, archiveDir);

    expect(fs.existsSync(src)).toBe(false);
    expect(fs.existsSync(result.archivedPath)).toBe(true);
    expect(result.fileName).toBe('source.png');
  });
});
