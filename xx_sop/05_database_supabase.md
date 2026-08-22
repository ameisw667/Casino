# Workflow Database & Supabase

> **Zweck:** Schema-, Migrations- und RPC-Änderungen ausführen. Kontext: [`xx_docs/01_supabase_context.md`](../xx_docs/01_supabase_context.md).

## 1 — Trigger und Start-Gate

- Gilt für Schema, Migration, RPC, RLS, Service-Role-Zugriff oder Typgenerierung.
- Zuerst `xx_docs/01_supabase_context.md`, den zugehörigen Plan und die betroffenen SQL-Dateien lesen.
- Vor Schreiben prüfen: Zielprojekt, bestehende Migrationsnummer, bereits vorhandene Funktion und lokale/remote/live Kennzeichnung.
- Für Wallet-, Auth- oder andere Schreibpfade Security-Review einplanen.

## 2 — Planung

- Datenmodell, betroffene Tabellen, Rollen, RPC-Contract, Rollback-Grenze und Verifikation im Plan festhalten.
- Neue Datenklasse, Schreiboperation oder Client-Zugriff braucht Allowlist, Negativtest und Nicht-Scope.
- Migrationsreihenfolge oder Zielprojekt bei Mehrdeutigkeit vor der Umsetzung klären.

## 3 — Umsetzung

- Neue Migration erst nach Inventur von `supabase/migrations/` benennen; keine Nummer aus einer Kontextdatei ableiten.
- DDL und RPCs idempotent gestalten; Funktionen mit festem `search_path` absichern.
- Finanzielle RPCs folgen den bestehenden Server-Autoritäts- und Rechte-Grenzen.
- Balance oder Progression nie direkt aus dem Browser mutieren.

## 4 — Verifikation und Abschluss

- Betroffene Tests, Typprüfung und Build ausführen; bei Rollout nur autorisierte Remote-Aktionen ausführen.
- Lokale Datei, remote angewendete Migration und live verifizierter Effekt getrennt dokumentieren.
- Typen nach Schemaänderung mit dem im Projekt definierten Typgenerierungsbefehl aktualisieren, sofern das Projekt diesen nutzt.
- Plan und Statusquelle im selben Schritt aktualisieren.
