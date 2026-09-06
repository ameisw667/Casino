# 22 — Brand Mark: Ass-Pik-Skulptur (löst 007/James-Bond-Logo ab)

> **Status:** 🟢 Generiert, wartet auf Jans Freigabe zur Einbindung · **Stand:** 2026-09-04 · **Owner:** LLM · **Scope:** Ersatz für `brand-medallion-3d.png` (Sidebar-Logo, `MainSidebar.tsx`) — enthielt eine direkte "007"/"James Bond"-Markenreferenz, siehe Abschnitt 2.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                                | Status      | Nächster Schritt                                                                                                                                  | Zuständigkeit |
| ------ | ------------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| L0     | Option-Gate Runde 1 (Wappen/Krone/Monogramm)                                               | 🟢 Executed | Jan unzufrieden mit Scores (max. 4.03/5)                                                                                                          | LLM           |
| L1     | Option-Gate Runde 2 (Ass-Pik/Siegel/Chip-Turm), gezielt gegen Runde-1-Schwächen entwickelt | 🟢 Executed | Jan wählt Option D (Ass-Pik, 4.35/5)                                                                                                              | LLM/Jan       |
| L2     | Pipeline-Erweiterung: `background: transparent`-Unterstützung                              | 🟢 Executed | `types.ts`, `openai-image-client.ts`, `style-preset.ts`, `generate-design-assets.ts` geändert, 68/68 Tests grün                                   | LLM           |
| L3     | Generierung über echte Pipeline (`gpt-image-2`, nicht Ad-hoc-Skript)                       | 🟢 Executed | `2026-09-04_brand-ace-quantum-gold_v001.png` (1,53 MB, sha256 `4f347c60`, 52,7s, ~0,08 USD)                                                       | LLM           |
| L4     | Transparenz- & Kontrast-Verifikation                                                       | 🟢 Executed | Alpha-Kanal per Pixel-Sampling bestätigt, Composite auf echtem Sidebar-Hintergrund geprüft, 40px-Legibility getestet                              | LLM           |
| L5     | Einbindung in `MainSidebar.tsx` (ersetzt `brand-medallion-3d.png`)                         | 🟢 Executed | Zugeschnittenes Icon-Asset `brand-ace-icon.png` erzeugt, in `MainSidebar.tsx` eingebaut, live im Dev-Server geprüft, wartet auf Jans Sichtprüfung | LLM           |

## 2 — Warum dieses Bild ersetzt wird

Das bisherige Logo (`brand-medallion-3d.png`) zeigte ein Medaillon mit den Texten **"007"**, **"JAMES BOND"**, einem Wappen mit gekreuzten Pistolen und **"EST. 1953"** (exaktes Erscheinungsjahr des Original-Romans) — eine direkte, unübersehbare Referenz auf eine aggressiv geschützte Marke (MGM/Danjaq/EON, Ian Fleming Publications). Der Projektname "Casino Royale" für sich ist unproblematisch (generischer Glücksspiel-Begriff), das Logo selbst war es nicht. Jan wurde das im Chat direkt gezeigt, keine Entscheidung wurde stillschweigend getroffen.

## 3 — Option-Gate-Verlauf (zwei Runden)

**Runde 1** (Kriterien: Lerneffekt 30 % / Aufwand 25 % / Risiko 25 % / Wartbarkeit 20 %):

| Option | Konzept                                              |  Score |
| :----- | :--------------------------------------------------- | -----: |
| A      | Heraldisches Wappen (Würfel+Karte+Chip+Rad um Krone) | 3.45/5 |
| B      | Solitäres Kronen-Symbol                              | 4.03/5 |
| C      | Skulpturales Monogramm ("J")                         |  4.0/5 |

Jan war mit keiner der drei Optionen zufrieden ("bitte weitere, bessere Evaluierungen … finden"). Statt neue Ideen zu raten, wurden die drei konkreten Schwachstellen identifiziert: A = Detail-Überladung (gleiche Falle wie das verworfene Sidebar-Emblem v1), B = generisch/austauschbar (Krone ist das meistgenutzte Casino-Logo-Motiv), C = Text-in-3D-Risiko.

