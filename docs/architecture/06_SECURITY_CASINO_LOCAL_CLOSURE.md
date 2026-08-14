# 06 — Security Casino — Lokaler Abschlussnachweis

> **Archivdokument:** am 2026-08-14 aus `worldmap/` verschoben; kein aktiver Backlog.
> **Erstellt:** 2026-08-10 · **Status:** F-01 lokal umgesetzt, L2-Rollout offen; F-03 lokal umgesetzt und zur Laufzeit teilweise geprüft; F-02 remote ausgerollt und teilweise L2-verifiziert; F-06 remote verifiziert; F-04 mit Next.js 16.3.0 lokal verifiziert; F-05 remote verifiziert; **lokaler Abschlussmodus: P1.1/P1.2/P2.1 lokal abgeschlossen, P1.3/P1.4/P2.2 bewusst ausgeschlossen** · **Scope:** ausschließlich Security, Anti-Manipulation und Betriebsresilienz; kein Produktfeature und keine UI-Arbeit.
> **Archivstruktur:** 5 % Übersicht (Abschnitt 1) / 95 % ausführbarer LLM-Plan (Abschnitte 2–7).
> **Quellen:** `01_WORLDMAP_STATUS.md`, `worldmap/05_ZUKUNFTSPLANUNG.md`, statische Codeprüfung am 2026-08-10 und lokales `npm audit --omit=dev`.
> **Wichtige Grenze:** Der Befund ist eine statische Prüfung des lokalen, derzeit nicht sauberen Worktrees. Remote-Supabase, deployte ENV-Werte, RLS-Wirkung und Concurrent-Load sind erst nach Abschnitt 2 wirklich nachgewiesen.

## 1 — Übersicht für Jan (5 % Scope)

**Ziel:** Bevor neue Echtgeld-, Bonus-, Multiplayer- oder LLM-Features entstehen, werden Wallet, Bonus, Fairness, API-Grenzen und Betriebsabläufe gegen Manipulation belastbar gemacht. Diese Übersicht trennt bewusst **Prüfaufgaben** von **tatsächlich bestätigten Befunden**: Eine Prüfung ist kein Bug; ein Befund wird erst nach reproduzierbarer Code- oder Laufzeit-Evidenz in Tabelle 2 aufgenommen.

**Bewertungsmodell:** Aufwand, Risiko und Impact sind Skalen von 1–100. **RORI** (Return on Risk Investment) = `round(Impact × 100 / (Aufwand + Risiko))`, bei 100 gedeckelt. Ein hoher Wert ersetzt nicht die Phasenlogik. Lerneffekt ist die erwartete technische Tiefe: Hoch, Mittel oder Niedrig.

**Status-Legende:** 🟢 lokal bzw. praktisch gemäß Statuswortlaut abgeschlossen · 🟡 in Arbeit (Code, Migration oder Nachweis läuft) · 🔴 offen und noch zu bearbeiten · ⚪ bewusst nicht im lokalen Abschlussumfang. Ein bestätigter Befund ohne Fix bleibt 🔴.

### 1.1 — Sicherheits-Prüfmatrix (erst durchgehen, keine Bug-Behauptung)

| Phase | Nr.  | Status                    | Idee                                                                         | Priorität | RORI | Impact | Lerneffekt | Risiko | Aufwand | Money-Pfad | Abhängigkeit                    | Security-Reviewer         |
| ----- | ---- | ------------------------- | ---------------------------------------------------------------------------- | --------: | ---: | -----: | ---------- | -----: | ------: | ---------- | ------------------------------- | ------------------------- |
| 0     | P0.1 | 🟢 Lokal abgeschlossen    | Reproduzierbare Security-Baseline, Dependency- und Secret-Scan               |         3 |  100 |     70 | Mittel     |     10 |      20 | Nein       | keine                           | Ja                        |
| 0     | P0.2 | 🟢 Audit abgeschlossen    | Remote-Supabase-, RLS- und Migrations-Audit                                  |         2 |  100 |     85 | Hoch       |     15 |      30 | Ja         | F-06 vor Seed-Produktivfreigabe | Ja                        |
| 0     | P0.3 | 🟢 Lokal abgeschlossen    | Vollständiges Mutation-, Auth- und Vertrauensgrenzen-Inventar                |         4 |  100 |     65 | Hoch       |     12 |      22 | Ja         | P0.1                            | Ja                        |
| 0     | P0.4 | 🟢 Lokal abgeschlossen    | Wallet-, Bonus- und Admin-Mutationen unter Retry/Parallelität prüfen         |         1 |  100 |    100 | Hoch       |     20 |      35 | Ja         | P0.2, P0.3                      | Ja                        |
| 0     | P0.5 | 🟢 Audit abgeschlossen    | Seed-Kette remote, RLS und Commit-Reveal gegen echte DB prüfen               |         5 |   91 |     80 | Hoch       |     25 |      45 | Ja (RNG)   | F-06 vor Seed-Produktivfreigabe | Ja                        |
| 1     | P1.1 | 🟢 Lokal abgeschlossen    | Wallet-Ledger-Invarianten und Admin-Audit prüfen                             |         7 |   78 |     90 | Hoch       |     40 |      75 | Ja         | P0.4                            | Ja                        |
| 1     | P1.2 | 🟢 Lokal abgeschlossen    | Abuse-, Mehrfachkonto- und Bonus-Fraud-Signale prüfen                        |         9 |   68 |     75 | Hoch       |     35 |      75 | Ja         | P0.4, P1.1                      | Ja                        |
| 1     | P1.3 | ⚪ Ausgeschlossen (lokal) | Staging-Sicherheitsregression für RLS, Parallelität und Idempotenz           |         8 |   73 |     80 | Hoch       |     30 |      80 | Ja         | P0.1–P0.5                       | Ja                        |
| 1     | P1.4 | ⚪ Ausgeschlossen (lokal) | Red-Team-Angriffsklassen: Rate-Limit-Bypass & IDOR auf Admin-Routen          |        12 |  100 |     70 | Sehr Hoch  |     30 |      40 | Ja         | P0.1–P0.5, P1.3 empfohlen       | Ja                        |
| 2     | P2.1 | 🟢 Lokal abgeschlossen    | Monitoring, Alarmierung, Incident-Runbook und Secret-Rotation prüfen         |        10 |   56 |     70 | Mittel     |     40 |      85 | Indirekt   | P1.1                            | Ja                        |
| 2     | P2.2 | ⚪ Ausgeschlossen (lokal) | Öffentlicher Launch-/Echtgeld-Gate: WAF, Pentest, Rechts-/Compliance-Prüfung |        11 |   41 |     95 | Hoch       |     70 |      90 | Ja         | P2.1                            | Extern + Security-Auditor |

**Ergänzt (2026-08-12):** P1.4 übernimmt die frühere Initiative `1.11` aus `worldmap/05_ZUKUNFTSPLANUNG.md` (Security-Red-Teaming Wallet-/Auth-System) — dort entfernt, um die Überschneidung mit P1.3 (parallele Money-Requests/Replay ist dort bereits Scope) nicht doppelt zu planen. P1.4 deckt gezielt nur die zwei Angriffsklassen ab, die P1.3 nicht erfasst: Rate-Limit-Bypass (bewusste Umgehung, nicht nur Ausfallverhalten wie in P2.1) und IDOR auf Admin-Routen. Priorität 12 einfach ans bisherige Maximum (11) angehängt, keine globale Neusortierung — gleiche Begründung wie bei 1.9/1.10 in der Zukunftsplanung: würde bestehende, teils aus anderen Sessions stammende Ränge verschieben.

### 1.3 — Beschluss: Option 1 — Nur lokal prüfen

**Einfaches Problemverständnis:** Wir prüfen, ob Geldbuchungen, Berechtigungen,
Rate-Limits und Admin-Zugriffe im Code korrekt abgesichert sind. Wir bauen keine
neue Produktfunktion. Ein echter praktischer Nachweis würde eine getrennte
Testumgebung benötigen; Option 1 verzichtet bewusst darauf.

**Geltungsbereich dieses Beschlusses:**

- Verwendet werden nur der vorhandene Code, die vorhandenen lokalen Mocks und
  die lokalen Unit-/Vertragstests.
- Nicht verwendet werden ein separates Supabase-Projekt, Testnutzer, CI,
  echte Staging-Datenbankläufe und Red-Team-Läufe gegen eine Zielumgebung.
- Keine Secrets, Cookies oder Datenbankzugänge werden benötigt oder im Chat
  geteilt.
- P1.1 und P1.2 dürfen nach bestandenem lokalem L1-Nachweis als `🟢 Lokal
abgeschlossen` gelten.
- P1.3 und P1.4 sind `⚪ Ausgeschlossen (lokal)`, weil sie ohne echte
  Zielumgebung nicht praktisch verifiziert werden können. Sie bleiben als
  spätere L2-Pläne erhalten, sind aber kein offener Restpunkt des lokalen
  Abschlussmodus.
- P2.1 darf als lokaler Code-, Test- und Runbook-Nachweis abgeschlossen werden;
  P2.2 ist `⚪ Ausgeschlossen (lokal)`, weil WAF, Pentest und Compliance externe
  Launch-Gates sind.

**Top-5-Prozent-Implementationsplan aus drei Perspektiven:**

| Perspektive                   | Aufgaben und Verantwortlichkeit                                                                                                                                                                                                                       | Ergebnis und Abnahmeregel                                                                                                                                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Technische Sicherheit**  | Entwicklung prüft P1.1 mit Ledger-Migration, Admin-Audit-RPC, Idempotenzvertrag, Reconciliation und Negativtests. Danach prüft sie P1.2 mit Redaction, Fingerprint-Deduplizierung, `risk_events`-Vertrag, Redeem-Verdrahtung und fail-open-Verhalten. | Gezielte Tests, die vollständige lokale Suite und ESLint bestehen. Ein globaler Typecheck-Fehler außerhalb des Security-Scopes wird separat ausgewiesen. Es wird ausdrücklich keine Aussage über echte DB-Rollen, echte Rate-Limits oder echte Admin-Zugriffe gemacht. |
| **2. Sicherer Arbeitsumfang** | Der Ausführende führt nur lokale Prüfungen aus und dokumentiert jeden ausgelassenen Lauf. Die Security-Review prüft Diff, Testabdeckung, Fehlerpfade, Secret-Redaction und dass keine Testdatei eine externe Zielumgebung anspricht.                  | Kein Netzwerk-, Supabase-, CI- oder Red-Team-Schritt. Ein lokaler Testfehler blockiert den Status; ein nicht ausgeführter L2-Test wird nicht als Fehler und nicht als Erfolg gewertet.                                                                                 |
| **3. Governance und Abnahme** | Der Owner bestätigt den bewusst begrenzten Nachweis. Der Security-Reviewer prüft die lokale Evidenz und die Restgrenzen. P1.3/P1.4/P2.2 sind bewusst aus dem lokalen Abschlussumfang ausgeschlossen; P2.1 wird nur lokal abgeschlossen.               | Der Bericht nennt ausdrücklich: keine Testnutzer, kein CI, kein echtes Staging, kein praktischer Red-Team-Nachweis und keine Launch-Freigabe.                                                                                                                          |

**Kohorten:**

- **Entwicklung:** führt Codeprüfung, lokale Tests, Lint und Typecheck aus und
  behebt lokale Fehler.
- **Security-Review:** prüft die geänderten Sicherheitsgrenzen, Negativtests,
  Redaction und die Aussagegrenzen; keine produktive Freigabe wird daraus
  abgeleitet.
- **Owner/Entscheidung:** bestätigt den lokalen Abschlussmodus und akzeptiert,
  dass P1.3/P1.4/P2.2 bewusst ausgeschlossen bleiben.
- **Betrieb/Infra:** hat in Option 1 keine Ausführungsaufgabe; es werden keine
  Staging- oder CI-Ressourcen angefordert.

**Abhängigkeiten:** P1.1 bleibt fachliche Grundlage für P1.2. Beide benötigen
für diesen lokalen Abschluss nur den vorhandenen Quellcode und lokale Test-
Werkzeuge. P1.3 benötigt für einen späteren Start eine getrennte Testumgebung;
P1.4 benötigt zusätzlich synthetische Identitäten und eine autorisierte
Testfreigabe. Diese Voraussetzungen sind nicht Bestandteil von Option 1.

**Fehler- und Problembehandlung:**

- Lokaler Test-, Lint- oder Typecheck-Fehler: Status bleibt offen, Ursache
  analysieren, beheben und die betroffene Prüfung erneut ausführen.
- Test versucht eine externe Verbindung: Lauf sofort stoppen, Zielaufruf aus dem
  lokalen Test entfernen oder mocken; niemals mit echten Zugangsdaten fortsetzen.
- Test enthält Secret-, Cookie- oder PII-Ausgabe: Test ungültig, Ausgabe löschen,
  Redaction ergänzen und erneut lokal ausführen.
- Lokaler Test ist grün, aber nur ein Mock: als lokale Evidenz dokumentieren,
  nicht als praktischen Sicherheitsnachweis ausgeben.
- Späterer Wunsch nach P1.3/P1.4: neuer Beschluss mit eigener Testumgebung,
  synthetischen Daten und begrenztem manuellen Prüfplan; Option 1 wird nicht
  stillschweigend erweitert.

### 1.2 — Bestätigte Sicherheitsbefunde (separat von der Prüfmatrix)

