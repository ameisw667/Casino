# 05 — Lobby-Hintergrund: Backdrop, Parallax & Reaktions-Effekte (Skill-Doku)

> **Status:** 🟢 Live auf `/` (2026-09-05) · **Owner:** LLM · **Verwandt:** Plan 26 (Parallax) & Plan 28 (Reaktions-Effekte) in `worldmap/`, Varianten-Vergleich unter [`/testing/lobby-bg-parallax`](http://localhost:3015/testing/lobby-bg-parallax)

## Was diese Doku abdeckt

Der Startseiten-Hintergrund besteht aus drei übereinanderliegenden Systemen, die alle in
`src/components/home/LobbyAmbientBackground.tsx` zusammenlaufen (fixed, zIndex 0, pointerEvents none):

| Ebene                    | Komponente/Datei                      | Was es macht                                          |
| ------------------------ | ------------------------------------- | ----------------------------------------------------- |
| 1. Backdrop              | `ParallaxImageBackground.tsx`         | 2.5D-Bildtiefe aus einem Still (Nebula-Backdrop)      |
| 2. Reaktions-Effekte     | `useLobbyReactionFx.ts` + Canvas-Loop | Goldwelle bei Spielkarten-Hover, Komet bei Big-Win    |
| 3. Klassik (unverändert) | `LobbyAmbientBackground.tsx`          | Spotlight, Goldstaub, Funken-Schweif, Vignette, Noise |

---

## Skill 1 — 2.5D-Parallax aus einem einzigen Standbild

**Kernidee:** Kein zweites Asset, keine 3D-Geometrie — Tiefenwirkung entsteht, indem
dasselbe Bild in zwei Ebenen gezeichnet wird:

- **Tiefe 0:** volles Bild, langsame Mausdrift (`DEEP_DRIFT_PX = 18`)
- **Tiefe 1:** gleiches Bild, `mixBlendMode: 'screen'` (leuchtet nur in hellen Bildbereichen), stärkere Drift (`MID_DRIFT_PX = 42`)

Beide Ebenen folgen der Maus über **Framer-Motion MotionValues + Springs** (kein Re-Render pro
Pointer-Tick — Muster wie `useTiltGlare`). Die langsame Feder (`stiffness: 40, damping: 20`)
macht daraus eine trägemassige Szene statt eines UI-Elements. Scroll-Parallax liegt auf dem
Wrapper in `LobbyAmbientBackground` (Faktor 0,11).

**Variantenschalter:** `LobbyAmbientBackground` nimmt `backgroundVariant?: 'webgl' | 'parallax'`.
Live-Standard seit 2026-09-05: `parallax` (gesetzt in `BentoLobbyHome.tsx`). Rückweg zum
alten WebGL-Wasser: Wert auf `'webgl'` ändern — ein Einzeiler.

## Skill 2 — Reaktions-Effekte: Hintergrund antwortet auf die UI

**Prinzip:** UI-Komponenten senden window-Events, der Hintergrund hört zu und zeichnet
im **vorhandenen** rAF-Canvas-Loop (kein zweiter Loop, kein React-Re-Render):

| Event                                         | Absender                                                                         | Wirkung                                                            |
| --------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `casino:lobby-hover-wave` `{x, y}`            | `BentoArcadeCells.tsx` (onPointerEnter, Kartenmitte via `getBoundingClientRect`) | Weiche, transparente Glow-Welle (1 s) in der Akzentfarbe der Karte |
| `casino:lobby-big-win` `{amount, multiplier}` | `MainLayout.tsx` (neben `setBigWin`, gleiche Dedupe-Bedingung)                   | Goldkomet mit Glow-Schweif über das Backdrop (1,4 s)               |

**Weichzeichner-Trick (wichtig gelernt):** Harte `stroke()`-Kreise wirken statisch wie Linien.
Stattdessen: **radialer Farbverlauf-Ring** (transparent → Farbe → transparent) plus additive
Mischung (`globalCompositeOperation = 'lighter'`), sodass sich überlappende Wellen wie Licht
aufhellen. Eine schwache „Lichtkuppel“ im Zentrum erzeugt die 3D-Note. Bewusst subtil getunt:
Ring-Alpha 0,20, Kuppel-Faktor 0,22.

## Schutzregeln (alle Ebenen)

- `prefers-reduced-motion: reduce` → Parallax eingefroren, Wellen/Komet vollständig aus
- Mobil ≤ 1023 px → gesamte Ambient-Animation aus (bestehendes Gate, `LobbyAmbientBackground:49`)
- Mengengrenzen: max. 6 Wellen + 2 Kometen gleichzeitig
- Big-Win-Logik (Schwellwerte, Dedupe) unangetastet — nur ein zusätzliches Presentational-Event

## Tuning-Parameter (eine Zahl = ein Effektgrad)

| Wo                            | Parameter                        | Aktuell       |
| ----------------------------- | -------------------------------- | ------------- |
| `ParallaxImageBackground.tsx` | `DEEP_DRIFT_PX` / `MID_DRIFT_PX` | 18 / 42       |
| `LobbyAmbientBackground.tsx`  | Scroll-Faktor Backdrop           | 0,11          |
| dito                          | Wellen-Leuchtkraft / Radius      | 0,20 / 260 px |
| dito                          | Komet-Glow / Punktdicke          | 10 / 3,6      |
