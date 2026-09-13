# 05 — Disaster Recovery & Backup

> **Status:** N1–N6 ausgeführt (2026-09-13, siehe §9) · N7 = K4-Jan-Gate offen · **Stand:** 2026-09-13 · **Owner:** LLM (Jan nur bei N7/Aktivierung) · **Scope:** Vollständiger, **redundanter** Recovery-Zyklus (Export → 2 unabhängige Ziele → Restore-Drill → Integritäts-Dauerverifikation → Staleness-Alerting → Config-Inventar) für die Supabase-Produktdaten des Casino-Projekts `hmqwozhdckbwjqzcmire`. Kein Produktiv-Restore, kein Tarifwechsel ohne Jan-Freigabe.

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

Diese Datei ist eigenständig ausführbar. Du brauchst keinen weiteren Chat-Verlauf.

1. Lies Abschnitt 1 (Warum diese Neufassung existiert) und Abschnitt 2 (bereits vorhandener Code, Referenz) vollständig.
2. Alle Meilensteine **N1–N6 sind vollständig ohne Jan ausführbar** — nicht auf eine Rückfrage warten. Nur **N7** braucht echte Jan-Handlung (externes Konto/Zahlungsmittel/Zugangsdaten).
3. Bearbeitungsreihenfolge: N1 unabhängig zuerst (senkt Jans Aktivierungsaufwand sofort). N2–N5 können parallel/durch verschiedene Subagenten bearbeitet werden (siehe Abhängigkeiten in Abschnitt 5). N6 nach N2. N7 erst nach N1–N6.
4. Bei Widerspruch zwischen dieser Datei und dem tatsächlichen Code: der Code gewinnt. Diese Datei dann korrigieren, nicht den Code an die Doku anpassen.
5. Nach Abschluss aller Meilensteine: Ampel-Update in `00_DATABASE_VERBESSERUNG.md` gemäß der dortigen Anweisung (Abschnitt 8 dieser Datei verlinkt dorthin).

---

## 1 — Warum diese Neufassung existiert (Jan-Kontext)

Die Vorversion dieser Datei war L0–L9 vollständig ausgeführt und verifiziert (grüner CI-Lauf, 9 Vitest-Tests, funktionierender Restore-Drill). Trotzdem blieb das reale Niveau bei **Top 88 %** — der grüne Execution-Status hat das nicht sichtbar gemacht. Der Grund: L0–L9 bauen die **Mechanik**, aber der Wert einer Disaster-Recovery-Fähigkeit entsteht erst durch eine **echte, unabhängige Kopie außerhalb von Supabase** — und die gab es (und gibt es bis heute) nicht, weil sie an Jan-exklusiven Schritten hängt (Konto, Zahlungsmittel, Zugangsdaten).

Diese Neufassung löst zwei Probleme gleichzeitig:

1. **Sie senkt Jans Aktivierungsschwelle auf ein einziges, kurzes Runbook** (N1) statt drei verteilter Jan-Gates (L10/L11/L12 der Vorversion).
2. **Sie baut jetzt schon die Härtung, die bisher erst "nach L11" geplant war** (Redundanz, Integritätsprüfung, Staleness-Alerting, Config-Inventar) — als Code, der bereits gegen lokale/simulierte Artefakte getestet werden kann, ohne auf Jans Secrets zu warten. Damit hängt die Ziel-Reife nicht mehr an einem einzigen Punkt (ein Ziel, ein Export), sondern ist von Anfang an auf 3-2-1-Niveau ausgelegt.

Die **Spalte "Status" der Vorversion wurde entfernt** — bei einer frischen Execution-Ready-Datei ist jeder neue Meilenstein per Definition offen; eine vorausgefüllte Ampel-Spalte hätte hier keinen Informationswert (das war exakt das "übergrün trotz schlechtem Niveau"-Problem, das diese Neufassung auslöste).

---

## 2 — Bereits vorhandener, verifizierter Code (Referenz — nicht neu bauen)

