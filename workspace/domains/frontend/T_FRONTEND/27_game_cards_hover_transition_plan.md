# 27 — Game Cards & Lobby: Hover Transition & Directional Sheen (Obsidian & Gold)

> **Status:** 🔄 Revertiert auf Ursprungsdesign (Vom User visuell bestätigt) · **Stand:** 2026-09-11 · **Owner:** LLM · **Scope:** Die Neufassung wurde vom User als Downgrade eingestuft und vollständig auf das beliebte Vorher-/Ist-Design (`7c3c679`) zurückgerollt und per Screenshot verifiziert.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 60 %)

| #   | Subkategorie         | Niveau   | Befund & Beleg (Datei / Test)                                                                                        | Bottleneck? | Action Item                                                              |
| --- | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- | :---------: | ------------------------------------------------------------------------ |
| 01  | Glanz- & Lichtphysik | Top 75 % | Simples statisches Glare-Div mit fixer `opacity: 0.2` (`ElevatedGameCard.tsx:41`), keine winkelabhängige Lichtkante. |    🔴 JA    | `hover-transition`: 8-direktionaler Vektor-Glanzkanten-Shader/CSS.       |
| 02  | Haptik & Motion      | Top 65 % | Starres `rotateX/Y` ohne haptische Federungs-Trägheit (`ElevatedGameCard.tsx:36`).                                   |    🔴 JA    | Framer Motion Spring-Physik mit dynamischer Trägheit (`stiffness: 300`). |
| 03  | Sound-Verdrahtung    | Top 15 % | `soundManager.playHover()` ist bereits integriert.                                                                   |    Nein     | Sound-Verdrahtung 1:1 beibehalten.                                       |
| 04  | Image & Fallbacks    | Top 20 % | `next/image` mit Error-State & Badges ist sauber gelöst.                                                             |    Nein     | Struktur und Error-Handling intakt lassen.                               |
| 05  | Touch-Verhalten      | Top 25 % | Mobile deaktiviert Hover-Tilt per Early Return (`isMobile`).                                                         |    Nein     | Mobile Performance-Guard beibehalten.                                    |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                           | Scope (Dateien)                                         | Status     | Zuständigkeit | Verifikation                                                     |
| ------ | ------------------------------------- | ------------------------------------------------------- | ---------- | :-----------: | ---------------------------------------------------------------- |
| **L0** | Baseline & Snapshot                   | `src/app/games/_components/ElevatedGameCard.tsx`        | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                                      |
| **L1** | Directional Sheen Hook / Komponente   | `src/components/casino/motion/DirectionalSheenCard.tsx` | 🔴 Geplant |      LLM      | Vektor-Glanzreflex mit Cursoreinfallswinkel isoliert verifiziert |
| **L2** | Integration in `ElevatedGameCard.tsx` | `src/app/games/_components/ElevatedGameCard.tsx`        | 🔴 Geplant |      LLM      | Spielkarten mit holografischem Obsidian & Gold Glanz             |
| **L3** | Abstimmung auf Bento-Arcade           | `src/components/home/bento/BentoArcadeCells.tsx`        | 🔴 Geplant |      LLM      | Einheitliche Glanzkanten in der Homepage-Lobby                   |
| **L4** | Verifikation & 5-Stufen-DoD           | Lokale Test-Suite                                       | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün                       |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei 1: [`src/app/games/_components/ElevatedGameCard.tsx`](file:///v:/VibeCoding/Casino/src/app/games/_components/ElevatedGameCard.tsx)
- Ziel-Datei 2: [`src/components/home/bento/BentoArcadeCells.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoArcadeCells.tsx)
- Neue Komponente: `src/components/casino/motion/DirectionalSheenCard.tsx`
- Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts)
- Screenshots: [`docs/frontend/screenshots/05_weakness_game_card.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/05_weakness_game_card.png)
- Componentry-Referenz: [Hover Transition (`hover-transition`)](https://componentry.dev/docs/components/hover-transition)

### 3.2 Systemregeln & Invarianten

- **Design-System:** Obsidian-Körper (`#0B0E14`), 24k-Gold-Highlights (`#D4AF37`), scharfe Lichtkanten (`rgba(255,255,255,0.4)` auf `rgba(212,175,55,0.6)`).
- **Compositor-Sicherheit:** Reine Ausführung über CSS-Transform & CSS-Variables, kein Layout-Thrashing.

### 3.3 Nicht-Scope (Ausdrücklich verboten)

- Keine Änderungen an Spiel-URLs, Routing oder `GameMeta`-Definitionen.
- Keine Änderungen an den Action-Buttons (Play Now etc.).

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: `DirectionalSheenCard.tsx`

- **Ziel:** Erstellung des Wrappers mit winkelabhängigem Lichtreflex.
- **Schritte:**
  1. Berechnung des Eintrittswinkels des Cursors (`Math.atan2(y, x)`).
  2. Projektion eines linearen Glanzstreifens quer über die Kartenoberfläche.
  3. Spring-gestützte Rückstellung beim Verlassen der Karte.
- **Abbruchkriterium:** Ruckeln bei schnellen Mausbewegungen.

### Meilenstein L2: Einbettung in `ElevatedGameCard.tsx`

- **Ziel:** Ersetzen des statischen Glare-Divs durch den dynamischen Sheen-Effekt.
- **Schritte:**
  1. Austausch der bestehenden `glare`-State-Logik gegen die Vektor-Kante.
  2. Hinzufügen von dezenten holografischen Regenbogen-/Gold-Nuancen auf der Kartenumrandung.
- **Abbruchkriterium:** Z-Index-Konflikte mit Card-Badges oder Buttons.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm run test` — Alle Tests grün.
3. `npm run lint` — 0 Lint-Fehler.
4. `npm run build` — Production Build erfolgreich.
5. Screenshot-Verifikation der Spielkarte im Hover-Zustand.
