# E2E 06 — Route `/games/slots` (Slot Machine) — Plan & Execution

> **Status:** 🟢 Executed (2026-08-20) · **Route:** `/games/slots` · **Spec:** `tests/slots-e2e.spec.ts` & `tests/console-and-buttons.spec.ts`  
> **Scope:** E2E Browser-Test & Button-/Konsolen-Vollprüfung für Slot Machine.

---

## 1 — Übersicht & Meilensteine

| Meilenstein | Beschreibung | Status | Verifikations-Befund |
| :--- | :--- | :---: | :--- |
| **M1** | Slot Cabinet Above the Fold | 🟢 Executed | 3 Walzen, Symbole und Steuerpanel oben im Viewport sichtbar. |
| **M2** | Spin Execution & Winning Lines | 🟢 Executed | 3 aufeinanderfolgende Spins ohne Fehler im Test nachgewiesen. |
| **M3** | Auto-Bet Drawer & Settings | 🟢 Executed | Rechtes Steuerpanel voll bedienbar. |
| **M4** | **Button- & Konsolen-Vollprüfung** | 🟢 Executed | Spin-Button, Presets (1/2, 2x), Auto-Spin Drawer und Paytable-Trigger geprüft; 0 Console Errors. |

---

## 2 — Verifikations-Nachweis

* **Test-Datei:** `tests/console-and-buttons.spec.ts` (Test `Route 06: /games/slots`)
* **Ergebnis:** 0 Console Errors, 0 Uncaught Exceptions, alle Buttons reaktiv.
