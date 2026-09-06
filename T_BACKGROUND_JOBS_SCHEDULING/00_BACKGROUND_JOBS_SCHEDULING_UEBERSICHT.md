# 00 — Background Jobs & Scheduling: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-05 · **Owner:** Jan / LLM  
> **Worldmap-Kategorie:** 07 Background Jobs & Scheduling

## 1 — Executive Summary für Jan

Die Einzelmessung ergibt ungewichtet **Top 24 %**; die Worldmap-Headline Top 20 % ist historisch. Der gewichtete Schnitt liegt bei **Top 28 %**, weil Backfill und finale Trigger.dev-Fehler bei Zustandsverlust stark wiegen. Die nächste Verbesserung ist eine dokumentierte, sichere Recovery-Route.

## 2 — Bewertungsmethode

Gewicht erhalten doppelte bzw. verlorene Seiteneffekte, finale Fehlschläge und ihre Wiederherstellbarkeit. Werte und Status stammen aus der [10-Säulen-Aufschlüsselung](../worldmap/07_background_jobs_scheduling.md).

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                                                                                      | Gewicht |  Niveau  | Status | Planungsdatei?                                                  | Warum dieses Gewicht                                                              |
| :-: | :----------------------------------------------------------------------------------------- | :-----: | :------: | :----: | :-------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
|  1  | Idempotenz & Concurrency-Schutz                                                            | **16**  | Top 15 % |   🟢   | Nein                                                            | Verhindert doppelte Wallet-/Event-Seiteneffekte bei Retries und Parallelität.     |
|  5  | Backfill & Manual-Recovery-Fähigkeit                                                       | **13**  | Top 55 % |   🔴   | Nein                                                            | Ohne Recovery bleiben verlorene Settlements oder Dead Letters riskant.            |
|  2  | Retry/Failure-Handling — Trigger.dev                                                       | **13**  | Top 55 % |   🔴   | Nein                                                            | Finale Fehler sind nur im externen Dashboard sichtbar; eigene Alarmierung fehlt.  |
|  3  | Retry/Failure-Handling — `pg_cron`                                                         | **12**  | Top 15 % |   🟢   | Ja — [ausgeführt](../worldmap/07_background_jobs_scheduling.md) | Persistentes Run-Ledger und begrenzte Retries schützen Tagesjobs.                 |
|  4  | Monitoring der Job-Ausführung                                                              | **10**  | Top 30 % |   🟡   | Nein                                                            | Sichtbarkeit verkürzt die Zeit bis zur Reparatur, ersetzt aber keine Korrektheit. |
|  6  | Trigger.dev-Architektur                                                                    | **10**  | Top 12 % |   🟢   | Nein                                                            | Queues, Fan-out und Durable Waits prägen asynchrone Zuverlässigkeit.              |
|  7  | `pg_cron`/`pg_net`-Scheduling-Muster                                                       |  **8**  | Top 15 % |   🟢   | Nein                                                            | Fehlerhafte Zeitplanung kann Job-Kollisionen und Ausfälle erzeugen.               |
|  8  | Secrets-/Auth-Grenze der Callbacks                                                         |  **8**  | Top 10 % |   🟢   | Nein                                                            | Schützt interne Callback-Endpunkte vor fremder Job-Auslösung.                     |
|  9  | Testabdeckung                                                                              |  **5**  | Top 22 % |   🟡   | Nein                                                            | Erkennt Regressionen früh, der reale Ablauf bleibt getrennt zu beobachten.        |
| 10  | [Trigger.dev-vs.-`pg_cron`-Entscheidungsregel](../xx_sop/20_background_jobs_scheduling.md) |  **5**  | Top 15 % |   🟢   | Ja — SOP                                                        | Verhindert Architekturdrift bei künftigen Jobtypen, wirkt aber indirekt.          |

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = 28,04` → **Top 28 %**. Die Top-55-%-Betriebslücken werden stärker gewichtet als im Quellmittel.

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. Recovery-/Backfill-Prozedur für Dead Letters und Race-Settlements als ausführbaren Plan erstellen.
2. Finale Trigger.dev-Fehler in den eigenen Alarmkanal spiegeln.
3. Danach Job-Health um Run-History und Push-/Alarm-Signale ergänzen.

## 6 — Verwandte Artefakte

- [Worldmap-Aufschlüsselung](../worldmap/07_background_jobs_scheduling.md)
- [Scheduling-SOP](../xx_sop/20_background_jobs_scheduling.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
