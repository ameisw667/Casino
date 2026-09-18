# 01.9.2 — `SessionStart`/`SessionEnd`-Hooks (Unterkategorie #2): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🔵 Bewertung (Ebene 1); Plan 12 L0 = Jan-Gate (2026-09-17 **entkoppelt** — die Hook-Frage hängt nicht am A/B/C-Gate, siehe unten); §4a-Referenzen auf die Lage nach dem 01_5-Restructure korrigiert · **Stand:** 2026-09-14 (Entkopplung + Linkfix 2026-09-17) · **Owner:** LLM · **Scope:** Die beiden Sitzungs-Edge-Hook-Punkte — ob und wie sie konfiguriert sind und ob ein konkreter Entwurf existiert. Nicht: der Handoff-Bedarf selbst (kanonisch in [`../01_5_session_memory.md`](01_5_session_memory.md) / [`01_5_01_session_handoff_checkpoint.md`](01_5_01_session_handoff_checkpoint.md)) und nicht die Prosa-Alternative-Bewertung (dort Baustein E / Plan 7 Session-Ökonomie).
>
> **Pflicht-Vorprüfung (Duplizierungs-Check, Grep im Ordner 2026-09-14):** `SessionStart`-Nennungen existieren nur in `01_9_hooks.md`, `00_claude_code_uebersicht.md` und `01_5_session_memory.md` — keine Datei bewertet die Hook-Mechanik selbst. Verifizierung Live-Stand 2026-09-14: Grep über `V:\.claude\settings.json` (hooks-Block Zeilen 104–158) enthält **keinen** `SessionStart`- oder `SessionEnd`-Eintrag.

## Kernaussage

Weiterhin 0 SessionStart-/SessionEnd-Hooks — live verifiziert (2026-09-14). Auch kein Entwurf im Repo. Der einzige nicht-maximal-schlechte Aspekt: Eine bewusste Nicht-Nutzungs-Abwägung ist erst durch die Prio-1-Zeile in der Parent-Datei dokumentiert, eine echte Entscheidung fehlt.

**Entkopplung 2026-09-17 (Korrektur):** Bis hierher war die Entscheidung als „gekoppelt an Jans A/B/C-Wahl" beschrieben (kanonisch `01_5_05` + Plan 25). Diese Kopplung ist nicht belegt: [`01_5_05_fehler_taxonomie_governance.md`](01_5_05_fehler_taxonomie_governance.md) enthält **0 Treffer** für `SessionStart` (Grep 2026-09-17) — das A/B/C-Gate betrifft ausschließlich den Ablageort wiederkehrender Fehler-Muster. Die Hook-Frage ist damit **eigenständig** zu entscheiden und liegt als Punkt **E7** in [`00_offene_jan_entscheidungen.md`](00_offene_jan_entscheidungen.md).

**Rechnerischer Schnitt über die 4 Positionen: (100+100+100+80)/4 = Top 95 %** — identisch mit dem Parent-Wert in [`01_9_hooks.md`](01_9_hooks.md) Position 2.

## Kompaktübersicht

| #   | Sub-Subkategorie                                  | Niveau        | Befund & Beleg                                                                                                                                                                                                                                                                                                                                                                                                                    | Bottleneck?            |
| :-- | ------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | `SessionStart`-Hook konfiguriert                  | **Top 100 %** | 0 — Grep über `V:\.claude\settings.json` (2026-09-14) findet keinen Eintrag; der Handoff-Anwendungsfall aus [`01_5_01_session_handoff_checkpoint.md`](01_5_01_session_handoff_checkpoint.md) wird nach wie vor nur durch die `CLAUDE.md`-Prosa-Regel „Session-Kontinuität" abgedeckt                                                                                                                                              | 🔴 JA                  |
| 2   | `SessionEnd`-Hook konfiguriert                    | **Top 100 %** | 0 — derselbe Live-Beleg; kein Aufräum-/Persistenz-Szenario ist überhaupt benannt, das einen `SessionEnd`-Punkt rechtfertigen würde                                                                                                                                                                                                                                                                                                | 🔴 JA                  |
| 3   | Konkreter Hook-Entwurf (Skript/Matcher/Payload)   | **Top 100 %** | Weder im Repo noch global existiert ein Entwurf oder ein Muster (z. B. „Start-Bullets in den Kontext injizieren"), auf den ein neuer Hook aufsetzen könnte                                                                                                                                                                                                                                                                        | 🔴 JA                  |
| 4   | Bewusste Nicht-Nutzungs-Entscheidung dokumentiert | **Top 80 %**  | Der Bedarf ist als Prio 1 in [`01_9_hooks.md`](01_9_hooks.md) (Empfohlene Bearbeitungsreihenfolge) benannt und die Hook-vs-Prosa-Abwägung ist in der Parent-Datei Anmerkung 1/2 skizziert — aber eine eigentliche Entscheidung (Hook ja/nein) ist nicht getroffen. Sie ist **eigenständig** (Entkopplung vom A/B/C-Gate, 2026-09-17) und liegt als **E7** in [`00_offene_jan_entscheidungen.md`](00_offene_jan_entscheidungen.md) | 🔴 JA (wartet auf Jan) |

## Bottleneck-Identifikation für die Verbesserungsplanung

Alle 4 Positionen sind 🔴. Die Entscheidung (#4) ist der Hebel: Sobald Jans **eigenständige** Entscheidung zur Hook-Frage vorliegt (**E7**, nicht mehr an das A/B/C-Gate gekoppelt), wird #1–#3 entweder gemeinsam geschlossen (Hook gebaut) oder bewusst als ⚪ nicht geplant mit Begründung dokumentiert. Eine Entscheidung vorwegzunehmen wäre Doppelpflege an `01_5` vorbei.

## Verwandte Artefakte

- [`01_9_hooks.md`](01_9_hooks.md) — Parent-Position 2 (Top 95 %, Prio-1-Zeile)
- [`01_5_01_session_handoff_checkpoint.md`](01_5_01_session_handoff_checkpoint.md) — Handoff-Bedarf (Detail-Ebene nach dem 01_5-Restructure)
- [`00_offene_jan_entscheidungen.md`](00_offene_jan_entscheidungen.md) — Entscheidungs-Warteschlange (**E7** = diese Hook-Frage)
- [`01_5_05_fehler_taxonomie_governance.md`](01_5_05_fehler_taxonomie_governance.md) — Options-Gate A/B/C (Ablageort Fehler-Muster; **nicht** mehr Kopplungs-Grundlage dieser Frage)
- [`Planungsdateien/12_hooks_u2_session_start_end_plan.md`](Planungsdateien/12_hooks_u2_session_start_end_plan.md) — Planungsdatei (L0 = Jan-Gate, entkoppelt)
