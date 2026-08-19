# 01 — Live Progressive Jackpot (kombiniert Phase-3 3.3 Pool + 3.4 Anzeige)

> **Status:** In Execution (L1–L5 🟢 Executed, L6 🟡 Lasttest FAIL — Jan-Entscheidung zu Klärungspunkt 8 offen) · **Stand:** 2026-08-18 · **Owner:** LLM (Planung + Execution + Security-Review-Agent) · Jan: Klärungspunkt 8 (L6-Performance) + Freigabe-Gate vor Remote-Push/Merge · **Scope:** Serverautoritativer, Cross-Game Jackpot-Pool (Contribution + Zufalls-Trigger + Auszahlung) und dessen Live-Anzeige auf der Startseite. Ersetzt den bestehenden Client-Platzhalter (`useJackpotStore`, `Math.random()`-Increment). Keine neue Spielart, kein Redesign bestehender Wettmechanik, keine Änderung der vier statischen Stat-Kacheln neben dem Jackpot-Betrag.

## 1 — Übersicht für Jan

| Nummer | Kategorie/Meilenstein                                       | Status                          | Nächster Schritt                                                                                              | Zuständigkeit                               |
| ------ | ----------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| L1     | `jackpot_pool`-Tabelle + Bootstrap                          | 🟢 Executed                     | Keiner — Migration `032_progressive_jackpot_pool.sql` lokal angewendet und verifiziert (2026-08-18)           | LLM                                         |
| L2     | Contribution-RPC (in bestehende Settlement-RPCs integriert) | 🟢 Executed                     | Keiner — Migration `033_progressive_jackpot_contribution.sql`, Security-Review APPROVE (2026-08-18)           | LLM                                         |
| L3     | Trigger-RPC (Zufallsgewinn + Reset + Auszahlung)            | 🟢 Executed                     | Keiner — Migration `034`, CRITICAL+HIGH-Befund im Review gefunden UND behoben, Re-Review APPROVE (2026-08-18) | LLM                                         |
| L4     | `GET /api/casino/jackpot` (Read-Endpoint)                   | 🟢 Executed                     | Keiner — Migration `035`, live gegen laufenden Dev-Server verifiziert (2026-08-18)                            | LLM                                         |
| L5     | Frontend-Anzeige ersetzt Platzhalter                        | 🟢 Executed                     | Keiner — Hook komplett neu, Security-Review APPROVE + 3 LOW-Fixes, live im Browser bestätigt (2026-08-18)     | LLM                                         |
| L6     | Lasttest + Gesamt-Go-Live-Gate                              | 🟡 In Execution — Lasttest FAIL | Jan-Entscheidung nötig (Abschnitt 3, L6) — Klärungspunkt 8, bevor Remote-Push/Merge angefragt werden          | Jan (Entscheidung) + LLM (Umsetzung danach) |

**Ampel:** 🔴 Geplant = nicht gestartet · 🟡 In Execution = gestartet, nicht verifiziert · 🟢 Executed = verifiziert abgeschlossen.

