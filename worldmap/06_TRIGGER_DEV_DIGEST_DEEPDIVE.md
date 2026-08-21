# 06 — Trigger.dev Deep Dive: DailyActivityDigest ausbauen

> **Status:** Geplant — reine Evaluierung, noch keine Execution-Freigabe · **Stand:** 2026-08-21 · **Owner:** Jan (Auswahl) · **Scope:** Bewertungsgrundlage für den Ausbau von `daily-activity-digest.ts`. Kein Punkt aus dieser Datei wird umgesetzt, bevor Jan ihn einzeln freigibt.
>
> **Priorität laut Jan:** an erster Stelle der **Lerneffekt** (Trigger.dev auf das nächste Level heben), Spiel-Nutzen ist sekundär.
>
> **Update 2026-08-21:** Die ursprünglichen Top 8 sind auf **Top 6** reduziert — Jan hat die beiden reinen Zahlen-Erweiterungen ("Mehr Kennzahlen im Tagesreport", "Wochen-/Monats-Report mit Trend") gestrichen, alle übrigen Punkte ausdrücklich als interessant bestätigt. Nummerierung unten neu von 1–6, siehe Abschnitt 3 für den Verbleib der beiden gestrichenen Punkte.

## 1 — Übersicht für Jan (Top 6, zur Einzelentscheidung)

| Nr  | Name                                        | Lerneffekt  | Impact (Spiel/Projekt) | Aufwand        | Risiko         | Geld-Pfad betroffen?             | Voraussetzung           | Status     | Deine Entscheidung |
| --- | ------------------------------------------- | ----------- | ---------------------- | -------------- | -------------- | -------------------------------- | ----------------------- | ---------- | ------------------ |
| 1   | Doppel-Versand-Schutz (Idempotenz)          | Hoch        | Niedrig                | Niedrig        | Niedrig        | Nein                             | Baut auf Nr. 6 auf      | 🔴 Geplant | ⬜ Ja ⬜ Nein      |
| 2   | Jackpot-Alarm aus dem Geld-Pfad auslagern   | Hoch        | Mittel-Hoch            | Mittel         | Mittel         | **Ja** → Security-Review Pflicht | Keine                   | 🔴 Geplant | ⬜ Ja ⬜ Nein      |
| 3   | Live-Vorschau im Admin-Bereich (Realtime)   | Hoch        | Niedrig                | Mittel         | Niedrig        | Nein                             | Keine                   | 🔴 Geplant | ⬜ Ja ⬜ Nein      |
| 4   | Persönliche Wochen-Rückblicke pro Spieler   | Hoch        | Hoch                   | Mittel-Hoch    | Niedrig        | Nein                             | Keine                   | 🔴 Geplant | ⬜ Ja ⬜ Nein      |
| 5   | Freigabe-Workflow für Fraud-Signale         | Sehr hoch   | Mittel                 | Hoch           | Niedrig-Mittel | Nein                             | Keine                   | 🔴 Geplant | ⬜ Ja ⬜ Nein      |
| 6   | Aufteilung in zwei verkettete Mini-Aufgaben | Mittel-Hoch | Niedrig                | Niedrig-Mittel | Niedrig        | Nein                             | Voraussetzung für Nr. 1 | 🔴 Geplant | ⬜ Ja ⬜ Nein      |

**Spalten-Erklärung (einfach):**

- **Lerneffekt** — wie neu/lehrreich ist der Trigger.dev-Baustein dahinter für dich, unabhängig vom Nutzen fürs Spiel. Höchste Priorität laut deiner Vorgabe.
- **Impact (Spiel/Projekt)** — wie viel bringt es dem Casino/den Spielern konkret, falls überhaupt etwas.
- **Aufwand** — geschätzte Bauzeit bis fertig+geprüft, grob (nicht gemessen).
- **Risiko** — was im schlimmsten Fall schiefgehen kann, falls es einen echten Fehler hat.
- **Geld-Pfad betroffen?** — fasst der Punkt bestehenden, produktiven Auszahlungs-/Wallet-Code an? Nur bei Nr. 2 der Fall — braucht laut Projektregel zwingend einen Security-Reviewer-Durchlauf vor Go-Live.
- **Voraussetzung** — ob ein Punkt technisch von einem anderen abhängt (Nr. 1 und Nr. 6 gehören zusammen: der Doppel-Versand-Schutz braucht die Aufteilung aus Nr. 6 als Grundlage).

