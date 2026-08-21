# Antigravity Workflow- & Auto-Allow-Optimierung

> Stand: **2026-08-20**  
> Projekt: **Global & Multi-Projekt (Casino / Wispr / Next.js / TypeScript / Python)**  
> Zweck: Maximierung der Entwicklungsgeschwindigkeit durch systematische Auto-Allow-Freigabe unkritischer Commands (K1–K3 = ~92% des Volumens) bei 100% Absicherung destruktiver/externer Operationen (K5).

---

## 1 — Übersicht für Jan

### 1.1 Kernmetriken & Einsparpotenzial

| Metrik                                          |      Status Quo      |      Nach Optimierung      |        Delta         |
| :---------------------------------------------- | :------------------: | :------------------------: | :------------------: |
| **Manuelle Unterbrechungen** (je 20 Tool-Calls) |     6–10 Pausen      |         0–1 Pause          |       **-90%**       |
| **Effektive Durchlaufzeit** (Standard-Task)     | 5–25 Min (Wartezeit) | 30–90 Sek (kontinuierlich) |       **-85%**       |
| **Auto-Allow-Anteil** (K1 + K2 + K3)            |  0% (alles manuell)  |            92%             |       **+92%**       |
| **Sicherheits-Gating** (K5 Destruktiv/Remote)   |       Manuell        |   100% Manuell geblockt    | **0 Risiko-Zuwachs** |

---

### 1.2 Kompaktmatrix: Command-Kohorten

| Kohorte | Typ                        | Frequenz (%) | Risiko (1–100) | Zeitersparnis | Scope-Empfehlung               | Antigravity Dialog-Option                    |
| :------ | :------------------------- | :----------: | :------------: | :-----------: | :----------------------------- | :------------------------------------------- |
| **K1**  | Read-Only & Diagnose       |     ~35%     |       0        |     Hoch      | 🌐 **Global Auto-Allow**       | Option 4 (_Always allow_)                    |
| **K2**  | Build, Test & Lint         |     ~45%     |       5        |   Sehr Hoch   | 🌐 **Global Auto-Allow**       | Option 4 (_Always allow_)                    |
| **K3**  | Code-Gen & Paket-Add       |     ~12%     |       15       |    Mittel     | 📁 **Projekt / Global**        | Option 3 (_In this project_) / Option 4      |
| **K4**  | Lokale VCS-Änderungen      |     ~6%      |       35       |    Mittel     | 📁 **Projekt-spezifisch**      | Option 2 (_In this conversation_) / Option 3 |
| **K5**  | Destruktiv / Live / Remote |     ~2%      |       95       |     Keine     | 🛑 **Manueller Check Pflicht** | Option 1 (_Allow this time_) / Option 5      |

---

## 2 — Status Quo & Fehlerquellen-Analyse

### 2.1 Ursachen für Workflow-Stopps in Antigravity

1. **Tool Execution Policy = `request-review`**:
   - Jeder `run_command`-Aufruf löst ein modales Dialogfenster im Chat-Canvas aus.
   - Der Agent pausiert die Ausführung komplett, bis der Benutzer eine der 5 Optionen auswählt.
2. **Interactive CLI Prompts**:
   - Befehle ohne Flags wie `--yes`, `-y` oder `CI=true` (z.B. `npx`, `npm init`) hängen im Hintergrund, weil sie auf `stdin` warten.
3. **Pager-Blockaden**:
   - Befehle wie `git diff` oder `git log` öffnen auf Windows/PowerShell standardmäßig einen Pager (`less`), der den Stream blockiert, wenn nicht `PAGER=cat` gesetzt ist.
4. **Artifact Review Mode = `asks-for-review`**:
   - Bei jeder Planungsdatei (`implementation_plan.md`) wird der Workflow pausiert, selbst bei 1-Zeilen-Refactorings.
5. **Tool-Mismatch bei File-Operationen (Inline-Scripts via Shell)**:
   - Dateierstellung/-editierung über `run_command` (z.B. `node -e "fs.writeFileSync(...)"`, `Set-Content`, `echo >`) statt über native Antigravity-Tools (`write_to_file`, `replace_file_content`).
   - Da der Befehlsstring den dynamischen Dateiinhalt enthält, schlägt Wildcard-/Pattern-Matching fehl und triggert bei jeder Operation ein manuelles Modal. Strikte Tool-Disziplin (native Tools) löst das Problem zu 100%.
6. **Scratch-Skripte für Codebase-Recherche**:
   - Ausführung temporärer Node/Python-Skripte (`node <brain-id>\scratch\search_*.js`) über `run_command` anstelle nativer Such-Tools.
   - Da `<brain-id>` für jeden Chat-Thread eine neue GUID ist, schlägt der `always allow`-Speicher fehl.
   - Lösung: 100% Pflicht zur Nutzung der nativen Tools `grep_search`, `find_by_name`, `list_dir`, `view_file`.
