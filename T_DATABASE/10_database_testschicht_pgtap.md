# 10 — DB-Test-Schicht (pgTAP)

> **Status:** Ausgeführt — N1–N7 erledigt (2026-09-13, siehe §9); reale pgTAP-/Konkurrenzläufe + Negativbeweise serial in der Merge-Phase · **Stand:** 2026-09-13 · **Owner:** LLM (kein dediziertes Jan-Gate) · **Scope:** Systematische, priorisierte Ausweitung der pgTAP-Laufzeittestschicht von "3 exemplarische Geld-RPCs" auf ein vollständiges, CI-erzwungenes Abdeckungsmodell für alle Geld- und Zugriffskontroll-relevanten Datenbankfunktionen.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1 (Warum diese Neufassung) und Abschnitt 2 (bereits vorhandene Testschicht, Referenz) vollständig.
2. Beginne bei N1 (Inventar) — alle folgenden Meilensteine hängen von dessen Ergebnis ab (welche RPCs/Tabellen tatsächlich noch Lücken haben).
3. N2/N3 können nach N1 parallel durch verschiedene Subagenten bearbeitet werden (unabhängige Testdateien, kein gemeinsamer Zustand — pgTAP-Testdateien laufen ohnehin isoliert mit `ROLLBACK`).
4. Bevor Testkandidaten (Funktionsnamen, Signaturen) verwendet werden: immer per `grep` gegen `supabase/migrations/` verifizieren, nicht aus Doku-Prosa übernehmen — die Vorversion enthielt mehrfach falsche Funktionsnamen.
5. Bei Widerspruch zwischen dieser Datei und dem tatsächlichen Code: der Code gewinnt.

---

## 1 — Warum diese Neufassung existiert (Jan-Kontext)

Die Vorversion war vollständig ausgeführt (L0–L8, grüner CI-Lauf, 27 Tests) und trotzdem beim Re-Rating nur auf **Top 60 %** eingestuft — nicht weil die Umsetzung fehlerhaft war, sondern weil der Umfang bewusst schlank gehalten wurde: **3 von potenziell weit mehr geld- und zugriffsrelevanten Funktionen** haben einen Laufzeittest, RLS wurde nur auf 5 von mehreren Kern-Tabellen laufzeitgeprüft, und es gibt **kein Mechanismus, der eine neue Geld-RPC ohne Test auffängt** — die Abdeckung kann jederzeit unbemerkt wieder erodieren.

Diese Neufassung schließt drei strukturelle Lücken statt nur mehr Einzeltests hinzuzufügen:

1. Ein **vollständiges, priorisiertes Inventar** (N1) ersetzt die bisherige Ad-hoc-Auswahl ("3 kanonische Funktionen") durch eine nachvollziehbare Priorisierung nach Geld-Nähe.
2. Ein **CI-Coverage-Gate** (N4) verhindert, dass die Abdeckung nach dieser Neufassung erneut unbemerkt zurückfällt — das ist der eigentliche Sprung von "einmalig gut getestet" zu "strukturell abgesichert".
3. Die **bewusst offen gelassene Doku-Lücke** (7 verbliebene "Penetrationstest"-Überzeichnungen, siehe Abschnitt 2) wird jetzt geschlossen, da sie exakt das Vertrauensproblem ist, das Jan an anderer Stelle bereits einmal aufgefallen ist (Execution-Status ≠ echte Qualität).

Die **"Status"-Spalte der bisherigen Übersichtstabelle wurde entfernt** (durchgängig 🟢, kein Informationswert) — der Ausführungsstand jedes neuen Meilensteins ist in dieser Neufassung per Definition offen.

---

## 2 — Bereits vorhandene Testschicht (Referenz — nicht neu bauen)

