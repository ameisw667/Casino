# Proposal: Kinetic Text Reveal

> **Offizielle Componentry-Dokumentation:** [componentry.dev/docs/components/kinetic-text-reveal](https://componentry.dev/docs/components/kinetic-text-reveal)  
> **Kategorie:** Motion / Kinetic Typography / Dynamic Game State Feedback  
> **Technologie:** Framer Motion + Velocity Skew + Diagonal Split-Slice Masking  
> **Bewertung:** ⭐⭐ Bestätigt

---

## 1 — Drei konkrete Integrationsvorschläge

| # | Vorschlag / Feature | Vollständige Ziel-URL | Betroffene Datei & Sektion | Vorschau-Screenshot (Nur Ziel-Sektion) | UX-Impact & Luxury Rationale |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **K1** | **Crash Game: Multiplikator- & Crash-Status-Overlay** | `http://localhost:3015/games/crash` | [`src/components/casino/games/crash/`](file:///v:/VibeCoding/Casino/src/components/casino/games/crash/)<br>Zentrales Canvas-Status-Overlay (`CRASHED @ 2.45x`, `WAITING FOR NEXT LAUNCH...`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_1_crash.png)<br>![Crash Game](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_1_crash.png) | **Maximale Dramatik im Moment des Crashs:** Statt eines simplen Text-Swaps zerschneidet der Crash-Moment die Typografie (`CRASHED`) in zwei kinetisch gegeneinander versetzte Schichten (Split-Slice), die mit haptischem Ruck einrasten. |
| **K2** | **Blackjack: Tisch-Entscheidungs-Banner (Round Verdict)** | `http://localhost:3015/games/blackjack` | [`src/app/games/blackjack/BlackjackClient.tsx`](file:///v:/VibeCoding/Casino/src/app/games/blackjack/BlackjackClient.tsx)<br>Zentrales Tisch-Ergebnis-Banner (`DEALER BUSTS`, `BLACKJACK 3:2`, `PUSH`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_2_blackjack.png)<br>![Blackjack Table](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_2_blackjack.png) | **Cinematische Eleganz wie im James-Bond-Casino:** Die Spielentscheidung wird mit edler elastischer Trägheit (Velocity Skew) horizontal enthüllt. Verleiht jedem Coup die Gravitas eines High-Stakes-Showdowns in Monte Carlo. |
| **K3** | **Roulette: Croupier-Callout & Gewinnzahl-Enthüllung** | `http://localhost:3015/games/roulette` | [`src/app/games/roulette/RouletteClient.tsx`](file:///v:/VibeCoding/Casino/src/app/games/roulette/RouletteClient.tsx)<br>Croupier-Statusleiste & Gewinnzahlen-Callout (`CROUPIER: „RIEN NE VA PLUS“`, `17 BLACK - ODD`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_3_roulette.png)<br>![Roulette Wheel](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_3_roulette.png) | **Klassische Casino-Tradition trifft High-Tech-Motion:** Sobald die Kugel im Fach zur Ruhe kommt, schneidet der Gewinn-Callout mit einer kinetischen Dreh-Enthüllung über das Tableau auf. |

---

## 2 — Technische Machbarkeits- & Performance-Bewertung

- **Render-Technik:** GPU-beschleunigte CSS-Masken (`clip-path: polygon(...)`) und Framer Motion `transform: skewX(...)` ohne Layout-Thrashing.
- **Synchronisation mit Spiel-Engine:** Exakte Koppelung an Game-Events (`onCrash`, `onDealerStand`, `onWheelStop`), zero Latenzverzögerung beim Settlement.
- **Accessibility:** Vollständig screenreader-kompatibel (`aria-live="polite"` für Status-Ansagen).

---

## 3 — Next-Level Potenziale & Zukunftserweiterungen

1. **Mechanischer Shutter-Sound-Sync:** Synchrones, metallisches Einrast-Geräusch via `soundManager`, wenn die Schnittkanten der kinetischen Typografie mit elastischem Stopp aufeinanderprallen.
2. **RGB Chromatic Aberration bei High Multipliers:** Bei extremen Spielrunden ($\ge 10\times$ in Crash oder Blackjack-Surrender) erzeugt der kinetische Reveal eine subtile Farb-Dispersions-Spaltung (Rot/Cyan-Shift) an den Schnittkanten.
3. **Einsatz-Skalierte Trägheit (Momentum Scaling):** Die physikalische Geschwindigkeit und Trägheit des Text-Slices skaliert dynamisch mit der Einsatzhöhe — High-Roller-Einsätze explodieren förmlich in das Spielfeld.

