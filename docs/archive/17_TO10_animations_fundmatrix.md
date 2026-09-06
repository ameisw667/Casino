# 17 — TO-10 Fund-Matrix: Animations- & Ladezustand-Code-Audit

> **Stand:** 2026-08-30 · **Typ:** Fundliste (read-only Audit, keine Fixes ausgeführt) · **Plan:** [`04-TO10-animations-ladezustaende-audit.md`](./04-TO10-animations-ladezustaende-audit.md) · **Messregeln:** SOP 04 + SOP 16 — erlaubt animierbar: `transform`, `opacity`, `clip-path` (GPU); verboten: Layout-Eigenschaften (`width/height/top/left/margin/padding/border/font-size`); Grauzone paint-only: `box-shadow`/`filter`/`background-position`/`color`/`text-shadow` (kein Reflow, Repaint-Repaint-Kosten).
>
> **Statusangabe:** lokal verifiziert (Eigenlese + Grep mit Zeilenbeleg, Messlauf 2026-08-30). Keine Live-Behauptung.

## 1 — Summary

| Achse                | Ergebnis                                                                                                               |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| Framer Motion        | 142 Dateien mit Import · 553 `motion.*`-Vorkommen in 137 Dateien · `AnimatePresence` in 45 Dateien · `useSpring` in 12 |
| Layout-Regelverstöße | **9 Fundstellen** (A1) + 3 `height:'auto'` (A2) + 8 dauerhafte `will-change` (A3)                                      |
| CSS-Keyframes        | 51 in 9 Dateien — **0 Layout-Verstöße** (A4)                                                                           |
| rAF-Loops            | 8 Stellen, 2 kritisch (Crash-`border`-Mutation) (A5)                                                                   |
| Reduced Motion       | 6 CSS-MQs + 19 Hooks + 5 `matchMedia` — Infrastruktur vorhanden, Fläche lückenhaft (A6)                                |
| Ladezustände         | 19 User-Routen: 15 mit, **4 ohne**; **0 `loading.tsx`** im Repo (L1)                                                   |
| Fehlerzustände       | 3 stille Catches, davon 1 mit tot gesetztem Error-State (L2)                                                           |
| Toter Code           | `GameSkeleton`/`CardSkeleton`/`StatSkeleton` ohne Importer (L3)                                                        |

## 2 — A1: Framer-Motion-Animationen auf Layout-Eigenschaften (9 Funde)

| #   | Beleg                                                                        | Animiert                                                                     | Schwere                                       |
| --- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------- |
| 1   | `src/components/social/CasinoGuidePanel.tsx:551-568` (Eigenlese verifiziert) | `left` + `top` + `width` + `height` + `transform`-String im selben `animate` | Hoch — 4 Layout-Eigenschaften am Guide-Widget |
| 2   | `src/components/casino/vault/VaultVipProgression.tsx:133`                    | `width: %` (Spring 120/18)                                                   | Mittel                                        |
| 3   | `src/components/casino/RankBenefitsModal.tsx:190`                            | `width: %`                                                                   | Mittel                                        |
| 4   | `src/components/home/bento/LiveHighlightStream.tsx:299`                      | `width: '100%'`                                                              | Mittel                                        |
| 5   | `src/components/casino/BigWinOverlay.tsx:113-116`                            | `top: '110%'` + `left`-Drift (Konfetti)                                      | Mittel (Vollbild-Ovl.)                        |
| 6   | `src/components/casino/games/slots/CoinShower.tsx:62-63`                     | `top: '110%'` (Münzfall)                                                     | Mittel                                        |
| 7   | `src/components/casino/SettingsPopover.tsx:38`                               | `height: 'auto'`                                                             | Mittel (→ A2)                                 |
| 8   | `src/components/analytics/ConsentBanner.tsx:33`                              | `height: 'auto'`                                                             | Mittel (→ A2)                                 |
| 9   | `src/components/casino/games/roulette/RouletteFeltBoard.tsx:90`              | `height: 'auto'`                                                             | Mittel (→ A2)                                 |

Regelkonform dagegen (Spot-Verifikation Explorer): alle 15 `whileInView`-Stellen (12 Dateien) animieren ausschließlich `opacity`/`y`/`scale`; `ParticleBurst.tsx:93-94` nutzt `calc()`-Transform-Strings (A7, ok).

## 3 — A3: Dauerhaftes `will-change` (8 Funde, 0 bedingte)

| Beleg                                                                          | Kontext                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `src/app/globals.css:1815` (Eigenlese verifiziert)                             | `.slot-reel-strip` + zusätzlich `translateZ(0)` (:1817) |
| `src/components/casino/games/slots/SlotReel.tsx:129` + `v2/SlotReelV2.tsx:129` | Reel-Strips inline, dauerhaft                           |
| `src/components/home/LobbyAmbientBackground.tsx:314,361`                       | Parallax-Wrapper, dauerhaft                             |
| `src/app/games-2/_components/KineticHeadline.tsx:165`                          | inline, dauerhaft                                       |
| `src/components/casino/games/roulette/LuxuryRouletteWheel.tsx:243,568`         | Rad-/Kugel-Layer, dauerhaft                             |