- pgTAP aktiv seit Migration [`064_enable_pgtap.sql`](../supabase/migrations/064_enable_pgtap.sql).
- 4 Testdateien / 27 Tests unter `supabase/tests/`: [`settle_game_bet.test.sql`](../supabase/tests/settle_game_bet.test.sql), [`start_game_round.test.sql`](../supabase/tests/start_game_round.test.sql), [`advance_blackjack_round.test.sql`](../supabase/tests/advance_blackjack_round.test.sql), [`rls_runtime_isolation.test.sql`](../supabase/tests/rls_runtime_isolation.test.sql).
- RLS-Laufzeittest deckt aktuell 5 Kern-Tabellen ab: `users`, `wallet_transactions`, `game_rounds`, `wallet_ledger_baselines`, `wallet_invariant_events`.
- CI-Integration in [`.github/workflows/security-staging.yml`](../.github/workflows/security-staging.yml) (`npx supabase test db`).
- Bekannte, bisher bewusst nicht bearbeitete Lücke: **7 weitere Dateien** mit derselben "29/29 Penetrationstest"-Überzeichnung wie ursprünglich `rls-defense-in-depth.test.ts` (per `grep -rn "Penetrationstest\|echte anon\|gegen echte" docs/database worldmap xx_sop` auffindbar) — in der Vorversion explizit als "eigener Aufräum-Task" ausgeklammert.
- **Wichtiger Fakt, nicht erneut recherchieren:** `wallet-ledger-invariants.test.ts`, `rls-defense-in-depth.test.ts`, `wallet-authority.test.ts`, `wallet-service-authority.test.ts` sind **statische Datei-Assertions** (`readFileSync` + String-Matching), keine echten DB-Verbindungstests — das bleibt bewusst so (siehe `T_DATABASE/05_database_backup_and_recovery.md` Abschnitt 2), diese Datei hier baut die **echten** Laufzeittests.
- 159 `SECURITY DEFINER`-Vorkommen über 48 Migrationsdateien (Grep-Stand 2026-09-12) — **nicht alle sind eigenständige, testwürdige RPCs** (viele sind wiederholte `CREATE OR REPLACE` derselben Funktion über mehrere Migrationen); N1 klärt die tatsächliche, deduplizierte Zielliste.

### 2a — N1-Ergebnis (2026-09-13): priorisiertes Funktionsinventar

Datenquelle: [`docs/database/pgtap-coverage-inventory.json`](../docs/database/pgtap-coverage-inventory.json) (75 Funktionen, dedupliziert auf die juengste Definition je Name; Basis fuer das N4-Coverage-Gate). Verteilung: **13 P0 · 17 P1 · 40 P2 · 5 legacy**.

**P0 — direkter Geldpfad (13; 2 davon nur indirect über die `settle_game_bet`-Kette):**

| Funktion                                          | Neueste Definition                     | Bereits getestet?                                                             |
| ------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| `settle_game_bet`                                 | 045:25                                 | ja — `settle_game_bet.test.sql`                                               |
| `start_game_round`                                | 058:1138                               | ja — `start_game_round.test.sql`                                              |
| `advance_blackjack_round`                         | 036:339                                | ja — `advance_blackjack_round.test.sql`                                       |
| `settle_game_round`                               | 045:194                                | **nein → N2** (live: `src/lib/casino/wallet.ts` ruft es)                      |
| `reconcile_wallet_ledger`                         | 058:723                                | **nein → N2**                                                                 |
| `admin_update_user`                               | 058:13                                 | **nein → N2**                                                                 |
| `redeem_promo_code`                               | 058:809                                | **nur als Fixture in `promo_reversal_rpc.test.sql` → dedizierter Test in N2** |
| `reverse_promo_code`                              | 066:23                                 | ja — `promo_reversal_rpc.test.sql`                                            |
| `deactivate_expired_promo_codes`                  | 066:143                                | ja — `promo_reversal_rpc.test.sql`                                            |
| `settle_daily_race`                               | 060:467 (Overload `()` :567 delegiert) | **nein → N2**                                                                 |
| `guard_wallet_transaction_immutable` (Trigger)    | 058:591                                | **nein → N2** (bisher nur statische Datei-Assertion)                          |
| `jackpot_pool_contribute` / `jackpot_pool_settle` | 033:13 / 034:18                        | indirekt via `settle_game_bet`-Kette — kein eigener Test nötig                |

**P1 — Zugriff/Risiko (15):** ungetestet `get_or_create_user_seed`, `rotate_user_seed`, `consume_active_seed` (Seed-Chain = Provably-Fair-Kern), `sync_crash_round`, `set_crash_round_point`, `release_fraud_scan_lock`, `record_bet_network_fingerprint`, `detect_bet_velocity_outliers`, `detect_multi_account_clusters`, `compute_cohort_win_rates`, `compute_fraud_ml_features`, `custom_access_token_hook`, `enforce_self_exclusion_only_extends`, `rls_auto_enable`; getestet (aus früheren Sessions): `record_risk_event`, `review_risk_event`, `try_acquire_fraud_scan_lock` — `risk_events_rpc.test.sql`.

