# 27 — Game-Interfaces (Modul 05)

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich die 3 `react-hooks/exhaustive-deps`-Warnings in `useCrashMultiplayerRoomClock.ts` (Sub-Punkt #2 aus [`13_05_game_interfaces_subkategorien.md`](../13_05_game_interfaces_subkategorien.md)). Kein Eingriff in Spiellogik, Rundentakt-Semantik oder Settlement.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Kontext:** Modul 05 (Gewicht 15, Niveau Top 12,7 % laut `00_UEBERSICHT.md` Zeile 50) trägt die Kern-Spielinteraktion. `useCrashMultiplayerRoomClock.ts` verwaltet laut [`crash-multiplayer/CLAUDE.md`](../../../../../src/components/casino/games/crash-multiplayer/CLAUDE.md) den „Room-Takt (Server-Zeit gegen lokale Uhr)" — reine UI-Zeitsteuerung, keine Gewinnberechnung („Gewinne nie clientseitig berechnen — Settlement läuft über Server-RPC").

---

## 0 — Auswahlmethodik & Korrektur gegenüber der Quelldatei

|   #   | Sub-Punkt                    | Gewichtung |    Niveau    |             Bottleneck?             |
| :---: | :--------------------------- | :--------: | :----------: | :---------------------------------: |
|   1   | Blackjack                    |     18     |   Top 10 %   |                Nein                 |
| **2** | **Crash Solo + Multiplayer** |   **22**   | **Top 18 %** |              **🔴 JA**              |
|   3   | Dice                         |     15     |   Top 8 %    |                Nein                 |
|   4   | Roulette                     |     15     |   Top 14 %   |                Nein                 |
|   5   | Slots                        |     15     |   Top 8 %    |                Nein                 |
|   6   | Standard-Controls            |     15     |   Top 16 %   | ~~🔴 JA~~ **Nein, siehe Korrektur** |

**⚠️ Korrektur (2026-09-18 frisch verifiziert):** Sub-Punkt #6 nennt als einzigen Beleg den `jsx-a11y/role-supports-aria-props`-Bug in `BetInputGroup.tsx:132`. Dieser wurde bereits am 2026-09-14 über [`04_accessibility_plan.md`](../../../../../docs/archive/frontend/T_FRONTEND/Planungsdateien/04_accessibility_plan.md) behoben (siehe `00_UEBERSICHT.md` Abschnitt 6: native `min`/`max` statt `aria-valuemin`/`aria-valuemax`) — frisch gegengeprüft: `grep -n "min={minBet}" BetInputGroup.tsx` bestätigt den Fix, `npm run lint` (Stand 2026-09-18) zeigt 0 Warnings für `BetInputGroup.tsx`/`AutoBetDrawer.tsx`/`GameActionButton.tsx`, alle 3 Dateien liegen unter 400 Zeilen. Die Top-16-%-Einstufung aus der Quelldatei vom 13. ist damit veraltet (dieselbe Korrektur, die Modul 09 für denselben Fund bereits am 2026-09-14 vorgenommen hat — hier für Modul 05 nachgezogen, da die Quelldatei `13_05_...md` selbst nicht aktualisiert wurde). **Sub-Punkt #6 ist kein Bottleneck mehr; dieser Plan behandelt ausschließlich #2.**

**Sub-Punkt #2 frisch verifiziert (2026-09-18, `npm run lint`):** 3 Warnings weiterhin real vorhanden in `src/components/casino/games/crash-multiplayer/useCrashMultiplayerRoomClock.ts`:

```
148:6  React Hook useEffect has missing dependencies: 'crashPointRef', 'crashRoundIdRef',
       'roundResolvedRef', 'setLiveBets', and 'setRoomRound'
183:6  React Hook useEffect has missing dependencies: 'bettingEndsAtMsRef', 'bigWinQueueRef',
       'crashPointRef', 'lastMilestoneIndexRef', 'lastUpdateRef', 'multiplierRef', 'particlesRef',
       'pointsRef', 'prngSeedRef', 'roundResolvedRef', 'setBettingWindowSecondsLeft', 'setBigWin',
       and 'setMilestoneFlash'
206:6  React Hook useEffect has a missing dependency: 'setRoomWaitDisplay'
```

**Scope-Kollisions-Check:** `grep -rl "useCrashMultiplayerRoomClock" T_FRONTEND/Planungsdateien t_claude_code/Planungsdateien worldmap/60_MOBILE_LCP_ROUTE_STATUS.md` → 0 Treffer außer dieser neuen Datei. Kein Overlap mit `03b_x3_crash_loop_schnitt_plan.md` (betrifft nur `useCrashGameLoop.ts`/`useCrashMultiplayerGameLoop.ts`, nicht `useCrashMultiplayerRoomClock.ts` — andere Datei, andere Rolle laut Ordner-`CLAUDE.md`-Tabelle) und kein Overlap mit [`07_mobile_lcp_crash_multiplayer_plan.md`](./07_mobile_lcp_crash_multiplayer_plan.md) (reine Mobile-Paint-Timing-Diagnose, „Spiel- und Netzwerklogik bleiben unverändert").

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                      | Scope (Dateien)                                                                                      | Ausführung  | Status     | Zuständigkeit | Verifikation                                                                                                                                                        |
| ------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0     | Baseline & Diagnose                              | `useCrashMultiplayerRoomClock.ts` Zeilen 1–207 (bereits vollständig gelesen in dieser Planungsrunde) | Sequenziell | 🔴 Geplant | LLM           | 3 Warnings bestätigt, Stabilität jedes fehlenden Deps (Ref vs. State-Setter) klassifiziert                                                                          |
| L1     | Deps in `useEffect` Zeile 148 ergänzen           | `useCrashMultiplayerRoomClock.ts` Zeile 148                                                          | Sequenziell | 🔴 Geplant | LLM           | Warning verschwindet, kein neues Re-Render-Verhalten (Refs sind stabil, `setRoomRound`/`setLiveBets` sind Dispatch-Funktionen)                                      |
| L2     | Deps in `useEffect` Zeile 183 ergänzen           | `useCrashMultiplayerRoomClock.ts` Zeile 183                                                          | Sequenziell | 🔴 Geplant | LLM           | Warning verschwindet, Betting-Window-Countdown-Verhalten unverändert (manuelle Smoke-Test-Prüfung, siehe L2-Details)                                                |
| L3     | Deps in `useEffect` Zeile 206 ergänzen           | `useCrashMultiplayerRoomClock.ts` Zeile 206                                                          | Sequenziell | 🔴 Geplant | LLM           | Warning verschwindet, Spectator-Status-Zeile unverändert                                                                                                            |
| L4     | Volle Verifikations-Suite + manueller Smoke-Test | —                                                                                                    | Sequenziell | 🔴 Geplant | LLM           | `npm run typecheck` / `npm test` / `npm run lint` / `npm run build` grün; Dev-Server-Smoke-Test auf `/games/crash-multiplayer` (Countdown läuft, kein Endlos-Reset) |
| L5     | Abschluss: Doku-Update & Self-Audit              | `T_FRONTEND/00_UEBERSICHT.md`, `13_05_game_interfaces_subkategorien.md`                              | Sequenziell | 🔴 Geplant | LLM           | Planungsdatei-Spalte umgestellt, #6-Korrektur dort übernommen                                                                                                       |

**Kein Fan-out:** Alle 3 `useEffect`-Blöcke liegen in derselben Datei mit potenziell geteiltem Kontext (gleiche Refs) — sequenzielle Bearbeitung vermeidet, dass zwei parallele Edits denselben Dep-Array-Bereich unabhängig verändern.

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- [`src/components/casino/games/crash-multiplayer/useCrashMultiplayerRoomClock.ts`](../../../../../src/components/casino/games/crash-multiplayer/useCrashMultiplayerRoomClock.ts) — vollständig gelesen (207 Zeilen), alle 3 betroffenen `useEffect`-Blöcke bekannt (Zeilen 148, 155–183, 188–206)
- [`src/components/casino/games/crash-multiplayer/CLAUDE.md`](../../../../../src/components/casino/games/crash-multiplayer/CLAUDE.md) — Gotcha „Dep-Array-Stable-Handle-Semantik" (bezieht sich auf `useCrashMultiplayerGameLoop.ts`, nicht auf diese Datei — hier keine dokumentierte Ausnahme von der Standard-ESLint-Regel gefunden)

### 2.2 Systemregeln & Invarianten

- Refs (`crashPointRef`, `bettingEndsAtMsRef`, `bigWinQueueRef`, `lastMilestoneIndexRef`, `lastUpdateRef`, `multiplierRef`, `particlesRef`, `pointsRef`, `prngSeedRef`, `roundResolvedRef`, `crashRoundIdRef`) sind React-`Ref`-Objekte — deren Identität ändert sich nie zwischen Renders; Ergänzen in die Dep-Arrays löst **keine** zusätzlichen Effect-Läufe aus.
- State-Setter (`setRoomRound`, `setLiveBets`, `setBettingWindowSecondsLeft`, `setBigWin`, `setMilestoneFlash`, `setRoomWaitDisplay`) aus `useState` sind laut React-Garantie ebenfalls referenzstabil — Ergänzen ist verhaltensneutral.
- **Realtime statt Eigenlogik** (Ordner-Gotcha): Rundenstatus kommt über Supabase-Realtime — dieser Plan ändert nichts an der Realtime-Anbindung, nur an den Dependency-Arrays der lokalen Countdown-`useEffect`s.

### 2.3 Nicht-Scope (Ausdrücklich verboten)

- **Keine** Änderung an `useCrashMultiplayerGameLoop.ts` oder `useCrashGameLoop.ts` — das ist Gegenstand von `03b_x3_crash_loop_schnitt_plan.md` (siehe auch [`26_motion_spring_physics_plan.md`](./26_motion_spring_physics_plan.md) Abschnitt 0 für dieselbe Kollisions-Vermeidung).
- **Keine** Bearbeitung von Sub-Punkt #6 (Standard-Controls) — laut Korrektur in Abschnitt 0 kein aktueller Bottleneck mehr.
- **Keine** Änderung an Mobile-LCP-Timing (`07_mobile_lcp_crash_multiplayer_plan.md` bleibt unberührt).
- **Keine** Änderung an der Realtime-Channel-Anbindung (`supabase.removeChannel`, `channel`-Setup in der ersten `useEffect`, Zeile ~140 ff.) — nur die 3 genannten Countdown-`useEffect`s.

---

## 3 — Detaillierte Meilensteine

### L1: Zeile 148 — Realtime-Fallback-Poll-Effect

- **Ziel:** `crashPointRef`, `crashRoundIdRef`, `roundResolvedRef`, `setLiveBets`, `setRoomRound` in das Dep-Array `[]` (Zeile 148) aufnehmen.
- **Abbruchkriterium:** Falls das Hinzufügen einen ESLint-Folgefehler oder eine TypeScript-Warnung an anderer Stelle auslöst (unwahrscheinlich bei reinen Ref-/Setter-Ergänzungen), Änderung zurücknehmen und in L5 als offenen Punkt vermerken statt zu erzwingen.

### L2: Zeile 183 — Betting-Window-Countdown

- **Ziel:** Die 13 fehlenden Deps ergänzen. Da dieser Effect bereits `[status, resetRiskVisuals]` enthält, prüfen, ob `resetRiskVisuals` als Funktion referenzstabil ist (z. B. via `useCallback` definiert) — falls nicht, dies in L0 vermerken, da es ein bereits bestehendes (nicht neu eingeführtes) Stabilitätsrisiko wäre.
- **Erwartetes Verhalten:** Der Countdown-Tick-Mechanismus (200ms-Intervall) verhält sich nach der Änderung identisch — manueller Smoke-Test in L4 bestätigt, dass die Betting-Window-Anzeige weiterhin korrekt herunterzählt und beim Erreichen von 0 den Flugstart auslöst.
- **Abbruchkriterium:** Falls der Smoke-Test in L4 ein Endlos-Reset oder einen doppelten `soundManager.play('crash-launch')`-Aufruf zeigt, Änderung an dieser Zeile zurücknehmen (Ref-Ergänzung war nicht so verhaltensneutral wie erwartet) und den Fund in L5 dokumentieren statt zu erzwingen.

### L3: Zeile 206 — Spectator-Status-Zeile

- **Ziel:** `setRoomWaitDisplay` ergänzen.
- **Abbruchkriterium:** Keines erwartet (einzelner Setter, geringstes Risiko der 3 Änderungen).

### L4: Verifikations-Suite + Smoke-Test

- **Ziel:** Sicherstellen, dass alle 3 Änderungen zusammen keine Regression im Multiplayer-Crash-Spiel verursachen.
- **Schritte:** 1. `npm run typecheck`. 2. `npm test`. 3. `npm run lint` — bestätigt: 3 Warnings weniger (37 statt 40 Baseline-Warnings vom 2026-09-18). 4. `npm run build`. 5. Dev-Server (`npm run dev`, Port 3015), Route `/games/crash-multiplayer` öffnen, mindestens einen vollständigen Runden-Zyklus (Warten → Flug → Crash) beobachten.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. **Typecheck:** `npm run typecheck` — 0 Fehler
2. **Tests:** `npm test` — unverändert grün
3. **Lint:** `npm run lint` — 37 statt 40 Warnings (3 `react-hooks/exhaustive-deps`-Funde behoben), 0 neue Warnings
4. **Build:** `npm run build` — Production-Build erfolgreich
5. **Git Diff:** `git diff --stat` zeigt nur `useCrashMultiplayerRoomClock.ts` + Doku-Updates

---

## 5 — Ehrliche Niveau-Projektion

| Sub-Punkt                   |       Vorher        |            Nach Ausführung (Projektion)            | Begründung                                                                                                                                                                      |
| :-------------------------- | :-----------------: | :------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #2 Crash Solo + Multiplayer |      Top 18 %       |                  **Top 12–14 %**                   | Die 3 konkret benannten Warnings sind behoben; die Datei bleibt aber weiterhin bei 762/759 Zeilen (Quelldatei-Angabe, nicht Teil dieses Plans) — daher keine Top-8-%-Behauptung |
| #6 Standard-Controls        | Top 16 % (veraltet) | **Top 5–10 %** (Korrektur, keine Ausführung nötig) | Bereits durch `04_accessibility_plan.md` am 2026-09-14 behoben, hier nur die Modul-05-Tabelle nachgezogen                                                                       |
| **Modul-Gesamt**            |     Top 12,7 %      |                 **≈ Top 10–11 %**                  | Beide Korrekturen (echte Fix-Ausführung bei #2, Doku-Nachzug bei #6) zusammen                                                                                                   |

**Nicht schöngerechnet:** Keine Top-8-%-Behauptung für #2, da die Datei-Größe (762/759 Zeilen) unverändert bleibt und explizit nicht Teil dieses Plans ist (das ist `03b`s Aufgabe).

---

## 6 — Selbstprüfung (Kern-8-Rubrik)

|  #  | Kriterium                               | Score /3 | Begründung                                                                                                                                                            |
| :-: | :-------------------------------------- | :------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Verifizierbarkeit gegen Repo-Realität   |    3     | Beide Korrekturen (Sub-Punkt #6 veraltet, Sub-Punkt #2 weiterhin real) frisch gegen `npm run lint` und den vollständig gelesenen Datei-Inhalt verifiziert             |
|  2  | Konkretheit der Handlungsanweisung      |    3     | Exakte Zeilennummern, exakte fehlende Deps aus dem echten Lint-Output übernommen                                                                                      |
|  3  | Vollständigkeit des Lebenszyklus/Scopes |    3     | L0 Diagnose → L1–L3 Fixes → L4 Verifikation/Smoke-Test → L5 Abschluss                                                                                                 |
|  4  | Bekannte-Probleme-Transparenz           |    3     | #6-Veraltung UND das bereits bestehende, nicht neu eingeführte `resetRiskVisuals`-Stabilitätsrisiko (L2) offen benannt                                                |
|  5  | Cross-Referenz-Konsistenz               |    3     | Verweis auf `04_accessibility_plan.md`, `03b_x3_crash_loop_schnitt_plan.md`, `07_mobile_lcp_crash_multiplayer_plan.md` mit je explizitem Kollisions-Check (0 Treffer) |
|  6  | Risiko-/Freigabeklassifizierung         |    3     | Money-Pfad: Nein mit Ordner-`CLAUDE.md`-Beleg; Realtime-Anbindung explizit als Nicht-Scope markiert                                                                   |
|  7  | Lerneffekt-Tauglichkeit                 |    3     | Erklärt, warum Ref-/Setter-Ergänzungen verhaltensneutral sind (React-Stabilitätsgarantien), keine Blackbox                                                            |
|  8  | Aktualitäts-Check                       |    3     | Stand 2026-09-18, gegen frischen Lint-Lauf und vollständig gelesene Zieldatei verifiziert                                                                             |

**Score: 24 / 24 → Tier Top 1 %.** Keine bewusste Lücke.
