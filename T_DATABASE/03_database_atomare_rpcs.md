# 03 — Atomare Finanz-RPCs: Code-Qualität & Musterkonsistenz

> **Status:** Execution-Ready · **Stand:** 2026-09-05 · **Owner:** LLM (kein Jan-Gate) · **Scope:** Konsistenz der Advisory-Lock-/`search_path`-/Idempotenz-Muster über **alle** Geld-RPCs (nicht nur die 3 Haupt-RPCs), Doku-Vollständigkeit, Automatisierung. **Nicht Scope:** pgTAP-Laufzeittests — das baut bereits `T_DATABASE/10_database_testschicht_pgtap.md`.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1, 2 und 3 vollständig. **Diese Säule ist bereits die reifste im gesamten Katalog (Top 10 %)** — die gefundenen Lücken sind Hygiene und Dokumentation, kein aktives Sicherheitsrisiko.
2. Beginne bei L1. Kein Meilenstein braucht Jan.
3. Nach jedem Meilenstein: Ampel in Abschnitt 4 aktualisieren.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein | Status | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | --- | :---: | --- | :---: | :---: |
| L0 | Kontext & Scope | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L1 | Doku-Korrektur (Batch-RPC-Ausnahme, fiktiver Funktionsname) | 🔴 geplant | `docs/database/03`, `xx_docs/01` | LLM | Nein |
| L2 | Residuale `SECURITY DEFINER`-Funktionen ohne `search_path` härten | 🔴 geplant | Neue Migration | LLM | Nein |
| L3 | Vollständiges Geld-RPC-Inventar-Skript | 🔴 geplant | `scripts/audit-rpc-patterns.ts` | LLM | Nein |
| L4 | CI-Gate mit dokumentierter Ausnahme-Allowlist | 🔴 geplant | Aufbau auf L3 | LLM | Nein |

**Warum kein Jan-Gate nötig ist:** L1/L3/L4 sind Doku-/Audit-/CI-Arbeit. L2 ist eine neue Migration, aber reine Hygiene an bereits per `REVOKE` gesperrtem, unerreichbarem Code — folgt dem Standard-K3/K4-Prozess wie jede andere Migration.

---

## 2 — Atomare Finanz-RPCs in 10 Subkategorien: Bewertung & Bottlenecks

> Skala: Top 1 % = Marktspitze, Top 100 % = praktisch nicht vorhanden. Bewertung basiert auf der Recherche in Abschnitt 3.

| # | Subkategorie | Niveau | Status | Kernbefund |
| :---: | --- | :---: | :---: | --- |
| 7 | Automatisierte Muster-Durchsetzung (Lint/CI) | **Top 85 %** | 🔴 | Keine CI/Lint prüft neue Geld-RPCs auf Advisory-Lock/`search_path`/Idempotenz — reine manuelle Disziplin + beratender Agent |
| 4 | Cross-Doc-Konsistenz (fiktive Funktionsnamen) | **Top 75 %** | 🔴 | `xx_docs/01_supabase_context.md:84-99` zeigt weiterhin ein fiktives `settle_standard_bet(...)`, obwohl `docs/database/03` selbst bereits korrekt feststellt, dass diese Funktion nicht existiert |
| 3 | `search_path`-Härtung (toter/residualer Code) | **Top 70 %** | 🟡 | 2 `SECURITY DEFINER`-Funktionen (`migrate_anonymous_session`, `upsert_anonymous_session`) nie `search_path`-gehärtet — unerreichbar durch REVOKE, aber Hygiene-Lücke |
| 10 | Architektur-Ausnahmen-Dokumentation (Batch-RPCs) | **Top 65 %** | 🟡 | `settle_daily_race` nutzt bewusst Job-Level- statt User-Level-Lock (architektonisch korrekt für Cron-Singleton) — widerspricht aber der pauschalen Doku-Behauptung "jede Finanz-RPC erzwingt Advisory-Lock", ohne die Ausnahme zu erklären |
| 6 | Doku-Vollständigkeit (98-Funktionen-Inventar) | **Top 60 %** | 🟡 | `docs/database/03` deep-dived bewusst nur 4 Kernfunktionen — kein Repo-Dokument zeigt Muster-Compliance für alle ~98 Funktionen |
| 5 | Idempotenz-Musterkonsistenz | **Top 40 %** | 🟡 | Überwiegend konsistent (`request_id`-Muster), `settle_daily_race` nutzt stattdessen einen Tages-Anker — architektonisch vertretbar, aber nicht als bewusste Ausnahme dokumentiert |
| 9 | Historische Exploit-Nachverfolgung | **Top 15 %** | 🟢 | `place_bet`/`settle_bet` (nachweislich live exploitierbar gewesen) sauber dokumentiert und in `059` gehärtet/gesperrt |
| 8 | Neueste-Migrationen-Disziplin (060–063) | **Top 10 %** | 🟢 | Alle neuen Funktionen folgen korrekt den etablierten Mustern, keine neue Lücke |
| 2 | `search_path`-Härtung (aktive/erreichbare RPCs) | **Top 5 %** | 🟢 | Keine aktuell aktive, erreichbare Geld-RPC ohne `search_path` gefunden |
| 1 | Advisory-Lock-Abdeckung (Nutzer-Request-RPCs) | **Top 5 %** | 🟢 | 47 Vorkommen in 17 Dateien, deckt sich exakt mit allen Nutzer-Request-getriebenen Geld-RPCs |

