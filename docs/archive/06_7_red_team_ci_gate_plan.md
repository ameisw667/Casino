# 06_7 — Red-Team-CI-Gate: Umsetzungsplan

> **Status:** Executed (archiviert) · **Stand:** 2026-09-04 (Execution 2026-09-06) · **Owner:** LLM · **Scope:** Unterkategorie #6 aus [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md) (Top 50 % → nach Execution Top 25 %). Ausführungsprotokoll: Abschnitt 8. Alle Zuständigkeiten liegen beim LLM; kein Meilenstein ist auf eine Jan-Entscheidung während der Ausführung angewiesen. Diese Datei ist so geschrieben, dass eine komplett neue, kontextlose LLM-Konversation sie ohne Rückfragen ausführen kann. **Letzter Plan einer 5-teiligen Serie** (siehe Abschnitt 3 für alle vier Schwester-Pläne).
> **Quellcode-Basis:** Alle Befunde unten wurden am 2026-09-04 durch einen read-only `casino-code-explorer`-Lauf gegen den tatsächlichen Code verifiziert. **Bemerkenswert:** Zwei der Meilensteine unten (L0, L2) sind **keine neuen LLM-Funde**, sondern bereits vom ursprünglichen Autor selbst in `docs/security-hardening/09_red_team_probes.md` als offene TODOs benannt (einer davon mit dem Datum 2026-09-04, also demselben Tag) — dieser Plan setzt sie um, statt sie neu zu erfinden.

## 0 — Kontext für die ausführende Session

Der Grund für `workflow_dispatch`-only ist **kein** Kosten-/Flakiness-Vorbehalt, sondern eine architektonische Entscheidung: Der Workflow nutzt `next dev` statt eines Produktions-Builds, weil `enforceRateLimit()` bei `NODE_ENV=production` ohne konfiguriertes Upstash fail-closed auf 503 geht (`red-team-security.yml:5-8`) — in einem ephemeren Runner ohne echtes Upstash würde `rate-limit-bypass.ts` in einem Prod-Build sinnlos, da jede Anfrage sofort 503 statt 429 liefert. Das ist wichtig für die ausführende Session: **Ein Wechsel auf einen Produktions-Build ist kein trivialer Zusatz-Fix** (siehe Q3 unten), sondern würde die Testarchitektur selbst ändern.

## 1 — Segmentierung: 10 Sub-Unterkategorien

| #   | Sub-Unterkategorie                                 | Niveau          | Status quo (verifiziert)                                                                                                                                                                                                                                                                                                                                                 | Beleg                                                    |
| :-- | :------------------------------------------------- | :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| R1  | Anti-Produktions-Safety-Check                      | **Top 15 %** 🟡 | `target-guard.ts` → `phase1-target-guard.ts:3-28`: dreifach abgesichert — Env-Flag `PHASE1_TARGET_CONFIRMED`, Origin-Vergleich gegen `NEXT_PUBLIC_SUPABASE_URL`, Hostname-Regex gegen „prod/production/live". Solide.                                                                                                                                                    | `scripts/phase1-target-guard.ts:3-28`                    |
| R2  | Ephemeral-Bootstrap-Infrastruktur                  | **Top 20 %** 🟡 | `ephemeral-bootstrap.ts`: 3 Disposable-Test-User (Admin/Non-Admin/Fremd) mit echten `@supabase/ssr`-Cookies, konsistent mit der echten App-Auth. Durchdacht.                                                                                                                                                                                                             | `scripts/red-team/ephemeral-bootstrap.ts:24-26,58,77-91` |
| R9  | `security-staging.yml` als Machbarkeits-Präzedenz  | **Top 25 %** 🟡 | Identisches Ephemeral-Supabase-Kostenprofil läuft dort bereits automatisch (`push`+Pfad-Filter). Starker Beleg, dass ein automatischer Trigger für `red-team-security.yml` technisch/kostenmäßig machbar wäre.                                                                                                                                                           | `security-staging.yml:19-30,47-48,78-80`                 |
| R8  | Synthetische User nicht lastrepräsentativ          | **Top 40 %** 🟡 | Vom Autor selbst dokumentierte, akzeptierte Grenze (`09_red_team_probes.md:63`) — für ein Sicherheits-Gate (nicht Lasttest) ausreichend.                                                                                                                                                                                                                                 | `docs/security-hardening/09_red_team_probes.md:63`       |
| R4  | Fehlender `concurrency`-Block                      | **Top 55 %** 🟠 | Weder `red-team-security.yml` noch `security-staging.yml` haben einen `concurrency`-Block — bei künftigem automatischem Trigger könnten mehrere Läufe parallel dieselbe ephemere DB beanspruchen. `quality-ci.yml`/`schema-drift-check.yml`/`backup-drill.yml` haben das Muster bereits etabliert.                                                                       | Grep `concurrency` über `.github/workflows/*.yml`        |
| R7  | Dev- vs. Prod-Verhaltensunterschied ungetestet     | **Top 60 %** 🟠 | Vom Autor selbst dokumentierte Limitation (`09_red_team_probes.md:62`) — architektonisch bedingt (siehe Abschnitt 0), kein einfacher Fix.                                                                                                                                                                                                                                | `docs/security-hardening/09_red_team_probes.md:62`       |
| R10 | Kein automatischer Katalog-Vollständigkeits-Check  | **Top 65 %** 🟠 | `scripts/red-team/test-catalog.json` listet nur 2 Probe-Typen — nichts gleicht diesen Katalog automatisch gegen die reale, wachsende Routenliste ab (56 Routen, siehe `06_6`).                                                                                                                                                                                           | `scripts/red-team/test-catalog.json:5-6`                 |
| R6  | **Bot-Bypass-Testfall fehlt (Autor-TODO)**         | **Top 75 %** 🔴 | Autor selbst, datiert **2026-09-04**: „Bot-Bypass-Testfall für die neueren Anti-Automatisierungs-Guards ergänzen" (`login-guard`, `signup-guard`, `promo-guess-guard`, `bet-velocity-guard`, `daily-cost-cap`) — explizit benannt, nie gebaut.                                                                                                                           | `docs/security-hardening/09_red_team_probes.md:72`       |
| R3  | **Trigger-Konfiguration `workflow_dispatch`-only** | **Top 80 %** 🔴 | Autor selbst: „nächster sinnvoller Schritt... wöchentlicher `schedule`-Trigger statt nur `workflow_dispatch`" (`09_red_team_probes.md:71`) — benannt, nie umgesetzt. Bedeutet: eine Regression fällt nie automatisch auf.                                                                                                                                                | `docs/security-hardening/09_red_team_probes.md:61,71`    |
| R5  | **Probe-Coverage-Lücke (56 Routen, nur 2 Proben)** | **Top 85 %** 🔴 | Money-/Auth-nahe Routen ohne jegliche Probe: `redeem-code`, `bet-crash-multiplayer`, `jackpot`, `user/balance`, `admin/promo-codes`, `admin/fraud`+`scan`+`complete-wait`, `login-guard`, `signup-suspicion`, `self-exclusion`, `daily-race`. Plus die zwei aus `06_6` bekannten ungeschützten Routen (`guide-persona`, `telegram/webhook`) fehlen ebenfalls im Katalog. | `test-catalog.json:5-6` vs. 56-Routen-Inventar           |