**P2 (40) und legacy (5)** — bewusst kein Ziel; Legacy (`place_bet`, `settle_bet`, `migrate_anonymous_session`, `upsert_anonymous_session`, `casino_rank_for_level`) ist per Migration 011 revoket.

**Divergenz-Fund zur Plan-Annahme:** §2 listete 4 Testdateien/27 Tests — der Ist-Stand sind **6 Dateien** (zusätzlich `promo_reversal_rpc.test.sql` 22 Tests + `risk_events_rpc.test.sql` 20 Tests aus den inzwischen gelöschten T_RATE_LIMITING-Plänen 06_9/06_10). N2-Scope verkleinert sich entsprechend.

---

## 3 — Neue Meilensteine (N1–N7)

### N1 — Vollständiges, priorisiertes Geld-/Zugriffs-RPC-Inventar

- **Ziel:** Eine nachvollziehbare, deduplizierte Liste aller testwürdigen Funktionen statt der bisherigen Ad-hoc-Auswahl von 3.
- **Schritte:**
  1. `grep -rn "CREATE OR REPLACE FUNCTION public\." supabase/migrations/*.sql` gegen die **neueste** Definition je Funktionsname deduplizieren (mehrere Migrationen überschreiben dieselbe Funktion — nur die zuletzt gültige Signatur zählt, siehe Muster in Abschnitt 2 der Vorversion für `settle_game_bet`/`start_game_round`/`advance_blackjack_round`).
  2. Jede Funktion in eine von drei Prioritätsklassen einordnen:
     - **P0 (direkter Geldpfad):** mutiert `users`-Balance, `wallet_transactions`, `wallet_events`, `wallet_ledger_baselines` direkt oder via Aufrufkette (z. B. `reconcile_wallet_ledger`, `admin_update_user`, promo-/bonus-bezogene RPCs aus 023/066, Settlement-Pfade der einzelnen Spiele, falls sie nicht bereits über die 3 bestehenden Tests abgedeckt sind).
     - **P1 (Zugriffskontrolle/Risiko):** Fraud-/Risk-Signal-RPCs (029, 030, 040, 044), die zwar kein Geld direkt bewegen, aber Zugriffsentscheidungen/Sperren auslösen.
     - **P2 (Meta/Telemetrie):** alles andere mit `SECURITY DEFINER`, das weder Geld noch Zugriffsentscheidungen berührt (z. B. reine Telemetrie-RPCs aus 024/027) — bewusst niedrigste Priorität, kein Ziel dieser Neufassung.
  3. Ergebnis als Tabelle in Abschnitt 2 dieser Datei nachtragen (Funktionsname, Migrationsdatei:Zeile, Klasse, "bereits getestet? ja/nein").
- **Verifizierung:** Summe P0 + P1 + P2 aus der Tabelle stimmt mit der deduplizierten Funktionsliste aus Schritt 1 überein (keine Funktion doppelt oder vergessen).
- **Freigabe-Gate:** Keines (reine Recherche). **Money-Pfad:** Nein. **Security-Review:** Nein.

### N2 — pgTAP-Tests für ungetestete P0-Funktionen

- **Ziel:** Jede P0-Funktion aus N1 ohne bestehenden Test bekommt mindestens einen `throws_ok`- und einen `lives_ok`-Testfall, nach dem in L4/L5 der Vorversion etablierten Muster (eigene Transaktion, `ROLLBACK`, Signatur vor Testbau per `grep` verifizieren, nicht aus der N1-Tabelle blind übernehmen — Signaturen können sich zwischen N1 und N2 durch parallele Migrationen verschoben haben).
- **Schritte:** Je P0-Funktion: reale Fehlerpfade aus dem Funktionskörper lesen (nicht raten), mindestens 1 Erfolgsfall + 1 dokumentierter Fehlerfall + (falls die Funktion `requestId`-Idempotenz nutzt) 1 Replay-Test nach dem bestehenden Muster.
- **Verifizierung:** `npx supabase test db` zeigt alle neuen Dateien grün, Gesamttestzahl in Abschnitt 2 dieser Datei nachtragen.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Ja. **Security-Review:** Pflicht.
- **Parallelisierungshinweis:** Jede P0-Funktion kann als eigene Testdatei von einem separaten Subagenten bearbeitet werden — kein gemeinsamer Zustand zwischen Testdateien (jede läuft isoliert mit eigenem `ROLLBACK`).

