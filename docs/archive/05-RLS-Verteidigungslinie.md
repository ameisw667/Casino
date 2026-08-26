# 05 — RLS-Verteidigungslinie (Defense-in-Depth für Wallet-Tabellen)

> **Status:** Executed (archiviert) · **Stand:** 2026-08-25 · **Owner:** Jan/LLM · **Scope:** Verifizieren und — nur bei nachgewiesenem Fund — gezielt nachziehen, ob Row-Level-Security als echte zweite Schreibschutz-Ebene hinter der Service-Role für die geld-/identitätskritischen Tabellen `users`, `wallet_transactions`, `game_sessions` tatsächlich greift. Kein Aufbau neuer Client-Zugriffspfade, keine Änderung an der bestehenden Service-Role/RPC-Architektur.

## 0 — Kontext für neue LLM-Konversation (eigenständig lesbar)

- **Ursprung:** Roadmap-Punkt P40/1.26 in [`worldmap/05_ZUKUNFTSPLANUNG.md`](../../worldmap/05_ZUKUNFTSPLANUNG.md).
- **Ist-Zustand (verifiziert per Penetrationstest & Code-Read, 2026-08-25):**
  - RLS ist aktiviert auf `users` ([`supabase/migrations/001_users.sql`](../../supabase/migrations/001_users.sql)), `wallet_transactions` und `game_sessions` ([`supabase/migrations/002_wallet.sql`](../../supabase/migrations/002_wallet.sql)), `game_rounds` ([`supabase/migrations/007_server_authority.sql`](../../supabase/migrations/007_server_authority.sql)), sowie `wallet_ledger_baselines` und `wallet_invariant_events` ([`supabase/migrations/028_wallet_ledger_invariants.sql`](../../supabase/migrations/028_wallet_ledger_invariants.sql)).
  - Für alle client-lesbaren Tabellen existieren ausschließlich `SELECT`-Policies auf die eigene Zeile (`users_select_own`, `transactions_select_own`, `sessions_select_own`). Für Mutationen (`INSERT`/`UPDATE`/`DELETE`) existiert keine Client-Policy; `users_update_own` wurde in `009_meta_features.sql` gedroppt und `REVOKE UPDATE` ausgeführt. `wallet_transactions` besitzt `REVOKE UPDATE, DELETE` plus Append-Only Trigger.
  - Alle produktiven Schreibvorgänge laufen über [`src/utils/supabase/admin.ts`](../../src/utils/supabase/admin.ts) (Service-Role-Client) oder `SECURITY DEFINER`-RPCs mit festem `search_path = public, pg_temp`.
  - Penetrationstest `src/lib/security/__tests__/rls-defense-in-depth.test.ts` (29 Tests) bestätigt: Sämtliche direkten Client-Manipulationsversuche werden fail-closed abgewiesen (Fallback A).
- **Options-Gate-Ergebnis (2026-08-25):** Jan hat sich im Chat für **Option 1 (Verify-First / Minimal-Scope)** entschieden.

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| --- | --- | --- | --- | --- |
| L0 | Kontext geschaffen, Options-Gate durchgeführt, Option 1 gewählt | 🟢 Executed | — | LLM |
| L1 | RLS-Penetrationstest schreiben (anon-Key + Test-User-JWT gegen `users`, `wallet_transactions`, `game_sessions`) | 🟢 Executed | Abgeschlossen in `src/lib/security/__tests__/rls-defense-in-depth.test.ts` (29 Tests grün) | LLM |
| L2 | `SECURITY DEFINER`/`INVOKER`-Modus aller Finanz-RPCs dokumentieren | 🟢 Executed | Tabelle in `xx_sop/09_security_wallet_invariants.md` §1.1 ergänzt & per Test verifiziert | LLM |
| L3 | Testergebnis auswerten: Policy-Lücke ja/nein | 🟢 Executed | Fallback A bestätigt: RLS-Default-Deny greift vollständig, keine Lücke vorhanden | LLM |
| L4 | Nur bei Fund: gezielte Migration (ausschließlich betroffene Tabelle/Operation) | 🟢 Executed | Entfällt planmäßig (Fallback A): Keine Policy-Lücke vorhanden, keine Migration nötig | LLM |
| L5 | Lokale Verifikation (Test erneut grün gegen `supabase start`) | 🟢 Executed | 29/29 Tests in `src/lib/security/__tests__/rls-defense-in-depth.test.ts` grün | LLM |
| L6 | Remote-Rollout (`supabase db push`) | ⚪ Entfällt | Keine Migration in L4 erforderlich, kein Remote-Push nötig | **Jan** |

## 2 — Meilensteine im Detail

### L1 — RLS-Penetrationstest

- **Ziel:** Nachweisen, ob die fehlenden `INSERT`/`UPDATE`/`DELETE`-Policies auf `users`, `wallet_transactions`, `game_sessions` tatsächlich zu Deny führen (Postgres-Default) oder ob eine Lücke besteht.
- **Ergebnis:** 🟢 **Executed** — Neue Testdatei [`src/lib/security/__tests__/rls-defense-in-depth.test.ts`](../../src/lib/security/__tests__/rls-defense-in-depth.test.ts) implementiert und erfolgreich mit 29/29 Tests ausgeführt. Alle Negativ- und Positivtests bestehen.

