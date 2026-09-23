# 05 — Awwwards-Level 3D Scrollytelling Hero Relaunch (V3 Laboratory Prototype)

> **Status:** 🟢 Abgeschlossen & Verifiziert · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Isolierter Labor-Prototyp eines weltklasse Awwwards-Level Hero-Banners auf `/testing/v3` mit 2.5D/3D Multi-Layer-Tiefenraum, GSAP ScrollTrigger, Shader-/Foil-Glow, interaktivem Partikel-Vortex-Sog, 180° 3D-Karten-Flip und dynamischem 4-Spiele Multi-Card Deck.
> **Money-Pfad:** Nein · **Security-Review:** Nein — reiner Visual-/Motion-Layer in isolierter Sandbox ohne Mutation von Wallet-, Auth- oder DB-RNG-Zuständen.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                | Scope & Zielpfade                                           | Ausführung  |  Status   | Zuständigkeit | Verifikation & DoD                                                                  |
| :----- | :----------------------------------------- | :---------------------------------------------------------- | :---------- | :-------: | :-----------: | :---------------------------------------------------------------------------------- |
| **L0** | **Baseline & Sandbox Setup**               | `src/app/testing/v3/page.tsx`, `src/components/testing/v3/` | Sequenziell | 🟢 Fertig |      LLM      | Route `http://localhost:3015/testing/v3` gerendert, 0 Konflikte mit Prod            |
| **L1** | **Multi-Layer Asset-Pipeline & Isolation** | `public/images/testing-v3/`, Asset-Integration              | Sequenziell | 🟢 Fertig |      LLM      | 4 transparente PNG-Alpha-Layer + 3 Spiel-Artworks bereitgestellt                    |
| **L2** | **2.5D Deep-Parallax GSAP Stage**          | `TestingV3HeroStage.tsx`, `TestingV3PortalCamera.tsx`       | Sequenziell | 🟢 Fertig |      LLM      | Z-Achsen-Kameradrift über 220vh Sticky Track, Multi-Ebenen-Parallaxe flüssig        |
| **L3** | **Canvas Vortex & Shader Warp**            | `TestingV3ParticleVortex.tsx`, `TestingV3ShaderWarp.tsx`    | Sequenziell | 🟢 Fertig |      LLM      | Scroll-getriebener Partikelsog (Gravitationsspirale) + 24k Gold-Glint (Zero-White)  |
| **L4** | **3D Card Flip & Multi-Card Deck**         | `TestingV3MorphCard.tsx`                                    | Sequenziell | 🟢 Fertig |      LLM      | 180°-Flip & 4-Spiele-Karussell (Crash, Roulette, Blackjack, Slots) im 3D-Tiefenraum |
| **L5** | **Qualitätsprüfung & Responsive DoD**      | `npm run typecheck`, `npm test`, `npm run lint`             | Sequenziell | 🟢 Fertig |      LLM      | 5-Stufen-DoD 100 % grün, 0 TS-Fehler, 0 ESLint-Errors, 1839 Tests bestanden         |
| **L6** | **Visuelles Playwright 5%-Scrolly-Audit**  | `scripts/capture-testing-v3-5pct.mjs`                       | Sequenziell | 🟢 Fertig |      LLM      | 21 Einzel-Screenshots (0 %–100 % in 5 %-Schritten) dokumentiert im Walkthrough      |

---

## 2 — Architektur & Isolationsprinzip

1. **Strikte Trennung von Produktion:**
   - Die Produktionsroute (`/` via `BentoLobbyHome.tsx`) bleibt unberührt.
   - Alle Neuentwicklungen leben exklusiv in:
     - Route: `src/app/testing/v3/page.tsx`
     - Komponenten: `src/components/testing/v3/**`
     - Assets: `public/images/testing-v3/**`
   - ClientShell behandelt `/testing/v3` als autonome Testroute ohne Störung des Live-HUDs.

2. **Die 4 Säulen des Awwwards-Level Scrollytellings:**
   - **Multi-Layer Depth Parallax (2.5D Tiefenraum):**
     - Layer 0 (Z: -400px): Kosmischer Gravitationsnebel mit sphärischer Krümmung.
     - Layer 1 (Z: -150px): Monumentaler, rotierender Stargate-Runenring.
     - Layer 2 (Z: 0px): Schwebender Goldkristall-Vortex-Kern mit dynamischem Radial-Glow.
     - Layer 3 (Z: +250px): Quantum-Ace-3D-Karte mit fliegenden VIP-Splitter-Chips im Vordergrund.
     - Kamera: GSAP ScrollTrigger Z-Achsen-Kameraflug (`perspective: 1500px`, `scrub: 0.8`).
   - **Holografische Shader- & Warp-Effekte:**
     - Irisierender 24k-Gold-Foil-Sheen wandert synchron mit der Scroll-Geschwindigkeit (`mix-blend-mode: color-dodge`).
     - Gravitative Linsenverzerrung (SVG Displacement Warp) ab 50 % Scroll-Progress.
   - **Interaktiver Partikel-Vortex-Sog (HTML5 Canvas + GSAP Physics):**
     - 0 % – 35 %: Ambienter Goldstaub schwebt träge im Raum (reaktiv auf Cursor).
     - 35 % – 75 %: Gravitationsstrudel – spiralförmige Beschleunigung in den Stargate-Singularitätskern.
     - 75 % – 100 %: Nova-Explosion – Expansion in weichem goldenem Lichtkorona-Blitz.
   - **Morphologischer 3D-Karten-Flip (Nahtlose Spielenthüllung):**
     - Bei 70 % Scrollfortschritt dramatischer 180°-Flip (`rotateY: 180deg`) im 3D-Raum.
     - Nahtlose Morph-Verbindung zur ersten Live-Spielebühne (Crash-Rocket / Bento-Mosaik).
