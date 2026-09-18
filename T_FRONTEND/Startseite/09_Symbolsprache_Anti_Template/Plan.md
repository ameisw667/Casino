# 09 — Startseite: Symbolsprache & Anti-Template

> **Status:** Geplant · **Stand:** 9. September 2026 · **Owner:** LLM · **Execution:** Nicht gestartet
>
> **Scope:** Die auf der Startseite sichtbare Navigation, Hero-, Game-, Live- und Overlay-Controls werden von symbolgetriebener zu textklarer Bedienung überführt. Das betrifft auch die sichtbare Shell, wenn sie auf `/` erscheint.
>
> **Nicht Scope:** Kein Icon-Refactor für andere Routen, keine neue Markenillustration und keine Änderung der Informationshierarchie (03), CTA-Priorität (07), Claim-Wahrheit (08) oder Lesbarkeitswerte (10). Bestehende Spielfeldbilder bleiben Spielbilder, nicht Bedienzeichen.

[Zur Scorecard](../../Startseite.md#scorecard) · [Vorher Desktop-Shell](../Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [Vorher Mobile-Dock](../Beweise/2026-09-08/00_status-quo_mobile_390x844.png) · [Luxury-A2-Referenz](../../../docs/frontend/11_componentry_luxury_recommendations_2026.md)

## 1. Entscheidung auf einen Blick

**Empfehlung: Option A — Labels-first Luxury.** Auf der Startseite trägt sichtbarer, präziser Text die Bedeutung jedes Bedienpfads. Symbole, Sternreihen, Kronen, Pfeile und generische Lucide-Zeichen werden nicht „modernisiert“, sondern aus berührten UI-Flächen entfernt oder durch typografische Information ersetzt. Das folgt der verbindlichen lokalen Regel **A2: no icons in touched Casino UI** und hebt Kategorie 09 von **56 auf 94/100**.

| Option | Ansatz | UX 45% | Premium 30% | Risiko 15% | Umsetzbarkeit 10% | Gesamt | Urteil |
|---|---|---:|---:|---:|---:|---:|---|
| **A** | Sichtbare Textlabels, iconfreie Controls und typografische Statussignale | 43 | 29 | 13 | 9 | **94** | **Empfohlen** |
| B | Icon + Label als Hybrid | 37 | 23 | 12 | 9 | 81 | Verfehlt A2 |
| C | Icons nur verkleinern/verblassen | 22 | 16 | 12 | 10 | 60 | Behebt den Template-Eindruck nicht |

## 2. Scorezerlegung — genau 10 Hebel

| ID | Unterkategorie | Status quo | Ziel | Konkreter Engpass / Planungsergebnis |
|---|---|---:|---:|---|
| SA-01 | Sichtbares Inventar | 52 | 95 | Jede sichtbare Startseiten-Symbolinstanz wird mit Ort, Bedeutung und Ersatztext inventarisiert. |
| SA-02 | Primäre Navigation | 58 | 95 | Sidebar und Mobile-Dock navigieren über ausgeschriebene Labels, aktiver Zustand nur mit Text/Material. |
| SA-03 | Header & Account-Utility | 54 | 93 | Menü, Wallet, Sichtbarkeit und Auth erhalten konkrete Textaktionen statt Rätselzeichen. |
| SA-04 | Hero-Aktionen | 60 | 94 | Bonus-CTA und „Spielhalle“-Link verzichten auf Promo-/Pfeilsymbol; Text definiert Zweck. |
| SA-05 | Game-Card-Aktionen | 55 | 94 | Starten, Tabwechsel und Detailpfade bleiben ohne Play-/Chevron-Symbol eindeutig. |
| SA-06 | Trust-/Statussignale | 53 | 94 | Stern, Häkchen, Krone und Funkpunkt werden durch Quelle, Zahl und textlichen Status ersetzt. |
| SA-07 | Live & Highroller | 56 | 93 | Trend/Flamme/Krone sind keine Informationsabkürzung; Ereignis, Zeitpunkt und Wert stehen ausgeschrieben. |
| SA-08 | Overlay schließen/zurück | 59 | 94 | „Schließen“ und „Zurück zur Übersicht“ sind echte sichtbare Textaktionen, nicht nur X. |
| SA-09 | Premium-Material statt Clipart | 57 | 94 | Hierarchie entsteht durch Raum, Schrift, Rahmen und Bildmaterial — nicht durch zusätzliche Zeichen. |
| SA-10 | Accessibility & Regression | 56 | 94 | Accessible Name, Touch-Ziel, Fokus und aktiver Zustand werden ohne Symbolverständnis geprüft. |

## 3. Startseiten-Inventar und Migrationsprinzip

| Oberfläche | Beobachtete Symbolsprache | Geplanter Ersatz | Grenze |
|---|---|---|---|
| Desktop-Sidebar / Mobile-Dock | Lucide- und Bildsymbole flankieren Navigation. | Vollständige Routennamen; aktiver Zustand über Schriftgewicht, Fläche und `aria-current`. | Kein Text als Tooltip-Ersatz; das Label ist permanent sichtbar. |
| Header | Menü-, Wallet-, Auge- und Loginzeichen verkürzen Account-Aktionen. | Sichtbare Verben/Nomen wie „Navigation“, „Guthaben anzeigen“, „Anmelden“. | Keine Auth- oder Kontologik ändern. |
| Hero | Promo-Bild, Pfeil und Sicherheits-/Sternbilder begleiten CTA und Trust. | „Bonus aktivieren“, „Zur Spielhalle“, Quelle/Rating als reine Textdaten. | Spiel-/Markenbild im Hero bleibt ein Bild, solange es keine Bedienbedeutung trägt. |
| Showcase / Bento | Play, Pfeil, Nutzer-, Flammen- und Würfelzeichen tragen Start/Live-Signale. | „Spiel starten“, „1.420 online“, „Live-Multiplikator“, „Nächster Schritt“. | Tab- und Linksemantik bleibt erhalten. |
| Live/Overlay | X, Krone, Trend und Flamme codieren Status/Schließen. | „Schließen“, „Gewinnmeldung“, „Höchster Gewinn“, Wert und Zeit als Text. | Keine Gewinnerdaten erfinden; Plan 08 regelt Provenance. |

Die lokale Designregel A2 ist bindend: **keine neuen Icons; beim Berühren sichtbarer Startseiten-UI bestehende sichtbare Icons entfernen.** Zugängliche Namen bleiben erforderlich; ein `aria-label` ersetzt jedoch nicht das sichtbare Textlabel.

## 4. LLM-Ausführungsplan — L0 bis L5

| Level | LLM-Aufgabe & Ergebnis | Jan-Gate | Abbruch / Rollback |
|---|---|---|---|
| L0 — Inventar | Alle ausschließlich auf `/` sichtbaren Zeichen fotografisch und im Komponentenpfad erfassen; Spielbild vs. UI-Symbol markieren. | Jan bestätigt lediglich die gewünschte markentypografische Richtung. | Bei unklarer Bedeutung: nichts entfernen, erst sichtbaren Zweck klären. |
| L1 — Textsystem | Pro Aktion/Status einen kurzen, deutschen, eindeutigen sichtbaren Text samt aktivem/disabled Zustand festlegen. | Kein Produkt-/Backend-Gate. | Wenn ein Label mehrdeutig wird oder die Fläche sprengt: Text kürzen, nicht zurück zum Symbol. |
| L2 — Shell zuerst | Desktop-Sidebar, Mobile-Dock und Header nach A2 planen; anschließend Hero, Showcase, Bento und Overlays. | Nur Sichtprüfung der Label-Dichte. | Wenn Navigation die 390px-Breite bricht: Layout/Zeilenplan zu L1 zurück, keine Icon-Ausnahme. |
| L3 — Premium-Integration | Räume, Typo, Trennlinien und Bildausschnitt als Hierarchie einsetzen; keine dekorativen Ersatzglyphen. | Jan wählt zwischen zwei gleichwertig iconfreien Materialvarianten. | Bei erneutem Dashboard-/Sticker-Eindruck: Material reduzieren und L1-Informationsrolle erneut prüfen. |
| L4 — Semantik & Beweis | Tastatur, Touch, Screenreader-Name, `aria-current`/`aria-pressed`, Modal-Rückkehr und Vorher/Nachher-Diffs festlegen. | Kein Gate. | Falls eine Aktion nur über Farbe oder versteckten Namen verständlich ist: zu L1/L2. |
| L5 — Execution-Ready | Komponentenreihenfolge, Symbol-Null-Liste und Nachher-Beweisplätze dokumentieren. | Finales Ja/Nein zur visuellen Sprache. | Ohne L4 und sichtbare Null-Liste bleibt Status **Geplant**. |

## 5. Komponentenlandkarte für eine spätere Execution

| Priorität | Wahrscheinliche Dateien | Geplante Verantwortung | Abhängigkeit |
|---:|---|---|---|
| 1 | `src/components/layout/MainSidebar.tsx`, `src/components/layout/MobileNav.tsx`, `src/components/layout/MainHeader.tsx` | Navigations- und Accountlabels; aktive Zustände ohne Symbol. | Lesbarkeit 10. |
| 2 | `src/components/home/hero-cinematic/HeroHeadlineColumn.tsx` | Hero-CTA, Direktlink und Trust-Bar rein textlich. | CTA 07, Trust 08. |
| 3 | `src/components/home/hero-cinematic/GameShowcaseCard.tsx`, `src/components/home/bento/BentoArcadeCells.tsx` | Spielstart, Tabs und Livewerte mit klaren Textrollen. | Lesbarkeit 10. |
| 4 | `src/components/home/HighrollerWinDetailModal.tsx`, `src/components/home/VipLiveStreamRail.tsx` | Textuelle Close-/Status-/Gewinnmuster. | Trust 08. |

## 6. Fünf spätere Execution-Checks

1. **Null-Icon-Sweep:** In den berührten, sichtbaren Startseiten-UI-Flächen bleibt kein Bild-/Lucide-Symbol mit Bedien- oder Statusbedeutung.
2. **Navigationscheck:** Desktop und Mobile zeigen Route, aktive Route und Chat-Aktion als sichtbaren Text; alle Ziele sind per Tastatur und Touch erreichbar.
3. **Action-Check:** Bonus, Spielstart, Tabwechsel, Zurück und Schließen sind ohne Symbolwissen verständlich.
4. **Assistive-Check:** Sichtbarer Labeltext, Accessible Name und Verhalten stimmen überein; Farbe, Position und Motion sind nicht der einzige Bedeutungsträger.
5. **Beweistest:** Desktop- und Mobile-Nachher-Screenshots werden neben den unveränderlichen Vorher-Beweisen verlinkt; erst dann Score „94“ bestätigen.

## 7. Selbstprüfung vor Übergabe

- Genau 10 Unterkategorien, alle Zielwerte >= 93.
- A2 ist konkret auf die sichtbare Startseite angewandt, ohne ein globales Icon-Verbot zu behaupten.
- Keine Codeausführung, keine Asset-Erstellung und keine Änderung von Produktlogik.
- Plan 07/08/10 sind als Abhängigkeiten abgegrenzt; die spätere Umsetzung bleibt entkoppelbar.
