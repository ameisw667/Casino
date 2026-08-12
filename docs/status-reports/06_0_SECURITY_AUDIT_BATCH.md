# 06_0 — Security Casino: Phase-0 Audit-Batch

> **Status:** Executed (archiviert) · **Erstellt:** 2026-08-10 · **Abgeschlossen:** 2026-08-11 · **Verweis:** `worldmap/06-security-casino.md`, Prüfmatrix P0.1–P0.5.
> **Zweck:** Ein zusammenhängender, evidenzbasierter Durchlauf aller Phase-0-Prüfungen. Er repariert keine bestätigten Befunde stillschweigend; neue Befunde erhalten eine B-ID in der Hauptroadmap, ihre Behebung bleibt ein separater F-Task.
> **Ausführungsregel:** Jeder Schritt liefert entweder einen reproduzierbaren Nachweis oder ein klar bezeichnetes, externes Hindernis. Fehlende Credentials, Staging oder Netzwerkzugriff werden nie als „bestanden“ interpretiert.

## 1 — Ausführungsniveau und globale Anforderungen

**Qualitätsniveau:** Weltklasse-Auditstandard für ein serverautoritäres Casino-Projekt: nachvollziehbar, wiederholbar, fail-closed, keine Secret-Ausgabe und strikte Trennung von lokaler Evidenz, Staging-Evidenz und Produktiv-Evidenz.

**Globale Invarianten:**

- Keine Wallet-, XP-, Bonus-, Payout- oder Nonce-Mutation ohne atomaren Server-/DB-Pfad, Idempotenz und Auditspur.
- Browserwerte sind nie autoritativ; `service_role` bleibt server-only und wird nicht in Logs, Tests oder Dokumentation ausgegeben.
- Ein RLS-, Grant- oder Advisory-Lock-Nachweis gilt nur gegen echte Postgres-Rollen, nicht durch statische SQL-Assertions allein.
- Testdaten sind nichtproduktiv. Klartext-Server-Seeds werden niemals ausgegeben oder als Testartefakt gespeichert.
- Fremde Worktree-Änderungen bleiben unangetastet. Vor jedem Edit: `git status --short`; nach jedem Edit: `git diff --check`.
- Für tatsächliche Code-Fixes gilt TDD: Test schreiben → erwarteten Fehlschlag ausführen → Minimalfix → Test und Suite ausführen.

## 2 — Gemeinsames Ergebnisformat

Für jeden Prüfschritt wird im Abschnitt 8 protokolliert: Datum, ausgeführter Befehl, Ergebnis, Evidenzklasse und Folgeentscheidung.

| Evidenzklasse | Bedeutung                                                    | Zulässige Statuswirkung                  |
| ------------- | ------------------------------------------------------------ | ---------------------------------------- |
| L1            | Lokaler Quellcode-, Lockfile- oder Unit-Test-Nachweis        | Lokaler Befund oder lokales Prüfergebnis |
| L2            | Staging mit echten Rollen/DB/Redis                           | Staging-Nachweis                         |
| L3            | Produktion mit genehmigtem, nichtdestruktivem Check          | Produktiv-Nachweis                       |
| X             | Nicht ausführbar; Grund und benötigte Autorität dokumentiert | Bleibt offen, nie grün                   |

## 3 — P0.1: Repository-, Dependency- und Secret-Baseline

**Ziel:** Eine belastbare lokale Ausgangslage für Quellcode, Abhängigkeiten, Tests und Secret-Hygiene schaffen.

**Dateien/Flächen:** `package.json`, Lockfile, `.env.example`, `.gitignore`, Sicherheits- und Casino-Code, `scripts/`.

