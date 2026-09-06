# 00 — Observability & Error/Alert Logging: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-05 · **Owner:** Jan / LLM  
> **Worldmap-Kategorie:** 05 Observability & Error/Alert Logging

## 1 — Executive Summary für Jan

Diese Kategorie hat **neun**, nicht zehn, fachlich getrennte Säulen und bleibt damit unter dem vereinbarten Maximum. Der gewichtete Schnitt ist **Top 7 %** und bestätigt den Worldmap-Wert Top 8 %. Verbleibende Grenzen sind bewusste Trade-offs: Single-Region-Uptime-Checking, fehlende Streaming-Kostenwerte und keine vollständige Zustellbestätigung bei Cron-Alarmen.

## 2 — Bewertungsmethode

Die Gewichte folgen der Frage, ob ein unsichtbarer Fehler Geldpfade, Secrets oder die Wiederherstellung beeinträchtigt. Niveau und Status stammen aus der [Observability-Masterdokumentation](../docs/observability/00_OBSERVABILITY_OVERVIEW.md); es findet keine neue Code- oder Live-Prüfung statt.

## 3 — Die 9 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                                                                                        | Gewicht |  Niveau  | Status | Planungsdatei? | Warum dieses Gewicht                                                                   |
| :-: | :------------------------------------------------------------------------------------------- | :-----: | :------: | :----: | :------------- | :------------------------------------------------------------------------------------- |
|  2  | [PII-/Secret-Redaction](../docs/observability/02_pii_secret_redaction.md)                    | **16**  | Top 3 %  |   🟢   | Nein           | Observability darf niemals selbst zum Secret- oder PII-Leak werden.                    |
|  5  | [Fail-Closed-Rate-Limit-Alerting](../docs/observability/05_ratelimit_failclosed_alerting.md) | **13**  | Top 10 % |   🟢   | Nein           | Macht Ausfälle an Geldpfaden sichtbar, ohne Fail-Closed zu schwächen.                  |
|  7  | [Cron-Alerting](../docs/observability/07_cron_failure_alerting.md)                           | **13**  | Top 10 % |   🟢   | Nein           | Verhindert unbemerkte finale Hintergrundjob-Fehler.                                    |
|  1  | [Sentry-Multi-Runtime-SDK](../docs/observability/01_sentry_sdk_core.md)                      | **12**  | Top 5 %  |   🟢   | Nein           | Grundschicht für Fehler aus Server-, Edge- und Client-Runtime.                         |
|  3  | [Einheitlicher `CasinoLogger`](../docs/observability/03_logger_error_capture.md)             | **12**  | Top 8 %  |   🟢   | Nein           | Zentraler Log-Kanal verhindert blinde Flecken durch rohe `console.*`-Aufrufe.          |
|  4  | [Error Boundaries](../docs/observability/04_error_boundaries.md)                             |  **9**  | Top 8 %  |   🟢   | Nein           | Schützt die Spieleroberfläche und liefert verwertbare Absturzdaten.                    |
|  6  | [Health-Check & Uptime](../docs/observability/06_health_check_uptime_monitoring.md)          |  **9**  | Top 10 % |   🟢   | Nein           | Externer Ausfallnachweis ist wichtig, bleibt aber nur ein Alarmkanal.                  |
|  8  | [LLM-Telemetrie](../docs/observability/08_llm_guide_telemetry.md)                            |  **8**  | Top 8 %  |   🟢   | Nein           | Beobachtet Qualität eines spezialisierten Features ohne Gesprächsinhalte zu speichern. |
|  9  | [Admin-Observability-Dashboard](../docs/observability/09_admin_observability_dashboard.md)   |  **8**  | Top 8 %  |   🟢   | Nein           | Bündelt Signale für operative Entscheidungen, ist keine Primär-Schutzgrenze.           |

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = 7,42` → **Top 7 %**. Der Wert liegt innerhalb der gerundeten Worldmap-Einstufung Top 8 %.

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. Uptime-Alarmierung nur mit Jans Drittanbieter-Freigabe um einen zweiten Kanal/Standort ergänzen.
2. Streaming-Telemetrie verbessern, ohne den Antwortstream zu blockieren.
3. Für Cron-Alarme Zustellnachweis oder eine klar beobachtbare Ersatzmetrik bewerten.

## 6 — Verwandte Artefakte

- [Observability-Masterdokumentation](../docs/observability/00_OBSERVABILITY_OVERVIEW.md)
- [Background-Jobs-Übersicht](../T_BACKGROUND_JOBS_SCHEDULING/00_BACKGROUND_JOBS_SCHEDULING_UEBERSICHT.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
