# Context7-MCP-Setup — Plan

> Stand: **2026-08-21** · **Status: Executed (alle 6 Punkte verifiziert)**
> Projekt: **Casino / Next.js 16.3**
> Bezug: [`01_API_MCP_CLI.md`](01_API_MCP_CLI.md), Tabelle „Inspiration für Jan" Zeile 5 (Dokumentation — Context7 MCP) sowie neue Übersichtszeile Nr. 19
> Scope: **Option A — Minimal-Pilot ohne Account/API-Key** (per Rückfrage in dieser Konversation bestätigt). Enthält: offizielles `@upstash/context7-mcp`-Paket lokal per `npx` als MCP-Server registrieren, kostenloses Basis-Kontingent ohne Key nutzen, read-only Doku-Lookup-Pilot, Tool-Namen-Abgleich mit dem bestehenden globalen `docs-lookup`-Agenten. Explizit **ausgeschlossen**: Context7-Account/API-Key (Option B), Indexierung/Hosting eigener privater Repos bei Context7, CI-Integration, jede Änderung an Produktionscode über Context7-Ergebnisse ohne eigene Prüfung.

## Übersicht für Jan

| Nummer | Kategorie/Meilenstein                                                           | Status      | Nächster Schritt                                                                                                       | Zuständigkeit |
| ------ | ------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1      | Recherche — Paketname, Config-Format, Rate-Limit ohne Key                       | 🟢 Executed | — (verifiziert 2026-08-19, Quellen siehe Abschnitt 10)                                                                 | LLM           |
| 2      | Config — `.mcp.json`-Eintrag `context7` ergänzt (kein Key, kein Secret)         | 🟢 Executed | — (2026-08-19, `command: npx`, `args: ["-y", "@upstash/context7-mcp"]`, kein Secret)                                   | Claude        |
| 3      | Verifikation — MCP-Tools nach Session-Neustart sichtbar/erreichbar              | 🟢 Executed | — (2026-08-21, nach Neustart per `ToolSearch` sichtbar und aufgerufen)                                                 | Jan+LLM       |
| 4      | Pilot — read-only Doku-Lookup für eine im Projekt genutzte Library              | 🟢 Executed | — (Next.js: `resolve-library-id` → `/vercel/next.js`, `query-docs` → Route-Handler-POST-Beispiele geliefert)           | LLM           |
| 5      | Abgleich — tatsächliche Tool-Namen vs. `docs-lookup`-Agenten-Definition         | 🟢 Executed | — (exakte Übereinstimmung: `mcp__context7__resolve-library-id`, `mcp__context7__query-docs`, keine Abweichung)         | LLM           |
| 6      | Fehlerfall — Rate-Limit oder ungültige Library-ID real auslösen + dokumentieren | 🟢 Executed | — (ungültige Library-ID abgefragt: `"Library ... not found. Please check the library ID or your access permissions."`) | LLM           |

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

