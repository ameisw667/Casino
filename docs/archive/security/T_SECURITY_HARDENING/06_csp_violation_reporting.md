# 06 — CSP-Violation-Reporting (Runde 2 — Ziel Top 10–15 %)

> **Status:** 🟢 Executed (kein Rest) · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit — **kein Jan-Gate in dieser Säule**, siehe §0) · **Scope:** `src/app/api/internal/csp-report/route.ts`, `src/lib/security/csp-report.ts` (neu), `scripts/csp-report-rate-watch.mjs` + `.github/workflows/csp-report-rate-watch.yml` (L5); **nicht** im Scope: CSP-Direktiven selbst (Säule 1), Admin-Dashboard-UI für CSP-Reports (größerer Frontend-Task, YAGNI ohne konkreten Bedarfsnachweis).
> **Money-Pfad:** Nein (Observability-/Report-Ebene) · **Security-Review:** Nein (additive Härtung einer bereits unauthentifizierten, absichtlich offenen Route)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Diese Säule hat noch keine eigene Planungsdatei — nur einen archivierten Runde-1-Stand ([`docs/archive/t_security_hardening_06_csp_violation_reporting.md`](../../../../docs/archive/t_security_hardening_06_csp_violation_reporting.md), 2026-09-06, Top 15-16 %).
2. **Frische `casino-code-explorer`-Recherche (2026-09-12)** bestätigt: Der Archiv-Stand ist **nicht veraltet** — Code und Tests sind identisch zum dokumentierten Stand. Neu entdeckt: Das IP-Rate-Limit (20 Reports/10s) läuft über verteiltes Upstash-Sliding-Window (nicht lokal-in-Memory) — robuster als angenommen, aber es fehlt ein **globaler** Request-Cap. Ein Botnet mit N verschiedenen IPs kann N×120 Sentry-Events/Minute erzeugen, ohne dass ein aggregierter Deckel greift — ein reales Denial-of-Wallet-Kostenrisiko gegen das Sentry-Kontingent, unabhängig vom bereits korrekten Per-IP-Schutz.
3. **Diese Datei ist reine Planung, keine Ausführung** (Jan-Auftrag 2026-09-12).
4. **Kein K5-Punkt in dieser Säule.**

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                            | Scope (Dateien)                                                                                 |   Status    | Zuständigkeit | Verifikation                                                                                      |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | :---------: | :-----------: | ------------------------------------------------------------------------------------------------- |
| L1  | Globaler Request-Cap gegen Denial-of-Wallet            | `src/app/api/internal/csp-report/route.ts`                                                      | 🟢 Executed |      LLM      | Ein aggregierter Deckel (120 Requests/60s über alle IPs) begrenzt den Sentry-Event-Ausstoß        |
| L2  | Deterministisches Sampling vor dem Sentry-Forward      | `src/lib/security/csp-report.ts` (neu), `route.ts`                                              | 🟢 Executed |      LLM      | Max. 30 Reports/60s ungefiltert, danach 1 von 30; aggregierter Zähler-Event pro Fenster           |
| L3  | Zod-Schemavalidierung der einzelnen Report-Felder      | `src/lib/security/csp-report.ts` (neu), `route.ts`                                              | 🟢 Executed |      LLM      | Malformed/unerwartete Felder werden vor dem Sentry-Versand strukturiert erkannt, Route bleibt 204 |
| L4  | In-Batch-Dedup nach `violated-directive`+`blocked-uri` | `src/lib/security/csp-report.ts` (neu), `route.ts`                                              | 🟢 Executed |      LLM      | Identische Verstöße innerhalb eines Batches erzeugen ein einziges Event mit Zähler                |
| L5  | Alarm bei plötzlichem Anstieg der Violation-Rate       | `scripts/csp-report-rate-watch.mjs` + `.github/workflows/csp-report-rate-watch.yml` (beide neu) | 🟢 Executed |      LLM      | >3x-Anstieg gegen rollierende 24h-Baseline wird im Job-Summary markiert (nicht blockierend)       |

