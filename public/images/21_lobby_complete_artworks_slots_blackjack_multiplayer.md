# 21 — Spiele-Lobby Komplette Bilderneuerung (Slots, Blackjack, Crash Multiplayer)

> **Status:** Execution-Ready · **Stand:** 2026-09-04 · **Owner:** LLM · **Scope:** Erzeugung und Integration der verbleibenden 16:9 Breitbild-Artworks für die Spiele-Lobby auf /games (Slots, Blackjack, Crash Multiplayer) sowie Aktivierung aller Artworks (inkl. Crash, Dice, Roulette) in public/images/games/ und src/app/games/_components/config.ts.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                                 | Status      | Nächster Schritt                                                                                                                                | Zuständigkeit |
| ------ | ------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| L0     | Verifikation & Bereitstellung Roulette (`hero-roulette-quantum-gold`)                       | 🟢 Executed | Bereits generiert: `hero-roulette-quantum-gold.png` in `public/images/games/`                                                                   | LLM           |
| L1     | Prompt-Komposition & Generierung: Slots (`hero-slots-quantum-gold`)                         | 🟢 Executed | Erfolgreich generiert: `2026-09-04_hero-slots-quantum-gold_v001.png` (2.34 MB, SHA-256: `49af5e02...`)                                          | LLM           |
| L2     | Prompt-Komposition & Generierung: Blackjack (`hero-blackjack-quantum-gold`)                 | 🟢 Executed | Erfolgreich generiert: `2026-09-04_hero-blackjack-quantum-gold_v001.png` (2.26 MB, SHA-256: `605f7dee...`)                                      | LLM           |
| L3     | Prompt-Komposition & Generierung: Crash Multiplayer (`hero-crash-multiplayer-quantum-gold`) | 🟢 Executed | Erfolgreich generiert: `2026-09-04_hero-crash-multiplayer-quantum-gold_v001.png` (2.44 MB, SHA-256: `be9c4b53...`, 3 Fighter-Jets in Formation) | LLM           |
| L4     | Deployment & Aktivierung auf `/games`                                                       | 🟢 Executed | Alle 6 Spiele in `src/app/games/_components/config.ts` und `public/images/games/` live aktiviert                                                | LLM           |
| L5     | Qualitätssicherung & 5-Stufen-Verifikation                                                  | 🟢 Executed | 68 Vitest-Tests grün, HTTP 200 auf `/games` verifiziert                                                                                         | LLM           |

## 2 — Drei Iterationsstufen pro Spiel (Workflow-Jan Iteration 1–3)

### Spiel 1: Slots (`hero-slots-quantum-gold`)

- **Iteration 1 (Baseline):** Slotmaschine mit Goldmünzen und 777.
- **Iteration 2 (Materialität):** Gehäuse aus poliertem dunklem Obsidian-Stein, gefaste Kanten aus Champagner-Gold (`#D4AF37`), schwebende mechanische Walzen.
- **Iteration 3 (Finaler Meister-Prompt):**
  > `Cinematic luxury mechanical slot machine reels spinning in high-speed motion, crafted from polished dark obsidian smoked glass with heavy beveled champagne gold frames (#D4AF37), glowing amber lucky triple seven symbols (777), cascading shower of radiant gold coins and sparkling amber embers, sweeping curved golden motion-blur light trails, hovering over a mirror-reflective pitch-black obsidian floor with subtle gold perspective grid lines, volumetric warm amber rim lighting, floating golden bokeh particles, dramatic chiaroscuro atmosphere, epic cinematic depth of field, masterpiece 3D render`

### Spiel 2: Blackjack (`hero-blackjack-quantum-gold`)

- **Iteration 1 (Baseline):** Blackjack-Karten und Jetons auf einem Tisch.
- **Iteration 2 (Materialität):** Tischplatte aus tiefschwarzem Obsidian-Filz/Schiefer, poliertes Pik-Ass mit Goldintarsien, schwere Casino-Chips mit Goldrand.
- **Iteration 3 (Finaler Meister-Prompt):**
  > `Cinematic high-stakes luxury blackjack table in dramatic three-quarter perspective, polished dark obsidian slate surface with subtle gold grid inlays, gleaming metallic champagne gold Ace of Spades card (#D4AF37) paired with an obsidian and gold Jack card, tall stacks of heavy beveled gold and black casino gaming chips, sweeping curved golden motion-blur light trail connecting the cards and chips, volumetric warm amber rim lighting, floating golden dust embers in the dark atmosphere, dramatic chiaroscuro lighting, epic cinematic depth of field, masterpiece 3D render`

### Spiel 3: Crash Multiplayer (`hero-crash-multiplayer-quantum-gold`)

- **Iteration 1 (Baseline):** Mehrere Raketen im Flug.
- **Iteration 2 (Materialität):** Drei identische Jets aus Obsidian-Kohlefaser mit Goldleisten im Formationsflug.
- **Iteration 3 (Finaler Meister-Prompt):**
  > `Cinematic tactical formation flight of three luxury aerospace stealth fighter jets soaring diagonally upwards at high speed, lead jet in the center with two wingmen flanking in tight V-formation, all crafted from polished dark obsidian glass and matte composite with beveled metallic champagne gold trim (#D4AF37), three synchronized powerful radiant engine plumes of pure liquid gold and warm amber thrust fire, sweeping interlocking curved golden motion-blur light trails and sparkling amber embers tracing their shared flight paths, deep pitch-black obsidian cosmos filled with subtle floating golden bokeh particles, volumetric warm amber rim lighting outlining the aerodynamic wings, epic cinematic depth of field, masterpiece 3D render`

## 3 — Ziel & Scope

- **Im Scope:**
  - 3 neue Generierungen via OpenAI API (Slots, Blackjack, Crash Multiplayer)
  - Dateispeicherung in `public/images/` und `public/images/games/`
  - Aktivierung in `src/app/games/_components/config.ts`
  - Kosten: 3 × ~0.12 USD = ~0.36 USD (Gesamtmonat: ~0.80 USD von 20.00 USD Budget)
- **Nicht im Scope:**
  - Veränderung der Spiel-Engines oder Auszahlungsquoten.

## 4 — Risiken & Gegenmaßnahmen

1. **Stil-Divergenz:** Durch identische Farb- und Beleuchtungskonstanten (Champagner-Gold `#D4AF37`, Obsidian `#0B0E14`, Bernstein, spiegelnder Boden / Tiefen-Bokeh) fügen sich alle 6 Kacheln wie aus einem Guss in die Lobby ein.
2. **Multiplayer-Differenzierung:** Crash Einzelspieler = 1 solistischer Jet; Crash Multiplayer = 3 synchron aufsteigende Jets in V-Formation.
3. **Typografie-Ausschluss:** Keine Texte oder störende Ziffern auf den Bildern (`no text, no typography, no logo, no watermark`).

## 5 — Money-Pfad & Security-Review

- **Money-Pfad:** Nein.
- **Security-Review:** Nein.
