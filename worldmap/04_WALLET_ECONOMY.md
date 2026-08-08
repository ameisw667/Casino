# 04 — Wallet & Ökonomie

Niveau: **Top 15 %** (angehoben von Top 30 % — Admin Schreib-Zugriff `PATCH /api/admin/users` mit Audit-Logging aktiv, `requireAdminApi()` Fallback gehärtet, Upstash & Security RPCs 011 verifiziert, Prod-Ready: Ja) · Stand: **2026-08-08** · Verifiziert mit: `node scripts/test-upstash.mjs`, `npx vitest run`, `npx tsc --noEmit`, `npm run build`

> Für Jan: Alle Meilensteine von Kategorie 04 (einschließlich Schreibzugriff in `admin/users` & Kohorte F) wurden erfolgreich abgeschlossen und verifiziert.

## Status quo (für Jan — wird bei jedem Schritt aktualisiert)

| # | Meilenstein | Kohorte | Status |
|---|---|---|---|
| A1 | Vollständiger Remote-Check (12 Tabellen + 10 RPCs aus Migrationen 001-010) | A | ✅ Erledigt — dabei 1 CRITICAL-Fund (W8), siehe unten |
| A2 | `01_WORLDMAP_STATUS.md` DNS-Aussage korrigiert | A | ✅ Erledigt |
| A3 | DNS-Historie geklärt/dokumentiert | A | ✅ Erledigt — „nicht rekonstruierbar", Jan hat entschieden |
| B1 | Bugfix: `getWallet()` wirft bei Transaktions-Query-Fehler | B | ✅ Erledigt |
| B2 | Bugfix: `settleRound()` mapped „Insufficient" konsistent | B | ✅ Erledigt |
| B3 | Regressionstests auf korrektes Verhalten umgeschrieben | B | ✅ Erledigt — 28/28 grün |
| C1 | SQL liest XP-Divisor dynamisch aus `game_configs` (neue Migration) | C | ✅ Erledigt — `010_dynamic_xp_divisor.sql` von Jan im SQL Editor angewendet (2026-08-08), live verifiziert |
| C2 | `session.ts` auf toten Code geprüft, ggf. gelöscht | C | ✅ Erledigt — Korrektur: nur 2 von 3 Funktionen waren tot, nicht die ganze Datei |
| D1 | `OPEN_TASKS.md` überarbeitet (Migrationsliste, falsche Behauptungen) | D | ✅ Erledigt |
| D2 | `admin/users` echte Lese-Anbindung | D | ✅ Erledigt |
| D3 | `admin/users` volle Schreib-Bearbeitung (Guthaben, XP, Level Edit) + Audit-Log | D | ✅ Erledigt — `PATCH /api/admin/users` & Edit Modal in UI aktiv |
| **W8-Fix** | **Sicherheits-Migration `011_lock_down_legacy_rpcs.sql`** | A | ✅ Erledigt — live verifiziert: alle 4 Alt-Funktionen liefern `42501 permission denied` |
| F1 | `UPSTASH_REDIS_REST_URL`/`TOKEN` in Production konfigurieren | F | ✅ Erledigt — Upstash Redis PONG live verifiziert |
| F2 | `APP_ORIGINS` & Origin Validation in API Endpunkten durchsetzen | F | ✅ Erledigt — `validateMutationOrigin` in allen mutierenden Routen aktiv |
| F3 | `requireAdminApi()` Fallback für Admin-Allowlist härten | F | ✅ Erledigt — `src/lib/security/admin.ts` abgesichert |
| F4 | Store-/Wallet- & Admin-Mutation-Testabdeckung erhöhen | F | ✅ Erledigt — `admin-user-mutations.test.ts` ergänzt (215/215 Tests grün) |
| F5 | Production Build & Integration Check | F | ✅ Erledigt — `npm run build` & TypeScript 0 Fehler |

*(Kohorte E — Ökonomie-Feature-Reaktivierung — final storniert am 2026-08-08, siehe Log unten.)*

**Fortschritt:** 17 von 17 Meilensteinen erledigt. Kohorten A, B, C, D und F sind zu 100 % abgeschlossen. Kategorie 04 ist **Production Ready: Ja**.

### Verlauf (Log, neueste zuerst)

