# 02 — Bild-Editing, Inpainting & Partielle Modifikation

> **Status:** 🟡 Eingeschränkt (Top 40 %) · **Stand:** 2026-09-19 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Sharp-Alpha-Masken und CLI-Integration für partielle Edits. Nächster Schritt für Top 1–5 %: Freihand-Canvas & neuronale SAM-Segmentierung; DALL-E 2 Modell-Restriktion beachten.
> **Money-Pfad:** Nein · **Security-Review:** Nein  
> **Worldmap-Kontext:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md) / Subkategorie 02

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                               | Scope (Dateien)                                                    | Ausführung  |      Status      | Zuständigkeit | Verifikation                                                                       |
| :----- | :---------------------------------------- | :----------------------------------------------------------------- | :---------: | :--------------: | :-----------: | :--------------------------------------------------------------------------------- |
| **L0** | **Baseline & API-Verifikation**           | `src/lib/design-assets/openai-image-client.ts`                     | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Endpoint `/v1/images/edits` aus Sprint 1 verifiziert und testbar                   |
| **L1** | **Sharp-Masken-Generator Engine**         | `scripts/create-image-mask.ts`, `src/lib/design-assets/masking.ts` | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Erzeugung von Alpha-PNGs (Box, Kreis, Feathering 2px) mit pixelgenauen Dimensionen |
| **L2** | **CLI-Integration & Pre-Flight-Guard**    | `scripts/generate-design-assets.ts`                                | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Flags `--edit-base`, `--edit-mask`, `--edit-prompt` implementiert & validiert      |
| **L3** | **Pixel-Invarianz-Test (Zero Mutation)**  | `src/lib/design-assets/__tests__/inpainting-invariance.test.ts`    | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Automatisierter Nachweis: 100 % der opaken Zonen bleiben unverändert (4/4 Tests)   |
| **L4** | **Lifecycle-, Index- & Rollback-Härtung** | `src/lib/design-assets/lifecycle.ts`, `asset-index.ts`             | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Version-Bump bei Edits mit atomarer Speicherung und Spend-Ledger-Buchung           |

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- **API-Client:** [`src/lib/design-assets/openai-image-client.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/openai-image-client.ts) (`editImageWithMeta`)
- **CLI-Tool:** [`scripts/generate-design-assets.ts`](file:///v:/VibeCoding/Casino/scripts/generate-design-assets.ts)
- **Kosten-Guard:** [`src/lib/design-assets/cost-guard.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/cost-guard.ts) (`DEFAULT_EDIT_PRICING_TABLE`, $0.020/Call)
- **Typen:** [`src/lib/design-assets/types.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/types.ts) (`ImageEditRequest`, `EditResponsePayload`)
- **Master-Übersicht:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)

### 2.2 Systemregeln & Invarianten

- **Zero Collateral Mutation:** Die Maske bestimmt exklusiv, welche Pixel neu gezeichnet werden dürfen (`alpha = 0`). Alle Pixel mit `alpha = 255` müssen unberührt bleiben.
- **Formatrestriktion der API:** OpenAI `/v1/images/edits` erfordert strikt quadratische PNGs (1024×1024, 512×512, 256×256) kleiner als 4 MB mit identischen Dimensionen für Bild und Maske.
- **Kosten-Invariante:** Inpainting kostet $0.020 (50 % Ersparnis gegenüber $0.040 Neu-Generierung). Kein Call ohne `--yes`.

---

## 3 — Detaillierte Meilenstein-Ausarbeitung

### L0 — Baseline & API-Verifikation

- **Ziel:** Bestätigung der Schnittstellen-Bereitschaft von `editImageWithMeta` aus Sprint 1.
- **Verifikation:** `npm test src/lib/design-assets/__tests__/openai-image-client.test.ts` (alle 14 Tests grün).

### L1 — Sharp-Masken-Generator Engine

- **Ziel:** Bereitstellung von Hilfsfunktionen zur schnellen Erzeugung von Alpha-Masken ohne Grafikprogramm.
- **Spezifikation (`src/lib/design-assets/masking.ts`):**
  - `createBoxMask(width, height, box: { x, y, w, h }, featherPx?: number): Promise<Buffer>`
  - `createCircleMask(width, height, circle: { cx, cy, r }, featherPx?: number): Promise<Buffer>`
  - Transparenter Ausschnitt (`alpha = 0`) = Bearbeitungszone.
  - Opake Umgebung (`alpha = 255`) = Geschützte Zone.
  - 1–2px Gaußsches Feathering an den Übergängen verhindert harte Schnittnähte.
- **CLI-Helper:** `scripts/create-image-mask.ts --image <path> --box "x,y,w,h" --output <path>`.
- **Verifikation:** `npm run typecheck` Exit 0.

### L2 — CLI-Integration & Pre-Flight-Guard

- **Ziel:** Nahtlose Erweiterung des bestehenden Tools `scripts/generate-design-assets.ts`.
- **Spezifikation:**
  - Neue CLI-Flags via `parseArgs`:
    - `--edit-base`: Pfad zum bestehenden Master-Bild in `public/images/`.
    - `--edit-mask`: Pfad zur Alpha-Maske (optional, wenn `--edit-box` genutzt wird).
    - `--edit-box`: Geometrische Koordinaten (z. B. `"256,256,512,512"`), erzeugt Maske on-the-fly.
    - `--edit-prompt`: Spezifischer Inpainting-Prompt (nur das maskierte Detail beschreiben).
  - Pre-Flight-Validierung: Prüft, ob Master-Bild existiert, quadratisch ist und Bild/Maske exakt dieselben Abmessungen haben.
- **Verifikation:** `npx tsx scripts/generate-design-assets.ts --dry-run --edit-base public/images/test.png --edit-prompt "turbine"`.

### L3 — Pixel-Invarianz-Test (Zero Mutation)

- **Ziel:** Automatisierter mathematischer Beweis, dass unmaskierte Zonen nicht verändert werden.
- **Spezifikation:**
  - Test erzeugt gemockten Response und vergleicht das Originalbild mit dem Ergebnis in den opaken Zonen.
  - Differenz-Toleranz in geschützten Zonen: **0.00 %**.
- **Verifikationsbefehl:** `npm test src/lib/design-assets/__tests__/inpainting-invariance.test.ts`.

### L4 — Lifecycle-, Index- & Rollback-Härtung

- **Ziel:** Saubere Protokollierung editierter Bilder.
- **Spezifikation:**
  - Benennung: `YYYY-MM-DD_<name>_v<NNN>_edit.png`.
  - Eintrag in `asset-index.json` referenziert die editierte Version als aktiv, behält aber die Originalversion für `--rollback`.
  - `spend-ledger.json` verbucht exakt $0.020.
- **Verifikation:** Rollback-Test: `npm run design:generate -- --rollback <name> --to-version v001`.

---

## 4 — Expliziter Nicht-Scope

- **Keine eigenmächtige Rekonstruktion:** Der Inpainting-Runner darf niemals unmaskierte Pixel überschreiben.
- **Keine UI-Änderungen:** Next.js-Komponenten müssen nicht angepasst werden, da `asset-index.json` die Pfade transparent auflöst.

---

## 5 — Fail-Closed & Rollback

- **Abbruchkriterium:** Stimmen die Abmessungen von Maske und Bild nicht überein (z. B. 1024×1024 vs. 1792×1024), bricht der Runner sofort mit Exit-Code 1 ab, **bevor** ein API-Call abgesetzt wird.
- **Rollback:** `npm run design:generate -- --rollback <name> --to-version <previous_version>`.

---

## 6 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- API-Client: [`06_api_client_architektur_endpoints.md`](./06_api_client_architektur_endpoints.md)
- Qualitätssicherung & Diff-Workflow: [`08_qualitaetssicherung_review_workflow.md`](./08_qualitaetssicherung_review_workflow.md)
