# Bildplanung — konkrete Versuche, Animation und 3D

> Stand: 2026-09-05 · Status: Planungsentwurf; Umsetzung und Generierung noch offen.
> [Übersicht](./00_bildgenerierung_uebersicht_jan.md) · [Hierarchie und Evidenz](./01_bildgenerierung_top10_vorschlaege.md) · [Stilreferenzen und Technik](./03_bildsprache_referenzen_und_3d.md)

## Gemeinsamer Ablauf

Die IDs IMG-01 bis IMG-10 bleiben stabil, auch wenn Jan die Reihenfolge ändert. Jeder Versuch endet mit einer Gegenüberstellung am selben Bildschirm, derselben Größe und demselben Zustand. Erst danach werden Varianten oder weitere Assets beauftragt.

Ein generiertes Bild liefert keine 3D-Geometrie, saubere Animationsframes oder automatisch eine nahtlose Textur. Diese Eigenschaften müssen separat hergestellt und geprüft werden. Größen unten sind gewünschte Master-/Ausgabegrößen; unterstützte Generierungsgrößen werden vor dem späteren Aufruf gegen die Pipeline geprüft.

<a id="img-01"></a>

## IMG-01 — Crash: der Lobby-Jet wird zum Spielobjekt

**Vorstellung für Jan:** Der dunkle, goldumrandete Jet aus deiner Lobbyästhetik fliegt durch die echte Crash-Bühne. Die Zahl bleibt der Blickfang; Lichtschweif und Raumtiefe unterstützen den Flug.

**Bestand:** Die aktive Route lädt quantum-interceptor.png, bei Fehlern crash-rocket.png (beides PNG, kein SVG). Der Canvas-2D-Loop zeichnet das Objekt derzeit an zwei Stellen ungefähr 96×40 bzw. 100×42 Einheiten groß und erzeugt bereits Sternfeld, Schub und Explosion. Die vorhandenen JPGs jet_stealth_gold und observatory_backdrop sind keine belegten aktiven Hauptassets dieser Route; observatory_backdrop ist nur in der Testing-Sandbox fe-06-crash im Einsatz.

**Erster Bildversuch:** Ein freigestellter, nach rechts gerichteter Jet ohne eingebrannten Schweif, Schrift oder Sternkulisse. Master 1536×1024 (3:2), transparenter Hintergrund; enger, dokumentierter Crop. Seine Silhouette muss bei der tatsächlichen kleinen Flugobjektgröße funktionieren. Bei mangelndem Mehrwert ist zunächst die sichtbare Objektgröße zu prüfen, bevor weitere Detailbilder entstehen.

**Animation / Tiefe:** Canvas-Bewegung und vorhandene Partikel weiterverwenden. Optional danach eine ruhige Hintergrundebene plus räumlich versetztes Sternfeld; höchstens ein zusätzliches Hintergrundmotiv. Ein flaches Bild nur leicht neigen; keine 360°-Drehung, die seine fehlende Rückseite sichtbar macht.

**Echtes 3D:** Spätere Alternative, wenn Banking, Kamerafahrt um den Jet oder wechselnde Beleuchtung wirklich gewünscht werden. Dafür ist ein separates Mesh/GLB mit Materialien nötig; ein PNG allein genügt nicht. Vor der Entscheidung muss ein begrenzter Modellversuch den bestehenden 2D-Renderer visuell schlagen.

**Einbindung:** [CrashStage](../src/components/casino/games/crash/CrashStage.tsx), [useCrashGameLoop](../src/components/casino/games/crash/useCrashGameLoop.ts), [Crash-Page](../src/app/games/crash/page.tsx). Ein DOM-Backdrop hinter dem Canvas hilft nur, wenn der Canvas-Hintergrund ihn nicht opak übermalt; Layer-Reihenfolge explizit prüfen.

**Abnahme:** Idle, Flug, Cashout und Crash in derselben Szene; Jet bei tatsächlicher Größe erkennbar; Kontur ohne dunklen JPG-Kasten; Zahl und Cashout weiterhin sofort lesbar. Fallback bei Bildfehler und reduzierte Bewegung mit statischer Kulisse. Rendereränderung darf den vorhandenen Rundenzeitpunkt nicht verschieben.

