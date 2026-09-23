# 22 — IMG-02: Startseite an /games angleichen (Single-Source-Registry & Quantum-Gold)

> **Status:** 🟢 Abgeschlossen & Verifiziert · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Angleichung der Startseite (Hero-Cinematic und Bento-Arcade-Grid) an die Quantum-Gold-Bildserie von `/games` über eine kanonische Spiele-Registry (`src/lib/casino/games-registry.ts`) mit 3:2-Crop-Optimierung.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-05.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                               |   Status    | Nächster Schritt                                                                                       | Zuständigkeit |
| :----: | :-------------------------------------------------------- | :---------: | :----------------------------------------------------------------------------------------------------- | :-----------: |
| **L0** | Kanonische Spiele-Registry (`games-registry.ts`)          | 🟢 Erledigt | Definition der Single-Source-of-Truth für Metadaten & Bildpfade aller Casino-Spiele                    |      LLM      |
| **L1** | Anbindung Hero-Cinematic (`config.ts`)                    | 🟢 Erledigt | Migration der Desktop-Hero-Karten auf die neuen Quantum-Gold-Artworks                                  |      LLM      |
| **L2** | Anbindung Bento-Arcade-Grid (`InteractiveArcadeGrid.tsx`) | 🟢 Erledigt | Umstellung der Bento-Kacheln auf die Registry mit optimierter `object-position`                        |      LLM      |
| **L3** | Crop-Feinschliff & 3:2-Container-Abgleich                 | 🟢 Erledigt | Sicherstellung, dass Jet-Flügel, Roulette-Rad und Ass-Kanten nicht abgeschnitten werden (`center 25%`) |      LLM      |
| **L4** | Responsiv-Check (Mobile & Desktop) & Typecheck            | 🟢 Erledigt | Prüfung von `npm run typecheck` & Linter fehlerfrei                                                    |      LLM      |

---

## 2 — Ziel, Scope & Nicht-Scope

### 2.1 Ziel

Vollständige Beseitigung des Stilbruchs zwischen Startseite (`/`) und Spielekatalog (`/games`). Während `/games` bereits die edlen, dunklen _Quantum-Gold_-Artworks verwendet, lädt die Startseite aktuell noch veraltete Legacy-Bilder (`game-crash-new.png`, `lucky-777-neon-3d.png`). Durch eine gemeinsame kanonische Registry werden doppelte Konfigurationsdateien eliminiert und 100 % visuelle Einheitlichkeit hergestellt — **mit 0 neuen Generierungen und 0 API-Kosten**.

### 2.2 In Scope

- **Kanonische Registry:** `src/lib/casino/games-registry.ts`
  - Zentrale Typdefinition und Konstanten-Array für alle 6 Kernspiele (Crash, Blackjack, Dice, Roulette, Slots, Crash Multiplayer).
  - Verwendung der 5 bereits lokal vorhandenen Quantum-Gold-Assets:
    - Crash: `/images/games/hero-crash-quantum-gold.png`
    - Blackjack: `/images/games/hero-blackjack-quantum-gold.png`
    - Dice: `/images/games/hero-dice-quantum-gold.png`
    - Roulette: `/images/games/hero-roulette-quantum-gold.png`
    - Slots: `/images/games/hero-slots-quantum-gold.png`
- **Hero-Cinematic-Anbindung ([`src/components/home/hero-cinematic/config.ts`](file:///v:/VibeCoding/Casino/src/components/home/hero-cinematic/config.ts)):**
  - Refactoring von `GAME_TABS`, sodass die Bildpfade aus der Registry bezogen werden.
- **Bento-Grid-Anbindung ([`src/components/home/InteractiveArcadeGrid.tsx`](file:///v:/VibeCoding/Casino/src/components/home/InteractiveArcadeGrid.tsx)):**
  - Refactoring von `GAMES`, Beseitigung redundanter Daten.
- **Crop-Justierung ([`BentoArcadeCells.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoArcadeCells.tsx)):**
  - `object-position: center 25%` (verhindert das Abschneiden der Hauptobjekte bei abweichenden Kachel-Seitenverhältnissen).

### 2.3 Nicht-Scope (Explizit ausgeschlossen)

- Keine neuen Bildgenerierungen über KI-Schnittstellen (die 5 Assets liegen vollständig vor).
- Keine Änderungen an den Gameplay-Routen (`/games/crash`, `/games/blackjack` etc.).
- Keine Änderungen an Spielstatistiken, Quoten oder Gewinnlogiken.

---

## 3 — Technische Spezifikation

### 3.1 Registry-Schnittstelle (`src/lib/casino/games-registry.ts`)

```typescript
export interface CasinoGameDefinition {
  id: 'crash' | 'blackjack' | 'dice' | 'roulette' | 'slots' | 'crash-multiplayer';
  title: string;
  badge: string;
  maxPayout: string;
  route: string;
  image: string;
  accentColor: string;
  description: string;
}

export const CASINO_GAMES_REGISTRY: readonly CasinoGameDefinition[] = [ ... ];
```

### 3.2 Bild-Crop-Regel für Bento-Kacheln

```css
/* Erhält die Silhouette der 3:2-Bilder (1536x1024) im Grid */
object-fit: cover;
object-position: center 25%;
```

---

## 4 — Meilensteine im Detail

### L0: Kanonische Spiele-Registry

- **Ziel:** `src/lib/casino/games-registry.ts` erstellen.
- **Zuständigkeit:** LLM.
- **Kriterien:** Vollständige Typisierung, Export von Helfern für schnellen Lookup (`getGameById`).

### L1: Anbindung Hero-Cinematic

- **Ziel:** `hero-cinematic/config.ts` auf Registry umstellen.
- **Zuständigkeit:** LLM.
- **Kriterien:** Desktop-Hero-Slideshow zeigt sofort die Quantum-Gold-Motive.

### L2: Anbindung Bento-Arcade-Grid

- **Ziel:** `InteractiveArcadeGrid.tsx` & `BentoArcadeCells.tsx` anpassen.
- **Zuständigkeit:** LLM.
- **Kriterien:** Bento-Kacheln zeigen dieselben Bilder wie `/games`.

### L3: Crop- & Kontrast-Feinschliff

- **Ziel:** Visuelle Prüfung der Zuschnitte.
- **Zuständigkeit:** LLM.
- **Kriterien:** Wichtige Details (Jet-Flügel, Rad-Zahlen) bleiben in allen Viewports sichtbar.

### L4: Verifikation & Abschluss

- **Ziel:** Build- und Responsiv-Prüfung.
- **Zuständigkeit:** LLM.
- **Kriterien:** `npm run typecheck` fehlerfrei, kein unnötiges Laden auf Mobilgeräten.

---

## 5 — Selbstprüfung vor `Execution-Ready`

- [x] **Scope klar abgegrenzt:** Reines Datenquellen- und Pfad-Refactoring; 0 Backend-Änderungen.
- [x] **LLM-Zuständigkeit:** Alle Schritte L0–L4 liegen zu 100 % beim LLM.
- [x] **0 API-Kosten:** 100 % Wiederverwendung bestehender Assets.
- [x] **Verknüpfung:** Verlinkt in [`00_bildgenerierung_uebersicht_jan.md`](../T_IMAGE/00_bildgenerierung_uebersicht_jan.md) und [`02_bildgenerierung_top10_details.md#img-02`](../T_IMAGE/02_bildgenerierung_top10_details.md#img-02).
