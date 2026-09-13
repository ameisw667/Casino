# 12 — Execution-Handoff-Prompt für die Datenbank-Härtung (Säulen 7, 8, 9, 10)

> **Zweck dieser Datei:** Der Inhalt ab Abschnitt "PROMPT BEGINNT HIER" ist als **Input für eine komplett frische, separate LLM-Konversation** gedacht (kein Zugriff auf die Planungs-Konversation, die diese Dateien erzeugt hat). Diese Konversation selbst bleibt planungsseitig — sie führt nichts davon aus. Kopiere den Prompt-Block unverändert in die neue Konversation.
>
> **Herkunft:** Erzeugt am 2026-09-12 als Abschluss der Überarbeitung von `05_database_backup_and_recovery.md`, `10_database_testschicht_pgtap.md`, `11_database_query_performance_indexing.md` und `08_database_connection_pooling.md`. Vor der Übergabe an Jan wurde dieser Prompt selbst einer Mehr-Perspektiven-Prüfung unterzogen (Abschnitt "Selbstprüfung dieses Prompts" am Ende dieser Datei) — dort ist auch dokumentiert, was dabei korrigiert wurde.

---

## PROMPT BEGINNT HIER

Du bist als Ausführungs-Konversation für das Repository `V:\VibeCoding\Casino` gestartet worden (Next.js/Supabase-Casino-Projekt). Du hast **keinen Zugriff auf eine vorherige Chat-Historie** — alles, was du wissen musst, steht in diesem Prompt und den Dateien, auf die er verweist. Lies nichts blind aus diesem Prompt ab, was du am echten Code/Repo-Zustand gegenprüfen kannst — bei jedem Widerspruch gewinnt der Code, nicht dieser Text.

### 0. Pflichtlektüre vor der ersten Aktion (in dieser Reihenfolge)

1. `AGENTS.md` und `CLAUDE.md` im Projekt-Root `V:\VibeCoding\Casino` — enthalten die verbindlichen K-Level-Gates, die Code-Review-Pflichten und die Supabase-Regeln, denen diese Aufgabe unterliegt. **Diese Regeln stehen über allem, was in diesem Prompt steht.**
2. `xx_sop/03_workflow_jan_planungsdateien.md`, `xx_sop/02_workflow_jan_execution.md`, `xx_sop/05_database_supabase.md`, `xx_sop/18_postgres_patterns_migrations.md`, `xx_sop/09_security_wallet_invariants.md`.
3. Die vier Planungsdateien, die du vollständig ausführst — **jede einzeln komplett lesen, nicht nur überfliegen**:
   - `T_DATABASE/05_database_backup_and_recovery.md` (Neufassung 2026-09-12, Meilensteine N1–N7)
   - `T_DATABASE/10_database_testschicht_pgtap.md` (Neufassung 2026-09-12, Meilensteine N1–N7)
   - `T_DATABASE/11_database_query_performance_indexing.md` (Neufassung 2026-09-12, Meilensteine N1–N4)
   - `T_DATABASE/08_database_connection_pooling.md` (erweitert 2026-09-12: L1–L6 unverändert Execution-Ready und noch nicht ausgeführt, plus neue Meilensteine N1–N4)
4. `T_DATABASE/00_DATABASE_VERBESSERUNG.md` Abschnitt 1–3 — liefert den Gesamtkontext, warum diese vier Säulen priorisiert wurden, und ist die Datei, die du am Ende dieser Aufgabe aktualisierst (Schritt 6 unten).

### 1. Auftrag in einem Satz

Führe **alle N-Meilensteine** der vier oben genannten Planungsdateien vollständig aus (die dort jeweils bereits ausgeführten L-Meilensteine bleiben unverändert bestehen und müssen nicht wiederholt werden, außer eine Datei sagt explizit, dass ein L-Meilenstein noch offen ist — z. B. `08_database_connection_pooling.md` L1–L6 sind Execution-Ready, aber **noch nicht ausgeführt**, die zählen also mit), bis jede der vier Säulen ihre in der jeweiligen Datei genannte Zielmarke (Abschnitt "Definition of Done" der jeweiligen Datei) erreicht oder — bei den zwei echten Jan-Gates — bis zu dem Punkt, an dem nur noch eine explizite Jan-Entscheidung fehlt.

