# Vercel CLI-Basis — Plan für Deployments, Logs und sichere Env-Prüfung

> Stand: **2026-08-18 — vollständig Executed, archiviert**  
> Projekt: **Casino / Next.js 16.3 / Vercel Hobby (Free Tier)**  
> Gewählte Option: **1 — CLI-Basis**  
> Zweck: Einen kleinen, reproduzierbaren und sicheren Vercel-CLI-Workflow etablieren. Der Plan umfasst absichtlich **kein MCP**, keine eigene API-Automatisierung und keinen automatischen Production-Deploy.

## Übersicht für Jan

| Nr. | Meilenstein                                                      | Status      | Nächster Schritt                                                                                                                                     | Zuständigkeit |
| --: | ---------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
|   1 | Vercel CLI ohne globale Installation nutzbar                     | 🟢 Executed | Nachweis: `npx vercel --version` → `Vercel CLI 59.1.4` (2026-08-18)                                                                                  | Claude        |
|   2 | Vercel-Konto im Terminal authentifiziert                         | 🟢 Executed | Nachweis: `npx vercel whoami` → `hamburgerzockerjunge-9074` (Team: `hamburgerzockerjunge-9074s-projects`), 2026-08-18                                | **Jan**       |
|   3 | Lokaler Ordner ist mit dem richtigen Vercel-Projekt verknüpft    | 🟢 Executed | Nachweis: `vercel link` → `hamburgerzockerjunge-9074s-projects/casino`, 2026-08-18                                                                   | **Jan**       |
|   4 | Deployment-Übersicht und Build-Details sind lesbar               | 🟢 Executed | Nachweis: `vercel list` (20 Deployments) + `vercel inspect` auf `casino-oasw7fgby-...` (Production, Ready), 2026-08-18                               | Claude        |
|   5 | Runtime-Logs können gezielt gelesen werden                       | 🟢 Executed | Nachweis: `vercel logs --since 3d --limit 20 --no-follow` liefert 20 Zeilen; `--level error` liefert 0 Treffer (kein Fehler im Zeitraum), 2026-08-18 | Claude        |
|   6 | Environment-Variablen-Metadaten sind ohne Secret-Ausgabe prüfbar | 🟢 Executed | Nachweis: `vercel env ls` listet 17 Variablen, alle Werte `Hidden`, 2026-08-18                                                                       | Claude        |
|   7 | Sicherer Standard-Workflow ist dokumentiert                      | 🟢 Executed | Definition of Done vollständig geprüft, Datei nach `docs/archive/` verschoben, 2026-08-18                                                            | Claude        |

> **Ampel-Definition (verbindlich):** 🔴 Geplant — noch nicht gestartet · 🟡 In Execution — gestartet, nicht verifiziert · 🟢 Executed — verifiziert, abgeschlossen.
>
> **Update-Pflicht:** Diese Tabelle wird zusammen mit Abschnitt 7 aktualisiert, sobald ein Schritt tatsächlich nachgewiesen ist. Kein Versuch zählt als Abschluss.
>
> **Archivierung:** Nach vollständigem Executed-Status die Datei nach `docs/archive/` verschieben oder löschen, falls der Workflow nicht weiter genutzt wird.

> **Ab hier: Arbeitskontext für das LLM.** Dieses Dokument ist ein Plan, keine Ausführungsfreigabe für externe Änderungen. Login, OAuth, Tokens, Kontoauswahl und jede bestätigungspflichtige Vercel-Aktion bleiben bei Jan.

## 1. Workflow gemäß Jan-Planungs-Schema

### Phase 1 — Planung

- Der Plan wird aus zwei Perspektiven geprüft: Engineering-Machbarkeit sowie Sicherheits-/Berechtigungsgrenzen.
- Die Scope-Entscheidung ist bereits getroffen: **Option 1, CLI-Basis**.
- Die geplanten Diagnosebefehle sind read-only. Deployment, Env-Änderung, Löschen, Promote und API-/MCP-Automatisierung sind nicht Teil dieses Plans.

### Phase 2 — Execution

- Alle mit **Claude** markierten, rein lesenden Schritte können nach Freigabe ausgeführt werden.
- Login, Browser-OAuth, Auswahl eines Teams/Scopes und jede Eingabe von Tokens oder Secrets führt ausschließlich **Jan** im eigenen Terminal aus.
- Ein Preview-Deployment wird durch diesen Basisplan nicht automatisch erzeugt. Wenn kein bestehendes Deployment vorliegt, entscheidet Jan separat, ob ein Preview-Deployment über Git oder CLI erstellt werden soll.
- Nach allen Schritten prüft Claude die Definition of Done und aktualisiert diese Datei sowie die Zeile zu Vercel in `01_API_MCP_CLI.markdown`.

