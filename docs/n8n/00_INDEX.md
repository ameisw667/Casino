# docs/n8n/ — Index

> **Zweck:** Vertiefende, projektexterne Referenzdateien zum n8n-Deep-Dive-Plan. Der Plan selbst (Ziele, Stufen, Freigabe-Gates, Status) lebt in [`Z_LLM/07_n8n_deepdive.md`](../../Z_LLM/07_n8n_deepdive.md) — hier steht nur das technische/rechtliche "Wie genau", damit der Plan nicht mit Implementierungsdetails überladen wird (Trennung Plan ↔ Kontextreferenz laut [`xx_sop/03_workflow_jan_planungsdateien.md`](../../xx_sop/03_workflow_jan_planungsdateien.md)).
> **Owner:** LLM · **Pflege-Pflicht:** Bei jeder technischen Änderung an einer Stufe wird die zugehörige Referenzdatei im selben Schritt aktualisiert, nicht nur der Plan.

## Datei-Index

| Datei                                                                                | Deckt Stufe(n) ab | Inhalt                                                                                                               |
| ------------------------------------------------------------------------------------ | :---------------: | -------------------------------------------------------------------------------------------------------------------- |
| [`01_n8n_api_reference.md`](./01_n8n_api_reference.md)                               |       A, F        | n8n-REST-API im Detail: Auth, Workflow-CRUD, Credential-API, Webhook-Trigger-Mechanik, dokumentierte Einschränkungen |
| [`02_lead_sourcing_apify_reference.md`](./02_lead_sourcing_apify_reference.md)       |         B         | Apify-Actor-Auswahl, Input-Schema, Sync-Endpoint, Kosten/Kontingent, Fallback-Actors                                 |
| [`03_enrichment_reference.md`](./03_enrichment_reference.md)                         |         C         | Website-Crawl-Strategie, Email-Extraktion, Fehlerfälle, Rate-Limiting gegenüber Zielseiten                           |
| [`04_lead_storage_dedupe_reference.md`](./04_lead_storage_dedupe_reference.md)       |         D         | Speicheroptionen-Vergleich, Dedupe-Schlüssel-Design                                                                  |
| [`05_personalization_llm_reference.md`](./05_personalization_llm_reference.md)       |         E         | LLM-Node-Optionen, Prompt-Design, Kosten, zusätzlicher API-Key-Bedarf                                                |
| [`06_sandbox_email_security_reference.md`](./06_sandbox_email_security_reference.md) |         F         | Ethereal-Versand im Detail, Webhook-Header-Auth-Absicherung, Negativtest-Prozedur                                    |
| [`07_compliance_legal_reference.md`](./07_compliance_legal_reference.md)             |  M (vorgezogen)   | UWG §7, DSGVO-Einordnung, CAN-SPAM-Vergleich, Consent-Modelle, Checkliste vor echtem Outreach                        |

## Wie diese Dateien genutzt werden

- Der Plan (`Z_LLM/07_n8n_deepdive.md`) verlinkt bei jeder Stufe auf die passende Datei hier — er kopiert deren Inhalt nicht.
- Jede Datei hier ist eigenständig verständlich, falls eine neue LLM-Konversation nur genau diese eine Stufe umsetzen soll.
- Rechtsstand und externe API-Stände sind mit Datum und Quelle versehen — bei Ausführung (nicht nur Planung) sollte der Stand gegen die dann aktuelle Anbieter-Doku kurz erneut geprüft werden, falls seit dem Recherche-Datum viel Zeit vergangen ist.
