# 10 — Games & Frontend-Spielmodule-Kontext

> **Zweck:** Modulkarte für alle Spielseiten (`src/app/games/`) und spielspezifischen Komponenten (`src/components/casino/games/`). Backend & Logik: [Service-Layer-Kontext](05_service_layer_context.md).

---

## 1 — Systemgrenze & Komponenten-Isolation

* Jedes Spiel (`blackjack`, `crash`, `dice`, `roulette`, `slots`) existiert als eigenständige Seitenkomponente unter `src/app/games/[game]/page.tsx`.
* Spielspezifische UI-Komponenten (Reels, Roulette-Rad, Crash-Chart, Kartentisch) liegen gekapselt unter `src/components/casino/games/[game]/`.
* **Keine Client-Berechnung von Gewinnen:** Die Spielseiten steuern ausschließlich Animationen, Klänge und Benutzereingaben. Alle Ergebnisse, Quoten und Auszahlungen stammen vom Server.

---

## 2 — Spiele-Transport & API-Mapping

| Spiel | Route / Transport | API-Endpunkt | Besonderheiten |
| :--- | :--- | :--- | :--- |
| **Dice** | REST (POST) | `/api/casino/bet` | Provably-Fair Roll (0–100), Sofort-Settlement |
| **Slots** | REST (POST) | `/api/casino/bet` | Server-Reel-Indizes, `SlotSymbol.tsx`-Rendering |
| **Roulette** | REST (POST) | `/api/casino/bet` | European Wheel (0–36), Multi-Bet-Array |
| **Blackjack** | REST (POST) | `/api/casino/blackjack` | Versionierte Runden (Deal, Hit, Stand, Double, Split) |
| **Crash** | REST + Realtime | `/api/casino/bet` + Supabase Broadcast | Geteilter Raumtakt (`crash_rounds`), Cashout gegen Server-Runde |

---

## 3 — Wallet-Snapshot & Historien-Vertrag

* Jede erfolgreiche Settlement-Antwort der API liefert zwingend einen vollständigen `WalletSnapshot`.
* Der Client ruft sofort `applyServerWalletSnapshot(snapshot)` auf, bevor Animationen abgeschlossen oder Historienzeilen gerendert werden.
* Big-Win-Effekte (`BigWinOverlay`, Confetti, Audio) werden ab einem Multiplikator $> 20\times$ durch die Spielkomponente getriggert.

---

## 4 — Verifikation & Tests

* Spielkomponenten und Service-Layer werden über Vitest getestet: `npm test src/lib/casino`.
* Typsicherheit: `npm run typecheck`.
