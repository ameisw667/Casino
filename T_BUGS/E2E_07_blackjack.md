# E2E 07 — Route `/games/blackjack` (Blackjack) — Plan & Execution

> **Status:** 🟢 Executed (2026-08-20) · **Route:** `/games/blackjack` · **Spec:** `tests/e2e-blackjack.spec.ts` & `tests/console-and-buttons.spec.ts`  
> **Scope:** E2E Browser-Test & Button-/Konsolen-Vollprüfung für Blackjack Table.

---

## 1 — Übersicht & Meilensteine

| Meilenstein | Beschreibung                       |   Status    | Verifikations-Befund                                                             |
| :---------- | :--------------------------------- | :---------: | :------------------------------------------------------------------------------- |
| **M1**      | Table Rendering & Card Hands       | 🟢 Executed | Dealer Hand, Player Hand und Chips-Auswahl sichtbar.                             |
| **M2**      | Game Action Controls               | 🟢 Executed | Deal-, Hit-, Stand- und Double-Buttons im DOM verifiziert.                       |
| **M3**      | State & Payout Synchronization     | 🟢 Executed | Versionierte Runden über `/api/casino/blackjack` angebunden.                     |
| **M4**      | **Button- & Konsolen-Vollprüfung** | 🟢 Executed | Chip-Platzierung ($1–$500), Deal-Aktion, Clear-Button geprüft; 0 Console Errors. |

---

## 2 — Verifikations-Nachweis

- **Test-Datei:** `tests/console-and-buttons.spec.ts` (Test `Route 07: /games/blackjack`)
- **Ergebnis:** 0 Console Errors, 0 Uncaught Exceptions, alle Buttons reaktiv.
