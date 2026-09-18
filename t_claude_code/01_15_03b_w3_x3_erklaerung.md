# 01_15_03b — W3 und X3 in Klartext (was dahinter steckt und was es bringt)

> **Status:** Erklärung (Entscheidungs-Hauptverlinkung) · **Stand:** 2026-09-17 (Entscheidungen: 2026-09-16) · **Owner:** LLM · **Adressat:** Jan
> **Zweck:** Diese Datei erklärt die beiden beschlossenen Umbauten **ohne Fachvokabular** — was gemacht wird, in welcher Reihenfolge, mit welchen Sicherheitsnetzen, und was der Vorteil ist. Sie ist der Einstieg; die Zahlen und Option-Matrizen stehen in [`01_15_03a_code_modularisierung_regelkatalog.md`](01_15_03a_code_modularisierung_regelkatalog.md) §R3 und [`Planungsdateien/03a_r03_single_responsibility_plan.md`](Planungsdateien/03a_r03_single_responsibility_plan.md) §2a/§2b.
> **Ausgangslage:** Beide Umbauten sind **entschieden** (2026-09-16, Optionswahl delegiert: **W3** für den Geld-Service, **X3** für die Crash-Animation), aber **noch nicht gebaut**. Deshalb steht Regel 3 im Katalog weiterhin bei 62 % und Regel 7 bei 68 % — die Niveaus messen den echten Code, nicht den Plan.

## 1 — Warum überhaupt: das Problem in drei Sätzen

1. Zwei Dateien im Projekt sind so groß geworden, dass niemand sie mehr am Stück überblickt: die **Geld-Service-Datei** mit 880 Zeilen und die **Crash-Spiel-Animation** mit zwei Dateien à 982 und 782 Zeilen.
2. Jede Aufgabe, die eine dieser Dateien berührt, muss erst viel fremden Inhalt mitlesen — das kostet Zeit, Geld und Aufmerksamkeit, und genau dort schleichen sich Fehler ein.
3. Bei der Crash-Animation kommt hinzu: derselbe Animationscode steht **doppelt** (einmal fürs Einzelspiel, einmal fürs Mehrspieler-Spiel). Eine Änderung muss an zwei Stellen gemacht werden — und wird irgendwann an einer davon vergessen.

## 2 — Der eine Satz pro Umbau

| Kürzel | Was es in einem Satz ist                                                                                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **W3** | Die 880-Zeilen-Datei `wallet.ts` wird in **einen kleinen Geld-Kern plus vier Themen-Module** aufgeteilt — der Geld-Kern bleibt dabei unverändert in der Logik, es wird nur sortiert.       |
| **X3** | Die doppelten Animationsblöcke der beiden Crash-Spielarten werden in **ein gemeinsames Modul** gezogen, das beide Seiten benutzen — und die Rechenteile davon werden **erstmals testbar**. |

Kurz: **W3 sortiert eine zu große Geld-Datei um. X3 entfernt doppelten Animationscode.** Beide berühren keine Spielregel, keine Datenbank und keine Auszahlungslogik.

## 3 — W3: die Geld-Datei aufteilen

### Was heute konkret drinsteht

