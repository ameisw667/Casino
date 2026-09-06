# 06_2 — Responsible-Gambling-Controls: Umsetzungsplan

> **Status:** Executed (archiviert) — Ausführung 2026-09-04, Umfang Q1a „Minimal" (L0–L3 + L6; L4 Session-Nudge und L5 Admin-Spalte entfallen) · **Stand:** 2026-09-04 · **Owner:** LLM · **Scope:** Unterkategorie #7 aus [`06_rate_limiting_abuse_prevention.md`](../../T_RATE_LIMITING_ABUSE_PREVENTION/06_rate_limiting_abuse_prevention.md) — Selbstschutz-Mechanismen für den Spieler (nicht Anti-Fraud/Anti-Bot, das ist `06_1`). Alle Zuständigkeiten liegen beim LLM; kein Meilenstein ist auf eine Jan-Entscheidung während der Ausführung angewiesen. Offene Grundsatzfragen stehen gesammelt am Dateiende.
> **Quellcode-Basis:** Alle Befunde unten wurden am 2026-09-04 durch zwei read-only `casino-code-explorer`-Läufe gegen den tatsächlichen Code verifiziert (Datei:Zeile-Belege).

## 0 — Kontext-Fakt, der die gesamte Priorisierung bestimmt

**Dieses Casino verwendet ausschließlich virtuelle Währung — kein echtes Geld ist jemals im Spiel.** Verifiziert: `WalletModal.tsx:47-88` (`handleDeposit`/`handleWithdraw`) validiert nur Eingaben und zeigt einen Toast — **kein Netzwerk-Call, keine Wallet-Mutation**. Die angezeigte BTC-Adresse ist hartcodiert/Fake (`WalletModal.tsx:36-39`). Kein Stripe/PayPal/Payment-Provider im gesamten Repo. Neue Nutzer erhalten 10.000 Startguthaben geschenkt (`wallet.ts:77`). Das bedeutet: Die reale Schadenshöhe eines fehlenden Self-Exclusion-Mechanismus ist in **diesem konkreten Projekt nahe null** — anders als bei einem echten Echtgeld-Casino. Dieser Plan behandelt das Thema trotzdem vollständig, weil `CLAUDE.md` den **Lerneffekt und die Nähe zu einer produktionsreifen Architektur** als Primärziel definiert (nicht nur „was ist heute unbedingt nötig"). Die konkrete Ausbaustufe (voll vs. minimal vs. nur dokumentiert) ist deshalb bewusst als offene Frage Q1 am Dateiende belassen, nicht einseitig vom LLM entschieden.

## 1 — Segmentierung: 5 Vektoren (vor der Planung identifiziert)

| Vektor                                          | Beschreibung                                                       | Architektonische Relevanz (hypothetisch, wie bei Echtgeld)              | Status quo (verifiziert)                                                                                                                                                                                      | Beleg                                                                                                   |
| :---------------------------------------------- | :----------------------------------------------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------ |
| **R1 — Self-Exclusion**                         | Zeitlich begrenzte/permanente Selbstsperre vom Spielen             | 🔴 Hoch (industriestandard bei jedem Echtgeld-Casino, z. B. UK GamStop) | Keine `is_banned`/`frozen`/`self_excluded`-Spalte, keine Guard-Clause in `WalletService`, keine Admin-Route dafür — **komplett neu zu bauen**                                                                 | `wallet.ts` (kein Treffer für `frozen\|locked\|blocked\|banned\|suspend`), `admin/users/route.ts:53-58` |
| **R2 — Selbst-gesetzte Einsatz-/Verlustlimits** | Nutzer setzt eigenes Tages-/Wochenlimit für Einsätze oder Verluste | 🔴 Hoch                                                                 | Nur Game-Balance-Caps (`bet-validator.ts`, `game-config.ts`) — nicht user-konfigurierbar, dient Spielbalance nicht Spielerschutz                                                                              | `bet-validator.ts:7-13`                                                                                 |
| **R3 — Session-Zeit-Tracking & Pause-Nudge**    | Erinnerung nach X Minuten aktivem Spiel                            | 🟡 Mittel                                                               | Keine Live-Tracking-Infrastruktur — `stats-derivation.ts:54-59` dokumentiert explizit, dass Session-Länge nur eine nachträgliche Approximation ist (Spanne erster/letzter Bet-Timestamp, gecappt bei 240 Min) | `stats-derivation.ts:31,54-59`                                                                          |
| **R4 — Admin-Wellbeing-Sichtbarkeit**           | Admin sieht Spielmuster aus Fürsorge-, nicht Fraud-Perspektive     | 🟢 Niedrig (nice-to-have, kein Kern-RG-Feature)                         | Weder `/admin/users` noch `/admin/fraud` zeigen Spieldauer/-frequenz aus Wellbeing-Sicht — nur Fraud-Signale                                                                                                  | `UsersPageClient.tsx`, `FraudPageClient.tsx` (keine Treffer für `session\|duration\|pace\|activity`)    |
| **R5 — Settings-UI-Anbindung**                  | Ort, an dem der Nutzer seine Limits verwaltet                      | — (Infrastruktur, kein eigenständiges Risiko)                           | `SettingsModal.tsx:19,21-26` hat bereits eine Tab-Struktur (`audio`/`security`/`notifications`) — neuer 4. Tab ist der natürliche Ort, kein neues UI-Gerüst nötig                                             | `SettingsModal.tsx:19,21-26`                                                                            |

**Priorisierung:** R1 (Self-Exclusion) und R2 (Einsatzlimit) sind der eigentliche Kern von „Responsible Gambling" und kommen zuerst. R3 (Session-Nudge) ist die aufwändigste Ausbaustufe (keine bestehende Tracking-Infrastruktur) und kommt danach. R4 ist ein kleiner Nachtrag. R5 ist Voraussetzung für R1/R2 und wird als Fundament (L0/L2) vorgezogen.

## 2 — Übersicht für Jan

| Nummer | Meilenstein                                              | Status            | Nächster Schritt                                                                                                                                           | Zuständigkeit |
| ------ | -------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| L0     | Datenmodell: `user_wellbeing_limits`-Tabelle + RLS       | 🟢 Verifiziert    | Migration `063` lokal getestet (ROLLBACK), Guard PASS, authenticated role fail-closed verifiziert                                                          | LLM           |
| L1     | Self-Exclusion-Guard in `WalletService` + Bet-Route (R1) | 🟢 Verifiziert    | Guard in 4 Money-Routen verdrahtet, `POST+GET /api/user/self-exclusion` gebaut, Security-Review-Findings behoben (nur-verlängern-Trigger), 1481 Tests grün | LLM           |
| L2     | Settings-UI: 4. Tab „Verantwortungsvolles Spielen" (R5)  | 🟢 Verifiziert    | Tab + `ResponsibleGamblingSection.tsx` gebaut, Security-Review PASS, LOW-Finding behoben, 1487 Tests grün                                                  | LLM           |
| L3     | Tages-Verlustlimit + täglicher Reset (R2)                | 🟢 Verifiziert    | Netto-Verlust-RPC + Partial-Index in 063, Guard + PUT-Endpunkt + UI, Security-HIGH (SPLIT-Stakes) behoben, 1508 Tests grün                                 | LLM           |
| L4     | Session-Zeit-Tracking + Pause-Nudge (R3)                 | ⚪ Entfällt (Q1a) | Nur für Voll-Ausbau vorgesehen                                                                                                                             | LLM           |
| L5     | Admin-Wellbeing-Spalte (R4)                              | ⚪ Entfällt (Q1a) | Nur für Voll-Ausbau vorgesehen                                                                                                                             | LLM           |
| L6     | Testabdeckung + Doku-Nachzug                             | 🟢 Verifiziert    | Service/Endpoint/Static-Tests (1508 grün), #7 in `06_rate_limiting_abuse_prevention.md` + `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md` neu bewertet   | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. **Hinweis:** L3–L5 hängen vom Umfang der Antwort auf Q1 ab — bei „Minimal" entfällt L4, bei „Nur dokumentieren" entfallen L1–L5 vollständig (nur dieser Plan + Fund bleiben bestehen).

## 3 — Abgrenzung zu verwandten Plänen

- **`06_1_bot_automation_detection_plan.md`** (inzwischen executed und nach [`docs/archive/06_1_bot_automation_detection_plan.md`](06_1_bot_automation_detection_plan.md) archiviert): Dort geht es um Schutz der Plattform vor Angreifern (Bots, Fraud). Hier geht es um Schutz des Spielers vor sich selbst — unterschiedliche Zielrichtung, keine Überschneidung außer der gemeinsamen `risk_events`-Infrastruktur (bewusst NICHT wiederverwendet — Wellbeing-Zustand ist kein „Risiko-Signal" im Fraud-Sinn, sondern ein regulärer Nutzer-Präferenzwert, deshalb eigene Tabelle in L0 statt Erweiterung von `risk_events`).
- **Unterkategorie #10 (Multi-Account-Abuse):** Kein Zusammenhang — dort geht es um Betrug, hier um Selbstschutz.
- **VIP-/Rank-System (`vip-config.ts`):** Verifiziert keine Bet-Cap-Kopplung an VIP-Tier — ein Self-Exclusion-/Limit-Mechanismus muss daher keine VIP-Sonderfälle behandeln.

## 4 — Meilensteine im Detail

### L0 — Datenmodell: `user_wellbeing_limits`

**Ziel:** Persistenzschicht für Self-Exclusion-Zustand und Tageslimit, getrennt von der Fraud-Infrastruktur (siehe Abschnitt 3).
**Scope:** Migration `062_user_wellbeing_limits.sql` — Tabelle mit `user_id` (FK, unique), `self_excluded_until timestamptz` (NULL = keine aktive Sperre), `daily_loss_limit_cents integer` (NULL = kein Limit gesetzt), `daily_session_minutes_limit integer`, `updated_at`. RLS: Nutzer sieht/schreibt nur eigene Zeile (`user_id = auth.uid()`), Service-Role für serverseitige Guards.
**Abhängigkeiten:** Keine (Fundament).
**Freigabe-Gate:** `@migration-security-guard` PASS (Pflicht bei jeder Änderung unter `supabase/migrations/**`).
**Verifizierung:** Migration lokal anwendbar, RLS-Test bestätigt: Nutzer A kann Zeile von Nutzer B weder lesen noch schreiben.
**Ausführung (2026-09-04):** Migration heißt `063_user_wellbeing_limits.sql` (062 war durch 06_1 L0 vergeben). Tabelle wie geplant (`user_id TEXT PK → users(id)` ON DELETE CASCADE, `self_excluded_until`, `daily_loss_limit_cents`, `daily_session_minutes_limit` — beide Limit-Spalten mit `CHECK (... IS NULL OR ... > 0)`, NULL = kein Limit; `updated_at`). **Dokumentierte Abweichung vom Plan-Wording:** Statt `user_id = auth.uid()`-Policies folgt die Migration der Repo-Konvention aus Migration `056_user_notifications` (service-role-only: RLS aktiviert, `REVOKE ... FROM PUBLIC, anon, authenticated`, `GRANT SELECT/INSERT/UPDATE` nur an `service_role`, bewusst kein DELETE — Löschung läuft über ON DELETE CASCADE). Netto-Effekt identisch und strenger: Browser-Clients können gar keine Zeile lesen oder schreiben (verifiziert: `SET LOCAL ROLE authenticated` → `permission denied` auf SELECT und INSERT), Nutzerzugriff ausschließlich über authentifizierte API-Routen, deren Server-Handler den Nutzer aus der Session auflöst. `@migration-security-guard`: **PASS** (0 Findings; FK-Typ zu `users.id` TEXT, Zero-Downtime, keine Live-Table-Locks). Lokale Verifikation im DB-Container: Migration in Test-Transaktion angewendet (CREATE/ALTER/REVOKE/GRANT sauber, `ROLLBACK`, kein persistenter Zustand); service_role kann lesen/schreiben, `authenticated` fail-closed. Remote-Push bleibt K4 (Jan-Freigabe).
**Nicht-Scope:** Keine Erweiterung der `risk_events`-Tabelle (bewusste Trennung, siehe Abschnitt 3).
**Money-Pfad:** Nein (aber Voraussetzung für Geld-Pfad-Guards in L1/L3) · **Security-Review:** Pflicht (Migration + RLS).

### L1 — Self-Exclusion-Guard (R1)

**Ziel:** Ein Nutzer mit aktiver Selbstsperre kann nicht mehr spielen (Bet/Blackjack/Redeem), unabhängig vom Client.
**Scope:** Neue Guard-Funktion `checkWellbeingGuard(userId)` in einem neuen Service-Modul `src/lib/casino/responsible-gambling.ts`, aufgerufen am Anfang von `bet/route.ts`, `blackjack/route.ts`, `bet-crash-multiplayer/route.ts`, `redeem-code/route.ts` — **direkt nach dem Auth-Resolve, vor dem Rate-Limit-Check** (identische Einfügeposition wie der bereits im Code vorhandene `BET_LIMIT_EXCEEDED`-Guard). Bei aktiver Sperre: `apiErrorResponse('SELF_EXCLUDED', ..., 403, ...)`. API-Route erhält zusätzlich einen eigenen Endpunkt `POST /api/user/self-exclusion` (Zod: `{ durationDays: number }`) zum **Aktivieren** der Sperre — kein Endpunkt zum vorzeitigen Deaktivieren in dieser Ausbaustufe (siehe offene Frage Q3).
**Abhängigkeiten:** L0.
**Freigabe-Gate:** `security-reviewer` PASS (Geld-Pfad + neuer Auth-adjazenter Guard).
**Verifizierung:** Test setzt `self_excluded_until` in die Zukunft → alle vier Routen liefern 403; Test ohne aktive Sperre → unverändertes Verhalten (Regressionstest).
**Nicht-Scope:** Kein Login-Block (nur Spiel-Aktionen, siehe Q2), keine E-Mail-Bestätigung des Aktivierungsvorgangs (YAGNI für ein Lernprojekt ohne echten Nutzerkreis).
**Money-Pfad:** Ja · **Security-Review:** Pflicht.

**Ausführung (2026-09-04):** Umgesetzt wie geplant, mit vier dokumentierten Abweichungen:

1. **Einfügeposition des Guards:** Plan sagte „direkt nach dem Auth-Resolve, **vor** dem Rate-Limit-Check". Umgesetzt wurde **nach** dem Rate-Limit-Check — Security-Review-Finding (MEDIUM): sonst läuft jede authentifizierte Anfrage (auch gespamte) vor dem Remote-Limiter in eine Postgres-Query und die Redis-Caps binden die DB-Last auf diesen Pfaden nicht mehr. Effekt: Ein spamender gesperrter Nutzer sieht 429 statt 403 — akzeptabel.
2. **Guard-Blockierumfang:** Der Guard blockiert auch `CASHOUT_*` einer bereits laufenden Crash-Runde (Security-Review-Produktnotiz): Wer sich während einer offenen Runde selbst sperrt, verliert den Einsatz an den Crash-Punkt statt auszuzahlen. Konsistent mit Q2a („Spielen blockieren"), bewusst so belassen.
3. **Nur-Verlängern-Invariante (Security-Finding HIGH):** Ein erneuter POST mit kleinerer Dauer konnte die Sperre verkürzen — entgegen Q3a. Fix atomar in Migration 063: Trigger `enforce_self_exclusion_only_extends()` (BEFORE INSERT OR UPDATE, `GREATEST(OLD, NEW)`), der auch den Upsert-Pfad und service_role-Schreibzugriffe abdeckt und `updated_at` auf die echte Schreibzeit setzt. Docker-Verifizierung (ROLLBACK-Transaktion): kürzere Anfrage verkürzt nicht, längere verlängert, Browser-Rollen weiterhin fail-closed. Migration-Review erneut PASS.
4. **Tests:** Statische Assertions statt Live-Routentests (Repo hat keinen Live-Postgres-Integrationsharness; Muster wie `to04-critical-fixes.test.ts`) für die vier Routen + Unit-Tests für den Endpunkt (`src/app/api/user/self-exclusion/__tests__/route.test.ts`) und den Service (`src/lib/casino/__tests__/responsible-gambling.test.ts`). Der neue GET-Endpunkt (Status für die L2-UI) ist eine ergänzende Detailentscheidung im Plan-Scope. Gate: 1481/1481 Tests, typecheck/lint 0 Fehler, `security-reviewer`-Findings behoben.

### L2 — Settings-UI: 4. Tab (R5)

**Ziel:** Nutzer kann Self-Exclusion aktivieren und Limits einsehen/setzen, ohne neues UI-Gerüst zu erfinden.
**Scope:** Neuer Tab `'wellbeing'` in `SettingsModal.tsx:19,21-26` (analog zur bestehenden Tab-Struktur), neue Komponente `ResponsibleGamblingSection.tsx` nach dem 3-Schichten-Muster der Telegram-Toggle (Zod-Schema → API-Route mit `validateMutationOrigin`/Auth/Rate-Limit/Parse/Delegate → Service-Funktion → React-Komponente mit optimistic update, exakt wie `telegram/toggle/route.ts` + `TelegramLinkSection.tsx`).
**Abhängigkeiten:** L0, L1.
**Freigabe-Gate:** `security-reviewer` PASS (neuer Auth-adjazenter Formular-Pfad).
**Verifizierung:** UI-Test bestätigt: Aktivierung der Selbstsperre im Modal löst denselben Zustand aus, den L1 serverseitig prüft (End-to-End-Konsistenztest, kein manueller Browser-Check nötig, da reine API-Logik).
**Nicht-Scope:** Kein Redesign der bestehenden drei Tabs.
**Money-Pfad:** Nein (UI) · **Security-Review:** Pflicht.

**Ausführung (2026-09-04):** 4. Tab `wellbeing` in `SettingsModal.tsx` + neue Komponente `ResponsibleGamblingSection.tsx` nach dem Telegram-3-Schichten-Muster: GET lädt den Status (fail-closed-Anzeige — bei Fehler bleibt die Sektion unsichtbar statt „keine Sperre" zu behaupten), Dauer-Select (1/7/30/90/365 Tage, deckt den Server-Vertrag int 1..365 ab), **zweistufige Bestätigung** vor dem irreversiblen POST (Q3a: keine Aufhebung, nur Verlängern). Nach erfolgreicher Aktivierung wird der Status serverseitig nachgeladen statt die Response zu übernehmen (Security-Review-LOW-Finding: verhindert einen UI-Dead-End und zeigt die ggf. längere bestehende Sperre korrekt an). Tests: reine Logik-Tests (`deriveWellbeingStatus`, `DURATION_OPTIONS`, `formatExclusionDate`) — Abweichung zur geplanten „UI-Test"-Verifizierung: das Repo hat keine DOM-Test-Infrastruktur (Vitest-Include-Glob läuft nur auf `.test.ts`, bestehende `.tsx`-Tests werden nicht ausgeführt), die End-to-End-Konsistenz ist daher in drei Schichten gepinnt: Client-Mapping-Tests + Endpoint-Unit-Tests + statische Routen-Assertions (L1). Security-Review PASS. Gate: 1487/1487 Tests, typecheck/lint 0 Fehler. Visuelle Prüfung bleibt bei Jan (kein Self-Check).

### L3 — Tages-Verlustlimit + Reset (R2)

**Ziel:** Nutzer kann ein eigenes Tageslimit setzen, das Spielen automatisch stoppt, sobald es erreicht ist.
**Scope:** Guard-Erweiterung in `checkWellbeingGuard()` (L1): vor jedem Bet wird der kumulierte Tagesverlust (aus `wallet_transactions`, `type IN ('bet','win')`, gefiltert auf Kalendertag) gegen `daily_loss_limit_cents` geprüft (siehe Q4 zur genauen Berechnungsmethode). Reset erfolgt implizit durch die Kalendertag-Filterung (kein expliziter Reset-Job nötig, da die Abfrage immer nur den aktuellen Tag betrachtet) — **einfacher als ursprünglich angenommen, kein Trigger.dev-Cron nötig für den Reset selbst**, dieser wird nur für eine optionale Zusammenfassungs-Benachrichtigung („dein Tageslimit wurde zurückgesetzt") gebraucht, die in dieser Ausbaustufe nicht Teil des Scopes ist.
**Abhängigkeiten:** L0, L1.
**Freigabe-Gate:** `security-reviewer` PASS (Geld-Pfad, Query-Performance-Check für die Tagesverlust-Abfrage).
**Verifizierung:** Test simuliert Verluste bis zum Limit → nächster Bet wird abgelehnt; Test am folgenden Kalendertag (simulierte Zeit) → Limit ist wieder verfügbar.
**Nicht-Scope:** Kein Wochenlimit in dieser Ausbaustufe (YAGNI, kann bei Bedarf als eigenes Feld in L0 ergänzt werden).
**Money-Pfad:** Ja · **Security-Review:** Pflicht.

**Ausführung (2026-09-04):** Umgesetzt wie geplant, mit vier dokumentierten Korrekturen/Entscheidungen:

1. **Faktische Korrektur des Plan-Wortlauts:** Die Transaktions-Typen `type IN ('bet','win')` existieren im aktuellen Server-Authority-Settlement (Migration 007) nicht mehr. Tatsächlich relevant sind `bet_settled` (Netto payout−bet, Dice/Roulette/Slots), `round_started` (−bet, Crash/Blackjack), `round_settled` (+payout) und — nach Security-Review — `round_action` (Blackjack-SPLIT-Debit; ohne diesen Typ entkäme der Split-Einsatz der Tagesverlust-Rechnung). `bonus` (Promo-Credits) ist bewusst ausgeschlossen — Geschenke sind kein Verlust.
2. **Q4a-Implementierung:** Netto-Verlust = −Σ(amount) über die vier Spiel-Typen für den UTC-Kalendertag (konsistent mit `get_daily_race_standings` in 041) — als RPC `get_daily_net_loss_cents(p_user_id)` in Migration 063 (SECURITY DEFINER, service_role-only, Partial-Index `idx_wallet_transactions_user_created_game` im exakten Prädikat-Gleichschritt zur RPC-Typ-Liste). Negative Rückgabe = Tagesgewinn, blockiert nie. Docker-Verifizierung (ROLLBACK-Transaktion): Verlust-Mathematik inkl. `round_action` korrekt, Bonus/Vortag ausgeschlossen, anon fail-closed.
3. **Ergänzungen im Plan-Scope (dokumentierte reversible Annahme):** Der Plan enthielt keinen Setter — ergänzt wurden `PUT /api/user/self-exclusion` (`{ dailyLossLimitCents: int 1..1_000_000 | null }`, gleiche Origin/Auth/Rate-Limit-Kette, 503 fail-closed) und die Set/Clear-UI in `ResponsibleGamblingSection.tsx` (EUR-Eingabe → Cents, Anzeige von Limit + heutigem Verlust, Server-Truth nach jeder Mutation). Bewusst ohne Cooling-off beim Entfernen (Security-LOW dokumentiert, spätere Ausbaustufe).
4. **Security-Review FINDING → behoben:** 1 HIGH (SPLIT-Stakes entkamen der Rechnung — `round_action` in RPC und Index-Prädikat ergänzt, Migration-Review erneut PASS), 1 MEDIUM dokumentiert als bekannte Grenze (Check-then-act-Race zwischen Guard und Settlement — TOCTOU; Absicherung in einer späteren Ausbaustufe durch Verlagerung der Tages-Summenprüfung in die Settlement-RPCs unter den bestehenden `pg_advisory_xact_lock`), LOWs behoben (irreführende „Heute verloren: 0,00 €"-Anzeige ohne Limit entfernt; Komma-Eingabe im EUR-Feld akzeptiert). Reset implizit über die UTC-Tagesgrenze, kein Cron nötig (wie geplant). Gate: 1508/1508 Tests, typecheck/lint 0 Fehler.

### L4 — Session-Zeit-Tracking + Pause-Nudge (R3)

**Ziel:** Spieler bekommt nach längerer aktiver Spielzeit eine sichtbare Erinnerung.
**Scope:** Rein client-seitig (kein neuer Server-Pfad nötig für v1): `useEffect`-Timer im Game-Layout, der bei Aktivität (Bet-Events) eine laufende Zeit seit Session-Start misst; nach `daily_session_minutes_limit`-Minuten (falls gesetzt, sonst fester Default z. B. 60 Min) erscheint ein Toast über den bestehenden Toast-Mechanismus (kein neues UI-Primitiv).
**Abhängigkeiten:** L2 (Limit-Wert kommt aus den Settings, falls Nutzer eines gesetzt hat).
**Freigabe-Gate:** Keins (rein client-seitige UX-Ergänzung, kein neuer Datenpfad, kein Security-Review nötig).
**Verifizierung:** Test/manuelle Prüfung: Nudge erscheint nach Ablauf der konfigurierten Zeit, verschwindet nach Bestätigung, kein Blockieren des Spiels (bewusst nur Nudge, kein Zwang — härtere Durchsetzung wäre R2/Tageslimit, nicht R3).
**Nicht-Scope:** Keine serverseitige Session-Zeit-Persistenz (bewusst minimal, siehe Kontext-Fakt Abschnitt 0 — kein echtes Geld im Spiel rechtfertigt keine aufwändige Tracking-Infrastruktur für v1).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L5 — Admin-Wellbeing-Spalte (R4)

**Ziel:** Admin sieht auf einen Blick, ob ein Nutzer eine aktive Selbstsperre hat (Support-Anfragen, Transparenz).
**Scope:** Neue Spalte „Selbstsperre aktiv bis" in `UsersPageClient.tsx` (liest `user_wellbeing_limits.self_excluded_until` zusätzlich zur bestehenden Query in `admin/users/route.ts:53-58`).
**Abhängigkeiten:** L0, L1.
**Freigabe-Gate:** Keins (reine Lese-Erweiterung, RLS bereits durch L0 abgesichert für Service-Role-Zugriff).
**Verifizierung:** Spalte zeigt korrektes Datum bei aktiver Sperre, leer sonst.
**Nicht-Scope:** Kein Admin-Override zum Aufheben der Sperre in dieser Ausbaustufe (konsistent mit Q3-Empfehlung: keine vorzeitige Aufhebung, auch nicht durch Admin, um den Schutzzweck nicht zu unterlaufen).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L6 — Testabdeckung + Doku-Nachzug

**Ziel:** Jedes neue Modul testen, Kategorie-06-Aufschlüsselung nachziehen.
**Scope:** `src/lib/casino/__tests__/responsible-gambling.test.ts` (Vitest, `vi.mock`-Muster wie `telegram-link.test.ts`), danach Aktualisierung von `06_rate_limiting_abuse_prevention.md` Unterkategorie #7 (Niveau-Neubewertung) sowie `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`.
**Abhängigkeiten:** L0–L5 (bzw. nur die tatsächlich umgesetzten, je nach Q1-Antwort).
**Freigabe-Gate:** Alle neuen Tests grün, `npm run typecheck`/`npm run lint` 0 Fehler.
**Verifizierung:** Vollständiger Testlauf inkl. der vier geänderten Money-Pfad-Routen (Regressionstest, dass bestehendes Verhalten ohne aktive Sperre unverändert bleibt).
**Nicht-Scope:** Kein Rückwirkungs-Fix des projektweiten Coverage-Gate-Gaps (bereits in `06_1`, Abschnitt L7, als bestehender Fund vermerkt — keine Dopplung).
**Money-Pfad:** Nein · **Security-Review:** Nein.

**Ausführung (2026-09-04):** Tests je neuem Modul sind in den Ausführungsnotizen L0–L3 dokumentiert (Service-, Endpoint- und statische Routen-Assertions; Regressionssicherung für das unveränderte Verhalten ohne aktive Sperre über die Mock-Defaults in den Contract-Tests). Endstand: 1508/1508 Tests grün, typecheck/lint 0 Fehler. Doku-Nachzug erledigt: Unterkategorie #7 in [`06_rate_limiting_abuse_prevention.md`](../../T_RATE_LIMITING_ABUSE_PREVENTION/06_rate_limiting_abuse_prevention.md) von Top 95 % (🔴) auf Top 25 % (🟡) neu bewertet (neuer Kategorie-Schnitt Top 31 %), [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../rate-limiting/00_RATE_LIMITING_OVERVIEW.md) synchron aktualisiert; `worldmap/00_WORLDMAP_STATUS.md` Fußnote ⁵ und Statuslog #06 faktisch korrigiert (Headline-Zelle bleibt offen bei Jan). Plan anschließend executed-archiviert, casino-residue-scout-Check sauber.

## 5 — Selbstprüfung (durchgeführt 2026-09-04)

- ✅ Scope gegenüber `06_1` (Bot-Detection) und Unterkategorie #10 abgegrenzt (Abschnitt 3).
- ✅ Jeder Meilenstein hat Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung/Nicht-Scope/Money-Pfad/Security-Review.
- ✅ Alle Zuständigkeiten = LLM, kein Meilenstein blockiert auf eine Jan-Zwischenentscheidung.
- ✅ Kontext-Fakt (kein echtes Geld) wird nicht verschwiegen, sondern bestimmt explizit die Priorisierung und den Umfang (Abschnitt 0).
- ⚠️ **Nachträglich gefunden beim Selbst-Review:** L3 (Tagesverlustlimit-Query gegen `wallet_transactions`) sollte einen Index-Check erhalten, falls die Tabelle groß ist — als Verifizierungspunkt in L3 ergänzt (Query-Performance-Check im Freigabe-Gate), keine neue Migration dafür vorgesehen, nur ein Prüfschritt.
- ⚠️ **Nachträglich gefunden:** L4 (Session-Nudge) ist der einzige Meilenstein ohne Security-Review-Pflicht und ohne neuen Server-Datenpfad — bewusst so belassen (siehe Nicht-Scope), aber explizit als „kleinster, isoliert überspringbarer Meilenstein" markiert, falls Q1 auf „Minimal" fällt.
- ✅ Kein Punkt doppelt als SOP/Kontextreferenz/Plan gepflegt.

## 6 — Offene Fragen für Jan (je 3 Antwortoptionen)

**Q1 — Welche Ausbaustufe soll umgesetzt werden, angesichts des Kontext-Fakts, dass kein echtes Geld im Spiel ist (Abschnitt 0)?**

- (a) **Minimal:** Nur L0–L3 + L6 (Self-Exclusion + Tageslimit + Settings-UI + Tests), L4 (Session-Nudge) und L5 (Admin-Spalte) entfallen — deckt den Kern von „Responsible Gambling" ohne Zusatzaufwand für Nice-to-haves. _(Empfehlung — bester Lerneffekt pro Aufwand)_
- (b) **Voll:** Alle Meilensteine L0–L6 wie geplant — maximale Nähe zu einer echten Produktions-Architektur, mehr Portfolio-Tiefe.
- (c) **Nur dokumentieren, nicht bauen:** Dieser Plan bleibt als Analyse/Referenz stehen, keine Umsetzung — vertretbar, da der reale Schaden ohne echtes Geld nahe null ist und der Aufwand anderswo mehr Lerneffekt bringen könnte (z. B. `06_1`).

**Q2 — Soll die Selbstsperre nur das Spielen blockieren oder den kompletten Login?**

- (a) **Nur Spielen** (Bet/Blackjack/Redeem), Login/Browsing bleibt möglich — näher an echten regulatorischen RG-Standards (z. B. UK GamStop sperrt nur die Spielfunktion, nicht den allgemeinen Kontozugriff). _(Empfehlung)_
- (b) **Kompletter Login-Stopp** — technisch einfacher (ein Guard in `proxy.ts` statt vier Guards in den Money-Routen), aber unüblich für echte RG-Systeme.
- (c) **Konfigurierbar** — Nutzer wählt bei Aktivierung zwischen beiden Varianten (mehr Komplexität für wenig zusätzlichen Lerneffekt).

**Q3 — Soll eine aktivierte Selbstsperre vorzeitig durch den Nutzer selbst aufhebbar sein?**

- (a) **Fixe Mindestdauer, keine vorzeitige Aufhebung** — näher an echten Industriestandards (Schutz vor Impulsentscheidungen ist der eigentliche Zweck von Self-Exclusion). _(Empfehlung für Lerneffekt/Architekturtreue)_
- (b) **Sofort selbst umkehrbar** — einfachste UX, aber untergräbt den Schutzzweck und ist untypisch für echte Systeme.
- (c) **Sofort umkehrbar mit 24h-Abkühlphase** — Kompromiss zwischen UX und Schutzwirkung.

**Q4 — Wie soll das Tages-Verlustlimit berechnet werden?**

- (a) **Netto-Verlust** (Einsätze minus Gewinne) — misst den tatsächlichen finanziellen Schaden, wie bei echten RG-Systemen üblich. _(Empfehlung)_
- (b) **Brutto-Einsatzvolumen** (Summe aller Einsätze unabhängig vom Ausgang) — einfacher zu berechnen, aber bestraft auch gewinnende Spieler.
- (c) **Beide Werte getrennt konfigurierbar** — mehr Flexibilität, aber mehr Komplexität ohne klaren Zusatznutzen für ein Lernprojekt.

## 7 — Verwandte Artefakte

| Bedarf                                                            | Datei                                                                                                                 |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| Vollständige Kategorie-06-Aufschlüsselung (Ursprung dieses Plans) | [`06_rate_limiting_abuse_prevention.md`](../../T_RATE_LIMITING_ABUSE_PREVENTION/06_rate_limiting_abuse_prevention.md) |
| Kompakte Kategorie-Overview                                       | [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../rate-limiting/00_RATE_LIMITING_OVERVIEW.md)                    |
| Schwester-Plan Bot-/Automatisierungserkennung (#3)                | [`docs/archive/06_1_bot_automation_detection_plan.md`](06_1_bot_automation_detection_plan.md)                         |
| Service-Layer-Kontext (`WalletService`, Geld-Pfad-Konventionen)   | [`xx_docs/05_service_layer_context.md`](../../xx_docs/05_service_layer_context.md)                                    |
| Background-Jobs-SOP (Trigger.dev `schedules.task`-Konvention)     | [`xx_sop/20_background_jobs_scheduling.md`](../../xx_sop/20_background_jobs_scheduling.md)                            |
| SOP Planungsdateien (Format dieses Plans)                         | [`xx_sop/03_workflow_jan_planungsdateien.md`](../../xx_sop/03_workflow_jan_planungsdateien.md)                        |
| SOP Execution (nächster Schritt nach Freigabe)                    | [`xx_sop/02_workflow_jan_execution.md`](../../xx_sop/02_workflow_jan_execution.md)                                    |
