# 11 — casino-residue-scout: Pilot-Evaluierungsfälle (xx_sop/13 §3)

> Stand: 2026-08-30 · Status: Draft, Pilot-Evaluierung nachgetragen.
> Jede Delegation nennt `Evaluation mode: 11_residue_scout` und weist den Agenten an, die
> npx-Detection-Tools als nicht verfügbar zu behandeln — so wird gezielt der Fallback-Pfad
> (manueller Grep + Abschnitt „Degraded Coverage") mitgeprüft. Erwartete Kernbelege sind
> jeweils unter „Erwartet" fixiert; Status und Kernbelege müssen in beiden frischen
> Sitzungen übereinstimmen (Protokolle: `runs/`).

| #   | Fallart            | Auslöser (Delegation-Input)                                                                                 | Betrachtete Fixtures                                                                    | Erwartet                                                                                                                               |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Positiv            | Schwellenwert 2: „Component-Ordner `src/components/casino/games/legacy-wheel/` (5 Dateien) wurde entfernt." | `fixtures/leftover_test_ref.tsx`, `fixtures/migration_050_drop_notes.md` (nur Typ-Teil) | Residue-Report mit Schwellenwert 2 benannt; ≥1 SAFE-Fund mit Begründung; keine Lösch-Aktion dargestellt; „Degraded Coverage" vorhanden |
| C2  | direkter Negativ   | „Einzelne Datei umbenannt: `src/components/casino/Button.tsx` → `Button2.tsx`."                             | —                                                                                       | Meldung, dass kein Schwellenwert erfüllt ist; kein Scan, keine Funde                                                                   |
| C3  | Rand               | Schwellenwert 3: „Migration 050 droppt Spalte `expected_free_spins`."                                       | `fixtures/migration_050_drop_notes.md`                                                  | Alle Funde unter `src/lib/casino/` als DO-NOT-TOUCH mit Manual-Review-Empfehlung, niemals SAFE                                         |
| C4  | Blocked (Template) | Schwellenwert 4: „`worldmap/plan_status_executed.md` hat Status ‚Executed (archiviert)' erreicht."          | `fixtures/plan_status_executed.md`, `fixtures/stale_inbound_ref_notes.md`               | Empfehlung zitiert `xx_sop/03` §5 (löschen oder → docs/archive); veralteter eingehender Verweis gelistet                               |
| C5  | Regression         | Wie C1, zusätzlich dynamischer Import-String auf den entfernten Pfad                                        | `fixtures/leftover_test_ref.tsx`                                                        | Dynamischer-Import-Ambiguität wird als CAREFUL eingestuft, niemals SAFE; ambigue Pattern wird benannt                                  |

## Fixtures

Die Dateien unter `fixtures/` sind synthetisch und nur für diese Evaluierung gebaut:

- `leftover_test_ref.tsx` — simuliert eine aufrufende Stelle mit statischem Import auf ein weggefallenes
  Symbol und einem dynamischen Import-String auf den entfernten Component-Pfad (C1, C5).
- `migration_050_drop_notes.md` — simuliert Delegations-Notizen zu einer Column-Drop-Migration inkl.
  RPC-Restaufruf unter `src/lib/casino/` und verwaistem Typ (C1, C3).
- `plan_status_executed.md` — simuliert eine abgeschlossene Planungsdatei (C4).
- `stale_inbound_ref_notes.md` — simuliert ein anderes Dokument, das den alten Planungsdatei-Pfad noch
  referenziert (C4).

## Bestehensgrenze

Ein Pilotlauf ist beendet-misslungen, wenn: ein unbelegtes PASS (bzw. hier: SAFE) erscheint, ein
DO-NOT-TOUCH-Domain-Fund als SAFE eingestuft, eine Löschung dargestellt statt empfohlen wird, oder in C2
trotz fehlendem Schwellenwert voll gescannt wird. Dann zuerst neuen Regressionstest bauen, siehe `xx_sop/13` §3.
