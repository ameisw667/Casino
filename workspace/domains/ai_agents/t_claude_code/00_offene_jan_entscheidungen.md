# Offene Jan-Entscheidungen — Warteschlange (Hooks/Session-Governance)

> **Status:** 🔴 9 Entscheidungen + 1 Nachweis offen (Stand 2026-09-17) · **Owner:** Jan (Entscheidung) / LLM (Umsetzung nach Freigabe) · **Zweck:** Alle Punkte, die aus der Hooks-Aufschlüsselung (`01_9`), der Session-Memory-Aufschlüsselung (`01_5`) und der globalen ECC-Prüfung heraus **nicht** im LLM-Scope entscheidbar sind — kompakt, mit Optionen und Empfehlung, zum Abhaken. E1–E7 + E8 gehören zur laufenden Hooks-/Session-Arbeit; E9–E10 (Anhang) sind zwei weitere im Repo-Router gefundene Jan-Gates aus parallelen, uncommitteten Dateien — nur referenziert, nicht von mir bearbeitet.

**Benutzung:** Pro Punkt eine Option ankreuzen (oder „Anders: …" ergänzen). Danach genügt ein Satz im Chat („E1: A, E2: A, E4: B, Rest später") — die Umsetzung folgt dann je Punkt nach dem jeweiligen Beleg-Plan. Nichts hier wird ohne diese Rückmeldung umgesetzt.

**Legende:** `🟢` umgesetzt · `🟡` teilweise · `🔵` geplant/wartet · `⚪` bewusst nicht geplant · `🔴` offener Bottleneck

---

## Übersicht

|    ID     | Frage                                                                                                 |             Aufwand Jan             | LLM-Empfehlung                            | Blockiert                               |
| :-------: | :---------------------------------------------------------------------------------------------------- | :---------------------------------: | :---------------------------------------- | :-------------------------------------- |
|  **E1**   | Stalen `CLAUDE.md`-Verweis (`01_8` → `01_5`) in Zeile 139 korrigieren                                 |        1 Min (Jan-only Edit)        | **Ausführen**                             | 01_5 Sub #9 (Top 90 %-Position)         |
|  **E2**   | Options-Gate A/B/C Fehler-Taxonomie auflösen (Widerspruch Plan 25 ↔ `01_5_05` **behoben 2026-09-17**) | Entscheidung, danach LLM-Ausführung | **Option A**                              | Plan 25 (L0–L3), 01_5 Sub #5 (Top 85 %) |
|  **E3**   | Neuer Hook `pre:edit:migration-reminder` aktivieren?                                                  |           1 Entscheidung            | **Ja, aktivieren**                        | 01_9 Sub #8, Plan 18 L3                 |
|  **E4**   | Permission-Allowlist einschärfen oder bewusst verzichten?                                             |           1 Entscheidung            | **B — nur `Bash(npm run *)` entschärfen** | Plan 16 L2, 01_10 #3                    |
|  **E5**   | Cron/Scheduled-Tasks: Anwendungsfall benennen oder ⚪?                                                |             1 Benennung             | **⚪ nicht geplant** (aktuell)            | Plan 17 L0–L3                           |
|  **E6**   | `update-config`-Skill einmal kontrolliert testen?                                                     |          Freigabe ja/nein           | **Ja** (Übungsfall ohne Settings-Write)   | Plan 15 L2                              |
|  **E7**   | `SessionStart`/`SessionEnd`-Hook ja/nein?                                                             |           1 Entscheidung            | **Nein (⚪)**, Begründung festschreiben   | 01_9 Sub #2 (Top 95 %), Plan 12         |
|  **E8**   | Wirksamkeits-Nachweis des 5. Hooks (`post:edit:accumulate`)                                           |            2 Min Prüfung            | **Nachweis erbringen** (kein Entscheid)   | 🟢-Umstellung der Hooks-Audit-Datei     |
| **E9** †  | Baustein E: welche der 3 Bullets (Handoff / Token-Budget / Anti-Halluzination) in `CLAUDE.md`?        |           1 Entscheidung            | **Bullet B (Token-Budget)**               | 01_1 §4, Kategorie 7 (Top 48 %)         |
| **E10** † | Read-Deny auf `src/types/database.types.ts` freigeben?                                                |          Freigabe ja/nein           | **Ja** (Dateiinhalt liegt fertig vor)     | Plan R08 L1, Kategorie „Token-Ökonomie" |

