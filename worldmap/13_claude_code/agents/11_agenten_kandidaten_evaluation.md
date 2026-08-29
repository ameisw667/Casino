# 11 — Agenten-Kandidaten-Evaluierung

> **Status:** In Execution · **Stand:** 2026-08-24 · **Owner:** Jan + LLM · **Scope:** Auswahl und schrittweise Pilotierung von vier projektspezifischen Sub-Agenten für Casino

## 1 — Übersicht für Jan

Jan hat die ursprünglichen 30 Kandidaten geprüft und ausschließlich die vier folgenden als relevant ausgewählt. Eine **Top-15** wäre damit künstlich aufgefüllt; diese Übersicht enthält deshalb die vollständige **Top 4 von 4**. Die Reihenfolge bewertet den erwarteten Nutzen im Verhältnis zum Setup-Aufwand, nicht die technische Wichtigkeit allein.

| Rang |   # | Agentenname              | Idee                                          | Erklärung (einfach)                                                              | Warum                                                                                                                  | Nächster Schritt                                                                                            | Aufwand | Impact | Deine Entscheidung |
| ---: | --: | ------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------- | ------ | ------------------ |
|    1 |   6 | Migration Security Guard | Sicherheits-Check für jede Datenbank-Änderung | Prüft in jeder neuen Migration die Pflicht-Einstellung gegen SQL-Angriffe.       | Migration 007 erzwingt sie bereits; sie bei späteren Migrationen zu vergessen, wäre ein direkter Security-Rückschritt. | Pilot: v0.1.0 zehn Live-Fälle korrekt; v0.1.1-Revalidation nach Harness-Patch durch Claude-Quota blockiert. | Niedrig | Hoch   | ✅                 |
|    2 |  20 | Release Readiness Guard  | Deployment-Bereitschaft vor Production        | Prüft vor einer Live-Freigabe, ob Release-Gates und Nachweise vollständig sind.  | Der Ablauf ist bereits in `xx_sop/11` vorgegeben; der Agent reduziert vergessene Freigabe- oder Prüfschritte.          | Custom-Scope für Vercel-, CI- und SOP-Prüfung definieren.                                                   | Mittel  | Hoch   |                    |
|    3 |  14 | Design System Guardian   | Design-System-Review für neue Oberflächen     | Vergleicht neue UI mit dem verbindlichen „Obsidian & Gold“-System.               | Die Regeln in `xx_sop/04` sind projektspezifisch; ein Standard-Reviewer kennt sie nicht automatisch.                   | Designregeln in eine kurze, testbare Agenten-Checkliste überführen.                                         | Hoch    | Mittel |                    |
|    4 |  11 | Cleanup Residue Finder   | Verwaiste Code-Reste finden                   | Sucht nach gelöschten Komponenten nach ungenutzten Imports, Verweisen und Tests. | Nach dem Roulette-Umbau ist dies ein konkret belegter, wiederkehrender Aufräumfall.                                    | `refactor-cleaner` mit einer standardisierten Nachräum-Prüfung einsetzen.                                   | Niedrig | Mittel |                    |

**Auswahlhinweis:** #6 liefert den höchsten unmittelbaren Sicherheits-ROI und ist direkt mit einem bestehenden Typ umsetzbar. #20 ist der wichtigste Prozess-Schutz vor Production, benötigt aber eine gezielte Custom-Definition. #14 und #11 steigern langfristig Konsistenz und Wartbarkeit, sind jedoch nicht vor #6/#20 zu priorisieren.

## 2 — Zweck und Spalten-Legende

Diese Datei dokumentiert nur die vier von Jan ausgewählten Agenten. In der Spalte **„Deine Entscheidung“** kann Jan pro Zeile ✅ Ja / ❌ Nein / 🤔 Später eintragen. Nichts wird gebaut, bevor die jeweilige Zeile auf ✅ steht.

