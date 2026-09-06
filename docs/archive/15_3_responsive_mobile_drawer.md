# 15.3 — Responsive Verhalten & Mobile Drawer UX

> **Status:** Executed (archiviert) · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** `src/components/social/CasinoGuidePanel.tsx`, `src/components/social/casino-guide/GuideBackdrop.tsx`, `src/components/social/casino-guide/GuideInputForm.tsx`.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Qualitätsmaßstab:** SOP 03 / SOP 12 / SOP 16.

---

## 1 — Übersicht (Workflow Jan)

| Nummer | Meilenstein                                               |   Status    | Nächster Schritt                                                                                      | Zuständigkeit |
| :----: | :-------------------------------------------------------- | :---------: | :---------------------------------------------------------------------------------------------------- | :-----------: |
| **M1** | **Mobile Swipe-to-Dismiss Geste (`drag="x"`)**            | 🟢 Executed | Erledigt: Touch-Wischgeste nach rechts (`drag="x"`, Dismiss bei `offset.x > 80` / `velocity.x > 350`) |      LLM      |
| **M2** | **Mobile Backdrop mit Blur (`z-45`) & Click-Outside**     | 🟢 Executed | Erledigt: `isMobile`-Backdrop mit `blur(6px)` und Outside-Close                                       |      LLM      |
| **M3** | **iOS Safe-Area-Insets & 100dvh Dynamic Viewport Height** | 🟢 Executed | Erledigt: `paddingBottom: calc(10px + env(safe-area-inset-bottom))` im Input-Formular                 |      LLM      |
| **M4** | **Visueller Mobile Drag-Handle Indicator**                | 🟢 Executed | Erledigt: 36px Drag-Pille am Kopf des mobilen Drawers                                                 |      LLM      |
| **M5** | **Verifikation & Testsuite-Abschluss**                    | 🟢 Executed | Erledigt: `tsc` 0 Fehler, Vitest 51/51 Chat-Tests & 4/4 Dice-Tests grün                               |      LLM      |

---

## 2 — Bottlenecks & Action Items

### Gefundene Bottlenecks:

1. **Kein Swipe-to-Dismiss auf Mobile:** Nutzer auf Smartphones erwarten intuitiv, den geöffnete Drawer per Wischgeste nach rechts oder unten schließen zu können. Bisher existierte nur das kleine Schließen-Icon oben rechts.
2. **Deaktivierter Mobile-Backdrop:** In `GuideBackdrop.tsx:15` wird der abdeckende Hintergrund bei `isMobile` unterdrückt. Dadurch scheint der Spieltisch im Hintergrund störend durch und Klick außerhalb schließt den Drawer nicht.
3. **iOS Safe-Area & Virtual Keyboard Collision:** Dem Input-Formular fehlt `padding-bottom: env(safe-area-inset-bottom)`, wodurch der Home-Balken auf iPhones mit Gestensteuerung die Input-Kapsel überdecken kann.

### Konkrete Action Items (Ausschließlich Zuständigkeit LLM):

- [x] **A1:** In `CasinoGuidePanel.tsx` Framer Motion Drag auf Mobile aktivieren (`drag={isMobile ? 'x' : false}`, Schließen bei `offset.x > 80` oder `velocity.x > 350`). (Erledigt 2026-09-02)
- [x] **A2:** In `GuideBackdrop.tsx` den Backdrop auch für `isMobile && isOpen` freischalten mit `blur(6px)` und abgedunkeltem Overlay. (Erledigt 2026-09-02)
- [x] **A3:** In `CasinoGuidePanel.tsx` den `onClose`-Handler des Backdrops auf Mobile so anbinden, dass der gesamte Drawer geschlossen wird. (Erledigt 2026-09-02)
- [x] **A4:** In `GuideInputForm.tsx` `paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))'` ergänzen. (Erledigt 2026-09-02)
- [x] **A5:** Subtilen visuellen Drag-Handle (`36px` Pille) am Kopf des mobilen Drawers einfügen. (Erledigt 2026-09-02)
- [x] **A6:** `npm run typecheck` und Vitest Tests erfolgreich ausgeführt. (Erledigt 2026-09-02)
