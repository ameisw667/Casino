# 01 — Per-Route Rate-Limit-Konfiguration (Runde 2 — Ziel Top 5–15 %)

> **Status:** 🔴 Geplant · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit, kein Jan-Gate) · **Scope:** `src/lib/security/rate-limit-config.ts`, die Money-Pfad- und money-adjacenten Admin-Routen, die daraus importieren oder importieren sollten, `src/lib/security/__tests__/rate-limit-config.test.ts`, ein neuer struktureller Guard-Test, `xx_docs/08_api_backend_context.md` §3; **nicht** im Scope: Zentralisierung der übrigen 37 raw-literal Scopes über alle 48 API-Routen (siehe §0 Punkt 5, bewusst YAGNI), Distributed-/Edge-Konsistenz-Vollständigkeitsprüfung selbst (Säule 8, eigene Datei), Identifier-/IP-Extraktion (Säule 2, eigene Datei).
> **Money-Pfad:** Teilweise (L1/L3/L4 berühren Money- bzw. money-adjacente Routen, L2/L5 nicht) · **Security-Review:** Empfohlen bei L1, L3, L4 (money-adjacente Code-/Test-Änderungen)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Diese Säule hat bereits eine archivierte Runde-1-Planungsdatei ([`docs/archive/06_8_per_route_rate_limit_config_plan.md`](../../../../docs/archive/06_8_per_route_rate_limit_config_plan.md), executed 2026-09-06, Top 41 % → Top 21 %). Runde 1 zentralisierte die vier Kern-Money-Pfad-Schwellenwerte (`casino-bet`, `blackjack-action`, `casino-bet-crash-mp`, `wallet-redeem`) als benannte Konstanten in `src/lib/security/rate-limit-config.ts` und pinnte sie per Test. Der dort dokumentierte Restpunkt ("Restschuld fast nur C3, Eigentum von `06_6` L5") war reine Doku-Drift und ist Sache von Säule 8 — **hier neu recherchiert und bewusst nicht Teil dieser Runde.**
2. **Frische, code-belegte Recherche (2026-09-12, `casino-code-explorer` + `security-reviewer`, unabhängig durchgeführt)** zeigt: Die vier Kern-Money-Konstanten sind unverändert solide (Top 10 %). Aber Runde 1 hat nur diese vier Scopes zentralisiert — seither ist eine **neue, money-adjacente Route** entstanden, die denselben Disziplinmangel wiederholt, den Runde 1 eigentlich beseitigen wollte: `admin/promo-codes/[code]/reverse` (echte Wallet-Rückbuchung, aus der 06_10-Runde) nutzt weiterhin einen rohen `10, 60`-Literal statt einer Konstante — geteilt mit der ebenfalls nie zentralisierten `admin-promo-write`-Route.
3. **Diese Datei ist reine Planung, keine Ausführung.** Die Umsetzung erfolgt in einer separaten Konversation/Session.
4. **Vier echte, unterschiedlich gewichtete Funde** (Details in §3): (a) money-adjacente Admin-Promo-Routen ohne Konstante — der schwerste Fund, weil er echtes Geld bewegt; (b) zwei bereits zentralisierte, aber nicht wiring-getestete Konstanten (`guide-persona`, `telegram-webhook`); (c) ein von `security-reviewer` unabhängig identifizierter, ungetesteter Sliding-Window-Grenzfall (Upstash-Zwei-Fenster-Approximation erlaubt bei exaktem Timing bis zu ~2×Limit über eine rollierende Zeitspanne — kein Bug, aber ein unverifiziertes Verhalten); (d) es existiert **kein struktureller Mechanismus**, der eine künftige Money-Route ohne benannte Konstante verhindert — Runde 1 hat Disziplin hergestellt, aber nicht erzwungen.
5. **Bewusst außerhalb dieser Runde:** Von den insgesamt 48 rate-limitierten Scopes im Repo nutzen 37 (77 %) weiterhin rohe Literale — u. a. `notifications-write`, `admin-analytics-read`, `chat-post`. Das sind ausschließlich Low-Risk-Reads oder nicht-monetäre Writes; deren Zentralisierung wäre reine Konsistenzkosmetik ohne Sicherheits- oder Korrektheitsgewinn (YAGNI). Diese Runde vertieft ausschließlich den Money-/money-adjacenten Kern.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                    | Scope (Dateien)                                                                                                                                                         | Ausführung                           | Status     | Zuständigkeit | Verifikation                                                                                                                       |
| ------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| L1     | Money-adjacente Admin-Promo-Konstante zentralisieren           | `src/lib/security/rate-limit-config.ts`, `src/app/api/admin/promo-codes/route.ts`, `src/app/api/admin/promo-codes/[code]/reverse/route.ts`, `rate-limit-config.test.ts` | Sequenziell                          | 🔴 Geplant | LLM           | Neue Konstante importiert an beiden Call-Sites, Layer-1-Pin-Test + (N+1)-Integrationstest grün                                     |
| L2     | Wiring-Test für `guide-persona`/`telegram-webhook` ergänzen    | `rate-limit-config.test.ts`                                                                                                                                             | Sequenziell (nach L1, gleiche Datei) | 🔴 Geplant | LLM           | Beide Scopes haben jetzt einen (N+1)-ten-Call-429-Integrationstest                                                                 |
| L3     | Sliding-Window-Grenzfall-Regressionstest                       | `rate-limit-config.test.ts`                                                                                                                                             | Sequenziell (nach L2, gleiche Datei) | 🔴 Geplant | LLM           | Test dokumentiert und verifiziert das reale Zwei-Fenster-Verhalten für die 5 Money-(-adjacenten) Scopes                            |
| L4     | Struktureller Guard: Money-Path-Scopes dürfen nie roh sein     | `rate-limit-config.ts` (neuer Export `MONEY_PATH_SCOPES`), neue Datei `src/lib/security/__tests__/rate-limit-money-path-constant-guard.test.ts`                         | 🔀 Fan-out-Cluster 1                 | 🔴 Geplant | LLM           | Test schlägt fehl, wenn einer der 5 Money-(-adjacenten) Scope-Namen je mit einem rohen Literal statt der Konstante aufgerufen wird |
| L5     | Doku-Drift in `xx_docs/08_api_backend_context.md` §3 schließen | `xx_docs/08_api_backend_context.md`                                                                                                                                     | 🔀 Fan-out-Cluster 1                 | 🔴 Geplant | LLM           | Alle 59 Routen (laut `rate-limit-route-completeness.test.ts`) sind in §3 tabellarisch erfasst, inkl. der 6 fehlenden               |
| L6     | Merge & Abschlussprüfung                                       | —                                                                                                                                                                       | Sequenziell (nach Cluster 1)         | 🔴 Geplant | LLM           | 5-Stufen-DoD grün, L4 und L5 widerspruchsfrei zueinander                                                                           |

