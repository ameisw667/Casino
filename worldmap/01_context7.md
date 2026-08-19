# Context7-MCP-Setup — Plan

> Stand: **2026-08-19** · **Status: Execution-Ready**
> Projekt: **Casino / Next.js 16.3**
> Bezug: [`01_API_MCP_CLI.md`](01_API_MCP_CLI.md), Tabelle „Inspiration für Jan" Zeile 5 (Dokumentation — Context7 MCP) sowie neue Übersichtszeile Nr. 19
> Scope: **Option A — Minimal-Pilot ohne Account/API-Key** (per Rückfrage in dieser Konversation bestätigt). Enthält: offizielles `@upstash/context7-mcp`-Paket lokal per `npx` als MCP-Server registrieren, kostenloses Basis-Kontingent ohne Key nutzen, read-only Doku-Lookup-Pilot, Tool-Namen-Abgleich mit dem bestehenden globalen `docs-lookup`-Agenten. Explizit **ausgeschlossen**: Context7-Account/API-Key (Option B), Indexierung/Hosting eigener privater Repos bei Context7, CI-Integration, jede Änderung an Produktionscode über Context7-Ergebnisse ohne eigene Prüfung.

## Übersicht für Jan

| Nummer | Kategorie/Meilenstein                                                           | Status          | Nächster Schritt                                                                     | Zuständigkeit |
| ------ | ------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------ | ------------- |
| 1      | Recherche — Paketname, Config-Format, Rate-Limit ohne Key                       | 🟢 Executed     | — (verifiziert 2026-08-19, Quellen siehe Abschnitt 10)                               | LLM           |
| 2      | Config — `.mcp.json`-Eintrag `context7` ergänzt (kein Key, kein Secret)         | 🟢 Executed     | — (2026-08-19, `command: npx`, `args: ["-y", "@upstash/context7-mcp"]`, kein Secret) | Claude        |
| 3      | Verifikation — MCP-Tools nach Session-Neustart sichtbar/erreichbar              | 🟡 In Execution | Jan startet Session neu, dann Claude prüft Tool-Liste                                | Jan+LLM       |
| 4      | Pilot — read-only Doku-Lookup für eine im Projekt genutzte Library              | 🔴 Geplant      | Nach Schritt 3                                                                       | LLM           |
| 5      | Abgleich — tatsächliche Tool-Namen vs. `docs-lookup`-Agenten-Definition         | 🔴 Geplant      | Nach Schritt 4                                                                       | LLM           |
| 6      | Fehlerfall — Rate-Limit oder ungültige Library-ID real auslösen + dokumentieren | 🔴 Geplant      | Nach Schritt 4                                                                       | LLM           |

> **Ampel-Definition (verbindlich):** 🔴 Geplant — noch nicht gestartet · 🟡 In Execution — gestartet, nicht verifiziert · 🟢 Executed — verifiziert, abgeschlossen.
> **Update-Pflicht:** Diese Tabelle und Abschnitt 7 (Detail) werden immer im selben Edit aktualisiert.

> **Ab hier: Arbeitskontext für das LLM.** Nichts in diesem Dokument ist eine Ausführungsfreigabe für Abschnitt 7.2 — es ist der Plan. Das Hinzufügen eines MCP-Servers ist eine persistente Konfigurationsänderung und bleibt laut den Sicherheitsregeln dieser Session ein Schritt mit expliziter Freigabe durch Jan (siehe Abschnitt 7.2, Schritt 2).

## 1. Workflow (gemäß `CLAUDE.md`)

**Phase 1 — Planung**

- Implementierungsplan aus 2 Perspektiven geprüft: technische Machbarkeit (Abschnitt 3–6: Paket, Config, Abhängigkeiten, Fehlerfälle) und Sicherheits-/Berechtigungsgrenze (kein Secret, `.mcp.json`-Änderung bleibt freigabepflichtig, Abschnitt 7.2).
- Scope-Entscheidung (Optionen A/B/C) wurde vorher separat mit Jan abgestimmt — Option A bestätigt. Das bleibt unabhängig von der „ohne Rückfrage"-Regel aus Phase 2 gültig, siehe `CLAUDE.md`-Abschnitt „Klärung offener Punkte".

**Phase 2 — Execution (noch nicht gestartet)**

