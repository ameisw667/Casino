# 12 — Execution-Handoff-Prompt: Datenbank-Härtung (Säulen 7, 8, 9, 10)

> **Kanonisches Template:** [`xx_sop/23_standard_handoff_prompt_template.md`](file:///v:/VibeCoding/Casino/xx_sop/23_standard_handoff_prompt_template.md)
> **Status:** Historischer Referenz-Prompt (Execution abgeschlossen / Meilensteine verifiziert)

### Aufgabenspezifische Parameter

- **Domäne:** Database (`workspace/domains/database/T_DATABASE/`)
- **Ziel-Pläne:** [`05_database_backup_and_recovery.md`](file:///v:/VibeCoding/Casino/docs/archive/database/T_DATABASE/05_database_backup_and_recovery.md), [`08_database_connection_pooling.md`](file:///v:/VibeCoding/Casino/docs/archive/database/T_DATABASE/08_database_connection_pooling.md), [`10_database_testschicht_pgtap.md`](file:///v:/VibeCoding/Casino/docs/archive/database/T_DATABASE/10_database_testschicht_pgtap.md), [`11_database_query_performance_indexing.md`](file:///v:/VibeCoding/Casino/docs/archive/database/T_DATABASE/11_database_query_performance_indexing.md)
- **Übergeordnete Übersicht:** [`00_DATABASE_VERBESSERUNG.md`](file:///v:/VibeCoding/Casino/docs/archive/database/T_DATABASE/00_DATABASE_VERBESSERUNG.md)
- **Sicherheits-Invariante:** Keine direkten `EXPLAIN ANALYZE`-Aufrufe auf mutierende Geld-RPCs (`settle_game_bet`, etc.).
- **Verifikation:** 5-Stufen-DoD gemäß SOP 02 / SOP 23 (`check-doc-links`, `typecheck`, `test`, `lint`, `build`).
