# 06 — Mobile-LCP: `/games`

> **Status:** Geplant · **Stand:** 2026-09-13 · **Scope:** Ausschließlich Mobile-LCP für `/games`. Keine Admin-, API-, Wallet- oder außerhalb des belegten Renderpfads liegende Produktverhaltensänderung.

## Route und dokumentierte Baseline

| Messwert               | PerformanceObserver-Lab-Baseline |
| ---------------------- | -------------------------------- |
| FCP Lauf 1 / 2         | 1,792 / 1,752 s                  |
| finaler LCP Lauf 1 / 2 | 3,276 / 3,096 s                  |
| Dominanter LCP-Befund  | Brand-Icon, spät entdeckt        |

Alle Baselinewerte sind die exakt in `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md` dokumentierten PerformanceObserver-Labwerte, keine Feldwerte.

## Belegte Fakten

- Das Brand-Icon ist als finaler LCP-Kandidat dokumentiert. Die beiden LCP-Labwerte liegen über dem Ziel.
- Der dokumentierte dominante LCP-Befund bestimmt den Untersuchungsumfang dieser Route.

## Noch zu prüfende Hypothesen

- Die Entdeckung oder Priorisierung des Header-/Brand-Icon-Pfads wird durch die gemeinsame Shell oder Hydration verzögert.
- Weitere Ursachen dürfen erst durch einen frischen route-spezifischen Lauf und gezielte Diagnose als belegt gelten.

## Route-spezifische Ursachenanalyse und minimaler Fixpfad

- **Ursachenanalyse:** Der dokumentierte finale Kandidat ist nicht das Spiele-Grid, sondern das Brand-Icon. Der Untersuchungsfokus liegt deshalb zuerst auf dessen routeübergreifender Entdeckungskette.
- **Minimaler Fixpfad:** Nur nach dem Regressionstest den kleinsten Nachweis-gestützten Eingriff zur früheren Entdeckung des Brand-Icons vorsehen; das Spiele-Grid bleibt unverändert.
- Keine Umsetzung innerhalb dieser Planungsdatei.

## Test-first vor jeder Verhaltensänderung

1. Den aktuellen route-spezifischen Render- und LCP-Pfad mit einem Regressionstest absichern, der vor der Änderung erwartbar fehlschlägt.
2. Erst danach ausschließlich die kleinste belegte Änderung vornehmen.
3. Anschließend den neuen und bestehenden Testumfang ausführen und danach frisch in Production messen.

## Gemeinsame Abhängigkeiten und sichere Reihenfolge

- Gemeinsamen Header-/Brand-Icon-Pfad vor History, Leaderboard, Sign-in, Sign-up und Stats prüfen; Akzeptanz bleibt pro Route separat.
- Gemeinsame Befunde sind nur ein Prüfhinweis: Umsetzung, Test und Akzeptanz dieser Route bleiben eigenständig.

## Verbindliche Messmethode

- Frischer Production-Build und ausschließlich lokaler Production-Server.
- Pixel 5, 4× CPU-Drosselung, 4G mit 150 ms Latenz, 1,6 Mbit/s Downlink und 750 kbit/s Uplink.
- Mindestens zwei frische Läufe ohne Interaktion.
- PerformanceObserver für FCP und den finalen LCP-Kandidaten.
- Je Lauf LCP-Ressource, Startzeit, Dauer, Transfergröße und Request-Anzahl erfassen.
- Ergebnisse ausschließlich als PerformanceObserver-Labwerte bezeichnen.

## Akzeptanz und Dokumentationsregel

- Akzeptanzkriterium: Beide frischen PerformanceObserver-Lab-LCP-Werte sind ≤ 2,5 s.
- `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md` erst nach zwei erfolgreichen frischen Läufen aktualisieren.
- Bis dahin bleiben Route und Ausführung **Geplant**; der Gesamtscope wird nicht als erledigt markiert.

## Explizite Verbote

- Keine pauschalen `unoptimized`-Image-Workarounds.
- Keine Screenshot- oder subjektive Sichtprüfung als Abnahme.
- Keine Änderungen an Admin-Routen unter `/admin/**`.
- Keine breitflächigen Refactorings.

## Ausführungsstand (2026-09-14)

> **Status:** Verifiziert — beide frischen PerformanceObserver-Lab-LCP-Werte liegen bei ≤ 2,5 s.

