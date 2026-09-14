# 60 — Mobile-LCP-Routenstatus

> **Status:** Messbasis für Ausführung · **Stand:** 2026-09-13 · **Scope:** alle aktuellen Nicht-Admin-Routen aus `src/app/`; `/admin/**` ist ausgenommen.
> **Messart:** kontrollierte PerformanceObserver-Labwerte, keine Lighthouse- oder Feldwerte. Eine Route ist nur bei **beiden** LCP-Läufen ≤ 2,5 s erfüllt.

## Messrahmen

Frischer Production-Build und lokaler Production-Server; Pixel 5, 4× CPU-Drosselung, 4G (150 ms Latenz, 1,6 Mbit/s Downlink, 750 kbit/s Uplink), je zwei Läufe ohne Interaktion. Erfasst wurden FCP, finaler LCP-Kandidat und dessen Ressource.

## Produktive Routen

| Route                      |     FCP L1 / L2 |     LCP L1 / L2 | Ziel | dominanter LCP-Befund                                                                        | Planungsdatei                                                               | Execution                                                                                                                                                                |
| -------------------------- | --------------: | --------------: | :--: | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                        | 1,792 / 1,636 s | 2,000 / 1,772 s |  ✅  | Hero-Text                                                                                    | —                                                                           | Verifiziert                                                                                                                                                              |
| `/auth/reset-password`     |               — |               — |  —   | ohne Recovery-Token Redirect nach `/sign-in`                                                 | —                                                                           | Nicht messbar                                                                                                                                                            |
| `/games`                   | 1,244 / 2,092 s | 1,900 / 2,176 s |  ✅  | Brand-Icon via Bild-Preload früh entdeckt                                                    | [06](../T_FRONTEND/Planungsdateien/06_mobile_lcp_games_plan.md)             | Verifiziert                                                                                                                                                              |
| `/games-2`                 | 2,280 / 0,996 s | 2,280 / 0,996 s |  ✅  | SSR-`H1` vor Motion/Hydration; keine LCP-Ressource                                           | —                                                                           | Verifiziert                                                                                                                                                              |
| `/games/blackjack`         | 1,376 / 1,368 s | 2,388 / 2,448 s |  ✅  | Brand-Icon; geringer Puffer                                                                  | —                                                                           | Verifiziert                                                                                                                                                              |
| `/games/crash`             | 1,408 / 1,492 s | 1,416 / 1,500 s |  ✅  | Mobile-Nebula-Bild, 28.992 B                                                                 | —                                                                           | Verifiziert                                                                                                                                                              |
| `/games/crash-multiplayer` | 1,920 / 1,432 s | 4,712 / 4,192 s |  🔴  | Text-LCP im mobilen Canvas-/Glass-Bühnenpfad; Canvas-RAF-Aufschub als unzureichend widerlegt | [07](../T_FRONTEND/Planungsdateien/07_mobile_lcp_crash_multiplayer_plan.md) | Ausgeführt – Ziel verfehlt: L1 4,892 s, L2 4,124 s; nächster belegter Schritt: statischen Mobile-H1-Paint vor vollständiger Spiele-Client-Hydration test-first isolieren |
| `/games/dice`              | 2,088 / 1,452 s | 2,876 / 2,512 s |  🔴  | Mobile-Felt-CSS-Ressource, 24.742 B, spät entdeckt                                           | [08](../T_FRONTEND/Planungsdateien/08_mobile_lcp_dice_plan.md)              | Geplant                                                                                                                                                                  |
| `/games/dice/v2`           | 1,448 / 1,464 s | 2,476 / 2,372 s |  ✅  | Mobile-Felt-CSS-Ressource; geringer Puffer                                                   | —                                                                           | Verifiziert                                                                                                                                                              |
| `/games/roulette`          | 1,516 / 1,496 s | 5,604 / 5,444 s |  🔴  | Text nach `mounted`-/Bühnen-Gate                                                             | [09](../T_FRONTEND/Planungsdateien/09_mobile_lcp_roulette_plan.md)          | Geplant                                                                                                                                                                  |
| `/games/slots`             | 1,356 / 1,356 s | 4,808 / 5,032 s |  🔴  | Text nach `mounted`-Gate                                                                     | [10](../T_FRONTEND/Planungsdateien/10_mobile_lcp_slots_plan.md)             | Geplant                                                                                                                                                                  |
| `/games/slots/v2`          | 1,436 / 1,480 s | 2,532 / 2,544 s |  🔴  | Brand-Icon, geringfügig über Ziel                                                            | [11](../T_FRONTEND/Planungsdateien/11_mobile_lcp_slots_v2_plan.md)          | Geplant                                                                                                                                                                  |
| `/history`                 | 1,852 / 1,708 s | 3,712 / 2,968 s |  🔴  | Brand-Icon; anonyme Datenbasis                                                               | [12](../T_FRONTEND/Planungsdateien/12_mobile_lcp_history_plan.md)           | Geplant                                                                                                                                                                  |
| `/lab`                     | 1,860 / 1,804 s | 6,828 / 5,324 s |  🔴  | Text hinter Canvas-/Preloader-Initialisierung                                                | [13](../T_FRONTEND/Planungsdateien/13_mobile_lcp_lab_plan.md)               | Geplant                                                                                                                                                                  |
| `/leaderboard`             | 1,372 / 1,576 s | 2,784 / 3,224 s |  🔴  | Brand-Icon                                                                                   | [14](../T_FRONTEND/Planungsdateien/14_mobile_lcp_leaderboard_plan.md)       | Geplant                                                                                                                                                                  |
| `/refactoring`             | 1,308 / 1,148 s | 1,308 / 1,148 s |  ✅  | Lade-Text                                                                                    | —                                                                           | Verifiziert                                                                                                                                                              |
| `/sign-in`                 | 1,808 / 1,492 s | 3,308 / 2,464 s |  🔴  | Brand-Icon; ein Lauf über Ziel                                                               | [15](../T_FRONTEND/Planungsdateien/15_mobile_lcp_sign_in_plan.md)           | Geplant                                                                                                                                                                  |
| `/sign-up`                 | 1,556 / 2,216 s | 2,908 / 3,520 s |  🔴  | Brand-Icon                                                                                   | [16](../T_FRONTEND/Planungsdateien/16_mobile_lcp_sign_up_plan.md)           | Geplant                                                                                                                                                                  |
| `/stats`                   | 1,596 / 1,644 s | 3,108 / 3,192 s |  🔴  | Brand-Icon plus Daten-/Chart-Hydration                                                       | [17](../T_FRONTEND/Planungsdateien/17_mobile_lcp_stats_plan.md)             | Geplant                                                                                                                                                                  |
| `/vault`                   | 1,408 / 1,492 s | 5,268 / 5,564 s |  🔴  | Profiltext nach `mounted`-/Daten-Gate                                                        | [18](../T_FRONTEND/Planungsdateien/18_mobile_lcp_vault_plan.md)             | Geplant                                                                                                                                                                  |
| `/v2`                      | 1,348 / 1,276 s | 1,348 / 1,276 s |  ✅  | Text                                                                                         | —                                                                           | Verifiziert                                                                                                                                                              |

