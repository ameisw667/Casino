# 19 — Crash Lobby Widescreen Artwork (Obsidian & Gold Space-Jet)

> **Status:** Execution-Ready · **Stand:** 2026-09-03 · **Owner:** LLM · **Scope:** Erzeugung und Validierung eines 16:9 Breitbild-Artworks für die Crash-Lobbykarte, exakt abgestimmt auf den Stil, die Farbwelt und die Lichtstimmung des neuen Dice-Artworks (Obsidian, Champagner-Gold, Bernstein & feiner Goldstaub).

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                             | Status      | Nächster Schritt                                                                                                         | Zuständigkeit |
| ------ | ------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ | ------------- |
| L0     | 3-stufige Prompt- & Stil-Harmonisierung (Dice-Kohärenz) | 🟢 Executed | Iteration 1 (Space-Baseline) → Iteration 2 (Material & Stealth-Form) → Iteration 3 (Kinetischer Steigflug & Gold-Vortex) | LLM           |
| L1     | Dry-Run & Kosten-Governance vor API-Call                | 🟢 Executed | Prompt-Validierung & Budget-Check (~0.12 USD)                                                                            | LLM           |
| L2     | API-Generierung des 16:9 Artworks (`1536x1024`)         | 🟢 Executed | Erfolgreich generiert: `2026-09-03_hero-crash-quantum-gold_v001.png` (2.48 MB, SHA-256: `20eb7ab8...`, 32.7s, ~0.12 USD) | LLM           |
| L3     | Visuelle Integritätsprüfung & Bereitstellung            | 🟢 Executed | Bilddatei analysiert, Metadaten im Index verifiziert, Jan zur Freigabe vorgelegt                                         | LLM           |

## 2 — Drei Iterationsstufen (Workflow-Jan Iteration 1–3)

### Iteration 1: Grundlagen-Komposition (Baseline)

- **Fokus:** Raumschiff/Rakete im Steigflug, Triebwerksschweif, Weltraumhintergrund.
- **Entwurf:** `Futuristic rocket soaring upwards into dark space with glowing golden engine flame and stars`.
- **Kritik / Schwachstelle:** Zu bunt/generisch; Gefahr von bunten Neon-Regenbogenfarben (wie im bisherigen alten Bild mit Cyan/Magenta-Überladung); passt noch nicht zur edlen Obsidian-Gold-Ästhetik des Dice-Bildes.

### Iteration 2: Materialität & Stealth-Form (Obsidian & Gold)

- **Fokus:** Einbettung in das Obsidian & Gold Designsystem (`#0B0E14`, `#D4AF37`), geometrische Eleganz statt Spielzeug-Rakete.
- **Entwurf:** `Cinematic luxury aerospace stealth jet crafted from polished obsidian dark composite with metallic champagne gold accents (#D4AF37), ascending diagonally through dark deep space with a warm amber thrust plume`.
- **Kritik / Schwachstelle:** Noch zu dunkel im Hintergrund; es fehlen die schwebenden goldenen Bokeh-Partikel und die geschwungenen Lichtstreifen, die das Dice-Bild so lebendig und tief gemacht haben.

### Iteration 3: Finaler Meister-Prompt (Exakte stilistische Kohärenz zum Dice-Artwork)

- **Fokus:** Diagonale Dynamik (aufsteigender Multiplikator), aerodynamischer Luxus-Stealth-Jet aus tiefschwarzem Obsidian-Material mit polierten Champagner-Gold-Kanten, kraftvoller Triebwerksstrahl aus flüssigem Bernstein-Gold, geschwungene Motion-Trails und schwebende Goldfunken im dunklen kosmischen Raum mit feinem goldenen Bokeh.
- **Finaler Prompt:**
  > `Cinematic luxury aerospace stealth jet ascending diagonally at high speed, crafted from polished dark obsidian glass and matte carbon composite with beveled metallic champagne gold trim (#D4AF37), powerful radiant engine plume of pure liquid gold and warm amber thrust fire, sweeping curved golden motion-blur light trails and sparkling amber embers spiraling around its trajectory, soaring through a deep pitch-black obsidian cosmos filled with subtle floating golden bokeh particles, volumetric warm amber rim lighting outlining the sleek aerodynamic wings, dramatic chiaroscuro atmosphere, epic cinematic depth of field, masterpiece 3D render`

## 3 — Ziel & Scope

- **Im Scope:**
  - Asset-Name: `hero-crash-quantum-gold`
  - Kategorie: `hero`
  - Format: `1536x1024` (16:9 Widescreen, perfekt für den 16:10 Container der `ElevatedGameCard`)
  - Qualität: `medium`
  - Kosten: ~0.12 USD
  - Visuelle Präsentation an Jan **vor** der finalen Einbindung in die Lobby.
- **Nicht im Scope:**
  - Spielmechanik von Crash, Multiplayer-Engine oder vorzeitige Änderungen am UI.

## 4 — Risiken & Gegenmaßnahmen (Selbstprüfung vor Execution)

1. **Stilbruch-Risiko:** Das bisherige Crash-Bild war mit bunten Neonfarben (Cyan, Lila, Pink) überladen. Durch explizite Farbverankerung (`#0B0E14`, `#D4AF37`, Bernstein/Champagner) und die globalen Negative-Exclusions (`no neon rainbow`, `no flat 2d cartoon`) wird der exakt gleiche Luxus-Look wie bei Dice garantiert.
2. **Kosten-Sicherheit:** Spend-Ledger überwacht den Betrag; `--yes`-Gate aktiv.
3. **Freigabe-Gate:** Zuerst visuelle Vorstellung im Chat, danach gemeinsame Aktivierung.

## 5 — Money-Pfad & Security-Review

- **Money-Pfad:** Nein (Design-Asset-Generierung).
- **Security-Review:** Nein.