**Ausbaugrenze:** Ein Jet als Pilot. Ein Backdrop nur nach sichtbarer Lücke. Multiplayer hat einen separaten Renderpfad und erhält kein automatisches Mit-Rollout.

<a id="img-02"></a>

## IMG-02 — Startseite: vorhandene Bildsprache durchziehen

**Vorstellung für Jan:** Schon die Startseite wirkt wie die gelungene Spielauswahl im Screenshot: gleiche Jets, Karten, Würfel und Goldmaterialien.

**Bestand:** / rendert HomeClientV2 → BentoLobbyHome. BentoArcadeCells liest GAMES aus InteractiveArcadeGrid; der Hero liest GAME_TABS aus hero-cinematic/config. Beide Datenquellen referenzieren ältere game-*-new-Bilder bzw. lucky-777-neon-3d. /games verwendet dagegen die neue Quantum-Gold-Serie. Hero-Showcase ist Desktop-only, Bento bleibt auch auf Mobil sichtbar.

**Bildauftrag:** Kein neuer Generierungslauf. Fünf vorhandene hero-*-quantum-gold.png verwenden; nötige Ausschnitte zuerst mit object-position erproben. Beide Datenquellen berücksichtigen; Änderung nur einer Quelle lässt den Stilbruch bestehen.

**Animation / Tiefe:** Bestehendes Tilt/Glare/Zoom beibehalten und dosieren. Der Katalog besitzt diese Effekte bereits. Ein flächiges Bild kann auf einer CSS-3D-Ebene kippen; separat bewegliche Bildobjekte benötigen freigestellte Layer und wären ein neuer Auftrag.

**Echtes 3D:** Kein sinnvoller Standard für ein Grid aus Spielkarten. Mehrere unabhängige 3D-Szenen vergrößern die technische Last, ohne die Spielauswahl klarer zu machen.

**Abnahme:** Hero und Bento zeigen dieselbe Motivfamilie wie /games; Jet-Flügel, Ass und Roulette-Rad überleben den jeweiligen Crop. Auf Mobil keine unsichtbaren Desktop-Bilder unnötig laden. Fokuszustände bleiben ohne Maus verständlich.

**Ausbaugrenze:** Wiederverwendung ist Priorität. Bestehende Beschriftungen, simulierte Hero-Werte und Spielthemen nicht ungeprüft mit dem Bild austauschen; ihre Abstimmung wird bei der späteren UI-Umsetzung separat geprüft.

<a id="img-03"></a>

## IMG-03 — Blackjack: ruhiges Tischmaterial und einzelne Bildkarten

**Vorstellung für Jan:** Ein hochwertiger Filztisch mit lesbaren hellen Karten, warmen Goldkanten und dezent gravierten Figurenmotiven. Das dramatische Lobbybild dient als Materialreferenz, nicht als Fototapete hinter jeder Karte.

**Bestand:** Spieler nutzen [PlayingCard](../src/components/casino/games/blackjack/PlayingCard.tsx), Dealer [BlackjackCard3D](../src/components/casino/games/blackjack/BlackjackCard3D.tsx) mit [VintageCardBack](../src/components/casino/games/blackjack/VintageCardBack.tsx). CSS-3D-Flip ist vorhanden. [ClassicCasinoTableFelt](../src/components/casino/games/blackjack/ClassicCasinoTableFelt.tsx) besitzt Lichtkegel, CSS-Gewebe und SVG-Bogen.

**Erster Bildversuch:** Eine quadratische, matte Filzprobe 1024×1024 sowie ein textfreies Figurenmotiv, zunächst ein Bube. Diese beiden Versuche getrennt vergleichen, damit erkennbar bleibt, welche Änderung hilft.

**Kartenstrategie:** Kartenwert, Farbsymbol und Indizes bleiben DOM/SVG und werden aus card.value/card.suit gerendert. Das Motiv ergänzt ausschließlich die Mitte von J/Q/K. Zunächst 1 Motiv, bei überzeugendem Ergebnis 3 gemeinsame J/Q/K-Motive. Erst bei ausdrücklich gewünschtem farbspezifischem Hofstaat auf 12 erweitern. Ein automatisch generiertes 52er-Gesamtbild ist kein verlässlicher Deck-Produktionsplan.

