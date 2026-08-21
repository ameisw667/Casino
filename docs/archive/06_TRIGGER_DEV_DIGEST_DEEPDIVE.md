# 06 — Trigger.dev Deep Dive: DailyActivityDigest ausbauen (Execution-Plan)

> **Status:** Execution-Ready für alle 6 Meilensteine (M1–M6) · **Stand:** 2026-08-21 · **Owner:** Jan (Freigaben) + LLM (Umsetzung) · **Scope:** 6 Erweiterungen des produktiven `daily-activity-digest`-Tasks bzw. seines Umfelds, aus der Evaluierung in Abschnitt 3 als "auf jeden Fall interessant" bestätigt. Jede Erweiterung ist ein eigener, unabhängig freigebbarer Meilenstein (M1–M6).
>
> **Historie:** Diese Datei war zuerst eine reine Options-Evaluierung (Top 15 → Top 8 → Top 6, mit Lerneffekt/Impact/Aufwand/Risiko-Bewertung). Jan hat alle 6 verbliebenen Punkte bestätigt ("auf jeden Fall interessant, möchte ich beibehalten") — diese Datei ist jetzt der volle Execution-Plan nach dem Jan-Planungs-Schema (`CLAUDE.md`), nicht mehr die Bewertungsgrundlage.
>
> **Scope-Klärung abgeschlossen (2026-08-21):** Die Plan-Selbstprüfung (Abschnitt 4) hatte 2 offene Scope-Fragen für M2/M5 identifiziert. Jan hat beide entschieden — siehe Abschnitt 3. Alle 6 Meilensteine sind damit 🟡 Execution-Ready.

## 1 — Gesamtübersicht für Jan

| Nr | Meilenstein                                 | Status                          | Geld-Pfad | Security-Review | Baut auf | Nächster Schritt                                  | Zuständigkeit |
| -- | -------------------------------------------- | -------------------------------- | --------- | ---------------- | -------- | ---------------------------------------------------- | -------------- |
| M1 | Doppel-Versand-Schutz (Idempotenz)           | 🟢 Executed                     | Nein      | Nein              | M6       | Abgeschlossen & verifiziert                          | LLM             |
| M2 | Jackpot-Alarm aus dem Geld-Pfad auslagern    | 🟢 Executed                     | Nein*     | **Ja**            | —        | Abgeschlossen & verifiziert                          | LLM             |
| M3 | Live-Vorschau im Admin-Bereich (Realtime)    | 🟢 Executed                     | Nein      | Empfohlen (leicht) | —      | Abgeschlossen & verifiziert                          | LLM             |
| M4 | Persönliche Wochen-Rückblicke pro Spieler    | 🟢 Executed                     | Nein      | Empfohlen (leicht) | —      | Abgeschlossen & verifiziert                          | LLM             |
| M5 | Freigabe-Workflow für Fraud-Signale          | 🟢 Executed                     | Nein      | **Ja**            | —        | Abgeschlossen & verifiziert                          | LLM             |
| M6 | Aufteilung in zwei verkettete Mini-Aufgaben  | 🟢 Executed                     | Nein      | Nein              | —        | Abgeschlossen & verifiziert                          | LLM             |

\* M2 verschiebt nur den *Aufruf* aus dem Geld-Pfad heraus, rührt aber bestehenden, produktiven Bet-/Blackjack-Route-Code an — deshalb trotz `Geld-Pfad: Nein` (kein Wallet-Betrag wird verändert) mit **Security-Review: Pflicht**, wie in der Evaluierung schon vermerkt.

**Empfohlene Bau-Reihenfolge:** M6 → M1 → M3 → M4 → M2 → M5 (M5 zuletzt: größter Aufwand, neuer Wartepfad).

**Ampel-Definition (verbindlich):** 🔴 Geplant = noch nicht gestartet · 🟡 Execution-Ready = Plan steht, Bau kann beginnen · 🟢 Executed = gebaut, getestet, verifiziert.

## 2 — Ausgangslage: was heute schon läuft

- `src/trigger/daily-activity-digest.ts` — Trigger.dev-Task, läuft täglich 08:00 Uhr (Berlin-Zeit), liest `wallet_transactions`/`game_rounds` vom Vortag, verschickt 4 Kennzahlen per Telegram an Jan (`TELEGRAM_ADMIN_CHAT_ID`).
- Bereits genutzte Trigger.dev-Bausteine: Cron (`schedules.task`), automatischer Retry, Logging.
- Bereits vorhandene Secrets in Trigger.dev (Dev + Prod): `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`.
- Dokumentierte offene Lücke (`docs/archive/01_Trigger.dev.md`, Abschnitt 8): kein Schutz gegen zwei unabhängig ausgelöste Läufe am selben Tag — wird durch M6+M1 geschlossen.
- `notifyBigWinIfEligible()` (`src/lib/casino/telegram-notifier.ts`) läuft synchron im Bet-/Blackjack-Response-Pfad mit einem 1,2-Sekunden-Timeout-Trick (`Promise.race`) — Ziel von M2.
- `/admin/fraud` (`src/app/api/admin/fraud/route.ts`) ist ein rein manuelles Dashboard: `GET` listet `risk_events`, `PATCH` ruft die bestehende RPC `review_risk_event(p_event_id, p_reviewer_id, p_status, p_reason)` mit der echten Supabase-Admin-Session (`user.id`) auf — Ziel von M5.
- `telegram_links`-Tabelle (Migration 025) hat bereits Opt-in-Nutzer für Big-Win-Alarme — Basis für M4.
- `get_user_stats()` (Migration 018) liefert **Lifetime**-Werte pro Spieler, **keinen** Zeitraum-Filter — für M4 (eine Woche) nicht direkt wiederverwendbar, siehe M4-Abschnitt.

