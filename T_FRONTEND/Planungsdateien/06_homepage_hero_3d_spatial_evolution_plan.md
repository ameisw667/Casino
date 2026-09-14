# 06 — Homepage Hero: 3D-Spatial Evolution & Live Content Storyline (Phase 4)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Weiterentwicklung der Homepage-Hero-Bühne (`/`) — Hinzufügen hochrelevanter 3D-Scrollytelling-Animationen oben rechts (schwebende Z-Depth-Elemente/Chips), Ersetzung des 500×-Multipliers durch ein hochrelevantes Casino-Kernelement (Live Progressive Jackpot / VIP Relic), sowie Schärfung der Scrollytelling-Dramaturgie.
> **Money-Pfad:** Nein · **Security-Review:** Nein — reiner Visual- & Animation-Layer.

---

## 1 — Status-Quo-Evaluation & Analyse der Jan-Screenshots

### Was funktioniert bereits exzellent?

1. **Monumentales 3D-Portal (0 % Scroll):**
   - Das Stargate-Siegel wirkt mit 480 px Basisdurchmesser bereits majestätisch und füllt die rechte Bühnenhälfte plastisch aus.
   - Das störende "PROVABLY FAIR"-Badge ist restlos eliminiert; die Komposition wirkt deutlich ruhiger und hochwertiger.
2. **Kinetischer 3D-Turn beim Scrollen:**
   - Die Achsenrotation (`rotateY: 180°`) und das Entgegenfliegen der Ace-Karte erzeugen echte räumliche Tiefe.
3. **Fließender Übergang in Sektion 2:**
   - Durch die weiche Nebel-Diffusion entstehen keine harten Bruchkanten zum Bento-Grid.

### Schwachstellen & Optimierungspotenziale (Basis für Phase 4):

1. **Rechts oben ungenutztes Raumvakuum:**
   - Oberhalb des Portals und im oberen rechten Quadranten fehlt bisher eine zweite räumliche Ebene (Z-Staffelung). Das Stargate steht dort aktuell solitär. Zusätzliche 3D-Animationen (z. B. im Raum schwebende und beim Scrollen auseinanderdriftende 3D-Casinochips oder Partikel-Verwirbelungen) würden den Raum cineastisch aufladen.
2. **Inhaltlicher Bruch auf der linken Seite (30 % – 75 % Scroll):**
   - Das Timing und die Typografie des aufsteigenden Elements funktionieren zwar technisch sauber, doch der Inhalt (`500× Multiplier`, `0.00s`, `99.4%`) wirkt generisch und löst beim Spieler keinen direkten "Casino-Nervenkitzel" aus.
   - **Handlungsempfehlung:** Ersetzung durch den **Live Progressive Jackpot** (mit dynamic ticker & glow) oder ein **VIP Genesis Relic** mit echten Live-Highlights.
3. **Scrollytelling-Rhythmus:**
   - Der Eintritt des linken Elements kann noch präziser auf die 3D-Aktion des Portals abgestimmt werden (Camera Shake, Lichtblitz beim Erreichen des Jackpots).

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                      | Scope (Dateien)                                                            | Ausführung  |   Status    | Zuständigkeit | Verifikation                                                      |
| :----- | :----------------------------------------------- | :------------------------------------------------------------------------- | :---------- | :---------: | :-----------: | :---------------------------------------------------------------- |
| **L0** | **Option-Gate & Freigabe Jan**                   | `T_FRONTEND/Planungsdateien/06_homepage_hero_3d_spatial_evolution_plan.md` | Sequenziell | 🟡 Gate Jan |   Jan / LLM   | Jan bestätigt Option A, B oder C                                  |
| **L1** | **Rechts Oben: 3D Orbital-Animationen**          | `HeroScrollyDesktopPortalVisual.tsx`, `HeroScrollyStage.tsx`               | Sequenziell | 🔴 Geplant  |      LLM      | Schwebende 3D-Chips/Tiefenelemente mit Z-Drift beim Scrollen      |
| **L2** | **Links: Ersetzung Multiplier-Storyline**        | `HeroJackpotStoryline.tsx` [NEW], `HeroScrollyStage.tsx`                   | Sequenziell | 🔴 Geplant  |      LLM      | Live Progressive Jackpot Ticker / Vault / Highlights integriert   |
| **L3** | **Cineastische Licht- & Kamera-Choreografie**    | `HeroScrollyStage.tsx`, `HeroMorphCurtain.tsx`                             | Sequenziell | 🔴 Geplant  |      LLM      | Perfekte Synchronisation zwischen 3D-Roll und linkem Live-Element |
| **L4** | **5-Stufen-DoD (Typecheck, Test, Build, Audit)** | `npm run typecheck`, `npm test`, `npm run build`                           | Sequenziell | 🔴 Geplant  |      LLM      | 100% grün, 0 Layout-Issues auf `/`                                |
| **L5** | **Visuelle Verifikation & 10%-Sequenz**          | `scripts/capture-10pct-steps.mjs`                                          | Sequenziell | 🔴 Geplant  |      LLM      | 11 verifizierte Screenshots mit Bildanalyse                       |

