# 01a — World Map: DB-Rollout-Plan 016 / 009 / 012 (verifiziert)

> **Erstellt:** 2026-08-09 · **Status:** 016 ✅ LIVE (Post-Check 7/7) · 009 DEFERRED · 012 OPTIONAL · **Quelle:** Live-Verifikation via Supabase SQL Editor (Projekt `hmqwozhdckbwjqzcmire`), siehe `worldmap/01-offene-commits.md` Abschnitt 3/Verifikation.
> **Scope:** 5 % Übersicht für Jan · 95 % Execution-Detail für LLM.
> **Voraussetzung erfüllt:** 003/007/013/014/015 remote live · RLS aktiv · 011 angewandt · 016-Schema-Deps (chat_messages, seeds, game_rounds, wallet_transactions) kompatibel verifiziert.

---

## 1 — Übersicht (5 % Scope für Jan)

| #     | Punkt                                                                                        | Remote-Status        | Entscheidung                  | Risiko  | Jan-Aktion                              | LLM-Aktion                                          |
| ----- | -------------------------------------------------------------------------------------------- | -------------------- | ----------------------------- | ------- | --------------------------------------- | --------------------------------------------------- |
| **A** | **016** Full Server-Authority Expansion (chat/seeds/community/active-round RPCs)             | nicht ausgerollt     | **GO — jetzt ausrollen**      | Niedrig | SQL-Datei ausführen + Post-Check pasten | Rollout-Datei bereitstellen, Doku aktualisieren     |
| **B** | **009** Meta-Features / Canonical Identity (user_identities, admin_roles, Trigger, Backfill) | **nicht ausgerollt** | **DEFERRED — nicht jetzt**    | Hoch    | keine (nur Kenntnisnahme)               | Evaluation + Risiko-Doku + Aktivierungs-Bedingungen |
| **C** | **012** Welcome-Bonus Default (`balance DEFAULT 10000.00` + 0-Balance-Update)                | nicht ausgerollt     | **OPTIONAL — kann ausrollen** | Niedrig | SQL-Datei ausführen (optional)          | Rollout-Datei bereitstellen                         |

**Entscheidungslogik:**

