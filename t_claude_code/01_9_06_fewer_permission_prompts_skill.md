# 01.9.6 — `fewer-permission-prompts`-Skill als Automatisierungs-Vorstufe (Unterkategorie #6): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🟡 Bewertung + Plan 16 teilausgeführt (L0/L1 2026-09-14: Skill-Lauf executed, PROPOSAL ONLY; Übernahme L2 = Jan-Gate) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Der Skill als Automatisierungs-Vorstufe zur Permission-Pflege — Ausführungs- und Integrationsstand. Nicht: die Permission-Allowlist selbst (kanonisch [`../01_10_permissions.md`](01_10_permissions.md)).
>
> **Pflicht-Vorprüfung (Duplizierungs-Check, Grep im Ordner 2026-09-14):** Der Skill-Nutzungsstand ist in [`../01_10_permissions.md`](01_10_permissions.md) Zeile 61 wörtlich belegt („wurde aber nie ausgeführt") und in der Parent-Datei Position 6 bewertet — diese Datei schlüsselt nur auf, ohne die 01_10-Bewertung zu wiederholen. Belegquelle zusätzlich: Session-Skill-Liste 2026-09-14 („fewer-permission-prompts — Scan your transcripts … add a prioritized allowlist").

## Kernaussage

Der Skill wurde am 2026-09-14 für Casino executed (Plan 16 L0: 50 Transkripte gescannt, PROPOSAL ONLY — kein Settings-Schreibzugriff). **Kernbefund des Laufs:** das Skill-Ziel (weniger Permission-Prompts) ist in der Ist-Konfiguration bereits moot — die globale `settings.json` erlaubt `Bash(*)` + `PowerShell(*)` und `mcp__playwright__*`; der datengestützte Wert liegt in der konditionalen Kandidaten-Tabelle (12 Einträge, Audit §6.2) und zwei Wildcard-Risiko-Flags (`Bash(npm run *)` in `settings.local.json:32`) für eine künftige Allowlist-Einschärfung. Die Allowlist selbst ist unverändert (Übernahme = Jan-Gate).

**Rechnerischer Schnitt über die 4 Positionen: (40+60+75+35)/4 = Top 55 %** (vorher Top 90 %) — identisch mit dem Parent-Wert in [`01_9_hooks.md`](01_9_hooks.md) Position 6.

## Kompaktübersicht

| #   | Sub-Subkategorie                                            | Niveau       | Befund & Beleg                                                                                                                                                                                                                                                                                                                 | Bottleneck?                      |
| :-- | ----------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| 1   | Einmalige Ausführung für Casino                             | **Top 40 %** | ✅ Executed (Plan 16 L0, 2026-09-14): 50 Transkripte gescannt, Frequenzanalyse, Pattern-Bildung nach Skill-Regeln — als reiner Vorschlag abgelegt (Audit §6.2), Übernahme in Settings bewusst nicht erfolgt (Nicht-Scope)                                                                                                      | 🔴 JA (Übernahme = L2, Jan-Gate) |
| 2   | Allowlist-Aufräum-Effekt                                    | **Top 60 %** | Datengestützte Grundlage jetzt belegt (12-köpfige Kandidaten-Tabelle + `npm run *`-Wildcard-Flag, Audit §6.2; Verweis-Zeile in `01_10` §8) — die Allowlist selbst existiert unverändert; die Übung zeigte zusätzlich: durch das globale `Bash(*)`-Blanket ist das Aufräum-Thema zweitrangig gegenüber der Blanket-Frage selbst | 🔴 JA (Jan-Gate)                 |
| 3   | Wiederkehrender Trigger für Permission-Pflege               | **Top 75 %** | Erstlauf belegt, aber kein eingerichteter wiederkehrender Trigger — 01_10 Prio 4 bleibt; quartalsweiser Review-Zyklus analog Audit Option 4 wäre der naheliegende Mechanismus                                                                                                                                                  | 🔴 JA                            |
| 4   | Schnittstellen-Verlinkung zu `01_10` (Ausführungs-Kopplung) | **Top 35 %** | Jetzt echte Ausführungs-Kopplung: Ergebnis-Tabelle im Audit §6.2 + Status-Update in `01_10` §8 (Verweis auf das Ergebnis) — Grundlage für die 01_10-Prio-1–4-Aufräumarbeit liegt datengestützt vor                                                                                                                             | 🔴 JA (Übernahme wartet auf Jan) |

## Bottleneck-Identifikation für die Verbesserungsplanung

Vorher alle 4 🔴 — Plan 16 L0/L1 hat #1 (Lauf executed) und #4 (Ausführungs-Kopplung) geschlossen; #2/#3 hängen am Jan-Gate L2 (Allowlist-Übernahme bzw. Review-Zyklus). Abgrenzung zu Unterkategorie #5: derselbe Mechanismustyp („Skill vorhanden"), aber anderes Zielsystem (Permissions statt Hooks) — deshalb eigenständige Unterkategorie und eigenständige Planungsdatei.

## Verwandte Artefakte

- [`01_9_hooks.md`](01_9_hooks.md) — Parent-Position 6 (Top 55 %, Anmerkung 6)
- [`../01_10_permissions.md`](01_10_permissions.md) — kanonische Permission-Bewertung (§8 mit Verweis auf das Lauf-Ergebnis, Prio 4)
- [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md) — Ergebnis des Skill-Laufs (§6.2, Kandidaten-Tabelle + Flags)
- [`Planungsdateien/16_hooks_u6_fewer_permission_prompts_plan.md`](Planungsdateien/16_hooks_u6_fewer_permission_prompts_plan.md) — Planungsdatei (Teilausgeführt, L2 = Jan-Gate)
