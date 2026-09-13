# 08 — Connection-Pooling & Skalierung

> **Status:** Execution-Ready (erweitert 2026-09-12) · **Stand:** 2026-09-12 · **Owner:** LLM (1 optionaler Jan-Touch bei L5b) · **Scope:** Monitoring, Verifikation und Resilienz des Supavisor-Connection-Poolings (lokal + Remote) für die Casino-Datenbank — jetzt inklusive Observability-Anbindung, Chaos-Test-Integration und synthetischem Erschöpfungstest. Kein Tarifwechsel, kein echter Lasttest gegen Produktion ohne Jan-Freigabe.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1 (Übersicht), Abschnitt 2 (Subkategorien-Bewertung) und Abschnitt 3 (verifizierter Ist-Stand) vollständig.
2. Beginne bei L1 in Reihenfolge (L1–L6 unverändert gegenüber der Erstfassung, weiterhin gültig und noch nicht ausgeführt). Die neuen Meilensteine **N1–N4** (Abschnitt 4a) bauen auf L2/L5a/L6 auf — erst nach diesen bearbeiten.
3. **Nur L5b braucht Jan** (echter Lasttest gegen die reale Produktions-Datenbank). Alles andere ist lokal/read-only.
4. **Cross-Datei-Abhängigkeit:** N1 koordiniert sich mit `T_DATABASE/11_database_query_performance_indexing.md` N1 (derselbe Lasttest-Lauf, zwei Auswertungen) — bei paralleler Bearbeitung beider Dateien vorher klären, welcher Subagent den Lasttest startet, um keinen doppelten gleichzeitigen Lauf zu erzeugen.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | --- | --- | :---: | :---: |
| L0 | Kontext & Scope | — | LLM | Nein |
| L1 | Doku-Korrektur (Status-Header, fiktives Skript, lokal/Remote-Diskrepanz) | `docs/database/08` korrigieren | LLM | Nein |
| L2 | Echtes Health-Check-Skript bauen | `scripts/check-pooler-health.ts` | LLM | Nein |
| L3 | npm-Script + Wiederholbarkeit | `db:pooler-health` ergänzen | LLM | Nein |
| L4 (optional) | CI-Cron-Monitoring | Analog `doc-drift-check.yml` | LLM, ggf. 1 Jan-Secret | Nein |
| L5a | Lasttest lokal um Connection-Counts erweitern | `bet-flow.artillery.yml` erweitern | LLM | Nein |
| L5b (optional) | Echter Lasttest gegen Produktion | Nur mit Jan-Freigabe | **Jan-Freigabe**, Ausführung LLM | Nein (read-only Last, keine echten Wetten) |
| L6 | Retry-/Backoff-Logik für DB-Verbindungsfehler | Bet-Route + Service-Layer | LLM | Nein (nutzt bestehende Idempotenz) |
| N1 | Lasttest-Kopplung mit Säule 7 (gemeinsamer Lauf) | Koordination mit `11_...md` N1 | LLM | Nein |
| N2 | Observability-Integration (Sentry statt nur stdout) | `check-pooler-health.ts` erweitern | LLM | Nein |
| N3 | Chaos-Test-Update für neue Retry-Semantik (L6) | `run-fault-test.mjs` anpassen | LLM | Nein |
| N4 | Synthetischer Pool-Erschöpfungstest | Neues Skript, nur lokal | LLM | Nein |

**Warum praktisch kein Jan-Gate nötig ist:** Alle Kernschritte (L1–L4, L5a, L6, N1–N4) sind entweder read-only (Health-Check, Lasttest-Erweiterung lokal) oder reiner Code-/Doku-Aufbau ohne externe Wirkung. Nur L5b (Lasttest gegen die **echte** Produktionsdatenbank mit echten Spielern) ist ein reales Risiko für den Live-Betrieb und braucht deshalb explizite Jan-Freigabe — analog zur bestehenden K-Level-Logik in `docs/database/08_connection_pooling_supavisor.md` §7.