| Datei                                                                              | Rolle                                                                                                                              |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`scripts/backup-supabase.ts`](../scripts/backup-supabase.ts)                      | Orchestrator: `npm run backup:run`                                                                                                 |
| [`scripts/restore-supabase.ts`](../scripts/restore-supabase.ts)                    | Orchestrator Restore (Download/Decrypt/Apply)                                                                                      |
| [`scripts/restore-drill.ts`](../scripts/restore-drill.ts)                          | Ephemerer Docker-Restore-Drill inkl. `validateFinancialInvariants()`                                                               |
| [`src/lib/backup/supabase-dump.ts`](../src/lib/backup/supabase-dump.ts)            | `dumpSupabaseArtifacts()`                                                                                                          |
| [`src/lib/backup/recovery-crypto.ts`](../src/lib/backup/recovery-crypto.ts)        | AES-256-GCM Encrypt/Decrypt, Manifest, SigV4-Signierung (PUT **und** GET)                                                          |
| [`src/lib/backup/backup-runner.ts`](../src/lib/backup/backup-runner.ts)            | `runBackup()` — validiert, verschlüsselt, baut Manifest, lädt hoch                                                                 |
| [`src/lib/backup/s3-client.ts`](../src/lib/backup/s3-client.ts) / `s3-download.ts` | Signierter `PUT`/`GET` gegen ein S3-kompatibles Ziel                                                                               |
| `src/lib/backup/__tests__/*.test.ts` (mehrere Dateien)                             | Grüne Tests: Endpoint-/Key-Validierung, GCM-Tamper-Schutz, Manifest-Hash, SigV4, Safety-Guard gegen Produktions-Connection-Strings |
| [`.github/workflows/backup-drill.yml`](../.github/workflows/backup-drill.yml)      | Wöchentlicher + PR-getriggerter CI-Lauf: Dump → Drill → Live-Invarianten, ohne Secrets                                             |

**Bestätigt weiterhin gültig (vor Nutzung per `grep` gegenprüfen, falls sich der Code seit 2026-09-05 verschoben hat):** Tabelleninventar `users` (Balance-Feld), `wallet_transactions`, `wallet_events`, `wallet_invariant_events`, `wallet_ledger_baselines`, `game_rounds`, `game_sessions`, `crash_rounds`, `seeds`, `seed_history`. Keine Tabellen `wallets`/`transactions`/`bets`. RPO-Ziel `≤ 24 h`, RTO-Ziel `≤ 4 h` (lokal bereits mit großem Puffer erfüllt: voller Zyklus < 50 s).

**Bewusst noch nicht vorhanden (Scope dieser Neufassung):** Multi-Target-Upload (nur 1 Ziel im Code vorgesehen), Staleness-Alerting, automatisierte Integritäts-Nachverifikation nach dem Upload, Auth-/Realtime-Config-Inventar, ein einzelnes konsolidiertes Jan-Runbook.

---

## 3 — Neue Meilensteine (N1–N6, alle LLM-autonom)

### N1 — Jan-Aktivierungspaket: ein Runbook statt drei verteilter Gates

