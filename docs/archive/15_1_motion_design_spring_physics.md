# 15.1 — Motion-Design & Spring-Physik (Royale Guide & In-Game HUD)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** `src/components/casino/hud/GameCoPilotHud.tsx`, `src/components/social/casino-guide/GuideQuickChips.tsx`, `src/lib/design/motion-tokens.ts`, `src/hooks/useSafeMotion.ts`.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Qualitätsmaßstab:** SOP 03 / SOP 12 / SOP 16.

---

## 1 — Übersicht (Workflow Jan)

| Nummer | Meilenstein                                                                       |   Status    | Nächster Schritt                                                                  | Zuständigkeit |
| :----: | :-------------------------------------------------------------------------------- | :---------: | :-------------------------------------------------------------------------------- | :-----------: |
| **M1** | **Beseitigung statischer CSS-Animationen & Umstellung auf Framer Motion Springs** | 🟢 Executed | Erledigt: `copilotSlideDown` durch `AnimatePresence` & `springs.standard` ersetzt |      LLM      |
| **M2** | **Fluid Morphing Transition (`AnimatePresence` & Spring-Physics)**                | 🟢 Executed | Erledigt: Unified State-Renderer mit `AnimatePresence mode="wait"`                |      LLM      |
| **M3** | **Staggered Chip Entrance & Spring-Hover für Quick Chips**                        | 🟢 Executed | Erledigt: `staggerChildren: 0.04` & `springs.snappy` in `GuideQuickChips.tsx`     |      LLM      |
| **M4** | **`useReducedMotion` / A11y Spring-Dämpfung**                                     | 🟢 Executed | Erledigt: `useReducedMotion` in `GameCoPilotHud` und `GuideQuickChips`            |      LLM      |
| **M5** | **Verifikation & Testsuite-Abschluss**                                            | 🟢 Executed | Erledigt: `tsc` 0 Fehler, 51/51 Vitest Tests grün                                 |      LLM      |

---

## 2 — Bottlenecks & Action Items

### Gefundene Bottlenecks:

1. **Statische Keyframe-Animation:** In `GameCoPilotHud.tsx:253` existierte `animation: 'copilotSlideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)'`. Dies widersprach SOP 04 §4 und SOP 16 §4 (Framer Motion Standard-Springs).
2. **Abrupter DOM-Replace statt morphing:** Beim Umschalten von `isExpanded` (Pill $\leftrightarrow$ Card) unmounted React die Pill schlagartig und mountet die Card ohne `AnimatePresence`.
3. **Fehlendes Reduced-Motion-Handling:** Nutzer mit Schwindel/Vestibular-Störungen (`prefers-reduced-motion: reduce`) erhielten ungebremste Animationen.
4. **Fehlende Gestaffelung bei Chips:** `GuideQuickChips.tsx` renderte alle 10 Themen gleichzeitig ohne Stagger-Kaskade.

### Konkrete Action Items (Ausschließlich Zuständigkeit LLM):

- [x] **A1:** In `GameCoPilotHud.tsx` alle drei Ansichten (Hidden Button, Minimized Pill, Expanded Card) in ein einheitliches `<AnimatePresence mode="wait">` mit `<motion.div>` und `springs.standard` einbetten. (Erledigt 2026-09-02)
- [x] **A2:** Hover- und Tap-Interaktionen auf allen HUD-Schaltern mit `whileHover={{ scale: 1.03 }}` und `whileTap={{ scale: 0.96 }}` via `springs.snappy` ausrüsten. (Erledigt 2026-09-02)
- [x] **A3:** `useReducedMotion` einbinden: Wenn aktiv, Translation auf $0$ setzen und nur reine $0{,}15\text{s}$ Opacity-Blenden verwenden. (Erledigt 2026-09-02)
- [x] **A4:** In `GuideQuickChips.tsx` ein Container-Motion-Element mit gestaffeltem Entrance (`staggerChildren: 0.04`) einbauen. (Erledigt 2026-09-02)
- [x] **A5:** `npm run typecheck` und 51/51 Vitest Tests erfolgreich ausgeführt. (Erledigt 2026-09-02)
