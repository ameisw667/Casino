# 06 — Trigger.dev Deep Dive: DailyActivityDigest ausbauen (Execution-Plan)

> **Status:** Execution-Ready für M1/M3/M4/M6 · Geplant (Klärung offen) für M2/M5 · **Stand:** 2026-08-21 · **Owner:** Jan (Klärungspunkte + Freigaben) + LLM (Umsetzung) · **Scope:** 6 Erweiterungen des produktiven `daily-activity-digest`-Tasks bzw. seines Umfelds, aus der Evaluierung in Abschnitt 3 als "auf jeden Fall interessant" bestätigt. Jede Erweiterung ist ein eigener, unabhängig freigebbarer Meilenstein (M1–M6).
>
> **Historie:** Diese Datei war zuerst eine reine Options-Evaluierung (Top 15 → Top 8 → Top 6, mit Lerneffekt/Impact/Aufwand/Risiko-Bewertung). Jan hat alle 6 verbliebenen Punkte bestätigt ("auf jeden Fall interessant, möchte ich beibehalten") — diese Datei ist jetzt der volle Execution-Plan nach dem Jan-Planungs-Schema (`CLAUDE.md`), nicht mehr die Bewertungsgrundlage.
>
> **Vor Execution-Start zu klären:** 2 offene Scope-Fragen (M2, M5) — siehe Abschnitt 3. Das LLM entscheidet Scope-Fragen laut Projektregel nie selbst, deshalb sind M2/M5 bis zur Antwort auf 🔴 Geplant statt 🟡 Execution-Ready gesetzt.

## 1 — Gesamtübersicht für Jan

| Nr | Meilenstein                                 | Status                          | Geld-Pfad | Security-Review | Baut auf | Nächster Schritt                                  | Zuständigkeit |
| -- | -------------------------------------------- | -------------------------------- | --------- | ---------------- | -------- | ---------------------------------------------------- | -------------- |
| M1 | Doppel-Versand-Schutz (Idempotenz)           | 🟡 Execution-Ready               | Nein      | Nein              | M6       | Erst nach M6 bauen                                    | LLM             |
| M2 | Jackpot-Alarm aus dem Geld-Pfad auslagern    | 🔴 Geplant — Klärung offen (Frage 2) | Nein* | **Ja**            | —        | Jan beantwortet Frage 2 (Abschnitt 3)                 | Jan → LLM       |
| M3 | Live-Vorschau im Admin-Bereich (Realtime)    | 🟡 Execution-Ready               | Nein      | Empfohlen (leicht) | —      | Bauen                                                 | LLM             |
| M4 | Persönliche Wochen-Rückblicke pro Spieler    | 🟡 Execution-Ready               | Nein      | Empfohlen (leicht) | —      | Bauen                                                 | LLM             |
| M5 | Freigabe-Workflow für Fraud-Signale          | 🔴 Geplant — Klärung offen (Frage 1) | Nein  | **Ja**            | —        | Jan beantwortet Frage 1 (Abschnitt 3)                 | Jan → LLM       |
| M6 | Aufteilung in zwei verkettete Mini-Aufgaben  | 🟡 Execution-Ready               | Nein      | Nein              | —        | Zuerst bauen (Voraussetzung für M1)                   | LLM             |

\* M2 verschiebt nur den *Aufruf* aus dem Geld-Pfad heraus, rührt aber bestehenden, produktiven Bet-/Blackjack-Route-Code an — deshalb trotz `Geld-Pfad: Nein` (kein Wallet-Betrag wird verändert) mit **Security-Review: Pflicht**, wie in der Evaluierung schon vermerkt.

**Empfohlene Bau-Reihenfolge:** M6 → M1 → M3 → M4, parallel dazu Jan-Klärung für M2/M5 einholen → M2 → M5 zuletzt (komplexeste Abhängigkeiten, größter Aufwand).

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

## 3 — Offene Klärungspunkte (vor Execution-Start zu beantworten)