## Ausführungsnachweise (2026-09-13)

### /games-2

Frischer isolierter Production-Build und lokaler Production-Server; Pixel 5, 4× CPU-Drosselung, 4G (150 ms Latenz, 1,6 Mbit/s Downlink, 750 kbit/s Uplink), ohne Interaktion. Alle Werte sind kontrollierte PerformanceObserver-Labwerte.

| Lauf |     FCP | finaler LCP | LCP-Kandidat                | LCP-Ressource | Startzeit / Dauer / Transfergröße | Requests |
| ---- | ------: | ----------: | --------------------------- | ------------- | --------------------------------- | -------: |
| 1    | 2,280 s |     2,280 s | H1 „Spiele, direkt bereit.“ | keine         | —                                 |       27 |
| 2    | 0,996 s |     0,996 s | H1 „Spiele, direkt bereit.“ | keine         | —                                 |       30 |

Änderung: Mobile rendert eine statische, funktionsfähige SSR-Grundbühne vor Motion, Parallax und Marquee. Die bisherige Desktop-Bühne bleibt unverändert.

### /games

Frischer isolierter Webpack-Production-Build (`BUILD_ID Jfj1mwT--kv3YMKEXSw1W`) und lokaler Production-Server; Pixel 5, 4× CPU-Drosselung, 4G (150 ms Latenz, 1,6 Mbit/s Downlink, 750 kbit/s Uplink), ohne Interaktion. Alle Werte sind kontrollierte PerformanceObserver-Labwerte.

