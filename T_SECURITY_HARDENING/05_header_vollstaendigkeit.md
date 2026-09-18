# 05 — Header-Vollständigkeit (Runde 2 — Ziel Top 10 %)

> **Status:** 🟢 Ausgeführt (2026-09-07) · **Stand:** 2026-09-07 · **Owner:** LLM (100 % LLM-Zuständigkeit — die COEP-Aktivierung selbst war **explizit nicht Teil dieser Runde**, siehe §0) · **Scope:** `src/proxy.ts` (`applyBaselineSecurityHeaders()`), `src/lib/api/response.ts`, betroffene Admin-GET-Routen, `src/lib/security/__tests__/proxy-security-headers.test.ts`; **nicht** im Scope: `Cross-Origin-Embedder-Policy` selbst aktivieren (Jan/K5), CSP-Policy (Säule 1).
> **Money-Pfad:** Nein (Header/Response-Ebene, keine Wallet-Mutation) · **Security-Review:** Empfohlen bei L4 (neuer Fail-Closed-Default in der zentralen Response-Hilfsfunktion) — Review-relevanter Diff ist additiv und bricht keine bestehende Route (siehe §4 L4).

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Runde 1 (archiviert) hat COOP/CORP/21-Direktiven-Permissions-Policy und `X-Permitted-Cross-Domain-Policies` gesetzt — Top 12 % → Top 14 %.
2. **Diese Runde (Runde 2)** ist eine tiefere `casino-code-explorer`-Recherche (2026-09-06) und hat einen **echten, von COEP unabhängigen Datenleck-Gap** gefunden: mehrere Admin-GET-Routen mit sensiblen Fraud-/Promo-/Knowledge-Daten lieferten **kein** `Cache-Control: no-store` — cachebar über Browser oder zwischengeschaltete Proxies. Zusätzlich prüfte der bestehende Header-Test nur den Quellcode-Text, nicht das echte Response-Verhalten, und deckte 3 der 8 gesetzten Header gar nicht ab.
3. **Alle 6 Meilensteine dieser Datei sind jetzt ausgeführt** (siehe §1, §4) — inklusive einer eigenständigen `casino-code-explorer`-Ausführungsrecherche (2026-09-07), die die Planungsannahmen aus §3 vor der Umsetzung erneut gegen den Code verifiziert hat.
4. **Wichtiger Fund für Jans künftige COEP-Entscheidung (nicht Teil dieser Runde, aber als Entscheidungsgrundlage dokumentiert):** Die verifizierten Cross-Origin-Bildquellen (`api.dicebear.com`, `cryptologos.cc`, `www.gstatic.com`) laufen über einfache `<img>`-Tags ohne Credentials — `Cross-Origin-Embedder-Policy: credentialless` (statt `require-corp`) entkräftet das ursprüngliche Blocker-Argument (Drittanbieter müsste `Cross-Origin-Resource-Policy` mitbringen), da `credentialless` No-Cors-Ressourcen ohne diesen Header zulässt. Browser-Support ist breit (Chrome/Edge seit 2021, Firefox seit 2023, Safari seit März 2024). Vollständig ausgearbeitet in [`docs/security-hardening/02_security_headers.md`](../docs/security-hardening/02_security_headers.md) §6 (L6). **Keine Umsetzung hier — nur Entscheidungsgrundlage für Jan.**

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                                    | Scope (Dateien)                                                                                 |          Status          | Zuständigkeit | Verifikation                                                                                 |
| --- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | :----------------------: | :-----------: | -------------------------------------------------------------------------------------------- |
| L1  | `Cache-Control: no-store` auf sensiblen Admin-GET-Routen ergänzen              | `admin/fraud`, `admin/promo-codes`, `admin/knowledge`, `admin/evals`, `admin/job-health` Routen | 🟢 executed (2026-09-07) |      LLM      | Alle 5 Routen liefern `Cache-Control: private, no-store`                                     |
| L2  | Snapshot-Test um 3 ungetestete Header erweitern                                | `src/lib/security/__tests__/proxy-security-headers.test.ts`                                     | 🟢 executed (2026-09-07) |      LLM      | COOP/CORP/X-Permitted-Cross-Domain-Policies jetzt regressionsgeschützt                       |
| L3  | Runtime-Response-Test statt reinem Source-String-Match                         | dito                                                                                            | 🟢 executed (2026-09-07) |      LLM      | Test prüft echtes `Response`-Objekt, nicht nur Quellcode-Text                                |
| L4  | `Cache-Control`-Fail-Closed-Default in `apiSuccessResponse`/`apiErrorResponse` | `src/lib/api/response.ts`                                                                       | 🟢 executed (2026-09-07) |      LLM      | Neue Route ohne explizites Cache-Control ist automatisch `no-store`                          |
| L5  | Automatisierter Live-Header-Check (periodisch, informativ)                     | Neuer Workflow-Schritt                                                                          | 🟢 executed (2026-09-07) |      LLM      | Job-Summary zeigt aktuellen Header-Stand gegen Produktion                                    |
| L6  | COEP-`credentialless`-Entscheidungsgrundlage dokumentieren                     | `docs/security-hardening/02_security_headers.md`                                                | 🟢 executed (2026-09-07) |      LLM      | Jan kann die K5-Entscheidung mit vollständigem Kontext treffen, ohne selbst zu recherchieren |

