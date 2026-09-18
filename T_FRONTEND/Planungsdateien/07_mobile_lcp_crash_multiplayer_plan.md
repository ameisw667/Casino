# 07 — Mobile-LCP: `/games/crash-multiplayer`

> **Status:** Ausgeführt – Ziel verfehlt (L1 4,892 s / L2 4,124 s) · **Stand:** 2026-09-14 · **Scope:** Ausschließlich Mobile-LCP für `/games/crash-multiplayer`. Keine Admin-, API-, Wallet- oder außerhalb des belegten Renderpfads liegende Produktverhaltensänderung.

## Ausführungsstand (2026-09-14)

- **Frische PerformanceObserver-Lab-Baseline:** FCP 1,920 s / 1,432 s; finaler LCP 4,712 s / 4,192 s. In beiden Läufen ist `H1` (`1.00x`) der finale Kandidat, ohne LCP-Ressource; 68 Requests, keine Browserfehler.
- **Belegter Befund:** Der finale Kandidat ist der vorhandene `H1` (`1.00x`) ohne LCP-Ressource. Weder der Mobile-Backdrop-Filter-Ausschluss noch ein von 2,6 auf 5,0 s verlagerter Canvas-RAF bringen den finalen Paint unter das Ziel.
- **Test-first und Änderungen:** Der Backdrop-Test und anschließend der gezielte Canvas-Delay-Test liefen jeweils rot vor der Änderung und grün danach; der aktuelle Canvas-Test ist grün (2/2). Geändert wurden ausschließlich mobile Darstellungsdetails; Desktop, Admin, Spiel- und Netzwerklogik bleiben unverändert.
- **Verifiziertes Ergebnis:** Der frische Build `H5angBF8R7lICNIBE5TAp` und zwei interaktionsfreie Läufe liegen mit 4,892 s / 4,124 s weiterhin über dem Gate. Zielstatus bleibt daher 🔴; der nächste test-first Schritt ist der eigenständige statische Mobile-H1-Paint vor vollständiger Spiele-Client-Hydration.

## Route und dokumentierte Baseline

| Messwert               | PerformanceObserver-Lab-Baseline              |
| ---------------------- | --------------------------------------------- |
| FCP Lauf 1 / 2         | 1,920 / 1,432 s                               |
| finaler LCP Lauf 1 / 2 | 4,712 / 4,192 s                               |
| Dominanter LCP-Befund  | Multiplikator-Text nach Bühneninitialisierung |

Alle Baselinewerte sind die exakt in `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md` dokumentierten PerformanceObserver-Labwerte, keine Feldwerte.

## Belegte Fakten

- Der Multiplikator-Text ist der dokumentierte finale LCP-Kandidat; beide Läufe liegen deutlich über dem Ziel.
- Der dokumentierte dominante LCP-Befund bestimmt den Untersuchungsumfang dieser Route.

## Noch zu prüfende Hypothesen

- Die Startansicht wartet auf eine clientseitige Bühnen-, Canvas- oder Hydration-Initialisierung.
- Weitere Ursachen dürfen erst durch einen frischen route-spezifischen Lauf und gezielte Diagnose als belegt gelten.

## Route-spezifische Ursachenanalyse und minimaler Fixpfad

- **Ursachenanalyse:** Der kritische sichtbare Text wird erst nach der Bühneninitialisierung verfügbar. Nicht eine Bildressource, sondern der Zeitpfad bis zur funktionalen Text-Grundansicht ist zu isolieren.
- **Minimaler Fixpfad:** Nur eine statische, funktionale Mobile-Grundansicht für den Multiplikator vor dem belegten Gate planen; Spiel- und Netzwerklogik bleiben unverändert.
- Keine Umsetzung innerhalb dieser Planungsdatei.

## Test-first vor jeder Verhaltensänderung

