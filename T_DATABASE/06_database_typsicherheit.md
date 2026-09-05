# 06 — Typsicherheit & Typegen

> **Status:** 🟢 Ausgeführt (L0–L5 verifiziert, 2026-09-05) · **Stand:** 2026-09-05 · **Owner:** LLM (kein Jan-Gate) · **Scope:** Echte Typbindung der drei Supabase-Clients an das generierte Schema, Behebung des aktiven Types-Drifts, Korrektur der Doku. Kein neues Laufzeitverhalten — reine Compile-Time-Absicherung.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies Abschnitt 1 (Übersicht), Abschnitt 2 (Subkategorien-Bewertung) und Abschnitt 3 (verifizierter Ist-Stand) vollständig — **Abschnitt 3 enthält den wichtigsten Fund dieser gesamten Planungsserie: kein einziger der drei Supabase-Clients ist tatsächlich an den generierten Datenbank-Typ gebunden.**
2. Beginne bei L1. Kein Meilenstein braucht Jan.
3. **Erwarte nach L1 neue TypeScript-Fehler.** Das ist beabsichtigt (siehe L1 „Wichtiger Hinweis"), kein Rückschritt — jeden neuen Fehler einzeln mit dem echten Typ beheben, nicht mit `as any` zudecken.
4. Nach jedem Meilenstein: Ampel in Abschnitt 4 aktualisieren.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein | Status | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | --- | :---: | --- | :---: | :---: |
| L0 | Kontext & Scope | 🟢 verifiziert (2026-09-04) | — | LLM | Nein |
| L1 | `createClient<Database>()` in allen 3 Clients binden | 🟢 verifiziert (2026-09-05) | — | LLM | Nein (Compile-Time) |
| L2 | Doku-Korrektur (fiktives CI-Gate, Status-Header, realer Husky-Hook nachtragen) | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L3 | Aktiven Types-Drift schließen (`wellbeing`-Tabelle fehlt) | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L4 | Row/Insert/Update-Typnutzung an Schreibpfaden nachrüsten | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |
| L5 | RPC-Rückgabewerte typisieren | 🟢 verifiziert (2026-09-05) | — | LLM | Nein |

**Warum kein Jan-Gate nötig ist:** Alle Meilensteine sind reine Compile-Time-/Typisierungsarbeit ohne Laufzeitverhalten-Änderung, ohne externe Abhängigkeit, ohne neue Secrets. Der einzige nennenswerte Effekt ist, dass `npm run typecheck` nach L1 vorübergehend mehr Fehler zeigt, bis diese behoben sind — das ist der Zweck der Übung, kein Risiko.

---

## 2 — Typsicherheit & Typegen in 10 Subkategorien: Bewertung & Bottlenecks

> Skala: Top 1 % = Marktspitze, Top 100 % = praktisch nicht vorhanden. Bewertung basiert auf der Recherche in Abschnitt 3, nicht auf der bestehenden (widerlegten) Doku.

| # | Subkategorie | Niveau | Status | Kernbefund |
| :---: | --- | :---: | :---: | --- |
| 2 | CI-Drift-Gate-Existenz | **Top 100 %** | 🔴 | Die von der Doku behauptete Datei `.github/workflows/ci.yml` **existiert nicht im Repo** — vollständig fiktiv (wird von Säule 2 L3 real gebaut, hier nur referenziert) |
| 5 | Row/Insert/Update-Typkorrektheit an Schreibpfaden | **Top 100 %** | 🔴 | Nicht verifizierbar, weil **kein einziger** API-Route-Code den generierten `Database`-Typ importiert — direkte Folge von #1 |
| 1 | Client-Type-Bindung (`createClient<Database>()`) | **Top 95 %** | 🔴 | Keiner der drei Clients (`client.ts`, `server.ts`, `admin.ts`) übergibt den generischen `Database`-Parameter — alle drei sind implizit `any`-typisiert. Kern-Ursache fast aller anderen Lücken dieser Säule |
| 10 | RPC-Rückgabewert-Typisierung | **Top 90 %** | 🔴 | Doku behauptet "RPC-Aufrufe voll typgeprüft" — real ungetypt, direkte Folge von #1 |
| 4 | Status-Header-Konsistenz | **Top 90 %** | 🔴 | Doku behauptet „Top 1 % — Produktionsreif", Worldmap misst Top 20 % — dasselbe Muster wie bei Säule 2/8/9/10 |
| 3 | Aktualität der generierten Types | **Top 80 %** | 🔴 | Aktiver, nicht nur theoretischer Drift: `database.types.ts` enthält keine Spur der Tabelle aus Migration `063_user_wellbeing_limits.sql` |
| 9 | Client-übergreifende Konsistenz | **Top 50 %** | 🟡 | Alle drei Clients sind einheitlich untypisiert — konsistent falsch, kein Client ist schlechter als ein anderer |
| 7 | `strict`-Mode & Compiler-Härte | **Top 15 %** | 🟢 | `strict: true` aktiv (`tsconfig.json:7`); `noUncheckedIndexedAccess` fehlt, aber nicht kritisch |
| 6 | Explizite `any`-Casts / `@ts-ignore` im Code | **Top 10 %** | 🟢 | Nur 6 Treffer repo-weit, keine in den Supabase-Clients oder Casino-API-Routen — überschaubar |
| 8 | Pre-Commit-Type-Check-Hook | **Top 10 %** | 🟢 | Existiert real und funktioniert (`.husky/pre-commit` → `lint-staged` → `scripts/typecheck-staged.mjs`) — nur nicht in der Doku erwähnt |

**Größte Bottlenecks (treiben die Action Items in Abschnitt 4):** #1 ist die Wurzelursache für #5, #10 und einen Großteil von #4 — ein einziger, gezielter Fix (L1) hat den größten Hebel dieser gesamten Säule. #2 ist bereits Scope von Säule 2 L3, hier nur cross-referenziert, nicht doppelt gebaut. #3 ist ein eigener, unabhängiger Fund (aktiver Drift, nicht nur fehlende Automatisierung).

---

## 3 — Verifizierter Ist-Stand (2026-09-04, gegen echten Repo-Code geprüft)

**Wichtigster Fund — keiner der drei Clients ist an den generierten Typ gebunden:**
- [`src/utils/supabase/server.ts:7`](../src/utils/supabase/server.ts) — `createServerClient(url, key, {...})` **ohne** `<Database>`.
- [`src/utils/supabase/client.ts:19`](../src/utils/supabase/client.ts) — `createBrowserClient(url, key, {...})` **ohne** `<Database>`.
- [`src/utils/supabase/admin.ts:19`](../src/utils/supabase/admin.ts) — `createClient(url, key, {...})` **ohne** `<Database>`.
- Repo-weite Suche nach `Database>`/`Tables<` außerhalb der generierten Datei selbst: **0 Treffer.** Der generierte `Tables<>`-Helper (`src/types/database.types.ts:1890`) wird nirgends importiert.
- **Konsequenz:** Jeder `.from('users').select(...)`-Aufruf (z. B. [`src/app/api/casino/guide-persona/route.ts:30-34`](../src/app/api/casino/guide-persona/route.ts)) liefert implizit ungetypte Daten zurück — ohne dass ein sichtbarer `as any`-Cast im Code auftaucht. Das ist der Grund, warum die einfache `any`-Suche (Subkategorie #6) niedrig ausfällt, obwohl das eigentliche Typsicherheits-Niveau sehr niedrig ist: der Verlust an Typsicherheit ist **strukturell versteckt**, nicht sichtbar im Diff.

**Die dokumentierte CI-Gate-Behauptung ist fiktiv:** `docs/database/06_typsicherheit_typegen.md` Zeilen 135–145 beschreiben ein CI-Drift-Gate in `.github/workflows/ci.yml`, das `git diff --exit-code src/types/database.types.ts` ausführt. **Diese Datei existiert nicht** — `ls .github/workflows/` zeigt nur `dependency-audit.yml`, `doc-drift-check.yml`, `quality-ci.yml`, `red-team-security.yml`, `secret-scan.yml`, `security-staging.yml`. Kein Treffer für `database.types` in irgendeiner dieser Dateien. Gleiches Muster wie das fiktive Backup-Skript (Säule 9) und das fiktive Pooler-Health-Skript (Säule 8). **Dieser Meilenstein wird nicht hier, sondern in [`T_DATABASE/02_database_schema_design.md`](./02_database_schema_design.md) L3 real gebaut** — diese Datei verweist nur darauf.

**Aktiver Types-Drift, nicht nur theoretisch:** Die neueste Migration ist `supabase/migrations/063_user_wellbeing_limits.sql`. `src/types/database.types.ts` enthält **keinen** Treffer für "wellbeing" (case-insensitive). Der Drift ist also jetzt schon real, nicht nur ein Risiko für die Zukunft.

**Was bereits solide ist:**
- `strict: true` ist aktiv (`tsconfig.json:7`).
- Nur 6 `any`/`@ts-ignore`-Treffer repo-weit, keiner in den Supabase-Clients oder unter `src/app/api/casino/`.
- Ein echter Pre-Commit-Hook existiert und funktioniert: [`.husky/pre-commit`](../.husky/pre-commit) → `lint-staged` → [`scripts/typecheck-staged.mjs`](../scripts/typecheck-staged.mjs) (isolierter `tsc --noEmit` auf staged Dateien) — die Doku erwähnt nur `npm run typecheck` als CI-Befehl, nicht diesen real existierenden lokalen Hook.

---

## 4 — Meilensteine

### L1 — `createClient<Database>()` in allen 3 Clients binden · 🟢 verifiziert (2026-09-05)

- **Ziel:** Die Wurzelursache (Subkategorie #1) beheben — echte Typbindung statt impliziter `any`-Typisierung.
- **Schritte:**
  1. In `src/utils/supabase/client.ts`, `server.ts`, `admin.ts` jeweils `import type { Database } from '@/types/database.types';` ergänzen und den generischen Parameter an `createBrowserClient<Database>`/`createServerClient<Database>`/`createClient<Database>` übergeben.
  2. `npm run typecheck` ausführen und **jeden neu auftauchenden Fehler einzeln** beheben — nicht pauschal mit `as any` zudecken. Typische neue Fehler: `.data` ist jetzt korrekt typisiert und ein bisheriger impliziter `any`-Zugriff auf ein nicht existentes Feld schlägt fehl (das ist ein echter, vorher verdeckter Bug, kein neuer).
  3. Besonders sorgfältig prüfen: alle `.rpc(...)`-Aufrufe der Geld-RPCs (`settle_game_bet`, `start_game_round`, `advance_blackjack_round`) — deren Rückgabetyp wird jetzt zum ersten Mal echt geprüft.
- **Wichtiger Hinweis:** Diese Änderung ändert **kein Laufzeitverhalten** — TypeScript-Generics existieren nur zur Compile-Zeit. Trotzdem: vor Abschluss die volle Testsuite (`npm test`) laufen lassen, um sicherzustellen, dass keine der Korrekturen aus Schritt 2 versehentlich Laufzeitlogik verändert hat.
- **Verifizierung:** `npm run typecheck` läuft fehlerfrei durch; `grep -rn "createClient(" src/utils/supabase/ | grep -v Database` liefert keinen Treffer mehr ohne `<Database>`.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein (Compile-Time-Änderung). **Security-Review:** Pflicht — betrifft alle drei Client-Grenzen inkl. `admin.ts` (Service-Role), jede neu aufgedeckte Typabweichung muss einzeln bewertet werden, nicht pauschal weggecastet.

- **Umsetzung 2026-09-05:** Alle drei Clients gebunden (`server.ts:8` `createServerClient<Database>`, `client.ts:20` `createBrowserClient<Database>`, `admin.ts:20` `createClient<Database>`; jeweils `import type { Database }`). Genau die erwarteten ~28 Compile-Fehler in 8 Dateien, **jeder einzeln mit echtem Typ behoben, kein einziges `as any`**:
  - **Rein typgetriebene Korrekturen (NULL → undefined bei RPC-Args mit SQL-DEFAULT):** `admin/users/route.ts` (`p_balance`/`p_xp`/`p_level`/`p_rank`), `crash-round.ts` (`p_crashed_at`), `wallet.ts` (`p_server_seed_hash`, `p_nonce`). `undefined` lässt postgrest-js das Feld beim Serialisieren weg → Server-Default `NULL` greift (identisches Laufzeitverhalten, dokumentiert in den Aufrufstellen). Der exakte RPC-Kontrakt-Test in `wallet.test.ts` wurde auf den neuen Vertrag aktualisiert.
  - **Echte, vorher verdeckte Typlücken mit echten Fixes:**
    - `admin/users/route.ts`: `admin_update_user` gibt freies `jsonb` zurück — Rückgabe wird jetzt vertraglich per Zod (`adminUpdateUserResultSchema`) verschärft, fail-closed mit 500 bei Abweichung (statt impliziter `any`-Feldzugriffe auf `data.replayed`/`data.user`/`data.transactionId`).
    - `pgvector-store.ts`: pgvector wird von PostgREST als String-Literal transportiert (generierter Typ: `string`), App-Typ: `number[]` — neue Deterministiker `toPgVectorLiteral()`/`fromPgVectorLiteral()` koppeln beide Welten statt des vorher stillen Typverlusts beim `match_guide_documents`-RPC und bei Upsert/List.
    - `wallet.ts`/`risk-event-store.ts`/`trigger/admin-analytics-snapshot.ts`: `Record<string, unknown>` → generierter `Json`-Typ über neuen Helper `toJsonValue()` (`src/lib/casino/json-value.ts`, JSON-Roundtrip = exakt die Serialisierung, die postgrest-js ohnehin sendet).
    - `admin/overview/route.ts` + `user/history/route.ts`: nullable Timestamp-Handling jetzt explizit (Transaktionen ohne `created_at` werden übersprungen statt `Invalid Date` zu erzeugen).
  - **Bekannte Typegen-Lücke dokumentiert:** `get_user_history_page` (Migration 061) behandelt NULL-Cursor als "erste Seite", hat aber keine SQL-Defaults — der generierte Arg-Typ bildet `string | null` nicht ab. Cast auf den exakten generierten Args-Typ mit Erklärung an der Aufrufstelle (`user/history/route.ts`), kein `as any`.
- **Verifikation:** `npm run typecheck` grün; `npm test` 199 Dateien / 1524 Tests grün (1 RPC-Kontrakttest bewusst auf neuen Vertrag aktualisiert); Grep-Beleg oben.

### L2 — Doku-Korrektur · 🟢 verifiziert (2026-09-05)

- **Ziel:** `docs/database/06_typsicherheit_typegen.md` an den echten Zustand angleichen.
- **Schritte:**
  1. Status-Header präzisieren (Doku-Qualität ≠ System-Reifegrad, analog zu allen anderen bereits korrigierten Säulen).
  2. Zeilen 135–145 (fiktives `.github/workflows/ci.yml`-Gate) durch einen Verweis auf `T_DATABASE/02_database_schema_design.md` L3 ersetzen, sobald das dort real existiert.
  3. Den real existierenden, aber nicht dokumentierten Husky-Pre-Commit-Hook (`scripts/typecheck-staged.mjs`) als tatsächliche lokale Absicherung ergänzen — das ist eine echte Stärke, die bisher unter dem Radar lief.
  4. Nach L1: die Behauptung "alle drei Clients nutzen `createClient<Database>(...)`" ist dann erstmals tatsächlich wahr — Zeilenverweise entsprechend aktualisieren.
- **Verifizierung:** `grep -n "ci.yml" docs/database/06_typsicherheit_typegen.md` liefert keinen Treffer mehr ohne Verweis auf die reale Datei.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05:** Header auf "verifiziert gegen echten Code" mit Doku≠System-Hinweis korrigiert; fiktives `ci.yml`-Gate in Abschnitt 5 durch die zwei realen Schranken ersetzt (`schema-drift-check.yml` mit kanonischem `--local`-Befehl + Husky-Pre-Commit-Hook `typecheck-staged.mjs`); Abschnitt 3 auf die reale `users`-Tabelle korrigiert (fiktive `wallets`-Tabelle entfernt, Verweis auf keine separate Wallet-Tabelle); Abschnitt 4 als seit L1 wahr markiert; Abschnitt 7 (Befehle) auf `--local` umgestellt. Verifiziert: einzige verbleibende `ci.yml`-Erwähnung ist die korrigierende mit Link auf die reale Workflow-Datei.

### L3 — Aktiven Types-Drift schließen · 🟢 verifiziert (2026-09-05)

- **Ziel:** Den in Abschnitt 3 bestätigten aktiven Drift (fehlende `wellbeing`-Tabelle) beheben.
- **Schritte:** `npm run supabase:types` ausführen (gegen `--linked`, damit die Types dem echten Remote-Schema entsprechen), Diff prüfen, `src/types/database.types.ts` committen.
- **Verifizierung:** `grep -i "wellbeing" src/types/database.types.ts` liefert nach dem Lauf einen Treffer.
- **Freigabe-Gate:** Keines (K1, read-only Typgenerierung laut bestehender K-Matrix in `docs/database/00_DATABASE_OVERVIEW.md` Abschnitt 7). **Money-Pfad:** Nein. **Security-Review:** Nein.
- **Umsetzung 2026-09-05:** Regenerierung mit dem kanonischen Befehl `npx supabase gen types typescript --local` statt des geplanten `npm run supabase:types` (`--linked`) — konsistent mit `schema-drift-check.yml` (Baseline ist die lokale Migration-Kette) und mit der in L2 korrigierten Doku §7; ein `--linked`-Lauf hätte Drift gegen die CI-Baseline erzeugt (bekanntes Residuum: `supabase:types`-Script nutzt weiterhin `--linked`). Diffinhalt: `user_wellbeing_limits` (Migration 063), `background_job_runs`, neue Outbox-Spalten (`dead_letter_alerted_at`, `dispatch_attempts`) — genau der aufgelaufene Schema-Drift. Technischer Stolperstein: PowerShell-`>`-Redirect schreibt UTF-16 (Datei verdoppelte sich auf 116 kB); behoben via `cmd /c`-Redirect, der die UTF-8-Rohbytes von npx durchreicht — identisches Encoding wie der CI-Lauf. Verifiziert: `wellbeing`-Treffer in der Datei (Zeilen 1249/1273), `npm run typecheck` grün, `npm test` 199 Dateien / 1524 Tests grün. Commit bewusst nicht ausgeführt (globale No-Commit-Regel; Commit/Push = K4).

### L4 — Row/Insert/Update-Typnutzung an Schreibpfaden nachrüsten

- **Ziel:** Jetzt, wo L1 den Typ bindet, prüfen ob Schreibpfade den korrekten `Insert`/`Update`-Typ statt eines losen Objekts verwenden.
- **Schritte:** Stichprobe von 3–4 API-Routen mit Schreibzugriff (z. B. unter `src/app/api/casino/`, `src/app/api/admin/`) nach L1 erneut prüfen — TypeScript zeigt jetzt automatisch, wo ein `.insert(...)`/`.update(...)`-Aufruf nicht zum generierten `Insert`/`Update`-Typ passt. Jede Fundstelle einzeln korrigieren (echten Typ verwenden, keine `as any`-Flucht).
- **Verifizierung:** `npm run typecheck` bleibt grün, Stichprobe zeigt explizite `Database['public']['Tables'][...]['Insert']`-Nutzung oder äquivalente Typinferenz statt loser Objektliterale.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein (Compile-Time). **Security-Review:** Nein (Fortsetzung von L1, kein neuer Scope).
- **Umsetzung 2026-09-05:** Repo-weite Stichprobe: unter `src/app/api/**` existieren genau zwei direkte Schreibpfade — `admin/promo-codes/route.ts:128` (`.insert()` auf `promo_codes`) und `casino/guide-persona/route.ts:84` (`.update()` auf `users`); alle anderen Schreibvorgänge laufen über die Geld-RPCs (L1/L5-Abdeckung). Beide nutzen Inline-Objektliterale, die seit L1 per **äquivalenter Typinferenz** von postgrest-js gegen die generierten `Insert`/`Update`-Typen geprüft werden (plan-konforme Variante statt expliziter Typ-Annotation). Negativtest zur Echtheitsverifikation: temporäre Probe-Datei mit `nonexistent_column` gegen `Database['public']['Tables']['promo_codes']['Insert']` erzeugte den erwarteten `TS2353`-Fehler (Probe danach gelöscht, Typecheck wieder grün) — die Typbindung greift real, keine Korrekturen nötig.

### L5 — RPC-Rückgabewerte typisieren

- **Ziel:** Subkategorie #10 schließen — `.rpc(...)`-Aufrufe der Geld-RPCs sollen tatsächlich den dokumentierten `WalletSnapshot`-Rückgabetyp tragen, nicht nur implizit.
- **Schritte:** Für `settle_game_bet`, `start_game_round`, `advance_blackjack_round`: den generischen Rückgabetyp aus `Database['public']['Functions'][...]['Returns']` (vom generierten Typ, jetzt durch L1 verfügbar) mit dem bestehenden `WalletSnapshot`-Zod-Schema (`walletSnapshotSchema`, siehe `xx_docs/07_state_store_context.md`) abgleichen — beide sollten strukturell übereinstimmen; bei Abweichung dokumentieren, ob das Zod-Schema oder der generierte Typ die aktuellere Wahrheit ist.
- **Verifizierung:** Aufrufstellen der drei RPCs zeigen nach der Änderung einen konkreten, nicht-`any`-Rückgabetyp in der IDE/`tsc`-Ausgabe.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein (Compile-Time). **Security-Review:** Pflicht (Geld-RPC-Rückgabewerte).
- **Umsetzung 2026-09-05:** Strukturabgleich der drei Geld-RPCs (`settle_game_bet`, `start_game_round`, `advance_blackjack_round`):
  - **Generierter Typ:** Alle drei haben `RETURNS jsonb` → `Returns: Json` in `database.types.ts` (Typegen kann die innere jsonb-Struktur nicht introspektieren — struktureller Abgleich mit dem Zod-Schema ist am generierten Typ allein nicht möglich).
  - **Zod-Seite:** `rpcWalletSchema` (`src/lib/casino/wallet.ts:15`, seit L3-Edit mit Vertrag-Kommentar) ist eine strikte Obermenge von `walletSnapshotSchema` (5 Felder identisch, zusätzlich `result`/`replayed`; `z.coerce.number()` weil PL/pgSQL numeric in jsonb als String serialisieren kann) plus `roundStartSchema`/`blackjackActionSchema` für die Round-Varianten.
  - **Abweichung + Wahrheit:** Der generierte `Json`-Typ ist bewusst die losere Seite; die **Zod-Schemas sind die aktuellere, verbindliche Wahrheit** (fail-closed `parse()` an jeder Aufrufstelle: `walletFromRpc()` für `settle_game_bet`/`settle_game_round`, `roundStartSchema.parse()` für `start_game_round`, `blackjackActionSchema.parse()` für `advance_blackjack_round`). Vertrags-Kommentar an `rpcWalletSchema` dokumentiert dies dauerhaft.
  - **Verifikation:** Temporäre Typ-Probe gegen den `settle_game_bet`-Rückgabetyp: `0 extends 1 & D` evaluates zu `false` (D ist nicht `any`) und `D extends Json` zu `true` (D ist konkret `Json`) — Probe kompilierte grün und wurde danach gelöscht. `npm run typecheck` grün, `npm test` 199 Dateien / 1524 Tests grün.
- **Review-Ergebnis (code-reviewer + security-reviewer, 2026-09-05):** Beide `PASS`/`APPROVE` — 0 CRITICAL, 0 HIGH; Security: keine Secrets, keine Injection-Fläche (pgvector-Literal reist als getypter Parameter), Fail-closed-Pfade intakt, Auth/Rate-Limits unverändert. Zwei MEDIUM-Funde wurden direkt behoben:
  1. **pgvector-Bracket-Regex war ein No-op** (`/[[]]/g` matchte nur `[]`, Stripping passierte nie → Parsen eines echten Vektor-Literals hätte erste/letzte Komponente still verworfen): Regex zu `/[\[\]]/g` korrigiert + Regressionstest mit echtem Literal `'[0.1,0.23,-0.456]'` → `[0.1, 0.23, -0.456]`.
  2. **`autoReconcileStaleCrashRound` behandelte ein fehlgeschlagenes Settlement-RPC als Erfolg** (supabase-js wirft bei RPC-Fehlern nicht; Racing-RESOLVE_CRASH hätte einen falschen „Auto-reconciled“-Erfolg geloggt): `{ error }` wird jetzt destrukturiert, fail-closed `return false` mit Warn-Log.
  Verbleibende Hinweise ohne Fix (dokumentiert, keine Blocker): fabrizierter `crashPoint: 1.0` im Reconcile-Result ist bewusste Policy (Payout 0 ökonomisch korrekt; Derivation aus Round-State wäre Money-Pfad-Änderung außerhalb dieses Scopes); Ad-hoc-Error-Codes in `user/history/route.ts` und fehlender Zod-Error im Admin-Update-Log sind LOW/Polish. `npm test` nach den Fixes: 199 Dateien / 1525 Tests grün.

---

## 5 — Definition of Done

1. Alle drei Supabase-Clients sind echt an `Database` gebunden, `npm run typecheck` läuft grün (L1).
2. Die Doku beschreibt keine fiktive CI-Automatisierung mehr, sondern verweist korrekt auf Säule 2 und den real existierenden Husky-Hook (L2).
3. `database.types.ts` enthält alle aktuellen Tabellen, kein aktiver Drift mehr (L3).
4. Schreibpfade nutzen nachweislich die generierten `Insert`/`Update`-Typen (L4).
5. Die drei Geld-RPCs haben einen konkreten, geprüften Rückgabetyp (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber Säule 2 (`T_DATABASE/02_database_schema_design.md`, Schema-Drift-CI-Gate) klar abgegrenzt: Diese Datei baut **kein** CI-Gate, sondern behebt die Client-Typbindung selbst — beide Lücken sind unabhängig voneinander real (bestätigt durch gezielte Nachfrage beim Explorer-Agent während der Recherche).
- [x] Abhängigkeiten benannt: L1 vor L4 und L5 (beide brauchen die gebundene Typinfrastruktur aus L1); L2 und L3 unabhängig, können parallel laufen.
- [x] Neue Schreiboperation: keine — nur Typ-Level-Änderungen und eine Type-Regenerierung (L3, read-only K1).
- [x] Statusbehauptungen sind als lokal/verifiziert gekennzeichnet (Abschnitt 3, Datum 2026-09-04) und verlinken auf Quellcode/Zeilen; die widerlegte Doku-Behauptung (fiktives CI-Gate) ist mit `ls`-Beleg widerlegt, nicht nur vermutet.
- [x] Keine Referenz doppelt gepflegt: Das Schema-Drift-CI-Gate bleibt einzig Scope von Säule 2, hier nur verlinkt.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 2 + 3 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Kritischer Selbstcheck:** L1 wird zwangsläufig neue TypeScript-Fehler aufdecken — das wurde explizit als *erwartetes, gewolltes* Verhalten dokumentiert (Abschnitt 0 Punkt 3), damit eine ausführende LLM-Instanz nicht fälschlich denkt, sie hätte etwas kaputt gemacht und die Änderung zurückrollt.

---

## 7 — Verwandte Artefakte

| Bedarf | Datei |
| --- | --- |
| Kanonischer Doku-Standard (Säule 6) | [`docs/database/06_typsicherheit_typegen.md`](../docs/database/06_typsicherheit_typegen.md) — wird in L2 korrigiert |
| Schema-Drift-CI-Gate (separater, abgegrenzter Plan) | [`T_DATABASE/02_database_schema_design.md`](./02_database_schema_design.md) L3 |
| Wallet-Snapshot-Vertrag (für L5-Abgleich) | [`xx_docs/07_state_store_context.md`](../xx_docs/07_state_store_context.md) |
| Bestehender Pre-Commit-Hook | [`.husky/pre-commit`](../.husky/pre-commit), [`scripts/typecheck-staged.mjs`](../scripts/typecheck-staged.mjs) |
| Gewichtete Subkategorien-Bewertung (Kategorie 02, alle 10 Säulen) | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md) |
| Übergeordnete Aufschlüsselung (Kategorie 02) | [`worldmap/04_datenbank_migrationen.md`](../worldmap/04_datenbank_migrationen.md) |
| Planungsdateien-Konvention | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) |