| Befund | Status                                             | Kurzbefund                                                                            | Priorität | RORI | Impact | Risiko | Aufwand | Bereich          | Nächste Behebung |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------------------- | --------: | ---: | -----: | -----: | ------: | ---------------- | ---------------- |
| B-01   | 🟡 Lokal behoben, Deployment/L2 offen              | Balance-Read kann bei Nullsaldo Guthaben erneut setzen                                |         1 |  100 |    100 |     12 |      18 | Wallet           | F-01             |
| B-02   | 🟡 Remote ausgerollt, Paralleltest offen           | Beliebige Promo-Codes können wiederholt Credits erzeugen                              |         2 |  100 |     95 |     25 |      40 | Bonus/Wallet     | F-02             |
| B-03   | 🟡 Lokal behoben, lokale Runtime teilweise geprüft | Mehrere Browser-Mutationen haben kein explizites Origin-Gate                          |         3 |  100 |     85 |     20 |      35 | CSRF/API         | F-03             |
| B-04   | 🟢 Lokal verifiziert                               | Vier High-Severity-Abhängigkeiten sind über ein gezieltes Next.js-Upgrade geschlossen |         4 |  100 |     70 |     10 |      20 | Supply Chain     | F-04             |
| B-05   | 🟢 Remote verifiziert                              | Seed-Bootstrap scheiterte ohne PostgreSQL-Erweiterung `pgcrypto`                      |         5 |  100 |     90 |     20 |      25 | Provably Fair/DB | F-05             |
| B-06   | 🟢 Remote verifiziert                              | Öffentliche `SECURITY DEFINER`-RPC kann Seed-Zustand beliebiger Nutzer verändern      |         1 |  100 |    100 |     15 |      12 | Provably Fair/DB | F-06             |

### 1.3 — Behebungsübersicht F-01 bis F-06 (separat von Befunden und Prüfungen)

| Fix  | Status                                            | Befund | Kurzidee                                                         | Priorität | RORI | Impact | Risiko | Aufwand | Abhängigkeit   | Nächster Schritt                                                  |
| ---- | ------------------------------------------------- | ------ | ---------------------------------------------------------------- | --------: | ---: | -----: | -----: | ------: | -------------- | ----------------------------------------------------------------- |
| F-06 | 🟢 Remote verifiziert                             | B-06   | Öffentliche Legacy-Seed-RPC für Browserrollen sperren            |         1 |  100 |    100 |     15 |      12 | Keine          | Abgeschlossen; L2-Rollenmatrix ist nachgewiesen                   |
| F-01 | 🟡 L1 umgesetzt, L2 offen                         | B-01   | Guthaben-Reset aus Lesezugriff entfernen                         |         2 |  100 |    100 |     12 |      18 | Keine          | Deployment und Dreifachread eines echten Nullsaldos nachweisen    |
| F-02 | 🟡 Remote ausgerollt, Paralleltest offen          | B-02   | Promo-Codes validieren, Ledger atomar und einmalig machen        |         3 |  100 |     95 |     25 |      40 | F-01 empfohlen | 20er-Paralleltest mit Staging-Testnutzer ausführen                |
| F-03 | 🟡 L1 umgesetzt, lokale Runtime teilweise geprüft | B-03   | Einheitliches Origin-/CSRF-Gate für Browsermutationen            |         4 |  100 |     85 |     20 |      35 | Keine          | Staging-Origin-Matrix mit echter Session nachweisen               |
| F-04 | 🟢 L1 verifiziert                                 | B-04   | High-Severity-Produktionsabhängigkeiten aktualisieren/triagieren |         5 |  100 |     70 |     10 |      20 | Keine          | Next.js 16.3.0; bei Dependency-Änderung Audit erneut ausführen    |
| F-05 | 🟢 Remote verifiziert                             | B-05   | `pgcrypto` als explizite Seed-Ketten-Voraussetzung installieren  |         6 |  100 |     90 |     20 |      25 | Keine          | Abgeschlossen; Regression und Remote-Idempotenz sind nachgewiesen |

Die Befundtabelle ist absichtlich knapp. Die technische Evidenz und der konkrete Fix stehen in Abschnitt 4. Ein noch nicht ausgeführter Remote-Test, etwa der offene Seed-Rollout, gehört ausschließlich in die Prüfmatrix und nicht in diese Bug-Tabelle.

**Nicht als Tatsache behaupten:** Ein lokaler Test beweist weder eine erfolgreiche Remote-Migration noch korrekt konfigurierte Produktiv-ENV, Cookie-Attribute, WAF oder Datenbankrechte. Solche Aussagen sind erst nach den Gate-Nachweisen in Abschnitt 2 zulässig.

## 2 — Prüf-Gates und Meilensteine (vor jeder Reparatur)

Diese Checkliste ist die erste Arbeit eines ausführenden Agents. Jeder Punkt erzeugt entweder einen belegten „bestanden“-Nachweis oder einen Befund mit Datei, Befehl, Datum und Risikostufe. Keine produktive Sicherheitsbehauptung ohne Nachweis.

### A — Repository, Abhängigkeiten und Secrets

