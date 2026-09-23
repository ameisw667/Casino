# 03 — Uncommitted-/Unmerged-Audit & Zusammenführungs-Plan

> **Status:** 🟡 Phase 1 (read-only Audit) abgeschlossen 2026-09-18 21:20 — Phase 2 wartet auf die Jan-Gates G6/G7/G8 · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Trennung „uncommitted" vs „unmerged", harte Bezifferung beider Kategorien, Konflikt-/Doppelarbeits-Analyse und Zusammenführungs-Empfehlung. Phase 1 hat den Baum **nicht** verändert (nur lesende Git-Befehle).
> **Money-Pfad:** Nein · **Security-Review:** Nein (Phase 1 rein lesend, keine Codeänderung)

> ⚠️ **Bewegungs-Warnung (belegt, siehe §1):** Im selben Arbeitsverzeichnis arbeitet(e) eine zweite LLM-Session. Während dieses Audits (21:08 → 21:20) hat sie einen Merge abgeschlossen, einen Stash angelegt **und wieder verworfen**, `node_modules` neu installiert und neue Dateien erzeugt. **Jede Zahl hier ist eine Momentaufnahme mit Uhrzeit** — vor Phase 2 neu messen.

---

## 0 — Kernaussage (drei Sätze)

1. **Ja, es gibt noch uncommittetes Material — aber es ist klein:** 51 geänderte + 39 neue Dateien im Arbeitsverzeichnis (zusammen ≈ 2.645 Zeilen) und 3 Stashes. Das ist rund **1,4 %** der Menge, die Jan vermutet.
2. **Jans ~92.000 ist Kategorie B, nicht A:** Auf `main` fehlen 145 Commits / 2.261 Dateien / +166.494 Zeilen aus dem Branch `codex/uncommitted-cohort-review` (Stand 21:15; um 21:36: **146** vor lokalem `main`, **94** vor `origin/main`); die Security-Branches liegen bei 87.000–89.500 Insertions. Kategorie A kann diese Größenordnung rechnerisch nicht erzeugen.
3. **Zusammengebracht werden muss fast nichts mehr — das ist bereits passiert:** `security-hardening-round2-merge` (21:07) und `security-round3-final-merge` (21:14) sind von der Parallel-Session in `codex/uncommitted-cohort-review` gemerged worden. Es bleibt **genau eine** Operation nach `main` (Fast-Forward möglich, weil `main` vollständig Vorfahre ist), danach Cleanup.

---

## 1 — Zeitleiste der Messungen (Bewegungsnachweis)

| Uhrzeit  | Beobachtung                                                                                                                                                                                                                                                                                                                                                | Beleg                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 21:08:06 | Parallel-Session legt Stash an: „isolate fremde Kategorie-13-Aenderung vor Security-Round3-Merge"                                                                                                                                                                                                                                                          | `git stash list` (später verschwunden)                                                  |
| 21:09:34 | **Mid-Merge:** 5 unaufgelöste Konflikte; Konfliktdatei wird gerade editiert                                                                                                                                                                                                                                                                                | `git ls-files -u`, mtime der Konfliktdateien                                            |
| 21:14:34 | Merge-Commit `c9a45eec` „Merge branch 'security-round3-final-merge' …" entsteht                                                                                                                                                                                                                                                                            | `git log -1`                                                                            |
| 21:14:44 | Zwischenmessung: HEAD noch `caf95a5c`, `MERGE_HEAD=45491d52`, Konflikte auf 0, Index 35 Dateien                                                                                                                                                                                                                                                            | erste Messreihe                                                                         |
| 21:15:23 | HEAD = `c9a45eec`, `MERGE_HEAD` weg, `main..HEAD` = **123 → 145** Commits                                                                                                                                                                                                                                                                                  | `git rev-list --count`                                                                  |
| 21:17:42 | Stash-Liste: **3 statt 4** (der 21:08-Stash ist verworfen); Indizes der übrigen Stashes verschoben                                                                                                                                                                                                                                                         | `git stash list --format='%gd %H'`                                                      |
| 21:18:22 | `node_modules` wird neu geschrieben (Install läuft): 59 npm-Staging-Verzeichnisse, `next`/`react`/`vitest` fehlen                                                                                                                                                                                                                                          | `ls node_modules`, `.bin` fehlt                                                         |
| 21:19:45 | Arbeitsverzeichnis 51 geändert / 39 neu; untracked-Liste um 5 Dateien gewachsen                                                                                                                                                                                                                                                                            | `git status --porcelain=v2`                                                             |
| 21:22:12 | Abschlussmessung: 54 geändert / 41 neu (weiter +5 Dateien in 2,5 Min); HEAD unverändert `c9a45eec`, 0 Konflikte, 145 vor `main`, 3 Stashes                                                                                                                                                                                                                 | `git diff --numstat`, `git status`                                                      |
| 21:32:51 | **HEAD erneut bewegt:** `6f72aecb` „feat(security-hardening): Säule 10 (security.txt-Expiry-Reminder) + Post-Merge-Fixes"; `main..HEAD` = **146**                                                                                                                                                                                                          | `git log -1`, `git rev-list --count`                                                    |
| 21:36:28 | Nachtragsmessung für die Jan-Erklärung: `main` = `d8a99640` (30.08. 20:16) vs. **`origin/main` = `26503ed5` (06.09. 21:56)**; 146 vor lokalem `main`, **94 vor `origin/main`**, 0 dahinter; **86 Commits noch nicht gepusht** (`origin/codex/uncommitted-cohort-review` = `8863b64f`, 09.09. 22:09); 78 Dateien uncommittet; 3 Stashes; 12 lokale Branches | `git rev-parse --short`, `git rev-list --count`, `git status --porcelain`, `git branch` |

