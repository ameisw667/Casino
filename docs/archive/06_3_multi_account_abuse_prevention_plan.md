# 06_3 — Multi-Account-/Duplicate-Account-Abuse-Prevention: Umsetzungsplan

> **Status:** Executed (archiviert) · **Stand:** 2026-09-08 · **Owner:** LLM · **Scope:** Unterkategorie #10 aus [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md) (Top 35 %). Alle Zuständigkeiten liegen beim LLM; kein Meilenstein ist auf eine Jan-Entscheidung während der Ausführung angewiesen. Dieser Plan ist bewusst so geschrieben, dass eine **komplett neue, kontextlose LLM-Konversation** ihn ohne Rückfragen ausführen kann — jeder Meilenstein nennt exakte Dateipfade, bestehende Code-Muster zum Kopieren und den Grund für jede Entscheidung.
> **Quellcode-Basis:** Alle Befunde unten wurden am 2026-09-04 durch einen read-only `casino-code-explorer`-Lauf gegen den tatsächlichen Code verifiziert (Datei:Zeile-Belege). Kein Punkt ist Spekulation.
> **Wichtiger Hinweis für die ausführende Session:** Dieses Repo hatte bereits einmal den Fall, dass eine parallel laufende Session einen frisch geschriebenen „Geplant"-Plan ungefragt ausgeführt hat. Falls du diese Datei liest, weil Jan sie dir explizit als Auftrag gegeben hat: das ist korrekt und gewollt. Falls du sie nur zufällig beim Durchsuchen von `worldmap/` gefunden hast, ohne dass Jan dich explizit dazu aufgefordert hat: **frag zuerst nach**, bevor du Migrationen anwendest oder Code änderst.

## 0 — Kontext, den die ausführende Session sofort braucht

> **Aktualitäts-Hinweis (2026-09-06, nach 06_5-Execution):** Die IP-Extraktion wurde inzwischen konsolidiert — `src/lib/casino/network-fingerprint.ts` nutzt jetzt die geteilte `extractClientIp()` aus `src/lib/security/request-security.ts` (letzter XFF-Eintrag statt des früheren, spoofbaren ersten Eintrags; IPv6-/64-Normalisierung). Die M-Befunde unten, die `network-fingerprint.ts` referenzieren, bleiben inhaltlich gültig; die IP-Extraktions-Inkonsistenz ist damit kein offener Punkt mehr (war Teil von [`docs/archive/06_5_identifier_ip_extraction_plan.md`](../docs/archive/06_5_identifier_ip_extraction_plan.md)).

Diese Kategorie hängt eng mit zwei bereits **ausgeführten** Schwester-Plänen zusammen — beide archiviert, beide grün verifiziert (typecheck 0 Fehler, lint 0 Fehler, 197/197 Testdateien/1508/1508 Tests):

- [`docs/archive/06_1_bot_automation_detection_plan.md`](../docs/archive/06_1_bot_automation_detection_plan.md) — Bot-Erkennung (Signup-Honeypot, Login-Preflight, Promo-Guess-Guard, Bet-Velocity-Guard, Chat-Cost-Cap).
- [`docs/archive/06_2_responsible_gambling_controls_plan.md`](../docs/archive/06_2_responsible_gambling_controls_plan.md) — Self-Exclusion + Tages-Verlustlimit (`user_wellbeing_limits`-Tabelle, Migration `063`).

**Wichtig — keine Tabellen-Wiederverwendung:** `user_wellbeing_limits` (063) ist für **spielerinitiierten Selbstschutz** gedacht (Self-Exclusion durch den Nutzer selbst). Dieser Plan hier braucht eine **andersartige, admin-initiierte Fraud-Enforcement-Sperre** (L2 unten) — bewusst eine **neue, separate Spalte/Tabelle**, nicht `user_wellbeing_limits` erweitern, da sonst zwei völlig verschiedene Zwecke (Spielerschutz vs. Betrugsbekämpfung) in einer Tabelle vermischt würden.

**Aktuelle Migrationsnummern-Lage (Stand 2026-09-04):** höchste vorhandene ist `063_user_wellbeing_limits.sql`. Neue Migrationen in diesem Plan beginnen folgerichtig bei `064`. **Vor Ausführung neu prüfen** (`ls supabase/migrations/ | sort | tail -5`), falls seitdem weitere Migrationen entstanden sind.

## 1 — Segmentierung: 10 Sub-Unterkategorien (vor der Planung identifiziert)

