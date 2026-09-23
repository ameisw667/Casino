# 29 — Hintergründe & Ambient Light: Tailored Liquid Chrome WebGL Shader (Obsidian & 24k Gold)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Veredelung des Hauptseiten-Hintergrunds in `src/components/home/LobbyAmbientBackground.tsx` durch einen maßgeschneiderten `liquid-chrome` WebGL Fragment Shader, exakt angepasst an die Markenidentität von Casino Royale (flüssiges 24k-Gold `#D4AF37` in tiefem Obsidian-Vakuum `#0B0E14`), mit striktem Mobile/Low-Power Throttling und 60 FPS.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 65 %)

| #   | Subkategorie              | Niveau   | Befund & Beleg (Datei / Test)                                                                                                    | Bottleneck? | Action Item                                                                |
| --- | ------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- | :---------: | -------------------------------------------------------------------------- |
| 01  | Visuelle Tiefe & Noblesse | Top 75 % | Statische Radial-Gradients mit CSS-Blur erzeugen GPU-Compositing-Last ohne echten Salon-Glanz (`LobbyAmbientBackground.tsx:55`). |    🔴 JA    | Nativer WebGL Fragment Shader mit flüssiger Metallreflexion.               |
| 02  | Brand-Farbabstimmung      | Top 70 % | Generischer Flüssigchrom-Shader ist oft zu hell/silbern; braucht exaktes 24k-Gold- und Obsidian-Tuning.                          |    🔴 JA    | Maßgeschneiderte Shader-Uniforms (`u_gold_tint`, `u_darkness`, `u_sheen`). |
| 03  | Mobile & Battery Gate     | Top 15 % | `matchMedia('(max-width: 1023px)')`-Guard schaltet Canvas auf Mobile bereits sauber ab (`LobbyAmbientBackground.tsx:66`).        |    Nein     | Bestehenden Mobile-Guard 1:1 für den neuen Shader übernehmen.              |
| 04  | Interaktions-Reaktion     | Top 25 % | `useLobbyReactionFx` (Waves, Kometen) ist modular verdrahtet.                                                                    |    Nein     | Reaktions-Events als Impulse in den Shader einspeisen.                     |
| 05  | Memory & WebGL Context    | Top 20 % | Sauberes WebGL-Teardown bei Unmount verhindert Context-Leaks.                                                                    |    Nein     | Rigorosen Context-Loss- & Dispose-Handler implementieren.                  |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                   | Scope (Dateien)                                          | Status     | Zuständigkeit | Verifikation                                                      |
| ------ | --------------------------------------------- | -------------------------------------------------------- | ---------- | :-----------: | ----------------------------------------------------------------- |
| **L0** | Baseline & Snapshot                           | `src/components/home/LobbyAmbientBackground.tsx`         | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                                       |
| **L1** | Tailored Liquid Chrome Shader                 | `src/components/home/shaders/LiquidGoldChromeCanvas.tsx` | 🔴 Geplant |      LLM      | 60 FPS WebGL Fragment Shader in Obsidian & Gold isoliert getestet |
| **L2** | Integration in `LobbyAmbientBackground.tsx`   | `src/components/home/LobbyAmbientBackground.tsx`         | 🔴 Geplant |      LLM      | Nahtloser Ersatz der alten WebGlWaterRefraction-Ebene             |
| **L3** | Feinabstimmung auf Kontrast & Text-Lesbarkeit | `LobbyAmbientBackground.tsx`                             | 🔴 Geplant |      LLM      | 100 % Lesbarkeit aller Bento-Karten und Menüs sichergestellt      |
| **L4** | Verifikation & 5-Stufen-DoD                   | Lokale Test-Suite                                        | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün                        |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/components/home/LobbyAmbientBackground.tsx`](file:///v:/VibeCoding/Casino/src/components/home/LobbyAmbientBackground.tsx)
- Neue Komponente: `src/components/home/shaders/LiquidGoldChromeCanvas.tsx`
- Reaktions-Hook: [`src/components/home/useLobbyReactionFx.ts`](file:///v:/VibeCoding/Casino/src/components/home/useLobbyReactionFx.ts)
- Screenshots: [`docs/frontend/screenshots/07_weakness_ambient_background.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/07_weakness_ambient_background.png)
- Componentry-Referenz: [Liquid Chrome (`liquid-chrome`)](https://componentry.dev/docs/components/liquid-chrome)

### 3.2 Systemregeln & Invarianten

- **Design-System:** Grundton `#0B0E14` (Obsidian), Highlights `#D4AF37` (24k Gold), tiefe Schatten `#05070A`. Niemals grelles Weiß oder unruhiges Flackern.
- **Performance-Invariant:** Fester Render-Scale (z. B. 0.5x bis 0.75x mit CSS-Upscaling und Dithering), um auch auf integrierten GPUs 60 FPS zu garantieren.
- **Zero-Wallet-Autorität:** Reines Hintergrund-Rendering ohne Einfluss auf Spielzustände.

### 3.3 Nicht-Scope (Ausdrücklich verboten)

- Keine Beeinträchtigung der Klickbarkeit oder Interaktivität der Vordergrund-Elemente (`pointer-events: none`).
- Keine Änderungen an den Content-Hierarchien der Homepage.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: `LiquidGoldChromeCanvas.tsx`

- **Ziel:** Erstellung des WebGL-Shaders mit Gold-Liquid-Charakteristik.
- **Schritte:**
  1. Vertex Shader spannt Fullscreen Quad auf.
  2. Fragment Shader nutzt Simplex-Noise-Turbulenz, Normalen-Berechnung und spekulare Reflexionen.
  3. Color-Ramping von Obsidian über sattes Bernstein bis zu 24k Goldkanten.
- **Abbruchkriterium:** GPU-Auslastung > 15 % im Leerlauf.

### Meilenstein L2: Integration in `LobbyAmbientBackground.tsx`

- **Ziel:** Einbettung des Shaders als primäre Ambient-Hintergrundebene.
- **Schritte:**
  1. Dynamisches Laden ohne SSR (`next/dynamic`).
  2. Kopplung an den bestehenden `useLobbyReactionFx` für subtile Wellen bei Casino-Gewinnen.
- **Abbruchkriterium:** Text auf Bento-Karten verliert an Kontrast.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm run test` — Alle Tests grün.
3. `npm run lint` — 0 Lint-Fehler.
4. `npm run build` — Production Build erfolgreich.
5. Screenshot-Prüfung der gesamten Homepage-Lobby.
