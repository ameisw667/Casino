# 02 — Frontend-Redesign & UI-Elevation: Next Level

> Stand: **2026-08-21** · **Status: 🟢 Phase 1 & Lobby & History (18 Meilensteine abgeschlossen) / 🟡 6 Offene Potenziale in Phase 2**  
> Projekt: **Casino / Next.js 16.3 / App Router / React 19**  
> Bezug: [`00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md) (Kategorie 11 — Frontend UI/UX) und [`05_ZUKUNFTSPLANUNG.md`](../worldmap/05_ZUKUNFTSPLANUNG.md)

---

## 1. Übersicht für Jan: Abgeschlossene Meilensteine

| Nummer | Meilenstein / Arbeitspaket | Status | Verifikations-Befund | Zuständigkeit |
| :--- | :--- | :---: | :--- | :---: |
| 1 | **Status-Quo-Audit** aller 10 Hauptseiten & Layout-Komponenten | 🟢 Executed | 10/10 Seiten auditiert, Sidebar-Kantenbruch identifiziert & behoben. | LLM |
| 2 | **Sidebar Frosted Glass (`.glass-sidebar`)** | 🟢 Executed | `rgba(11, 14, 20, 0.65)` + `backdrop-filter: blur(16px)` + 1px `hsla(45, 100%, 50%, 0.12)` Gold-Border. | LLM |
| 3 | **Layout-weites Ambient-Backdrop** | 🟢 Executed | `LobbyAmbientBackground` fixiert auf Full-Viewport (`100vw x 100vh`); Wellen laufen nahtlos hinter der Sidebar durch. | LLM |
| 4 | **Game-Cards 3D-Tilt & Dynamic Sheen** | 🟢 Executed | `ArcadeGameCard` mit 6° Rotation, Spring-Physics und Glare-Overlay (`radial-gradient`) bei Cursor-Bewegung. | LLM |
| 5 | **Horizon Header Glassmorphism** | 🟢 Executed | `.glass-header` mit 16px Blur und weichem Gradienten-Fade zur Vermeidung harter Kanten. | LLM |
| 6 | **Live Highroller Ticker Bar** | 🟢 Executed | Live-Auszahlungsband mit dynamischem Icon-Highlighting und 3.8s Rotation. | LLM |
| 7 | **Mobile Drawer & Touch-Optimierung (OP-5)** | 🟢 Executed | Elastischer Spring-Drawer, Adaptive Blur (12px), Body Scroll-Lock & Touch Scale `0.96`. | LLM |
| 8 | **Leaderboard & Stats Elevation (OP-4)** | 🟢 Executed | Metallic Podium Gradients, 16px Blur Recharts Tooltips, vertikale Area/Bar Gradients. | LLM |
| 9 | **VIP Vault & Progression Elevation (OP-2)** | 🟢 Executed | Neumorphic Metallic Tier-Cards, Spring-Physics Fortschrittsbalken, Frosted Glass Panels. | LLM |
| 10 | **Game-Catalog Elevation (OP-1)** | 🟢 Executed | 3,5° Tilt, 12px Gold-Glow, transluzente Glas-Pille & Filtertabs (Option-1-Feinschliff). | LLM |
| 11 | **Tischspiel-Visuals Elevation (OP-3)** | 🟢 Executed | Obsidian-Filz-Texturen, 3D-Depth-Kartenschatten, Spring-Chip-Platzierung in Blackjack & Roulette. | LLM |
| 12 | **VIP-Wettquittung (NP-4)** | 🟢 Executed | `BetReceiptModal.tsx` mit 1-Klick-Kopieren für Transaktions-ID & Fairness-Codes. | LLM |
| 13 | **Multi-Filter & Live-Summen (NP-5)** | 🟢 Executed | `HistoryFilterBar.tsx` mit Spiel- & Zeitfiltern; Live-Neuberechnung aller 4 Kennzahlen. | LLM |
| 14 | **Multiplikator-Leuchtbänder (NP-6)** | 🟢 Executed | `HistoryTableStream.tsx` mit gestuften Badges (Gold-Blitz, Smaragd, Rubinrot). | LLM |
| 15 | **Progressive Jackpot Live-Zähler (NP-1)** | 🟢 Executed | `ProgressiveJackpotSection.tsx` mit rollendem Digital-Slot-Ticker & Liquid Gold Drop-Shadow. | LLM |
| 16 | **Highroller-Gewinn-Detailfenster (NP-2)** | 🟢 Executed | `HighrollerWinDetailModal.tsx` mit Pop-In-Modal & direktem "Jetzt spielen"-Knopf. | LLM |
| 17 | **3D-Bühnen-Fokus "Featured Game" (NP-3)** | 🟢 Executed | `InteractiveArcadeGrid.tsx` mit Gold-Spotlight Aura & "MEISTGESPIELT HEUTE"-Badge. | LLM |
| 18 | **QA & Build Gate** | 🟢 Executed | `next build` 36/36 Routen grün, 683/683 Vitest grün, 0 TS-Fehler. | LLM |

---

## 2. Übersicht: Next-Level Potenziale (Phase 2 Roadmap)

| ID | Bereich / Seite | Potenzial-Beschreibung | Status | Nächster Schritt |
| :--- | :--- | :--- | :---: | :--- |
| **NP-1** | **Lobby (Startseite)** | Progressive Jackpot Live-Zähler mit sanftem Ziffern-Sprung & Goldstaub-Puls | 🟢 Executed | Vollständig umgesetzt & verifiziert |
| **NP-2** | **Lobby (Startseite)** | Interaktives Highroller-Gewinn-Detailfenster bei Klick/Hover auf das Auszahlungsband | 🟢 Executed | Vollständig umgesetzt & verifiziert |
| **NP-3** | **Lobby (Startseite)** | 3D-Bühnen-Fokus für das meistgespielte Spiel ("Featured Game of the Day") | 🟢 Executed | Vollständig umgesetzt & verifiziert |
| **NP-4** | **My Bets / History** | Interaktive VIP-Wettquittung (Kassenzettel-Modal mit Fairness-Nachweis) | 🟢 Executed | Vollständig umgesetzt & verifiziert |
| **NP-5** | **My Bets / History** | Spiel- & Zeitraum-Filterleiste mit Live-Kopfzeilen-Statistik | 🟢 Executed | Vollständig umgesetzt & verifiziert |
| **NP-6** | **My Bets / History** | Multiplikator-Glanzbänder (Gold bei > 5x, Smaragd bei Gewinn, Rubin bei Verlust) | 🟢 Executed | Vollständig umgesetzt & verifiziert |
| **NP-7** | **Leaderboard** | 3D-Trophäen-Treppchen für die Top 3 Spieler mit schwebenden Kronen | 🔴 Geplant | Freigabe durch Jan |
| **NP-8** | **Leaderboard** | "Mein Rang"-Fixleiste am unteren Bildschirmrand mit Abstand zum nächsten Platz | 🔴 Geplant | Freigabe durch Jan |
| **NP-9** | **Leaderboard** | Wöchentlicher Countdown-Timer mit animiertem Preispool-Gegenwert | 🔴 Geplant | Freigabe durch Jan |
| **NP-10** | **VIP Vault** | Interaktiver VIP-Rangaufstiegs-Tresor mit klickbaren Privilegien-Medaillen | 🔴 Geplant | Freigabe durch Jan |
| **NP-11** | **Stats (Statistiken)** | Interaktiver Zeitfilter (24h, 7 Tage, 30 Tage, Gesamt) mit flüssigem Kurven-Übergang | 🔴 Geplant | Freigabe durch Jan |
| **NP-12** | **Stats (Statistiken)** | Visuelle Erfolgs-Kreiskarte (Favoriten-Verteilung & Reingewinn nach Spiel) | 🔴 Geplant | Freigabe durch Jan |

---

## 3. Entscheidungsmatrix: Detaillierte Optionen für verbleibende offene Potenziale

---

### 3.1. Leaderboard / Bestenliste (3 offene Potenziale)

#### NP-7: 3D-Trophäen-Treppchen für die Top 3
> **Ziel:** Die ersten drei Plätze sollen wie bei einer echten Siegerehrung erstrahlen.

| Option | Konzept | Vorteile | Nachteile | Begründung der Empfehlung |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Empfohlen)** | **Gestuftes Glas-Siegertreppchen mit schwebenden Kronen**<br>Platz 1 steht mittig erhöht auf einem goldenen Podest mit Goldkrone, Platz 2 links (Silber), Platz 3 rechts (Bronze) mit Avatar und Live-Gewinnsumme. | • Sehr prestigeträchtig und motivierend.<br>• Echte Siegerehrungs-Atmosphäre. | Keine. | **Empfohlen**, weil es den Ehrgeiz weckt, unter die besten drei Spieler zu kommen. |
| **Option 2** | **Klassische Tabelle mit größeren Zeilen für Top 3**<br>Nur Zeile 1 bis 3 sind doppelt so hoch wie der Rest der Liste. | • Sehr einfach aufgebaut. | • Wirkt flach und nutzt den Platz im oberen Bereich nicht optimal aus. | Nicht empfohlen, da ein Podest emotionaler wirkt. |
| **Option 3** | **Animiertes 3D-Trophäenmodell**<br>Ein gerenderter 3D-Goldpokal, der sich langsam um die eigene Achse dreht. | • Hoher Schauwert. | • Lädt zusätzliche 3D-Daten und verbraucht mehr Akkuleistung. | Nicht empfohlen wegen unnötiger Akku-Belastung auf Smartphones. |

---

#### NP-8: "Mein Rang" Schwebende Leiste
> **Ziel:** Wenn der Spieler nicht in den Top 10 ist, soll er seinen eigenen Rang sofort sehen, ohne weit scrollen zu müssen.

| Option | Konzept | Vorteile | Nachteile | Begründung der Empfehlung |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Empfohlen)** | **Schwebende Glas-Leiste am unteren Bildschirmrand**<br>Unten fixierte Leiste: Zeigt "Dein Platz: #42", den eigenen Gewinn und "Noch $150 bis Platz 41" mit einem "Aufholen"-Knopf. | • Man weiß immer sofort, wo man steht.<br>• Motiviert zum Weiterspielen um den nächsten Platz. | Keine. | **Empfohlen**, weil der Spieler jederzeit seinen persönlichen Fortschritt im Blick behält. |
| **Option 2** | **Fester Bereich ganz oben über der Tabelle**<br>Eine Kachel im Kopfbereich mit den eigenen Rangdaten. | • Sofort beim Laden sichtbar. | • Verschwindet beim Herunterscrollen aus dem Blickfeld. | Nicht empfohlen, da sie beim Scrollen verloren geht. |
| **Option 3** | **Popup-Fenster bei Rangänderung**<br>Ein kleines Hinweisfenster springt auf, wenn man einen Platz aufsteigt. | • Informiert bei Veränderungen. | • Kann störend wirken, wenn viele Plätze schnell wechseln. | Nicht empfohlen wegen möglicher Ablenkung. |

---

#### NP-9: Wöchentlicher Countdown-Timer mit Preispool
> **Ziel:** Spieler sollen sofort sehen, wann das wöchentliche Ranglisten-Turnier endet und was es zu gewinnen gibt.

| Option | Konzept | Vorteile | Nachteile | Begründung der Empfehlung |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Empfohlen)** | **Digitale Countdown-Uhr mit animiertem Gold-Tresor**<br>Eleganter Zeitzähler ("Endet in: 2T 14Std 08Min") neben einem funkelnden Preispool-Symbol ($10.000 Gesamtpreis). | • Erzeugt gesunde Spannung vor dem Wochenende.<br>• Klares Ziel vor Augen. | Keine. | **Empfohlen**, weil es Transparenz über den Ablaufzeitpunkt schafft und die Motivation steigert. |
| **Option 2** | **Fortschrittsbalken über die Woche**<br>Ein Ladebalken von Montag bis Sonntag. | • Visuell einfach zu erfassen. | • Zeigt keine exakten Stunden und Minuten an. | Nicht empfohlen, da die genaue Restzeit fehlt. |
| **Option 3** | **Reiner Datums-Text**<br>Schlichter Text "Turnierende: Sonntag, 23:59 Uhr". | • Sehr unaufdringlich. | • Vermittelt kein Gefühl von Dringlichkeit oder Live-Spannung. | Nicht empfohlen wegen fehlendem Live-Gefühl. |

---

### 3.2. VIP Vault / Tresor (1 offenes Potenzial)

#### NP-10: Interaktiver VIP-Rangaufstiegs-Tresor
> **Ziel:** Der Bereich `/vault` soll sich wie ein exklusiver VIP-Club anfühlen, bei dem man seine Privilegien mit Stolz betrachtet.

| Option | Konzept | Vorteile | Nachteile | Begründung der Empfehlung |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Empfohlen)** | **Klickbare VIP-Medaillen mit Belohnungs-Vorschau & Goldstaub-Effekt**<br>Jeder Rang besitzt eine anklickbare Medaille: Ein Klick öffnet die exakten Vorteile (z. B. "3% Rakeback sofort", "Prioritäts-Support"). Beim Erreichen eines neuen Rangs tanzen feine Goldpartikel über die Karte. | • Höchster Belohnungs- und Wertigkeitsfaktor.<br>• Leicht und flüssig ohne schwere 3D-Dateien. | Keine. | **Empfohlen**, weil es den Spielern klare, greifbare Ziele gibt und den VIP-Aufstieg emotional zelebriert. |
| **Option 2** | **3D-Tresortür zum manuellen Aufdrehen**<br>Ein 3D-Tresorrad, das man mit der Maus drehen muss, um Privilegien freizulegen. | • Spielerischer Schauwert. | • Umständliche Bedienung auf Touchscreens. | Nicht empfohlen wegen umständlicher Bedienung. |
| **Option 3** | **Reine Tabellenliste mit Haken**<br>Eine schlichte Tabelle mit Rangnamen und Häkchen bei den freigeschalteten Punkten. | • Sehr sachlich und kompakt. | • Fühlt sich nicht nach VIP oder Casino-Belohnung an. | Nicht empfohlen, da der exklusive Charakter verloren geht. |

---

### 3.3. Stats / Statistiken (2 offene Potenziale)

#### NP-11: Interaktiver Zeitfilter für Profit- & Zeitdiagramme
> **Ziel:** Spieler möchten ihre Gewinne genau analysieren können (z. B. "Wie lief es heute im Vergleich zum ganzen Monat?").

| Option | Konzept | Vorteile | Nachteile | Begründung der Empfehlung |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Empfohlen)** | **Sanft gleitende Glas-Zeitfilter (24h · 7 Tage · 30 Tage · Gesamt)**<br>Filterknöpfe über den Diagrammen: Beim Umschalten passen sich die Kurven mit einer sanften, flüssigen Welle an den neuen Zeitraum an, ohne dass die Seite neu lädt. | • Extrem aufschlussreich für Vielspieler.<br>• Flüssiges Diagramm-Erlebnis ohne Ruckeln. | Keine. | **Empfohlen**, weil Spieler sofort sehen können, an welchen Tagen sie die besten Gewinne erzielt haben. |
| **Option 2** | **Freie Datumsauswahl mit zwei Kalendern**<br>Man klickt auf einen Start- und End-Kalendertag. | • Maximale Flexibilität für jedes beliebige Datum. | • Umständlich mit mehreren Klicks auf kleinen Bildschirmen. | Nicht empfohlen wegen zu vieler Klicks. |
| **Option 3** | **Fester 7-Tage-Rhythmus ohne Umschaltmöglichkeit**<br>Das Diagramm zeigt immer unveränderlich die letzten 7 Tage. | • Spart Programmieraufwand. | • Langzeit-Entwicklung über Wochen oder Monate ist unsichtbar. | Nicht empfohlen wegen fehlender Übersicht über Langzeitgewinne. |

---

#### NP-12: Visuelle Erfolgs-Kreiskarte (Favoriten & Gewinn-Verteilung)
> **Ziel:** Auf einen Blick sehen, welches Spiel das eigene "Glücksspiel" ist und wo das meiste Geld gewonnen wurde.

| Option | Konzept | Vorteile | Nachteile | Begründung der Empfehlung |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Empfohlen)** | **Eleganter zweifarbiger Kreisring mit zartem Schein & Prozent-Mitte**<br>Ein runder Donut-Ring im Obsidian-Gold-Design: Jeder Spielabschnitt (z. B. Blackjack 45 %, Roulette 30 %, Crash 25 %) leuchtet beim Drüberfahren auf und zeigt in der Mitte Reingewinn und Rundenzahl. | • Sofortige visuelle Klarheit in 1 Sekunde.<br>• Ersetzt lange Zahlenreihen durch ein klares Bild. | Keine. | **Empfohlen**, weil das Gehirn Kreisverteilungen sofort versteht und man direkt sieht, wo man am erfolgreichsten war. |
| **Option 2** | **Gestapelte Balkenanzeige (Fortschrittsleiste)**<br>Ein horizontaler Balken, der in farbige Abschnitte unterteilt ist. | • Platzsparend in der Höhe. | • Schwerer mit Prozentwerten zu beschriften. | Nicht empfohlen, da der Kreisring viel eleganter wirkt. |
| **Option 3** | **Reine Prozent-Tabelle ohne Grafik**<br>Eine schlichte Tabelle mit "Spielname" und "Anteil in %". | • Sehr technisch und nüchtern. | • Bietet keinen modernen Dashboard-Charakter. | Nicht empfohlen wegen mangelndem visuellen Mehrwert. |

---

## 4. Definition of Done für verbleibende Punkte

- [ ] Auswahl und Freigabe der bevorzugten Optionen durch Jan für die verbleibenden Punkte NP-7, NP-8, NP-9, NP-10, NP-11, NP-12.
- [ ] Modulweise Umsetzung im Workflow Jan-Execution.
- [ ] 0 TypeScript- und Lint-Fehler.
- [ ] Erfolgreicher Production Build (`npm run build`).
