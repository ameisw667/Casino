# 01 — Load-Audit: 58 globale Commands (Vorschlag, nicht ausgeführt)

> **Status:** 🟡 Vorschlag erstellt, wartet auf Jans Prüfung · **Stand:** 2026-09-05 · **Owner:** Audit = LLM, Freigabe = Jan · **Auslöser:** Fortführung des globalen ECC-Audits ([`01_11`](../01_11_globale_ecc_regeln_audit.md)); Vorläufer: das Gesamtaudit vom 2026-08-30 (Protokoll `01_13`, gelöscht — dort war Kategorie „Kern-relevant (51)" nie einzeln verifiziert).
> **Kernfakt:** Alle 58 Command-Beschreibungen laden in jede Session (Slash-Liste). Live gemessen: **≈ 5.480 Zeichen ≈ 1.350 Token/Session.**

---

## 1 — Gruppierung der 58 (live gezählt, Zeichen je Beschreibung)

| Gruppe                         | Commands                                                                                                                                                                                      | Zeichen Σ | Bewertung                                                                                                        |
| :----------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: | :--------------------------------------------------------------------------------------------------------------- |
| **Eigenbau/Brain** (`om-*`)    | `om-dump` (186), `om-humanize` (101), `om-standup` (103), `om-weekly` (133), `om-project-archive` (**0**), `om-vault-audit` (**0**), `om-wrap-up` (**0**)                                     |    523    | 🟢 Eigenbau, nicht ECC — aber 3 ohne `description:` (leer). Entweder nachpflegen oder entfernen, wenn ungenutzt. |
| **Session-Workflow**           | `save-session` (131), `resume-session` (131), `checkpoint` (79), `sessions` (66), `aside` (133)                                                                                               |    540    | 🟢 Aktiv genutzt (lt. CLAUDE.md-Session-Kontinuität). Behalten.                                                  |
| **Lernen**                     | `learn` (97), `learn-eval` (141)                                                                                                                                                              |    238    | 🟢 `learn-eval` laut CLAUDE.md aktiv. Behalten.                                                                  |
| **Planung/PR**                 | `plan` (186), `plan-prd` (158), `pr` (157), `feature-dev` (77), `project-init` (127)                                                                                                          |    705    | 🟢 Behalten.                                                                                                     |
| **Code-Review/Qualität**       | `code-review` (146), `review-pr` (48), `build-fix` (98), `quality-gate` (86), `security-scan` (74), `python-review` (132), `test-coverage` (88), `refactor-clean` (73), `prune` (68)          |    813    | 🟢 Behalten.                                                                                                     |
| **Skill-/ECC-Wartung**         | `skill-create` (128), `skill-health` (63), `sync-claude` (77), `ecc-guide` (116), `harness-audit` (80), `auto-update` (106), `update-codemaps` (69), `update-docs` (92), `update-docs`-Gruppe |    801    | 🟡 Selten genutzt, aber harmlos klein — Nutzungsbeleg offen.                                                     |
| **`prp-*` (bewusst behalten)** | `prp-commit` (154), `prp-implement` (94), `prp-plan` (148), `prp-pr` (157), `prp-prd` (178)                                                                                                   |    731    | 🟡 Jans Entscheidung 2026-08-30: behalten. Hinweis bleibt: zweites Planungssystem neben `xx_sop/01`–`03`.        |
| **`hookify`-Familie**          | `hookify` (94), `hookify-configure` (45), `hookify-help` (32), `hookify-list` (33)                                                                                                            |    204    | 🟡 Nutzungsbeleg offen.                                                                                          |
| **`instinct-*`-Familie**       | `instinct-export` (52), `instinct-import` (59), `instinct-status` (57)                                                                                                                        |    168    | 🟡 Nutzungsbeleg offen.                                                                                          |
| **Loop/Agent-Betrieb**         | `loop-start` (90), `loop-status` (83), `santa-loop` (111), `model-route` (89), `evolve` (60), `gan-build` (98), `gan-design` (102)                                                            |    633    | 🟡 Verdachtsgruppe: Nischen-Workflows, in keiner beobachteten Session gesehen.                                   |
| **Sonstige Kleinbefehle**      | `cost-report` (98), `projects` (49), `promote` (48)                                                                                                                                           |    195    | 🟡 Nutzungsbeleg offen.                                                                                          |

---

## 2 — Findings

### F1 — 3 Eigenbau-Commands ohne Beschreibung

`om-project-archive`, `om-vault-audit`, `om-wrap-up` haben **kein** `description:`-Feld. In der Session-Liste erscheinen sie dadurch leer bzw. mit Body-Text-Fallback — unsauber und inkonsistent.
**Vorschlag:** Entweder kurze Beschreibung nachpflegen (einmalig, 3 Zeilen Arbeit) oder — falls Jans Brain-Workflow sie nicht mehr nutzt — in denselben Prüflauf wie die übrigen `om-*` aufnehmen.

### F2 — „Loop/Agent-Betrieb" ist der größte Verdachtsblock (633 Zeichen)

7 Commands für autonome Loop-/Routing-Szenarien (`santa-loop`, `model-route`, `gan-build`, `gan-design`, `evolve`, `loop-start`, `loop-status`). In dieser und den zuletzt beobachteten Sessions nie aufgerufen.
**Vorschlag:** Jan prüft persönlich: ungenutzt → entfernen; „evtl. später" → behalten. Dieselbe Kategorie, in der am 2026-08-30 schon 9 fachfremde Commands entfernt wurden.

### F3 — Familien-Bündel als Lösch-Cluster

`hookify*` (4), `instinct-*` (3), `gan-*` (2) sind nur im Bündel sinnvoll (Einzel-Löschung bricht die Familie). Wenn eine Familie ungenutzt ist, komplett entfernen — Ersparnis jeweils klein (204/168/200 Zeichen), aber sie addieren sich.

---

## 3 — Handlungsoptionen (wartet auf Jan)

|  #  | Maßnahme                                                     |       Zeichen-Ersparnis       | Anmerkung                                                  |
| :-: | :----------------------------------------------------------- | :---------------------------: | :--------------------------------------------------------- |
|  1  | 3 leere `om-*`-Beschreibungen nachpflegen ODER Gruppe prüfen | 0 (Pflege) / ~220 (Entfernen) | Pflegung empfohlen, wenn die Brain-Workflows aktiv bleiben |
|  2  | Loop/Agent-Betrieb-Gruppe: Jan prüft 7 Commands              |           bis ~633            | Größter Einzelhebel                                        |
|  3  | `hookify*` / `instinct-*` Familien prüfen                    |           bis ~372            | Nur Bündel-Entscheidung                                    |
|  4  | Rest (Session/Planung/Review/Eigenbau)                       |               —               | Kein Handlungsbedarf                                       |

**Maximalpotenzil:** Commands-Liste 5.480 → ~4.250 Zeichen (−22 %) — deutlich kleiner als der Agents/Skills-Hebel, aber der einzige Bereich, der nie einzeln verifiziert war.

---

## 4 — Selbstprüfung

- [x] Alle 58 Beschreibungslängen live gemessen (2026-09-05); 3 leere Felder explizit ausgewiesen.
- [x] Jans Entscheidungen von 2026-08-30 respektiert (`prp-*` behalten, 16+9 entfernte bleiben entfernt).
- [x] Kein Command wurde geändert oder gelöscht — reiner Vorschlag.
