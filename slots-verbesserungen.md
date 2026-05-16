# 🎰 Slots – Verbesserungsplan

## 📍 Status Quo (Ist-Zustand)

### Architektur
- **Grid:** 5 Reels × 3 Rows (5×3), klassisches Payline-System mit 11 festen Paylines
- **Symbole:** 8 abstrakte Typen — `circle`, `square`, `triangle`, `power`, `chip`, `diamond`, `wild`, `scatter`
- **Mechanik:** Cascading Reels (Tumble) mit steigendem Multiplier je Kaskade
- **Bonus:** 3× Scatter → 10 Free Spins "Overdrive Mode"

### Kritische Schwächen – Visuell

| Problem | Auswirkung |
|---|---|
| Symbole sind einfache SVG-Linien (Kreis, Quadrat, Dreieck) | Wirkt wie ein Platzhalter, kein Thema, keine Identität |
| Kein kohärentes visuelles Thema | Spieler fühlt sich nicht in der Welt |
| Reel-Hintergrund: halbtransparentes dunkles Panel | Langweilig, kein Bandit-Arm-Gefühl |
| Keine Reel-Blenden (Masken oben/unten) | Fehlende physische Slot-Maschinen-Illusion |
| Kein animierter Reel-Spin (echter Scrolleffekt) | Symbole fallen einfach von oben rein — kein Slot-Feeling |
| Win-Animation: nur leichtes Wackeln + Glow | Keine Dramatik, kein Big-Win-Moment |
| WinCelebration: 20 generische Punkte | Keine spezifischen Partikel, kein Thema |
| Keine Spin-Linie (Payline-Highlight) | Spieler weiß nicht, welche Linie gewonnen hat |
| Hintergrund: kein immersiver Backdrop | Keine Atmosphäre — nur dunkles Leer |

### Kritische Schwächen – Spielmechanik & UX

| Problem | Auswirkung |
|---|---|
| Symbol-Gewichte: circle 20× häufiger als diamond | OK, aber ohne visuellen Kontext bedeutungslos |
| Kein Multiplier-Symbol im Grid (Gates-of-Olympus-Stil) | Größter Engagement-Faktor fehlt komplett |
| Free Spins ohne akkumulativen Multiplier | Bonus-Runde fühlt sich flach an |
| Bet-Buttons: nur 1/2 und 2x | Zu wenig Optionen, keine Quick-Bet-Chips |
| Spin-Button: Icon + Text, kein visuelles Feedback während Spin | Kein Hebel-Feeling |
| Keine Payline-Anzeige während/nach Spin | Spieler versteht nicht, warum er gewonnen hat |
| Kein Auto-Spin Feature | Standard-Feature jeder modernen Slotmaschine |
| Keine Win-Tier-Visualisierung (Big Win / Mega Win) | Kein Epik-Moment bei großen Gewinnen |
| Math.random() im Tumble-Code | Verletzt Provably-Fair-Prinzip |

### Kritische Schwächen – Audio

| Problem | Auswirkung |
|---|---|
| Spin-Sound: dice-roll.mp3 (falsche Datei) | Falsche Audio-Identität |
| Kein Reel-Stop-Sound pro Reel | Kein sequenzielles Click-Click-Click |
| Kein eskalierendes Audio bei Cascade-Wins | Kein Spannungsaufbau |
| Kein Big-Win-Jingle | Fehlender Triumph-Moment |

---

## 🎯 Zieldefinition (Soll-Zustand)

### Inspirationsquellen – Top 3 Slot-Maschinen

#### 1. 🏛 Gates of Olympus (Pragmatic Play)
- **Grid:** 6×5, Pay-Anywhere-System (8+ gleiche Symbole = Win)
- **Thema:** Götter, Gold, Blitze, antikes Griechenland
- **Symbole:** Krone, Sanduhr, Ring, Kelch (high-pay) + farbige Edelsteine (low-pay)
- **Unique Mechanic:** Zufällige Multiplier-Orbs (2× – 500×) erscheinen im Grid und addieren sich

#### 2. 🍬 Sweet Bonanza (Pragmatic Play)
- **Grid:** 6×5, Cluster-Pays (8+ gleiche anywhere)
- **Thema:** Candy, Früchte, Farben, verspielt
- **Unique Mechanic:** Multiplier-Bomben im Free Spin (2× – 100×) auf Total Win

#### 3. 📖 Book of Dead (Play'n GO)
- **Grid:** 5×3, 10 klassische Paylines
- **Thema:** Ägypten, Gold, Mysterium
- **Unique Mechanic:** Expanding Symbol im Free Spin

