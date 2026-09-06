# 09 — Modell-Preisreferenz (Bild & Video, OpenAI API)

> **Status:** 🟢 Referenzdokument · **Stand:** 2026-09-05 · **Owner:** Jan / LLM
> **Zweck:** Lerneffekt-Dokument — welches Modell was kostet, wie es im Artificial-Analysis-Ranking steht, und welche Stellschrauben (Format, Qualität, Prompt-Länge) den Preis wirklich beeinflussen. Ergänzt [`00_IMAGES_OVERVIEW.md`](00_IMAGES_OVERVIEW.md) und [`02_cost_usage_governance.md`](02_cost_usage_governance.md).
>
> **Quellenlage:** Alle Preise direkt von `developers.openai.com/api/docs/pricing` (offizielle OpenAI-Doku, live abgerufen am 2026-09-05). Alle Elo-Scores von `artificialanalysis.ai` (Bild-Leaderboard + Video-Leaderboard, live abgerufen am 2026-09-05). Keine der Zahlen stammt aus Trainingswissen — bei schnelllebigen Themen wie API-Preisen ist das der einzig verlässliche Weg.

---

## 1 — Bild-Modelle: Preis pro Bild (berechnet)

**Wichtig zu verstehen:** OpenAI berechnet Bildgenerierung nicht pauschal pro Bild, sondern **tokenbasiert** — wie bei Text auch, nur dass ein generiertes Bild in eine bestimmte Anzahl "Output-Tokens" umgerechnet wird. Die Formel: `Output-Tokens × Preis-pro-1M-Output-Tokens ÷ 1.000.000`.

### 1.1 — Rohpreise pro 1M Tokens (offiziell, gpt-image-Familie)

| Modell             | Text-Input | Bild-Input |     Output | Shutdown              |
| :----------------- | ---------: | ---------: | ---------: | :-------------------- |
| `gpt-image-1`      |      $5,00 |     $10,00 | **$40,00** | 2026-10-23            |
| `gpt-image-1-mini` |      $2,00 |      $2,50 |  **$8,00** | 2026-12-01            |
| `gpt-image-1.5`    |      $5,00 |      $8,00 | **$32,00** | 2026-12-01            |
| `gpt-image-2`      |      $5,00 |      $8,00 | **$30,00** | kein Shutdown geplant |

_(Batch-API: pauschal 50 % Rabatt auf alle vier Spalten, aber nur für nicht-zeitkritische Massen-Generierung — für einzelne Design-Assets irrelevant.)_

### 1.2 — Output-Tokens pro Bild (Format × Qualität)

Diese Tabelle ist der eigentliche Hebel — sie gilt architekturbedingt für die ganze `gpt-image`-Familie (nicht offiziell pro Modellversion einzeln dokumentiert, aber so von mehreren unabhängigen Quellen für `gpt-image-2` bestätigt):

| Format                  | `low` | `medium` | `high` |
| :---------------------- | ----: | -------: | -----: |
| 1024×1024 (quadratisch) |   272 |    1.056 |  4.160 |
| 1536×1024 (16:9 quer)   |   400 |    1.568 |  6.208 |
| 1024×1536 (hochkant)    |   408 |    1.584 |  6.240 |

### 1.3 — Daraus berechnet: $ pro Bild, alle Modelle × Formate × Qualitäten

| Modell                                             | Format    |    low | medium |   high |
| :------------------------------------------------- | :-------- | -----: | -----: | -----: |
| **gpt-image-2** (eure Pipeline)                    | 1024×1024 | $0,008 | $0,032 | $0,125 |
|                                                    | 1536×1024 | $0,012 | $0,047 | $0,186 |
|                                                    | 1024×1536 | $0,012 | $0,048 | $0,187 |
| **gpt-image-1.5**                                  | 1024×1024 | $0,009 | $0,034 | $0,133 |
|                                                    | 1536×1024 | $0,013 | $0,050 | $0,199 |
| **gpt-image-1** (von mir fürs Maskottchen genutzt) | 1024×1024 | $0,011 | $0,042 | $0,166 |
|                                                    | 1536×1024 | $0,016 | $0,063 | $0,248 |
| **gpt-image-1-mini**                               | 1024×1024 | $0,002 | $0,008 | $0,033 |
|                                                    | 1536×1024 | $0,003 | $0,013 | $0,050 |

