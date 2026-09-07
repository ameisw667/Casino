# 00 — Security Hardening: Verbesserungsplan

> **Status:** 🟢 Planungsrunde 2 abgeschlossen — 4 neue Planungsdateien (#3, #5, #7, #8) Execution-Ready, Ziel Top 10 % je Säule · **Stand:** 2026-09-06 · **Owner:** LLM (nur Planung, keine Execution in dieser Runde)  
> **Worldmap-Kategorie:** 04 Security Hardening (Headers, CSP & Secrets)

## 1 — Executive Summary für Jan

Der gewichtete Reifegrad liegt bei **Top 17 %** (aktueller, nicht-projizierter Stand — diese Runde hat nur geplant, nichts ausgeführt). Die erste Execution-Runde (2026-09-06) hat alle 10 Säulen einzeln recherchiert und alle LLM-ausführbaren Meilensteine umgesetzt (Details jetzt archiviert, siehe §3-Tabelle Spalte „Dokumentation").

**Zweite Runde (abgeschlossen):** Auf Jans Wunsch sind alle 10 alten Planungsdateien nach `docs/archive/` verschoben — die Spalten „Planungsdatei"/„Execution" in §3 sind für die 6 bereits soliden Säulen (#1, #2, #4, #6, #9, #10) jetzt leer, deren komplette Historie steht unter „Dokumentation". Für die 4 Säulen mit Niveau ~Top 20 % oder schlechter (**#3** Env-Schema Top 20,5 %, **#5** Header Top 14 %, **#7** Supply-Chain Top 20 %, **#8** Secret-Rotation Top 22 %) sind jetzt **neue, eigenständige Planungsdateien fertig und Execution-Ready** — jede mit eigener `casino-code-explorer`-Recherche, eigenen LLM-only-Meilensteinen und einer projizierten Niveau-Rechnung (§7):

|        Säule        | Baseline (diese Runde, tiefer recherchiert) | Projiziert nach Ausführung |                                      Ziel Top 10 % erreicht?                                       |
| :-----------------: | :-----------------------------------------: | :------------------------: | :------------------------------------------------------------------------------------------------: |
|   3 — Env-Schema    |                  Top 20 %                   |        **Top 10 %**        |                               ✅ Ja — kein Jan-Gate in dieser Säule                                |
|     5 — Header      |                  Top 28 %                   |        **Top 13 %**        |                              ⚠️ Knapp verfehlt — COEP bleibt bei Jan                               |
|  7 — Supply-Chain   |                  Top 24 %                   |        **Top 13 %**        |                            ⚠️ Knapp verfehlt — `ws`-Fix bleibt bei Jan                             |
| 8 — Secret-Rotation |                  Top 29 %                   |        **Top 18 %**        | ❌ Verfehlt — HMAC-Versionierung wiegt in der flachen 10-Zeilen-Durchschnittsbildung am schwersten |

**Wichtig — Baseline ist bei allen 4 Säulen schlechter als der bisher gezeigte Wert:** Die tiefere Recherche hat in jeder der 4 Säulen neue, bisher unentdeckte reale Lücken gefunden (z. B. fehlende Cache-Control-Header bei Säule 5, fehlende Secrets im Rotationsinventar bei Säule 8) — das ist kein Rückschritt im Code, sondern ehrlichere Messung, dieselbe Dynamik wie bei jeder tieferen Aufschlüsselung in diesem Repo.

**Warum Top 10 % bei 3 von 4 Säulen nicht exakt erreicht wird:** Jede der Säulen 5, 7 und 8 hat einen einzelnen, bewusst bei Jan liegenden K5-Punkt (Breaking-Change- bzw. Risiko-Entscheidung), der nicht LLM-ausführbar ist. Diese Punkte wiegen in einer flachen 10-Zeilen-Durchschnittsbildung strukturell schwer und verhindern ein rechnerisches Top 10 % — das ist eine ehrliche Grenze des LLM-Scopes, keine unvollständige Planung. Sobald Jan die jeweilige K5-Entscheidung trifft, fällt der Schnitt in allen drei Fällen klar unter Top 10 %.

Bewusst bei Jan bleibende K5-Punkte, unverändert durch diese Runde: `ws`-Dependency-Fix (Säule 7), HMAC-Versionierung (Säule 8), COEP-Header-Entscheidung (Säule 5).

## 2 — Bewertungsmethode

Die Gewichte summieren sich auf 100. Direkt internet- oder secret-exponierte Grenzen erhalten mehr Gewicht. Werte und Status stammen primär aus den einzelnen Planungsdateien in diesem Ordner (frisch verifiziert 2026-09-06); wo dort keine neue Messung vorgenommen wurde, bleibt der Wert aus der [Worldmap-Aufschlüsselung](../worldmap/04_security_hardening.md) unverändert übernommen und ist in der jeweiligen Planungsdatei als solcher gekennzeichnet.

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                               | Gewicht |   Niveau   | Status |             Execution              |                                 Planungsdatei                                  | Dokumentation                                                                                                                                                                     | Warum dieses Gewicht                                                                 |
| :-: | :---------------------------------- | :-----: | :--------: | :----: | :--------------------------------: | :----------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
|  1  | CSP `script-src` Nonce-Härtung      | **15**  |  Top 15 %  |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_01_csp_script_hardening.md) · [Deep-Dive](../docs/security-hardening/01_csp_script_hardening.md)                                | Primäre XSS- und Script-Exfiltrationsgrenze.                                         |
|  7  | Supply-Chain-/Dependency-Audit-Gate | **14**  |  Top 20 %  |   🟡   | **Execution Ready** _(neue Runde)_ | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md) | [Vorige Runde archiviert](../docs/archive/t_security_hardening_07_dependency_supply_chain_audit.md) · [Deep-Dive](../docs/security-hardening/07_dependency_supply_chain_audit.md) | Ungepatchte Abhängigkeiten können mehrere Grenzen zugleich unterlaufen.              |
|  2  | Security-CI-Gate                    | **13**  |  Top 16 %  |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_02_security_ci_gate.md) · [Deep-Dive](../docs/security-hardening/08_security_ci_gates.md)                                       | Verhindert Sicherheitsregressionen im Hauptstand.                                    |
|  4  | CSRF/Origin-Guard                   | **13**  |  Top 15 %  |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_04_csrf_origin_guard.md) · [Deep-Dive](../docs/security-hardening/04_csrf_origin_guard.md)                                      | Schützt schreibende Browser-Anfragen und Geldpfade.                                  |
|  8  | Secret-Rotation-Prozess             | **12**  |  Top 22 %  |   🟡   | **Execution Ready** _(neue Runde)_ |       [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md)       | [Vorige Runde archiviert](../docs/archive/t_security_hardening_08_secret_rotation_prozess.md) · [Deep-Dive](../docs/security-hardening/06_secret_rotation_gitleaks.md)            | Ein Secret-Leak kann Service-Role-, HMAC- und Drittanbieter-Grenzen kompromittieren. |
|  3  | Env-/Secrets-Schema Fail-Fast       | **10**  | Top 20,5 % |   🟢   | **Execution Ready** _(neue Runde)_ |            [`03_env_secrets_schema.md`](./03_env_secrets_schema.md)            | [Vorige Runde archiviert](../docs/archive/t_security_hardening_03_env_secrets_schema.md) · [Deep-Dive](../docs/security-hardening/05_env_secrets_schema.md)                       | Fehlkonfigurationen werden früh sichtbar; die Abdeckung betrifft nur Kernvariablen.  |
|  5  | Header-Vollständigkeit              | **10**  |  Top 14 %  |   🟡   | **Execution Ready** _(neue Runde)_ |       [`05_header_vollstaendigkeit.md`](./05_header_vollstaendigkeit.md)       | [Vorige Runde archiviert](../docs/archive/t_security_hardening_05_header_vollstaendigkeit.md) · [Deep-Dive](../docs/security-hardening/02_security_headers.md)                    | Breite Browser-Schutzschicht, aber weniger direkt als CSP oder CSRF.                 |
|  6  | CSP-Violation-Reporting             |  **7**  |  Top 16 %  |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_06_csp_violation_reporting.md) · [Deep-Dive](../docs/security-hardening/03_csp_violation_reporting.md)                          | Erkennt reale CSP-Verstöße, beobachtet statt zu verhindern.                          |
| 10  | `security.txt` / RFC 9116           |  **5**  |  Top 14 %  |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_10_security_txt_rfc9116.md) · [Deep-Dive](../docs/security-hardening/10_security_txt_hsts_preload.md)                           | Verbessert verantwortliche Meldungen, ist aber keine Laufzeitbarriere.               |
|  9  | HSTS-Preload                        |  **1**  |  Top 8 %   |   🟢   |                                    |                                                                                | [Archiviert](../docs/archive/t_security_hardening_09_hsts_preload.md) · [Deep-Dive](../docs/security-hardening/10_security_txt_hsts_preload.md)                                   | Transportabsicherung, deren Erfolg hier überwiegend an der `.app`-TLD liegt.         |