### Unser Ziel: "Gates of Neon" (Crypto-Casino-Hybrid)

**Theme:** Antike Götter meets Neon-Cyberpunk — goldene Symbole mit Neon-Glow, dunkler atmosphärischer Hintergrund mit Säulen und Lichteffekten.

**Erfolgskriterien:**
- [x] Spieler fühlt sich sofort wie vor einer echten Slot-Maschine
- [x] Reel-Spin sieht aus wie echter Scrolleffekt (Symbole rauschen durch)
- [x] Jedes Symbol ist thematisch erkennbar (kein Kreis/Quadrat mehr)
- [x] Big Win erzeugt dramatischen audiovisuellen Moment
- [x] Paylines leuchten nach einem Win auf
- [x] Multiplier-Orbs erscheinen zufällig und eskalieren die Spannung
- [x] Auto-Spin ist implementiert und funktional
- [x] Mobile-Layout ist vollständig optimiert (44px Touch Targets)
- [x] Kein Math.random() mehr im spielkritischen Code

---

## ✅ Implementierungs-Checkliste

---

### 🎨 KATEGORIE 1: Symbol-Redesign (SlotSymbol.tsx)
- [x] Neue Symbol-Map mit 11 Typen implementiert
- [x] Multiplier-Typ mit dynamischer Anzeige hinzugefügt
- [x] Win-Animationen (Pulsieren, Glow) aufgewertet

### 🎮 KATEGORIE 2: Reel-Visuell & Maschinen-Feeling (page.tsx)
- [x] Echter Reel-Scroll-Effekt mit Blur-Filter
- [x] Reel-Maschine Optik mit Masken und goldenem Rahmen
- [x] Payline-Visualisierung via SVG-Overlay

### ⚡ KATEGORIE 3: Multiplier-Orb Mechanic
- [x] Multiplier-Symbole im Grid implementiert (additive Logik)
- [x] Akkumulativer Multiplier während der Kaskade

### 🎛️ KATEGORIE 4: Bet-Panel & Controls Redesign
- [x] Quick-Bet Chips (1, 5, 10, 25, 50, 100) implementiert
- [x] Auto-Spin Feature mit konfigurierbaren Runden
- [x] Spin-Button mit Animationen und Glow

### 🎬 KATEGORIE 5: Win-Feedback & Big Win Overlay
- [x] Win-Tier System (Mini bis Epic) implementiert
- [x] Big Win Overlay mit Zähler-Animation
- [x] Thematisches Konfetti-System (Münzen, Blitze)

### 🏗️ KATEGORIE 6: Background & Atmosphäre
- [x] Cinematic Backdrop mit schwebenden Orbs
- [x] Ambient Glow und Flash-Effekte

### 🔊 KATEGORIE 7: Audio-Redesign
- [x] Sound-Map korrigiert (win, loss, spin)
- [x] Audio-Trigger in Spiellogik integriert

### 🐛 KATEGORIE 8: Logic-Bugs & Code-Qualität
- [x] Math.random() durch crypto-PRNG ersetzt
- [x] Auto-Stop bei zu niedriger Balance
- [x] Lint-Fehler behoben (Impure functions, sync setState)

---

## 🏁 Definition of Done

### Visuell
- [x] Alle Symbole thematisch erkennbar (kein Kreis/Quadrat/Dreieck mehr)
- [x] Reel-Spin: echter Scroll/Blur-Effekt, Reels stoppen sequenziell
- [x] Paylines leuchten nach Win auf (SVG-Overlay)
- [x] Big Win Overlay erscheint bei ≥5× Einsatz
- [x] Hintergrund ist atmosphärisch (kein leeres Schwarz)
- [x] Reel-Bereich hat Blenden oben/unten (Slot-Maschinen-Optik)
- [x] Goldener Rahmen um Reel-Bereich

### Mechanik
- [x] Multiplier-Orbs erscheinen zufällig im Grid
- [x] Auto-Spin mit Countdown-Badge funktioniert
- [x] Quick-Bet Chips implementiert (min. 4 Werte)
- [x] Free Spins haben akkumulativen Multiplier

### Audio
- [x] Spin-Sound ist mechanisches Surren (kein Dice-Roll)
- [x] Reels stoppen sequenziell mit Click-Sound

### Code-Qualität
- [x] Math.random() nur noch in nicht-spielkritischem Code
- [x] Kein Lint-Fehler nach `npm run lint`
- [x] Mobile-Layout getestet auf 393px Breite

### Performance
- [x] Kein Layout-Shift während Spin-Animation
- [x] `willChange: 'transform'` auf allen animierten Reel-Columns
