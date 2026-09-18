# Unicorn Studio (unicorn.studio) — Vollständiger Feature- & Szenen-Katalog (18 Einträge)

**Datum:** 6. September 2026
**Status:** Interaktiver Klick-Katalog für UI/UX-Entscheidungen (Bibliotheks-Referenz)
**Referenzquelle:** [unicorn.studio](https://www.unicorn.studio/) (No-Code-Editor für interaktive WebGL-Szenen, Figma-artige Layer, ~29 kb Runtime)
**Kanonische Projekt-Ablage:** [`docs/frontend/18_unicorn_studio_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/18_unicorn_studio_complete_catalog.md)
**Schema-Referenz:** [`docs/frontend/12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md)

> **Link-Basis:** Doku-Navigation live ausgelesen von `/docs/example-projects/` (Stand 6. September 2026); `getting-started` und `events` wurden zusätzlich live verifiziert (HTTP 200). Modell: Szenen im Editor bauen → als Embed/Self-Hosted-Code exportieren; Laufzeit-Anpassung über benannte Variablen (`data-us-vars`, `scene.setVariable`).
> **Hinweis:** Freemium-Modell (kostenloser Tier mit Wasserzeichen; Abo ohne Wasserzeichen/Pro-Features) — Details auf der Pricing-Seite.

---

## 1. Quickstart

```html
<!-- Drop-in Embed (offizielles Beispiel-Snippet) -->
<div
  style="width:100%;height:400px"
  data-us-project="PROJECT_ID"
  data-us-vars='{"Grain Amount":0.1}'
></div>
<script src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.12/dist/unicornStudio.umd.js"></script>
<script>
  UnicornStudio.init();
</script>
```

---

## 2. Übersicht der 3 Kategorien (18 Einträge)

1. [Kategorie 1: Docs & Guides](#kategorie-1-docs--guides) _(11 Einträge)_
2. [Kategorie 2: Embeddable Example Scenes](#kategorie-2-embeddable-example-scenes) _(3 Einträge)_
3. [Kategorie 3: Agent-Kataloge & Runtime](#kategorie-3-agent-kataloge--runtime) _(4 Einträge)_

---

### Legende zum User-Votum

Identisch zur Legende in [`12_componentry_complete_catalog.md`](file:///v:/VibeCoding/Casino/docs/frontend/12_componentry_complete_catalog.md). Alle Einträge initial neutral, Votum wird von Jan nach manueller Prüfung nachgetragen:

- ⭐⭐⭐ **Absoluter Favorit** _(reserviert)_
- ⭐⭐ **Bestätigt** _(reserviert)_
- ❌ **Abgelehnt** _(reserviert)_
- ⚪ **Katalog-Bestand** (aktueller Status aller Einträge)
- 💰 **Paid** (Abo-Tier erforderlich)

---

## Kategorie 1: Docs & Guides

| Komponente            | Offizieller Link (unicorn.studio)                                            |       User-Votum        | Casino-Einsatzbereich                                              | Technologie                 |
| :-------------------- | :--------------------------------------------------------------------------- | :---------------------: | :----------------------------------------------------------------- | :-------------------------- |
| **Home**              | [`/`](https://www.unicorn.studio/)                                           |   ⚪ Katalog-Bestand    | Einstieg, Live-Demos, Editor-Zugang                                | Produktübersicht            |
| **Getting Started**   | [`/docs/getting-started/`](https://www.unicorn.studio/docs/getting-started/) |   ⚪ Katalog-Bestand    | Kernkonzepte: Layer, **75+ WebGL-Effekte**, Export-Optionen        | Layer-basierte WebGL-Engine |
| **Events**            | [`/docs/events/`](https://www.unicorn.studio/docs/events/)                   |   ⚪ Katalog-Bestand    | Interaktionsbindung: Appear, Scroll, Hover, Mousemove, Breakpoints | Event-System                |
| **Embed Guide**       | [`/docs/embed/`](https://www.unicorn.studio/docs/embed/)                     |   ⚪ Katalog-Bestand    | Einbettung in Websites (HTML/CDN)                                  | UMD-Embed                   |
| **Variables**         | [`/docs/variables/`](https://www.unicorn.studio/docs/variables/)             |   ⚪ Katalog-Bestand    | Laufzeit-Steuereung von Szenen (Farben, Parameter)                 | Benannte Szenen-Variablen   |
| **Unicorn AI**        | [`/docs/ai/`](https://www.unicorn.studio/docs/ai/)                           |   ⚪ Katalog-Bestand    | KI-gestützte Szenen-Erstellung                                     | KI-Features                 |
| **Performance Guide** | [`/docs/performance/`](https://www.unicorn.studio/docs/performance/)         |   ⚪ Katalog-Bestand    | Performance-Budget (Core Web Vitals der Lobby prüfen)              | Optimierungs-Guide          |
| **FAQs**              | [`/docs/faqs/`](https://www.unicorn.studio/docs/faqs/)                       |   ⚪ Katalog-Bestand    | Häufige Fragen (Lizenz, Self-Hosting)                              | Dokumentation               |
| **Pricing**           | [`/docs/pricing/`](https://www.unicorn.studio/docs/pricing/)                 | 💰 Paid _(Prüfpflicht)_ | Kosten-Nutzen-Bewertung vor Projekt-Einsatz                        | Abo-Modell                  |
| **Changelog**         | [`/docs/changelog/`](https://www.unicorn.studio/docs/changelog/)             |   ⚪ Katalog-Bestand    | Runtime-Versionen beobachten (aktuell v2.2.12)                     | Release-Notes               |
| **About**             | [`/docs/about/`](https://www.unicorn.studio/docs/about/)                     |   ⚪ Katalog-Bestand    | Hintergrund (George Hastings, Autor von „WebGL for Designers")     | Info-Seite                  |

---

## Kategorie 2: Embeddable Example Scenes

| Komponente             | Offizieller Link (unicorn.studio)                                                                                             |     User-Votum     | Casino-Einsatzbereich                                                            | Technologie                             |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------- | :----------------: | :------------------------------------------------------------------------------- | :-------------------------------------- |
| **Fluted Gradient**    | [`/docs/example-projects/`](https://www.unicorn.studio/docs/example-projects/) _(Szene 1, Projekt-ID `oD2QBKj4GohsZCiJ4IWx`)_ | ⚪ Katalog-Bestand | Warped Gradient mit Fluted-Glass-Distortion — Lobby-/Hero-Hintergrund (hell)     | Warped Gradient + Noise, mausinteraktiv |
| **ASCII Dodecahedron** | [`/docs/example-projects/`](https://www.unicorn.studio/docs/example-projects/) _(Szene 2, Projekt-ID `I4ZdGx5PML6mleE2316X`)_ | ⚪ Katalog-Bestand | 3D-Dodekaeder als ASCII mit chromatischer Aberration — Cyber-Crash-Deko (dunkel) | ASCII-3D + Chromatic Aberration         |
| **Block River**        | [`/docs/example-projects/`](https://www.unicorn.studio/docs/example-projects/) _(Szene 3, Projekt-ID `u8EWBwLXNmEjHHeTtQwX`)_ | ⚪ Katalog-Bestand | Pixelierte Block-Fluss-Bewegung mit Glitch-Bulge — Retro-/Roulette-Deko (dunkel) | Pixel-Pattern + Maus-Glitch             |

_Alle drei Szenen: Drop-in-HTML-Snippets mit `data-us-project` + `data-us-vars` auf derselben Übersichtsseite; Variablen-Defaults im Dokument hinterlegt (z. B. `Noise Fill Color A/B`, `Blocks Size`, `Chromab Spread`)._

---

## Kategorie 3: Agent-Kataloge & Runtime

| Komponente                             | Offizieller Link (unicorn.studio)                                                                                                             |     User-Votum     | Casino-Einsatzbereich                                                          | Technologie                  |
| :------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :----------------: | :----------------------------------------------------------------------------- | :--------------------------- |
| **Runtime Control Guide**              | [`/unicornstudio-llms.txt`](https://www.unicorn.studio/unicornstudio-llms.txt)                                                                | ⚪ Katalog-Bestand | Referenz für `scene.setVariable(s)`-Steuerung (z. B. Gold-Farbwechsel bei Win) | LLM-freundliche Runtime-Doku |
| **LLM Catalog (JSON)**                 | [`/llm-example-projects.json`](https://www.unicorn.studio/llm-example-projects.json)                                                          | ⚪ Katalog-Bestand | Maschinenlesbarer Szenen-Katalog (Projekt-IDs, Variablen, Snippets)            | JSON-Katalog                 |
| **LLM Catalog (Text)**                 | [`/llm-example-projects.txt`](https://www.unicorn.studio/llm-example-projects.txt)                                                            | ⚪ Katalog-Bestand | Textvariante des Katalogs                                                      | Text-Katalog                 |
| **Runtime CDN (unicornStudio.umd.js)** | [`cdn.jsdelivr.net/.../unicornStudio.umd.js`](https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.12/dist/unicornStudio.umd.js) | ⚪ Katalog-Bestand | Embed-Runtime (Version pinnen; SRI prüfen)                                     | UMD-Bundle via jsDelivr      |

---

## 3. Zusammenfassung

- **Für das Casino-Projekt relevant:** Fluted Gradient & ASCII Dodecahedron (dunkel) passen zum Obsidian-&-Gold-System; Embed-Runtime (~29 kb gzipped) muss gegen das JS-Budget der Lobby abgewogen werden.
- **Kostenpflichtig:** Pricing-Modell vor Einbau klären (Wasserzeichen im Free-Tier).
- **Besonderheit:** Unicorn Studio ist die einzige der sechs katalogisierten Seiten mit LLM-/Agent-Katalogen — direkt in KI-Workflows (Cursor, Claude) integrierbar.
