# 06 — CSP-Violation-Reporting

> **Status:** 🟢 Ausgeführt/verifiziert (Erhalt-Modus) · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** `src/app/api/internal/csp-report/route.ts`; **nicht** im Scope: CSP-Policy selbst (Säule 1).
> **Money-Pfad:** Nein · **Security-Review:** Nein (Observability-Route, unauthentifiziert by design, keine Wallet-Berührung)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3. Diese Route ist **bewusst unauthentifiziert** — Browser-CSP-Reports tragen keine verlässlichen Origin-Metadaten, eine Auth-Pflicht würde die Reports selbst verhindern. Das ist keine übersehene Lücke.
2. Beginne bei L1, falls die Testabdeckungs-Verifikation (§3) eine reale Lücke bestätigt.
3. Diese Route ist von der CSRF-Härtung (Säule 4) bewusst ausgenommen — nicht erneut als „fehlender Origin-Check" melden.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                        |              Status               | Nächster Schritt                                                                                                                                                                           | Zuständigkeit | Money-Pfad |
| --- | -------------------------------------------------- | :-------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                   |    🟢 verifiziert (2026-09-06)    | —                                                                                                                                                                                          |      LLM      |    Nein    |
| L1  | Testabdeckung frisch lokalisieren und verifizieren |     🟢 executed (2026-09-06)      | Gefunden: [`src/lib/security/__tests__/csp-report-route.test.ts`](../src/lib/security/__tests__/csp-report-route.test.ts) — 6/6 Tests grün, deckt genau die in §2 #1-#6 genannten Fälle ab |      LLM      |    Nein    |
| L2  | Dual-Format-Support (Legacy + Reporting-API-Batch) | 🟢 verifiziert (Stand 2026-08-30) | —                                                                                                                                                                                          |      LLM      |    Nein    |
| L3  | Sentry-Weiterleitung + IP-Rate-Limit               | 🟢 verifiziert (Stand 2026-08-30) | —                                                                                                                                                                                          |      LLM      |    Nein    |

---

## 2 — CSP-Violation-Reporting in Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                                          |  Niveau  | Status | Kernbefund                                                                                                                                                                                                                                                                                                                                                                                          |
| :-: | --------------------------------------------------------------------- | :------: | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Legacy-Format-Support (Einzelobjekt)                                  | Top 15 % |   🟢   | Klassisches `CSP-Report`-Objektformat wird angenommen                                                                                                                                                                                                                                                                                                                                               |
|  2  | Reporting-API-Batch-Format-Support                                    | Top 15 % |   🟢   | Modernes Batch-Array-Format ebenfalls unterstützt — deckt alte und neue Browser ab                                                                                                                                                                                                                                                                                                                  |
|  3  | Sentry-Weiterleitung                                                  | Top 15 % |   🟢   | `level: 'warning'`, `tags.source: 'csp-report'` — reale Verstöße werden sichtbar statt stumm verworfen                                                                                                                                                                                                                                                                                              |
|  4  | Batch-Kappung (DoS-Schutz gegen Report-Flut)                          | Top 15 % |   🟢   | Max. 20 Reports pro Request gekappt                                                                                                                                                                                                                                                                                                                                                                 |
|  5  | IP-Rate-Limit auf die Route selbst                                    | Top 20 % |   🟢   | 20/10s — verhindert, dass die Reporting-Route selbst zum Angriffsvektor wird                                                                                                                                                                                                                                                                                                                        |
|  6  | Stiller Verwurf bei Überschreitung (204, kein Fehler-Leak an Browser) | Top 15 % |   🟢   | Verhindert Informationsleck über interne Rate-Limit-Zustände an einen potenziellen Angreifer                                                                                                                                                                                                                                                                                                        |
|  7  | Bewusste CSRF-Ausnahme dokumentiert                                   | Top 10 % |   🟢   | Begründet: Browser-interne Reports tragen keine verlässlichen Origin-Header                                                                                                                                                                                                                                                                                                                         |
|  8  | Testabdeckung                                                         | Top 10 % |   🟢   | **Korrektur (2026-09-06):** Testdatei liegt unter `src/lib/security/__tests__/csp-report-route.test.ts` (nicht unter `src/app/api/internal/csp-report/__tests__/`, wo zuerst gesucht wurde) — 6 Tests, alle grün, decken Legacy-/Batch-Format, Rate-Limit-204, Malformed-JSON und Batch-Kappung ab. Die vorige „nicht gefunden"-Aussage war ein Rechercheversehen (falscher Pfad), kein realer Fund |
|  9  | Unauthentifiziert by Design, nicht versehentlich offen                | Top 15 % |   🟢   | Dokumentierte Architekturentscheidung, kein Fund                                                                                                                                                                                                                                                                                                                                                    |
| 10  | Payload-Validierung gegen Malformed Input                             | Top 30 % |   🟡   | Nicht in dieser Runde gegen den Quellcode neu geprüft, ob Zod o. Ä. zur Eingabevalidierung genutzt wird                                                                                                                                                                                                                                                                                             |

