# 03 — Startseite: Informationshierarchie

> **Status:** Geplant · **Stand:** 06.09.2026 · **Owner:** LLM · **Execution:** Nicht gestartet / nicht beauftragt
> **Scope:** Inhaltliche Rangfolge, Abschnittsstruktur und lesbare Rollen der vorhandenen Lobby-Inhalte.
> **Money-Pfad:** Nein, ausschließlich Präsentation · **Security-Review:** Keine Backend-Prüfung; bei Scope-Erweiterung neu einstufen.
> **Navigation:** [Startseiten-Scorecard](../../Startseite.md) · Kategorie 3 · Planung gemäß [Jan-Planer](../../../../../../xx_sop/shared/jan-planner/SKILL.md).

## 1 — Übersicht für Jan & Ausführungs-LLM

**Ist 71/100 → Ziel mindestens 92/100 je Unterkategorie.** Größte Engpässe: konkurrierende Hauptaktionen, fehlende Zustandsrelevanz und doppelte Featured-/Jackpot-Bühnen. Die Planung ist ausgearbeitet; Umsetzung und Zielerreichung sind offen.

| Nummer | Meilenstein                     | Scope                                     | Status  | Zuständigkeit | Verifikation                                                          |
| ------ | ------------------------------- | ----------------------------------------- | ------- | ------------- | --------------------------------------------------------------------- |
| L0     | Inhalts- und Zustandsbaseline   | H, C, B, F (Quellenregister unten)        | Geplant | LLM           | Inventar aller sichtbaren Aussagen/Aktionen und vorhandenen Zustände  |
| L1     | Hauptangebot und Aktionsrang    | H, C; IH-01 bis IH-03                     | Geplant | LLM           | Zustandsmatrix, ein Hauptweg je Zustand                               |
| L2     | Rollen, Proofs und Dichte       | B, A, J, F; IH-04 bis IH-06, IH-09, IH-10 | Geplant | LLM           | Vollständige Spiele-/Aktionsabdeckung, keine unmarkierten Demo-Proofs |
| L3     | Outline und Lesefolge           | B, A, S, F; IH-07/IH-08                   | Geplant | LLM           | DOM-/Tab-/Lesefolge und Überschriftenprüfung                          |
| L4     | Selbstprüfung und Abnahmebelege | Alle vorgenannten UI-Dateien              | Geplant | LLM           | Alle zehn Zielkriterien, fünf Abschlussprüfungen                      |
| L5     | Ergebnis dokumentieren          | Dieser Plan, Startseite.md                | Geplant | LLM           | Ist/Nachher getrennt, Links gültig, Execution korrekt                 |

Jan übernimmt ausschließlich die spätere Richtungs-/Sichtfreigabe; sämtliche Recherche-, Entwurfs-, Implementierungs-, Test- und Dokumentationsarbeit liegt beim LLM. In dieser Konversation wird nur geplant.

## 2 — Assessment mit zehn Unterkategorien

Scores sind Expertenheuristiken auf Basis aktueller Codeprüfung und der im Basis-Audit dokumentierten früheren Sichtprüfung; keine heutige neue Browserabnahme und keine statistischen Marktperzentile. Mittelwert der zehn Ist-Werte = 71. Zielwerte sind keine Leistungszusage. „🔴 JA“ bezeichnet prioritäre Engpässe; auch übrige Zeilen erhalten Aufgaben.