**Warum diese Erweiterung (Jan-Kontext, 2026-09-12):** Die Erstfassung dieser Datei war bereits Execution-Ready und methodisch solide, aber noch **nicht ausgeführt** (alle Meilensteine offen) und deckte drei Dinge nicht ab: (1) das Ergebnis des Health-Checks landete nur in CI-Logs, nicht in einem echten Observability-Tool, (2) der bestehende Chaos-Test (`scripts/chaos/run-fault-test.mjs`, Initiative 1.10) erwartet aktuell "immer 5xx bei einem Fault" — nach L6 (Retry-Logik) wird das für transiente Fehler falsch, ohne dass die Erstfassung das vorgesehen hätte, (3) die dokumentierten Warn-/Kritisch-Schwellen (140/42, 180/55) wurden nie tatsächlich lokal erreicht, nur aus der Doku übernommen. Die **"Status"-Spalte wurde entfernt** (durchgängig 🔴 vor Ausführung, kein Mehrwert gegenüber der reinen Meilensteinliste in einer frischen Execution-Ready-Datei).

---

## 2 — Connection-Pooling in 10 Subkategorien: Bewertung & Bottlenecks

> Skala: Top 1 % = Marktspitze, Top 100 % = praktisch nicht vorhanden. Bewertung basiert auf der Recherche in Abschnitt 3, nicht auf der bestehenden (teils widersprüchlichen) Doku.

