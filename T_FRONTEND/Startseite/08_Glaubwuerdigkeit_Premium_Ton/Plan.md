# 08 — Startseite: Glaubwürdigkeit & Premium-Ton

> **Status:** Geplant · **Stand:** 9. September 2026 · **Owner:** LLM · **Execution:** Nicht gestartet
>
> **Scope:** Alle auf der Startseite sichtbaren Vertrauenssignale, Live-/Demo-Indikatoren, Jackpot-, Gewinn- und Bonusdarstellungen. Premium bedeutet hier: weniger, präziser und nach Herkunft unterscheidbar — nicht lauter oder versprechender.
>
> **Nicht Scope:** Keine rechtliche Prüfung, keine neue Lizenz-/Fairness-/Auszahlungsbehauptung, keine Server- oder Datenquellenänderung und keine Echtgeld-/Bonuslogik. Plan 09 behandelt die iconfreie Form, Plan 07 die CTA-Priorität und Plan 10 reine Lesbarkeit.

[Zur Scorecard](../../Startseite.md#scorecard) · [Vorher Hero Desktop](../Beweise/2026-09-08/01_status-quo_desktop_hero-crop.png) · [Vorher Hero Mobile](../Beweise/2026-09-08/01_status-quo_mobile_hero-crop.png) · [Plan 09: Symbolsprache](../09_Symbolsprache_Anti_Template/Plan.md)

## 1. Entscheidung auf einen Blick

**Empfehlung: Option A — Evidence-first Luxury.** Jedes sichtbare Vertrauenssignal wird als eine von drei Klassen gestaltet: serverautoritativ, kuratiert/statisch oder Simulation/Demo. Fehlt eine belegbare Quelle im bestehenden Frontend-Vertrag, wird der Wert neutral ausgelassen oder als Demo gekennzeichnet — niemals ausgeschmückt. Dadurch kann der Premium-Ton von **62 auf 92/100** steigen, ohne Vertrauen mit Blinksignalen oder unbelegten Superlativen zu imitieren.

| Option | Ansatz | UX 45% | Premium 30% | Risiko 15% | Umsetzbarkeit 10% | Gesamt | Urteil |
|---|---|---:|---:|---:|---:|---:|---|
| **A** | Herkunftsklassen, zurückhaltende Proofs, klare Demo-Trennung | 42 | 28 | 13 | 9 | **92** | **Empfohlen** |
| B | Mehr Badges, Sterne und Live-Pulse | 27 | 20 | 7 | 9 | 63 | Erhöht Lautstärke statt Glaubwürdigkeit |
| C | Alle Trust-Signale entfernen | 31 | 18 | 14 | 10 | 73 | Verliert hilfreiche Orientierung |

## 2. Scorezerlegung — genau 10 Hebel

| ID | Unterkategorie | Status quo | Ziel | Konkreter Engpass / Planungsergebnis |
|---|---|---:|---:|---|
| TP-01 | Claim-Provenance | 58 | 94 | Jeder Claim führt eine sichtbare/semantische Herkunftsklasse statt pauschaler Gewissheit. |
| TP-02 | Bonus-Transparenz | 63 | 92 | Betrag, Bonuscode und Rakeback werden nicht als bedingungsloser Erfolg dargestellt. |
| TP-03 | Fairness-/RTP-Signal | 62 | 93 | „Provably Fair“ ist als prüfbarer Pfad oder zurückhaltender, quellenklarer Hinweis gestaltet. |
| TP-04 | Auszahlungsversprechen | 57 | 92 | „Instant“ und „automatisch“ erscheinen nur mit vorhandener Basis; sonst neutraler Status. |
| TP-05 | Jackpot-Autorität | 72 | 94 | Der serverautoritativ geladene Jackpot zeigt Laden/letzten Wert/Unbekannt ehrlich statt Placeholder. |
| TP-06 | Live vs. Simulation | 50 | 94 | Zufällig erzeugte Stream-/Showcasewerte werden sichtbar als Simulation/Demo getrennt. |
| TP-07 | Social Proof & Rating | 54 | 91 | Rating/Sternreihe erhält Quelle, Kontext oder entfällt; keine isolierte Zahl als Trust-Abkürzung. |
| TP-08 | Gewinn-/Highroller-Darstellung | 60 | 92 | Gewinnmeldungen benennen Quelle/Status und vermeiden irreführende Verifikation. |
| TP-09 | Ruhige Premium-Hierarchie | 68 | 92 | Ein zentraler Beweis statt Badge-Kette; Raum, Typografie und Datenklarheit ersetzen Effekte. |
| TP-10 | Frische, Ausfall & Audit | 76 | 94 | Stale/Fehler/Leerzustand sind sichtbar und künftig automatisiert überprüfbar. |

## 3. Evidenzmodell für die spätere UI-Ausführung

| Klasse | Aktuell belegbarer Startseitenfall | Geplante Darstellung | Was nie passieren darf |
|---|---|---|---|
| **Serverautoritativ** | `useProgressiveJackpot` lädt `/api/casino/jackpot`, startet bei `—` und behält den letzten gültigen Wert. | Wert, Lade-/Unbekannt-Status und gegebenenfalls Aktualitätskontext textklar anzeigen. | Aus einem fehlenden Wert eine fiktive Summe machen. |
| **Kuratiert/statisch** | Bonus-/Fairness-/Payout- und Ratingtexte im Hero; vorhandene Produkttexte ohne im Component-Code sichtbare Quellenbindung. | Nur mit bestehendem, verlinkbarem Ziel/Vertrag zeigen; sonst neutralisieren oder weglassen. | „Verifiziert“, „100%“, „instant“ oder Rating als unbelegte Qualitätsgarantie inszenieren. |
| **Simulation/Demo** | `VipLiveStreamRail` erzeugt Ereignisse mit `Math.random`; Showcase zeigt simulierte Spielwerte. | Sichtbar „Demo“/„Simulation“ oder für den Live-Anspruch aus dem Trust-Pfad entfernen. | Zufallswerte als echtes Live-Geschehen oder echte Auszahlung ausgeben. |
| **Nutzerzustand** | Live Activity zeigt Store-Daten und leeren Zustand. | Leere/Fehler/Stale klar beschreiben, ohne künstliche Social-Proof-Füllung. | Leere Daten durch erfundene Gewinner füllen. |

Die Entscheidung ist absichtlich konservativ: Premium wächst aus nachprüfbarer Ruhe. Für jede faktische Aussage gilt: **Keine bestehende, sichtbare Quelle oder Vertragsbasis → nicht behaupten.** Das ist eine Frontend-Präsentationsregel, keine rechtliche oder Backend-Arbeit.

## 4. LLM-Ausführungsplan — L0 bis L5

| Level | LLM-Aufgabe & Ergebnis | Jan-Gate | Abbruch / Rollback |
|---|---|---|---|
| L0 — Claim-Audit | Alle sichtbaren Trust-, Live-, Bonus-, Jackpot- und Gewinntexte mit Ort, Datenklasse, Quelle im Client und Fallback inventarisieren. | Jan bestätigt nur die ruhige Premium-Richtung. | Fehlt die Quelle: Claim als „ungeklärt“ markieren; weder neu texten noch verstärken. |
| L1 — Evidence Contract | Für jede Klasse die zulässige Anzeige, das Textlabel, den Leer-/Fehlerzustand und die maximale visuelle Gewichtung definieren. | Kein Legal-/Backend-Gate; keine Behauptung hinzufügen. | Wenn der Contract eine Produktzusage braucht: Anzeige neutralisieren und bei L0 bleiben. |
| L2 — Hero & Jackpot | Hero-Trustreihe, Bonus-Stufe und Jackpot nach einer zentralen Beweislinie statt Badge-Stack planen; iconfrei mit Plan 09. | Jan wählt nur die Material-/Rhythmusvariante. | Falls mehrere Claims wieder um die CTA konkurrieren: zu L1, Beweise reduzieren. |
| L3 — Live/Simulation | Showcase, VIP-Stream, Highroller-Modal und Activity Feed nach echter Quelle, Demo und Leerzustand ordnen. | Kein Gate. | Zufalls-/Demo-Daten als Live zu markieren ist ein harter Stopp; zurück zu L0. |
| L4 — Zustands- und Screenshotpaket | Autoritativer Wert, unbekannt, laden, Fehler, leer und Demo als konkrete Screenszenen/Testfälle festlegen. | Kein Gate. | Bei irreführendem Fallback, Wert-Sprung oder verstecktem Fehler: zu L1/L3. |
| L5 — Execution-Ready | Komponentenreihenfolge, Textfreigabegrenzen, Nachher-Beweise und Assertions dokumentieren. | Finales visuelles Ja/Nein, keine faktische Freigabe. | Ohne L4 und belegte Herkunft bleibt der Plan **Geplant**. |

## 5. Komponentenlandkarte für eine spätere Execution

| Gebiet | Wahrscheinliche Dateien | Geplante Verantwortung | Beweis nachher |
|---|---|---|---|
| Hero/Bonus | `src/components/home/hero-cinematic/HeroHeadlineColumn.tsx` | Quellenklare Trusttexte, zurückhaltende Bonusbeschreibung, kein Badge-Stapel. | Hero Desktop/Mobile mit langem/fehlendem Wert. |
| Showcase | `src/components/home/hero-cinematic/GameShowcaseCard.tsx` | Demo-/Live-Klassifikation von Multiplier, Onlinezahl und Spielzustand. | Aktiver Tab, Demo, unbekannter Status. |
| Jackpot | `src/components/home/ProgressiveJackpotSection.tsx`, `src/hooks/useProgressiveJackpot.ts` | Autoritativer Wert, `—`, Fehler/letzter Wert und Erklärung. | Laden, Erfolg, Fehler, Stale. |
| Feed/Highroller | `src/components/home/VipLiveStreamRail.tsx`, `src/components/social/LiveActivityFeedV2.tsx`, `src/components/home/HighrollerWinDetailModal.tsx` | Simulation, kuratierte Meldung und echte Store-Daten sichtbar unterscheiden. | Demo, leer, Detail-Overlay. |

## 6. Fünf spätere Execution-Checks

1. **Provenance-Sweep:** Jede sichtbare Faktenaussage auf `/` hat eine der vier Klassen; ungeklärte Aussagen sind neutralisiert oder entfernt.
2. **Demo-Check:** Durch `Math.random` erzeugte Stream-/Showcasewerte können nicht als echte Live- oder Auszahlungssignale gelesen werden.
3. **Jackpot-Check:** Start bei `—`, erfolgreicher Serverwert, Ausfall und letzter bekannter Wert sind ruhig und ohne erfundene Zahl nachvollziehbar.
4. **Claim-Check:** Bonus, Fairness, Rating und Auszahlung übertreiben nicht; sichtbarer Text stimmt mit vorhandenem Ziel/Vertrag überein.
5. **Beweistest:** Nachher-Screenshots für Hero, Jackpot und mindestens einen Demo-/Leerzustand stehen neben den unveränderlichen Vorher-Bildern; erst dann Score „92“ bestätigen.

## 7. Selbstprüfung vor Übergabe

- Genau 10 Unterkategorien, alle Zielwerte >= 91.
- Keine neue faktische Zusage, keine Backend-Arbeit und keine Rechtsberatung sind geplant.
- Der reale Jackpot ist ausdrücklich von simulierten Stream-/Showcasewerten getrennt.
- L0–L5 sind vollständig mit Stopp-/Rollback-Kriterien; Jan ist ausschließlich visueller Gatekeeper.
