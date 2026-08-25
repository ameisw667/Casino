# 05 — In-App-Benachrichtigungen

> **Status:** Executed (archiviert) · **Stand:** 2026-08-24 · **Owner:** LLM · **Scope:** Persistente, kontogebundene In-App-Inbox für bestätigte Big Wins, Achievement-Unlocks und Systemhinweise; keine Wallet-Autorität, externe Zustellung oder Änderung des Telegram-Consumers.

> **Abnahme:** Remote-Schema und Jan-UAT sind verifiziert. Der Drawer erhielt anschließend Option 1 „Obsidian Glass“: eine kontraststarke, weiterhin glasartige Oberfläche über animiertem Spielinhalt.

> **Ausführung:** Dieser Plan folgt `xx_sop/02_workflow_jan_execution.md`, `xx_sop/05_database_supabase.md` und `xx_sop/07_api_backend_routes.md`; alle Produktionsänderungen sind testgetrieben.

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| --- | --- | --- | --- | --- |
| L0 | Entscheidung Option 1 | 🟢 Verifiziert | Persistente Inbox mit Server-Service und privatem Broadcast gewählt | Jan |
| L1 | Datenmodell und Realtime-Autorisierung | 🟢 Lokal verifiziert | Migration 050 + RLS-/Realtime-Negativtest vorhanden | LLM |
| L2 | Service und sichere API-Grenze | 🟢 Lokal verifiziert | Service, API und Security-Contracts grün | LLM |
| L3 | Producer für Big Win und Achievement | 🟢 Lokal verifiziert | Best-effort-Producer und Regressionsschutz grün | LLM |
| L4 | Header-Inbox und Live-Aktualisierung | 🟢 Lokal verifiziert | Glocke, Badge, Drawer und API-Refresh eingebunden | LLM |
| L5 | Verifikation und Dokumentation | 🟢 Verifiziert | Plan archiviert, P43 aus aktiver Roadmap entfernt | Jan + LLM |

## 2 — Entscheidung, Ziel und Abgrenzung

**Gewählte Architektur:** `user_notifications` ist die dauerhafte Wahrheit. Ein serverseitiger `NotificationService` schreibt ausschließlich erlaubte Inhalte und sendet danach einen schmalen privaten Broadcast. Die Browser-Inbox lädt über eine authentifizierte API; ein verpasster Broadcast kann deshalb keine Nachricht verlieren.

**In Scope**

- Nachrichtenarten `big_win`, `achievement` und `system` mit Titel, Text, erlaubten Metadaten, Erstellzeit und Lesestatus.
- Idempotente Erzeugung mit eindeutigem `(user_id, source_key)`.
- Authentifizierte Liste, einzelne Nachricht lesen und alle Nachrichten lesen.
- Privater Supabase-Realtime-Broadcast pro Nutzer, ausschließlich serverseitig gesendet.
- Header-Glocke, ungelesene Anzahl und zugänglicher Inbox-Drawer.
- Best-effort-Erzeugung für Big Win und Achievement ohne Einfluss auf Settlement oder Achievement-Sync.

**Nicht-Scope**

- Keine Browser-Schreibrechte, Wallet-, XP-, RNG- oder Payout-Änderung.
- Keine Änderung an `wallet_events`, seinem XP-/Telegram-Consumer oder Trigger.dev.
- Keine E-Mail-, Web-Push-, Telegram- oder Marketingzustellung.
- Keine neue serverautoritative Achievement-Engine (P42) und kein Lösch-/Retention-Job.

## 3 — Daten-, Sicherheits- und Fehlervertrag

