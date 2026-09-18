# Proposal: Cursor-Driven Particle Typography

> **Offizielle Componentry-Dokumentation:** [componentry.dev/docs/components/cursor-driven-particle-typography](https://componentry.dev/docs/components/cursor-driven-particle-typography)  
> **Kategorie:** Typography / Canvas Physics / High-Impact Luxury  
> **Technologie:** HTML5 2D Canvas + Spring Physics + Cursor Velocity Repulsion  
> **Bewertung:** ⭐⭐ Bestätigt

---

## 1 — Drei konkrete Integrationsvorschläge

| # | Vorschlag / Feature | Vollständige Ziel-URL | Betroffene Datei & Sektion | Vorschau-Screenshot (Nur Ziel-Sektion) | UX-Impact & Luxury Rationale |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **P1** | **Big Win & Jackpot Celebration Overlay** | `http://localhost:3015/testing/fe-25-big-win` (sowie alle Spielrunden mit Multiplikator $\ge 15\times$) | [`src/components/casino/BigWinOverlay.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/BigWinOverlay.tsx)<br>Zentraler Schriftzug (`BIG WIN!`, `MEGA WIN!`) und Gewinnbetrag | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_1_big_win.png)<br>![Big Win](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_1_big_win.png) | **Höchste emotionale Belohnung:** Der Gewinnbetrag und das Sieges-Banner bestehen aus Millionen mikroskopischer Goldstaub-Partikel. Wenn der Spieler die Maus bewegt, wirbeln die Partikel wie echter Goldglitter auf und schnappen durch Federphysik elastisch in die Zahlen zurück. |
| **P2** | **Lobby Hero H1 Headline** | `http://localhost:3015/` | [`src/components/home/LobbySectionHeader.tsx`](file:///v:/VibeCoding/Casino/src/components/home/LobbySectionHeader.tsx) / Hero-Bereich<br>H1: `NEXT LEVEL VIP CASINO.` | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_2_lobby_hero.png)<br>![Lobby Hero](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_2_lobby_hero.png) | **Sofortige Immersion beim Betreten:** Der erste Blick auf die Plattform demonstriert State-of-the-Art-Webtechnik. Die glänzenden goldenen Buchstaben der Headline reagieren auf den Mauszeiger des Besuchers, ohne das Lesbarkeits-Fundament zu verlieren. |
| **P3** | **High-Roller Vault Elite-Header** | `http://localhost:3015/vault` | [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)<br>Vault Profil- & Progression-Header (`VibeCoder_Royale`, Balance, VIP Tier) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_3_vault_header.png)<br>![Vault Header](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_3_vault_header.png) | **Private-Banking-Exklusivität:** Die High-Roller-Schatzkammer erhält einen auratischen Partikel-Glanzeffekt für die VIP-Zahlen und den Nutzernamen. Unterstreicht den Tresor-Charakter durch dynamischen Goldstaub. |

---

## 2 — Technische Machbarkeits- & Performance-Bewertung

- **Canvas-Performance:** HTML5 2D Canvas mit `OffscreenCanvas`-Unterstützung garantiert 60–120 FPS.
- **Mobile Fallback:** Auf Touch-Devices ($< 1024\text{ px}$) schaltet die Komponente automatisch auf statische CSS-Glanz-Typografie um, um die GPU/Akkulaufzeit von Mobilgeräten zu schonen.
- **Asset-Größe:** Keine schweren 3D-Models oder Three.js-Bundles erforderlich; reine 2D-Point-Array-Physik (< 8 KB komprimiert).

---

## 3 — Next-Level Potenziale & Zukunftserweiterungen

1. **Audio-Reaktive Frequenzkopplung:** Anbindung an die Web Audio API (`AnalyserNode`). Beim Abspielen der Big-Win-Fanfare vibrieren und pulsieren die Goldpartikel synchron zum Bass und den Höhen der Soundkulisse.
2. **Inertial Mouse Fling (Kometenschweif):** Schnelle Wischbewegungen des Cursors verleihen den Goldpartikeln echten Richtungs-Impuls (Momentum), sodass ein Schweif aus Goldstaub über das Obsidian-Interface gezogen wird, bevor die Federkraft sie zurückzieht.
3. **Specular Light Raytracing:** Dynamische Lichtbrechung je nach Cursor-Distanz, die den Eindruck erweckt, als würde eine reale Lichtquelle über geschliffenen Goldschmuck wandern.