**Warum kein Jan-Gate:** Alle 5 Meilensteine sind additive Härtungen einer bereits absichtlich unauthentifizierten Route, ohne neues Secret, ohne Breaking Change.

---

## 2 — CSP-Violation-Reporting in Subkategorien: Neubewertung (2026-09-12, Baseline für diese Runde)

|  #  | Subkategorie                                           | Niveau (Baseline) | Status | Kernbefund                                                                                                                                     |
| :-: | ------------------------------------------------------ | :---------------: | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Format-Parsing (Legacy + Batch)                        |     Top 10 %      |   🟢   | `route.ts:25-29` — unverändert solide                                                                                                          |
|  2  | Sentry-Weiterleitung mit korrektem Tagging             |     Top 10 %      |   🟢   | `route.ts:31-37` — `level: 'warning'`, `tags.source: 'csp-report'`                                                                             |
|  3  | Batch-Kappung (20 Reports/Request)                     |     Top 10 %      |   🟢   | `route.ts:31`                                                                                                                                  |
|  4  | Per-IP-Rate-Limit (verteilt, Upstash)                  |     Top 10 %      |   🟢   | Robuster als im Archiv angenommen — echtes Sliding-Window über Upstash, nicht lokal-in-Memory, fail-closed in Production ohne Upstash          |
|  5  | CSP-Header-Verweis stimmt exakt mit der Route überein  |     Top 10 %      |   🟢   | `src/proxy.ts:184,238` — kein Drift                                                                                                            |
|  6  | Testabdeckung (6/6 Tests)                              |     Top 10 %      |   🟢   | Alle relevanten Formate/Edge-Cases abgedeckt                                                                                                   |
|  7  | **Kein globaler Request-Cap**                          |     Top 40 %      |   🟠   | Nur Per-IP-Limit (max. 120/min pro IP) — verteiltes Botnet kann N×120 Sentry-Events/Min erzeugen, kein aggregierter Deckel                     |
|  8  | **Keine Dedup/Aggregation vor Sentry-Versand**         |     Top 35 %      |   🟡   | Jeder Report landet einzeln, kein Fingerprint/Gruppierung nach `violated-directive` — Archiv-Punkt #2/#5, weiterhin offen                      |
|  9  | **Keine Alertierung bei Anstieg der Violation-Rate**   |     Top 40 %      |   🟠   | Rein passives Sentry-Warning-Log, keine aktive Eskalation bei ungewöhnlichem Anstieg                                                           |
| 10  | **Keine Zod-Schemavalidierung + kein Sentry-Sampling** |     Top 35 %      |   🟡   | Nur strukturelle Array/Objekt-Unterscheidung, keine Feldvalidierung; kein CSP-spezifischer `sampleRate` als zweite Verteidigungslinie gegen #7 |