Diese zwei Punkte hat die Selbstprüfung (Abschnitt 4 unten) als echte Scope-Entscheidungen mit mehreren sinnvollen Lesarten identifiziert — laut Projektregel entscheidet das LLM solche Punkte nie selbst. Jan bekommt beide gleich auch als separate Rückfrage gestellt.

**Frage 1 (blockiert M5): Wie soll die Freigabe technisch ablaufen?**

- **Option A — Telegram-Knöpfe (ursprüngliche Idee):** Telegram-Nachricht mit zwei Knöpfen ("Ignorieren"/"Genauer ansehen"), der bestehende Webhook (`src/app/api/telegram/webhook/route.ts`) verarbeitet den Klick. Braucht: neue Webhook-Logik für `callback_query` (gibt es aktuell nicht), eine feste Ersatz-Kennung statt einer echten Admin-Session für den `review_risk_event`-Aufruf (bisher immer echte Supabase-User-ID + freier Text), und wegen Telegrams 64-Byte-Limit für Button-Daten eine kleine Zuordnung zwischen Fraud-Event und Warte-Marke. Höherer Aufwand, volle Zwei-Wege-Interaktion direkt aus Telegram.
- **Option B — Telegram nur als Alarm-Glocke (empfohlen):** Telegram-Nachricht informiert nur ("Neues High-Severity-Signal, sieh dir das an: [Link zu /admin/fraud]"), die eigentliche Freigabe passiert weiterhin als Klick in der bestehenden `/admin/fraud`-Seite — mit echter Admin-Session und echtem Freitext, unverändert zum heutigen Code. Der Hintergrund-Task pausiert trotzdem wirklich (Wait-Token) und wird erst durch diesen Klick fortgesetzt — der Lerneffekt (Mensch-muss-entscheiden-Pause) bleibt vollständig erhalten, nur der Klick passiert im Browser statt in Telegram. Geringerer Aufwand, keine neue Ersatz-Kennung nötig, keine Webhook-Erweiterung.

**Frage 2 (blockiert M2): Soll der ausgelagerte Alarm-Task bei dauerhaftem Telegram-Fehler weiterhin die Benachrichtigung deaktivieren?**

Der heutige synchrone Code deaktiviert `telegram_links.notifications_enabled` automatisch, wenn Telegram mit 403 (Nutzer hat den Bot blockiert) antwortet. Das ist ein kleiner, aber echter Schreibzugriff.

- **Option A:** Der neue Task übernimmt dieses Verhalten 1:1 (kleiner, eng gescopter Schreibzugriff auf ein einzelnes Flag, kein Money-Pfad).
- **Option B:** Der neue Task bleibt bewusst rein lesend + Telegram-Versand; das Deaktivieren bei 403 entfällt vorerst (Nutzer bekäme dann bei dauerhaft blockiertem Bot wiederholt fehlschlagende Zustellversuche, die aber niemandem schaden außer Log-Rauschen).

## 4 — Plan-Selbstprüfung (was diese Fassung gegenüber der ersten Idee korrigiert)

Vor der Vorstellung an Jan wurde der ursprüngliche Deep-Dive-Text gegen Vollständigkeit, Reihenfolge und Fehleranfälligkeit geprüft. Gefunden und eingearbeitet:

