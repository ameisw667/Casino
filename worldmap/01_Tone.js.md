# 01 — Tone.js: Reaktive Casino-Audio-Engine

> **Status:** Geplant · **Stand:** 2026-08-28 · **Owner:** Jan + LLM · **Scope:** Auswahl und Planung möglicher Tone.js-Piloten für die bestehende Casino-Audio-Erfahrung. Keine Installation, kein neuer Produktcode, keine Änderung an Spielregeln, Auszahlungen, RNG, Wallet oder Backend durch diese Datei.

> **Money-Pfad:** Nein · **Security-Review:** Nein. Diese Initiative verändert ausschließlich sichtbare und hörbare Rückmeldung im Browser. Eine spätere Wahl darf aber weder Ergebniszeitpunkt noch Wallet- oder Wettlogik berühren.

> **Entscheidung:** Tone.js bleibt als bewusst ausgewähltes Zukunftsthema erhalten. Die 15 Optionen unten sind Alternativen zur Auswahl, keine Freigabe, sie alle umzusetzen.

## 1 — Übersicht für Jan

**Wie diese Tabelle zu lesen ist:** „Warum“ und „Wie“ erklären jedes Thema absichtlich ohne Fachsprache. Erst wenn Jan eine oder mehrere IDs auswählt, entsteht daraus ein einzelner, eng begrenzter Ausführungsplan.

