# 17 — IMG-07: Sechs Achievement-Motive ergänzen (Inkrementeller Pilot)

> **Status:** Umgesetzt (lokal verifiziert) · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Inkrementelle Bereitstellung von 6 3D-Achievement-Assets (Pilot: first_bet, danach 5 Folge-Motive) zur vollständigen Ablösung aller Emojis in DEFAULT_ACHIEVEMENT_CONFIGS.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-05. Typecheck, 1.530 Tests, Lint, Build und scoped Diff-Check erfolgreich.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                          |    Status    | Nächster Schritt                                                                                           | Zuständigkeit |
| :----: | :--------------------------------------------------- | :----------: | :--------------------------------------------------------------------------------------------------------- | :-----------: |
| **L0** | Pilot-Generierung: `first_bet` (`ach-target-3d.png`) | 🟢 Umgesetzt | Lokales Zielring-Motiv liegt vor und ersetzt das Emoji                                                     |      LLM      |
| **L1** | Pilot-Integration & Vault-Vergleich                  | 🟢 Umgesetzt | `first_bet` nutzt den lokalen Bildpfad; Vault unterstützt `next/image` und Locked-Filter bereits nativ     |      LLM      |
| **L2** | Generierung der 5 Folge-Motive                       | 🟢 Umgesetzt | Alle fünf lokalen Folge-Motive sind vorhanden und zugeordnet                                               |      LLM      |
| **L3** | Vollständige Verdrahtung in Config & Asset-Index     | 🟢 Umgesetzt | Sechs Pfade ersetzen Emojis; Secret-Redaktion für `lucky_seven` bleibt durch die Präsentationslogik intakt |      LLM      |
| **L4** | Verifikation, Filter-Check & Typecheck               | 🟢 Umgesetzt | Konfigurations- und Gesamttests, Typecheck, Lint, Build und scoped Diff-Check erfolgreich                  |      LLM      |

---

## 2 — Ziel, Scope & Nicht-Scope

### 2.1 Ziel

