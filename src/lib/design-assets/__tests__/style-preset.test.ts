import { describe, expect, it } from 'vitest';
import {
  CATEGORY_STYLE_PRESETS,
  OBSIDIAN_GOLD_STYLE_SUFFIX,
  buildExclusionString,
  composePrompt,
} from '../style-preset';

describe('style-preset', () => {
  it('appends the Obsidian & Gold style suffix to a base prompt', () => {
    const result = composePrompt('a golden dice');

    expect(result).toContain(OBSIDIAN_GOLD_STYLE_SUFFIX);
    expect(result.startsWith('a golden dice,')).toBe(true);
  });

  it('composes category-specific prompts with tailored styling and exclusions', () => {
    const result = composePrompt({
      basePrompt: 'a golden dice',
      category: 'icon',
      exclusions: ['playing cards'],
    });

    expect(result).toContain(CATEGORY_STYLE_PRESETS.icon);
    expect(result).toContain('no text');
    expect(result).toContain('no busy background');
    expect(result).toContain('no playing cards');
  });

  it('buildExclusionString merges global, category, and custom exclusions', () => {
    const exclusionStr = buildExclusionString('hero', ['low poly']);

    expect(exclusionStr).toContain('no text');
    expect(exclusionStr).toContain('no cropped edges');
    expect(exclusionStr).toContain('no low poly');
  });

  it('trims surrounding whitespace from the base prompt before composing', () => {
    const result = composePrompt('  a golden dice  ');

    expect(result.startsWith('a golden dice,')).toBe(true);
  });

  it('throws when the base prompt is empty', () => {
    expect(() => composePrompt('   ')).toThrow('Prompt darf nicht leer sein.');
  });

  it('allows overriding the style suffix', () => {
    const result = composePrompt('a golden dice', 'neon cyberpunk style');

    expect(result).toBe('a golden dice, neon cyberpunk style');
  });
});