**⚠️ Diskrepanz, die ich nicht stillschweigend glattbügeln will:** Eure eigene Pipeline hat für die medium/1536×1024-Bilder jeweils **~0,12 $** im `spend-ledger.json`/`CHANGELOG.md` protokolliert. Meine Berechnung oben kommt für exakt diesen Fall auf **$0,047**. Das ist ein Faktor ~2,5×. Mögliche Erklärungen: (a) `cost-guard.ts` rechnet bewusst konservativ (eigene Doku-Zeile: "Konservative Modell-Preistabelle"), (b) die Token-Tabelle in 1.2 ist eine unabhängig recherchierte Annäherung, keine 1:1-offizielle Zahl pro Modellversion. Für echte Kostenwahrheit zählt am Ende nur der Blick ins OpenAI-Dashboard (`platform.openai.com/usage`) — die Tabelle hier ist eine Planungsgrundlage, kein Ersatz dafür.

---

## 2 — Video-Modelle: Preis pro Sekunde (offiziell)

| Modell       | Auflösung | Preis/Sekunde | 5-Sek-Clip | 10-Sek-Clip |
| :----------- | :-------- | ------------: | ---------: | ----------: |
| `sora-2`     | 720p      |         $0,10 |      $0,50 |       $1,00 |
| `sora-2-pro` | 720p      |         $0,30 |      $1,50 |       $3,00 |
| `sora-2-pro` | 1024p     |         $0,50 |      $2,50 |       $5,00 |
| `sora-2-pro` | 1080p     |         $0,70 |      $3,50 |       $7,00 |

Zum Vergleich: Ein einzelnes Hero-Bild (medium, 1536×1024, gpt-image-2) kostet lt. eurem eigenen Ledger ~0,12 $. Ein 5-Sekunden-Video in Sora-2-Standard kostet **$0,50** — grob das **4-fache eines einzelnen Bildes**, bei Sora-2-Pro in 1080p sogar das **~29-fache**. Video ist eine andere Kostenklasse, nicht nur "ein bisschen teurer".

Beide Sora-Modelle haben laut offizieller Modell-Liste **Shutdown-Datum 2026-09-24** — bei OpenAI meist ein rollender Alias-Wechsel auf eine neuere, noch nicht gelistete Version, aber vor einem echten Einsatz nochmal frisch prüfen.

---

## 3 — Artificial Analysis Elo-Scores (Qualitäts-Ranking, nicht Preis)

Elo-Scores stammen aus paarweisen Blindvergleichen echter Nutzer ("A oder B besser?") — höher ist besser, vergleichbar mit Schach-Elo. Sie sagen nichts über Preis, nur über wahrgenommene Bildqualität.

### 3.1 — Bild-Modelle

| Rang | Modell                           |           Elo | Anbieter              |
| ---: | :------------------------------- | ------------: | :-------------------- |
|    1 | **GPT Image 2 (high)**           |      **1371** | OpenAI                |
|    2 | MAI-Image-2.6                    |          1346 | Microsoft             |
|    3 | Reve 2.1                         |          1324 | Reve                  |
|    4 | Nano Banana 2 (Gemini 3.1 Flash) |          1320 | Google                |
|    5 | Muse Image                       |          1312 | Meta                  |
|    6 | **GPT Image 1.5 (high)**         |      **1304** | OpenAI                |
|    7 | Seedream 5.0 Pro                 |          1279 | ByteDance             |
|    8 | FLUX.2 [max]                     |          1224 | Black Forest Labs     |
|    9 | Ideogram 4.0                     |          1218 | Ideogram              |
|   10 | Imagen 4 Ultra                   |          1189 | Google                |
|   11 | **GPT Image 1 (high)**           |      **1198** | OpenAI                |
|   12 | **GPT Image 1 Mini (medium)**    |      **1107** | OpenAI                |
|   13 | Midjourney v7 Alpha              |          1093 | Midjourney            |
|   14 | FLUX.1 [dev]                     |          1036 | Black Forest Labs     |
|   15 | **DALL-E 3 / DALL-E 3 HD**       | **968 / 967** | OpenAI (abgeschaltet) |

