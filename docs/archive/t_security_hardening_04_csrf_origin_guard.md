# 04 — CSRF-/Origin-Guard

> **Status:** 🟢 Execution-Ready (Erhalt-Modus) · **Stand:** 2026-09-06 · **Owner:** LLM (kein Jan-Gate) · **Scope:** `src/lib/security/origin-guard.ts` (`hasValidOrigin()`, Edge-Layer) + `src/lib/security/request-security.ts` (`validateMutationOrigin()`, API-Layer); **nicht** im Scope: Rate-Limiting selbst (Kategorie 06), CSP (Säule 1).
> **Money-Pfad:** Ja (zweite Verteidigungslinie vor Geld-Routen) · **Security-Review:** Pflicht bei jeder Änderung

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1–§3. **Zwei bewusst unterschiedliche Origin-Checks, kein Duplikat:** `hasValidOrigin()` läuft am Edge vor jeder Route, `validateMutationOrigin()` zusätzlich innerhalb einzelner Geld-Routen mit einer expliziten `APP_ORIGINS`-Allowlist (Tiefenverteidigung — siehe `docs/security-hardening/04_csrf_origin_guard.md` §2.2).
2. Diese Säule ist **solide gebaut, 8/8 Tests grün, live verifiziert** — kein offener LLM-Meilenstein aus heutiger Sicht.
3. Bei jeder Änderung an einem der beiden Guards: `npm test -- origin-guard` UND ein Red-Team-Probe-Lauf (`scripts/red-team/`) als Regressionsschutz, da dies ein Geld-Pfad-angrenzender Perimeter ist.

---

## 1 — Übersicht für Jan

> **Korrekturvermerk (2026-09-12, T_SECURITY_HARDENING/04 Runde 2, L4):** Diese Archiv-Doku behauptet
> mehrfach, **beide** Origin-Guard-Schichten nutzten `Sec-Fetch-Site`. Das stimmt so nicht und wird
> hier gekennzeichnet statt still umgeschrieben: **Nur Layer 1** (`hasValidOrigin()`,
> `src/lib/security/origin-guard.ts`) prüft `Sec-Fetch-Site` primär (Fallback: `Origin`-vs-`Host`).
> **Layer 2** (`validateMutationOrigin()`, `src/lib/security/request-security.ts`) prüft
> **ausschließlich** `Origin` gegen die `APP_ORIGINS`-Allowlist und referenziert `Sec-Fetch-Site`
> nirgends — siehe `docs/security-hardening/04_csrf_origin_guard.md` §3 („Wichtiger Unterschied“).

| Nr. | Meilenstein                                                            |           Status            | Nächster Schritt | Zuständigkeit | Money-Pfad |
| --- | ---------------------------------------------------------------------- | :-------------------------: | ---------------- | :-----------: | :--------: |
| L0  | Kontext & Ist-Stand-Verifikation                                       | 🟢 verifiziert (2026-09-06) | —                |      LLM      |     Ja     |
| L1  | `Sec-Fetch-Site` als Primärsignal                                      |       🟢 verifiziert        | —                |      LLM      |     Ja     |
| L2  | Fail-Closed bei fehlenden Headern (alte Browser)                       |       🟢 verifiziert        | —                |      LLM      |     Ja     |
| L3  | Zweite Schicht (`validateMutationOrigin()`, Allowlist) auf Geld-Routen |       🟢 verifiziert        | —                |      LLM      |     Ja     |
| L4  | Red-Team-Probe-Historie gegen diesen Guard prüfen                      | 🟢 verifiziert (2026-09-06) | —                |      LLM      |     Ja     |

---

## 2 — CSRF-/Origin-Guard in Subkategorien: Bewertung & Bottlenecks

