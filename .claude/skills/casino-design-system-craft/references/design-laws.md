# Design-Laws — Token-Zusammenfassung

> **Kurzfassung mit Verweis:** Kanonische Quelle ist `xx_sop/04_design_system_ui.md`
> (Tiefe, Begründungen). Bei Abweichung gewinnt die SOP 04 — außer Jan hat im Chat
> etwas Neues festgelegt (Rangfolge im SKILL.md §3).

## Farben

| Token                                      | Wert                                                                                                     | Verwendung                                                                        |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| Hintergrund (Seite)                        | `#0B0E14`                                                                                                | App-Hintergrund (CLAUDE.md „Obsidian")                                            |
| Surface neutral (Jans Standard für Kästen) | `#111111` / `#121212` / `#141414`, Border `#222222`/`#262626`                                            | Leaderboard-Familie — Zielton für Panel/Kästen (offen: 4 Seiten oder projektweit) |
| Gold (Akzent/Flächen)                      | `#D4AF37`                                                                                                | Border, Badges, aktive Zustände, Rang 1                                           |
| Gold hell (Vollgold-Flächen)               | `#FFD700 → #D4AF37` Gradient                                                                             | Vollgold-Buttons/CTAs                                                             |
| Gold-Text auf Gold                         | `#F5E6A3` (Ruhe) / `#FFE8A3` (heller Text auf Gold-Flächen, Muster /auth)                                | Button-Text                                                                       |
| Win (Smaragd)                              | `#10b981` (+ `rgba(16,185,129,…)` Flächen)                                                               | Gewinn, RTP, positive deltas                                                      |
| Loss (Rubin)                               | `#ff3366` (Familie: `#ff5a5a` HOT-Ping, `#ef4444`-Rot in Tabellen)                                       | Verlust, destruktiv, HOT                                                          |
| Text                                       | Weiß `#ffffff`, Primär `#E5E5E5`, Sekundär `rgba(255,255,255,0.65–0.72)`, Leaderboard-Sekundär `#737373` | Hierarchie                                                                        |

## Typografie

- Titel 900–950er, `letterSpacing −0.02em` (H1) / Labels Uppercase `0.04–0.1em`, 800–950er
- **Alle dynamischen Zahlen in Monospace** `var(--font-mono)` (Payouts, Multiplikatoren, Ratings)
- Titel-Font Inter (`var(--font-inter)`)

## Fläche & Tiefe

- Glassmorphism: `backdropFilter blur(12–16px)` (Cards/Header 16, Overlay 8)
- Radien: Panels 16 px · Bilder 14 px · Buttons/Pills 8–20 px · Badges 12 px (pill)
- Schatten: tief `0 14–18px 34–42px rgba(0,0,0,0.65–0.75)` + inset-Highlight `rgba(255,255,255,0.1)`; Gold-Glow bei aktiv `0 0 16–20px rgba(212,175,55,0.22–0.45)`

## Motion (Framer Motion)

- Spring-Physik: `bounce 0.4`-Familie; Card: `stiffness 350, damping 25`
- `whileHover scale 1.02`, `whileTap scale 0.96`
- Übergänge 0,2–0,6 s `ease`/`cubic-bezier(0.33,1,0.68,1)`
- Nur `transform`/`opacity`/`clip-path`; `prefers-reduced-motion` respektieren

## Z-Hierarchie (0–999, siehe SOP 04)

Navigation `z-20` · Modals `z-50` · Overlays darüber — Details in SOP 04.

## Performance-Ziele

LCP < 2,5 s · INP < 200 ms · CLS < 0,1 · Bilder AVIF/WebP mit expliziten Maßen · `lazy` unter dem Fold, `eager` nur Hero (Muster: `index <= 2 ? 'eager' : 'lazy'` in `ElevatedGameCard`).
