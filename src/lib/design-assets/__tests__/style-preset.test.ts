import { describe, expect, it } from 'vitest';
import {
  CATEGORY_STYLE_PRESETS,
  OBSIDIAN_GOLD_STYLE_SUFFIX,
  buildExclusionString,
  composePrompt,
  compileStructuredPrompt,
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

  it('automatically enforces anti-typography and anti-rewrite directives in composePrompt', () => {
    const result = composePrompt({
      basePrompt: 'a golden chip',
      category: 'icon',
    });

    expect(result).toContain('Strictly plain background, absolute zero text');
    expect(result).toContain('Render strictly as specified without narrative background');
  });

  it('compiles a structured 5-component prompt with custom and default components', () => {
    const compiled = compileStructuredPrompt({
      subject: 'aerodynamic supersonic golden jet',
      category: 'hero',
      materials: 'carbon obsidian and brushed 24k gold (#D4AF37)',
    });

    expect(compiled).toContain('aerodynamic supersonic golden jet');
    expect(compiled).toContain('Cinematic widescreen composition');
    expect(compiled).toContain('Key light 45 degrees top-left');
    expect(compiled).toContain('carbon obsidian and brushed 24k gold (#D4AF37)');
    expect(compiled).toContain('Octane raytraced render');
    expect(compiled).toContain('Strictly plain background, absolute zero text');
    expect(compiled).toContain('Render strictly as specified');
  });

  it('throws in compileStructuredPrompt if subject is empty', () => {
    expect(() => compileStructuredPrompt({ subject: '   ' })).toThrow(
      'Subject darf nicht leer sein.',
    );
  });

  it('enforces obsidian & gold token harmony across all 6 asset categories', () => {
    const categories: Array<'hero' | 'icon' | 'badge' | 'background' | 'avatar' | 'ui'> = [
      'hero',
      'icon',
      'badge',
      'background',
      'avatar',
      'ui',
    ];

    for (const cat of categories) {
      const prompt = composePrompt({
        basePrompt: `test subject for ${cat}`,
        category: cat,
      });

      expect(prompt).toContain('#D4AF37');
      expect(prompt).toContain('#0B0E14');
      expect(prompt).toContain('no shiny plastic');
      expect(prompt).toContain('no neon yellow');
      expect(prompt).toContain('Strictly plain background, absolute zero text');
    }
  });
});
