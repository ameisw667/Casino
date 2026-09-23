# Meilenstein 15.8: Royale Guide Chat-Area & Typography-Streaming

**Datum:** 11. September 2026  
**Status:** 🟡 Execution-Ready  
**Ziel:** Veredelung der Chat-Area, Typografie und des Streaming-Renderings (Dimension 6) in GuideMarkdown.tsx, GuideMessageList.tsx und GuideThinkingSkeleton.tsx auf AAA-Weltklasse-Niveau (Score >= 95 %), basierend auf den Empfehlungen aus docs/frontend/14_royale_guide_motion_componentry_recommendations.md (Kinetic Text Reveal & Tabular Math) und xx_sop/04_design_system_ui.md ("Obsidian & Gold").

---

## 1. Ausgangslage & Bottlenecks (Dimension 6)

- **Aktueller Score:** 87 % / 100 %
- **Aktuelle Schwachstellen:**
  1. Mathematische Formeln, RTP-Werte, Quoten und Wahrscheinlichkeiten werden im Fließtext mit proportionalen Schriften gerendert ( abular-nums fehlt).
  2. LaTeX-Formelblöcke (cleanLatexMath) werden als roher Text ohne visuelle Formel-Prägung oder Berechnungs-Header dargestellt.
  3. Tabellen im Chat besitzen noch kein VIP-Finish mit abwechselndem Obsidian-Velvet-Zellenglanz.
  4. Die Assistant-Message-Bubble wirkt im Streaming-Zustand statisch; der Streaming-Cursor benötigt einen warmen Gold-Atemglow.
  5. Der Thinking-Skeleton-Zustand kann durch fein akzentuierte Rechenmatrix-Elemente noch luxuriöser wirken.

---

## 2. Ziel-Architektur & Design-Vorgaben

### A. Gestochen scharfe Zahlen- & Formel-Typografie ( abular-nums)

- Aktivierung von ontFeatureSettings: '"tnum" on' und ontVariantNumeric: 'tabular-nums' auf allen Nachrichten-Containern und Tabellenzellen.
- Zahlen, Multiplikatoren (z. B. 2.50x, 35:1), Quoten und Prozentwerte werden mit gestochen scharfem Monospace/Gold-Highlight hervorgehoben.

### B. Veredelte Formel-Karten (Math Card Engine)

- Blockformeln (\[ ... \] und $$ ... ) erhalten eine eigene "Mathematical Proof"-Card:
  - Kleiner Gold-Header Σ FORMEL & QUOTEN-BERECHNUNG.
  - Velvet-Obsidian-Hintergrund mit 1px Gold-Border (
    gba(212, 175, 55, 0.30)).
  - Saubere Bruchstrich- und Exponenten-Darstellung.

### C. Kinetischer Streaming-Cursor & VIP-Tabellen

- Animierter Gold-Cursor mit atmendem Halo (oxShadow: 0 0 10px rgba(212, 175, 55, 0.7)).
- Tabellen mit goldenem Header-Verlauf, Kanten-Radius, responsivem horizontalem Scroll-Schutz und sauberen Zeilentrennern.

---

## 3. Umsetzungs-Schritte

1. **Status:** Scorecard in Z_LLM/11_royale_guide_frontend_design_evaluation.md auf In Execution setzen.
2. **Code-Umsetzung:**
   - GuideMarkdown.tsx: Tabular-Nums, verbesserte Math-Card-Formatierung, edles Tabellen-Finish.
   - GuideMessageList.tsx: Kinetischer Streaming-Cursor, optimiertes Bubble-Spacing.
   - GuideThinkingSkeleton.tsx: Kinetische Rechenmatrix-Atmung.
3. **5-Stufen-Verifikation (DoD):**
   -

pm run typecheck
-

pm test
-

pm run lint
-

pm run build

- git status

4. **Live-Screenshot & Cropping:**
   - Screenshot der veredelten Chat-Area mit Formel/Zahlen: docs/frontend/screenshots/54_nachher_guide_streaming_typography.png.
5. **Scorecard & Archiv:**
   - Z_LLM/11_royale_guide_frontend_design_evaluation.md aktualisieren (Score 87% -> 95%).
   - Plan archivieren nach docs/archive/15_8_royale_guide_typography_streaming_plan.md.
