# 15.2 — Typografie & Zahlen-Stabilität (Tabular Numbers & Zeilenfall)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** `src/components/casino/hud/GameCoPilotHud.tsx`, `src/components/social/casino-guide/GuideHeader.tsx`, `src/components/social/casino-guide/GuideMarkdown.tsx`, `src/components/social/casino-guide/GuideMessageList.tsx`, `xx_sop/16_motion_and_ui_polish.md`.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Qualitätsmaßstab:** SOP 03 / SOP 12 / SOP 16.

---

## 1 — Übersicht (Workflow Jan)

| Nummer | Meilenstein                                                            |   Status    | Nächster Schritt                                                                      | Zuständigkeit |
| :----: | :--------------------------------------------------------------------- | :---------: | :------------------------------------------------------------------------------------ | :-----------: |
| **M1** | **Mandatorische `tabular-nums` im In-Game HUD (Pill & Card)**          | 🟢 Executed | Erledigt: `fontVariantNumeric: 'tabular-nums'` auf Quoten, Chancen & Metriken gesetzt |      LLM      |
| **M2** | **Typografischer Zeilenfall (`text-wrap: balance / pretty`) im Guide** | 🟢 Executed | Erledigt: `textWrap: 'balance'` auf Headings & `textWrap: 'pretty'` auf Chat-Absätzen |      LLM      |
| **M3** | **Harmonisierung der Micro-Badges & Monospace-Labels**                 | 🟢 Executed | Erledigt: `letterSpacing: '-0.02em'` und einheitliche Monospace-Formatierung          |      LLM      |
| **M4** | **Verifikation & Testsuite-Abschluss**                                 | 🟢 Executed | Erledigt: `tsc` 0 Fehler, Vitest 51/51 Tests grün                                     |      LLM      |

---

## 2 — Bottlenecks & Action Items

### Gefundene Bottlenecks:

1. **Ziffernbreiten-Jitter (Layout Shift):** In `GameCoPilotHud.tsx` ist zwar `fontFamily: 'var(--font-mono), monospace'` gesetzt, aber `font-variant-numeric: tabular-nums` fehlt. Bei Ziffernwechseln (z. B. $49{,}2\,\% \leftrightarrow 51{,}8\,\%$) ändert sich die Breite der Glyphen `1` und `9`, was zu sichtbarem Flackern führt (Verletzung von SOP 16 §3).
2. **Fehlende Waisenkinder-Prävention:** In `GuideHeader.tsx:91` bricht der lange Untertitel (_"Casino AI Assistant & Knowledge Hub • The Math Strategist"_) unkontrolliert um, da kein `text-wrap: balance` definiert ist.
3. **Unruhiger Zeilenfall im Markdown:** In `GuideMarkdown.tsx` fehlen `text-wrap: pretty` auf Absätzen und `text-wrap: balance` auf Überschriften.
4. **Metriken-Zahlen ohne Tabular-Garantie:** Die Quoten-Metriken im HUD (`EV`, `House Edge`, `Win Rate`) springen bei Live-Kartenverteilung.

### Konkrete Action Items (Ausschließlich Zuständigkeit LLM):

- [x] **A1:** In `GameCoPilotHud.tsx` allen Zahlen-Spans (Pill-WinProbability, Card-WinProbability, Progress-Bar-Prozente, Metric-Values) explizit `fontVariantNumeric: 'tabular-nums'` und `letterSpacing: '-0.02em'` zuweisen. (Erledigt 2026-09-02)
- [x] **A2:** In `GuideHeader.tsx` auf Header-Titeln und Persona-Subtiteln `textWrap: 'balance'` ergänzen. (Erledigt 2026-09-02)
- [x] **A3:** In `GuideMarkdown.tsx` auf `p`-Tags `textWrap: 'pretty'` und auf `h4` `textWrap: 'balance'` verankern. (Erledigt 2026-09-02)
- [x] **A4:** In `GuideMessageList.tsx` Zeitstempel mit `fontFamily: 'var(--font-mono)'` und `fontVariantNumeric: 'tabular-nums'` stabilisieren. (Erledigt 2026-09-02)
- [x] **A5:** `npm run typecheck` und Vitest 51/51 Tests erfolgreich ausgeführt. (Erledigt 2026-09-02)
