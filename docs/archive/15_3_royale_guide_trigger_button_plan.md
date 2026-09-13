# 15_3 — Royale Guide: Trigger-Button (FAB & Sidebar) Veredelung

> **Status:** Executed (archiviert) · **Stand:** 2026-09-11 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Veredelung des schwebenden FAB-Triggers und Sidebar-Triggers des Royale Guides: Taktile magnetische Cursor-Anziehung (`magnetic-dock`), lebendiger Radar-Ping-Ring & Unread-Indikator, weiche Ein-/Ausblend-Transition mit Framer-Motion-Spring-Physik (kein harter DOM-Cut) und exklusiver Goldglanz-Hover nach Obsidian & Gold Design-System.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|---|---|
| **L0** | Baseline & Bestandsanalyse | `GuideTriggerButton.tsx`, `MainSidebar.tsx` | 🟢 Verifiziert | LLM | Aktueller DOM-Stand, Props und Styling erfasst; Testsuite steht bereit |
| **L1** | Magnetische Physik & Taktiler Trigger | `GuideTriggerButton.tsx` | 🔴 Geplant | LLM | `Magnetic`-Wrapper integriert; sanfter Hover-Drift und elastischer Federeffekt |
| **L2** | Radar-Ping-Ring & Dynamischer Unread-Badge | `GuideTriggerButton.tsx` | 🔴 Geplant | LLM | Konzentrischer Smaragd-/Gold-Radarring mit unendlicher Atmung + optionaler Badge-Indikator |
| **L3** | Organische Ein-/Ausblendung (AnimatePresence) | `GuideTriggerButton.tsx`, `CasinoGuidePanel.tsx` | 🔴 Geplant | LLM | Ersetzt harter `display: none`-Cut durch saubere `scale`- & `opacity`-Exit-Transition |
| **L4** | Sidebar-Trigger Veredelung | `MainSidebar.tsx` | 🔴 Geplant | LLM | Edler VIP-Hover mit Gold-Shimmer und dezentem Pulse-Dot im Nav-Item |
| **L5** | 5-Stufen-DoD & Nachher-Screenshot | `GuideTriggerButton.tsx`, `screenshots/` | 🔴 Geplant | LLM | Typecheck, Vitest, Lint, Build grün; Live-Screenshot `49_nachher_guide_fab_trigger.png` erstellt |

---

## 2 — Problem-Analyse & Kernursachen

1. **Statischer Pill-Button ohne Haptik (Score: 88 %):**
   - Der aktuelle FAB unten rechts nutzt eine einfache CSS-Atmung (`scale: [1, 1.022, 1]`), reagiert aber nicht physikalisch auf den Cursor des Spielers.
   - Es fehlt das Gefühl eines schweren, massiven VIP-Drückers in einem Monte-Carlo-Privatsalon.
2. **Kein Unread- bzw. Radar-Ping-Indikator:**
   - Der Live-Dot ist statisch grün ohne echten Radar-Sweep oder Wellenimpuls.
3. **Harter DOM-Cutoff beim Öffnen:**
   - Beim Klick wird der Button per `display: isOpen ? 'none' : 'inline-flex'` abrupt ausgeblendet, anstatt sich mit Framer Motion elegant aufzulösen oder weich zusammenzufalten.
4. **Sidebar-Trigger unauffällig:**
   - In der Haupt-Sidebar fehlt ein korrespondierender edler Hover-Effekt, der die VIP-Bedeutung des Royale Guides widerspiegelt.

---

## 3 — Ziel-Zustand & Architektur-Design

1. **Magnetische Cursor-Physik (`Magnetic` / `magnetic-dock`):**
   - Bei Annäherung der Maus wird der FAB im Radius von 60px sanft um bis zu 6–8px zum Cursor hingezogen (Feder: `stiffness: 250, damping: 18, mass: 0.1`).
   - Auf Touch-Geräten (Mobile) wird die Magnetphysik automatisch deaktiviert (`isMobile ? false : true`).
2. **Radar-Ping-Ring (Luxus-Atmung):**
   - Ein zweistufiger, konzentrischer Radar-Ring breitet sich periodisch um den Live-Dot aus (`scale: [1, 2.4]`, `opacity: [0.8, 0]`), was dem Spieler subtil signalisiert: *Der Guide beobachtet den Spieltisch und steht bereit.*
3. **Nahtlose AnimatePresence-Integration:**
   - Der Trigger-Button wird in `CasinoGuidePanel.tsx` innerhalb von `<AnimatePresence>` mit sauberem `initial={{ scale: 0.85, opacity: 0 }}`, `animate={{ scale: 1, opacity: 1 }}` und `exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.18 } }}` gerendert. Kein abruptes Verschwinden mehr.
4. **Design-System-Treue („Obsidian & Gold“):**
   - Kanten: `1px solid rgba(212, 175, 55, 0.45)`, mit zartem Innenlicht `inset 0 1px 0 rgba(255, 255, 255, 0.2)`.
   - Z-Index: Konform in Layout-Zone 46 (`zIndex: 46`).
   - Safe-Area-Handling auf Mobile bleibt zu 100 % erhalten.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. **Typecheck:** `npm run typecheck` (0 Fehler)
2. **Unit Tests:** `npm test -- --run src/components/social/casino-guide/` (100 % grün)
3. **Linter:** `npm run lint` (0 Fehler)
4. **Production-Build:** `npm run build` (Exit-Code 0)
5. **Visueller Beweis & Screenshot:** Playwright Live-DOM Snapshot auf `localhost:3015` unter `docs/frontend/screenshots/49_nachher_guide_fab_trigger.png`.
