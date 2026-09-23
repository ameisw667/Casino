# 02 — Command-Referenz

> **Zweck:** Lesbare Auswahlhilfe für das aktuelle `package.json`-Script-Inventar. `package.json` ist die Quelle für Namen und Command-Text; Auswahl und Verifikation folgen `xx_sop/02_workflow_jan_execution.md`.

## 1 — Quellregel

- `package.json` ist die Quelle für Script-Name und Command.
- Dieser Katalog beschreibt Zweck, Wirkgrenze und sichere Auswahl, nicht aktuelle Test-, Build- oder Deployment-Ergebnisse.
- **Gegen Ist-Stand geprüft am 2026-09-17:** 45 Scripts, `.husky/pre-commit` und 12 Dateien unter `.github/workflows/`.
- Nicht-interaktive Befehle sind Standard für Agenten; `test:watch` ist nur für menschliche Entwicklung.

## 2 — Entwicklung und Qualität

| Script          | Command                 | Wirkung                                                        |
| --------------- | ----------------------- | -------------------------------------------------------------- |
| `dev`           | `next dev --port 3015`  | Lang laufender lokaler Next.js-Server auf Port 3015            |
| `start`         | `next start`            | Lang laufender lokaler Production-Server nach Build            |
| `test`          | `vitest run`            | Einmaliger Vitest-Lauf                                         |
| `test:watch`    | `vitest`                | Interaktiver Vitest-Watch-Modus                                |
| `test:coverage` | `vitest run --coverage` | Vitest mit Coverage-Ausgabe                                    |
| `typecheck`     | `tsc --noEmit`          | TypeScript-Prüfung ohne Ausgabe                                |
| `lint`          | `eslint`                | ESLint-Prüfung                                                 |
| `format:check`  | `prettier --check …`    | Format-Prüfung ohne Dateischreibzugriff                        |
| `format`        | `prettier --write …`    | Schreibt Formatänderungen in Quell-, Script- und Testdateien   |
| `build`         | `next build`            | Production-Build                                               |
| `prepare`       | `husky`                 | Git-Hooks bei Dependency-Installation; nicht manuell ausführen |

## 3 — Casino- und Risikoanalyse

| Script          | Wirkung                                                                 | Remote-/Schreibwirkung                                                                    |
| --------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `vibe-check`    | Durchsucht `src/` nach UI- und Design-Mustern                           | lokal, nur lesend; meldet Befunde per Warnung und prüft keine RNG- oder Payout-Mathematik |
| `economy-audit` | Vergleicht House-Edge-Daten aus `wallet_transactions` und `game_rounds` | liest Supabase mit Service Role                                                           |
| `fraud-ml-scan` | Berechnet Anomalie-Scores                                               | schreibt additiv `risk_events`; nur mit ausdrücklicher Freigabe ausführen                 |

## 4 — Supabase

| Script                | Wirkung                                                                 | Grenze                                                 |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| `verify:supabase`     | Prüft ENV-Namen sowie Auth- und REST-Erreichbarkeit                     | Remote-Leseprobes mit Anon- und Service-Role-Key       |
| `supabase:migrations` | Listet lokale und Remote-Migrationen                                    | Supabase-CLI-Kontext erforderlich                      |
| `supabase:start`      | Startet lokalen Supabase-Stack                                          | verändert lokalen Docker-Zustand                       |
| `supabase:stop`       | Stoppt lokalen Supabase-Stack                                           | verändert lokalen Docker-Zustand                       |
| `supabase:reset`      | Setzt lokalen Supabase-Stack zurück                                     | destruktiv; nur mit ausdrücklicher Freigabe            |
| `supabase:types`      | Generiert `src/types/database.types.ts` aus dem lokalen Supabase-Schema | schreibt lokal und überschreibt die Typdatei           |
| `supabase:diff`       | Vergleicht lokalen Migrationsstand gegen Remote-Schema                  | liest Remote-Schema; Pflicht-Drift-Check vor `db push` |

Für Supabase-Kontext und -Ablauf zusätzlich `xx_docs/01_supabase_context.md` und `xx_sop/05_database_supabase.md` lesen.

## 5 — Externe Dienste

| Script-Gruppe                                                  | Wirkung                               | Voraussetzung                              |
| -------------------------------------------------------------- | ------------------------------------- | ------------------------------------------ |
| `github:actions`, `github:issues`, `github:prs`, `github:repo` | Liest GitHub-Repository- und CI-Daten | `gh`-Authentifizierung und Netzwerkzugriff |
| `sentry:info`, `sentry:issues`                                 | Liest Sentry-CLI- oder Issue-Daten    | Sentry-Konfiguration und Netzwerkzugriff   |

