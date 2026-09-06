# 06_9 — Admin Fraud Detection: Umsetzungsplan

> **Status:** Execution-Ready · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Unterkategorie #4 aus [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md) (Top 18 %). Alle Zuständigkeiten liegen beim LLM; kein Meilenstein ist auf eine Jan-Entscheidung während der Ausführung angewiesen. Diese Datei ist so geschrieben, dass eine komplett neue, kontextlose LLM-Konversation sie ohne Rückfragen ausführen kann.
> **Quellcode-Basis:** Alle Befunde unten wurden am 2026-09-05 durch einen read-only `casino-code-explorer`-Lauf verifiziert, der wichtigste Fund (L0/F5) zusätzlich **unabhängig durch einen zweiten, gezielten Grep bestätigt** — keine Spekulation.
> **Wichtigster Neufund dieser Runde:** Ein vollständig gebauter, isoliert getesteter Telegram-Alert-Mechanismus (`fraudAlertWait`) wird **nirgends aus dem echten Scan-Pfad aufgerufen** — HIGH-Severity-Fraud-Signale erzeugen heute keine proaktive Benachrichtigung, obwohl die Infrastruktur dafür existiert und funktioniert.

## 0 — Kontext für die ausführende Session

`src/trigger/fraud-alert-wait.ts` (`fraudAlertWait`-Task) sendet eine Telegram-Nachricht mit Deep-Link zu `/admin/fraud?id=...` und öffnet einen 48h-Wait-Token. Der Task selbst ist korrekt gebaut und getestet (`fraud-alert-wait.test.ts`). Aber: `grep -rn "fraud-alert-wait|fraudAlertWait" src/` zeigt **ausschließlich** die Definitionsdatei und ihre eigene Testdatei als Treffer — kein `.trigger(...)`-Aufruf existiert irgendwo in `runFraudSignalScan()` oder den Guard-Modulen. Das bedeutet: Der gesamte proaktive Alarmierungspfad ist **totes, aber funktionierendes Gleis** — jemand hat ihn gebaut und getestet, aber nie angeschlossen.

## 1 — Segmentierung: 10 Sub-Unterkategorien

