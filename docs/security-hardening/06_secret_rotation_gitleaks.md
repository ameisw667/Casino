# 06 — Secret-Rotation-Prozess & Secret-Scanning (gitleaks)

> **Säule:** 6 von 10 · **Status:** 🟢 CI-Gate live grün (5/5 beobachtete Läufe erfolgreich) · **Stand:** 2026-08-30
> **Dateien:** `xx_sop/14_secret_rotation.md`, `xx_docs/13_secret_rotation_log.md`, `.gitleaks.toml`, `.github/workflows/secret-scan.yml` · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

---

## 1 — High-Level: Zwei getrennte, sich ergänzende Schutzmechanismen

Secret-Sicherheit hat zwei unterschiedliche Zeitpunkte, an denen etwas schiefgehen kann — dieses Projekt deckt beide ab:

1. **Prävention beim Commit:** `gitleaks` scannt jeden Push/PR auf neu eingeführte Secret-Muster (API-Keys, private Schlüssel, Tokens) und blockiert den Merge bei einem Fund.
2. **Reaktion nach Ablauf/Verdacht:** Eine dokumentierte SOP mit Rotationsturnus nach Blast-Radius, damit ein einmal gültiges Secret nicht unbegrenzt lange gültig bleibt, auch ohne konkreten Incident.

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. gitleaks als Hard-Gate (kein continue-on-error) auf jeden Push/PR — ein Fund muss
       den Merge blockieren, nicht nur eine Warnung erzeugen.
[ ] 2. Rotationsturnus nach BLAST-RADIUS klassifizieren, nicht pauschal — ein Service-
       Role-Key (voller DB-Bypass) braucht einen kürzeren Turnus als ein interner
       HMAC-Webhook-Secret.
[ ] 3. Rotation-Log führen (nur Datum + Grund, NIEMALS der Wert) — sonst weiß niemand,
       ob ein Secret überfällig ist, ohne im Anbieter-Dashboard nachzusehen.
```

---

## 3 — Rotationsklassen (`xx_sop/14_secret_rotation.md`)

| Klasse                         |             Turnus              | Beispiel-Secrets                                                                                                                 | Begründung                                                                                         |
| :----------------------------- | :-----------------------------: | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| Kritisch                       |             90 Tage             | `SUPABASE_SERVICE_ROLE_KEY`                                                                                                      | Voller RLS-Bypass — höchster Blast-Radius im Projekt                                               |
| Hoch (Zugriffskontrolle)       | 180 Tage / bei Personaländerung | `SUPABASE_ADMIN_EMAILS`                                                                                                          | Falscher Eintrag = Admin-Zugriff für falsche Person                                                |
| Hoch (externe Schreibrechte)   |            180 Tage             | `UPSTASH_REDIS_REST_TOKEN`, `SENTRY_AUTH_TOKEN`, `TRIGGER_SECRET_KEY`, `OPENAI_API_KEY`, `POSTHOG_PERSONAL_API_KEY`              | Kompromittierung ermöglicht Rate-Limit-Bypass, Source-Map-Zugriff, Job-Injection, Kostenmissbrauch |
| Mittel (interne HMAC/Webhooks) |            365 Tage             | `CRON_ALERT_SECRET`, `WALLET_EVENT_SECRET`, `FRAUD_FINGERPRINT_SECRET`, `GUIDE_TELEMETRY_HMAC_SECRET`, `TELEGRAM_WEBHOOK_SECRET` | Nur intern zwischen eigenen Services, geringerer Blast-Radius                                      |
| Niedrig (öffentlich by design) |           Kein Turnus           | `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SENTRY_DSN`                                                                        | RLS/Consent sind die eigentliche Schutzschicht, nicht Geheimhaltung des Werts                      |

**Sonderfall HMAC-Versionierung:** `GUIDE_TELEMETRY_HMAC_SECRET` hat ein begleitendes `GUIDE_TELEMETRY_HMAC_VERSION` — beide gemeinsam rotieren, damit ältere signierte Datensätze über die Version unterscheidbar bleiben. `POSTHOG_DISTINCT_ID_HMAC_SECRET` hat **noch keine** Versionierung — eine Rotation würde aktuell alle bisherigen `distinctId`-Werte invalidieren (Breaking Change für Analytics-Historie). Bewusst offen gelassene Entscheidung, die vor einer Rotation Jans Abwägung braucht (kein technischer Blocker, eine Produktentscheidung).

**Fälligkeits-Tracking:** `npm run check-secret-rotation` (`scripts/check-secret-rotation-due.ts`) rechnet [`xx_docs/13_secret_rotation_log.md`](../../xx_docs/13_secret_rotation_log.md) gegen die Turnus-Tabelle — informativ (Exit-Code 1 bei Fälligkeit), **kein CI-Blocker**, da die tatsächliche Rotation immer eine K5-Aktion (Jans manueller Dashboard-Eingriff) bleibt.

**Ehrlicher Stand des Logs (2026-08-30):** Noch kein einziger Eintrag seit Einführung — das ist erwartbar (das Log ist erst seit 2026-08-29 in Betrieb), heißt aber auch: `check-secret-rotation` wertet aktuell jedes bekannte Secret als „nie rotiert, sofort prüfen“, absichtlich konservativ statt optimistisch.

---

## 4 — gitleaks-Konfiguration (`.gitleaks.toml`)

```toml
[extend]
useDefault = true  # erweitert die Standard-Regeln, ersetzt sie nicht