| ID  | Idee                                          | Beispiel im Casino                                                              | Warum                                                                        | Wie                                                                                            | Impact      | Aufwand        | Status           |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------- | -------------- | ---------------- |
| T01 | Gemeinsame Ton-Zentrale                       | Ton aus bedeutet überall Ton aus – auch bei Slots v2.                           | Neue Klänge dürfen kein bestehendes Doppelton-Problem verstärken.            | Alle Spiele fragen dieselbe Einstellung, bevor sie etwas abspielen.                            | Sehr hoch   | Niedrig–Mittel | ⬜ Auswahl offen |
| T02 | Ton erst nach bewusstem Start                 | Beim ersten Spielklick wird Ton sauber freigeschaltet; vorher bleibt es still.  | Verhindert überraschenden Ton und stumme Fehlstarts.                         | Der erste echte Klick bereitet Ton vor, danach funktionieren die gewählten Sounds.             | Hoch        | Niedrig        | ⬜ Auswahl offen |
| T03 | Ruhigere Klicks in der Oberfläche             | Nicht jeder Maus-Hover klingt mehr wie ein Würfelwurf.                          | Die Oberfläche wirkt hochwertiger und weniger nervös.                        | Wenige wichtige Aktionen erhalten einen dezenten, passenden Ton; alles andere bleibt still.    | Mittel      | Niedrig        | ⬜ Auswahl offen |
| T04 | Unterschiedliche Chip-Klänge                  | Mehrere Chips fühlen sich nicht wie derselbe wiederholte Ton an.                | Wiederholungen wirken schnell künstlich.                                     | Der Klang verändert sich bei jedem Chip minimal, bleibt aber als Chip erkennbar.               | Mittel      | Niedrig        | ⬜ Auswahl offen |
| T05 | Roulette-Rad hörbar abbremsen                 | Klicks werden langsamer, während sich das Rad seinem Ende nähert.               | Das Ergebnis wird besser nachvollziehbar, ohne vorher verraten zu werden.    | Die Tonfolge folgt ausschließlich der sichtbaren Radbewegung.                                  | Hoch        | Mittel         | ⬜ Auswahl offen |
| T06 | Roulette-Kugel als räumlicher Effekt          | Der Klang wandert leicht, als bewege sich die Kugel über das Rad.               | Das Spiel wirkt greifbarer und weniger flach.                                | Linke und rechte Seite erhalten leicht unterschiedliche Lautstärke.                            | Mittel      | Mittel         | ⬜ Auswahl offen |
| T07 | Crash-Start mit sanftem Anlauf                | Raketenstart und Anfang der Runde fühlen sich klarer an.                        | Der Start einer schnellen Runde braucht erkennbare Rückmeldung.              | Ein kurzer Startklang wird mit der vorhandenen Animation verbunden.                            | Mittel      | Niedrig        | ⬜ Auswahl offen |
| T08 | Crash-Spannung folgt der sichtbaren Runde     | Der Ton kann während der sichtbaren Multiplikator-Anzeige vorsichtig ansteigen. | Unterstützt den Moment, ohne ein Ergebnis vorherzusagen.                     | Der Ton reagiert nur auf das, was bereits auf dem Bildschirm zu sehen ist.                     | Mittel–Hoch | Mittel         | ⬜ Auswahl offen |
| T09 | Sicherer Cashout-Klang                        | Beim bestätigten Ausstieg gibt es einen klaren, kurzen Erfolgston.              | Spieler erkennen sofort: Die Aktion wurde wirklich angenommen.               | Der Klang kommt erst nach der bestätigten Antwort des Servers.                                 | Hoch        | Niedrig        | ⬜ Auswahl offen |
| T10 | Slots: einzelne Walzen stoppen hörbar         | Jede Walze hat beim Stoppen einen eigenen kurzen Ton.                           | Das Ende eines Spins wird nachvollziehbarer und spannender.                  | Fünf kurze Töne folgen genau dem Ende der fünf sichtbaren Walzen.                              | Hoch        | Mittel         | ⬜ Auswahl offen |
| T11 | Slots: Gewinnklang nach Größe                 | Kleine Gewinne bleiben dezent, große Gewinne erhalten eine stärkere Fanfare.    | Ein kleiner Gewinn soll nicht wie ein sehr großer Gewinn wirken.             | Die bestätigte Gewinnhöhe bestimmt nur die Stärke des Klangs.                                  | Hoch        | Mittel         | ⬜ Auswahl offen |
| T12 | Blackjack: Kartenklang mit leichten Varianten | Deal, Hit und Split fühlen sich nach echten Karten an, ohne monoton zu werden.  | Blackjack lebt von klaren Einzelaktionen statt Dauerklang.                   | Der vorhandene Kartenton bekommt kleine, passende Unterschiede.                                | Mittel      | Niedrig–Mittel | ⬜ Auswahl offen |
| T13 | Blackjack: ruhiger Entscheidungs-Klang        | Hit, Stand und Double erhalten klare, aber zurückhaltende Bestätigung.          | Bewusste Spielentscheidungen sollen verständlich rückgemeldet werden.        | Nur bestätigte Aktionen erhalten einen kurzen, eigenen Ton.                                    | Mittel      | Niedrig        | ⬜ Auswahl offen |
| T14 | Große Momente: Achievement, Level und VIP     | Fortschritt klingt anders als ein normaler Gewinn.                              | Langfristiger Fortschritt soll sich besonders anfühlen, ohne laut zu werden. | Ein kurzer, wiedererkennbarer Klang spielt nur bei echten Fortschrittsereignissen.             | Mittel–Hoch | Mittel         | ⬜ Auswahl offen |
| T15 | Persönliches Klangprofil                      | Nutzer wählen etwa „dezent“, „normal“ oder „aus“.                               | Nicht jeder mag dieselbe Lautstärke oder Intensität.                         | Die bestehende Lautstärke-Einstellung erhält verständliche Voreinstellungen und einen Testton. | Hoch        | Niedrig–Mittel | ⬜ Auswahl offen |

## 2 — Verifizierter Ist-Zustand

### Bereits vorhanden