| ID    | Unterkategorie               | Ist | Ziel | Befund und Beleg                                                          | Bottleneck? | LLM-Aufgabe / überprüfbares Ziel                                                                                             |
| ----- | ---------------------------- | --- | ---- | ------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| IH-01 | Aussage und Erstorientierung | 78  | 92   | H: Absatz bündelt Bonus, Fairness, Auszahlung, Rakeback.                  | Nein        | Ein belegbares Hauptversprechen + unterstützender Satz; Claims aus Bestand, keine erfundenen Garantien.                      |
| IH-02 | Handlungsrangfolge           | 68  | 92   | H/J/C: Bonus, Jackpot, Games-Link und Play konkurrieren.                  | 🔴 JA       | Eine dominante Aktion und eine Textalternative pro Hero-Zustand; weitere Aktionen untergeordnet.                             |
| IH-03 | Zustandsrelevanz             | 65  | 92   | C: Bonushandler unabhängig vom Sessionzustand; Onboarding-Prop ungenutzt. | 🔴 JA       | Gast, angemeldet und unbekannt abbilden; unbekannt zeigt neutralen Games-Link, keine behauptete Bonusberechtigung.           |
| IH-04 | Redundanz                    | 67  | 92   | B + C: Jackpot in Hero und Bento, zweite Spielebühne.                     | 🔴 JA       | Für jedes Vorkommen Zweck festlegen; eine ausführliche Jackpot-Darstellung, andere höchstens kompakter Kontext.              |
| IH-05 | Proof-Rangfolge              | 72  | 92   | H: drei Trust-Chips; C/J: weitere Online-/RTP-Angaben.                    | 🔴 JA       | Ein kontextueller Proof am Hauptangebot; ungeklärte Aussagen nicht hervorheben.                                              |
| IH-06 | Featured versus Auswahl      | 76  | 92   | A: starke 2×2-Crash-Karte; C: zweite Featured-Bühne.                      | Nein        | Ein führendes Spielmotiv je Einstiegsbereich; alle fünf Spiele weiterhin erreichbar.                                         |
| IH-07 | Abschnittsfolge              | 70  | 92   | B: Arcade, Stream, Jackpot, Stats, Turnier, VIP, Feed; dense Grid.        | 🔴 JA       | Verbindliche semantische Folge festhalten; Tastatur springt nicht gegen die sichtbare Bedeutungsfolge.                       |
| IH-08 | Überschriften und Regionen   | 75  | 92   | H hat h1; viele A/S/J-Titel div/span; B und Shell jeweils main.           | 🔴 JA       | Eine Hauptregion, aussagekräftige H1/H2/H3-Outline; Shell zunächst lesen, Lobby-main bei Verschachtelung als section planen. |
| IH-09 | Kartendichte                 | 68  | 92   | A: kleine Badge-Metadaten; C: Tabs, Online, Simulation, Proof, Play.      | 🔴 JA       | Kartenbudget: Spielname + Aktion verpflichtend, maximal zwei unterstützende Metadaten; Rest in vorhandene Details.           |
| IH-10 | Status, Demo und Aktion      | 71  | 92   | F: lokale STREAM_ENTRIES; C: Math.random-Simulation unter Live-Label.     | 🔴 JA       | Vorführdaten sichtbar als Vorschau kennzeichnen oder Live-Anspruch entfernen; Aktion durch Text und Fläche erkennen.         |

**90+-Regel:** Nach Umsetzung bewertet ein unabhängiges LLM jede Zeile auf fünf Achsen à 0–20: Rollenverständlichkeit, visuelle Priorität, Zustandsvollständigkeit, semantische Bedienbarkeit, Nachweisqualität. 18 bedeutet vollständig mit konkretem Prüfbeleg, 20 zusätzlich fehlerfreie Grenzfälle; fehlender Beleg maximal 10 auf dieser Achse. Jede Zeile muss ≥90 und ihr Tabellen-Zielkriterium erfüllen. Der Kategorienwert ist das Mittel; kein hoher Mittelwert darf eine Zeile unter 90 verdecken. Die Ist-Werte bleiben als historische Heuristik gekennzeichnet und werden nicht als Messung dieser neuen Rubrik ausgegeben.

## 3 — Kontext-Koffer

| Kürzel | Quelle                                                                                                                                                                                  | Relevante Verantwortung                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| H      | [HeroHeadlineColumn](../../../../../../src/components/home/hero-cinematic/HeroHeadlineColumn.tsx)                                                                                       | Claim, Bonus, Trust, Games-Link                                                                              |
| C      | [HeroCinematicShowcase](../../../../../../src/components/home/HeroCinematicShowcase.tsx), [GameShowcaseCard](../../../../../../src/components/home/hero-cinematic/GameShowcaseCard.tsx) | Komposition, Demo-Status, Tabauswahl; Bonushandler kopiert VIPPRO, zeigt Toast, navigiert /vault?code=VIPPRO |
| B      | [BentoLobbyHome](../../../../../../src/components/home/BentoLobbyHome.tsx)                                                                                                              | Abschnittsfolge und dynamische Leaves                                                                        |
| A      | [BentoArcadeCells](../../../../../../src/components/home/bento/BentoArcadeCells.tsx)                                                                                                    | Fünf Spiele, Featured-/Satellitenrollen                                                                      |
| J      | [JackpotPulseCard](../../../../../../src/components/home/hero-cinematic/JackpotPulseCard.tsx), [BentoJackpotCells](../../../../../../src/components/home/bento/BentoJackpotCells.tsx)   | Zwei Jackpot-Darstellungen                                                                                   |
| S      | [BentoStripCells](../../../../../../src/components/home/bento/BentoStripCells.tsx)                                                                                                      | Turnier/VIP-Titel und Details                                                                                |
| F      | [LiveHighlightStream](../../../../../../src/components/home/bento/LiveHighlightStream.tsx), [LiveActivityFeedV2](../../../../../../src/components/social/LiveActivityFeedV2.tsx)        | Demonstration versus Aktivitätsliste                                                                         |
| Shell  | [MainLayout](../../../../../../src/components/layout/MainLayout.tsx)                                                                                                                    | main-Landmark und vorhandene Sitzungsanzeige; nur lesen                                                      |
| Tests  | [TournamentPodiumStrip.test](../../../../../../src/components/home/bento/__tests__/TournamentPodiumStrip.test.ts)                                                                       | Bestehender Teilnachweis, keine vollständige Hierarchieabnahme                                               |