| Prüfpunkt                                     | Befund                                                                                                                                                                                                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm-Paketname                                 | `@upstash/context7-mcp` (MIT-Lizenz, Maintainer Upstash)                                                                                                                                                                                                                                    |
| Lokale Registrierung ohne Key                 | `npx -y @upstash/context7-mcp` (stdio-Transport)                                                                                                                                                                                                                                            |
| Mit Key (nicht Teil dieses Scopes)            | zusätzliches Flag `--api-key YOUR_API_KEY`, kostenloser Key über `context7.com/dashboard`                                                                                                                                                                                                   |
| Rate-Limit ohne Key                           | 60 Requests/Stunde (Basis-Kontingent, Sekundärquellen) — im Pilot nicht erreicht, da nur 2 Requests abgesetzt                                                                                                                                                                               |
| Mindestanforderung                            | Node.js ≥ 18 — Projekt nutzt `v22.16.0`, erfüllt                                                                                                                                                                                                                                            |
| Exponierte MCP-Tools (verifiziert 2026-08-21) | `mcp__context7__resolve-library-id` (Parameter `libraryName`, `query`) und `mcp__context7__query-docs` (Parameter `libraryId`, `query`) — exakte Übereinstimmung mit der Sekundärquellen-Angabe, keine Abweichung                                                                           |
| `.mcp.json` im Repo-Root (aktueller Stand)    | Enthält `playwright`- und `context7`-Server-Eintrag (`command: npx`, `args: ["-y", "@upstash/context7-mcp"]`, kein Secret)                                                                                                                                                                  |
| Bestehender globaler Agent `docs-lookup`      | Referenziert `mcp__context7__resolve-library-id`/`mcp__context7__query-docs` — **verifiziert 2026-08-21: exakte Übereinstimmung**, Agent ist ab sofort nutzbar                                                                                                                              |
| Pilot-Ergebnis (verifiziert 2026-08-21)       | `resolve-library-id("Next.js", …)` lieferte u. a. `/vercel/next.js` (5847 Snippets, Reputation „High", Benchmark 88.85); `query-docs("/vercel/next.js", "App Router route handler for POST request…")` lieferte mehrere aktuelle Next.js-Doku-Snippets mit funktionierenden Code-Beispielen |
| Fehlerfall-Ergebnis (verifiziert 2026-08-21)  | `query-docs` mit erfundener Library-ID `/does-not-exist/invalid-library-id-test` lieferte sauberen Fehlertext: „Library ... not found. Please check the library ID or your access permissions." — kein Crash, kein Secret-Leck                                                              |

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
- Status: alle Schritte ausgeführt und verifiziert (2026-08-21).

### 7.2 Execution (Phase 2 — abgeschlossen)

| #   | Schritt                       | Befehl/Aktion                                                                                                  | Wer                   | Nachweis                                                          |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------- |
| 1   | IST-Stand-Check wiederholen   | Paketverfügbarkeit/-version erneut prüfen                                                                      | Claude                | ✅ erledigt — Werte stimmen mit Abschnitt 3 überein               |
| 2   | MCP-Server konfigurieren      | `.mcp.json`-Eintrag `context7` ergänzt: `command: npx`, `args: ["-y", "@upstash/context7-mcp"]`, kein Key      | Claude, nach Freigabe | ✅ erledigt 2026-08-19/20                                         |
| 3   | Session-Neustart              | Jan startete die Claude-Code-Session neu (Computer-Neustart)                                                   | Jan                   | ✅ erledigt — Context7-MCP-Tools ab 2026-08-21 sichtbar           |
| 4   | MCP-Tool-Verfügbarkeit prüfen | Tool-Liste nach Neustart abgefragt, exakte Tool-Namen dokumentiert                                             | Claude                | ✅ erledigt 2026-08-21 — siehe Abschnitt 3                        |
| 5   | Read-only-Pilot               | Next.js nachgeschlagen (`resolve-library-id` → `/vercel/next.js`, `query-docs` → Route-Handler-POST-Beispiele) | Claude                | ✅ erledigt 2026-08-21 — siehe Abschnitt 3                        |
| 6   | Tool-Namen-Abgleich           | Ergebnis aus Schritt 4 gegen `docs-lookup`-Agenten-Definition geprüft                                          | Claude                | ✅ erledigt 2026-08-21 — exakte Übereinstimmung, keine Abweichung |
| 7   | Fehlerfall real auslösen      | `query-docs` mit erfundener Library-ID `/does-not-exist/invalid-library-id-test` abgefragt                     | Claude                | ✅ erledigt 2026-08-21 — sauberer Fehlertext, kein Crash          |

### 7.3 Execution-Selbstprüfung (Phase 2, Abschluss)

- Alle Claude-Schritte aus 7.2 gegen die Definition of Done (Abschnitt 8) geprüft — alle Punkte erfüllt.
- Keine Secrets im Klartext, alle Befehle reproduzierbar.
- Status-Tabelle oben in dieser Datei **und** Statuszeile/Kompaktübersicht in `01_API_MCP_CLI.md` aktualisiert.

## 8. Definition of Done

- [x] `.mcp.json` enthält `context7`-Server-Eintrag ohne Secrets/Key
- [x] MCP-Tools nach Neustart erreichbar, exakte Tool-Namen dokumentiert
- [x] Mind. ein read-only-Pilot gegen eine im Projekt genutzte Library dokumentiert
- [x] Tool-Namen-Abgleich mit `docs-lookup`-Agent durchgeführt und Ergebnis dokumentiert (exakte Übereinstimmung)
- [x] Mind. ein Fehlerfall (ungültige Library-ID) real ausgelöst und dokumentiert
- [x] Kein Secret im Klartext in dieser Datei, `.mcp.json`, Terminal-Output oder Git-Verlauf
- [x] Status-Tabelle oben in dieser Datei sowie Statuszeile in `01_API_MCP_CLI.md` aktualisiert

## 9. Offene Punkte für Jan

- Rate-Limit (60 Req/Std ohne Key) wurde im Pilot mit nur 3 Requests nicht getestet — reicht für Jans erwartete Nutzungsfrequenz aus? Bei echtem Engpass: Umstieg auf Option B (API-Key) als separate, spätere Entscheidung. Noch nicht entschieden.
- Soll die Paketversion analog zum Playwright-Pilot exakt gepinnt werden (`@upstash/context7-mcp@x.y.z`), oder bleibt für dieses reine Lese-Tool ohne Sicherheitsrelevanz `-y` (rollend, aktuell ungepinnt) akzeptabel? Noch offen.

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
- [`.mcp.json`](../../.mcp.json) — aktueller MCP-Server-Stand (nur `playwright`)
