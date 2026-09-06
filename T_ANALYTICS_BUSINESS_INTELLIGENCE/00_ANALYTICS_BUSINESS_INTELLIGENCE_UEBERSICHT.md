# 00 — Analytics & Business Intelligence: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-05 · **Owner:** Jan / LLM  
> **Worldmap-Kategorie:** 08 Analytics & Business Intelligence

## 1 — Executive Summary für Jan

Die Worldmap führt die Kategorie bei **Top 15 %**. Diese Übersicht segmentiert sie erstmals in zehn Säulen und ergibt gewichtet **Top 20 %**. Der Unterschied ist kein Qualitätsverlust: Er macht zwei bisher versteckte Grenzen sichtbar — den nicht verdrahteten DSGVO-Erasure-Trigger und den US-Ingestion-Host. Die Messung ist dokumentationsbasiert, keine erneute Remote- oder Rechtsprüfung.

## 2 — Bewertungsmethode

Die Gewichtung priorisiert Datenschutz, Identität und die Integrität geschäftlicher Kennzahlen. Die Bestandsaussagen beruhen auf [Analytics-Kontext](../xx_docs/06_analytics_context.md), [Analytics-SOP](../xx_sop/08_analytics_posthog.md), [BI-Architektur](../docs/architecture/05_2.5_ADMIN_BI_DASHBOARD.md) und der Worldmap. Neue Prozentwerte markieren transparent eine Erstmessung.

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                                                                                                         | Gewicht |  Niveau  | Status | Planungsdatei? | Warum dieses Gewicht                                                                      |
| :-: | :------------------------------------------------------------------------------------------------------------ | :-----: | :------: | :----: | :------------- | :---------------------------------------------------------------------------------------- |
|  1  | [Consent-Gate & Opt-out](../xx_docs/06_analytics_context.md#1--systemgrenze--laufzeitkette)                   | **13**  | Top 10 % |   🟢   | Nein           | Vor Opt-in darf kein Analytics-Request entstehen; primäre Privacy-Grenze.                 |
|  3  | HMAC-Identität                                                                                                | **13**  | Top 12 % |   🟢   | Nein           | Trennt Nutzeridentität und Drittanbieter-Analytics.                                       |
|  8  | [BI-Zugriffsgrenze](../docs/architecture/05_2.5_ADMIN_BI_DASHBOARD.md#umsetzung)                              | **13**  | Top 15 % |   🟢   | Nein           | Admin-BI enthält sensible Geschäftskennzahlen und braucht harte Zugriffskontrolle.        |
|  9  | [BI-Kennzahlen-Ableitung](../docs/architecture/05_2.5_ADMIN_BI_DASHBOARD.md#datenregeln)                      | **12**  | Top 15 % |   🟢   | Nein           | Fehler bei GGR, Retention oder Kohorten verzerren Produkt- und Wirtschaftsentscheidungen. |
|  5  | [DSGVO-Erasure-Integration](../xx_docs/06_analytics_context.md#7--bekannte-offene-probleme--ist-diskrepanzen) | **11**  | Top 50 % |   🔴   | Nein           | Die Löschroutine existiert, ist aber noch nicht an einen Kontolöschflow angeschlossen.    |
|  2  | [Event-Allowlist](../xx_docs/06_analytics_context.md#3--kanonische-zod-event-allowlist-14-events)             | **10**  | Top 12 % |   🟢   | Nein           | Strikte Events verhindern Datenmüll und unbeabsichtigte PII-Übertragung.                  |
| 10  | Snapshot-/Aktualitätsmodell                                                                                   |  **9**  | Top 25 % |   🟡   | Nein           | Live-Aggregation versus Snapshot prägt Aktualität und Skalierung der BI.                  |
|  4  | PostHog-Client-Privacy-Konfiguration                                                                          |  **8**  | Top 25 % |   🟡   | Nein           | Autocapture und Recording sind aus; der US-Ingestion-Host bleibt Datenresidenz-Lücke.     |
|  6  | Web-Vitals / RUM                                                                                              |  **6**  | Top 15 % |   🟢   | Nein           | Liefert Performance-Signale, berührt aber weder Identität noch Geldwerte direkt.          |
|  7  | Analytics-Test- & Validierungsschicht                                                                         |  **5**  | Top 15 % |   🟢   | Nein           | Stabilisiert Grenzen, ist aber eine indirekte Schutzschicht.                              |

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = 19,87` → **Top 20 %**. Der Haupttreiber gegenüber der bisherigen Top-15-%-Headline ist die noch nicht verbundene Erasure-Ausführung.

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. Account-Löschflow definieren und `erasePostHogPerson()` mit Negativtest verdrahten; das ist ein K4-/Datenschutz-Gate und benötigt Jans Freigabe.
2. EU-Ingestion beziehungsweise Datenresidenz gegen aktuelle PostHog- und Vertragsanforderungen prüfen.
3. Erst bei messbarer Last eine Snapshot-/materialisierte-View-Entscheidung für die BI treffen.

## 6 — Verwandte Artefakte

- [Analytics-Kontext](../xx_docs/06_analytics_context.md)
- [Analytics-SOP](../xx_sop/08_analytics_posthog.md)
- [BI-Architektur](../docs/architecture/05_2.5_ADMIN_BI_DASHBOARD.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
