# 64 — Live Progressive Jackpot & Gesamt ausgezahlt: Frameless Background Integration

> **Status:** Execution-Ready · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Beibehaltung des hochgelobten Jackpots, aber vollständige Befreiung der Stats („Gesamt ausgezahlt“) aus der Kastenbox — direkte rahmenlose Projektion auf den Hintergrund ohne asymmetrischen Freiraum.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Option-Gate Matrix (Workflow-Jan Schema)

*Kriterien: Ästhetische Eleganz & Balance 30 % · Aufwand 25 % · Lesbarkeit & Trust 25 % · Responsive Ergonomie 20 %*

| Option | Konzept & Layout | Visuelle Dichte & Componentry-Inspiration | Motion & Interaktion | Score | Pre-Mortem (Führungsoption) | Empfehlung |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **Option A (Empfohlen)** | **Frameless Typo-Aura direkt auf Background** | Keine Box, kein Kastenrahmen! 4 Stat-Säulen schweben direkt auf dem kosmischen Obsidian-Hintergrund, zarte vertikale Gold-Glow-Teiler, harmonisch über die volle Modulbreite zentriert ohne toten Freiraum. | Kinetisches Number-Tickering (`kinetic-text-reveal`), subtiler Hover-Glow auf den Zahlen, 100 % harmonische Zentrierung. | **4.8 / 5** | *„Scheitert diese Option in 6 Monaten, woran läge es? Bei extrem hellen Parallax-Hintergründen könnte der Kontrast der Zahlen ohne Card-Hintergrund nachlassen — behoben durch sanfte Vignette im Textbereich.“* | ✅ **Empfohlen** |
| **Option B** | **Integrierte Jackpot-Fußleiste** | Integration der 4 Stats als schmale Zeile direkt innerhalb der oberen Jackpot-Kachel. | Überlädt die Jackpot-Kachel und staucht den animierten Zähler. | **3.5 / 5** | — | ⚪ Alternative |
| **Option C** | **Icon-Pillen-Grid in Sub-Box** | Weiterhin in einer Box, nur mit 4 Pillen-Buttons. | Löst den Wunsch des Users nach „ohne Box direkt auf Hintergrund“ nicht. | **2.6 / 5** | — | ❌ Nicht empfohlen |

---

## 2 — Visuelle Beweisführung (Status Quo)

- **Vorher (Status Quo):**  
  ![Status Quo Jackpot & Gesamt ausgezahlt](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/64_status_quo_jackpot_gesamt_ausgezahlt.png)  
  *Befund:* Jackpot oben ist edel, aber darunter klebt eine isolierte dunkle Box auf der linken Seite mit ungenutztem Freiraum rechts, was unausgewogen und abgehackt wirkt.

---

## 3 — Meilensteine (100 % LLM-Zuständigkeit)

| Meilenstein | Titel | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **L0** | Box-Entfernung & Frameless Canvas | `src/components/home/bento/BentoJackpotCells.tsx` | 🔴 Geplant | LLM | Keine Border, keine Kasten-Hintergrundfläche |
| **L1** | Layout-Balancierung & Grid-Span | `src/components/home/bento/BentoJackpotCells.tsx`, `BentoLobbyHome.tsx` | 🔴 Geplant | LLM | Keine asymmetrische Leerstelle rechts |
| **L2** | Veredelung der Typo-Säulen | `src/components/home/bento/BentoJackpotCells.tsx` | 🔴 Geplant | LLM | Gold-Akzentteiler, monospaced Tabular-Zahlen, Micro-Glow |
| **L3** | Screenshot-Audit & 5-Stufen-DoD | Test-Suite & Playwright | 🔴 Geplant | LLM | Typecheck, Tests, Lint, Build & Nachher-Screenshot |

---

## 4 — Verifikation & DoD

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm test` — Tests grün.
3. `npm run lint` — Keine Lint-Fehler.
4. `npm run build` — Next.js Production Build erfolgreich.
5. Screenshot: `docs/frontend/screenshots/64_success_jackpot_gesamt_ausgezahlt.png`.
