# Positiv-Referenzen — das ist der Standard

> Werte erhoben aus dem Live-Code am 2026-09-06 (Inventur:
> `t_claude_code/skills/15a_referenz_inventur.md`). Flächen-Töne ⚠️ = provisorisch,
> bis Jans laufender Restyle abgeschlossen ist — vor Verwendung gegen die finale
> Seite verifizieren.

## R1 — Play-Button mit Hover-Farbwechsel (der Button-Standard für ALLE Buttons)

Quelle: `src/app/games/_components/ElevatedGameCard.tsx` (motion.button, Zeile ~432)

| Attribut    | Ruhe                                                                                                                  | Hover                                                          |
| :---------- | :-------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| Hintergrund | `linear-gradient(180deg, rgba(212,175,55,0.16), rgba(212,175,55,0.06))`                                               | `linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)` (Vollgold) |
| Textfarbe   | `#F5E6A3`                                                                                                             | `#0B0E14`                                                      |
| Border      | `1px solid rgba(212,175,55,0.35)`                                                                                     | `1px solid rgba(212,175,55,0.85)`                              |
| Schatten    | `inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.4)`                                                    | `0 6px 20px rgba(212,175,55,0.45)`                             |
| Motion      | `whileHover scale 1.02`, `whileTap scale 0.96`, `transition 0.25s ease` (background, color, border-color, box-shadow) | dito                                                           |

Copy-Snippet: siehe `../templates/ui-snippets.md` §B.

## R2 — Game-Card (Elevated Game Card)

Quelle: `src/app/games/_components/ElevatedGameCard.tsx`

- 3D-Tilt: `rotateX/rotateY` bis ±3,5° (nur Desktop), Spring `stiffness 350, damping 25`, Hover `scale 1.02` + `y −4`
- Fläche: Radius 16 px, Gradient `rgba(20,22,28,0.88) → rgba(10,12,16,0.96)` ⚠️, `backdropFilter blur(16px)`
- Border: Gold `rgba(212,175,55,0.22)`, Hover `0.55`; Schatten mit inset-Highlight `rgba(255,255,255,0.1)`
- Bild: 16/10, Radius 14 px, Rahmen `#09090b`, Hover-Zoom `scale 1.05` (`cubic-bezier(0.33,1,0.68,1)`, 0,6 s), Glare radial `rgba(255,255,255,0.2)`
- Hover-Overlay: `blur(8px)`, Gradient nach unten dunkel, RTP-Badge `#10b981` auf `rgba(16,185,129,0.15)`, CTA Vollgold-Gradient
- Badges: Studio-Label `rgba(212,175,55,0.78)`, Uppercase, `letterSpacing 0.1em`; HOT-Ping `#ff5a5a`
- Typo: Titel 950er Inter, Rating/Payout **Monospace** `var(--font-mono)`, Gold `#D4AF37`
- Bilder: `sizes="(max-width: 768px) 50vw, 20vw"`, `loading: index <= 2 ? 'eager' : 'lazy'`
- Mobile-Zweige durchgängig (kompakte paddings, Größen, Beschreibung ausgeblendet)

## R3 — Header-Panel (Seiten-Header-Standard)

Quelle: `src/app/games/page.tsx:61-137` („Monolith Header")

- Radius 16 px, Gold-Border `rgba(212,175,55,0.15)`, `blur(16px)`, Schatten `0 12px 32px rgba(0,0,0,0.45)`
- Fläche: Gradient `rgba(24,24,32,0.75) → rgba(12,12,18,0.9)` ⚠️ (blau-stichig — Jans Ziel: Neutral-Schwarz wie R5, offene Entscheidung siehe unten)
- Eyebrow-Badge: `rgba(212,175,55,0.12)` Fläche, Border `0.25`, Gold-Text, Uppercase, `letterSpacing 0.08em`
- H1: 900er, `letterSpacing −0.02em`, Weiß
- Filter-Pills: Radius 20 px, aktiv Gold-Border + Glow `0 0 16px rgba(212,175,55,0.22)`, inaktiv `rgba(255,255,255,0.03)`

## R4 — Avatare / Badges

Quelle: `src/lib/casino/player-avatar.ts` (+ `src/components/leaderboard/LeaderboardPodium.tsx`, `LeaderboardStreamTable.tsx`, `PersonalRankBar.tsx`)

- Stil-Referenz für Avatare/Badges; bei neuen Avatar- oder Badge-Flächen dieses Muster übernehmen, nicht neu erfinden.

## R5 — Neutral-Schwarz-Surfaces (Jans gewünschter Kasten-Ton)

Quelle: `src/components/leaderboard/LeaderboardPodium.tsx:26-51`, `LeaderboardWeeklyBanner.tsx:96-97`

- Flächen: `#111111`, `#121212`, `#141414` · Border `#222222`/`#262626`
- Text: Primär `#E5E5E5`, Sekundär `#737373`, Gold `#D4AF37`

**Offene Entscheidung (B5):** Soll Neutral-Schwarz nur auf /games, /history, /vault, /stats die blau-stichigen Flächen ersetzen — oder projektweit der Surface-Standard werden? Bis zur Entscheidung gilt: **neue** Kästen/Panel in Neutral-Schwarz (R5) bauen; Bestandsflächen nicht eigenmächtig umstellen.
