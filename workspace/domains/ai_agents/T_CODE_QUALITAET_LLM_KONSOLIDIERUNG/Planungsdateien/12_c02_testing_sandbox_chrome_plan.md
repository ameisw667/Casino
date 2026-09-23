# C02 — Testing-Sandbox-Chrome

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM
> **Scope:** Gemeinsames Chrome und identische Hilfsbausteine der Testing-Routen 7.1–7.4 zentralisieren; Varianten bleiben je Route.
> **Kontext:** Navbar, Hero und Bewertungsmatrix wiederholen sich; 7.3/7.4 parts/shared.ts sind byte-identisch.
> **Money-Pfad:** Nein · **Security-Review:** Nein

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                    | Scope                         | Ausführung  | Status | Zuständigkeit | Verifikation             |
| --- | ------------------------------ | ----------------------------- | ----------- | ------ | ------------- | ------------------------ |
| L0  | Vier-Routen-Baseline           | /testing/7.1 bis /testing/7.4 | Sequenziell | Bereit | LLM           | Desktop/Mobile, Zustände |
| L1  | Gemeinsamkeit kartieren        | parts und Clients             | Sequenziell | Bereit | LLM           | Props, Hash, Variationen |
| L2  | Gemeinsames Chrome extrahieren | gemeinsamer testing-Bereich   | Sequenziell | Bereit | LLM           | vier gleiche Routen      |
| L3  | shared-Helfer vereinigen       | 7.3 und 7.4                   | Sequenziell | Bereit | LLM           | identische Exporte       |
| L4  | Interaktion prüfen             | alle vier Routen              | Sequenziell | Bereit | LLM           | Baseline, fünf Stufen    |

Fan-out: keiner. Die Chrome-API entsteht vor den Consumer-Umstellungen; danach folgt ein gemeinsamer Routenvergleich.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [Testing 7.1](../../../../../src/app/testing/7.1)
- [Testing 7.2](../../../../../src/app/testing/7.2)
- [Testing 7.3](../../../../../src/app/testing/7.3)
- [Testing 7.4](../../../../../src/app/testing/7.4)
- [Layout-Shell-Kontext](../../../../../xx_docs/09_layout_shell_context.md)
- [Designsystem-SOP](../../../../../xx_sop/04_design_system_ui.md)

### 2.2 Lokaler Baseline-Vertrag P3

L0 hält /testing/7.1, /testing/7.2, /testing/7.3 und /testing/7.4 bei Desktop 1440×900 und Mobile 390×844 fest.

| Zustand | Heutiger Vertrag für alle vier Routen                                                                                                                                       |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading | Keine Route lädt Remote-Daten. Nur die geklickte Optionsdemo zeigt ihren bestehenden lokalen loading-Prop; andere Optionen bleiben bedienbar.                               |
| Fehler  | Es gibt keinen Routen-Fehlerzustand und keine Fehlermeldungsfläche. Die Extraktion fügt weder Fetch noch Fehler-UX hinzu.                                                   |
| Leer    | Es gibt keinen Daten-Leerzustand, weil alle Routen lokale Vergleichsdaten rendern. Die Extraktion fügt keinen Platzhalter ein.                                              |
| Erfolg  | Navbar, Hero, Status-Quo, Optionen, Bewertungsmatrix und vorhandene Exportbereiche erscheinen in gleicher Route-Reihenfolge; Interaktionen ändern nur lokalen Demo-Zustand. |

Die Routen bleiben isolierte Testing-Flächen. Produktseiten, Design-Tokens, Motion-Parameter und fachliche Optionskomponenten bleiben unangetastet.

### 2.3 Nicht-Scope

- Keine produktiven Games, Wallet, RNG, Auth, API, Supabase oder globalen Layouts.
- Keine inhaltliche Harmonisierung, keine neue Empfehlung und keine Entfernung einer unterschiedlichen Variante.
- Keine Änderung an T_FRONTEND- oder t_claude_code-Ownership.

## 3 — Detaillierte Meilensteine

### L0 — Vier-Routen-Baseline

- **Ziel:** Route, Viewport und Interaktion vor Refactor festschreiben.
- **Schritte:** Routen in beiden Viewports öffnen; Darstellung erfassen; je vorhandener Optionsdemo eine Loading-Interaktion auslösen; Navigation, Hero und Matrix protokollieren.
- **Erwartetes Verhalten:** Acht Screenshots und Zustandsnotizen ergeben den Vertrag.
- **Abbruch/Rückfall:** Fehlende oder bereits defekte Route verhindert gemeinsame Komponente.

### L1 — Gemeinsamkeit kartieren

- **Ziel:** Nur identische Struktur zentralisieren.
- **Schritte:** Props und DOM von Navbar, Hero, Matrix und shared.ts vergleichen; Unterschiede als route-lokale Props notieren; 7.3/7.4 shared.ts erneut hashen.
- **Erwartetes Verhalten:** Jede Extraktion hat konkrete gemeinsame Schnittstelle.
- **Abbruch/Rückfall:** Unterschiedliche Semantik bleibt lokal.

### L2 — Gemeinsames Chrome extrahieren

- **Ziel:** Wiederholten Rahmen einmal implementieren.
- **Schritte:** Kleinen Chrome-Bereich unter src/components/testing anlegen; Navbar, Hero und Matrix über explizite Props versorgen; vier Routen einzeln umstellen.
- **Erwartetes Verhalten:** Titel, Inhalte, Optionen und Styles bleiben je Route.
- **Abbruch/Rückfall:** Layout-, Navigation- oder Viewportfehler stellt letzten Consumer zurück.

### L3 — shared-Helfer vereinigen

- **Ziel:** Den identischen 7.3/7.4-Helper einmal führen.
- **Schritte:** Gemeinsamen Helper mit unveränderten Exporten anlegen; beide Consumer umstellen; Restimporte suchen; alte Kopien nur bei null Restimporten entfernen.
- **Erwartetes Verhalten:** Keine Abstraktion über nur ähnliche Hilfsdateien.
- **Abbruch/Rückfall:** Export-, Typ- oder Laufzeitunterschied lässt lokale Dateien bestehen.

### L4 — Interaktion prüfen

- **Ziel:** Vier Sandboxes gegen L0 vergleichen.
- **Schritte:** Beide Viewports erneut öffnen; Loading-Demos auslösen; Optionen und Exportbereiche vergleichen; Console, Typecheck und Diff prüfen.
- **Erwartetes Verhalten:** Weniger Wiederholung bei gleichem sichtbarem und interaktivem Verhalten.
- **Abbruch/Rückfall:** Jede L0-Abweichung hält die Route aus der Zusammenführung.

## 4 — 5-Stufen-Abschlussprüfung

1. npm run typecheck ohne Fehler.
2. npm test ohne Fehlschlag.
3. npm run lint ohne Errors.
4. npm run build erfolgreich.
5. Desktop-/Mobile-Vergleich aller vier Routen, Loading-Interaktionen, keine Browser-Console-Errors und git diff --check sind grün.
