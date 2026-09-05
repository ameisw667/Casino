-- 064: pgTAP-Extension für die DB-Test-Schicht (T_DATABASE/10, L3).
-- pgTAP liefert SQL-native Assertions (has_function, throws_ok, lives_ok, …)
-- für `npx supabase test db` gegen die lokale/ephemere Instanz.
-- Schema-Konvention konsistent mit 026/027/041: Extension-Objekte nach `extensions`.

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;