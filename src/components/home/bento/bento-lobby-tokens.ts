/**
 * Obsidian & Gold tokens as CSS-custom-property references (SOP 04 §1),
 * resolved by the vars the Bento lobby client defines on its root element.
 * New lobby sections must reference these instead of hardcoding hex values.
 */

export const bentoColors = {
  canvas: 'var(--lobby-canvas, #0B0E14)',
  gold: 'var(--gold-primary, #D4AF37)',
  goldLight: 'var(--gold-secondary, #F59E0B)',
  emerald: 'var(--emerald-win, #10B981)',
  ruby: 'var(--ruby-loss, #EF4444)',
} as const;

export const bentoTypography = {
  /** All dynamic numbers render monospace + tabular-nums (SOP 04 §3) */
  dynamicNumber: {
    fontFamily: 'var(--font-mono, monospace)',
    fontVariantNumeric: 'tabular-nums' as const,
  },
} as const;

/** CSS custom properties declared once on the lobby root element */
export const bentoRootVars = {
  '--lobby-canvas': '#0B0E14',
  '--gold-primary': '#D4AF37',
  '--gold-secondary': '#F59E0B',
  '--emerald-win': '#10B981',
  '--ruby-loss': '#EF4444',
} as const;
