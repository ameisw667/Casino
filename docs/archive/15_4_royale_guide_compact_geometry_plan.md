# 15_4 — Royale Guide: Kompaktansicht (380px Floating) & Backdrop-Dimmer

> **Status:** Executed (archiviert) · **Stand:** 2026-09-11 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Veredelung des kompakten 380px-Floating-Zustands des Royale Guides: Schützender Ambient-Backdrop-Dimmer auch im Desktop-Kompaktmodus zur Beruhigung des visuellen Rauschens bei bewegten Spieltischen (Roulette/Crash), Integration der kompakten Schnellzugriff-Themen-Chips (`GuideQuickChips`) im Fußbereich für direkte Ein-Klick-Fragen, sowie feine Goldglanz-Kantenakzentuierung.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|---|---|
| **L0** | Diagnose & Geometrie-Audit | `CasinoGuidePanel.tsx`, `GuideBackdrop.tsx` | 🟢 Verifiziert | LLM | Analyse des aktuellen Render-Zweigs im Kompaktmodus (380px) |
| **L1** | Subtiler Ambient-Backdrop-Dimmer | `GuideBackdrop.tsx`, `CasinoGuidePanel.tsx` | 🟢 Verifiziert | LLM | Zarter Obsidian-Dimmer (`backdropFilter: blur(6px)`) auch bei Desktop-Kompaktansicht |
| **L2** | Quick-Chips Aktivierung im 380px-Modus | `CasinoGuidePanel.tsx`, `GuideQuickChips.tsx` | 🟢 Verifiziert | LLM | Themen-Chips auch im kompakten Fenster horizontal scrollbar bereitstellen |
| **L3** | Kanten- & Tiefen-Polish (Obsidian & Gold) | `CasinoGuidePanel.tsx` | 🟢 Verifiziert | LLM | Konzentrische Radien (20px), Gold-Border (`1px solid rgba(212, 175, 55, 0.28)`), Click-outside schließt Panel |
| **L4** | 5-Stufen-DoD & Nachher-Screenshot | `CasinoGuidePanel.tsx`, `screenshots/` | 🟢 Verifiziert | LLM | Typecheck, Vitest (222 files), Lint (0 errors), Build grün; Live-Screenshot `50_nachher_guide_compact_geometry.png` erstellt |

---

## 2 — Problem-Analyse & Kernursachen

1. **Visuelles Rauschen über bewegten Tischen (Score: 86 % ➔ 94 %):**
   - Im 380px-Zustand war `GuideBackdrop` bisher komplett deaktiviert (`isOpen && (isExpanded || isMobile)`).
   - Jetzt sorgt ein zarter Dimmer (`backdropFilter: blur(6px)`, `hsla(0, 0%, 0%, 0.38)`) für eine ruhige Arbeitsumgebung, ohne das Spiel komplett zu verdecken. Ein Klick auf den Hintergrund schließt den Guide.
2. **Fehlende Quick-Chips im Kompaktmodus:**
   - `GuideQuickChips` ist nun direkt über der Eingabezeile integriert und sortiert das aktive Spiel (z. B. Blackjack) automatisch an die erste Position mit VIP-Gold-Border.
3. **Schattentiefe & Kantenpräzision:**
   - Der Rahmen besitzt nun eine verfeinerte, konzentrische Kantenführung (`1px solid rgba(212, 175, 55, 0.28)`) mit feinem Obsidian-Glow.
