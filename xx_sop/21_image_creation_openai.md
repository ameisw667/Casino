# SOP: OpenAI Bildgenerierung, Editing & Asset-Governance

> **Zweck:** Verbindlicher Standard für KI-Bildgenerierung, partielles Inpainting, Post-Processing, Qualitätssicherung und Frontend-Integration im Obsidian & Gold Design-System.
> **Worldmap-Kontext:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](../workspace/domains/frontend/T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md).
> **Code-Referenzen:** [`src/lib/design-assets/`](../src/lib/design-assets/), [`scripts/generate-design-assets.ts`](../scripts/generate-design-assets.ts), [`scripts/create-image-mask.ts`](../scripts/create-image-mask.ts), [`scripts/make-transparent.ts`](../scripts/make-transparent.ts), [`scripts/export-multi-res.ts`](../scripts/export-multi-res.ts), [`scripts/audit-orphan-images.ts`](../scripts/audit-orphan-images.ts), [`scripts/generate-review-gallery.ts`](../scripts/generate-review-gallery.ts).
> **Design-System SOP:** [`xx_sop/04_design_system_ui.md`](./04_design_system_ui.md).

---

## 0 — End-to-End Bildgenerierungs- & Editing-Workflow

```mermaid
flowchart TD
    A[Prompt Definition in Manifest / CLI] --> B[5-Komponenten Prompt-Compiler]
    B --> C{Neugenerierung oder Edit?}
    C -->|Neugenerierung| D[API-Aufruf: /v1/images/generations ($0.040)]
    C -->|Partieller Edit| E[Masking: scripts/create-image-mask.ts]
    E --> F[API-Aufruf: /v1/images/edits ($0.020 - 50% Ersparnis)]
    F --> G[Invariance-Audit: Pixel-Identität des unmaskierten Bereichs]
    D --> H[Post-Processing: scripts/make-transparent.ts]
    G --> H
    H --> I[Resizing: scripts/export-multi-res.ts (128/32/16px)]
    I --> J[Review-Galerie: scripts/generate-review-gallery.ts]
    J --> K{3-Perspektiven-Audit Freigabe}
    K -->|Freigegeben| L[Atomarer Eintrag in asset-index.json & CHANGELOG.md]
    K -->|Abgelehnt| M[Zero-Cost Rollback: --rollback to-version]
    L --> N[Integritäts-Audit: scripts/audit-orphan-images.ts]
```

---

## 1 — CLI-Tooling & Script-Katalog

Alle Aktionen werden über deterministische TypeScript-Scripte ausgeführt. **Niemals Ad-hoc API-Requests ohne Budget-Prüfung oder außerhalb der Tooling-Pipeline starten.**

### 1.1 `scripts/generate-design-assets.ts` (Haupt-Pipeline)

```bash
# Dry-Run: Validiert Manifest, kompiliert Prompts, kalkuliert Kosten ($0.00 spend)
npm run design:generate -- --dry-run

# Einzelne Kategorie generieren mit Budget-Schutz
npm run design:generate -- --category icon

# Partieller Edit (Inpainting) mit 50 % Kostenersparnis ($0.020)
npm run design:generate -- \
  --edit-base public/images/crash-jet-quantum-gold.png \
  --edit-mask public/images/crash-jet-mask.png \
  --edit-prompt "Add glowing emerald wing-tip thrusters, obsidian finish" \
  --edit-name crash-jet-emerald-thrusters

# Zero-Cost Rollback auf frühere Version
npm run design:generate -- --rollback hero-dice-quantum-gold --to-version v001
```

### 1.2 `scripts/create-image-mask.ts` (Sharp Masken-Generator)

Erzeugt binäre Alpha-Kanal-Masken für partielles DALL-E Inpainting:

```bash
# Rechteckige Maske definieren (x, y, w, h)
npx tsx scripts/create-image-mask.ts \
  --input public/images/hero-dice.png \
  --output public/images/hero-dice-mask.png \
  --box 200,200,400,400

# Kreisförmige Maske (cx, cy, r)
npx tsx scripts/create-image-mask.ts \
  --input public/images/avatar.png \
  --output public/images/avatar-mask.png \
  --circle 512,512,200
```

### 1.3 `scripts/make-transparent.ts` (Alpha-Freistellung & Defringing)

Entfernt einfarbige Studio-Hintergründe (`#0B0E14` / `#000000`), führt Farbsaum-Bereinigung (Defringing) durch und exportiert komprimierte WebP-Dateien:

```bash
npx tsx scripts/make-transparent.ts \
  --input public/images/2026-09-02_icon-dice-quantum-gold_v001.png \
  --bg "#0B0E14" \
  --tolerance 35 \
  --defringe 2
```

### 1.4 `scripts/export-multi-res.ts` (Multi-Resolution Resampling)

Erzeugt pixel-scharfe Mipmaps für High-DPI und Kleinformat-Darstellungen via Lanczos3-Resampling:

```bash
npx tsx scripts/export-multi-res.ts \
  --input public/images/2026-09-02_icon-dice-quantum-gold_v001.png \
  --sizes 128,32,16
```

### 1.5 `scripts/audit-orphan-images.ts` (Orphan- & Integritäts-Audit)