|  #  | Subkategorie                                                          |  Niveau  | Status | Kernbefund                                                                                                                                                                                                                                                                                                                     |
| :-: | --------------------------------------------------------------------- | :------: | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | `Sec-Fetch-Site` als primäres Signal                                  | Top 10 % |   🟢   | Browser-gesetzt, von Seiten-JS nicht fälschbar — moderner Standard statt reinem Origin-Header-Vergleich                                                                                                                                                                                                                        |
|  2  | Fallback auf `Origin`-vs-`Host` (alte Browser)                        | Top 20 % |   🟢   | Greift nur, wenn `Sec-Fetch-Site` fehlt — kein alleiniger Schutzmechanismus                                                                                                                                                                                                                                                    |
|  3  | Fail-Closed bei fehlenden Headern                                     | Top 10 % |   🟢   | Vorher blind durchgelassen, jetzt aktive Ablehnung — dokumentierte Härtung                                                                                                                                                                                                                                                     |
|  4  | Isolierte Testbarkeit (`origin-guard.ts` aus `proxy.ts` extrahiert)   | Top 15 % |   🟢   | 8 Tests (`src/lib/security/__tests__/origin-guard.test.ts`, verifiziert 2026-09-06), direkt unit-testbar statt nur über die Middleware                                                                                                                                                                                         |
|  5  | Zweite Schicht auf Geld-Routen (`validateMutationOrigin()`)           | Top 15 % |   🟢   | Explizite `APP_ORIGINS`-Allowlist statt Host-Vergleich — greift auch bei Middleware-Bypass                                                                                                                                                                                                                                     |
|  6  | Dev-Fallback-Konsistenz (`request.url`-Origin in Non-Prod)            | Top 30 % |   🟡   | Historischer Fund (`red-team-security.yml`-Kommentar, 2026-08-30): `127.0.0.1` vs. `localhost`-Mismatch führte zu falschen 403 in CI — behoben, aber ein Beispiel für Fragilität dieses Fallback-Pfads                                                                                                                         |
|  7  | Red-Team-Probe-Abdeckung (CSRF/Origin spezifisch)                     | Top 40 % |   🟠   | Kein dediziertes Origin-Bypass-Skript in `scripts/red-team/` gefunden (nur `admin-idor.ts`, `rate-limit-bypass.ts`, `bot-bypass.ts`, `crash-mp-bypass.ts`, `admin-fraud-idor.ts` laut `T_RATE_LIMITING_ABUSE_PREVENTION/06_rate_limiting_abuse_prevention.md`) — Origin-Guard wird nur indirekt über andere Probes mitgetestet |
|  8  | Konsistenz zwischen beiden Schichten (keine widersprüchliche Logik)   | Top 20 % |   🟢   | Beide Schichten nutzen dieselbe `Sec-Fetch-Site`-Präferenz, keine gegenläufige Origin-Definition gefunden _(korrigiert 2026-09-12, siehe Korrekturvermerk oben — Layer 2 nutzt KEIN `Sec-Fetch-Site`, sondern ausschließlich `Origin`-vs-`APP_ORIGINS`)_                                                                       |
|  9  | Live-Verifikation (Produktion)                                        | Top 15 % |   🟢   | Laut `T_SECURITY_HARDENING/04_security_hardening.md` (2026-08-30) als „committed & live" bestätigt                                                                                                                                                                                                                             |
| 10  | Dokumentierte Architektur-Begründung (kein Redundanz-Missverständnis) | Top 10 % |   🟢   | `docs/security-hardening/04_csrf_origin_guard.md` §2.2 erklärt explizit, warum zwei Checks kein Duplikat sind                                                                                                                                                                                                                  |

**Rechnerischer Schnitt:** (10+20+10+15+15+30+40+20+15+10)/10 = **Top 18,5 %**. Einziger echter Bottleneck: #7 (kein dediziertes Origin-Bypass-Red-Team-Skript) — thematisch an der Grenze zu Kategorie 06 (Rate Limiting & Abuse Prevention), wo die Red-Team-Probe-Serie bereits eigenständig geführt wird.

---

## 3 — Verifizierter Ist-Stand (2026-09-06)

`src/lib/security/__tests__/origin-guard.test.ts`: 8 Testfälle (`grep -c "it(\|test(" `, 2026-09-06) — deckt laut Doku `Sec-Fetch-Site`-Präferenz, `Origin`-vs-`Host`-Fallback und Fail-Closed bei fehlenden Headern ab.

`.github/workflows/red-team-security.yml` (Kommentarblock, Zeilen 8-16): Dokumentiert einen real aufgetretenen, seit 2026-08-30 behobenen `127.0.0.1`-vs-`localhost`-Origin-Mismatch in der CI-Umgebung — kein Fund einer echten Schutzlücke, sondern ein Testumgebungs-Artefakt. `PHASE1_STAGING_URL` nutzt seither konsequent `localhost`.

Kein eigenständiges CSRF-/Origin-Bypass-Skript in `scripts/red-team/` identifiziert — die vorhandenen Skripte (`admin-idor.ts`, `rate-limit-bypass.ts`, `bot-bypass.ts`, `crash-mp-bypass.ts`, `admin-fraud-idor.ts`) prüfen andere Angriffsvektoren, die den Origin-Guard nur indirekt (als Vorbedingung für ihren eigentlichen Testfall) durchlaufen.

---

## 4 — Meilensteine

