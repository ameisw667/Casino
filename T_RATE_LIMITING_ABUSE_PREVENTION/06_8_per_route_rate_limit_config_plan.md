# 06_8 — Per-Route Rate-Limit-Konfiguration: Umsetzungsplan

> **Status:** Execution-Ready · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Unterkategorie #1 aus [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md) (Top 15 % — die bislang bestbewertete Unterkategorie der ganzen Kategorie). Alle Zuständigkeiten liegen beim LLM; kein Meilenstein ist auf eine Jan-Entscheidung während der Ausführung angewiesen. Diese Datei ist so geschrieben, dass eine komplett neue, kontextlose LLM-Konversation sie ohne Rückfragen ausführen kann.
> **Quellcode-Basis:** Alle Befunde unten wurden am 2026-09-04/05 durch zwei unabhängige, read-only `casino-code-explorer`-Läufe gegen den tatsächlichen Code verifiziert (Datei:Zeile-Belege, gegenseitig bestätigt). **Anders als bei den vorherigen fünf Plänen dieser Serie** fördert diese Aufschlüsselung keine kritischen Sicherheitslücken zutage — #1 ist tatsächlich die solideste Teilfläche der Kategorie. Die Meilensteine unten sind entsprechend Politur/Konsistenz-Arbeit, kein Lücken-Schließen.

## 0 — Kontext für die ausführende Session

Diese Unterkategorie überschneidet sich an mehreren Stellen mit bereits bestehenden Plänen dieser Serie — Abschnitt 3 unten regelt die Abgrenzung im Detail. Wichtigster Fakt vorab: **Kein einziger Rate-Limit-Schwellenwert im gesamten Money-Pfad ist ein benannter Konstante** — jede Zahl ist ein Roh-Literal direkt im Funktionsaufruf. Das ist der Kernbefund, der die meisten Meilensteine unten motiviert.

## 1 — Segmentierung: 10 Sub-Unterkategorien