| #   | Sub-Unterkategorie                                | Niveau          | Status quo (verifiziert)                                                                                                                                                                                                                                                                                                                                                   | Beleg                                                                                          |
| :-- | :------------------------------------------------ | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| M1  | IP-Cluster-Detection-Algorithmus                  | **Top 20 %** 🟡 | RPC `detect_multi_account_clusters(p_window_hours=24, p_min_cluster=3)` gruppiert `bet_network_fingerprints` nach `ip_hash`; TS-Schweregrad-Bänder low/medium/high bei 3/5/10 Accounts. Solide gebaut und getestet.                                                                                                                                                        | `030_fraud_signal_detection.sql:177-195`, `fraud-detection.ts:14-17`                           |
| M2  | **Fingerprint-Erfassungslücke bei Signup/Redeem** | **Top 85 %** 🔴 | `recordBetNetworkFingerprintBestEffort()` wird **ausschließlich** aus den drei Bet-Routen aufgerufen (`bet`, `blackjack`, `bet-crash-multiplayer`) — **niemals** bei Signup oder `redeem-code`. Ein Farmer, der nur Accounts erstellt und Promo-Codes einlöst, ohne je zu wetten, ist für die Cluster-Erkennung **komplett unsichtbar**. Größte Einzellücke der Kategorie. | `network-fingerprint.ts` (Aufrufer-Grep: nur 3 Bet-Routen)                                     |
| M3  | Kein Enforcement-Pfad                             | **Top 60 %** 🟠 | `/admin/fraud` erlaubt nur „geprüft"/„geschlossen" (Status-Annotation). Kein Merge-, Ban-, Freeze-Button existiert irgendwo im Code. `docs/archive/05_2.8_Anti_Fraud.md:352-356` bestätigt: bewusstes Design, aber ohne Umsetzung.                                                                                                                                         | `FraudPageClient.tsx:123-145,283-345`, `UsersPageClient.tsx:46-53`                             |
| M4  | Kein Gate vor Bonus-/Balance-Vergabe              | **Top 75 %** 🔴 | Neukonto-Startguthaben (`wallet.ts:74-80`, 10.000 Balance) und Promo-Einlösung (`redeem-code/route.ts`) prüfen **nie** auf einen bereits bekannten Cluster vor der Vergabe — Detection ist rein nachgelagert (Admin-Scan), Bonus ist zu dem Zeitpunkt längst ausgezahlt.                                                                                                   | `wallet.ts:74-80` (kein RPC-Aufruf), `redeem-code/route.ts`                                    |
| M5  | Kein Device-/Browser-Fingerprinting               | **Top 55 %** 🟠 | Nur IP-Hash-Korrelation; `package.json` enthält keine Fingerprinting-Bibliothek (FingerprintJS o. ä.), weder installiert noch ungenutzt vorhanden.                                                                                                                                                                                                                         | `package.json` (vollständig geprüft)                                                           |
| M6  | Kein False-Positive-Allowlist                     | **Top 65 %** 🟠 | Kein Code-Mechanismus, einen erkannten Cluster als „bekannt/legitim" (Haushalt, Büro, CGNAT) zu markieren — jeder Scan meldet denselben Cluster erneut. Dokumentiertes, akzeptiertes Risiko (R11/R22), aber ohne Umsetzung.                                                                                                                                                | `docs/archive/05_2.8_Anti_Fraud.md:302,316,321`, Grep ohne Treffer für Allowlist-Logik         |
| M7  | IP-Hash-Sicherheit bei Secret-Kompromittierung    | **Top 50 %** 🟠 | HMAC nur über die IP (klein: 2³² Keyspace) — bei Leak von `FRAUD_FINGERPRINT_SECRET` brute-forcierbar. Code kommentiert dies selbst als „pseudonymized, not anonymized".                                                                                                                                                                                                   | `network-fingerprint.ts:24-28`                                                                 |
| M8  | Testabdeckung                                     | **Top 45 %** 🟡 | TS-Wrapper gegen gemockte RPC-Antworten getestet (Cluster-Größe, Severity, Fail-Safe). **Nicht getestet:** echte SQL-Schwellenwert-Logik gegen eine Test-DB, keine False-Positive-Szenarien (Haushalt/CGNAT).                                                                                                                                                              | `fraud-detection.test.ts:68-106`, `network-fingerprint.test.ts`                                |
| M9  | Risk-Events-Datenaufbewahrung                     | **Top 40 %** 🟠 | Fingerprint-Purge sauber: `purge_bet_network_fingerprints()` löscht nach 30 Tagen, täglicher `pg_cron`-Job mit Alert-on-Failure. Aber `risk_events` selbst hat **keinen** Purge-Job — wächst unbegrenzt.                                                                                                                                                                   | `030_fraud_signal_detection.sql:288-350` (Purge nur für Fingerprints, nicht für `risk_events`) |
| M10 | Referral-/Invite-System-Interaktion               | **Top 5 %** 🟢  | Kein Referral-/Invite-Feature im Repo vorhanden (Grep ohne relevante Treffer) — aktuell kein Angriffsvektor, nur als Wachposten für die Zukunft dokumentiert. Kein Handlungsbedarf.                                                                                                                                                                                        | Grep `referral\|invite` ohne relevante Treffer                                                 |

**Marker-Konvention:** 🟢 Top 1–10 % · 🟡 Top 11–25 % · 🟠 Top 26–50 % · 🔴 Top 51–100 % (identisch zu `06_rate_limiting_abuse_prevention.md`).

**Rechnerischer Schnitt über alle 10 Positionen:** (20+85+60+75+55+65+50+45+40+5)/10 = **Top 50,0 %** — deutlich schlechter als der bisherige Top-35-%-Bestwert, weil M2 und M4 (Fingerprint-Lücke + fehlendes Bonus-Gate) die eigentliche Zielsetzung dieser Kategorie — Promo-/Bonus-Farming durch Duplicate Accounts verhindern — bislang praktisch wirkungslos machen: Ein Farmer, der nie wettet, wird nie erfasst (M2), und selbst ein erfasster Cluster verhindert keine bereits ausgezahlten Boni (M4).