**Animation / Tiefe:** Bestehenden Flip, Schatten und Kartenhöhe verwenden. Während einer Runde kein Hover-Kippen, das Kartenwerte verzerrt. Stoff ist statisch; Goldlicht kann einmal beim Austeilen kurz erscheinen.

**Echtes 3D:** CSS-3D reicht für flache Spielkarten. Ein Modell wäre erst bei frei umfahrbarer Tischkamera relevant.

**Abnahme:** Kleinstes bestehendes Kartenformat (68×96 bei PlayingCard) bleibt lesbar; rote/schwarze Farben eindeutig; Dealer, Spieler, verdeckte Karte und Split vergleichen. Das Stoffbild muss die bestehende CSS-Mikrotextur sichtbar verbessern, sonst entfällt es.

**Ausbaugrenze:** Filzprobe kann mit IMG-04 geteilt werden. Kein vollständiger Decktausch vor Jans Sichtvergleich.

<a id="img-04"></a>

## IMG-04 — Roulette: ein Tisch statt übereinanderliegender Farbflächen

**Vorstellung für Jan:** Rad, Chip-Zone und Wettfläche wirken auf demselben tiefen, matten Filz. Gold sitzt an Kanten und Metallteilen; Zahlen und Chips bleiben klar.

**Bestand:** [RouletteFeltStage](../src/components/casino/games/roulette/RouletteFeltStage.tsx) hat Smaragdverläufe und Spotlights, [RouletteFeltBoard](../src/components/casino/games/roulette/RouletteFeltBoard.tsx) eigene opake Hintergründe. [LuxuryRouletteWheel](../src/components/casino/games/roulette/LuxuryRouletteWheel.tsx) zeichnet das Rad mit SVG und CSS-Rotation.

**Erster Bildversuch:** Eine 1024×1024-Filztextur ohne Zahlen, Tischkante, Kugel, Chips oder fest eingebrannten Spot. Vorrangig die Probe aus IMG-03 wiederverwenden; Farbwirkung über kontrollierte Ebenen prüfen.

**Animation / Tiefe:** Filz bleibt still. Rad- und Kugelanimation behalten ihre bestehende räumliche Darstellung. Licht gehört in eine getrennte Ebene, damit Textur und Schatten sich nicht doppeln.

**Echtes 3D:** Für dieses Materialproblem nicht erforderlich. Ein vollständiger physischer Tisch mit freier Kamera wäre ein eigener Renderer-Umbau.

**Einbindung:** Material an Bühne und Wettfeld bewusst koordinieren. Nur unter die Stage gelegt könnte es hinter den Board-Flächen verschwinden. Texturlayer dürfen keine Pointer-Ereignisse abfangen.

**Abnahme:** Kachelübergang im 2×2-Raster, keine Moiré-Artefakte bei verkleinerter Ansicht; Wettzahlen, Zero, Chips und Auswahlrahmen bei 390/768/1440 px prüfen. Spin und stationärer Zustand bleiben verständlich.

**Ausbaugrenze:** Eine Textur. Zusätzliche Leder-/Holzmaps erst bei einer nachgewiesenen sichtbaren Lücke.

<a id="img-05"></a>

## IMG-05 — Big Win: charakteristischer Pokal statt mehr Partikel

**Vorstellung für Jan:** Ein plastischer Goldpokal oder ein Ass-Siegel erscheint einmal über dem Gewinnbetrag. Die bestehende Lichtstimmung bildet seinen Rahmen.

**Bestand:** [BigWinOverlay](../src/components/casino/BigWinOverlay.tsx) hat bereits 48 Partikel, Aura, Pokalrotation, Zähler und einen 5,5-Sekunden-Timer. Schwellenwerte werden nicht in diesem Bildauftrag neu definiert.

**Erster Bildversuch:** Ein transparentes 1024×1024-Hauptmotiv, auf reale Zielgröße zugeschnitten. Optional ein einzelnes Münzbild zur Wiederholung, erst wenn der Pokal allein nicht reicht. Keine generierte Framefolge als erste Lösung.

