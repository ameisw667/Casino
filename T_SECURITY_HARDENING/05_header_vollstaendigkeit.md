# 05 — Header-Vollständigkeit (Runde 2 — Ziel Top 10 %)

> **Status:** 🟡 Execution-Ready · **Stand:** 2026-09-06 · **Owner:** LLM (100 % LLM-Zuständigkeit — die COEP-Aktivierung selbst ist **explizit nicht Teil dieser Runde**, siehe §0) · **Scope:** `src/proxy.ts` (`applyBaselineSecurityHeaders()`), `src/lib/api/response.ts`, betroffene Admin-GET-Routen, `src/lib/security/__tests__/proxy-security-headers.test.ts`; **nicht** im Scope: `Cross-Origin-Embedder-Policy` selbst aktivieren (Jan/K5), CSP-Policy (Säule 1).
> **Money-Pfad:** Nein (Header/Response-Ebene, keine Wallet-Mutation) · **Security-Review:** Empfohlen bei L4 (neuer Fail-Closed-Default in der zentralen Response-Hilfsfunktion)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Runde 1 ([archiviert](../docs/archive/t_security_hardening_05_header_vollstaendigkeit.md)) hat COOP/CORP/21-Direktiven-Permissions-Policy und `X-Permitted-Cross-Domain-Policies` gesetzt — Top 12 % → Top 14 %.
2. **Diese Runde (Runde 2)** ist eine tiefere `casino-code-explorer`-Recherche (2026-09-06) und hat einen **echten, von COEP unabhängigen Datenleck-Gap** gefunden: mehrere Admin-GET-Routen mit sensiblen Fraud-/Promo-/Knowledge-Daten liefern **kein** `Cache-Control: no-store` — cachebar über Browser oder zwischengeschaltete Proxies. Zusätzlich: der bestehende Header-Test prüft nur den Quellcode-Text, nicht das echte Response-Verhalten, und deckt 3 der 8 gesetzten Header gar nicht ab.
3. **Diese Datei ist reine Planung, keine Ausführung** (Jan-Auftrag 2026-09-06).
4. **Wichtiger Fund für Jans künftige COEP-Entscheidung (nicht Teil dieser Runde, aber als Entscheidungsgrundlage dokumentiert):** Alle vier Cross-Origin-Bildquellen (`ui-avatars.com`, `api.dicebear.com`, `www.gstatic.com`, `cryptologos.cc`) laufen über einfache `<img>`-Tags ohne Credentials — `Cross-Origin-Embedder-Policy: credentialless` (statt `require-corp`) würde das ursprüngliche Blocker-Argument (Drittanbieter müsste `Cross-Origin-Resource-Policy` mitbringen) wahrscheinlich entkräften, da `credentialless` No-Cors-Ressourcen ohne diesen Header zulässt. Browser-Support 2026 ist breit (Chrome/Edge seit 2021, Firefox seit 2023, Safari seit März 2024). **Keine Umsetzung hier — nur Entscheidungsgrundlage für Jan.**

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                                    | Scope (Dateien)                                                                                 |   Status   | Zuständigkeit | Verifikation                                                                                 |
| --- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | :--------: | :-----------: | -------------------------------------------------------------------------------------------- |
| L1  | `Cache-Control: no-store` auf sensiblen Admin-GET-Routen ergänzen              | `admin/fraud`, `admin/promo-codes`, `admin/knowledge`, `admin/evals`, `admin/job-health` Routen | 🔴 Geplant |      LLM      | Alle 5 Routen liefern `Cache-Control: private, no-store`                                     |
| L2  | Snapshot-Test um 3 ungetestete Header erweitern                                | `src/lib/security/__tests__/proxy-security-headers.test.ts`                                     | 🔴 Geplant |      LLM      | COOP/CORP/X-Permitted-Cross-Domain-Policies jetzt regressionsgeschützt                       |
| L3  | Runtime-Response-Test statt reinem Source-String-Match                         | dito                                                                                            | 🔴 Geplant |      LLM      | Test prüft echtes `Response`-Objekt, nicht nur Quellcode-Text                                |
| L4  | `Cache-Control`-Fail-Closed-Default in `apiSuccessResponse`/`apiErrorResponse` | `src/lib/api/response.ts`                                                                       | 🔴 Geplant |      LLM      | Neue Route ohne explizites Cache-Control ist automatisch `no-store`                          |
| L5  | Automatisierter Live-Header-Check (periodisch, informativ)                     | Neuer Workflow-Schritt                                                                          | 🔴 Geplant |      LLM      | Job-Summary zeigt aktuellen Header-Stand gegen Produktion                                    |
| L6  | COEP-`credentialless`-Entscheidungsgrundlage dokumentieren                     | `docs/security-hardening/02_security_headers.md`                                                | 🔴 Geplant |      LLM      | Jan kann die K5-Entscheidung mit vollständigem Kontext treffen, ohne selbst zu recherchieren |

