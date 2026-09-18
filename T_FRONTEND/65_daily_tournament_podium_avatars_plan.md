# 65 — Tägliches Turnier: Leaderboard-Bilder & Champion-Podium (Avatare)

> **Status:** Execution-Ready · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Behebung der fehlenden Bilder im Täglichen Turnier (`TournamentPodiumStrip`). Volle Ausstattung der Podestplätze mit hochauflösenden Leaderboard-Avataren, 3D-Kronen und authentischen Champion-Identitäten auch bei unbesetztem Live-Turnier.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Option-Gate Matrix (Workflow-Jan Schema)

*Kriterien: Visuelle Authentizität 30 % · Lebendigkeit & Gamification 25 % · Aufwand 25 % · Robustheit bei fehlenden Live-Daten 20 %*

| Option | Konzept & Layout | Visuelle Dichte & Componentry-Inspiration | Motion & Interaktion | Score | Pre-Mortem (Führungsoption) | Empfehlung |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **Option A (Empfohlen)** | **Kuratierte High-Roller Champions mit 3D-Avataren & Rang-Kronen** | Podestplätze 1, 2 und 3 erhalten immer leuchtende VIP-Avatare (`/images/avatars/avatar-obsidian-0*.png`), Rang-Kronen und echte High-Roller-Handles. Falls noch keine Live-Wetten für den Tag platziert sind, greift ein nahtloser Leaderboard-Champion-Datensatz statt leerer schwarzer Kreise. | Schwebende Champion-Aura, Glanzkanten-Puls auf Platz 1 (Gold-Krone), Hover-Zoom auf die Siegerkarten. | **4.9 / 5** | *„Scheitert diese Option in 6 Monaten, woran läge es? Statischer Fallback könnte sich wiederholen — erfordert automatische Rotation aus dem All-Time Leaderboard-Pool.“* | ✅ **Empfohlen** |
| **Option B** | **Nur generische Placeholder-Icons (Silhouetten)** | Ersetzung des leeren Kreises durch ein anonymes User-Icon. | Weiterhin kalt und unpersönlich, erzeugt keinen Siegeshunger. | **3.0 / 5** | — | ⚪ Alternative |
| **Option C** | **Vollständiges Ausblenden bei leerem Turnier** | Verstecken der 3 Podestplätze, bis der erste Spieler wettet. | Zerstört das Layout und die Vorfreude auf das Turnier. | **2.5 / 5** | — | ❌ Nicht empfohlen |

---

## 2 — Visuelle Beweisführung (Status Quo)

- **Vorher (Status Quo):**  
  ![Status Quo Tägliches Turnier](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/65_status_quo_daily_tournament_podium.png)  
  *Befund:* Auf den Podestplätzen 1, 2 und 3 klaffen leere schwarze Kreise mit dem Text „Noch offen“. Keine Spielerbilder, kein Turnier-Flair.

---

## 3 — Meilensteine (100 % LLM-Zuständigkeit)

| Meilenstein | Titel | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **L0** | Avatar-Integrität & Fallback-Datensatz | `src/components/home/bento/BentoStripCells.tsx` | 🔴 Geplant | LLM | Keine leeren Kreise mehr möglich |
| **L1** | 3D-Kronen & Metall-Embleme (Gold/Silber/Bronze) | `src/components/home/bento/BentoStripCells.tsx` | 🔴 Geplant | LLM | Glanzrahmen, Rang-Kronen, hochauflösende Avatare |
| **L2** | Wagered-Volumen & Preisgeld-Typografie | `src/components/home/bento/BentoStripCells.tsx` | 🔴 Geplant | LLM | Tabular-Zahlen, animierter Restzeit-Countdown |
| **L3** | Screenshot-Audit & 5-Stufen-DoD | Test-Suite & Playwright | 🔴 Geplant | LLM | Typecheck, Tests, Lint, Build & Nachher-Screenshot |

---

## 4 — Verifikation & DoD

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm test` — Tests grün.
3. `npm run lint` — Keine Lint-Fehler.
4. `npm run build` — Next.js Production Build erfolgreich.
5. Screenshot: `docs/frontend/screenshots/65_success_daily_tournament_podium.png`.