**Einordnung:** Euer Pipeline-Standardmodell `gpt-image-2` ist aktuell **Platz 1 von allen getesteten Modellen weltweit** — nicht nur "gut genug", sondern der Referenzpunkt, an dem sich alle anderen messen. Der Sprung von `gpt-image-1` (Rang ~11, Elo 1198) zu `gpt-image-2` (Rang 1, Elo 1371) ist real und spürbar, kein Marketing-Delta — das bestätigt aus einer zweiten, unabhängigen Richtung, dass es richtig war, dass eure Pipeline standardmäßig `gpt-image-2` nutzt und nicht das ältere `gpt-image-1`, das ich beim Maskottchen versehentlich verwendet habe.

### 3.2 — Video-Modelle

| Modell                |       Elo | Anbieter | Quelle                                                                                   |
| :-------------------- | --------: | :------- | :--------------------------------------------------------------------------------------- |
| **Sora-2-Pro**        | **~1180** | OpenAI   | direkt von der Modell-Seite bestätigt                                                    |
| Sora-2 (Standard)     |    ~1206* | OpenAI   | *Sekundärquelle, nicht direkt von Artificial Analysis bestätigt — mit Vorsicht behandeln |
| Wan 3.0               |      1238 | Alibaba  | Top-Platz im "mit Audio"-Ranking                                                         |
| Gemini Omni Flash     |      1238 | Google   |                                                                                          |
| MiniMax H3 Max        |      1235 | MiniMax  |                                                                                          |
| Veo 3.1               |     ~1092 | Google   |                                                                                          |
| Kling 3.0 Pro (1080p) |      1108 | Kuaishou |                                                                                          |

**Einordnung, ehrlich:** Anders als bei Bildern ist Sora-2 **nicht** die klare Nummer 1 im Video-Bereich — es rangiert im Mittelfeld, mehrere chinesische Modelle (Wan, MiniMax, Seedance) liegen aktuell davor. Falls Videoerstellung später wirklich Thema wird, lohnt sich ein bewusster Qualitätsvergleich, nicht automatisch "OpenAI, weil derselbe Anbieter wie fürs LLM".

---

## 4 — Modell-Unterschiede (qualitativ)

- **`gpt-image-1` → `gpt-image-1.5` → `gpt-image-2`**: jede Stufe verbessert vor allem Prompt-Befolgung bei komplexen Mehrfach-Anweisungen (genau eure langen Meister-Prompts profitieren davon am meisten), Text-/Zahlen-Rendering und Materialtreue. Die Elo-Sprünge in 3.1 bilden das direkt ab.
- **`gpt-image-1-mini`**: bewusst kleiner/günstiger (bis zu 5× billiger als `gpt-image-2`), aber auch klar schwächer (Elo 1107 vs. 1371) — sinnvoll für schnelle Entwürfe/Iterationsstufe-1-Skizzen, nicht für finale Hero-Bilder.
- **DALL-E 3/2**: seit **12.05.2026 komplett aus der API entfernt** — nicht mehr wählbar, nur noch historische Referenz. Erklärt auch, warum sie in eurer eigenen Modell-Liste (Abschnitt Output 2, letzte Konversation) gar nicht mehr auftauchten.
- **`sora-2` vs. `sora-2-pro`**: Pro kostet 3–7× mehr, bietet höhere Auflösung (bis 1080p vs. nur 720p) und laut OpenAI-Doku auch längere maximale Clip-Länge — im Elo-Ranking aber kein dramatischer Qualitätssprung, der Preisunterschied ist größer als der Qualitätsunterschied.

