# 15a — Parallele Subagenten-Nutzung: Live-Status & Checklisten

> **Zweck:** Reine Status-Übersicht für Jan — analog zu `worldmap/00_WORLDMAP_STATUS.md`, aber für dieses eine Lernthema. Zeigt jederzeit auf einen Blick, wo im Prozess wir stehen, ohne die Planungsdatei erneut lesen zu müssen. Diese Datei wird nach jedem Meilenstein aktualisiert — die Planungsdatei selbst (`15_parallele_subagenten_nutzung_plan.md`) bleibt unverändert, solange sich nur der Status ändert.
> **Zugehörige Planungsdatei:** [`15_parallele_subagenten_nutzung_plan.md`](15_parallele_subagenten_nutzung_plan.md)
> **Zugehörige Bewertungsdatei:** [`../01_multi_agent_scaling_und_autonomie.md`](../01_multi_agent_scaling_und_autonomie.md) Abschnitt 3, Zeile #1
> **Zuletzt aktualisiert:** 2026-09-09

---

## 1 — Status auf einen Blick

| | |
|---|---|
| **Aktueller Meilenstein** | ✅ Zyklus 2 abgeschlossen (L5–L7) |
| **Gesamtfortschritt** | Zyklus 1 (L0–L4) ✅ · Zyklus 2 (L5–L7) ✅ |
| **Niveau bei Start (Hauptdatei)** | Top 100 % |
| **Niveau aktuell** | **Top 35 %** (zurückgeschrieben 2026-09-12, siehe Hauptdatei Abschnitt 3, Zeile #1) |
| **Blockiert durch** | Nichts — 2 Zyklen abgeschlossen, offen ist ein möglicher Zyklus 3 (siehe Abschnitt 6, aktualisiert) |

---

## 2 — Meilenstein-Checkliste

| # | Meilenstein | Status | Datum | Ergebnis (Kurzfassung) |
|---|---|---|---|---|
| L0 | Konzept verstanden | ✅ Erledigt | 2026-09-09 | Jan hat Konzept (sequenziell vs. parallel, Unabhängigkeits-Check) durchgesprochen, keine offenen Fragen |
| L1 | Erster risikoarmer Testlauf (3 parallele read-only Agenten) | ✅ Erledigt | 2026-09-09 | 3 Agenten (`T_DATABASE`, `T_API`, `T_SECURITY_HARDENING`) liefen gleichzeitig in einer Antwort. 1 realer Fund: toter Link in `T_SECURITY_HARDENING/04_security_hardening.md:151`. Keine Widersprüche zwischen den drei Agenten. |
| L2 | Auswertung sequenziell vs. parallel | ✅ Erledigt | 2026-09-09 | Fazit: **hat sich gelohnt.** Kein Merge-Aufwand nötig, da Domänen wirklich unabhängig waren — bestätigt den Unabhängigkeits-Check als korrektes Vorab-Kriterium. |
| L3 | Skalierungstest (optional, nur bei positivem L2) | ⚪ Übersprungen | 2026-09-09 | Jan hat direkt zu L4 freigegeben statt L3 auszuführen — bewusste Entscheidung, kein Fehlschlag |
| L4 | Niveau-Neubewertung & Rückschreiben in Hauptdatei | ✅ Erledigt | 2026-09-09 | Niveau von Top 100 % auf **Top 55 %** korrigiert; Gesamtschnitt der Hauptdatei von Top 83 % auf Top 78 % aktualisiert; zusätzlich 1 realer toter Link außerhalb des ursprünglichen Scopes behoben (`T_SECURITY_HARDENING/04_security_hardening.md:151`) |
| L5 | Zyklus 2: Schreibender Testlauf mit 5 parallelen Agenten | ✅ Erledigt | 2026-09-12 | 5 Agenten (`T_FRONTEND`, `T_IMAGE`, `T_MCP`, `T_RATE_LIMITING_ABUSE_PREVENTION`, `T_CLI`), je strikt auf eigenen Ordner beschränkt. 9 echte tote Links gefunden und behoben, 1 Fall korrekt unverändert gelassen (fehlende Zieldatei, keine sichere Korrektur möglich). Scope-Disziplin per `git status` verifiziert — keine Überschreitung. |
| L6 | Zyklus 2: Merge-Realfall-Suche | ✅ Erledigt | 2026-09-12 | 0 Widersprüche zwischen den 5 Ergebnissen — zweites Mal in Folge kein Merge-Konflikt, obwohl `T_MCP` und `T_CLI` gegenseitig aufeinander verweisen. |
| L7 | Zyklus 2: Niveau-Neubewertung & Rückschreiben | ✅ Erledigt | 2026-09-12 | Niveau von Top 55 % auf **Top 35 %** korrigiert; Gesamtschnitt der Hauptdatei von Top 72 % auf Top 70 % aktualisiert. |

---

## 3 — Benchmark-Tabelle (wird mit echten Zahlen aus L1/L2 gefüllt)

| Kennzahl | Sequenziell (geschätzt) | Parallel (gemessen) | Delta | Beleg |
|---|---|---|---|---|
| Wanduhrzeit für 3 Recherchen (Zyklus 1) | 3 separate Antwort-Turns (geschätzt) | 1 Antwort-Turn (alle 3 Agenten gleichzeitig gestartet) | ~3× schneller in Turns, keine Sekunden-Messung möglich | Zyklus 1, 2026-09-09 |
| Ergebnis-Widersprüche zwischen Agenten (Zyklus 1) | entfällt | 0 Widersprüche | — | Zyklus 1 |
| Gefühlte Ergebnistiefe pro Teilaufgabe | — | Hoch — jeder Agent lieferte konkrete Datei+Zeile-Belege statt Vermutungen | — | Zyklus 1 & 2 |
| Ungeplanter Merge-Aufwand nötig? (Ja/Nein) | entfällt | **Nein** (2× bestätigt) | — | Zyklus 1 & 2 |
| Schreibzugriffe parallel möglich? (Zyklus 2) | ungetestet | **Ja** — 9 reale Fixes über 5 Agenten, 0 Scope-Verletzungen (git-verifiziert) | — | Zyklus 2, 2026-09-12 |
| Skalierung auf 5 statt 3 Agenten (Zyklus 2) | ungetestet | Keine Qualitätseinbuße, keine höhere Auswertungslast spürbar | — | Zyklus 2, 2026-09-12 |
| Konservatives Verhalten bei Unsicherheit (Zyklus 2) | ungetestet | 1 Agent hat einen unsicheren Fix korrekt verweigert statt zu raten | — | Zyklus 2, 2026-09-12 |

---

## 4 — Entscheidungs-Log (nur Jan-Freigaben, keine Diskussion)

| Datum | Entscheidung |
|---|---|
| 2026-09-09 | Thema "Parallele Subagenten-Nutzung" als erste Subkategorie zum Angehen gewählt |
| 2026-09-09 | Planungsdatei `15_parallele_subagenten_nutzung_plan.md` freigegeben |
| 2026-09-09 | Start von L1 freigegeben |
| 2026-09-09 | L3 (Skalierungstest) übersprungen, direkt zu L4 |
| 2026-09-09 | Zusätzlicher Fund (toter Link) zur Behebung freigegeben, obwohl außerhalb des ursprünglichen L1/L2-Nicht-Scopes |
| 2026-09-12 | Zyklus 2 freigegeben: Schreibzugriffe, Skalierung auf 5 Agenten, Merge-Realfall-Suche |

---

## 5 — Wie diese Datei zu lesen ist

- **Abschnitt 1** reicht für den schnellen Blick "wo stehen wir gerade".
- **Abschnitt 2** ist die Checkliste — wird nach jedem abgeschlossenen Meilenstein mit Datum und Kurzergebnis gefüllt.
- **Abschnitt 3** füllt sich erst mit echten Werten, sobald L1/L2 Daten liefern — bis dahin sind die Striche (`—`) beabsichtigt, kein Fehler.
- Diese Datei ersetzt nicht die Planungsdatei — dort steht das *Wie*, hier steht das *Wo stehen wir gerade*.

---

## 6 — Offen für einen möglichen Zyklus 3

Zyklus 1 (read-only, 3 Agenten) und Zyklus 2 (schreibend, 5 Agenten) haben beide funktioniert, 0 Merge-Konflikte in Summe 8 Agenten-Läufen. Noch ungetestet und damit Grund, warum Subkategorie #1 nicht höher als Top 35 % bewertet wurde:
- **Ein tatsächlicher Merge-Konflikt-Fall** — bisher 0 Widersprüche in 2 Zyklen erlebt, das ist ermutigend, aber noch kein Beweis, dass die Merge-Strategie (#4) bei einem echten Konflikt auch greift, da sie noch nie unter Realbedingungen gebraucht wurde
- **Ein Fall mit absichtlich falsch eingeschätzter Unabhängigkeit** — bisher wurden nur Aufgaben getestet, die tatsächlich unabhängig waren; nie beobachtet, was passiert, wenn die Einschätzung falsch war
- **Andere Aufgabentypen als Link-/Doku-Prüfung** — z. B. Code-Refactoring, Tests schreiben, oder Recherche mit externen Quellen parallel
- **Formales Autonomie-Stufenmodell (#3 der Hauptdatei)** — weiterhin nicht vorhanden; bisher hat jeder Zyklus Jans expliziten Anstoß gebraucht

**Verzahnung mit Wissensrückfluss (ergänzt 2026-09-12, siehe [`../01_multi_agent_wissensrueckfluss_plan.md`](../01_multi_agent_wissensrueckfluss_plan.md) L3):** Ein künftiger Zyklus 3 soll am Ende prüfen, ob eines der Ergebnisse (Merge-Realfall, falsch eingeschätzte Unabhängigkeit, neuer Aufgabentyp) nach der dort in L2 definierten Trigger-Regel ein `learn-eval`-Kandidat ist — also ob sich ein Befund unabhängig in mind. 2 Läufen wiederholt. Falls ja: Jan explizit melden, nicht automatisch schreiben (siehe G1/G2 dort).

Kein aktueller Auftrag — nur Gedächtnisstütze für den nächsten Anlauf.