Verbindlich: [SOP 04](../../../../../../xx_sop/04_design_system_ui.md), [aktuelle Designreferenzen](../../../../../../.claude/skills/casino-design-system-craft/references/positiv-referenzen.md), [Anti-Patterns A2](../../../../../../.claude/skills/casino-design-system-craft/references/anti-patterns.md). Obsidian/Gold, vorhandene Tokens, Monospace für dynamische Werte; berührte Controls iconfrei mit sichtbaren Textlabels. R1/R2 sind Referenzen für Rang und Interaktion, kein Anlass, neutrale /games-Flächen auf die Lobby zu übertragen.

**Nicht-Scope:** Spielregeln, Wallet, Auth-Implementierung, Bonusberechtigung, neue Tracking-Events, neue Datenendpunkte, neue Assets, globale Navigation, andere sechs Scorecard-Kategorien. Keine fremden Änderungen zurücksetzen. Ein vorhandenes Datum oder eine Quote wird nicht allein durch Neugestaltung zu einem bestätigten Proof.

## 4 — Entwurf zur späteren Freigabe

| Option | Konzept                                           | Wann sinnvoll?                                    | Aufwand / Risiko                                                  |
| ------ | ------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| A      | Spiele zuerst: ein Featured-Spiel, Bonus sekundär | Wiederkehrende Nutzung mit schnellem Einstieg     | Home-Präsentation, keine neuen Datenabhängigkeiten                |
| B      | Angebot zuerst: Bonus, dann Games                 | Klarer Akquise-Fokus                              | Weniger direkte Spielepriorität; bestehender Handler bleibt nötig |
| C      | Gast/Session-Varianten                            | Verlässlich verfügbare vorhandene Sitzungsanzeige | Zusätzliche Lade-/Unbekannt-Zustände und Präsentationsadapter     |

Empfehlung A als initiale Präsentationsrichtung; C erst bei belegtem Zustandstransport. Jan-Gewichtung Lerneffekt 30 %, Einfachheit 25 %, geringes Risiko 25 %, Wartbarkeit 20 %. A: 4/5/5/5 = 4,70; B: 3/5/5/5 = 4,40; C: 5/2/3/3 = 3,35. Bewertungen sind Entwurfsurteile: A/B verwenden bestehende Navigation, C benötigt einen bislang im Hero fehlenden Zustand. A führt auch nach Risiko-Gegenprobe gegenüber B (gleiches Risiko, höherer Lerneffekt durch klare Rollen). B führt bei bestätigtem Akquiseauftrag; C führt, wenn Gast-/Session-Differenzierung priorisiert und der Adapter belegt ist. Pre-Mortem: Scheitert A in sechs Monaten, wurde das Hauptspiel so dominant, dass die vier Alternativen kaum auffindbar sind.

Keine Variante gilt durch diese Datei als freigegeben. Die spätere Auswahl ist ein Gate für Execution, kein Hindernis für die fertige Planung.

**Abgrenzung IH-03:** Bei A/B wird die unveränderte Präsentation für Gast/angemeldet/unbekannt geprüft, ohne neue Session-Abhängigkeit einzubauen; keine Bonusberechtigung behaupten. Unterschiedliche CTAs je Sessionzustand sind ausschließlich Bestandteil von Option C und erfordern den dort belegten Zustandstransport. Die Zustandsmatrix ist ein Prüfvertrag, kein verdeckter Auftrag für Auth-Implementierung.

## 5 — Detaillierte Meilensteine

### L0 — Baseline

LLM erfasst alle sichtbaren Inhalte, Ziele, Heading-Tags, Demo-Herkünfte und Zustände in einer Vorher-Matrix. Aktuellen Quellstand und lokale Ansichten 390/1024/1280/1536 px sichern; Gast nicht aus einem bloßen 0-Dollar-Ladeframe ableiten. **Ergebnis:** belastbarer Zustand pro Ansicht. **Abbruch:** Sitzung oder Datenherkunft unklar → neutralen Entwurf dokumentieren, keine Berechtigung erfinden. **Rücknahme:** keine Produktänderung in L0.