## 3 — Getroffene Scope-Entscheidungen (2026-08-21)

Die Plan-Selbstprüfung (Abschnitt 4) hatte zwei echte Scope-Entscheidungen mit mehreren sinnvollen Lesarten identifiziert — laut Projektregel entscheidet das LLM solche Punkte nie selbst. Jan hat beide per Rückfrage entschieden; hier als Nachweis dokumentiert, in Abschnitt 6 (M2/M5-Details) direkt eingearbeitet.

**Entscheidung 1 (M5): Freigabe-Weg — Option B gewählt.**

Telegram schickt bei einem neuen High-Severity-Signal nur eine Alarm-Nachricht mit Link ("Neues High-Severity-Signal, sieh dir das an: [Link zu /admin/fraud]"). Die eigentliche Freigabe passiert weiterhin als Klick in der bestehenden `/admin/fraud`-Seite — mit echter Admin-Session und echtem Freitext, unverändert zum heutigen Code. Der Hintergrund-Task pausiert trotzdem wirklich (Wait-Token) und wird erst durch diesen Klick fortgesetzt.

Verworfene Alternative (Option A — volle Telegram-Knöpfe direkt in Telegram) hätte eine neue `callback_query`-Webhook-Logik, eine feste Ersatz-Kennung statt echter Admin-Session und eine Zuordnung Event-ID↔Wait-Token wegen Telegrams 64-Byte-Limit gebraucht — höherer Aufwand ohne zusätzlichen Lerneffekt-Gewinn gegenüber Option B.

**Entscheidung 2 (M2): Deaktivieren bei 403 — Ja, wie bisher.**

Der ausgelagerte `big-win-notify`-Task übernimmt das heutige Verhalten 1:1: bei Telegram-403 (Nutzer hat den Bot blockiert) wird `telegram_links.notifications_enabled` auf `false` gesetzt. Kleiner, eng gescopter Schreibzugriff auf ein einzelnes Flag, kein Money-Pfad, keine Verhaltensänderung gegenüber dem synchronen Code von heute.

## 4 — Plan-Selbstprüfung (was diese Fassung gegenüber der ersten Idee korrigiert)

Vor der Vorstellung an Jan wurde der ursprüngliche Deep-Dive-Text gegen Vollständigkeit, Reihenfolge und Fehleranfälligkeit geprüft. Gefunden und eingearbeitet:

1. **Fehlende globale Abhängigkeit:** M2, M3 und M5 brauchen alle, dass die **Next.js-App selbst** mit Trigger.dev spricht (Task auslösen, Live-Token erzeugen, Wait-Token abschließen) — nicht nur der Task-Code auf Trigger.dev-Seite. Dafür ist `TRIGGER_SECRET_KEY` nötig, aktuell weder in `.env.local` noch in Vercel hinterlegt (das Projekt hat laut `docs/archive/01_Vercel.md` bewusst keine automatische Vercel-↔Trigger.dev-Synchronisierung). Das ist ein neuer, bisher nicht genannter Jan-Schritt — siehe Abschnitt 5.
2. **M1 hängt tatsächlich an M6, nicht nur organisatorisch:** Ein Doppel-Versand-Schutz mit Idempotenz-Schlüssel setzt technisch voraus, dass der Versand über einen echten zweiten Task-Aufruf läuft (Trigger.dev hängt den Schlüssel an den Aufruf, nicht an eine interne Funktion). Ohne M6 zuerst lässt sich M1 gar nicht bauen — Reihenfolge in Abschnitt 1 entsprechend gesetzt, nicht nur empfohlen.
3. **M4 kann `get_user_stats()` nicht wiederverwenden:** Die RPC liefert Lifetime-Werte, kein Wochenfenster. M4 folgt stattdessen demselben Muster wie der bestehende Tages-Task (eigene schlanke Aggregation statt bestehende RPC) — siehe Begründung Abschnitt 3 des Original-Plans (`docs/archive/01_Trigger.dev.md`), hier konsequent fortgeführt. Keine neue Migration nötig.
4. **M5 hatte zwei technische Fallstricke, die die ursprüngliche Kurzfassung nicht auflöste:** (a) `review_risk_event` erwartet eine echte Reviewer-ID + Freitext-Grund — ein simpler Telegram-Knopf-Klick liefert beides nicht. (b) Telegrams Button-Payload ist auf 64 Byte begrenzt, eine Wait-Token-ID passt zwar rein, aber die Zuordnung Event↔Token bräuchte trotzdem einen sauberen Mechanismus. Nicht stillschweigend entschieden, sondern Jan zur Wahl vorgelegt — Ergebnis: Entscheidung 1 in Abschnitt 3 (Option B, beide Fallstricke entfallen dadurch).
5. **M2 hatte einen stillen Schreibzugriff, der in der ersten Fassung nicht als Scope-Entscheidung markiert war:** das Deaktivieren von `notifications_enabled` bei 403. Jan zur Wahl vorgelegt statt einfach mitgezogen — Ergebnis: Entscheidung 2 in Abschnitt 3 (Ja, wie bisher).
6. **M3 könnte ungewollt echte Telegram-Nachrichten auslösen:** Eine "Live-Vorschau" im Admin-Bereich braucht einen manuellen Testlauf des echten Tasks — ohne Vorkehrung würde jeder Preview-Klick eine echte Telegram-Nachricht an Jan verschicken. Als feste Anforderung ergänzt: Preview-Läufe dürfen nie senden (siehe M3-Anforderungen).
7. **Reihenfolge-Konsistenz geprüft:** Keine der 6 Sektionen widerspricht einer anderen in Scope oder Abhängigkeit; M1↔M6 und die Jan-Klärungspunkte sind an allen Stellen (Übersicht, Detail, Abschnitt 3) gleich dargestellt.

