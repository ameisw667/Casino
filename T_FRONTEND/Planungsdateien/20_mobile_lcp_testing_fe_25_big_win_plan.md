# 20 — Mobile-LCP: `/testing/fe-25-big-win`

> **Status:** Geplant · **Stand:** 2026-09-13 · **Scope:** Ausschließlich Mobile-LCP für `/testing/fe-25-big-win`. Keine Admin-, API-, Wallet- oder außerhalb des belegten Renderpfads liegende Produktverhaltensänderung.

## Route und dokumentierte Baseline

| Messwert               | PerformanceObserver-Lab-Baseline |
| ---------------------- | -------------------------------- |
| FCP Lauf 1 / 2         | 4,280 / 4,216 s                  |
| finaler LCP Lauf 1 / 2 | 4,280 / 4,216 s                  |
| Dominanter LCP-Befund  | effekt-/textgetrieben            |

Alle Baselinewerte sind die exakt in `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md` dokumentierten PerformanceObserver-Labwerte, keine Feldwerte.

## Belegte Fakten

- FCP und finaler LCP sind in beiden Läufen identisch und deutlich über dem Ziel. Der Befund ist effekt-/textgetrieben.
- Der dokumentierte dominante LCP-Befund bestimmt den Untersuchungsumfang dieser Route.

## Noch zu prüfende Hypothesen

- Effekte, Animation oder Hydration verzögern die erste LCP-fähige Textansicht.
- Weitere Ursachen dürfen erst durch einen frischen route-spezifischen Lauf und gezielte Diagnose als belegt gelten.

## Route-spezifische Ursachenanalyse und minimaler Fixpfad

- **Ursachenanalyse:** Da FCP und LCP zusammenfallen, ist der Anfangsrenderpfad selbst der Engpass. Eine Bildmaßnahme ist nicht durch den Befund gedeckt.
- **Minimaler Fixpfad:** Nur eine minimale funktionale, frühe Textgrundansicht vor belegten Effekt-/Hydration-Gates planen; die Sandbox-Interaktion bleibt unverändert.
- Keine Umsetzung innerhalb dieser Planungsdatei.

## Test-first vor jeder Verhaltensänderung

1. Den aktuellen route-spezifischen Render- und LCP-Pfad mit einem Regressionstest absichern, der vor der Änderung erwartbar fehlschlägt.
2. Erst danach ausschließlich die kleinste belegte Änderung vornehmen.
3. Anschließend den neuen und bestehenden Testumfang ausführen und danach frisch in Production messen.

## Gemeinsame Abhängigkeiten und sichere Reihenfolge

- Keine gemeinsame Codeänderung mit FE-06 ableiten: dort ist die Ursache eine konkrete Hintergrundressource, hier ein Render-/Effektpfad.
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
