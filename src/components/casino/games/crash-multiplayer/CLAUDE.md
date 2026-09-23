# Crash-Multiplayer — Ordner-Konventionen

On-Demand-Lektüre für Agenten, die hier ändern. Nur lokale Gotchas — Systemkontext: `xx_docs/10_games_context.md`, Design: `xx_sop/04_design_system_ui.md`.

## Datei-Rollen

| Datei                             | Rolle                                                                      |
| --------------------------------- | -------------------------------------------------------------------------- |
| `useCrashMultiplayerGameLoop.ts`  | Game-Loop-Hook (Physics/Draw/RAF-Closures)                                 |
| `useCrashMultiplayerRoomClock.ts` | Room-Takt (Server-Zeit gegen lokale Uhr)                                   |
| `crash-multiplayer-styles.ts`     | Style-Tokens/Canvas-Zeichenstil, kolokiert (mit eigenen Tests)             |
| `index.ts`                        | Fassade — re-exportiert die UI-Komponenten; neue Komponente hier eintragen |
| `CrashMultiplayerStage.tsx`       | Koordinator der Stage; zeichnet und verteilt an die Slices                 |

## Gotchas

- **Dep-Array-Stable-Handle-Semantik:** `draw` hängt an `[status]` (Z. 611), `gameLoop` an `[gameLoop]` (Z. 761), RAF-Bootstrap an `[]` (Z. 781). Extrahierte Pure Functions dürfen keine neuen Dep-Abhängigkeiten einführen — sonst RAF-Drift oder Stale-Closure.
- **Mobile-Idle-Delay bleibt hier:** `MOBILE_IDLE_CANVAS_DELAY_MS = 5_000` (Z. 32, genutzt Z. 771–778) — bewusst nur im Multiplayer-Hook, nicht in den Solo-Hook ziehen.
- **Duplikat-Ziehmutter:** strukturelles Duplikat des Solo-Hooks (~350 Z. geteilt). Vor Änderungen an Loop-Physik/Draw beide Dateien lesen. Option-Matrix: `t_claude_code/Planungsdateien/03_code_modularisierung_lesfootprint_plan.md` §2a — gewählt **X3**: gemeinsame Blöcke wandern nach `src/components/casino/games/crash-loop/` (Geschwister-Modul, **nicht** in einen der beiden Feature-Ordner).
- **Realtime statt Eigenlogik:** Runden-Status und Live-Spieler kommen über Supabase-Realtime — keine Rundungslogik im Client nachbauen.
- **Gewinne nie clientseitig berechnen** — Settlement läuft über Server-RPC; dieser Ordner zeichnet nur.