- [ ] Status und fremde Änderungen erfassen, ohne sie zu verändern.
- [ ] `npm audit --omit=dev --json` ausführen; High/Critical mit direktem oder transitivem Pfad erfassen.
- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run vibe-check` ausführen und neue von vorbestehenden Fehlern trennen.
- [ ] Repository-Tracking und Beispiel-ENV auf Schlüsselmaterial, Service-Role-Leaks und unsichere Fallbacks untersuchen, ohne Werte auszugeben.
- [ ] Sicherheitsrelevante Framework-/Lockfile-Versionen dokumentieren.

**Mögliche Fehler und Behandlung:**

| Ereignis                                  | Behandlung                                                                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Audit-Registry nicht erreichbar           | Ergebnis X mit Zeitpunkt/Fehlertext; nicht „keine Vulnerabilities“ schreiben; bei erlaubtem Zugriff erneut ausführen.             |
| Lint/Test scheitert durch fremde Änderung | Betroffene Datei und Fehler isoliert notieren; keine Fremdänderung reparieren.                                                    |
| Secret im getrackten Material             | Keine Ausgabe des Werts; Datei/Commitbereich melden, Schlüssel sofort rotieren lassen und erst danach History-Bereinigung planen. |

**Definition of Done:** Audit- und Qualitätsbefehle besitzen frische Ausgaben; jedes High/Critical ist als B-Folge oder akzeptiertes Risiko mit Owner/Frist kategorisiert.

## 4 — P0.2: Remote-Supabase-, RLS- und Migrations-Audit

**Ziel:** Beweisen, dass lokale Migrationen 001–020 und ihre Privilegien in einer echten Datenbank so wirken wie geplant.

**Dateien/Flächen:** `supabase/migrations/*.sql`, `.env.local` ausschließlich auf Vorhandensein der Variablen, ein nichtdestruktives Staging-/Remote-SQL-Protokoll.

**SQL-Editor-Artefakt:** `scripts/verify-security-phase0.sql` — Block A/B sind read-only; Block C ist eine vollständig zurückgerollte Idempotenzprobe; Block D ist eine manuelle Zwei-Tab-Lockprobe ohne Anwendungstabellen-Mutation.

- [ ] Verfügbarkeit von `supabase` CLI/Docker, nichtprod. DB und Credentials prüfen, ohne Secrets auszugeben.
- [ ] Migrationsstand und ausstehende Migrationen gegen Zielinstanz abgleichen.
- [ ] Als `anon`, `authenticated` und `service_role` testen: kein aktiver Klartext-Seed, keine direkte Wallet-/Round-/Seed-Consumption-Manipulation, keine öffentlichen Service-Role-RPCs.
- [ ] `019_seed_chain.sql` prüfen: Grant/Revoke, Seed-History-RLS, Idempotenz von `consume_active_seed`, Rotation und Advisory-Lock unter Parallelität.

**Mögliche Fehler und Behandlung:**

| Ereignis                                              | Behandlung                                                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Keine CLI, kein Staging oder keine DB-Autorität       | Ergebnis X. Nicht gegen Produktion improvisieren; genaue benötigte Autorität dokumentieren.                         |
| Migration lokal vorhanden, remote fehlend             | Keine Funktionsbehauptung; `019` bleibt gelb, Rollout nur über freigegebenen SQL-Editor/CI mit Backup und Reviewer. |
| RLS/Grant-Test erfolgreich, aber Klartext im Artefakt | Artefakt verwerfen, Secrets rotieren falls exportiert, Test so umbauen, dass nur Erfolg/Fehler dokumentiert wird.   |
| Paralleltest zeigt Doppelbuchung/Nonce                | Test stoppen, Daten sichern, B-ID mit SQL-/Zeitbeweis anlegen; keine automatische Reparatur im Audit.               |

**Definition of Done:** L2/L3-Nachweis oder X-Hindernis für jede Rollenklasse und Migration 019; keinerlei Aussage über Remote-Sicherheit ohne echten Rollenlauf.

## 5 — P0.3: Mutation-, Auth- und Vertrauensgrenzen-Inventar

**Ziel:** Jede Schreibroute wird vollständig klassifiziert; keine Mutation bleibt ohne explizite Sicherheitsentscheidung.

**Dateien/Flächen:** alle `src/app/api/**/route.ts`, `src/proxy.ts`, `src/lib/security/request-security.ts`, `src/lib/security/admin.ts` und Route-Tests.

- [ ] Alle POST/PATCH/PUT/DELETE-Routen per statischer Suche inventarisieren.
- [ ] Für jede Route Auth, Autorisierung, Zod-Schema, Origin-/CSRF-Entscheidung, Rate-Limit, Idempotenz, Audit und Fehlercode erfassen.
- [ ] Browsermutationen gegen vorhandene `validateMutationOrigin()`-Verwendung vergleichen; Webhooks separat auf Signatur und Replay-Schutz prüfen.
- [ ] Development-Fallbacks auf explizite Production-Sperre prüfen.

**Mögliche Fehler und Behandlung:**

| Ereignis                   | Behandlung                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| Mutation ohne Gate         | B-ID anlegen; keine Annahme, dass Proxy oder SameSite dies kompensiert.                              |
| Legacy-Route ist 410       | Als deaktiviert erfassen, nicht als aktive Mutation bewerten.                                        |
| Route hat keine Request-ID | Nur bei Geld-/Zustandsmutation als Befund erfassen; reine read-only Route nicht künstlich erweitern. |

**Definition of Done:** Vollständige Matrix mit Route und Sicherheitskontrollen; jede Abweichung als konkreter Befund oder bewusst geprüfte Ausnahme.

## 6 — P0.4: Wallet-, Bonus- und Admin-Mutationsprüfung

**Ziel:** Den gesamten wirtschaftlichen Datenfluss auf einmalige, atomare und nachvollziehbare Ergebnisse testen.

**Dateien/Flächen:** `src/lib/casino/wallet.ts`, Bet-/Blackjack-/Redeem-/Admin-Routen, Wallet-RPC-Migrationen, vorhandene Wallet- und Security-Tests.

- [ ] Datenfluss von HTTP-Input über Service-Role-Aufruf bis Wallet-/Ledger-Schreibvorgang verfolgen.
- [ ] Nullsaldo, Erstprovisionierung, ungültiger Voucher, derselbe Voucher, Retry, parallele Request-IDs und Admin-Edit auf Root Cause prüfen.
- [ ] Bestehende Tests gegen die reale Sicherheitsbehauptung prüfen; fehlende Reproduktion als B-ID dokumentieren.
- [ ] Nur für bereits bestätigte B-01 bis B-03 testgetriebene Fix-Tasks in der Hauptroadmap vorbereiten; im Audit nicht mischen.

**Mögliche Fehler und Behandlung:**

| Ereignis                                | Behandlung                                                         |
| --------------------------------------- | ------------------------------------------------------------------ |
| Read-Endpunkt mutiert Guthaben          | B-01 bleibt kritisch; Regressionstest vor Fix verpflichtend.       |
| Bonuspfad ist Read-Modify-Write         | B-02 bleibt kritisch; atomare RPC/Unique-Ledger als separater Fix. |
| Test nutzt nur Mock statt DB-Invariante | L1 kennzeichnen und durch P1.3-L2-Test ergänzen.                   |

**Definition of Done:** Jeder wirtschaftliche Pfad ist mit Autorität, Idempotenz und Auditpfad belegt; bestätigte Abweichungen sind B-IDs, keine stillen Notizen.

## 7 — P0.5: Commit-Reveal-/Seed-Ketten-Prüfung

**Ziel:** Den laufenden Seed-Ketten-Plan unabhängig gegen die echte Vertrauensgrenze validieren.

**Dateien/Flächen:** `worldmap/05_1.2 Seed-Siegelverfahren.md`, `supabase/migrations/019_seed_chain.sql`, Bet-/Blackjack-/Seeds-Routen, Seed-Tests.

- [ ] Lokale Tests auf Seed-Hash, Nonce, Rotation, History und kein `generateServerSeed()` im Bet-Pfad ausführen.
- [ ] Statische SQL-Prüfung: `REVOKE`, RLS, Service-Role-Grant und idempotente `seed_consumptions` erfassen.
- [ ] L2-Parallel- und Rollenprüfung nur mit zugelassener Instanz ausführen; keine aktive Seed-Ausgabe.
- [ ] Ergebnis mit dem bestehenden Seed-Plan abgleichen und nur tatsächlich bewiesene Punkte als grün markieren.

**Mögliche Fehler und Behandlung:**

| Ereignis                                      | Behandlung                                                                              |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| Lokale Tests grün, Migration remote unbekannt | Status bleibt 🟡, nicht 🟢.                                                             |
| `authenticated` kann aktiven Seed lesen       | Kritischer Befund; Zugriff beenden, kein weiterer Spielbetrieb mit Fairness-Behauptung. |
| Nonce wird bei Retry doppelt verbraucht       | B-ID anlegen, Request-ID-Idempotenz vor Rollout korrigieren.                            |

**Definition of Done:** L1-Prüfung abgeschlossen und L2/L3-Nachweis oder X-Hindernis für RLS, Migration und Parallelität protokolliert.

## 8 — Ausführungsprotokoll

| Punkt | Status                 | Evidenz                | Ergebnis / Folgeentscheidung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----- | ---------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0.1  | 🟢 Lokal abgeschlossen | L1, 2026-08-10         | `npm audit --omit=dev` bestätigt 4 High-Severity-Abhängigkeiten (B-04). Aktueller `typecheck` und `vibe-check` sind grün. Der Volltest hat einen widersprüchlichen Fairness-UI-Test; siehe P0.5, kein verdecktes „alles grün“-Claim.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| P0.2  | 🟢 Audit abgeschlossen | L2, 2026-08-10/11      | Remote-Supabase antwortet: 6 Game-Config-, 5 VIP- und 5 Rank-Datensätze. `seed_consumptions` und `seed_history` sind via Service Role vorhanden; anonymer Zugriff auf `seeds.server_seed` wird mit 401 abgelehnt. Block E ist remote bestanden: als `authenticated` sieht der Testnutzer seinen zurückgerollten History-Eintrag (`own_history_rows = 1`), ein anderer Nutzer sieht ihn nicht (`other_history_rows = 0`). Block F zeigt: `users`, `game_sessions` und `wallet_transactions` haben nur SELECT-RLS-Policies, daher blockiert RLS direkte Browser-Schreibvorgänge trotz vorhandener Basisrechte. B-06 ist bestätigt und als separater Fix F-06 offen. |
| P0.3  | 🟢 Lokal abgeschlossen | L1, 2026-08-10         | Zehn mutierende Routen inventarisiert. Drei aktive Geld-/Admin-Routen haben Origin-, Zod- und Rate-Limit-Gate. Vier aktive Browser-Mutationen ohne explizites Origin-Gate bestätigen B-03. Drei weitere Routen sind bewusst 410 und keine aktive Mutation.                                                                                                                                                                                                                                                                                                                                                                                                        |
| P0.4  | 🟢 Lokal abgeschlossen | L1, 2026-08-10         | Datenfluss bestätigt B-01 (`getWallet()` schreibt bei Nullsaldo 10.000) und B-02 (`creditBonus()` ist Read-Modify-Write; Redeem akzeptiert beliebigen nichtleeren Code). Behebung bleibt F-01/F-02, keine Audit-Nebenänderung.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| P0.5  | 🟢 Audit abgeschlossen | L1 + L2, 2026-08-10/11 | Gezielte Seed-Tests: 23/23 grün. B-05 wurde remote behoben: Migration 021 läuft und Block C liefert beim identischen Request `second_replayed = true`, Nonce `1` und Hash-Länge 64. Block E bestätigt die `authenticated`-RLS-Sicht (`own = 1`, `other = 0`) mit vollständig verworfenen Testdaten. Der echte Zwei-Session-Test aus Block D liefert `lock_is_held_by_another_session = true`; damit ist die Advisory-Lock-Sperrung remote bewiesen. B-06/F-06 bleibt ein separater Fix-Gate.                                                                                                                                                                      |

## 9 — Selbstprüfung vor Ausführung

- [x] Alle fünf P0-Punkte sind fachlich getrennt und besitzen Ziel, Scope, Schritte, Fehlerbehandlung und Definition of Done.
- [x] Lokale, Staging- und Produktionsnachweise sind nicht vermischt.
- [x] Der Plan verhindert Secret-Ausgabe und nicht autorisierte Remote-Mutationen.
- [x] Bestätigte Befunde werden nicht durch Audit-Arbeit als erledigt dargestellt.
- [x] Der Plan enthält ein Protokoll, das die spätere Aktualisierung der Hauptroadmap nachvollziehbar macht.

**Selbstprüfungsergebnis:** P0.1–P0.5 sind vollständig ausgeführt und durch L1/L2-Evidenz belegt. Der echte Authenticated-RLS-, Rollenmatrix-, Seed-Replay- und Zwei-Session-Advisory-Lock-Nachweis liegt vor. Die Befunde B-01 bis B-06 sind bewusst nicht mit dem Audit „wegmarkiert“ und bleiben als separate F-Tasks offen.
