# Componentry.dev Luxury Revamp: Top-Empfehlungen für Casino Royale

**Datum:** 6. September 2026  
**Status:** Architektur- & UI/UX-Audit (User-Feedback & Votum vom 6.9. eingepflegt)  
**Autor:** Antigravity (Design-Guardian & Frontend Engineering)  
**Design-Vorgabe:** _Obsidian & Gold (Ultra-Luxury, Fail-Closed Security, 60–120 FPS Motion)_  
**Referenzquelle:** [componentry.dev](https://componentry.dev/) (Harsh Jadhav)  
**Vollständiger 49-Komponenten-Katalog:** [`docs/frontend/12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md)

---

## 1. Executive Summary & Schonungslose Bestandsaufnahme

Casino Royale besitzt ein grundsolides Fundament: Next.js 16.3 App Router, React 19.2, atomare RPC-Sicherheit, strikte Fail-Closed-Transaktionen und Framer Motion 12. Die Farbpalette _Obsidian & Gold_ (`#0B0E14`, `#D4AF37`) ist im Designsystem verankert.

### Das ungeschminkte, ehrliche Urteil zum aktuellen Frontend (September 2026)

Trotz dieser soliden Basis fühlt sich das Frontend an entscheidenden Touchpoints noch **zu sehr nach einem typischen 2022/2023 Web-SaaS-Dashboard** an und noch nicht nach einem **exklusiven Monte-Carlo-Kryptocasino der Spitzenklasse** (Niveau Stake 2.0, Shuffle, Rollbit VIP oder Apple/Linear-Grade WebGL).

| Schwachstelle im aktuellen Code  | Aktueller Zustand (Ist)                                     | Was verändert sich dadurch genau? (Ziel-Zustand & UX-Impact)                                                                 |                                                                                                               Visueller Beweis (Vorher / Ist-Zustand)                                                                                                                |                                                                                                      Visueller Beweis (Nachher / Umgesetzt)                                                                                                      | Componentry-Referenz                                                                                                                                                              |                                                   Planungsdatei                                                   |     Execution      | Warum es bisher nicht luxuriös wirkt                                               | Betroffene Datei                                                                                                                                                                                           |
| :------------------------------- | :---------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------: | :----------------: | :--------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile Navigation**            | Starre 5-Icon-Leiste mit Standard-CSS-Farbumschaltung       | Schwebendes haptisches Dock mit elastischer Proximity-Vergrößerung (Apple/macOS-Gefühl); spart Viewport-Höhe.                |            [📸 **Screenshot öffnen (Mobile Navigation)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/01_weakness_mobile_nav.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/01_weakness_mobile_nav.png)             |   [📸 **Screenshot öffnen (Mobile Navigation)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/01_success_mobile_nav.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/01_success_mobile_nav.png)    | [🔗 `magnetic-dock`](https://componentry.dev/docs/components/magnetic-dock)                                                                                                       |     [📋 `23_mobile_nav_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/23_mobile_nav_magnetic_dock_plan.md)     |    🟢 Executed     | Statisch, lieblos, generische App-Vorlage ohne Haptik.                             | [`src/components/layout/MobileNav.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MobileNav.tsx)                                                                                                  |
| **Jackpot & Highroller Ticker**  | Gewöhnliche Zahl mit sanftem Zähler und simplen CSS-Glows   | Kinetisches, gestaffeltes Ziffern-Rollwerk mit Gold-Schimmer und haptischem Takt bei jedem Gewinn-Sprung.                    |          [📸 **Screenshot öffnen (Jackpot Ticker)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/02_weakness_jackpot_ticker.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/02_weakness_jackpot_ticker.png)          | [📸 **Screenshot öffnen (Jackpot Ticker)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/02_success_jackpot_ticker.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/02_success_jackpot_ticker.png) | [🔗 `kinetic-text-reveal`](https://componentry.dev/docs/components/kinetic-text-reveal)<br/>[🔗 `flipping-word-swap`](https://componentry.dev/docs/components/flipping-word-swap) |    [📋 `24_jackpot_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/24_jackpot_ticker_kinetic_reveal_plan.md)    |    🟢 Executed     | Reine Ziffern wirken wie ein Standard-Billing-Dashboard statt High-Limit-Salon.    | [`src/components/home/bento/BentoJackpotCells.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoJackpotCells.tsx)                                                                          |
| **Big Win Overlay**              | Generischer 48-Div-CSS-Konfettiregen und Text-Fade          | Interaktives 24k-Goldstaub-Partikelfeld explodiert bei Mega-Wins und reagiert physikalisch auf Touch/Cursor (60–120 FPS).    |        [📸 **Screenshot öffnen (Big Win Overlay)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/03_weakness_big_win_overlay.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/03_weakness_big_win_overlay.png)         |                                                                                                        — _(Wird bei Execution verlinkt)_                                                                                                         | [🔗 `cursor-driven-particle-typography`](https://componentry.dev/docs/components/cursor-driven-particle-typography)                                                               | [📋 `25_big_win_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/25_big_win_overlay_particle_typography_plan.md) | 🟡 Execution Ready | Starre CSS-Quadrate wirken nach Low-Budget-Template statt Dopamin-Explosion.       | [`src/components/casino/BigWinOverlay.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/BigWinOverlay.tsx)                                                                                          |
| **VIP- & Tier-System**           | Tabellen, statische Listen und simple Fortschrittsbalken    | Rotierende, dreidimensionale Club-Mitgliedskarten (Bronze bis Obsidian) mit Tiefenschärfe und erhabener Metallprägung.       |               [📸 **Screenshot öffnen (VIP Tier Modal)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/04_weakness_vip_tiers.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/04_weakness_vip_tiers.png)               |                                                                                                        — _(Wird bei Execution verlinkt)_                                                                                                         | [🔗 `orbit-card-stack`](https://componentry.dev/docs/components/orbit-card-stack)<br/>[🔗 `newsletter-bookshelf`](https://componentry.dev/docs/components/newsletter-bookshelf)   |    [📋 `26_vip_tiers_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/26_vip_tiers_orbit_card_stack_plan.md)     | 🟡 Execution Ready | Flache Listenreihen erzeugen keine Sammler-Begierde und kein elitäres Club-Gefühl. | [`src/components/casino/RankBenefitsModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/RankBenefitsModal.tsx), [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx) |
| **Game Cards & Lobby**           | Standardmäßiges `rotateX/Y` Mousemove-Tilt ohne Glanzkanten | Metallischer Lichtreflex wandert exakt entlang des Cursor-Vektors über das Artwork; wirkt wie eine versiegelte Sammlerkarte. |                 [📸 **Screenshot öffnen (Game Card)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/05_weakness_game_card.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/05_weakness_game_card.png)                  |                                                                                                        — _(Wird bei Execution verlinkt)_                                                                                                         | [🔗 `hover-transition`](https://componentry.dev/docs/components/hover-transition)                                                                                                 |   [📋 `27_game_cards_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/27_game_cards_hover_transition_plan.md)    | 🟡 Execution Ready | Simples 3D-Tilt ohne Lichtbrechung, Glanzstreifen oder Tiefenschärfe.              | [`src/app/games/_components/ElevatedGameCard.tsx`](file:///v:/VibeCoding/Casino/src/app/games/_components/ElevatedGameCard.tsx)                                                                            |
| **Provably Fair Visualizer**     | Textwüsten mit SHA-256 Hash-Strings und Inputs              | Kryptografische Integrität wird als leuchtende Leiterplatten-Spur mit ablenkbaren Magnetlinien visuell beglaubigt.           |         [📸 **Screenshot öffnen (Provably Fair Tool)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/06_weakness_provably_fair.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/06_weakness_provably_fair.png)         |                                                                                                        — _(Wird bei Execution verlinkt)_                                                                                                         | [🔗 `circuit-board`](https://componentry.dev/docs/components/circuit-board)<br/>[🔗 `magnet-lines`](https://componentry.dev/docs/components/magnet-lines)                         |  [📋 `28_provably_fair_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/28_provably_fair_circuit_board_plan.md)  | 🟡 Execution Ready | Abstrakte Hash-Strings wirken wie ein Linux-Terminal oder Entwickler-Debugger.     | [`src/components/casino/ProvablyFairTool.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/ProvablyFairTool.tsx)                                                                                    |
| **Hintergründe & Ambient Light** | Statische CSS-Radial-Gradients mit Unschärfe                | Flüssigmetall-Shader (geschmolzenes 24k-Gold & Obsidian) erzeugt lebendigen Salon-Glanz bei minimalem GPU-Overhead.          | [📸 **Screenshot öffnen (Lobby Ambient Background)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/07_weakness_ambient_background.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/07_weakness_ambient_background.png) |                                                                                                        — _(Wird bei Execution verlinkt)_                                                                                                         | [🔗 `liquid-chrome`](https://componentry.dev/docs/components/liquid-chrome)<br/>[🔗 `webgl-liquid`](https://componentry.dev/docs/components/webgl-liquid)                         |  [📋 `29_ambient_light_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/29_ambient_light_liquid_chrome_plan.md)  | 🟡 Execution Ready | Statische Unschärfe führt zu Compositing-Overhead ohne echte Lebendigkeit.         | [`src/components/home/LobbyAmbientBackground.tsx`](file:///v:/VibeCoding/Casino/src/components/home/LobbyAmbientBackground.tsx)                                                                            |

---

### Batch 2 (Prio 2): Die 10 weiteren Top signifikantesten Hebel

Ergänzend zu den 7 Kern-Schwachstellen (Batch 1) wurden die nächsten 10 Hebel mit dem höchsten visuellen und haptischen Impact evaluiert. Diese kombinieren bisher ungenutzte Top-Komponenten aus dem 49-Komponenten-Katalog mit zielgerichteten Erweiterungen (u. a. Desktop-Navigation):

| #      | Bereich / Touchpoint                     | Aktueller Zustand (Ist)                                   | Was verändert sich dadurch genau? (Ziel-Zustand & UX-Impact)                                                                |                                                                                                                     Visueller Beweis (Vorher)                                                                                                                     |    Visueller Beweis (Nachher)     | Componentry-Referenz                                                                      |                                                     Planungsdatei                                                      |     Execution      |         Typ          | Warum es den Luxusfaktor massiv hebt                                                  | Betroffene Datei                                                                                                                          |
| ------ | ---------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------: | ----------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------: | :----------------: | :------------------: | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **08** | **Desktop Header & Quick Navigation**    | Statische Menü-Links & Standard-Buttons im Desktop-Header | Subtiler schwebender Schnellzugriff-Dock mit sanftem Proximity-Hover (weniger radikal als Mobile, edle Pill-Form im Header) |        [📸 **Screenshot öffnen (Desktop Header)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/08_weakness_desktop_header.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/08_weakness_desktop_header.png)         | — _(Wird bei Execution verlinkt)_ | [🔗 `magnetic-dock`](https://componentry.dev/docs/components/magnetic-dock)               |   [📋 `30_desktop_header_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/30_desktop_header_magnetic_dock_plan.md)    | 🟡 Execution Ready |   Wiederverwendung   | Verleiht der Desktop-Experience ein taktiles, haptisches Apple/macOS-Gefühl           | [`src/components/layout/MainHeader.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MainHeader.tsx)                               |
| **09** | **Casino Royale Marken-Wappen & Logo**   | Statisches PNG-Bild (`brand-ace-icon.png`) mit CSS-Tilt   | Partikel-Canvas: Das Logo löst sich bei Hover in feine Gold-Dither-Partikel auf und formiert sich neu                       |              [📸 **Screenshot öffnen (Brand Logo)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/09_weakness_brand_logo.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/09_weakness_brand_logo.png)               | — _(Wird bei Execution verlinkt)_ | [🔗 `dithered-logo`](https://componentry.dev/docs/components/dithered-logo)               |     [📋 `31_brand_logo_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/31_brand_logo_dithered_particles_plan.md)     | 🟡 Execution Ready | Neu (Favorit ⭐⭐⭐) | Maximaler Wiedererkennungswert; wirkt wie ein lebendiges High-End-Emblem              | [`src/components/layout/MainSidebar.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MainSidebar.tsx)                             |
| **10** | **Spielauswahl & Featured Wheel**        | Statisches horizontales Grid oder Listen                  | Interaktive 3D-Zylinderwalze zum Durchdrehen der Top-Spiele & Daily Bonus Wheel                                             |         [📸 **Screenshot öffnen (Games Catalog)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/10_weakness_wheel_carousel.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/10_weakness_wheel_carousel.png)         | — _(Wird bei Execution verlinkt)_ | [🔗 `wheel-carousel`](https://componentry.dev/docs/components/wheel-carousel)             |   [📋 `32_wheel_carousel_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/32_games_featured_wheel_carousel_plan.md)   | 🟡 Execution Ready | Neu (Favorit ⭐⭐⭐) | Triggert das haptische Gefühl einer echten Casino-Roulette- oder Slot-Walze           | [`src/app/games/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx)                                                           |
| **11** | **Hall of Fame & Größte Wochengewinne**  | Standardmäßige Kacheln in der Bento-Lobby                 | Vertikal geschwungene 3D-Doppelhelix (Spiral Stage) für die ewige Gewinnerliste                                             |       [📸 **Screenshot öffnen (Hall of Fame)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/11_weakness_spiral_3d_slider.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/11_weakness_spiral_3d_slider.png)        | — _(Wird bei Execution verlinkt)_ | [🔗 `spiral-3d-slider`](https://componentry.dev/docs/components/spiral-3d-slider)         |   [📋 `33_spiral_slider_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/33_hall_of_fame_spiral_3d_slider_plan.md)    | 🟡 Execution Ready | Neu (Favorit ⭐⭐⭐) | Spektakuläre 3D-Bühne; zelebriert High-Roller-Erfolge in Museumsqualität              | [`src/components/home/bento/BentoArcadeCells.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoArcadeCells.tsx)           |
| **12** | **Crash Game Arena Backdrop**            | Statischer dunkler Hintergrund mit simpler Graph-Linie    | Reaktives Partikel-Pixel-Feld, das mit der Raketenbeschleunigung pulsiert und auf Klicks reagiert                           |          [📸 **Screenshot öffnen (Crash Arena)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/12_weakness_crash_backdrop.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/12_weakness_crash_backdrop.png)          | — _(Wird bei Execution verlinkt)_ | [🔗 `pixel-canvas`](https://componentry.dev/docs/components/pixel-canvas)                 | [📋 `34_crash_backdrop_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/34_crash_arena_pixel_canvas_backdrop_plan.md) | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Erzeugt Cyberpunk-/High-Stakes-Atmosphäre in der intensivsten Casino-Arena            | [`src/app/games/crash/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/crash/page.tsx)                                               |
| **13** | **VIP Club Magazin & Benefits-Bücher**   | Vertikale Textlisten im VIP-Vault                         | Dreidimensionales rotierendes Luxus-Bücherregal zum Durchblättern von Rakeback- und Club-Vorteilen                          | [📸 **Screenshot öffnen (VIP Tier Showcase)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/13_weakness_newsletter_bookshelf.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/13_weakness_newsletter_bookshelf.png) | — _(Wird bei Execution verlinkt)_ | [🔗 `newsletter-bookshelf`](https://componentry.dev/docs/components/newsletter-bookshelf) |      [📋 `35_bookshelf_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/35_vip_vault_bookshelf_magazine_plan.md)      | 🟡 Execution Ready | Neu (Favorit ⭐⭐⭐) | Exklusives Clubhaus-Gefühl; macht VIP-Tiers zu haptischen Sammlerobjekten             | [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)                                                           |
| **14** | **Bonus-Enthüllung & Promo-Einlösung**   | Simples Input-Feld mit "Redeem"-Button                    | 3-teilige faltbare Spalt-Karte, die sich bei gültigem Code mit Goldglanz spektakulär entfaltet                              |     [📸 **Screenshot öffnen (Promo Redeem Card)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/14_weakness_promo_split_card.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/14_weakness_promo_split_card.png)     | — _(Wird bei Execution verlinkt)_ | [🔗 `scroll-split-card`](https://componentry.dev/docs/components/scroll-split-card)       |  [📋 `36_promo_split_card_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/36_promo_code_scroll_split_card_plan.md)   | 🟡 Execution Ready | Neu (Favorit ⭐⭐⭐) | Macht das Einlösen von Boni zu einem feierlichen Belohnungserlebnis                   | [`src/components/casino/vault/VaultRedeemCard.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/vault/VaultRedeemCard.tsx)         |
| **15** | **Tischfilz & Action-Button Feedback**   | Standard CSS-Active Scale auf Bet-Buttons                 | WebGL Brechungswelle (Image Ripple Effect), die sich bei Klick über den Tisch ausbreitet                                    |  [📸 **Screenshot öffnen (Game Action Button)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/15_weakness_game_action_button.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/15_weakness_game_action_button.png)   | — _(Wird bei Execution verlinkt)_ | [🔗 `image-ripple-effect`](https://componentry.dev/docs/components/image-ripple-effect)   |     [📋 `37_action_button_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/37_action_button_image_ripple_plan.md)     | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Fühlt sich an wie echter, physikalischer Druck auf einen edlen Monte-Carlo-Spieltisch | [`src/components/casino/controls/GameActionButton.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/controls/GameActionButton.tsx) |
| **16** | **Royal Obsidian VIP-Beitritts-Urkunde** | Schlichtes Pop-up bei Rangaufstieg                        | Animierter Vektor-Unterschriftszug in flüssigem Gold als Beglaubigung des neuen Rangs                                       |     [📸 **Screenshot öffnen (VIP Benefits Modal)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/16_weakness_vip_certificate.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/16_weakness_vip_certificate.png)      | — _(Wird bei Execution verlinkt)_ | [🔗 `signature`](https://componentry.dev/docs/components/signature)                       | [📋 `38_vip_certificate_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/38_vip_certificate_vector_signature_plan.md) | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Verleiht Rangaufstiegen das Gewicht eines unterschriebenen High-Roller-Vertrags       | [`src/components/casino/RankBenefitsModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/RankBenefitsModal.tsx)                 |
| **17** | **Interactive Headline & Text-Repel**    | Statische Textzeilen im Hero-Showcase                     | Buchstaben weichen dem Cursor dynamisch aus und federn mit Trägheit zurück                                                  |        [📸 **Screenshot öffnen (Hero Headline)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/17_weakness_hero_text_repel.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/17_weakness_hero_text_repel.png)        | — _(Wird bei Execution verlinkt)_ | [🔗 `text-repel`](https://componentry.dev/docs/components/text-repel)                     |       [📋 `39_text_repel_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/39_hero_headline_text_repel_plan.md)        | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Sofortiges Wow-Gefühl beim ersten Betreten der Homepage                               | [`src/components/home/HeroCinematicShowcase.tsx`](file:///v:/VibeCoding/Casino/src/components/home/HeroCinematicShowcase.tsx)             |

---

### Batch 3 (Prio 3): 10 weitere signifikante Hebel (Neue Elemente & Scroll-Dopamin)

Batch 3 erschließt bisher noch völlig ungenutzte Componentry-Elemente aus Kategorie 1, 2, 4 und 5 für interaktive Spiel-Zustände, Storytelling und Trust-Aufbau:

| #      | Bereich / Touchpoint                       | Aktueller Zustand (Ist)                        | Was verändert sich dadurch genau? (Ziel-Zustand & UX-Impact)                        |                                                                                                                      Visueller Beweis (Vorher)                                                                                                                       |    Visueller Beweis (Nachher)     | Componentry-Referenz                                                                        |                                                        Planungsdatei                                                        |     Execution      |         Typ          | Warum es den Luxusfaktor massiv hebt                                       | Betroffene Datei                                                                                                                  |
| ------ | ------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------: | ------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------: | :----------------: | :------------------: | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **18** | **Sicherheits- & Auszahlungs-Audits**      | Trockene statische Infotexte im Footer/Modal   | Interaktiver 3D-Kartenstapel, der Sicherheitszertifikate beim Scrollen umblättert   |       [📸 **Screenshot öffnen (Sicherheits-Audits)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/18_weakness_security_audits.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/18_weakness_security_audits.png)       | — _(Wird bei Execution verlinkt)_ | [🔗 `case-study-flip-stack`](https://componentry.dev/docs/components/case-study-flip-stack) | [📋 `40_security_audits_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/40_security_audits_case_study_flip_stack_plan.md) | 🟡 Execution Ready | Neu (Favorit ⭐⭐⭐) | Belegt Auszahlungssicherheit mit haptischem Storytelling                   | [`src/components/layout/Footer.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/Footer.tsx)                               |
| **19** | **VIP Onboarding & Feature-Tour**          | Statisches mehrseitiges Modal mit Vor/Zurück   | Flüssige Scroll-Choreografie mit ebenen-versetzter Skalierung der Casino-Vorteile   |         [📸 **Screenshot öffnen (VIP Onboarding)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/19_weakness_onboarding_flow.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/19_weakness_onboarding_flow.png)         | — _(Wird bei Execution verlinkt)_ | [🔗 `sticky-scroll-cards`](https://componentry.dev/docs/components/sticky-scroll-cards)     |   [📋 `41_vip_onboarding_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/41_vip_onboarding_sticky_scroll_cards_plan.md)   | 🟡 Execution Ready | Neu (Favorit ⭐⭐⭐) | Führt Neukunden cineastisch wie ein exklusiver VIP-Host ein                | [`src/components/layout/OnboardingFlow.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/OnboardingFlow.tsx)               |
| **20** | **Casino Originals Entdecker-Leiste**      | Standardmäßiges horizontales Überlauf-Scrollen | Haptisches "Surfen" durch Spiele mit träger Zeigerphysik und dynamischem Fokus      | [📸 **Screenshot öffnen (Originals Entdecker-Leiste)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/20_weakness_collection_surfer.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/20_weakness_collection_surfer.png) | — _(Wird bei Execution verlinkt)_ | [🔗 `collection-surfer`](https://componentry.dev/docs/components/collection-surfer)         |     [📋 `42_originals_bar_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/42_originals_bar_collection_surfer_plan.md)     | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Schnelles, butterweiches Durchstöbern der hauseigenen Spiele               | [`src/app/games/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx)                                                   |
| **21** | **Spielekatalog Perspektiven-Raster**      | Flaches 2D-Gitter in der Hauptübersicht        | Perspektivisch gekipptes 3D-Raster, das sich sanft zur Blickrichtung neigt          |   [📸 **Screenshot öffnen (Spielekatalog Raster)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/21_weakness_scroll_tilted_grid.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/21_weakness_scroll_tilted_grid.png)   | — _(Wird bei Execution verlinkt)_ | [🔗 `scroll-tilted-grid`](https://componentry.dev/docs/components/scroll-tilted-grid)       |       [📋 `43_games_grid_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/43_games_grid_scroll_tilted_grid_plan.md)        | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Verleiht der Spieleauswahl architektonische Tiefe wie in einem Casino-Saal | [`src/app/games/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx)                                                   |
| **22** | **Währungs- & Wallet-Umschalter**          | Schnitteffekt bei Zahlenwechsel im Header      | Fließender SVG-Morphing-Übergang zwischen Währungszeichen und Ziffern               |            [📸 **Screenshot öffnen (Wallet-Umschalter)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/22_weakness_text_morph.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/22_weakness_text_morph.png)             | — _(Wird bei Execution verlinkt)_ | [🔗 `text-morph`](https://componentry.dev/docs/components/text-morph)                       |        [📋 `44_wallet_switch_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/44_wallet_switch_text_morph_plan.md)         | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Eleganter, nahtloser Übergang beim Wechsel von Coins zu Cash               | [`src/components/layout/MainHeader.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MainHeader.tsx)                       |
| **23** | **Multiplikator- & Jackpot-Ankündigungen** | Gewöhnlicher Text-Pop-in                       | Kaskadierender Buchstabenfall mit elastischer Federkraft Buchstabe für Buchstabe    |      [📸 **Screenshot öffnen (Jackpot-Ankündigungen)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/23_weakness_letter_cascade.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/23_weakness_letter_cascade.png)       | — _(Wird bei Execution verlinkt)_ | [🔗 `letter-cascade`](https://componentry.dev/docs/components/letter-cascade)               |     [📋 `45_jackpot_banner_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/45_jackpot_banner_letter_cascade_plan.md)      | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Steigert den Nervenkitzel bei Live-Events und Rundenstarts                 | [`src/components/casino/jackpot/JackpotBanner.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/jackpot/JackpotBanner.tsx) |
| **24** | **Landing-Page Story-Choreografie**        | Statische Bento-Kacheln auf der Homepage       | Bild- und Textebenen synchronisieren sich dynamisch mit dem Scroll-Fortschritt      |   [📸 **Screenshot öffnen (Story-Choreografie)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/24_weakness_scroll_choreography.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/24_weakness_scroll_choreography.png)   | — _(Wird bei Execution verlinkt)_ | [🔗 `scroll-choreography`](https://componentry.dev/docs/components/scroll-choreography)     | [📋 `46_story_choreography_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/46_landing_story_scroll_choreography_plan.md)  | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Erzählt die Casino-Storyline mit nahtloser cinematografischer Regie        | [`src/components/home/LobbySectionHeader.tsx`](file:///v:/VibeCoding/Casino/src/components/home/LobbySectionHeader.tsx)           |
| **25** | **Tastatur-Shortcuts Cheat-Sheet**         | Einfache Textliste in den Spieleinstellungen   | Haptisches 3D-Tastatur-Modell mit aufleuchtenden Tasten bei Betätigung (1–5, Space) |          [📸 **Screenshot öffnen (Tastatur-Shortcuts)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/25_weakness_mac_keyboard.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/25_weakness_mac_keyboard.png)          | — _(Wird bei Execution verlinkt)_ | [🔗 `mac-keyboard`](https://componentry.dev/docs/components/mac-keyboard)                   |          [📋 `47_mac_keyboard_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/47_shortcuts_mac_keyboard_plan.md)          | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Professionelles Power-User-Tool für High-Speed-Wettende                    | [`src/components/layout/NavigationShortcuts.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/NavigationShortcuts.tsx)     |
| **26** | **High-Roller VIP Lounge Hintergrund**     | Dunkler einfarbiger Backdrop im VIP-Bereich    | Prismen-Lichtbrechungs-Mesh mit funkelnden diamantenen Reflexen                     |      [📸 **Screenshot öffnen (VIP Lounge Hintergrund)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/26_weakness_prism_gradient.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/26_weakness_prism_gradient.png)      | — _(Wird bei Execution verlinkt)_ | [🔗 `prism-gradient`](https://componentry.dev/docs/components/prism-gradient)               |       [📋 `48_prism_gradient_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/48_vip_lounge_prism_gradient_plan.md)        | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Verleiht dem High-Limit-Bereich die Aura eines Schweizer Tresorraums       | [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)                                                   |
| **27** | **Rundenübergänge & Game-Reset**           | Plötzlicher Canvas-Clear zwischen Runden       | Chromatische Aberrations-Welle zentriert vom Auslöser-Klick                         |      [📸 **Screenshot öffnen (Rundenübergänge)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/27_weakness_ripple_transition.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/27_weakness_ripple_transition.png)       | — _(Wird bei Execution verlinkt)_ | [🔗 `ripple-transition`](https://componentry.dev/docs/components/ripple-transition)         |       [📋 `49_ripple_transition_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/49_round_transition_ripple_plan.md)       | 🟡 Execution Ready |   Neu (Katalog ⚪)   | Macht Rundenwechsel zu einem spürbaren physikalischen Ereignis             | [`src/components/casino/GameLayout.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/GameLayout.tsx)                       |

---

### Batch 4 (Prio 4): 10 weitere signifikante Hebel (Vertiefende Veredelungen & Sekundär-Flächen)

Batch 4 komplettiert das Casino durch gezielte Zweiteinsätze der stärksten Kern-Komponenten auf spezifischen Subseiten sowie letzte atmosphärische Akzente:

| #      | Bereich / Touchpoint                       | Aktueller Zustand (Ist)                        | Was verändert sich dadurch genau? (Ziel-Zustand & UX-Impact)                 |                                                                                                                      Visueller Beweis (Vorher)                                                                                                                      |    Visueller Beweis (Nachher)     | Componentry-Referenz                                                                                                |                                                        Planungsdatei                                                         |     Execution      |         Typ          | Warum es den Luxusfaktor massiv hebt                                        | Betroffene Datei                                                                                                                        |
| ------ | ------------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------- | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------: | ------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------: | :----------------: | :------------------: | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **28** | **Live-Chat Drawer Quick-Bar**             | Flache Leiste mit Standard-Buttons im Chat     | Haptisches Mini-Dock für Emojis, Wetten-Teilen und VIP-Trinkgeld             |              [📸 **Screenshot öffnen (Chat Quick-Bar)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/28_weakness_chat_dock.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/28_weakness_chat_dock.png)               | — _(Wird bei Execution verlinkt)_ | [🔗 `magnetic-dock`](https://componentry.dev/docs/components/magnetic-dock)                                         |      [📋 `50_chat_quick_bar_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/50_chat_quick_bar_magnetic_dock_plan.md)       | 🟡 Execution Ready |   Wiederverwendung   | Chat-Interaktionen fühlen sich geschmeidig und reaktionsschnell an          | [`src/components/chat/ChatDrawer.tsx`](file:///v:/VibeCoding/Casino/src/components/chat/ChatDrawer.tsx)                                 |
| **29** | **Leaderboard Rang-Karten**                | Einfache Listenreihen der Top-3-Spieler        | Schwebende 3D-Karten mit Gold-/Platin-Prägung für die Podestplätze 1 bis 3   | [📸 **Screenshot öffnen (Leaderboard Rang-Karten)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/29_weakness_leaderboard_podium.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/29_weakness_leaderboard_podium.png) | — _(Wird bei Execution verlinkt)_ | [🔗 `orbit-card-stack`](https://componentry.dev/docs/components/orbit-card-stack)                                   | [📋 `51_leaderboard_podium_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/51_leaderboard_podium_orbit_card_stack_plan.md) | 🟡 Execution Ready |   Wiederverwendung   | Zelebriert die Champions wie echte Trophäen-Inhaber                         | [`src/app/leaderboard/page.tsx`](file:///v:/VibeCoding/Casino/src/app/leaderboard/page.tsx)                                             |
| **30** | **Stats-Dashboard Gewinn-Zähler**          | Statische Ziffern für All-Time-Profit          | Kinetisches Ziffern-Rollwerk mit Gold-Glow bei Gewinnzuwachs                 |      [📸 **Screenshot öffnen (Stats-Dashboard Zähler)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/30_weakness_stats_counter.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/30_weakness_stats_counter.png)       | — _(Wird bei Execution verlinkt)_ | [🔗 `kinetic-text-reveal`](https://componentry.dev/docs/components/kinetic-text-reveal)                             |       [📋 `52_stats_counter_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/52_stats_counter_kinetic_reveal_plan.md)       | 🟡 Execution Ready |   Wiederverwendung   | Macht die eigene Erfolgsstatistik zu einem lebendigen High-Score-Erlebnis   | [`src/app/stats/page.tsx`](file:///v:/VibeCoding/Casino/src/app/stats/page.tsx)                                                         |
| **31** | **Blackjack Kartentisch Ambient-Backdrop** | Statischer grüner Filz-Hintergrund             | Zarter, flüssiger Gold- und Smaragd-Shader mit minimaler Viskosität          | [📸 **Screenshot öffnen (Blackjack Table Backdrop)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/31_weakness_blackjack_ambient.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/31_weakness_blackjack_ambient.png)  | — _(Wird bei Execution verlinkt)_ | [🔗 `webgl-liquid`](https://componentry.dev/docs/components/webgl-liquid)                                           |     [📋 `53_blackjack_ambient_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/53_blackjack_table_webgl_liquid_plan.md)     | 🟡 Execution Ready | Neu (Bestätigt ⭐⭐) | Erzeugt die intime VIP-Atmosphäre eines privaten Blackjack-Salons           | [`src/app/games/blackjack/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/blackjack/page.tsx)                                     |
| **32** | **Community-Gewinnerwand**                 | Endlose statische Tabelle der letzten Gewinner | Interaktives 2D-Flächenraster mit Fisheye-Verzerrung bei Cursor-Nähe         |          [📸 **Screenshot öffnen (Gewinnerwand Grid)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/32_weakness_history_grid.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/32_weakness_history_grid.png)          | — _(Wird bei Execution verlinkt)_ | [🔗 `fisheye-infinite-grid`](https://componentry.dev/docs/components/fisheye-infinite-grid)                         |         [📋 `54_history_grid_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/54_history_wall_fisheye_grid_plan.md)         | 🟡 Execution Ready |   Neu (Neutral ⚪)   | Spieler können haptisch durch tausende Gewinner scrollen und stöbern        | [`src/app/history/page.tsx`](file:///v:/VibeCoding/Casino/src/app/history/page.tsx)                                                     |
| **33** | **Live-Wetten Ticker & Rollen**            | Gewöhnliche Zahlenreihe der letzten Runden     | Kinetisches Wort- & Symbol-Flipwerk für schnelle Wettrunden                  |       [📸 **Screenshot öffnen (Live-Wetten Ticker)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/33_weakness_live_bets_flip.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/33_weakness_live_bets_flip.png)        | — _(Wird bei Execution verlinkt)_ | [🔗 `flipping-word-swap`](https://componentry.dev/docs/components/flipping-word-swap)                               |         [📋 `55_live_bets_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/55_live_bets_flipping_word_swap_plan.md)         | 🟡 Execution Ready |   Wiederverwendung   | Sorgt für flüssigen visuellen Puls bei jeder neu platzierten Wette          | [`src/components/home/bento/BentoLiveWinsCell.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoLiveWinsCell.tsx)       |
| **34** | **Admin Dashboard KPI-Header**             | Trockenes BI-Dashboard mit statischen Zahlen   | Partikel-Typografie für GGR- und VIP-Meilensteine                            |      [📸 **Screenshot öffnen (Admin KPI-Header)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/34_weakness_admin_kpi_header.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/34_weakness_admin_kpi_header.png)       | — _(Wird bei Execution verlinkt)_ | [🔗 `cursor-driven-particle-typography`](https://componentry.dev/docs/components/cursor-driven-particle-typography) |        [📋 `56_admin_kpi_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/56_admin_kpi_particle_typography_plan.md)         | 🟡 Execution Ready |   Wiederverwendung   | Verleiht dem administrativen Backend dieselbe Exklusivität wie dem Casino   | [`src/app/admin/overview/page.tsx`](file:///v:/VibeCoding/Casino/src/app/admin/overview/page.tsx)                                       |
| **35** | **Footer CTA & Community-Abschluss**       | Schlichter dunkler Kasten vor dem Footer       | Atmosphärisches Plasma-Feld mit tiefem Obsidian- und Goldglimmen             | [📸 **Screenshot öffnen (Footer CTA Plasma)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/35_weakness_footer_closing_plasma.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/35_weakness_footer_closing_plasma.png) | — _(Wird bei Execution verlinkt)_ | [🔗 `closing-plasma`](https://componentry.dev/docs/components/closing-plasma)                                       |          [📋 `57_footer_plasma_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/57_footer_closing_plasma_plan.md)           | 🟡 Execution Ready | Neu (In Ordnung ⚪)  | Edler visueller Ausklang am Ende der Hauptseite                             | [`src/components/layout/Footer.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/Footer.tsx)                                     |
| **36** | **Wett-Modus Umschalter (Auto/Manual)**    | Simple HTML-Radio-Tabs                         | Haptischer 3D-Perspektiven-Flip mit spürbarem Klick-Feedback                 |          [📸 **Screenshot öffnen (Wett-Modus Tabs)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/36_weakness_bet_mode_tabs.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/36_weakness_bet_mode_tabs.png)          | — _(Wird bei Execution verlinkt)_ | [🔗 `flipping-word-swap`](https://componentry.dev/docs/components/flipping-word-swap)                               |         [📋 `58_bet_mode_tabs_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/58_bet_mode_tabs_flip_swap_plan.md)          | 🟡 Execution Ready |   Wiederverwendung   | Haptische Trennung zwischen strategischem Auto-Bet und schnellem Manual-Bet | [`src/components/casino/controls/BetControlPanel.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/controls/BetControlPanel.tsx) |
| **37** | **Dynamic Ambient Glow in Bento-Cards**    | Flache statische Box-Shadows auf Kacheln       | Subtiler WebGL-Perlin-Noise Gold-Glimmer hinter den wichtigsten Bento-Karten |   [📸 **Screenshot öffnen (Bento Ambient Glow)**](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/37_weakness_bento_ambient_glow.png)<br/><br/>[Link zum Bild](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/37_weakness_bento_ambient_glow.png)    | — _(Wird bei Execution verlinkt)_ | [🔗 `animated-gradient`](https://componentry.dev/docs/components/animated-gradient)                                 |        [📋 `59_bento_glow_plan.md`](file:///v:/VibeCoding/Casino/T_FRONTEND/59_bento_cards_animated_gradient_plan.md)        | 🟡 Execution Ready | Neu (In Ordnung ⚪)  | Verhindert flache Kanten und verleiht dem Lobby-Raster lebendige Konturen   | [`src/components/home/bento/BentoCell.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoCell.tsx)                       |

---

## 2. Die Top Componentry-Empfehlungen (Mit User-Votum)

Die Komponentenbibliothek **Componentry** zeichnet sich durch erstklassiges Motion-Design auf Basis von **React, Tailwind CSS und Framer Motion bzw. nativen WebGL-Shadern** aus. Alle Komponenten sind Copy-Paste-fertig und lassen sich ohne aufgeblähte Fremdbibliotheken nativ in unser Design-System integrieren.

---

### Cluster A: Taktile High-Roller-Ticker & Zahlen-Dopamin

#### 1. Split-Flap Display (`split-flap-display`) — ❌ VOM USER ABGELEHNT

- **User-Votum:** ❌ _Abgelehnt („gefällt mir nicht so gut, ein bisschen langweilig“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/split-flap-display`](https://componentry.dev/docs/components/split-flap-display)
- **Status:** Archiviert und aus der aktiven Umsetzungsliste entfernt.

---

#### 2. Particle Typography (`cursor-driven-particle-typography`) — ⭐⭐ BESTÄTIGT

- **User-Votum:** ⭐⭐ _Bestätigt („finde ich auf jeden Fall in Ordnung, beibehalten“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/cursor-driven-particle-typography`](https://componentry.dev/docs/components/cursor-driven-particle-typography)
- **Einbauort im Casino:**
  - [`src/components/casino/BigWinOverlay.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/BigWinOverlay.tsx)
  - Hero-Banner-Headline in [`src/components/home/HeroCinematicShowcase.tsx`](file:///v:/VibeCoding/Casino/src/components/home/HeroCinematicShowcase.tsx)
- **Schonungslose Kritik des Ist-Zustands:**  
  Derzeit fallen bei einem Big Win 48 vordefinierte, starre CSS-Divs von oben nach unten. Jeder Entwickler sieht sofort: Das ist ein 08/15 Standard-Overlay.
- **Das Luxus-Upgrade:**  
  Die Siegersumme (z. B. `$25,480.00`) oder der Schriftzug „MEGA WIN“ wird aus tausenden glänzenden Goldpartikeln auf einem Canvas generiert. Wenn der Nutzer mit der Maus darüberfährt oder tippt, zerstäuben die Partikel physikalisch wie 24-Karat-Goldstaub und formieren sich per Federphysik blitzschnell wieder zur Zahl.
- **Technische Integration:**
  - HTML5 2D Canvas mit Offscreen-Rendering für 60 FPS auch auf Mobilgeräten.
  - Spring-Physics-Algorithmus steuert Rückkehrvektoren der Partikel.
- **Option-Gate (Jan-Schema):**  
  _Option 1:_ Nur der Multiplikator-Text zerstäubt bei Hover.  
  _Option 2 (Empfohlen):_ Big-Win-Gewinnbetrag als interaktiver Goldstaub im Modal mit automatischem Partikelausstoß bei Win-Reveal.  
  _Option 3:_ Permanenter Partikel-Effekt im gesamten Header der Startseite.

---

#### 3. Kinetic Text Reveal & Letter Cascade (`kinetic-text-reveal` & `letter-cascade`) — ⭐⭐ BESTÄTIGT

- **User-Votum:** ⭐⭐ _Bestätigt („gefällt mir insbesondere gut“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/kinetic-text-reveal`](https://componentry.dev/docs/components/kinetic-text-reveal) & [`https://componentry.dev/docs/components/letter-cascade`](https://componentry.dev/docs/components/letter-cascade)
- **Einbauort im Casino:**
  - Status-Overlays in Spielen: Crash (`crashed @ 12.4x`), Blackjack (`DEALER BUSTS`), Roulette (`NO MORE BETS`) in [`src/app/games/[game]/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games)
- **Schonungslose Kritik des Ist-Zustands:**  
  Statusänderungen schalten abrupt um oder nutzen einfache Fade-Ins. In Momenten höchster Anspannung (z. B. Crash-Explosion) fehlt die filmische Dramatik.
- **Das Luxus-Upgrade:**  
  Buchstaben schießen mit direktionaler Unschärfe (`blur(8px)` zu `blur(0px)`) und dynamischem Staggering federnd ein. Das Wort dehnt sich minimal aus und rastet mit sattem Haptik-Timing ein.
- **Technische Integration:**
  - Framer Motion 12 `variants` mit Stagger-Children und CSS-Filters.

---

#### 4. Text Morph & Flipping Word Swap (`text-morph` & `flipping-word-swap`) — ⭐⭐ BESTÄTIGT

- **User-Votum:** ⭐⭐ _Bestätigt („finde ich ebenfalls sehr gut, beibehalten“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/text-morph`](https://componentry.dev/docs/components/text-morph) & [`https://componentry.dev/docs/components/flipping-word-swap`](https://componentry.dev/docs/components/flipping-word-swap)
- **Einbauort im Casino:**
  - Währungsauswahl & Guthaben-Umschalter in [`src/components/layout/MainHeader.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MainHeader.tsx)
  - Spielmodus-Umschalter (Manuell vs. Auto) in [`src/components/casino/controls/BetModeTabs.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/controls/BetModeTabs.tsx)
- **Schonungslose Kritik des Ist-Zustands:**  
  Standard-Tabs mit linearem Schieberegler. Der Text selbst springt einfach auf den neuen String um.
- **Das Luxus-Upgrade:**  
  Fließende SVG-Matrix-Threshold-Morphs zwischen Texten („USD“ morphing in „BTC“, „MANUAL“ in „AUTO-BET“). Die Glyphen verschmelzen flüssig wie Quecksilber ineinander.

---

### Cluster B: Filmische Shader & Atmosphärischer Luxus

#### 5. Liquid Chrome WebGL Shader (`liquid-chrome`) — ⭐⭐⭐ ABSOLUTER FAVORIT

- **User-Votum:** ⭐⭐⭐ _Absoluter Favorit („exzellent, sieht gigantisch gut aus, genau so etwas gesucht“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/liquid-chrome`](https://componentry.dev/docs/components/liquid-chrome)
- **Einbauort im Casino:**
  - [`src/components/home/LobbyAmbientBackground.tsx`](file:///v:/VibeCoding/Casino/src/components/home/LobbyAmbientBackground.tsx)
  - Hero-Karten-Rücken & VIP-Hintergrund in [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)
- **Schonungslose Kritik des Ist-Zustands:**  
  Aktuell werden 4 überlappende `radial-gradient`-Divs mit `filter: blur(80px)` animiert. Das kostet auf Safari und Laptops spürbar Framerate und sieht trotzdem nach synthetischem CSS-Farbverlauf aus.
- **Das Luxus-Upgrade:**  
  Ein echter nativer WebGL-Fragment-Shader mit flüssigem Metall. Kundenspezifisch abgemischt auf Goldpigmente (`baseColor: [0.83, 0.69, 0.22]`) und tiefes Obsidian (`[0.04, 0.05, 0.08]`). Die Metallwellen fließen organisch und reagieren träge auf Mausbewegungen – wie geschmolzenes 999er Feingold.
- **Technische Integration:**
  - Standalone-WebGL-Canvas ohne Three.js-Ballast (<4 KB Shader-Code).
  - Pausiert automatisch bei Tab-Inaktivität (`document.visibilityState`) oder reduzierter Bewegung (`prefers-reduced-motion`).
- **Option-Gate (Jan-Schema):**  
  _Option 1:_ Nur als statisches Poster mit CSS-Glow.  
  _Option 2 (Empfohlen):_ Interaktiver Liquid-Chrome-Canvas mit 30 FPS Drosselung als zarter Hintergrund-Glow im Hero-Bereich.  
  _Option 3:_ Fullscreen-Hintergrund für die gesamte Lobby.

---

#### 6. Silk Aurora & Dither Prism Hero (`silk-aurora` & `dither-prism-hero`) — ❌ VOM USER ABGELEHNT

- **User-Votum:** ❌ _Abgelehnt („gefällt mir nicht so gut, entfernen“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/silk-aurora`](https://componentry.dev/docs/components/silk-aurora) & [`https://componentry.dev/docs/components/dither-prism-hero`](https://componentry.dev/docs/components/dither-prism-hero)
- **Status:** Aus der aktiven Implementierungsliste entfernt; im vollständigen Katalog ([`docs/frontend/12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md)) als abgelehnt markiert.

---

#### 7. Refractive Image Ripple Effect (`image-ripple-effect`) — ⭐⭐ BESTÄTIGT

- **User-Votum:** ⭐⭐ _Bestätigt („sehr gut, auf jeden Fall beibehalten“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/image-ripple-effect`](https://componentry.dev/docs/components/image-ripple-effect)
- **Einbauort im Casino:**
  - Klick-Feedback auf Aktionstasten ([`src/components/casino/controls/GameActionButton.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/controls/GameActionButton.tsx))
  - Interaktives Tuch auf Blackjack- und Roulette-Tischen.
- **Schonungslose Kritik des Ist-Zustands:**  
  Buttons haben nur ein Standard `whileTap={{ scale: 0.96 }}`. Das Klickgefühl fühlt sich trocken und digital an.
- **Das Luxus-Upgrade:**  
  Beim Klick auf „BET“ oder beim Setzen eines Chips breitet sich eine optische Licht- und Brechungswelle über die Schaltfläche und das Spielfeld aus, als würde ein schwerer Goldchip sanft auf feinen Casinofilz treffen.

---

### Cluster C: 3D-Navigation, VIP-Prestige & Haptik

#### 8. Magnetic Dock Navigation (`magnetic-dock`) — ⭐⭐⭐ ABSOLUTER FAVORIT

- **User-Votum:** ⭐⭐⭐ _Absoluter Favorit („extrem geil“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/magnetic-dock`](https://componentry.dev/docs/components/magnetic-dock)
- **Einbauort im Casino:**
  - Ersatz der veralteten [`src/components/layout/MobileNav.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MobileNav.tsx)
  - Optionales schwebendes Quick-HUD auf Desktop
- **Schonungslose Kritik des Ist-Zustands:**  
  Die aktuelle `MobileNav` ist ein 72px hoher, starrer Block am unteren Bildschirmrand mit simplen SVG-Icons. Sie stiehlt wertvollen vertikalen Platz auf Mobilgeräten und hat null Charme.
- **Das Luxus-Upgrade:**  
  Ein schwebendes, pillenförmiges Glasdock (`backdrop-filter: blur(24px)`), das Icons basierend auf der Finger- bzw. Mausannäherung magnetisch vergrößert (`scale: 1.35`), mit weicher Dämpfung (`spring: { stiffness: 400, damping: 25 }`), Gold-Highlights und schwebenden Tooltips.
- **Technische Integration:**
  - Framer Motion `useMotionValue` und `useTransform` gekoppelt an Pointer-Koordinaten.
  - Vollisoliert und safe-area-kompatibel (`env(safe-area-inset-bottom)`).
- **Das Luxus-Upgrade:**  
  Ein schwebendes, pillenförmiges Glasdock (`backdrop-filter: blur(24px)`), das Icons basierend auf der Finger- bzw. Mausannäherung magnetisch vergrößert (`scale: 1.35`), mit weicher Dämpfung (`spring: { stiffness: 400, damping: 25 }`), Gold-Highlights und schwebenden Tooltips.
- **Technische Integration:**
  - Framer Motion `useMotionValue` und `useTransform` gekoppelt an Pointer-Koordinaten.
  - Vollisoliert und safe-area-kompatibel (`env(safe-area-inset-bottom)`).

---

#### 9. Orbit Card Stack (`orbit-card-stack`) — ⭐⭐⭐ ABSOLUTER FAVORIT

- **User-Votum:** ⭐⭐⭐ _Absoluter Favorit („extrem cool, soll unbedingt beibehalten bleiben“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/orbit-card-stack`](https://componentry.dev/docs/components/orbit-card-stack)
- **Einbauort im Casino:**
  - VIP-Club Stufen-Präsentation in [`src/components/casino/RankBenefitsModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/RankBenefitsModal.tsx) & [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)
- **Schonungslose Kritik des Ist-Zustands:**  
  Die Ränge (Bronze, Silber, Gold, Platin, Diamant, Obsidian) werden in profillosen Listenreihen abgehandelt. Der psychologische Drang, den nächsten Status zu erreichen, verpufft.
- **Das Luxus-Upgrade:**  
  Ein physisch anmutender 3D-Stapel aus edlen Metallkarten. Beim Überfahren mit der Maus fächert der Kartenstapel sphärisch auf. Die aktive Karte hebt sich erhaben hervor, zeigt ihre Goldprägung und spiegelt virtuelles Studiolicht wider.
- **Option-Gate (Jan-Schema):**  
  _Option 1:_ Reines Karussell mit horizontalem Scroll.  
  _Option 2 (Empfohlen):_ Orbit Card Stack mit 6 VIP-Karten im Modal und auf der Vault-Seite.  
  _Option 3:_ Orbit Card Stack als Haupt-Navigationsmechanismus für alle 5 Spiele in der Lobby.

---

#### 10. Wheel Carousel (`wheel-carousel`) — ⭐⭐⭐ FAVORIT

- **User-Votum:** ⭐⭐⭐ _Favorit („genial, beibehalten“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/wheel-carousel`](https://componentry.dev/docs/components/wheel-carousel)
- **Einbauort im Casino:**
  - Spielauswahl-Karussell in [`src/app/games/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx)
  - Daily Free Spin / Streak Reward Mini-Feature
- **Schonungslose Kritik des Ist-Zustands:**  
  Die Spielauswahl ist ein klassisches zweispaltiges Grid. Für ein Casino mit 5 Flaggschiff-Originals wirkt das uninspiriert.
- **Das Luxus-Upgrade:**  
  Ein rotierendes 3D-Zylinderrad mit Massenträgheit (`inertial drag`), bei dem die Spiele wie auf einer luxuriösen Roulette-Walze vorbeigleiten. Krümmung, Unschärfe und Crossfade beim Loslassen.

---

#### 11. Spiral 3D Slider (`spiral-3d-slider`) — ⭐⭐⭐ FAVORIT

- **User-Votum:** ⭐⭐⭐ _Favorit („extrem geniales Element“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/spiral-3d-slider`](https://componentry.dev/docs/components/spiral-3d-slider)
- **Einbauort im Casino:**
  - „Hall of Fame“ & Größte Gewinne der Woche in [`src/components/home/bento/BentoArcadeCells.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoArcadeCells.tsx)
- **Schonungslose Kritik des Ist-Zustands:**  
  Top-Gewinner stehen in simplen Textzeilen. Niemand liest das gerne.
- **Das Luxus-Upgrade:**  
  Eine schwebende 3D-Helix/Spirale im Raum, auf der Schnappschüsse der spektakulärsten Spielrunden kontinuierlich in die Tiefe gleiten und per Mausrad inspiziert werden können.

---

#### 12. Directional Hover Transitions (`hover-transition`) — ⭐⭐⭐ FAVORIT

- **User-Votum:** ⭐⭐⭐ _Favorit („extrem cool“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/hover-transition`](https://componentry.dev/docs/components/hover-transition)
- **Einbauort im Casino:**
  - Spielkarten in [`src/app/games/_components/ElevatedGameCard.tsx`](file:///v:/VibeCoding/Casino/src/app/games/_components/ElevatedGameCard.tsx)
- **Schonungslose Kritik des Ist-Zustands:**  
  Die aktuellen Karten berechnen einfache Rotationswinkel. Beim Verlassen der Karte springt der Schatten oft unruhig zurück.
- **Das Luxus-Upgrade:**  
  Richtungsabhängige Glanzstreifen (`directional hover`): Der goldene Lichtreflex schiebt sich exakt aus der Richtung über die Karte, aus der der Mauszeiger eingetreten ist (oben, links, unten, rechts), und zieht beim Verlassen nahtlos weiter.

---

### Cluster D: Krypto-Transparenz, Vertrauen & Provably Fair

#### 13. Circuit Board & Magnet Lines (`circuit-board` & `magnet-lines`) — ⭐⭐⭐ FAVORIT

- **User-Votum:** ⭐⭐⭐ _Favorit („in gewisser Weise extrem cool, auf jeden Fall beibehalten“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/circuit-board`](https://componentry.dev/docs/components/circuit-board) & [`https://componentry.dev/docs/components/magnet-lines`](https://componentry.dev/docs/components/magnet-lines)
- **Einbauort im Casino:**
  - [`src/components/casino/ProvablyFairTool.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/ProvablyFairTool.tsx)
  - Server-Seed Verifizierungsansicht in [`src/components/casino/ProvablyFairModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/ProvablyFairModal.tsx)
- **Schonungslose Kritik des Ist-Zustands:**  
  Provably Fair ist unser größter USP (100% kryptografisch beweisbar). Doch das aktuelle Tool sieht aus wie ein JSON-Validator. Kein Spieler versteht auf den ersten Blick, wie Server-Seed, Client-Seed und Nonce ineinandergreifen.
- **Das Luxus-Upgrade:**  
  Eine animierte Schaltkreis-Visualisierung in Gold und Smaragd:
  - Knotenpunkt 1: `Server Seed (Hashed)`
  - Knotenpunkt 2: `Client Seed`
  - Knotenpunkt 3: `Nonce`
    Beim Klick auf „Verify“ jagen Lichtimpulse durch die Leiterbahnen in den zentralen `HMAC-SHA256`-Chip, der sich dreht und das finale Spielergebnis (z. B. Crash-Punkt `2.45x`) kristallklar auswirft.

---

#### 14. Sticky Scroll Cards (`sticky-scroll-cards`) — ⭐⭐⭐ FAVORIT

- **User-Votum:** ⭐⭐⭐ _Favorit („extrem genial, soll beibehalten bleiben“)_
- **Componentry-Referenz:** [`https://componentry.dev/docs/components/sticky-scroll-cards`](https://componentry.dev/docs/components/sticky-scroll-cards)
- **Einbauort im Casino:**
  - Onboarding-Guide & „How Provably Fair Works“ auf der Startseite oder unter `/docs`
- **Schonungslose Kritik des Ist-Zustands:**  
  Lange Scroll-Abschnitte mit statischen Textblöcken ermüden den Nutzer.
- **Das Luxus-Upgrade:**  
  Scroll-getriebenes Karten-Flippen: Beim Hinabscrollen heften sich Erklär-Karten aneinander, skalieren dreidimensional in die Tiefe und klappen nach oben weg, um die nächste Schicht freizugeben.

---

## 3. Strategische Priorisierung & Umsetzungs-Roadmap

Um maximale visuelle Hebelwirkung bei minimalem Risiko für bestehende Finanz- und Spiellogik zu erzielen, teilen wir die Einführung in drei Phasen ein:

```mermaid
flowchart TD
    subgraph Phase 1: Sofort-Wirkung & Haptik [Phase 1: Quick Wins - 1-2 Tage]
        A[Split-Flap Display im Jackpot] --> B[Magnetic Dock für MobileNav]
        B --> C[Directional Hover auf Game Cards]
    end

    subgraph Phase 2: Dopamin & Belohnung [Phase 2: Core UX - 3-4 Tage]
        D[Particle Typography in Big Win Overlay] --> E[Orbit Card Stack im VIP Vault]
        E --> F[Liquid Chrome Gold-Shader im Hero]
    end

    subgraph Phase 3: Vertrauen & Tiefe [Phase 3: Deep Immersion - 1 Woche]
        G[Circuit Board im Provably Fair Tool] --> H[Kinetic Reveal in Game Overlays]
        H --> I[Wheel Carousel für Spielmodi]
    end

    Phase 1 --> Phase 2 --> Phase 3
```

### Die Top 5 mit dem höchsten ROI (Sofort-Kandidaten)

1. **Split-Flap Display** in `BentoJackpotCells.tsx`: Verwandelt den langweiligen Zähler sofort in einen luxuriösen Hingucker.
2. **Magnetic Dock** in `MobileNav.tsx`: Beseitigt die schwächste mobile Komponente und verleiht der gesamten Smartphone-Nutzung Apple-Grade-Eleganz.
3. **Particle Typography** in `BigWinOverlay.tsx`: Macht den Moment des Gewinns zum unvergesslichen Höhepunkt.
4. **Orbit Card Stack** in `RankBenefitsModal.tsx` & `vault/page.tsx`: Verleiht dem VIP-Status echte Exklusivität und Sammler-Prestige.
5. **Circuit Board Verifier** in `ProvablyFairTool.tsx`: Wandelt kryptografische Trockenheit in einen verständlichen, faszinierenden Vertrauensbeweis.

---

## 4. Performance-, Sicherheits- & Architektur-Garantien

1. **Keine Beeinträchtigung der Spiel-Integrität:**  
   Keine der empfohlenen Komponenten berührt Finanz-RPCs, Wallets oder Zufallsgeneratoren. Alle Berechnungen bleiben strikt im Backend/Service-Layer (`src/lib/casino/`).
2. **Frame-Budget & 60-120 FPS Garantie:**
   - Canvas- und WebGL-Effekte laufen isoliert im RAF-Loop (_requestAnimationFrame_).
   - Bei Inaktivität des Browsertabs stoppen alle Render-Loops sofort (`visibilitychange`-Listener).
   - Volle Beachtung von `prefers-reduced-motion`: Nutzer mit eingeschränkter Bewegung erhalten saubere, statische Luxus-Gradients ohne Animation.
3. **SSR & Hydration Safety:**  
   Alle Canvas- und WebGL-Komponenten werden mit `'use client'` deklariert und bei Bedarf via `next/dynamic` mit `{ ssr: false }` geladen, um jegliche Next.js 16 Hydration-Mismatches auszuschließen.
