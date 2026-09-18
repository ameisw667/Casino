# React Three Fiber (r3f.docs.pmnd.rs) — Vollständiger Doku-Katalog (22 Einträge)

**Datum:** 6. September 2026
**Status:** Interaktiver Klick-Katalog für UI/UX-Entscheidungen (Bibliotheks-Referenz)
**Referenzquelle:** [r3f.docs.pmnd.rs](https://r3f.docs.pmnd.rs/) (pmndrs — React-Renderer für Three.js, ~32K Stars, MIT)
**Kanonische Projekt-Ablage:** [`docs/frontend/17_r3f_docs_pmnd_rs_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/17_r3f_docs_pmnd_rs_complete_catalog.md)
**Schema-Referenz:** [`docs/frontend/12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md)

> **Link-Basis:** Die 20 Doku-Seiten entsprechen 1:1 den Markdown-Quelldateien im offiziellen Repo `pmndrs/react-three-fiber` (`/docs/**`, via GitHub-API ausgelesen, Stand 6. September 2026). Drei URL-Mappings wurden live verifiziert (HTTP 200): `/api/hooks`, `/tutorials/basic-animations`, `/advanced/pitfalls`. Die Docs-Site ist eine SPA — einzelne Seiten können im Fallback nur den Seitentitel liefern.
> **Version:** R3F v9 (React 19-kompatibel — passt zum Casino-Stack React 19.2).

---

## 1. Quickstart

```bash
npm install three @react-three/fiber   # + @react-three/drei für Helper
# React 19 → Fiber v9; React 18 → Fiber v8
```

```tsx
import { Canvas } from '@react-three/fiber';
// Alle Hooks nur innerhalb von <Canvas> nutzbar (Context-Abhängigkeit).
```

---

## 2. Übersicht der 5 Kategorien (22 Einträge)

1. [Kategorie 1: Getting Started](#kategorie-1-getting-started) _(5 Einträge)_
2. [Kategorie 2: API-Referenz](#kategorie-2-api-referenz) _(7 Einträge)_
3. [Kategorie 3: Advanced](#kategorie-3-advanced) _(2 Einträge)_
4. [Kategorie 4: Tutorials](#kategorie-4-tutorials) _(6 Einträge)_
5. [Kategorie 5: Ökosystem](#kategorie-5-ökosystem) _(2 Einträge)_

---

### Legende zum User-Votum

Identisch zur Legende in [`12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md). Alle Einträge initial neutral, Votum wird von Jan nach manueller Prüfung nachgetragen:

- ⭐⭐⭐ **Absoluter Favorit** _(reserviert)_
- ⭐⭐ **Bestätigt** _(reserviert)_
- ❌ **Abgelehnt** _(reserviert)_
- ⚪ **Katalog-Bestand** (aktueller Status aller Einträge)

---

## Kategorie 1: Getting Started

| Komponente                   | Offizieller Link (r3f.docs.pmnd.rs)                                                                              |     User-Votum     | Casino-Einsatzbereich                      | Technologie                     |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------------- | :----------------: | :----------------------------------------- | :------------------------------ |
| **Introduction**             | [`/getting-started/introduction`](https://r3f.docs.pmnd.rs/getting-started/introduction)                         | ⚪ Katalog-Bestand | Einstieg: React-Renderer-Konzept verstehen | Declaratives Three.js-Rendering |
| **Installation**             | [`/getting-started/installation`](https://r3f.docs.pmnd.rs/getting-started/installation)                         | ⚪ Katalog-Bestand | Setup für Next.js/React 19                 | Paket-Setup (three + fiber)     |
| **Your First Scene**         | [`/getting-started/your-first-scene`](https://r3f.docs.pmnd.rs/getting-started/your-first-scene)                 | ⚪ Katalog-Bestand | Erste 3D-Szene (z. B. Roulette-Kugel-Deko) | Canvas + Meshes                 |
| **Examples**                 | [`/getting-started/examples`](https://r3f.docs.pmnd.rs/getting-started/examples)                                 | ⚪ Katalog-Bestand | Live-Beispiele als Inspirations-Pool       | Beispiel-Sammlung               |
| **Community R3F Components** | [`/getting-started/community-r3f-components`](https://r3f.docs.pmnd.rs/getting-started/community-r3f-components) | ⚪ Katalog-Bestand | Ökosystem-Übersicht (drei, leva, rapier …) | Ökosystem-Liste                 |

---

## Kategorie 2: API-Referenz

| Komponente             | Offizieller Link (r3f.docs.pmnd.rs)                                          |     User-Votum     | Casino-Einsatzbereich                                                                 | Technologie                   |
| :--------------------- | :--------------------------------------------------------------------------- | :----------------: | :------------------------------------------------------------------------------------ | :---------------------------- |
| **Objects**            | [`/api/objects`](https://r3f.docs.pmnd.rs/api/objects)                       | ⚪ Katalog-Bestand | Alle Three.js-Objekte als JSX-Elemente                                                | Extends-basiertes JSX-Mapping |
| **Hooks**              | [`/api/hooks`](https://r3f.docs.pmnd.rs/api/hooks)                           | ⚪ Katalog-Bestand | `useThree`, `useFrame`, `useLoader`, `useGraph` (Render-Loop-Mutation ohne Re-Render) | Context-Hooks (nur in Canvas) |
| **Canvas**             | [`/api/canvas`](https://r3f.docs.pmnd.rs/api/canvas)                         | ⚪ Katalog-Bestand | Canvas-Props (Kamera, Renderer, dpr, Performance)                                     | WebGL-Renderer-Wrapper        |
| **Events**             | [`/api/events`](https://r3f.docs.pmnd.rs/api/events)                         | ⚪ Katalog-Bestand | Pointer-Events auf 3D-Objekten (Karten-Klick)                                         | Raycasting-Event-System       |
| **Additional Exports** | [`/api/additional-exports`](https://r3f.docs.pmnd.rs/api/additional-exports) | ⚪ Katalog-Bestand | `addAfterEffect`, `addEffect`, `flushGlobalEffects`                                   | Render-Loop-Zugriff           |
| **Testing**            | [`/api/testing`](https://r3f.docs.pmnd.rs/api/testing)                       | ⚪ Katalog-Bestand | 3D-Komponenten im Vitest-Setup testen                                                 | Mock-Canvas/Testing-Utils     |
| **TypeScript**         | [`/api/typescript`](https://r3f.docs.pmnd.rs/api/typescript)                 | ⚪ Katalog-Bestand | Typsichere JSX-Intrinsics für Three-Elemente                                          | TS-Typen-Erweiterung          |

---

## Kategorie 3: Advanced

| Komponente              | Offizieller Link (r3f.docs.pmnd.rs)                                                      |     User-Votum     | Casino-Einsatzbereich                                                            | Technologie            |
| :---------------------- | :--------------------------------------------------------------------------------------- | :----------------: | :------------------------------------------------------------------------------- | :--------------------- |
| **Pitfalls**            | [`/advanced/pitfalls`](https://r3f.docs.pmnd.rs/advanced/pitfalls)                       | ⚪ Katalog-Bestand | Performance-Fallen vermeiden (Mutation in `useFrame` statt setState, Instancing) | Performance-Leitfaden  |
| **Scaling Performance** | [`/advanced/scaling-performance`](https://r3f.docs.pmnd.rs/advanced/scaling-performance) | ⚪ Katalog-Bestand | Große Szenen skalieren (Instance-Rendering, Sichtbarkeiten)                      | Optimierung-Strategien |

---

## Kategorie 4: Tutorials

| Komponente               | Offizieller Link (r3f.docs.pmnd.rs)                                                              |     User-Votum     | Casino-Einsatzbereich                        | Technologie                      |
| :----------------------- | :----------------------------------------------------------------------------------------------- | :----------------: | :------------------------------------------- | :------------------------------- |
| **How It Works**         | [`/tutorials/how-it-works`](https://r3f.docs.pmnd.rs/tutorials/how-it-works)                     | ⚪ Katalog-Bestand | Innenleben verstehen (Lernziel des Projekts) | Renderer-/Reconciler-Architektur |
| **Basic Animations**     | [`/tutorials/basic-animations`](https://r3f.docs.pmnd.rs/tutorials/basic-animations)             | ⚪ Katalog-Bestand | Rotationen/Bewegungen im Render-Loop         | `useFrame` + Refs                |
| **Events & Interaction** | [`/tutorials/events-and-interaction`](https://r3f.docs.pmnd.rs/tutorials/events-and-interaction) | ⚪ Katalog-Bestand | Klick-/Hover-Interaktion auf 3D-Objekten     | Raycast-Events                   |
| **Loading Models**       | [`/tutorials/loading-models`](https://r3f.docs.pmnd.rs/tutorials/loading-models)                 | ⚪ Katalog-Bestand | GLTF-Modelle laden (Trophäen, 3D-Assets)     | `useLoader` + Suspense           |
| **Loading Textures**     | [`/tutorials/loading-textures`](https://r3f.docs.pmnd.rs/tutorials/loading-textures)             | ⚪ Katalog-Bestand | Texturen (Gold-Materialien) laden            | Texture-Loader                   |
| **V9 Migration Guide**   | [`/tutorials/v9-migration-guide`](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide)         | ⚪ Katalog-Bestand | Upgrade-Referenz auf React-19-Ära            | Breaking-Changes-Mapping         |

---

## Kategorie 5: Ökosystem

| Komponente                          | Offizieller Link                                                                      |     User-Votum     | Casino-Einsatzbereich                                                                | Technologie            |
| :---------------------------------- | :------------------------------------------------------------------------------------ | :----------------: | :----------------------------------------------------------------------------------- | :--------------------- |
| **drei (Docs)**                     | [`drei.docs.pmnd.rs`](https://drei.docs.pmnd.rs/)                                     | ⚪ Katalog-Bestand | Helper-Sammlung (Kamera-Steuerung, Loader, Umgebungen) — Standard-Ergänzung zu Fiber | Drei-Helper-Bibliothek |
| **GitHub Repo (react-three-fiber)** | [`github.com/pmndrs/react-three-fiber`](https://github.com/pmndrs/react-three-fiber/) | ⚪ Katalog-Bestand | Quelle der Doku, Releases, Issues                                                    | Repository             |