| Spalte              | Bedeutung                                                                             |
| ------------------- | ------------------------------------------------------------------------------------- |
| Agentenname         | Kurzer, übergabefähiger Name des Kandidaten (maximal vier Wörter)                     |
| Kurzbeschreibung    | Was der Agent tut — ohne Fachbegriffe, für den schnellen Überblick                    |
| Warum hier relevant | Konkreter Bezug zu echtem Code oder Regeln in diesem Repo                             |
| Agent-Typ           | Existierender Agent-Typ nutzbar, oder „Custom“ = neu zu definieren                    |
| Setup-Aufwand       | Niedrig = direkt nutzbar · Mittel = Anpassung nötig · Hoch = komplette Neu-Definition |
| Nutzungshäufigkeit  | Wie oft die Situation realistisch eintritt                                            |
| Impact              | Wie teuer ein übersehener Fehler in diesem Bereich wäre                               |
| Deine Entscheidung  | Leer zum Ausfüllen: ✅ / ❌ / 🤔                                                      |

---

## B — Datenbank & Migrationen

|   # | Agentenname              | Use Case                                           | Kurzbeschreibung                                                        | Warum hier relevant                                                         | Agent-Typ           | Setup-Aufwand | Nutzungshäufigkeit        | Impact | Deine Entscheidung |
| --: | ------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------- | ------------- | ------------------------- | ------ | ------------------ |
|   6 | Migration Security Guard | Sicherheits-Check für jede neue Datenbank-Änderung | Prüft eine technische Pflicht-Einstellung, die SQL-Angriffe verhindert. | Migration 007 erzwingt das strikt — leicht vergessen bei neuen Migrationen. | `database-reviewer` | Niedrig       | Bei jeder neuen Migration | Hoch   | ✅                 |

## C — Architektur & Code-Qualität

|   # | Agentenname            | Use Case                                                     | Kurzbeschreibung                                                 | Warum hier relevant                                                                                 | Agent-Typ          | Setup-Aufwand | Nutzungshäufigkeit            | Impact | Deine Entscheidung |
| --: | ---------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------ | ------------- | ----------------------------- | ------ | ------------------ |
|  11 | Cleanup Residue Finder | Findet verwaiste Code-Reste nach dem Löschen von Komponenten | Räumt vergessene Verweise auf, nachdem Bauteile entfernt wurden. | Gerade erst passiert: Fünf Roulette-Bauteile wurden gelöscht — mögliche Reste bleiben leicht übrig. | `refactor-cleaner` | Niedrig       | Nach jedem größeren Aufräumen | Mittel |                    |

## D — Spiele & Frontend

|   # | Agentenname            | Use Case                                               | Kurzbeschreibung                                                     | Warum hier relevant                                                                                  | Agent-Typ | Setup-Aufwand | Nutzungshäufigkeit      | Impact | Deine Entscheidung |
| --: | ---------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------- | ------------- | ----------------------- | ------ | ------------------ |
|  14 | Design System Guardian | Prüft neue Oberflächen gegen euer festes Design-System | Stellt sicher, dass sich neue Screens wie „aus einem Guss“ anfühlen. | Farben, Look & Feel sind fest in `xx_sop/04` definiert — kein Standard-Werkzeug kennt eure Vorgaben. | Custom    | Hoch          | Bei jedem neuen UI-Teil | Mittel |                    |

## F — DevOps / CI-CD

|   # | Agentenname             | Use Case                                               | Kurzbeschreibung                                            | Warum hier relevant                                                    | Agent-Typ                       | Setup-Aufwand | Nutzungshäufigkeit           | Impact | Deine Entscheidung |
| --: | ----------------------- | ------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------- | ------------- | ---------------------------- | ------ | ------------------ |
|  20 | Release Readiness Guard | Prüft Deployment-Bereitschaft vor Produktions-Freigabe | Schaut vorab, ob ein Release wahrscheinlich Probleme macht. | `xx_sop/11` verlangt genau diesen Freigabe-Prozess vor Live-Schaltung. | Custom (nutzt Vercel-Werkzeuge) | Mittel        | Vor jedem Production-Release | Hoch   |                    |

---

## 3 — Nächster Schritt

Entscheide pro Zeile mit ✅ / ❌ / 🤔. Für #6 und #11 ist ein bestehender Typ die Basis; die projektspezifische Checkliste wird erst nach ✅ ergänzt. #14 und #20 brauchen vor dem Setup eine eigene Agenten-Definition und einen abgegrenzten Prüfauftrag.
