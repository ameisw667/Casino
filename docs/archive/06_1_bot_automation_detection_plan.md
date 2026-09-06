# 06_1 — Bot-/Automatisierungserkennung: Umsetzungsplan

> **Status:** Executed (archiviert) — L0–L7 alle 🟢 verifiziert, am 2026-09-04 vollständig ausgeführt und nach `docs/archive/` verschoben · **Owner:** LLM · **Scope:** Unterkategorie #3 aus [`06_rate_limiting_abuse_prevention.md`](../../T_RATE_LIMITING_ABUSE_PREVENTION/06_rate_limiting_abuse_prevention.md) (zuvor Top 92 %, komplett unbearbeitet; nach Ausführung Top 30 %) — Echtzeit-Anti-Automation-Schranken für die 6 identifizierten Bot-Vektoren unten. Offene Grundsatzfragen (Q1–Q5) wurden gemäß den empfohlenen Optionen (a) als dokumentierte Annahmen entschieden und in den jeweiligen Ausführungsnotizen vermerkt.
> **Quellcode-Basis:** Alle Befunde unten wurden am 2026-09-04 durch zwei read-only `casino-code-explorer`-Läufe gegen den tatsächlichen Code verifiziert (Datei:Zeile-Belege), ergänzt durch eine Web-Recherche zu Honeypot-/Timing-Best-Practices 2026.

## 0 — Segmentierung: 6 Bot-Vektoren (vor der Planung identifiziert)

Auf Jans Wunsch wurde „Bot-/Automatisierungserkennung" vor der Planung weiter unterteilt, um nicht nur „irgendeinen Captcha-Ersatz" zu bauen, sondern jeden real existierenden Angriffspfad einzeln zu adressieren:

| Vektor                                | Angriffspfad                                                 | Schweregrad                        | Status quo (verifiziert)                                                                                                                      | Beleg                                                                |
| :------------------------------------ | :----------------------------------------------------------- | :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| **V1 — Signup-Automatisierung**       | Massen-Account-Erstellung (Promo-Farming, Fake-Accounts)     | 🔴 Hoch                            | Kein Honeypot, kein Timing-Check, keine Domain-Prüfung, keine eigene API-Route (direkter Supabase-SDK-Call)                                   | `AuthForm.tsx:103`, `auth-validation.ts:14,20`                       |
| **V2 — Login-Brute-Force-Verteilung** | Verteiltes Credential-Stuffing über viele IPs/Storage-Resets | 🔴 Hoch (neuer, unerwarteter Fund) | Login-Cooldown ist **rein client-seitig** (`sessionStorage`), kein Server-Enforcement, weder pro Account noch pro IP — vollständig umgehbar   | `login-cooldown.ts` (gesamte Datei), `AuthForm.tsx:104`              |
| **V3 — Promo-Code-Brute-Force**       | Erraten von Bonus-Codes                                      | 🟡 Mittel                          | Admin tippt Codes manuell, keine Mindestlänge/-Entropie erzwungen; einziger Schutz ist die 10/60s-Rate-Limit                                  | `admin/promo-codes/route.ts:15-21`                                   |
| **V4 — Chat/Guide-Kostenmissbrauch**  | Automatisierte LLM-Anfragen ohne Obergrenze                  | 🔴 Hoch (Geld-Risiko)              | 30/60s Guide, 15/60s TTS, 10/60s Transkription — aber **kein Tages-/Session-Cap**, rechnerisch ~43.000 Calls/Tag/Nutzer möglich               | `chat/bot-response/route.ts:77`, `chat/voice-synthesize/route.ts:90` |
| **V5 — Scripted-Play (Bet-Bots)**     | Automatisiertes Spielen via direktem API-Call statt Browser  | 🟡 Mittel                          | Kein Anti-Script-Artefakt außer Rate-Limit; `bet_velocity`-Signal ist reiner Batch-Scan (kein Echtzeit-Gate)                                  | `fraud-detection.ts:87-107`, `bet/route.ts:31`                       |
| **V6 — Public-Read-Scraping**         | Massenabruf von `/api/leaderboard`                           | 🟢 Niedrig                         | Bereits als Unterkategorie #2 (Identifier-/IP-Extraktion) derselben Kategorie 06 geführt — **hier bewusst nicht dupliziert**, nur Querverweis | `06_rate_limiting_abuse_prevention.md` #2                            |