**Warum kein Jan-Gate:** Alle 6 Meilensteine sind additive Header-/Test-/Doku-Ergänzungen ohne Aktivierung von COEP selbst.

---

## 2 — Header-Vollständigkeit in Subkategorien: Neubewertung (2026-09-06, Baseline für diese Runde)

|  #  | Subkategorie                                                     | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                                                                                                                                                      |
| :-: | ---------------------------------------------------------------- | :---------------: | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | COOP/CORP gesetzt                                                |     Top 10 %      |   🟢   | Unverändert solide                                                                                                                                                                                                                                                                              |
|  2  | Permissions-Policy (21 Direktiven)                               |     Top 10 %      |   🟢   | Unverändert solide                                                                                                                                                                                                                                                                              |
|  3  | `X-Permitted-Cross-Domain-Policies`                              |     Top 10 %      |   🟢   | Runde 1 ergänzt                                                                                                                                                                                                                                                                                 |
|  4  | **`Cache-Control` auf sensiblen Admin-Routen**                   |     Top 45 %      |   🟠   | `admin/fraud/route.ts:103`, `admin/promo-codes`, `admin/knowledge`, `admin/evals`, `admin/job-health` liefern Fraud-/Promo-/Knowledge-Daten ohne `no-store` — Cache-Leck-Risiko, unabhängig von COEP. Vorbild existiert bereits im selben Repo (`admin/users`, `admin/overview` haben es schon) |
|  5  | **Testabdeckung (3 von 8 Headern ungetestet)**                   |     Top 35 %      |   🟠   | `COOP`, `CORP`, `X-Permitted-Cross-Domain-Policies` fehlen in `proxy-security-headers.test.ts:16-26`, obwohl live gesetzt — kein Regressionsschutz                                                                                                                                              |
|  6  | **Testmethodik (Source-String statt Runtime)**                   |     Top 40 %      |   🟠   | Bestehender Test prüft `readFileSync('src/proxy.ts').toContain(...)`, nicht das echte `Response`-Objekt — ein Refactor, der den String ändert, aber das Verhalten beibehält, würde fälschlich als Regression gemeldet (oder umgekehrt)                                                          |
|  7  | **`Cache-Control`-Default (Pro-Route-Opt-in statt Fail-Closed)** |     Top 45 %      |   🟠   | `src/lib/api/response.ts:16-30,32-67` (`apiSuccessResponse`/`apiErrorResponse`) setzen standardmäßig **keinen** `Cache-Control` — jede neue Route kann den Header vergessen, strukturelle Fehlerquelle statt Einzelfund                                                                         |
|  8  | **Live-Header-Check-Automatisierung**                            |     Top 40 %      |   🟠   | Letzte Verifikation (2026-08-30) ist reiner manueller `curl`-Beleg, keine Wiederholung, kein CI-Gate                                                                                                                                                                                            |
|  9  | COEP-Entscheidungsreife                                          |     Top 30 %      |   🟡   | Weiterhin offen (Jan/K5), aber durch die `credentialless`-Recherche (§0 Punkt 4) jetzt deutlich risikoärmer einzuschätzen als zuvor angenommen                                                                                                                                                  |
| 10  | Keine Header-Duplikation/-Konflikt (`next.config.ts`)            |     Top 10 %      |   🟢   | Verifiziert: kein paralleler `headers()`-Mechanismus in `next.config.ts`, `src/proxy.ts` ist alleinige Quelle                                                                                                                                                                                   |