**Marker-Konvention:** identisch zu `06_rate_limiting_abuse_prevention.md`.

**Rechnerischer Schnitt über alle 10 Positionen:** (15+20+25+40+55+60+65+75+80+85)/10 = **Top 52,0 %** — nur leicht schlechter als der bisherige Top-50-%-Bestwert, da diese Unterkategorie bereits vom ursprünglichen Autor selbst ehrlich und detailliert dokumentiert wurde (`09_red_team_probes.md` Abschnitt 5/6) — die größte „Überraschung" fehlt hier im Gegensatz zu anderen Unterkategorien dieser Serie, weil die Lücken bereits bekannt und benannt waren, nur nicht umgesetzt.

## 2 — Übersicht für Jan

| Nummer | Meilenstein                                                       | Status     | Nächster Schritt                                 | Zuständigkeit |
| ------ | ----------------------------------------------------------------- | ---------- | ------------------------------------------------ | ------------- |
| L0     | Wöchentlichen Schedule-Trigger ergänzen (R3, Autor-TODO)          | 🔴 Geplant | `cron`-Trigger nach `backup-drill.yml`-Muster    | LLM           |
| L1     | Concurrency-Block ergänzen (R4)                                   | 🔴 Geplant | Beide betroffenen Workflows absichern            | LLM           |
| L2     | Bot-Bypass-Testfall ergänzen (R6, Autor-TODO, datiert 2026-09-04) | 🔴 Geplant | Neuer Probe-Fall gegen 5 Guard-Module            | LLM           |
| L3     | Probe-Coverage erweitern (R5)                                     | 🔴 Geplant | Neue Probe-Skripte für 10+ ungetestete Routen    | LLM           |
| L4     | Katalog-Vollständigkeits-Check (R10)                              | 🔴 Geplant | `test-catalog.json` gegen Routenliste abgleichen | LLM           |
| L5     | Testabdeckung + Doku-Nachzug (Abschluss)                          | 🔴 Geplant | Vollsuite grün, Kategorie-06-Datei aktualisieren | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. **R1, R2, R7, R8, R9 haben keinen eigenen Meilenstein** — R1/R2 sind bereits solide, R7 ist eine architektonische Grenze ohne einfachen Fix (Q3 unten), R8/R9 sind Kontext-Feststellungen ohne eigenen Handlungsbedarf.

## 3 — Abgrenzung zu verwandten Plänen (alle vier Schwester-Pläne dieser Serie)