**Rechnerischer Schnitt (korrigiert 2026-09-06):** (15+15+15+15+20+15+10+10+15+30)/10 = **Top 16 %** (vorher Top 20 %, Korrektur bei #8). Verbleibender Punkt: #10 (Payload-Validierung gegen Malformed Input) — nicht in dieser Runde vertieft, geringes Risiko (Route antwortet ohnehin immer 204, ein Malformed-Payload kann laut Test #4 nichts zum Absturz bringen).

---

## 3 — Verifizierter Ist-Stand (2026-09-06)

**Korrektur (2026-09-06):** Die erste Suche in dieser Planungsserie suchte nur direkt unter `src/app/api/internal/csp-report/` und fand nichts. Eine zweite, gezielte Suche (`grep -rl "csp-report" src --include="*.test.ts"`) fand die Datei an der im Repo üblichen zentralen Stelle: `src/lib/security/__tests__/csp-report-route.test.ts` — **6 Tests, alle grün** (`describe('POST /api/internal/csp-report')`): „responds 204 with no body", „forwards each report in a Reporting API batch to Sentry", „unwraps the legacy single-object shape", „does not throw on invalid JSON", „caps how many reports from a single batch are forwarded", „silently drops reports once the per-IP rate limit is exceeded". Das bestätigt exakt den in `worldmap/04_security_hardening.md` (2026-08-30) genannten „6/6 Tests grün"-Stand — kein Doku-Drift, nur ein Rechercheversehen (falscher Pfad) in der ersten Runde dieser Datei.

Übrige Aussagen (Dual-Format, Sentry-Weiterleitung, Rate-Limit, Kappung) sind aus `docs/security-hardening/03_csp_violation_reporting.md` (Stand 2026-08-30) übernommen und in dieser Runde nicht erneut gegen den Quellcode gegengelesen — als solche gekennzeichnet, nicht als frisch verifiziert.

---

## 4 — Meilensteine

### L1 — Testabdeckung frisch lokalisieren und verifizieren ✅ ausgeführt (2026-09-06)

- **Ziel:** Die in §3 offen gelassene Diskrepanz klären, bevor die nächste Aussage zur Testabdeckung dieser Route getroffen wird.
- **Ergebnis:** `src/lib/security/__tests__/csp-report-route.test.ts` gefunden — 6/6 Tests grün, deckt Dual-Format-Parsing, Batch-Kappung, Rate-Limit-204-Antwort und Malformed-JSON bereits vollständig ab. Kein Code-Änderungsbedarf.
- **Verifizierung (2026-09-06):** `npm test` — 1614/1614 grün (inkl. dieser 6).

---

## 5 — Definition of Done

1. Testabdeckung dieser Route ist eindeutig lokalisiert und bestätigt (L1, ausgeführt — 6/6 Tests gefunden und grün).
2. Alle übrigen Subkategorien bleiben im Erhalt-Modus (kein bekannter Fund).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur die Report-Sink-Route, nicht die CSP-Policy-Definition selbst (Säule 1).
- [x] Keine neue Schreiboperation an Geld-Pfaden.
- [x] Statusbehauptungen differenziert: frisch verifiziert (2026-09-06) vs. aus älterer Doku übernommen — Diskrepanz bei #8 offen benannt statt verschwiegen.
- [x] Ehrlichkeits-Check: Die Test-Diskrepanz wird als offener Punkt gemeldet, nicht stillschweigend die ältere „6/6 grün"-Aussage übernommen, ohne sie verifizieren zu können.

---

## 7 — Verwandte Artefakte

| Bedarf                                                   | Datei                                                                                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Technischer Deep-Dive (Säule 3 in der Docs-Nummerierung) | [`docs/security-hardening/03_csp_violation_reporting.md`](../docs/security-hardening/03_csp_violation_reporting.md) |
| Übergeordnete Aufschlüsselung (Kategorie 04)             | [`worldmap/04_security_hardening.md`](../worldmap/04_security_hardening.md)                                         |
| Report-Sink-Route                                        | [`src/app/api/internal/csp-report/route.ts`](../src/app/api/internal/csp-report/route.ts)                           |
| Gewichtete Subkategorien-Übersicht (alle 10 Säulen)      | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                      |

---

## 8 — Optimierungspotenziale: Top 5 (Sicherheit, Geschwindigkeit, Smartness, Funktion)

> Zusatzrunde 2026-09-06.

|  #  | Potenzial                                                   | Dimension           | Warum                                                                                                                                                 | Aufwand |
| :-: | ----------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
|  1  | Testabdeckungs-Lücke klären (L1)                            | Sicherheit/Funktion | Höchste Priorität — bevor irgendeine weitere Aussage zur Testabdeckung getroffen wird, muss die in §3 offen gelassene Diskrepanz aufgelöst sein       | Niedrig |
|  2  | Sentry-Issue-Gruppierung nach `violated-directive`          | Smartness           | Aktuell landen Reports einzeln als Warnungen — eine Gruppierung würde wiederkehrende Muster (z. B. Extension-Interferenz) schneller sichtbar machen   | Mittel  |
|  3  | Noise-Filter für bekannte Browser-Extension-Verstöße        | Geschwindigkeit     | Filtert bekanntes Rauschen (z. B. Passwort-Manager-Extensions) vor dem Sentry-Versand heraus, damit echte Signale nicht untergehen                    | Mittel  |
|  4  | Rate-Limit-Schwelle (20/10s) unter realer Last verifizieren | Sicherheit          | Bei vielen gleichzeitigen Nutzern mit unterschiedlichen legitimen Verstößen könnte das Limit zu eng sein und echte Reports verwerfen                  | Niedrig |
|  5  | Alerting-Schwelle statt nur passivem Sentry-Log             | Funktion            | Bei X Reports/Minute für dieselbe Direktive automatisch alarmieren (analog Fraud-Alert-Muster) statt erst beim manuellen Dashboard-Blick zu reagieren | Mittel  |

**Niveau-Anpassung durch diese Analyse:** Rechnerischer Schnitt jetzt bei **Top 16 %** (siehe §2-Korrektur, L1 ausgeführt) — die verbleibenden 5 Punkte hier sind Ausbaustufen, kein neuer Fund.
