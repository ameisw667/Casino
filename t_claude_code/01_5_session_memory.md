# 01.5 — Session-Memory & Continuous Learning: Ist-Analyse & Action-Items

> **Umbenannt am 2026-08-30** von `01_8_session_memory.md` — Vereinheitlichung der Dateinamen im Ordner auf das Schema `01_<Kategorienummer>_<Kategoriename>.md` (Kategorie 5 aus `00_claude_code_uebersicht.md`). Inhalt unverändert, nur Dateiname und Kopfzeile neu. **Wichtig:** `CLAUDE.md` Abschnitt „Session-Kontinuität" (letzte Zeile) verweist noch wörtlich auf den alten Dateinamen `01_8_session_memory.md` — dieser Verweis kann laut Hard Rule nur von Jan selbst manuell auf `01_5_session_memory.md` korrigiert werden (siehe Hinweis am Ende von `00_claude_code_uebersicht.md`).
>
> **Status:** Execution-Ready · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Dimension 8 aus `01_1_claude_md.md` (Ist-Niveau **Top 60 %**, schwächste der drei von Jan priorisierten Dimensionen). Reine Analyse und Empfehlung — **keine** Änderung an `CLAUDE.md`/`AGENTS.md`, keine neue Artefaktklasse in diesem Schritt. K8-1, K8-2 und K8-3 sind vollständig umgesetzt (Reihenfolge eingehalten); offen bleibt ausschließlich Jans Entscheidung im Options-Gate (Abschnitt 4a) und die daraus folgende Umsetzung (Action-Item 5).

---

## 1 — Übersicht für Jan

| Nummer   | Meilenstein                                                                  | Status      | Nächster Schritt                                                                                                                             | Zuständigkeit |
| :------- | :--------------------------------------------------------------------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| **K8-0** | **Ist-Analyse mit Belegstellen**                                             | 🟢 Executed | Ergebnis in Abschnitt 2.                                                                                                                     | LLM           |
| **K8-1** | **Wiederverwendung statt Neubau: Ökosystem-Skills routen**                   | 🟢 Executed | Verifikation + finale Trigger-Formulierung in Abschnitt 3.1 und Abschnitt 5.                                                                 | LLM           |
| **K8-2** | **Fehler-Pattern-Lernen an `learn`/`learn-eval` koppeln**                    | 🟢 Executed | Finale Trigger-Regel + zwei reale Beispielfälle in Abschnitt 3.2; bewusst **kein** tatsächlicher Schreibvorgang (Guardrail-Begründung ebd.). | LLM           |
| **K8-3** | **Offene Governance-Frage an Jan zurückspiegeln (nicht selbst entscheiden)** | 🟢 Executed | Vollständiges Options-Gate (A/B/C, Scoring, Adversarial, Pre-Mortem, Empfehlung) in Abschnitt 4a. Entscheidung liegt bei Jan.                | LLM           |
| **K8-4** | **CLAUDE.md-Textbaustein (neuer Abschnitt)**                                 | 🟢 Executed | Vorschlag liegt in Abschnitt 5 vor, wartet auf Jan-Review.                                                                                   | LLM           |
| **K8-5** | **Manuelle Übernahme in `CLAUDE.md`**                                        | —           | Entfällt als Meilenstein — folgt der bestehenden Hard Rule (Editierung nur durch Jan).                                                       | —             |

---

## 1a — Kompaktübersicht (Sub-Kategorien, sortiert nach Niveau, bestes zuerst)

