# 12 — Restpunkte der T_DATABASE-Execution (CI-Nachweise, Doku-Residuen, Jan-Gates)

> **Status:** 🟡 Ausgeführt (L0–L5 verifiziert am 2026-09-05 inkl. 5 grünen CI-Läufen — L6/L7 Jan-Gates offen) · **Stand:** 2026-09-05 · **Owner:** LLM, Jan nur wo zwingend (K4/Secrets/Cloud) · **Scope:** Alle nach der T_DATABASE-Execution vom 2026-09-05 gemeldeten, dort bewusst offen gelassenen Punkte — sie sind in den Plänen 01/02/05/06/10/11 jeweils als "offen/Jan-seitig" dokumentiert, aber in **keiner** Planungsdatei selbst umsetzbar gewesen. Kein neuer Schema-/Code-/Migrations-Scope, keine Re-Rating-Entscheidung ohne Jan.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1 (Übersicht) und Abschnitt 2 (Herkunft der Restpunkte mit Quellverweisen) vollständig. Diese Datei heißt `T_DATABASE/12_database_restpunkte_ci_doku_jan_gates.md`.
2. Beginne bei L1 in Reihenfolge. Die Meilensteine sind bewusst nach **Zuständigkeit geordnet**: zuerst die reinen LLM-Punkte (L1–L3, keine Freigabe nötig), dann die Jan-Gate-Punkte (L4–L6).
3. **K4-Regel beachten** (`CLAUDE.md` K-Matrix): L4 (Commit/Push) und L5 (GitHub-Secret) sind Jan-Handlungen — der LLM bereitet vor, führt aber nicht aus. L6 (Backup L10–L12) ist Jan-zuständig, der LLM liefert Checkliste und Begleitung.
4. Nach jedem Meilenstein: Ampel in Abschnitt 1 aktualisieren und Status-Kopf im selben Edit mitziehen.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                                       |                                  Status                                  | Nächster Schritt                                           |              Zuständigkeit              | Money-Pfad |
| --- | --------------------------------------------------------------------------------- | :----------------------------------------------------------------------: | ---------------------------------------------------------- | :-------------------------------------: | :--------: |
| L0  | Kontext & Scope                                                                   |                       🟢 verifiziert (2026-09-05)                        | —                                                          |                   LLM                   |    Nein    |
| L1  | npm-Script `supabase:types` auf kanonisches `--local` umstellen                   |                       🟢 verifiziert (2026-09-05)                        | —                                                          |                   LLM                   |    Nein    |
| L2  | Doku-Residuen: `public.wallets` in `docs/database/10` §5 korrigieren              |                       🟢 verifiziert (2026-09-05)                        | —                                                          |                   LLM                   |    Nein    |
| L3  | 7 weitere "Penetrationstest"-Formulierungen präzisieren                           |                       🟢 verifiziert (2026-09-05)                        | —                                                          |                   LLM                   |    Nein    |
| L4  | Commit + Push aller T_DATABASE-Artefakte (schließt CI-Nachweise von 01/09/10)     |              🟢 verifiziert (2026-09-05, 3 grüne CI-Läufe)               | —                                                          | **Jan** (Freigabe) + LLM (Vorbereitung) |    Nein    |
| L5  | GitHub-Secret `SUPABASE_ACCESS_TOKEN` hinterlegen + erste CI-Läufe beobachten     | 🟢 verifiziert (2026-09-05, beide Läufe grün: 33992692301 + 33993162288) | Secret in Repo-Settings, dann 3 Workflow-Dispatches        |  **Jan** (Secret) + LLM (Beobachtung)   |    Nein    |
| L6  | Backup L10–L12: Cloud-Credentials, KMS/Bucket, erster echter Restore-Drill        |               🟡 Anleitung vorbereitet — Jan-Anteil offen                | Jan-Anleitung unten (L6-Abschnitt) durchgehen, dann melden |       **Jan** + LLM (Begleitung)        |    Nein    |
| L7  | (Optional) Niveau-Re-Rating in `worldmap/04_datenbank_migrationen.md` vorbereiten |          🟡 Vorlage fertig (Anhang A) — Jan-Entscheidung offen           | Anhang A lesen und entscheiden                             | LLM (Vorschlag), **Jan** (Entscheidung) |    Nein    |