- **`06_3` (Multi-Account):** L3 dieses Plans sollte Probe-Coverage für `admin/fraud`-Routen einschließen — überschneidungsfrei, da `06_3` die Erkennungs-**Logik** plant, dieser Plan nur eine **Live-Angriffssimulation** dagegen.
- **`06_4` (Testabdeckung):** Dort (T5/L1) werden **Unit-Tests** für die Skript-Logik selbst ergänzt (mockbare Funktionen statt String-Contains-Checks). Dieser Plan ändert die **CI-Trigger-Konfiguration** und den **Proben-Katalog** — unterschiedliche Ebenen, in beiden Plänen bereits explizit gegenseitig referenziert.
- **`06_5` (Identifier-/IP-Extraktion):** Keine direkte Überschneidung.
- **`06_6` (Distributed-/Edge-Konsistenz):** L4 dieses Plans (Katalog-Vollständigkeits-Check) sollte **auf der Routenliste aus `06_6` L3 aufbauen** (dortiger Vollständigkeits-Check liefert die kanonische Routenliste) — **Ausführungsreihenfolge-Empfehlung: `06_6` vor diesem Plan ausführen**, falls beide anstehen.

## 4 — Meilensteine im Detail

### L0 — Wöchentlichen Schedule-Trigger ergänzen (R3, Autor-TODO)

**Ziel:** Eine Regression im Rate-Limit-/IDOR-Schutz fällt automatisch auf, statt nur bei manuellem Auslösen.
**Scope:** `red-team-security.yml` Trigger-Block um `schedule: - cron: '0 4 * * 0'` erweitern (Sonntag 04:00 UTC, nach dem `backup-drill.yml`-Muster `0 3 * * 0`, eine Stunde versetzt um Ressourcen-Kollisionen zu vermeiden), zusätzlich zu `workflow_dispatch` (nicht als Ersatz). **Bewusst wöchentlich, nicht bei jedem Push/PR** — der Autor-TODO nennt explizit „wöchentlich", nicht „bei jedem PR", vermutlich wegen der 15-Minuten-Laufzeit und des Ephemeral-Stack-Aufwands (siehe R9-Kontext: `security-staging.yml` läuft zwar bei Push, aber nur pfadgefiltert auf `supabase/migrations/**` etc. — ein Red-Team-Lauf betrifft potenziell JEDE Route, ein sinnvoller Pfadfilter wäre unpraktisch breit).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Workflow-Syntax valide (`gh workflow view` oder lokales YAML-Lint).
**Verifizierung:** Ein manuell ausgelöster Testlauf nach der Änderung bleibt unverändert grün (Regressionstest für die YAML-Änderung selbst).
**Nicht-Scope:** Kein Push/PR-Trigger (bewusst nicht, siehe Begründung oben).
**Money-Pfad:** Nein · **Security-Review:** Nein (CI-Konfiguration, kein Code-Pfad).

### L1 — Concurrency-Block ergänzen (R4)

**Ziel:** Verhindern, dass zwei gleichzeitige Läufe (z. B. ein manueller `workflow_dispatch` während des neuen wöchentlichen Laufs) sich denselben ephemeren Supabase-Stack streitig machen.
**Scope:** `concurrency: { group: red-team-security-${{ github.ref }}, cancel-in-progress: true }` in `red-team-security.yml` UND `security-staging.yml` ergänzen (exaktes Muster aus `quality-ci.yml:15-17`).
**Abhängigkeiten:** L0 (macht das Risiko erst praktisch relevant, da vorher nur ein einzelner manueller Trigger existierte).
**Freigabe-Gate:** Keins (reine CI-Konfiguration).
**Verifizierung:** Zwei parallel gestartete Läufe — der ältere wird abgebrochen, nur der neuere läuft durch (manueller Test via `gh workflow run` zweimal kurz hintereinander, oder Dokumentation der Konfiguration als ausreichend, falls ein Live-Test zu aufwändig ist).
**Nicht-Scope:** Keine Änderung an anderen Workflows außer den zwei genannten.
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L2 — Bot-Bypass-Testfall ergänzen (R6, Autor-TODO, datiert 2026-09-04)

