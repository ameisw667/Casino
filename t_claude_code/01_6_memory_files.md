# 01.6 — Memory Files: Sub-Kategorie-Aufschlüsselung

> Stand: **2026-08-30** — Erstaufschlüsselung von Kategorie **6 „Memory Files"** aus `00_claude_code_uebersicht.md` in 10 einzeln bewertete Unterkategorien. Skala: **Top 1 % = Weltklasse**, **Top 100 % = schlechtestes Viertel**.
> Ort: `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\` — außerhalb des Repos, account- und projektspezifisch (ein Ordner pro Projektpfad).
> Abgrenzung: Kategorie 5 (Session-Memory & Continuous Learning) bewertet das **Verhalten** — hat `CLAUDE.md` ein Protokoll, das Memory-Schreibvorgänge auslöst? Diese Kategorie bewertet den **Inhalt** — was steht aktuell tatsächlich in den Memory-Dateien, und ist es gepflegt?

## Wichtigste Korrektur zuerst

`00_claude_code_uebersicht.md` Abschnitt 5 (Stand 2026-08-29) behauptete, der Ordner enthalte **18 Dateien**, basierend auf einer `/context`-Anzeige im Chat. Eine direkte Verzeichnisprüfung (`ls`) am 2026-08-30 zeigt: **Der Ordner enthält tatsächlich 4 Dateien** — `MEMORY.md` (Index) plus genau die 3 Notiz-Dateien, die im Index gelistet sind. Es gibt **keine** Differenz zwischen Index und Inhalt (anders als am 2026-08-29 vermutet). Die frühere „18 Dateien"-Zahl aus der `/context`-Anzeige bleibt ungeklärt — plausibelste Erklärung: Der `/context`-Befehl zählt vermutlich zusätzliche interne Cache-/Tool-Objekte oder Memory-Einträge anderer, in derselben Sitzung sichtbarer Projekte mit, nicht nur Dateien in diesem einen Ordner. Diese Datei korrigiert die Zahl auf den verifizierten Ist-Stand; `00_claude_code_uebersicht.md` wird im selben Schritt aktualisiert.

## Kernaussage für Jan

Die drei vorhandenen Memory-Dateien sind inhaltlich und formal von hoher Qualität (korrektes Frontmatter, klare Why/How-to-apply-Struktur, funktionierendes Frische-Warnsystem). Der reale Bottleneck ist **Abdeckungslücke nach Typ**: Von den vier vorgesehenen Memory-Typen (`user`, `feedback`, `project`, `reference`) sind nur zwei belegt (`feedback`: 2, `project`: 1); `user` und `reference` haben **0** Einträge — trotz 836 dokumentierter Sitzungsstarts mit diesem Projekt.

**Rechnerischer Schnitt über alle 10 Positionen: ≈ Top 55 %.**

## Kompaktübersicht (sortiert nach Niveau, bestes zuerst)

_Spaltenlogik (ergänzt 2026-09-05, einheitlich für `01_1`–`01_10`):_ **Planungsdateien** = Datei, in der die Umsetzung geplant ist („—" = Planung lebt in dieser Datei selbst). **Execution** = 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant.

_Ergänzung 2026-09-05 (Ists korrigiert, Niveaus unverändert):_ Der Ordner enthält inzwischen **5 Notiz-Dateien + Index** (Glob-Verifikation) — neu seit diesem Audit: `image_generation_model_preference.md` (feedback) und `openai_image_video_pricing_reference.md` (**erster `reference`-Eintrag**). Das mildert #5 (0→1 `reference`-Einträge) und #7 (letzter Schreibvorgang ist jetzt 2026-09-05, nicht mehr 2026-08-17); die Niveau-Spalte bleibt bewusst stehen, um den Audit-Zeitraum nicht rückwirkend zu verschleiern.

| #   | Unterkategorie                                 | Niveau       | Kernbefund                                                                                                                                                                                                                                                                                                                                    | Planungsdateien | Execution                                                                                                    |
| --- | ---------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | Format-/Frontmatter-Konformität                | **Top 10 %** | Alle 3 Notiz-Dateien folgen exakt dem vorgeschriebenen Schema (`name`/`description`/`metadata.type`) plus Why/How-to-apply — 0 Abweichungen                                                                                                                                                                                                   | —               | 🟢 umgesetzt                                                                                                 |
| 6   | Index-Konsistenz (`MEMORY.md` ↔ Dateien)       | **Top 10 %** | 100 % Deckung — jede der 3 Dateien ist im Index gelistet, keine verwaisten oder fehlenden Einträge (widerlegt die frühere „18 vs. 3"-Vermutung, siehe Korrektur oben)                                                                                                                                                                         | —               | 🟢 umgesetzt (auch nach 2026-09-05-Erweiterung deckungsgleich)                                               |
| 9   | Frische-Warnsystem                             | **Top 15 %** | Jede gelesene Memory-Datei trägt automatisch einen System-Hinweis „Diese Erinnerung ist X Tage alt … vor der Nutzung gegen aktuellen Code verifizieren" — funktioniert nachweislich (beobachtet bei allen 3 Dateien)                                                                                                                          | —               | 🟢 umgesetzt (Plattform-Mechanismus)                                                                         |
| 2   | Typ-Abdeckung „feedback"                       | **Top 20 %** | 2 Einträge (`no-visual-check-frontend`, `sql-delivery-as-file`), beide mit klarer Begründung und Anwendungsregel — genau der Typ, der laut Systemdefinition am häufigsten aus Korrekturen/Bestätigungen entstehen soll                                                                                                                        | —               | 🟢 umgesetzt (seit 2026-09-05: 3 Einträge inkl. `image_generation_model_preference`)                         |
| 3   | Typ-Abdeckung „project"                        | **Top 45 %** | Nur 1 Eintrag (`vip-rank-supabase-outsourcing`), inhaltlich gut, aber 62 Tage alt und seither nicht durch neue Projekt-Fakten ergänzt, obwohl seitdem u. a. Auth-Migration, Gildensystem und mehrere Security-Härtungsrunden stattfanden                                                                                                      | —               | 🔵 geplant (Prio 2: Nachträge nur nach Jans Freigabe)                                                        |
| 10  | Frühere Faktenlücke in der Kategorie-Übersicht | **Top 50 %** | Siehe Korrektur oben — kein Datenproblem im Memory-System selbst, sondern eine unverifizierte Übernahme einer `/context`-Zahl in eine Statusdatei; hiermit korrigiert, als Lehre auch für `01_5_session_memory.md`s Fehler-Pattern-Diskussion relevant                                                                                        | —               | 🟢 umgesetzt (korrigiert am 2026-08-30)                                                                      |
| 7   | Aktualitäts-/Pflegekadenz                      | **Top 75 %** | Letzte Änderung an einer Memory-Datei: 2026-08-17 (13 Tage vor diesem Audit) — bei nachweislich sehr hoher Projektaktivität im selben Zeitraum (u. a. Security-Härtung, K6-A-Migrationsbereinigung, Kategorie-14-Release-Disziplin) ist das eine reale Pflegelücke                                                                            | —               | 🟡 teilweise (2 neue Einträge am 2026-09-05, nachgetragen auf Jans Aufforderung; keine systematische Kadenz) |
| 8   | Dopplungs-/Verfallskontrolle                   | **Top 90 %** | `consolidate-memory`-Skill existiert explizit für diesen Zweck, wurde für dieses Projekt nie ausgeführt — bei nur 3 Dateien aktuell kein akutes Risiko, aber unverifiziert                                                                                                                                                                    | —               | 🔵 geplant (Prio 3: einmal testweise)                                                                        |
| 4   | Typ-Abdeckung „user"                           | **Top 95 %** | 0 Einträge — trotz `numStartups: 836` in der globalen Config (also 836 dokumentierten Sitzungsstarts insgesamt) existiert keine einzige Notiz über Jans Rolle, Erfahrungsstand oder Arbeitsweise, obwohl mehrere globale CLAUDE.md-Regeln (Kommunikationsstil, TDD-Vorliebe, Windows/PowerShell-Primat) genau dafür geeignete Rohstoffe wären | —               | 🔵 geplant (Prio 1, nur nach Jans Freigabe)                                                                  |
| 5   | Typ-Abdeckung „reference"                      | **Top 95 %** | 0 Einträge — obwohl mehrfach wiederkehrende externe IDs im Projekt vorkommen, die sich als Zeiger eignen würden (z. B. Supabase-Projekt-ID `hmqwozhdckbwjqzcmire`, Sentry-Org `berlin-agency`, GitHub-Repo `ameisw667/Casino`)                                                                                                                | —               | 🟢 überholt (erster `reference`-Eintrag existiert seit 2026-09-05: `openai_image_video_pricing_reference`)   |

**Rechnerischer Schnitt:** (10+10+15+20+45+50+75+90+95+95)/10 = **Top 51 %** (gerundet, im Fließtext oben auf Top 55 % konservativ aufgerundet wegen der Unsicherheit bei #10).

## Detailanmerkungen

### 1 — Format-/Frontmatter-Konformität (Top 10 %)

Alle drei Dateien (`no-visual-check-frontend.md`, `sql-delivery-as-file.md`, `vip-rank-supabase-outsourcing.md`) folgen exakt dem in der System-Dokumentation vorgeschriebenen Schema: YAML-Frontmatter mit `name`, `description`, `metadata.type` (zwei `feedback`, ein `project`), gefolgt von einem Fließtext-Body mit **Why:**- und **How to apply:**-Abschnitten. Keine der drei enthält Inhalte, die laut Systemregel _nicht_ gespeichert werden sollen (keine Code-Muster, keine Git-Historie, keine Debugging-Lösungen).

### 2/3/4/5 — Typ-Abdeckung

Die Verteilung (2× `feedback`, 1× `project`, 0× `user`, 0× `reference`) spiegelt vermutlich, welche Momente im bisherigen Projektverlauf explizit als „das merke dir" markiert wurden (`no-visual-check-frontend` und `sql-delivery-as-file` sind beide klar als direkte Jan-Korrekturen erkennbar). Die beiden leeren Typen sind kein Systemfehler, sondern zeigen, dass bislang niemand — weder Jan noch eine frühere LLM-Sitzung — bewusst einen `user`- oder `reference`-Eintrag angelegt hat, obwohl beide Kategorien laut Systemdefinition explizit dafür vorgesehen sind.

### 6 — Index-Konsistenz (Top 10 %)

Dies ist die wichtigste Einzelkorrektur dieser Datei: `MEMORY.md` listet exakt 3 Zeilen, der Ordner enthält exakt 3 Notiz-Dateien plus den Index selbst. Es gibt keine „unsichtbaren" Dateien und keine verwaisten Index-Einträge. Die frühere Sorge in `00_claude_code_uebersicht.md` Abschnitt 5 („Diese Differenz ist ungeklärt") ist damit als **falscher Alarm auf Basis einer nicht verifizierten Zahl** aufgelöst.

### 7 — Aktualitäts-/Pflegekadenz (Top 75 %)

Kein Memory-Eintrag wurde seit 2026-08-17 geschrieben. Im selben 13-Tage-Fenster fanden laut `worldmap/00_WORLDMAP_STATUS.md` mehrere lernrelevante Ereignisse statt (u. a. die Migrations-Kollisions-Bereinigung K6-A, zwei Security-Härtungsrunden, die Kategorie-14-Aufschlüsselung) — keines davon wurde als `project`- oder `feedback`-Memory festgehalten, obwohl mindestens der Stash-Vorfall (`worldmap/00_WORLDMAP_STATUS.md:112`) ein Lehrbuchbeispiel für einen wiederkehrenden Fehler-Pattern-Kandidaten ist, wie ihn `01_5_session_memory.md` Abschnitt 3.2 bereits beschreibt.

### 8 — Dopplungs-/Verfallskontrolle (Top 90 %)

Bei aktuell nur 3 Dateien ist das Risiko von Dopplungen praktisch null — die Bewertung ist bewusst trotzdem niedrig angesetzt, weil der dafür vorgesehene Prozess (`consolidate-memory`-Skill) nie verifiziert wurde und daher unbekannt ist, ob er im Ernstfall (z. B. bei 15–20 Dateien) tatsächlich funktioniert.

### 9 — Frische-Warnsystem (Top 15 %)

Ein echtes, beobachtbares Sicherheitsnetz: Jede der drei gelesenen Dateien lieferte automatisch einen Systemhinweis mit exaktem Alter („20 Tage alt", „12 Tage alt", „62 Tage alt") und der Aufforderung, Code-Verhalten vor der Nutzung als Fakt zu verifizieren. Das deckt sich mit der projektweiten Doku-Regel „Status als lokal/verifiziert/live kennzeichnen" (`CLAUDE.md` Abschnitt „Doku-Aktualität") und funktioniert unabhängig davon automatisch auf Werkzeugebene.

### 10 — Frühere Faktenlücke in der Kategorie-Übersicht (Top 50 %)

Diese Position bewertet nicht das Memory-System selbst, sondern die Qualität der vorherigen Selbsteinschätzung darüber in `00_claude_code_uebersicht.md`. Eine unverifizierte `/context`-Zahl wurde als Fakt in eine Statusdatei übernommen, ohne sie gegen den tatsächlichen Ordnerinhalt zu prüfen — ein Beispiel für genau das Muster, vor dem die globale Verifikationsregel warnt („Vor dem Beantworten … überprüfen, ob die Erinnerung noch korrekt und aktuell ist"). Mit dieser Korrektur ist der Fehler behoben; die Note bleibt mittelmäßig, weil er erst jetzt und nicht bei der Ersterstellung aufgefallen ist.

## Empfohlene Bearbeitungsreihenfolge

| Prio | Unterkategorie                                         | Warum zuerst/danach                                                                                                                                                                                                                             |
| ---- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | #4/#5 Erste `user`- und `reference`-Einträge anlegen   | Größte Abdeckungslücke, geringer Aufwand (Rohstoffe bereits in globaler `CLAUDE.md` bzw. wiederkehrenden Projekt-IDs vorhanden) — **nur nach Jans expliziter Freigabe**, da die globale Regel „Write to memory only when I explicitly ask" gilt |
| 2    | #7 Pflegekadenz erhöhen                                | Den Stash-Vorfall und die K6-A-Bereinigung als `project`-Memory nachtragen, sobald Jan einen Schreibvorgang freigibt                                                                                                                            |
| 3    | #8 `consolidate-memory` einmal testweise laufen lassen | Baseline schaffen, bevor die Dateizahl wächst                                                                                                                                                                                                   |
| 4    | #1, #2, #3, #6, #9, #10                                | Bereits solide bis exzellent — kein Handlungsbedarf                                                                                                                                                                                             |

## Verwandte Artefakte

| Bedarf                                                          | Datei                                                                      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Verhaltensregel „wann wird überhaupt geschrieben" (Kategorie 5) | [`01_5_session_memory.md`](01_5_session_memory.md)                         |
| Globale Memory-Schreibregel „nur auf explizite Anfrage"         | `C:\Users\hambu\.claude\CLAUDE.md` Abschnitt „Memory"                      |
| Bisheriger (jetzt korrigierter) Zwischenstand                   | [`00_claude_code_uebersicht.md`](00_claude_code_uebersicht.md) Abschnitt 5 |