1. Den aktuellen route-spezifischen Render- und LCP-Pfad mit einem Regressionstest absichern, der vor der Änderung erwartbar fehlschlägt.
2. Erst danach ausschließlich die kleinste belegte Änderung vornehmen.
3. Anschließend den neuen und bestehenden Testumfang ausführen und danach frisch in Production messen.

## Gemeinsame Abhängigkeiten und sichere Reihenfolge

- Teilt den Bühnen-/Hydration-Pfad mit Roulette und Slots. Reihenfolge: zuerst Gate nachweisen, dann jede Route einzeln testen und messen.
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

### Nachher-Production-Verifikation (2026-09-14)

Frischer Webpack-Production-Build und lokaler Production-Server auf Port 3038; Pixel 5, 4× CPU-Drosselung, 4G (150 ms, 1,6 Mbit/s Downlink, 750 kbit/s Uplink), ohne Interaktion. PerformanceObserver-Labwerte:

| Lauf |     FCP | finaler LCP | Kandidat     | LCP-Ressource | Startzeit / Dauer / Transfergröße | Requests |
| ---- | ------: | ----------: | ------------ | ------------- | --------------------------------- | -------: |
| 1    | 1,908 s |     4,588 s | `H1` `1.00x` | keine         | —                                 |       68 |
| 2    | 1,416 s |     4,024 s | `H1` `1.00x` | keine         | —                                 |       68 |

Der mobile Backdrop-Filter-Ausschluss ist als unzureichend belegt: Beide Werte verfehlen das ≤-2,5-s-Gate. Der H1 ist vor dem finalen Paint im DOM; die verbleibende Hypothese ist daher der gleichzeitig gestartete Canvas-Initialisierungspfad. Zielstatus bleibt 🔴. Nächster sicherer Schritt: diesen Pfad test-first auf Mobile nach dem statischen Grundtext verschieben und danach erneut frisch messen.

### Finaler Canvas-RAF-Nachherlauf (2026-09-14)

**Frischer Production-Nachweis:** Webpack-Build `H5angBF8R7lICNIBE5TAp`, lokaler Production-Server, Pixel 5, 4× CPU-Drosselung und 4G (150 ms Latenz, 1,6 Mbit/s Downlink, 750 kbit/s Uplink); zwei Läufe ohne Interaktion. Alle Werte sind PerformanceObserver-Labwerte.

| Lauf |     FCP | finaler LCP | Kandidat     | LCP-Ressource | Startzeit / Dauer / Transfergröße | Requests |
| ---- | ------: | ----------: | ------------ | ------------- | --------------------------------- | -------: |
| 1    | 2,096 s |     4,892 s | `H1` `1.00x` | keine         | —                                 |       68 |
| 2    | 1,636 s |     4,124 s | `H1` `1.00x` | keine         | —                                 |       68 |

- **Test-first:** Der gezielte Regressionstest auf `MOBILE_IDLE_CANVAS_DELAY_MS = 5_000` war vor der Änderung rot und danach grün (2/2).
- **Minimale Änderung:** Nur der mobile Leerlauf-Start des bestehenden Canvas-RAF wurde von 2,6 auf 5,0 s verschoben; Multiplikator, Controls, Desktop, Admin, API-, Wallet- und Spielregeln blieben unverändert.
- **Belegtes Ergebnis:** Trotz verzögertem RAF bleibt der finale H1-LCP deutlich über dem Gate. Der Canvas-Aufschub ist damit als hinreichende Ursache widerlegt; Zielstatus bleibt 🔴.
- **Offene, klar getrennte Hypothese:** Der nächste test-first Prüfpfad ist ein eigenständiger statischer Mobile-H1-Paint vor vollständiger Spiele-Client-Hydration. Er ist noch nicht umgesetzt und keine Zielerreichung.
- **Dokumentationsregel:** `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md` dokumentiert dieses verfehlte Ergebnis; eine ✅-Markierung erfolgt erst bei zwei frischen LCP-Läufen ≤ 2,5 s.