| #   | Sub-Unterkategorie                            | Niveau          | Status quo (verifiziert)                                                                                                                                                                                                                                            | Beleg                                                                                                    |
| :-- | :-------------------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------- |
| F1  | Advisory-Lock-Selbstheilung                   | **Top 12 %** 🟡 | `try_acquire_fraud_scan_lock()` mit 5-Minuten-Staleness-Fallback, `release`-Aufruf auch im Fehlerfall getestet. Sauber gebaut.                                                                                                                                      | `030_fraud_signal_detection.sql:251-272`, `admin-fraud-route.test.ts:213-226`                            |
| F2  | Review-Action-Audit-Trail                     | **Top 12 %** 🟡 | `reviewed_by`/`reviewed_at`/`review_reason` (500-Zeichen-Cap) werden unconditional geschrieben, Reviewer-Identität kommt serverseitig aus der Session, nicht vom Client.                                                                                            | `029_risk_events.sql:23-25,120-124`                                                                      |
| F3  | Concurrent-Scan-Rejection getestet            | **Top 15 %** 🟡 | 409 bei bereits gehaltenem Lock ist explizit getestet, nicht nur die Lock-Logik selbst.                                                                                                                                                                             | `admin-fraud-route.test.ts:182-189`                                                                      |
| F10 | Testabdeckung: RPC-Logik nur gemockt          | **Top 40 %** 🟠 | Alle RPC-Aufrufe (`review_risk_event`, `try_acquire_fraud_scan_lock`) sind in Tests gemockt — keine Integrationstests gegen echtes Postgres.                                                                                                                        | `admin-fraud-route.test.ts` (durchgängig `vi.mock`)                                                      |
| F9  | Nur zwei Status-Übergänge (reviewed/closed)   | **Top 45 %** 🟠 | Kein Reopen/Escalate — ein fälschlich geschlossenes Event kann nicht zurückgesetzt werden.                                                                                                                                                                          | `029_risk_events.sql:114` (CHECK-Constraint)                                                             |
| F4  | 48h-Wait-Token ohne Eskalation nach Timeout   | **Top 35 %** 🟠 | Bewusst kein Silent-Auto-Reject (gut), aber auch **keine Eskalation** — das Event bleibt nach Ablauf einfach unbegrenzt „open" ohne weitere Aktion.                                                                                                                 | `fraud-alert-wait.ts:97-111`, `fraud-alert-wait.test.ts:88-98`                                           |
| F7  | Keine Eskalations-/Tiering-Berechtigung       | **Top 55 %** 🟠 | Jede Admin-Aktion (auch das Schließen eines HIGH-Events) läuft über dieselbe einzelne `SUPABASE_ADMIN_EMAILS`-Allowlist — kein Vier-Augen-Prinzip für kritische Fälle.                                                                                              | `src/lib/security/admin.ts:10-18`                                                                        |
| F8  | ML-Isolation-Forest ohne Kalibrierungs-Doku   | **Top 60 %** 🟠 | Schwellenwerte (`SEVERITY_HIGH=0.7` etc.) folgen „Literatur-Konvention", nicht projektspezifischer Kalibrierung — anders als die batch-basierten Schwellenwerte in `fraud-detection.ts`, die ihren „first-pass, pending calibration"-Status explizit dokumentieren. | `fraud-ml/scan.ts:16-23` vs. `fraud-detection.ts:8-9`                                                    |
| F6  | `balance_correction`-Signal komplett verwaist | **Top 80 %** 🔴 | Gültiger Signaltyp in DB-Constraint, Admin-Filter und UI-Label — aber **kein einziger Call-Site emittiert ihn je**. Nur Tests referenzieren den String.                                                                                                             | `029_risk_events.sql:12`, Grep über alle `recordRiskEventBestEffort`-Aufrufer — 0 Treffer für diesen Typ |
| F5  | **Telegram-Alert-Pfad nie verdrahtet**        | **Top 90 %** 🔴 | `fraudAlertWait`-Task vollständig gebaut und getestet, aber **kein Aufrufer** in `runFraudSignalScan()`/`fraud-detection.ts`/den Guard-Modulen — HIGH-Severity-Signale erzeugen 0 proaktive Benachrichtigung, unabhängig zweifach verifiziert.                      | Grep `fraud-alert-wait\|fraudAlertWait` in `src/` — nur Definitions- und Testdatei                       |

**Marker-Konvention:** identisch zu `06_rate_limiting_abuse_prevention.md`.

**Rechnerischer Schnitt über alle 10 Positionen:** (12+12+15+35+90+80+55+60+45+40)/10 = **Top 44,4 %** (gerundet Top 44 %) — die größte Verschlechterung gegenüber einem Bestwert-Ausgangswert in dieser gesamten Planungsserie (Top 18 % → Top 44 %), weil das schwerwiegendste Einzelproblem (F5) unsichtbar war, solange nur die Route- und RPC-Mechanik geprüft wurde, nicht die tatsächliche Verdrahtung zwischen Erkennung und Benachrichtigung.

## 2 — Übersicht für Jan

| Nummer | Meilenstein                                                         | Status     | Nächster Schritt                                                        | Zuständigkeit |
| ------ | ------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------- | ------------- |
| L0     | Fraud-Scan → Telegram-Alert verdrahten (F5, höchste Priorität)      | 🔴 Geplant | `runFraudSignalScan()` triggert `fraudAlertWait` bei `severity: 'high'` | LLM           |
| L1     | `balance_correction`-Signal: Producer bauen oder Typ entfernen (F6) | 🔴 Geplant | Use-Case-Klärung, dann Umsetzung                                        | LLM           |
| L2     | Eskalationspfad nach 48h-Timeout (F4)                               | 🔴 Geplant | Zweite Alarmrunde oder Eskalationskanal                                 | LLM           |
| L3     | Reopen/Escalate-Status ergänzen (F9)                                | 🔴 Geplant | Dritter CHECK-Constraint-Wert + RPC-Erweiterung                         | LLM           |
| L4     | ML-Kalibrierungs-Dokumentation nachtragen (F8)                      | 🔴 Geplant | Kommentar analog zu `fraud-detection.ts:8-9`                            | LLM           |
| L5     | Integrationstest für echte Postgres-RPC-Logik (F10)                 | 🔴 Geplant | Test gegen lokale Supabase-Instanz statt Mock                           | LLM           |
| L6     | Testabdeckung + Doku-Nachzug (Abschluss)                            | 🔴 Geplant | Vollsuite grün, Kategorie-06-Datei aktualisieren                        | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. **F1, F2, F3 haben keinen eigenen Meilenstein** — bereits solide. **F7 (Vier-Augen-Prinzip) hat keinen Bau-Meilenstein** — reine Grundsatzfrage, siehe Q2 unten.

