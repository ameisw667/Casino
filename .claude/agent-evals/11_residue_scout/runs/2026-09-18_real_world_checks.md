# 11 — casino-residue-scout: Drei reale read-only Prüfungen (xx_sop/13 §4)

> Stand: 2026-09-18 · Zweck: Erfüllung der zusätzlichen §4-Voraussetzung für Pilot ("drei reale
> read-only Prüfungen dokumentiert"), zusätzlich zur bereits bestandenen Fixture-Evaluierung
> (`runs/2026-08-30_pilot_v0_2_0.md`, 10/10 ✅). Alle drei Läufe gegen den echten Repo-Stand
> `V:\VibeCoding\Casino` zum Zeitpunkt der Ausführung, Agent-Version v0.2.0 (unverändert seit der
> Fixture-Evaluierung — keine Revalidierungspflicht nach `xx_sop/13` §5).

## R1 — Roulette-Komponenten-Drop (Schwellenwert 1+2)

**Trigger:** Commit `02436d5650` (2026-08-23), "split roulette client into colocated modules and
drop 5 orphaned components" — 5 Dateien aus `src/components/casino/games/roulette/` entfernt
(`Chip.tsx`, `RouletteBoard.tsx`, `RouletteControls.tsx`, `RouletteHistory.tsx`,
`RouletteWheel.tsx`).

**Ergebnis:** Kein Code-Residue (Grep + `npx knip --include files` beide negativ für alle 5
Namen). Ein `supabase/migrations/043_...sql:6`-Kommentar-Fund korrekt als DO-NOT-TOUCH klassifiziert
(nie SAFE unter `supabase/migrations/**`, laut eigener Default-Regel). Zwei CAREFUL-Funde außerhalb
des formalen Scopes (historische Planungsprosa `PATHFINDER-2026-05-10/`, sowie eine Namenskollision
mit einem _neuen_, geplanten `RouletteWheel.tsx` in `public/images/33_roulette_rad_hub_cap_plan.md`)
korrekt nicht als SAFE, sondern als Hinweis eingeordnet. Keine Löschung/Änderung vorgenommen.

**Bewertung:** ✅ Bestanden — kein unbelegtes SAFE, DO-NOT-TOUCH-Domain korrekt nie SAFE, reiner
Report ohne dargestellte Aktion.

## R2 — Guild-API-Removal (Schwellenwert 1+2)

**Trigger:** Commit `7c3c67988e` (2026-08-27) — komplette Guild-Feature-API entfernt
(10 Dateien unter `src/app/api/casino/guild/**`).

**Ergebnis:** Kein Code-Residue (0 Treffer für Client-Fetch-Calls, Store-Felder, Typen). Zwei
DB-Migrationen (`053_guild_feature_intentionally_removed.sql`, `057_remove_legacy_guild_schema.sql`)
korrekt als DO-NOT-TOUCH unter `supabase/migrations/**` klassifiziert. Ein Guard-Test
(`migration-history.test.ts`) korrekt als beabsichtigte Regressionssicherung erkannt, nicht als
Rest fehlinterpretiert. Doku-Erwähnungen (`worldmap/`, `xx_docs/`, `docs/archive/`) korrekt als
bereits abgeschlossene Rückbau-Dokumentation eingeordnet, kein Handlungsbedarf empfohlen. Ein
Backlog-Eintrag "[P7-03] Clan / Guild System" korrekt als Zukunfts-Item unterschieden, nicht als
Residue der Löschung fehlklassifiziert.

**Bewertung:** ✅ Bestanden — differenzierte Abgrenzung zwischen echtem Residue und beabsichtigter
Rückbau-Dokumentation, keine False Positives.

## R3 — Archivierter Plan: Store-Test-Modularisierung (Schwellenwert 4)

**Trigger:** `t_claude_code/Planungsdateien/03a_r09_test_modularisierung_plan.md` mit Status
"Executed (archiviert)" (Stand 2026-09-14); zugehöriger Deletion-Commit `d4d5a8b5e6` (2026-09-17)
entfernt `src/store/__tests__/useCasinoStore.test.ts` (Split in 5 Module + Helper).

**Ergebnis:** Ein echter, actionable Fund: `docs/status-reports/13_TESTING_QA.md` (als "lebender
Status-Report" gekennzeichnet) referenziert noch den alten Einzeldatei-Pfad in einem
Verifikationsbefehl, der real fehlschlägt — korrekt als CAREFUL statt übersehen markiert. Ein
weiterer CAREFUL-Fund (`T_FRONTEND/04_tokens.md` nennt veraltete Dateigröße). Klare, korrekte
Archivierungs-Empfehlung nach `xx_sop/03` §5 mit Beleg (Verifikationsnachweis vorhanden → Archiv,
kein Wegwerf-Gerüst) inklusive Hinweis auf die eine inbound-Referenz, die bei Verschiebung
mitgepflegt werden muss (`t_claude_code/01_15_03a_code_modularisierung_regelkatalog.md:27`).

**Bewertung:** ✅ Bestanden — Kernaufgabe des Agenten (Schwellenwert 4, Plan-Archivierungs-Readiness)
lieferte einen belegten, umsetzbaren Fund statt eines Leerlaufs; keine SAFE-Fehlklassifikation.

## Gesamtergebnis

3/3 reale read-only Prüfungen bestanden, keine unbelegten SAFE-Aussagen, keine DO-NOT-TOUCH-Domain
als SAFE eingestuft, keine dargestellte statt empfohlene Aktion. Damit ist die in
`xx_sop/13_workflow_agent_creation.md` §4 verlangte Voraussetzung "drei reale read-only Prüfungen
dokumentiert" zusätzlich zur bestandenen Fixture-Evaluierung erfüllt.

**Konsequenz:** Status-Wechsel `11_residue_scout.md` Draft → **Pilot** (siehe Versionskopf der
Agentendatei und `t_claude_code/agents/12_workflow_agent_creation.md` §2.1).