**Größte Bottlenecks (treiben die Action Items in Abschnitt 4):** #7 ist die Wurzel — ohne Automatisierung bleibt jede der anderen Lücken (#3, #10, #5, #6) eine Frage manueller Disziplin. #4 ist ein unabhängiger, einfach zu behebender Doku-Fund. #1, #2, #8, #9 sind bereits Weltklasse — diese Säule braucht **keine** grundlegende Sanierung, nur Nachschärfung an den Rändern.

---

## 3 — Verifizierter Ist-Stand (2026-09-05, gegen echten Repo-Code geprüft)

**Kernbefund — die Säule ist tatsächlich die reifste, aber nicht perfekt:** 47 `pg_advisory_xact_lock`-Vorkommen in 17 Dateien (`007,009,010,014,019,023,026,028,033,034,036,037,038,045,048,050,058`), deckt sich mit der Worldmap-Angabe. 142 `SET search_path`- vs. 152 `SECURITY DEFINER`-Treffer — die Differenz ist bekannt und historisch erklärt (siehe unten), keine aktuell aktive Lücke.

**Architektonisch begründete, aber undokumentierte Ausnahme:** `settle_daily_race` (`supabase/migrations/041_daily_race.sql:166,529`, finale Fassung in `060_pg_cron_retry_failure_handling.sql:529`) schreibt `users.balance`, nutzt aber **kein** `pg_advisory_xact_lock(user_id)` — stattdessen eine `FOR UPDATE`-Zeilensperre plus einen Tages-Idempotenzanker (`daily_races` `ON CONFLICT`). Absicherung kommt aus einem **Job-Level**-Lock (`pg_try_advisory_xact_lock`, `060:84,593`), da es sich um einen Cron-Batch-Prozess handelt, nicht um einen parallelen Nutzer-Request. Das ist architektonisch vertretbar (ein Singleton-Batch braucht keinen Pro-User-Lock), widerspricht aber wörtlich der pauschalen Behauptung in `docs/database/03_atomare_rpcs_transaktionen.md:229-231` ("Jede Finanz-RPC erzwingt …").

**Residuale Hygiene-Lücke:** `migrate_anonymous_session`/`upsert_anonymous_session` (`supabase/migrations/005_anonymous_sessions.sql:95,116`) sind `SECURITY DEFINER` ohne explizites `search_path` — der klassische Search-Path-Hijacking-Vektor. Sie wurden nach dem historischen `place_bet`/`settle_bet`-Exploit (`011_lock_down_legacy_rpcs.sql:12-19`, gehärtet in `059_harden_legacy_definer_search_path.sql:5-9`) **nicht** mitgehärtet, sondern nur per `REVOKE` (`011:40-41`) für Client-Rollen gesperrt — toter, aber nicht vollständig gehärteter Code.

**Cross-Doc-Drift:** `xx_docs/01_supabase_context.md:84-99` zeigt weiterhin ein fiktives `settle_standard_bet(...)`. `docs/database/03_atomare_rpcs_transaktionen.md:67` stellt selbst korrekt fest: "im realen Schema nicht existiert" (real: `settle_game_bet`) — die zwei Dokumente widersprechen sich also direkt.

