# Migration-Security-Guard-Log

> **Status:** Lebendes Log · **Stand:** 2026-09-05 · **Owner:** LLM (Pflege bei jeder neuen Migration)
> **Zweck:** Zentrale, fortlaufend gepflegte Nachweisstelle für `@migration-security-guard`-Ergebnisse (Subkategorie #6 in [`T_DATABASE/01_database_migrations_disziplin.md`](../../T_DATABASE/01_database_migrations_disziplin.md)). Vorher waren die Nachweise verstreut in einzelnen Archiv-Plänen.
> **Pflegeregel:** Bei jeder Migration ab `064` wird der Guard-Ergebnis-Eintrag **im selben Schritt** wie die Migration ergänzt — ein Migration-PR ohne Log-Eintrag ist unvollständig. Ergebniswerte folgen `xx_sop/05_database_supabase.md`: `PASS`, `FINDING` oder `BLOCKED`.

## Log (rückwirkend ab 060 befüllt aus Archiv-Plänen)

| Migration | Datum | Guard-Ergebnis | Beleg / Verweis |
| :--- | :--- | :---: | :--- |
| `060_pg_cron_retry_failure_handling.sql` | 2026-09-03 | ⚠️ nicht separat dokumentiert | Guard-Pflicht war laut Standarde-Regel erfüllt, ein expliziter Einzel-PASS wurde aber nicht niedergeschrieben (`worldmap/07_background_jobs_scheduling.md` weist stattdessen „zwei unabhängige SQL-Reviews ohne P1/P2" aus). Keine rückwirkende Erfindung eines Ergebnisses. |
| `061_wallet_transactions_history_cursor_index.sql` | 2026-09-04 | 🟢 PASS | `docs/archive/09_api_history_keyset_pagination.md` (Ausführungsnachweis): Guard v0.3.0 PASS, nach Signaturkorrektur `p_user_id TEXT` erneuter PASS. |
| `062_bot_signal_types.sql` | 2026-09-03 | 🟢 PASS | `docs/archive/06_1_bot_automation_detection_plan.md` L0: „Guard PASS, 1388 Tests grün". |
| `063_user_wellbeing_limits.sql` | 2026-09-04 | 🟢 PASS | `docs/archive/06_2_responsible_gambling_controls_plan.md` L0: „Guard PASS, authenticated role fail-closed verifiziert". |

## Eintragsvorlage für künftige Migrationen

```markdown
| `<NNN_migrationsname>.sql` | YYYY-MM-DD | 🟢 PASS / 🟡 FINDING / 🔴 BLOCKED | <kurzer Beleg: Plan-Datei oder direkte Angabe der Findings + Resolution> |
```

## Abgrenzung zur Agent-Kalibrierung

Die Eval-Runs zur Kalibrierung des Guards selbst liegen getrennt in `.claude/agent-evals/06_migration_security_guard/runs/` — sie messen die Agent-Qualität an Fixtures, nicht den Produktiveinsatz. Dieses Log hier dokumentiert ausschließlich den Produktiveinsatz pro Migration.

## Verwandte Artefakte

| Bedarf | Datei |
| :--- | :--- |
| Guard-Pflicht & Ergebnisbehandlung | [`xx_sop/05_database_supabase.md`](../../xx_sop/05_database_supabase.md) |
| Guard-Agent-Definition | [`.claude/agents/06_migration_security_guard.md`](../../.claude/agents/06_migration_security_guard.md) |
| Migrations-Doku (Säule 1) | [`01_migrations_und_versionierung.md`](./01_migrations_und_versionierung.md) |
| Planungskontext (Subkategorie #6) | [`T_DATABASE/01_database_migrations_disziplin.md`](../../T_DATABASE/01_database_migrations_disziplin.md) |