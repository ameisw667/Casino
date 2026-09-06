# UI-Snippets — Copy-fertige Standard-Bausteine

> Quellen: `src/app/games/_components/ElevatedGameCard.tsx`, `src/app/games/page.tsx`,
> `src/components/leaderboard/`. Werte ⚠️ = provisorisch bis R1-Freeze.

## A — Obsidian-Panel-Header (Ersetzung für „dunkelblauen Kasten")

```tsx
<header
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    padding: isMobile ? '12px 14px' : '18px 24px',
    borderRadius: '16px',
    border: '1px solid #222222', // Neutral-Schwarz-Familie (R5)
    background: '#111111',       // ⚠️ ersetzt blau-stichigen Gradient — Zielton Jan
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
  }}
>
```

## B — Standard-Button mit Hover-Farbwechsel (R1-Muster)

```tsx
<motion.button
  type="button"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.96 }}
  style={{
    width: '100%',
    height: isMobile ? '30px' : '40px',
    borderRadius: '8px',
    fontWeight: 950,
    fontSize: isMobile ? '0.68rem' : '0.8rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    background: isHovered
      ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
      : 'linear-gradient(180deg, rgba(212, 175, 55, 0.16) 0%, rgba(212, 175, 55, 0.06) 100%)',
    color: isHovered ? '#0B0E14' : '#F5E6A3',
    border: `1px solid ${isHovered ? 'rgba(212, 175, 55, 0.85)' : 'rgba(212, 175, 55, 0.35)'}`,
    boxShadow: isHovered
      ? '0 6px 20px rgba(212, 175, 55, 0.45)'
      : 'inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.4)',
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition:
      'background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
  }}
>
  {/* Label; dynamische Zahlen immer in var(--font-mono) */}
</motion.button>
```

## C — Monospace-Wert (dynamische Zahl)

```tsx
<span style={{ fontFamily: 'var(--font-mono), monospace', fontWeight: 950, color: '#D4AF37' }}>
  {dynamicValue}
</span>
```

## D — Eyebrow-Badge

```tsx
<span
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(212, 175, 55, 0.12)',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    color: '#D4AF37',
    fontSize: '0.58rem',
    fontWeight: 800,
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }}
>
  {label}
</span>
```