L4 und L5 laufen als zwei gleichzeitige `Agent`-Aufrufe in einer Antwort (kein gemeinsamer Schreibbereich, keine gegenseitige Abhängigkeit — beide hängen nur von L1 ab, nicht voneinander). L6 startet erst, wenn beide fertig sind, und ist immer Sequenziell.

**Warum kein Jan-Gate:** Alle 6 Meilensteine sind additive Config-/Test-/Doku-Ergänzungen ohne Breaking-Change-Risiko — die vier bestehenden Money-Pfad-Schwellenwerte selbst werden nicht verändert, nur die Disziplin um sie herum verstärkt.

---

## 2 — Per-Route Rate-Limit-Konfiguration in Subkategorien: Neubewertung (2026-09-12, Baseline für diese Runde)

|  #  | Subkategorie                                                           | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                             |
| :-: | ---------------------------------------------------------------------- | :---------------: | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Money-Pfad-Kernkonstanten (`bet`/`blackjack`/`crash-mp`/`redeem-code`) |     Top 10 %      |   🟢   | Unverändert solide — alle 4 Werte code-verifiziert identisch zur Doku (`rate-limit-config.ts:1-45`), Layer-1-Pin-Tests grün                                            |
|  2  | Admin-Fraud-Scan: Auth/Admin-Check vor Rate-Limit                      |     Top 10 %      |   🟢   | `scan/route.ts:17-39` — Rate-Limit ist zusätzliche Drossel, nicht primäre Zugriffskontrolle. Bereits korrekt.                                                          |
|  3  | Schutz gegen IP-/Multi-Device-Multiplikation                           |     Top 10 %      |   🟢   | `getClientIdentifier()` liefert bei eingeloggten Nutzern immer `user:<id>` (`request-security.ts:144-145`) — kein Multiplikations-Vektor über Devices/Sessions         |
|  4  | Prod-/Dev-Verhaltenskonsistenz                                         |     Top 15 %      |   🟢   | Fail-closed korrekt in Prod ohne Upstash; ein dokumentiertes MEDIUM-Trade-off (UA-Fallback-Bucket) bleibt bewusst bestehen, kein neuer Fund                            |
|  5  | **Money-adjacente Admin-Promo-Routen ohne Konstante**                  |     Top 40 %      |   🟠   | `admin/promo-codes/route.ts:130-134` + `[code]/reverse/route.ts:72-76` — beide roher `10,60`-Literal, `reverse` ist eine echte Wallet-Rückbuchung                      |
|  6  | **Wiring-Testabdeckung `guide-persona`/`telegram-webhook`**            |     Top 35 %      |   🟡   | Beide Konstanten sind Layer-1-wertgepinnt, aber keine (N+1)-te-Call-429-Integration — Wiring-Regression bliebe unentdeckt (`rate-limit-config.test.ts:69-90`)          |
|  7  | **Sliding-Window-Grenzfall-Testabdeckung**                             |     Top 40 %      |   🟠   | Upstash-Zwei-Fenster-Approximation erlaubt bei exaktem Boundary-Timing bis ~2×Limit über ein rollierendes ~2×Window — kein Test verifiziert dieses reale Verhalten     |
|  8  | **Struktureller Guard gegen künftige unbenannte Money-Schwellenwerte** |     Top 60 %      |   🔴   | 0 Mechanismus — weder Lint noch Test verhindert, dass eine neue/geänderte Money-Route einen rohen Literal statt der Konstante bekommt                                  |
|  9  | **Doku-Vollständigkeit §3-Routentabellen**                             |     Top 45 %      |   🟠   | 53 von real 59 Routen dokumentiert (`rate-limit-route-completeness.test.ts:44` vs. manuelle §3-Zählung) — 6 fehlen, darunter die money-adjacente `promo-reverse`-Route |

