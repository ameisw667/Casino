# Workflow Service-Layer-Änderung

> **Zweck:** Änderungen an Geschäftsregeln, Verträgen und Service-Modulen ausführen. Kontext: [Service-Layer-Kontext](../xx_docs/05_service_layer_context.md).

## 1 — Trigger und Start-Gate

- Gilt für Änderungen unter `src/lib/casino/`, für neue Geschäftsregeln oder für Aufrufe aus UI und API-Routen in diese Schicht.
- Zuerst Kontextreferenz, aufrufende API-/UI-Stelle und vorhandene Tests lesen.
- Einordnen: reine Funktion, client-kompatibler Vertrag, Server-Service, Wallet-/Settlement-Pfad oder externe Integration.
- Bei neuer Datenklasse, neuem API-Boundary, Wallet-/Auth-Pfad oder Scope-Erweiterung Plan und Security-Gate prüfen.

## 2 — Schicht- und Sicherheitsgrenzen

- Page- und UI-Komponenten übergeben Eingaben und zeigen bestätigte Ergebnisse; sie bestimmen keine Wett-, Wallet-, RNG- oder Settlement-Ergebnisse.
- Geschäftsregeln werden in passende Service- oder Pure-Function-Module gelegt. API-Routen koordinieren Auth, Request und Response.
- Walletwerte fließen nur über bestätigte Server-Snapshots. Neue Geldpfade folgen den bestehenden serverautoritativen RPC-Grenzen.
- Server-only Abhängigkeiten bleiben aus client-kompatiblen Modulen und geteilten Payload-Typen heraus.

## 3 — Umsetzung

- Bestehenden Modulbesitzer erweitern, wenn Verantwortung und Importgrenze erhalten bleiben; sonst neues fokussiertes Modul anlegen.
- Öffentliche Contracts, Zod-Schemas und Call-Sites gemeinsam anpassen.
- Konfigurierbare Parameter nach bestehendem Config-Pattern behandeln; Algorithmus und Settlement nicht in Browser-Defaults verlagern.
- Für externe Dienste Fallback, Fehlerklasse und keine Secret-Ausgabe definieren.

## 4 — Verifikation und Dokumentation

- Betroffene Unit- und Integrationstests sowie Typecheck, Lint und Build nach Risiko ausführen.
- Bei Wallet-, RNG-, Auth- oder externen Integrationen Negativtests und Security-Prüfung durchführen.
- Inventar in `xx_docs/05_service_layer_context.md` nur bei Modul- oder Verantwortungsänderung aktualisieren.
- Lokale Implementierung, Remote-Rollout und Live-Verhalten getrennt dokumentieren.
