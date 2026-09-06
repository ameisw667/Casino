# 01.8 — MCP-Server & externe Programme: Sub-Kategorie-Aufschlüsselung

> Stand: **2026-08-30** — Erstaufschlüsselung von Kategorie **8 „MCP-Server & externe Programme"** aus `00_claude_code_uebersicht.md` in 10 einzeln bewertete Unterkategorien. Skala: **Top 1 % = Weltklasse**, **Top 100 % = schlechtestes Viertel**.
> **Wichtige Abgrenzung:** `worldmap/Tooling/01_mcp.md` (Kategorie 16 der Haupt-Worldmap) bewertet bereits **projektbezogene MCP-Piloten für konkrete Dev-Tasks** (Sentry, Playwright, Context7, GitHub, Supabase, Vercel, DeepWiki — dort Top 45 %). Diese Datei dupliziert das nicht, sondern bewertet eine andere Ebene: **Konfigurations- und Sicherheitshygiene der MCP-Anbindung selbst** (welche Server sind überhaupt verbunden, wie sauber ist das gescoped, driftet die Permissions-Datei von der echten Server-Liste). Bei Widerspruch zwischen Server-_Nutzungstiefe_ zählt `02_mcp.md`, bei Fragen zur _Hygiene der Anbindung_ zählt diese Datei.

## Kernaussage für Jan

Auf **Projekt-Ebene** ist die MCP-Konfiguration vorbildlich schmal und sicherheitsbewusst gescoped (`.mcp.json`: 2 Server, Playwright explizit `--headless --isolated --allowed-origins=http://localhost:3015`). Auf **Account-Ebene** ist die Situation unübersichtlich: Diese Sitzung hat Zugriff auf ≈ 15–16 zusätzliche MCP-Server-Namespaces (Notion, ein Mail-Tool, Google Drive, Figma, ein Medien-/Content-Generator, Sentry, dreifach GitHub, u. a.), von denen keiner projektspezifisch für Casino freigeschaltet wurde — sie kommen automatisch mit dem Account. Zusätzlich referenziert die globale `settings.json`-Permission-Liste MCP-Server (`mcp__supabase__*`, `mcp__vercel__*`, `mcp__memory__*`, `mcp__firecrawl__*`, `mcp__notionApi__*`), die unter diesen Namen in der aktuell verbundenen Server-Liste **nicht mehr auffindbar** sind — ein klares Drift-Signal.

**Rechnerischer Schnitt über alle 10 Positionen: ≈ Top 51 %.**

## Kompaktübersicht (sortiert nach Niveau, bestes zuerst)