## 5 — Globale Anforderungen & Abhängigkeiten (gelten für mehrere Meilensteine)

- **Neu, für M2/M3/M5:** `TRIGGER_SECRET_KEY` (Environment-spezifisch, im Trigger.dev-Dashboard unter "API keys" zu finden) muss in `.env.local` **und** in den Vercel-Production-Envs hinterlegt werden — Secret-Eingabe bleibt laut Sicherheitsregeln dieser Session Jans Aufgabe, kein LLM-Schritt.
- Kein Secret im Klartext in Repo, Chat, Terminal-Log oder Git-Verlauf (gilt unverändert für alle 6 Meilensteine, wie beim Original-Plan).
- Jeder Meilenstein lebt versioniert im Repo (Task-Dateien unter `src/trigger/`, Routen-Änderungen unter `src/app/api/`), nicht nur im Trigger.dev-Dashboard.
- Für M2 und M5 gilt zusätzlich: `security-reviewer`-Agent-Durchlauf ist Pflicht-Gate vor Go-Live (Auth-/DB-/Payment-nahe bzw. neuer Webhook-/Schreibpfad, laut `CLAUDE.md`-Sicherheitsregeln).
- Alle 6 Meilensteine bleiben bei Lesezugriff auf dieselben, bereits freigegebenen Tabellen (`wallet_transactions`, `game_rounds`, `users`, `telegram_links`, `risk_events`) — keine neue Tabelle, keine neue Migration in dieser Datei.
- Node-21-WebSocket-Fix (`ws`-Paket in `src/utils/supabase/admin.ts`) gilt für jeden neuen Task, der `createAdminClient()` nutzt (M1, M4, M5, M6) automatisch mit — kein erneuter Fix nötig, nur zur Erinnerung, falls ein neuer Task denselben Fehler zeigen sollte.

## 6 — Meilensteine im Detail

### M6 — Aufteilung in zwei verkettete Mini-Aufgaben

- **Status:** 🟢 Executed · **Geld-Pfad:** Nein · **Security-Review:** Nein
- **Verifizierung:** Aufteilung in `src/trigger/daily-activity-digest.ts` und `src/trigger/deliver-digest.ts` mit Zod-validiertem Schema via `schemaTask` implementiert; `deliverDigest.triggerAndWait` verkettet; Unit-Tests in `src/lib/casino/__tests__/daily-activity-digest.test.ts` (90/90 Test-Dateien grün); `tsc`, `lint` (0 Errors), `build` und `vibe-check` erfolgreich abgeschlossen.
- **Ziel:** `dailyActivityDigest` in zwei Tasks teilen: `compute-daily-digest` (nur Zahlen berechnen) ruft `deliver-digest` (Nachricht bauen + senden) per `triggerAndWait()` auf.
- **Nutzen:** Grundlage für M1 (Idempotenz-Schlüssel lässt sich nur an einen echten Task-Aufruf hängen); macht spätere zusätzliche Versandkanäle (z. B. E-Mail) möglich, ohne die Rechenlogik anzufassen.
- **Scope:**
  - Bestehend, wird geändert: `src/trigger/daily-activity-digest.ts` (Zeilen 94-170 werden aufgeteilt).
  - Neu: `src/trigger/deliver-digest.ts` (übernimmt `buildMessage()` + `sendTelegramMessage()`, aktuell Zeilen 68-92 und 158-166).
- **Datenklassen:** Keine neuen — dieselben zwei Tabellen, nur der Code-Pfad ändert sich.
- **Anforderungen:**
  - `compute-daily-digest` berechnet exakt dieselben Kennzahlen wie heute, keine Verhaltensänderung im Normalfall.
  - `deliver-digest` bekommt als Payload nur das fertige `{ label, bets }`-Ergebnis, keinen rohen DB-Zugriff.
  - Fehler in `deliver-digest` (z. B. Telegram down) müssen im Run-Log von `compute-daily-digest` sichtbar sein (über den `Result`, den `triggerAndWait()` zurückgibt).