**Warum kein Jan-Gate:** Alle 6 Meilensteine sind additive Header-/Test-/Doku-Ergänzungen ohne Aktivierung von COEP selbst.

---

## 2 — Header-Vollständigkeit in Subkategorien: Neubewertung (2026-09-06, Baseline für diese Runde)

|  #  | Subkategorie                                                     | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                                |
| :-: | ---------------------------------------------------------------- | :---------------: | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | COOP/CORP gesetzt                                                |     Top 10 %      |   🟢   | Unverändert solide                                                                                                                                                        |
|  2  | Permissions-Policy (21 Direktiven)                               |     Top 10 %      |   🟢   | Unverändert solide                                                                                                                                                        |
|  3  | `X-Permitted-Cross-Domain-Policies`                              |     Top 10 %      |   🟢   | Runde 1 ergänzt                                                                                                                                                           |
|  4  | **`Cache-Control` auf sensiblen Admin-Routen**                   |     Top 45 %      |   🟢   | Geschlossen durch L1 — `admin/fraud`, `admin/promo-codes`, `admin/knowledge`, `admin/evals`, `admin/job-health` liefern jetzt `Cache-Control: private, no-store`          |
|  5  | **Testabdeckung (3 von 8 Headern ungetestet)**                   |     Top 35 %      |   🟢   | Geschlossen durch L2 — COOP, CORP, X-Permitted-Cross-Domain-Policies jetzt in `proxy-security-headers.test.ts` abgedeckt                                                  |
|  6  | **Testmethodik (Source-String statt Runtime)**                   |     Top 40 %      |   🟢   | Geschlossen durch L3 — neuer Runtime-Testblock ruft `applyBaselineSecurityHeaders()` gegen ein echtes `NextResponse` auf                                                  |
|  7  | **`Cache-Control`-Default (Pro-Route-Opt-in statt Fail-Closed)** |     Top 45 %      |   🟢   | Geschlossen durch L4 — `apiSuccessResponse`/`apiErrorResponse` setzen jetzt standardmäßig `Cache-Control: private, no-store`, überschreibbar für bewusst cachebare Routen |
|  8  | **Live-Header-Check-Automatisierung**                            |     Top 40 %      |   🟢   | Geschlossen durch L5 — `.github/workflows/security-headers-drift-check.yml` (wöchentlich, `workflow_dispatch`, nicht-blockierend)                                         |
|  9  | COEP-Entscheidungsreife                                          |     Top 30 %      |   🟡   | Weiterhin offen (Jan/K5) — durch L6 jetzt vollständig recherchiert dokumentiert, Aktivierung selbst bewusst nicht Teil dieser Runde                                       |
| 10  | Keine Header-Duplikation/-Konflikt (`next.config.ts`)            |     Top 10 %      |   🟢   | Verifiziert: kein paralleler `headers()`-Mechanismus in `next.config.ts`, `src/proxy.ts` ist alleinige Quelle                                                             |

**Rechnerischer Schnitt (nach Ausführung):** (10+10+10+12+10+15+12+15+25+10)/10 = **Top 12,9 %** (gerundet **Top 13 %**) — siehe §7 für die Herleitung je Subkategorie.

---

## 3 — Verifizierter Ist-Stand (casino-code-explorer-Recherche, 2026-09-06, vor Ausführung)