Die Datei `src/lib/casino/wallet.ts` enthält **eine Klasse über die Zeilen 77–880** mit rund **26 Methoden**, die sieben verschiedene Themen abdecken: Geld & Abrechnung, Fairness-Nachweise („Provably Fair"), Crash-Abgleich & Mehrspieler, Promo-Codes, Rang/Aufstieg, Chat & Social, Auswertung. Sie ist zugleich die **einzige Vertragsquelle für die Geld-Aufrufe an die Datenbank** (Zeilen 16–20) — hier hängt echte Auszahlungslogik dran.

Ein zweiter Befund: die **Kommentar-Zwischenüberschriften** in der Datei (Zeilen 159, 251, 392, 539, 598, 651) passen **nicht** zu dem, was darunter steht. Unter „Crash" liegen zum Beispiel Abrechnungs- und Blackjack-Methoden, unter „Seeds" die Rundenverwaltung. Die Datei ist also nicht nur groß, sie ist auch **falsch beschriftet**.

Beruhigender Befund (geprüft 2026-09-17): **20 Stellen im Projekt nutzen diese Datei — alle im Serverbereich** (API-Endpunkte und ein Server-Hilfsmodul), **kein einziger Browser-Baustein**. Der Umbau kann also keine Server-Geheimnisse ins Browser-Paket ziehen, und alle 20 Nutzer merken nichts, weil die Klasse unter demselben Namen weiterbesteht.

### Was Schritt für Schritt passiert

1. **Schritt 0 — Grenzen schriftlich festlegen:** Für die sieben Themenbereiche werden Verträge angelegt, die die Klasse selbst erfüllen muss. Effekt: die Grenzen sind ab da maschinell prüfbar (der Typ-Check schlägt fehl, wenn eine Methode abdriftet). **Zeilen gespart: 0.** Dieser Schritt ist die Vorbereitung, nicht das Ergebnis.
2. **Die vier Nicht-Geld-Themen wandern aus:** Chat & Social, Fairness-Nachweise, Rang/Aufstieg, Promo-Codes bekommen je ein eigenes Modul. Jede Methode wird **Zeichen für Zeichen übernommen** (keine Umbenennung, keine neue Unterschrift), die falschen Zwischenüberschriften wandern mit.
3. **Die Promo-Codes kommen zuletzt** — das ist der einzige Nicht-Geld-Bereich, der Guthaben schreibt. Vor dem Umzug wird er Zeile für Zeile auf Geld-Pfad-Verhalten geprüft (Fehlerbehandlung, Antwortprüfung), danach der Testlauf plus ein Klick-Check der betroffenen Route durch dich.
4. **Der Geld-Kern bleibt liegen** — Geld, Abrechnung, Crash-Abgleich: zusammen rund **350 Zeilen**, ein Modul, eine Verantwortung.

### Was sich für dich konkret ändert

- Eine Aufgabe zu Promo-Codes öffnet heute 880 Zeilen und liest darin herum. Künftig öffnet sie ein Modul mit **60–150 Zeilen**.
- Änderungen am Geld-Kern sind nicht mehr von Chat-Code umgeben — die Hemmschwelle, versehentlich im Geldbereich zu landen, sinkt.
- Die Zwischenüberschriften sagen wieder die Wahrheit, statt zu verwirren.

### Sicherheitsnetze (weil hier Geld hängt)

| Netz                    | Wirkung                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Vorarbeit Pflicht       | Vor dem Umbau werden die beiden Service-Layer-SOPs + der Service-Kontext gelesen (`xx_sop/05`, `xx_sop/06`, `xx_docs/05`) |
| Reine 1:1-Übernahme     | Keine Logikänderung, keine neuen Unterschriften → Verhalten kann sich nur ändern, wenn beim Kopieren ein Fehler passiert  |
| Test nach jedem Schritt | `npm test` nach jedem Modul; bei Rot wird der Schritt zurückgerollt (Rollback-Punkt je Schritt)                           |
| Sonderprüfung Promo     | separater Money-Check + `@migration-security-guard`-Review vor dem Promo-Umzug                                            |
| Unangetastet            | Die Datenbank-Aufrufe selbst (Migration 007) und alle Spielregeln werden **nicht** berührt                                |

### Was es nicht ist

Kein Umbau der Geld-Logik, kein Datenbank-Thema, kein Umbau der Spielregeln. Es ist **Sortieren einer zu großen Datei inklusive Beschriftungskorrektur**.

## 4 — X3: doppelten Animationscode entfernen

### Was heute konkret drinsteht

Der Crash-Modus existiert zweimal: als Einzelspiel-Datei (982 Zeilen) und als Mehrspieler-Datei (782 Zeilen). In beiden stecken **vier Blöcke wörtlich identisch**: Partikel-Bewegung, Explosions-Effekt, die Schweif-Grafik hinter dem Raketenkurs und die Bildschirm-/Auflösungs-Mathematik. Dazu kommt der Haupt-Zeichentakt (rund 125 Zeilen), der sich nur in zwei winzigen Stellen unterscheidet.

Folge: Eine Verbesserung an den Partikeln muss **an zwei Stellen** eingebaut werden. Die Wahrscheinlichkeit, dass beide Seiten auseinanderlaufen, steigt mit jeder Änderung.

### Was Schritt für Schritt passiert

1. **Schritt 0 — reine Rechenteile herausziehen:** Partikel-Bewegung, Schweif-Geometrie und Auflösungs-Mathematik werden zu **reinen Rechenfunktionen** (sie zeichnen nichts, sie rechnen nur) in einem neuen Ordner `src/components/casino/games/crash-loop/`. Für diesen Code gibt es heute **null Tests** — er bekommt jetzt welche. (Präzise: in beiden Crash-Ordnern liegen bereits je 22 Zeilen Test, aber die prüfen nur Stil- und Bilddatei-Fragen per Textvergleich, **nicht** die Animation. Rund 100–130 doppelte Zeilen verschwinden, und dieser Teil ist erstmals absicherbar.)
2. **Die vier doppelten Blöcke wandern ins gemeinsame Modul:** Der Unterschied zwischen den beiden Spielarten (ein kleiner Zahlenwert am Raketenschweif) wird **als Einstellwert übergeben**, nicht als zwei Code-Versionen hinterlegt.
3. **Der Zeichentakt bleibt bei jeder Spielart** — er unterscheidet sich echt und wird bewusst nicht zusammengelegt.
4. **Sichtprüfung nach jedem Block:** Beide Crash-Seiten werden optisch verglichen, damit der Umbau keine Animation verändert.

### Was sich für dich konkret ändert

- Rund **150–160 Zeilen doppelter Animation** verschwinden; eine Änderung ist künftig **eine** Änderung.
- Der Animationscode ist erstmals **getestet** (heute: 0 Tests) — Änderungen daran können nicht mehr unbemerkt kaputtgehen.
- Der neue Ordner liegt **neben** beiden Spielarten, nicht in einer von beiden — so bleibt die bestehende Regel intakt, dass die zwei Spielarten sich nicht gegenseitig hineinimportieren.

### Sicherheitsnetze

| Netz                        | Wirkung                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Tests zuerst                | Schritt 0 baut das Testnetz, bevor Produktionscode verschoben wird                                               |
| Einstellwerte statt Umbau   | Der einzige Unterschied zwischen beiden Seiten wird als Parameter übergeben — der Code selbst bleibt unverändert |
| Zeichentakt bleibt getrennt | Der echte Unterschied wird nicht eingeebnet                                                                      |
| Sichtprüfung je Block       | beide Crash-Seiten werden nach jedem Schritt optisch kontrolliert                                                |
| Optionales Zusatznetz       | Falls die Sichtprüfung unsicher wird: Verhalten der vier Blöcke vorab mit Tests festnageln (als „X2" geführt)    |

### Was es nicht ist

Keine Änderung an Spielablauf, Gewinnlogik oder Trefferchancen. Es ist **Aufräumen von doppeltem Anzeigecode plus erstmalige Absicherung**.

## 5 — Warum genau diese beiden (und nicht die einfacheren Varianten)

Beide Umbauten stammen aus einem Optionsvergleich nach dem Haus-Schema (Lerneffekt 30 %, Aufwand 25 %, Risiko 25 %, Wartbarkeit 20 %; Skala 1–5; Mindestwert **4,20**). Gewählt wurden die Varianten, die **den kompletten Umbau** beschreiben und dabei **ausschließlich aus Schritten bestehen, die selbst über der Mindestbar liegen**:

| Umbau           | Gewählt                                                 | Score    | Verlorene Alternativen                                                                                         |
| --------------- | ------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| Geld-Service    | **W3** (enthält W2 als Schritt 0 und W1 als Teilstücke) | **4,25** | W1 4,45 (nur die zwei harmlosesten Themen — spart am wenigsten), W2 4,63 (nur Verträge, spart **keine** Zeile) |
| Crash-Animation | **X3** (Schritt 0 = X1)                                 | **4,20** | X1 4,63 (nur der Rechenteil — die Doppelung bleibt halb stehen), X2 4,38 (nur Tests, kein Aufräumen)           |

Der Punkt: Die günstigeren Varianten sind **Ausschnitte** der gewählten, nicht deren Ersatz. W3/X3 heben den ganzen Block, ohne an einer Stelle unter die Bar zu fallen. Die ausführlichen Matrizen stehen in [`Planungsdateien/03a_r03_single_responsibility_plan.md`](Planungsdateien/03a_r03_single_responsibility_plan.md) §2a/§2b.

## 6 — Der Vorteil in Zahlen

| Größe                                                          | Heute                                                           | Nach W3 + X3                                                           |
| -------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Größte Datei der Geld-Schicht                                  | 880 Zeilen in einer Datei                                       | ~350 Zeilen Geld-Kern + vier Module à 60–150 Zeilen                    |
| Zwei Crash-Spielarten zusammen                                 | 1.764 Zeilen, davon ~350–360 doppelt                            | dieselben Dateien **ohne** die doppelten Blöcke; ein gemeinsames Modul |
| Tests für Crash-Animationscode                                 | 0 (die 2 vorhandenen 22-Zeilen-Tests prüfen nur Stil/Bilddatei) | vorhanden (Schritt 0)                                                  |
| Katalog-Niveau Regel 3 („ein Verantwortungsbereich pro Modul") | 62 %                                                            | Ziel ~85 % — wird **nach** dem realen Umbau gemessen, nicht vorher     |
| Katalog-Niveau Regel 7 („keine Doppelung")                     | 68 %                                                            | Ziel ~85 % — ebenfalls erst nach dem realen Umbau                      |

Ehrliche Einordnung: Die beiden Niveauwerte **steigen erst, wenn der Code wirklich umgebaut ist**. Bis dahin bleibt die Erklärung ein Vorhaben, kein Fortschritt — das ist bewusst so, damit die Prozentzahlen nicht durch Papier besser werden.

## 7 — Reihenfolge, Kosten und Entscheidung

- **Reihenfolge: X3 zuerst, dann W3.** Begründung: X3 hat **keinen Geldkontakt**, bringt aber als Erstes echte Tests für bislang ungetesteten Code mit. Dieses Testnetz und die dabei gewonnene Routine kommen W3 zugute, das deutlich sensibler ist.
- **Aufwand:** je Umbau im Bereich halber bis ganzer Arbeitstag in mehreren kleinen Schritten — nicht „ein großer Schnitt". Genau deshalb ist jeder Schritt einzeln abnehmbar und umkehrbar.
- **Voraussetzungen:** Für W3 werden zusätzlich die Service-Layer-SOPs gelesen und der Promo-Schritt bekommt ein eigenes Sicherheits-Review. Für X3 genügt das Testnetz aus Schritt 0.
- **Entscheidung des LLM (delegiert von Jan): beide Umbauten werden angegangen, X3 zuerst.** Die Umsetzungspläne sind am 2026-09-17 als **eigene** Planungsdateien angelegt (`Execution-Ready`, Umsetzung und Analyse damit getrennt; `03a_r03` bleibt archiviert):
  - **[`Planungsdateien/03b_x3_crash_loop_schnitt_plan.md`](Planungsdateien/03b_x3_crash_loop_schnitt_plan.md)** — X3, Money-Pfad **Nein**, L0–L4 (L3 = optionales Testnetz).
  - **[`Planungsdateien/03c_w3_wallet_service_schnitt_plan.md`](Planungsdateien/03c_w3_wallet_service_schnitt_plan.md)** — W3, Money-Pfad **Ja**, L0–L6 mit **K4-Jangate beim Promo-Schritt (L5)**.
- **Startbereit:** beide Pläne stehen auf `Execution-Ready`; sie warten nicht auf eine weitere Entscheidung, sondern nur auf den Start (bei W3-L5 zusätzlich auf deine Freigabe, weil dort Guthaben geschrieben wird).
- **Nicht Teil dieser Umbauten:** die Datenbank-Aufrufe selbst, alle Spielregeln, sowie die weiterhin bei dir offene Entscheidung zur **Lese-Sperre** für die automatisch erzeugte Typen-Datei (`database.types.ts`, Punkt R8) — die ist unabhängig und bleibt offen.

## 8 — Wenn wir sie angehen: was in welcher Form passiert

| Phase                 | Ergebnis (Plan-Meilenstein)                                                   | Prüfung                                                             |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1. X3 Schritt 0       | reine Rechenfunktionen im neuen `crash-loop/`-Ordner + erste Tests            | `npm test` (neu: grün, vorher: keine Tests)                         |
| 2. X3 Blöcke 1–4      | vier doppelte Blöcke im gemeinsamen Modul, beide Spielarten nutzen es         | `npm test` + Sichtvergleich beider Crash-Seiten                     |
| 3. W3 Schritt 0       | sieben Verträge für die Themenbereiche, Typ-Check erzwingt Einhaltung         | `npm run typecheck`                                                 |
| 4. W3 Module 1–3      | Chat & Social, Fairness, Rang/Aufstieg ausgelagert                            | `npm test` je Modul, Rollback-Punkt je Modul                        |
| 5. W3 Modul 4 (Promo) | letzter, geld-naher Bereich ausgelagert                                       | Money-Prüfung + `@migration-security-guard` + Klick-Check durch Jan |
| 6. Nachmessung        | Zeilenzahlen + Katalog-Niveau Regel 3 und 7 aktualisiert (ehrliche Ist-Werte) | `npm run check-file-sizes`                                          |

Phasen 1–2 = [`03b`](Planungsdateien/03b_x3_crash_loop_schnitt_plan.md) L1/L2 · Phasen 3–5 = [`03c`](Planungsdateien/03c_w3_wallet_service_schnitt_plan.md) L1/L2–L4/L5 · Phase 6 = 03b-L4 + 03c-L6.

**Hauptverlinkung:** [`01_15_03a_code_modularisierung_regelkatalog.md`](01_15_03a_code_modularisierung_regelkatalog.md) §R3 (Entscheidungstabelle) →
**diese Datei** (Klartext-Erklärung) →
Umsetzung: [`03b` X3](Planungsdateien/03b_x3_crash_loop_schnitt_plan.md) · [`03c` W3](Planungsdateien/03c_w3_wallet_service_schnitt_plan.md) →
Option-Details in [`Planungsdateien/03a_r03_single_responsibility_plan.md`](Planungsdateien/03a_r03_single_responsibility_plan.md) §2a/§2b.

## 9 — Was sich an der Token-Ökonomie ändert (und was nicht)

**Messbasis (2026-09-17):** `wallet.ts` 880 Z. / 31.126 Zeichen · Solo-Loop 982 Z. / 34.327 Zch. · MP-Loop 782 Z. / 28.499 Zch. → **~35 Zeichen pro Zeile**; für Code gilt grob **3,7 Zeichen pro Token** ⇒ **~9–10 Tokens pro Codezeile**. Alle Zahlen unten sind daraus **gerechnete Schätzungen**, keine Messung — die Basis ist gemessen, die Umrechnung ist eine Faustregel.

**W3 (Geld-Datei): der Gewinn trifft den häufigsten Fall.**

| Aufgabe berührt …                                                                                        | heute gelesen        | nach W3 gelesen                        | Δ         |
| -------------------------------------------------------------------------------------------------------- | -------------------- | -------------------------------------- | --------- |
| Geld-Kern: 5 der 14 Routen (`bet`, `bet-crash-multiplayer`, `blackjack`, `active-round`, `user/balance`) | 880 Z. ≈ **8.400 T** | ~391 Z. ≈ **3.700 T**                  | **−56 %** |
| Promo-Codes                                                                                              | 880 Z. ≈ 8.400 T     | ~147 Z. Modul + Verträge ≈ **2.200 T** | **−74 %** |
| Chat & Social                                                                                            | 880 Z. ≈ 8.400 T     | ~63 Z. ≈ **700 T** (+ Verträge)        | **−92 %** |
| Zwei Domänen gleichzeitig (z. B. Abgleich + Rang)                                                        | 880 Z. ≈ 8.400 T     | 391 + 136 = 527 Z. ≈ **5.000 T**       | −40 %     |

Die Aufteilung der 20 Nutzer nach Zielmodul (gezählt 2026-09-17): Geld-Kern **5** Routen (`bet`, `bet-crash-multiplayer`, `blackjack`, `active-round`, `user/balance`) · Gamification **4** (3 Routen + `telegram-notifier` via `emitBigWinNotifyEvent`) · Promo 2 · Seeds 2 · Social 2 · Tests 5. Der **häufigste** Berührungspunkt ist damit der Geld-Kern — und genau der fällt von 880 auf ~391 Zeilen. Kein einziger der 20 Nutzer braucht künftig die ganze Datei: jeder liest nur noch sein Modul. **Gegenbuchung:** L1 legt Domänen-Verträge an (heute 24 Z. ≈ 210 T → danach grob 100–120 Z. ≈ 1.000 T); wer sie nicht braucht, liest sie nicht. Netto bleibt der Vorteil in allen vier Zeilen positiv.

**X3 (Crash-Animation): großer Gewinn pro Aufgabe, aber seltener ausgelöst.**

| Aufgabe berührt …                                               | heute gelesen                            | nach X3 gelesen                                                    | Δ                              |
| --------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------ | ------------------------------ |
| den doppelten Animationscode (Partikel/Schweif/Auflösung/Shake) | **beide** Loops: 1.764 Z. ≈ **17.000 T** | gemeinsames Modul (~200–300 Z. ≈ **2.000–3.000 T**) + Aufrufstelle | **−80 % und mehr**             |
| nur die Eigenheiten **einer** Spielart                          | 982 bzw. 782 Z. ≈ 9.300 / 7.700 T        | unverändert — **plus** ggf. das gemeinsame Modul                   | **kann minimal teurer werden** |

Ehrlich dazu: X3 macht Aufgaben, die **beide** Spielarten betreffen, dramatisch billiger — aber solche Aufgaben sind selten. Für Aufgaben an nur einer Spielart ändert sich am Lesefootprint **nichts**, und sie können durch das zusätzliche Modul sogar leicht teurer werden. Der eigentliche X3-Gewinn liegt deshalb nicht bei den Tokens, sondern bei **einer Änderungsstelle statt zwei** und den **erstmals vorhandenen Tests**.

**Was sich token-seitig sonst ändert:**

- Das CI-Gate `npm run check-file-sizes` meldet nach beiden Umbauten keine Großdatei-Warnungen mehr — weniger Fehlsignale im Kontext.
- Der Lese-**Pfad** wird bei W3 flacher (ein kleines Modul statt einer großen Datei), bei X3 um eine Station tiefer (Loop → gemeinsames Modul). Tiefere Pfade kosten gelegentlich einen zusätzlichen Read — das ist der bewusste Preis der einen Änderungsstelle.
- **Keine** Auswirkung auf Typecheck-, Lint-, Test- oder Build-Laufzeit; **keine** Auswirkung auf die Task-Typen, die diese Dateien gar nicht berühren.

## 10 — Ändert sich die Architektur? (die kurze Antwort: nein, bis auf das eine, was der Zweck ist)

| Ebene                                                                 | Ändert sich?                     | Warum                                                                                                                                                                             |
| --------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schichten & Datenfluss (UI → API → Service → Datenbank-RPC)           | **Nein**                         | Es kommt keine Schicht hinzu, keine fällt weg, kein Aufrufweg wird umgehängt                                                                                                      |
| Datenbank, RPCs, Migrationen, Spielregeln, Auszahlungen               | **Nein**                         | Nicht im Scope; `007_consolidated_financial_system.sql` wird nicht angefasst                                                                                                      |
| Öffentliche Schnittstelle (`WalletService`, Klassennamen, Signaturen) | **Nein**                         | Reine 1:1-Verschiebung ohne Signaturänderung — die 20 Nutzer merken nichts                                                                                                        |
| Laufzeitverhalten, Optik, Ladezeit, Abhängigkeiten im Browser-Paket   | **Nein**                         | Kein neues Paket, kein neuer Client-Import (alle 20 Nutzer sind Server-Code)                                                                                                      |
| **Modul-Architektur: Dateigrenzen & Abhängigkeitsrichtung**           | **Ja — genau das ist der Zweck** | W3: `wallet.ts` wird Fassade + vier Domänen-Module (Importrichtung einseitig, zyklenfrei). X3: ein **neues gemeinsames Geschwister-Modul**, auf das beide Crash-Spielarten zeigen |

Der letzte Punkt ist die präzise Antwort auf deine Frage: **An der Laufzeit- und Systemarchitektur ändert sich nichts** — es ist eine Umsortierung im Inneren. Was sich ändert, ist die **Modul-Architektur** selbst, und zwar ausschließlich die zwei Größen, die der Katalog misst: „ein Verantwortungsbereich pro Modul" (Regel 3) und „keine Doppelung" (Regel 7). Ein neuer Abhängigkeitspfeil entsteht nur bei X3 (beide Spielarten → gemeinsames Modul); bei W3 zeigt der Pfeil nur von der Fassade nach innen, nie zwischen zwei Domänen-Modulen.
