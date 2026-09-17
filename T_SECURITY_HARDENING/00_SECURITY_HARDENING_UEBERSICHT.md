# 00 — Security Hardening: Verbesserungsplan

> **Stand:** 2026-09-17 · **Gewichteter Kategorie-Schnitt:** 14,3 %
> **Historie:** 16 % (2026-09-06) → 18 % (2026-09-12, frische Recherche vor Ausführung) → **14,3 % (seit 2026-09-13, nach Ausführung von Säulen 1/2/4/6)**.

## Was dieser Stand bedeutet — kurz für Jan

**8 von 10 Säulen sind korrekt ausgeführt und frisch nachgeprüft (2026-09-17, siehe Spalte "Prüfung").** Der einzige noch offene Rest:

1. **Säule 10 (`security.txt`) wurde nie ausgeführt** — 1 kleiner Meilenstein, kein K5-Blocker.
2. **Keiner der beiden fertigen Merges ist im Hauptbranch angekommen.** Der Code liegt korrekt und verifiziert auf zwei Branches (`security-round3-final-merge` für Säulen 1/2/4/6, `security-hardening-round2-merge` für Säulen 3/5/7/8) — aber `codex/uncommitted-cohort-review` (der Branch, den du täglich nutzt) enthält davon **noch nichts**. Das ist der eigentliche Grund, warum diese Aufgabe noch nicht abgeschlossen ist, nicht die Code-Qualität.

Säule 9 (HSTS) braucht nichts — strukturelles Maximum, siehe unten.

## Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                               | Gewicht | Ist-Niveau | Prüfung (frisch, 2026-09-17)                                                                                                                                                         |                  Status                  |                                 Planungsdatei                                  | Warum dieses Gewicht                                                                 |
| :-: | :---------------------------------- | :-----: | :--------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------: | :----------------------------------------------------------------------------: | :----------------------------------------------------------------------------------- |
|  1  | CSP `script-src` Nonce-Härtung      | **15**  |    15 %    | ✅ Bestätigt — eigener `npm ci` + Testlauf im Worktree: 212/212 Dateien · 1605/1605 Tests, Typecheck/Lint 0. Auf Branch `security-round3-final-merge`, **nicht im Hauptbranch**.     | 🟢 Executed (Trusted-Types-Rest bei Jan) |          [`01_csp_script_hardening.md`](./01_csp_script_hardening.md)          | Primäre XSS- und Script-Exfiltrationsgrenze.                                         |
|  7  | Supply-Chain-/Dependency-Audit-Gate | **14**  |    13 %    | ✅ Bestätigt — eigener `npm ci` + Testlauf im Worktree: 207/207 Dateien · 1548/1548 Tests, Typecheck/Lint 0. Auf Branch `security-hardening-round2-merge`, **nicht im Hauptbranch**. |                    🟢                    | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) | Ungepatchte Abhängigkeiten können mehrere Grenzen zugleich unterlaufen.              |
|  2  | Security-CI-Gate                    | **13**  |    15 %    | ✅ Bestätigt — wie #1 (D1-Concurrency-Lücke ist seit 2026-09-13 real geschlossen, im selben Branch/Testlauf enthalten).                                                              |   🟢 Executed (Alerting-Rest bei Jan)    |              [`02_security_ci_gate.md`](./02_security_ci_gate.md)              | Verhindert Sicherheitsregressionen im Hauptstand.                                    |
|  4  | CSRF/Origin-Guard                   | **13**  |    11 %    | ✅ Bestätigt — wie #1.                                                                                                                                                               |         🟢 Executed (kein Rest)          |             [`04_csrf_origin_guard.md`](./04_csrf_origin_guard.md)             | Schützt schreibende Browser-Anfragen und Geldpfade.                                  |
|  8  | Secret-Rotation-Prozess             | **12**  |    18 %    | ✅ Bestätigt — wie #7.                                                                                                                                                               |                    🟢                    |       [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md)       | Ein Secret-Leak kann Service-Role-, HMAC- und Drittanbieter-Grenzen kompromittieren. |
|  3  | Env-/Secrets-Schema Fail-Fast       | **10**  |    10 %    | ✅ Bestätigt — wie #7.                                                                                                                                                               |                    🟢                    |            [`03_env_secrets_schema.md`](./03_env_secrets_schema.md)            | Fehlkonfigurationen werden früh sichtbar; die Abdeckung betrifft nur Kernvariablen.  |
|  5  | Header-Vollständigkeit              | **10**  |    13 %    | ✅ Bestätigt — wie #7.                                                                                                                                                               |                    🟢                    |       [`05_header_vollstaendigkeit.md`](./05_header_vollstaendigkeit.md)       | Breite Browser-Schutzschicht, aber weniger direkt als CSP oder CSRF.                 |
|  6  | CSP-Violation-Reporting             |  **7**  |    11 %    | ✅ Bestätigt — wie #1.                                                                                                                                                               |         🟢 Executed (kein Rest)          |       [`06_csp_violation_reporting.md`](./06_csp_violation_reporting.md)       | Erkennt reale CSP-Verstöße, beobachtet statt zu verhindern.                          |
| 10  | `security.txt` / RFC 9116           |  **5**  |    30 %    | ❌ **Nie ausgeführt** — 0 Treffer für einen Reminder-Mechanismus im Code, Plan-Header steht weiterhin auf „🔴 Geplant".                                                              |                    🔴                    |          [`10_security_txt_rfc9116.md`](./10_security_txt_rfc9116.md)          | Verbessert verantwortliche Meldungen, ist aber keine Laufzeitbarriere.               |
|  9  | HSTS-Preload                        |  **1**  |    8 %     | ✅ Nichts zu prüfen — kein Plan nötig, strukturelles Maximum (siehe unten).                                                                                                          |                    ⚪                    |                      keine — kein Potenzial (siehe unten)                      | Transportabsicherung, deren Erfolg hier überwiegend an der `.app`-TLD liegt.         |

