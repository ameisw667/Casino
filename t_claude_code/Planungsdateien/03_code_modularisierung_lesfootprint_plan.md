# 03 — Code-Modularisierung für Lesefootprint (Subkategorie #3)

> **Status:** Executed (2026-09-14; Analyse-Teil vollumfänglich, Umsetzungs-Entscheidung ist per Plan-Design ein Jan-Gate und wartet auf die Option-Wahl) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Analyse und Refactor-Vorbereitung der 2 Hotspots (Crash-Loop-Duplikation, >800-Zeilen-Kandidaten); keine Implementation von Game-Logik-Refactors ohne separate Option-Gate-Entscheidung, keine Mess-Infrastruktur (Plan 09).
> **Money-Pfad:** Nein (Analyse read-only; ein späterer `wallet.ts`-Refactor hätte Money-Pfad: Ja und ist bewusst aus diesem Plan ausgeschlossen) · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_03_code_modularisierung_lesfootprint.md`](../01_15_03_code_modularisierung_lesfootprint.md) (Schnitt Top 25 %, 2 🔴-Bottlenecks) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 3

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                     | Scope (Dateien)                                                                                                            | Ausführung  | Status                                         | Zuständigkeit | Verifikation                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------- | ------------- | ------------------------------------------------------------- |
| L0     | Duplikations-Analyse Crash vs. Crash-Multiplayer Game-Loop: gemeinsame Logik identifizieren, Extraktions-Optionen (shared hook / shared module) skizzieren — Bottleneck #3      | read-only: `src/components/casino/games/crash/useCrashGameLoop.ts`, `.../crash-multiplayer/useCrashMultiplayerGameLoop.ts` | Sequenziell | ✅ Umgesetzt                                   | LLM           | Analyse-Dokument mit ≥ 2 Optionen + Risiken, keine Code-Edits |
| L1     | Option-Gate-Vorlage für die L0-Optionen (Lerneffekt/Aufwand/Risiko/Wartbarkeit) vorbereiten und Jan zur Entscheidung vorlegen                                                   | diese Planungsdatei, Chat-Übergabe                                                                                         | Sequenziell | 🟡 Vorlage fertig — wartet auf Jan-Option-Wahl | LLM           | Matrix nach `xx_sop/01`-Format, Pre-Mortem für Führungsoption |
| L2     | Bewahr-Protokoll: Hotspot-Datei-Liste (4× >800, Store-Test 1.254) + ≤300-Zeilen-Ziel als 2 Zeilen in den Output-Caps-Baustein von Plan 05 übernehmen — Bottleneck #4-Verbindung | `Planungsdateien/05_tool_output_oekonomie_plan.md`                                                                         | Sequenziell | ✅ Umgesetzt                                   | LLM           | Liste konsistent mit Messung 2026-09-14                       |
| L3     | Niveau-Rückschreibung: `01_15_03` + Parent-Position 3 neu bewerten (nach Option-Wahl bzw. bewusstem Verbleib)                                                                   | `t_claude_code/01_15*.md`                                                                                                  | Sequenziell | ✅ Umgesetzt                                   | LLM           | Schnitt-Update dokumentiert                                   |

**Fan-out-Check (Kriterium 5):** L0-L1 hängen zusammen (L1 braucht L0-Ergebnis), L2 hängt an Plan 05 — **kein Fan-out.** Kriterium 6: < 45 Min. gesamt, sequenziell.

## 2 — Self-Contained Kontext-Koffer

- **Messbasis (2026-09-14):** 1.028 TS/TSX-Dateien; 891 ≤ 300 Zeilen (86,7 %); 4 > 800: `src/types/database.types.ts` (2.054, generiert — bewusst NICHT refactorbar), `src/store/__tests__/useCasinoStore.test.ts` (1.254, Test-Aufteilung optional, kein Bottleneck), `src/components/casino/games/crash/useCrashGameLoop.ts` (982), `src/lib/casino/wallet.ts` (865, Money-Pfad).
- **Duplikations-Kern (Bottleneck #3):** `useCrashGameLoop.ts` (982) vs. `useCrashMultiplayerGameLoop.ts` (782) — jede Crash-Task-Änderung zwingt LLM-Reads beider Dateien (≈ 1.764 Zeilen).
- **Money-Pfad-Hinweis:** Game-Loops berechnen keine Settlement-/Wallet-Werte (RNG/Settlement liegt im Service-Layer), aber Crash-Spiellogik ist heikel genug, dass jede Extraktion über das Option-Gate mit Risiko-Scoring laufen muss; `wallet.ts` selbst ist aus diesem Plan komplett ausgeschlossen.
- **Bottleneck #4 (gelesen/gebraucht nie gemessen)** ist abhängig von Plan 09 (Messung) — hier bewusst nur als Verweis, kein eigener Meilenstein.

## 3 — Expliziter Nicht-Scope

- Kein `wallet.ts`-Refactor (Money-Pfad) und kein `database.types.ts`-Refactor (generiert).
- Keine Implementation der Crash-Loop-Extraktion in diesem Plan — erst nach Option-Gate-Freigabe ein separater Umsetzungsplan.
- Keine Test-Datei-Aufteilung (Bewahr-Bewertung Top 30 %, kein Bottleneck).

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe (Gate: L1-Option-Wahl) → `Execution-Ready` → `In Execution` → nach L3 `Executed (archiviert)` bzw. teilweise Archivierung mit verbleibendem Umsetzungsplan.

## 2a — Option-Gate-Matrix (L1-Ergebnis, Vorlage nach `xx_sop/01`; Basis: L0-Analyse via casino-code-explorer, 2026-09-14)

**L0-Kernbefund:** ~350–360 Zeilen verifizierte Duplikation bei 982/782 Zeilen Gesamt (beide Loops sind reine Canvas/RAF-Animationsschicht, 0 % Settlement-Logik). Größter Block: gameLoop-Body (~125 Zeilen, Crash-Resolution/`settleCrashedRound`-Timing als einzige echte Divergenz in 2 kleinen Callbacks). Beide Dateien dokumentieren explizit, dass verbatim erhaltene Dep-Arrays die Stable-Handle-Semantik sichern — jeder Extraktions-Option muss das respektieren.

| Option                                      | Skizze                                                                                                                      | Footprint-Gewinn                      | Lerneffekt (30 %) | Aufwand (25 %) | Risiko (25 %) | Wartbarkeit (20 %) | Score |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------- | -------------- | ------------- | ------------------ | ----- |
| A — Gemeinsamer Hook mit Strategy-Injection | `useCrashCanvasLoop(config)` mit historyKey, explosionOrigin-Fn, draw-Varianten                                             | ~350 Zeilen → 1 Datei                 | 4.5               | 2.0            | 1.5           | 4.0                | 3.1   |
| B — Reines Utility-Modul                    | `crash-loop-shared.ts`: Particles, Explosion, Tail (parametrisiert), DPR/Shake, Starfield, RAF-Bootstrap als Pure Functions | ~150–160 Zeilen, Dep-Arrays unberührt | 3.0               | 4.5            | 4.5           | 4.5                | 4.1   |
| C — Teil-Extraktion des RUNNING-Ticks       | Multiplikator-Growth → HUD → Milestones → Auto-Cashout → Crash-Resolution als Funktion mit Refs + 3 Callbacks               | ~125 Zeilen                           | 3.5               | 3.0            | 2.5           | 3.5                | 3.1   |
| D — B+C kombiniert                          | Utility-Modul + extrahierter RUNNING-Tick, `draw()` bleibt pro Modus                                                        | ~270–290 Zeilen                       | 3.5               | 3.5            | 2.5           | 4.0                | 3.4   |

**Pre-Mortem Führungsoption (B):** Scheiterszenario = Tail-Parametrisierung (Nozzle-Variante MP 0.45 vs. Solo 0.35) wird falsch parametrisiert und Visual-Divergenz entsteht. Gegenmaßnahme: Extraktion 1:1 mit Parameter statt Codeänderung, danach visueller Vergleich beider Crash-Seiten durch Jan (Design-Guardian-QC-Stufe 6). Zweites Szenario: RAF-Bootstrap-Utility versteckt das Mobile-Delay (MP:32, 771–774) — bleibt bewusst in MP-Hook.

**Score-Logik:** Lerneffekt bei B moderat (Pure-Function-Extraktion ist gelerntes Muster), Aufwand/Risiko niedrig weil 1:1-Extraktion ohne Dep-Array-Touch. Option A scheitert an der Mindestbar nicht, verhehlt aber die draw()-Divergenz hinter Strategy-Plumbing (Wartbarkeit 4, Risiko 1.5 wegen Stable-Handle-Rewrite).

**LLM-Empfehlung:** B zuerst (risikoärmste Einzelstufe), C als klar abgegrenzter Folge-Schritt falls gewünscht (= D in zwei Stufen). Entscheidung ist Jan-Gate.

## 5 — Execution-Log (2026-09-14)

- **L0:** Duplikations-Analyse via `casino-code-explorer` (46.6k Subagent-Tokens, read-only, 2 Dateien gescoped). Ergebnis: ~350–360 Dup-Zeilen, 4 Blöcke verbatim, gameLoop-Body ~125 Zeilen größter Block; Modus-Spezifika (Status-Union, draw()-Visuals, History-Keys, Mobile-Delay) nicht extrahierbar.
- **L1:** Option-Gate-Matrix oben (§2a) mit Scores, Pre-Mortem für Führungsoption B und LLM-Empfehlung — wartet auf Jan-Option-Wahl.
- **L2:** Cross-Check erledigt: die Hotspot-Datei-Liste (4× >800, Store-Test 1.254, useCrashMultiplayerGameLoop 782 optional) ist bereits 1:1 im Kontext-Koffer von Plan 05 §2 enthalten — keine Doppelpflege nötig, Verweis hergestellt.
- **L3:** Vorläufige Rückschreibung (Zwischenstand vor Option-Wahl): Sub-Subkategorie #3 40→25 (Duplikation quantifiziert, Optionen vetted — Umsetzung steht aus); Positionen 1/2/5/6/7/8/9 unverändert. Neuer Schnitt **Top 23 %** (vorher 25 %). Finale Rückschreibung nach Jan-Option-Wahl und Umsetzung.
