# 13_09 — Accessibility & Touch: Sub-Subkategorien

> Ebene 2 von [`00_UEBERSICHT.md`](./00_UEBERSICHT.md#1--die-10-subkategorien-gewichtung--bewertung) · Modul 09 (Gewicht 5, Niveau Top 16 %) · Stand 2026-09-13 · Nur Tabelle, keine Planungsdatei in dieser Runde.

|  #  | Sub-Subkategorie | Gewichtung | Niveau | Kurzbefund |
| :-: | :--- | :---: | :---: | :--- |
| 1 | Keyboard-Shortcut-Engine (`isEditableTarget`, `matchesCombo`) | **20** | Top 8 % | Blockiert globale Hotkeys korrekt bei Fokus in Eingabefeldern, Testdatei vorhanden |
| 2 | Focus-Management / Escape (`useModalKeyboard.ts`) | **15** | Top 10 % | Sauberer `addEventListener`/`removeEventListener`-Cleanup verifiziert |
| 3 | ARIA-Attribute auf Formularelementen | **20** | Top 30 % | Heute frisch gefunden: `jsx-a11y/role-supports-aria-props` in `BetInputGroup.tsx:132` — `aria-valuemin`/`aria-valuemax` auf `<input>` mit implizitem `textbox`-Rollen nicht unterstützt; konkreter, sofort behebbarer Fund statt nur Theorie |
| 4 | Touch-Targets (44×44px Mindestgröße) | **15** | Top 12 % | Für primäre Action-Buttons dokumentiert und stichprobenartig im Code bestätigt |
| 5 | Farbkontrast (WCAG 2.1 AA) | **15** | Top 5 % | Gold-Ton `#e5c158` mit 6,2:1 Kontrastverhältnis übertrifft die 4,5:1-Schwelle deutlich |
| 6 | Screenreader-Live-Regions (dynamische Ticker) | **15** | Top 45 % | Vom Dokument selbst benannt: Roulette-Ticker nur visuell über Toast-Events gekoppelt, noch ohne natives `aria-live="polite"` |
