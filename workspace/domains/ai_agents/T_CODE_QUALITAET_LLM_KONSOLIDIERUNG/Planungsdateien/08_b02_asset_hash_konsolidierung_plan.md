# B02 — Asset-Hash-Konsolidierung mit URL-Schutz

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM
> **Scope:** Byte-identische Dateien unter public, ihre lokalen Consumer und eine je Hashgruppe deterministische URL-Policy.
> **Kontext:** Hashgleichheit beweist gleichen Inhalt, aber nicht die Entbehrlichkeit einer öffentlichen URL.
> **Money-Pfad:** Nein · **Security-Review:** Nein

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                      | Scope                            | Ausführung  | Status | Zuständigkeit | Verifikation              |
| --- | -------------------------------- | -------------------------------- | ----------- | ------ | ------------- | ------------------------- |
| L0  | Hash-/Größenbaseline             | public                           | Sequenziell | Bereit | LLM           | Gruppe, Bytes, Pfade      |
| L1  | Consumer-/URL-Karte              | Code, CSS, MD, öffentliche Pfade | Sequenziell | Bereit | LLM           | jede Gruppe klassifiziert |
| L2  | Schutzstrategie bestimmen        | je Hashgruppe                    | Sequenziell | Bereit | LLM           | Alias, Redirect, Retain   |
| L3  | Nur sichere Gruppen kanonisieren | geschützte Gruppen               | Sequenziell | Bereit | LLM           | HTTP und Referenzen       |
| L4  | Bilanz/Rückfall prüfen           | geänderte Pfade                  | Sequenziell | Bereit | LLM           | Größenbilanz, fünf Stufen |

Fan-out: keiner. Die URL-Policy einer Gruppe hängt von ihrem vollständigen Consumer-Bild ab; L3 nutzt nur die in L2 als sicher belegten Gruppen.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [Öffentliche Assets](../../../../../public)
- [Asset-Lifecycle](../../../frontend/T_IMAGE_CREATION/09_asset_lifecycle_versionierung_rollback.md)
- [Next-Konfiguration](../../../../../next.config.ts)
- [Duplikatprüfung](../../../../../scripts/check-duplication.mjs)

### 2.2 Verbindliche URL-Policy P2

1. L0 bildet SHA-256-Gruppen und notiert Originalpfad sowie Bytes.
2. L1 sucht jeden Pfad mit absolutem URL-Präfix in TypeScript, JavaScript, CSS, Markdown, JSON und Konfiguration. Jeder Pfad wird als „lokaler Consumer“, „kein lokaler Consumer“ und „öffentlich auslieferbar“ markiert.
3. Jeder Altpfad erhält genau eine Strategie: **Redirect** nur mit lokal verifizierter Serverregel und HTTP-Check; **Alias** nur bei erhaltener Altdatei; **Retain** bei fehlendem Nachweis.
4. Nur wenn alle entfernten Altpfade einer Gruppe mit Redirect oder Alias geschützt sind, darf die Gruppe umbenannt oder gelöscht werden. Alle anderen Gruppen bleiben unverändert, auch bei null lokalen Consumern.
5. Der Gruppenreport bleibt bei diesem Plan oder dem Asset-Lifecycle-Report, nicht in einer Startdatei.

### 2.3 Nicht-Scope

- Keine Bildgenerierung, keine Lifecycle-Änderung und keine pauschale Löschung aus Hashgleichheit.
- Keine nicht identischen Varianten, insbesondere Roulette-CasinoJeton.
- Keine Außenwelt-Annahme: unbekannte externe Verlinkung erzwingt Retain.
- Keine Produktlogik, Datenbank oder Konfiguration außerhalb einer tatsächlich geprüften Redirect-Regel.

## 3 — Detaillierte Meilensteine

### L0 — Hash-/Größenbaseline

- **Ziel:** Größenordnung reproduzierbar machen.
- **Schritte:** Alle public-Dateien hashen, gruppieren und redundante Bytes ermitteln; gegen 34 Gruppen, 47 Dateien und 87,4 MiB einordnen.
- **Erwartetes Verhalten:** Jede Änderung hat einen Vorherwert.
- **Abbruch/Rückfall:** Lesefehler blockiert die betroffene Gruppe.

### L1 — Consumer-/URL-Karte

- **Ziel:** Alle lokal sichtbaren Abhängigkeiten pro Gruppe erfassen.
- **Schritte:** Originalpfade repositoryweit suchen; dynamische Präfixe gesondert markieren; öffentliche Auslieferbarkeit aus public ableiten; Hash, Pfad, Consumer und URL-Status tabellieren.
- **Erwartetes Verhalten:** Keine Gruppe überspringt die URL-Karte.
- **Abbruch/Rückfall:** Nicht auflösbarer dynamischer Präfix setzt zugehörige Pfade auf Retain.

### L2 — Schutzstrategie bestimmen

- **Ziel:** Ohne Freigabe-Gate eine sichere Auswahl treffen.
- **Schritte:** Redirect nur bei testbarer Regel, Alias nur bei bestehender Altdatei, sonst Retain wählen; Strategie und Beleg je Pfad notieren.
- **Erwartetes Verhalten:** „Unklar“ wird Retain, nie offenes Ticket.
- **Abbruch/Rückfall:** Fehlgeschlagener HTTP-Check wechselt auf Retain.

### L3 — Nur sichere Gruppen kanonisieren

- **Ziel:** Doppelte Inhalte ohne URL-Bruch reduzieren.
- **Schritte:** Interne Consumer auf kanonischen Pfad aktualisieren; Redirect oder Alias prüfen; erst dann geschützte Dateien entfernen oder umbenennen.
- **Erwartetes Verhalten:** Alte öffentliche URLs bleiben erreichbar oder als Datei erhalten.
- **Abbruch/Rückfall:** HTTP-Status, Inhaltstyp oder Consumer-Abweichung stellt alte Datei und Referenz wieder her.

### L4 — Bilanz/Rückfall prüfen

- **Ziel:** Ergebnis, Schutz und Rückweg belegen.
- **Schritte:** Inventur wiederholen, eingesparte Bytes je Gruppe erfassen, alte und neue URLs prüfen, Rückfallliste führen.
- **Erwartetes Verhalten:** Bilanz nennt nur tatsächlich entfernte Byte-Duplikate.
- **Abbruch/Rückfall:** Eine ungeschützte URL setzt nur ihre Gruppe zurück.

## 4 — 5-Stufen-Abschlussprüfung

1. npm run typecheck ohne Fehler.
2. npm test ohne Fehlschlag.
3. npm run lint ohne Errors.
4. npm run build erfolgreich.
5. npm run check-duplication, Hash-Baseline nach L4, HTTP-Prüfung alter und neuer bearbeiteter URLs und git diff --check sind grün.
