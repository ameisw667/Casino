# 04 — Startseite: Komposition & Raum

> **Status:** Geplant · **Stand:** 06.09.2026 · **Owner:** LLM · **Execution:** Nicht gestartet / nicht beauftragt
> **Scope:** Flächenverteilung, Außen-/Innenabstände, Bildausschnitte und räumliche Ruhe der Lobby.
> **Money-Pfad:** Nein · **Security-Review:** Keine Backendänderung · **Planungsowner:** ausschließlich LLM.
> [Startseiten-Scorecard](../../Startseite.md) · Voraussetzung: [Informationshierarchie](../03_Informationshierarchie/Plan.md).

## 1 — Übersicht für Jan & Ausführungs-LLM

**Ist 70/100 → Ziel 93/100 pro Unterkategorie.** Das räumliche Leitmotiv ist eine dominante Spielbühne mit klaren gemeinsamen Außenkanten. Die historisch sichtbare Kollision des Heroes begrenzt die Wirkung sämtlicher teurer Bildassets.

| Nummer | Meilenstein                         | Scope                        | Status  | Zuständigkeit | Verifikation                                   |
| ------ | ----------------------------------- | ---------------------------- | ------- | ------------- | ---------------------------------------------- |
| L0     | Raum- und Crop-Inventar             | P, H, B, Shell               | Geplant | LLM           | Breitenbilanz und annotierte Ansichten         |
| L1     | Bühnen- und Kantenvertrag           | H, B, P; KR-01–04            | Geplant | LLM           | Drei Größenklassen ohne neue Shell-Geometrie   |
| L2     | Innenräume und Bildausschnitte      | A, C, J, S; KR-05–08         | Geplant | LLM           | Lange Texte, größte Zahlen, Hover-Maxima       |
| L3     | Tiefe und Balance                   | B, BG; KR-09/10              | Geplant | LLM           | Statische, Hover- und Reduced-Motion-Ansichten |
| L4     | Raumabnahme und technische Übergabe | Alle lokalen Zielkomponenten | Geplant | LLM           | Zehn Zielnachweise; Vertrag an Responsive-Plan |
| L5     | Status und Dokumentation            | Dieser Plan, Startseite.md   | Geplant | LLM           | Nachherbewertung erst nach Execution           |

Alle Entwürfe, Anpassungen und Prüfungen übernimmt das LLM. Jan gibt später nur die Richtung und visuelle Endabnahme frei. Planung vollständig vorbereitet, Produktumsetzung offen.

## 2 — Assessment: zehn Unterkategorien

Ist-Werte sind begründete Heuristiken aus aktueller Quellstichprobe plus früherem lokalen Sichtaudit; keine neue Browsermessung. Mittelwert 70. Kategorien überschneiden sich funktional nicht: dieser Plan besitzt den räumlichen Vertrag, Informationshierarchie die Inhaltsrollen, Responsive seine technische Anpassung, Motion die Zeit-/Gestensteuerung.

