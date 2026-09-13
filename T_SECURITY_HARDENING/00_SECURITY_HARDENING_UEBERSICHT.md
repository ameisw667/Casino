# 00 — Security Hardening: Verbesserungsplan

> **Stand:** 2026-09-12 · **Ist-Schnitt (frische Recherche, vor Ausführung der Runde-2/3-Pläne):** Top 18 % · **Projizierter Schnitt nach Ausführung aller unten verlinkten Pläne:** Top 14 %

## Was dieser Stand bedeutet

Jede der 10 Säulen wurde am 2026-09-12 einzeln neu geprüft (Säulen 3/5/7/8: Verifikation des bereits ausgeführten, aber noch nicht in den Hauptbranch gemergten Merge-Stands `security-hardening-round2-merge`; Säulen 1/2/4/6/9/10: frische `casino-code-explorer`-Recherche bzw. — für Säule 2 — direkte Code-Verifikation, da CI/CD-Workflows außerhalb des Scopes von `casino-code-explorer` liegen). Der **Ist-Schnitt (Top 18 %)** ist schlechter als der vorherige Headline-Wert (Top 14 %), weil die tiefere Recherche bei mehreren Säulen echte, bislang unbewertete Lücken gefunden hat (z. B. fehlendes SAST/CodeQL bei Säule 2, zwei State-ändernde Routen ohne Origin-Guard bei Säule 4) — dieselbe ehrliche Dynamik wie bei jeder vertieften Aufschlüsselung in diesem Repo (vgl. Kategorie 02/09/12 in `worldmap/00_WORLDMAP_STATUS.md`). Der **projizierte Schnitt (Top 14 %)** zeigt, wohin die jetzt verlinkten, vollständig LLM-ausführbaren Pläne führen, sobald sie ausgeführt sind.

## Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                               | Gewicht | Ist-Niveau (2026-09-12) | Projiziert nach Ausführung | Status |                                 Planungsdatei                                  | Warum dieses Gewicht                                                                 |
| :-: | :----------------------------------- | :-----: | :----------------------: | :-------------------------: | :----: | :------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------ |
|  1  | CSP `script-src` Nonce-Härtung      | **15**  |          Top 20 %          |           Top 15 %           |   🔴   |          [`01_csp_script_hardening.md`](./01_csp_script_hardening.md) _(neu)_   | Primäre XSS- und Script-Exfiltrationsgrenze.                                         |
|  7  | Supply-Chain-/Dependency-Audit-Gate | **14**  |          Top 13 %          |           Top 13 %           |   🟢   | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) | Ungepatchte Abhängigkeiten können mehrere Grenzen zugleich unterlaufen.              |
|  2  | Security-CI-Gate                    | **13**  |          Top 22 %          |           Top 15 %           |   🔴   |              [`02_security_ci_gate.md`](./02_security_ci_gate.md) _(neu)_       | Verhindert Sicherheitsregressionen im Hauptstand.                                    |
|  4  | CSRF/Origin-Guard                   | **13**  |         Top 24,5 %         |           Top 11 %           |   🔴   |            [`04_csrf_origin_guard.md`](./04_csrf_origin_guard.md) _(neu)_       | Schützt schreibende Browser-Anfragen und Geldpfade.                                  |
|  8  | Secret-Rotation-Prozess             | **12**  |          Top 18 %          |           Top 18 %           |   🟢   |       [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md)       | Ein Secret-Leak kann Service-Role-, HMAC- und Drittanbieter-Grenzen kompromittieren. |
|  3  | Env-/Secrets-Schema Fail-Fast       | **10**  |          Top 10 %          |           Top 10 %           |   🟢   |            [`03_env_secrets_schema.md`](./03_env_secrets_schema.md)            | Fehlkonfigurationen werden früh sichtbar; die Abdeckung betrifft nur Kernvariablen.  |
|  5  | Header-Vollständigkeit              | **10**  |          Top 13 %          |           Top 13 %           |   🟢   |       [`05_header_vollstaendigkeit.md`](./05_header_vollstaendigkeit.md)       | Breite Browser-Schutzschicht, aber weniger direkt als CSP oder CSRF.                 |
|  6  | CSP-Violation-Reporting             |  **7**  |          Top 21 %          |           Top 11 %           |   🔴   |        [`06_csp_violation_reporting.md`](./06_csp_violation_reporting.md) _(neu)_ | Erkennt reale CSP-Verstöße, beobachtet statt zu verhindern.                          |
| 10  | `security.txt` / RFC 9116           |  **5**  |          Top 30 %          |           Top 25 %           |   🟡   |          [`10_security_txt_rfc9116.md`](./10_security_txt_rfc9116.md) _(neu)_  | Verbessert verantwortliche Meldungen, ist aber keine Laufzeitbarriere.               |
|  9  | HSTS-Preload                        |  **1**  |          Top 8 %           |           Top 8 %            |   ⚪   |                        keine — kein Potenzial (siehe unten)                    | Transportabsicherung, deren Erfolg hier überwiegend an der `.app`-TLD liegt.         |

**Status-Legende:** 🟢 bereits ausgeführt/gehärtet, Erhalt-Modus · 🔴 Plan fertig, Execution-Ready, wartet auf eine Ausführungs-Session · 🟡 Plan fertig, aber nur ein kleiner Meilenstein, geringer Hebel · ⚪ geprüft, bewusst kein Plan (kein Potenzial).

