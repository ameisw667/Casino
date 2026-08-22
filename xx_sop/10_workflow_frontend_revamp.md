# SOP: Frontend-Revamp & UI-Redesign (Jan-Frontend-Schema)

> **Zweck:** Standardisierter Ablauf für UI/UX-Überarbeitungen, Screen-Redesigns und visuelle Optimierungen auf Basis des Design-Systems („Obsidian & Gold“).

---

## 1 — Visuelle Analyse & Design-Audit

Nach Bereitstellung einer URL (`http://localhost:3015/...`) oder von Screenshots die bestehende UI gegen [`xx_sop/04_design_system_ui.md`](04_design_system_ui.md) prüfen:

* **Farben & Kontraste:** Obsidian-Hintergründe (`#0B0E14`), Gold-Akzente (`#D4AF37`), Smaragd (Win), Rubin (Loss). Keine unruhige Buntheit.
* **Typografie & Dichte:** Monospace für alle dynamischen Zahlen/Quoten/Multiplikatoren (kein Layout-Flicker). Kompakte Kacheln/Zeilen.
* **Glassmorphism:** `backdrop-filter: blur(12px)`, `bg-black/40` bis `bg-black/60`, subtile 1px-Borders (`border-white/10` / `border-amber-500/20`).
* **Motion & Physik:** `framer-motion` mit Spring-Physics (`type: "spring", bounce: 0.4`), `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.95 }}`.

---

## 2 — 3 UI/UX-Optionen vorlegen (Jan-Frontend-Schema)

Vor Code-Änderungen genau 3 Design-Konzepte in Tabellenform vorlegen:

| Option | UI/UX-Konzept | Visuelle Dichte & Stil | Motion & Interaktion | Empfehlung |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Empfohlen)** | <z. B. High-Density Glass Ledger> | Obsidian/Gold, Monospace-Werte | Spring-Hover, Sparkline-Fade | ✅ Empfohlen |
| **Option 2** | <z. B. Monochrom FinTech Grid> | Minimalistisch, 0 Glow | Reine Farb-Transitions (150ms) | ⚪ Alternative |
| **Option 3** | <z. B. 3D Hologram Cards> | Maximaler 3D-Tilt, Gold-Sheen | Parallaxe, Spring-Zoom (1.05x) | ❌ Nicht empfohlen |

### Detailbereich je Frontend-Option (Pflicht)
Genau 3 komprimierte Zeilen pro Option:
* **Layout & Komponenten:** DOM-Struktur, Anordnung und Responsive-Verhalten.
* **Styling & Motion:** Tailwind-Klassen, Blur-Werte, Borders, Motion-Parameter.
* **Betroffene Dateien & URLs:** Pfade (`[MODIFY]`, `[NEW]`) + Ziel-URL (`http://localhost:3015/...`).

---

## 3 — Stopp-Gate & Execution

1. **Stopp:** Warten auf Jans Freigabe (z. B. „Option 1“).
2. **Execution:** Nach Freigabe direkte Umsetzung nach [`xx_sop/02_workflow_jan_execution.md`](02_workflow_jan_execution.md).
3. **Planungsdatei:** Bei komplexen Umbauten temporäre Datei in `Z_FRONTEND/` nach [`xx_sop/03_workflow_jan_planungsdateien.md`](03_workflow_jan_planungsdateien.md) führen.

---

## 4 — Execution-Selbstprüfung

* **Build & Typecheck:** `npm run typecheck` und `npm run lint` müssen fehlerfrei durchlaufen.
* **Layout-Stabilität:** Keine Overlaps bei variablen Textlängen oder Viewport-Änderungen.
* **Interaktions-Check:** Hover-, Active- und Transition-Zustände aller modifizierten Buttons/Kacheln prüfen.

---

## 5 — Übergabe & URL-Bereitstellung

Abschlussmeldung enthält zwingend:
* Vollständige Liste aller betroffenen Test-URLs (`http://localhost:3015/...`).
* Konkrete Prüfpunkte für Jan zur visuellen Abnahme im Browser.
* Status-Sync in Master-Doku + Löschung abgeschlossener Planungsdateien in `Z_FRONTEND/`.