### 2. Bearbeitungsreihenfolge & Subagenten-Einsatz

Die vier Säulen sind **überwiegend unabhängig** voneinander und eignen sich für parallele Bearbeitung durch separate Subagenten — mit zwei expliziten Kopplungspunkten, die Koordination brauchen:

```
Säule 9 (Backup)         Säule 10 (Testschicht)      Säule 8 (Pooling)  ←──┐
  N1 → N2 → N6 → N7*        N1 → {N2,N3,N5} → N4        L1→L2→L3→L4        │ N1 koordiniert
      ↘ N3, N4, N5              → N6 → N7               L5a ──────┐        │ gemeinsamen
        (parallel zu N2)                                L6 → N3   │        │ Lasttest
                                                          N2, N4   │        │
                                                                   ▼        │
                                                    Säule 7 (Query-Perf) ←──┘
                                                          N1 (konsumiert Säule-8-Lasttest)
                                                             → N2 → N3
                                                          N4 (unabhängig, parallel möglich)
```

- **Verwende einen eigenen Subagenten pro Säule** (z. B. über die `Agent`-Funktion, `subagent_type: general-purpose` oder `code-architect` für die reine Code-Arbeit) — jede Säule hat eigene Dateien, eigene Tests, keinen geteilten Zustand außer der in Schritt 2 unten beschriebenen Lasttest-Kopplung.
- **Vor dem parallelen Start von Säule 7 und Säule 8:** Kläre (im Hauptthread, nicht in den Subagenten), welcher der beiden Subagenten den gemeinsamen Lasttest-Lauf (`npm run loadtest:bet`) tatsächlich startet, und übergib dem jeweils anderen Subagenten nur die daraus resultierende Zeitstempel-/Lauf-ID, statt beide gleichzeitig eigene Läufe starten zu lassen (sonst entstehen widersprüchliche, nicht vergleichbare Messungen und ein unnötig hoher Last-Peak).
- **Migrationen (Säule 10 N-Meilenstein mit neuer Extension, falls noch nicht vorhanden geprüft) durchlaufen immer:** Pre-Flight-Kollisionscheck → Migration schreiben → **`@migration-security-guard` als Pflicht-Review** (read-only, PASS/FINDING/BLOCKED-Ergebnis in der jeweiligen Datei nachtragen) → erst danach lokal anwenden. Kein Subagent darf diesen Schritt überspringen.
- **Jede Änderung an Geldpfad-Code (Money-Pfad = Ja in einer Milestone-Tabelle)** braucht laut `CLAUDE.md` zusätzlich eine `security-reviewer`-Runde vor Abschluss — das gilt für: Säule 9 N2 (Multi-Target-Credential-Handling), Säule 10 N2/N3/N5 (neue Geld-RPC-Tests), Säule 8 N3 (Chaos-Test für den Geld-Antwortpfad), Säule 8 L6 (Retry-Logik, falls noch nicht ausgeführt).

### 3. Nicht-verhandelbare Sicherheitsregeln (aus den vier Dateien übernommen, hier zusammengefasst — Details stehen in den Originaldateien)