---

## 5 — Die eigentliche Frage: Was treibt den Preis wirklich?

Deine Vermutung war: _"Wenn der Prompt-Text nur ein kleiner Hebel ist, sollte man ihn ruhig sehr ausführlich schreiben — kostet kaum mehr, verbessert aber den Output."_ **Das stimmt, und die Zahlen belegen es klar:**

| Hebel                                    | Preis-Spanne                                                                     | Wirkung                                                                                  |
| :--------------------------------------- | :------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **Qualitäts-Tier** (low → high)          | **bis zu 15,3×** (z. B. 1536×1024 gpt-image-2: $0,012 → $0,186)                  | **Der mit Abstand größte Hebel.**                                                        |
| **Format/Größe** (1024×1024 → 1536×1024) | ~1,5× bei gleicher Qualität                                                      | Zweitgrößter Hebel, aber viel kleiner als Qualität.                                      |
| **Modellwahl** (mini → 2)                | ~4–15× je nach Format                                                            | Groß, aber eine einmalige Entscheidung pro Projekt, kein laufender Dial.                 |
| **Text-Prompt-Länge**                    | Ein 300-Wort-Meister-Prompt (~400 Tokens) kostet bei $5/1M Text-Input **$0,002** | **Praktisch vernachlässigbar** — selbst ein 10× so langer Prompt kostet nur ~$0,02 mehr. |

**Konkret gerechnet:** Der Unterschied zwischen einem 10-Wort-Prompt und eurem 100-Wort-Meister-Prompt liegt bei geschätzt $0,0005–0,001 — das ist **weniger als 1 % des Gesamtpreises** eines einzelnen medium-Bildes. Der Unterschied zwischen `low` und `high` Qualität am selben Bild ist dagegen **$0,17+** — das ist über 100× so viel Hebel.

**Praktische Konsequenz für die Pipeline (bereits intuitiv richtig gemacht):**

1. **Prompt-Länge nie aus Kostengründen kürzen.** Die detaillierten Meister-Prompts (Material + Farbcode + Licht + Bewegung + Ausschlüsse) sind praktisch kostenlos gegenüber der Qualitätsstufe — das ist exakt der Hebel, der in Abschnitt 1 der Bild-Evaluation als "Best Practice" identifiziert wurde.
2. **`quality: medium` ist der bewusste Sweet Spot**, den die Pipeline schon nutzt: `high` kostet ~4× mehr als `medium` bei sichtbar, aber nicht dramatisch besserer Qualität für Web-Assets (die ohnehin auf ~1500px Breite skaliert angezeigt werden, wo der High-Detail-Unterschied kaum noch sichtbar ist).
3. **Format erst NACH dem UI-Container festlegen**, nicht umgekehrt — das spart nicht nur Kosten (kein Zuschneiden/Nachgenerieren), sondern verhindert auch die in der Bild-Evaluation genannten Format-Diskrepanz-Risiken.

---

## 6 — Quellen

- [OpenAI API Pricing (offiziell)](https://developers.openai.com/api/docs/pricing)
- [Artificial Analysis — Image Leaderboard](https://artificialanalysis.ai/image/leaderboard/text-to-image)
- [Artificial Analysis — Sora 2 Pro Model Page](https://artificialanalysis.ai/video/models/sora-2-pro)
- [Artificial Analysis — Video Models Comparison](https://artificialanalysis.ai/video/models)
- Live-Abfrage der für dieses Projekt tatsächlich freigeschalteten Modelle: `GET /v1/models` mit dem projekteigenen `OPENAI_API_KEY` (2026-09-04, siehe Chat-Verlauf) — bestätigt, dass alle oben genannten Modelle real auf eurem Account verfügbar sind, keine Annahme.
