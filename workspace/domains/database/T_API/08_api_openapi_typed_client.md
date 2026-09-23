# 08 — API: OpenAPI-Dokumentation und Typed Client

> **Status:** 🟢 Execution-Ready+ · **Stand:** 2026-09-09 · **Owner:** LLM
> **Scope:** `/api/openapi.json`, `/api/docs`, `src/lib/api`. Keine Installation, Verbindung, Konfiguration, Secret-Ausgabe oder externe Datenmutation.

## Ausgangslage und Zielbild

**Nachweisbarer Ist-Zustand:** Doku existiert; die Abdeckung der 59 Routen ist offen. Die lokale Messung vom 2026-09-09 zählt 59
oute.ts-Dateien unter src/app/api/ und sechs co-lokalisierte Route-Tests. **Zielbild:** Das LLM kann den Vertrag dieser Säule lokal belegen, eine Lücke klar begrenzen und nur mit erforderlicher Freigabe einen separaten Codeplan erstellen.

## Nutzen

Diese Säule macht die API-Architektur für Jan nachvollziehbar: Verträge, Sicherheitsgrenzen und Tests werden aus konkreten Routen abgeleitet, nicht geschätzt.

## Sichere LLM-Arbeitsschritte

1. AGENTS.md, CLAUDE.md, xx_docs/08_api_backend_context.md und xx_sop/07_api_backend_routes.md lesen.
2. Mit
   g --files src/app/api -g route.ts den aktuellen Bestand bestimmen und jede Einordnung mit Pfad belegen.
3. Route-zu-Schema-Matrix erstellen.
4. Befunde mit der kanonischen API-Dokumentation vergleichen; nicht belegbare Aussagen als ungeprüft markieren.
5. Nur bei realer Lücke einen separaten Umsetzungsplan mit Test, Fail-closed-Verhalten, Freigabeklasse und Rollback erstellen.
6. Relative Links, Status und Platzhalter prüfen; für Dokuänderungen Markdown- und Git-Diff-Prüfung durchführen.

## Rechte, Daten, Kosten und Grenzen

- Erlaubt: lokales read-only Audit sowie lokale Mock-Tests.
- Freigabegrenze: Keine internen oder Secret-Verträge veröffentlichen.
- Daten: Keine Tokens, Session-Cookies, personenbezogenen Daten oder Produktionsantworten auslesen, speichern oder ausgeben.
- Kosten: Dieses Audit verursacht keine Providerkosten; vor jedem späteren Pilot gelten aktueller Herstellerpreis, Budgetlimit und Abschaltweg.

## Risiken und Gegenmaßnahmen

| Risiko                                           | Gegenmaßnahme                                                           |
| :----------------------------------------------- | :---------------------------------------------------------------------- |
| Suchtreffer wird als Nachweis gelesen            | Route, Consumer, Wrapper und Negativtest zusammen prüfen.               |
| Historische Zähler werden als aktuell ausgegeben | Nur die 59er-Messung vom 2026-09-09 verwenden.                          |
| Scope erweitert sich                             | Bei Code-, Provider- oder K4-Bedarf stoppen und Folgefreigabe einholen. |

## Akzeptanzkriterien

- Jede Einordnung besitzt einen Routen- oder Vertragsnachweis.
- Ungeprüfte Annahmen sind sichtbar markiert.
- Es wurden keine Secrets, Live-Abfragen, Installationen oder Konfigurationsänderungen ausgeführt.
- Alle Links funktionieren; Status ist Execution-Ready+; Platzhalter fehlen.

## Rollback / Abschalten

Das Audit ist read-only. Spätere Codeänderungen müssen per Commit reversibel sein; externe Piloten benötigen vor Start einen Kill Switch (Feature Flag, deaktivierter Token oder entfernte Konfiguration).

## Quellen

- [API-Kontext](../../../../xx_docs/08_api_backend_context.md) und [API-SOP](../../../../xx_sop/07_api_backend_routes.md), abgerufen 2026-09-09.
- [OpenAPI](https://spec.openapis.org/oas/latest.html), abgerufen 2026-09-09.

## Eindeutiger nächster Schritt

Route-zu-Schema-Matrix erstellen.
