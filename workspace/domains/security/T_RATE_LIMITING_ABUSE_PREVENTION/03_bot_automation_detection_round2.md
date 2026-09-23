# 03 — Bot-/Automatisierungserkennung (Runde 2 — Ziel Top 5–15 %)

> **Status:** 🔴 Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (100 % LLM-Zuständigkeit, kein Jan-Gate) · **Scope:** `src/app/api/auth/signup-suspicion/route.ts`, eine neue Signup-Preflight-Route (`src/app/api/auth/signup-guard/route.ts`), `src/components/auth/AuthForm.tsx`, `src/app/api/auth/login-guard/route.ts`, `src/lib/security/signup-guard.ts`, zugehörige Tests. **Nicht** im Scope: CAPTCHA/Geräte-Fingerprinting (von beiden ursprünglichen Recherche-Perspektiven bewusst nicht empfohlen, keine Evidenz für Headless-Bot-Bypass), Änderungen an `daily-cost-cap.ts`/`promo-guess-guard.ts`/`bet-velocity-guard.ts` selbst (bereits Top 10 %, kein Bottleneck), die 3 bestehenden Signalerfassungs-Endpunkte für Honeypot/Timing selbst (unverändert korrekt, nur ihre fehlende Korrelation ist der Fund).
> **Money-Pfad:** Nein (Signup-/Login-Ebene, kein Wallet-Zugriff) · **Security-Review:** Empfohlen bei L1/L2 (neue Enforcement-Logik auf einem Auth-Pfad, auch wenn kein Money-Pfad)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Diese Säule hatte am 2026-09-13 bereits eine Ebene-2-Planungsdatei (erarbeitet durch zwei unabhängige Recherche-Perspektiven: `casino-code-explorer`, `security-reviewer`), die durch eine parallele, unkoordinierte Session im selben Repo überschrieben/gelöscht wurde. Am 2026-09-17 wurde die Diagnose in [`Uebersichtsdateien/p03_bot_automation_detection.md`](Uebersichtsdateien/p03_bot_automation_detection.md) als Ebene-1-Assessment rekonstruiert und gegen den Code neu verifiziert. **Diese Datei baut darauf auf** und wurde zusätzlich am 2026-09-18 durch eine gezielte Recherche zur Umsetzbarkeit von #05 vertieft (siehe Punkt 4).
2. **Diese Datei ist reine Planung, keine Ausführung.** Die Umsetzung erfolgt in einer separaten Konversation/Session.
3. **Zwei benannte Bottlenecks aus der Ebene-1-Diagnose** (§2 #04/#05): (a) außer dem Chat-/Cost-Cap eskaliert kein einziges der 5 Erkennungssignale automatisch; (b) `bot_signal_login_flood` ist bis in Typ, Admin-Filter und UI-Label vorgedacht, hat aber 0 Producer.
4. **Wichtiger, neuer Fund bei der Vertiefung von #05 (2026-09-18, per gezieltem `Grep`/`Read`, kein Agent-Fan-out nötig):** Die Ebene-1-Diagnose nennt als Action Item nur „Signal nachrüsten", ohne die strukturelle Hürde zu benennen: `risk_events.subject_user_id` ist `NOT NULL REFERENCES public.users(id)` (`029_risk_events.sql:5`) — ein Risk-Signal **muss** einem existierenden Nutzer zugeordnet sein. `login-guard/route.ts` ist aber eine reine Preflight-Route **vor** jedem Supabase-Auth-Aufruf (`AuthForm.tsx:54`, aufgerufen bevor `signInWithPassword` bei Zeile 147 überhaupt läuft) und kennt zu diesem Zeitpunkt keine E-Mail und keine Nutzer-Identität — nur die IP. Ein Signal kann daher **nicht** direkt aus `login-guard` heraus in `risk_events` geschrieben werden, ohne zusätzliche Information. Die in L2 gewählte Lösung (E-Mail im Preflight-Body mitschicken, serverseitig gegen `users` auflösen, Signal nur bei erfolgreicher Auflösung feuern) ist eine bewusste, in §4/L2 begründete Designentscheidung — keine der beiden ursprünglichen Recherche-Perspektiven hatte diese FK-Hürde dokumentiert.
5. **Bewusst außerhalb dieser Runde:** CAPTCHA/Geräte-Fingerprinting (siehe Scope-Zeile oben). Eine Eskalation für #02 (Promo-Guess-/Bet-Velocity-Signale) ist ebenfalls **nicht** Teil dieser Runde — die Ebene-1-Diagnose benennt ausdrücklich nur die Signup-Suspicion-Korrelation (#04) und den Login-Flood-Producer (#05) als 🔴-Bottlenecks; eine Ausweitung auf weitere Signaltypen wäre unbelegte Spekulation ohne eigene Recherche.
6. **Kein Fan-out-Cluster in dieser Runde:** L1 (Signup-Eskalation) und L2 (Login-Flood-Signal) berühren beide `src/components/auth/AuthForm.tsx` (L1 ergänzt den Signup-Preflight-Aufruf, L2 erweitert den bestehenden Login-Guard-Aufruf um die E-Mail) — ein gemeinsamer Schreibbereich verletzt Fan-out-Kriterium 5(a) aus `xx_sop/shared/jan-planner/SKILL.md`. Beide Meilensteine laufen daher **sequenziell**, im Zweifel-Fall-Default der SOP.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                          | Scope (Dateien)                                                                                                                                                              | Ausführung                                          | Status     | Zuständigkeit | Verifikation                                                                                                                                         |
| ------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1     | Korrelierte Eskalationsschranke für Signup-Suspicion | `src/app/api/auth/signup-suspicion/route.ts`, neue Datei `src/app/api/auth/signup-guard/route.ts`, `src/lib/security/signup-guard.ts`, `AuthForm.tsx`, neue/erweiterte Tests | Sequenziell                                         | 🔴 Geplant | LLM           | Neuer Test belegt: 3. kombinierter Honeypot-/Timing-Treffer derselben IP innerhalb 1h löst 15-Min-Block für `signup-guard` aus                       |
| L2     | `bot_signal_login_flood`-Producer nachrüsten         | `src/app/api/auth/login-guard/route.ts`, `AuthForm.tsx`                                                                                                                      | Sequenziell (nach L1, gleiche Datei `AuthForm.tsx`) | 🔴 Geplant | LLM           | Neuer Test belegt: bei überschrittenem Login-Budget UND auflösbarer E-Mail wird `bot_signal_login_flood` mit korrektem `subjectUserId` aufgezeichnet |
| L3     | Merge & Abschlussprüfung                             | —                                                                                                                                                                            | Sequenziell (nach L2)                               | 🔴 Geplant | LLM           | 5-Stufen-DoD grün                                                                                                                                    |

**Warum kein Jan-Gate:** Beide Meilensteine sind additive Erkennungs-/Signal-Ergänzungen ohne neuen Auto-Block auf Basis eines Einzelsignals (L2 ist bewusst „nur Signal", siehe §4) bzw. mit einem eng begrenzten, klar dokumentierten neuen Block (L1, nur nach ≥3 korrelierten Treffern derselben IP) — kein Breaking Change für legitime Nutzer im Normalfall.

---

## 2 — Bot-/Automatisierungserkennung in Subkategorien: Neubewertung (2026-09-18, Baseline für diese Runde)

|  #  | Subkategorie                                                            | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                                                                                                                               |
| :-: | ----------------------------------------------------------------------- | :---------------: | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | Signup-Honeypot/Timing — Signalerfassung & Persistierung                |     Top 10 %      |   🟢   | Persistiert korrekt in `risk_events` (`signup-suspicion/route.ts:79-85`)                                                                                                                                                                                                 |
|  2  | Promo-Guess-/Bet-Velocity-/Cost-Cap-Signale                             |     Top 10 %      |   🟢   | Alle drei speisen `risk_events` korrekt, Dateien bestätigt vorhanden (`promo-guess-guard.ts`, `bet-velocity-guard.ts`, `daily-cost-cap.ts`)                                                                                                                              |
|  3  | Daily-Cost-Cap — einziger harter 429-Block unter den 5 Signalen         |     Top 10 %      |   🟢   | Weiterhin der einzige harte Block; keine Änderung in dieser Runde                                                                                                                                                                                                        |
|  4  | **Eskalationsschranke — alle Signale außer Cost-Cap bleiben fail-open** |     Top 55 %      |   🔴   | Zentrale Runde-1-Restlücke; `signup-suspicion/route.ts` zeichnet Signale nur auf, ohne je zu korrelieren oder zu eskalieren                                                                                                                                              |
|  5  | **`bot_signal_login_flood` — halb verdrahtet, 0 Producer**              |     Top 50 %      |   🔴   | Typ (`risk-signals.ts:14`), Admin-Filter (`admin/fraud/route.ts:34`), UI-Label (`FraudPageClient.tsx:43`) existieren, aber 0 Aufrufer in `login-guard/route.ts` — zusätzlich: strukturelle FK-Hürde (`subject_user_id NOT NULL`) bislang nicht dokumentiert (§0 Punkt 4) |

**Rechnerischer Schnitt (Baseline dieser Runde, 5 Subkategorien):** (10+10+10+55+50)/5 = **Top 27,0 %** — deckungsgleich mit dem Ebene-1-Schnitt aus `Uebersichtsdateien/p03_bot_automation_detection.md` (keine neue Drift seit 2026-09-17 gefunden, alle Belegzeilen frisch reverifiziert; die FK-Hürde ändert die Diagnose nicht, nur die Lösungskonkretisierung).

---

## 3 — Verifizierter Ist-Stand (frische Recherche, 2026-09-18)

**Signup-Suspicion-Empfänger** (`src/app/api/auth/signup-suspicion/route.ts`): Der Client meldet Honeypot-/Timing-Verdacht fire-and-forget **nach** einem bereits erfolgreichen Signup (Kommentar Zeilen 14-18: die `risk_events`-FK auf `users.id` macht eine Vor-Signup-Erfassung unmöglich). Rate-limitiert auf 10/60s pro IP (`SUSPICION_LIMIT`/`SUSPICION_WINDOW_SECONDS`, Zeilen 19-20). Zeichnet pro Meldung genau ein `bot_signal_honeypot`/`bot_signal_timing`-Ereignis auf (Zeilen 79-85), **ohne** die IP oder einen anderen anonymen Korrelationsschlüssel in `evidence` zu speichern (`evidence: { reason }`, Zeile 84) und **ohne** je zu prüfen, wie viele solcher Signale von derselben Quelle in einem Zeitfenster kamen.

**Login-Guard-Preflight** (`src/app/api/auth/login-guard/route.ts`): Reine IP-basierte Rate-Limit-Preflight (5/60s, Zeilen 19-20) **vor** jedem `supabase.auth.signInWithPassword()`-Aufruf. Liest aktuell **keinen Request-Body** — kennt weder die versuchte E-Mail noch sonst eine Identität. Bei Budget-Überschreitung wird nur ein generischer 429 zurückgegeben (Zeilen 31-39), **kein** Risk-Event wird aufgezeichnet.

**AuthForm-Aufruf-Kette bestätigt** (`src/components/auth/AuthForm.tsx`): `checkLoginGuard()` (Zeilen 52-66) ruft `POST /api/auth/login-guard` **ohne Body** auf (Zeile 54), nur für `mode !== 'sign-up'` (Zeile 136-143, vor `signInWithPassword` Zeile 147). Für `mode === 'sign-up'` existiert **kein** serverseitiger Preflight überhaupt — `supabase.auth.signUp()` (Zeile 146) wird direkt aufgerufen, ohne vorherige Prüfung auf clientseitige Ebene. Das ist der strukturelle Grund, warum eine „15-Min-Block neuer Signup-Versuche" (§0 Punkt 5 der Ebene-1-Diagnose, dort als Action Item benannt) eine **neue** Preflight-Route braucht — es gibt noch keine, die man nur erweitern könnte.

**`bot_signal_login_flood` vorgedacht, aber 0 Producer bestätigt:** Typ in `risk-signals.ts:14` (`RiskSignalType`-Union), Admin-Filter in `admin/fraud/route.ts:34`, UI-Label `'Login-Flood'` in `FraudPageClient.tsx:43`. Repoweiter `Grep` nach `bot_signal_login_flood` findet außer diesen 3 Stellen keine weiteren Treffer — insbesondere 0 in `login-guard/route.ts`.

**FK-Constraint bestätigt** (`029_risk_events.sql:3-26`): `subject_user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE`. `record_risk_event`-RPC (`029_risk_events.sql:36,52-53`) weist einen leeren/NULL `p_subject_user_id` explizit ab. Ein Signal ohne bekannten Nutzer ist mit der heutigen Tabellenstruktur **nicht** aufzeichenbar — eine Schemaänderung (z. B. nullable IP-Fallback-Spalte) wäre eine deutlich größere, hier bewusst nicht gewählte Lösung (siehe L2-Designentscheidung).

**Rate-Limit-Infrastruktur wiederverwendbar** (`src/lib/security/request-security.ts`, bereits in Säule 1/2 vertieft): `enforceRateLimit(identifier, scope, limit, windowSeconds)` basiert auf Upstash `Ratelimit.slidingWindow` — jeder Aufruf verbraucht ein Kontingent des benannten Scopes. Das erlaubt, denselben Mechanismus zweckentfremdet als reinen Zähler/Flag zu nutzen (siehe L1 Schritt 2), ohne neue Redis-Primitive einzuführen.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: Korrelierte Eskalationsschranke für Signup-Suspicion

- **Ziel:** Die in §2 #4 benannte Lücke schließen — ≥3 kombinierte Honeypot-/Timing-Treffer derselben IP innerhalb 1h lösen einen 15-minütigen Block neuer Signup-Versuche derselben IP aus.
- **Schritte:**
  1. In `signup-suspicion/route.ts` nach dem bestehenden `recordRiskEventBestEffort()`-Aufruf (Zeile 79-85) einen Korrelations-Zähler ergänzen: `const correlation = await enforceRateLimit(getClientIdentifier(request), 'signup-suspicion-correlation', 3, 3600);` — die ersten 3 Signale einer IP innerhalb einer Stunde bestehen, das 4. schlägt fehl (`correlation.success === false`).
  2. Wenn `correlation.success === false` (Schwelle überschritten): einen zweiten, als reines Flag genutzten Zähler setzen: `await enforceRateLimit(getClientIdentifier(request), 'signup-block', 1, 900);` (900s = 15 Minuten). Der erste Aufruf dieses Scopes durch diese IP verbraucht das einzige erlaubte Kontingent — jeder weitere Aufruf desselben Scopes/derselben IP innerhalb der 900s liefert `success: false` und dient damit als „ist blockiert"-Prüfung für Schritt 3.
  3. Neue Route `src/app/api/auth/signup-guard/route.ts` (Muster: `login-guard/route.ts` fast 1:1 übernehmen): prüft **ausschließlich** `enforceRateLimit(getClientIdentifier(request), 'signup-block', 1, 900)` — bei `success === false` (Kontingent bereits durch Schritt 2 verbraucht) 429 zurückgeben, sonst `{ allowed: true }`. Wichtig: dieser Check selbst verbraucht ebenfalls das (bereits verbrauchte) Kontingent — das ist beabsichtigt und harmlos, da der Scope ohnehin für die volle Fensterdauer blockiert bleiben soll, unabhängig davon, wie oft `signup-guard` in dieser Zeit aufgerufen wird.
  4. `AuthForm.tsx`: eine `checkSignupGuard()`-Funktion analog zu `checkLoginGuard()` (Zeilen 52-66) ergänzen und vor `supabase.auth.signUp()` (Zeile 146, im `mode === 'sign-up'`-Zweig) aufrufen — bei `!allowed` denselben `formatCooldownMessage()`-Pfad wie beim Login-Guard nutzen (Zeile 139).
  5. Test in einer neuen oder erweiterten Testdatei für `signup-suspicion/route.ts` (Muster: `src/lib/security/__tests__/login-guard-route.test.ts`, falls strukturell übertragbar): 3 aufeinanderfolgende Honeypot-/Timing-Meldungen derselben IP, danach ein `signup-guard`-Aufruf derselben IP muss 429 liefern; eine andere IP bleibt unblockiert.
- **Erwartetes Verhalten:** Eine einzelne verdächtige Meldung blockiert nichts (fail-open bleibt für den Einzelfall bestehen, wie von beiden ursprünglichen Recherche-Perspektiven gewollt). Erst eine klare Häufung von derselben Quelle löst einen zeitlich eng begrenzten Block aus.
- **Abbruchkriterium:** Falls `getClientIdentifier()` für dieselbe IP zwischen Signup und dem folgenden Signup-Versuch unterschiedliche Werte liefert (z. B. durch einen zwischenzeitlichen Login-Zustandswechsel) — vor Abschluss per Test verifizieren, dass der Identifier für anonyme Requests rein IP-basiert und stabil ist (`request-security.ts:144-153`, für nicht eingeloggte Nutzer immer `ip:${...}`, kein Nutzerwechsel möglich vor einem abgeschlossenen Signup).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Empfohlen (neuer Enforcement-Mechanismus auf dem Auth-Pfad, auch wenn kein Geld bewegt wird).

### Meilenstein L2: `bot_signal_login_flood`-Producer nachrüsten

- **Ziel:** Die in §2 #5 benannte Lücke schließen — **nur** als Signal, kein zusätzlicher Auto-Block (CGNAT-/Autofill-False-Positive-Risiko bei Einzelsignal-Eskalation, wie in der Ebene-1-Diagnose explizit festgehalten).
- **Designentscheidung (siehe §0 Punkt 4):** Da `login-guard` pre-auth läuft und `risk_events.subject_user_id` eine existierende `users.id` verlangt, wird die versuchte E-Mail-Adresse **zusätzlich** im Request-Body an `login-guard` übergeben, damit die Route bei Budget-Überschreitung serverseitig prüfen kann, ob diese E-Mail zu einem existierenden Nutzer gehört — nur dann wird das Signal aufgezeichnet. Das deckt den Fall ab, in dem ein Angreifer wiederholt gegen ein **existierendes** Konto flutet (das Szenario, das die Admin-Fraud-UI abbilden soll); ein reiner Zufalls-Credential-Stuffing-Versuch gegen nicht-existente E-Mails bleibt weiterhin unsichtbar für `risk_events` — diese Grenze ist eine Konsequenz der FK-Constraint, keine willkürliche Vereinfachung, und wird in der Abschlussmeldung an Jan explizit benannt.
- **Schritte:**
  1. `AuthForm.tsx`: `checkLoginGuard()` (Zeilen 52-66) um einen Parameter erweitern und die versuchte E-Mail im Body mitschicken: `fetch('/api/auth/login-guard', { method: 'POST', headers: {...}, body: JSON.stringify({ email: normalizedEmail }) })`.
  2. `login-guard/route.ts`: Body per `zod` parsen (`z.object({ email: z.string().email().optional() })`, Muster: bestehende Zod-Schemas in `signup-suspicion/route.ts:22-24`) — ein fehlendes/ungültiges E-Mail-Feld darf die Rate-Limit-Prüfung selbst nicht beeinträchtigen (fail-open für das Signal, nicht für den bestehenden Block).
  3. Bei `!rate.success` (Budget überschritten, Zeilen 31-39): per `createAdminClient().from('users').select('id').eq('email', email).maybeSingle()` prüfen, ob die E-Mail zu einem Nutzer gehört. Bei Treffer: `recordRiskEventBestEffort({ subjectUserId: data.id, signalType: 'bot_signal_login_flood', severity: 'medium', windowStart: new Date().toISOString().slice(0, 10), evidence: { attemptCount: LOGIN_ATTEMPT_LIMIT } })` **fire-and-forget über `after()`** (Next.js, Muster: `admin/users/route.ts:221-235`) aufrufen, damit der zusätzliche DB-Lookup die 429-Antwortzeit nicht verlängert und kein Timing-Seitenkanal für E-Mail-Enumeration entsteht.
  4. Test in `src/lib/security/__tests__/login-guard-route.test.ts` (bestehende Datei, per `Glob` bestätigt) ergänzen: bei überschrittenem Budget UND einer per Mock auflösbaren E-Mail wird `recordRiskEventBestEffort` mit `signalType: 'bot_signal_login_flood'` und der korrekten `subjectUserId` aufgerufen; bei nicht auflösbarer E-Mail wird es **nicht** aufgerufen, aber der 429 bleibt unverändert bestehen.
- **Erwartetes Verhalten:** Die Admin-Fraud-UI zeigt ab sofort echte `Login-Flood`-Ereignisse für Angriffe gegen bekannte Konten, ohne dass sich das Blockverhalten für den betroffenen Nutzer ändert (weiterhin nur der bestehende 429, kein zusätzlicher Auto-Block durch dieses neue Signal).
- **Abbruchkriterium:** Falls der `users`-Lookup per E-Mail messbare Latenz in den 429-Antwortpfad einbringt (sollte durch `after()` ausgeschlossen sein) — vor Abschluss per Test verifizieren, dass die Route-Antwortzeit unverändert bleibt, unabhängig vom E-Mail-Lookup-Ergebnis.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Empfohlen (neuer Datenbank-Lookup auf einem öffentlichen, unauthentifizierten Endpunkt — Timing-/Enumeration-Risiko muss im Review explizit verneint werden).

### Meilenstein L3: Merge & Abschlussprüfung

- **Ziel:** Sicherstellen, dass L1 und L2 nach den sequenziellen Änderungen an `AuthForm.tsx` widerspruchsfrei zueinander stehen (kein doppelter Preflight-Aufruf, keine widersprüchliche Fehlermeldung), volle DoD grün.
- **Schritte:** `git diff` gegen beide Meilensteine prüfen (insbesondere `AuthForm.tsx`: `checkSignupGuard()` aus L1 und die erweiterte `checkLoginGuard()` aus L2 dürfen sich nicht überschneiden — unterschiedliche Zweige, `mode === 'sign-up'` vs. `mode !== 'sign-up'`), dann volle Verifikations-Suite.
- **Verifizierung:** `npm run typecheck && npm test && npm run lint && npm run build` — alle 0 Fehler/grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (L1/L2 wurden bereits einzeln geprüft).

---

## 5 — Definition of Done

1. Drei oder mehr korrelierte Honeypot-/Timing-Treffer derselben IP innerhalb einer Stunde blockieren neue Signup-Versuche derselben IP für 15 Minuten (L1).
2. Eine einzelne verdächtige Signup-Meldung bleibt weiterhin fail-open — kein Overblocking legitimer Einzelfälle (L1).
3. `bot_signal_login_flood` wird für Login-Flood-Angriffe gegen existierende Konten aufgezeichnet und in der Admin-Fraud-UI sichtbar (L2).
4. Das neue Signal verändert das bestehende Blockverhalten des Login-Guards nicht — weiterhin nur der etablierte 429, kein zusätzlicher Auto-Block (L2).
5. Vollständige Verifikations-Suite grün (L3).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur die zwei in §2 benannten 🔴-Bottlenecks, nicht CAPTCHA/Fingerprinting oder eine Ausweitung auf weitere Signaltypen (§0 Punkt 5).
- [x] Beide Meilensteine ausschließlich LLM-Zuständigkeit — kein Jan-Gate, kein Breaking Change für den Normalfall.
- [x] Recherche vollständig code-belegt (jeder Fund mit Datei:Zeile in §3), ausschließlich per gezieltem `Grep`/`Read` ohne Agent-Fan-out.
- [x] Strukturelle Hürde (FK-Constraint auf `risk_events.subject_user_id`), die in der Ebene-1-Diagnose nicht benannt war, explizit aufgedeckt und die daraus resultierende Scope-Grenze für L2 begründet (§0 Punkt 4) — keine unbelegte Behauptung, dass das Signal „einfach nachgerüstet" werden kann.
- [x] Ehrlichkeits-Check: Baseline (Top 27,0 %) deckt sich mit dem Ebene-1-Schnitt vom 2026-09-17 — keine Beschönigung.
- [x] Fan-out explizit geprüft und **verneint** (§0 Punkt 6) — L1/L2 teilen sich `AuthForm.tsx`, verletzen Fan-out-Kriterium 5(a), laufen daher sequenziell (Zweifel-Fall-Default der SOP).
- [x] Money-Pfad korrekt „Nein" — reine Signup-/Login-Ebene, kein Wallet-Zugriff.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 3 Meilensteine

|  #  | Subkategorie                                | Baseline | Nach Ausführung | Warum                                                                                                                                                                                |
| :-: | ------------------------------------------- | :------: | :-------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | Signup-Honeypot/Timing — Erfassung          | Top 10 % |    Top 10 %     | unverändert                                                                                                                                                                          |
|  2  | Promo-Guess-/Bet-Velocity-/Cost-Cap-Signale | Top 10 % |    Top 10 %     | unverändert                                                                                                                                                                          |
|  3  | Daily-Cost-Cap harter Block                 | Top 10 % |    Top 10 %     | unverändert                                                                                                                                                                          |
|  4  | Eskalationsschranke Signup-Suspicion        | Top 55 % |    Top 15 %     | L1 — neuer, additiver Mechanismus, aber noch ohne Produktionsbewährung, daher nicht Top 10 %                                                                                         |
|  5  | `bot_signal_login_flood`-Producer           | Top 50 % |    Top 15 %     | L2 — schließt die Lücke für Angriffe gegen bekannte Konten; bewusste, FK-bedingte Restlücke für Angriffe gegen unbekannte E-Mails bleibt bestehen (§0 Punkt 4), daher nicht Top 10 % |

**Projizierter Schnitt nach Ausführung:** (10+10+10+15+15)/5 = **Top 12,0 %**.

**Ehrliche Einordnung:** Beide neu geschlossenen Subkategorien bleiben bei Top 15 % statt Top 10 %, aus zwei unterschiedlichen, aber beide ehrlichen Gründen: #4 ist brandneue, unbewährte Enforcement-Logik; #5 hat eine strukturelle, durch die `risk_events`-FK bedingte Restlücke (keine Signalerfassung für Angriffe gegen nicht-existente E-Mails), die nur eine größere Schemaänderung beseitigen könnte — bewusst nicht Teil dieser Runde. **Top 12,0 %** ist der maximal erreichbare, ehrliche Wert für den vollständigen LLM-Scope dieser Runde.

---

## 8 — Verwandte Artefakte

| Bedarf                                                                           | Datei                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ebene-1-Diagnose (Vorstufe dieser Datei)                                         | [`Uebersichtsdateien/p03_bot_automation_detection.md`](Uebersichtsdateien/p03_bot_automation_detection.md)                                                                                                                                                           |
| Signup-Suspicion-Empfänger (erweitert in L1)                                     | [`src/app/api/auth/signup-suspicion/route.ts`](../../../../src/app/api/auth/signup-suspicion/route.ts)                                                                                                                                                               |
| Login-Guard-Preflight (erweitert in L2, Referenzmuster für die neue Route in L1) | [`src/app/api/auth/login-guard/route.ts`](../../../../src/app/api/auth/login-guard/route.ts)                                                                                                                                                                         |
| Auth-Formular (in L1/L2 sequenziell erweitert)                                   | [`src/components/auth/AuthForm.tsx`](../../../../src/components/auth/AuthForm.tsx)                                                                                                                                                                                   |
| Risk-Signal-Typen & Admin-Verdrahtung (unverändert, nur neuer Producer in L2)    | [`src/lib/casino/risk-signals.ts`](../../../../src/lib/casino/risk-signals.ts), [`src/app/api/admin/fraud/route.ts`](../../../../src/app/api/admin/fraud/route.ts), [`src/app/admin/fraud/FraudPageClient.tsx`](../../../../src/app/admin/fraud/FraudPageClient.tsx) |
| Risk-Event-Aufzeichnung (genutzt in L1-Kontext, aufgerufen in L2)                | [`src/lib/casino/risk-event-store.ts`](../../../../src/lib/casino/risk-event-store.ts)                                                                                                                                                                               |
| FK-Constraint-Quelle (Begründung der L2-Designentscheidung)                      | [`supabase/migrations/029_risk_events.sql`](../../../../supabase/migrations/029_risk_events.sql)                                                                                                                                                                     |
| Rate-Limit-Infrastruktur (wiederverwendet in L1)                                 | [`src/lib/security/request-security.ts`](../../../../src/lib/security/request-security.ts)                                                                                                                                                                           |
| Bestehender Test für die Login-Guard-Route (erweitert in L2)                     | [`src/lib/security/__tests__/login-guard-route.test.ts`](../../../../src/lib/security/__tests__/login-guard-route.test.ts)                                                                                                                                           |
| Übersicht (alle 10 Säulen)                                                       | [`00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md`](00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md)                                                                                                                                                                 |
