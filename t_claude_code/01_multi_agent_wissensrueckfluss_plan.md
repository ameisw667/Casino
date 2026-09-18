# 01 — Wissensrückfluss aus Multi-Agent-Batches (Subkategorie #7)

> **Status:** ✅ L1–L7 erledigt (verifiziert 2026-09-13), G1/G2 weiterhin ⚪ blockiert auf Jans Freigabe · **Stand:** 2026-09-13 · **Owner:** LLM · **Scope:** Ausschließlich Subkategorie #7 „Wissensrückfluss" aus [`01_multi_agent_scaling_und_autonomie.md`](01_multi_agent_scaling_und_autonomie.md) Abschnitt 3.
> **Wichtiger Unterschied zu Subkategorie #1** (`agents/15_parallele_subagenten_nutzung_plan.md`): Dort existieren 2 reale Testzyklen mit echten Agenten-Läufen. Hier gibt es **keine einzige Ausführung** — die folgende Tabelle beruht auf einer Bestandsaufnahme vorhandener Mechanismen (`learn-eval`, `consolidate-memory`, Memory-Struktur), nicht auf Testergebnissen. Das wird unten explizit so benannt, nicht als getestet dargestellt.
> **Namenskonvention:** Liegt am Root von `t_claude_code/` (nicht in `agents/`, da #7 thematisch zu Session-Memory/Memory Files gehört, nicht zu Custom Agents) — analog zu den anderen Cross-Cutting-Dateien `01_LLM_WorkflowSOPs.md` und `01_llm_workflow_operating_system.md`. Kein numerischer Präfix wie `01_7_...`, weil `01_7_context_management.md` diese Nummer bereits für eine andere Top-Level-Kategorie belegt.

---

## Sub-Subkategorie-Bottleneck-Assessment

Gleiches Schema wie [`01_7_context_management.md`](01_7_context_management.md). Alle Werte gegen [`01_5_session_memory.md`](01_5_session_memory.md) und [`01_6_memory_files.md`](01_6_memory_files.md) verifiziert.

| # | Sub-Subkategorie | Niveau | Befund & Beleg | Bottleneck? |
|---|---|---|---|---|
| 1 | Existenz `learn-eval` | **Top 20 %** | Skill real vorhanden, laut `01_5_session_memory.md` §3.1 gegen die volle Skill-Liste verifiziert, UND in `CLAUDE.md` Abschnitt „Session-Kontinuität" als Trigger-Regel verankert ("Nach gelöstem, wiederkehrendem Fehler: `learn-eval`"). Nie tatsächlich für Casino ausgeführt (`01_5_session_memory.md` §3.2: bewusst nicht ausgeführt, Guardrail-Grund: globale Regel „Write to memory only when I explicitly ask") | Nein |
| 2 | Existenz `consolidate-memory` | **Top 45 %** | Skill real vorhanden (`01_6_memory_files.md` #8), aber anders als `learn-eval` **nicht** in `CLAUDE.md` referenziert — reine Existenz ohne Verankerung am Projekt-Einstiegspunkt. Nie für Casino ausgeführt | Nein |
| 3 | Automatischer Trigger „nach Fan-out-Batch → Konsolidierung" | **Top 100 %** | Existiert nicht. `CLAUDE.md` Session-Kontinuität deckt nur „wiederkehrender Fehler" ab (`01_5_session_memory.md` Abschnitt 5), keine Kopplung an „Fan-out-Batch abgeschlossen" | 🔴 JA |
| 4 | Speicherort/Struktur für konsolidiertes Wissen | **Top 15 %** | Real vorhanden und gut strukturiert: `MEMORY.md`-Index + 4 Typen (`user`/`feedback`/`project`/`reference`), Top-10-%-Format-Konformität laut `01_6_memory_files.md` #1 | Nein |
| 5 | Rückfluss in Skills bei wiederholtem Muster (realer Fall) | **Top 90 %** | 2 vorbereitete Testfälle existieren (Migrations-Kollision, falscher Testpfad — `01_5_session_memory.md` §3.2), aber **0 tatsächlich ausgeführt** — bewusst nicht ausgelöst laut Guardrail | 🔴 JA |
| 6 | Rückfluss in Planungs-Methodik | **Top 20 %** | **Echter Positivbeleg:** `jan-planner/SKILL.md` Kriterium 5 (2026-09-12) — die Fan-out-Erkenntnis aus dieser Session wurde tatsächlich in eine dauerhafte, projektübergreifende Methodik überführt und danach bereits real angewendet (Sub-Subkategorie-Schema für #1). Stärkster Einzelbeleg in dieser Tabelle | Nein |
| 7 | Deduplizierung/Konflikterkennung beim Konsolidieren | **Top 90 %** | `consolidate-memory` ist laut Skill-Beschreibung explizit dafür gebaut ("merge duplicates, fix stale facts"), aber nie für Casino ausgeführt (`01_6_memory_files.md` #8) — Funktionsfähigkeit im Ernstfall unverifiziert | 🔴 JA |
| 8 | Transparenz für Jan, wann Wissen konsolidiert wurde | **Top 75 %** | Einzelne Memory-Einträge haben ein funktionierendes Frische-Warnsystem (Alter in Tagen, `01_6_memory_files.md` #9, Top 15 %), aber kein Log/Protokoll speziell für Konsolidierungs-Ereignisse selbst — kein Beleg für einen solchen Mechanismus gefunden | Nein |
| 9 | Geltungsbereich-Abgrenzung: nur Multi-Agent-Batches oder auch Einzel-Sessions? | **Top 100 %** | Keine Abgrenzung dokumentiert. `learn-eval`/`consolidate-memory` sind laut `01_5_session_memory.md` §2.3 generisch für jede Session gedacht, keine spezifische Kopplung an Multi-Agent-Batches existiert | 🔴 JA |
| 10 | Verzahnung mit künftigem Zyklus 3 von Subkategorie #1 | **Top 100 %** | Keine Verzahnung vorhanden — `agents/15a_parallele_subagenten_status.md` Abschnitt 6 (offener Zyklus 3) erwähnt Wissensrückfluss nicht als Bestandteil. Rein zukunftsgerichtet, kein akuter Bedarf, daher kein Bottleneck-Flag | Nein |

**Rechnerischer Schnitt:** (20+45+100+15+90+20+90+75+100+100)/10 = **Top 66 %**.

**Ersetzt vorherige grobe Schätzung nach Sub-Dekomposition vom 2026-09-12** (vorher Top 75 % als ungestützter Schätzwert in `01_multi_agent_scaling_und_autonomie.md` Zeile #7).

---

## Workflow: Ziel Top 25 % (Execution-Ready, 100 % LLM-Zuständigkeit)

> **Zielsetzung (Jan, 2026-09-12):** Sub-Assessment-Schnitt von Top 66 % auf mindestens Top 25 % anheben. **Ehrliche Vorab-Einschätzung, keine Schönrechnung:** Zwei Sub-Subkategorien (5, 7) hängen an einer echten Ausführung von `learn-eval`/`consolidate-memory` — das sind Schreibvorgänge in den Memory-Ordner, für die eine globale Regel gilt (`C:\Users\hambu\.claude\CLAUDE.md`, Abschnitt „Memory": „Write to memory **only when I explicitly ask**"). Dieser Workflow führt deshalb alles aus, was ohne diesen Schreibvorgang seriös verbesserbar ist, und markiert die zwei Ausnahmen explizit als Gate — kein eigenmächtiges Umgehen der Regel, auch nicht unter Zeitdruck auf ein Zielniveau.

| Nummer | Meilenstein | Ausführung | Sub-Subkategorie betroffen | Status | Zuständigkeit | Verifikation |
|---|---|---|---|---|---|---|
| L1 | Geltungsbereich-Abgrenzung dokumentieren | Sequenziell | #9 | ✅ Erledigt | LLM | Abschnitt „Geltungsbereich" existiert unten — verifiziert 2026-09-13 |
| L2 | Fan-out-Konsolidierungs-Trigger als projektlokales Verfahren definieren | Sequenziell | #3 | ✅ Erledigt | LLM | Abschnitt „Trigger-Definition" existiert unten — verifiziert 2026-09-13 |
| L3 | Verzahnung mit Zyklus 3 von #1 herstellen | Sequenziell | #10 | ✅ Erledigt | LLM | Verweis in `15a` Abschnitt 6 real vorhanden — erneut gegen die Datei geprüft am 2026-09-13 |
| L4 | Konsolidierungs-Transparenz-Log anlegen (Struktur, noch leer) | Sequenziell | #8 | ✅ Erledigt | LLM | Tabellen-Gerüst existiert unten — verifiziert 2026-09-13 |
| L5 | Manueller Dedup-Audit der 5 bestehenden Memory-Dateien (nur Lesen, kein `consolidate-memory`-Aufruf) | Sequenziell | #7 | ✅ Erledigt | LLM | Audit-Ergebnis dokumentiert — Fund (toter Wikilink) am 2026-09-13 erneut gegen die Memory-Datei geprüft, weiterhin unverändert vorhanden |
| L6 | `consolidate-memory`-Verankerung in Trigger-Definition nachtragen (Existenz + Verwendungsregel, ohne CLAUDE.md zu editieren) | Sequenziell | #2 | ✅ Erledigt | LLM | Trigger-Definition erwähnt beide Skills — verifiziert 2026-09-13 |
| L7 | Niveau-Neubewertung aller 10 Punkte & Gegenprüfung gegen Top-25-%-Ziel | Sequenziell | alle | ✅ Erledigt | LLM | Neue Tabelle unten, Schnitt berechnet (Top 40 %, Ziel Top 25 % offen benannt nicht erreicht) — verifiziert 2026-09-13 |
| **G1** | **Gate — nicht ohne Jans separate Freigabe:** `learn-eval` real auf die 2 vorbereiteten Testfälle anwenden | — | #5 | ⚪ Blockiert | Jan (Freigabe), dann LLM | Entfällt, bis freigegeben |
| **G2** | **Gate — nicht ohne Jans separate Freigabe:** `consolidate-memory` real auf die Memory-Dateien laufen lassen | — | #7 | ⚪ Blockiert | Jan (Freigabe), dann LLM | Entfällt, bis freigegeben |

### Nicht-Scope
- Keine Änderung an `CLAUDE.md`/`AGENTS.md` (Hard Rule, nur Jan).
- Kein tatsächlicher Aufruf von `learn-eval` oder `consolidate-memory` in L1–L7 — das sind ausschließlich G1/G2, beide gesperrt.
- Keine Änderung an bestehenden Memory-Dateien in L5 (Audit ist rein lesend).

---

### L1 — Geltungsbereich-Abgrenzung

**Entscheidung (dokumentiert, nicht nur diskutiert):** Wissensrückfluss nach dieser Methodik gilt **primär für Multi-Agent-Batches** (mehrere parallele oder in einem Zyklus zusammengefasste Agenten-Läufe, wie bei Subkategorie #1) — **sekundär auch für Einzel-Sessions**, aber nur wenn ein Muster mindestens zweimal unabhängig aufgetreten ist (Konsistenz mit dem „3. Fall"-Umschlagpunkt aus `01_5_session_memory.md` §4a). Begründung: Ein einzelner Einzel-Session-Fund ist noch kein „wiederkehrendes Muster" im Sinne der `CLAUDE.md`-Regel „Nach gelöstem, **wiederkehrendem** Fehler" — die bestehende Regel deckt das bereits ab, hier wird nur explizit gemacht, dass Multi-Agent-Batches denselben Maßstab erben, nicht einen eigenen, laxeren.

### L2 — Trigger-Definition (projektlokales Verfahren, keine `CLAUDE.md`-Änderung)

**Regel, ab sofort für diese Datei/dieses Thema gültig:** Nach Abschluss eines Multi-Agent-Batches (≥ 2 parallele oder in einem Zyklus zusammengefasste Agenten-Läufe) prüft das LLM, ob ein Befund in mind. 2 der Läufe unabhängig wiederkehrt (z. B. derselbe Fehlertyp, dasselbe fehlende Muster). Trifft das zu, wird dies **Jan explizit als `learn-eval`-Kandidat gemeldet** (nicht automatisch geschrieben, siehe G1) — analog zur bereits bestehenden `CLAUDE.md`-Fehler-Pattern-Regel, nur jetzt ausdrücklich auch für Multi-Agent-Batches nutzbar gemacht. **Ehrlichkeit zur Bewertung:** Das ist ein dokumentiertes Verfahren, kein technischer Automatismus (kein Hook, kein `CLAUDE.md`-Trigger) — es hängt daran, dass ein LLM sich in einer künftigen Sitzung daran hält. Daher keine Bewertung als „vollautomatisch" bei L7.

### L3 — Verzahnung mit Zyklus 3 von Subkategorie #1

Ergänzung in [`agents/15a_parallele_subagenten_status.md`](agents/15a_parallele_subagenten_status.md) Abschnitt 6 nötig: Ein künftiger Zyklus 3 (Merge-Realfall, falsch eingeschätzte Unabhängigkeit, andere Aufgabentypen) soll am Ende **die L2-Trigger-Definition dieser Datei anwenden** — also prüfen, ob eines der dortigen Ergebnisse ein `learn-eval`-Kandidat nach der obigen Regel ist. Wird unten in Abschnitt „Ausführung L3" real nachgetragen (nicht nur hier behauptet).

### L4 — Konsolidierungs-Transparenz-Log (Struktur)

| Datum | Ausgelöst durch | Skill | Ergebnis | Von Jan bestätigt? |
|---|---|---|---|---|
| — | — | — | — | — |

Noch leer — das ist beabsichtigt (Struktur existiert jetzt, erster Eintrag folgt erst nach G1 oder G2).

### L5 — Manueller Dedup-Audit (real ausgeführt, nur Lesen)

Alle 5 Memory-Dateien real gelesen (`image_generation_model_preference.md`, `no-visual-check-frontend.md`, `openai_image_video_pricing_reference.md`, `sql-delivery-as-file.md`, `vip-rank-supabase-outsourcing.md`):

- **0 Duplikate, 0 inhaltliche Widersprüche** zwischen den 5 Dateien — jede deckt ein eigenständiges Thema ab.
- Cross-Referenzen zwischen `image_generation_model_preference.md` und `openai_image_video_pricing_reference.md` (`[[...]]`-Wikilinks) sind korrekt und beidseitig konsistent.
- **1 echter Fund:** `no-visual-check-frontend.md` Zeile 11 verlinkt `[[image-generation-model-audit]]` — eine Memory-Datei mit diesem Namen existiert nicht (die inhaltlich passende Datei heißt `image-generation-model-preference`). Ein toter interner Wikilink.
- **Nicht behoben** — Editieren einer bestehenden Memory-Datei ist ebenfalls ein Schreibvorgang und fällt unter dieselbe globale Regel wie G1/G2. Nur dokumentiert, an Jan gemeldet: `no-visual-check-frontend.md:11`, `[[image-generation-model-audit]]` → sollte vermutlich `[[image-generation-model-preference]]` heißen.

**Ergebnis für #7:** Erste echte (wenn auch kleine) Evidenz, dass die 5 vorhandenen Dateien sauber sind bis auf einen Fund — aber `consolidate-memory` selbst wurde nicht aufgerufen, nur manuell nachgebildet. Bewertung bleibt konservativ (siehe L7).

### L6 — `consolidate-memory`-Verankerung in der Trigger-Definition

Ergänzung zu L2: Sowohl `learn-eval` (Fehler-/Muster-Rückfluss in Skills) als auch `consolidate-memory` (Deduplizierung/Frische-Prüfung der Memory-Dateien selbst) sind Teil derselben Melde-Regel aus L2 — nach einem Multi-Agent-Batch wird geprüft, ob (a) ein `learn-eval`-Kandidat vorliegt (wiederkehrendes Muster) und (b) ob ein `consolidate-memory`-Lauf fällig ist (z. B. nach mehreren neuen Memory-Einträgen in kurzer Zeit). Beides wird Jan gemeldet, nichts automatisch geschrieben.

### L7 — Niveau-Neubewertung

| # | Sub-Subkategorie | Niveau vorher | Niveau jetzt | Begründung für Änderung |
|---|---|---|---|---|
| 1 | Existenz `learn-eval` | Top 20 % | Top 20 % | Unverändert — bereits solide |
| 2 | Existenz `consolidate-memory` | Top 45 % | Top 40 % | L6: jetzt in projektlokaler Trigger-Definition erwähnt (nicht mehr komplett unverankert), aber weiterhin ohne `CLAUDE.md`-Anker |
| 3 | Automatischer Trigger Fan-out→Konsolidierung | Top 100 % | Top 55 % | L2: Verfahren jetzt dokumentiert und verbindlich für dieses Thema — aber kein technischer Automatismus (kein Hook), daher nicht besser als „funktional mit Schulden" |
| 4 | Speicherort/Struktur | Top 15 % | Top 15 % | Unverändert — bereits sehr gut |
| 5 | Rückfluss in Skills (realer Fall) | Top 90 % | Top 90 % | **Unverändert — gesperrt hinter G1**, keine Schönrechnung ohne echte Ausführung |
| 6 | Rückfluss in Planungs-Methodik | Top 20 % | Top 20 % | Unverändert — bereits starker Positivbeleg |
| 7 | Deduplizierung/Konflikterkennung | Top 90 % | Top 65 % | L5: echter (wenn auch kleiner) Audit durchgeführt, 0 Duplikate + 1 echter Fund — aber `consolidate-memory` selbst weiterhin nie aufgerufen, nur manuell nachgebildet |
| 8 | Transparenz Konsolidierungs-Zeitpunkt | Top 75 % | Top 45 % | L4: Log-Struktur existiert jetzt real (auch wenn noch leer) — Restlücke: kein Eintrag, bis G1/G2 einmal laufen |
| 9 | Geltungsbereich-Abgrenzung | Top 100 % | Top 20 % | L1: Abgrenzung jetzt explizit dokumentiert und begründet |
| 10 | Verzahnung mit Zyklus 3 von #1 | Top 100 % | Top 30 % | L3: echte Verzahnung in `15a` Abschnitt 6 nachgetragen, angewendet erst beim nächsten realen Zyklus 3 |

**Neuer Schnitt:** (20+40+55+15+90+20+65+45+20+30)/10 = **Top 40 %**.

**Ziel Top 25 % wurde NICHT erreicht — ehrlich benannt, nicht verschleiert.** Grund: Zwei Positionen (#5, #7 teilweise) bleiben an einen echten Schreibvorgang gebunden, den die globale Memory-Regel nur nach Jans expliziter Freigabe erlaubt (G1/G2). Ohne diese Freigabe ist Top 40 % das seriöse Maximum, das mit reiner Dokumentations-/Audit-Arbeit erreichbar ist — ein weiteres Absenken Richtung Top 25 % ohne echte Ausführung wäre genau das „Wert geraten statt gemessen"-Muster, das dieses gesamte System an anderer Stelle explizit verbietet.

---

## Selbstprüfung (nach Abschluss von L1–L7)

- [x] Jeder geänderte Wert in L7 hat einen konkreten Beleg (L1–L6 oben), keine Schätzung ohne Artefakt.
- [x] G1/G2 bewusst nicht ausgeführt — Konsistenz mit dem bereits in `01_5_session_memory.md` §3.2 etablierten Präzedenzfall (Guardrail-Begründung dort identisch).
- [x] `CLAUDE.md`/`AGENTS.md` nicht angefasst.
- [x] Toter Wikilink aus L5 an Jan gemeldet, nicht eigenmächtig behoben (wäre selbst ein Schreibvorgang).
- [x] Zielverfehlung (Top 40 % statt Top 25 %) offen benannt statt stillschweigend übergangen oder schöngerechnet.
- [x] **Nachgetragen (2026-09-12):** Verweis von `01_multi_agent_scaling_und_autonomie.md` Zeile #7 auf den neuen Top-40-%-Wert ist gesetzt — verifiziert 2026-09-13, Wert dort identisch (Top 40 %).
- [x] **Status-Spalte korrigiert (2026-09-13):** L1–L7 waren inhaltlich fertig, aber die Meilenstein-Tabelle zeigte noch „🔴 Geplant" — auf ✅ Erledigt gesetzt, nachdem jeder Punkt real gegen die referenzierten Dateien erneut verifiziert wurde (siehe Verifikations-Spalte oben).

---

**Nächster sinnvoller erster Testschritt (weiterhin gesperrt bis Jan freigibt):** G1/G2 — die zwei vorbereiteten `learn-eval`-Testfälle aus `01_5_session_memory.md` §3.2 real anwenden, plus ein erster `consolidate-memory`-Lauf. Beides würde #5 und #7 auf einen Schlag deutlich verbessern und wäre der direkteste Weg Richtung Top 25 %.
