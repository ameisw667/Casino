# 05 — Startseite: Responsive Design

> **Status:** Geplant · **Stand:** 07.09.2026 · **Owner:** LLM · **Execution:** Nicht gestartet / nicht beauftragt
> **Scope:** Anpassung der Lobby an reale Contentbreite, Eingabemethode, Zoom und verfügbare Höhe.
> **Money-Pfad:** Nein · **Planungs- und spätere Ausführungsaufgaben:** ausschließlich LLM.
> [Startseiten-Scorecard](../../Startseite.md) · Voraussetzungen: [Informationshierarchie](../03_Informationshierarchie/Plan.md), [Komposition & Raum](../04_Komposition_Raum/Plan.md).

## 1 — Übersicht für Jan & Ausführungs-LLM

**Ist 62/100 → Ziel 94/100 pro Unterkategorie.** Premium bedeutet hier: dieselbe erkennbare Spielbühne in jeder Größe, ohne abgeschnittene Aktionen, sprunghafte Erstansicht oder Hover-Abhängigkeit.

| Nummer | Meilenstein               | Scope                              | Status  | Zuständigkeit | Verifikation                                       |
| ------ | ------------------------- | ---------------------------------- | ------- | ------------- | -------------------------------------------------- |
| L0     | Responsive-Baseline       | H, B, Shell, Test; RD-01–10        | Geplant | LLM           | Contentmaße, Zustände und Grenzfälle protokolliert |
| L1     | Lokaler Modusvertrag      | H, B, P; RD-01–03                  | Geplant | LLM           | Cold Load und Größenwechsel                        |
| L2     | Reflow und Bedienbarkeit  | A, S, F; RD-04–08                  | Geplant | LLM           | Zoom, Touch, Keyboard, kurze Höhe                  |
| L3     | Bilder und Ladestabilität | A, C, B; RD-09                     | Geplant | LLM           | Größenreservierung, langsamer Download             |
| L4     | Verhaltensbasierter Audit | Test; RD-10 und alle Zielkriterien | Geplant | LLM           | Matrix mit Clipping-/Fokusbelegen                  |
| L5     | Neubewertung und Übergabe | Dieser Plan, Startseite.md         | Geplant | LLM           | Zehn Einzelbewertungen mit Nachweisen              |

Jan übernimmt ausschließlich spätere Designwahl und visuelle Endabnahme. Kein Ausführen von Tests oder manuelles Layout-Fixing wird an ihn delegiert. Die Wahl der Option und ein Umsetzungsauftrag sind noch offen.

## 2 — Assessment: zehn Unterkategorien

Ist-Scores sind subjektive Designheuristiken auf Basis des Sichtaudits vom 06.09.2026 und erneuter Quellprüfung; keine aktuellen Laufzeitmessungen. Die Zerlegung ergibt im Mittel62. 100 bedeutet bestmöglich, nicht Marktperzentil. Plan04 besitzt die räumlichen Sollmaße; dieser Plan besitzt deren technische Anpassung.

