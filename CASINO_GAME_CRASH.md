# Casino Game Specification: Crash

## 1. Kern-Physik & Visualisierung
- **Kurven-Logik:** Klassisch exponentielles Wachstum ($multiplier = e^{rt}$) mit leichten Vibe-Schwankungen (Partikel-Effekte am Graphen-Kopf) für Spannung.
- **Animation:** HTML5 Canvas für maximale Performance, da SVG bei langen Runden mit vielen Partikeln zu Rucklern auf Mobile führen kann.

## 2. Gameplay & Wetten
- **Auto-Bet:** Unterstützung für "Stop on Profit", "Stop on Loss" und prozentuale Erhöhung bei Gewinn/Verlust.
- **Maximaler Multiplikator:** Hartes Limit bei 1.000.000x zum Schutz des Hausbudgets. Automatischer Cashout für alle verbleibenden Spieler bei Erreichen des Limits.

## 3. Multiplayer & Netzwerk
- **Live-Multiplayer:** Rechte Seitenleiste (oder ausklappbar auf Mobile) mit Live-Spielern/Bots. Spieler, die aussteigen, werden grün hervorgehoben (Cashout-Animation).
- **Latenz-Management:** Bei echten Servern gilt der "Klick-Moment" (Timestamp + Signatur) im Rahmen eines 500ms Toleranzfensters, andernfalls Server-Moment. 

## 4. Provably Fair & Sicherheit
- **Verifizierung:** Ein UI-Modal direkt im Spiel erlaubt das Überprüfen des vorherigen Seeds (Server Seed + Client Seed = Result).

## 5. UI/UX & Gamification
- **Crash-Momente:** Visuelle Erschütterung (Screen-Shake), kurzer roter Flash und Sound-Effekt einer platzenden Neon-Röhre.
- **Mobile Layout:** Fixierte Wett-Controls im unteren Bildschirmbereich (Safe-Area beachten), Graph nimmt den restlichen oberen Bereich ein (Non-scrollable Viewport).
- **Gamification:** Ab 100x Multiplikator ändert sich die Farbpalette des Spiels (z.B. zu "Hyper-Gold") und eine globale Chat-Benachrichtigung wird ausgelöst.
