# 00 — Security Hardening: Verbesserungsplan

> **Status:** 🟡 Lebendes Arbeitsdokument · **Stand:** 2026-09-05 · **Owner:** Jan / LLM  
> **Worldmap-Kategorie:** 04 Security Hardening (Headers, CSP & Secrets)

## 1 — Executive Summary für Jan

Der gewichtete Reifegrad liegt bei **Top 21 %** und bestätigt die Worldmap-Einordnung **Top 20 %**. Die Angriffsschutz-Basis ist stark; der offene Bottleneck ist die Triage der Supply-Chain-Funde. HMAC-Secret-Versionierung bleibt ein Jan-Gate.

## 2 — Bewertungsmethode

Die Gewichte summieren sich auf 100. Direkt internet- oder secret-exponierte Grenzen erhalten mehr Gewicht. Werte und Status stammen aus der [Worldmap-Aufschlüsselung](../worldmap/04_security_hardening.md); diese Übersicht erzeugt keine neue Live-Behauptung.

## 3 — Die 10 Subkategorien: Gewichtung & Bewertung

|  #  | Säule                                                                                                 | Gewicht |  Niveau  | Status | Planungsdatei?                                                                  | Warum dieses Gewicht                                                                 |
| :-: | :---------------------------------------------------------------------------------------------------- | :-----: | :------: | :----: | :------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------- |
|  1  | CSP `script-src` Nonce-Härtung                                                                        | **15**  | Top 15 % |   🟢   | Nein                                                                            | Primäre XSS- und Script-Exfiltrationsgrenze.                                         |
|  7  | [Supply-Chain-/Dependency-Audit-Gate](../docs/security-hardening/07_dependency_supply_chain_audit.md) | **14**  | Top 48 % |   🔴   | Ja — [archiviert](../docs/archive/06_5_dependency_audit_gate_hardening_plan.md) | Ungepatchte Abhängigkeiten können mehrere Grenzen zugleich unterlaufen.              |
|  2  | Security-CI-Gate                                                                                      | **13**  | Top 19 % |   🟢   | Ja — [archiviert](../docs/archive/06_4_security_ci_gate_hardening_plan.md)      | Verhindert Sicherheitsregressionen im Hauptstand.                                    |
|  4  | CSRF/Origin-Guard                                                                                     | **13**  | Top 15 % |   🟢   | Nein                                                                            | Schützt schreibende Browser-Anfragen und Geldpfade.                                  |
|  8  | Secret-Rotation-Prozess                                                                               | **12**  | Top 22 % |   🟡   | Ja — [archiviert](../docs/archive/06_3_secret_rotation_hardening_plan.md)       | Ein Secret-Leak kann Service-Role-, HMAC- und Drittanbieter-Grenzen kompromittieren. |
|  3  | Env-/Secrets-Schema Fail-Fast                                                                         | **10**  | Top 25 % |   🟡   | Nein                                                                            | Fehlkonfigurationen werden früh sichtbar; die Abdeckung betrifft nur Kernvariablen.  |
|  5  | Header-Vollständigkeit                                                                                | **10**  | Top 12 % |   🟢   | Nein                                                                            | Breite Browser-Schutzschicht, aber weniger direkt als CSP oder CSRF.                 |
|  6  | CSP-Violation-Reporting                                                                               |  **7**  | Top 15 % |   🟢   | Nein                                                                            | Erkennt reale CSP-Verstöße, beobachtet statt zu verhindern.                          |
| 10  | `security.txt` / RFC 9116                                                                             |  **5**  | Top 15 % |   🟢   | Nein                                                                            | Verbessert verantwortliche Meldungen, ist aber keine Laufzeitbarriere.               |
|  9  | HSTS-Preload                                                                                          |  **1**  | Top 10 % |   🟢   | Nein                                                                            | Transportabsicherung, deren Erfolg hier überwiegend an der `.app`-TLD liegt.         |

## 4 — Gewichteter Gesamt-Schnitt

`Σ(Gewicht × Niveau) / 100 = 20,53` → **Top 21 %**. Die Differenz zum Worldmap-Headlinewert Top 20 % ist Rundung.

## 5 — Priorisierte Verbesserungs-Reihenfolge

1. `brace-expansion` und `js-yaml` aktualisieren oder begründet allowlisten; das Hard-Gate nicht abschwächen.
2. HMAC-Versionierung nur mit Jan-Freigabe entscheiden.
3. Env-Abdeckung messen, ohne absichtliche Soft-Fail-Designs zu zerstören.

## 6 — Verwandte Artefakte

- [Worldmap-Aufschlüsselung](../worldmap/04_security_hardening.md)
- [Security-Master-Dokumentation](../docs/security-hardening/00_SECURITY_OVERVIEW.md)
- [Worldmap-Status](../worldmap/00_WORLDMAP_STATUS.md)