| ID    | Unterkategorie                    | Ist | Ziel | Befund und Beleg                                                                                                                              | Bottleneck? | LLM-Aufgabe / Zielnachweis                                                                                                                                |
| ----- | --------------------------------- | --- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RD-01 | Contentbasierte Layoutmodi        | 45  | 94   | H/Shell: Desktop ab1024 trotz Sidebar240 und fixer Karten320/400. Früherer Sichtaudit zeigt Clipping.                                         | 🔴 JA       | Wide/Compact/Narrow aus gemessener Contentbox ableiten; jedes Element einschließlich Fokus passt, nicht bloß der Body.                                    |
| RD-02 | Stabile Erstansicht               | 55  | 94   | UI startet isMobile=false; Shell hat zusätzlich einen mounted-Initialisierungsbildschirm. B rendert Module dynamisch ohne loading-Komponente. | 🔴 JA       | Mobile Cold Load ohne Desktop-Zwischenlayout der Lobby; SSR-/Client-Inhalt konsistent, keine leere Hydration-Sperre. Sichtbarkeit und Layoutshift messen. |
| RD-03 | Resize ohne Neuladen              | 60  | 94   | Shell aktualisiert isMobile; H und BG prüfen einzelne Gerätebedingungen nur beim Mount.                                                       | 🔴 JA       | 390→1280→390 und1023↔1024 behalten Auswahl/Fokus; Layout reagiert korrekt. Motion-Policy-Wechsel an Plan06 übergeben.                                     |
| RD-04 | Reflow und Vergrößerung           | 58  | 94   | H/C feste Breiten; A ellipsiert Titel. B bleibt mobil zweispaltig. Kein Zoomnachweis vorhanden.                                               | 🔴 JA       | 320 CSS-px Content und200% Textvergrößerung ohne verlorene Information; bei Bedarf Satelliten einspaltig, niemals Text passend winzig skalieren.          |
| RD-05 | Inhaltsparität im Zwischenbereich | 73  | 94   | B nutzt4/2 Spalten; F hat Desktop-/Mobile-Varianten. CSS schaltet bei1023, einzelne Kommentare nennen768.                                     | Nein        | 768/769/1023/1024 zeigen vollständige Spielauswahl und genau eine Feed-Darstellung; keine unbelegte Behauptung einer heutigen Feed-Lücke.                 |
| RD-06 | Touch-, Maus- und Fokusangebote   | 64  | 94   | A kennt isMobile, aber Breite ist kein Nachweis für hover/fine; Bonusbutton in H ist nominell40px hoch.                                       | 🔴 JA       | Alle eigenständigen Controls real ≥44×44 CSS-px; wesentliche Aktion ohne Hover, Fokus sichtbar, keine sich überdeckenden Hit-Areas.                       |
| RD-07 | Kurze Höhe, Dock und Safe-Area    | 68  | 94   | Shell innerer Scrollcontainer und mobile Bottomreserve; B addiert bottom80.                                                                   | 🔴 JA       | Letzte Aktion in844×390 und mit Bildschirmtastatur sichtbar erreichbar; keine Scrollfalle, Dock verdeckt keinen Fokus.                                    |
| RD-08 | Lange Texte und große Zahlen      | 62  | 94   | A kleine Metadaten, S fünf VIP-Stufen, C enge Wertefelder.                                                                                    | 🔴 JA       | Lange deutsche Labels und größte formatierbare UI-Werte bleiben lesbar; keine gekappte Hauptaktion, keine Zeichenkollision.                               |
| RD-09 | Responsive Bilder und Ladeplatz   | 70  | 94   | A Bilder fill/unoptimized mit pauschalen sizes; B ssr:false ohne explizite Loading-Flächen.                                                   | 🔴 JA       | Gemessene Rendergrößen/DPR bestimmen Bildauswahl; Seitenverhältnis reserviert, untere Module laden ohne sichtbaren Sprung.                                |
| RD-10 | Belastbare Responsive-QA          | 65  | 94   | Test:320/375/768/1280, feste400ms Wartezeit; kein1024, kein Resize und versteckte Texte teils übersprungen.                                   | 🔴 JA       | Matrix prüft echte Content-/Clipboxen, Scrollweg und Fokus; Findings führen zu fehlgeschlagener Abnahme statt irreführendem „0 Issues“.                   |

**90+-Abnahme:** Fünf Achsen je RD-ID à20 Punkte: Anpassungsqualität, Inhaltserhalt, Eingabezugang, Zustandsstabilität, Nachweisqualität. 18 = vollständiges Tabellenziel mit Beleg, 20 = zusätzlich Grenzfälle fehlerfrei; ohne Beleg höchstens10 auf der betroffenen Achse. Jede Zeile ≥90 und ihr Zielkriterium bestanden; Kategorie = Mittelwert. 94 ist ein Ziel, keine bereits erreichte Aufwertung. Historische Scores wurden nicht nachträglich mit dieser Rubrik gemessen.

## 3 — Kontext-Koffer

