# 66 — Live Activity Feed: All Bets, High Rollers & My Bets Componentry-Redesign

> **Status:** Execution-Ready · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Umfassende Veredelung des Wett-Feeds (`src/components/social/LiveActivityFeedV2.tsx`) von einer schlichten HTML-Tabelle zu einer luxuriösen Monte-Carlo-Wettbörse (`magnetic-dock`, `flipping-word-swap`, Glowing Obsidian Pill Badges).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Option-Gate Matrix (Workflow-Jan Schema)

_Kriterien: Luxus-Anmutung & Dichte 30 % · Haptik & Motion-Reaktivität 25 % · Performance bei schnellen Live-Updates 25 % · Mobile Ergonomie 20 %_

| Option                   | Konzept & Layout                                | Visuelle Dichte & Componentry-Inspiration                                                                                                                                                                          | Motion & Interaktion                                                                                         |    Score    | Pre-Mortem (Führungsoption)                                                                                                                                                                   |     Empfehlung     |
| :----------------------- | :---------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :---------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------: |
| **Option A (Empfohlen)** | **Haute Monte-Carlo Live Ledger (Componentry)** | Dock-Style Tabs (`magnetic-dock`), kinetisches Wort-Swap bei Wettwechsel (`flipping-word-swap`), Obsidian-Glass-Zeilen mit sanften Goldkanten, Multiplikator-Pills mit Emerald/Gold Glow, Tabular Mono Typografie. | Sanftes Zeileneinfliegen bei neuen Wetten (`springs.gentle`), Hover-Highlighting, Klick öffnet Spieler-Akte. | **4.9 / 5** | _„Scheitert diese Option in 6 Monaten, woran läge es? Bei extrem hochfrequenten Wetten (>50/Sek) könnte ungedämpftes Re-Rendering ruckeln — behoben durch 60s Throttling mit sanftem Slice.“_ |  ✅ **Empfohlen**  |
| **Option B**             | **Kompaktes 2-Spalten Karten-Grid**             | Kacheln statt Tabellenzeilen für jede Wette.                                                                                                                                                                       | Braucht zu viel vertikalen Platz auf Desktop und verliert Übersicht.                                         | **3.3 / 5** | —                                                                                                                                                                                             |   ⚪ Alternative   |
| **Option C**             | **Reines CSS-Farb-Tweaking**                    | Bestehende Tabelle beibehalten und nur Schriftfarben anpassen.                                                                                                                                                     | Behebt die trockene Tabellen-Anmutung nicht, keine haptische Componentry.                                    | **2.8 / 5** | —                                                                                                                                                                                             | ❌ Nicht empfohlen |

---

## 2 — Visuelle Beweisführung (Status Quo)

- **Vorher (Status Quo):**  
  ![Status Quo Live Activity Feed](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/66_status_quo_live_activity_feed.png)  
  _Befund:_ Eine sehr simple, flache Web-Tabelle mit grauen Texten, Standard-Schriften und trockenem SaaS-Look statt Casino-Exklusivität.

---

## 3 — Meilensteine (100 % LLM-Zuständigkeit)

| Meilenstein | Titel                             | Scope (Dateien)                                |   Status   | Zuständigkeit | Verifikation                                       |
| :---------- | :-------------------------------- | :--------------------------------------------- | :--------: | :-----------: | :------------------------------------------------- |
| **L0**      | Componentry Magnetic Dock Tabs    | `src/components/social/LiveActivityFeedV2.tsx` | 🔴 Geplant |      LLM      | Edle Pill-Tabs mit Feder-Hover                     |
| **L1**      | Luxus Obsidian Ledger Rows        | `src/components/social/LiveActivityFeedV2.tsx` | 🔴 Geplant |      LLM      | Glass-Zeilen, Gold-Bevel, Emerald-Badges           |
| **L2**      | Monospace Tabular Numbers & Icons | `src/components/social/LiveActivityFeedV2.tsx` | 🔴 Geplant |      LLM      | `tabular-nums`, Gold/Smaragd Multiplier Pills      |
| **L3**      | Screenshot-Audit & 5-Stufen-DoD   | Test-Suite & Playwright                        | 🔴 Geplant |      LLM      | Typecheck, Tests, Lint, Build & Nachher-Screenshot |

---

## 4 — Verifikation & DoD

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm test` — Tests grün.
3. `npm run lint` — Keine Lint-Fehler.
4. `npm run build` — Next.js Production Build erfolgreich.
5. Screenshot: `docs/frontend/screenshots/66_success_live_activity_feed.png`.