| #   | Sub-Unterkategorie                                           | Niveau          | Status quo (verifiziert)                                                                                                                                                                                                                                                                                                                                            | Beleg                                                                                                               |
| :-- | :----------------------------------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------ |
| C2  | Bet-Velocity-Konstanten-Konsistenz                           | **Top 10 %** 🟢 | `bet-velocity-guard.ts` importiert `BET_VELOCITY_MIN_BETS`/`_WINDOW_MINUTES` direkt aus `fraud-detection.ts` — eine einzige Quelle der Wahrheit, mit explizitem Kommentar zur Absicht. Vorbildlich.                                                                                                                                                                 | `bet-velocity-guard.ts:5-8,13-14,18-19`, `fraud-detection.ts:12-13`                                                 |
| C6  | Admin-Routen-Risiko-Skalierung                               | **Top 12 %** 🟡 | Konsistentes Muster bestätigt: Read-Routen 30/60s, Write-Routen 10/60s, destruktive Admin-Aktion (Fraud-Scan) ~1/300s. Durchgängig risikoproportional.                                                                                                                                                                                                              | `admin/promo-codes/route.ts:44-48,101-105`, `admin/overview/route.ts:21-25`, `admin/users/route.ts:37-41,146-150`   |
| C4  | Dev-/Prod-Schwellenwert-Konsistenz                           | **Top 15 %** 🟡 | Keine getrennten Zahlen — Umgebungsunterschied betrifft nur das Backend-Verhalten bei fehlendem Upstash (fail-closed Prod / In-Memory-Fallback Dev), nicht die Limit-Werte selbst. Sauber, wie es sein soll.                                                                                                                                                        | `request-security.ts:19-28`, `bet-velocity-guard.ts:43-58`                                                          |
| C8  | Neue-Guards-Konstanten-Disziplin                             | **Top 15 %** 🟡 | Die 5 neueren Module (`login-guard`, `daily-cost-cap`, `promo-guess-guard`, `bet-velocity-guard`) nutzen durchgängig benannte, exportierte Konstanten mit Begründungskommentaren — der positive Gegenpol zu C1.                                                                                                                                                     | `daily-cost-cap.ts:8-23`, `login-guard/route.ts:19`, `admin/fraud/scan/route.ts:14-15`                              |
| C7  | Testabdeckung für Threshold-Mechanik (nicht -Werte)          | **Top 40 %** 🟠 | `meta-security.test.ts:277-286` und `request-security.test.ts:76-77,87` testen die Mechanik (Scope-Isolation, 429-Verhalten) mit synthetischen Werten (`1/5s`, `20/60s`) — **kein** Test verankert die echten Produktionswerte (`casino-bet: 30/10s` etc.) als Regressionsschutz.                                                                                   | `meta-security.test.ts:277-286`, `request-security.test.ts:76-77,87`                                                |
| C1  | **Keine benannten Konstanten für Money-Pfad-Schwellenwerte** | **Top 55 %** 🟠 | `enforceRateLimit(..., 'casino-bet', 30, 10)`, `'blackjack-action', 20, 10`, `'casino-bet-crash-mp', 30, 10`, `'wallet-redeem', 10, ...` — alles rohe Zahlenliterale direkt im Call, über 30 Call-Sites, keine gemeinsame Konstantendatei. Ein Tippfehler (z. B. 30 → 300) fiele nicht auf (siehe C7).                                                              | `bet/route.ts:103`, `blackjack/route.ts:119-123`, `bet-crash-multiplayer/route.ts:96`, `redeem-code/route.ts:77-80` |
| C5  | Keine empirische Begründung der gewählten Zahlen             | **Top 60 %** 🟠 | Kein Kommentar/Doku erklärt, warum `casino-bet` genau 30/10s statt 20 oder 50 ist. Im Gegensatz dazu erklärt `daily-cost-cap.ts:8-18` seine 400/200/100-Caps ausführlich gegen eine Kostenobergrenze. Die zwei höchsten-Einsatz-Schwellenwerte sind am wenigsten begründet.                                                                                         | `bet/route.ts:75-104` (keine Rationale-Kommentare), Gegenbeispiel `daily-cost-cap.ts:8-18`                          |
| C9  | Konkreter Doku-Drift: Falsche Einheiten in `xx_docs/08`      | **Top 65 %** 🟠 | `xx_docs/08_api_backend_context.md:54,56,55` behauptet `bet`/`blackjack`/`bet-crash-multiplayer` seien „60/min" — real sind es `30/10s`/`20/10s`/`30/10s` (Einheiten-Fehler, nicht nur Rundungsdifferenz). `:119` behauptet `admin/fraud/scan` sei „5/min" — real `1/300s` (deutlich enger als dokumentiert, in die sichere Richtung falsch, aber trotzdem falsch). | `xx_docs/08_api_backend_context.md:54,55,56,119` vs. Code                                                           |
| C10 | Fehlende Doku-Zeilen für neue Auth-Routen                    | **Top 65 %** 🟠 | `/api/auth/login-guard` und `/api/auth/signup-suspicion` (beide real, rate-limitiert) fehlen komplett in der Routen-Tabelle von `xx_docs/08_api_backend_context.md`.                                                                                                                                                                                                | Grep `login-guard\|signup-suspicion` in `xx_docs/08_api_backend_context.md` — kein Treffer                          |
| C3  | Bereits bekannter Doku-Drift (Telegram-Webhook, Routenzahl)  | **Top 70 %** 🔴 | `telegram/webhook` fälschlich als „120/min" dokumentiert, obwohl 0 Rate-Limit-Aufrufe existieren; Routenzahl 47 statt real 56. **Bereits vollständig als E9/L5 in `06_6_distributed_edge_consistency_plan.md` erfasst — hier bewusst nicht dupliziert**, nur zur Vollständigkeit der Segmentierung gelistet.                                                        | `worldmap/06_6_distributed_edge_consistency_plan.md` Abschnitt 1 (E9), `xx_docs/08_api_backend_context.md:3,90`     |

**Marker-Konvention:** identisch zu `06_rate_limiting_abuse_prevention.md`.