| Kürzel   | Reale Quelle                                                                                                                                                                                                 | Rolle                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| P        | [page.tsx](../../../../../../src/app/page.tsx)                                                                                                                                                               | Äußere Lobbyränder                                                             |
| H        | [HeroCinematicShowcase](../../../../../../src/components/home/HeroCinematicShowcase.tsx), [HeroHeadlineColumn](../../../../../../src/components/home/hero-cinematic/HeroHeadlineColumn.tsx)                  | Ein binärer Mobilemodus, Flexgeometrie                                         |
| C        | [GameShowcaseCard](../../../../../../src/components/home/hero-cinematic/GameShowcaseCard.tsx), [JackpotPulseCard](../../../../../../src/components/home/hero-cinematic/JackpotPulseCard.tsx)                 | Fixbreiten und Demooberfläche                                                  |
| B        | [BentoLobbyHome](../../../../../../src/components/home/BentoLobbyHome.tsx)                                                                                                                                   | Grid und dynamische Abschnitte                                                 |
| A        | [BentoArcadeCells](../../../../../../src/components/home/bento/BentoArcadeCells.tsx)                                                                                                                         | Karten, Bilder, Touch-/Hover-Angebot                                           |
| S/F      | [BentoStripCells](../../../../../../src/components/home/bento/BentoStripCells.tsx), [LiveActivityFeedV2](../../../../../../src/components/social/LiveActivityFeedV2.tsx)                                     | Schmale Inhaltszeilen, Feedvarianten                                           |
| Shell    | [MainLayout](../../../../../../src/components/layout/MainLayout.tsx), [MobileNav](../../../../../../src/components/layout/MobileNav.tsx), [globals.css](../../../../../../src/app/globals.css)               | Lesekontext: innerer Scrollbereich, Safe-Area, Sichtbarkeitsklassen            |
| UI/BG    | [uiSlice](../../../../../../src/store/slices/uiSlice.ts), [LobbyAmbientBackground](../../../../../../src/components/home/LobbyAmbientBackground.tsx)                                                         | Initialer Mobilewert; mountgebundene Effektbedingungen                         |
| Test     | [fast-responsive-audit.mjs](../../../../../../scripts/fast-responsive-audit.mjs), [performance-mobile.test.ts](../../../../../../src/lib/meta/__tests__/performance-mobile.test.ts)                          | Bestehende Teilprüfungen; Pfade und Testumfang vor Execution erneut bestätigen |
| Referenz | [ElevatedGameCard](../../../../../../src/app/games/_components/ElevatedGameCard.tsx), [SOP04](../../../../../../xx_sop/04_design_system_ui.md), [SOP16](../../../../../../xx_sop/16_motion_and_ui_polish.md) | Material-/Interaktionsstandard,44px-Projektziel                                |

**Fakten vs. Risiken:** Desktop-Clipping wurde im vorherigen Audit gesehen. Der vorhandene mounted-Gate verhindert eine einfache Schlussfolgerung vom Store-Default auf einen Desktop-SSR-Flash. Hydration-Sprung, tatsächliche Bildübertragung, Tastaturüberdeckung und Fokusverlust sind noch zu prüfende Risiken, keine neu beobachteten Fehler. CSS enthält mobile-only-Regeln bis1023; ein alter768-Kommentar beweist keinen leeren Feed.

**Invarianten:** Globale Sidebar und Store-Mobilvertrag nicht stillschweigend ersetzen. Die Lobby erhält ihren eigenen Layoutvertrag. Gemeinsame DOM-Reihenfolge folgt Plan03; visuelle Umordnung erzeugt keine widersprüchliche Tabreihenfolge. Obsidian/Gold und R1/R2 bleiben, keine Icons auf berührten Flächen; sichtbare Textcontrols erhalten ihre Funktion. Keine neuen Datenquellen.

**Nicht-Scope:** Shell-/Navigationsredesign, Store-Architektur, Auth, Wallet, API, Spielelogik, neue Bildgenerierung, Paketmigration. Plan04 entscheidet Bildausschnitt und Abstände, Plan06 steuert Bewegung und Timer. Gemeinsame Dateien nur in diesen abgegrenzten Verantwortungen bearbeiten; fremde Änderungen erhalten.

## 4 — Optionen und empfohlener Modusvertrag

| Option | Ansatz                                                | Nutzen                                                                      | Risiko                                                          |
| ------ | ----------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| A      | Lokale CSS-Containerqueries mit schmalem Basislayout  | Reagiert auf tatsächlichen Platz neben der Sidebar; wenig Layout-JavaScript | Containment am falschen Vorfahren beeinflusst intrinsische Maße |
| B      | Lokale Viewport-Mediaqueries mit eingerechneter Shell | Einfachster Einstieg für starre Shell                                       | Wird bei geänderter Sidebar-/Paddingbreite ungenau              |
| C      | Lokaler ResizeObserver mit explizitem Moduszustand    | Größenabhängiges Verhalten vollständig in React verfügbar                   | Mehr Zustands-/Hydration- und Cleanup-Komplexität               |

