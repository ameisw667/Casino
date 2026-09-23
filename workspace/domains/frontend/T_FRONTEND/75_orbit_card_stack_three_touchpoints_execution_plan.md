# 75 — 3D Orbit Card Stack (3-Touchpoint Execution Plan)

> **Status:** Execution-Ready · **Niveau:** Weltklasse (Top 1% Haute Horlogerie Standard)  
> **Offizielle Componentry-Spezifikation:** [componentry.dev/docs/components/orbit-card-stack](https://componentry.dev/docs/components/orbit-card-stack)  
> **Kern-Technologie:** CSS 3D Transforms + Framer Motion Spring Dynamics + Inertial Orbit Drag + Popout Elevation  
> **Scope:** Drei separierte Touchpoints (O1: VIP Tier Progression, O2: Leaderboard Top-3-Podium, O3: VIP Rank Benefits Modal)

---

## 1 — Executive Summary & Status Quo Bewertung

Flache Kartenreihen und lineare Fortschrittsbalken wirken im High-Roller-Segment oft statisch. Durch den **3D Orbit Card Stack** werden Karten auf einer elliptischen 3D-Umlaufbahn um ein zentrales Emblem platziert. Die aktive Karte schwebt dominant im Vordergrund mit dynamischem Goldglanz, während die übrigen Karten mit natürlicher Tiefenstaffelung (`rotateY`, `translateZ`, `scale`) im Raum kreisen und interaktiv rotiert werden können.

### Status Quo Bottleneck-Matrix

| Touchpoint                     | Aktueller Zustand                                                    | Defizit / Bottleneck                                                        | Ziel-Architektur (3D Orbit Stack)                                                   |
| :----------------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **O1: Vault Tier Progression** | Flache Fortschrittslinie mit 5 runden Icons (`BRONZE` bis `DIAMOND`) | Wirkt wie Standard-Gamification statt exklusiver Salon-Privé-Mitgliedschaft | 5 plastische VIP-Pässe kreisen im 3D-Orbit um das Spieler-Monogramm                 |
| **O2: Leaderboard Podium**     | 3 statische Boxen nebeneinander (Platz 1, 2, 3)                      | Wenig Prestige-Gefühl; Rang 1 hebt sich nur geringfügig von Platz 2 & 3 ab  | Rotierendes Siegerpodest: Platz 1 strahlt im Zentrum, 2 & 3 flankieren im 3D-Winkel |
| **O3: Rank Benefits Modal**    | Flacher Tab-Dialog mit Textlisten                                    | Informativer, aber trockener Listencharakter ohne haptische Erkundung       | Spieler rotieren die VIP-Stufen-Pässe wie einen physischen Fächer im 3D-Raum        |

---

## 2 — Touchpoint O1: VIP Vault Tier-Progression

### 2.1 Spezifikation & Ziel-Umgebung

- **Vollständige URL:** `http://localhost:3015/vault`
- **Betroffene Datei:** [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx) (Sektion: `VIP PROGRESSION`)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_1_vault_tiers.png)  
  ![Vault Tiers](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_1_vault_tiers.png)

### 2.2 Technische Architektur & Komponenten-Aufbau

1. **Elliptischer Orbit-Pfad:**
   - 5 Stufen (`Bronze`, `Silver`, `Gold`, `Platinum`, `Diamond`) mit Winkel-Versatz $\Delta\theta = 72^\circ$.
   - Raumtiefe: `perspective: 1200px`, `transformStyle: 'preserve-3d'`.
   - Radius X: $260\text{ px}$, Radius Z: $140\text{ px}$.
2. **Aktive Karten-Hervorhebung:**
   - Aktiver Rang des Nutzers (z. B. `Platinum LVL 35`) steht vorn im Fokus bei $\theta = 0^\circ$, skaliert auf $1.08\times$ mit Rim-Lighting.
3. **Interaktivität:**
   - Horizontales Draggen mit physikalischem Trägheitsnachlauf (`damping: 24, stiffness: 280`).

---

## 3 — Touchpoint O2: Leaderboard Top-3-Podium

### 3.1 Spezifikation & Ziel-Umgebung