**Rechnerischer Schnitt über alle 10 Positionen:** (10+12+15+15+40+55+60+65+65+70)/10 = **Top 40,7 %** (gerundet Top 41 %) — schlechter als der bisherige Top-15-%-Bestwert, aber aus einem anderen Grund als bei den vorherigen fünf Plänen dieser Serie: Hier gibt es **keine echten Sicherheitslücken**, nur Konsistenz-/Wartbarkeits-Schulden (fehlende Konstanten, fehlende Threshold-Regressionstests, Doku-Drift). Die eigentliche Schutzwirkung der Rate-Limits selbst bleibt unangetastet solide.

## 2 — Übersicht für Jan

| Nummer | Meilenstein                                            | Status     | Nächster Schritt                                 | Zuständigkeit |
| ------ | ------------------------------------------------------ | ---------- | ------------------------------------------------ | ------------- |
| L0     | Money-Pfad-Schwellenwerte als benannte Konstanten (C1) | 🔴 Geplant | Neue zentrale Konstanten-Datei                   | LLM           |
| L1     | Threshold-Regressionstests (C7)                        | 🔴 Geplant | Tests gegen die echten Produktionswerte          | LLM           |
| L2     | Empirische Begründung nachtragen (C5)                  | 🔴 Geplant | Kommentare analog zu `daily-cost-cap.ts`         | LLM           |
| L3     | `xx_docs/08`-Einheiten-Fehler korrigieren (C9)         | 🔴 Geplant | 4 falsche Zeilen berichtigen                     | LLM           |
| L4     | Fehlende Auth-Routen-Doku-Zeilen ergänzen (C10)        | 🔴 Geplant | 2 neue Tabellenzeilen                            | LLM           |
| L5     | Testabdeckung + Doku-Nachzug (Abschluss)               | 🔴 Geplant | Vollsuite grün, Kategorie-06-Datei aktualisieren | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. **C2, C4, C6, C8 haben keinen eigenen Meilenstein** — bereits vorbildlich, kein Handlungsbedarf. **C3 hat keinen eigenen Meilenstein** — bereits vollständig in `06_6` (E9/L5) erfasst, hier nur zur Vollständigkeit der 10-Segment-Liste benannt, keine Dopplung.

## 3 — Abgrenzung zu verwandten Plänen

- **`06_6` (Distributed-/Edge-Konsistenz):** C3 (Telegram-Webhook/Routenzahl-Drift) ist **bereits vollständig** dessen E9/L5 zugeordnet — dieser Plan behandelt **ausschließlich** die zusätzlich hier gefundenen Doku-Fehler (C9: falsche Einheiten bei bet/blackjack/bet-crash-mp/fraud-scan; C10: fehlende Auth-Routen-Zeilen), die in `06_6` nicht erfasst sind. **Empfehlung: `06_6` L5 (Doku-Drift beheben) und dieser Plans L3/L4 in derselben Sitzung bearbeiten**, da beide dieselbe Datei (`xx_docs/08_api_backend_context.md`) anfassen.
- **`06_4` (Testabdeckung):** Dort geht es um Race-Conditions und Red-Team-Skript-Unit-Tests. Hier (L1) geht es um etwas Einfacheres und Spezifischeres: **die konkreten Zahlenwerte selbst als Regressionsschutz verankern** — eine andere Testart, keine Dopplung.
- **`06_1`/`06_2` (ausgeführt):** L0 (Konstanten-Datei) sollte die bereits vorbildlichen Konstanten aus deren Modulen (`daily-cost-cap.ts`, `promo-guess-guard.ts`, `bet-velocity-guard.ts`, `login-guard`) als Vorbild nehmen, ändert aber nichts an deren Code.

## 4 — Meilensteine im Detail

### L0 — Money-Pfad-Schwellenwerte als benannte Konstanten (C1, höchste Priorität)

