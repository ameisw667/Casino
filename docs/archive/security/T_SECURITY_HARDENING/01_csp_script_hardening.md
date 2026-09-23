# 01 — CSP `script-src` Nonce-Härtung (Runde 2 — Ziel Top 10–15 %)

> **Status:** 🟢 Executed (2026-09-12; Trusted-Types-Rest bei Jan) · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit — Trusted Types ist **explizit nicht Teil dieser Runde**, siehe §0) · **Scope:** `src/proxy.ts` (CSP-Direktiven-Zusammensetzung), `src/lib/security/__tests__/csp-nonce.test.ts`, `src/lib/security/__tests__/proxy-security-headers.test.ts`, neues Anti-Regressions-Skript für `style-src`; **nicht** im Scope: `style-src: unsafe-inline` vollständig eliminieren (riesiger Refactor über 349 Dateien, YAGNI für diese Runde), Trusted Types einführen (Jan/K5), CSP-Violation-Reporting selbst (Säule 6).
> **Money-Pfad:** Nein (Header-/CSP-Ebene) · **Security-Review:** Empfohlen bei L4 (neues Anti-Regressions-Gate, CI-Blocking-Verhalten)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Diese Säule hat noch keine eigene Planungsdatei — nur einen archivierten Runde-1-Stand ([`docs/archive/t_security_hardening_01_csp_script_hardening.md`](../../../../docs/archive/t_security_hardening_01_csp_script_hardening.md), 2026-08-30, Top 15 %). Anders als bei den bereits durchgehärteten Säulen 3/5/7/8 ist dies die **erste vertiefte Runde** für Säule 1.
2. **Frische `casino-code-explorer`-Recherche (2026-09-12)** zeigt: Die CSP ist seit dem Archiv-Stand real weitergewachsen (`connect-src`/`img-src`/`font-src`/`frame-ancestors`/Reporting-Integration sind inzwischen granular gesetzt, nicht mehr nur `script-src`/`style-src` dokumentiert) — die Säule ist in Teilen bereits besser als Top 15 % suggeriert. Gleichzeitig wächst die `style-src: unsafe-inline`-Restlücke real weiter (349 Dateien / 4985 Fundstellen, vorher 312 Dateien) — ein Trend, kein akuter Einzelfund.
3. **Diese Datei ist reine Planung, keine Ausführung** (Jan-Auftrag 2026-09-12).
4. **Zwei echte, aber unterschiedlich gewichtete Restlücken:** (a) vier CSP-Direktiven (`base-uri`, `form-action`, `object-src`, `upgrade-insecure-requests`) sind nicht explizit gesetzt — durch `default-src 'self'` bereits implizit sicher, aber OWASP empfiehlt explizites Setzen als Tiefenverteidigung; (b) die wachsende `style-src`-Restlücke hat keinen Regressionsschutz — niemand bemerkt, wenn sie schneller wächst als gewollt.
5. **Trusted Types (`require-trusted-types-for 'script'`) bleibt bewusst außerhalb dieser Runde** — Einführung würde potenziell jeden `innerHTML`/DOM-Sink im Repo brechen (Breaking Change, volle Browser-Kompatibilitätsprüfung nötig). Diese Runde bereitet die Entscheidungsgrundlage nur vor (L5), aktiviert sie nicht.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                                                                    | Scope (Dateien)                                                                                                 |   Status   | Zuständigkeit | Verifikation                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | :--------: | :-----------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| L1  | Fehlende CSP-Direktiven explizit setzen (`base-uri`, `form-action`, `object-src`, `upgrade-insecure-requests`) | `src/proxy.ts`                                                                                                  | 🔴 Geplant |      LLM      | Alle 4 Direktiven im ausgelieferten `Content-Security-Policy`-Header sichtbar                                                      |
| L2  | Regressionstests für bisher ungetestete Direktiven ergänzen                                                    | `src/lib/security/__tests__/proxy-security-headers.test.ts`                                                     | 🔴 Geplant |      LLM      | `img-src`, `font-src`, `report-uri`, die 4 neuen Direktiven aus L1 jetzt regressionsgeschützt                                      |
| L3  | `strict-dynamic`-Fallback (`https:`) für ältere Browser ergänzen                                               | `src/proxy.ts`                                                                                                  | 🔴 Geplant |      LLM      | `script-src` enthält zusätzlichen `https:`-Fallback-Token, moderne Browser ignorieren ihn wegen `strict-dynamic` weiterhin korrekt |
| L4  | Anti-Regressions-Gate für `style-src: unsafe-inline`-Wachstum                                                  | Neues Skript `scripts/check-inline-style-baseline.mjs`, `.github/workflows/quality-ci.yml`, neue Baseline-Datei | 🔴 Geplant |      LLM      | CI schlägt fehl, wenn die Zahl der Inline-Style-Fundstellen ohne bewusste Baseline-Aktualisierung steigt                           |
| L5  | Trusted-Types-Entscheidungsgrundlage dokumentieren                                                             | `docs/security-hardening/01_csp_script_hardening.md` (neuer Abschnitt)                                          | 🔴 Geplant |      LLM      | Jan kann die K5-Entscheidung informiert treffen, ohne selbst zu recherchieren                                                      |

