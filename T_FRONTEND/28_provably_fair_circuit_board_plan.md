# 28 — Provably Fair: Circuit Board & Cryptographic Verification Visualizer (Obsidian & Gold)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Umgestaltung des mathematischen Verifikations-Tools in `src/components/casino/ProvablyFairTool.tsx` durch `circuit-board` (animierte Leiterplatten-Traces & magnetische Hash-Vektoren), um den kryptografischen Seed-Weg visuell begreifbar und haptisch überzeugend zu machen.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 50 %)

| # | Subkategorie | Niveau | Befund & Beleg (Datei / Test) | Bottleneck? | Action Item |
|---|---|---|---|:---:|---|
| 01 | Vertrauensbildung | Top 80 % | Reine Text-Inputs und Hexadezimal-Strings (`ProvablyFairTool.tsx:48`), wirkt wie ein Entwickler-Debugger statt faires Casino. | 🔴 JA | `circuit-board`: Leuchtende Leiterbahnen verbinden Server-Seed, Client-Seed, Nonce und Ergebnis. |
| 02 | Haptik & Interaktion | Top 75 % | Starre Textausgabe ohne Beglaubigungs-Animation beim Ändern von Nonce oder Seed. | 🔴 JA | Impuls-Lauflicht entlang der SVG-Leiterbahnen bei Neuberechnung. |
| 03 | Mathematische Logik | Top 10 % | `ProvablyFairEngine.calculateOutcome` ist atomar, deterministisch und voll getestet. | Nein | Engine-Berechnung absolut unangetastet lassen. |
| 04 | Clipboard & Copy | Top 15 % | Copy-To-Clipboard mit Feedback-Toast funktioniert einwandfrei. | Nein | Clipboard-Funktion beibehalten. |
| 05 | Responsivität | Top 30 % | Formular bricht auf Mobile sauber um. | Nein | SVG-Leiterbahnen mit dynamischem `viewBox`-Scaling responsive halten. |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|:---:|---|
| **L0** | Baseline & Snapshot | `src/components/casino/ProvablyFairTool.tsx` | 🔴 Geplant | LLM | Lint & Typecheck fehlerfrei |
| **L1** | Circuit Board Visualizer | `src/components/casino/provably-fair/CircuitBoardVisualizer.tsx` | 🔴 Geplant | LLM | SVG Trace Pathing mit elektrischem Gold-Impuls isoliert getestet |
| **L2** | Integration in `ProvablyFairTool.tsx` | `src/components/casino/ProvablyFairTool.tsx` | 🔴 Geplant | LLM | Visuelle Verbindung von Seeds → Hash → Würfel/Crash-Multiplikator |
| **L3** | Responsive & Touch-Optimierung | `ProvablyFairTool.tsx` | 🔴 Geplant | LLM | Saubere Skalierung auf mobilen Bildschirmen |
| **L4** | Verifikation & 5-Stufen-DoD | Lokale Test-Suite | 🔴 Geplant | LLM | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade
- Ziel-Datei: [`src/components/casino/ProvablyFairTool.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/ProvablyFairTool.tsx)
- Engine: [`src/lib/casino/provably-fair.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/provably-fair.ts)
- Neue Komponente: `src/components/casino/provably-fair/CircuitBoardVisualizer.tsx`
- Screenshots: [`docs/frontend/screenshots/06_weakness_provably_fair.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/06_weakness_provably_fair.png)
- Componentry-Referenz: [Circuit Board (`circuit-board`)](https://componentry.dev/docs/components/circuit-board) & [Magnet Lines (`magnet-lines`)](https://componentry.dev/docs/components/magnet-lines)

### 3.2 Systemregeln & Invarianten
- **Kryptografische Invariante:** Die visuelle Darstellung darf NIEMALS das Rechenergebnis manipulieren oder verzögern; sie visualisiert das deterministische Resultat von `ProvablyFairEngine`.
- **Design-System:** Obsidian-Board (`#0B0E14`), Gold-Leiterbahnen (`#D4AF37` mit `rgba(212,175,55,0.4)` Glow).

### 3.3 Nicht-Scope (Ausdrücklich verboten)
- Keine Änderungen an HMAC-SHA256 oder Roll-Algorithmen in `provably-fair.ts`.
- Keine neuen API-Routen.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: `CircuitBoardVisualizer.tsx`
- **Ziel:** Erstellung der SVG-Trace-Komponente.
- **Schritte:**
  1. Aufbau eines modularen SVG-Netzwerks mit Leiterbahnen zwischen 3 Eingängen (Server Seed, Client Seed, Nonce) und einem Hash-Knoten.
  2. Animiertes Dash-Offset-Lauflicht (`strokeDashoffset`) bei State-Updates.
- **Abbruchkriterium:** Hohe CPU-Last durch unkontrolliertes SVG-Repainting.

### Meilenstein L2: Integration in `ProvablyFairTool.tsx`
- **Ziel:** Verschmelzung von Formular und Leiterplatten-Visualisierung.
- **Schritte:**
  1. Platzierung der interaktiven Inputs in den Knotenpunkten der Leiterplatte.
  2. Finale Auskopplung der Spieldaten (Dice, Crash, Slots) am rechten Rand der Schaltung.
- **Abbruchkriterium:** Eingabefelder verlieren Focus bei Re-Renders.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)
1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm run test` — Alle Tests grün.
3. `npm run lint` — 0 Lint-Fehler.
4. `npm run build` — Production Build erfolgreich.
5. Screenshot-Prüfung der Leiterplatten-Visualisierung.