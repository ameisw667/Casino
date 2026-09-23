# Crash — Ordner-Konventionen

On-Demand-Lektüre für Agenten, die hier ändern. Nur lokale Gotchas — Systemkontext: `xx_docs/10_games_context.md`, Design: `xx_sop/04_design_system_ui.md`.

## Datei-Rollen

| Datei                 | Rolle                                         |
| --------------------- | --------------------------------------------- |
| `crash-helpers.ts`    | Pure Functions (Berechnungen, kein State)     |
| `crash-styles.ts`     | Style-Tokens/Canvas-Zeichenstil, kolokiert    |
| `useCrashGameLoop.ts` | Game-Loop-Hook (Physics/Draw/RAF-Closures)    |
| `Crash*.tsx`          | UI-Slices; Stage koordiniert, Canvas zeichnet |

## Gotchas

- **Dep-Array-Stable-Handle-Semantik:** `draw` hängt an `[status]`, `gameLoop` an `[draw, settleCrashedRound, resetRiskVisuals]`. Extrahierte Pure Functions dürfen keine neuen Dep-Abhängigkeiten einführen — sonst RAF-Drift oder Stale-Closure.
- **Ref-Gruppen** (`CrashGameLoopParams`): DOM-refs, Data-refs, Mirror-refs sind bereits als Objekt-Slices strukturiert — neue Refs in die passende Gruppe, kein Flat-Zugriff.
- **Duplikat-Ziehmutter:** `useCrashMultiplayerGameLoop.ts` ist ein strukturelles Duplikat (~350 Z. geteilt). Vor Änderungen an der Loop-Physik/Draw-Logik beide Dateien lesen; Konsolidierungs-Optionen: `t_claude_code/Planungsdateien/03_code_modularisierung_lesfootprint_plan.md` §2a.
- **Gewinne nie clientseitig berechnen** — Settlement läuft über Server-RPC; dieser Ordner zeichnet nur.
