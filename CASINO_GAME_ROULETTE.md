# Casino Game Specification: Roulette

## 1. Spieltyp & Visualisierung
- **Roulette-Typ:** European Roulette (Eine Null: 0) zugunsten eines besseren RTP für die Spieler (2.7% Hausvorteil).
- **Visualisierung:** Flaches 2D-Top-Down-Rad für blitzschnelle Runden und perfekte Mobile-Kompatibilität. Ein 3D-Highlight läuft beim Rollen über die Zahlen.

## 2. UI/UX & Wettfeld
- **Mobile Wettfeld:** Pinch-to-Zoom für präzise Wetten. Eine Lupe erscheint beim Gedrückthalten (Touch), um Splits und Corners exakt zu treffen.
- **Chip-System:** 1, 5, 25, 100, 500. Ein "Custom Chip"-Feld für Highroller.
- **Komfortfunktionen:** Buttons für "Clear", "Undo" (letzter Chip weg), "Double" und "Re-Bet" sind zwingend für ein schnelles Gameplay.

## 3. Spezialwetten & Statistiken
- **Racetrack:** Optionaler Toggle für Racetrack-Wetten (Voisins, Orphelins, Tiers) für fortgeschrittene Spieler.
- **Statistik:** Ein Balken am oberen Rand zeigt die letzten 10 Zahlen (rot/schwarz hinterlegt) sowie einen Button für Hot/Cold Numbers.

## 4. Multiplayer & Backend
- **Multiplayer-Tisch:** Optional zuschaltbare Geister-Chips anderer Live-Spieler.
- **Animations-Geschwindigkeit:** Eine Kugel-Roll-Phase dauert 4 Sekunden. Kann durch Klick auf den Bildschirm übersprungen ("Quick Resolve") werden.
- **Backend-Settlement:** Alle Chip-Platzierungen werden lokal im Zustand gesammelt. Erst bei Klick auf "Spin" wird ein gebündeltes Payload-Array gesendet, um API-Calls zu minimieren.