**Konsequenz für Phase 2:** Alle Zahlen unten sind mit Uhrzeit zu lesen; die Parallel-Session kann zwischen zwei Arbeitsschritten desselben Meilensteins erneut committen. **Die 21:36-Werte sind die neuesten und überschreiben die 21:19–21:22-Snapshots** (§0/§2 sind der Audit-Stand von 21:20, nicht der heutige Endstand).

**Nachtrag 21:36 — Branch-Herkunft (neu belegt):** Das Reflog zeigt `d8a99640 codex/uncommitted-cohort-review@{2026-08-31 22:13:05 +0200}: branch: Created from HEAD` — der Arbeitsbranch wurde am **31.08. 22:13:05** aus dem damaligen `main`-Stand angelegt, erster Commit 22:19:42 (`7080872f`). Die ersten drei Commits teilt er mit `codex/startseite-v2` → dieselbe Abzweigung. Namensraum `codex/*` + Worktree-Pfad unter `C:\Users\hambu\.codex\…` deuten auf den Codex-CLI-Agenten als Urheber (starke Schlussfolgerung, kein Beweis — das Reflog nennt keinen Urheber).

**Nachtrag 21:49 — Gate G7 (Toolchain) entfällt:** Der zum Audit-Zeitpunkt laufende `node_modules`-Install der Parallel-Session ist abgeschlossen (234 Einträge in `node_modules/.bin`, `typescript`/`vitest`/`next` vorhanden). `npm ci` ist **nicht** mehr nötig. Die Verifikations-Suite läuft wieder: `npm run typecheck` Exit 0 (0 Fehler), `CI=true npm test` Exit 0 mit **273/273 Testdateien und 2013/2013 Tests** (21:49:51–21:50:45). Der frühere Befund „Gates nicht lauffähig" ist damit **überholt** (er galt 21:18–21:22). Ausführung: Plan 04 (§5).

---

## 2 — Kategorie A: Uncommitted (Geht bei `git clean`/Checkout/Stash-Verlust wirklich verloren)

### 2.1 Übersicht (Stand 21:19:45)

| Ebene                        | Menge                        | Zeilen               | Herkunft                                                       | Risiko                                                        |
| ---------------------------- | ---------------------------- | -------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- |
| Index (staged)               | **0 Dateien**                | —                    | —                                                              | keins — der Round-3-Merge ist vollständig committet           |
| Arbeitsverzeichnis, geändert | **51 Dateien**               | +638 / −307          | überwiegend parallele Session; t_claude_code auch Runde-2-Rest | **HOCH** — `git checkout .` / `clean` vernichtet es ersatzlos |
| Arbeitsverzeichnis, neu      | **39 Dateien**               | ≈ 1.700              | parallele Session (Security-Txt, Planungsordner)               | **HOCH** — untracked ist bei `git clean -fd` als Erstes weg   |
| Stash                        | **3 Einträge**               | 411 + 3 + 53 Dateien | Runde-1-Bestand (2026-08-24 … 08-29)                           | MITTEL — `stash drop` ist ohne Ref nicht wiederherstellbar    |
| Neben-Worktree dirty         | **1 Datei** (`round3-merge`) | +2 / −2              | parallele Session                                              | NIEDRIG                                                       |
| Ignorierte Dateien           | 62 Einträge                  | nicht geprüft        | gemischt                                                       | NIEDRIG (überwiegend Tooling)                                 |
| Unreachable Commits (fsck)   | **362**                      | —                    | Betriebsabfall (Rebases, verworfene Stashes)                   | NIEDRIG — bis zum `gc` technisch noch rettbar                 |

### 2.2 Die 51 geänderten Dateien (vollständig, 21:19:45)

`t_claude_code/**` (28 Dateien, +~380/−~220): `00_claude_code_uebersicht.md`, `01_3_custom_agents.md`, `01_4_command_workflow.md`, `01_5_session_memory.md`, `01_6_01_format_frontmatter.md`, `01_6_02_typ_abdeckung_feedback.md`, `01_6_03_typ_abdeckung_project.md`, `01_6_04_typ_abdeckung_user.md`, `01_6_05_typ_abdeckung_reference.md`, `01_6_06_index_konsistenz.md`, `01_6_07_pflegekadenz.md`, `01_6_09_frische_warnsystem.md`, `01_6_memory_files.md`, `01_15_token_oekonomie_effizienz.md`, `01_15_03a_code_modularisierung_regelkatalog.md`, `01_15_03b_w3_x3_erklaerung.md`, `01_multi_agent_scaling_und_autonomie.md`, `01_multi_agent_wissensrueckfluss_plan.md`, `agents/12_workflow_agent_creation.md`, `commands/01_commands_load_audit.md`, `commands/workflow/03…`, `commands/workflow/08…`, `commands/workflow/09…`, `Planungsdateien/03a_r01…`, `03a_r03…`, `03a_r07…`, `03c_w3_wallet_service_schnitt_plan.md`, `Planungsdateien/06_u01…`, `06_u02…`, `06_u03…`, `06_u04…`, `06_u05…`, `06_u07…`, `06_u08…`

**Code/Konfiguration** (5 Dateien — brauchen Review, nicht nur Commit):

