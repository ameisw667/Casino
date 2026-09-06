# 01.3 — Custom Agents (Subagents): Subagent- & Delegations-Harness — Ist-Analyse & Action-Items

> **Umbenannt am 2026-08-30** von `01_7_subagent.md` — Vereinheitlichung der Dateinamen im Ordner auf das Schema `01_<Kategorienummer>_<Kategoriename>.md` (Kategorie 3 aus `00_claude_code_uebersicht.md`). Inhalt unverändert, nur Dateiname und Kopfzeile neu.
>
> **Status:** Geplant · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Dimension 7 aus `01_1_claude_md.md` (Ist-Niveau **Top 20 %**). Reine Analyse und Empfehlung — **keine** Änderung an `CLAUDE.md`/`AGENTS.md`, keine Änderung am Lifecycle-Status bestehender Agenten in diesem Schritt.

---

## 1 — Übersicht für Jan

| Nummer   | Meilenstein                                                  | Status                       | Nächster Schritt                                                                                                                                                                                                                                             | Zuständigkeit |
| :------- | :----------------------------------------------------------- | :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| **K7-0** | **Ist-Analyse mit Belegstellen**                             | 🟢 Executed                  | Ergebnis in Abschnitt 2.                                                                                                                                                                                                                                     | LLM           |
| **K7-1** | **Pilot-Evaluierung `casino-residue-scout` (v0.2.0, Draft)** | 🟢 Executed (mit Folgepunkt) | 10/10 ✅ (5 Fälle × 2 frische Sitzungen, Protokoll `.claude/agent-evals/11_residue_scout/runs/2026-08-30_pilot_v0_2_0.md`). **Offen:** 3 reale read-only Prüfungen nach `xx_sop/13` §4, dann Draft → Pilot.                                                  | LLM           |
| **K7-2** | **Pilot-Evaluierung `casino-code-explorer` (v0.2.0)**        | 🟢 Executed                  | 10/10 ✅, inkl. 4 realer read-only Explorationen → **Draft → Pilot** promoted am 2026-08-30 (Protokoll `.claude/agent-evals/31_casino_code_explorer/runs/2026-08-30_pilot_v0_2_0.md`).                                                                       | LLM           |
| **K7-3** | **Router-Zeilen für aktivierte Agenten vorbereiten**         | 🔴 Geplant                   | Erst nach Promotion auf Pilot/Active fällig — Textvorschlag liegt bereits vor (Abschnitt 5).                                                                                                                                                                 | LLM           |
| **K7-4** | **Entscheidungs-Stau #14/#20 re-surfacen**                   | 🟢 Executed                  | Am 2026-08-30 entschieden: #20 Release Readiness Guard gestrichen (Jan-Anweisung), #14 Design System Guardian gestrichen (LLM-Entscheidung, von Jan delegiert; Begründung in `agents/12_workflow_agent_creation.md` §2.3). Kandidaten-Datei danach gelöscht. | LLM           |
| **K7-5** | **Manuelle Übernahme in `CLAUDE.md`**                        | —                            | Entfällt als Meilenstein — folgt der bestehenden Hard Rule (Editierung nur durch Jan) und `xx_sop/13` §6.                                                                                                                                                    | —             |

---

## 1a — Kompaktübersicht (Sub-Kategorien, sortiert nach Niveau, bestes zuerst)