**Keine automatisierte Muster-Durchsetzung:** Kein CI-Workflow oder Lint prüft, ob eine neue Geld-schreibende Funktion Advisory-Lock, `search_path` und Idempotenz einhält. `migration-security-guard` ist beratend (Pilot-Agent), kein automatischer Merge-Blocker.

**Aktuelle Disziplin ist intakt:** Migrationen 060–063 legen neue Funktionen an (Cron-Retry, `get_user_history_page`, `record_risk_event`, `enforce_self_exclusion_only_extends`, `get_daily_net_loss_cents`) — keine schreibt `users.balance` direkt, alle folgen den etablierten `SECURITY DEFINER`+`search_path`-Mustern, kein neuer Advisory-Lock-Gap.

---

## 4 — Meilensteine

### L1 — Doku-Korrektur

- **Ziel:** Die pauschale Behauptung präzisieren und den Cross-Doc-Drift schließen.
- **Schritte:**
  1. `docs/database/03_atomare_rpcs_transaktionen.md` Zeilen 229–231: "Jede Finanz-RPC erzwingt Advisory-Lock" durch eine präzisere Aussage ersetzen, die die `settle_daily_race`-Ausnahme explizit als architektonisch begründete Batch-Job-Variante benennt (Job-Level-Lock statt User-Level, weil Cron-Singleton).
  2. `xx_docs/01_supabase_context.md:84-99`: fiktives `settle_standard_bet(...)` durch den echten Namen `settle_game_bet` ersetzen.
  3. Status-Header präzisieren (Doku-Qualität ≠ System-Reifegrad, analog zu allen anderen Säulen).
- **Verifizierung:** `grep -n "settle_standard_bet" xx_docs/01_supabase_context.md` liefert keinen Treffer mehr.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L2 — Residuale `SECURITY DEFINER`-Funktionen härten

- **Ziel:** Subkategorie #3 schließen — konsequente `search_path`-Härtung ausnahmslos für **alle** `SECURITY DEFINER`-Funktionen, nicht nur erreichbare.
- **Schritte:** Neue Migration `supabase/migrations/0NN_harden_residual_definer_functions.sql` (Nummer frisch ermitteln): `ALTER FUNCTION migrate_anonymous_session(...) SET search_path = public, pg_temp;` und dasselbe für `upsert_anonymous_session` — analog zum bereits etablierten Muster aus `059_harden_legacy_definer_search_path.sql`. Pre-Flight-Kollisionscheck + Pflicht-`@migration-security-guard`-Review vor Abschluss.
- **Verifizierung:** `\df+` bzw. Funktionsmetadaten zeigen für beide Funktionen einen gesetzten `search_path` nach Anwendung.
- **Freigabe-Gate:** K3 lokal; Remote-Push regulär K4. **Money-Pfad:** Nein (unerreichbare Funktionen, kein aktiver Geldpfad). **Security-Review:** Pflicht.

### L3 — Vollständiges Geld-RPC-Inventar-Skript

- **Ziel:** Subkategorie #6 schließen — Muster-Compliance für alle Geld-RPCs sichtbar machen, nicht nur für die 4 dokumentierten Kernfunktionen.
- **Schritte:** Neues Skript `scripts/audit-rpc-patterns.ts` (Muster analog zu `scripts/audit-rls-coverage.ts` aus der Schwester-Planungsdatei Säule 4): grept alle `CREATE OR REPLACE FUNCTION`-Definitionen in `supabase/migrations/*.sql`, filtert auf Funktionen, die `users.balance`, `wallet_transactions` oder andere Geld-Tabellen schreiben, prüft je Funktion `pg_advisory_xact_lock`-Vorkommen, `search_path`-Vorkommen, `request_id`/Idempotenz-Anker-Muster. Ergebnis als Markdown-Tabelle nach `docs/database/rpc-pattern-matrix.md`. Bekannte, architektonisch begründete Ausnahmen (`settle_daily_race`) werden im Skript als "Ausnahme: Batch-Job, Job-Level-Lock" markiert, nicht als Fehler gezählt.
- **Verifizierung:** Generierte Matrix zeigt `settle_daily_race` korrekt als dokumentierte Ausnahme, nicht als generischen Fehlschlag.
- **Freigabe-Gate:** Keines (read-only). **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — CI-Gate mit dokumentierter Ausnahme-Allowlist

