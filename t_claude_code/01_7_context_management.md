# 01.7 — Context-Management & Token-Ökonomie: Sub-Kategorie-Aufschlüsselung

> Stand: **2026-08-30** — Erstaufschlüsselung von Kategorie **7 „Context-Management & Token-Ökonomie"** aus `00_claude_code_uebersicht.md` in 10 einzeln bewertete Unterkategorien. Skala: **Top 1 % = Weltklasse**, **Top 100 % = schlechtestes Viertel**.
> Querschnitts-Charakter: Diese Kategorie betrifft alle neun anderen gleichzeitig (jede geladene Datei, jeder aktive MCP-Server, jeder verfügbare Skill kostet Kontext-Budget) — siehe Verweise unten statt Doppelmessung.
> Wichtige Einschränkung: Der interaktive `/context`-Befehl selbst ist in dieser Sitzung **nicht** als Werkzeug aufrufbar (kein programmatischer Zugriff). Alle Aussagen unten stützen sich auf indirekt beobachtbare Evidenz (System-Reminder-Zähler, Konfigurationsdateien, sichtbares Tool-/Skill-Ladeverhalten), nicht auf einen reproduzierten Live-`/context`-Export.

## Kernaussage für Jan

Die **Architektur** für Token-Ökonomie ist stark (On-Demand-SOP-Router, deferred Tool-Loading, Auto-Kompaktierung) — das erklärt, warum Dimension 2 in `01_1_claude_md.md` bereits mit Top 10 % bewertet wurde. Die **Sichtbarkeit** für Jan ist dagegen schwach: Es gibt kein dokumentiertes Budget, keine Schwellenwerte, und die MCP-Server-Anzahl auf Account-Ebene widerspricht der im eigenen Zielbild (`01_1_claude_md.md` Baustein E) formulierten Grenze „< 10 aktive MCP-Server".

**Rechnerischer Schnitt über alle 10 Positionen: ≈ Top 48 %.**

## Kompaktübersicht (sortiert nach Niveau, bestes zuerst)