**Empfehlung A.** Jan-Gewichte Lerneffekt30/Einfachheit25/Risikogüte25/Wartbarkeit20; Bewertungen1–5: A4/4/5/5=4,45; B3/5/3/3=3,50; C5/2/3/3=3,35. B nur bei bewusst konstantem Shellvertrag; C nur bei nachgewiesenem Bedarf, den CSS nicht abdeckt. Pre-Mortem A: zusätzliche verschachtelte Container verändern den Bezug und erzeugen unerwartete Umschaltungen. Gegenmaßnahme: benannter Lobbycontainer, dokumentierter Bezug, Grenztests.

- Narrow ist das sichere Basislayout; größere Varianten sind Erweiterungen. Keine viewportabhängig geratenen Serverwerte und kein pauschales Render-null bis zur Hydration.
- Die nach Plan04 gemessenen Mindestbreiten plus Gaps bestimmen Umschaltpunkte. Keine runden Geräte-Breakpoints ohne Inhaltsnachweis; je Schwelle auch±1px prüfen.
- Containergröße entscheidet Layout. Hoverfähigkeit, Pointertyp und Reduced Motion entscheiden Effekte separat. Ein breites Touchgerät bleibt touchbedienbar.
- Fünf Spiele, primäre Aktion und wesentliche Zustandsinformation bleiben zugänglich. Ausblenden darf nur nach Plan03 nachweislich redundante Darstellung betreffen.
- Für fill-Bilder gilt eine reservierte Containergeometrie; nicht pauschal jedem Bild widersprüchlich zusätzliche feste HTML-Maße geben. sizes allein reduziert bei unoptimized nicht automatisch den Download.
- Locale-/Zahlen-Fixtures sind reine Präsentationstests. Bestehende Zahlenformatierung nicht durch erfundene Datenverträge ersetzen.

## 5 — Detaillierte LLM-Meilensteine

### L0 — Baseline und Messvertrag

LLM liest aktuelle Guides unter node_modules/next/dist/docs/ vor späterem Code, prüft aktive Renderkette und dokumentiert Viewport **und** Contentbox. Keine Tests auf einer Sandbox ohne reale Shell als alleinige Abnahme. Aktuelle Cold-/Warm-Load-Ansichten erfassen. **Abbruch:** Route nicht erreichbar, Fonts/Assets fehlen oder Quelle driftet → zuerst Baseline klären. **Rücknahme:** keine Produktänderung.

### L1 — Responsiver Lobbycontainer

Nach Designfreigabe setzt LLM RD-01–03 um: lokale Styles/Container, gleicher Inhaltsbaum, gemessene Schwellen. Eine neu notwendige lokale Stylesdatei vorher im Dateimanifest festhalten. Globales isMobile bleibt für unbeteiligte Routen unverändert. **Abbruch:** globale Shell-/Storeänderung erforderlich → Scope/K3-Review. **Rücknahme:** eigenes lokales Layoutpaket, keine fremden Edits.

### L2 — Grenzbreiten und Eingaben

LLM bearbeitet RD-04–08 mit Textfixtures, Zoom, Keyboard und Touch. Haupttitel nicht ellipsieren; erklärende Metadaten nur bei weiterhin zugänglicher Vollfassung kürzen. Inhalt darf wachsen und vertikal scrollen. Focus-Scroll im tatsächlichen MainLayout-Scroller prüfen. **Abbruch:** Hauptinhalt muss verschwinden, Touchfläche überlappt Nachbarn oder Fokus bleibt unter Dock. **Rücknahme:** eigenes betroffenes Karten-/Layoutteilpaket.

### L3 — Medien und Ladezustände

LLM misst reale Cardbreiten und Netzwerkgrößen bei DPR1/2, dokumentiert Motivgrößen und reserviert den Platz dynamischer Zellen. Bestehende Assets verwenden; Below-the-fold-Bilder nicht pauschal eager laden. **Abbruch:** unnötige neue Assets/Services oder Verschlechterung der sichtbaren Bildqualität. **Rücknahme:** eigenes Medien-/Loadingpaket.

