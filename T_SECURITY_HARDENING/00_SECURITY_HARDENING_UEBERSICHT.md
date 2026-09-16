# 00 — Security Hardening: Verbesserungsplan

> **Stand:** 2026-09-13 · **Realer, gewichteter Kategorie-Schnitt (nach Ausführung von Säulen 1/2/4/6):** Top 14,3 %
> **Historie:** Top 16 % (2026-09-06, Runde-1-Aufschlüsselung) → Top 18 % (2026-09-12, frische Recherche vor dieser Runde — schlechter durch tiefere Recherche, ehrliche Dynamik) → **Top 14,3 % (2026-09-13, nach echter Ausführung + echtem Merge von Säulen 1/2/4/6)**.

## Was dieser Stand bedeutet

Jede der 10 Säulen wurde am 2026-09-12 einzeln neu geprüft. Am 2026-09-13 wurden die vier Pläne **01 (CSP-Skript), 02 (CI-Gate), 04 (CSRF), 06 (CSP-Violation-Reporting) real ausgeführt** — nicht nur projiziert: eigene Git-Branches je Säule, Merge in `round3-security-merge`, unabhängig von der Planungs-Konversation gegengeprüft (eigener `npm ci`, eigener Testlauf), **und** anschließend die zuvor nur uncommittet im Hauptverzeichnis liegenden CI-Concurrency-Blöcke real committet und in einem finalen Merge (`security-round3-final-merge`, Commit `45491d52`) zusammengeführt. Die Spalte "Projiziert nach Ausführung" aus der vorherigen Fassung dieser Datei ist damit für diese 4 Säulen **aufgelöst** — die Tabelle unten zeigt den echten Ist-Wert mit Datum, nicht mehr eine Vorhersage.

Säulen 3/5/7/8 sind ebenfalls bereits ausgeführt (Runde 2, 2026-09-07/08), aber ihr Merge in den Hauptbranch ist ein **separates, noch offenes Vorhaben** (`branch_merge_saeulen_5_7_8_plan.md`) — nicht Teil dieser Runde, nicht angefasst. Säule 10 wurde bewusst **nicht** in dieser Runde ausgeführt (Jans Entscheidung, siehe `worldmap/05_ZUKUNFTSPLANUNG.md` Zeile 3.1) — ihr Wert unten ist weiterhin die Baseline, keine Projektion.

## Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                               | Gewicht | Ist-Niveau · wann angepasst                                                           |                  Status                  |                                 Planungsdatei                                  | Warum dieses Gewicht                                                                 |
| :-: | :---------------------------------- | :-----: | :------------------------------------------------------------------------------------ | :--------------------------------------: | :----------------------------------------------------------------------------: | :----------------------------------------------------------------------------------- |
|  1  | CSP `script-src` Nonce-Härtung      | **15**  | **Top 15 %**<br><sub>ausgeführt 2026-09-12, gemergt 2026-09-13</sub>                  | 🟢 Executed (Trusted-Types-Rest bei Jan) |          [`01_csp_script_hardening.md`](./01_csp_script_hardening.md)          | Primäre XSS- und Script-Exfiltrationsgrenze.                                         |
|  7  | Supply-Chain-/Dependency-Audit-Gate | **14**  | **Top 13 %**<br><sub>ausgeführt 2026-09-08, Merge separat offen</sub>                 |                    🟢                    | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) | Ungepatchte Abhängigkeiten können mehrere Grenzen zugleich unterlaufen.              |
|  2  | Security-CI-Gate                    | **13**  | **Top 15 %**<br><sub>ausgeführt 2026-09-12, D1-Bedingung geschlossen 2026-09-13</sub> |   🟢 Executed (Alerting-Rest bei Jan)    |              [`02_security_ci_gate.md`](./02_security_ci_gate.md)              | Verhindert Sicherheitsregressionen im Hauptstand.                                    |
|  4  | CSRF/Origin-Guard                   | **13**  | **Top 11 %**<br><sub>ausgeführt 2026-09-12, gemergt 2026-09-13</sub>                  |         🟢 Executed (kein Rest)          |             [`04_csrf_origin_guard.md`](./04_csrf_origin_guard.md)             | Schützt schreibende Browser-Anfragen und Geldpfade.                                  |
|  8  | Secret-Rotation-Prozess             | **12**  | **Top 18 %**<br><sub>ausgeführt 2026-09-07, Merge separat offen</sub>                 |                    🟢                    |       [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md)       | Ein Secret-Leak kann Service-Role-, HMAC- und Drittanbieter-Grenzen kompromittieren. |
|  3  | Env-/Secrets-Schema Fail-Fast       | **10**  | **Top 10 %**<br><sub>ausgeführt 2026-09-07, Merge separat offen</sub>                 |                    🟢                    |            [`03_env_secrets_schema.md`](./03_env_secrets_schema.md)            | Fehlkonfigurationen werden früh sichtbar; die Abdeckung betrifft nur Kernvariablen.  |
|  5  | Header-Vollständigkeit              | **10**  | **Top 13 %**<br><sub>ausgeführt 2026-09-07, Merge separat offen</sub>                 |                    🟢                    |       [`05_header_vollstaendigkeit.md`](./05_header_vollstaendigkeit.md)       | Breite Browser-Schutzschicht, aber weniger direkt als CSP oder CSRF.                 |
|  6  | CSP-Violation-Reporting             |  **7**  | **Top 11 %**<br><sub>ausgeführt 2026-09-12, gemergt 2026-09-13</sub>                  |         🟢 Executed (kein Rest)          |       [`06_csp_violation_reporting.md`](./06_csp_violation_reporting.md)       | Erkennt reale CSP-Verstöße, beobachtet statt zu verhindern.                          |
| 10  | `security.txt` / RFC 9116           |  **5**  | **Top 30 %**<br><sub>noch nicht ausgeführt — bewusst zurückgestellt</sub>             |                    🔴                    |      [`10_security_txt_rfc9116.md`](./10_security_txt_rfc9116.md) _(neu)_      | Verbessert verantwortliche Meldungen, ist aber keine Laufzeitbarriere.               |
|  9  | HSTS-Preload                        |  **1**  | **Top 8 %**<br><sub>geprüft 2026-09-12, strukturelles Maximum</sub>                   |                    ⚪                    |                      keine — kein Potenzial (siehe unten)                      | Transportabsicherung, deren Erfolg hier überwiegend an der `.app`-TLD liegt.         |

**Status-Legende:** 🟢 ausgeführt (mit oder ohne K5-Rest) · 🔴 Plan fertig, Execution-Ready, noch nicht ausgeführt · ⚪ geprüft, bewusst kein Plan (kein Potenzial).

**Gewichteter Schnitt:** (15×15+14×13+13×15+13×11+12×18+10×10+10×13+7×11+5×30+1×8)/100 = **Top 14,26 %** (gerundet Top 14,3 %). **Korrektur gegenüber einer früheren Zwischenrechnung (Top 14,0 %):** Diese hatte für Säule 10 versehentlich den projizierten Nach-Ausführungs-Wert (25 %) statt des tatsächlichen, unveränderten Baseline-Werts (30 %) verwendet, obwohl Säule 10 nicht Teil dieser Ausführungsrunde war — hier korrigiert.

## Säule #9 (HSTS-Preload): bewusst kein neuer Plan

Frische `casino-code-explorer`-Recherche (2026-09-12) bestätigt: `src/proxy.ts:81` setzt `max-age=63072000; includeSubDomains; preload` — alle drei Voraussetzungen für eine hstspreload.org-Submission sind formal übererfüllt, obwohl keine eigene Submission nötig ist (die `.app`-TLD erzwingt HSTS-Preload für jede Subdomain). Keine eigene Custom-Domain/DNS-Konfiguration im Repo gefunden — die Säule ist strukturell domain-bedingt am Maximum. Der einzige denkbare Hebel (ein TLD-Wechsel weg von `.app`) ist nicht angefragt/geplant und wäre ohnehin ein K5-Punkt (Breaking Change für jede Referenz auf die aktuelle Domain). **Kein LLM-ausführbares Verbesserungspotenzial — bewusst keine Planungsdatei.**

