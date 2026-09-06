# 01.14 — Hauptaudit: Globale Ebene Restbilanz (MCP-Server + Commands/Hooks/Memory/Permissions)

> **Status:** 🟡 Audit erstellt, Entscheidungen offen · **Stand:** 2026-09-06 (Live-Messung) · **Owner:** Jan + LLM
> **Anlass:** Nach Abschluss von Skills ([skills/14](skills/14_top_level_skills_load_audit.md), [01_12](01_12_gstack_hauptaudit.md)) und Agenten ([01_13](01_13_agenten-global.md)) die übrigen globalen Kontext-Blöcke. Nur dort eigene Audit-Dateien, wo Ballast messbar ist.

---

## 1 — Session-Start-Rangliste nach Bereinigung von Skills/Agenten

| Rang | Block                                                               |   Geschätzte Token    | Audit-Status                                                                                                       |
| :--: | :------------------------------------------------------------------ | :-------------------: | :----------------------------------------------------------------------------------------------------------------- |
|  1   | **MCP-Server** (7 aktiv in Casino-Sessions)                         |   **~4.000–6.000**    | 🟡 **dieses Audit (§2)**                                                                                           |
|  2   | ECC-Regeln `common`+`web`                                           |        ~6.000         | ✅ [01_11](01_11_globale_ecc_regeln_audit.md) — bewusst breit, kein Handlungsbedarf                                |
|  3   | **Commands** (58 global, Namen+Kurzbeschreibung in der Skill-Liste) |        ~1.500         | 🟡 vorhanden: [commands/01](commands/01_commands_load_audit.md) liegt auf Jans Review — **keine neue Datei nötig** |
|  4   | Skills (9 global)                                                   |        ~1.030         | ✅ [skills/14](skills/14_top_level_skills_load_audit.md)                                                           |
|  5   | Casino-CLAUDE.md/AGENTS.md                                          |        ~2.800         | ✅ bewusst gepflegt                                                                                                |
|  6   | Hooks aktiv                                                         | ~0 (kein Prompt-Text) | ✅ [hooks/01](hooks/01_hooks_active_audit.md)                                                                      |
|  7   | Memory-Files, Permissions, Session-Memory                           |      ~300 gesamt      | ✅ **Restbilanz (§3): kein sinnvoller Ballast**                                                                    |

---

## 2 — MCP-Server: Inventur und Befunde

### 2a — Aktive Server in Casino-Sessions

| Server           | Quelle                                         | Umfang im Kontext                           | Nutzung/Einschätzung                                     |
| :--------------- | :--------------------------------------------- | :------------------------------------------ | :------------------------------------------------------- |
| `playwright`     | Casino `.mcp.json`                             | **~25 Tool-Schemas** (größter Einzelserver) | 🟢 Kern-QA-Werkzeug seit GStack-Löschung                 |
| `context7`       | Casino `.mcp.json`                             | 2 Tools + Instructions                      | 🟢 Doku-Quelle, aktiv genutzt                            |
| `sentry`         | Casino-Projekt-Config (http, `mcp.sentry.dev`) | ~6 direkte Tools + Tool-Katalog             | 🟢 Casino nutzt Sentry; Seer-Analyse nur auf Anfrage     |
| `github-issues`  | Casino-Projekt-Config (http, readonly)         | 6 Tools + **Instructions-Block**            | 🟡 **Tripel-Duplikat — siehe 2b**                        |
| `github-prs`     | Casino-Projekt-Config (http, readonly)         | 6 Tools + **derselbe Instructions-Block**   | 🟡 dito                                                  |
| `github-actions` | Casino-Projekt-Config (http, readonly)         | 4 Tools + **derselbe Instructions-Block**   | 🟡 dito                                                  |
| `llm-usage`      | global (http, eigener Endpoint)                | 2 Tools (Kosten-Abfrage)                    | 🟢 Jans Kosten-Tracking                                  |
| `vercel`         | global (`mcp.vercel.com`)                      | 0 Tools sichtbar in Casino-Sessions         | 🟡 prüfen: liefert der Server in Casino überhaupt etwas? |

### 2b — Hauptbefund: GitHub-Tripel-Duplikat

Die 3 GitHub-Server sind der offizielle GitHub-Copilot-MCP mit **getrennten Toolset-Endpunkten** (`/mcp/x/issues`, `/mcp/x/pull_requests`, `/mcp/x/actions`, jeweils readonly). Folge: **dreimal derselbe Instructions-Block** (Liste-/Such-Hinweise, Pagination, Issue/PR-Regeln) in jeder Casino-Session — ~1.200 Token Instructions gesamt, davon ~800 reine Verdreifachung. Dazu 3× Schema-Overhead.

**Optionen:**

| Option                 | Maßnahme                                                                                                              | Effekt                                                 |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| **A: Zusammenlegen**   | Ersetzen durch den **einzigen Sammel-Endpoint** `https://api.githubcopilot.com/mcp/` (alle Toolsets, 1× Instructions) | ~800–1.000 Token/Session gespart, volle Funktionalität |
| **B: Bedarfs-Slicing** | Nur die Toolsets behalten, die in Transkripten real genutzt werden (Usage-Check vorab)                                | Weniger als A möglich, je nach Nutzung                 |
| **C: Belassen**        | Readonly-Separation als bewusste Sicherheitsentscheidung                                                              | 0 Ersparnis                                            |

### 2c — Randfund (nicht Casino-Ballast)

Projekt `D:/ZZ - VibeCoding/SkillTesting` hat **11 konfigurierte MCP-Server** (notion, supabase, memory, sequential-thinking, fal-ai, …) in `.claude.json`. Lädt nur in jenem Projekt — dort bei Gelegenheit aufgeräumen, falls das Projekt veraltet ist.

---

## 3 — Restbilanz: Blöcke ohne sinnvollen Ballast

| Block                  | Messung                                                                                                           | Urteil                                                                                              |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Hooks**              | 3 Typen aktiv (PreToolUse/PostToolUse auf Write-Edit, Stop) — hookify-generierte node-Snippets in `settings.json` | Kein Prompt-Text, kein Kontext-Ballast; [hooks/01](hooks/01_hooks_active_audit.md) deckt Wartung ab |
| **Permissions**        | Allowlist-Regeln in `settings.json`                                                                               | Reine Maschinenkonfiguration, 0 Token                                                               |
| **Memory-Files**       | `MEMORY.md` 6 Einträge (~500 Zeichen), projektgebunden                                                            | Korrekt gescoped, sauber                                                                            |
| **Session-Memory**     | `session-data/` 1 Datei; Commands `checkpoint`/`save-session`/`resume-session`                                    | Funktionierendes System, kein Ballast                                                               |
| **Kontext-Management** | Keine eigenen globalen Mechaniken außer CLAUDE.md-Imports + Brain-Router                                          | Schlank                                                                                             |

---

## 4 — Entscheidungsvorlage

1. **GitHub-Tripel** → Option A (zusammenlegen) empfohlen; ich baue die Config-Änderung in der Casino-Projekt-Config auf deine Freigabe.
2. **`vercel` global** → kurz testen (1 Session beobachten) oder direkt entfernen, falls keiner deiner Workflows ihn anspricht.
3. **commands/01 + hooks/01 + agents/14** → liegen weiterhin auf dein Review; das sind die letzten drei offen liegenden Alt-Audits.
4. SkillTesting-11-Server (Randfund) → separates Mini-Audit nur falls gewünscht.