- **Ziel:** Subkategorie #7 schließen — künftige neue Geld-RPCs ohne die etablierten Muster automatisch erkennen, ohne architektonisch begründete Ausnahmen fälschlich zu blockieren.
- **Schritte:** Neuer CI-Schritt, der `scripts/audit-rpc-patterns.ts` (L3) ausführt; schlägt fehl, wenn eine Geld-schreibende Funktion weder Advisory-Lock noch einen Eintrag in einer expliziten Ausnahme-Allowlist (`scripts/rpc-pattern-exceptions.json` o. ä., initial nur `settle_daily_race` enthaltend, mit Begründungstext) hat. Eine neue Ausnahme darf nur durch expliziten Eintrag in dieser Allowlist plus Code-Review entstehen, nicht durch stillschweigendes Fehlen des Musters.
- **Verifizierung:** Workflow einmal mit einer absichtlich musterlosen Test-Funktion (lokal simuliert, nicht committet) getestet — schlägt fehl; mit `settle_daily_race` als einzigem Fall bleibt der reguläre Lauf grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (reine CI-Konfiguration, kein neuer Datenzugriff).

---

## 5 — Definition of Done

1. Die Doku behauptet keine falsche Pauschalregel mehr und nennt keine fiktiven Funktionsnamen (L1).
2. Alle `SECURITY DEFINER`-Funktionen sind ausnahmslos `search_path`-gehärtet, auch unerreichbarer Code (L2).
3. Eine generierte Matrix zeigt Muster-Compliance für alle Geld-RPCs, nicht nur die 4 Kernfunktionen (L3).
4. Ein CI-Gate verhindert künftig eine neue Geld-RPC ohne dokumentierte Muster oder explizite Ausnahme (L4).

---

## 6 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber Säule 10 (`T_DATABASE/10_database_testschicht_pgtap.md`) klar abgegrenzt: dort Laufzeittests, hier statische Code-Musterkonsistenz — keine Doppelarbeit.
- [x] Abhängigkeiten benannt: L3 vor L4 (Gate braucht das Inventar-Skript); L1 und L2 unabhängig.
- [x] Neue Schreiboperation (L2) hat Pre-Flight-Check, Pflicht-Security-Review und Verifizierung; betrifft nur bereits gesperrten, unerreichbaren Code.
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet (Abschnitt 3, Datum 2026-09-05) und verlinken auf Quellcode/Zeilen.
- [x] Keine Referenz doppelt gepflegt: pgTAP-Laufzeittests bleiben Scope von Säule 10, hier nur als Abgrenzung erwähnt.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 2 + 3 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Ehrlichkeits-Check:** `settle_daily_race` wurde nicht fälschlich als Bug gebrandmarkt — die Abweichung vom Standardmuster ist architektonisch begründet und wird als solche dokumentiert (L1) und in der Automatisierung als Ausnahme behandelt (L4), statt sie wegzuautomatisieren oder als Fehler zu melden.

---

## 7 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Kanonischer Doku-Standard (Säule 3) | [`docs/database/03_atomare_rpcs_transaktionen.md`](../docs/database/03_atomare_rpcs_transaktionen.md) — wird in L1 korrigiert |
| Kontextreferenz mit fiktivem Funktionsnamen | [`xx_docs/01_supabase_context.md`](../xx_docs/01_supabase_context.md) — wird in L1 korrigiert |
| Historischer Exploit-Fix (Referenzmuster für L2) | [`supabase/migrations/059_harden_legacy_definer_search_path.sql`](../supabase/migrations/059_harden_legacy_definer_search_path.sql) |
| Echter RPC-Laufzeittest (separater, abgegrenzter Plan) | [`T_DATABASE/10_database_testschicht_pgtap.md`](./10_database_testschicht_pgtap.md) |
| Schwester-Audit-Skript-Muster (Säule 4) | [`T_DATABASE/04_database_row_level_security.md`](./04_database_row_level_security.md) L2 |
| Gewichtete Subkategorien-Bewertung (Kategorie 02, alle 10 Säulen) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md) |
| Übergeordnete Aufschlüsselung (Kategorie 02) | [`worldmap/04_datenbank_migrationen.md`](../worldmap/04_datenbank_migrationen.md) |
| Planungsdateien-Konvention | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) |
