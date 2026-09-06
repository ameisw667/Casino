# 01.9 — Hooks & Automatisierungs-Trigger: Sub-Kategorie-Aufschlüsselung

> Stand: **2026-08-30** — Erstaufschlüsselung von Kategorie **9 „Hooks & Automatisierungs-Trigger"** aus `00_claude_code_uebersicht.md` in 8 einzeln bewertete Unterkategorien (bewusst < 10, siehe Hinweis unten). Skala: **Top 1 % = Weltklasse**, **Top 100 % = schlechtestes Viertel**.
> **Aktualisierung 2026-09-05:** Der unten beschriebene Ist-Stand „0 konfigurierte Hooks" ist **überholt** — seit dem 2026-08-30 sind **4 Hooks aktiv** (1× `PreToolUse`, 1× `PostToolUse`, 2× `Stop`, verifiziert in der globalen `settings.json`; Details und Herkunft: [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md)). Kernaussage, Tabelle und Schnitt wurden entsprechend nachbewertet.

## Wichtigste Begriffsklärung zuerst

„Hooks" im Sinne dieser Kategorie bedeutet ausschließlich **Claude-Code-Hooks** — Ereignis-Trigger, die in `settings.json`/`settings.local.json` unter einem `hooks`-Schlüssel definiert werden (z. B. `PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`) und die Claude Code selbst ausführt. Das ist bewusst **nicht** dasselbe wie `.husky/pre-commit` — das ist ein **Git-Hook**, ein völlig anderer Mechanismus (läuft bei `git commit`, unabhängig davon ob Claude Code überhaupt involviert ist) und bereits ausführlich in `01_4_command_workflow.md` Abschnitt 2.4 dokumentiert. Diese Vermischung war in `01_1_claude_md.md` Dimension 6 implizit vorhanden („Pre-Commit-Verhalten dokumentieren" als Command-Dimension) — hier wird sie sauber getrennt.

## Kernaussage für Jan

**Stand 2026-08-30:** Es existierte kein einziger konfigurierter Claude-Code-Hook — der niedrigste Ist-Stand aller 10 Kategorien. **Stand 2026-09-05:** Dies ist überholt — **4 Hooks sind aktiv** (verifiziert in der globalen `settings.json`, Auswahl aus dem ECC-Bestand am 2026-08-30): `pre:config-protection`, `post:edit:design-quality-check`, `stop:format-typecheck`, `stop:check-console-log`. 24 weitere Hook-Definitionen liegen unverbunden in `hooks.json` (49,8 KB Totlast, 0 Token/0 Ausführung). `SessionStart`/`SessionEnd` bleibt weiterhin ungenutzt — der in Position 2 dokumentierte Handoff-Anwendungsfall wird nach wie vor nur durch die `CLAUDE.md`-Prosa-Regel abgedeckt.

**Rechnerischer Schnitt über alle 8 Positionen (nachbewertet 2026-09-05): ≈ Top 68 %.**

## Kompaktübersicht (sortiert nach Niveau, bestes zuerst)

