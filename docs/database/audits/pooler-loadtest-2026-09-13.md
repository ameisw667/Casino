# Pooler-Lasttest-Audit (2026-09-13)

- **Modus:** lokal (Artillery `npm run loadtest:bet` + 5s-Sampling via `scripts/check-pooler-health.ts`)
- **Samples:** 20 (Intervall 5s)
- **Peak DB-Verbindungen:** 11
- **Schwellen:** Warnung ≥ 42 / Kritisch ≥ 55 DB-Conns (docs/database/08_connection_pooling_supavisor.md §5)

| Sampled at               | Status | DB-Verbindungen | Aufschlüsselung                                                                                                                                                |
| ------------------------ | :----: | :-------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-13T20:42:58.840Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:02.417Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:07.147Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:11.718Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:16.570Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:21.746Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:27.007Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:31.919Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:37.300Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:42.236Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:47.545Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:52.547Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:43:56.962Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:44:01.916Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:44:06.730Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:44:11.679Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:44:16.312Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:44:21.755Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:44:26.484Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |
| 2026-09-13T20:44:31.558Z | normal |       11        | @effect/sql-pg:idle=1, cluster_node_realtime@127.0.0.1:idle=2, pg_cron scheduler:?=1, pg_net 0.20.4:idle=1, PostgREST 14.5:idle=1, supabase_mt_realtime:idle=5 |

Rohzeitreihe (JSONL): `pooler-health-loadtest.jsonl` im selben Verzeichnis.

Messgrenze: `poolerClients` ist aus `pg_stat_activity` nicht ablesbar (terminiert am Supavisor) — siehe docs/database/08_connection_pooling_supavisor.md §6.