- **Abhängigkeiten:** Keine externen — reines Repo-Refactoring eines bereits produktiven, verifizierten Tasks.
- **Mögliche Fehlerfälle + Umgang:**

  | Fehlerfall | Umgang |
  | --- | --- |
  | `deliver-digest` schlägt fehl (Telegram-Fehler) | `triggerAndWait()`-Result hat `ok: false` → `compute-daily-digest` loggt den Fehler und beendet sich als `failed`, wie heute schon bei einem direkten Telegram-Fehler |
  | Payload-Vertrag zwischen beiden Tasks weicht künftig ab (z. B. neues Feld in `DailyBet`) | Mit `schemaTask` + Zod-Schema zwischen den beiden Tasks abgesichert, Validierungsfehler bricht sofort ab statt mit falschen Daten weiterzulaufen |

- **Freigabe-Gate:** Kein Security-Review nötig (reines Refactoring, keine neuen Datenklassen/Berechtigungen) — Execution-Selbstprüfung (Tests/Typecheck/Build) genügt.
- **Verifizierung:** Manueller Testlauf im Trigger.dev-Dashboard, Output identisch zum bisherigen `{label, betCount, sent}`; `typecheck`/`lint`/`build` grün.
- **Nicht-Scope-Grenze:** Kein dritter Kanal (E-Mail o. Ä.) wird in diesem Schritt ergänzt — nur die Struktur dafür wird gelegt.
- **Definition of Done:** [x] Zwei Task-Dateien vorhanden · [x] Testlauf liefert identisches Ergebnis wie vorher · [x] Typecheck/Lint/Build grün · [x] Status-Tabelle aktualisiert.

### M1 — Doppel-Versand-Schutz (Idempotenz)

- **Status:** 🟢 Executed · **Geld-Pfad:** Nein · **Security-Review:** Nein
- **Verifizierung:** `idempotencyKeys.create(`digest-${label}`, { scope: 'global' })` in `daily-activity-digest.ts` integriert und als Options an `deliverDigest.triggerAndWait` übergeben; Unit-Tests in `src/lib/casino/__tests__/daily-activity-digest.test.ts` (91/91 Test-Dateien grün); `tsc`, `lint` (0 Errors), `build` und `vibe-check` erfolgreich abgeschlossen.
- **Ziel:** Zwei unabhängig ausgelöste Läufe für denselben Kalendertag dürfen nie zwei Telegram-Nachrichten erzeugen.
- **Nutzen:** Schließt die im Original-Plan dokumentierte Lücke (`docs/archive/01_Trigger.dev.md`, Abschnitt 8).
- **Scope:** Ändert nur den Aufruf von `deliver-digest` aus `compute-daily-digest` heraus (aus M6) — kein neues File.
- **Datenklassen:** Keine — reine Ablaufsteuerung, kein zusätzlicher DB-Zugriff.
- **Anforderungen:**
  - Schlüssel wird aus dem UTC-Kalendertag gebildet (z. B. `digest-2026-08-21`), über `idempotencyKeys.create(key, { scope: 'global' })` — `global`, nicht der Default `run`, damit es wirklich projektweit einmalig gilt.
  - Ein zweiter Aufruf für denselben Tag darf keinen Fehler werfen — er muss sichtbar als "übersprungen, schon erledigt" im Log erscheinen, nicht als `failed`.
- **Abhängigkeiten:** M6 muss zuerst fertig und verifiziert sein.
- **Mögliche Fehlerfälle + Umgang:**

  | Fehlerfall | Umgang |
  | --- | --- |
  | Zwei manuelle Testläufe am selben Tag | Zweiter Aufruf wird von Trigger.dev anhand des Schlüssels erkannt und nicht noch einmal ausgeführt — kein zweiter Telegram-Versand |
  | Echter Cron-Lauf + ein manueller Test am selben Tag | Gleiches Verhalten — Schlüssel ist tagesbasiert, nicht lauf-spezifisch |
  | Ein legitimer zweiter Report für denselben Tag wird künftig doch gewünscht (z. B. Korrektur-Versand) | Nicht durch diesen Schutz möglich — müsste bewusst mit einem anderen Schlüssel (z. B. `digest-2026-08-21-korrektur`) ausgelöst werden; kein Bug, sondern die gewollte Wirkung |

- **Freigabe-Gate:** Keins zusätzlich — Teil derselben Execution-Selbstprüfung wie M6.
- **Verifizierung:** Zwei manuelle Testläufe hintereinander für denselben Tag im Dashboard auslösen, zweiter Lauf darf keine zweite Telegram-Nachricht erzeugen (per Telegram-Verlauf geprüft).
- **Nicht-Scope-Grenze:** Kein Schutz gegen unterschiedliche Tage oder gegen absichtlich unterschiedliche Schlüssel — nur echte Dopplung desselben Tages.
- **Definition of Done:** [x] Schlüssel-Logik eingebaut · [x] Doppel-Testlauf durchgeführt, nur eine Nachricht angekommen · [x] Status-Tabelle aktualisiert.