| ID    | Unterkategorie              | Ist | Ziel | Befund und Beleg                                                   | Bottleneck? | LLM-Aufgabe / Zielnachweis                                                                                                                        |
| ----- | --------------------------- | --- | ---- | ------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| KR-01 | Hero-Breitenbudget          | 58  | 93   | H/C/J: flexible Headline plus 320/400 px ohne Shrink; H clippt.    | 🔴 JA       | Inhalt + Gaps + Innenränder passen in reale Contentbox; kein Text/CTA wird durch einen Vorfahren geclippt.                                        |
| KR-02 | Außenkanten und Padding     | 64  | 93   | Shell 16/24, P clamp bis24, H16/24, B10/24 pro Seite.              | 🔴 JA       | Eine gemeinsame Lobby-Außenkante für Hero, Bento, Feed; Abweichung ≤1 CSS-px bei Ruhe.                                                            |
| KR-03 | Vertikaler Rhythmus         | 74  | 93   | H minHeight440; B gridAutoRows140 und zusätzliche Bottom-Paddings. | 🔴 JA       | Inhaltsabhängige Höhe; Abschnittsabstand größer als zugehöriger Karteninnenabstand; keine leere Mindesthöhen-Lücke ohne Funktion.                 |
| KR-04 | Bühnenproportion            | 72  | 93   | A: 2×2 Featured; H: drei konkurrierende Volumen.                   | 🔴 JA       | Ein führendes Bildvolumen gemäß IH-06; Jackpot kompakt untergeordnet, fünf Spiele erreichbar.                                                     |
| KR-05 | Karteninnenräume            | 77  | 93   | A Meta9/11, J Panel16, C Panel14; R1/R2 existieren.                | Nein        | Wiederkehrende Innenkanten mit bestehenden Werten; Label, Zahl und Aktion kollidieren auch bei langen Namen nicht.                                |
| KR-06 | Crop und Motivfokus         | 70  | 93   | A/C verwenden pauschal center25%; C Bildhöhe175.                   | 🔴 JA       | Pro Spiel Fokuspunkt und sichere Textzone für Wide/Compact/Narrow festhalten; Hauptmotiv bleibt identifizierbar.                                  |
| KR-07 | Text- und Zahlvolumen       | 66  | 93   | A ellipsiert Titel, S nutzt enge fünf VIP-Spalten.                 | 🔴 JA       | Wichtigster Titel vollständig, Zahlen nicht abgeschnitten; unterstützende Texte dürfen umbrechen statt schrumpfen.                                |
| KR-08 | Bewegungs- und Fokusrand    | 61  | 93   | H mouse14° + scroll18°, A y−4/scale1.02, Container hidden.         | 🔴 JA       | Bei Motion-Maximum bleiben Fokusrahmen/CTA sichtbar; dekorativer Overflow wird separat begrenzt.                                                  |
| KR-09 | Tiefe und Kontrastzonen     | 76  | 93   | BG fixed, mehrere Canvas-/Glowlagen; A Lesbarkeitsverlauf.         | Nein        | Hinter Text eine ruhige Zone, Goldglanz dem Bild untergeordnet; BG pointer-events none bleibt erhalten.                                           |
| KR-10 | Zustands- und Abschlussraum | 82  | 93   | B dynamische Zellen und bottom80; Shell unten88 + Safe-Area.       | Nein        | Lade-/Leerzustände bewahren Gruppierung; letztes fokussierbares Element vollständig über Dock erreichbar, keine doppelt gestapelten Leerreserven. |

**90+-Abnahme:** Je KR-ID bewertet ein unabhängiges LLM fünf Achsen à 20 Punkte: Geometrie, optische Ausrichtung, Inhaltssicherheit, Zustandsrobustheit, Nachweisqualität. 18 = vollständiges Ziel mit konkretem Beleg, 20 = zusätzlich Grenzfälle fehlerfrei; ohne Beleg maximal 10 auf der betreffenden Achse. Jede Zeile ≥90 und Tabellenziel bestanden; Kategorie = Mittelwert. Planwerte von 93 sind Ziele, keine bereits verbuchten Verbesserungen. Die alte Heuristik wird nicht als Messung der neuen Rubrik behandelt.

## 3 — Kontext-Koffer

| Kürzel   | Reale Quelle                                                                                                                                                                                 | Rolle                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| P        | [page.tsx](../../../../../../src/app/page.tsx)                                                                                                                                               | Zusätzlicher Seitenrand clamp(0px,2vw,24px)                           |
| H        | [HeroCinematicShowcase](../../../../../../src/components/home/HeroCinematicShowcase.tsx), [HeroHeadlineColumn](../../../../../../src/components/home/hero-cinematic/HeroHeadlineColumn.tsx)  | Flexcontainer, Headline-Basis420/max480, Gaps28 und Padding24 Desktop |
| C/J      | [GameShowcaseCard](../../../../../../src/components/home/hero-cinematic/GameShowcaseCard.tsx), [JackpotPulseCard](../../../../../../src/components/home/hero-cinematic/JackpotPulseCard.tsx) | Feste 400/320 px, beide flexShrink0                                   |
| B        | [BentoLobbyHome](../../../../../../src/components/home/BentoLobbyHome.tsx)                                                                                                                   | Grid4/2, max1560, dense, 16/10 Gap                                    |
| A        | [BentoArcadeCells](../../../../../../src/components/home/bento/BentoArcadeCells.tsx)                                                                                                         | Bildfokus und Hoverraum                                               |
| S        | [BentoStripCells](../../../../../../src/components/home/bento/BentoStripCells.tsx), [BentoJackpotCells](../../../../../../src/components/home/bento/BentoJackpotCells.tsx)                   | Podium, VIP und Zahlenvolumen                                         |
| BG       | [LobbyAmbientBackground](../../../../../../src/components/home/LobbyAmbientBackground.tsx), [ParallaxImageBackground](../../../../../../src/components/home/ParallaxImageBackground.tsx)     | Dekorative Tiefe                                                      |
| Shell    | [MainLayout](../../../../../../src/components/layout/MainLayout.tsx), [MainSidebar](../../../../../../src/components/layout/MainSidebar.tsx)                                                 | Nur lesen: Sidebar240 Desktop, innerer Scrollcontainer, Shellpadding  |
| Referenz | [ElevatedGameCard](../../../../../../src/app/games/_components/ElevatedGameCard.tsx), [Motion-Tokens](../../../../../../src/lib/design/motion-tokens.ts)                                     | R1/R2: Radien16/14 und Hoverrahmen; bestehende Bewegungswerte         |
| Teiltest | [TournamentPodiumStrip.test](../../../../../../src/components/home/bento/__tests__/TournamentPodiumStrip.test.ts)                                                                            | Kein allgemeiner Geometrienachweis                                    |