- **Vollständige URL:** `http://localhost:3015/leaderboard`
- **Betroffene Datei:** [`src/app/leaderboard/page.tsx`](file:///v:/VibeCoding/Casino/src/app/leaderboard/page.tsx) (Top-3-Karten)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_2_leaderboard_podium.png)  
  ![Leaderboard Podium](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_2_leaderboard_podium.png)

### 3.2 Technische Architektur & Komponenten-Aufbau

1. **Tri-Orbit-Bühne (3 Karten im Raum):**
   - Platz 1 (Champion): $\theta = 0^\circ$, $z = +50\text{ px}$, goldene Kanten-Reflexion.
   - Platz 2: $\theta = -45^\circ$, $z = -20\text{ px}$, Silber-Akzente.
   - Platz 3: $\theta = +45^\circ$, $z = -20\text{ px}$, Bronze-Akzente.
2. **Schwebendes Kristallpodest:**
   - Unterhalb der Karten befindet sich eine subtile Bodenreflektion mit radialem Farbverlauf (`radial-gradient`).

---

## 4 — Touchpoint O3: VIP Rank Benefits Modal

### 4.1 Spezifikation & Ziel-Umgebung

- **Vollständige URL:** `http://localhost:3015/testing/fe-26-vip-tiers` (sowie globales Perk-Modal)
- **Betroffene Datei:** [`src/components/casino/RankBenefitsModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/RankBenefitsModal.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_3_vip_modal.png)  
  ![VIP Modal](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_3_vip_modal.png)

### 4.2 Technische Architektur & Komponenten-Aufbau

1. **Interaktiver Fächer-Modus:**
   - Mausrad-Scrollen oder Pfeiltasten rotieren die nächste Karte nach vorne.
   - Beim Klick auf eine hintere Karte springt diese mit einer geschmeidigen 3D-Sinusschwingung nach vorn ins Zentrum.
2. **Karten-Materialien:**
   - Gebürstetes Obsidian (`#0B0E14`), Echtglas-Filter (`backdrop-filter: blur(16px)`), Kantenbeleuchtung mit 1px Goldfoil.

---

## 5 — Haute Horlogerie 10-Punkte Qualitätskatalog

1. **60–120 FPS Performance:** Ausschließliche Verwendung von `transform: translate3d(...) rotateY(...)` auf der GPU.
2. **Zero Layout Shifts:** Fixierte Container-Dimensionen verhindern Reflows während der Orbit-Drehung.
3. **Mobile Autodownscale:** Radius und z-Tiefe schrumpfen auf Mobilgeräten (< 768px) automatisch um $40\%$.
4. **Touch-Inertia:** Trägheitsbasiertes Wischen auf Touchscreens mit natürlichem Abbremsen.
5. **Accessibility / Keyboard Controls:** Tab-Navigation und Pfeiltasten (`ArrowLeft`, `ArrowRight`) wechseln Karten barrierefrei.
6. **Sound-Design:** Metallisches Klick-Geräusch via `soundManager.play('chip')` bei jedem Karten-Einrasten.
7. **SSR-Hydration-Safe:** Kartenpositionen berechnen sich determiniert ohne Flackern beim ersten Paint.
8. **Sub-Pixel Crispness:** Antialiasing-Fixes via `backface-visibility: hidden` und `transform-style: preserve-3d`.
9. **Memory-Leak-Freiheit:** Saubere Cleanup-Routinen für alle Pointer- und Resize-Listener.
10. **TDD-Verifikation:** Test-Coverage für Winkelberechnungen, Grenzwerte und Rangwechsel.

---

## 6 — 5-Phasen-Execution-Roadmap

- [ ] **Phase 1: Orbit Primitive Engine:** Erstellung von `src/components/casino/motion/OrbitCardStack.tsx`.
- [ ] **Phase 2: Touchpoint O1 Integration:** Veredelung des VIP-Progression-Bereichs in `src/app/vault/page.tsx`.
- [ ] **Phase 3: Touchpoint O2 Integration:** Implementierung des Champion-Podiums in `src/app/leaderboard/page.tsx`.
- [ ] **Phase 4: Touchpoint O3 Integration:** Integration in `src/components/casino/RankBenefitsModal.tsx`.
- [ ] **Phase 5: 5-Stufen-DoD & Audit:**
  - `npm run typecheck` (0 Fehler)
  - `npm test` (100% grün)
  - `npm run lint` (0 Fehler)
  - Playwright Screenshot-Verifikation aller 3 Orbits
