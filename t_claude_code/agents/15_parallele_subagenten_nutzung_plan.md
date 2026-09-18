# 15 — Parallele Subagenten-Nutzung: Planungsdatei (Subkategorie #1)

> **Status:** 🟢 Execution-Ready · **Stand:** 2026-09-12 (Zyklus 1+2 abgeschlossen, restrukturiert auf Required Minimum) · **Owner:** LLM (Jan nur bei Freigabe neuer Zyklen) · **Scope:** Ausschließlich Subkategorie #1 „Parallele Subagenten-Nutzung" aus [`../01_multi_agent_scaling_und_autonomie.md`](../01_multi_agent_scaling_und_autonomie.md) Abschnitt 3 — nicht die anderen 8 Punkte dieser Datei.
> **Einordnung:** Lern-Planungsdatei im Sinne von `t_claude_code/`, keine Produkt-Planungsdatei nach `xx_sop/03_workflow_jan_planungsdateien.md`.
> **Vollständige Historie/Log:** [`15a_parallele_subagenten_status.md`](15a_parallele_subagenten_status.md) — dort steht jeder Meilenstein, jedes Datum, jeder Beleg. Diese Datei dupliziert das nicht mehr, sondern verweist nur noch darauf.

---

## 1 — Was ist das überhaupt?