**Ziel:** Die neuen Anti-Automatisierungs-Guards aus `06_1` (bereits ausgeführt) bekommen eine Live-Angriffssimulation, genau wie vom ursprünglichen Autor geplant.
**Scope:** Neues Skript `scripts/red-team/bot-bypass.ts` (analog zur Struktur von `rate-limit-bypass.ts`): simuliert einen automatisierten Signup (Honeypot gefüllt ODER Submit < 2s) gegen `/api/auth/signup-suspicion`, einen Login-Flood gegen `/api/auth/login-guard`, und einen Promo-Guess-Flood gegen `/api/casino/redeem-code` — erwartet in JEDEM Fall **fail-open Erfolg** (die eigentliche Aktion geht durch, das ist bewusstes Design aus `06_1`), aber **zusätzlich** ein passendes `bot_signal_*`-Risk-Event in `risk_events` (per Service-Role-Query direkt gegen die ephemere Test-DB verifiziert, nicht über die Admin-UI). `test-catalog.json` um den neuen Probe-Typ erweitern.
**Abhängigkeiten:** `ephemeral-bootstrap.ts` (bestehende Test-User wiederverwenden).
**Freigabe-Gate:** Neues Skript läuft im CI-Kontext durch (grün bedeutet hier: Signal wurde korrekt erzeugt, nicht dass die Aktion blockiert wurde — fail-open ist das erwartete, korrekte Verhalten).
**Verifizierung:** Lokaler Testlauf des neuen Skripts gegen einen `npm run dev`-Prozess mit lokalem Supabase, vor dem Einbau in die CI-Pipeline.
**Nicht-Scope:** Kein Test der Chat/Guide-Tages-Cap-Guard (das wäre ein Kostentest, kein Sicherheitstest — bewusst ausgeklammert).
**Money-Pfad:** Ja (Redeem-Code-Pfad) · **Security-Review:** Nein (reines Test-Tooling, kein Produktionscode).

### L3 — Probe-Coverage erweitern (R5)

**Ziel:** Die größten Money-/Auth-Lücken im Proben-Katalog schließen.
**Scope:** Neue Probe-Skripte (gleiche Struktur wie `rate-limit-bypass.ts`) für die höchste-Priorität-Teilmenge: `redeem-code` (Promo-Brute-Force-Rate-Limit), `bet-crash-multiplayer` (separater Transport-Layer, aktuell komplett ungetestet), `admin/fraud` PATCH (IDOR-Analogon zu `admin-idor.ts`, aber für Risk-Event-Status statt Balance). **Bewusst nicht alle 10 gefundenen Lücken auf einmal** — die drei genannten sind Geld-/Autorisierungs-kritisch, der Rest (jackpot, balance, daily-race, promo-codes-Erstellung) ist niedrigeres Risiko und wird als Folgeaufgabe in L5 vermerkt, nicht in diesem Plan gebaut (Scope-Begrenzung, um den Plan klein und ausführbar zu halten).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Neue Skripte laufen lokal durch, bevor sie in die CI-Pipeline eingebaut werden.
**Verifizierung:** Jedes neue Skript hat einen dokumentierten Erwartungswert (welcher Statuscode/welches Verhalten bei Überschreiten der jeweiligen Schwelle).
**Nicht-Scope:** Die übrigen 7 gefundenen Lücken (jackpot, balance, daily-race, promo-codes-Admin-Erstellung, `guide-persona`, `telegram/webhook`, `self-exclusion`) — als benannte, aber nicht gebaute Folgeaufgabe dokumentiert.
**Money-Pfad:** Ja · **Security-Review:** Nein (Test-Tooling).

### L4 — Katalog-Vollständigkeits-Check (R10)

**Ziel:** Der Proben-Katalog driftet nicht mehr unbemerkt von der echten Routenliste weg.
**Scope:** Neuer Test/Skript, der `test-catalog.json` gegen die kanonische Routenliste aus `06_6`s L3-Vollständigkeits-Check abgleicht und warnt (nicht hart blockiert — ein Warn-Log reicht, da nicht jede Route eine Red-Team-Probe braucht, siehe R5-Scope-Begrenzung), wenn eine neue Geld-/Auth-Route ohne jegliche Katalog-Erwähnung hinzukommt.
**Abhängigkeiten:** `06_6` L3 (liefert die Routenliste, auf der dieser Check aufbaut — siehe Abschnitt 3, Ausführungsreihenfolge-Empfehlung).
**Freigabe-Gate:** Neuer Check läuft durch und identifiziert korrekt die in L3 bewusst ausgeklammerten 7 Routen als „bekannt, nicht gebaut" (nicht als Fehler, sondern informativ).
**Verifizierung:** Test des Checks selbst (negativer Kontrollfall: eine simulierte neue Route ohne Katalog-Eintrag wird erkannt).
**Nicht-Scope:** Kein hartes CI-Gate, das den Build blockiert (bewusst nur Sichtbarkeit, analog zur Empfehlung in `06_4` L2 für das Coverage-Gate).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L5 — Testabdeckung + Doku-Nachzug (Abschluss)

**Ziel:** Vollständiger Regressionsnachweis, Kategorie-06-Datei aktualisiert, offene Folgeaufgaben sauber dokumentiert.
**Scope:** Vollständiger `npm test`-Lauf, `npm run typecheck`, `npm run lint`, ein manuell ausgelöster `red-team-security.yml`-Lauf mit allen neuen Proben. Danach: `06_rate_limiting_abuse_prevention.md` Unterkategorie #6 aktualisieren (Niveau-Neubewertung, Status von „Execution-Ready" auf „Executed"), `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md` Zeile #6 nachziehen, `docs/security-hardening/09_red_team_probes.md` um die neuen Proben und den erledigten Autor-TODO-Status ergänzen. Die in L3 ausgeklammerten 7 Routen als benannte Folgeaufgabe in `docs/security-hardening/09_red_team_probes.md` Abschnitt 6 vermerken (nicht stillschweigend fallen lassen).
**Abhängigkeiten:** L0–L4.
**Freigabe-Gate:** Vollsuite grün, 0 TS-/Lint-Fehler, manueller Red-Team-Lauf grün.
**Verifizierung:** Testlauf-Zahlen und CI-Run-ID im Ausführungsprotokoll dieser Datei dokumentieren (analog zu `06_1`/`06_2`).
**Nicht-Scope:** Keine Ausführung der übrigen vier Schwester-Pläne dieser Serie (bleiben eigenständig).
**Money-Pfad:** Nein · **Security-Review:** Nein.