- **Ziel:** Die Vorversion verteilte Jans Aufwand über L10 (Ziel wählen), L11 (Freigabe für den ersten Lauf) und L12 (Tarif-Entscheidung). Das ist unnötige Reibung — alles, was Jan tun muss, passt in ein einziges ~20-Minuten-Runbook.
- **Schritte:**
  1. Neue Datei `docs/database/runbooks/09_backup_jan_aktivierung.md`: nummerierte Checkliste — (a) Provider wählen (Empfehlung: 2 unabhängige S3-kompatible Anbieter mit kostenlosem Einstiegskontingent, z. B. Cloudflare R2 als Primär- und Backblaze B2 als Sekundärziel — bewusst **zwei verschiedene Anbieter**, nicht zwei Buckets beim selben Anbieter, sonst ist ein Anbieter-Ausfall kein abgedecktes Szenario), (b) je Anbieter: Bucket anlegen, Lifecycle-Regel nach der bestehenden Retention-Tabelle (14 täglich/8 wöchentlich/12 monatlich) einfügen, Zugriffsschlüssel nur mit Rechten auf einen Backup-Präfix (Upload/Download/Listing, kein Delete), (c) alle `BACKUP_*`- und die neuen `BACKUP_SECONDARY_*`-Variablen (aus N2) in `.env.local` eintragen (nie committen), (d) `npm run backup:run` einmal manuell ausführen und das Ergebnis gegen die Checkliste in Abschnitt 4 dieser Datei prüfen.
  2. Fertige Lifecycle-Regel-Vorlagen (JSON/Konsolen-Klicks) für beide empfohlenen Provider als Copy-Paste-Block beilegen — Jan soll nichts selbst formulieren müssen.
  3. Kosten-Kurzschätzung (Free-Tier-Grenzen beider Provider, voraussichtliches Datenvolumen basierend auf der aktuellen DB-Größe) ergänzen, damit Jan die Entscheidung ohne Rückfrage treffen kann.
- **Verifizierung:** Ein technisch nicht vorgebildeter Leser kann dem Runbook ohne Rückfrage an das LLM folgen (Selbsttest: jeder Schritt hat ein konkretes Klickziel oder einen Copy-Paste-Block, keine Prosa-Beschreibung ohne Handlung).
- **Freigabe-Gate:** Keines (reine Doku, keine echten Zugangsdaten). **Money-Pfad:** Nein. **Security-Review:** Nein.

### N2 — Multi-Target-Redundanz (3-2-1-Backup-Strategie)

- **Ziel:** Ein einzelnes Backup-Ziel ist ein Single Point of Failure (Anbieter-Ausfall, versehentliches Löschen, Kontosperrung). Weltklasse-DR verlangt mindestens zwei unabhängige Kopien.
- **Schritte:**
  1. `src/lib/backup/backup-runner.ts`: `runBackup()` von einem Einzelziel auf ein `targets: BackupTarget[]`-Array umstellen (Konfiguration aus `BACKUP_S3_*` als `primary` plus optional `BACKUP_SECONDARY_S3_*` als zweites Ziel — fehlt das sekundäre Ziel, läuft der Runner wie bisher mit nur einem Ziel, **kein Breaking Change** für den aktuellen Zustand).
  2. Upload läuft sequenziell gegen jedes konfigurierte Ziel; Manifest bekommt ein `targets`-Feld mit Erfolg/Fehlschlag pro Ziel. **Wichtig:** Ein Fehlschlag am Sekundärziel darf den Erfolg am Primärziel nicht verschlucken (Ergebnis ist "teilweise erfolgreich", nicht stillschweigend "erfolgreich") — im CI/Log klar als Warnung sichtbar machen.
  3. `.env.example` um die `BACKUP_SECONDARY_*`-Variablen ergänzen (gleiches Muster wie die bestehenden `BACKUP_*`, siehe N1 Runbook).
  4. Tests: Runner mit (a) nur Primärziel (bestehendes Verhalten unverändert), (b) beiden Zielen erfolgreich, (c) Sekundärziel schlägt fehl während Primärziel erfolgreich ist (Teilerfolg korrekt gemeldet, kein stiller Fehler).
- **Verifizierung:** `npm test -- src/lib/backup` grün inkl. der 3 neuen Runner-Szenarien; `npm run typecheck` ohne neue Fehler.
- **Freigabe-Gate:** Keines — reiner Code-Aufbau, keine Ausführung gegen echte Ziele. **Money-Pfad:** Nein. **Security-Review:** Pflicht (Credential-Handling für ein zweites Zielsystem — sicherstellen, dass Primär- und Sekundär-Secrets sauber getrennt bleiben und keines im Log des jeweils anderen Ziels auftaucht).

### N3 — Automatisierte Integritäts-Nachverifikation