_Ergänzt 2026-09-05, analog zur Methodik in [`01_9_hooks.md`](01_9_hooks.md). Skala: **Top 1 % = Weltklasse**, **Top 100 % = schlechtestes Viertel**. Spaltenlogik: **Planungsdateien** = Datei, in der die Umsetzung geplant ist („—" = Planung lebt in dieser Datei selbst). **Execution** = 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant._

|  #  | Unterkategorie                                                                              |    Niveau    | Kernbefund                                                                                                                                                                                                                                                     | Planungsdateien                                                                   | Execution                                 |
| :-: | :------------------------------------------------------------------------------------------ | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- | :---------------------------------------- |
|  1  | `migration-security-guard` — vollständiger Lifecycle (Evals, CLAUDE.md-Trigger, Live-Läufe) | **Top 5 %**  | Einziger projektlokaler Agent, der den kompletten `xx_sop/13`-Zyklus durchlaufen hat: Pilot-Evaluierung dokumentiert (`.claude/agent-evals/06_migration_security_guard/runs/`), Router-Zeile unter „Supabase" in `CLAUDE.md` aktiv, mehrere belegte Live-Läufe | `.claude/agent-evals/06_migration_security_guard/`                                | 🟢 umgesetzt                              |
|  2  | Registry-/Kandidaten-Governance (Entscheidungs-Stau aufgelöst)                              | **Top 15 %** | K7-4 executed: #20 und #14 am 2026-08-30 gestrichen (Jan-Direktive bzw. delegierte LLM-Entscheidung, Begründung in `agents/12_workflow_agent_creation.md` §2.3); Entscheidungen laufen jetzt über die Registry §2 statt über eine verwaiste Kandidatentabelle  | [`agents/12_workflow_agent_creation.md`](agents/12_workflow_agent_creation.md) §2 | 🟢 umgesetzt                              |
|  3  | Trigger-Phrasen-Disziplin in Agent-YAML                                                     | **Top 15 %** | Beide Piloten tragen „Use PROACTIVELY" plus konkrete Trigger- und Do-NOT-Use-Phrasen im `description`-Feld — gleiche Disziplin wie die globalen `code-reviewer`/`security-reviewer`, ohne Neubau nötig                                                         | `.claude/agents/31_…` / `11_…`                                                    | 🟢 umgesetzt                              |
|  4  | Status-Hygiene der Agentendateien (Draft-Kennzeichnung)                                     | **Top 20 %** | Jede Agentendatei führt ihren Lifecycle-Status im Dateikopf (`xx_sop/13` §4) — der Fehlermodus „Router-Eintrag für Draft" wird dadurch strukturell verhindert (Abschnitt 2.2)                                                                                  | `xx_sop/13_workflow_agent_creation.md` §4                                         | 🟢 umgesetzt                              |
|  5  | `casino-code-explorer` — Pilot-Promotion ohne Router-Sichtbarkeit                           | **Top 30 %** | 10/10-Eval inkl. 4 realer Explorationen (K7-2), Draft → Pilot am 2026-08-30 — aber `CLAUDE.md` kennt ihn weiterhin nicht (Abschnitt 2.1), Wirkung hängt an der zufälligen Agent-Auswahl                                                                        | `.claude/agent-evals/31_casino_code_explorer/`                                    | 🟢 umgesetzt (Router 🔵 offen, K7-3)      |
|  6  | `casino-residue-scout` — Abschlussprüfungen vor Pilot                                       | **Top 35 %** | Eval 10/10 (5 Fälle × 2 frische Sitzungen, K7-1), aber der explizite Folgepunkt „3 reale read-only Prüfungen nach `xx_sop/13` §4, dann Draft → Pilot" ist offen                                                                                                | `.claude/agent-evals/11_residue_scout/`                                           | 🟡 Eval erfüllt, 3 Realprüfungen 🔵 offen |
|  7  | Router-Sichtbarkeit der eigenen Agenten in `CLAUDE.md` (K7-3)                               | **Top 45 %** | `CLAUDE.md` verweist nur auf `migration-security-guard`; beide Piloten sind unsichtbar für den Fast-Path. Zieltext liegt fertig vor (Abschnitt 5) — übernehmbar erst nach #6                                                                                   | — (diese Datei, Abschnitt 5 = Zielzustand)                                        | 🔵 geplant (wartet auf #6)                |

**Rechnerischer Schnitt:** (5+15+15+20+30+35+45)/7 ≈ **Top 24 %**.

_Abgrenzung zum Kopf der Datei („Ist-Niveau Top 20 %", Stand 2026-08-29): Der Schnitt hat sich durch die am 2026-08-30 ausgeführten Meilensteine K7-1, K7-2 und K7-4 verbessert (Top 20 % → ≈ Top 24 %); der Hebel auf Weltklasse-Niveau liegt in #6/#7 (Abschluss residue-scout + Router-Zeilen)._

---

## 2 — Warum das Niveau aktuell nur Top 20 % ist (Ist-Analyse mit Beleg)

### 2.1 — Zwei von drei gebauten Agenten sind für `CLAUDE.md` unsichtbar

`CLAUDE.md`s einziger Subagent-Bezug ist eine Zeile unter „## Supabase": `@migration-security-guard als read-only Review ausführen`. Tatsächlich existieren im Repo **drei** projektlokale Agenten (`.claude/agents/06_migration_security_guard.md`, `11_residue_scout.md`, `31_casino_code_explorer.md`). Die beiden letzteren tauchen in `CLAUDE.md` **nirgends** auf — weder im On-Demand-Router noch sonst. Eine frische Sitzung, die nur `CLAUDE.md` als Einstiegspunkt liest (der dokumentierte Fast-Path), erfährt von deren Existenz nicht, obwohl beide bereits vollständig definiert sind (YAML-Frontmatter, Trigger-Phrasen, Prompt-Defense-Baseline, Tool-Scope).

### 2.2 — Der Grund ist kein fehlender Router-Eintrag, sondern ein unvollständiger Lifecycle

Beide Kandidaten tragen im eigenen Dateikopf explizit den Status **Draft**:

- `11_residue_scout.md:24-26`: „Status per `xx_sop/13` §4: **Draft**." (Datei am 2026-08-30 von `11_cleanup_residue_finder.md` umbenannt.)
- `31_casino_code_explorer.md:22-24`: „Status per `xx_sop/13_workflow_agent_creation.md` §4: **Draft** — pilot evaluation not yet run, not mandatory-use under any SOP trigger yet."

`xx_sop/13_workflow_agent_creation.md` §4 definiert den Lifecycle unmissverständlich: **Draft = „Nicht delegieren"**. Ein Router-Eintrag in `CLAUDE.md`, der einen Draft-Agenten als verpflichtend nutzbar deklariert, würde die eigene SOP verletzen. Der reale Bottleneck ist also **nicht** „Router-Zeile fehlt", sondern: **die in §3 vorgeschriebene Pilot-Evaluierung (5 Pflichtfälle: Positiv, Negativ, Rand, Blocked, Regression, je zweimal in frischen Sitzungen) wurde für beide Agenten nie durchgeführt.** Beleg: `.claude/agent-evals/` enthält ausschließlich einen Unterordner für `06_migration_security_guard` (inkl. mehrerer dokumentierter Live-Läufe unter `runs/`); für `11_residue_scout` und `31_casino_code_explorer` existiert **kein** Eval-Ordner.

### 2.3 — Die SOP hat diesen Fehlermodus selbst vorhergesagt

`xx_sop/13_workflow_agent_creation.md:9` formuliert es explizit: „Eine Agentendatei allein ist nur auffindbar. Verbindliche Nutzung entsteht durch eine freigegebene Trigger-Regel und eine zuständige Fach-SOP." Für `migration-security-guard` wurde dieser Schritt vollständig durchlaufen (Pilot-Evaluierung dokumentiert, Trigger-Zeile in `CLAUDE.md` vorhanden). Für die beiden anderen Agenten wurde nur die Definitionsphase (§2) abgeschlossen, die Evaluierungsphase (§3) und damit die Aktivierungsvoraussetzung für §4/§6 fehlt.

### 2.4 — Zwei bewertete Kandidaten hängen unentschieden

> **Aufgelöst am 2026-08-30:** #20 Release Readiness Guard wurde auf Jans Direktive gestrichen, #14 Design System Guardian per an Jan delegierter LLM-Entscheidung (Begründung: `t_claude_code/agents/12_workflow_agent_creation.md` §2.3). Die Kandidaten-Datei wurde anschließend gelöscht; die ursprüngliche Analyse unten bleibt als Ist-Beleg stehen.

`t_claude_code/agents/11_agenten_kandidaten_evaluation.md` bewertete zusätzlich „Release Readiness Guard" (#20, Aufwand Mittel, Impact Hoch) und „Design System Guardian" (#14, Aufwand Hoch, Impact Mittel) — beide mit leerer „Deine Entscheidung"-Spalte seit der Ersterstellung. Es gab keinen wiederkehrenden Trigger, der diese offene Entscheidung gegenüber Jan erneut sichtbar macht.

### 2.5 — Kein projektweites „Wann proaktiv delegieren"-Signal am Entscheidungspunkt

Global verfügbare Agenten wie `code-reviewer` oder `security-reviewer` tragen die Phrase „Use PROACTIVELY" / „MUST BE USED" direkt in ihrer Typ-Beschreibung. Casinos eigene Agenten (`casino-residue-scout`, `casino-code-explorer`) tragen dieselbe Disziplin bereits in ihrem YAML-`description`-Feld — das ist vorbildlich und muss nicht neu gebaut werden. Es fehlt lediglich die Brücke: `CLAUDE.md` selbst, der Ort, an dem eine Sitzung tatsächlich plant, verweist an keiner Stelle auf diese Trigger-Phrasen, sodass sie nur wirken, wenn die Agent-Auswahl-Logik sie zufällig selbst aus dem globalen Katalog zieht.

---

## 3 — Zielarchitektur: Wie das grundsätzlich behoben wird

**Prinzip:** Erst SOP-konform aktivieren, dann sichtbar machen — nicht umgekehrt. Ein Router-Eintrag für einen Draft-Agenten wäre ein Etikettenschwindel gegenüber der eigenen SOP.

1. Für beide Draft-Agenten die in `xx_sop/13` §3 vorgeschriebenen 5 Fallarten erstellen und gegen den jeweiligen Agenten laufen lassen (analog zum bereits vorhandenen Muster in `.claude/agent-evals/06_migration_security_guard/`).
2. Erst nach bestandener Pilot-Evaluierung (Status-Wechsel Draft → Pilot laut §4) wird die passende Router-Zeile in `CLAUDE.md` vorbereitet — als „beratend" (Pilot) oder „verpflichtend" (Active), nie als Draft.
3. ~~Der Entscheidungs-Stau bei #14/#20 wird nicht durch eine neue `CLAUDE.md`-Regel gelöst (das würde Prozess-Minutiae in die Kerndatei tragen, Widerspruch zu Dimension 1/2), sondern durch eine wiederkehrende Erinnerungspflicht der LLM bei jeder Aktualisierung der Kandidatentabelle selbst.~~ **Obsolete:** Die Kandidaten-Datei wurde am 2026-08-30 gelöscht; Entscheidungen über neue/gestrichene Agenten laufen jetzt über die Registry in `t_claude_code/agents/12_workflow_agent_creation.md` §2.

---

## 4 — Action-Items (ausschließlich LLM-seitig)

|  #  | Action-Item                                                                                                                                                                              | Konkretes Ergebnis                                                                                                                       |        Status         | Zuständigkeit |
| :-: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :-------------------: | :-----------: |
|  1  | 5 Testfälle (Positiv/Negativ/Rand/Blocked/Regression) für `casino-residue-scout` unter `.claude/agent-evals/11_residue_scout/` anlegen                                                   | Fixture-Dateien + erwarteter Status je Fall                                                                                              |      🔴 Geplant       |      LLM      |
|  2  | `casino-residue-scout` in 2 frischen Sitzungen gegen alle 5 Fälle laufen lassen, Ergebnis in `runs/` protokollieren                                                                      | Zwei Laufprotokolle, Status-Vergleich                                                                                                    |      🔴 Geplant       |      LLM      |
|  3  | 5 Testfälle für `casino-code-explorer` unter `.claude/agent-evals/31_casino_code_explorer/` anlegen (Report-Format statt PASS/FINDING/BLOCKED, siehe `xx_sop/13` §2 Punkt 5)             | Fixture-Dateien + erwartetes Rechercheergebnis je Fall                                                                                   |      🔴 Geplant       |      LLM      |
|  4  | `casino-code-explorer` analog zu #2 evaluieren                                                                                                                                           | Zwei Laufprotokolle                                                                                                                      |      🔴 Geplant       |      LLM      |
|  5  | Bei bestandener Evaluierung: Versionskopf beider Agenten von „Draft" auf „Pilot" bzw. „Active" aktualisieren (`xx_sop/13` §4/§5)                                                         | Aktualisierte Frontmatter/Statuszeile in beiden `.claude/agents/*.md`                                                                    |      🔴 Geplant       |      LLM      |
|  6  | Router-Zeilen-Vorschlag für `CLAUDE.md` erst nach #5 final formulieren (Entwurf für Pilot-Status siehe Abschnitt 5, muss nach Promotion ggf. auf „Active"-Formulierung angepasst werden) | Fertiger Vorschlagstext                                                                                                                  | 🟢 Executed (Entwurf) |      LLM      |
|  7  | ~~In `t_claude_code/agents/11_agenten_kandidaten_evaluation.md` einen Hinweis ergänzen, dass #14/#20 seit 2026-08-24 unentschieden sind…~~                                               | **Obsolet:** Datei am 2026-08-30 gelöscht; #20/#14 sind entschieden (s. K7-4, Begründung in `agents/12_workflow_agent_creation.md` §2.3) |      🟢 Obsolet       |      LLM      |

---

## 5 — Empfehlung für `CLAUDE.md` (zum manuellen Vergleich durch Jan)

**Ersetzt:** die bestehende Router-Tabelle unter der Überschrift `## Workflows & SOPs (On-Demand Router)` — konkret wird nur die Zeile zu „Migration Security Review" um zwei neue Zeilen ergänzt, der Rest der Tabelle bleibt unverändert.

**Wichtiger Hinweis für Jan:** Dieser Vorschlag ist **erst nach Abschluss von Action-Item 1–5** (Pilot-Evaluierung bestanden) sinnvoll übernehmbar. Würde er heute unverändert eingefügt, würde `CLAUDE.md` zwei Draft-Agenten fälschlich als nutzbar deklarieren — ein Verstoß gegen die eigene `xx_sop/13` §4. Der Vorschlag ist daher als **Zielzustand nach K7-1/K7-2**, nicht als sofort übernehmbarer Text zu lesen.

**Vorschlag (Zielzustand, Formulierung für Pilot-Status — bei Active entsprechend anpassen):**

```markdown
| Trigger / Aufgabe                              | SOP / Agent                                                                                       | Wann einlesen / aktivieren                                                                                                                    |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **Migration Security Review**                  | Subagent: `@migration-security-guard` (`.claude/agents/06_...`)                                   | Read-only Pflicht-Review bei allen Änderungen unter `supabase/migrations/**`.                                                                 |
| **Bestandscode-Recherche vor Umbau**           | Subagent: `@casino-code-explorer` (`.claude/agents/31_...`, Status: Pilot — beratend, kein Zwang) | Vor Änderungen an bestehenden Game-, Wallet-, API- oder Store-Features: Ausführungspfad nachvollziehen, bevor neuer Code entsteht.            |
| **Aufräumprüfung nach Schwellenwert-Löschung** | Subagent: `@casino-residue-scout` (`.claude/agents/11_...`, Status: Pilot — beratend, kein Zwang) | Nach Löschung von ≥3 Dateien, einer ganzen Komponente/Route, einem Migrations-Drop, einem archivierten Plan oder einer entfernten Dependency. |
```

---

## 6 — Selbstprüfung (nach `xx_sop/03` §4 und `xx_sop/12`)

- [x] Empfehlung widerspricht nicht der bestehenden `xx_sop/13`-Lifecycle-Regel (Draft = nicht delegieren) — Router-Vorschlag ist explizit als Zielzustand nach Promotion markiert, nicht als sofort einfügbar.
- [x] Jede Statusbehauptung (Draft/Active) ist mit Datei- und Zeilenbeleg unterlegt.
- [x] Keine Zuständigkeit liegt bei Jan außer der bereits bestehenden Hard Rule und der in `xx_sop/13` §6 ohnehin verankerten Ausnahme („Jan übernimmt nur den vorbereiteten Einzeiler").
- [x] Kein Widerspruch zu `xx_sop/13` §5a (keine überschreibende Neuinterpretation einer früheren Entscheidung ohne Kennzeichnung).
- [x] Diese Datei ist für eine neue LLM-Konversation ohne weiteren Kontext verständlich.