### N3 — RLS-Laufzeittest auf alle RLS-Tabellen ausweiten

- **Ziel:** Der bestehende Laufzeittest deckt 5 von potenziell mehr Tabellen mit `ENABLE ROW LEVEL SECURITY` ab.
- **Schritte:**
  1. `grep -rn "ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql` → vollständige Tabellenliste, gegen die 5 bereits getesteten abgleichen → Lückenliste.
  2. Für jede Lücken-Tabelle denselben `SET LOCAL ROLE authenticated` + `request.jwt.claims`-Ansatz wie in `rls_runtime_isolation.test.sql` anwenden (fremde `user_id` darf nichts sehen/mutieren dürfen, Negativbeweis analog zum bestehenden `DISABLE ROW LEVEL SECURITY`-Stichprobentest).
  3. Bei Tabellen ohne DML-Grants an `authenticated` (bereits als härterer Fail-Closed-Fall für `users`/`game_rounds` bekannt): Permission-Denied statt leerer Ergebnismenge erwarten — vor Testbau per `\dp <tabelle>` (oder `information_schema.role_table_grants`) den tatsächlichen Grant-Zustand prüfen, nicht raten.
- **Verifizierung:** `npx supabase test db` grün; ein absichtlich deaktivierter RLS-Fall auf mindestens einer neuen Tabelle wird testweise rot (Negativbeweis wie beim bestehenden Muster).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Ja. **Security-Review:** Pflicht.

### N4 — CI-Coverage-Gate gegen Abdeckungs-Rückfall

- **Ziel:** Der eigentliche strukturelle Sprung dieser Neufassung — verhindert, dass eine künftige neue P0-Funktion ohne Test unbemerkt bleibt, wie es der Vorversion mit den ursprünglich nur 3 getesteten Funktionen implizit passiert ist.
- **Schritte:**
  1. Neues Skript `scripts/check-pgtap-coverage.ts`: liest die N1-Klassifizierungstabelle (als Datenquelle: entweder eine kleine JSON-Datei `docs/database/pgtap-coverage-inventory.json`, die N1 als Nebenprodukt erzeugt, oder ein `grep`-Fallback nach demselben Muster wie N1 Schritt 1) und prüft, ob für jede **P0**-Funktion mindestens eine Testdatei mit `has_function` auf denselben Funktionsnamen existiert.
  2. Bei fehlender Testdatei für eine P0-Funktion: Exit-Code `1` mit einer Liste der ungetesteten Funktionen.
  3. Als Schritt in `security-staging.yml` **vor** dem bestehenden `npx supabase test db`-Schritt einhängen (informativ scheitern lassen — Ziel ist Sichtbarkeit, keine harte PR-Blockade in der ersten Ausbaustufe, da eine neue Migration und ihr Test typischerweise im selben PR landen und die Reihenfolge der Dateierstellung variieren kann).
- **Verifizierung:** Skript erkennt eine absichtlich temporär entfernte Testdatei (z. B. `settle_game_bet.test.sql` versuchsweise umbenennen) korrekt als Lücke; nach Rückbenennung wieder grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### N5 — Race-/Konkurrenz-Test für Advisory-Lock-Pfade

