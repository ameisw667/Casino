# 28 — Store-Selector-Hooks: Nutzungs-Entscheidung nach useShallow-Bugfix

> **Status:** Execution-Ready · **Stand:** 2026-09-20 · **Owner:** LLM (Jan nur bei G1-Gate) · **Scope:** `src/store/useCasinoStore.ts` (3 exportierte Hooks) + ggf. verdrahtende UI-Komponenten
> **Money-Pfad:** Nein · **Security-Review:** Nein

## 1 — Übersicht für Jan & Ausführungs-LLM

**Hintergrund (Erkenntnis aus der PR-#34-Coverage-Runde, 2026-09-20):** Die 3 Memoized-Selector-Hooks
`useWalletBalance` / `useVipRankInfo` / `useSoundSettings` (`src/store/useCasinoStore.ts`, Abschnitt
„Memoized Selectors (Zustand 5 useShallow)") gaben bei jedem Aufruf ein frisches Objekt zurück —
`useShallow` fehlte trotz des Abschnittskommentars. In React 19 → „Maximum update depth exceeded";
die Hooks waren faktisch unbenutzbar. **Grep über den gesamten `src` zeigte: 0 Verwendungen** —
der Bug lag unentdeckt brach. Der Bug selbst ist behoben (Commit `a11c21eb`, `useShallow`
nachgerüstet, durch `renderHook`-Tests in `src/store/__tests__/async-surfaces.test.ts` verifiziert).
**Offen ist die Nutzens-Entscheidung:** Die Hooks bleiben weiterhin ungenutzt — verdrahten oder löschen.

| Nummer | Meilenstein                                                                                                                                                                                                                                                                                                                    | Scope (Dateien)                | Ausführung                                                                                                                                                                             | Status              | Zuständigkeit | Verifikation                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------- | --------------------------------------------------------------------- |
| L0     | Baseline & Diagnose: 0-Nutzung via Grep (`useWalletBalance                                                                                                                                                                                                                                                                     | useVipRankInfo                 | useSoundSettings`) bestätigen; Konsum-Stellen im UI identifizieren, die die Hooks statt direkter `useCasinoStore`-Selektoren nutzen könnten (Balance-Anzeige, Header, Settings-Dialog) | `src/**/*.{ts,tsx}` | Sequenziell   | 🔴 Geplant                                                            | LLM | Grep-Report mit `Datei:Zeile`-Belegen |
| L1     | **G1 — Jan-Entscheidung:** Option **A** = Hooks löschen (toter Code; `casino-residue-scout` läuft wegen entfernten Exporten als Bericht, nie Auto-Delete) · Option **B** = Hooks behalten und in die aus L0 identifizierten Komponenten verdrahten (ersetzt dort Objekt-bilden-in-Selektoren, eliminierend Re-Render-Kaskaden) | L0-Ergebnis + Jan-Entscheidung | Sequenziell                                                                                                                                                                            | 🔴 Geplant          | **Jan**       | Entschiedenheit Option A/B schriftlich                                |
| L2     | Ausführung nach G1 + 5-Stufen-Selbstprüfung (typecheck/test/lint; bei A zusätzlich Residue-Report ohne offene Fragen)                                                                                                                                                                                                          | je Option                      | Sequenziell                                                                                                                                                                            | 🔴 Geplant          | LLM           | `npm test` grün; `npm run lint` 0 neu; bei A: Residue-Report anhängen |

**Nicht-Scope:** Keine Wallet-/RNG-/Settlement-Logik (Hooks sind reine Read-Selektoren); keine
Persistenz-Änderung (`partialize` bleibt unberührt); kein Money-Pfad.

## 2 — Erkenntnis-Kontext (warum dieser Plan existiert)

1. **Bug-Klasse „Kommentar verspricht, Code hält nicht":** Der Abschnittskommentar versprach
   `useShallow` — der Code hatte es nicht. Eine Kommentar-versus-Code-Drift, die weder Tests noch
   Compiler aufdecken (Typen waren korrekt, nur die Referenz-Identität brach React 19).
   Möglicher Folge-Auftrag (außerhalb dieses Plans): Coverage-/Lint-Gate, das Objekt-Rückgaben
   aus Store-Selektoren markiert — bewusst **nicht** Teil dieses Plans (Option-Gate wäre vorab nötig).
2. Die Hooks waren nie verdrahtet — sie stammen aus der Zustand-5-Selektor-Idee (Header-Kommentar)
   und wurden im Zuge des Store-Slice-Refactors (03a-R09) beibehalten, ohne Verbraucher zu finden.
3. Verifikations-Basis: `coverage/lcov.info` (v8-Provider) — FNDA:0-Zeilen statt Summary-Reading;
   Methodik-Detail in [`worldmap/61_pr34_ci_gates_und_merge_weg.md`](../../../../../worldmap/61_pr34_ci_gates_und_merge_weg.md) §2.

## 3 — Abhängigkeiten

- Keine harten Abhängigkeiten — **unabhängig vom PR-#34-Merge ausführbar** (L2-Option B berührt
  nur Konsum-Dateien, die aktuell existieren oder nicht).
- Die 7 Tests in `src/store/__tests__/async-surfaces.test.ts` setzen den Fix voraus — bei
  Option A (Löschen) werden die 3 Selector-Hook-Tests aus der Datei entfernt, Rest bleibt.