## 2 — Übersicht für Jan

| Nummer | Meilenstein                                              | Status                    | Nächster Schritt                                               | Zuständigkeit |
| ------ | -------------------------------------------------------- | ------------------------- | -------------------------------------------------------------- | ------------- |
| L0     | Fingerprint-Erfassung auf Signup + Redeem ausweiten (M2) | 🟢 Verifiziert ausgeführt | Neue Preflight-Route + Verdrahtung in `AuthForm`/`redeem-code` | LLM           |
| L1     | Realtime-Cluster-Check vor Bonus-Vergabe (M4)            | 🟢 Verifiziert ausgeführt | Guard vor Startguthaben + Promo-Einlösung                      | LLM           |
| L2     | Admin-Enforcement-Aktion: Account einfrieren (M3)        | 🟢 Verifiziert ausgeführt | Neue `account_status`-Spalte + Admin-Route/Button              | LLM           |
| L3     | False-Positive-Allowlist für Cluster (M6)                | 🟢 Verifiziert ausgeführt | „Als legitim markieren"-Aktion in `/admin/fraud`               | LLM           |
| L4     | IP-Hash-Härtung: Secret-Rotation verifizieren (M7)       | 🟢 Verifiziert ausgeführt | Cross-Check gegen bestehende Secret-Rotation-SOP               | LLM           |
| L5     | Testabdeckung erweitert (M8)                             | 🟢 Verifiziert ausgeführt | Echte Schwellenwert- + False-Positive-Tests                    | LLM           |
| L6     | Risk-Events-Retention-Policy (M9)                        | 🟢 Verifiziert ausgeführt | Neuer Purge-Job für alte, geschlossene Events                  | LLM           |
| L7     | Testabdeckung + Doku-Nachzug (Abschluss)                 | 🟢 Verifiziert ausgeführt | Vollsuite grün, Kategorie-06-Datei aktualisieren               | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. **M5 (Device-Fingerprinting) und M10 (Referral) haben bewusst keinen eigenen Meilenstein** — M5 ist eine Grundsatzfrage (siehe Q2 unten, kein Bau-Auftrag ohne Jans Antwort), M10 hat keinen Handlungsbedarf (kein Feature vorhanden).

## 3 — Abgrenzung zu verwandten Plänen

- **`06_1` (Bot-Detection, executed):** `signup-guard.ts` (Honeypot/Timing) und `bet-velocity-guard.ts` sind bereits gebaut. L0 dieses Plans **erweitert** die Signup-Route um eine zusätzliche, andersartige Prüfung (Fingerprint-Aufzeichnung, nicht Bot-Erkennung) — beide Guards laufen parallel in derselben Route, keine Dopplung, aber **dieselbe Datei muss in derselben Ausführungssession angefasst werden** (`src/components/auth/AuthForm.tsx`, `src/components/auth/StandardAuthView.tsx`), um nicht zweimal denselben Kontext zu laden.
- **`06_2` (Responsible Gambling, executed):** Siehe Kontext-Hinweis in Abschnitt 0 — **keine** Tabellen-Wiederverwendung von `user_wellbeing_limits` für L2.
- **Unterkategorie #5 (Promo-/Bonus-Abuse, dieselbe Kategorie 06):** L1 (Bonus-Gate) überschneidet sich thematisch, ist aber aus der Multi-Account-Perspektive gebaut (Cluster-Check), nicht aus der Einzelcode-Perspektive (die bereits durch `promo-guess-guard.ts` aus `06_1` abgedeckt ist).

## 4 — Meilensteine im Detail

### L0 — Fingerprint-Erfassung auf Signup + Redeem ausweiten (M2, höchste Priorität)

**Ziel:** Jeder Account-Erstellungs- und Promo-Einlösungs-Versuch hinterlässt einen IP-Fingerprint, nicht nur Bet-Aktionen — schließt die größte Blindstelle der Kategorie.
**Scope:** `recordBetNetworkFingerprintBestEffort()` (Modulname bleibt wegen Rückwärtskompatibilität, oder Umbenennung zu `recordNetworkFingerprintBestEffort()` mit `scope`-Parameter — **Entscheidung bei der ausführenden Session**, beide Optionen sind gleichwertig, solange die Aufrufer konsistent sind) wird zusätzlich aufgerufen aus: (a) einer neuen Route `POST /api/auth/signup-fingerprint` (analog zum bereits bestehenden Muster `POST /api/auth/signup-suspicion` aus `06_1` — gleiche Route-Konventionen: `validateMutationOrigin`, IP-Rate-Limit, `PUBLIC_ROUTES`-Eintrag in `src/proxy.ts`, fire-and-forget, nie blockierend), aufgerufen aus `AuthForm.tsx` nach erfolgreichem `supabase.auth.signUp()`; (b) direkt in `redeem-code/route.ts` vor der Zod-Validierung (Server-Route existiert bereits, kein neuer Endpunkt nötig, nur ein zusätzlicher Funktionsaufruf).
**Abhängigkeiten:** Keine (Fundament).
**Freigabe-Gate:** `security-reviewer` PASS (neue Auth-adjazente Route + Änderung an bestehender Geld-Route).
**Verifizierung:** Test simuliert 3 Signups von derselben IP ohne einen einzigen Bet → `detect_multi_account_clusters` erfasst den Cluster (vorher: 0 Erfassung ohne Bet-Aktivität).
**Nicht-Scope:** Kein neues Fingerprint-Format, keine Änderung an `network-fingerprint.ts`s HMAC-Logik selbst.
**Money-Pfad:** Nein (Signup) / Ja (Redeem) · **Security-Review:** Pflicht.