| Bereich | Festlegung | Allowlist / Negativtest | Fallback |
| --- | --- | --- | --- |
| Datenklasse | UUID `id`, Text-`user_id` mit FK auf `users`, `kind`, `title`, `body`, JSONB-`metadata`, `source_key`, `created_at`, `read_at` | Nur `big_win`, `achievement`, `system`; fremde/leere ID, unbekannter Typ und doppelter Schlüssel sind abgewiesen bzw. dedupliziert | Bestehende Funktion bleibt erfolgreich; Fehler wird geloggt |
| DB-Rechte | RLS aktiv; keine Tabellenrechte für `anon`/`authenticated`; nur Service Role | Test prüft RLS, Grants, FK, Kind-Check und Unique-Index | API antwortet fail-closed; Browser liest nie die Tabelle direkt |
| Realtime | Topic `user-notifications:<userId>`; nur Server publiziert; SELECT-Policy nur für den eigenen Nutzer | Richtiger/fremder Nutzer und falsches Topic werden geprüft; Payload enthält keine Walletwerte | API-Refresh ist die Wahrheit, Broadcast nur Beschleuniger |
| API | `GET /api/notifications`, `PATCH /api/notifications/[id]`, `POST /api/notifications/read-all` | Session, Rate-Limit, Origin, UUID und Besitz; `private, no-store` | 401/403/400/429/503, keine stille Statusmutation |
| Producer | Big Win mit Settlement-`requestId`; Achievement nur beim neuen Unlock mit `achievement:<id>` | Retry erzeugt kein Duplikat; normale Gewinne, Fortschritt und alter Unlock erzeugen nichts | Erzeugung wird abgefangen; Geschäftsprozess bleibt unabhängig |

**Money-Pfad:** Nein.  
**Security-Review:** Pflicht — neue DB-Schreiboperation, private API und Realtime-Policy.  
**Reversibilität:** Additive Tabelle, Service, API und UI ohne Eingriff in Settlement oder Wallet.

## 4 — Datei- und Schnittstellenplan

| Datei | Verantwortung |
| --- | --- |
| `supabase/migrations/050_user_notifications.sql` | Additive Tabelle, Constraints, Service-Role-Grenze, private Realtime-Policy. |
| `src/lib/casino/notifications.ts` | Server-only-Typen, Listen, ungelesene Anzahl, Lesestatus, idempotentes Erzeugen, Publish-after-persist. |
| `src/lib/casino/realtime.ts`, `src/lib/casino/realtime-types.ts` | Private Notification-Topic-/Event-Contracts neben dem Crash-Channel. |
| `src/app/api/notifications/**` | Liste sowie sichere Einzel-/Alle-gelesen-Mutationen. |
| `src/lib/casino/telegram-notifier.ts` | Additiver Big-Win-Producer ohne Telegram-Outbox-Änderung. |
| `src/app/api/user/stats/route.ts` | Achievement-Producer nur beim neuen Unlock-Übergang. |
| `src/components/layout/NotificationCenter.tsx` | API-Laden, Fehlerzustand, Broadcast-Refresh, Drawer. |
| `src/components/layout/MainHeader.tsx`, `src/components/layout/MainLayout.tsx` | Glocke und Shell-Einbindung. |
| `src/lib/casino/__tests__/notifications*.test.ts` | Service-, Migrations- und Realtime-Sicherheit. |
| `src/lib/security/__tests__/notifications-routes.test.ts` | Auth-, CSRF-, Rate-Limit-, UUID- und Fremdbesitz-Negativtests. |
| `worldmap/05_ZUKUNFTSPLANUNG.md` | P43-Status und Nachweis. |

## 5 — Umsetzungsschritte

### Task 1: Datenvertrag testgetrieben absichern

- [x] Fehlschlagenden Migrationstest für Tabelle, Constraints, Service-Role-only und privaten Topic schreiben.
- [x] RED mit `npm run test -- src/lib/casino/__tests__/notifications-migration.test.ts` belegen.
- [x] Migration `050_user_notifications.sql` nach Inventur der höchsten Nummer additiv implementieren.
- [x] GREEN-Migrationstest ausführen.

### Task 2: Service und Realtime testgetrieben implementieren

- [x] Fehlschlagende Tests für Idempotenz, Allowlist, persist-before-publish, Publish-Fehler, Liste und Fremdbesitz schreiben.
- [x] RED ausführen.
- [x] `NotificationService` und die isolierten Realtime-Contracts implementieren.
- [x] Service- und Migrationstests grün ausführen.

### Task 3: Sichere API und Producer testgetrieben anbinden

- [x] Fehlschlagende Routentests für Session, Origin, Rate-Limit-Ausfall, UUID, Besitz, Einzel- und Alle-gelesen schreiben.
- [x] RED ausführen.
- [x] API-Routen mit bestehender Session-, CSRF-, Rate-Limit- und `private, no-store`-Konvention implementieren; keine `user_id` aus Requests akzeptieren.
- [x] Big-Win- und Achievement-Producer für Retry, normalen Gewinn, Progress-Update und neuen Unlock testen und implementieren.
- [x] Alle Service-, Producer- und Routentests grün ausführen.

