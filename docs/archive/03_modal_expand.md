# 03 — Modal-Vergrößerung: 2-Spalten Center-Modal (840px × 680px)

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 / Royale Guide (`CasinoGuidePanel.tsx`)**  
> Bezug: [`Z_LLM/10_llm_erweiterung.md`](file:///v:/VibeCoding/Casino/Z_LLM/10_llm_erweiterung.md) (Thema 3)  
> Scope: Umschaltbares 2-Spalten Center-Modal (`Maximize2`/`Minimize2`) mit linker Themen-Sidebar (240px: 10 Kategorien) und rechtem breitem Chat-Verlauf (620px) inklusive Backdrop-Overlay.

---

## 1 — Übersicht für Jan

| Schritt | Meilenstein                                                    | Status      | Verifikation                                                                                        | Zuständigkeit |
| :------ | :------------------------------------------------------------- | :---------- | :-------------------------------------------------------------------------------------------------- | :------------ |
| **1**   | **Planung & Spezifikation**                                    | 🟢 Executed | Spezifikation in `03_modal_expand.md` dokumentiert                                                  | LLM           |
| **2**   | **Expand-Toggle & 2-Spalten-Layout in `CasinoGuidePanel.tsx`** | 🟢 Executed | `isExpanded` State, Backdrop-Overlay, 3-Kategorien-Sidebar & Maximize/Minimize Toggle implementiert | LLM           |
| **3**   | **Verifikation & Testlauf**                                    | 🟢 Executed | 84/84 Vitest-Dateien, TypeScript & Next.js Production Build (36/36) grün                            | LLM           |
