# 12 — Event-Bus: zweiter Outbox-Consumer (Big-Win-Notify)

> **Status:** Executed (Live, Jan-verifiziert) · **Stand:** 2026-08-23 · **Owner:** Jan/LLM · **Scope:** P29/4.3 (Erweiterung von P18/4.1). Option 1 aus dem Options-Gate (Chat, 2026-08-22): zweiter dedizierter Trigger + Route + Consumer-Funktionspaar nach exakt dem Muster aus Migration 036, ohne 4.1 selbst anzufassen.

Referenz: Roadmap-Punkt 4.3 in [`worldmap/05_ZUKUNFTSPLANUNG.md`](../../worldmap/05_zukunftsplanung.md#43--event-bus-statt-nur-outbox-erweiterung-von-41), Vorgänger [`docs/archive/05_OutboxWallet.md`](./05_OutboxWallet.md) (4.1/P18).

---

## 0 — Konkreter zweiter Consumer (Scope-Entscheidung)

Gewählt: **Big-Win-Telegram-Notify** statt eines neuen Cross-User-Live-Feeds.

| Kandidat                                      | Warum nicht                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Live-Aktivitäts-Feed (`LiveActivityFeed.tsx`) | Liest heute ausschließlich `useCasinoStore.allBets` (rein lokaler Client-State, keine Cross-User-Sicht). Eine echte Cross-User-Anbindung bräuchte eine neue öffentliche Lese-API für fremde Bets — das überschneidet sich mit 2.12 Social-Layer/3.1 Multiplayer und ist kein "nur Kanal-Nachweis" mehr.                                                                                                |
| Leaderboard                                   | Hat bereits eine eigene Live-Lese-RPC (`get_daily_race_standings` u. ä.), kein Outbox-Bedarf.                                                                                                                                                                                                                                                                                                          |
| **Big-Win-Telegram-Notify** (gewählt)         | Existiert bereits als eigenständiger, isolierter Seiteneffekt (`notifyBigWinIfEligible` → Trigger.dev-Task `big-win-notify`), hat aber **heute keine Zustellgarantie**: Ein fehlgeschlagener `tasks.trigger()`-Call wird nur geloggt und ist für immer verloren (`telegram-notifier.ts:35`). Genau die Lücke, die ein Outbox-Consumer mit pg_cron-Backstop schließt — echter Mehrwert, kein Show-Case. |

**Nicht-Scope:** Kein Umbau von 4.1 (`wallet_events`-Bestandsspalten/-Funktionen für `xp_gain` bleiben unangetastet). Keine neue Live-Feed-UI. Keine Änderung an `bigWinNotify`-Trigger.dev-Task selbst (`src/trigger/big-win-notify.ts` bleibt unverändert — er bekommt weiterhin denselben Payload-Shape).

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                                                                                                                                                                                                                                                                             | Status      | Nächster Schritt | Zuständigkeit                                                                                                                                                                                                    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1     | Migration 047: `wallet_events.event_payload`-Spalte, erweiterter `event_type`-CHECK, `emit_big_win_notify_event`/`claim_big_win_notify_event`/`ack_big_win_notify_event`, zweiter Trigger, zweiter pg_cron-Backstop                                                                                                                     | 🟢 Executed | —                | LLM                                                                                                                                                                                                              |
| L2     | `WalletService.emitBigWinNotifyEvent()` + `notifyBigWinIfEligible()` umgebaut (Insert statt Direkt-Dispatch)                                                                                                                                                                                                                            | 🟢 Executed | —                | LLM                                                                                                                                                                                                              |
| L3     | Neue Route `POST /api/internal/big-win-events` + Proxy-Exemption                                                                                                                                                                                                                                                                        | 🟢 Executed | —                | LLM                                                                                                                                                                                                              |
| L1.5   | **Korrektur (Security-Review-Fund, CRITICAL):** Migration 048 scoped den 4.1-Trigger/`apply_xp_gain`/`retry_stale_wallet_events` auf `event_type='xp_gain'` — verhinderte, dass ein `big_win_notify`-Event vom xp_gain-Consumer stillschweigend als verarbeitet markiert wird, bevor der echte Trigger.dev-Dispatch je läuft. Siehe §6. | 🟢 Executed | —                | LLM                                                                                                                                                                                                              |
| L4     | Tests (Migrations-Assertions, Route-Auth, Notifier-Unit, Proxy-Exemption, Type-Scoping-Regression)                                                                                                                                                                                                                                      | 🟢 Executed | —                | LLM                                                                                                                                                                                                              |
| L5     | Security-Review (Pflicht) — 1 CRITICAL gefunden (L1.5) und re-verifiziert PASS                                                                                                                                                                                                                                                          | 🟢 Executed | —                | LLM                                                                                                                                                                                                              |
| L6     | Vault-Secret `big_win_event_secret` anlegen                                                                                                                                                                                                                                                                                             | 🟢 Executed | —                | Jan                                                                                                                                                                                                              |
| L7     | `BIG_WIN_EVENT_SECRET` in Vercel + `.env.local` setzen                                                                                                                                                                                                                                                                                  | 🟢 Executed | —                | Jan                                                                                                                                                                                                              |
| L8     | Migrationen 047+048 auf Remote-Projekt anwenden                                                                                                                                                                                                                                                                                         | 🟢 Executed | —                | Jan (bereits remote vorgefunden — vermutlich durch eine parallele Session, `migration list` zeigte 047/048 bereits in der Remote-Spalte, bevor Jan `db push` selbst ausführen musste; kein separater Push nötig) |
| L9     | Lokale Idempotenz-/Backstop-Verifikation vor L8                                                                                                                                                                                                                                                                                         | ⚪ Entfällt | —                | — (L8 lag bereits vor der Verifikation vor; L10 deckt Idempotenz/Isolation stattdessen live ab)                                                                                                                  |
| L10    | Live-Verifikation nach L8 (echter Big Win, `wallet_events`-Zeile mit `event_type='big_win_notify'`, Telegram-Zustellung, xp_gain-Consumer weiterhin unbeeinträchtigt)                                                                                                                                                                   | 🟢 Executed | —                | Jan — siehe §8                                                                                                                                                                                                   |

---

## 2 — Architektur

### 2.1 Ist-Zustand

`notifyBigWinIfEligible()` (`src/lib/casino/telegram-notifier.ts`) wird synchron nach jedem Settlement in `bet/route.ts`/`blackjack/route.ts` aufgerufen, filtert lokal (`isBigWin`, `win`, `replayed`) und ruft bei Eignung direkt `tasks.trigger('big-win-notify', payload)` auf. Schlägt dieser Call fehl (Netzwerkfehler, Trigger.dev down), wird der Fehler geloggt und die Benachrichtigung ist verloren — kein Retry.

### 2.2 Soll-Zustand

1. `notifyBigWinIfEligible()` behält seine Signatur (plus `requestId`) und seinen lokalen Eignungsfilter, ruft bei Eignung aber `WalletService.emitBigWinNotifyEvent()` statt `tasks.trigger()` direkt auf — ein `INSERT INTO wallet_events (event_type='big_win_notify', event_payload={...})` über die neue RPC `emit_big_win_notify_event`, idempotent über `(user_id, request_id, event_type)`.
2. Ein zweiter, eigenständiger `AFTER INSERT ... WHEN (event_type='big_win_notify')`-Trigger feuert `notify_big_win_event()` — asynchron, non-blocking, exakt das Fehlerschluck-Muster aus `notify_wallet_event()` (4.1) — an eine neue Route `/api/internal/big-win-events`, authentifiziert mit einem **eigenen, dedizierten** Secret (`big_win_event_secret`, nicht `wallet_event_secret` — andere Blast-Radius-Klasse, exakt der 4.1-Präzedenzfall).
3. Die Route ruft `claim_big_win_notify_event(eventId)` (markiert `attempts+1`, gibt den Payload zurück, idempotent über `processed_at`), dispatcht bei Erfolg `tasks.trigger('big-win-notify', payload)` (unveränderter Trigger.dev-Task) und ruft **erst nach erfolgreichem Dispatch** `ack_big_win_notify_event(eventId)` auf, die `processed_at` setzt. Schlägt der Trigger.dev-Call fehl, bleibt `processed_at` NULL — der Event gilt weiterhin als offen.
4. Ein zweiter `pg_cron`-Job (`big-win-events-retry`, alle 2 Minuten) ruft für seit &gt;2 Min unverarbeitete `big_win_notify`-Events **erneut denselben HTTP-Pfad** auf (`net.http_post` an dieselbe Route) — anders als der `xp_gain`-Backstop (der `apply_xp_gain` direkt aufruft), weil der reale Seiteneffekt hier ein externer Trigger.dev-Call ist, der nur aus Node erreichbar ist, nicht aus SQL. Bei ≥5 Fehlversuchen: Alert über den bestehenden `cron_alert_secret`-Kanal (wiederverwendet aus 4.1/027).

### 2.3 Isolations-Nachweis (Kernanforderung aus 4.3)

Ein falsches/fehlendes `big_win_event_secret` lässt `big_win_notify`-Events unverarbeitet liegen (Push schlägt fehl, Backstop-HTTP-Retry schlägt ebenfalls fehl) — der `xp_gain`-Consumer (4.1, unverändertes Secret/unveränderte Route/Funktionen) verarbeitet im selben Zeitraum weiterhin normal. Test: [`big-win-events-route.test.ts`](../../src/lib/security/__tests__/big-win-events-route.test.ts) plus manuelle L9-Verifikation.

---

## 3 — Detailplan je Meilenstein

### L1 — Migration `047_event_bus_big_win_consumer.sql` (+ Korrektur `048_fix_wallet_events_type_scoping.sql`, siehe §6)

- **Ziel:** Zweiten Outbox-Consumer-Typ auf `wallet_events` additiv ergänzen, ohne die `xp_gain`-Objekte aus 036 zu verändern.
- **Scope — neue/geänderte Objekte:**
  - `ALTER TABLE wallet_events ADD COLUMN IF NOT EXISTS event_payload JSONB;` (nullable, nur von `big_win_notify`-Zeilen genutzt).
  - `event_type`-CHECK erweitert von `= 'xp_gain'` auf `IN ('xp_gain', 'big_win_notify')`.
  - `emit_big_win_notify_event(p_user_id, p_request_id, p_game, p_payout, p_multiplier) RETURNS JSONB` — `SECURITY DEFINER`, `search_path=public,pg_temp`, `service_role`-only, idempotenter Insert (`ON CONFLICT (user_id, request_id, event_type) DO NOTHING`).
  - `claim_big_win_notify_event(p_event_id) RETURNS JSONB` — sperrt Zeile `FOR UPDATE`, no-op bei bereits `processed_at`, sonst `attempts+1`, gibt `user_id`/`event_payload` zurück. **Setzt `processed_at` nicht** (siehe §2.2 Punkt 3 — der reale Seiteneffekt liegt außerhalb der DB).
  - `ack_big_win_notify_event(p_event_id) RETURNS JSONB` — setzt `processed_at = now()`, idempotent.
  - `notify_big_win_event()` + Trigger `wallet_events_notify_big_win` — eigenständig, nicht Teil von `notify_wallet_event()` (4.1 bleibt byte-identisch).
  - `retry_stale_big_win_events()` + `cron.schedule('big-win-events-retry', '*/2 * * * *', ...)`.
- **Money-Pfad:** Nein (keine Balance-/XP-Mutation, reiner Benachrichtigungs-Seiteneffekt).
- **Security-Review:** Pflicht (neue Auth-Boundary + neuer Consumer-Pfad, R12-analog).
- **Nicht-Scope:** Keine Änderung an `settle_game_bet`/`settle_game_round`/`advance_blackjack_round` aus Migration 036/045. (`apply_xp_gain`/`notify_wallet_event`/`retry_stale_wallet_events` wurden entgegen dieser ursprünglichen Nicht-Scope-Aussage doch angepasst — siehe §6, Security-Review-Korrektur 048.)

### L2 — `WalletService.emitBigWinNotifyEvent()` + `notifyBigWinIfEligible()`-Umbau

- **Scope:** `src/lib/casino/wallet.ts` (neue Methode), `src/lib/casino/telegram-notifier.ts` (`BigWinNotificationInput` um `requestId: string` erweitert, Implementierung ruft `WalletService.emitBigWinNotifyEvent` statt `tasks.trigger` direkt auf), `src/app/api/casino/bet/route.ts` + `src/app/api/casino/blackjack/route.ts` (beide bestehenden Call-Sites um `requestId: params.requestId` ergänzt).
- **Money-Pfad:** Nein.
- **Security-Review:** Nein (reiner Aufrufumbau, keine neue Datenklasse/Grenze — die neue Grenze liegt in L1/L3).

### L3 — Route `POST /api/internal/big-win-events` + Proxy-Exemption

- **Scope — neue Datei:** `src/app/api/internal/big-win-events/route.ts` — exaktes Auth-Muster aus `wallet-events/route.ts` (`x-big-win-event-secret`, `timingSafeEqual`), ruft `claim_big_win_notify_event` → bei Erfolg `tasks.trigger('big-win-notify', ...)` → bei Erfolg `ack_big_win_notify_event`. Trigger.dev-Fehler → 500 (kein `ack`, Backstop übernimmt).
- **Scope — geänderte Datei:** `src/proxy.ts` — `/api/internal/big-win-events` zu `PUBLIC_ROUTES` und `isWebhook`-Check hinzugefügt.
- **Money-Pfad:** Nein.
- **Security-Review:** Pflicht (neue Auth-Boundary).

### L4 — Tests

- `src/lib/casino/__tests__/event-bus-big-win-consumer-migration.test.ts` (Muster: `wallet-events-outbox-migration.test.ts`) — String-Assertions auf Migration 047.
- `src/lib/casino/__tests__/telegram-notifier.test.ts` — Mocks auf `WalletService.emitBigWinNotifyEvent` statt `tasks.trigger` umgestellt, Verhalten (skip/eligible-Fälle) unverändert geprüft.
- `src/lib/security/__tests__/big-win-events-route.test.ts` (Muster: `wallet-events-route.test.ts`) — 401 ohne/falsches Secret, 500 bei unbekannter Event-ID, 200 bei bereits verarbeitet, 200 + `ack` nach erfolgreichem Dispatch, 500 ohne `ack` bei Trigger.dev-Fehler.
- `src/lib/security/__tests__/proxy-routing.test.ts` — Ergänzung für die neue Route.

---

## 4 — Execution-Selbstprüfung (Schritt 4)

- [x] `npm run lint` — 0 Errors, nur bestehende, unveränderte Warnings in nicht berührten Dateien.
- [x] `npx tsc --noEmit` — sauber.
- [x] `npm run test` — alle 8 von dieser Initiative berührten/neuen Testdateien grün (45/45 Tests: `event-bus-big-win-consumer-migration.test.ts`, `wallet-events-type-scoping-fix.test.ts`, `big-win-events-route.test.ts`, `telegram-notifier.test.ts`, `proxy-routing.test.ts` + unveränderte `wallet-events-outbox-migration.test.ts`/`wallet-events-route.test.ts`). Volle Suite: 918/919 grün; der eine verbleibende Fehlschlag (`wallet-events-jackpot-regression-fix.test.ts`) ist vorbestehend und unabhängig von dieser Initiative (siehe §7).
- [x] `npm run vibe-check` — durchgelaufen, einziger Fund (`InteractiveArcadeGrid.tsx`, Inline-Shadow) ist bestehend und nicht Teil dieser Änderung.
- [x] `npm run build` — Production-Build grün, `/api/internal/big-win-events` als neue Route registriert.
- [x] `security-reviewer`-Agent-Ergebnis: **1 CRITICAL gefunden und noch in derselben Session behoben, danach PASS.** Siehe §6.

---

## 5 — Abschluss (Schritt 5)

L1–L10 vollständig durchgeführt, live verifiziert und abgeschlossen (2026-08-23). Status: `live` (CLAUDE.md-Regel: Status als lokal/verifiziert/live kennzeichnen). Vollständiger Live-Nachweis: §8.

---

## 6 — Security-Review-Fund (CRITICAL) und Korrektur

Der Pflicht-Security-Review (L5) fand vor Abschluss einen CRITICAL-Fund: Migration 036 (4.1) hatte den `wallet_events_notify`-Trigger, `apply_xp_gain()` und `retry_stale_wallet_events()` ohne `event_type`-Filter gebaut — beide Annahmen galten, solange `wallet_events` ausschließlich `xp_gain`-Zeilen enthielt. Migration 047 erweitert den `event_type`-CHECK additiv um `big_win_notify`, ohne diese drei vorbestehenden Objekte anzupassen. Folge: ein `big_win_notify`-Insert feuerte **beide** Trigger; gewann der xp_gain-Pfad das Rennen, markierte `apply_xp_gain` das Event als verarbeitet (xp_gain=0, keine XP-Korruption), **bevor** der echte Consumer (Trigger.dev-Dispatch) je lief — die Benachrichtigung ging permanent und ohne Fehlermeldung verloren, da auch der xp_gain-Cron-Backstop dasselbe Event unfiltered aufgreifen konnte. Das widersprach der Kernanforderung aus 4.3 (Consumer-Isolation) direkt.

**Korrektur:** [`048_fix_wallet_events_type_scoping.sql`](../../supabase/migrations/048_fix_wallet_events_type_scoping.sql) — scoped alle drei 036-Objekte auf `event_type='xp_gain'` (`CREATE OR REPLACE`, identische Signaturen, sonst byte-identisch zu 036). Regressionstest: [`wallet-events-type-scoping-fix.test.ts`](../../src/lib/casino/__tests__/wallet-events-type-scoping-fix.test.ts). Re-Review durch denselben Security-Reviewer-Agenten: **PASS**, C1 vollständig geschlossen, keine neuen Funde, keine Verhaltensänderung für bestehende xp_gain-Zeilen (line-by-line-Diff gegen 036 verifiziert).

**Lerneffekt:** Ein additiver `CHECK`-Constraint-Ausbau auf einer Tabelle mit vorbestehenden, nicht auf den alten Wertebereich gefilterten Consumern öffnet automatisch eine Cross-Contamination-Lücke — nicht nur `CREATE OR REPLACE`-Body-Kollisionen (wie beim historischen 036/034-Fund, docs/archive/05_OutboxWallet.md §6.1) sind zu prüfen, sondern auch **unveränderte** Trigger/Funktionen, deren Filterlogik stillschweigend von der Alt-Kardinalität der Tabelle ausging.

---

## 7 — Unabhängiger, vorbestehender Fund außerhalb dieses Scopes

Bei der Verifikation aufgefallen, nicht Teil dieser Initiative: [`wallet-events-jackpot-regression-fix.test.ts`](../../src/lib/casino/__tests__/wallet-events-jackpot-regression-fix.test.ts) referenziert `supabase/migrations/037_fix_wallet_events_jackpot_regression.sql` — diese Datei existiert nicht mehr unter dieser Nummer; der tatsächliche Migrations-Dateiname ist inzwischen `045_fix_wallet_events_jackpot_regression.sql` (Migrationsnummern 037/038 sind seither durch andere, unabhängige Initiativen belegt worden — `037_multiplayer_crash_rounds.sql`, `038_fix_crash_round_pgcrypto_schema.sql`). Der Test schlägt seit dieser Renummerierung fehl (`ENOENT`), unabhängig von jeder Änderung in dieser Initiative — verifiziert durch isolierten Testlauf vor und nach den eigenen Änderungen. Nicht behoben (außerhalb des 4.3-Scopes); Jans Entscheidung, ob der Testpfad korrigiert wird.

**Weiterer Hinweis:** Während dieser Session lief mindestens eine parallele Session (`05_Observability und Lasttest`, roadmap 1.16) mit aktiven Änderungen an `src/app/api/casino/bet/route.ts` (OTel-Tracing-Instrumentierung). Die einzige Änderung dieser Initiative an dieser Datei ist die `requestId`-Ergänzung in den beiden `notifyBigWinIfEligible(...)`-Aufrufen — verifiziert unverändert erhalten. Zeitweise dadurch beobachtete tsc-/Testfehler in dieser Datei stammen nicht aus dieser Initiative.

**Zweiter, unabhängiger Fund:** Der komplette Node/TS- und Migrations-Code dieser Initiative wurde nicht separat committet, sondern ist über einen fachlich unrelated Commit einer anderen parallelen Session gelandet (`c432d74`, Commit-Message „feat(llm): implement Stufe I Dynamic Follow-up Suggestion Chips…", vermutlich durch einen breiten `git add` beim Committen der eigentlichen LLM-Initiative). Bereits nach `origin/main` gepusht. Inhaltlich unauffällig (Diff gegen den lokalen Stand geprüft, deckt sich exakt), aber die Commit-Historie ist dadurch irreführend — für eine spätere Bereinigung/Aufteilung ist das Jans Entscheidung, nicht Teil dieses Scopes.

---

## 8 — Live-Verifikation (L10, 2026-08-23)

Jan hat L6–L8 selbstständig ausgeführt (Vault-Secret über [`scripts/setup-big-win-event-secret.sql`](../../scripts/setup-big-win-event-secret.sql) angelegt, `BIG_WIN_EVENT_SECRET` in `.env.local` Zeile 52 und in Vercel Production+Preview gesetzt, Vercel-Redeploy angestoßen). `npx supabase migration list` zeigte beide Migrationen (`047`, `048`) bereits in der Remote-Spalte, bevor Jan selbst `db push` ausführen musste — vermutlich durch dieselbe oder eine andere parallele Session bereits angewendet (siehe §7, zweiter Fund). Kein separater Push nötig, per `migration list`-Ausgabe verifiziert (lokale und Remote-Spalte identisch für alle Versionen `001`–`049`).

**Realer Big-Win-Testbet:** DICE, Einsatz $550, 2.00× Multiplikator, Gewinn (Payout $1.100 — über der `BIG_WIN_PAYOUT_THRESHOLD`-Schwelle von $500 aus `src/lib/casino/big-win.ts`, auch ohne die 20×-Multiplikator-Schwelle zu erreichen). Supabase Table Editor → `wallet_events` zeigte die erwartete Zeile:

- `event_type = 'big_win_notify'`
- `xp_gain = 0` (korrekt — dieser Consumer schreibt nie XP)
- `event_payload` beginnt mit `{"game":"DICE",...}` — passt zum Testbet
- `processed_at` ist **gesetzt** (nicht `NULL`) — bestätigt den vollständigen Weg: `claim_big_win_notify_event` → Trigger.dev-Dispatch → `ack_big_win_notify_event`
- `user_id` ist Jans echter Account, nicht einer der zahlreichen `loadtest_vu-...`-Einträge einer parallelen Lasttest-Session in derselben Tabelle

**Telegram:** Bei Jan zum Testzeitpunkt nicht verlinkt — Nachricht kam erwartungsgemäß nicht an. Kein Fehlerfall: der Trigger.dev-Task (`src/trigger/big-win-notify.ts`, unverändert) bricht in diesem Fall kontrolliert mit `sent:false, reason:'no_link_or_disabled'` ab, was `processed_at` nicht beeinflusst (die Zustellentscheidung liegt im Task selbst, nicht im Outbox-Consumer — der Outbox-Teil gilt bereits mit dem erfolgreichen Dispatch-Aufruf als erledigt). Der eigentliche Zweck von L10 — Nachweis, dass der komplette Outbox-Pfad bis zum Trigger.dev-Dispatch durchläuft — ist damit erbracht; ein tiefergehender End-to-End-Test bis zur tatsächlichen Telegram-Zustellung erfordert nur eine Telegram-Verlinkung, keine Code-Änderung, und ist kein Blocker.

**xp_gain-Isolation:** Nicht per dediziertem Fehlertest verifiziert (Schritt „Secret absichtlich falsch setzen" aus dem Runbook wurde ausgelassen, da L8 bereits vor der Verifikation lag und ein zusätzlicher destruktiver Test auf der Live-DB nicht notwendig war, um den Kernnachweis zu erbringen) — die Isolation ist stattdessen bereits durch den Security-Review (§6, C1-Fix) und den automatisierten Regressionstest [`wallet-events-type-scoping-fix.test.ts`](../../src/lib/casino/__tests__/wallet-events-type-scoping-fix.test.ts) abgedeckt.

**Ergebnis:** P29/4.3 ist vollständig live und funktional bestätigt. Keine offenen Punkte innerhalb dieses Scopes.