| Pfad                                                                                       | Volumen | Bewertung                                                   |
| ------------------------------------------------------------------------------------------ | ------- | ----------------------------------------------------------- |
| `src/components/casino/games/crash-multiplayer/crash-multiplayer-styles.ts`                | +3/−3   | Spiel-UI-Code, geänderte Style-Tokens                       |
| `src/components/casino/games/crash-multiplayer/__tests__/crash-multiplayer-styles.test.ts` | +7/−0   | zugehöriger Test (gleiche Kohorte)                          |
| `tsconfig.json`                                                                            | +17/−4  | **Konfigurationsänderung — muss vor Commit erklärt werden** |
| `package.json`                                                                             | +1/−0   | neues Script (vermutlich `check-security-txt-expiry`)       |
| `.github/workflows/security-headers-drift-check.yml`                                       | +42/−0  | neues CI-Gate                                               |

**Doku/Status** (18 Dateien): `.claude/agent-evals/11_residue_scout/README.md`, `.claude/agents/11_residue_scout.md`, `CLAUDE.md` (Jan-Scope), `GEMINI.md` (Jan-Scope), `T_FRONTEND/00_UEBERSICHT.md`, `T_FRONTEND/Planungsdateien/01_performance_cwv_plan.md`, `T_FRONTEND/Planungsdateien/07_mobile_lcp_crash_multiplayer_plan.md`, `T_RATE_LIMITING_ABUSE_PREVENTION/00_…UEBERSICHT.md`, `T_SECURITY_HARDENING/10_security_txt_rfc9116.md`, `worldmap/00_WORLDMAP_STATUS.md`, `worldmap/05_ZUKUNFTSPLANUNG.md`, `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md`, `xx_docs/02_command_reference.md`

### 2.3 Die 39 neuen Dateien (21:19:45)