**Nominalrechnung, keine Mindestbreitenmessung:** 420 + 320 + 400 + 2×28 + 2×24 = 1244 px Hero-Container bei Headline-Flexbasis. Dazu im heutigen Wide-Fall Sidebar240, Shellränder48, Seitenränder48: nominell 1580 px Viewport, zuzüglich möglicher Scrollbalken. Tatsächliches min-content der Bonuszeile und reale Borders separat messen; kein Breakpoint1580 blind ableiten.

## 4 — Räumlicher Entwurf

| Option | Komposition                                                          | Wann beste Wahl?                                | Abwägung                                |
| ------ | -------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------- |
| A      | Zwei Hauptvolumen: Claim + Featured; Jackpot als kompakte Folgezeile | Regelmäßig schmale Contentbox durch Sidebar     | Mehr Bildruhe, Jackpot weniger dominant |
| B      | Drei Volumen nur bei erfüllter Breitenbilanz, darunter zweispaltig   | Wide-Desktop soll heutige Inszenierung behalten | Mehr Layoutvarianten und Crop-Arbeit    |
| C      | Claim als kompakter Auftakt, Bento als einzige Spielbühne            | Startseite soll Auswahl sofort zeigen           | Weniger eigenständiger Cinematic-Hero   |

Empfehlung A. Jan-Gewichte Lerneffekt30/Einfachheit25/Risiko25/Wartbarkeit20: A 4/4/5/5 =4,45; B 5/2/3/3 =3,35; C 3/5/4/5 =4,15. A/C liegen0,30 auseinander; A gewinnt durch höher bewertete Risikogüte, weil es Hero und Reihenfolge ohne vollständige Bühnenverlagerung erhält. C führt bei bewusster Auswahlpriorität; B bei nachgewiesen überwiegenden breiten Ansichten. Dies sind Entwurfsurteile, keine Nutzungsstatistiken. Pre-Mortem: Scheitert A in sechs Monaten, wurden nachträglich zusätzliche Promo-Module in die freie Fläche gedrängt.

**Räumlicher Vertrag für die spätere Freigabe:**

- Gemeinsame Außenkante entsteht innerhalb der Lobby; globale Shellpadding-/Sidebarwerte bleiben zunächst erhalten. Lokale doppelte Paddings in P/H/B bewerten und konsolidieren.
- Wide = genügend Platz für Claim und Bild einschließlich Gutter; Compact = gleiche Reihenfolge mit früherem Umbruch; Narrow = einspaltiger Einstieg, nach Platz zwei kleine Spielkarten oder einspaltige Karten.
- Die gemessenen Mindestbreiten der Inhalte bestimmen den Wechsel. Den genauen technischen Trigger liefert Responsive; Raumwerte stammen aus bestehenden Tokens/Referenzen.
- Featured-Bild bekommt die größte zusammenhängende Bildfläche; Jackpot kein zweites gleich großes goldumrahmtes Zentrum.
- Text und Controls dürfen nie hinter einer Clipping-Kante verschwinden. Nur Bild-/Lichtlagen erhalten dekoratives Clipping.
- Schatten/Fokus benötigen Raum außerhalb der Bildmaske. Kein pauschales overflow-visible am gesamten Scrollsystem.
- Keine neuen Icons oder Embleme. Vorhandene Spielillustrationen bleiben Inhalte; berührte Symbolcontrols werden als Text geplant.
- [SOP04](../../../../../../xx_sop/04_design_system_ui.md), [R1/R2](../../../../../../.claude/skills/casino-design-system-craft/references/positiv-referenzen.md), [A2](../../../../../../.claude/skills/casino-design-system-craft/references/anti-patterns.md) bleiben Maßstab. Keine neue Farbidentität, keine ungemessenen globalen Z-Index-Werte.

**Nicht-Scope:** Inhalte neu priorisieren (Plan03), globale Shell neu bauen, Header/Sidebar redesignen, neue Bilder generieren, Spiele/Wallet/Auth/API ändern, responsive Engine (Plan05) oder Animationssteuerung (Plan06) duplizieren. Fremde Änderungen bewahren.

## 5 — Detaillierte LLM-Meilensteine

### L0 — Reale Raumaufnahme