**Warum kein Jan-Gate:** Alle 5 Meilensteine sind additive CSP-/Test-/CI-Ergänzungen ohne Breaking-Change-Risiko — Trusted Types wird nicht aktiviert, nur vorbereitet.

---

## 2 — CSP-Nonce-Härtung in Subkategorien: Neubewertung (2026-09-12, Baseline für diese Runde)

|  #  | Subkategorie                                                                                             | Niveau (Baseline) | Status | Kernbefund                                                                                                                                               |
| :-: | -------------------------------------------------------------------------------------------------------- | :---------------: | :----: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Nonce-Generierung (`crypto.randomUUID()` → Base64, per Request)                                          |     Top 10 %      |   🟢   | Unverändert solide — `src/proxy.ts:165`                                                                                                                  |
|  2  | `strict-dynamic` + `unsafe-eval` nur Dev                                                                 |     Top 10 %      |   🟢   | `src/proxy.ts:166,169` — unverändert solide                                                                                                              |
|  3  | 0 `eval(`/`new Function(` in Produktionscode                                                             |     Top 10 %      |   🟢   | Frisches Grep bestätigt 0 Treffer außerhalb von Testinfrastruktur                                                                                        |
|  4  | Kern-Testabdeckung `script-src`/Nonce                                                                    |     Top 10 %      |   🟢   | `src/lib/security/__tests__/csp-nonce.test.ts`, 6 Tests grün                                                                                             |
|  5  | `connect-src`/`img-src`/`font-src` granular (keine Wildcards)                                            |     Top 10 %      |   🟢   | Seit Archiv-Stand real ausgebaut — exakte Sentry-/PostHog-/Supabase-/Upstash-Hosts statt Wildcard                                                        |
|  6  | `frame-ancestors 'none'`                                                                                 |     Top 10 %      |   🟢   | `src/proxy.ts:167-184` — solide                                                                                                                          |
|  7  | **`style-src: unsafe-inline` — wachsender Rest**                                                         |     Top 40 %      |   🟠   | 349 Dateien / 4985 Fundstellen (vorher 312 Dateien) — kein Regressionsschutz gegen weiteres Wachstum, volle Elimination außerhalb dieser Runde (zu groß) |
|  8  | **Fehlende explizite Direktiven** (`base-uri`, `form-action`, `object-src`, `upgrade-insecure-requests`) |     Top 25 %      |   🟡   | 0 Treffer im Grep gegen `src/proxy.ts` — durch `default-src 'self'` implizit sicher, aber ohne explizite Tiefenverteidigung                              |
|  9  | **Testabdeckung `img-src`/`font-src`/`report-uri`/neue Direktiven**                                      |     Top 30 %      |   🟡   | Nur `default-src`, `connect-src`, `frame-ancestors` sind in `proxy-security-headers.test.ts` explizit assertiert                                         |
| 10  | Trusted Types                                                                                            |     Top 45 %      |   🟠   | 0 Treffer für `trustedTypes`/`require-trusted-types-for` — bewusst K5, siehe §0 Punkt 5                                                                  |

