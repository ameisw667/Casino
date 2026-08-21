# 05 — Outbox Wallet-Nebenwirkungen (Option B: pg_net Push-Consumer)

> **Status:** Execution-Ready · **Stand:** 2026-08-21 · **Owner:** Jan/LLM · **Scope:** XP-Gain aus `settle_game_bet`/`settle_game_round`/`advance_blackjack_round` entkoppeln. Achievement-Check bleibt unverändert client-seitig (siehe §0). Kein Cross-Game-Event-Bus, keine Notifications — das ist 4.3, separat.

Referenz: Roadmap-Punkt 4.1 in [`worldmap/05_ZUKUNFTSPLANUNG.md`](05_ZUKUNFTSPLANUNG.md#41--outbox-pattern-für-wallet-nebenwirkungen), Risiko R12.

---

## 0 — Vorab geklärte Architektur-Entscheidungen

Zwei Rückfragen vor Planbeginn beantwortet (Chat, 2026-08-21):

| Frage | Antwort | Begründung |
|---|---|---|
| Outbox-Scope | **Nur XP-Gain.** Achievement-Check bleibt client-berechnet (`applyAchievementProgress`, [useCasinoStore.ts:514](../src/store/useCasinoStore.ts#L514)) + Fire-and-Forget-POST an `/api/user/stats`, unverändert. | Achievement-Check ist **heute bereits** client-seitig entkoppelt (kein Server-Coupling im Money-Pfad) — nur XP-Gain ist inline in den Settlement-RPCs. Eine Server-Migration von `applyAchievementProgress` ist ein eigenständig großer Umbau, gehört nicht in diesen ersten Schritt (YAGNI). |
| XP-Zustellung an Client | **Polling von `/api/user/balance`** nach jedem Bet. | Kein neuer Realtime-Kanal nötig, kleinste Fläche, nutzt bestehenden Endpoint. Realtime-Push kann sauberer nachgezogen werden, falls 4.3 (Event-Bus) ohnehin einen zentralen Kanal für mehrere Consumer baut. |

**Bekannte, akzeptierte Einschränkung:** `applyAchievementProgress` liest `state.level` synchron beim Settlement (Zeile 510). Solange der XP-Poll noch nicht gelandet ist, prüft ein level-gates Achievement (z. B. „Level 10 erreichen") gegen den **alten** Level. Erst der nächste Bet nach erfolgreichem Poll evaluiert korrekt. Kosmetischer Randfall (max. eine Bet-Verzögerung), keine Geld- oder Sicherheitsauswirkung — nicht Teil dieses Scopes, ggf. Folgepunkt bei einer künftigen Server-Migration von Achievements.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
|---|---|---|---|---|
| L0 | Optionswahl + Architektur-Klärung | 🟢 Executed | — | Jan + LLM |
| L1 | Migration 036: `wallet_events`-Tabelle, `apply_xp_gain`, Trigger, pg_cron-Backstop | 🔴 Geplant | Migration schreiben | LLM |
| L2 | Settlement-RPCs umbauen (XP-Write raus, Event-Insert rein) | 🔴 Geplant | Teil von Migration 036 | LLM |
| L3 | Neue Route `POST /api/internal/wallet-events` + Proxy-Exemption | 🔴 Geplant | Route + `src/proxy.ts` | LLM |
| L4 | Client-Polling in `useCasinoStore.ts` | 🔴 Geplant | `scheduleXpSync()` bauen | LLM |
| L5 | Tests (Migrations-Assertions, Route-Auth, Proxy-Exemption) | 🔴 Geplant | Neue Testdateien | LLM |
| L6 | Security-Review (Pflicht, R12) | 🔴 Geplant | `security-reviewer`-Agent | LLM |
| L7 | Vault-Secret `wallet_event_secret` anlegen | 🔴 Geplant | SQL-Snippet ausführen | **Jan** |
| L8 | `WALLET_EVENT_SECRET` in Vercel + `.env.local` setzen | 🔴 Geplant | ENV-Var setzen | **Jan** |
| L9 | Migration 036 auf Remote-Projekt anwenden | 🔴 Geplant | `supabase db push` / Dashboard | **Jan** |
| L10 | Live-Verifikation (Testbet, `wallet_events`-Tabelle, XP-Anstieg im UI) | 🔴 Geplant | Nach L9 | **Jan** |

---

## 2 — Architektur

### 2.1 Heutiger Zustand (Ist)

`settle_game_bet` / `settle_game_round` / `advance_blackjack_round` (alle in [007_server_authority.sql](../supabase/migrations/007_server_authority.sql)) schreiben Balance **und** XP/Level/Rank in derselben Transaktion, advisory-locked auf `user_id`. Die Antwort enthält den frisch berechneten XP/Level-Stand, den der Client synchron über `applyServerWalletSnapshot()` übernimmt ([useCasinoStore.ts:368](../src/store/useCasinoStore.ts#L368)).

### 2.2 Zielzustand (Soll)

1. Settlement-RPCs schreiben **nur noch Balance**. Statt XP inline zu berechnen, fügen sie bei `p_xp_gain > 0` eine Zeile in `wallet_events` ein (`ON CONFLICT DO NOTHING`, idempotent über `(user_id, request_id, event_type)`).
2. Ein `AFTER INSERT`-Trigger auf `wallet_events` feuert **asynchron** (pg_net queued, blockiert die Settlement-Transaktion nicht) einen `POST` an eine neue interne Route, Shared-Secret-authentifiziert (exakt das Muster aus `/api/internal/cron-alert`, [027](../supabase/migrations/027_guide_telemetry_purge_cron.sql)).
3. Die Route ruft eine neue RPC `apply_xp_gain(event_id)` auf, die XP/Level/Rank schreibt und das Event als `processed_at` markiert — advisory-locked auf denselben `user_id`-Lock-Domain wie die Settlement-RPCs (verhindert Race zwischen einem neuen Bet und der asynchronen XP-Anwendung).
4. Ein `pg_cron`-Job (alle 2 Minuten, bereits produktive Extension seit [027](../supabase/migrations/027_guide_telemetry_purge_cron.sql)) ruft `apply_xp_gain` **direkt** (kein HTTP) für alle seit >2 Min unverarbeiteten Events auf — Backstop, falls `pg_net`/Route ausfällt. Bei ≥5 Fehlversuchen: Alert über den bestehenden `cron-alert`-Kanal (Sentry).
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
  - Tabelle `wallet_events(id, user_id, request_id, event_type, xp_gain, processed_at, attempts, last_error, created_at)`, `UNIQUE(user_id, request_id, event_type)`, RLS enabled, kein Grant an `anon`/`authenticated` (Muster: `game_rounds`, [007:17-33](../supabase/migrations/007_server_authority.sql#L17-L33)).
  - Funktion `apply_xp_gain(p_event_id UUID) RETURNS JSONB` — `SECURITY DEFINER`, `search_path = public, pg_temp`, advisory-locked, idempotent (No-Op bei bereits `processed_at`), schreibt `attempts`/`last_error` bei Fehlern **ohne** die Transaktion abzubrechen (verschachteltes `BEGIN...EXCEPTION`, kein `RAISE` nach außen — sonst würde der Fehlerzähler mit zurückgerollt).
  - Funktion `notify_wallet_event()` als `AFTER INSERT`-Trigger auf `wallet_events` — `net.http_post` an `/api/internal/wallet-events`, Secret aus `vault.decrypted_secrets` (`wallet_event_secret`, **neuer, dedizierter** Secret-Name — nicht `cron_alert_secret` wiederverwenden, andere Blast-Radius-Klasse). Kompletter Body in `EXCEPTION WHEN OTHERS THEN NULL` — darf die Settlement-Transaktion niemals blockieren.
  - Funktion `retry_stale_wallet_events()` + `cron.schedule('wallet-events-retry', '*/2 * * * *', ...)` — Backstop, ruft `apply_xp_gain` direkt auf (kein HTTP), alertet über den **bestehenden** `cron_alert_secret`-Kanal bei ≥5 Fehlversuchen (echte Ops-Alerting-Wiederverwendung, kein neuer Zweck).
- **Scope — geänderte Objekte (`CREATE OR REPLACE`, gleiche Signatur, kein Drop):**
  - `settle_game_bet`, `settle_game_round`, `advance_blackjack_round`: `UPDATE users` verliert `xp/level/rank`-Spalten; `v_response` liefert `v_user.xp/level/rank` (Stand **vor** diesem Bet, unverändert) statt neu berechneter Werte; zusätzlicher `INSERT INTO wallet_events` bei `p_xp_gain > 0` (bei `advance_blackjack_round` zusätzlich `AND p_settled`).
  - `start_game_round` bleibt unverändert (schreibt nie XP).
- **Datenklassen:** Keine neuen personenbezogenen Daten. `wallet_events.xp_gain` ist ein abgeleiteter Spielwert, kein Geldbetrag.
- **Abhängigkeiten:** `pg_cron`/`pg_net` (bereits aktiv seit [027](../supabase/migrations/027_guide_telemetry_purge_cron.sql)), Advisory-Lock-/Idempotenz-Pattern aus [007](../supabase/migrations/007_server_authority.sql) (wiederverwendet, kein neues Muster).
- **Money-Pfad:** Teilweise — Balance-Logik selbst unverändert, aber derselbe kritische Code-Pfad wird editiert.
- **Security-Review:** Pflicht (R12).
- **Freigabe-Gate:** Security-Reviewer-Agent ohne CRITICAL-Finding, bevor die Migration auf das Remote-Projekt angewendet wird (L9, Jans manueller Schritt — kein automatischer Push auf die Live-DB durch die LLM-Seite).
- **Verifizierung:**
  - Automatisiert: `src/lib/casino/__tests__/wallet-events-outbox-migration.test.ts` (Muster: [wallet-migration.test.ts](../src/lib/casino/__tests__/wallet-migration.test.ts)) — prüft per String-Assertion auf die SQL-Datei: Tabelle, Unique-Constraint, `apply_xp_gain`, Trigger, `cron.schedule`, REVOKE/GRANT auf `service_role`.
  - Manuell (Jan, lokal via `supabase start`, vor L9): Idempotenz — `apply_xp_gain` zweimal auf dasselbe Event aufrufen, zweiter Aufruf liefert `alreadyProcessed: true`, XP nur einmal gutgeschrieben. Backstop — Route-Secret absichtlich falsch setzen, prüfen dass `retry_stale_wallet_events()` das Event nach 2 Minuten trotzdem verarbeitet. Settlement-Latenz — `settle_game_bet` bleibt in derselben Größenordnung wie vor der Migration (ein zusätzlicher Insert, keine zusätzliche Berechnung).
- **Nicht-Scope:** Kein Cross-Game-Event-Bus (4.3), keine Notifications, keine Achievement-Server-Migration, keine Realtime-Subscription.

### L3 — Route `POST /api/internal/wallet-events` + Proxy-Exemption

- **Ziel:** Empfängt den `pg_net`-Push, wendet `apply_xp_gain` an.
- **Scope — neue Dateien:** `src/app/api/internal/wallet-events/route.ts` — Shared-Secret-Auth (`x-wallet-event-secret`, `timingSafeEqual`, exaktes Muster aus [cron-alert/route.ts](../src/app/api/internal/cron-alert/route.ts)), Zod-Body `{ eventId: z.string().uuid() }`, ruft `supabase.rpc('apply_xp_gain', { p_event_id })` über den Admin-Client auf. `success: false` in der RPC-Antwort → HTTP 500 (Backstop-Cron übernimmt); `alreadyProcessed: true` oder `success: true` → HTTP 200.
- **Scope — geänderte Dateien:** `src/proxy.ts` — `/api/internal/wallet-events` zur `PUBLIC_ROUTES`-Matcher-Liste (nahe [Zeile 37](../src/proxy.ts#L37)) und zum `isWebhook`-Check (nahe [Zeile 88](../src/proxy.ts#L88)) hinzufügen — sonst blockiert der Origin-Check den `pg_net`-Request (kein Browser-Origin-Header, gleiche Ausnahme wie `cron-alert`/`telegram/webhook`).
- **Money-Pfad:** Nein (nur XP/Level, keine Balance).
- **Security-Review:** Pflicht (neue Auth-Boundary).
- **Freigabe-Gate:** Route-Auth-Tests grün, Security-Reviewer ohne CRITICAL.
- **Verifizierung:** `src/lib/security/__tests__/wallet-events-route.test.ts` (Muster: [cron-alert-route.test.ts](../src/lib/security/__tests__/cron-alert-route.test.ts)) — fehlendes/falsches Secret → 401; gültiges Secret + unbekannte Event-ID → RPC-Fehlerpfad → 500; gültiges Secret + bereits verarbeitetes Event → 200. Ergänzung in [proxy-routing.test.ts](../src/lib/security/__tests__/proxy-routing.test.ts) (Muster Zeile 56-58) für die neue Route.
- **Nicht-Scope:** Kein Public-Facing-Endpoint, keine Nutzung durch den Browser-Client.

### L4 — Client-Polling in `useCasinoStore.ts`

- **Ziel:** UI zeigt den asynchron verarbeiteten XP/Level-Stand innerhalb weniger Sekunden, ohne neue Infrastruktur.
- **Scope:** Modul-lokale `scheduleXpSync()`-Funktion (gleiches Pattern wie das bestehende modul-lokale `processedResultIds`-Set in dieser Datei) — `setInterval`, 1,2 s Abstand, max. 5 Versuche, ruft `GET /api/user/balance` und `applyServerWalletSnapshot()` auf. Jeder neue Bet setzt das Versuchsbudget zurück statt einen zweiten Timer zu starten (bündelt Autobet-Serien). Aufruf aus `processGameResult()`, direkt nach dem bestehenden `set(...)`-Block.
- **Money-Pfad:** Nein.
- **Security-Review:** Nein (liest nur einen bestehenden, bereits Auth-geschützten Read-Endpoint).
- **Freigabe-Gate:** Keins — reine Client-Ergänzung, kein neuer Schreibpfad.
- **Verifizierung:** Manueller Dev-Server-Check (siehe §4) — Bet auslösen, XP-Bar aktualisiert sich innerhalb ~6s ohne Page-Reload.
- **Nicht-Scope:** Keine Supabase-Realtime-Subscription (siehe §0), kein Exponential-Backoff (fixes Intervall reicht für 5 Versuche über 6s).

---

## 4 — Execution-Selbstprüfung (Schritt 4, nach Umsetzung auszufüllen)

- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run test` (neue + bestehende Suiten grün, insbesondere `wallet.test.ts`, `wallet-migration.test.ts`, `proxy-routing.test.ts` unverändert grün)
- [ ] `npm run vibe-check`
- [ ] Diff gegen §3 dieses Plans geprüft (keine Abweichung ohne Dokumentation hier)
- [ ] `security-reviewer`-Agent-Ergebnis ohne CRITICAL

---

## 5 — Plan-Selbstprüfung (Schritt 2, Pflicht vor „Execution-Ready")

- **Reihenfolge/Abhängigkeiten:** L1+L2 (Migration) muss vor L3 (Route ruft `apply_xp_gain`) stehen; L3 vor L9 (Remote-Deploy); L7/L8 (Secrets) vor L9. In §1 so nummeriert. ✅
- **Datenzugriff/Allowlist:** Alle neuen Funktionen `REVOKE ALL ... FROM PUBLIC, anon, authenticated` + `GRANT ... TO service_role` (Migration 036, wie 007). Negativtest: Route lehnt fehlendes/falsches Secret ab (L3-Verifizierung). ✅
- **Ausgeschlossene Folgefunktionen markiert:** Achievement-Server-Migration, Realtime-Push, Event-Bus (4.3) explizit als Nicht-Scope in §0 und je Meilenstein genannt, nicht als impliziter Folgeschritt. ✅
- **Keine widersprüchliche Scope-Aussage:** Diese Datei ersetzt die 4.1-Kurzbeschreibung in `05_ZUKUNFTSPLANUNG.md` nicht, sondern konkretisiert sie; nach Abschluss wird dort auf „Executed" verwiesen (§6). ✅
- **Money-Pfad/Security-Review-Felder** je Wallet-nahem Meilenstein gesetzt (L1+L2, L3). ✅

**Ergebnis:** Plan ist vollständig, konsistent, keine offenen Architektur-Fragen mehr. Status → **Execution-Ready**.

---

## 6 — Abschluss (Schritt 5, nach L1–L6 durch LLM + L7–L10 durch Jan)

Nach vollständiger Verifikation (Execution-Selbstprüfung grün + Live-Check L10 durch Jan):

- Status-Kopf dieser Datei → `Executed (archiviert)`, Datei nach `docs/archive/` verschoben.
- `worldmap/05_ZUKUNFTSPLANUNG.md`: 4.1-Zeile aus der aktiven Tabelle entfernt, Verweis auf diese archivierte Datei im Archivindex ergänzt (Muster: bestehende Archivregel, Abschnitt „Archivregel" in `05_ZUKUNFTSPLANUNG.md`).
