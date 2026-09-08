# 00 — Security Hardening: Verbesserungsplan

> **Status:** 🟢 Runde 2 vollständig ausgeführt und lokal gemergt+verifiziert (Säulen 3, 5, 7, 8) · **Stand:** 2026-09-08 · **Owner:** LLM  
> **Worldmap-Kategorie:** 04 Security Hardening (Headers, CSP & Secrets)

## 1 — Executive Summary für Jan

Der gewichtete Reifegrad liegt jetzt bei **Top 14 %** (vorher Top 17 %). Runde 2 ist vollständig ausgeführt: Alle 4 Planungsdateien (#3, #5, #7, #8) wurden von je einem Subagenten in einem isolierten Git-Worktree umgesetzt, anschließend zu einem einzigen Merge-Commit zusammengeführt (2 echte Konflikte manuell aufgelöst, siehe `branch_merge_saeulen_5_7_8_plan.md`) und auf dem gemergten Stand vollständig neu verifiziert: `npm ci` sauber, Typecheck 0 Fehler, **1548/1548 Tests grün**, Lint 0 Fehler, Build erfolgreich.

**Tatsächliches Ergebnis (nicht mehr projiziert):**

|        Säule        | Baseline (Runde 2) | Tatsächlich nach Ausführung |                                      Ziel Top 10 % erreicht?                                       |
| :-----------------: | :-----------------: | :--------------------------: | :------------------------------------------------------------------------------------------------: |
|   3 — Env-Schema    |      Top 20 %       |        **Top 10 %**         |                               ✅ Ja — kein Jan-Gate in dieser Säule                                |
|     5 — Header      |      Top 28 %       |        **Top 13 %**         |                              ⚠️ Knapp verfehlt — COEP bleibt bei Jan                               |
|  7 — Supply-Chain   |      Top 24 %       |        **Top 13 %**         |                            ⚠️ Knapp verfehlt — `ws`-Fix bleibt bei Jan                             |
| 8 — Secret-Rotation |      Top 29 %       |        **Top 18 %**         | ❌ Verfehlt — HMAC-Versionierung wiegt in der flachen 10-Zeilen-Durchschnittsbildung am schwersten |

**Warum Top 10 % bei 3 von 4 Säulen nicht exakt erreicht wurde:** Jede der Säulen 5, 7 und 8 hat einen einzelnen, bewusst bei Jan liegenden K5-Punkt (Breaking-Change- bzw. Risiko-Entscheidung), der nicht LLM-ausführbar ist/war. Sobald Jan die jeweilige K5-Entscheidung trifft, fällt der Schnitt in allen drei Fällen klar unter Top 10 %.

**Wichtige Merge-Erkenntnis:** Zwei echte Konflikte traten beim Zusammenführen auf (nicht vorab erkannt): `src/proxy.ts`/`T_SECURITY_HARDENING/05_...md` zwischen Säule 5 und der bereits gemergten Säule 3, sowie `docs/security-hardening/07_...md` zwischen dem Runde-1-Doku-Sync und Säule 7 — beide manuell aufgelöst, beide Seiten inhaltlich erhalten (Details: `branch_merge_saeulen_5_7_8_plan.md` §3).

**Offener technischer Punkt:** Der Merge-Stand liegt auf einem eigenen Branch (`security-hardening-round2-merge`), da Git das direkte Vorziehen von `codex/uncommitted-cohort-review` verweigert, solange dieser Branch im Haupt-Arbeitsverzeichnis ausgecheckt ist (Sicherheitsmechanismus, kein Bug — dort liegen aktuell 316 fremde uncommittete Änderungen anderer paralleler Sessions). Zusammenführen erfordert eine Jan-Aktion im Hauptverzeichnis.

Bewusst bei Jan bleibende K5-Punkte, unverändert durch diese Runde: `ws`-Dependency-Fix (Säule 7), HMAC-Versionierung (Säule 8), COEP-Header-Entscheidung (Säule 5).

## 2 — Bewertungsmethode

Die Gewichte summieren sich auf 100. Direkt internet- oder secret-exponierte Grenzen erhalten mehr Gewicht. Werte und Status stammen primär aus den einzelnen Planungsdateien in diesem Ordner (frisch verifiziert 2026-09-06); wo dort keine neue Messung vorgenommen wurde, bleibt der Wert aus der [Worldmap-Aufschlüsselung](../worldmap/04_security_hardening.md) unverändert übernommen und ist in der jeweiligen Planungsdatei als solcher gekennzeichnet.

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                               | Gewicht |   Niveau   | Status |             Execution              |                                 Planungsdatei                                  | Dokumentation                                                                                                                                                                     | Warum dieses Gewicht                                                                 |
| :-: | :---------------------------------- | :-----: | :--------: | :----: | :--------------------------------: | :----------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
|  1  | CSP `script-src` Nonce-Härtung      | **15**  |  Top 15 %  |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_01_csp_script_hardening.md) · [Deep-Dive](../docs/security-hardening/01_csp_script_hardening.md)                                | Primäre XSS- und Script-Exfiltrationsgrenze.                                         |
|  7  | Supply-Chain-/Dependency-Audit-Gate | **14**  |  Top 13 %  |   🟡   | **Executed** _(Runde 2, `ws`-Rest bei Jan)_ | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) | [Vorige Runde archiviert](../docs/archive/t_security_hardening_07_dependency_supply_chain_audit.md) · [Deep-Dive](../docs/security-hardening/07_dependency_supply_chain_audit.md) | Ungepatchte Abhängigkeiten können mehrere Grenzen zugleich unterlaufen.              |
|  2  | Security-CI-Gate                    | **13**  |  Top 16 %  |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_02_security_ci_gate.md) · [Deep-Dive](../docs/security-hardening/08_security_ci_gates.md)                                       | Verhindert Sicherheitsregressionen im Hauptstand.                                    |
|  4  | CSRF/Origin-Guard                   | **13**  |  Top 15 %  |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_04_csrf_origin_guard.md) · [Deep-Dive](../docs/security-hardening/04_csrf_origin_guard.md)                                      | Schützt schreibende Browser-Anfragen und Geldpfade.                                  |
|  8  | Secret-Rotation-Prozess             | **12**  |  Top 18 %  |   🟡   | **Executed** _(Runde 2, HMAC-Rest bei Jan)_ |       [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md)       | [Vorige Runde archiviert](../docs/archive/t_security_hardening_08_secret_rotation_prozess.md) · [Deep-Dive](../docs/security-hardening/06_secret_rotation_gitleaks.md)            | Ein Secret-Leak kann Service-Role-, HMAC- und Drittanbieter-Grenzen kompromittieren. |
|  3  | Env-/Secrets-Schema Fail-Fast       | **10**  |  Top 10 %  |   🟢   | **Executed** _(Runde 2, Ziel erreicht)_ |            [`03_env_secrets_schema.md`](./03_env_secrets_schema.md)            | [Vorige Runde archiviert](../docs/archive/t_security_hardening_03_env_secrets_schema.md) · [Deep-Dive](../docs/security-hardening/05_env_secrets_schema.md)                       | Fehlkonfigurationen werden früh sichtbar; die Abdeckung betrifft nur Kernvariablen.  |
|  5  | Header-Vollständigkeit              | **10**  |  Top 13 %  |   🟡   | **Executed** _(Runde 2, COEP-Rest bei Jan)_ |       [`05_header_vollstaendigkeit.md`](./05_header_vollstaendigkeit.md)       | [Vorige Runde archiviert](../docs/archive/t_security_hardening_05_header_vollstaendigkeit.md) · [Deep-Dive](../docs/security-hardening/02_security_headers.md)                    | Breite Browser-Schutzschicht, aber weniger direkt als CSP oder CSRF.                 |
|  6  | CSP-Violation-Reporting             |  **7**  |  Top 16 %  |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_06_csp_violation_reporting.md) · [Deep-Dive](../docs/security-hardening/03_csp_violation_reporting.md)                          | Erkennt reale CSP-Verstöße, beobachtet statt zu verhindern.                          |
| 10  | `security.txt` / RFC 9116           |  **5**  |  Top 14 %  |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_10_security_txt_rfc9116.md) · [Deep-Dive](../docs/security-hardening/10_security_txt_hsts_preload.md)                           | Verbessert verantwortliche Meldungen, ist aber keine Laufzeitbarriere.               |
|  9  | HSTS-Preload                        |  **1**  |  Top 8 %   |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_09_hsts_preload.md) · [Deep-Dive](../docs/security-hardening/10_security_txt_hsts_preload.md)                                   | Transportabsicherung, deren Erfolg hier überwiegend an der `.app`-TLD liegt.         |

