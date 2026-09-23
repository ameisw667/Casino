# 12 — Mobile-LCP: `/history`

> **Status:** Geplant · **Stand:** 2026-09-13 · **Scope:** Ausschließlich Mobile-LCP für `/history`. Keine Admin-, API-, Wallet- oder außerhalb des belegten Renderpfads liegende Produktverhaltensänderung.

## Route und dokumentierte Baseline

| Messwert               | PerformanceObserver-Lab-Baseline |
| ---------------------- | -------------------------------- |
| FCP Lauf 1 / 2         | 1,852 / 1,708 s                  |
| finaler LCP Lauf 1 / 2 | 3,712 / 2,968 s                  |
| Dominanter LCP-Befund  | Brand-Icon; anonyme Datenbasis   |

Alle Baselinewerte sind die exakt in `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md` dokumentierten PerformanceObserver-Labwerte, keine Feldwerte.

## Belegte Fakten

- Das Brand-Icon ist finaler LCP-Kandidat. Die vorhandene Messung nutzt eine anonyme Datenbasis und beide LCP-Werte liegen über dem Ziel.
- Der dokumentierte dominante LCP-Befund bestimmt den Untersuchungsumfang dieser Route.

## Noch zu prüfende Hypothesen

- Der Header-/Icon-Discovery-Pfad verzögert die LCP-Entdeckung unabhängig von der anonymen Datenbasis.
- Weitere Ursachen dürfen erst durch einen frischen route-spezifischen Lauf und gezielte Diagnose als belegt gelten.

## Route-spezifische Ursachenanalyse und minimaler Fixpfad

- **Ursachenanalyse:** Der Befund weist auf das Brand-Icon statt auf die History-Liste. Die eingeschränkte Datenbasis bleibt Messgrenze und darf nicht durch produktive Datenänderungen kaschiert werden.
- **Minimaler Fixpfad:** Ausschließlich den belegten Header-/Icon-Pfad minimal planen; History-Datenladung und Auth-Verhalten bleiben unangetastet.
- Keine Umsetzung innerhalb dieser Planungsdatei.

## Test-first vor jeder Verhaltensänderung

1. Den aktuellen route-spezifischen Render- und LCP-Pfad mit einem Regressionstest absichern, der vor der Änderung erwartbar fehlschlägt.
2. Erst danach ausschließlich die kleinste belegte Änderung vornehmen.
3. Anschließend den neuen und bestehenden Testumfang ausführen und danach frisch in Production messen.

## Gemeinsame Abhängigkeiten und sichere Reihenfolge

- Header-/Brand-Icon-Abhängigkeit mit /games, Leaderboard, Sign-in, Sign-up und Stats; anonyme Messgrenze explizit je Route beachten.
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