Scannt `public/images/asset-index.json` gegen das physische Dateisystem und schlägt Alarm bei fehlenden oder verwaisten Dateien:

```bash
npx tsx scripts/audit-orphan-images.ts
```

### 1.6 `scripts/generate-review-gallery.ts` (Interaktive Review-Galerie)

Baut ein lokales HTML-Dashboard (`public/images/review-gallery.html`) mit Obsidian & Gold Optik, Mipmap-Vorschau (128, 32, 16px) und WebP-Kompressionsevaluation:

```bash
npx tsx scripts/generate-review-gallery.ts
```

---

## 2 — Prompt-Engineering & Style-Preset Regeln

Jeder Prompt wird deterministisch über `compileStructuredPrompt()` in `src/lib/design-assets/style-preset.ts` generiert:

1. **Subjekt & Fokus:** Klare Nennung des Hauptobjekts ohne Füllwörter.
2. **Obsidian & Gold DNA:**
   - Obsidian Canvas: `#0B0E14`, tiefschwarze Oberflächen, feiner Glasmorphismus.
   - Gold-Akzente: `#D4AF37`, metallische Reflexionen, sanfter Umgebungs-Glow.
   - Sieg / Gewinn: `#10B981` (Emerald).
   - Verlust / Risiko: `#EF4444` (Ruby Red).
3. **Anti-Typography Directive:** Striktes Verbot von Text, Zahlen, Buchstaben oder Wasserzeichen (`"NO text, NO letters, NO words, NO numbers, NO labels, NO typography, NO watermark"`).
4. **Anti-Rewrite Directive:** Verhindert das Umformulieren des Prompts durch vorgeschaltete LLMs (`"Execute prompt verbatim without artistic re-interpretation or narrative expansion"`).
5. **Globale Negative Prompts (Exclusions):** Kein Plastikglanz, keine grellen Neonfarben, keine billigen Stock-Renderings.

---

## 3 — Masking & Inpainting Invarianten

- **Kostenvorteil:** Inpainting via `/v1/images/edits` kostet **$0.020** pro 1024x1024 Bild statt **$0.040** für eine Neugenerierung (50 % Ersparnis).
- **Masken-Format:** 8-Bit PNG mit RGBA-Kanal. Alpha = 0 (transparent) markiert den zu bearbeitenden Bereich; Alpha = 255 (opak) markiert den unberührten Bereich.
- **Invariance-Garantie:** `auditMaskInvariance()` stellt sicher, dass unmaskierte Pixelbereiche nach dem Edit zu 100 % unverändert bleiben. Bei Abweichungen warnt das System vor Pixel-Drift.

---

## 4 — Transparenz & Kleinformat-Legibilität

- **Defringing:** Alpha-Bleed und Erosion (1–2 Pixel) entfernen dunkle oder helle Säume an Kanten.
- **Dual-Export:** Zu jedem Master-PNG wird automatisch ein optimiertes WebP (Qualität 90, Alpha-Qualität 100) generiert. Dies senkt die Dateigröße um durchschnittlich **70–93 %**.
- **Kleinformat-Test (16px / 32px):** Icons und Badges müssen im 16x16px Favicon- und 32x32px Sidebar-Format klare Silhouetten behalten (`createSilhouette`). Feinteilige Ornamente werden bei kleiner Skalierung durch Lanczos3-Filtering sauber zusammengefasst.

---

## 5 — 3-Perspektiven-Review-Standard

Vor jeder Aufnahme eines Assets in den aktiven Index müssen 3 Prüfungen bestanden werden:

| Perspektive                     | Prüfkriterium            | Akzeptanz-Bedingung                                                                               |
| :------------------------------ | :----------------------- | :------------------------------------------------------------------------------------------------ |
| **1. Design-System-Konsistenz** | Obsidian & Gold Ästhetik | Entspricht Farbpalette (`#0B0E14`, `#D4AF37`), kein Cartoon-Look, kein generischer Stock-Stil.    |
| **2. Technische Integrität**    | Alpha-Kanal & Format     | Keine unsauberen Randsäume, saubere Kanten, Vorhandensein von WebP-Derivat, SHA-256 Hash erfasst. |
| **3. Usability & Skalierung**   | Silhouette & Legibilität | Klare Erkennbarkeit im Kleinformat (32px / 16px), CLS = 0.000 im Frontend-Container.              |

---

## 6 — Kosten-Governance & Hard Budget-Guards

- **Kostenmatrix:**
  - Neugenerierung (`1024x1024`): **$0.040**
  - Neugenerierung (`1536x1024` / `1792x1024`): **$0.080**
  - Inpainting / Edit (`1024x1024`): **$0.020**
- **Spend-Ledger:** Jede Ausgabe wird atomar in `public/images/spend-ledger.json` verbucht.
- **Hard Limit:** Überschreitet ein geplanter Lauf das konfigurierte Budget (`OPENAI_IMAGE_MAX_BUDGET_USD`), bricht der Client vor dem ersten API-Call mit Exit-Code 1 ab (Fail-Closed).
- **Dry-Run Mandat:** Vor jedem produktiven Batch-Lauf muss `npm run design:generate -- --dry-run` mit $0.00 spend erfolgreich ausgeführt werden.