## 6 — Vollständiger Stand: 45 Scripts, Hooks und CI (2026-09-17)

Die Tabellen in den Abschnitten 2–5 waren ein älteres Teilinventar. Dieser Abschnitt ist die aktuelle, vollständige Ergänzung. **Lernregel:** Nicht den Namen erraten — erst Wirkung und Wirkgrenze lesen.

| Gruppe                         | Scripts                                                                                                                                                                                 | Wirkgrenze in einem Satz                                                                                                                                                       |
| :----------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Start, Build, Laufzeit         | `predev`, `dev`, `prebuild`, `build`, `start`                                                                                                                                           | `predev` läuft vor `dev`, bereinigt lokal den Turbopack-Cache und kann `.env.local` aus Backup wiederherstellen; `build` erzeugt lokale Ausgabe.                               |
| Code- und Dokuqualität         | `lint`, `typecheck`, `test`, `test:watch`, `test:coverage`, `format`, `format:check`, `vibe-check`, `check-doc-links`, `check-duplication`, `check-file-sizes`, `check-secret-rotation` | Prüfungen sind K2; `format` schreibt lokal, Watch/Server laufen dauerhaft, Coverage kann Reportdateien erzeugen, und Duplication/File-Size prüfen den Quellbestand nur lesend. |
| Fachlogik und Risiko           | `test:concurrency`, `economy-audit`, `sim:economy`, `fraud-ml-scan`                                                                                                                     | Concurrency braucht lokalen/ephemeren DB-Kontext, Economy liest Remote mit Service Role, Simulation schreibt optional lokal, Fraud schreibt additiv remote.                    |
| Supabase                       | `verify:supabase`, `supabase:start`, `supabase:stop`, `supabase:reset`, `supabase:migrations`, `supabase:types`, `supabase:diff`                                                        | Start/Stop ändern Docker lokal, Reset ist destruktiv, Types überschreibt lokal, die übrigen Remote-Aktionen sind mindestens lesend.                                            |
| Backup und DB-Diagnose         | `backup:run`, `db:perf-audit`, `db:pooler-health`, `db:perf-regression`, `db:perf-broad-query-set`, `test:restore-drill`                                                                | Backup kann externe Ziele beschreiben; Diagnose liest lokal/remote und kann lokale Berichte schreiben; Restore-Drill verändert lokale Docker-Container.                        |
| Design, Observability und Last | `design:generate`, `sentry:info`, `sentry:issues`, `observability:up`, `observability:down`, `loadtest:bet`                                                                             | Design generiert Dateien und kann externe Dienste berühren, Sentry liest remote, Observability ändert Docker lokal, Loadtest erzeugt Last.                                     |
| GitHub und Installation        | `github:repo`, `github:issues`, `github:prs`, `github:actions`, `prepare`                                                                                                               | GitHub-Scripts lesen remote über `gh`; `prepare` installiert Hooks und wird nicht manuell ausgeführt.                                                                          |

### 6.1 — Gezielte Tests: klein anfangen, ohne Policy-Verstoß

Die Pfade existieren im Repository. Der Zusatz nach `--` wird an den kanonischen `npm test`-Befehl übergeben. Deshalb ist dies mit der Regel kompatibel, keine ad-hoc-`npx vitest run <Pfad>`-Befehle zu verwenden.

| Änderung                           | Startbefehl                                                    | Danach, wenn die Aufgabe es verlangt            |
| :--------------------------------- | :------------------------------------------------------------- | :---------------------------------------------- |
| Casino-Service-Logik               | `npm test -- src/lib/casino/__tests__/`                        | volle DoD: Test, Typecheck, Lint, Build         |
| Security, Auth oder Routenverträge | `npm test -- src/lib/security/__tests__/`                      | zuständige Security-SOP und volle DoD           |
| API-Route mit Testordner           | z. B. `npm test -- src/app/api/user/self-exclusion/__tests__/` | nächstliegenden Service-/Security-Test ergänzen |
| Casino-Komponente                  | `npm test -- src/components/casino/__tests__/`                 | UI-Screenshot-DoD bei visueller Änderung        |
| Dice-Game-UI                       | `npm test -- src/components/casino/games/dice/v2/__tests__/`   | Screenshot-DoD und volle Abschlussprüfung       |
| Dokumentation                      | `npm run check-doc-links`                                      | `git diff --check` vor Übergabe                 |

