# Proposal: Collection Surfer

> **Offizielle Componentry-Dokumentation:** [componentry.dev/docs/components/collection-surfer](https://componentry.dev/docs/components/collection-surfer)  
> **Kategorie:** 3D Cards / Fluid Browsing / Micro-Interactions  
> **Technologie:** Pointer Velocity Physics + Smooth Inertial Surfing + Card Elevation  
> **Bewertung:** ⭐⭐ Bestätigt („sehr gut“)

---

## 1 — Drei konkrete Integrationsvorschläge

| # | Vorschlag / Feature | Vollständige Ziel-URL | Betroffene Datei & Sektion | Vorschau-Screenshot (Nur Ziel-Sektion) | UX-Impact & Luxury Rationale |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **U1** | **Spielekatalog: Casino Originals Surfer-Leiste** | `http://localhost:3015/games` | [`src/components/casino/games/OriginalsCollectionSurfer.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/games/OriginalsCollectionSurfer.tsx)<br>Kopf-Leiste der 5 Casino Originals (Crash, Blackjack, Roulette, Dice, Slots) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_surfer_1_games_originals.png)<br>![Originals Surfer](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_surfer_1_games_originals.png) | **Müheloses, haptisches Gleiten durch Spiele:** Statt starrer Buttons surfen die Spielekarten mit physikalischer Trägheit unter dem Cursor. Die fokussierte Karte hebt sich mit vergrößerter Elevation und goldenem Glanzkegel hervor. |
| **U2** | **Lobby: Live Payouts & Recent Big Wins Stream** | `http://localhost:3015/games` (bzw. Lobby) | [`src/app/games/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx) / Live-Ticker<br>Horizontale Gewinn-Ticker-Zeile (`CryptoKing won $88.20`, etc.) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_surfer_2_live_payouts.png)<br>![Live Payouts](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_surfer_2_live_payouts.png) | **Taktiler Gewinner-Stream:** Der Ticker lässt sich per Mauswisch oder Cursor-Drift aktiv beschleunigen und surfen. Gewinne fühlen sich live und zum Greifen nah an. |
| **U3** | **History: Transaktions- & Rundengeschichte** | `http://localhost:3015/history` | [`src/app/history/page.tsx`](file:///v:/VibeCoding/Casino/src/app/history/page.tsx)<br>Verlauf der vergangenen Spielrunden | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_surfer_3_history_bets.png)<br>![Bet History](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_surfer_3_history_bets.png) | **Vom trockenen Bankauszug zur visuellen Chronik:** Spieler surfen durch ihre Spielrunden wie durch eine Galerie von High-Stakes-Karten mit instantanem Replay-Button. |

---

## 2 — Technische Machbarkeits- & Performance-Bewertung

- **Pointer Velocity Engine:** Nutzung von `useVelocity` und Spring-Interpolation für stufenlosen Nachlauf bei schnellen Mausbewegungen.
- **Virtualisierung bei langen Listen:** Automatisches Windowing für mehr als 20 Elemente, um den DOM-Tree schlank zu halten.
- **Scroll-Lock-Freiheit:** Horizontales Surfen blockiert nicht das vertikale Weiterscrollen der Seite.