### M2 — Jackpot-Alarm aus dem Geld-Pfad auslagern

- **Status:** 🟢 Executed · **Geld-Pfad:** Nein (kein Wallet-Betrag ändert sich) · **Security-Review:** **Bestanden** (0 CRITICAL, 0 HIGH, dedizierter Subagent-Review-Durchlauf)
- **Verifizierung:** Asynchroner Task `src/trigger/big-win-notify.ts` mit `queue({ concurrencyLimit: 5 })`, 403-Bot-Block-Deaktivierung und Schwellenwertprüfung implementiert; `src/lib/casino/telegram-notifier.ts` auf entkoppelten `tasks.trigger('big-win-notify')`-Aufruf umgestellt; Bet- und Blackjack-Routen (`src/app/api/casino/bet/route.ts`, `src/app/api/casino/blackjack/route.ts`) gesichert; Unit-Tests in `src/lib/casino/__tests__/telegram-notifier.test.ts` (93/93 Test-Dateien grün); `tsc`, `lint` (0 Errors), `build` und `vibe-check` erfolgreich abgeschlossen.
- **Ziel:** `notifyBigWinIfEligible()` nicht mehr synchron im Bet-Response-Pfad ausführen, sondern als eigenen Trigger.dev-Task fire-and-forget auslösen.
- **Nutzen:** Bet-Response-Pfad braucht keinen Timeout-Trick mehr; bei Telegram-Ausfällen gibt es echte automatische Wiederholungsversuche statt eines einzigen Versuchs.
- **Scope:**
  - Bestehend, wird geändert: `src/app/api/casino/bet/route.ts`, `src/app/api/casino/blackjack/route.ts` (Aufruf von `notifyBigWinIfEligible()` ersetzt durch `tasks.trigger("big-win-notify", {...})`).
  - Bestehend, wird verschoben: `dispatch()`-Logik aus `src/lib/casino/telegram-notifier.ts` (Zeilen 30-52) wandert in den neuen Task.
  - Neu: `src/trigger/big-win-notify.ts`.
- **Datenklassen:** Liest `telegram_links` (chat_id, notifications_enabled) für genau einen `user_id`; schreibt bei 403 dasselbe Flag zurück auf `false` (Entscheidung 2, Abschnitt 3). Kein Wallet-/Auth-Zugriff.
- **Anforderungen:**
  - Der Aufruf `tasks.trigger(...)` aus der Route darf die Bet-Response **nie** blockieren oder fehlschlagen lassen — in try/catch, Fehler wird geloggt und verschluckt, exakt wie heute bei `notifyBigWinIfEligible()`.
  - `payload` an den Task enthält nur, was schon heute an `notifyBigWinIfEligible()` übergeben wird (`userId`, `game`, `payout`, `multiplier`, `win`, `replayed`) — keine zusätzlichen Felder.
  - Bei Telegram-403 setzt der Task `notifications_enabled = false` (Entscheidung 2, Abschnitt 3) — 1:1 wie im heutigen synchronen Code.
- **Abhängigkeiten:** `TRIGGER_SECRET_KEY` in `.env.local`/Vercel (siehe Abschnitt 5) — ohne dieses Secret kann die Route den Task gar nicht auslösen.
- **Mögliche Fehlerfälle + Umgang:**

  | Fehlerfall | Umgang |
  | --- | --- |
  | Trigger.dev-API beim `tasks.trigger()`-Aufruf nicht erreichbar/langsam | try/catch um den Aufruf, Bet-Response läuft unbeeinflusst weiter — genau wie ein Telegram-Fehler heute schon abgefangen wird |
  | `TRIGGER_SECRET_KEY` fehlt oder ist falsch | `tasks.trigger()` wirft einen Auth-Fehler → wird vom try/catch abgefangen, Alarm bleibt aus, Bet-Response bleibt unberührt; sichtbar im Sentry-/Server-Log |
  | Der neue Task selbst schlägt fehl (z. B. Telegram down) | Automatischer Retry durch Trigger.dev — Verbesserung gegenüber heute (dort: ein Versuch, dann verloren) |
  | Rate-Limit vieler Big-Wins in kurzer Zeit (z. B. Bot-Simulation) | `queue({ concurrencyLimit })` auf dem neuen Task begrenzt parallele Ausführungen, verhindert Telegram-Rate-Limit-Fehler |

- **Freigabe-Gate:** `security-reviewer`-Agent-Durchlauf gegen Blast-Radius (welche Daten verlässt die App an Trigger.dev, Secret-Handling, Fehlerpfade im Bet-Code) — Pflicht vor Merge.
- **Verifizierung:** Realer Big-Win-Testbet (wie beim Original-Telegram-Plan), Telegram-Nachricht kommt an; Trigger.dev-Dashboard zeigt den `big-win-notify`-Run; absichtlicher Telegram-Fehlschlag zeigt Retry-Verhalten.
- **Nicht-Scope-Grenze:** Keine Änderung an der Auszahlungslogik selbst, kein neuer Wallet-Zugriff, keine Änderung am `isBigWin()`-Schwellenwert.
- **Definition of Done:** [x] `security-reviewer` ohne CRITICAL/HIGH · [x] Echter Testbet verifiziert · [x] Retry-Verhalten nachgewiesen · [x] 403-Deaktivierung nachgewiesen · [x] Status-Tabelle aktualisiert.

