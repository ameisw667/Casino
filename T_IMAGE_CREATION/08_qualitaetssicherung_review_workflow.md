# 08 — Qualitätssicherung, Visual Diffing & Review-Workflow

> **Status:** Execution-Ready · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Etablierung eines automatisierten 3-Perspektiven-Review-Gates, lokaler HTML-Diff-Gallerie mit Mipmap-Streifen und Inpainting-Differenz-Heatmap.  
> **Money-Pfad:** Nein · **Security-Review:** Nein  
> **Worldmap-Kontext:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md) / Subkategorie 08

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                               | Scope (Dateien)                          | Ausführung  |   Status   | Zuständigkeit | Verifikation                                                                                         |
| :----- | :---------------------------------------- | :--------------------------------------- | :---------: | :--------: | :-----------: | :--------------------------------------------------------------------------------------------------- |
| **L0** | **Baseline & Review-Prozess-Diagnose**    | `public/images/CHANGELOG.md`             | Sequenziell | 🔴 Geplant | **100 % LLM** | Audit bisheriger Freigaben & Identifikation unbemerkter visueller Regressionen                       |
| **L1** | **Lokaler HTML-Gallery-Generator**        | `scripts/generate-review-gallery.ts`     | Sequenziell | 🔴 Geplant | **100 % LLM** | Automatischer Gallerie-Build nach jedem Batch mit Mipmap-Streifen (1024, 256, 64, 32, 16px)          |
| **L2** | **Differenz-Heatmap-Engine für Edits**    | `src/lib/design-assets/diff-heatmap.ts`  | Sequenziell | 🔴 Geplant | **100 % LLM** | Visueller Pixelmatch-Nachweis: Rot markiert mutierte Pixel; geschützte Zonen müssen 0 Fehler haben   |
| **L3** | **In-Situ-Vorschau in Next.js Dev-Route** | `src/app/testing/asset-preview/page.tsx` | Sequenziell | 🔴 Geplant | **100 % LLM** | Sandbox-Page zur Live-Betrachtung auf Spieltischfilz, Obsidian-Background & Header                   |
| **L4** | **3-Perspektiven-Audit-Gate in CI**       | `scripts/assert-asset-review.ts`         | Sequenziell | 🔴 Geplant | **100 % LLM** | Pre-Commit-Sperre: Verhindert Commit von Bildern ohne WebP oder mit fehlschlagendem Silhouette-Check |

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- **Review-Script:** `scripts/generate-review-gallery.ts` (Neu)
- **Heatmap-Modul:** `src/lib/design-assets/diff-heatmap.ts` (Neu)
- **Preview-Sandbox:** `src/app/testing/asset-preview/page.tsx` (Neu)
- **Design-Asset-Index:** [`public/images/asset-index.json`](file:///v:/VibeCoding/Casino/public/images/asset-index.json)
- **Design-System SOP:** [`xx_sop/04_design_system_ui.md`](file:///v:/VibeCoding/Casino/xx_sop/04_design_system_ui.md)

### 2.2 Systemregeln & Invarianten

- **3/3 Freigabe-Zwang:** Vor Aufnahme in den produktiven `asset-index.json` müssen alle drei Perspektiven (Creative, Tech, Design) grün sein.
- **Beweislast bei Edits:** Bei Inpainting ist zwingend eine Differenz-Heatmap zu erzeugen. Weicht die Differenz in unmaskierten Zonen von 0.00 % ab, schlägt die Validierung fehl.
- **Kleinformat-Bedingung:** Ein Asset wird erst freigegeben, wenn das 32px-Thumbnail im Mipmap-Streifen eine unverwechselbare Silhouette zeigt.

---

## 3 — Detaillierte Meilenstein-Ausarbeitung

### L0 — Baseline & Review-Prozess-Diagnose

- **Ziel:** Erfassung aller im Projekt vorhandenen Visuals und Prüfung auf Mipmap-Tauglichkeit.
- **Aktion:** Analyse, welche bestehenden Icons in der Sidebar oder Header bei 16px–24px verschwimmen.
- **Verifikation:** Erstellung eines tabellarischen Befund-Reports.

### L1 — Lokaler HTML-Gallery-Generator

- **Ziel:** Nach jedem Batch-Lauf (`npm run design:generate`) wird automatisch eine lokale Datei `public/images/review-gallery.html` erzeugt.
- **Spezifikation:**
  - Zeigt jedes generierte Bild nebeneinander in 1024px, 256px, 64px, 32px und 16px.
  - Dunkler Obsidian-Hintergrund (`#0B0E14`) mit Gold-Rahmen (`#D4AF37`).
  - Zeigt Metadaten: Dateiname, Modell, Generierungsdauer, Prompt und Kosten.
- **Verifikation:** `npx tsx scripts/generate-review-gallery.ts` erzeugt gültiges HTML ohne externe CDNs.

### L2 — Differenz-Heatmap-Engine für Edits

- **Ziel:** Automatischer Vorher/Nachher-Bildvergleich.
- **Spezifikation (`src/lib/design-assets/diff-heatmap.ts`):**
  - Nutzt `sharp` und `pixelmatch`.
  - Berechnet `diff.png`:
    - Graustufen-Hintergrund = unveränderte Pixel.
    - Leuchtendes Rot (`#FF0000`) = veränderte Pixel.
    - Grüne Umrandung = Maskengrenze.
  - Prüft, ob rote Pixel außerhalb der transparenten Maskenzone liegen.
- **Verifikation:** `npm run typecheck` Exit 0.

### L3 — In-Situ-Vorschau in Next.js Dev-Route

- **Ziel:** Jan kann Visuals direkt im authentischen UI-Kontext im Browser betrachten.
- **Spezifikation:**
  - Route: `/testing/asset-preview`
  - Schaltet drei Kontexte per Tab um:
    1. **Spielbühne:** Asset auf dem grünen Tischfilz (`felt-table-weave.png`).
    2. **Lobby & Header:** Asset in der Navigationsleiste oder im Bento-Grid.
    3. **Overlay & Modal:** Asset mit Framer Motion Spring-Animation und Gold-Shimmer.
- **Verifikation:** Seite rendert in Next.js ohne Hydration-Mismatches.

### L4 — 3-Perspektiven-Audit-Gate in CI

- **Ziel:** Automatisches Sicherheitsnetz vor Git-Commits.
- **Spezifikation:**
  - `npm run vibe-check` ruft `scripts/assert-asset-review.ts` auf.
  - Schlägt fehl, wenn:
    - Ein PNG > 1.5 MB ohne korrespondierendes WebP eingecheckt wird.
    - Ein Asset im `asset-index.json` referenziert wird, aber physisch fehlt.
- **Verifikationsbefehl:** `npm run vibe-check`.

---

## 4 — Expliziter Nicht-Scope

- **Keine Live-Server-Blockade:** Die Gallerie und Preview-Route sind rein lokale Entwickler-Werkzeuge und nicht in der Production-Route aktiv.
- **Keine automatische Löschung:** Mangelhafte Bilder werden als abgelehnt markiert, aber nicht ungefragt von der Festplatte gelöscht.

---

## 5 — Fail-Closed & Rollback

- **Abbruchkriterium:** Zeigt die Heatmap eines Edits Farbveränderungen in unmaskierten Zonen (> 0.00 % Toleranz), bricht die Freigabe sofort mit roter Warnung ab.
- **Rollback:** `npm run design:generate -- --rollback <name> --to-version <vNNN>`.

---

## 6 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- Inpainting-Plan: [`02_bild_editing_inpainting_modifikation.md`](./02_bild_editing_inpainting_modifikation.md)
- Kleinformat-Legibilität: [`05_skalierung_seitenverhaeltnisse_legibilitaet.md`](./05_skalierung_seitenverhaeltnisse_legibilitaet.md)
