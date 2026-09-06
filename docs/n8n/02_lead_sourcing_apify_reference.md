# Apify Lead-Sourcing — Referenz für Stufe B

> **Deckt ab:** Stufe B (Lead-Sourcing). **Recherche-Stand:** 2026-08-28, gegen [apify.com/compass/crawler-google-places/api](https://apify.com/compass/crawler-google-places/api) und den Apify-API-Grundlagen ([use-apify.com/docs/apify-for-developers/apify-api-tutorial](https://use-apify.com/docs/apify-for-developers/apify-api-tutorial)) abgeglichen.

## 1 — Actor-Wahl

**Primär:** `compass/crawler-google-places` — einer der am längsten etablierten und meistgenutzten "Google Maps Scraper"-Actors auf Apify, gut dokumentiertes Input-Schema.

**Fallback, falls Actor umbenannt/deprecated wird (zum Ausführungszeitpunkt kurz prüfen):**

- `yasir-on-apify/google-maps-scraper-apify-actor-for-extracting-business-data`
- `poidata/google-maps-scraper`
- `scraperlink/google-maps-scraper` (kostenpflichtiges Pricing-Modell, als letzte Option)

Kriterium für die Wahl zum Ausführungszeitpunkt: aktive Wartung (letztes Update < 6 Monate), Nutzerzahl/Rating in der Apify-Store-Übersicht, kostenloses Startguthaben ausreichend für einen Testlauf von 20–50 Ergebnissen.

## 2 — Endpunkt: synchron statt asynchron

Zwei Varianten existieren:

| Endpunkt                                                       | Verhalten                                                                                                                             | Warum hier relevant                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `POST /v2/acts/{actorId}/runs?token=...`                       | Startet asynchron, liefert nur eine Run-ID zurück — Ergebnis muss separat gepollt werden (`GET /v2/actor-runs/{runId}/dataset/items`) | Unnötig komplex für einen einmaligen Testlauf mit kleiner Ergebnismenge                   |
| `POST /v2/acts/{actorId}/run-sync-get-dataset-items?token=...` | Wartet, bis der Run fertig ist, und liefert die Dataset-Items **direkt in der HTTP-Antwort**                                          | **Gewählter Ansatz** — ein einziger n8n-HTTP-Request-Node genügt, kein Polling-Loop nötig |

**Wichtig — Actor-ID-Encoding:** In der URL wird der `/` in der Actor-ID durch `~` ersetzt: `compass/crawler-google-places` → `compass~crawler-google-places`.

**Vollständige Beispiel-URL:**

```
POST https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token={APIFY_TOKEN}
Content-Type: application/json

{
  "searchStringsArray": ["Café"],
  "locationQuery": "Berlin Kreuzberg, Deutschland",
  "maxCrawledPlaces": 30,
  "language": "de"
}
```

(Exaktes Input-Schema-Feld-Set zum Ausführungszeitpunkt kurz gegen die Actor-Detailseite in der Apify-Console prüfen — Actors aktualisieren ihr Input-Schema gelegentlich.)

## 3 — Kosten & Kontingent

- Apify-Free-Tier bietet ein monatliches Startguthaben, das für einen Testlauf von 20–50 Ergebnissen komfortabel ausreicht.
- Der `run-sync-get-dataset-items`-Endpunkt hat ein Timeout-Limit (typisch im Minutenbereich) — bei `maxCrawledPlaces` im Bereich 20–50 unkritisch, bei sehr großen Abfragen (Stufe K, Horizont 2) müsste auf den asynchronen `/runs`-Endpunkt mit Polling oder auf einen Webhook-Callback von Apify selbst umgestellt werden.
- **Vor dem ersten echten Lauf:** aktuellen Kontingentstand in der Apify-Console prüfen (`show_plans_and_credits`-Charakter — Pricing kann sich ändern, hier nicht als fixer Preis dokumentiert, um keine veraltete Zahl zu suggerieren).

## 4 — Datenqualität & Ethik-Grenze

- Ergebnisfelder typischerweise: `title`, `address`, `phone`, `website`, `categoryName`, teils `email` wenn Google Maps selbst eine hinterlegt hat.
- Es werden ausschließlich Einträge zu **Unternehmen/Organisationen** gezogen, keine Einträge zu Privatpersonen — Google Maps Places-Daten sind strukturell ohnehin auf POIs (Places of Interest) beschränkt, was diese Grenze technisch mit durchsetzt.
- Bewusst kleines, geografisch eng begrenztes Testsegment (ein Stadtteil, eine Kategorie) statt breiter Massenabfrage — hält den Test überschaubar und low-cost.

## 5 — Fehlerfälle

- Leeres Ergebnis (`maxCrawledPlaces` erreicht, aber 0 Items): meist falsches `locationQuery`-Format — Klartext-Ortsangabe statt Koordinaten verwenden.
- HTTP 401 vom Apify-Endpunkt: Token ungültig/falsch übertragen — Token gehört als Query-Parameter `?token=`, nicht als Header, bei diesem Endpunkt-Typ.
- Timeout bei zu hohem `maxCrawledPlaces`: Wert reduzieren oder auf asynchronen Endpunkt wechseln (siehe Abschnitt 2/3).