### Task 4: Zugängliches Notification-Center testgetrieben einbauen

- [x] Fehlschlagende Component-Tests für Badge, Leerzustand, Einzel-/Alle-gelesen, Fehler und Broadcast-Refresh schreiben.
- [x] RED ausführen.
- [x] Glocke, Drawer, Tastaturbedienung, `aria-label`/`aria-live` und mobile Darstellung implementieren; Broadcast erzeugt keine ungeprüfte lokale Nachricht.
- [x] Component-Tests grün ausführen.

### Task 5: Security-Nachweis und Abschluss

- [x] Audit: kein Client-Schreibrecht, kein fremder Topic, keine Walletwerte in Payload, keine Veränderung von Settlement oder Telegram-Outbox.
- [x] `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build` und `npm run vibe-check` erfolgreich ausgeführt.
- [x] Jan-UAT in angemeldeter App: Big-Win- und Achievement-Nachrichten erscheinen in der Inbox; der Funktionsfluss wurde bestätigt.
- [x] Plan als `Executed (archiviert)` nach `docs/archive/` verschoben und P43 aus `worldmap/05_ZUKUNFTSPLANUNG.md` entfernt.

## 6 — Selbstprüfung für Execution-Ready

- [x] P42, Telegram und Wallet-Outbox abgegrenzt.
- [x] Datenklasse, Schreiboperationen, API und Realtime enthalten Allowlist, Negativtest und Fallback.
- [x] Migrationsreihenfolge, Tests und lokale Prüf-URLs sind festgelegt.
- [x] Die einzige optionale Jan-Tätigkeit nach Umsetzung ist die lokale Sichtprüfung.
## 7 — Ausführungsnachweis (lokal)

- 2026-08-23: Migration 050, Service, private Realtime-Policy, API-Routen, Big-Win-/Achievement-Producer und Header-Inbox lokal implementiert.
- Verifiziert: zielgerichtete P43-Suite 22/22 und vollständige Suite 1.000/1.000 Tests grün; TypeScript und ESLint ohne Befund; `vibe-check` abgeschlossen (nur bestehende, fremde Hinweise).
- Historischer, gelöster Blocker (2026-08-23): `next build` war durch eine vorhandene `.next/lock`-Sperre blockiert. Der finale Production-Build vom 2026-08-24 ist erfolgreich.
## 8 — Remote-Nachweis

- 2026-08-24: Jan hat `050_user_notifications.sql` im Supabase SQL Editor des Casino-Projekts ausgeführt.
- Verifiziert: `npm run verify:supabase` meldet für `hmqwozhdckbwjqzcmire` Auth-, REST- und Service-Role-Probes mit HTTP 200.
- Verifiziert: `npm run supabase:types` erzeugte aus dem Remote-Schema `src/types/database.types.ts`; darin ist `user_notifications` mit allen erwarteten Feldern und dem FK zu `users` enthalten.
- Einschränkung: Der SQL Editor schreibt keinen CLI-Migrationsvermerk. `npm run supabase:migrations` führt daher `050` weiterhin ohne Remote-Markierung. Wegen der bekannten doppelten Versionsnummer 050 wird kein `migration repair` vorgenommen.
- Einschränkung: `npm run supabase:diff` ist nicht ausführbar, weil der lokale Docker-Daemon für die CLI-Schatten-Datenbank nicht läuft. Das ist kein Schemafehler.
## 9 — Abschlussnachweis

- 2026-08-24: Jan bestätigte die angemeldete Inbox-Funktion nach Big-Win-/Achievement-Flow.
- Option 1 „Obsidian Glass“ ergänzt: `rgba(5, 7, 10, 0.96)`, 20px Blur, verstärkte Kante/Schatten und klar getrennte gelesene/ungelesene Karten.
- Aktuelle Verifikation: 133 Vitest-Dateien / 1.032 Tests, TypeScript und Production-Build grün; ESLint 0 Fehler/7 vorbestehende Warnungen; Fast Responsive Audit 0 Befunde auf 14 Seiten; Vibe-Check erfolgreich.