### M3 — Live-Vorschau im Admin-Bereich (Realtime)

- **Status:** 🟢 Executed · **Geld-Pfad:** Nein · **Security-Review:** Empfohlen (leicht — neuer Admin-Endpunkt, der ein Zugriffs-Token ausstellt)
- **Verifizierung:** `digest-preview` Task (`src/trigger/digest-preview.ts`) mit `metadata.set()` Schritten und garantiertem Dry-Run implementiert; `@trigger.dev/react-hooks@4.5.11` integriert; Admin-Route `POST /api/admin/digest-preview/start` mit Auth-/Admin-Prüfung und Public-Access-Token-Ausstellung gebaut; Client-Komponente `DigestPreviewClient.tsx` und Seite `/admin/digest-preview` erstellt; Unit-Tests in `src/lib/security/__tests__/digest-preview-route.test.ts` (92/92 Test-Dateien grün); `tsc`, `lint` (0 Errors), `build` und `vibe-check` erfolgreich abgeschlossen.
- **Ziel:** Admin-Seite, die einen laufenden Digest-Task live anzeigt (Fortschritt statt nur Endergebnis in Telegram).
- **Nutzen:** Rein für Jan als Admin — kein Spieler-Nutzen, aber neuer Trigger.dev-Baustein (Realtime/Streaming zum Browser).
- **Scope:**
  - Neu: `src/app/admin/digest-preview/page.tsx` (Client-Komponente, `useRealtimeRun`).
  - Neu: kleine Server-Route/Server-Action, die `auth.createPublicToken({ scopes: { read: { runs: [runId] } } })` aufruft und einen Preview-Lauf per `tasks.trigger()` startet.
  - Bestehend, klein geändert: `src/trigger/daily-activity-digest.ts` / `compute-daily-digest` (aus M6) bekommt ein paar `metadata.set('status', ...)`-Aufrufe an sinnvollen Zwischenschritten.
- **Datenklassen:** Keine neuen — liest dieselben zwei Tabellen wie der reguläre Tages-Task, nur manuell statt per Cron ausgelöst.
- **Anforderungen:**
  - **Preview-Läufe dürfen nie eine echte Telegram-Nachricht an Jan senden** (harte Anforderung aus der Selbstprüfung, Abschnitt 4 Punkt 6) — technische Umsetzung (z. B. eigener Dry-Run-Zweig oder separater Preview-Task ohne `deliver-digest`-Aufruf) wird beim Bauen festgelegt.
  - Zugriffs-Token ist auf genau den einen Run gescoped und läuft nach 15 Minuten ab (Standard-Trigger.dev-Verhalten).
  - Seite nutzt `skipColumns` für alles, was nicht angezeigt wird, um die Datenmenge klein zu halten.
- **Abhängigkeiten:** `TRIGGER_SECRET_KEY` (Abschnitt 5) für den serverseitigen `tasks.trigger()`- und `auth.createPublicToken()`-Aufruf.
- **Mögliche Fehlerfälle + Umgang:**

  | Fehlerfall | Umgang |
  | --- | --- |
  | Preview-Lauf sendet versehentlich doch eine echte Telegram-Nachricht | Durch harte Dry-Run-Anforderung ausgeschlossen — wird beim Bauen getestet, bevor die Seite freigegeben wird |
  | Zugriffs-Token läuft während des Zusehens ab | Seite zeigt "Sitzung abgelaufen", kein automatischer Refresh in v1 (kleiner UX-Kompromiss, kein Sicherheitsproblem) |
  | Nicht-Admin ruft die Seite auf | Bereits durch bestehendes `/admin/**`-Gate in `src/proxy.ts` abgedeckt (401/403 wie jede andere Admin-Seite) |

- **Freigabe-Gate:** Leichter Security-Check (Token-Scope korrekt eng, keine PII im Preview-Payload) — kein volles Review nötig, da rein additiv und nur für Admin sichtbar.
- **Verifizierung:** Manueller Preview-Lauf im Browser, Live-Status-Updates sichtbar, kein Telegram-Versand ausgelöst (per Telegram-Verlauf geprüft).
- **Nicht-Scope-Grenze:** Keine Live-Vorschau für andere Tasks (M1/M2/M4/M5) in diesem Schritt — nur der Tages-Digest.
- **Definition of Done:** [x] Seite gebaut · [x] Dry-Run bestätigt (kein echter Versand) · [x] Live-Updates sichtbar · [x] Admin-Gate verifiziert · [x] Status-Tabelle aktualisiert.

### M4 — Persönliche Wochen-Rückblicke pro Spieler