**Zuständigkeits-Prinzip (2026-08-18, auf Jans Wunsch verschärft):** Planung, Implementierung, Tests, Lasttest und der Einsatz des Security-Reviewer-Agents sind vollständig LLM-Aufgabe — inklusive des Behebens von CRITICAL/HIGH-Befunden aus dem Security-Review, ohne Jan dafür einzubeziehen. Jans Zuständigkeit reduziert sich auf genau zwei Freigaben in L6, weil beides laut den globalen Safety-Regeln (hard-to-reverse, wirkt auf geteilte Systeme) grundsätzlich nicht autonom ausgeführt werden darf: **(1)** Migration gegen die Remote-Supabase-Instanz pushen (`supabase db push`, siehe CLAUDE.md-Supabase-Sektion: „push to remote only when confirmed"), **(2)** Merge/Push der fertigen Änderung nach `main`. Beide Freigaben sind Ja/Nein-Bestätigungen, kein Review-Aufwand.

**Bestätigte Parameter (2026-08-18):** `contribution_rate = 0,25 %` · `win_probability ≈ 1/10.000 je Bet` · Startbetrag `1.000 $` · Lasttest-Schwelle `< 10 % p95` · Contribution-Ort: ausschließlich Postgres-RPC · Trigger-RNG: Seed-Chain Provably-Fair · L5-Update: Polling zuerst, Realtime als Folgeschritt. Details je Level unten, vollständige Tabelle in Abschnitt 4.

**Money-Pfad-Übersicht:** L1 (Struktur, kein aktiver Fluss) · L2 Ja · L3 Ja (höchste Kritikalität) · L4 Nein (Read-only) · L5 Nein (reine Anzeige) · L6 Nein (Testinfrastruktur). Security-Review Pflicht für L2, L3 und als Go-Live-Gate vor L5 — jeweils vollständig LLM-geführt (Agent-Einsatz + Befundbehebung), kein Jan-Aufwand.

---

## 2 — Kontext & Ausgangslage

- **Ist-Zustand:** [`src/hooks/useProgressiveJackpot.ts`](../src/hooks/useProgressiveJackpot.ts) — Zustand-Store (`useJackpotStore`) mit hartkodiertem Startwert `1489360.36`, erhöht sich per `setInterval` alle 2s um einen Zufallswert (`Math.random() * 2.45 + 0.15`). Rein clientseitig, kein Server-, kein Bet-Bezug. [`src/components/home/ProgressiveJackpotSection.tsx`](../src/components/home/ProgressiveJackpotSection.tsx) konsumiert nur `formatted` aus diesem Hook.
- **Soll-Zustand:** `jackpot_pool` als serverautoritative Singleton-Tabelle, gespeist durch einen Prozentsatz jedes erfolgreich abgeschlossenen Bets über alle 5 Spiele (Dice, Slots, Roulette, Crash, Blackjack), mit Zufalls-Trigger-Auszahlung an den auslösenden Spieler. Anzeige lädt den echten Wert und zeigt Änderungen live, ohne beim Refresh zurückzuspringen.
- **Warum kombiniert statt nur 3.4:** Laut `worldmap/05_ZUKUNFTSPLANUNG.md` (P25/3.4) hat die Anzeige-Initiative **keine eigenen DB-Objekte** und die Abhängigkeit „3.3 zwingend" ist explizit vermerkt — die dort geforderte Verifizierung (Refresh-/Multi-Client-/Realtime-Fallback-Test) ist ohne echten Pool nicht durchführbar. Jan-Entscheidung im Chat vom 2026-08-18: Option „A — 3.3+3.4 kombiniert".
- **Verworfene Alternativen:** Nur-Backend (3.3 solo) liefert keinen für Jan sichtbaren Fortschritt; Nur-Frontend-Contract (3.4 solo) würde einen Platzhalter beibehalten, der laut Risiko-Register R25 der Marker-Datei genau die Gefahr birgt, die diese Initiative beheben soll (persistierender Anschein ohne echte Persistenz).

---

## 3 — Level-Detailplan

### L1 — DB-Fundament: `jackpot_pool`-Tabelle + Bootstrap 🟢 Executed (2026-08-18)

- **Ziel:** Singleton-Tabelle für den aktuellen Pool-Stand als Grundlage für alle weiteren Level.
- **Nutzen:** Ohne diese Tabelle ist keine der in der Marker-Datei geforderten 3.4-Verifizierungen durchführbar.
- **Scope (umgesetzt):** [`supabase/migrations/032_progressive_jackpot_pool.sql`](../supabase/migrations/032_progressive_jackpot_pool.sql) — Nummer 032 vergeben (nächste nach `031_seed_vippro_promo_code.sql`, keine Kollision, R7 geprüft).
- **Tabellenentwurf:**
  | Spalte              | Typ                                                | Zweck                                                                                                                                                                                                                                                      |
  | ------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `id`                | `smallint primary key default 1`, `check (id = 1)` | erzwingt Singleton-Zeile                                                                                                                                                                                                                                   |
  | `current_amount`    | `numeric(14,2) not null`                           | aktueller Pool-Stand                                                                                                                                                                                                                                       |
  | `seed_amount`       | `numeric(14,2) not null`                           | Reset-Referenzwert nach Gewinn                                                                                                                                                                                                                             |
  | `contribution_rate` | `numeric(5,4) not null`                            | Anteil je Bet, z. B. `0.0025`                                                                                                                                                                                                                              |
  | `win_probability`   | `numeric(9,8) not null`                            | Trigger-Wahrscheinlichkeit je Bet                                                                                                                                                                                                                          |
  | `last_won_at`       | `timestamptz`                                      | zuletzt gewonnen                                                                                                                                                                                                                                           |
  | `last_winner_id`    | `TEXT references public.users(id)`                 | intern, nie im Public-Read-Contract (siehe L4); `TEXT` korrekt, da `public.users.id` selbst `TEXT` ist (Clerk-ID oder `auth.users.id::text`, siehe `001_users.sql`/`008_supabase_auth_bridge.sql`) — ursprüngliche `uuid`-Annahme bei Umsetzung korrigiert |
  | `updated_at`        | `timestamptz not null default now()`               |                                                                                                                                                                                                                                                            |
- **Bootstrap:** idempotentes `insert ... on conflict (id) do nothing` mit `seed_amount = current_amount = 1000.00`, `contribution_rate = 0.0025`, `win_probability = 0.0001` (bestätigt 2026-08-18, siehe Abschnitt 4). Bewusst **nicht** der bisherige Fantasiewert `1489360.36` aus dem Platzhalter — der wäre ein unbelegter Betrag, den die Datenbank dann fälschlich als real bestätigen würde.
- **Datenklassen:** nur aggregierter Geldwert + `last_winner_id`-Referenz. Keine Einzel-Contribution-Beträge, keine Bet-Historie in dieser Tabelle.
- **Money-Pfad:** Ja (neue Tabelle), aber in L1 noch kein aktiver Schreibzugriff durch den Bet-Pfad — reine Struktur.
- **Security-Review:** Nein für L1 selbst (nur DDL, kein RPC aktiv), Pflicht ab L2.
- **Freigabe-Gate:** erledigt — `contribution_rate`, `win_probability` und Startwert von Jan am 2026-08-18 bestätigt (Abschnitt 4).
- **Verifizierung — durchgeführt 2026-08-18:** `npx supabase db push --local` fehlerfrei angewendet; Bootstrap-Werte per Query bestätigt (`current_amount=1000.00`, `contribution_rate=0.0025`, `win_probability=0.00010000`); Idempotenz-Test bestanden — `current_amount` manuell auf `4242.42` gesetzt, erneuter Bootstrap-Insert ergab `INSERT 0 0` (Konflikt korrekt ignoriert, Wert blieb unverändert), danach zurückgesetzt; Grant-Check bestätigt `service_role` hat **keine** direkten Tabellenrechte (nur `TRUNCATE`/`REFERENCES`/`TRIGGER`) — identisches Muster wie das produktive `risk_events` (Zugriff ausschließlich über künftige `SECURITY DEFINER`-Funktionen in L2/L3).
- **Abhängigkeit:** keine.
- **Nicht-Scope:** keine Änderung an `users` oder `wallet_transactions`-Schema in diesem Level.

### L2 — Contribution-RPC: Integration in bestehende Settlement-RPCs 🟢 Executed (2026-08-18)

- **Ziel:** Jeder erfolgreich serverseitig abgeschlossene Bet erhöht `jackpot_pool.current_amount` um `amount * contribution_rate`, atomar im selben DB-Write wie das Settlement.
- **Nutzen:** Einziger Punkt, an dem echtes Geld in den Pool fließt — muss daher im bestehenden Advisory-Lock-/Idempotenz-Pattern liegen, nicht daneben.
- **Scope (umgesetzt):** [`supabase/migrations/033_progressive_jackpot_contribution.sql`](../supabase/migrations/033_progressive_jackpot_contribution.sql). Neue Helper-Funktion `jackpot_pool_contribute(p_bet_amount)` — ein einziges atomares `UPDATE jackpot_pool SET current_amount = current_amount + ... WHERE id = 1` (kein separates `SELECT ... FOR UPDATE` nötig, Security-Review bestätigt: die Ein-Statement-UPDATE ist bereits lost-update-sicher). Aufgerufen aus `settle_game_round()` und `advance_blackjack_round()` (nur bei `p_settled = true`, Basis: Gesamteinsatz inkl. `p_additional_bet`). Kein neuer Lock-Mechanismus — läuft unter dem bereits gehaltenen Advisory-Lock der jeweiligen Funktion (Risiko R1 der Marker-Datei: „kein neues Muster erfinden").
- **Kritischer Befund bei der Umsetzung:** `settle_game_bet` existiert als **zwei Overloads**. Die 8-Parameter-Version aus `007`/`010` ist toter Code — `WalletService.settleBet()` (`wallet.ts:113`) ruft immer mit `p_server_seed_hash`/`p_nonce` auf und trifft damit ausschließlich die 10-Parameter-Version aus `019_seed_chain.sql`. Der Contribution-Aufruf wurde deshalb in die tatsächlich aktive 10-Parameter-Version eingefügt; die tote 8-Parameter-Version bleibt unverändert (kein sinnloser Contribution-Code in unerreichbarem Pfad). Nebenbefund dabei: die 10-Parameter-Version nutzt noch den hartkodierten `/100`-XP-Divisor statt `casino_xp_level_divisor()` (Migration 019 basierte auf 014, nicht auf dem 010-Fix) — außerhalb des Jackpot-Scopes, daher **nicht mitkorrigiert**, sondern als separater Hinweis an Jan ausgelagert (`task_d4d3cc04`, Chip im UI).
- **Architektur-Befund — bestätigt 2026-08-18:** Die Formulierung in `05_ZUKUNFTSPLANUNG.md` P16 („`placeBet()` erhält Jackpot-Contribution-Hook") trifft nicht exakt zu. [`casino-core.ts:placeBet()`](../src/lib/casino/casino-core.ts) ist reine RNG-/Payout-Berechnung ohne DB-Zugriff; der atomare Schreibpfad läuft über `WalletService` → `settle_game_bet`/`settle_game_round` ([`wallet.ts:113`](../src/lib/casino/wallet.ts), `wallet.ts:222`). Jan hat bestätigt: Contribution ausschließlich in der Postgres-RPC, `casino-core.ts` bleibt unangetastet.
- **Race-Bedingung:** `current_amount` ist eine Singleton-Zeile, potenziell von jedem gleichzeitigen Bet aus jedem Spiel geschrieben — höchste Kontentionsfläche der gesamten Roadmap (Risiko R4 der Marker-Datei). `SELECT ... FOR UPDATE` serialisiert Schreibzugriffe bewusst; Auswirkung auf die Settlement-Latenz wird in L6 gemessen, nicht angenommen.
- **Neue DB-Objekte:** keine zusätzliche Tabelle — neue Logik in bestehenden RPCs.
- **Money-Pfad:** Ja.
- **Security-Review — durchgeführt 2026-08-18:** **APPROVE**, keine CRITICAL/HIGH-Befunde. Zwei LOW/informationelle Hinweise ohne Fix-Pflicht: (1) `jackpot_pool` ist als Singleton-Zeile ein globaler Serialisierungspunkt über alle Settlements hinweg — bei aktueller Last unkritisch, Beobachtungspunkt für L6-Lasttest; (2) würde die Pool-Zeile je fehlen, würde die `UPDATE ... WHERE id=1` still no-oppen statt Fehler zu werfen — bei Bedarf künftig per Monitoring auf `updated_at`-Staleness absichern, kein Blocker.
- **Verifizierung — durchgeführt 2026-08-18:** Lokal gegen alle drei Settlement-Pfade getestet (DICE über die echte 10-Parameter-RPC, CRASH über `settle_game_round`, BLACKJACK über `advance_blackjack_round` inkl. Double-Down-Additional-Bet) — jeweils korrekter Contribution-Betrag (`bet_amount × 0,25 %`, korrekt gerundet). Idempotenz bestätigt: replayte `request_id` liefert `replayed:true` und contributed kein zweites Mal. Nicht-settelte Blackjack-Zwischenaktion (Hit ohne Settlement) contributed korrekt **nicht**. `wallet-ledger-invariants.test.ts` bleibt grün (2/2).
- **Abhängigkeit:** L1.

### L3 — Trigger-RPC: Zufallsgewinn + Reset + Auszahlung 🟢 Executed (2026-08-18)

- **Ziel:** Mit `win_probability` je Bet wird der Pool zufällig an den auslösenden Spieler ausgezahlt; Pool resettet danach auf `seed_amount`.
- **Scope (umgesetzt):** [`supabase/migrations/034_progressive_jackpot_trigger.sql`](../supabase/migrations/034_progressive_jackpot_trigger.sql) — `jackpot_pool_contribute()` (033) ersetzt durch `jackpot_pool_settle(p_user_id, p_bet_amount, p_jackpot_roll)`, die im selben `UPDATE` contributed und den Roll gegen `win_probability` prüft. Aufgerufen aus allen drei Settlement-Pfaden (`settle_game_bet` 10-Parameter-Version, `settle_game_round`, `advance_blackjack_round` nur bei `p_settled=true`), gleiche Migration, keine zusätzliche Transaktion.
- **Roll-Übertragung ohne neuen RPC-Parameter (Architektur-Entscheidung bei Umsetzung):** Ein neuer Pflichtparameter hätte laut dem L2-Fund erneut einen unerreichbaren Overload riskiert. Stattdessen trägt das bereits bestehende, flexible `p_result`-JSONB-Feld ein zusätzliches `jackpotRoll`-Feld; die RPC liest es per `(p_result->>'jackpotRoll')::numeric` und entfernt es per `(p_result - 'jackpotRoll')` wieder, bevor `p_result` in Response oder `game_rounds.state` landet.
- **Auszahlungsmuster:** folgt dem bestehenden Credit-Pattern aus `redeem_promo_code()` ([`021_promo_codes.sql:83-99`](../supabase/migrations/021_promo_codes.sql)): `UPDATE users SET balance = balance + jackpotWin`, Ledger-Eintrag in `wallet_transactions` mit `type = 'jackpot_win'`.
- **Provably-Fair-Konsistenz — umgesetzt:** `ProvablyFairEngine.getJackpotRoll()` (neu, `provably-fair.ts`) — HMAC über dieselbe Seed-Kette wie das jeweilige Spiel, aber domain-separiert (`clientSeed + ':jackpot'`), damit der Roll kryptographisch unabhängig vom Spielergebnis ist, aber weiterhin deterministisch/nachprüfbar aus demselben Seed-Tripel bleibt. Für CRASH/BLACKJACK (persistente Runden mit dem geteilten, weiterhin aktiven Chain-Seed) läuft das Lesen des rohen Seeds ausschließlich über den neuen `WalletService.computeRoundJackpotRoll()` — nicht direkt im Route-Handler, wegen eines bestehenden Security-Contract-Tests (`seed-chain-security-surface.test.ts`), der genau das verbietet. `clientSeed` wird dafür neu in `game_rounds.state` persistiert (Rundenstart CRASH/BLACKJACK).
- **⚠️ Kritischer Security-Fund bei der Erstprüfung (2026-08-18), behoben und re-verifiziert:**
  1. **CRITICAL (vorbestehend, durch diese Initiative verschärft):** `publicState()` in `blackjack/route.ts` entfernte `serverSeed`/`clientSeed` nicht aus der `gameState`-Antwort — jede normale Blackjack-Aktion (Hit/Stand/Double/Split/Deal) gab den rohen, geteilten, weiterhin aktiven Server-Seed an den Client zurück. Da dieser Seed über alle 5 Spiele geteilt wird, hätte das jeden zukünftigen Wurf/jede Runde für den betroffenen Account vorhersagbar gemacht — vollständiger Fairness-Bruch, echter Exploit-Pfad. **Fix:** `publicState()` entfernt jetzt `serverSeed`/`clientSeed` an der einen Stelle, die jede Blackjack-Antwort durchläuft.
  2. **HIGH:** `settle_game_round` schrieb den ungestrippten `jackpotRoll`-Wert dauerhaft in `game_rounds.state` (nur die Client-Antwort war gestrippt). **Fix:** Strip auch beim State-Merge.
  - Beide Funde wurden noch vor Verlassen des lokalen Stacks behoben; Re-Review durch denselben Agenten bestätigt beide Fixes als vollständig wirksam (inkl. Experiment: Fix zurückgerollt → neue Tests schlagen korrekt fehl → Fix wiederhergestellt → alle Tests grün). Neue Testdatei: [`src/lib/casino/__tests__/jackpot-trigger.test.ts`](../src/lib/casino/__tests__/jackpot-trigger.test.ts) (12 Tests: Determinismus/Domain-Separation des Rolls, `publicState`-Stripping inkl. JSON-Containment-Check, statische Migrations-Assertions).
- **Money-Pfad:** Ja — höchste Kritikalität der Initiative (Auszahlung an einen einzelnen User aus einem Cross-User-Pool).
- **Security-Review — durchgeführt 2026-08-18:** Erstprüfung fand CRITICAL+HIGH (oben), beide behoben, Re-Review-Verdikt „genuinely resolved, no new issues introduced". LLM hat beide Runden ohne Jan-Zeitaufwand selbst durchgeführt.
- **Verifizierung — durchgeführt 2026-08-18:** Lokal gegen alle drei Settlement-Pfade getestet: Contribution ohne Trigger (hoher Roll), erzwungener Gewinn (niedriger Roll) inkl. korrektem Reset auf `seed_amount` und gesetztem `last_winner_id`/`last_won_at`, Idempotenz bei repliziertem Request (kein doppelter Payout/Reset) — jeweils für DICE (10-Parameter-RPC) und CRASH; Contribution-Mechanik zusätzlich für BLACKJACK bereits in L2 verifiziert. 671/671 Tests grün, `tsc`/`eslint` sauber.
- **Abhängigkeit:** L2.

### L4 — Read-Endpoint: `GET /api/casino/jackpot` 🟢 Executed (2026-08-18)

- **Ziel:** Öffentlicher, nicht-authentifizierter Read-Endpoint liefert den aktuellen Pool-Stand.
- **Scope (umgesetzt):** [`supabase/migrations/035_progressive_jackpot_public_read.sql`](../supabase/migrations/035_progressive_jackpot_public_read.sql) — neue `SECURITY DEFINER`-Funktion `get_jackpot_pool_public()` (analog `get_community_stats`), da `jackpot_pool` wie `risk_events` kein direktes `service_role`-Tabellen-Grant hat — Zugriff ausschließlich über diese eine, feldbegrenzte Funktion. [`src/app/api/casino/jackpot/route.ts`](../src/app/api/casino/jackpot/route.ts) (neu, Vorlage [`src/app/api/community/route.ts`](../src/app/api/community/route.ts) — kein Auth, `Cache-Control: private, no-store`). `src/lib/casino/wallet.ts` erhält `WalletService.getJackpotPool()`.
- **Datenklassen — erlaubt:** `currentAmount` (aggregiert), `lastWonAt`.
- **Datenklassen — verboten:** `last_winner_id`, `contribution_rate`, `win_probability`, `seed_amount` — alle vier bleiben serverseitig in `get_jackpot_pool_public()` gekapselt, verlassen die Funktion nie.
- **Positivtest — durchgeführt:** `SELECT get_jackpot_pool_public();` lokal liefert exakt `{"currentAmount": 1000, "lastWonAt": null}` — keines der verbotenen Felder im Rückgabewert.
- **Negativtest — durchgeführt:** Live-Aufruf gegen den laufenden `npm run dev`-Server (Jans bereits aktive Instanz, zeigt auf die Remote-Datenbank, auf der diese Migration bewusst noch nicht liegt — kein Push ohne L6-Freigabe) löste den DB-Fehlerpfad aus; Route antwortete `200 OK` mit sicherem Fallback `{"currentAmount":0,"lastWonAt":null}` statt 500/Stacktrace — Fallback-Verhalten damit unter echten Bedingungen bestätigt, nicht nur angenommen.
- **Money-Pfad:** Nein (Read-only).
- **Security-Review:** Nein für den Read-Pfad selbst, Teil des Gesamt-Go-Live-Gates in L6.
- **Abhängigkeit:** L1.

### L5 — Frontend: Live-Anzeige ersetzt Platzhalter 🟢 Executed (2026-08-18)

- **Ziel:** `ProgressiveJackpotSection.tsx` zeigt den echten Pool-Stand; kein Fantasiewert, kein browserlokaler Random-Increment mehr.
- **Scope (umgesetzt):** [`src/hooks/useProgressiveJackpot.ts`](../src/hooks/useProgressiveJackpot.ts) — vollständiger Rewrite: `useJackpotStore` (Zustand, `Math.random()`-Increment, Fantasie-Startwert `1489360.36`) entfernt. Neuer Hook fetcht `GET /api/casino/jackpot` beim Mount und pollt alle 12s (im bestätigten 10–15s-Fenster), startet bei `null` (Anzeige `„—"`) statt einem fabrizierten Betrag, behält bei fehlgeschlagenem Poll den letzten bestätigten Wert. `src/components/home/ProgressiveJackpotSection.tsx` und `src/components/home/HeroCinematicShowcase.tsx` unverändert bis auf den Konsum des neuen Hooks (beide nutzten bereits nur `formatted`).
- **Nicht-Scope:** die vier statischen Stat-Kacheln in derselben Sektion (`GESAMT AUSGEZAHLT`, `DURCHSCHN. AUSZAHLUNG`, `PLATZIERTE WETTEN`, `PROVABLY FAIR`) bleiben unverändert — kein Bezug zu P16/P25 in der Marker-Datei, eigenes potenzielles Folgethema. `HeroCinematicShowcase.tsx`s benachbarte `Math.random()`-Simulation für Live-Ticker (crashMult/diceVal/slotsWon) ebenfalls unverändert — vom Security-Review als reiner UX/Trust-Hinweis für einen künftigen Pass vermerkt, kein Fund gegen dieses Diff.
- **Update-Mechanik — umgesetzt:** Polling (12s), kein Realtime. Zwei unabhängige Hook-Instanzen (Hero + Section) pollen unabhängig statt über einen geteilten Timer — bewusst vereinfacht, da der einzige Grund für den früheren geteilten Zustand (Konsistenz zwischen zwei unabhängig hochzählenden Fake-Werten) mit einer echten Server-Quelle entfällt; beide zeigen ohnehin denselben bestätigten Wert.
- **Initialwert-Laden:** ausschließlich über den L4-Endpoint beim Mount, niemals ein hartkodierter Start-/Fallback-Betrag im Client (Risiko R25 der Marker-Datei) — `jackpot` bleibt im Hook-Rückgabewert bewusst `number | null`, damit auch ein künftiger Konsument „unbekannt" nicht mit `$0` verwechseln kann.
- **Money-Pfad:** Nein (reine Anzeige, kein Schreibzugriff).
- **Security-Review — durchgeführt 2026-08-18:** **APPROVE**, keine CRITICAL/HIGH-Befunde. Drei LOW-Funde behoben: (1) ungenutztes `jackpot`-Feld fabrizierte `0` bei fehlendem Wert statt `null` durchzureichen — jetzt `number | null`; (2) keine Laufzeitprüfung der Fetch-Antwort vor `toLocaleString()` — jetzt `typeof`/`Number.isFinite`-Guard vor `setJackpot`; (3) unnötiger Cookie-Versand an den öffentlichen Endpoint sowie stiller Fehlschlag ohne Log — jetzt `credentials: 'omit'` und `CasinoLogger.warn(...)` im Catch-Block.
- **Verifizierung — durchgeführt 2026-08-18:** Live gegen den laufenden Dev-Server geprüft (Homepage lädt, beide Anzeigen zeigen denselben echten Wert `$0.00`, konsistent mit dem noch nicht auf Remote migrierten Stand aus L4 — kein Fake-Betrag mehr sichtbar); Netzwerk-Log bestätigt tatsächliche Requests an `/api/casino/jackpot`; keine Konsolenfehler. 671/671 Tests, `tsc`/`eslint` sauber.
- **Verifizierung (aus Marker-Datei übernommen, konkretisiert):**
  - Refresh-Test: Wert bleibt nach Reload identisch, kein Reset auf Startwert.
  - Multi-Client-Test: zweiter Browser zeigt nach einem Bet denselben erhöhten Betrag.
  - Negativtest: erneutes Mounten/Refresh erzeugt keinen neuen Pool-Eintrag und verändert `current_amount` nicht.
  - Fallback-Test: unterbrochene Verbindung ersetzt den zuletzt serverseitig bestätigten Wert nicht durch einen Platzhalter.
- **Abhängigkeit:** L4 zwingend; L2/L3 damit der angezeigte Wert sich fachlich sinnvoll (durch echte Bets) verändert.

### L6 — Lasttest & Gesamt-Go-Live-Gate 🟡 In Execution — Lasttest FAIL (2026-08-18)

- **Ziel:** Nachweis, dass die neue Singleton-Zeile bestehende Bet-Latenz nicht verschlechtert (Vorgabe aus `05_ZUKUNFTSPLANUNG.md` P16: „Lasttest — gleichzeitige Bets aus mehreren Spielen dürfen den Pool nicht durch Lock-Contention blockieren").
- **Scope:** kein neuer Produktionscode — Testlauf/-skript gegen den lokalen Supabase-Stack, Vergleich der Settlement-Latenz vor/nach L2. Skript war ein Wegwerf-Artefakt (`scripts/_jackpot-load-test.mjs`), nach dem Lauf wieder gelöscht — nicht Teil des Repos.
- **Container-Engine (Korrektur 2026-08-18):** `supabase start`/`db push --local` laufen bei Jan über **Rancher Desktop**, nicht Docker Desktop — die `docker`-CLI ist identisch, zeigt aber auf Rancher Desktops Engine (`docker context ls` → Plugin-Pfade unter `C:\Program Files\Rancher Desktop\...`). Für künftige Sessions: falls `docker ps`/`supabase status` mit „cannot connect to the docker API" fehlschlägt, zuerst prüfen, ob Rancher Desktop (nicht Docker Desktop) gestartet ist.
- **Schwellwert — bestätigt 2026-08-18:** < 10 % p95-Verschlechterung gegenüber der Baseline ohne Jackpot-Contribution.
- **Testaufbau:** 40 nebenläufige `settle_game_bet`-Aufrufe (unterschiedliche User) je Szenario, Warm-up-Runde vorab (Cold-Start-Bias vermeiden), zwei Durchläufe mit vertauschter Reihenfolge (Reihenfolge-Bias ausschließen) — Ergebnis in beiden Durchläufen konsistent.
- **⚠️ Ergebnis — FAIL:** Baseline (ohne Jackpot) p95 ≈ 56 ms · Mit Jackpot-Contribution p95 ≈ 184 ms → **+230 % statt < 10 %**. Root Cause bestätigt die bereits in L2/Risiko R4 der Marker-Datei benannte Vermutung: `jackpot_pool` ist eine Singleton-Zeile, die **jeder** gleichzeitige Bet aus **jedem** Spiel/User schreibt — bei 40 parallelen Usern serialisieren sich alle 40 Contribution-`UPDATE`s auf dieser einen Zeile, während die Baseline durch die per-User-Advisory-Locks nahezu parallel läuft. Kein Implementierungsfehler, sondern eine strukturelle Eigenschaft des gewählten Singleton-Pool-Designs unter Nebenläufigkeit.
- **Optionen zur Entscheidung (Klärungspunkt 8 — nicht selbst entschieden, siehe unten):**
  1. **Schwelle/Risiko bewusst akzeptieren:** 184 ms absolute Latenz ist für eine neue Funktion bei aktuell niedrigem Bet-Volumen ggf. tragbar; Kontention wird erst bei echter Skalierung zum echten Engpass. Kein zusätzlicher Aufwand, Risiko bleibt dokumentiert und beobachtet (z. B. über bestehendes Monitoring).
  2. **Contribution entkoppeln (asynchron):** Contribution aus dem synchronen Settlement-Pfad herauslösen, analog zum bereits in der Roadmap vorgesehenen Outbox-Pattern (`05_ZUKUNFTSPLANUNG.md` P18/4.1). Löst die Kontention vollständig, braucht aber einen Consumer/Worker — der größte Einzelaufwand aller Optionen.
  3. **Sharding:** mehrere Pool-Teilzeilen, Contribution verteilt sich zufällig auf N Shards, L4-Read summiert. Reduziert Kontention proportional zur Shard-Zahl, ohne die synchrone Architektur aufzugeben — mittlerer Zusatzaufwand.
  - **Empfehlung:** Option 1 für den Erst-Launch (YAGNI — Aufwand erst investieren, wenn echtes Bet-Volumen den Engpass tatsächlich spürbar macht), mit Option 2 als vorgemerktem Folgeschritt, falls Bet-Volumen relevant steigt.
- **Money-Pfad:** Nein (Testinfrastruktur).
- **Security-Review:** finales Go-Live-Gate — pausiert, bis Klärungspunkt 8 entschieden ist. Alle Pflicht-Reviews aus L2/L3/L5 sind bereits abgeschlossen; der Blocker ist ausschließlich Performance, nicht Security.
- **Verifizierung:** Performance-Regressionstest **nicht bestanden** — siehe Ergebnis oben. Erneuter Lauf nach Umsetzung der gewählten Option erforderlich.
- **Abhängigkeit:** L2, L3.

---

## 4 — Bestätigte Parameter (2026-08-18)

Alle 7 Klärungspunkte wurden von Jan im Chat entschieden — jeweils die empfohlene Option gewählt:

| #   | Punkt                                          | Betrifft | Entscheidung                                                                                                                                                                                                                                                                                    |
| --- | ---------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `contribution_rate`                            | L1/L2    | 0,25 % je Bet                                                                                                                                                                                                                                                                                   |
| 2   | `win_probability` je Bet                       | L1/L3    | ≈ 1 von 10.000 Bets (konservativer Startwert, spätere Kalibrierung nach echten Volumendaten möglich)                                                                                                                                                                                            |
| 3   | Startwert `seed_amount`/`current_amount`       | L1       | 1.000 $                                                                                                                                                                                                                                                                                         |
| 4   | Contribution-Ort                               | L2       | ausschließlich Postgres-RPC, `casino-core.ts` unangetastet                                                                                                                                                                                                                                      |
| 5   | Trigger-RNG                                    | L3       | Seed-Chain Provably-Fair-Pattern                                                                                                                                                                                                                                                                |
| 6   | Update-Mechanik                                | L5       | Polling zuerst (10–15s), Realtime als separater Folgeschritt                                                                                                                                                                                                                                    |
| 7   | Latenz-Schwelle Lasttest                       | L6       | < 10 % p95-Verschlechterung ggü. Baseline                                                                                                                                                                                                                                                       |
| 8   | Umgang mit Lasttest-FAIL (+230 % statt < 10 %) | L6       | **Option 1 gewählt (2026-08-18):** bewusst akzeptiert für den Start — 184 ms absolute Latenz bei aktuell niedrigem Bet-Volumen vertretbar, kein zusätzlicher Aufwand. Option 2 (Outbox-Entkopplung, P18/4.1) bleibt vorgemerkter Folgeschritt, falls Bet-Volumen später den Engpass real macht. |

Alle 8 Klärungspunkte sind entschieden. Verbleibende Jan-Zuständigkeit: die zwei ursprünglichen L6-Freigaben (Remote-Migration-Push, Merge nach `main`) — beide von Jan am 2026-08-18 bereits erteilt.

---

## 5 — Plan-Selbstprüfung (Schritt 2 im Jan-Workflow)

**Perspektive 1 — Architektur:**

- Abhängigkeiten: L1 → L2 → L3 → L6 linear für das Backend; L4 hängt nur von L1 ab (kann parallel zu L2/L3 entstehen, zeigt bis L2 nur den Seed-Betrag); L5 hängt hart von L4, fachlich von L2/L3 ab — in jedem Level einzeln vermerkt.
- Vollständigkeit: deckt beide Marker-Datei-Punkte (P16/3.3 Pool-Backend, P25/3.4 Anzeige) vollständig ab, inklusive aller dort genannten Verifizierungen (Refresh/Multi-Client/Fallback/Lasttest).
- Aufgabenverteilung (verschärft 2026-08-18): Code, Migrationen, Tests und Lasttest vollständig bei LLM. Jans Zuständigkeit ist auf die zwei zwingenden Freigaben in L6 (Remote-Push, Merge in `main`) reduziert — beides folgt direkt aus den globalen Safety-Regeln (hard-to-reverse/geteiltes System), nicht aus Initiative-eigenem Ermessen.
- Fehler-/Problemfälle: DB-Fehler bei L4 → sicherer Fallback statt 500 mit Details; Realtime-Verbindungsabbruch → letzter bestätigter Wert bleibt stehen; doppelte RPC-Zustellung → Idempotenz über bestehendes `request_id`-Pattern.

**Perspektive 2 — Security:**

- Abhängigkeiten: Security-Review ist als Pflicht-Gate vor jedem Money-Pfad-Merge (L2, L3) und vor Go-Live von L5 einzeln vermerkt, nicht nur global am Dateiende.
- Vollständigkeit: Datenklassen-Allowlist für L4 (erlaubt/verboten) explizit definiert; kein User-identifizierendes Feld im Public-Read-Contract.
- Aufgabenverteilung (verschärft 2026-08-18): Security-Reviewer-Agent-Einsatz UND das Beheben aller CRITICAL/HIGH-Befunde sind vollständig LLM-Aufgabe, ohne Jan einzubeziehen. Jan bekommt am Ende nur eine Zusammenfassung vorgelegt, keinen eigenen Review-Schritt.
- Fehler-/Problemfälle: Race Condition bei Contribution (`SELECT ... FOR UPDATE`) und bei Trigger-Auszahlung (dieselbe Transaktion, kein Fenster zwischen Check und Reset) explizit adressiert statt angenommen.

**Ergebnis der Selbstprüfung:**

- Alle Level sind in Reihenfolge und mit Abhängigkeiten beschrieben. ✅
- Der einzige Datenzugriff mit Außenwirkung (L4) besitzt eine explizite Allowlist und einen Negativtest. ✅
- Ausgeschlossene spätere Funktionen sind markiert: die vier Stat-Kacheln (Nicht-Scope), Realtime als expliziter Folgeschritt statt impliziter Erstschritt. ✅
- Kein Widerspruch zur Marker-Datei `worldmap/05_ZUKUNFTSPLANUNG.md` — P16/P25 bleiben dort in der Übersichtstabelle referenziert, Cross-Verweis im selben Edit ergänzt (Abschnitt 6). ✅
- Jan-Zuständigkeit auf das laut globalen Safety-Regeln zwingend Notwendige reduziert (zwei Freigaben in L6); kein Level enthält eine Jan-Aufgabe, die nicht aus einer hard-to-reverse/geteilte-System-Aktion folgt. ✅

**Status-Konsequenz:** Schritt 3 (Execution) ist für L1–L5 abgeschlossen und jeweils einzeln verifiziert (Schritt 4, Execution-Selbstprüfung) — Details je Level oben, Migrationen `032`–`035` lokal angewendet, alle Security-Review-Gates durchlaufen (inkl. eines CRITICAL+HIGH-Fundes bei L3, behoben und re-verifiziert), 671/671 Tests grün, `tsc`/`eslint` sauber, L4/L5 zusätzlich live gegen den laufenden Dev-Server bestätigt. L6 wurde begonnen, der Lasttest lief (fair, mit Warm-up und reihenfolge-getauschten Wiederholungen) und bestand die < 10 %-p95-Schwelle **nicht** (+230 %, strukturelle Singleton-Row-Kontention). Kopfstatus **In Execution** — Remote-Push und Merge nach `main` wurden bewusst **nicht** angefragt, weil der Lasttest-Gate selbst nicht besteht (kein Sinn, Freigaben für einen Schritt einzuholen, dessen Vorbedingung fehlschlägt). Offen: Klärungspunkt 8 (Abschnitt 4) — erst nach Jans Entscheidung dazu wird L6 fortgesetzt und die beiden ursprünglichen Freigaben angefragt.

---

## 6 — Bezug zur Marker-Datei

Ersetzt in `worldmap/05_ZUKUNFTSPLANUNG.md` die separate Ausführung von P16 (3.3) und P25 (3.4) durch einen kombinierten Execution-Plan. Die Marker-Datei wurde im selben Edit wie diese Datei um einen Verweis auf diese Datei ergänzt (Abschnitt 1, Spalte „Nächster Schritt" bei P16/P25, sowie Abschnitt 3 §3.3/§3.4).
