# Historie: Auth- & Supabase-Architektur (superseded)

> **Status:** Historie (superseded). Konsolidiert aus drei ehemaligen Planungsdateien (M6, 2026-08-09).
> **Wo es heute lebt (lebendig/autoritativ):** `docs/architecture/02_CLERK_SUPABASE.md` (Auth-Architektur, alle 10 Tasks ✅), `docs/SPIELMECHANIK.md` (Wallet-/Spiel-Mechanik, RPCs), `docs/architecture/05_MOBILE_PERFORMANCE.md` (Perf).
> Vollständige Originale in der Git-Historie erhalten.

---

## 1. Clerk-als-IdP-Architektur (ehemals `CLERK_INTEGRATION_PLAN.md`)

**Was war geplant:** Integration von Clerk als Identity Provider kombiniert mit Supabase als Datenbank, innerhalb Next.js App Router. Zwei Säulen:

- **Säule 1 — JWT-Austausch:** Clerk Custom JWT Template `supabase`, in Next.js `auth().getToken({ template: 'supabase' })`, übergeben an Supabase-Client als `Authorization: Bearer`. RLS-Policies `auth.uid() = user_id` greifen über die Clerk-`sub`.
- **Säule 2 — Webhooks:** `user.created`-Webhook (`app/api/webhooks/clerk/route.ts`) mit Svix-Signaturverifikation, Insert des neuen Users in Supabase `users`-Tabelle via `SUPABASE_SERVICE_ROLE_KEY`.

**Phasen:** (1) Clerk-Setup in Next.js — `@clerk/nextjs`, `clerkMiddleware`, `ClerkProvider`. (2) Clerk↔Supabase-JWT-Kopplung — JWT-Template, `utils/supabase/server.ts` & `client.ts` anpassen. (3) Webhooks für User-Synchronisation.

**Was davon umgesetzt wurde:** Clerk als IdP wurde **vollständig durch native Supabase-Auth ersetzt** (Clerk→Supabase-Migration, s. `02_CLERK_SUPABASE.md`). Webhook-Route lieferte zuletzt 410; User-Provisioning läuft heute über den nativen `auth.users`-Trigger (Migration 008).

**Lernwert erhalten:** Race-Condition-/Double-Spending-Schutz via atomarer RPC, Svix-Webhook-Verifikationsmuster, Edge-Case-Behandlung (DB-Insert-Fehler → HTTP 500 für Retry, nicht HTTP 200).

---

## 2. `place_bet`-Initialarchitektur & RLS (ehemals `SUPABASE_MIGRATION.md`)

**Was war geplant:** Einführung von Supabase als DB für Benutzerdaten, Transaktionen, Wetten. Kern-Tabellen `users`, `transactions`, `game_sessions`. `@supabase/supabase-js` + `@supabase/ssr` (PKCE-Flow, Cookie-basiertes Session-Management). RLS auf allen Tabellen (`SELECT auth.uid() = user_id`, Schreibrechte für Client gesperrt).

**Risiken behandelt:** A Race Conditions/Double Spending → atomare `place_bet`-RPC (Kontostand prüfen, abziehen, `transactions`-Eintrag anlegen in einer Transaktion). B Client-Manipulation → strenge RLS, kein Client-Schreibrecht auf finanzielle Tabellen. C Performance → Optimistic UI. D Downtime → Fehlerbehandlung, Einsatz bei DB-Fehler zurückerstatten. E DSGVO → Datenminimierung.

**Phasen:** (1) Setup & Clients. (2) DB-Architektur & RLS. (3) Next.js Backend/Frontend (Server Actions, Optimistic UI, Realtime). (4) Validierung/Testing (Dice-PoC, Spamming-Audit).

**Was davon umgesetzt wurde:** Ja — Supabase ist heute die autoritative DB (`hmqwozhdckbwjqzcmire`, dediziert). Die `place_bet()`/`settle_bet()`-Kette wurde jedoch **ersetzt** durch Migration 007 `server_authority.sql` (Advisory Locks, `(user_id, request_id)`-Idempotenz, `game_rounds`, atomare Aktions-RPCs). Lebendige Architektur in `SPIELMECHANIK.md`.

**Lernwert erhalten:** RLS-Prinzipien, atomare Transaktionsmuster, Optimistic-UI-Muster, Race-Condition-Provokationstests (`Promise.all`).

---

## 3. Sonstige historische Pläne — Casino+casino-platform-Merge (ehemals `MIGRATION_PLAN.md`)

**Nicht-Auth-bezogen.** Aufgeführt, um orphan stale Datei zu vermeiden.

**Was war geplant (2026-05-14):** Stärken aus `Casino` und `casino-platform` über Zeit mergen, beide unabhängig lauffähig halten. Non-Negotiables: beide Repos runnable, kein Big-Bang-Rewrite, eine Migrationseinheit pro Branch, vor/nach jeder Einheit validieren.

**Phasen:** (1) Baseline Freeze (Runtime/Framework-Versionen, Boot-Checks). (2) Feature Mapping (Auth, Wallet, Game-Module, Payments, Admin — Source-of-Truth pro Feature, P0/P1/P2-Priorität). (3) Compatibility Layer (Folder-Layout, Naming, Version-Strategie). (4) Incremental Merge Units (UI-Primitives → Navigation → Domain-Logik → API → Payments/Wallet/Auth-Hardening). Step-Guardrails + Rollback-Prozedur.

**Status:** Historisch — Merge-Workstream abgeschlossen/obsolet; heute existiert das Casino als eigenständiges Repo. Keine lebendige Fortführung.

---

## Übergang zur heutigen Architektur

| Ehemals geplant                       | Heute lebendig (autoritativ)                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Clerk-als-IdP + Webhook-Provisioning  | Native Supabase-Auth + `auth.users`-Trigger (Migration 008); s. `02_CLERK_SUPABASE.md`             |
| `place_bet()`/`settle_bet()`-Kette    | Migration 007 `server_authority.sql` (Advisory Locks, idempotent, atomar); s. `SPIELMECHANIK.md`   |
| `transactions`-Tabelle                | `wallet_transactions` + `game_rounds` (settle_game_bet, advance_blackjack_round, etc.)             |
| RLS + Service-Role-Client             | Unverändert gültig; `src/utils/supabase/admin.ts` (server-only)                                    |
| Optimistic UI / Race-Condition-Schutz | Serverautoritär — Browserwerte sind keine Wallet-Autorität; s. `SPIELMECHANIK.md` Security-Tabelle |