**Animation / Tiefe:** Kurzer Auftritt etwa 400–700 ms, anschließend ruhige Haltung und Ausblenden. Bei einem flachen Trophäenbild nur leichte Neigung, keine volle Y-Rotation. Bestehende Partikel eher reduzieren als weitere hinzufügen.

**Echtes 3D:** Nur wenn sich die Trophäe wirklich rundum drehen soll. Dann Modell und Texturen separat planen.

**Abnahme:** Gewinnbetrag als wichtigstes Element; klare Schließmöglichkeit; mehrere Ereignisse, Reduced Motion und kleiner Bildschirm geprüft. Der vorhandene Timer bleibt Baseline, keine längere Unterbrechung wegen Artwork.

**Ausbaugrenze:** Ein Hauptmotiv; kann IMG-09 mitversorgen.

<a id="img-06"></a>

## IMG-06 — Spielerbilder: konsistente Identität

**Vorstellung für Jan:** Spieler haben ruhige, unterscheidbare Portraits mit derselben Material- und Lichtfamilie. Das Guide-Maskottchen bleibt als Assistent erkennbar.

**Status:** Sechs Portraits umgesetzt und live (2026-09-05/06, von Jan abgenommen).

**Bestand:** Sechs lokale Portraits in `public/images/avatars/avatar-obsidian-01` bis `-06.png` (1024×1024, gpt-image-2 via `scripts/generate-design-assets.ts`); 01–04 als Pilot, 05 (VIP-Dame) und 06 (Panther-Gentleman) als Erweiterung über das Manifest `public/images/avatars_extension.manifest.json`. Verteilung über [player-avatar.ts](../src/lib/casino/player-avatar.ts): djb2-Hash des normierten Usernamens modulo Quellenliste — deterministisch pro Name, kein Zufall pro Render; `customAvatarUrl` hat Vorrang, Fallback sind Initialen. [LeaderboardPodium](../src/components/leaderboard/LeaderboardPodium.tsx), [LeaderboardStreamTable](../src/components/leaderboard/LeaderboardStreamTable.tsx) und [PersonalRankBar](../src/components/leaderboard/PersonalRankBar.tsx) nutzen den Resolver mit vergrößerten Avataren (72/60/44/40 px, Stand 2026-09-06); [BentoStripCells](../src/components/home/bento/BentoStripCells.tsx) verwendet weiterhin DiceBear; [GuideHeader](../src/components/social/casino-guide/GuideHeader.tsx) zeigt separate Assistenten-Personas.

**Hinweis Erweiterung:** Eine Quellen-Erhöhung (4→6) ändert die Modulo-Verteilung — einige bestehende Usernamen erhalten dadurch einen anderen, weiterhin stabilen Avatar.

**Offen:** BentoStripCells auf denselben Resolver umstellen (aktuell DiceBear); auf acht Portraits nur bei zu geringer Unterscheidbarkeit erweitern.

**Animation / Tiefe:** Statisch. Ein dünner Hover-/Fokusrahmen reicht; kein dauerndes Kopfkippen in Ranglisten.

**Einbindung:** Zuerst gültiges vorhandenes Spielerbild, danach lokaler stabiler Fallback, zuletzt Initialen. Eine feste Zuordnung darf nicht bei jedem Render neu zufällig entstehen. Guide-Personas nicht in den Spielerresolver mischen. Eine freie Avatar-Auswahl mit Speicherung wäre ein zusätzlicher Featureauftrag.

**Abnahme:** Ein Spieler über mehrere Ansichten konsistent; kaputtes Bild zeigt Initialen; alle Portraits auch klein unterscheidbar (bestätigt bei 05/06). Namen bleiben die verbindliche Identifikation.

**Ausbaugrenze:** Sechs lokale Fallbacks; keine VIP-Bindung ohne Produktentscheidung.

<a id="img-07"></a>

## IMG-07 — Achievements: sechs konkrete Lücken

**Bestand:** [DEFAULT_ACHIEVEMENT_CONFIGS](../src/lib/casino/achievements-config.ts) enthält zehn Einträge. high_roller, lucky_streak, crash_master und moon_shot nutzen drei Bilddateien; die Rakete wird zweimal verwendet.