_Spaltenlogik (ergänzt 2026-09-05, einheitlich für `01_1`–`01_10`):_ **Planungsdateien** = Datei, in der die Umsetzung geplant ist („—" = Planung lebt in dieser Datei selbst). **Execution** = 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant.

| #   | Unterkategorie                                                 | Niveau       | Kernbefund                                                                                                                                                                                                                                                                                      | Planungsdateien                                                                        | Execution                                              |
| --- | -------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 4   | Abgrenzung zu Git-Hooks (Husky)                                | **Top 20 %** | Als eigener Automatisierungs-Layer real vorhanden und bereits dokumentiert (`01_4_command_workflow.md` 2.4) — zählt aber mit 0 % Anteil zu „Claude-Code-Hooks", da kategorial verschieden                                                                                                       | [`01_4_command_workflow.md`](01_4_command_workflow.md) §2.4                            | 🟡 dokumentiert ✓, Doku-Zielort `xx_docs/02` 🔵 offen  |
| 1   | `PreToolUse`/`PostToolUse`-Hooks                               | **Top 35 %** | **Jetzt aktiv:** `pre:config-protection` (blockt Config-Abschwächungen) und `post:edit:design-quality-check` (Anti-Template-Warnung) — ausgewählt aus dem ECC-Bestand, nicht selbst geschrieben                                                                                                 | [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md)                     | 🟢 umgesetzt (aus ECC-Bestand aktiviert)               |
| 3   | `Notification`-/`Stop`-Hooks                                   | **Top 40 %** | **Jetzt aktiv:** 2 Stop-Hooks (`stop:format-typecheck`, `stop:check-console-log`) bei jeder Antwortende — größter Latenzfaktor, aber bewusst gewählt (automatisiert Jans lint/typecheck-Pflicht)                                                                                                | [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md)                     | 🟢 umgesetzt (Latenz-Option dokumentiert)              |
| 8   | Dokumentierter Hook-Bedarf/Kandidaten                          | **Top 75 %** | Der Migrations-Hook-Kandidat (PreToolUse-Reminder für `supabase/migrations/**`) wurde nie ausformuliert — dafür existiert jetzt mit `hooks/01` eine belegte Bedarfs-/Nicht-Bedarfs-Dokumentation des 28er-Bestands                                                                              | [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md) (🟡 wartet auf Jan) | 🟡 teilweise (Nicht-Aktivieren-Empfehlungen belegt)    |
| 5   | `update-config`-Skill-Verfügbarkeit                            | **Top 90 %** | Skill zur Hook-Konfiguration existiert nachweislich in der aktuellen Skill-Liste („Use this skill to configure the Claude Code harness via settings.json") — wurde nie aufgerufen; die Aktivierung vom 2026-08-30 erfolgte manuell, der Skill ist damit für den ersten Schritt obsolet geworden | —                                                                                      | 🟢 überholt durch manuelle Aktivierung                 |
| 6   | `fewer-permission-prompts`-Skill als Automatisierungs-Vorstufe | **Top 90 %** | Skill zum Scannen von Transkripten und Generieren einer Permission-Allowlist existiert, wurde nie für Casino ausgeführt — hätte vermutlich einen Teil der in `01_10_permissions.md` gefundenen Allow-List-Unordnung verhindert                                                                  | [`01_10_permissions.md`](01_10_permissions.md)                                         | 🔵 geplant (Prio 4 in `01_10`)                         |
| 2   | `SessionStart`/`SessionEnd`-Hooks                              | **Top 95 %** | Weiterhin 0 — betrifft genau den Anwendungsfall, den `01_5_session_memory.md` Abschnitt 2.1/2.2 als fehlendes „Handoff-Protokoll" beschreibt; ein `SessionStart`-Hook wäre die technisch robusteste Lösung dafür, wurde aber nie erwogen                                                        | [`01_9_hooks.md`](01_9_hooks.md) Prio-1-Zeile                                          | ⚪ nicht geplant (mit `01_5` §4a zusammen entscheiden) |
| 7   | Cron-/Scheduled-Task-Automatisierung                           | **Top 95 %** | `mcp__scheduled-tasks__*`-Werkzeuge sind technisch verfügbar, 0 aktive geplante Jobs für Casino nachweisbar (kein Artefakt/Dokumentation dazu im Repo)                                                                                                                                          | —                                                                                      | ⚪ nicht geplant (kein konkreter Anwendungsfall)       |

**Rechnerischer Schnitt (nachbewertet):** (20+35+40+75+90+90+95+95)/8 = **Top 68 %** (vorher Top 86–93 % bei 0 konfigurierten Hooks; die Aktivierung der 4 Hooks verbessert #1/#3 deutlich, #2/#7 bleiben unverändert bei Top 95 %).

## Detailanmerkungen

### 1/2/3 — Die drei Kern-Hook-Typen (nachbewertet 2026-09-05)

Ursprünglich je Top 100 % (0 konfiguriert) — jetzt: #1 Top 35 % und #3 Top 40 % durch die 4 am 2026-08-30 aktivierten Hooks (Verifizierung und Laufzeit-Kostenanalyse: [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md)). Am relevantesten bleibt Position 2 (`SessionStart`/`SessionEnd`, weiterhin 0): `01_5_session_memory.md` beschreibt bereits ausführlich, dass `CLAUDE.md` kein Protokoll für Sitzungsübergänge hatte — die seitdem übernommene Prosa-Regel („Session-Kontinuität") deckt den Trigger ab, aber ein `SessionStart`-Hook wäre die technisch zuverlässigere Alternative (ein Hook feuert garantiert, eine `CLAUDE.md`-Anweisung hängt von der Befolgung durch das Modell ab) — sollte zusammen mit Jans A/B/C-Entscheidung in `01_5_session_memory.md` §4a betrachtet werden, nicht isoliert.

### 4 — Abgrenzung zu Git-Hooks/Husky (Top 20 %)

`.husky/pre-commit` (bereits in `01_4_command_workflow.md` 2.4 mit drei Prüfungen dokumentiert: Migrations-Kollisions-Check, `gitleaks protect --staged`, `lint-staged`) ist ein exzellent funktionierender Automatisierungs-Layer — nur eben kein Claude-Code-Hook. Die Top-20-%-Note bewertet ihn als eigenständigen Git-Automation-Layer, nicht als Teil dieser Kategorie; er wird hier nur der Vollständigkeit halber aufgeführt, damit kein Leser annimmt, „Automatisierung" fehle im Projekt komplett.

### 5 — `update-config`-Skill (Top 90 %)

Der Skill ist explizit für genau diese Kategorie gebaut („Automated behaviors … require hooks configured in settings.json — the harness executes these, not Claude, so memory/preferences cannot fulfill them"). Seine bloße Existenz senkt die Einstiegshürde für einen ersten Hook erheblich — trotzdem 0 Nutzung bisher.

### 6 — `fewer-permission-prompts`-Skill (Top 90 %)

Thematisch an der Schnittstelle zu Kategorie 10 (Permissions): Der Skill „Scan your transcripts for common read-only Bash and MCP tool calls, then add a prioritized allowlist" hätte vermutlich einen Teil der in `01_10_permissions.md` dokumentierten unstrukturierten Allow-Liste verhindert oder aufgeräumt, wurde aber nie ausgeführt.

### 7 — Cron-/Scheduled-Task-Automatisierung (Top 95 %)

`mcp__scheduled-tasks__*` (create/list/update/delete) ist als Werkzeug verfügbar — ein technisch naheliegender Kandidat für z. B. eine wiederkehrende Erinnerung an die in `01_3_custom_agents.md` Abschnitt 2.4 beschriebene unentschiedene Kandidaten-Frage. 0 Belege für eine tatsächlich angelegte Casino-bezogene Aufgabe.

### 8 — Dokumentierter Hook-Bedarf (Top 75 %, nachbewertet 2026-09-05)

Ursprünglich Top 95 % (kein notierter Hook-Kandidat): `00_claude_code_uebersicht.md` Zeile 24 nennt nur ein illustratives Beispiel („vor jedem Werkzeug-Aufruf erst X prüfen"). Besser geworden durch [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md) — dort ist der gesamte 28er-Bestand belegt dokumentiert, inkl. bewusster Nicht-Aktivieren-Empfehlungen (`pre:bash:dispatcher`, `stop:desktop-notify`, `governance-capture`). Immer noch offen (der Grund, warum es nicht besser als Top 75 % ist): der konkrete Migrations-Hook-Vorschlag (ein `PreToolUse`-Hook, der bei `Write`/`Edit` auf `supabase/migrations/**` automatisch an die `migration-security-guard`-Pflichtprüfung erinnert) wurde nie ausformuliert.

## Empfohlene Bearbeitungsreihenfolge

| Prio | Unterkategorie                                                                              | Warum zuerst/danach                                                                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | #2 `SessionStart`-Hook als robustere Alternative zur Session-Kontinuität-Prosa-Regel prüfen | Größter belegter Bedarf, direkt an `01_5_session_memory.md` Abschnitt 4a (Options-Gate) anschließbar — sollte zusammen mit Jans dortiger A/B/C-Entscheidung betrachtet werden, nicht isoliert |
| 2    | #8 Konkreten Migrations-Hook-Vorschlag ausformulieren                                       | Nutzt den bereits in `CLAUDE.md` etablierten `migration-security-guard`-Trigger, macht ihn nur zuverlässiger statt neu zu erfinden                                                            |
| 3    | #5/#6 `update-config` und `fewer-permission-prompts` einmalig testweise laufen lassen       | Kostenlos (Tools existieren bereits), liefert erste Baseline                                                                                                                                  |
| 4    | #7 Scheduled-Task-Bedarf prüfen                                                             | Nur sinnvoll, sobald ein konkreter wiederkehrender Anwendungsfall benannt ist (z. B. #14/#20-Entscheidungs-Reminder aus `01_3_custom_agents.md`)                                              |
| 5    | #1, #3                                                                                      | Kein aktuell belegter Bedarf — nicht priorisieren, nur der Vollständigkeit halber weiter beobachten                                                                                           |

## Verwandte Artefakte

| Bedarf                                                                            | Datei                                                                |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Git-Hook-Dokumentation (Husky, kategorial getrennt)                               | [`01_4_command_workflow.md`](01_4_command_workflow.md) Abschnitt 2.4 |
| Session-Handoff-Bedarf, der ein `SessionStart`-Hook lösen könnte                  | [`01_5_session_memory.md`](01_5_session_memory.md)                   |
| Permission-Allowlist-Unordnung, die `fewer-permission-prompts` adressieren könnte | [`01_10_permissions.md`](01_10_permissions.md)                       |
