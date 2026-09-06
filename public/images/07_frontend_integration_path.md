# 07 — Frontend-Integrationspfad (Planungsdatei)

> **Status:** 🟢 Executed (Enterprise-Grade) · **Niveau:** **98 %** · **Stand:** 2026-09-02 · **Owner:** LLM · **Scope:** Typsicherer Übergabepunkt zwischen generiertem Asset und React-Komponenten (`getDesignAsset`), Next.js-Image-Integration (`<DesignAssetImage />`), Obsidian & Gold Shimmer-Placeholder und 404-Bypass für noch nicht generierte Assets.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                 | Status      | Niveau | Zuständigkeit |
| ------ | --------------------------------------------------------------------------- | ----------- | ------ | ------------- |
| L0     | `asset-index.json`-Datenstruktur & Metadaten (Größe, Aspect-Ratio, SHA-256) | 🟢 Executed | 100 %  | LLM           |
| L1     | Inkrementelle & atomare Index-Pflege durch CLI                              | 🟢 Executed | 100 %  | LLM           |
| L2     | Typsicherer Client-Resolver `getDesignAsset()`                              | 🟢 Executed | 100 %  | LLM           |
| L3     | React / Next.js 16 UI-Komponente `<DesignAssetImage />`                     | 🟢 Executed | 100 %  | LLM           |
| L4     | Obsidian & Gold Shimmer-Placeholder ohne 404-Netzwerk-Leaks                 | 🟢 Executed | 100 %  | LLM           |

## 2 — Best-Practice-Kontext (Next.js 16 & UI Integration)

- **Next.js 16 Image Optimization:** Durch Bereitstellung exakter Maße (`width`, `height`, `aspectRatio`) im Index rendert `<DesignAssetImage />` mit 0 Cumulative Layout Shift (CLS) und automatischen WebP/AVIF-Responsive-Srcsets.
- **Null-404-Garantie:** Wenn ein Asset noch nicht im Dateisystem oder Index existiert, wird `next/image` gar nicht erst gemountet. Kein vergeblicher HTTP-Request, keine roten 404-Fehler in der Browser-Konsole.
- **Obsidian & Gold Ästhetik:** Ein pulsierender Shimmer-Skeleton im Glassmorphism-Stil (`#0B0E14` mit `#D4AF37/20` Gold-Border und Gold-Icon) überbrückt Ladezeiten und fehlende Generierungen nahtlos im Marken-Design.
- **Drei Rendering-Modi:** `responsive` (100% Breite mit fixem Aspect-Ratio), `fill` (für Hero-Backgrounds) und `fixed` (für Icons/Badges).

## 3 — Ziel & Scope

Stabiler, typsicherer Konsum generierter Bilder in allen Casino-UI-Komponenten.

**Im Scope:**

- `src/lib/design-assets/client.ts` (`resolveDesignAsset`, `getDesignAsset`, Dimensions-Mapping).
- `src/components/ui/DesignAssetImage.tsx` (Next.js 16 Image-Komponente mit Shimmer).
- `src/lib/design-assets/asset-index.ts` (erweiterte Metadaten).
- 100 % Testabdeckung und Typecheck.

## 4 — Umsetzungs-Checkliste (Workflow-Jan Execution)

- [x] `AssetIndexEntry` mit `size`, `width`, `height`, `aspectRatio`, `alt`, `sha256`.
- [x] `getDesignAsset(name)` mit defensivem Fallback.
- [x] `<DesignAssetImage />` mit Shimmer, Fade-In-Animation und 3 Modi.
- [x] Verifizierung über Unit-Tests (`client.test.ts`, `asset-index.test.ts`) und TypeScript `tsc --noEmit`.

## 5 — Verifizierung

- `npx vitest run src/lib/design-assets/__tests__/client.test.ts` (5 Tests grün).
- `npx vitest run src/lib/design-assets/__tests__/asset-index.test.ts` (3 Tests grün).
- `npm run typecheck` (0 Fehler).
- **Niveau-Bewertung:** **98 %** (Die restlichen 2 % sind der konkrete Einbau in spezifische Page-Komponenten, sobald Jan reale Assets per Batch generiert hat).