Die verbliebenen 6 Emojis im Achievement-System werden durch hochwertige 3D-gerenderte Medaillons im konsistenten _Obsidian & Quantum Gold_-Stil ersetzt, abgestimmt auf die drei vorhandenen Referenz-Assets ([`ach-whale-3d.png`](file:///v:/VibeCoding/Casino/public/images/ach-whale-3d.png), [`ach-clover-3d.png`](file:///v:/VibeCoding/Casino/public/images/ach-clover-3d.png), [`ach-rocket-3d.png`](file:///v:/VibeCoding/Casino/public/images/ach-rocket-3d.png)).

### 2.2 In Scope

- **6 neue Bild-Assets (1024×1024 Master PNG mit Transparenz):**
  1. `first_bet`: `public/images/ach-target-3d.png` (Goldener Pfeil im dunklen Obsidian-Ring)
  2. `big_win`: `public/images/ach-jackpot-chest-3d.png` (Goldener Münzbehälter / Schatulle)
  3. `level_10`: `public/images/ach-star-3d.png` (Plastischer Goldstern auf Obsidian-Sockel)
  4. `level_50`: `public/images/ach-crown-3d.png` (Elegante Casino-Krone aus Gold)
  5. `daily_grinder`: `public/images/ach-flame-3d.png` (Stilisierte Goldflamme)
  6. `lucky_seven`: `public/images/ach-dice-seven-3d.png` (Würfel-Insignie, Secret Achievement)
- **Konfigurations-Update:** [`src/lib/casino/achievements-config.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/achievements-config.ts) (Ersetzen der Emojis durch die Bildpfade).
- **Zustands-Verifikation:** Korrekte Darstellung in [`VaultAchievements.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/vault/VaultAchievements.tsx) für:
  - _Unlocked:_ Volle Farbe und Goldakzent.
  - _Locked:_ Automatischer CSS-Filter `grayscale(1) brightness(0.4)`.
  - _Secret:_ Verstecktes Schloss 🔒 vor Freischaltung via [`achievement-presentation.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/achievement-presentation.ts).

### 2.3 Nicht-Scope (Explizit ausgeschlossen)

- Keine Änderungen an den Bewertungsbedingungen (`conditions`) oder Schwellenwerten (`total`).
- Keine Änderungen an der Rendering-Komponente `VaultAchievements.tsx` (diese unterstützt Bilder bereits nativ).
- Keine Änderungen am Datenbankschema.
- Die doppelte Nutzung von `ach-rocket-3d.png` für `moon_shot` bleibt als stabiler Standard vorerst erhalten (Option B wurde verworfen).

---

## 3 — Technische Spezifikation & Zuordnung

| Achievement-ID  | Aktuelles Icon | Neues 3D-Asset                     | Motiv-Beschreibung                                              |
| :-------------- | :------------: | :--------------------------------- | :-------------------------------------------------------------- |
| `first_bet`     |       🎯       | `/images/ach-target-3d.png`        | Runder Obsidian-Zielring, goldene Trefferzone, feiner Goldpfeil |
| `big_win`       |       💰       | `/images/ach-jackpot-chest-3d.png` | Massiver Goldbarren/Münztresor mit warmem Lichtsaum             |
| `level_10`      |       ⭐       | `/images/ach-star-3d.png`          | Fünfzackiger Stern mit facettierten Goldkanten                  |
| `level_50`      |       👑       | `/images/ach-crown-3d.png`         | Dreidimensional gewölbte Royale-Krone mit Goldfiligran          |
| `daily_grinder` |       🔥       | `/images/ach-flame-3d.png`         | Skulpturale Flamme aus Obsidian mit flüssigem Goldkern          |
| `lucky_seven`   |       🎰       | `/images/ach-dice-seven-3d.png`    | Goldgewürfelte 7 mit Würfelkombination (Secret)                 |

---

## 4 — Meilensteine im Detail

### L0: Pilot-Generierung `first_bet`

- **Ziel:** Erstellung von `public/images/ach-target-3d.png`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Isolierter Alpha-Kanal, exakt zentriert, stimmige Schattenrichtung (weiches Licht von oben links wie bei `ach-whale-3d.png`).

### L1: Pilot-Integration & Vault-Test

- **Ziel:** `ach-target-3d.png` in `achievements-config.ts` für `first_bet` eintragen.
- **Zuständigkeit:** LLM.
- **Kriterien:** Im Vault unter `/vault` (Achievements-Tab) prüfen. Bild muss in 44×44 px gestochen scharf wirken und im gesperrten Zustand harmonisch dunkel abdunkeln.

### L2: Generierung der 5 Folge-Motive

- **Ziel:** Erstellung der verbleibenden 5 Bilddateien.
- **Zuständigkeit:** LLM.
- **Kriterien:** Gleiche Kameraperspektive (isometrisch/front-leicht geneigt), identische Goldfarbtemperatur.

### L3: Vollständiges Konfigurations-Update

- **Ziel:** Aktualisierung aller `icon`-Strings in `DEFAULT_ACHIEVEMENT_CONFIGS`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Alle 10 Achievements besitzen nun einen validen Pfad (`/images/ach-...`). Keine Emojis mehr im Default-Set.

### L4: Verifikation & Abschluss

- **Ziel:** Build- und Typprüfung.
- **Zuständigkeit:** LLM.
- **Kriterien:** `npm run typecheck` ohne Fehler, `achievements-config.test.ts` (falls vorhanden) grün.

---

## 5 — Selbstprüfung vor `Execution-Ready`

- [x] **Scope klar abgegrenzt:** Reiner Asset-Austausch in der Konfiguration; keine Logikmutationen.
- [x] **LLM-Zuständigkeit:** Alle Schritte L0–L4 liegen vollständig beim LLM.
- [x] **Pilot-Prinzip eingehalten:** Erst `first_bet` als Referenz verifizieren, bevor die Folgebilder fixiert werden.
- [x] **Verknüpfung:** Verlinkt in [`00_bildgenerierung_uebersicht_jan.md`](../T_IMAGE/00_bildgenerierung_uebersicht_jan.md) und [`02_bildgenerierung_top10_details.md#img-07`](../T_IMAGE/02_bildgenerierung_top10_details.md#img-07).