- **Niemals `EXPLAIN ANALYZE` direkt auf einen Aufruf einer Geld-RPC** (`settle_game_bet`, `start_game_round`, `advance_blackjack_round`, sowie alle in Säule-10-N1 neu identifizierten P0-Funktionen) — nur auf isolierte interne `SELECT`-Statements.
- **Niemals gegen die Produktions-/`--linked`-Datenbank testen**, wenn eine Datei explizit "nur lokal" oder einen Connection-String-Safety-Guard vorschreibt (Säule 9 Restore-Code, Säule 8 N4 Pool-Erschöpfungstest).
- **Keine echten externen Backup-Ziele, Zugangsdaten oder Kosten-Commitments ohne Jan** — Säule 9 N7 ist ein K4-Gate. Bereite alles vor (Runbook, Code, Tests gegen Fixtures), aber **stoppe explizit und frage Jan**, bevor du versuchst, ein echtes externes Konto zu erstellen oder echte Zugangsdaten zu verwenden. Simuliere niemals eine Jan-Freigabe.
- **Kein echter Lasttest gegen Produktion ohne Jan** — Säule 8 L5b ist ebenfalls ein K4-Gate, unabhängig davon, ob L5a/N1 (lokaler Lasttest) längst abgeschlossen ist.
- **Kein Secret-Leak** — Säule 9 N5 (Config-Inventar) hat einen Pflicht-Selbstcheck gegen Secret-Muster vor dem Schreiben der Ausgabedatei; führe ihn tatsächlich aus, verlass dich nicht auf "sollte sicher sein".
- Wenn eine Datei an einer Stelle unklar ist oder ein in der Datei benannter Vorbehalt (z. B. "vor Testbau per grep verifizieren") nicht sauber aufgelöst werden kann: **dokumentiere den Fund in der jeweiligen Datei und triff eine begründete, konservative Entscheidung** — brich nicht die ganze Aufgabe ab, aber erfinde auch keine Fakten.

### 4. Verifikations-Standard (dieses Projekt akzeptiert keine unbelegten Status-Behauptungen)

Für **jeden** Meilenstein, den du als abgeschlossen markierst:

- Der zugehörige Befehl/Test wurde **tatsächlich ausgeführt**, nicht nur beschrieben — zitiere das echte Ergebnis (Testzahl, Exit-Code, Laufzeit) in der jeweiligen Datei, wie es die bereits vorhandenen "Umsetzung"-Absätze der L-Meilensteine in denselben Dateien vormachen.
- Trage nach jedem abgeschlossenen N-Meilenstein einen "Umsetzung `<Datum>`"-Absatz direkt unter dem jeweiligen Meilenstein-Abschnitt nach (identisches Muster wie die bestehenden L-Meilensteine in denselben Dateien) — inklusive ehrlicher Abweichungen vom Plan, falls die Realität vom geplanten Schritt abwich.
- Bei Money-Pfad-Meilensteinen: das Ergebnis der Pflicht-Security-Review (Abschnitt 2 oben) explizit im Umsetzungs-Absatz vermerken (PASS/FINDING mit Fix/BLOCKED mit Grund).
- Wenn ein Meilenstein **nicht** vollständig abgeschlossen werden kann (z. B. Docker nicht verfügbar für einen Drill-Test, ein externes Tool fehlt): das explizit und ehrlich als offen markieren, keine Teilausführung als vollständig verkaufen.

### 5. Abschluss-Gate pro Säule

Bevor eine Säule als "fertig für diese Session" gilt:

