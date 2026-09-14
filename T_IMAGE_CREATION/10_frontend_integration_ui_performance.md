# 10 — Frontend-Integration, Responsive Rendering & UI-Performance

> **Status:** 🟢 Solide / Optimierungsbereit · **Stand:** 2026-09-14 · **Owner:** Jan / LLM  
> **Worldmap-Kontext:** T_IMAGE_CREATION / Subkategorie 10  
> **Code-Referenz:** [`src/lib/design-assets/client.ts`](../src/lib/design-assets/client.ts)  
> **Fokus:** Nahtlose, performante Einbindung generierter Visuals in Next.js 16, Vermeidung von Layout-Shifts (CLS = 0) und blitzschnelle Ladezeiten.

---

## 1 — Executive Summary & Status Quo

Der aktuelle Reifegrad im Bereich **Frontend-Integration, Responsive Rendering & UI-Performance** liegt bei **Top 40 % (Solide / Gute Standards mit Luft nach oben)**.

Das Frontend verfügt über die Hilfskomponente `DesignAssetImage` und den Resolver `getDesignAsset()`, die den `asset-index.json` nutzen.
Dennoch gibt es typische Optimierungslücken:

- Generierte Master-PNGs haben oft Dateigrößen von 1.5 bis 2.5 MB. Werden diese unkomprimiert geladen, leidet die LCP (Largest Contentful Paint) auf mobilen Geräten massiv.
- Bild-Container ohne explizite Breiten- und Höhenattribute erzeugen beim Laden Ruckler (Cumulative Layout Shift, CLS).
- Übergänge zwischen Ladezustand und fertigem Bild wirken teils abrupt.

**Zielzustand (Top 3 %):** Automatisierte WebP/AVIF-Generierung bei jedem Asset-Lauf, integrierter "Obsidian & Gold Shimmer"-Platzhalter und garantierter CLS von 0.000 auf allen Spielseiten.

---

## 2 — Dekomposition in 7 Sub-Facetten

|   #    | Sub-Facette                                | Gewicht  | Aktuelles Niveau | Status Quo & Schwachstelle                                                              | Bottleneck? | Action Item / Zielzustand                                                            |
| :----: | :----------------------------------------- | :------: | :--------------: | :-------------------------------------------------------------------------------------- | :---------: | :----------------------------------------------------------------------------------- |
| **01** | **WebP / AVIF-Kompression**                | **25 %** |     Top 45 %     | Viele PNGs werden direkt im Browser ausgeliefert; unnötiger Bandbreitenverbrauch        |    Nein     | Automatischer WebP-Buildhook reduziert Bildgrößen um durchschnittlich 70–85 %        |
| **02** | **Zero Layout-Shift (CLS = 0.000)**        | **20 %** |     Top 35 %     | Vereinzelte Container definieren keine feste Aspect-Ratio-Box                           |    Nein     | Zwang zu `aspect-ratio` oder festen `width`/`height`-Attributen via ESLint-Rule      |
| **03** | **Obsidian & Gold Shimmer-Placeholder**    | **18 %** |     Top 30 %     | `DesignAssetImage` besitzt Shimmer, aber nicht alle UI-Stellen nutzen ihn einheitlich   |    Nein     | Zentralen Skeleton-Placeholder mit Gold-Glanz-Verlauf standardisieren                |
| **04** | **LCP-Optimierung für Hero-Banner**        | **15 %** |     Top 40 %     | Hero-Bilder auf der Startseite und in `/games/*` laden teils ohne `priority`-Flag       |    Nein     | `priority={true}` für Above-the-fold-Hero-Banner verbindlich vorschreiben            |
| **05** | **Null-404-Netzwerk-Garantie**             | **10 %** |     Top 20 %     | Bei fehlendem Asset wird ein eleganter Fallback gerendert statt ein kaputtes Bildsymbol |    Nein     | Bestehenden Fallback-Mechanismus in `client.ts` beibehalten                          |
| **06** | **Responsive Srcset- & DpR-Unterstützung** | **7 %**  |     Top 55 %     | Mobile Geräte laden dieselben großen Bilder wie 4K-Desktop-Monitore                     |    Nein     | Generierung von `srcset` mit 1x/2x/3x Bildvarianten über Next.js Image-Optimizer     |
| **07** | **CSS-Glow- & Blend-Mode-Filter**          | **5 %**  |     Top 50 %     | Bildeffekte (Gold-Leuchten) sind oft fest im Pixelbild statt dynamisch via CSS gelöst   |    Nein     | Trennung: Reines Motiv als WebP, Glow dynamisch via `drop-shadow` / `mix-blend-mode` |

---

## 3 — Die Performance-Formel für Casino-Assets

```tsx
// Ideale Einbindung in Spielbühnen und Lobbys
<DesignAssetImage
  name="crash-jet-quantum-gold"
  alt="Quantum Crash Jet"
  className="aspect-video h-auto w-full object-contain"
  priority={isHero}
  placeholder="shimmer"
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

### Die 3 Kernvorteile:

1. **Bandbreite:** Statt 2.4 MB PNG lädt der Client ein 180 KB WebP.
2. **Stabilität:** Der Browser reserviert den Platz vorab -> Kein Springen des Inhalts beim Laden (CLS = 0).
3. **Optik:** Während des Ladens pulsiert ein edler, dunkler Gold-Schimmer (`#0B0E14` mit `#D4AF37`-Verlauf).

---

## 4 — 5-Stufen-DoD für Top 1–3 % Reifegrad

1. [ ] **LCP < 1.2s:** Alle Spielbühnen-Banner erreichen im Lighthouse-Test einen LCP-Wert von unter 1.2 Sekunden auf schnellen Verbindungen.
2. [ ] **CLS = 0.000:** Null messbare Layout-Verschiebung beim Laden von Design-Assets.
3. [ ] **Automatisierte WebP-Pipeline:** Jedes neu generierte PNG wird automatisch durch Sharp verlustfrei komprimiert.

---

## 5 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- Asset-Lifecycle: [`09_asset_lifecycle_versionierung_rollback.md`](./09_asset_lifecycle_versionierung_rollback.md)
- Design-System SOP: [`xx_sop/04_design_system_ui.md`](../xx_sop/04_design_system_ui.md)