_Spaltenlogik (ergänzt 2026-09-05, einheitlich für `01_1`–`01_10`):_ **Planungsdateien** = Datei, in der die Umsetzung geplant ist („—" = Planung lebt in dieser Datei selbst). **Execution** = 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant.

| #   | Unterkategorie                                         | Niveau        | Kernbefund                                                                                                                                                                                                                                                                                                                                                            | Planungsdateien                                                                                            | Execution                                                  |
| --- | ------------------------------------------------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 6   | CLAUDE.md-Prosa-Dichte                                 | **Top 10 %**  | Bereits in `01_1_claude_md.md` Dimension 1/2 gemessen (Top 15 % bzw. Top 10 %) — hier nur referenziert, nicht neu gemessen, um Doppelpflege zu vermeiden                                                                                                                                                                                                              | [`01_1_claude_md.md`](01_1_claude_md.md)                                                                   | 🟢 umgesetzt (Architektur gelebt)                          |
| 7   | On-Demand-Router-/SOP-Auslagerung                      | **Top 10 %**  | 19 `xx_sop/*.md`-Dateien plus `xx_docs/*.md` werden nur bei Bedarf gelesen statt bei jeder Sitzung vollständig geladen — verifiziertes, real genutztes Muster                                                                                                                                                                                                         | [`01_1_claude_md.md`](01_1_claude_md.md)                                                                   | 🟢 umgesetzt                                               |
| 2   | Deferred-Tool-Loading (`ToolSearch`)                   | **Top 15 %**  | In dieser Sitzung mehrfach live beobachtet: Dutzende MCP-Tools werden zunächst nur als Name gelistet und erst bei Bedarf per `ToolSearch` vollständig geladen — spart Baseline-Tokens messbar                                                                                                                                                                         | —                                                                                                          | 🟢 umgesetzt (Plattform-Mechanismus)                       |
| 3   | Projekt-Ebene MCP-Tool-Budget (`.mcp.json`)            | **Top 15 %**  | Genau 2 Server (`playwright`, `context7`), beide bewusst scoped — siehe `01_8_mcp_server.md` für Details, hier nur der Token-Ökonomie-Aspekt gezählt                                                                                                                                                                                                                  | [`01_8_mcp_server.md`](01_8_mcp_server.md)                                                                 | 🟢 umgesetzt                                               |
| 5   | Auto-Kompaktierung bei Kontextlimit                    | **Top 20 %**  | Laut System-Konfiguration vorhanden („The system will automatically compress prior messages … as it approaches context limits") — funktioniert als Sicherheitsnetz, ist aber ein reaktiver, kein präventiver Mechanismus                                                                                                                                              | —                                                                                                          | 🟢 umgesetzt (Plattform-Mechanismus)                       |
| 1   | Sichtbarkeit des Token-Budgets für Jan                 | **Top 55 %**  | Kein `/context`-Export ist in dieser Sitzung reproduzierbar; einzige sichtbare Zahl ist ein interner Session-Token-Zähler (`~15.000.000` Start-Budget laut `tengu_lapis_anchor_budget` in der globalen Config), der Jan nicht routinemäßig angezeigt wird                                                                                                             | —                                                                                                          | 🔵 geplant (Prio 1: `/context`-Messung — reine Jan-Aktion) |
| 9   | Dokumentiertes Kontext-Budget-Protokoll in `CLAUDE.md` | **Top 85 %**  | „Baustein E" (`01_1_claude_md.md` Abschnitt 4) formuliert genau ein solches Protokoll bereits fertig aus, wartet aber seit 2026-08-29 unverändert auf Jans Freigabe (Status M3/M4: 🔴 Geplant)                                                                                                                                                                        | [`01_1_claude_md.md`](01_1_claude_md.md) (Baustein E)                                                      | 🔵 wartet auf Jan-Review (M3/M4)                           |
| 4   | Account-Ebene MCP-Sprawl                               | **Top 85 %**  | Diese Sitzung hat Zugriff auf ≈ 15–16 zusätzliche MCP-Server-Namespaces jenseits der 2 Projekt-Server (Notion, Mail, Drive, Figma, Sentry, GitHub ×3, u. a.) — verletzt die im eigenen Zielbild formulierte „< 10 aktive MCP-Server"-Grenze deutlich, siehe `01_8_mcp_server.md`                                                                                      | [`01_8_mcp_server.md`](01_8_mcp_server.md)                                                                 | 🔵 geplant (Jan-Entscheidung Account-Ebene)                |
| 8   | Skill-Beschreibungs-Overhead                           | **Top 90 %**  | Über 150 Skills tragen je ein `description`-Feld, das im System-Prompt-Listing mitgeladen wird — nie gemessen, wie viele Tokens das kumulativ kostet, obwohl `01_2_skills.md` zeigt, dass nur ein Bruchteil dieser Skills für Casino je genutzt wurde                                                                                                                 | [`skills/14_top_level_skills_load_audit.md`](skills/14_top_level_skills_load_audit.md) (🟡 wartet auf Jan) | ⚪ nicht geplant (nice-to-have)                            |
| 10  | Memory-Files-Kontextanteil                             | **Top 100 %** | Die einzige bisher berichtete Zahl (1,8 % des Kontextfensters für „Memory files" laut `/context`-Chat vom 2026-08-29) beruhte auf derselben unverifizierten Zählung, die in `01_6_memory_files.md` korrigiert wurde („18 Dateien" → tatsächlich 4) — die Prozentzahl selbst ist damit nicht mehr vertrauenswürdig und aktuell **nicht neu messbar** in dieser Sitzung | [`01_6_memory_files.md`](01_6_memory_files.md)                                                             | 🔵 geplant (Prio 1, gemeinsam mit #1)                      |

**Rechnerischer Schnitt:** (10+10+15+15+20+55+85+85+90+100)/10 = **Top 48,5 %** (gerundet Top 48 %).

## Detailanmerkungen

### 1 — Sichtbarkeit des Token-Budgets für Jan (Top 55 %)

Diese Sitzung liefert fortlaufend einen internen Zähler „X Tokens verbleibend" in System-Reminder-Blöcken (aktuell im niedrigen einstelligen Millionenbereich, ausgehend von einem Start-Budget, das mit dem in der globalen Konfiguration hinterlegten Wert `tengu_lapis_anchor_budget: 15000000` übereinstimmt). Dieser Zähler ist jedoch ein LLM-internes Signal, kein für Jan sichtbares Dashboard — der interaktive `/context`-Befehl (der laut `00_claude_code_uebersicht.md` Abschnitt 5 vorher genutzt wurde) ist der einzige dokumentierte Weg, mit dem Jan selbst diese Zahl sieht, und dieser Weg ist nicht automatisiert oder regelmäßig geplant.

### 2 — Deferred-Tool-Loading (Top 15 %)

Direkt in dieser Sitzung beobachtbar: Dutzende MCP-Tools (u. a. alle `mcp__0b5b1fe4…__*`-, `mcp__4ac0526f…__*`- und `mcp__github-*`-Tools) erscheinen zunächst nur als Name in einer „deferred tools"-Liste; ihr vollständiges Schema wird erst bei einem `ToolSearch`-Aufruf geladen. Das ist ein aktives, funktionierendes Token-Sparmodell, keine theoretische Möglichkeit.

### 3 — Projekt-Ebene MCP-Tool-Budget (Top 15 %)

`.mcp.json` im Projekt-Root definiert exakt zwei Server. Für die Token-Ökonomie-Perspektive zählt hier nur: Dieses schmale Set hält die _projektspezifische_ Baseline klein — die Account-Ebene (Position 4) ist ein separates, deutlich größeres Problem.

### 4 — Account-Ebene MCP-Sprawl (Top 85 %)

Ausführliche Analyse in `01_8_mcp_server.md`; hier nur der Token-Ökonomie-Blickwinkel: Jeder zusätzliche verbundene MCP-Server trägt mindestens seine Tool-Namen (teils vollständige Schemas) zum Baseline-Kontext bei. Mit ≈ 15–16 zusätzlichen Servern jenseits der 2 Projekt-Server ist die in `01_1_claude_md.md` Baustein E vorgeschlagene Grenze „< 10 aktive MCP-Server" bereits um mehr als das Doppelte überschritten — allerdings großteils durch Account-weite Connector-Freigaben, nicht durch Projekt-Entscheidungen.

### 5 — Auto-Kompaktierung (Top 20 %)

Der System-Prompt dieser Sitzung dokumentiert ausdrücklich: „The system will automatically compress prior messages in your conversation as it approaches context limits." Das ist ein reales Sicherheitsnetz gegen Kontextverlust bei langen Sitzungen — es ersetzt aber kein proaktives Budget-Management (Position 9), sondern greift erst reaktiv am Limit.

### 6/7 — Verweise statt Doppelmessung

Beide Punkte sind bereits an anderer Stelle mit Beleg gemessen (`01_1_claude_md.md` Dimensionen 1, 2 und 5) und werden hier nur mit dem dortigen Wert übernommen, um der Projektregel „keine Referenz doppelt pflegen" (`xx_sop/03` §2, vom Master-Dokument `00_claude_code_uebersicht.md` Abschnitt 6 explizit für diesen Ordner übernommen) zu folgen.

### 8 — Skill-Beschreibungs-Overhead (Top 90 %)

Reine Schätzung ohne Messung: Bei über 150 verfügbaren Skills mit je einem mehrzeiligen `description`-Feld (einige davon, wie `claude-api`, tragen sehr lange Trigger-Beschreibungen) ist ein spürbarer kumulativer Kontext-Anteil plausibel, aber **nie gemessen worden** — diese Unmessbarkeit selbst ist der Befund, nicht eine konkrete Zahl.

### 9 — Dokumentiertes Kontext-Budget-Protokoll in `CLAUDE.md` (Top 85 %)

„Baustein E: Session-State, Context-Budget & Model-Routing" liegt in `01_1_claude_md.md` Abschnitt 4 vollständig ausformuliert vor (inkl. MCP-Tool-Budget-Grenze, Anti-Halluzinations-Gate, Handoff-Disziplin), wurde aber nie in `CLAUDE.md` übernommen. Der Bottleneck ist damit identisch mit dem in mehreren anderen Kategorien beobachteten Muster: Der Entwurf existiert, die Freigabe fehlt.

### 10 — Memory-Files-Kontextanteil (Top 100 %)

Bewusst auf den niedrigsten Wert gesetzt, nicht weil das Memory-System schlecht ist (siehe `01_6_memory_files.md`, dort deutlich besser bewertet), sondern weil die einzige _für diese Kategorie_ relevante Zahl (Kontextanteil in Prozent) auf einer bereits widerlegten Dateizählung beruhte und aktuell durch kein Werkzeug in dieser Sitzung neu erhoben werden kann.

## Empfohlene Bearbeitungsreihenfolge

| Prio | Unterkategorie                                                          | Warum zuerst/danach                                                                                                                                |
| ---- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | #10 Frische `/context`-Messung nachholen                                | Voraussetzung, um #1 und #10 überhaupt mit echten Zahlen statt Schätzungen zu bewerten — reine Jan-Aktion (interaktiver Befehl), kein Code-Aufwand |
| 2    | #4 Account-Ebene MCP-Anzahl bewusst reduzieren oder bewusst akzeptieren | Größter quantitativer Hebel; Entscheidung liegt bei Jan (Account-Connector-Verwaltung, kein Projekt-Artefakt)                                      |
| 3    | #9 Baustein E zur Freigabe vorlegen                                     | Bereits fertig geschrieben, reine Review-Entscheidung                                                                                              |
| 4    | #8 Skill-Overhead einmalig messen                                       | Nice-to-have, kein akuter Bottleneck bei aktuellem Budget (15 Mio. Token/Sitzung ist sehr groß)                                                    |
| 5    | #2, #3, #5, #6, #7                                                      | Bereits solide bis exzellent — kein Handlungsbedarf                                                                                                |

## Verwandte Artefakte

| Bedarf                                        | Datei                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| CLAUDE.md-Dichte-Messung (Dimension 1/2)      | [`01_1_claude_md.md`](01_1_claude_md.md)                                   |
| MCP-Server-Bestand & Sicherheits-Scoping      | [`01_8_mcp_server.md`](01_8_mcp_server.md)                                 |
| Memory-Files-Dateibestand (korrigierte Zahl)  | [`01_6_memory_files.md`](01_6_memory_files.md)                             |
| Bisheriger (jetzt präzisierter) Zwischenstand | [`00_claude_code_uebersicht.md`](00_claude_code_uebersicht.md) Abschnitt 5 |
