# 06 — Startseite: Motion & Interaktion

> **Status:** Geplant · **Stand:** 07.09.2026 · **Owner:** LLM · **Execution:** Nicht gestartet / nicht beauftragt
> **Scope:** Choreografie, direkte Rückmeldung, Bewegungsreduktion und Lifecycle der Lobbyeffekte.
> **Money-Pfad:** Nein · **Planung, Umsetzung und Tests:** ausschließlich LLM; Jan nur spätere Designwahl/Endabnahme.
> [Startseiten-Scorecard](../../Startseite.md) · Voraussetzungen: [Informationshierarchie](../03_Informationshierarchie/Plan.md), [Komposition & Raum](../04_Komposition_Raum/Plan.md), [Responsive Design](../05_Responsive_Design/Plan.md).

## 1 — Übersicht für Jan & Ausführungs-LLM

**Historischer visueller Score81/100; neue vertiefte Detaildiagnose68,5/100 → Ziel93/100 je Unterkategorie.** Die vorhandenen Effekte erzeugen bereits Tiefe. Ihre Steuerung ist jedoch nicht durchgehend auf Touch, Reduced Motion, Fokus und Unterbrechungen abgestimmt. Die neue Detaildiagnose gewichtet diese zuvor unzureichend geprüften Aspekte stärker; sie ist keine gemessene Verschlechterung seit gestern. Der historische Score in der Hauptdatei bleibt als Ausgangsaudit erhalten.

**Designempfehlung:** Eine reaktive Featured-Card als Signature-Moment; Bedienflächen bleiben räumlich stabil. Hintergrundbewegung wird leise und optional. Ein schneller, verlässlicher Zustandswechsel ist wichtiger als eine zusätzliche Animation.

| Nummer | Meilenstein                        | Scope                            | Status  | Zuständigkeit | Verifikation                                     |
| ------ | ---------------------------------- | -------------------------------- | ------- | ------------- | ------------------------------------------------ |
| L0     | Effektinventar und Baseline        | H, A, BG, Stream, Feed           | Geplant | LLM           | Jeder Effekt mit Trigger, Owner und Ruhemodus    |
| L1     | Lokale Motion-Policy               | H, BG, Hooks; MI-02–05           | Geplant | LLM           | Dynamische Präferenz-/Gerätewechsel              |
| L2     | Choreografie und direktes Feedback | A, H, Referenz; MI-01/03/07      | Geplant | LLM           | Eine dominante Bewegung, stabile Trefferflächen  |
| L3     | Pause, Übergänge und Zustände      | Stream, Modal, Feed; MI-06/08/09 | Geplant | LLM           | Fokus, Escape, Unterbrechung, Zustandsklarheit   |
| L4     | Performance und Regression         | Lokale Komponenten, Tests; MI-10 | Geplant | LLM           | Profiler, Lifecycle-Tests, Reduced-Motion-Videos |
| L5     | Neubewertung und Dokumentation     | Dieser Plan, Startseite.md       | Geplant | LLM           | Alle zehn Einzelziele belegt                     |

## 2 — Assessment: zehn Unterkategorien

Quellprüfung07.09.2026 plus historischer Sichtaudit; keine neuen Laufzeit-/Performancewerte. Ist-Werte sind begründete Heuristiken,100=bestmöglich, keine Marktperzentile. Schwere Steuerungslücken werden nicht durch schöne Einzelanimationen ausgeglichen.

