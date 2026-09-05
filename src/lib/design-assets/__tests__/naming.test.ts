import { describe, expect, it } from 'vitest';
import { buildAssetFileName, formatDate, nextVersionFor } from '../naming';

describe('naming', () => {
  it('builds a chronologically sortable, versioned file name', () => {
    const date = new Date('2026-08-31T12:00:00Z');

    const fileName = buildAssetFileName('hero-bg-crash', date, 1);

    expect(fileName).toBe('2026-08-31_hero-bg-crash_v001.png');
  });

  it('formats a date as yyyy-mm-dd', () => {
    expect(formatDate(new Date('2026-01-05T00:00:00Z'))).toBe('2026-01-05');
  });

  it('returns version 1 when no matching files exist yet', () => {
    const version = nextVersionFor('hero-bg-crash', ['2026-08-31_other-asset_v001.png']);

    expect(version).toBe(1);
  });

  it('returns the next free version when prior versions exist for the same name', () => {
    const version = nextVersionFor('hero-bg-crash', [
      '2026-08-31_hero-bg-crash_v001.png',
      '2026-08-31_hero-bg-crash_v002.png',
    ]);

    expect(version).toBe(3);
  });

  it('does not confuse names that share a common prefix', () => {
    const version = nextVersionFor('hero-bg', ['2026-08-31_hero-bg-crash_v005.png']);

    expect(version).toBe(1);
  });
});