## 2. Scope

### Enthalten

- CLI über `npx vercel ...`, damit keine globale Installation und kein Versionsdrift nötig sind.
- Sichere Authentifizierung per `vercel login` durch Jan.
- Explizites Verknüpfen dieses Arbeitsordners mit dem korrekten Vercel-Projekt.
- Lesender Zugriff auf Deployment-Liste, Build-Informationen, Runtime-Logs und Namen/Zielumgebungen von Environment-Variablen.
- Ein kurzes Runbook für die wiederkehrende Deployment-Diagnose.

### Ausgeschlossen

- Vercel MCP, `vercel api` oder eine REST-API-Integration.
- Tokens in Dateien, `package.json`, Skripten, CI oder Terminal-Logs.
- `vercel env pull`, da es Secret-Werte lokal in eine Datei schreiben kann.
- `vercel env add`, `vercel env update`, `vercel env rm`, `vercel rm`, `vercel promote`, DNS-, Domain- oder Team-Änderungen.
- Automatische Production-Deployments. Der vorhandene Git-Workflow bleibt die Standardmethode für Deployments.

## 3. IST-Stand

| Prüfpunkt           | Befund                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vercel-Plan         | Hobby (Free Tier); CLI und REST API sind nutzbar, unterliegen aber den Hobby-Limits.                                                             |
| Vercel CLI          | Laut `01_API_MCP_CLI.markdown` am 2026-08-15 nicht in der aktuellen Shell nachgewiesen.                                                          |
| Vercel-Projekt      | Aus den Projekt-/Deployment-Dokumenten bekannt; Projektname, Projekt-ID und ggf. Team-Scope sind vor dem Link erneut im Dashboard zu bestätigen. |
| Lokale Verknüpfung  | `.vercel/project.json` ist mit diesem Plan noch nicht als vorhanden nachgewiesen.                                                                |
| Deployment-Workflow | Nicht in diesem Plan umzustellen; CLI dient zunächst Diagnose und kontrolliertem manuellen Zugriff.                                              |
| Secret-Schutz       | `.env.local` ist vorhanden und darf weder gelesen noch ausgegeben oder mit Vercel-Werten überschrieben werden.                                   |

## 4. Anforderungen

- Verwende `npx vercel ...` statt einer globalen CLI-Installation.
- Linke nur den Ordner `V:\VibeCoding\Casino` und nur nach Gegenprüfung von Projektname und Scope durch Jan.
- Der durch `vercel link` erzeugte Ordner `.vercel/` muss vor einem Commit in `.gitignore` stehen; `project.json` enthält zwar keine Secrets, ist aber lokale Projektmetadaten.
- Lies Env-Konfiguration ausschließlich mit `vercel env ls`; Werte dürfen nicht ausgegeben, heruntergeladen oder in Dateien geschrieben werden.
- Nutze für Diagnose bevorzugt ein Preview-Deployment. Production-Logs nur gezielt und read-only abfragen.
- Jede Ausgabe vor dem Teilen auf E-Mail-Adressen, URLs mit Zugangsdaten, Tokens und Secret-Werte prüfen.
- Statuswechsel auf 🟢 nur bei tatsächlich erfolgreichem, dokumentiertem Kommando.

## 5. Abhängigkeiten

- Node.js und npm sind im Projekt vorhanden; damit ist `npx` verfügbar.
- Für `vercel login` braucht Jan einen Browser oder E-Mail-Zugang zum eigenen Vercel-Konto.
- Das richtige Vercel-Projekt muss existieren und mindestens ein Deployment haben, bevor Deployment- und Log-Prüfungen sinnvoll sind.
- Bei Team-Projekten ist der korrekte Scope erforderlich; eine falsche Auswahl kann den lokalen Ordner mit dem falschen Projekt verknüpfen.
- Netzwerkzugang zu `vercel.com` und `api.vercel.com` muss verfügbar sein.

## 6. Mögliche Fehler und Umgang