| ID    | Unterkategorie                     | Ist | Ziel | Befund und Beleg                                                                                                                                             | Bottleneck? | LLM-Aufgabe / Zielnachweis                                                                                                                                          |
| ----- | ---------------------------------- | --- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MI-01 | Bewegungsdramaturgie               | 78  | 93   | H FloatingParticles, A Ken-Burns, BG Canvas/Parallax und Stream/VIP-Pulse gleichzeitig möglich.                                                              | 🔴 JA       | Ein benannter Signature-Effekt pro Blickzone; keine konkurrierenden Dauerpulse um CTA/Featured. Ruheansicht bleibt hochwertig.                                      |
| MI-02 | Vollständige Reduced-Motion-Policy | 52  | 93   | FloatingParticles/Magnetic ohne Guard; BG/Reaction lesen Präferenz nur beim Mount; Safe-Hook vorhanden.                                                      | 🔴 JA       | Beim Start und Umschalten alle dekorativen Loops stoppen, Transformwerte neutralisieren; Inhalte und direkte Rückmeldung bleiben.                                   |
| MI-03 | Pointer und räumliche Stabilität   | 68  | 93   | H Tilt14° plus Scroll18°; Magnetic verschiebt CTA; useTiltGlare schützt Events, setzt beim Policywechsel Werte nicht explizit zurück.                        | 🔴 JA       | Tilt ausschließlich dekorative Bildlage bei hover+fine; Controls/Fokus unbewegt. Coarse Pointer, pointercancel und Blur enden im Ruhezustand.                       |
| MI-04 | Scrollbezug und Parallax           | 60  | 93   | H useScroll ohne container; BG hört window.scroll. Shell scrollt ein inneres div.                                                                            | 🔴 JA       | Tatsächlichen Scrollowner nachweisen; entweder korrekt anbinden oder Scroll-Tilt entfernen. Kein Scroll-Hijacking und kein neuer Shell-Umbau.                       |
| MI-05 | Effekt-Lifecycle und Leerlauf      | 61  | 93   | H Timer800ms mit Mount-Mobilecheck; BG rAF ohne eigene Visibilitypause. Cleanup beim Unmount ist vorhanden; H startet auch bei initial verborgenem Dokument. | 🔴 JA       | Versteckter Tab/offscreen deaktiviert rein dekorative Arbeit; Resize/Reaktivierung erzeugt genau einen Loop, keine nachgeholten Animationsbursts.                   |
| MI-06 | Pause und Nutzerkontrolle          | 67  | 93   | Stream pausiert Hover/Hauptbutton-Fokus/Modal, aber ein gemeinsames Boolean; Nebenbuttons ohne Fokus-Pause.                                                  | 🔴 JA       | Explizite Text-Pause/Weiter-Funktion oder statischer Stream; alle Fokus-/Modal-/Hovergründe logisch getrennt. Mausverlassen darf fokussierten Stream nicht starten. |
| MI-07 | Hover-, Fokus- und Active-Feedback | 75  | 93   | A und Feed skalieren; R1 bietet Materialwechsel. Rückmeldung/Focus nicht überall gleichwertig.                                                               | 🔴 JA       | Jede Lobbyaktion hat klaren Ruhe-, Hover-, Focus-, Active- und zutreffenden Disabled-Zustand; ohne Hover vollständig bedienbar, ohne neue Icons.                    |
| MI-08 | Zustandswechsel und Dialoge        | 74  | 93   | Stream hat keyed Presence; Modal kehrt vor eigener Presence bei !win zurück, Exit kann so nicht regulär ablaufen.                                            | 🔴 JA       | Persistente Presence-Grenze für gewollte Exits, stabile Keys, schneller Wechsel bleibt korrekt; Dialog-Fokus, Escape und Rückkehr nach Schließen getestet.          |
| MI-09 | Zahlen- und Ereignisfeedback       | 80  | 93   | H simuliert Multiplikatoren; Stream enthält kuratierte Einträge, echter Feed separiert.                                                                      | Nein        | Demo eindeutig gemäß Plan03; keine simulierte Gewinnbestätigung. Zahlenbreite stabil, Status zusätzlich als Text, Screenreader nicht pro Tick überfluten.           |
| MI-10 | Renderkosten und Nachweis          | 70  | 93   | Magnetic setState pro MouseMove; Stream animiert width; Feed transition:all; kein neuer Profilerlauf.                                                        | 🔴 JA       | Kein React-Commit pro Pointertick, keine layouttreibende Progressanimation, keine pauschale all-Transition; vorher/nachher Profil und Lifecycle-Tests.              |

**90+-Abnahme:** Je MI-ID fünf Achsen à20: gestalterischer Zweck, Steuerbarkeit, zugängliche Alternativen, Zustandsrobustheit, Nachweisqualität.18=vollständiges Tabellenziel mit Beleg;20=zusätzliche Grenzfälle fehlerfrei. Ohne Beleg höchstens10 auf der betroffenen Achse. Jede ID≥90 und ihr Muss-Kriterium bestanden; Mittelwert bildet neue Kategoriebewertung.93 ist ein Planungsziel, kein Execution-Ergebnis. Bei fehlendem Reduced-Motion-/Fokusnachweis kein90+-Freigabestatus.