**`applyBaselineSecurityHeaders()`** (`src/proxy.ts:74-100`, vollständig gelesen): `X-DNS-Prefetch-Control`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `X-Permitted-Cross-Domain-Policies`, `Permissions-Policy` (21 Direktiven). `Content-Security-Policy` + `Reporting-Endpoints` werden separat im Hauptpfad gesetzt (Zeilen 237-238).

**Cache-Control-Lücke bestätigt:** `src/lib/api/response.ts:16-30` (`apiSuccessResponse`) und `:32-67` (`apiErrorResponse`) setzten keinen Default. Bereits korrekt: `admin/users`, `admin/overview`, `admin/analytics`, `admin/games` (`'Cache-Control': 'private, no-store'`). **War offen, jetzt durch L1 geschlossen:** `admin/fraud/route.ts:103`, `admin/promo-codes/route.ts` (GET, Zeile 35 ff.), `admin/knowledge/route.ts`, `admin/evals/route.ts`, `admin/job-health/route.ts`.

**Testdatei bestätigt:** `src/lib/security/__tests__/proxy-security-headers.test.ts:16-26` prüfte nur `X-DNS-Prefetch-Control`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy` — per `readFileSync` + `.toContain(...)`, kein echter Response-Objekt-Test.

**`Clear-Site-Data` bei Logout geprüft und bewusst nicht als Meilenstein aufgenommen:** Logout läuft rein clientseitig über `supabase.auth.signOut()` (`SupabaseSessionProvider.tsx`, `MainHeader.tsx`, `AdminLayout.tsx`) — es gibt keine eigene Server-Route `/api/auth/logout`, an deren Response man den Header hängen könnte. Eine Nachrüstung würde eine neue Route-Architektur erfordern, kein reiner Header-Zusatz — außerhalb des Scopes dieser Runde (YAGNI, kein bekannter Session-Fixation-Vorfall, der das rechtfertigt).

**`X-XSS-Protection`/`Origin-Agent-Cluster` geprüft, bewusst nicht ergänzt:** Ersteres veraltet und von CSP abgelöst (korrektes Weglassen, kein Fund); zweiteres adressiert kein konkretes Risiko in diesem Repo (niedrige Priorität, YAGNI).

**Korrektur zur ursprünglichen Planung (Ausführungsrecherche 2026-09-07):** Die ursprüngliche Annahme in §0 Punkt 4 nannte vier Bildquellen inklusive `ui-avatars.com`. Bei der Ausführungsrecherche fand sich `ui-avatars.com` nicht mehr im Code (`grep -r "ui-avatars.com" src/` → 0 Treffer) — vermutlich seit der Planungsrecherche entfernt oder ersetzt. L6 dokumentiert daher nur die drei tatsächlich verifizierten Quellen (`api.dicebear.com`, `cryptologos.cc`, `www.gstatic.com`); die Kernaussage (alle Quellen sind einfache `<img>`-Tags ohne Credentials, `credentialless` entkräftet den `require-corp`-Blocker) bleibt unverändert gültig.

---

## 4 — Meilensteine

### L1 — `Cache-Control: no-store` auf sensiblen Admin-GET-Routen ergänzen ✅

- **Ausgeführt:** `admin/fraud/route.ts`, `admin/promo-codes/route.ts`, `admin/knowledge/route.ts`, `admin/evals/route.ts`, `admin/job-health/route.ts` setzen jeweils `'Cache-Control': 'private, no-store'` explizit im Response-Header — exakt das etablierte Muster aus `admin/users`/`admin/overview` übernommen.
- **Verifizierung:** `npm test` grün (bestehende Admin-Route-Tests unverändert grün); die Header sind zusätzlich durch den L4-Fail-Closed-Default in `response.ts` doppelt abgesichert (explizit gesetzt + Default greift ohnehin).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (additive Header-Ergänzung, bereits etabliertes Muster).

### L2 — Snapshot-Test um 3 ungetestete Header erweitern ✅

- **Ausgeführt:** `proxy-security-headers.test.ts` um Assertions für `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, `X-Permitted-Cross-Domain-Policies: none` ergänzt (Source-String-Match, wie die bestehenden Assertions).
- **Verifizierung:** `npm test` — 3 neue Assertions grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — Runtime-Response-Test statt reinem Source-String-Match ✅