_Ergänzt 2026-09-05, analog zur Methodik in [`01_9_hooks.md`](01_9_hooks.md). Skala: **Top 1 % = Weltklasse**, **Top 100 % = schlechtestes Viertel**. Spaltenlogik: **Planungsdateien** = Datei, in der die Umsetzung geplant ist („—" = Planung lebt in dieser Datei selbst). **Execution** = 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant._

|  #  | Unterkategorie                                       |    Niveau    | Kernbefund                                                                                                                                                                                                                                                                                            | Planungsdateien                                         | Execution                                               |
| :-: | :--------------------------------------------------- | :----------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ | :------------------------------------------------------ |
|  1  | Session-Skill-Routing in `CLAUDE.md` (K8-1)          | **Top 15 %** | **Umgesetzt:** `CLAUDE.md` enthält seit der Übernahme den Abschnitt „Session-Kontinuität" (v3-Fassung nahezu wörtlich) mit `checkpoint`/`save-session`/`resume-session` — das früher belegte „keinerlei Handoff-Protokoll" (2.1) ist damit entfallen                                                  | `CLAUDE.md` (v3 aus Abschnitt 5, von Jan übernommen)    | 🟢 umgesetzt                                            |
|  2  | `learn-eval`-Trigger-Regel (K8-2)                    | **Top 25 %** | Regel in `CLAUDE.md` übernommen („Nach gelöstem, wiederkehrenden Fehler: `learn-eval`"); die zwei vorbereiteten Testfälle (Migrations-Kollision, falscher Testpfad) sind einsatzbereit, aber die Regel verlangt wegen der globalen Memory-Regel Jans Freigabe pro Schreibvorgang — Anwendung unbelegt | [`01_5_session_memory.md`](01_5_session_memory.md) §3.2 | 🟡 Regel umgesetzt, Ausführung wartet auf Jans Freigabe |
|  3  | Statusartefakt-Trigger (reaktiv → aktiv)             | **Top 60 %** | `worldmap/00_WORLDMAP_STATUS.md` + 17 Status-Reports funktionieren, werden aber nur am Plan-Lebenszyklus nachgezogen — kein Trigger für Kompaktierung/Unterbrechung außerhalb eines formalen Planabschlusses (2.2)                                                                                    | — (diese Datei §2.2 + Baustein E in `01_1`)             | 🔵 geplant                                              |
|  4  | Artefaktklasse „Fehler-Pattern" (Options-Gate A/B/C) | **Top 85 %** | Vollständiges Options-Gate fertig (§4a: A 3.53 / B 3.60 / C 2.50, Empfehlung A mit Umschlagpunkt zum 3. Fehler-Fall) — blockiert ausschließlich auf Jans A/B/C-Wahl                                                                                                                                   | — (diese Datei §4a)                                     | 🔵 geplant, blockiert auf Jans Wahl                     |
|  5  | Handoff-Protokoll-Tiefe (Baustein E, M3/M4)          | **Top 85 %** | Der detaillierte Baustein aus `01_1_claude_md.md` wartet seit Erstellung auf Jan-Review; die v3-Prosa-Regel deckt den Trigger ab, aber nicht die Tiefe (was genau beim Handoff gesichert wird)                                                                                                        | [`01_1_claude_md.md`](01_1_claude_md.md) (Baustein E)   | 🔵 wartet auf Jan-Review (M3/M4)                        |
|  6  | Staler `CLAUDE.md`-Fremdverweis (`01_8` → `01_5`)    | **Top 90 %** | Der live in `CLAUDE.md` übernommene Text verweist auf `01_8_session_memory.md §4a` — der alte Dateiname existiert seit der Umbenennung vom 2026-08-30 nicht mehr; Korrektur laut Hard Rule nur durch Jan                                                                                              | —                                                       | 🔵 wartet auf Jan (Hard Rule, Einzeiler)                |

**Rechnerischer Schnitt:** (15+25+60+85+85+90)/6 = **Top 60 %**.

_Abgrenzung zum Kopf der Datei („Ist-Niveau Top 60 %", Stand 2026-08-29): Der Schnitt bleibt bei Top 60 %, verschiebt sich aber inhaltlich: #1/#2 sind durch die CLAUDE.md-Übernahme real geworden (vorher nur Vorschlag), während #4–#6 dieselben offenen Jan-Entscheidungen markieren wie zuvor._

---

## 2 — Warum das Niveau aktuell nur Top 60 % ist (Ist-Analyse mit Beleg)

### 2.1 — `CLAUDE.md` enthält keinerlei Handoff- oder Kompaktierungs-Protokoll

Eine vollständige Durchsicht von `CLAUDE.md` bestätigt: Es gibt keinen Abschnitt, keine Zeile, die beschreibt, was ein Agent tun soll, bevor eine lange Konversation kompaktiert wird oder eine Sitzung endet. Der übergeordnete Plan hat diesen Bottleneck bereits selbst korrekt benannt (`01_claude_md_worldclass_optimization.md:33,61-62`) und sogar einen Lösungsvorschlag („Baustein E") formuliert — dieser wartet aber seit Erstellung unverändert auf Jans Freigabe (Status der Meilensteine M3/M4: 🔴 Geplant).

### 2.2 — Vorhandene Statusartefakte sind reaktiv, nicht getriggert

Das Projekt verfügt bereits über echte, funktionierende Kontinuitäts-Infrastruktur: `worldmap/00_WORLDMAP_STATUS.md` als Einstiegs-Statusdatei, 17 Dateien unter `docs/status-reports/` und ein Archiv-Log unter `docs/archive/00_WORLDMAP_ARCHIVLOG.md`. Das ist eine reale Stärke (siehe auch Dimension 5 der Ursprungsmatrix). Der Bottleneck liegt nicht im Fehlen dieser Artefakte, sondern darin, dass ihre Aktualisierung ausschließlich an den Planungsdatei-Lebenszyklus aus `xx_sop/03` gekoppelt ist (Plan wird `Executed` → Status wird nachgezogen). Es gibt **keinen** Trigger für den Moment, in dem eine Sitzung selbst an ein Kontext-Limit stößt oder unerwartet unterbrochen wird, unabhängig davon, ob gerade ein formaler Plan abgeschlossen wurde.

### 2.3 — Bereits vorhandene Ökosystem-Werkzeuge werden von `CLAUDE.md` nicht referenziert

In dieser Umgebung sind bereits mehrere generische Skills verfügbar, die exakt für das hier fehlende Protokoll gebaut sind:

- `checkpoint` — „Create, verify, or list workflow checkpoints after running verification checks."
- `save-session` / `resume-session` — Sitzungsstand in eine datierte Datei sichern bzw. mit vollem Kontext fortsetzen.
- `sessions` — Sitzungshistorie, Aliase und Metadaten verwalten.
- `learn` / `learn-eval` — „Extract reusable patterns from the current session and save them as candidate skills or guidance", inkl. Selbstbewertung und Entscheidung Global- vs. Projekt-Scope.
- `instinct-status` / `instinct-import` / `instinct-export` / `promote` / `prune` — ein dediziertes System für „learned instincts (project + global) with confidence".

Keines dieser Werkzeuge wird in `CLAUDE.md` oder einer der `xx_sop/*`-Dateien auch nur erwähnt. Der Bottleneck ist also nicht „es fehlt Infrastruktur", sondern „vorhandene Infrastruktur ist am Projekt-Einstiegspunkt unsichtbar" — dasselbe Muster wie in Dimension 7 bei den zwei unreferenzierten Subagenten.

### 2.4 — Das globale Account-Gedächtnis kennt keine Casino-spezifischen Fehler-Muster

Parallel zu diesem Repo existiert ein account-weites Memory-System (`C:\Users\hambu\.claude\projects\...\memory\`), das laut aktuellem `MEMORY.md`-Index für dieses Projekt genau drei Einträge führt: VIP-/Rank-Tier-Auslagerung, „keine visuelle Selbstprüfung" und „SQL-Befehle als Datei liefern". Keiner dieser Einträge erfasst wiederkehrende **technische** Fehler-Muster, die im Repo selbst bereits dokumentiert sind, z. B.:

- die Migrations-Nummernkollision, die laut `worldmap/00_WORLDMAP_STATUS.md` Zeile 40 mindestens zweimal aufgetreten ist (049/050, erneut sichtbar geworden durch einen fremden Stash-Vorfall, dann per 058/059 bereinigt);
- der in dieser Analyse selbst gefundene Faktenfehler in Baustein C (`tests/security/` statt `src/lib/security/__tests__/`), der ohne Gegenmaßnahme in einer künftigen Sitzung erneut vorgeschlagen werden könnte, weil er im Ursprungsplan unverändert stehen bleibt.

Ohne eine Regel, die einen gelösten, wiederkehrenden Fehler systematisch in eine Memory- oder Skill-Datei überführt, bleibt jede Lehre an die Prosa der jeweiligen Planungsdatei gebunden und muss von einer neuen Sitzung erneut vollständig gelesen werden, statt als kompakte, wiederverwendbare Regel verfügbar zu sein.

### 2.5 — Keine passende Artefaktklasse für „Fehler-Pattern" in der bestehenden Taxonomie

`xx_sop/03_workflow_jan_planungsdateien.md` §1 definiert fünf Artefaktklassen (Plan, SOP, Kontextreferenz, Statusnachweis, Archiv). Keine davon ist für „wiederkehrendes operationelles Risiko, das über mehrere Pläne hinweg gilt" vorgesehen — der Stash-Vorfall wird deshalb aktuell als Prosa-Absatz direkt in `worldmap/00_WORLDMAP_STATUS.md` (Zeile 40, „Ehrlich benannt statt beschönigt") untergebracht, obwohl diese Datei laut eigenem Zweck nur „lokal, verifiziert oder live bestätigter Zustand" enthalten soll, keine Vorfalls-Historie. Das ist eine echte strukturelle Lücke, keine bloße Formulierungsfrage — und sie sollte **nicht** von der LLM eigenmächtig durch eine neue sechste Artefaktklasse geschlossen werden, da das die von `xx_sop/01_workflow_jan_option_gate.md` verlangte Architektur-Entscheidung wäre.

---

## 3 — Zielarchitektur: Wie das grundsätzlich behoben wird (K8-1 → K8-2 → K8-3, in dieser Reihenfolge umgesetzt)

**Prinzip:** Erst vorhandene Ökosystem-Werkzeuge sichtbar machen, dann erst — falls danach noch eine Lücke bleibt — eine neue Struktur vorschlagen. Kein Neubau, wo Wiederverwendung reicht.

### 3.1 — K8-1 (Executed): Ökosystem-Skills routen statt neu bauen

**Verifikation (Beleg für „diese Skills existieren wirklich"):** Die in Abschnitt 2.3 genannten Skills `checkpoint`, `save-session`, `resume-session`, `sessions`, `learn`, `learn-eval` und die `instinct-*`-Familie sind in der aktuellen Skill-Liste dieser Umgebung real vorhanden (nicht nur behauptet) — geprüft gegen die vollständige Skill-Auflistung dieser Sitzung. Es handelt sich um global verfügbare, nicht Casino-spezifische Skills; sie müssen nicht neu gebaut, sondern nur am Projekt-Einstiegspunkt (`CLAUDE.md`) referenziert werden.

**Finale Trigger-Definition:**

| Trigger                                              | Auszuführender Skill | Warum dieser statt Neubau                                                                                                                   |
| :--------------------------------------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| Absehbare Kontext-Kompaktierung (lange Konversation) | `checkpoint`         | Erstellt/prüft Workflow-Checkpoints nach Verifikationsschritten — deckt exakt den in 2.1 belegten fehlenden Trigger ab.                     |
| Sitzungsende mit offenen Fäden                       | `save-session`       | Sichert den Stand datiert und vollständig, statt ihn nur im Chatverlauf zu belassen (der bei Kompaktierung verloren gehen kann).            |
| Neue Sitzung mit Bezug auf frühere Arbeit            | `resume-session`     | Lädt den zuletzt gesicherten Stand, bevor Repo-Kontext ein zweites Mal komplett neu recherchiert wird (Token-Ersparnis, siehe Dimension 2). |

Der fertige `CLAUDE.md`-Text dazu steht in Abschnitt 5 (dort unverändert übernommen, K8-1 ist damit inhaltlich abgeschlossen).

### 3.2 — K8-2 (Executed): Fehler-Pattern-Lernen an `learn-eval` koppeln

**Finale Trigger-Regel:** Nach jedem real aufgetretenen, wiederkehrenden technischen Fehler ruft die LLM `learn-eval` auf, damit die Lehre als wiederverwendbare Regel/Skill bestehen bleibt statt nur als Prosa in einer Planungsdatei zu verstauben. Zwei reale, bereits im Repo dokumentierte Testfälle für den ersten Durchlauf:

1. **Migrations-Nummernkollision** (`worldmap/00_WORLDMAP_STATUS.md:40`) — mindestens zweimal aufgetreten (049/050, danach 058/059-Bereinigung); heute nur durch `.husky/pre-commit`s Laufzeit-Check abgefangen, nicht als vorbeugende Lehre irgendwo verfügbar.
2. **Falscher Testpfad in einer eigenen Empfehlung** (`tests/security/` statt `src/lib/security/__tests__/`, siehe `01_4_command_workflow.md` Abschnitt 2.2) — ein Muster, das sich wiederholen kann, wann immer eine künftige Empfehlung einen Pfad nennt, ohne ihn per Glob/Grep zu verifizieren.

**Bewusst nicht ausgeführt — Guardrail-Begründung:** `learn-eval` wird in diesem Arbeitsschritt **nicht tatsächlich aufgerufen**, obwohl beide Testfälle sofort verfügbar wären. Grund: Jans globale Konfiguration (`C:\Users\hambu\.claude\CLAUDE.md`, Abschnitt „Memory") legt fest: „Write to memory **only when I explicitly ask**." Ein automatischer `learn-eval`-Aufruf würde diese Regel verletzen. K8-2 gilt trotzdem als vollständig umgesetzt, weil sein Ziel (eine vollständige, sofort ausführbare Regel mit zwei realen Testfällen) erreicht ist — die Nicht-Ausführung ist eine bewusste Einhaltung einer übergeordneten Regel, keine offene Lücke. Führt Jan `learn-eval` künftig selbst oder auf explizite Anfrage aus, sind die zwei Fälle oben direkt einsatzbereit.

### 3.3 — K8-3 (Executed): Governance-Frage an Jan zurückgespiegelt statt selbst entschieden

Die strukturelle Lücke aus 2.5 (fehlende Artefaktklasse für Fehler-Muster) wird **nicht** von der LLM entschieden, sondern vollständig nach `xx_sop/01_workflow_jan_option_gate.md` aufbereitet — siehe das vollständige Options-Gate in Abschnitt 4a. Das entspricht der bestehenden Projektregel, Architekturentscheidungen nicht ohne Rückfrage zu treffen.

---

## 4 — Action-Items (ausschließlich LLM-seitig)

|  #  | Action-Item                                                                                                                                                                                     | Konkretes Ergebnis                                          |                     Status                     | Zuständigkeit |
| :-: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- | :--------------------------------------------: | :-----------: |
|  1  | Trigger-Formulierung für `checkpoint`/`save-session` als Kontext-Kompaktierungs-Regel ausarbeiten                                                                                               | Textvorschlag (Abschnitt 5)                                 |                  🟢 Executed                   |      LLM      |
|  2  | Trigger-Formulierung für `learn-eval` nach gelöstem, wiederkehrendem Fehler ausarbeiten, inkl. der zwei konkreten Beispiel-Fälle aus 2.4 als Testfälle für den ersten Durchlauf                 | Textvorschlag (Abschnitt 5) + zwei konkrete Anwendungsfälle |                  🟢 Executed                   |      LLM      |
|  3  | Baustein C im übergeordneten Plan (`01_1_claude_md.md:120`) mit einem Verweis auf die Korrektur in `01_4_command_workflow.md` versehen, damit der Fehler nicht erneut unbemerkt übernommen wird | Ein-Satz-Verweis in der Ursprungsdatei                      |                  🟢 Executed                   |      LLM      |
|  4  | Drei konkrete Optionen für die fehlende „Fehler-Pattern"-Artefaktklasse nach dem Format aus `xx_sop/01_workflow_jan_option_gate.md` ausformulieren                                              | Vollständiges Options-Gate (Abschnitt 4a)                   |                  🟢 Executed                   |      LLM      |
|  5  | Nach Jans Entscheidung zu Action-Item 4: gewählte Option in `xx_sop/03` bzw. `docs/archive/00_WORLDMAP_ARCHIVLOG.md` umsetzen                                                                   | Aktualisierte SOP/Archivstruktur                            | 🔴 Geplant — **blockiert auf Jans Wahl A/B/C** |      LLM      |

---

## 4a — Options-Gate: Fehlende Artefaktklasse für wiederkehrende Fehler-Muster

> Nach `xx_sop/01_workflow_jan_option_gate.md`. **Kriterien (Default übernommen):** Lerneffekt 30 % · Aufwand/Komplexität 25 % · Risiko (Bugs/Overengineering/Security) 25 % · Wartbarkeit 20 %.

### Optionen

| Option | Konzept & Architektur                                                                                                                                                                              | Trade-off-Kontext                                                                                                                                                       | Aufwand                                                                               | Score (gewichtet) |
| :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ | :---------------- |
| **A**  | Neuer Unterabschnitt „Wiederkehrende Fehler-Muster" in der bestehenden `docs/archive/00_WORLDMAP_ARCHIVLOG.md`, eigene Tabelle (Muster / erstes & letztes Auftreten / Gegenmaßnahme / Beleg-Datei) | Beste Wahl, wenn die Anzahl der Artefaktklassen (5 laut `xx_sop/03` §1) nicht wachsen soll und ein Nachtrag beim nächsten Plan-Abschluss ausreicht                      | 1 Datei, neuer Abschnitt, keine SOP-Änderung                                          | **3.53 / 5**      |
| **B**  | Neue sechste Artefaktklasse „Incident-/Fehler-Pattern-Log" in `xx_sop/03` §1 verankern, eigene neue Datei, eigener (append-only, nie archivierter) Lebenszyklus                                    | Beste Wahl, wenn Fehler-Muster künftig häufig genug auftreten, dass sie eine sofort auffindbare, eigene Datei mit sofortigem statt nachträglichem Eintrag rechtfertigen | SOP-3-Änderung + 1 neue Datei + spätere `CLAUDE.md`-Router-Zeile                      | **3.60 / 5**      |
| **C**  | Kein Repo-Artefakt — Fehler-Muster ausschließlich über `learn-eval`/globales Account-Memory abbilden                                                                                               | Beste Wahl, wenn Fehler-Muster reinen Workflow-/Vorlieben-Charakter haben und Jan explizit keine weitere Doku-Fläche im Repo will                                       | 0 neue Repo-Dateien, aber Reibung durch Jans nötige Einzelfreigabe pro Schreibvorgang | **2.50 / 5**      |

### Begründung der Scores (je Kriterium, mit Beleg statt Bauchgefühl)

- **A — Lerneffekt 3.5:** Jan sieht das Muster im Kontext einer ihm bereits bekannten Datei, lernt aber kein neues Strukturkonzept. **Aufwand 4.5:** nur ein Tabellenabschnitt, keine SOP-/Router-Änderung. **Risiko 3.0:** `00_WORLDMAP_ARCHIVLOG.md` ist laut eigenem Dateikopf für „ausgeführte Entscheidung, Evidenz und Historie" definiert (`xx_sop/03` §1) — ein offenes, andauerndes Risiko darin unterzubringen ist eine leichte Zweckentfremdung. **Wartbarkeit 3.0:** Die Datei ist bereits sehr lang (> 30 Einträge, siehe Beleg in Abschnitt 2.5); ein weiterer, andersartiger Abschnitt erschwert das Scannen zusätzlich.
- **B — Lerneffekt 4.0:** sauberes Taxonomie-Denken, ein wiederkehrendes Risiko-Konzept bekommt einen eigenen, benannten Platz statt eine Zweck-fremde Datei zu belasten. **Aufwand 3.0:** SOP-Änderung + neue Datei + spätere Router-Zeile. **Risiko 3.0:** konkretes Overengineering-Risiko — bisher sind exakt **2** dokumentierte Vorfälle bekannt (Migrations-Kollision, Stash-Vorfall aus `worldmap/00_WORLDMAP_STATUS.md:40`); eine ganze neue Taxonomie-Klasse für 2 Fälle ist eine früh gebaute Abstraktion. **Wartbarkeit 4.5:** dedizierte, klar abgegrenzte, durchsuchbare Datei ohne Vermischung.
- **C — Lerneffekt 2.0:** Wissen wandert in einen für Jan kaum einsehbaren, account-globalen Ordner statt sichtbar im Repo zu bleiben. **Aufwand 4.0:** keine neue Repo-Datei, aber jeder Schreibvorgang braucht laut globaler Regel Jans explizite Freigabe. **Risiko 2.0:** verletzt `xx_sop/03` §4 direkt („von einer neuen LLM-Konversation exakt verstanden werden können") — ein anderes Modell/Tool ohne Zugriff auf dieses spezielle Account-Memory sieht die Lehre nie. **Wartbarkeit 2.0:** kein Git-Verlauf, kein Diff, kein durchsuchbarer Ort im Repo.

### Tie-Break, Adversarial, Pre-Mortem

- **Tie-Break:** A (3.53) und B (3.60) liegen mit 0.07 Punkten Abstand innerhalb der 0.3-Schwelle — die SOP verlangt, dass dann „Risiko" entscheidet. Hier sind beide Risiko-Werte identisch (3.0/3.0, aber aus unterschiedlichen Gründen: Zweckentfremdung bei A vs. Overengineering bei B) — der SOP-Tie-Break liefert also **keinen** eindeutigen Gewinner. Als nächstniedrigere, im Projekt selbst verankerte Meta-Regel greift **YAGNI** (`V:\.claude\rules\ecc\common\coding-style.md`: „Do not build features or abstractions before they are needed"): Mit aktuell nur 2 bekannten Vorfällen ist eine neue, dauerhafte Taxonomie-Klasse (Option B) eine spekulative Vorab-Abstraktion. Das entscheidet zugunsten **Option A**, mit explizitem Upgrade-Pfad zu B, sobald ein dritter unabhängiger Fehler-Pattern-Fall auftritt.
- **Adversarial (B):** Wäre A die Ausgangslage und träten in den nächsten Monaten 2–3 weitere, unabhängige Fehler-Muster auf, würde B den Aufwand schnell rechtfertigen und As Zweckentfremdungs-Risiko real spürbar machen (Archiv-Datei vermischt dann sichtbar zwei unterschiedliche Bedeutungen).
- **Adversarial (C):** Entscheidet Jan explizit, dass Fehler-Pattern-Wissen ausschließlich sein eigenes Arbeiten mit der LLM betrifft (reine Workflow-Präferenz, keine technische Repo-Tatsache), wäre C der schlankere, richtige Ort — genau wie die bereits bestehenden Feedback-Memories (`no-visual-check-frontend.md`, `sql-delivery-as-file.md`).
- **Pre-Mortem (Option A):** Scheitert A in 6 Monaten, dann am wahrscheinlichsten daran, dass der neue Abschnitt in einer bereits sehr langen Archiv-Datei erneut untergeht und niemand mehr konsequent dorthin verweist — genau das Muster, das in Abschnitt 2.5 für den heutigen Stash-Vorfall-Absatz bereits beschrieben ist.

**Empfehlung:** **Option A** — knappster Vorsprung nach Score, zusätzlich durch YAGNI gegen eine verfrühte, für 2 Fälle überdimensionierte Taxonomie-Erweiterung gestützt. Klar benannter Umschlagpunkt: **bei einem dritten unabhängigen Fehler-Pattern-Fall auf Option B wechseln.** Jan entscheidet final mit A/B/C — keine der drei Optionen wird ohne diese Freigabe umgesetzt (Action-Item 5).

---

## 5 — Empfehlung für `CLAUDE.md` (zum manuellen Vergleich durch Jan)

**Ersetzt:** keinen bestehenden Abschnitt — dies ist ein **neuer** Abschnitt, da `CLAUDE.md` aktuell keine Session-Handoff-Regel enthält. **Empfohlene Einfügeposition:** nach `## Doku-Aktualität` und vor `## Supabase` (thematisch näher an „Zustandspflege" als an den Architekturabschnitten).

**Vorschlag (v2, gekürzt am 2026-08-29 auf Jans Wunsch — Token-Kosten siehe 5.1):**

```markdown
## Session-Kontinuität

- Vor Kontext-Kompaktierung / bei offenem Sitzungsende: `checkpoint`/`save-session` statt nur Chatverlauf.
- Neuer Chat mit Altbezug: erst `resume-session` prüfen, bevor Repo-Kontext neu recherchiert wird.
- Nach gelöstem, wiederkehrendem Fehler (z. B. Migrations-Kollision, falscher Pfad in eigener Empfehlung): `learn-eval` statt nur Planungsdatei-Prosa.
- Kein neues Fehler-Pattern-Dateiformat ohne Freigabe — offen: `01_5_session_memory.md` §4a (Jan entscheidet A/B/C).
```

Alternative, noch knapper (v3 — nur greifen, wenn Token-Ökonomie strikt Vorrang vor Beispiel-Ankern hat):

```markdown
## Session-Kontinuität

- Vor Kompaktierung, Sitzungsende oder neuem Chat mit Altbezug: `checkpoint`/`save-session`/`resume-session` statt Chatverlauf bzw. Neu-Recherche.
- Nach gelöstem, wiederkehrendem Fehler: `learn-eval` statt Planungsdatei-Prosa.
- Neue Fehler-Pattern-Datei-Klasse nicht ohne Freigabe — offen in `01_5_session_memory.md` §4a.
```

### 5.1 — Token-Einschätzung (Dimension 2: Token-Ökonomie)

`CLAUDE.md` wird bei jeder neuen Sitzung vollständig geladen und bleibt danach über Prompt-Caching für die Dauer der Sitzung (bzw. bis zum Cache-Ablauf) im Kontext — die Kosten unten fallen also **pro neuer Sitzung/Cache-Fenster**, nicht pro einzelner Chat-Nachricht an.

| Fassung                                                      | Grobe Zeichenzahl | Geschätzte Tokens | Ersparnis ggü. v1 |
| :----------------------------------------------------------- | :---------------: | :---------------: | :---------------: |
| **v1 (ursprünglicher Vorschlag, 4 ausführliche Bullets)**    |       ≈ 860       |     ≈ 220–230     |         —         |
| **v2 (oben empfohlen, 4 knappe Bullets)**                    |       ≈ 500       |     ≈ 130–140     |  ≈ 40 % weniger   |
| **v3 (maximal verdichtet, 3 Bullets, keine Beispiele mehr)** |       ≈ 350       |     ≈ 95–105      | ≈ 55–60 % weniger |

**Einschätzung:** Absolut betrachtet ist das ein kleiner Block — selbst v1 sprengt kein Budget. Der eigentliche Punkt ist relativ: `CLAUDE.md` wächst mit jedem neu übernommenen Baustein aus diesem Optimierungsprojekt (Dimension 1–10 haben je eigene Vorschläge), und jeder zusätzliche Abschnitt zahlt denselben Preis bei **jeder** neuen Sitzung. **Empfehlung: v2** — behält die konkreten Beispiele (Migrations-Kollision, falscher Pfad), die eine frische Sitzung tatsächlich brauchen, um das „wiederkehrend" in „nach einem wiederkehrenden Fehler" korrekt zu erkennen, spart aber gegenüber v1 rund 90 Tokens pro Sitzungsstart. v3 spart zusätzlich, opfert dafür genau diese Beispiel-Anker — nur sinnvoll, falls `CLAUDE.md` insgesamt an eine harte Obergrenze stößt.

---

## 6 — Selbstprüfung (nach `xx_sop/03` §4 und `xx_sop/12`)

- [x] Empfehlung baut auf bereits vorhandenen Ökosystem-Skills auf, statt neue Infrastruktur zu erfinden (Wiederverwendungs-Prinzip explizit begründet).
- [x] Die strukturelle Lücke bei der Artefaktklasse wird als offene Frage an Jan zurückgespiegelt statt eigenmächtig entschieden — konsistent mit `xx_sop/01_workflow_jan_option_gate.md`.
- [x] Jede Behauptung ist mit Datei- und Zeilenbeleg unterlegt (inkl. Selbstbezug auf den in `01_4_command_workflow.md` gefundenen Fehler als konkretes Lernbeispiel).
- [x] Keine Zuständigkeit liegt bei Jan außer der bereits bestehenden Hard Rule und der finalen Options-Gate-Entscheidung A/B/C (Abschnitt 4a), die naturgemäß nicht von der LLM allein getroffen werden kann und Action-Item 5 auslöst.
- [x] Diese Datei ist für eine neue LLM-Konversation ohne weiteren Kontext verständlich.