## 3 — Kontext-Koffer

| Kürzel   | Reale Quelle                                                                                                                                                                                                                                                                             | Rolle                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| H        | [HeroCinematicShowcase](../../../../../../src/components/home/HeroCinematicShowcase.tsx), [GameShowcaseCard](../../../../../../src/components/home/hero-cinematic/GameShowcaseCard.tsx), [FloatingParticles](../../../../../../src/components/home/hero-cinematic/FloatingParticles.tsx) | Tilt, Demo-Timer und Dauerpartikel                                   |
| A        | [BentoArcadeCells](../../../../../../src/components/home/bento/BentoArcadeCells.tsx), [BentoStripCells](../../../../../../src/components/home/bento/BentoStripCells.tsx)                                                                                                                 | Cards, Ken-Burns, VIP, Hoverereignisse                               |
| BG       | [LobbyAmbientBackground](../../../../../../src/components/home/LobbyAmbientBackground.tsx), [ParallaxImageBackground](../../../../../../src/components/home/ParallaxImageBackground.tsx), [useLobbyReactionFx](../../../../../../src/components/home/useLobbyReactionFx.ts)              | Canvas, Pointerdrift, Wellen/Kometen                                 |
| Hooks    | [useSafeMotion](../../../../../../src/hooks/useSafeMotion.ts), [useTiltGlare](../../../../../../src/hooks/useTiltGlare.ts), [Magnetic](../../../../../../src/components/ui/Magnetic.tsx)                                                                                                 | Bestehende Primitives; gemeinsame Consumer vor Eingriff prüfen       |
| Stream   | [LiveHighlightStream](../../../../../../src/components/home/bento/LiveHighlightStream.tsx)                                                                                                                                                                                               | Auto-Rotation4200ms, Pause, Progress, Demo                           |
| Modal    | [HighrollerWinDetailModal](../../../../../../src/components/home/HighrollerWinDetailModal.tsx), [RankBenefitsModal](../../../../../../src/components/casino/RankBenefitsModal.tsx)                                                                                                       | Lobby-geöffnete Dialoge und Presence-Grenzen                         |
| Feed     | [LiveActivityFeedV2](../../../../../../src/components/social/LiveActivityFeedV2.tsx)                                                                                                                                                                                                     | Filter, Zeilenwechsel, echte Feedansicht                             |
| Shell    | [MainLayout](../../../../../../src/components/layout/MainLayout.tsx)                                                                                                                                                                                                                     | Lesen: Scrollowner, Overlaykontext; globaler Umbau nicht freigegeben |
| Referenz | [Motion-Tokens](../../../../../../src/lib/design/motion-tokens.ts), [ElevatedGameCard](../../../../../../src/app/games/_components/ElevatedGameCard.tsx), [SOP16](../../../../../../xx_sop/16_motion_and_ui_polish.md), [SOP04](../../../../../../xx_sop/04_design_system_ui.md)         | Vorhandene Dauern/Springs, R1/R2, Layerregeln                        |
| Tests    | [performance-mobile.test.ts](../../../../../../src/lib/meta/__tests__/performance-mobile.test.ts), [Responsive-Audit](../../../../../../scripts/fast-responsive-audit.mjs)                                                                                                               | Teilnachweise, keine vollständige Motion-Abnahme                     |

**Invarianten:** Installierte Framer-Motion12-Imports und vorhandene Tokens bleiben; aktuelle Motion-Dokumentation ist keine Erlaubnis für Paketwechsel oder neue Premium-Abos. Shared Hooks nicht unbemerkt projektweit umstellen: Consumerinventar und additiver lokaler Opt-in, sonst Scope-Review. Reduced Motion muss auch Canvas, CSS-Loops und Timer erfassen; MotionConfig allein erledigt das nicht.

**Nicht-Scope:** Globale Seitenübergänge, Scrollsystem/Sidebar umbauen, Audio-/Tracking-System verändern, neue Spieleffekte, API-/Wallet-/RNG-Logik, neue Datenfeeds, AI-Bilder generieren, gemeinsame Design-SOPs aufräumen. Kein Feature darf echte Datenaktualisierung pausieren, nur weil dekorative Darstellung pausiert. Layoutmaße kommen aus Plan04/05, Inhaltsrollen aus Plan03. Fremde Edits erhalten.