## 5 — Selbstprüfung (durchgeführt 2026-09-04)

- ✅ Scope gegenüber allen vier Schwester-Plänen dieser Serie abgegrenzt (Abschnitt 3), inkl. einer expliziten Ausführungsreihenfolge-Empfehlung gegenüber `06_6`.
- ✅ Jeder Meilenstein hat Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung/Nicht-Scope/Money-Pfad/Security-Review.
- ✅ Alle Zuständigkeiten = LLM.
- ✅ Zwei bereits vom Original-Autor benannte TODOs (L0, L2) wurden nicht als „neue LLM-Erkenntnis" verkauft, sondern korrekt zugeschrieben — Ehrlichkeit über die Herkunft der Befunde.
- ⚠️ **Nachträglich gefunden beim Selbst-Review:** L3 (Probe-Coverage) hätte leicht auf „alle 10 Lücken auf einmal bauen" ausufern können — bewusst auf 3 Geld-/Autorisierungs-kritische Fälle begrenzt, Rest als benannte Folgeaufgabe in L5 dokumentiert statt stillschweigend fallen gelassen.
- ⚠️ **Nachträglich gefunden:** L4 hängt von `06_6` L3 ab, die noch nicht ausgeführt ist — als Abhängigkeit und Ausführungsreihenfolge-Empfehlung bereits im Meilenstein-Text und in Abschnitt 3 vermerkt, keine versteckte Blockade.
- ✅ Kein Punkt doppelt als SOP/Kontextreferenz/Plan gepflegt.

## 6 — Offene Fragen für Jan (je 3 Antwortoptionen)

**Q1 — Soll L0 (Schedule-Trigger) wöchentlich bleiben, oder auf jeden Push zu sicherheitsrelevanten Pfaden umgestellt werden (analog zu `security-staging.yml`)?**

- (a) Wöchentlich, wie vom Original-Autor vorgeschlagen — ausreichend für ein Lernprojekt ohne hohe Deploy-Frequenz, geringere CI-Kosten. _(Empfehlung)_
- (b) Bei jedem Push zu `src/lib/security/**`, `src/app/api/casino/**`, `src/app/api/auth/**` (pfadgefiltert wie `security-staging.yml`) — engmaschiger, aber mehr CI-Laufzeit.
- (c) Beides: wöchentlich UND pfadgefiltert bei Push — maximale Absicherung, höchste Kosten.

**Q2 — Soll L3 (Probe-Coverage) auf die verbleibenden 7 Routen ausgeweitet werden, sobald dieser Plan abgeschlossen ist?**

- (a) Nein, die 3 wichtigsten reichen für diese Ausbaustufe — der Rest bleibt eine dokumentierte, bewusst nachrangige Folgeaufgabe. _(Empfehlung — Umfang begrenzt halten)_
- (b) Ja, als direkter Folgeplan mit fester Reihenfolge nach Risiko (jackpot/balance vor daily-race/promo-codes-Erstellung).
- (c) Ja, aber nur `guide-persona`/`telegram/webhook` zusätzlich (die zwei aus `06_6` bekannten, echten Lücken), Rest bleibt offen.

**Q3 — Soll R7 (Dev-vs-Prod-Verhaltensunterschied) in einer separaten Ausbaustufe angegangen werden (z. B. ein zweiter, paralleler Red-Team-Lauf gegen einen echten Prod-Build mit einem Test-Upstash-Account)?**

- (a) Nein — der Aufwand (echter Upstash-Test-Account, zusätzliche Secrets-Verwaltung) steht in keinem Verhältnis zum Zusatznutzen für ein Lernprojekt. _(Empfehlung)_
- (b) Ja, als eigener, kleiner Folgeplan mit einem dedizierten, kostenlosen Upstash-Test-Account nur für CI.
- (c) Nur dokumentieren als bewusst akzeptierte, dauerhafte Grenze (kein Folgeplan, aber auch keine stillschweigende Lücke).

## 7 — Verwandte Artefakte

