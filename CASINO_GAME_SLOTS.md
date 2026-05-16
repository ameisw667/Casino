# Casino Game Specification: Slots

## 1. Walzen-Struktur & Gewinnlinien
- **Struktur:** Klassisches 5x3 Setup (5 Walzen, 3 sichtbare Reihen).
- **Paylines:** 20 feste Gewinnlinien, visuell einblendbar bei Hover oder Klick auf "Info".

## 2. Symbole & Features
- **Hierarchie:** 4 Low-Tier (J, Q, K, A), 3 High-Tier (Themen-Symbole), 1 Wild (ersetzt alle außer Scatter), 1 Scatter (Bonus-Trigger).
- **Freespins:** 3 Scatter-Symbole lösen 10 Freispiele aus. Der Hintergrund wechselt in einen "Neon-Overdrive"-Modus (dunkler, leuchtendere Farben).

## 3. Animation & Sound
- **Teaser-Spin:** Wenn Walze 1-4 bereits 2 Scatter zeigen, dreht sich Walze 5 verlangsamt mit dramatischem Glühen und ansteigendem Sound (Herzschlag-Audio).
- **Big Win:** Ab 20x Einsatz = "Big Win", ab 50x = "Mega Win", ab 100x = "Epic Win". Animierter Goldregen und wackelnder Bildschirm bei Epic Wins.
- **Sound-Design:** Atmosphärischer Synth-Wave Loop, mechanische Klick-Sounds beim Walzen-Stopp, wuchtiger Impact-Sound für Scatter.

## 4. Gameplay-Steuerung
- **Auto-Spin & Turbo:** Toggle für Turbo-Modus (verdoppelt Animationsgeschwindigkeit). Auto-Spins konfigurierbar (10, 50, 100) mit Limits.
- **RTP & Volatilität:** RTP auf 96.5% konfiguriert. Hohe Volatilität (seltenere, aber höhere Gewinne).

## 5. Backend-Logik
- **Abwicklung:** Walzen-Ergebnis wird asynchron angefordert. Die visuelle Drehanimation startet sofort (Optimistic UI Start) und läuft solange im Loop, bis der Payload vom Server eintrifft und die Stopp-Sequenz einleitet.