- **Ausgeführt:** `applyBaselineSecurityHeaders()` in `src/proxy.ts` als `export function` freigegeben und in einem neuen `describe`-Block direkt mit einem echten `NextResponse.next()`-Objekt aufgerufen; jeder Header-Wert wird per `response.headers.get('...')` geprüft, inklusive eines zweiten Tests, der bestätigt, dass die Funktion dieselbe Instanz zurückgibt (in-place mutation). Bestehende String-Match-Tests bleiben parallel bestehen (Doppelabsicherung).
- **Verifizierung:** `npm test` — neue Runtime-Assertions grün, unabhängig vom exakten Quellcode-Wortlaut.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — `Cache-Control`-Fail-Closed-Default in der zentralen Response-Hilfsfunktion ✅

- **Ausgeführt:** `apiSuccessResponse`/`apiErrorResponse` (`src/lib/api/response.ts`) setzen jetzt `if (!headers.has('cache-control')) headers.set('Cache-Control', 'private, no-store')` — überschreibbar für Routen, die bewusst cachebare Antworten liefern (per `init.headers`).
- **Verifizierung:** `npm test` — alle bestehenden API-Route-Tests bleiben grün, zwei neue Tests je Funktion (Default-Fall + Override-Fall) grün; `npm run build` erfolgreich.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Empfohlen und durchgeführt — globaler Default-Wechsel in einer zentralen, breit genutzten Hilfsfunktion; geprüft, dass kein bewusst cachebarer Response unbeabsichtigt bricht (kein bestehender Aufrufer verlässt sich auf einen impliziten cachebaren Default, alle bisherigen Cache-Control-Setter waren bereits explizit).

### L5 — Automatisierter Live-Header-Check (periodisch, informativ) ✅

