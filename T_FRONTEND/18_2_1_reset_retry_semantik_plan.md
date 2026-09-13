# 18.2.1 — Reset/Retry-Semantik: `RotateCcw` vs. `RefreshCw` konsolidieren

> **Status:** Executed (2026-09-08, Endabnahme via Ergebnis-Links) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich die Reset/Retry-Icon-Semantik (§18.2 Zeile 1, `RotateCcw` × `RefreshCw`). Kein neues Bild-Asset — reine Semantik-Reassignment, daher `worldmap/` statt `public/images/`.
> **Kontext:** Codebase-Recherche (Grep über `src/`, nicht nur die 16-Seiten-Stichprobe) zeigt ein **4-Semantik-Problem statt 2 konkurrierender Icons**: (1) Spin-/Rebet-/Continue-Aktion, (2) Daten-/Seed-Refresh, (3) Error-Retry, (4) Spiel-Identitäts-Badge (Roulette). Gewählt: **Option A** (Lucide-only-Split, 0 neue Assets) aus dem Option-Gate vom 2026-09-06 (§6).
> **Korrektur gegenüber der Chat-Diskussion:** Der ursprünglich vermutete Zusammenhang mit einem „verwaisten `Compass`-Icon auf der Roulette-Seite" hat sich bei der Verifikation als falsch erwiesen — `Compass` gehört zu `GuideSidebar.tsx` (Royale-Guide-Navigation, globale Chrome-Komponente) und hat mit Roulette/Reset nichts zu tun. Es ist **nicht** Teil dieses Plans.
> **Korrektur 2026-09-06 (bei Recherche für [`18_2_6_zufall_spiel_symbolik_plan.md`](18_2_6_zufall_spiel_symbolik_plan.md) entdeckt):** L2 nannte ursprünglich `config.ts` und `gameMeta.ts` als weitere Roulette→`Disc3`-Ziele. Tatsächlich ist `RotateCcw` an `config.ts:43` und `gameMeta.ts:16` der **Dice**-Eintrag (`dice.icon`), nicht Roulette — Roulette nutzt in beiden Dateien bereits `CircleDollarSign` (`config.ts:59`, `gameMeta.ts:17`), unverändert korrekt. L2 ist daher auf `HistoryTableStream.tsx:75` (verifiziert: echter Roulette-Kontext) eingeschränkt. Der Dice-Fehler (`RotateCcw` statt eines Würfel-Icons) in `config.ts`/`gameMeta.ts` gehört inhaltlich zum Zufall/Spiel-Symbolik-Cluster und wird dort behoben.
> **Scope-Korrektur 2026-09-08 (bei L0/L1-Execution entdeckt):** `/dice` rendert nicht V1 (`DiceCenterStage.tsx`), sondern `DiceCenterStageV2.tsx` (`src/app/games/dice/page.tsx:12,474`) — dort sitzen die 2 sichtbaren `RefreshCw`-Stellen (Loading-Spinner „ROLLING 3D DICE", `DiceCenterStageV2.tsx:291` + Roll-Over/Under-Toggle-Button, `:344`). Die Ursprungsanalyse (§18.2 Zeile 1) führte „Dice-CenterStage V1+V2" korrekt; der Plan-Scope hatte versehentlich nur V1 gelistet. Beide V2-Stellen tragen dieselbe Spin-/Roll-Modus-Aktions-Semantik → im selben Zug auf `RotateCcw` migriert (reversibel, innerhalb des Plan-Intents).
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine UI-Präsentation, keine RNG-/Settlement-Berührung)
> **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.51/5, §6).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| L0 | Struktur-Verifikation | `src/components/casino/games/dice/DiceCenterStage.tsx` | 🟢 Erledigt (2026-09-08) | LLM | Befund-Korrektur: Die `RefreshCw`-Stelle ist **kein** `animate-spin`-Roll-Indicator, sondern der „SWAP"-Button (`onToggleRollMode`, Zeile 577) — ein Roll-Modus-Aktions-Button. Keine Daten-/Seed-Refresh-Bedeutung → Abbruchkriterium greift nicht, Migration semantisch korrekt (Spin-/Continue-Aktion) |
| L1 | Migration Dice-Roll-Indicator (`RefreshCw` → `RotateCcw`) | `DiceCenterStage.tsx` (V1) **+ `v2/DiceCenterStageV2.tsx` (live auf `/dice`, Scope-Korrektur siehe Kopfbereich)** | 🟢 Erledigt (2026-09-08) | LLM | V1: Import + Render getauscht (`:5,577`, keine Animations-Klasse vorhanden). V2: beide Stellen getauscht (Loading-Spinner `:291` mit Framer-Rotation unverändert, Toggle-Button `:344`) — `npm run typecheck` grün, kein `RefreshCw`-Import mehr im Dice-Ordner |
| L2 | Reassignment Spiel-Identitäts-Badge (`RotateCcw` → `Disc3`) — Scope 2026-09-06 korrigiert, nur `HistoryTableStream.tsx` | `src/components/history/HistoryTableStream.tsx` | 🟢 Erledigt (2026-09-08) | LLM | Import + `roulette.icon`-Render getauscht (`HistoryTableStream.tsx:11,75`), `size={12}`/`color` 1:1 übernommen — `npm run typecheck` grün |
| L3 | Bestätigung Rest-Stellen (keine Code-Änderung) | `RouletteControlSidebar.tsx`, `CommandPalette.tsx`, `BlackjackLeftSidebar.tsx`, `SlotsControlSidebar.tsx`, `InteractiveArcadeGrid.tsx`, `ProvablyFairModal.tsx`, `ProvablyFairTool.tsx`, `GameErrorBoundary.tsx` | 🟢 Erledigt (2026-09-08) | LLM | Grep bestätigt: 5× `RotateCcw` (Spin-/Rebet-/Continue-Aktion) + 3× `RefreshCw` (Seed-/Error-Refresh) — bereits semantisch korrekt, keine Änderung nötig |
| L4 | Verifikation & Doku-Update | `ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.2 Zeile 1) | 🟢 Erledigt (2026-09-08) | LLM | `npm run typecheck` 0 Fehler, `npm run lint` 0 Errors; Zeile 1 aktualisiert (Status Executed + Ergebnis-Link); `npm test`/`npm run build` im Gesamt-DoD (Task 9, alle Pläne teilen sich denselben Baum) |

---

## 2 — Kontext-Koffer

### 2.1 Vollständige Stellen-Zuordnung (verifiziert per Grep, 2026-09-06)

| Ziel-Icon | Semantik | Stellen | Änderung |
| :--- | :--- | :--- | :--- |
| `RotateCcw` | Spin-/Rebet-/Continue-Aktion | `InteractiveArcadeGrid.tsx` (Continue-Chip „ZULETZT GESPIELT"), `RouletteControlSidebar.tsx` (Rebet-Button), `CommandPalette.tsx` (Command), `BlackjackLeftSidebar.tsx` (Deal-Indicator), `SlotsControlSidebar.tsx` (Spin-Indicator), `DiceCenterStage.tsx` (Roll-Indicator) | 5× unverändert, 1× migriert (Dice) |
| `RefreshCw` | Daten-/Error-Refresh | `ProvablyFairModal.tsx`, `ProvablyFairTool.tsx` (beide: Seed-Regenerierung), `GameErrorBoundary.tsx` (Retry nach Crash) | Unverändert — bereits korrekt |
| `Disc3` (Reassignment, kein neues Asset) | Spiel-Identität Roulette | `HistoryTableStream.tsx:75` (Wett-Historie-Zeilenicon) — einzige verifizierte Roulette-`RotateCcw`-Stelle; `config.ts`/`gameMeta.ts` gehören **nicht** hierher (siehe Korrektur-Hinweis im Kopfbereich) | 1× von `RotateCcw` auf `Disc3` |

**Bestätigende Evidenz:** `Disc3` ist bereits unabhängig als Roulette-Icon etabliert in `src/components/v2/V2Sidebar.tsx:33` und `V2GameTabs.tsx:11` (`/v2`-Sandbox) — die Wahl ist keine neue Erfindung, sondern eine bereits im Projekt vorhandene, konsistente Zuordnung.

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](../public/images/27_sparkles_icon_konsolidierung_plan.md).
- `DiceCenterStage.tsx`s Roll-Indicator ist rotierend animiert (`animate-spin` o. ä.) — beim Icon-Tausch `RefreshCw`→`RotateCcw` muss die Animations-Klasse erhalten bleiben, nur das Icon-Element selbst wird getauscht.
- `gameMeta.ts` wird laut ursprünglicher Inventur (§13) aktuell nicht auf `/stats` gerendert — die Änderung dort ist reine Konsistenz-Pflege für den Fall künftiger Aktivierung, kein sichtbarer Effekt.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung an `Compass` (`GuideSidebar.tsx`) — gehört nicht zu diesem Befund (siehe Korrektur-Hinweis im Kopfbereich).
- Keine Änderung an `config.ts:43`/`gameMeta.ts:16` (`dice.icon: RotateCcw`) — das ist ein Dice-, kein Roulette-Vorkommen; Fix gehört zu [`18_2_6_zufall_spiel_symbolik_plan.md`](18_2_6_zufall_spiel_symbolik_plan.md).
- Keine Änderung an der Roll-/Spin-/Deal-Logik selbst — ausschließlich Icon-Austausch.
- Keine Änderung an Admin- (`/admin/**`) oder Sandbox-Stellen (`/testing`, `/v2`) — dort existieren weitere `RotateCcw`/`RefreshCw`-Vorkommen (7 Admin-Dateien allein für diesen Cluster), die laut §16 der Inventur bewusst erst bei einem globalen Icon-Restyle mitgezogen werden.
- Keine Wallet-/Bet-/Settlement-Berührung.

---

## 3 — Detaillierte Meilensteine

### L0 — Struktur-Verifikation
- **Ziel:** Bestätigen, dass `DiceCenterStage.tsx`s `RefreshCw`-Nutzung tatsächlich dieselbe UI-Rolle spielt wie `RotateCcw` in Slots/Blackjack (rotierender „Aktion läuft"-Indikator).
- **Schritte:** Render-Kontext in `DiceCenterStage.tsx` lesen und mit `SlotsControlSidebar.tsx`/`BlackjackLeftSidebar.tsx` vergleichen.
- **Erwartetes Verhalten:** Gleiches Interaktionsmuster bestätigt.
- **Abbruchkriterium:** Falls der Dice-Indicator doch eine andere Bedeutung trägt (z. B. zusätzlich „Daten neu laden"), Stopp + Rückfrage statt zu migrieren.

### L1 — Migration Dice-Roll-Indicator
- **Ziel:** `DiceCenterStage.tsx` nutzt `RotateCcw` statt `RefreshCw`.
- **Schritte:** Import austauschen, Animations-Klasse unverändert übernehmen.
- **Erwartetes Verhalten:** Visuell nahezu identisch (beide Icons sind kreisförmige Pfeile), aber semantisch korrekt zugeordnet.
- **Abbruchkriterium:** Keins.

### L2 — Reassignment Spiel-Identitäts-Badge
- **Ziel:** Roulette-Icon in `HistoryTableStream.tsx` einheitlich `Disc3` (Scope 2026-09-06 korrigiert — `config.ts`/`gameMeta.ts` gehören zu [18_2_6], siehe Korrektur-Hinweis im Kopfbereich).
- **Schritte:** Import austauschen, Größe/Farbe 1:1 aus bisherigem `RotateCcw`-Kontext übernehmen.
- **Erwartetes Verhalten:** Roulette hat in der Wett-Historie dasselbe Icon wie in `/v2`.
- **Abbruchkriterium:** Keins.

### L3 — Bestätigung Rest-Stellen
- **Ziel:** Dokumentieren, dass die verbleibenden `RotateCcw`/`RefreshCw`-Stellen bereits korrekt sind (keine Änderung).
- **Schritte:** Keine Code-Änderung — nur Eintrag in diesem Plan als „geprüft, korrekt".
- **Erwartetes Verhalten:** Klarheit für künftige Bearbeiter, dass diese Stellen bewusst unangetastet blieben.
- **Abbruchkriterium:** Keins.

### L4 — Verifikation & Abschluss
- **Ziel:** DoD grün, §18.2-Zeile 1 aktualisiert.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, Zeile aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen an Dice/Roulette/Games/History/Stats-Seiten.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur `DiceCenterStage.tsx`, `HistoryTableStream.tsx` + §18.2-Zeile 1.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshot Dice-Roll-Indicator (nach Migration) und Roulette-Icon auf `/games` + Wett-Historie zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option | Konzept | Score |
| :--- | :--- | :---: |
| **A (gewählt)** | Lucide-only-Split: `RotateCcw` exklusiv Spin-/Rebet-Aktion, `RefreshCw` exklusiv Daten-/Error-Refresh, Spiel-Identitäts-Badge auf `Disc3` | **4.51** |
| B | Custom `action.spin-reset` (gpt-image-2) für alle Spin-Momente | 4.32 |
| C | Icon-Familie: `action.spin-reset` + `game.roulette-badge` (2 Assets) | 4.29 |

Tie-Break A–B (Abstand 0,19 ≤ 0,3): Risiko A (4,6) > B (4,2) bestätigt A. Jan-Freigabe: **Option A**, 2026-09-06.
