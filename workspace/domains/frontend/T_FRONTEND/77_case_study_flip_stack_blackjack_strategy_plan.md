# 77 — Case Study Flip Stack: Blackjack Strategy (Execution Plan)

> **Status:** Execution-Ready · **Niveau:** Weltklasse (Top 1% Haute Horlogerie Standard)  
> **Offizielle Componentry-Spezifikation:** [componentry.dev/docs/components/case-study-flip-stack](https://componentry.dev/docs/components/case-study-flip-stack)  
> **Kern-Technologie:** 3D Card Edge Flipping + Interactive Backside Reveal + Spring Physics  
> **Scope:** Ein fokussierter Touchpoint (F3: Blackjack Rules & Basic Strategy Heatmap Flip) — _F1 & F2 auf Nutzeranweisung ausgeschlossen_

---

## 1 — Executive Summary & Status Quo Bewertung

Im Blackjack-Interface nimmt das Informations-Panel für Spielregeln und Auszahlungsquoten wertvollen Platz ein. Aktuell muss der Spieler zwischen Tabs hin- und herwechseln oder lange scrollen, um die mathematische Basic Strategy Heatmap einzusehen. Durch den **Case Study Flip Stack** wird das Info-Panel zu einer beidseitig gravierten Luxus-Plakette: Auf Klick oder Hover flippt die Karte mit massiver Trägheit um ihre vertikale Kante ($180^\circ$) um und enthüllt auf der Rückseite die farbkodierte Strategiematrix für die aktuelle Spielsituation.

### Status Quo Bottleneck-Matrix

| Touchpoint                         | Aktueller Zustand                                             | Defizit / Bottleneck                                         | Ziel-Architektur (Case Study Flip Stack)                                          |
| :--------------------------------- | :------------------------------------------------------------ | :----------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **F3: Blackjack Strategy & Rules** | Statische Listen (`RULES & PAYOUTS` über `HEATMAP` gestapelt) | Hohe visuelle Unruhe am rechten Tischrand; starrer Textblock | Schwere, 3D-flippende Acryl-/Gold-Plakette: Vorderseite Regeln, Rückseite Heatmap |

---

## 2 — Detaillierte Spezifikation & Umsetzung

### 2.1 Ziel-Umgebung

- **Vollständige URL:** `http://localhost:3015/games/blackjack`
- **Betroffene Datei:** [`src/app/games/blackjack/BlackjackClient.tsx`](file:///v:/VibeCoding/Casino/src/app/games/blackjack/BlackjackClient.tsx) (Rechtes Sidebar-Panel)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_flip_3_blackjack_strategy.png)  
  ![Blackjack Strategy](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_flip_3_blackjack_strategy.png)

### 2.2 Technische Architektur & Komponenten-Aufbau

1. **3D Double-Sided Mesh:**
   - Container: `perspective: 1200px`, `transformStyle: 'preserve-3d'`.
   - Vorderseite ($0^\circ$): `RULES & PAYOUTS` (Blackjack 3:2, Dealer stands on 17, Insurance).
   - Rückseite ($180^\circ$): `BASIC STRATEGY HEATMAP` mit dynamischer Hervorhebung der aktuellen Hand des Spielers gegen die offene Karte des Dealers.
   - `backfaceVisibility: 'hidden'` auf beiden Seiten für sauberes Clipping.
2. **Kanten-Flip-Physik:**
   - `rotateY: isFlipped ? 180 : 0`.
   - Spring-Parameter: `stiffness: 260, damping: 22, mass: 1.2` (verleiht der Karte das Gewicht einer schweren Messingtafel).
3. **Interaktiver Flip-Trigger:**
   - Diskreter goldener Flip-Button oben rechts (`⟳ STRATEGIE UMDREHEN`) sowie optionaler Tastatur-Hotkey (`Taste R` für Rules/Strategy Toggle).

---

## 3 — Haute Horlogerie Qualitätskatalog

1. **Sub-Pixel-Präzision:** Kein Zittern der Ränder beim 3D-Umschlagen via GPU-Compositing.
2. **Haptisches Sound-Feedback:** Metallisches Umschlag-Geräusch via `soundManager` im Scheitelpunkt des Flips ($90^\circ$).
3. **Live Hand-Highlighting:** Die Heatmap auf der Rückseite markiert automatisch die optimale mathematische Entscheidung (`HIT`, `STAND`, `DOUBLE`, `SPLIT`) passend zu den Karten auf dem Tisch.
4. **Mobile Adaption:** Auf Touchgeräten schaltet der Flip mit einfachem Tap um.
5. **Zero Layout Shifts:** Identische feste Höhe von Vorder- und Rückseite verhindert Springen der Steuerungselemente.

---

## 4 — 5-Phasen-Execution-Roadmap

- [ ] **Phase 1: 3D Flip Primitive:** Erstellung von `src/components/casino/motion/EdgeFlipCard.tsx`.
- [ ] **Phase 2: Blackjack Client Refactor:** Integration der Vorderseite (Rules) und Rückseite (Heatmap) in `BlackjackClient.tsx`.
- [ ] **Phase 3: Hotkey & Audio Verdrahtung:** Koppelung an Hotkey `R` und Soundeffekt.
- [ ] **Phase 4: 5-Stufen-DoD & Audit:**
  - `npm run typecheck` (0 Fehler)
  - `npm test` (100% grün)
  - `npm run lint` (0 Fehler)
  - Playwright Screenshot-Verifikation beider Kartenseiten