---

## 2 — Verifizierter Ist-Stand (2026-09-05, Quellverweise der offenen Punkte)

Jeder Restpunkt ist in der abgeschlossenen Execution dokumentiert — hier die Herkunft, damit eine neue Konversation nicht re-recherchieren muss:

| Restpunkt                                   | Herkunft (Quelle der Meldung)                                                                                                                                                              | Zustand heute                                                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase:types` nutzt `--linked`           | [`06_database_typsicherheit.md`](./06_database_typsicherheit.md) L2-Fußnote + `00_DATABASE_VERBESSERUNG.md` Fußnote ⁶                                                                      | npm-Script in `package.json` Zeile 25 unverändert; kanonischer Ablauf ist seit der Execution `--local` (deterministische Baseline, siehe 06/L2)             |
| `public.wallets` in `docs/database/10` §5   | [`10_database_testschicht_pgtap.md`](./10_database_testschicht_pgtap.md) L2-Umsetzung, "Zusätzlich gemeldet (außerhalb L2-Scope)"                                                          | Tabelle `wallets` existiert nicht; Wallet-Status liegt auf `users` (verifiziert per `grep` über Migrationen)                                                |
| 7 weitere "Penetrationstest"-Formulierungen | [`10_database_testschicht_pgtap.md`](./10_database_testschicht_pgtap.md) L1-Umsetzung (die 2 kanonischen Dateien sind korrigiert, die restlichen 7 Fundstellen waren außerhalb des Scopes) | Fundstellen via `grep -rn "Penetrationstest\|echte anon" docs/database worldmap xx_sop` reproduzierbar; `11_master_summary.md` + worldmap-Dateien betroffen |
| Commit/Push fehlt für CI-Nachweise          | `00_DATABASE_VERBESSERUNG.md` Fußnoten ¹ ³ ⁵; `05`/`10` Umsetzung-Blöcke                                                                                                                   | Sämtliche Artefakte (Migrationen 063/064, pgTAP-Suite, Workflows, Audit-Datei) liegen **uncommitted** im Arbeitsverzeichnis                                 |
| `SUPABASE_ACCESS_TOKEN` fehlt in CI         | `00_DATABASE_VERBESSERUNG.md` Fußnoten ¹ ⁴; `11` L7-Umsetzung                                                                                                                              | Workflow `query-performance-audit.yml` und `migration-drift-check.yml` sind gebaut, schlagen ohne Secret beim Login fehl (im Workflow-Header dokumentiert)  |
| Backup L10–L12 Jan-Anteil                   | [`05_database_backup_and_recovery.md`](./05_database_backup_and_recovery.md) (L0–L9 🟢)                                                                                                    | L10–L12 sind bewusst nicht LLM-zuständig: reale Cloud-Credentials, KMS-/Bucket-Konfiguration, Auslösung des ersten Drills                                   |
| Niveau-Re-Rating                            | `00_DATABASE_VERBESSERUNG.md` Abschnitt 3 Fußnote "Hinweis zu den Niveau-Werten" + Abschnitt 1 `worldmap/04` offene Headline-Entscheidung                                                  | Werte beschreiben bewusst den Stand **vor** Execution; Re-Rating gehört in den kanonischen worldmap-Review (Jan-Entscheidung)                               |

---

## 3 — Meilensteine

### L1 — npm-Script `supabase:types` auf kanonisches `--local` umstellen

- **Ziel:** Das npm-Script darf der kanonischen, in 06/L2 verifizierten Methode widersprechen (`--linked` erzeugt eine nicht-deterministische Baseline, die die schema-drift-Prüfung in CI vergleicht).
- **Schritte:** In `package.json` `"supabase:types": "npx supabase gen types typescript --linked > ..."` → `--local` ändern; anschließend `npm run supabase:types` ausführen und per `git diff --stat src/types/database.types.ts` verifizieren, dass keine unbeabsichtigte Abweichung gegenüber der committeten Baseline entsteht (die Baseline wurde per `--local` mit CLI 2.116.0 erzeugt — gleiches Ergebnis erwartet; nur wenn die lokale Instanz eine andere Schema-Version trägt, wäre Diff non-empty → dann Befund dokumentieren, nicht stillschweigend committen).
- **Verifizierung:** `npm run typecheck` grün; `git diff src/types/database.types.ts` leer (oder dokumentierter Befund).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05:** `package.json` umgestellt (`--linked` → `--local`). `npm run supabase:types` ausgeführt (lokale Instanz aktiv): das Ergebnis ist **byte-identisch** zur in 06/L2 erzeugten kanonischen Baseline — `git diff --stat` zeigt exakt dieselben 114 Insertions/6 Deletions gegenüber HEAD wie der Original-Lauf, also **keine neue Abweichung** durch den Script-Wechsel. `npm run typecheck` grün. (Hinweis: Der Diff gegenüber HEAD ist nicht leer, weil die Baseline-Erneuerung selbst Teil des uncommitted Arbeitsstands aus der Execution vom 2026-09-05 ist — sie geht mit L4 in den Commit.)

### L2 — Doku-Residuen: `public.wallets` in `docs/database/10_automatisierte_db_testschicht.md` §5

- **Ziel:** Die Beispiel-Queries in §5 fragen die nicht-existierende Tabelle `public.wallets` ab — Jemand, der dem Beispiel folgt, erhält einen Fehler statt eines Prüfergebnisses.
- **Schritte:** §5 auf die reale Struktur umstellen (Wallet-Status auf `users.balance`, Transaktionen auf `wallet_transactions`); dabei den pgTAP-Verweis ergänzen, der seit 10/L1–L7 der echte Nachweisort ist (`supabase/tests/rls_runtime_isolation.test.sql`).
- **Verifizierung:** `grep -n "public.wallets" docs/database/` liefert 0 Treffer.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05 (mit dokumentierter Scope-Erweiterung):** Die Planung ging von einer Stelle in `10` §5 aus — der Grep zeigte, dass **9 weitere Dateien** in `docs/database/` die fiktiven Tabellen (`wallets`/`transactions`/`bets`) bzw. die fiktive RPC `settle_standard_bet` sowie fiktive Migrationsdateinamen trugen. Alles korrigiert gegen die verifizierten Schema-Fakten (Realtabellen: `users` = Saldo, `wallet_transactions` = Ledger, `game_rounds`/`game_sessions`; realer RPC: `settle_game_bet` aus `045`; reale RPCs der rundenbasierten Spiele aus `014`/`058`; echte Indizes/Constraints u. a. `wallet_transactions_user_request_key` aus `007`, `idx_wallet_transactions_history_cursor` aus `061`): **10** (§5-Beispiel + §1-Tabelle), **03** (§1, §2-Überschrift, Mermaid, §6-Fehler-Mapping `'Insufficient balance'`, §8-K4-Zeile), **04** (§3-Policy-Inventar, §4-InitPlan-Beispiel, §5-Angriffsvektoren, §9-Studio-Check), **00** (Säulen-Tabelle, Architektur- + Sequenzdiagramm, Sicherheits-Callout, Komponenten-Matrix, Navigator, §4-Punkt 4 pgTAP-Status), **01** (Migrationshistorie-Tabelle auf reale Dateinamen + Stand 064), **07** (Mermaid-Index-Inventar auf verifizierte reale Namen, §4-„Audit-Ergebnisse" → belegte Tabelle vom 2026-09-05, §5-EXPLAIN, §6-Beispiel aus 061), **05**, **08**, **09**, **11** (Säulen-Matrix + Diagramm), **rollback-playbook** (fiktiver Dateiname 058). **Verifiziert:** `public.wallets` → 0 Treffer; `settle_standard_bet` → nur noch in Korrektur-Notizen; fiktive Migrationsdateinamen → 0 Treffer; alle verbleibenden `wallets`/`bets`-Nennungen sind ausdrückliche „existiert nicht"-Korrekturen.

### L3 — 7 weitere "Penetrationstest"-Formulierungen präzisieren

- **Ziel:** Die Überzeichnung "Penetrationstest gegen echte JWTs" auch an den restlichen Fundstellen auf die korrekte Beschreibung (statische Text-Verifikation + echter pgTAP-Laufzeittest) angleichen — gleiche Korrektur wie 10/L1, nur die restlichen Fundstellen.
- **Schritte:** 1. `grep -rn "Penetrationstest\|echte anon" docs/database worldmap xx_sop docs/archive` ausführen und Fundliste festhalten. 2. Jede Stelle mit dem etablierten Präzisierungsmuster aus 10/L1 korrigieren (Verweis auf `supabase/tests/rls_runtime_isolation.test.sql` einbauen). 3. Bei Fundstellen in `worldmap/` die Ampel/Status-Zeile der betreffenden Planungsdatei im selben Edit mitziehen.
- **Verifizierung:** Der Grep aus Schritt 1 liefert nur noch korrekte Formulierungen.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05:** Grep-Fundliste: 4 Treffer in lebender Doku (`docs/database/10` Zeilen 17/38/139, `docs/database/11` Zeile 122) + 3 in `worldmap/04_datenbank_migrationen.md` (Zeilen 16/28/69) + 1 bereits präzisierte Stelle (`docs/database/04` Zeile 86 — korrekte Formulierung, nur Zeitform aktualisiert: pgTAP-Laufzeittest „läuft seit 2026-09-05" statt „wird aufgebaut"). Alle korrigiert nach dem 10/L1-Muster („29/29 statische Text-Verifikationen + pgTAP-Laufzeitsuite mit echtem Rollen-/JWT-Kontext, `supabase/tests/`"). `xx_sop/` liefert 0 Treffer. **Bewusste Entscheidung:** `docs/archive/*` (05-RLS-Verteidigungslinie, 00_WORLDMAP_ARCHIVLOG, 05_ZUKUNFTSPLANUNG_ARCHIV) bleibt als historischer Stand unangetastet (Additiv-Regel — Archive dokumentieren den Ist-Stand zum damaligen Datum). **Verifiziert:** Grep über lebende Doku (docs/database, worldmap, xx_sop) liefert nur noch die präzisierten Formulierungen bzw. ausdrückliche Negations-Sätze („Das ist keine Laufzeit-Penetrationstest-Suite"). Zusätzlich im selben Zug: Fakt-Korrekturen in `worldmap/04` (Header-Zählung 63→64 Migrationen bis `064_enable_pgtap.sql`; Zeile Unterkategorie #7: „Kein pgTAP" → Fakt-Update pgTAP-Schicht aufgebaut, **Niveau-Wert Top 90 % bewusst unangetastet** — Re-Rating bleibt L7/Jan).

### L4 — Commit + Push der T_DATABASE-Artefakte (Jan-Freigabe = K4)

- **Ziel:** Die vollständig verifizierten, aber uncommitted liegenden Artefakte der 6 Pläne in `main` überführen — dadurch schließen sich **automatisch** drei offene CI-Nachweise: Säule 1 (migration-drift-check), Säule 9 (backup-drill erster Lauf), Säule 10 (pgTAP-Schritt in security-staging).
- **Schritte:** 1. LLM erstellt Commit-Plan (Conventional Commits, sinnvolle Gruppierung: Migrationen 063/064 + pgTAP-Suite / Typegen + Typsicherheits-Fixes / Workflows + Audit / Doku + Planungsdateien). 2. **Jan prüft Commit-Plan und gibt Commit+Push explizit frei** (`CLAUDE.md`: "Never commit unless I explicitly ask"; K4). 3. LLM führt nach Freigabe aus und beobachtet die 3 Workflow-Läufe (`gh run watch`, Muster wie in `worldmap/00_WORLDMAP_STATUS.md`).
- **Verifizierung:** 3 grüne CI-Läufe (migration-drift-check, backup-drill, security-staging inkl. pgTAP-Schritt) — erst danach werden die Ampeln in 01/L3, 05/L9 und 10/L8 auf 🟢 umgestellt.
- **Freigabe-Gate:** **Jan (K4, Commit+Push).** **Money-Pfad:** Nein. **Security-Review:** Nein (alle Artefakte sind einzeln bereits reviewed — 064 via migration-security-guard PASS, Code via code-reviewer + security-reviewer PASS).
- **Umsetzung 2026-09-05 (Jan-Freigabe im Chat: „Commit push" + FF-Push auf `main` + Nachjustage):**
  - **Commits auf `main`** (lokal = `origin/main`): `c000c42`, `9e6c1d2`, `4255244`, `28be2ac`, `6f82589` (5er-Plan: Migrationen 063/064 + pgTAP-Suite, Typegen+Typsicherheits-Fixes, Workflows+Audit, Doku+Planungsdateien) sowie Nachjustage `164cc2e` (Lock-Sync, npm-ci-Fehler), `1a8fed2` (workflow_dispatch-Trigger für schema-drift-check), `38f5b76` (Restore-Drill + `src/lib/backup/` Recovery-Lib — im ersten Commit-Plan vergessen, verursachte den ersten roten backup-drill-Lauf) und `bab3ab1` (ER-Diagramm-Drift-Check, 02-L5).
  - **3 grüne CI-Nachweise (alle Run-IDs verifiziert):**
    1. **Security staging regression** inkl. pgTAP-Schritt — Run `33987257048` ✅ (Migration 064 angewendet, `npx supabase test db` grün) → 10/L8 🟢.
    2. **Schema Drift Check** — Run `33988391152` ✅ (`database.types.ts` synchron mit der Migrationskette).
    3. **Backup Restore Drill** — Run `33988968506` ✅ (erster Lauf `33988298709` ❌ wegen fehlender Drill-Skripte, siehe oben) → 05/L9 🟢.
  - **Korrektur am Plan selbst:** Der ursprünglich L4 zugeschriebene CI-Nachweis „migration-drift-check" (01/L3) ist **secret-abhängig** (`SUPABASE_ACCESS_TOKEN`) und gehört korrekt zu **L5** — deshalb 01/L3 in dieser Umsetzung nicht als geschlossen markiert. Dafür lieferte L4 zusätzlich den Schema-Drift-Check-Nachweis (statische Typegen-Synchronität), der im Original nicht verankert war.

### L5 — GitHub-Secret `SUPABASE_ACCESS_TOKEN` + erste CI-Läufe

- **Ziel:** Die beiden Secret-abhängigen Workflows (Säule 1 CI-Nachweis, Säule 7 Quartals-Cron) aktivieren.
- **Schritte:** 1. **Jan:** Secret `SUPABASE_ACCESS_TOKEN` im Repo-Settings hinterlegen (Token ist das bestehende, lokal bereits genutzte Credential — kein neues Berechtigungsmodell, siehe `11` L7). 2. LLM löst per `gh workflow run` die Dispatches aus: `query-performance-audit.yml`, `migration-drift-check.yml` (falls L4 noch nicht dessen Lauf erzeugt hat). 3. LLM beobachtet Läufe (`gh run watch`), prüft dass die Audit-Datei im Run-View als Summary erscheint.
- **Verifizierung:** Beide Dispatch-Läufe grün; danach Ampeln 11/L7 → 🟢 (und 01/L3, falls über L4 nicht bereits geschlossen). ✅ **2026-09-05: erledigt.** Umsetzung: (1) Jan hat granulare Access-Tokens erstellt und iteriert (v1→v2→v3; korrekte Subkategorie für Projekt-Metadaten ist „Project Settings") und das Repo-Secret `SUPABASE_ACCESS_TOKEN` auf v3 aktualisiert (v1 noch revoken, v2 bereits revoket). (2) Beide Workflows schlugen bei `supabase link` fehl — offener CLI-Bug [supabase/cli#6392](https://github.com/supabase/cli/issues/6392) (granulare Tokens werden von `link` nicht akzeptiert; identisches Token per direktem Management-API-Call erfolgreich; der #3705-Workaround `SUPABASE_PROJECT_REF` als Env-Var fixte es nicht, Runs 33991590359 + 33991607280 rot). (3) **Option C umgesetzt** (`e27aec1`): Beide Workflows verzichten auf die CLI — Drift-Check vergleicht lokal vs. `GET /v1/projects/{ref}/database/migrations`, der Audit läuft über `POST /v1/projects/{ref}/database/query/read-only` (Skript-Dual-Modus: API in CI, CLI lokal). (4) Nachjustage `1c9dcaf`: `pg_stat_statements` liegt im Extension-Schema — dynamische Schemalookup via `pg_extension`. **Ergebnis: Migration Drift Check Run 33992692301 ✅ · Query performance audit Run 33993162288 ✅.** Ampeln 01/L3 und 11/L7 → 🟢.
- **Freigabe-Gate:** **Jan (Secret-Hinterlegung, einmalig).** **Money-Pfad:** Nein. **Security-Review:** Nein.

### L6 — Backup L10–L12 (Jan-Anteil, LLM begleitet)

- **Ziel:** Die reale Cloud-Anbindung der Backup-Infrastruktur — der letzte Baustein der einzigen Säule mit irreversiblem Datenverlust-Szenario.
- **Schritte:** 1. LLM liefert Jan eine Schritt-für-Schritt-Anleitung auf Basis der in `05` L10–L12 spezifizierten Anforderungen (welche Credentials, welche KMS-/Bucket-Konfiguration, welcher ENV-Key). 2. **Jan:** konfiguriert Credentials/Bucket in Supabase + S3-kompatiblem Ziel. 3. LLM verifiziert Konfiguration lokal (Dry-Run des Backup-Runners, ohne Prod-Rotation). 4. **Jan + LLM gemeinsam:** erster echter Restore-Drill gegen die reale Backup-Kopie, Ergebnis in `05` Ampel dokumentiert.
- **Verifizierung:** Erster Drill abgeschlossen; `05` L10–L12 Ampel 🟢; `00_DATABASE_VERBESSERUNG.md` Fußnote ³ aktualisiert.
- **Anleitung für Jan (vorbereitet 2026-09-05, Ausfüllen ≈ 20–30 Min):**
  1. **Anbieter wählen** — Empfehlung (beide S3-API-kompatibel, kostenlos einsteigbar, passend zu `createSignedS3PutRequest`): Cloudflare R2 oder Backblaze B2. Konto anlegen, Zahlungsmittel hinterlegen.
  2. **Bucket anlegen** — Name z. B. `casino-recovery`, Region beliebig (notieren), **keine öffentliche Zugänglichkeit**.
  3. **Lifecycle-Regel einfügen** (durchsetzt die Retention serverseitig — der Runner bekommt bewusst **kein** Delete-Recht): 14 täglich / 8 wöchentlich / 12 monatlich, im Provider-Konfigurator auf den Präfix `casino-recovery/` beschränken. R2: „Object lifecycle rules" mit Filter `casino-recovery/` (z. B. Delete nach 90 Tagen für Tages-/Wochenkandidaten, nach 1 Jahr für Monatskandidaten — die exakte Ausformulierung je nach Provider-Raster; wichtig ist: nichts bleibt unbegrenzt, nichts wird vom Code gelöscht).
  4. **API-Token/Keys erzeugen** — Rechten nur auf den Bucket/Präfix: Read+Write (Upload/Download/Listing), **kein Delete/Owner**.
  5. **ENV in `.env.local` eintragen** (nie committen; Vorlage mit Platzhaltern steht in `.env.example:79-90`):
     `BACKUP_ENCRYPTION_KEY_BASE64` (32-Byte-Zufallskey, base64 — selbst generieren, z. B. `openssl rand -base64 32`), `BACKUP_S3_ENDPOINT` (R2: `https://<accountid>.r2.cloudflarestorage.com`), `BACKUP_S3_BUCKET`, `BACKUP_S3_REGION`, `BACKUP_S3_ACCESS_KEY_ID`, `BACKUP_S3_SECRET_ACCESS_KEY`, optional `BACKUP_S3_PREFIX=casino-recovery`.
  6. **Melden, wenn 1–5 stehen** → dann LLM: erster echter Offsite-Lauf (`npm run backup:run`) + Restore gegen die echten Artefakte (L11, nur nach deiner expliziten „jetzt echten Lauf"-Freigabe — echte Produktdaten verlassen erstmals das Projekt, Security-Review Pflicht).
- **Freigabe-Gate:** **Jan (Credentials + Drill-Auslösung).** **Money-Pfad:** Nein (Backup-Infrastruktur, aber: bewusste Einordnung — berührt keine Wallet-Logik). **Security-Review:** Nein (Zugriff nur auf Backups bestehender Daten; Secret-Handling folgt `xx_sop/09_security_wallet_invariants.md`).

### L7 — (Optional) Niveau-Re-Rating als Entscheidungsvorlage

- **Ziel:** Die in `00_DATABASE_VERBESSERUNG.md` offen gelassene Frage — Niveau-Werte und Headline nach der Execution neu bewerten — als **Vorschlag** vorbereiten, Entscheidung bleibt Jan.
- **Schritte:** 1. Pro Säule eine Begründung, warum sich das Niveau gehoben hat (Fundstänfe aus den Fußnoten in `00` Abschnitt 3), mit Vorschlagswert. 2. Vorschlag als eigener Abschnitt in `worldmap/04_datenbank_migrationen.md`-Review-Form oder hier als Anhang. 3. **Jan entscheidet** über neue Werte + Headline-Frage (Top 15 % vs. gewichteter Schnitt).
- **Verifizierung:** Entscheidung dokumentiert (oder bewusst vertagt mit Datum). **Vorlage fertig (2026-09-05):** siehe Anhang A unten — Vorschlagswerte pro Säule, Auswirkung auf gewichteten Schnitt + Headline-Frage.
- **Freigabe-Gate:** **Jan (Endentscheidung).** **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 4 — Definition of Done

1. `supabase:types` npm-Script ist kanonisch (`--local`) und erzeugt byte-identische Baseline (L1).
2. Keine Doku-Stelle verweist mehr auf `public.wallets` oder überzeichnet den RLS-Test (L2/L3).
3. Drei CI-Nachweise sind durch echte, grüne Läufe belegt — nicht nur durch gebaute Workflows (L4/L5).
4. Backup-Infrastruktur ist real angebunden und einmal gedrillt (L6).
5. (Optional) Niveau-/Headline-Entscheidung ist dokumentiert oder bewusst vertagt (L7).
6. Nach Abschluss: Ampeln in `00_DATABASE_VERBESSERUNG.md` Fußnoten ¹/³/⁴/⁵ aktualisieren; Datei ggf. gemäß SOP §5 archivieren oder nach `docs/` verschieben.

---

## 5 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope abgegrenzt: nur Restpunkte der Execution vom 2026-09-05; keine neuen Features, kein Re-Rating-Entscheid in dieser Datei (L7 nur Vorlage).
- [x] Abhängigkeiten benannt: L1–L3 unabhängig voneinander, vor L4 (damit der Commit alle Fixes enthält); L4 vor L5 vor den Ampel-Umstellungen; L6 unabhängig; L7 optional nach L4.
- [x] Reihenfolge folgt Zuständigkeit: LLM-Punkte zuerst, damit Jan beim L4-Gate einen vollständigen, korrigierten Arbeitsstand freigibt.
- [x] Keine neue Datenklasse, API-Grenze oder Schreiboperation — alle Punkte sind Doku-, CI-Konfiguration oder Jan-Konfiguration; Money-Pfad überall Nein.
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet und verlinken auf ihre Quellen (Abschnitt 2).
- [x] Keine Referenz doppelt gepflegt: Methodik bleibt in den Ursprungs-Plänen (05/06/10/11), hier nur Verweise.
- [x] Von einer neuen LLM-Konversation allein verstehbar: Abschnitt 0 + 2 liefern Herkunft und Kontext jedes Punktes ohne Re-Recherche.

---

## 6 — Verwandte Artefakte

| Bedarf                               | Datei                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Execution-Herkunft (alle Fundstänfe) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md) Abschnitt 3 Fußnoten                     |
| Backup-Jan-Anteil (L10–L12)          | [`05_database_backup_and_recovery.md`](./05_database_backup_and_recovery.md)                            |
| Typegen-Kanonik                      | [`06_database_typsicherheit.md`](./06_database_typsicherheit.md)                                        |
| RLS-Präzisierungsmuster (L3)         | [`10_database_testschicht_pgtap.md`](./10_database_testschicht_pgtap.md) L1-Umsetzung                   |
| Secret-/CI-Kontext (L5)              | [`11_database_query_performance_indexing.md`](./11_database_query_performance_indexing.md) L7-Umsetzung |
| K-Matrix & Freigaberegeln            | `CLAUDE.md` (K4-Block)                                                                                  |
| Security-Invarianten                 | [`xx_sop/09_security_wallet_invariants.md`](../xx_sop/09_security_wallet_invariants.md)                 |

---

## 7 — Anhang A: Niveau-Re-Rating-Vorschlag (L7, Entscheidungsvorlage — Entscheidung bleibt Jan)

> **Charakter:** Vorschlag, keine vollzogene Änderung. Die Werte sind an `worldmap/04_datenbank_migrationen.md` gekoppelt; eine Änderung gehört in den kanonischen worldmap-Review (Jan-Entscheidung). Grundlage: die verifizierten Fundstänfe der 6 executed Säulen (Fußnoten ¹–⁶ in [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md)).

### 7.1 Vorschlagswerte pro executed Säule

| Säule                  |   Alt    |            Vorschlag             | Begründung (verifiziert 2026-09-05)                                                                                                                                                                                                                                                  |
| :--------------------- | :------: | :------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Migrations-Disziplin | Top 15 % |           **Top 10 %**           | CI-Backstop für Kollisions-Check + wöchentlicher Drift-Check (Run 33992692301 grün) + Rollback-Playbook + zentraler Guard-Log; Kollisions-Freiheit 001–064 verifiziert. Nicht unter Top 10 %: Husky-Backstop bleibt umgehbar, Drift-Check nur wöchentlich                            |
| 2 Schema-Design        | Top 20 % |           **Top 15 %**           | Committete `database.types.ts` hatten Migration 063 gefehlt (realer Fund) — Baseline jetzt deterministisch via `--local` + ER-Diagramm-Drift-Check in CI                                                                                                                             |
| 6 Typsicherheit        | Top 20 % |           **Top 15 %**           | Typegen kanonisch `--local` (byte-identische Baseline), Dual-Signoff etabliert, 2 MEDIUM-Fixes real umgesetzt; npm-Script-Nachjustage noch offen                                                                                                                                     |
| 7 Query-Performance    | Top 70 % |           **Top 40 %**           | Vom "ungenmessenen" Zustand zu: datierter Audit-Lauf (kein Fund), EXPLAIN-Tiefenprüfung aller 3 Geld-RPCs, CI-Cron quartalsweise aktiv (Run 33993162288). Nicht weiter: nur 1 Messpunkt, kein Lasttest                                                                               |
| 9 Disaster Recovery    | Top 88 % | **Top 50 %** (vorläufig bis L11) | Vollständige lokale/CI-Infrastruktur real (Backup-Runner, Restore-Drill im ephemeren Container, Re-Encryption, grüner CI-Lauf 33988968506). **Aber:** Es existiert noch kein echtes Offsite-Backup — der definitive Wert (Vorschlag: Top 25 %) ist erst nach L10–L11 ehrlich setzbar |
| 10 DB-Test-Schicht     | Top 90 % |           **Top 60 %**           | pgTAP real aktiv (Migration 064): 27 Tests grün inkl. echtem RLS-Laufzeittest mit JWT-Kontext und Negativ-Beweis, CI-gebunden (Run 33987257048). Nicht weiter: Coverage-Niveau (Säule 6, Gewicht) moderat, nur eine Testsuite                                                        |

Nicht neu bewertet (keine Execution): Säulen 3, 4, 5, 8 — keine Planungsdatei-Execution, keine neuen Belege.

### 7.2 Auswirkung auf die zwei offenen Kennzahlen

- **Gewichteter Schnitt** (Gewichte aus `00` Abschnitt 3): Top ~35 % → **Top ~29 %** (konservativ, Säule 9 bleibt Top 88 %) bzw. **Top ~25 %** (nach L11 mit Säule 9 = Top 50 %).
- **Headline-Frage (offen seit 2026-08-29 in `worldmap/04`):** Empfehlung bleibt, **Top 15 % als Headline zu behalten** (Bestwert der geldkritischen Teilfläche) und den gewichteten Schnitt (Top ~25–29 %) als zweite Kennzahl daneben zu führen. Ein Wechsel der Headline auf den Schnitt würde die Zahl optisch verschlechtern, obwohl die geldkritischen Säulen (RPCs Top 10 %, RLS Top 15 %) unangetastet Weltklasse sind — die Execution hat vor allem die unteren Säulen gehoben, nicht die Spitze.
- **Jan-Entscheidung nötig zu:** (a) Vorschlagswerte annehmen/ändern, (b) Headline behalten oder auf Schnitt wechseln, (c) Eintragung in `worldmap/04_datenbank_migrationen.md` (danach Anpassung der Niveau-Spalte in `00` Abschnitt 3 im selben Zyklus).
