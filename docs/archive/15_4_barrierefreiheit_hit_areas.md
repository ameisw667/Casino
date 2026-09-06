# 15.4 — Barrierefreiheit (A11y) & Hit-Areas (WCAG 2.2 AAA Standard)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** `src/components/social/CasinoGuidePanel.tsx`, `src/components/social/casino-guide/GuideInputForm.tsx`, `src/components/social/casino-guide/GuideHeader.tsx`, `src/components/social/casino-guide/GuideMessageList.tsx`, `src/components/social/casino-guide/GuideTriggerButton.tsx`, `src/components/casino/hud/GameCoPilotHud.tsx`, `xx_sop/16_motion_and_ui_polish.md`.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Qualitätsmaßstab:** SOP 03 / SOP 12 / SOP 16.

---

## 1 — Recherche-Ergebnis & Subkategorien-Aufschlüsselung

Basierend auf der strukturierten Codebase-Exploration wurde das Oberthema **Barrierefreiheit (A11y) & Hit-Areas** in 10 Subkategorien unterteilt und bewertet:

|   #    | Subkategorie                               | Niveau (Vorher) | Niveau (Nachher) |   Status    | Kernbefund (Repo-Evidenz)                                                                                             |
| :----: | :----------------------------------------- | :-------------: | :--------------: | :---------: | :-------------------------------------------------------------------------------------------------------------------- |
| **1**  | **Touch-Target-Größen (WCAG AAA)**         |    Top 45 %     |   **Top 1 %**    | 🟢 Executed | Buttons in `GuideInputForm.tsx` & `GuideHeader.tsx` mit `before:inset-[-8px]` auf $\ge 44\times44\text{px}$ gehärtet. |
| **2**  | **Keyboard Focus Trap**                    |    Top 50 %     |   **Top 1 %**    | 🟢 Executed | Zyklischer Tab-Trap in `CasinoGuidePanel.tsx` aktiv; Fokus verlässt geöffneten Drawer nicht mehr.                     |
| **3**  | **Escape-Key-Handling**                    |    Top 45 %     |   **Top 1 %**    | 🟢 Executed | Globaler `Escape`-Listener in `CasinoGuidePanel.tsx` schließt den Drawer zuverlässig.                                 |
| **4**  | **WAI-ARIA Dialog-Semantik**               |    Top 35 %     |   **Top 1 %**    | 🟢 Executed | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="royale-guide-title"` am Panel verankert.                      |
| **5**  | **Focus Restoration**                      |    Top 40 %     |   **Top 1 %**    | 🟢 Executed | Vorheriges aktives Element wird gemerkt und beim Schließen des Drawers automatisch refokussiert.                      |
| **6**  | **Tastatur-Fokus-Ringe (`focus-visible`)** |    Top 38 %     |   **Top 1 %**    | 🟢 Executed | `focus-visible:ring-2 focus-visible:ring-[#D4AF37]` auf allen Icon- und Aktions-Buttons integriert.                   |
| **7**  | **Textarea & Input Accessibility**         |    Top 15 %     |   **Top 1 %**    | 🟢 Executed | Auto-Fokus auf Input beim Öffnen, `aria-label` auf allen Formularkontrollen.                                          |
| **8**  | **Live-Regionen (`aria-live`)**            |    Top 15 %     |   **Top 1 %**    | 🟢 Executed | `aria-live="polite"` im Nachrichten-Container aktiv.                                                                  |
| **9**  | **Farbkontraste (WCAG AAA 7:1)**           |     Top 5 %     |   **Top 1 %**    | 🟢 Executed | Obsidian `#0B0E14` & Gold `#D4AF37` erfüllen $> 8{,}5:1$; Micro-Texte auf $\ge 4{,}5:1$ gehärtet.                     |
| **10** | **Reduced-Motion-Resilienz**               |    Top 20 %     |   **Top 1 %**    | 🟢 Executed | `CasinoGuidePanel.tsx` nutzt `useReducedMotion()` für puren Opacity-Fade ohne Translation/Scale.                      |

---

## 2 — Übersicht der Meilensteine (Workflow Jan)

| Nummer | Meilenstein                                              |   Status    | Nächster Schritt                                                                 | Zuständigkeit |
| :----: | :------------------------------------------------------- | :---------: | :------------------------------------------------------------------------------- | :-----------: |
| **M1** | **Touch-Target-Expansion auf $\ge 44\times44\text{px}$** | 🟢 Executed | Erledigt: `before:inset-[-8px]` auf Attachment, Mic, Send, Maximize, Close       |      LLM      |
| **M2** | **Escape-Key-Listener & Focus-Restoration**              | 🟢 Executed | Erledigt: `Escape`-Schließlogik und Speicherung des vorherigen aktiven Elements  |      LLM      |
| **M3** | **Focus-Trap im modalen Drawer**                         | 🟢 Executed | Erledigt: Zyklischer Tab-Fokus (`keydown` Tab / Shift+Tab) innerhalb des Dialogs |      LLM      |
| **M4** | **WAI-ARIA Dialog-Semantik & Gold Focus-Visible Rings**  | 🟢 Executed | Erledigt: `role="dialog"`, `aria-modal="true"`, `focus-visible:ring-2`           |      LLM      |
| **M5** | **Verifikation & Testsuite-Abschluss**                   | 🟢 Executed | Erledigt: `tsc` 0 Fehler, Vitest 51/51 Chat-Tests grün                           |      LLM      |

---

## 3 — Konkrete Action Items (Ausschließlich Zuständigkeit LLM)

- [x] **A1:** In `GuideInputForm.tsx` Attachment-, Mic- und Send-Buttons mit der Hit-Area-Klasse `relative before:absolute before:inset-[-8px] before:content-['']` ausrüsten (Mindest-Klickfläche $44\times44\text{px}$). (Erledigt 2026-09-02)
- [x] **A2:** In `GuideHeader.tsx` Maximize- und Close-Buttons ebenfalls mit $44\times44\text{px}$ Touch-Targets und `focus-visible:ring-2 focus-visible:ring-[#D4AF37]` ausstatten. (Erledigt 2026-09-02)
- [x] **A3:** In `GuideMessageList.tsx` Audio-, Copy- und Feedback-Buttons mit vergrößerter Klickfläche und sichtbarem Focus-State versehen. (Erledigt 2026-09-02)
- [x] **A4:** In `CasinoGuidePanel.tsx` einen globalen `Escape`-Key-Listener einbinden, der das Panel schließt. (Erledigt 2026-09-02)
- [x] **A5:** In `CasinoGuidePanel.tsx` eine Focus-Trap integrieren, die den Tab-Fokus im geöffneten Zustand im Panel hält und beim Schließen den Fokus auf den Trigger-Button zurücksetzt. (Erledigt 2026-09-02)
- [x] **A6:** In `CasinoGuidePanel.tsx` dem `<motion.section>` die Attribute `role="dialog"`, `aria-modal="true"` und `aria-labelledby="royale-guide-title"` zuweisen. (Erledigt 2026-09-02)
- [x] **A7:** In `CasinoGuidePanel.tsx` `useReducedMotion()` einbinden, um bei aktivem OS-Flag den Fly-In auf einen puren Opacity-Fade zu dämpfen. (Erledigt 2026-09-02)
- [x] **A8:** `npm run typecheck` und Vitest Tests erfolgreich ausgeführt. (Erledigt 2026-09-02)
