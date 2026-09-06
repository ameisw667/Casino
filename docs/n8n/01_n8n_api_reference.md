# n8n REST API — Referenz für Stufe A & F

> **Deckt ab:** Stufe A (Grundanbindung), Stufe F (Trigger-Mechanismus, Credential-API). **Recherche-Stand:** 2026-08-28, gegen [docs.n8n.io/api](https://docs.n8n.io/api/) und [docs.n8n.io/connect/n8n-api/api-reference](https://docs.n8n.io/connect/n8n-api/api-reference) sowie [community.n8n.io](https://community.n8n.io/t/executing-a-workflow-via-api-call-without-webhook-or-cli-command/212895) abgeglichen.

## 1 — Auth & Base-URL

- Base-URL: `https://{instanz-domain}/api/v1` (self-hosted, wie bei Jans Hostinger-VPS) bzw. `https://{workspace}.app.n8n.cloud/api/v1` (n8n Cloud — hier nicht relevant).
- Jeder Request braucht den Header `X-N8N-API-KEY: {key}`.
- Key-Erzeugung: n8n-UI → Settings → n8n API → "Create an API Key". Der Key ist instanzweit gültig (kein Scoping auf einzelne Workflows) — deshalb wird er ausschließlich serverseitig/im Chat verwendet, nie im Frontend oder in einer geteilten Datei.
- **Wichtig:** Die n8n-API ist während einer reinen Trial-Phase nicht verfügbar — bei Jans selbst gehosteter VPS-Instanz ist das aber ohnehin nicht relevant, da kein Cloud-Trial-Limit greift.

## 2 — Ressourcen-Gruppen der API

Laut aktueller Doku gruppiert nach: `Workflow`, `Execution`, `Credential`, `User`, `Audit`, `Tags`, `Source Control`, `Variables`, `Data Table`, `Projects`. Für diesen Plan relevant: **Workflow**, **Credential**, **Execution** (nur zur Kontrolle vergangener Läufe, nicht zum Auslösen — siehe Abschnitt 4).

## 3 — Workflow-CRUD (Stufe A/F)

| Aktion                   | Methode + Pfad                    | Hinweis                                                                                                                                                    |
| ------------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Workflows auflisten      | `GET /workflows`                  | Für den Verbindungstest in Stufe A ausreichend, HTTP 200 auch bei leerer Liste                                                                             |
| Einzelnen Workflow lesen | `GET /workflows/{id}`             | —                                                                                                                                                          |
| Workflow anlegen         | `POST /workflows`                 | Body: `{ "name": "...", "nodes": [...], "connections": {...}, "settings": {...} }` — die komplette Node-Graph-Definition wird in einem Aufruf mitgeschickt |
| Workflow ändern          | `PUT /workflows/{id}`             | Vollständiger Ersatz des Node-Graphs, kein partielles Patch                                                                                                |
| Workflow aktivieren      | `POST /workflows/{id}/activate`   | Nur bei Workflows mit einem produktionsfähigen Trigger (Webhook, Cron) sinnvoll — siehe Abschnitt 4                                                        |
| Workflow deaktivieren    | `POST /workflows/{id}/deactivate` | —                                                                                                                                                          |
| Workflow löschen         | `DELETE /workflows/{id}`          | Für Aufräumen nach dem Sandbox-Test relevant                                                                                                               |

## 4 — Trigger-Mechanismus: die zentrale Design-Entscheidung dieses Plans

**Befund:** Es gibt in der aktuellen n8n-API **keinen dokumentierten, verlässlichen Endpunkt**, der einen beliebigen, bereits existierenden Workflow unabhängig von seinem Trigger-Typ "einfach jetzt ausführt". Die n8n-Community bestätigt das explizit als offene Frage ohne offizielle Lösung außerhalb von Webhook oder CLI (`n8n execute`, was SSH-Zugriff auf den VPS voraussetzen würde — hier bewusst nicht gewählt, siehe Hauptplan Abschnitt 2, Option C).

**Konsequenz für dieses Projekt:** Jeder Workflow in diesem Plan bekommt einen **Webhook-Trigger-Node** als Einstiegspunkt. Zwei wichtige Nuancen dabei, die oft übersehen werden:

1. **Test-Webhook vs. Produktions-Webhook:** n8n unterscheidet zwei Webhook-URLs pro Webhook-Node — `{instanz}/webhook-test/{pfad}` funktioniert nur, solange der Workflow im Editor geöffnet ist und dort aktiv "Listen for test event" angeklickt wurde. Das ist **nicht headless-tauglich**. `{instanz}/webhook/{pfad}` (Produktions-URL) funktioniert dagegen jederzeit per einfachem HTTP-Call — **vorausgesetzt der Workflow ist aktiviert** (`POST /workflows/{id}/activate`).
2. **Konsequenz für Stufe F:** Der Workflow muss also nach dem Anlegen aktiviert werden, damit der headless-Trigger-Call funktioniert. Das steht im Spannungsfeld zu der Vorgabe "keine Dauer-Cron/kein permanentes Live-Schalten" aus dem Hauptplan — Auflösung: **Aktivierung ist bei einem Webhook-Trigger nicht gleichbedeutend mit "läuft automatisch/wiederkehrend"**. Ein aktivierter Webhook-Workflow tut nichts, bis er per Call ausgelöst wird — anders als ein aktivierter Cron-Trigger. Die Aktivierung ist hier technisch notwendig, ändert aber nichts am "nur gezielt ausführbar"-Charakter aus dem Hauptplan.

## 5 — Credential-API (für Stufe F: Header-Auth-Secret)

- Anlegen: `POST /credentials` mit Body `{ "name": "...", "type": "httpHeaderAuth", "data": { "name": "X-Sandbox-Trigger-Secret", "value": "{zufälliges Secret}" } }`.
- Credential-Werte sind **schreibend, aber nicht lesbar** über die API — ein nachfolgender `GET` liefert die Metadaten, nicht den Secret-Wert zurück. Das ist für diesen Zweck korrekt (Secret muss nirgends erneut auslesbar sein).
- Der Webhook-Node referenziert diese Credential über seinen Parameter "Authentication" → "Header Auth", ausgewählt per Credential-Name/-ID.
- Löschen: `DELETE /credentials/{id}` — Teil des Aufräum-Schritts nach dem Sandbox-Test, falls Jan das wünscht.

## 6 — Bekannte Grenzen, die für diesen Plan explizit nicht relevant sind

- Keine Nutzung der `Execution`-Ressource zum aktiven Auslösen (nur zur nachträglichen Kontrolle, welche Läufe stattgefunden haben, per `GET /executions`).
- Keine Nutzung von `Source Control`/`Variables`/`Projects` — diese Ressourcen sind für Team-/Enterprise-Setups gedacht, für eine Einzel-Instanz auf einem VPS ohne Mehrbenutzerbetrieb nicht relevant.
- `Data Table` als potenziell native Speicheroption wird in [`04_lead_storage_dedupe_reference.md`](./04_lead_storage_dedupe_reference.md) separat bewertet.
