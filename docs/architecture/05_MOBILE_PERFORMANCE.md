# 05 — Mobile Performance: Ursache wirklich lösen

Status: **Teil 2 technisch verifiziert (2026-09-12)** · L3-iPhone-15-/Jan-Abnahme am 2026-09-12 bestätigt; offen bleibt ausschließlich der RUM-Feldvergleich.

---

## Teil 2 — kontrollierte Mobile-LCP-Verifikation (2026-09-12)

Frischer Production-Build (`npm run build`) und lokaler Production-Server (`next start -p 3020`). Messmethode: `PerformanceObserver` auf **Pixel-5-Emulation**, **4× CPU-Drosselung**, **4G-Profil** (150 ms Latenz, 1,6 Mbit/s Downlink, 750 Kbit/s Uplink), je zwei Läufe ohne Nutzerinteraktion. Dies ist ein kontrollierter Lab-Nachweis, keine Lighthouse- oder echte Device-Abnahme.

| Route | FCP Lauf 1 / 2 | finale LCP Lauf 1 / 2 | relevanter Request |
| --- | --- | --- | --- |
| `/` | 1,724 s / 1,776 s | **1,824 s / 1,876 s** | genau einmal Crash-1200px, 100.668 B |
| `/games/dice` | 1,720 s / 1,568 s | **2,068 s / 1,988 s** | genau einmal Mobile-Felt-WebP, 24.742 B |

Erreichte technische Maßnahmen: mobile Dice-Startbühne ohne Canvas/3D/Web-Audio; das interaktive 3D-Modul lädt erst bei echter Bühneninteraktion. Auf Home bleibt die Crash-Karte unmittelbar vorhanden; mobile Satelliten-, Spiral-, Ambient- und weitere Below-the-fold-Inhalte werden erst nach Scroll gerendert. Der ungültige Idle-Pfad, der bei Dice einen späten LCP-Kandidaten erzeugte, wurde entfernt.

Qualitätskette vom 2026-09-12: `npm test` **222 Dateien / 1.700 Tests bestanden**, `npm run lint` bestanden, `npm run typecheck` bestanden, Production-Build bestanden. Der Git-Audit enthielt ausschließlich paralleles WIP und dessen vorbestehende Whitespace-Hinweise; diese wurden nicht verändert.

Bestätigt: Jan hat den vorgesehenen L3-Test auf einem echten iPhone 15 erfolgreich durchgeführt (Nutzerbestätigung, 2026-09-12). Offen: RUM-Feldwerte; die Lab-Ergebnisse ersetzen diese nicht.
## Executive Summary

1. **Synchronous Media Query Guards (`WebGlWaterRefractionCanvas.tsx`)**: Synchronous `window.matchMedia('(max-width: 1023px)').matches` guard added directly inside JSX render and `useEffect`. Prevents any DOM rendering or WebGL initialization overhead on mobile devices prior to store state hydration.
2. **Ambient Gold Dust Clean-up (`LobbyAmbientBackground.tsx`)**: Removed redundant `isMobile` check inside particle effect loop (early return for `<= 1023px` already handles mobile screens).
3. **Visibility & Mobile Timer Throttling (`HeroCinematicShowcase.tsx`)**: Verified `visibilitychange` listener and `matchMedia` guards on 3.5s win ticker and 800ms live multiplier simulation loops.
4. **Automated Unit Tests (`performance-mobile.test.ts`)**: Expanded test suite to 6 unit tests validating WebGL mobile guards, ambient background guards, viewport configuration, and touch action rules.

## Verified Results

- **`npm run test`**: 25 test files passed (238 total tests)
- **`npm run lint`**: 0 errors / 0 warnings
- **`npm run build`**: 100% clean production build

## Lighthouse-Messung (Vorher/Nachher, 2026-08-09)

Messung gegen Production-Build (`next build && next start -p 3020`), je 3 Mobile-Läufe (Median), zusätzlich 1 Desktop-Lauf zur Regressionssicherung (Anforderung: kein Desktop-Verhaltenswechsel).

| Metrik                   | Vorher (Median) | Nachher (Median)                 | Delta              |
| ------------------------ | --------------- | -------------------------------- | ------------------ |
| Mobile Performance-Score | 72              | 75                               | **+3**             |
| Mobile TBT               | 314 ms          | 258 ms                           | **−56 ms (−18 %)** |
| Mobile LCP               | 5,57 s          | 5,46 s                           | −0,11 s            |
| Mobile FCP               | 0,77 s          | 0,76 s                           | ~gleich            |
| Mobile CLS               | 0,000           | 0,000                            | gleich             |
| Desktop Performance      | —               | 90 (LCP 1,08 s, TBT 6 ms, CLS 0) | keine Regression   |

Einzelwerte Vorher: perf 74/72/71 · TBT 280/314/353 ms · LCP 5,44/5,58/5,57 s.
Einzelwerte Nachher: perf 75/74/75 · TBT 262/258/244 ms · LCP 5,29/5,46/5,46 s.

### Interpretation

- **TBT −56 ms** bestätigt Befund A/D als relevanten Haupt-Thread-Blockierer: das synchrone `matchMedia`-Gate verhindert die kurzzeitige WebGL-Initialisierung (Shader-Kompilierung + Texturladen) beim allerersten Mobile-Mount, und das Pausieren der 800 ms-/3,5 s-Timer reduziert die kontinuierliche Re-Render-Last.
- **Desktop 90 / TBT 6 ms** bestätigt Anforderung #3: WebGL-Shader, Partikel und Live-Ticker laufen auf Desktop (≥1024 px) unverändert weiter.
- **LCP** nur marginal verbessert: LCP wird vom Hero-Bild `hero_vip_artwork.jpg` dominiert, das von den Runtime-Fixes nicht berührt wird (Befund E Doppel-Laden bewusst nicht behoben, siehe Limitierungen).

### Limitierungen (offen)

- **Live-Browser-Screenshot-Check (R2)** nicht ausgeführt: gstack-Browse-Chromium ließ sich in dieser Session nicht starten (hengender Startup-Sentinel, Umgebungsproblem). Lighthouse nutzt eigenes Headless-Chrome und hat Mobile + Desktop erfolgreich gerendert (LCP/FCP/CLS gemeldet) — das ist funktionaler Render-Beweis für beide Viewports, ersetzt aber keine visuelle Regression-Prüfung bei 320/375/768/1024/1920 px. Nachholbar, sobald die Browser-Tooling-Umgebung wieder startet.
- **Befund C (Dead Code `LiquidRippleCanvas`/`WebGlGlassMeshCanvas` + `src/app/v2/`)** bewusst nicht gelöscht — auf Jans Entscheidung (R4) hin "beides behalten", da `v2/` aktives unversioniertes WIP einer anderen Session ist.
- **Befund E (Doppel-Laden `hero_vip_artwork.jpg`)** nicht behoben — R6 warnt vor CORS-/Timing-Bugs beim Teilen des `next/image`-`<img>` als WebGL-Textur. Sauberer Folgeschritt: `images.formats`/Cache-Header in `next.config.ts` prüfen, Texture-Objekt separat halten. Größter Hebel für weitere LCP-Senkung.
- Alte 56/100-Zahl aus `docs/status-reports/11_PERF_MOBILE.md` war gegen die alte Homepage gefahren und ist durch die aktuelle 72→75-Messung ersetzt.