- **Audio-Bestand:** 19 MP3-Dateien mit zusammen rund 425 KB in public/sounds. Sie sind klein genug, dass Tone.js nicht wegen Dateigröße eingeführt werden muss.
- **Zentrale Steuerung:** src/lib/casino/sound-manager.ts verwaltet bestehende Spiel-, Gewinn-, Verlust-, Chip- und Kartentöne.
- **Nutzerkontrolle:** Ton an/aus und Lautstärke stehen in SettingsPopover.tsx und SettingsModal.tsx; die Werte bleiben in den lokalen Einstellungen erhalten.
- **Spielabdeckung:** Dice, Slots, Roulette, Crash, Blackjack und Multiplayer-Crash haben bereits konkrete Tonmomente. Gewinn und Verlust werden im Regelfall zentral nach dem Ergebnis ausgelöst.
- **Vorherige Qualitätsprüfung:** Die vorhandenen Spielklänge wurden technisch auf Ladefehler, Lautstärke und unnötige Stille geprüft. Ob sie stilistisch gefallen, bleibt bewusst Jans Hörentscheidung.

### Relevanter Befund für die Planung

Die neuere Slots-v2-Seite verwendet zusätzlich eigene feste Audiodateien und ruft danach trotzdem den zentralen Ergebnisweg auf. Dadurch kann sie Gewinn oder Verlust doppelt abspielen und die globale Lautstärke umgehen.

**Folge:** T01 ist Voraussetzung für jede ausgewählte Option, die Slots v2 betrifft. Tone.js wird nicht eingesetzt, um auf einen doppelten Ton noch einen dritten zu legen.

## 3 — Was wir aus Tone.js nutzen können

| Möglichkeit von Tone.js           | Nutzen im Casino                                                                                   | Sinnvolle Verwendung                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Kurze Klänge selbst erzeugen      | Kein neues MP3 für jeden kleinen Klick oder Walzenstopp nötig.                                     | Chip-Varianten, Walzenstopps, ruhige Entscheidungs-Klänge               |
| Vorhandene MP3s weiterverwenden   | Die bestehenden, geprüften Spielsounds bleiben wertvoll.                                           | Karten, Explosionen und bestehende Gewinnklänge ergänzen statt ersetzen |
| Klänge passend zum Bild abspielen | Der Ton kann genau beim sichtbaren Ereignis kommen.                                                | Roulette-Abbremsen, Slots-Walzenstopps, Crash-Start                     |
| Einen Klang langsam verändern     | Ein Ton kann während einer sichtbaren Animation steigen, fallen oder leiser werden.                | Vorsichtige Crash-Spannung, Roulette-Abbremsen                          |
| Mehrere Klänge zusammenführen     | Ein leiser Grundton und ein kurzer Akzent können zusammen spielen, ohne unangenehm laut zu werden. | Größere Gewinne, VIP- und Achievement-Momente                           |
| Wiederkehrende Tonfolgen          | Gleichartige, zeitlich geplante Ereignisse bleiben im Takt.                                        | Fünf Walzenstopps, Roulette-Klickfolge                                  |
| Klang sichtbar machen             | Das Programm kann Klangstärke und Form für reine Anzeige liefern.                                  | Spätere, optionale Visualisierung in einem Audio-Testbereich            |
| Eigene Tonquellen aufräumen       | Zeitweise erzeugte Klänge werden beim Verlassen einer Seite wieder entfernt.                       | Schutz vor immer mehr laufenden Klängen bei langen Spielsitzungen       |

### Bewusst nicht nutzen

- **Mikrofon- und Aufnahmefunktionen:** Kein Produktnutzen, unnötige Privatsphäre-Frage.
- **Dauerhafte Musik ohne Einwilligung:** Hintergrundklang bleibt aus, bis Nutzer ihn ausdrücklich wählen.
- **Ton als Hinweis auf ein künftiges Ergebnis:** Ein Ton begleitet nur bereits sichtbare oder bestätigte Fakten.

## 4 — Feste Schutzgrenzen für jeden späteren Pilot