| Bedarf                                                                                            | Datei                                                                                                                                                                |
| :------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vollständige Kategorie-06-Aufschlüsselung (Ursprung dieses Plans)                                 | [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md)                                                                                       |
| Kompakte Kategorie-Overview                                                                       | [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md)                                                              |
| Schwester-Plan #10 (Multi-Account, execution-ready)                                               | [`06_3_multi_account_abuse_prevention_plan.md`](06_3_multi_account_abuse_prevention_plan.md)                                                                         |
| Schwester-Plan #9 (Testabdeckung, execution-ready)                                                | [`06_4_test_coverage_plan.md`](06_4_test_coverage_plan.md)                                                                                                           |
| Schwester-Plan #2 (Identifier-/IP-Extraktion, execution-ready)                                    | [`06_5_identifier_ip_extraction_plan.md`](06_5_identifier_ip_extraction_plan.md)                                                                                     |
| Schwester-Plan #8 (Distributed-/Edge-Konsistenz, executed 2026-09-06, liefert Routenliste für L4) | [`06_6_distributed_edge_consistency_plan.md`](../docs/archive/06_6_distributed_edge_consistency_plan.md)                                                             |
| Original-Autor-Dokumentation mit den beiden umgesetzten TODOs                                     | [`docs/security-hardening/09_red_team_probes.md`](../docs/security-hardening/09_red_team_probes.md)                                                                  |
| Ausgeführter Plan Bot-Detection (Ursprung der L2-Guard-Module)                                    | [`docs/archive/06_1_bot_automation_detection_plan.md`](../docs/archive/06_1_bot_automation_detection_plan.md)                                                        |
| Machbarkeits-Präzedenzfall für automatischen Trigger                                              | [`.github/workflows/security-staging.yml`](../.github/workflows/security-staging.yml), [`.github/workflows/backup-drill.yml`](../.github/workflows/backup-drill.yml) |
| SOP Planungsdateien (Format dieses Plans)                                                         | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                                                                          |
| SOP Execution (nächster Schritt nach Freigabe)                                                    | [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)                                                                                      |

## 8 — Ausführungsprotokoll (2026-09-06)

### 8.1 — Meilensteine

