# 62 — Cineastische Storyline: Relocation & Componentry-Upgrade

> **Status:** Execution-Ready · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Verschiebung der narrativen Storyline-Sektion über das Tägliche Turnier und Veredelung durch Componentry-Inspirationen (`scroll-choreography` & `interactive-chapter-deck`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Option-Gate Matrix (Workflow-Jan Schema)

*Kriterien: Visueller Luxus 30 % · Aufwand/Komplexität 25 % · Performance (60–120 FPS) 25 % · Responsive Ergonomie 20 %*

| Option | Konzept & Layout | Visuelle Dichte & Componentry-Inspiration | Motion & Interaktion | Score | Pre-Mortem (Führungsoption) | Empfehlung |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **Option A (Empfohlen)** | **Haute Horlogerie Chapter Deck über Turnier** | Verschiebung direkt über `TournamentPodiumStrip`; 3-Wege-Horlogerie-Deck mit flüssiger Scroll-Choreografie (`scroll-choreography` + `case-study-flip-stack`), kompakterer Obsidian-Rahmen mit 24k-Gold-Glow. | Spring-Physics-Indikator, reaktiver Telemetrie-Puls, unter 450px fließendes vertikales Accordion. | **4.6 / 5** | *„Scheitert diese Option in 6 Monaten, woran läge es? Ein zu starres Scroll-Target bei extrem schnellem Mobile-Fling-Scroll.“* | ✅ **Empfohlen** |
| **Option B** | **Minimalistischer Storyline-Ticker** | Reduktion auf 1-Zeilen-Text-Flipper ohne visuelle Telemetrie-Bühne. | Lineare Text-Fades, keine interaktiven Kapitel. | **3.2 / 5** | — | ⚪ Alternative |
| **Option C** | **Vollflächige WebGL-Parallax-Wand** | Riesige 100vh Parallaxe-Bühne mit WebGL-Partikel-Sog. | Schwerfällige Scroll-Hijacks, Überladung der Startseite. | **2.9 / 5** | — | ❌ Nicht empfohlen |

---

## 2 — Visuelle Beweisführung (Status Quo)

- **Vorher (Status Quo):**  
  ![Status Quo Cineastische Storyline](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/62_status_quo_cineastische_storyline.png)  
  *Befund:* Riesiger Kasten ganz oben direkt unter dem Hero platziert, wirkt deplatziert, unterbricht den Spielfluss der Lobby und bietet zu wenig kompakten Nutzen.

---

## 3 — Meilensteine (100 % LLM-Zuständigkeit)

| Meilenstein | Titel | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **L0** | Relocation & Layout-Verschiebung | `src/components/home/BentoLobbyHome.tsx` | 🔴 Geplant | LLM | Position exakt über `TournamentPodiumStrip` |
| **L1** | Componentry-Refinement (Chapter Deck) | `src/components/home/LobbyScrollChoreography.tsx` | 🔴 Geplant | LLM | Relevantere Daten, kompaktere Proportionen, Obsidian & Gold |
| **L2** | Responsive & Touch-Ergonomie | `src/components/home/LobbyScrollChoreography.tsx` | 🔴 Geplant | LLM | Saubere Skalierung von 375px bis 1440px+ |
| **L3** | Screenshot-Audit & 5-Stufen-DoD | Test-Suite & Playwright | 🔴 Geplant | LLM | Typecheck, Tests, Lint, Build & Nachher-Screenshot |

---

## 4 — Verifikation & DoD

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm test` — Tests grün.
3. `npm run lint` — Keine Lint-Fehler.
4. `npm run build` — Next.js Production Build erfolgreich.
5. Screenshot: `docs/frontend/screenshots/62_success_cineastische_storyline.png`.