## 3 — Abgrenzung zu verwandten Plänen

- **`06_3` (Multi-Account):** Führt einen neuen `suppressed`-Status für `risk_events` ein (False-Positive-Allowlist). Dieser Plan (L3) führt unabhängig davon `reopen`/`escalated` ein — **beide Status-Erweiterungen sollten in derselben Migration/Sitzung zusammengeführt werden**, um nicht zwei separate CHECK-Constraint-Migrationen kurz hintereinander zu erzeugen. Empfehlung: `06_3` L3 zuerst, dann dieser Plan L3 in derselben Migration ergänzen.
- **`06_1`/`06_2` (ausgeführt):** Nutzen `recordRiskEventBestEffort()` für ihre eigenen Signaltypen (`bot_signal_*`, `cost_cap_reached`) — L0 dieses Plans ändert nicht deren Emission, nur den nachgelagerten Alert-Trigger für `severity: 'high'`-Fälle generell (gilt auch für deren Signale, falls sie je `high` erreichen).
- **`06_5` (Identifier-/IP-Extraktion):** Keine direkte Überschneidung.

## 4 — Meilensteine im Detail

### L0 — Fraud-Scan → Telegram-Alert verdrahten (F5, höchste Priorität)

**Ziel:** HIGH-Severity-Fraud-Signale lösen tatsächlich eine proaktive Benachrichtigung aus, wie die bereits gebaute Infrastruktur es vorsieht.
**Scope:** `recordRiskEventBestEffort()` (zentrale Schreibfunktion, aufgerufen von allen Signal-Emittern) erhält einen optionalen Nach-Schreib-Hook: Bei `severity: 'high'` UND `occurrences === 1` (nur beim ERSTEN Auftreten alarmieren, nicht bei jedem wiederholten Vorkommen desselben Fingerprints — sonst Alert-Spam) wird `fraudAlertWait.trigger({...})` aufgerufen (fire-and-forget, analog zum bestehenden `after()`-Muster aus `06_1` L5). Payload: `riskEventId`, `signalType`, `severity`, Deep-Link.
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** `security-reviewer` PASS (neuer Trigger-Aufruf aus einer zentralen, oft aufgerufenen Funktion — Fehlverhalten hier hätte breite Auswirkung).
**Verifizierung:** Test bestätigt: Ein `high`-Severity-Event beim ersten Auftreten löst `fraudAlertWait.trigger()` aus; ein wiederholtes Auftreten (`occurrences > 1`) löst NICHT erneut aus; ein `low`/`medium`-Event löst nie aus.
**Nicht-Scope:** Keine Änderung an `fraudAlertWait` selbst (der Task funktioniert bereits korrekt, nur der Aufruf fehlte).
**Money-Pfad:** Nein (Alerting-Infrastruktur) · **Security-Review:** Pflicht.

### L1 — `balance_correction`-Signal: Producer bauen oder Typ entfernen (F6)

