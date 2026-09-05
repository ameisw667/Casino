# 08 — Connection-Pooling & Skalierung

> **Status:** Execution-Ready · **Stand:** 2026-09-04 · **Owner:** LLM (1 optionaler Jan-Touch bei L5b) · **Scope:** Monitoring, Verifikation und Resilienz des Supavisor-Connection-Poolings (lokal + Remote) für die Casino-Datenbank. Kein Tarifwechsel, kein echter Lasttest gegen Produktion ohne Jan-Freigabe.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1 (Übersicht), Abschnitt 2 (Subkategorien-Bewertung) und Abschnitt 3 (verifizierter Ist-Stand) vollständig.
2. Beginne bei L1 in Reihenfolge. **Nur L5b braucht Jan** (echter Lasttest gegen die reale Produktions-Datenbank — Risiko für echte Spieler). Alles andere ist lokal/read-only.
3. Nach jedem Meilenstein: Ampel in Abschnitt 4 aktualisieren.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein | Status | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | --- | :---: | --- | :---: | :---: |
| L0 | Kontext & Scope | 🟢 verifiziert (2026-09-04) | — | LLM | Nein |
| L1 | Doku-Korrektur (Status-Header, fiktives Skript, lokal/Remote-Diskrepanz) | 🔴 geplant | `docs/database/08` korrigieren | LLM | Nein |
| L2 | Echtes Health-Check-Skript bauen | 🔴 geplant | `scripts/check-pooler-health.ts` | LLM | Nein |
| L3 | npm-Script + Wiederholbarkeit | 🔴 geplant | `db:pooler-health` ergänzen | LLM | Nein |
| L4 (optional) | CI-Cron-Monitoring | 🔴 geplant, nachrangig | Analog `doc-drift-check.yml` | LLM, ggf. 1 Jan-Secret | Nein |
| L5a | Lasttest lokal um Connection-Counts erweitern | 🔴 geplant | `bet-flow.artillery.yml` erweitern | LLM | Nein |
| L5b (optional) | Echter Lasttest gegen Produktion | 🔴 geplant, nachrangig | Nur mit Jan-Freigabe | **Jan-Freigabe**, Ausführung LLM | Nein (read-only Last, keine echten Wetten) |
| L6 | Retry-/Backoff-Logik für DB-Verbindungsfehler | 🔴 geplant | Bet-Route + Service-Layer | LLM | Nein (nutzt bestehende Idempotenz) |

**Warum praktisch kein Jan-Gate nötig ist:** Alle Kernschritte (L1–L4, L5a, L6) sind entweder read-only (Health-Check, Lasttest-Erweiterung lokal) oder reiner Code-/Doku-Aufbau ohne externe Wirkung. Nur L5b (Lasttest gegen die **echte** Produktionsdatenbank mit echten Spielern) ist ein reales Risiko für den Live-Betrieb und braucht deshalb explizite Jan-Freigabe — analog zur bestehenden K-Level-Logik in `docs/database/08_connection_pooling_supavisor.md` §7.

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

## 5 — Definition of Done

1. Ein echtes, lauffähiges Health-Check-Skript ersetzt den bisherigen Doku-Pseudocode (L2/L3).
2. Die dokumentierten Schwellenwerte sind mindestens einmal lokal empirisch mit echten Connection-Counts unterlegt (L5a); ein echter Produktions-Lasttest bleibt optional mit Jan-Gate (L5b).
3. Transiente DB-Verbindungsfehler führen nicht mehr sofort zu einem harten 500 (L6), ohne die Idempotenz- oder Geschäftslogik-Garantien zu verändern.
4. Die Doku-Status-Behauptung ist präzisiert (L1); die lokale/Remote-Konfigurationsdiskrepanz ist zumindest als bewusste Annahme dokumentiert, auch wenn nicht abschließend verifiziert.
5. (Optional) Kontinuierliches CI-Monitoring läuft (L4).

---

## 6 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber Säule 7 (`T_DATABASE/11_database_query_performance_indexing.md`, Query-Performance/Indexing) abgegrenzt: Diese Datei behandelt Verbindungs-/Pooling-Kapazität, nicht Query-Pläne oder Indizes — L4 verweist nur auf dasselbe CI-Vorlagen-Muster, baut keine doppelte Infrastruktur.
- [x] Abhängigkeiten benannt: L2 vor L1-Teilschritt-2 (Doku braucht das echte Skript zum Verlinken) und vor L3/L4/L5a; L5a vor L5b; L6 unabhängig.
- [x] Neue Schreiboperation: L6 ist die einzige, die den Geld-Antwortpfad berührt — Security-Review Pflicht, explizit auf Fehlerklassen-Unterscheidung geprüft.
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet (Abschnitt 3, Datum 2026-09-04) und verlinken auf Quellcode/Zeilen; die lokale/Remote-Diskrepanz ist explizit als unverifizierte Annahme markiert, nicht als Tatsache verkauft.
- [x] Keine Referenz doppelt gepflegt: K-Level-Matrix und Schwellenwerte bleiben in `docs/database/08_connection_pooling_supavisor.md`, hier nur referenziert.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 2 + 3 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Kritischer Selbstcheck:** L6 (Retry-Logik) hätte naiv umgesetzt ein Doppel-Buchungsrisiko schaffen können — die bestehende Idempotenz-Garantie wurde explizit als Sicherheitsvoraussetzung geprüft und benannt, bevor der Meilenstein als sicher freigegeben wurde.

---

## 7 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Kanonischer Doku-Standard (Säule 8) | [`docs/database/08_connection_pooling_supavisor.md`](../docs/database/08_connection_pooling_supavisor.md) — wird in L1 korrigiert |
| Bestehendes Lasttest-Tooling | [`docs/archive/05_Observability_und_Lasttest.md`](../docs/archive/05_Observability_und_Lasttest.md) |
| Finanz-/Idempotenz-Invarianten (Grundlage für L6) | [`xx_sop/09_security_wallet_invariants.md`](../xx_sop/09_security_wallet_invariants.md) |
| CI-Vorlage für L4 (identisches Muster) | [`T_DATABASE/11_database_query_performance_indexing.md`](./11_database_query_performance_indexing.md) L7 |
| Gewichtete Subkategorien-Bewertung (Kategorie 02, alle 10 Säulen) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md) |
| Übergeordnete Aufschlüsselung (Kategorie 02) | [`worldmap/04_datenbank_migrationen.md`](../worldmap/04_datenbank_migrationen.md) |
| Planungsdateien-Konvention | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) |
