# Workflow-Jan Planungsdateien

> **Zweck:** Plantätigkeiten von Ausführungsanweisungen, Systemkontext und Statusnachweisen trennen.

## 1 — Artefaktklassen

| Klasse | Ort | Inhalt | Nicht enthalten |
| --- | --- | --- | --- |
| Plan | `worldmap/` | Ziel, Optionen, Scope, Abhängigkeiten, Status, Freigabe-Gates | Umsetzungsschritte anderer wiederkehrender Aufgaben |
| SOP | `xx_sop/` | Trigger, Voraussetzungen, Ablauf, Prüfschritte | volatile Systemstände und Live-Behauptungen |
| Kontextreferenz | `xx_docs/` | Systemgrenzen, Zuständigkeiten, Einstiegsdateien, Quellhierarchie | Schritt-für-Schritt-Abläufe |
| Statusnachweis | `worldmap/00_WORLDMAP_STATUS.md` | lokal, verifiziert oder live bestätigter Zustand | Planung oder technische Anleitung |
| Archiv | `docs/archive/` | ausgeführte Entscheidung, Evidenz und Historie | aktiver Plan |

## 2 — Ablage und Lebenszyklus von Plänen

- Aktive fachliche Pläne liegen in `worldmap/`; die Marker-Datei enthält nur Reihenfolge und Verweise.
- Jede Plan-Datei trägt genau einen Status: `Geplant`, `Execution-Ready`, `In Execution` oder `Executed (archiviert)`.
- Nach `Executed (archiviert)` wird ein Plan nach `docs/archive/` verschoben. Löschen ist nur für Gerüste ohne Entscheidungs- oder Nachweiswert zulässig.
- Kopfstatus, Übersichtstabelle, Detailabschnitt und Verweise werden im selben Edit aktualisiert.
- Ein Plan verlinkt auf benötigte SOPs und Kontextreferenzen, kopiert deren Inventare aber nicht.

## 3 — Kopfbereich für neue Pläne

```markdown
# NN — <Thema>

> **Status:** Geplant · **Stand:** YYYY-MM-DD · **Owner:** Jan/LLM · **Scope:** <klare Grenze>

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| --- | --- | --- | --- | --- |
| L0 | ... | 🟢 Executed | ... | LLM |
| L1 | ... | 🔴 Geplant | ... | Jan + LLM |
```

- Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. Die Ampel ergänzt den festen Kopfstatus.
- Jeder Meilenstein enthält Ziel, Scope, Abhängigkeiten, Freigabe-Gate, Verifizierung und Nicht-Scope.
- Wallet-, Auth- oder DB-Schreibpfade enthalten zusätzlich `Money-Pfad: Ja/Nein` und `Security-Review: Pflicht/Nein`.
- So viele Zuständigkeiten wie möglich sollten bei dem LLM liegen. 
- So wenig Zuständigkeiten wie möglich sollten bei Jan liegen. Nur welche zwingend notwendig sind 

## 4 — Selbstprüfung vor `Execution-Ready`

- Der Scope ist gegenüber verwandten Plänen abgegrenzt.
- Abhängigkeiten, Reihenfolge und erforderliche Jan-Entscheidungen sind benannt.
- Jede neue Datenklasse, API-Grenze oder Schreiboperation enthält Allowlist, Negativtest und Fallback.
- Statusbehauptungen sind als lokal, verifiziert oder live gekennzeichnet und verlinken auf ihre Quelle.
- Keine Referenz ist doppelt als SOP, Kontextreferenz und Plan gepflegt.
- Die erstellte Markdown-Datei oder Planungsdatei sollte von einer neuen LLM-Konversation exakt verstanden werden können. 
- Hintergrund ist dabei, manchmal nutze ich für die Planung und für die Execution verschiedene LLM-Modelle bzw. verschiedene Konversationen. 


## 5 — .md 100 % abgeschlossen
- Wenn es sich um eine temporäre Datei handelt, die in Zukunft nicht mehr benötigt wird, kann diese gelöscht werden. Wir haben ja alles abgeschlossen. 
- Wenn man diese für die Zukunft noch behalten sollte, soll die in den Ordner `/Docs` verschoben werden. 