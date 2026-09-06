# 06_5 — Identifier-/IP-Extraktion: Umsetzungsplan

> **Status:** Execution-Ready · **Stand:** 2026-09-04 · **Owner:** LLM · **Scope:** Unterkategorie #2 aus [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md) (Top 40 %). Alle Zuständigkeiten liegen beim LLM; kein Meilenstein ist auf eine Jan-Entscheidung während der Ausführung angewiesen. Diese Datei ist so geschrieben, dass eine komplett neue, kontextlose LLM-Konversation sie ohne Rückfragen ausführen kann.
> **Quellcode-Basis:** Alle Befunde unten wurden am 2026-09-04 durch einen read-only `casino-code-explorer`-Lauf gegen den tatsächlichen Code verifiziert. **Wichtigster Neufund dieser Runde:** Es gibt **zwei unterschiedliche** IP-Extraktions-Implementierungen im Repo, die sich in einem sicherheitsrelevanten Detail widersprechen (siehe M-Segment I3 unten) — das war in keiner vorherigen Aufschlüsselung sichtbar.

## 0 — Kontext für die ausführende Session

`getClientIdentifier()` (`src/lib/security/request-security.ts:58-67`) wurde im bereits ausgeführten Schwester-Plan [`docs/archive/06_1_bot_automation_detection_plan.md`](../docs/archive/06_1_bot_automation_detection_plan.md) (L3, security-reviewer-Fund) von „erster XFF-Eintrag" auf „**letzter** XFF-Eintrag" umgestellt, weil der erste Eintrag client-spoofbar ist (jeder Client kann sich selbst beliebig viele gefälschte Einträge voranstellen; der Eintrag, den der eigene Edge-Proxy zuletzt anhängt, ist der einzige, dem man vertrauen kann). **Diese Runde deckt auf: `src/lib/casino/network-fingerprint.ts:12-15` (`extractClientIp()`, genutzt von der Multi-Account-Fraud-Erkennung aus Unterkategorie #10) wurde bei diesem Fix NICHT mitgezogen und nimmt weiterhin den ERSTEN, spoofbaren Eintrag.** Das untergräbt teilweise den Zweck des `06_3`-Plans (Multi-Account-Detection): Ein Angreifer könnte durch einen gefälschten ersten XFF-Eintrag verhindern, als Teil eines Clusters erkannt zu werden, oder umgekehrt einen falschen, willkürlichen Fingerprint erzeugen.

## 1 — Segmentierung: 10 Sub-Unterkategorien

| #   | Sub-Unterkategorie                                                  | Niveau          | Status quo (verifiziert)                                                                                                                                                                                                                                                                      | Beleg                                                       |
| :-- | :------------------------------------------------------------------ | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| I2  | Anti-Spoofing in `request-security.ts`                              | **Top 15 %** 🟡 | Bereits gefixt (06_1): letzter XFF-Eintrag statt erster.                                                                                                                                                                                                                                      | `request-security.ts:64`                                    |
| I1  | Grundlegende Präzedenzlogik (userId vor IP)                         | **Top 20 %** 🟡 | Korrekt: authentifizierte `userId` gewinnt immer, IP nur als Fallback.                                                                                                                                                                                                                        | `request-security.ts:58-67`                                 |
| I5  | Shared-Anonymous-Bucket (Leaderboard)                               | **Top 25 %** 🟡 | Bestätigt **einzigartiger** Fall — `getClientIdentifier(request, 'anon')` ist der einzige Aufrufer im gesamten Baum, der einen hartkodierten String als „userId" übergibt. Alle anderen ~36 Aufrufer sind entweder echt authentifiziert oder rufen ohne 2. Argument auf (korrekt IP-basiert). | `leaderboard/route.ts:27`, Grep über alle Aufrufer          |
| I7  | `x-real-ip`/XFF-Konfliktauflösung                                   | **Top 45 %** 🟠 | Funktioniert (`forwarded \|\| x-real-ip \|\| 'unknown'`), aber kein Logging/Alerting, wenn beide Header vorhanden sind und widersprechen — für Debugging/Forensik unsichtbar.                                                                                                                 | `request-security.ts:64-65`                                 |
| I10 | `'unknown'`-Fallback-Bucket                                         | **Top 50 %** 🟠 | Fehlen alle IP-Header komplett, landen **alle** solchen Requests im selben `ip:unknown`-Bucket — strukturell dasselbe Problem wie I5, nur für einen selteneren, aber realen Fall (z. B. bestimmte Test-/Proxy-Konfigurationen ohne XFF).                                                      | `request-security.ts:65`                                    |
| I8  | Testabdeckung für Identifier-Edge-Cases                             | **Top 55 %** 🟠 | Getestet: Auth-Präzedenz, Anti-Spoofing. **Ungetestet:** fehlende Header → `'unknown'`, malformed/leere Header-Werte, IPv6, `x-real-ip`-only-Pfad.                                                                                                                                            | `request-security.test.ts:21-34`                            |
| I9  | Keine zentrale IP-Normalisierung (Middleware-Ebene)                 | **Top 60 %** 🟠 | `src/proxy.ts` liest/normalisiert nie einen IP-Header — jede Route macht die Extraktion unabhängig selbst. Das ist die strukturelle Ursache für I3 (zwei Implementierungen sind auseinandergelaufen, weil es keine einzige Quelle der Wahrheit gibt).                                         | `proxy.ts` (kein IP-Bezug im gesamten Middleware-Code)      |
| I4  | Kein Trusted-Proxy-Hop-Count / Vercel-Header                        | **Top 70 %** 🔴 | Keine `vercel.json`, kein `x-vercel-forwarded-for` oder Äquivalent genutzt — reines Vertrauen in generische, clientseitig beeinflussbare Header ohne Hop-Count-Validierung.                                                                                                                   | Keine Datei gefunden (Abwesenheit verifiziert)              |
| I6  | Keine IPv6-Normalisierung                                           | **Top 75 %** 🔴 | Weder `getClientIdentifier()` noch `extractClientIp()` fassen eine IPv6-Adresse auf Prefix-Ebene (z. B. /64) zusammen — ein einzelner Nutzer mit einem typischen /64-Zuteilungsblock (Milliarden Einzeladressen) kann Rate-Limits durch Adresswechsel umgehen.                                | Grep ohne IPv6-Bezug in beiden Dateien                      |
| I3  | **Inkonsistenz zwischen den zwei IP-Extraktions-Implementierungen** | **Top 80 %** 🔴 | `request-security.ts` nutzt den **letzten** XFF-Eintrag (sicher), `network-fingerprint.ts` (Fraud-Erkennung für #10) nutzt weiterhin den **ersten** (spoofbar) — der 06_1-Fix wurde nicht auf die Schwesterdatei übertragen. Untergräbt teilweise die Multi-Account-Erkennung aus `06_3`.     | `request-security.ts:64` vs. `network-fingerprint.ts:12-15` |

**Marker-Konvention:** identisch zu `06_rate_limiting_abuse_prevention.md`.

**Rechnerischer Schnitt über alle 10 Positionen:** (15+20+25+45+50+55+60+70+75+80)/10 = **Top 49,5 %** (gerundet Top 50 %) — schlechter als der bisherige Top-40-%-Bestwert. Der wichtigste Einzelfund (I3) war in keiner vorherigen Bewertung sichtbar, weil er nur durch den direkten Vergleich zweier verschiedener Dateien auffällt, nicht durch die isolierte Betrachtung einer einzelnen.

## 2 — Übersicht für Jan

| Nummer | Meilenstein                                                | Status     | Nächster Schritt                                 | Zuständigkeit |
| ------ | ---------------------------------------------------------- | ---------- | ------------------------------------------------ | ------------- |
| L0     | IP-Extraktions-Logik konsolidieren (I3, höchste Priorität) | 🔴 Geplant | Gemeinsame Funktion für beide Dateien            | LLM           |
| L1     | Leaderboard-Shared-Bucket beheben (I5)                     | 🔴 Geplant | `'anon'`-Literal durch echte IP ersetzen         | LLM           |
| L2     | Trusted-Proxy-/Vercel-Header-Entscheidung (I4)             | 🔴 Geplant | Dokumentierte Entscheidung, ggf. Hop-Count       | LLM           |
| L3     | IPv6-/64-Normalisierung (I6)                               | 🔴 Geplant | Prefix-Extraktion für IPv6-Adressen              | LLM           |
| L4     | `unknown`-Fallback-Bucket entschärfen (I10)                | 🔴 Geplant | Randomisierter Fallback statt Sammel-Bucket      | LLM           |
| L5     | Testabdeckung Edge-Cases (I8)                              | 🔴 Geplant | Fehlende/malformed Header, IPv6, x-real-ip-only  | LLM           |
| L6     | Testabdeckung + Doku-Nachzug (Abschluss)                   | 🔴 Geplant | Vollsuite grün, Kategorie-06-Datei aktualisieren | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. **I7 und I9 haben keinen eigenen Meilenstein** — I7 (Konflikt-Logging) wird als kleiner Zusatz in L0 miterledigt (dieselbe Datei, dieselbe Sitzung), I9 (fehlende zentrale Normalisierung) ist die strukturelle Ursache, die L0 bereits durch eine gemeinsame Funktion behebt — kein separater Meilenstein nötig.

## 3 — Abgrenzung zu verwandten Plänen

- **`06_3` (Multi-Account, execution-ready):** L0 dieses Plans behebt eine Lücke, die die Wirksamkeit der DORT geplanten Cluster-Erkennung direkt beeinflusst. **Empfehlung an eine ausführende Session: `06_5` L0 vor `06_3` ausführen**, falls beide zur Ausführung anstehen — die Multi-Account-Erkennung sollte auf einer bereits konsistenten IP-Extraktion aufbauen, nicht umgekehrt.
- **`06_1` (Bot-Detection, executed):** Der ursprüngliche Anti-Spoofing-Fix (I2) stammt von dort — dieser Plan vervollständigt ihn nur (überträgt ihn auf die Schwesterdatei), ändert nichts an der bereits ausgeführten Logik selbst.
- **Unterkategorie #8 (Distributed-/Edge-Konsistenz, kommt als nächster Plan in dieser Serie):** Dort geht es um die STRUKTURELLE Frage, ob `enforceRateLimit()` zentral (Middleware) oder verteilt (pro Route) aufgerufen wird. Dieser Plan hier (I9) stellt fest, dass auch die IP-EXTRAKTION selbst verteilt/dupliziert ist — verwandter, aber nicht identischer Befund. Keine Dopplung: #8 behandelt den Rate-Limit-Aufruf, #2/I9 behandelt nur die Identifier-Ermittlung davor.

## 4 — Meilensteine im Detail

### L0 — IP-Extraktions-Logik konsolidieren (I3, höchste Priorität)

**Ziel:** Eine einzige, konsistente IP-Extraktionsfunktion für das gesamte Repo statt zweier auseinanderlaufender Implementierungen.
**Scope:** Neue geteilte Funktion `extractClientIp(request: Request): string` in `src/lib/security/request-security.ts` (letzter-XFF-Eintrag-Logik, die bereits sichere Variante) — exportiert. `getClientIdentifier()` nutzt sie intern (Refactoring, kein Verhaltenswechsel). `src/lib/casino/network-fingerprint.ts` importiert dieselbe Funktion statt ihrer eigenen `extractClientIp()`-Kopie zu behalten — **die dortige lokale Funktion wird gelöscht**, nicht nur umbenannt (DRY, verhindert künftiges erneutes Auseinanderlaufen). Zusätzlich (I7, kleiner Zusatz in derselben Datei): Bei gleichzeitig vorhandenem `x-forwarded-for` UND `x-real-ip` mit widersprüchlichem Wert wird `CasinoLogger.warn()` mit beiden Werten aufgerufen (Beobachtbarkeit, kein Verhaltenswechsel — XFF gewinnt weiterhin).
**Abhängigkeiten:** Keine (Fundament, siehe Abschnitt 3 zur Reihenfolge-Empfehlung gegenüber `06_3`).
**Freigabe-Gate:** `security-reviewer` PASS (Änderung an sicherheitsrelevanter Kernfunktion, auch wenn nur Konsolidierung).
**Verifizierung:** Test bestätigt: `network-fingerprint.ts`s Fingerprint-Berechnung liefert nach der Änderung bei einem präparierten Multi-Wert-XFF-Header denselben (sicheren) Hash wie `getClientIdentifier()` — vorher lieferten beide unterschiedliche Werte für denselben Header. Alle bestehenden Fraud-Detection-Tests bleiben grün (Regressionstest, da sich der tatsächliche Fingerprint-Wert für normale, unpräparierte Requests nicht ändert — nur bei mehrwertigen XFF-Headern ändert sich das Ergebnis).
**Nicht-Scope:** Keine Änderung an der HMAC-Logik selbst, nur an der Eingabe-Extraktion.
**Money-Pfad:** Nein (Rate-Limiting-Infrastruktur) · **Security-Review:** Pflicht.

### L1 — Leaderboard-Shared-Bucket beheben (I5)

**Ziel:** Jeder anonyme Leaderboard-Aufrufer bekommt seinen eigenen Rate-Limit-Bucket statt eines geteilten `user:anon`-Buckets.
**Scope:** `src/app/api/leaderboard/route.ts:27` — `getClientIdentifier(request, 'anon')` → `getClientIdentifier(request)` (kein 2. Argument, fällt korrekt auf IP-Extraktion zurück, identisch zum bereits korrekten Muster in `internal/csp-report/route.ts:12` und den anderen vier IP-basierten Aufrufern aus Punkt 2 des Explorer-Reports).
**Abhängigkeiten:** L0 (nutzt idealerweise dieselbe konsolidierte Funktion).
**Freigabe-Gate:** Keins (Ein-Zeilen-Fix, kein neuer Datenpfad, keine neue Berechtigung).
**Verifizierung:** Test: zwei simulierte Requests von unterschiedlichen IPs an `/api/leaderboard` haben unabhängige Rate-Limit-Zähler (vorher: geteilt).
**Nicht-Scope:** Keine Änderung an der Rate-Limit-Schwelle selbst (bleibt 60/min laut `xx_docs/08_api_backend_context.md`).
**Money-Pfad:** Nein · **Security-Review:** Nein (triviale, risikoarme Änderung).

### L2 — Trusted-Proxy-/Vercel-Header-Entscheidung (I4)

**Ziel:** Dokumentierte, bewusste Entscheidung statt stillschweigender Lücke bezüglich Header-Vertrauen.
**Scope:** Prüfen, ob Vercels Edge-Netzwerk für dieses Projekt einen vertrauenswürdigeren Header setzt (Vercel-Dokumentation, nicht im Repo-Code zu finden — externe Recherche nötig, WebSearch erlaubt) und ob eine Umstellung technisch möglich/sinnvoll ist. Falls ja: `getClientIdentifier()` bevorzugt den Vercel-spezifischen Header vor generischem XFF. Falls nein (z. B. weil Vercel keinen zusätzlichen Header über den Standard hinaus garantiert, oder weil eine Umstellung das lokale Dev-Setup bricht): das **explizit als bewusste, geprüfte Entscheidung dokumentieren** (nicht nur stillschweigend nichts tun) — in einem neuen Kommentar-Block direkt über `getClientIdentifier()`.
**Abhängigkeiten:** L0.
**Freigabe-Gate:** `security-reviewer` PASS falls Code geändert wird, sonst keins (reine Dokumentation).
**Verifizierung:** Entweder ein neuer, funktionierender Header-Pfad mit Test, oder ein dokumentierter Kommentar mit Begründung, warum keine Änderung erfolgt.
**Nicht-Scope:** Keine Änderung an der Hosting-/Deployment-Konfiguration selbst.
**Money-Pfad:** Nein · **Security-Review:** Bedingt (nur falls Code geändert wird).

### L3 — IPv6-/64-Normalisierung (I6)

**Ziel:** Ein einzelner IPv6-Nutzer kann Rate-Limits nicht durch Adresswechsel innerhalb seines zugewiesenen Präfix-Blocks umgehen.
**Scope:** Neue Hilfsfunktion `normalizeIpForRateLimit(ip: string): string` — erkennt IPv6-Format (enthält `:`), kürzt auf die ersten 4 Gruppen (/64-Präfix, gängige ISP-Zuteilungsgröße), lässt IPv4-Adressen unverändert. Eingebaut in die konsolidierte Funktion aus L0.
**Abhängigkeiten:** L0.
**Freigabe-Gate:** `security-reviewer` PASS.
**Verifizierung:** Test: zwei verschiedene IPv6-Adressen aus demselben /64-Block ergeben denselben normalisierten Identifier; zwei Adressen aus unterschiedlichen /64-Blöcken bleiben getrennt; IPv4 bleibt unverändert (Regressionstest).
**Nicht-Scope:** Keine Änderung an der IPv4-Logik.
**Money-Pfad:** Nein · **Security-Review:** Pflicht.

### L4 — `unknown`-Fallback-Bucket entschärfen (I10)

**Ziel:** Fehlen alle IP-Header, landen nicht mehr alle betroffenen Requests in einem einzigen, gemeinsamen Bucket.
**Scope:** Statt des Literals `'unknown'` einen Fallback nutzen, der pro Request eindeutig ist, aber bewusst NICHT als Umgehungsmöglichkeit missbraucht werden kann (z. B. ein Hash aus `User-Agent` + `Accept-Language` + grobem Zeitfenster — kein perfekter Identifier, aber besser als ein globaler Sammel-Bucket). Dokumentieren, dass dies weiterhin ein Fallback für einen seltenen Fall ist, kein primärer Schutzmechanismus.
**Abhängigkeiten:** L0.
**Freigabe-Gate:** `security-reviewer` PASS.
**Verifizierung:** Test: zwei Requests ohne jeglichen IP-Header, aber mit unterschiedlichem User-Agent, landen in unterschiedlichen Buckets.
**Nicht-Scope:** Kein Versuch, echte IP-Identität ohne jeglichen Header zu rekonstruieren (technisch unmöglich).
**Money-Pfad:** Nein · **Security-Review:** Pflicht.

### L5 — Testabdeckung Edge-Cases (I8)

**Ziel:** Die vier identifizierten ungetesteten Szenarien abdecken.
**Scope:** Neue Tests in `request-security.test.ts`: (a) beide Header fehlen → Fallback-Verhalten aus L4, (b) `x-forwarded-for` vorhanden aber leerer String nach Trim → fällt korrekt auf `x-real-ip` zurück, (c) IPv6-Adresse → Normalisierung aus L3 greift, (d) nur `x-real-ip` gesetzt, kein XFF → wird korrekt verwendet.
**Abhängigkeiten:** L0, L3, L4 (testet deren Verhalten).
**Freigabe-Gate:** Alle neuen Tests grün.
**Verifizierung:** `npx vitest run src/lib/security/__tests__/request-security.test.ts`.
**Nicht-Scope:** Keine Tests für Szenarien außerhalb dieser vier Fälle.
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L6 — Testabdeckung + Doku-Nachzug (Abschluss)

**Ziel:** Vollständiger Regressionsnachweis, Kategorie-06-Datei aktualisiert.
**Scope:** Vollständiger `npm test`-Lauf, `npm run typecheck`, `npm run lint`. Danach: `06_rate_limiting_abuse_prevention.md` Unterkategorie #2 aktualisieren (Niveau-Neubewertung, Status von „Execution-Ready" auf „Executed"), `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md` Zeile #2 nachziehen. **Zusätzlich wichtig:** `06_3_multi_account_abuse_prevention_plan.md` (Unterkategorie #10) referenziert `network-fingerprint.ts` — nach Ausführung dieses Plans dort einen kurzen Hinweis ergänzen, dass die IP-Extraktion inzwischen konsolidiert wurde (kein inhaltlicher Widerspruch mehr, nur Aktualitäts-Hinweis).
**Abhängigkeiten:** L0–L5.
**Freigabe-Gate:** Vollsuite grün, 0 TS-/Lint-Fehler.
**Verifizierung:** Testlauf-Zahlen im Ausführungsprotokoll dieser Datei dokumentieren.
**Nicht-Scope:** Keine Ausführung von `06_3` selbst (bleibt eigener Plan).
**Money-Pfad:** Nein · **Security-Review:** Nein.

## 5 — Selbstprüfung (durchgeführt 2026-09-04)

- ✅ Scope gegenüber `06_1`, `06_3` und Unterkategorie #8 abgegrenzt (Abschnitt 3), inkl. einer expliziten Ausführungsreihenfolge-Empfehlung gegenüber `06_3`.
- ✅ Jeder Meilenstein hat Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung/Nicht-Scope/Money-Pfad/Security-Review.
- ✅ Alle Zuständigkeiten = LLM.
- ✅ Der wichtigste Fund (I3, Inkonsistenz zwischen zwei Dateien) wurde nicht verwässert, sondern als eigener, höchstpriorisierter Meilenstein (L0) behandelt.
- ⚠️ **Nachträglich gefunden beim Selbst-Review:** L2 (Vercel-Header) erfordert möglicherweise externe Recherche (WebSearch), da die Antwort nicht vollständig aus dem Repo-Code ableitbar ist — im Meilenstein-Text bereits als „WebSearch erlaubt" vermerkt, damit die ausführende Session nicht überrascht wird.
- ⚠️ **Nachträglich gefunden:** L0 löscht aktiv Code (`network-fingerprint.ts`s lokale `extractClientIp()`) statt nur zu ergänzen — als Löschung markiert, nicht nur als „Ergänzung" verharmlost, damit die ausführende Session weiß, dass ein bestehender Test (`network-fingerprint.test.ts`) eventuell seinen Mock-Pfad anpassen muss.
- ✅ Kein Punkt doppelt als SOP/Kontextreferenz/Plan gepflegt.

## 6 — Offene Fragen für Jan (je 3 Antwortoptionen)

**Q1 — Soll L3 (IPv6-/64-Normalisierung) trotz der Tatsache umgesetzt werden, dass dieses Play-Money-Casino aktuell kein bekanntes IPv6-Abuse-Problem hat?**

- (a) Ja, umsetzen — geringer Aufwand (eine Hilfsfunktion), schließt eine reale, dokumentierte Umgehungsmöglichkeit, bevor sie ausgenutzt wird. _(Empfehlung — günstige Prävention)_
- (b) Nein, zurückstellen — kein bekannter aktueller Vorfall, Aufwand lieber in dringendere Lücken (z. B. L0/I3) stecken.
- (c) Nur dokumentieren als bekannte Lücke (wie M5/Device-Fingerprinting im `06_3`-Plan), kein Bau-Milestone in dieser Runde.

**Q2 — Soll L2 (Vercel-Header) mit einer WebSearch-Recherche zu Vercels aktueller Header-Garantie durchgeführt werden, oder reicht die konservative „dokumentiert, keine Änderung"-Variante?**

- (a) WebSearch durchführen, um zu prüfen, ob ein vertrauenswürdigerer Header verfügbar ist — kleiner Zusatzaufwand für potenziell reale Sicherheitsverbesserung. _(Empfehlung)_
- (b) Keine Recherche, direkt als bewusst akzeptierte Lücke dokumentieren (schneller, aber verpasst eine mögliche einfache Verbesserung).
- (c) Recherche plus Kontaktaufnahme mit Vercel-Support/Doku-Ticket für Klarheit — unverhältnismäßiger Aufwand für ein Lernprojekt.

## 7 — Verwandte Artefakte

| Bedarf                                                               | Datei                                                                                                                 |
| :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| Vollständige Kategorie-06-Aufschlüsselung (Ursprung dieses Plans)    | [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md)                                        |
| Kompakte Kategorie-Overview                                          | [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md)               |
| Schwester-Plan #10 (Multi-Account, execution-ready, hängt von L0 ab) | [`06_3_multi_account_abuse_prevention_plan.md`](06_3_multi_account_abuse_prevention_plan.md)                          |
| Schwester-Plan #9 (Testabdeckung, execution-ready)                   | [`06_4_test_coverage_plan.md`](06_4_test_coverage_plan.md)                                                            |
| Ausgeführter Plan Bot-Detection (Ursprung des Anti-Spoofing-Fixes)   | [`docs/archive/06_1_bot_automation_detection_plan.md`](../docs/archive/06_1_bot_automation_detection_plan.md)         |
| 37-Routen-Aufrufer-Liste (Referenz für Public-Route-Inventar)        | [`docs/observability/05_ratelimit_failclosed_alerting.md`](../docs/observability/05_ratelimit_failclosed_alerting.md) |
| API-Backend-Kontext (Rate-Limit-Defaults)                            | [`xx_docs/08_api_backend_context.md`](../xx_docs/08_api_backend_context.md)                                           |
| SOP Planungsdateien (Format dieses Plans)                            | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                           |
| SOP Execution (nächster Schritt nach Freigabe)                       | [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)                                       |
