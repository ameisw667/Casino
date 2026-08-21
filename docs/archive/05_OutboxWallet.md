# 05 — Outbox Wallet-Nebenwirkungen (Option B: pg_net Push-Consumer)

> **Status:** Executed (archiviert) · **Stand:** 2026-08-21 · **Owner:** Jan/LLM · **Scope:** XP-Gain aus `settle_game_bet`/`settle_game_round`/`advance_blackjack_round` entkoppeln. Achievement-Check bleibt unverändert client-seitig (siehe §0). Kein Cross-Game-Event-Bus, keine Notifications — das ist 4.3, separat.

Referenz: Roadmap-Punkt 4.1 in [`worldmap/05_ZUKUNFTSPLANUNG.md`](../../worldmap/05_ZUKUNFTSPLANUNG.md#41--outbox-pattern-für-wallet-nebenwirkungen), Risiko R12.

---

## 0 — Vorab geklärte Architektur-Entscheidungen

Zwei Rückfragen vor Planbeginn beantwortet (Chat, 2026-08-21):

| Frage | Antwort | Begründung |
|---|---|---|
| Outbox-Scope | **Nur XP-Gain.** Achievement-Check bleibt client-berechnet (`applyAchievementProgress`, [useCasinoStore.ts:514](../../src/store/useCasinoStore.ts#L514)) + Fire-and-Forget-POST an `/api/user/stats`, unverändert. | Achievement-Check ist **heute bereits** client-seitig entkoppelt (kein Server-Coupling im Money-Pfad) — nur XP-Gain ist inline in den Settlement-RPCs. Eine Server-Migration von `applyAchievementProgress` ist ein eigenständig großer Umbau, gehört nicht in diesen ersten Schritt (YAGNI). |
| XP-Zustellung an Client | **Polling von `/api/user/balance`** nach jedem Bet. | Kein neuer Realtime-Kanal nötig, kleinste Fläche, nutzt bestehenden Endpoint. Realtime-Push kann sauberer nachgezogen werden, falls 4.3 (Event-Bus) ohnehin einen zentralen Kanal für mehrere Consumer baut. |

**Bekannte, akzeptierte Einschränkung:** `applyAchievementProgress` liest `state.level` synchron beim Settlement (Zeile 510). Solange der XP-Poll noch nicht gelandet ist, prüft ein level-gates Achievement (z. B. „Level 10 erreichen") gegen den **alten** Level. Erst der nächste Bet nach erfolgreichem Poll evaluiert korrekt. Kosmetischer Randfall (max. eine Bet-Verzögerung), keine Geld- oder Sicherheitsauswirkung — nicht Teil dieses Scopes, ggf. Folgepunkt bei einer künftigen Server-Migration von Achievements.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
|---|---|---|---|---|
| L0 | Optionswahl + Architektur-Klärung | 🟢 Executed | — | Jan + LLM |
| L1 | Migration 036: `wallet_events`-Tabelle, `apply_xp_gain`, Trigger, pg_cron-Backstop | 🟢 Executed | — | LLM |
| L2 | Settlement-RPCs umbauen (XP-Write raus, Event-Insert rein) | 🟢 Executed | — | LLM |
| L3 | Neue Route `POST /api/internal/wallet-events` + Proxy-Exemption | 🟢 Executed | — | LLM |
| L4 | Client-Polling in `useCasinoStore.ts` | 🟢 Executed | — | LLM |
| L5 | Tests (Migrations-Assertions, Route-Auth, Proxy-Exemption) | 🟢 Executed | — | LLM |
| L6 | Security-Review (Pflicht, R12) | 🟢 Executed | — | LLM |
| L7 | Vault-Secret `wallet_event_secret` anlegen | 🟢 Executed | — | Jan |
| L8 | `WALLET_EVENT_SECRET` in Vercel + `.env.local` setzen | 🟢 Executed | — | Jan |
| L9 | Migration 036 auf Remote-Projekt anwenden | 🟢 Executed | — | Jan |
| L11 | **Korrektur:** Migration 037 (Jackpot-Regression durch 036 behoben, s. §6) | 🟢 Executed | — | LLM + Jan |
| L10 | Live-Verifikation (Testbet, `wallet_events`-Tabelle, XP-Anstieg im UI) | 🟢 Executed | — | Jan |

---

## 2 — Architektur

### 2.1 Heutiger Zustand (Ist, vor dieser Initiative)

`settle_game_bet` / `settle_game_round` / `advance_blackjack_round` (alle in [007_server_authority.sql](../../supabase/migrations/007_server_authority.sql)) schrieben Balance **und** XP/Level/Rank in derselben Transaktion, advisory-locked auf `user_id`. Die Antwort enthielt den frisch berechneten XP/Level-Stand, den der Client synchron über `applyServerWalletSnapshot()` übernahm ([useCasinoStore.ts:368](../../src/store/useCasinoStore.ts#L368)).

### 2.2 Zielzustand (Soll, umgesetzt)

1. Settlement-RPCs schreiben **nur noch Balance**. Statt XP inline zu berechnen, fügen sie bei `p_xp_gain > 0` eine Zeile in `wallet_events` ein (`ON CONFLICT DO NOTHING`, idempotent über `(user_id, request_id, event_type)`).
2. Ein `AFTER INSERT`-Trigger auf `wallet_events` feuert **asynchron** (pg_net queued, blockiert die Settlement-Transaktion nicht) einen `POST` an eine neue interne Route, Shared-Secret-authentifiziert (exakt das Muster aus `/api/internal/cron-alert`, [027](../../supabase/migrations/027_guide_telemetry_purge_cron.sql)).
3. Die Route ruft eine neue RPC `apply_xp_gain(event_id)` auf, die XP/Level/Rank schreibt und das Event als `processed_at` markiert — advisory-locked auf denselben `user_id`-Lock-Domain wie die Settlement-RPCs (verhindert Race zwischen einem neuen Bet und der asynchronen XP-Anwendung).
4. Ein `pg_cron`-Job (alle 2 Minuten, bereits produktive Extension seit [027](../../supabase/migrations/027_guide_telemetry_purge_cron.sql)) ruft `apply_xp_gain` **direkt** (kein HTTP) für alle seit >2 Min unverarbeiteten Events auf — Backstop, falls `pg_net`/Route ausfällt. Bei ≥5 Fehlversuchen: Alert über den bestehenden `cron-alert`-Kanal (Sentry).
5. Der Client pollt nach jedem Bet kurz `/api/user/balance`, bis der neue XP/Level-Stand ankommt (max. 5 Versuche, 1,2 s Abstand, gebündelt über mehrere schnelle Bets hinweg).

### 2.3 Sequenzdiagramm (Textform)

```
Client → POST /api/casino/bet
  → WalletService.settleBet() → RPC settle_game_bet()
      [advisory lock user_id]
      UPDATE users SET balance = ...           (kein XP mehr hier)
      INSERT wallet_transactions (...)
      INSERT wallet_events (xp_gain, request_id, processed_at=NULL)
      → TRIGGER notify_wallet_event()
          → net.http_post() [async, non-blocking, swallowed on error]
      COMMIT
  ← Response: balance (neu), xp/level/rank (ALT, unverändert) ← bewusst
Client ← zeigt neue Balance sofort, XP-Bar bleibt vorerst unverändert

[wenige ms–1s später, außerhalb der Bet-Transaktion]
pg_net → POST /api/internal/wallet-events {eventId}
  → RPC apply_xp_gain(eventId)
      [advisory lock user_id — gleiche Lock-Domain]
      UPDATE users SET xp = ..., level = ..., rank = ...
      UPDATE wallet_events SET processed_at = now()

Client (parallel, seit Bet-Response) → pollt GET /api/user/balance
  alle 1,2s, max 5x → sobald xp/level abweicht: applyServerWalletSnapshot()
  → XP-Bar/Level-Up-Overlay aktualisiert sich mit ~1-6s Verzug

[Backstop, falls pg_net/Route ausfällt]
pg_cron (alle 2 Min) → SELECT unprocessed wallet_events älter als 2 Min
  → ruft apply_xp_gain() direkt auf (kein HTTP-Umweg)
  → bei ≥5 Fehlversuchen: Alert via bestehenden cron-alert-Kanal
```

---

## 3 — Detailplan je Meilenstein

### L1+L2 — Migration `036_wallet_events_outbox.sql`

- **Ziel:** XP-Gain aus dem Settlement-kritischen Pfad lösen, ohne die Balance-Logik anzufassen.
- **Nutzen:** Neue Nebenwirkungen (z. B. spätere Notifications, 4.3) können künftig an derselben Outbox andocken, ohne den Money-Pfad je wieder zu berühren.
- **Scope — neue Objekte:**
  - Tabelle `wallet_events(id, user_id, request_id, event_type, xp_gain, processed_at, attempts, last_error, created_at)`, `UNIQUE(user_id, request_id, event_type)`, RLS enabled, kein Grant an `anon`/`authenticated` (Muster: `game_rounds`, [007:17-33](../../supabase/migrations/007_server_authority.sql#L17-L33)).
  - Funktion `apply_xp_gain(p_event_id UUID) RETURNS JSONB` — `SECURITY DEFINER`, `search_path = public, pg_temp`, advisory-locked, idempotent (No-Op bei bereits `processed_at`), schreibt `attempts`/`last_error` bei Fehlern **ohne** die Transaktion abzubrechen (verschachteltes `BEGIN...EXCEPTION`, kein `RAISE` nach außen — sonst würde der Fehlerzähler mit zurückgerollt).
  - Funktion `notify_wallet_event()` als `AFTER INSERT`-Trigger auf `wallet_events` — `net.http_post` an `/api/internal/wallet-events`, Secret aus `vault.decrypted_secrets` (`wallet_event_secret`, **neuer, dedizierter** Secret-Name — nicht `cron_alert_secret` wiederverwenden, andere Blast-Radius-Klasse). Kompletter Body in `EXCEPTION WHEN OTHERS THEN NULL` — darf die Settlement-Transaktion niemals blockieren.
  - Funktion `retry_stale_wallet_events()` + `cron.schedule('wallet-events-retry', '*/2 * * * *', ...)` — Backstop, ruft `apply_xp_gain` direkt auf (kein HTTP), alertet über den **bestehenden** `cron_alert_secret`-Kanal bei ≥5 Fehlversuchen (echte Ops-Alerting-Wiederverwendung, kein neuer Zweck).
- **Scope — geänderte Objekte (`CREATE OR REPLACE`, gleiche Signatur, kein Drop):**
  - `settle_game_bet`, `settle_game_round`, `advance_blackjack_round`: `UPDATE users` verliert `xp/level/rank`-Spalten; `v_response` liefert `v_user.xp/level/rank` (Stand **vor** diesem Bet, unverändert) statt neu berechneter Werte; zusätzlicher `INSERT INTO wallet_events` bei `p_xp_gain > 0` (bei `advance_blackjack_round` zusätzlich `AND p_settled`).
  - `start_game_round` bleibt unverändert (schreibt nie XP).
- **Datenklassen:** Keine neuen personenbezogenen Daten. `wallet_events.xp_gain` ist ein abgeleiteter Spielwert, kein Geldbetrag.
- **Abhängigkeiten:** `pg_cron`/`pg_net` (bereits aktiv seit [027](../../supabase/migrations/027_guide_telemetry_purge_cron.sql)), Advisory-Lock-/Idempotenz-Pattern aus [007](../../supabase/migrations/007_server_authority.sql) (wiederverwendet, kein neues Muster), `casino_xp_level_divisor()` aus [010_dynamic_xp_divisor.sql](../../supabase/migrations/010_dynamic_xp_divisor.sql) für die Level-Berechnung in `apply_xp_gain` (Security-Review deckte einen ersten Entwurfsfehler auf, bei dem `apply_xp_gain` versehentlich den alten hartcodierten `/100`-Divisor statt dieser Funktion nutzte — vor Fertigstellung korrigiert, Regressionstest ergänzt).
- **Money-Pfad:** Teilweise — Balance-Logik selbst unverändert, aber derselbe kritische Code-Pfad wird editiert.
- **Security-Review:** Pflicht (R12).
- **Freigabe-Gate:** Security-Reviewer-Agent ohne CRITICAL-Finding, bevor die Migration auf das Remote-Projekt angewendet wird (L9, Jans manueller Schritt — kein automatischer Push auf die Live-DB durch die LLM-Seite).
- **Verifizierung:**
  - Automatisiert: `src/lib/casino/__tests__/wallet-events-outbox-migration.test.ts` (Muster: [wallet-migration.test.ts](../../src/lib/casino/__tests__/wallet-migration.test.ts)) — prüft per String-Assertion auf die SQL-Datei: Tabelle, Unique-Constraint, `apply_xp_gain`, Trigger, `cron.schedule`, REVOKE/GRANT auf `service_role`.
  - Manuell (Jan, lokal via `supabase start`, vor L9): Idempotenz — `apply_xp_gain` zweimal auf dasselbe Event aufrufen, zweiter Aufruf liefert `alreadyProcessed: true`, XP nur einmal gutgeschrieben. Backstop — Route-Secret absichtlich falsch setzen, prüfen dass `retry_stale_wallet_events()` das Event nach 2 Minuten trotzdem verarbeitet. Settlement-Latenz — `settle_game_bet` bleibt in derselben Größenordnung wie vor der Migration (ein zusätzlicher Insert, keine zusätzliche Berechnung).
- **Nicht-Scope:** Kein Cross-Game-Event-Bus (4.3), keine Notifications, keine Achievement-Server-Migration, keine Realtime-Subscription.

### L3 — Route `POST /api/internal/wallet-events` + Proxy-Exemption

- **Ziel:** Empfängt den `pg_net`-Push, wendet `apply_xp_gain` an.
- **Scope — neue Dateien:** `src/app/api/internal/wallet-events/route.ts` — Shared-Secret-Auth (`x-wallet-event-secret`, `timingSafeEqual`, exaktes Muster aus [cron-alert/route.ts](../../src/app/api/internal/cron-alert/route.ts)), Zod-Body `{ eventId: z.string().uuid() }`, ruft `supabase.rpc('apply_xp_gain', { p_event_id })` über den Admin-Client auf. `success: false` in der RPC-Antwort → HTTP 500 (Backstop-Cron übernimmt); `alreadyProcessed: true` oder `success: true` → HTTP 200.
- **Scope — geänderte Dateien:** `src/proxy.ts` — `/api/internal/wallet-events` zur `PUBLIC_ROUTES`-Matcher-Liste und zum `isWebhook`-Check hinzugefügt — sonst blockiert der Origin-Check den `pg_net`-Request (kein Browser-Origin-Header, gleiche Ausnahme wie `cron-alert`/`telegram/webhook`).
- **Money-Pfad:** Nein (nur XP/Level, keine Balance).
- **Security-Review:** Pflicht (neue Auth-Boundary).
- **Freigabe-Gate:** Route-Auth-Tests grün, Security-Reviewer ohne CRITICAL.
- **Verifizierung:** `src/lib/security/__tests__/wallet-events-route.test.ts` (Muster: [cron-alert-route.test.ts](../../src/lib/security/__tests__/cron-alert-route.test.ts)) — fehlendes/falsches Secret → 401; gültiges Secret + unbekannte Event-ID → RPC-Fehlerpfad → 500; gültiges Secret + bereits verarbeitetes Event → 200. Ergänzung in [proxy-routing.test.ts](../../src/lib/security/__tests__/proxy-routing.test.ts) für die neue Route.
- **Nicht-Scope:** Kein Public-Facing-Endpoint, keine Nutzung durch den Browser-Client.

### L4 — Client-Polling in `useCasinoStore.ts`

- **Ziel:** UI zeigt den asynchron verarbeiteten XP/Level-Stand innerhalb weniger Sekunden, ohne neue Infrastruktur.
- **Scope:** Modul-lokale `scheduleXpSync()`-Funktion (gleiches Pattern wie das bestehende modul-lokale `processedResultIds`-Set in dieser Datei) — `setInterval`, 1,2 s Abstand, max. 5 Versuche, ruft `GET /api/user/balance` und `applyServerWalletSnapshot()` auf. Jeder neue Bet setzt das Versuchsbudget zurück statt einen zweiten Timer zu starten (bündelt Autobet-Serien). Aufruf aus `processGameResult()`, direkt nach dem bestehenden `set(...)`-Block.
- **Money-Pfad:** Nein.
- **Security-Review:** Nein (liest nur einen bestehenden, bereits Auth-geschützten Read-Endpoint).
- **Freigabe-Gate:** Keins — reine Client-Ergänzung, kein neuer Schreibpfad.
- **Verifizierung:** Manueller Dev-Server-Check — Bet auslösen, XP-Bar aktualisiert sich innerhalb ~6s ohne Page-Reload.
- **Nicht-Scope:** Keine Supabase-Realtime-Subscription (siehe §0), kein Exponential-Backoff (fixes Intervall reicht für 5 Versuche über 6s).

---

## 4 — Execution-Selbstprüfung (Schritt 4)

- [x] `npm run lint` — 0 Errors, nur bestehende, unveränderte Warnings in nicht berührten Dateien.
- [x] `npx tsc --noEmit` — sauber.
- [x] `npm run test` — 730/730 grün (86 Suiten), inkl. `wallet.test.ts`, `wallet-migration.test.ts`, `proxy-routing.test.ts` unverändert grün, plus 5 neue Suiten (13 neue Tests).
- [x] `npm run vibe-check` — durchgelaufen, einziger Fund (`InteractiveArcadeGrid.tsx`, Inline-Shadow) ist bestehend und nicht Teil dieser Änderung.
- [x] Diff gegen §3 geprüft — eine Abweichung gefunden und korrigiert (siehe Security-Review-Fund unten).
- [x] `security-reviewer`-Agent-Ergebnis: **1 HIGH, 1 LOW, kein CRITICAL.**
  - **HIGH (behoben):** `apply_xp_gain` nutzte versehentlich den alten hartcodierten `/100`-Divisor statt `casino_xp_level_divisor()` aus [010_dynamic_xp_divisor.sql](../../supabase/migrations/010_dynamic_xp_divisor.sql) — hätte bei einer künftigen Anpassung des Divisors in `game_configs` zu falschem Level/Rank geführt (VIP-Rang-Anzeige betroffen, keine Geld-Auswirkung). Fix in Migration 036 (Zeile mit `v_level :=`), Regressionstest ergänzt (`wallet-events-outbox-migration.test.ts`).
  - **LOW (bewusst zurückgestellt):** `retry_stale_wallet_events()` hält pro Batch-Durchlauf (max. 200 Events) die Advisory-Locks der betroffenen User bis Transaktionsende — kann einen zeitgleichen Bet dieser User kurz verzögern, wenn der Backstop läuft (nur relevant, wenn der Push-Pfad bereits fehlgeschlagen ist). Keine Korrektheits- oder Geld-Auswirkung, keine Aktion nötig, außer Latenz wird in der Praxis beobachtet.
  - Explizit als korrekt verifiziert: Secret-Auth (fehlender Header, falsche Länge, Browser-Origin), Balance-Isolation (kein Überschneiden mit `settle_game_bet`), Idempotenz (Replay über `wallet_transactions`-Request-ID-Check + `wallet_events`-Unique-Constraint + `apply_xp_gain`-`processed_at`-Check dreifach abgesichert), Grants (alle neuen Funktionen `service_role`-only), keine Injection-Fläche, keine Fehlerdetail-Leaks in der Route.

---

## 5 — Plan-Selbstprüfung (Schritt 2, Pflicht vor „Execution-Ready")

- **Reihenfolge/Abhängigkeiten:** L1+L2 (Migration) muss vor L3 (Route ruft `apply_xp_gain`) stehen; L3 vor L9 (Remote-Deploy); L7/L8 (Secrets) vor L9. In §1 so nummeriert. ✅
- **Datenzugriff/Allowlist:** Alle neuen Funktionen `REVOKE ALL ... FROM PUBLIC, anon, authenticated` + `GRANT ... TO service_role` (Migration 036, wie 007). Negativtest: Route lehnt fehlendes/falsches Secret ab (L3-Verifizierung). ✅
- **Ausgeschlossene Folgefunktionen markiert:** Achievement-Server-Migration, Realtime-Push, Event-Bus (4.3) explizit als Nicht-Scope in §0 und je Meilenstein genannt, nicht als impliziter Folgeschritt. ✅
- **Keine widersprüchliche Scope-Aussage:** Diese Datei ersetzt die 4.1-Kurzbeschreibung in `05_ZUKUNFTSPLANUNG.md` nicht, sondern konkretisiert sie. ✅
- **Money-Pfad/Security-Review-Felder** je Wallet-nahem Meilenstein gesetzt (L1+L2, L3). ✅

**Ergebnis:** Plan war vollständig, konsistent, keine offenen Architektur-Fragen.

---

## 6 — Abschluss (Schritt 5)

L1–L6 (LLM) und L7–L10 (Jan) vollständig durchgeführt und verifiziert. **Zusätzlich gefunden und korrigiert: eine Regression, die Migration 036 selbst verursacht hat.**

### 6.1 — Jackpot-Regression durch Migration 036 (gefunden bei L10, korrigiert durch Migration 037)

`settle_game_bet` existiert in der DB als **zwei Overloads**: die ursprüngliche 8-Parameter-Version aus [007](../../supabase/migrations/007_server_authority.sql) und eine 10-Parameter-Version (zusätzlich `p_server_seed_hash`, `p_nonce`), die [034_progressive_jackpot_trigger.sql](../../supabase/migrations/034_progressive_jackpot_trigger.sql) eingeführt hat. `WalletService.settleBet()` sendet immer beide Zusatzparameter — PostgREST löst den Aufruf daher immer zur 10-Parameter-Version auf. Migration 036 wurde gegen den ursprünglichen 007-Stand entworfen (vor den Jackpot-Migrationen 032–035) und hat:

- die 8-Parameter-Version geändert — wirkungslos, da nie aufgerufen (totes Overload).
- `settle_game_round` (CRASH) und `advance_blackjack_round` (BLACKJACK) **mit derselben Signatur wie zuvor** per `CREATE OR REPLACE` neu geschrieben — dabei unwissentlich die in 034 ergänzte Jackpot-Pool-Integration (`jackpot_pool_settle()`-Aufruf, Payout-Transaktion) entfernt und einen in 034 bereits behobenen Security-Fund (ungestripptes `jackpotRoll` in Response/`game_rounds.state`) wieder eingeführt.

**Auswirkung:** Zwischen Anwendung von Migration 036 und 037 (beide am 2026-08-21, Abstand < 1 Stunde) haben CRASH/BLACKJACK nicht zum Jackpot-Pool beigetragen und konnten ihn nicht auslösen. Kein Geldverlust-Risiko — `jackpot_pool_settle()` bewegt nie fehlerhaft Spieler-Guthaben, sie liest/schreibt nur den separaten Pool. DICE/ROULETTE/SLOTS unbetroffen (liefen durchgehend über die unberührte 10-Parameter-Version).

**Fund durch:** L10-Live-Verifikation — `wallet_events` blieb nach echten Testbets leer, obwohl `wallet_transactions` korrekt befüllt wurde. Root-Cause-Diagnose per `pg_get_functiondef()` direkt gegen die Live-DB (nicht nur Code-Review der lokalen Migrationsdatei) — bestätigt den Wert von L10 als eigenständigem Verifikationsschritt, nicht nur Formsache.

**Korrektur:** [037_fix_wallet_events_jackpot_regression.sql](../../supabase/migrations/037_fix_wallet_events_jackpot_regression.sql) — restauriert die Jackpot-Logik aus 034 in allen drei tatsächlich genutzten Funktionen, kombiniert korrekt mit der Outbox-Entkopplung; setzt die tote 8-Parameter-`settle_game_bet` auf ihren ursprünglichen 007-Stand zurück (Hygiene, keine Funktionsänderung). Regressionstest: [wallet-events-jackpot-regression-fix.test.ts](../../src/lib/casino/__tests__/wallet-events-jackpot-regression-fix.test.ts).

**Nach 037 verifiziert (L10 wiederholt):** frischer Crash-Testbet → `wallet_events`-Zeile mit `xp_gain=100`, `processed_at` ~1–2s nach `created_at` gesetzt, `attempts=1`, `last_error=null`.

### 6.2 — Lerneffekt

Bei Migrationen, die eine bestehende RPC-Funktion per `CREATE OR REPLACE` neu schreiben: **immer den aktuell live in der DB stehenden Funktionskörper prüfen** (`pg_get_functiondef`), nicht nur die zuletzt bekannte lokale Migrationsdatei — spätere Migrationen können denselben Funktionsnamen mit unverändertem Signatur bereits weiterentwickelt haben (hier: Jackpot-Integration in 034, drei Migrationen nach dem Stand, gegen den 036 entworfen wurde).