| Lauf |     FCP | finaler LCP | LCP-Kandidat          | LCP-Ressource                                                | Startzeit / Dauer / Transfergröße | Requests |
| ---- | ------: | ----------: | --------------------- | ------------------------------------------------------------ | --------------------------------- | -------: |
| 1    | 1,244 s |     1,900 s | `IMG.brand-logo-tilt` | `/_next/image?url=%2Fimages%2Fbrand-ace-icon.png&w=384&q=75` | 0,285 s / 1,546 s / 45.288 B      |       83 |
| 2    | 2,092 s |     2,176 s | `IMG.brand-logo-tilt` | `/_next/image?url=%2Fimages%2Fbrand-ace-icon.png&w=384&q=75` | 0,263 s / 1,362 s / 45.288 B      |       83 |

Ursache und Änderung: Der finale Kandidat war in beiden Baseline-Läufen das zu spät entdeckte Brand-Icon. Ein gezielter Markup-Regressionstest war zuerst rot und danach grün (2/2): Ausschließlich die nicht-adminseitige `MainSidebar` lädt das vorhandene `next/image` mit `preload`; `AdminLayout` bleibt unberührt. Beide frischen PerformanceObserver-Lab-LCP-Werte liegen bei ≤ 2,5 s; die Route ist verifiziert.

### /games/crash-multiplayer

Frischer isolierter Webpack-Production-Build (`BUILD_ID H5angBF8R7lICNIBE5TAp`) und lokaler Production-Server; Pixel 5, 4× CPU-Drosselung, 4G (150 ms Latenz, 1,6 Mbit/s Downlink, 750 kbit/s Uplink), ohne Interaktion. Alle Werte sind kontrollierte PerformanceObserver-Labwerte.

| Lauf |     FCP | finaler LCP | LCP-Kandidat | LCP-Ressource | Startzeit / Dauer / Transfergröße | Requests |
| ---- | ------: | ----------: | ------------ | ------------- | --------------------------------- | -------: |
| 1    | 2,096 s |     4,892 s | `H1` `1.00x` | keine         | —                                 |       68 |
| 2    | 1,636 s |     4,124 s | `H1` `1.00x` | keine         | —                                 |       68 |

Der gezielte Canvas-Regressionstest wurde für den mobilen Leerlauf-RAF-Aufschub erst rot und nach der Änderung grün (2/2). Der Aufschub von 2,6 auf 5,0 s und der zuvor geprüfte Mobile-Backdrop-Filter-Ausschluss bringen den statischen H1 nicht unter das ≤-2,5-s-Gate. Die Route bleibt daher korrekt rot und offen; der nächste Testpfad ist ein statischer Mobile-H1-Paint vor vollständiger Spiele-Client-Hydration. Keine Screenshot- oder subjektive Sichtprüfung wurde als Abnahme verwendet.

## Testing- und Sandbox-Routen

