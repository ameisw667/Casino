# 07 — State & Zustand Store-Kontext

> **Zweck:** Modulkarte und Architekturvertrag für den globalen Client-State (`src/store/useCasinoStore.ts`). 

---

## 1 — Systemgrenze & Eigentümerschaft

* `src/store/useCasinoStore.ts` verwaltet den reaktiven UI-, Einstellungs-, Toast- und temporären Ansichtszustand im Browser.
* **Keine finanzielle Autorität:** Der Store berechnet weder Guthaben noch Gewinne oder Rakeback eigenmächtig. Startbalance ist strikt `0`.
* Alle Finanz-, VIP- und Progressionstransaktionen werden ausschließlich durch den Server autorisiert und über typisierte Snapshots synchronisiert.

---

## 2 — Persistenz-Grenzen (`partialize` & Storage-Filter)

* **Middleware:** Zustand 5 `persist` unter dem Storage-Schlüssel `casino-storage` (Version 3, `skipHydration: true`).
* **Erlaubte Persistenz (nur Client-Präferenzen):**
  * Audioeinstellungen (`soundVolume`, `soundEnabled`)
  * UI-Einstellungen (`hideBalance`, `anonymousBetting`, `language`, `oddsFormat`)
  * Auto-Bet-Konfigurationen (`autoBetSettings`)
  * Lokale Spielstatistiken (`gameStats`, `analytics`)
* **Strikte Persistenz-Denylist (niemals in LocalStorage / Dev-State):**
  * `balance`, `xp`, `level`, `rank` (Finanz- & Progressionszustand)
  * `bets`, `allBets` (Transaktions- und Ledgerhistorie)
  * `gameConfig`, `vipTiers`, `ranks`, `achievementConfigs` (Server-Konfigurationen)
  * `sessionId`, `toasts`, `isProcessing`, `isMobile`, `_hasHydrated` (Flüchtiger Laufzeitzustand)

---

## 3 — Server-Autorität & Snapshot-Schnittstelle

* **`applyServerWalletSnapshot(snapshot)`**:
  * Die **einzige** autorisierte Mutation für `balance`, `xp`, `level` und `rank` im Client.
  * Validiert jeden eingehenden Payload zur Laufzeit strikt mit `walletSnapshotSchema` aus `@/lib/casino/wallet-contract`.
  * Wirft bei Schema-Inkonsistenz einen Fehler und blockiert ungültige Daten (Fail-Closed).
* **Historie & Progression (`processGameResult`)**:
  * Schreibt nur vom Server bestätigte Spielausgänge in die lokale Ansichtshistorie, Statistik und den Achievement-Fortschritt.
  * Mutiert keine Balancewerte.

---

## 4 — Initialisierung & Fail-Closed-Lifecycle

* **`initialize()`**:
  * Lädt beim App-Start parallel Konfigurationen (`/api/user/balance`, `/api/casino/seeds`, `/api/community`, `/api/chat`).
  * Setzt bei Netzwerk- oder DB-Fehlern den Store in einen sicheren Fail-Closed-Zustand (keine synthetischen Guthaben).
* **Promo-Codes (`redeemCode`)**:
  * Sendet UUIDv4-`Idempotency-Key` an `/api/casino/redeem-code`.
  * Aktualisiert das Wallet ausschließlich über den vom Server gelieferten Snapshot (`data.snapshot`).

---

## 5 — Tests & Verifikation

* **Unit- & Invariantentests:** `src/store/__tests__/useCasinoStore.test.ts` und `src/store/__tests__/store-edge-cases.test.ts`.
* **Prüfungsbefehle:**
  * `npm test src/store` (Validierung aller Store-Aktionen, Snapshot-Parser und Edge Cases)
  * `npm run typecheck` (Typsicherheit gegen `CasinoState`)
