# 05 — Disaster Recovery & Backup

> **Status:** In Execution (L0–L9 verifiziert am 2026-09-05 inkl. grünem CI-Lauf; L10–L12 Jan-Gates offen) · **Stand:** 2026-09-05 · **Owner:** LLM (Jan nur bei L10–L12) · **Scope:** Vollständiger Recovery-Zyklus (Export → Restore-Drill → Finanz-/RLS-Nachweis → Regelbetrieb) für die Supabase-Produktdaten des Casino-Projekts `hmqwozhdckbwjqzcmire`. Kein Produktiv-Restore, kein Tarifwechsel ohne Jan-Freigabe.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

Diese Datei ist eigenständig ausführbar. Du brauchst keinen weiteren Chat-Verlauf. Vorgehen:

1. Lies Abschnitt 1 (Übersicht) und Abschnitt 2 (verifizierter Code-Ist-Stand) vollständig.
2. Beginne bei dem ersten Meilenstein mit Ampel 🔴 in Reihenfolge der Tabelle. L0–L3 sind bereits 🟢/🟡 — nicht erneut bauen, nur bei Bedarf gegen den aktuellen Repo-Stand re-verifizieren.
3. Jeder Meilenstein L4–L9 ist **vollständig ohne Jan ausführbar** — nicht auf eine Rückfrage warten, nicht auf L10 warten. Nur L10–L12 brauchen echte Jan-Handlung (externes Konto/Zahlungsmittel/Zugangsdaten).
4. Nach jedem abgeschlossenen Meilenstein: Ampel in Abschnitt 1 **und** in der Detailüberschrift im selben Edit aktualisieren (siehe `xx_sop/03_workflow_jan_planungsdateien.md` §2).
5. Bei Widerspruch zwischen dieser Datei und dem tatsächlichen Code: der Code gewinnt. Diese Datei dann korrigieren, nicht den Code an die Doku anpassen.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                |                       Status                       | Nächster Schritt                                  |          Zuständigkeit           | Money-Pfad |
| --- | ---------------------------------------------------------- | :------------------------------------------------: | ------------------------------------------------- | :------------------------------: | :--------: |
| L0  | Kontext & Scope                                            |            🟢 verifiziert (2026-09-04)             | —                                                 |               LLM                |    Nein    |
| L1  | Recovery-Zielbild & Risiko-Baseline                        |                   🟢 verifiziert                   | —                                                 |               LLM                |    Nein    |
| L2  | Offsite-Backup-Design                                      |                   🟢 verifiziert                   | —                                                 |               LLM                |    Nein    |
| L3  | Export-Code (Dump/Crypto/Upload)                           |      🟡 gebaut, ungetestet gegen echtes Ziel       | Wartet nicht mehr blockierend — siehe L10         |               LLM                |    Nein    |
| L4  | Doku-Korrektur (Säule-9-Doku ↔ echter Code)                |            🟢 verifiziert (2026-09-05)             | —                                                 |               LLM                |    Nein    |
| L5  | `.env.example` um `BACKUP_*` ergänzen                      |            🟢 verifiziert (2026-09-05)             | —                                                 |               LLM                |    Nein    |
| L6  | Restore-Code (Download/Decrypt/Apply)                      | 🟢 verifiziert (2026-09-05, inkl. Security-Review) | —                                                 |               LLM                |    Nein    |
| L7  | Isolierter Restore-Drill (Docker-Container)                |            🟢 verifiziert (2026-09-05)             | —                                                 |               LLM                |    Nein    |
| L8  | Finanz-/RLS-Regressionscheck auf Drill-Ziel                |            🟢 verifiziert (2026-09-05)             | —                                                 |               LLM                |   **Ja**   |
| L9  | CI-Workflow für den Gesamtzyklus                           |     🟢 verifiziert (2026-09-05, grüner CI-Run)     | —                                                 |               LLM                |    Nein    |
| L10 | Externes Backup-Ziel wählen & anlegen                      |                     🔴 geplant                     | Provider wählen, Bucket + Lifecycle-Regel anlegen |             **Jan**              |    Nein    |
| L11 | Erster echter Offsite-Lauf + Restore gegen echte Artefakte |                     🔴 geplant                     | `npm run backup:run` mit echten Secrets           | **Jan-Freigabe**, Ausführung LLM |   **Ja**   |
| L12 | PITR-Tarif-Entscheidung (nachrangig)                       |             🔴 geplant, niedrige Prio              | Kosten/Nutzen-Empfehlung vorlegen                 |             **Jan**              |    Nein    |

**Kernidee dieser Überarbeitung (2026-09-04):** Die vorherige Fassung sperrte L4–L7 explizit hinter L3s echtem externen Upload ("Bis dahin bleiben L4–L7 gemäß Reihenfolge gesperrt"). Das war unnötig: Restore-Code, Restore-Drill, Finanz-Check und CI-Automatisierung lassen sich vollständig gegen einen **frischen lokalen Dump der lokalen Dev-Instanz** und einen **ephemeren, isolierten Docker-Container** bauen und verifizieren — ganz ohne externes Ziel, ohne Secrets, ohne Jan. Nur der tatsächliche Produktions-Offsite-Lauf (L10–L11) braucht ein echtes externes Konto. Damit sind 9 von 12 Meilensteinen (L0–L9) vollständig LLM-autonom.

---

## 2 — Verifizierter Code-Ist-Stand (2026-09-04, gegen echten Repo-Code geprüft)

**Bereits vollständig implementiert** (nicht neu bauen, nur wiederverwenden/erweitern):

