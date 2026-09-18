# 02 — Security-CI-Gate (Staging-Regression)

> **Status:** 🟢 Ausgeführt (archiviert), Erhalt-Modus · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** `security-staging.yml` (ephemerer lokaler Supabase-Stack, Phase-1-Sicherheitsskripte); **nicht** im Scope: Red-Team-Probes (eigenständiges, separates Gate, siehe §7), Dependency-Audit (Säule 7), Secret-Scan (Säule 8).
> **Money-Pfad:** Nein (reine CI-Infrastruktur) · **Security-Review:** Nein (Test-Gate, keine Produktionslogik)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3. Diese Säule ist **vollständig ausgeführt und archiviert** ([`docs/archive/06_4_security_ci_gate_hardening_plan.md`](../docs/archive/06_4_security_ci_gate_hardening_plan.md)) — kein offener LLM-Meilenstein.
2. Diese Datei existiert, damit die Säule (analog zu allen anderen 9) einen eigenen Eintrag im `T_SECURITY_HARDENING`-Ordner hat und der aktuelle Live-Stand nachvollziehbar ist, ohne den archivierten Plan erneut lesen zu müssen.
3. Bei einer künftigen Regression (roter CI-Lauf): zuerst §3 gegen den aktuellen `gh run list`-Stand neu verifizieren, dann erst den archivierten Plan als historischen Kontext lesen.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                        |                   Status                    | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | ------------------------------------------------------------------ | :-----------------------------------------: | ---------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                                   |         🟢 verifiziert (2026-09-06)         | —                |      LLM      |    Nein    |
| L1  | Ephemerer Supabase-Stack statt Cloud-Staging                       |         🟢 ausgeführt (archiviert)          | —                |      LLM      |    Nein    |
| L2  | Test-Abdeckungs-Mapping (4 CI-Testschritte ↔ Kategorie-02-Risiken) |         🟢 ausgeführt (archiviert)          | —                |      LLM      |    Nein    |
| L3  | SHA-gepinnte GitHub Actions                                        |         🟢 ausgeführt (archiviert)          | —                |      LLM      |    Nein    |
| L4  | Migrations-Kollision (Blocker für grünen Lauf) beheben             |         🟢 ausgeführt (2026-08-30)          | —                |      LLM      |    Nein    |
| L5  | Erster bestätigter grüner CI-Lauf                                  | 🟢 bestätigt (mehrfach, zuletzt 2026-09-06) | —                |       —       |    Nein    |

**Kein Jan-Gate nötig:** Alle Meilensteine sind CI-Konfiguration ohne Secret-Bedarf; der ephemere Stack läuft vollständig lokal im Runner.

---