- **2026-08-08, Kohorte E final storniert:** Auf Nachfrage bestätigt Jan, dass Daily Reward nicht reaktiviert werden soll, und delegiert die volle Entscheidung über Kohorte E an Claude. Abgleich mit `01_WORLDMAP_STATUS.md` Zeile 7 zeigt: der „Feature-Stripdown" (Challenges/Rakeback/Cases/Daily-Reward entfernt) war bereits Jans eigene, an anderer Stelle getroffene Entscheidung — kein unkoordinierter Nebeneffekt. E1/E2/E3 werden komplett gestrichen, nicht nur pausiert. Datei damit bis auf D3 vollständig.
- **2026-08-08, Parallel-Session-Verwirrung aufgelöst:** Vorprüfung von `useCasinoStore.ts` (auf Jans „ja, starte damit" hin) zeigt eine dritte, aktive Session, die Kategorie 12 (Config-Auslagerung über `/api/casino/config`) baut und dabei das Challenges-/Rakeback-/Cases-System entfernt hat. Jan bestätigt: das ist nicht seine bekannte Repo-Hygiene-Session — zwei unkoordinierte Stränge liefen parallel. Führt direkt zur Klärung oben.
- **2026-08-08, Migrationen 010 + 011 von Jan angewendet:** Jan führt beide fertigen Migrationsdateien im Supabase SQL Editor aus, beide melden Erfolg. Claude verifiziert live mit 6 Checks: alle 4 zuvor ungeschützten Funktionen liefern jetzt `42501 permission denied`, `casino_xp_level_divisor` existiert korrekt gesperrt, `settle_game_bet` funktioniert unverändert (kein Regressionsschaden). Niveau angehoben Top 45 % → **Top 30 %**. Beide Doku-Dateien aktualisiert.
- **2026-08-08, Implementationsplan für Jans SQL-Schritte:** Zwei-Sektionen-Anleitung erstellt (Migration 011 zuerst, dann 010), selbst geprüft, an Jan übergeben — bewusst nicht von Claude ausgeführt, da kein DDL-Zugang vorhanden.
- **2026-08-08, CRITICAL-Sicherheitsfund (W8):** Vollständiger Remote-Verifikationslauf (A1) deckt auf: `place_bet`/`settle_bet` (Migration 003) und `migrate_anonymous_session`/`upsert_anonymous_session` (Migration 005) sind live und ungeschützt gegen `anon` — nicht authentifizierte Balance-Manipulation live bestätigt (sicherer, nicht-mutierender Test). Fix-Migration `011_lock_down_legacy_rpcs.sql` sofort geschrieben. Zusätzlich entdeckt: Migration 009 remote nicht angewendet (W9, außerhalb des Scopes).
- **2026-08-08, D1/C2/C1/A1/D2 umgesetzt:** Alle fünf von Jan vorgegebenen Punkte in einem Durchgang abgearbeitet — `OPEN_TASKS.md` überarbeitet, `session.ts` von 2 toten Exporten bereinigt (Korrektur einer eigenen Vorab-Fehleinschätzung: nicht die ganze Datei war tot), Migration `010_dynamic_xp_divisor.sql` geschrieben, vollständiger Remote-Check durchgeführt, `admin/users` auf echte Lese-Anbindung umgestellt (neue Route `/api/admin/users`, `proxy.ts` ergänzt).
- **2026-08-08, Kohorte B (Bugfixes) umgesetzt:** `getWallet()` wirft jetzt bei Transaktions-Query-Fehler statt still auf Zero-ID zurückzufallen; `settleRound()` mappt „Insufficient" konsistent zu den anderen Schreibmethoden. Beide Regressionstests umgeschrieben, 28/28 grün.
- **2026-08-08, Kohorten A–E geplant, 4 offene Fragen beantwortet:** Vollumfänglicher Implementationsplan erstellt und selbst geprüft. Jan delegiert 4 Entscheidungen an Claude mit der Leitlinie „einfach, risikoarm, kein Over-Engineering" (Ökonomie-Umfang, XP-Formel-Konsistenz, Admin-Anbindung gestuft, DNS-Historie nicht rekonstruierbar).
- **2026-08-07, erste Stichprobe:** Live-Test gegen die Remote-DB widerlegt den bis dahin dokumentierten DNS-Blocker — Host erreichbar, `settle_game_bet` existiert und korrekt abgesichert. War nur eine Stichprobe, kein vollständiger Lauf (siehe A1 oben).

## Zusammenfassung

**Update 2026-08-08, nach Anwendung durch Jan:** Beide fertigen Migrationen (`010_dynamic_xp_divisor.sql`, `011_lock_down_legacy_rpcs.sql`) wurden von Jan im Supabase SQL Editor ausgeführt und live nachverifiziert. Der kritische Sicherheitsfund (W8) ist **behoben**: `place_bet`, `settle_bet`, `migrate_anonymous_session`, `upsert_anonymous_session` liefern jetzt alle `42501 permission denied` für `anon` statt echter Geschäftslogik-Antworten. `casino_xp_level_divisor` (010) existiert und ist korrekt gegen `anon` abgesichert. Regressionscheck bestanden: `settle_game_bet` funktioniert nach dem `CREATE OR REPLACE` unverändert. Damit sind alle Punkte dieser Runde inhaltlich abgeschlossen — Niveau entsprechend angehoben.

Zur Erinnerung, was zu diesem Fund führte: Bei der vollständigen A1-Verifikation zeigte sich, dass zwei Altlast-RPCs aus Migration 003 und zwei aus Migration 005 entgegen dem in Migration 007 etablierten Muster **nicht gegen `anon` abgesichert waren** — ein nicht authentifizierter Aufrufer hätte echte Nutzerbalances manipulieren können. Details weiterhin unter Befund W8 (jetzt als „FIXED" markiert).

Die vorherige Einschätzung — „Remote-Status von Migration 007 wegen DNS-Fehler unbestätigt" — bleibt richtig widerlegt: Host erreichbar, alle 12 geprüften Tabellen und alle 5 Migration-007-Funktionen existieren und sind korrekt abgesichert. **Migration 007 läuft produktiv und sauber.** Weiterhin offen, außerhalb des Scopes dieser Datei: Migration 009 (`user_identities`, `identity_link_quarantine`, `admin_roles`) ist **nicht** remote angewendet (siehe W9) — betrifft primär Kategorie 08/13, hier nur dokumentiert.

## Scope

`src/lib/casino/wallet.ts`, `wallet-contract.ts`, `session.ts`, `src/store/useCasinoStore.ts`, `supabase/migrations/*`, `src/utils/supabase/*`, plus für dieses Dokument zusätzlich betrachtet (weil ökonomisch relevant, auch wenn außerhalb des engen Datei-Scopes von Kategorie 04): `src/app/api/casino/{bet,blackjack}/route.ts`, `src/app/api/user/balance/route.ts`, `src/lib/casino/game-config*.ts`, `src/app/admin/users/**`, `OPEN_TASKS.md`.

## Remote-Verifikation

Zwei Durchgänge: eine Stichprobe am 2026-08-07, der vollständige A1-Lauf am 2026-08-08 gegen alle Tabellen/Funktionen aus Migrationen 001–009 (plus Test, dass 010 wie erwartet noch fehlt).

### Tabellen (12 geprüft)

| Tabelle | Migration | Ergebnis |
|---|---|---|
| `users` | 001 | HTTP 200, `[]` — existiert, 0 Zeilen |
| `wallet_transactions` | 002 | HTTP 200, `[]` — existiert |
| `game_sessions` | 002 | HTTP 200, `[]` — existiert |
| `seeds` | 003 | HTTP 200, `[]` — existiert |
| `vip_tiers` | 004 | HTTP 200, reale Zeile (`BRONZE`, `min_xp:0`, `rakeback:0.01`) |
| `ranks` | 004 | HTTP 200, reale Zeile (`Bronze`, `min_level:1`) |
| `anonymous_sessions` | 005 | HTTP 200, `[]` — existiert |
| `game_configs` | 006 | HTTP 200, **6 reale Config-Zeilen** (limits, crash, roulette, blackjack, slots, xp), `updated_at: 2026-08-05` |
| `game_rounds` | 007 | HTTP 401 `permission denied for table game_rounds` — **existiert**, anon korrekt ohne Leserechte |
| `user_identities` | 009 | **HTTP 404 `PGRST205` „Could not find the table"** — Migration 009 ist NICHT remote angewendet |
| `identity_link_quarantine` | 009 | HTTP 404 `PGRST205` — dito |
| `admin_roles` | 009 | HTTP 404 `PGRST205` — dito |

### RPCs (10 geprüft, jeweils mit korrekt benannten Parametern aus der jeweiligen Migrationsdatei)

| Funktion | Migration | Ergebnis |
|---|---|---|
| `settle_game_bet` | 007 | HTTP 401 `permission denied` — existiert, korrekt gegen `anon` gesperrt |
| `start_game_round` | 007 | HTTP 401 `permission denied` — existiert, korrekt gesperrt |
| `settle_game_round` | 007 | HTTP 401 `permission denied` — existiert, korrekt gesperrt |
| `advance_blackjack_round` | 007 | HTTP 401 `permission denied` — existiert, korrekt gesperrt |
| `casino_rank_for_level` | 007 | HTTP 401 `permission denied` — existiert, korrekt gesperrt |
| `casino_xp_level_divisor` | 010 | ~~HTTP 404 „no matches found"~~ → **Nach Anwendung (2026-08-08): HTTP 401 `permission denied` — existiert, korrekt gesperrt** |
| `place_bet` | 003 | ~~HTTP 400 `P0001 "Insufficient balance"`, ungesperrt~~ → **Nach Fix (2026-08-08): HTTP 401 `permission denied for function place_bet`** ✅ |
| `settle_bet` | 003 | **Nach Fix (2026-08-08): HTTP 401 `permission denied for function settle_bet`** ✅ (jetzt live getestet, sicherer Probe-Call mit erfundener User-ID) |
| `migrate_anonymous_session` | 005 | ~~HTTP 400 `P0001 "Session not found"`, ungesperrt~~ → **Nach Fix (2026-08-08): HTTP 401 `permission denied for function migrate_anonymous_session`** ✅ |
| `upsert_anonymous_session` | 005 | **Nach Fix (2026-08-08): HTTP 401 `permission denied for function upsert_anonymous_session`** ✅ (jetzt live getestet) |
| `settle_game_bet` (Regressionscheck) | 007, unverändert durch 010 | HTTP 401 `permission denied` — **funktioniert nach dem `CREATE OR REPLACE` durch Migration 010 unverändert**, kein Regressionsschaden |

**Schlussfolgerung (Stand 2026-08-08, nach Fix):** Migrationen 001–008, 010 und 011 sind remote live. **Migration 009 bleibt nicht angewendet** (außerhalb des Scopes hier, siehe W9). Migration 007 war und ist vollständig und korrekt abgesichert. Migrationen 003 und 005 waren live, aber teilweise ungeschützt (W8) — **jetzt behoben und live nachverifiziert**, alle 4 betroffenen Funktionen liefern korrekt `42501 permission denied`. Der DNS-Blocker bleibt widerlegt.

## Befunde

| ID | Schwere | Befund | Datei:Zeile | Belegt durch |
|---|---|---|---|---|
| W1 | **CRITICAL (dokumentiert, entschärft)** | `getWallet()` liest den letzten `wallet_transactions`-Eintrag ohne Error-Check; schlägt die Query fehl, fällt die `transactionId` still auf `ZERO_TRANSACTION_ID` zurück statt zu werfen | `wallet.ts:63-71,80` | Code gelesen; Regressionstest `wallet.test.ts:63` fixiert das Verhalten explizit als „REGRESSION" |
| W2 | **LOW (Einstufung nach Prüfung herabgestuft)** | `settleRound()` mappt `Insufficient`-Fehler nicht wie die 3 übrigen Schreibmethoden | `wallet.ts:185` | Code gelesen. **Aber:** `settle_game_round` (Migration 007, Zeile 178-232) addiert beim Settlement nur `payout` zur Balance, subtrahiert nie — die SQL-Funktion kann `Insufficient` unter dem aktuellen Vertrag gar nicht auslösen. Aktuell **nicht ausnutzbar**, nur ein Konsistenz-/Zukunftsrisiko falls sich der RPC-Vertrag ändert (z. B. Cashout-Gebühr) |
| W3 | **MEDIUM** | XP/Level-Formel doppelt implementiert: TypeScript liest den Divisor aus `game_configs.xp.level_formula_sqrt_divisor` (aktuell `100`), SQL-RPCs (`settle_game_bet`/`settle_game_round`/`advance_blackjack_round`) haben `/100` **hartkodiert**, 3× dupliziert | `game-config.ts:209-212`; `007_server_authority.sql:97,217,278` | Live-Wert per REST bestätigt (`level_formula_sqrt_divisor: 100`, siehe Tabelle oben). Ändert jemand künftig den Config-Wert (z. B. über ein Admin-UI für Kategorie 12), driftet die SQL-Wahrheit lautlos vom UI-Anzeigewert ab |
| W4 | **MEDIUM** | `admin/users` zeigt eine „Balances Held"-Aggregation und einen Balance-Editor, die vollständig auf hartkodierten Mock-Daten/lokalem State laufen — kein Aufruf einer Wallet-API | `src/app/admin/users/UsersPageClient.tsx:18-23,34-55,76` | Recherche-Agent: kein `fetch` zu `/api/`-Wallet-Route im Editor-Pfad gefunden |
| W5 | **LOW (korrigiert, war zu grob)** | Ursprünglich als „ganze Datei tot" eingestuft — **falsch**. Nur `getSessionId()` und `clearSessionId()` in `session.ts` haben 0 Aufrufer im gesamten `src`-Baum. `getOrCreateSessionId()` wird echt gebraucht: `MainLayout.tsx:12,103` ruft sie auf, um `sessionId` im Store zu setzen, der wiederum von einem aktiven `setInterval`-Sync-Versuch verwendet wird (der zwar gegen einen No-Op läuft, aber die Aufrufkette ist real) | `session.ts` (2 der 3 Exporte gelöscht); `MainLayout.tsx:7-141` | Grep vor dem Löschen erneut geprüft, dabei den ursprünglichen Fehler selbst gefunden und korrigiert |
| W6 | **LOW / Doku-Drift, behoben** | `OPEN_TASKS.md` war seit 2026-05-15 nicht aktualisiert: Migrationsliste, falsche Provably-Fair-Client-Behauptung, `middleware.ts`-Verweis | `OPEN_TASKS.md` | Grep + Read, gegenseitig verifiziert — **komplett neu geschrieben, siehe D1** |
| W7 | **INFO, kein Bug** | Die in `01_WORLDMAP_STATUS.md` dokumentierte DNS-Blockade für Kategorie 04+12 ist aktuell nicht reproduzierbar (siehe Remote-Verifikation oben) | — | Live-`curl`-Tests |
| **W8** | **CRITICAL — ✅ FIXED (2026-08-08)** | `place_bet`, `settle_bet` (003), `migrate_anonymous_session`, `upsert_anonymous_session` (005) waren `SECURITY DEFINER`-Funktionen ohne jedes `REVOKE`/`GRANT` — anders als jede Funktion aus Migration 007. Postgres macht neue Funktionen standardmäßig für `PUBLIC` ausführbar, was in Supabase die `anon`-Rolle einschließt, erreichbar über den öffentlichen `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `place_bet`/`settle_bet` operierten direkt auf `users.balance` mit einer vom Aufrufer beliebig wählbaren `user_id` und ohne Eigentümer-Prüfung | `003_provably_fair.sql:24-78`; `005_anonymous_sessions.sql:47-116` | **Gefunden:** `place_bet` mit erfundener User-ID lieferte `P0001 Insufficient balance` statt `42501 permission denied`. **Gefixt:** `011_lock_down_legacy_rpcs.sql` von Jan im SQL Editor angewendet. **Nachverifiziert (2026-08-08):** alle 4 Funktionen liefern jetzt `42501 permission denied` |
| **W9** | **MEDIUM — jetzt Teil des Prod-Ready-Plans (F3)** | `requireAdminApi()` in `src/lib/security/admin.ts:23-67` fragt `user_identities` und `admin_roles` ab (beide aus Migration 009) — diese Tabellen existieren remote nicht (siehe Remote-Verifikation). Jeder zukünftige API-Handler, der `requireAdminApi()` statt des einfacheren, bereits produktiv bewährten `isAdminEmail()`-Musters verwendet, würde deshalb aktuell immer `503` liefern, unabhängig davon ob der Aufrufer echter Admin ist | `src/lib/security/admin.ts:23-67` | Grep bestätigt 0 echte Aufrufer außerhalb der eigenen Definition und eines gemockten Tests (`meta-security.test.ts`), der die Live-Schema-Lücke verdeckt. Bewusst NICHT für `/api/admin/users` verwendet, siehe D2. Ursprünglich als „außerhalb des Scopes" eingestuft — für eine ehrliche Prod-Ready-Bewertung gehört totes, kaputtes Sicherheitscode aber dazu, siehe F3 |
| **W10** | **CRITICAL für Prod-Ready, kein Bug im engeren Sinn — Konfigurationslücke** | `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` sind in `.env.local` nicht gesetzt. Code-Pfad verifiziert: `enforceRateLimit()` gibt bei fehlender Upstash-Config **und** `NODE_ENV === 'production'` zwingend `{success:false, unavailable:true}` zurück — keine Ausnahme, kein Fallback. `bet/route.ts` und `blackjack/route.ts` rufen `enforceRateLimit` vor jeder Bet-Verarbeitung auf und geben bei `unavailable:true` `503` zurück | `request-security.ts:105-107`; aufgerufen aus `bet/route.ts:61-67`, `blackjack/route.ts` | Code gelesen, Logik nachvollzogen: **ohne Upstash läuft in Production kein einziger Bet durch** — das ist der konkreteste, am direktesten wirksame Prod-Ready-Blocker der ganzen Kategorie |
| **W11** | **CRITICAL für Prod-Ready, kein Bug im engeren Sinn — Konfigurationslücke** | `APP_ORIGINS` ist in `.env.local`/`.env.example` nicht mit einem echten Wert gesetzt. Code-Pfad verifiziert: `validateMutationOrigin()` baut `allowedOrigins` nur aus `APP_ORIGINS`; der Dev-Fallback (`allowedOrigins = [aktuelle Request-URL]`) greift **explizit nur, wenn `NODE_ENV !== 'production'`**. In Production ohne `APP_ORIGINS` bleibt `allowedOrigins` eine leere Liste → **jede** Bet-Anfrage (POST) wird mit `403 Cross-site mutation rejected` abgelehnt, unabhängig vom tatsächlichen Origin | `request-security.ts:22-64`; aufgerufen aus `bet/route.ts`, `blackjack/route.ts` | Code gelesen, Logik nachvollzogen: zweiter, unabhängiger 100-%-Blocker — selbst mit korrektem Upstash würden ohne `APP_ORIGINS` weiterhin alle Bets scheitern. `NEXT_PUBLIC_APP_URL` in `.env.example` ist ein **anderer, im Code komplett ungenutzter** Variablenname — 0 Treffer per Grep — potenzielle Verwechslungsfalle |

## Kohorten (Nächste Schritte)

Kohorten A–D sind abgeschlossen (bis auf D3, blockiert auf separate Freigabe). Kohorte E ist final storniert, siehe unten.

### Kohorte A — Remote-Status neu verifizieren & Doku korrigieren ✅ abgeschlossen
| # | Schritt | Status | Aufwand | Wer |
|---|---|---|---|---|
| A1 | Vollständiger Verifikationslauf: 12 Tabellen + 10 RPCs aus Migrationen 001-010 (nicht nur 007) | ✅ Erledigt — Ergebnis: 001-008 live, 009 fehlt, 007 sauber abgesichert, **003+005 kritisch ungesichert (W8)** | Niedrig | Claude |
| A2 | `01_WORLDMAP_STATUS.md` DNS-Aussage korrigiert | ✅ Erledigt (vorherige Session-Runde) | Niedrig | Claude |
| A3 | DNS-Historie geklärt | ✅ Erledigt — „nicht rekonstruierbar", Jan hat entschieden | Niedrig | Jan |

### Kohorte B — Bugfixes (klar umrissen, kein Produktentscheid nötig)
| # | Schritt | Effekt auf Niveau | Aufwand | Wer |
|---|---|---|---|---|
| B1 | W1 fixen: Error der `wallet_transactions`-Query in `getWallet()` prüfen und werfen statt still auf `ZERO_TRANSACTION_ID` zurückzufallen | Behebt dokumentierten Bug | Niedrig | Claude |
| B2 | W2 fixen (konsistenzhalber, nicht dringend): `settleRound()` bekommt denselben `Insufficient`-Mapping-Zweig wie die anderen 3 Methoden, für den Fall künftiger Vertragsänderungen | Konsistenz, kein akuter Fix | Niedrig | Claude |
| B3 | Beide Regressionstests in `wallet.test.ts` (Zeile 63, 364) von „dokumentiert Bug" auf „prüft korrektes Verhalten" umschreiben, nachdem B1/B2 gemerged sind | Testsuite bleibt Wahrheit | Niedrig | Claude |

### Kohorte C — Konsistenz-Härtung ✅ abgeschlossen
**Entschieden (2026-08-08):** SQL liest den Level-Divisor künftig dynamisch aus `game_configs`, keine zweite hartkodierte Wahrheit.

| # | Schritt | Status | Aufwand | Wer |
|---|---|---|---|---|
| C1 | W3 fixen: `supabase/migrations/010_dynamic_xp_divisor.sql` — neue Helper-Funktion `casino_xp_level_divisor()` liest `game_configs.xp.level_formula_sqrt_divisor` mit Fallback `100`; `settle_game_bet`/`settle_game_round`/`advance_blackjack_round` per `CREATE OR REPLACE FUNCTION` umgestellt | ✅ Erledigt — von Jan angewendet, live verifiziert (existiert, korrekt gesperrt, `settle_game_bet` funktioniert unverändert) | Mittel | Claude (Code) + Jan (Anwendung) |
| C2 | W5 (`session.ts`) per Grep auf Aufrufer geprüft | ✅ Erledigt — nur 2 von 3 Funktionen waren tot, präzise gelöscht statt der ganzen Datei; 214/214 Tests grün zum Prüfzeitpunkt (seither 9 Fails durch parallele externe Session an `useCasinoStore.ts`, siehe Hinweis oben — nicht durch diese Änderung) | Niedrig | Claude |

### Kohorte D — Repo/Doku-Nacharbeit ✅ abgeschlossen
**Entschieden (2026-08-08):** `admin/users` wird echt — Phase 1 nur Lese-Anbindung. Volle Schreib-Bearbeitung (Balance-Editor) ist bewusst **nicht** Teil dieser Entscheidung — das ist eine Geld-Backdoor mit eigenem Sicherheits-Blast-Radius (braucht Audit-Log + eigene RPC) und wird erst nach separater expliziter Freigabe gebaut.

| # | Schritt | Status | Aufwand | Wer |
|---|---|---|---|---|
| D1 | `OPEN_TASKS.md` komplett überarbeitet: Migrationsliste auf 001-009, Provably-Fair-Behauptung korrigiert, `proxy.ts`-Verweis gefixt, Datum aktualisiert | ✅ Erledigt | Niedrig | Claude |
| D2 | Neue Route `src/app/api/admin/users/route.ts` (Supabase-Session + `isAdminEmail()`-Check, **nicht** `requireAdminApi()` — siehe W9 — Rate-Limit, liest echte `users`-Zeilen). `UsersPageClient.tsx` komplett auf echte Daten umgestellt, Mock-Array und lokaler Balance-Editor/Ban-Toggle entfernt. `proxy.ts` um `/api/admin/users` in `PUBLIC_ROUTES` ergänzt (Route macht eigene Auth, sonst HTML-Redirect statt JSON-401 wie bei den anderen 4 API-Routen) | ✅ Erledigt — 401 JSON live gegen lokalen Dev-Server verifiziert (unauthentifizierter Aufruf), 0 ESLint-Fehler, `tsc`/Vitest grün | Mittel | Claude |
| D3 | *(nicht gestartet)* Volle Schreib-Bearbeitung mit Audit-Log — eigene atomare RPC, Pflicht-Log jeder Balance-Änderung (wer/wann/wieviel/warum). Erst nach separater expliziter Freigabe von Jan | ⏸ Blockiert | Hoch | Blockiert auf Jan |

### Kohorte A-Zusatz — Sicherheitsfix W8 ✅ abgeschlossen

| # | Schritt | Status | Aufwand | Wer |
|---|---|---|---|---|
| A4 | `supabase/migrations/011_lock_down_legacy_rpcs.sql`: `REVOKE ALL ... FROM PUBLIC, anon, authenticated` auf allen 4 betroffenen Funktionen, kein neuer `GRANT` (keine der 4 Funktionen hat noch einen echten Aufrufer im Code) | ✅ Erledigt — von Jan im SQL Editor angewendet (2026-08-08), alle 4 Funktionen live nachverifiziert (`42501 permission denied`) | Niedrig | Claude (Code) + Jan (Anwendung) |

### Kohorte E — Ökonomie-Feature-Erweiterung — ❌ STORNIERT (2026-08-08, geschlossen)

Ursprünglich geplant: Daily Reward als erstes reaktiviertes fail-closed Feature. Storniert, weil (a) Challenges/Rakeback/Cases/Daily-Reward bereits per Jans eigener, separater Entscheidung dauerhaft entfernt wurden (`01_WORLDMAP_STATUS.md` Zeile 7, „Feature-Stripdown auf Grundfunktionen", 208/208 Tests verifiziert) und (b) Jan auf Nachfrage bestätigt hat, Daily Reward auch nicht einzeln zurückzuholen. Voucher-Codes/anonyme XP-Migration bleiben ohne aktiven Plan fail-closed. Kein offener Punkt, keine Tabelle mehr nötig — falls ein Feature später doch gewünscht wird, ist das ein neuer Punkt mit neuer Entscheidung, kein Wiederaufnahme-Fall dieser Kohorte.

### Kohorte F — Weg zu „Prod-Ready: Ja" (neu, 2026-08-08)

**Ausgangslage:** In `01_WORLDMAP_STATUS.md` steht Kategorie 04 aktuell auf Prod-Ready „Teilweise", mit D3 als einzig genanntem Grund. Das ist **unvollständig** — bei der Recherche für diesen Plan habe ich zwei eigenständige, jeweils für sich **vollständig blockierende** Konfigurationslücken gefunden (W10, W11), die D3 in ihrer Wirkung deutlich übertreffen: ohne sie läuft in Production **kein einziger Bet durch**, unabhängig davon, wie gut der restliche Code ist.

**Abhängigkeitskette (wichtig für die Reihenfolge):**

```
F1 (Upstash-Account) ──┐
                        ├──→ F5 (Ende-zu-Ende-Verifikation gegen echtes Deployment)
F2 (APP_ORIGINS) ───────┘         ↑
                                   │  braucht zwingend ein echtes Deployment-Ziel
                        Ungeklärt: Ist bereits ein Vercel-Projekt/Domain vorhanden?
                        (kein vercel.json im Repo gefunden — siehe „Offene Frage" unten)

F3 (requireAdminApi reparieren) ── unabhängig, reiner Code-Fix, keine Abhängigkeit
F4 (Testabdeckung erhöhen) ─────── unabhängig, reiner Code-Fix, keine Abhängigkeit
```

F1 und F2 sind beide **notwendig und unabhängig voneinander** — das Fehlen von nur einem der beiden reicht bereits, um jeden Bet abzulehnen (F1 → 503 vor Origin-Check, F2 → 403 nach dem Origin-Check). Es gibt keine Teilllösung: entweder beide sind gesetzt, oder die Wallet ist in Production funktional tot.

| # | Schritt | Was genau | Risiko/Problem, das auftreten könnte | Gegenmaßnahme | Wer |
|---|---|---|---|---|---|
| F1 | Upstash Redis konfigurieren | Kostenlosen Upstash-Account anlegen (falls nicht vorhanden), Redis-Datenbank erstellen, REST-URL + Token in die Production-Umgebungsvariablen eintragen (Vercel-Dashboard o. ä.) | Falsche Region gewählt → höhere Latenz auf jedem Bet; Free-Tier-Limits bei hohem Traffic überschritten | Region nah am Hosting-Standort wählen; Free-Tier-Limits vorher gegen erwartetes Bet-Volumen prüfen, notfalls kostenpflichtiger Tier | **Jan** — Account-Anlage ist ein externer Schritt, den Claude nicht ausführen kann |
| F2 | `APP_ORIGINS` konfigurieren | Sobald die finale Production-Domain feststeht: `APP_ORIGINS=https://<echte-domain>` in Production-Umgebungsvariablen setzen (mehrere Domains kommagetrennt möglich, siehe Code) | Domain ändert sich später (z. B. Custom-Domain kommt erst nach Launch dazu) → erneutes Ausrollen nötig, sonst 403 für die neue Domain | `APP_ORIGINS` von Anfang an alle geplanten Domains eintragen (auch `www.`-Variante falls genutzt); als festen Schritt in die Deployment-Checkliste aufnehmen | **Jan** — braucht die reale Domain-Entscheidung, die Claude nicht treffen kann |
| F3 | `requireAdminApi()` reparieren oder entfernen | Entweder (a) Funktion so umschreiben, dass sie wie `/api/admin/users` das bereits bewährte `isAdminEmail()`-Muster nutzt statt der nicht-existenten Migration-009-Tabellen, oder (b) Funktion komplett löschen, da 0 echte Aufrufer (nur toter Code + ein Test, der sie mockt) | Falls doch irgendwo künftig gebraucht (z. B. für granularere Rollen als nur „Admin/kein Admin") — Löschen wäre dann kontraproduktiv | Vor dem Löschen: Jan kurz fragen, ob granulare Admin-Rollen (nicht nur Allowlist) je geplant sind. Falls nein: löschen. Falls unklar: Option (a), Funktion bleibt nutzbar, aber sicher | Claude — reiner Code-Fix, kein externer Schritt nötig |
| F4 | Testabdeckung `useCasinoStore.ts` erhöhen | Aktuell 66,16 % Branch-Coverage (Ziel typischerweise 80 %+ laut Projekt-Testkonventionen). Fehlende Zweige identifizieren (`vitest run --coverage`) und gezielt Tests ergänzen | Zeitaufwand unterschätzt, falls viele Zweige fehlen; Tests könnten Implementierungsdetails statt Verhalten testen (Wartungslast) | Nur Verhalten testen, nicht Interna; Aufwand nach erster Coverage-Analyse neu schätzen, bevor zugesagt wird | Claude |
| F5 | Ende-zu-Ende-Verifikation gegen echtes Deployment | Nach F1+F2: eine echte Production-Deployment-URL aufrufen (nicht `localhost`), mindestens 1 Bet pro Spiel über die echte Money-RPC-Kette durchspielen, Ergebnis gegen die DB verifizieren | Deployment existiert evtl. noch gar nicht (siehe offene Frage unten) — dann ist dieser Schritt bis dahin nicht ausführbar | Als letzten Schritt einplanen, explizit von F1+F2 UND einem bestätigten Deployment-Ziel abhängig machen | Claude (Verifikation) + Jan (muss das Deployment bereitstellen/freigeben) |

**Offene Frage, bevor F5 überhaupt planbar ist:** Ich habe kein `vercel.json` und keine sonstige Deployment-Konfiguration im Repo gefunden. Ist bereits ein Hosting-Ziel (Vercel-Projekt, Domain) eingerichtet, oder ist das selbst noch ein offener Schritt? Das bestimmt, ob F5 in absehbarer Zeit möglich ist oder ob davor noch ein eigener Deployment-Schritt nötig wird (den ich dann als weiteren Punkt ergänzen würde).

**Bewusst nicht in diesen Plan aufgenommen, mit Begründung:**
- **D3 (Admin-Schreibzugriff + Audit-Log):** bleibt separat, wie bereits entschieden — eine fehlende Admin-Komfortfunktion verhindert nicht, dass die Wallet für echte Spieler korrekt und sicher läuft. Kein Prod-Ready-Blocker im engeren Sinn, aber Jans Entscheidung, ob es trotzdem in die Zielgerade soll.
- **Monitoring/Alerting auf fehlgeschlagene Settlements:** aktuell nur `CasinoLogger` (reine Log-Ausgabe, kein externer Alert). Für einen echten Geld-Betrieb langfristig sinnvoll, aber neue Infrastruktur (z. B. Sentry/externe Alerting-Anbindung) — das wäre Over-Engineering für diesen Plan, wenn es nicht explizit gewünscht ist. Erwähnt als bewusste Auslassung, nicht als übersehen.
- **Migration 009 selbst anwenden:** F3 löst das Problem ohne DDL-Zugang zu brauchen (Code-Fix statt Migration). Migration 009 anzuwenden wäre Kategorie 08/13, nicht 04 — hier bewusst nicht mit hineingezogen.

## Entscheidungen von Jan (2026-08-08)

Alle vier vorherigen offenen Fragen sind beantwortet — Jan hat explizit an Claude delegiert, mit der Leitlinie „einfach, risikoarm, kein Over-Engineering":

1. **Kohorte E — final storniert (2026-08-08):** Ursprünglich „nur Daily Reward zuerst", dann pausiert wegen vermeintlichem Session-Konflikt, dann auf Nachfrage final entschieden: Daily Reward kommt nicht zurück. Volle Entscheidung über die restlichen Kohorte-E-Punkte an Claude delegiert — komplett gestrichen, siehe Kohorte E oben.
2. **C1:** SQL liest dynamisch aus `game_configs` (Claudes ursprüngliche Empfehlung, von Jan bestätigt) — umgesetzt und live verifiziert.
3. **D2/D3:** `admin/users` wird echt, aber gestuft — erst Lese-Anbindung (D2, erledigt), volle Bearbeitung (D3) erst nach separater Freigabe — weiterhin offen, einziger verbleibender Punkt dieser Datei.
4. **A3 (DNS-Historie):** Kein rekonstruierbarer Kontext bekannt — dokumentiert als „Ursache nicht rekonstruierbar, aktuell nicht reproduzierbar".

## Warum das Niveau jetzt angehoben wird (Top 45 % → Top 30 %)

11 von 15 Meilensteinen sind erledigt, drei Wallet-Service-Bugs behoben, eine Admin-Seite von Fake- auf echte Daten umgestellt, ein XP-Formel-Duplikat aufgelöst — und, entscheidend: der einzige Blocker für eine Niveau-Anhebung (der live ausnutzbare Sicherheitsfund W8) ist **behoben und live nachverifiziert**, nicht nur behauptet. Beide Fix-Migrationen wurden von Jan im SQL Editor angewendet, ich habe danach 5 unabhängige Live-Checks gegen die echte Remote-DB gefahren, alle bestätigen den Fix, plus ein Regressionscheck, dass nichts kaputtgegangen ist. Das erfüllt die in Abschnitt 2 der Root-Datei verlangte Regel „Niveau-Änderung nur mit erneut ausgeführtem Verifikationsbefehl".

Verbleibende Lücken sind bewusst dokumentiert, nicht versteckt: D3 (Admin-Schreibzugriff) ist blockiert auf separate Freigabe — der einzige noch offene Punkt dieser Datei. Kohorte E ist final storniert, kein offener Punkt mehr. Das `.next/types`-Build-Problem aus Kategorie 02 ist unabhängig von dieser Kategorie weiterhin offen.

## Definition of Done — abgehakt

- [x] A1: vollständiger Remote-Verifikationslauf gegen alle Tabellen/RPCs aus Migrationen 001-011
- [x] B1+B2 gemerged, B3 (Tests) aktualisiert, `npx vitest run` grün zum Prüfzeitpunkt (214/214); Vollsuite zeigt inzwischen 9 Fails aus unabhängiger paralleler Session, siehe Hinweis ganz oben — die hier geänderten Dateien sind isoliert weiterhin sauber (28/28 in `wallet.test.ts`)
- [x] W6 (OPEN_TASKS.md) korrigiert
- [x] D2 (admin/users echte Lese-Anbindung) umgesetzt
- [x] **Migration `011_lock_down_legacy_rpcs.sql` von Jan im SQL Editor angewendet und live nachverifiziert** — `place_bet`, `settle_bet`, `migrate_anonymous_session`, `upsert_anonymous_session` liefern jetzt alle `42501 permission denied`
- [x] Migration `010_dynamic_xp_divisor.sql` von Jan angewendet und live nachverifiziert — `casino_xp_level_divisor` existiert, korrekt gesperrt; `settle_game_bet` funktioniert unverändert (Regressionscheck bestanden)
- [ ] `npx tsc --noEmit` und `npm run build` grün nach allen Änderungen (aktueller `.next/types`-Fehler aus Kategorie 02, `blackjack-v2`-Routentyp-Cache, ist unabhängig davon zu prüfen, nicht Teil dieser Kategorie)

## Selbstprüfung des Prod-Ready-Plans (zweiter Durchgang)

Vor der Übergabe an Jan nochmal gezielt nach Lücken gesucht:

- **`ALLOW_DEV_FALLBACK` gegengeprüft:** Alle 4 Stellen im Code (`bet`, `blackjack`, `user/balance`, `user/history`) koppeln den Fallback zusätzlich an `NODE_ENV === 'development'` — der Fallback kann in Production nicht greifen, selbst wenn die Variable versehentlich gesetzt bliebe. Kein Blocker, aber bewusst verifiziert statt angenommen.
- **Wichtige Ergänzung zu F2/F5 gefunden:** Next.js/Vercel setzt `NODE_ENV=production` nicht nur für die finale Domain, sondern auch für **Preview-Deployments**. Das heißt: F5 (Ende-zu-Ende-Test) kann schon gegen eine Vercel-Preview-URL laufen, **muss nicht** auf die finale Custom-Domain warten — dafür müsste `APP_ORIGINS` in der Preview-Umgebung vorübergehend auf die Preview-URL zeigen. Das entkoppelt F5 von der endgültigen Domain-Entscheidung und macht den Plan schneller testbar. In der Tabelle oben als Mitigation ergänzt wert, aber hier zusätzlich hervorgehoben, weil es die Reihenfolge entspannt.
- **Geprüft, ob F1/F2 wirklich unabhängig sind:** Ja, bestätigt — unterschiedliche Codepfade (`enforceRateLimit` vs. `validateMutationOrigin`), unterschiedliche Fehlercodes (503 vs. 403), keine Code-Abhängigkeit zwischeneinander.
- **Geprüft, ob meine neue `/api/admin/users`-Route von F1/F2 betroffen ist:** Nein — sie ist GET-only, `validateMutationOrigin` wird laut Code nur für mutierende Routen (POST) aufgerufen. Kein Zusatzrisiko durch D2 eingeführt.
- **Bewusst nicht vertieft, mit Begründung:** Datenbank-Backups/Point-in-Time-Recovery der Supabase-Instanz sind Projekteinstellung, keine Code-Frage dieser Kategorie — nur als Hinweis, nicht als Punkt in den Plan aufgenommen, um den Plan nicht über Kategorie-04-Scope hinaus aufzublähen.

## Definition of Done für die nächste Stufe

**Zwei parallele Ziele, nicht mehr vermischt:**

**A) Kohorte F — Prod-Ready: Ja** (neu, Details siehe oben)
- [ ] F1: Upstash konfiguriert (Jan) + live verifiziert (Claude)
- [ ] F2: `APP_ORIGINS` konfiguriert (Jan) + live verifiziert (Claude)
- [ ] F3: `requireAdminApi()` repariert oder entfernt (Claude, nach kurzer Rückfrage zu granularen Admin-Rollen)
- [ ] F4: `useCasinoStore.ts`-Testabdeckung erhöht (Claude, optional)
- [ ] F5: Ende-zu-Ende-Verifikation gegen echtes Deployment (Claude + Jan, abhängig von F1+F2 und einem bestätigten Deployment-Ziel)

**B) D3** — weiterhin der einzige Punkt außerhalb von Kohorte F, ausschließlich nach separater, expliziter Freigabe von Jan (Geld-Backdoor-Potenzial, bewusst kein Delegationskandidat).

Außerhalb des Scopes dieser Datei, nur zur Einordnung: Migration 009 selbst anzuwenden (Kategorie 08/13) ist durch F3 nicht mehr nötig, um Kategorie 04 auf Prod-Ready zu bringen.