**Rechnerischer Schnitt (Baseline dieser Runde, 9 Subkategorien):** (10+10+10+15+40+35+40+60+45)/9 = **Top 29,4 %** — schlechter als der Runde-1-Austrittswert (Top 21 %), weil Runde 1 nur die 4 Kernkonstanten selbst bewertete, nicht die Testtiefe, den strukturellen Schutz und die money-adjacenten Nachbarrouten. Dieselbe ehrliche Dynamik wie bei jeder vertieften Aufschlüsselung in diesem Repo (vgl. Kategorie 04/Säule 1 in `T_SECURITY_HARDENING/01_csp_script_hardening.md`).

---

## 3 — Verifizierter Ist-Stand (frische Recherche, 2026-09-12)

**Money-Pfad-Kernkonstanten** (`src/lib/security/rate-limit-config.ts:1-45`): `CASINO_BET_LIMIT`/`_WINDOW_SECONDS` (30/10s, Scope `casino-bet`, `bet/route.ts:109-111`), `CASINO_BET_CRASH_MP_LIMIT`/`_WINDOW_SECONDS` (30/10s, Scope `casino-bet-crash-mp`, `bet-crash-multiplayer/route.ts:102-104`), `BLACKJACK_ACTION_LIMIT`/`_WINDOW_SECONDS` (20/10s, Scope `blackjack-action`, `blackjack/route.ts:125-127`), `WALLET_REDEEM_LIMIT`/`_WINDOW_SECONDS` (10/60s, Scope `wallet-redeem`, `redeem-code/route.ts:86-88`). Alle vier stimmen exakt mit `xx_docs/08_api_backend_context.md` §3.1 (Zeilen 57-59, 65) überein. Zusätzlich bereits zentralisiert, aber nicht Money-Pfad: `GUIDE_PERSONA_LIMIT`/`_WINDOW_SECONDS` (20/60s) und `TELEGRAM_WEBHOOK_LIMIT`/`_WINDOW_SECONDS` (60/60s) — beide aus der `06_6`-Runde (Distributed-/Edge-Konsistenz, Säule 8).