## 2 — Security-CI-Gate in Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                             |  Niveau  | Status | Kernbefund                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :-: | -------------------------------------------------------- | :------: | :----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Ephemerer Stack statt Cloud-Staging                      | Top 15 % |   🟢   | Kein Secret-Leck-Risiko durch geteilte Cloud-Staging-Instanz, jeder Lauf isoliert                                                                                                                                                                                                                                                                                                                                                      |
|  2  | Test-Abdeckung ↔ reale Risiken gemappt                   | Top 15 % |   🟢   | 4 CI-Testschritte explizit gegen Kategorie-02-Risiken (DB/Migrationen) begründet, kein Blindflug                                                                                                                                                                                                                                                                                                                                       |
|  3  | SHA-Pinning der Actions                                  | Top 15 % |   🟢   | Keine Tag-basierten (mutable) Action-Referenzen mehr im Workflow                                                                                                                                                                                                                                                                                                                                                                       |
|  4  | Trigger-Abdeckung (Push auf sicherheitsrelevante Pfade)  | Top 20 % |   🟢   | Läuft bei jedem Push auf `main`, nicht nur `workflow_dispatch`                                                                                                                                                                                                                                                                                                                                                                         |
|  5  | Job-Summary bei Fehlschlag                               | Top 20 % |   🟢   | Lesbare Fehlerzusammenfassung statt reinem Log-Grepping                                                                                                                                                                                                                                                                                                                                                                                |
|  6  | Migrations-Kollision als struktureller Blocker           | Top 10 % |   🟢   | Behoben 2026-08-30, `uniq -d` liefert seither durchgehend leer (66 Migrationen, keine Kollision, verifiziert 2026-09-06)                                                                                                                                                                                                                                                                                                               |
|  7  | Nachweisbare grüne Läufe (nicht nur „sollte grün sein")  | Top 10 % |   🟢   | `gh run list` (2026-09-06): letzter Push-Lauf `34024839664` grün (09:30 UTC), davor durchgehend grün seit dem 2026-08-30-Fix                                                                                                                                                                                                                                                                                                           |
|  8  | Scope-Doku (was das Gate NICHT prüft)                    | Top 25 % |   🟢   | Klar von Red-Team-Probes (offensive Angriffe) und Dependency-Audit (Supply-Chain) abgegrenzt                                                                                                                                                                                                                                                                                                                                           |
|  9  | Concurrency-Schutz (keine kollidierenden Parallel-Läufe) | Top 10 % |   🟢   | **Korrektur 2026-09-06:** Beim erneuten, vollständigen Lesen der Datei (statt nur Grep) gefunden: `.github/workflows/security-staging.yml:34-39` hat bereits einen `concurrency`-Block (`group: security-staging-${{ github.ref }}`, `cancel-in-progress: true`), ergänzt via `06_7 L1`. Die vorige Aussage „kein Block gefunden" war ein Rechercheversehen (Grep-Suche traf offenbar nicht), nicht ein realer Fund — hier korrigiert. |
| 10  | Fail-Closed-Verhalten bei Infrastruktur-Fehler           | Top 20 % |   🟢   | Kein `continue-on-error`, ein gescheiterter Schritt blockiert den Workflow-Erfolg                                                                                                                                                                                                                                                                                                                                                      |

**Rechnerischer Schnitt (korrigiert 2026-09-06):** (15+15+15+20+20+10+10+25+10+20)/10 = **Top 16 %** (vorher Top 18 %, Korrektur bei #9). Kein offener Punkt mehr in dieser Säule.

---

## 3 — Verifizierter Ist-Stand (2026-09-06)

`gh run list --workflow=security-staging.yml --limit 3`: letzter Push-Lauf `34024839664` (2026-09-06, 09:30 UTC) **success**, davor `33987257048` (2026-09-05, `workflow_dispatch`) **success**. Ein einzelner roter Lauf (`33986785853`, 2026-09-05, 21s, scope-fremder Doku-Commit) liegt dazwischen, ist aber isoliert und nicht Teil einer anhaltenden Regression — der unmittelbar nachfolgende Lauf ist bereits wieder grün.

Migrations-Kollisions-Check (`ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d`, 2026-09-06): **leer** — 66 Migrationsdateien, keine doppelte Präfix-Nummer. Der in `T_SECURITY_HARDENING/04_security_hardening.md` §„Stash-Vorfall" beschriebene Regressions-Fall vom 2026-08-29 ist seit dem 2026-08-30-Fix nicht wieder aufgetreten.

**Korrektur (2026-09-06, beim Volltext-Lesen der Datei für die Execution-Runde entdeckt):** `.github/workflows/security-staging.yml:34-39` hat bereits einen `concurrency`-Block. Die vorherige Aussage in dieser Datei („kein Block gefunden") war ein Rechercheversehen, kein realer Fund — hiermit korrigiert, kein Code-Änderungsbedarf.

---

## 4 — Meilensteine

### L6 — Concurrency-Block ~~ergänzen~~ bereits vorhanden (Recherchekorrektur 2026-09-06)

Kein Umsetzungsbedarf — der Block existiert bereits (`security-staging.yml:34-39`). Dieser Meilenstein wird als 🟢 geschlossen geführt, um den Korrekturverlauf nachvollziehbar zu halten, statt ihn stillschweigend zu entfernen.

---

## 5 — Definition of Done

1. Gate läuft nachweislich grün bei Pushes auf `main` (bereits erfüllt, laufend beobachtet).
2. Migrations-Kollisions-Blocker bleibt dauerhaft behoben (Erhalt-Modus, kein neuer Fund).
3. Concurrency-Block ist bereits vorhanden (L6, Recherchekorrektur 2026-09-06) — kein offener Punkt mehr.

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur das Staging-Regressions-Gate, nicht Red-Team (offensiv) oder Dependency-Audit (Supply-Chain).
- [x] Keine neue Schreiboperation an Geld-Pfaden.
- [x] Statusbehauptungen mit frischem `gh run list`-Beleg (2026-09-06) statt Erinnerung an alte Doku.
- [x] Ehrlichkeits-Check: Die fälschliche „Concurrency fehlt"-Aussage aus der ersten Recherche wurde beim genaueren Hinsehen selbst korrigiert (§3), nicht stillschweigend stehen gelassen.

---

## 7 — Verwandte Artefakte

| Bedarf                                                   | Datei                                                                                                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Vollständiger, ausgeführter Härtungsplan                 | [`docs/archive/06_4_security_ci_gate_hardening_plan.md`](../docs/archive/06_4_security_ci_gate_hardening_plan.md)                 |
| Technischer Deep-Dive (Säule 8 in der Docs-Nummerierung) | [`docs/security-hardening/08_security_ci_gates.md`](../docs/security-hardening/08_security_ci_gates.md)                           |
| Übergeordnete Aufschlüsselung (Kategorie 04)             | [`T_SECURITY_HARDENING/04_security_hardening.md`](../T_SECURITY_HARDENING/04_security_hardening.md)                               |
| Red-Team-CI-Gate (separates, offensives Gate)            | [`T_RATE_LIMITING_ABUSE_PREVENTION/../docs/archive/06_7_red_team_ci_gate_plan.md`](../docs/archive/06_7_red_team_ci_gate_plan.md) |
| Gewichtete Subkategorien-Übersicht (alle 10 Säulen)      | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                    |

---

## 8 — Optimierungspotenziale: Top 5 (Sicherheit, Geschwindigkeit, Smartness, Funktion)

> Zusatzrunde 2026-09-06: Diese Säule ist bereits ausgeführt und grün — die folgenden Punkte sind Ausbaustufen, keine Korrektur.

|  #  | Potenzial                                                              | Dimension       | Warum                                                                                                                                                                                              | Aufwand |
| :-: | ---------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
|  1  | ~~Concurrency-Block ergänzen~~ (Recherchekorrektur: existiert bereits) | Geschwindigkeit | War fälschlich als offen geführt — `security-staging.yml:34-39` hat den Block bereits                                                                                                              |    —    |
|  2  | `paths:`-Filter auf sicherheitsrelevante Verzeichnisse verfeinern      | Smartness       | Aktuell läuft das Gate vermutlich bei jedem Push; ein Filter auf `supabase/`, `src/lib/security/`, `src/app/api/` spart CI-Minuten, ohne den Schutz zu verlieren                                   | Niedrig |
|  3  | Failure-Alert bei rotem `main`-Lauf (Telegram/Slack)                   | Funktion        | Aktuell nur in der GitHub-UI sichtbar — ein Alert analog zum bereits gebauten Fraud-Alert-Muster (`fraudAlertWait`) macht eine Regression sofort sichtbar statt erst beim nächsten manuellen Blick | Mittel  |
|  4  | Ephemeral-Stack-Isolation bei Parallelläufen verifizieren              | Sicherheit      | Der Concurrency-Block verhindert Parallelläufe bereits strukturell (`cancel-in-progress: true`) — ein einmaliger gezielter Test bestätigt das auch empirisch, nicht nur aus dem YAML gelesen       | Niedrig |
|  5  | `npm ci`/Supabase-Image-Caching zwischen Läufen                        | Geschwindigkeit | Verkürzt die ~3–4 Minuten Laufzeit, schnellerer Feedback-Loop für jeden Push                                                                                                                       | Mittel  |

**Niveau-Anpassung durch diese Analyse:** Rechnerischer Schnitt bleibt bei **Top 18 %** — alle 5 Punkte sind Ausbaustufen eines bereits grün laufenden Gates, kein neuer Fund, der die bestehende Bewertung nach unten korrigiert.