---

## 3 — Jan Option-Gate (3 Handlungsoptionen)

| Kriterium                               | Gewichtung |
| :-------------------------------------- | :--------- |
| **Visuelle Exzellenz & Awwwards-Punch** | 35 %       |
| **Casino-Reiz & Spieler-Konvertierung** | 30 %       |
| **Wartbarkeit & Performance**           | 20 %       |
| **Aufwand / Komplexität**               | 15 %       |

### Vergleichsmatrix

| Option | Konzept Rechts Oben (3D)                                                                                                                                                                               | Konzept Links (Scroll-Storyline)                                                                                                                                                        | Visueller Punch (35%) | Casino Reiz (30%) | Stabilität (20%) | Aufwand (15%) |  Gesamtscore   | Empfehlung       |
| :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------: | :---------------: | :--------------: | :-----------: | :------------: | :--------------- |
| **A**  | **Orbital 3D-Chips & Quantum Cluster:** Drei physikalisch gerenderte, schwebende 3D-Casinochips im oberen rechten Raum, die beim Scrollen auf einer räumlichen Z-Kurve taumeln und auseinanderdriften. | **Live Progressive Jackpot & Vault Pool:** Monumentaler live hochzählender Jackpot (`$2,849,380.00` in Gold-Tabular-Nums), pulsierender Live-Drop-Beacon und High-Roller Payout Badges. |          4.8          |        4.9        |       4.6        |      4.2      | **4.70 / 5.0** | ✅ **Empfohlen** |
| **B**  | **Generatives 3D-Relic (OpenAI Pipeline) & Prismen:** Exklusiv via OpenAI generiertes Key-Asset (z. B. Obsidian Crown oder Golden Dragon Relic) mit 3D-Tilt.                                           | **VIP Genesis Key & Live Activity Stream:** Interaktiver holografischer VIP-Pass mit Rakeback-Stufen und Live-Ticker der letzten Mega-Wins.                                             |          4.6          |        4.3        |       4.2        |      3.8      | **4.33 / 5.0** | ⚪ Alternativ    |
| **C**  | **Konzentrische 3D-Tiefenringe & Lichtstrahlen:** Erweiterung des bestehenden Portals um rotierende Tiefenringe und Partikellinsen ohne neue 3D-Mesh-Elemente.                                         | **Minimalistischer High-Roller Action Feed:** Schlanker Live-Ticker ohne Riesen-Ziffern; dezente Highlights der Plattform.                                                              |          4.0          |        3.8        |       4.8        |      4.7      | **4.20 / 5.0** | ⚪ Minimal       |

### Pre-Mortem der Führungsoption A

> _„Scheitert Option A in 6 Monaten, woran läge es?“_  
> Ein riesiger Jackpot-Betrag könnte überladen oder unruhig wirken, wenn er wie ein Standard-Blinkbanner animiert wird.  
> **Gegenmaßnahme:** Rigorose Umsetzung im edlen „Obsidian & Gold“-Designsystem — dezente Cinzel/Monospace-Typografie, sanftes Tabular-Zählen mit Framer-Motion/GSAP-Scrub, edle Glassmorphism-Stelen ohne grelle Farben.

---

## 4 — Offene Fragen an Jan zur Feinjustierung

1. **Inhalt der linken Scroll-Storyline:**
   - Bevorzugst du den **Live Progressive Jackpot** (`$2,849,380.00` Pool mit Live-Ticker) oder möchtest du stattdessen eine **VIP Genesis Key / Club-Highlight** Darstellung?
2. **OpenAI Bildgenerierung:**
   - Sollen wir für den rechten oberen Quadranten ein neues Bild-Asset über die OpenAI-Pipeline generieren (z. B. fotorealistische 3D Quantum Obsidian Chips oder eine Goldene VIP-Krone), oder die bestehenden handgefertigten SVG/CSS-3D-Chips mit Realtime-Shadows nutzen?
3. **Scroll-Verhalten:**
   - Soll die 3D-Animation rechts oben dauerhaft mitschweben (Parallaxe) oder synchron zum Stargate-Roll bei 50 % explodieren/wegdriften?
