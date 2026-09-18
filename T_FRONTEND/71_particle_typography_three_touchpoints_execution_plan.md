# 71 — Cursor-Driven Particle Typography (3-Touchpoint Execution Plan)

> **Status:** Execution-Ready · **Niveau:** Weltklasse (Top 1% Haute Horlogerie Standard)  
> **Offizielle Componentry-Spezifikation:** [componentry.dev/docs/components/cursor-driven-particle-typography](https://componentry.dev/docs/components/cursor-driven-particle-typography)  
> **Kern-Technologie:** HTML5 2D Canvas + Spring Physics + Cursor Velocity Repulsion + Particle Point Mesh  
> **Scope:** Drei separierte Touchpoints (P1: Big Win Overlay, P2: Lobby Hero Headline, P3: Vault High-Roller Header)

---

## 1 — Executive Summary & Status Quo Bewertung

Aktuell nutzen Textdarstellungen im Casino weitgehend flache CSS-Farbverläufe oder einfache Text-Shadows. Der Gesamteindruck entspricht Standard-Web-Typografie. Durch **Cursor-Driven Particle Typography** werden die Buchstaben und Zahlen aus tausenden mikroskopischen Goldstaub- und Obsidian-Partikeln auf einem performanten Canvas generiert, die bei Cursor-Annäherung physikalisch reagieren, auseinanderstieben und durch Federkraft (Spring Physics) elastisch in ihre Glyphenform zurückschnappen.

### Status Quo Bottleneck-Matrix

| Touchpoint | Aktueller Zustand | Defizit / Bottleneck | Ziel-Architektur (Particle Typo) |
| :--- | :--- | :--- | :--- |
| **P1: Big Win Overlay** | Statischer DOM-Text (`$14,849.42`) mit CSS-Text-Shadow | Trennung zwischen Hintergrund-Partikeln und starrem Text; kein haptisches Siegesgefühl | Zahlen und Sieges-Schriftzug bestehen selbst aus Goldstaub, der bei Mausbewegung aufwirbelt |
| **P2: Lobby Hero H1** | Einfacher CSS-Text-Gradient (`NEXT LEVEL VIP CASINO.`) | Passiver Eindruck; Besucher interagieren nicht mit der Hauptmarke | Interaktive Typografie: Cursor zerstäubt Buchstabenkanten sanft, snapped elastisch zurück |
| **P3: Vault Header** | Statische Monospace-Labels für Balance und Level 35 | Wirkt wie Standard-Web-Banking statt exklusiver Mayfair-Tresor | Auratische Obsidian-Gold-Partikel formen den High-Roller-Nutzernamen und die Balance |

---

## 2 — Touchpoint P1: Big Win & Jackpot Celebration Overlay

### 2.1 Spezifikation & Ziel-Umgebung
- **Vollständige URL:** `http://localhost:3015/testing/fe-25-big-win` (sowie alle Spielrunden mit Win-Multiplikator $\ge 15\times$)
- **Betroffene Datei:** [`src/components/casino/BigWinOverlay.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/BigWinOverlay.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_1_big_win.png)  
  ![Big Win Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_1_big_win.png)

### 2.2 Technische Architektur & Komponenten-Aufbau
1. **Zweistufiger Partikel-Cluster:**
   - **Text-Glyphen-Partikel ($N \approx 1.800$ Points):** Formieren den Text `BIG WIN!` und den numerischen Betrag.
   - **Ambient Gold Flakes ($N \approx 250$ Points):** Treiben im 3D-Raum um die Zahl herum.
2. **Spring-Physics-Parameter:**
   - `stiffness = 0.045`, `damping = 0.88`, `repulsionRadius = 90px`, `repulsionForce = 6.5`.
3. **Canvas Lifecycle & Layering:**
   - `z-index: 100` über der Hintergrund-Vignette, unterhalb des "Click anywhere to close"-Hinweises.
   - ResizeObserver mit $2\times$ HiDPI DPR-Skalierung für gestochen scharfe Retina-Darstellung.
4. **State- & Audio-Kopplung:**
   - Trigger bei `isOpen === true`; Partikel starten zentriert in einer Implosions-Explosion und formieren innerhalb von 600ms den vollen Betrag.
   - Audio-Kopplung an `soundManager.play('win')`.

### 2.3 Code-Blueprint & Typ-Definition
```tsx
export interface BigWinParticleTypographyProps {
  amountFormatted: string;
  headline: 'BIG WIN!' | 'MEGA WIN!' | 'EPIC WIN!' | 'JACKPOT!';
  isMobile: boolean;
  onExplosionComplete?: () => void;
}
```

---

## 3 — Touchpoint P2: Lobby Hero H1 Headline

### 3.1 Spezifikation & Ziel-Umgebung
- **Vollständige URL:** `http://localhost:3015/`
- **Betroffene Datei:** [`src/components/home/LobbySectionHeader.tsx`](file:///v:/VibeCoding/Casino/src/components/home/LobbySectionHeader.tsx) bzw. Hero-Container
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_2_lobby_hero.png)  
  ![Lobby Hero Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_2_lobby_hero.png)

### 3.2 Technische Architektur & Komponenten-Aufbau
1. **Subtile Kanten-Repulsion (Sub-Milimeter-Präzision):**
   - Anders als beim Big Win darf die H1 nicht zerstört werden. `repulsionRadius = 45px`, maximale Partikel-Auslenkung auf $18\text{ px}$ gecappt.
   - Farbpalette: Dual-Tone Gold Foil (`#E2C974` Champagne Gold zu `#AA771C` Deep Bronze).
2. **DOM-zu-Canvas-Hybrid:**
   - Unsichtbarer semantischer H1-Tag (`opacity: 0`, `position: absolute`) sichert 100% SEO & A11y.
   - Canvas rendert visual-only mit `aria-hidden="true"`.
3. **Performance-Garantie:**
   - Cursor-Proximity-Gate: Render-Loop pausiert automatisch (`cancelAnimationFrame`), wenn der Cursor $> 120\text{ px}$ von der Headline entfernt ist und alle Partikel im Ruhezustand liegen.

---

## 4 — Touchpoint P3: Vault High-Roller Header

### 4.1 Spezifikation & Ziel-Umgebung
- **Vollständige URL:** `http://localhost:3015/vault`
- **Betroffene Datei:** [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_3_vault_header.png)  
  ![Vault Header Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_particle_3_vault_header.png)

### 4.2 Technische Architektur & Komponenten-Aufbau
1. **Exklusives Obsidian-Platin-Partikelfeld:**
   - Partikel spiegeln den Rang wider (Platinum-Glanz `#E5E4E2` mit feinen goldenen Einschlüssen).
   - Dynamische Aktualisierung bei Guthaben-Änderungen über `useCasinoStore((s) => s.balance)`.
2. **Tresor-Atmosphäre (Micro-Ember Flow):**
   - Kleine Lichtpartikel lösen sich langsam von der Zahl und driften nach oben weg (wie Funken eines heißen Goldbarrens).

---

## 5 — Haute Horlogerie 10-Punkte Qualitätskatalog

1. **Zero Layout Shifts (CLS 0.00):** Feste Container-Abmessungen mit CSS `aspect-ratio` und Min-Height.
2. **HiDPI Retina Crispness:** Canvas-Backing-Store skaliert synchron mit `window.devicePixelRatio`.
3. **Batterieschonung auf Mobile:** Automatische Abschaltung des Physik-Loops unter 1024px; Rendering als eleganter CSS-Gradient.
4. **Reduced Motion Compliance:** Sofortiger Übergang in statische Partikel ohne Bewegung bei `prefers-reduced-motion: reduce`.
5. **Memory Leak Prevention:** Sauberes `cancelAnimationFrame` und Entfernen aller Window-Event-Listener im Hook-Cleanup.
6. **Strikte Typisierung:** Alle Partikel-Vektoren in TypedArrays (`Float32Array` für `x, y, vx, vy, originX, originY`).
7. **Keine externen Runtimes:** Reine Web-Standards (`CanvasRenderingContext2D`), keine schweren Three.js/Pixi.js Bundles.
8. **Multi-Tab Resilienz:** `visibilitychange` pausiert den Canvas-Loop im Hintergrund-Tab sofort.
9. **Farb-Konsistenz:** Farbwerte strikt an Design-Tokens (`var(--gold-primary)`, `var(--obsidian-bg)`).
10. **Testabdeckung:** Unit-Tests für Vektor-Distanz, Boundary-Checks und Responsive-Fallbacks.

---

## 6 — Konkrete 5-Phasen-Execution-Roadmap

- [ ] **Phase 1: Core Particle Engine Module:** Erstellung von `src/components/casino/fx/CursorParticleTypography.tsx` mit TypedArray Point-Matrix.
- [ ] **Phase 2: Touchpoint P1 Integration:** Austausch der statischen Betrags-Renderings in `BigWinOverlay.tsx`.
- [ ] **Phase 3: Touchpoint P2 Integration:** Einbettung des Canvas-Overlays in `LobbySectionHeader.tsx` mit SEO-H1-Erhaltung.
- [ ] **Phase 4: Touchpoint P3 Integration:** Veredelung des Vault-Progression-Headers in `src/app/vault/page.tsx`.
- [ ] **Phase 5: 5-Stufen-DoD & Audit:**
  - `npm run typecheck` (0 Fehler)
  - `npm test` (100% grün)
  - `npm run lint` (0 Fehler)
  - Playwright Screenshot-Audit der 3 Sektionen
