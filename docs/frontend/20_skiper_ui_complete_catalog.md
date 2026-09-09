# 20 — Skiper UI: Vollständiger Katalog (skiper-ui.com)

> **Status:** 🟢 Vollständig erfasst (2026-09-08) · **Link-Basis:** [skiper-ui.com/sitemap.xml](https://skiper-ui.com/sitemap.xml) (220 URLs) + **106 Einzel-Auslesungen** der Detailseiten `/v1/skiperN` · **Komponenten:** 106 (skiper1–skiper107, **skiper93 existiert systemisch nicht** — in der Sitemap und auf der Seite abwesend)
> **Votum-Legende:** ⭐⭐⭐ Top-Kandidat · ⭐⭐ Interessant · ❌ Nicht empfehlenswert · ⚪ Neutral (Erstzustand — Bewertung manuell durch Jan) · 💰 Pro/kostenpflichtig (Polar-License-Key)
> **Aufgabenquelle:** [`T_FRONTEND/00_AUFGABEN_FRONTEND.md`](../../T_FRONTEND/00_AUFGABEN_FRONTEND.md) · **Planung:** Plan 60 (aufgabenbegleitend, nach Ausführung aufgelöst)

---

## Auslesen-Methodik & Rahmenbedingungen

- **Namensquelle:** Die `/components`-Übersichtsseite ist eine reine SPA (WebFetch + Playwright blockiert) — Ausweich gemäß Plan-60-Rückfallebene: alle 106 Detailseiten `/v1/skiperN` servergerendert einzeln ausgelesen (Name, Tech, Lizenz, Beschreibung je Seite). **106/106 Namen verifiziert, 0 Platzhalter.**
- ⚠️ **Lizenz:** Free-Tier „free to use and modify in personal and commercial projects", verlangt aber **Attribution an Skiper UI**; Pro (17 von 106) braucht `SKIPER_LICENSE_KEY` via Polar („validated on every install"). → **Dieser Katalog ist Inspirations-/Vergleichsquelle, keine Installationsquelle.**
- ⚠️ **Tech-Stack:** Skiper-Prerequisites nennen framer-motion **und** GSAP; 6 Komponenten ziehen GSAP ein (skiper17, 24, 32, 33, 39, 73) — Kollision mit der Motion-only-Engine-Vorgabe des Projekts, in der Technologie-Spalte markiert. 4 Komponenten sind reines CSS/SVG/Canvas ohne Animations-Engine.
- **Dedupe-Hinweis:** Ein Animations-Motor im Projekt (Motion/framer-motion ^13.1.1). Bei Votung prüfen, ob ein MIT-Äquivalent in Katalog 14 (React Bits) oder 15 (Aceternity) existiert — verifizierte Überschneidungen: Number-Rollup ⇄ `14: Count Up`, Goo-Effekte ⇄ `14: Gooey Nav` / `15: Gooey Input`, Karten-Glow ⇄ `14: Spotlight Card` / `15: Card Spotlight`, Tooltips ⇄ `15: Animated Tooltip`, Accordion ⇄ `14: Accordion Gallery`, Preloader-Familie ⇄ `15: Loader` / `15: Multi-Step Loader`.
- **Install-Befehl (nur zur Einordnung, nicht als Empfehlung):** `npx shadcn add @skiper-ui/skiperN` — Skiper UI ist seit Sep 2025 offizielle Trusted Registry des shadcn CLI.

---

## K1 — Preloader & Lade-Übergänge (6)