Ampel-Definition: 🔴 Geplant = noch nicht gestartet. Sobald du eine Zeile mit Ja beantwortest, wird daraus ein eigener Execution-Plan nach dem üblichen Schema (Planung → Selbstprüfung → Execution → Prüfung → Doku).

## 2 — Ausgangslage: was heute schon läuft

- `src/trigger/daily-activity-digest.ts` — ein Trigger.dev-Task, läuft jeden Tag um 08:00 Uhr (Berlin-Zeit).
- Er liest die Wetten vom Vortag aus zwei Tabellen (`wallet_transactions`, `game_rounds`) und rechnet 4 Zahlen aus: aktive Spieler, Anzahl Wetten, Gesamtgewinn des Casinos (GGR), das meistgespielte Spiel.
- Das Ergebnis geht als eine Telegram-Nachricht an dich.
- Bereits genutzte Trigger.dev-Bausteine: geplanter Ablauf (Cron), automatische Wiederholung bei Fehlern (Retry), Logging.
- Noch **nicht** genutzte Bausteine: Doppel-Versand-Schutz, Aufgaben, die sich gegenseitig aufrufen, Mensch-muss-bestätigen-Pausen, Live-Ansicht im Browser, Massenversand an viele Empfänger gleichzeitig, Bremse gegen zu schnellen Versand.
- Dokumentierte offene Lücke aus dem Original-Plan (`docs/archive/01_Trigger.dev.md`, Abschnitt 8): Wenn der Report zweimal unabhängig für denselben Tag angestoßen wird (z. B. zwei manuelle Tests), gibt es aktuell **keinen** Schutz gegen eine doppelte Telegram-Nachricht.

## 3 — Alle 15 gefundenen Möglichkeiten (Kurzüberblick)

| Nr  | Art     | Name                                                                                                                            | In Top 6?                                                                  |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Zahl    | Mehr Kennzahlen im Tagesreport (Spiel-Aufschlüsselung, Neuanmeldungen, größter Einzelgewinn, VIP-Verteilung, Promo-Einlösungen) | ❌ von Jan gestrichen (2026-08-21)                                         |
| 2   | Zahl    | Wochen-/Monats-Report mit Trendvergleich zur Vorperiode                                                                         | ❌ von Jan gestrichen (2026-08-21)                                         |
| 3   | Zahl    | Ausgeschriebene KI-Kurzeinschätzung im Report ("was ist gestern besonders aufgefallen")                                         | ❌ zu teuer/riskant für den Lerneffekt-Fokus, eigenes Thema (LLM-Kosten)   |
| 4   | Zahl    | Eigene Mini-Reports pro Spiel statt nur "Top-Spiel"                                                                             | ❌ war Teil des gestrichenen Nr. 1                                         |
| 5   | Zahl    | Mini-Fehlerquote im Report (wie viele Bets abgelehnt wurden)                                                                    | ❌ überschneidet sich mit Sentry, das schon existiert                      |
| 6   | Konzept | Doppel-Versand-Schutz mit Tages-Schlüssel                                                                                       | ✅ Nr. 1                                                                   |
| 7   | Konzept | Jackpot-Alarm aus dem Bet-Pfad in einen eigenen Hintergrund-Task auslagern                                                      | ✅ Nr. 2                                                                   |
| 8   | Konzept | Live-Vorschau im Admin-Bereich während der Report läuft                                                                         | ✅ Nr. 3                                                                   |
| 9   | Konzept | Persönliche Wochen-Rückblicke für einzelne Spieler per Telegram                                                                 | ✅ Nr. 4                                                                   |
| 10  | Konzept | Freigabe-Workflow für auffällige Fraud-Signale (Mensch bestätigt)                                                               | ✅ Nr. 5                                                                   |
| 11  | Konzept | Aufteilung in zwei verkettete Mini-Aufgaben (rechnen → verschicken)                                                             | ✅ Nr. 6                                                                   |
| 12  | Konzept | Report-Uhrzeit im Admin-Bereich einstellbar statt fest im Code                                                                  | ❌ mehr UI-Aufwand als Trigger.dev-Lerneffekt                              |
| 13  | Konzept | Report zusätzlich per Telegram-Befehl `/report` manuell auslösbar                                                               | ❌ nett, aber kein neuer Trigger.dev-Baustein ggü. Nr. 2/6                 |
| 14  | Konzept | Formales "Postfach"-Muster: Ereignis wird erst gespeichert, ein Task holt es zuverlässig ab                                     | ❌ deutlich mehr Aufwand (neue Tabelle) für ähnlichen Lerneffekt wie Nr. 2 |
| 15  | Konzept | Eigene Test-Version des Reports mit eigenem Telegram-Chat für Testläufe                                                         | ❌ sinnvoll, aber Organisationsthema, kein neuer Trigger.dev-Baustein      |

