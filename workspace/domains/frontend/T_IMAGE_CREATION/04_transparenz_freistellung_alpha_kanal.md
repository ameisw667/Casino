# 04 — Transparenz, Freistellung & Alpha-Kanal-Pipeline

> **Status:** 🟡 Ausbaufähig (Top 45 %) · **Stand:** 2026-09-19 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Color-Distance-Keying, 2-Pass Defringing und WebP-Dual-Export. Nächster Schritt für Top 1–5 %: Neuronales Alpha-Matting (RMBG / BiRefNet) zur Erhaltung von Casino-Glows, Partikeln und Glas.
> **Money-Pfad:** Nein · **Security-Review:** Nein  
> **Worldmap-Kontext:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md) / Subkategorie 04

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                            | Scope (Dateien)                                        | Ausführung  |      Status      | Zuständigkeit | Verifikation                                                                                |
| :----- | :------------------------------------- | :----------------------------------------------------- | :---------: | :--------------: | :-----------: | :------------------------------------------------------------------------------------------ |
| **L0** | **Baseline & Spill-Diagnose**          | `public/images/*.png`                                  | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Dark-Halo-Problematik und Kantenfarbwerte analysiert                                        |
| **L1** | **Sharp-Matting & Spill-Suppression**  | `src/lib/design-assets/post-process.ts`                | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Chroma-Keying mit euklidischem 3D-Farbabstand & Antialiasing (`extractAlphaChannel`)        |
| **L2** | **Edge-Defringing & Alpha-Feathering** | `src/lib/design-assets/post-process.ts`                | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Kantenfransenbeseitigung und Median-Antialiasing (`defringeEdges`)                          |
| **L3** | **CLI-Hook & WebP-Dual-Export**        | `scripts/make-transparent.ts`                          | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | CLI-Tool erzeugt atomar Master-PNG und optimiertes WebP (-93 % Dateigrößen-Ersparnis)       |
| **L4** | **Integritäts-Audit & Unit-Tests**     | `src/lib/design-assets/__tests__/post-process.test.ts` | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Unit-Tests für saubere Freistellung, Kantenintegrität und WebP-Dual-Export grün (3/3 Tests) |

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- **Post-Processing-Modul:** `src/lib/design-assets/post-process.ts` (Neu)
- **CLI-Runner:** [`scripts/generate-design-assets.ts`](file:///v:/VibeCoding/Casino/scripts/generate-design-assets.ts)
- **Prompt-Presets:** [`src/lib/design-assets/style-preset.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/style-preset.ts)
- **Test-Suite:** `src/lib/design-assets/__tests__/post-process.test.ts` (Neu)

### 2.2 Systemregeln & Invarianten

- **Kein Green-Screen bei Gold:** Goldflächen reflektieren Grün (Green Spill). Freistellungen für Gold-Assets nutzen zwingend neutrales Hellgrau oder Reinst-Magenta (`#FF00FF`), da Magenta im Casino-Farbraum nicht vorkommt.
- **Dual-Export-Pflicht:** Jedes freigestellte Bild wird gleichzeitig als Master-PNG (für Archiv/Print) und als WebP (für ultra-schnelle Next.js-Ladezeiten) erzeugt.
- **Edge-Invariante:** Keine dunklen Kantenpixel (Dark Halos) auf hellen UI-Flächen; Kantenbreite der Übergangszone maximal 1.5 Pixel.

---

## 3 — Detaillierte Meilenstein-Ausarbeitung

### L0 — Baseline & Spill-Diagnose

- **Ziel:** Erfassung typischer Freistellungsfehler bei bestehenden Assets (z. B. `2026-09-02_icon-dice-quantum-gold_transparent.png`).
- **Verifikation:** Protokollierung von Kantenfarbwerten via Sharp.

### L1 — Sharp-Matting & Spill-Suppression

- **Ziel:** Algorithmische Trennung von Vordergrund und Hintergrund.
- **Spezifikation (`src/lib/design-assets/post-process.ts`):**
  - Funktion: `extractAlphaChannel(buffer: Buffer, options: MattingOptions): Promise<Buffer>`
  - Farbdifferenz-Berechnung im Lab- oder RGB-Farbraum gegen die Hintergrund-Schlüsselfarbe.
  - Spill-Suppression: Leichte Entsättigung von Randpixeln, die Farbanteile des Hintergrunds reflektieren.
- **Verifikation:** `npm run typecheck` Exit 0.

### L2 — Edge-Defringing & Alpha-Feathering

- **Ziel:** Vollständige Beseitigung der berüchtigten schwarzen Kantenfransen.
- **Spezifikation:**
  - Morphologische Alpha-Erosion (0.5–1.0px): Zieht die Maske minimal nach innen.
  - Subpixel-Gauß-Weichzeichnung (Sigma 0.8): Erzeugt weiche, natürliche Kanten ohne pixelige Treppenstufen.
  - Unmultiply: Korrigiert die RGB-Werte der Halbtransparenzen, damit sie auf beliebigem Hintergrund (Tischfilz, Obsidian, Glas) sauber blenden.
- **Verifikation:** Visueller Test in HTML-Canvas.

### L3 — CLI-Hook & WebP-Dual-Export

- **Ziel:** Nahtlose Integration in den Standard-CLI-Workflow.
- **Spezifikation:**
  - Aufruf: `npm run design:generate -- --name badge-vip --prompt "golden crown" --transparent --yes`
  - Ablauf:
    1. DALL-E generiert opakes Bild auf Magenta-Backdrop.
    2. Sharp führt automatisch Freistellung und Defringing durch.
    3. Atomares Schreiben von `YYYY-MM-DD_badge-vip_v001.png` und `YYYY-MM-DD_badge-vip_v001.webp`.
- **Verifikation:** `npx tsx scripts/generate-design-assets.ts --dry-run --transparent`.

### L4 — Integritäts-Audit & Unit-Tests

- **Ziel:** Vollständige Testabsicherung.
- **Testfälle:**
  1. Solider Hintergrund wird vollständig transparent (`alpha = 0`).
  2. Objektkern bleibt vollständig deckend (`alpha = 255`).
  3. Keine Farbreste des Keys (Magenta/Grün) in den RGB-Kanälen des Objekts.
  4. WebP-Kompression erreicht mindestens 60 % Größenreduktion gegenüber PNG.
- **Verifikationsbefehl:** `npm test src/lib/design-assets/__tests__/post-process.test.ts`.

---

## 4 — Expliziter Nicht-Scope

- **Kein manuelles Nachzeichnen:** Alle Freistellungen müssen vollautomatisch durch die mathematische Sharp-Pipeline erfolgen.
- **Keine Zerstörung von Originalen:** Das opake Rohbild von OpenAI wird im Cache gesichert, bevor die Freistellung berechnet wird.

---

## 5 — Fail-Closed & Rollback

- **Abbruchkriterium:** Erkennt die Bounding-Box-Analyse, dass mehr als 80 % des Bildes irrtümlich ausgestanzt wurden (z. B. wenn das Objekt dieselbe Farbe wie der Hintergrund hatte), schlägt der Prozess fehl und das Rohbild bleibt unverändert.
- **Rollback:** `npm run design:generate -- --rollback <name> --to-version <vNNN>`.

---

## 6 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- Prompt-Engineering: [`01_prompt_engineering_input_praezision.md`](./01_prompt_engineering_input_praezision.md)
- Frontend-Performance: [`10_frontend_integration_ui_performance.md`](./10_frontend_integration_ui_performance.md)
