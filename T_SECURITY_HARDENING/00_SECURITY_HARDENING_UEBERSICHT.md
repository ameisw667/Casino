# 00 — Security Hardening: Verbesserungsplan

> **Stand:** 2026-09-13 · **Ist-Schnitt nach Ausführung der Pläne 01/02/04/06 (2026-09-13):** Top 14 % · **Davor (frische Recherche, 2026-09-12, vor Ausführung):** Top 18 %

## Was dieser Stand bedeutet

Jede der 10 Säulen wurde am 2026-09-12 einzeln neu geprüft (Säulen 3/5/7/8: Verifikation des bereits ausgeführten, aber noch nicht in den Hauptbranch gemergten Merge-Stands `security-hardening-round2-merge`; Säulen 1/2/4/6/9/10: frische `casino-code-explorer`-Recherche bzw. — für Säule 2 — direkte Code-Verifikation, da CI/CD-Workflows außerhalb des Scopes von `casino-code-explorer` liegen). Am 2026-09-13 wurden die vier Pläne **01, 02, 04 und 06 vollständig ausgeführt** (isolierte Worktrees, Branch `hardening-csp-script`/`hardening-ci-gate`/`hardening-csrf`/`hardening-csp-reporting`, gemergt in `round3-security-merge`): 5-Stufen-Prüfung grün auf jedem Säulen-Branch und auf dem gemergten Stand (**1605/1605 Tests, Typecheck/Lint/Build fehlerfrei**), Merge-Integrität der zwei bekannten Kollisionspunkte (`red-team-security.yml`, `security-staging.yml`) bewusst verifiziert (beide Seiten enthalten), Security-Reviews durch `security-reviewer` (Säule 4: APPROVE, Säule 2: WARN, Säulen 1+6: WARN — alle Findings ohne CRITICAL/HIGH, Korrekturen für die zwei billigen Findings direkt nachgezogen, Rest dokumentiert in den jeweiligen §9). **Der projizierte Schnitt (Top 14 %) wurde real erreicht** — die Ist-Werte in der Tabelle sind jetzt die realen Nach-Ausführung-Werte aus den §9-Ausführungsergebnissen der Planungsdateien, nicht mehr Projektionen. Veröffentlichung (Merge in `codex/uncommitted-cohort-review`/`main`) wartet auf Jans Freigabe.

## Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                               | Gewicht | Ist-Niveau (2026-09-13) | Projiziert nach Ausführung |                  Status                  |                                 Planungsdatei                                  | Warum dieses Gewicht                                                                 |
| :-: | :---------------------------------- | :-----: | :---------------------: | :------------------------: | :--------------------------------------: | :----------------------------------------------------------------------------: | :----------------------------------------------------------------------------------- |
|  1  | CSP `script-src` Nonce-Härtung      | **15**  |        Top 15 %         |          Top 15 %          | 🟢 Executed (Trusted-Types-Rest bei Jan) |          [`01_csp_script_hardening.md`](./01_csp_script_hardening.md)          | Primäre XSS- und Script-Exfiltrationsgrenze.                                         |
|  7  | Supply-Chain-/Dependency-Audit-Gate | **14**  |        Top 13 %         |          Top 13 %          |                    🟢                    | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) | Ungepatchte Abhängigkeiten können mehrere Grenzen zugleich unterlaufen.              |
|  2  | Security-CI-Gate                    | **13**  |        Top 15 %         |          Top 15 %          |   🟢 Executed (Alerting-Rest bei Jan)    |              [`02_security_ci_gate.md`](./02_security_ci_gate.md)              | Verhindert Sicherheitsregressionen im Hauptstand.                                    |
|  4  | CSRF/Origin-Guard                   | **13**  |        Top 11 %         |          Top 11 %          |         🟢 Executed (kein Rest)          |             [`04_csrf_origin_guard.md`](./04_csrf_origin_guard.md)             | Schützt schreibende Browser-Anfragen und Geldpfade.                                  |
|  8  | Secret-Rotation-Prozess             | **12**  |        Top 18 %         |          Top 18 %          |                    🟢                    |       [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md)       | Ein Secret-Leak kann Service-Role-, HMAC- und Drittanbieter-Grenzen kompromittieren. |
|  3  | Env-/Secrets-Schema Fail-Fast       | **10**  |        Top 10 %         |          Top 10 %          |                    🟢                    |            [`03_env_secrets_schema.md`](./03_env_secrets_schema.md)            | Fehlkonfigurationen werden früh sichtbar; die Abdeckung betrifft nur Kernvariablen.  |
|  5  | Header-Vollständigkeit              | **10**  |        Top 13 %         |          Top 13 %          |                    🟢                    |       [`05_header_vollstaendigkeit.md`](./05_header_vollstaendigkeit.md)       | Breite Browser-Schutzschicht, aber weniger direkt als CSP oder CSRF.                 |
|  6  | CSP-Violation-Reporting             |  **7**  |        Top 11 %         |          Top 11 %          |         🟢 Executed (kein Rest)          |       [`06_csp_violation_reporting.md`](./06_csp_violation_reporting.md)       | Erkennt reale CSP-Verstöße, beobachtet statt zu verhindern.                          |
| 10  | `security.txt` / RFC 9116           |  **5**  |        Top 30 %         |          Top 25 %          |                    🟡                    |      [`10_security_txt_rfc9116.md`](./10_security_txt_rfc9116.md) _(neu)_      | Verbessert verantwortliche Meldungen, ist aber keine Laufzeitbarriere.               |
|  9  | HSTS-Preload                        |  **1**  |         Top 8 %         |          Top 8 %           |                    ⚪                    |                      keine — kein Potenzial (siehe unten)                      | Transportabsicherung, deren Erfolg hier überwiegend an der `.app`-TLD liegt.         |

