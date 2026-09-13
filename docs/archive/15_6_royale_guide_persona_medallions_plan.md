# 15_6 — Royale Guide: Header & VIP-Persona-Medaillons (3D-Avatar & Hover-Sheen)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-11 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Veredelung der Header-Architektur und der VIP-Persona-Medaillons des Royale Guides: Taktile Micro-Elevation mit Spring-Physik (`whileHover={{ y: -2, scale: 1.025 }}`), subtiler metallischer Lichtsheen (`hover-transition`) auf den Concierge-Karten, goldener Schimmerring um den aktiven 3D-Medaillon-Avatar sowie feines Status-Feedback beim Persona-Wechsel.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|---|---|
| **L0** | Diagnose & Medaillon-Audit | `GuideHeader.tsx` | 🟢 Verifiziert | LLM | Analyse des aktuellen Medaillon-Aufbaus (Großansicht 38px, Kompakt 24px) |
| **L1** | Metallischer Lichtsheen (`hover-transition`) | `GuideHeader.tsx` | 🟢 Verifiziert | LLM | Zarter wandernder Glanzstreifen bei Mausüberhang über die Medaillon-Karten |
| **L2** | Taktile Micro-Elevation & Gold-Bloom | `GuideHeader.tsx` | 🟢 Verifiziert | LLM | Spring-Federn mit Gold-Glow (`boxShadow: 0 10px 24px rgba(0,0,0,0.65), 0 0 18px rgba(212,175,55,0.38)`) |
| **L3** | Goldener Avatar-Schimmerring & Tooltip | `GuideHeader.tsx` | 🟢 Verifiziert | LLM | Konzentrischer Goldrand um das aktive Portrait, präzise Tooltip-Beschreibung |
| **L4** | 5-Stufen-DoD & Nachher-Screenshot | `GuideHeader.tsx`, `screenshots/` | 🟢 Verifiziert | LLM | Typecheck, Vitest, Lint, Build grün; Live-Screenshot `52_nachher_guide_persona_medallions.png` erstellt |

---

## 2 — Problem-Analyse & Kernursachen

1. **Statischer Hover-Zustand (Score: 93 % ➔ 97 %):**
   - Durch den metallischen Lichtglanz (`hover-transition`) und subtile Höhenverschiebung (`y: -2`) fühlen sich die 3 Hosts (Math Strategist, High-Roller Concierge, Casual Buddy) an wie physisch greifbare VIP-Mitgliedskarten.
2. **Aktiver Medaillon-Fokus:**
   - Der goldene Ring um den aktiven Host besitzt nun einen sanften Gold-Glow, der die lebendige KI-Präsenz unterstreicht.