Kein Tailwind-`will-change-*`-Klassenfund; keine bedingte Aktivierung (z. B. nur während Spin) im gesamten `src/**`.

## 4 — A5: rAF-/Timer-Loops mit direkter `style`-Mutation

| Beleg                                                                                                                                                                                                                                        | Mutation                                                    | Bewertung                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/app/games/crash/page.tsx:207-427`; `:241` Eigenlese verifiziert (`cashoutButtonRef.style.border`)                                                                                                                                       | `transform`, `color`, `textShadow`, `opacity`, **`border`** | `border` = Reflow in der heißen Spiel-Loop — höchste Fix-Prio der Kategorie |
| `src/app/games/crash-multiplayer/page.tsx:212-465`                                                                                                                                                                                           | identisches Muster                                          | same                                                                        |
| `src/components/home/LobbyAmbientBackground.tsx:164-167`                                                                                                                                                                                     | `style.transform` via rAF                                   | GPU-ok                                                                      |
| `src/hooks/useParallax.ts:85,93` · `src/app/lab/_components/useWagerRound.ts:58,73` · `src/app/testing/fe-06-crash/page.tsx:143-440` · `src/components/ui/RippleContainer.tsx:55` · `src/components/home/LobbyAmbientBackground.tsx:164-167` | rAF-Loops (überwiegend transform)                           | im Rahmen ok                                                                |
| Hover-Inline-Mutationen: `src/components/social/GuideMessageList.tsx:215-278`, `src/app/games-2/_components/BentoTile.tsx:98-103`, `HeroSpotlight.tsx:116-121`, `src/components/social/GlobalChat.tsx:94-99`                                 | inline styles bei Hover                                     | Wartbarkeit, kein harter Verstoß                                            |

## 5 — L1: Ladezustand-Abdeckung (19 User-Routen)

Mit Ladezustand (15): blackjack, crash, crash-multiplayer, dice, roulette (`RouletteClient`), slots, slots/v2, history, leaderboard, stats, vault, sign-in, sign-up, reset-password, refactoring (iframe-`loaded`). Belege je Route in Plan §Beweis basis Explorer-Lauf (Feld „Beleg"-Spalte).

**Ohne jeden Ladezustand (4):** `src/app/page.tsx` (Lobby → `HomeClientV2`, kein fetch/loading), `src/app/games/page.tsx:19-45` (rein lokal), `src/app/games-2/page.tsx:23-193` (statisch), `src/app/lab/page.tsx` (Thin-Wrapper, ungeprüft — Messgrenze).

**Repo-weit:** 0 × `loading.tsx`; 1 × `error.tsx` (nur Root, `src/app/error.tsx:9`).

## 6 — L2 + L3: Fehlerzustände & totes Primitive (Eigenlese verifiziert)

| Beleg                                            | Befund                                                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/history/page.tsx:35`                    | `const [_error, setError] = useState(...)` — `_error` wird **nirgends gerendert** (Grep: nur :53/:76 `setError`, kein Renderzugriff) → toter Fehlerpfad |
| `src/app/vault/page.tsx:68`                      | `.catch(() => {})` nach `/api/user/stats`-fetch — stiller Swallow                                                                                       |
| `src/app/leaderboard/page.tsx:41-42`             | nackter `catch { }` — kein Fehler-UI                                                                                                                    |
| `src/components/casino/GameSkeleton.tsx:3,32,36` | `GameSkeleton`/`CardSkeleton`/`StatSkeleton` — einziges Vorkommen = Eigendatei, 0 Imports repo-weit                                                     |

Positiv-Seite (kein Fixbedarf): Games-Familie durchgehend Toast fail-closed (`AuthForm.tsx:132-167`, `blackjack/page.tsx:205-212` u. a.); `LoadingOverlay` aktiv in `MainLayout.tsx:368`.

## 7 — Bewertungs-Skala (Subkategorien-Noten)

A1 Top-60% · A2 Top-50% · A3 Top-40% · A4 **Top-10%** · A5 Top-45% · A6 Top-55% · A7 Top-30% · L1 Top-70% · L2 Top-75% · L3 Top-65%. Schnitt Top-50%. Skala: Top-1% exzellent → Top-100% katastrophal.

## 8 — Fix-Welle-Empfehlung (nicht hier ausgeführt)

Prio-Reihenfolge gemäß Plan §4: (1) History-Error-UI, (2) CasinoGuidePanel-Expand auf Transform, (3) Crash-Loop `border` → Shadow/Overlay, (4) stille Catches (Vault-Intent vorab klären), (5) `will-change` temporär machen, (6) Root-`loading.tsx` + Skeleton-Reaktivierung, (7) `height:'auto'`-Entsorgung, (8) `useSafeMotion`-Flächenausrollo (eigener Meilenstein).