Alle mit ❌ markierten Punkte sind nicht schlecht — sie liefern entweder keinen neuen Lerneffekt gegenüber den Top 6, ihr Aufwand steht in keinem guten Verhältnis zum Erkenntnisgewinn, oder Jan hat sie bewusst gestrichen (Nr. 1/2). Sag Bescheid, falls du trotzdem einen davon näher besprechen willst.

## 4 — Top 6 im Detail (deine Entscheidungsgrundlage)

### 1 — Doppel-Versand-Schutz (Idempotenz)

- **Was es bedeutet:** Trigger.dev kann sich merken: "Für den Tag 2026-08-21 wurde das schon erledigt" — ein zweiter, unabhängig gestarteter Versuch für denselben Tag wird dann automatisch ignoriert, statt eine zweite Telegram-Nachricht zu verschicken.
- **Konkretes Beispiel im Projekt:** Schließt die im Original-Plan selbst dokumentierte Lücke (`docs/archive/01_Trigger.dev.md`, Abschnitt 8: "keine Deduplizierung gegen zwei unabhängig ausgelöste Läufe am selben Tag"). Technisch braucht das einen Zwischenschritt: Der Tages-Task ruft für den Versand einen zweiten, kleinen Task auf und gibt ihm einen Schlüssel mit, der aus dem Datum gebaut wird (z. B. `digest-2026-08-21`) — das hängt direkt mit Punkt 6 unten zusammen (die Aufteilung in zwei Aufgaben ist die Voraussetzung dafür).
- **Was du dabei lernst:** Das Konzept "einmalig ausführen, egal wie oft es versehentlich angestoßen wird" — in echten Firmen-Systemen einer der häufigsten Gründe für Bugs (doppelte E-Mails, doppelte Abbuchungen).
- **Nutzen fürs Spiel:** Schließt eine bekannte, dokumentierte Lücke — kein neuer Nutzen, aber echte Härtung.
- **Aufwand/Risiko:** Niedrig / Niedrig — reine Zusatz-Absicherung, ändert das Verhalten im Normalfall nicht.

### 2 — Jackpot-Alarm aus dem Geld-Pfad auslagern

- **Was es bedeutet:** Aktuell verschickt der Server die "Großer Gewinn!"-Telegram-Nachricht _innerhalb_ derselben Anfrage, die auch die Auszahlung verbucht — mit einer eingebauten Notbremse, die den Telegram-Versand nach spätestens 1,2 Sekunden abbricht, damit der Spieler nicht unnötig warten muss. Wir verschieben den Versand komplett aus diesem Zeitdruck heraus in einen unabhängigen Hintergrund-Task.
- **Konkretes Beispiel im Projekt:** `notifyBigWinIfEligible()` in `src/lib/casino/telegram-notifier.ts` (Zeile 56) wird aktuell direkt aus `src/app/api/casino/bet/route.ts` und `blackjack/route.ts` aufgerufen — mit einem `Promise.race`-Timeout-Trick (Zeile 62-75), der dafür sorgt, dass ein langsamer Telegram-Server die Auszahlungs-Antwort nicht verzögert. Mit Trigger.dev entfällt dieser Trick: die Route ruft nur noch `tasks.trigger("big-win-notify", {...})` auf und ist sofort fertig — der eigentliche Telegram-Versand (inklusive Wiederholungsversuche bei Fehlern) läuft komplett getrennt vom Auszahlungs-Code.
- **Was du dabei lernst:** Wie man Nebeneffekte (Benachrichtigungen, die nicht sofort passieren müssen) vom eigentlichen kritischen Ablauf (Geld-Auszahlung) trennt — genau das Muster, das im Zukunftsplan bereits als "Outbox/Phase 4" vorgemerkt ist.
- **Nutzen fürs Spiel:** Der Bet-Response-Pfad wird einfacher und ist nicht mehr auf einen Timeout-Trick angewiesen; bei Telegram-Ausfällen gibt es jetzt echte automatische Wiederholungsversuche statt "einmal versuchen, sonst verloren".
- **Aufwand/Risiko:** Mittel / Mittel — fasst bestehenden, produktiven Money-Pfad-Code an (auch wenn nur der Aufruf ausgelagert wird) → braucht laut Projektregel einen Security-Reviewer-Durchlauf, bevor es live geht.

