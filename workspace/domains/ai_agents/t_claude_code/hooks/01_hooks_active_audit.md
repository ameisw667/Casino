# 01 — Load-Audit: Hooks (5 aktiv von 28 installiert) (Optionen 1–5 entschieden)

> **Status:** 🟢 Optionen entschieden (2026-09-14) — Option 5 aktiviert (Jan-Freigabe), Option 4 Verfahren eingerichtet, Option 1 nach ECC-Prüfung geschlossen, Option 2 entfällt, Option 3 = Status quo. Offen nur noch der Wirksamkeits-Nachweis des neuen Hooks ab der nächsten Session · **Stand:** 2026-09-05 (Nachtrag 2026-09-14: F4-Finding, Fail-Verhalten §4, Migrations-Hook-Entwurf + Bedarfskatalog §5, Erprobungs-Läufe §6, Empfehlungs-Stand §3a, Review-Zyklus §8, Option-5-Aktivierung §2/F4) · **Owner:** Audit = LLM, Freigabe = Jan · **Auslöser:** Fortführung des globalen ECC-Audits (`01_11` (historisches Audit)); Hooks-Aktivierung am 2026-08-30 (Protokoll `01_15`, gelöscht) — Auswahl der 4 Hooks aus dem damaligen Vorschlag.
> **Kernfakt:** Hooks kosten **keine Prompt-Token** (kein Text-Load) — ihre Last ist **Laufzeit** (Ausführung bei jedem Tool-Aufruf/Antwortende) plus Instandhaltung.

---

## 1 — Verifizierter Ist-Zustand (2026-09-05, live ausgelesen)

**Quelle 1 — `V:\.claude\hooks\hooks.json` (49,8 KB):** enthält **28 Hook-Definitionen** über 7 Lebenszyklus-Punkte. Das ist die in `01_11` als „28 installiert" gezählte Menge — Zahl damit verifiziert (die älteren Angaben „13 Definitionen"/„27" waren Zwischenstände).

**Quelle 2 — `V:\.claude\settings.json` (wirkt wirklich):** genau **4 aktive Hooks**, identisch mit der Top-Empfehlung des Gesamtaudits vom 2026-08-30:

| Aktiver Hook                     | Matcher              | Zweck                                               | Laufzeit-Kostenpunkt                             |
| :------------------------------- | :------------------- | :-------------------------------------------------- | :----------------------------------------------- |
| `pre:config-protection`          | Write/Edit/MultiEdit | Blockt Abschwächungen von Linter-/Formatter-Configs | je Edit-Aufruf (Node-Bootstrap, timeout 5 s)     |
| `post:edit:design-quality-check` | Edit/Write/MultiEdit | Warnt bei 08/15-Template-UI (Anti-Template-Regel)   | je Edit-Aufruf                                   |
| `stop:format-typecheck`          | Stop                 | Formatierung + Typecheck am Antwortende             | **bei jeder Antwortende** — größter Latenzfaktor |
| `stop:check-console-log`         | Stop                 | Prüft auf vergessene `console.log`-Reste            | bei jeder Antwortende                            |

**Restbestand:** 24 der 28 Definitionen liegen in `hooks.json` unverbunden — wie eine Alarmanlage ohne Strom. Kosten: 0 Token, 0 Ausführung. Weiterhin da: `hooks/memory-persistence/` (eigener Ordner) und `README.md`.

**Nachtrag 2026-09-14 — 5. aktiver Hook (Jan-Freigabe, Option 5):**

| Aktiver Hook (neu)     | Matcher              | Zweck                                                                                                                           | Laufzeit-Kostenpunkt                                                                    |
| :--------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------- |
| `post:edit:accumulate` | Edit/Write/MultiEdit | Schreibt editierte JS/TS-Pfade in ein Session-tmp-File, damit `stop:format-typecheck` sie bei Antwortende gebündelt prüfen kann | je Edit-Aufruf, append-only, nur `.ts\|.tsx\|.js\|.jsx` (`post-edit-accumulator.js:38`) |