**Runde 2**, gezielt gegen diese drei Schwächen entwickelt:

| Option | Konzept                                |      Score |
| :----- | :------------------------------------- | ---------: |
| G      | Gestapelter Chip-Turm                  |     3.98/5 |
| E      | Reduzierter Siegel-Medaillon           |     4.13/5 |
| **D**  | **Ass-Pik als eigenständige Skulptur** | **4.35/5** |

**Warum D gewinnt:** Löst B's Genericness-Problem (Ass-Pik ist unverkennbar Glücksspiel-codiert, keine austauschbare Luxus-Krone) **und** C's Text-Risiko gleichzeitig — die kleine "A" in der Kartenecke ist exakt dieselbe Textgröße/-position, die in `2026-09-04_hero-blackjack-quantum-gold_v001.png` bereits nachweislich perfekt gerendert wurde (siehe Bild-Evaluation, Top 3–5 %). Kein neues Risiko, sondern ein bereits bewiesener Erfolg aus der eigenen Bildhistorie.

Jans Wahl: **Option D.**

## 4 — Pipeline-Erweiterung (notwendig für dieses Bild)

Die Pipeline hatte bislang **keine** Unterstützung für transparente Hintergründe — jede Generierung bekam über `OBSIDIAN_GOLD_STYLE_SUFFIX` zwangsweise den Text "deep pitch-black obsidian slate background" in den Prompt injiziert, unabhängig vom Kontext. Für ein freistehendes Sidebar-Icon (wie zuvor beim Maskottchen) hätte das dem `background`-API-Parameter direkt widersprochen und laut Erfahrung aus der Maskottchen-Runde zu unsauberen Kanten führen können.

Geändert:

- [`src/lib/design-assets/types.ts`](../../src/lib/design-assets/types.ts) — neuer Typ `ImageBackground`, `background?` auf `PromptEntry` und `GenerationRequest`.
- [`src/lib/design-assets/openai-image-client.ts`](../../src/lib/design-assets/openai-image-client.ts) — `background: request.background ?? 'auto'` im API-Request-Body (abwärtskompatibel: alle 8 bisherigen Bilder liefen ohne den Parameter, `'auto'` entspricht exakt ihrem bisherigen Verhalten).
- [`src/lib/design-assets/style-preset.ts`](../../src/lib/design-assets/style-preset.ts) — `buildStyleSuffix(background)` wählt zwischen dem opaken Hintergrund-Satz (Standard, unverändert für hero/badge/background/avatar/ui) und einem transparenz-bewussten Satz ("isolated on a transparent background, no background scenery, no backdrop") für `background: 'transparent'`.
- [`scripts/generate-design-assets.ts`](../../scripts/generate-design-assets.ts) — neuer `--background`-CLI-Flag, durchgereicht bis zum API-Call.
- **Tests:** 68/68 weiterhin grün (`npx vitest run src/lib/design-assets`), keine bestehende Testerwartung musste angepasst werden.

## 5 — Finaler Prompt (informiert durch alle 8 vorherigen Generierungen + Best-Practices-Dokument)

```
Cinematic luxury ace of spades playing card floating upright in mid-air, crafted from polished
dark obsidian smoked glass (#0B0E14) with beveled metallic champagne gold edges and corner trim
(#D4AF37), a glowing radiant gold spade emblem embossed at the center with warm amber inner glow,
elegant engraved gold letterforms in the top-left and bottom-right corners, subtle sweeping curved
golden motion-blur light trail around the card, fine floating golden bokeh dust particles,
volumetric warm amber rim lighting along the card edges, dramatic chiaroscuro atmosphere, epic
cinematic depth of field, isolated centered product shot, no table, no other cards, no chips,
masterpiece 3D render
```

