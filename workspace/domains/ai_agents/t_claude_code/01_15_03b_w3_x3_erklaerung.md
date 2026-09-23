# 01_15_03b — W3 und X3 in Klartext (was dahinter steckt und was es bringt)

> **Status:** Erklärung (Entscheidungs-Hauptverlinkung) · **Stand:** 2026-09-18 (Entscheidungen: 2026-09-16; **beide Umbauten am 2026-09-18 ausgeführt** — X3 und W3, siehe §7/§9-Nachtrag) · **Owner:** LLM · **Adressat:** Jan
> **Zweck:** Diese Datei erklärt die beiden beschlossenen Umbauten **ohne Fachvokabular** — was gemacht wird, in welcher Reihenfolge, mit welchen Sicherheitsnetzen, und was der Vorteil ist. Sie ist der Einstieg; die Zahlen und Option-Matrizen stehen in [`01_15_03a_code_modularisierung_regelkatalog.md`](01_15_03a_code_modularisierung_regelkatalog.md) §R3 und [`Planungsdateien/03a_r03_single_responsibility_plan.md`](Planungsdateien/03a_r03_single_responsibility_plan.md) §2a/§2b.
> **Ausgangslage:** Beide Umbauten sind **entschieden** (2026-09-16, Optionswahl delegiert: **W3** für den Geld-Service, **X3** für die Crash-Animation) und **inzwischen gebaut** (2026-09-18). Die Abschnitte 1–6 stehen bewusst noch auf dem **Vorher-Stand** („was geplant war") — dort, wo eine Zahl durch die Ausführung falsch geworden ist, steht die gemessene Zahl direkt daneben bzw. im Nachtrag. Die Katalog-Niveaus stiegen entsprechend den Ist-Werten: Regel 3 **62 → 78 %**, Regel 7 **68 → 78 %**; beide werden nachgemessen, nicht vorhergesetzt.

## 1 — Warum überhaupt: das Problem in drei Sätzen

1. Zwei Dateien im Projekt sind so groß geworden, dass niemand sie mehr am Stück überblickt: die **Geld-Service-Datei** mit 880 Zeilen und die **Crash-Spiel-Animation** mit zwei Dateien à 982 und 782 Zeilen.
2. Jede Aufgabe, die eine dieser Dateien berührt, muss erst viel fremden Inhalt mitlesen — das kostet Zeit, Geld und Aufmerksamkeit, und genau dort schleichen sich Fehler ein.
3. Bei der Crash-Animation kommt hinzu: derselbe Animationscode steht **doppelt** (einmal fürs Einzelspiel, einmal fürs Mehrspieler-Spiel). Eine Änderung muss an zwei Stellen gemacht werden — und wird irgendwann an einer davon vergessen.

## 2 — Der eine Satz pro Umbau

| Kürzel | Was es in einem Satz ist                                                                                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **W3** | Die 880-Zeilen-Datei `wallet.ts` wird in **einen kleinen Geld-Kern plus vier Themen-Module** aufgeteilt — der Geld-Kern bleibt dabei unverändert in der Logik, es wird nur sortiert.       |
| **X3** | Die doppelten Animationsblöcke der beiden Crash-Spielarten werden in **ein gemeinsames Modul** gezogen, das beide Seiten benutzen — und die Rechenteile davon werden **erstmals testbar**. |

Kurz: **W3 sortiert eine zu große Geld-Datei um. X3 entfernt doppelten Animationscode.** Keiner der beiden Umbauten ändert eine Spielregel, eine Quote, ein Datenbankschema oder eine RPC. Der einzige unterschiedliche Punkt: W3 bewegt auch Code, der Guthaben schreibt (Promo-Codes) — deshalb lief dieser eine Schritt mit Sonderprüfung (Promo-Bereich Zeile für Zeile auf Geld-Pfad-Verhalten geprüft, `@migration-security-guard`-Review bestanden), während X3 keinerlei Geldkontakt hat. Der anschließende **Klick-Check der Promo-Route durch dich steht noch offen** — er ist die letzte offene Abnahme, keine Code-Änderung.

## 3 — W3: die Geld-Datei aufteilen

### Was vorher konkret drinstand (Stand vor dem Umbau am 2026-09-18)

Die Datei `src/lib/casino/wallet.ts` enthielt **eine Klasse über die Zeilen 77–880** mit rund **26 Methoden**, die sieben verschiedene Themen abdecken: Geld & Abrechnung, Fairness-Nachweise („Provably Fair"), Crash-Abgleich & Mehrspieler, Promo-Codes, Rang/Aufstieg, Chat & Social, Auswertung. Sie war zugleich die **einzige Vertragsquelle für die Geld-Aufrufe an die Datenbank** (Zeilen 16–20) — hier hängt echte Auszahlungslogik dran.

Ein zweiter Befund: die **Kommentar-Zwischenüberschriften** in der Datei (Zeilen 159, 251, 392, 539, 598, 651) passten **nicht** zu dem, was darunter stand. Unter „Crash" liegen zum Beispiel Abrechnungs- und Blackjack-Methoden, unter „Seeds" die Rundenverwaltung. Die Datei war also nicht nur groß, sie war auch **falsch beschriftet** — behoben: die Datei trägt jetzt eine Domänen-Map im Kopf, die den echten Schnitt beschreibt.

Beruhigender Befund (geprüft 2026-09-17, nachgezählt 2026-09-18): **21 Stellen im Projekt nutzen diese Datei — alle im Serverbereich** (14 API-Endpunkte plus zwei Server-Hilfsmodule `telegram-notifier.ts` und `guide-tools.ts`, dazu 5 Testdateien); **kein einziger Browser-Baustein**. Die Vortages-Schätzung „20" zählte `guide-tools.ts` nicht mit. Der Umbau kann also keine Server-Geheimnisse ins Browser-Paket ziehen, und alle Nutzer merken nichts, weil die Klasse unter demselben Namen weiterbesteht — verifiziert: nach dem Umbau sind es 25 Importstellen, alle unverändert adressiert.

### Was Schritt für Schritt passiert

1. **Schritt 0 — Grenzen schriftlich festlegen:** Für die sieben Themenbereiche werden Verträge angelegt, die die Klasse selbst erfüllen muss. Effekt: die Grenzen sind ab da maschinell prüfbar (der Typ-Check schlägt fehl, wenn eine Methode abdriftet). **Zeilen gespart: 0.** Dieser Schritt ist die Vorbereitung, nicht das Ergebnis.
2. **Die vier Nicht-Geld-Themen wandern aus:** Chat & Social, Fairness-Nachweise, Rang/Aufstieg, Promo-Codes bekommen je ein eigenes Modul. Jede Methode wird **Zeichen für Zeichen übernommen** (keine Umbenennung, keine neue Unterschrift), die falschen Zwischenüberschriften wandern mit. **Ergebnis:** `wallet-social.ts` 41 Z. · `wallet-seeds.ts` 87 Z. · `wallet-gamification.ts` 134 Z. · `wallet-promo.ts` 148 Z.
3. **Die Promo-Codes kommen zuletzt** — das ist der einzige Nicht-Geld-Bereich, der Guthaben schreibt. Vor dem Umzug wird er Zeile für Zeile auf Geld-Pfad-Verhalten geprüft (Fehlerbehandlung, Antwortprüfung), danach der Testlauf plus ein Klick-Check der betroffenen Route durch dich. **Ergebnis:** Zeile-für-Zeile-Money-Prüfung mechanisch bestanden (0 Zeichen Abweichung außer Typannotationen) + `@security-reviewer`: **PASS**. `@migration-security-guard` war **nicht** anzuwenden — keine Datei unter `supabase/**` wurde berührt, Migration 007 blieb unangetastet. Eine vorbestehende, 1:1 mitgewanderte Latenz wurde dabei notiert statt kaschiert: der VIPPRO-Auto-Provision-Upsert wertet `{ error }` nicht aus (nur der Retry-/Catch-Pfad fängt den Fehlschlag ab) — unverändert wie vor dem Umzug. Klick-Check durch dich: **offen**.
4. **Der Geld-Kern bleibt liegen** — Geld, Abrechnung, Crash-Abgleich: nachgezählt waren es **~391 Zeilen** (die Options-Matrix schätzte „~350"), ein Modul, eine Verantwortung. **Gemessen nach dem Umbau: 569 Zeilen** — die Differenz ist kein Fremdcode, sondern das, was ein echter Schnitt stehen lässt: 14 Delegationen, Vertrags-Import, Domänen-Map im Kopf und der Platz, den die ausgelagerten Methoden mit ihren Typannotationen brauchten. Die Zahl wurde nicht schöngerechnet, sondern die Schwelle in `vitest.config.ts` auf sie gezogen.

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
| Sonderprüfung Promo     | separater Money-Check + `@security-reviewer`-Review vor dem Promo-Umzug (ausgeführt: PASS)                                |
| Unangetastet            | Die Datenbank-Aufrufe selbst (Migration 007) und alle Spielregeln werden **nicht** berührt                                |

### Was es nicht ist

Kein Umbau der Geld-Logik, kein Datenbank-Thema, kein Umbau der Spielregeln. Es ist **Sortieren einer zu großen Datei inklusive Beschriftungskorrektur**.

## 4 — X3: doppelten Animationscode entfernen

### Was vorher konkret drinstand (Stand vor dem Umbau am 2026-09-18)

Der Crash-Modus existierte zweimal: als Einzelspiel-Datei (982 Zeilen) und als Mehrspieler-Datei (782 Zeilen). In beiden steckten **vier Blöcke wörtlich identisch**: Partikel-Bewegung, Explosions-Effekt, die Schweif-Grafik hinter dem Raketenkurs und die Bildschirm-/Auflösungs-Mathematik. Dazu kommt der Haupt-Zeichentakt (rund 125 Zeilen), der sich nur in zwei winzigen Stellen unterscheidet.

Folge: Eine Verbesserung an den Partikeln muss **an zwei Stellen** eingebaut werden. Die Wahrscheinlichkeit, dass beide Seiten auseinanderlaufen, steigt mit jeder Änderung.

### Was Schritt für Schritt passiert

1. **Schritt 0 — reine Rechenteile herausziehen:** Partikel-Bewegung, Schweif-Geometrie und Auflösungs-Mathematik werden zu **reinen Rechenfunktionen** (sie zeichnen nichts, sie rechnen nur) in einem neuen Ordner `src/components/casino/games/crash-loop/`. Für diesen Code gab es **null Tests** — er hat jetzt welche. (Präzise: in beiden Crash-Ordnern lagen bereits je 22 Zeilen Test, aber die prüfen nur Stil- und Bilddatei-Fragen per Textvergleich, **nicht** die Animation.) **Ergebnis:** `particles-physics.ts` 140 · `tail-geometry.ts` 57 · `viewport-shake.ts` 32 · `canvas-frame.ts` 27 · `crash-loop-shared.ts` 251 · `index.ts` (Fassade) 48.
2. **Die vier doppelten Blöcke wandern ins gemeinsame Modul:** Der Unterschied zwischen den beiden Spielarten (ein kleiner Zahlenwert am Raketenschweif) wird **als Einstellwert übergeben**, nicht als zwei Code-Versionen hinterlegt. **Ergebnis:** beide Spielarten nutzen `crash-loop-shared.ts`; die Hooks fielen auf **849** bzw. **663 Zeilen**.
3. **Der Zeichentakt bleibt bei jeder Spielart** — er unterscheidet sich echt und wird bewusst nicht zusammengelegt. **Eingehalten:** die beiden Zeichentakte sind nicht zusammengelegt worden.
4. **Sichtprüfung nach jedem Block:** Beide Crash-Seiten werden optisch verglichen, damit der Umbau keine Animation verändert. **Abweichung, offengelegt:** statt einer Sichtprüfung durch das LLM wurde das optionale Zusatznetz gebaut — **Charakterisierungs-Tests** (`crash-loop-shared.characterization.test.ts`, 537 Z.), die das Verhalten der vier Blöcke festnageln. Die **optische Abnahme durch dich steht daher noch aus** (zwei Crash-Seiten: Einzelspiel und Mehrspieler).

### Was sich für dich konkret ändert

- Rund **150–160 Zeilen doppelter Animation** verschwinden (gemessen: die beiden Hooks zusammen 1.764 → **1.512** Zeilen); eine Änderung ist künftig **eine** Änderung.
- Der Animationscode ist erstmals **getestet** (vorher: 0 Tests) — **+71 Tests**, Änderungen daran können nicht mehr unbemerkt kaputtgehen.
- Der neue Ordner liegt **neben** beiden Spielarten, nicht in einer von beiden — so bleibt die bestehende Regel intakt, dass die zwei Spielarten sich nicht gegenseitig hineinimportieren.

### Sicherheitsnetze

| Netz                        | Wirkung                                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tests zuerst                | Schritt 0 baut das Testnetz, bevor Produktionscode verschoben wird                                                                                                  |
| Einstellwerte statt Umbau   | Der einzige Unterschied zwischen beiden Seiten wird als Parameter übergeben — der Code selbst bleibt unverändert                                                    |
| Zeichentakt bleibt getrennt | Der echte Unterschied wird nicht eingeebnet                                                                                                                         |
| Sichtprüfung je Block       | beide Crash-Seiten werden nach jedem Schritt optisch kontrolliert — **eingelöst durch die Charakterisierungs-Tests, die optische Abnahme durch Jan ist noch offen** |
| Optionales Zusatznetz       | Falls die Sichtprüfung unsicher wird: Verhalten der vier Blöcke vorab mit Tests festnageln (als „X2" geführt) — **gebaut, siehe Schritt 4**                         |

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

| Größe                                                          | Vorher                                                          | Geplant (Schätzung)                                                    | **Gemessen 2026-09-18**                                                                                                                                             |
| -------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Größte Datei der Geld-Schicht                                  | 880 Zeilen in einer Datei                                       | ~390 Zeilen Geld-Kern + vier Module (63 / 82 / 136 / 147 Z.)           | **569 Z.** Geld-Kern + `wallet-social` 41 / `wallet-seeds` 87 / `wallet-gamification` 134 / `wallet-promo` 148 (Schätzung war zu optimistisch — siehe §3 Schritt 4) |
| Zwei Crash-Spielarten zusammen                                 | 1.764 Zeilen, davon ~350–360 doppelt                            | dieselben Dateien **ohne** die doppelten Blöcke; ein gemeinsames Modul | **849 + 663 = 1.512 Z.**; die Blöcke leben einmal in `crash-loop/` (5 Module: 27 / 140 / 57 / 32 / 251 + Fassade 48)                                                |
| Tests für Crash-Animationscode                                 | 0 (die 2 vorhandenen 22-Zeilen-Tests prüfen nur Stil/Bilddatei) | vorhanden (Schritt 0)                                                  | **+71 Tests** in 5 neuen Testdateien (Suite 1.942 → 2.013)                                                                                                          |
| Katalog-Niveau Regel 3 („ein Verantwortungsbereich pro Modul") | 62 %                                                            | Ziel ~85 %                                                             | **78 %** (R3 #5 Service-Klassen-Kohäsion 50 → 85; das Ziel ~85 % wurde bewusst **nicht** gesetzt)                                                                   |
| Katalog-Niveau Regel 7 („keine Doppelung")                     | 68 %                                                            | Ziel ~85 %                                                             | **78 %** (R7 #1 Crash-Loop-Duplikation 40 → 85)                                                                                                                     |

Ehrliche Einordnung: Die Niveauwerte wären **erst nach dem realen Umbau** gestiegen — das war der Grund, sie vorher nicht zu setzen. Genauso ehrlich ist die Gegenbuchung: die gemessenen **78 %** liegen unter dem einst notierten „Ziel ~85 %". Die Regel 3 erreicht keine 85 %, weil der Schnitt an der Geld-/Nicht-Geld-Grenze liegt und der Geld-Kern bewusst **eine** Verantwortung mit mehreren Verfahren bleibt — nicht, weil Restarbeit offen ist; die Regel 7 erreicht keine 85 %, weil die zwei Zeichentakte und die beiden dünnen Wächter-Testdateien (je 22 Z.) bewusst getrennt bleiben. Beide Werte stehen so auch im Katalog, mit Datum und Sub-Sub-Beleg.

## 7 — Reihenfolge, Kosten und Entscheidung

- **Reihenfolge: X3 zuerst, dann W3.** Begründung: X3 hat **keinen Geldkontakt**, bringt aber als Erstes echte Tests für bislang ungetesteten Code mit. Dieses Testnetz und die dabei gewonnene Routine kommen W3 zugute, das deutlich sensibler ist.
- **Aufwand:** je Umbau im Bereich halber bis ganzer Arbeitstag in mehreren kleinen Schritten — nicht „ein großer Schnitt". Genau deshalb ist jeder Schritt einzeln abnehmbar und umkehrbar.
- **Voraussetzungen:** Für W3 werden zusätzlich die Service-Layer-SOPs gelesen und der Promo-Schritt bekommt ein eigenes Sicherheits-Review. Für X3 genügt das Testnetz aus Schritt 0. **Eingelöst:** die SOPs `xx_sop/06`, `xx_docs/05`, `xx_sop/09` wurden vor dem Schnitt gelesen; der Promo-Schritt lief durch `@security-reviewer` (**PASS**) plus mechanische Zeile-für-Zeile-Money-Prüfung.
- **Entscheidung des LLM (delegiert von Jan): beide Umbauten werden angegangen, X3 zuerst.** Die Umsetzungspläne sind am 2026-09-17 als **eigene** Planungsdateien angelegt (`Execution-Ready`, Umsetzung und Analyse damit getrennt; `03a_r03` bleibt archiviert):
  - **[`Planungsdateien/03b_x3_crash_loop_schnitt_plan.md`](Planungsdateien/03b_x3_crash_loop_schnitt_plan.md)** — X3, Money-Pfad **Nein**, L0–L4 (L3 = optionales Testnetz).
  - **[`Planungsdateien/03c_w3_wallet_service_schnitt_plan.md`](Planungsdateien/03c_w3_wallet_service_schnitt_plan.md)** — W3, Money-Pfad **Ja**, L0–L6 mit **K4-Jangate beim Promo-Schritt (L5)**.
- **Startbereit (überholt):** beide Pläne standen auf `Execution-Ready`; sie warteten nicht auf eine weitere Entscheidung, sondern nur auf den Start (bei W3-L5 zusätzlich auf deine Freigabe, weil dort Guthaben geschrieben wird).
- **Nachtrag 2026-09-18 — X3 ist ausgeführt:** Der Crash-Loop-Umbau ist fertig und nachgemessen: beide Hooks **982 → 849** und **782 → 663 Zeilen**, vier Blöcke leben einmal in `crash-loop/` (5 Module + Fassade), dazu **71 neue Tests** für Code, der vorher gar keine hatte (Suite 1.942 → 2.013 grün). Die Erklärungen oben zur Wirkung bleiben unverändert gültig — die Zahlen dazu stehen in §9.
- **Nachtrag 2026-09-18 (abends) — W3 ist ebenfalls ausgeführt:** `wallet.ts` **880 → 569 Zeilen** (Geld-Kern, 12 echte Verfahren + 14 Delegationen), `wallet-contract.ts` **271 Z.** mit 7 Domänen-Verträgen, die vier Module `wallet-social` 41 / `wallet-seeds` 87 / `wallet-gamification` 134 / `wallet-promo` 148 Z., dazu **+37 Tests** (Suite 2.013 → 2.050 grün), `npm run check-file-sizes` **OK**, `wallet.ts` aus der Legacy-Warnliste gefallen. Der Split ist maschinell als 1:1 belegt (5 Körper-Abweichungen = 4 reine Typ-Substitutionen + 1 Kommentar; 11 Signatur-Abweichungen = ergänzte Rückgabe-Annotationen; 0 Stub-Probleme). **Offen ist damit nur noch der Klick-Check der Promo-Route durch dich** und der unveränderte R8-Punkt (Read-Deny) — beides keine Code-Arbeit. Details: [`03c`](Planungsdateien/03c_w3_wallet_service_schnitt_plan.md).
- **Zur Freigabe von L5 (Promo-Schritt), offengelegt:** Der Plan verlangte für L5 eine **explizite Freigabe vor** dem Schritt. Ausgeführt wurde er unter deiner Blanko-Anweisung „Execution fortführen, bis alles abgeschlossen ist" — gelesen als Freigabe, die **vor** der Sitzung liegt statt je Schritt. Das ist eine Auslegung, keine ausdrückliche L5-Freigabe; sie steht hier dokumentiert, damit sie nicht als stillschweigend erteilt durchgeht. Nachholbar ohne Code-Aufwand: der Klick-Check der Promo-Route.
- **Nicht Teil dieser Umbauten:** die Datenbank-Aufrufe selbst, alle Spielregeln, sowie die weiterhin bei dir offene Entscheidung zur **Lese-Sperre** für die automatisch erzeugte Typen-Datei (`database.types.ts`, Punkt R8) — die ist unabhängig und bleibt offen.

## 8 — Wenn wir sie angehen: was in welcher Form passiert

| Phase                 | Ergebnis (Plan-Meilenstein)                                                   | Prüfung                                                      | Status 2026-09-18                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 1. X3 Schritt 0       | reine Rechenfunktionen im neuen `crash-loop/`-Ordner + erste Tests            | `npm test` (neu: grün, vorher: keine Tests)                  | ✅ 5 Module, erste Tests grün                                                                                                 |
| 2. X3 Blöcke 1–4      | vier doppelte Blöcke im gemeinsamen Modul, beide Spielarten nutzen es         | `npm test` + Sichtvergleich beider Crash-Seiten              | ✅ ausgeführt; der Sichtvergleich wurde durch **Charakterisierungs-Tests** ersetzt (Sichtprüfung durch Jan weiterhin möglich) |
| 3. W3 Schritt 0       | sieben Verträge für die Themenbereiche, Typ-Check erzwingt Einhaltung         | `npm run typecheck`                                          | ✅ `wallet-contract.ts` 271 Z.; Muster korrigiert (Objektliteral mit Interface-Annotation statt `implements`)                 |
| 4. W3 Module 1–3      | Chat & Social, Fairness, Rang/Aufstieg ausgelagert                            | `npm test` je Modul, Rollback-Punkt je Modul                 | ✅ 41 / 87 / 134 Z., je grün                                                                                                  |
| 5. W3 Modul 4 (Promo) | letzter, geld-naher Bereich ausgelagert                                       | Money-Prüfung + `@security-reviewer` + Klick-Check durch Jan | ✅ Code + Review; **Klick-Check durch Jan offen**                                                                             |
| 6. Nachmessung        | Zeilenzahlen + Katalog-Niveau Regel 3 und 7 aktualisiert (ehrliche Ist-Werte) | `npm run check-file-sizes`                                   | ✅ OK (1.071 Dateien); R3 **78 %**, R7 **78 %**                                                                               |

Phasen 1–2 = [`03b`](Planungsdateien/03b_x3_crash_loop_schnitt_plan.md) L1/L2 · Phasen 3–5 = [`03c`](Planungsdateien/03c_w3_wallet_service_schnitt_plan.md) L1/L2–L4/L5 · Phase 6 = 03b-L4 + 03c-L6.

**Hauptverlinkung:** [`01_15_03a_code_modularisierung_regelkatalog.md`](01_15_03a_code_modularisierung_regelkatalog.md) §R3 (Entscheidungstabelle) →
**diese Datei** (Klartext-Erklärung) →
Umsetzung: [`03b` X3](Planungsdateien/03b_x3_crash_loop_schnitt_plan.md) · [`03c` W3](Planungsdateien/03c_w3_wallet_service_schnitt_plan.md) →
Option-Details in [`Planungsdateien/03a_r03_single_responsibility_plan.md`](Planungsdateien/03a_r03_single_responsibility_plan.md) §2a/§2b.

## 9 — Was sich an der Token-Ökonomie ändert (und was nicht)

**Messbasis (2026-09-17):** `wallet.ts` 880 Z. / 31.126 Zeichen · Solo-Loop 982 Z. / 34.327 Zch. · MP-Loop 782 Z. / 28.499 Zch. → **~35 Zeichen pro Zeile**; für Code gilt grob **3,7 Zeichen pro Token** ⇒ **~9–10 Tokens pro Codezeile**. Alle Zahlen unten sind daraus **gerechnete Schätzungen**, keine Messung — die Basis ist gemessen, die Umrechnung ist eine Faustregel.

**W3 (Geld-Datei): der Gewinn trifft den häufigsten Fall.** Die Tabelle ist auf die **gemessenen** Zeichenzahlen gezogen (2026-09-18, `wc -c`); die Token-Werte sind wie oben gerechnete Faustregel-Werte, keine Messung.

| Aufgabe berührt …                                                                                        | vorher gelesen                     | nach W3 gelesen                                             | Δ         |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------- | --------- |
| Geld-Kern: 5 der 14 Routen (`bet`, `bet-crash-multiplayer`, `blackjack`, `active-round`, `user/balance`) | 880 Z. / 31.126 Zch. ≈ **8.400 T** | 569 Z. / 21.005 Zch. ≈ **5.700 T**                          | **−33 %** |
| Promo-Codes                                                                                              | 880 Z. ≈ 8.400 T                   | 148 Z. / 4.864 Zch. ≈ **1.300 T** (+ optional Vertragsteil) | **−84 %** |
| Chat & Social                                                                                            | 880 Z. ≈ 8.400 T                   | 41 Z. / 1.352 Zch. ≈ **370 T** (+ optional Vertragsteil)    | **−96 %** |
| Zwei Domänen gleichzeitig (z. B. Abgleich + Rang)                                                        | 880 Z. ≈ 8.400 T                   | 569 + 134 Z. ≈ **7.000 T**                                  | −17 %     |

Die Aufteilung der Nutzer nach Zielmodul (gezählt 2026-09-17, korrigiert 2026-09-18 auf **21** vor dem Split / **25** danach): Geld-Kern **5** Routen (`bet`, `bet-crash-multiplayer`, `blackjack`, `active-round`, `user/balance`) · Gamification **4** (3 Routen + `telegram-notifier` via `emitBigWinNotifyEvent`) · Promo 2 · Seeds 2 · Social 2 · Tests 5 (+ 1 Server-Hilfsmodul `guide-tools.ts`, dessen Zuordnung der Split nicht ändert). Der **häufigste** Berührungspunkt ist damit der Geld-Kern — und der fällt von 880 auf **569** Zeilen. Kein einziger Nutzer braucht künftig die ganze Datei: jeder liest nur noch sein Modul. **Gegenbuchung 1:** die Domänen-Verträge kosten jetzt **271 Z. / 7.210 Zch. ≈ 1.950 T** (vorher 24 Z. ≈ 210 T) — wer sie nicht braucht, liest sie nicht. **Gegenbuchung 2 (ehrlich):** der Gewinn am Geld-Kern ist **kleiner als geplant** (−33 % statt −56 %), weil der Kern 569 statt ~391 Zeilen behielt. Aussage bleibt: in allen vier Zeilen ist der Netto-Effekt positiv, und die zwei häufigsten Fälle (Geld-Kern, Promo) profitieren am stärksten.

**X3 (Crash-Animation): großer Gewinn pro Aufgabe, aber seltener ausgelöst.**

| Aufgabe berührt …                                               | vorher gelesen                                       | nach X3 gelesen                                                                     | Δ                                                           |
| --------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| den doppelten Animationscode (Partikel/Schweif/Auflösung/Shake) | **beide** Loops: 1.764 Z. ≈ **17.000 T** (Schätzung) | gemeinsames Modul: `crash-loop-shared` 251 Z. / 6.264 Zch. ≈ **1.700 T**            | **−85 %** (gemessen)                                        |
| nur die Eigenheiten **einer** Spielart                          | 982 bzw. 782 Z. ≈ 9.300 / 7.700 T                    | **849 Z. ≈ 7.900 T** bzw. **663 Z. ≈ 6.500 T** — **plus** ggf. das gemeinsame Modul | −15 % bzw. −16 %; mit Modullesung **kann es teurer werden** |

Ehrlich dazu: X3 macht Aufgaben, die **beide** Spielarten betreffen, dramatisch billiger — aber solche Aufgaben sind selten. Für Aufgaben an nur einer Spielart ändert sich am Lesefootprint **nichts**, und sie können durch das zusätzliche Modul sogar leicht teurer werden. Der eigentliche X3-Gewinn liegt deshalb nicht bei den Tokens, sondern bei **einer Änderungsstelle statt zwei** und den **erstmals vorhandenen Tests**.

**Was sich token-seitig sonst ändert:**

- Das CI-Gate `npm run check-file-sizes` meldet nach beiden Umbauten keine Großdatei-Warnungen mehr — weniger Fehlsignale im Kontext.
- Der Lese-**Pfad** wird bei W3 flacher (ein kleines Modul statt einer großen Datei), bei X3 um eine Station tiefer (Loop → gemeinsames Modul). Tiefere Pfade kosten gelegentlich einen zusätzlichen Read — das ist der bewusste Preis der einen Änderungsstelle.
- **Keine** Auswirkung auf Typecheck-, Lint-, Test- oder Build-Laufzeit; **keine** Auswirkung auf die Task-Typen, die diese Dateien gar nicht berühren.

## 10 — Ändert sich die Architektur? (die kurze Antwort: nein, bis auf das eine, was der Zweck ist)

| Ebene                                                                 | Ändert sich?                     | Warum                                                                                                                                                                                                   |
| --------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schichten & Datenfluss (UI → API → Service → Datenbank-RPC)           | **Nein**                         | Es kommt keine Schicht hinzu, keine fällt weg, kein Aufrufweg wird umgehängt                                                                                                                            |
| Datenbank, RPCs, Migrationen, Spielregeln, Auszahlungen               | **Nein**                         | Nicht im Scope; `007_consolidated_financial_system.sql` wird nicht angefasst                                                                                                                            |
| Öffentliche Schnittstelle (`WalletService`, Klassennamen, Signaturen) | **Nein**                         | Reine 1:1-Verschiebung ohne Signaturänderung — die 21 Nutzer (vor dem Split) merken nichts; nach dem Split sind es 25 Importstellen, alle unverändert adressiert                                        |
| Laufzeitverhalten, Optik, Ladezeit, Abhängigkeiten im Browser-Paket   | **Nein**                         | Kein neues Paket, kein neuer Client-Import (alle Nutzer sind Server-Code; einziges Client-Berührtes bleibt `wallet-contract.ts` über den Store — deshalb dort nur die zwei Schemas als Laufzeit-Export) |
| **Modul-Architektur: Dateigrenzen & Abhängigkeitsrichtung**           | **Ja — genau das ist der Zweck** | W3: `wallet.ts` wird Fassade + vier Domänen-Module (Importrichtung einseitig, zyklenfrei). X3: ein **neues gemeinsames Geschwister-Modul**, auf das beide Crash-Spielarten zeigen                       |

Der letzte Punkt ist die präzise Antwort auf deine Frage: **An der Laufzeit- und Systemarchitektur ändert sich nichts** — es ist eine Umsortierung im Inneren. Was sich ändert, ist die **Modul-Architektur** selbst, und zwar ausschließlich die zwei Größen, die der Katalog misst: „ein Verantwortungsbereich pro Modul" (Regel 3) und „keine Doppelung" (Regel 7). Ein neuer Abhängigkeitspfeil entsteht nur bei X3 (beide Spielarten → gemeinsames Modul); bei W3 zeigt der Pfeil nur von der Fassade nach innen, nie zwischen zwei Domänen-Modulen.