**Ziel:** Kein rohes Zahlenliteral mehr an einer sicherheitsrelevanten Rate-Limit-Stelle im Money-Pfad.
**Scope:** Neue Datei `src/lib/security/rate-limit-config.ts` mit benannten, exportierten Konstanten nach dem bereits etablierten Muster der neueren Module (`daily-cost-cap.ts:8-23`): `CASINO_BET_LIMIT = 30`, `CASINO_BET_WINDOW_SECONDS = 10`, `BLACKJACK_ACTION_LIMIT = 20`, `BLACKJACK_ACTION_WINDOW_SECONDS = 10`, `CASINO_BET_CRASH_MP_LIMIT = 30`, `CASINO_BET_CRASH_MP_WINDOW_SECONDS = 10`, `WALLET_REDEEM_LIMIT = 10`, `WALLET_REDEEM_WINDOW_SECONDS = 60` (Werte unverändert aus dem bestehenden Code übernommen — reines Refactoring, keine Verhaltensänderung). Vier betroffene Routen (`bet/route.ts:103`, `blackjack/route.ts:119-123`, `bet-crash-multiplayer/route.ts:96`, `redeem-code/route.ts:77-80`) importieren die Konstanten statt der Roh-Literale.
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** `security-reviewer` PASS (Änderung an vier Money-Pfad-Dateien, auch wenn nur Refactoring).
**Verifizierung:** Test bestätigt identisches Verhalten vor/nach der Änderung (429 bei exakt demselben Schwellenwert wie zuvor) — reiner Regressionstest, keine neue Funktionalität.
**Nicht-Scope:** Keine Änderung der eigentlichen Zahlenwerte, keine Migration der Admin-/Read-Routen-Schwellenwerte (die bleiben bewusst lokal, da bereits konsistent skaliert — siehe C6).
**Money-Pfad:** Ja (reines Refactoring, kein Verhaltenswechsel) · **Security-Review:** Pflicht.

### L1 — Threshold-Regressionstests (C7)

**Ziel:** Ein versehentlicher Zahlendreher (30 → 300) an einer Money-Pfad-Rate-Limit-Stelle fällt automatisch auf.
**Scope:** Neue Tests, die die in L0 eingeführten Konstanten direkt importieren und assertieren, dass ihr Wert dem erwarteten Produktionswert entspricht (`expect(CASINO_BET_LIMIT).toBe(30)` usw.) — ergänzt um einen Integrationstest pro Route, der den (N+1)-ten Aufruf innerhalb des Fensters tatsächlich mit 429 abgelehnt sieht, unter Verwendung der importierten Konstante statt eines hartkodierten Testwerts (damit der Test bei einer künftigen, bewussten Wertänderung automatisch mitzieht, aber eine UNBEABSICHTIGTE Änderung trotzdem auffällt, weil der Konstanten-Wert-Test separat existiert).
**Abhängigkeiten:** L0 (testet die dort eingeführten Konstanten).
**Freigabe-Gate:** Alle neuen Tests grün.
**Verifizierung:** Test schlägt bewusst fehl, wenn `CASINO_BET_LIMIT` testweise auf einen falschen Wert gesetzt wird (negativer Kontrollfall).
**Nicht-Scope:** Keine Race-Condition-/Concurrency-Tests (das ist `06_4`).
**Money-Pfad:** Nein (nur Tests) · **Security-Review:** Nein.

### L2 — Empirische Begründung nachtragen (C5)