**Status-Legende:** 🟢 bereits ausgeführt/gehärtet, Erhalt-Modus („Executed"-Suffixe mit Rest-Hinweis = verbleibender K5-Punkt bei Jan bzw. dokumentierter Follow-up) · 🔴 Plan fertig, Execution-Ready, wartet auf eine Ausführungs-Session · 🟡 Plan fertig, aber nur ein kleiner Meilenstein, geringer Hebel · ⚪ geprüft, bewusst kein Plan (kein Potenzial).

**Ist-Schnitt gewichtet (nach Ausführung 01/02/04/06):** (15×15+14×13+13×15+13×11+12×18+10×10+10×13+7×11+5×25+1×8)/100 = **Top 14,0 %** (real, 2026-09-13 — die Projektion von 2026-09-12 wurde exakt erreicht).
**Historie:** Top 18 % (2026-09-12, frische Recherche vor Ausführung — schlechter als der vorherige Headline-Wert Top 14 %, weil die tiefere Recherche echte, bislang unbewertete Lücken fand, z. B. fehlendes SAST/CodeQL bei Säule 2, zwei State-ändernde Routen ohne Origin-Guard bei Säule 4) → **Top 14 % (2026-09-13, nach Ausführung der Pläne 01/02/04/06)**.

## Offene Aufgaben

**Jan-Entscheidungen (K5, nicht LLM-ausführbar) — unverändert aus Runde 2:**

1. `ws`-Dependency-Fix (Säule 7) — Breaking Change für `@trigger.dev/sdk`.
2. HMAC-Versionierung `POSTHOG_DISTINCT_ID_HMAC_SECRET` (Säule 8) — Breaking Change für Analytics-Historie.
3. COEP-Header-Aktivierung (Säule 5) — Entscheidungsgrundlage fertig dokumentiert (`docs/security-hardening/02_security_headers.md`).

**Jan-Entscheidungen (K5) aus der 2026-09-12-Runde — nach Ausführung am 2026-09-13 offen wie geplant (Entscheidungsgrundlagen fertig):** 4. Trusted Types (Säule 1) — Breaking-Change-Risiko für jeden DOM-Sink im Repo, Grundlage in Säule 1/L5 vorbereitet. 5. Externes CI-Failure-Alerting (Säule 2) — benötigt ein neues Secret (Telegram-Bot-Token oder Slack-Webhook), Grundlage in `docs/security-hardening/08_security_ci_gates.md` §9 vorbereitet. 6. Optionale `security.txt`-Felder `Encryption`/`Acknowledgments`/`Policy` (Säule 10) — benötigen jeweils eine neue Ressource (PGP-Key, Hall-of-Fame-Seite, Disclosure-Policy-Seite), die noch nicht existiert. 7. Neu 2026-09-13 (Säule 6, non-blocking): drei GitHub-Repo-Secrets `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` für den CSP-Rate-Watch-Job einmalig hinterlegen — sonst schreibt der Job nur eine „Skipped"-Note (nicht blockierend, Plan §9).

**Technisch, wartet auf Jan (unverändert):** Fertiger, verifizierter Branch `security-hardening-round2-merge` (Säulen 3/5/7/8) muss noch in `codex/uncommitted-cohort-review` gemergt werden — blockiert, solange andere aktive Sessions dieselben Dateien uncommitted halten. Details in [`branch_merge_saeulen_5_7_8_plan.md`](./branch_merge_saeulen_5_7_8_plan.md) — **nicht Teil dieser Planungsrunde, nicht anfassen.**

**Ausführung 2026-09-13 (Branch `round3-security-merge`, wartet auf Jans Freigabe zum Merge):**

- [`01_csp_script_hardening.md`](./01_csp_script_hardening.md) — 🟢 ausgeführt, §9-Ausführungsergebnis in der Datei; K5-Rest: Trusted Types.
- [`02_security_ci_gate.md`](./02_security_ci_gate.md) — 🟢 ausgeführt, §9; K5-Rest: externes Alerting; Abweichung D1 (Concurrency-Blöcke existieren nur uncommittet im Hauptverzeichnis) dort dokumentiert.
- [`04_csrf_origin_guard.md`](./04_csrf_origin_guard.md) — 🟢 ausgeführt, §9; kein K5-Rest; 2 verbleibende Layer-2-Lücken (`auth/login-guard`, `auth/signup-suspicion`) als `OPEN_LAYER_2_GAPS`-Tripwire gepinnt (Korrektur 2026-09-13: `migrate-session`/`session-sync` sind 410-Stubs, jetzt korrekt exempted).
- [`06_csp_violation_reporting.md`](./06_csp_violation_reporting.md) — 🟢 ausgeführt, §9; kein K5-Rest; Repo-Secrets siehe Punkt 7 oben.
- [`10_security_txt_rfc9116.md`](./10_security_txt_rfc9116.md) — noch offen (1 Meilenstein, Reminder-Automatisierung, kein K5-Blocker), wartet auf eine Ausführungs-Session.
