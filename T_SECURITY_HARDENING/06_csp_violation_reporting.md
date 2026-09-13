# 06 — CSP-Violation-Reporting (Runde 2 — Ziel Top 10–15 %)

> **Status:** 🔴 Geplant · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit — **kein Jan-Gate in dieser Säule**, siehe §0) · **Scope:** `src/app/api/internal/csp-report/route.ts`, `src/lib/security/request-security.ts` (globaler Cap), `sentry.server.config.ts`/`sentry.edge.config.ts` (Sampling); **nicht** im Scope: CSP-Direktiven selbst (Säule 1), Admin-Dashboard-UI für CSP-Reports (größerer Frontend-Task, YAGNI ohne konkreten Bedarfsnachweis).
> **Money-Pfad:** Nein (Observability-/Report-Ebene) · **Security-Review:** Nein (additive Härtung einer bereits unauthentifizierten, absichtlich offenen Route)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Diese Säule hat noch keine eigene Planungsdatei — nur einen archivierten Runde-1-Stand ([`docs/archive/t_security_hardening_06_csp_violation_reporting.md`](../docs/archive/t_security_hardening_06_csp_violation_reporting.md), 2026-09-06, Top 15-16 %).
2. **Frische `casino-code-explorer`-Recherche (2026-09-12)** bestätigt: Der Archiv-Stand ist **nicht veraltet** — Code und Tests sind identisch zum dokumentierten Stand. Neu entdeckt: Das IP-Rate-Limit (20 Reports/10s) läuft über verteiltes Upstash-Sliding-Window (nicht lokal-in-Memory) — robuster als angenommen, aber es fehlt ein **globaler** Request-Cap. Ein Botnet mit N verschiedenen IPs kann N×120 Sentry-Events/Minute erzeugen, ohne dass ein aggregierter Deckel greift — ein reales Denial-of-Wallet-Kostenrisiko gegen das Sentry-Kontingent, unabhängig vom bereits korrekten Per-IP-Schutz.
3. **Diese Datei ist reine Planung, keine Ausführung** (Jan-Auftrag 2026-09-12).
4. **Kein K5-Punkt in dieser Säule.**

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                          | Scope (Dateien)                                                          |   Status   | Zuständigkeit | Verifikation                                                                                     |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | :--------: | :-----------: | ------------------------------------------------------------------------------------------------- |
| L1  | Globaler Request-Cap gegen Denial-of-Wallet                             | `src/app/api/internal/csp-report/route.ts`                                    | 🔴 Geplant |      LLM      | Ein aggregierter Deckel (z. B. X Reports/Minute über alle IPs) begrenzt den Sentry-Event-Ausstoß  |
| L2  | Sentry-`sampleRate` für CSP-Reports ergänzen                            | `sentry.server.config.ts`, `sentry.edge.config.ts`, `route.ts`                | 🔴 Geplant |      LLM      | CSP-Reports werden mit reduzierter Rate an Sentry weitergeleitet, zweite Verteidigungslinie gegen L1 |
| L3  | Zod-Schemavalidierung der einzelnen Report-Felder                       | `src/app/api/internal/csp-report/route.ts`                                    | 🔴 Geplant |      LLM      | Malformed/unerwartete Felder werden vor dem Sentry-Versand strukturiert erkannt, Route bleibt 204 |
| L4  | Dedup/Aggregation nach `violated-directive` vor Sentry-Versand          | `src/app/api/internal/csp-report/route.ts`                                    | 🔴 Geplant |      LLM      | Identische Verstöße innerhalb eines Zeitfensters erzeugen nicht mehr N einzelne Sentry-Events      |
| L5  | Alarm bei plötzlichem Anstieg der Violation-Rate                        | Neuer, nicht-blockierender Workflow-Schritt (Muster: Säule 7/8 Job-Summary)    | 🔴 Geplant |      LLM      | Ein Anstieg über einen definierten Schwellenwert wird sichtbar gemacht (Job-Summary, nicht blockierend) |

**Warum kein Jan-Gate:** Alle 5 Meilensteine sind additive Härtungen einer bereits absichtlich unauthentifizierten Route, ohne neues Secret, ohne Breaking Change.

---

## 2 — CSP-Violation-Reporting in Subkategorien: Neubewertung (2026-09-12, Baseline für diese Runde)

