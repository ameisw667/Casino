# 05 — Backup & Recovery — Casino Code Explorer Kontext (Archiviert)

> **Status:** Archiviert · **Stand:** 2026-08-30 (Archiviert am 2026-09-02) · **Owner:** LLM  
> **Kanonischer Nachfolger:** [`docs/database/09_backup_disaster_recovery.md`](../database/09_backup_disaster_recovery.md)  
> **Zweck:** Ursprünglicher quellengebundener Einstieg vor dem vollständigen Ausbau von Säule 9 (`docs/database/09_backup_disaster_recovery.md`).

> [!WARNING] **Überholt seit 2026-09-05:** Die Aussagen „Es gibt **keinen** Backup- oder Restore-Entry-Point im aktiven Casino-Code" (Abschnitt 1) und „Kein aktiver Treffer für `pg_dump`, `supabase db dump`, Backup- oder Restore-Automatisierung" stammen vom Explorer-Lauf 2026-08-30 und sind **nicht mehr wahr**: Inzwischen existiert eine vollständige Backup-Pipeline (`npm run backup:run` → `scripts/backup-supabase.ts` → `src/lib/backup/**` mit Dump, AES-256-GCM-Verschlüsselung, SigV4-Upload) mit 9 Tests. Der aktuelle Stand ist ausschließlich in [`T_DATABASE/05_database_backup_and_recovery.md`](../../T_DATABASE/05_database_backup_and_recovery.md) (Abschnitt 2: verifizierter Code-Ist-Stand) und der kanonischen Doku dokumentiert — dieser Archivtext beschreibt nur noch den historischen Zustand.

## 1 — Explorer-Ergebnis

### Gelesener Pflichtkontext

- `xx_docs/01_supabase_context.md`: Projektgrenze, drei Supabase-Clients und Datenbankinventar.
- `xx_sop/05_database_supabase.md`: Migrations-, Rollout- und Rollback-Grenzen.
- `xx_sop/09_security_wallet_invariants.md`: Geldpfad bleibt serverautoritär und muss nach jeder Wiederherstellung erneut geprüft werden.
- `worldmap/04_datenbank_migrationen.md`: Messquelle für #8 und #10.

### Entry Points und Ausführungsweg

Es gibt **keinen** Backup- oder Restore-Entry-Point im aktiven Casino-Code. Der relevante Datenpfad endet an Supabase:

1. `src/utils/supabase/client.ts:15` — Browser nutzt `createBrowserClient` mit Anon-Key und RLS.
2. `src/utils/supabase/server.ts:7` — Server-Routen nutzen Cookie-gebundenen `createServerClient`.
3. `src/utils/supabase/admin.ts:1,19` — Admin-/Cron-Pfade nutzen einen server-only Service-Role-Client.
4. `supabase/migrations/**` und `supabase/config.toml:59` — Schema ist versioniert und lokal reproduzierbar, aber Migrationen sind **kein** Backup von Produktdaten.
5. `.github/workflows/security-staging.yml:47-73` — CI erzeugt einen ephemeren lokalen Stack und löscht ihn wieder. Das verifiziert Migrationen, sichert aber keine Remote-Produktdaten.

### Nicht vorhandene Pfade (gezielt gesucht)

- Kein aktiver Treffer für `pg_dump`, `supabase db dump`, Backup- oder Restore-Automatisierung in `src/`, `scripts/`, `.github/`, `supabase/` oder `package.json`.
- Kein aktiver Treffer für `supabase.storage` oder `.storage.from(...)`; Storage-Objekte sind daher derzeit nicht Teil des Casino-Recovery-Scope. Bei einer späteren Storage-Einführung muss die Bewertung neu geöffnet werden.

## 2 — Architektur- und Datenabgrenzung

