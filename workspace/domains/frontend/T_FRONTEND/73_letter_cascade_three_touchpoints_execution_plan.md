# 73 — Mechanical Letter Cascade (3-Touchpoint Execution Plan)

> **Status:** Execution-Ready · **Niveau:** Weltklasse (Top 1% Haute Horlogerie Standard)  
> **Offizielle Componentry-Spezifikation:** [componentry.dev/docs/components/letter-cascade](https://componentry.dev/docs/components/letter-cascade)  
> **Kern-Technologie:** Mechanical Split-Flap Spring Physics + Cascading Character Waterfall + Tabular Numeric Alignment  
> **Scope:** Drei separierte Touchpoints (L1: Progressive Jackpot Ticker, L2: Leaderboard Podium Champions, L3: Dice Multiplier Display)

---

## 1 — Executive Summary & Status Quo Bewertung

Dynamische Zahlen und Ranglistenanzeigen (Jackpot-Ticker, Bestenlisten, Spiel-Multiplikatoren) springen aktuell oft schlagartig oder nutzen simple Odometer-Zähler. Durch die **Letter Cascade** wird jeder Buchstabe und jede Ziffer als unabhängiges mechanisches Segment animiert, das wie eine Schweizer Split-Flap-Anzeige (Fallblattanzeige) oder eine feingliedrige Domino-Kaskade von oben nach unten einrastet.

### Status Quo Bottleneck-Matrix

| Touchpoint                 | Aktueller Zustand                    | Defizit / Bottleneck                                                   | Ziel-Architektur (Letter Cascade)                                                        |
| :------------------------- | :----------------------------------- | :--------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **L1: Jackpot Ticker**     | Statischer Textblock (`$1,085.64`)   | Inkremente wirken unbelebt; kein haptisches Feedback bei Live-Wachstum | Ziffern fallen gestaffelt von oben herab mit metallischem Einrasten                      |
| **L2: Leaderboard Podium** | Statische Profilkarten für Platz 1–3 | Ranglistenwechsel (Tag/Woche) erfolgt flach ohne Zeremonie             | Siegernamen und Preisgelder kaskadieren buchstabenweise von oben herab                   |
| **L3: Dice Multiplier**    | Standard-Text (`2.00x`)              | Regler-Verstellung fühlt sich digital-steril an                        | Jede Schieberegler-Änderung rollt die Ziffern in einer flüssigen Buchstabenkaskade durch |

---

## 2 — Touchpoint L1: Live Progressive Jackpot Ticker

### 2.1 Spezifikation & Ziel-Umgebung

- **Vollständige URL:** `http://localhost:3015/` (sowie globale Jackpot-Kacheln)
- **Betroffene Datei:** [`src/components/casino/jackpot/JackpotBanner.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/jackpot/JackpotBanner.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_1_jackpot.png)  
  ![Jackpot Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_1_jackpot.png)

### 2.2 Technische Architektur & Komponenten-Aufbau

1. **Unabhängige Zeichenspalten:**
   - Jede Ziffer (z. B. `$`, `1`, `,`, `0`, `8`, `5`, `.`, `6`, `4`) wird in einem eigenen Slot-Container mit `overflow: hidden` gerendert.
   - Wenn sich eine Ziffer ändert, fällt das alte Zeichen nach unten heraus, während das neue Zeichen von oben einrastet.
2. **Staffelungs-Verzögerung (Stagger Delay):**
   - Delay von rechts nach links (Cent-Beträge aktualisieren sich zuerst, Tausender-Stellen folgen harmonisch verzögert mit `i * 0.035s`).
3. **Akzent-Beleuchtung:**
   - Ziffern besitzen einen goldenen Rim-Light-Gradienten (`#F5E7A1` zu `#D4AF37`).

### 2.3 Code-Blueprint

```tsx
export interface JackpotLetterCascadeProps {
  value: number;
  currencySymbol?: string;
  isCompact?: boolean;
}
```

---

## 3 — Touchpoint L2: Leaderboard & Tournament Podium Champions

### 3.1 Spezifikation & Ziel-Umgebung

- **Vollständige URL:** `http://localhost:3015/leaderboard`
- **Betroffene Datei:** [`src/app/leaderboard/page.tsx`](file:///v:/VibeCoding/Casino/src/app/leaderboard/page.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_2_leaderboard.png)  
  ![Leaderboard Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_2_leaderboard.png)

### 3.2 Technische Architektur & Komponenten-Aufbau

1. **Zeremonieller Namens-Reveal:**
   - Beim Umschalten des Filters (z. B. `Wöchentlich` ➜ `Monatlich`) fallen die Buchstaben der Namen (`dev_user_fallback`, `Jean West`) von oben herab.
2. **Spring-Physik:**
   - `stiffness = 320, damping = 22, stagger = 0.02s` pro Buchstabe.
3. **Preispool-Kaskade:**
   - Die Gesamtbeträge (`$25,995.00`) nutzen dieselbe Mechanik für vollendete Einheitlichkeit.

---

## 4 — Touchpoint L3: Dice Game Multiplier & Target Display

### 4.1 Spezifikation & Ziel-Umgebung

- **Vollständige URL:** `http://localhost:3015/games/dice`
- **Betroffene Datei:** [`src/components/casino/games/dice/v2/`](file:///v:/VibeCoding/Casino/src/components/casino/games/dice/v2/) bzw. Dice-Steuerung
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_3_dice.png)  
  ![Dice Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_cascade_3_dice.png)

### 4.2 Technische Architektur & Komponenten-Aufbau

1. **Hochfrequente Reaktivität:**
   - Während des Ziehens am Schieberegler wird die Animation auf ultra-schnelle Dämpfung (`stiffness: 600, damping: 30`) gesetzt, um 60 FPS ohne Latenz zu garantieren.
2. **Ziffern-Locking:**
   - Sobald der Slider losgelassen wird, rastet der Multiplikator (`2.00x`) mit einer finalen, satten Mikrokaskade ein.

---

## 5 — Haute Horlogerie 10-Punkte Qualitätskatalog

1. **Tabular Figures Pflicht:** Strikte Verwendung von `font-variant-numeric: tabular-nums` verhindert jegliches horizontale Wackeln der Ziffernbreiten.
2. **Sub-Pixel Glyph Align:** Perfekte vertikale Zentrierung via Flexbox, keine abgeschnittenen Zeichenüberhänge.
3. **Akustischer Klick:** Ultra-dezentes mechanisches Klacken beim Kaskadieren via `soundManager` (mit Lautstärkedeckelung bei schnellen Wechseln).
4. **Resilienz gegen Rapid Updates:** Schnelle Zähler-Updates brechen vorherige Kaskaden sauber ab, ohne DOM-Stau zu erzeugen.
5. **Reduced Motion Mode:** Bei aktiviertem Barrierefreiheitsmodus sofortiger direkter Ziffernwechsel ohne Fall-Animation.
6. **Zero External Dependencies:** Realisiert über leichtgewichtige Framer-Motion-Primitives oder performante CSS Keyframes.
7. **Mobiloptimierte Abstände:** Automatische Skalierung der Ziffern-Slots auf Smartphones für perfekte Lesbarkeit.
8. **Dark Mode Obsidian Contrast:** Kontrastverhältnis der Ziffern zum Obsidian-Hintergrund $> 7:1$ (AAA-Standard).
9. **SSR Safe:** Server-seitiges Rendern liefert den vollständigen String aus, um Hydration Mismatches auszuschließen.
10. **Typentest-Absicherung:** Umfassende Unit-Tests für Dezimaltrennzeichen, Währungssymbole und Tausenderpunkte.

---

## 6 — Konkrete 5-Phasen-Execution-Roadmap

- [ ] **Phase 1: Letter Cascade Core Primitive:** Entwicklung von `src/components/casino/typography/LetterCascade.tsx`.
- [ ] **Phase 2: Touchpoint L1 Integration:** Integration in den Live Progressive Jackpot Ticker (`src/components/casino/jackpot/JackpotBanner.tsx`).
- [ ] **Phase 3: Touchpoint L2 Integration:** Integration in das Leaderboard Podium (`src/app/leaderboard/page.tsx`).
- [ ] **Phase 4: Touchpoint L3 Integration:** Integration in das Dice Multiplier Panel (`src/components/casino/games/dice/`).
- [ ] **Phase 5: 5-Stufen-DoD & Audit:**
  - `npm run typecheck` (0 Fehler)
  - `npm test` (100% grün)
  - `npm run lint` (0 Fehler)
  - Screenshot-Verifikation der kaskadierenden Ziffern
