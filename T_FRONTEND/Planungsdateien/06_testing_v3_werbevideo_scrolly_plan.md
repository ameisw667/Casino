# 06 â€” Awwwards-Level 3D Scrollytelling: Werbevideo Extension & Visual Polishing

> **Status:** Execution-Ready Â· **Stand:** 2026-09-14 Â· **Owner:** LLM (100% LLM-ZustÃ¤ndigkeit) Â· **Scope:** Isolierte Labor-Route `/testing/v3`: Freistellen der Ace-Karte (Zero Box / Zero Kasten), kinetischer H1-Hover-Texteffekt, VerlÃ¤ngerung der Scrolly-Stage (350vh) zu einem interaktiven "Werbevideo"-Erlebnis (VIP Games Deck, Spiral 3D Stage, Live-Auszahlungs-Stream & TÃ¤gliches Turnier), 6-Punkte-Audit (0%, 20%, 40%, 60%, 80%, 100%) mit schonungsloser Selbstkritik.
> **Money-Pfad:** Nein Â· **Security-Review:** Nein â€” reiner Visual- & Scrolly-Motion-Layer in isolierter Test-Sandbox (`/testing/v3`), 0% Mutation an Wallet-, Auth- oder DB-RNG.

---

## 1 â€” Ãœbersicht fÃ¼r Jan & AusfÃ¼hrungs-LLM

| Nummer | Meilenstein                                                                    | Scope (Dateien)                                                                    | Ausführung  |      Status      | Zuständigkeit | Verifikation & DoD                                                                                                                                  |
| :----- | :----------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :---------- | :--------------: | :-----------: | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| **L0** | **Freistellung der Ace-Karte & Box-Eliminierung**                              | `src/components/testing/v3/TestingV3MorphCard.tsx`, `TestingV3PortalCamera.tsx`    | Sequenziell | 🟢 Abgeschlossen |      LLM      | Keine harte Kasten-Kontur oder grauer Container mehr um das schwebende A-Artwork; organisch freigestellte Kanten mit reinem Glanzschatten           |
| **L1** | **Kinetischer H1-Texteffekt & Interactive Hover**                              | `src/components/testing/v3/TestingV3HeroStage.tsx`                                 | Sequenziell | 🟢 Abgeschlossen |      LLM      | H1 reagiert interaktiv auf Maus-Hover (Char-Splitter / Glanz-Reflexion / 3D-Tilt), edle Typografie nach Obsidian & Gold                             |
| **L2** | **Timeline-Verlängerung & Werbevideo Scrolly-Architektur (350vh)**             | `TestingV3HeroStage.tsx`, `TestingV3MorphCard.tsx`                                 | Sequenziell | 🟢 Abgeschlossen |      LLM      | Erweiterung des Scroll-Tracks von 220vh auf 350vh; sanfte, dramaturgisch gestaffelte Phasen analog zu einem Apple/Awwwards-Werbeclip                |
| **L3** | **Feature-Integration im Scroll: Spiral 3D Stage, Live-Payouts & Tournaments** | `TestingV3MorphCard.tsx`, `src/components/testing/v3/TestingV3FeatureShowcase.tsx` | Sequenziell | 🟢 Abgeschlossen |      LLM      | Interaktives Durchschalten: (1) VIP Games Deck, (2) Spiral 3D Hall of Fame, (3) Live-Payouts Stream, (4) Tägliches Turnier-Podium im 3D-Raum        |
| **L4** | **6-Punkte Playwright Audit (0%, 20%, 40%, 60%, 80%, 100%) & Selbstkritik**    | `scripts/capture-testing-v3-audit.mjs`, `walkthrough.md`                           | Sequenziell | 🟢 Abgeschlossen |      LLM      | 6 gestochen scharfe Screenshots generiert, offen, ehrlich und selbstkritisch analysiert; Verbesserungspotenziale direkt im Walkthrough dokumentiert |
| **L5** | **5-Stufen-DoD & Regressionsschutz**                                           | `npm run typecheck`, `npm test`, `npm run lint`                                    | Sequenziell | 🟢 Abgeschlossen |      LLM      | 0 TypeScript-Fehler, 1.853 Tests grün, 0 ESLint-Errors, Zero-Side-Effects auf `/`                                                                   |

---

## 2 â€” Detaillierter Phasenplan & Technische Spezifikation

### Phase 1: Perfekte Freistellung & Beseitigung der Box um das Ace (L0)