- **Ausgeführt:** Neuer Workflow `.github/workflows/security-headers-drift-check.yml` (Muster: `migration-drift-check.yml` — `cron` montags 06:23 UTC + `workflow_dispatch`, Node-Inline-Script). `curl`/`fetch` gegen die `PRODUCTION_URL`-Repository-Variable, vergleicht COOP, CORP, Permissions-Policy-Präfix, `X-Permitted-Cross-Domain-Policies`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` gegen den erwarteten Wert, schreibt Abweichungen in `$GITHUB_STEP_SUMMARY`. Läuft mit sichtbarem Skip-Hinweis durch, wenn `PRODUCTION_URL` nicht gesetzt ist (keine geratene Domain hartkodiert). Bewusst nicht blockierend (kein PR-Gate).
- **Verifizierung:** Workflow-Syntax lokal geprüft; ein `workflow_dispatch`-Testlauf gegen die echte Produktions-URL steht noch aus (erfordert die Repository-Variable `PRODUCTION_URL`, die Jan einmalig anlegen muss).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L6 — COEP-`credentialless`-Entscheidungsgrundlage dokumentieren ✅

- **Ausgeführt:** In [`docs/security-hardening/02_security_headers.md`](../docs/security-hardening/02_security_headers.md) neuer Abschnitt „6 — COEP-`credentialless`-Entscheidungsgrundlage" ergänzt: `credentialless`-vs-`require-corp`-Recherche, Browser-Support-Stand, konkrete Fundstellen der verifizierten Bildquellen (siehe §3 Korrektur — drei statt vier Quellen, `ui-avatars.com` nicht mehr im Code gefunden) sowie offene Fragen, die bei Jan bleiben (Nutzen von `crossOriginIsolated`, künftige Cross-Origin-Ressourcen, die Aktivierung selbst).
- **Verifizierung:** Dokumentation liest sich als vollständige Entscheidungsgrundlage — keine offene Recherchefrage mehr für Jan.
- **Freigabe-Gate:** Keines (reine Doku, keine Aktivierung). **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. ✅ Alle bekannten sensiblen Admin-GET-Routen liefern `Cache-Control: no-store` (L1).
2. ✅ Alle 8 gesetzten Header haben einen Regressionsschutz (L2, L3).
3. ✅ Neue Routen können den `Cache-Control`-Header nicht mehr versehentlich vergessen (L4).
4. ✅ Live-Header-Stand wird periodisch automatisch verifiziert, nicht nur einmalig manuell (L5) — erster echter `workflow_dispatch`-Lauf steht aus (benötigt `PRODUCTION_URL`-Variable).
5. ✅ Jans COEP-Entscheidung ist vollständig informiert vorbereitet, ohne dass die Aktivierung selbst vorweggenommen wird (L6).

---

## 6 — Selbstprüfung vor `Execution-Ready` (Planung, 2026-09-06)

- [x] Scope abgegrenzt: nur Header-Vollständigkeit und die davon abhängige Response-Hilfsfunktion, nicht CSP-Policy selbst (Säule 1).
- [x] Alle 6 Meilensteine ausschließlich LLM-Zuständigkeit — COEP wird nicht aktiviert, nur vorbereitet.
- [x] Recherche durch `casino-code-explorer` fundiert (Datei-/Zeilenreferenzen in §3).
- [x] Ehrlichkeits-Check: Baseline dieser Runde (Top 28 %) ist deutlich schlechter als der Runde-1-Wert (Top 14 %) — durch einen echten, unabhängigen Cache-Control-Fund erklärt, nicht beschönigt.
- [x] Money-Pfad korrekt „Nein" — reine Header-/Test-Ebene, keine Wallet-Mutation.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

## 6a — Selbstprüfung nach Ausführung (2026-09-07)

- [x] Alle 6 Meilensteine (L1-L6) umgesetzt und einzeln verifiziert (siehe §4).
- [x] 5-Stufen-Abschlussprüfung (`typecheck`, `test`, `lint`, `build`, `git status`) grün — siehe Übergabebericht dieser Ausführungsrunde.
- [x] Stale Planungsannahme (`ui-avatars.com`) korrigiert statt unreflektiert übernommen (§3 Korrektur).
- [x] L5-Workflow bewusst nicht-blockierend gehalten — kein neues PR-Gate ohne Jan-Freigabe eingeführt.
- [x] L6 nimmt die COEP-Aktivierung selbst nicht vorweg — reine Dokumentation.

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

| Bedarf                                              | Datei                                                                                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei                   | [`docs/archive/t_security_hardening_05_header_vollstaendigkeit.md`](../docs/archive/t_security_hardening_05_header_vollstaendigkeit.md) |
| Technischer Deep-Dive inkl. L6-COEP-Abschnitt       | [`docs/security-hardening/02_security_headers.md`](../docs/security-hardening/02_security_headers.md)                                   |
| Zentrale Response-Hilfsfunktion (durch L4 geändert) | [`src/lib/api/response.ts`](../src/lib/api/response.ts)                                                                                 |
| Bestehender Header-Test (durch L2/L3 erweitert)     | [`src/lib/security/__tests__/proxy-security-headers.test.ts`](../src/lib/security/__tests__/proxy-security-headers.test.ts)             |
| Neuer Live-Check-Workflow (L5)                      | [`.github/workflows/security-headers-drift-check.yml`](../.github/workflows/security-headers-drift-check.yml)                           |
| Referenzmuster für L5 (Schedule + Summary)          | [`.github/workflows/migration-drift-check.yml`](../.github/workflows/migration-drift-check.yml)                                         |
| Übersicht (alle 4 Säulen dieser Runde)              | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                          |

---

## 9 — Ausführungsstatus & Runde-3-Prüfung (2026-09-12, Merge nachgezogen 2026-09-18)

**Ausführungsstatus:** Alle 6 Meilensteine (L1-L6) sind auf dem verifizierten Merge-Stand `security-hardening-round2-merge` vollständig umgesetzt (Commit `302a988`, alle L-Zeilen zeigen `🟢 executed (2026-09-07)`). Der Merge-Branch wurde am 2026-09-18 in `codex/uncommitted-cohort-review` gemergt — dieser Status-Header ist damit nachgezogen und final.

**Runde-3-Prüfung:** Auf Basis des tatsächlich ausgeführten Merge-Stands geprüft: Kein neuer, bisher unentdeckter Fund über die bereits bekannte COEP-Aktivierungs-Grenze (#9, K5) hinaus. Die übrigen 9 Subkategorien liegen bereits bei Top 10-15 % (§7-Projektion). Eine weitere Härtungsrunde würde nur Bruchteile eines Prozentpunkts bewegen. **Bewusst keine Runde 3.** Nächster fälliger Check: sobald Jan die COEP-`credentialless`-Entscheidung trifft (per L6 bereits vollständig vorbereitet) oder bei einer neuen, bisher unentdeckten Admin-Route ohne `Cache-Control`.
