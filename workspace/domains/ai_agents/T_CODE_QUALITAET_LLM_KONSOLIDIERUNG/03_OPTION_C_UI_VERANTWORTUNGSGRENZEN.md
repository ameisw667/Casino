# Option C — UI-Verantwortungsgrenzen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM
> **Scope:** Admin-Evals und Testing-Sandbox-Chrome unter einer festen lokalen UI-Baseline.
> **Money-Pfad:** Nein · **Security-Review:** Nein

## Bewertung

| Lerneffekt | Aufwand/Komplexität | Risiko | Wartbarkeit | Gewichteter Score |
| ---------: | ------------------: | -----: | ----------: | ----------------: |
|        4,8 |                 4,0 |    4,2 |         4,7 |       **4,4 / 5** |

| ID  | Befund                                                                                 | Baseline-Policy                                                      | Ausführung  | Verifikation                          | Plan                                                                    |
| --- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------- | ------------------------------------- | ----------------------------------------------------------------------- |
| C01 | AdminEvalsClient vereinigt Fetch/Reload, KPI, Charts und Feedbacktabelle in 771 Zeilen | P3: /admin/evals in Desktop/Mobile mit vier Zuständen festhalten     | Sequenziell | Datenvertrag, Retry, Zustände         | [C01](Planungsdateien/10_c01_admin_evals_verantwortungsgrenzen_plan.md) |
| C02 | Testing 7.1–7.4 wiederholen Chrome; 7.3/7.4 shared.ts sind identisch                   | P3: vier Routen in Desktop/Mobile plus lokale Interaktion festhalten | Sequenziell | vier Routen, Varianten, Interaktionen | [C02](Planungsdateien/12_c02_testing_sandbox_chrome_plan.md)            |

UsersPageClient, Wallet, XP, Level, Crash-Loops, RNG, Auth, API, Supabase, globale Design-Tokens und fachliche Varianteninhalte bleiben unverändert. Die aktuelle lokale Darstellung ist Vertrag.