| ID            | Vorhandenes Emoji | Geplantes Bildmotiv                                                 |
| ------------- | ----------------- | ------------------------------------------------------------------- |
| first_bet     | Zielscheibe       | einfacher Goldpfeil im Zielring                                     |
| big_win       | Geldsack          | kompakter Goldmünzbehälter                                          |
| level_10      | Stern             | plastischer Stern auf dunkler Basis                                 |
| level_50      | Krone             | klare, kompakte Goldkrone                                           |
| daily_grinder | Feuer             | stilisierte goldene Flamme                                          |
| lucky_seven   | Slotmaschine      | Würfel mit eigenständigem Glücksmotiv, passend zum Dice-Achievement |

**Erster Bildversuch:** first_bet als einzelnes transparentes 1024×1024-Motiv neben ach-whale, ach-clover und ach-rocket prüfen. Nach Freigabe die übrigen fünf im gleichen Blickwinkel und Licht aufbauen. Gleicher Prompt garantiert keine identische Formensprache; Kontaktvergleich nach jeder Ergänzung.

**Animation / Tiefe:** Statisch gerenderte 3D-Optik. Kurzer Unlock-Impuls am Container, kein WebGL pro Icon.

**Einbindung:** [VaultAchievements](../src/components/casino/vault/VaultAchievements.tsx) rendert bereits Bildpfade. [walletSnapshotSlice](../src/store/slices/walletSnapshotSlice.ts) kann geladene achievementConfigs statt Defaults nutzen; nur Defaults ändern reicht daher nicht zwingend. Aktive Konfigurationsquelle vor Integration prüfen.

**Abnahme:** Vergleich bei realer Icongröße; locked/unlocked konsistent. lucky_seven ist secret: Vor Freischaltung darf weder Motiv noch Alt-Text die verborgene Information enthüllen; bestehende Präsentationsregeln erhalten.

**Ausbaugrenze:** Sechs fehlende Motive. Eine getrennte moon_shot-Rakete ist optionaler Feinschliff, keine fehlende siebte Datei.

<a id="img-08"></a>

## IMG-08 — Level-Up: ein Siegel, klare Information

**Bestand:** [GamificationProvider](../src/providers/GamificationProvider.tsx) erzeugt Toast und celebrate-level-up-Event. Die Darstellung größerer Effekte ist damit nicht automatisch belegt.

**Erster Versuch:** Vorhandenes passendes Badge wiederverwenden; andernfalls ein neutrales Siegel ohne Zahl. Die Levelzahl bleibt Text. XP-Level und VIP-Tier sind nicht automatisch dasselbe; keine Bronze-/Platin-Zuordnung erfinden.

**Animation / Tiefe:** Ein kurzer Glanz-/Skalierungsimpuls am Badge, anschließend statischer Toast. Kein Vollbild zur normalen Levelmeldung.

**Echtes 3D:** Kein zusätzlicher Nutzen bei dieser Größe.

**Abnahme:** Ein Levelanstieg ergibt eine verständliche Meldung; mehrere schnelle Ereignisse erzeugen keine überlappenden Feierflächen. Vor Einbindung vorhandene Event-Listener prüfen, damit Toast und Ereigniskonsument nicht dieselbe Feier doppelt auslösen.

**Ausbaugrenze:** Höchstens ein neues Siegel; keine fünf Rangsets ohne vorhandene Produktsemantik.

<a id="img-09"></a>

## IMG-09 — Turnier: ein kleines, wiederverwendbares Hauptmotiv

**Bestand:** Aktives Ziel ist TournamentPodiumStrip in [BentoStripCells](../src/components/home/bento/BentoStripCells.tsx), nicht die alte DailyTournamentTeaser-Komposition. Ränge, Bilder, Countdown und Reveal sind vorhanden.

**Erster Versuch:** Trophäe aus IMG-05 klein neben den Titel setzen; falls das nicht harmoniert, genau ein vereinfachtes statisches Motiv entwerfen. Namen und Rangfolge bleiben getrennt im DOM.

**Animation / Tiefe:** Bestehender einmaliger Reveal reicht. Kein dauerhaft kreisender Pokal neben tickendem Countdown.