### L1 — Realtime-Cluster-Check vor Bonus-Vergabe (M4)

**Ziel:** Ein bereits bekannter Cluster verhindert die Auszahlung eines NEUEN Bonus, statt erst nachträglich aufzufallen.
**Scope:** Neue leichte Guard-Funktion `checkKnownClusterBeforeGrant(userId)` in `src/lib/casino/fraud-detection.ts` (gleiche Datei wie die bestehende `detectMultiAccountIndicators()`, importiert deren Threshold-Konstanten statt sie zu duplizieren — analog zum bereits etablierten Muster aus `06_1` L5, wo `bet-velocity-guard.ts` seine Schwellenwerte aus `fraud-detection.ts` importiert, um Drift zu vermeiden). Aufgerufen VOR `wallet.ts:74-80` (Startguthaben) und VOR der RPC in `redeem-code/route.ts`. Bewusst **kein Hard-Block** in dieser ersten Ausbaustufe (Analog zu `06_1`s L3-Entscheidung: fail-open mit Signal statt Block, um False-Positive-Risiko — siehe M6 — nicht ungeprüft in einen Business-Impact zu übersetzen) — bei erkanntem Cluster wird der Bonus **trotzdem gewährt**, aber ein `multi_account_indicator`-Event mit `severity: high` und `evidence.pre_grant_cluster_detected: true` erzeugt, sodass ein Admin **vor** dem nächsten Cluster-Mitglied reagieren kann.
**Abhängigkeiten:** L0 (ohne Signup/Redeem-Fingerprint gäbe es hier nichts zu prüfen).
**Freigabe-Gate:** `security-reviewer` PASS (Geld-Pfad).
**Verifizierung:** Test: 3. Account von derselben IP registriert sich und will Startguthaben — Signal wird VOR Gewährung erzeugt (nicht erst beim nächsten Admin-Scan-Lauf).
**Nicht-Scope:** Kein Hard-Block in dieser Ausbaustufe (siehe Q1 unten — das ist eine bewusste Grundsatzfrage, keine LLM-Alleinentscheidung).
**Money-Pfad:** Ja · **Security-Review:** Pflicht.

### L2 — Admin-Enforcement-Aktion: Account einfrieren (M3)

