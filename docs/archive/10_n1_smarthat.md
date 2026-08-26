# 10.N1 — In-Game Live Co-Pilot & Smart-HUD

> **Status:** Executed (archiviert) · **Stand:** 2026-08-26 · **Owner:** LLM (Umsetzung) / Jan (Abnahme) · **Scope:** Smart-HUD direkt in die Controller & Sidebars aller Spielseiten (`/games/blackjack`, `/games/crash`, `/games/roulette`, `/games/dice`, `/games/slots`) integriert.

---

## 1 — Übersicht für Jan

| Schritt | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| :--- | :--- | :---: | :--- | :---: |
| **N1.1** | **Deterministische Math Engine (`copilot-math.ts`)** | 🟢 Executed | Mathematische Berechnungen für Basic Strategy, Crash Odds, Roulette EV & Dice verifiziert | **LLM** |
| **N1.2** | **Co-Pilot State-Hook (`useGameCoPilot.ts`)** | 🟢 Executed | Reaktive Bindung an `useCasinoStore` und aktive Spielzustände verifiziert | **LLM** |
| **N1.3** | **Obsidian-Gold Smart-HUD (`GameCoPilotHud.tsx`)** | 🟢 Executed | Schwebendes Glassmorphism-HUD mit Odds-Meter, Minimierung & Quick-Explain verifiziert | **LLM** |
| **N1.4** | **Game-Pages Integration** | 🟢 Executed | Nahtloses Mounting auf Blackjack, Crash, Roulette, Dice & Slots verifiziert | **LLM** |
| **N1.5** | **Automatisierte Tests (`copilot-math.test.ts`)** | 🟢 Executed | 147/147 Testdateien (1153/1153 Tests) grün, 0 Type-Errors, Build erfolgreich | **LLM** |
| **N1.6** | **Finale visuelle & funktionale Abnahme** | 🟢 Abgeschlossen | Erfolgreich durch Jan visuell und funktional abgenommen | **Jan** |

---

## 2 — Detaillierte Meilenstein-Spezifikation

### Meilenstein N1.1: Deterministische Math Engine (`copilot-math.ts`)
- **Ziel:** Mathematisch 100% fehlerfreie, latenzfreie (0 ms) Quoten- und Strategieberechnungen ohne externe API-Aufrufe.
- **Scope:**
  - **Blackjack:** Vollständige *Basic Strategy Matrix* für 4–8 Decks (Dealer steht auf Soft 17): Hard Totals, Soft Totals, Pairs (Split/Double/Hit/Stand) mit prozentualer Gewinnwahrscheinlichkeit.
  - **Crash:** Multiplikator-Wahrscheinlichkeitskorridor ($P(\text{Crash} \ge x) = 0.99 / x$), Erwartungswert-Rechner und empfohlene Cashout-Zonen (Konservativ 1.2x–1.5x, Balanced 2.0x–3.5x, High-Risk > 5.0x).
  - **Roulette:** Erwartungswert- und Quotenberechnung für getätigte Wetten (z. B. Rot/Schwarz 48.65% vs. Straight-Up 2.70%, Hausvorteil 2.70%).
  - **Dice:** Mathematische Win-Chance ($100 - \text{Target}$) und Multiplikator-Faktor ($99 / \text{Target}$).
- **Nicht-Scope:** Keine LLM-Server-Anfragen für Mathematik; alles läuft deterministisch im TypeScript-Code.
- **Verifikation:** Vitest Unit-Tests mit exakten Tabellenabgleichen.

---

### Meilenstein N1.2: Co-Pilot State-Hook (`useGameCoPilot.ts`)
- **Ziel:** Ein reaktiver React-Hook, der kontinuierlich den aktuellen Spielzustand ausliest und passende Co-Pilot-Empfehlungen formuliert.
- **Scope:**
  - Erkennt das aktive Spiel (`gameType`), die Spielerhand/Einsätze, den aktuellen Multiplikator und den Spielstatus (`betting`, `dealing`, `player_turn`, `crashed`, `settled`).
  - Liefert ein typisiertes `CoPilotRecommendation`-Objekt:
    - `action`: Primäre Empfehlung (z. B. *"STAND"*, *"HIT"*, *"CASHOUT JETZT"*, *"SPLIT"*).
    - `winProbability`: Berechnete prozentuale Gewinnchance (z. B. `58.2%`).
    - `reasoning`: Kurze, prägnante 1-Satz-Begründung (z. B. *"Dealer zeigt eine 6 (hohe Überkauf-Wahrscheinlichkeit von 42%). Stand ist mathematisch optimal."*).
    - `riskLevel`: `'low'` (Grün), `'medium'` (Gold), `'high'` (Rot).
    - `suggestedPrompt`: Vorbelegter Text für das Royale Guide Chat-Modal bei Klick auf *"Warum?"*.
- **Verifikation:** State-Transitions-Tests im Vitest-Umfeld.

---

### Meilenstein N1.3: Obsidian-Gold Smart-HUD Komponente (`GameCoPilotHud.tsx`)
- **Ziel:** Ein optisch herausragendes HUD im Obsidian & Gold Design System (`xx_sop/04_design_system_ui.md`).
- **Scope:**
  - **Design & Layout:** Glassmorphism (`backdrop-filter: blur(12px)`), Obsidian-Hintergrund (`rgba(11, 14, 20, 0.88)`), Gold-Border (`#D4AF37/30`).
  - **Zustände:**
    1. *Kompakt / Pill-Modus:* Schwebendes Badge mit Live-Quote und Puls-Indikator.
    2. *Erweiterter HUD-Modus:* Aufklappbare Detailkarte mit Quotenbalken, Handlungsempfehlung und 1-Click Button *"Im Guide vertiefen"*.
    3. *Eingebettet:* Sitzt nahtlos in den Controller- und Regel-Boxen der Spiele.
- **Verifikation:** Visuelle Prüfung und barrierefreie Tastaturbedienung.

---

### Meilenstein N1.4: Game-Pages Integration
- **Ziel:** Nahtloses Einbetten in alle Controller- und Sidebar-Komponenten der Casino-Spiele.
- **Scope:**
  - `src/components/casino/games/blackjack/BlackjackRightRules.tsx`
  - `src/components/casino/games/crash/CrashControlSidebar.tsx`
  - `src/components/casino/games/roulette/RouletteControlSidebar.tsx`
  - `src/components/casino/games/dice/DiceControlSidebar.tsx`
  - `src/components/casino/games/slots/SlotsPaytable.tsx`
- **Verifikation:** Rendering auf allen 5 Spielseiten ohne Layout-Shift oder Überlagerung von Spiel-Buttons.

---

### Meilenstein N1.5: Automatisierte Test-Suite
- **Ziel:** 100% Testabdeckung aller mathematischen Zweige und Edge-Cases.
- **Scope:** `src/lib/casino/__tests__/copilot-math.test.ts` mit Tests für alle Spiele.
- **Verifikation:** `npm run test` (Vitest).

---

### Meilenstein N1.6: Finale Abnahme durch Jan
- **Status:** 🟢 **Vollständig abgenommen und bestätigt.**
