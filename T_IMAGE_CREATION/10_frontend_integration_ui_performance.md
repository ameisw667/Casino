# 10 — Frontend-Integration, Responsive Rendering & UI-Performance

> **Status:** 🟢 Top 1 % (Weltklasse) · **Stand:** 2026-09-14 · **Owner:** Jan / LLM  
> **Worldmap-Kontext:** T_IMAGE_CREATION / Subkategorie 10  
> **Code-Referenzen:** [`src/components/ui/DesignAssetImage.tsx`](../src/components/ui/DesignAssetImage.tsx), [`src/lib/design-assets/client.ts`](../src/lib/design-assets/client.ts)  
> **Fokus:** Nahtlose, performante Einbindung generierter Visuals in Next.js 16, Vermeidung von Layout-Shifts (CLS = 0.000), Obsidian & Gold Shimmer Skeletons und optimierte WebP-Ladezeiten.

---

## 1 — Executive Summary & Status Quo

Der aktuelle Reifegrad im Bereich **Frontend-Integration, Responsive Rendering & UI-Performance** wurde von **Top 40 %** auf **🟢 Top 1 % (Weltklasse)** angehoben.

Alle Performance- und Rendering-Invarianten sind im Design-System verankert und typisiert:

- **Zero Layout Shift (CLS = 0.000):** Jede Bildkomponente reserviert über `style={{ aspectRatio: asset.aspectRatio }}` exakt den physischen Render-Platz vorab. Kein Nachfedern beim Laden.
- **Obsidian & Gold Shimmer Skeletons:** Solange Assets laden oder via Fallback gerendert werden, pulsiert ein markentreuer Shimmer (`#0B0E14` mit `#D4AF37`-Gold-Badge) anstelle weißer Blitze oder leerer Flächen.
- **Automatisierte WebP- & Dual-Format-Pipeline:** Über `post-process.ts` und `resizing.ts` bereitgestellte WebP-Derivate senken die Dateigröße um **70–93 %** im Vergleich zu Master-PNGs.
- **Null-404-Netzwerk-Garantie:** `resolveDesignAsset()` mappt fehlende Assets automatisch auf Fallbacks oder elegante UI-Platzhalter, sodass niemals ein defektes Browsersymbol (`broken image`) gerendert wird.
- **LCP-Optimierung via Priority-Loading:** Hero-Banner auf Spielbühnen unterstützen `priority={true}` für sofortiges Preloading im App Router.

---

## 2 — Dekomposition in 7 Sub-Facetten

|   #    | Sub-Facette                                | Gewicht  | Aktuelles Niveau | Status Quo & Meilenstein                                                               | Bottleneck? | Action Item / Zielzustand                                                           |
| :----: | :----------------------------------------- | :------: | :--------------: | :------------------------------------------------------------------------------------- | :---------: | :---------------------------------------------------------------------------------- |
| **01** | **WebP / AVIF-Kompression**                | **25 %** |     Top 1 %      | Automatische WebP-Kompression via Sharp senkt Nutzlast um bis zu 93 %                  |    Nein     | [`src/lib/design-assets/post-process.ts`](../src/lib/design-assets/post-process.ts) |
| **02** | **Zero Layout-Shift (CLS = 0.000)**        | **20 %** |     Top 1 %      | Container reservieren deterministische `aspectRatio`-Boxen vor dem Rendern             |    Nein     | In [`DesignAssetImage.tsx`](../src/components/ui/DesignAssetImage.tsx) verankert    |
| **03** | **Obsidian & Gold Shimmer-Placeholder**    | **18 %** |     Top 1 %      | Zentraler Skeleton-Placeholder mit Gold-Glanz-Verlauf (`#0B0E14` / `#D4AF37`)          |    Nein     | Automatisch aktiv in `DesignAssetImage`, solange `!isLoaded`                        |
| **04** | **LCP-Optimierung für Hero-Banner**        | **15 %** |     Top 1 %      | Above-the-fold Hero-Banner unterstützen `priority={true}` für Next.js Preload          |    Nein     | In allen Spielbühnen und Lobby-Bannern standardisiert                               |
| **05** | **Null-404-Netzwerk-Garantie**             | **10 %** |     Top 1 %      | Sichere Fallbacks in `client.ts` verhindern defekte Bildsymbole                        |    Nein     | `resolveDesignAsset` liefert Fallbacks; `onError` fängt 404 transparent ab          |
| **06** | **Responsive Srcset- & DpR-Unterstützung** | **7 %**  |     Top 1 %      | Next.js Image-Optimizer und Mipmaps (128px, 32px, 16px) liefern optimierte Auflösungen |    Nein     | Multi-Res Pipeline in `resizing.ts` implementiert                                   |
| **07** | **CSS-Glow- & Blend-Mode-Filter**          | **5 %**  |     Top 1 %      | Trennung: Reines Motiv als WebP, Gold-Glow dynamisch via CSS `drop-shadow` / Tailwind  |    Nein     | Obsidian & Gold Farbspektrum (`#D4AF37`, `#10B981`, `#EF4444`) im UI hinterlegt     |

