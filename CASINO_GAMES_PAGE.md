# Casino Games Lobby (`/games`)

## Übersicht
Die Games Lobby ist der zentrale Einstiegspunkt für alle Casino-Spiele. Sie ist auf maximale visuelle Wirkung, Echtzeit-Feedback und absolute Layout-Stabilität optimiert.

## Komponenten-Struktur

### 1. Header & Earning Center
- **Zweck:** Emotionale Bindung und Anzeige von Live-Gewinnen.
- **Features:**
  - **RTP Badge:** Dynamische Anzeige des aktuellen Auszahlungsstatus.
  - **Live Feed:** Animierte Anzeige der `latestBet` aus dem Store.
  - **Community Goal:** Fortschrittsbalken basierend auf dem globalen Umsatzziel.
- **Stabilitäts-Specs:**
  - `min-height: 220px` (Desktop) verhindert vertikales "Springen".
  - `alignItems: flex-start` fixiert die Position der Hauptüberschrift.
  - `AnimatePresence` ohne `mode="wait"`, um Layout-Kollapse während des Wechsels zu vermeiden.

### 2. Global Stats Bar
- **Daten:** Echtzeit-Metriken aus dem `useCasinoStore`.
- **Metriken:** Total Paid Out, Avg. Payout, Active Players.
- **Stabilitäts-Specs:**
  - `min-width` für alle Stat-Items, um Breitenänderungen bei wachsenden Zahlen zu verhindern.
  - `tabular-nums` für alle numerischen Werte.

### 3. Games Grid (Das Herzstück)
- **Layout:** Festes **4-Spalten-Grid** (`repeat(4, 1fr)`) auf Desktop.
- **Responsive:** Automatischer Wechsel auf 1-Spalte via `isMobile` Store-Status.
- **Karten-Design:**
  - `glass-card` Effekt mit `backdrop-filter`.
  - Hover-Effekte: `scale-[1.03]` und Premium-Glow-Overlay.
  - Shimmer-Animation auf den Play-Buttons.

## Technische Standards für Stabilität

### Layout-Sicherung
- **Scrollbar-Fix:** Die Scrollbar ist in der `MainLayout`-Struktur permanent auf `overflow-y: scroll` gesetzt, um horizontale Sprünge beim Laden von Inhalten zu eliminieren.
- **Grid-Fix:** Die Spaltenanzahl ist fest (4) statt dynamisch (`auto-fill`), um unkontrolliertes Umbrechen bei minimalen Breitenänderungen (z.B. durch Chat oder Sidebar) zu verhindern.
- **Numeric Stability:** Alle sich ändernden Zahlen verwenden Tabellenziffern, um Jitter zu vermeiden.

## Spiele-Inventar

| ID | Name | Pfad | Schwierigkeit | Studio |
|----|------|------|---------------|--------|
| crash | Crash | `/games/crash` | Medium | ROYALE ORIGINALS |
| dice | Dice | `/games/dice` | Easy | VIBE PRIME |
| roulette | Roulette | `/games/roulette` | Hard | ROYALE ORIGINALS |
| slots | Slots | `/games/slots` | Easy | VIBE PRIME |

## Datenfluss
- **Store:** `useCasinoStore.ts` (Zustand für `allBets`, `communityWagered`, etc.)
- **Simulation:** `ChatBotService.ts` generiert im Hintergrund Live-Wetten für eine lebendige Atmosphäre.