**Status-Legende:** 🟢 ausgeführt (mit oder ohne K5-Rest) · 🔴 Plan fertig, Execution-Ready, noch nicht ausgeführt · ⚪ geprüft, bewusst kein Plan (kein Potenzial).

**Gewichteter Schnitt:** (15×15+14×13+13×15+13×11+12×18+10×10+10×13+7×11+5×30+1×8)/100 = **14,26 %** (gerundet 14,3 %). Säule 10 geht mit ihrem unveränderten Baseline-Wert (30 %) ein, nicht mit einem projizierten Wert, weil sie real nicht ausgeführt wurde.

## Säule #9 (HSTS-Preload): bewusst kein neuer Plan

`src/proxy.ts:81` setzt `max-age=63072000; includeSubDomains; preload` — alle drei Voraussetzungen für eine hstspreload.org-Submission sind formal übererfüllt, obwohl keine eigene Submission nötig ist (die `.app`-TLD erzwingt HSTS-Preload für jede Subdomain). Keine eigene Custom-Domain/DNS-Konfiguration im Repo — die Säule ist strukturell domain-bedingt am Maximum. Der einzige denkbare Hebel (ein TLD-Wechsel weg von `.app`) ist nicht angefragt/geplant und wäre ohnehin ein K5-Punkt. **Kein LLM-ausführbares Verbesserungspotenzial — bewusst keine Planungsdatei.**

## Offene Aufgaben

**Jan-Entscheidungen (K5, nicht LLM-ausführbar):**

1. `ws`-Dependency-Fix (Säule 7) — Breaking Change für `@trigger.dev/sdk`.
2. HMAC-Versionierung `POSTHOG_DISTINCT_ID_HMAC_SECRET` (Säule 8) — Breaking Change für Analytics-Historie.
3. COEP-Header-Aktivierung (Säule 5) — Entscheidungsgrundlage fertig dokumentiert (`docs/security-hardening/02_security_headers.md`).
4. Trusted Types (Säule 1) — Breaking-Change-Risiko für jeden DOM-Sink im Repo, Grundlage in Säule 1/L5 vorbereitet.
5. Externes CI-Failure-Alerting (Säule 2) — benötigt ein neues Secret (Telegram-Bot-Token oder Slack-Webhook), Grundlage in `docs/security-hardening/08_security_ci_gates.md` §9 vorbereitet.
6. Optionale `security.txt`-Felder `Encryption`/`Acknowledgments`/`Policy` (Säule 10) — benötigen jeweils eine neue Ressource (PGP-Key, Hall-of-Fame-Seite, Disclosure-Policy-Seite), die noch nicht existiert.
7. Drei GitHub-Repo-Secrets `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` für den CSP-Rate-Watch-Job (Säule 6) einmalig hinterlegen — sonst schreibt der Job nur eine „Skipped"-Note (nicht blockierend).

**Technisch offen (kein Planungsbedarf, reine Git-Aktion):**

- Branch `security-round3-final-merge` (Säulen 1/2/4/6, Commit `45491d52`) → Merge in `codex/uncommitted-cohort-review` aussteht.
- Branch `security-hardening-round2-merge` (Säulen 3/5/7/8, Commit `302a9883`) → Merge in `codex/uncommitted-cohort-review` aussteht, separates Vorhaben, Details in [`branch_merge_saeulen_5_7_8_plan.md`](./branch_merge_saeulen_5_7_8_plan.md).
- Beide waren bisher durch viele fremde uncommittete Änderungen im Hauptverzeichnis blockiert; Stand 2026-09-17 nur noch 134 Zeilen (deutlich entspannter als zuvor) — lohnt sich, jetzt zu versuchen.

**Nicht ausgeführt:**

- [`10_security_txt_rfc9116.md`](./10_security_txt_rfc9116.md) — 1 Meilenstein (Reminder-Automatisierung), kein K5-Blocker.

**Übergabe-Prompt für eine frische Konversation, die beide Merges einsammelt + Säule 10 ausführt:** [`11_status_quo_and_next_actions_prompt.md`](./11_status_quo_and_next_actions_prompt.md).