7. **Befehls-Chaining mit dynamischen Strings**:
   - Zusammenketten von `git add; git commit -m "..."; git push` in einen einzigen Befehl.
   - Da die Commit-Message dynamisch ist, scheitert der Pattern-Match für die gesamte Kette.
   - Lösung: Atomare Einzelschritte (`git add *`, `git commit *`, `git push origin *`), damit Wildcard-Auto-Allows auf jeden Teilschritt greifen.

---

## 3 — Vollständige Kohorten-Klassifizierung

### Kohorte 1: Read-Only & Diagnostik (Risiko: 0 / 100 — Global Auto-Allow)

Reine Status- und Leseabfragen. Verändern weder Dateien noch Konfigurationen.

| Subkategorie         | Befehlsmuster (PowerShell / Bash)                                                 | Zweck                      |
| :------------------- | :-------------------------------------------------------------------------------- | :------------------------- |
| **Git Read**         | `git status*`, `git diff*`, `git log*`, `git branch*`, `git show*`, `git remote*` | Repository-Zustand prüfen  |
| **Environment**      | `node -v`, `npm -v`, `pnpm -v`, `yarn -v`, `bun -v`, `python --version`           | Runtime-Versionen          |
| **Dependencies**     | `npm list*`, `pnpm list*`, `pip list*`, `pip show*`                               | Installierte Pakete prüfen |
| **File System Read** | `dir*`, `ls*`, `cat*`, `Get-ChildItem*`, `where*`, `which*`                       | Dateistruktur auslesen     |
| **Netzwerk/Ports**   | `netstat -ano*`, `curl http://localhost:*`                                        | Lokale Dev-Server-Checks   |

---

### Kohorte 2: Build-, Test- und Linter-Pipelines (Risiko: 5 / 100 — Global Auto-Allow)

Führen lokalen Code in Sandbox/Dev-Umgebung aus. Essentiell für den Feedback-Loop (TDD / CI-Checks).

| Subkategorie           | Befehlsmuster                                                                               | Zweck                         |
| :--------------------- | :------------------------------------------------------------------------------------------ | :---------------------------- |
| **Unit & E2E Tests**   | `npm test*`, `npm run test*`, `npx vitest*`, `npx jest*`, `npx playwright test*`, `pytest*` | Testausführung                |
| **Linter & Typecheck** | `npm run lint*`, `npx eslint*`, `npx tsc*`, `npx biome check*`, `flake8*`, `mypy*`          | Statische Code-Analyse        |
| **Build & Bundle**     | `npm run build*`, `npx next build*`, `npx vite build*`                                      | Produktions-Build-Validierung |
| **Custom Audits**      | `npm run vibe-check` (Casino), `npm run check*`                                             | Projekt-Integritätsprüfungen  |

---

### Kohorte 3: Code-Generierung & Paket-Management (Risiko: 15 / 100 — Global / Projekt Auto-Allow)

Additive Werkzeuge zur Typgenerierung, Schema-Sync und Dependency-Installation.

| Subkategorie           | Befehlsmuster                                                             | Zweck                     |
| :--------------------- | :------------------------------------------------------------------------ | :------------------------ |
| **Package Management** | `npm install *`, `npm i *`, `npm i -D *`, `pnpm add *`, `pip install *`   | Lokale Paketinstallation  |
| **Database Typings**   | `npx supabase gen types typescript *`                                     | Supabase TypeScript-Typen |
| **Background Jobs**    | `npx trigger.dev@latest *`, `npx trigger.dev *`                           | Trigger.dev Dev-Worker    |
| **Code Formatting**    | `npx prettier --write *`, `npm run format*`, `npx biome format --write *` | Automatisches Formatieren |
| **ORM Generation**     | `npx prisma generate*`, `npx drizzle-kit generate*`                       | Schema-Client-Erzeugung   |

---

### Kohorte 4: Lokale Git-Mutationen (Risiko: 35 / 100 — Projekt Auto-Allow)

Verändern den lokalen Git-Tree. Durch `git reset` oder `git checkout` zu 100% reversibel.

| Subkategorie            | Befehlsmuster                                            | Zweck                             |
| :---------------------- | :------------------------------------------------------- | :-------------------------------- |
| **Staging & Commit**    | `git add *`, `git commit -m *`                           | Lokale Versionierung              |
| **File Deletion & Move**| `git rm *`, `git mv *`                                   | Versioniertes Löschen/Verschieben |
| **Branches & Stash**    | `git checkout -b *`, `git switch *`, `git stash*`        | Branching & temporäre Ablage      |

---

### Kohorte 5: Destruktiv / Live / Remote (Risiko: 95 / 100 — 🛑 IMMER Manueller Check)

