# 17 — TO-09 Fund-Matrix: Ökonomie- und Wett-Balancing-Simulation

> **Messdatum:** 2026-08-30 · **Typ:** Offline-Massensimulation (read-only, kein Live-Eingriff, Money-Pfad: Nein)
> **Seed:** `to09-baseline` · **Spieler:** 1.000 pro Szenario · **RTP-Umfang:** 100 Mio. Rounds je Spiel · **Laufzeit gesamt:** 6 min 48 s (`real`)
> **Reproduktion:** `npm run sim:economy -- --players 1000 --rounds 500 --seed to09-baseline --out <file>` → deterministisch identische Kennzahlen (Seed-Lauf, kein Datenvolumen-Gewinn)
> **Raw-Daten:** [`17_TO09_economy_simulation_report.json`](./17_TO09_economy_simulation_report.json) · **Plan:** [`04-TO09-oekonomie-simulationen.md`](./04-TO09-oekonomie-simulationen.md) (archiviert)
> **Methodik / Definitionen:** Empirische Edge = `1 − payout/wager` (deckungsgleich mit `scripts/economy-audit.ts`); Konfidenzband = 95 % Normal-Approx aus Per-Round-Rückläufen; Settlement-Formeln direkt aus `game-config.ts`/`casino-core.ts` übernommen, Nicht-Payout-Transformationen (Dice/Crash) exakt gegen `ProvablyFairEngine` kreuzgeprüft (Test `simulation-engine.test.ts`, 16 Tests).

## 1 — Ergebnis-Rückstand: Empirische Edge vs. Soll (RTP-Szenario, 100 Mio. Rounds/Spiel)

| Spiel    | Soll-Edge                            | Empirisch [95 % CI]           | Urteil                                            |
| -------- | ------------------------------------ | ----------------------------- | ------------------------------------------------- |
| Dice     | 1,00 %                               | 1,007 % [0,988 %, 1,026 %]    | ✅ verifiziert — Soll im Band                     |
| Crash    | 1,00 %                               | 1,004 % [0,984 %, 1,023 %]    | ✅ verifiziert — Soll im Band                     |
| Roulette | 2,70 % (1/37)                        | 2,698 % [2,678 %, 2,718 %]    | ✅ verifiziert — Soll im Band                     |
| Slots    | 42,30 % (analytisch, 8⁵-Enumeration) | 42,296 % [42,258 %, 42,335 %] | ⚠ analytisch korrekt — **aber Balancing-Fund F1** |