**Rechnerischer Schnitt (Baseline dieser Runde):** (10+10+10+45+35+40+45+40+30+10)/10 = **Top 27,5 %** (gerundet Top 28 %) — schlechter als der Runde-1-Wert (Top 14 %), weil die tiefere Recherche einen echten, unabhängigen Datenleck-Gap (Cache-Control) und zwei Testabdeckungs-Lücken gefunden hat, die zuvor nicht bewertet waren.

---

## 3 — Verifizierter Ist-Stand (casino-code-explorer-Recherche, 2026-09-06)

**`applyBaselineSecurityHeaders()`** (`src/proxy.ts:74-100`, vollständig gelesen): `X-DNS-Prefetch-Control`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `X-Permitted-Cross-Domain-Policies`, `Permissions-Policy` (21 Direktiven). `Content-Security-Policy` + `Reporting-Endpoints` werden separat im Hauptpfad gesetzt (Zeilen 237-238).

**Cache-Control-Lücke bestätigt:** `src/lib/api/response.ts:16-30` (`apiSuccessResponse`) und `:32-67` (`apiErrorResponse`) setzen keinen Default. Bereits korrekt: `admin/users`, `admin/overview`, `admin/analytics`, `admin/games` (`'Cache-Control': 'private, no-store'`). **Noch offen:** `admin/fraud/route.ts:103`, `admin/promo-codes/route.ts` (GET, Zeile 35 ff.), `admin/knowledge/route.ts`, `admin/evals/route.ts`, `admin/job-health/route.ts`.

**Testdatei bestätigt:** `src/lib/security/__tests__/proxy-security-headers.test.ts:16-26` prüft nur `X-DNS-Prefetch-Control`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy` — per `readFileSync` + `.toContain(...)`, kein echter Response-Objekt-Test.

**`Clear-Site-Data` bei Logout geprüft und bewusst nicht als Meilenstein aufgenommen:** Logout läuft rein clientseitig über `supabase.auth.signOut()` (`SupabaseSessionProvider.tsx`, `MainHeader.tsx`, `AdminLayout.tsx`) — es gibt keine eigene Server-Route `/api/auth/logout`, an deren Response man den Header hängen könnte. Eine Nachrüstung würde eine neue Route-Architektur erfordern, kein reiner Header-Zusatz — außerhalb des Scopes dieser Runde (YAGNI, kein bekannter Session-Fixation-Vorfall, der das rechtfertigt).

**`X-XSS-Protection`/`Origin-Agent-Cluster` geprüft, bewusst nicht ergänzt:** Ersteres veraltet und von CSP abgelöst (korrektes Weglassen, kein Fund); zweiteres adressiert kein konkretes Risiko in diesem Repo (niedrige Priorität, YAGNI).

---

## 4 — Meilensteine

### L1 — `Cache-Control: no-store` auf sensiblen Admin-GET-Routen ergänzen

- **Ziel:** Die in §2 #4 benannte Lücke schließen.
- **Schritte:** In `admin/fraud/route.ts`, `admin/promo-codes/route.ts`, `admin/knowledge/route.ts`, `admin/evals/route.ts`, `admin/job-health/route.ts` jeweils `'Cache-Control': 'private, no-store'` im Response-Header ergänzen — exakt das bereits etablierte Muster aus `admin/users`/`admin/overview` übernehmen, nicht neu erfinden.
- **Verifizierung:** `npm test` (bestehende Admin-Route-Tests bleiben grün), manueller `curl`-Check gegen eine lokale Dev-Instanz zeigt den Header.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (additive Header-Ergänzung, bereits etabliertes Muster).

### L2 — Snapshot-Test um 3 ungetestete Header erweitern

- **Ziel:** Die in §2 #5 benannte Lücke schließen.
- **Schritte:** `proxy-security-headers.test.ts` um Assertions für `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, `X-Permitted-Cross-Domain-Policies: none` ergänzen — gleiches Source-String-Match-Muster wie die bestehenden Assertions (wird in L3 grundlegend verbessert, hier erstmal nur Abdeckung schließen).
- **Verifizierung:** `npm test` — 3 neue Assertions grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — Runtime-Response-Test statt reinem Source-String-Match