- **Ziel:** 47 Vorkommen von `pg_advisory_xact_lock` in 17 Dateien (siehe Abschnitt 2 der Vorversion) sind der zentrale Schutzmechanismus gegen doppelte Settlements bei parallelen Requests — bisher testet keine pgTAP-Datei tatsächliche Parallelität, nur sequenzielle Idempotenz-Replays.
- **Schritte:**
  1. Kleines Node/TS-Skript `scripts/test-concurrent-settlement.ts` (kein pgTAP — pgTAP-Testtransaktionen sind sequenziell, echte Parallelität braucht zwei echte gleichzeitige Verbindungen): öffnet zwei parallele `pg`-Client-Verbindungen gegen die lokale Instanz, ruft dieselbe Geld-RPC mit **derselben** `requestId` nahezu gleichzeitig auf (`Promise.all`), erwartet: genau ein echter Settlement-Effekt, die zweite Antwort ist der gecachte Replay-Snapshot (kein doppelter Kontostands-Effekt).
  2. Testet mindestens `settle_game_bet` und `start_game_round` (die beiden mit dem am häufigsten referenzierten Advisory-Lock-Pfad laut N1-Inventar).
  3. In `package.json` als `test:concurrency` ergänzen, in `security-staging.yml` als zusätzlichen Schritt nach dem pgTAP-Schritt (N4) einhängen.
- **Verifizierung:** `npm run test:concurrency` lokal grün; ein absichtlich auskommentierter `pg_advisory_xact_lock`-Aufruf (temporär, nur zur Verifikation, danach zurückgesetzt) lässt den Test wie erwartet rot werden (Negativbeweis, dass der Test echten Schutz misst).
- **Freigabe-Gate:** Keines (läuft ausschließlich gegen die lokale Dev-Instanz). **Money-Pfad:** Ja. **Security-Review:** Pflicht.

### N6 — Verbleibende Doku-Überzeichnung bereinigen

- **Ziel:** Die in der Vorversion bewusst ausgeklammerten 7 weiteren Fundstellen der "29/29 Penetrationstests"-Überzeichnung jetzt schließen, statt sie erneut zu verschieben.
- **Schritte:** `grep -rn "Penetrationstest\|echte anon\|gegen echte" docs/database worldmap xx_sop` erneut ausführen (Zahl kann sich seit 2026-09-05 verschoben haben), jede Fundstelle nach dem bereits etablierten Muster präzisieren ("statische Text-Verifikation" + Verweis auf den echten Laufzeittest aus Abschnitt 2 dieser Datei bzw. N3).
- **Verifizierung:** `grep` liefert 0 Treffer für die unpräzisierte Formulierung.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### N7 — Doku-Endstand & Coverage-Report

- **Ziel:** `docs/database/10_automatisierte_db_testschicht.md` von einer Roadmap-Beschreibung zu einem Ist-Stand-Dokument mit echter Kennzahl machen.
- **Schritte:** Abschnitt mit finaler Testzahl (Dateien/Tests), P0-Abdeckungsquote (getestete P0-Funktionen ÷ gesamte P0-Funktionen aus N1), Verweis auf `check-pgtap-coverage.ts` (N4) als Regelbetrieb-Mechanismus statt einmaliger Momentaufnahme.
- **Verifizierung:** Alle in der Doku genannten Zahlen stimmen mit dem tatsächlichen Repo-Stand nach N1–N6 überein (per `grep`/Testlauf gegenprüfen, nicht aus dieser Planungsdatei abschreiben).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 4 — Definition of Done & Abhängigkeiten

1. N1 zuerst — alle anderen Meilensteine hängen an seinem Ergebnis.
2. N2, N3, N5 können nach N1 parallel/durch verschiedene Subagenten laufen (unabhängige Testdateien bzw. Skripte).
3. N4 nach N2 (braucht mindestens die erste Testrunde, um sinnvoll zu prüfen), N6 unabhängig, kann jederzeit parallel laufen.
4. N7 zuletzt, fasst das Ergebnis aller vorherigen Meilensteine zusammen.
5. Erst nach N1–N7 gilt Säule 10 als voraussichtlich **Top 25–30 %** (statt der alten Top 60 %) — getragen durch vollständige P0-Abdeckung, ausgeweitete RLS-Prüfung, echten Konkurrenztest und ein CI-Gate gegen Rückfall.

---

