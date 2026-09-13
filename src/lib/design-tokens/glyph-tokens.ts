/**
 * Typografie-Tokens für Unicode-Glyphen (Plan 34, §18.4 Befund C Zeile 4).
 *
 * Einmal definiert, überall importierbar statt roher Inline-Unicode-Strings mit
 * verstreuten Inline-Styles. Zwei display-Varianten:
 *  - 'text'  → Glyph bleibt Text (Label-/Live-Wert-Kontexte), Typografie zentral gepflegt
 *  - 'image' → Glyph wird als PNG-Asset gerendert (statische, nicht-wertabhängige Symbole)
 */
export interface TextGlyphToken {
  display: 'text';
  value: string;
  fontWeight: number;
  fontFamily: string;
}

export interface ImageGlyphToken {
  display: 'image';
  value: string;
  alt: string;
}

export type GlyphToken = TextGlyphToken | ImageGlyphToken;

export const GLYPH_TOKENS = {
  half: {
    display: 'text',
    value: '½',
    fontWeight: 700,
    fontFamily: 'inherit',
  },
  double: {
    display: 'text',
    value: '2×',
    fontWeight: 700,
    fontFamily: 'inherit',
  },
  infinity: {
    display: 'text',
    value: '∞',
    fontWeight: 700,
    fontFamily: 'monospace',
  },
  checkmark: {
    display: 'image',
    value: '/images/2026-09-06_icon-glyph-cashout-quantum-gold_v001.png',
    alt: 'Bestätigt',
  },
  multiplier: {
    display: 'text',
    value: '×',
    fontWeight: 900,
    fontFamily: 'monospace',
  },
  diamond: {
    display: 'text',
    value: '♦',
    fontWeight: 400,
    fontFamily: 'inherit',
  },
  spark: {
    display: 'image',
    value: '/images/2026-09-06_icon-glyph-cardcounting-quantum-gold_v001.png',
    alt: 'Player Advantage',
  },
} as const satisfies Record<string, TextGlyphToken | ImageGlyphToken>;

export type GlyphTokenName = keyof typeof GLYPH_TOKENS;