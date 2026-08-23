-- Migration 046: Admin-Analytics-Snapshot — P31/1.18
-- worldmap/06_ADMIN_ANALYTICS_ETL.md L1. Ersetzt schrittweise die Live-DB-Aggregation in
-- GET /api/admin/analytics (3 Tabellen-Scans + In-Memory-Aggregation je Request) durch einen
-- nächtlich per Trigger.dev-Cron befüllten JSONB-Snapshot. Additiv, kein Eingriff in
-- bestehendes Schema, kein Wallet-/Settlement-Pfad.
--
-- Singleton-Row (Cache, keine Historie): id ist fest auf 1 gepinnt, der Cron-Task upsertet
-- dieselbe Zeile jede Nacht neu. Kein RPC nötig — Schreiben (Trigger.dev-Task) und Lesen
-- (Route) laufen beide über den bestehenden Service-Role-Client (createAdminClient()),
-- identisch zum Zugriffsmuster der übrigen Admin-Routen.

CREATE TABLE IF NOT EXISTS public.admin_analytics_snapshots (
    id            SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    payload       JSONB NOT NULL,
    generated_at  TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_analytics_snapshots ENABLE ROW LEVEL SECURITY;
-- Keine Policies: identisch zu daily_races/risk_events/jackpot_pool — Zugriff ausschließlich
-- über den Service-Role-Client, kein PostgREST-Zugriff für anon/authenticated.
