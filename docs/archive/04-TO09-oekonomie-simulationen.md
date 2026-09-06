# 04 — TO-09: Ökonomie- und Wett-Balancing-Simulationen

> **Status:** Executed (archiviert) · **Stand:** 2026-08-30 · **Owner:** LLM (laut Auftrag ausschließlich LLM-Zuständigkeiten, keine Jan-Gates) · **Scope:** Lokale Massen-Simulation der Spiel-Mathe (Empirischer RTP je Spiel), XP-/Level-/Rang-Progression, Missbrauchsszenarien und Wochen-Ökonomie als reproduzierbare Engine + Runner-Script. **Money-Pfad: Nein** (kein DB-Write, kein Live-Eingriff, keine Konfig-Änderung an Auszahlungsparametern) · **Security-Review: Code-Review Pflicht** (security-reviewer nicht ausgelöst — keine Auth-/DB-/Input-Pfade)

## 1 — Übersicht für Jan

| Nr  | Meilenstein                                                       | Status                                                                                                             | Nächster Schritt                     | Zuständigkeit |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ------------- |
| L0  | Kontextrecherche + Planungsdatei (Diese)                          | 🟢 Executed                                                                                                        | —                                    | LLM           |
| L1  | Simulations-Engine-Lib `src/lib/casino/simulation/` + Vitest      | 🟢 Executed                                                                                                        | —                                    | LLM           |
| L2  | Runner `scripts/economy-simulation.ts` + npm-Script `sim:economy` | 🟢 Executed                                                                                                        | —                                    | LLM           |
| L3  | RTP-Massensimulation je Spiel                                     | 🟢 Executed (100 Mio. Rounds/Spiel, Dice/Crash/Roulette verifiziert; Slots-Fund F1)                                | —                                    | LLM           |
| L4  | Progressionssimulation                                            | 🟢 Executed (Fund F2: Kleinspieler-Rang-Entkopplung)                                                               | —                                    | LLM           |
| L5  | Missbrauchsszenarien + Wochen-Ökonomie                            | 🟢 Executed (F3 Martingale erwartungskomform)                                                                      | —                                    | LLM           |
| L6  | Verifikation, Code-Review, Fund-Matrix, Archivierung, TO-09 → 🟢  | 🟢 Executed (Gates grün: 1270 Tests/Typecheck/Lint 0, Code-Review „Approve with Notes"; 3 MEDIUM-Fixes integriert) | Balancing-Fix-Welle (Fund-Matrix §7) | LLM           |

Alle Zuständigkeiten liegen beim LLM (Janauftrag 2026-08-30: „ausschließlich mit LLM-Zuständigkeiten, keine Zuständigkeit bei Jan"). Finden sich **Ergebnis-Befunde** (z. B. gekippter Hausvorteil), werden **keine** Auszahlungsparameter verändert — die Fundliste ist ausschließlich Beleg und Kandidatenliste für eine separate Fix-Welle (Präzedenz: TO-04/TO-07).

## 2 — Kontext-Befund (Fakten, mit Quelle, erfasst 2026-08-30)

| Fakt                                                                                                                                                                                                                                    | Quelle                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `economy-audit.ts` vergleicht Ist-Edge aus Live-DB (`wallet_transactions`, `game_rounds`) mit Soll-Edge aus `DEFAULT_GAME_CONFIG` — aber **keine synthetischen Massenläufe**; Roulette/Blackjack ohne Soll-Wert (siehe Notes im Script) | `scripts/economy-audit.ts`                                               |
| `fraud-ml-scan.ts` rechnet Isolation-Forest über Live-Daten und **schreibt** `risk_events` — keine Offline-Simulation von Missbrauchsmustern, manueller Lauf, DB-Write                                                                  | `scripts/fraud-ml-scan.ts`                                               |
| `roulette-simulation.ts` ist der einzige Simulations-Präzedenz — ad-hoc, 3 Spins, keine Massen-/Strategie-Simulation                                                                                                                    | `scripts/roulette-simulation.ts`                                         |
| `CasinoCore.placeBet` ist offline lauffähig (Seeds werden als Parameter übergeben, kein DB-Zugriff innerhalb der Methode) — Massen-Simulation kann dieselbe Settlement-Logik benutzen                                                   | `src/lib/casino/casino-core.ts:54-157`                                   |
| Soll-Edges kodiert: Dice 1 %, Crash 1 % (Bustabit-Formel), Roulette 2.70 % via 36/Coverage-Multiplikatoren (Jan-confirmed Fix 2026-08-21), Slots via Paytable (5 Reels × 8 Symbole = 32.768 Kombinationen exakt enumerierbar)           | `src/lib/casino/game-config.ts:61-111`, `scripts/economy-audit.ts:19-32` |
| Roll-Formeln: Dice `floor(u·10001)/100` (0–100.00), Crash `u<edge→1.0` sonst `(1-edge)/(1-u)` auf 2 Dekimalen gefloort, Roulette `floor(u·37)`, Slots 5×`floor(u·8)`                                                                    | `src/lib/casino/provably-fair.ts:110-163`                                |
| XP-Formel: `floor(wager·10·levelMult)` gecappt bei 10.000 XP/Bet; LevelMult = `1+floor(level/100)` max 5; Level = `floor(sqrt(xp/100))+1` max 100                                                                                       | `src/lib/casino/game-config.ts:222-247`                                  |
| Limits: betMin 0.10, betMax 10.000, Hardcap 100.000.000                                                                                                                                                                                 | `src/lib/casino/game-config.ts:62-66`                                    |
| Rang-/Tier-Parameter (Bronze ab Level 1 / Rakeback 1 %, Silver ab Level 10 / 1.2 %, …) leben in Supabase-Tabellen `vip_tiers`/`ranks`                                                                                                   | `supabase/migrations/004_vip_tiers.sql`                                  |
| Blackjack: strategieabhängig, keine geschlossene Edge-Formel im Code (Server vertraut Client-Settlement `payout/win` aus der Blackjack-API)                                                                                             | `scripts/economy-audit.ts:224`, `src/lib/casino/casino-core.ts:66-67`    |
| Testkonvention: Colocated Vitest unter `src/lib/casino/__tests__/*.test.ts` (ca. 80 Testdateien in dieser Schicht, Repo-Scan 2026-08-30)                                                                                                | Repo-Scan 2026-08-30                                                     |

**Kernschlacke:** Empirie basiert heute ausschließlich auf Live-DB-Daten und leidet dort unter Stichprobengröße & Mix-Verzerrung; Synthetik fehlt komplett. Genau diese Lücke schließt TO-09.

## 3 — Subkategorien mit Niveau-Bewertung (Skala 1–10; 10 = Top-100%-Niveau „Routine-Läufe, belegbar, reproduzierbar, alarmfähig")

| #   | Subkategorie                                                                            | Ist | Ziel | Begründung Ist                                                                                        | Was 10 (Top-100 %) heißt                                                                 |
| --- | --------------------------------------------------------------------------------------- | :-: | :--: | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | Virtuelle-Spieler-Engine (Bankroll, Session-Loop, Strategieprofil)                      |  1  |  9   | Nur 3-Spin-Ad-hoc-Lauf (`roulette-simulation.ts`); keine Player-Abstraktion                           | N Spieler × R Runden deterministisch lauffähig, strategieparametrisiert, kein DB-Kontakt |
| 2   | Empirische RTP-Verifizierung je Spiel                                                   |  2  |  9   | Analytisch vorhanden (`economy-audit.ts` soll-Side); empirisch nur Live-Daten (klein, verzerrt)       | ≥ 1 Mio. Rounds/Spiel synthetisch, Ist-Edge mit Konfidenzintervall gegen Soll-Edge       |
| 3   | Strategie-Realismus (Dice-Target-Wahl, Crash-Cashout-Punkte, Roulette-Mix, Slots-Spins) |  1  |  8   | Keine Strategiemodelle existieren                                                                     | Realistische Nutzerverhaltensklassen (Konservativ/Normal/Aggressive) je Spiel abgedeckt  |
| 4   | Missbrauchs-/Exploit-Szenarien (Martingale, Max-Bet-Grinding, XP-Farming)               |  2  |  8   | Nur Live-Betrachtung via Fraudscan; keine synthetische Exploit-Simulation                             | Martingale-Kontostände, XP/Bet-Cap-Wirkung und Limit-Wirkung quantifiziert               |
| 5   | XP-/Level-/Rang-Progression                                                             |  2  |  8   | Formeln kodiert (`game-config.ts`), aber nie bei Massen-Nutzern ausgewertet; Rang-Schwellen nur in DB | Minuten-/Runden-Aufwand bis Level X je Einsatzverhalten messbar, Rang-Curve plotbar      |
| 6   | Wochen-/Langzeit-Ökonomie                                                               |  1  |  7   | Nichts vorhanden                                                                                      | Simulierte 4-Wochen-Verläufe je Spielerklasse mit Session-Kadenz, Trend-Kennzahlen       |
| 7   | Statistik-/Muster-Synthese (Stichproben, Varianz, Konfidenz, Fund-Schwellen)            |  1  |  8   | Nur „n/a/lowSample"-Flag in `economy-audit.ts`                                                        | Standard-Reportformat mit CI, Varianz, Ampel-Regel (Fund/ok) pro Spiel                   |
| 8   | Reproduzierbarkeit & Routinebetrieb (Seeded RNG, CLI, npm-Script, Report-Ablage)        |  3  |  9   | tsx/npm-Infra existiert; kein deterministischer Simulationslauf                                       | FixSeed → byteidentischer Report; `npm run sim:economy` dokumentiert                     |
| 9   | Testabdeckung der Simulations-/Spiel-Mathe                                              |  3  |  8   | `game-config`/`casino-core`-XP/getDice-Payouts haben Tests; Simulationsschicht neu                    | Engine-Modul ≥ 80 % Coverage, Invarianten-Tests (RTP-Grenzen, Monotonie, Fail-Closed)    |
| 10  | Doku-/Fund-Matrix-Integration (Belegbarkeit)                                            |  0  |  8   | Kein Simulationsbericht existiert                                                                     | Fund-Matrix in `docs/archive/17_TO09_*` mit Messdatum, Seed, Parametern, Fundliste       |

Priorisierung ergibt sich aus den Ist-Werten: Die Subkategorien 1, 2, 7, 8 sind die Ausführungs-Hebel dieser Welle; 3–6 sind deren Szenarien-Inhalt; 9–10 die Abschlussgates.

## 4 — Meilensteine

### L1 — Simulations-Engine-Lib `src/lib/casino/simulation/` + Vitest

- **Ziel:** Reine, lokale Simulations-Mathe, die die Settlement-Formeln 1:1 spiegelt.
- **Scope (Dateien):** `src/lib/casino/simulation/rng.ts` (mulberry32 seeded PRNG + FNV-Seed), `game-roll.ts` (Dice/Crash/Roulette/Slots-Rolls exakt aus `provably-fair.ts:110-163` gemirrort), `engine.ts` (PlayerSpec mit Strategien flat/martingale/max-bet-grind, Runden-Loop, Bankroll, XP/Level-Aggregation über `calculateXpGainWithConfig`, `calculateLevelWithConfig`, `getDiceMultiplierWithConfig`, `CasinoCore.calculateRoulettePayout`, Slots-Paytable aus `game-config.ts`/`casino-core.ts`), `statistics.ts` (Empirische Edge im selben Definitionsschnitt wie `economy-audit.ts`, 95 %-Normal-Approx-CI aus Per-Round-Statistik, Wilson-Intervall), `__tests__/simulation-engine.test.ts`.
- **Annahme (dokumentiert):** Standardmodus nutzt eigenen Seeded-PRNG mit identischen Verteilungsformeln (nicht die echte HMAC-Engine) — der HMAC-Wert ist uniform verteilt, die Formeln danach identisch; das lässt RTP unverändert, macht 100k+ Runs schnell und deterministisch. Ein `--true-engine`-Modus über `ProvablyFairEngine` dient als Stichproben-Kreuzcheck auf kleiner Stichprobe.
- **Nicht-Scope:** Blackjack-RTP (keine Edge-Formel im Code, strategieabhängig — gleiche Begründung wie `economy-audit.ts:224`), DB-Write, API-Änderungen, Änderung an `game-config.ts`/`provably-fair.ts`/`casino-core.ts` (nur lesende Nutzung).
- **Abhängigkeiten:** keine (Stand-alone Lib über bestehende Exports).
- **Verifizierung:** Vitest-Tests: (a) RTP-Monotonie/Bounds, (b) Dice-Multiplikator konsistent mit `getDiceMultiplierWithConfig`, (c) Crash-Verteilung → empirische Edge ≈ 1 % bei großer Stichprobe (seeded, daher stabil), (d) XP-Cap 10.000 je Bet & Level-Formel, (e) Martingale bricht bei betMax/Bankroll korrekt ab, (f) Determinismus: gleicher Seed → identisches Report.
- **Money-Pfad: Nein** · **Security-Review: Code-Review (post-Implementation) Pflicht.**

### L2 — Runner `scripts/economy-simulation.ts` + npm-Script

- **Ziel:** Ein Befehl, alle Szenarien, reproduzierbar.
- **Scope:** CLI-Parameter `--players` (Default 1.000), `--rounds` (Default 500), `--seed` (Default `to09-baseline`), `--scenario` (`rtp|progression|abuse|week|all`), `--json`, `--out <path>`; Ausgabe als Konsolentabelle + optional JSON-Datei. npm-Script `"sim:economy": "tsx scripts/economy-simulation.ts"` in `package.json`. Läuft vollständig offline ohne `.env.local`/Supabase (Rang-Schwellen für L4 werden als lokale Simulations-Parameter aus Migration 004 als Fallback übernommen, Herkunft dokumentiert).
- **Nicht-Scope:** DB-Zugriff, Write-Rechte, CI-Anbindung (Routinebetreis in CI als Folgeempfehlung in der Fund-Matrix, nicht in dieser Welle).
- **Verifizierung:** `npm run sim:economy -- --players 50 --rounds 100` läuft < 5 s ohne Fehler und gibt deterministisch gleiche Kennzahlen bei zweifachem Lauf.
- **Money-Pfad: Nein.**

### L3 — RTP-Massensimulation (Subkategorien 2, 3, 7)

- **Ziel:** Belegbarer Empirie↔Soll-Vergleich je Spiel.
- **Ausführung:** `--scenario rtp`: ≥ 1 Mio. Rounds je Spiel (Dice, Crash, Roulette mit Bet-Type-Mix, Slots) als Flat-Strategie; Ergebnis: Empirische Edge ± 95 %-Konfidenzintervall vs. Soll-Edge (Dice 1 %, Crash 1 %, Roulette 2.70 % [Mix-abhängig je Bet-Type referenziert], Slots analytisch aus Paytable-Enumeration wie `economy-audit.ts` `sollEdgeSlots`).
- **Fund-Schwellen:** Fund, wenn Soll-Edge außerhalb des 95 %-CI liegt (→ Balancing-Fund); sonst „verifiziert im Toleranzband".

### L4 — Progressionssimulation (Subkategorie 5)

- **Ausführung:** `--scenario progression`: Klassische Nutzersubjekte (kleine/große Einsätze, Spiele-Mix) × 1 Mio. XP-Läufe → Kennzahlen: Runden bis Level 10/25/50, XP pro Währungseinheit, Wirksamkeit des 10.000-Caps bei Max-Bets, Level-Zeiten-Verhältnis zwischen Spielerklassen. Rang-Schwellen laut `supabase/migrations/004_vip_tiers.sql` (Fallback-Parsen im Runner).

### L5 — Missbrauch + Wochen-Ökonomie (Subkategorien 4, 6)

- **Ausführung:** `--scenario abuse`: Martingale-Dice-Strategie (Startbet, Verdopplung bis betMax 10.000/bankroll-exhaust), Max-Bet-Grinding (100×10.000-Bets → XP-Farming), Low-Edge-Dice-Grinding (Target 99, 99× Einsatz-Multiplikator). Kennzahlen: Überlebenswahrscheinlichkeit, Max-Verlust-Spitzentäler, XP-Tempo vs. Flat-Spieler. `--scenario week`: 4 Wochen × Session-Kadenz (z. B. 3 Sessions/Woche à 100 Rounds) je Spielerklasse → Bankroll-Trend, Hausverlust/Woche, Bankrott-Wahrscheinlichkeit.

### L6 — Verifikation, Review, Fund-Matrix, Archivierung, Umschaltung

- **Verifikationsmatrix (Maschine):** `npm run test` (Vitest, inkl. neue Engine-Tests) · `npm run typecheck` · `npm run lint` — alle müssen grün sein. Build entfällt (keine Produktionsänderung).
- **Code-Review:** Agent `code-reviewer` über alle neuen Dateien (globale Review-Pflicht); Security-Trigger prüfen, ob `security-reviewer` ausgelöst werden muss — Erwartung: nein (keine Auth/DB/Input-Pfade).
- **Fund-Matrix:** `docs/archive/17_TO09_economy_simulation_fundmatrix.md` — Messdatum 2026-08-30, Seed, Parameter, Kennzahlen, Fundliste mit Prio-Grading (CRITICAL/HIGH/MEDIUM/LOW), Empfehlungen (z. B. CI-Anbindung, Blackjack-Soll-Modell).
- **Doku:** Diese Plan-Datei → `Executed (archiviert)` und Verschiebung nach `docs/archive/`; `T_FRONTEND/04_tokens.md`: TO-09-Zeile von 🔴 offen auf 🟢 erledigt (+ Statuszeile/§4-Wellenplan aktualisieren); Live-Status-Änderungen (falls relevant) folgen `worldmap/00_WORLDMAP_STATUS.md`.
- **Money-Pfad: Nein** (nur Doku-Edits).

## 5 — Anforderungen, Abhängigkeiten, Fehlerfälle

| Bereich              | Anforderung / Risiko                                                                           | Mitigation                                                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formel-Drift         | Simulation nutzt kopierte statt echte Formeln → Werte spiegeln nicht die Settlement-Logik      | Formeln aus `provably-fair.ts`/`game-config.ts` direkt importieren, wo exportiert; Roll-Transformations-Einheitstest gegen dieselben Ausdrücke; `--true-engine`-Kreuzcheck-Funktion einbauen |
| Performance          | `CasinoCore.placeBet` ist async + `crypto.randomUUID()` pro Bet → bei 1 Mio. Rounds zu langsam | Simulations-Lib synchron & ohne UUID-Zwang (lokale Index-IDs); async nur im `--true-engine`-Modus; Kennzahl Runtime < 2 min pro Szenario, sonst Samples reduzieren                           |
| Determinismus        | Gleicher Seed → gleiche Kennzahlen (sonst keine Reproduktionsbelege)                           | Mulberry32 mit Seed-Derivation pro (player, game, round); Test §L1-(f)                                                                                                                       |
| Stichproben-Illusion | Kleine Samples lassen Edge „kippen" ohne echten Fund                                           | Mindestsamples (≥ 100k Rounds je Spiel) + 95 %-CI als Fund-Kriterium, keine Punktschätzungen                                                                                                 |
| Slots-Enumeration    | 32.768 Kombinationen — exakt berechenbar, kein Sampling nötig                                  | Analytische Soll-Edge wie `economy-audit.ts` übernehmen statt nur empirisch                                                                                                                  |
| Blackjack-Lücke      | Keine Edge-Formel → kein RTP-Zielwert                                                          | Blacklist als Nicht-Scope dokumentieren (Präzedenz `economy-audit.ts`); Empfehlung in Fund-Matrix für spätere Strategie-Simulation                                                           |
| Windows/PS 5.1       | Lange CLI-Läufe & Piping-Probleme                                                              | Läufe mit `npm run sim:economy` (non-interactive), Output in Datei (`--out`), kein interaktives Paging                                                                                       |
| Scope-Drift          | Versuchung, Funde sofort im Config zu „fixen"                                                  | Harte Regel: Diese Welle misst nur; Balance-Änderungen sind Kandidaten der nächsten Fix-Welle (Jan-Freigabe dort laut SOP 01)                                                                |
| Test-Flakiness       | Statistische Tests könnten sporadisch grenzwertig scheitern                                    | Seeds fixiert + sehr großzügige Toleranzbänder (z. B. CI 3σ statt 95 % in Tests)                                                                                                             |
| Usage-Budget         | Massenläufe verbrauchen Ausführungszeit                                                        | Kennzahl: ein Run pro Szenario für die Fund-Matrix; Wiederrufs-/Re-Runs nur bei Fehlern                                                                                                      |

## 6 — Statusquellen & Verweise

- Planungs-SOP: `xx_sop/03_workflow_jan_planungsdateien.md` · Execution-SOP: `xx_sop/02_workflow_jan_execution.md`
- Service-Layer-Kontext: `xx_docs/05_service_layer_context.md` · SOP: `xx_sop/06_service_layer_casino.md`
- Aufgabeneintrag: `T_FRONTEND/04_tokens.md` §1 TO-09
- Präzedenz-Fund-Matrizen: `docs/archive/17_TO04_security_fundmatrix.md`, `docs/archive/17_TO07_responsive_fundmatrix.md`
- Kein Doppelstand: Die Worldmap-Status-Karte behauptet nichts über Simulationskennzahlen — Kennzahlen leben ausschließlich in der Fund-Matrix mit Messdatum.