**Rechnerischer Schnitt (Baseline dieser Runde):** (10+10+10+10+10+10+40+25+30+45)/10 = **Top 20 %** — besser als der isolierte Archiv-Wert (Top 15 %) bei den Kern-Direktiven, aber durch zwei neue, tiefer recherchierte Lücken (#7 Wachstumstrend, #8/#9 fehlende Direktiven/Tests) und den unveränderten K5-Punkt (#10) insgesamt realistischer eingeordnet.

---

## 3 — Verifizierter Ist-Stand (casino-code-explorer-Recherche, 2026-09-12)

**`src/proxy.ts:167-184`** (vollständig geprüft): `default-src 'self'`, `script-src 'self' 'nonce-{nonce}' 'strict-dynamic'` (+ `unsafe-eval` nur Dev), `style-src 'self' 'unsafe-inline' ...`, `font-src`, `img-src`, `connect-src` (exakte Hosts: Supabase, Upstash, Sentry, PostHog — keine Wildcards), `frame-ancestors 'none'`, `report-uri`/`report-to`. `Reporting-Endpoints`-Header (`src/proxy.ts:238`) und `src/app/api/internal/csp-report/route.ts` verzahnen Säule 1 mit Säule 6.

**Nonce-Generierung:** `crypto.randomUUID()` → Base64, `src/proxy.ts:165`. `strict-dynamic`: `src/proxy.ts:169`. `unsafe-eval` nur bei `NODE_ENV === 'development'`: `src/proxy.ts:166,169`.

**Third-Party-Ketten geprüft:** PostHog (`src/lib/analytics/posthog-client.ts:29`) und Sentry laufen als npm-Importe, kein CDN-`<script src>` gefunden (`src/app/layout.tsx` hat keine eigenen `<script>`-Tags). Google-Login nutzt Full-Page-Redirect statt Popup. Kein `unsafe-inline`-Fallback für ältere Browser gefunden — `strict-dynamic` bleibt ungebrochen, aber auch ohne den in L3 vorgeschlagenen `https:`-Fallback für sehr alte Browser (die `strict-dynamic` nicht kennen).

**`style-src`-Restlücke quantifiziert:** 349 Dateien / 4985 Fundstellen für `style={{...}}`-Inline-Styles im `src/`-Baum (frisches Grep, 2026-09-12) — ein Anstieg von ~12 % gegenüber der letzten Messung (312 Dateien). Vollständige Elimination wäre ein eigenständiger, sehr großer Task (jede Komponente einzeln auf Tailwind-Klassen umstellen) — bewusst außerhalb dieser Runde (YAGNI, kein akuter Sicherheitsvorfall, der das rechtfertigt).

**Fehlende Direktiven bestätigt:** 0 Treffer für `base-uri`, `form-action`, `object-src`, `upgrade-insecure-requests` in `src/proxy.ts`. Da `default-src 'self'` gesetzt ist, fallen `object-src`/`form-action`/`base-uri` per CSP-Spezifikation bereits implizit auf `'self'` zurück — kein akuter Bypass, aber OWASP empfiehlt explizites Setzen, da ein künftiger, unabhängiger `default-src`-Fehler sonst gleich mehrere Direktiven gleichzeitig öffnen würde.

**Testlücke bestätigt:** `src/lib/security/__tests__/proxy-security-headers.test.ts` assertiert nur `default-src`, `connect-src`, `frame-ancestors` sowie den PostHog-Exact-Host — `img-src`, `font-src`, `report-uri` und die vier in L1 neu gesetzten Direktiven haben keinen dedizierten Test.

---

## 4 — Meilensteine

### L1 — Fehlende CSP-Direktiven explizit setzen

- **Ziel:** Die in §2 #8 benannte Lücke schließen — Tiefenverteidigung statt impliziter Fallback.
- **Schritte:** `src/proxy.ts` CSP-String um `base-uri 'self'`, `form-action 'self'`, `object-src 'none'`, `upgrade-insecure-requests` ergänzen — Werte konsistent mit dem bereits gesetzten `default-src 'self'`/`frame-ancestors 'none'`-Muster wählen (kein Wert erlaubt mehr als der bestehende implizite Fallback bereits zuließ, daher kein Breaking-Risiko).
- **Verifizierung:** `npm test` — bestehende Tests bleiben grün; manueller `curl`-Check gegen eine lokale Dev-Instanz zeigt die vier neuen Direktiven im Header.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (rein additive, restriktivere Werte als der bisherige implizite Fallback).

### L2 — Regressionstests für bisher ungetestete Direktiven ergänzen

- **Ziel:** Die in §2 #9 benannte Lücke schließen.
- **Schritte:** `proxy-security-headers.test.ts` um Assertions für `img-src`, `font-src`, `report-uri` sowie die vier neuen L1-Direktiven ergänzen — gleiches Testmuster wie die bestehenden `default-src`/`connect-src`-Assertions.
- **Verifizierung:** `npm test` — neue Assertions grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — `strict-dynamic`-Fallback für ältere Browser ergänzen

- **Ziel:** Funktions-Härtung (kein Sicherheitsrisiko, aber Kompatibilität) — moderne Browser nutzen `strict-dynamic` und ignorieren Host-/Schema-Quellen daneben laut Spezifikation; ältere Browser ohne `strict-dynamic`-Support fallen sonst auf `'self'` allein zurück.
- **Schritte:** `src/proxy.ts` `script-src`-Direktive um einen `https:`-Fallback-Token ergänzen (Standard-CSP-Level-2-Muster: `script-src 'self' 'nonce-{nonce}' 'strict-dynamic' https:`).
- **Verifizierung:** `npm test` — bestehende Nonce-Tests bleiben grün (Fallback ändert das Verhalten in modernen Browsern nicht); CSP-Spezifikation referenziert, dass `strict-dynamic`-fähige Browser den `https:`-Token ignorieren.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — Anti-Regressions-Gate für `style-src`-Wachstum

- **Ziel:** Die in §2 #7 benannte Lücke eindämmen — nicht die 4985 bestehenden Fundstellen beheben (zu groß, außerhalb des Scopes), sondern verhindern, dass die Zahl unbemerkt weiterwächst.
- **Schritte:**
  1. Neue Baseline-Datei mit der aktuellen Fundstellenzahl (5019, siehe §3 — Muster: `.audit-moderate-baseline.json` aus Säule 7, L2; diese Datei existiert nur im noch nicht gemergten Worktree `.claude/worktrees/round2-merge`, nicht im aktuellen Branch — falls dort nicht einsehbar, reicht die hier beschriebene Struktur: JSON mit Zähler + Zeitstempel).
  2. Neues Skript `scripts/check-inline-style-baseline.mjs` — zählt `style={{` im `src/`-Baum, vergleicht gegen die Baseline, schlägt fehl, wenn die Zahl **steigt**, ohne dass die Baseline-Datei im selben Commit mit aktualisiert wurde (bewusstes Opt-in für Wachstum statt hartem Verbot — neue Inline-Styles sind manchmal pragmatisch nötig, aber sollen nie versehentlich durchrutschen).
  3. Neuer, nicht-blockierender Schritt in `quality-ci.yml` (Muster: bestehende `continue-on-error`-Schritte) — informiert im Job-Summary, eskaliert erst bei echtem unbewusstem Anstieg.
- **Verifizierung:** Ein simulierter Anstieg ohne Baseline-Update lässt den Check fehlschlagen; ein Anstieg mit aktualisierter Baseline läuft grün durch.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Empfohlen (neues CI-Verhalten, einmalig gegenprüfen, dass es nicht versehentlich blockierend für unabhängige PRs wird).

### L5 — Trusted-Types-Entscheidungsgrundlage dokumentieren

- **Ziel:** Jans künftige K5-Entscheidung beschleunigen, ohne sie vorwegzunehmen (Muster: COEP-Entscheidungsgrundlage in Säule 5, L6).
- **Schritte:** Neuer Abschnitt in `docs/security-hardening/01_csp_script_hardening.md` (falls nicht vorhanden, neu anlegen) — Browser-Support-Stand, grobe Schätzung der betroffenen DOM-Sink-Stellen (`innerHTML`, `dangerouslySetInnerHTML`, `document.write`), Aufwand für eine schrittweise Einführung (`Content-Security-Policy-Report-Only` zuerst, dann Hard-Enforcement).
- **Verifizierung:** Dokumentation liest sich als vollständige Entscheidungsgrundlage — keine offene Recherchefrage mehr für Jan.
- **Freigabe-Gate:** Keines (reine Doku, keine Aktivierung). **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. Alle CSP-Direktiven, die aktuell nur implizit über `default-src` abgesichert sind, sind explizit gesetzt (L1).
2. Jede gesetzte Direktive hat einen Regressionstest (L2).
3. `strict-dynamic` funktioniert mit einem dokumentierten Fallback auch in älteren Browsern (L3).
4. Ein unbemerktes Wachstum der `style-src: unsafe-inline`-Restlücke wird von CI erkannt (L4).
5. Jans künftige Trusted-Types-Entscheidung ist vollständig informiert vorbereitet, ohne dass die Aktivierung selbst vorweggenommen wird (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur CSP-`script-src`/verwandte Direktiven, nicht CSP-Violation-Reporting (Säule 6) oder die vollständige `style-src`-Elimination (YAGNI).
- [x] Alle 5 Meilensteine ausschließlich LLM-Zuständigkeit — Trusted Types wird nicht aktiviert, nur vorbereitet.
- [x] Recherche durch `casino-code-explorer` fundiert (Datei-/Zeilenreferenzen in §3), nicht aus dem Gedächtnis behauptet.
- [x] Ehrlichkeits-Check: Die Baseline dieser Runde (Top 20 %) berücksichtigt sowohl die real gewachsene Stärke (granulare `connect-src`/`img-src`/`font-src`) als auch die real gewachsene Schwäche (`style-src`-Trend) — nicht einseitig beschönigt.
- [x] Money-Pfad korrekt „Nein" — reine Header-Ebene.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 5 Meilensteine

|  #  | Subkategorie                       | Baseline | Nach Ausführung | Warum                                                             |
| :-: | ---------------------------------- | :------: | :-------------: | ----------------------------------------------------------------- |
|  1  | Nonce-Generierung                  | Top 10 % |    Top 10 %     | unverändert                                                       |
|  2  | `strict-dynamic`/`unsafe-eval`     | Top 10 % |    Top 10 %     | unverändert                                                       |
|  3  | 0 `eval(`-Aufrufe                  | Top 10 % |    Top 10 %     | unverändert                                                       |
|  4  | Kern-Testabdeckung                 | Top 10 % |    Top 10 %     | unverändert                                                       |
|  5  | `connect-src`/`img-src`/`font-src` | Top 10 % |    Top 10 %     | unverändert                                                       |
|  6  | `frame-ancestors`                  | Top 10 % |    Top 10 %     | unverändert                                                       |
|  7  | `style-src`-Wachstum               | Top 40 % |    Top 25 %     | L4 — Wachstum eingedämmt, bestehende Lücke bleibt (bewusst YAGNI) |
|  8  | Fehlende Direktiven                | Top 25 % |    Top 10 %     | L1                                                                |
|  9  | Testabdeckung neuer Direktiven     | Top 30 % |    Top 10 %     | L2, L3                                                            |
| 10  | Trusted Types                      | Top 45 % |    Top 45 %     | **unverändert — bewusst außerhalb des LLM-Scopes**                |

**Projizierter Schnitt nach Ausführung:** (10+10+10+10+10+10+25+10+10+45)/10 = **Top 15 %**.

**Ehrliche Einordnung:** Trusted Types (#10) bleibt der einzige Punkt, der eine echte Top-10-%-Annäherung verhindert — ein bewusster K5-Punkt, kein Planungsfehler. Der `style-src`-Trend (#7) wird eingedämmt, nicht beseitigt — eine vollständige Elimination wäre ein eigenständiger, mehrwöchiger Refactor-Task, kein Bestandteil einer Sicherheitshärtungsrunde. **Top 15 %** ist der ehrliche, maximal erreichbare Wert für den vollständigen LLM-Scope dieser Runde.

---

## 8 — Verwandte Artefakte

| Bedarf                                                    | Datei                                                                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Archivierte Runde-1-Planungsdatei                         | [`docs/archive/t_security_hardening_01_csp_script_hardening.md`](../../../../docs/archive/t_security_hardening_01_csp_script_hardening.md) |
| CSP-Direktiven-Quelle (wird in L1/L3 geändert)            | [`src/proxy.ts`](../../../../src/proxy.ts)                                                                                                 |
| Bestehender Nonce-Test                                    | [`src/lib/security/__tests__/csp-nonce.test.ts`](../../../../src/lib/security/__tests__/csp-nonce.test.ts)                                 |
| Header-Test (wird in L2 erweitert)                        | [`src/lib/security/__tests__/proxy-security-headers.test.ts`](../../../../src/lib/security/__tests__/proxy-security-headers.test.ts)       |
| Referenzmuster für L4 (Baseline-Tracking)                 | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) (L2, Moderate-Severity-Aging)                               |
| CSP-Violation-Reporting (verzahnte, aber getrennte Säule) | [`06_csp_violation_reporting.md`](./06_csp_violation_reporting.md)                                                                         |
| Übersicht (alle 10 Säulen)                                | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                             |

---

## 9 — Ausführungsergebnis (2026-09-12, Branch `hardening-csp-script`)

**Alle 5 Meilensteine umgesetzt:**

- **L1:** `src/proxy.ts` — CSP um `base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests;` ergänzt (nach `frame-ancestors 'none'`), mit Begründungs-Kommentar (OWASP-Explizit-Empfehlung, Tiefenverteidigung gegen künftige `default-src`-Regression).
- **L3:** `src/proxy.ts` — `script-src` um `https:`-Fallback-Token nach `'strict-dynamic'` ergänzt (CSP-Level-2-Muster; moderne Browser ignorieren den Token per Spezifikation).
- **L2:** `proxy-security-headers.test.ts` um 5 neue Testfälle erweitert: `img-src`, `font-src`, `report-uri`/`report-to`, die 4 neuen L1-Direktiven, `https:`-Fallback hinter `strict-dynamic`.
- **L4:** Neues Skript `scripts/check-inline-style-baseline.mjs` + Baseline `scripts/inline-style-baseline.json` + nicht-blockierender Schritt in `quality-ci.yml` (`continue-on-error: true`, Job-Summary-Vermerk bei Verstoß). Baseline-Verifikation lokal doppelt ausgeführt: Pass-Case (Exit 0 bei 4383) und simulierter Anstieg (Exit 1) — beide korrekt.
- **L5:** `docs/security-hardening/01_csp_script_hardening.md` §6 ergänzt — Browser-Support (alle 3 großen Engines stabil), geschätzte DOM-Sink-Stellen, 3-Stufen-Pfad (Report-Only → Beseitigen → Aktivieren). Keine Aktivierung.

**Abweichungen vom Plan (dokumentiert):**

1. **Baseline-Zahl:** Plan §3 nannte 349 Dateien/4985 Fundstellen (breiteres Grep-Muster der Recherche). Der Ausführungs-Count mit dem exakten Skript-Pattern `style={{` in `src/**/*.{ts,tsx,js,jsx}` ergab **312 Dateien/4383 Fundstellen** — die Baseline pinnt diesen nachvollziehbaren Walker-Wert (beide Zahlen nicht mischbar, im JSON notiert).
2. **Ein bestehender Test musste minimal angepasst werden:** `csp-nonce.test.ts` erwartete `'strict-dynamic'${isDev ...}` unmittelbar nebeneinander; der neue `https:`-Fallback-Token bricht diese Adjazenz. Die Assertion wurde zu `/'strict-dynamic'(?: https:)?\$\{isDev ...\}/` erweitert — die isDev-Guard-Semantik (unsafe-eval nur Development) bleibt vollständig erhalten.
3. **Plan-verlangter manueller `curl`-Check gegen eine lokale Dev-Instanz** nicht möglich (kein laufender Dev-Server, keine visuelle Prüfung) — ersetzt durch die 5 neuen Header-Assertions (L2), die die ausgelieferte CSP-Zusammensetzung pinpen.

**5-Stufen-Abschlussprüfung:** `npm run typecheck` 0 Fehler · `npm test` 1547/1547 grün (207 Dateien, inkl. 5 neuer) · `npm run lint` 0 Errors (23 vorbestehende Warnungen) · `npm run build` erfolgreich (nach Kopie der gitignored `.env.local` in den Worktree — Env-Check im prebuild) · `git status --short` nur geplante Dateien.

**Rest bei Jan (K5):** Trusted Types (Entscheidungsgrundlage §6 oben) — bewusst nicht aktiviert.