Kein offener LLM-Meilenstein aus heutiger Sicht — diese Säule ist im Erhalt-Modus. Der einzige identifizierte Punkt (§2 #7) ist bewusst **nicht** als eigener Meilenstein hier geführt, da ein dediziertes Origin-Bypass-Red-Team-Skript inhaltlich zur Red-Team-Probe-Serie in `T_RATE_LIMITING_ABUSE_PREVENTION/` gehört (dort bereits eine laufende, gepflegte Skript-Sammlung) — eine neue Planungsdatei dafür würde Verantwortlichkeiten duplizieren. Empfehlung: als Folgeaufgabe in `docs/security-hardening/09_red_team_probes.md` §6 (bestehende Liste offener Proben) nachtragen, nicht hier neu bauen.

---

## 5 — Definition of Done

1. Beide Origin-Guard-Schichten bleiben synchron in ihrer `Sec-Fetch-Site`-Präferenz (Erhalt-Modus, kein aktiver Fix nötig). _(korrigiert 2026-09-12, siehe Korrekturvermerk oben)_
2. Ein dediziertes Origin-Bypass-Red-Team-Skript wird als benannte Folgeaufgabe in der Red-Team-Probe-Dokumentation geführt, nicht in dieser Datei dupliziert.

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur die beiden Origin-Guard-Schichten, nicht Rate-Limiting selbst.
- [x] Money-Pfad korrekt als „Ja" markiert (zweite Verteidigungslinie vor Geld-Routen), Security-Review als Pflicht bei künftigen Änderungen vermerkt.
- [x] Statusbehauptungen mit Testzahl (8 Tests, 2026-09-06) und Code-Referenz belegt.
- [x] Ehrlichkeits-Check: Der einzige Fund (#7) wurde nicht als eigener Meilenstein hier verdoppelt, sondern korrekt an die bereits zuständige Planungsserie verwiesen — keine künstliche Aufblähung dieser Datei.

---

## 7 — Verwandte Artefakte

| Bedarf                                                       | Datei                                                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Technischer Deep-Dive inkl. Architektur-Begründung (Säule 4) | [`docs/security-hardening/04_csrf_origin_guard.md`](../docs/security-hardening/04_csrf_origin_guard.md) |
| Übergeordnete Aufschlüsselung (Kategorie 04)                 | [`T_SECURITY_HARDENING/04_security_hardening.md`](../T_SECURITY_HARDENING/04_security_hardening.md)     |
| Red-Team-Probe-Dokumentation (offene Folgeproben)            | [`docs/security-hardening/09_red_team_probes.md`](../docs/security-hardening/09_red_team_probes.md)     |
| Red-Team-CI-Gate (Kategorie 06, verwandte Skript-Sammlung)   | [`docs/archive/06_7_red_team_ci_gate_plan.md`](../docs/archive/06_7_red_team_ci_gate_plan.md)           |
| Gewichtete Subkategorien-Übersicht (alle 10 Säulen)          | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                          |

---

## 8 — Optimierungspotenziale: Top 5 (Sicherheit, Geschwindigkeit, Smartness, Funktion)

> Zusatzrunde 2026-09-06.

|  #  | Potenzial                                                                    | Dimension       | Warum                                                                                                                                                                                                   | Aufwand |
| :-: | ---------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
|  1  | Dediziertes Origin-Bypass-Red-Team-Skript                                    | Sicherheit      | Bereits in §2 #7 als größter Bottleneck benannt — höchste Priorität dieser Säule                                                                                                                        | Mittel  |
|  2  | Beide Guard-Schichten auf gemeinsame `Sec-Fetch-Site`-Utility konsolidieren  | Smartness       | Falls `hasValidOrigin()` und `validateMutationOrigin()` die Präferenzlogik unabhängig implementieren, reduziert eine geteilte Hilfsfunktion das Risiko, dass beide Schichten künftig auseinanderdriften | Mittel  |
|  3  | Klare Warnung bei Dev-Fallback-Nutzung loggen                                | Geschwindigkeit | Der historische `127.0.0.1`-vs-`localhost`-Fund zeigt, wie fragil der Non-Prod-Fallback-Pfad ist — ein lautes Log bei Fallback-Nutzung hätte diese Debugging-Session verkürzt                           | Niedrig |
|  4  | Metrik/Log für tatsächlich abgelehnte Origin-Requests                        | Funktion        | Aktuell keine Observability, wie oft der Guard real greift — ohne Zahlen bleibt unklar, ob der Schutz nur theoretisch existiert oder aktiv etwas verhindert                                             | Niedrig |
|  5  | `APP_ORIGINS`-Allowlist regelmäßig gegen echte Vercel-Preview-Domains prüfen | Sicherheit      | Bei Preview-Deployments könnte eine neue Subdomain versehentlich durchfallen (zu offen) oder fälschlich blockiert werden (zu eng)                                                                       | Niedrig |

**Niveau-Anpassung durch diese Analyse:** Rechnerischer Schnitt bleibt bei **Top 18,5 %** — Punkt 4 (fehlende Observability) ist real, ändert aber nicht das reine Schutz-Niveau (die Ablehnung funktioniert nachweislich, sie wird nur nicht gezählt) und wird deshalb nicht in eine Niveau-Verschlechterung übersetzt.
