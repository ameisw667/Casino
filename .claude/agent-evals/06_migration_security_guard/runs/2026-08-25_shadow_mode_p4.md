# 06 — Migration Security Guard — Shadow-Mode-Reviews (P4)

> **Datum:** 2026-08-25 · **Modus:** Production (kein Evaluation mode) · **Zweck:** Die drei laut `worldmap/13_claude_code/agents/12_1_migration_security_guard_pilot.md` §5 geforderten Shadow-Mode-Reviews auf echten Migrationsdateien. Der Agent bleibt rein beratend — kein Merge- oder Deployment-Block, keine Datenbankänderung.

## Auswahl

Drei reale, bereits gemergte Migrationen aus dem Repo, keine davon Teil der Evaluierungsfixtures (01–06). Bewusst unterschiedliche Risikoflächen gewählt: eine Finanz-RPC-Änderung, eine Realtime-Autorisierungsänderung und eine reine Audit-Log-Tabelle ohne Finanzbezug — deckt sowohl erwartete Findings als auch erwartete Nicht-Findings ab.

| Fall | Datei | Risikofläche |
| --- | --- | --- |
| S1 | `supabase/migrations/045_fix_wallet_events_jackpot_regression.sql` | Finanz-RPCs (`settle_game_bet`, `settle_game_round`, `advance_blackjack_round`) |
| S2 | `supabase/migrations/049_crash_room_realtime_authorization.sql` | Realtime-RLS-Policy, kein Finanzbezug |
| S3 | `supabase/migrations/052_user_login_history.sql` | Neue Audit-Log-Tabelle, kein Finanzbezug |

## Ergebnisse und Klassifikation

Klassifikation gemäß Phase D, Punkt 2 des Workflow-Plans: **korrekt** / Fehlalarm / übersehener Fehler / unklar.

| Fall | Status | Kernbeleg | Klassifikation |
| --- | --- | --- | --- |
| S1 | `PASS` | Alle vier `SECURITY DEFINER`-Funktionen behalten fixen `search_path`; keine neuen Grants; `pg_advisory_xact_lock` + `request_id`-Replay-Guard vor jeder Bilanzmutation bleiben erhalten (Zeilen 57, 131, 218, 283 u. a.) | **Korrekt** — zutreffendes PASS mit vollständiger Zeilen-Evidenz für alle vier Regeln |
| S2 | `PASS` | Nur eine `SELECT`-RLS-Policy auf `realtime.messages` (Supabase-Systemtabelle), keine Funktion, kein Finanzbezug; Agent begründet korrekt, warum `xx_sop/09` nicht gelesen wurde | **Korrekt** — sauberes Non-Applicable-Reasoning statt blindem Regel-Durchlauf |
| S3 | `PASS` | Neue Tabelle mit korrekt aktivierter RLS und nutzerbezogener `SELECT`-Policy; kein Finanz-/Definer-Bezug | **Korrekt**, plus ein zusätzlicher, korrekt als `OUT-OF-SCOPE` markierter Hinweis: `GRANT INSERT ... TO authenticated` (Zeile 30) hat keine begleitende `INSERT`-Policy — unter RLS damit wirkungslos (default-deny). Kein in-scope Fund (keine der vier Regeln betroffen), aber ein sachlich richtiger, nicht erzwungener Zusatzhinweis |

**Kein übersehener Kernfehler, kein Fehlalarm, keine Unklarheit in allen drei Reviews.**

## Bezug zu P4 und zum Pilot-Gate

Damit sind alle drei laut Plan geforderten Shadow-Mode-Reviews dokumentiert. In Kombination mit den zwei konsistenten frischen Evaluierungsläufen ([2026-08-25_v0_1_1_full_revalidation.md](2026-08-25_v0_1_1_full_revalidation.md)) ist die vollständige Pilot-Anforderung aus `12_workflow_agent_creation.md` §4 Phase D erfüllt: *„alle fünf Pflichtfälle bestanden, zwei konsistente frische Läufe und mindestens drei echte, relevante Prüfungen."*

**Was diese Datei nicht behauptet:** Sie ist keine Aktivierungsfreigabe. Die `Active`-Entscheidung (P5) bleibt laut Plan ausdrücklich bei Jan — dieser Report ist die kompakte Evidenzzusammenfassung dafür, keine Ersatzentscheidung.