| Datei                                                                       | Rolle                                                                                                                                                                |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`scripts/backup-supabase.ts`](../scripts/backup-supabase.ts)               | Orchestrator: `npm run backup:run` → temp dir, `runBackup()`, Cleanup                                                                                                |
| [`src/lib/backup/supabase-dump.ts`](../src/lib/backup/supabase-dump.ts)     | `dumpSupabaseArtifacts()` — ruft `npx supabase db dump --linked` (schema/`--data-only`/optional `--role-only`) ohne Shell-Auswertung                                 |
| [`src/lib/backup/recovery-crypto.ts`](../src/lib/backup/recovery-crypto.ts) | `readBackupConfig()`, `encryptArtifact()`/**`decryptArtifact()`** (Gegenstück existiert bereits!), `buildBackupManifest()`, `createSignedS3PutRequest()` (AWS SigV4) |
| [`src/lib/backup/backup-runner.ts`](../src/lib/backup/backup-runner.ts)     | `runBackup()` — validiert Artefaktset, verschlüsselt, baut Manifest, lädt hoch                                                                                       |
| [`src/lib/backup/s3-client.ts`](../src/lib/backup/s3-client.ts)             | `uploadS3Object()` — signierter `PUT`. **Kein `GET` vorhanden** — muss in L6 ergänzt werden.                                                                         |
| `src/lib/backup/__tests__/*.test.ts` (4 Dateien)                            | 9 grüne Tests: Endpoint-/Key-Validierung, GCM-Tamper-Schutz, Manifest-Hash, SigV4, Upload-Fehlerpfad, Dump-Argumente                                                 |

**Bestätigte Fakten für die Restore-Implementierung (L6/L7):**

- Postgres-Major-Version lokal: **17** (`supabase/config.toml:42`) — ein Docker-Restore-Container muss `postgres:17` verwenden, sonst ist ein Schema-Diff gegen die echte Instanz nicht aussagekräftig.
- Lokale Dev-DB: Port **54322**; Shadow-DB (nur `db diff`): Port **54320**; Pooler: Port **54329** (`supabase/config.toml:35,37,47`). **Kein zweiter isolierter Container existiert** — das ist exakt die Lücke, die L7 schließt.
- Verfügbare Werkzeuge (lokal geprüft, siehe Zeile 94 der Vorversion): Node `v22.16.0`, Supabase CLI `2.116.0`. **Nicht vorhanden:** `age`, `rclone`, `restic`, `aws`-CLI, `7z`. Restore-Code darf daher ausschließlich Node-Bordmittel + `fetch` nutzen (wie der bestehende Upload-Pfad), keine externen Binaries voraussetzen.
- `BACKUP_*`-Variablen fehlen aktuell komplett in `.env.example` (kein einziger Treffer) — Gap, wird in L5 geschlossen.
- Tabelleninventar laut `src/types/database.types.ts` (Auszug, für Validierungsqueries in L7/L8 relevant): Finanz/Wallet → `users` (Balance-Feld auf der User-Row, **keine separate `wallets`-Tabelle**), `wallet_transactions`, `wallet_events`, `wallet_invariant_events`, `wallet_ledger_baselines`; Spiel/Fairness → `game_rounds`, `game_sessions`, `crash_rounds`, `seeds`, `seed_history`, `seed_consumptions`; Auth-nah → `user_identities`, `user_login_history`, `anonymous_sessions`. **Es gibt keine Tabellen namens `wallets`, `transactions` oder `bets`** — die aktuelle Doku in `docs/database/09_backup_disaster_recovery.md` behauptet diese Namen fälschlich (wird in L4 korrigiert).
- Wiederverwendbare Finanz-/Security-Regressionstests für L8: [`src/lib/casino/__tests__/wallet-ledger-invariants.test.ts`](../src/lib/casino/__tests__/wallet-ledger-invariants.test.ts) (Immutable-Ledger-Trigger, Reconciliation), [`src/lib/security/__tests__/rls-defense-in-depth.test.ts`](../src/lib/security/__tests__/rls-defense-in-depth.test.ts) (29 Tests, RLS Fail-Closed), [`src/lib/casino/__tests__/wallet-authority.test.ts`](../src/lib/casino/__tests__/wallet-authority.test.ts), [`src/lib/casino/__tests__/wallet-service-authority.test.ts`](../src/lib/casino/__tests__/wallet-service-authority.test.ts).

---

## 3 — Historische Meilensteine (bereits verifiziert, unverändert übernommen)

### L0 — Kontext und Scope · 🟢 verifiziert (2026-09-04 erneut bestätigt)

Scope: Recovery der Supabase-Produktdaten, ihrer Konfiguration und der Nachweise nach einer Wiederherstellung. Kein Produktiv-Restore, kein Tarifwechsel. Re-Verifikation heute per `casino-code-explorer`-Agent bestätigt Abschnitt 2 oben vollständig.

### L1 — Recovery-Zielbild und Risiko-Baseline · 🟢 verifiziert (lokal)

**Verbindliche Startziele:** `RPO ≤ 24 h`, `RTO ≤ 4 h`. RPO ist der Abstand zwischen Schadenszeitpunkt und dem jüngsten vollständig verifizierten Export (Tagesexport inkl. Puffer max. 26 h alt). RTO misst vom festgestellten Verlust bis zum isoliert wiederhergestellten, mit L8 geprüften Ziel.

| Datenklasse                                                                               | Priorität                 | Recovery-Ziel                                                                                        | Explizite Grenze                                                                       |
| ----------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `public`-Produktdaten: Nutzerbezug, Wallet-Ledger, Spielrunden, Seeds, Risiko-/Auditdaten | P0                        | konsistenter logischer Schema- und Datenexport; Wiederherstellung vor jeder erneuten Schreibfreigabe | Kein Produktiv-Restore als Drill; unvollständiger Export sperrt Erfolgsmeldung.        |
| Datenbankcode: Funktionen, RLS, Grants, Trigger, Extensions, Migrationsstand              | P0                        | migrationsreproduzierbarer Stand plus Schemaexport; L8 prüft Rechte und Invarianten                  | Migrationen allein ersetzen keine Produktdaten.                                        |
| Auth-Identitäten und -Konfiguration                                                       | P1                        | inventarisieren, separat wiederherstellbar machen                                                    | `supabase db dump` exportiert `auth` nicht — keine falsche Vollständigkeitsbehauptung. |
| Realtime-/Dashboard-/Projektkonfiguration                                                 | P1                        | versioniertes, secretfreies Recovery-Inventar                                                        | Keys/Passwörter werden nicht exportiert, sondern rotiert/neu gesetzt.                  |
| Supabase Storage-Objekte                                                                  | P2, aktuell nicht genutzt | bei erster Nutzung eigener Objekt-Export/Restore-Test                                                | DB-Dumps sichern nur Metadaten, nicht Objekte.                                         |
| Externe Dienste (Vercel, Upstash, Sentry, PostHog, Trigger.dev)                           | P2                        | getrenntes Inventar mit Eigentümer/Wiederanlaufhinweis                                               | Kein Teil des DB-Exports; keine Secrets im Repo.                                       |

### L2 — Offsite-Backup-Design · 🟢 verifiziert (lokal)

Gewählter Zielvertrag: dedizierter, vom Supabase-Projekt getrennter S3-kompatibler Object-Storage-Bucket. Zugriff auf einen Backup-Präfix beschränkt (Upload/Download/Listing, **keine Löschberechtigung für den Runner**). **Retention wird durch eine Bucket-Lifecycle-Regel durchgesetzt, nicht durch Anwendungscode mit Delete-Rechten** — bewusste Least-Privilege-Entscheidung, in L10 als fertige Konfigurationsvorlage an Jan übergeben.

| Bereich                                 | Festlegung                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Schema/Daten/Rollen                     | 3 getrennte SQL-Artefakte, `--role-only` nur bei nachgewiesenen Custom Roles                            |
| Verschlüsselung                         | AES-256-GCM pro Artefakt, frischer 96-Bit-IV, Auth-Tag mitgespeichert                                   |
| Schlüssel                               | `BACKUP_ENCRYPTION_KEY_BASE64` (32 Byte), unabhängig von DB-/Storage-Credentials                        |
| Manifest                                | JSON ohne Secrets: Artefaktname, Größe, SHA-256 des Ciphertexts, IV, Auth-Tag, Key-Version, Zeitstempel |
| Retention (Lifecycle-Regel, nicht Code) | 14 tägliche, 8 wöchentliche, 12 monatliche Sicherungen; Upload-Präfix nach UTC-Datum                    |

### L3 — Automatisierter Export-Runner · 🟡 gebaut, lokal getestet, nie gegen echtes Ziel gelaufen

Siehe Abschnitt 2 — vollständig implementiert und mit 9 Tests abgesichert. Negativnachweis bestätigt: `npm run backup:run` ohne `BACKUP_*`-Secrets bricht mit Exit-Code `1` ab, **bevor** CLI oder Object Storage aufgerufen werden. Bleibt bewusst auf 🟡, bis L11 den ersten echten Lauf verifiziert — das blockiert aber ab sofort **nicht mehr** L4–L9.

---

## 4 — Neue Meilensteine (alle LLM-autonom, keine Jan-Abhängigkeit)

### L4 — Doku-Korrektur: Säule-9-Doku an echten Code angleichen

- **Ziel:** `docs/database/09_backup_disaster_recovery.md` und `docs/archive/05_backup_recovery_context.md` widersprechen dem echten Code (falsche Tabellennamen, PowerShell-Pseudocode statt echter TS-Implementierung, "keine Automatisierung"-Behauptung).
- **Scope:** Nur diese zwei Dateien. Kein Code-Änderung.
- **Schritte:**
  1. `docs/database/09_backup_disaster_recovery.md` Abschnitt 3: `wallets`, `transactions`, `bets` → `users` (Balance-Feld), `wallet_transactions`, `game_rounds` ersetzen (siehe Abschnitt 2 Tabelleninventar oben).
  2. Abschnitt 3 "Automatisches Export-Skript" (PowerShell-Pseudocode `scripts/backup-export.ps1`, existiert nicht) ersetzen durch Verweis auf die echten Dateien aus Abschnitt 2 dieser Planungsdatei (`npm run backup:run`, `scripts/backup-supabase.ts`).
  3. Abschnitt 5 "Restore-Runbook": Schritt 3 (`psql ... -f backups/data.sql`) und die 5 Post-Restore-Checks bleiben konzeptionell richtig, aber auf L6–L8 dieser Datei verweisen statt sie als bereits fertig darzustellen.
  4. `docs/archive/05_backup_recovery_context.md`: Zeile mit "keine Backup-Automatisierung im aktiven Codebaum" korrigieren oder die Datei klar als überholt/archiviert kennzeichnen mit Verweis auf diese Planungsdatei.
- **Verifizierung:** `grep -rn "wallets\|bets" docs/database/09_backup_disaster_recovery.md` liefert keine Treffer mehr; beide Dateien verweisen auf reale Pfade aus Abschnitt 2.
- **Freigabe-Gate:** Keines (reine Doku-Korrektur).
- **Nicht-Scope:** Keine Änderung an `00_DATABASE_OVERVIEW.md` oder `11_master_summary.md`.
- **Money-Pfad:** Nein. **Security-Review:** Nein.

### L5 — `.env.example` um `BACKUP_*` ergänzen

- **Ziel:** Die in `recovery-crypto.ts:74-87` bereits vom Code erwarteten Variablen sind für neue Entwickler/Konversationen nicht auffindbar.
- **Schritte:** In `.env.example`, analog zum bestehenden Muster für Upstash (`.env.example:15-17`) und Sentry (`:46-51`), einen Kommentarblock + Platzhalter für `BACKUP_ENCRYPTION_KEY_BASE64`, `BACKUP_S3_ENDPOINT`, `BACKUP_S3_BUCKET`, `BACKUP_S3_REGION`, `BACKUP_S3_ACCESS_KEY_ID`, `BACKUP_S3_SECRET_ACCESS_KEY`, `BACKUP_S3_PREFIX`, `BACKUP_INCLUDE_ROLES`, `BACKUP_ENCRYPTION_KEY_VERSION` ergänzen. **Nur Platzhalter, keine echten Werte.**
- **Verifizierung:** `npm run backup:run` ohne echte Secrets scheitert weiterhin fail-closed (unverändertes Verhalten), aber ein Mensch/LLM sieht jetzt in `.env.example`, welche Variablen zu setzen sind.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (reine Doku-Variable, kein echter Secret-Wert).

### L6 — Restore-Code: Download, Entschlüsselung, Apply

- **Ziel:** Symmetrisches Gegenstück zum bestehenden Backup-Pfad bauen. `decryptArtifact()` existiert bereits (`recovery-crypto.ts:100-105`) — nur Download und DB-Apply fehlen.
- **Schritte:**
  1. `src/lib/backup/recovery-crypto.ts`: `createSignedS3PutRequest` generalisieren (Methodenparameter) oder eine Sibling-Funktion `createSignedS3GetRequest` ergänzen — gleiches SigV4-Schema, `GET` statt `PUT`, kein Body.
  2. Neue Datei `src/lib/backup/s3-download.ts`: `downloadS3Object()` analog zu `uploadS3Object()` in `s3-client.ts`, nutzt die signierte GET-Anfrage, wirft bei Non-2xx ohne Credential-/Provider-Details (gleiches Fehlerverhalten wie Upload).
  3. Neue Datei `src/lib/backup/supabase-restore.ts`: `restoreSupabaseArtifacts()` — nimmt entschlüsselte `schema.sql`/`data.sql`-Buffer entgegen, schreibt sie ins Temp-Verzeichnis, führt `psql` gegen eine übergebene Connection-URL aus (kein `--linked`, keine Supabase-CLI-Magie nötig, `psql` reicht für reinen SQL-Apply).
  4. **Zwingender Safety-Guard** in `supabase-restore.ts`: Funktion verweigert die Ausführung (`throw`), wenn die Ziel-Connection-URL `127.0.0.1:54322` (lokale Haupt-Dev-Instanz), einen Host, der auf `.supabase.co` endet, oder den in `xx_docs/01_supabase_context.md` dokumentierten Projekt-Ref `hmqwozhdckbwjqzcmire` enthält. Nur explizit andere Ports/Hosts (der in L7 erzeugte ephemere Container) sind zulässig. Das macht "niemals gegen Produktion" zu einer Code-Garantie statt reiner Disziplin.
  5. Neues Skript `scripts/restore-supabase.ts`: Orchestrator analog `backup-supabase.ts` — liest Manifest + Ciphertexts (lokal aus Datei **oder** via `s3-download.ts`), entschlüsselt, ruft `restoreSupabaseArtifacts()`.
  6. Vitest-Tests analog zu den 4 bestehenden Backup-Testdateien: Safety-Guard-Negativtest (Restore gegen `127.0.0.1:54322` muss werfen), Download-Fehlerpfad, Decrypt-Tamper-Schutz (Wiederverwendung der bestehenden GCM-Tamper-Tests als Vorlage).
- **Verifizierung:** `npm test -- src/lib/backup` grün inkl. neuer Restore-Tests; `npm run typecheck` ohne neue Fehler.
- **Freigabe-Gate:** Keines — reiner Code-Aufbau, keine Ausführung gegen echte Daten in diesem Meilenstein.
- **Nicht-Scope:** Kein echter Restore-Lauf hier (das ist L7). Kein CI-Wiring hier (das ist L9).
- **Money-Pfad:** Nein (Code-Aufbau). **Security-Review:** Pflicht (Kryptografie- und Connection-String-Handling — vor Abschluss `security-reviewer` auf die 4 neuen Dateien ansetzen).

### L7 — Isolierter Restore-Drill (ephemerer Docker-Container) · 🟢 verifiziert (2026-09-05)

- **Ziel:** Die in der Vorversion nur als "Disziplin" beschriebene Isolation ("nie gegen `--linked` Remote") durch eine echte technische Trennung ersetzen: ein separater, wegwerfbarer Container statt der geteilten lokalen Dev-Instanz auf Port 54322.
- **Wichtiger technischer Vorbehalt (vor Implementierung zu klären, nicht blind übernehmen):** `public`-Schema-Objekte referenzieren häufig `auth.uid()` in RLS-Policies (siehe `rls-defense-in-depth.test.ts`). Ein vanilla `postgres:17`-Container **hat kein `auth`-Schema und keine `auth.uid()`-Funktion** — `schema.sql` einspielen kann daher mit `schema "auth" does not exist` fehlschlagen. Zwei Optionen, erste zuerst versuchen:
  1. **Bevorzugt:** Vor dem Einspielen von `schema.sql` einen minimalen Stub anlegen: `CREATE SCHEMA IF NOT EXISTS auth; CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;` (plus ggf. `auth.role()`, falls Policies das nutzen — per `grep -r "auth\." supabase/migrations/*.sql` vorab prüfen, welche `auth.*`-Funktionen tatsächlich referenziert werden). Deutlich schneller als Alternative 2 und ausreichend, um Schema+RLS-Struktur zu verifizieren (nicht die Auth-Funktionalität selbst).
  2. **Fallback, falls 1 nicht ausreicht:** Statt vanilla Postgres eine zweite, isolierte lokale Supabase-Instanz nutzen (z. B. `supabase start --workdir <temp-copy-des-repos>` mit eigenem `project_id` in einer temporären `config.toml`-Kopie, andere Ports) — hat `auth`/`storage`/`extensions` bereits vorprovisioniert, kostet aber mehr Laufzeit und Komplexität.
     Das tatsächliche Ergebnis dieser Klärung in diesem Abschnitt der Datei nachtragen, sobald L7 umgesetzt ist.
- **Schritte:**
  1. Neues Skript `scripts/restore-drill.ts`:
     a. `supabase db dump` gegen die lokale Dev-Instanz ausführen (Version 2.116.0 prüfen: ob `--linked` weglassen automatisch auf `supabase status`/lokale Instanz zielt, oder ob `--db-url postgresql://postgres:postgres@127.0.0.1:54322/postgres` explizit nötig ist — `npx supabase db dump --help` konsultieren, bevor Annahme in Code gegossen wird) → frischer, ungefährlicher Test-Dump (kein Remote-Zugriff, keine Secrets nötig).
     b. Ephemeren Container starten: `docker run --rm -d --name casino-restore-drill -e POSTGRES_PASSWORD=postgres -p 55432:5432 postgres:17` (Version **muss** `17` sein, siehe Abschnitt 2) und den `auth`-Stub aus dem Vorbehalt oben einspielen.
     c. Warten bis der Container bereit ist (Poll auf `pg_isready` oder kurze Retry-Schleife), dann `schema.sql` und `data.sql` per `psql -h 127.0.0.1 -p 55432 -U postgres -d postgres -f <datei>` einspielen — nutzt `restoreSupabaseArtifacts()` aus L6 mit der Drill-Connection-URL.
     d. Validierungsqueries: Tabellenanzahl im `public`-Schema mit erwarteter Kernliste abgleichen (siehe Abschnitt 2 Tabelleninventar), Row-Count `> 0` für `users` und `wallet_transactions` (sofern die lokale Dev-DB Testdaten enthält — sonst nur Schema-Existenz prüfen), Dauer der Schritte b–d messen und ausgeben (RTO-Rohmessung).
     e. Container abbauen: `docker stop casino-restore-drill` (durch `--rm` automatisch entfernt).
  2. Fehlerpfad: Wenn Docker nicht verfügbar ist, Skript bricht mit klarer Meldung ab statt stillschweigend zu überspringen.
- **Verifizierung:** `npx tsx scripts/restore-drill.ts` läuft lokal einmal manuell durch, meldet Erfolg + gemessene Dauer; zweiter Lauf ist idempotent (alter Container-Name wird vorher aufgeräumt, falls ein vorheriger Lauf abgebrochen ist).
- **Freigabe-Gate:** Keines — läuft ausschließlich gegen lokale Dev-Daten und einen wegwerfbaren Container, keine externe Wirkung.
- **Nicht-Scope:** Kein echter Produktionsdaten-Restore (erst möglich nach L11, und selbst dann nur in einen weiteren ephemeren Container, nie zurück ins Live-Projekt).
- **Money-Pfad:** Nein (nur lokale Testdaten). **Security-Review:** Pflicht (Docker-Aufruf und `psql`-Ausführung ohne Shell-Injection-Lücke — Argumente als Array übergeben, kein String-Interpolation in Shell-Kommandos, analog zu `supabase-dump.ts`).

- **Umsetzung 2026-09-05 — Auflösung der Vorbehalte (durch 13 Debug-Iterationen empirisch belegt):**
  - **Image-Wahl:** Vorbehalt-Option 2 (zweite Supabase-Instanz) nicht nötig — der Drill nutzt dynamisch das **Image der laufenden lokalen Supabase-DB** (`docker inspect supabase_db_Casino`, Fallback `postgres:17`). Damit sind alle Extensions verfügbar (`pg_cron`, `pg_net`, `vector`, `pgcrypto`, `pg_stat_statements`, `uuid-ossp`, `supabase_vault` — per `pg_available_extensions` verifiziert), ohne Vanilla-Postgres-Erweiterungslücken.
  - **auth-Stub:** Option 1 umgesetzt, erweitert um `auth.role()` und `auth.jwt()` (per Migrationen-Grep ermittelt).
  - **Init-Restart-Rasse:** Der Supabase-Image-Init fährt die DB ~10 s nach Containerstart einmal herunter und wieder hoch. Gelöst durch `waitForStableReady()`: Ready gilt erst, wenn ein `SELECT 1` nach einem 20-s-Stabilitätsfenster erneut gelingt; alle Prep-Statements laufen mit Retry auf transiente Fehler (`shutting down`, Connection-Rennen). Der frühere `pg_graphql`-Marker erwies sich als ungeeignet (wird im Drill-Container nie erzeugt).
  - **Schema-Umfang des CLI-Dumps (wichtig für echte Restores):** `supabase db dump` enthält im Schema-Dump **nur `public`** (keine `CREATE SCHEMA`-Zeilen, keine Event-Trigger, kein `pg_graphql`); der Data-Dump referenziert zusätzlich `auth.refresh_tokens_id_seq` und `supabase_functions.hooks_id_seq` (leere `setval`s). Der Drill legt dafür Sequenz-/Schema-Stubs an — Semantik: „frisch provisionierte Supabase-Zielumgebung". Ein echter Produktiv-Restore (L11) zielt ebenfalls auf eine provisionierte Instanz, nicht auf den nackten Image-Container.
  - **psql im Container:** Kein Host-psql nötig — `dockerPsqlExecutor` kopiert die Artefakte per `docker cp` ins Container-`/tmp` und führt psql dort über den Unix-Socket aus (das Image lauscht nicht auf TCP); der Executor-Aufruf läuft trotzdem durch `restoreSupabaseArtifacts()` inkl. Safety-Guard.
- **Verifikation:** `npx tsx scripts/restore-drill.ts` zweimal hintereinander grün: Lauf 1 — 39 Public-Tabellen, Restore 5,4 s, gesamt 46,8 s; Lauf 2 (Idempotenz, alter Container wird vorher erzwungen entfernt) — identisches Ergebnis, gesamt 44,2 s. RTO-Rohmessung: Restore selbst ~5 s, voller Zyklus inkl. Dump + Container-Start < 50 s — `RTO ≤ 4 h` mit großem Puffer erfüllt (lokal).

### L8 — Finanz-/RLS-Regressionscheck auf dem Drill-Ziel · 🟢 verifiziert (2026-09-05)

- **Ziel:** Nach jedem L7-Drill automatisiert nachweisen, dass die wiederhergestellten Daten den Finanz- und Zugriffsinvarianten genügen — nicht nur "Schema ist da", sondern "Geld- und Sicherheitslogik funktioniert".
- **Schritte:**
  1. Prüfen (LLM-Recherche als Teil dieses Meilensteins), ob `wallet-ledger-invariants.test.ts` und `rls-defense-in-depth.test.ts` ihre Ziel-DB-Verbindung aus einer Umgebungsvariable lesen oder hart auf die lokale Dev-Instanz (54322) verdrahtet sind.
  2. Falls hart verdrahtet: eine Env-Var-basierte Overrideoption ergänzen (z. B. `TEST_DATABASE_URL`), die bei Vorhandensein Vorrang vor dem Default hat — **ohne bestehendes Testverhalten für den Normalfall zu verändern** (Default bleibt Port 54322, wenn die Var fehlt).
  3. Neues Skript oder npm-Script `test:restore-drill`, das `restore-drill.ts` (L7) ausführt und anschließend `wallet-ledger-invariants.test.ts` + `rls-defense-in-depth.test.ts` + `wallet-authority.test.ts` + `wallet-service-authority.test.ts` mit `TEST_DATABASE_URL` auf den Drill-Container (Port 55432) zeigend laufen lässt.
  4. Bei jedem roten Test: Drill gilt als fehlgeschlagen, Container wird trotzdem aufgeräumt (kein Leck).
- **Verifizierung:** `npm run test:restore-drill` lokal grün.
- **Freigabe-Gate:** Keines.
- **Nicht-Scope:** Keine inhaltliche Änderung der vier wiederverwendeten Testdateien selbst — nur die Verbindungsquelle wird parametrisierbar gemacht.
- **Money-Pfad:** **Ja** (prüft Wallet-/Ledger-Invarianten). **Security-Review:** Pflicht.

- **Umsetzung 2026-09-05 — Plan auflösende Prüfung (Schritt 1) mit ehrlicher Korrektur:**
  - **Befund:** Alle vier wiederverwendeten Testdateien (`wallet-ledger-invariants`, `rls-defense-in-depth`, `wallet-authority`, `wallet-service-authority`) sind **statische Datei-Assertions** (`readFileSync` auf Migrations-/Source-Dateien, String-Matching) — **keine davon besitzt eine DB-Verbindung**. Eine `TEST_DATABASE_URL`-Override-Option (Schritt 2) wäre daher an dieser Stelle Scheinverifikation gewesen und wurde **nicht gebaut** (gemäß Abschnitt-0-Regel: der Code gewinnt, die Datei wird korrigiert). Eine echte DB-Test-Infrastruktur bleibt bewusst beim pgTAP-Plan (T_DATABASE/10) abgegrenzt.
  - **Stattdessen — echte Live-DB-Invarianten in den Drill selbst** (`validateFinancialInvariants()` in `scripts/restore-drill.ts`): Katalog-Queries direkt gegen die wiederhergestellte DB, fail-closed mit klarer Fehlermeldung: (1) RLS aktiv auf exakt den 5 Kern-Tabellen `users`, `wallet_transactions`, `game_rounds`, `wallet_ledger_baselines`, `wallet_invariant_events`; (2) aktiver Guard-Trigger auf `wallet_transactions` (`tgenabled <> 'D'`); (3) `reconcile_wallet_ledger` + `admin_update_user` RPCs vorhanden. Ergebnis landet im Drill-JSON (`invariants`-Feld).
  - **Komplementärprüfung:** `package.json` → `test:restore-drill` = Drill (inkl. Live-Invarianten) + die 4 statischen Suiten (37 Tests, verifizieren den Migrations-Quelltext, aus dem das restored Schema entstand).
- **Verifikation:** `npm run test:restore-drill` grün (2026-09-05): Drill-JSON mit `invariants.rlsEnabledCoreTables` (5 Tabellen), `walletAppendOnlyTriggerActive: true`, `walletRpcsPresent: 2`; danach 4 Testdateien / 37 Tests in 311 ms. Gesamtdauer ~45 s (lokal).

### L9 — CI-Workflow für den Gesamtzyklus · 🟢 verifiziert (2026-09-05, grüner CI-Run)

- **Ziel:** L7+L8 nicht nur lokal manuell, sondern automatisiert bei jeder relevanten Änderung und auf Zeitplan.
- **Schritte:**
  1. Neue Datei `.github/workflows/backup-drill.yml`: `ubuntu-latest` (hat Docker vorinstalliert), `supabase start` (lokale Instanz im Runner), `npm run test:restore-drill` (L8) ausführen.
  2. Trigger: `schedule` (wöchentlich, z. B. Sonntag 03:00 UTC) **und** `push`/`pull_request` bei Änderungen an `src/lib/backup/**`, `scripts/*backup*`, `scripts/*restore*`, `supabase/migrations/**`.
  3. Keine Secrets im Workflow nötig — der gesamte Zyklus läuft gegen lokale Dev-Daten im Runner.
  4. Bei Fehlschlag: GitHub-Actions-Status rot, keine automatische Benachrichtigung außerhalb von GitHub nötig in dieser Phase (Alerting ist Teil eines späteren, hier nicht enthaltenen Regelbetrieb-Ausbaus).
- **Verifizierung:** Workflow einmal per `workflow_dispatch` manuell ausgelöst (oder über einen Test-Push), Lauf grün beobachtet (`gh run watch`, analog zum bereits etablierten Muster in Kategorie 04, siehe `worldmap/00_WORLDMAP_STATUS.md` Zeile 46).
- **Freigabe-Gate:** Keines — reine CI-Konfiguration, kein Secret, kein externer Zugriff.
- **Nicht-Scope:** Kein echter Offsite-Backup-Lauf im CI (das bräuchte Secrets → bewusst nicht Teil dieses Workflows, siehe L11).
- **Money-Pfad:** Nein (CI-Infrastruktur). **Security-Review:** Nein (kein neuer Datenzugriff, nur Ausführung bestehender L7/L8-Skripte).

- **Umsetzung 2026-09-05:**
  - [`.github/workflows/backup-drill.yml`](../.github/workflows/backup-drill.yml) erstellt: `ubuntu-latest`, Timeout 30 min, `npm ci` → `npx supabase start` (Dump-Quelle) → `npm run test:restore-drill` (L7-Drill inkl. L8-Live-Invarianten + 4 statische Suiten) → `npx supabase stop --no-backup` (`if: always`). Trigger: `schedule` (Sonntag 03:00 UTC), `push`/`pull_request` auf `main` mit Pfadfilter (`src/lib/backup/**`, Backup-/Restore-/Drill-Skripte, `supabase/migrations/**`, `supabase/config.toml`) und `workflow_dispatch`. Keine Secrets (`permissions: contents: read`), Concurrency-Gruppe.
  - **Voraussetzung geschaffen:** Supabase-CLI erstmals als exakte devDependency gepinnt (`supabase@2.116.0` in `package.json` + Lockfile) — vorher kam der CLI-Aufruf nur aus dem lokalen npx-Cache; auf CI wäre `npx --no-install supabase` (im Drill-Script) sonst fehlgeschlagen und `npx supabase` wäre unpinned. Der Drill läuft unverändert.
  - **Verifikation:** YAML syntaktisch validiert (js-yaml-Parse: 4 Trigger, Job `restore-drill`, 5 Steps). Der planerisch geforderte grüne Workflow-Lauf (`workflow_dispatch` beobachtet) erfordert einen Push auf GitHub (**K4**) — bleibt wie 01-L3/02-L3 als Push-Residuum offen, nicht stillschweigend als erledigt markiert.
  - Hinweis für den ersten CI-Lauf: Der Drill löst sein Restore-Image dynamisch vom `supabase start`-Container (`supabase_db_Casino`) — im Runner identisch benannt wie lokal, kein Fallback auf vanilla postgres:17 nötig.
  - **CI-Nachweis (2026-09-05):** Grüner Dispatch-Lauf auf `main` — **Run 33988968506, Job `restore-drill` ✅ success**. Der erste Lauf (Run 33988298709) war rot: die Drill-/Restore-Skripte und `src/lib/backup/` waren im L4-Commit-Plan vergessen worden (`ERR_MODULE_NOT_FOUND scripts/restore-drill.ts`) — nachgecommittet in `38f5b76` (Drill + Recovery-Lib) und `bab3ab1` (ER-Diagramm-Drift-Check), dann Neulauf grün.

---

## 5 — Verbleibende Jan-Gates (bewusst minimiert auf 3 von 12 Meilensteinen)

### L10 — Externes Backup-Ziel wählen & anlegen · Zuständigkeit: Jan

- **Warum zwingend Jan:** Kontoerstellung bei einem externen Anbieter, Zahlungsmittel-/Kostenentscheidung, Erzeugung echter Zugangsdaten — das darf laut `xx_sop/09_security_wallet_invariants.md` (Secret-Isolation) nicht vom LLM erzeugt oder gesehen werden.
- **Was das LLM vorbereitet, damit Jans Aufwand minimal ist:** Eine kurze Empfehlung mit 2–3 S3-kompatiblen Anbietern (z. B. Cloudflare R2, Backblaze B2 — beide mit kostenlosem Einstiegskontingent, S3-API-kompatibel, passend zu `createSignedS3PutRequest`), plus eine fertige Lifecycle-Regel-Vorlage nach der L2-Retention-Tabelle (14 täglich/8 wöchentlich/12 monatlich) zum Copy-Paste in die Provider-Konsole.
- **Jans konkrete Aufgabe:** Anbieter wählen, Bucket anlegen, Lifecycle-Regel einfügen, Zugriffsschlüssel mit Rechten nur auf einen Backup-Präfix erzeugen (Upload/Download/Listing, kein Delete), die 7 `BACKUP_*`-Werte aus L5 in `.env.local` (nie committen) eintragen.
- **Freigabe-Gate:** K4 (Infrastruktur/Kosten).

### L11 — Erster echter Offsite-Lauf + Restore-Verifikation · Zuständigkeit: Jan-Freigabe, Ausführung LLM

- **Ablauf:** Nach L10 führt das LLM `npm run backup:run` einmal aus (echter Upload), danach `scripts/restore-supabase.ts` (L6) gegen einen erneuten ephemeren L7-Container mit den **echten** heruntergeladenen Artefakten — Beweis, dass der komplette Zyklus Ende-zu-Ende funktioniert, nicht nur simuliert.
- **Freigabe-Gate:** K4 vor dem ersten Remote-Export/Upload (explizite Jan-Bestätigung "jetzt echten Lauf starten"), analog zur bestehenden K-Level-Matrix in `docs/database/09_backup_disaster_recovery.md` Abschnitt 6.
- **Money-Pfad:** Ja (echte Produktdaten verlassen erstmals das Supabase-Projekt). **Security-Review:** Pflicht.

### L12 — PITR-Tarif-Entscheidung · Zuständigkeit: Jan, nachrangig

Unverändert gegenüber der Vorversion: PITR ist erst relevant, wenn `RPO ≤ 24 h` nicht mehr genügt oder Umsatz-/Nutzerschwellen (siehe `docs/database/09_backup_disaster_recovery.md` Abschnitt 4) erreicht sind. Keine Aktion vor L11.

---

## 6 — Definition of Done

Der Plan ist erst **Executed (archiviert)**, wenn:

1. Ein verschlüsselter, vom Supabase-Projekt unabhängiger Datenbankexport existiert mit dokumentierter Retention (Lifecycle-Regel aktiv) und erfolgreicher Integritätsprüfung (L11).
2. Ein Restore lief isoliert durch (L7/L11); Dauer ist gemessen und erfüllt `RTO ≤ 4 h`.
3. Nach dem Restore sind Migrationsstand, kritische Tabellen, Wallet-Ledger, RPC-Berechtigungen und RLS-Negativfälle automatisiert verifiziert (L8).
4. Der Gesamtzyklus läuft automatisiert und ohne Secrets in CI (L9).
5. Auth-/Realtime-/Extension-/Secret-Konfigurationen sind als Recovery-Inventar dokumentiert (weiterhin offen, kein Meilenstein in dieser Überarbeitung — P1 in L1-Tabelle, künftige Erweiterung).
6. Der Regelbetrieb erkennt fehlende/überfällige Sicherungen (weiterhin offen, künftige Erweiterung nach L11).

**Hinweis:** Punkt 5 und 6 sind bewusst nicht in L4–L9 aufgenommen, weil sie erst nach L10/L11 sinnvoll sind (Auth-Inventar ohne echtes Backup-Ziel und Alerting ohne echten Regelbetrieb wären Arbeit ohne Verifizierbarkeit). Sie sind hier als bekannte Lücke benannt, nicht vergessen.

---

## 7 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber `T_DATABASE/10_database_testschicht_pgtap.md` (DB-Test-Schicht, separater Plan) abgegrenzt: L8 **nutzt** bestehende Tests wieder, baut aber keine neue DB-Testinfrastruktur — das ist explizit Scope des DB-Testschicht-Plans, nicht dieses.
- [x] Abhängigkeiten benannt: L6 vor L7 vor L8 vor L9; L10 vor L11; L12 unabhängig, nachrangig.
- [x] Jede neue Schreiboperation (S3-Download, `psql`-Apply) hat Allowlist (Safety-Guard in L6), Negativtest (L6-Test) und Fallback (Fehlerpfad bricht ab, kein stiller Teilerfolg).
- [x] Statusbehauptungen sind als lokal/verifiziert/live gekennzeichnet (Abschnitt 2 und 3 mit Datum 2026-09-04) und verlinken auf Quellcode.
- [x] Keine Referenz doppelt gepflegt: K-Level-Matrix bleibt in `docs/database/09_backup_disaster_recovery.md`, hier nur verlinkt.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 2 liefern den kompletten Einstiegskontext ohne Chat-Historie.

**Bekannte, bewusst offene Lücken (nicht vergessen, siehe Abschnitt 6 Punkt 5/6):** Auth-/Realtime-Konfigurationsinventar und automatisiertes Alerting bei überfälligen Backups sind erst nach L11 sinnvoll bearbeitbar und daher nicht Teil von L4–L9.

---

## 8 — Verwandte Artefakte

| Bedarf                                                                  | Datei                                                                                                                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Kanonischer Doku-Standard (Säule 9)                                     | [`docs/database/09_backup_disaster_recovery.md`](../docs/database/09_backup_disaster_recovery.md) — wird in L4 korrigiert |
| Verifizierter Code-/Datenpfad-Kontext (archiviert, teils veraltet)      | [`docs/archive/05_backup_recovery_context.md`](../docs/archive/05_backup_recovery_context.md) — wird in L4 korrigiert     |
| Tabelleninventar, 3-Client-Architektur                                  | [`xx_docs/01_supabase_context.md`](../xx_docs/01_supabase_context.md)                                                     |
| Supabase-Betriebs-SOP                                                   | [`xx_sop/05_database_supabase.md`](../xx_sop/05_database_supabase.md)                                                     |
| Finanz-/Sicherheitsnachweis-Pflichten nach Restore                      | [`xx_sop/09_security_wallet_invariants.md`](../xx_sop/09_security_wallet_invariants.md)                                   |
| Gewichtete Subkategorien-Bewertung (Säule 9 = höchstgewichtetes Risiko) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md)                                                            |
| Übergeordnete Aufschlüsselung (Kategorie 02, alle 10 Säulen)            | [`worldmap/04_datenbank_migrationen.md`](../worldmap/04_datenbank_migrationen.md)                                         |
| Planungsdateien-Konvention                                              | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                               |