**Rechnerischer Schnitt (Baseline dieser Runde):** (10+10+10+10+10+10+40+35+40+35)/10 = **Top 21 %** — schlechter als der Archiv-Wert (Top 15-16 %), weil die tiefere Recherche eine reale, unabhängige Denial-of-Wallet-Lücke (#7) und drei bereits bekannte, aber weiterhin unbehobene Ausbaustufen (#8, #9, #10) zusammen jetzt gebündelt bewertet.

---

## 3 — Verifizierter Ist-Stand (casino-code-explorer-Recherche, 2026-09-12)

**`src/app/api/internal/csp-report/route.ts`** (vollständig geprüft): Format-Parsing Legacy `{csp-report: …}` und Batch-Array (Zeilen 25-29), Sentry-Weiterleitung `level: 'warning'`, `tags.source: 'csp-report'` (Zeilen 31-37), Batch-Kappung `reports.slice(0, 20)` (Zeile 31), Per-IP-Rate-Limit `enforceRateLimit(identifier, 'csp-report', 20, 10)` (Zeile 13), stiller 204-Verwurf bei Überschreitung (Zeilen 14-16).

**CSP-Header-Verweis:** `report-uri /api/internal/csp-report; report-to csp-endpoint;` (`src/proxy.ts:184`), `Reporting-Endpoints: csp-endpoint="/api/internal/csp-report"` (`src/proxy.ts:238`) — beide URLs identisch zur Route.

**Rate-Limit-Backend:** `src/lib/security/request-security.ts:199-239` — verteiltes Upstash-Sliding-Window, in Production ohne Upstash-Env fail-closed (`success: false`, Zeilen 241-250). Robuster als eine reine In-Memory-Lösung, aber ausschließlich Per-IP skaliert — kein globaler Aggregat-Zähler über alle IPs hinweg.

**Tests:** `src/lib/security/__tests__/csp-report-route.test.ts:30-89` — 6/6 grün (204-Response, Batch-Forward, Legacy-Unwrap, Malformed-JSON, Batch-Cap, Rate-Limit-Drop).

**Admin-Dashboard-Sichtbarkeit geprüft:** `grep -i csp src/app/api/admin/` → keine Treffer — CSP-Reports haben keinerlei Sichtbarkeit außerhalb von Sentry.

**Sentry-Sampling geprüft:** `sentry.server.config.ts:12`, `sentry.edge.config.ts:13` — nur globales `beforeSend` zum PII-Scrubbing, kein CSP-spezifischer `sampleRate`.

---

## 4 — Meilensteine

### L1 — Globaler Request-Cap gegen Denial-of-Wallet

- **Ziel:** Die in §2 #7 benannte Lücke schließen — ein verteiltes Botnet soll nicht durch viele verschiedene IPs den Per-IP-Schutz umgehen können.
- **Schritte:** Zusätzlich zum bestehenden Per-IP-`enforceRateLimit`-Aufruf einen zweiten, globalen Rate-Limit-Schlüssel einführen (z. B. `enforceRateLimit('global', 'csp-report-global', X, 60)` — konkreten Schwellenwert X beim Ausführen anhand realistischer Baseline-Traffic-Schätzung festlegen, z. B. 500/Minute). Bei Überschreitung weiterhin 204 (kein Fehler an den Browser, konsistent mit dem bestehenden Muster), aber kein Sentry-Forward mehr für die überschüssigen Reports.
- **Verifizierung:** `npm test` — neuer Testfall simuliert Reports von vielen unterschiedlichen IPs, bestätigt, dass der globale Cap ab einem Schwellenwert greift, auch wenn kein Einzel-IP-Limit überschritten wird.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L2 — Sentry-`sampleRate` für CSP-Reports ergänzen

- **Ziel:** Die in §2 #10 (zweiter Teil) benannte Lücke schließen — zweite Verteidigungslinie gegen Kostenrisiko, unabhängig von L1.
- **Schritte:** In `route.ts` vor dem `Sentry.captureMessage`-Aufruf eine leichte, deterministische Sampling-Logik ergänzen (z. B. nur jeden n-ten Report bei sehr hoher Rate tatsächlich an Sentry weiterleiten, restliche nur lokal zählen) — oder alternativ Sentrys eigenen `sampleRate`-Mechanismus pro Event nutzen, falls die SDK-Version das pro-Capture-Call unterstützt (beim Ausführen gegen die tatsächlich installierte `@sentry/nextjs`-Version verifizieren).
- **Verifizierung:** `npm test` — neuer Test bestätigt, dass bei simulierter hoher Rate nicht mehr jeder Report einzeln an Sentry weitergeleitet wird, aber die Gesamtzahl der Verstöße weiterhin korrekt geloggt/gezählt wird (z. B. via Structured-Log-Zähler).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — Zod-Schemavalidierung der Report-Felder

- **Ziel:** Die in §2 #10 (erster Teil) benannte Lücke schließen.
- **Schritte:** Leichtes Zod-Schema für die erwarteten CSP-Report-Felder (`violated-directive`, `blocked-uri`, `document-uri` etc., sowohl Legacy- als auch Reporting-API-Batch-Format) — bei Validierungsfehler weiterhin 204 zurückgeben (Route bleibt für den Browser immer erfolgreich), aber die fehlerhaften Felder nicht unvalidiert an Sentry weiterreichen (stattdessen ein generisches "malformed CSP report"-Warning).
- **Verifizierung:** `npm test` — bestehende 6 Tests bleiben grün, neuer Test für ein Report-Objekt mit unerwarteten/fehlenden Feldern bestätigt korrektes Fallback-Verhalten.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — Dedup/Aggregation nach `violated-directive`

- **Ziel:** Die in §2 #8 benannte, seit Archiv-Runde 1 offene Lücke schließen.
- **Schritte:** Innerhalb des bestehenden Rate-Limit-Zeitfensters (10s) identische `violated-directive`+`blocked-uri`-Kombinationen zu einem einzigen Sentry-Event mit einem Zähler-Tag aggregieren, statt N identische Events zu senden — z. B. über einen kurzlebigen In-Memory-Zähler pro Route-Invocation-Batch (kein neuer externer Speicher nötig, da die Route ohnehin bereits Batches verarbeitet).
- **Verifizierung:** `npm test` — neuer Test mit einem Batch aus mehreren identischen Reports bestätigt, dass nur ein aggregiertes Sentry-Event mit korrektem Zähler gesendet wird.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L5 — Alarm bei plötzlichem Anstieg der Violation-Rate

- **Ziel:** Die in §2 #9 benannte Lücke schließen.
- **Schritte:** Neuer, nicht-blockierender Workflow-Schritt (Muster: Moderate-Severity-Aging aus Säule 7, L2) — fragt periodisch (z. B. täglich, `schedule`-Trigger) die Sentry-API nach der Anzahl `tags.source: 'csp-report'`-Events der letzten 24h ab, vergleicht gegen eine rollierende Baseline, markiert im Job-Summary, wenn die Rate signifikant (z. B. >3x) gestiegen ist.
- **Verifizierung:** Ein Testlauf mit simulierten Sentry-API-Antworten zeigt die Eskalationsmarkierung korrekt.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (rein informativ, kein neues Blocking-Verhalten).

---

## 5 — Definition of Done

1. Ein verteiltes Botnet kann den Sentry-Kontingent-Verbrauch über CSP-Reports nicht mehr unbegrenzt skalieren (L1, L2).
2. Fehlerhafte/unerwartete Report-Felder werden strukturiert erkannt statt blind weitergeleitet (L3).
3. Identische, wiederkehrende Verstöße erzeugen nicht mehr N einzelne Sentry-Events (L4).
4. Eine ungewöhnliche Zunahme der Violation-Rate wird sichtbar, nicht nur passiv geloggt (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur die Report-Ingestion-Route, nicht die CSP-Direktiven selbst (Säule 1) oder ein neues Admin-Dashboard (YAGNI).
- [x] Alle 5 Meilensteine ausschließlich LLM-Zuständigkeit, kein neues Secret, keine Breaking Changes.
- [x] Recherche durch `casino-code-explorer` fundiert (Datei-/Zeilenreferenzen in §3), inkl. der Korrektur, dass das Rate-Limit bereits verteilt (Upstash) statt lokal läuft.
- [x] Ehrlichkeits-Check: Baseline dieser Runde (Top 21 %) ist schlechter als der Archiv-Wert — durch einen echten, unabhängigen DoW-Fund (#7) erklärt, nicht beschönigt.
- [x] Money-Pfad korrekt „Nein" — reine Observability-Ebene, keine Wallet-Berührung.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 5 Meilensteine

|  #  | Subkategorie                      | Baseline | Nach Ausführung | Warum                                          |
| :-: | --------------------------------- | :------: | :-------------: | ---------------------------------------------- |
|  1  | Format-Parsing                    | Top 10 % |    Top 10 %     | unverändert                                    |
|  2  | Sentry-Weiterleitung/Tagging      | Top 10 % |    Top 10 %     | unverändert                                    |
|  3  | Batch-Kappung                     | Top 10 % |    Top 10 %     | unverändert                                    |
|  4  | Per-IP-Rate-Limit                 | Top 10 % |    Top 10 %     | unverändert                                    |
|  5  | CSP-Header-Verweis                | Top 10 % |    Top 10 %     | unverändert                                    |
|  6  | Testabdeckung                     | Top 10 % |    Top 10 %     | unverändert (wächst mit L1-L4 automatisch mit) |
|  7  | Globaler Request-Cap              | Top 40 % |    Top 12 %     | L1                                             |
|  8  | Dedup/Aggregation                 | Top 35 % |    Top 12 %     | L4                                             |
|  9  | Alertierung bei Anstieg           | Top 40 % |    Top 15 %     | L5                                             |
| 10  | Zod-Validierung + Sentry-Sampling | Top 35 % |    Top 10 %     | L2, L3                                         |

**Projizierter Schnitt nach Ausführung:** (10+10+10+10+10+10+12+12+15+10)/10 = **Top 10,9 %** (gerundet **Top 11 %**).

**Einordnung:** Kein K5-Blocker in dieser Säule — **Top 11 %** ist nach Ausführung realistisch erreichbar, eine der besten Werte aller 10 Säulen.

---

## 8 — Verwandte Artefakte

| Bedarf                                                  | Datei                                                                                                                                                                                          |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei                       | [`docs/archive/t_security_hardening_06_csp_violation_reporting.md`](../../../../docs/archive/t_security_hardening_06_csp_violation_reporting.md)                                               |
| Report-Ingestion-Route (wird in L1-L4 geändert)         | [`src/app/api/internal/csp-report/route.ts`](../../../../src/app/api/internal/csp-report/route.ts)                                                                                             |
| Verarbeitungslogik (neu, L2-L4)                         | [`src/lib/security/csp-report.ts`](../../../../src/lib/security/csp-report.ts)                                                                                                                 |
| Rate-Limit-Kernlogik (Referenz für L1)                  | [`src/lib/security/request-security.ts`](../../../../src/lib/security/request-security.ts)                                                                                                     |
| Sentry-Konfiguration (bewusst unverändert, siehe §9)    | [`sentry.server.config.ts`](../../../../sentry.server.config.ts), [`sentry.edge.config.ts`](../../../../sentry.edge.config.ts)                                                                 |
| L5-Workflow + Rate-Watch-Script                         | [`scripts/csp-report-rate-watch.mjs`](../../../../scripts/csp-report-rate-watch.mjs), [`.github/workflows/csp-report-rate-watch.yml`](../../../../.github/workflows/csp-report-rate-watch.yml) |
| Referenzmuster für L5 (Baseline/Schedule-Job-Summary)   | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) (L2)                                                                                                            |
| Verzahnte, aber getrennte Säule (CSP-Direktiven selbst) | [`01_csp_script_hardening.md`](./01_csp_script_hardening.md)                                                                                                                                   |
| Übersicht (alle 10 Säulen)                              | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                                                                                 |

---

## 9 — Ausführungsergebnis (2026-09-12, Worktree `hardening-csp-reporting`, Basis 8863b64)

Alle 5 Meilensteine umgesetzt. **Wichtige reale Erkenntnis bei L2:** die installierte `@sentry/nextjs`-Version (10.70.0) hat keinen pro-Capture-Sampling-Hook — das Sampling wurde daher wie im Plan vorgesehen **deterministisch in der Route selbst** implementiert (`src/lib/security/csp-report.ts`, `getCspReportSampler()`), **nicht** in `sentry.server.config.ts`/`sentry.edge.config.ts`. Diese beiden Config-Dateien blieben unverändert.

**Neue Dateien:** `src/lib/security/csp-report.ts` (Schemas, Normalisierung, Aggregation, Sampler — aus der Route ausgelagert, um Transport-unabhängig unit-testbar zu sein), `src/lib/security/__tests__/csp-report-processing.test.ts`, `__tests__/csp-report-sampling.test.ts`, `__tests__/csp-report-rate-watch.test.ts`, `scripts/csp-report-rate-watch.mjs`, `.github/workflows/csp-report-rate-watch.yml`. **Geändert:** `src/app/api/internal/csp-report/route.ts`, `src/lib/security/__tests__/csp-report-route.test.ts`.

**Meilenstein-Details:**

- **L1 — globaler Request-Cap:** zweiter `enforceRateLimit`-Aufruf mit festem Identifier `'global'` und eigenem Scope `csp-report-global` — verifiziert gegen die reale Signatur `(identifier, scope, limit=10, windowSeconds=10)` in `request-security.ts:113`: Upstash nutzt den Scope im Limiter-Prefix, lokal lautet der Key `csp-report-global:global` — in beiden Backends genau **ein** aggregierter Bucket, keine Per-IP-Ableitung. **Schwellenwert 120 Requests/60s (~2/s):** legitime CSP-Violations entstehen nur bei Fehlkonfiguration/Deploy-Regression (einstellige Reports/Minute); 120/min hält ~30x Headroom über realistischer Baseline und kappt trotzdem den Botnet-Mehrwert pro weiterer IP. Bei Überschreitung weiterhin 204, kein Forward. In Production ohne Upstash-Env gilt wie bisher fail-closed (kein Forward).
- **L2 — Sampling:** `ceiling: 30` Reports pro 60s-Fenster ungefiltert, danach genau 1 von 30 (`dropped % divisor === 0`), plus **ein** aggregierter Zähler-Event pro Fenster (`tags.sampling: 'active'`, `extra: {forwarded, dropped}`) statt einem Event pro verworfenem Report — sonst würde die Drop-Buchhaltung die Kosten selbst wieder erzeugen. Threshold-Rationale: legitime Violations liegen im Zehner-pro-Minute-Bereich, 30/Fenster ≈ 10x Headroom. **Ehrliche Grenze:** In-Memory-State gilt **pro warmer Serverless-Instanz** — die verteilte Garantie ist L1s Upstash-Cap; Sampling ist die zweite Linie gegen den Ausstoß einer einzelnen Instanz.
- **L3 — Zod-Validierung:** `legacyViolationSchema` (snake_case) + `reportingViolationSchema` (camelCase) in Zod 4, Felder auf 2048 Zeichen/Typ gebunden, **unbekannte Felder werden gestript** statt unvalidiert an Sentry weitergereicht. Report mit falsch typisierten oder ohne erkannte Felder → `malformedCount`; die Route sendet **ein generisches Warning pro Request** (`'Malformed CSP report discarded'`, `tags.quality: 'malformed'`, `extra: {count}`) und nie den Roh-Payload. Browser bekommt weiterhin bedingungslos 204. Nicht-CSP-Reporttypen (`type !== 'csp-violation'`) werden verworfen, ohne als malformed zu gelten (der `report-to`-Endpoint ist ein Shared-Endpoint).
- **L4 — In-Batch-Dedup:** `aggregateCspViolations()` gruppiert pro Request-Batch nach `violated-directive`+`blocked-uri` (legacy- und Reporting-Format identifizieren dieselbe Kombination) → **ein** Sentry-Event mit `extra.count`. Bewusst nur In-Batch: kein neuer externer Speicher, deterministisch testbar.
- **L5 — Rate-Watch:** eigener Workflow `.github/workflows/csp-report-rate-watch.yml` (daily `17 5 * * *` + `workflow_dispatch`, bewusst **eigene Datei**, um Merge-Konflikte mit parallelen Säulen-Branches zu vermeiden), Schritt `continue-on-error` — kann nie blockieren. Logik in `scripts/csp-report-rate-watch.mjs`: ein Sentry-API-Call auf `events_stats` (`interval=1d&statsPeriod=48h&query=source:"csp-report"`), letzter Tages-Bucket = letzte 24h, Summe der vorigen Buckets = Baseline (rollierend, kein persistenter State). Eskalation bei `current > 3 × previous` **und** `previous >= 10` (Noise-Floor); Traffic, der von unten die 10 überschreitet, wird als `NEW ACTIVITY` markiert. **Live-Teil ehrlich:** der echte Sentry-API-Abruf konnte lokal nicht verifiziert werden (kein Org-Token in CI/Lokal) — der Parser akzeptiert deshalb beide plausible Response-Shapes (`{data: [[{values: [{count}]}]]}` und flaches `{count}` pro Bucket) und die Vergleichs-/Summary-Logik ist mit simulierten Payloads getestet **und** lokal per `CSP_RATE_WATCH_SIMULATE`-Dry-Run ausgeführt (ESCALATION bei 40→150, NEW ACTIVITY bei 8→120, ok bei 30→35, Skip bei fehlenden Secrets — exit 0 in allen Fällen). **Offener Punkt für Jan:** der Workflow erwartet `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` als **GitHub-Repo-Secrets**; `SENTRY_AUTH_TOKEN` ist heute nur in Vercel/`.env.local` dokumentiert — die drei Secrets müssen einmalig in den Repo-Settings hinterlegt werden, sonst schreibt der Job nur eine „Skipped"-Note ins Summary (nicht blockierend).

**5-Stufen-Abschlussprüfung:** `npm run typecheck` 0 Fehler · `npm test` **1573/1573 grün (210 Testdateien**, Baseline 1543 Tests / 207 Dateien auf unverändertem 8863b64 → **+30 Tests, +3 Dateien**: 11 in `csp-report-processing`, 5 in `csp-report-sampling`, 11 in `csp-report-rate-watch`, +4 Route-Tests inkl. aktualisierter Fixtures; ein vorbestehender Parallelitäts-Flake in `csp-nonce.test.ts` trat einmalig im allerersten Gesamtlauf auf, war danach in zwei Gesamtläufen und einzeln grün) · `npm run lint` 0 Fehler (23 vorbestehende Warnungen, keine in geänderten Dateien) · `npm run build` erfolgreich · `git status --short` zeigt nur geplante Dateien.

**Commits (Branch `hardening-csp-reporting`):** L1 `73b69bf` · L2 `9d30e90` · L3+L4 `60a7dd7` · L5 + Planungsdatei siehe nachfolgender Commit.

**Abweichungen vom Plan (dokumentiert):**

1. **L2-Scope:** `sentry.server.config.ts`/`sentry.edge.config.ts` nicht geändert — SDK 10.70.0 unterstützt kein pro-Capture-Sampling; Stattdessen Sampling-Modul in der Route (im Plan als Variante vorgesehen).
2. **Neue Hilfsdatei** `src/lib/security/csp-report.ts` (nicht im ursprünglichen Scope-Listing) — nötig, damit Schemas/Normalisierung/Dedup/Sampler ohne Transport-Schicht testbar sind; Route bleibt dünner Transport-Layer (CLAUDE.md-Architekturregel).
3. **Zwei bestehende Test-Fixtures aktualisiert:** Batch-Cap- und Batch/Legacy-Forward-Tests nutzen jetzt realistische CSP-Report-Bodies (statt `body: {i}`, das unter dem neuen Schema korrekt als malformed zählt), und forwarded Events tragen das neue `extra.count`-Feld (L4). Keine Verhaltensänderung an den geprüften Invarianten.
4. **L1-Testdatei** nutzt pro Request unterschiedliche XFF-IPs und schaltet das Sampling per Test-Hook auf unbegrenzt, damit L1 isoliert vom L2-Deckel geprüft wird.
5. **Baseline-Testzahl:** 1543 Tests (nicht die im Auftrag genannten ~1690) — bereits auf unverändertem Basis-Commit 8863b64 so.
6. **L5-Live-Verifikation** der echten Sentry-API nicht möglich (Secrets/Netz, kein Jan-Gate) — siehe oben; Logic voll deterministisch getestet.
7. **Kanonische Doku unverändert:** `xx_docs/08_api_backend_context.md` / `xx_sop/07_api_backend_routes.md` listen die CSP-Report-Sink-Route nicht einzeln (nur die CSP-Header in `src/proxy.ts`, Säule 1); der externe Vertrag der Route (immer 204, unauthentifiziert, kein neuer Endpunkt) hat sich nicht geändert — daher kein Doku-Drift.
