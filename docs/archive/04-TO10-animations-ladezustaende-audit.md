# TO-10 — Animations- & Ladezustand-Code-Audit

> **Status:** Executed (archiviert) · **Stand:** 2026-08-30 · **Owner:** LLM · **Scope:** Read-only Code-Audit aller Animationen (`framer-motion`, CSS-Keyframes, `will-change`, rAF-Loops) und Lade-/Fehler-Zustände gegen die verbindliche Animationsregel (SOP 04 + SOP 16: nur `transform`/`opacity`/`clip-path` GPU-entschärft animieren). Ergebnis = Fundliste, bewertet in 10 Subkategorien. **Keine Fixes** — Fixes sind eine separate Welle. **Keine visuelle Selbstbewertung** (Jan-Regel — nur Code-Befunde).

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                          | Status      | Nächster Schritt | Zuständigkeit |
| ------ | -------------------------------------------------------------------- | ----------- | ---------------- | ------------- |
| L0     | Kontextaufbau (2 Explorer-Agenten: Animationen + Ladezustände)       | 🟢 Executed | —                | LLM           |
| L1     | Subkategorien (10) mit Top-1%-bis-Top-100%-Bewertung + Planungsdatei | 🟢 Executed | —                | LLM           |
| L2     | Selbstprüfung der Planung (Vollständigkeit, Scope, Abgrenzung)       | 🟢 Executed | —                | LLM           |
| L3     | Audit-Ausführung: Spot-Verification der Funde + Fund-Matrix          | 🟢 Executed | —                | LLM           |
| L4     | Archivierung Plan + Fund-Matrix nach `docs/archive/`                 | 🟢 Executed | —                | LLM           |
| L5     | `T_FRONTEND/04_tokens.md`: TO-10 🔴 offen → 🟢 erledigt              | 🟢 Executed | —                | LLM           |

Alle Zuständigkeiten LLM; keine Jan-Zuständigkeit in dieser Welle. Kein Money-Pfad, kein Security-Review-Pflicht (read-only Audit).

## 2 — Messregeln (verbindliche Basis)

