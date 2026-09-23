# 00 — Security Hardening: Verbesserungsplan

> **Stand:** 2026-09-18 · **Gewichteter Kategorie-Schnitt:** 14,0 %
> **Historie:** 16 % (2026-09-06) → 18 % (2026-09-12, frische Recherche vor Ausführung) → 14,3 % (2026-09-13, nach Ausführung von Säulen 1/2/4/6) → **14,0 % (seit 2026-09-18, nach Merge beider Branches + Ausführung von Säule 10)**.

## Was dieser Stand bedeutet — kurz für Jan

**Alle 10 Säulen sind ausgeführt (oder strukturell ohne Potenzial) und in `codex/uncommitted-cohort-review` gemergt.** Beide zuvor offenen Punkte sind erledigt:

1. **Beide Merges sind im Hauptbranch angekommen (2026-09-18):** `security-hardening-round2-merge` (Säulen 3/5/7/8, Merge-Commit `caf95a5c`) und `security-round3-final-merge` (Säulen 1/2/4/6, Merge-Commit `c9a45eec`) — beide inkl. voller 5-Stufen-Prüfung auf dem gemergten Stand grün.
2. **Säule 10 (`security.txt`-Expiry-Reminder) wurde ausgeführt (2026-09-18, Commit `6f72aec`)** — neuer wöchentlicher CI-Schritt in `security-headers-drift-check.yml`, Muster identisch zu Säule 8 (Secret-Rotation-Fälligkeit).

Säule 9 (HSTS) braucht nichts — strukturelles Maximum, siehe unten.

## Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                               | Gewicht | Ist-Niveau |                       Status                       |                                                            Planungsdatei                                                            | Warum dieses Gewicht                                                                 |
| :-: | :---------------------------------- | :-----: | :--------: | :------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------- |
|  1  | CSP `script-src` Nonce-Härtung      | **15**  |    15 %    | 🟢 Executed & gemergt (Trusted-Types-Rest bei Jan) |          [`01_csp_script_hardening.md`](../../../../docs/archive/security/T_SECURITY_HARDENING/01_csp_script_hardening.md)          | Primäre XSS- und Script-Exfiltrationsgrenze.                                         |
|  7  | Supply-Chain-/Dependency-Audit-Gate | **14**  |    13 %    |     🟢 Executed & gemergt (`ws`-Rest bei Jan)      | [`07_dependency_supply_chain_audit.md`](../../../../docs/archive/security/T_SECURITY_HARDENING/07_dependency_supply_chain_audit.md) | Ungepatchte Abhängigkeiten können mehrere Grenzen zugleich unterlaufen.              |
|  2  | Security-CI-Gate                    | **13**  |    15 %    |   🟢 Executed & gemergt (Alerting-Rest bei Jan)    |              [`02_security_ci_gate.md`](../../../../docs/archive/security/T_SECURITY_HARDENING/02_security_ci_gate.md)              | Verhindert Sicherheitsregressionen im Hauptstand.                                    |
|  4  | CSRF/Origin-Guard                   | **13**  |    11 %    |         🟢 Executed & gemergt (kein Rest)          |             [`04_csrf_origin_guard.md`](../../../../docs/archive/security/T_SECURITY_HARDENING/04_csrf_origin_guard.md)             | Schützt schreibende Browser-Anfragen und Geldpfade.                                  |
|  8  | Secret-Rotation-Prozess             | **12**  |    18 %    |     🟢 Executed & gemergt (HMAC-Rest bei Jan)      |       [`08_secret_rotation_prozess.md`](../../../../docs/archive/security/T_SECURITY_HARDENING/08_secret_rotation_prozess.md)       | Ein Secret-Leak kann Service-Role-, HMAC- und Drittanbieter-Grenzen kompromittieren. |
|  3  | Env-/Secrets-Schema Fail-Fast       | **10**  |    10 %    |         🟢 Executed & gemergt (kein Rest)          |            [`03_env_secrets_schema.md`](../../../../docs/archive/security/T_SECURITY_HARDENING/03_env_secrets_schema.md)            | Fehlkonfigurationen werden früh sichtbar; die Abdeckung betrifft nur Kernvariablen.  |
|  5  | Header-Vollständigkeit              | **10**  |    13 %    |     🟢 Executed & gemergt (COEP-Rest bei Jan)      |       [`05_header_vollstaendigkeit.md`](../../../../docs/archive/security/T_SECURITY_HARDENING/05_header_vollstaendigkeit.md)       | Breite Browser-Schutzschicht, aber weniger direkt als CSP oder CSRF.                 |
|  6  | CSP-Violation-Reporting             |  **7**  |    11 %    |         🟢 Executed & gemergt (kein Rest)          |       [`06_csp_violation_reporting.md`](../../../../docs/archive/security/T_SECURITY_HARDENING/06_csp_violation_reporting.md)       | Erkennt reale CSP-Verstöße, beobachtet statt zu verhindern.                          |
| 10  | `security.txt` / RFC 9116           |  **5**  |    25 %    |   🟢 Executed (2026-09-18, kein K5-Rest für L1)    |          [`10_security_txt_rfc9116.md`](../../../../docs/archive/security/T_SECURITY_HARDENING/10_security_txt_rfc9116.md)          | Verbessert verantwortliche Meldungen, ist aber keine Laufzeitbarriere.               |
|  9  | HSTS-Preload                        |  **1**  |    8 %     |       ⚪ Strukturelles Maximum (siehe unten)       |                                                keine — kein Potenzial (siehe unten)                                                 | Transportabsicherung, deren Erfolg hier überwiegend an der `.app`-TLD liegt.         |