### L2 — `SECURITY DEFINER`/`INVOKER` dokumentieren

- **Ziel:** Für alle Finanz-RPCs den Sicherheitsmodus tabellarisch festhalten.
- **Ergebnis:** 🟢 **Executed** — Tabelle in [`xx_sop/09_security_wallet_invariants.md`](../../xx_sop/09_security_wallet_invariants.md) §1.1 vollständig integriert; alle 8 Finanz-RPCs sind als `SECURITY DEFINER` mit `search_path = public, pg_temp` und Service-Role-Isolation dokumentiert und durch automatische Vitest-Prüfungen verifiziert.

### L3 — Auswertung & Verzweigung

- **Ziel:** Basierend auf dem L1-Ergebnis entscheiden, ob L4 überhaupt nötig ist.
- **Ergebnis:** 🟢 **Executed (Fallback A bestätigt)** — Alle Negativtests aus L1 werden sauber blockiert:
  - `UPDATE users`: Blockiert via `009_meta_features.sql` (`REVOKE UPDATE ON TABLE public.users FROM PUBLIC, anon, authenticated`).
  - `wallet_transactions`: Mutationen blockiert via RLS-Default-Deny + `028_wallet_ledger_invariants.sql` (`REVOKE UPDATE, DELETE` + Append-Only Trigger).
  - `game_sessions`: Mutationen blockiert via RLS-Default-Deny.
  - Cross-Tenant Data Leakage: Blockiert via `_select_own`-Policies (`auth.jwt() ->> 'sub' = user_id`).
  - `game_rounds` & Ledger-Tabellen: Geschützt via `REVOKE ALL FROM PUBLIC, anon, authenticated`.
  - **Fazit:** RLS-Default-Deny und Revokes greifen lückenlos. Es existiert kein Befund / keine Policy-Lücke.

### L4 — Gezielte Migration (nur bei Fallback B)

- **Ziel:** Gezielte Migration entwerfen bei Policy-Lücke.
- **Ergebnis:** 🟢 **Executed (Entfällt nach Fallback A)** — Da in L1/L3 keine Lücke festgestellt wurde, wird planmäßig keine unnötige Migration erstellt.

### L5 — Lokale Verifikation

- **Ziel:** Lokale Verifikation des gesamten Testpakets.
- **Ergebnis:** 🟢 **Executed** — `npm test -- src/lib/security/__tests__/rls-defense-in-depth.test.ts` (29 Tests grün) sowie vollständige Typprüfung (`npm run typecheck`) fehlerfrei abgeschlossen.

### L6 — Remote-Rollout

- **Ziel:** `supabase db push` gegen das Remote-Projekt.
- **Ergebnis:** ⚪ **Entfällt** — Da keine neue Migration in L4 erforderlich war, ist kein Remote-DB-Push notwendig.

## 3 — Selbstprüfung vor Execution-Ready (laut `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- **Scope-Abgrenzung:** Gegenüber P39 (API-Contract-Disziplin) und P30 (Staging-Pipeline) klar getrennt — diese Datei behandelt ausschließlich RLS-Policies auf drei bestehenden Tabellen, keine neuen API-Contracts und keine Staging-Infrastruktur.
- **Jan-Entscheidungen benannt:** Options-Gate-Wahl (bereits getroffen, Option 1), L4-Migrationsfreigabe (K4), L6-Remote-Push (Jan führt aus).
- **Allowlist/Negativtest/Fallback:** L1 enthält beide Testarten explizit; L3 enthält den vollständigen Fallback A/B.
- **Statusbehauptungen gekennzeichnet:** Abschnitt 0 ist durchgehend als "verifiziert per Code-Read, 2026-08-25" markiert, nicht als live.
- **Keine Doppelpflege:** Der volle Inhalt von `xx_sop/09_security_wallet_invariants.md` wird nicht kopiert, nur gezielt ergänzt (L2) und verlinkt.
- **Eigenständig verständlich:** Abschnitt 0 ist so geschrieben, dass eine neue LLM-Konversation ohne diesen Chat-Verlauf direkt mit L1 starten kann.

## 4 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Security-/Wallet-Invarianten | [`xx_sop/09_security_wallet_invariants.md`](../../xx_sop/09_security_wallet_invariants.md) |
| Datenbank-/Migrations-SOP | [`xx_sop/05_database_supabase.md`](../../xx_sop/05_database_supabase.md) |
| Migration-Security-Review-Agent | [`.claude/agents/06_migration_security_guard.md`](../../.claude/agents/06_migration_security_guard.md) |
| Service-Role-Client (Ist-Zustand) | [`src/utils/supabase/admin.ts`](../../src/utils/supabase/admin.ts) |
| Bestehende RLS-Policies (Ist-Zustand) | [`supabase/migrations/001_users.sql`](../../supabase/migrations/001_users.sql), [`supabase/migrations/002_wallet.sql`](../../supabase/migrations/002_wallet.sql) |
| Roadmap-Ursprung | [`worldmap/05_ZUKUNFTSPLANUNG.md`](../../worldmap/05_ZUKUNFTSPLANUNG.md) (P40/1.26) |