**Ziel:** Ein verwaister, aber überall referenzierter Signaltyp wird entweder mit Leben gefüllt oder sauber entfernt — nicht als stille, potenziell verwirrende Lücke belassen.
**Scope:** **Erste Aufgabe der ausführenden Session: Use-Case klären.** Plausibelster Kandidat: Ein Admin ändert manuell `balance`/`xp` in `UsersPageClient.tsx` (bereits bestehende Mutation laut `admin/users/route.ts`) — genau DAS sollte ein `balance_correction`-Signal erzeugen, damit manuelle Eingriffe genauso auditierbar sind wie automatisierte Risk-Signale. Falls diese Annahme sich als korrekt bestätigt: `recordRiskEventBestEffort()`-Aufruf in der Admin-User-Update-Route ergänzen. Falls sich kein sinnvoller Use-Case finden lässt: Signaltyp aus CHECK-Constraint, `record_risk_event()`-Validierung, Admin-Filter und UI-Label sauber entfernen (Migration, NOT VALID/VALIDATE-Pattern für die Constraint-Verengung).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** `@migration-security-guard` PASS (falls Migration nötig) + `security-reviewer` PASS.
**Verifizierung:** Je nach gewählter Option: entweder ein Test, der eine Admin-Balance-Änderung mit einem erzeugten `balance_correction`-Event verifiziert, oder ein Test, der bestätigt, dass der Typ nirgends mehr referenziert wird.
**Nicht-Scope:** Keine rückwirkende Analyse historischer Balance-Änderungen vor dieser Ausbaustufe.
**Money-Pfad:** Ja (falls Producer gebaut wird, da Balance-Änderungen Geld-Pfad sind) · **Security-Review:** Pflicht.

### L2 — Eskalationspfad nach 48h-Timeout (F4)

