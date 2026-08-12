# 06 — World Map: Security Casino — Härtungs- und Anti-Manipulations-Roadmap

> **Erstellt:** 2026-08-10 · **Status:** F-01 lokal umgesetzt, L2-Rollout offen; F-03 lokal umgesetzt und zur Laufzeit teilweise geprüft; F-02 remote ausgerollt und teilweise L2-verifiziert; F-06 remote verifiziert; F-04 mit Next.js 16.3.0 lokal verifiziert; F-05 remote verifiziert · **Scope:** ausschließlich Security, Anti-Manipulation und Betriebsresilienz; kein Produktfeature und keine UI-Arbeit.
> **Marker-Datei:** 5 % Jan-Übersicht (Abschnitt 1) / 95 % ausführbarer LLM-Plan (Abschnitte 2–7).
> **Quellen:** `01_WORLDMAP_STATUS.md`, `worldmap/05_ZUKUNFTSPLANUNG.md`, statische Codeprüfung am 2026-08-10 und lokales `npm audit --omit=dev`.
> **Wichtige Grenze:** Der Befund ist eine statische Prüfung des lokalen, derzeit nicht sauberen Worktrees. Remote-Supabase, deployte ENV-Werte, RLS-Wirkung und Concurrent-Load sind erst nach Abschnitt 2 wirklich nachgewiesen.

## 1 — Übersicht für Jan (5 % Scope)

**Ziel:** Bevor neue Echtgeld-, Bonus-, Multiplayer- oder LLM-Features entstehen, werden Wallet, Bonus, Fairness, API-Grenzen und Betriebsabläufe gegen Manipulation belastbar gemacht. Diese Übersicht trennt bewusst **Prüfaufgaben** von **tatsächlich bestätigten Befunden**: Eine Prüfung ist kein Bug; ein Befund wird erst nach reproduzierbarer Code- oder Laufzeit-Evidenz in Tabelle 2 aufgenommen.

**Bewertungsmodell:** Aufwand, Risiko und Impact sind Skalen von 1–100. **RORI** (Return on Risk Investment) = `round(Impact × 100 / (Aufwand + Risiko))`, bei 100 gedeckelt. Ein hoher Wert ersetzt nicht die Phasenlogik. Lerneffekt ist die erwartete technische Tiefe: Hoch, Mittel oder Niedrig.

**Status-Legende:** 🟢 vollständig umgesetzt und verifiziert · 🟡 in Arbeit (Code, Migration oder Nachweis läuft) · 🔴 nicht begonnen bzw. noch nicht vorhanden. Ein bestätigter Befund ohne Fix bleibt 🔴.

### 1.1 — Sicherheits-Prüfmatrix (erst durchgehen, keine Bug-Behauptung)

| Phase | Nr.  | Status                 | Idee                                                                         | Priorität | RORI | Impact | Lerneffekt | Risiko | Aufwand | Money-Pfad | Abhängigkeit                    | Security-Reviewer         |
| ----- | ---- | ---------------------- | ---------------------------------------------------------------------------- | --------: | ---: | -----: | ---------- | -----: | ------: | ---------- | ------------------------------- | ------------------------- |
| 0     | P0.1 | 🟢 Lokal abgeschlossen | Reproduzierbare Security-Baseline, Dependency- und Secret-Scan               |         3 |  100 |     70 | Mittel     |     10 |      20 | Nein       | keine                           | Ja                        |
| 0     | P0.2 | 🟢 Audit abgeschlossen | Remote-Supabase-, RLS- und Migrations-Audit                                  |         2 |  100 |     85 | Hoch       |     15 |      30 | Ja         | F-06 vor Seed-Produktivfreigabe | Ja                        |
| 0     | P0.3 | 🟢 Lokal abgeschlossen | Vollständiges Mutation-, Auth- und Vertrauensgrenzen-Inventar                |         4 |  100 |     65 | Hoch       |     12 |      22 | Ja         | P0.1                            | Ja                        |
| 0     | P0.4 | 🟢 Lokal abgeschlossen | Wallet-, Bonus- und Admin-Mutationen unter Retry/Parallelität prüfen         |         1 |  100 |    100 | Hoch       |     20 |      35 | Ja         | P0.2, P0.3                      | Ja                        |
| 0     | P0.5 | 🟢 Audit abgeschlossen | Seed-Kette remote, RLS und Commit-Reveal gegen echte DB prüfen               |         5 |   91 |     80 | Hoch       |     25 |      45 | Ja (RNG)   | F-06 vor Seed-Produktivfreigabe | Ja                        |
| 1     | P1.1 | 🔴 Geplant             | Wallet-Ledger-Invarianten und Admin-Audit prüfen                             |         7 |   78 |     90 | Hoch       |     40 |      75 | Ja         | P0.4                            | Ja                        |
| 1     | P1.2 | 🔴 Geplant             | Abuse-, Mehrfachkonto- und Bonus-Fraud-Signale prüfen                        |         9 |   68 |     75 | Hoch       |     35 |      75 | Ja         | P0.4, P1.1                      | Ja                        |
| 1     | P1.3 | 🔴 Geplant             | Staging-Sicherheitsregression für RLS, Parallelität und Idempotenz           |         8 |   73 |     80 | Hoch       |     30 |      80 | Ja         | P0.1–P0.5                       | Ja                        |
| 2     | P2.1 | 🔴 Geplant             | Monitoring, Alarmierung, Incident-Runbook und Secret-Rotation prüfen         |        10 |   56 |     70 | Mittel     |     40 |      85 | Indirekt   | P1.1, P1.3                      | Ja                        |
| 2     | P2.2 | 🔴 Geplant             | Öffentlicher Launch-/Echtgeld-Gate: WAF, Pentest, Rechts-/Compliance-Prüfung |        11 |   41 |     95 | Hoch       |     70 |      90 | Ja         | P2.1                            | Extern + Security-Auditor |

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
- **Fix-Artefakt:** `supabase/migrations/021_require_pgcrypto_for_seed_chain.sql` installiert `pgcrypto` im Schema `extensions` und ersetzt `consume_active_seed()` sowie `rotate_user_seed()` durch schema-qualifizierte Aufrufe. Der lokale Regressionstest `pgcrypto-seed-migration.test.ts` wurde zuerst rot und danach grün ausgeführt.
- **Remote-Ablauf:** Migration 021 im Supabase SQL Editor einmal vollständig anwenden. Danach aus `scripts/verify-security-phase0.sql` Block A und C ausführen. `required_pgcrypto_installed` muss `true` sein; in Block C müssen `first_replayed = false`, `second_replayed = true` und beide Nonces gleich sein. Block C endet mit `ROLLBACK`.
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

