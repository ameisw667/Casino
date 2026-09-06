# 18 — Dice Lobby Widescreen Artwork (Licht A: Champagner-Gold & Bernstein)

> **Status:** Execution-Ready · **Stand:** 2026-09-03 · **Owner:** LLM · **Scope:** Erzeugung und Validierung eines 16:9 Breitbild-Artworks für die Dice-Lobbykarte mit dynamischer Flugbewegung, leuchtendem Cyber-Grid und reinem Champagner-Gold-Licht.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                          | Status      | Nächster Schritt                                                                                                        | Zuständigkeit |
| ------ | ---------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- | ------------- |
| L0     | 3-stufige Prompt- & Kompositions-Iteration (Licht A) | 🟢 Executed | Iteration 1 (Baseline) → Iteration 2 (Material & Tiefe) → Iteration 3 (Kinetik & Kohärenz) abgeschlossen                | LLM           |
| L1     | Dry-Run & Kosten-Governance vor API-Call             | 🟢 Executed | Prompt-Zusammensetzung und Budget via CLI verifizieren (~0.12 USD)                                                      | LLM           |
| L2     | API-Generierung des 16:9 Artworks (`1536x1024`)      | 🟢 Executed | Erfolgreich generiert: `2026-09-03_hero-dice-quantum-gold_v001.png` (2.03 MB, SHA-256: `65b696a9...`, 36.3s, ~0.12 USD) | LLM           |
| L3     | Visuelle Integritätsprüfung & Bereitstellung         | 🟢 Executed | Bilddatei analysiert, Metadaten im Index verifiziert, Jan zur Freigabe vorgelegt                                        | LLM           |

## 2 — Drei Iterationsstufen (Workflow-Jan Iteration 1–3)

### Iteration 1: Grundlagen-Komposition (Baseline)

- **Fokus:** Zwei Würfel im Flug, kinetische Schweife, dunkler Boden.
- **Entwurf:** `Two luxury casino dice tumbling mid-air with glowing trails, glossy dark floor with perspective grid, warm golden lights`.
- **Kritik / Schwachstelle:** Zu generisch; fehlende Materialpräzision für Obsidian und Champagner-Gold; Lichtquelle nicht klar als warmes Bernstein definiert.

### Iteration 2: Materialität & Tiefenraum (Material & Chiaroscuro)

- **Fokus:** Einarbeitung des Obsidian & Gold Design-Systems (`#0B0E14`, `#D4AF37`), Champagner-Gold und warmer Bernstein.
- **Entwurf:** `Two cinematic luxury dice crafted from polished obsidian smoked glass with beveled warm champagne gold edges (#D4AF37), tumbling in mid-air above a reflective obsidian black grid floor, leaving curved golden motion light trails and sparkling amber embers in the air`.
- **Kritik / Schwachstelle:** Noch unzureichende Tiefenschärfe (Bokeh) im Hintergrund; Gefahr, dass die Kantenbeleuchtung gegenüber dem Hintergrund abflacht.

### Iteration 3: Finaler Meister-Prompt (Weltklasse Kinetik & Licht A)

- **Fokus:** Maximale Raumtiefe, physikalisch plausible Lichtbrechung, kinetische Langzeitbelichtung, spiegelnder Cyber-Gitterboden, warmes Champagner-Gold und bernsteinfarbener Glanz.
- **Finaler Prompt:**
  > `Two cinematic luxury casino dice tumbling mid-air in high-speed motion, crafted from dark translucent obsidian smoked glass with polished metallic champagne gold beveled frames (#D4AF37) and warm glowing gold pips, sweeping curved golden motion-blur light trails and sparkling amber embers tracing their flight path, hovering over a mirror-reflective pitch-black obsidian floor with a fine glowing gold perspective grid receding into the distance, volumetric warm amber rim lighting, subtle golden bokeh particles floating in the dark atmosphere, epic cinematic depth of field, masterpiece 3D render`

## 3 — Ziel & Scope

- **Im Scope:**
  - Asset-Name: `hero-dice-quantum-gold`
  - Kategorie: `hero`
  - Format: `1536x1024` (16:9 Widescreen, perfekt abgestimmt auf den 16:10 Container der `ElevatedGameCard`)
  - Qualität: `medium`
  - Kosten: ~0.12 USD (gedeckt durch 20 USD Monatslimit)
  - Visuelle Präsentation an Jan **vor** jeglicher Integration in Produktivdateien.
- **Nicht im Scope:**
  - Modifikation von Spielregeln, Wallet, Backend oder vorzeitiges Überschreiben von `config.ts`.

## 4 — Risiken & Gegenmaßnahmen (Selbstprüfung vor Execution)

1. **Format-Diskrepanz:** Vorheriges Bild war 1:1 Quadrat. Neues Bild ist 16:9 (`1536x1024`), füllt die 16:10 Karte nahtlos ohne Beschneidung oder "schwarze Balken" aus.
2. **Kosten-Gate:** Erfordert explizites `--yes`. Spend-Ledger wird atomar aktualisiert.
3. **Keine Direkt-Einbindung:** Das Bild wird erst nach Jans visueller Begutachtung im Chat verknüpft.

## 5 — Money-Pfad & Security-Review

- **Money-Pfad:** Nein (Reine Design-Generierung).
- **Security-Review:** Nein.