### 3 — Live-Vorschau im Admin-Bereich (Realtime)

- **Was es bedeutet:** Während der Report rechnet (dauert ein paar Sekunden), könntest du in einer Admin-Seite live mitverfolgen, was gerade passiert — statt nur das fertige Ergebnis in Telegram abzuwarten.
- **Konkretes Beispiel im Projekt:** Neue Seite z. B. `/admin/digest-preview`. Der Server erzeugt dort ein zeitlich begrenztes Zugriffs-Token für genau diesen einen Lauf, die Seite abonniert den laufenden Task und zeigt live an: "Lese Wetten... 42 gefunden... baue Nachricht... fertig." Nutzt den Fortschritts-Mechanismus von Trigger.dev, den der Task selbst mit kleinen Status-Updates füttert (z. B. `metadata.set('status', 'lese Wetten')`).
- **Was du dabei lernst:** Wie ein Hintergrund-Task im Browser live sichtbar gemacht wird, ohne dass die Seite ständig nachfragen muss ("Bist du fertig? Bist du fertig?") — Trigger.dev schiebt die Updates selbst zur Seite.
- **Nutzen fürs Spiel:** Rein für dich als Admin — kein Spieler sieht das.
- **Aufwand/Risiko:** Mittel / Niedrig — komplett neue, zusätzliche Admin-Seite, rührt nichts Bestehendes an.

### 4 — Persönliche Wochen-Rückblicke pro Spieler

- **Was es bedeutet:** Nicht nur du bekommst einen Report — jeder Spieler, der Telegram-Benachrichtigungen aktiviert hat, könnte einmal pro Woche eine kurze persönliche Nachricht bekommen: "Diese Woche: 45 Wetten, dein bestes Spiel war Dice, aktuell -12 $."
- **Konkretes Beispiel im Projekt:** Nutzt die bestehende `telegram_links`-Tabelle (Migration 025, schon produktiv für Big-Win-Alarme) — ein Task holt sich die Liste aller Opt-in-Nutzer und startet für jeden einen eigenen kleinen Versand-Task. Damit Telegram nicht wegen zu vieler gleichzeitiger Nachrichten blockt, bekommt der Versand eine feste Bremse (z. B. maximal 5 gleichzeitig statt alle auf einmal).
- **Was du dabei lernst:** Wie man eine Aufgabe für "einen" in "eine für jeden von potenziell tausenden" verwandelt (Massenverarbeitung) und dabei gleichzeitig eine Geschwindigkeitsbremse einbaut, damit man nicht bei einer externen API (hier Telegram) anerkt.
- **Nutzen fürs Spiel:** Echtes neues Spieler-Feature — mehr Bindung/Retention durch persönliche Rückmeldung, direkt an bestehende Opt-in-Nutzer.
- **Aufwand/Risiko:** Mittel-Hoch / Niedrig — mehr Code als die anderen Punkte, aber weiterhin nur lesend, kein Money-Pfad.

### 5 — Freigabe-Workflow für Fraud-Signale