| Bereich                                      | Relevanz für Recovery                                                         | Vorhandener Schutz                                       | Nicht als Backup missverstehen                                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Produktdaten in Postgres                     | Hoch: Wallets, Transaktionen, Bets, Spielrunden, Nutzer- und Sicherheitsdaten | RLS, atomare RPCs, Migrationen                           | Diese Mechanismen können verlorene Daten nicht wiederherstellen.                                          |
| Schema und Datenbankcode                     | Hoch                                                                          | Versionierte Migrationen 001–059, lokaler Supabase-Stack | Rekonstruiert Struktur, nicht Produktdatenstand.                                                          |
| Auth-, Realtime- und Dashboard-Konfiguration | Hoch                                                                          | Teilweise als Code-/ENV-Konfiguration vorhanden          | Laut Supabase gehören Konfigurationen und API-Keys nicht vollständig zu einem DB-Restore.                 |
| Secrets                                      | Hoch                                                                          | Server-only, nicht im Repository                         | Nie in Dumps oder Planungsdateien speichern; Wiederherstellung folgt Secret-Rotation, nicht Datenimport.  |
| Supabase Storage                             | Aktuell nicht genutzt                                                         | —                                                        | Bei künftiger Nutzung separat exportieren: DB-Backups enthalten nur Storage-Metadaten, nicht die Objekte. |

## 3 — Externe Anbietergrenzen (Stand 2026-08-30)

- Das Projekt nutzt den Free-Tier. Supabase führt dort laut Preis- und Backup-Dokumentation **keine automatischen Backups und kein PITR** mit. Ein wiederholbarer, eigener Export ist deshalb kein Nice-to-have, sondern die Baseline.
- PITR ist ein kostenpflichtiges Add-on für bezahlte Projekte und ersetzt tägliche Backups mit feineren Wiederherstellungspunkten. Es ist für den aktuellen Tarif nicht als implizite Absicherung verfügbar.
- Bei einem Restore müssen nicht ausschließlich Datenbanktabellen betrachtet werden: Auth-Einstellungen, API-Keys, Realtime- und Extension-Konfigurationen sind als Wiederherstellungsinventar separat zu behandeln.

Quellen: [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups) · [Supabase Pricing](https://supabase.com/pricing) · [Restore Dashboard Backup](https://supabase.com/docs/guides/platform/migrating-within-supabase/dashboard-restore).

## 4 — Verbindliche Grenzen für Folgearbeit

- Kein Export, Restore, Upgrade, Bucket oder externes Ziel ohne explizite Jan-Freigabe: Das sind externe oder potenziell destruktive Aktionen.
- Ein Restore läuft zuerst **isoliert** gegen eine frische lokale oder neu angelegte Zielinstanz; niemals als Test gegen die Produktivdatenbank.
- Eine erfolgreiche SQL-Wiederherstellung genügt nicht. Danach prüfen: Migrationsstand, Tabellen-/Zeilenzählungen, Wallet-Ledger-Invarianten, RPC-Ausführungsrechte und RLS-Negativtests.
- Keine Dumps, Passwörter, Tokens oder personenbezogenen Nutzdaten in Git, CI-Logs oder Markdown ablegen.

## 5 — Nicht erfasst / offene Lücken

- Kein RPO (maximal tolerierbarer Datenverlust) und kein RTO (maximale Wiederherstellungszeit) festgelegt.
- Kein geplanter, verschlüsselter Offsite-Export mit Retention und Integritätsprüfung.
- Kein Restore-Runbook, kein Drill und keine gemessene Wiederherstellungszeit.
- Der read-only Backup-Status `pitr_enabled: false`, `backups: []` stammt vom 2026-08-28; die Tarifgrenze wurde am 2026-08-30 gegen die aktuelle Anbieter-Dokumentation abgeglichen.

## 6 — Nächster Einstieg

Der vollständige Bewertungs- und Maßnahmenplan ist [`T_DATABASE/05_database_backup_and_recovery.md`](../../T_DATABASE/05_database_backup_and_recovery.md). Der kanonische Doku-Standard ist [`docs/database/09_backup_disaster_recovery.md`](../database/09_backup_disaster_recovery.md).
