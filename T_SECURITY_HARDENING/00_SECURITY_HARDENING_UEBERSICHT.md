# 00 — Security Hardening: Verbesserungsplan

> **Stand:** 2026-09-12 · **Gewichteter Gesamt-Schnitt:** Top 14 % (Säulen 3, 5, 7, 8 aus Runde 2 vollständig ausgeführt und verifiziert)

## Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                               | Gewicht |   Niveau   | Status |             Execution              |                                 Planungsdatei                                  | Warum dieses Gewicht                                                                 |
| :-: | :---------------------------------- | :-----: | :--------: | :----: | :--------------------------------: | :----------------------------------------------------------------------------: | :------------------------------------------------------------------------------------ |
|  1  | CSP `script-src` Nonce-Härtung      | **15**  |  Top 15 %  |   🟢   |                                    |                                                                                | Primäre XSS- und Script-Exfiltrationsgrenze.                                         |
|  7  | Supply-Chain-/Dependency-Audit-Gate | **14**  |  Top 13 %  |   🟡   | **Executed** _(`ws`-Rest bei Jan)_ | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) | Ungepatchte Abhängigkeiten können mehrere Grenzen zugleich unterlaufen.              |
|  2  | Security-CI-Gate                    | **13**  |  Top 16 %  |   🟢   |                                    |                                                                                | Verhindert Sicherheitsregressionen im Hauptstand.                                    |
|  4  | CSRF/Origin-Guard                   | **13**  |  Top 15 %  |   🟢   |                                    |                                                                                | Schützt schreibende Browser-Anfragen und Geldpfade.                                  |
|  8  | Secret-Rotation-Prozess             | **12**  |  Top 18 %  |   🟡   | **Executed** _(HMAC-Rest bei Jan)_ |       [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md)       | Ein Secret-Leak kann Service-Role-, HMAC- und Drittanbieter-Grenzen kompromittieren. |
|  3  | Env-/Secrets-Schema Fail-Fast       | **10**  |  Top 10 %  |   🟢   |     **Executed** _(Ziel erreicht)_ |            [`03_env_secrets_schema.md`](./03_env_secrets_schema.md)            | Fehlkonfigurationen werden früh sichtbar; die Abdeckung betrifft nur Kernvariablen.  |
|  5  | Header-Vollständigkeit              | **10**  |  Top 13 %  |   🟡   | **Executed** _(COEP-Rest bei Jan)_ |       [`05_header_vollstaendigkeit.md`](./05_header_vollstaendigkeit.md)       | Breite Browser-Schutzschicht, aber weniger direkt als CSP oder CSRF.                 |
|  6  | CSP-Violation-Reporting             |  **7**  |  Top 16 %  |   🟢   |                                    |                                                                                | Erkennt reale CSP-Verstöße, beobachtet statt zu verhindern.                          |
| 10  | `security.txt` / RFC 9116           |  **5**  |  Top 14 %  |   🟢   |                                    |                                                                                | Verbessert verantwortliche Meldungen, ist aber keine Laufzeitbarriere.               |
|  9  | HSTS-Preload                        |  **1**  |  Top 8 %   |   🟢   |                                    |                                                                                | Transportabsicherung, deren Erfolg hier überwiegend an der `.app`-TLD liegt.         |

## Offene Aufgaben

**Jan-Entscheidungen (K5, nicht LLM-ausführbar):**
1. `ws`-Dependency-Fix (Säule 7) — Breaking Change für `@trigger.dev/sdk`.
2. HMAC-Versionierung `POSTHOG_DISTINCT_ID_HMAC_SECRET` (Säule 8) — Breaking Change für Analytics-Historie.
3. COEP-Header-Aktivierung (Säule 5) — Entscheidungsgrundlage fertig dokumentiert (`docs/security-hardening/02_security_headers.md`).

**Technisch, wartet auf dich:** Fertiger, verifizierter Branch `security-hardening-round2-merge` muss noch in `codex/uncommitted-cohort-review` gemergt werden — blockiert, solange deine anderen aktiven Sessions dieselben Dateien uncommitted halten. Details in [`branch_merge_saeulen_5_7_8_plan.md`](./branch_merge_saeulen_5_7_8_plan.md).
