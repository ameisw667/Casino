# 04 — Phase 4: Ordnerstruktur-Reform & Hygiene-Guards (Plan)

> **Status:** Execution-Ready · **Stand:** 2026-09-19 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Top-10% Ordnerarchitektur, scripts/-Modularisierung und Aktivierung robuster CI-Guards  
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                 | Scope (Dateien/Verzeichnisse)                                       | Ausführung  | Status     | Zuständigkeit  | Verifikation                                         |
| :----- | :------------------------------------------ | :------------------------------------------------------------------ | :---------- | :--------- | :------------- | :--------------------------------------------------- |
| **L0** | Strukturanalyse Root & Verzeichnisse        | Root-Ebene (57 Ordner)                                              | Sequenziell | 🔴 Geplant | LLM            | Zielstruktur mit Jan abgestimmt                      |
| **L1** | Clusterung der 17 thematischen `T_*`-Ordner | `T_*` -> `workspace/domains/`                                       | Sequenziell | 🔴 Geplant | LLM (Jan Gate) | Root auf <15 Ordner reduziert                        |
| **L2** | Binnenstruktur-Standardisierung             | Jeder Domänen-Ordner erhält `active/`, `archive/`, `00_OVERVIEW.md` | Sequenziell | 🔴 Geplant | LLM            | Einheitliche Binnenstruktur in allen Domänen         |
| **L3** | Modularisierung von `scripts/`              | 136 Skripte, 54 `capture-*.mjs`                                     | Sequenziell | 🔴 Geplant | LLM            | `scripts/benchmarks/`, `scripts/ci/`, `scripts/ops/` |
| **L4** | Hygiene-Guards auf Arbeitsbranch            | `.github/workflows/quality-ci.yml`, `scripts/check-doc-links.mjs`   | Sequenziell | 🔴 Geplant | LLM            | Guards prüfen alle Branches & Verzeichnisse          |
| **L5** | End-to-End Test- & Build-Prüfung            | Vollständige Suite                                                  | Sequenziell | 🔴 Geplant | LLM            | `npm run test` & `npm run build` grün                |

---

## 2 — Detaillierte Umsetzungsschritte

### L1: Zielarchitektur Root-Ebene (Best Practice Top 10%)

Vorher: **57 Ordner im Root**  
Nachher: **12 übersichtliche Kernordner im Root**

```
Casino/
├── .github/              # CI/CD Workflows
├── src/                  # Next.js App, Components, Service Layer
├── public/               # Statische Assets (kanonisiert nach Plan B02)
├── supabase/             # Migrationen, Seeds, RLS
├── tests/                # E2E & globale Tests
├── scripts/              # Modularisierte Helfer (ci, ops, benchmarks)
│
├── xx_docs/              # Kanonische Systemkarte (Architektur, Invarianten)
├── xx_sop/               # Standard Operating Procedures & Templates
├── worldmap/             # Globale Status- und Meilensteinkarte
│
├── workspace/            # [NEU] Strukturierte Arbeitsbereiche
│   ├── domains/          # Die ehemaligen 17 T_*-Ordner gebündelt nach Domänen
│   │   ├── frontend/     # (ex T_FRONTEND)
│   │   ├── database/     # (ex T_DATABASE)
│   │   ├── security/     # (ex T_SECURITY_HARDENING, T_AUTH_AUTHORIZATION, T_RATE_LIMITING)
│   │   ├── intelligence/ # (ex T_ANALYTICS_..., T_OBSERVABILITY_...)
│   │   └── ai_agents/    # (ex T_LLM, t_claude_code, Z_LLM)
│   └── hygiene/          # (ex T_REPO_HYGIENE & T_CODE_QUALITAET_LLM_KONSOLIDIERUNG)
│
└── docs/                 # Kanonisches Archiv (docs/archive/)
```

### L3: Binnenstruktur `scripts/`

- Die 54 einmaligen `capture-*.mjs`-Skripte werden in `scripts/legacy_captures/` oder `scripts/benchmarks/captures/` verschoben.
- Nur die ~15 tatsächlich genutzten Utility- und CI-Skripte verbleiben im Root von `scripts/`.

### L4: CI-Guards aktivieren

- `quality-ci.yml` wird so konfiguriert, dass sie nicht nur auf `main`, sondern auf allen PRs und Feature-Branches triggert.
- `check-doc-links.mjs` wird erweitert, sodass alle aktiven Markdown-Dateien kontinuierlich auf tote Links geprüft werden.
