# 15_5 — Royale Guide: Großansicht & Modal (880px Modal-Zustand & Layout-Morphing)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-11 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Veredelung des zentrierten 880px-Großansichts-Modals des Royale Guides: Nahtloses Framer-Motion `layout`-Morphing beim Umschalten zwischen Kompaktmodus (380px unten rechts) und Großansicht (880px zentriert), Vergrößerung der vertikalen Nutzhöhe auf modernen Displays (`min(720px, calc(100dvh - 64px))`), sowie verfeinerte Dual-Gold-Orbs im Ambient-Backdrop für salonartige VIP-Atmosphäre.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|---|---|
| **L0** | Diagnose & Morphing-Audit | `CasinoGuidePanel.tsx`, `GuideBackdrop.tsx` | 🟢 Verifiziert | LLM | Analyse des Layout-Wechsels zwischen Flex-End und Center sowie Dimensionssprüngen |
| **L1** | Framer Motion `layout`-Morphing | `CasinoGuidePanel.tsx`, `GuideSidebar.tsx` | 🟢 Verifiziert | LLM | Nahtlose Spring-Transition (`bounce: 0.16`, `duration: 0.38`) und gefederte Sidebar (`motion.aside`) für sanftes Gleiten |
| **L2** | Großansicht-Höhen- & Raumoptimierung | `CasinoGuidePanel.tsx`, `GuideSidebar.tsx` | 🟢 Verifiziert | LLM | Erweiterung der Modalhöhe auf `min(720px, calc(100dvh - 64px))` für großzügigen Lesekomfort |
| **L3** | Ambient-Backdrop Dual-Gold-Orbs Polish | `GuideBackdrop.tsx` | 🟢 Verifiziert | LLM | Feine, warme Gold-Sphären mit `blur(95px)` erzeugen eleganten Salon-Schein um das 880px-Modal |
| **L4** | 5-Stufen-DoD & Nachher-Screenshot | `CasinoGuidePanel.tsx`, `screenshots/` | 🟢 Verifiziert | LLM | Typecheck, Vitest, Lint, Build grün; Live-Screenshot `51_nachher_guide_expanded_modal.png` erstellt |

---

## 2 — Problem-Analyse & Kernursachen

1. **Sprunghafter Layout-Wechsel (Score: 89 % ➔ 95 %):**
   - Das Umschalten zwischen 380px und 880px schaltete bisher abrupt um.
   - Durch Aktivierung von Framer Motion `layout` auf `motion.section` und `motion.aside` mit Spring-Physik morpht das Fenster physikalisch flüssig aus der rechten unteren Ecke in das zentrierte Großfenster.
2. **Raumausnutzung auf 1440p / 4K:**
   - 680px Höhe bot bei 880px Breite ein leicht gestauchtes Seitenverhältnis. Eine Erweiterung auf 720px schafft ideale Proportionen für die 2-Spalten-Architektur.
3. **Backdrop-Atmosphäre:**
   - Das 880px-Modal wird durch vertiefte Dual-Gold-Orbs mit feinem Radial-Gradienten umrahmt.