**Ziel:** Ein nach 48h weiterhin unbeachtetes HIGH-Event eskaliert, statt unbegrenzt in einem passiven „open"-Zustand zu verharren.
**Scope:** `fraud-alert-wait.ts`s Timeout-Zweig (aktuell nur Logging, `:97-111`) erhält einen zweiten `fraudAlertWait.trigger()`-Aufruf mit einer verschärften Nachricht (z. B. „⚠️ ESKALATION: seit 48h unbeachtet") — **keine neue Infrastruktur nötig**, der bestehende Task wird einfach rekursiv für eine zweite Runde erneut aufgerufen. Maximal eine Eskalationsrunde (kein unendliches Wiederholen), danach bleibt das Event offen (menschliche Entscheidung erforderlich, kein Auto-Close).
**Abhängigkeiten:** L0 (baut auf der dort hergestellten Verdrahtung auf).
**Freigabe-Gate:** `security-reviewer` PASS.
**Verifizierung:** Test simuliert Timeout-Ablauf → genau eine Eskalations-Nachricht wird gesendet, kein zweiter Eskalations-Zyklus.
**Nicht-Scope:** Kein automatisches Schließen/Einfrieren nach Eskalation (bleibt Admin-Entscheidung).
**Money-Pfad:** Nein · **Security-Review:** Pflicht.

### L3 — Reopen/Escalate-Status ergänzen (F9)

**Ziel:** Ein fälschlich geschlossenes Event kann korrigiert werden.
**Scope:** **Ausführungsreihenfolge-Hinweis: In derselben Migration wie `06_3`s `suppressed`-Status umsetzen** (Abschnitt 3). CHECK-Constraint um `'reopened'` erweitern (NOT VALID/VALIDATE-Muster), `review_risk_event()`-RPC um eine `reopen`-Aktion ergänzen (nur von `closed`/`reviewed` aus möglich, nicht von `open`).
**Abhängigkeiten:** Keine harte Abhängigkeit, aber siehe Ausführungsreihenfolge-Hinweis.
**Freigabe-Gate:** `@migration-security-guard` PASS.
**Verifizierung:** Test bestätigt: `closed` → `reopened` funktioniert, `open` → `reopened` wird abgelehnt (ungültiger Übergang).
**Nicht-Scope:** Kein automatisches Reopen (immer explizite Admin-Aktion).
**Money-Pfad:** Nein · **Security-Review:** Pflicht (Migration).

### L4 — ML-Kalibrierungs-Dokumentation nachtragen (F8)

**Ziel:** Die ML-Schwellenwerte sind ebenso transparent dokumentiert wie die bereits vorbildlich kommentierten Batch-Schwellenwerte.
**Scope:** Kommentar über `SEVERITY_HIGH`/`MEDIUM`/`LOW` in `fraud-ml/scan.ts:16-23`, der den „Literatur-Konvention, nicht projektspezifisch kalibriert"-Status ehrlich benennt (analog zum bereits vorhandenen Muster in `fraud-detection.ts:8-9`).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Keins (reine Dokumentation).
**Verifizierung:** Kommentar vorhanden und mit `fraud-detection.ts:8-9` konsistent im Ton.
**Nicht-Scope:** Keine echte Nachkalibrierung der ML-Schwellenwerte gegen historische Daten (das wäre ein eigener, deutlich größerer Datenanalyse-Auftrag).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L5 — Integrationstest für echte Postgres-RPC-Logik (F10)

**Ziel:** Die tatsächliche SQL-Logik von `try_acquire_fraud_scan_lock`/`review_risk_event` wird mindestens einmal gegen eine echte lokale Supabase-Instanz getestet, nicht nur über Mocks.
**Scope:** Neuer Integrationstest (analog zum bereits etablierten Muster für andere RPC-Tests im Projekt, sofern eines existiert — sonst neues, klar benanntes Test-File `admin-fraud-rpc-integration.test.ts`), der gegen eine lokale `supabase start`-Instanz läuft: Lock-Erwerb, Staleness-Fallback nach simuliertem Ablauf, Status-Übergänge inkl. der neuen `reopen`/`suppressed`-Werte aus L3/`06_3`.
**Abhängigkeiten:** L3 (testet auch den neuen Status-Wert).
**Freigabe-Gate:** Test läuft gegen lokales Supabase durch.
**Verifizierung:** Test-Datei existiert, dokumentiert klar als Integrationstest (nicht Teil der schnellen Unit-Test-Standardsuite, falls das Projekt diese Trennung kennt — sonst regulärer Teil von `npm test`).
**Nicht-Scope:** Kein CI-Workflow-Umbau, um diesen Test automatisch gegen eine ephemere DB laufen zu lassen (das wäre analog zu `06_1`/`06_7`s Ephemeral-Stack-Mustern, aber hier bewusst außerhalb des Scopes, da nur EIN Testfall betroffen ist).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L6 — Testabdeckung + Doku-Nachzug (Abschluss)

**Ziel:** Vollständiger Regressionsnachweis, Kategorie-06-Datei aktualisiert.
**Scope:** Vollständiger `npm test`-Lauf, `npm run typecheck`, `npm run lint`. Danach: `06_rate_limiting_abuse_prevention.md` Unterkategorie #4 aktualisieren (Niveau-Neubewertung, Status von „Execution-Ready" auf „Executed"), `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md` Zeile #4 nachziehen, `T_RATE_LIMITING_ABUSE_PREVENTION/00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md` Zeile #4 nachziehen.
**Abhängigkeiten:** L0–L5.
**Freigabe-Gate:** Vollsuite grün, 0 TS-/Lint-Fehler.
**Verifizierung:** Testlauf-Zahlen im Ausführungsprotokoll dieser Datei dokumentieren.
**Nicht-Scope:** Keine Ausweitung auf andere Unterkategorien.
**Money-Pfad:** Nein · **Security-Review:** Nein.

## 5 — Selbstprüfung (durchgeführt 2026-09-05)

- ✅ Scope gegenüber `06_3` (geteilte Status-Erweiterung) und `06_1`/`06_2` (Signal-Emitter) abgegrenzt (Abschnitt 3), inkl. Ausführungsreihenfolge-Empfehlung für die gemeinsame Migration.
- ✅ Jeder Meilenstein hat Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung/Nicht-Scope/Money-Pfad/Security-Review.
- ✅ Alle Zuständigkeiten = LLM (L1 hat eine „erste Aufgabe: Use-Case klären" — das ist eine Analyse-Zuständigkeit der LLM-Ausführungssession, keine Jan-Zwischenentscheidung).
- ✅ Der wichtigste Fund (F5) wurde **zweifach unabhängig verifiziert** (Explorer-Agent + eigener Kontroll-Grep), nicht unkritisch übernommen.
- ⚠️ **Nachträglich gefunden beim Selbst-Review:** L0s Alert-Trigger-Logik muss zwingend „nur beim ersten Auftreten" auslösen (`occurrences === 1`), sonst würde ein wiederholt auftretendes Signal bei jedem Scan-Lauf erneut alarmieren (Alert-Spam) — im Meilenstein-Text bereits so spezifiziert.
- ⚠️ **Nachträglich gefunden:** L1 könnte ohne klare Use-Case-Vorgabe zu einer beliebigen, unbegründeten Entscheidung führen — deshalb explizit als zweistufige Aufgabe formuliert (erst klären, dann entscheiden zwischen zwei genannten Optionen), nicht als offene Blankovollmacht.
- ✅ Kein Punkt doppelt als SOP/Kontextreferenz/Plan gepflegt.

## 6 — Offene Fragen für Jan (je 3 Antwortoptionen)

**Q1 — Soll L1 (`balance_correction`) den Producer bauen oder den Signaltyp entfernen?**

- (a) Producer bauen: Jede manuelle Admin-Balance-Änderung erzeugt ein `balance_correction`-Signal — erhöht Auditierbarkeit manueller Eingriffe, die bislang komplett unauffällig sind. _(Empfehlung — schließt eine echte Lücke: manuelle Admin-Eingriffe sind aktuell die einzige Balance-Änderungsart ohne jede Signal-Spur)_
- (b) Signaltyp entfernen — sauberer, aber verliert die Chance auf Admin-Aktions-Auditierung.
- (c) Vorerst unverändert lassen (weder bauen noch entfernen), nur als bekannte Doku-Lücke vermerken — kein Aufwand, aber die Verwirrung bleibt bestehen.

**Q2 — Soll F7 (Vier-Augen-Prinzip für HIGH-Severity-Aktionen) als eigener Meilenstein umgesetzt werden?**

- (a) Nein — für ein Lernprojekt mit einer kleinen Anzahl Admins ist eine zweite Zustimmungsebene unverhältnismäßiger Prozess-Overhead. _(Empfehlung)_
- (b) Ja, als eigener Folgeplan: Schließen eines HIGH-Events erfordert eine zweite Admin-Bestätigung (neue Spalte `confirmed_by_second_admin`).
- (c) Nur als dokumentierte, bewusst akzeptierte Design-Entscheidung vermerken (kein Bau, aber auch keine stille Lücke).

**Q3 — Soll L2 (Eskalation nach 48h) mehr als eine Eskalationsrunde erlauben (z. B. alle 48h erneut, bis ein Admin reagiert)?**

- (a) Nein, genau eine Eskalationsrunde reicht — mehr würde zu Alert-Fatigue führen, ohne den eigentlichen Prozess (menschliche Reaktion) zu beschleunigen. _(Empfehlung)_
- (b) Ja, wiederholte Eskalation alle 48h bis zur Reaktion — stärkerer Druck, aber Risiko von Alert-Müdigkeit.
- (c) Eskalation an einen ZWEITEN Kanal (z. B. E-Mail zusätzlich zu Telegram) statt Wiederholung auf demselben Kanal.

## 7 — Verwandte Artefakte

| Bedarf                                                                        | Datei                                                                                                   |
| :---------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| Vollständige Kategorie-06-Aufschlüsselung (Ursprung dieses Plans)             | [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md)                          |
| Kompakte Kategorie-Overview                                                   | [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md) |
| Gewichtete Kategorie-Übersicht (dieser Ordner)                                | [`00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md`](00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md)    |
| Schwester-Plan #10 (Multi-Account, execution-ready, teilt Status-Erweiterung) | [`06_3_multi_account_abuse_prevention_plan.md`](06_3_multi_account_abuse_prevention_plan.md)            |
| SOP Planungsdateien (Format dieses Plans)                                     | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)             |
| SOP Execution (nächster Schritt nach Freigabe)                                | [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)                         |