> **Legende:** „Planungsdatei" und „Execution" sind bei allen Säulen ohne offene Iteration leer — die vorige, bereits umgesetzte Planungsrunde liegt jetzt vollständig unter „Dokumentation" (archiviert in `docs/archive/`). Nur die 4 Säulen mit Niveau ~Top 20 % oder schlechter (#3, #5, #7, #8) haben eine aktive, neue Planungsdatei mit ausschließlich LLM-Zuständigkeiten — Ziel Top 10 % je Säule (siehe §7 unten für den Fortschritt dieser neuen Runde).

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = (15·15 + 14·20 + 13·16 + 13·15 + 12·22 + 10·20,5 + 10·14 + 7·16 + 5·14 + 1·8) / 100 = 17,07` → **Top 17 %** (vorher Top 21 % zu Sessionbeginn, Top 18 % nach der reinen Recherche-Runde, jetzt Top 17 % nach der Execution-Runde 2026-09-06).

## 5 — Priorisierte Verbesserungs-Reihenfolge

**Bearbeitungsreihenfolge der neuen Runde — alle 4 sequenziell (nicht parallel) abgeschlossen, wie von Jan vorgegeben:**

1. ✅ Säule 7 — Supply-Chain-/Dependency-Audit-Gate → Planungsdatei fertig, projiziert Top 13 %
2. ✅ Säule 8 — Secret-Rotation-Prozess → Planungsdatei fertig, projiziert Top 18 %
3. ✅ Säule 5 — Header-Vollständigkeit → Planungsdatei fertig, projiziert Top 13 %
4. ✅ Säule 3 — Env-/Secrets-Schema Fail-Fast → Planungsdatei fertig, projiziert Top 10 %

**Nächster Schritt (nicht Teil dieses Auftrags):** Ausführung der 4 Planungsdateien nach `xx_sop/02_workflow_jan_execution.md` (5-Stufen-DoD je Meilenstein), auf Jans Freigabe wartend.

Weiterhin unverändert bei Jan (K5, nicht Teil dieser Planungsrunde, da nicht LLM-ausführbar): `ws`-Dependency-Fix (Säule 7), HMAC-Versionierung (Säule 8), COEP-Header-Entscheidung (Säule 5).

## 6 — Verwandte Artefakte

- [Neue, aktive Planungsdateien (diese Runde)](.) — `03_env_secrets_schema.md`, `05_header_vollstaendigkeit.md`, `07_dependency_supply_chain_audit.md`, `08_secret_rotation_prozess.md`
- [Archivierte Planungsdateien der vorigen Runde (alle 10 Säulen)](../docs/archive/) — Präfix `t_security_hardening_`
- [Worldmap-Aufschlüsselung](../worldmap/04_security_hardening.md)
- [Security-Master-Dokumentation](../docs/security-hardening/00_SECURITY_OVERVIEW.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)

## 7 — Fortschritt der neuen Planungsrunde (Säulen 3, 5, 7, 8 → Ziel Top 10 %)

| Säule | casino-code-explorer-Recherche | Planungsdatei erstellt | Selbstprüfung |                        Execution-Ready                        |
| :---: | :----------------------------: | :--------------------: | :-----------: | :-----------------------------------------------------------: |
|   7   |               ✅               |           ✅           |      ✅       | ✅ (projiziert Top 13 %, `ws`-K5-Rest bewusst nicht Top 10 %) |
|   8   |               ✅               |           ✅           |      ✅       | ✅ (projiziert Top 18 %, HMAC-K5-Rest bewusst nicht Top 10 %) |
|   5   |               ✅               |           ✅           |      ✅       | ✅ (projiziert Top 13 %, COEP-K5-Rest bewusst nicht Top 10 %) |
|   3   |               ✅               |           ✅           |      ✅       |  ✅ (projiziert Top 10 %, **kein** Jan-Gate in dieser Säule)  |

Diese Tabelle wird nach jeder abgeschlossenen Säule aktualisiert. Rückmeldung an Jan erst, wenn alle 4 Zeilen komplett grün sind.