| Fehlerfall                                          | Umgang                                                                                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx vercel --version` kann das Paket nicht laden   | Netzwerk/NPM-Registry prüfen; keine globale Installation als stillen Ersatz vornehmen.                                                        |
| Login fordert OAuth, E-Mail-Code oder Token         | Ausschließlich Jan führt die Authentifizierung aus; keine Zugangsdaten in Chat, Datei oder Terminal-Protokoll übernehmen.                     |
| Falsches Projekt oder falscher Team-Scope beim Link | Abbrechen; vor erneutem Link Projektname und Scope im Vercel-Dashboard prüfen. Bestehende `.vercel/project.json` nicht blind überschreiben.   |
| Keine Deployments vorhanden                         | Kein CLI-Deployment automatisch starten; Jan entscheidet separat über Git-Push oder `vercel deploy` als Preview.                              |
| `vercel logs` zeigt viele Einträge                  | Zeitfenster, Umgebung, Level und Limit einschränken, z. B. `--environment preview --level error --since 1h --limit 20`.                       |
| Log-Ausgabe enthält sensible Daten                  | Ausgabe nicht weitergeben; betroffene Anwendungsausgabe/Redaction separat prüfen. Keine Secrets aus Logs in Dokumente kopieren.               |
| Env-Befehl würde Werte herunterladen                | Nicht `vercel env pull` verwenden. Für diese Basis reicht `vercel env ls`, das Konfigurationsnamen und Zielumgebungen auflistet.              |
| Hobby-Limit erreicht                                | Kein automatischer Mehrverbrauch; im Vercel-Dashboard die Nutzung prüfen und bis zur Rücksetzung warten oder bewusst ein Upgrade entscheiden. |

## 7. Execution-Plan

### 7.1 Planungsprüfung — erledigt

- Engineering geprüft: Die aktuellen Vercel-CLI-Befehle unterstützen Verknüpfen, Deployment-Auflistung, Build-/Deployment-Inspektion, Runtime-Logs und Env-Metadaten.
- Sicherheitsgrenzen geprüft: Die erste Stufe ist read-only; Authentifizierung und alle schreibenden Plattformaktionen sind klar bei Jan oder aus dem Scope ausgeschlossen.
- Plan-Selbstprüfung: `vercel env pull` bewusst ausgeschlossen, weil es Environment-Werte in eine lokale Datei schreiben kann und für eine reine Prüfung nicht nötig ist.

### 7.2 Execution — nach Freigabe

|   # | Schritt                                    | Befehl/Aktion                                                                           | Wer     | Nachweis                                                                                                                                                                                                                                                                 |
| --: | ------------------------------------------ | --------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|   1 | IST-Stand bestätigen                       | `npx vercel --version`                                                                  | Claude  | ✅ 2026-08-18: `Vercel CLI 59.1.4` ausgegeben.                                                                                                                                                                                                                           |
|   2 | Konto anmelden                             | `npx vercel login`                                                                      | **Jan** | ✅ 2026-08-18: Login per OAuth-Device-Flow erfolgreich; `npx vercel whoami` → `hamburgerzockerjunge-9074`, Team `hamburgerzockerjunge-9074s-projects`.                                                                                                                   |
|   3 | Projekt und Scope gegenprüfen              | Im Vercel-Dashboard Projektname, Eigentümer/Team und gewünschte Umgebung prüfen         | **Jan** | ✅ 2026-08-18: Jan bestätigt bestehendes Projekt `casino`, Scope `hamburgerzockerjunge-9074s-projects` (via `npx vercel project ls` gegengeprüft).                                                                                                                       |
|   4 | Lokalen Ordner verknüpfen                  | `npx vercel link`                                                                       | **Jan** | ✅ 2026-08-18: `.vercel/project.json` verweist auf `hamburgerzockerjunge-9074s-projects/casino`; `.vercel/` und `.env.local` beide über `.gitignore` ausgeschlossen (per `git check-ignore` geprüft).                                                                    |
|   5 | Deployment-Liste lesen                     | `npx vercel list`                                                                       | Claude  | ✅ 2026-08-18: 20 Deployments gelesen (Production + Preview), u.a. `casino-oasw7fgby-...` (Production, Ready, 24h). Keine Änderung ausgelöst.                                                                                                                            |
|   6 | Build-/Deployment-Details lesen            | `npx vercel inspect <Deployment-URL>`                                                   | Claude  | ✅ 2026-08-18: `vercel inspect` auf `casino-oasw7fgby-...` → Status Ready, Target Production, Build-Liste (u.a. `index`, `admin`, 131 weitere Output-Items) abrufbar.                                                                                                    |
|   7 | Fehlerlogs eines Preview-Deployments lesen | `npx vercel logs --environment preview --level error --since 1h --limit 20 --no-follow` | Claude  | ✅ 2026-08-18: Mit `--environment preview --level error --since 3d` 0 Treffer (kein Preview-Traffic mit Fehlern im Zeitraum). Ohne Filter (`vercel logs --since 3d --limit 20 --no-follow`) 20 Zeilen `info`-Level auf Production gelesen, keine Secret-Werte enthalten. |
|   8 | Env-Metadaten lesen                        | `npx vercel env ls`                                                                     | Claude  | ✅ 2026-08-18: 17 Variablen gelistet (Namen, Typ `Sensitive`, Zielumgebungen, Erstellungsdatum), alle Werte `Hidden` — keine Werte heruntergeladen oder ausgegeben.                                                                                                      |
|   9 | Diagnose-Runbook anwenden                  | Abschnitt 7.3 bei einem nicht kritischen Diagnosefall nutzen                            | Claude  | ✅ 2026-08-18: Runbook-Befehle (list/inspect/logs/env ls) einmal vollständig als Erstlauf durchgeführt und dokumentiert.                                                                                                                                                 |

### 7.3 Standard-Runbook: Deployment-Diagnose

```powershell
# Immer im Repository-Root ausführen
npx vercel list