| Komponente                          | Offizieller Link                                    | User-Votum | Casino-Einsatzbereich                                                     | Technologie   |
| :---------------------------------- | :-------------------------------------------------- | :--------: | :------------------------------------------------------------------------ | :------------ |
| Skiper 7 — Nike Preloader           | [`/v1/skiper7`](https://skiper-ui.com/v1/skiper7)   |     ⚪     | Brand-Preloader (Spiel-/Session-Start); eher kein direkter Anwendungsfall | framer-motion |
| Skiper 8 — Words Preloader          | [`/v1/skiper8`](https://skiper-ui.com/v1/skiper8)   |     ⚪     | Initial-Ladesequenz (Sandbox-/Spielstart)                                 | framer-motion |
| Skiper 9 — Stairs Preloader         | [`/v1/skiper9`](https://skiper-ui.com/v1/skiper9)   |     ⚪     | Kein direkter Anwendungsfall (Preloader-Optik)                            | framer-motion |
| Skiper 10 — Double Stairs Preloader | [`/v1/skiper10`](https://skiper-ui.com/v1/skiper10) |     ⚪     | Kein direkter Anwendungsfall                                              | framer-motion |
| Skiper 11 — Pixel Preloader         | [`/v1/skiper11`](https://skiper-ui.com/v1/skiper11) |     ⚪     | Retro-Loader für `/testing`-/`/v2`-Sandboxen denkbar                      | framer-motion |
| Skiper 15 — Box Loading Preloader   | [`/v1/skiper15`](https://skiper-ui.com/v1/skiper15) |     ⚪     | Keine direkte Anwendung (Partikel-Preloader)                              | framer-motion |

## K2 — Text & Zahlen (10)

| Komponente                                | Offizieller Link                                    | User-Votum | Casino-Einsatzbereich                                  | Technologie           |
| :---------------------------------------- | :-------------------------------------------------- | :--------: | :----------------------------------------------------- | :-------------------- |
| Skiper 27 — Rolling Text                  | [`/v1/skiper27`](https://skiper-ui.com/v1/skiper27) |     ⚪     | Headline-Rollover (MainHeader/Spieltitel)              | framer-motion         |
| Skiper 28 — 3D Perspective Text           | [`/v1/skiper28`](https://skiper-ui.com/v1/skiper28) |     ⚪     | Hero-/Sektions-Highlight                               | framer-motion (Lenis) |
| Skiper 31 — Text Scroll Animation         | [`/v1/skiper31`](https://skiper-ui.com/v1/skiper31) |     ⚪     | Landing-Sektionen (3D-Charakter-Parallax)              | framer-motion         |
| Skiper 37 — Animated Number (Number Flow) | [`/v1/skiper37`](https://skiper-ui.com/v1/skiper37) |     ⚪     | Wallet-/KPI-Rollup (Monospace-Pflicht); ⇄ 14: Count Up | framer-motion         |
| Skiper 58 — Text Roll Navigation          | [`/v1/skiper58`](https://skiper-ui.com/v1/skiper58) |     ⚪     | Nav-/Button-Hover (GameActionButton)                   | framer-motion         |
| Skiper 68 — Animated Number Input         | [`/v1/skiper68`](https://skiper-ui.com/v1/skiper68) |     ⚪     | Wetteinsatz-Feld (Bet-Input)                           | framer-motion         |
| Skiper 69 — Skiper Number Flow            | [`/v1/skiper69`](https://skiper-ui.com/v1/skiper69) |     ⚪     | Balance-/XP-Rollup; ⇄ 14: Count Up                     | framer-motion         |
| Skiper 70 — Text Reveal Box               | [`/v1/skiper70`](https://skiper-ui.com/v1/skiper70) |     ⚪     | Landing-/Sektions-Intro (Wort-für-Wort)                | framer-motion         |
| Skiper 72 — Horizontal Text Reveal        | [`/v1/skiper72`](https://skiper-ui.com/v1/skiper72) |     ⚪     | Landing-/Sektions-Intro                                | framer-motion         |
| Skiper 88 — 3D Rolling Text on Scroll     | [`/v1/skiper88`](https://skiper-ui.com/v1/skiper88) |   ⚪ 💰    | Rank-/Level-Badge denkbar; eher kein Anwendungsfall    | framer-motion         |

## K3 — Navigation, Menüs & Tooltips (11)

| Komponente                             | Offizieller Link                                      | User-Votum | Casino-Einsatzbereich                                   | Technologie   |
| :------------------------------------- | :---------------------------------------------------- | :--------: | :------------------------------------------------------ | :------------ |
| Skiper 13 — Nike Menu                  | [`/v1/skiper13`](https://skiper-ui.com/v1/skiper13)   |     ⚪     | Vollbild-Overlay-Menü (MobileNav-Alternative)           | framer-motion |
| Skiper 38 — Apple Navbar V001          | [`/v1/skiper38`](https://skiper-ui.com/v1/skiper38)   |     ⚪     | MainHeader-Kandidat (Mega-Menü)                         | framer-motion |
| Skiper 43 — Vercel Tooltip             | [`/v1/skiper43`](https://skiper-ui.com/v1/skiper43)   |   ⚪ 💰    | Icon-Toolbar (ProvablyFairTool); ⇄ 15: Animated Tooltip | framer-motion |
| Skiper 57 — Vercel Navigation Bar      | [`/v1/skiper57`](https://skiper-ui.com/v1/skiper57)   |     ⚪     | MainHeader-Kandidat (Scroll-Animation, Breadcrumbs)     | framer-motion |
| Skiper 60 — Side Scroll Navigation     | [`/v1/skiper60`](https://skiper-ui.com/v1/skiper60)   |     ⚪     | Sektions-Navigation langer Seiten (Admin/Landing)       | framer-motion |
| Skiper 75 — Apple Navbar V002          | [`/v1/skiper75`](https://skiper-ui.com/v1/skiper75)   |     ⚪     | MainHeader-Kandidat (expandierend, Spring-Physik)       | framer-motion |
| Skiper 92 — Vercel Command Search      | [`/v1/skiper92`](https://skiper-ui.com/v1/skiper92)   |     ⚪     | CommandPalette-Vergleichsmuster                         | framer-motion |
| Skiper 96 — Expandable Tabs Navigation | [`/v1/skiper96`](https://skiper-ui.com/v1/skiper96)   |     ⚪     | MobileNav-/Tab-Dock (Icons expandieren zu Labels)       | framer-motion |
| Skiper 98 — Vertical Tooltip Menu      | [`/v1/skiper98`](https://skiper-ui.com/v1/skiper98)   |     ⚪     | Icon-Rail (Admin-/Sidebar)                              | framer-motion |
| Skiper 100 — Draggable Snap Button     | [`/v1/skiper100`](https://skiper-ui.com/v1/skiper100) |     ⚪     | Floating-Action-Button (Mobile, Snap an Kanten)         | framer-motion |
| Skiper 101 — Custom Tooltip            | [`/v1/skiper101`](https://skiper-ui.com/v1/skiper101) |     ⚪     | Standard-Tooltip-Ersatz (Radix)                         | Radix/other   |

## K4 — Carousels, Galerien & Karten-Stacks (17)

| Komponente                                | Offizieller Link                                      | User-Votum | Casino-Einsatzbereich                                   | Technologie            |
| :---------------------------------------- | :---------------------------------------------------- | :--------: | :------------------------------------------------------ | :--------------------- |
| Skiper 16 — Card Stack Scroll             | [`/v1/skiper16`](https://skiper-ui.com/v1/skiper16)   |     ⚪     | Spielkarten-Stack mit Scroll-Skalierung (/games)        | framer-motion          |
| Skiper 17 — Card Stack with GSAP Rotate   | [`/v1/skiper17`](https://skiper-ui.com/v1/skiper17)   |     ⚪     | Wie 16 — aber GSAP: nur Vergleich, keine Installation   | gsap (Lenis)           |
| Skiper 35 — Hover Expand                  | [`/v1/skiper35`](https://skiper-ui.com/v1/skiper35)   |     ⚪     | Kategorien-Fächer (/games)                              | framer-motion          |
| Skiper 47 — Perspective Carousel          | [`/v1/skiper47`](https://skiper-ui.com/v1/skiper47)   |     ⚪     | Featured-Slider (Lobby, Coverflow)                      | framer-motion (Swiper) |
| Skiper 48 — Card Swipe Carousel           | [`/v1/skiper48`](https://skiper-ui.com/v1/skiper48)   |     ⚪     | Karten-Swipe mit Physik (Mobile /games)                 | framer-motion          |
| Skiper 49 — Inverted Perspective Carousel | [`/v1/skiper49`](https://skiper-ui.com/v1/skiper49)   |     ⚪     | Featured-Slider-Variante (invertierter Coverflow)       | framer-motion (Swiper) |
| Skiper 50 — Creative Carousel 001         | [`/v1/skiper50`](https://skiper-ui.com/v1/skiper50)   |     ⚪     | Featured-Slider (Depth-Effekt)                          | framer-motion (Swiper) |
| Skiper 51 — Creative Carousel 002         | [`/v1/skiper51`](https://skiper-ui.com/v1/skiper51)   |     ⚪     | Featured-Slider (zentrierte Slides)                     | framer-motion (Swiper) |
| Skiper 52 — ExpandOnHover                 | [`/v1/skiper52`](https://skiper-ui.com/v1/skiper52)   |     ⚪     | Galerie-/Kategorienleiste (horizontal expandierend)     | framer-motion          |
| Skiper 53 — ExpandOnHover Vertical        | [`/v1/skiper53`](https://skiper-ui.com/v1/skiper53)   |     ⚪     | Sidebar-Galerie (vertikal expandierend)                 | framer-motion          |
| Skiper 54 — Shadcn ClipPath Carousel      | [`/v1/skiper54`](https://skiper-ui.com/v1/skiper54)   |     ⚪     | Featured-Slider (clip-path-Reveal)                      | framer-motion (Swiper) |
| Skiper 73 — Infinite Canvas               | [`/v1/skiper73`](https://skiper-ui.com/v1/skiper73)   |     ⚪     | Grid-Erkundung (Drag/Wheel/Touch) — GSAP: nur Vergleich | gsap                   |
| Skiper 77 — Apple Carousel                | [`/v1/skiper77`](https://skiper-ui.com/v1/skiper77)   |     ⚪     | Spiel-/Produkt-Showcase (Farbwahl, Swipe)               | framer-motion          |
| Skiper 78 — Dia Browser's Carousel        | [`/v1/skiper78`](https://skiper-ui.com/v1/skiper78)   |     ⚪     | Screenshot-/Feature-Slider (Auto-Play, Progress)        | framer-motion          |
| Skiper 79 — Team Showcase Scroll          | [`/v1/skiper79`](https://skiper-ui.com/v1/skiper79)   |     ⚪     | VIP-/Vault-Galerie (Blend-Mode-Typo)                    | framer-motion          |
| Skiper 80 — Projects Showcase             | [`/v1/skiper80`](https://skiper-ui.com/v1/skiper80)   |   ⚪ 💰    | Portfolio-/Vault-Galerie (Hover + Detail-View)          | framer-motion          |
| Skiper 104 — Scroll Reveal Grid Cards     | [`/v1/skiper104`](https://skiper-ui.com/v1/skiper104) |     ⚪     | Bento-/Grid-Reveal (BentoArcadeCells)                   | framer-motion          |

## K5 — Eingaben, Buttons & Formulare (14)

| Komponente                            | Offizieller Link                                      | User-Votum | Casino-Einsatzbereich                                         | Technologie   |
| :------------------------------------ | :---------------------------------------------------- | :--------: | :------------------------------------------------------------ | :------------ |
| Skiper 3 — Apple Play Button          | [`/v1/skiper3`](https://skiper-ui.com/v1/skiper3)     |     ⚪     | Play-/Start-Button (GameActionButton)                         | framer-motion |
| Skiper 21 — Family Wallet             | [`/v1/skiper21`](https://skiper-ui.com/v1/skiper21)   |     ⚪     | Auth-Flow-Optik (Login-Modal, OTP)                            | framer-motion |
| Skiper 22 — Aave Token Swap           | [`/v1/skiper22`](https://skiper-ui.com/v1/skiper22)   |     ⚪     | Wettschein-/Umtausch-Optik (Bet-Slip, animierte Zahlenfelder) | framer-motion |
| Skiper 25 — Music Toggle Btn          | [`/v1/skiper25`](https://skiper-ui.com/v1/skiper25)   |     ⚪     | Sound-Toggle (Ton an/aus, Wellenform-Feedback)                | framer-motion |
| Skiper 26 — Theme Toggle Btn          | [`/v1/skiper26`](https://skiper-ui.com/v1/skiper26)   |     ⚪     | Theme-Umschalter (View Transition API)                        | framer-motion |
| Skiper 45 — Family Receive Button     | [`/v1/skiper45`](https://skiper-ui.com/v1/skiper45)   |     ⚪     | Bestätigungs-Dialog (Claim-/Belohnungs-Flow)                  | framer-motion |
| Skiper 56 — Devouring Details Sign In | [`/v1/skiper56`](https://skiper-ui.com/v1/skiper56)   |   ⚪ 💰    | Login-Detail (Canvas-Partikel-Effekt; nur Inspiration)        | Canvas/other  |
| Skiper 81 — AI Input 001              | [`/v1/skiper81`](https://skiper-ui.com/v1/skiper81)   |     ⚪     | Support-/KI-Chat-Input (Upload, Modi)                         | framer-motion |
| Skiper 82 — AI Input 002              | [`/v1/skiper82`](https://skiper-ui.com/v1/skiper82)   |   ⚪ 💰    | KI-Chat-Input-Variante (Gradient beim Senden, Sounds)         | framer-motion |
| Skiper 83 — AI Input 003              | [`/v1/skiper83`](https://skiper-ui.com/v1/skiper83)   |   ⚪ 💰    | KI-Chat-Input-Variante (@Mention-Karten)                      | framer-motion |
| Skiper 84 — AI Input 004              | [`/v1/skiper84`](https://skiper-ui.com/v1/skiper84)   |     ⚪     | KI-Chat-Input-Variante (Mesh-Gradient, Text-Shimmer)          | framer-motion |
| Skiper 85 — AI Input 005              | [`/v1/skiper85`](https://skiper-ui.com/v1/skiper85)   |   ⚪ 💰    | KI-Chat-Input-Variante (Thinking-State, Auto-Scroll)          | framer-motion |
| Skiper 105 — Auto Scale Input         | [`/v1/skiper105`](https://skiper-ui.com/v1/skiper105) |   ⚪ 💰    | Große Zahlen im Einsatzfeld (Locale-Formatierung)             | other         |
| Skiper 106 — Smooth Caret Input       | [`/v1/skiper106`](https://skiper-ui.com/v1/skiper106) |     ⚪     | Bet-Input-Polish (Spring-Caret, Canvas-Messung)               | framer-motion |

## K6 — Scroll-Reveals & Parallax (12)

| Komponente                           | Offizieller Link                                    | User-Votum | Casino-Einsatzbereich                                | Technologie          |
| :----------------------------------- | :-------------------------------------------------- | :--------: | :--------------------------------------------------- | :------------------- |
| Skiper 19 — SVG Follow Scroll        | [`/v1/skiper19`](https://skiper-ui.com/v1/skiper19) |     ⚪     | Fortschritts-/Pfad-Visualisierung (ProvablyFairTool) | framer-motion        |
| Skiper 29 — Siena Parallax           | [`/v1/skiper29`](https://skiper-ui.com/v1/skiper29) |     ⚪     | Landing-/Story-Sektion (SVG-Masken)                  | framer-motion        |
| Skiper 30 — Oliver Parallax          | [`/v1/skiper30`](https://skiper-ui.com/v1/skiper30) |     ⚪     | Mehrspaltige Galerie-Parallax                        | framer-motion        |
| Skiper 32 — Scroll Images Reveal 001 | [`/v1/skiper32`](https://skiper-ui.com/v1/skiper32) |     ⚪     | Nur Vergleich (framer-motion + GSAP gemischt)        | framer-motion + gsap |
| Skiper 33 — Scroll Images Reveal 002 | [`/v1/skiper33`](https://skiper-ui.com/v1/skiper33) |     ⚪     | Nur Vergleich (GSAP)                                 | gsap                 |
| Skiper 34 — Scroll Images Reveal 003 | [`/v1/skiper34`](https://skiper-ui.com/v1/skiper34) |     ⚪     | Sticky-Karten-Stack mit Scroll-Skalierung            | framer-motion        |
| Skiper 44 — Vercel Scroll with Blur  | [`/v1/skiper44`](https://skiper-ui.com/v1/skiper44) |   ⚪ 💰    | Sticky-Text-Reveal mit Blur (Landing)                | framer-motion        |
| Skiper 55 — Parallax Image           | [`/v1/skiper55`](https://skiper-ui.com/v1/skiper55) |     ⚪     | Lobby-Hintergrund (LobbyAmbientBackground-Ebene)     | framer-motion        |
| Skiper 71 — Image Reveal             | [`/v1/skiper71`](https://skiper-ui.com/v1/skiper71) |     ⚪     | Story-/Landing-Reveal (clip-path, sticky)            | framer-motion        |
| Skiper 89 — Scroll Progress 001      | [`/v1/skiper89`](https://skiper-ui.com/v1/skiper89) |     ⚪     | Scroll-Fortschritts-Indikator (draggy, Zähler)       | framer-motion        |
| Skiper 94 — Scroll Progress 002      | [`/v1/skiper94`](https://skiper-ui.com/v1/skiper94) |   ⚪ 💰    | Scroll-Fortschritt vertikal (Prozent-Anzeige)        | framer-motion        |
| Skiper 95 — Scroll Progress 003      | [`/v1/skiper95`](https://skiper-ui.com/v1/skiper95) |   ⚪ 💰    | Scroll-Fortschritt mit clip-path                     | motion               |

## K7 — Interaktion, Cursor & Mikro-Effekte (13)

| Komponente                          | Offizieller Link                                      | User-Votum | Casino-Einsatzbereich                                                                  | Technologie            |
| :---------------------------------- | :---------------------------------------------------- | :--------: | :------------------------------------------------------------------------------------- | :--------------------- |
| Skiper 2 — Dynamic Island           | [`/v1/skiper2`](https://skiper-ui.com/v1/skiper2)     |     ⚪     | HUD-Pill (Live-Win-Ribbon/Toast-Äquivalent); MIT-Äquivalent-Kandidat laut Aufgabenpool | framer-motion          |
| Skiper 5 — Things Drag and Scroll   | [`/v1/skiper5`](https://skiper-ui.com/v1/skiper5)     |     ⚪     | Icon-Raster-Drag (Spiel-Auswahl, 3D-Icons)                                             | framer-motion          |
| Skiper 18 — Image Cursor Trail      | [`/v1/skiper18`](https://skiper-ui.com/v1/skiper18)   |     ⚪     | Spielereffekt (Lobby-/Lab-Sandbox)                                                     | other (Pointer-Follow) |
| Skiper 23 — Minimal Card Expand     | [`/v1/skiper23`](https://skiper-ui.com/v1/skiper23)   |     ⚪     | Wallet-/Karten-Expand (Layout-Animation)                                               | framer-motion          |
| Skiper 40 — CssLink                 | [`/v1/skiper40`](https://skiper-ui.com/v1/skiper40)   |     ⚪     | Link-Hover (Footer/Nav, CSS-only)                                                      | CSS                    |
| Skiper 46 — Nextjs Gooey Menu       | [`/v1/skiper46`](https://skiper-ui.com/v1/skiper46)   |     ⚪     | Goo-Nav-Vergleich; ⇄ 14: Gooey Nav                                                     | framer-motion (SVG)    |
| Skiper 59 — Drawing Cursor Effect   | [`/v1/skiper59`](https://skiper-ui.com/v1/skiper59)   |     ⚪     | Sandbox-/Lab-Effekt (Canvas-Zeichnen)                                                  | framer-motion          |
| Skiper 61 — Mouse Follow Animations | [`/v1/skiper61`](https://skiper-ui.com/v1/skiper61)   |     ⚪     | Cursor-Follower (Spring-Physik, Lab)                                                   | framer-motion          |
| Skiper 62 — Loop Animation Hook     | [`/v1/skiper62`](https://skiper-ui.com/v1/skiper62)   |     ⚪     | Utility-Hook (konfigurierbare Loops)                                                   | framer-motion          |
| Skiper 63 — Apple Squircle Effect   | [`/v1/skiper63`](https://skiper-ui.com/v1/skiper63)   |     ⚪     | Icon-/Kartenform-Polish (SVG-Filter, CSS-only)                                         | SVG/CSS                |
| Skiper 64 — Gooey Effect            | [`/v1/skiper64`](https://skiper-ui.com/v1/skiper64)   |     ⚪     | SVG-Goo-Filter-Utility; ⇄ 14: Gooey Nav                                                | framer-motion (SVG)    |
| Skiper 90 — Gradient Hover Cards    | [`/v1/skiper90`](https://skiper-ui.com/v1/skiper90)   |     ⚪     | Karten-Glow folgt Pointer; ⇄ 14: Spotlight Card / ⇄ 15: Card Spotlight                 | framer-motion          |
| Skiper 103 — Bouncy Accordion       | [`/v1/skiper103`](https://skiper-ui.com/v1/skiper103) |   ⚪ 💰    | FAQ-/Rank-Benefits (RankBenefitsModal); ⇄ 14: Accordion Gallery                        | framer-motion          |

## K8 — 3D, Canvas & Hintergrund-Effekte (7)

| Komponente                           | Offizieller Link                                    | User-Votum | Casino-Einsatzbereich                                                              | Technologie   |
| :----------------------------------- | :-------------------------------------------------- | :--------: | :--------------------------------------------------------------------------------- | :------------ |
| Skiper 12 — Vercel Liquid Simulation | [`/v1/skiper12`](https://skiper-ui.com/v1/skiper12) |     ⚪     | LobbyAmbientBackground-Vergleich (WebGL — Downgrade-Pflicht des Projekts beachten) | WebGL-Shader  |
| Skiper 14 — Ascii Simulation         | [`/v1/skiper14`](https://skiper-ui.com/v1/skiper14) |     ⚪     | Verwandt mit `/lab` (ASCII-Partikel, Three.js)                                     | Three.js      |
| Skiper 36 — Interactive 3D Hero      | [`/v1/skiper36`](https://skiper-ui.com/v1/skiper36) |     ⚪     | Hero-3D (Voxel-Painter)                                                            | Three.js      |
| Skiper 39 — Canvas Crowd             | [`/v1/skiper39`](https://skiper-ui.com/v1/skiper39) |     ⚪     | Deko-Szene — GSAP: nur Vergleich                                                   | gsap (Canvas) |
| Skiper 41 — Progressive Blur         | [`/v1/skiper41`](https://skiper-ui.com/v1/skiper41) |     ⚪     | Text-Lesbarkeit über Hero; MIT-Äquivalent-Kandidat laut Aufgabenpool               | CSS           |
| Skiper 86 — Apple AI Gradient        | [`/v1/skiper86`](https://skiper-ui.com/v1/skiper86) |     ⚪     | KI-Feature-Glow (Admin-/Knowledge-Seiten, animierter Border)                       | framer-motion |
| Skiper 87 — Scroll with Fade Effect  | [`/v1/skiper87`](https://skiper-ui.com/v1/skiper87) |     ⚪     | Scroll-Kanten-Fade bei Listen (CSS-only)                                           | CSS           |

## K9 — Medien, Icons & Sonstiges (16)

| Komponente                         | Offizieller Link                                      | User-Votum | Casino-Einsatzbereich                                          | Technologie          |
| :--------------------------------- | :---------------------------------------------------- | :--------: | :------------------------------------------------------------- | :------------------- |
| Skiper 1 — Anime.js Scrollbar      | [`/v1/skiper1`](https://skiper-ui.com/v1/skiper1)     |     ⚪     | Seiten-Scrollbar-Polish (Floating Cards je Sektion)            | framer-motion        |
| Skiper 4 — Theme Toggle Buttons    | [`/v1/skiper4`](https://skiper-ui.com/v1/skiper4)     |     ⚪     | Theme-Icons (Dark/Light, animiert)                             | framer-motion        |
| Skiper 6 — Hover Members           | [`/v1/skiper6`](https://skiper-ui.com/v1/skiper6)     |     ⚪     | Team-/About-Seite (Hover-Bild + Namen)                         | framer-motion        |
| Skiper 20 — UniSwap Country Dialog | [`/v1/skiper20`](https://skiper-ui.com/v1/skiper20)   |     ⚪     | Auswahl-Dialog (Sprache/Land, React Query + Flags)             | React Query/other    |
| Skiper 24 — Tik Tik Color List     | [`/v1/skiper24`](https://skiper-ui.com/v1/skiper24)   |     ⚪     | Archiv-Liste mit Farbwechsel — GSAP-Mix: nur Vergleich         | framer-motion + gsap |
| Skiper 42 — Animated Icons 001     | [`/v1/skiper42`](https://skiper-ui.com/v1/skiper42)   |     ⚪     | Icon-Set (17 animierte Icons: Hover/Klick/Clipboard)           | framer-motion        |
| Skiper 65 — Breakpoint Indicator   | [`/v1/skiper65`](https://skiper-ui.com/v1/skiper65)   |     ⚪     | Dev-Tool (Tailwind-Breakpoint anzeigen) — nur Entwicklung      | other                |
| Skiper 66 — SVG Clip Path Mask     | [`/v1/skiper66`](https://skiper-ui.com/v1/skiper66)   |     ⚪     | Bild-Masken (geometrisch)                                      | SVG/CSS              |
| Skiper 67 — Video Player 001       | [`/v1/skiper67`](https://skiper-ui.com/v1/skiper67)   |     ⚪     | Video-Player (Cursor-following Play-Button)                    | framer-motion        |
| Skiper 74 — Timeline Calendar      | [`/v1/skiper74`](https://skiper-ui.com/v1/skiper74)   |   ⚪ 💰    | Kalender-/Timeline (Admin-Dashboards)                          | framer-motion        |
| Skiper 76 — Apple Feature Block    | [`/v1/skiper76`](https://skiper-ui.com/v1/skiper76)   |   ⚪ 💰    | Feature-Showcase (Landing, Farbpicker + Carousel)              | framer-motion        |
| Skiper 91 — Video Player 002       | [`/v1/skiper91`](https://skiper-ui.com/v1/skiper91)   |   ⚪ 💰    | Video-Player (stretchbarer Slider)                             | framer-motion        |
| Skiper 97 — Video Player 003       | [`/v1/skiper97`](https://skiper-ui.com/v1/skiper97)   |   ⚪ 💰    | Video-Player (Captions, PiP, Fullscreen)                       | framer-motion        |
| Skiper 99 — Animated Icons 002     | [`/v1/skiper99`](https://skiper-ui.com/v1/skiper99)   |     ⚪     | Icon-Set (animierte Zustände)                                  | framer-motion        |
| Skiper 102 — Debug Panel           | [`/v1/skiper102`](https://skiper-ui.com/v1/skiper102) |     ⚪     | Dev-Tool (Objekte/Motion-Werte live drucken) — nur Entwicklung | framer-motion        |
| Skiper 107 — Knockout Bracket      | [`/v1/skiper107`](https://skiper-ui.com/v1/skiper107) |   ⚪ 💰    | Turnier-/Leaderboard-Bracket (Google-Style, Paging)            | framer-motion        |

---

## Audit-Zusammenfassung (Selbstprüfung L3)

| Prüfpunkt              | Soll                          | Ist                                                                                             |
| :--------------------- | :---------------------------- | :---------------------------------------------------------------------------------------------- |
| Komponenten-Einträge   | 106                           | **106** (K1: 6 · K2: 10 · K3: 11 · K4: 17 · K5: 14 · K6: 12 · K7: 13 · K8: 7 · K9: 16)          |
| skiper93               | fehlt systemisch              | in keinem Abschnitt geführt ✅                                                                  |
| Pro-Entries (💰)       | lt. Auslesen 17               | **17** (skiper43, 44, 56, 74, 76, 80, 82, 83, 85, 88, 91, 94, 95, 97, 103, 105, 107)            |
| GSAP-basiert (Tech-⚠️) | lt. Auslesen 6                | **6** (skiper17, 24, 32, 33, 39, 73)                                                            |
| Spalten-Schema         | 5 Spalten je Zeile            | 5 Spalten, 0 leere Zellen ✅                                                                    |
| Vota                   | alle ⚪ (Bewertung durch Jan) | keine Vorab-Votung ✅                                                                           |
| HTTP-Check             | Stichproben ≥ 10              | **alle 106** `/v1`-Auslesungen HTTP 200 mit gerendertem Inhalt + sitemap/quick-start/pricing ✅ |
| Doppel-URLs            | 0                             | 0 ✅ (jede Zeile genau ein `/v1`-Link)                                                          |

**Offene Punkte für Jan:** 1) Vota für alle 106 Einträge (alle ⚪). 2) Pro-Abdeckung: 17/106 sind Polar-lizenziert — Kauf-Entscheid separat vom Katalog. 3) Die 6 GSAP-Komponenten sind als Vergleichs-/Motivquelle brauchbar, aber nicht installierbar (Engine-Vorgabe).
