# Temporärer Plan: Live Activity Feed Filter-Integration & Visibility Fix

> **Status:** 🟡 In Execution (2026-08-21) · **Owner:** LLM/Jan  
> **Projekt:** Casino (Next.js 16 App Router · React 19 · Zustand · Framer Motion · Tailwind/CSS)  
> **Scope:** Behebung der sporadisch fehlenden / weggescrollten Filter-Leiste ("All Bets / High Rollers") in `LiveActivityFeedV2.tsx`:
> 1. Integration der Filter-Tabs (`All Bets`, `High Rollers`, `My Bets`) direkt in den oberen Header-Bereich der `.glass-card`-Kachel.
> 2. Toolbar-Struktur mit VIP-Pill-Buttons links, Live-Aktivitäts-Status rechts und darunterliegender Trennlinie.
> 3. Dadurch sind die Filter-Tabs immer fest mit der Tabelle verbunden und können weder optisch abgeschnitten noch separat verloren gehen.

---

## 1 — Meilensteine & Verifikationsplan

| Meilenstein | Beschreibung | Status | Verifikations-Befund |
| :--- | :--- | :---: | :--- |
| **M1** | **Toolbar-Integration**: Filter-Tabs direkt im Tabellen-Container in `LiveActivityFeedV2.tsx` einbetten. | 🟡 In Execution | `src/components/social/LiveActivityFeedV2.tsx` |
| **M2** | **Qualitäts- & Build-Check**: TypeScript, Linting und Unit-Tests. | 🔴 Geplant | Automated Suite |

---

## 2 — Verifikations-Checkliste

- [ ] Filter-Tabs (`All Bets`, `High Rollers`, `My Bets`) sind immer fest in der Karten-Headerleiste integriert.
- [ ] Sauberes Umschalten zwischen allen drei Tabs mit sofortigem Live-Update.
- [ ] 0 TypeScript- und Lint-Fehler.
