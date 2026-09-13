# T_FRONTEND — Zentrale Übersicht & Arbeitsordner Frontend

> **Status:** 🟢 Bereinigt & gepflegt (2026-09-02)  
> **Zweck:** Arbeits- und Konzeptionsraum für alle UI/UX-Verbesserungen, High-Impact-Hebel, Motion-Konzepte und das Spielerlebnis (P38).  
> **Kanonische Repo-Dokumentation:** [`docs/frontend/00_FRONTEND_OVERVIEW.md`](../docs/frontend/00_FRONTEND_OVERVIEW.md) · **SOPs:** [`xx_sop/10_workflow_frontend_revamp.md`](../xx_sop/10_workflow_frontend_revamp.md) · [`xx_sop/04_design_system_ui.md`](../xx_sop/04_design_system_ui.md) · [`xx_sop/16_motion_and_ui_polish.md`](../xx_sop/16_motion_and_ui_polish.md) · [`xx_sop/17_web_design_quality.md`](../xx_sop/17_web_design_quality.md)

---

## Reifegrad-Aufschlüsselung (Ebene 1) — 10 Subkategorien

> **Stand:** 2026-09-13 · **Owner:** Jan / LLM · **Auftrag:** Erstaufschlüsselung von Worldmap-Kategorie 13 „UI-Architektur & Design-System" analog zur Methodik in [`T_DATABASE/00_DATABASE_VERBESSERUNG.md`](../T_DATABASE/00_DATABASE_VERBESSERUNG.md) und [`T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md`](../T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md), hier zusätzlich eine Ebene tiefer (Sub-Subkategorien je Modul, siehe Ebene-2-Dateien unten).
> **Scope-Grenze:** Diese Runde erzeugt nur die beiden Übersichts-Ebenen. Keine Planungsdateien für Subkategorien/Sub-Subkategorien — die folgen erst nach Sichtung der Bottlenecks durch Jan.

### 0 — Widerspruch zwischen drei Kennzahlen — aufgelöst (2026-09-13)

Für dieselbe Kategorie 13 standen zuvor drei widersprüchliche Werte nebeneinander, analog zum Selbstwiderspruch, der bei Kategorie 15 (LLM, Fußnote ⁴ in `worldmap/00_WORLDMAP_STATUS.md`) ein Re-Rating ausgelöst hat:

| Kennzahl | Wert | Quelle | Methodik |
| :--- | :---: | :--- | :--- |
| **Worldmap-Headline (bis 2026-09-13)** | ~~Top 28 %~~ | `worldmap/00_WORLDMAP_STATUS.md` Zeile 26 | Oberflächenmetriken (ESLint-Warnings, Dateigrößen, Testzahl) — nie in Subkategorien zerlegt |
| **docs/frontend V4-Audit (2026-09-02)** | Top 8,4 % | [`docs/frontend/00_FRONTEND_OVERVIEW.md`](../docs/frontend/00_FRONTEND_OVERVIEW.md) | 10-Säulen-Matrix mit V1→V4-Evolution nach 10 dokumentierten Refactorings |
| **Diese Datei, bottom-up aus Ebene 2 — jetzt verbindliche Headline** | **Top 14,8 %** | Abschnitt 1/2 unten | Niveau je Modul = gewichteter Schnitt seiner Ebene-2-Sub-Subkategorien, nicht die V4-Holistic-Einschätzung; inkl. nachträglich ergänzter Admin-UI (siehe Abschnitt 1, Modul 10) |

**Einordnung:** Die V4-Zahl (Top 8,4 %) ist nicht erfunden — die zugrunde liegenden 10 Refactorings sind real und im Code nachvollziehbar (siehe `docs/frontend/01`–`10`). Sie war aber elf Tage alt und nie gegen den Worldmap-Headline-Wert reconciled. Eine frische Stichprobe (`npm run lint`, `npm test`, Dateigrößen-Scan) zeigt an mehreren Stellen **Drift in die falsche Richtung** seit dem 2026-09-02-Audit:

| Messwert | 2026-08-29 / V4-Audit (2026-09-02) | Heute (2026-09-13, frisch gemessen) |
| :--- | :---: | :---: |
| ESLint-Warnings | 26 | **34** |
| `.tsx`-Dateien > 600 Zeilen | 13 (Max: `AutoBetDrawerTestingClient.tsx`, 793) | **16** (Max jetzt: `HistoryTableStream.tsx`, **824**) |
| Tests grün | 217/217 | **1700/1700** (222 Testdateien — deutlich gewachsen, weiterhin 100 % grün) |

**Auflösung (von Jan im Chat freigegeben, 2026-09-13):** Der Worldmap-Headline-Wert wurde von Top 28 % auf **Top 14,8 %** aktualisiert (`worldmap/00_WORLDMAP_STATUS.md` Zeile 26, Fußnote ⁷) — der bottom-up aus Ebene 2 berechnete Wert dieser Datei ist damit die verbindliche Kennzahl für Kategorie 13 (inkl. der nachträglich ergänzten Admin-UI, siehe Abschnitt 1). Der docs/frontend-V4-Wert (Top 8,4 %) bleibt unverändert in seiner eigenen Datei stehen (er ist nicht falsch, nur optimistischer und älter), zählt aber nicht mehr als Referenz für die Worldmap-Headline.

**Nachtrag (gleicher Tag):** Beim Durchsehen der Tabelle hat Jan zusätzlich gefragt, ob die 10 Module bereits vollständig sind. Antwort: **nein** — Admin-UI (`src/app/admin/**`, 31 Dateien / 5.713 Zeilen) steht laut Worldmap-Scope-Zeile 13 explizit im Scope dieser Kategorie, war aber in keinem der 10 Module abgedeckt. Auf Jans Entscheidung wurde Admin-UI in Modul 10 eingefaltet (siehe Abschnitt 1 und [`13_10_meta_features_subkategorien.md`](./13_10_meta_features_subkategorien.md)) statt ein 11. Modul zu eröffnen — das hält die repoweite Konvention „maximal 10 Subkategorien" ein. Geprüft und **kein** Gap: LLM-Guide-UI (`CasinoGuidePanel.tsx`, `GameCoPilotHud.tsx`) ist bereits explizit Kategorie 15 (LLM-Integration) zugeordnet, nicht Kategorie 13.

### 1 — Die 10 Subkategorien: Gewichtung & Bewertung

Gewichtung nach Nutzer-Impact/Conversion-Risiko (analog zur Geld-Risiko-Logik bei Datenbank/Security, hier auf Frontend übertragen): Module, die auf jeder Seite sichtbar sind oder direkt die Spielinteraktion tragen (Layout, Tokens, Game-Interfaces), wiegen am stärksten; reine Komfort-/Zusatzmodule (Audio, A11y, Meta-Features) am wenigsten. Übernommen aus der bestehenden Gewichtsverteilung in `docs/frontend/00_FRONTEND_OVERVIEW.md` (dort bereits nach identischer Logik hergeleitet). Summe = 100.

**Methodik-Hinweis (wichtig):** Das Niveau je Modul ist **nicht** direkt aus dem `docs/frontend`-V4-Audit übernommen, sondern der **gewichtete Schnitt der zugehörigen Ebene-2-Sub-Subkategorien** (siehe jeweils verlinkte Übersichtsdatei) — bottom-up berechnet, damit Ebene 1 und Ebene 2 nicht auseinanderlaufen. Das drückt bei mehreren Modulen den Wert spürbar nach oben (schlechter) gegenüber der optimistischeren V4-Holistic-Einschätzung, weil ein einzelner schwacher, aber real gewichteter Sub-Punkt (z. B. fehlendes 3D-Spatial-Audio, ungelöste Mobile-CWV-Lücke) den Schnitt stärker zieht, als eine pauschale Modul-Einschätzung das je zugelassen hätte — genau die Dynamik, die diese ganze Aufschlüsselung sichtbar machen soll.