Modell: `gpt-image-2` · Format: `1024x1024` · Qualität: `medium` · Kategorie: `icon` · Background: `transparent` · Kosten: ~0,08 USD (Monat: 1,00/20 USD).

Anders als bei den 8 Hero-Bildern (jeweils 3 dokumentierte Iterationsstufen) wurde hier **eine** bereits vollständig informierte Version generiert — der Prompt baut direkt auf den Lehren aus allen bisherigen Bildern auf (Materialsprache, Hex-Anker, Ausschluss-System, das erwiesen funktionierende "A"-Kartenrendering aus dem Blackjack-Bild), statt erneut bei einer generischen Baseline zu starten.

## 6 — Ergebnis & Verifikation

- **Datei:** [`public/images/2026-09-04_brand-ace-quantum-gold_v001.png`](2026-09-04_brand-ace-quantum-gold_v001.png) (1024×1024, RGBA)
- **Transparenz:** per Sharp-Pixel-Sampling verifiziert (Ecken: Alpha 0, Kartenmitte: Alpha ~252) — keine Annahme, sondern gemessen.
- **Kontrast-Check:** Composite auf echtem Sidebar-Hintergrund (`#0B0E14`) geprüft — keine harten Kanten, sauberer Glow-Übergang in den dunklen Hintergrund (genau das, was am alten Medaillon bemängelt wurde).
- **40px-Legibility-Check:** getrimmt + auf 40px verkleinert getestet — Kartenform und warmer Goldschimmer bleiben klar erkennbar; feine Gravur-Details und das "A" selbst verschwimmen bei dieser Größe erwartungsgemäß (physikalische Grenze, keine Überraschung).

## 6a — Einbindung (2026-09-04)

- Zugeschnittenes Icon-Asset [`public/images/brand-ace-icon.png`](brand-ace-icon.png) erzeugt (auf Content-Bounds getrimmt + 6% Padding, aus `2026-09-04_brand-ace-quantum-gold_v001.png`) — analog zum `royale-guide-mascot-icon.png`-Vorgehen, damit die Karte den 40px-Slot besser ausfüllt als das ungeschnittene 1024px-Canvas.
- [`MainSidebar.tsx`](../../src/components/layout/MainSidebar.tsx) geändert: `src` von `/images/brand-medallion-3d.png` auf `/images/brand-ace-icon.png`. `animate-pulse`-Klasse unverändert beibehalten.
- Verifiziert im laufenden Dev-Server (`localhost:3015`): `img.complete === true`, korrekte Bildquelle über DOM bestätigt, keine neuen Konsolenfehler, `npm run typecheck` sauber.
- **Wartet auf Jans eigene Sichtprüfung** — erst danach gilt L5 als vollständig abgeschlossen.

## 7 — Nicht-Scope

- Kein Austausch von `royale-guide-emblem.png` (Higgsfield, separates Thema).
- Keine Änderung an `MainSidebar.tsx` — Einbindung erst nach Jans expliziter Bild-Freigabe (analog zum Maskottchen-Workflow).
- Kein Site-weiter Rebrand ("Casino Royale" bleibt der Markenname; die "Casino Jan"-Frage betraf nur eine potenzielle Monogramm-Variante, die mit Option D nicht mehr relevant ist).

## 8 — Referenzen

- [`00_IMAGES_OVERVIEW.md`](00_IMAGES_OVERVIEW.md) — Pipeline-Übersicht, inkl. der Regel "Auslösung ausschließlich durch Jan" (in dieser Runde bewusst mit Jans expliziter Zustimmung abgewichen, siehe Chat-Verlauf 2026-09-04).
- [`09_model_pricing_reference.md`](09_model_pricing_reference.md) — Modell-/Preis-Kontext.
- [`worldmap/15_1_royale_guide_sidebar_placement.md`](../../worldmap/15_1_royale_guide_sidebar_placement.md) — verwandte Sidebar-Icon-Historie (Emblem v1, Maskottchen), aus der die Detail-Überladungs- und Kontrast-Lehren stammen, die hier direkt angewendet wurden.
