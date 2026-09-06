# Sandbox-Versand & Trigger-Absicherung — Referenz für Stufe F

> **Deckt ab:** Stufe F (technisch aufwändigste Stufe des Execution-Ready-Blocks). **Recherche-Stand:** 2026-08-28, gegen [nodemailer.com/guides/testing-with-ethereal](https://nodemailer.com/guides/testing-with-ethereal), [ethereal.email/faq](https://ethereal.email/faq) und [`01_n8n_api_reference.md`](./01_n8n_api_reference.md) (Trigger-Mechanismus) abgeglichen.

## 1 — Ethereal-Testaccount zur Laufzeit erzeugen

```
POST https://api.nodemailer.com/user
Content-Type: application/json

{ "requestor": "casino-n8n-deepdive", "version": "1.0" }
```

Antwort enthält u. a. `user`, `pass`, `smtp.host` (`smtp.ethereal.email`), `smtp.port` (587), `smtp.secure` (false — STARTTLS auf Port 587, nicht implizites TLS). Diese Werte werden **innerhalb desselben Workflow-Laufs** in den nachfolgenden Send-Email-Node übernommen (als Node-Parameter, nicht als gespeicherte n8n-Credential, da der Account ohnehin nur für diesen einen Lauf gedacht ist und nicht dauerhaft wiederverwendet werden muss).

- Kein vorheriger Account, keine Registrierung, kein Key nötig für diesen Aufruf selbst.
- Jeder Aufruf erzeugt einen **neuen** Wegwerf-Account — bei wiederholten Testläufen entstehen entsprechend mehrere Ethereal-Postfächer, das ist gewollt und unproblematisch.

## 2 — Send-Email-Node-Konfiguration

- Host: `smtp.ethereal.email`, Port: `587`, Secure: `false` (STARTTLS wird automatisch verhandelt).
- From/To: beliebig, da nie real zugestellt wird — sinnvollerweise `from: "sandbox@n8n-deepdive.test"`, `to` = die (fiktive, da Sandbox) Lead-Kontakt-Email aus Stufe C.
- Body: der personalisierte Text aus Stufe E.
- Nach jedem Send liefert Ethereal einen **Preview-Link** (`https://ethereal.email/message/{id}`) in der SMTP-Antwort zurück — dieser wird für die Verifizierung in Stufe F gesammelt (z. B. in einem `Set`-Node an eine Ergebnisliste angehängt).

## 3 — Trigger-Absicherung im Detail

Aufbauend auf [`01_n8n_api_reference.md`](./01_n8n_api_reference.md) Abschnitt 4–5:

1. Zufälliges Secret generieren (mind. 32 Zeichen, kryptographisch zufällig).
2. Credential anlegen: `POST /credentials`, Typ `httpHeaderAuth`, Header-Name z. B. `X-Sandbox-Trigger-Secret`.
3. Webhook-Node: `Authentication` → `Header Auth` → obige Credential auswählen. `httpMethod: POST`, `path` frei wählbar, aber nicht erratbar (z. B. ein zufälliges Pfadsegment, keine sprechenden Namen wie `/lead-outreach`).
4. Workflow **aktivieren** (`POST /workflows/{id}/activate`) — notwendig, damit die Produktions-Webhook-URL dauerhaft erreichbar ist (siehe API-Referenz Abschnitt 4, Nuance 1).
5. Auslösen: `POST {instanz-url}/webhook/{pfad}` mit Header `X-Sandbox-Trigger-Secret: {secret}`.

## 4 — Pflicht-Negativtest

Vor Abschluss der Stufe wird **explizit ein Fehlversuch provoziert**:

```
POST {instanz-url}/webhook/{pfad}
(ohne den Header, oder mit falschem Wert)
```

Erwartetes Ergebnis: HTTP 401/403, **kein** Workflow-Lauf wird ausgelöst. Erst wenn dieser Negativtest nachweislich fehlschlägt (im positiven Sinne — der Angriff schlägt fehl), gilt die Absicherung als verifiziert. Dieser Test ist kein optionales Nice-to-have, sondern Teil der Verifizierungskriterien aus dem Hauptplan.

## 5 — Aufräumen (optional, auf Jan-Wunsch)

Nach erfolgreichem Testlauf kann der Workflow deaktiviert (`POST /workflows/{id}/deactivate`) und die Header-Auth-Credential gelöscht werden (`DELETE /credentials/{id}`), falls Jan die Sandbox nicht als Dauer-Referenz in seiner n8n-Instanz behalten möchte. Das ist keine Pflicht — der Workflow verursacht deaktiviert keine Kosten und kein Risiko.