1. **Fehlende globale Abhängigkeit:** M2, M3 und M5 brauchen alle, dass die **Next.js-App selbst** mit Trigger.dev spricht (Task auslösen, Live-Token erzeugen, Wait-Token abschließen) — nicht nur der Task-Code auf Trigger.dev-Seite. Dafür ist `TRIGGER_SECRET_KEY` nötig, aktuell weder in `.env.local` noch in Vercel hinterlegt (das Projekt hat laut `docs/archive/01_Vercel.md` bewusst keine automatische Vercel-↔Trigger.dev-Synchronisierung). Das ist ein neuer, bisher nicht genannter Jan-Schritt — siehe Abschnitt 5.
2. **M1 hängt tatsächlich an M6, nicht nur organisatorisch:** Ein Doppel-Versand-Schutz mit Idempotenz-Schlüssel setzt technisch voraus, dass der Versand über einen echten zweiten Task-Aufruf läuft (Trigger.dev hängt den Schlüssel an den Aufruf, nicht an eine interne Funktion). Ohne M6 zuerst lässt sich M1 gar nicht bauen — Reihenfolge in Abschnitt 1 entsprechend gesetzt, nicht nur empfohlen.
3. **M4 kann `get_user_stats()` nicht wiederverwenden:** Die RPC liefert Lifetime-Werte, kein Wochenfenster. M4 folgt stattdessen demselben Muster wie der bestehende Tages-Task (eigene schlanke Aggregation statt bestehende RPC) — siehe Begründung Abschnitt 3 des Original-Plans (`docs/archive/01_Trigger.dev.md`), hier konsequent fortgeführt. Keine neue Migration nötig.
4. **M5 hat zwei technische Fallstricke, die die ursprüngliche Kurzfassung nicht auflöste:** (a) `review_risk_event` erwartet eine echte Reviewer-ID + Freitext-Grund — ein simpler Telegram-Knopf-Klick liefert beides nicht. (b) Telegrams Button-Payload ist auf 64 Byte begrenzt, eine Wait-Token-ID passt zwar rein, aber die Zuordnung Event↔Token braucht trotzdem einen sauberen Mechanismus. Beides nicht stillschweigend entschieden, sondern als Frage 1 an Jan zurückgegeben.
5. **M2 hat einen stillen Schreibzugriff, der in der ersten Fassung nicht als Scope-Entscheidung markiert war:** das Deaktivieren von `notifications_enabled` bei 403. Jetzt explizit als Frage 2 markiert statt einfach mitgezogen.
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

- **Status:** 🟡 Execution-Ready · **Geld-Pfad:** Nein · **Security-Review:** Nein
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
- **Definition of Done:** [ ] Zwei Task-Dateien vorhanden · [ ] Testlauf liefert identisches Ergebnis wie vorher · [ ] Typecheck/Lint/Build grün · [ ] Status-Tabelle aktualisiert.

### M1 — Doppel-Versand-Schutz (Idempotenz)

- **Status:** 🟡 Execution-Ready, aber **erst nach M6 bauen** · **Geld-Pfad:** Nein · **Security-Review:** Nein
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
- **Definition of Done:** [ ] Schlüssel-Logik eingebaut · [ ] Doppel-Testlauf durchgeführt, nur eine Nachricht angekommen · [ ] Status-Tabelle aktualisiert.

### M2 — Jackpot-Alarm aus dem Geld-Pfad auslagern

- **Status:** 🔴 Geplant — wartet auf Frage 2 (Abschnitt 3) · **Geld-Pfad:** Nein (kein Wallet-Betrag ändert sich) · **Security-Review:** **Pflicht** (bestehender produktiver Bet-/Blackjack-Code wird angefasst)
- **Ziel:** `notifyBigWinIfEligible()` nicht mehr synchron im Bet-Response-Pfad ausführen, sondern als eigenen Trigger.dev-Task fire-and-forget auslösen.
- **Nutzen:** Bet-Response-Pfad braucht keinen Timeout-Trick mehr; bei Telegram-Ausfällen gibt es echte automatische Wiederholungsversuche statt eines einzigen Versuchs.
- **Scope:**
  - Bestehend, wird geändert: `src/app/api/casino/bet/route.ts`, `src/app/api/casino/blackjack/route.ts` (Aufruf von `notifyBigWinIfEligible()` ersetzt durch `tasks.trigger("big-win-notify", {...})`).
  - Bestehend, wird verschoben: `dispatch()`-Logik aus `src/lib/casino/telegram-notifier.ts` (Zeilen 30-52) wandert in den neuen Task.
  - Neu: `src/trigger/big-win-notify.ts`.