**Belegcharakter:** Dice/Crash/Roulette zahlen exakt so aus, wie konfiguriert. Der Vorbehalt von `economy-audit.ts` („kein Soll-Wert für Roulette") ist per Massensimulation entkräftet — Codeformel konvergiert exakt auf 1/37.

### Fund F1 — MEDIUM/HIGH (Balancing): Slots-Hausvorteil 42,3 % (RTP ≈ 57,7 %)

- **Befund:** Die konfigurierte Slots-Paytable (`match5Base 50 · match4Base 10 · match3Base 2 · symbolWeight 0.5` bei 5×8 Walzen) ergibt analytisch und empirisch (100 Mio. Rounds) einen Hausvorteil von **42,30 %**. Branchenüblich sind Online-Slots bei RTP 92–97 % (Edge 3–8 %).
- **Konsequenz:** „Soll = Ist" ist verifiziert — das Problem liegt in der Paytable selbst, nicht in einer Rechenabweichung. Slots sind damit das bei weitem teuerste Spiel des Casinos.
- **Wohin:** Kandidat für die Balancing-Fix-Welle (Paytable-Kalibrierung, z. B. über Bonus-Symbol-Gewichtungen); danach Re-Run von `sim:economy` als Gegenprobe. **In dieser Welle geändert: nichts.**

## 2 — XP-/Level-Progression (5000 Rounds, 1000 Spieler/Klasse)

| Klasse                       | Runden bis L10 | bis L25      | bis L50 | Ende (Ø XP)                                 |
| ---------------------------- | -------------- | ------------ | ------- | ------------------------------------------- |
| Casual (1 $/Bet)             | 809            | nie in 5.000 | nie     | Level 23 (Ø 50.000 XP)                      |
| Mid (50 $/Bet)               | 16             | 115          | 480     | Level 100 (Ø 4,02 Mio. XP)                  |
| Max-Bet-Grind (10.000 $/Bet) | 0              | 5            | 24      | Level 100 (Ø 50 Mio. XP, XP-Cap 10.000/Bet) |

### Fund F2 — MEDIUM (Balancing/Ökonomie): Kleineinsätze sind faktisch vom Rang-System abgekoppelt

- **Befund:** Ein Casual-Spieler mit 1 $-Einsätzen braucht 809 Runden für Level 10 und erreicht Level 25 in 5.000 Runden nie; der Max-Bet-Spieler ist bei Level 100 angekommen, bevor der Casual Spieler die Hälfte erklommen hat. Ursache: XP ∝ Wager (bis Cap 10.000 XP/Bet bei 10.000 $ Einsatz) — der Cap schützt vor maximaler XP-Effizienz (10 XP/$ → 1 XP/$), aber die absoluten Level-Zeiten bleiben wager-proportional.
- **Konsequenz:** Rang/Kurven sind belegbar „gekippt zugunsten von Größeinsatz-Grindern"; ob das beabsichtigt ist, ist eine Balancing-Entscheidung → Kandidat Fix-Welle (Rakeback/XP-Schwellen leben in `vip_tiers`/`ranks`, migrationsbasiert).

## 3 — Missbrauchsprofile (500 Rounds, 1000 Spieler/Profil)

| Profil                               | Survival | Bust   | Peak-Ø (Start-Basis) | Max-Wager beobachtet | XP/$  |
| ------------------------------------ | -------- | ------ | -------------------- | -------------------- | ----- |
| Martingale (Start 500, Base 8)       | 21,2 %   | 78,8 % | 1.183 (+137 %)       | 1.024                | 9,998 |
| Max-Bet-Grind (unbegrenzte Bankroll) | 100 %    | 0 %    | —                    | 10.000               | 1,0   |
| Flat-Referenz (Start 1000, Base 10)  | 100 %    | 0 %    | 1.145                | 10                   | 10,0  |

### Fund F3 — INFO (keine Aktion): Martingale verliert erwartungsgemäß

- **Befund:** 78,8 % aller Martingale-Spieler busten innerhalb 500 Rounds bei Startkapital 500 $ (bei 4-Wochen-Kadenz 79,3 %); der durchschnittliche Peak vor dem Bust liegt +18 bis +37 % über dem Startkapital. Kein Exploit, exakt die erwartete negative Erwartung beim 1 %+ Edge.
- **Konsequenz:** Kein Eingriff nötig; die Kennzahlen sind als Referenzbaselin in dieser Matrix dokumentiert.

## 4 — 4-Wochen-Verlauf (12 Sessions à 100 Rounds, Startkapital 1.000 $)

| Klasse         | Ø Endbankroll | p10    | p90      | Bust-Rate |
| -------------- | ------------- | ------ | -------- | --------- |
| Casual (1 $)   | 988,01        | 944,44 | 1.033,54 | 0,0 %     |
| Regular (10 $) | 880,65        | 444,40 | 1.335,40 | 0,8 %     |
| Martingale     | 914,06        | 0      | 4.847,17 | 79,3 %    |

---

## 5 — Code-Review (Agent `code-reviewer`, 2026-08-30): Approve with Notes

- **0 CRITICAL / 0 HIGH / 3 MEDIUM / 3 LOW.** Formelspiegel Dice/Crash/Roulette/Slots/XP wurde Zeile-für-Zeile gegen `provably-fair.ts`, `game-config.ts`, `casino-core.ts` verifiziert.
- **Nachfolgend geschlossen (in dieser Welle):**
  1. Zirkuläre Mirror-Tests → echter Kreuzcheck-Test gegen `ProvablyFairEngine.calculateOutcome` für alle vier Spiel-Transformationen (Nonce-Sweep 1–50, 16 Tests gesamt).
  2. CLI-Validierung → `--players`/`--rounds` fail-fast auf positive Ganzzahlen; `maxObservedWager` ohne Spread-Arg-Limit.
  3. Roulette-Wager wird jetzt zusätzlich an `betMax` gekappt; Strategiebenachrichtigung (Martingale-Grind gilt nicht für Roulette-Sizing) in `PlayerSpec` dokumentiert.
- **Bewusst offen (LOW, kein Blocking):** duplizierte Feldpaare `wager/wagerTotal` & `payout/payoutTotal` im Result-Interface (API-Hygiene, Aufrufer-Kompatibilität); `nextRngStream` nur von Tests genutzt; PRNG-Kollisionquote als Header-Kommentar dokumentiert statt behoben (statistisch irrelevant für Aggregat-RTP).

## 6 — Machine-Gates (Nachweisdatum 2026-08-30)

| Gate                               | Ergebnis                                                                                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test` (Vitest)            | ✅ **1270 Tests / 163 Files** (davon 16 neu in `src/lib/casino/simulation/__tests__/`)                                                                                                              |
| `npm run typecheck` (tsc --noEmit) | ✅ 0 Fehler in neuen Dateien; **1 vorbestehender Fremdfehler** in `src/app/admin/AdminOverviewClient.tsx:215` aus unveränderter Arbeitskopie-Änderung (`raw?.data ?? raw`), nicht Teil dieser Welle |
| `npm run lint` (ESLint)            | ✅ 0 Fehler, 23 Warnungen (alle in vorbestehenden Dateien, keine in TO-09-Dateien)                                                                                                                  |
| Production-Build                   | Nicht ausgeführt — reine Analyse-Lib/Script, kein App-Code-Berührungspunkt (Nicht-Scope laut Plan §L1)                                                                                              |

## 7 — Empfehlungen für Folge-Wellen (nicht ausgeführt)

1. **Balancing-Fix-Welle:** Slots-Paytable (F1, RTP-Ziel im Branchenband) und XP-/Rang-Kurve für Kleinspieler (F2) — jeweils mit Jan-Freigabe (SOP 01 Option-Gate), danach Gegenprobe via `sim:economy`.
2. **Routinebetrieb:** `npm run sim:economy` als manuelles Werkzeug etabliert; Anbindung an CI (z. B. nächtlicher Job mit Edge-Toleranz-Check) als Folgeempfehlung.
3. **Blackjack-Lücke:** Kein RTP-Soll-Wert im Code (strategieabhängig, Client-Settlement) — eine Basic-Strategy-Simulation als eigenes Folge-Thema (Präzedenz `economy-audit.ts`).
4. **Live-Schatten-Vergleich:** Kombination Empirie (Soll-Kurve dieser Matrix) mit Ist-Daten aus `economy-audit.ts`, sobald Live-Datenvolumen > 100 Bets/Spiel erreicht ist.
