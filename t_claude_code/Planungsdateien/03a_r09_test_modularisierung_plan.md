# 03a-R09 — Test-Dateien modularisieren (Regel 9)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Aufteilung `useCasinoStore.test.ts` in thematische Module + Helper-Extraktion; keine Änderung an Produktions-Code, keine Testinhalts-Neufassung.
> **Money-Pfad:** Nein (Test-Dateien; Store ist UI-State ohne Guthaben-Mutation) · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R9 (Niveau 52 %, Bottlenecks #1/#3/#5)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                   | Scope (Dateien)                                         | Ausführung  | Status     | Zuständigkeit | Verifikation                                                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| L0     | Baseline & Diagnose: 18 describe-Blöcke kartieren (Happy Path Z. 188, Achievements Z. 502, Fail-closed Z. 702, Config-Delegations-Wrapper Z. 792, loadVipConfig/loadGameConfig Z. 1096) + shared Mocks/Setup inventarisieren  | read-only: `src/store/__tests__/useCasinoStore.test.ts` | Sequenziell | 🔴 Geplant | LLM           | Zuordnungstabelle describe→Zielmodul, 0 Blöcke ohne Ziel                                                                             |
| L1     | Helper extrahieren: `src/store/__tests__/helpers/` (Shared Mocks, Store-Fixture-Factory, Snapshot-Assertions) — 1:1-Umzug, keine Verhaltensänderung                                                                           | `src/store/__tests__/helpers/**` (neu)                  | Sequenziell | 🔴 Geplant | LLM           | `npm test` grün, Testanzahl identisch                                                                                                |
| L2     | Aufteilung in thematische Module: z. B. `processGameResult.happy-path.test.ts`, `processGameResult.achievements.test.ts`, `fail-closed.test.ts`, `config-delegation.test.ts`, `loadConfig.test.ts` — Import der Helper aus L1 | `src/store/__tests__/*.test.ts`                         | Sequenziell | 🔴 Geplant | LLM           | `npm test` grün; jede neue Datei < 400 Z.; Coverage des Stores **nicht** schlechter (Gate laut worldmap aktuell rot: 72,72 % < 80 %) |
| L3     | Coverage-Gegenprüfung: Store-Coverage vor/nach Vergleich (Aufteilung darf keine ungetesteten Zeilen erzeugen — Reihenfolge-Abhängigkeiten durch Vitest-Modul-Isolation ausschließen)                                          | read-only: Coverage-Report                              | Sequenziell | 🔴 Geplant | LLM           | Coverage ≥ Ausgangswert dokumentiert                                                                                                 |
| L4     | Niveau-Rückschreibung: §R9 Sub-Subs #1/#3/#5                                                                                                                                                                                  | `../01_15_03a_code_modularisierung_regelkatalog.md`     | Sequenziell | 🔴 Geplant | LLM           | Neuer R9-Schnitt dokumentiert                                                                                                        |

**Fan-out-Check (Kriterium 5):** L1→L2 kausal (L2 importiert L1-Helper); L3 braucht L2 — **kein Fan-out.** Kriterium 6: Gesamtaufwand nahe 45 Min., aber Teilaufgaben sind nicht unabhängig (gleiche Datei, sequenzielle Abhängigkeit) — kein Fan-out.

## 2 — Self-Contained Kontext-Koffer

- **Ausgangslage (verifiziert 2026-09-14):** `useCasinoStore.test.ts` = 1.254 Z., 18 describe-Blöcke mit klaren thematischen Grenzen (s. L0); Shared Setup/Mocks inline. Aufteilung entlang describe-Grenzen = natürliche Slicing-Grenzen (Regel 1 angewandt auf Tests).
- **Begründung „risikoärmster Refactor im Repo":** Kein Produktions-Code, kein Money-Pfad (Store mutiert keine Guthabenwerte — `processGameResult()` keine Balance-Changes, `applyServerWalletSnapshot()` bleibt einzige Wertgrenze), reine Datei-Organisation.
- **Coverage-Warnung:** Worldmap Kategorie 11 (Testing & QA) meldet Store-Coverage 72,72 % unter der 80-%-Schwelle — die Aufteilung ist neutral zur Coverage, darf sie aber nicht weiter senken (Vitest-Modul-Isolation: jedes Modul braucht dieselben Mocks → L1-Helfer sichern das).
- **Zielband:** Jede neue Test-Datei < 400 Z. (Global-Regel 200–400 typisch); Helper-Dateien < 200 Z.

## 3 — Expliziter Nicht-Scope

- Keine Änderung an `src/store/useCasinoStore.ts` oder sonstigem Produktions-Code.
- Keine Neufassung/Erweiterung von Testfällen (1:1-Umzug, kein „beim Umschreiben verbessern").
- Kein Coverage-Anheben (separates Thema, Kategorie 11).
- Kein Playwright/E2E-Thema.

## 4 — Lebenszyklus

`Execution-Ready` → L0–L4 sequenziell → nach L4 `Executed (archiviert)`. Kein Jan-Gate (reine Test-Organisation, Verifikation vollständig automatisiert).

## 5 — Execution-Log (2026-09-14)

**Umgesetzte Struktur** (Original `useCasinoStore.test.ts`, 1.254 Z., gelöscht):

| Neue Datei                                        | Zeilen | Inhalt (Block-Mapping aus Original-Zeilen)                                                                                                                                                               |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/store/__tests__/snapshot-ui.test.ts`         | ~344   | initial state, applyServerWalletSnapshot, Onboarding, setAutoBetSettings, addToast, Level-up-Toast (A: 71–138 + 856–1095-Teil), einfache UI-/Settings-Aktionen (E: 1096–1254-Teil)                       |
| `src/store/__tests__/process-game-result.test.ts` | ~394   | processGameResult: Validierung, Happy Path, first_game_started-Analytics, Replay-Safety (B: 139–501)                                                                                                     |
| `src/store/__tests__/achievements.test.ts`        | 217    | Achievements (C: 502–701)                                                                                                                                                                                |
| `src/store/__tests__/fail-closed-session.test.ts` | 107    | Fail-closed Finanz-Aktionen, Session-Migration, initialize (D: 702–791 + E-Rest)                                                                                                                         |
| `src/store/__tests__/config-delegation.test.ts`   | 252    | Config-Delegations-Wrapper, loadVipConfig/loadGameConfig, persist-Konfiguration                                                                                                                          |
| `src/store/__tests__/helpers/store-fixture.ts`    | 47     | `INITIAL_STATE`, `SAMPLE_TRANSACTION_ID`, `resultId()`, `makeSnapshot()`, `setupTestEnv()`/`teardownTestEnv()`, `getErrorSpy()` (MockInstance-typisiert)                                                 |
| `src/store/__tests__/helpers/mocks.ts`            | —      | vi.mock-Blöcke sound-manager + analytics/events, Re-Exports; wird von 3 der 5 Dateien genutzt (snapshot-ui + process-game-result nutzen nach Linter-Normalisierung inline-vi.mock — beide Muster valide) |

Alle 5 Test-Dateien < 400 Z. ✅, Helper < 200 Z. ✅. Jede Datei: `// @vitest-environment jsdom` + beforeEach/afterEach via Fixture.

**Korrekturen während Execution:** `expect(errorSpy)` → `expect(getErrorSpy())` (2× in process-game-result, Spy ist Helper-privat); fehlender `SAMPLE_TRANSACTION_ID`-Import in fail-closed-session ergänzt.

**Verifikation:**

- `CI=true npm test` → **262 Dateien / 1.862 Tests, alle grün.** Split-Dateien enthalten exakt 78 `it()`-Blöcke = Testanzahl unverändert (1:1-Umzug bestätigt).
- `npm run typecheck` → 0 Fehler; `npm run lint` → 0 Fehler, 40 Warnungen (−1: max-lines-Warnung der alten 1.254-Z.-Datei entfällt).
- **Coverage-Gate (L3):** `useCasinoStore.ts` lines **80,6 % (133/165)** vor wie nach dem Split — identisch, keine ungetesteten Zeilen entstanden. Functions 57,14 % bleibt unverändert rotes Vorlauf-Gate (Kategorie 11, explizit Nicht-Scope).
- **Zählwerk-Delta erklärt:** +8 Dateien/+16 Tests gegenüber Baseline 254/1846 = +4 Dateien (5 Split-Dateien − 1 gelöschtes Original) mit +0 Tests aus diesem Plan; +4 Dateien/+16 Tests aus **fremden, parallelen Änderungen** (4 neue ungetrackte `src/lib/design-assets/__tests__/*.test.ts` mit 12 `it()` + Tests-Zuwachs in modifizierten `check-doc-links.test.ts`/`performance-mobile.test.ts`). Nicht aus diesem Plan.
