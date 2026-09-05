import { describe, expect, it } from 'vitest';
import {
  analyzeManifestDiff,
  findMissingTemplateVariables,
  interpolatePrompt,
  parsePromptManifest,
} from '../prompts-manifest';

describe('prompts-manifest', () => {
  it('parses a valid manifest into typed prompt entries with category and tags', () => {
    const raw = [
      {
        name: 'hero-bg-crash',
        category: 'hero',
        tags: ['crash', 'gold'],
        prompt: 'a golden rocket trail',
        size: '1024x1024',
        quality: 'high',
      },
    ];

    const result = parsePromptManifest(raw);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].name).toBe('hero-bg-crash');
    expect(result.entries[0].category).toBe('hero');
    expect(result.entries[0].tags).toEqual(['crash', 'gold']);
    expect(result.duplicateNames).toHaveLength(0);
  });

  it('rejects a name that is not kebab-case', () => {
    const raw = [{ name: 'Hero_Bg_Crash', prompt: 'a golden rocket trail' }];

    expect(() => parsePromptManifest(raw)).toThrow();
  });

  it('rejects an empty manifest', () => {
    expect(() => parsePromptManifest([])).toThrow();
  });

  it('throws when the manifest contains duplicate names', () => {
    const raw = [
      { name: 'hero-bg-crash', prompt: 'variant one' },
      { name: 'hero-bg-crash', prompt: 'variant two' },
    ];

    expect(() => parsePromptManifest(raw)).toThrow('Doppelte Asset-Namen');
  });

  it('interpolates template variables in prompts correctly', () => {
    const template = 'a glowing {{glowColor}} dice on {{surface}}';
    const variables = { glowColor: 'emerald', surface: 'black velvet' };

    const result = interpolatePrompt(template, variables);

    expect(result).toBe('a glowing emerald dice on black velvet');
  });

  it('identifies unreplaced template variables', () => {
    const template = 'a glowing {{glowColor}} dice on {{surface}} with {{accent}}';
    const variables = { glowColor: 'gold' };

    const missing = findMissingTemplateVariables(template, variables);

    expect(missing).toEqual(['surface', 'accent']);
  });

  it('calculates manifest diff showing new assets vs version bumps', () => {
    const entries = [
      { name: 'hero-crash', prompt: 'test prompt', size: '1792x1024' as const },
      { name: 'icon-dice', prompt: 'test dice', size: '1024x1024' as const },
    ];
    const existingFiles = ['2026-08-31_hero-crash_v001.png', '2026-08-31_hero-crash_v002.png'];

    const diff = analyzeManifestDiff(entries, existingFiles);

    expect(diff.totalCount).toBe(2);
    expect(diff.newCount).toBe(1); // icon-dice is new
    expect(diff.updateCount).toBe(1); // hero-crash gets bumped
    expect(diff.items[0].targetVersion).toBe('v003');
    expect(diff.items[1].targetVersion).toBe('v001');
  });
});