- [ ] `git status --short` dokumentieren; fremde Worktree-Änderungen nicht überschreiben.
- [ ] `npm audit --omit=dev --json` speichern und den Fixpfad für jedes High/Critical-Paket festhalten.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` und `npm run vibe-check` ausführen; vorhandene Fehler getrennt von neuen Security-Findings ausweisen.
- [ ] `.env.example`, `.gitignore`, Git-Historie und Build-Ausgaben auf eingecheckte Schlüssel, produktive URLs oder Service-Role-Keys prüfen. Keine Secrets in Tickets, Tests oder Logs ausgeben.
- [ ] Produktiv-Versionen und Sicherheitsadvisories des Frameworks gegen die tatsächlich gelockte Lockfile-Version abgleichen.

### B — Authentisierung, Session und CSRF

- [ ] Jede `POST`-, `PATCH`-, `PUT`- und `DELETE`-Route inventarisieren: Authentisierung, Autorisierung, Zod-Schema, Origin-/CSRF-Gate, Rate-Limit und Fehlerverhalten.
- [ ] Für Browser-Mutationen prüfen, dass fehlender, ungültiger oder nicht erlaubter Origin fail-closed endet; Webhooks benötigen stattdessen eine Signaturprüfung und eine explizite Ausnahme.
- [ ] Cookie-Attribute auf `Secure`, `HttpOnly`, `SameSite` und korrekte Domain/Path-Präfixe im echten Deployment prüfen.
- [ ] `ALLOW_DEV_FALLBACK` in Production nachweislich deaktivieren und einen CI-Test ergänzen, der dieses Invariante absichert.

### C — Wallet, Bonus und Admin-Manipulation

- [ ] Jede Balance-, XP- und Bonusmutation auf einen atomaren DB-Pfad, Request-Idempotenz und einen Audit-Eintrag zurückführen.
- [ ] Negativsaldo, Nullsaldo, Maximalwerte, Rundung auf Cent und gleichzeitige Requests gegen echtes Postgres testen.
- [ ] Promo-Code-Regeln explizit festlegen: welche Codes existieren, Betrag, Laufzeit, globales Limit, Limit pro Nutzer und Verhalten beim Retry.
- [ ] Admin-Mutationen mit Actor-ID, Ziel-ID, altem/neuem Wert, Grund, Request-ID und Zeitstempel auditieren; die Auditdaten selbst dürfen nicht clientseitig veränderbar sein.

### D — Datenbank, RLS und Provably Fair

- [ ] Migrationen 001–020 in der Zielreihenfolge auf Staging anwenden und den Migrationsstand abfragen.
- [ ] RLS als `anon`, `authenticated` und `service_role` testen: `seeds.server_seed`, `seed_consumptions`, Wallet-Tabellen, Game-Rounds und Admin-Tabellen.
- [ ] `019_seed_chain.sql` prüfen: unberechtigter Direktzugriff muss scheitern; Rotation muss Reveal/History liefern; paralleler Seed-Konsum darf keinen doppelten Nonce erzeugen.
- [ ] Für jeden abgeschlossenen Bet Hash, Nonce, Client-Seed und Ergebnis dauerhaft lesbar für den jeweiligen Nutzer, aber nie der aktive Klartext-Seed, nachweisen.

### E — Abuse, Verfügbarkeit und Betrieb

- [ ] Rate-Limits mit echten Redis-Credentials testen: normaler Grenzwert, Überschreitung, Ausfall von Upstash und getrennte Nutzer-Scopes.
- [ ] Replay-, Parallel-Tab- und Request-Duplikat-Tests für Bet, Blackjack, Voucher und Seed-Rotation durchführen.
- [ ] Structured Logs auf Secret- und PII-Leaks prüfen; definierte Audit-/Alarmereignisse festlegen.
- [ ] Backup, Migration-Rollback, Secret-Rotation und Incident-Kontakt als überprüfbares Runbook dokumentieren.

**Meilenstein-Gate M0:** Abschnitt A–E ist mit konkreten Kommandoausgaben, Staging-Resultaten und offenen Risiken dokumentiert. Erst dann erhalten Phase-1-Initiativen den Status `Execution-Ready`.

## 3 — Phasenmodell

- **Phase 0 — Beweis statt Annahme:** Remote- und Laufzeitwahrheit herstellen. Diese Phase schreibt keine Fachlogik.
- **Phase 1 — Akute Manipulationspfade schließen:** Bekannte Wallet-, Voucher-, CSRF- und Seed-Risiken. Kein neues Feature darf diese Phase überholen.
- **Phase 2 — Defense in Depth:** Ledger-Invarianten, Fraud-Erkennung und echte Security-Regressionen machen spätere Änderungen überprüfbar.
- **Phase 3 — Launch-Governance:** Betrieb, Reaktion und externe Prüfung. Für Echtgeld oder Auszahlbarkeit ist Phase 3 ein Gate, keine Option.

## 4 — Ausführungsplan je Initiative (95 % Scope für LLM)

### Prüfpfad P0 — Baseline und reale Umgebung

#### P0.1 — Reproduzierbare Security-Baseline & Dependency-Scan

- **Ziel:** Eine datierte, wiederholbare Ausgangslage statt einzelner Konsolenaussagen schaffen.
- **Scope:** `package.json`, Lockfile, `scripts/`, `src/lib/security/**`, `.env.example` falls vorhanden, neue Tests/Dokumentation nur im Security-Scope.
- **Ablauf:** Audit ausführen; direkte und transitive High/Critical-Abhängigkeiten samt Fixversion ermitteln; Framework-Upgrade als isolierten Change planen; Secret-Scanner und CI-Gate auswählen; alle Prüfkommandos reproduzierbar machen.
- **Abnahmekriterien:** Kein untriagierter High/Critical-Befund; jedes bewusst akzeptierte Risiko besitzt Ablaufdatum, Owner und Begründung; keine Schlüssel im Repository oder in Testausgaben.
- **Verifizierung:** `npm audit --omit=dev --json`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run vibe-check`.

#### P0.2 — Remote-Supabase-/RLS-/Migrations-Audit

- **Ziel:** Lokale SQL-Absicht und reale Ziel-Datenbank unterscheiden und die Zugriffsmatrix beweisen.
- **Scope:** `supabase/migrations/001_users.sql` bis `020_drop_orphan_get_user_stats_uuid_overload.sql`; optional ein nichtproduktives SQL-Testskript außerhalb der Anwendungsrouten.
- **Ablauf:** Zuerst Backup-/Rollback-Fenster und Staging bestimmen. Dann Migrationen in numerischer Reihenfolge auf Staging ausführen, Schema/Rollen/Grants abfragen und für anon/authenticated/service_role Negativtests dokumentieren. `019` erst nach erfolgreichem Security-Review remote ausrollen.
- **Abnahmekriterien:** Aktiver `server_seed` ist weder via anon noch authenticated lesbar; Service-Role-RPCs sind nicht öffentlich ausführbar; Wallet-RPCs sind idempotent und RLS greift wie geplant.
- **Verifizierung:** SQL-Tests als drei Rollen, parallele Calls auf `consume_active_seed`, gesicherter Staging-Export der Resultate ohne Klartext-Seeds.

#### P0.3 — Mutation- und Vertrauensgrenzen-Inventar

- **Ziel:** Keine künftig vergessene Schreibroute ohne Auth, Validierung, CSRF-Schutz, Rate-Limit und Audit.
- **Scope:** alle `src/app/api/**/route.ts`, `src/proxy.ts`, `src/lib/security/request-security.ts` sowie zugehörige Tests.
- **Ablauf:** Für jede Mutation eine Matrix erstellen: Route, Akteur, geschütztes Objekt, Auth-Quelle, Schema, Origin-Gate, Rate-Limit, Idempotenz, Audit und Fehlercode. System-/Webhook-Ausnahmen erhalten eigene Signatur-/Replay-Nachweise.
- **Abnahmekriterien:** Keine Browser-Mutation ohne explizite Fail-Closed-Entscheidung; jede Wallet-nahe Mutation besitzt Request-ID und Auditpfad.
- **Verifizierung:** Statischer Test, der jede neue mutierende Route ohne Eintrag/Gate fehlschlagen lässt.

#### P0.4 — Wallet-, Bonus- und Admin-Mutationen unter Retry/Parallelität prüfen

- **Ziel:** Für jeden wirtschaftlich relevanten Pfad beweisen, ob Retry, Doppelrequest, parallele Tabs, Nullsaldo und Maximalwerte zu genau einer korrekten Buchung führen.
- **Scope:** Wallet- und Bonus-RPCs, Admin-User-Route, Bet-/Blackjack-Routen sowie echte Staging-Testdaten; zunächst keine neue Fachlogik.
- **Ablauf:** Für jede Mutation Eingabe, erwartete Anzahl Ledger-Ereignisse, erwarteten Endsaldo und Idempotenzschlüssel in einer Testmatrix festhalten. Anschließend identische Requests und konkurrierende Requests kontrolliert gegen echtes Postgres senden und Abweichungen als neue Befunde mit B-ID erfassen.
- **Abnahmekriterien:** Jede getestete Mutation hat einen dokumentierten Sollwert; Mehrfachausführung führt entweder zu einer Replay-Antwort oder wird abgelehnt, nie zu einer zweiten Buchung.
- **Verifizierung:** Staging-Paralleltest mit mindestens 20 gleichen Requests pro kritischem Pfad und anschließender Ledger-/Saldo-Reconciliation.

### Befundbehebung F — nur bestätigte Probleme

#### F-01 — Wallet-Nullsaldo-Reset entfernen

- **Ausgangsbefund:** `src/lib/casino/wallet.ts` setzt in `getWallet()` ein Guthaben `<= 0` auf 10.000 und persistiert dies. Ein Read-Endpunkt darf nie Guthaben erzeugen.
- **Ziel:** Startguthaben ist ausschließlich eine einmalige Provisionierungsregel; `getWallet()` ist strikt lesend.
- **Scope:** `src/lib/casino/wallet.ts`, `src/app/api/user/balance/route.ts`, passende Wallet-Tests und eine neue additive Migration/RPC nur falls die Provisionierung nicht bereits atomar im Auth-Trigger abgesichert ist.
- **Ablauf:** Den Reset entfernen. Erstprovisionierung in einen atomaren, idempotenten Server-/Triggerpfad mit eindeutiger Nutzer-ID verlagern. Eine bewusst leere Wallet muss `0` liefern und darf nicht mutiert werden.
- **Abnahmekriterien:** Drei Balance-Reads bei `0` ändern keinen DB-Wert; neuer Nutzer erhält genau einmal das definierte Startguthaben; parallele Erst-Reads führen zu keinem doppelten Credit.
- **Verifizierung:** Unit-Tests plus echter Postgres-Paralleltest; Auditabfrage zeigt genau einen Startguthaben-Eintrag pro Nutzer.

#### F-02 — Promo-/Bonus-System atomar und einmalig machen

- **Ausgangsbefund:** `redeem-code` akzeptiert jeden nichtleeren Text und `creditBonus()` macht ein nichtatomisches Read-Modify-Write ohne Redemption-Ledger.
- **Ziel:** Nur serverseitig konfigurierte Codes können genau gemäß ihrer Regeln gutgeschrieben werden.
- **Scope:** `src/app/api/casino/redeem-code/route.ts`, `src/lib/casino/wallet.ts`, neue Migration für `promo_codes` und `promo_redemptions` oder eine minimalere, explizit versionierte Voucher-Tabelle, Tests.
- **Ablauf:** Betrag nie mehr aus Nutzertext ableiten. Code-Normalisierung, Aktivität, Ablauf, globales Limit und Limit pro Nutzer ausschließlich in einer `SECURITY DEFINER`-RPC mit Advisory Lock und `(user_id, code_id)`-Unique-Constraint entscheiden. Credit, Redemption und Wallet-Audit in einer Transaktion schreiben. Replays müssen dieselbe Antwort liefern, nicht erneut gutschreiben.
- **Abnahmekriterien:** Zufallscode gibt 400/404 ohne Mutation; derselbe Code ist pro Nutzer nur einmal erfolgreich; 20 parallele Requests erzeugen exakt eine Gutschrift; Audit enthält Code, Actor, Request-ID und Betrag.
- **Verifizierung:** Zod-/Route-Tests, DB-Unique-/Paralleltest, Ledger-Abgleich vor/nach Redeem.

#### F-03 — Einheitliches Origin-/CSRF-Gate

- **Ausgangsbefund:** Mehrere Browser-Mutationen rufen `validateMutationOrigin()` nicht selbst auf, während der Proxy fehlenden Origin akzeptiert.
- **Ziel:** Jede browserinitiierte Mutation lehnt fehlenden, ungültigen oder nicht konfigurierten Origin ab; Ausnahmen sind minimal und kryptografisch abgesichert.
- **Scope:** `src/lib/security/request-security.ts`, `src/proxy.ts`, `redeem-code`, `seeds`, `chat`, `user/stats` und jede in 0.3 gefundene Mutation, Sicherheitstests.
- **Ablauf:** Gemeinsamen Guard vor `request.json()` aufrufen. In Production ist `APP_ORIGINS` Pflicht; leer oder ungültig führt zu Fail Closed. Webhook-Endpoints bleiben nur dann ausgenommen, wenn eine valide Signaturprüfung besteht; die stillgelegte Clerk-Route bleibt 410.
- **Abnahmekriterien:** Cross-Origin und fehlender Origin ergeben 403; erlaubter Origin funktioniert; keine Route gewinnt Sicherheit nur durch Proxy-Verhalten.
- **Verifizierung:** Parametrisierte Route-Tests für alle Mutationstypen und Proxy-Tests für Production-/Development-Konfiguration.

#### F-04 — High-Severity-Abhängigkeiten beheben

- **Ausgangsbefund:** `npm audit --omit=dev` meldet vier High-Severity-Abhängigkeiten, darunter Next.js `16.2.10`.
- **Ziel:** Die gelockte Produktions-Dependency-Graph enthält keine untriagierten High- oder Critical-Advisories.
- **Scope:** `package.json`, Lockfile und ausschließlich die durch Upgrade betroffenen Konfigurations-/Testdateien.
- **Ablauf:** Für jeden Auditbefund den direkten Abhängigkeitspfad und eine kompatible Fixversion bestimmen. Framework-Upgrade isoliert durchführen, Lockfile erneuern und Build-/Route-Regressionen testen. Ein nicht unmittelbar patchbarer Befund wird nur mit dokumentiertem Owner, Ablaufdatum und kompensierender Maßnahme akzeptiert.
- **Abnahmekriterien:** Neuer Auditlauf zeigt keine untriagierten High/Critical-Befunde; alle akzeptierten Ausnahmen sind terminiert und begründet.
- **Verifizierung:** `npm audit --omit=dev --json`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

#### F-05 — `pgcrypto` als Seed-Ketten-Voraussetzung ausrollen

- **Ausgangsbefund:** Der kontrollierte SQL-Idempotenztest schlug mit `42883: function gen_random_bytes(integer) does not exist` fehl. `019_seed_chain.sql` verwendet `gen_random_bytes()`/`digest()`, installiert aber `pgcrypto` nicht.
- **Fix-Artefakt:** `supabase/migrations/026_require_pgcrypto_for_seed_chain.sql` (lokal am 2026-08-12 von `021` auf `026` umnummeriert — Kollision mit dem bereits vergebenen `021_promo_codes.sql` entdeckt bei Initiative 1.10, siehe `worldmap/05_1.10 ...md` Abschnitt 15; Dateiinhalt unverändert) installiert `pgcrypto` im Schema `extensions` und ersetzt `consume_active_seed()` sowie `rotate_user_seed()` durch schema-qualifizierte Aufrufe. Der lokale Regressionstest `pgcrypto-seed-migration.test.ts` wurde zuerst rot und danach grün ausgeführt.
- **Remote-Ablauf:** Diese Migration wurde remote unter dem damaligen Dateinamen `021_...` bereits im Supabase SQL Editor vollständig angewendet (Postgres trackt keine lokalen Dateinamen — die Umnummerierung ändert nichts am bereits ausgeführten Remote-Zustand). Danach aus `scripts/verify-security-phase0.sql` Block A und C ausführen. `required_pgcrypto_installed` muss `true` sein; in Block C müssen `first_replayed = false`, `second_replayed = true` und beide Nonces gleich sein. Block C endet mit `ROLLBACK`.
- **Abnahmekriterien:** Kein `42883` bei neuem Seed-Konsum; kein Klartext-Seed in Ausgaben; Grants bleiben service-role-only; Retry ist idempotent.
- **Verifizierung:** `npm test -- src/lib/casino/__tests__/pgcrypto-seed-migration.test.ts`, dann die genannten SQL-Editor-Ergebnisse.

#### F-06 — Legacy-Seed-RPC sofort sperren und nur serverseitig nutzen

- **Ausgangsbefund:** Der L2-Grant-Check vom 2026-08-11 belegt, dass `public.get_or_create_user_seed(text)` für `anon` und `authenticated` ausführbar ist. Die Funktion aus Migration 016 ist `SECURITY DEFINER`, akzeptiert eine frei wählbare `p_user_id` und kann per `INSERT ... ON CONFLICT ... DO UPDATE` den aktiven Seed-Zustand verändern. Weder Migration 019 noch 021 widerruft ihren Public-Execute-Grant.
- **Ziel:** Ausschließlich `service_role` darf diese Legacy-RPC ausführen; ein Browser oder fremder Nutzer kann nie den Seed-Zustand eines anderen Nutzers lesen, anlegen oder rotieren.
- **Scope:** Additive Supabase-Migration mit `REVOKE ALL ... FROM PUBLIC, anon, authenticated` und explizitem `GRANT EXECUTE ... TO service_role`; Regressionstest für Grants; Prüfung aller Aufrufer auf `createAdminClient()`.
- **Abnahmekriterien:** Remote sind `required_anon_cannot_execute = true` und `required_authenticated_cannot_execute = true`; der Serverpfad `WalletService.getUserSeeds()` funktioniert weiterhin ausschließlich über den Admin-Client; keine aktive Seed- oder Klartext-Ausgabe in Testartefakten.
- **Verifizierung:** Test zuerst rot für den fehlenden Revoke, anschließend lokaler Test grün; Migration im freigegebenen SQL-Editor anwenden; Block F erneut ausführen und ausschließlich die Grant-Metadaten protokollieren.

### Aktive Prüfung außerhalb der Befunde

#### P0.5 — Seed-Kette remote ausrollen und beweisen

- **Verweis:** `worldmap/05_1.2_COMMIT_REVEAL_FAIRNESS_SCHEMA.md`; dort ist die Implementierung vorhanden, Remote-Rollout und Reviewer-Gate sind offen.
- **Ziel:** Die Commit-Reveal-Kette wird erst nach realer DB-Prüfung als produktiv bezeichnet.
- **Scope:** ausschließlich Migration `019_seed_chain.sql`, die dort genannten Routen/Tests und der Rollout-Nachweis.
- **Abnahmekriterien:** Migration remote erfolgreich, anonyme und authentifizierte Klartext-Seed-Abfrage abgelehnt, Hash/Nonce dauerhaft pro Bet verankert, Rotation revealbar, parallele Calls idempotent.
- **Verifizierung:** Staging- und anschließender produktiver SQL-Nachweis, Security-Auditor-Gate, bestehende 295+ Testbasis plus echte Concurrent-Tests.

### Prüfpfad P1 — Defense in Depth

**Gemeinsame Ausführungsreihenfolge:** P1.1 ist die Grundlage für die wirtschaftliche
Historie und muss vor P1.2 abgeschlossen sein. P1.3 darf nach P0.1–P0.5 parallel zu
P1.1 laufen, benötigt aber eine isolierte echte PostgreSQL-Instanz. P1.4 darf nach
P0.1–P0.5 beginnen; P1.3 ist für die gemeinsame Test-Infrastruktur empfohlen, aber
nicht zwingend. Kein P1-Status wird allein wegen vorhandener Dateien, Unit-Mocks oder
eines erfolgreichen Planreviews grün. Für den vollständigen späteren Prüfpfad werden
Red-/Green-Test, Rollback-Nachweis, Security-Reviewer und die passende Evidenzklasse
(L1 lokal, L2 Staging, L3 Produktion) protokolliert. **Option 1 begrenzt die aktuelle
Abnahme bewusst auf L1; die L2-/L3-Teile bleiben Rückfallplanung.**

#### P1.1 — Unveränderliches Wallet-Ledger und Invarianten

- **Ziel:** Jede wirtschaftliche Änderung ist nachvollziehbar und ihre Konsistenz automatisch prüfbar.
- **Scope:** `wallet_transactions`, Admin-Edit-Pfad, Wallet-RPCs, neue DB-Constraints/Trigger nur nach 0.2, Tests und eine Admin-Audit-Ansicht ohne Schreibmöglichkeit.
- **Ablauf:** Ledger nur append-only machen; Korrekturen als Gegenbuchung statt Update modellieren. Für jede Mutation Actor, Ursache, Request-ID, Vor-/Nachsaldo und Korrelation speichern. Periodische Invariante: aktueller Saldo = Startguthaben + Summe gültiger Ledger-Ereignisse.
- **Abnahmekriterien:** Kein Client und kein normaler Admin kann Historie umschreiben; jede Abweichung erzeugt einen Alarm; Admin-Änderung ist vollständig auditierbar.
- **Verifizierung:** Constraint-/Trigger-Negativtests, Ledger-Reconciliation gegen Testdaten, parallele Bet-/Bonus-/Admin-Fälle.

**Weltklasse-Implementationsplan:**

1. **Bestandsaufnahme und Sollmodell:** Alle Schreibpfade zu `wallet_transactions`,
   Nutzer-Balance und Admin-Edits mit Actor, Zielobjekt, Betrag, Request-ID,
   Korrelation, Vor-/Nachsaldo und Fehlerpfad erfassen. Die Saldoformel wird als
   unveränderliche, vorzeichenbehaftete Betragssemantik festgelegt: Startguthaben plus Summe
   gültiger Ledger-Ereignisse; Rundung erfolgt nur an der definierten Geldgrenze.
2. **Append-only-Grenze:** Direkte `UPDATE`-/`DELETE`-Möglichkeiten für Client und
   normale Admin-Rollen entfernen. Korrekturen werden ausschließlich als
   Gegenbuchung mit Referenz auf das Ursprungsereignis geschrieben. Ein eventueller
   Service-Role-Bypass bleibt auf die benannte RPC begrenzt und wird separat geloggt.
3. **Auditvertrag:** Jede Admin-Änderung speichert Actor-ID, Ziel-ID, Grund,
   Request-ID, Korrelation, alten Wert, neuen Wert, Betrag und Zeitstempel. Die
   Auditspur selbst ist nicht clientseitig editierbar; fehlende Pflichtfelder führen
   atomar zum Abbruch.
4. **Invarianten und Migration:** Vor einer Constraint-/Trigger-Migration werden
   Altbestände nur lesend auf doppelte Request-IDs, unplausible `balance_after`-Werte,
   fehlende Actoren und Rundungsabweichungen geprüft. Bei Abweichungen stoppt die
   Migration und erzeugt einen Befund statt Daten still zu korrigieren. Erst danach
   werden Append-only-Schutz, Gegenbuchungsreferenz und eine reproduzierbare
   Reconciliation-Abfrage eingeführt.
5. **Test- und Alarmpfad:** Zuerst Negativtests gegen Update/Delete und absichtliche
   Invariantenbrüche schreiben und rot ausführen. Danach Minimalimplementierung,
   Reconciliation für Startguthaben + Ledger, Retry-/Paralleltests für Bet, Bonus
   und Admin-Edit sowie ein alarmierbares Invariantenereignis. Die eigentliche
   Alarmzustellung bleibt P2.1; P1.1 muss aber ein vollständiges, deduplizierbares
   Ereignis erzeugen.

**Fehlerbehandlung und Rollback:** Ein Lock-Timeout oder eine unterbrochene additive
Migration wird beendet und über den dokumentierten Rollback zurückgesetzt. Ein
Request-ID-Konflikt darf nie eine zweite Buchung erzeugen und wird als Replay oder
fachlicher Konflikt beantwortet. Ein Reconciliation-Fehler sperrt keine Nutzer
automatisch, sondern erzeugt einen priorisierten Incident mit unverändert gesicherten
Ledgerdaten. Ein fehlender Auditkontext macht die gesamte Mutation ungültig.

**Abnahmebeweis in Option 1:** Lokal grün, wenn Verträge und Negativtests
bestanden sind, kein nichtautorisierter Historien-Write im geprüften Codepfad
vorgesehen ist, Korrekturen als Gegenbuchung modelliert werden und ein
Invariantenbruch als Ereignis behandelt wird. Echte Rollen, PostgreSQL-
Parallelität und 20 konkurrierende Requests sind ausdrücklich nicht Bestandteil
dieses lokalen Abschlusses und bleiben ein späterer praktischer Nachweis.

**Artefakte:** `supabase/migrations/028_wallet_ledger_invariants.sql`,
`src/app/api/admin/users/route.ts`,
`src/lib/casino/__tests__/wallet-ledger-invariants.test.ts`,
`scripts/verify-security-phase1.sql` und `scripts/phase1-concurrency.ts`. Für
Option 1 zählen ausschließlich der gezielte Vitest, die vollständige Test-Suite,
`npm run typecheck` und `npm run lint`. SQL-, Rollen- und Parallelitäts-Runner
sind vorbereitet, werden aber nicht ausgeführt.

#### P1.2 — Abuse- und Bonus-Fraud-Signale

- **Ziel:** Verdächtige Muster werden serverseitig markiert, ohne legitime Nutzer automatisch zu bestrafen.
- **Scope:** neue serverseitige `risk_events`/Review-Daten, Redeem-/Auth-/Wallet-Pfade, Admin-Review-API erst nach 2.1.
- **Ablauf:** Zunächst nur Signale erfassen: ungewöhnliche Voucher-Frequenz, viele Accounts pro vertrauensarmem Netzwerkindikator, Idempotenz-Konflikte, Rate-Limit-Treffer und auffällige Guthaben-Korrekturen. Entscheidungen bleiben menschlich überprüfbar; keine Fingerprinting- oder Sperrlogik ohne Datenschutz-/Produktentscheidung.
- **Abnahmekriterien:** Signale sind dedupliziert, auditierbar und enthalten keine Klartext-Secrets; Fehlalarme können begründet geschlossen werden.
- **Verifizierung:** Synthetische Ereignisfolgen, Berechtigungstests der Review-API, Datenschutzprüfung vor Aktivierung.

**Weltklasse-Implementationsplan:**

1. **Signalvertrag:** Ein `risk_events`-Datensatz erhält mindestens eine stabile
   Ereignis-ID, `subject_user_id`, Signaltyp, normalisierte Schwere, Quelle,
   deduplizierbaren Fingerprint, begrenzte Beweisdaten, Status, Erstellungszeitpunkt
   und Review-Felder. Geheimnisse, Tokens, Klartext-IPs und vollständige Gerätewerte
   gehören nicht in das Ereignis; Aufbewahrung und Zugriff werden festgelegt.
2. **Read-first-Erfassung:** Signale zunächst nur erzeugen und in eine Review-Queue
   schreiben: Voucher-Frequenz, viele Accounts je vertrauensarmem Indikator,
   Idempotenzkonflikte, Rate-Limit-Treffer und ungewöhnliche Korrekturen. Keine
   automatische Sperre, Auszahlungssperre oder Fingerprinting-Ausweitung ohne
   dokumentierte Datenschutz-/Produktentscheidung.
3. **Deduplizierung und Review:** Gleiche Ursache und Zeitfenster werden über einen
   stabilen Fingerprint zusammengeführt. Ein Reviewer kann begründet schließen,
   eskalieren oder als Fehlalarm markieren; jede Entscheidung erhält Actor, Zeit,
   Begründung und unveränderliche Historie. Die Review-API bleibt bis zur in P2.1
   definierten Betriebsfreigabe minimal und least-privilege.
4. **Kalibrierung:** Synthetische Ereignisfolgen decken Grenzwerte, Burst-Verhalten,
   legitime Mehrfachnutzung und Zeitfensterwechsel ab. Schwellenwerte werden als
   Konfiguration mit Version und Gültigkeitszeitraum behandelt, nicht als vom Client
   beeinflussbare Parameter.
5. **Privacy-/Fehlerprüfung:** Vor Aktivierung Datenminimierung, Retention,
   Löschung/Anonymisierung und Zugriffsmatrix prüfen. Ein Ausfall der Signalerfassung
   darf den Geldpfad nicht blockieren; er muss aber metrisch sichtbar werden und darf
   keine sensiblen Payloads in Fallback-Logs schreiben.

**Fehlerbehandlung und Rollback:** Bei zu hoher Signalrate wird nur die Erfassung
gedrosselt oder pausiert, niemals automatisch Nutzer gesperrt. Bei Duplicate-Key- oder
Schemafehlern wird die einzelne Signaltransaktion verworfen und ein technischer
Fehlerzähler erhöht. Bei Datenschutzverstoß werden betroffene Artefakte isoliert,
Zugriffe entzogen und die Retention-/Redaction-Regel korrigiert; historische
Rohdaten werden nicht nachträglich in Klartext rekonstruiert.

**Abnahmebeweis in Option 1:** Lokal grün, wenn Signalberechnung,
Deduplizierung, Redaction und der fail-open-Pfad durch lokale Tests bestätigt
sind. Echte Reviewer-Rollen, Retention und eine praktische Review-Berechtigungs-
prüfung sind ausdrücklich nicht Bestandteil dieses Abschlusses.

**Artefakte:** `supabase/migrations/029_risk_events.sql`,
`src/lib/casino/risk-signals.ts`, `src/lib/casino/risk-event-store.ts`,
`src/lib/casino/__tests__/risk-signals.test.ts` und die Verdrahtung in
`src/app/api/casino/redeem-code/route.ts`. Für Option 1 zählen der gezielte
Vitest, die vollständige Test-Suite, `npm run typecheck` und `npm run lint`;
praktische Rollen-, Retention- und Review-Läufe bleiben offen.

#### P1.3 — Staging-Sicherheitsregression

> **Lokaler-Abschluss-Grenze:** Dieser Abschnitt ist ein späterer praktischer
> Erweiterungsplan. Er wird im lokalen Abschlussmodus nicht ausgeführt; P1.3 ist
> `⚪ Ausgeschlossen (lokal)`.

- **Ziel:** Sicherheitsinvarianten werden vor Merge und vor Rollout automatisiert gegen eine echte Postgres-Instanz geprüft.
- **Scope:** `tests/` oder separates Integrationstest-Verzeichnis, CI-Konfiguration, Staging-Testdaten und Migrations-Runner.
- **Ablauf:** Isolierte Testidentitäten für anon/authenticated/service_role erzeugen; RLS, RPC-Grants, CSRF, Rate-Limit-Ausfall, Retry/Replay und 20–100 parallele Money-Requests prüfen. Keine Service-Role-Credentials in Client-Tests oder CI-Logs.
- **Abnahmekriterien:** Die Tests schlagen vor einem absichtlichen RLS-/Grant-/Idempotenz-Bruch fehl und sind in CI verpflichtend.
- **Verifizierung:** Wiederholbare CI-Ausführung gegen ephemeres Staging; Ergebnisartefakte ohne sensible Daten.

**Weltklasse-Implementationsplan:**

1. **Zielumgebung sperren:** Vor jedem Lauf eine Allowlist-Prüfung auf nichtproduktive
   URL, Datenbankkennung, Marker-Variable und synthetische Testidentitäten erzwingen.
   Bei unbekannter oder produktiver Zielumgebung sofort abbrechen; niemals auf eine
   implizite ENV-Annahme vertrauen.
2. **Reproduzierbares Harness:** Ephemere PostgreSQL-Instanz mit Migration-Runner,
   Rollen `anon`, `authenticated` und `service_role`, isoliertem Testnutzer und
   rücksetzbaren Seeds bereitstellen. Credentials nur als CI-Secrets injizieren,
   nie in Testausgabe, Snapshot oder Artefakt schreiben.
3. **Regressionsmatrix:** RLS-/Grant-Negativtests, Origin-/CSRF-Tests,
   Rate-Limit-Ausfall, Replay und Retry, 20–100 parallele Money-Requests,
   Wallet-Reconciliation und Seed-Idempotenz abdecken. Für jeden Kontrollpunkt
   existiert ein absichtlicher Bruch, der den Test rot macht.
4. **CI-Gate:** Tests in einer verpflichtenden, wiederholbaren Jobdefinition mit
   maschinenlesbaren Ergebnisartefakten ausführen. Logs werden auf Secrets, PII,
   Connection-Strings und vollständige Request-Bodies redigiert; ein fehlender
   Staging-Dienst ist ein blockierendes Ergebnis und kein grüner Skip.
5. **Drift- und Rollbackprüfung:** Migrationsstand, erwartete Grants und Schema-
   Fingerprint vor dem Test vergleichen. Bei Drift Test abbrechen, Zielumgebung
   reparieren oder neu erzeugen und den Lauf mit identischem Seed wiederholen.

**Fehlerbehandlung und Rollback:** Ein fehlendes Credential, ein nicht erreichbares
Staging oder ein fehlerhafter Migration-Runner ergibt `X / nicht ausführbar`, nie
„bestanden“. Ein Leak in Logs invalidiert das Artefakt und erzwingt Redaction plus
erneuten Lauf. Ein absichtlicher Bruch, der nicht rot wird, blockiert den Merge; die
betroffene Sicherheitskontrolle wird nicht als vorhanden angenommen.

**Abnahmebeweis:** L2 ist zwingend. Grün erst, wenn ein kompletter Lauf gegen eine
echte isolierte Instanz reproduzierbar ist, alle drei Rollen geprüft sind, jeder
absichtliche RLS-/Grant-/Idempotenzbruch fehlschlägt, die Parallelmatrix bestanden
ist und Artefakte ohne sensible Daten vorliegen.

**Artefakte:** `src/lib/security/__tests__/staging-regression-contract.test.ts`,
`scripts/phase1-target-guard.ts`, `scripts/phase1-concurrency.ts`,
`scripts/verify-security-phase1.sql` und der verpflichtende CI-Job unter
`.github/workflows/security-staging.yml`. Der vorbereitete Lauf prüft
Zielumgebungs-Guard, Rollen-/Grant-Verträge, Idempotenz und Parallelität; der
vollständige L2-Lauf muss zusätzlich gegen eine echte isolierte PostgreSQL-
Instanz mit den drei Rollen ausgeführt werden.

##### P1.3 — Ausführungsdossier und sichere Stoppentscheidung (2026-08-14)

**Bestandsaufnahme vor Execution:**

- **Ziel und Evidenzklasse:** P1.3 beweist RLS, RPC-Grants, Idempotenz,
  Reconciliation und Parallelität praktisch gegen eine isolierte PostgreSQL-
  Instanz. Dafür ist L2 zwingend; lokale Vertrags- und Unit-Tests sind nur L1.
- **Status zu Beginn:** `⚪ Ausgeschlossen (lokal)` durch den aktiven lokalen
  Abschlussmodus.
  Dieser schließt Staging, Testnutzer, CI und externe Red-Team-/Zieltests aus.
- **Betroffene Dateien:**
  `src/lib/security/__tests__/staging-regression-contract.test.ts`,
  `scripts/phase1-target-guard.ts`, `scripts/phase1-concurrency.ts`,
  `scripts/verify-security-phase1.sql`, `.github/workflows/security-staging.yml`,
  die bereits bestehenden Migrationen `028_wallet_ledger_invariants.sql` und
  `029_risk_events.sql`, diese Roadmap und bei Statusänderung
  `01_WORLDMAP_STATUS.md`.
- **Ausdrücklich nicht betroffen:** Produkt- und UI-Logik, Echtgeldbetrieb,
  Produktionsdaten, bestehende Nutzerkonten, neue Authentifizierung und jede
  nicht zu P1.3 gehörende uncommittete Änderung.
- **Offene Blocker:** Keine ausdrücklich freigegebene isolierte Umgebung, keine
  P1.3-Umgebungsvariablen im lokalen Konfigurationsbestand, kein lokales `psql`
  oder Supabase-CLI, keine synthetischen Identitäten und kein Reviewer-Gate. Der
  Nutzerbeschluss Option 1 verbietet zudem die Beschaffung oder Nutzung dieser
  Voraussetzungen.

**Stakeholder-Perspektiven und Entscheidungsgrenzen:**

| Perspektive/Kohorte                   | Verantwortlich und Liefergegenstand                                                                                        | Darf entscheiden                                                                             | Darf nicht allein entscheiden                                                                                    | Erforderliche Evidenz                                                                              | Negatives Ergebnis                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| A — Security-/Application Engineering | Entwicklung liefert fail-closed Guard, Testmatrix, Redaction, Reproduzierbarkeit und minimale Korrekturen.                 | Lokalen Codefehler beheben oder lokalen Lauf stoppen.                                        | Keine Zielumgebung freigeben, keinen Produktionslauf starten und keine Sicherheitsfreigabe erteilen.             | Roter/Grüner Test, lokaler Vertragstest, Diff-Review ohne Secrets.                                 | Fehler isolieren; bei Zielunsicherheit sofort stoppen und Status offen lassen.                                 |
| B — Datenbank/Infra/Betrieb           | Betrieb stellt ausschließlich eine isolierte, rücksetzbare Instanz mit Migrationen, Rollen und synthetischen Daten bereit. | Einen als sicher bestätigten Testlauf freigeben oder bei Drift abbrechen.                    | Keine reale Nutzer- oder Produktionsdatenbasis verwenden und keine fachliche Sicherheitsabnahme allein erteilen. | Ziel-Guard, Migrationsstand, Rollenmatrix, Backup-/Rollback-Nachweis, redigierte Laufartefakte.    | Instanz zurücksetzen oder verwerfen, Synthetic-Daten löschen, Ursache dokumentieren und erneut beginnen.       |
| C — Governance/Security-Review/Owner  | Owner akzeptiert Umfang und Risiko; Reviewer prüft Evidenz, Datenschutz, Status und Restgrenzen.                           | Lokalen Abschluss von P1.1/P1.2/P2.1 oder die Fortsetzung eines sicheren L2-Plans empfehlen. | P1.3 ohne L2 als praktisch verifiziert oder abgeschlossen markieren.                                             | Vollständiges Dossier, objektive Testergebnisse, Nachweis der Isolation und Reviewer-Entscheidung. | Evidenz zurückweisen, Status im praktischen Pfad offen lassen oder im lokalen Modus als ausgeschlossen führen. |

**Anforderungen:**

- **Muss:** Guard verlangt explizite Bestätigung und verweigert produktionsähnliche
  Ziele; Migrationen 028/029 sind in richtiger Reihenfolge vorhanden; die Rollen
  `anon`, `authenticated` und `service_role` werden praktisch getrennt geprüft;
  RLS, RPC-Grants, Schema-/Grant-Drift, Replay, Retry, 20 parallele Requests,
  genau eine Buchung und Ledger-Reconciliation werden gegen synthetische Daten
  geprüft; alle Proben sind rollbackbar; Logs enthalten weder Connection-Strings,
  Secrets, Cookies, IPs noch vollständige Request-Bodies; Reviewer und Owner
  erhalten redigierte Evidenz.
- **Soll:** Der Lauf ist manuell wiederholbar und später als CI-Job ausführbar;
  absichtliche Grant-/RLS-/Idempotenzbrüche machen den Lauf nachweisbar rot;
  Laufzeit, Testfall-ID und Cleanup werden protokolliert.
- **Optional:** Ephemere Datenbank, maschinenlesbares Ergebnisartefakt, zweite
  unabhängige Wiederholung und separater Schema-Fingerprint.
- **Bewusst ausgeschlossen in Option 1:** Bereitstellung einer Zielumgebung,
  Testnutzer, CI-Ausführung, `psql`-Lauf, Service-Role-Nutzung, externe Requests
  und jede Behauptung eines praktischen L2-Nachweises.

**Kohortenmatrix für einen späteren L2-Lauf:**

| Kohorte                                 | Erlaubt / verboten                                                                                     | Erwartung und Seiteneffekt                                                     | Testdaten, Datenschutz und Cleanup                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `anon`                                  | Darf lesen, wenn RLS es zulässt; darf Ledger nicht ändern und Admin-/Risk-RPCs nicht ausführen.        | Zugriff wird abgewiesen; keine Buchung und kein Audit-Write.                   | Keine reale Identität; keine personenbezogenen Daten; kein Cleanup nötig.                   |
| `authenticated`                         | Darf nur eigene erlaubte Ressourcen nutzen; darf keine Ledger-Historie oder privilegierte RPCs ändern. | Fehlende Berechtigung wird abgewiesen; keine Seiteneffekte.                    | Synthetischer Standardnutzer; nach Test löschen oder Rollback.                              |
| `service_role`-Harness                  | Darf ausschließlich in isolierter Instanz Setup, Prüfroutine und Cleanup ausführen.                    | Darf Testdaten erzeugen; kein Zugriff von Clientcode und keine Secret-Ausgabe. | Einmaliger synthetischer Schlüssel im Secret Store; nach Lauf Testdaten löschen/rollbacken. |
| Synthetischer Zielnutzer                | Darf nur den definierten Admin-RPC-Testzustand erhalten.                                               | Ein Replay erzeugt exakt eine Ledger-Zeile; Reconciliation bleibt konsistent.  | Zufällige Kennung, kein PII; vollständiger Cleanup oder Transaktionsrollback.               |
| 20 parallele Requests desselben Nutzers | Darf denselben Request-ID-Fall auslösen; darf keine echten Spiele spielen.                             | Eine fachliche Mutation, übrige Antworten sind Replay; keine Doppelbuchung.    | Synthetischer Nutzer und feste Testgrenze; danach Rollback/Cleanup.                         |
| Parallele unterschiedliche Nutzer       | Darf getrennte, unabhängige Testfälle auslösen.                                                        | Keine Cross-User-Leaks, keine Sperr- oder Saldoübertragung.                    | Mehrere synthetische Kennungen; vollständiger Cleanup.                                      |
| Reviewer-/Betriebskohorte               | Darf redigierte Ergebnisse sehen und Stop/Retry entscheiden.                                           | Keine Änderung an Produktionsdaten oder unredigierten Artefakten.              | Nur Metadaten und Test-IDs; Evidenz nach Retention-Regel ablegen.                           |

**Schrittfolge und Abhängigkeiten:**

1. Option-1- und Scope-Grenze prüfen; bei unveränderter Option 1 keine externe
   Ausführung beginnen.
2. Für einen späteren L2-Lauf Ziel-Guard mit explizitem Marker, nichtproduktiver
   URL und Vergleich zur konfigurierten Produktions-URL ausführen.
3. Migrationsreihenfolge 028 → 029, Schemaobjekte, RLS und RPC-Grants gegen die
   isolierte Instanz prüfen; bei Drift abbrechen.
4. Rücksetzbare synthetische Nutzer und Ledger-Baselines erzeugen; niemals reale
   Konten oder Echtgeldwerte verwenden.
5. Zuerst absichtliche negative RLS-/Grant-/Update-/Replay-Fälle ausführen und
   ihre erwartete Ablehnung nachweisen.
6. Idempotenz zweimal mit derselben Request-ID prüfen; dann 20 parallele Requests
   desselben synthetischen Nutzers ausführen.
7. Genau eine Ledger-Zeile, korrekte Replay-Antwort und Reconciliation prüfen.
8. Rate-Limit-/Timeout-Ausfälle als Betriebssignal werten, nicht als erfolgreichen
   Sicherheitsnachweis.
9. Bei jeder Abweichung sofort stoppen, synthetische Daten rollbacken oder löschen,
   redigierte Fehlerevidenz sichern und Ursache beheben.
10. Den vollständigen Lauf mit frischem Seed wiederholen; übersprungene Fälle
    bleiben offen.
11. Security-Reviewer und Owner prüfen Nachweisqualität, Isolation, Datenschutz,
    Rollback und Status.
12. Erst danach Status auf `🟢 Praktisch verifiziert` oder `🟢 Abgeschlossen`
    ändern und P1.4 freigeben.

**Abhängigkeiten:** P1.1/P1.2 liefern die zu prüfenden Migrationen und Verträge.
P1.3 benötigt zusätzlich eine isolierte Postgres-/Supabase-Instanz, die drei
Rollen, `psql` oder gleichwertige autorisierte Ausführung, Service-Role im Secret
Store, synthetische Identitäten, Cleanup-/Rollback-Möglichkeit und Reviewer-/Owner-
Freigabe. Im vollständigen praktischen Pfad folgen P1.4, P2.1 und P2.2 erst nach
dem objektiv begründeten Abschluss dieser Abhängigkeiten. Im lokalen Abschlussmodus
sind P1.3/P1.4/P2.2 ausdrücklich ausgeschlossen; P2.1 wird nur als lokaler
Code-/Runbook-Nachweis geführt. Keine dieser Kennzeichnungen ersetzt praktische
Evidenz für Produktion oder Echtgeld.

**Fehler-, Risiko- und Problemkatalog:**

| Fehlerklasse                                                                          | Erkennung und sofortige Stop-Regel                                               | Technische Reaktion, Rollback und Wiederholung                                                                                     | Status, Verantwortung und Kommunikation                                              |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Fehlende Datei, falsche Migrationsreihenfolge oder Schema-/Grant-Drift                | Contract-/SQL-Assertion schlägt fehl. Sofort stoppen.                            | Keine Teilmigration fortsetzen; Instanz auf bekannten Stand zurücksetzen, Reihenfolge korrigieren, mit neuem Testseed wiederholen. | `🔴 Bewusst offen`; Entwicklung + Betrieb; Reviewer erhält redigierten Befund.       |
| Fehlende Rolle, unvollständiges RLS oder falscher RPC-Grant                           | Rollenmatrix akzeptiert unerlaubten Zugriff oder blockiert Service-Role.         | Grants/RLS minimal korrigieren, nach Migration erneut alle drei Rollen prüfen.                                                     | `🔴 Bewusst offen`; DB-Verantwortung + Reviewer; kein Merge-/Rollout-Gate.           |
| Unsicheres Ziel, Produktionserreichbarkeit, fehlende Credentials oder Testidentitäten | Guard, URL-Vergleich oder Secret-Check schlägt fehl. Vor erstem Request stoppen. | Keine Ersatz-URL nutzen und keine Secrets im Chat anfordern; nur nach expliziter sicherer Freigabe neu starten.                    | `🔴 Bewusst offen`; Owner/Betrieb; keine externe Kommunikation außer Blockerbericht. |
| Timeout oder Rate-Limit-Ausfall                                                       | Request läuft ab oder Limiter ist nicht erreichbar.                              | Lauf abbrechen, keine Erfolgsaussage; Ursache separat analysieren und mit frischem Zeitfenster wiederholen.                        | `🔴 Bewusst offen`; Betrieb; Incident-Hinweis ohne PII.                              |
| Replay, Race Condition oder doppelte Buchung                                          | Mehr als eine Ledger-Zeile, inkonsistente Antwort oder Reconciliation-Differenz. | Mutation stoppen, Testdaten rollbacken, Idempotenz-/Lock-Fehler minimal beheben, Negativfall und Parallelfall wiederholen.         | Kritischer Befund, `🔴`; Entwicklung + Security-Reviewer; Owner sofort informieren.  |
| Secret-/PII-Leak oder unredigierte Logs                                               | Logscan enthält Schlüssel, Cookies, IPs oder Request-Bodies.                     | Artefakt sperren/löschen, Rotation nach Geheimnisprozess falls nötig, Redaction ergänzen, gesamten Lauf wiederholen.               | `🔴`; Betrieb + Security-Reviewer; nur minimal notwendige Incident-Kommunikation.    |
| Unerwarteter Seiteneffekt oder unvollständiger Cleanup/Rollback                       | Synthetische Daten bleiben bestehen oder fremde Daten verändern sich.            | Sofort stoppen, nur synthetische Daten gezielt rollbacken/löschen, Integrität prüfen und Ursache beheben.                          | `🔴`; Betrieb + Owner; Produktionsbezug wäre Incident.                               |
| Mock-/Strukturtest ohne praktische Aussage                                            | Nur lokaler Test ist grün, keine autorisierte Zielausführung existiert.          | Als L1 dokumentieren; keine Hochstufung und keine Ersatzbehauptung.                                                                | `🔴 Bewusst offen`; Reviewer; Roadmap präzisieren.                                   |
| Reviewer lehnt Evidenz ab oder Lauf ist nicht reproduzierbar                          | Fehlende Test-ID, Seed, Rollback- oder Rollenbelege.                             | Evidenzlücke schließen und gesamten Lauf wiederholen; nicht nachträglich interpretieren.                                           | `🔴`; Owner + Reviewer; P1.4 bleibt gesperrt.                                        |

**Plan-Selbstprüfung vor Execution:**

- Die drei Perspektiven, alle relevanten Rollen und der Multi-Request-Fall sind
  vorhanden. Zusätzlich ergänzt wurden unterschiedliche Nutzer, Betrieb und
  Reviewer als eigene Kohorten.
- Die ursprüngliche L2-Annahme widerspricht dem aktiven Option-1-Beschluss. Der
  Plan behandelt dies nicht als stillschweigende Ausnahme, sondern als sicheren
  Stopp vor jedem externen Request.
- Lokale Verträge, SQL-Strukturtests und der Guard werden ausdrücklich nur als L1
  bezeichnet. Kein Mock kann RLS, Grants, Rate-Limit oder IDOR praktisch belegen.
- Secrets, Cookies und Schlüssel sind nicht erforderlich und werden weder gelesen
  noch angefordert. Rollback, Redaction, negative Tests und Reviewer-Gate sind
  jeweils mit einer objektiven Stop-Regel verknüpft.
- Der überarbeitete Plan ist ausführbar, sobald die separat dokumentierten L2-
  Voraussetzungen autorisiert bereitstehen; bis dahin ist sein korrekter Status
  im lokalen Abschlussmodus `⚪ Ausgeschlossen (lokal)`.

**Execution und Selbstprüfung dieses Durchlaufs:**

- Ausgeführt: `npm test -- src/lib/security/__tests__/staging-regression-contract.test.ts`
  (1 Datei, 3 Tests bestanden), `npm run typecheck` (bestanden) und gezieltes
  ESLint für Guard, Runner und Vertragstest (bestanden).
- Ausgeführt: `npx tsx scripts/phase1-target-guard.ts` ohne P1.3-Marker. Der Guard
  brach erwartungsgemäß vor jedem Request mit
  `PHASE1_TARGET_CONFIRMED=true is required` ab.
- Nicht ausgeführt: SQL-Prüfskript, Parallelitäts-Runner, Workflow/CI und jeder
  Datenbank- oder Netzwerkrequest. Sie wären unter Option 1 und ohne isolierte
  Freigabe unzulässig.
- **Ergebnis der Execution-Selbstprüfung:** Kein Code- oder Infrastruktureingriff
  wurde vorgenommen, keine Produktion angesprochen, lokale Tests sind grün und der
  Guard ist fail-closed. P1.3 bleibt daher `⚪ Ausgeschlossen (lokal)`; P1.4 ist
  ebenfalls aus dem lokalen Abschlussumfang ausgeschlossen und wurde nicht
  praktisch begonnen.

#### P1.4 — Red-Team-Angriffsklassen: Rate-Limit-Bypass & IDOR auf Admin-Routen

> **Lokaler-Abschluss-Grenze:** Dieser Abschnitt ist ein späterer praktischer
> Erweiterungsplan. Er wird im lokalen Abschlussmodus nicht ausgeführt; P1.4 ist
> `⚪ Ausgeschlossen (lokal)`.

> Übernimmt die frühere Initiative `1.11` aus `worldmap/05_ZUKUNFTSPLANUNG.md` (dort entfernt, siehe Anmerkung dort). Deckt gezielt nur die zwei Angriffsklassen ab, die P1.3 nicht erfasst — Retry/Replay/parallele Money-Requests bleiben ausschließlich Scope von P1.3, keine Doppelprüfung hier.

- **Ziel:** Beweisen, dass Rate-Limits nicht gezielt umgangen werden können (bewusster Bypass-Versuch, nicht das in P2.1 geprüfte Ausfallverhalten) und dass Admin-Routen keinen IDOR zulassen — ein Angreifer darf über eine Admin-Route nie ein Objekt (User, Wallet, Wette) außerhalb der eigenen Berechtigung per manipulierter ID erreichen.
- **Scope:** neues Skript-Verzeichnis `scripts/red-team/`, Zielrouten `src/app/api/casino/bet/route.ts`, `src/app/api/casino/blackjack/route.ts`, `src/app/api/admin/**`, `src/proxy.ts` — **ausschließlich gegen isolierte Dev-/Test-Instanz mit synthetischen Test-Accounts**.
- **Neue DB-Objekte:** keine.
- **Ablauf:** Rate-Limit-Bypass-Versuche (parallele Header-/IP-Varianten, fehlende oder mehrfache Idempotency-Keys) gegen Upstash-gestützte Routen; IDOR-Testmatrix je Admin-Route (fremde User-ID/Objekt-ID in Pfad oder Body einsetzen, erwartete 403/404 statt Datenzugriff dokumentieren).
- **Abhängigkeit:** P0.1–P0.5 (bereits abgeschlossen); P1.3 empfohlen, nicht zwingend.
- **Abnahmekriterien:** Kein Rate-Limit-Bypass-Versuch führt zu mehr Requests als der konfigurierte Grenzwert; jede getestete Admin-Route lehnt fremde Objekt-IDs ohne Berechtigung ab.
- **Verifizierung:** dokumentierter Testfall-Katalog je Schwachstellenklasse mit Ergebnis (blockiert/nicht blockiert), reproduzierbar über `scripts/red-team/`.
- **Security-Reviewer:** Pflicht (AGENTS.md Security-Auditor-Scope, Admin-/API-Boundary).

**Weltklasse-Implementationsplan:**

1. **Sicherheitsfreigabe vor Angriff:** Nur synthetische Konten, isolierte Ziel-URL
   und expliziter Testmarker; ein zweiter Guard vergleicht die Ziel-URL gegen eine
   Prod-Denylist. Ohne beide Nachweise beendet sich jedes Skript vor dem ersten
   Request.
2. **Rate-Limit-Katalog:** Für jede Zielroute Baseline, Grenzwert und Zeitfenster
   dokumentieren. Danach Varianten aus parallelen Requests, wechselnden erlaubten
   Header-/IP-Formaten, fehlenden/mehrfachen Idempotency-Keys und User-Scope-
   Vermischung testen. Nur kontrollierte synthetische Last; kein Distributed-Scan.
3. **IDOR-Matrix:** Je Admin-Route eigene und fremde User-ID, Wallet-ID, Wetten-ID,
   Pfadparameter und Body-Feld gegen erwartete 403/404 prüfen. Erfolgsantworten,
   Seiteneffekte und Datenzugriff getrennt auswerten; ein Statuscode allein reicht
   nicht, wenn eine fremde Ressource im Body oder Ledger auftaucht.
4. **Reproduzierbarkeit:** Jeder Testfall erhält ID, Zielroute, Rollenannahme,
   Eingabevariante, erwarteten Schutz, tatsächliches Ergebnis, Zeitfenster und
   sichere Evidenz. Fehler werden als reproduzierbarer Befund mit minimalem
   Requestbeispiel dokumentiert, ohne Tokens oder personenbezogene Daten.
5. **Review und Behebung:** Ein nicht blockierter Bypass oder IDOR stoppt die
   Freigabe. Exploit reproduzieren, Schutzmaßnahme separat beheben, denselben Test
   erneut ausführen und anschließend Regression in P1.3 aufnehmen, sofern die
   Klasse dort dauerhaft automatisierbar ist.

**Fehlerbehandlung und Rollback:** Ein Zielumgebungsfehler führt zum sofortigen
Abbruch und zur Sperrung des Testlaufs. Rate-Limit-Ausfall wird von bewusstem Bypass
getrennt und nicht als P1.4-Erfolg gewertet. Ein unerwarteter echter Seiteneffekt
führt zum Stoppen, Beweissicherung ohne Secret-Ausgabe und Rollback der synthetischen
Testdaten; niemals werden Produktionsdaten bereinigt.

**Abnahmebeweis:** L2 ist für die Zielumgebung erforderlich; der Reviewer prüft die
vollständige Route-/Objekt-Matrix. Grün erst, wenn kein Bypass den konfigurierten
Grenzwert überschreitet, jede fremde Objekt-ID ohne Datenzugriff abgewiesen wird,
beide Sicherheitsguards vor Requests greifen und der Katalog reproduzierbar erneut
ausgeführt werden kann.

**Artefakte:** `scripts/red-team/target-guard.ts`,
`scripts/red-team/rate-limit-bypass.ts`, `scripts/red-team/admin-idor.ts` und ein
versionierter Katalog unter `scripts/red-team/test-catalog.json`, ergänzt durch
`src/lib/security/__tests__/red-team-contract.test.ts` und
`.github/workflows/red-team-security.yml`. Jeder Lauf wird gegen eine explizit
freigegebene Test-URL gestartet; die Ausgabe enthält nur Testfall-ID,
Statuscodeklasse, Seiteneffektprüfung und Ergebnis, niemals Tokens, Cookies, IPs
oder vollständige Request-Bodies.

### Prüfpfad P2 — Launch-Governance

#### P2.1 — Monitoring, Alarmierung, Incident-Runbook und Secret-Rotation

- **Ziel:** Manipulations- und Verfügbarkeitsprobleme werden erkannt, eingegrenzt und reversibel behandelt.
- **Scope:** Logging-/Monitoring-Konfiguration, `src/lib/casino/logger.ts`, Betriebsdokumentation, CI/Deployment-Secret-Verfahren.
- **Ablauf:** Metriken für 4xx/5xx, Rate-Limits, Voucher-Ablehnungen, Wallet-Invarianten, RPC-Fehler und Admin-Änderungen erfassen. Alarm-Schwellen, Verantwortliche, Triage-Schritte, Not-Aus für Voucher und Rotation von Supabase-/Upstash-Schlüsseln definieren.
- **Abnahmekriterien:** Ein simulierter Wallet-Invariantenfehler löst Alarm und Runbook aus; Secrets können ohne Quellcodeänderung rotiert werden.
- **Verifizierung:** Tabletop-Übung, Testalarm, dokumentierter Rollback einer additiven Migration.

##### P2.1 — Lokales Monitoring- und Incident-Dossier (2026-08-14)

**Bestandsaufnahme und Evidenzgrenze:** Der lokale Code enthält
`CasinoLogger`, Sentry-Redaction und den authentifizierten internen Cron-Alert.
Zu diesen Bausteinen existieren Unit-Tests. Es gibt jedoch keinen lokalen Nachweis
eines konfigurierten Alert-Backends, einer zugestellten Alarmnachricht, einer
tatsächlich rotierten Betriebs-Secret oder einer durchgeführten Tabletop-Übung.
Der lokale Abschluss belegt deshalb ausschließlich Code, Tests und Runbook-Entwurf;
er ist keine Betriebsfreigabe.

**Betroffene Dateien:** `src/lib/casino/logger.ts`,
`src/lib/casino/sentry-scrub.ts`, `src/app/api/internal/cron-alert/route.ts` und
ihre Tests, diese Roadmap sowie bei Statusänderung `01_WORLDMAP_STATUS.md`.
**Nicht betroffen:** Sentry-/Hosting-Konfiguration, Pager/Kommunikationstool,
Produktions-ENV, tatsächliche Secret-Rotation, Echtgeldbetrieb oder neue UI.

| Perspektive/Kohorte               | Liefert und darf entscheiden                                                                          | Darf nicht allein entscheiden                                          | Lokale Evidenz / Reaktion bei negativem Ergebnis                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Security-/Application Engineering | Prüft strukturierte Fehlererfassung, fail-open des Loggers und Redaction; darf lokale Fehler beheben. | Keine Alarmierung als zugestellt oder Secrets als rotiert deklarieren. | Unit-Tests für Logger, Scrubber und Cron-Route; bei Fehler Stop, minimale Korrektur, erneuter lokaler Lauf. |
| Betrieb/Infra                     | Definiert späteren Alert-, Rotation- und Rollback-Ablauf.                                             | Keine reale Konfiguration oder Rotation ohne Owner-Freigabe vornehmen. | Runbook-Entwurf mit Owner, Trigger, Stop-Regel und Rollback; ohne Betriebsevidenz kein praktischer Status.  |
| Owner/Security-Reviewer           | Akzeptiert den lokalen Umfang und prüft Geheimnisschutz sowie Restgrenzen.                            | Keinen Launch oder Echtgeldbetrieb freigeben.                          | Redigierte Testausgabe und Dossier; bei Evidenzlücke Status zurück auf offen oder lokal ausgeschlossen.     |

**Anforderungen:**

- **Muss:** Fehler dürfen keinen Geldpfad unterbrechen; Sentry-Events entfernen
  Header, Cookies, IP-/E-Mail-Daten und geheimnisförmige Felder; der Cron-Alert
  lehnt fehlende/falsche Secrets ab; lokale Tests decken Positiv- und Negativpfade
  ab; das Runbook benennt Erkennung, Triage, Not-Aus, Kommunikation, Rotation und
  Rückkehr zum Normalbetrieb.
- **Soll:** Alarmereignisse für Wallet-Invarianten, Fraud-Signale, Rate-Limit-
  Ausfälle, Voucher-Ablehnungen, RPC-Fehler und Admin-Änderungen sind als spätere
  Betriebsmetrik definiert; Testalarm und Tabletop sind wiederholbar vorbereitet.
- **Optional:** Zeitbudgets, Eskalationsmatrix, dedizierte On-Call-Rotation,
  externe Uptime-Prüfung und maschinenlesbare Incident-Tickets.
- **Ausgeschlossen im lokalen Abschlussmodus:** reale Alert-Zustellung,
  Hosting-/Sentry-Änderungen, Secret-Werte, echte Rotation, Tabletop mit Personen,
  Pager/Slack/Telefon und produktive Not-Aus-Aktion.

**Kohorten und erwartetes Verhalten:**

| Kohorte                | Erlaubt / verboten                                                       | Erwartete Wirkung                                                                                        | Datenschutz und Cleanup                                                 |
| ---------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Geldpfad/API           | Darf Fehler protokollieren; darf wegen Telemetriefehler nicht scheitern. | Fehler wird redigiert erfasst oder lokal geloggt; fachliche Antwort bleibt fail-closed/fachlich korrekt. | Keine Rohsecrets, Cookies oder Klartext-PII in Log-/Sentry-Daten.       |
| Interner Cron-Aufrufer | Darf nur mit korrektem Header ein Alert-Ereignis senden.                 | Fehlender/falscher Header führt zu 401 und keinem Sentry-Aufruf.                                         | Secret nur im Runtime-Store; niemals in Testausgabe oder Dokumentation. |
| Security-Reviewer      | Darf redigierte Evidenz und Runbook prüfen.                              | Kann lokalen Abschluss akzeptieren oder Evidenz zurückweisen.                                            | Erhält Test-IDs statt Nutzerdaten.                                      |
| Betrieb/Incident-Owner | Darf einen späteren Testalarm, Not-Aus oder Rotation freigeben.          | Entscheidung und Zeitstempel werden im Incident-Protokoll festgehalten.                                  | Keine Rotation/Produktionstätigkeit im lokalen Modus.                   |

**Konkrete Schrittfolge:**

1. Scope auf lokalen Abschluss prüfen und externe Betriebsaktionen ausschließen.
2. Logger-, Scrubber- und Cron-Alert-Code auf Fehlergrenzen und Secret-Redaction
   inventarisieren.
3. Negativtests für fehlendes/falsches Cron-Secret und Redaction ausführen.
4. Positive Unit-Tests für redigierte Sentry-Weiterleitung ausführen.
5. Sicherstellen, dass ein Sentry-SDK-Fehler den Aufrufer nicht wirft.
6. Metrik-Katalog für Wallet, Fraud, Rate-Limit, Voucher, RPC und Admin dokumentieren.
7. Lokales Runbook mit Trigger, Triage, Not-Aus, Rotation, Rollback und Kommunikation
   festschreiben.
8. Abgrenzen, welche Tests nur Mock-/Unit-Evidenz liefern.
9. Keine DSN, keinen Alert-Endpunkt und kein Secret konfigurieren oder testen.
10. Bei Testfehler Code/Tests minimal korrigieren und die betroffene Prüfung wiederholen.
11. Reviewer prüft Redaction, Scope und Aussagegrenze des Runbooks.
12. Bei grüner lokaler Evidenz P2.1 als lokal abgeschlossen markieren; ein späterer
    Betriebsnachweis bleibt separat möglich.

**Fehler- und Risikokatalog:**

| Fehler                                                   | Erkennung und Stop-Regel                                             | Reaktion / Rollback                                                             | Status und Verantwortung                       |
| -------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| Secret, Cookie oder PII im Event                         | Redaction-Test oder Diff zeigt Rohwert. Sofort keine Evidenz teilen. | Testartefakt entfernen, Scrubber minimal erweitern, erneut testen.              | `🔴`; Entwicklung + Reviewer.                  |
| Falsches/fehlendes Cron-Secret wird akzeptiert           | Negativtest liefert nicht 401.                                       | Route korrigieren, keine externe Route aktivieren, Test wiederholen.            | `🔴`; Entwicklung.                             |
| Logger-/Sentry-Ausfall bricht Geldpfad                   | Unit-Test wirft oder Route liefert falschen Fehler.                  | Fail-open der Telemetrie herstellen, fachlichen Pfad erneut testen.             | `🔴`; Entwicklung + Reviewer.                  |
| Keine Alarmzustellung oder unklare Triage                | Kein externes Backend bzw. keine Tabletop-Evidenz.                   | Nicht als Fehler des lokalen Modus behandeln; als Betriebsgrenze dokumentieren. | Lokal möglich, praktisch offen; Betrieb/Owner. |
| Rotation löscht falsches Secret oder unterbricht Betrieb | Nur bei späterem Betriebsablauf relevant.                            | Zwei-Phasen-Rotation, Rückfall auf alten Wert, dokumentierter Rollback.         | Externes Gate; Betrieb/Owner.                  |
| Reviewer lehnt Evidenz/Runbook ab                        | Fehlende Metrik, Owner oder Stop-Regel.                              | Dossier ergänzen, lokale Tests erneut prüfen.                                   | `🟡`; Reviewer + Owner.                        |

**Plan-Selbstprüfung:** Die Anforderungen trennen Code-/Testnachweis von echter
Alarmzustellung, Rotation und Menschenprozess. Alle Kohorten, Redaction,
Negativtests, Rollback und Reviewer-Grenzen sind benannt. Eine unnötige externe
Abhängigkeit wurde nicht eingeführt; der Plan bleibt lokal ausführbar.

**Lokales Incident- und Rotations-Runbook (Entwurf, kein Betriebsnachweis):**

1. **Erkennung:** Wallet-Invariante, Fraud-Signal, Rate-Limit-Ausfall,
   Voucher-Anomalie, RPC-Fehler oder Admin-Mutation als Ereignis mit Test-ID und
   Zeitstempel erfassen; keine Rohsecrets oder PII anhängen.
2. **Triage:** Incident-Owner prüft zuerst Umfang und ob ein Geldpfad betroffen
   ist. Bei möglicher unautorisierter Guthabenmutation Voucher-/Bonuspfad
   serverseitig deaktivieren; Ledger und Logs sichern, nicht verändern.
3. **Eindämmung und Kommunikation:** Keine Bereinigung von Historie; nur
   redigierte Fakten an Security-Reviewer und Owner geben. Ein externer
   Kommunikationskanal wird erst im Betriebsmodus gewählt.
4. **Rotation:** Betrieb setzt einen neuen Secret-Wert im Secret Store, stellt
   den Dienst mit dem neuen Wert bereit, prüft einen autorisierten Health-/Alert-
   Pfad und entfernt den alten Wert erst nach erfolgreicher Bestätigung. Bei
   Fehlschlag auf den zuvor funktionierenden Wert zurückgehen.
5. **Abschluss:** Ursache, Wirkung, Entscheidung, Rollback und Folgemaßnahme
   dokumentieren. Ein Tabletop oder echter Testalarm ist dafür im lokalen Modus
   nicht durchgeführt und bleibt ein späterer Betriebsnachweis.

**Execution und Selbstprüfung dieses lokalen Durchlaufs:**

- Ausgeführt: `npm test -- src/lib/casino/__tests__/logger.test.ts
src/lib/casino/__tests__/sentry-scrub.test.ts
src/lib/security/__tests__/cron-alert-route.test.ts` — 3 Testdateien,
  20 Tests bestanden.
- Ausgeführt: gezieltes ESLint für Logger, Sentry-Scrubber, Cron-Alert und die
  zugehörigen Tests — bestanden.
- Nicht ausgeführt: echte Sentry-Zustellung, Alert-Empfänger, Secret-Rotation,
  Tabletop, Pager/On-Call und jede Produktionsaktion.
- Der globale `npm run typecheck` scheitert an der fachfremden vorhandenen
  Datei `src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`, die
  eine nicht vorhandene `NeonArcadeDashboardView` importiert. Dieser UI-Befund
  wurde reproduziert, liegt außerhalb von P2.1 und wurde nicht verändert.
- **Ergebnis:** Der lokale P2.1-Code-, Test- und Runbook-Nachweis ist vollständig;
  echte Betriebswirksamkeit ist ausdrücklich nicht behauptet.

#### P2.2 — Öffentlicher Launch-/Echtgeld-Gate

- **Ziel:** Der Übergang von Spielwährung zu öffentlichem oder wirtschaftlich relevantem Betrieb erfolgt nur mit expliziter Freigabe.
- **Scope:** Infrastruktur, Rechts-/Compliance-Entscheidung, externe Prüfung; nicht im normalen App-Code verstecken.
- **Ablauf:** Vor Echtgeld/Werttransfer: Threat Model aktualisieren, WAF/Bot-Abwehr etablieren, externen Pentest durchführen, jurisdiktionsabhängige Glücksspiel-, KYC/AML-, Datenschutz- und Zahlungsanforderungen klären. Ohne schriftliche Freigabe bleibt das Produkt Spielwährung ohne Auszahlung.
- **Abnahmekriterien:** Alle Befunde mit Risikoeigner und Frist geschlossen oder akzeptiert; externe Prüfung und Rechtsfreigabe dokumentiert.
- **Verifizierung:** Launch-Review mit Security-Auditor, Betrieb und externer Fachstelle.

##### P2.2 — Lokales Launch-Gate-Dossier und Ausschlussentscheidung (2026-08-14)

**Bestandsaufnahme und Evidenzgrenze:** P2.2 ist keine reine Codeinitiative. WAF,
externer Pentest, Glücksspiel-/KYC-/AML-/Datenschutz-/Zahlungsrecht, Echtgeld-
Freigabe und formelle Owner-Entscheidung können nicht lokal erzeugt oder geprüft
werden. Der lokale Abschlussmodus kann daher nur die Gate-Definition, Rollen,
Stop-Regeln und Restbedingungen dokumentieren. Er ist ausdrücklich keine Launch-
oder Echtgeldfreigabe.

**Betroffene Dateien:** Diese Roadmap und die übergeordnete Übersicht. Als
Lesereferenzen dienen vorhandene lokale Sicherheits-, Monitoring- und Release-
Dokumente. **Nicht betroffen:** WAF-Konfiguration, externe Security-Dienstleister,
Rechtsberatung, KYC/AML-Provider, Zahlungsanbieter, Produktion, Echtgeldkonten
und öffentliche Marketing- oder UI-Arbeit.

| Perspektive/Kohorte               | Liefert und darf entscheiden                                                                    | Darf nicht allein entscheiden                             | Erforderliche Evidenz und Reaktion bei negativem Ergebnis                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Security-/Application Engineering | Liefert aktuelles Threat Model, Befundliste, lokale Testevidenz und technische Stop-Regeln.     | Keine Produktions- oder Echtgeldfreigabe.                 | Redigierte technische Evidenz; kritischer Befund hält das Gate geschlossen.                            |
| Betrieb/Infra                     | Liefert WAF-/DDoS-/Bot-Abwehr-Konzept, Backup-/Rollback- und Monitoring-Bereitschaft.           | Keine rechtliche oder wirtschaftliche Freigabe.           | Konfigurations- und Testnachweis aus autorisierter Umgebung; fehlende Bereitschaft blockiert Launch.   |
| Externer Pentest/Legal/Compliance | Liefert unabhängigen Pentest und rechts-/compliancebezogene Bewertung für die Zieljurisdiktion. | Keine Produktentscheidung ohne Owner und Security-Review. | Schriftliche, zeitlich gültige Stellungnahmen; unklare oder negative Bewertung hält Echtgeld gesperrt. |
| Owner/Security-Reviewer           | Entscheidet nur gemeinsam auf Basis vollständiger Nachweise über Launch oder Risikoverzicht.    | Keine Evidenzklasse durch lokale Tests ersetzen.          | Formelle Freigabe mit Risiken, Ownern und Fristen; fehlt sie, bleibt Spielwährung ohne Auszahlung.     |

**Anforderungen:**

- **Muss:** Öffentlicher Werttransfer bleibt deaktiviert, bis Threat Model, WAF/
  Bot-Abwehr, externer Pentest, Monitoring-/Incident-Bereitschaft, offene
  Sicherheitsbefunde, Datenschutz, Glücksspielrecht, KYC/AML, Zahlungsrecht und
  schriftliche Owner-/Reviewer-Freigabe vollständig bewertet sind.
- **Soll:** Unabhängige Wiederholung kritischer Security-Tests, dokumentierte
  Risikoeigner mit Frist, Launch-Rollback, Kommunikationsplan und belastbare
  Notfallkontakte.
- **Optional:** Bug-Bounty, DDoS-Übung, zusätzliche unabhängige Rechtsprüfung,
  externe Red-Team-Wiederholung und formalisierte Release-Board-Sitzung.
- **Ausgeschlossen im lokalen Abschlussmodus:** Jede WAF-/Provider-Konfiguration,
  externer Pentest, Rechtsberatung, KYC/AML-/Payment-Integration, Echtgeld-Test,
  Produktionsprobe und formelle Launch-Freigabe.

**Kohorten und Stop-Regeln:**

| Kohorte                                       | Erlaubt / verboten                                                                            | Erwartung                                                         | Datenschutz und Cleanup                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| Öffentlicher, nicht authentifizierter Zugriff | Darf nach echtem Launch nur öffentlich freigegebene Inhalte sehen; kein Geldpfad ohne Schutz. | WAF/Bot-Abwehr und Rate-Limits greifen in autorisierter Umgebung. | Kein Test gegen reale Unbeteiligte im lokalen Modus.     |
| Authentifizierter Spieler                     | Darf nur zugelassene Spielfunktionen nutzen; keine Auszahlung ohne Gate.                      | Geld-/Auszahlungsfunktion bleibt bis Freigabe deaktiviert.        | Keine Echtgeld- oder KYC-Daten lokal verarbeiten.        |
| Security-Reviewer/Owner                       | Darf Evidenz bewerten und Launch stoppen.                                                     | Fehlender Nachweis führt zu keiner Freigabe.                      | Nur redigierte technische und rechtliche Artefakte.      |
| Externe Prüfer und Legal                      | Darfen ihre Fachprüfung in beauftragtem Rahmen durchführen.                                   | Schriftlicher Befund oder Freigabe mit Gültigkeit.                | Vertraglich und datenschutzrechtlich begrenzter Zugriff. |
| Betrieb                                       | Darf nur nach formeller Freigabe WAF/Monitoring/Notfallplan aktivieren.                       | Rückrollbarer Launch, nachvollziehbare Incident-Reaktion.         | Keine Produktionsänderung im lokalen Modus.              |

**Konkrete Schrittfolge für einen späteren echten Launch:**

1. Zieljurisdiktion, Produktgrenze und ob Echtgeld/Werttransfer vorliegt schriftlich
   festlegen.
2. Offene P1-/P2-Sicherheitsbefunde und Risikoakzeptanzen vollständig inventarisieren.
3. Aktualisiertes Threat Model und Datenfluss inklusive KYC/AML/Payment bewerten.
4. WAF, Bot-Abwehr, DDoS-Schutz, Rate-Limits und Logging in autorisierter Umgebung
   konfigurieren.
5. Monitoring, Alarmierung, Incident-Owner und Rollback praktisch testen.
6. Externen Pentest mit klarer Scope- und Datenfreigabe beauftragen.
7. Kritische/hohe Befunde beheben, nachtesten oder mit Owner, Frist und Begründung
   formell akzeptieren.
8. Rechts-, Datenschutz-, Glücksspiel- und Zahlungsanforderungen schriftlich prüfen.
9. KYC/AML und Alters-/Geo-/Zahlungsgrenzen nur nach rechtlicher Entscheidung
   implementieren und testen.
10. Security-Reviewer, Betrieb und Owner prüfen die vollständige Evidenz gemeinsam.
11. Launch-Entscheidung, Kill-Switch, Rollback und externe Kommunikation freigeben.
12. Ohne einstimmig ausreichende Evidenz bleibt das Produkt Spielwährung ohne
    Auszahlung; kein Teilgate wird durch lokale Tests ersetzt.

**Fehler- und Risikokatalog:**

| Fehler                                                      | Erkennung und Stop-Regel                                       | Reaktion / Rollback                                                           | Status und Verantwortung                            |
| ----------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| Fehlende externe Prüfung oder Rechtsfreigabe                | Schriftlicher Nachweis fehlt oder ist abgelaufen.              | Kein Launch; Produktgrenze auf Spielwährung belassen.                         | `⚪` lokal ausgeschlossen / extern offen; Owner.    |
| Kritischer Pentest- oder Security-Befund                    | Befund mit hohem Risiko oder unklarer Auswirkung.              | Launch stoppen, beheben, nachtesten; kein Risiko stillschweigend akzeptieren. | `🔴` im echten Launch-Gate; Engineering + Reviewer. |
| WAF/Monitoring/Incident-Plan nicht praktisch getestet       | Nur Konfiguration oder Unit-Test vorhanden.                    | Keine Launchfreigabe; autorisierte Betriebsübung planen.                      | Extern offen; Betrieb.                              |
| Datenschutz-/KYC-/AML-/Payment-Anforderung unklar           | Fachstelle kann keine belastbare Bewertung abgeben.            | Keine Echtgeldfunktion und keine neue Datenerhebung aktivieren.               | Extern offen; Legal/Compliance + Owner.             |
| Fehlende Rollback- oder Kill-Switch-Fähigkeit               | Notfallpfad nicht nachweisbar.                                 | Launch stoppen, Rückfallprozedur herstellen und üben.                         | Extern offen; Betrieb + Security-Reviewer.          |
| Lokale Dokumentation wird als Launchfreigabe missverstanden | Status oder Kommunikation enthält eine unzulässige Behauptung. | Dokumentation korrigieren, Freigabe klar widerrufen bzw. nicht erteilen.      | `⚪` lokal ausgeschlossen; Owner + Reviewer.        |

**Plan-Selbstprüfung und lokaler Durchlauf:** Alle Pflichtrollen, Kohorten,
gesetzlichen und technischen Abhängigkeiten, Stop-Regeln und Rückfallpfade sind
benannt. Der Plan verlangt keine Secrets und initiiert keinen externen Kontakt.
Lokal ausgeführt wurde ausschließlich die Dokumentations- und Abhängigkeitsprüfung.
WAF, Pentest, Compliance, Echtgeld, Produktion und formelle Freigabe wurden nicht
ausgeführt. **Ergebnis:** P2.2 ist im lokalen Abschlussmodus `⚪ Ausgeschlossen
(lokal)`; diese Kennzeichnung ist kein positiver Launch-Nachweis.

## 5 — Risiko-Register und Entscheidungsregeln

| Risiko                                                                          | Stufe    | Entscheidung bis zur Behebung                                                                                                                         |
| ------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guthaben-Recreation bei Nullsaldo                                               | Kritisch | Keine Aussage „manipulationssicher“; 1.1 vor jedem Bonus-/Echtgeld-Feature.                                                                           |
| Freie, wiederholbare Promo-Credits                                              | Kritisch | `redeem-code` bis 1.2 nur deaktiviert oder serverseitig vollständig allowlist-basiert betreiben.                                                      |
| CSRF-/Origin-Lücken                                                             | Hoch     | Betroffene Mutationen vor öffentlichem Launch mit 1.3 absichern.                                                                                      |
| Nicht ausgerollte Seed-Schutzmaßnahmen                                          | Hoch     | 1.4 vor Fairness-/Provably-Fair-Behauptungen.                                                                                                         |
| High-Severity-Abhängigkeiten                                                    | Hoch     | 0.1 als Release-Gate; Upgrade nur mit Regressionstest.                                                                                                |
| Keine echte DB-/Concurrency-Prüfung                                             | Hoch     | 0.2 und 2.3 vor Echtwert-/Multiplayer-Pfaden.                                                                                                         |
| Red-Team-Tests (P1.4) laufen versehentlich gegen echte Produktionsdaten/-nutzer | Hoch     | Zwingend nur gegen isolierte Dev-/Test-Instanz mit synthetischen Test-Accounts, niemals gegen Live-DB; expliziter Umgebungs-Check vor jedem Testlauf. |

**Kill-Switch-Regel:** Bei Verdacht auf unautorisierte Guthabenmutation zuerst Voucher- und betroffene Bonuspfade serverseitig deaktivieren, dann Logs und Ledger sichern; niemals Tabellen oder Auditdaten löschen, um ein Symptom zu kaschieren.

## 6 — Definition of Done und Statuspflege

Eine Initiative darf nur dann von `Geplant` zu `Execution-Ready` wechseln, wenn Scope, Bedrohung, Datenbankrechte, Tests, Rollback und Reviewer benannt sind. `In Execution` bedeutet: Tests laufen bereits gegen den geänderten Code. `Executed (archiviert)` setzt voraus: produktive/staging Verifikation gemäß Initiative, Security-Auditor-Freigabe und Archivierung des Ergebnisses unter `docs/status-reports/` oder `docs/architecture/`.

Jede umgesetzte Money- oder Auth-Initiative benötigt mindestens:

- einen Test, der den ursprünglichen Exploit reproduziert und vor dem Fix fehlschlägt;
- einen Test für Retry und mindestens einen Parallelitätsfall;
- einen Nachweis, dass Clientwerte keinen Betrag, Saldo, Payout oder Nonce autorisieren;
- einen Migrations-/Rollback- und Log-Nachweis ohne Secrets;
- das Gate Logic-Architect → Security-Auditor gemäß `AGENTS.md`.

Die Kopfzeile dieser Datei und die Tabelle „Aktive Pläne“ in `01_WORLDMAP_STATUS.md` werden bei jedem Statuswechsel im selben Edit aktualisiert.

Im lokalen Abschlussmodus benötigen `P1.1`, `P1.2` und P2.1 den dokumentierten
lokalen L1-Nachweis und dürfen danach `🟢 Lokal abgeschlossen` erhalten. `P1.3`,
`P1.4` und P2.2 sind `⚪ Ausgeschlossen (lokal)`: Ihre eigenständigen praktischen
oder externen Nachweise wurden bewusst nicht beauftragt. Ein lokaler Mock, ein
vorbereiteter Runner oder ein Planreview darf weder als echter Rollen-, Rate-Limit-
oder IDOR-Nachweis noch als Betriebs-, WAF-, Pentest- oder Rechtsfreigabe ausgegeben
werden. Die Auslassung ersetzt keine praktische Evidenz für Produktion oder Echtgeld.

## 7 — Selbstprüfung des Plans

- Die Roadmap trennt bestätigte lokale Befunde von noch unbelegten Remote-Aussagen.
- Alle drei Sicherheitsoptionen aus der Vorprüfung sind abgedeckt: Phase 1 entspricht Sofort-Härtung, Phase 2 dem Anti-Manipulations-Fundament, Phase 3 dem Launch-/Echtgeld-Niveau.
- Kein Punkt führt neue Spielmechanik, UI oder Echtgeldfunktion stillschweigend ein.
- Alle Wallet-bezogenen Änderungen verlangen atomare DB-Operationen, Idempotenz, Audit und echten Postgres-Nachweis.
- Die Initiativen folgen der Backlog-Regel: bekannte kritische Befunde und die bereits aktive Seed-Kette gehen neuen Features voraus.

**Selbstprüfung des lokalen Abschlussmodus (2026-08-14):**

- **Vollständigkeit:** Für Option 1 sind bei P1.1 Append-only-Schutz,
  Gegenbuchungen, Reconciliation, Audit und lokale Negativtests relevant. Bei
  P1.2 sind Signalvertrag, Deduplizierung, Redaction und fail-open relevant.
  P1.3/P1.4 bleiben mit Zielumgebungs-Guard, Rollen-, CI-, Rate-Limit- und
  IDOR-Nachweisen als spätere, bewusst ausgeschlossene Erweiterungen beschrieben.
- **Abhängigkeiten:** P1.2 bleibt von P1.1 abhängig. P1.3 kann nach P0 parallel
  zu P1.1 laufen. P1.4 überschneidet P1.3 nicht bei Replay/Concurrency und nutzt
  P1.3 nur als empfohlene Infrastruktur. P2.1 ist als lokaler Nachweis unabhängig
  dokumentiert; P2.2 bleibt als externes Launch-Gate ausgeschlossen.
- **Fehlerfreiheit:** Fehlende Credentials, fehlende Staging-Instanz, Mock-Tests,
  Rate-Limit-Ausfall oder ein Planreview werden nicht als praktischer Nachweis
  bewertet. Option 1 fordert jedoch bewusst keine Zielumgebung und startet daher
  keinen externen Lauf.
- **Scope:** Option 1 führt ausschließlich lokale Code-, Unit- und Vertragstests
  aus. CI, Staging, Testnutzer und echte Red-Team-Läufe sind ausgeschlossen.
  P1.3/P1.4/P2.2 sind ausgeschlossen; aus dem lokalen Abschluss folgt keine
  Aussage über Produktion, echte Datenbankrollen, Alarmzustellung oder Launch.

### Lokaler Abschluss-Audit (2026-08-14)

| Punkt | Erforderlicher Nachweis                                                                          | Aktueller Befund                                                                                         | Statusentscheidung        |
| ----- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------- |
| P1.1  | Append-only-DB-Schutz, Gegenbuchungen, Reconciliation, Audit-Negativtests und lokale Codeprüfung | Migration, Admin-RPC, Route und lokale Verträge vorhanden; P1-Verträge grün, globale Suite 61/490 grün   | 🟢 Lokal abgeschlossen    |
| P1.2  | `risk_events`-Datenvertrag, deduplizierte Signale, Redaction und lokaler fail-open-Test          | Migration, Sanitization/Fingerprint, fail-open-Store, Redeem-Verdrahtung und lokale Verträge grün        | 🟢 Lokal abgeschlossen    |
| P1.3  | Isolierte PostgreSQL-Instanz, drei Rollen, absichtliche Fehler-Injektionen und CI-Lauf           | L2-Prüfung bewusst nicht beauftragt; Guard/Vertrag lokal geprüft                                         | ⚪ Ausgeschlossen (lokal) |
| P1.4  | Zielumgebungs-Guards, Rate-Limit-Bypass-Katalog, IDOR-Matrix und Reviewer-Gate                   | Praktische Red-Team-Prüfung bewusst nicht beauftragt                                                     | ⚪ Ausgeschlossen (lokal) |
| P2.1  | Lokaler Monitoring-/Redaction-/Alert-Vertrag und Incident-/Rotations-Runbook                     | 3 Testdateien/20 Tests, gezieltes ESLint und Runbook-Entwurf bestanden; keine echte Alarmierung/Rotation | 🟢 Lokal abgeschlossen    |
| P2.2  | WAF, Pentest, Compliance, Launch- und Echtgeldfreigabe                                           | Externes Gate bewusst nicht beauftragt; Spielwährung-/kein-Launch-Grenze dokumentiert                    | ⚪ Ausgeschlossen (lokal) |

**Auditentscheidung:** Der lokale Abschlussmodus ist für P1.1, P1.2 und P2.1
bestanden. P1.3, P1.4 und P2.2 werden nicht als fehlgeschlagen, sondern als bewusst
aus dem lokalen Umfang ausgeschlossen geführt. Damit behauptet die Roadmap keinen
praktischen Nachweis gegen echte Datenbanken, Nutzer, Rate-Limits, Admin-Routen,
Alarmempfänger, WAF, Pentest, Compliance oder Echtgeldbetrieb.

**Ausführungsnachweis (2026-08-14):**

- `npm test`: 61 Testdateien, 490 Tests bestanden.
- `npm run lint`: bestanden.
- P1.3-Vertragstest: 1 Testdatei, 3 Tests bestanden; P2.1-Tests: 3 Testdateien,
  20 Tests bestanden; gezieltes ESLint für beide Bereiche bestanden.
- `npm run typecheck` ist aktuell nicht vollständig grün: Die fachfremde
  `src/components/home/__tests__/neon-arcade-dashboard-view.test.ts` importiert
  die nicht vorhandene `NeonArcadeDashboardView`. Dieser vorbestehende UI-Befund
  wurde nicht verändert und ist kein P1-/P2-Sicherheitsnachweis.
- Nicht ausgeführt und nicht Bestandteil von Option 1:
  `scripts/verify-security-phase1.sql`, `scripts/phase1-concurrency.ts`, CI,
  Staging-Läufe und die Red-Team-Skripte.
- Keine Testnutzer, keine externen Credentials und keine Produktionsumgebung
  wurden verwendet.