[allowlist]
regexes = [
  '''your_[a-z_]+''',                              # .env.example-Platzhalter
  '''0123456789abcdef0123456789abcdef''',           # synthetischer Test-Fixture-Wert
  '''fedcba9876543210fedcba9876543210''',           # synthetischer Test-Fixture-Wert
]
paths = ['''\.env\.example$''']
```

**Wichtige Design-Entscheidung, im Kommentar begründet:** Kein pfadbasiertes Allowlisting ganzer `__tests__`-Verzeichnisse — das würde auch einen versehentlich in einen Test eingefügten _echten_ Secret-Wert verstecken. Die beiden Regexe greifen ausschließlich bei genau diesen zwei bekannten, synthetischen Hex-Strings, unabhängig vom Dateipfad.

Workflow (`secret-scan.yml`): `fetch-depth: 0` beim Checkout ist notwendig — ein flacher Checkout kann den Pre-Push-Parent-Commit nicht auflösen und würde nur einen Teil-Scan durchführen, ohne dass das sichtbar wäre.

---

## 5 — Sicherheits-Grenzen & Ehrliche Einschätzung

- **gitleaks scannt den Commit-Bereich des jeweiligen Push (dank `fetch-depth: 0` bis zum Pre-Push-Parent aufgelöst), nicht die volle Git-Historie seit Projektbeginn.** Ein Secret, das bereits in einem alten Commit _vor_ Einführung dieses Gates liegt, wird dadurch nicht rückwirkend gefunden — dafür wäre ein einmaliger vollständiger Historien-Scan nötig (nicht Teil dieser Härtungsrunde).
- **`POSTHOG_PERSONAL_API_KEY` ist laut Code-Kommentar noch nicht angelegt** (`status: 'skipped'`, inert) — bereits korrekt vorklassifiziert, aber aktuell kein aktives Risiko.
- **CI-Live-Status:** 5 von 5 beobachteten `Secret scan`-Läufen zwischen 17:00 und 17:18 UTC am 2026-08-30 waren grün (`gh run list`) — das aktuell zuverlässigste der vier Security-CI-Gates in diesem Projekt.

---

## 6 — Verwandte Artefakte

| Bedarf                                               | Datei                                                                                       |
| :--------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| Vollständige Secrets-Übersicht (projektübergreifend) | [`_Brain/50_Library/Secrets-Reference.md`](../../../_Brain/50_Library/Secrets-Reference.md) |
| Incident-Response bei vermutetem Leck                | [`xx_sop/14_secret_rotation.md`](../../xx_sop/14_secret_rotation.md) Abschnitt 5            |
| Rotation-Fälligkeits-Log                             | [`xx_docs/13_secret_rotation_log.md`](../../xx_docs/13_secret_rotation_log.md)              |
