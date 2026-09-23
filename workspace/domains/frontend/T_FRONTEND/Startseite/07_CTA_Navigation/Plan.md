# 07 — Startseite: CTA & Navigation

> **Status:** Geplant · **Stand:** 9. September 2026 · **Owner:** LLM · **Execution:** Nicht gestartet
>
> **Scope:** Der Handlungsweg vom ersten Hero-Blick bis zum Start eines Spiels sowie die sichtbare Desktop-/Mobile-Navigation der Startseite. Jede Handlung erhält Priorität, Ziel, Rückmeldung und einen textklaren Zustand.
>
> **Nicht Scope:** Keine Bonusbedingungen, Authentifizierung, Guthaben-, Chat- oder Routinglogik. Der iconfreie Ausdruck wird in Plan 09 definiert, Claim-Substanz in Plan 08, Layout-Hierarchie in Plan 03 und Typografie/Fokus in Plan 10.

[Zur Scorecard](../../Startseite.md#scorecard) · [Vorher Desktop](../Beweise/2026-09-08/00_status-quo_desktop_1440x1024.png) · [Vorher Mobile](../Beweise/2026-09-08/00_status-quo_mobile_390x844.png) · [Plan 09: Symbolsprache](../09_Symbolsprache_Anti_Template/Plan.md)

## 1. Entscheidung auf einen Blick

**Empfehlung: Option A — One decisive route, visible alternatives.** Über dem Fold erhält die Besucherin genau einen primären, textklaren Fortschrittsschritt. Spielhalle und Navigation bleiben sichtbar sekundär, aber konkurrieren nicht um dieselbe Blickzone. Nach einem Klick ist das Ergebnis unverzüglich und sprachlich verständlich. Zielwert: **72 auf 93/100**.

| Option | Ansatz                                                             | UX 45% | Premium 30% | Risiko 15% | Umsetzbarkeit 10% | Gesamt | Urteil                               |
| ------ | ------------------------------------------------------------------ | -----: | ----------: | ---------: | ----------------: | -----: | ------------------------------------ |
| **A**  | Eine priorisierte Hero-Aktion, sekundäre Wege, eindeutige Zustände |     43 |          28 |         13 |                 9 | **93** | **Empfohlen**                        |
| B      | Alle wichtigen Aktionen gleich stark                               |     29 |          22 |         11 |                10 |     72 | Erhält Blickkonkurrenz               |
| C      | Hero ohne sekundäre Wege                                           |     34 |          23 |         12 |                 8 |     77 | Zu wenig selbstbestimmte Exploration |

## 2. Scorezerlegung — genau 10 Hebel

| ID    | Unterkategorie             | Status quo | Ziel | Konkreter Engpass / Planungsergebnis                                                                  |
| ----- | -------------------------- | ---------: | ---: | ----------------------------------------------------------------------------------------------------- |
| CN-01 | Handlungshierarchie        |         70 |   94 | Pro Blickzone ist nur eine Aktion primär; weitere Ziele sind bewusst sekundär.                        |
| CN-02 | Hero-CTA                   |         76 |   94 | Bonusaktion benennt Ergebnis, Voraussetzung und unmittelbares Feedback verständlich.                  |
| CN-03 | Sekundärer Spielepfad      |         73 |   93 | „Zur Spielhalle“ bleibt als klarer, ruhiger Alternativweg erhalten.                                   |
| CN-04 | Game-Startpfad             |         74 |   94 | Showcase und Bento machen Startziel, Spielname und erwarteten Übergang eindeutig.                     |
| CN-05 | Desktop-Navigation         |         72 |   93 | Sidebar zeigt aktive Route, Reihenfolge und Utility getrennt von primären Zielen.                     |
| CN-06 | Mobile-Dock                |         71 |   93 | Fünf Ziele sind labelklar, safe-area-sicher und nicht vom Scroll-/Keyboardzustand verdeckt.           |
| CN-07 | Aktive/gesperrte Zustände  |         69 |   92 | `aria-current`, `aria-pressed`, Fokus und disabled zeigen denselben verständlichen Zustand.           |
| CN-08 | Rückmeldung nach Aktion    |         70 |   94 | Klick auf Bonus, Tab, Chat oder Game liefert ruhige, textliche Rückmeldung statt nur Effekt/Sound.    |
| CN-09 | Rückkehr & Orientierung    |         74 |   93 | Drawer, Modal und Seitenwechsel bringen die Person logisch zum Auslöser bzw. Ziel zurück.             |
| CN-10 | Unbekannter Sessionzustand |         71 |   90 | Gäste-/angemeldete Darstellung bleibt ehrlich und erfindet keine Freischaltung oder Kontoinformation. |

## 3. Geplantes Entscheidungsmodell

| Blickzone | Primärer Zweck                                                 | Sekundäre, erlaubte Wege                         | Nicht erlaubte Konkurrenz                                           |
| --------- | -------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| Hero      | Einen nachvollziehbaren Einstieg bieten.                       | Spielhalle, sichtbare Hauptnavigation.           | Mehrere gleich laute Gold-/Glow-CTAs und dekorative Pseudoaktionen. |
| Showcase  | Ein konkretes Casino Original entdecken/starten.               | Tabwechsel, Details zum aktuell gewählten Spiel. | Live-Badges oder Simulation als vermeintlicher Start-CTA.           |
| Bento     | Eigenständige Spielauswahl.                                    | Navigation zurück zur Lobby.                     | Card-Click und zusätzlicher Mini-CTA mit identischem Ziel.          |
| Shell     | Zwischen Lobby, Spielen, Chat, Leaderboard und Vault wechseln. | Konto-/Guide-Utility klar abgesetzt.             | Utility, die sich wie eine primäre Spielsitzung anfühlt.            |

**Text- und Zustandsvertrag:** Jede Aktion nennt Ziel oder Ergebnis sichtbar; die klickbare Fläche enthält denselben Namen wie ihr Accessible Name. Plan 09 liefert die iconfreie Form. Ein Sound, Hover oder Glow kann Rückmeldung ergänzen, nie ersetzen. Die Bonusaktion darf keine Kondition, Authentifizierung oder Erfolgsmeldung vortäuschen; bestehende Logik wird nur klar präsentiert.

## 4. LLM-Ausführungsplan — L0 bis L5

| Level                         | LLM-Aufgabe & Ergebnis                                                                                                                            | Jan-Gate                                        | Abbruch / Rollback                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| L0 — Pfadinventar             | Alle sichtbaren Links/Buttons inklusive Ziel, Auslöser, Sessionabhängigkeit und Rückmeldung auf `/` erfassen.                                     | Jan wählt nur die visuelle Priorität im Hero.   | Wenn Ziel oder Ergebnis nicht belegbar ist: keine neue CTA formulieren; beim Ist-Pfad bleiben.      |
| L1 — Prioritätsmatrix         | Hero, Showcase, Bento und Shell in primär/sekundär/Utility/Status klassifizieren; die Zahl gleichwertiger Primäraktionen pro Blickzone begrenzen. | Kein Backend-Gate.                              | Wenn zwei Aktionen dieselbe Absicht bedienen: eine zum Sekundärweg degradieren oder zusammenführen. |
| L2 — Text- und Zustandsmuster | Label, Hover, Fokus, Aktiv, Laden, Erfolg, Fehler und deaktiviert pro Aktion spezifizieren; symbolfreie Umsetzung mit Plan 09 abstimmen.          | Jan sieht nur zwei iconfreie Materialvarianten. | Falls Feedback allein animiert/farbig ist oder ein Label die Navigation bricht: zu L1.              |
| L3 — Breakpoints & Rückkehr   | Desktop-Sidebar, Mobile-Dock, inneren Scroll-Container, Drawer/Modal sowie virtuelle Tastatur als Pfade planen.                                   | Kein Gate.                                      | Wenn Dock/Fokus verdeckt oder Rückkehr unklar: L3 bis nachvollziehbar zurückbauen.                  |
| L4 — Interaktionsbeweise      | Klick-, Keyboard- und Touch-Walkthroughs für Gast und vorhandenen Sessionzustand definieren; keine erfundenen Testkonten.                         | Kein Gate.                                      | Bei Route-Fehler, doppeltem Trigger oder verlorener Aktivanzeige: zu L2/L3.                         |
| L5 — Execution-Ready          | Reihenfolge der Komponentenänderungen, Screenshot-Szenen und Assertions dokumentieren; Status bleibt bis zur Umsetzung **Geplant**.               | Finales visuelles Ja/Nein.                      | Ohne positiven L4-Path keine Ausführung und keine Score-Anhebung.                                   |

## 5. Komponentenlandkarte für eine spätere Execution

| Bereich       | Wahrscheinliche Dateien                                                                                     | Geplanter Fokus                                                  | Abhängigkeit |
| ------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------ |
| Hero          | `src/components/home/hero-cinematic/HeroHeadlineColumn.tsx`, `HeroCinematicShowcase.tsx`                    | Ein primärer Einstieg, ruhiger Spielepfad, ehrliche Rückmeldung. | 08, 09, 10.  |
| Spielkarten   | `src/components/home/hero-cinematic/GameShowcaseCard.tsx`, `src/components/home/bento/BentoArcadeCells.tsx` | Startziel und Tabwechsel als klare Textaktionen.                 | 09, 10.      |
| Desktop Shell | `src/components/layout/MainSidebar.tsx`, `src/components/layout/MainHeader.tsx`                             | IA, aktive Route und Utility-Trennung.                           | 09.          |
| Mobile Shell  | `src/components/layout/MobileNav.tsx`, `src/components/layout/MainLayout.tsx`                               | Dock, Safe Area, Chat-Toggle, Fokus und Rückkehr.                | 09, 10.      |

## 6. Fünf spätere Execution-Checks

1. **Drei-Sekunden-Test:** Auf Desktop und Mobile ist die primäre Hero-Aktion ohne Interpretationsarbeit erkennbar; der Spielepfad bleibt sekundär auffindbar.
2. **Klicktest:** Bonus, Game-Start, Game-Tab, Chat und jede Navigationsroute geben genau einmal die erwartete, textlich verständliche Rückmeldung.
3. **Keyboard-/Touchtest:** Jeder Pfad funktioniert mit Tab/Enter/Space und Touch; aktives Ziel ist sichtbar, Mobile-Dock nicht verdeckt.
4. **Sessiontest:** Gast- und bestehender Sessionzustand behaupten nichts, was nicht vom aktuellen Clientzustand gedeckt ist.
5. **Beweistest:** Für die priorisierte Hero-Szene und Mobile-Dock werden Nachher-Beweise neben den Vorher-Bildern verlinkt; erst dann Score „93“ bestätigen.

## 7. Selbstprüfung vor Übergabe

- Genau 10 Unterkategorien, Zielwerte alle >= 90.
- Ausschließlich Frontend-Planung; keine Route, Store-, Auth- oder Bonuslogik geändert.
- Plan 09 ist Voraussetzung für die sichtbare Ausformung, aber CTA-Priorität bleibt eigenständig entscheidbar.
- L0–L5 enthalten je einen eindeutigen Abbruch-/Rollback-Pfad; Jan ist nur visueller Gatekeeper.