- Erlaubt animierbar (GPU): `transform`, `opacity`, `clip-path` (SOP 04/16, Global-Regel „Animate only compositor-friendly properties").
- Verboten als Animationsziel: `width`, `height`, `top`, `left`, `right`, `bottom`, `margin*`, `padding*`, `border*`, `font-size` (Layout/Reflow).
- Grauzone paint-only (kein Reflow, aber Repaint, auf Mobilgeräten teuer): `box-shadow`, `filter`, `background-position`, `color`, `text-shadow`.
- `will-change`: nur temporär während aktiver Animation zulässig; dauerhafte Aktivierung = Fund (GPU-Layer-Kosten).
- Ladezustand: Route (oder ihre Client-Komponente) braucht sichtbaren Lade-/Pending-Zustand; Fehlerzustand braucht sichtbares Fehler-UI, kein stiller Catch.

## 3 — 10 Subkategorien mit Bewertung (Skala: Top-1% = exzellent → Top-100% = katastrophal)

> Datenbasis: Explorer-Vollscan + eigene Spot-Verification (L3). Zahlen gemessen 2026-08-30.

| #   | Subkategorie                                         | Messbefund (Zahlen)                                                                                                                                                                                            | Bewertung   | Begründung der Note                                                                                                                     |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Framer-Motion-Animationen auf Layout-Eigenschaften   | 9 Fundstellen in 9 Dateien; schwerster: `CasinoGuidePanel.tsx:551-568` animiert `left`+`top`+`width`+`height`+transform-String im selben `animate`                                                             | **Top-60%** | Nur 9 von 553 `motion.`-Vorkommen (1,6%) — aber der schwerste Fall animiert 4 Layout-Eigenschaften gleichzeitig am Guide-Widget         |
| A2  | `height: 'auto'`-Accordion-Animationen               | 3 Stellen: `SettingsPopover.tsx:38`, `ConsentBanner.tsx:33`, `RouletteFeltBoard.tsx:90`                                                                                                                        | **Top-50%** | `height:auto` erzwingt per-Frame-Messung; Stellen klein (Popovers), Impact begrenzt                                                     |
| A3  | `will-change`-Dauerhaftkeit                          | 8 Vorkommen, **alle dauerhaft** (0 bedingte): `globals.css:1815`, `SlotReel.tsx:129`, `SlotReelV2.tsx:129`, `LobbyAmbientBackground.tsx:314,361`, `KineticHeadline.tsx:165`, `LuxuryRouletteWheel.tsx:243,568` | **Top-40%** | Nur 8 Stellen, aber Muster durchgehend regelwidrig (nie temporär); Reels+Parallax erzeugen Dauer-Layer                                  |
| A4  | CSS-Keyframes-Hygiene                                | 51 Keyframes in 9 Dateien — **0 animieren Layout-Eigenschaften**; rein `transform`/`opacity` bzw. paint-only                                                                                                   | **Top-10%** | Bestand vollständig regelkonform; Paint-only-Keyframes (`box-shadow`, `background-position`) sind Grauzone, kein Regelbruch             |
| A5  | rAF-/Timer-getriebene direkte `style`-Mutationen     | 8 Loop-Stellen; Crash-Pages mutieren `transform`+`color`+`textShadow`+`opacity`+`border` per rAF: `crash/page.tsx:207-427`, `crash-multiplayer/page.tsx:212-465`                                               | **Top-45%** | `transform`/`opacity` via rAF ist GPU-ok; aber `border`-Mutation im Crash-Loop stößt Reflow an (kritischste Spiel-Loop)                 |
| A6  | `prefers-reduced-motion`-Abdeckung                   | 6 CSS-MQs + 19 `useReducedMotion`-Hooks + 5 `matchMedia`-Stellen; vs. 142 Motion-Dateien — Framer-Sprünge (`whileHover scale`) ohne Hook-Check überwiegend                                                     | **Top-55%** | Infrastruktur vorhanden (`useSafeMotion`-Wrapper!), Abdeckung lückenhaft; Bento- & games-2-Familie gut, Rest ad hoc                     |
| A7  | Transform-String/`calc()`-Konstrukte in Motion-Props | `ParticleBurst.tsx:93-94` animiert `x`/`y` als `calc()`-Templates (GPU-ok); statische Zentrier-Strings ok                                                                                                      | **Top-30%** | Transform-basiert = regelkonform; nur Wartbarkeits-Frage, kein Perf-Verstoß                                                             |
| L1  | Ladezustand-Abdeckung je Route                       | 19 User-Routen: 15 mit Ladezustand, **4 ohne jeden** (`/` Lobby, `/games`, `/games-2`, `/lab`); **0 `loading.tsx`** im Repo                                                                                    | **Top-70%** | Kern-Regelbruch der Welle: Hauptflächen (Lobby, Katalog) ohne jeden Warte-Zustand; kein Root-Loading-Netz                               |
| L2  | Fehlerzustand-Abdeckung                              | 3 stille Catches: `vault/page.tsx:68` (`.catch(() => {})`), `leaderboard/page.tsx:41-42`, `history/page.tsx:35,76` — `_error` gesetzt, **nie gerendert**                                                       | **Top-75%** | Games-Familie vorbildlich (Toast fail-closed), aber History setzt einen Error-State, den keine UI anzeigt — funktional toter Fehlerpfad |
| L3  | Tote Primitives & Mounted-Gate-Konsistenz            | `GameSkeleton`/`CardSkeleton`/`StatSkeleton` (`GameSkeleton.tsx:3,32,36`) haben **0 Imports** (toter Code); Games nutzen `mounted`-Gate → rendert `null` statt Skeleton                                        | **Top-65%** | Skelett-Infrastruktur existiert, wird aber nirgends benutzt; Mounted-Gate statt Skeleton = Flash statt Warte-Feedback                   |

**Gesamt-Bewertungsschnitt: Top-50%** — Animations-Bestand (A4/A7) stark, die Layout-Regelverstöße (A1–A3) sind wenige aber konsistente Muster, Lade/Fehler-Abdeckung (L1/L2) ist die schwächste Achse.

## 4 — Bottlenecks & Action Items (Fundliste → nächste Fix-Welle, bewusst nicht hier ausgeführt)

| Prio | Bottleneck                                      | Beleg                                                                 | Fix-Richtung (nur Skizze)                                                                                     |
| ---- | ----------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1    | History-Error-State tot: `_error` nie gerendert | `history/page.tsx:35,76`                                              | Error-UI rendern oder State entfernen; kleinstmöglicher Fix mit Nutzerwert                                    |
| 2    | Guide-Panel animiert 4 Layout-Eigenschaften     | `CasinoGuidePanel.tsx:551-568`                                        | Auf `transform`-basierte Expand-Technik (scale/clip) umstellen                                                |
| 3    | Crash-Loop mutiert `border` per rAF             | `crash/page.tsx:207-427` (und MP-Pendant)                             | Border-Feedback auf `box-shadow`/Opacity-Overlay verlagern                                                    |
| 4    | 3 stille Catches ohne sichtbares Fehler-UI      | `vault/page.tsx:68`, `leaderboard/page.tsx:41`, `history/page.tsx:76` | Toast/Meldung ergänzen (Vault evtl. bewusst fail-safe — vor Fix Intent klären)                                |
| 5    | `will-change` dauerhaft (8 Stellen)             | s. A3-Tabelle                                                         | Nur durante Spin/Hover aktivieren, sonst entfernen                                                            |
| 6    | 4 Routen ohne Ladezustand + 0 `loading.tsx`     | Lobby, `/games`, `/games-2`, `/lab`                                   | Root-`loading.tsx` + Skeleton-Verwendung; totes `GameSkeleton`-Primitive (L3) dabei reaktivieren oder löschen |
| 7    | `height:'auto'`-Akkordeons (3 Stellen)          | s. A2                                                                 | `grid-template-rows`-Technik oder Framer-Layout-Animation prüfen                                              |
| 8    | Reduced-Motion-Lücken (A6)                      | 142 Motion-Dateien vs. 19 Hooks                                       | Kandidat für `useSafeMotion`-Flächenausrollo; eigener Meilenstein, kein Quick-Fix                             |

## 5 — Abhängigkeiten, Gates, Nicht-Scope

- **Abhängigkeiten:** SOP 04 (Design Hub), SOP 16 (Motion Polish), SOP 02 (Execution), SOP 03 (Planungsdateien).
- **Freigabe-Gate:** Kein K4/K5 — read-only; Commits nur auf Jans Wort.
- **Nicht-Scope:** Keine Code-Fixes, keine visuelle Bewertung (Taste-QC bleibt Jan), keine Admin-/Testing-/Sandbox-Routen, kein Remote-Zugriff.
- **Verifizierung:** Funde durch eigenen Read/Grep belegt (`Datei:Zeile`); kein Behaupten ohne Beleg.

## 6 — Verweis auf Fund-Matrix

Vollständige Belegliste: [`docs/archive/17_TO10_animations_fundmatrix.md`](../docs/archive/17_TO10_animations_fundmatrix.md) (nach L4 archiviert).