- **Ziel:** Ein erfolgreicher Upload beweist nicht, dass die Datei später auch wieder lesbar/entschlüsselbar ist. Weltklasse-Backups verifizieren sich selbst.
- **Schritte:**
  1. Neues Skript `scripts/verify-backup-integrity.ts`: lädt das jüngste Manifest + alle referenzierten Artefakte von **jedem** konfigurierten Ziel (N2) herunter, entschlüsselt sie (`decryptArtifact()`, bereits vorhanden), vergleicht den SHA-256-Hash gegen den im Manifest gespeicherten Wert. Kein Restore, keine DB-Mutation — reine Download+Hash-Prüfung.
  2. Ergebnis als JSON (`{ target, artifact, hashMatch, decryptOk }[]`), Exit-Code `1` bei jedem Mismatch.
  3. Kann **schon jetzt gegen ein lokal simuliertes Manifest/Artefakt-Paar getestet werden** (Fixture-Daten, kein echtes S3 nötig) — läuft dann automatisch sinnvoll, sobald N7/Jan ein echtes Ziel aktiviert.
  4. In `.github/workflows/backup-drill.yml` als zusätzlichen Schritt nach dem bestehenden Drill einhängen, aber **nur wenn `BACKUP_S3_*`-Secrets im Runner vorhanden sind** (Guard-Check am Anfang des Schritts, sonst `skip` mit klarer Meldung — kein roter CI-Lauf durch fehlende Secrets vor N7).
- **Verifizierung:** `npx tsx scripts/verify-backup-integrity.ts` läuft gegen Fixture-Daten durch, erkennt einen absichtlich manipulierten Test-Hash korrekt als Mismatch (Negativbeweis, analog zum GCM-Tamper-Test-Muster).
- **Freigabe-Gate:** Keines (read-only Download + Vergleich). **Money-Pfad:** Nein. **Security-Review:** Nein (nutzt ausschließlich bereits vorhandene, bereits reviewte Krypto-/Download-Funktionen).

### N4 — Staleness-Alerting (Regelbetrieb schließt die alte "künftige Erweiterung"-Lücke)

- **Ziel:** Die Vorversion markierte "Regelbetrieb erkennt fehlende Sicherungen" explizit als offen ("erst nach L11 sinnvoll"). Das stimmt für den _Trigger_ (echte Backups), nicht für den _Code_ — der lässt sich jetzt bauen und mit einem simulierten Manifest testen.
- **Schritte:**
  1. Neues Skript `scripts/check-backup-freshness.ts`: liest das jüngste Manifest (lokal oder von N2-Zielen), vergleicht dessen Zeitstempel gegen `RPO ≤ 24 h` (+ 2h Puffer wie in L1 der Vorversion definiert). Bei Überschreitung: Exit-Code `1` und eine strukturierte Fehlermeldung.
  2. GitHub-Actions-Workflow `.github/workflows/backup-freshness-check.yml`: täglicher Cron, ruft das Skript auf. Bei Fehlschlag: `gh issue create` (via `GITHUB_TOKEN`, bereits impliziter CI-Standard-Token, kein neues Secret) mit Titel „Backup überfällig: letzter Erfolg vor >26h" — kein externer Alerting-Dienst nötig, GitHub Issues genügt als erster Regelbetrieb-Baustein.
  3. Guard analog N3: Ohne konfigurierte `BACKUP_*`-Secrets meldet der Workflow informativ "noch nicht aktiv" statt rot zu laufen.
- **Verifizierung:** Skript gegen ein absichtlich altes Fixture-Manifest (>26h) getestet, erkennt die Überschreitung korrekt; gegen ein frisches Fixture-Manifest bleibt es grün.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### N5 — Auth-/Realtime-/Extension-Konfigurationsinventar

