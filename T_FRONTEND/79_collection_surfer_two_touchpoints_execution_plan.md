# 79 — Collection Surfer (2-Touchpoint Execution Plan)

> **Status:** Execution-Ready · **Niveau:** Weltklasse (Top 1% Haute Horlogerie Standard)  
> **Offizielle Componentry-Spezifikation:** [componentry.dev/docs/components/collection-surfer](https://componentry.dev/docs/components/collection-surfer)  
> **Kern-Technologie:** Pointer Velocity Surfing + Inertial Friction Decay + Dynamic Elevation Tilt  
> **Scope:** Zwei separierte Touchpoints (U2: Live Payouts Ticker, U3: Bet History Browser) — *U1 auf Nutzeranweisung ausgeschlossen*

---

## 1 — Executive Summary & Status Quo Bewertung

Live-Gewinn-Ticker und Tabellen vergangener Spielrunden laufen oft als monotone, unbeeinflussbare Laufbänder oder sperrige Tabellenzeilen ab. Durch den **Collection Surfer** wird das horizontale Durchforsten von Transaktionen und Gewinnen zu einem flüssigen Gleiterlebnis: Spieler können den Stream mit feinen Mausbewegungen oder horizontalen Swipes beschleunigen, abbremsen und „surfen“. Die jeweils im Fokus liegende Gewinn-Karte hebt sich mit dreidimensionaler Erhebung (Elevation) und Glanzlicht hervor.

### Status Quo Bottleneck-Matrix

| Touchpoint | Aktueller Zustand | Defizit / Bottleneck | Ziel-Architektur (Collection Surfer) |
| :--- | :--- | :--- | :--- |
| **U2: Live Payouts Ticker** | Starres horizontales Laufband ohne Interaktion | Passiver Eindruck; Spieler können nicht anhalten oder nachsehen | Taktiler Gewinner-Stream: Interaktives Surfen mit magnetischem Snap auf High-Roller-Wins |
| **U3: Bet History Browser** | Standard-Datentabelle mit Pagination | Fühlt sich an wie ein Buchhaltungs-Auszug statt ein Casino-Erlebnis | Horizontale Chronik: Elegantes Surfen durch vergangene Spielrunden mit sofortigem Replay |

---

## 2 — Touchpoint U2: Live Payouts & Big Wins Stream

### 2.1 Spezifikation & Ziel-Umgebung
- **Vollständige URL:** `http://localhost:3015/games` (sowie Lobby)
- **Betroffene Datei:** [`src/app/games/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx) (Live Win Ribbon)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_surfer_2_live_payouts.png)  
  ![Live Payouts](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_surfer_2_live_payouts.png)

### 2.2 Technische Architektur & Komponenten-Aufbau
1. **Inertial Momentum Loop:**
   - Grundgeschwindigkeit: $0.6\text{ px/Frame}$ (langsamer, würdevoller Autoplay-Drift).
   - Mausbewegung über den Ticker: Dynamische Beschleunigung proportional zur Cursor-Geschwindigkeit (`velocity * 1.4`).
2. **Karten-Elevation bei Annäherung:**
   - Sobald die Maus über eine Einzelgewinn-Plakette fährt, verlangsamt sich der Drift; die Plakette hebt sich ($z = +16\text{ px}$) und spiegelt den Auszahlungsbetrag in Smaragdgrün (`#10B981`) wider.

---

## 3 — Touchpoint U3: Bet History & Round Replay Browser

### 3.1 Spezifikation & Ziel-Umgebung
- **Vollständige URL:** `http://localhost:3015/history`
- **Betroffene Datei:** [`src/app/history/page.tsx`](file:///v:/VibeCoding/Casino/src/app/history/page.tsx) (Runden-Verlauf)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_surfer_3_history_bets.png)  
  ![History Bets](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_surfer_3_history_bets.png)

### 3.2 Technische Architektur & Komponenten-Aufbau
1. **Fluid Card Deck (Historien-Karten):**
   - Jede Spielrunde (Spielart, Einsatz, Multiplikator, Gewinn/Verlust, Zeitstempel) als geschliffene Obsidian-Karte.
   - Spieler gleiten mit Mausrad oder Zeiger-Wisch durch ihre letzten 25 Runden.
2. **Instant Details Callout:**
   - Klick auf eine Historien-Karte öffnet sofort das Provably-Fair Seed-Verifikationsfenster für genau diesen Spielzug.

---

## 4 — Haute Horlogerie 10-Punkte Qualitätskatalog

1. **60 FPS Hardware-Gleitflug:** Transformation ausschließlich über CSS `translateX` mit GPU-Subpixel-Präzision.
2. **Keine Kollision mit vertikalem Scrollen:** Horizontales Surfen sperrt nicht den Hauptseiten-Scroll.
3. **Virtuelles Windowing:** DOM-Recycling bei mehr als 20 Elementen für minimale Speichernutzung.
4. **Physikalische Trägheitsdämpfung:** Exponentieller Abklingkoeffizient (`friction = 0.94`).
5. **Mobile Touch-Support:** Nativer elastischer iOS/Android-Overscroll am Ende der Liste.
6. **Echtzeit-Synchronisation:** Neue Live-Gewinne sliden nahtlos von rechts ein, ohne bestehende Surfbewegungen zu unterbrechen.
7. **Accessibility:** Vollständige Tastatursteuerung via Pfeiltasten (`ArrowLeft` / `ArrowRight`).
8. **Edle Kanten-Vignette:** Weiche seitliche Gradienten-Maske (`mask-image: linear-gradient(...)`) verhindert harte Schnitte an den Bildschirmrändern.
9. **Zero Hydration Error:** Determinierte SSR-Initialposition.
10. **TDD-Verifikation:** Abdeckung von Geschwindigkeit, Umkehrpunkten und Touch-Cancel-Events.

---

## 5 — 5-Phasen-Execution-Roadmap

- [ ] **Phase 1: Collection Surfer Primitive:** Erstellung von `src/components/casino/motion/CollectionSurfer.tsx`.
- [ ] **Phase 2: Touchpoint U2 Integration:** Veredelung des Live-Gewinn-Streams in `src/app/games/page.tsx`.
- [ ] **Phase 3: Touchpoint U3 Integration:** Modernisierung des History-Browsers in `src/app/history/page.tsx`.
- [ ] **Phase 4: 5-Stufen-DoD & Audit:**
  - `npm run typecheck` (0 Fehler)
  - `npm test` (100% grün)
  - `npm run lint` (0 Fehler)
  - Playwright Screenshot-Verifikation beider Streams
