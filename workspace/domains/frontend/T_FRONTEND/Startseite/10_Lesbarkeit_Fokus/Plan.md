# 10 — Startseite: Lesbarkeit & Fokus

> **Status:** Geplant · **Stand:** 9. September 2026 · **Owner:** LLM · **Execution:** Nicht gestartet
>
> **Scope:** Ausschließlich die Startseite (`/`) samt sichtbarer Shell. Ziel ist, dass Angebot, Handlung und dynamische Werte unter realen Bildflächen in Sekunden lesbar und per Tastatur eindeutig bedienbar sind.
>
> **Nicht Scope:** Keine Backend-, Bonus-, Auth-, Zahlungs- oder Rechtsänderung. Symbolabbau ist Plan 09, die CTA-Rangfolge Plan 07 und der Wahrheits-/Provenance-Check von Claims Plan 08.

[Zur Scorecard](../../Startseite.md#scorecard) · [Vorher Desktop](../Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Vorher Mobile](../Beweise/2026-09-08/01_status-quo_mobile_hero-crop.png) · [Bewegungsplan](../06_Motion_Interaktion/Plan.md)

## 1. Entscheidung auf einen Blick

**Empfehlung: Option A — Reading-first Contract.** Jede Information erhält eine klar definierte Lesbarkeitsrolle: Handlung, Wert, Erklärung oder sekundärer Beweis. Ein Kontrast- und Fokusvertrag wird vor jedem visuellen Effekt geprüft; dekorative Dichte darf nie Text oder Fokus überlagern. Das hebt den Startseiten-Score von **74 auf 93/100** und bleibt mit dem Luxury-System vereinbar.

| Option | Ansatz                                                    | UX 45% | Premium 30% | Risiko 15% | Umsetzbarkeit 10% | Gesamt | Urteil                     |
| ------ | --------------------------------------------------------- | -----: | ----------: | ---------: | ----------------: | -----: | -------------------------- |
| **A**  | Reading-first Contract: Rollen, Kontrast, Fokus, Zustände |     43 |          28 |         13 |                 9 | **93** | **Empfohlen**              |
| B      | Nur Typografie vergrößern                                 |     31 |          24 |         11 |                10 |     76 | Symptome bleiben           |
| C      | Inhalte stark kürzen                                      |     34 |          19 |         12 |                 8 |     73 | Verliert Vertrauen/Kontext |

## 2. Scorezerlegung — genau 10 Hebel

Bewertet ist der sichtbare Ist-Zustand der eingefrorenen Vorher-Beweise und des aktuellen Startseiten-Codes; die Zielwerte sind Abnahmekriterien, keine behauptete Umsetzung.

| ID    | Unterkategorie                | Status quo | Ziel | Konkreter Engpass / Planungsergebnis                                                                                |
| ----- | ----------------------------- | ---------: | ---: | ------------------------------------------------------------------------------------------------------------------- |
| LF-01 | Leseskala & Zeilenlänge       |         76 |   93 | Headline, Lead und Karten-Text erhalten feste Rollen statt isolierter Rem-Werte.                                    |
| LF-02 | Text über Bild/Glas           |         74 |   94 | Jede Bildfläche bekommt eine prüfbare Textzone; Glow ist nie alleinige Kontraststütze.                              |
| LF-03 | Überschriften-Rhythmus        |         79 |   93 | Zeilenumbrüche, Großschrift und Abstände werden für 390/1024/1440 gezielt geprüft.                                  |
| LF-04 | Dynamische Zahlen             |         74 |   94 | Jackpot, Multiplikator, Online-Zahl und Gewinnformat erhalten ruhige, tabellarische Zahlendarstellung.              |
| LF-05 | Microcopy & Badges            |         64 |   91 | 0.60–0.68rem-Microchips werden zusammengelegt, lesbar priorisiert oder in die zweite Ebene verschoben.              |
| LF-06 | Beschriftete Controls         |         78 |   93 | Bedienziele bleiben als Text verständlich; keine Bedeutung nur über Bild/Symbol.                                    |
| LF-07 | Sichtbarer Tastaturfokus      |         70 |   94 | Alle Links, Tabs, Bonusaktion und Drawer-Controls bekommen einen kontrastreichen `:focus-visible`-Pfad.             |
| LF-08 | Fokusreihenfolge & Rückkehr   |         72 |   92 | Tab-Reihenfolge folgt Blick/DOM; Overlay schließt mit Rückkehr zum auslösenden Element.                             |
| LF-09 | Zoom, Overflow & Deutsch      |         72 |   92 | Lange deutsche Labels, 200%-Zoom und schmale Breiten dürfen weder clippen noch horizontalen Seiten-Scroll erzeugen. |
| LF-10 | Lade-, Leer- & Fehlerzustände |         81 |   94 | Dynamische Module kommunizieren Zustand textlich und bleiben ohne Farbe allein verständlich.                        |

## 3. Kontext-Koffer und Leitplanken

| Gebiet                   | Ist-Beobachtung                                                                                          | Ausführungsregel                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Hero                     | `HeroHeadlineColumn` kombiniert 0.60–0.98rem Text, Bonus, Claim und Trust-Bar über intensivem Bild/Glow. | Erst Inhalt/Lesbarkeit, dann Material; keine ungetestete Verdichtung.                       |
| Showcase                 | `GameShowcaseCard` zeigt Live-Zahl, Badge und simulierte Werte in Bildkarten.                            | Zahlen als Werte lesen lassen; Status nicht allein über Grün/Rot/Glow vermitteln.           |
| Innerer Scroll-Container | `MainLayout` scrollt innerhalb von `main`, nicht über das Dokumentfenster.                               | Fokus nach Navigation/Overlay sichtbar in diesen Container führen und testen.               |
| Bewegung                 | Bestehende Motion-Einstiege bewegen Text vertikal.                                                       | Text bleibt während und nach Motion lesbar; `prefers-reduced-motion` respektieren.          |
| Symbolstrategie          | Im Ist sind Bildsymbole und Lucide-Symbole in Controls/Proofs sichtbar.                                  | A2 der Designreferenz gilt: sichtbare Bedeutung künftig über Text; Detailmigration Plan 09. |

Primärreferenzen: [WCAG 2.2 Kontrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum), [WCAG 2.2 Fokus sichtbar](https://www.w3.org/TR/WCAG22/#focus-visible), [lokale Luxury-Empfehlungen](../../../../../../docs/frontend/11_componentry_luxury_recommendations_2026.md) und [Motion-/Componentry-Katalog](../../../../../../docs/frontend/13_motion_dev_complete_catalog.md). Bei Konflikt gilt die lokale Designreferenz vor generischen Mustern.

## 4. LLM-Ausführungsplan — L0 bis L5

| Level                      | LLM-Aufgabe & Ergebnis                                                                                                                      | Jan-Gate                                               | Abbruch / Rollback                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| L0 — Baseline              | Vorher-Beweise bei 390, 1024 und 1440 px erneut prüfen; Textrollen, interaktive Elemente und Engstellen als Inventar festhalten.            | Nur Freigabe der visuellen Richtung.                   | Wenn Referenz/Screenshot nicht zum Route-Stand passt: stoppen, Baseline neu erfassen; nichts überschreiben.     |
| L1 — Reading Contract      | Typo-, Kontrast-, Zeilenlängen- und Zahlendarstellungsregeln aus vorhandenen Tokens/Referenzen ableiten; keine neuen zufälligen Tokens.     | Jan bestätigt nur die gewünschte visuelle Tonalität.   | Falls Lead, Claim oder CTA in 390 px nicht ohne Scrollen lesbar ist: zum L0-Inventar zurück.                    |
| L2 — Fokusvertrag          | Jede Startseiten-Interaktion mit sichtbarem Text, `focus-visible`, Reihenfolge, Aktiv/Deaktiviert- und Rückkehrverhalten spezifizieren.     | Kein Produkt-/Backend-Gate.                            | Falls der Fokus verdeckt, unsichtbar oder nach Overlay verloren geht: L2 verwerfen, DOM-/Layoutpfad neu planen. |
| L3 — Zustände & Edge Cases | Lange Labels, 200%-Zoom, Screenreader-Namen, hohe Kontrastumgebung sowie Laden/Leer/Fehler als UI-Szenarien festlegen.                      | Kein Gate.                                             | Falls ein Zustand Werte erfindet oder ausschließlich Farbe nutzt: Zustand neutral/textlich neu entwerfen.       |
| L4 — Verifikationspaket    | Visuelle Diff-Checkliste, Keyboard-Walkthrough und automatisierbare Assertions definieren; Vorher bleibt unverändert.                       | Jan sieht nur die geplante Vorher/Nachher-Komposition. | Bei Regression zu horizontalem Overflow, Clipping oder flackernder Layoutverschiebung: zu L1/L2.                |
| L5 — Execution-Ready       | Exakte betroffene Komponenten, Reihenfolge und Nachher-Beweisplätze festschreiben; Status erst nach realer Umsetzung auf „Execution Ready“. | Finales visuelles Ja/Nein.                             | Ohne positives L4 bleibt der Plan **Geplant**; keine Ausführung.                                                |

## 5. Komponenten- und Änderungslandkarte

| Bereich         | Wahrscheinliche Dateien bei späterer Execution                                                      | Veränderung                                                     | Beweis nachher                                        |
| --------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| Hero-Text/Bonus | `src/components/home/hero-cinematic/HeroHeadlineColumn.tsx`                                         | Textrollen, Umbruch, Labels, Kontrast- und Fokusflächen.        | 390/1024/1440 Hero-Crops + Keyboard-Video/Screenshot. |
| Game-Showcase   | `src/components/home/hero-cinematic/GameShowcaseCard.tsx`                                           | Zahlen, Tabs, Live-/Statusbeschriftung und Fokuszustände.       | Tab-/Wert-Zustände mit langem deutschen Label.        |
| Jackpot/Live    | `src/components/home/ProgressiveJackpotSection.tsx`, `src/components/social/LiveActivityFeedV2.tsx` | Lesbare Wert- und Statushierarchie, keine Farbcodierung allein. | Idle, Update, leer, Fehler.                           |
| Shell           | `src/components/layout/MainLayout.tsx` und vorhandene globale Styles                                | Fokus-Sichtbarkeit im tatsächlichen Scroll-Container.           | Tab-Walkthrough Desktop/Mobile.                       |

## 6. Fünf spätere Execution-Checks

1. **Lesetest:** 390, 1024 und 1440 px sowie 200%-Zoom: kein kritischer Text geclippt, kein horizontaler Seitenscroll.
2. **Kontrasttest:** Text auf jeder tatsächlichen Bild-/Glasfläche erfüllt WCAG-AA oder erhält eine reale, stabile Textfläche.
3. **Keyboardtest:** Vom ersten Headerziel bis zum letzten sichtbaren Startseitenziel ist jeder Fokus sichtbar, logisch und nicht verdeckt.
4. **Wertetest:** Jackpot, Multiplikator, Rating und Onlinezahl bleiben bei Stellenwechsel ohne Sprung/Überlappung lesbar; Status hat Text.
5. **Beweistest:** Nachher-Screenshots werden neben den unveränderlichen Vorher-Bildern verlinkt; erst dann Score „93“ bestätigen.

## 7. Selbstprüfung vor Übergabe

- Genau 10 bewertete Unterkategorien, Zielwerte alle >= 91.
- Planung ist LLM-ausführbar; Jan entscheidet ausschließlich visuelle Richtung/Gate.
- Keine Implementierung, keine neuen Assets und keine faktischen Produktversprechen in diesem Dokument.
- Abgrenzung zu 07, 08 und 09 ist explizit, damit die vier Pläne ohne Doppel-Execution funktionieren.