- **016 GO:** Alle Schema-Abhängigkeiten live + kompatibel verifiziert (Query A–D). Migration ist idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`). `chat_messages` existiert bereits → `CREATE IF NOT EXISTS` überspringt sauber, RPCs kompatibel. Keine Verhaltensänderung an bestehenden Tabellen.
- **009 DEFERRED:** `admin.ts` Zeile 66 hat expliziten Fallback (Email-Allowlist autoritativ) → Produktion läuft **ohne** 009. 009 installiert aber `BEFORE INSERT`-Trigger auf `users` + Backfill über alle User + Cross-Provider-Email-Conflict-Prüfung → kann Sign-ups blockieren oder mid-Migration mit `IDENTITY_CONFLICT`/`CROSS_PROVIDER_IDENTITY_CONFLICT` aborten. Nicht entbehrlich riskant.
- **012 OPTIONAL:** Reines `ALTER … DEFAULT` + einmaliges `UPDATE … WHERE balance = 0`. `promo_codes`-Referenz in `03_CASINO_SUPABASE_CONNECTION.md` war **falsch** (Phantom — kein Code fragt `promo_codes` ab). 10k-Bonus wird bereits via `WalletService.creditBonus` im Code gehandhabt. 012 ist DB-seitiges Belt-and-Suspenders.

---

## 2 — Punkt A: 016 Rollout (GO)

### 2.1 — Was gemacht werden muss

| Seite   | Aufgabe                                                                                                                                                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LLM** | Rollout-Datei `supabase/migrations/016_full_server_authority_expansion.sql` als ready-to-run bestätigen · Post-Rollout-Verifikations-SQL bereitstellen · Doku (`01-offene-commits.md`, `03_...`) aktualisieren · C2-Commit-Block vorbereiten |
| **Jan** | Inhalt von `016_...sql` in Supabase SQL Editor → Run · Output der Post-Rollout-Verifikation hierher pasten                                                                                                                                   |

### 2.2 — Workflow

```
1. Jan öffnet V:\VibeCoding\Casino\supabase\migrations\016_full_server_authority_expansion.sql
2. Copy-Paste Inhalt → Supabase SQL Editor (Projekt hmqwozhdckbwjqzcmire) → Run
3. Jan öffnet V:\VibeCoding\Casino\scripts\_tmp_verify_016_post.sql → Run → pastet Output
4. LLM bewertet Post-Check → GO/Revert
5. LLM: Doku-Update + C2-Commit-Vorbereitung (ohne git commit — global rule)
```

### 2.3 — Was 016 anlegt (idempotent)

| Objekt                      | Typ      | Idempotenz                                                                                                                        |
| --------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `chat_messages`             | table    | `CREATE IF NOT EXISTS` — existierende Tabelle wird übersprungen (Schema verifiziert kompatibel)                                   |
| `idx_chat_messages_created` | index    | `CREATE INDEX IF NOT EXISTS`                                                                                                      |
| `post_chat_message`         | function | `CREATE OR REPLACE`                                                                                                               |
| `get_recent_chat_messages`  | function | `CREATE OR REPLACE`                                                                                                               |
| `get_or_create_user_seed`   | function | `CREATE OR REPLACE` (liest/schreibt `seeds`, `ON CONFLICT (user_id)` — Unique-Index verifiziert)                                  |
| `rotate_user_seed`          | function | `CREATE OR REPLACE`                                                                                                               |
| `get_community_stats`       | function | `CREATE OR REPLACE` (filtert `type IN ('bet','bet_settled')` — `bet` existiert nicht, zählt nur `bet_settled`=306, funktional ok) |
| `get_active_game_round`     | function | `CREATE OR REPLACE` (liest `game_rounds` — alle Spalten verifiziert)                                                              |

### 2.4 — Mögliche Fehler & Umgang

| #   | Fehler                                                               | Wahrscheinlichkeit | Auswirkung                                | Umgang                                                                                                                                       |
| --- | -------------------------------------------------------------------- | ------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | `chat_messages`-`ALTER ENABLE RLS` kollidiert mit bestehender Policy | Niedrig            | RLS aktiv (gewünscht)                     | `ALTER … ENABLE ROW LEVEL SECURITY` ist idempotent; keine Policy-Kollision, da 016 keine Policy anlegt                                       |
| A2  | `get_or_create_user_seed` bricht wegen fehlendem Unique-Constraint   | Sehr niedrig       | Funktionsfehler bei Seed-Creation         | Verifiziert: `seeds_pkey` (Unique auf `user_id`) existiert → `ON CONFLICT (user_id)` sicher                                                  |
| A3  | `post_chat_message` INSERT scheitert (Spalten-Mismatch)              | Sehr niedrig       | Chat-Post fehlschlägt                     | Verifiziert: `chat_messages`-Spalten exakt kompatibel (`user_id, username, rank, message, is_system, is_win, created_at`)                    |
| A4  | `get_community_stats` zählt 0 weil `type`-Werte anders               | Mittel             | Community-Ziel zeigt 0/306 statt erwartet | Kein Fehler — `bet_settled`=306 wird korrekt gezählt; `bet` existiert remote nicht. Optional: Filter auf `type = 'bet_settled'` vereinfachen |
| A5  | `pg_advisory`/`gen_random_bytes`/`digest` nicht verfügbar            | Sehr niedrig       | RPC-Anlage scheitert                      | Supabase Postgres hat `pgcrypto` + `pg_advisory_lock` nativ; 007 nutzt gleichen Stack erfolgreich                                            |
| A6  | Editor-Timeout bei mehreren Statements                               | Niedrig            | Partieller Rollout                        | 016 ist ~210 Zeilen, unaufwändig; ggf. in 2 Runs (Tabellen/Indexes → Funktionen) splitten                                                    |

### 2.5 — Post-Rollout-Verifikation

Siehe `scripts/_tmp_verify_016_post.sql` (wird in Execution erstellt). Prüft: alle 6 neuen RPCs = `true`, `chat_messages` RLS = `true`.

### 2.6 — Rollback (falls A1–A6 eintritt)

```sql
DROP FUNCTION IF EXISTS public.post_chat_message(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_recent_chat_messages(INT);
DROP FUNCTION IF EXISTS public.get_or_create_user_seed(TEXT);
DROP FUNCTION IF EXISTS public.rotate_user_seed(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_community_stats();
DROP FUNCTION IF EXISTS public.get_active_game_round(TEXT, TEXT);
-- chat_messages-Tabelle NICHT droppen (existierte vor 016, nur RPCs entfernt)
```

---

## 3 — Punkt B: 009 DEFERRED (Evaluation + Aktivierungs-Bedingungen)

### 3.1 — Evaluation: Warum 009 nicht jetzt

| Befund                            | Detail                                                                                                                                                                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entbehrlich für Produktion**    | `src/lib/security/admin.ts:66` — „If Migration 009 tables are missing or not populated, allowlist check above is authoritative." → Admin-Zugriff läuft via `SUPABASE_ADMIN_EMAILS`-Allowlist, `canonicalUserId = user.id`. Produktion voll funktionsfähig ohne 009. |
| **Riskante Verhaltensänderung 1** | `BEFORE INSERT`-Trigger `guard_canonical_user_provisioning` auf `users` — raiset `IDENTITY_CLAIM_REQUIRED` / `CANONICAL_IDENTITY_REQUIRED` bei Konflikt → **kann neue Sign-ups blockieren**, falls Quarantine-Einträge existieren.                                  |
| **Riskante Verhaltensänderung 2** | Backfill-`DO`-Block iteriert **alle** `users` und ruft `link_user_identity` → bei Dubletten raiset `IDENTITY_CONFLICT` und **abortet die gesamte Migration mid-Run** (Teilapplikation möglich, Zustand inkonsistent).                                               |
| **Riskante Verhaltensänderung 3** | Cross-Provider-Email-Conflict-`DO`-Block raiset `CROSS_PROVIDER_IDENTITY_CONFLICT`, falls Legacy-Clerk- + Supabase-User gleiche Email haben → **abortet vor Backfill**.                                                                                             |
| **`REVOKE UPDATE ON users`**      | Entzieht `anon`/`authenticated` Update-Rechte auf `users`. Sicher nach Server-Autorität-Architektur (alle Wallet-Ops via `service_role` RPC), aber Verhaltensänderung.                                                                                              |

### 3.2 — Aktivierungs-Bedingungen (für späteres Fenster)

009 darf erst ausgerollt werden, wenn **alle** erfüllt:

1. **Identitäts-Audit:** `SELECT` über `users` auf Email-Duplikate (Legacy-Clerk-UUID vs. Supabase-UUID) → 0 Konflikte.
2. **Quarantine leer oder resolved:** `SELECT count(*) FROM identity_link_quarantine WHERE resolved_at IS NULL` muss 0 sein vor Trigger-Aktivierung (oder Trigger muss deaktiviert bis Quarantine bereinigt).
3. **Backup:** `pg_dump` der `users`-Tabelle vor Backfill.
4. **Wartungsfenster:** Sign-ups während Backfill evtl. blockiert → niedrigtraffic-Zeitfenster.
5. **Trigger-Test:** Erst ohne `BEFORE INSERT`-Trigger ausrollen, Backfill laufen lassen, dann Trigger aktivieren.

### 3.3 — Was LLM jetzt tut

- Kein Rollout. Kein SQL-File zum Ausführen.
- Dokumentation der Aktivierungs-Bedingungen (dieser Abschnitt).
- Eintrag in `01-offene-commits.md` als **B7-Blocker (009-Aktivierung)**, nicht Teil von C2.

### 3.4 — Mögliche Fehler bei späterem Rollout & Umgang

| #   | Fehler                          | Umgang                                                                                                     |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| B1  | Sign-up blockiert durch Trigger | Trigger deaktivieren (`DROP TRIGGER`), Quarantine bereinigen, re-aktivieren                                |
| B2  | Backfill abortet mid-Run        | `pg_dump`-Restore; Konflikte manuell auflösen; `link_user_identity` ist idempotent → Re-Run nach Fix       |
| B3  | Cross-Provider-Conflict         | Legacy-Clerk-User bereinigen/löschen (ClerkMigration abgeschlossen) oder kanonischen User explizit claimen |

---

## 4 — Punkt C: 012 Rollout (OPTIONAL)

### 4.1 — Was gemacht werden muss

| Seite   | Aufgabe                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------- |
| **LLM** | Rollout-Datei `supabase/migrations/012_welcome_bonus.sql` bestätigen · Doku-Korrektur (`03_...`: 012 ≠ promo_codes) |
| **Jan** | (Optional) Inhalt von `012_...sql` in SQL Editor → Run                                                              |

### 4.2 — Workflow

```
1. (Optional) Jan öffnet V:\VibeCoding\Casino\supabase\migrations\012_welcome_bonus.sql
2. Copy-Paste → SQL Editor → Run
3. LLM: Doku-Korrektur (03) + C2-Block-Update
```

### 4.3 — Was 012 macht (idempotent)

| Statement                                                     | Wirkung                             | Idempotenz                                                                                               |
| ------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `ALTER TABLE users ALTER COLUMN balance SET DEFAULT 10000.00` | Default für neue `users`-Zeilen     | Idempotent (SET DEFAULT)                                                                                 |
| `UPDATE users SET balance = 10000.00 WHERE balance = 0.00`    | Einmaliges Auffüllen 0-Balance-User | **Nicht idempotent** — 2. Run no-op (keine 0-Balance mehr), aber 1. Run ändert bestehende 0-Balance-User |

### 4.4 — Mögliche Fehler & Umgang

| #   | Fehler                                                                        | Wahrscheinlichkeit | Auswirkung                                    | Umgang                                                                                                          |
| --- | ----------------------------------------------------------------------------- | ------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| C1  | 0-Balance-User, die nicht 10k bekommen sollten (Test-User), werden aufgefüllt | Mittel             | Guthaben-Drift bei Test-Usern                 | Vor Run: `SELECT count(*) FROM users WHERE balance = 0.00` prüfen; ggf. UPDATE weglassen und nur DEFAULT setzen |
| C2  | Code-Konflikt: `WalletService` credits bereits 10k → Doppel-Bonus             | Sehr niedrig       | Neue User bekommen 10k (Default) + 10k (Code) | Code-Logik prüfen: `creditBonus` nur bei Bedingung; Default greift nur bei INSERT ohne balance-Value            |
| C3  | `promo_codes`-Annahme in Doku                                                 | —                  | Verwirrung                                    | Doku-Korrektur in `03_CASINO_SUPABASE_CONNECTION.md` (keine `promo_codes` in 012)                               |

### 4.5 — Rollback

```sql
ALTER TABLE users ALTER COLUMN balance DROP DEFAULT;
-- UPDATE nicht reversibel ohne Kenntnis der Original-Balance; nur wenn C1-Drift → manuell korrigieren
```

---

## 5 — Execution-Reihenfolge

```
A (016 Rollout) ─► Post-Check ─► Doku-Update ─► C2-Commit-Vorbereitung
C (012 Rollout, optional) ─► Doku-Korrektur
B (009) — KEIN Rollout, nur Doku
```

**Reihenfolge:** A → C → (B nur Doku). A und C sind unabhängig voneinander; A hat Priorität (C3-Code-Block wartet auf 016).

---

## 6 — Risiko-Register (konsolidiert)

| ID   | Risiko                                          | Punkt | Wkeit                  | Auswirkung | Mitigation                                                           |
| ---- | ----------------------------------------------- | ----- | ---------------------- | ---------- | -------------------------------------------------------------------- |
| R-A1 | RLS-Policy-Kollision auf chat_messages          | A     | Niedrig                | Niedrig    | 016 legt keine Policy an; `ENABLE RLS` idempotent                    |
| R-A4 | Community-Stats zählt unvollständig             | A     | Mittel                 | Niedrig    | Akzeptiert (`bet_settled`=306 korrekt); optional Filter vereinfachen |
| R-B1 | 009-Trigger blockiert Sign-ups                  | B     | Hoch (falls aktiviert) | Hoch       | DEFERRED — 009 nicht aktivieren                                      |
| R-B2 | 009-Backfill abortet mid-Run                    | B     | Mittel                 | Hoch       | DEFERRED + Aktivierungs-Bedingungen §3.2                             |
| R-C1 | 012 füllt ungewollt 0-Balance-Test-User         | C     | Mittel                 | Niedrig    | Pre-Check `SELECT count(*) WHERE balance=0.00`                       |
| R-D1 | Doku-Drift unbeachtet (03 falsch)               | alle  | Gewiss                 | Mittel     | Doku-Korrektur in Execution                                          |
| R-D2 | C3-Code auf 016-RPCs angewiesen, bevor 016 live | A     | Mittel                 | Hoch       | C3 erst nach A-Post-Check-GO committen/ausrollen                     |

---

## 7 — Verifikations-Plan

| Zeitpunkt        | Prüfung                                                 | Datei                                                                                                      |
| ---------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Pre (erledigt)   | 003/007/013/014/015 live, RLS, 011, Schema-Deps         | `verify-migrations-applied.sql` + A/B/C/D                                                                  |
| **Post A (016)** | 6 neue RPCs existieren, chat_messages RLS               | `_tmp_verify_016_post.sql` (wird erstellt)                                                                 |
| Post C (012)     | `users.balance` Default = 10000                         | `SELECT column_default FROM information_schema.columns WHERE table_name='users' AND column_name='balance'` |
| C3-Integration   | API-Routes chat/seeds/community/active-round funktional | `npm run test` + manuelle Curl-Tests                                                                       |

---

## 8 — Self-Audit (Next-Level-Prüfung)

### 8.1 — Fehler/Unschärfen im Entwurf

- **F1 — 012-UPDATE-Nicht-Idempotenz nicht klar genug markiert.** §4.3 jetzt explizit: UPDATE ist **nicht** idempotent (ändert bestehende 0-Balance-User). → C1-Risiko ergänzt + Pre-Check empfohlen.
- **F2 — `get_recent_chat_messages` Parameter-Signatur im Rollback.** §2.6 Drop-Statement braucht `(INT)`-Signatur. → korrigiert (`get_recent_chat_messages(INT)`).
- **F3 — 016 `get_community_stats` Community-Ziel-Hardcode `25000.0`.** Funktion hat `communityGoal: 25000.0` fest. Falls Ziel dynamisch sein soll → Folge-Ticket. Als Info aufgenommen, kein Blocker.
- **F4 — `chat_messages`-RLS hat keine Policy.** 016 aktiviert RLS aber legt keine `SELECT`/`INSERT`-Policy an → Client kann via anon/authenticated **nicht** lesen/schreiben (nur `service_role`). Gewollt (Server-Autorität: API-Route nutzt `service_role`). → In §2.1 Hinweis aufgenommen: Zugriff nur via `service_role` in API-Route.

### 8.2 — Vergessene Punkte (ergänzt)

- **P1 — Post-Check-Datei fehlt noch.** §2.5 verweist auf `_tmp_verify_016_post.sql`, das in Execution erstellt wird. → Task #3.
- **P2 — C3-Abhängigkeit explizit:** C3 (API-Routes) darf erst nach 016-Post-Check-GO ausgerollt werden, sonst 500er. → R-D2 + §5.
- **P3 — 009-Trigger hat `DROP TRIGGER IF EXISTS` vor `CREATE`.** Sicher (idempotent), aber bei Re-Run nach Conflict muss Trigger manuell re-aktiviert werden. → §3.4 B1 ergänzt.
- **P4 — 012 `C2`-Commit-Reihenfolge:** 014/015 bereits live → C2-Commit enthält 014/015/016 als Repo-Integrität; Rollout nur 016 (+ optional 012). → C2-Sektion in `01-offene-commits.md` präzisieren.

### 8.3 — Weiterpunkte auf Next-Level

- **A1 — Rollout-Dry-Run:** 016 vor Live-Rollout in lokalem Supabase-Stack (`supabase start`) testen, dann remote. → §2.2 optionaler Step.
- **A2 — `get_community_stats`-Filter-Vereinfachung:** `type IN ('bet','bet_settled')` → `type = 'bet_settled'` (da `bet` nicht existiert). Folge-PR, nicht in 016-Rollout ändern (Rollout = kanonische Migration).
- **A3 — 009-Aktivierungs-Ticket:** Definierter Folge-Task mit §3.2-Bedingungen als Acceptance-Criteria. → `01-offene-commits.md` B7.
- **A4 — Doku-Single-Source:** `03_CASINO_SUPABASE_CONNECTION.md` wird zur kanonischen Migrations-Wahrheit korrigiert (Execution Task #5).

### 8.4 — Audit-Ergebnis

Plan ist nach F1–F4 + P1–P4 + A1–A4 auf Next-Level: 3 Punkte sauber getrennt, je mit Tasks/Workflow/Risiken/Rollback, 009 mit Aktivierungs-Bedingungen statt blindem Rollout, 012 mit Idempotenz-Klarheit, Cross-Referenzen zu C2/C3. Ausprägbar in Reihenfolge §5.
