# 02 — Build & Toolchain

Niveau: **Top 10 %** · Stand: **2026-08-29** · frisch lokal verifiziert mit: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test` und `npm run build:verify` (Details im maßgeblichen Abschlussnachweis in Abschnitt 6).

---

## Status quo (für Jan — Übersicht & Fortschritt)

| Nr.    | Feature / Meilenstein                                                                  | Status                                               | Risiko  | Impact | Aufwand | Prod-Ready | Zuständig  |
| ------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------- | ------ | ------- | ---------- | ---------- |
| **A1** | Verification of Production Build (`npm run build`)                                     | 🟢 Abgeschlossen                                     | Niedrig | Hoch   | Niedrig | Ja         | **Claude** |
| **A2** | TypeScript Typecheck (`npm run typecheck` / `tsc --noEmit`, Target ES2022)             | 🟢 Abgeschlossen                                     | Niedrig | Hoch   | Niedrig | Ja         | **Claude** |
| **A3** | ESLint Code Quality Gate (`npm run lint`)                                              | 🟡 **1 Error** (Regression seit 2026-08-17-Snapshot) | Niedrig | Mittel | Niedrig | Teilweise  | **Claude** |
| **A4** | Pre-Commit Hygiene & Husky Typecheck Gate (`scripts/typecheck-staged.mjs`)             | 🟢 Abgeschlossen                                     | Niedrig | Hoch   | Niedrig | Ja         | **Claude** |
| **A5** | Package Engine & Environment Validation (`node >=20.9.0`, `.nvmrc`)                    | 🟢 Abgeschlossen                                     | Niedrig | Mittel | Niedrig | Ja         | **Claude** |
| **A6** | Prettier-Format-Standard (`format`/`format:check`, Scope `src/`, `scripts/`, `tests/`) | 🟡 160 Dateien weichen ab, noch kein `--write`-Lauf  | Niedrig | Mittel | Niedrig | Teilweise  | **Claude** |

---

## 1. Frisch verifizierter Stand (2026-08-27, alle Befehle heute ausgeführt)

| Gate                   | Ergebnis                                                                                                                                                                                                               | Befehl                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `npm run typecheck`    | **0 Fehler**                                                                                                                                                                                                           | `tsc --noEmit`                     |
| `npm run test`         | **146/146 Testdateien, 1147/1147 Tests grün**                                                                                                                                                                          | `npm run test` (Vollsuite, 15,4 s) |
| `npm run build`        | **grün (Exit 0)** — Routenzählung im selben Lauf nicht ausgewertet                                                                                                                                                     | `npm run build`                    |
| `npm run lint`         | **1 Error, 14 Warnings** — Error: `src/app/games/roulette/RouletteClient.tsx:378` „Calling setState synchronously within an effect can trigger cascading renders" (`react-hooks`-Regel); 14 `exhaustive-deps`-Warnings | `npm run lint`                     |
| `npm run format:check` | 160 Dateien weichen vom Prettier-Standard ab (offener Punkt seit Toolchain-Aufbau)                                                                                                                                     | `npm run format:check`             |
| Toolchain-Dateien      | 6/6 vorhanden (`.husky/pre-commit`, `.prettierrc.json`, `.prettierignore`, `.editorconfig`, `.github/dependabot.yml`, `scripts/typecheck-staged.mjs`)                                                                  | `ls`                               |

### 1.1 ESLint-Error (neu seit letztem Snapshot)

- `src/app/games/roulette/RouletteClient.tsx:378` — `Error: Calling setState synchronously within an effect can trigger cascading renders`. Der Datei-Status ist aktuell unversioniert (parallele Roulette-Arbeit im Arbeitsbaum, siehe `git status`). **Nicht in dieser Datei behoben** — liegt außerhalb des Doku-Scopes; Fix gehört zur Roulette-Baustelle.
- Warnings-Basis gesunken: 78 (Snapshot 2026-08-17) → 14 (2026-08-27) — durch uncommittete Arbeitsänderungen, kein manueller Fix.

### 1.2 ES2022 Target & Pre-Commit-Gate (unverändert gültig)

- `tsconfig.json` Target **ES2022** (BigInt-Literal in `src/lib/meta/contracts.ts:23` nativ unterstützt, siehe Abschnitt 5 der Worldmap).
- `.husky/pre-commit` → `lint-staged`: `eslint --fix` + `scripts/typecheck-staged.mjs` + `prettier --write`; End-to-End per echtem `git commit` am 2026-08-17 verifiziert (Blocker-Test + Durchlass-Test).
- `package.json` engines `node >=20.9.0`, `.nvmrc` `22.16.0`.

---

## 2. Selbstprüfung & Qualitätssicherung (Self-Audit)

- ✅ Alle vier Messwerte oben stammen aus Befehlsausgaben vom 2026-08-27 (nicht übernommen).
- ✅ `npm run test`: 146/146 Testdateien, 1147/1147 Tests grün (15,39 s Laufzeit).
- ⚠️ ESLint ist seit dem 2026-08-17-Snapshot nicht mehr fehlerfrei (1 Error in `RouletteClient.tsx`) — Prod-Ready dieser Kategorie sinkt damit von „Ja" auf „Teilweise", bis der Error behoben ist.
- ✅ Pre-Commit-Gate: 6/6 Konfigurationsdateien vorhanden (heute geprüft), Gate-Verhalten am 2026-08-17 verifiziert.

---

## 3. Verifikationsbefehle

```bash
npm run build        # Exit 0 (2026-08-27)
npm run typecheck    # 0 Fehler
npm run lint         # 1 Error (RouletteClient.tsx:378), 14 Warnings
npm run test         # 146/146 Dateien, 1147/1147 Tests
npm run format:check # 160 Dateien weichen ab (offen)
```

## 4. Historie

| Datum      | Änderung                                                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-08 | Erstmessung: Build grün, ES2022-Target, A1–A6 abgeschlossen, Top 25 % → Top 15 %                                                                                                                                                      |
| 2026-08-27 | Aktualisierung auf frisch gemessenen Stand (Vollsuite 1147/1147, build Exit 0); **neu:** 1 ESLint-Error in `RouletteClient.tsx:378` dokumentiert, Prod-Ready Ja → Teilweise; Prettier-Offenpunkt von 162 auf 160 Dateien aktualisiert |

---

## 6. Aktueller Abschlussnachweis (2026-08-29 — maßgeblich)

Dieser Abschnitt ersetzt für den aktuellen Arbeitsbaum die historischen Soll-Ist-Angaben oben.

| Gate                   | Ergebnis                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run format:check` | 🟢 0 Abweichungen                                                                                  |
| `npm run lint`         | 🟢 0 Errors, 0 Warnings                                                                            |
| `npm run typecheck`    | 🟢 0 Fehler                                                                                        |
| `npm run test`         | 🟢 152/152 Testdateien, 1178/1178 Tests grün (Vitest 4.1.9, 21,45 s)                               |
| `npm run build:verify` | 🟢 Next.js 16.3.0, 52 Seiten; kein Sentry-Release und kein Source-Map-Upload                       |
| `.husky/pre-commit`    | 🟢 gültige TypeScript-Probe im separaten temporären Git-Index akzeptiert; echter Index unverändert |
| Runtime                | 🟢 Node v22.16.0 (`.nvmrc`: 22.16.0)                                                               |

**Bottlenecks gelöst:** Beide `react-hooks/set-state-in-effect`-Fehler wurden minimal asynchron geplant; der neue Auto-Bet-Regressionstest ist grün. Der 228-Dateien-Prettier-Backlog ist vollständig bereinigt. Eine dabei aufgedeckte formatabhängige Crash-Testassertion prüft nun dieselbe fachliche Bedingung whitespace-robust. Das ESLint-Warnungsbudget ist **0**; es wurden keine Disable-Ausnahmen eingeführt.

**Lokaler Build-Schutz:** Neu ist `npm run build:verify`. Der Wrapper leert `SENTRY_AUTH_TOKEN` nur im gestarteten Child-Prozess. Der ursprüngliche L0-Standardbuild hatte mit dem lokalen Build-Token Source Maps hochgeladen; der neue Verifikationsbefehl bestätigt dagegen explizit keinen Release und keinen Upload. `npm run build` bleibt für den echten Deployment-Pfad unverändert.

**Niveau:** Top 15 % → **Top 10 %**.