#### P1.1 — Unveränderliches Wallet-Ledger und Invarianten

- **Ziel:** Jede wirtschaftliche Änderung ist nachvollziehbar und ihre Konsistenz automatisch prüfbar.
- **Scope:** `wallet_transactions`, Admin-Edit-Pfad, Wallet-RPCs, neue DB-Constraints/Trigger nur nach 0.2, Tests und eine Admin-Audit-Ansicht ohne Schreibmöglichkeit.
- **Ablauf:** Ledger nur append-only machen; Korrekturen als Gegenbuchung statt Update modellieren. Für jede Mutation Actor, Ursache, Request-ID, Vor-/Nachsaldo und Korrelation speichern. Periodische Invariante: aktueller Saldo = Startguthaben + Summe gültiger Ledger-Ereignisse.
- **Abnahmekriterien:** Kein Client und kein normaler Admin kann Historie umschreiben; jede Abweichung erzeugt einen Alarm; Admin-Änderung ist vollständig auditierbar.
- **Verifizierung:** Constraint-/Trigger-Negativtests, Ledger-Reconciliation gegen Testdaten, parallele Bet-/Bonus-/Admin-Fälle.

#### P1.2 — Abuse- und Bonus-Fraud-Signale

- **Ziel:** Verdächtige Muster werden serverseitig markiert, ohne legitime Nutzer automatisch zu bestrafen.
- **Scope:** neue serverseitige `risk_events`/Review-Daten, Redeem-/Auth-/Wallet-Pfade, Admin-Review-API erst nach 2.1.
- **Ablauf:** Zunächst nur Signale erfassen: ungewöhnliche Voucher-Frequenz, viele Accounts pro vertrauensarmem Netzwerkindikator, Idempotenz-Konflikte, Rate-Limit-Treffer und auffällige Guthaben-Korrekturen. Entscheidungen bleiben menschlich überprüfbar; keine Fingerprinting- oder Sperrlogik ohne Datenschutz-/Produktentscheidung.
- **Abnahmekriterien:** Signale sind dedupliziert, auditierbar und enthalten keine Klartext-Secrets; Fehlalarme können begründet geschlossen werden.
- **Verifizierung:** Synthetische Ereignisfolgen, Berechtigungstests der Review-API, Datenschutzprüfung vor Aktivierung.

#### P1.3 — Staging-Sicherheitsregression