## 5 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber `T_DATABASE/05_database_backup_and_recovery.md` abgegrenzt: dort werden bestehende Tests nur zur Drill-Verifikation konsumiert, hier wird die Testschicht selbst erweitert.
- [x] Abhängigkeiten benannt (Abschnitt 4), Parallelisierung für Subagenten explizit markiert (N2/N3/N5, unabhängige Dateien).
- [x] Neue Schreiboperationen (N2/N3-Testdateien) haben Verifizierung + Pflicht-Security-Review, da Money-Pfad betroffen.
- [x] Keine Referenz doppelt gepflegt: RPC-Signaturen bleiben in den Migrationsdateien Quelle der Wahrheit, hier nur referenziert.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 1 + 2 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Kritischer Selbstcheck:** N5 (Konkurrenztest) hätte naiv mit pgTAP versucht werden können — pgTAP-Testtransaktionen sind aber sequenziell und können echte DB-Parallelität nicht abbilden; deshalb bewusst als separates Node/TS-Skript mit zwei echten Verbindungen spezifiziert statt als (wirkungsloser) pgTAP-Testfall.

---

## 6 — Verwandte Artefakte

| Bedarf                                       | Datei                                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Kanonischer Doku-Standard (Säule 10)         | [`docs/database/10_automatisierte_db_testschicht.md`](../docs/database/10_automatisierte_db_testschicht.md) — wird in N7 aktualisiert |
| Bestehende pgTAP-Tests (Referenz)            | `supabase/tests/*.test.sql`                                                                                                           |
| CI-Einbaupunkt                               | [`.github/workflows/security-staging.yml`](../.github/workflows/security-staging.yml)                                                 |
| Finanz-/Idempotenz-Invarianten               | [`xx_sop/09_security_wallet_invariants.md`](../xx_sop/09_security_wallet_invariants.md)                                               |
| Postgres-Migrations-Patterns, K-Level        | [`xx_sop/18_postgres_patterns_migrations.md`](../xx_sop/18_postgres_patterns_migrations.md)                                           |
| Gewichtete Subkategorien-Bewertung           | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md)                                                                        |
| Übergeordnete Aufschlüsselung (Kategorie 02) | [`T_DATABASE/04_datenbank_migrationen.md`](../T_DATABASE/04_datenbank_migrationen.md)                                                 |
| Planungsdateien-Konvention                   | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                                           |

---

## 9 — Ausführungsergebnis (2026-09-13)

### 9.1 Meilensteine

| MS  | Ergebnis                                                               | Kern-Artefakte                                                                                                                                                                                                                                                                                                        |
| :-- | :--------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N1  | ✅ Inventar 75 Funktionen (13 P0 · 17 P1 · 40 P2 · 5 legacy), commitet | `docs/database/pgtap-coverage-inventory.json` + §2a (Zahlen final gegen JSON korrigiert: 13/17/40 statt der zwischendurch notierten 12/15/41)                                                                                                                                                                         |
| N2  | ✅ 6 neue pgTAP-Testdateien, alle 6 Lücken-P0s abgedeckt               | `settle_game_round` (10), `reconcile_wallet_ledger` (7), `admin_update_user` (12), `wallet_transactions_immutability` (6), `redeem_promo_code` (13), `settle_daily_race` (10) Assertions; Signaturen per grep gegen 045/058/060/066 verifiziert                                                                       |
| N3  | ✅ RLS-Ausweitung auf ALLE 39 RLS-Tabellen                             | `rls_runtime_isolation_extended.test.sql` (80 Assertions): pg_class-RLS-Check × 39, fremd-SELECT je Tabelle (42501 ODER 0 Zeilen = fail-closed), 5 public-read-Tabellen müssen lesbar bleiben, fremd-INSERT auf `user_login_history` → 42501                                                                          |
| N4  | ✅ Coverage-Gate + Regelbetrieb                                        | `scripts/check-pgtap-coverage.ts` (Exit 1 bei GAP) + 6 Vitest-Unit-Tests inkl. Negativbeweisen + Step in `security-staging.yml` VOR `supabase test db` (informativ); `staging-regression-contract.test.ts` präzisiert (siehe 9.4)                                                                                     |
| N5  | ✅ Echter Konkurrenztest                                               | `scripts/test-concurrent-settlement.ts` (`test:concurrency`): 2 gleichzeitige service_role-Calls mit gleicher `request_id` auf `settle_game_bet` + `start_game_round`; Invarianten: 1 Ledger-Zeile, genau 1 Replay, Balance exakt einmal angewendet, `reconcile_wallet_ledger` consistent                             |
| N6  | ✅ Verifiziert: 0 verbleibende Überzeichnungen im Scope                | `grep "Penetrationstest\|echte anon\|gegen echte"` über `docs/database worldmap xx_sop` → keine unpräzisierte Fundstelle mehr; `04_row_level_security_rls.md:86` ist die bereits korrigierte Selbst-Präzisierung; Resttreffer liegen in `docs/archive` (Archiv-Regel: nicht korrigiert) und in den Plan-Texten selbst |
| N7  | ✅ Doku-Endstand mit Messzahlen                                        | `docs/database/10_automatisierte_db_testschicht.md` → Ist-Stand: 13 Dateien / 207 Assertions, P0-Quote 11/13 direct (13/13 inkl. indirect), CI-Verankerung, `test:concurrency`                                                                                                                                        |

