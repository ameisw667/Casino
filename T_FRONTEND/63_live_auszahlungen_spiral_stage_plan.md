# 63 — Live-Auszahlungen: Interaktive Spiral-3D Stage (Componentry)

> **Status:** Execution-Ready · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Transformation der statischen Live-Auszahlungsbox in eine dynamische, interaktive 3D-Helix/Karten-Bühne (`spiral-3d-slider` & `flipping-word-swap`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Option-Gate Matrix (Workflow-Jan Schema)

*Kriterien: Taktiler Interaktionsgrad 30 % · 3D-Bühnen-Ästhetik 25 % · Performance (60–120 FPS) 25 % · Mobile Ergonomie 20 %*

| Option | Konzept & Layout | Visuelle Dichte & Componentry-Inspiration | Motion & Interaktion | Score | Pre-Mortem (Führungsoption) | Empfehlung |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **Option A (Empfohlen)** | **Interaktive 3D-Auszahlungs-Helix (Spiral Stage)** | 3D-Kartenkaskade im Geiste der `Spiral 3D Stage` (`spiral-3d-slider`): Dynamische Z-Tiefe, schwebende Obsidian-Gold-Karten mit Goldkanten-Reflexion, Live-Auswahl und Auto-Glide. | Mausrad-Navigation, Drag/Swipe-Geste, Klick öffnet Detailkarte; flüssige Spring-Physik (`stiffness: 320`). | **4.7 / 5** | *„Scheitert diese Option in 6 Monaten, woran läge es? Zu starker 3D-Overhead auf alten Budget-Smartphones ohne WebGL-Beschleunigung — erfordert 2D-CSS-Transform Fallback.“* | ✅ **Empfohlen** |
| **Option B** | **Vertikales Marquee-Karussell** | Einfacher 1D-Scrollstream ohne 3D-Perspektive oder Tiefenstaffelung. | Kontinuierliches Autoscroll, kaum Interaktivität. | **3.4 / 5** | — | ⚪ Alternative |
| **Option C** | **Fisheye Infinite Grid** | 2D-Flächenraster mit Linsenverzerrung statt fokussierter Auszahlungs-Helix. | Zu breiter Platzbedarf in einer 2x2 Bento-Zelle. | **3.0 / 5** | — | ❌ Nicht empfohlen |

---

## 2 — Visuelle Beweisführung (Status Quo)

- **Vorher (Status Quo):**  
  ![Status Quo Live Auszahlungen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/63_status_quo_live_auszahlungen.png)  
  *Befund:* Box wirkt flach und statisch. Ein simpler Textblock oben und vier starre Zeilen unten, keine räumliche Tiefe oder Spielfreude.

---

## 3 — Meilensteine (100 % LLM-Zuständigkeit)

| Meilenstein | Titel | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **L0** | Baseline & 3D-Transform Setup | `src/components/home/bento/LiveHighlightStream.tsx` | 🔴 Geplant | LLM | Perspective 1000px, 3D CSS Trigo |
| **L1** | Spiral 3D Helix Interaktion | `src/components/home/bento/LiveHighlightStream.tsx` | 🔴 Geplant | LLM | Schwebende 3D-Karten, Drag/Wheel-Navigation, Spring Motion |
| **L2** | Detail-Karten & High-Roller Modal | `src/components/home/bento/LiveHighlightStream.tsx` | 🔴 Geplant | LLM | Klick-Feedback, VIP-Aura, Soundeffekt-Trigger |
| **L3** | Screenshot-Audit & 5-Stufen-DoD | Test-Suite & Playwright | 🔴 Geplant | LLM | Typecheck, Tests, Lint, Build & Nachher-Screenshot |

---

## 4 — Verifikation & DoD

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm test` — Tests grün.
3. `npm run lint` — Keine Lint-Fehler.
4. `npm run build` — Next.js Production Build erfolgreich.
5. Screenshot: `docs/frontend/screenshots/63_success_live_auszahlungen.png`.