- **Ziel:** Die in §2 #6 benannte methodische Schwäche beheben.
- **Schritte:** `applyBaselineSecurityHeaders()` ist bereits eine isoliert importierbare Funktion (nimmt ein `NextResponse` entgegen, gibt es zurück) — direkt in einem neuen Testblock mit einem echten `NextResponse.next()`-Objekt aufrufen und `response.headers.get('...')` gegen die erwarteten Werte prüfen, statt Quellcode-Text zu parsen. Bestehende String-Match-Tests aus L2 können parallel bleiben (Doppelabsicherung) oder migriert werden — Entscheidung beim Ausführen anhand des tatsächlichen Diffs treffen.
- **Verifizierung:** `npm test` — neue Runtime-Assertions grün, unabhängig vom exakten Quellcode-Wortlaut.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — `Cache-Control`-Fail-Closed-Default in der zentralen Response-Hilfsfunktion

- **Ziel:** Die in §2 #7 benannte strukturelle Lücke schließen — nicht nur den aktuellen Bestand flicken (L1), sondern die Fehlerklasse für künftige neue Routen verhindern.
- **Schritte:** `apiSuccessResponse`/`apiErrorResponse` (`src/lib/api/response.ts:16-30,32-67`) um einen Default-`Cache-Control: private, no-store` ergänzen, **überschreibbar** für die wenigen Routen, die bewusst cachebare Antworten liefern (z. B. öffentliche, nicht-sensible Reads — falls vorhanden, beim Ausführen gegen den echten Routenbestand prüfen, welche das sind, bevor der Default global greift).
- **Verifizierung:** `npm test` — alle bestehenden API-Route-Tests bleiben grün (kein bewusst cachebarer Response bricht); `npm run build` erfolgreich.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Empfohlen (globaler Default-Wechsel in einer zentralen, breit genutzten Hilfsfunktion — einmalige Prüfung, dass keine bewusst cachebare Route unbeabsichtigt bricht).

### L5 — Automatisierter Live-Header-Check (periodisch, informativ)

- **Ziel:** Die in §2 #8 benannte Lücke schließen — Verifikation nicht mehr nur einmalig-manuell.
- **Schritte:** Neuer, `schedule`-getriggerter Workflow-Schritt (Muster: `migration-drift-check.yml` — `cron` + `workflow_dispatch`, Node-Inline-Script) — `curl -sI` gegen die Produktions-URL, vergleicht die kritischen Header (COOP, CORP, Permissions-Policy, X-Permitted-Cross-Domain-Policies) gegen den erwarteten Wert, schreibt Abweichungen lesbar in `$GITHUB_STEP_SUMMARY`. Bewusst nicht blockierend.
- **Verifizierung:** Ein `workflow_dispatch`-Testlauf zeigt den aktuellen Live-Header-Stand.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L6 — COEP-`credentialless`-Entscheidungsgrundlage dokumentieren

- **Ziel:** Jans künftige K5-Entscheidung beschleunigen, ohne sie hier vorwegzunehmen.
- **Schritte:** In `docs/security-hardening/02_security_headers.md` einen neuen Abschnitt ergänzen: die in §0 Punkt 4 zusammengefasste `credentialless`-vs-`require-corp`-Recherche, inkl. Browser-Support-Stand und der konkreten Fundstellen der vier Bildquellen (`HeroSection.tsx:291-307`, `HeroSectionV2.tsx:111-166`, `DailyTournamentTeaser.tsx:136`, `OnboardingFlow.tsx:245`) als reine `<img>`-Tags ohne Credentials.
- **Verifizierung:** Dokumentation liest sich als vollständige Entscheidungsgrundlage — keine offene Recherchefrage mehr für Jan.
- **Freigabe-Gate:** Keines (reine Doku, keine Aktivierung). **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. Alle bekannten sensiblen Admin-GET-Routen liefern `Cache-Control: no-store` (L1).
2. Alle 8 gesetzten Header haben einen Regressionsschutz (L2, L3).
3. Neue Routen können den `Cache-Control`-Header nicht mehr versehentlich vergessen (L4).
4. Live-Header-Stand wird periodisch automatisch verifiziert, nicht nur einmalig manuell (L5).
5. Jans COEP-Entscheidung ist vollständig informiert vorbereitet, ohne dass die Aktivierung selbst vorweggenommen wird (L6).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur Header-Vollständigkeit und die davon abhängige Response-Hilfsfunktion, nicht CSP-Policy selbst (Säule 1).
- [x] Alle 6 Meilensteine ausschließlich LLM-Zuständigkeit — COEP wird nicht aktiviert, nur vorbereitet.
- [x] Recherche durch `casino-code-explorer` fundiert (Datei-/Zeilenreferenzen in §3).
- [x] Ehrlichkeits-Check: Baseline dieser Runde (Top 28 %) ist deutlich schlechter als der Runde-1-Wert (Top 14 %) — durch einen echten, unabhängigen Cache-Control-Fund erklärt, nicht beschönigt.
- [x] Money-Pfad korrekt „Nein" — reine Header-/Test-Ebene, keine Wallet-Mutation.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 6 Meilensteine

