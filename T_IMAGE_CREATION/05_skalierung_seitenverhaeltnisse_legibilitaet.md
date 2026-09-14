# 05 — Skalierung, Seitenverhältnisse & Kleinformat-Legibilität

> **Status:** 🟡 Planungsbereit · **Stand:** 2026-09-14 · **Owner:** Jan / LLM  
> **Worldmap-Kontext:** T_IMAGE_CREATION / Subkategorie 05  
> **Best-Practice-Referenz:** [`public/images/00_IMAGES_OVERVIEW.md#5`](../public/images/00_IMAGES_OVERVIEW.md#5) (Kleinformat-Legibilitätscheck)  
> **Fokus:** Beherrschung der Bilddimensionen, Vermeidung von Clipping und Gewährleistung perfekter Erkennbarkeit vom 16px-Icon bis zum Widescreen-Banner.

---

## 1 — Executive Summary & Status Quo

Der aktuelle Reifegrad im Bereich **Skalierung, Seitenverhältnisse & Kleinformat-Legibilität** liegt bei **Top 55 % (Solide Ansätze / Teils fehlende Praxisprüfung)**.

Ein typischer Trugschluss bei der Bildgenerierung ist die ausschließliche Betrachtung der hochauflösenden 1024×1024px-Vorschau. Ein Asset, das in voller Größe fantastisch aussieht (z. B. filigrane Riffelungen, winzige Sterne), degeneriert bei der tatsächlichen UI-Zielgröße (16px in der Sidebar, 24px im Header) zu einem unleserlichen, matschigen Fleck.
Zudem wurden Aspekt-Verhältnisse (Widescreen 1792×1024 für Lobby-Hero vs. Quadrat für Badges) bisher oft erst im CSS krampfhaft beschnitten.

**Zielzustand (Top 3 %):** Systematischer Multi-Resolution-Testlauf mit automatischem Silhouetten-Check und fester Formatmatrix vor dem produktiven Einsatz.

---

## 2 — Dekomposition in 7 Sub-Facetten

|   #    | Sub-Facette                                    | Gewicht  | Aktuelles Niveau | Status Quo & Schwachstelle                                                               | Bottleneck? | Action Item / Zielzustand                                                                                   |
| :----: | :--------------------------------------------- | :------: | :--------------: | :--------------------------------------------------------------------------------------- | :---------: | :---------------------------------------------------------------------------------------------------------- |
| **01** | **Kleinformat-Silhouetten-Check (16–32px)**    | **25 %** |     Top 60 %     | Filigrane Details gehen verloren; Icons verlieren Unterscheidbarkeit zu Schwester-Assets |    Nein     | Silhouette-First-Regel: Bei Icons zählt nur die Außengeometrie, nicht die Innentextur                       |
| **02** | **Randabstand & Anti-Clipping (Margin Guard)** | **20 %** |     Top 55 %     | Flügel, Kronenspitzen oder Strahlen reichen bis an den Bildrand und werden abgeschnitten |    Nein     | Prompt-Klausel erzwingen: „Centered subject with minimum 15% clear margin on all sides, zero edge clipping“ |
| **03** | **OpenAI Seitenverhältnis-Matrix**             | **18 %** |     Top 45 %     | Formate werden inkonsistent gewählt; falsche Dimensionen führen zu Verzerrungen          |    Nein     | Feste Bindung von Asset-Typen an Formate: Icons/Badges (1:1), Banners/Backdrops (16:9), Mobile (9:16)       |
| **04** | **Downsampling-Qualität (Sharp Lanczos3)**     | **12 %** |     Top 40 %     | Unkontrolliertes Browser-Downscaling erzeugt Kantenflimmern (Moire-Effekt)               |    Nein     | Serverseitige Generierung von Mipmap-Auflösungen (16px, 32px, 64px, 128px) via Lanczos3                     |
| **05** | **Geschwister-Asset-Differenzierung**          | **10 %** |     Top 65 %     | Ähnliche Badges (z. B. VIP-Bronze vs. Silber) haben identische Silhouetten               |    Nein     | Eindeutige Formsprache (z. B. Kreis vs. Sechseck vs. Schild) für unterschiedliche Ränge                     |
| **06** | **Responsive Crop-Sicherheit (Hero-Banner)**   | **10 %** |     Top 60 %     | Bei schmalen Bildschirmen wird das Kernmotiv von Widescreen-Bannern weggeschnitten       |    Nein     | „Safe-Action-Zone“ im Zentrum (mittlere 60 %) für alle Banner-Prompts vorschreiben                          |
| **07** | **DPI- & Retina-Display-Optimierung**          | **5 %**  |     Top 50 %     | 1x vs. 2x (@2x) Asset-Pfade sind im Code uneinheitlich hinterlegt                        |    Nein     | Automatische Bereitstellung von `@1x` und `@2x` WebP-Assets im Frontend-Resolver                            |

---

## 3 — Die 5 Goldenen Regeln für Kleinformat-Legibilität

1. **Silhouette vor Textur:** Ein Icon muss als rein schwarze Silhouette gegen weißes Licht sofort identifizierbar sein. Wenn man das Motiv nur anhand feiner Innenlinien erkennt, ist der Prompt für kleine UI-Größen ungeeignet.
2. **Bold & Chunky Shapes:** Für Symbole unter 48px Dicke der Kanten um mindestens 200 % verstärken. Filigrane Nadelstreifen oder winzige Edelsteine vermeiden.
3. **Kein Text im Bild:** Texte sind unter 64px ohnehin unleserlich und wirken wie Bildrauschen.
4. **Feste Format-Zuordnung:**
   - **1:1 (`1024x1024`):** Icons, Badges, Spielkarten, Avatare, Logos, Medaillons.
   - **16:9 (`1792x1024`):** Hero-Banner, Spielbühnen-Hintergründe, Widescreen-Backdrops.
   - **9:16 (`1024x1792`):** Mobile-Bühnen, Story-Screenshots, vertikale Overlays.
5. **Clipping-Guard:** Mindestens 15 % Leerraum um das Hauptobjekt, damit CSS-Rundungen (`border-radius`) oder Skalierungsanimationen das Objekt nicht beschneiden.

---

## 4 — 5-Stufen-DoD für Top 1–3 % Reifegrad

1. [ ] **Legibilitäts-Vorschau im CLI:** Das Tool `generate-design-assets.ts` erzeugt neben dem 1024px-Master ein 32px-Thumbnail für die visuelle Sichtprüfung.
2. [ ] **Zero-Clipping-Audit:** Kein generiertes Icon hat Pixeldaten in den äußersten 10 Pixeln des Master-Bildes.
3. [ ] **Responsive Safe-Zones:** Alle 16:9 Banner haben ihr Hauptmotiv innerhalb der zentralen 50 % Bildbreite.

---

## 5 — Verwandte Dokumente

- Master-Übersicht: [`00_IMAGE_CREATION_UEBERSICHT.md`](./00_IMAGE_CREATION_UEBERSICHT.md)
- Prompt-Engineering: [`01_prompt_engineering_input_praezision.md`](./01_prompt_engineering_input_praezision.md)
- Qualitätssicherung: [`08_qualitaetssicherung_review_workflow.md`](./08_qualitaetssicherung_review_workflow.md)