LLM misst die Contentbox, alle Randebenen, min-content der Bonuszeile sowie Schatten-/Fokusumrisse. Screenshot bei 390/1024/1280/1536 px und einmal ≥1920 px; reale Viewport- und Contentbreite zusammen notieren. **Ergebnis:** nachvollziehbare Bilanz KR-01/02. **Abbruch:** Messung ohne aktive Shell oder unvollständig geladene Fonts → zuerst gültige Baseline. **Rücknahme:** keine Produktänderung.

### L1 — Gemeinsame Bühne

Nach Designwahl setzt LLM KR-01–04 innerhalb der Lobby um, ordnet lokale Paddings einer Verantwortungsstelle zu und macht die Hero-Höhe inhaltsabhängig. Referenzwerte wiederverwenden. **Ergebnis:** eine saubere Achse von Hero bis Feed. **Abbruch:** globale Scroll-/Navigationsgeometrie müsste verändert werden → K3-Review vor Erweiterung. **Rücknahme:** eigenes lokales Layoutpaket.

### L2 — Bild-/Texträume

LLM erstellt pro Spiel eine Crop-Matrix und setzt KR-05–08 um: Titel, Textaktion, Zahlen, Bildfocus und Fokusumriss. Größte zulässige Anzeige aus bestehendem Formatvertrag übernehmen; lange Testtexte nur als UI-Fixture. **Ergebnis:** keine Hauptinformation abgeschnitten, kein Motiv vom CTA zugedeckt. **Abbruch:** neues Asset oder kleinerer unlesbarer Font nötig → Crop/Layout erneut entwerfen. **Rücknahme:** eigene Crop-/Innenraumänderungen.

### L3 — Balance aller Zustände

LLM prüft KR-09/10 mit dunklem/hellem Bildausschnitt, leerem/befülltem Feed, fehlendem Bild und ruhender Animation. Höhe für nachladende Module reservieren, ohne starre übergroße Leerflächen. Letzte Feed-Aktion bis über Dock/Safe-Area scrollen und unteren Reserve-Eigentümer dokumentieren. **Ergebnis:** Textzone ruhig, Layout stabil. **Abbruch:** Kontrastverlust oder neue Überdeckung. **Rücknahme:** eigener Surface-/Placeholder-Diff.

### L4 — Übergabe und Abnahme

LLM liefert den räumlichen Vertrag an Plan05: Content-Mindestbreiten, Gaps, Reihenfolge, Crop pro Modus und Hover-Sicherheitsraum. Alle KR-IDs einzeln prüfen; der einfache Body-Overflowtest genügt nicht bei overflow:hidden-Vorfahren. **Abbruch:** versteckte Inhalte trotz passendem scrollWidth oder Score unter90. **Rücknahme:** nur problematisches eigenes Teilpaket, andere Änderungen erhalten.

### L5 — Dokumentation

LLM hält Nachherwerte und Belege fest; alle Statusänderungen und spätere Archivlinks pflegen. **Abbruch:** Ziel nur als Erwartung statt Sichtnachweis. **Rücknahme:** unzutreffenden Status korrigieren, vorhandene Pläne erhalten.

## 6 — Fünf Abschlussprüfungen der späteren Execution

`npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, anschließend `git diff --check` + `git status --short`. Keine unbeabsichtigten Dateien; fremde Baselinefehler separat, keine pauschale Grünbehauptung. Dazu alle zehn KR-Zielkriterien als Vergleichsansichten und DOM-Boxdaten in Ruhe/Hover/Fokus. Kein Testlauf wird durch diese Planungsdatei als bereits bestanden ausgewiesen.

## 7 — Recherche, Design-Abgleich und Selbstprüfung

[MDN minmax](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/minmax) beschreibt begrenzte flexible Tracks; [MDN object-position](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-position) die Positionierung des Motivs im Bildcontainer. Abruf06.09.2026. Die konkrete Zwei-Volumen-Komposition ist ein projektspezifischer Entwurf.

Jan-Planer und Casino Design System Craft eingesetzt; Kategorie fachlich durch read-only Agent `composition_review` geprüft. R1/R2 als Raum-/Materialreferenz, A2 als iconfreie Leitplanke, kein Tokenwechsel. Der Review ergänzt: Shell scrollt ein inneres div, Hero/Ambient beziehen Scrollwerte teilweise vom Window; sichtbare Scrollwirkung bleibt bis Plan06 ungeprüft. Offene Nachweise: aktuelle visuelle Baseline, reale Mindestbreiten, Crop-Abnahme. Zehn Dimensionen, LLM-Verantwortung, Abbruch/Rücknahme und Scope geprüft; Execution bleibt offen.
