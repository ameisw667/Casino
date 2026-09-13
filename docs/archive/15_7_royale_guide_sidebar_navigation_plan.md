# Meilenstein 15.7: Royale Guide Schnellzugriff-Sidebar & Nav-Cards (Collection-Surfer)

**Datum:** 11. September 2026  
**Status:** 🟢 Executed (archiviert)  
**Ziel:** Veredelung der Schnellzugriff-Sidebar (Dimension 5) in src/components/social/casino-guide/GuideSidebar.tsx auf AAA-Weltklasse-Niveau (Score: 96 %), basierend auf den Empfehlungen aus docs/frontend/14_royale_guide_motion_componentry_recommendations.md (Collection-Surfer & Magnetic-Dock Haptik) und xx_sop/04_design_system_ui.md ("Obsidian & Gold").

---

## 1. Ausgangslage & Bottlenecks (Dimension 5)

* **Vorheriger Score:** 92 % / 100 %
* **Erreichter Score:** 96 % / 100 %
* **Gelöste Schwachstellen:**
  1. Die Sidebar (GuideSidebar.tsx) wurde von einem statischen <aside> zu einem gefederten <motion.aside> mit Spring-Physik (initial={{ width: 0, opacity: 0 }}, nimate={{ width: 224, opacity: 1 }}) umgebaut.
  2. Jede Navigationskarte besitzt nun einen linken goldenen Indikatorbalken (orderLeft: 3px solid #D4AF37), der bei Hover aufleuchtet.
  3. Aktiver Spielkontext (isContextMatch, z. B. Blackjack) erhält eine erhabene Gold-Aura, goldenen Rahmen, subtiles Pulsieren und einen smaragdgrünen "• AKTIV"-Live-Badge.
  4. Die Untertitel (sub) aus guide-config.ts (z. B. "Split, Double Down & Dealer-Regeln") werden typografisch gestochen scharf zweizeilig dargestellt.
  5. Der Status-Footer unten besitzt einen echten pulsierenden Live-Radar-Dot (#10b981), Knowledge-Hub-Status und Versions-Badge 2.4.
  6. Alles bleibt zu 100 % scrollfrei und perfekt in die 720px-Modalgeometrie eingepasst.

---

## 2. Visueller Nachweis

* **Nachher-Screenshot:** [docs/frontend/screenshots/53_nachher_guide_sidebar_quick_access.png](../frontend/screenshots/53_nachher_guide_sidebar_quick_access.png)

---

## 3. Verifikation (5-Stufen-DoD)

- [x] 
pm run typecheck (0 Fehler)
- [x] 
pm test (222 Test-Dateien, 1696 Tests bestanden)
- [x] 
pm run lint (0 Fehler)
- [x] 
pm run build (Next.js 16.3 Turbopack Production Build erfolgreich)
- [x] git status (Saubere Verfolgung)
