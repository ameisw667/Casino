# 18.2.6 — Zufall/Spiel-Symbolik: Dice-Identitäts-Icon konsolidieren

> **Status:** Executed (2026-09-08, Endabnahme via Ergebnis-Links) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich das Dice-Spiel-Identitäts-Icon (§18.2 Zeile 6, `Dice6`/`Dice5`/`Disc3`). Kein neues Bild-Asset — reine Semantik-Reassignment, daher `worldmap/` statt `public/images/`.
> **Kontext:** Die ursprüngliche Analyse (§18.2 Zeile 6) vermutete eine Drei-Wege-Inkonsistenz zwischen `Dice6`, `Dice5` und `Disc3`. Codebase-Recherche (Grep über `src/`) zeigt ein anderes, aber echtes Problem: `Dice5`/`Disc3` sind ausschließlich `/v2`-Sandbox (bewusst out of Scope, §16 der Inventur), während im Haupt-App echte Dice-Identitäts-Icons zwischen `Dice6` (`CommandPalette.tsx`), `Dices` (`HistoryTableStream.tsx`, `GuideSidebar.tsx`) und `RotateCcw` (`config.ts`, `gameMeta.ts` — ein Reset-Icon ohne jede Würfel-Assoziation) streuen. Gewählt: **Option A** (Lucide-only-Konsolidierung auf `Dices`, 0 neue Assets) aus dem Option-Gate vom 2026-09-06 (§6).
> **Korrektur gegenüber der ursprünglichen §18.2-Analyse:** `Dice5`/`Disc3` sind reine `/v2`-Sandbox-Icons (`V2Sidebar.tsx`, `V2GameTabs.tsx`) und berühren die Haupt-App nicht — keine Inkonsistenz dort. Die tatsächliche Inkonsistenz liegt bei `config.ts:43`/`gameMeta.ts:16`, wo `RotateCcw` (ein Reset-Icon) fälschlich als Dice-Spiel-Identität dient — bei der Recherche zu diesem Plan entdeckt und in [`18_2_1_reset_retry_semantik_plan.md`](18_2_1_reset_retry_semantik_plan.md) entsprechend korrigiert (dortiges L2 war fälschlich auf diese Dateien als Roulette-Ziele bezogen).
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine UI-Präsentation, keine RNG-/Settlement-Berührung)
> **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.47/5, §6).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                | Scope (Dateien)                                                                                                   |          Status          | Zuständigkeit | Verifikation                                                                                                                                                          |
| :----- | :--------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- | :----------------------: | :-----------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0     | Struktur-Verifikation                                      | `src/app/games/_components/config.ts`, `src/components/stats/gameMeta.ts`                                         | 🟢 Erledigt (2026-09-08) |      LLM      | Bestätigt: beide Dateien definieren `dice.icon` als reine Metadaten-Konstante — kein `animate-spin`/Rotations-Bezug, kein Konflikt mit der Spin-Semantik aus [18_2_1] |
| L1     | Migration Command-Palette (`Dice6` → `Dices`)              | `src/components/navigation/CommandPalette.tsx`                                                                    | 🟢 Erledigt (2026-09-08) |      LLM      | Import + „Play Dice"-Command-Icon getauscht (`:4,34`), `size={18}` unverändert — `npm run typecheck` grün, kein `Dice6`-Import mehr außerhalb Admin/Testing           |
| L2     | Migration Games-Lobby & Stats-Meta (`RotateCcw` → `Dices`) | `config.ts`, `gameMeta.ts`                                                                                        | 🟢 Erledigt (2026-09-08) |      LLM      | `dice.icon` in beiden Dateien = `Dices` (`config.ts:2,43`, `gameMeta.ts:1,16`), Farbe/Label unverändert — `npm run typecheck` grün                                    |
| L3     | Bestätigung Rest-Stellen (keine Code-Änderung)             | `HistoryTableStream.tsx`, `GuideSidebar.tsx`, `/v2`-Sandbox (`Dice5`/`Disc3`), Unicode `½`/`2×` (Quick-Bet-Chips) | 🟢 Erledigt (2026-09-08) |      LLM      | Grep bestätigt: `HistoryTableStream.tsx:63` + `GuideSidebar.tsx` nutzen bereits `Dices`; `/v2`-Sandbox und Unicode-Glyphen unverändert out of Scope                   |
| L4     | Verifikation & Doku-Update                                 | `ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.2 Zeile 6)                                                                   | 🟢 Erledigt (2026-09-08) |      LLM      | `npm run typecheck` 0 Fehler, `npm run lint` 0 Errors; Zeile 6 aktualisiert; `npm test`/`npm run build` im Gesamt-DoD                                                 |

---

## 2 — Kontext-Koffer

### 2.1 Vollständige Stellen-Zuordnung (verifiziert per Grep, 2026-09-06)

| Ziel-Icon                     | Semantik                                     | Stellen                                                                                                | Änderung                                                                                                                                                                                  |
| :---------------------------- | :------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dices` (Ziel-Konsolidierung) | Dice-Spiel-Identität (Haupt-App)             | `HistoryTableStream.tsx:63` (Wett-Historie-Zeilenicon), `GuideSidebar.tsx:43` (Guide Quick-Nav „DC")   | 2× unverändert — bereits korrekt                                                                                                                                                          |
| `Dice6` → `Dices`             | Dice-Spiel-Identität                         | `CommandPalette.tsx:34` (Command „Play Dice")                                                          | 1× migriert                                                                                                                                                                               |
| `RotateCcw` → `Dices`         | Dice-Spiel-Identität (fälschlich Reset-Icon) | `config.ts:43` (`GAMES`-Array, `/games`-Lobby-Badge), `gameMeta.ts:16` (`GAME_META`, Stats-Chart-Icon) | 2× migriert                                                                                                                                                                               |
| `Dice5`, `Disc3`              | Dice-/Roulette-Identität in `/v2`-Sandbox    | `V2Sidebar.tsx:32-33`, `V2GameTabs.tsx:10-11`                                                          | Unverändert — out of Scope (§16 der Inventur)                                                                                                                                             |
| Unicode `½`/`2×`              | Quick-Bet-Chip-Labels (Dice-/Crash-Sidebar)  | `DiceControlSidebar.tsx:256-271`, `CrashControlSidebar.tsx:272-287`                                    | Unverändert — bereits vollständig durch [`34_unicode_glyphen_token_system_plan.md`](../../../../public/images/34_unicode_glyphen_token_system_plan.md) abgedeckt, keine Doppelbearbeitung |

**Bestätigende Evidenz:** `Dices` ist bereits 2× unabhängig als korrektes Dice-Icon etabliert (`HistoryTableStream.tsx`, `GuideSidebar.tsx`) — die Konsolidierung ist keine neue Erfindung, sondern die bereits mehrheitlich vorhandene Zuordnung wird auf die 3 abweichenden Stellen ausgedehnt.

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](../../../../public/images/27_sparkles_icon_konsolidierung_plan.md).
- `config.ts:43`/`gameMeta.ts:16` sind reine statische Badge-Icons ohne Animation (anders als der `RotateCcw`-Roll-Indicator in [18_2_1] L1) — der Austausch ist ein reiner 1:1-Import-Tausch ohne Animations-Migration.
- `gameMeta.ts` wird laut ursprünglicher Inventur (§13) aktuell nicht auf `/stats` gerendert — die Änderung dort ist Konsistenz-Pflege für künftige Aktivierung, kein sichtbarer Effekt vor Aktivierung.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung an `Dice5`/`Disc3` in `/v2`-Sandbox — bewusst out of Scope (§16 der Inventur, globaler Restyle später).
- Keine Änderung an den Unicode-Glyphen `½`/`2×` — vollständig Scope von [34_unicode_glyphen_token_system_plan.md], keine Doppelbearbeitung.
- Keine Änderung an `HistoryTableStream.tsx:75` (`RotateCcw` für Roulette) — gehört zu [18_2_1] L2, nicht zu diesem Plan.
- Keine Änderung an der Games-Lobby-/Stats-Berechnungslogik — ausschließlich Icon-Austausch.
- Keine Wallet-/Bet-/Settlement-Berührung.

---

## 3 — Detaillierte Meilensteine

### L0 — Struktur-Verifikation

- **Ziel:** Bestätigen, dass `config.ts:43`/`gameMeta.ts:16` reine statische Badge-Icons sind (keine Rotations-Animation, keine Kollision mit der in [18_2_1] festgelegten Spin-Semantik von `RotateCcw`).
- **Schritte:** Render-Kontext beider Dateien lesen, auf `animate-spin`/Framer-Motion-Rotation prüfen.
- **Erwartetes Verhalten:** Kein Animations-Bezug bestätigt.
- **Abbruchkriterium:** Falls doch eine Rotations-Animation an `dice.icon` hängt, Stopp + Rückfrage statt den visuellen Effekt stillschweigend zu verlieren.

### L1 — Migration Command-Palette

- **Ziel:** `CommandPalette.tsx` nutzt `Dices` statt `Dice6` für den „Play Dice"-Command.
- **Schritte:** Import austauschen, `size={18}` unverändert übernehmen.
- **Erwartetes Verhalten:** Visuell ein anderes, aber klar als Würfel erkennbares Icon; Command-Funktion unverändert.
- **Abbruchkriterium:** Keins.

### L2 — Migration Games-Lobby & Stats-Meta

- **Ziel:** `config.ts`/`gameMeta.ts` nutzen `Dices` statt `RotateCcw` für `dice.icon`.
- **Schritte:** Import je Datei austauschen, restliche `GameMeta`-Felder (Farbe, Label) unverändert lassen.
- **Erwartetes Verhalten:** Dice-Karte auf `/games` zeigt ein Würfel-Icon statt eines Reset-Pfeils; Stats-Konsistenz-Quelle korrigiert.
- **Abbruchkriterium:** Keins.

### L3 — Bestätigung Rest-Stellen

- **Ziel:** Dokumentieren, dass `HistoryTableStream.tsx`, `GuideSidebar.tsx`, `/v2`-Sandbox und die Unicode-Glyphen bereits korrekt bzw. bewusst out of Scope sind.
- **Schritte:** Keine Code-Änderung — nur Eintrag in diesem Plan als „geprüft, korrekt/out of Scope".
- **Erwartetes Verhalten:** Klarheit für künftige Bearbeiter.
- **Abbruchkriterium:** Keins.

### L4 — Verifikation & Abschluss

- **Ziel:** DoD grün, §18.2-Zeile 6 aktualisiert.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, Zeile aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen an `/games`, CommandPalette, Stats.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur `CommandPalette.tsx`, `config.ts`, `gameMeta.ts` + §18.2-Zeile 6.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshot Dice-Karte auf `/games` (nach Migration) und CommandPalette (`Mod+K`, „Play Dice"-Eintrag) zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option          | Konzept                                                                                                       |  Score   |
| :-------------- | :------------------------------------------------------------------------------------------------------------ | :------: |
| **A (gewählt)** | Lucide-only-Konsolidierung: `Dices` als alleinige Dice-Identität in der Haupt-App, `/v2`-Sandbox unangetastet | **4.47** |
| B               | Custom `game.dice-badge` (gpt-image-2) als neues Asset für alle 3 Stellen                                     |   4.11   |
| C               | Icon-Familie für alle 5 Spiele (`game-type-icon` je Spiel, 5 Assets)                                          |   3.72   |

Tie-Break A–B (Abstand 0,36 > 0,3): kein Tie-Break nötig, A führt klar (0 neue Assets, `Dices` bereits im Projekt etabliert). Jan-Freigabe: **Option A**, 2026-09-06.
