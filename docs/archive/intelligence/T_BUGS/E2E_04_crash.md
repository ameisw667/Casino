# E2E 04 — Route `/games/crash` (Crash) — Plan & Execution

> **Status:** 🟢 Executed (2026-08-20) · **Route:** `/games/crash` · **Spec:** `tests/crash-e2e.spec.ts` & `tests/console-and-buttons.spec.ts`  
> **Scope:** E2E Browser-Test & Button-/Konsolen-Vollprüfung für Crash (Multiplier-Kurve & Cashout).

---

## 1 — Übersicht & Meilensteine

| Meilenstein | Beschreibung                       |   Status    | Verifikations-Befund                                                                      |
| :---------- | :--------------------------------- | :---------: | :---------------------------------------------------------------------------------------- |
| **M1**      | Crash Canvas & Multiplier Curve    | 🟢 Executed | Canvas mit Multiplikator-Animation lädt und steigt.                                       |
| **M2**      | Bet & Cashout Flow                 | 🟢 Executed | Einsatz platzieren, Multiplikator-Anstieg und rechtzeitiger Cashout im Test nachgewiesen. |
| **M3**      | Multi-Round Persistence            | 🟢 Executed | Mehrere Runden hintereinander ohne Seiten-Reload ausführbar.                              |
| **M4**      | **Button- & Konsolen-Vollprüfung** | 🟢 Executed | Bet-Eingabe, Presets, Cashout-Trigger und Multi-Bet-Steuerung geprüft; 0 Console Errors.  |

---

## 2 — Verifikations-Nachweis

- **Test-Datei:** `tests/console-and-buttons.spec.ts` (Test `Route 04: /games/crash`)
- **Ergebnis:** 0 Console Errors, 0 Uncaught Exceptions, alle Buttons reaktiv.