# Ziel-Deployment auswählen und Details lesen
npx vercel inspect <Deployment-URL>

# Nur aktuelle Fehlerlogs, begrenzt und ohne Live-Stream
npx vercel logs --environment preview --level error --since 1h --limit 20 --no-follow

# Nur Namen und Zielumgebungen der Env-Konfiguration — nie Werte herunterladen
npx vercel env ls
```

**Regel für Production:** Erst das konkrete Production-Deployment per `vercel list` identifizieren, dann `vercel inspect <Deployment-URL>` und bei Bedarf gezielt `vercel logs --deployment <Deployment-ID-oder-URL> --level error --since 1h --limit 20 --no-follow` verwenden. Keine schreibende Aktion als Teil der Diagnose ausführen.

### 7.4 Abschlussprüfung

- Alle erfolgreichen Befehle mit Datum und Ergebnis in die Übersichtstabelle eintragen.
- Prüfen, dass `.vercel/` ignoriert wird und kein Token, Secret oder Env-Wert in Git, Terminal-Notizen oder diese Datei gelangt ist.
- Status von Zeile 13 in `01_API_MCP_CLI.markdown` erst nach erfolgreichem Abschluss von 🔴/⬜ auf 🟢 aktualisieren.

## 8. Definition of Done

- [x] `npx vercel --version` funktioniert im Projektverzeichnis.
- [x] Jan ist erfolgreich angemeldet und `npx vercel whoami` bestätigt den erwarteten Account.
- [x] Der lokale Ordner ist nach manueller Gegenprüfung mit dem korrekten Projekt und Scope verknüpft.
- [x] `.vercel/` ist von Git ausgeschlossen.
- [x] `npx vercel list` und `npx vercel inspect <Deployment-URL>` liefern lesende Deployment-Informationen.
- [x] Ein begrenzter, read-only Runtime-Log-Check wurde erfolgreich ausgeführt.
- [x] `npx vercel env ls` wurde ausgeführt, ohne Env-Werte in eine Datei oder Ausgabe zu übernehmen.
- [x] Diese Datei und `01_API_MCP_CLI.markdown` sind nach dem realen Nachweis synchron aktualisiert.
- [x] Kein Token, Secret, Passwort oder Environment-Wert wurde gespeichert, ausgegeben oder committed.

## 9. Offene Punkte für Jan — geklärt (2026-08-18)

- Vercel-Projekt: **`casino`**, Scope **`hamburgerzockerjunge-9074s-projects`** (bestehendes Projekt, von Jan bestätigt, per `vercel project ls` gegengeprüft).
- Erstes Diagnoseziel: Deployment-Liste/Inspect liefen gegen ein Production-Deployment (`casino-oasw7fgby-...`), Log-Diagnose zusätzlich gegen ein Preview-Deployment mit `--environment preview`. Beides read-only, keine Änderung ausgelöst.
- Kein neues Deployment wurde erstellt; bestehende Production-/Preview-Deployments waren bereits vorhanden. Die Entscheidung für ein künftiges `vercel deploy` bleibt separat bei Jan.

## 10. Quellen

- [Vercel CLI Overview](https://vercel.com/docs/cli)
- [Vercel CLI: `link`](https://vercel.com/docs/cli/link)
- [Vercel CLI: `logs`](https://vercel.com/docs/cli/logs)
- [Vercel CLI Global Options](https://vercel.com/docs/cli/global-options)
- [Vercel: Deploying a project from the CLI](https://vercel.com/docs/projects/deploy-from-cli)
- [`01_API_MCP_CLI.markdown`](../../worldmap/01_API_MCP_CLI.markdown) — Ausgangsstatus und Priorisierung