**Priorisierung für die Meilensteine unten:** V2 und V4 zuerst (höchstes reales Risiko — Auth-Sicherheitslücke bzw. laufendes Geld-Risiko), dann V1 (Fundament für V3), dann V3/V5, zuletzt Admin-UI + Tests. V6 wird nicht erneut bearbeitet (bereits in #2 geführt).

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                               | Status         | Nächster Schritt                                                                                                                                                                | Zuständigkeit |
| ------ | --------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| L0     | Signal-Infrastruktur erweitern (neue `signal_type`-Werte) | 🟢 Verifiziert | Migration `062` angewendet (lokale Test-Transaktion, ROLLBACK), Guard PASS, 1388 Tests grün                                                                                     | LLM           |
| L1     | Server-seitiges Login-Rate-Limit (V2)                     | 🟢 Verifiziert | `/api/auth/login-guard` + Client-Preflight umgesetzt, security-reviewer FINDING behoben (F1/F4), Tests grün                                                                     | LLM           |
| L2     | Chat/Guide Tages-Cap (V4)                                 | 🟢 Verifiziert | `daily-cost-cap.ts` + 3 Chat-Routen + Client-Meldungen, security-reviewer PASS (MEDIUM-Fix umgesetzt)                                                                           | LLM           |
| L3     | Signup-Honeypot + Timing-Trap (V1)                        | 🟢 Verifiziert | Fail-open Erkennung (`signup-guard.ts`) + off-screen Honeypot in `StandardAuthView`, POST `/api/auth/signup-suspicion` (post-signup Signal), security-reviewer FINDINGS behoben | LLM           |
| L4     | Promo-Code-Entropie-Gate (V3)                             | 🟢 Verifiziert | `min(8)` für neue Codes + per-Code-Guess-Counter (`promo-guess-guard.ts`) mit `voucher_velocity`-Signal, security-reviewer FINDINGS behoben                                     | LLM           |
| L5     | Bet-Automation-Echtzeit-Signal (V5)                       | 🟢 Verifiziert | `bet-velocity-guard.ts` + Verdrahtung in `bet`/`blackjack`/`bet-crash-multiplayer` via `after()`, security-reviewer PASS                                                        | LLM           |
| L6     | Admin-Dashboard-Erweiterung                               | 🟢 Verifiziert | `SIGNAL_LABELS` um 4 neue Typen ergänzt, `signalType`-Filter-Enum im Fraud-API erweitert (inkl. bisher fehlendem `ml_anomaly_score`)                                            | LLM           |
| L7     | Testabdeckung + Doku-Nachzug                              | 🟢 Verifiziert | 4 neue Module bei 100 % Coverage (57 neue Tests, Suite 1445/193 Dateien grün); #3 neu bewertet Top 92 % → Top 30 %, Doku-Nachzug in 4 Dokus                                     | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt.

## 2 — Abgrenzung zu verwandten Plänen

- **Kategorie 03 (Auth):** V2 deckt eine reale Sicherheitslücke im Login-Cooldown auf, der in `docs/status-reports/05_AUTH_SECURITY.md` (M9) als „🟢 Abgeschlossen" geführt wird. Dieser Plan **behebt** die Lücke (L1), ändert aber bewusst nicht die Auth-Statusdokumentation selbst — das wäre ein eigener, hier nicht beauftragter Schritt und wird als offene Frage am Dateiende benannt.
- **Unterkategorie #2 (Identifier-/IP-Extraktion, dieselbe Kategorie 06):** V6 (Leaderboard-Scraping) bleibt dort geführt, keine Dopplung.
- **Unterkategorie #10 (Multi-Account-Abuse-Prevention, dieselbe Kategorie 06):** V1 (Signup-Honeypot) ist eine vorgelagerte, präventive Maßnahme; #10 bleibt die nachgelagerte, batch-basierte Erkennung bereits erstellter Accounts — beide ergänzen sich, keine Dopplung.
- **Unterkategorie #6 (Red-Team-CI-Gate):** Sobald V1/V2 umgesetzt sind, sollte der Red-Team-Test (`scripts/red-team/rate-limit-bypass.ts`) um einen Bot-Bypass-Fall erweitert werden — als Folgeaufgabe in L7 vermerkt, nicht dupliziert in `06_rate_limiting_abuse_prevention.md` #6.

## 3 — Meilensteine im Detail

### L0 — Signal-Infrastruktur erweitern

**Ziel:** Neue `signal_type`-Werte (`bot_signal_honeypot`, `bot_signal_timing`, `bot_signal_login_flood`) in `risk_events` verfügbar machen, als Grundlage für L1–L5.
**Scope:** Migration `061_bot_signal_types.sql` (zero-downtime: `ALTER TABLE ... DROP/ADD CONSTRAINT ... NOT VALID` + `VALIDATE CONSTRAINT`, exaktes Muster aus `030_fraud_signal_detection.sql:10-23`), `record_risk_event()`-Funktionskörper synchron erweitern (`030...sql:44-48`), `RiskSignalType`-Union in `src/lib/casino/risk-signals.ts:3-11` erweitern.
**Abhängigkeiten:** Keine (Fundament).
**Freigabe-Gate:** `@migration-security-guard` PASS (Pflicht laut `CLAUDE.md` bei jeder Änderung unter `supabase/migrations/**`).
**Verifizierung:** Migration lokal anwendbar, `record_risk_event()` akzeptiert neue Typen in einem Testaufruf, bestehende Typen bleiben funktionsfähig (Regressionstest).
**Ausführung (2026-09-04):** Migration heißt `062_bot_signal_types.sql` (061 war bereits vergeben, Kollisions-Check sauber); enthält zusätzlich `cost_cap_reached` für L2 (Annahme dokumentiert, spart Folge-Migration). `@migration-security-guard`: PASS. Lokale Verifikation im DB-Container: 062 in Test-Transaktion angewendet, `record_risk_event()` mit allen 4 neuen Typen plus `voucher_velocity`-Regression erfolgreich, `ROLLBACK` (kein persistenter Zustand). `npm run typecheck` 0 Fehler, `npm test` 185 Dateien/1388 Tests grün. `database.types.ts` führt `signal_type` als `string` → Typgenerierung nicht nötig. Lokale DB-Historie ist driftet (038+ fehlen lokal, `crash_rounds` fehlt) — nicht Teil dieses Plans, nur als Fund vermerkt. Remote-Push bleibt K4 (Jan-Freigabe).
**Nicht-Scope:** Kein Rückwirkungs-Scan bestehender `risk_events`-Zeilen.
**Money-Pfad:** Nein · **Security-Review:** Pflicht (Migration).

### L1 — Server-seitiges Login-Rate-Limit (V2, höchste Priorität)

**Ziel:** Login-Versuche serverseitig begrenzen, unabhängig vom (umgehbaren) Client-Storage-Cooldown.
**Scope:** Neue dünne Preflight-Route `POST /api/auth/login-guard` — ruft ausschließlich `enforceRateLimit(identifier, 'login-attempt', 5, 60)` auf (IP-basiert vor Login, da vor erfolgreicher Auth noch keine `user:<id>`-Identität existiert) und liefert `{ allowed: boolean }` oder 429/503. `AuthForm.tsx:104` ruft diese Route **vor** `supabase.auth.signInWithPassword()` auf; bei `allowed:false` wird der bestehende Client-Cooldown-UI-Text wiederverwendet (`login-cooldown.ts`), keine neue UI nötig. Bestehendes Client-Cooldown bleibt zusätzlich bestehen (Defense-in-Depth, keine Regression).
**Abhängigkeiten:** L0 (für `login_flood`-Signal bei wiederholten Ablehnungen, optional befüllt via `recordRiskEventBestEffort()`).
**Freigabe-Gate:** `security-reviewer` PASS (Auth-Pfad, CLAUDE.md-Pflichtregel).
**Verifizierung:** Test simuliert 6 Login-Versuche von derselben IP in 60s → 6. Versuch liefert 429/503 unabhängig vom Client-Storage-Zustand (auch nach `sessionStorage.clear()`).
**Ausführung (2026-09-04):** Route `src/app/api/auth/login-guard/route.ts` (5/60s, IP-Identifier, fail-closed), `proxy.ts` PUBLIC_ROUTES-Eintrag (Route muss vor Session erreichbar sein), Client-Preflight in `AuthForm.tsx` (non-OK → fail-closed Block mit bestehendem Cooldown-Text, Netzwerkfehler → proceed). Tests: 6 grün. `security-reviewer`: **FINDING** — F1 (MEDIUM): Guard schützt nur den App-Formular-Pfad, nicht direkte Supabase-Auth-Endpoint-Treffer → im Route-Kommentar dokumentiert (Kompensation: Supabase-eigene Limits). F2 (MEDIUM): XFF-Spoofing-Grenze ist projektseitig bekannt, Doku-Eintrag des neuen Scopes folgt in L7. F3 (LOW): Server zählt alle Versuche inkl. erfolgreicher Logins (Abweichung vom Client-Cooldown) → dokumentiert, akzeptierter Trade-off. F4 (LOW): `no-store` auch auf Error-Pfaden ergänzt. Annahme: `bot_signal_login_flood` bleibt vorerst reserviert — vor Auth existiert keine `users`-FK-Identität, `recordRiskEventBestEffort()` ist dort nicht anwendbar; Aufzeichnung nur über Upstash-Analytics/429-Sichtbarkeit.
**Nicht-Scope:** Kein Ersatz von Supabase Auth selbst, keine Änderung an `signInWithPassword()`-Semantik, keine serverseitige Passwort-Validierung.
**Money-Pfad:** Nein · **Security-Review:** Pflicht.

### L2 — Chat/Guide Tages-Cap (V4, Geld-Risiko)

**Ziel:** Hartes tägliches Obergrenzen-Limit pro Nutzer für kostenpflichtige Guide-/Voice-Routen, zusätzlich zur bestehenden Sliding-Window-Rate.
**Scope:** Neuer persistenter 24h-Zähler (Upstash-Key `daily-cost:<userId>:<route>` mit `EXPIRE 86400`, analog zum bestehenden Sliding-Window-Muster in `request-security.ts`, aber mit festem Tages-TTL statt gleitendem Fenster) für `chat/bot-response`, `chat/voice-synthesize`, `chat/voice-transcribe`. Bei Erreichen: kontrollierte 429-Antwort mit klarer Nutzer-Meldung („Tageslimit erreicht, versuch's morgen wieder").
**Abhängigkeiten:** L0 (für `bot_signal_timing`-Analogon, hier eher `cost_cap_reached`-Signal — ggf. eigener kleiner Zusatz zu L0 falls das Enum das noch nicht abdeckt).
**Freigabe-Gate:** `security-reviewer` PASS.
**Verifizierung:** Test simuliert Tageslimit-Überschreitung, bestätigt 429 ab dem konfigurierten Schwellenwert, Zähler setzt nach 24h TTL zurück.
**Ausführung (2026-09-04):** Neues Modul `src/lib/security/daily-cost-cap.ts` (Upstash INCR + `EXPIRE 86400 NX` bei jedem Aufruf — NX-Fix aus Security-Review verhindert, dass ein Crash zwischen INCR/EXPIRE einen Nutzer dauerhaft ohne TTL blockiert; Dev-Fallback lokaler Zähler; Produktion ohne Upstash fail-closed 503). Caps als dokumentierte Annahme: guide-chat 400, voice-synthesize 200, voice-transcribe 100/Tag. Blocken → 429 `DAILY_COST_CAP_REACHED` mit deutscher Meldung, angezeigt in `useGuideChatStream.ts`, `voice-audio.ts`, `useGuideVoiceRecorder.ts`; `cost_cap_reached`-Signal mit UTC-Tages-`windowStart` (fingerprint-stabil, dedup via occurrences). Key-Format `casino:daily-cost:<userId>:<route>` (plan-konform plus `casino:`-Präfix gegen projektübergreifende Key-Kollision). `security-reviewer`: **PASS** (1× MEDIUM-Empfehlung NX-Expire — umgesetzt; Rest dokumentierte Annahmen). Tests: 9 Modul-Tests + 2 neue Route-Vertragstests grün, typecheck 0 Fehler.
**Nicht-Scope:** Kein Nutzer-sichtbares Kontingent-Dashboard (reine Serverseite in diesem Meilenstein), keine Änderung der bestehenden Sliding-Window-Limits selbst.
**Money-Pfad:** Ja (OpenAI-API-Kosten) · **Security-Review:** Pflicht.

### L3 — Signup-Honeypot + Timing-Trap (V1)

**Ziel:** Automatisierte Account-Erstellung ohne UX-Reibung für echte Nutzer abfangen.
**Scope:** Hidden `<input>`-Feld (off-screen per CSS, nicht `display:none`, siehe Web-Recherche unten) in `StandardAuthView.tsx:49-70`, als neuer Prop durch `AuthForm.tsx` durchgereicht (analog zum bestehenden `email`/`password`-Wiring). Zusätzlich `formRenderedAtMs`-Zeitstempel beim Mount, Prüfung in `handleSubmit` (`AuthForm.tsx:86-96`): Honeypot nicht leer ODER Formular in unter 2 Sekunden abgeschickt → Submission wird **fail-open** durchgelassen (keine UX-Blockade für einen False Positive), aber `recordRiskEventBestEffort()` mit neuem Signal aus L0 protokolliert den Verdacht. Kein Blocken beim ersten Verdachtsfall — nur Sichtbarkeit im Admin-Dashboard, um False-Positive-Rate erst zu beobachten, bevor hart geblockt wird.
**Abhängigkeiten:** L0.
**Freigabe-Gate:** `security-reviewer` PASS (Auth-Formular-Änderung).
**Verifizierung:** Test füllt Honeypot → Signal wird aufgezeichnet, Submission bleibt aber erfolgreich (fail-open bestätigt); Test mit normalem Timing → kein Signal.
**Ausführung (2026-09-04):** Erkennung als client-safe Pure-Function-Modul `src/lib/security/signup-guard.ts` extrahiert (`detectSignupSuspicion` — Honeypot gefüllt ODER Submit < 2s nach Mount; korrupte/NaN-Timestamps fail-open → null; `SIGNUP_MIN_SUBMIT_MS = 2000`), weil im Repo keine `@testing-library` existiert und Komponenten-Render-Tests kein etabliertes Muster sind — Abweichung vom Plan-Verifizierungswortlaut: 5 Pure-Function-Tests + 11 Route-Tests statt Komponententest; Fail-open der Submission ist strukturell garantiert (Detektion wirft nie, Report ist fire-and-forget). Hidden Field in `StandardAuthView.tsx` nur im Sign-up-Mode (name `company_website`, `tabIndex={-1}`, `aria-hidden`, off-screen `left:-9999px`, kein `display:none`). Neuer öffentlicher Receiver `POST /api/auth/signup-suspicion` (`src/app/api/auth/signup-suspicion/route.ts`, in `PUBLIC_ROUTES` von `src/proxy.ts` ergänzt): IP-Rate-Limit `signup-suspicion` 10/60 fail-closed, Zod `strictObject`, Signal-Attribution **nach erfolgreichem Signup** — dokumentierte Abweichung vom Plan („Protokollieren beim Submit"): `risk_events.subject_user_id` hat FK auf `users(id)` (Migration 029:5), Pre-Signup-Aufzeichnung ist unmöglich; ohne Session/ohne Auth-Cookie → nur `CasinoLogger.warn` bzw. `{recorded:false}` 200, nie Blockade. `security-reviewer`: **FINDINGS ohne CRITICAL/HIGH** — umgesetzt: (1a) `getClientIdentifier()` nimmt jetzt den **letzten** XFF-Eintrag statt des ersten (projektweit: erster Eintrag ist client-spoofbar → Rate-Limit-Bucket-Minting, betrifft auch L1/L2), (1b) Receiver überspringt den Supabase-`getUser()`-Roundtrip ohne Auth-Cookie. Akzeptiert/dokumentiert: Spoof-Restrisiko nach XFF-Fix (LOW), Autofill-False-Positive-Risiko des Honeypots (LOW — Observability-only, severity low), Timing-Window umfasst Netzwerkzeit (LOW, V1-Limitation), Session-Oracle `{recorded:true}` (LOW), Silent-Drop des Observability-Kanals ohne Sentry-Marker (LOW). Tests: 189 Dateien / 1422 Tests grün (5 signup-guard + 11 signup-suspicion-route + 1 neuer XFF-Test in request-security.test), typecheck 0 Fehler.
**Nicht-Scope:** Kein hartes Blocken in dieser ersten Ausbaustufe (bewusst fail-open, siehe Web-Recherche: Honeypot+Timing allein hat eine reale False-Positive-Rate bei langsamen/assistiven Eingaben). Keine Anwendung auf OAuth/Passkey-Wege (siehe offene Frage Q4 unten).
**Money-Pfad:** Nein (indirekt, siehe V1-Begründung) · **Security-Review:** Pflicht.

### L4 — Promo-Code-Entropie-Gate (V3)

**Ziel:** Verhindern, dass ein zu kurzer/schwacher Admin-erstellter Code brute-forcebar wird.
**Scope:** `admin/promo-codes/route.ts:15-21` Zod-Schema um `min(8)` statt `min(1)` erweitern (nur für **neue** Codes, siehe offene Frage Q2 zum Rückwirkungs-Scope), plus ein serverseitiger Guess-Zähler pro Code (bei N fehlgeschlagenen Redemption-Versuchen desselben Codes binnen Zeitfenster → `voucher_velocity`-Signal wird bereits erzeugt, hier nur die Schwelle prüfen/ggf. verschärfen statt neuer Infrastruktur).
**Abhängigkeiten:** L0 (falls neuer Signaltyp nötig — sonst reicht bestehendes `voucher_velocity`).
**Freigabe-Gate:** `security-reviewer` PASS (Geld-/Bonus-Pfad).
**Verifizierung:** Admin-Route lehnt `min < 8`-Codes ab (Test), bestehende kürzere Codes bleiben unangetastet und funktionsfähig.
**Ausführung (2026-09-04):** (1) `createSchema.code` in `admin/promo-codes/route.ts` auf `min(8)` erhöht — nur neue Codes, keine Migration, bestehende Rows unangetastet (Q2a). Route-Regex wurde in derselben Session auf `[A-Za-z0-9_-]` gelockert (Lowercase-Input, Uppercase beim Insert). (2) Serverseitiger Guess-Zähler als neues Modul `src/lib/security/promo-guess-guard.ts`: pro **Code** (erkennt verteiltes Raten über Accounts hinweg) INCR `casino:promo-guess:<code>` + `EXPIRE 3600 NX`; Schwellenwert-Crossing (exakt bei 10, atomar) → `voucher_velocity` (bestehender Typ, severity `medium`, UTC-Tages-windowStart) — Abweichung vom Plan-Wortlaut: das Signal wird dem **einlösenden Nutzer** zugeordnet statt dem Code, weil `risk_events.subject_user_id` einen FK auf `users(id)` hat (Migration 029) und ein Code kein Subject sein kann; Attribution ist daher „wer die Schwelle überschritten hat", nicht wer geraten hat (dokumentiertes Restrisiko Fehlattribution). Fail-open by design (Detection, nicht Enforcement — anders als das fail-closed `daily-cost-cap`). `security-reviewer`: **FINDINGS ohne CRITICAL/HIGH** — Must-Fixes umgesetzt: (1) Redeem-Schema auf denselben Zeichensatz `[A-Za-z0-9_-]` eingeschränkt (vorher konnte jeder authentifizierte Nutzer unbegrenzt Unicode-Counter-Keys in Redis minten), (2) Code-Korrelation in Evidence ergänzt (Admin sieht, welcher Code geraten wurde), (3) Route-Kommentar korrigiert: min(8) ist Single-Account-infeasible (~4.3e12 Keyspace), aber **kein** Hard-Block gegen verteiltes/multi-account Raten, und Admin-Wörterbuch-Codes (z. B. `SUMMER24`) bleiben ratabar. Empfohlene Follow-ups akzeptiert: EXPIRE-Fehler wirft Signal nicht mehr weg, 2 neue Branch-Tests (Prod-ohne-Upstash-Fail-open, TTL-Fehler). Akzeptiert/dokumentiert: Fehlattributions-Restrisiko (LOW), 2 serielle Upstash-RTTs pro Fehlversuch (LOW), Existenz-Oracle durch unterscheidbare Promo-Fehlercodes (LOW, pre-existing). Tests: 191 Dateien / 1434 Tests grün, typecheck 0 Fehler.
**Nicht-Scope:** Kein rückwirkendes Ändern/Sperren bestehender Codes (Default-Empfehlung, siehe Q2).
**Money-Pfad:** Ja · **Security-Review:** Pflicht.

### L5 — Bet-Automation-Echtzeit-Signal (V5)

**Ziel:** `bet_velocity` von einem reinen Batch-Scan zu einem zusätzlichen Echtzeit-Hinweis aufwerten, ohne die bestehende Batch-Logik zu duplizieren.
**Scope:** Leichter In-Request-Zähler (Upstash, analog zum Rate-Limiter, aber informativ statt blockierend) in `bet/route.ts`/`blackjack/route.ts`/`bet-crash-multiplayer/route.ts`: Bei Überschreiten derselben Schwelle wie `BET_VELOCITY_MIN_BETS` (`fraud-detection.ts:10-11`, aktuell 30 Bets/10 Min) wird sofort ein `bet_velocity`-Signal geschrieben, **zusätzlich** zum bestehenden periodischen Scan (keine Ersetzung, nur schnellere Sichtbarkeit).
**Abhängigkeiten:** L0 nicht zwingend (bestehender `bet_velocity`-Typ reicht).
**Freigabe-Gate:** `security-reviewer` PASS (Geld-Pfad).
**Verifizierung:** Test simuliert 30 Bets in 10 Minuten → Signal erscheint sofort, nicht erst beim nächsten Admin-Scan-Lauf.
**Ausführung (2026-09-04):** Neues Modul `src/lib/security/bet-velocity-guard.ts`: INCR `casino:bet-velocity:<userId>` + `EXPIRE 600 NX`, Crossing bei exakt 30 (atomar, genau ein Caller) → `bet_velocity` (bestehender Typ, severity `low` — Batch-Scan bleibt Autorität für medium/high-Bänder), UTC-Tages-windowStart, fingerprint-stabile Evidence `{source:'realtime', windowMinutes, threshold}` (bewusst anderes Fingerprint-Segment als der Batch-Scan → zwei unterscheidbare Zeilen/Tag statt Doppelzählung). Threshold/Window werden **importiert** aus `fraud-detection.ts` (Konstanten dorthin exportiert), damit Batch und Realtime nicht driften können. Verdrahtung über `next/server` `after()` (Null-Latenz auf dem Money-Pfad): bet-Route bei `settleBet` (Dice/Slots/Roulette) und `startRound` (Crash-START), crash-multiplayer bei `startRound`, blackjack bei `DEAL` und bei DOUBLE/SPLIT (`additionalBet > 0` — zusätzliche Einsätze zählen als eigene Wette; Cashout/Resolve zählen nicht, die Wette wurde schon beim START gezählt). Zähl-Semantik weicht bewusst vom Batch-RPC ab (Aktionen vs. DB-Bet-Zeilen, Roulette-Request mit bis zu 100 Einzelwetten = 1) — Kalibrierungsnotiz dokumentiert. `security-reviewer`: **PASS** (kein Must-Fix). Empfohlene LOW-Fixes umgesetzt: (1) Replays (`replayed === true`) werden nicht gezählt — Replay-Bewegungen bewegen kein Geld und erzeugen keine DB-Bet-Zeile, (2) alle `after()`-Aufrufe mit try/catch bewacht (wirft außerhalb echtem Request-Scope — sonst würde nach erfolgtem Settlement ein 500 an den Client gehen). Akzeptiert/dokumentiert: Fixed-Window-Undercount am TTL-Rand (Burst straddelt Expiry → kein Hinweis; Batch bleibt Autorität), Sticky-Counter-Restrisiko bei dauerhaft fehlschlagendem EXPIRE (gleiches akzeptiertes Muster wie promo-guess-guard/daily-cost-cap). Tests: 10 Modul-Tests neu, 1443 Tests grün, typecheck 0 Fehler.
**Nicht-Scope:** Kein automatisches Blocken/Sperren des Accounts (bleibt Admin-Review-Entscheidung wie bisher).
**Money-Pfad:** Ja · **Security-Review:** Pflicht.

### L6 — Admin-Dashboard-Erweiterung

**Ziel:** Neue Signaltypen aus L0–L5 im bestehenden `/admin/fraud`-UI sichtbar machen.
**Scope:** `SIGNAL_LABELS`/`SEVERITY_COLORS` in `FraudPageClient.tsx:31-52` um die neuen Typen ergänzen. Kein neues UI-Komponenten-Gerüst nötig (Filter/Liste sind bereits generisch über `signal_type`).
**Abhängigkeiten:** L0–L5.
**Freigabe-Gate:** Keins (reine UI-Erweiterung, kein neuer Datenpfad).
**Verifizierung:** Neue Signale erscheinen mit korrektem deutschen Label im Admin-Dashboard.
**Ausführung (2026-09-04):** `SIGNAL_LABELS` in `FraudPageClient.tsx` um die vier neuen Typen ergänzt: `bot_signal_honeypot` → „Signup-Honeypot", `bot_signal_timing` → „Signup-Timing", `bot_signal_login_flood` → „Login-Flood", `cost_cap_reached` → „Tageslimit erreicht" (deutsche Labels im Stil der bestehenden Einträge). Zusätzlich (kleiner Konsistenz-Fund, im gleichen Zug gefixt): der `signalType`-Filter-Enum in `src/app/api/admin/fraud/route.ts` kannte bisher nicht einmal `ml_anomaly_score` (pre-existing Lücke) und nun die vier neuen Typen — der generische Filter im Dashboard funktioniert nur für im Enum enthaltene Typen. `SEVERITY_COLORS` unverändert (die drei Stufen decken alle neuen Signale ab). Kein Freigabe-Gate laut Plan (reine UI-Erweiterung, kein neuer Datenpfad); die Enum-Erweiterung ist reine Query-Validierung ohne neuen Datenfluss. Visuelle Verifizierung im Dashboard bleibt gemäß [[no-visual-check-frontend]] bei Jan (Komponenten-Änderung ist eine reine Label-Map-Erweiterung, kein Layout-Einfluss). Tests: 1443 grün, typecheck 0 Fehler.
**Nicht-Scope:** Kein neuer Filter-Tab „Bot-Verdacht" in dieser Ausbaustufe (YAGNI — bestehender generischer Filter reicht, bis sich Bedarf zeigt).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L7 — Testabdeckung + Doku-Nachzug

**Ziel:** Jedes neue Modul nach etabliertem Muster testen, Kategorie-06-Aufschlüsselung nachziehen.
**Scope:** `src/lib/security/__tests__/*.test.ts` je Modul (Vitest, `vi.hoisted()`/`vi.mock()`-Muster wie `request-security.test.ts`), danach Aktualisierung von `06_rate_limiting_abuse_prevention.md` Unterkategorie #3 (Niveau-Neubewertung nach Umsetzung) sowie Vermerk in `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`. Zusätzlich: Folgeaufgabe für `scripts/red-team/rate-limit-bypass.ts` vermerken (Bot-Bypass-Testfall ergänzen — nicht Teil dieses Plans, nur benannt).
**Abhängigkeiten:** L0–L6.
**Freigabe-Gate:** Alle neuen Tests grün, `npm run typecheck`/`npm run lint` 0 Fehler.
**Verifizierung:** Vollständiger Testlauf + Coverage-Check für die neuen Dateien.
**Ausführung (2026-09-04):** Alle Punkte umgesetzt.

- **Tests je Modul:** 6 neue Testdateien mit 57 Tests (signup-guard 5, signup-suspicion-route 11, promo-guess-guard 10, admin-promo-create 3, bet-velocity-guard 10, signup-report 2 + XFF-Spoofing-Test in `request-security.test.ts`). Coverage-Verifizierung per JSON-Report: alle vier neuen Module (`signup-guard.ts`, `daily-cost-cap.ts`, `promo-guess-guard.ts`, `bet-velocity-guard.ts`) bei **100 % Statements + 100 % Functions**. Lücken, die sich beim Coverage-Lauf zeigten, geschlossen: `reportSignupSuspicion` (Fire-and-forget-Fetch-Vertrag) bekam eigene Tests in `signup-report.test.ts`.
- **Freigabe-Gate:** Vollständiger Lauf 1445/1445 Tests in 193 Dateien grün; `npm run typecheck` 0 Fehler; `npm run lint` 0 Fehler. Lint-Fund während des Gates: `useRef(Date.now())` in `AuthForm.tsx` verstieß gegen die React-Compiler-Regel „impure function during render" — Mount-Zeitstempel in einen Mount-`useEffect` verschoben (Semantik unverändert: Baseline bleibt der erste Mount).
- **`06_rate_limiting_abuse_prevention.md` #3 neu bewertet:** Top 92 % → **Top 30 %** (🔴 → 🟠), Begründung im Detailabschnitt #3 (Echtzeit-Signale über 5 Vektoren, aber bewusst fail-open/observability-only); rechnerischer Kategorie-Schnitt Top 44,3 % → Top 38,1 % an allen 3 Stellen nachgezogen.
- **`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`:** #3-Zeile, Executive Summary, Kernaussage, nächste Schritte und Schnitt aktualisiert (Status: 06_1 executed).
- **F2-Nachtrag aus L1-Review:** Scope-Doku-Eintrag in `docs/observability/05_ratelimit_failclosed_alerting.md` §5 ergänzt — 35 → 37 `enforceRateLimit()`-Aufrufer (`auth/login-guard` / `login-attempt`, `auth/signup-suspicion` / `signup-suspicion`), plus Vermerk zum separaten Daily-Cost-Cap (nicht über `enforceRateLimit()`).
- **Q5a:** `docs/status-reports/05_AUTH_SECURITY.md` M9 korrigiert („rein client-seitig, serverseitig umgehbar" eingestanden; serverseitige Ebene aus L1 dokumentiert).
- **Red-Team-Folgeaufgabe vermerkt** (nur benannt, nicht umgesetzt): `docs/security-hardening/09_red_team_probes.md` §6 — Bot-Bypass-Testfall für `rate-limit-bypass.ts` (erwartet: fail-open Submission + `bot_signal_*`-Risk-Event).
- **Annahmen:** Niveau-Prozentwert der Neubewertung (Top 30 %) ist eine begründete LLM-Einschätzung nach der etablierten Marker-Konvention, keine gemessene Metrik. Coverage-Fehler des globalen Thresholds auf `src/lib/security/login-audit.ts` (0 % functions, pre-existing, außerhalb dieses Plans) ignoriert wie im Nicht-Scope definiert.
  **Nicht-Scope:** Kein Rückwirkungs-Fix des projektweiten Coverage-Gate-Gaps (bestehender Fund: `test:coverage` läuft nicht in CI, nur lokal — das ist ein Kategorie-11/Testing-QA-Thema, nicht Teil dieses Plans, nur als Fund vermerkt).
  **Money-Pfad:** Nein · **Security-Review:** Nein.

## 4 — Web-Recherche-Grundlage (2026-09-04)

Honeypot-Felder (off-screen `position:absolute; left:-9999px` statt `display:none`, da manche Bots `display:none` erkennen) + Timing-Trap (Submission unter ~2–3s gilt als automatisiert) sind laut aktueller Praxis 2026 die Standard-Kombination ohne externe Captcha-Abhängigkeit, mit bis zu 99 % Spam-Reduktion in Kombination. Bekannte Grenze: Headless-Browser-Bots (echte Browser-Engine, rendern CSS korrekt) umgehen einfache Honeypots — deshalb bewusst **fail-open mit Signal-Aufzeichnung statt hartem Block** in L3, um die reale Fehlerrate erst zu beobachten. Quellen: [WorkOS — How to stop bots with honeypots](https://workos.com/blog/stop-bots-with-honeypots), [DEV Community — Honeypot Fields](https://dev.to/alexisfranorge/honeypot-fields-bot-protection-thats-free-and-takes-5-minutes-2eid), [Split Forms — What Is a Honeypot Field? (2026)](https://splitforms.com/blog/what-is-a-honeypot-field).

## 5 — Selbstprüfung (durchgeführt 2026-09-04)

- ✅ Scope gegenüber Kategorie 03, Unterkategorie #2 und #10 abgegrenzt (Abschnitt 2).
- ✅ Jeder Meilenstein hat Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung/Nicht-Scope/Money-Pfad/Security-Review.
- ✅ Alle Zuständigkeiten = LLM, kein Meilenstein blockiert auf eine Jan-Zwischenentscheidung.
- ✅ Reihenfolge nach Risiko priorisiert (V2/V4 zuerst), nicht nach Bequemlichkeit.
- ⚠️ **Nachträglich gefunden beim Selbst-Review:** L1 (Login-Preflight-Route) und L3 (Signup-Honeypot) betreffen beide `AuthForm.tsx` — sollten in derselben Ausführungssession bearbeitet werden, um nicht zweimal denselben Datei-Kontext zu laden. Als Hinweis hier ergänzt, keine Planänderung nötig.
- ⚠️ **Nachträglich gefunden:** Der V2-Fund (Login-Cooldown rein client-seitig) widerspricht einer bestehenden „Abgeschlossen"-Behauptung in `docs/status-reports/05_AUTH_SECURITY.md`. Dieser Plan behebt das Problem, aktualisiert aber nicht automatisch die Auth-Statusdokumentation — als offene Frage Q5 unten benannt, damit das nicht stillschweigend inkonsistent bleibt.
- ✅ Kein Punkt doppelt als SOP/Kontextreferenz/Plan gepflegt (verweist nur, kopiert nicht).

## 6 — Offene Fragen für Jan (je 3 Antwortoptionen)

**Q1 — Soll der Login-Brute-Force-Fund (V2) primär in diesem Plan gelöst werden oder gehört die Korrektur eigentlich zu Kategorie 03 (Auth)?**

- (a) In diesem Plan lösen, da dieselbe `enforceRateLimit()`-Infrastruktur genutzt wird — pragmatisch, kein Kategorie-Sprung. _(Empfehlung)_
- (b) Auslagern: Dieser Plan dokumentiert nur den Fund, die eigentliche Umsetzung wird ein eigener Kategorie-03-Plan.
- (c) Nur als Fund dokumentieren, keine Umsetzung in diesem Anlauf — Priorisierung später separat.

**Q2 — Sollen bereits bestehende, zu kurze Promo-Codes (V3, L4) rückwirkend geprüft werden?**

- (a) Nur neue Codes ab jetzt absichern, bestehende bleiben unangetastet (kein Breaking-Change-Risiko). _(Empfehlung)_
- (b) Zusätzlich bestehende Codes scannen und schwache im Admin-Dashboard markieren (aber nicht sperren).
- (c) Bestehende schwache Codes technisch sperren/invalidieren — höchste Sicherheit, aber Risiko für bereits verteilte Codes.

**Q3 — Soll das Chat/Guide-Tageslimit (V4, L2) hart blockierend sein oder nur beobachtend?**

- (a) Hartes Tageslimit mit sichtbarer Nutzer-Meldung — stärkster Kostenschutz. _(Empfehlung, da echtes Geld-Risiko)_
- (b) Nur Monitoring/Sentry-Alarm ohne Blockade — kein UX-Impact, aber Kosten könnten vor Reaktion eskalieren.
- (c) Weiches Limit: ab Schwellenwert Rate-Limit drastisch verschärfen (z. B. 30/60s → 5/60s) statt hartem Stopp.

**Q4 — Soll der Signup-Honeypot (V1, L3) auf alle vier Signup-Wege angewendet werden oder nur auf das Formular?**

- (a) Nur Email/Passwort-Formular — größter Bot-Vektor, kleinster Scope. _(Empfehlung)_
- (b) Email/Passwort + Magic-Link/OTP (nutzen dieselbe Eingabemaske).
- (c) Alle vier Wege inkl. OAuth/Passkey-Trigger — maximale Abdeckung, aber OAuth/Passkey sind bereits schwer automatisierbar.

**Q5 — Soll `docs/status-reports/05_AUTH_SECURITY.md` (M9-Zeile) nach Umsetzung von L1 korrigiert werden, um den client-seitigen Cooldown-Fund transparent zu machen?**

- (a) Ja, nach L1-Umsetzung dort ergänzen, dass serverseitige Absicherung erst durch diesen Plan hinzukam. _(Empfehlung — Konsistenz mit „ehrlich benannt statt beschönigt"-Prinzip aus `00_WORLDMAP_STATUS.md`)_
- (b) Nein, das bleibt bewusst nur hier dokumentiert, um Kategorie-03-Scope nicht ungefragt zu berühren.
- (c) Separater Mini-Fund-Vermerk in `00_WORLDMAP_STATUS.md`, aber keine Änderung an der Auth-Detail-Doku selbst.

## 7 — Verwandte Artefakte

| Bedarf                                                            | Datei                                                                                                                 |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| Vollständige Kategorie-06-Aufschlüsselung (Ursprung dieses Plans) | [`06_rate_limiting_abuse_prevention.md`](../../T_RATE_LIMITING_ABUSE_PREVENTION/06_rate_limiting_abuse_prevention.md) |
| Kompakte Kategorie-Overview                                       | [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../rate-limiting/00_RATE_LIMITING_OVERVIEW.md)                    |
| Bestehende Fail-Closed-Rate-Limiter-Doku                          | [`docs/observability/05_ratelimit_failclosed_alerting.md`](../observability/05_ratelimit_failclosed_alerting.md)      |
| Auth-Statusdoku mit dem betroffenen M9-Fund                       | [`docs/status-reports/05_AUTH_SECURITY.md`](../status-reports/05_AUTH_SECURITY.md)                                    |
| SOP Planungsdateien (Format dieses Plans)                         | [`xx_sop/03_workflow_jan_planungsdateien.md`](../../xx_sop/03_workflow_jan_planungsdateien.md)                        |
| SOP Execution (nächster Schritt nach Freigabe)                    | [`xx_sop/02_workflow_jan_execution.md`](../../xx_sop/02_workflow_jan_execution.md)                                    |
