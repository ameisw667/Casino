# 12 — Hooks U2: `SessionStart`/`SessionEnd`-Entscheidung vorbereiten (Unterkategorie #2)

> **Status:** Teilausgeführt (L0 = Jan-Gate, **eigenständig** — Rest wartet auf Jans Hook-Entscheidung) · **Stand:** 2026-09-14 (Entkopplung 2026-09-17) · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Die SessionStart-/SessionEnd-Entscheidung herbeiführen und je Ausgang den belegten Stand dokumentieren; keine Hook-Aktivierung ohne Jan-Freigabe. _Korrektur 2026-09-17: Die frühere Kopplung an das A/B/C-Gate ist **nicht belegt** — [`../01_5_05_fehler_taxonomie_governance.md`](../01_5_05_fehler_taxonomie_governance.md) enthält 0 Treffer für `SessionStart` (Grep 2026-09-17); das A/B/C-Gate betrifft nur den Ablageort wiederkehrender Fehler-Muster. Die Frage liegt eigenständig als **E7** in [`../00_offene_jan_entscheidungen.md`](../00_offene_jan_entscheidungen.md)._
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_9_02_session_start_end_hooks.md`](../01_9_02_session_start_end_hooks.md) (Schnitt Top 95 %, 4 🔴-Bottlenecks) · Parent: [`../01_9_hooks.md`](../01_9_hooks.md) Position 2

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                                     | Scope (Dateien)                                                                 | Ausführung  | Status                      | Zuständigkeit                        | Verifikation                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------- | --------------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| L0     | Jan-Gate: Entscheidung „`SessionStart`/`SessionEnd`-Hook ja/nein" (**eigenständig**, seit 2026-09-17 nicht mehr an das A/B/C-Gate gekoppelt) — vorgelegt in [`../00_offene_jan_entscheidungen.md`](../00_offene_jan_entscheidungen.md) **E7**                   | `../00_offene_jan_entscheidungen.md` (Präsentation, kein Options-Gate-Duplikat) | Sequenziell | 🔴 Geplant (wartet auf Jan) | Jan (Entscheidung) → LLM (Umsetzung) | Entscheidung getroffen → L1 (Entwurf) oder L2 (⚪ mit Begründung) |
| L1     | Falls Entscheidung „Hook ja": konkreter Entwurf ausformulieren (Matcher `SessionStart`, Skript-Skizze, Inhalt der Start-Injektion = Handoff-Bullets) als Vorschlags-Abschnitt in `hooks/01_hooks_active_audit.md` — **kein** Edit an `V:\.claude\settings.json` | `../hooks/01_hooks_active_audit.md`                                             | Sequenziell | 🔴 Geplant                  | LLM                                  | Entwurf enthält Matcher/Skript/Verhalten/Fail-Verhalten           |
| L2     | Falls Entscheidung „kein Hook": Position als bewusst ⚪ mit Begründung dokumentieren (Prosa-Regel + Checkpoint-Handoff deckt den Trigger ab)                                                                                                                    | `../01_9_02_session_start_end_hooks.md`, `../01_9_hooks.md`                     | Sequenziell | 🔴 Geplant                  | LLM                                  | Begründung belegt (Prosa-Regel + Plan 7 Nachweis)                 |
| L3     | Niveau-Rückschreibung: `01_9_02` + Parent-Position 2 neu bewerten                                                                                                                                                                                               | `t_claude_code/01_9_02*.md`, `t_claude_code/01_9_hooks.md`                      | Sequenziell | 🔴 Geplant                  | LLM                                  | Neue Schnitt-Berechnung = Parent-Wert, nachgerechnet              |

**Fan-out-Check (Kriterium 5):** L1/L2 sind Alternativen (entscheidungsabhängig), kein unabhängiger Parallelismus — **kein Fan-out.** Gegenprobe Kriterium 6: < 45 Min. gesamt, < 10 Min. je Schritt.

## 2 — Self-Contained Kontext-Koffer

- **Ist-Stand (live 2026-09-14):** 0 `SessionStart`-/`SessionEnd`-Hooks — Grep über `V:\.claude\settings.json` (hooks-Block Zeilen 104–158) findet keinen Eintrag; kein Entwurf im Repo.
- **Anwendungsfall:** [`../01_5_session_memory.md`](../01_5_session_memory.md) §2.1/2.2 (fehlendes Handoff-Protokoll) + §4a Options-Gate (A/B/C, Entscheidung liegt bei Jan). Ein Hook feuert garantiert, die `CLAUDE.md`-Prosa-Regel hängt von der Befolgung ab.
- **Prosa-Alternative läuft inzwischen:** Baustein-E-Vorlage aktualisiert + realer Checkpoint-Handoff-Nachweis 2026-09-14 ([`Planungsdateien/07_session_oekonomie_plan.md`](07_session_oekonomie_plan.md) §2a) — der Hook-Wert hat sich dadurch relativiert, nicht eliminiert.
- **Wichtige Kopplung:** Isolierte Umsetzung (Hook bauen ohne Jans A/B/C) wäre Doppelpflege an `01_5` vorbei.

## 3 — Expliziter Nicht-Scope

- Keine Änderung an `V:\.claude\settings.json` oder `hooks.json` — der Hook-Entwurf (L1) bleibt Vorschlags-Doku bis zu Jans Freigabe.
- Keine Änderung am Options-Gate in `01_5` §4a — nur Verweis-Kopplung.
- Kein SessionEnd-Szenario-Erfinden: falls kein Aufräum-Anwendungsfall benannt wird, bleibt #2 bewusst 0.

## 4 — Lebenszyklus

`Geplant` → `Execution-Ready` (Status dieser Datei) → `In Execution` (L0 wartet auf Jans **eigenständige** Hook-Entscheidung — **E7**, entkoppelt vom A/B/C-Gate) → nach L3 `Executed (archiviert)`. Jan-Gates: L0 (Entscheidung), L1 (Vorschlag vor eventueller Aktivierung).

## 5 — Execution-Log

**2026-09-14 — L0 ausgesetzt, §4a-Verweise korrigiert:**

- L0 (ausgesetzt): Die Ziel-Datei [`../01_5_session_memory.md`](../01_5_session_memory.md) ist fremd-uncommittet (Parallel-Session, Restructure im Gange) — die Verweis-Zeile dort wurde nicht angefasst; keine Änderung an fremden uncommitteten Dateien.
- §4a-Umleitung (statt L0, eigene Dateien): Alle §4a-Referenzen in [`../01_9_02_session_start_end_hooks.md`](../01_9_02_session_start_end_hooks.md) und Parent auf die kanonische Lage nach dem 01_5-Restructure korrigiert — A/B/C-Gate jetzt in [`../01_5_05_fehler_taxonomie_governance.md`](../01_5_05_fehler_taxonomie_governance.md) + [Plan 25](25_session_u5_fehler_taxonomie_governance_plan.md).
- L1/L2/L3: nicht ausgeführt — hängen direkt an Jans A/B/C-Entscheidung (Hook ja/nein), Gate bei Jan.
- Nächster Schritt nach Freigabe: L0-Verweis-Zeile in `01_5_session_memory.md` nachholen (wenn committet), dann je Entscheidung L1 (Entwurf) oder L2 (bewusst ⚪ mit Begründung) + L3-Rückschreibung.
- **2026-09-17 — Gate vorgelegt, Kopplung aufgelöst:** Die offene Frage (Hook ja/nein) liegt eigenständig mit Optionen + Empfehlung in [`../00_offene_jan_entscheidungen.md`](../00_offene_jan_entscheidungen.md) Punkt **E7**. Befund: die hier (Zeile 39) behauptete Kopplung an das A/B/C-Gate ist **nicht belegt** — [`../01_5_05_fehler_taxonomie_governance.md`](../01_5_05_fehler_taxonomie_governance.md) enthält 0 `SessionStart`-Treffer (Grep 2026-09-17); das A/B/C-Gate regelt nur den Ablageort wiederkehrender Fehler-Muster. Korrigiert in dieser Datei (Status, L0-Zeile, Lebenszyklus) sowie in [`../01_9_02_session_start_end_hooks.md`](../01_9_02_session_start_end_hooks.md) (Status, Kernaussage, Position 4, Bottleneck, Artefakt-Liste; dort zusätzlich 2 tote `../01_5*`-Links und der stale `01_5`-§2.1/2.2-Verweis gefixt).
- **Damit entfällt der zuletzt offene Aufräumschritt aus Zeile 41** (Verweis-Zeile in `01_5_session_memory.md`): Die Präsentation des Gates braucht keinen Fremd-Datei-Eingriff mehr. L0 ist noch offen, aber ausschließlich als Jans Entscheidung.