**Money-adjacenter Fund (neu, nicht in Runde 1 bekannt):** `src/app/api/admin/promo-codes/[code]/reverse/route.ts:72-76` ruft `enforceRateLimit(getClientIdentifier(request, user.id), 'admin-promo-write', 10, 60)` mit rohem Literal auf — dieselbe Scope-Zeichenkette wie `src/app/api/admin/promo-codes/route.ts:130-134` (ebenfalls roher `10,60`-Literal). Die `reverse`-Route ruft `WalletService.reversePromoCode()` auf (`route.ts:103-109`) — eine echte, RPC-gestützte Wallet-Rückbuchung (Migration `066_promo_reversal_and_expiry.sql`). Beide Admin-only (K4-Gate laut `CLAUDE.md`/`xx_docs/08_api_backend_context.md:179`), aber die Rate-Limit-Konfiguration selbst hat keine der Absicherungen, die Runde 1 für die vier Spieler-Money-Routen etabliert hat.

**Testlücke `guide-persona`/`telegram-webhook` bestätigt:** `rate-limit-config.test.ts:37-66` pinnt alle 6 Konstantenwerte (inkl. dieser beiden). Der `(N+1)`-te-Call-429-Integrationstest (`:69-90`) deckt aber nur `casino-bet`, `blackjack-action`, `casino-bet-crash-mp`, `wallet-redeem` ab — `guide-persona` und `telegram-webhook` fehlen in diesem `it.each`-Block vollständig.

**Sliding-Window-Grenzfall (neu, `security-reviewer`-Fund):** Upstash implementiert kein echtes Sliding-Log, sondern ein gewichtetes Zwei-Fenster-Approximat (`@upstash/ratelimit/dist/index.mjs:206-248`): `requestsInPreviousWindow = floor((1 - now%window/window) * previousCount)`. Bei exaktem Boundary-Timing sind über eine rollierende Zeitspanne von knapp unter `2×window` theoretisch bis zu `2×limit` erfolgreiche Requests möglich, ohne dass dazwischen ein 429 auftritt — für `casino-bet` heißt das bis zu ~60 Bets über ein ~18-20s-Fenster statt garantiert 30/10s. Kein Beleg für reale Ausnutzung; die Wallet selbst ist durch `pg_advisory_xact_lock` serialisiert (`wallet.ts:728`), sodass daraus keine Balance-Race-Condition entsteht — der Schaden bliebe auf "mehr Wetten als vorgesehen pro Zeiteinheit" begrenzt. Kein Test verifiziert aktuell dieses reale (statt des naiv angenommenen strikten Pro-Fenster-) Verhalten.

**Struktureller Guard bestätigt fehlend:** `eslint.config.mjs` hat 0 Treffer für `rate-limit`/`rateLimit`/`enforceRateLimit`. `rate-limit-route-completeness.test.ts` prüft nur, DASS eine Route den Limiter aufruft, nicht mit welchem Schwellenwert — ein `enforceRateLimit(id, 'casino-bet', 100000, 1)`-Typo würde diesen Test weiterhin bestehen. Einziger Schutz ist heute die K4-Jan-Freigabepflicht (organisatorisch, nicht automatisiert).

**Doku-Drift bestätigt:** `rate-limit-route-completeness.test.ts:44-45` pinnt 59 Routen gesamt / 42 instrumentiert als Ground Truth (verifiziert durch `Glob src/app/api/**/route.ts` → 59 Dateien). Manuelle Zählung der §3-Tabellen in `xx_docs/08_api_backend_context.md` ergibt nur 53 dokumentierte Routen. Fehlend: `user/self-exclusion` (§3.2), `user/login-history` (§3.2), `admin/promo-codes/[code]/reverse` (§3.7 — die money-adjacente Route aus diesem Plan), `internal/csp-report` (§3.8), `docs`, `openapi.json` (in keiner §3-Tabelle, nur als Exemption in `rate-limit-route-inventory.ts:58-59` bekannt).

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: Money-adjacente Admin-Promo-Konstante zentralisieren

