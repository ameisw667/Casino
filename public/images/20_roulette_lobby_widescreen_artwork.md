# 20 — Roulette Lobby Widescreen Artwork (Obsidian & Gold Kinetic Wheel)

> **Status:** Execution-Ready · **Stand:** 2026-09-03 · **Owner:** LLM · **Scope:** Erzeugung und Validierung eines 16:9 Breitbild-Artworks für die Roulette-Lobbykarte in public/images/, exakt abgestimmt auf den Stil, die Farbwelt und die Lichtstimmung von Dice und Crash (Obsidian, Champagner-Gold #D4AF37, Bernstein & kreisende Lichtbahnen).

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                 | Status      | Nächster Schritt                                                                                                            | Zuständigkeit |
| ------ | ----------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- | ------------- |
| L0     | Bereitstellung Crash & Dice in `public/images/games/`       | 🟢 Executed | Beide 16:9 Artworks als `crash-preview.png` und `dice-preview.png` platziert, live auf `/games`                             | LLM           |
| L1     | 3-stufige Prompt-Iteration für Roulette (Licht A & Kinetik) | 🟢 Executed | Iteration 1 (Klassisch) → Iteration 2 (Material & Perspektive) → Iteration 3 (Kinetischer Spin & Gold-Wirbel)               | LLM           |
| L2     | Dry-Run & Budget-Check vor API-Call                         | 🟢 Executed | Prompt-Validierung & Kostenprüfung (~0.12 USD)                                                                              | LLM           |
| L3     | API-Generierung des 16:9 Artworks (`1536x1024`)             | 🟢 Executed | Erfolgreich generiert: `2026-09-03_hero-roulette-quantum-gold_v001.png` (2.21 MB, SHA-256: `617acf7e...`, 34.6s, ~0.12 USD) | LLM           |
| L4     | Visuelle Integritätsprüfung & Bereitstellung                | 🟢 Executed | Bilddatei analysiert, Metadaten im Index verifiziert, Jan zur Freigabe vorgelegt                                            | LLM           |

## 2 — Drei Iterationsstufen (Workflow-Jan Iteration 1–3)

### Iteration 1: Grundlagen-Komposition (Baseline)

- **Fokus:** Roulette-Rad von oben, rollende Kugel, goldene Lichter.
- **Entwurf:** `Cinematic casino roulette wheel spinning with golden ball and glowing lights`.
- **Kritik / Schwachstelle:** Zu statisch und frontal (wie das bisherige alte Bild mit störendem Text "SPIN & WIN"); fehlende Schrägperspektive und Raumtiefe.

### Iteration 2: Materialität & Perspektive (Obsidian & Chiaroscuro)

- **Fokus:** Dynamische Dreiviertel-Schrägansicht, poliertes dunkles Obsidian-Holz/Glas, Champagner-Gold-Kranz (`#D4AF37`).
- **Entwurf:** `Angled three-quarter perspective of a luxury casino roulette wheel crafted from polished obsidian slate and metallic champagne gold frets, ivory ball spinning on the outer track with amber motion light blur`.
- **Kritik / Schwachstelle:** Noch zu wenig Raumdynamik im Hintergrund; es fehlen die kreisenden goldenen Lichtwirbel und der feine Goldstaub, die Dice und Crash auszeichnen.

### Iteration 3: Finaler Meister-Prompt (Exakte stilistische Kohärenz zu Dice & Crash)

- **Fokus:** Dramatische Dreiviertel-Kino-Perspektive, Rad aus tiefschwarzem Obsidian-Rauchglas und poliertem Champagner-Gold (`#D4AF37`), goldene Zahlenfächer mit warmem Glühen, weiße Perlkugel im rasanten Außenlauf mit geschwungenem Bernstein-Lichtschweif, schwebende goldene Bokeh-Partikel, spiegelnde dunkle Tischoberfläche mit goldenen Fluchtlinien.
- **Finaler Prompt:**
  > `Cinematic dynamic three-quarter perspective of a luxury casino roulette wheel in high-speed spin, crafted from polished dark obsidian smoked glass with heavy metallic champagne gold frets (#D4AF37) and glowing amber number pockets, glistening pearl ball racing along the outer gold track leaving a sweeping curved amber motion-blur light trail, hovering over a mirror-reflective pitch-black obsidian table surface with subtle gold perspective grid lines, volumetric warm amber rim lighting, floating golden bokeh embers in the dark atmosphere, dramatic chiaroscuro lighting, epic cinematic depth of field, masterpiece 3D render`

## 3 — Ziel & Scope

- **Im Scope:**
  - Asset-Name: `hero-roulette-quantum-gold`
  - Speicherort: `public/images/` und `public/images/games/`
  - Format: `1536x1024` (16:9 Widescreen)
  - Qualität: `medium`
  - Kosten: ~0.12 USD
  - Präsentation im Chat vor endgültiger Aktivierung in `config.ts`.
- **Nicht im Scope:**
  - Roulette-Spielphysik, Wettsystem oder Backend.

## 4 — Risiken & Gegenmaßnahmen

1. **Text-Artefakte im Bild:** Das bisherige Bild hatte "SPIN & WIN" und "HOLOGRAPHIC ROULETTE" eingebrannt. Unser Prompt schließt jegliche Typografie strikt aus (`no text, no typography, no logo, no watermark`).
2. **Stil-Diskrepanz:** Durch exakt gleiche Beleuchtung (Warmes Champagner-Gold `#D4AF37`, Bernstein, spiegelnder Obsidian-Boden) fügt sich Roulette nahtlos neben Crash und Dice ein.

## 5 — Money-Pfad & Security-Review

- **Money-Pfad:** Nein.
- **Security-Review:** Nein.