## 4 — Optionen und Choreografie-Vertrag

| Option | Ansatz                                                                         | Nutzen                                               | Risiko                                                  |
| ------ | ------------------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------- |
| A      | Eine reaktive Featured-Card; ruhige Controls, statische/optionale Ambientebene | Starke eigene Bühne mit klar begrenztem Effektbudget | Weniger Dauer-Spektakel als heute                       |
| B      | Bestehende Cinematic-Effekte behalten und vollständig orchestrieren            | Maximale sichtbare Kontinuität                       | Viele kombinierte Zustände, hohe Test- und Renderkosten |
| C      | Rein zustandsbezogene Materialwechsel und kurze Fades                          | Sehr klare, zugängliche und wartbare Interaktion     | Weniger ausgeprägter räumlicher Signature-Moment        |

**Empfehlung A.** Gewichte Lerneffekt30/Einfachheit25/Risikogüte25/Wartbarkeit20; A4/4/5/5=4,45; B5/2/2/2=2,90; C3/5/5/5=4,40. A/C sind nahezu gleichwertig: A gewinnt knapp wegen des gewünschten erlebbaren Bildmoments; C bei Fokus auf maximale Ruhe. B nur nach expliziter Wahl samt Testbudget. Pre-Mortem A: jede neue Karte erhält nachträglich eine eigene Sonderanimation. Gegenmittel: Effektinventar und ein benannter Owner pro sichtbarer Blickzone.

| Ebene                  | Normalmodus                                                   | Reduced Motion / Touch                                   | Unterbrechung                                                           |
| ---------------------- | ------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| CTA und Textcontrol    | R1-Materialwechsel, begrenztes Active-Feedback                | Stabile Geometrie, sofortiger Farb-/Textstatus           | Kein wanderndes Klickziel                                               |
| Featured-Art           | Begrenzter R2-naher Tilt der Bildlage bei hover+fine          | Statischer Crop; kein Pointer-/Scroll-Tilt               | Pointerleave/cancel, Blur oder Policywechsel setzt neutral              |
| Hintergrund            | Höchstens eine dezente freigegebene Bewegungsfamilie          | Statisches Bild; keine Dauerpulse                        | Hidden/offscreen pausiert eigene dekorative Arbeit                      |
| Stream                 | Bevorzugt statisch; falls Rotation, explizite Textsteuerung   | Keine automatische Rotation; Einträge manuell erreichbar | Pausegründe bleiben unabhängig wirksam                                  |
| Dialog / Inhaltstausch | Vorhandene kurze Tokens/Varianten, vollständiger Fokusvertrag | Kurzer nicht räumlicher Übergang oder sofort             | Letzter gültiger Zustand gewinnt, keine Exit-Warteschlange für Aktionen |

Die Tabelle ist ein Entwurf zur späteren Freigabe. Neue Kombinationen werden nicht als bereits geltender Referenzstandard ausgegeben.

**Technischer Kern in einfachen Worten:** Layoutmodus, Eingabefähigkeit und Bewegungswunsch sind drei unterschiedliche Signale. Ein Effekt darf nur laufen, solange seine Bedingungen aktuell erfüllt sind; beim Abschalten werden auch bereits laufende Animationen und gespeicherte Transformwerte beendet, nicht nur zukünftige Events ignoriert.

## 5 — Detaillierte LLM-Meilensteine

### L0 — Inventar und bewegte Baseline

LLM inventarisiert jeden Effekt mit Datei, Trigger, animierten Properties, Loop/Timer, Sichtbarkeitsabhängigkeit, Cleanup, Reduced-Motion- und Fokusverhalten. Den tatsächlichen Scrollcontainer mit DOM-/Scrollwerten belegen. Videos und Profilertrace vor Änderungen aufnehmen; Effekte dabei bewusst auslösen, keine rein statische Screenshot-Abnahme. **Abbruch:** aktive Renderkette/Version oder Ursprung eines Effekts unklar. **Rücknahme:** keine Produktänderung.

### L1 — Policy und Lifecycle