Damit **5 aktiv von 28**; Restbestand 23. Eingetragen in `V:\.claude\settings.json` (Backup `settings.json.bak-2026-09-14`), Wirksamkeit ab nächster Session. Der ECC-Bestand selbst wurde nicht verändert — die Definition lag bereits fertig in `hooks.json:169`.

---

## 2 — Findings

### F1 — `stop:format-typecheck` + `stop:check-console-log`: Latenz bei jeder Antwortende

Beide laufen bei **jedem** Stop-Ereignis, auch in reinen Lese-/Recherchesessions ohne Code-Änderung. `format-typecheck` triggert Formatierung + Typecheck (der langsamste der vier).
**Vorschlag:** Beide behalten (bewusst gewählt, automatisieren Jans eigene `npm run lint`/`typecheck`-Pflicht) — aber nur bei empfundenem Nerven: Entweder deaktivieren oder auf „nur wenn in der Session Edits stattfanden" einschränken (falls der Hook-Skript das unterstützt). Kein Sofortbedarf.

### F2 — `hooks.json`-Restbestand: 24 unverbundene Definitionen

Die 24 nicht-aktiven Hooks kosten nichts, sind aber 49,8 KB Totlast in einer Datei, die versehentliche Fehlverdrahtung ermöglicht (ein Copy-Paste-Block reicht, um einen unerwünschten Hook zu aktivieren — z. B. den am 2026-08-30 ausdrücklich **nicht** empfohlenen `pre:bash:dispatcher`).
**Vorschlag:** `hooks.json` auf den aktiven 4er-Satz kürzen und den Rest in ein `hooks.json.inactive`-Archiv (oder direkt löschen — die Quelldateien bleiben im ECC-Repo). Risiko der Versehentlich-Aktivierung → 0.

### F3 — `post:edit:design-quality-check`-Doppelabdeckung prüfen

Der Hook setzt dieselbe Anti-Template-Regel durch, die auch als Text in `ecc/web/design-quality.md` (414 Zeilen) lädt. Das ist gewollt (Text = Wissen, Hook = Durchsetzung) — kein Konflikt, nur dokumentiert.

### F4 — `stop:format-typecheck` läuft in der Ist-Konfiguration faktisch nie (Korrektur zu F1, 2026-09-14)

