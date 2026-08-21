# E2E 03 — Route `/games/dice` (Dice) — Plan & Execution

> **Status:** 🟢 Executed (2026-08-20) · **Route:** `/games/dice` · **Spec:** `tests/e2e-dice.spec.ts` & `tests/console-and-buttons.spec.ts`  
> **Scope:** E2E Browser-Test & Button-/Konsolen-Vollprüfung für Würfelspiel (Dice).

---

## 1 — Übersicht & Meilensteine

| Meilenstein | Beschreibung | Status | Verifikations-Befund |
| :--- | :--- | :---: | :--- |
| **M1** | Dice Slider & Bet Input | 🟢 Executed | Multiplier-Slider, Over/Under-Toggle und Einsatzfeld im DOM gerendert. |
| **M2** | Provably Fair Modal & Seed-Anzeige | 🟢 Executed | Provably Fair Trigger und Seed-Hash vorhanden. |
| **M3** | Roll Action Trigger | 🟢 Executed | Würfel-Button klickbar und an API `/api/casino/bet` angebunden. |
| **M4** | **Button- & Konsolen-Vollprüfung** | 🟢 Executed | Bet-Presets (Min, 1/2, 2x, Max), Slider-Drag und Roll-Button geprüft; 0 Console Errors. |

---

## 2 — Verifikations-Nachweis

* **Test-Datei:** `tests/console-and-buttons.spec.ts` (Test `Route 03: /games/dice`)
* **Ergebnis:** 0 Console Errors, 0 Uncaught Exceptions, alle Buttons reaktiv.