- **Ziel:** Die in §2 #5 benannte Lücke schließen — dieselbe Disziplin, die Runde 1 für die vier Spieler-Money-Routen etabliert hat, jetzt auch für die money-adjacente Admin-Promo-Route.
- **Schritte:**
  1. In `src/lib/security/rate-limit-config.ts` zwei neue Konstanten ergänzen: `ADMIN_PROMO_WRITE_LIMIT = 10`, `ADMIN_PROMO_WRITE_WINDOW_SECONDS = 60` (Werte unverändert aus dem bisherigen Literal — keine Verhaltensänderung, nur Zentralisierung), mit Kommentar zur Herkunft (identisch zum bestehenden Muster der vier Money-Konstanten).
  2. Beide Call-Sites (`admin/promo-codes/route.ts:130-134`, `admin/promo-codes/[code]/reverse/route.ts:72-76`) auf den Import umstellen, rohe Literale entfernen.
  3. In `rate-limit-config.test.ts`: einen Layer-1-Pin-Test für die neue Konstante ergänzen (Muster: bestehende `it()`-Blöcke, Zeilen 37-66) sowie einen `(N+1)`-ten-Call-429-Integrationstest für `admin-promo-write` (Muster: bestehender `it.each`-Block, Zeilen 69-90) — mit gemocktem Admin-Auth-Kontext, analog zum bestehenden Testaufbau für Admin-Routen in `meta-security.test.ts`.
- **Erwartetes Verhalten:** Identisches Laufzeitverhalten (gleiche Werte), aber beide Call-Sites importieren statt Literale zu wiederholen; neue Tests grün.
- **Abbruchkriterium:** Falls sich herausstellt, dass `admin/promo-codes/route.ts` und `.../reverse/route.ts` künftig unterschiedliche Schwellenwerte brauchen sollen (fachliche Entscheidung, nicht Teil dieser Runde) — dann die geteilte Konstante in zwei separate Konstanten aufteilen, nicht künstlich zusammenzwingen.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Ja (money-adjacent, Werte unverändert). **Security-Review:** Empfohlen (Änderung an einer Wallet-Rückbuchungs-Route, auch wenn nur Refactoring).

### Meilenstein L2: Wiring-Test für `guide-persona`/`telegram-webhook` ergänzen

- **Ziel:** Die in §2 #6 benannte Lücke schließen.
- **Schritte:** `rate-limit-config.test.ts` — den bestehenden `it.each`-Integrationstest-Block (Zeilen 69-90) um `guide-persona` und `telegram-webhook` erweitern, mit den jeweils passenden Mock-Identifiern (auth-first bzw. secret-first, siehe `request-security.ts` Resolve-Muster aus der `06_6`-Runde).
- **Erwartetes Verhalten:** Beide Scopes haben jetzt einen echten `(N+1)`-ten-Call-429-Test, nicht nur eine Wertprüfung.
- **Abbruchkriterium:** Falls der Mock-Aufbau für `secret-first`-Resolve (Telegram) übermäßig komplex wird (>30 Zeilen Setup), stattdessen einen dedizierten, kleineren Test in einer neuen Datei anlegen statt den bestehenden Block aufzublähen.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### Meilenstein L3: Sliding-Window-Grenzfall-Regressionstest

- **Ziel:** Die in §2 #7 benannte Lücke schließen — das reale Upstash-Zwei-Fenster-Verhalten dokumentieren und regressionssichern, nicht die Bibliothek ändern.
- **Schritte:**
  1. Neuer Test in `rate-limit-config.test.ts`: für `CASINO_BET_LIMIT` (repräsentativ für alle vier Money-Scopes) `limit` Requests kurz vor Fensterende feuern, dann nach Fensterwechsel weitere Requests bis zum Scheitern — den kumulierten Erfolgs-Count erfassen und gegen eine dokumentierte Obergrenze (`2 × limit`, mit Kommentar zur Herleitung aus dem Upstash-Approximationsverhalten) assertieren.
  2. Kommentarblock über dem Test, der explizit erklärt: Das ist ein akzeptiertes Bibliotheksverhalten (Upstash-Zwei-Fenster-Approximation), kein Bug — der Test verhindert, dass sich dieses Verhalten unbemerkt verschlechtert (z. B. durch ein Library-Update auf eine laxere Approximation).
