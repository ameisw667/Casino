# 76 — Sticky Scroll Cards (2-Touchpoint Execution Plan)

> **Status:** Execution-Ready · **Niveau:** Weltklasse (Top 1% Haute Horlogerie Standard)  
> **Offizielle Componentry-Spezifikation:** [componentry.dev/docs/components/sticky-scroll-cards](https://componentry.dev/docs/components/sticky-scroll-cards)  
> **Kern-Technologie:** Scroll-Linked Dynamic Scaling + Stacking Elevation + Progressive Opacity & Blur  
> **Scope:** Zwei separierte Touchpoints (S1: VIP Onboarding Flow, S2: Provably Fair 3-Step Explanation) — *S3 auf Nutzeranweisung ausgeschlossen*

---

## 1 — Executive Summary & Status Quo Bewertung

Mehrschrittige Abläufe (Onboarding, Sicherheits- und Fairness-Erklärungen) wirken in Standard-Modalen oft wie simple Textwüsten mit Klick-Buttons. Durch **Sticky Scroll Cards** heften sich Karten beim Scrollen oben an, während nachfolgende Karten organisch von unten heraufgleiten und sich mit natürlicher Skalierung (`scale: 0.95 -> 1.0`), Elevation und subtilem Unschärfe-Fade über die vorherigen Karten legen.

### Status Quo Bottleneck-Matrix

| Touchpoint | Aktueller Zustand | Defizit / Bottleneck | Ziel-Architektur (Sticky Scroll Cards) |
| :--- | :--- | :--- | :--- |
| **S1: VIP Onboarding** | Horizontaler Modal-Dialog mit Klick-Pfeilen | Standard-Popup-Gefühl ohne fließende Lese-Dramaturgie | 4 schwere Luxus-Dokumente stapeln sich beim vertikalen Scrollen übereinander |
| **S2: Provably Fair Modal** | Statische Input-Felder und Textabsätze | Mathematischer Beweis wirkt abstrakt und überfordernd | 3-Schritte-Karten stapeln sich sukzessive (1. Server Hash ➜ 2. Client Seed ➜ 3. SHA-256) |

---

## 2 — Touchpoint S1: VIP Onboarding & Feature-Tour Guide

### 2.1 Spezifikation & Ziel-Umgebung
- **Vollständige URL:** `http://localhost:3015/` (sowie Onboarding Flow)
- **Betroffene Datei:** [`src/components/casino/onboarding/StickyScrollTour.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/onboarding/StickyScrollTour.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_sticky_1_onboarding.png)  
  ![Onboarding Flow](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_sticky_1_onboarding.png)

### 2.2 Technische Architektur & Komponenten-Aufbau
1. **4-Stufen-Stacking-Hierarchie:**
   - Karte 1: `VIP WILLKOMMENSPAKET` ($100\%$ Match bis $\$500$).
   - Karte 2: `CASINO ORIGINALS SUITE` (Crash, Roulette, Dice, Blackjack).
   - Karte 3: `100% PROVABLY FAIR VERIFIZIERT` (Kryptografische Transparenz).
   - Karte 4: `INSTANT VIP RAKEBACK` (Echtzeit-Guthaben ohne Umsatzanforderungen).
2. **Scroll-Verhalten:**
   - Lokaler Scroll-Container mit `position: sticky; top: 20px;`.
   - Jede Karte bleibt haften, bis die nächste Karte $80\%$ ihrer Höhe überdeckt hat, und tritt dann mit `scale: 0.94` und `filter: blur(4px)` in den Hintergrund.

---

## 3 — Touchpoint S2: Provably Fair 3-Schritte-Erklärung

### 3.1 Spezifikation & Ziel-Umgebung
- **Vollständige URL:** `http://localhost:3015/testing/fe-28-provably-fair` (sowie alle Spielmodals)
- **Betroffene Datei:** [`src/components/casino/ProvablyFairModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/ProvablyFairModal.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_sticky_2_provably_fair.png)  
  ![Provably Fair](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_sticky_2_provably_fair.png)

### 3.2 Technische Architektur & Komponenten-Aufbau
1. **3-Schritte-Transparenz-Karten:**
   - Schritt 1: `SERVER SEED (HASH)` — Vor jeder Runde unveränderlich festgelegt.
   - Schritt 2: `CLIENT SEED (USER-INFLUENCE)` — Vom Spieler wählbar.
   - Schritt 3: `SHA-256 HMAC DETERMINATION` — Mathematisches Runden-Ergebnis.
2. **Karten-Stapelung:**
   - Beim Scrollen durch das Modal schiebt sich die nächste Rechenstufe über die vorherige, wodurch der kausale Zusammenhang der Verschlüsselung sofort intuitiv erfasst wird.

---

## 4 — Haute Horlogerie 10-Punkte Qualitätskatalog

1. **Zero Window-Hijacking:** Der Haupt-Scroll der Seite wird niemals blockiert; Scrolling läuft nativ und ruckelfrei.
2. **CSS Sticky Native:** Ausnutzung nativer Browser-Mechanismen (`position: sticky`) für maximale Performance.
3. **Framer Motion Micro-Fades:** Subtile Skalierungs- und Deckkraft-Interpolationen über `useScroll`.
4. **Schwere Materialität:** Kantenabschlüsse mit 1px goldenem Gradient und tiefem Schlagschatten (`box-shadow: 0 20px 40px rgba(0,0,0,0.8)`).
5. **Mobile-Responsivität:** Kompakte vertikale Abstände auf Smartphones ($12\text{ px}$ Stapel-Überhang statt $24\text{ px}$).
6. **Progress-Indikator:** Vertikale Zähler-Leiste (`01 / 04`, `02 / 04`) am linken Rand.
7. **Barrierefreiheit:** Semantische `<article>`-Elemente mit passenden ARIA-Headings.
8. **Dark Mode Obsidian:** Tiefschwarzer Hintergrund (`#0B0E14`) mit minimalem Umgebungs-Glow.
9. **Touch-Swipes:** Horizontale Wischgesten auf Touchscreens als alternative Navigationsmethode.
10. **TDD-Verifikation:** Test-Coverage für aktive Karten-Indizes und Scroll-Offsets.

---

## 5 — 5-Phasen-Execution-Roadmap

- [ ] **Phase 1: Sticky Scroll Cards Primitive:** Erstellung von `src/components/casino/motion/StickyScrollCards.tsx`.
- [ ] **Phase 2: Touchpoint S1 Integration:** Umbau der Tour in `src/components/casino/onboarding/StickyScrollTour.tsx`.
- [ ] **Phase 3: Touchpoint S2 Integration:** Einbettung der 3-Schritte-Karten in `src/components/casino/ProvablyFairModal.tsx`.
- [ ] **Phase 4: 5-Stufen-DoD & Audit:**
  - `npm run typecheck` (0 Fehler)
  - `npm test` (100% grün)
  - `npm run lint` (0 Fehler)
  - Playwright Screenshot-Verifikation beider Stacks