**Ist-Schnitt gewichtet:** (15×20+14×13+13×22+13×24,5+12×18+10×10+10×13+7×21+5×30+1×8)/100 = **Top 18,4 %** (gerundet Top 18 %).
**Projizierter Schnitt gewichtet (nach Ausführung aller unten verlinkten Pläne, ohne K5-Punkte anzufassen):** (15×15+14×13+13×15+13×11+12×18+10×10+10×13+7×11+5×25+1×8)/100 = **Top 14,0 %**.

## Säule #9 (HSTS-Preload): bewusst kein neuer Plan

Frische `casino-code-explorer`-Recherche (2026-09-12) bestätigt: `src/proxy.ts:81` setzt `max-age=63072000; includeSubDomains; preload` — alle drei Voraussetzungen für eine hstspreload.org-Submission sind formal übererfüllt, obwohl keine eigene Submission nötig ist (die `.app`-TLD erzwingt HSTS-Preload für jede Subdomain). Keine eigene Custom-Domain/DNS-Konfiguration im Repo gefunden — die Säule ist strukturell domain-bedingt am Maximum. Der einzige denkbare Hebel (ein TLD-Wechsel weg von `.app`) ist nicht angefragt/geplant und wäre ohnehin ein K5-Punkt (Breaking Change für jede Referenz auf die aktuelle Domain). **Kein LLM-ausführbares Verbesserungspotenzial — bewusst keine Planungsdatei.**

## Offene Aufgaben

**Jan-Entscheidungen (K5, nicht LLM-ausführbar) — unverändert aus Runde 2:**
1. `ws`-Dependency-Fix (Säule 7) — Breaking Change für `@trigger.dev/sdk`.
2. HMAC-Versionierung `POSTHOG_DISTINCT_ID_HMAC_SECRET` (Säule 8) — Breaking Change für Analytics-Historie.
3. COEP-Header-Aktivierung (Säule 5) — Entscheidungsgrundlage fertig dokumentiert (`docs/security-hardening/02_security_headers.md`).

**Neue Jan-Entscheidungen (K5) aus der 2026-09-12-Runde:**
4. Trusted Types (Säule 1) — Breaking-Change-Risiko für jeden DOM-Sink im Repo, Entscheidungsgrundlage wird in Säule 1/L5 vorbereitet.
5. Externes CI-Failure-Alerting (Säule 2) — benötigt ein neues Secret (Telegram-Bot-Token oder Slack-Webhook), Entscheidungsgrundlage wird in Säule 2/L5 vorbereitet.
6. Optionale `security.txt`-Felder `Encryption`/`Acknowledgments`/`Policy` (Säule 10) — benötigen jeweils eine neue Ressource (PGP-Key, Hall-of-Fame-Seite, Disclosure-Policy-Seite), die noch nicht existiert.

**Technisch, wartet auf Jan (unverändert):** Fertiger, verifizierter Branch `security-hardening-round2-merge` (Säulen 3/5/7/8) muss noch in `codex/uncommitted-cohort-review` gemergt werden — blockiert, solange andere aktive Sessions dieselben Dateien uncommitted halten. Details in [`branch_merge_saeulen_5_7_8_plan.md`](./branch_merge_saeulen_5_7_8_plan.md) — **nicht Teil dieser Planungsrunde, nicht anfassen.**

**Neue, Execution-Ready Pläne aus dieser Runde (2026-09-12), warten auf eine separate Ausführungs-Session:**
- [`01_csp_script_hardening.md`](./01_csp_script_hardening.md) — 5 Meilensteine, kein K5-Blocker außer der vorbereiteten Trusted-Types-Entscheidung.
- [`02_security_ci_gate.md`](./02_security_ci_gate.md) — 5 Meilensteine, kein K5-Blocker außer dem vorbereiteten Alerting-Entscheid.
- [`04_csrf_origin_guard.md`](./04_csrf_origin_guard.md) — 5 Meilensteine, **kein K5-Blocker überhaupt** — bester projizierter Wert aller 10 Säulen (Top 10,5 %).
- [`06_csp_violation_reporting.md`](./06_csp_violation_reporting.md) — 5 Meilensteine, **kein K5-Blocker überhaupt** (Top 10,9 %).
- [`10_security_txt_rfc9116.md`](./10_security_txt_rfc9116.md) — 1 Meilenstein (Reminder-Automatisierung), kein K5-Blocker für diesen einen Punkt.

**Säulen mit bereits ausgeführtem Runde-2-Stand, geprüft und bewusst ohne Runde 3 (2026-09-12):**
- [`03_env_secrets_schema.md`](./03_env_secrets_schema.md) — Ziel bereits erreicht (Top 10,2 %), kein K5-Blocker, kein weiteres Potenzial.
- [`05_header_vollstaendigkeit.md`](./05_header_vollstaendigkeit.md) — Top 12,9 % projiziert, nur noch COEP-K5-Blocker offen.
- [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) — Top 13 % projiziert, nur noch `ws`-K5-Blocker offen.
- [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md) — Top 17,6 % projiziert, nur noch HMAC-K5-Blocker offen (wiegt bei der flachen 10er-Mittelung strukturell am schwersten).