- **Erwartetes Verhalten:** Test ist grün gegen das aktuelle Verhalten; würde rot werden, wenn ein künftiges Upstash-Update den Burst-Spielraum vergrößert.
- **Abbruchkriterium:** Falls der reale gemessene Wert signifikant von der theoretisch hergeleiteten `2×limit`-Grenze abweicht (z. B. weil der Sync-Mock aus L0/L1 der Vorrunde das reale Zeitverhalten nicht exakt abbildet) — die dokumentierte Grenze auf den empirisch gemessenen Wert korrigieren, nicht den Test künstlich grün biegen.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Ja (testet Money-Pfad-Scope, ändert aber nur Testcode). **Security-Review:** Empfohlen (Verifikation, dass die angenommene Grenze korrekt hergeleitet ist).

### Meilenstein L4: Struktureller Guard — Money-Path-Scopes dürfen nie roh sein

- **Ziel:** Die in §2 #8 benannte Lücke schließen — aus der bisher rein disziplinarischen Konvention (Runde 1) einen automatisiert erzwungenen Invarianten machen, aber **nur** für die 5 Money-(-adjacenten) Scopes, nicht für alle 48 (siehe §0 Punkt 5, Nicht-Scope).
- **Schritte:**
  1. In `rate-limit-config.ts` einen neuen Export `MONEY_PATH_SCOPES: readonly string[]` ergänzen — die 5 Scope-Namen (`casino-bet`, `casino-bet-crash-mp`, `blackjack-action`, `wallet-redeem`, `admin-promo-write` nach L1) als Single Source of Truth.
  2. Neue Datei `src/lib/security/__tests__/rate-limit-money-path-constant-guard.test.ts`: greift auf dasselbe Datei-Scan-Muster wie `rate-limit-route-completeness.test.ts` zurück (Datei-Liste unter `src/app/api/**/route.ts`, Regex/AST-Suche nach `enforceRateLimit(`/`withRateLimit(`-Aufrufen). Für jeden Fund, dessen Scope-Argument einem Eintrag aus `MONEY_PATH_SCOPES` entspricht: assertieren, dass das Limit-/Window-Argument ein Identifier ist (aus `rate-limit-config.ts` importiert), nicht ein numerisches Literal.
  3. Negativkontrolltest: ein absichtlich falsches Fixture (Money-Scope mit rohem Literal) muss den Guard zum Scheitern bringen — Test-des-Tests, Muster aus `red-team-catalog-coverage.test.ts` (Säule 6, Runde 1).
- **Erwartetes Verhalten:** Jede künftige Money-(-adjacente) Route, die versehentlich einen rohen Literal statt der Konstante nutzt, lässt diesen Test rot werden — unabhängig davon, ob sie neu ist oder eine bestehende Konstante wieder durch einen Literal ersetzt.
- **Abbruchkriterium:** Falls die Regex/AST-Erkennung bei generischer Call-Syntax (`enforceRateLimit<T>(...)` oder destrukturierte Argumente) unzuverlässig wird — das bereits gelöste Muster aus `rate-limit-route-completeness.test.ts` (die dort bereits generische Call-Syntax korrekt erkennt, laut `06_6`-Execution-Notiz) direkt übernehmen statt neu zu erfinden.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Ja. **Security-Review:** Empfohlen (neue CI-relevante Testlogik mit Sicherheitsfunktion).

### Meilenstein L5: Doku-Drift in `xx_docs/08_api_backend_context.md` §3 schließen