- **Problem im Screenshot:** Die Ace-Karte wird aktuell in einen rechteckigen Container (`320px Ã— 445px`) mit dunklem Hintergrund (`linear-gradient(135deg, #141821, #0B0E14)`) und Goldrahmen gesetzt, worin das physische A-Artwork (`layer-3-quantum-ace.png`) schrÃ¤g gedreht liegt. Dadurch wirkt es wie eine "Karte in einer Kiste".
- **LÃ¶sung:**
  1. Das A-Artwork selbst ist bereits eine vollstÃ¤ndige, geneigte 3D-Luxuskarte mit geschwungenen Lichtschweifen.
  2. Die umhÃ¼llende schwarze Box (`border: 1.5px solid rgba(212,175,55,...)`, Hintergrund und eckiger Kasten) auf dem Front-Face wird restlos entfernt (`background: transparent`, `border: none`, `boxShadow: none`).
  3. Stattdessen wird das A-Artwork als organisch freigestelltes 3D-Objekt gerendert, dessen Dimensionen und feiner goldener Drop-Shadow sich direkt an der Kartenform orientieren.
  4. Beim Flip dreht sich dieses freigestellte A-Artwork im 3D-Raum und morpht flÃ¼ssig in das Back-Face-Deck.

### Phase 2: Kinetischer H1-Texteffekt & Interactive Hover (L1)

- Auf der H1 (`DAS QUANTUM SINGULARITÃ„TS PORTAL.`):
  - Buchstabengenaue oder wortweise Kinetik mit Framer Motion / GSAP.
  - Dynamischer Lichtreflex (Shine-Sweep) bei Maus-Hover Ã¼ber die Ãœberschrift.
  - Subtiler 3D-Neigungswinkel (`rotateX`/`rotateY`), gekoppelt an die Cursor-Position.
  - Obsidian & Gold Ã„sthetik: Reines WeiÃŸ wechselnd mit poliertem 24k-Gold-Farbverlauf (`#FFF2B2` â†’ `#D4AF37` â†’ `#996515`).

### Phase 3: "Werbevideo"-Scrollytelling (350vh) & Multi-Feature Showcase (L2 & L3)

Die Scroll-Dramaturgie wird von 220vh auf 350vh verlÃ¤ngert und wie ein cineastischer Werbetrailer aufgebaut:

- **0 % â€“ 25 % (Der Auftakt):** Kosmisches Portal, kinetische H1, freigestelltes Quantum Ace schwebt majestÃ¤tisch im Vordergrund, Stargate rotiert.
- **25 % â€“ 45 % (Der Vortex-Eintritt):** Kamera beschleunigt in die Tiefe (Z-Drift), H1 blendet mit UnschÃ¤rfe aus, Portal zentriert sich, Partikelsog verdichtet sich.
- **45 % â€“ 60 % (Die Transformation):** SingularitÃ¤ts-Flash (Schockwelle), das freigestellte Ace dreht sich um 180Â° und transformiert sich in die interaktive VIP-BÃ¼hne.
- **60 % â€“ 75 % (Akt I: Die 4 VIP Games):** Kinetisches 3D-Deck schaltet durch Crash Rocket, Quantum Roulette, Neon Blackjack und Cyber Slots.
- **75 % â€“ 85 % (Akt II: Spiral 3D Hall of Fame & Live-Payouts):**
  - Die Karte morpht in die 3D-Spiral-BÃ¼hne der All-Time Highroller und Live-Auszahlungs-Highlights mit flippenden GewinnbetrÃ¤gen.
- **85 % â€“ 100 % (Akt III: TÃ¤gliches Turnier & VIP Podium):**
  - Kinetisches 3D-Podium des tÃ¤glichen Turniers mit Live-Countdown und nahtlosem Ãœbergang in die Bento-Lobby.

### Phase 4: 6-Punkte Playwright Audit & Selbstkritik (L4)

- Automatisches Script (`scripts/capture-testing-v3-audit.mjs`) erfasst Screenshots exakt bei:
  - `0%` (Intro & H1)
  - `20%` (Parallaxe-Aufbau)
  - `40%` (Vortex-Zentrierung)
  - `60%` (Card-Flip-Moment)
  - `80%` (Feature-Showcase / Spiral 3D / Live-Gewinne)
  - `100%` (Turnier-Finale & Bento-Andockung)
- Jeder Frame wird strukturiert analysiert (Ã„sthetik, Tiefenraum, Lesbarkeit, Clipping).

---

## 3 â€” 5-Stufen-DoD & Verifikation (L5)

1. `npx tsc --noEmit` -> 0 Fehler
2. `npm test` -> Alle Tests grÃ¼n (>1.839 Tests)
3. `npm run lint` -> 0 Errors
4. Playwright Capture -> 6 fehlerfreie Audit-Frames
5. Zero-Side-Effects -> Keine Mutationen an Produktionsdateien oder Geldlogik.