### L1 — Hauptangebot

LLM setzt erst nach späterer Freigabe IH-01–03 um: Überschrift, erklärender Satz und Haupt-/Nebenaktion; bestehendes Bonus-Kopieren, Toast und Navigationsziel bewahren, wenn die Bonusaktion angeboten wird. **Ergebnis:** ein erklärbarer Hauptweg je Zustand. **Abbruch:** neue Auth-/Bonuslogik nötig → separate Aufgabe, aktueller Handler bleibt erhalten. **Rücknahme:** ausschließlich eigener Präsentationsdiff.

### L2 — Inhalte gewichten

LLM ordnet IH-04–06/09/10 nach Rollen, reduziert doppelte ausführliche Informationen und kennzeichnet Demo-Status. Keine Zahlen durch attraktivere Werte ersetzen. **Ergebnis:** fünf Spiele erreichbar; Status auch ohne Bewegung verständlich. **Abbruch:** Information nur noch per Hover zugänglich oder ein Spiel fehlt. **Rücknahme:** eigenes Inhaltslayout zum vorherigen Stand.

### L3 — Semantik

LLM setzt IH-07/08 um: Outline, Regionsnamen und DOM-Folge; kein positives tabindex und keine optische CSS-Umsortierung bedeutungstragender Inhalte. **Ergebnis:** nachvollziehbare Lesefolge bei ausgeschaltetem CSS und per Tastatur. **Abbruch:** Shell-Umbau wäre nötig → K3-Review, nicht beiläufig erweitern. **Rücknahme:** nur eigene semantische Änderungen.

### L4 — Nachweise

LLM prüft alle IH-Zeilen in Gast/angemeldet/unbekannt und leer/befüllt/Vorschau, soweit als bestehender Präsentationszustand verfügbar. Fehlende Zustände später mit isolierten UI-Fixtures testen; keine neuen Backendfälle erzeugen. **Abbruch:** irgendein Ziel unbewiesen oder ein Kernlink verloren → Execution offen. **Rücknahme:** fehlgeschlagenes eigenes Teilpaket, vorhandene Nutzerdiffs erhalten.

### L5 — Übergabe

LLM dokumentiert Vorher/Nachher pro IH-ID, Screenshot-/Testnachweis, Restlücken und neuen Score. Erst nach Freigabe und bestandener Prüfung Execution als abgeschlossen markieren; Archivierung gemäß Jan-Planer und alle eingehenden Links aktualisieren. **Abbruch:** Ziel nur geschätzt. **Rücknahme:** falsche Statusbehauptung korrigieren, keine Dokumente löschen.

## 6 — Fünf Abschlussprüfungen der späteren Execution

1. `npm run typecheck`: keine neu verursachten Fehler.
2. `npm test`: Hierarchie-/Zustandsregressionen und bestehende Tests grün; reine Quelltexttests ersetzen keine Sichtprüfung.
3. `npm run lint`: keine neuen Fehler.
4. `npm run build`: erfolgreich.
5. `git diff --check` und `git status --short`: Änderungen dem eigenen Scope zuordnen; fremde Baselinefehler separat dokumentieren, keinen Gesamterfolg behaupten.

Zusätzlich alle zehn IH-Zielkriterien mit lokalen Ansichten, Keyboard und DOM-Outline belegen. Dieser Plan ist keine Behauptung, dass diese Execution-Prüfungen bereits gelaufen sind.

## 7 — Recherche, Design-Abgleich und Plan-Selbstprüfung

[W3C: Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/) stützt die erkennbare Gliederung. [W3C: Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) stützt die Erhaltung bedeutungstragender Lesereihenfolge. Abruf 06.09.2026; die konkrete Featured-/CTA-Entscheidung ist unsere Designempfehlung, kein W3C-Gebot.

Eingesetzt: Jan-Planer, Casino Design System Craft und read-only Agent `hierarchy_review`. Referenz R1/R2 und A2 abgeglichen; veraltete Utility-Icon-Ausnahme und starre 480-px-Behauptung im Basisplan identifiziert. Tokens unverändert; Interaktion, Performance und 92-Ziele sind spätere Abnahmeaufgaben. Planprüfung: zehn getrennte Dimensionen, alle Aufgaben einem LLM zugeordnet, Nicht-Scope und Abbruch/Rücknahme je Meilenstein vorhanden. Offenes Gate: spätere Designwahl; keine Execution gestartet.