1. **Nutzer entscheidet:** Vor der ersten bewussten Aktion bleibt die Seite still. Ton an/aus und Lautstärke gelten für jede Audioquelle.
2. **Server bestimmt Ergebnisse:** Töne verändern, berechnen oder verraten niemals Gewinn, Verlust, Multiplikator oder Guthaben.
3. **Keine Doppelung:** Ein Ergebnis erhält höchstens den vorgesehenen Klang; bestehende direkte und zentrale Wege werden vorher abgeglichen.
4. **Kleiner Start:** Ein Pilot betrifft genau einen Spielmoment oder eine klar begrenzte Oberfläche, nicht alle fünf Spiele zugleich.
5. **Keine hörbare Überlastung:** Häufige Aktionen erhalten keine langen oder lauten Folgen; Nutzer können jederzeit stummschalten.
6. **Sauberes Verlassen:** Zeitweise gestartete Klänge enden, wenn ein Spiel verlassen oder ein Durchlauf abgebrochen wird.
7. **Wartbar übernehmen:** Bei Umsetzung wird das veröffentlichte Tone-Paket verwendet. Der lokal geklonte Quellcode ist Recherchematerial und wird nicht manuell in das Casino kopiert.

## 5 — Sinnvolle Auswahlreihenfolge

| Reihenfolge | Vorschlag                      | Warum diese Reihenfolge                                                                            |
| ----------- | ------------------------------ | -------------------------------------------------------------------------------------------------- |
| 1           | T01 – Gemeinsame Ton-Zentrale  | Behebt erst den konkreten Slots-v2-Befund und sichert die bereits vorhandenen Nutzereinstellungen. |
| 2           | T10 – Slots-Walzenstopps       | Ein gut hörbarer, klar begrenzter Pilot mit direktem Nutzen.                                       |
| 3           | T11 – Gewinnklang nach Größe   | Ergänzt den Pilot, aber erst nach bestätigtem Ergebnis und ohne Spielregel-Eingriff.               |
| 4           | T15 – Klangprofile und Testton | Macht den neuen Nutzen für unterschiedliche Nutzer kontrollierbar.                                 |
| später      | T05, T08, T12–T14              | Gute Erweiterungen, sobald der gemeinsame Weg und der erste Pilot verifiziert sind.                |

Die Reihenfolge ist eine Empfehlung, keine Freigabe. Jan kann jede Kombination aus T01–T15 wählen.

## 6 — Auswahl-Gate vor Umsetzung

Vor der ersten Installation oder Codeänderung muss für die gewählte ID feststehen:

1. Welcher eine sichtbare Spielmoment ist betroffen?
2. Welcher konkrete Klang ist für diesen Moment erlaubt – und welcher ausdrücklich nicht?
3. Woran erkennt Jan beim Hören, dass der Pilot gelungen ist?
4. Welche bestehende Tonquelle wird ersetzt oder bleibt unverändert?
5. Wie wird geprüft, dass Ton aus, Lautstärke und der Wechsel zwischen Spielseiten funktionieren?

Danach folgt das Options-Gate aus [xx_sop/01_workflow_jan_option_gate.md](../xx_sop/01_workflow_jan_option_gate.md) und ein separater, ausführungsreifer Einzelplan. Erst dieser Folgeplan darf Tone zu package.json hinzufügen.

## 7 — Quellen und Nachweise

- [Tone.js Repository](https://github.com/Tonejs/Tone.js) – lokal geklont am 2026-08-28, Commit d6e555b, Version 15.5.36, MIT-Lizenz.
- [Lokaler Tone.js-Klon](.research/tonejs/README.md) – README, Beispiele und Lizenz im Rechercheordner.
- [Bestehender Sound-Manager](../src/lib/casino/sound-manager.ts) – zentrale Zuordnung und Wiedergabe.
- [Bestehende Sound-Quellen und technische Qualitätsprüfung](../public/sounds/CREDITS.md).
- [Archivierter Sounddesign-Vollausbau](../docs/architecture/05_1.6_SOUNDDESIGN.md).
- [Auswahl aus der Open-Source-Recherche](01_opensource_tools_recherche.md).