- **Ziel:** Schließt Punkt 5 der alten Definition of Done ("Auth-/Realtime-/Extension-/Secret-Konfigurationen als Recovery-Inventar dokumentiert — weiterhin offen"). `supabase db dump` sichert `auth`-Konfiguration nicht — ohne dieses Inventar wäre ein Restore unvollständig, selbst wenn N1–N4 perfekt funktionieren.
- **Schritte:**
  1. Prüfen, ob `SUPABASE_ACCESS_TOKEN` (bereits für Säule-7-Query-Performance-CI von Jan hinterlegt, siehe `T_DATABASE/11_database_query_performance_indexing.md` L7) für read-only Management-API-Aufrufe gegen Auth-/Project-Settings ausreicht — falls ja, kein neues Secret nötig.
  2. Neues Skript `scripts/export-project-config-inventory.ts`: ruft die Supabase Management API (read-only Endpunkte für Auth-Provider-Konfiguration, aktivierte Extensions, Realtime-Settings) ab, schreibt ein secretfreies JSON-Inventar nach `docs/database/config-inventory/<YYYY-MM-DD>.json` (kein API-Key, kein OAuth-Secret im Output — nur Provider-Namen, aktivierte Flags, Extension-Liste).
  3. Quartalsweise im selben Cron wie der Query-Performance-Audit (Säule 7 L7) mitlaufen lassen — kein zweiter Workflow nötig, ein zusätzlicher Step im bestehenden.
- **Verifizierung:** Manueller Lauf erzeugt ein JSON ohne Treffer für `grep -i "key\|secret\|token"` im Output (automatisierter Selbstcheck im Skript: bricht mit Fehler ab, falls ein Feld einem Secret-ähnlichen Muster entspricht, bevor die Datei geschrieben wird).
- **Freigabe-Gate:** Keines (read-only, gleiche Rechteklasse wie der bestehende Säule-7-CI-Token). **Money-Pfad:** Nein. **Security-Review:** Pflicht (verifizieren, dass wirklich keine Secret-Werte im Export landen, bevor die Datei committet wird).

### N6 — Restore-Drill auf Multi-Target erweitern

- **Ziel:** N2 wäre wertlos, wenn nie geprüft wird, dass ein Restore auch **vom Sekundärziel** funktioniert, nicht nur vom Primärziel.
- **Schritte:** `scripts/restore-drill.ts` um einen Parameter `--target=primary|secondary` erweitern; CI-Workflow (`backup-drill.yml`) führt den Drill nach N7/Aktivierung gegen **beide** Ziele abwechselnd aus (z. B. wochenweise alternierend, um Laufzeit nicht zu verdoppeln).
- **Verifizierung:** Lokaler Drill-Lauf mit beiden `--target`-Werten gegen Fixture-Daten erfolgreich.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein (nur lokale Testdaten). **Security-Review:** Nein (Wiederverwendung bereits reviewter L6/L7-Logik der Vorversion, siehe Abschnitt 2).

---

## 4 — Jan-Gate (einziges verbleibendes)

### N7 — Aktivierung: erster echter Multi-Target-Lauf + PITR-Entscheidung

- **Ablauf:** Jan folgt dem N1-Runbook (beide Provider-Konten/Buckets). Danach führt das LLM `npm run backup:run` einmal aus (echter Upload an **beide** Ziele), dann `scripts/verify-backup-integrity.ts` (N3) und `scripts/restore-drill.ts --target=primary` **und** `--target=secondary` (N6) — Beweis, dass beide Kopien unabhängig voneinander vollständig funktionieren.
- **PITR-Tarif-Entscheidung** (nachrangig, wie in der Vorversion): erst relevant, wenn `RPO ≤ 24 h` nicht mehr genügt oder Umsatz-/Nutzerschwellen erreicht sind (siehe `docs/database/09_backup_disaster_recovery.md` Abschnitt 4). Keine Aktion vor Abschluss von N1–N6.
- **Freigabe-Gate:** K4 (explizite Jan-Bestätigung vor dem ersten echten Upload/Export, analog zur bestehenden K-Level-Matrix). **Money-Pfad:** Ja (echte Produktdaten verlassen erstmals das Supabase-Projekt, gegen **zwei** externe Anbieter). **Security-Review:** Pflicht.