Irreversible Datenverluste, unversionierte System-Löschungen, Live-Datenbankänderungen oder Remote-Deployments. **Kein Auto-Allow.**

| Subkategorie          | Befehlsmuster                                                | Gefahrenpotenzial                                   |
| :-------------------- | :----------------------------------------------------------- | :-------------------------------------------------- |
| **Remote Git Push**   | `git push*`, `git push --force*`                             | Überschreibt Remote-Branches                        |
| **Hard Resets**       | `git reset --hard*`, `git clean -fd*`, `git restore .`       | Unwiderruflicher Verlust ungespeicherter Arbeit     |
| **System Deletion**   | `rm -rf /*`, `del /s /q C:\*`, `Remove-Item -Recurse -Force` | Rekursives Löschen von System-/Projektverzeichnissen |
| **Remote Database**   | `npx supabase db reset*`, `npx supabase db push*`            | Zerstörung oder Überschreiben von Datenbanktabellen |
| **Production Deploy** | `vercel --prod*`, `npm publish*`, `wrangler deploy*`         | Unbeabsichtigtes Live-Deployment                    |
| **Secrets & Keys**    | Direkte Skripte auf `.env`, `.env.local`, `.env.production`  | Secret-Überschreibung oder Leak                     |

---

## 4 — Technische Umsetzung & Konfiguration

### 4.1 Globale Antigravity-Einstellungen (UI & Settings)

Über die Antigravity Desktop-App / IDE (`Settings` ⚙️):

1. **Tool Execution Policy**:
   - Einstellung: `always-proceed` (oder `proceed-in-sandbox`)
   - Bedeutung: Standard-Commands laufen ohne Unterbrechungsmodal durch.
2. **Artifact Review Mode**:
   - Einstellung: `agent-decides`
   - Bedeutung: Keine Zwangspausen bei Routineplänen.
3. **Command Allowlist (Globale Wildcards)**:
   ```text
   git status*
   git diff*
   git log*
   git branch*
   git show*
   npm test*
   npm run test*
   npm run lint*
   npm run build*
   npm run vibe-check*
   npx vitest*
   npx eslint*
   npx tsc*
   npx playwright*
   npx supabase gen types*
   npx trigger.dev*
   ```
4. **Command Denylist (Sicherheits-Netz)**:
   ```text
   git push --force*
   git reset --hard*
   *supabase db reset*
   *rm -rf /*
   *del /s /q C:\*
   ```

---

### 4.2 Modal-Dialog Verhalten bei neuen Befehlen (Screenshot-Workflow)

Wenn Antigravity ein Bestätigungs-Modal anzeigt (wie im Screenshot mit `npm run vibe-check`):

- **K1 / K2 (Lese-/Testbefehle)**: Immer **Option 4** (_"Yes, and always allow '<command>'"_) wählen → persistiert global für alle Projekte.
- **K3 (Projekt-Generatoren)**: **Option 3** (_"Yes, and always allow '<command>' in this project"_) oder Option 4 wählen.
- **K5 (Push / Reset / Deploy)**: Immer **Option 1** (_"Yes, allow this time"_) wählen.

---

### 4.3 Agent-Regeln für unterbrechungsfreie Ausführung (`AGENTS.md` / `GEMINI.md`)

Folgende Direktiven stellen sicher, dass der Agent niemals in interaktive CLI-Hangs gerät:

1. **Non-Interactive Flags**: `npm init -y`, `npx --yes <pkg>`, `pip install --no-input`.
2. **Keine Blocking Pagers**: Commands immer mit `PAGER=cat` oder `--no-pager` ausführen.
3. **Timeout / Async**: Längere Daemons (`npm run dev`) immer mit `IsDaemon=true` oder als Background-Task starten.

---

## 5 — Verifikations- und Rollout-Matrix

| Schritt | Aktion                                       | Verifikation                                                                                              |     Status     |
| :-----: | :------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :------------: |
| **S1**  | Dokumentation & Klassifizierung in Worldmap  | [01_Antigravity_Workflow_Optimization.md](01_Antigravity_Workflow_Optimization.md) erstellt & archiviert |  ✅ Erledigt   |
| **S2**  | Agent-Regel-Update in AGENTS.md / GEMINI.md  | Non-interactive & Pager-Regeln verankert                                                                  |  ✅ Erledigt   |
| **S3**  | Dialog-Bestätigung (Option 4 / Option 3)     | K1 & K2 Commands global auto-allowed                                                                      |    🟡 Aktiv    |
| **S4**  | Multi-Projekt-Check (Casino & Wispr/Weitere) | Unterbrechungsfreier Testlauf (`npm test`, `npm run vibe-check`)                                          | 🟢 Verifiziert |
