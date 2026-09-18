# 07 — API: Origin-/CSRF-Guard-Envelope

> **Status:** 🟢 Executed & archiviert · **Stand:** 2026-09-09 · **Owner:** LLM
> **Scope:** `validateMutationOrigin()` und Fehlerrückgaben. Keine Installation, Verbindung, Konfiguration, Secret-Ausgabe oder externe Datenmutation.
> **Archiv-Hinweis:** M4/M8 aus `worldmap/05_ZUKUNFTSPLANUNG.md` Zeile 1.31 sind mit diesem Abschluss erledigt. Diese Datei liegt ab jetzt unter `docs/archive/t_api_07_api_origin_envelope_hardening.md`.

## Abschluss-Nachweis (2026-09-09)

Erneute Call-Site-Prüfung gegen den aktuellen Bestand (59 `route.ts`-Dateien): **27/27** Aufrufe von `validateMutationOrigin()` geben bei Ablehnung konsistent über `apiErrorResponse('PERMISSION_DENIED', 'Keine Berechtigung.', status)` zurück (vollständige Grep-Stichprobe mit Kontext geprüft, keine Abweichung). Ein zunächst auffälliger Treffer (`src/app/api/telegram/webhook/route.ts`, enthält den String `validateMutationOrigin` nur in einem erklärenden Kommentar) ist bestätigt kein Aufruf und keine Regression — die Route authentifiziert per Webhook-Secret statt Origin-Header, identisch zu `/api/webhooks/clerk`, und lehnt bereits korrekt über `apiErrorResponse('UNAUTHORIZED', ...)` ab. Kein Code-Fund, keine Codeänderung nötig. Response-Envelope-Adoption (separate Metrik, Kategorie 02) liegt bei 51/59 Routen (86 %) — nicht Teil dieses Scopes.

## Ausgangslage und Zielbild

**Nachweisbarer Ist-Zustand:** Historischer Fix ist dokumentiert und wird nur erneut geprüft. Die lokale Messung vom 2026-09-09 zählt 59
oute.ts-Dateien unter src/app/api/ und sechs co-lokalisierte Route-Tests. **Zielbild:** Das LLM kann den Vertrag dieser Säule lokal belegen, eine Lücke klar begrenzen und nur mit erforderlicher Freigabe einen separaten Codeplan erstellen.

## Nutzen

Diese Säule macht die API-Architektur für Jan nachvollziehbar: Verträge, Sicherheitsgrenzen und Tests werden aus konkreten Routen abgeleitet, nicht geschätzt.

## Sichere LLM-Arbeitsschritte

1. AGENTS.md, CLAUDE.md, xx_docs/08_api_backend_context.md und xx_sop/07_api_backend_routes.md lesen.
2. Mit
   g --files src/app/api -g route.ts den aktuellen Bestand bestimmen und jede Einordnung mit Pfad belegen.
3. Call-Sites, Webhook-Ausnahmen und Negativtests abgleichen.
4. Befunde mit der kanonischen API-Dokumentation vergleichen; nicht belegbare Aussagen als ungeprüft markieren.
5. Nur bei realer Lücke einen separaten Umsetzungsplan mit Test, Fail-closed-Verhalten, Freigabeklasse und Rollback erstellen.
6. Relative Links, Status und Platzhalter prüfen; für Dokuänderungen Markdown- und Git-Diff-Prüfung durchführen.

## Rechte, Daten, Kosten und Grenzen

- Erlaubt: lokales read-only Audit sowie lokale Mock-Tests.
- Freigabegrenze: Auth-/Origin-Änderungen sind K4.
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

- [API-Kontext](../xx_docs/08_api_backend_context.md) und [API-SOP](../xx_sop/07_api_backend_routes.md), abgerufen 2026-09-09.
- [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), abgerufen 2026-09-09.

## Eindeutiger nächster Schritt

Call-Sites, Webhook-Ausnahmen und Negativtests abgleichen.
