# 01.2 — Skills: Sub-Kategorie-Aufschlüsselung

> Stand: **2026-08-30** — Erstaufschlüsselung von Kategorie **2 „Skills"** aus `00_claude_code_uebersicht.md` in bis zu 10 einzeln bewertete Unterkategorien, analog zur bereits etablierten Methodik in `worldmap/04_security_hardening.md`. Skala: **Top 1 % = Weltklasse**, **Top 100 % = schlechtestes Viertel** unter vergleichbaren Hobby-/Indie-Setups, die Claude Code aktiv nutzen.
> Abgrenzung: Skill-**Erstellung**/Reifegrad-Definition ist bereits kanonisch in [`skills/13_skill_worldclass_creation.md`](skills/13_skill_worldclass_creation.md) dokumentiert — diese Datei dupliziert deren Inhalt nicht, sondern bewertet den **Ist-Zustand** (wie viele Skills existieren wirklich, werden sie genutzt, wie gut sind sie gepflegt).

## Kernaussage für Jan

Die verfügbare Skill-**Infrastruktur** ist außergewöhnlich groß (über 150 Skills laut aktueller Sitzungsliste, davon 20 Einträge im globalen `C:\Users\hambu\.claude\skills`-Ordner, der Rest über Plugins wie `anthropic-skills`). Der reale Bottleneck liegt nicht in der Verfügbarkeit, sondern in der **projekteigenen Nutzung**: Für Casino existiert **0** eigener Skill unter einem projektlokalen `.claude/skills/`-Ordner (geprüft: der Ordner existiert im Repo nicht), und der einzige dokumentierte Meilenstein „Erster echter Skill" (`S2` in `skills/13_skill_worldclass_creation.md`) steht seit Erstellung auf 🔴 Geplant.

**Rechnerischer Schnitt über alle 10 Positionen: ≈ Top 59 %.**

## Kompaktübersicht (sortiert nach Niveau, bestes zuerst)