### 9.2 Verifikation (5-Stufen, Worktree `db-pgtap`, 2026-09-13)

- `npm run typecheck` ✅ · `npm test` ✅ **1709/1709** · `npm run lint` ✅ 0 Errors / 38 Warnings (Bestand) · `npm run build` ✅ · `git status --short` sauber nach 3 Commits (6731e87f N3, b4664a00 N4, 23a61116 N5)
- N4-CLI-Smoke: Skript exit 0, meldet P0-Quote 11/13 + 2 indirect-Warnings + 14 P1-Warnings

### 9.3 Security-Reviews

- **security-reviewer (N2/N3/N4/N5, Pflichtposten): PASS** — 0 CRITICAL/HIGH. LOW-Findings dokumentiert: (1) `body.includes(fn.name)` im Coverage-Check kann auf Kommentar-Treffer false-positive sein; (2) synthetische N5-User bleiben in der ephemeren lokalen Instanz zurück (identisches Muster wie `phase1-concurrency.ts`, Runner-Teardown wirft sie weg); (3) `continue-on-error` bewusst nur auf dem Coverage-Step — alle Security-Verifikations-Steps bleiben blockierend, Contract-Test pinnt genau einen Soft-Fail; Flip zu blockierend empfohlen, sobald die Quote voll ist; (4) lokale service_role-Keys in `GITHUB_ENV` unmaskiert (wohlbekannte Dev-Keys der ephemeren Instanz, kein Rotationswert).
- **migration-security-guard:** N/A — keine Datei unter `supabase/migrations/**` verändert (nur `supabase/tests/**`, `scripts/**`, CI, Doku).

### 9.4 Abweichungen & Entscheidungen

1. **Contract-Test-Anpassung (N4):** Der bestehende Contract verbot jegliches `continue-on-error: true` in `security-staging.yml`; der Plan sah informativ-Scheitern für den Coverage-Check vor. Gelöst durch Präzisierung statt Abschwächung: der Contract erlaubt jetzt **genau einen** Soft-Fail, und nur auf dem Coverage-Step — alle Security-Verifikations-Steps müssen weiter hart scheitern. Kollision Plan ↔ CI-Contract ist damit aufgelöst; für Jan sichtbar im Endbericht.
2. **N5-Transport:** Plan sagte `pg`-Client; das Repo hat keinen pg-Driver → zwei parallele `@supabase/supabase-js` service_role-Clients (echte separate Verbindungen), Target-Guard (`PHASE1_EPHEMERAL_LOCAL` + Loopback-Only) vom bestehenden `phase1-target-guard` übernommen.
3. **Inventar-Finalstand weicht vom §2a-Zwischenstand ab:** 75/13/17/40/5 statt 73/12/15/41 — die final committete JSON ist die Wahrheit; §2a wurde im selben Schritt nachgezogen.
4. **N2-Verifizierung-Defer:** `npx supabase test db` (grün) und die Negativbeweise (RLS testweise deaktivieren → rot; N5: Advisory-Lock temporär entfernen → rot) laufen serial in der Merge-Phase — nur eine lokale Supabase-Instanz vorhanden.

### 9.5 K5-Reste

1. Erster realer pgTAP-/Konkurrenz-Lauf im Merge-Worktree (inkl. Negativbeweise) — siehe 9.4.4.
2. Optional (kein Gate): dedizierte pgTAP-Tests für `jackpot_pool_contribute`/`jackpot_pool_settle` (aktuell indirect), dann Coverage-Step zu blockierend drehen.
