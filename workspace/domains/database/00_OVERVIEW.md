# Domänen-Navigator: Database & Backend Services

> **Domäne:** `workspace/domains/database` · **Stand:** 2026-09-19  
> **Zweck:** Zentrale Navigation für Supabase-Postgres, Migrationen, API-Routen und Hintergrund-Jobs.

---

## 1 — Modulübersicht

| Modul               | Verzeichnis                                                                                                   | Beschreibung                               | Status   |
| :------------------ | :------------------------------------------------------------------------------------------------------------ | :----------------------------------------- | :------- |
| **Database Core**   | [`T_DATABASE/`](./T_DATABASE/00_DATABASE_VERBESSERUNG.md)                                                     | Schema, Migrationen, Pooling, RLS, pgTAP   | 🟢 Aktiv |
| **API Backend**     | [`T_API/`](./T_API/00_API_UEBERSICHT.md)                                                                      | Next.js API-Routen, Envelopes, Validierung | 🟢 Aktiv |
| **Background Jobs** | [`T_BACKGROUND_JOBS_SCHEDULING/`](./T_BACKGROUND_JOBS_SCHEDULING/00_BACKGROUND_JOBS_SCHEDULING_UEBERSICHT.md) | Trigger.dev & `pg_cron` Workflows          | 🟢 Aktiv |

---

## 2 — Binnenstruktur

- `active/` — Offene DB- und Backend-Entwicklungspläne
- `archive/` — Historische Migrationspläne und abgeschlossene Reviews
- `references/` — Schema-Referenzen, SQL-SOPs und Indexierungs-Guides

---

## 3 — Wichtigste Invarianten

- **Dediziertes Supabase-Projekt:** `hmqwozhdckbwjqzcmire` (kein `casino_`-Präfix).
- **Atomare Finanz-RPCs:** Strikte Advisory Locks (`pg_advisory_xact_lock`), `place_bet_atomic`.
- **API-Transport:** Transport trennt Geschäftslogik; Fail-closed mit JSON 503/401.
