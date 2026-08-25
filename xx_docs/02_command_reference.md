# 02 — Command-Referenz

> **Zweck:** Aktuelles `package.json`-Script-Inventar. Kein Ausführungsablauf; Auswahl und Verifikation folgen `xx_sop/02_workflow_jan_execution.md`.

## 1 — Quellregel

- `package.json` ist die Quelle für Script-Name und Command.
- Dieser Katalog beschreibt Zweck und Wirkung, nicht aktuelle Test-, Build- oder Deployment-Ergebnisse.
- Nicht-interaktive Befehle sind Standard für Agenten; `test:watch` ist nur für menschliche Entwicklung.

## 2 — Entwicklung und Qualität

| Script | Command | Wirkung |
| --- | --- | --- |
| `dev` | `next dev --port 3015` | Lang laufender lokaler Next.js-Server auf Port 3015 |
| `start` | `next start` | Lang laufender lokaler Production-Server nach Build |
| `test` | `vitest run` | Einmaliger Vitest-Lauf |
| `test:watch` | `vitest` | Interaktiver Vitest-Watch-Modus |
| `test:coverage` | `vitest run --coverage` | Vitest mit Coverage-Ausgabe |
| `typecheck` | `tsc --noEmit` | TypeScript-Prüfung ohne Ausgabe |
| `lint` | `eslint` | ESLint-Prüfung |
| `format:check` | `prettier --check …` | Format-Prüfung ohne Dateischreibzugriff |
| `format` | `prettier --write …` | Schreibt Formatänderungen in Quell-, Script- und Testdateien |
| `build` | `next build` | Production-Build |
| `prepare` | `husky` | Git-Hooks bei Dependency-Installation; nicht manuell ausführen |

## 3 — Casino- und Risikoanalyse

| Script | Wirkung | Remote-/Schreibwirkung |
| --- | --- | --- |
| `vibe-check` | Durchsucht `src/` nach UI- und Design-Mustern | lokal, nur lesend; meldet Befunde per Warnung und prüft keine RNG- oder Payout-Mathematik |
| `economy-audit` | Vergleicht House-Edge-Daten aus `wallet_transactions` und `game_rounds` | liest Supabase mit Service Role |
| `fraud-ml-scan` | Berechnet Anomalie-Scores | schreibt additiv `risk_events`; nur mit ausdrücklicher Freigabe ausführen |

## 4 — Supabase

| Script | Wirkung | Grenze |
| --- | --- | --- |
| `verify:supabase` | Prüft ENV-Namen sowie Auth- und REST-Erreichbarkeit | Remote-Leseprobes mit Anon- und Service-Role-Key |
| `supabase:migrations` | Listet lokale und Remote-Migrationen | Supabase-CLI-Kontext erforderlich |
| `supabase:start` | Startet lokalen Supabase-Stack | verändert lokalen Docker-Zustand |
| `supabase:stop` | Stoppt lokalen Supabase-Stack | verändert lokalen Docker-Zustand |
| `supabase:reset` | Setzt lokalen Supabase-Stack zurück | destruktiv; nur mit ausdrücklicher Freigabe |
| `supabase:types` | Generiert `src/types/database.types.ts` aus Remote-Schema | liest Remote-Schema, schreibt nur lokal |
| `supabase:diff` | Vergleicht lokalen Migrationsstand gegen Remote-Schema | liest Remote-Schema; Pflicht-Drift-Check vor `db push` |

Für Supabase-Kontext und -Ablauf zusätzlich `xx_docs/01_supabase_context.md` und `xx_sop/05_database_supabase.md` lesen.

## 5 — Externe Dienste

| Script-Gruppe | Wirkung | Voraussetzung |
| --- | --- | --- |
| `github:actions`, `github:issues`, `github:prs`, `github:repo` | Liest GitHub-Repository- und CI-Daten | `gh`-Authentifizierung und Netzwerkzugriff |
| `sentry:info`, `sentry:issues` | Liest Sentry-CLI- oder Issue-Daten | Sentry-Konfiguration und Netzwerkzugriff |