| Gruppe                                                                                                                                                                                                                             | Dateien | Zuständigkeit                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/**` (4 Übersicht + 12 Planungsdateien + Workflows)                                                                                                                                            | 17      | ⚠️ **neuer `T_*`-Ordner → SOP 03 verlangt Jan-Kurzfreigabe vor dem ersten Commit (Gate G8)** |
| `T_RATE_LIMITING_ABUSE_PREVENTION/`: `Uebersichtsdateien/p01…p10` (10), `03_…round2.md`, `07_…round2.md`, `11_execution_handoff_prompt.md`                                                                                         | 13      | LLM                                                                                          |
| Security-Txt-Nachzügler: `src/lib/security/security-txt-expiry.ts`, `__tests__/security-txt-expiry.test.ts`, `scripts/check-security-txt-expiry.ts`                                                                                | 3       | LLM (Code → Review)                                                                          |
| `T_SECURITY_HARDENING/12_conversation_handoff_context_prompt.md`, `T_FRONTEND/Planungsdateien/23_layout_shell_navigation_plan.md`, `24_design_tokens_css_plan.md`, `t_claude_code/Lerneffekt Jan/01_command_workflows_fuer_jan.md` | 4       | LLM                                                                                          |
| `.claude/agent-evals/11_residue_scout/runs/2026-09-18_real_world_checks.md`                                                                                                                                                        | 1       | LLM                                                                                          |
| `src/components/casino/games/crash{,-multiplayer}/CLAUDE.md`                                                                                                                                                                       | 2       | ⛔ **Jan-Scope** (Verzeichnis-CLAUDE.md)                                                     |

### 2.4 Stashes (per Hash, weil die Indizes sich während des Audits verschoben haben)

| Hash       | Alter            | Basis      | Umfang                       | Inhalt                                                                                  |
| ---------- | ---------------- | ---------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| `33a5a09e` | 2026-08-29 17:11 | `61b16b80` | 411 Dateien, +11.390/−13.800 | „temp-hold-foreign-edits-during-k14-archival-commit" — größter Posten, Runde-1-Artefakt |
| `40fb4e31` | 2026-08-28 22:46 | `7c3c6798` | 3 Dateien, +2.065/−2.460     | Stale-WIP `style-dictionary tokens:build`                                               |
| `7207f0f1` | 2026-08-24 21:11 | `1ab2fab8` | 53 Dateien, +4.701/−1.230    | „audit-temp"                                                                            |

Alle drei liegen **auf `main`**, nicht auf dem Arbeitsbranch. Ob ihr Inhalt heute noch Gültigkeit hat, ist **nicht** geprüft (Phase-1-Grenze) — deshalb Meilenstein A6.

### 2.5 Ignorierte Dateien — Grenze der Aussage

62 ignorierte Einträge. Überwiegend Werkzeug (`.husky/_/`, `node_modules/`, `.next*`, `coverage/`, `.playwright-mcp/`). Arbeits-relevant und **inhaltlich nicht inspiziert**: `infra/chaos/.env.chaos.example` (von `.gitignore:86` `.env*` erfasst; die Negation rettet nur exakt `.env.example`), `Workroom/`, `output/`, `scratch/`, `web/`, `worldmap/.research/`, `.qa-tmp/`, `remotion-ad/`, `test-results/`, `npm_audit_err.txt`, `supabase/.temp/`, `supabase/.branches/`.
→ **Ehrlich:** ob dort echte Arbeit liegt, kann ich nicht sagen, ohne die Verzeichnisse zu lesen. Empfehlung: als eigener Meilenstein (A6b) mit Jan gemeinsam sichten.

---

## 3 — Kategorie B: Unmerged (Committet, nur nicht in `main` — nichts geht verloren)

**Basisfakt (21:15:23):** `main` = `d8a99640` (2026-08-30) · `codex/uncommitted-cohort-review` = **145 voraus, 0 dahinter** → `main` ist vollständiger Vorfahre → **Fast-Forward möglich**.

| Branch                                                       | vor `main`          | Dateien | +Zeilen  | −Zeilen | Inhalt                                                                        | Blockiert von                       |
| ------------------------------------------------------------ | ------------------- | ------- | -------- | ------- | ----------------------------------------------------------------------------- | ----------------------------------- |
| `codex/uncommitted-cohort-review` (= HEAD)                   | **145**             | 2.261   | +166.494 | −21.416 | Alles: Runde 1+2 (K0–K16), Round-2-Merge (21:07), Round-3-Merge (21:14)       | G6 (Push/Merge), Gates (G7)         |
| `security-round3-final-merge`                                | 81                  | 1.171   | +89.471  | −17.262 | CSP-Report/Sampling, Cookie-SameSite, CodeQL, Red-Team-Bypass                 | ✅ bereits in HEAD gemerged         |
| `round3-security-merge`                                      | 79                  | 1.171   | +89.444  | −17.262 | dito, 2 Dateien/27 Zeilen Unterschied zu final                                | ✅ Vorfahre von final               |
| `security-hardening-round2-merge`                            | 65                  | 1.046   | +82.050  | −16.566 | Säulen 5/7/8 Runde 2 (Header, Supply-Chain, Secret-Rotation) + 3 Agent-Merges | ✅ bereits in HEAD (21:07)          |
| `hardening-ci-gate`                                          | 64                  | 1.152   | +87.437  | −17.212 | CI-Gate-Säule                                                                 | ✅ Vorfahre von round3              |
| `hardening-csp-reporting`                                    | 64                  | 1.157   | +88.112  | −17.238 | CSP-Reporting-Säule                                                           | ✅ Vorfahre von round3              |
| `hardening-csrf`                                             | 64                  | 1.158   | +87.597  | −17.235 | CSRF-Säule                                                                    | ✅ Vorfahre von round3              |
| `hardening-csp-script`                                       | 61                  | 1.152   | +87.372  | −17.213 | CSP-Script-Säule                                                              | ✅ Vorfahre von round3              |
| `codex/startseite-v2` / `-exec` (gleicher Commit `8863b64f`) | 60                  | 1.149   | +87.018  | −17.212 | Startseiten-v2                                                                | ✅ Vorfahre aller Security-Branches |
| `recovery-dropped-stash`                                     | **2 (21 dahinter)** | 440     | +9.343   | −17.120 | Geretteter Stash (2 Commits) auf altem `main`-Stand                           | ⛔ eigene Bewertung nötig (A5/G7)   |

**Lesart:** 9 der 10 Branches sind bereits vollständig in HEAD enthalten. Nach einem Fast-Forward nach `main` sind sie reine Aufräum-Kandidaten — es braucht **keine** weiteren Merges.

---

## 4 — Konflikte des abgeschlossenen Round-3-Merges (nachträglich forensisch geprüft)

**Zeitpunkt:** Konflikte bestanden um 21:09:34 (5 per `git ls-files -u`, zusätzlich `.github/workflows/red-team-security.yml` im `MERGE_MSG`-Konfliktblock), um 21:14:44 aufgelöst, um 21:14:34 committet. **Ich habe nichts aufgelöst** — die Auflösung stammt von der Parallel-Session.

Methode: Blob-Hashes `ours` = `caf95a5c`, `theirs` = `45491d52`, `result` = `c9a45eec`.

| Datei                                                    | ours       | theirs     | result     | Befund                                                              | trivial/inhaltlich             |
| -------------------------------------------------------- | ---------- | ---------- | ---------- | ------------------------------------------------------------------- | ------------------------------ |
| `T_SECURITY_HARDENING/00_…UEBERSICHT.md`                 | `85648af5` | `d1b5a1e8` | = **ours** | unsere Fassung gewann vollständig                                   | trivial                        |
| `worldmap/00_WORLDMAP_STATUS.md`                         | `98e6174b` | `2abab7d8` | = **ours** | unsere Fassung gewann; Worktree weicht jetzt wieder ab (`0548c031`) | trivial                        |
| `.github/workflows/red-team-security.yml`                | `223df85f` | `4dde55ce` | `c88e96d7` | manuell/gemischt                                                    | inhaltlich (CI-Gate)           |
| `src/app/api/casino/guide-persona/route.ts`              | `e068b0d1` | `e39bcaaf` | `c7a844da` | manuell/gemischt                                                    | **inhaltlich (API-Route)**     |
| `src/lib/security/__tests__/guide-persona-route.test.ts` | `64ca252f` | `382e753f` | `33ce2544` | manuell/gemischt                                                    | **inhaltlich (Security-Test)** |
| `src/lib/security/__tests__/red-team-contract.test.ts`   | `200015db` | `eaf60d1e` | `230df64b` | manuell/gemischt                                                    | **inhaltlich (Security-Test)** |

**Bewertung:** 2 von 6 Konflikten waren Status-/Tabellenzeilen (trivial). Die **4 inhaltlichen Konflikte sind bereits aufgelöst und committet** — es besteht **kein offener Konflikt**. Was fehlt, ist die **Verifikation der Auflösung**: die vier gemischten Dateien sind genau die, bei denen ein falsch gewählter Zweig stillen Sicherheitsverlust erzeugen kann. → Meilenstein A4 (Diff-Review, read-only).

### Nachtrag 2026-09-18 22:00 — die Tabelle oben ist eine _Stichprobe_, nicht die volle Menge

Die Tabelle war aus der damaligen Sicht zusammengestellt und ist inhaltlich **korrekt**, aber **unvollständig**. Vollmessung in Plan 04 §4 mit `git merge-tree --write-tree` (autoritative `CONFLICT`-Zeilen):

| Merge                | Konflikte exakt | Aufteilung                                                                         |
| -------------------- | --------------- | ---------------------------------------------------------------------------------- |
| Runde 2 (`caf95a5c`) | **7**           | 2× OURS (`T_SECURITY_HARDENING/00`, `07`) · 0× THEIRS · 5× MIXED                   |
| Runde 3 (`c9a45eec`) | **11**          | 2× OURS (`00`, `worldmap/00`) · 4× THEIRS (add/add `01`/`02`/`04`/`06`) · 5× MIXED |

In der Runde-3-Tabelle oben fehlen **5** der 11 Fälle: die vier **add/add**-Dokumente `T_SECURITY_HARDENING/{01,02,04,06}_*.md` (beide Workstreams haben dieselbe Datei unabhängig neu angelegt; der Merge nahm die Fassung der Sicherheits-Seite) sowie `scripts/red-team/test-catalog.json`. Grund der Lücke: die damalige Methode setzte einen existierenden Base-Blob voraus und übersah dadurch add/add.

Die Bewertung „2 trivial / 4 inhaltlich" bleibt für die 6 Stichproben-Dateien gültig. **Zwei Randnotizen:** (a) `worldmap/00_WORLDMAP_STATUS.md` hat sich seither erneut bewegt — Worktree-Blob jetzt `66a926a2` (die Zeile nennt `0548c031`); (b) die vier add/add-Dateien sind im Index der Parallel-Session als geändert vorgemerkt, werden also aktuell weiterbearbeitet.

---

## 5 — Doppelarbeit / Teilmengen-Relationen zwischen den Branches

Methode: `git branch --contains <tip>` (Ahnen-Relation) + `git diff --stat A B` (Inhaltsdifferenz).

| Branch                                                           | ist Vorfahre von                                               | nicht enthalten in                                     | Inhaltsdifferenz                                                                                                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `codex/startseite-v2` (= `-exec`)                                | allen Security-Branches + HEAD                                 | —                                                      | 0 (identischer Tip `8863b64f`)                                                                                                             |
| `hardening-csp-script` / `-ci-gate` / `-csp-reporting` / `-csrf` | `round3-security-merge` → `security-round3-final-merge` → HEAD | —                                                      | je ~200 Dateien Differenz untereinander (verschiedene Säulen, **keine** Teilmengen voneinander)                                            |
| `round3-security-merge`                                          | `security-round3-final-merge` → HEAD                           | —                                                      | nur **2 Dateien / 27 Zeilen** zu final                                                                                                     |
| `security-round3-final-merge`                                    | HEAD                                                           | —                                                      | Vorlage des 21:14-Merges                                                                                                                   |
| `security-hardening-round2-merge`                                | **nur HEAD**                                                   | `security-round3-final-merge`, `round3-security-merge` | 218 Dateien / +3.406/−10.131 zu final — trägt **11 eigene Commits** (Säule 5/7/8 Runde 2 + 3 Agent-Worktree-Merges), die in Runde 3 fehlen |
| `recovery-dropped-stash`                                         | **niemanden**                                                  | allen                                                  | 2 Commits, `cfa8522d` = Stash-Commit auf `b641c1cf`                                                                                        |

**Zentrale Erkenntnis:** `round2` und `round3` waren **Geschwister**, keine Teilmengen. Die Zusammenführung beider ist am 2026-09-18 um 21:07 bzw. 21:14 passiert. Die drei „Säulen-Merges" in `round2` (`worktree-agent-*`) sind damit ebenfalls in HEAD.

### 5.1 Forensik `recovery-dropped-stash` (der „verlorene Stash" aus Runde 1)

- 2 Commits: `ca705e8c` („index on main: b641c1c …") + `cfa8522d` („On main: temp-hold-foreign-edits-during-k14-commit") — das ist die **Commit-Form eines Stashes** (Stash-Commit + Index-Commit), also tatsächlich eine Stash-Rettung.
- Basis `b641c1cf` = alter `main`-Stand, **21 Commits hinter `main`**; keine Ahnen-Relation zu irgendeinem Branch.
- 415 berührte Dateien: **125 inhaltsgleich mit HEAD**, 271 in HEAD vorhanden aber inhaltlich weiterentwickelt, **19 in HEAD nicht vorhanden**.
- Die 19 „fehlenden" Pfade sind **kein Verlust, sondern Rename/Entfernung**: `supabase/migrations/049/050_*` (existieren heute als `049_crash_room_realtime_authorization.sql` / `050_crash_multiplayer_game_type.sql` — die alte 049/050-Kollision), `supabase/consolidated-setup.sql` → `docs/archive/`, `worldmap/00-09-CICD.md` / `00-14-*` / `01_*` / `02_mcp.md` / `03_cli.md` / `04_*` / `05_*` / `07_n8n_*` (alte worldmap-Struktur), `src/store/__tests__/useCasinoStore.test.ts` (in K10 in 6 Module aufgeteilt), `T_FRONTEND/03-frontend-lobby.md`, `T_FRONTEND/07_CONTROLS_CONSOLIDATION.md`.
- **Schlussfolgerung:** Der Branch enthält **keinen erkennbar einzigartigen, lebenden Inhalt**. Restrisiko: einzelne Hunk-Texte könnten historisch wertvoll sein → vor der Löschung ein `git diff recovery-dropped-stash HEAD` über die 125/271-Pfade als LLM-Schritt (A5). **Löschen nur durch Jan (G7).**

---

## 6 — Jans Frage wörtlich beantwortet

> **„Gibt es wirklich noch Sachen, die nicht committet sind? Und gibt es Kohorten oder Batches, die zusammengebracht werden müssen?"**

**1. „Noch Material, das nirgends committet ist?" — Ja, aber klein und beziffert (Stand 21:19:45):**

| Posten                             | Menge                    | Zeilen                  |
| ---------------------------------- | ------------------------ | ----------------------- |
| Arbeitsverzeichnis geändert        | 51 Dateien               | +638 / −307             |
| Arbeitsverzeichnis neu (untracked) | 39 Dateien               | ≈ 1.700                 |
| Stashes                            | 3 (411 + 3 + 53 Dateien) | eigener Umfang, s. §2.4 |
| Neben-Worktree (`round3-merge`)    | 1 Datei                  | +2 / −2                 |
| **Summe Arbeitsverzeichnis**       | **90 Dateien**           | **≈ 2.645**             |

Beleg: `git status --porcelain=v2 --untracked-files=all` (76 → 90 Einträge), `git diff --numstat`, `git stash list`, `git -C .claude/worktrees/round3-merge status --short`.

**2. „Erklärt sich Jans ~92.000 aus A oder aus B?" — aus B. A ist zwei Größenordnungen zu klein.**

- Reproduktionsversuch: `grep` über **alle** `.md` im Repo nach `92.000|92000|9x.200` → **0 Treffer**. `gh pr list --state all` → nur Dependabot-PRs, **kein PR** für diesen Branch. Ein Artefakt im Repo oder Remote, das die Zahl trägt, existiert nicht.
- Kategorie A: **≈ 2.645 Zeilen**. Selbst mit allen Stashes bleibt es vierstellig.
- Kategorie B (Branch vs. `main`, `behind=0` → 3-Punkt = vollständiger Baumvergleich): HEAD **+166.494**, `security-round3-final-merge` **+89.471**, `hardening-csp-reporting` **+88.112**, `round3-security-merge` **+89.444**, `startseite-v2` **+87.018**.
- **Hypothese:** Jan hat eine **Branch-gegen-`main`-Ansicht** gesehen (GitHub-Compare, IDE-„Changes"-Zähler oder `git diff --stat main...<branch>`), vermutlich von einem der Security-Branches (87.000–89.500 Insertions = nächstliegende Größenfamilie) — und liest sie als „nicht committet". **Nicht belegt**, nur die einzige Zahlengruppe in dieser Größenordnung. Die Restdifferenz zu 92.000 (kein Messwert trifft sie exakt) kann ich ohne Jans Quelle nicht auflösen — bitte einmal die Stelle nennen, dann verifiziere ich sie.
- **Entscheidende Unterscheidung:** A kann verloren gehen (uncommitted). B kann **nicht** verloren gehen (committed, nur nicht in `main`) — es ist eine **Merge-Entscheidung**, kein Verlustrisiko.

**3. „Welche Kohorten/Batches müssen zusammengebracht werden?" — Nur noch eine, und sie ist bereits erledigt.**

Die Merge-Arbeit ist am 2026-09-18 gelaufen: `caf95a5c` (Round 2, 21:07) und `c9a45eec` (Round 3 final, 21:14), beide in `codex/uncommitted-cohort-review`, der heute **alle** Security-Branches als Vorfahren enthält. Offen ist kein Merge, sondern:
**ein Fast-Forward von `codex/uncommitted-cohort-review` nach `main` (145 Commits, da `main` vollständiger Vorfahre ist)** plus Cleanup.

---

## 7 — Vorgeschlagene Batch-/Merge-Reihenfolge (Phase 2)

1. **A1 — Kategorie A committen, in vier Kohorten** (Reihenfolge bewusst klein → groß):
   - **K18 Security-Rest:** `src/lib/security/security-txt-expiry.ts` + Test, `scripts/check-security-txt-expiry.ts`, `.github/workflows/security-headers-drift-check.yml`, `package.json`, `T_SECURITY_HARDENING/10_security_txt_rfc9116.md`, `worldmap/60_MOBILE_LCP_ROUTE_STATUS.md`
   - **K19 Planungs-/Doku-Pakete:** `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/**` (nach Gate G8), `T_RATE_LIMITING_ABUSE_PREVENTION/{Uebersichtsdateien/**, 03_*round2, 07_*round2, 11_execution_handoff_prompt}`, `T_SECURITY_HARDENING/12_*`, `T_FRONTEND/Planungsdateien/23_*` + `24_*`, `t_claude_code/Lerneffekt Jan/`
   - **K20 `t_claude_code`-Delta** (28 Dateien) + `.claude/agent-evals/…/runs/…`
   - **K21 Code-Rest:** `crash-multiplayer-styles.ts` + Test (als Einheit), `tsconfig.json` (mit Begründung), `.claude/agents/11_residue_scout.md` + README
   - **Nicht im LLM-Scope (Jan):** `CLAUDE.md`, `GEMINI.md`, `crash/CLAUDE.md`, `crash-multiplayer/CLAUDE.md`
2. **A4 — Konflikt-Auflösung verifizieren** (read-only Diff-Review der 4 gemischten Dateien: `c9a45eec` vs. beide Eltern). Bricht die Verifikation, ist der Merge-Commit zurückzunehmen — **K5, Jan-Freigabe**.
3. **A6/A6b — Stash- und Ignorierte-Triage** (Report; `drop` nur durch Jan).
4. **A7 — Gates scharf fahren:** erst `npm ci` + `npm run allow-scripts` (G7), dann `typecheck` / `test` / `lint` / `build` auf dem vollen Baum.
5. **G6 — Fast-Forward nach `main` + Push** (Jan). Danach läuft CI erstmals gegen `main`.
6. **A9 — Cleanup nach erfolgreichem Push:** Branches (`hardening-*` ×4, `round3-security-merge`, `security-round3-final-merge`, `security-hardening-round2-merge`, `startseite-v2-exec`), 5 Neben-Worktrees, 3 Stashes, `recovery-dropped-stash`.

---

## 8 — Übersicht für Jan & Ausführungs-LLM (Phase 2, 100 % LLM-Zuständigkeit außer an Gates)

| Nummer | Meilenstein                         | Scope (Dateien)                                                                             | Ausführung             | Status              | Zuständigkeit                    | Verifikation                                         |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- | ------------------- | -------------------------------- | ---------------------------------------------------- |
| A1     | Phase-1-Audit (dieser Report)       | read-only                                                                                   | Sequenziell            | 🟢 Umgesetzt        | LLM                              | Zahlen in §2/§3 mit Uhrzeit belegt                   |
| A2     | K18 Security-Rest committen         | 6 Pfade                                                                                     | Sequenziell            | 🔴 Geplant          | LLM                              | `npm test` (Security-Suite)                          |
| A3     | K19 Planungs-/Doku-Pakete committen | 34 Pfade                                                                                    | Sequenziell (nach G8)  | 🔴 Geplant          | LLM                              | `check-doc-links`, keine Links auf Untracked         |
| A4     | Konflikt-Auflösung verifizieren     | **18 Dateien** (7 in `caf95a5c` + 11 in `c9a45eec`; read-only) — erledigt in **Plan 04 §4** | Sequenziell            | 🟢 2026-09-18 21:59 | LLM                              | je Datei Blob-Hash + Begründung + 4 Verlustprüfungen |
| A5     | `recovery-dropped-stash` bewerten   | 415 Pfade (read-only)                                                                       | Sequenziell            | 🔴 Geplant          | LLM (Bewertung) / Jan (Löschung) | Diff-Review, Restrisiko benannt                      |
| A6     | K20 `t_claude_code`-Delta committen | 29 Pfade                                                                                    | Sequenziell            | 🔴 Geplant          | LLM                              | `check-doc-links`                                    |
| A7     | K21 Code-Rest committen             | 5 Pfade                                                                                     | Sequenziell            | 🔴 Geplant          | LLM                              | `typecheck` + `test` + `code-reviewer`               |
| A8     | Stash- + Ignorierte-Triage          | 3 Stashes, 62 ignorierte Einträge                                                           | Sequenziell            | 🔴 Geplant          | LLM (Report)                     | `git stash show --stat <hash>` je Eintrag            |
| A9     | Gates scharf fahren                 | —                                                                                           | Sequenziell (nach G7)  | 🔴 Geplant          | LLM                              | `typecheck`/`test`/`lint`/`build` Exit 0             |
| A10    | Jan-Scope-Commit                    | `CLAUDE.md`, `GEMINI.md`, 2× Verzeichnis-`CLAUDE.md`                                        | —                      | ⛔ Jan              | Jan                              | —                                                    |
| A11    | Fast-Forward nach `main` + Push     | 145 Commits                                                                                 | Sequenziell (nach G6)  | ⛔ Jan-Gate         | Jan                              | CI-Run gegen `main`                                  |
| A12    | Branch-/Worktree-/Stash-Cleanup     | 8 Branches, 5 Worktrees, 3 Stashes                                                          | Sequenziell (nach A11) | ⛔ Jan-Gate         | LLM nach Freigabe                | alle Branches ⊆ `main` per `git branch --merged`     |

**Fan-out:** keiner. Alle Schritte sind Git-Operationen auf demselben Branch (zwingend sequenziell) und stark unterschiedlich groß — Kriterium 6 der Fan-out-Schwelle ist nicht erfüllt. **Kein `/cost`-Eintrag in `t_claude_code/agents/15a_parallele_subagenten_status.md` §3**, weil kein Agent-Batch gefahren wurde.

---

## 9 — K5-Liste: Was Jans ausdrückliche Freigabe braucht

| #   | Aktion                                                                            | Wirkung                                                                                              | Rückweg                                                                                                                |
| --- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| G6  | Fast-Forward `codex/uncommitted-cohort-review` → `main` + `git push`              | 145 Commits / 2.261 Dateien werden öffentlich; CI läuft erstmals gegen `main`                        | **Nur begrenzt:** Rücksetzen von `main` erfordert Force-Push. Vorher `git branch backup-main main` anlegen (empfohlen) |
| G7  | `npm ci` + `npm run allow-scripts` in `V:\VibeCoding\Casino`                      | installiert `node_modules` vollständig (aktuell unvollständig, s. §10); Voraussetzung für alle Gates | `node_modules` löschen und neu installieren                                                                            |
| G8  | Neuen Themenordner `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/` versionieren            | 17 Dateien werden Repo-Bestandteil; SOP 03 verlangt dafür Jan-Abstimmung                             | `git rm -r --cached` + Ordner verschieben                                                                              |
| G9  | 3 Stashes droppen (`33a5a09e`, `40fb4e31`, `7207f0f1`)                            | Stash-Refs verschwinden                                                                              | **Keiner** — nur bis `git gc` als unreachable Objekt rettbar; Hashes hier notiert                                      |
| G10 | `recovery-dropped-stash` löschen (Tip `cfa8522d`)                                 | Rettungs-Branch weg                                                                                  | Hash `cfa8522d` notiert; bis `gc` rettbar                                                                              |
| G11 | 8 Branches + 5 Neben-Worktrees entfernen (`git branch -d`, `git worktree remove`) | Refs und Arbeitsverzeichnisse weg                                                                    | Branches per Hash/Reflog wiederherstellbar; Worktrees neu anlegbar                                                     |
| G12 | Falls A4 (Konflikt-Verifikation) fehlschlägt: Merge `c9a45eec` zurücknehmen       | 35 Dateien des Round-3-Merges aus HEAD entfernen                                                     | `git reset --hard caf95a5c` wäre destruktiv — nur mit vorherigem Backup-Branch                                         |

**Nicht in der K5-Liste, weil nicht nötig:** Konfliktauflösung (keine offenen Konflikte), weitere Merges (alle Branches sind bereits Vorfahren).

---

## 10 — Was ich NICHT angefasst habe / Was ich nicht sicher weiß

**Nicht angefasst (Phase-1-Grenze, eingehalten):** keine schreibende Git-Operation (kein `add`/`commit`/`merge`/`rebase`/`stash`-_apply/pop/drop_/`checkout`/`restore`/`reset`/`clean`/`worktree`-Mutation), keine Konfliktauflösung, keine Fremd-Branches, keine Fremd-Worktrees, keine Stash-Änderung, kein `--no-verify`, kein Push, keine Supabase-/Remote-/Migrations-Aktion, keine UI-Bewertung, `CLAUDE.md`/`AGENTS.md`/`GEMINI.md`/Verzeichnis-`CLAUDE.md` nicht editiert.

**Angefasst (Doku, im Auftrag):** diese Plandatei neu angelegt und die Statuszeile von Plan 02 in `T_REPO_HYGIENE/00_REPO_HYGIENE_UEBERSICHT.md` korrigiert (stand noch auf „🔴 Geplant (Scope-Freigabe offen)", obwohl Plan 02 seit `aa7fdb5f` Executed ist) + Zeile für Plan 03 ergänzt. **`worldmap/00_WORLDMAP_STATUS.md` habe ich bewusst nicht angefasst** — die Datei ist gerade Arbeitsgegenstand der Parallel-Session; die Registrierung des Plans dort bleibt offen (Nachtrag nach Beruhigung des Baums).

**Was ich nicht sicher weiß (ehrlich, nicht geraten):**

1. **Gates sind NICHT verifiziert.** `npm run typecheck` und `npm test` brachen um 21:18:29 beide mit Exit 1 ab — Ursache ist **kein** Typ-/Testfehler, sondern die Umgebung: `node_modules` ist unvollständig (`next`, `react`, `typescript`, `vitest`, `eslint` fehlen; `node_modules/.bin` existiert nicht) und wurde zum Messzeitpunkt **gerade neu installiert** (59 npm-Staging-Verzeichnisse). Ursache ist `.npmrc` mit `ignore-scripts=true` in Kombination mit einem laufenden/abgebrochenen Install der Parallel-Session. **Ich kann daher nicht sagen, ob der aktuelle Baum grün ist.**
2. **Inhalt der drei Stashes** ist nicht bewertet (nur Umfang gemessen) — ob ihre Änderungen heute noch gelten, weiß ich nicht.
3. **Inhalt der ignorierten Arbeitsverzeichnisse** (`Workroom/`, `output/`, `scratch/`, `web/`, `worldmap/.research/`, …) ist ungeprüft.
4. **Die inhaltlichen Konfliktauflösungen** sind von der Parallel-Session erstellt und von mir nur gehasht, **nicht inhaltlich geprüft** — das ist Meilenstein A4. **Nachtrag 22:00:** nachgeholt in Plan 04 §4 — vollständige Menge **18 Auflösungen** (7 + 11), davon 10 handkomponiert (MIXED), 4× OURS und 4× THEIRS; alle 4 OURS-Fälle auf Verlust geprüft (kein Verlust).
5. **Jans ~92.000 ist nicht reproduziert.** Die Quelle kenne ich nicht; meine Zuordnung zu Kategorie B ist eine begründete Hypothese, kein Beleg.
6. **Ob die Parallel-Session weiterarbeitet**, weiß ich nicht. Beim Schreiben dieses Berichts waren die letzten Datei-Mtime-Werte < 1 Minute alt (21:19).

---

## 11 — Offene Risiken

- **Race mit der Parallel-Session:** Jeder Commit in Phase 2 kann mit ihr kollidieren (in Runde 2 hat genau das K10/K11 übernommen und einen `lint-staged`-Abbruch erzeugt). Gegenmaßnahme: Staging und Commit in **einem** Befehl, vorher `git status --porcelain` auf MM/AM prüfen, unmittelbar vorher neu messen.
- **`tsconfig.json` (+17/−4)** ist die riskanteste Einzeldatei der Kategorie A — eine Konfigurationsänderung kann Build/Tests global verschieben. Vor Commit: Diff lesen und begründen (A7).
- **Branch-Cleanup vor erfolgreichem CI-Lauf** wäre der klassische Fehler — A12 erst nach A11.
- **Der Push (G6) ist der erste Moment, in dem CI gegen `main` läuft** — die fünf toten Doc-Links aus Runde 2 wurden in K14 bereits gelöst, ein _neuer_ Link-Blocker kann in den 90 uncommitteten Dateien stecken. Deshalb A3/A6 mit `check-doc-links` vor G6.
