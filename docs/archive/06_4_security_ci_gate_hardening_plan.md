> **Archiviert 2026-08-29.** Ursprünglich `worldmap/04_02_security_ci_gate.md`. 3 von 5 Meilensteinen vollständig verifiziert, 2 (L1, L4) bewusst nur teilverifiziert, um Jans aktive lokale Supabase-Dev-Session nicht zu gefährden — siehe Abschnitt 5/6 für das ehrliche Ergebnis (Top 31 %, verfehlt das Ziel „mindestens Top 30 %" knapp um 1 Prozentpunkt). Aktueller Stand der Kategorie 04 in [`worldmap/04_security_hardening.md`](../../worldmap/04_security_hardening.md), Live-Status in [`worldmap/00_WORLDMAP_STATUS.md`](../../worldmap/00_WORLDMAP_STATUS.md).

# 04.02 — Security-CI-Gate: Von Top 65 % zu mindestens Top 30 %

> **Status:** Executed (archiviert) · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Härtung von Unterkategorie #2 „Security-CI-Gate" (`.github/workflows/security-staging.yml`) aus [`04_security_hardening.md`](../../worldmap/04_security_hardening.md) (Kategorie 04, Prio 1) — bewusst **nicht** die Migrations-Nummernkollision selbst (Kategorie 02/09, siehe `docs/archive/05_datenbank_haertung.md`) und **nicht** Auth/Identity (Kategorie 03).
> **Money-Pfad:** Nein (CI-Infrastruktur, kein Wallet-Schreibpfad) · **Security-Review:** Pflicht (Security-Regressionsgate)

---

## 0 — Harte Grenze (gilt für den gesamten Plan)

Zwei Dinge kann dieser Plan **nicht** selbst herbeiführen, unabhängig davon, wie gut die Meilensteine unten umgesetzt werden:

1. **Der Workflow wird erst live grün, sobald die Migrations-Kollision `049` behoben ist.** Diese Behebung liegt bereits als unversionierte Änderung eines anderen Workstreams im Arbeitsbaum (verifiziert 2026-08-29: `supabase/migrations/` zeigt `053_guild_feature_intentionally_removed.sql`, `055`–`057` neu, keine Kollision mehr laut `ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d` → leer). Sie gehört Kategorie 02/09, nicht diesem Plan — dieser Plan rührt `supabase/migrations/` nicht an.
2. **Ein Commit/Push macht diese oder jede andere Änderung erst live.** Das ist die globale Git-Regel (nie ohne Jans ausdrückliche Freigabe committen) — kein neuer Plan-spezifischer Jan-Gate, sondern eine vorbestehende Grenze, die für jede Arbeit in diesem Repo gilt.

Beide Punkte sind **keine Meilenstein-Zuständigkeiten dieses Plans** — sie werden unten als Kontext benannt, aber keinem Meilenstein mit „Zuständigkeit: Jan" zugewiesen, weil sie keine neuen, planspezifischen Entscheidungen sind.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                               |       Status       | Nächster Schritt                                     | Zuständigkeit |
| :----- | :---------------------------------------------------------------------------------------- | :----------------: | :--------------------------------------------------- | :-----------: |
| **L1** | **Lokale Reproduzierbarkeit verifizieren** (`supabase start` gegen aktuellen Arbeitsbaum) | 🟡 Teilverifiziert | — (volle Dynamik bewusst nicht ausgeführt, siehe L1) |      LLM      |
| **L2** | **Test-Abdeckungs-Mapping dokumentieren** (welche Invarianten deckt das Gate wirklich ab) |   🟢 Verifiziert   | —                                                    |      LLM      |
| **L3** | **Fehlschlag-Sichtbarkeit verbessern** (Job-Summary-Annotation bei rotem Lauf)            |   🟢 Verifiziert   | —                                                    |      LLM      |
| **L4** | **Trigger-/Timeout-Robustheits-Audit**                                                    | 🟡 Teilverifiziert | — (siehe L4)                                         |      LLM      |
| **L5** | **Scope-Abgrenzungs-Doku im Workflow selbst schärfen**                                    |   🟢 Verifiziert   | —                                                    |      LLM      |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt.

---

## 2 — Ausgangslage: Sub-Kategorie-Aufschlüsselung (max. 10, aus #2 abgeleitet)

| #   | Sub-Unterkategorie                          | Niveau       | Kernbefund                                                                                                                                                                                                                   |
| --- | ------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Workflow-Struktur/Design                    | **Top 15 %** | Ephemerer lokaler Supabase-Stack statt Cloud-Staging — kein Account, keine Secrets, nichts zu rotieren (Commit `b5b0841`)                                                                                                    |
| 2   | Live-Grün-Status                            | **Top 90 %** | Letzter Lauf (2026-08-28, `33210240496`) rot — Migrations-Kollision `049`, aber laut Arbeitsbaum bereits behoben (siehe Abschnitt 0), nur noch nicht committed                                                               |
| 3   | Root-Cause-Dokumentation & Abgrenzung       | **Top 20 %** | Sauber in `docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md` und im YAML-Header-Kommentar selbst dokumentiert                                                                                                      |
| 4   | Lokale Reproduzierbarkeit ohne Push         | **Top 80 %** | Nie lokal verifiziert, ob der Workflow (Logik, nicht nur Migrationsstand) tatsächlich fehlerfrei durchläuft                                                                                                                  |
| 5   | Test-Abdeckung im Gate                      | **Top 60 %** | 4 Schritte (`staging-regression-contract.test.ts`, `phase1-target-guard.ts`, `verify-security-phase1.sql`, `phase1-concurrency.ts`) — nie gegen bekannte Risikoflächen (RLS, Wallet-Invarianten) gemappt, ob Lücken bestehen |
| 6   | Fehler-Sichtbarkeit/Alerting bei rotem Lauf | **Top 85 %** | Kein Alerting — ein roter Lauf ist nur sichtbar, wer aktiv in die Actions-Historie schaut                                                                                                                                    |
| 7   | Secrets-Freiheit des Gates                  | **Top 15 %** | Verifiziert: keine GitHub-Secrets nötig, alles ephemer lokal generiert (`npx supabase status -o env`)                                                                                                                        |
| 8   | Trigger-Konfiguration                       | **Top 20 %** | `workflow_dispatch` + `push` mit gezielten Pfad-Filtern (`supabase/migrations/**`, `src/lib/casino/**`, `src/lib/security/**`) — sinnvoll eng gefasst                                                                        |
| 9   | Timeout-/Flakiness-Robustheit               | **Top 70 %** | 15-Minuten-Timeout nie gegen reale Docker-Pull-/Boot-Zeiten geprüft                                                                                                                                                          |
| 10  | Scope-Abgrenzungs-Dokumentation im Workflow | **Top 15 %** | Bereits vorhanden (Kommentarblock im YAML verweist auf `docs/archive/05_datenbank_haertung.md`)                                                                                                                              |

**Rechnerischer Schnitt (Ist-Zustand):** (15+90+20+80+60+85+15+20+70+15)/10 = **Top 47 %** — niedriger als der bisherige pauschale Top-65-%-Wert, weil mehrere Teilflächen (Secrets-Freiheit, Struktur, Trigger-Konfiguration) bei genauer Prüfung deutlich besser sind, als der Wert „live rot" allein suggeriert. Konsistent mit dem bereits etablierten Effekt, dass eine grobe Einzelbewertung systematisch verzerrt, bis sie in Teilflächen zerlegt wird.

---

## 3 — Meilenstein-Details

### L1 — Lokale Reproduzierbarkeit verifizieren

- **Ziel:** Beweisen, dass die Workflow-**Logik** selbst korrekt ist — unabhängig vom Commit-Status der Migrations-Fix — schließt #4 so weit, wie sicher möglich.
- **Scope:** Ursprünglich geplant: `npx supabase start` gegen den aktuellen Arbeitsbaum, dieselben Schritte wie in `security-staging.yml` manuell nachvollziehen, danach `npx supabase stop`.
- **Tatsächlicher Befund bei Ausführung (2026-08-29) — Scope-Anpassung:** `npx supabase status` zeigt, dass der lokale Supabase-Stack **bereits läuft** (Jans eigene, aktive Dev-Umgebung, nicht von diesem Plan gestartet). Ein `supabase db reset` (nötig, um die CI-Bedingung „frischer Stack von Null" realistisch nachzubilden) würde Jans lokale Dev-Daten löschen; ein `supabase stop` am Ende würde seine aktive Session beenden. Beides ist eine materielle, potenziell störende Auswirkung auf fremden, aktiven Zustand — nach der Execution-SOP („Bei Abweichung mit materieller Auswirkung anhalten") und dem globalen Git-/Investigate-Prinzip („vor destruktiven Aktionen auf fremden Zustand prüfen") wird deshalb **nicht** `db reset`/`stop` ausgeführt. Stattdessen nur die sichere, nicht-invasive Teilverifikation: Migrations-Listing erneut gegen Kollisionen geprüft (`ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d` → leer, bestätigt bereits in Abschnitt 0) und die 4 Testdateien gelesen, um ihre Erwartungen gegen den aktuellen Code-Stand zu prüfen, ohne sie tatsächlich gegen Jans laufende DB auszuführen.
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine für die durchgeführte, sichere Teilverifikation. Eine vollständige dynamische Reproduktion (frischer ephemer-er Stack) bräuchte entweder Jans Bestätigung, dass sein lokaler Stack gefahrlos zurückgesetzt werden darf, oder müsste in einer isolierten Umgebung (z. B. tatsächlich in CI nach einem Push) laufen — beides außerhalb dessen, was dieser Plan selbst auslösen kann.
- **Verifizierung:** Migrations-Kollisions-Check (leer) + Lese-Verifikation aller 4 Testdateien gegen den aktuellen `src/lib/security/`- und `src/lib/casino/`-Code-Stand.
- **Nicht-Scope:** Kein `supabase db reset`/`supabase stop` gegen Jans aktiven lokalen Stack. Keine Änderung an `supabase/migrations/**`.

### L2 — Test-Abdeckungs-Mapping dokumentieren

- **Ziel:** Klarheit, welche Sicherheits-Invarianten das Gate tatsächlich prüft und welche nicht — schließt #5.
- **Scope:** Mapping-Tabelle unten, alle 4 Dateien tatsächlich gelesen (2026-08-29):

| Testschritt                           | Prüft tatsächlich                                                                                                                                                                                                                                                                                                                                | Gegen Wallet-/RLS-Risiken aus Kategorie 02                                                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `staging-regression-contract.test.ts` | **Statischer Contract-Test** (kein DB-Zugriff) — liest `verify-security-phase1.sql`, `phase1-target-guard.ts`, `phase1-concurrency.ts` und `security-staging.yml` als Text und prüft per String-Assertion, dass bestimmte Sicherheitsmarker vorhanden sind (`ON_ERROR_STOP`, `phase1_target_confirmed`, `wallet_transactions_append_only_guard`) | Deckt ab: dass die anderen 3 Skripte nicht versehentlich ihre eigenen Fail-Safes verlieren. Deckt **nicht** ab: ob die SQL-Logik selbst korrekt ist — reiner Text-Contract, keine Ausführung. |
| `phase1-target-guard.ts`              | Fail-Closed-Schutz gegen versehentliches Ausführen gegen Produktion (`PHASE1_TARGET_CONFIRMED`, URL-Validierung)                                                                                                                                                                                                                                 | Kein direkter Wallet-/RLS-Bezug — reiner Ziel-Schutz, verhindert, dass die anderen 2 Skripte je gegen echte Kundendaten laufen                                                                |
| `verify-security-phase1.sql`          | Echte SQL-Prüfung gegen die ephemer gestartete DB, mit `ON_ERROR_STOP`-Fail-Fast und Ziel-Bestätigung als Vorbedingung                                                                                                                                                                                                                           | Direkter Bezug zu Kategorie 02 #3/#4 (RPCs, RLS) — genauer Inhalt der SQL-Prüfungen nicht vollständig ausgewertet in diesem Plan (wäre eigene, größere Analyse)                               |
| `phase1-concurrency.ts`               | 20 parallele Requests gegen eine echte (ephemere) DB via Service-Role-Key, um Race-Conditions in den Wallet-RPCs zu prüfen                                                                                                                                                                                                                       | Direkter Bezug zu Kategorie 02 #3 (Advisory-Locks/Idempotenz bei `settle_game_bet` u. ä.)                                                                                                     |

**Erkannte Lücke (nicht in diesem Plan behoben, siehe Nicht-Scope):** Der reine SQL-Inhalt von `verify-security-phase1.sql` wurde nur auf Vorhandensein von Fail-Safe-Markern geprüft, nicht Zeile für Zeile gegen alle RLS-Policies aus Kategorie 02 abgeglichen — eine vollständige Abdeckungsanalyse wäre eine eigene, größere Aufgabe.

- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine — reine Dokumentation, Lesen der bestehenden Testdateien.
- **Verifizierung:** Alle 4 Dateien gelesen (Header/Kernlogik), Mapping-Tabelle oben als Ergebnis.
- **Nicht-Scope:** Keine neuen Testfälle schreiben, falls eine Lücke gefunden wird — das wäre ein eigener, hier nur zu benennender Folgeschritt.

### L3 — Fehlschlag-Sichtbarkeit verbessern

- **Ziel:** Ein roter Lauf ist nicht nur in der Actions-Historie sichtbar, sondern erzeugt eine klare, lesbare Zusammenfassung — schließt einen Teil von #6.
- **Scope:** `security-staging.yml` um einen `if: failure()`-Schritt ergänzen, der eine kurze, lesbare Fehlerzusammenfassung in `$GITHUB_STEP_SUMMARY` schreibt (welcher Schritt fehlschlug, Verweis auf `docs/archive/05_datenbank_haertung.md` bei Migrations-bezogenen Fehlern).
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine — nutzt die native GitHub-Actions-Job-Summary-Funktion, kein externer Kommunikationskanal, kein neues Secret, keine neue Integration (E-Mail/Slack/Webhook wären das — bewusst nicht gewählt).
- **Verifizierung:** YAML-Syntax-Check; da kein Live-Push möglich ist, Schritt-Logik gegen das bekannte GitHub-Actions-`$GITHUB_STEP_SUMMARY`-Verhalten (offiziell dokumentiertes Feature) geprüft.
- **Nicht-Scope:** Kein externes Alerting (Slack/E-Mail/Telegram) — jede dieser Optionen wäre eine neue Integration mit eigenem Freigabebedarf für den Kommunikationskanal selbst, nicht Teil dieses Plans.

### L4 — Trigger-/Timeout-Robustheits-Audit

- **Ziel:** Bestätigen oder widerlegen, dass der 15-Minuten-Timeout und die Pfad-Filter realistisch sind — schließt #9.
- **Tatsächlicher Befund (2026-08-29):** L1 konnte keinen vollständigen grünen Lauf lokal reproduzieren (siehe L1-Anpassung). Aus dem letzten echten Log (`gh run view 33210240496`) dauerten Image-Pull + DB-Boot + Migrations bis zum Fehler **~15 Sekunden** (20:56:31 bis 20:56:47). Die 4 Testschritte selbst sind vergleichsweise leichtgewichtig (ein Vitest-Unit-Test ohne DB-Zugriff, ein Guard-Skript, ein einzelnes `psql`-Skript, ein Node-Skript mit 20 parallelen HTTP-Requests) — vergleichbar mit anderen Workflow-Schritten im Repo, die im Sekunden- bis niedrigen Minutenbereich laufen. **Ehrlich benannt:** Eine exakte Gesamtzeit für einen tatsächlich grünen Lauf ist nicht messbar, ohne genau den zuvor als riskant identifizierten Schritt (frischer Stack/Reset) auszuführen — die 15-Minuten-Grenze wird auf Basis der Teilmessung und vergleichbarer Schritte als ausreichend, aber nicht vollständig verifiziert eingeschätzt.
- **Abhängigkeiten:** L1.
- **Freigabe-Gate:** Keine.
- **Verifizierung:** Log-Zeitstempel-Analyse aus `gh run view`, Vergleich mit ähnlich aufgebauten Schritten in `quality-ci.yml`/`dependency-audit.yml`.
- **Nicht-Scope:** Keine Timeout-Änderung (15 Minuten bleiben unverändert, da kein konkreter Hinweis auf Zeitüberschreitung vorliegt) und keine Retry-Logik.

### L5 — Scope-Abgrenzungs-Doku im Workflow schärfen

- **Ziel:** Der bestehende Kommentarblock im Workflow bleibt aktuell und verweist korrekt auf den aktuellen Stand der Migrations-Kollision — schließt einen Teil von #3/#10.
- **Scope:** Kommentarblock in `security-staging.yml` (Zeilen 1–11) um den aktuellen Stand ergänzen (Kollision laut Arbeitsbaum bereits behoben, aber unversioniert — siehe Abschnitt 0).
- **Abhängigkeiten:** Keine.
- **Freigabe-Gate:** Keine — reiner Kommentar, keine Verhaltensänderung.
- **Verifizierung:** Diff-Review, dass nur der Kommentar geändert wurde, keine `on:`/`jobs:`-Logik.
- **Nicht-Scope:** Keine Trigger-Änderung.

---

## 4 — Selbstprüfung vor `Execution-Ready`

- [x] Scope gegenüber Kategorie 02/09 (Migrations-Kollision selbst) klar abgegrenzt — dieser Plan rührt `supabase/migrations/**` nicht an.
- [x] Abhängigkeiten (L4→L1, L2 nutzt L1-Kontext) benannt.
- [x] Keine neue Datenklasse/API-Grenze — alle Meilensteine sind CI-Konfiguration, Dokumentation oder reine Verifikation.
- [x] Statusbehauptungen mit Quelle belegt (`gh run view`, `git status`, Migrations-Listing).
- [x] Keine Referenz doppelt als SOP, Kontextreferenz und Plan gepflegt.
- [x] Datei eigenständig verständlich für eine neue LLM-Konversation.
- [x] Kein Meilenstein erfordert einen Commit/Push, eine Migrations-Änderung oder eine sonst unumkehrbare Aktion.

## 5 — Tatsächliches Niveau nach Ausführung (Ziel-Check, ehrlich statt geschönt)

| #   | Sub-Unterkategorie        | Vorher | Danach (real)                                                                                                                     |
| --- | ------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Struktur/Design           | 15 %   | 15 %                                                                                                                              |
| 2   | Live-Grün-Status          | 90 %   | 90 % (bewusst unverändert, siehe Abschnitt 0 — externe Abhängigkeit)                                                              |
| 3   | Root-Cause-Doku           | 20 %   | 15 % (Kommentarblock im Workflow aktualisiert)                                                                                    |
| 4   | Lokale Reproduzierbarkeit | 80 %   | 35 % (nur statische Teilverifikation — voller Stack-Test bewusst nicht gegen Jans aktive lokale Dev-Session ausgeführt, siehe L1) |
| 5   | Test-Abdeckungs-Mapping   | 60 %   | 20 % (vollständiges Mapping aller 4 Schritte, 1 Lücke bewusst offen benannt)                                                      |
| 6   | Fehler-Sichtbarkeit       | 85 %   | 45 % (Job-Summary bei Fehlschlag ergänzt — löst „unlesbare Rohlogs", aber kein Push-Alerting)                                     |
| 7   | Secrets-Freiheit          | 15 %   | 15 %                                                                                                                              |
| 8   | Trigger-Konfiguration     | 20 %   | 15 %                                                                                                                              |
| 9   | Timeout-Robustheit        | 70 %   | 30 % (Teilmessung aus Logs, kein vollständiger grüner Lauf messbar — siehe L4)                                                    |
| 10  | Scope-Abgrenzungs-Doku    | 15 %   | 15 %                                                                                                                              |

**Realer Schnitt:** (15+90+15+35+20+45+15+15+30+15)/10 = **Top 31 %** — verfehlt das Ziel „mindestens Top 30 %" knapp um 1 Prozentpunkt. **Ehrlich benannt statt beschönigt:** Der Grund ist eine bewusste Sicherheitsentscheidung bei L1/L4 — ein vollständiger dynamischer Lauf hätte entweder Jans aktive lokale Supabase-Dev-Session zurückgesetzt/gestoppt (materielle Auswirkung auf fremden, aktiven Zustand) oder hätte eine neue, hier nicht beauftragte Freigabe gebraucht. Die ursprüngliche Plan-Projektion (Top 28 %) ging von dieser vollen Ausführung aus und war zu optimistisch — die reale Zahl nach tatsächlicher Ausführung ist niedriger als geplant, aber transparent begründet statt stillschweigend als „Top 30 % erreicht" gemeldet.

---

## 6 — Verifikation (durchgeführt 2026-08-29)

- **L1/L4:** `npx supabase status` zeigte einen bereits laufenden lokalen Stack (Jans aktive Dev-Session) — volle dynamische Reproduktion bewusst nicht ausgeführt, um seinen Zustand nicht zu gefährden. Stattdessen: Migrations-Kollisions-Check (leer) + Lesen aller 4 CI-Testdateien.
- **L2:** Alle 4 Testdateien gelesen, Mapping-Tabelle erstellt (siehe L2).
- **L3/L5:** `security-staging.yml` per `node -e "yaml.load(...)"` als valides YAML bestätigt, neuer `Summarize failure`-Schritt taucht korrekt in der Steps-Liste auf.
- **Gesamtverifikation (gemeinsam für alle drei Sub-Pläne 04_08/04_02/04_07, ein Lauf statt drei):** Keine Code-Änderung an `src/`/`scripts/` in diesem Plan (nur `.github/workflows/security-staging.yml`). `npm run typecheck` — 20 vorbestehende, scope-fremde Fehler, 0 neue. `npm test` — **156/156 Testdateien, 1201/1201 Tests grün**. `npm run lint` — **0 Fehler, 18 Warnungen**, alle vorbestehend. `npm run build` — **Exit 0**.

## 7 — Verwandte Artefakte

| Bedarf                                                                  | Datei                                                                                                                    |
| :---------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| Übergeordnete Kategorie-04-Aufschlüsselung (Herkunft dieses Plans)      | [`04_security_hardening.md`](../../worldmap/04_security_hardening.md)                                                    |
| Migrations-Kollision-Kontext (Kategorie 02/09, außerhalb dieses Scopes) | [`05_datenbank_haertung.md`](../../docs/archive/05_datenbank_haertung.md)                                                |
| CI/CD-Gesamtkontext                                                     | [`00-09-CICD.md`](../../worldmap/00-09-CICD.md)                                                                          |
| Security-Hardening-Status                                               | [`docs/status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md`](../status-reports/06_2_SECURITY_HARDENING_HEADERS_CSP.md) |

---

## 8 — Nachtrag (2026-08-30): Migrations-Kollision behoben, Gate erstmals live grün

Jan berichtete, Kategorie 02 „Datenbank & Migrationen" (`worldmap/05_datenbank_haertung.md`) sei inzwischen abgeschlossen. Frisch verifiziert, nicht aus dem Gedächtnis übernommen:

- **Migrations-Kollision:** `ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d` → **leer** (59 Dateien, keine doppelten Versionsnummern mehr).
- **`migration-history.test.ts`:** `npx vitest run src/lib/casino/__tests__/migration-history.test.ts` → **7/7 grün** (vorher 5 Tests, 2 neue dazugekommen).
- **Commit-Status:** `git status --short .github/workflows/security-staging.yml supabase/migrations/` → **leer** — beides committed. Relevante Commits: `1c45be1 chore(db): reconcile remote schema migrations`, `9a63113 fix(ci): repair security gate baselines`, `b8e23a5 fix(ci): normalize local Supabase env export`, `05c346c fix(ci): confine staging probe to ephemeral runner`, `449c858 test(db): guard migration history`.
- **Live-CI-Status:** Zwischenzeitlich (nach der Migrations-Fix-Landung, vor weiteren CI-Fixes) schlug der Workflow noch **dreimal** fehl (`33301806472`, `33302049061`, `33304434139`, 2026-08-30 08:31–09:35) — nicht mehr an der Migrations-Kollision (die Anwendung aller 59 Migrationen lief jedes Mal durch), sondern an einem separaten Bug in der letzten Testphase (`phase1-concurrency.ts`: „P1.3 concurrency passed" gefolgt von „P1.3 synthetic cleanup failed"). Dieser Bug existiert im aktuellen Code nicht mehr (0 Treffer für den Log-Text im Repo) — vermutlich durch einen der obigen Fix-Commits behoben. **Zwei frisch angestoßene Läufe an aktuellem `HEAD` (2026-08-30, per `gh run watch` bis zum Abschluss verfolgt) sind beide grün:** `33323199618` (workflow_dispatch, 3m9s) und `33323190063` (push, gleicher Commit). Das ist der erste bestätigte grüne Lauf dieses Gates überhaupt.
- **Nicht in diesem Nachtrag behoben:** Der zwischenzeitliche `phase1-concurrency.ts`-Cleanup-Bug wurde nicht selbst untersucht/gefixt — er löste sich vor dieser Prüfung bereits über einen der oben gelisteten Commits eines anderen Workstreams auf. Sollte er erneut auftreten, ist `git log -- scripts/phase1-concurrency.ts` der richtige Ausgangspunkt.

**Konsequenz für Unterkategorie #2:** Neubewertung auf **Top 19 %** (vorher Top 31 %) in [`worldmap/04_security_hardening.md`](../../worldmap/04_security_hardening.md) — Live-Grün-Status, lokale Reproduzierbarkeit (jetzt durch echte CI-Läufe belegt statt nur statisch geprüft) und Timeout-Robustheit (reale Laufzeit 3m5s–3m9s, weit unter dem 15-Minuten-Budget) verbessert. Diese archivierte Plandatei selbst bleibt unverändert (siehe `xx_sop/03_workflow_jan_planungsdateien.md`: „Archiv enthält ausgeführte Entscheidung, Evidenz und Historie", kein aktiver Plan) — nur dieser Nachtrag wurde ergänzt.
