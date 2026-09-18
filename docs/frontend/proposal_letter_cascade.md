# Proposal: Letter Cascade

> **Offizielle Componentry-Dokumentation:** [componentry.dev/docs/components/letter-cascade](https://componentry.dev/docs/components/letter-cascade)  
> **Kategorie:** Typography / Numerical Displays / Micro-Interactions  
> **Technologie:** Mechanical Split-Flap Spring Physics + Cascading Character Waterfall  
> **Bewertung:** ⭐⭐ Bestätigt

---

## 1 — Drei konkrete Integrationsvorschläge

| # | Vorschlag / Feature | Vollständige Ziel-URL | Betroffene Datei & Sektion | Vorschau-Screenshot (Nur Ziel-Sektion) | UX-Impact & Luxury Rationale |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **L1** | **Live Progressive Jackpot: Wert- & Tier-Kaskade** | `http://localhost:3015/` (sowie globale Jackpot-Kacheln) | [`src/components/casino/jackpot/JackpotBanner.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/jackpot/JackpotBanner.tsx)<br>Zentrale Jackpot-Ziffernanzeige (`$1,085.64`) & Tier-Kopfzeile | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_1_jackpot.png)<br>![Jackpot Ticker](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_1_jackpot.png) | **Haptisches Luxus-Feedback bei jedem Zähler-Inkrement:** Wenn sich der progressive Jackpot durch Wetten erhöht oder ein neuer Meilenstein erreicht wird, fallen die Ziffern und Symbole in einer rhythmischen Buchstabenkaskade (wie bei einer Schweizer Flughafen- oder Luxus-Uhrenanzeige) vertikal ein. |
| **L2** | **Daily Tournament & Hall of Fame: Sieger-Podium** | `http://localhost:3015/leaderboard` | [`src/app/leaderboard/page.tsx`](file:///v:/VibeCoding/Casino/src/app/leaderboard/page.tsx)<br>Top-3-Podiumsplätze (Platz 1 Champion, Platz 2, Platz 3 mit Namen & Preispool) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_2_leaderboard.png)<br>![Leaderboard Podium](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_2_leaderboard.png) | **Dynamische Ranglisten-Aura:** Beim Laden der Seite oder Umschalten des Zeitfilters (Täglich / Wöchentlich / All-Time) rollen die Usernamen und Preisgelder versetzt von oben herab. Zelebriert die High-Roller-Champions visuell. |
| **L3** | **Dice Game: Multiplikator- & Wurfziel-Display** | `http://localhost:3015/games/dice` | [`src/components/casino/games/dice/v2/`](file:///v:/VibeCoding/Casino/src/components/casino/games/dice/v2/) bzw. Dice-Steuerung<br>Gewinnchance (`49.5%`), Wurfziel (`ROLL OVER 50.5`) & Multiplikator (`2.00x`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_3_dice.png)<br>![Dice Stage](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_3_dice.png) | **Ultra-flüssige Ziffern-Rolls:** Jede Bewegung des Schiebereglers lässt die Multiplikator-Ziffern in einer elastischen Kaskade durchrollen. Verleiht dem mathematischen Wettspiel eine unmittelbare, mechanisch greifbare Präzision. |

---

## 2 — Technische Machbarkeits- & Performance-Bewertung

- **Mechanik:** CSS `transform: translateY(...)` mit gestaffeltem Spring-Delay (`delay: i * 0.025s`) für stotterfreie 60 FPS Animationen.
- **Tabular Nums:** Feste Ziffernbreiten (`font-variant-numeric: tabular-nums`) verhindern horizontales Springen des Layouts während des Kaskadierens.
- **Zustands-Synchronisation:** Nahtlose Integration mit Supabase-Realtime-Websockets für Jackpot- und Leaderboard-Updates.

---

## 3 — Next-Level Potenziale & Zukunftserweiterungen

1. **Akustischer Luxus-Split-Flap („Chik-chik-chik“):** Feinstufig moduliertes mechanisches Klackern mit subtiler Pitch-Varianz ($\pm 3\,\%$) während des Durchrollens der Kaskade für echte Schweizer Luxus-Mechanik.
2. **3D Tumbling Perspective:** Zeichen fallen nicht nur 2D nach unten, sondern überschlagen sich leicht um die X-Achse (`rotateX: 90deg -> 0deg`), als würden massive Gold-Plaketten in ihre Fassung fallen.
3. **Milestone Amber Burst:** Beim Überschreiten glatter Betragsgrenzen ($1,000, $5,000, $10,000) entzündet die Ziffernkaskade einen kurzen goldenen Funken-Burst an den veränderten Stellen.

