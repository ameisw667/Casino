# SOP: Design System & UI (Design-Guardian)

> **Zweck:** Verbindliche Gestaltungsrichtlinien, Farbcodes, Animationsparameter und UI-Komponenten-Standards für alle Frontend- und UI-Entwicklungen im Casino.

---

## 1 — Visuelle Identität (Obsidian & Gold)

* **Design-Philosophie:** "Obsidian & Gold (Premium)" — VIP-Casino-Ästhetik mit dunklen Oberflächen und goldenen Akzenten.
* **Farbschema:**
  * **Hintergrund:** Obsidian (`#0B0E14` / reines Schwarz/Tiefdunkel, keine reinen Grautöne).
  * **Primär-Akzente / CTAs / Gewinne:** Gold (`#D4AF37` bzw. Gold-Gradients).
  * **Erfolg / Gewinn:** Emerald Green (`#10B981` / `#059669`).
  * **Fehler / Verlust:** Ruby Red (`#EF4444` / `#DC2626`).
  * **Neutral / Borders:** Semi-transparente Weiß-/Gold-Kanten (`border-white/10` / `border-amber-500/20`).

---

## 2 — Glassmorphism-Standard

Mandatorisch für alle Modals, Navigationsleisten, Dropdowns und Card-Container:

* **Backdrop-Filter:** `backdrop-filter: blur(12px)`
* **Hintergrundfarbe:** Semi-transparentes Schwarz (`bg-black/40` bis `bg-black/60`).
* **Borders:** Subtile 1px-Kanten mit leichter Deckkraft (`border border-white/10`).

---

## 3 — Typografie-Regeln

* **Standard-UI / Fließtext:** Moderner Sans-Serif Font (Inter / Gehobene Sans).
* **Dynamische Werte:** **Monospace-Font** (Balance, Multiplikatoren, Quoten, Leaderboard-Punkte, Zähler), um Layout-Flicker und Breitenverschiebungen beim Tickern zu verhindern.

---

## 4 — Motion & Animations-Physik (Framer Motion 12)

Alle interaktiven Elemente müssen über standardisierte Spring-Physik animiert werden:

* **Spring-Konfiguration:** `type: "spring", bounce: 0.4`
* **Hover-Interaktion:** `whileHover={{ scale: 1.02 }}`
* **Klick / Tap:** `whileTap={{ scale: 0.95 }}`
* **Wiederverwendbare Primitives:**
  * `src/components/ui/VibeMotion.tsx` (Standard-Wrapper für Page-/Element-Transitions)
  * `src/components/ui/Magnetic.tsx` (Magnetischer Cursor-Follower für Buttons)

---

## 5 — Z-Index-Hierarchie

Zur Vermeidung von Layering-Konflikten gilt strikt folgende Z-Index-Staffelung:

| Layer | Z-Index | Komponenten |
| :--- | :---: | :--- |
| **Page Content** | `0 – 10` | Tabellen, Charts, Spielbretter, Hintergrund-Canvas |
| **Navigation** | `20` | Header, Sidebar, Bottom-Nav |
| **Dropdowns** | `30` | Filter-Menüs, Select-Dropdowns, User-Menü |
| **Overlays** | `40` | Backdrop-Dimmer, Ambient Glow, Tooltips |
| **Modals** | `50` | WalletModal, SettingsModal, PlayerProfileModal |
| **Toasts / Notifications** | `100` | Sonner/Toast-Meldungen |
| **Loading / Splash** | `999` | Globale Lade-Overlays, Route-Transition-Blocker |

---

## 6 — Gewinn-Feedback & Trigger

* **Jeder Gewinn** muss visuelles Feedback auslösen:
  * Kleinere Gewinne ($< 5\times$ Einsatz): Glow-Effekt + Sound-Trigger.
  * Mittlere Gewinne ($5\times – 20\times$ Einsatz): Partikel / Confetti + Audio.
  * **Big Wins ($> 20\times$ Einsatz):** Pflicht-Trigger für `BigWinOverlay` + Vollbild-Animation.