LLM implementiert nach Freigabe einen lokal begrenzten Vertrag für MI-02–05. Responsive-Modus nicht als Eingabegerät missverstehen. Präferenzen, document visibility, In-View und Pausegründe reaktiv beobachten; bei Disable Listener/Timer/rAF beenden und Werte neutralisieren. Mit Hooks keine bedingten Hookaufrufe erzeugen. Scroll-Tilt bei A bevorzugt entfernen; nur bei bewusster Beibehaltung an belegten Container anschließen.

**Abbruch:** Änderung benötigt globalen Scroll-/Provider-Umbau oder stoppt fachlich nötige Datenaktualisierung. **Rücknahme:** eigenes lokales Policy-/Lifecyclepaket; Shared-Consumer unverändert lassen.

### L2 — Signature und stabile Controls

LLM setzt MI-01/03/07 um. Featured-Art übernimmt den räumlichen Moment, Text/CTA bleiben außerhalb der bewegten Bildmaske. R1-Materialwechsel statt magnetisch wandernder Hauptaktion; auf der Lobby Magnetic-Nutzung entfernen oder lokal deaktivieren, nicht blind alle Consumer verändern. Hover-/Active-Feedback aus Referenzwerten; Focus sichtbar und nicht animationsabhängig. Kein neuer Cursor, kein Scroll-Hijacking.

**Abbruch:** Fokus/Hit-Area wandert oder KR-08-Bewegungsfreiraum reicht nicht. **Rücknahme:** eigener Effekt-Diff; auf statisches Referenzverhalten zurückfallen.

### L3 — Kontrollierte Streams und Dialoge

LLM setzt MI-06/08/09 um. Bei Rotation Pausegründe getrennt als hover, focus-within, userPaused, modalOpen und hidden behandeln; logisches ODER bestimmt Pause. Kein mouseleave darf focus-within aufheben. Benannte Textsteuerung bleibt touch-/tastaturbedienbar; nach Pause einen neuen vollständigen Zyklus konsistent starten, keine verpassten Einträge nachholen. Fortschritt per scaleX/transform-origin statt width animieren, sofern überhaupt beibehalten. Alle Einträge bleiben im ruhigen Modus erreichbar.

Presence muss während des Austritts bestehen bleiben; stabile Keys und Exits nur dort, wo ein Austritt tatsächlich vorgesehen ist. Modal-Schließen über Textbutton, Escape und Backdrop prüfen; Dialogsemantik, Fokusbindung und Rückkehr zum auslösenden Element sicherstellen. Falls Trigger beim Wechsel entfällt, sinnvolles stabiles Ersatz-Fokusziel definieren. Keine bloße AnimatePresence-Hülle als Zugänglichkeitsnachweis behandeln. Demo-Status aus Plan03 übernehmen; keine neue Live-/Gewinnautorität.

**Abbruch:** Fokus geht verloren, Rotation läuft unter aktivem Pausegrund oder Demo wirkt wie echte Auszahlung. **Rücknahme:** eigenes Stream-/Modalpaket, zustandsbezogene Sofortdarstellung als sichere lokale Rückfallebene.

### L4 — Kosten, Unterbrechung und Gegenprüfung

LLM ergänzt verhaltensbasierte Tests im bestehenden Projektstil; neue lokale Testpfade vorher im Dateimanifest benennen. Framer-/Next-Version vor Code gegen installierte Dokumentation prüfen. Kein React-State für hochfrequente reine Pointerposition; MotionValues bzw. bestehende Primitives nutzen. transition:all entfernen, Properties explizit begrenzen. R1-Farbwechsel dürfen als Referenzmaterialwechsel bleiben; daraus keine neue animierte Layoutproperty ableiten.

Pflichtszenarien:

- Reduced Motion bereits beim Laden sowie mitten im Hover/Stream/Canvas ein- und ausschalten; statische Werte und gestoppte dekorative Loops prüfen.
- 390→1280→390 ohne Reload, breite Touchansicht, schmale Mausansicht, pointercancel, Fensterblur und Fokus auf Nebenlisten-Buttons.
- Tab verstecken/wieder zeigen, Scroll außerhalb der Effektzone, danach wieder hinein; je Effekt höchstens eine eigene aktive Subscription, kein Nachholburst.
- Stream fokussieren und Maus gleichzeitig verlassen; danach Modal öffnen/schließen. Kein automatischer Austausch des fokussierten Eintrags.
- Zehn schnelle Dialog-/Tabwechsel; nach Exit keine unsichtbare klickfangende Ebene und kein Fokus auf entfernten Elementen. Echter Unmount und erneuter Mount hinterlassen keine eigenen Timer/Listener.
- React-Profiler: reine Pointerbewegung verursacht keine wiederholten React-Commits der Lobby. Performance-Trace: keine vom Fortschrittsbalken ausgelösten Layoutzyklen, keine wiederkehrenden >50ms Main-Thread-Tasks aus Lobbyeffekten im protokollierten Szenario.
- Vergleich mindestens auf repräsentativem Desktop und mobilem Profil mit dokumentierter CPU/DPR/Browserkonfiguration. INP-Ziel<200ms ist Projektziel; Laborinteraktion nicht als Feld-INP-Perzentil ausgeben.

**Abbruch:** eines der Muss-Kriterien fällt durch oder MI-ID<90. Fehlende echte Geräte-/Profilerbelege bleiben offen. **Rücknahme:** verursachendes eigenes Effektpaket; vollständige relevante Matrix nach Korrektur wiederholen.

### L5 — Evidenz und Status

LLM liefert je MI-ID Vorher/Nachher, Testfall, Video/Trace sowie Bewertung. Historischen81er-Sichtscore und neue Detailrubrik sauber unterscheiden. Erst nach Freigabe/Execution und Abnahme darf die Hauptscorecard einen neuen erreichten Wert erhalten.

**Abbruch:** nur geschätzte60fps, vorhandener Guard oder gut aussehendes Video statt vollständiger Zustandsbelege. **Rücknahme:** unbelegte Status-/Scoreänderung korrigieren; Pläne erhalten.

## 6 — Fünf Abschlussprüfungen der späteren Execution

1. npm run typecheck.
2. npm test inklusive positiver und negativer Policy-/Lifecyclefälle.
3. npm run lint.
4. npm run build, anschließend Motion-Checks in der gebauten Ansicht.
5. git diff --check + git status --short; Scope, zehn Einzelziele und Nebenwirkungen prüfen.

Keine Gesamt-Grünbehauptung bei fremden Baselinefehlern. Quellstring-Tests beweisen kein tatsächliches Stoppen, ein Screenshot keine Interaktionsqualität. Diese Produktprüfungen sind in diesem Planungsschritt nicht ausgeführt.

## 7 — Recherche, Design-Abgleich und Selbstprüfung

[Motion useReducedMotion](https://motion.dev/docs/react-use-reduced-motion) beschreibt reaktive Präferenzwechsel. [MotionConfig](https://motion.dev/docs/react-motion-config) unterdrückt bei Reduced Motion Transform-/Layoutanimationen, lässt beispielsweise Opazitätsanimationen bestehen; deshalb braucht es zusätzliche lokale Policy. [Motion useScroll](https://motion.dev/docs/react-use-scroll) unterscheidet Seiten- und Element-Scrollcontainer. [W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) begründet Nutzerkontrolle über einschlägige automatische Bewegung/Updates. Abruf07.09.2026.

**Fachliche Korrektur zur lokalen SOP16:** [AnimatePresence](https://motion.dev/docs/react-animate-presence) ermöglicht Austrittsanimationen durch Beobachtung entfernter Kinder. Fehlendes exit oder eine entfernte Presence-Grenze belegt keine generelle Zombie-DOM-/Memory-Leak-Ursache. Der hier belegte Modalbefund betrifft zunächst den Exit-Lifecycle; Speicher-/Overlayfehler müssen separat gemessen werden. Die SOP selbst wird in diesem Frontend-Planungsauftrag nicht geändert.

Jan-Planer und Casino Design System Craft verwendet; read-only Agent motion_review als fachlicher Gegencheck. R1/R2 und aktuelle Tokens bleiben Referenz, A2 verlangt iconfreie berührte Oberflächen. Offene Nachweise: aktuelle Videos, dynamische Präferenzwechsel, Profiler und Dialog-Fokusabnahme. Zehn Dimensionen, rein LLM-getragene Aufgaben, Scope, Abbruch/Rücknahme und ehrliche Zielkennzeichnung geprüft. Keine neuen Assets oder Produktfunktionen umgesetzt.