---

## 5 — Definition of Done & Abhängigkeiten

1. N1 (Runbook) unabhängig zuerst — reduziert Jans späteren Aufwand auf einen Termin statt drei.
2. N2 (Multi-Target-Code) vor N6 (Multi-Target-Drill) und vor N7 (Aktivierung) — kann parallel zu N3/N4/N5 laufen (unabhängige Skripte, verschiedene Dateien, geeignet für getrennte Subagenten).
3. N3, N4, N5 sind voneinander unabhängig, alle vor N7 sinnvoll abgeschlossen (sie sollen ab dem ersten echten Lauf sofort wirksam sein, nicht erst nachträglich ergänzt werden).
4. N6 nach N2.
5. N7 erst nach N1–N6 vollständig — die Aktivierung soll die **letzte**, nicht die erste Handlung sein, damit Jan nur einmal aktiv wird und danach alles (Redundanz, Integritätscheck, Alerting, Inventar) sofort läuft.
6. **Erst wenn N7 abgeschlossen ist**, gilt Säule 9 als voraussichtlich Top 15–20 % (statt der alten Zielmarke Top 50 % nach einfachem L11) — Redundanz, Selbstverifikation, Staleness-Alerting und Config-Inventar heben die Zielmarke gegenüber der Vorversion an.

---

## 6 — Selbstprüfung vor `Execution-Ready` (nach `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- [x] Scope gegenüber `T_DATABASE/10_database_testschicht_pgtap.md` abgegrenzt: diese Datei nutzt bestehende Finanz-/RLS-Tests nur zur Drill-Verifikation, baut keine neue Testinfrastruktur.
- [x] Abhängigkeiten explizit benannt (Abschnitt 5), parallelisierbar markiert für Subagenten-Einsatz.
- [x] Jede neue Schreiboperation (Multi-Target-Upload, GitHub-Issue-Erstellung) hat einen Fail-closed-Pfad statt stillem Teilerfolg (siehe N2 Schritt 2, N4 Schritt 3).
- [x] Kein Secret-Leak-Risiko unreviewt: N5 hat einen expliziten Selbstcheck gegen Secret-Muster vor dem Schreiben der Ausgabedatei.
- [x] Eine neue LLM-Konversation kann diese Datei allein verstehen: Abschnitt 0 + 1 + 2 liefern den kompletten Einstiegskontext ohne Chat-Historie.
- [x] **Kritischer Selbstcheck:** N2s Multi-Target-Umbau könnte bestehendes Single-Target-Verhalten brechen — deshalb explizit als Erweiterung (Array mit Default-Länge 1) statt als Breaking Change spezifiziert, mit Regressionstest für den unveränderten Einzelziel-Fall.

---

## 7 — Verwandte Artefakte

| Bedarf                                            | Datei                                                                                                                                                                                                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kanonischer Doku-Standard (Säule 9)               | [`docs/database/09_backup_disaster_recovery.md`](../docs/database/09_backup_disaster_recovery.md)                                                                                                                                                    |
| Neues Jan-Runbook (N1)                            | `docs/database/runbooks/09_backup_jan_aktivierung.md` (wird in N1 angelegt)                                                                                                                                                                          |
| Finanz-/Security-Regressionstests (Drill-Nutzung) | [`src/lib/casino/__tests__/wallet-ledger-invariants.test.ts`](../src/lib/casino/__tests__/wallet-ledger-invariants.test.ts), [`src/lib/security/__tests__/rls-defense-in-depth.test.ts`](../src/lib/security/__tests__/rls-defense-in-depth.test.ts) |
| Supabase-Betriebs-SOP                             | [`xx_sop/05_database_supabase.md`](../xx_sop/05_database_supabase.md)                                                                                                                                                                                |
| Finanz-/Sicherheitsnachweis-Pflichten             | [`xx_sop/09_security_wallet_invariants.md`](../xx_sop/09_security_wallet_invariants.md)                                                                                                                                                              |
| Gewichtete Subkategorien-Bewertung                | [`00_DATABASE_VERBESSERUNG.md`](./00_DATABASE_VERBESSERUNG.md)                                                                                                                                                                                       |
| Übergeordnete Aufschlüsselung (Kategorie 02)      | [`T_DATABASE/04_datenbank_migrationen.md`](../T_DATABASE/04_datenbank_migrationen.md)                                                                                                                                                                |
| Planungsdateien-Konvention                        | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                                                                                                                                                          |