- Alle mit **Claude** markierten Schritte in Abschnitt 7.2 werden erst nach Freigabe ausgeführt.
- Schritt 2 (MCP-Server in `.mcp.json` anlegen) bleibt Jan-freigabepflichtig, weil das Hinzufügen eines MCP-Servers eine persistente Konfigurationsänderung ist (globale Safety-Regel „Creating or modifying standing rules or persistent configuration").
- Nach Abschluss aller Claude-Schritte: Execution gegen die Definition of Done (Abschnitt 8) prüfen — Abschnitt 7.3.
- Erst wenn diese Prüfung erfolgreich ist und die Status-Tabelle oben sowie die Statuszeile in `01_API_MCP_CLI.md` aktualisiert sind, gilt die Aufgabe als abgeschlossen.

## 2. Scope

Gewählt: **Option A** (drei Optionen zur Wahl gestellt — Minimal-Pilot ohne Account, mit API-Key/Account, oder kein MCP/nur WebFetch; A bestätigt am 2026-08-19).

- **Enthalten:** `@upstash/context7-mcp` per `npx` lokal registrieren, kein API-Key, kostenloses Basis-Kontingent, MCP-Tools nach Neustart verifizieren, ein read-only Doku-Lookup-Pilot für eine im Projekt tatsächlich genutzte Library (z. B. Next.js, Zod oder Supabase-JS), Tool-Namen-Abgleich mit dem bestehenden globalen `docs-lookup`-Agenten, mindestens ein Fehlerfall (Rate-Limit oder ungültige Library-ID).
- **Nicht enthalten:** Context7-Account, API-Key, Indexierung eigener/privater Repositories bei Context7, CI-Integration, automatisches Übernehmen von Context7-Ergebnissen in Produktionscode ohne eigene Prüfung.

## 3. IST-Stand (recherchiert 2026-08-19)

| Prüfpunkt                                  | Befund                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm-Paketname                              | `@upstash/context7-mcp` (MIT-Lizenz, Maintainer Upstash)                                                                                                                                                                                                                                                                                                            |
| Lokale Registrierung ohne Key              | `npx -y @upstash/context7-mcp` (stdio-Transport)                                                                                                                                                                                                                                                                                                                    |
| Mit Key (nicht Teil dieses Scopes)         | zusätzliches Flag `--api-key YOUR_API_KEY`, kostenloser Key über `context7.com/dashboard`                                                                                                                                                                                                                                                                           |
| Rate-Limit ohne Key                        | 60 Requests/Stunde (Basis-Kontingent) — aus mehreren unabhängigen Sekundärquellen (Augment-Code-MCP-Verzeichnis, Context7-FAQ), nicht wortgleich in der Primärquelle mit exakter Zahl belegt; als „hinreichend verlässlich, keine Primärquelle" markiert und im Pilot zu bestätigen                                                                                 |
| Mindestanforderung                         | Node.js ≥ 18 — Projekt nutzt `v22.16.0` (siehe `01_Supabase-CLI.md` Abschnitt 3), erfüllt                                                                                                                                                                                                                                                                           |
| Exponierte MCP-Tools                       | Laut Dokumentation zwei Tools: eines löst einen Library-Namen in eine Context7-ID auf, eines liefert die zugehörige Doku. Exakte Tool-Namen sind in Sekundärquellen uneinheitlich benannt (`resolve-library-id` + `get-library-docs`/`query-docs`) — werden **nicht vorab angenommen**, sondern erst nach echter Verbindung in Schritt 3/4 verbindlich dokumentiert |
| `.mcp.json` im Repo-Root (aktueller Stand) | Enthält nur den `playwright`-Server-Eintrag, kein `context7`-Eintrag                                                                                                                                                                                                                                                                                                |
| Bestehender globaler Agent `docs-lookup`   | Referenziert bereits `mcp__context7__resolve-library-id` und `mcp__context7__query-docs` als Tools — heute nicht nutzbar, da der Server im Projekt nicht registriert ist. Nach Schritt 3/4 zu prüfen, ob die tatsächlichen Tool-Namen mit dieser Agenten-Definition übereinstimmen (siehe Meilenstein 5)                                                            |

## 4. Anforderungen

- Kein API-Key, keine Secrets in `.mcp.json` — entspricht Option A.
- Read-only: Context7 bietet ausschließlich Doku-Lookup, keinen Schreibzugriff auf das Projekt oder externe Systeme.
- Rate-Limit (60 Req/Std ohne Key laut Recherche) wird im Pilot dokumentiert, nicht mutwillig ausgereizt.
- Kein Zugriff auf private/interne Repos über Context7 — nur öffentliche Library-Dokumentation.
- Ergebnis des Piloten wird dokumentiert (nachgeschlagene Library, Query, Ergebnis-Qualität).
- Tool-Namen nach Verbindung gegen die Definition im `docs-lookup`-Agenten abgleichen; bei Abweichung nur dokumentieren, keine automatische Änderung der globalen Agentendatei ohne Rückfrage (liegt außerhalb dieses Repos).
- Status in der Tabelle oben wird erst nach echtem Nachweis (nicht nach Versuch) von 🔴 auf 🟢 gesetzt.

## 5. Abhängigkeiten

- Node.js ≥ 18 (erfüllt, `v22.16.0`).
- MCP-Client-Neustart nach `.mcp.json`-Änderung nötig — gleiches Verhalten wie beim Playwright-Pilot (siehe `01_Playwright-CLI-MCP.md` Schritt 4).
- Kein Konflikt mit dem bestehenden `playwright`-Server-Eintrag — eigener Server-Key in derselben Datei.
- Kein lokaler Dev-Server nötig (im Gegensatz zum Playwright-Pilot) — Context7 spricht einen externen Doku-Dienst an, keine Projekt-Routen.

## 6. Mögliche Fehler/Probleme + Umgang

| Fehlerfall                                                                         | Umgang                                                                                                                  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `npx -y @upstash/context7-mcp` lädt bei jedem Start neu (kein Pinning)             | Getestete Version einmalig dokumentieren; bei Bedarf auf konkrete Version pinnen (offene Frage, siehe Abschnitt 9)      |
| Rate-Limit (60 Req/Std ohne Key) während des Piloten erschöpft                     | Als Fehlerfall dokumentieren (Meilenstein 6); nicht automatisch auf Option B (API-Key) wechseln ohne separate Rückfrage |
| Tool-Namen weichen von der `docs-lookup`-Agenten-Definition ab                     | Abweichung dokumentieren; keine automatische Änderung der globalen Agentendatei ohne Rückfrage                          |
| MCP-Server nach Config-Änderung nicht sichtbar (Session-Neustart nötig)            | Jan um Neustart bitten, analog Playwright-Pilot                                                                         |
| Context7 liefert veraltete/falsche Doku für eine Library                           | Als Qualitätsbefund dokumentieren, Ergebnis nicht ungeprüft weiterverwenden                                             |
| Spätere Umstellung auf Option B (API-Key) versehentlich mit Klartext-Key committet | Vor jedem Commit `.mcp.json` auf Secrets prüfen                                                                         |

## 7. Execution-Plan (Schritt-für-Schritt)

### 7.1 Planungsprüfung (Phase 1 — erledigt)

- 2 Perspektiven geprüft: technische Machbarkeit (Abschnitt 3–6) und Sicherheits-/Berechtigungsgrenze (Abschnitt 7.2, Schritt 2).
- Plan-Selbstprüfung durchgeführt: Unsicherheit bei den exakten MCP-Tool-Namen erkannt (Sekundärquellen uneinheitlich) — bewusst nicht vorab festgeschrieben, sondern als eigener Verifikationsschritt (Meilenstein 5) statt als Annahme in die Anforderungen aufgenommen.
- Status: bereit für Phase 2, wartet auf Freigabe für Schritt 2 (Config-Änderung).

### 7.2 Execution (Phase 2 — noch nicht gestartet)

| #   | Schritt                       | Befehl/Aktion                                                                                                                          | Wer                       | Nachweis                                                           |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| 1   | IST-Stand-Check wiederholen   | Paketverfügbarkeit/-version erneut prüfen                                                                                              | Claude                    | Werte stimmen mit Abschnitt 3 überein oder Abweichung dokumentiert |
| 2   | MCP-Server konfigurieren      | `.mcp.json`-Eintrag `context7` ergänzen: `command: npx`, `args: ["-y", "@upstash/context7-mcp"]`, kein Key                             | **Claude, nach Freigabe** | `.mcp.json` enthält `context7`-Server-Eintrag, keine Secrets       |
| 3   | Session-Neustart              | Jan startet die Claude-Code-Session neu                                                                                                | Jan                       | —                                                                  |
| 4   | MCP-Tool-Verfügbarkeit prüfen | Tool-Liste nach Neustart abfragen, exakte Tool-Namen dokumentieren                                                                     | Claude                    | Tool-Namen in Abschnitt 3 nachgetragen                             |
| 5   | Read-only-Pilot               | Eine im Projekt genutzte Library nachschlagen (z. B. Next.js, Zod oder Supabase-JS), Ergebnis dokumentieren                            | Claude                    | Query + Ergebnis-Auszug dokumentiert                               |
| 6   | Tool-Namen-Abgleich           | Ergebnis aus Schritt 4 gegen `docs-lookup`-Agenten-Definition (`mcp__context7__resolve-library-id`/`mcp__context7__query-docs`) prüfen | Claude                    | Übereinstimmung oder Abweichung dokumentiert                       |
| 7   | Fehlerfall real auslösen      | Ungültige Library-ID abfragen oder Rate-Limit gezielt beobachten                                                                       | Claude                    | Fehlermeldung + Verhalten im Runbook dokumentiert                  |

### 7.3 Execution-Selbstprüfung (Phase 2, Abschluss)

- Alle Claude-Schritte aus 7.2 gegen die Definition of Done (Abschnitt 8) prüfen.
- Keine Secrets im Klartext, alle Befehle reproduzierbar.
- Status-Tabelle oben in dieser Datei **und** Statuszeile in `01_API_MCP_CLI.md` aktualisieren.
- Erst danach: kurze Zusammenfassung an Jan.

## 8. Definition of Done

- [ ] `.mcp.json` enthält `context7`-Server-Eintrag ohne Secrets/Key
- [ ] MCP-Tools nach Neustart erreichbar, exakte Tool-Namen dokumentiert
- [ ] Mind. ein read-only-Pilot gegen eine im Projekt genutzte Library dokumentiert
- [ ] Tool-Namen-Abgleich mit `docs-lookup`-Agent durchgeführt und Ergebnis dokumentiert
- [ ] Mind. ein Fehlerfall (Rate-Limit oder ungültige Library-ID) real ausgelöst und dokumentiert
- [ ] Kein Secret im Klartext in dieser Datei, `.mcp.json`, Terminal-Output oder Git-Verlauf
- [ ] Status-Tabelle oben in dieser Datei sowie Statuszeile in `01_API_MCP_CLI.md` aktualisiert

## 9. Offene Punkte für Jan

- Reicht das kostenlose Kontingent (recherchiert: 60 Req/Std ohne Key) für den Piloten, oder soll bei einem echten Engpass direkt Option B (API-Key) nachgezogen werden? Vorschlag: erst Option A im Pilot ausreizen, Option B nur bei nachgewiesenem Bedarf — noch nicht entschieden.
- Soll die Paketversion analog zum Playwright-Pilot exakt gepinnt werden (`@upstash/context7-mcp@x.y.z`), oder ist für dieses reine Lese-Tool ohne Sicherheitsrelevanz `@latest`/ungepinnt akzeptabel? Noch offen.

## 10. Quellen

### Offizielle/primäre Dokumentation

- [Context7 GitHub-Repository (upstash/context7)](https://github.com/upstash/context7)
- [Context7 MCP Clients — alle Client-Konfigurationen](https://context7.com/docs/resources/all-clients)
- [Context7 Quickstart (Mintlify)](https://upstash-context7.mintlify.app/quickstart)

### Sekundärquellen (Rate-Limit-Angabe ohne Key)

- [Augment Code MCP-Verzeichnis — Context7](https://www.augmentcode.com/mcp/context7)
- [Context7 MCP FAQ](https://context7mcp.com/faq/)
- [DeepWiki — upstash/context7 Quick Start](https://deepwiki.com/upstash/context7/3.1-ide-and-platform-integration)

### Relevante lokale Belege

- [`01_API_MCP_CLI.md`](01_API_MCP_CLI.md) — Ausgangsanalyse, Inspiration-Zeile 5, Optionenvergleich
- [`01_Playwright-CLI-MCP.md`](01_Playwright-CLI-MCP.md) — Vorlage für dieses Planungsschema
- [`.mcp.json`](../.mcp.json) — aktueller MCP-Server-Stand (nur `playwright`)