- **Ziel:** Die in §2 #9 benannte Lücke schließen.
- **Schritte:** Die 6 in §3 identifizierten fehlenden Routen (`user/self-exclusion`, `user/login-history`, `admin/promo-codes/[code]/reverse`, `internal/csp-report`, `docs`, `openapi.json`) in die jeweils passenden §3-Unterabschnitte eintragen (§3.2, §3.7, §3.8, bzw. einen neuen §3.x für die beiden Meta-Routen falls keine passende Tabelle existiert). Am Ende von §3 die Gesamtzahl von 53 auf 59 korrigieren und explizit auf `rate-limit-route-completeness.test.ts:44` als Ground-Truth-Quelle verweisen (Muster: bestehende Referenzen auf denselben Test in §2 der `06_6`-Execution-Notiz).
- **Erwartetes Verhalten:** Eine manuelle Zählung der §3-Tabellen ergibt exakt 59, deckungsgleich mit dem Completeness-Test.
- **Abbruchkriterium:** Keines — reine additive Doku-Korrektur ohne Fehlerrisiko.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### Meilenstein L6: Merge & Abschlussprüfung

- **Ziel:** Sicherstellen, dass L4 (neuer Guard-Test + neuer Export) und L5 (Doku) nach dem parallelen Fan-out widerspruchsfrei zueinander stehen, und die volle 5-Stufen-DoD grün ist.
- **Schritte:** `git diff` gegen beide Fan-out-Ergebnisse prüfen (kein doppelter Export, keine widersprüchliche Routenzahl zwischen L4s implizitem Scope und L5s expliziter Tabelle), dann die volle Verifikations-Suite laufen lassen.
- **Verifizierung:** `npm run typecheck && npm test && npm run lint && npm run build` — alle 0 Fehler/grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein (reine Prüfung). **Security-Review:** Nein (die einzelnen Meilensteine wurden bereits einzeln geprüft).

---

## 5 — Definition of Done

1. Die money-adjacente Admin-Promo-Rückbuchungsroute nutzt eine benannte, getestete Konstante statt eines rohen Literals (L1).
2. `guide-persona` und `telegram-webhook` haben einen echten Wiring-Integrationstest, nicht nur eine Wertprüfung (L2).
3. Das reale Sliding-Window-Grenzverhalten der Money-Pfad-Scopes ist dokumentiert und regressionsgeschützt (L3).
4. Ein struktureller Test verhindert künftig, dass einer der 5 Money-(-adjacenten) Scopes unbemerkt auf einen rohen Literal zurückfällt (L4).
5. Die §3-Routentabellen in `xx_docs/08_api_backend_context.md` decken alle 59 real existierenden Routen ab (L5).
6. Vollständige Verifikations-Suite grün (L6).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur Money-Pfad + money-adjacente Admin-Promo-Route, nicht die übrigen 37 raw-literal Scopes (bewusstes YAGNI, §0 Punkt 5).
- [x] Alle 6 Meilensteine ausschließlich LLM-Zuständigkeit — kein Jan-Gate, keine Breaking Changes, kein neues Secret.
- [x] Recherche durch zwei unabhängige Perspektiven fundiert (`casino-code-explorer` für Code-Bestand, `security-reviewer` für Angreiferperspektive) — nicht aus dem Gedächtnis behauptet, jeder Fund mit Datei:Zeile belegt (§3).
- [x] Ehrlichkeits-Check: Die Baseline dieser Runde (Top 29,4 %) ist schlechter als der Runde-1-Austrittswert (Top 21 %), weil tiefere Recherche echte, bislang unbewertete Lücken fand (Testtiefe, struktureller Guard, money-adjacente Nachbarroute) — nicht einseitig beschönigt, dieselbe Dynamik wie bei jeder Aufschlüsselungs-Vertiefung in diesem Repo.
- [x] Fan-out-Kriterien für L4/L5 geprüft: kein gemeinsamer Schreibbereich, keine gegenseitige Abhängigkeit, unabhängiges Fehlschlag-Risiko — beide hängen nur von L1 ab.
- [x] Money-Pfad korrekt „Teilweise" — die vier Kern-Money-Werte selbst werden nicht verändert, nur die Disziplin und Testtiefe um sie und die money-adjacente Nachbarroute herum.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 6 Meilensteine

