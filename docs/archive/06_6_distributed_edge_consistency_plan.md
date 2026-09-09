# 06_6 — Distributed-/Edge-Konsistenz: Umsetzungsplan

> **Status:** Executed (archiviert) · **Stand:** 2026-09-04 (Execution 2026-09-06) · **Owner:** LLM · **Scope:** Unterkategorie #8 aus [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md) (Top 42 %). Alle Zuständigkeiten liegen beim LLM; kein Meilenstein ist auf eine Jan-Entscheidung während der Ausführung angewiesen. Diese Datei ist so geschrieben, dass eine komplett neue, kontextlose LLM-Konversation sie ohne Rückfragen ausführen kann. Ausführungsprotokoll: Abschnitt 8.
> **Quellcode-Basis:** Alle Befunde unten wurden am 2026-09-04 durch einen read-only `casino-code-explorer`-Lauf gegen den tatsächlichen Code verifiziert. **Wichtigster Neufund dieser Runde:** Die theoretische Befürchtung „eine vergessene Route bleibt ungeschützt" ist keine Theorie mehr — sie wurde konkret bestätigt (siehe M-Segment E2 unten, `guide-persona`-Route).

## 0 — Kontext für die ausführende Session

Die bisherige Dokumentation (`docs/observability/05_ratelimit_failclosed_alerting.md`, „37 Routen") und (`xx_docs/08_api_backend_context.md:3`, „47 Routen") ist **beide veraltet**: Die tatsächliche Route-Anzahl ist **56** (`find src/app/api -name route.ts`). Diese Diskrepanz ist selbst ein Symptom des Kategorie-Problems: Ohne zentralen Vollständigkeits-Check driftet auch die Dokumentation unbemerkt auseinander.

## 1 — Segmentierung: 10 Sub-Unterkategorien

| #   | Sub-Unterkategorie                                        | Niveau          | Status quo (verifiziert)                                                                                                                                                                                                                                                                                       | Beleg                                                                                                   |
| :-- | :-------------------------------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| E1  | Middleware-Matcher-Abdeckung                              | **Top 20 %** 🟡 | `config.matcher` in `src/proxy.ts:230-235` deckt praktisch jede `/api/**`-Route ab (schließt nur `_next`/statische Assets aus) — die Middleware LÄUFT auf fast allem, tut nur nichts für Rate-Limiting.                                                                                                        | `proxy.ts:230-235`                                                                                      |
| E4  | Statische Docs-Routen ohne Rate-Limit                     | **Top 30 %** 🟡 | `/api/docs`, `/api/openapi.json` sind `dynamic = 'force-static'` (gecacht, geringes Risiko), aber ungetestet/undokumentiert bezüglich Rate-Limit-Bedarf.                                                                                                                                                       | `src/app/api/docs/route.ts:3`, `src/app/api/openapi.json/route.ts:4`                                    |
| E9  | Doku-Drift (Routenzahl + Telegram-Webhook-Fehlbehauptung) | **Top 45 %** 🟠 | `xx_docs/08_api_backend_context.md:3` nennt 47 statt tatsächlich 56 Routen; `:90` behauptet fälschlich, `telegram/webhook` sei mit „120/min" rate-limitiert — Code zeigt 0 Rate-Limit-Aufrufe dort.                                                                                                            | `xx_docs/08_api_backend_context.md:3,90` vs. Code                                                       |
| E10 | Architektonisch dezentral trotz Matcher-Abdeckung         | **Top 50 %** 🟠 | Middleware könnte technisch zentral prüfen (läuft auf jeder Route), tut es aber nicht — jede Route bleibt für ihren eigenen Schutz verantwortlich.                                                                                                                                                             | `proxy.ts` (kein `enforceRateLimit`-Aufruf im gesamten Middleware-Code)                                 |
| E7  | Edge-Runtime-Kompatibilität nie bewiesen                  | **Top 55 %** 🟠 | 0 von 56 Routen deklarieren `export const runtime = 'edge'` — alle laufen auf Node. `enforceRateLimit()` nutzt nur HTTP-basierte Upstash-Clients (kein Node-only-API), strukturell vermutlich Edge-tauglich, aber **nie in der Praxis bewiesen**.                                                              | Grep `export const runtime` über `src/app/api/` — 0 Treffer                                             |
| E8  | Vercel-natives Firewall/Edge-Config ungenutzt             | **Top 60 %** 🟠 | Kein `vercel.json`, keine Nutzung von Vercels eigenem Rate-Limiting/Firewall als Alternative zu Custom-Code — eine mögliche zusätzliche Schutzebene bleibt ungenutzt.                                                                                                                                          | Glob `vercel.json` — kein Treffer                                                                       |
| E6  | Kein HOF-Wrapper-Muster                                   | **Top 65 %** 🟠 | Jede der 56 Routen kopiert dasselbe Boilerplate manuell (`enforceRateLimit` + `getClientIdentifier` + `rateLimitHeaders` + 429/503-Handling) — kein `withRateLimit()`, das eine neue Route strukturell zum Rate-Limitieren zwingt.                                                                             | Grep `withRateLimit\|withAuth\(` — 0 Treffer, Beispiel-Boilerplate in `admin/job-health/route.ts:49-63` |
| E3  | Telegram-Webhook ohne Rate-Limit                          | **Top 70 %** 🔴 | `telegram/webhook/route.ts` ist nur secret-authentifiziert (`hasValidWebhookSecret`), **kein** `enforceRateLimit()`-Aufruf — trotz gegenteiliger (falscher) Doku-Behauptung.                                                                                                                                   | `telegram/webhook/route.ts:24-33` (kein RateLimit-Aufruf im gesamten File)                              |
| E5  | Kein zentraler Vollständigkeits-Check                     | **Top 75 %** 🔴 | Kein Test/Lint/CI-Skript vergleicht die Dateisystem-Routenliste gegen die dokumentierte Rate-Limit-Aufrufer-Liste. `mutation-origin-inventory.test.ts` prüft zwar CSRF-Origin-Validierung mit einem hartkodierten 14-Routen-Array, aber **nicht filesystem-getrieben** und nicht für Rate-Limiting.            | `mutation-origin-inventory.test.ts:6-21`, sonst 0 Treffer                                               |
| E2  | **Konkrete unentdeckte Lücke: `guide-persona`-Route**     | **Top 85 %** 🔴 | `casino/guide-persona/route.ts` — authentifizierter `GET`+`PATCH`, schreibt in `users.guide_persona` (Zeile 82-85) — **0 Rate-Limit-Aufrufe im gesamten File**. Weder in der 37-Routen-Liste noch in der „bewusst nicht instrumentiert"-Liste dokumentiert — eine echte, bislang niemandem aufgefallene Lücke. | `casino/guide-persona/route.ts` (vollständig gelesen, kein `enforceRateLimit`)                          |

