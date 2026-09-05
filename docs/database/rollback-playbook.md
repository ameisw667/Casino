# Rollback-Playbook: Kompensierende Migrationen statt Down-Migrationen

> **Status:** Verbindliches Vorgehen · **Stand:** 2026-09-05 · **Owner:** LLM (Pflege), Jan (K4-Freigabe bei Remote-Push)
> **Zweck:** Standardisiertes, begründetes Vorgehen für den Fehlerfall einer bereits angewendeten Migration (Subkategorie #5 in [`T_DATABASE/01_database_migrations_disziplin.md`](../../T_DATABASE/01_database_migrations_disziplin.md)). Postgres/Supabase unterstützen **keine** sicheren automatischen Down-Migrationen — dieses Playbook macht das bewusste Gegenmodell (kompensierende Migration) reproduzierbar.

---

## 1 — Warum kein automatisiertes Down-Tooling (bewusste Entscheidung)

Automatisches `down.sql`-Tooling wird **nicht** gebaut, weil:

1. **Datenverlustrisiko überwiegt den Nutzen:** Ein generisches Skript kann DDL mechanisch zurückspielen (`DROP COLUMN`, `DROP TABLE`), aber nicht wissen, welche Produktdaten inzwischen in die Struktur geschrieben wurden. Ein automatischer Rückbau einer datentragenden Migration vernichtet diese Daten unwiederbringlich — genau der Fehlerfall, den ein Rollback eigentlich verhindern soll.
2. **Postgres-DDL-Historie ist nicht reversibel:** Es gibt kein Postgres-natives "undo" für DDL; jede "Rückwärtsmigration" ist von Hand formulierte neue DDL. Ein Tool would nur die Illusion von Sicherheit erzeugen.
3. **Bewährte Alternative existiert:** Der Branchenstandard (Expand & Contract, `xx_sop/18_postgres_patterns_migrations.md`) löst denselben Fall kontrolliert über neue, vorwärtsgerichtete Migrationen.

---

## 2 — Entscheidungsklassifizierung: Welcher Fehlerfall liegt vor?

Vor jedem Rollback zuerst klassifizieren — die drei Fälle brauchen sehr unterschiedliche Mittel:

| Fall | Erkennung | Richtiges Mittel | Freigabe |
| :--- | :--- | :--- | :---: |
| **A: Migration lokal angelegt, noch nicht remote gepusht** | Datei existiert nur in `supabase/migrations/`, fehlt in `npm run supabase:migrations` | Datei lokal korrigieren **oder löschen** — kein Rollback nötig, lokale Migration ist nur eine Datei | K3 |
| **B: Remote angewendet, reines Schema-Problem (keine Produktdaten betroffen)** | Migration ist remote in der Historie, aber die Struktur ist z. B. falsch benannt, fehlt eine Berechtigung, ein Index ist falsch | **Kompensierende Migration** vorwärts schreiben (siehe §3) | K4 (Remote-Push) |
| **C: Remote angewendet und Produktdaten haben die fehlerhafte Struktur bereits befüllt** | Zeilen mit Daten existieren in der betroffenen Tabelle/Spalte | Kompensierende Migration **mit expliziter Datenmigration** (SELECT-basiertes Verschieben/Backfill in korrekte Struktur, nie blindes `DROP`); bei Zweifel zunächst Snapshot/Export sichern | K4, bei Datenverlust-Risiko K5 |
| **D: Katastrophaler Schemaschaden / kein SQL-Fix realistisch** | Szenario B/C nicht reparabel ohne Risiko | **Isolierter Restore** aus Backup — siehe [`09_backup_disaster_recovery.md`](./09_backup_disaster_recovery.md) | K5 |

---

## 3 — Rezept für eine kompensierende Migration (Fall B/C)

### 3.1 Schritt-für-Schritt

1. **Nicht die fehlgeschlagene Migration anfassen.** Bereits angewendete Migrationen sind unveränderlich — jede Korrektur ist eine **neue** Datei mit der nächsten freien Nummer (frisch prüfen: `ls supabase/migrations | sort | tail -1`).
2. **Umfang präzise dokumentieren:** Was genau ist der Fehler? Welche Objekte/Spalten/Daten sind betroffen? Erst klären, dann schreiben.
3. **Kompensierende Migration erstellen:** vorzugsweise per Schema-Diff gegen den lokalen Stack (`npx supabase db diff --linked -f revert_<feature>`) und danach von Hand prüfen/verschärfen — Diff-Output ist Ausgangspunkt, kein Selbstläufer.
4. **Lokal verifizieren:** `npm run supabase:reset` (K5-klasse lokal, aber isoliert) spielt die komplette Kette inkl. Kompensation durch; danach `npm run supabase:types` und Tests.
5. **`@migration-security-guard`** als Pflicht-Review ausführen; Ergebnis in [`migration-guard-log.md`](./migration-guard-log.md) eintragen.
6. **Remote-Push nur mit Jan-Freigabe (K4)** gemäß `xx_sop/05_database_supabase.md`.

### 3.2 Pflicht-Kommentarkopf der Kompensations-Migration

Jede Kompensationsmigration beginnt mit einem Kommentarblock nach diesem Muster (Präzedenz: `supabase/migrations/059_harden_legacy_definer_search_path.sql`, das den früheren Legacy-Drift dokumentiert):

```sql
-- Migration NNN: Compensating migration for <Fehler in Migration MMM>.
-- WHY: <1–2 Sätze: was genau war falsch, welche Gefahr bestand>
-- COMPENSATES: <exakte Objekte: Tabelle/Spalte/Funktion, die hier korrigiert/entfernt werden>
-- DATA IMPACT: <"none, schema only" ODER "backfills N rows from X to Y" — bei Datenbewegung Pflichtangabe>
-- REVERSIBILITY: <"fully reversible by re-applying MMM" ODER "irreversible drop — see backup 09">
```

### 3.3 Wann Kompensation NICHT ausreicht

- **Bereits geschriebene Produktdaten, die nur noch verlustbehaftet korrigierbar sind:** erst Datenretter (neue Zieltabelle + SELECT-basierter Backfill, Prüfen der Row-Counts), dann Contract-Schritt. Blindes `DROP COLUMN x` ist verboten, solange offen ist, ob `x` gelesen wurde.
- **Ausführungsreihenfolge ist gefährdet:** Wenn eine spätere Migration bereits vom fehlerhaften Zustand abhängt, muss die Kompensation auch diese Abhängigkeiten korrigieren — die Kette vorwärts prüfen, nicht nur die betroffene Datei.

---

## 4 — Reiner Tracking-Mismatch (kein Schema-Problem)

Wenn die Datenbank korrekt ist, aber die Migration-Historie des CLI nicht (z. B. manuell per SQL-Editor angewendete Änderung), ist das Mittel **`supabase migration repair`**, keine Schema-Migration:

```bash
# Remote-Marker als angewendet/reverted markieren (verändert KEINE Daten, nur Buchhaltung)
npx supabase migration repair <version> --status applied
npx supabase migration repair <version> --status reverted
```

---

## 5 — Referenzfälle aus dieser Historie

| Fall | Muster | Referenz |
| :--- | :--- | :--- |
| Drift-Fix durch harte Quarantäne statt Rückbau | Legacy-RPCs wurden nicht "zurückgebaut", sondern per Kompensationsmigration entzogen (REVOKE + `search_path`) | [`supabase/migrations/059_harden_legacy_definer_search_path.sql`](../../supabase/migrations/059_harden_legacy_definer_search_path.sql) |
| Konsolidierung ohne `CASCADE` | Alt-Tabellen entfernt, ohne implizite Objektkette zu zerstören | [`supabase/migrations/057_remove_legacy_guild_schema.sql`](../../supabase/migrations/057_remove_legacy_guild_schema.sql) |
| Reproduzierbarer Drift-Stand als Migration | Remote-Drift wurde explizit als 058 dokumentiert statt ad hoc repariert | [`supabase/migrations/058_reconcile_remote_schema_drift.sql`](../../supabase/migrations/058_reconcile_remote_schema_drift.sql) |

---

## 6 — Verwandte Artefakte

| Bedarf | Datei |
| :--- | :--- |
| Migrations-SOP (Push, Guard, Freigaben) | [`xx_sop/05_database_supabase.md`](../../xx_sop/05_database_supabase.md) |
| Expand & Contract / Zero-Downtime-Patterns | [`xx_sop/18_postgres_patterns_migrations.md`](../../xx_sop/18_postgres_patterns_migrations.md) |
| Kompensations-Vorlagen-SOP (§2.1, Guard-Pflicht) | [`xx_sop/05_database_supabase.md`](../../xx_sop/05_database_supabase.md) §2 |
| Katastrophen-Fall (Restore) | [`09_backup_disaster_recovery.md`](./09_backup_disaster_recovery.md) |
| Guard-Ergebnis-Log (Pflicht pro Migration) | [`migration-guard-log.md`](./migration-guard-log.md) |