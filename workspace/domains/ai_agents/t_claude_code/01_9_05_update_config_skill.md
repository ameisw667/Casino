# 01.9.5 — `update-config`-Skill-Verfügbarkeit (Unterkategorie #5): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🟡 Bewertung + Plan 15 teilausgeführt (L0/L1 2026-09-14; echter Kontroll-Lauf L2 = Jan-Gate) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Der Skill als Automatisierungs-Vehikel für Hook-/settings.json-Konfiguration — Nutzung, Integration und Erprobungsstand. Nicht: die aktiven Hooks selbst ([01_9_01](01_9_01_pre_post_tool_use_hooks.md) / [01_9_03](01_9_03_notification_stop_hooks.md)).
>
> **Pflicht-Vorprüfung (Duplizierungs-Check, Grep im Ordner 2026-09-14):** Keine Datei bewertet den Skill-Nutzungsstand — `01_9_hooks.md` Position 5 ist die einzige Bewertung; `01_2_skills.md` nennt den Skill nicht. Belegquelle: Skill-Liste der laufenden Session (2026-09-14: „update-config — Use this skill to configure the Claude Code harness via settings.json … Automated behaviors … require hooks configured in settings.json").

## Kernaussage

Der Skill existiert nachweislich (Session-Skill-Liste 2026-09-14) und ist für genau diese Kategorie gebaut — wurde aber **0× aufgerufen**. Plan 15 (L0/L1, 2026-09-14) hat die Erprobung vorbereitet: der Skill ist als **Harness-Built-in** identifiziert (keine lokale Skill-Datei, keine Plugin-Definition — Audit §6.1) und der Übungsfall (no-op-Übungs-Hook als JSON-Draft, reversibel, ohne Settings-Schreibzugriff) ist dokumentiert; der echte Kontroll-Lauf (L2) wartet auf Jans Freigabe.

**Rechnerischer Schnitt über die 5 Positionen: (100+100+60+80+55)/5 = Top 80 %** (vorher Top 90 %) — identisch mit dem Parent-Wert in [`01_9_hooks.md`](01_9_hooks.md) Position 5.

## Kompaktübersicht

| #   | Sub-Subkategorie                                                                           | Niveau        | Befund & Beleg                                                                                                                                                                                                                                                                          | Bottleneck?            |
| :-- | ------------------------------------------------------------------------------------------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1   | Praktische Nutzung (Aufruf-Historie)                                                       | **Top 100 %** | 0 Aufrufe — belegt in [`01_9_hooks.md`](01_9_hooks.md) Anmerkung 5 („wurde nie aufgerufen"); keine Ausführung in der Session-Historie nachweisbar                                                                                                                                       | 🔴 JA                  |
| 2   | Automatisierungs-Integration (Hook-Änderungen via Skill statt manuell)                     | **Top 100 %** | Alle 4 aktiven Hooks wurden manuell in `V:\.claude\settings.json` aktiviert (2026-08-30, belegt [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md) §1) — der Weg über den Skill wurde nie genutzt                                                                       | 🔴 JA                  |
| 3   | Testlauf-Erkenntnis (Baseline durch einmaligen Lauf)                                       | **Top 60 %**  | Plan 15 L0/L1 (2026-09-14) vorbereitet: Skill-Quelle verifiziert (Harness-Built-in, Audit §6.1) + Übungsfall als JSON-Draft dokumentiert — der echte Kontroll-Lauf (L2, auch für den `fewer-permission-prompts`-Übungsfall analog) wartet auf Jan                                       | 🔴 JA (L2 = Jan-Gate)  |
| 4   | Zukunftsnutzung für weitere Hook-Konfiguration                                             | **Top 80 %**  | Capability-Spektrum dokumentiert (Hooks, Permissions, Env-Vars, Hook-Troubleshooting — Audit §6.1); reproduzierbarer Skill-Weg ist damit benannt, aber noch nie real durchlaufen — künftige Hook-Bedarfe (z. B. Unterkategorie #8 Kandidaten) warten auf Jans Aktivierungs-Entscheidung | 🔴 JA (wartet auf Jan) |
| 5   | Ersatzpfad-Abdeckung (manuelle Aktivierung dokumentiert, reproduzierbarer Skill-Weg fehlt) | **Top 55 %**  | Die manuelle Aktivierung ist belegt dokumentiert (Audit §1, 4er-Tabelle mit Matcher/Zweck/Kosten) — gemischt: als dokumentierter Ist-Pfad stark, als reproduzierbarer Standard-Weg für künftige Konfiguration fehlend                                                                   | Nein (gemischt)        |

## Bottleneck-Identifikation für die Verbesserungsplanung

Vorher 4 🔴-Bottlenecks (#1–#4) — Plan 15 L0/L1 hat #3/#4 auf Vorbereitungs-Ebene geschlossen (Skill-Quelle + Übungsfall belegt, Audit §6.1); #1/#2 bleiben (0 reale Aufrufe — der Übungsfall war bewusst nur ein Draft). Verbliebener Hebel: L2 (echter Kontroll-Lauf) = Jan-Gate. Wichtig: Die Existenz des Skills senkt die Einstiegshürde, kann den schon geschehenen ersten Schritt aber nicht mehr ersetzen (Parent-Befund „obsolet geworden" bleibt korrekt).

## Verwandte Artefakte

- [`01_9_hooks.md`](01_9_hooks.md) — Parent-Position 5 (Top 80 %, Anmerkung 5)
- [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md) — Beleg der manuellen Aktivierung + Übungsfall §6.1
- [`Planungsdateien/15_hooks_u5_update_config_skill_plan.md`](Planungsdateien/15_hooks_u5_update_config_skill_plan.md) — Planungsdatei (Teilausgeführt, L2 = Jan-Gate)