**Marker-Konvention:** identisch zu `06_rate_limiting_abuse_prevention.md`.

**Rechnerischer Schnitt über alle 10 Positionen:** (20+30+45+50+55+60+65+70+75+85)/10 = **Top 55,5 %** (gerundet Top 56 %) — deutlich schlechter als der bisherige Top-42-%-Bestwert, weil die theoretische Sorge dieser Unterkategorie („eine Route könnte vergessen werden") sich beim direkten Dateisystem-Abgleich als **bereits eingetretener, realer Fund** herausstellte (E2, E3), nicht nur als abstraktes Risiko.

## 2 — Übersicht für Jan

| Nummer | Meilenstein                                                | Status     | Nächster Schritt                                      | Zuständigkeit |
| ------ | ---------------------------------------------------------- | ---------- | ----------------------------------------------------- | ------------- |
| L0     | `guide-persona`-Route absichern (E2, höchste Priorität)    | 🔴 Geplant | `enforceRateLimit()` ergänzen                         | LLM           |
| L1     | `telegram/webhook`-Route absichern + Doku korrigieren (E3) | 🔴 Geplant | Rate-Limit ergänzen, falsche Doku-Zeile fixen         | LLM           |
| L2     | Statische Docs-Routen bewerten (E4)                        | 🔴 Geplant | Entscheidung dokumentieren oder Rate-Limit ergänzen   | LLM           |
| L3     | Zentraler Vollständigkeits-Check (E5)                      | 🔴 Geplant | Filesystem-getriebener Test gegen dokumentierte Liste | LLM           |
| L4     | HOF-Wrapper `withRateLimit()` einführen (E6)               | 🔴 Geplant | Neue Wrapper-Funktion, schrittweise Migration         | LLM           |
| L5     | Doku-Drift beheben (E9)                                    | 🔴 Geplant | `xx_docs/08` auf echte Zahlen aktualisieren           | LLM           |
| L6     | Testabdeckung + Doku-Nachzug (Abschluss)                   | 🔴 Geplant | Vollsuite grün, Kategorie-06-Datei aktualisieren      | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. **E1, E7, E8, E10 haben keinen eigenen Meilenstein** — E1 ist bereits gut, E7 ist aktuell nicht handlungsrelevant (kein Edge-Runtime-Einsatz), E8 ist eine Grundsatzfrage (Q2 unten), E10 wird durch L3+L4 strukturell entschärft, ohne dass eine echte Middleware-Zentralisierung nötig ist.

## 3 — Abgrenzung zu verwandten Plänen

- **`06_5` (Identifier-/IP-Extraktion, execution-ready):** Dort geht es um die IP-ERMITTLUNG selbst (dupliziert, inkonsistent). Hier (E5/E6/L3/L4) geht es um die Frage, OB eine Route überhaupt eine Rate-Limit-Prüfung aufruft — verwandt, aber komplementär, keine Dopplung.
- **`06_4` (Testabdeckung, execution-ready):** L3 dieses Plans (Vollständigkeits-Check) ist konzeptionell ein Test, aber spezifisch für die Routen-Vollständigkeit dieser Kategorie — nicht Teil von `06_4`s allgemeinerer Testabdeckungs-Aufschlüsselung, da er eine eigene, dedizierte Infrastruktur (Filesystem-Scan) braucht.
- **Unterkategorie #6 (Red-Team-CI-Gate, kommt als nächster Plan in dieser Serie):** Dort geht es um die CI-Trigger-Konfiguration eines bestehenden Live-Angriffssimulations-Workflows. Hier (L3) geht es um einen viel einfacheren, statischen Dateisystem-Abgleich zur Build-Zeit — unterschiedliche Mechanismen, ergänzen sich aber (der neue `06_7`-Plan sollte auf L3s Vollständigkeitsliste aufbauen können, sobald sie existiert).

## 4 — Meilensteine im Detail

### L0 — `guide-persona`-Route absichern (E2, höchste Priorität)

**Ziel:** Die einzige gefundene, tatsächlich ungeschützte authentifizierte Schreib-Route schließen.
**Scope:** `src/app/api/casino/guide-persona/route.ts` — `enforceRateLimit(getClientIdentifier(request, userId), 'guide-persona', 20, 60)` ergänzen (Schwellenwert analog zu vergleichbaren Nutzer-Einstellungs-Routen wie `admin/job-health` 60/60 oder `telegram/toggle` 10/60 — 20/60 als moderater Mittelwert für eine Nutzer-Präferenz-Route), exakt nach dem etablierten Boilerplate-Muster (Auth-Resolve → Rate-Limit → 429/503 → Zod-Parse → Delegate), **noch ohne** den HOF-Wrapper aus L4 (der kommt erst danach, damit diese kritische Lücke nicht auf L4 warten muss).
**Abhängigkeiten:** Keine (höchste Priorität, unabhängig ausführbar).
**Freigabe-Gate:** `security-reviewer` PASS (neue Rate-Limit-Einführung auf einer bislang ungeschützten authentifizierten Schreib-Route).
**Verifizierung:** Test bestätigt: 21. Aufruf innerhalb 60s liefert 429; bestehende Funktionalität (GET/PATCH des Guide-Persona-Werts) bleibt unverändert (Regressionstest).
**Nicht-Scope:** Keine Änderung an der Guide-Persona-Geschäftslogik selbst.
**Money-Pfad:** Nein · **Security-Review:** Pflicht.

### L1 — `telegram/webhook`-Route absichern + Doku korrigieren (E3, E9 teilweise)

**Ziel:** Die zweite gefundene, ungeschützte Route schließen und die falsche Doku-Behauptung korrigieren.
**Scope:** `src/app/api/telegram/webhook/route.ts` — `enforceRateLimit()` ergänzen (IP-basiert, da ein Webhook-Aufrufer i. d. R. nicht als eingeloggter Nutzer auftritt; Schwellenwert konservativ hoch, z. B. 60/60, da Telegram selbst legitime Webhook-Bursts senden kann und der Secret-Check bereits die primäre Absicherung ist — Rate-Limit hier als zusätzliche Tiefenverteidigung, nicht als primärer Schutz). Gleichzeitig `xx_docs/08_api_backend_context.md:90` korrigieren (falsche „120/min"-Behauptung durch den tatsächlich implementierten Wert ersetzen).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** `security-reviewer` PASS (Rate-Limit auf Secret-authentifizierter Route — Wechselwirkung mit dem Secret-Check prüfen, damit ein 429 den Secret-Check nicht versehentlich umgeht oder umgekehrt).
**Verifizierung:** Test bestätigt Rate-Limit-Verhalten; bestehender Secret-Check bleibt unverändert vorrangig (ein Request ohne gültiges Secret wird weiterhin abgelehnt, unabhängig vom Rate-Limit-Status).
**Nicht-Scope:** Keine Änderung an der Telegram-Bot-Verarbeitungslogik selbst.
**Money-Pfad:** Nein · **Security-Review:** Pflicht.

### L2 — Statische Docs-Routen bewerten (E4)

**Ziel:** Bewusste, dokumentierte Entscheidung statt stillschweigender Lücke für `/api/docs` und `/api/openapi.json`.
**Scope:** Da beide Routen `dynamic = 'force-static'` sind (von Next.js/Vercel-CDN gecacht, nicht bei jedem Request neu berechnet), ist das tatsächliche Abuse-Risiko strukturell gering (ein Angreifer trifft primär den CDN-Cache, nicht die eigentliche Route-Logik). **Empfehlung:** Kein Rate-Limit ergänzen, stattdessen einen kurzen Kommentar in beiden Dateien ergänzen, der das explizit begründet (analog zum bereits bestehenden `/api/health`-Präzedenzfall aus `docs/observability/06_health_check_uptime_monitoring.md`, der ebenfalls bewusst einen abweichenden Schutzansatz dokumentiert statt eine Standardannahme stillschweigend zu brechen).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Keins (reine Dokumentation, keine Verhaltensänderung in der Empfehlungs-Variante).
**Verifizierung:** Beide Dateien enthalten einen Kommentar, der die Entscheidung begründet.
**Nicht-Scope:** Keine Änderung am Caching-Verhalten selbst.
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L3 — Zentraler Vollständigkeits-Check (E5)

**Ziel:** Eine vergessene Rate-Limit-Instrumentierung fällt künftig automatisch auf, statt erst durch einen manuellen Audit wie diesen.
**Scope:** Neues Test-Skript `src/lib/security/__tests__/rate-limit-route-completeness.test.ts` — scannt zur Testzeit alle `src/app/api/**/route.ts`-Dateien (Node `fs`/`glob`, analog zum bestehenden Muster in anderen dateisystem-lesenden Test-Utilities des Projekts, falls vorhanden — sonst einfaches `readdirSync`-Rekursion), prüft für jede Datei per Quelltext-Grep, ob `enforceRateLimit` referenziert wird, **außer** für eine explizite, im Test selbst gepflegte Allowlist bewusst nicht-rate-limitierter Routen (health, cron-alert, csp-report, session-sync/migrate-session [410 Gone], webhooks/clerk [410 Gone], docs, openapi.json — die bereits bekannte „bewusst NICHT instrumentiert"-Liste aus `docs/observability/05_ratelimit_failclosed_alerting.md`). Test schlägt fehl, wenn eine NEUE Route weder rate-limitiert noch auf der Allowlist ist — genau der Fall, der `guide-persona` und `telegram/webhook` unentdeckt sein ließ.
**Abhängigkeiten:** L0, L1 (müssen zuerst erledigt sein, sonst schlägt der neue Test sofort fehl).
**Freigabe-Gate:** Neuer Test grün nach L0/L1.
**Verifizierung:** Test schlägt bewusst fehl, wenn eine Test-Fixture-Route ohne Rate-Limit und ohne Allowlist-Eintrag simuliert wird (Test des Tests — negativer Kontrollfall).
**Nicht-Scope:** Kein Laufzeit-Check (nur Build-/Test-Zeit-Statik).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L4 — HOF-Wrapper `withRateLimit()` einführen (E6)

**Ziel:** Neue Routen können das Rate-Limiting strukturell nicht mehr vergessen, statt sich auf manuelles Copy-Paste zu verlassen.
**Scope:** Neue Funktion `withRateLimit(handler, {scope, limit, windowSeconds})` in `src/lib/security/request-security.ts` — nimmt einen Route-Handler entgegen, führt Identifier-Ermittlung + `enforceRateLimit()` + 429/503-Response-Konstruktion VOR dem eigentlichen Handler aus (Higher-Order-Function-Muster). **Bewusst additiv, keine erzwungene Massen-Migration:** Bestehende 56 Routen bleiben unverändert funktionsfähig (ihr manuelles Muster funktioniert weiter) — nur `guide-persona` und `telegram/webhook` aus L0/L1 werden **zusätzlich** direkt mit dem neuen Wrapper gebaut, als lebendes Beispiel/Referenz für künftige neue Routen. Eine vollständige Migration aller 56 Routen ist **bewusst nicht Teil dieses Plans** (hohes Risiko für geringen Zusatznutzen, da die bestehenden Routen bereits korrekt funktionieren).
**Abhängigkeiten:** L0, L1 (dienen als erste Referenzimplementierung).
**Freigabe-Gate:** `security-reviewer` PASS (neue sicherheitsrelevante Kernfunktion).
**Verifizierung:** Test bestätigt: Ein mit `withRateLimit()` gewrappter Test-Handler liefert nach Überschreiten des Limits identisch dasselbe 429/503-Verhalten wie ein manuell instrumentierter Handler (Äquivalenz-Test).
**Nicht-Scope:** Keine Migration der bestehenden 56 Routen auf den Wrapper.
**Money-Pfad:** Nein · **Security-Review:** Pflicht.

### L5 — Doku-Drift beheben (E9)

**Ziel:** `xx_docs/08_api_backend_context.md` zeigt die tatsächliche Routenzahl statt einer veralteten Schätzung.
**Scope:** `xx_docs/08_api_backend_context.md:3` von „47" auf „56" (echte, per `find`/`glob` gezählte Anzahl) korrigieren. Zusätzlich `docs/observability/05_ratelimit_failclosed_alerting.md`s „35 Routen"/„37 Routen"-Angaben (Abschnitt 5) auf den nach L0/L1 aktuellen, echten Aufrufer-Stand aktualisieren.
**Abhängigkeiten:** L0, L1, L3 (der neue Vollständigkeits-Check aus L3 liefert die exakte, geprüfte Zahl für diese Doku-Korrektur).
**Freigabe-Gate:** Keins (reine Dokumentation).
**Verifizierung:** Beide Dateien zeigen dieselbe, durch `rate-limit-route-completeness.test.ts` (L3) verifizierte Zahl.
**Nicht-Scope:** Keine Restrukturierung der Dokumente selbst.
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L6 — Testabdeckung + Doku-Nachzug (Abschluss)

**Ziel:** Vollständiger Regressionsnachweis, Kategorie-06-Datei aktualisiert.
**Scope:** Vollständiger `npm test`-Lauf, `npm run typecheck`, `npm run lint`. Danach: `06_rate_limiting_abuse_prevention.md` Unterkategorie #8 aktualisieren (Niveau-Neubewertung, Status von „Execution-Ready" auf „Executed"), `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md` Zeile #8 nachziehen.
**Abhängigkeiten:** L0–L5.
**Freigabe-Gate:** Vollsuite grün, 0 TS-/Lint-Fehler.
**Verifizierung:** Testlauf-Zahlen im Ausführungsprotokoll dieser Datei dokumentieren.
**Nicht-Scope:** Keine Ausweitung auf andere Unterkategorien.
**Money-Pfad:** Nein · **Security-Review:** Nein.

## 5 — Selbstprüfung (durchgeführt 2026-09-04)

- ✅ Scope gegenüber `06_5`, `06_4` und Unterkategorie #6 abgegrenzt (Abschnitt 3).
- ✅ Jeder Meilenstein hat Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung/Nicht-Scope/Money-Pfad/Security-Review.
- ✅ Alle Zuständigkeiten = LLM.
- ✅ Die beiden konkreten, akut ungeschützten Routen (E2/E3) wurden nicht in einem allgemeinen „Testabdeckung verbessern"-Milestone versteckt, sondern als eigene, höchstpriorisierte Meilensteine (L0, L1) behandelt.
- ⚠️ **Nachträglich gefunden beim Selbst-Review:** L3 (Vollständigkeits-Check) hängt von L0/L1 ab, sonst schlägt der neue Test sofort fehl — Abhängigkeit im Meilenstein-Text bereits korrekt vermerkt.
- ⚠️ **Nachträglich gefunden:** L4 (HOF-Wrapper) könnte als Einladung missverstanden werden, alle 56 Routen sofort zu migrieren — „Nicht-Scope" explizit ergänzt, um unkontrollierten Scope-Creep durch eine ausführende Session zu verhindern.
- ✅ Kein Punkt doppelt als SOP/Kontextreferenz/Plan gepflegt.

## 6 — Offene Fragen für Jan (je 3 Antwortoptionen)

**Q1 — Soll L4 (HOF-Wrapper) in einer späteren, separaten Ausbaustufe auf alle 56 bestehenden Routen ausgeweitet werden?**

- (a) Nein, nie vollständig migrieren — bestehende Routen funktionieren korrekt, eine Vollmigration wäre Risiko ohne echten Zusatznutzen (YAGNI). _(Empfehlung)_
- (b) Ja, schrittweise bei jeder ohnehin anstehenden Änderung an einer bestehenden Route auf den Wrapper umstellen (opportunistische Migration, kein eigener Plan).
- (c) Ja, als dedizierter Folgeplan mit fester Reihenfolge, sobald dieser Plan abgeschlossen ist.

**Q2 — Soll Vercels natives Edge-Config/Firewall (E8) als zusätzliche Schutzebene evaluiert werden?**

- (a) Nein, die bestehende Upstash-basierte Lösung ist funktional ausreichend und bereits gut verstanden — kein Mehrwert durch eine zweite, parallele Rate-Limit-Ebene. _(Empfehlung — vermeidet Doppel-Komplexität)_
- (b) Ja, als reine Recherche-Aufgabe (WebSearch, kein Code) prüfen, ob Vercel Firewall kostenlos/einfach integrierbar wäre — eigener kleiner Folgeplan.
- (c) Ja, direkt als zusätzliche Verteidigungsebene vor der bestehenden Lösung einführen — höherer Aufwand, potenziell redundant.

## 7 — Verwandte Artefakte

| Bedarf                                                                       | Datei                                                                                                                   |
| :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| Vollständige Kategorie-06-Aufschlüsselung (Ursprung dieses Plans)            | [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md)                                          |
| Kompakte Kategorie-Overview                                                  | [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md)                 |
| Schwester-Plan #2 (Identifier-/IP-Extraktion, execution-ready)               | [`06_5_identifier_ip_extraction_plan.md`](06_5_identifier_ip_extraction_plan.md)                                        |
| Schwester-Plan #9 (Testabdeckung, execution-ready)                           | [`06_4_test_coverage_plan.md`](06_4_test_coverage_plan.md)                                                              |
| Bisherige (veraltete) Aufrufer-Liste                                         | [`docs/observability/05_ratelimit_failclosed_alerting.md`](../docs/observability/05_ratelimit_failclosed_alerting.md)   |
| API-Backend-Kontext (enthält die zu korrigierende Routenzahl)                | [`xx_docs/08_api_backend_context.md`](../xx_docs/08_api_backend_context.md)                                             |
| Health-Check-Präzedenzfall (bewusst abweichender Schutzansatz, dokumentiert) | [`docs/observability/06_health_check_uptime_monitoring.md`](../docs/observability/06_health_check_uptime_monitoring.md) |
| SOP Planungsdateien (Format dieses Plans)                                    | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                             |
| SOP Execution (nächster Schritt nach Freigabe)                               | [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)                                         |

## 8 — Ausführungsprotokoll (2026-09-06)

### 8.1 Meilensteine

| Meilenstein                              | Status | Umsetzung / Verifizierung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :--------------------------------------- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0 `guide-persona` absichern (E2)        | 🟢     | GET+PATCH der Route sind jetzt `withRateLimit`-Const-Exports (`scope 'guide-persona'`, 20/60s, `GUIDE_PERSONA_LIMIT`/`_WINDOW_SECONDS` in `rate-limit-config.ts` mit Herleitungskommentar). Auth-first-`resolve`: `createClient()`+`getUser()` VOR der Limit-Entscheidung → user-basierte Buckets, 401-`earlyResponse` bei signed-out; `{supabase, userId}` wird durchgereicht (kein Double-Auth). Schwellwert-Regression getestet: 21. Aufruf → 429 (`RATE_LIMITED`-Envelope + `Retry-After`); GET/PATCH-Funktionalität unverändert (Regressionstests incl. `from('users')`-Assertions). Umsetzung bewusst direkt über den L4-Wrapper (statt erst Raw-Boilerplate) — L4 bestimmte die Route ohnehin zur Referenzimplementierung, ein Zwischenschritt hätte ein identisches Code-Zwischenprodukt erzeugt.                            |
| L1 `telegram/webhook` absichern (E3)     | 🟢     | POST ist jetzt `withRateLimit`-Const-Export (`scope 'telegram-webhook'`, 60/60s konservativ-hoch, `TELEGRAM_WEBHOOK_LIMIT`/`_WINDOW_SECONDS`). Secret-first-`resolve`: `hasValidWebhookSecret()` (timingSafeEqual) läuft VOR der Limit-Entscheidung → 401-`earlyResponse`; Handler-Logik (Zod-`updateSchema`, `/start`, `/stop`, Always-200 bei internem Fehler) unverändert. Tests: 61. gültiger Call → 429; 60 ungültige-Secret-Floods → je 401, danach legitim Caller noch 200 (Cross-Client-DoS-Nachweis: Floods verbrauchen das IP-Budget nicht). Doku-Fix „120/min" siehe L5.                                                                                                                                                                                                                                                  |
| L2 Docs-Routen bewerten (E4)             | 🟢     | Empfehlung umgesetzt, kein Rate-Limit: `/api/docs` + `/api/openapi.json` erhielten Kommentare, die die force-static/CDN-Cache-Begründung explizit machen (analog `/api/health`-Präzedenz); beide stehen in der neuen Exemption-Allowlist (L3).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| L3 Zentraler Vollständigkeits-Check (E5) | 🟢     | Neues Modul `src/lib/security/rate-limit-route-inventory.ts` (Allowlist mit 15 dokumentierten Einträgen inkl. je-Begründung, gespiegelt aus `docs/observability/05` §5) + Test `rate-limit-route-completeness.test.ts`: fs-Rekursion über alle `src/app/api/**/route.ts` (57 gesamt), Compliance = instrumentiert ODER Allowlist, **Pin der exakten Zahlen 57/42** (neue Route → Test rot bis Entscheidung), Dead-Exemption-Check (Allowlist-Eintrag ohne Datei → rot), **Test des Tests**: Call-Syntax zählt, Kommentar-Nennung nicht (full-line-, block- und trailing-comments werden vor dem Match gestrippt; generische Syntax `withRateLimit<T>(...)` wird erkannt).                                                                                                                                                            |
| L4 HOF-Wrapper `withRateLimit()` (E6)    | 🟢     | `withRateLimit(handler, {scope, limit, windowSeconds, resolve?})` in `request-security.ts`: Entscheidung VOR dem Handler, ohne `resolve` IP-Bucket via `getClientIdentifier(request)`, mit `resolve` Custom-Ordering (auth-first bei guide-persona, secret-first bei telegram/webhook) inkl. `data`-Durchreichung; `!decision.success` → 429 (`RATE_LIMITED`) bzw. 503 (`SERVICE_UNAVAILABLE` bei `unavailable`) via `apiErrorResponse` + `rateLimitHeaders` — **byte-identisch zum manuellen Boilerplate (Äquivalenz-Test gegen handgebauten `apiErrorResponse`-Response)**. Additiv: die 40 übrigen manuell instrumentierten Routen bleiben bewusst unangetastet (Q1a). JSDoc-Sicherheitsvertrag am `resolve`-Parameter: identifier MUSS aus `getClientIdentifier`/server-verifizierter Quelle stammen (Security-Review MEDIUM-2). |
| L5 Doku-Drift beheben (E9)               | 🟢     | `xx_docs/08_api_backend_context.md`: „47"→57 (Header + §3) mit Hinweis auf den Test-gepinnten Zähler; Telegram-Webhook-Zeile korrigiert (120/min-Dokfehler → 60/min, `TELEGRAM_WEBHOOK_SECRET` statt falschem `TELEGRAM_BOT_SECRET`); `guide-persona`-Zeile neu in §3.1. `docs/observability/05`: Titel/§1 „35 Routen"→„42 Routen, 2 Funktionen", §5-Aufruferliste auf Stand 2026-09-06 (42 Einträge; zuvor fehlten `admin/job-health`, `admin/promo-codes/[code]/reverse`, `user/self-exclusion`, `guide-persona`, `telegram/webhook`), Nicht-instrumentiert-Liste erweitert um `/api/docs`+`/api/openapi.json`, §6 Code-Pfade um Inventory + Completeness-Test ergänzt. Beide Dokumente zitieren dieselben durch den Test verifizierten Zahlen (57 gesamt / 42 instrumentiert).                                                    |
| L6 Testabdeckung + Doku-Nachzug          | 🟢     | DoD: `npm run typecheck` 0 Fehler · `npm test` **1600/1600 Tests in 212 Dateien** grün · `npm run lint` 0 Fehler (23 Vorab-Warnings, unveränderte Baseline) · `npm run build` erfolgreich · `git status`-Audit nur geplante Dateien. Kategorie-Datei + Overview nachgezogen (siehe 8.4).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

### 8.2 Security-Reviews (Freigabe-Gates)

- **security-reviewer** (L0/L1/L4, Pflicht): **APPROVE WITH FINDINGS** — kein CRITICAL/HIGH. Verified non-issues: Fail-Closed durchgängig (Upstash-Ausfall → 503; resolve-Exception verhindert Handler-Ausführung; PATCH-Auth-Catch → 500), 401-Antworten leaken nichts (`DEFAULT_PERSONA`, `private, no-store`), kein Secret-Logging, timingSafeEqual korrekt (Längen-Pre-Check akzeptiertes Residual, LOW-2), XFF-last-entry + IPv6-/64-Normalisierung unregressiert, Origin/CSRF-Coverage unverändert. Umgesetzte Mitigationen: JSDoc-identifier-Vertrag (MEDIUM-2), Comment-Strip in der Erkennung (LOW-4). Akzeptierte Trade-offs: siehe 8.5.
- Keine Migration unter `supabase/migrations/**` in diesem Plan → `@migration-security-guard` nicht anwendbar.

### 8.3 Entscheidungen der Ausführungssession (Empfehlungs-Optionen)

- **Q1(a):** Keine Voll-/Massenmigration der bestehenden Routen auf den Wrapper (YAGNI, wie empfohlen) — der Wrapper ist Pflichtmuster für **neue** Routen; opportunistische Migration bei ohnehin anstehenden Änderungen bleibt künftig möglich.
- **Q2(a):** Kein Vercel-natives Firewall-/Edge-Rate-Limiting parallel zur Upstash-Lösung (keine Doppel-Komplexität, wie empfohlen).
- **L0/L1 direkt über den L4-Wrapper** statt Raw-Boilerplate-erst-dann-Wrapper: Der Plan sah für beide Routen die Referenzimplementierung des Wrappers ohnehin vor; der Zwischenschritt hätte ein identisches Code-Zwischenprodukt erzeugt. Verifizierungs-Anforderungen (429 nach N+1, Secret/Auth-Vorrang, Regression) vollständig erfüllt.
- **Route-Zahl 56 (Plan-Basis) → 57 real:** Zwischen Planungsdatum und Execution fügte `06_10` die Route `admin/promo-codes/[code]/reverse` hinzu. Die Pins im Completeness-Test wurden auf die echte, fs-verifizierte Zahl 57 (42 instrumentiert, 15 Allowlist) gesetzt; beide Dokumente zitieren diese Zahl.
- **Erkennungs-Präzision nachgeschärft:** Der `'withRateLimit('`-Substring griff bei `guide-persona` (generische Syntax `withRateLimit<T>(...)`) ursprünglich nur über eine Kommentar-Nennung — exakt die Masquerade-Klasse, die E5 verhindern soll. Fix: Comment-Strip vor dem Match + Erkennung der generischen Call-Syntax, jeweils durch eigene Positiv-/Negativ-Tests abgesichert (auch Security-Review LOW-4).

### 8.4 Niveau-Neubewertung der 10 Sub-Unterkategorien (Sub-Schnitt)

| #   | Sub-Unterkategorie               | Vor      | Nach     | Begründung                                                                                                                            |
| :-- | :------------------------------- | :------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | Middleware-Matcher-Abdeckung     | Top 20 % | Top 20 % | unverändert (bereits gut, kein Meilenstein)                                                                                           |
| E2  | Konkrete Lücke `guide-persona`   | Top 85 % | Top 10 % | L0: auth-first-Wrapper-Instrumentierung + 429-Regression/401-Vorrang-Tests                                                            |
| E3  | Telegram-Webhook ohne Rate-Limit | Top 70 % | Top 10 % | L1: secret-first-Wrapper + Flood/429-Tests; falsche Doku-Zeile korrigiert                                                             |
| E4  | Statische Docs-Routen            | Top 30 % | Top 12 % | L2: dokumentierte Entscheidung + Allowlist-Eintrag statt stiller Lücke                                                                |
| E5  | Kein Vollständigkeits-Check      | Top 75 % | Top 10 % | L3: fs-getriebener Test mit Zahlen-Pin, Dead-Exemption-Check und Negativkontrollen                                                    |
| E6  | Kein HOF-Wrapper-Muster          | Top 65 % | Top 20 % | L4: Wrapper live + Pflicht für neue Routen; 40 Bestandsrouten bewusst auf Raw-Muster (Q1a)                                            |
| E7  | Edge-Runtime nie bewiesen        | Top 55 % | Top 55 % | unverändert — aktuell nicht handlungsrelevant (kein Edge-Runtime-Einsatz)                                                             |
| E8  | Vercel Firewall ungenutzt        | Top 60 % | Top 55 % | Q2(a): bewusste Ablehnung dokumentiert; Fähigkeit bleibt ungenutzt                                                                    |
| E9  | Doku-Drift                       | Top 45 % | Top 10 % | L5: Zahlen korrigiert und durch den Completeness-Test dauerhaft gepinnt                                                               |
| E10 | Dezentrale Schutzverantwortung   | Top 50 % | Top 30 % | durch L3+L4 strukturell entschärft (neue Routen können nicht vergessen werden); echte Middleware-Zentralisierung bewusst nicht gebaut |

**Neuer Sub-Schnitt:** (20+10+10+12+10+20+55+55+10+30)/10 = **Top 23,2 %** (gerundet **Top 23 %**, 🟡). Ausgangslage des Plans: Top 55,5 %. **Kategorienniveau #8: Top 42 % → Top 23 %.** Der Kategorienschnitt der Gesamt-Kategorie sinkt dadurch ehrlich von Top 30,5 % auf **Top 28,6 %** (gerundet Top 29 %; gewichtet 28,51 → **26,61**) — die Verbesserung dieser Teilfläche ist der stärkste Einzelbeitrag der bislang ausgeführten Pläne.

### 8.5 Verbleibende offene Punkte (bewusst dokumentiert, nicht still)

1. **MEDIUM-1 des Security-Reviews (akzeptierter Trade-off):** `guide-persona` führt bei unauthentifizierten Floods pro Request eine Supabase-Auth-Lookup aus, BEVOR die 401-`earlyResponse` greift (auth-first ist Voraussetzung für user-basierte Buckets). Ein grober pre-auth IP-Limiter vor `getUser()` würde das decken — bewusst nicht gebaut (kein Plan-Scope, zusätzlicher Limiter-Zweig); optionaler Folgeplan möglich.
2. **MEDIUM-2 Rest:** Der identifier-Vertrag ist JSDoc-Dokumentation, keine Typ-/Laufzeit-Erzwingung — die zwei aktuellen Referenzrouten erfüllen ihn; künftige Routenautoren werden über den Wrapper-Kommentar geleitet.
3. **LOW-Findings:** GET+PATCH teilen einen 20/60-Bucket je Nutzer (bewusst, dokumentierte Prämisse); trailing-comment-Masquerade theoretisch weiterhin möglich (Comment-Strip deckt full-line/block; der Zahlen-Pin begrenzt den Schaden); `data = undefined as T` Typ-Loch bei resolve-less Nutzung mit deklariertem T (fail-closed 500). Keins umgesetzt — optionales Hardening.
4. **E7/E8:** unverändert — E7 nicht handlungsrelevant (kein Edge-Runtime-Einsatz), E8 durch Q2(a) bewusst abgelehnt.
5. **Q1(b)-Option:** opportunistische Migration bestehender Routen auf den Wrapper bei ohnehin anstehenden Änderungen — kein eigener Plan, keine Frist.
6. **Remote-Push/Deploy:** dieser Plan ändert kein Schema; die allgemeine Jan-Freigabe-Regel für Remote-/Live-Aktionen bleibt unberührt.
