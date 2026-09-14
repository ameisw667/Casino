# 19 — Mobile-LCP: `/testing/fe-06-crash`

> **Status:** Geplant · **Stand:** 2026-09-13 · **Scope:** Ausschließlich Mobile-LCP für `/testing/fe-06-crash`. Keine Admin-, API-, Wallet- oder außerhalb des belegten Renderpfads liegende Produktverhaltensänderung.

## Route und dokumentierte Baseline

| Messwert               | PerformanceObserver-Lab-Baseline                                               |
| ---------------------- | ------------------------------------------------------------------------------ |
| FCP Lauf 1 / 2         | 1,120 / 1,116 s                                                                |
| finaler LCP Lauf 1 / 2 | 5,840 / 5,844 s                                                                |
| Dominanter LCP-Befund  | CSS-Ressource observatory_backdrop.jpg, 559.800 B, rund 5,0 s Übertragungszeit |

Alle Baselinewerte sind die exakt in `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md` dokumentierten PerformanceObserver-Labwerte, keine Feldwerte.

## Belegte Fakten

- observatory_backdrop.jpg ist als CSS-LCP-Ressource dokumentiert, 559.800 B groß und mit rund 5,0 s Übertragungszeit. Beide LCP-Läufe liegen deutlich über dem Ziel.
- Der dokumentierte dominante LCP-Befund bestimmt den Untersuchungsumfang dieser Route.

## Noch zu prüfende Hypothesen

- Die responsive Auswahl, Discovery oder Größe der CSS-Hintergrundressource ist für Pixel 5 nicht minimal genug.
- Weitere Ursachen dürfen erst durch einen frischen route-spezifischen Lauf und gezielte Diagnose als belegt gelten.

## Route-spezifische Ursachenanalyse und minimaler Fixpfad

- **Ursachenanalyse:** Es liegt ein konkreter ressourcengetriebener LCP-Befund vor. Der Fixpfad konzentriert sich auf responsive CSS-Ressourcenwahl und nicht auf subjektive Optik.
- **Minimaler Fixpfad:** Nur eine minimale responsive Ressourcenauswahl oder Discovery-Verbesserung für den belegten Mobile-LCP-Pfad planen; keine pauschale Bild-Optimierungsumgehung.
- Keine Umsetzung innerhalb dieser Planungsdatei.

## Test-first vor jeder Verhaltensänderung

1. Den aktuellen route-spezifischen Render- und LCP-Pfad mit einem Regressionstest absichern, der vor der Änderung erwartbar fehlschlägt.
2. Erst danach ausschließlich die kleinste belegte Änderung vornehmen.
3. Anschließend den neuen und bestehenden Testumfang ausführen und danach frisch in Production messen.

## Gemeinsame Abhängigkeiten und sichere Reihenfolge

- Sandbox erst nach produktiven Routen behandeln; keinerlei Einfluss auf Admin- oder Produktlogik.
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