|  #  | Subkategorie                        | Baseline | Nach Ausführung | Warum                                                    |
| :-: | ----------------------------------- | :------: | :-------------: | -------------------------------------------------------- |
|  1  | COOP/CORP                           | Top 10 % |    Top 10 %     | unverändert                                              |
|  2  | Permissions-Policy                  | Top 10 % |    Top 10 %     | unverändert                                              |
|  3  | `X-Permitted-Cross-Domain-Policies` | Top 10 % |    Top 10 %     | unverändert                                              |
|  4  | Cache-Control auf Admin-Routen      | Top 45 % |    Top 12 %     | L1                                                       |
|  5  | Testabdeckung                       | Top 35 % |    Top 10 %     | L2                                                       |
|  6  | Testmethodik                        | Top 40 % |    Top 15 %     | L3                                                       |
|  7  | Cache-Control-Default               | Top 45 % |    Top 12 %     | L4                                                       |
|  8  | Live-Check-Automatisierung          | Top 40 % |    Top 15 %     | L5                                                       |
|  9  | COEP-Entscheidungsreife             | Top 30 % |    Top 25 %     | L6 — reduziert Unsicherheit, löst COEP selbst aber nicht |
| 10  | Keine Header-Duplikation            | Top 10 % |    Top 10 %     | unverändert                                              |

**Projizierter Schnitt nach Ausführung:** (10+10+10+12+10+15+12+15+25+10)/10 = **Top 12,9 %** (gerundet **Top 13 %**).

**Ehrliche Einordnung:** Mit Top 13 % kommt diese Säule dem Top-10-%-Ziel deutlich näher als Säule 7/8, weil ihr größter verbleibender Punkt (COEP, #9) durch die `credentialless`-Recherche bereits entschärft ist — bleibt aber knapp über Top 10 %, weil COEP selbst bewusst nicht aktiviert wird. Sobald Jan die (durch L6 gut vorbereitete) Entscheidung trifft, fällt der Schnitt klar unter Top 10 %.

---

## 8 — Verwandte Artefakte

| Bedarf                                                | Datei                                                                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei                     | [`docs/archive/t_security_hardening_05_header_vollstaendigkeit.md`](../docs/archive/t_security_hardening_05_header_vollstaendigkeit.md) |
| Technischer Deep-Dive (wird in L6 erweitert)          | [`docs/security-hardening/02_security_headers.md`](../docs/security-hardening/02_security_headers.md)                                   |
| Zentrale Response-Hilfsfunktion (wird in L4 geändert) | [`src/lib/api/response.ts`](../src/lib/api/response.ts)                                                                                 |
| Bestehender Header-Test (wird in L2/L3 erweitert)     | [`src/lib/security/__tests__/proxy-security-headers.test.ts`](../src/lib/security/__tests__/proxy-security-headers.test.ts)             |
| Referenzmuster für L5 (Schedule + Summary)            | [`.github/workflows/migration-drift-check.yml`](../.github/workflows/migration-drift-check.yml)                                         |
| Übersicht (alle 4 Säulen dieser Runde)                | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                          |