_Spaltenlogik (ergänzt 2026-09-05, einheitlich für `01_1`–`01_10`):_ **Planungsdateien** = Datei, in der die Umsetzung geplant ist („—" = Planung lebt in dieser Datei selbst). **Execution** = 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant.

| #   | Unterkategorie                                                  | Niveau        | Kernbefund                                                                                                                                                                                                                                                                                                                        | Planungsdateien                                                                                            | Execution                                 |
| --- | --------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 4   | Skill-Erstellungs-Leitfaden (`13_skill_worldclass_creation.md`) | **Top 10 %**  | Eigenständige, kohärente Reifegrad-Taxonomie (0–5) mit Weltklasse-Kriterienkatalog, Anti-Overengineering-Check und Erstellungszyklus — Qualität auf Höhe der offiziellen Skill-Authoring-Guides                                                                                                                                   | [`skills/13_skill_worldclass_creation.md`](skills/13_skill_worldclass_creation.md)                         | 🟢 umgesetzt (als Dokument)               |
| 5   | Skill-vs-SOP-Abgrenzungsdisziplin                               | **Top 15 %**  | Explizite Regel „Ein Skill wird nicht allein deshalb angelegt, weil er Markdown ist" verhindert Skill-Wildwuchs — wird bislang konsequent eingehalten (0 unnötige Skills angelegt)                                                                                                                                                | [`skills/13_skill_worldclass_creation.md`](skills/13_skill_worldclass_creation.md)                         | 🟢 umgesetzt (Disziplin gelebt)           |
| 3   | Wiederverwendung bestehender Ökosystem-Skills im Router         | **Top 20 %**  | `CLAUDE.md` „Session-Kontinuität" referenziert `checkpoint`/`save-session`/`resume-session`/`learn-eval` konkret und mit Trigger — verifiziertes Beispiel für Routing statt Neubau (siehe `01_5_session_memory.md` Abschnitt 3.1)                                                                                                 | [`01_5_session_memory.md`](01_5_session_memory.md)                                                         | 🟢 umgesetzt (Regel in `CLAUDE.md` aktiv) |
| 1   | Skill-Discovery/Trigger-Präzision im globalen Pool              | **Top 25 %**  | Beschreibungsfelder der verfügbaren Skills sind überwiegend präzise und Trigger-tauglich (z. B. `firecrawl-scrape`, `security-review`); Kehrseite: Namensüberschneidungen (`code-review` vs. `review-pr` vs. `security-scan`) erhöhen das Risiko einer falschen Wahl                                                              | [`skills/14_top_level_skills_load_audit.md`](skills/14_top_level_skills_load_audit.md) (🟡 wartet auf Jan) | ⚪ nicht geplant                          |
| 8   | Cross-Projekt-Skill-Kuratierung                                 | **Top 35 %**  | Mindestens 3 Design-Skills (`emil-design-eng`, `design-taste-frontend`/`impeccable`) wurden nachweislich manuell aus einer Scratchpad-Quelle in `V:\VibeCoding\.claude\skills\` kopiert (Beleg: `settings.local.json`-Permission-Historie) — real, aber ad-hoc statt als wiederholbarer Prozess                                   | —                                                                                                          | ⚪ nicht geplant (ad-hoc)                 |
| 9   | Plugin-Packaging für Casino                                     | **Top 90 %**  | Plugin-Infrastruktur (`cowork-plugin-management:*`) ist global verfügbar, aber für Casino wurde nie ein eigenes Plugin (Bündel aus Skills/Agents/Hooks) geschnürt, obwohl `01_1_claude_md.md` §5 genau das als Ausbaustufe vorschlägt                                                                                             | [`01_1_claude_md.md`](01_1_claude_md.md) §5                                                                | ⚪ nicht geplant (langfristig)            |
| 7   | Skill-Wartung & Health-Monitoring                               | **Top 95 %**  | `skill-health`-Skill existiert und liefert laut Beschreibung ein „Skill-Portfolio-Health-Dashboard" — wurde für dieses Projekt nachweislich nie ausgeführt (kein Artefakt/Report im Repo auffindbar)                                                                                                                              | —                                                                                                          | 🔵 geplant (Prio 3: einmaliger Testlauf)  |
| 6   | Skill-Evaluierung (Eval-Fälle)                                  | **Top 100 %** | Nicht anwendbar im strengen Sinn (0 Skills → 0 Eval-Fälle nötig), zählt aber als Bottleneck: Die in `13_skill_worldclass_creation.md` §4 geforderte „mindestens fünf Fälle, zwei frische Läufe" wurde noch für keinen einzigen Casino-Skill durchlaufen, weil Schritt 1 (Bedarf nachweisen) nie zu Schritt 2 (Skill bauen) führte | [`skills/13_skill_worldclass_creation.md`](skills/13_skill_worldclass_creation.md) §4                      | 🔵 geplant (hängt an #2)                  |
| 2   | Projekteigene Skills (Anzahl/Reife)                             | **Top 100 %** | 0 von 0 — `S2` in `skills/13_skill_worldclass_creation.md` ist seit 2026-08-23 unverändert 🔴 Geplant; die drei in `01_1_claude_md.md` §5 vorgeschlagenen Kandidaten (`casino-security-scan`, `casino-test-matrix`, `session-checkpoint`) wurden nie gebaut                                                                       | [`skills/13_skill_worldclass_creation.md`](skills/13_skill_worldclass_creation.md) (S2)                    | 🔵 geplant (S2, seit 2026-08-23)          |
| 10  | Verifizierter Skill-Nutzungs-Nachweis für Casino-Aufgaben       | **Top 100 %** | Trotz Zugriff auf über 150 Skills gibt es im Repo keine Spur (Commit, Statusdatei, Memory-Eintrag), dass für eine Casino-spezifische Aufgabe je ein Skill aktiv aufgerufen wurde — die Nutzung bleibt unbelegt, nicht nur „selten"                                                                                                | —                                                                                                          | ⚪ nicht geplant (folgt #2)               |

**Rechnerischer Schnitt:** (10+15+20+25+35+90+95+100+100+100)/10 = **Top 59 %** (gerundet).

## Detailanmerkungen

### 1 — Skill-Discovery/Trigger-Präzision im globalen Pool (Top 25 %)

Die Skill-Liste dieser Sitzung enthält präzise, spezifische `description`-Felder (z. B. unterscheidet `firecrawl-scrape` klar von `firecrawl-crawl` und `firecrawl-search`). Schwächer: mehrere Skills decken thematisch überlappende Aufgaben ab (`code-review`, `review-pr`, `security-scan`, `security-review` — vier verschiedene Namen für verwandte Review-Aufgaben), was die Trefferwahrscheinlichkeit für die _richtige_ Wahl senkt, ohne dass eine Instanz das je in der Praxis für Casino falsch gewählt hätte (keine dokumentierte Fehlwahl bekannt).

### 2 — Projekteigene Skills (Top 100 %)

Verifiziert per Glob: kein `.claude/skills/`-Verzeichnis im Casino-Repo. Der einzige belastbare Fortschrittsindikator (`S2` in `skills/13_skill_worldclass_creation.md`) ist seit Erstellung unverändert. Das ist der größte Einzel-Bottleneck dieser Kategorie und deckt sich mit dem in `01_1_claude_md.md` Dimension 6 bereits erkannten Muster „Command-Automatisierung existiert nur als Idee, nicht als gebautes Artefakt".

### 3 — Wiederverwendung bestehender Ökosystem-Skills (Top 20 %)

`01_5_session_memory.md` Abschnitt 3.1 verifiziert bereits, dass `checkpoint`, `save-session`, `resume-session`, `sessions`, `learn`, `learn-eval` real in der Skill-Liste existieren und über den `CLAUDE.md`-Abschnitt „Session-Kontinuität" konkret geroutet werden. Das ist der einzige Ort im Projekt, an dem generische Skills tatsächlich verbindlich referenziert statt nur potenziell verfügbar sind.

### 4 — Skill-Erstellungs-Leitfaden (Top 10 %)

`skills/13_skill_worldclass_creation.md` liefert eine vollständige Taxonomie (0–5 Reifegrade), einen 10-Kriterien-Qualitätsmaßstab (Trigger-Präzision, Least Privilege, Fail-Closed, Evaluierung, Versionierung) und einen expliziten Anti-Overengineering-Check. Qualitativ auf Augenhöhe mit der Skill-Erstellungsdisziplin, die für Agenten bereits in `xx_sop/13_workflow_agent_creation.md` etabliert ist — bislang aber reine Referenz ohne einen einzigen realen Anwendungsfall (siehe #2).

### 5 — Skill-vs-SOP-Abgrenzungsdisziplin (Top 15 %)

Die Leitentscheidung „Eine SOP wird nicht allein deshalb zu einem Skill, weil sie Markdown ist" (`skills/13_skill_worldclass_creation.md:13`) hat bislang verhindert, dass die umfangreiche `xx_sop/`-Struktur (19 Dateien) unnötig in Skill-Form dupliziert wurde. Das ist messbar: 0 Skills wurden bislang aus bestehenden SOPs generiert, obwohl die Versuchung bei 19 SOP-Dateien groß gewesen wäre.

### 6 — Skill-Evaluierung (Top 100 %)

Direkte Folge von #2: Ohne gebaute Skills gibt es nichts zu evaluieren. Bewusst dennoch als eigene Zeile geführt (statt weggelassen), weil sie den zweiten Schritt eines zusammenhängenden Prozesses markiert, der komplett unbegonnen ist.

### 7 — Skill-Wartung & Health-Monitoring (Top 95 %)

`skill-health` ist als Skill in der aktuellen Liste vorhanden („Show skill portfolio health dashboard with charts and analytics"), wurde aber für dieses Projekt nie ausgeführt — es existiert kein Dashboard-Export, keine Statusdatei, kein Verweis darauf in `t_claude_code/`.

### 8 — Cross-Projekt-Skill-Kuratierung (Top 35 %)

`settings.local.json` (Abschnitt `permissions.allow`) enthält historische, tatsächlich ausgeführte Befehle wie `Bash(mkdir -p ~/.claude/skills/emil-design-eng)` und `Bash(cp "V:/VibeCoding/.claude/skills/emil-design-eng.md" ~/.claude/skills/emil-design-eng/SKILL.md)` — ein realer, aber manueller Kurationsvorgang (Skill aus einer Scratchpad-Quelle geholt, projektübergreifend nach `V:\VibeCoding\.claude\skills\` und lokal nach `~/.claude/skills/` kopiert). Kein wiederholbarer Prozess, keine Dokumentation, warum genau diese drei Skills (Design-Geschmack) kuratiert wurden statt anderer.

### 9 — Plugin-Packaging für Casino (Top 90 %)

Die Plugin-Infrastruktur selbst ist vorhanden und wird in `skills/13_skill_worldclass_creation.md` Abschnitt 2 korrekt als „Reifegrad 5" beschrieben. `01_1_claude_md.md` Abschnitt 5 schlägt explizit ein „Casino-Engineering-Plugin" als Zielbild vor — bislang 0 Umsetzung.

### 10 — Verifizierter Skill-Nutzungs-Nachweis (Top 100 %)

Die schärfste Formulierung dieses Befunds: Trotz eines der umfangreichsten verfügbaren Skill-Kataloge, die in dieser Umgebung beobachtet wurden (150+), lässt sich im Casino-Repo kein einziger dokumentierter Fall finden, in dem ein Skill für eine Casino-spezifische Aufgabe (nicht: Meta-Arbeit an `t_claude_code/` selbst) tatsächlich aufgerufen wurde. Das unterscheidet diese Kategorie deutlich von Kategorie 3 (Custom Agents), wo `migration-security-guard` mehrfach dokumentierte Live-Läufe vorweisen kann (`01_3_custom_agents.md` Abschnitt 2.2).

## Empfohlene Bearbeitungsreihenfolge

| Prio | Unterkategorie                                      | Warum zuerst/danach                                                                                                                     |
| ---- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | #2/#6 Erster echter Casino-Skill bauen              | Voraussetzung für jede weitere Verbesserung dieser Kategorie — ohne ersten Skill bleiben #6, #10 strukturell bei Top 100 %              |
| 2    | #10 Nutzung dokumentieren                           | Sobald ein Skill existiert: jede Anwendung als Beleg (Commit-Referenz, Statuszeile) festhalten, sonst bleibt Nutzung unbelegt wie heute |
| 3    | #7 `skill-health` einmalig für Casino laufen lassen | Kostenlos (Tool existiert bereits), liefert eine erste Baseline für künftige Wartungsentscheidungen                                     |
| 4    | #9 Plugin-Bündelung                                 | Erst sinnvoll, wenn mindestens 2–3 echte Casino-Skills existieren, die sich lohnt zu bündeln                                            |
| 5    | #1, #3, #4, #5, #8                                  | Bereits solide (Top 10–35 %) — kein akuter Handlungsbedarf                                                                              |

## Verwandte Artefakte

| Bedarf                                                                     | Datei                                                                              |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Skill-Reifegrad-Taxonomie und Anatomie                                     | [`skills/13_skill_worldclass_creation.md`](skills/13_skill_worldclass_creation.md) |
| Agent-Pendant (zum Vergleich: dort existieren reale, evaluierte Artefakte) | [`01_3_custom_agents.md`](01_3_custom_agents.md)                                   |
| Ökosystem-Skill-Routing im Session-Memory-Kontext                          | [`01_5_session_memory.md`](01_5_session_memory.md) Abschnitt 3.1                   |
| CLAUDE.md-Zielbild „Skills-Pipeline" (Abschnitt 5, Punkt 3)                | [`01_1_claude_md.md`](01_1_claude_md.md)                                           |