|  #  | Subkategorie                                   | Baseline | Nach Ausführung | Warum                                                                  |
| :-: | ---------------------------------------------- | :------: | :-------------: | ---------------------------------------------------------------------- |
|  1  | Money-Pfad-Kernkonstanten                      | Top 10 % |    Top 10 %     | unverändert                                                            |
|  2  | Admin-Fraud-Scan Auth-Reihenfolge              | Top 10 % |    Top 10 %     | unverändert                                                            |
|  3  | IP-/Multi-Device-Schutz                        | Top 10 % |    Top 10 %     | unverändert                                                            |
|  4  | Prod-/Dev-Konsistenz                           | Top 15 % |    Top 15 %     | unverändert (dokumentiertes MEDIUM-Trade-off bleibt bewusst bestehen)  |
|  5  | Money-adjacente Admin-Promo-Konstante          | Top 40 % |    Top 10 %     | L1                                                                     |
|  6  | Wiring-Test `guide-persona`/`telegram-webhook` | Top 35 % |    Top 10 %     | L2                                                                     |
|  7  | Sliding-Window-Grenzfall-Test                  | Top 40 % |    Top 15 %     | L3 — reales Bibliotheksverhalten dokumentiert, nicht eliminiert        |
|  8  | Struktureller Guard gegen rohe Money-Literale  | Top 60 % |    Top 15 %     | L4 — neuer Test, noch ohne langjährige Bewährung, daher nicht Top 10 % |
|  9  | Doku-Vollständigkeit §3                        | Top 45 % |    Top 10 %     | L5                                                                     |

**Projizierter Schnitt nach Ausführung:** (10+10+10+15+10+10+15+15+10)/9 = **Top 11,7 %** (gerundet **Top 12 %**).

**Ehrliche Einordnung:** #7 (Sliding-Window) und #8 (struktureller Guard) bleiben bei Top 15 % statt Top 10 %, weil beide entweder ein akzeptiertes Bibliotheksverhalten dokumentieren (nicht eliminieren) oder brandneue, noch unbewährte Testinfrastruktur sind — beides ehrlich, kein Planungsfehler. **Top 12 %** ist der maximal erreichbare, ehrliche Wert für den vollständigen LLM-Scope dieser Runde, ohne die bewusst ausgeklammerten 37 Low-Risk-Scopes anzufassen.

---

## 8 — Verwandte Artefakte

| Bedarf                                                         | Datei                                                                                                                                                                                                                                   |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei                              | [`docs/archive/06_8_per_route_rate_limit_config_plan.md`](../../../../docs/archive/06_8_per_route_rate_limit_config_plan.md)                                                                                                            |
| Konstanten-Quelle (wird in L1/L4 geändert)                     | [`src/lib/security/rate-limit-config.ts`](../../../../src/lib/security/rate-limit-config.ts)                                                                                                                                            |
| Bestehender Test (wird in L1/L2/L3 erweitert)                  | [`src/lib/security/__tests__/rate-limit-config.test.ts`](../../../../src/lib/security/__tests__/rate-limit-config.test.ts)                                                                                                              |
| Referenzmuster für L4 (Datei-Scan-Guard)                       | [`src/lib/security/rate-limit-route-inventory.ts`](../../../../src/lib/security/rate-limit-route-inventory.ts), [`rate-limit-route-completeness.test.ts`](../../../../src/lib/security/__tests__/rate-limit-route-completeness.test.ts) |
| Money-adjacente Route (wird in L1 geändert)                    | [`src/app/api/admin/promo-codes/[code]/reverse/route.ts`](../../../../src/app/api/admin/promo-codes/%5Bcode%5D/reverse/route.ts)                                                                                                        |
| Doku-Ziel für L5                                               | [`xx_docs/08_api_backend_context.md`](../../../../xx_docs/08_api_backend_context.md)                                                                                                                                                    |
| Distributed-/Edge-Konsistenz (verzahnte, aber getrennte Säule) | [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md) (#8)                                                                                                                                                     |
| Übersicht (alle 10 Säulen)                                     | [`00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md`](00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md)                                                                                                                                    |