|  #  | Subkategorie                                            | Niveau (Baseline) | Status | Kernbefund                                                                                                                                  |
| :-: | ------------------------------------------------------------ | :----------------: | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Format-Parsing (Legacy + Batch)                              |     Top 10 %      |   🟢   | `route.ts:25-29` — unverändert solide                                                                                                           |
|  2  | Sentry-Weiterleitung mit korrektem Tagging                   |     Top 10 %      |   🟢   | `route.ts:31-37` — `level: 'warning'`, `tags.source: 'csp-report'`                                                                              |
|  3  | Batch-Kappung (20 Reports/Request)                           |     Top 10 %      |   🟢   | `route.ts:31`                                                                                                                                    |
|  4  | Per-IP-Rate-Limit (verteilt, Upstash)                        |     Top 10 %      |   🟢   | Robuster als im Archiv angenommen — echtes Sliding-Window über Upstash, nicht lokal-in-Memory, fail-closed in Production ohne Upstash            |
|  5  | CSP-Header-Verweis stimmt exakt mit der Route überein         |     Top 10 %      |   🟢   | `src/proxy.ts:184,238` — kein Drift                                                                                                              |
|  6  | Testabdeckung (6/6 Tests)                                    |     Top 10 %      |   🟢   | Alle relevanten Formate/Edge-Cases abgedeckt                                                                                                    |
|  7  | **Kein globaler Request-Cap**                                |     Top 40 %      |   🟠   | Nur Per-IP-Limit (max. 120/min pro IP) — verteiltes Botnet kann N×120 Sentry-Events/Min erzeugen, kein aggregierter Deckel                       |
|  8  | **Keine Dedup/Aggregation vor Sentry-Versand**                |     Top 35 %      |   🟡   | Jeder Report landet einzeln, kein Fingerprint/Gruppierung nach `violated-directive` — Archiv-Punkt #2/#5, weiterhin offen                        |
|  9  | **Keine Alertierung bei Anstieg der Violation-Rate**          |     Top 40 %      |   🟠   | Rein passives Sentry-Warning-Log, keine aktive Eskalation bei ungewöhnlichem Anstieg                                                            |
| 10  | **Keine Zod-Schemavalidierung + kein Sentry-Sampling**        |     Top 35 %      |   🟡   | Nur strukturelle Array/Objekt-Unterscheidung, keine Feldvalidierung; kein CSP-spezifischer `sampleRate` als zweite Verteidigungslinie gegen #7    |

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

|  #  | Subkategorie                        | Baseline | Nach Ausführung | Warum |
| :-: | -------------------------------------- | :------: | :-------------: | ----- |
|  1  | Format-Parsing                        | Top 10 % |    Top 10 %     | unverändert |
|  2  | Sentry-Weiterleitung/Tagging          | Top 10 % |    Top 10 %     | unverändert |
|  3  | Batch-Kappung                         | Top 10 % |    Top 10 %     | unverändert |
|  4  | Per-IP-Rate-Limit                     | Top 10 % |    Top 10 %     | unverändert |
|  5  | CSP-Header-Verweis                    | Top 10 % |    Top 10 %     | unverändert |
|  6  | Testabdeckung                         | Top 10 % |    Top 10 %     | unverändert (wächst mit L1-L4 automatisch mit) |
|  7  | Globaler Request-Cap                  | Top 40 % |    Top 12 %     | L1 |
|  8  | Dedup/Aggregation                     | Top 35 % |    Top 12 %     | L4 |
|  9  | Alertierung bei Anstieg               | Top 40 % |    Top 15 %     | L5 |
| 10  | Zod-Validierung + Sentry-Sampling     | Top 35 % |    Top 10 %     | L2, L3 |

**Projizierter Schnitt nach Ausführung:** (10+10+10+10+10+10+12+12+15+10)/10 = **Top 10,9 %** (gerundet **Top 11 %**).

**Einordnung:** Kein K5-Blocker in dieser Säule — **Top 11 %** ist nach Ausführung realistisch erreichbar, eine der besten Werte aller 10 Säulen.

---

## 8 — Verwandte Artefakte

| Bedarf                                                  | Datei                                                                                                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei                         | [`docs/archive/t_security_hardening_06_csp_violation_reporting.md`](../docs/archive/t_security_hardening_06_csp_violation_reporting.md) |
| Report-Ingestion-Route (wird in L1-L4 geändert)            | [`src/app/api/internal/csp-report/route.ts`](../src/app/api/internal/csp-report/route.ts)                                     |
| Rate-Limit-Kernlogik (Referenz für L1)                     | [`src/lib/security/request-security.ts`](../src/lib/security/request-security.ts)                                             |
| Sentry-Konfiguration (wird in L2 geändert)                 | [`sentry.server.config.ts`](../sentry.server.config.ts), [`sentry.edge.config.ts`](../sentry.edge.config.ts)                  |
| Referenzmuster für L5 (Baseline/Schedule-Job-Summary)      | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) (L2)                                            |
| Verzahnte, aber getrennte Säule (CSP-Direktiven selbst)    | [`01_csp_script_hardening.md`](./01_csp_script_hardening.md)                                                                   |
| Übersicht (alle 10 Säulen)                                | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                  |