Der Hook ist von sich aus **bedingt ausgelegt**: Er liest einen Session-Akkumulator (`ecc-edited-<sessionId>.txt`) und steigt sofort aus, wenn kein Edit vorgefallen ist (`V:\.claude\scripts\hooks\stop-format-typecheck.js:140–143` — „No accumulator — nothing edited this response"). **Aber:** der Akkumulator-Schreiber `post:edit:accumulate` ist in der 4er-Auswahl **nicht aktiv** — er existiert nur als unverbundene Definition in `hooks.json:169`, nicht in `settings.json:104–158`. Folglich:

- **0 `ecc-edited-*`-Files** in `C:\Users\hambu\AppData\Local\Temp` (live geprüft 2026-09-14) — der Akkumulator wurde nie geschrieben.
- Realer Latenz-Preis des Stop-Hooks = Datei-Stat eines nicht existierenden tmp-Files (vernachlässigbar) — die F1-Prämisse „größter Latenzfaktor" (Formatierung + Typecheck bei jeder Antwortende) ist in der Ist-Konfiguration **überholt**.
- Kehrseite: Jans lint/typecheck-Automatisierung ist **de facto unwirksam** — der Hook hat nie formatiert/typcheckt.
- **Behoben 2026-09-14 (Jan-Freigabe, Option 5):** `post:edit:accumulate` ist als 5. aktiver Hook in `V:\.claude\settings.json` eingetragen (Matcher `Edit|Write|MultiEdit`, Timeout 10 s, Skript `scripts/hooks/post-edit-accumulator.js`, Backup `settings.json.bak-2026-09-14`). Wirkt **ab der nächsten Session** (Hooks werden beim Start geladen). Verhalten des Schreibers verifiziert: `appendFileSync` je Aufruf (atomar, keine Überschreib-Konkurrenz), Ziel `%TEMP%\ecc-edited-<sessionId>.txt`, Fail-open mit Pass-Through (`post-edit-accumulator.js:50–64`) — bestätigt das „sehr niedrige Risiko".
- **Reichweiten-Caveat des Aktivierungs-Gewinns:** akkumuliert werden nur `.ts|.tsx|.js|.jsx` (`post-edit-accumulator.js:38`). Reine Doku-Sessions (`.md`) und Bearbeitungen an `.mjs`-Werkzeugskripten lösen damit weiterhin **keinen** Format/Typecheck aus — der Zusatzaufwand entsteht genau bei Code-Edits, was die Kostenwirkung begrenzt.
- Gegenprobe `stop:check-console-log`: arbeitet git-basiert (`getGitModifiedFiles`, `check-console-log.js:47`) — scannt den dirty Working Tree, nicht „Edits dieser Antwort"; dieser Hook ist also wirksam (allerdings mit dem hier realen Zustand: sehr viele uncommittete Änderungen → breiter Scan).

---

## 3 — Handlungsoptionen (wartet auf Jan)

|  #  | Maßnahme                                                                 | Effekt                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                             Risiko                                                                                                                                                                                                                                                                                                                                                                                                                              |
| :-: | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  1  | `hooks.json` auf aktive 4 kürzen, 24 Reste archivieren (F2)              | ~~Fehlverdrahtungs-Risiko 0~~ — **geklärt: lokal nicht dauerhaft lösbar**                                                                                       | **Prüf-Ergebnis 2026-09-14 (read-only, ECC-Installer-Code):** `hooks.json` ist der **Merge-Zielpfad des ECC-Installers** — `scripts/lib/install/apply.js:97` liest `<targetRoot>/hooks/hooks.json` als Quelle, löst Plugin-Root-Platzhalter auf und schreibt sie per `merge-json`-Operation (`apply.js:114–133`, `deepMergeJson`) wieder dorthin zurück. Folgen: (a) Ein lokales Kürzen/Umbenennen wird beim nächsten ECC-Install/Update **zurückgemergt** — der Nutzen wäre nicht dauerhaft; (b) die 4 aktiven Hooks sind **nicht** betroffen, weil der Installer `settings.json` nirgends referenziert (Grep über `scripts/lib/install/**`: 0 Treffer) — das befürchtete „alle Hooks still" tritt also nicht ein. **Damit: nicht lokal umsetzen** — sauber wäre der Fix upstream bei ECC (Restbestand gar nicht erst ausliefern), nicht ein lokaler Eingriff. |
|  2  | Stop-Hooks bei Latenz spüren: deaktivieren oder bedingtes Ausführen (F1) | Antwortende schneller                                                                                                                                           |                                                                                                                                                                **Klarstellung 2026-09-14 (F4):** bedingte Ausführung ist im Skript bereits ausgelegt (Akkumulator-Prüfung, `stop-format-typecheck.js:140–143`) — der „nur bei Edits"-Modus hängt nur an der Aktivierung von `post:edit:accumulate` (= Option 5). Deaktivieren wäre die falsche Maßnahme, wenn die lint/typecheck-Automatisierung eigentlich gewollt ist — sie ist aktuell ohnehin unwirksam. **Empfehlung: Option 2 entfällt** (in der Ist-Konfiguration gibt es kein Latenzproblem, das eine Deaktivierung rechtfertigt — F4).                                                                                                                                                                 |
|  3  | Kein weiterer Hook aus dem Restbestand aktivieren                        | —                                                                                                                                                               |                                                                                                                                                                                                                                                                                    Nicht-aktivieren-Empfehlung von 2026-08-30: `pre:bash:dispatcher`/`gateguard-fact-force` (zu eingreifend, kollidiert mit K1–K5-Auto-Allow), `stop:desktop-notify` (macOS/WSL-zielig, unter Windows wirkungslos), `governance-capture` (nur mit Env-Var `ECC_GOVERNANCE_CAPTURE=1` aktiv)                                                                                                                                                                                                                                                                                     |
|  4  | Review-Zyklus für die Hook-Auswahl (Vorschlag Plan 11 L3, 2026-09-14)    | Auswahl bleibt verifiziert statt driftend                                                                                                                       |                                                                                                                                                                                                                                                                                                                                                               Zeitaufwand 1× pro Quartal je ≤ 10 Min (Re-Verifizierung wie am 2026-09-14: Matcher/Timeouts/4er-Set gegen `settings.json:104–158`)                                                                                                                                                                                                                                                                                                                                                               |
|  5  | `post:edit:accumulate` aktivieren (neu, F4)                              | Machts die lint/typecheck-Automatisierung (Option 2 „nur bei Edits") wirksam — Format/Typecheck dann batch-weise bei Antwortende **nur wenn Edits stattfanden** |                                                                                                                                                                                                     Niedrig: passiver Akkumulator-Schreiber (append-only tmp-File, `post-edit-accumulator.js:18–21`), kein Verhaltens-Eingriff in Edits selbst; aktivierbar als 5. Hook in `settings.json` (Definition vorhanden, `hooks.json:169`). **Kosten-Trade-off:** aktiviert läuft der Format/Typecheck-Lauf real bei jedem Antwortende mit Edits — bei großen uncommitteten Bäumen spürbar; dafür wird Jans lint/typecheck-Pflicht dann tatsächlich automatisiert.                                                                                                                                                                                                     |

### 3a — Empfehlungs-Stand des LLM (2026-09-14, Entscheidung liegt bei Jan)

| Option | LLM-Empfehlung                                 | Begründung                                                                                                                                                                                                        |
| :----- | :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | **Nicht umsetzen** (ECC-Prüfung abgeschlossen) | Siehe Options-Zeile 1: `hooks.json` ist Merge-Ziel des ECC-Installers → lokales Kürzen wird beim nächsten Update zurückgemergt (nicht dauerhaft); aktive Hooks sind nachweislich nicht gefährdet. Upstream-Thema. |
| 2      | **Entfällt**                                   | F4: kein Latenzproblem in der Ist-Konfiguration — Deaktivieren würde nur die gewollte Automatisierung endgültig abschalten                                                                                        |
| 3      | **Bestätigen (Status quo festschreiben)**      | Kein belegter Bedarf für weitere Restbestand-Hooks; Kollision mit K1–K5-Auto-Allow bleibt bestehen                                                                                                                |
| 4      | **Ausgeführt** (Verfahren eingerichtet, §8)    | Reine Doku-/Verfahrens-Ebene, kein Settings-Eingriff → im LLM-Scope entscheidbar                                                                                                                                  |
| 5      | **Ausgeführt 2026-09-14 (Jan-Freigabe)**       | Höchster Hebel: stellt die _gewollte, bis dahin unwirksame_ lint/typecheck-Automatisierung tatsächlich her; Risiko durch Skript-Prüfung bestätigt niedrig (append-only, fail-open)                                |

**Entscheidungs-Stand 2026-09-14:** Option 4 ausgeführt (Verfahren §8), Option 5 ausgeführt (Jan-Freigabe, 5. aktiver Hook), Option 2 entfällt, Option 3 = Status quo bestätigt, Option 1 nach ECC-Prüfung als **nicht lokal lösbar** geschlossen. Damit sind **alle fünf Optionen entschieden** — die Audit-Datei ist inhaltlich abgeschlossen und kann auf 🟢 umgestellt werden, sobald Jan den Aktivierungs-Nachweis (nächste Session) bestätigt hat.

---

## 4 — Fail-/Fehler-Verhalten der aktiven Hooks (nachgetragen 2026-09-14, Plan 11 L1)

| Hook-Gruppe                                                            | Konstruktion                                                                                                                                                                                   | Verhalten bei Fehler/Root-Auflösungs-Fail                                                                                                                                                                      | Beleg                                                                          |
| :--------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| Edit-Hooks (`pre:config-protection`, `post:edit:design-quality-check`) | Node-Bootstrap (`node -e …`) löst `CLAUDE_PLUGIN_ROOT` über Env → Plugin-Kandidaten → Cache-Scan auf, lädt dann `plugin-hook-bootstrap.js` + `run-with-flags.js <id> <script> standard,strict` | Bootstrap-Fehlschlag = Command-Fehler (fail-open für den Tool-Call: kein Exit-2-Signal); Timeouts 5 s / 10 s begrenzen den Worst-Case. Kein `WARNING`-Fallback-Text im Command — anders als bei den Stop-Hooks | `settings.json:111`/`:125` (Command-Text), Timeouts `settings.json:112`/`:126` |
| Stop-Hooks (`stop:format-typecheck`, `stop:check-console-log`)         | Inline-Fallback im Command-Text: Root-Resolution (Env → `~/.claude` → Plugin-Kandidaten → Cache-Scan) mit Fallback `claudeDir`                                                                 | Fail-open **mit sichtbarer Warnung**: `[Stop] WARNING: could not resolve ECC plugin root; skipping hook` + stdin pass-through; Runner-Fehler = `[Stop] ERROR: hook runner failed: <Grund>` + Exit 1            | `settings.json:139`/`:151` (Command-Text inkl. WARNING/ERROR-Klauseln)         |
| Runner-Ebene (`run-with-flags.js`)                                     | Profil-Flags `standard,strict` (aktiv), Pfad-Traversal-Guard, require()-Fast-Path bei `run()`-Export, Legacy-Spawn sonst                                                                       | Fehlendes Skript / Traversal → `[Hook] …`-Warnung + stdin pass-through (Exit 0); Runner-Crash → fail-open (`main().catch` → Exit 0)                                                                            | `run-with-flags.js:107–117`, `:188–190`                                        |
| Skript-Ebene (`stop-format-typecheck.js`)                              | Formatter-/Typecheck-Fehler sind non-blocking (silent catch)                                                                                                                                   | `formatBatch`/`typecheckBatch` fegen Formatter-Fehler weg („non-blocking") — Hook blockiert nie                                                                                                                | `stop-format-typecheck.js:74–76`, `:105`, `:114`                               |

**Bewertung:** Block-Semantik existiert bewusst nur bei `pre:config-protection` (Exit 2); alle übrigen aktiven Hooks sind fail-open mit sichtbarer Warnung — konsistent mit der Projektlinie „Hooks warnen, Guards blockieren, Geschäftsregeln nie clientseitig".

---

## 5 — Projekt-spezifischer Hook-Bedarf: Migrations-Hook-Entwurf + Bedarfskatalog (nachgetragen 2026-09-14, Plan 18 L1/L2)

### 5.1 — Entwurf `pre:edit:migration-reminder` (Vorschlag, nicht aktiv — Aktivierung = Jan-Gate)

| Aspekt               | Entwurf                                                                                                                                                                                                                                                                             |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hook-Punkt / Matcher | `PreToolUse`, Matcher `Write\|Edit\|MultiEdit` (Muster: `pre:config-protection`, `settings.json:105–118`)                                                                                                                                                                           |
| Pfad-Filter          | Input `tool_input.file_path` unter `supabase/migrations/**` — bei Nicht-Treffer sofort Exit 0 (kein Over-Matching)                                                                                                                                                                  |
| Verhalten            | Kontextueller **Reminder** (Exit 0 + stdout-Hinweis), **kein Block**: die verbindliche Pflichtprüfung bleibt der `migration-security-guard`-Review (CLAUDE.md § Supabase); der Hook macht die Pflicht garantiert sichtbar, statt von der Befolgung der Prosa-Regel abhängig zu sein |
| Aufbau               | Bootstrap wie config-protection (node -e + `run-with-flags.js … standard,strict`); neues Skript `scripts/hooks/migration-reminder.js` (Quelle im ECC-Skript-Ordner, hier nur Entwurf)                                                                                               |
| Fail-Verhalten       | Fail-open — ein nicht zustellbarer Reminder blockiert nie einen Edit (Konsistent mit §6-Linie)                                                                                                                                                                                      |
| Timeout              | 5 s                                                                                                                                                                                                                                                                                 |
| Abgrenzung           | Kein Duplikat des `.husky/pre-commit`-Migrations-Kollisions-Guards: der Git-Hook prüft spät (beim Commit, Kollisions-Fall), der Hook früh (beim Edit, Reminder-Fall); Git-Ebene bleibt unangetastet                                                                                 |
| Instandhaltung       | Teil des Review-Zyklus (Option 4); Entwurfs-Kopplung: Plan 11 L2 verweist hierher (keine Doppelpflege)                                                                                                                                                                              |

### 5.2 — Projekt-spezifischer Bedarfskatalog (≤ 10 Kandidaten, beleggestützt)

| #   | Kandidat                                       | Hook-Punkt                              | Nutzen                                                                             | Risiko                                          | Aktivierungs-Empfehlung                                              |
| :-- | :--------------------------------------------- | :-------------------------------------- | :--------------------------------------------------------------------------------- | :---------------------------------------------- | :------------------------------------------------------------------- |
| 1   | `pre:edit:migration-reminder` (5.1)            | PreToolUse auf `supabase/migrations/**` | migration-security-guard-Pflicht garantiert sichtbar                               | Sehr niedrig (fail-open, kein Block)            | Aktivieren nach Jan-Freigabe (neuer Bedarf)                          |
| 2   | `post:edit:accumulate`                         | PostToolUse                             | Macht die bereits bedingt ausgelegte Format/Typecheck-Automatisierung wirksam (F4) | Sehr niedrig (passiver append-only Akkumulator) | Aktivieren, wenn die lint/typecheck-Automatisierung gewollt ist (F4) |
| 3   | `stop:desktop-notify`                          | Stop                                    | Desktop-Benachrichtigung                                                           | Unter Windows wirkungslos                       | Nicht aktivieren (bestätigt, 2026-08-30)                             |
| 4   | `pre:bash:dispatcher` / `gateguard-fact-force` | PreToolUse Bash                         | Eingreifende Bash-Kontrolle                                                        | Kollidiert mit K1/K2-Auto-Allow                 | Nicht aktivieren (bestätigt, 2026-08-30)                             |
| 5   | `governance-capture`                           | SessionEnd                              | Audit-Trail                                                                        | Nur mit Env-Var aktiv, kein Bedarf              | Nicht aktivieren (bestätigt, 2026-08-30)                             |
| 6   | übrige 19 unverbundene Definitionen            | —                                       | —                                                                                  | Totlast / Versehentlich-Aktivierung (F2)        | Option 1 (Archivierung) entscheidet                                  |

Keine weiteren erfundenen Bedarfe: Kandidaten 1–2 sind die beiden echten, konkreten Bedarfe; 3–5 bestätigen die bestehenden Nicht-Aktivieren-Empfehlungen; der Rest ist F2-Disziplin.

---

## 6 — Erprobungs-Läufe (nachgetragen 2026-09-14, Plan 15 L1 + Plan 16 L0)

### 6.1 — `update-config`-Skill: Übungsfall-Definition (Plan 15 L1; Ausführung wartet auf Jan-Gate L2)

- **Skill-Quelle (Plan 15 L0, 2026-09-14 verifiziert):** `update-config` ist ein **Harness-Built-in-Skill** — keine lokale Skill-Datei unter `C:\Users\hambu\.claude\skills\` (dort nur eigene/ECC-Skills) und keine Plugin-Definition in `plugins/marketplaces/**` (Glob/Grep 2026-09-14, 0 Treffer). Die Capability-Doku ist daher nur über den Skill-Aufruf selbst zugänglich; Fähigkeits-Spektrum laut Session-Skill-Beschreibung: Hooks, Permissions, Env-Vars, Hook-Troubleshooting in `settings.json`/`settings.local.json`.
- **Übungsfall (reversibel, berührt keine aktive Konfiguration):** dem Skill der Auftrag stellen, einen **no-op-Übungs-Hook** zu formulieren — ein `PostToolUse`-Hook mit `echo`-Only-Skript — als JSON-Snippet mit Matcher/Timeout/Fail-Verhalten. Ablage: Draft-Doku in dieser Datei (§6.1), **nicht** in `settings.json`/`settings.local.json`. Verifikation: der Übungsfall wird nie angewendet; Reversibilität 100 % (kein Schreibzugriff auf Settings).
- **Was der Lauf klären soll:** ob der Skill brauchbare Hook-Snippets liefert (Fähigkeits-Baseline für künftige Hook-Konfigurationen) und wie sein Output-Format aussieht.

### 6.2 — `fewer-permission-prompts`-Skill: Ergebnis (Plan 16 L0/L1, 2026-09-14)

- **L0 Skill-Lauf (PROPOSAL ONLY):** 50 jüngste Transkripte (von 239, alle VibeCoding-Projekte) gescannt; Bash-Leading-Paare + MCP-Vollnamen gezählt; Schritt 8 des Skills (Merge in `settings.json`) gemäß Plan-16-Nicht-Scope **bewusst übersprungen** — kein Schreibzugriff auf jegliche Settings.
- **Kernbefund (macht das Skill-Ziel moot):** die globale `V:\.claude\settings.json` erlaubt bereits `Bash(*)` + `PowerShell(*)` (Blanket-Allow) und `mcp__playwright__*` — Permission-Prompts für Bash/MCP entstehen in der Ist-Konfiguration faktisch **keine**. Kein Allowlist-Vorschlag kann also ein noch bestehendes Prompt beseitigen; das inverse Problem (Allowlist zu breit statt zu eng) ist bereits in `01_10` #3 dokumentiert und bleibt Jan-Gate.
- **Abgleich gegen `01_10` (L1):** alle Kandidaten unten sind über `Bash(*)` bzw. `mcp__playwright__*` bereits gedeckt (Duplikate — bewusst nicht eingetragen). Zusatz-Flag: `Bash(npm run *)` in `.claude/settings.local.json:32` ist eine Task-Runner-Wildcard (beliebige npm-Scripts = Code-Ausführung; `postinstall`/`design:generate` mutieren) — bestätigt 01_10 #3 (Wildcard-Disziplin Top 80 %) und kandidiert für den dort geplanten Aufräumdurchgang.
- **Gefiltert (Skill-Regeln):** `npx *` (tsx=133, vitest=62, tsc=25, eslint=20 — Package-Runner = Code-Ausführung, verboten; zudem verboten per CLAUDE.md „Keine variablen Dateipfade an Linter & Test-Runner"), `powershell -Command`/`node -e` (Interpreten/Shells), `git commit/add/merge/push/...`, `npm install/ci`, `rm`, `taskkill`, `curl -s` (Netzwerk, im Zweifel raus), `npm run build`/`dev`/`postinstall`/`design:generate` (Side-Effects), `npm run test:coverage` (schreibt Report-Artefakte).

Konditionale Tabelle (nur relevant, falls die Allowlist je von `Bash(*)` auf feine Klassen eingeschärft wird — dann wäre dies die datengestützte Reihenfolge):

| #   | Pattern                                    | Count | Hinweis                                               |
| :-- | :----------------------------------------- | :---: | :---------------------------------------------------- |
| 1   | `Bash(npm run typecheck)`                  |  85   | exaktes Script, read-only                             |
| 2   | `Bash(npm test *)`                         |  85   | `vitest run` + Args; Script gepinnt in `package.json` |
| 3   | `Bash(npm run lint)`                       |  59   | exaktes Script, read-only                             |
| 4   | `mcp__ccd_session__mark_chapter`           |  38   | Session-Bookkeeping, wirkungslos auf Repo             |
| 5   | `mcp__playwright__browser_navigate`        |  29   | via `mcp__playwright__*` bereits gedeckt              |
| 6   | `mcp__playwright__browser_find`            |  20   | dito                                                  |
| 7   | `mcp__playwright__browser_take_screenshot` |  18   | dito                                                  |
| 8   | `Bash(npm audit)`                          |  11   | read-only Registry-Check                              |
| 9   | `Bash(npm view *)`                         |   5   | read-only Registry-Metadaten                          |
| 10  | `Bash(npm run check-doc-links)`            |   4   | exaktes Script, read-only                             |
| 11  | `Bash(npm run db:pooler-health)`           |   4   | read-only Diagnose (Remote-Lese-Probe)                |
| 12  | `mcp__github-actions__actions_list`        |   4   | read-only CI-Listung                                  |

Bewusst nicht vorgeschlagen: `Claude_Browser`-MCP-Tools (Server in dieser Umgebung nicht konfiguriert; `javascript_tool`/`run_code_unsafe` wären zudem Code-Ausführung) sowie alle mutierenden Befehle.

---

## 7 — Selbstprüfung

- [x] 28 Hook-Definitionen in `hooks.json` live gezählt (2026-09-05) — Diskrepanz „13 vs. 27 vs. 28" in den Vorgänger-Dokus damit aufgelöst.
- [x] 4 aktive Hooks aus `settings.json` live verifiziert, identisch mit Jans Auswahl von 2026-08-30.
- [x] ~~Kein Hook wurde geändert, aktiviert oder deaktiviert — reiner Vorschlag.~~ **Überholt 2026-09-14:** `post:edit:accumulate` wurde mit ausdrücklicher Jan-Freigabe (Option 5) als 5. Hook aktiviert; die anderen 4 bleiben unverändert. Änderung nur in `V:\.claude\settings.json` (Backup angelegt), nicht am ECC-Bestand.
- [x] Option 1 read-only geprüft (ECC-Installer-Code) statt umgesetzt — Ergebnis dokumentiert (§3 Option 1).
- [x] Option 5 vor der Aktivierung am Skript verifiziert (`post-edit-accumulator.js` vollständig gelesen: append-only, fail-open, Extension-Filter).

---

## 8 — Review-Zyklus für die Hook-Auswahl (Option 4, eingerichtet 2026-09-14)

Verfahren zur Re-Verifizierung der 4er-Auswahl. Kein neuer Mechanismus, keine Automatisierung — eine bewusst kurze Checkliste, die verhindert, dass die Auswahl still driftet.

- **Intervall:** 1× pro Quartal. **Nächste Fälligkeit: 2026-12-14.**
- **Dauer:** ≤ 10 Min (Erstlauf 2026-09-14 als Referenz).

|  #  | Prüfschritt                                                                                                                            | Beleg-Ort                                        | Ergebnis 2026-09-14               |
| :-: | :------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- | :-------------------------------- |
|  1  | 4er-Set noch identisch (`pre:config-protection`, `post:edit:design-quality-check`, `stop:format-typecheck`, `stop:check-console-log`)? | `V:\.claude\settings.json` hooks-Block           | ✅ unverändert (`:104–158`)       |
|  2  | Matcher + Timeouts unverändert (`Write\|Edit\|MultiEdit`, 5/10 s)?                                                                     | dieselbe Quelle (`:107`, `:112`, `:121`, `:126`) | ✅ unverändert                    |
|  3  | `hooks.json`-Restbestand noch 24 unverbundene Definitionen?                                                                            | `V:\.claude\hooks\hooks.json`                    | ✅ 28 gesamt, 4 aktiv             |
|  4  | Neue Bedarfe/Kandidaten seit dem letzten Lauf? (Casino-Arbeit + ECC-Updates)                                                           | diese Datei §5.2                                 | ✅ Katalog aktuell (6 Kandidaten) |
|  5  | Findings/Korrekturen nachtragen (F-Nummern fortschreiben) und Jan-Zeile setzen                                                         | diese Datei §2/§3a                               | ✅ F4 nachgetragen                |

Fällt ein Schritt durch, gilt der Befund als neues F-Item in §2 mit Handlungsoption in §3 — nicht als stiller Nachtrag.
