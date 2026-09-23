# 02 — Startseite: Farbe, Material & Typografie

> **Status:** Geplant · **Stand:** 9. September 2026 · **Owner:** LLM · **Execution:** Nicht gestartet
>
> **Scope:** Das visuelle System der Startseite: Farbfunktionen, Gold-Budget, Obsidian-/Glas-/Metallmaterial, Tiefe, Schriftrollen und Zahlenformat. Es harmonisiert vorhandene Tokens, ohne neue Stilwerte zu erfinden.
>
> **Nicht Scope:** Kein globaler Token-Refactor, keine Änderungen an `/games`, `/history`, `/vault` oder `/stats`, keine neue Farbe, kein Bildasset und keine Motion-Execution. Neutral-Schwarz R5 wird ausdrücklich nicht auf die Lobby/Startseite ausgeweitet.

[Zur Scorecard](../../Startseite.md#scorecard) · [Vorher Desktop](../Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [Vorher Hero](../Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Bildsprache](../01_Bildsprache_Markenwelt/Plan.md) · [Lesbarkeit & Fokus](../10_Lesbarkeit_Fokus/Plan.md)

## 1. Entscheidung auf einen Blick

**Empfehlung: Option A — Drei-Schichten-Materialvertrag.** Die Startseite trennt konsequent **Obsidian Canvas** (Ruhe), **Glas-/Metall-Surfaces** (Struktur) und **Gold** (seltene Handlung oder Auszeichnung). Typografie trägt die Hierarchie; Monospace markiert ausschließlich dynamische Werte. Damit wird Gold nicht gleichzeitig CTA, Rahmen, Badge und Dauer-Glow. Zielwert: **84 auf 94/100**.

| Option | Ansatz                                                  | UX 45% | Premium 30% | Risiko 15% | Umsetzbarkeit 10% | Gesamt | Urteil                                 |
| ------ | ------------------------------------------------------- | -----: | ----------: | ---------: | ----------------: | -----: | -------------------------------------- |
| **A**  | Drei-Schichten-Materialvertrag und typografische Rollen |     43 |          29 |         13 |                 9 | **94** | **Empfohlen**                          |
| B      | Gold als universeller Premium-Verstärker                |     27 |          24 |          9 |                10 |     70 | Entwertet Handlungs- und Gewinnsignale |
| C      | Flaches Schwarz-Weiß mit wenig Material                 |     34 |          19 |         14 |                10 |     77 | Verliert die etablierte Markenwelt     |

## 2. Scorezerlegung — genau 10 Hebel

| ID    | Unterkategorie               | Status quo | Ziel | Konkreter Engpass / Planungsergebnis                                                                |
| ----- | ---------------------------- | ---------: | ---: | --------------------------------------------------------------------------------------------------- |
| FM-01 | Farbrollen statt Farbmenge   |         83 |   95 | Jede vorhandene Farbe erhält genau eine semantische Aufgabe.                                        |
| FM-02 | Gold-Budget                  |         76 |   94 | Gold markiert primäre Handlung, aktive Auswahl oder echte Auszeichnung — nie alles zugleich.        |
| FM-03 | Obsidian Canvas              |         90 |   96 | `#0B0E14` bleibt Startseiten-Canvas; kein versehentlicher Wechsel zur R5-Neutral-Schwarz-Familie.   |
| FM-04 | Surface-Hierarchie           |         82 |   94 | Glas-, ruhige und hervorgehobene Flächen sind als drei unterscheidbare Ebenen planbar.              |
| FM-05 | Material & Tiefe             |         85 |   94 | Blur, Border, inset highlight und Schatten werden gezielt nach Rolle eingesetzt statt geschichtet.  |
| FM-06 | Textkontrast & Ton           |         81 |   94 | Weiß/Primär/Sekundär/Gold werden über Kontrast und Bedeutung statt Dekoration verteilt.             |
| FM-07 | Typografische Hierarchie     |         86 |   95 | Inter-Display, Fließtext, Uppercase-Label und Value-Rolle bekommen klare Einsatzgrenzen.            |
| FM-08 | Dynamische Zahlen            |         88 |   96 | Jackpot, Multiplikator, Rating, Geld und Timer nutzen `var(--font-mono)` plus tabellarische Breite. |
| FM-09 | Responsive Materialdichte    |         79 |   93 | Mobile reduziert Blur, Glow und Badge-Dichte, nicht Kontrast oder Bedeutung.                        |
| FM-10 | Token-/Regression-Governance |         90 |   95 | Abweichungen werden gegen lokale Referenzen und visuelle Beweise kontrolliert.                      |

## 3. Verbindlicher Startseiten-Materialvertrag

| Schicht             | Zulässige vorhandene Werte / Muster                                                                   | Aufgabe                                                        | Nicht verwenden als                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| **Canvas**          | Obsidian `#0B0E14` / tiefe Canvaswerte aus SOP 04.                                                    | Ruhe, negative Fläche, Bildkontrast.                           | Standard-Card, CTA oder sichtbarer Status.                  |
| **Surface**         | Glas: `rgba(11,14,20,0.75)`, Blur 12–16px, subtile helle Kante; vorhandene tiefe Schatten.            | Gruppierung, Navigation, Card- und Overlay-Struktur.           | Universelle, gleich laute Schachtel für jedes Element.      |
| **Gold**            | `#D4AF37`; Vollgold-CTA nur im R1-Gradient `#FFD700 → #D4AF37`.                                       | Primäre Handlung, aktive Wahl, Rang 1 oder echte Auszeichnung. | Mehrfach wiederholte Border + Badge + Glow + Text zugleich. |
| **Smaragd / Rubin** | `#10B981` für positiver Wert; bestehende Rubin-/Rot-Familie für Verlust/Fehler.                       | Ergebnis- und Fehlersemantik, immer begleitet von Text.        | Deko, Live-Füllfarbe oder Ersatz für Trust.                 |
| **Typografie**      | Inter für Inhalt/Headline; `var(--font-mono)` für dynamische Werte; bestehende Uppercase-Labelmuster. | Lesbare Hierarchie, Wertstabilität und ruhige Präzision.       | Monospace für Fließtext oder Gold als Standardtextfarbe.    |

**R5-Grenze:** Die neutral-schwarzen `#111111/#121212/#141414` Leaderboard-Surfaces sind laut lokaler Referenz auf `/games`, `/history`, `/vault`, `/stats` beschränkt. Die Startseite bleibt Obsidian & Gold. Diese Grenze verhindert eine ungewollte Stilvermischung.

## 4. Kontext-Koffer

| Quelle                                                                                                                   | Relevanz                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `src/components/home/bento/bento-lobby-tokens.ts`                                                                        | Aktuelle Lobby-Fallbacks: Canvas `#0B0E14`, Gold `#D4AF37`, mono für Zahlen.                          |
| `src/components/home/hero-cinematic/HeroHeadlineColumn.tsx`                                                              | Aktuelle Gold-Headline, Bonus-CTA, Trust-Bar und kleine Badge-Werte als wichtigste Gold-Budget-Fälle. |
| `src/components/home/hero-cinematic/JackpotPulseCard.tsx`                                                                | Aktuelle Wert-, Gold- und Zahleninszenierung.                                                         |
| `src/components/home/bento/BentoArcadeCells.tsx`                                                                         | Aktive Card-, Focus- und Vollgold-CTA-Muster.                                                         |
| [Design-Laws](../../../../../../.claude/skills/casino-design-system-craft/references/design-laws.md)                     | Lokale Token-, Surface-, Typo- und Motiongrenzen; keine Werte erfinden.                               |
| [R1–R5 Positiv-Referenzen](../../../../../../.claude/skills/casino-design-system-craft/references/positiv-referenzen.md) | Verbindliche vorhandene Muster; R5-Scope speziell beachten.                                           |
| [SOP 04](../../../../../../xx_sop/04_design_system_ui.md)                                                                | Kanonische Farb-, Surface-, Zahlentypo- und Z-Index-Vorgaben.                                         |

## 5. LLM-Ausführungsplan — L0 bis L5

| Level                         | LLM-Aufgabe & Ergebnis                                                                                                             | Jan-Gate                                             | Abbruch / Rollback                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| L0 — Sichtbares Tokeninventar | Startseiten-CSS/Inline-Werte nach Canvas, Surface, Gold, Ergebnisfarbe, Typo und Zahl klassifizieren; Screenshot-Beweise zuordnen. | Jan bestätigt nur die gewünschte Materialintensität. | Bei Wert ohne Referenz: nicht normalisieren oder ersetzen; erst Referenzpfad klären.                         |
| L1 — Rollenmatrix             | Vorhandene Tokens ausschließlich den fünf Materialrollen und vier Textrollen zuordnen; Gold-Budget je Blickzone definieren.        | Wahl zwischen zwei regelkonformen Dichtevarianten.   | Wenn Gold gleichzeitig Aktion, Border, Glow und Label in einer Zone trägt: zu L1, Gold entfernen/reduzieren. |
| L2 — Surface-/Typosystem      | Hero, Showcase, Bento, Navigation und Status nach Canvas/Surface/Action strukturieren; Inter/Mono-Einsatz konkret festlegen.       | Kein Backend-Gate.                                   | Wenn R5-Neutral-Schwarz in die Startseite diffundiert oder Textkontrast sinkt: L2 zurücknehmen.              |
| L3 — Responsive & Zustände    | Für 390/1024/1440 Regeln für Blur, Border, Shadow, Textgewicht, Zahlenbreite und Fokuskontrast festlegen.                          | Jan prüft nur die visuelle Dichte.                   | Wenn Mobile durch reduzierte Tiefe semantische Zustände verliert: zu L2, Bedeutung textlich stärken.         |
| L4 — Visuelle Regression      | Gold-Flächenquote, Kontrast, Focus, lange Zahl, leer/Fehler und nebeneinanderliegende Surfaces als Beweisfälle definieren.         | Kein Gate.                                           | Bei fehlendem Kontrast, Blickkonkurrenz oder Farbbedeutung ohne Text: zu L1/L3.                              |
| L5 — Execution-Ready          | Zielkomponenten, Reihenfolge, Token-Quellen, Nachher-Screenshotmatrix und je Fläche einen Rollback dokumentieren.                  | Finales Ja/Nein zur Ästhetik.                        | Ohne L4 bleibt der Status **Geplant** und die bestehenden Werte unverändert.                                 |

## 6. Fünf spätere Execution-Checks

1. **Gold-Budget-Check:** Pro Blickzone existiert höchstens ein dominantes goldbetontes Handlungs- oder Auszeichnungselement.
2. **Surface-Check:** Canvas, Standard-Surface und hervorgehobene Aktion unterscheiden sich ohne neue Farbwerte und ohne blau-stichige Template-Boxen.
3. **Typocheck:** Headline, Inhalt, Label und dynamischer Wert nutzen die korrekte Rolle; Zahlen sind mono/tabellarisch und verschieben das Layout nicht.
4. **Responsive-/A11y-Check:** 390/1024/1440, 200%-Zoom, Fokus und `prefers-reduced-motion` behalten Kontrast und Bedeutung; Motion trägt keine Farbbedeutung allein.
5. **Beweistest:** Nachher-Crops dokumentieren Hero, aktive Game-Card und Mobile-Dock neben den unveränderten Vorher-Beweisen; erst dann Score „94“ bestätigen.

## 7. Selbstprüfung vor Übergabe

- Genau 10 Unterkategorien, alle Zielwerte >= 93.
- Ausschließlich vorhandene lokale Token-/Referenzwerte; keine neue Farbe, Radius, Schatten- oder Dauerfamilie erfunden.
- R5 wird nicht unzulässig auf die Lobby übertragen; A2 bleibt bei späterer UI-Execution bindend.
- Planung enthält keine Code-/Asset-Execution und ist mit Bildsprache, Lesbarkeit, CTA und Motion klar abgegrenzt.