| Meilenstein           | Status | Details                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :-------------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0 — Schedule-Trigger | 🟢     | `schedule: cron '0 4 * * 0'` (wöchentlich, Sonntag 04:00 UTC, eine Stunde nach `backup-drill.yml` `'0 3 * * 0'`) ergänzt, `workflow_dispatch` bewusst als Ersatz-NICHT entfernt; Kommentarblock dokumentiert die Wöchentlich-Begründung (Q1a). YAML-Struktur validiert via `red-team-contract.test.ts` (neuer Test pinnt `'0 4 * * 0'` + `workflow_dispatch` im Workflow-Text).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| L1 — Concurrency      | 🟢     | `concurrency: { group: red-team-security-${{ github.ref }}, cancel-in-progress: true }` in `red-team-security.yml`, `group: security-staging-${{ github.ref }}` analog in `security-staging.yml` — exakt das `quality-ci.yml:15-17`-Muster. Beide Blöcke per Test gepinnt (auch `security-staging.yml`). Live-Zwei-Läufe-Test nicht durchgeführt (L1-Verifizierungsalternative „Dokumentation der Konfiguration als ausreichend" gewählt).                                                                                                                                                                                                                                                                                                                                                                                                                            |
| L2 — Bot-Bypass-Probe | 🟢     | Neues `scripts/red-team/bot-bypass.ts` mit drei Flows: (1) Signup-Honeypot: `POST /api/auth/signup-suspicion {reason:'honeypot'}` mit Session-Cookie → erwartet `200 {data:{recorded:true}}` + `bot_signal_honeypot`-Row, verifiziert per Service-Role-Query gegen die ephemere DB (`subject_user_id` = Non-Admin-User). (2) Login-Flood: 7 sequenzielle `POST /api/auth/login-guard` mit fixem XFF (ein Bucket) → erwartet 5×200 dann 2×429. (3) Promo-Guess: 11 sequenzielle `POST /api/casino/redeem-code` mit identischem ungültigen Code + UUID-Idempotency-Keys → erwartet 10×400 (fail-open) + 11×429 (Transport-Backstop 10/60s) + `voucher_velocity`/`guess_threshold`-Row (evidence.code = Probe-Code). `ephemeral-bootstrap.ts` exportiert zusätzlich `RED_TEAM_NON_ADMIN_USER_ID`. Catalog-Case `bot-bypass` mit Route-Mapping in `test-catalog.json` v2. |
| L3 — Probe-Coverage   | 🟢     | `crash-mp-bypass.ts`: 32 parallele `POST /api/casino/bet-crash-multiplayer` mit `{}`-Body (Validation 400 **vor** jeder Wallet-Operation), erwartet ≥1×429 und akzeptierte ≤ `CASINO_BET_CRASH_MP_LIMIT` (30), Statusmenge ⊆ {400, 429}. `admin-fraud-idor.ts`: Nicht-Admin-`PATCH /api/admin/fraud` mit fabrizierter Event-UUID (kann keine reale Row treffen) → erwartet 401/403/404. Beide mit `assertSafePhase1Target()`. Die übrigen 7 Lücken bewusst nicht gebaut (Plan-Nicht-Scope), als `RED_TEAM_KNOWN_NOT_BUILT_ROUTES` + `09_red_team_probes.md` §6 dokumentiert.                                                                                                                                                                                                                                                                                          |
| L4 — Katalog-Check    | 🟢     | `test-catalog.json` v2: jeder Case trägt jetzt `routes`-Mapping (5 Cases, 8 Routen). Neues `scripts/red-team/catalog-coverage.ts` (`auditCatalogCoverage()` mit überschreibbaren Route-Listen für negative Kontrollen) + `red-team-catalog-coverage.test.ts`: warn-only (`console.debug`) für neue kritische Routen ohne Probe-/Nicht-Gebaut-Entscheidung, **hart** für tote Katalogeinträge und tote Not-Built-Einträge, 3 negative Kontrolltests (simulierte neue Route erkannt, tote Katalogroute erkannt, Not-Built-Route nie als Lücke gemeldet).                                                                                                                                                                                                                                                                                                                |
| L5 — Abschluss        | 🟢     | DoD siehe §8.2/§8.3; `06_rate` #6, `docs/rate-limiting/00` #6 + Schnitt, `09_red_team_probes.md` (§2 Trigger, §3 sieben Skripte, §5 Bullet 1 aufgehoben, §6 beide Autor-TODOs erledigt + 7 Folgeproben benannt), T_-Übersicht, Protokoll, git mv.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### 8.2 — Security-Reviews & DoD

- **DoD:** `npm run typecheck` 0 Fehler · `npm test` 1609/1609 grün (213 Dateien, +9 neue Tests) · `npm run lint` 0 Fehler / 23 vorbestehende Warnungen · `npm run build` erfolgreich · git status audit: nur die geplanten Dateien.
- **Security-Review:** kein formaler Review-Lauf — Plan-Angabe „Security-Review: Nein (reines Test-Tooling, kein Produktionscode)" korrekt: es wurden keine Dateien unter `src/lib/**`, `src/app/api/**` oder `supabase/migrations/**` geändert; alle Änderungen sind CI-Konfiguration, Probe-Skripte und Test-Code. Money-Pfad berührt die Proben bewusst nur read-only/ungültig (Body `{}` stoppt vor Wallet-Operationen; Redeem-Probe nutzt nur ungültige Codes; keine positive Guthaben-Bewegung möglich).
- **Migration-Guard:** n/a (keine Migration).

### 8.3 — Entscheidungen (Empfehlungs-Optionen & Abweichungen)

- **Q1 → (a) übernommen:** wöchentlicher Schedule (`'0 4 * * 0'`), kein Push/PR-Trigger (Begründung im Workflow-Kommentar: sinnvoller Pfadfilter unpraktisch breit, Kosten).
- **Q2 → (a) übernommen:** die 3 wichtigsten Proben reichen; Rest als benannte Folgeaufgabe (`RED_TEAM_KNOWN_NOT_BUILT_ROUTES` + Doku §6), keine Ausweitung.
- **Q3 → (a) übernommen:** Dev-vs-Prod-Unterschied bleibt bewusst akzeptierte Grenze (kein Test-Upstash-Account), dokumentiert in `09_red_team_probes.md` §5.
- **Abweichung 1 (dokumentiert, nicht stillschweigend):** Der Plan-Text sagte „erwartet in JEDEM Fall fail-open Erfolg + `bot_signal_*`-Event". Tatsächliches Verhalten: `login-guard` ist bewusst **kein** fail-open-Guard, sondern ein hartes 5/60s-Ceiling (06_1 L1/V2) → der Probe erwartet 5×200 dann 429 statt fail-open. Der Enum-Typ `bot_signal_login_flood` hat **keinen Producer** (2026-09-06 über ganz `src/` verifiziert) → der Login-Case verifiziert das Rate-Limit-Ceiling, kein Risk-Event; als Restlücke in §8.5 vermerkt.
- **Abweichung 2:** Für den Redeem-Flow ist das passende Signal nicht `bot_signal_*`, sondern `voucher_velocity` mit `evidence.outcome='guess_threshold'` (06_1-Bewusst-Design „existing type, no new signal_type", `promo-guess-guard.ts`) — der Probe prüft exakt dieses Event.
- **Abweichung 3:** Katalog-Check: tote Katalogeinträge/-Referenzen sind **hart** (kaputter Katalog ≠ Coverage-Lücke), nur neue unentschiedene Routen sind warn-only — eine Präzisierung der Plan-Angabe „warn-not-block", dokumentiert im Test-Kommentar.
- **Bootstrap-Erweiterung:** `RED_TEAM_NON_ADMIN_USER_ID` zusätzlich exportiert (bot-bypass braucht die User-ID für die Service-Role-Risk-Event-Query; Cookie allein reicht nicht).

### 8.4 — Niveau-Neubewertung (Sub-Schnitte)

| Sub                              | Vor      | Nach     | Begründung                                                                                         |
| :------------------------------- | :------- | :------- | :------------------------------------------------------------------------------------------------- |
| R1 Anti-Produktions-Safety-Check | Top 15 % | Top 15 % | unverändert solide                                                                                 |
| R2 Ephemeral-Bootstrap           | Top 20 % | Top 20 % | unverändert; +`RED_TEAM_NON_ADMIN_USER_ID`-Export                                                  |
| R9 Security-Staging-Präzedenz    | Top 25 % | Top 25 % | Kontext-Feststellung, kein Handlungsbedarf                                                         |
| R8 Synthetische User             | Top 40 % | Top 40 % | bewusst akzeptierte Gate-Grenze (Doku)                                                             |
| R4 Concurrency                   | Top 55 % | Top 12 % | beide Workflows abgesichert; Rest: kein Live-Zwei-Läufe-Test                                       |
| R7 Dev-vs-Prod                   | Top 60 % | Top 60 % | Q3(a): bewusst akzeptiert, keine Ausbaustufe                                                       |
| R10 Katalog-Check                | Top 65 % | Top 15 % | automatisierter Check + neg. Kontrolle; Rest: warn-only (bewusst)                                  |
| R6 Bot-Bypass-Testfall           | Top 75 % | Top 12 % | Autor-TODO umgesetzt; Rest: kein `bot_signal_login_flood`-Producer, Chat-Cap bewusst ausgeklammert |
| R3 Trigger                       | Top 80 % | Top 15 % | wöchentlicher Schedule live; Rest: erster automatische CI-Lauf pending Commit/Push                 |
| R5 Probe-Coverage                | Top 85 % | Top 40 % | 3 größte Lücken geschlossen + Route-Mapping-Katalog; Rest: 7 benannte Folgeproben                  |

**Sub-Schnitt: Top 52,0 % → Top 25,4 % (gerundet Top 25 %, 🟡).** Kategorienniveau #6: Top 50 % → **Top 25 %**. Kategorienschnitt (ungewichtet): Top 28,6 % → **Top 26,1 %** (Top 26 %); gewichtet: 26,61 → **24,86 (Top 25 %)**.

### 8.5 — Offene Punkte

1. **Erster automatischer CI-Lauf der neuen Proben ausstehend** — die 6 Workflow-/Skript-Änderungen liegen uncommitted im Working Tree; ein `workflow_dispatch`-Lauf testet nur den kommittierten Stand. Sobald Jan committet/pusht: `gh workflow run "Security red team probes"` und Run-ID in dieser Datei nachtragen. Das Plan-Freigabe-Gate „manueller red-team-security.yml-Lauf grün" ist damit bewusst offen gelassen (Commit-Verbot ohne Jans Anweisung).
2. **Lokaler Live-Lauf der neuen Proben (L2/L3-Verifizierung) — ERLEDIGT (2026-09-06)** — isolierter Next-dev auf Port 3099 mit lokalem Supabase (127.0.0.1:54321, In-Memory-Limiter, `.env.local` für die Dauer der Verifikation umbenannt); Cloud-Bindung ausgeschlossen via no-cookie-/Cookie-Balance-Check (beide `balance 10000 / xp 0 / transactionId 00000000-…`, nicht das Cloud-Payload 42170.77). Bootstrap (3 Ephemeral-User, `ephemeral-bootstrap.ts`, inkl. manueller Nachprovisionierung von `public.users`/`user_identities`-Zeilen wegen `IDENTITY_CLAIM_REQUIRED`-Quarantäne). Ergebnis aller 6 Proben GRÜN: target-guard (Host-Gate), rate-limit-bypass (bet + blackjack), admin-idor (403), bot-bypass (signup-suspicion-Signal, login-guard 5/60s-Ceiling, promo-guess `voucher_velocity`), crash-mp-bypass (total=32, throttled=2), admin-fraud-idor (403). Teardown: Server gestoppt, `.env.local` wiederhergestellt.
3. **7 benannte Folgeproben** (Q2a): `casino/jackpot`, `user/balance`, `tournaments/daily-race`, `admin/promo-codes` (Erstellung), `casino/guide-persona`, `telegram/webhook`, `user/self-exclusion` — dokumentiert in `RED_TEAM_KNOWN_NOT_BUILT_ROUTES` und `09_red_team_probes.md` §6, kein stillschweigendes Fallenlassen.
4. **`bot_signal_login_flood` ohne Producer** — Enum-Typ existiert (`risk-signals.ts`), kein Code schreibt ihn; der Login-Flood-Case prüft daher nur das 5/60s-Ceiling. Eigentum: künftige Ausbaustufe von #3 (06_1-Rest, nicht Teil dieses Plans).
5. **L1-Verifizierung „Zwei parallele Läufe"** nicht live ausgeführt — Konfiguration als ausreichend dokumentiert (Plan ließ dies explizit als Alternative zu).
6. **R7 (Dev-vs-Prod)** dauerhaft als akzeptierte Grenze dokumentiert (Q3a), kein Folgeplan.