### Frische PerformanceObserver-Lab-Baseline vor der Änderung

Frischer lokaler Webpack-Production-Build (`BUILD_ID 8y9d19rXkRkyPZCs815Jl`) und lokaler Production-Server; Pixel 5, 4× CPU-Drosselung, 4G (150 ms, 1,6 Mbit/s Downlink, 750 kbit/s Uplink), ohne Interaktion. Alle Werte sind PerformanceObserver-Labwerte.

| Lauf |     FCP | finaler LCP | LCP-Kandidat          | LCP-Ressource                                                | Startzeit / Dauer / Transfergröße | Requests |
| ---- | ------: | ----------: | --------------------- | ------------------------------------------------------------ | --------------------------------- | -------: |
| 1    | 2,316 s |     3,752 s | `IMG.brand-logo-tilt` | `/_next/image?url=%2Fimages%2Fbrand-ace-icon.png&w=384&q=75` | 2,281 s / 1,412 s / 45.288 B      |       83 |
| 2    | 1,824 s |     4,428 s | `IMG.brand-logo-tilt` | `/_next/image?url=%2Fimages%2Fbrand-ace-icon.png&w=384&q=75` | 1,798 s / 2,580 s / 45.288 B      |       82 |

### Belegter Befund, Änderung und Test

- **Fakt:** Der dokumentierte Brand-Icon-Befund ist bestätigt; das Icon ist in beiden frischen Läufen finaler LCP-Kandidat und wird verspätet entdeckt.
- **Änderung:** Ausschließlich `MainSidebar` (nur `MainLayout`, nicht `AdminLayout`) setzt für dieses `next/image`-Icon `preload`.
- **Test-first:** Der echte `MainSidebar`-Markup-Test war zunächst rot (kein Bild-Preload) und nach der Änderung grün: 2/2 Tests bestanden.

### Zwischenzeitlicher Verifikationsblocker (aufgelöst)

Der anschließende frische Production-Build endete vor Route-Generierung durch paralleles fremdes WIP in `src/components/history/__tests__/HistoryTableStream.test.tsx`:

- Zeile 40: `TS2578` — ungenutztes `@ts-expect-error`.
- Zeilen 64 und 69: `TS2339` — `toBeInTheDocument` fehlt im Assertion-Typ.

Der aktuelle vollständige Typecheck verlief danach fehlerfrei. Es folgte ein frischer Production-Build und die nachstehende Verifikation.

### Verifiziertes Ergebnis (2026-09-14)

Frischer isolierter Webpack-Production-Build (`BUILD_ID Jfj1mwT--kv3YMKEXSw1W`) und lokaler Production-Server; Pixel 5, 4× CPU-Drosselung, 4G (150 ms Latenz, 1,6 Mbit/s Downlink, 750 kbit/s Uplink), ohne Interaktion. Alle Werte sind PerformanceObserver-Labwerte.

| Lauf |     FCP | finaler LCP | LCP-Kandidat          | LCP-Ressource                                                | Startzeit / Dauer / Transfergröße | Requests |
| ---- | ------: | ----------: | --------------------- | ------------------------------------------------------------ | --------------------------------- | -------: |
| 1    | 1,244 s |     1,900 s | `IMG.brand-logo-tilt` | `/_next/image?url=%2Fimages%2Fbrand-ace-icon.png&w=384&q=75` | 0,285 s / 1,546 s / 45.288 B      |       83 |
| 2    | 2,092 s |     2,176 s | `IMG.brand-logo-tilt` | `/_next/image?url=%2Fimages%2Fbrand-ace-icon.png&w=384&q=75` | 0,263 s / 1,362 s / 45.288 B      |       83 |

- **Belegte Ursache:** Das Brand-Icon blieb finaler LCP-Kandidat, wird mit dem Preload aber in beiden Läufen früh entdeckt (Ressourcenstart 0,285 s beziehungsweise 0,263 s statt der späteren Baseline-Entdeckung).
- **Änderung:** Nach dem roten Markup-Regressionstest erhält ausschließlich das vorhandene Brand-Icon in `MainSidebar` die Next-16-Option `preload`. Der fokussierte Test ist anschließend grün (2/2); `AdminLayout` bleibt unberührt.
- **Akzeptanz:** 1,900 s und 2,176 s erfüllen beide das ≤-2,5-s-Gate. `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md` wurde deshalb auf `✅` und `Verifiziert` aktualisiert.