Konzept, Faustregeln und Unabhängigkeits-Check stehen vollständig in [`../01_multi_agent_scaling_und_autonomie.md`](../01_multi_agent_scaling_und_autonomie.md) Abschnitt 2 — hier nicht erneut ausführen. Kurzfassung: Statt Teilaufgaben nacheinander abzuarbeiten, startet ein `Agent`-Aufruf mehrere Agenten gleichzeitig in einer Antwort, jeweils mit eigenem Kontext, gefolgt von einem Merge-Schritt.

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien
- Konzeptmodell & Faustregeln: [`../01_multi_agent_scaling_und_autonomie.md`](../01_multi_agent_scaling_und_autonomie.md) Abschnitt 2 (Unabhängigkeits-Check) und Abschnitt 3b (Ist/Danach für Punkt #1)
- Vollständige Test-Historie (Zyklus 1+2, alle Belege): [`15a_parallele_subagenten_status.md`](15a_parallele_subagenten_status.md)
- Formalisierte Fan-out-Markierung für künftige Planungsdateien: `jan-planner/SKILL.md` Kriterium 5 (global) und [`../../xx_sop/03_workflow_jan_planungsdateien.md`](../../xx_sop/03_workflow_jan_planungsdateien.md) (Casino-Adapter)

### 2.2 Systemregeln & Invarianten (gelten für jeden künftigen Zyklus)
- **Kein Money-Pfad, keine Migrationen, keine `src/lib/casino/`-Bereiche** in dieser Übungsreihe — bleiben laut `CLAUDE.md` ohnehin unter strengeren Regeln, unabhängig vom Parallelisierungs-Thema.
- Jeder parallele Lauf wird mit dem `Agent`-Tool ausgeführt: mehrere Aufrufe **in derselben Antwort** (nicht nacheinander in getrennten Antworten — das wäre wieder sequenziell).
- Schreibzugriffe sind seit Zyklus 2 erlaubt, aber jeder Agent bleibt strikt auf seinen zugewiesenen, unabhängigen Bereich beschränkt (Unabhängigkeits-Check vor jedem neuen Zyklus erneut anwenden, nicht nur einmalig).
- **Aufwands-Schwelle vor jedem neuen Zyklus prüfen (Kriterium 6, `jan-planner/SKILL.md` Ebene 2):** Ein Fan-out-Cluster nur bilden, wenn die Gesamtaufgabe sequenziell ~45 Min. überschreitet UND jede Teilaufgabe für sich ~10 Min. überschreitet. Diese Datei selbst ist der konkrete Ort, an dem bisherige Fan-out-Entscheidungen (Zyklus 1/2) ad hoc getroffen wurden, bevor Kriterium 6 existierte — siehe Kalibrierung in Abschnitt 3.

### 2.3 Nicht-Scope
- Keine Bewertung/Umsetzung der anderen 8 Subkategorien aus der Hauptdatei (Teams/Multi-Session, Merge-Strategie, Redundanz, etc.) — jede bekommt bei Bedarf ihre eigene Planungsdatei.
- Kein automatischer Rückschluss „parallel ist immer besser" — jede Messung bleibt ehrlich, auch ein negatives Ergebnis ist gültig.

---

## 3 — Bisherige Zyklen (Kurzverweis — Details ausschließlich in `15a`)

| Zyklus | Meilensteine | Ergebnis in 1 Satz | Vollständiger Beleg | Kalibrierung an Kriterium 6 (nachträglich, 2026-09-13) |
|---|---|---|---|---|
| 1 | L0–L4 | 3 read-only Agenten, 0 Widersprüche, 1 realer Fund behoben, Niveau Top 100 % → Top 55 % | [`15a`](15a_parallele_subagenten_status.md) Abschnitt 2, Zeilen L0–L4 | **Erfüllt Kriterium 6:** 3 ganze `T_*/`-Ordner mit jeweils mehreren Dateien (deutlich über ~10 Min. je Teilaufgabe), Gesamtprüfung sequenziell klar über ~45 Min. |
| 2 | L5–L7 | 5 schreibende Agenten, 9 reale Fixes, 0 Scope-Verletzungen (git-verifiziert), Niveau Top 55 % → Top 35 % | [`15a`](15a_parallele_subagenten_status.md) Abschnitt 2, Zeilen L5–L7 | **Erfüllt Kriterium 6:** 5 ganze `T_*/`-Ordner, je mehrere Dateien und reale Fixes (über ~10 Min. je Teilaufgabe), Gesamtaufgabe sequenziell deutlich über ~45 Min. |

---

## 4 — Sub-Subkategorie-Bottleneck-Assessment für Subkategorie #1 selbst

Gleiches Schema wie [`../01_7_context_management.md`](../01_7_context_management.md): maximal 10 Sub-Subkategorien, jeweils mit Beleg. Alle Werte gegen [`15a_parallele_subagenten_status.md`](15a_parallele_subagenten_status.md) verifiziert, keine Schätzung ohne Beleg.

| # | Sub-Subkategorie | Niveau | Befund & Beleg | Bottleneck? |
|---|---|---|---|---|
| 1 | Read-only Fan-out | **Top 15 %** | Zyklus 1: 3 Agenten, 0 Widersprüche — vollständig funktionsfähig für diesen Fall, keine offenen Sicherheitsfragen (siehe `15a` L1/L2) | Nein |
| 2 | Schreibender Fan-out | **Top 30 %** | Zyklus 2: 5 Agenten, 9 reale Fixes, 0 Scope-Verletzungen git-verifiziert (siehe `15a` L5) | Nein |
| 3 | Skalierung auf >3 Agenten gleichzeitig | **Top 30 %** | Nur 1× mit 5 Agenten getestet (Zyklus 2, `15a` L5) — funktioniert, aber einziger Datenpunkt | Nein |
| 4 | Merge-Konflikt unter Realbedingungen | **Top 100 %** | Nie erlebt — 2× nur Abwesenheit bestätigt (`15a` L2, L6), nie eine tatsächliche Konfliktlösung getestet | 🔴 JA |
| 5 | Fallback bei falsch eingeschätzter Unabhängigkeit | **Top 100 %** | Nie getestet — nur Fälle mit tatsächlicher Unabhängigkeit geprüft (`15a` Abschnitt 6) | 🔴 JA |
| 6 | Aufgabentyp-Diversität | **Top 65 %** (korrigiert von vorgeschlagenen Top 85 % — siehe Begründung oben in der Chat-Antwort: passt zur Bänder-Definition „Eingeschränkt", nicht „Kritisch") | Bisher ausschließlich Link-/Doku-Prüfung getestet (`15a` L1, L5), kein Code-Task, keine externe Recherche parallel | 🔴 JA |
| 7 | Automatischer Trigger ohne Jans expliziten Anstoß | **Top 100 %** | Existiert nicht — jeder Zyklus brauchte manuelle Freigabe (`15a` Abschnitt 4, Entscheidungs-Log) | 🔴 JA |
| 8 | Verzahnung mit Autonomie-Stufenmodell (#3 der Hauptdatei) | **Top 100 %** | Stufenmodell existiert nicht (Hauptdatei #3), damit auch keine Verzahnung möglich | 🔴 JA |
| 9 | Dokumentierte Wiederverwendbarkeit (`jan-planner` Kriterium 5) | **Top 30 %** | Fan-out-Markierung seit 2026-09-12 im Planungs-Workflow verankert (`jan-planner`/`xx_sop/03`), aber noch nie in einem echten Plan angewendet | Nein |
| 10 | Token-/Kosten-Transparenz pro Fan-out-Einsatz | **Top 90 %** | Kein einziger Fan-out-Lauf wurde je auf tatsächlichen Tokenverbrauch gemessen — betrifft Jans eigentliches Ausgangsziel (Tokendurchsatz), bisher nur qualitativ, nie quantitativ belegt | Nein |

**Rechnerischer Schnitt:** (15+30+30+100+100+65+100+100+30+90)/10 = **Top 66 %**.

### Abgleich mit dem Top-35-%-Wert in der Hauptdatei — Abweichung erklärt, nicht überschrieben

Der Sub-Assessment-Schnitt (**Top 66 %**) ist deutlich schlechter als der holistische Wert in `01_multi_agent_scaling_und_autonomie.md` Zeile #1 (**Top 35 %**). Das ist kein Widerspruch, sondern eine Methodenlücke, die hiermit sichtbar gemacht wird:

- Der Top-35-%-Wert in der Hauptdatei ist eine **einzelne, bänder-basierte Gesamteinschätzung** ("funktional mit technischen Schulden"), die die Restlücken (Merge-Realfall, Fallback, Aufgabentyp-Diversität, Trigger, Autonomie-Verzahnung) nur als Fließtext nennt, ohne sie einzeln zu gewichten.
- Die Sub-Dekomposition hier zeigt: **4 von 10 Sub-Subkategorien stehen bei Top 100 %** (Merge-Realfall, Fallback, Trigger, Autonomie-Verzahnung) — das sind vollständig ungetestete Bereiche, kein Randproblem.
- **Diese Datei überschreibt den Top-35-%-Wert in der Hauptdatei NICHT.** Beide Zahlen bleiben nebeneinander stehen: Top 35 % = grobe Gesamteinschätzung, Top 66 % = feingranulare Sub-Analyse. Wer nur die Hauptdatei liest, unterschätzt tendenziell, wie viel bei #1 noch offen ist — genau deshalb existiert diese Tabelle jetzt als Ergänzung, nicht als Ersatz.

---

## 5 — Lifecycle

`Execution-Ready` (laufend) → Zyklus 1 ✅ (2026-09-09) → Zyklus 2 ✅ (2026-09-12) → Zyklus 3 offen (siehe [`15a`](15a_parallele_subagenten_status.md) Abschnitt 6: Merge-Realfall, falsch eingeschätzte Unabhängigkeit, andere Aufgabentypen — deckt sich mit den 🔴-JA-Zeilen aus Abschnitt 4 dieser Datei). Verbleibt dauerhaft in `t_claude_code/agents/` als Referenz (kein Archivierungs-Fall wie bei `worldmap/`-Plänen).

**Nächster Schritt:** Wartet auf Jans Entscheidung, welche der 5 🔴-JA-Sub-Subkategorien (Merge-Realfall, Fallback, Aufgabentyp-Diversität, Trigger, Autonomie-Verzahnung) als Zyklus 3 angegangen wird.
