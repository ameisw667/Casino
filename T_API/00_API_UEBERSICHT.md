# 00 — API: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-05 · **Owner:** Jan / LLM
> **Worldmap-Kategorie:** 01 API

## 1 — Executive Summary für Jan

Der gewichtete Reifegrad liegt bei **Top 26 %** — deutlich unter der bisherigen Worldmap-Headline **Top 10 %**, die der Bestwert einer einzelnen Teilfläche war, kein Durchschnitt (gleiche Situation wie bei Kategorie 02/04/06 vor deren Erstaufschlüsselung). Größter offener Befund ist kein Code-Problem, sondern ein **Doku-Widerspruch**: `worldmap/00_WORLDMAP_STATUS.md` behauptet an zwei Stellen unterschiedliche Envelope-Quoten (100 % vs. 14 %) für dieselbe Kategorie, und die bisherige Detail-Roadmap (`worldmap/01_api.md`) fehlt seit einem Session-Konflikt am 2026-09-02 komplett. Inhaltlich am schwächsten: Input-Validierung (nur 50 % der Routen mit sichtbarem Zod-Schema) und Pagination (nur 1 von 56 Routen mit modernem Cursor-Standard).

## 2 — Bewertungsmethode

Geld-Mutationsrouten (Idempotenz) und Sicherheitsgrenzen (Auth, Origin/CSRF) wiegen am stärksten, reine Komfort-/Doku-Schichten am wenigsten. Werte und Status stammen aus der [Aufschlüsselung](01_api_breakdown.md) — dort steht auch der Verifikationsbefehl pro Zeile.

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                                                                                                         | Gewicht |  Niveau  | Status | Planungsdatei?                                                       | Warum dieses Gewicht                                                                                                                  |
| :-: | :------------------------------------------------------------------------------------------------------------ | :-----: | :------: | :----: | :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
|  2  | Idempotenz bei Geld-/Mutationsrouten                                                                          | **15**  | Top 10 % |   🟢   | Nein                                                                 | Doppelte Buchung auf Geldrouten ist der teuerste denkbare Fehler dieser Kategorie.                                                    |
|  3  | Auth-Enforcement (`getUser()`-Coverage)                                                                       | **14**  | Top 20 % |   🟡   | Nein                                                                 | Fehlende Auth-Prüfung öffnet direkt Nutzer-/Wallet-Daten.                                                                             |
|  1  | Response-Envelope-Konsistenz                                                                                  | **12**  | Top 20 % |   🟡   | Nein                                                                 | Uneinheitliche Erfolgs-/Fehlerformate erschweren jeden Client dauerhaft, sind aber kein akuter Sicherheitsbruch.                      |
|  4  | Input-Validierung (Zod-Schema)                                                                                | **12**  | Top 40 % |   🟠   | Nein                                                                 | Grenze zu nutzergesteuerten Daten — größte ungeprüfte Unsicherheit dieser Aufschlüsselung.                                            |
|  5  | [Rate-Limit-Integration](../T_RATE_LIMITING_ABUSE_PREVENTION/00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md) | **10**  | Top 20 % |   🟡   | Nein (Detail in Kat. 06)                                             | Automatisierbare Abuse-Pfade; Feinbewertung lebt bereits vollständig in Kategorie 06.                                                 |
|  7  | Origin-/CSRF-Guard-Envelope-Konsistenz                                                                        | **10**  | Top 10 % |   🟢   | Nein — [ausgeführt](../worldmap/07_api_origin_envelope_hardening.md) | Frisch gehärtet und verifiziert, schützt schreibende Browser-Anfragen.                                                                |
|  9  | Test-Abdeckung der Route-Schicht                                                                              |  **8**  | Top 45 % |   🟠   | Nein                                                                 | Transport-/Validierungs-Fehlerpfade sind dünn getestet, auch wenn Geschäftslogik im Service-Layer abgedeckt ist.                      |
|  6  | OpenAPI-Dokumentation & Typed Client                                                                          |  **8**  | Top 15 % |   🟢   | Nein                                                                 | Live-Doku-Infrastruktur existiert und ist getestet, aber Abdeckungsgrad nicht re-verifiziert.                                         |
|  8  | Pagination-Standards                                                                                          |  **6**  | Top 55 % |   🔴   | Nein                                                                 | Betrifft nur einen Teil der Listen-Endpunkte, aber dort ein echter, unverändert offener Rückstand.                                    |
| 10  | Doku-Integrität / kanonische Quelle                                                                           |  **5**  | Top 60 % |   🔴   | Nein — siehe [Aufschlüsselung](01_api_breakdown.md) Abschnitt 0      | Verzerrt jede zukünftige Bewertung dieser Kategorie, solange der Widerspruch offen ist — niedriges Gewicht, weil rein dokumentarisch. |

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = 25,6` → **Top 26 %**. Der Worldmap-Headlinewert (Top 10 %) bleibt bis zu Jans Entscheidung unverändert stehen (gleiche Konvention wie Kategorie 02/14).

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. Selbstwiderspruch in `worldmap/00_WORLDMAP_STATUS.md` (Zeile 83 vs. Zeile 288: 100 % vs. 14 % Envelope-Adoption) auflösen.
2. Die 28 Routen ohne sichtbares Zod-Import einzeln auf tatsächliche Validierung prüfen (#4).
3. Nachfolge für die fehlende `worldmap/01_api.md` klären — diese Aufschlüsselung als neue Detail-Ebene übernehmen oder bewusst separat halten.
4. Pagination-Standard (#8) für weitere Listen-Endpunkte jenseits von `user/history` bewerten.

## 6 — Verwandte Artefakte

- [Aufschlüsselung mit Verifikationsbefehlen](01_api_breakdown.md)
- [Origin-Envelope-Hardening (Herkunft #7)](../worldmap/07_api_origin_envelope_hardening.md)
- [API-Backend-Kontext](../xx_docs/08_api_backend_context.md)
- [Rate-Limiting-Übersicht (Herkunft #5)](../T_RATE_LIMITING_ABUSE_PREVENTION/00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