**Ziel:** Die Wahl von 30/10s (Bet), 20/10s (Blackjack) etc. ist nachvollziehbar dokumentiert, nicht nur implizit.
**Scope:** Kurzer Begründungskommentar direkt über jeder Konstante aus L0 (analog zu `daily-cost-cap.ts:8-18`) — basierend auf einer nachvollziehbaren Herleitung: z. B. „30 Bets/10s entspricht einem sehr schnellen menschlichen Klick-Tempo (~1 Bet alle 333ms), deutlich über dem, was UI-Interaktion realistisch zulässt, aber unter automatisiertem Skript-Tempo" — **falls keine bessere Herleitung auffindbar ist, wird das ehrlich als „plausibler, aber unbelegter Erfahrungswert" gekennzeichnet statt eine nachträgliche Pseudo-Begründung zu erfinden** (Ehrlichkeitsgebot, keine Fabrikation).
**Abhängigkeiten:** L0.
**Freigabe-Gate:** Keins (reine Dokumentation).
**Verifizierung:** Jede der 8 Konstanten aus L0 hat einen Begründungskommentar oder eine explizite „unbelegter Erfahrungswert"-Kennzeichnung.
**Nicht-Scope:** Kein nachträglicher Lasttest zur echten empirischen Herleitung (unverhältnismäßiger Aufwand für ein Lernprojekt ohne echten Angriffsdruck).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L3 — `xx_docs/08`-Einheiten-Fehler korrigieren (C9)

**Ziel:** Die Dokumentation zeigt die tatsächlichen Einheiten und Werte.
**Scope:** `xx_docs/08_api_backend_context.md:54,55,56` von „60/min" auf die echten Werte (`30/10s`, `20/10s`, `30/10s`) korrigieren; `:119` von „5/min" auf `1/300s` korrigieren. **Ausführungsreihenfolge-Hinweis:** In derselben Sitzung wie `06_6` L5 bearbeiten (dieselbe Datei), um nicht zweimal denselben Dateikontext zu laden.
**Abhängigkeiten:** Keine (unabhängig von L0-L2, aber siehe Ausführungsreihenfolge-Hinweis).
**Freigabe-Gate:** Keins (reine Dokumentation).
**Verifizierung:** Alle vier korrigierten Zeilen stimmen mit den Werten aus L0s Konstanten überein.
**Nicht-Scope:** Keine Restrukturierung der gesamten Tabelle.
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L4 — Fehlende Auth-Routen-Doku-Zeilen ergänzen (C10)

**Ziel:** `/api/auth/login-guard` und `/api/auth/signup-suspicion` sind in der Routen-Dokumentation auffindbar.
**Scope:** Zwei neue Zeilen in `xx_docs/08_api_backend_context.md`s Routen-Tabelle mit den tatsächlichen Werten (Login-Guard 5/60s IP-basiert, Signup-Suspicion 10/60s IP-basiert — beide aus dem bereits ausgeführten `06_1`-Plan).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Keins (reine Dokumentation).
**Verifizierung:** Beide Routen erscheinen mit korrekten Werten in der Tabelle.
**Nicht-Scope:** Keine Doku-Zeilen für die übrigen neuen `06_1`/`06_2`-Module (die sind interne Guards, keine eigenen API-Routen, gehören nicht in diese Routen-Tabelle).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L5 — Testabdeckung + Doku-Nachzug (Abschluss)

**Ziel:** Vollständiger Regressionsnachweis, Kategorie-06-Datei aktualisiert.
**Scope:** Vollständiger `npm test`-Lauf, `npm run typecheck`, `npm run lint`. Danach: `06_rate_limiting_abuse_prevention.md` Unterkategorie #1 aktualisieren (Niveau-Neubewertung, Status von „Execution-Ready" auf „Executed"), `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md` Zeile #1 nachziehen, `T_RATE_LIMITING_ABUSE_PREVENTION/00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md` Zeile #1 nachziehen (dort noch „Nein (in Arbeit)").
**Abhängigkeiten:** L0–L4.
**Freigabe-Gate:** Vollsuite grün, 0 TS-/Lint-Fehler.
**Verifizierung:** Testlauf-Zahlen im Ausführungsprotokoll dieser Datei dokumentieren.
**Nicht-Scope:** Keine Ausweitung auf andere Unterkategorien.
**Money-Pfad:** Nein · **Security-Review:** Nein.

## 5 — Selbstprüfung (durchgeführt 2026-09-05)