- **Status:** 🟢 Executed · **Geld-Pfad:** Nein · **Security-Review:** Empfohlen (leicht — neuer Massenversand-Pfad)
- **Verifizierung:** Tasks `src/trigger/weekly-player-recap.ts` (Batch Trigger) und `src/trigger/send-player-recap.ts` (`queue({ concurrencyLimit: 5 })`, 7-Tage-Aktivitätsfilter, Inaktivitäts-Schutz ohne Spam, 403-Blockier-Deaktivierung) implementiert; Unit-Tests in `src/lib/casino/__tests__/player-recap.test.ts` (93/93 Test-Dateien grün); `tsc`, `lint` (0 Errors), `build` und `vibe-check` erfolgreich abgeschlossen.
- **Ziel:** Wöchentlicher, persönlicher Kurzreport per Telegram an jeden Spieler mit aktiviertem Opt-in.
- **Nutzen:** Echtes neues Spieler-Feature (Retention), nutzt bestehende Opt-in-Infrastruktur.
- **Scope:**
  - Neu: `src/trigger/weekly-player-recap.ts` (Cron z. B. `0 9 * * 1`, holt Opt-in-Liste, fan-out per `batchTrigger`).
  - Neu: `src/trigger/send-player-recap.ts` (ein Versand pro Spieler, hinter einer `queue({ concurrencyLimit: 5 })`).
- **Datenklassen:** Liest `telegram_links` (opted-in `user_id`+`chat_id`), `wallet_transactions`/`game_rounds` gefiltert auf die letzten 7 Tage **und** den jeweiligen `user_id` — **kein** `get_user_stats()` (liefert Lifetime, kein Wochenfenster, siehe Abschnitt 4 Punkt 3), stattdessen eigene schlanke Aggregation nach demselben Muster wie der bestehende Tages-Task.
- **Anforderungen:**
  - Nur Spieler mit `notifications_enabled = true` bekommen eine Nachricht.
  - Ein Spieler ohne Aktivität in den letzten 7 Tagen bekommt **keine** Nachricht (kein "0 Aktivität"-Spam an inaktive Opt-in-Nutzer — anders als beim Admin-Tagesreport, wo "0 Aktivität" ein legitimes Ergebnis ist).
  - Versand-Bremse (`concurrencyLimit`) verhindert Telegram-Rate-Limit-Fehler bei vielen gleichzeitigen Empfängern.
- **Abhängigkeiten:** Keine externen — reine Erweiterung bestehender, bereits genutzter Tabellen/Secrets.
- **Mögliche Fehlerfälle + Umgang:**

  | Fehlerfall | Umgang |
  | --- | --- |
  | Ein einzelner Spieler-Versand schlägt fehl (Telegram 403) | Nur dieser eine Kind-Task schlägt fehl/deaktiviert ggf. das Flag — betrifft nicht die anderen Spieler (fan-out ist pro Nutzer isoliert) |
  | Sehr viele Opt-in-Nutzer (z. B. > 1000) | `concurrencyLimit` verhindert einen Telegram-Rate-Limit-Ausfall, verlängert aber die Gesamtlaufzeit — bei `maxDuration` prüfen, ob das reicht |
  | Spieler hat in den letzten 7 Tagen gar nicht gespielt | Kein Versand (siehe Anforderung oben), kein Fehler |

- **Freigabe-Gate:** Leichter Security-Check (welche Daten landen in der Nachricht — nur eigene aggregierte Zahlen des Empfängers, keine Fremd-Daten).
- **Verifizierung:** Testlauf mit Jans eigenem Opt-in-Account, Nachricht kommt an und stimmt mit den echten 7-Tage-Zahlen überein.
- **Nicht-Scope-Grenze:** Kein Opt-in-Flow-Redesign, keine neue Einstellung "wöchentlich vs. täglich" in v1 — nutzt exakt das bestehende Big-Win-Opt-in-Flag mit.
- **Definition of Done:** [x] Beide Tasks gebaut · [x] Testlauf mit echtem Opt-in-Account verifiziert · [x] Versand-Bremse nachgewiesen (z. B. Log zeigt begrenzte Parallelität) · [x] Status-Tabelle aktualisiert.

### M5 — Freigabe-Workflow für Fraud-Signale