> **Legende:** „Planungsdatei" ist bei den 6 bereits vor Runde 2 soliden Säulen (#1, #2, #4, #6, #9, #10) leer — deren komplette Historie steht unter „Dokumentation" (archiviert in `docs/archive/`). Die 4 Säulen aus Runde 2 (#3, #5, #7, #8) sind jetzt **Executed** — Details, Ausführungsnotizen und die verbleibenden Jan-Punkte je Säule stehen in der jeweiligen Planungsdatei.

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = (15·15 + 14·13 + 13·16 + 13·15 + 12·18 + 10·10 + 10·13 + 7·16 + 5·14 + 1·8) / 100 = 14,46` → **Top 14 %** (vorher Top 21 % zu Sessionbeginn, Top 18 % nach der Recherche-Runde, Top 17 % nach Runde-1-Execution, jetzt **Top 14 %** nach vollständiger Runde-2-Execution und Merge, 2026-09-08).

## 5 — Priorisierte Verbesserungs-Reihenfolge

**Alle 4 Säulen ausgeführt, gemergt und auf dem gemergten Stand verifiziert (2026-09-08):**

1. ✅ Säule 7 — Supply-Chain-/Dependency-Audit-Gate → ausgeführt, **Top 13 %**
2. ✅ Säule 8 — Secret-Rotation-Prozess → ausgeführt, **Top 18 %**
3. ✅ Säule 5 — Header-Vollständigkeit → ausgeführt, **Top 13 %**
4. ✅ Säule 3 — Env-/Secrets-Schema Fail-Fast → ausgeführt, **Top 10 %** (Ziel erreicht)

**Offen — ausschließlich Jan-Entscheidungen (K5), nicht LLM-ausführbar:**

1. `ws`-Dependency-Fix (Säule 7, Breaking Change für `@trigger.dev/sdk`).
2. HMAC-Versionierung `POSTHOG_DISTINCT_ID_HMAC_SECRET` (Säule 8, Breaking Change für Analytics-Historie).
3. COEP-Header-Aktivierung (Säule 5) — Entscheidungsgrundlage fertig dokumentiert (`docs/security-hardening/02_security_headers.md`).

**Offen — technisch, nicht inhaltlich:** Merge-Stand von `security-hardening-round2-merge` in `codex/uncommitted-cohort-review` überführen, sobald das Haupt-Arbeitsverzeichnis frei von fremder Session-Arbeit ist (siehe `branch_merge_saeulen_5_7_8_plan.md`).

## 6 — Verwandte Artefakte

- [Merge-Planungsdatei (Zusammenführung der 3 Branches)](./branch_merge_saeulen_5_7_8_plan.md)
- [Ausgeführte Planungsdateien dieser Runde](.) — `03_env_secrets_schema.md`, `05_header_vollstaendigkeit.md`, `07_dependency_supply_chain_audit.md`, `08_secret_rotation_prozess.md`
- [Archivierte Planungsdateien der vorigen Runde (alle 10 Säulen)](../docs/archive/) — Präfix `t_security_hardening_`
- [Worldmap-Aufschlüsselung](../worldmap/04_security_hardening.md)
- [Security-Master-Dokumentation](../docs/security-hardening/00_SECURITY_OVERVIEW.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)

## 7 — Fortschritt Runde 2 (Säulen 3, 5, 7, 8) — abgeschlossen

| Säule | Recherche | Plan | Selbstprüfung | Ausgeführt | Gemergt | Tatsächliches Niveau |
| :---: | :-------: | :--: | :------------: | :--------: | :-----: | :-------------------: |
|   7   |    ✅     |  ✅  |       ✅       |     ✅     |   ✅    | Top 13 % (`ws` bei Jan) |
|   8   |    ✅     |  ✅  |       ✅       |     ✅     |   ✅    | Top 18 % (HMAC bei Jan) |
|   5   |    ✅     |  ✅  |       ✅       |     ✅     |   ✅    | Top 13 % (COEP bei Jan) |
|   3   |    ✅     |  ✅  |       ✅       |     ✅     |   ✅    | **Top 10 %** (Ziel erreicht) |

Alle 4 Zeilen komplett grün. Verifikation auf dem gemergten Stand: `npm ci` sauber, Typecheck 0 Fehler, 1548/1548 Tests grün, Lint 0 Fehler, Build erfolgreich. Verbleibend: Merge-Übernahme in den Hauptbranch (siehe §5) und 3 Jan-K5-Punkte.