**Execution-Spalte:** Nutzt ausschließlich die beiden Werte aus dem Standard-Lebenszyklus (`xx_sop/03_workflow_jan_planungsdateien.md`): **Execution-Ready** (Planungsdatei steht, aber noch nicht ausgeführt) und **Executed** (Planungsdatei erstellt und erfolgreich ausgeführt). Da für keines der 10 Module aktuell eine Planungsdatei existiert (siehe Spalte „Planungsdatei"), steht die Spalte konsequent auf „—".

|  #  | Subkategorie | Gewichtung | Niveau | Execution | Übersichtsdatei | Planungsdatei | Weiteres |
| :-: | :--- | :---: | :---: | :---: | :--- | :---: | :--- |
| 01 | Layout, Shell & Navigation | **15** | Top 13,6 %¹ | — | [13_01_layout_shell_subkategorien.md](./13_01_layout_shell_subkategorien.md) | — | Hoher Impact: auf jeder Route sichtbar |
| 02 | Design-Tokens & CSS | **15** | Top 15,1 %¹ | — | [13_02_design_tokens_subkategorien.md](./13_02_design_tokens_subkategorien.md) | — | Hoher Impact: bestimmt Markenidentität repoweit, aber 3 von 6 Sub-Punkten nur konventionsbasiert (kein Lint-Gate) |
| 03 | State & Persistence | **10** | Top 8,6 % | — | [13_03_state_persistence_subkategorien.md](./13_03_state_persistence_subkategorien.md) | — | Money-Pfad-nah (0 % Client-Wallet-Autorität), XP-Polling zieht Schnitt leicht nach oben |
| 04 | Motion & Spring-Physik | **10** | Top 11,6 % | — | [13_04_motion_physics_subkategorien.md](./13_04_motion_physics_subkategorien.md) | — | Mittlerer Impact: Partikel-Memory-Risiko unverifiziert |
| 05 | Game-Interfaces | **15** | Top 12,7 %² | — | [13_05_game_interfaces_subkategorien.md](./13_05_game_interfaces_subkategorien.md) | — | Hoher Impact: Kern-Spielinteraktion, 6 Spielmodi |
| 06 | **Audio-Engine** | **5** | Top 23,3 %³ | — | [13_06_audio_engine_subkategorien.md](./13_06_audio_engine_subkategorien.md) | — | Geringes Modul-Gewicht federt den schlechten Sub-Wert auf Gesamtebene ab — Fund selbst bleibt real (siehe Abschnitt 3) |
| 07 | Analytics & RUM | **7**⁷ | Top 10,6 % | — | [13_07_analytics_rum_subkategorien.md](./13_07_analytics_rum_subkategorien.md) | — | Gewicht 10→7 verschoben, um Platz für Modul 10 (Admin-UI) zu schaffen — Kern-Datenschutzpfad exzellent, fehlendes CI-Gate zieht Schnitt hoch |
| 08 | **Performance & Core Web Vitals** | **10** | Top 22,5 %⁴ | — | [13_08_performance_cwv_subkategorien.md](./13_08_performance_cwv_subkategorien.md) | — | Größter Einzel-Bottleneck: Mobile-CWV-Lücke (Gewicht 30 % innerhalb des Moduls) |
| 09 | Accessibility & Touch | **5** | Top 18,4 %⁵ | — | [13_09_accessibility_touch_subkategorien.md](./13_09_accessibility_touch_subkategorien.md) | — | Realer neuer A11y-Bug heute gefunden (siehe Fußnote), Live-Region-Lücke zieht zusätzlich |
| 10 | **Meta-Features, Modals & Admin-UI**⁷ | **8**⁷ | Top 18,1 %⁶ | — | [13_10_meta_features_subkategorien.md](./13_10_meta_features_subkategorien.md) | — | Um Admin-UI erweitert (2026-09-13, siehe Fußnote), Gewicht 5→8. Größte Einzeldatei des Repos (`HistoryTableStream.tsx`) liegt weiterhin hier |

`¹` **Module 01/02 höher als der V4-Wert** (V4: Top 8 % bzw. Top 10 %): Modul 01 durch 5 Layout-/Lobby-Dateien > 600 Zeilen (`NeonArcadeDashboardView.tsx` 746, `WheelCarousel.tsx` 686, `LobbyScrollChoreography.tsx` 620, `InteractiveArcadeGrid.tsx` 609, `HeroSectionV2.tsx` 573) — im V4-Audit vom 2026-09-02 nicht als Restpunkt genannt. Modul 02 durch drei konventionsbasierte (nicht Lint-erzwungene) Sub-Regeln, die einzeln unauffällig, gewichtet aber real sind.
`²` **Modul 05** (V4: Top 6 %): 6 Game-Dateien > 600 Zeilen plus 3 frische `react-hooks/exhaustive-deps`-Warnings konzentriert in `useCrashMultiplayerRoomClock.ts`, dazu der frische A11y-Fund in `BetInputGroup.tsx`.
`³` **Modul 06** (V4: Top 15 %): Die fehlende 3D-Spatial-Audio-Aktivierung (vom V4-Dokument selbst als „konzipiert, nicht aktiv" beschrieben) trägt mit 20 % Gewicht und Top 60 % Einzelwert überproportional zum Modulschnitt bei — Modul-Gewicht in der Gesamttabelle ist mit 5 aber am niedrigsten, dämpft den Effekt auf den *Gesamt*schnitt (nicht auf den Modul-Befund selbst, siehe Abschnitt 3).
`⁴` **Modul 08** (V4: Top 14 %): Mobile Core Web Vitals (LCP historisch 5,7s) allein tragen mit 30 % Gewicht Top 45 % in den Modulschnitt — größter Einzel-Hebel der ganzen Aufschlüsselung.
`⁵` **Modul 09** (V4: Top 10 %): Heutiger `npm run lint`-Lauf findet einen bislang nicht dokumentierten echten A11y-Bug — `jsx-a11y/role-supports-aria-props` in `BetInputGroup.tsx:132` (`aria-valuemin`/`aria-valuemax` auf einem `<input>` mit implizitem `textbox`-Rollen nicht unterstützt) — plus die vom Quelldokument selbst benannte fehlende Live-Region für Ticker-Werte.
`⁶` **Modul 10** (V4: Top 6 %): `HistoryTableStream.tsx` ist mit 824 Zeilen heute die größte Einzeldatei im gesamten `src/`-Baum und trägt weiterhin am stärksten zum Modulschnitt bei (Top 40 % bei 20 % Gewicht innerhalb des Moduls) — die im V4-Audit selbst als Pitfall benannte Virtualisierungs-Empfehlung (`@tanstack/react-virtual`) ist seit 2026-09-02 nicht umgesetzt, die Datei ist seither weiter gewachsen statt kleiner geworden.
`⁷` **Module 07/10 — Gewichtsverschiebung 2026-09-13:** Auf Jans Frage, ob die 10 Module vollständig sind, wurde Admin-UI (`src/app/admin/**`, 31 Dateien / 5.713 Zeilen, laut Worldmap-Scope Teil von Kategorie 13, zuvor in keinem Modul abgedeckt) in Modul 10 eingefaltet statt ein 11. Modul zu eröffnen (Details: [`13_10_meta_features_subkategorien.md`](./13_10_meta_features_subkategorien.md)). Modul-10-Gewicht dafür von 5 auf 8 angehoben, im Gegenzug Modul 07 (Analytics & RUM, geringster Handlungsbedarf aller Module) von 10 auf 7 reduziert — Summe bleibt 100. Modul-10-Niveau ändert sich dadurch von Top 17,1 % auf Top 18,1 % (3 neue Admin-Sub-Punkte mit Top 12–25 % ziehen leicht nach oben).

Module 03, 04 liegen ebenfalls über dem jeweiligen V4-Wert, aber ohne einen einzelnen dominanten Ausreißer — der Effekt verteilt sich gleichmäßiger über mehrere Sub-Punkte (siehe jeweilige Ebene-2-Datei).

### 2 — Gewichteter Gesamtschnitt

$$\text{Schnitt} = \sum (\text{Gewicht}_i \times \text{Niveau}_i) / 100$$

| Modul | Gewicht × Niveau | Beitrag |
| :--- | :--- | :---: |
| 01 Layout & Shell | 15 × 13,6 | 2,04 |
| 02 Design-Tokens | 15 × 15,1 | 2,27 |
| 03 State & Persistence | 10 × 8,6 | 0,86 |
| 04 Motion & Physik | 10 × 11,6 | 1,16 |
| 05 Game-Interfaces | 15 × 12,7 | 1,91 |
| 06 Audio-Engine | 5 × 23,3 | 1,17 |
| 07 Analytics & RUM | 7 × 10,6 | 0,74 |
| 08 Performance & CWV | 10 × 22,5 | 2,25 |
| 09 Accessibility & Touch | 5 × 18,4 | 0,92 |
| 10 Meta-Features, Modals & Admin-UI | 8 × 18,1 | 1,45 |
| **Summe** | | **≈ 14,8 → Top 14,8 %** |

Änderung gegenüber der ersten Version dieser Tabelle (Top 14,5 %): Admin-UI-Ergänzung in Modul 10 plus die begleitende Gewichtsverschiebung von Modul 07 heben den Gesamtschnitt um 0,3 Punkte an.

### 3 — Schwächste Bottlenecks (Kandidaten für die nächste Planungsdatei-Runde)

**Nach rohem Modul-Niveau — die unmittelbare Lesart der Tabelle in Abschnitt 1:** Zwei Module stechen klar heraus: **Audio-Engine (Top 23,3 %)** und **Performance & Core Web Vitals (Top 22,5 %)**. Das deckt sich mit Jans eigener Durchsicht der Tabelle — diese beiden sind die tatsächlichen Bottlenecks. Dahinter liegt seit der Admin-UI-Ergänzung ein enges drittes Cluster (Accessibility Top 18,4 %, Meta-Features/Admin-UI Top 18,1 %), der Rest (Top 8,6 % bis Top 15,1 %) ist im Vergleich klar nachrangig.

**Warum Audio-Engine trotzdem nur 1,17 Punkte zum Gesamtschnitt beiträgt (Modul 08 dagegen 2,25):** reines Artefakt des niedrigen Modul-*Gewichts* (5 vs. 10) aus Abschnitt 1 — Audio ist seltener sichtbar/genutzt als Performance, deshalb zählt seine Schwäche weniger für den *Gesamt*-Score der Kategorie. Das ändert nichts daran, dass der Modul-Befund selbst (fehlendes 3D-Spatial-Audio) genauso real und genauso weit von Top 1 % entfernt ist wie die Mobile-CWV-Lücke — für die Priorisierung der nächsten Planungsdatei zählt daher in erster Linie die Spalte „Niveau", nicht die Spalte „Beitrag".

**Korrektur beim Gegenlesen:** Nach reinem gewichtetem Beitrag (Abschnitt 2) liegt tatsächlich **Modul 02 (2,27)** hauchdünn vor Modul 08 (2,25) auf Platz 1 — nicht Modul 08, wie eine erste Fassung dieses Abschnitts fälschlich behauptete. Trotzdem bleibt Modul 08 die praktische Priorität Nr. 1: Modul 02s Lücke ist diffus über 3 konventionsbasierte Sub-Punkte verteilt (kein einzelner Fix), während Modul 08 einen einzelnen, bereits klar diagnostizierten Fund mit fast dreimal so hohem Modul-Niveau (22,5 % vs. 15,1 %) hat.

Priorisierung für die nächste Runde:

1. **Modul 08 — Performance & Core Web Vitals (Mobile, Top 45 % innerhalb des Moduls):** LCP historisch 3,8–5,7s gegen Zielwert < 2,5s, Ursache laut bestehender Doku „nicht weiter isoliert". Praktisch höchster Hebel: zweithöchstes Modul-Niveau der ganzen Tabelle, gepaart mit einem bereits konkret diagnostizierten Einzelfund statt verteilter Kleinigkeiten.
2. **Modul 06 — Audio-Engine (3D-Spatial-Audio, Top 60 % innerhalb des Moduls):** höchstes Modul-Niveau der gesamten Tabelle. Wird vom reinen gewichteten Beitrag (Rang 6) unterschätzt — sollte nicht allein wegen des niedrigen Kategorie-Gewichts hinter Modul 08 zurückgestellt werden.
3. **Modul 02 — Design-Tokens, verteilte konventionsbasierte Lücken:** rechnerisch der höchste gewichtete Beitrag (2,27), aber kein Einzelfund — Radien-Formel, Tabular-Nums-Pflicht und Farb-Token-Konsistenz hängen an Code-Review-Disziplin statt an einem Lint-Gate.
4. **Modul 09 — A11y-Quick-Win (`BetInputGroup.tsx:132`):** kleinster Scope der vier Kandidaten, aber ein heute frisch bestätigter, konkreter, vermutlich in unter 10 Minuten behebbarer Bug — unabhängig von der Prioritätsreihenfolge sofort mitnehmbar.

Module 01, 03, 04, 05, 07 liegen spürbar niedriger (Top 8,6 % bis Top 15,1 %) und sind aktuell nicht priorisierungsrelevant.

> **Sonderfall Modul 10 (`HistoryTableStream.tsx` + Admin-UI):** Mit Top 18,1 % eigentlich im engen dritten Cluster mit Accessibility, aus der obigen Prioritätsliste aber bewusst herausgehalten, weil sein Modul-Gewicht (8) vergleichsweise niedrig ist *und* der größte Einzelfund darin (fehlende `HistoryTableStream`-Virtualisierung) seit 2026-09-02 nachweislich **wächst** statt stagniert, während die neu ergänzten Admin-Sub-Punkte noch nicht unabhängig tiefenverifiziert sind (siehe [`13_10_meta_features_subkategorien.md`](./13_10_meta_features_subkategorien.md)) — bei freier Kapazität lohnt sich ein früher Blick trotzdem.

### 4 — Selbstprüfung dieser Datei (nach `xx_sop/12_workflow_dokument_qualitaet.md` §2, Kern-8-Rubrik)

|  #  | Kriterium | Score /3 | Begründung |
| :-: | :--- | :---: | :--- |
| 1 | Verifizierbarkeit gegen Repo-Realität | 3 | Lint/Test/Dateigrößen frisch gemessen, alle 10 Module bottom-up aus den Ebene-2-Sub-Subkategorien berechnet statt aus `docs/frontend` übernommen — 6 Module mit Fußnote zur Abweichung vom V4-Wert |
| 2 | Konkretheit der Handlungsanweisung | 2 | Tabelle mit Datei-/Zeilenbezug, aber bewusst ohne nächste Schritte (Planungsdateien sind explizit außerhalb des Scopes dieser Runde) |
| 3 | Vollständigkeit des Lebenszyklus/Scopes | 2 | Ebene 1 + Ebene 2 vollständig; Ebene 3 (Planungsdateien) bewusst ausgeklammert, Grenze oben benannt |
| 4 | Bekannte-Probleme-Transparenz | 3 | Widerspruch 28 % vs. 8,4 % vs. 14,8 % offengelegt und aufgelöst (worldmap Fußnote ⁷); neuer A11y-Fund und Admin-UI-Scope-Lücke benannt und geschlossen |
| 5 | Cross-Referenz-Konsistenz | 3 | Alle 10 Ebene-2-Dateien verlinkt, Rückverweise auf `docs/frontend/`, `worldmap/` (inkl. Fußnote ⁷), `T_DATABASE/`-Vorbild korrekt |
| 6 | Risiko-/Freigabeklassifizierung | 1 | Keine K-Level-Kennzeichnung — reine Analysedatei ohne auszuführende Aktion in dieser Runde |
| 7 | Lerneffekt-Tauglichkeit | 3 | Jede Abweichung von der V4-Vorlage ist mit Grep-/Lint-Beleg begründet; Abschnitt 3 erklärt explizit, warum Rohwert und gewichteter Beitrag auseinanderfallen können |
| 8 | Aktualitäts-Check | 3 | Stand 2026-09-13 vermerkt, gegen `npm run lint`/`npm test`/Dateigrößen-Scan vom selben Tag verifiziert |

**Score: 20 / 24 → Tier Top 2–9 %.** Größte bewusste Lücke: Kriterium 6 (kein K-Level) und Kriterien 2/3 (Planungsdateien bewusst zurückgestellt) — beides Scope-Entscheidungen, keine Versäumnisse.

---

## Aktiver Dateibestand im Ordner

| Datei                                                                          | Thema & Fokus                                                 |          Status          | Kern-Inhalt & Relevanz                                                                                                                                                                                          |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------ | :----------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`01_spielfunktion.md`](./01_spielfunktion.md)                                 | **Spielerlebnis & Retention (P38)**                           |         🟡 Aktiv         | 9 Kernkategorien (S1–S10): S1 Onboarding (umgesetzt), S2 Belohnungs-Feedback (Streaks/Audio), S3 Fortschritt, S4 Sammelziele, S5 Daily Retention.                                                               |
| [`02_FRONTEND_REDESIGN_NEXT_LEVEL.md`](./02_FRONTEND_REDESIGN_NEXT_LEVEL.md)   | **High-Impact UI/UX-Hebel**                                   |         🟢 Aktiv         | Top 10 Hebel: FE-02 3D-Dice, FE-04 3D-Roulette, FE-06 Crash Multi-Stage Thrill, FE-08 Bet-Replay Viewer, FE-09 Mobile Bottom Dock, FE-13 3D-Glücksrad, FE-14 Krypto-Visualizer, FE-17 Blackjack Strategy Coach. |
| [Plan FE-02 V2 (archiviert)](../docs/archive/02_fe02_dice_3d_v2_plan.md)       | **FE-02 Dice 3D-Roll & Lichtkuppel**                          | 🟢 Executed (archiviert) | 21-Stufen-Plan für V2-Sandbox (`/dice/v2`), Polyeder 3D, Spotlight, 900ms Easing, physisches Audio.                                                                                                             |
| [`02_motion.dev.md`](./02_motion.dev.md)                                       | **Motion.dev Konsolidierung**                                 |         🟢 Aktiv         | Skill-Ladder (10 Stufen), Element-Mapping auf `/games-2`, Shared Elements (`layoutId`), Spring-Physik-Standards.                                                                                                |
| [`02-3_motion_lab_v5_awwwards_gap.md`](./02-3_motion_lab_v5_awwwards_gap.md)   | **Awwwards-Gap-Analyse**                                      |         🟢 Aktiv         | Ehrliche Bottleneck-Analyse B1–B7 (fehlende dominante Design-Idee, 2D-Flachheit, fehlende Cursor-Identität) für Top-10%-Niveau.                                                                                 |
| [`02-4_motion_lab_v5_particle_typo.md`](./02-4_motion_lab_v5_particle_typo.md) | **Motion-Lab V5 „PULS“**                                      |     🟢 Sandbox-Plan      | Spezifikation der isolierten Testroute `/lab`: GPU-Partikelfeld, Textmasken, spielbarer Signature-Moment „Die Wette“.                                                                                           |
| [`04_tokens.md`](./04_tokens.md)                                               | **Usage-Aufgabenpool**                                        |     🟢 8/10 erledigt     | TO-01 bis TO-10: Restaufgaben TO-02 (Testabdeckung Spielregeln) und TO-03 (Repo-Sweep, Fundmatrix in `docs/archive/`).                                                                                          |
| [`00_AUFGABEN_FRONTEND.md`](./00_AUFGABEN_FRONTEND.md)                         | **Aufgabenpool Frontend**                                     |       🟢 2 erledigt      | Abgeschlossene Aufgaben: Skiper-UI-Katalog ([`docs/frontend/20`](../docs/frontend/20_skiper_ui_complete_catalog.md), 106 Komponenten) + animations.dev-Kurs-Katalog ([`docs/frontend/21`](../docs/frontend/21_animations_dev_catalog.md), öffentlicher Anteil). Pläne 60/61 nach Ausführung aufgelöst. |
| [`05_lobby_hintergrund_effekte.md`](./05_lobby_hintergrund_effekte.md)         | **Lobby-Hintergrund: Backdrop, Parallax & Reaktions-Effekte** |         🟢 Live          | Skill-Doku: 2.5D-Parallax aus einem Standbild, Hover-Goldwellen & Big-Win-Komet (window-Events), Glow-Trick mit additiver Lichtmischung, Tuning-Parameter.                                                      |

---

## Bereinigte Altbestände (Historie)

- **Gelöscht (reine Temp-/Log-Dumps ohne Nutzwert):** `TO07_sweep_raw.log`, `_l3_files.txt`, `_lib_files_all.txt`.
- **Archiviert nach `docs/archive/` (Repo-Sweep TO-03):** `0101_S1_0403_repovereinfachung.md` & `0101_S1_0403_repovereinfachung_scanner-raw.md` (gehören zur Fundmatrix [`docs/archive/17_TO03_simplify_fundmatrix.md`](../docs/archive/17_TO03_simplify_fundmatrix.md)).
