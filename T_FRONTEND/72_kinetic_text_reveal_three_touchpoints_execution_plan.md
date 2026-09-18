# 72 — Kinetic Text Reveal (3-Touchpoint Execution Plan)

> **Status:** Execution-Ready · **Niveau:** Weltklasse (Top 1% Haute Horlogerie Standard)  
> **Offizielle Componentry-Spezifikation:** [componentry.dev/docs/components/kinetic-text-reveal](https://componentry.dev/docs/components/kinetic-text-reveal)  
> **Kern-Technologie:** Framer Motion + Dynamic Velocity Skew + Diagonal Split-Slice Masking + Spring Damping  
> **Scope:** Drei separierte Touchpoints (K1: Crash Multiplier Overlay, K2: Blackjack Table Verdict, K3: Roulette Croupier Callout)

---

## 1 — Executive Summary & Status Quo Bewertung

Statusanzeigen in Casino-Spielen erfordern maximale Dramatik und spürbare Gravitas. Aktuell werden Entscheidungen („CRASHED“, „BLACKJACK“, „17 BLACK“) als simple Text-Austausche mit einfachem CSS-Fade dargestellt. Durch **Kinetic Text Reveal** werden Spielentscheidungen durch dynamische geometrische Scherung (Velocity Skew) und diagonale Schnittmasken (Split-Slice) in zwei gegenläufige Ebenen geteilt, die im Moment der Rundenauflösung mit elastischer Trägheit aufeinanderprallen.

### Status Quo Bottleneck-Matrix

| Touchpoint | Aktueller Zustand | Defizit / Bottleneck | Ziel-Architektur (Kinetic Reveal) |
| :--- | :--- | :--- | :--- |
| **K1: Crash Multiplier** | Text-Swap im Crash-Canvas (`1.00x` wechselt schlagartig zu `CRASHED`) | Schockmoment des Crashs wird visuell unter Wert verkauft | Diagonale Schnitt-Spaltung: Text zerspringt mit kinetischem Rückstoß |
| **K2: Blackjack Table** | Statische Gold-Schriftzüge auf Filztisch | Tisch wirkt steril; High-Stakes-Entscheidung fehlt filmische Spannung | Cinematische horizontale Slice-Enthüllung mit federndem Einrasten |
| **K3: Roulette Croupier** | Reine Statuszeile mit festem Textblock | Croupier-Aussagen wirken wie System-Logs statt französischem Glamour | Zweistufiger kinetischer Auftritt der Gewinnzahl mit Dreh-Prismen-Maske |

---

## 2 — Touchpoint K1: Crash Game Multiplier & Status Resolution

### 2.1 Spezifikation & Ziel-Umgebung
- **Vollständige URL:** `http://localhost:3015/games/crash`
- **Betroffene Datei:** [`src/components/casino/games/crash/`](file:///v:/VibeCoding/Casino/src/components/casino/games/crash/) (Canvas & Status-Overlay)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_1_crash.png)  
  ![Crash Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_1_crash.png)

### 2.2 Technische Architektur & Komponenten-Aufbau
1. **Zweistufiger Split-Slice Masken-Schnitt:**
   - Obere Texthälfte: `clip-path: polygon(0 0, 100% 0, 100% 55%, 0 45%)`, slidet von links mit `skewX(-14deg)`.
   - Untere Texthälfte: `clip-path: polygon(0 45%, 100% 55%, 100% 100%, 0 100%)`, slidet von rechts mit `skewX(14deg)`.
2. **Spring-Physics-Werte:**
   - Bei Crash: `stiffness = 500, damping = 18, mass = 0.8` für einen peitschenartigen Impact.
   - Bei Vorbereitung: `stiffness = 180, damping = 26` für weiches Vorbereiten der nächsten Runde.
3. **Farb- & Glow-Choreografie:**
   - Normaler Flug: Champagner-Gold (`#D4AF37`) mit dezentem 12px Glow.
   - Crash-Moment: Blitzartiger Farbwechsel auf Rubinrot (`#EF4444`) mit 3-Frame-RGB-Scherung.

### 2.3 Code-Blueprint
```tsx
export interface CrashKineticStatusProps {
  status: 'IDLE' | 'COUNTDOWN' | 'FLYING' | 'CRASHED';
  crashPoint?: number;
  multiplierDisplay: string;
}
```

---

## 3 — Touchpoint K2: Blackjack Table Verdict Banner

### 3.1 Spezifikation & Ziel-Umgebung
- **Vollständige URL:** `http://localhost:3015/games/blackjack`
- **Betroffene Datei:** [`src/app/games/blackjack/BlackjackClient.tsx`](file:///v:/VibeCoding/Casino/src/app/games/blackjack/BlackjackClient.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_2_blackjack.png)  
  ![Blackjack Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_2_blackjack.png)

### 3.2 Technische Architektur & Komponenten-Aufbau
1. **Monte-Carlo Salon Privé Verdict:**
   - Schriftzug: `BLACKJACK PAYS 3 TO 2`, `DEALER BUSTS`, `PLAYER WINS`, `PUSH`.
   - Serif-Typografie mit edlem Letterspacing (`0.2em`).
2. **Kinetic Velocity Skew:**
   - Banner slidet horizontal aus der Tischmitte heraus mit dynamischem `skewX`: startet bei $-18^\circ$ und pendelt sich über eine abklingende Sinuskurve auf $0^\circ$ ein.
3. **Tischfilz-Schatten:**
   - Weicher volumetrischer Schattenwurf (`box-shadow: 0 12px 32px rgba(0, 0, 0, 0.75)`) auf das grüne Tuch.

---

## 4 — Touchpoint K3: Roulette Croupier Callout & Gewinnzahl

### 4.1 Spezifikation & Ziel-Umgebung
- **Vollständige URL:** `http://localhost:3015/games/roulette`
- **Betroffene Datei:** [`src/app/games/roulette/RouletteClient.tsx`](file:///v:/VibeCoding/Casino/src/app/games/roulette/RouletteClient.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_3_roulette.png)  
  ![Roulette Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_kinetic_3_roulette.png)

### 4.2 Technische Architektur & Komponenten-Aufbau
1. **Zweistufiger Croupier-Rhythmus:**
   - Stufe 1: `„FAITES VOS JEUX“` ➜ `„RIEN NE VA PLUS“` slidet vertikal mit sanfter Kinetik.
   - Stufe 2: Beim Stillstand der Kugel klinkt die gezogene Zahl (`17 BLACK - ODD`) mit doppeltem kinetischen Reveal über dem Rad auf.
2. **Akzent-Highlighting:**
   - Rote Zahlen strahlen rubinrot (`#EF4444`), schwarze Zahlen in tiefem Obsidian mit Goldrand, Null (`0`) in Smaragdgrün (`#10B981`).

---

## 5 — Haute Horlogerie 10-Punkte Qualitätskatalog

1. **Sub-Millisekunden-Latenz:** Keine künstlichen Delays, die das Settlement der Wetten verzögern.
2. **GPU Raster-Optimierung:** Ausschließlich `transform` und `clip-path` (keine CPU-basierten Margin- oder Top-Animationen).
3. **Audio-Kopplung:** Metallisches Croupier-Einrast-Klicken bei Abschluss des Reveals via `soundManager`.
4. **Semantische A11y:** `aria-live="assertive"` für Crash und Spielentscheidungen, damit Screenreader die Rundenergebnisse sofort vorlesen.
5. **Layout-Isolierung:** Absolute Positionierung innerhalb des Game-Canvas verhindert vertikale Ruckler des Spieltischs.
6. **Mobile-Responsiveness:** Kleinere Skew-Winkel ($\pm 8^\circ$) auf Viewports $< 768\text{ px}$ gegen Textüberhänge.
7. **Cross-Browser Clip-Path:** Fallbacks für ältere WebKit-Engines via CSS-Mask-Image.
8. **Multi-Resolution:** Automatische Skalierung der Schriftgrößen in `clamp(1.5rem, 4vw, 3.5rem)`.
9. **Monospace-Zahlen:** Multiplikatoren und Ziffern strikt mit festen Zeichenbreiten (`tabular-nums`).
10. **Zero Memory Leaks:** Saubere AnimatePresence-Deallokation bei Runden-Reset.

---

## 6 — Konkrete 5-Phasen-Execution-Roadmap

- [ ] **Phase 1: Kinetic Core Primitive:** Erstellung von `src/components/casino/typography/KineticTextReveal.tsx`.
- [ ] **Phase 2: Touchpoint K1 Integration:** Einbindung in Crash Game Multiplier Resolution (`src/components/casino/games/crash/`).
- [ ] **Phase 3: Touchpoint K2 Integration:** Einbindung in Blackjack Table Verdict (`src/app/games/blackjack/BlackjackClient.tsx`).
- [ ] **Phase 4: Touchpoint K3 Integration:** Einbindung in Roulette Croupier & Winner Callout (`src/app/games/roulette/RouletteClient.tsx`).
- [ ] **Phase 5: 5-Stufen-DoD & Audit:**
  - `npm run typecheck` (0 Fehler)
  - `npm test` (100% grün)
  - `npm run lint` (0 Fehler)
  - Playwright Screenshot-Verifikation aller 3 Game States