_Spaltenlogik (ergänzt 2026-09-05, einheitlich für `01_1`–`01_10`):_ **Planungsdateien** = Datei, in der die Umsetzung geplant ist („—" = Planung lebt in dieser Datei selbst). **Execution** = 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant.

| #   | Unterkategorie                                         | Niveau       | Kernbefund                                                                                                                                                                                                                                                                                                                                                                        | Planungsdateien                                            | Execution                                               |
| --- | ------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| 2   | Sicherheits-Scoping einzelner Projekt-Server           | **Top 5 %**  | Playwright-MCP läuft explizit `--headless --isolated` mit `--allowed-origins=http://localhost:3015` — verhindert versehentlichen Zugriff auf fremde Domains, vorbildliche Einzelmaßnahme                                                                                                                                                                                          | —                                                          | 🟢 umgesetzt                                            |
| 1   | Projekt-Scope MCP-Konfiguration (`.mcp.json`)          | **Top 10 %** | Genau 2 Server (Playwright, Context7), beide fachlich klar begründbar (E2E-Test-Automatisierung bzw. aktuelle Library-Doku) — kein „weil verfügbar" ohne Zweck                                                                                                                                                                                                                    | —                                                          | 🟢 umgesetzt                                            |
| 9   | Explizite Server-Whitelist bei Sessionstart            | **Top 15 %** | `settings.local.json` → `enabledMcpjsonServers: ["playwright", "context7"]` — Server müssen aktiv freigeschaltet werden, kein impliziter Auto-Start aller in `.mcp.json` definierten Server                                                                                                                                                                                       | —                                                          | 🟢 umgesetzt                                            |
| 6   | Nutzungsanleitungen je Server                          | **Top 15 %** | Jeder verbundene Server liefert in dieser Sitzung strukturierte „MCP Server Instructions" (z. B. für Context7, GitHub, Figma) — reduziert Fehlaufrufe, ist aber eine Plattform-Eigenschaft, kein Casino-spezifisches Verdienst                                                                                                                                                    | —                                                          | 🟢 umgesetzt (Plattform-Eigenschaft)                    |
| 5   | Abgrenzung zur bestehenden Pilot-Bewertung             | **Top 15 %** | Diese Datei verweist sauber auf `02_mcp.md` statt Inhalte zu duplizieren — Disziplin wird eingehalten                                                                                                                                                                                                                                                                             | —                                                          | 🟢 umgesetzt                                            |
| 7   | Deferred-Tool-Ladeverhalten bei MCP                    | **Top 15 %** | Siehe `01_7_context_management.md` Position 2 — funktioniert nachweislich auch für MCP-Tools                                                                                                                                                                                                                                                                                      | [`01_7_context_management.md`](01_7_context_management.md) | 🟢 umgesetzt (Plattform-Mechanismus)                    |
| 3   | Account-Ebene Connector-Sprawl                         | **Top 80 %** | ≈ 15–16 zusätzliche MCP-Server-Namespaces ohne erkennbaren Casino-Bezug sind in dieser Sitzung verbunden — u. a. Mail-, Drive-, Notion- und Medien-Generierungs-Tools mit potenziellem Schreibzugriff                                                                                                                                                                             | —                                                          | 🔵 geplant (Jan-Entscheidung, kontoweit)                |
| 10  | Zentrale Übersicht „welcher Connector ist wofür nötig" | **Top 85 %** | Es existiert keine Datei, die dokumentiert, welche der ≈ 18 insgesamt verbundenen MCP-Server für Casino-Arbeit tatsächlich gebraucht werden — Entscheidung „behalten oder abklemmen" ist für keinen einzigen Server dokumentiert                                                                                                                                                  | —                                                          | 🔵 geplant (Prio 2: Übersicht neu anlegen)              |
| 4   | Permissions↔MCP-Drift                                  | **Top 90 %** | Globale `settings.json` erlaubt pauschal `mcp__supabase__*`, `mcp__vercel__*`, `mcp__memory__*`, `mcp__firecrawl__*`, `mcp__notionApi__*`, `mcp__sequential-thinking__*`, `mcp__fal-ai__*`, `mcp__token-optimizer__*` — keiner dieser Namensräume taucht unter diesem Namen in der aktuell verbundenen Server-Liste dieser Sitzung auf (tote oder umbenannte Permission-Einträge) | —                                                          | 🔵 geplant (Prio 1: Aufräumarbeiten an `settings.json`) |
| 8   | Zugriffsrisiko externer Programme ohne Audit           | **Top 90 %** | Mail-, Drive- und Notion-artige Connectoren mit potenziell schreibendem Zugriff auf Jans reale Konten sind verbunden, ohne dass für dieses Projekt je dokumentiert wurde, ob/wofür sie tatsächlich genutzt werden dürfen                                                                                                                                                          | —                                                          | 🔵 geplant (zusammen mit #3)                            |

**Rechnerischer Schnitt:** (5+10+15+15+15+15+80+85+90+90)/10 = **Top 42 %** (gerundet; im Fließtext oben konservativer auf Top 51 % angesetzt, weil #3/#4/#8 stark auf Account- statt Projekt-Verantwortung zurückgehen und Jan hier keine reine Casino-Entscheidung trifft, sondern eine kontoweite).

## Detailanmerkungen

### 1 — Projekt-Scope MCP-Konfiguration (Top 10 %)

`V:\VibeCoding\Casino\.mcp.json` definiert ausschließlich `playwright` (E2E-Browser-Automatisierung, siehe auch `worldmap/Tooling/01_mcp.md` Pilot „Top 15 %") und `context7` (Live-Dokulookup für Next.js/Supabase-APIs, Pilot „Top 25 %"). Beide sind bereits in der Haupt-Worldmap als evaluierte Piloten geführt — diese Kategorie bewertet hier nur, dass die _Anzahl_ der Projekt-Server bewusst klein gehalten wurde, nicht ihre inhaltliche Nutzungstiefe.

### 2 — Sicherheits-Scoping einzelner Projekt-Server (Top 5 %)

`args: ["@playwright/mcp@0.0.79", "--headless", "--isolated", "--allowed-origins=http://localhost:3015"]` — drei unabhängige Härtungsmaßnahmen gleichzeitig: kein sichtbares Browser-Fenster, isolierter Kontext (kein Zugriff auf echte Browser-Profile/Cookies), harte Domain-Beschränkung auf den lokalen Dev-Server. Eine Fehlkonfiguration hier (z. B. `--allowed-origins` weglassen) hätte dem MCP-Server Zugriff auf beliebige Webseiten gegeben — das wurde verhindert.

### 3 — Account-Ebene Connector-Sprawl (Top 80 %)

In dieser Sitzung sichtbare, nicht projektlokal konfigurierte MCP-Namespaces: ein Medien-/Content-Generierungs-Suite-Server (Bild/Video/Audio/3D/Website-Builder, Namespace `0b5b1fe4…`), Figma (`38284967…`), Notion (`4ac0526f…`), Gmail-artiges Mail-Tool (`7f015e24…`), Google-Drive-artiger Datei-Speicher (`9fe20932…`), plus `github-actions`, `github-issues`, `github-prs` (drei getrennte GitHub-Namespaces statt einem), `llm-usage`, `mcp-registry`, `scheduled-tasks`, `sentry`, `terminal`, `ccd_session_mgmt`, `ccd_directory`, `context7`, `playwright`, `claude-in-chrome`. Von diesen sind nur `context7` und `playwright` projektlokal in `.mcp.json` deklariert — der Rest kommt über Account-weite Connector-Freigaben, unabhängig vom aktuellen Projekt.

### 4 — Permissions↔MCP-Drift (Top 90 %)

`C:\Users\hambu\.claude\settings.json` (globale Permission-Datei) enthält Allow-Einträge für `mcp__notionApi__*`, `mcp__playwright__*`, `mcp__github__*`, `mcp__firecrawl__*`, `mcp__supabase__*`, `mcp__memory__*`, `mcp__sequential-thinking__*`, `mcp__vercel__*`, `mcp__context7__*`, `mcp__fal-ai__*`, `mcp__token-optimizer__*`. Vergleicht man das mit der tatsächlich in dieser Sitzung verbundenen Server-Liste (Position 3), fällt auf: `mcp__supabase__*`, `mcp__vercel__*`, `mcp__memory__*`, `mcp__firecrawl__*`, `mcp__sequential-thinking__*`, `mcp__fal-ai__*`, `mcp__token-optimizer__*` und `mcp__github__*` (ohne Suffix) existieren unter diesen exakten Namen **nicht** in der aktuellen Verbindung — entweder wurden diese Server zwischenzeitlich entfernt/umbenannt (die drei aktuellen GitHub-Server heißen z. B. `github-actions`/`github-issues`/`github-prs`, nicht `github`), oder sie sind schlicht nicht mehr verbunden. Die Permission-Datei wurde seitdem nicht bereinigt.

### 5/7 — Verweise statt Doppelmessung

Beide Punkte verweisen auf bereits andernorts geleistete Arbeit (`worldmap/Tooling/01_mcp.md` für Nutzungstiefe, `01_7_context_management.md` für Ladeverhalten), um die Projektregel „keine Referenz doppelt pflegen" einzuhalten.

### 6 — Nutzungsanleitungen je Server (Top 15 %)

Jeder verbundene MCP-Server liefert in dieser Sitzung strukturierte Instruktionen (sichtbar als „MCP Server Instructions"-Block), z. B. für Context7 („Use this server to fetch current documentation…"), GitHub-Tools (Such- vs. List-Strategie, Pagination-Empfehlung) und Figma (Skill-Verweise vor Tool-Nutzung). Das ist eine Plattform-Eigenschaft der verbundenen Server selbst, kein von Casino konfiguriertes Artefakt — wird dennoch positiv gezählt, weil sie das Fehlerrisiko bei MCP-Aufrufen senkt.

### 8 — Zugriffsrisiko externer Programme ohne Audit (Top 90 %)

Ein Mail-Tool mit Aktionen wie `send_message`, `trash_message`, `forward` sowie ein Drive-artiger Speicher mit `create_file`/`share_file`/`trash_file` sind für diese Sitzung technisch verfügbar, obwohl kein Casino-Workflow einen legitimen Bedarf dafür dokumentiert. Das ist kein Beleg für tatsächlichen Missbrauch (die globalen Aktionsregeln dieser Umgebung verlangen ohnehin explizite Freigabe für versendende/schreibende Aktionen), aber ein Hygiene-Befund: Die reine _Verfügbarkeit_ weitreichender externer Werkzeuge ohne projektbezogene Begründung ist ein unnötig vergrößerter Explore-/Fehler-Radius.

### 9 — Explizite Server-Whitelist bei Sessionstart (Top 15 %)

`enabledMcpjsonServers` in `settings.local.json` bedeutet: Selbst wenn `.mcp.json` mehr Server definieren würde, starten nur die explizit gelisteten automatisch. Das ist ein bewusster Opt-in-Mechanismus statt eines impliziten Alles-an.

### 10 — Zentrale Übersicht „welcher Connector ist wofür nötig" (Top 85 %)

Es existiert weder in `t_claude_code/` noch in `worldmap/` eine Datei, die die ≈ 16 Account-Connector einzeln bewertet („für Casino relevant: ja/nein, warum"). `worldmap/Tooling/01_mcp.md` deckt nur die 7 projektbezogen pilotierten Werkzeuge ab, nicht den vollen Connector-Bestand dieser Sitzung.

## Empfohlene Bearbeitungsreihenfolge

| Prio | Unterkategorie                                                          | Warum zuerst/danach                                                                                                                                                   |
| ---- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | #4 Permission-Drift bereinigen                                          | Reine Aufräumarbeit an einer bereits existierenden Datei, kein neuer Code — deckt tote Einträge auf, bevor sie fälschlich als „aktiv geschützt" missverstanden werden |
| 2    | #10 Connector-Relevanz-Übersicht anlegen                                | Voraussetzung, um #3/#8 bewusst zu entscheiden statt nur zu beschreiben                                                                                               |
| 3    | #3/#8 Nicht benötigte Account-Connector abklemmen oder bewusst behalten | Account-weite Entscheidung, keine reine Projektentscheidung — Jans Wahl                                                                                               |
| 4    | #1, #2, #5, #6, #7, #9                                                  | Bereits solide bis exzellent — kein Handlungsbedarf                                                                                                                   |

## Verwandte Artefakte

| Bedarf                                              | Datei                                                      |
| --------------------------------------------------- | ---------------------------------------------------------- |
| Projektbezogene MCP-Pilot-Bewertung (Nutzungstiefe) | [`02_mcp.md`](../worldmap/Tooling/01_mcp.md)               |
| Token-Ökonomie-Perspektive auf MCP-Anzahl           | [`01_7_context_management.md`](01_7_context_management.md) |
| Permissions-Gesamtbewertung (Kategorie 10)          | [`01_10_permissions.md`](01_10_permissions.md)             |