- **Was es bedeutet:** `/admin/fraud` zeigt heute auffällige Muster nur an — du musst selbst reinschauen und entscheiden. Stattdessen könnte ein neues, besonders auffälliges Signal automatisch eine Telegram-Nachricht mit zwei Knöpfen an dich schicken ("Ignorieren" / "Genauer ansehen"). Der Hintergrund-Task pausiert dabei wirklich — ohne weiterzulaufen oder Kosten zu verursachen — bis du einen Knopf drückst.
- **Konkretes Beispiel im Projekt:** Baut auf `src/lib/casino/fraud-detection.ts` und der `risk_events`-Tabelle (Migration 029/030) auf. Der Task erzeugt eine Warte-Marke, schickt die Telegram-Nachricht mit den zwei Knöpfen, und der bestehende Telegram-Webhook (`src/app/api/telegram/webhook/route.ts`) meldet deinen Klick zurück — erst dann setzt der Task das Signal in `risk_events` auf "geprüft". Bleibt bewusst rein beobachtend, wie das Fraud-System heute schon ist (keine automatische Sperre, kein Money-Pfad).
- **Was du dabei lernst:** Das Konzept "Mensch muss zustimmen, bevor es weitergeht" (Human-in-the-loop) — eine der interessantesten Trigger.dev-Fähigkeiten: eine Aufgabe kann tagelang pausieren und auf eine echte Entscheidung von dir warten, ohne dass in der Zwischenzeit irgendetwas läuft oder kostet.
- **Nutzen fürs Spiel:** Schnellere Reaktion auf echte Fraud-Fälle, ohne dass du aktiv im Dashboard nachschauen musst.
- **Aufwand/Risiko:** Hoch / Niedrig-Mittel — mehrere neue Teile (Telegram-Knöpfe, Webhook-Erweiterung, Warte-Logik), aber weiterhin nur beobachtend, kein Auto-Enforcement.

### 6 — Aufteilung in zwei verkettete Mini-Aufgaben

- **Was es bedeutet:** Aktuell ist der ganze Report ein einziger großer Codeblock: Zahlen holen + Nachricht bauen + verschicken, alles in einer einzigen Funktion. Wir teilen das in zwei getrennte Aufgaben, die sich gegenseitig aufrufen: Aufgabe 1 "Zahlen berechnen", Aufgabe 2 "Nachricht bauen & verschicken". Aufgabe 1 ruft Aufgabe 2 auf und wartet auf deren Ergebnis.
- **Konkretes Beispiel im Projekt:** `dailyActivityDigest` in `src/trigger/daily-activity-digest.ts` würde nur noch die Kennzahlen berechnen (Zeilen 102-156) und dann einen neuen, kleinen Task z. B. `deliver-digest` mit `triggerAndWait()` aufrufen, der nur noch `buildMessage()` + `sendTelegramMessage()` übernimmt (Zeilen 68-92, 158-166).
- **Was du dabei lernst:** Wie man eine Aufgabe in kleinere Bausteine zerlegt, die sich gegenseitig aufrufen und Ergebnisse zurückgeben — die Grundlage, auf der Punkt 1 (Doppel-Versand-Schutz) und später z. B. ein zusätzlicher E-Mail-Versand aufbauen könnten, ohne die Rechenlogik anzufassen.
- **Nutzen fürs Spiel:** Keiner direkt — reine Code-Struktur-Verbesserung, macht spätere Erweiterungen leichter.
- **Aufwand/Risiko:** Niedrig-Mittel / Niedrig — reines Refactoring des bestehenden, schon verifizierten Tasks, keine neuen Datenquellen.

## 5 — Wie es weitergeht

Bitte einmal pro Zeile aus Abschnitt 1 Ja oder Nein zurückmelden (auch Teil-Ja möglich, z. B. "Nr. 4 ja, aber ohne die Versand-Bremse"). Für jedes Ja entsteht danach ein eigener kleiner Execution-Plan mit Anforderungen, Abhängigkeiten und Fehlerfällen — wie beim ursprünglichen `01_Trigger.dev.md`-Plan. Da Nr. 1 und Nr. 6 zusammengehören (siehe Voraussetzung-Spalte), macht ein gemeinsames Ja für beide den meisten Sinn, falls du Nr. 1 willst.
