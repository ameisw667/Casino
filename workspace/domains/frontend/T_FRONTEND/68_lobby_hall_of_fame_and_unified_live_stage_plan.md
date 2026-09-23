# 68 — Lobby Hall of Fame Vertikal-Expansion & Unified Live Stage Plan

> **Zweck:** Beseitigung des Freiraums unter der Hall of Fame (vertikale Angleichung an Neon 777 Slots) und Zusammenführung von Live-Auszahlungen (3D Spiral Stage) und Live Progressive Jackpot in ein harmonisches 2/3 zu 1/3 Element.
> **Kanonische Vorgabe:** Nutzer-Feedback via Screenshot 1, 2, 3 & 4.
> **Design-System:** „Obsidian & Gold (Premium)“ (`#0B0E14`, `#D4AF37`), Framer Motion 3D.

---

## 1. Status Quo & Schwachstellen

1. **Freiraum unter Hall of Fame:**
   - In `BentoArcadeDeferredCells` hat `Spiral3dSlider` aktuell eine feste Minimalhöhe von `280px`, während auf der linken Seite die Kacheln `ArcadeHeroCell` (Crash Rocket) + Satelliten (Roulette & Neon 777 Slots) über mehrere Zeilen tiefer hinabreichen.
   - Dadurch entsteht unterhalb der Hall of Fame eine unschöne schwarze Lücke (siehe Screenshots `68_status_quo_hall_of_fame_gap.png` und `68_status_quo_hall_of_fame_detail_2.png`).
2. **Getrennte gestapelte Vollbreiten-Balken:**
   - `Live-Auszahlungen` (3D Spiral Stage) und `Live Progressive Jackpot` waren übereinander jeweils als volle 100%-Zeile gestapelt (siehe `68_status_quo_live_payouts_jackpot_stacked.png`).
   - Ziel: Einbindung in ein gemeinsames, hochmodernes Dual-Modul-Element (z. B. ~65% Live-Auszahlungen mit 3D-Scroll-Effekt und ~35% Live Progressive Jackpot).

---

## 2. Ziel-Architektur

### A. Hall of Fame Höhen-Expansion

- Container von `Spiral3dSlider` wird im Desktop-Grid so konfiguriert, dass er `gridRow: 'span 2'` belegt oder sich flexibel über die Höhe der linken Kacheln erstreckt, sodass seine Unterkante exakt mit der Unterkante von `Neon 777 Slots` bündig abschließt.
- Die 3D Helix-Karten und der Container erhalten dynamische Höhenunterstützung (`height: 100%`, `minHeight: 460px` auf Desktop).

### B. Unified Live Stage (2/3 Live-Auszahlungen + 1/3 Progressive Jackpot)

- Neue oder kombinierte Komponente `UnifiedLiveStageCell` bzw. gemeinsame Grid-Zeile:
  - **Links (~65% / 2/3):** Interaktive `LiveHighlightStream` 3D Spiral Stage mit Mausrad-, Drag- und Button-Steuerung, RTP-Badge und Payout-Karten.
  - **Rechts (~35% / 1/3):** `BentoJackpotCell` im edlen Obsidian-Gold-Rahmen mit animiertem Zähler (`KineticNumberRoller`), Puls-Glow und Drop-Bedingungen.
  - Mobilgeräte (Breakpoint < 1024px): Sauberes vertikales Stapeln (100% Breite je Karte, 0 horizontaler Overflow).
- Direkt darunter folgt wie gewünscht die bewährte rahmenlose `PlatformStatsCell` über die volle Breite (`1 / -1`).

---

## 3. Betroffene Dateien

- `[MODIFY]` `src/components/home/bento/BentoArcadeCells.tsx` (Hall of Fame Vertikal-Expansion)
- `[MODIFY]` `src/components/home/bento/Spiral3dSlider.tsx` (Höhenanpassung und zentrierte Helix)
- `[MODIFY]` `src/components/home/bento/BentoJackpotCells.tsx` (Jackpot-Kachel für 1/3 Spalte optimiert)
- `[MODIFY]` `src/components/home/bento/LiveHighlightStream.tsx` (Live-Auszahlungen für 2/3 Spalte optimiert)
- `[MODIFY]` `src/components/home/BentoLobbyHome.tsx` (Grid-Integration der Unified Live Stage)

---

## 4. 5-Stufen DoD Verifikationsplan

1. `npm run typecheck` (0 Fehler)
2. `npm run lint` (0 Fehler)
3. `npm test` (100% bestanden)
4. `npm run build` (Exit Code 0)
5. Playwright Screenshot-Audit der Hauptseite (`http://localhost:3015/`) zur visuellen Abnahme.