### L4 — Matrix und harte Abnahme

LLM erweitert die Prüfung oder ergänzt einen klar benannten lokalen Lobby-Test nach dem bestehenden Teststil; vorgeschlagene neue Datei ist vor Implementierung im Manifest zu benennen, kein bereits existierender Pfad wird behauptet. Prüfen:

- Breiten320/360/390/768/769/1023/1024/1280/1536/1920 CSS-px sowie lokale Schwellen±1; realen inneren Scrollbereich bis ans Ende bewegen.
- 320 CSS-px Reflow;1280px Fenster bei400% Zoom als gesonderter Browsercheck;200% Textvergrößerung;844×390 Querformat.
- Maus schmal, Touch breit, Tastatur; Cold Load mit langsamen Assets, Resize390→1280→390 ohne Reload und ohne Fokus-/Auswahlverlust.
- Clipping-Vorfahren, sichtbarer Text/CTA, Hit-Area und Fokusrahmen tatsächlich vermessen; Body-scrollWidth allein reicht nicht. Alle Links/Controls erfassen, nicht nur button und a.btn.
- Loading-/Leer-/Fehlerzustände, lange Labels, große Zahlen; exakt eine Feedvariante. CLS-Ziel<0,1, LCP-Ziel<2,5s unter protokollierten Bedingungen; Labordaten sind keine Feld-Perzentile.
- Mindestens Chromium und WebKit für Container-/Dockverhalten. Nicht verfügbare Browser oder echte Bildschirmtastatur explizit als offene Nachweise ausweisen; Emulation nicht als reales Gerät deklarieren.

**Abbruch:** ein Muss-Kriterium fällt durch oder ein RD-Score bleibt unter90. **Rücknahme:** problematischer eigener Diff; nach Korrektur vollständige relevante Matrix erneut prüfen.

### L5 — Dokumentieren statt Zielwerte vorwegnehmen

LLM dokumentiert Vorher/Nachher je RD-ID, Browser/Viewport/Contentbreite und Nachweise. Erst dann Score und Execution-Spalte aktualisieren. **Abbruch:** nur Quelltexttest statt Laufzeitnachweis oder fehlende Grenzfälle. **Rücknahme:** unzutreffende Bewertung zurück auf offen, Pläne erhalten.

## 6 — Fünf Abschlussprüfungen der späteren Execution

1. npm run typecheck: keine neu verursachten Typfehler.
2. npm test: Kern-/Grenztests grün; bestehende Source-String-Tests ersetzen nicht die Matrix.
3. npm run lint: keine neuen Errors.
4. npm run build: erfolgreicher Production-Build; Buildansicht zusätzlich prüfen.
5. git diff --check und git status --short: keine unbeabsichtigten Änderungen; alle RD-Zielbelege vorhanden.

Fremde Baselinefehler separat dokumentieren und keine Gesamt-Grünbehauptung machen. Während dieser reinen Planung wurden diese Produktprüfungen nicht ausgeführt.

## 7 — Recherche, Design-Abgleich und Selbstprüfung

[MDN Containerqueries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) erklärt größenabhängige Regeln am Container statt am Viewport. [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) begründet Inhaltserhalt bei schmaler Darstellung. [W3C Target Size Enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) beschreibt44px als erweitertes AAA-Kriterium; hier ist44px zusätzlich der Projektstandard, nicht das allgemeine AA-Minimum. Abruf07.09.2026.

Jan-Planer und Casino Design System Craft verwendet. R1/R2 liefern Material-/Controlreferenz, A2 fordert Text statt Icons. Kein Token- oder Stilwechsel, kein Backendpfad. Read-only Agent responsive_review_2 ergänzt die Quellprüfung und korrigiert die First-Paint-Hypothese anhand des vorhandenen mounted-Gates; aktuelle Browsermatrix und reale Geräteabnahme bleiben bewusst offen. Zehn Dimensionen, LLM-Ownership, Nicht-Scope, Abbruch/Rücknahme und künftige Nachweise sind enthalten; Execution ist nicht gestartet.