- **Datenklassen:** Liest `telegram_links` (chat_id, notifications_enabled) für genau einen `user_id`; schreibt bei Frage-2-Option-A dasselbe Flag zurück. Kein Wallet-/Auth-Zugriff.
- **Anforderungen:**
  - Der Aufruf `tasks.trigger(...)` aus der Route darf die Bet-Response **nie** blockieren oder fehlschlagen lassen — in try/catch, Fehler wird geloggt und verschluckt, exakt wie heute bei `notifyBigWinIfEligible()`.
  - `payload` an den Task enthält nur, was schon heute an `notifyBigWinIfEligible()` übergeben wird (`userId`, `game`, `payout`, `multiplier`, `win`, `replayed`) — keine zusätzlichen Felder.
  - Antwort auf Frage 2 bestimmt, ob der Task bei 403 `notifications_enabled` deaktiviert.
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
- **Definition of Done:** [ ] Frage 2 von Jan beantwortet · [ ] `security-reviewer` ohne CRITICAL/HIGH · [ ] Echter Testbet verifiziert · [ ] Retry-Verhalten nachgewiesen · [ ] Status-Tabelle aktualisiert.

### M3 — Live-Vorschau im Admin-Bereich (Realtime)

- **Status:** 🟡 Execution-Ready · **Geld-Pfad:** Nein · **Security-Review:** Empfohlen (leicht — neuer Admin-Endpunkt, der ein Zugriffs-Token ausstellt)
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
- **Definition of Done:** [ ] Seite gebaut · [ ] Dry-Run bestätigt (kein echter Versand) · [ ] Live-Updates sichtbar · [ ] Admin-Gate verifiziert · [ ] Status-Tabelle aktualisiert.

### M4 — Persönliche Wochen-Rückblicke pro Spieler

- **Status:** 🟡 Execution-Ready · **Geld-Pfad:** Nein · **Security-Review:** Empfohlen (leicht — neuer Massenversand-Pfad)
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
- **Definition of Done:** [ ] Beide Tasks gebaut · [ ] Testlauf mit echtem Opt-in-Account verifiziert · [ ] Versand-Bremse nachgewiesen (z. B. Log zeigt begrenzte Parallelität) · [ ] Status-Tabelle aktualisiert.

### M5 — Freigabe-Workflow für Fraud-Signale

- **Status:** 🔴 Geplant — wartet auf Frage 1 (Abschnitt 3) · **Geld-Pfad:** Nein · **Security-Review:** **Pflicht** (neuer Wartepfad auf sicherheitsrelevante Daten, ggf. neuer Webhook-Zweig bei Option A)
- **Ziel:** Bei einem neuen, besonders auffälligen Fraud-Signal automatisch benachrichtigen und auf eine echte menschliche Entscheidung warten, bevor der Signal-Status auf "geprüft" gesetzt wird.
- **Nutzen:** Schnellere Reaktion auf echte Fraud-Fälle, ohne aktiv im Dashboard nachschauen zu müssen. Bleibt bewusst beobachtend — keine automatische Sperre, kein Auto-Enforcement, konsistent mit dem bestehenden Fraud-System.
- **Scope (abhängig von Antwort auf Frage 1):**
  - Immer: neuer Task `src/trigger/fraud-alert-wait.ts`, der bei neuen High-Severity-`risk_events` eine Telegram-Nachricht schickt, `wait.createToken()` erzeugt und pausiert.
  - Nur bei Option A: Erweiterung von `src/app/api/telegram/webhook/route.ts` um `callback_query`-Handling + Zuordnung Event-ID↔Wait-Token.
  - Nur bei Option B: kleine Erweiterung der bestehenden `/admin/fraud`-Seite um einen Button, der `wait.completeToken()` über eine neue, admin-geschützte Route auslöst — der bestehende `PATCH /api/admin/fraud`-Aufruf (echte Session, echter Freitext) bleibt dabei unverändert.