---

## 9 — Ausführungsergebnis (2026-09-13)

**Branch:** `database-backup` (Worktree `.claude/worktrees/db-backup`) · **Commits:** `828424a` (N1+N2+N5+N6), `b2ec794` (N3+N4) · **Status:** N1–N6 fertig, N7 = Jan-Gate offen.

### 9.1 Meilensteine

| MS                                                   | Ergebnis                        | Artefakte                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| N1 Runbook                                           | ✅                              | `docs/database/runbooks/09_backup_jan_aktivierung.md` — R2- + B2-Setup, Key-Generierung, `.env.local`-Block, erster Lauf + Checkliste, Teilerfolg-Verhalten, Kosten (beide Free-Tier 0 USD)                                                                                                                  |
| N2 Multi-Target                                      | ✅                              | `src/lib/backup/targets.ts` (neu), `recovery-crypto.ts` (Config-Reader gesplittet), `backup-runner.ts` (sequenzielle Uploads pro Ziel, Teilerfolg ≠ stiller Erfolg, all-fail = throw), `backup-supabase.ts` (`backup-partial`/`backup-partial-targets`-Meldungen), `.env.example` (BACKUP_SECONDARY_*-Block) |
| N3 Integritäts-Verifikation                          | ✅                              | `src/lib/backup/integrity-check.ts` (neu), `scripts/verify-backup-integrity.ts` (neu), Integritäts-Step in `backup-drill.yml` (Skip-Notice ohne Secrets)                                                                                                                                                     |
| N4 Staleness-Alerting                                | ✅                              | `src/lib/backup/freshness.ts` (neu, 26h-Fenster = 24h RPO + 2h Puffer), `scripts/check-backup-freshness.ts` (heute→gestern-Manifest-Probing), `backup-freshness-check.yml` (täglich 04:37 UTC, deduped GitHub Issue, `issues: write`)                                                                        |
| N5 Config-Inventar                                   | ✅ (Code) / ⏳ Echtlauf pending | `src/lib/backup/config-inventory.ts` (neu, Safe-Set-Filter + fail-closed `assertInventoryHasNoSecrets`), `scripts/export-project-config-inventory.ts` (neu), Step in `query-performance-audit.yml` — echter Management-API-Lauf braucht `SUPABASE_ACCESS_TOKEN` von Jan                                      |
| N6 Multi-Target-Restore-Drill                        | ✅                              | `src/lib/backup/restore-target.ts` (neu, Hash-Prüfung fail-closed vor Restore), `scripts/restore-drill.ts` erweitert um `--target=primary\|secondary`                                                                                                                                                        |
| N7 (R2/B2-Konten, echte Uploads, Restore-Drill live) | ⏳ **Jan-Gate**                 | Runbook N1 ist die Schritt-für-Schritt-Anleitung                                                                                                                                                                                                                                                             |

### 9.2 Verifikation (5-Stufen, im Worktree)

