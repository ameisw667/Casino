# Domänen-Navigator: AI Agents & Developer Tooling

> **Domäne:** `workspace/domains/ai_agents` · **Stand:** 2026-09-19  
> **Zweck:** Zentrale Navigation für LLM-Pair-Programming, MCP-Server, CLI-Tools und Repo-Hygiene.

---

## 1 — Modulübersicht

| Modul                | Verzeichnis                                                                                                                        | Beschreibung                                | Status   |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ | :------- |
| **LLM Guides**       | [`T_LLM/`](./T_LLM/00_LLM_UEBERSICHT.md)                                                                                           | Prompts, Token-Ökonomie, Pair-Programming   | 🟢 Aktiv |
| **MCP Tooling**      | [`T_MCP/`](./T_MCP/00_MCP_UEBERSICHT.md)                                                                                           | Model Context Protocol Server & Anbindungen | 🟢 Aktiv |
| **CLI & Automation** | [`T_CLI/`](./T_CLI/00_CLI_UEBERSICHT.md)                                                                                           | Terminal-Tools, Automation, Rancher         | 🟢 Aktiv |
| **Repo-Hygiene**     | [`T_REPO_HYGIENE/`](./T_REPO_HYGIENE/00_REPO_HYGIENE_UEBERSICHT.md)                                                                | Arbeitsbaum-, Commit- & Wissens-Hygiene     | 🟢 Aktiv |
| **Code-Qualität**    | [`T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/`](./T_CODE_QUALITAET_LLM_KONSOLIDIERUNG/00_CODE_QUALITAET_LLM_KONSOLIDIERUNG_UEBERSICHT.md) | Code-Konsolidierung & LLM-Kontext           | 🟢 Aktiv |

---

## 2 — Binnenstruktur

- `active/` — Aktuelle Tooling- und Agenten-Evaluierungen
- `archive/` — Abgeschlossene Session-Logs & Tool-Vergleiche
- `references/` — MCP-Konfigurationen, Custom Agent Prompts & Skills

---

## 3 — Wichtigste Invarianten

- **Jan-Planner Standard:** Klare Trennung von Planung und Execution.
- **Top 10% Informationsdichte:** Keine Prosa-Wände; Signal vor Rauschen.
- **Fail-Closed Execution:** Keine unautorisierten destruktiven Befehle (Gate K5).