| Route                            |     FCP L1 / L2 |     LCP L1 / L2 | Ziel | Planungsdatei                                                                   | Execution     |
| -------------------------------- | --------------: | --------------: | :--: | ------------------------------------------------------------------------------- | ------------- |
| `/testing/7.1`                   | 1,632 / 1,784 s | 1,632 / 1,784 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/7.2`                   | 1,644 / 1,632 s | 1,644 / 1,632 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/7.3`                   | 1,772 / 1,640 s | 1,772 / 1,640 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/7.4`                   | 1,416 / 1,572 s | 1,416 / 1,572 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/7.5`                   | 1,156 / 1,152 s | 1,156 / 1,152 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/7.6`                   | 1,264 / 1,284 s | 1,264 / 1,284 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/brand-showcase`        | 1,456 / 1,432 s | 1,456 / 1,432 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/fe-03-blackjack`       | 1,380 / 1,384 s | 1,380 / 1,384 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/fe-04-roulette`        | 1,224 / 1,332 s | 1,224 / 1,332 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/fe-05-dice`            | 1,088 / 1,048 s | 1,088 / 1,048 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/fe-06-crash`           | 1,120 / 1,116 s | 5,840 / 5,844 s |  🔴  | [19](../T_FRONTEND/Planungsdateien/19_mobile_lcp_testing_fe_06_crash_plan.md)   | Geplant       |
| `/testing/fe-25-big-win`         | 4,280 / 4,216 s | 4,280 / 4,216 s |  🔴  | [20](../T_FRONTEND/Planungsdateien/20_mobile_lcp_testing_fe_25_big_win_plan.md) | Geplant       |
| `/testing/fe-26-vip-tiers`       | 1,668 / 1,812 s |   kein Kandidat |  —   | —                                                                               | Nicht messbar |
| `/testing/fe-28-provably-fair`   | 1,080 / 1,056 s | 1,080 / 1,056 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/guide-sandbox`         | 1,460 / 1,020 s | 1,460 / 1,020 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/lobby-bento`           | 1,668 / 1,588 s | 1,856 / 1,740 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/lobby-bg-parallax`     | 1,032 / 1,092 s | 1,032 / 1,092 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/neon-arcade-dashboard` | 1,700 / 1,568 s | 1,700 / 1,568 s |  ✅  | —                                                                               | Verifiziert   |
| `/testing/sidebar`               | 1,188 / 1,184 s | 1,188 / 1,184 s |  ✅  | —                                                                               | Verifiziert   |

`/testing/fe-06-crash` lädt als LCP die CSS-Ressource `observatory_backdrop.jpg` (559.800 B; rund 5,0 s Übertragungszeit). `/testing/fe-25-big-win` ist effekt-/textgetrieben; `/testing/fe-26-vip-tiers` lieferte im 7-s-Fenster keinen finalen LCP-Kandidaten. Diese Sandboxes folgen nach den produktiven Routen.

## Ausführungsreihenfolge

1. `/games-2`: mobilen SSR-Hero stabil rendern; Motion, Parallax und Marquee aus dem kritischen Pfad nehmen.
2. `/games/roulette`, `/games/slots`, `/games/crash-multiplayer`: keine leere `mounted`-Startansicht; statische, funktionale Mobile-Grundbühne vor Canvas/Audio/Effekten.
3. `/games/dice`: nur die mobile Felt-Entdeckung beschleunigen und exakt einen Felt-Request sichern.
4. `/games`, Auth, History, Leaderboard und Stats: gemeinsamen Header-/Brand-Icon-Pfad und Below-the-fold-Hydration adressieren.
5. `/vault` und `/lab`: mobile Grundansicht vor Daten-, Bücherregal- bzw. Canvas-Initialisierung.
6. `/testing/fe-06-crash`: responsive Hintergrundressource erst nach den Nutzerflows.

## Messgrenzen

- `/auth/reset-password` benötigt einen gültigen Recovery-Token; ohne ihn ist nur der Redirect messbar.
- `/history`, `/stats` und `/vault` sind ohne angemeldete, repräsentative lokale Daten nur als anonyme Baseline messbar.
- Die Labwerte ersetzen weder RUM-Feldwerte noch Jans bestätigte echte Geräteabnahme.

## Verwandte Nachweise

- [frühere Behebung](../docs/archive/04_MOBILE_PERFORMANCE.md)
- [Teil-2-Referenznachweis](../docs/architecture/05_MOBILE_PERFORMANCE.md)
- [konsolidierter CWV-Status](../docs/status-reports/12_PERF_CWV_KONSOLIDIERT.md)