**Abnahme:** Der Champion bleibt visuell vorn, alle drei Namen und Preise bleiben auf Mobil lesbar. Wenn das Bild den ohnehin schmalen Strip überfüllt, wird es weggelassen.

**Ausbaugrenze:** Keine drei Rangbilder plus Timer-Neugenerierung. Der begrenzte Zusatznutzen rechtfertigt kein eigenes umfangreiches Set.

<a id="img-10"></a>

## IMG-10 — Royale Guide: vertraute Figur gezielt erweitern

**Vorstellung für Jan:** Derselbe helle Zauberer-Geist begrüßt oder erklärt etwas. Gesicht, Goldturban und Silhouette bleiben erkennbar.

**Bestand:** [MainSidebar](../src/components/layout/MainSidebar.tsx) verwendet royale-guide-mascot-icon.png; das Panel hat eigene Persona-Bilder. Die [Referenzdatei](./03_bildsprache_referenzen_und_3d.md) hält Original, Miniatur und frühere Emblementscheidung fest.

**Erster Versuch:** Vorhandenes Motiv in der konkreten Zielgröße prüfen; dafür kein neuer Bildlauf. Falls ein größerer Begrüßungs-/Erklärzustand beschlossen wird: maximal zwei zusätzliche statische Posen derselben Figur.

**Animation / Tiefe:** In der kleinen Navigation nur kurzer Fokus-/Hoverimpuls. In großer Darstellung eine sanfte Einblendung. Ein vermeintliches Blinzeln braucht passende getrennte Augen-/Gesichtsassets oder saubere Animationsframes; es lässt sich nicht aus einem beliebigen Einzelbild zuverlässig ableiten.

**Echtes 3D:** Erst bei einem ausdrücklich gewünschten interaktiven Charakter mit wechselndem Blickwinkel. Dafür eigenes Modell und gegebenenfalls Rig; zu groß für diesen Bildpilot.

**Abnahme:** Lesbarkeit bei 28 px für den bestehenden Sidebar-Kontext und in der separat festgelegten größeren Zielansicht. Keine neue Figur, kein überladenes Emblem. Bestehende Persona-Wahl bleibt klar erkennbar.

**Ausbaugrenze:** Logo bleibt eigenständiges Markenzeichen. Assistentenfigur nicht ungefragt in jede freie UI-Fläche einbauen.

## Gemeinsame Abnahme und Übergabe

Die folgenden Zahlen sind vorgeschlagene Projektbudgets, keine Messergebnisse:

| Prüfung                | Ziel für den jeweiligen Versuch                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Darstellung            | Vergleich bei 390, 768 und 1440 px; identischer Spielzustand vor/nach Änderung                                                           |
| Bildgewicht im Browser | Richtwert: bis 300 KB pro großer Darstellung, 80 KB pro kleinem Portrait/Icon; Master-PNGs separat behalten                              |
| Bewegung               | Ein dominanter bewegter Bereich pro sichtbarer Komposition; Dekoration bei Reduced Motion statisch oder kurze Blende                     |
| Interaktion            | Text, Ergebnis und Fokus jederzeit erkennbar; dekorative Layer ohne Pointer-Ereignisse                                                   |
| Laden                  | Platz vorab reservieren; wichtige sichtbare Bilder gezielt laden, verdeckte/untere Bilder nach Bedarf                                    |
| Performance            | Vorher/nachher unter denselben Bedingungen messen; keine neue dauerhafte Ruckelquelle oder messbare Verschlechterung der Eingabereaktion |
| Rückfall               | Vorheriger Asset-Pfad bzw. bestehende CSS/SVG-Darstellung verfügbar; Bildfehler darf keinen leeren Spielzustand erzeugen                 |

Vor jedem späteren Generierungslauf: Motiv, Referenzbild, tatsächlichen Zielcontainer, Dateinamen und begrenzte Anzahl festhalten. Nach dem Lauf: Transparenz, Zuschnitt, kleine Darstellung und gegebenenfalls Kachelbarkeit prüfen; danach Jans Sichtentscheidung. Erst die Einbindung macht ein gutes Einzelbild zu einer guten Oberfläche.