1. Alle N-Meilensteine dieser Säule sind entweder abgeschlossen (mit Umsetzungs-Beleg) oder explizit als "wartet auf Jan" (nur bei den beiden echten K4-Gates) markiert.
2. `npm run typecheck` und `npm run lint` sind für die im Rahmen dieser Säule geänderten Dateien grün.
3. Alle neuen/geänderten Tests dieser Säule sind grün (`npm test` für Vitest-Änderungen, `npx supabase test db` für neue pgTAP-Dateien).
4. Keine neue Datei/kein neues Skript dupliziert eine bereits bestehende Referenz (siehe "Keine Referenz doppelt gepflegt" in jeder Datei's Selbstprüfungs-Abschnitt) — bei Zweifel die Originaldatei erneut lesen.

### 6. Letzter Schritt (erst wenn alle vier Säulen durch sind): `00_DATABASE_VERBESSERUNG.md` aktualisieren

Dies ist der **Abschluss der gesamten Aufgabe** — vorher gilt sie nicht als beendet.

1. Für jede der vier Säulen (7, 8, 9, 10) in der Tabelle in Abschnitt 3 von `00_DATABASE_VERBESSERUNG.md`:
   - **Niveau ehrlich neu bewerten** — nicht einfach die in den Planungsdateien genannte *Zielmarke* übernehmen. Die Zielmarken (z. B. "Top 15–20 %" für Säule 9) gelten nur bei **vollständigem** Abschluss inklusive der Jan-Gates. Falls ein Jan-Gate (Säule 9 N7, Säule 8 L5b) noch offen ist, bewerte das reale, tatsächlich erreichte Niveau **ohne** diesen letzten Schritt — analog zur bereits in `00_DATABASE_VERBESSERUNG.md` etablierten Logik ("Top 88 % vor L11, Top 50 % danach, Top 25 % erst nach echtem Regelbetrieb").
   - Spalte "Execution durchgeführt" auf "Ja" setzen **nur** für Säulen, deren N-Meilensteine vollständig (inkl. etwaiger Jan-Gates) abgeschlossen sind. Bei offenem Jan-Gate: "Teilweise (N1–N6 ausgeführt, N7 wartet auf Jan)" o. ä. präzise formulieren, nicht pauschal "Ja" oder "Nein".
   - Die Fußnote ⁷ ("neu geplant") durch eine neue Fußnote mit echtem Ausführungsdatum und einer kurzen Zusammenfassung der wichtigsten realen Befunde ersetzen (nach demselben Muster wie die bestehenden Fußnoten ¹–⁶ für die historischen L-Meilensteine).
2. Abschnitt 2 (Executive Summary) und Abschnitt 2a aktualisieren: das "Execution ≠ Niveau"-Beispiel (Säule 9) durch den tatsächlichen neuen Stand ersetzen oder — falls das Problem strukturell weiterhin besteht (z. B. weil N7 noch auf Jan wartet) — genau das transparent so benennen, statt es zu beschönigen.
3. Abschnitt 4 (Gewichteter Gesamt-Schnitt) mit den neuen Niveau-Werten neu berechnen und die neue Summe ausweisen.
4. Abschnitt 5 (Priorisierte Reihenfolge) aktualisieren: die vier Zeilen entweder auf "abgeschlossen, im Erhalt-Modus" setzen oder die verbleibenden offenen Punkte (Jan-Gates) als neue Prio-1-Position führen.
5. **Verifizieren, nicht behaupten:** Jede neue Zahl in `00_DATABASE_VERBESSERUNG.md` muss auf einen echten Beleg in einer der vier Planungsdateien zurückverfolgbar sein (Cross-Referenz-Konsistenz, wie es die Selbstprüfungs-Abschnitte aller vier Dateien bereits verlangen).

### 7. Was explizit NICHT zu dieser Aufgabe gehört

- Keine Änderungen an anderen Säulen (1–6) — die sind laut `00_DATABASE_VERBESSERUNG.md` im bewussten Erhalt-Modus.
- Keine Änderungen an Tabellen/Code anderer VibeCoding-Projekte (Projekt-Isolationsregel aus dem globalen `CLAUDE.md`).
- Kein `git push` und kein Erstellen einer PR ohne expliziten Jan-Auftrag in dieser neuen Konversation — diese Aufgabe wurde dir als Execution-Auftrag für lokale/CI-Arbeit übergeben, nicht als Freigabe für Remote-Aktionen darüber hinaus.
- Keine Erweiterung des Scopes über die vier genannten Dateien hinaus, auch wenn dabei weitere Verbesserungsideen auffallen — dokumentiere sie stattdessen als Fund in der jeweiligen Datei (analog zu bereits bestehenden "bewusst offene Lücke"-Vermerken), statt sie ungefragt mitzuerledigen.

---

## PROMPT ENDET HIER

---

## Selbstprüfung dieses Prompts (vor Übergabe an Jan, mehrere Perspektiven)

| Perspektive | Prüffrage | Ergebnis |
| --- | --- | --- |
| **Vollständigkeit** | Deckt der Prompt alle 4 Dateien und alle darin enthaltenen N-Meilensteine ab, inklusive der beiden echten Jan-Gates? | Ja — Abschnitt 1–3 referenzieren alle vier Dateien vollständig; die zwei Jan-Gates (Säule 9 N7, Säule 8 L5b) sind in Abschnitt 3 explizit als Stopp-Punkte benannt, nicht implizit erwartet. |
| **Sicherheit** | Kann die Ausführungs-Konversation versehentlich eine Jan-Freigabe simulieren, ein Secret leaken oder gegen Produktion testen? | Ursprünglicher Entwurf hatte diese Punkte nur implizit über die Original-Dateien abgedeckt — **korrigiert:** Abschnitt 3 fasst sie jetzt explizit und zentral zusammen, statt darauf zu vertrauen, dass die Ausführungs-Konversation sie beim Lesen von vier langen Dateien nicht übersieht. |
| **Eigenständigkeit** | Kann eine Konversation ohne jeglichen Chat-Verlauf diesen Prompt verstehen und ausführen? | Ja — Abschnitt 0 verlangt explizit das Lesen von `AGENTS.md`/`CLAUDE.md` zuerst, dann der vier Planungsdateien; keine Referenz auf "wie besprochen" oder implizites Vorwissen. |
| **Parallelisierungs-Korrektheit** | Ist die vorgeschlagene Subagenten-Aufteilung tatsächlich konfliktfrei? | Ursprünglicher Entwurf ließ Säule 7 und Säule 8 unabhängig parallel starten — **korrigiert:** Der gemeinsame Lasttest (Säule 7 N1 ↔ Säule 8 N1) hätte bei echter Parallelität zu zwei gleichzeitigen `loadtest:bet`-Läufen geführt (widersprüchliche Messung, unnötige doppelte Last). Abschnitt 2 verlangt jetzt explizit eine Koordination im Hauptthread vor dem parallelen Start. |
| **Verifikationsdisziplin** | Verhindert der Prompt, dass Meilensteine als erledigt behauptet werden, ohne wirklich ausgeführt worden zu sein (das exakte Problem, das diese ganze Aufgabe ausgelöst hat)? | Ja — Abschnitt 4 verlangt echte Befehlsausgaben und Umsetzungs-Absätze nach dem bereits im Repo etablierten Muster; Abschnitt 6.5 verlangt zusätzlich Cross-Referenz-Rückverfolgbarkeit für die finale 00-Datei-Aktualisierung. |
| **Ehrlichkeit bei Teilausführung** | Was passiert, wenn eine Säule wegen eines Jan-Gates nicht zu 100 % fertig wird — wird das Ergebnis trotzdem als "Top X %" schöngerechnet? | Ursprünglicher Entwurf sagte nur "Niveau neu bewerten" — **korrigiert:** Abschnitt 6.1 verlangt jetzt explizit, die Zielmarke nur bei vollständigem Abschluss **inklusive** Jan-Gate zu übernehmen, und schreibt die bereits im Projekt etablierte Staffelungs-Logik (Top 88 % → 50 % → 25 % je nach Fortschritt) als Vorbild vor, statt einer binären Ja/Nein-Bewertung. |
| **Scope-Disziplin** | Verhindert der Prompt, dass die Ausführungs-Konversation ungefragt weitere Säulen oder andere Projekte anfasst? | Ja — Abschnitt 7 grenzt explizit ab (Säulen 1–6 Erhalt-Modus, keine anderen VibeCoding-Projekte, kein Push/PR ohne Auftrag, keine Scope-Erweiterung bei Nebenfunden). |
| **Money-Pfad-Disziplin** | Sind alle Money-Pfad-Meilensteine mit Pflicht-Review verknüpft, auch über die vier Einzeldateien hinweg konsistent? | Ja — Abschnitt 2 listet sie zentral (Säule 9 N2, Säule 10 N2/N3/N5, Säule 8 N3/L6) statt sich darauf zu verlassen, dass jede Datei einzeln daran erinnert. |

**Fazit der Selbstprüfung:** Drei konkrete Lücken wurden vor der finalen Fassung behoben (zentrale Sicherheitsregel-Zusammenfassung statt Verstreuung, explizite Lasttest-Koordination statt naiver Parallelität, gestaffelte statt binäre Teilausführungs-Bewertung). Der Prompt ist damit eigenständig ausführbar, sicherheitsbewusst und verhindert strukturell dieselbe "Execution ≠ Niveau"-Verwechslung, die diese gesamte Überarbeitung ausgelöst hat.