**Status-Legende:** 🟢 ausgeführt und im Hauptbranch (mit oder ohne K5-Rest) · ⚪ geprüft, bewusst kein Plan (kein Potenzial).

**Gewichteter Schnitt:** (15×15+14×13+13×15+13×11+12×18+10×10+10×13+7×11+5×25+1×8)/100 = **14,01 %** (gerundet 14,0 %). Säule 10 geht jetzt mit ihrem realen Nach-Ausführungswert (25 %, aus §7 der Planungsdatei — 3 der 10 Subkategorien bleiben bewusst K5-gehalten bei je 60 %) statt dem alten Baseline-Wert (30 %) ein.

## Säule #9 (HSTS-Preload): bewusst kein neuer Plan

`src/proxy.ts:81` setzt `max-age=63072000; includeSubDomains; preload` — alle drei Voraussetzungen für eine hstspreload.org-Submission sind formal übererfüllt, obwohl keine eigene Submission nötig ist (die `.app`-TLD erzwingt HSTS-Preload für jede Subdomain). Keine eigene Custom-Domain/DNS-Konfiguration im Repo — die Säule ist strukturell domain-bedingt am Maximum. Der einzige denkbare Hebel (ein TLD-Wechsel weg von `.app`) ist nicht angefragt/geplant und wäre ohnehin ein K5-Punkt. **Kein LLM-ausführbares Verbesserungspotenzial — bewusst keine Planungsdatei.**

## Offene Aufgaben

**Jan-Entscheidungen (K5, nicht LLM-ausführbar) — unverändert, alle 6 bleiben offen:**

1. `ws`-Dependency-Fix (Säule 7) — Breaking Change für `@trigger.dev/sdk`.
2. HMAC-Versionierung `POSTHOG_DISTINCT_ID_HMAC_SECRET` (Säule 8) — Breaking Change für Analytics-Historie.
3. COEP-Header-Aktivierung (Säule 5) — Entscheidungsgrundlage fertig dokumentiert (`docs/security-hardening/02_security_headers.md`).
4. Trusted Types (Säule 1) — Breaking-Change-Risiko für jeden DOM-Sink im Repo, Grundlage in Säule 1/L5 vorbereitet.
5. Externes CI-Failure-Alerting (Säule 2) — benötigt ein neues Secret (Telegram-Bot-Token oder Slack-Webhook), Grundlage in `docs/security-hardening/08_security_ci_gates.md` §9 vorbereitet.
6. Optionale `security.txt`-Felder `Encryption`/`Acknowledgments`/`Policy` (Säule 10) — benötigen jeweils eine neue Ressource (PGP-Key, Hall-of-Fame-Seite, Disclosure-Policy-Seite), die noch nicht existiert.
7. Drei GitHub-Repo-Secrets `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` für den CSP-Rate-Watch-Job (Säule 6) einmalig hinterlegen — sonst schreibt der Job nur eine „Skipped"-Note (nicht blockierend).

**Technisch erledigt (2026-09-18):**

- Branch `security-hardening-round2-merge` (Säulen 3/5/7/8) → gemergt in `codex/uncommitted-cohort-review`, Commit `caf95a5c`. 7 Konflikte additiv aufgelöst (Doku-Status-Drift, `package.json`/`package-lock.json`, `promo-codes/route.ts`, `secret-rotation-log.md`).
- Branch `security-round3-final-merge` (Säulen 1/2/4/6) → gemergt, Commit `c9a45eec`. 11 Konflikte additiv aufgelöst (4× veraltete Vor-Ausführungs-Planungsdateien durch echte Ausführungsstände ersetzt, `red-team-security.yml`/`test-catalog.json`/`red-team-contract.test.ts` um den neuen `origin-bypass`-Probe ergänzt, `guide-persona/route.ts` + Test: neuerer Rate-Limit-Wrapper (Plan 06_6) und CSRF-Origin-Guard (Säule 4) zusammengeführt, `worldmap/00_WORLDMAP_STATUS.md` auf den aktuelleren Stand behalten).
- Nach dem Merge zwei echte Post-Merge-Funde behoben (Commit `6f72aec`): `csp-report/route.ts` exportierte 3 Konstanten, die Next.js' Routen-Typecheck verletzten (verschoben nach `csp-report.ts`); gepinnte CSRF-Layer-2-Inventarliste um 3 real bereits geschützte, aber noch nicht gelistete Routen ergänzt.
- Volle 5-Stufen-Prüfung auf dem finalen, gemergten Stand: Typecheck 0, **268/268 Testdateien · 1942/1942 Tests**, Lint 0 Errors, Build erfolgreich.

**Nicht ausgeführt:** keine.
