# 12 — API: Verbesserungs-Roadmap (9 offene Säulen)

> **Status:** 🟢 Execution-Ready+ · **Stand:** 2026-09-09 · **Owner:** Jan / LLM
> **Zweck:** Priorisierte Ausführungsreihenfolge für die 9 noch offenen API-Verbesserungsbereiche. Kein eigener Audit-Scope — jede Zeile verweist auf ihre eigene, bereits Execution-Ready+ Planungsdatei in `T_API/`. Diese Datei ist reine Priorisierung, keine Ist-Zustand-Messung (dafür: [01_api_breakdown.md](01_api_breakdown.md)).

## Warum diese Datei existiert

`01_api_breakdown.md` bleibt bewusst eine reine Messnotiz (Ist-Zustand, Route-/Testzahlen) ohne Roadmap-Anspruch. Die kanonische Plansteuerung mit allen 10 Subkategorien-Links steht in [00_API_UEBERSICHT.md](00_API_UEBERSICHT.md). Diese Datei ergänzt das um eine explizite Ausführungsreihenfolge, damit "was zuerst" nicht bei jeder Session neu hergeleitet werden muss.

Die Origin-/CSRF-Guard-Envelope-Säule (ehemals 07) ist am 2026-09-09 abgeschlossen und archiviert ([docs/archive/t_api_07_api_origin_envelope_hardening.md](../../../../docs/archive/t_api_07_api_origin_envelope_hardening.md)) — deshalb 9 statt 10 offene Säulen.

## Priorisierte Reihenfolge

| Prio |  #  | Säule                                    | Planungsdatei                                                                      | Begründung der Priorität                                                                                   |
| :--: | :-: | :--------------------------------------- | :--------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
|  1   | 03  | Idempotenz bei Geld- und Mutationsrouten | [03_api_idempotency_mutation_routes.md](03_api_idempotency_mutation_routes.md)     | Geldpfad-Risiko — höchster Impact bei Lücke, K4-Freigabe nötig.                                            |
|  2   | 04  | Auth-Enforcement                         | [04_api_auth_enforcement.md](04_api_auth_enforcement.md)                           | Sicherheitsgrenze über alle 59 Routen; Auth-Klassifizierung ist Voraussetzung für 05/09.                   |
|  2   | 05  | Input-Validierung                        | [05_api_input_validation.md](05_api_input_validation.md)                           | Direkt sicherheitsrelevant (Injection-/Schema-Lücken), teilt sich Prio mit 04.                             |
|  3   | 06  | Rate-Limit-Integration                   | [06_api_rate_limit_integration.md](06_api_rate_limit_integration.md)               | Abuse-Vektor, aber bereits über `T_RATE_LIMITING_ABUSE_PREVENTION` teilweise abgedeckt.                    |
|  4   | 02  | Response-Envelope-Konsistenz             | [02_api_response_envelope_consistency.md](02_api_response_envelope_consistency.md) | Aktuell 51/59 Routen (86 %, Stand 2026-09-09) — Konsistenzlücke, kein Sicherheitsrisiko.                   |
|  4   | 10  | Test-Abdeckung der Route-Schicht         | [10_api_route_test_coverage.md](10_api_route_test_coverage.md)                     | Ergänzt 03–06 statt eigenständig zu blockieren.                                                            |
|  5   | 08  | OpenAPI-Dokumentation und Typed Client   | [08_api_openapi_typed_client.md](08_api_openapi_typed_client.md)                   | Doku-Wert, kein Laufzeitrisiko.                                                                            |
|  6   | 09  | Pagination-Standards                     | [09_api_pagination_standards.md](09_api_pagination_standards.md)                   | Nur Listenrouten betroffen, kleinster Scope.                                                               |
|  1   | 11  | Doku-Integrität und kanonische Quelle    | [11_api_documentation_integrity.md](11_api_documentation_integrity.md)             | Läuft parallel zu jeder anderen Säule (Zähler/Links aktuell halten) — keine Blockade, aber laufend Prio 1. |

## Startbedingung

Kein Punkt aus dieser Liste startet automatisch. Vor Ausführung eines Punkts: aktuellen Ist-Zustand gegen `01_api_breakdown.md` und die jeweilige Planungsdatei gegenprüfen (Route-/Testzahlen wachsen zwischen Sessions), K4-Geldpfad-Änderungen brauchen Jans explizite Freigabe.

## Quellen

- [T_API-Plansteuerung](00_API_UEBERSICHT.md), [Messnotizen](01_api_breakdown.md), lokal abgerufen 2026-09-09.