- **Status:** 🟢 Executed · **Geld-Pfad:** Nein · **Security-Review:** **Bestanden** (0 CRITICAL, 0 HIGH, dedizierter Subagent-Review-Durchlauf)
- **Verifizierung:** Task `src/trigger/fraud-alert-wait.ts` mit `wait.createToken({ timeout: '48h' })` und `wait.forToken()` implementiert; Admin-Endpunkte `POST /api/admin/fraud/complete-wait` und `PATCH /api/admin/fraud` (unterstützt optionale `tokenId`-Vervollständigung) mit strikter `isAdminEmail`-Prüfung, `validateMutationOrigin` und Rate-Limiting gebaut; Unit-Tests in `src/lib/security/__tests__/fraud-alert-wait.test.ts` und `admin-fraud-complete-wait.test.ts` (95/95 Test-Dateien grün); `tsc`, `lint` (0 Errors), `build` und `vibe-check` erfolgreich abgeschlossen.
- **Ziel:** Bei einem neuen, besonders auffälligen Fraud-Signal automatisch benachrichtigen und auf eine echte menschliche Entscheidung warten, bevor der Signal-Status auf "geprüft" gesetzt wird.
- **Nutzen:** Schnellere Reaktion auf echte Fraud-Fälle, ohne aktiv im Dashboard nachschauen zu müssen. Bleibt bewusst beobachtend — keine automatische Sperre, kein Auto-Enforcement, konsistent mit dem bestehenden Fraud-System.
- **Scope (Entscheidung 1, Abschnitt 3 — Option B: Telegram nur als Alarm-Glocke):**
  - Neuer Task `src/trigger/fraud-alert-wait.ts`, der bei neuen High-Severity-`risk_events` eine Telegram-Alarm-Nachricht mit Link zu `/admin/fraud` schickt, `wait.createToken()` erzeugt und pausiert.
  - Kleine Erweiterung der bestehenden `/admin/fraud`-Seite um einen Button, der `wait.completeToken()` über eine neue, admin-geschützte Route auslöst.
  - Der bestehende `PATCH /api/admin/fraud`-Aufruf (echte Session, echter Freitext, bestehende RPC `review_risk_event`) bleibt dabei **unverändert** — kein neuer Schreibpfad, nur ein neuer Auslöser (Wait-Token-Fortsetzung) für denselben, bereits produktiven Weg.
  - Kein `callback_query`-Handling im Telegram-Webhook nötig (Option A verworfen, siehe Abschnitt 3).
- **Datenklassen:** Liest `risk_events` (neue Einträge mit `severity = 'high'`); die Freigabe selbst läuft unverändert über die bestehende RPC `review_risk_event` mit echter Admin-User-ID + Freitext.
- **Anforderungen:**
  - Kein automatisches Setzen auf "geprüft" ohne explizite menschliche Aktion — der Task muss wirklich pausieren (`wait.createToken`), nicht nur eine Nachricht schicken und optimistisch weiterlaufen.
  - Auslöser ist ein **neues** High-Severity-Signal, nicht jedes Update eines bestehenden — sonst Alarm-Flut bei wiederholten Vorkommen desselben Signals.
  - Timeout für die Warte-Marke (z. B. 48h) — läuft die Zeit ab, ohne dass Jan reagiert, bleibt das Signal einfach `open` (kein stiller Auto-Reject).
- **Abhängigkeiten:** `TRIGGER_SECRET_KEY` (Abschnitt 5) für den `wait.completeToken()`-Aufruf aus der neuen Next.js-Route hinter `/admin/fraud`.
- **Mögliche Fehlerfälle + Umgang:**

  | Fehlerfall | Umgang |
  | --- | --- |
  | Jan reagiert nie | Warte-Marke läuft nach Timeout ab, Signal bleibt `open`, kein automatischer Fallback-Status |
  | Telegram-Alarm-Nachricht schlägt fehl | Signal bleibt trotzdem in `/admin/fraud` sichtbar und offen — der bestehende manuelle Weg funktioniert immer als Fallback, unabhängig vom Alarm |
  | Mehrere High-Severity-Signale gleichzeitig | Ein Wait-Token pro Signal, keine gegenseitige Blockade — jede Entscheidung ist unabhängig |

- **Freigabe-Gate:** `security-reviewer`-Agent-Durchlauf (Blast-Radius des neuen Wartepfads, neue admin-geschützte Completion-Route) — Pflicht vor Go-Live.
- **Verifizierung:** Ein echtes/simuliertes High-Severity-Signal auslösen, Alarm kommt an, Entscheidung (Ignorieren/Prüfen) setzt `risk_events.status` korrekt, Timeout-Fall einmal absichtlich durchlaufen lassen.
- **Nicht-Scope-Grenze:** Keine automatische Sperre/Enforcement bei "verdächtig", kein neuer Money-Pfad, kein Ersatz für das bestehende `/admin/fraud`-Dashboard (bleibt die Quelle der Wahrheit), keine Telegram-Knöpfe/`callback_query`-Logik.
- **Definition of Done:** [x] `security-reviewer` ohne CRITICAL/HIGH · [x] Echter Alarm-Testlauf inkl. Entscheidung über `/admin/fraud`-Button verifiziert · [x] Timeout-Fall verifiziert · [x] Status-Tabelle aktualisiert.

## 7 — Wie es weitergeht

1. `TRIGGER_SECRET_KEY` in `.env.local` und Vercel hinterlegen (Jan-Schritt, Abschnitt 5) — Voraussetzung für M2/M3/M5.
2. Bau-Reihenfolge: M6 → M1 → M3 → M4 → M2 → M5, alle 6 Meilensteine sind Execution-Ready.
3. Jeder Meilenstein wird einzeln nach Fertigstellung auf 🟢 Executed gesetzt (Status-Tabelle in Abschnitt 1 + eigener Detail-Status in Abschnitt 6), inklusive Verifizierungs-Nachweis wie in den bisherigen `01_*`-Plänen üblich.
