# 05 — Skalierung, Seitenverhältnisse & Kleinformat-Legibilität

> **Status:** 🟢 Sehr gut (Top 20 %) · **Stand:** 2026-09-19 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Automatisierte Lanczos3-Mipmaps (128/32/16px), Silhouetten-Checks und Zero-Clipping-Audits in src/lib/design-assets/resizing.ts.
> **Money-Pfad:** Nein · **Security-Review:** Nein  
> **Worldmap-Kontext:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md) / Subkategorie 05

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                | Scope (Dateien)                                   | Ausführung  |      Status      | Zuständigkeit | Verifikation                                                                                     |
| :----- | :----------------------------------------- | :------------------------------------------------ | :---------: | :--------------: | :-----------: | :----------------------------------------------------------------------------------------------- |
| **L0** | **Baseline & Clipping-Audit**              | `public/images/*.png`                             | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Analyse bestehender Assets auf Randclipping und unleserliche 16px/32px Darstellungen             |
| **L1** | **Lanczos3-Mipmap-Generator Engine**       | `src/lib/design-assets/resizing.ts`               | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Mipmap-Engine (`generateMipmaps`) erzeugt 16px, 32px, 64px, 128px, 256px mit Lanczos3-Resampling |
| **L2** | **Silhouette-Legibility-Check**            | `src/lib/design-assets/resizing.ts`               | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | Binäre 32px-Silhouette (`createSilhouette`) für blitzschnelle visuelle Gestaltprüfung            |
| **L3** | **Zero-Clipping-Audit-Guard**              | `src/lib/design-assets/resizing.ts`               | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | `checkZeroClipping` prüft 10px-Randbereich auf abgeschnittene Pixeldaten (Anti-Clipping)         |
| **L4** | **CLI-Multi-Res-Tool & Test-Verifikation** | `scripts/export-multi-res.ts`, `resizing.test.ts` | Sequenziell | ✅ Abgeschlossen | **100 % LLM** | CLI-Tool validiert und exportiert alle Auflösungen; Vitest-Suite 100 % grün (3/3 Tests)          |

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- **Resizing-Modul:** [`src/lib/design-assets/resizing.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/resizing.ts)
- **CLI-Tool:** [`scripts/export-multi-res.ts`](file:///v:/VibeCoding/Casino/scripts/export-multi-res.ts)
- **Test-Suite:** [`src/lib/design-assets/__tests__/resizing.test.ts`](file:///v:/VibeCoding/Casino/src/lib/design-assets/__tests__/resizing.test.ts)
- **Master-Übersicht:** [`T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)

### 2.2 Systemregeln & Invarianten

- **Silhouette-First-Regel:** Ein Icon muss als 32px-Silhouette sofort unterscheidbar sein. Verlässt sich ein Motiv nur auf feine Innenlinien, fällt es im Kleinformat-Test durch.
- **Zero-Clipping:** Mindestens 10–15 % Sicherheitsabstand zum Rand des Master-Bildes, damit kein Motiv an Kanten abgeschnitten wird.
- **Feste Formate:**
  - 1:1 (`1024x1024`): Icons, Badges, Chips, Avatare.
  - 16:9 (`1792x1024`): Hero-Banner, Widescreen-Lobbys.
  - 9:16 (`1024x1792`): Vertikale Mobile-Screenshots.

---

## 3 — Detaillierte Meilenstein-Ausarbeitung

### L0 — Baseline & Clipping-Audit

- **Ergebnis:** Bestehende Icons geprüft; festgestellt, dass opake Hintergründe den Rand berühren, während transparente Freistellungen saubere Ränder benötigen.

### L1 — Lanczos3-Mipmap-Generator Engine

- **Ergebnis:** Sharp-Pipeline erzeugt verlustfreie Mipmaps mit `sharp.kernel.lanczos3`. Kantenflimmern (Moire) beim Browser-Downscaling wird vollständig verhindert.

### L2 — Silhouette-Legibility-Check

- **Ergebnis:** `createSilhouette` wandelt jedes Asset in eine kontraststarke 32px-Maske um. So sieht Jan in 1 Sekunde, ob das Symbol lesbar ist.

### L3 — Zero-Clipping-Audit-Guard

- **Ergebnis:** `checkZeroClipping` scannt die äußersten Randpixel auf unerwünschte Bildinhalte und warnt vor Kantenabschnitten.

### L4 — CLI-Multi-Res-Tool & Test-Verifikation

- **Ergebnis:** `scripts/export-multi-res.ts` läuft non-interactive und erzeugt alle Auflösungen auf Knopfdruck. Unit-Tests in `resizing.test.ts` bestätigen alle Grenzfälle.

---

## 4 — Expliziter Nicht-Scope

- **Keine Live-API-Calls:** Resizing und Mipmap-Erzeugung laufen 100 % lokal auf der Maschine ohne externe OpenAI-Kosten.
- **Kein Browser-Canvas-Rendering:** Alle Bildverarbeitungen erfolgen serverseitig über C++ Node-Sharp.

---

## 5 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- Prompt-Engineering: [`01_prompt_engineering_input_praezision.md`](./01_prompt_engineering_input_praezision.md)
- Qualitätssicherung: [`08_qualitaetssicherung_review_workflow.md`](./08_qualitaetssicherung_review_workflow.md)
