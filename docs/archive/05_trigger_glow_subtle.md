# 05 — Trigger Button Polish: Subtiler Obsidian & Gold Glow

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 / Royale Guide (`CasinoGuidePanel.tsx`)**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Scope: Veredelung des Floating-Buttons durch Ersetzen des grellen Arcade-Glows durch einen tiefen Obsidian-Schatten mit feinem, dezentem Gold-Lichtsaum (60% weniger Glow-Intensität).

---

## 1 — Evaluierung & Entscheidung

| Option | Schatten & Glow-Architektur | Visueller Effekt | Entscheidung |
| :--- | :--- | :--- | :---: |
| **Option A: Obsidian Edge Glow & Deep Shadow** | • Tiefer schwarzer Drop-Shadow (`0 8px 24px rgba(0, 0, 0, 0.55)`)<br/>• Feiner, dezenter Gold-Atemzug (`0 0 10px-16px hsla(45, 85%, 55%, 0.12-0.2)`)<br/>• Sanftes 3.2s Mikro-Pulsieren (`scale: [1, 1.022, 1]`) | Luxuriöser, reifer VIP-Look; gut sichtbar ohne Blendwirkung oder Arcade-Glow | 🟢 **Gewählt & Executed** |
| **Option B: Pure Obsidian Glass mit Inner Shimmer** | Nur schwarzer Schatten, kein äußerer Glow; nur obere Glaskante reflektiert | Sehr minimalistisch, verliert aber etwas visuelle Präsenz im dunklen Layout | ⚪ Verwurfen |
| **Option C: Statische Dark Pill mit Live-Dot-Fokus** | Statischer Button ohne Schatten-Animation, nur grüner Dot pulsiert | Technisch funktional, verliert den lebendigen Charakter des AI-Guides | ⚪ Verwurfen |

---

## 2 — Übersicht für Jan (Execution)

| Schritt | Meilenstein | Status | Verifikation | Zuständigkeit |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Planung & Spezifikation** | 🟢 Executed | Spezifikation in `05_trigger_glow_subtle.md` dokumentiert | LLM |
| **2** | **CSS & Motion-Anpassung in `CasinoGuidePanel.tsx`** | 🟢 Executed | Glow-Spread von 36px auf 16px reduziert, Opacity von 0.44 auf 0.20 gedrosselt, 3.2s Easing integriert | LLM |
| **3** | **Verifikation & Testlauf** | 🟢 Executed | 91/91 Vitest-Suites, TypeScript Typecheck & Next.js Build (38/38 Seiten) grün | LLM |