| Stufe                | Ergebnis                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`  | ✅ 0 Fehler                                                                                                                                           |
| `npm test`           | ✅ **228 Dateien / 1725 Tests** (Baseline 1703) — 22 neue Tests: 5 multi-target, 5 integrity-check, 5 freshness, 5 config-inventory, 2 restore-target |
| `npm run lint`       | ✅ 0 Errors / 37 Warnings (Baseline 36; +1 dokumentiert unten)                                                                                        |
| `npm run build`      | ✅ grün                                                                                                                                               |
| `git status --short` | ✅ sauber (vor §9-Anhang)                                                                                                                             |

### 9.3 Security-Reviews (Pflicht-Posten)

- **N2 (Credential-Trennung):** Selbstreview im Money-Nachbarpfad — Encryption-Key wird bewusst über beide Ziele geteilt (ein Key-Verlust = Kompromittierung beider Ziele ist akzeptiert, weil beide Ziele dieselben Dump-Daten tragen; Credentials sind getrennt, damit ein Provider-Kompromiss nicht beide Speicherort-Zugriffe öffnet). Upload-Callback erhält `target` + `config` je Ziel; Test `backup-runner.multi-target.test.ts` verifiziert per-target Endpoint-Hosts. Kein Secret im Code/Manifest; Manifest enthält nur Ciphertext-Hash + IV + Auth-Tag.
- **N5 (Secret-Selbstcheck):** `assertInventoryHasNoSecrets` läuft **vor jedem Datei-Write**; Key-Pattern `(secret|token|password|credential|api_key|apikey|dsn|private_key)` (bewusst ohne bare `jwt`/`private` — `jwt_expiry` wäre false-positive; `jwt_secret` bleibt über `secret` abgedeckt), Value-Pattern Base64-artig ≥64 Zeichen, rekursiver Tree-Walk inkl. Arrays. Fail-closed: Abbruch statt Teil-Write. Tests verifizieren Key-Abort, Long-Value-Abort und Safe-Pass.
- **migration-security-guard:** nicht anwendbar — keine Dateien unter `supabase/migrations/**` verändert.

### 9.4 Abweichungen vom Plan (ehrlich dokumentiert)

1. **Retention:** GFS 14/8/12-Tiers sind mit dem datumsbasierten Single-Prefix-Runner per Lifecycle-Regel nicht ausdrückbar → **Superset-Regel „30 Tage"** umgesetzt (deckt 14-täglich + kanonische „30 Tage Retention" ab); Wochen-/Monats-Präfixe als künftige Runner-Erweiterung im Runbook vermerkt.
2. **Commit-Labeling:** Der nachgeholte Commit `828424a` (Message „N1+N2") enthält via `git add -A` auch die N5+N6-Dateien, weil der ursprüngliche N5+N6-Commit zweimal am Tool-Ausfall scheiterte und die Dateien bereits im Working Tree lagen. Inhaltlich vollständig committed; Messages nicht rückwirkend umgeschrieben (Branch ist lokal, aber History-Korrektheit war dem Label-Match nicht wert).
3. **csp-nonce-Timeout:** File-Scan-Test erhielt per-Test-Timeout 20s (`it(name, { timeout: 20_000 }, fn)`) — load-bedingt flaky im Suite-Parallellauf (isoliert ~1,1s). Infra-Fix, keine Logikänderung.
4. **N5-Echtlauf pending:** Management-API-Export läuft erst mit Jans `SUPABASE_ACCESS_TOKEN` — als K5-Rest unten nummeriert.
5. **Kein Listing-Primitive:** S3-Client hat kein ListObjectsV2 → Integritäts-/Freshness-Check adressieren Manifeste über `--date` bzw. heute→gestern-Probing statt Bucket-Listing.

### 9.5 K5-Reste (Jan-Freigabe nötig)

1. **N7-Aktivierung:** R2-/B2-Accounts anlegen, Secrets in `.env.local`/GitHub setzen, erster echter `npm run backup:run` + Restore-Drill beider Ziele (Runbook: `docs/database/runbooks/09_backup_jan_aktivierung.md`).
2. **N5-Echtlauf:** `SUPABASE_ACCESS_TOKEN` setzen und `npx tsx scripts/export-project-config-inventory.ts` einmalig ausführen (read-only).
3. **Secrets in GitHub:** `BACKUP_*`/`BACKUP_SECONDARY_*` als Repo-Secrets (aktivieren N3-Integritäts-Step, N4-Freshness-Alerting und N5-Export-Step).