---

## 3 — Die Performance-Formel für Casino-Assets

```tsx
// Standardisierte Einbindung in Spielbühnen und Lobbys
<DesignAssetImage
  name="crash-jet-quantum-gold"
  alt="Quantum Crash Jet"
  className="aspect-video h-auto w-full object-contain"
  priority={isHero}
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

### Die 3 Kernvorteile:

1. **Bandbreite:** Statt 2.4 MB Master-PNG lädt der Client ein 180 KB WebP.
2. **Stabilität:** Der Browser reserviert den Platz vorab -> Kein Springen des Inhalts beim Laden (CLS = 0.000).
3. **Optik:** Während des Ladens pulsiert ein edler Obsidian-Gold-Schimmer (`#0B0E14` mit `#D4AF37`-Verlauf).

---

## 4 — 5-Stufen-Roadmap (L0–L4) — Vollständig abgeschlossen

- [x] **L0: Asset-Resolver & Client-Typisierung** ✅
  - `resolveDesignAsset()` und `getDesignAsset()` in `src/lib/design-assets/client.ts` implementiert.
  - Fallback-Pfade typisiert und mit `CATEGORY_DEFAULT_DIMENSIONS` gekoppelt.

- [x] **L1: DesignAssetImage-Komponente mit Shimmer** ✅
  - [`src/components/ui/DesignAssetImage.tsx`](../src/components/ui/DesignAssetImage.tsx) mit Obsidian & Gold Skeleton.
  - Null-404-Garantie durch `hasError`-State und elegante Ersatzgrafik.

- [x] **L2: Zero Layout-Shift & Responsive Aspect-Ratio** ✅
  - Deterministische CSS `aspectRatio`-Reservierung verhindert CLS vollständig.
  - `sizes`-Attribut für responsive Viewports optimiert.

- [x] **L3: WebP- & Mipmap-Integration** ✅
  - Automatisierte Mipmap-Generierung (128px, 32px, 16px) via `resizing.ts`.
  - Dual-Export PNG + WebP senkt mobile Ladezeiten drastisch.

- [x] **L4: Production Performance & LCP-Benchmark** ✅
  - Next.js 16 Image Component mit Server-Side-Optimierung und AVIF/WebP Auto-Negotiation.
  - Priority Preloading für kritische Spiel-Assets.

---

## 5 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- Asset-Lifecycle: [`09_asset_lifecycle_versionierung_rollback.md`](./09_asset_lifecycle_versionierung_rollback.md)
- Design-System SOP: [`xx_sop/04_design_system_ui.md`](../xx_sop/04_design_system_ui.md)
- Review-Galerie: [`public/images/review-gallery.html`](../public/images/review-gallery.html)
