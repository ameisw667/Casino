# 06 — Crash Game: Optimistic UI Freeze & Instant Cashout Lock

> **Status:** Executed (archiviert) · **Stand:** 2026-08-20 · **Owner:** LLM · **Scope:** Client-Side Instant Cashout Freeze in `src/app/games/crash/page.tsx`, Beseitigung des visuellen Nachlaufs bei Server-Roundtrips.
> **Money-Pfad:** Nein (Server-Autorität bleibt in `src/app/api/casino/bet/route.ts` unverändert).
> **Security-Review:** Nein (nur clientseitige Render-/State-Optimierung).

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                   | Status      | Nächster Schritt                            | Zuständigkeit |
| :----- | :-------------------------------------------- | :---------- | :------------------------------------------ | :------------ |
| L1     | Optimistic UI Freeze & Synchroner Ref-Lock    | 🟢 Executed | In `src/app/games/crash/page.tsx` umgesetzt | LLM           |
| L2     | Verifikation (Build, Lint, Tests, Vibe-Check) | 🟢 Executed | 671/671 Tests, Build & Lint erfolgreich     | LLM           |
| L3     | Git Commit & Push auf `origin/main`           | 🟢 Executed | Committet & auf GitHub gepusht              | LLM           |
| L4     | Doku-Abschluss & Archivierung                 | 🟢 Executed | Nach `docs/archive/` archiviert             | LLM           |

---

## 2 — Planung aus 2 Perspektiven

### Perspektive 1: UX, Responsiveness & Visual Feedback

- **Ziel:** 0 ms wahrgenommene Latenz beim Klick auf den Cashout-Button oder Betätigung der Leertaste.
- **Anforderung:** Beim Klick muss die Multiplikatoranzeige sofort auf dem exakten Klickwert einfrieren, der Button auf `"✓ SECURING..."` wechseln und die Rakete in den Cashout-/Gleit-Zustand übergehen.
- **Fehlerfall:** Sollte der Server den Cashout unerwartet ablehnen (z. B. Netzwerkabbruch oder bereits vor Klick auf Server gecrasht), fängt der `catch`-Block dies ab und meldet `"Cashout could not be confirmed"`, wodurch der Status sauber auf `CRASHED` oder Fehler bereinigt wird.

### Perspektive 2: State, Concurrency & Server-Autorität

- **Ziel:** Verhinderung von Race Conditions zwischen Client-Render-Loop und asynchroner HTTP-Response.
- **Anforderung:** Synchrones Setzen von `cashoutAtRef.current = requestedMultiplier` und `statusRef.current = 'CASHED_OUT'` direkt im Klick-Handler (nicht erst über asynchrones React-State-Rerendering oder nach dem `fetch`-Await).
- **Invariante:** `settle_round` auf dem Server bleibt die alleinige finanzielle Autorität für Wallet-Guthaben und Payout.
- **Aufgabenverteilung:** 100 % LLM (vollständig autonom).

---

## 3 — Technische Umsetzung

- In `src/app/games/crash/page.tsx`:
  - `handleCashout`: Synchroner Lock von `cashoutAtRef.current` und `multiplierRef.current` direkt beim Klick.
  - Sofortiges Einfrieren des Multiplikator-HUDs (`#4ade80`, 1.00x Skalierung) und Button-Text (`✓ SECURED $X @ Y.YYx`).
  - `gameLoop`: Multiplikator-Zuwachs stoppt sofort bei gesetztem `cashoutAtRef.current`, wodurch die optische 300ms-Verzögerung eliminiert wird.