## Offene Aufgaben

**Jan-Entscheidungen (K5, nicht LLM-ausführbar):**

1. `ws`-Dependency-Fix (Säule 7) — Breaking Change für `@trigger.dev/sdk`.
2. HMAC-Versionierung `POSTHOG_DISTINCT_ID_HMAC_SECRET` (Säule 8) — Breaking Change für Analytics-Historie.
3. COEP-Header-Aktivierung (Säule 5) — Entscheidungsgrundlage fertig dokumentiert (`docs/security-hardening/02_security_headers.md`).
4. Trusted Types (Säule 1) — Breaking-Change-Risiko für jeden DOM-Sink im Repo, Grundlage in Säule 1/L5 vorbereitet.
5. Externes CI-Failure-Alerting (Säule 2) — benötigt ein neues Secret (Telegram-Bot-Token oder Slack-Webhook), Grundlage in `docs/security-hardening/08_security_ci_gates.md` §9 vorbereitet.
6. Optionale `security.txt`-Felder `Encryption`/`Acknowledgments`/`Policy` (Säule 10) — benötigen jeweils eine neue Ressource (PGP-Key, Hall-of-Fame-Seite, Disclosure-Policy-Seite), die noch nicht existiert.
7. Drei GitHub-Repo-Secrets `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` für den CSP-Rate-Watch-Job (Säule 6) einmalig hinterlegen — sonst schreibt der Job nur eine „Skipped"-Note (nicht blockierend).

**Technisch, wartet auf Jan (separates, eigenständiges Vorhaben — nicht Teil dieser Planungsrunde):** Fertiger, verifizierter Branch `security-hardening-round2-merge` (Säulen 3/5/7/8) muss noch in `codex/uncommitted-cohort-review` gemergt werden — blockiert, solange andere aktive Sessions dieselben Dateien uncommitted halten. Details in [`branch_merge_saeulen_5_7_8_plan.md`](./branch_merge_saeulen_5_7_8_plan.md).

**Ausgeführt 2026-09-12/13, gemergt in `security-round3-final-merge` (Commit `45491d52`), wartet auf Jans Freigabe zum finalen Merge in `codex/uncommitted-cohort-review`:**

- [`01_csp_script_hardening.md`](./01_csp_script_hardening.md) — §9-Ausführungsergebnis; K5-Rest: Trusted Types.
- [`02_security_ci_gate.md`](./02_security_ci_gate.md) — §9; K5-Rest: externes Alerting; die zuvor uncommitteten Concurrency-Blöcke (Abweichung D1) sind seit 2026-09-13 real committet und mitgemergt.
- [`04_csrf_origin_guard.md`](./04_csrf_origin_guard.md) — §9; kein K5-Rest; 2 verbleibende Layer-2-Lücken (`auth/login-guard`, `auth/signup-suspicion`) als `OPEN_LAYER_2_GAPS`-Tripwire gepinnt.
- [`06_csp_violation_reporting.md`](./06_csp_violation_reporting.md) — §9; kein K5-Rest; 3 Repo-Secrets für Rate-Watch-Job ausstehend (non-blocking).

**Noch nicht ausgeführt, bewusst zurückgestellt (Jan-Entscheidung, siehe `worldmap/05_ZUKUNFTSPLANUNG.md` Zeile 3.1):**

- [`10_security_txt_rfc9116.md`](./10_security_txt_rfc9116.md) — 1 Meilenstein (Reminder-Automatisierung), kein K5-Blocker, kommt in einen künftigen Batch.

**Nächster Schritt für den gesamten Batch (2026-09-14):** [`11_status_quo_and_next_actions_prompt.md`](./11_status_quo_and_next_actions_prompt.md) — Übergabe-Prompt für eine neue LLM-Konversation, die (a) beide fertigen Merge-Branches (`security-round3-final-merge`, `security-hardening-round2-merge`) in `codex/uncommitted-cohort-review` einsammelt und (b) Säule 10 ausführt. Erst danach gilt Kategorie 04 als vollständig abgeschlossen.