† = Gate stammt aus einer parallelen, uncommitteten Datei (fremde Sitzung) — nur referenziert, Details im [Anhang](#anhang--gates-aus-parallelen-dateien-nur-referenziert).

---

## E1 — Staler `CLAUDE.md`-Verweis (`01_8` → `01_5`)

**Fakt:** `CLAUDE.md` Zeile 139 lautet:

> - Neue Fehler-Pattern-Datei-Klasse nicht ohne Freigabe — offen in 01_8_session_memory.md §4a.

Die Datei heißt seit dem 2026-08-30 `01_5_session_memory.md`. Repo-weite Gegenprobe (2026-09-17): dies ist der **einzige** lebende Alt-Verweis im Hauptbaum — alle übrigen `01_8`-Treffer in `t_claude_code/` sind beschreibende Belege dieses Findings, keine toten Links.

**Warum offen:** `CLAUDE.md` fällt unter die Hard Rule „Edit nur durch Jan" — der Einzeiler wartet bewusst seit Wochen.

**Optionen**

- [ ] **A — Zeile 139 korrigieren** (`01_8_session_memory.md` → `01_5_session_memory.md`), sonst nichts ändern.
- [ ] **B — Zusätzlich präzisieren:** Verweis direkt auf die heutige Detail-Datei `01_5_session_memory.md` §4a bzw. nach Restructure auf `01_5_05_fehler_taxonomie_governance.md` umbiegen (prüft zugleich E2).
- [ ] **C — Nichts ändern** (Verweis bleibt als historischer Marker stehen).

**LLM-Empfehlung:** **A.** Höchster Hebel pro Aufwand im ganzen Feld: Die Position „Staler Verweis" ist mit **Top 90 %** die schlechteste Sub-Subkategorie der Kategorie Session-Memory und hängt an einer Zeile. B ist erst sinnvoll, wenn E2 entschieden ist — sonst wird der Verweis zweimal angefasst.

**Belege:** [`00_claude_code_uebersicht.md` Zeile 217](00_claude_code_uebersicht.md) · [`01_5_09_claudemd_verankerung_verweise.md`](01_5_09_claudemd_verankerung_verweise.md) §3 Punkt 1 · [`Planungsdateien/29_session_u9_claudemd_verankerung_plan.md`](Planungsdateien/29_session_u9_claudemd_verankerung_plan.md) L2

---

## E2 — Options-Gate A/B/C: Wo werden wiederkehrende Fehler-Muster abgelegt?

**Fakt:** Die Frage (A: Abschnitt in `docs/archive/00_WORLDMAP_ARCHIVLOG.md` · B: eigene 6. Artefaktklasse `INCIDENTS.md` · C: rein globales Memory) ist bewertet — **A: 3.53 · B: 3.60 · C: 2.50** —, aber nicht freigegeben. Bis dahin landen Incidents (Stash-Vorfall, Migrationskollision 049/050) als Freitext in `worldmap/00_WORLDMAP_STATUS.md`.

**Zusätzlicher Befund (2026-09-17, behoben):** Die Gate-Deklaration war widersprüchlich — [`01_5_05`](01_5_05_fehler_taxonomie_governance.md) sagte „wartet seit Wochen unentschieden auf Jans Freigabe", [`Plan 25`](Planungsdateien/25_session_u5_fehler_taxonomie_governance_plan.md) §4 dagegen „**Jan-Gates: Keine**". **Gleichgerichtet am 2026-09-17** in Richtung „Entscheidung bleibt bei Jan": Plan 25 deklariert jetzt L0 als Jan-Gate (Statuszeile, Meilenstein-Zeile, §4); `01_5_05` verweist zusätzlich auf diese Warteschlange. Die Bewertung (A: 3.53 · B: 3.60 · C: 2.50) ersetzt keine Freigabe. Offen ist nur noch die Entscheidung selbst.

**Optionen**

- [ ] **A — Abschnitt „Wiederkehrende Fehler-Muster" in `00_WORLDMAP_ARCHIVLOG.md`** (LLM-Empfehlung; Upgrade auf eigene Datei erst ab dem 3. unabhängigen Vorfall — YAGNI).
- [ ] **B — Eigene Datei `docs/archive/01_INCIDENT_REGISTER.md`** sofort (minimal höhere Bewertung, früher Strukturaufwand).
- [ ] **C — Nur globales Memory**, kein Repo-Artefakt.
- [ ] **D — Delegation:** Jan verzichtet auf die Einzel-Freigabe und überträgt die Entscheidung an den LLM → dieser setzt Option A wie in Plan 25 vorbereitet um (dann entfällt nur die Freigabe-Runde; beide Dateien bleiben auf dem jetzt gleichgerichteten Stand).

**LLM-Empfehlung:** **A.** Bei 2 bekannten Vorfällen ist eine 6. Artefaktklasse Overhead; das Register im Archivlog ist ein Ein-Zeilen-Eintrag und jederzeit hochziehbar. **D** ist zulässig und spart eine Runde, wenn Jan die Bewertung als ausreichend ansieht — dann aber ausdrücklich, damit beide Dateien denselben Stand zeigen.

**Belege:** [`01_5_05_fehler_taxonomie_governance.md`](01_5_05_fehler_taxonomie_governance.md) §1/§3 · [`Planungsdateien/25_session_u5_fehler_taxonomie_governance_plan.md`](Planungsdateien/25_session_u5_fehler_taxonomie_governance_plan.md) · [`01_5_session_memory.md`](01_5_session_memory.md) Position 5

---

## E3 — Neuer Hook `pre:edit:migration-reminder` aktivieren?

**Fakt:** Fertiger Entwurf (kein Block, nur Reminder + Exit 0): `PreToolUse` auf `Write|Edit|MultiEdit`, Pfadfilter `supabase/migrations/**`, Fail-open, Timeout 5 s. Zweck: Die Pflichtprüfung durch `migration-security-guard` wird garantiert sichtbar, statt von der Prosa-Regel in `CLAUDE.md` abzuhängen. Kein Duplikat des Husky-Pre-Commit-Guards (früh beim Edit vs. spät beim Commit). Aktivierung wäre eine `settings.json`-Änderung → braucht Jan, außerdem existiert das Skript `scripts/hooks/migration-reminder.js` noch nicht (Entwurf, kein Code).

**Optionen**

- [ ] **A — Aktivieren** (LLM baut Skript + trägt Hook ein; Backup wird angelegt).
- [ ] **B — Entwurf liegen lassen**, Aktivierung erst nach eigenem Bedarfsfall.
- [ ] **C — ⚪ verwerfen** (Prosa-Pflicht genügt).

**LLM-Empfehlung:** **A.** Der einzige projekt-spezifische Hook-Bedarf mit belegtem Nutzen; Risiko sehr niedrig (fail-open, reiner Hinweistext, kein Eingriff in den Edit). Er schließt zugleich das Top-95-%-Niveau der Unterkategorie #8.

**Belege:** [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md) §5.1/§5.2 Kandidat 1 · [`01_9_08_hook_bedarf_kandidaten.md`](01_9_08_hook_bedarf_kandidaten.md) · [`Planungsdateien/18_hooks_u8_hook_bedarf_kandidaten_plan.md`](Planungsdateien/18_hooks_u8_hook_bedarf_kandidaten_plan.md) L3

---

## E4 — Permission-Allowlist: einschärfen oder bewusst verzichten?

**Fakt:** Der `fewer-permission-prompts`-Lauf (2026-09-14) hat sein eigenes Ziel entwertet: Die globale `V:\.claude\settings.json` erlaubt bereits `Bash(*)` + `PowerShell(*)` (Blanket-Allow) — es entstehen faktisch **keine** Permission-Prompts mehr für Bash. Offen ist damit nicht „zu wenig erlaubt", sondern „zu breit erlaubt".

**Zusatz-Fund:** `.claude/settings.local.json` Zeile 32 enthält `Bash(npm run *)` — eine Task-Runner-Wildcard: beliebige npm-Scripts, inkl. `postinstall`/`design:generate`, also Code-Ausführung. Das ist der konkrete, kleine Aufräum-Kandidat.

**Optionen**

- [ ] **A — Verzicht festschreiben** (Blanket-Allow bleibt; Befund in `01_10` #3 als bewusst dokumentiert).
- [ ] **B — Nur `Bash(npm run *)` auf die read-only-Scripts einschränken** (`typecheck`, `test`, `lint`, `check-doc-links` — datengestützte Reihenfolge liegt vor).
- [ ] **C — Voll-Einschärfung** von `Bash(*)` auf feine Klassen (nutzt die Konditional-Tabelle aus dem Skill-Lauf; größter Aufwand, höchstes Regressionsrisiko).

**LLM-Empfehlung:** **B.** Die Wildcard ist die einzige Stelle mit echtem Missbrauchspotenzial und in einem 3-Zeilen-Edit entschärfbar; A und C sind beide vertretbar, aber A lässt genau das offen, was der Lauf als Risiko belegt hat. C erst, wenn tatsächlich Prompts stören.

**Belege:** [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md) §6.2 · [`01_10_permissions.md`](01_10_permissions.md) #3 · [`Planungsdateien/16_hooks_u6_fewer_permission_prompts_plan.md`](Planungsdateien/16_hooks_u6_fewer_permission_prompts_plan.md) L2

---

## E5 — Cron/Scheduled-Tasks: gibt es einen Anwendungsfall?

**Fakt:** 0 Jobs angelegt, `mcp__scheduled-tasks__*` ungenutzt. Plan 17 verlangt zuerst einen **benannten** Bedarf — ohne benannten Bedarf bewusst kein Job-Entwurf (Plan-Regel, bisher korrekt eingehalten). Denkbarer Kandidat: wiederkehrende Prüfung der Doku-Verweis-Integrität (das frühere Beispiel „Reminder auf unentschiedene Agent-Kandidaten #14/#20" ist seit 2026-08-30 kein offener Bedarf mehr — direkt entschieden statt per Reminder, s. `agents/12_workflow_agent_creation.md` §2.3). Wichtig: Jobs aus `CronCreate` sind session-lokal und enden mit der Sitzung (7-Tage-Auto-Expire bei Recurring) — für echte Daueraufgaben ist der Trigger falsch.

**Optionen**

- [ ] **A — ⚪ nicht geplant** mit Begründung („kein wiederkehrender Bedarf; Doku-Prüfung läuft anlassbezogen").
- [ ] **B — Konkreten Bedarf benennen:** ______ (dann legt der LLM einen Job-Entwurf vor, Freigabe vor Anlage).
- [ ] **C — Verweis auf externe Mechanik** (GitHub-Actions-Schedule statt Session-Cron) — falls etwas wirklich periodisch laufen soll.

**LLM-Empfehlung:** **A.** Der Befund ist nicht „fehlende Technik", sondern „fehlender Bedarf"; die Session-Lokalität macht Cron für dieses Repo strukturell schwach. Ein bewusstes ⚪ mit Begründung schließt die Unterkategorie sauber.

**Belege:** [`01_9_07_cron_scheduled_tasks.md`](01_9_07_cron_scheduled_tasks.md) · [`Planungsdateien/17_hooks_u7_cron_scheduled_tasks_plan.md`](Planungsdateien/17_hooks_u7_cron_scheduled_tasks_plan.md) L0

---

## E6 — `update-config`-Skill einmal kontrolliert testen?

**Fakt:** Der Harness-Built-in-Skill `update-config` wurde nie genutzt; es gibt keine lokale Skill-Datei (verifiziert 2026-09-14, Glob/Grep 0 Treffer). Der vorbereitete Übungsfall ist **ohne Settings-Schreibzugriff**: der Skill soll einen no-op-Übungs-Hook (PostToolUse, `echo`-only) als JSON-Snippet formulieren; Ablage als Draft in der Audit-Datei, Verifikation = nie angewendet. Was der Lauf klärt: Qualität und Format der Skill-Ausgaben (Fähigkeits-Baseline für künftige Hook-Konfigurationen).

**Optionen**

- [ ] **A — Freigeben** (Übungslauf wie beschrieben, kein Write auf `settings.json`/`settings.local.json`).
- [ ] **B — ⚪ verwerfen** (Bedarf fehlt; Hook-Änderungen laufen ohnehin über Jan-Gate).
- [ ] **C — Nur die Capability-Doku nachtragen**, ohne echten Skill-Aufruf.

**LLM-Empfehlung:** **A.** Kosten ~5 Min, Reversibilität 100 %, und der Nutzen liegt genau dort, wo in diesem Repo künftig Settings-Änderungen anfallen. Kein Risiko, solange der Übungsfall unangewendet bleibt.

**Belege:** [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md) §6.1 · [`01_9_05_update_config_skill.md`](01_9_05_update_config_skill.md) · [`Planungsdateien/15_hooks_u5_update_config_skill_plan.md`](Planungsdateien/15_hooks_u5_update_config_skill_plan.md) L2

---

## E7 — `SessionStart`/`SessionEnd`-Hook: bauen oder bewusst verzichten?

**Fakt:** 0 solcher Hooks — live verifiziert (`V:\.claude\settings.json`, hooks-Block Zeilen 104–158, kein `SessionStart`/`SessionEnd`-Eintrag), und es existiert **kein** Entwurf als Vorlage. Der Handoff-Bedarf („Start-Bullets in den Kontext injizieren") ist heute allein durch die `CLAUDE.md`-Prosa „Session-Kontinuität" abgedeckt.

**Zusätzlicher Befund (2026-09-17, behoben):** Die in `01_9_02` und Plan 12 behauptete **Kopplung an E2 existiert faktisch nicht** — `01_5_05` (heute kanonischer Ort des Gates) enthält 0 Treffer für „SessionStart". **Aufgelöst am 2026-09-17:** Beide Dateien sind entkoppelt (Status, L0-Zeile, Kernaussage, Lebenszyklus); in `01_9_02` zusätzlich 2 tote `../01_5*`-Links und ein staler `01_5`-§2.1/2.2-Verweis auf `01_5_01_session_handoff_checkpoint.md` korrigiert. Die Frage steht damit sauber eigenständig hier.

**Optionen**

- [ ] **A — ⚪ bewusst nicht geplant**, Begründung festschreiben (Prosa-Regel genügt; Hooks kosten Laufzeit und Instandhaltung).
- [ ] **B — Ja, bauen** (Entwurf: SessionStart-Hook, der die Handoff-Bullets aus `01_5`/`worldmap` in den Kontext injiziert) — mit Jan-Freigabe vor Aktivierung.
- [ ] **C — Erst Prosa schärfen** (Übergabe-Format in `CLAUDE.md` präzisieren — Jan-only Edit) und Hook-Frage später erneut stellen.

**LLM-Empfehlung:** **A** mit dem Zusatz, den toten Kopplungs-Verweis in `01_9_02` + Plan 12 auf „entkoppelt, eigenständig entschieden" zu korrigieren. Ein SessionStart-Hook hat in diesem Repo keinen belegten Anwendungsfall — dieselbe Logik wie E5. **C** ist die zweitbeste Wahl, kostet aber eine `CLAUDE.md`-Runde.

**Belege:** [`01_9_02_session_start_end_hooks.md`](01_9_02_session_start_end_hooks.md) (4×🔴, Top 95 %) · [`Planungsdateien/12_hooks_u2_session_start_end_plan.md`](Planungsdateien/12_hooks_u2_session_start_end_plan.md) L0

---

## E8 — Nachweis: wirkt der 5. Hook? (kein Entscheid, eine Prüfung)

**Fakt:** `post:edit:accumulate` wurde am 2026-09-14 mit Jan-Freigabe als 5. Hook in `V:\.claude\settings.json` eingetragen (Backup `settings.json.bak-2026-09-14`); Hooks werden beim Session-Start geladen, wirkt also **ab der ersten danach gestarteten Sitzung**. Erwartetes Signal: `%TEMP%\ecc-edited-<sessionId>.txt` existiert und enthält editierte `.ts|.tsx|.js|.jsx`-Pfade — und `stop:format-typecheck` steigt nicht mehr sofort aus (`stop-format-typecheck.js:140–143`).

**Prüfschritt (2 Min):** In einer Sitzung mit mindestens einem Code-Edit danach: `ls $env:TEMP\ecc-edited-*.txt` und `npm run typecheck` als Gegenprobe, dass der Hook-Lauf nichts blockiert.

**Optionen / Folgen**

- [ ] **A — Nachweis erbracht** → Hooks-Audit-Datei auf 🟢 umstellen, Kandidat 2 in `01_9_08` auf 🟢.
- [ ] **B — Kein Akkumulator-File trotz Code-Edit** → Finding F5 anlegen (Hook greift nicht), Aktivierung prüfen; Option 2/5 neu bewerten.

**LLM-Empfehlung:** Durchführen, sobald die nächste Sitzung einen Code-Edit enthält — die Audit-Datei wartet nur noch auf diesen Beweis, inhaltlich ist sie abgeschlossen.

**Belege:** [`hooks/01_hooks_active_audit.md`](hooks/01_hooks_active_audit.md) §2/F4, §3a · [`01_9_03_notification_stop_hooks.md`](01_9_03_notification_stop_hooks.md) Nachtrag

---

## Anhang — Gates aus parallelen Dateien (nur referenziert)

> **Herkunft:** Beide Punkte stehen in Dateien, die aktuell **fremd-uncommittete Änderungen** einer parallelen Sitzung tragen (`t_claude_code/00_claude_code_uebersicht.md`, `Planungsdateien/03a_r08_generierter_code_plan.md`). Ich habe sie **nicht** bearbeitet und **nicht** bewertet — nur aus dem Repo-Router übernommen, damit sie in dieser Warteschlange nicht untergehen. Zuständigkeit und Formulierungen bleiben beim Eigentümer dieser Dateien.

### E9 † — Baustein E: welche Bullets ziehen in `CLAUDE.md` ein?

**Fakt:** Baustein E („Session-State, Context-Budget & Model-Routing") liegt seit Plan 7 fertig vor. Die Model-Routing-Matrix ist inzwischen bereits in `CLAUDE.md` § Model-Routing verankert und aus dem Baustein herausgenommen. Offen sind nur noch 3 Bullets: **(A)** Handoff- & Checkpoint-Disziplin · **(B)** Token-/Tool-Budget · **(C)** Anti-Halluzinations-Gate.

**Optionen**

- [ ] **A** — Handoff-/Checkpoint-Bullet übernehmen.
- [ ] **B** — Token-/Tool-Budget-Bullet übernehmen.
- [ ] **C** — Anti-Halluzinations-Gate-Bullet übernehmen.
- [ ] **D — Baustein E ganz ruhen lassen** (Status quo, Kategorie bleibt bei Top 48 %).

**LLM-Empfehlung:** **B** — genau dieser Punkt ist als Bottleneck der Kategorie 7 dokumentiert („kein dokumentiertes Kontext-Budget-Protokoll in `CLAUDE.md`"). A dupliziert weithin den bereits live stehenden Abschnitt „Session-Kontinuität" (checkpoint/save-session/resume-session), C ist ohne belegten Vorfall spekulativ. **D** ist die ehrliche Alternative, wenn die Kategorie bewusst auf Prio 3 bleiben soll.

**Belege:** [`01_1_claude_md.md`](01_1_claude_md.md) §4 Baustein E + Freigabe-Vorlage (Zeile 206) · [`00_claude_code_uebersicht.md`](00_claude_code_uebersicht.md) „Offen (Jan-Gates)" ②

### E10 † — Read-Deny auf `src/types/database.types.ts` freigeben?

**Fakt:** Die Datei ist mit 2.054 Zeilen die größte generierte Datei im Repo und historisch nie handeditiert — der einzige Kandidat für eine Deny-Liste (L0 verifiziert). Der Schreibversuch auf `.claude/settings.json` (projekt-weit, neu) wurde vom Permission-Classifier abgelehnt und **bewusst nicht** umgangen. Fertiger Dateiinhalt: `{"permissions": {"deny": ["Read(src/types/database.types.ts)"]}}` — Wirkung nur auf Agent-Reads; Typecheck, Tests und Build laufen unverändert.

**Optionen**

- [ ] **A — Freigeben** (Datei anlegen; danach Probe-Read zur Verifikation, dass das Deny greift).
- [ ] **B — Nein**, Datei bleibt lesbar (Hotspot-Disziplin läuft weiter über die Slice-Regel in `CLAUDE.md`).
- [ ] **C — Anders:** Deny-Liste erweitern (z. B. weitere generierte Artefakte) — dann vorher Liste benennen.

**LLM-Empfehlung:** **A.** Der Effekt ist unmittelbar (verhindert versehentliche Voll-Reads der 2.054-Zeilen-Datei, der teuerste Einzel-Read im Repo), das Risiko klein und lokal begrenzt, und der Plan liegt seit 2026-09-14 fertig auf dem Gate. **C** erst nach dem ersten Erfahrungswert.

**Belege:** [`Planungsdateien/03a_r08_generierter_code_plan.md`](Planungsdateien/03a_r08_generierter_code_plan.md) §5 L1 · [`00_claude_code_uebersicht.md`](00_claude_code_uebersicht.md) „Offen (Jan-Gates)" ③

---

## Nicht mehr offen (bereits entschieden — nicht erneut bewerten)

| Punkt                                                       | Stand                                                                                                                                                                                                                                                    |
| :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hooks-Audit Option 1 (`hooks.json` kürzen)                  | **Geschlossen, nicht lokal lösbar** — `hooks.json` ist Merge-Ziel des ECC-Installers (`scripts/lib/install/apply.js:97`, `:114–133`); lokales Kürzen wird beim nächsten Update zurückgemergt. Aktive Hooks nachweislich nicht gefährdet. Upstream-Thema. |
| Hooks-Audit Option 2 (Stop-Hooks einschränken/deaktivieren) | **Entfällt** — bedingte Ausführung ist im Skript vorgesehen und mit Option 5 real hergestellt; kein Latenzproblem in der Ist-Konfiguration.                                                                                                              |
| Hooks-Audit Option 3 (keine weiteren Restbestand-Hooks)     | **Bestätigt** (Status quo, 2026-08-30). Gilt für `stop:desktop-notify`, `pre:bash:dispatcher`, `gateguard-fact-force`, `governance-capture`.                                                                                                             |
| Hooks-Audit Option 4 (Review-Zyklus)                        | **Eingerichtet** — 1×/Quartal, nächste Fälligkeit **2026-12-14**, 5-Punkt-Checkliste in der Audit-Datei §8.                                                                                                                                              |
| Hooks-Audit Option 5 (`post:edit:accumulate` aktivieren)    | **Ausgeführt 2026-09-14** (Jan-Freigabe) → siehe E8.                                                                                                                                                                                                     |
| Plan 11 / 13 / 14 (Unterkategorien #1, #3, #4)              | **Executed (archiviert)** — keine offenen Punkte.                                                                                                                                                                                                        |

---

## Nach der Entscheidung — was der LLM je Ausgang tut

|  ID   | Bei Freigabe                                                                            | Bei Ablehnung/Verzicht                                        |
| :---: | :-------------------------------------------------------------------------------------- | :------------------------------------------------------------ |
|  E1   | Jan editiert Zeile 139 selbst (LLM liefert den exakten Ersatz-Text)                     | nichts; Finding bleibt als 🔴 dokumentiert                    |
|  E2   | Plan 25 L0–L3 ausführen, Widerspruch in `01_5_05`/Plan 25 auflösen                      | Option C/B dokumentieren, `01_5_05` auf entschieden setzen    |
|  E3   | Skript + Hook bauen (Backup), `01_9_08` auf 🟢                                          | Entwurf bleibt 🔵 / ⚪ mit Begründung                         |
|  E4   | `settings.local.json`-Wildcard entschärfen, `01_10` #3 fortschreiben                    | Verzicht in `01_10` als bewusst eintragen                     |
|  E5   | —                                                                                       | ⚪-Eintrag mit Begründung, Plan 17 abschließen                |
|  E6   | Übungslauf ausführen, Ergebnis in §6.1 dokumentieren                                    | ⚪ mit Begründung                                             |
|  E7   | Hook-Entwurf vorlegen (Aktivierung weiter Jan-Gate)                                     | ⚪ + toten Kopplungs-Verweis in `01_9_02`/Plan 12 korrigieren |
|  E8   | Audit-Datei 🟢, `01_9_08` 🟢                                                            | Finding F5, Options-Neubewertung                              |
| E9 †  | Bullet-Text in `CLAUDE.md` einpflegen (**Jan-only Edit**) + `01_1`-Status fortschreiben | Status quo dokumentieren, Kategorie 7 bleibt Top 48 %         |
| E10 † | `.claude/settings.json` anlegen (Jan-Freigabe) + Probe-Read verifizieren                | Verzicht in Plan R08 L1 dokumentieren                         |

**Unberührt von allen Punkten:** die 10-Kategorien-Tabelle in [`00_claude_code_uebersicht.md`](00_claude_code_uebersicht.md) (Werte bleiben unverändert), `CLAUDE.md`/`AGENTS.md` (außer der ausdrücklich genannten Zeile 139 durch Jan), sowie alle fremd-uncommitteten Änderungen paralleler Sessions.