- **Datenklassen:** Liest `risk_events` (neue Einträge mit `severity = 'high'`), ruft die bestehende RPC `review_risk_event` mit denselben Parametern wie heute (bei Option B unverändert echte Reviewer-ID+Text; bei Option A siehe offene Frage zur Ersatz-Kennung).
- **Anforderungen:**
  - Kein automatisches Setzen auf "geprüft" ohne explizite menschliche Aktion — der Task muss wirklich pausieren (`wait.createToken`), nicht nur eine Nachricht schicken und optimistisch weiterlaufen.
  - Auslöser ist ein **neues** High-Severity-Signal, nicht jedes Update eines bestehenden — sonst Alarm-Flut bei wiederholten Vorkommen desselben Signals.
  - Timeout für die Warte-Marke (z. B. 48h) — läuft die Zeit ab, ohne dass Jan reagiert, bleibt das Signal einfach `open` (kein stiller Auto-Reject).
- **Abhängigkeiten:** `TRIGGER_SECRET_KEY` (Abschnitt 5) für `wait.completeToken()`-Aufruf aus der Next.js-Seite (Option B) bzw. aus dem Webhook (Option A); Antwort auf Frage 1 bestimmt die konkrete Umsetzung.
- **Mögliche Fehlerfälle + Umgang:**

  | Fehlerfall | Umgang |
  | --- | --- |
  | Jan reagiert nie | Warte-Marke läuft nach Timeout ab, Signal bleibt `open`, kein automatischer Fallback-Status |
  | Telegram-Alarm-Nachricht schlägt fehl | Signal bleibt trotzdem in `/admin/fraud` sichtbar und offen — der bestehende manuelle Weg funktioniert immer als Fallback |
  | (Nur Option A) Zuordnung Event↔Wait-Token geht verloren/kollidiert | Fällt auf Option-B-Verhalten zurück: Signal bleibt offen, manuelle Prüfung in `/admin/fraud` weiterhin möglich |
  | Mehrere High-Severity-Signale gleichzeitig | Ein Wait-Token pro Signal, keine gegenseitige Blockade — jede Entscheidung ist unabhängig |

- **Freigabe-Gate:** `security-reviewer`-Agent-Durchlauf (Blast-Radius des neuen Wartepfads, bei Option A zusätzlich Webhook-Erweiterung) — Pflicht vor Go-Live.
- **Verifizierung:** Ein echtes/simuliertes High-Severity-Signal auslösen, Alarm kommt an, Entscheidung (Ignorieren/Prüfen) setzt `risk_events.status` korrekt, Timeout-Fall einmal absichtlich durchlaufen lassen.
- **Nicht-Scope-Grenze:** Keine automatische Sperre/Enforcement bei "verdächtig", kein neuer Money-Pfad, kein Ersatz für das bestehende `/admin/fraud`-Dashboard (bleibt die Quelle der Wahrheit).
- **Definition of Done:** [ ] Frage 1 von Jan beantwortet · [ ] `security-reviewer` ohne CRITICAL/HIGH · [ ] Echter Alarm-Testlauf inkl. Entscheidung verifiziert · [ ] Timeout-Fall verifiziert · [ ] Status-Tabelle aktualisiert.

## 7 — Wie es weitergeht

1. Jan beantwortet Frage 1 und Frage 2 (Abschnitt 3).
2. Bau-Reihenfolge: M6 → M1 → M3 → M4 sofort startklar; M2/M5 starten, sobald die jeweilige Frage beantwortet ist.
3. Jeder Meilenstein wird einzeln nach Fertigstellung auf 🟢 Executed gesetzt (Status-Tabelle in Abschnitt 1 + eigener Detail-Status in Abschnitt 6), inklusive Verifizierungs-Nachweis wie in den bisherigen `01_*`-Plänen üblich.
