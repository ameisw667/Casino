# C01 — Admin-Evals-Verantwortungsgrenzen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM
> **Scope:** AdminEvalsClient in lokalen Daten-Hook und reine Präsentationsbereiche schneiden, ohne API- oder UI-Vertrag zu ändern.
> **Kontext:** Die 771-Zeilen-Datei vereint Abruf, Reload, KPI, zwei Charts und Feedbacktabelle.
> **Money-Pfad:** Nein · **Security-Review:** Nein

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                 | Scope                        | Ausführung  | Status | Zuständigkeit | Verifikation               |
| --- | --------------------------- | ---------------------------- | ----------- | ------ | ------------- | -------------------------- |
| L0  | Desktop-/Mobile-Baseline    | /admin/evals und Clientdatei | Sequenziell | Bereit | LLM           | vier Zustände, Screenshots |
| L1  | Daten-Hook extrahieren      | admin/evals und Hook         | Sequenziell | Bereit | LLM           | Fetch, Cancel, Reload      |
| L2  | Kopf/KPI extrahieren        | reine UI-Komponenten         | Sequenziell | Bereit | LLM           | Props und Darstellung      |
| L3  | Charts/Feedback extrahieren | reine UI-Komponenten         | Sequenziell | Bereit | LLM           | Zeitfenster, Leerzustand   |
| L4  | Regression prüfen           | Route, Tests, Diff           | Sequenziell | Bereit | LLM           | Baseline, fünf Stufen      |

Fan-out: keiner. Alle Bereiche hängen am selben Datenvertrag und werden erst nach stabiler Hook-Grenze extrahiert.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [Admin-Evals-Page](../../../../../src/app/admin/evals/page.tsx)
- [Admin-Evals-Client](../../../../../src/app/admin/evals/AdminEvalsClient.tsx)
- [Evals-API](../../../../../src/app/api/admin/evals/route.ts)
- [Layout-Shell-Kontext](../../../../../xx_docs/09_layout_shell_context.md)
- [Designsystem-SOP](../../../../../xx_sop/04_design_system_ui.md)

### 2.2 Lokaler Baseline-Vertrag P3

L0 hält /admin/evals in der bestehenden lokalen Admin-Sitzung bei Desktop 1440×900 und Mobile 390×844 mit Screenshot, DOM-Text und Interaktionsnotiz fest.

| Zustand | Heutiger Vertrag                                                                                                             |
| ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Loading | Header bleibt sichtbar; beim ersten Abruf tragen Datenbereiche ihren Ladezustand, beim Reload animiert das Refresh-Icon.     |
| Fehler  | Die rote Alert-Zeile „Telemetrie- & Evals-Daten konnten nicht geladen werden.“ bleibt sichtbar; Aktualisieren erlaubt Retry. |
| Leer    | Bei leerem recentFeedback zeigt die Tabelle ihre vorhandene Leerzeile; KPI und Charts folgen den API-Daten.                  |
| Erfolg  | 24 Stunden/7 Tage schalten metrics um; KPI, Token-Pie, Outcome-Bar und Tabelle behalten Werte und Reihenfolge.               |

Die Auth-Grenze bleibt unverändert. Der Hook ruft weiterhin ausschließlich /api/admin/evals mit cache no-store auf und verarbeitet raw.data oder raw.

### 2.3 Nicht-Scope

- Keine Änderung an API, Datenbank, Auth, Analytics, Pricing oder Telemetrie-Schema.
- Keine Änderung an UsersPageClient, Wallet, XP, Level, RNG, Crash oder globalen Design-Tokens.
- Keine neue Loading-, Fehler- oder Leer-UX und keine Komponentenbibliothek.

## 3 — Detaillierte Meilensteine

### L0 — Desktop-/Mobile-Baseline

- **Ziel:** Bestehenden UI-Vertrag vor Extraktion belegen.
- **Schritte:** Route in beiden Viewports öffnen; vier Fälle über normale lokale API-Antwort, leeres Feedback und Fehlerantwort auslösen; Screenshot, Text und Klickfolge sichern.
- **Erwartetes Verhalten:** Die Aufnahme dokumentiert Verhalten, nicht Verbesserung.
- **Abbruch/Rückfall:** Ohne lokale Admin-Sitzung oder reproduzierbaren Zustand keine UI-Änderung.

### L1 — Daten-Hook extrahieren

- **Ziel:** Fetch, initiales Laden, Cancel-Schutz, Reload und Window-Auswahl an einer Stelle führen.
- **Schritte:** useAdminEvals direkt unter admin/evals anlegen; Envelope-Fallback, Fehlertext, loading und selectedWindow identisch übernehmen; Client nur über Hook verbinden.
- **Erwartetes Verhalten:** Ein API-Vertrag und unveränderte Retry-Semantik.
- **Abbruch/Rückfall:** Geänderter Request, Cache-Modus oder Fehlertext nimmt Extraktion zurück.

### L2 — Kopf/KPI extrahieren

- **Ziel:** Reine Darstellung ohne Fetch- oder Statebesitz schaffen.
- **Schritte:** Header mit Zeitraum/Reload und KPI-Karten als prop-getriebene Komponenten extrahieren; Inline-Styles und Labels übernehmen.
- **Erwartetes Verhalten:** Props beschreiben Daten und Callbacks, nicht die API.
- **Abbruch/Rückfall:** Sicht- oder Interaktionsabweichung zu L0 stellt Bereich zurück.

### L3 — Charts/Feedback extrahieren

- **Ziel:** Chart-Datenbildung und Feedbacktabelle lesbar abgrenzen.
- **Schritte:** Token- und Outcome-Daten aus metrics ableiten; Pie, Bar und Tabelle rein extrahieren; Leerzeile und Rating-Symbole behalten.
- **Erwartetes Verhalten:** Reihenfolge, Farben, Zeitfenster und Leerzustand bleiben identisch.
- **Abbruch/Rückfall:** Unterschiedlicher Chartwert, fehlender Datensatz oder anderer Leertext stellt letzte Extraktion zurück.

### L4 — Regression prüfen

- **Ziel:** Vertrag in beiden Viewports beweisen.
- **Schritte:** L0-Fälle wiederholen, Refresh und Zeitfenster klicken, Tests ausführen, Diff prüfen.
- **Erwartetes Verhalten:** Nur Dateigrenzen ändern sich.
- **Abbruch/Rückfall:** Jeder L0-Vergleichsfehler verhindert Zusammenführung.

## 4 — 5-Stufen-Abschlussprüfung

1. npm run typecheck ohne Fehler.
2. npm test ohne Fehlschlag, einschließlich vorhandener Admin- und API-Tests.
3. npm run lint ohne Errors.
4. npm run build erfolgreich.
5. Desktop-/Mobile-Vergleich aller L0-Zustände, keine Browser-Console-Errors und git diff --check sind grün.