- **Ziel:** Sicherheitsinvarianten werden vor Merge und vor Rollout automatisiert gegen eine echte Postgres-Instanz geprüft.
- **Scope:** `tests/` oder separates Integrationstest-Verzeichnis, CI-Konfiguration, Staging-Testdaten und Migrations-Runner.
- **Ablauf:** Isolierte Testidentitäten für anon/authenticated/service_role erzeugen; RLS, RPC-Grants, CSRF, Rate-Limit-Ausfall, Retry/Replay und 20–100 parallele Money-Requests prüfen. Keine Service-Role-Credentials in Client-Tests oder CI-Logs.
- **Abnahmekriterien:** Die Tests schlagen vor einem absichtlichen RLS-/Grant-/Idempotenz-Bruch fehl und sind in CI verpflichtend.
- **Verifizierung:** Wiederholbare CI-Ausführung gegen ephemeres Staging; Ergebnisartefakte ohne sensible Daten.

### Prüfpfad P2 — Launch-Governance

#### P2.1 — Monitoring, Alarmierung, Incident-Runbook und Secret-Rotation

- **Ziel:** Manipulations- und Verfügbarkeitsprobleme werden erkannt, eingegrenzt und reversibel behandelt.
- **Scope:** Logging-/Monitoring-Konfiguration, `src/lib/casino/logger.ts`, Betriebsdokumentation, CI/Deployment-Secret-Verfahren.
- **Ablauf:** Metriken für 4xx/5xx, Rate-Limits, Voucher-Ablehnungen, Wallet-Invarianten, RPC-Fehler und Admin-Änderungen erfassen. Alarm-Schwellen, Verantwortliche, Triage-Schritte, Not-Aus für Voucher und Rotation von Supabase-/Upstash-Schlüsseln definieren.
- **Abnahmekriterien:** Ein simulierter Wallet-Invariantenfehler löst Alarm und Runbook aus; Secrets können ohne Quellcodeänderung rotiert werden.
- **Verifizierung:** Tabletop-Übung, Testalarm, dokumentierter Rollback einer additiven Migration.

#### P2.2 — Öffentlicher Launch-/Echtgeld-Gate

- **Ziel:** Der Übergang von Spielwährung zu öffentlichem oder wirtschaftlich relevantem Betrieb erfolgt nur mit expliziter Freigabe.
- **Scope:** Infrastruktur, Rechts-/Compliance-Entscheidung, externe Prüfung; nicht im normalen App-Code verstecken.
- **Ablauf:** Vor Echtgeld/Werttransfer: Threat Model aktualisieren, WAF/Bot-Abwehr etablieren, externen Pentest durchführen, jurisdiktionsabhängige Glücksspiel-, KYC/AML-, Datenschutz- und Zahlungsanforderungen klären. Ohne schriftliche Freigabe bleibt das Produkt Spielwährung ohne Auszahlung.
- **Abnahmekriterien:** Alle Befunde mit Risikoeigner und Frist geschlossen oder akzeptiert; externe Prüfung und Rechtsfreigabe dokumentiert.
- **Verifizierung:** Launch-Review mit Security-Auditor, Betrieb und externer Fachstelle.

## 5 — Risiko-Register und Entscheidungsregeln

| Risiko                                 | Stufe    | Entscheidung bis zur Behebung                                                                    |
| -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| Guthaben-Recreation bei Nullsaldo      | Kritisch | Keine Aussage „manipulationssicher“; 1.1 vor jedem Bonus-/Echtgeld-Feature.                      |
| Freie, wiederholbare Promo-Credits     | Kritisch | `redeem-code` bis 1.2 nur deaktiviert oder serverseitig vollständig allowlist-basiert betreiben. |
| CSRF-/Origin-Lücken                    | Hoch     | Betroffene Mutationen vor öffentlichem Launch mit 1.3 absichern.                                 |
| Nicht ausgerollte Seed-Schutzmaßnahmen | Hoch     | 1.4 vor Fairness-/Provably-Fair-Behauptungen.                                                    |
| High-Severity-Abhängigkeiten           | Hoch     | 0.1 als Release-Gate; Upgrade nur mit Regressionstest.                                           |
| Keine echte DB-/Concurrency-Prüfung    | Hoch     | 0.2 und 2.3 vor Echtwert-/Multiplayer-Pfaden.                                                    |

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

## 7 — Selbstprüfung des Plans

- Die Roadmap trennt bestätigte lokale Befunde von noch unbelegten Remote-Aussagen.
- Alle drei Sicherheitsoptionen aus der Vorprüfung sind abgedeckt: Phase 1 entspricht Sofort-Härtung, Phase 2 dem Anti-Manipulations-Fundament, Phase 3 dem Launch-/Echtgeld-Niveau.
- Kein Punkt führt neue Spielmechanik, UI oder Echtgeldfunktion stillschweigend ein.
- Alle Wallet-bezogenen Änderungen verlangen atomare DB-Operationen, Idempotenz, Audit und echten Postgres-Nachweis.
- Die Initiativen folgen der Backlog-Regel: bekannte kritische Befunde und die bereits aktive Seed-Kette gehen neuen Features voraus.