- ✅ Scope gegenüber `06_6` und `06_4` abgegrenzt (Abschnitt 3), inkl. expliziter Ausführungsreihenfolge-Empfehlung (L3 mit `06_6` L5 in derselben Sitzung).
- ✅ Jeder Meilenstein hat Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung/Nicht-Scope/Money-Pfad/Security-Review.
- ✅ Alle Zuständigkeiten = LLM.
- ✅ C3 (bereits von `06_6` erfasst) wurde nicht dupliziert, sondern explizit als „kein Meilenstein hier" markiert — verhindert doppelte Zählung im Kategorie-Schnitt.
- ⚠️ **Nachträglich gefunden beim Selbst-Review:** L2 (empirische Begründung) hätte leicht zu einer fabrizierten Pseudo-Rechtfertigung verleiten können — explizit als „ehrlich als unbelegt kennzeichnen, falls keine echte Herleitung auffindbar" formuliert, um keine Scheinbegründung zu erfinden.
- ⚠️ **Nachträglich gefunden:** Zwei unabhängige Explorer-Läufe für diese Unterkategorie kamen zu übereinstimmenden Ergebnissen (ein erster Lauf wurde durch einen Turn-Limit-Abbruch gestört, ein zweiter, enger gescopter Lauf lieferte dieselben Kernfunde) — die Befunde sind dadurch doppelt bestätigt, kein Konsistenzproblem gefunden.
- ✅ Kein Punkt doppelt als SOP/Kontextreferenz/Plan gepflegt.

## 6 — Offene Fragen für Jan (je 3 Antwortoptionen)

**Q1 — Soll L0 (Konstanten-Datei) auch die bereits gut benannten Konstanten der Admin-Routen und der 5 neueren Module (C6, C8) in dieselbe zentrale Datei konsolidieren, oder nur die 4 bislang unbenannten Money-Pfad-Werte ergänzen?**

- (a) Nur die 4 unbenannten Money-Pfad-Werte ergänzen — kleinerer, risikoärmerer Scope, die bereits guten Module bleiben unangetastet. _(Empfehlung)_
- (b) Alle Rate-Limit-Konstanten projektweit in `rate-limit-config.ts` konsolidieren — einheitlicher, aber größerer Diff mit mehr Berührungspunkten.
- (c) Nur die 4 Money-Pfad-Werte jetzt, mit explizit dokumentierter Absicht, später auch die restlichen zu konsolidieren (Zwischenlösung).

**Q2 — Soll L2 (empirische Begründung) mit einer echten Recherche zu vergleichbaren Casino-/Gaming-Plattform-Standardwerten unterlegt werden (WebSearch), oder reicht eine interne, plausible Herleitung?**

- (a) Interne plausible Herleitung reicht, ehrlich als Erfahrungswert gekennzeichnet — kein Aufwand für eine Aussenrecherche, die für ein Lernprojekt ohnehin nicht bindend wäre. _(Empfehlung)_
- (b) Kurze WebSearch-Recherche zu Branchenüblichem (z. B. wie andere Casino-Plattformen Bet-Rate-Limits dimensionieren), um die Begründung zu stärken.
- (c) Keine Begründung nachtragen — die Zahlen funktionieren, eine Herleitung ist optionaler Luxus für dieses Lernprojekt.

## 7 — Verwandte Artefakte

| Bedarf                                                                                    | Datei                                                                                                   |
| :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| Vollständige Kategorie-06-Aufschlüsselung (Ursprung dieses Plans)                         | [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md)                          |
| Kompakte Kategorie-Overview                                                               | [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md) |
| Gewichtete Kategorie-Übersicht (dieser Ordner)                                            | [`00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md`](00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md)    |
| Schwester-Plan #8 (Distributed-/Edge-Konsistenz, execution-ready, teilt C3/C9-Doku-Datei) | [`06_6_distributed_edge_consistency_plan.md`](06_6_distributed_edge_consistency_plan.md)                |
| Schwester-Plan #9 (Testabdeckung, execution-ready)                                        | [`06_4_test_coverage_plan.md`](06_4_test_coverage_plan.md)                                              |
| SOP Planungsdateien (Format dieses Plans)                                                 | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)             |
| SOP Execution (nächster Schritt nach Freigabe)                                            | [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)                         |