**Ziel:** Ein Admin kann auf einen bestätigten Multi-Account-Missbrauch tatsächlich reagieren, nicht nur den Status auf „geprüft" setzen.
**Scope:** Neue Spalte `account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active','frozen'))` in der `users`-Tabelle (Migration `064_account_status.sql`) — **explizit getrennt von `user_wellbeing_limits`** (siehe Abschnitt 0). Neue Admin-Route `PATCH /api/admin/users/[id]/status` (Body: `{status: 'frozen'|'active', reason: string}`), analog zum bestehenden Zod/Auth/Rate-Limit-Muster aus `admin/promo-codes/route.ts`. Guard-Erweiterung: `checkWellbeingGuard()` (aus `06_2`, in `src/lib/casino/responsible-gambling.ts`) oder eine parallele, gleich-benannte Guard-Funktion prüft zusätzlich `account_status = 'frozen'` und blockiert dieselben vier Money-Routen mit demselben 403-Muster (`ACCOUNT_FROZEN` statt `SELF_EXCLUDED`) — **Wiederverwendung der bestehenden Guard-Aufruf-Position**, nicht der Tabelle.
**Abhängigkeiten:** Keine (kann parallel zu L0/L1 geplant, aber sequenziell danach ausgeführt werden, da derselbe Guard-Aufrufpunkt in denselben vier Routen berührt wird — beide Änderungen sollten in derselben Sitzung erfolgen, um Merge-Konflikte in denselben Dateien zu vermeiden).
**Freigabe-Gate:** `@migration-security-guard` PASS (neue Migration) + `security-reviewer` PASS (neue Admin-Berechtigung, Geld-Pfad-Guard-Erweiterung).
**Verifizierung:** Test setzt `account_status='frozen'` → alle vier Money-Routen liefern 403; Admin-Route lehnt Aufruf durch Nicht-Admin ab (analog zum bestehenden `admin-idor.ts` Red-Team-Muster aus `06_1` L6/06-Aufschlüsselung #6).
**Nicht-Scope:** Kein automatisches Einfrieren (immer explizite Admin-Aktion, kein Auto-Ban aus L1's Signal).
**Money-Pfad:** Ja · **Security-Review:** Pflicht (Migration + Admin-Pfad).

### L3 — False-Positive-Allowlist für Cluster (M6)

**Ziel:** Ein Admin kann einen erkannten Cluster als „bekannt/legitim" markieren (Haushalt, Büro, CGNAT), sodass er bei künftigen Scans nicht erneut als offener Fund erscheint.
**Scope:** Bestehender `PATCH /api/admin/fraud`-Endpunkt (Status `reviewed`/`closed`) bekommt einen dritten Status-Wert `suppressed` (CHECK-Constraint-Erweiterung auf `risk_events.status`, analog zum NOT VALID/VALIDATE-Muster aus `062_bot_signal_types.sql`). `runFraudSignalScan()` in `fraud-detection.ts` überspringt beim erneuten Scan Cluster, deren `fingerprint` bereits einen `suppressed`-Eintrag hat (Lookup vor dem `record_risk_event()`-Aufruf).
**Abhängigkeiten:** Keine (unabhängig von L0–L2).
**Freigabe-Gate:** `@migration-security-guard` PASS (CHECK-Constraint-Migration) + `security-reviewer` PASS.
**Verifizierung:** Test: Cluster wird als `suppressed` markiert → nächster Scan-Lauf erzeugt kein neues `open`-Event für denselben Fingerprint, ein völlig neuer Cluster (anderer Fingerprint) wird weiterhin normal gemeldet.
**Nicht-Scope:** Keine automatische Erkennung „das ist wahrscheinlich ein Firmennetzwerk" (bleibt menschliche Einschätzung).
**Money-Pfad:** Nein · **Security-Review:** Pflicht (Migration).

### L4 — IP-Hash-Härtung: Secret-Rotation verifizieren (M7)

**Ziel:** Sicherstellen, dass `FRAUD_FINGERPRINT_SECRET` denselben Rotationsprozess durchläuft wie andere Secrets, um das dokumentierte Brute-Force-Risiko bei Leak zu begrenzen.
**Scope:** Cross-Check gegen `xx_sop/14_secret_rotation.md` und `xx_docs/13_secret_rotation_log.md` — ist `FRAUD_FINGERPRINT_SECRET` dort bereits gelistet? Falls nein: ergänzen (reine Doku-Änderung, keine Code-Änderung). Falls das Secret bei Rotation alle bestehenden `ip_hash`-Werte historisch inkonsistent macht (alte Hashes mit altem Secret, neue mit neuem — Cluster über eine Rotation hinweg unsichtbar): das als dokumentierte, akzeptierte Einschränkung vermerken (kein Code-Fix in dieser Ausbaustufe, da eine Rehashing-Migration unverhältnismäßig aufwändig wäre für ein Play-Money-Casino).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Keins (reine Doku-Prüfung/-Ergänzung).
**Verifizierung:** `xx_docs/13_secret_rotation_log.md` enthält einen Eintrag für `FRAUD_FINGERPRINT_SECRET` mit Rotationsintervall.
**Nicht-Scope:** Keine Rehashing-Migration für historische Fingerprints.
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L5 — Testabdeckung erweitern (M8)

**Ziel:** Über die bestehenden gemockten RPC-Tests hinaus echte Schwellenwert-Logik und False-Positive-Szenarien abdecken.
**Scope:** Neue Tests in `src/lib/casino/__tests__/fraud-detection.test.ts` (Ergänzung, keine neue Datei): Szenario „3 Accounts, exakt an der Schwelle" (Cluster wird erkannt), „2 Accounts" (kein Cluster, Grenzfall knapp darunter), „10+ Accounts über 24h aber aus zwei getrennten 12h-Fenstern" (Window-Boundary-Test). Zusätzlich ein dokumentierter, bewusst nicht automatisierter manueller Testfall für „echtes Haushalts-WLAN" (kann nicht sinnvoll unit-getestet werden, da es kein Code-Verhalten, sondern ein reales Netzwerk-Szenario ist) — als Kommentar im Testfile vermerkt, kein Fehlschlag.
**Abhängigkeiten:** L0–L3 (testet auch deren neue Guards).
**Freigabe-Gate:** Alle neuen Tests grün.
**Verifizierung:** `npx vitest run src/lib/casino/__tests__/fraud-detection.test.ts` — alle grün, keine Regression an bestehenden Tests.
**Nicht-Scope:** Kein Load-/Perf-Test der RPC gegen eine große Datenmenge.
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L6 — Risk-Events-Retention-Policy (M9)

**Ziel:** `risk_events` wächst nicht unbegrenzt.
**Scope:** Neue `pg_cron`-Funktion `purge_closed_risk_events()` (Migration `065`, gleiches Muster wie `purge_bet_network_fingerprints()` aus `030_fraud_signal_detection.sql:288-295`) — löscht Zeilen mit `status IN ('closed','suppressed')` und `last_seen_at < now() - interval '90 days'`. **90 Tage statt 30** (länger als der Fingerprint-Purge), weil `risk_events` Audit-/Nachweis-Wert für Admin-Entscheidungen hat und nicht so kurzlebig sein sollte wie ein reiner Korrelations-Schlüssel.
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** `@migration-security-guard` PASS.
**Verifizierung:** Test-Transaktion (ROLLBACK) bestätigt: `closed`/`suppressed` älter als 90 Tage werden gelöscht, `open` bleibt unabhängig vom Alter erhalten.
**Nicht-Scope:** Keine Änderung an der 30-Tage-Fingerprint-Purge selbst.
**Money-Pfad:** Nein · **Security-Review:** Pflicht (Migration).

### L7 — Testabdeckung + Doku-Nachzug (Abschluss)

**Ziel:** Vollständiger Regressionsnachweis, Kategorie-06-Datei aktualisiert.
**Scope:** Vollständiger `npm test`-Lauf (alle Dateien, nicht nur die neuen), `npm run typecheck`, `npm run lint`. Danach: `06_rate_limiting_abuse_prevention.md` Unterkategorie #10 aktualisieren (Niveau-Neubewertung, Status in der Kompaktübersicht-Tabelle von „Execution-Ready" auf „Executed" bei Abschluss), `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md` Zeile #10 nachziehen.
**Abhängigkeiten:** L0–L6.
**Freigabe-Gate:** Vollsuite grün, 0 TS-/Lint-Fehler.
**Verifizierung:** Testlauf-Zahlen im Ausführungsprotokoll dieser Datei dokumentieren (analog zu `06_1`/`06_2`).
**Nicht-Scope:** Kein Rückwirkungs-Fix des projektweiten Coverage-Gate-Gaps (bereits in `06_1` L7 als bestehender Fund vermerkt).
**Money-Pfad:** Nein · **Security-Review:** Nein.

## 5 — Selbstprüfung (durchgeführt 2026-09-04)

- ✅ Scope gegenüber `06_1`, `06_2` und Unterkategorie #5 abgegrenzt (Abschnitt 3).
- ✅ Jeder Meilenstein hat Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung/Nicht-Scope/Money-Pfad/Security-Review.
- ✅ Alle Zuständigkeiten = LLM, kein Meilenstein blockiert auf eine Jan-Zwischenentscheidung während der Ausführung.
- ✅ Migrationsnummern-Kollisionsrisiko explizit benannt (Abschnitt 0 — Prüfbefehl vor Ausführung).
- ✅ Bewusste Trennung von `user_wellbeing_limits` (06_2) und der neuen `account_status`-Spalte (L2) explizit begründet, um eine Zweckvermischung zu verhindern, die eine fremde Session sonst versehentlich machen könnte.
- ⚠️ **Nachträglich gefunden beim Selbst-Review:** L1 (Realtime-Cluster-Check) und L2 (Account einfrieren) berühren beide dieselben vier Money-Routen-Guards — sollten in derselben Ausführungssession bearbeitet werden (in Abschnitt L2 „Abhängigkeiten" bereits vermerkt).
- ⚠️ **Nachträglich gefunden:** Ob L1 bei Cluster-Erkennung **hart blocken** oder nur **signalisieren** soll, ist keine rein technische Entscheidung — als offene Frage Q1 unten an Jan zurückgegeben, nicht selbst entschieden (konsistent mit dem in `06_1`/`06_2` etablierten Muster, echte Scope-Entscheidungen nicht LLM-seitig vorwegzunehmen).
- ✅ Kein Punkt doppelt als SOP/Kontextreferenz/Plan gepflegt.

## 6 — Offene Fragen für Jan (je 3 Antwortoptionen)

**Q1 — Soll der Realtime-Cluster-Check vor Bonus-Vergabe (L1) hart blocken oder nur signalisieren?**

- (a) Nur signalisieren (fail-open, Bonus wird trotzdem gewährt, Admin sieht sofortiges Signal statt erst beim nächsten Scan) — konsistent mit dem `06_1`-Präzedenzfall (Signup-Honeypot ist ebenfalls fail-open). _(Empfehlung)_
- (b) Hart blocken (Bonus wird bei erkanntem Cluster verweigert) — stärkerer Schutz, aber höheres False-Positive-Risiko (M6 ist noch nicht vollständig gelöst, siehe L3).
- (c) Blocken nur ab einem höheren Schwellenwert (z. B. severity=high, ≥10 statt ≥3 Accounts) — Kompromiss zwischen Schutzwirkung und False-Positive-Risiko.

**Q2 — Soll Device-/Browser-Fingerprinting (M5) als zusätzliches Signal ergänzt werden?**

- (a) Nein, IP-Clustering reicht für den aktuellen Bedrohungsgrad dieses Play-Money-Casinos aus — kein neuer Meilenstein. _(Empfehlung — YAGNI, kein echtes Geld im Spiel, siehe `06_2` Kontext-Fakt)_
- (b) Ja, aber datenschutzfreundlich (z. B. Canvas-freie, aggregierte Signale ohne externe Bibliothek) — neuer, eigener Folgeplan nötig.
- (c) Ja, mit einer etablierten Bibliothek (z. B. FingerprintJS Open Source) — höherer Aufwand, neue Dependency, eigener Folgeplan nötig.

**Q3 — Soll L2 (Account einfrieren) auch rückwirkend auf bereits bestehende, in `risk_events` als `open` markierte Multi-Account-Cluster angewendet werden?**

- (a) Nein, nur für künftig neu erkannte Fälle — bestehende offene Events bleiben zur manuellen Einzelfallprüfung durch Jan. _(Empfehlung — kein automatisches Massen-Einfrieren ohne Einzelfallprüfung)_
- (b) Ja, alle aktuell `open` markierten Cluster automatisch einfrieren, sobald L2 live ist.
- (c) Nein, aber ein Admin-Dashboard-Hinweis „N offene Cluster könnten jetzt eingefroren werden" als manueller Trigger.

## 7 — Verwandte Artefakte

| Bedarf                                                                                    | Datei                                                                                                                   |
| :---------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| Vollständige Kategorie-06-Aufschlüsselung (Ursprung dieses Plans)                         | [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md)                                          |
| Kompakte Kategorie-Overview                                                               | [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md)                 |
| Ausgeführter Schwester-Plan Bot-Detection (Signup-Guard-Muster für L0)                    | [`docs/archive/06_1_bot_automation_detection_plan.md`](../docs/archive/06_1_bot_automation_detection_plan.md)           |
| Ausgeführter Schwester-Plan Responsible Gambling (Guard-Muster für L2, NICHT die Tabelle) | [`docs/archive/06_2_responsible_gambling_controls_plan.md`](../docs/archive/06_2_responsible_gambling_controls_plan.md) |
| Vorherige Anti-Fraud-Analyse (R11/R22 False-Positive-Risikoregister)                      | [`docs/archive/05_2.8_Anti_Fraud.md`](../docs/archive/05_2.8_Anti_Fraud.md)                                             |
| Secret-Rotation-SOP (für L4)                                                              | [`xx_sop/14_secret_rotation.md`](../xx_sop/14_secret_rotation.md)                                                       |
| SOP Planungsdateien (Format dieses Plans)                                                 | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                             |
| SOP Execution (nächster Schritt nach Freigabe)                                            | [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)                                         |

## 8 — Ausführungsprotokoll (2026-09-08)

**Freigabe:** Jans /goal-Freigabe vom 2026-09-08 — vollumfängliche, sequenzielle Ausführung aller Rate-Limiting-Pläne mit den LLM-Empfehlungen für die offenen Fragen. **Q1 = (a)** (fail-open Signal statt hartem Block), **Q2 = (a)** (kein Device-Fingerprinting, IP-Clustering reicht), **Q3 = (a)** (kein rückwirkendes Einfrieren bestehender offener Cluster). Cloud-Isolation: keine Probe, kein Test, kein Push gegen das Cloud-Projekt — alle Verifikation lokal; Migrationen 067–069 liegen nur als Dateien vor, `supabase db push` wartet auf Jans explizite Freigabe (SOP 05).

**Migrations-Renumbering (deviiert von Plan):** Plan-Text nannte 064/065 (+006 als dritte) — veraltet. Re-Check vor Ausführung ergab höchste Migration `066`; die neuen Migrationen heißen **067_user_account_status.sql** (L2), **068_risk_event_suppressed_status.sql** (L3) und **069_risk_event_retention_purge.sql** (L6). Der eigene Re-Check-Auftrag des Plans (Abschnitt 0) deckt diese Abweichung.

**L0 (M2):** Neue Route `POST /api/auth/signup-fingerprint` (fail-offener Empfänger analog `signup-suspicion`: Origin-Check, IP-Rate-Limit 10/60s fail-closed, Session-attributiert) + Client-Fire-and-Forget `reportSignupNetworkFingerprint()` in `signup-guard.ts`, abgesetzt aus `AuthForm` nach dem Suspicion-Report. Kein client-seitiger `userId` akzeptiert — Attribution ausschließlich serverseitig über die Session (verhindert Third-Party-Fingerprint-Forging). Redeem-Seite: `after()`-Callback in `/api/casino/redeem-code` (deferred, blockiert die Einlösung nicht). Proxy: `PUBLIC_ROUTES`-Eintrag ergänzt.

**L1 (M4):** `checkKnownClusterBeforeGrant(userId)` in `fraud-detection.ts` — ruft `detect_multi_account_clusters`, recorded bei Treffer ein High-Severity-Risk-Event (`pre_grant_cluster_detected`, gleiche Fingerprint-Form wie der Scan, damit L3-Unterdrückung greift) und liefert `{ detected, clusterSize }` ohne je zu blocken (Q1a). **Dokumentierte Interpretations-Abweichung:** Der Plan lautete wörtlich „aufgerufen VOR `wallet.ts:74-80` (Startguthaben)"; `getWallet()` ist jedoch ein Hot Path (Provisionierung bei jedem Wallet-Read). Der Check läuft deshalb in der neuen Signup-Fingerprint-Route (läuft nach Signup, vor der ersten Wallet-Provisionierung) und im Redeem-Route — funktional äquivalent (vor jeder Bonus-/Guthaben-Vergabe), ohne den Hot Path zu belasten.

**L2 (M3):** Migration 067 (`users.account_status` TEXT NOT NULL DEFAULT 'active', CHECK-Swap NOT VALID/VALIDATE, bewusst getrennt von `user_wellbeing_limits`/063), Admin-Route `PATCH /api/admin/users/[id]/status` (Origin, Admin-Email-Allowlist fail-closed, Rate-Limit 10/60, UUID-Validierung, Zod-Enum active|frozen, Reason 1–500), Guard-Erweiterung in `checkWellbeingGuard` (frozen → `account-frozen` → 403 `ACCOUNT_FROZEN` auf allen Money-Routen; PGRST204/205-Rollout-Toleranz, sonst fail-closed 503) inkl. 403-Kontrakt für `GET /api/user/self-exclusion`. Rollout-Abhängigkeit: Migration 067 muss gepusht sein, bevor das Einfrieren wirkt (bis dahin liest die Guard-Toleranz „active"). Keine rückwirkende Aktion auf bestehende offene Cluster (Q3a).

**L3 (M6):** Migration 068 (`risk_events.status` um `suppressed` erweitert — von jedem Status erreichbar; `review_risk_event` neu mit Allowlist-Update), `/api/admin/fraud` akzeptiert `suppressed` in Liste + Review, FraudPageClient mit Filter + „Unterdrücken"-Aktion (Rollen für Haushalts-/Büro-Fehlalarme). Scan-Skip in `runFraudSignalScan` über `getSuppressedMultiAccountFingerprints` — **fingerprint-exakt** (ändert sich die Cluster-Zusammensetzung, entsteht ein neuer Fingerprint und wird legitim wieder gemeldet). Fail-open bei Lookup-Fehlern.

**L4 (M7):** `FRAUD_FINGERPRINT_SECRET` erstmals im Rotations-Log (`xx_docs/13_secret_rotation_log.md`) dokumentiert: Ersteinrichtung 2026-08-16 (Commit ee64643), Intervall 365 Tage. Kein Code-Change nötig.

**L5 (M8):** Testsuite erweitert in `fraud-detection.test.ts` (RPC-Argument-Verdrahtung inkl. Hinweis, dass die Fenster-Grenze SQL-seitig erzwungen wird + manueller Haushalts-WLAN-Testfall; Severity-Bänder 3/4/5/9/10; 3 × `checkKnownClusterBeforeGrant`; 2 × Suppression-Skip mit scan-identischen UTC-Day-Fingerprints), `responsible-gambling.test.ts` (4 × frozen-Pfad inkl. Rollout-Toleranz), neue `signup-fingerprint-route.test.ts` (10 Kontrakte), Erweiterungen in `signup-report.test.ts`, `redeem-code-route.test.ts` (after-Callback) und `form-error-route-contracts.test.ts` (partial-mock mit `importOriginal`, da `bet-velocity-guard` die echten Konstanten importiert). Meta-Test-Pins aktualisiert: Routen 57→59 gesamt, instrumentiert 42→44; Migrationshistorie 66→69.

**L6 (M9):** Migration 069: `purge_closed_risk_events()` (SECURITY DEFINER, löscht closed/suppressed älter 90 Tage nach `last_seen_at`) + Vault-gesichertes Alert-Wrapper-Muster aus 027/030, Cron `risk-event-purge-daily` um 03:53 UTC (kollisionsfrei zu 03:17/03:41).

**L7 (Abschluss) — DoD-Zahlen (2026-09-08, alle lokal):**

- `npm run test` (CI=true): **218 Dateien / 1690 Tests, alle grün** (vor 06_3: 1647 Tests → +43).
- `npm run typecheck`: **0 Fehler**.
- `npm run lint`: **0 Fehler** (30 bekannte Alt-Warnings, unverändert, keine in 06_3-Dateien).
- `npm run build`: **Exit 0** (Next.js 16.3 Turbopack, 58 statische Seiten).
- `test:coverage`: Die beiden 06_3-Module erfüllen ihre Schwellen (fraud-detection branches 73,91 % > 64; responsible-gambling branches 92 % > 88). Die drei bekannten Vorbstand-Fehler (`sentry-scrub.ts` 75 % functions, `useCasinoStore.ts` 57,1 % functions, `wallet.ts` 36,9 % branches) sind unverändert und bereits in `06_4` §8 als außerhalb des Scopes dokumentiert (CI-Step bleibt non-blocking, Q2a).
- **`@migration-security-guard`: PASS** (read-only, 2026-09-08) — search_path gehärtet, service_role-only, RLS unangetastet, CHECK-Swap ohne Writer-Lockout, Cron-Offset kollisionsfrei.
- **`security-reviewer`: kein CRITICAL/HIGH** (2026-09-08) — Fail-Open/Fail-Closed-Trennung korrekt, Attribution session-only, keine Injektionsfläche, CSRF/Origin doppelschichtig.

**Akzeptierte Follow-ups (aus dem Security-Review, außerhalb des Plan-Scopes, nicht behoben):**

1. **MEDIUM — Freeze-Audit nur im Log:** Der Admin-Grund (Reason) geht nur an `CasinoLogger.info`, kein durabler `risk_events`-Eintrag. Ein risk-event-basierter Audit würde eine neue Signal-Type-CHECK-Migration erfordern (semantisch sauber nicht über `balance_correction` abbildbar) — eigener Mini-Folgeschritt.
2. **MEDIUM — Sync-Cluster-Scan pro Redeem/Signup:** `checkKnownClusterBeforeGrant` zahlt bei jeder Einlösung einen vollständigen RPC-Scan; bei Skalierung caching/staging prüfen (aktuell durch das Redeem-Rate-Limit begrenzt).
3. **LOW — Signup-Fingerprint ohne Retry:** Wenn die frische Session serverseitig noch nicht sichtbar ist, bleibt der Fingerprint für diesen Signup unbelegt (Observability-Gap, kein Sicherheitsrisiko).

**Doku-Nachzug:** `06_rate_limiting_abuse_prevention.md` #10 (Niveau-Neubewertung), `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`, `T_RATE_LIMITING_ABUSE_PREVENTION/00_...UEBERSICHT.md`, `xx_docs/08_api_backend_context.md`, `docs/observability/05_ratelimit_failclosed_alerting.md`, `xx_docs/13_secret_rotation_log.md`. Plan nach Abschluss nach `docs/archive/` verschoben.