| # | Subkategorie | Niveau | Status | Kernbefund |
| :---: | --- | :---: | :---: | --- |
| 2 | Monitoring & Health-Check-Automatisierung | **Top 95 %** | 🔴 | Das in der Doku beschriebene Health-Check-Skript existiert **nicht als Datei** — reiner Pseudocode |
| 6 | Retry-/Failover-Resilienz bei Verbindungsfehlern | **Top 90 %** | 🔴 | Kein Retry/Backoff im Code; jeder DB-Fehler wird sofort als 500 durchgereicht |
| 7 | Doku-Konsistenz (Status-Header vs. echter Zustand) | **Top 90 %** | 🔴 | Doku behauptet „Top 1 % — Produktionsreif", Worldmap misst Top 35 %; dasselbe Muster wie bei Säule 9/10 bereits gefunden |
| 3 | Lasttest-Verifikation der dokumentierten Schwellenwerte | **Top 85 %** | 🔴 | Artillery-Lasttest existiert, misst aber keine Connection-Counts — die Schwellen 140/42 wurden nie empirisch geprüft |
| 8 | Lokale/Remote-Paritäts-Dokumentation | **Top 60 %** | 🟡 | `config.toml` (lokal: 20/100) weicht von den dokumentierten Remote-Werten (15/200) ab, ohne erklärten Grund |
| 10 | Kosten-/Skalierungspfad (Nano→Pro-Tier) | **Top 30 %** | 🟡 | Als Entscheidungspunkt dokumentiert, aber kein konkreter Trigger-Mechanismus |
| 1 | Pooler-Architektur & Konfiguration | **Top 20 %** | 🟢 | Transaction-Mode korrekt gewählt, Supavisor Shared Nano läuft, lokale Parität grundsätzlich verifiziert |
| 9 | Eskalations-Runbook (K-Level, Schwellen, Reaktionsschritte) | **Top 20 %** | 🟢 | Auf dem Papier vollständig (K1/K3/K4-Matrix, konkrete Zahlen) — fehlt nur die Automatisierung, die es auslöst (siehe #2) |
| 4 | Client-seitiges Connection-Handling | **Top 15 %** | 🟢 | Alle 3 Supabase-Clients laufen korrekt über REST/PostgREST, kein Client umgeht den Pooler oder hält rohe PG-Verbindungen offen |
| 5 | Prepared-Statement-/Transaction-Mode-Kompatibilität | **Top 5 %** | 🟢 | Verifiziert sauber: keine Session-level Prepared Statements im Code, REST-Architektur vermeidet diese Fehlerklasse strukturell |

**Größte Bottlenecks (treiben die Action Items in Abschnitt 4):** #2 (Monitoring existiert nur als Fiktion), #6 (keine Resilienz bei Verbindungsfehlern), #7 (Doku überzeichnet den Reifegrad), #3 (Schwellenwerte nie empirisch verifiziert). Diese vier treiben L1–L3, L5a und L6. #8 und #10 sind niedrigere Priorität (dokumentierte, aber nicht dringende Lücken). #1, #4, #5, #9 sind bereits solide — reiner Erhalt-Modus.

---

## 3 — Verifizierter Ist-Stand (2026-09-04, gegen echten Repo-Code geprüft)

**`supabase/config.toml` `[db.pooler]` (Zeilen 44–54):** `enabled = true`, `port = 54329`, `pool_mode = "transaction"`, `default_pool_size = 20`, `max_client_conn = 100`. **Diese lokalen Werte weichen von den in `docs/database/08_connection_pooling_supavisor.md` §4 dokumentierten Remote-Produktionswerten (Pool Size 15, Max 200 Clients, Max 60 direkte DB-Verbindungen, Nano-Tier) ab** — die Remote-Werte stehen nur im Supabase-Dashboard, nicht in einer Repo-Datei, und die Diskrepanz ist bisher nirgends erklärt (siehe Subkategorie #8).

**App-seitiges Connection-Handling:** Alle drei Supabase-Clients (`src/utils/supabase/client.ts:4-26`, `server.ts:4-28`, `admin.ts:11-31`) laufen über `@supabase/supabase-js`/`@supabase/ssr` (REST/PostgREST), kein direkter PostgreSQL-Treiber, kein Client setzt explizit den Pooler-Port. Pooling passiert serverseitig bei Supabase — der App-Code muss dafür nichts Besonderes tun (bestätigt Subkategorie #4 als solide).

**Health-Check-Skript existiert nicht:** `docs/database/08_connection_pooling_supavisor.md` §6 (Zeilen 111–129) enthält einen PowerShell-Codeblock mit dem Pfadkommentar `# scripts/check-pooler-health.ps1` — diese Datei **existiert nicht im Repo** (`Glob scripts/*pooler*` liefert 0 Treffer). Reine Doku-Fiktion, identisches Muster wie das fiktive `scripts/backup-export.ps1` in Säule 9 (siehe `T_DATABASE/05_database_backup_and_recovery.md` L4).

**Remote-Schwellenwerte (aus `docs/database/08_connection_pooling_supavisor.md`, §4–§5):** Normal: <80 Pooler-Clients / <25 DB-Verbindungen. Warnung: ≥140 Pooler-Clients ODER ≥42 DB-Verbindungen über ≥15 Min → Upstash-Rate-Limiter drosselt, DB-Statistik prüfen. Kritisch: ≥180 Pooler-Clients ODER ≥55 DB-Verbindungen → Crons pausieren, Pro-Tier-Upgrade prüfen. K-Level (§7): Port-Test/Verbindungsabfrage K1, `pool_mode`-Änderung K3, `pg_terminate_backend` K4.

**Keine Retry-/Failover-Logik:** `src/proxy.ts` enthält keine DB-Verbindungs-Retry-Logik. Im Bet-Pfad (`src/app/api/casino/bet/route.ts:389-404`) gibt genau ein `catch`-Block jeden Fehler (inkl. potenzieller Connection-Fehler) sofort als 500 zurück — kein Backoff, kein Retry. **Wichtig für L6:** Da jede Wette bereits eine `requestId`-basierte Idempotenz besitzt (siehe `xx_sop/09_security_wallet_invariants.md`), ist ein Retry bei transienten Verbindungsfehlern **sicher** — ein wiederholter Aufruf mit derselben `requestId` liefert laut bestehendem RPC-Design den gecachten Snapshot zurück, keine doppelte Buchung.

**Wiederverwendbares Lasttest-Tooling:** `docs/archive/05_Observability_und_Lasttest.md` dokumentiert ein bereits gebautes **Artillery**-Setup: [`scripts/loadtest/bet-flow.artillery.yml`](../scripts/loadtest/bet-flow.artillery.yml), [`scripts/loadtest/bet-flow.processor.mjs`](../scripts/loadtest/bet-flow.processor.mjs), npm-Script `loadtest:bet`. Phasen: Warmup (1/s, 15s) → Ramp-up (2→15/s, 30s) → Sustained Peak (15/s, 30s). Dokumentierter Vorbefund: `settle-bet-rpc`/`consume_active_seed` zeigten p95 3,4–5,4s und 45,6 % Timeouts bei ~15 gleichzeitigen VUs lokal — das war ein Advisory-Lock-Kontentions-Befund, **keine** Pooler-spezifische Messung, weil `pg_stat_activity`-Connection-Counts nicht mitgeloggt wurden.

**Keine Prepared-Statement-Inkompatibilität:** Keine Treffer für `PREPARE`/`prepareStatement` in `src/`. Da die gesamte Datenbank-Interaktion über REST/PostgREST + Stored-Function-Aufrufe läuft, entsteht strukturell kein Session-level Prepared-Statement-Zustand, der mit Supavisor Transaction-Mode kollidieren könnte (bestätigt Subkategorie #5 als bereits sauber, kein Meilenstein nötig).

---

## 4 — Meilensteine

### L1 — Doku-Korrektur: Status-Header, fiktives Skript, lokal/Remote-Diskrepanz

- **Ziel:** `docs/database/08_connection_pooling_supavisor.md` an den echten Zustand angleichen.
- **Schritte:**
  1. Status-Header „🟢 Produktionsreif (Top 1 % — Weltklasse)" präzisieren analog zum bereits etablierten Muster (siehe `T_DATABASE/00_DATABASE_VERBESSERUNG.md` Abschnitt 1): Doku-Qualität ≠ System-Reifegrad. System-Reifegrad-Wert siehe Abschnitt 2 dieser Datei.
  2. §6 PowerShell-Codeblock (fiktives `check-pooler-health.ps1`) durch einen Verweis auf das echte Skript aus L2 dieser Datei ersetzen, sobald L2 fertig ist (Reihenfolge beachten: L1 Teilschritt 2 erst nach L2 abschließen, oder als Platzhalter „siehe L2" markieren und später final verlinken).
  3. Lokale (`config.toml`: 20/100) vs. Remote-Werte (Doku: 15/200) explizit als zwei getrennte, bewusst unterschiedliche Konfigurationsebenen kennzeichnen: lokal großzügiger für reibungslose Entwicklung, Remote-Wert vom Supabase-Nano-Tier vorgegeben — **diese Erklärung ist eine plausible Annahme, keine verifizierte Tatsache**; falls Jan eine andere Begründung kennt, hier nachtragen.
- **Verifizierung:** `grep -n "Top 1 %" docs/database/08_connection_pooling_supavisor.md` zeigt nur noch die präzisierte Formulierung; kein PowerShell-Pseudocode mehr ohne Verweis auf eine echte Datei.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L2 — Echtes Health-Check-Skript bauen

- **Ziel:** Das bisher nur fiktive Skript real implementieren, konsistent mit den bestehenden TS-Skripten (`scripts/backup-supabase.ts`, `scripts/audit-query-performance.ts` aus `T_DATABASE/11_database_query_performance_indexing.md`), nicht als PowerShell (Plattformbindung vermeiden).
- **Schritte:**
  1. Neues Skript `scripts/check-pooler-health.ts`: fragt `SELECT count(*) AS active_connections, application_name, state FROM pg_stat_activity GROUP BY application_name, state;` gegen `--linked` ab (Standard-Postgres-Systemview, kein Rätselraten über CLI-Subcommand-Namen nötig).
  2. Ausgabe gegen die in Abschnitt 3 dokumentierten Schwellen (Normal/Warnung/Kritisch) bewerten, Ergebnis als JSON auf `stdout` ausgeben (`status: "normal"|"warning"|"critical"`, `activeConnections`, `threshold`).
  3. Reines Read-Only (`SELECT` auf eine System-View) — kein Schreibzugriff, kein `pg_terminate_backend` (das bleibt manuell und K4-gated laut bestehender Doku).
- **Verifizierung:** `npx tsx scripts/check-pooler-health.ts` läuft lokal durch, liefert plausible Werte (niedrige Connection-Zahl im Ruhezustand).
- **Freigabe-Gate:** Keines (reine `SELECT`-Abfrage gegen eine Systemview, K1-Klasse). **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — npm-Script + Wiederholbarkeit

- **Ziel:** Analog zu `backup:run`/`db:perf-audit` einen konsistenten Einstiegspunkt schaffen.
- **Schritte:** `package.json` um `"db:pooler-health": "tsx scripts/check-pooler-health.ts"` ergänzen.
- **Verifizierung:** `npm run db:pooler-health` liefert identisches Ergebnis zum direkten `tsx`-Aufruf.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 (optional, nachrangig) — CI-Cron-Monitoring

- **Ziel:** Regelmäßige, nicht auf manuelles Erinnern angewiesene Überwachung.
- **Schritte:** `.github/workflows/pooler-health-check.yml` nach der bereits etablierten Vorlage `doc-drift-check.yml` (siehe `T_DATABASE/11_database_query_performance_indexing.md` L7 für dasselbe Muster): `schedule: cron` (z. B. täglich), ruft `npm run db:pooler-health` (L3) auf. **Braucht dieselbe `SUPABASE_ACCESS_TOKEN`/DB-Connection-String-Secret-Hinterlegung wie in Säule 7 L7 beschrieben** — falls dieses Secret im Zuge von Säule 7 bereits von Jan hinterlegt wurde, kann dieser Workflow es wiederverwenden, kein zweites Mal anfragen nötig.
- **Freigabe-Gate:** Nur für das Secret-Hinterlegen, falls noch nicht aus Säule 7 vorhanden. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L5a — Lasttest lokal um Connection-Counts erweitern

- **Ziel:** Die dokumentierten Schwellenwerte (140/42, 180/55) erstmals empirisch mit echten Connection-Zahlen unterlegen, nicht nur mit RPC-Latenz.
- **Schritte:**
  1. `scripts/loadtest/bet-flow.processor.mjs` um einen periodischen Sampling-Hook erweitern, der während des Lasttest-Laufs alle 5s `check-pooler-health.ts` (L2) aufruft und das Ergebnis mitloggt.
  2. `npm run loadtest:bet` (bestehend) lokal gegen die lokale Supabase-Instanz erneut ausführen, dieses Mal mit Connection-Count-Zeitreihe im Ergebnis.
  3. Ergebnis in `docs/database/audits/pooler-loadtest-<YYYY-MM-DD>.md` persistieren (gleiche Konvention wie die Query-Performance-Audits aus Säule 7).
- **Verifizierung:** Audit-Datei zeigt Connection-Counts über die Zeit neben der bereits bekannten RPC-Latenz-Zeitreihe.
- **Freigabe-Gate:** Keines (läuft ausschließlich lokal). **Money-Pfad:** Nein (synthetische Loadtest-User, wie im bestehenden Setup bereits etabliert). **Security-Review:** Nein.

### L5b (optional, nachrangig) — Echter Lasttest gegen Produktion

- **Ziel:** Die Remote-Schwellenwerte (140/42 Warnung) unter realer Infrastruktur (nicht nur lokal) verifizieren.
- **Warum Jan-Gate:** Ein Lasttest gegen die echte Produktionsdatenbank kann reale Spieler beeinträchtigen (Latenz-Spitzen, im Extremfall Pooler-Erschöpfung) — das ist ein echtes Betriebsrisiko, kein rein lokales Experiment. Analog zur bestehenden Zurückhaltung bei „Live-Restore" (K5) in Säule 9.
- **Ablauf nach Freigabe:** `loadtest:bet` (erweitert aus L5a) gegen eine Staging- oder zeitlich abgestimmte Low-Traffic-Phase der Produktionsdatenbank ausführen, `check-pooler-health.ts` parallel mitlaufen lassen, Ergebnis mit den dokumentierten Schwellen abgleichen.
- **Freigabe-Gate:** K4 (explizite Jan-Bestätigung vor Ausführung gegen echte Infrastruktur). **Money-Pfad:** Nein (Lasttest erzeugt keine echten Wetten, nur synthetische Requests — trotzdem Freigabe nötig wegen Infrastruktur-Risiko). **Security-Review:** Pflicht.

### L6 — Retry-/Backoff-Logik für DB-Verbindungsfehler

- **Ziel:** Transiente Verbindungsfehler (z. B. kurzzeitige Pooler-Erschöpfung) nicht sofort als 500 an den Spieler durchreichen, sondern sicher wiederholen.
- **Schritte:**
  1. In `src/app/api/casino/bet/route.ts` (und analogen kritischen Schreibpfaden) einen begrenzten Retry (z. B. 2 Versuche, kurzer Backoff) **ausschließlich** für als „Connection"-Fehler klassifizierte Fehlertypen einbauen — nicht für Geschäftslogik-Fehler wie `Insufficient balance` (409), die sofort und ohne Retry zurückgegeben werden müssen.
  2. **Sicherheitsbegründung:** Da jede Wette eine `requestId`-basierte Idempotenz besitzt (`xx_sop/09_security_wallet_invariants.md`), liefert ein wiederholter Aufruf mit derselben `requestId` den gecachten Snapshot zurück — kein Doppel-Buchungsrisiko durch den Retry.
  3. Retry-Grenze und Backoff-Zeiten so wählen, dass die Gesamt-Latenz nicht das dokumentierte RTO/Antwortzeit-Budget sprengt (kurzer Backoff, max. 2 Versuche).
- **Verifizierung:** Neuer Vitest-Test simuliert einen einmaligen Connection-Fehler gefolgt von Erfolg — Antwort ist trotzdem 200 mit korrektem `WalletSnapshot`, kein doppelter Kontostands-Effekt (Idempotenz-Check).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Ja (Änderung im Geld-Antwortpfad). **Security-Review:** Pflicht (muss zwingend zwischen „Connection-Fehler" und „Geschäftslogik-Fehler" unterscheiden — ein Retry auf einen echten Ablehnungsgrund wäre ein Bug).

---

## 4a — Neue Meilensteine (N1–N4, bauen auf L2/L5a/L6 auf)

### N1 — Lasttest-Kopplung mit Säule 7 (ein Lauf, zwei Auswertungen)

- **Ziel:** L5a misst Connection-Counts während eines Lasttests; `T_DATABASE/11_database_query_performance_indexing.md` N1 braucht denselben Lasttest für Query-Latenz-Sampling unter Last. Statt zweier getrennter Lasttest-Infrastrukturen (Ressourcenverschwendung, Gefahr widersprüchlicher Ergebnisse aus unterschiedlichen Läufen) läuft **ein gemeinsamer Lauf**.
- **Schritte:** `npm run loadtest:bet` so orchestrieren, dass sowohl `check-pooler-health.ts`-Sampling (L5a) als auch das Query-Audit-Sampling (Säule 7 N1) parallel während desselben Laufs mitschreiben; beide Ergebnisse referenzieren denselben Zeitstempel/Lauf-ID, damit sie später nebeneinander gelesen werden können.
- **Verifizierung:** Ein einziger `loadtest:bet`-Lauf erzeugt sowohl eine Pooling-Audit-Datei als auch eine Query-Performance-Load-Audit-Datei mit übereinstimmendem Zeitstempel.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### N2 — Observability-Integration statt reiner stdout/CI-Log-Ausgabe

- **Ziel:** Ein Health-Check, der nur in CI-Logs landet, wird in der Praxis nicht laufend beobachtet. Der Stack nutzt bereits Sentry — Weltklasse-Monitoring nutzt vorhandene Werkzeuge statt neue Dashboards zu bauen.
- **Schritte:** `scripts/check-pooler-health.ts` (L2) um einen optionalen Versand des Ergebnisses als Sentry-Custom-Metric/Breadcrumb erweitern (nur wenn `SENTRY_DSN` in der Umgebung gesetzt ist — lokale Läufe ohne Sentry-Konfiguration funktionieren unverändert per stdout weiter, kein Breaking Change).
- **Verifizierung:** Lokaler Lauf mit gesetzter Test-DSN erzeugt einen sichtbaren Sentry-Eintrag; ohne DSN läuft das Skript unverändert wie vor N2.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (nur Metrikversand, keine neuen Datenzugriffsrechte).

### N3 — Chaos-Test-Update für die neue Retry-Semantik (schließt eine Lücke, die L6 sonst selbst als Regression melden würde)

- **Ziel:** [`scripts/chaos/run-fault-test.mjs`](../scripts/chaos/run-fault-test.mjs) (Initiative 1.10) prüft aktuell die Invariante "unter jedem Fault-Modus antwortet `/api/casino/bet` immer mit 5xx, nie 200". Nach L6 (Retry-Logik) ist das für **einmalige transiente** Fehler nicht mehr die erwartete Semantik — ein `reset`-Fault gefolgt von Erfolg beim Retry soll nach L6 tatsächlich `200` liefern. Ohne dieses Update würde der bestehende Chaos-Test L6 fälschlich als Bug markieren.
- **Schritte:**
  1. `run-fault-test.mjs` um einen neuen Modus-Parameter erweitern, der einen **einmaligen** transienten Fault simuliert (Fault beim ersten Versuch, `pass` beim Retry) statt eines dauerhaften Fault-Zustands — bestehende Dauerfault-Modi (`hang`/`reset`/`502`/`504` ohne Erholung) bleiben unverändert und erwarten weiterhin durchgehend 5xx (Retry erschöpft sich, Antwort bleibt korrekt ein Fehler).
  2. Neue Erwartung für den einmaligen Fault-Fall: `200` mit korrektem `WalletSnapshot`, kein doppelter Kontostands-Effekt (gleiche Idempotenz-Prüfung wie im L6-Vitest-Test).
- **Verifizierung:** `node scripts/chaos/run-fault-test.mjs` mit dem neuen einmaligen Fault-Modus liefert `200` nach L6; die bestehenden Dauerfault-Modi liefern weiterhin ausschließlich 5xx (Regressionstest für die bereits etablierte Garantie).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Ja (testet den echten Geld-Antwortpfad unter Fehlerbedingungen). **Security-Review:** Pflicht (gleiche Sorgfalt wie L6 — sicherstellen, dass der Retry weiterhin nur bei echten Connection-Fehlern greift, nicht bei Geschäftslogik-Ablehnungen).

### N4 — Synthetischer Pool-Erschöpfungstest

- **Ziel:** Die dokumentierten Warn-/Kritisch-Schwellen (140/42 Pooler-Clients bzw. DB-Verbindungen, 180/55 kritisch) stammen bisher ausschließlich aus der Doku, nicht aus einer tatsächlichen Beobachtung — L5a/N1 misst reale Last, aber nicht notwendigerweise genug, um die Schwellen tatsächlich zu erreichen.
- **Schritte:** Neues, ausschließlich lokales Skript `scripts/pool-exhaustion-test.ts`: öffnet gezielt eine konfigurierbare Anzahl paralleler Verbindungen gegen die lokale Pooler-Instanz (Port 54329), bis entweder die dokumentierte Warnschwelle erreicht wird oder der Pooler Verbindungen ablehnt; loggt dabei parallel `check-pooler-health.ts` (L2), um das tatsächliche Verhalten (Fehlerklasse, Meldungstext) am Schwellenwert zu dokumentieren statt ihn nur zu behaupten.
- **Verifizierung:** Lauf gegen die lokale Instanz erzeugt einen dokumentierten Beleg (Verbindungsanzahl bei erster Ablehnung, exakte Fehlermeldung) in `docs/database/audits/pool-exhaustion-<YYYY-MM-DD>.md`.
- **Freigabe-Gate:** Keines (ausschließlich gegen die lokale Instanz, niemals gegen `--linked`/Remote — expliziter Safety-Guard im Skript analog zum Connection-String-Guard in `T_DATABASE/05_database_backup_and_recovery.md`). **Money-Pfad:** Nein. **Security-Review:** Pflicht (Guard gegen versehentliches Ausführen gegen Remote verifizieren).

---

## 5 — Definition of Done

1. Ein echtes, lauffähiges Health-Check-Skript ersetzt den bisherigen Doku-Pseudocode (L2/L3), inklusive Observability-Anbindung (N2).
2. Die dokumentierten Schwellenwerte sind lokal empirisch mit echten Connection-Counts unterlegt (L5a, gekoppelt mit Säule 7 über N1) **und** tatsächlich einmal erreicht/beobachtet (N4) — nicht nur aus der Doku übernommen.
3. Transiente DB-Verbindungsfehler führen nicht mehr sofort zu einem harten 500 (L6); der bestehende Chaos-Test bildet diese neue Semantik korrekt ab, statt L6 fälschlich als Regression zu melden (N3).
4. Die Doku-Status-Behauptung ist präzisiert (L1); die lokale/Remote-Konfigurationsdiskrepanz ist zumindest als bewusste Annahme dokumentiert.
5. Ein echter Produktions-Lasttest bleibt optional mit Jan-Gate (L5b); kontinuierliches CI-Monitoring optional (L4).
6. Erst nach L1–L6 **und** N1–N4 gilt Säule 8 als voraussichtlich **Top 15–20 %** (statt der bisherigen Top 35 %) — getragen durch echte Beobachtung statt Doku-Annahme, Observability statt reinem Log, und eine Chaos-Test-Suite, die die neue Retry-Semantik korrekt validiert statt sie fälschlich zu verwerfen.

---

## 6 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber Säule 7 (`T_DATABASE/11_database_query_performance_indexing.md`, Query-Performance/Indexing) abgegrenzt: Diese Datei behandelt Verbindungs-/Pooling-Kapazität, nicht Query-Pläne oder Indizes — N1 koppelt den Lasttest bewusst statt ihn zu duplizieren.
- [x] Abhängigkeiten benannt: L2 vor L1-Teilschritt-2 und vor L3/L4/L5a; L5a vor L5b; L6 unabhängig; N1 vor Säule-7-N1 koordiniert; N3 nach L6; N2/N4 unabhängig.
- [x] Neue Schreiboperation: L6 und N3 berühren den Geld-Antwortpfad — Security-Review Pflicht bei beiden, explizit auf Fehlerklassen-Unterscheidung geprüft.
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet (Abschnitt 3) und verlinken auf Quellcode/Zeilen; die lokale/Remote-Diskrepanz ist explizit als unverifizierte Annahme markiert, nicht als Tatsache verkauft.
- [x] Keine Referenz doppelt gepflegt: K-Level-Matrix und Schwellenwerte bleiben in `docs/database/08_connection_pooling_supavisor.md`, Lasttest-Infrastruktur bleibt bei dieser Datei, Säule 7 konsumiert nur (siehe N1).
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 2 + 3 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Kritischer Selbstcheck:** L6 (Retry-Logik) hätte naiv umgesetzt ein Doppel-Buchungsrisiko schaffen können — die bestehende Idempotenz-Garantie wurde explizit als Sicherheitsvoraussetzung geprüft. **Zusätzlicher Selbstcheck bei dieser Erweiterung:** Ohne N3 hätte L6 den eigenen, bereits etablierten Chaos-Test (Initiative 1.10) fälschlich rot werden lassen — dieser Konflikt wurde erkannt und durch N3 aufgelöst, statt L6 isoliert zu betrachten.

---

## 7 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Kanonischer Doku-Standard (Säule 8) | [`docs/database/08_connection_pooling_supavisor.md`](../docs/database/08_connection_pooling_supavisor.md) — wird in L1 korrigiert |
| Bestehendes Lasttest-Tooling | [`docs/archive/05_Observability_und_Lasttest.md`](../docs/archive/05_Observability_und_Lasttest.md) |
| Bestehende Chaos-Test-Infrastruktur (Grundlage für N3) | [`scripts/chaos/run-fault-test.mjs`](../scripts/chaos/run-fault-test.mjs), [`scripts/chaos/README.md`](../scripts/chaos/README.md) |
| Finanz-/Idempotenz-Invarianten (Grundlage für L6/N3) | [`xx_sop/09_security_wallet_invariants.md`](../xx_sop/09_security_wallet_invariants.md) |
| Gekoppelte Datei (gemeinsamer Lasttest, N1) | [`T_DATABASE/11_database_query_performance_indexing.md`](./11_database_query_performance_indexing.md) |
| Gewichtete Subkategorien-Bewertung (Kategorie 02, alle 10 Säulen) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md) |
| Übergeordnete Aufschlüsselung (Kategorie 02) | [`T_DATABASE/04_datenbank_migrationen.md`](../T_DATABASE/04_datenbank_migrationen.md) |
| Planungsdateien-Konvention | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) |
