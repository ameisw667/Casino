# 05 — TO-04 Fix-Welle: Behebung der 3 CRITICAL-Funde (C1/C2/C3)

> **Status:** Executed (archiviert) · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Kodierung der drei CRITICAL-Funde aus [`docs/archive/17_TO04_security_fundmatrix.md`](./17_TO04_security_fundmatrix.md) — C1 (Roulette-Einsatz/Settlement-Entkopplung), C2 (Solo-Crash-`crashPoint`-Reveal), C3 (MP-Crash-Nach-Crash-Cashout) inkl. Client-Anpassungen, Tests und Verifikation. Keine Migrations-Änderungen, keine RPC-Definitionen, kein Remote/Deploy, kein Commit.
> **Freigabe:** Jan hat die Fix-Umsetzung im Session-Prompt vom 2026-08-29 ausdrücklich beauftragt („die drei Criticals umsetzen / mit Workflow-Jan-Execution umgesetzt"). **Money-Pfad: Ja** (Wertungskette Crash/Roulette) → Security-Review-Pflicht erfüllt (security-reviewer + code-reviewer über den Diff, Funde behoben; dabei zusätzlich der `crashed_at`-Mid-Flight-Leak geschlossen), aber weder RPC- noch RLS-Änderung (Klasse K3 Route-/Service-Layer, keine K4-Datenbankfreigabe nötig). Alle Zuständigkeiten beim LLM; keine Jan-Aufgaben.
> **Ursprung:** [`T_FRONTEND/04_tokens.md`](../../T_FRONTEND/04_tokens.md) TO-04 (erledigt) + Fund-Matrix CRITICALs.
> **Ergebnis (2026-08-29):** Alle drei Criticals implementiert und verifiziert — Gates grün: **1220 Tests / 157 Dateien** (inkl. neuer Test-Datei `src/lib/casino/__tests__/to04-critical-fixes.test.ts` mit statischen Assertions und 7 verhaltensbasierten Fair-Window-Fällen), `npm run typecheck` clean, `npm run lint` 0 Fehler (20 Warnungen vormessentlich), `npm run build` erfolgreich. Bekannte bewusste Trade-offs und offene Punkte: Solo-Crash-Flight-Ceiling 100× (History/Zeitanzeige zeigt am Ceiling bis zur Snap-Auflösung den Deckenwert, ~1 % der Runden), Client-Clock-Sync beim MP-Crash (Fair-Window nutzt ausschließlich Server-Zeit; sehr knappe legitime Claims im 100-ms-Druckfenster werden entwertet), OpenAPI-Doku-Drift `{data}`-Envelope (vormessentlich), `src/app/games-2/page.tsx` (ungetrackt) erhielt einen Einzeilen-Fix des doppelten `overflowX`-Properties, weil er den gemeinsamen Build blockierte.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                      | Status      | Nächster Schritt | Zuständigkeit |
| ------ | -------------------------------------------------------------------------------- | ----------- | ---------------- | ------------- |
| F0     | Kontext: Funde + betroffener Code (Route, CasinoCore, crash-round, Client) lesen | 🟢 Executed | —                | LLM           |
| F1     | C1: `totalStake` serverseitig erzwingen + Jedeinzelwette-Hardcap                 | 🟢 Executed | —                | LLM           |
| F2     | C2: `crashPoint` aus START_CRASH-Response entfernen + Client ohne Vorab-Reveal   | 🟢 Executed | —                | LLM           |
| F3     | C3: MP-Crash-Cashout serverautorisiert (Fair-Window gegen Rundenuhr)             | 🟢 Executed | —                | LLM           |
| F4     | Regressionstests je Fix (TDD-Charakter: neuer Test fällt ohne Fix aus)           | 🟢 Executed | —                | LLM           |
| F5     | Verifikationstorbogen (typecheck, lint, gezielte Tests, Build)                   | 🟢 Executed | —                | LLM           |
| F6     | Doku-Abschluss: Fund-Matrix-Status, Tokens-Zeile, Archivierung dieses Plans      | 🟢 Executed | —                | LLM           |

## 2 — Detail-Blöcke

### F1 — C1 (Roulette)

- **Ziel:** Server rechnet die Wette; Σ(Einzel-Einsätze) = Regelmaßstab. Kein Weg, Einzeleinsätze zu entkoppeln.
- **Umgesetzt:** `src/app/api/casino/bet/route.ts` — Gate für `gameType === 'ROULETTE'` vor Seed-Verbrauch/Settlement: `totalStake` serverseitig per `reduce` + Cent-Rundung; `!bets`/leer → 400, `|totalStake - amount| > ROULETTE_STAKE_TOLERANCE (0.005, Float-Rauschen)` → 400 `VALIDATION_FAILED`, Einzelbet > `maxBetHardcap` → 400 `BET_LIMIT_EXCEEDED`.

### F2 — C2 (Solo-Crash-Reveal)

- **Ziel:** Server behält `crashPoint` bis Rundenende; Reveal nur im CASHOUT/RESOLVE-Settlement (analog `toPublicRoundState` FR5).
- **Umgesetzt:** `crashPoint` aus der `START_CRASH`-Response entfernt (Regressionstest pinnt den Response-Block per Assertion fest). Client `src/app/games/crash/page.tsx` reitet die deterministische Kurve bis `SOLO_CRASH_FLIGHT_CEILING_MULTIPLIER = 100` (~25 s, ~1 % der Runden; kein Cashout über den Ceiling ⇒ RESOLVE zahlt 0 — ökonomisch unverändert) und snappt HUD/History/`processGameResult` auf den serverrevealten Punkt.

### F3 — C3 (MP-Crash-Nach-Crash-Cashout)

- **Ziel:** Cashout-Auszahlung ausschließlich gegen die Server-Rundenuhr autorisiert, nie allein auf den Client-Claim.
- **Umgesetzt:** Neue Pure-Function `isWithinCrashCashoutFairWindow()` in `src/lib/casino/crash-round.ts` mit 3 Toren („Flug gestartet“ — schließt 1.00×-Refund/XP-Farm im Wettfenster; „Latenz-Grace 1000 ms“ — schließt Spät-Claims; „Press-Margin 100 ms vor `crashed_at`“ — schließt den Reveal-Snipe auf den exakten Crash-Punkt). Route `bet-crash-multiplayer/route.ts` stampft `requestArrivalMs` vor allen awaits und koppelt `won` an die Fair-Window-Prüfung. **Review-Fund mitbehoben:** `crashed_at` wird in `toPublicRoundState()` bis CRASHED maskiert (war als `bettingEndsAt + durationMsForCrashPoint(crashPoint)` mid-flight invertierbar); keine legitimen Client-Konsumenten.

### F4–F6

- Neue Test-Datei `src/lib/casino/__tests__/to04-critical-fixes.test.ts` (statische Assertions auf Guard-Präsenz/Reihenfolge + 7 verhaltensbasierte Fair-Window-Fälle inkl. Fail-closed bei NaN) und erweiterte `crash-round.test.ts` (RUNNING maskiert `crashedAt`); Suites grün.
- TDD-Gate je Fix erfüllt (Tests fielen vor dem Fix rot), danach Verifikationstorbogen: volle Suite, typecheck, lint, `CI=true npm run build` — alles grün.
- Doku: Fund-Matrix §1a (Fix-Status + Review-Ergebnis), Tokens-Zeile erweitert, dieser Plan archiviert.

## 3 — Verwandte Artefakte

Fund-Matrix: [`docs/archive/17_TO04_security_fundmatrix.md`](./17_TO04_security_fundmatrix.md) · SOP 02: [`xx_sop/02_workflow_jan_execution.md`](../../xx_sop/02_workflow_jan_execution.md) · SOP 03: [`xx_sop/03_workflow_jan_planungsdateien.md`](../../xx_sop/03_workflow_jan_planungsdateien.md) · Ursprungs-Review: [`04-TO04-zero-trust-sicherheitswelle.md`](./04-TO04-zero-trust-sicherheitswelle.md)