Ein fokussierter Test verkürzt nur die Diagnose-Schleife. Er ersetzt nicht die vollständige Abschlussprüfung aus `xx_sop/02`, wenn diese für den Task erforderlich ist.

### 6.2 — Was ein Commit zusätzlich prüft

`.husky/pre-commit` hat drei Stufen (kanonische Guardrails-Doku inkl. Diagnose-Regel und Abgrenzung zu Claude-Code-Hooks: [`t_claude_code/commands/workflow/04_commit_hook_guardrails.md`](../workspace/domains/ai_agents/t_claude_code/commands/workflow/04_commit_hook_guardrails.md)):

1. Bei **gestagten Migrationen**: doppelte Migrations-Präfixe führen zum Abbruch.
2. Nur wenn `gitleaks` lokal installiert ist: Scan des Staging-Bereichs gegen `.gitleaks.toml`.
3. Immer: `npx lint-staged` mit den dafür konfigurierten ESLint-, Typecheck- und Prettier-Schritten.

Ein Commit-Abbruch ist deshalb zuerst ein Guardrail. Ursache korrigieren und erneut committen; nicht reflexhaft `--no-verify` verwenden.

### 6.3 — CI-zu-lokal-Parität: 12 Workflows

| Workflow                      | Nächste lokale Annäherung                                                                   | Bewusste Differenz                                                             |
| :---------------------------- | :------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------- |
| `quality-ci.yml`              | `npm test`; `npm run typecheck`; `npm run lint`; `npm run check-doc-links`; `npm run build` | CI prüft zusätzlich Migrations-Präfixe und Coverage beobachtend.               |
| `dependency-audit.yml`        | `npx audit-ci --config .audit-ci.jsonc`                                                     | CI erzeugt zusätzlich SBOM und eine informative Moderate/Low-Summary.          |
| `secret-scan.yml`             | `gitleaks protect --staged --no-git -c .gitleaks.toml -v`, wenn installiert                 | CI scannt den Commit-Bereich mit vollständiger Git-Historie.                   |
| `doc-drift-check.yml`         | `npm run check-doc-links`                                                                   | CI ist zeitgesteuert und nur informativ.                                       |
| `migration-drift-check.yml`   | `npm run supabase:migrations`                                                               | Vollständiger CI-Check braucht Management-API-Secret.                          |
| `schema-drift-check.yml`      | `npm run supabase:start`, dann `npm run supabase:types`, Diff prüfen                        | Types-Generierung überschreibt lokal; CI nutzt einen frischen ephemeren Stack. |
| `security-staging.yml`        | lokaler Stack, `npx supabase test db`, `npm run test:concurrency`, passende Security-Tests  | Kein einzelnes Script orchestriert alle isolierten CI-Schritte.                |
| `red-team-security.yml`       | kein allgemeiner Einzeilen-Ersatz                                                           | Braucht ephemere Nutzer, Cookies und eine laufende lokale App.                 |
| `backup-drill.yml`            | lokaler Stack, dann `npm run test:restore-drill`                                            | CI prüft optional externe Backup-Integrität mit Secrets.                       |
| `backup-freshness-check.yml`  | kein Alltags-Shortcut                                                                       | Zeitgesteuerter Remote-Backup-Check mit möglichem GitHub-Issue.                |
| `pooler-health-check.yml`     | `npm run db:pooler-health`                                                                  | CI nutzt bei Konfiguration ein GitHub-Secret und Log-Summary.                  |
| `query-performance-audit.yml` | `npm run db:perf-audit`; anschließend `npm run db:perf-regression`                          | CI kann Management-API-Credentials und GitHub-Issue-Erstellung nutzen.         |

Nicht jeder CI-Workflow braucht einen neuen Wrapper-Script. Ein Wrapper ist erst sinnvoll, wenn dieselbe sichere lokale Sequenz wiederholt manuell ausgeführt wird und alle Schritte dieselbe Sicherheitsgrenze besitzen.

## 7 — Lernstruktur

Die acht disjunkten Command-Unterübersichten und ihre gewichtete Bewertung stehen in [ _claude_code/01_4_command_workflow.md](../workspace/domains/ai_agents/t_claude_code/01_4_command_workflow.md). Diese Datei bleibt die technische Auswahlhilfe; sie kopiert deren Scorecards nicht.
