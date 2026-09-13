# Runbook — Backup-Aktivierung (Säule 9 N1/N7)

> **Status:** Verifiziert (Code-Stand N1–N6, 2026-09-13) · **Zielgruppe:** Jan · **Dauer:** ~20 Minuten ·
> **Ergebnis:** Zwei unabhängige Offsite-Backup-Ziele (R2 primär, B2 sekundär) sind aktiviert, erster echter
> Multi-Target-Lauf (N7, K4-Freigabe) ist durchgeführt.
> **Vorher nötig:** N2 (Multi-Target-Runner) ist im Code enthalten — dieser Runbook-Stand setzt den
> Merge-Branch-Stand mit `BACKUP_SECONDARY_*`-Unterstützung voraus.

Dieses Runbook fasst die früher verteilten Gates L10 (Zielwahl), L11 (Freigabe) und L12 (Tarif) zu einem
einzigen Termin zusammen. Es besteht nur aus Klick-Anleitungen und Copy-Paste-Blöcken — nichts muss
formuliert oder entschieden werden, außer zwei Anbieternamen zu bestätigen.

**Sicherheitsregeln (unveränderlich):**

- Die Zugangsdaten werden **nur** in `.env.local` eingetragen — niemals committen, niemals in Chat oder Doku kopieren.
- Beide Zugriffsschlüssel bekommen **kein Delete-Recht** — Retention läuft über die Bucket-Lifecycle-Regel.
- Die Verschlüsselung läuft clientseitig (AES-256-GCM); die Provider sehen niemals Klartext-Dumps.

---

## Schritt 1 — Cloudflare R2 (PRIMÄR-Ziel) anlegen

1. **Konto:** <https://dash.cloudflare.com/sign-up> → Registrierung (kostenloser Free-Plan genügt).
2. **Bucket:** Dashboard → linke Navigation **R2 Object Storage** (erster Besuch: „Activate R2" bestätigen) →
   **Create bucket** →
   - Name: `casino-recovery-primary`
   - Location: `Automatic` → **Create bucket**.
3. **Lifecycle-Regel:** Bucket öffnen → Tab **Settings** → Abschnitt **Object lifecycle rules** →
   **Add rule** →
   - Rule name: `expire-backup-30d`
   - Prefix or condition: **Apply to objects with prefix** → `casino-recovery/`
   - Action: **Delete objects** → „Object is more than **30** days after upload" → **Add rule**.
   - (Konsolen-Namen der Felder können sich leicht ändern; gesucht ist eine Regel
     „Objekte mit Prefix X nach N Tagen löschen".)
4. **Zugangsschlüssel:** R2-Übersicht → **Manage R2 API Tokens** → **Create API token** →
   - Permissions: **Object Read & Write**
   - Specify bucket: nur `casino-recovery-primary`
   - Client IP filtering: leer lassen → **Create API Token**.
   - **Jetzt notieren** (wird danach nie wieder angezeigt):
     - `Access Key ID`
     - `Secret Access Key`
     - Endpoint: in den Bucket-Settings unter **S3 API** (Form: `https://<accountid>.r2.cloudflarestorage.com`).
5. **Region:** R2 kennt keine klassische AWS-Region — trage `auto` ein (der Code übernimmt sie 1:1 in die SigV4-Signatur).

## Schritt 2 — Backblaze B2 (SEKUNDÄR-Ziel) anlegen

1. **Konto:** <https://www.backblaze.com/cloud-storage> → **Sign Up** (kostenloser Free-Tier genügt).
2. **Bucket:** Dashboard → **Object Storage** → **Buckets** → **Create a Bucket** →
   - Bucket name: `casino-recovery-secondary`
   - Files in Bucket are: **Private**
   - Object Lock: aus → **Create a Bucket**.
3. **Lifecycle-Regel:** Bucket öffnen → Tab **Lifecycle Settings** → **Add Rule** →
   - Rule name: `expire-backup-30d`
   - Keep only the last (versions): leer
   - Keep all object versions for (days): `0`
   - **Hide or delete:** Delete
   - Days after the files were uploaded: `30`
   - Apply to: **Only files whose names start with** → `casino-recovery/`
     → **Add Rule**.
4. **Zugangsschlüssel:** Dashboard → **Application Keys** → **Add a New Application Key** →
   - Name: `casino-backup-runner`
   - Allow access to Bucket(s): nur `casino-recovery-secondary`
   - Type of Access: **Read and Write**
   - Optional File Name Prefix: `casino-recovery/`
     → **Create New Key**.
   - **Jetzt notieren:** `keyID` (= Access Key ID) und `applicationKey` (= Secret Access Key).
5. **Endpoint:** Bucket-Seite, Abschnitt **Endpoint** (Form: `https://s3.<region>.backblazeb2.com`,
   z. B. `https://s3.eu-central-003.backblazeb2.com`). Region ist der Teil nach `s3.` (z. B. `eu-central-003`).

## Schritt 3 — Variablen erzeugen und eintragen

1. **Verschlüsselungsschlüssel erzeugen** (32 Bytes, base64). PowerShell:

   ```powershell
   $bytes = New-Object byte[] 32
   [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
   [Convert]::ToBase64String($bytes)
   ```

   → Ausgabe ist `BACKUP_ENCRYPTION_KEY_BASE64`. **Diesen Schlüssel zusätzlich offline sichern
   (Passwort-Manager): Ohne ihn sind alle Backups unlesbar.**

2. **`.env.local` öffnen** (Projektroot) und am Ende ergänzen — alle Werte aus Schritt 1/2 + Schlüssel aus Schritt 3.1:

   ```ini
   # --- Offsite-Backup (primär: R2, sekundär: B2) ---
   BACKUP_ENCRYPTION_KEY_BASE64=<Schlüssel aus Schritt 3.1>
   BACKUP_S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
   BACKUP_S3_BUCKET=casino-recovery-primary
   BACKUP_S3_REGION=auto
   BACKUP_S3_ACCESS_KEY_ID=<R2 Access Key ID>
   BACKUP_S3_SECRET_ACCESS_KEY=<R2 Secret Access Key>
   # BACKUP_S3_PREFIX=casino-recovery

   BACKUP_SECONDARY_S3_ENDPOINT=https://s3.<region>.backblazeb2.com
   BACKUP_SECONDARY_S3_BUCKET=casino-recovery-secondary
   BACKUP_SECONDARY_S3_REGION=<region>
   BACKUP_SECONDARY_S3_ACCESS_KEY_ID=<B2 keyID>
   BACKUP_SECONDARY_S3_SECRET_ACCESS_KEY=<B2 application key>
   ```

## Schritt 4 — Erster echter Lauf (N7, K4-Freigabe)

1. **Freigabe:** Dieser Lauf ist der K4-Gate-Punkt aus `T_DATABASE/05_database_backup_and_recovery.md` §4 —
   Jan bestätigt im Chat „Lauf freigegeben", **bevor** er ausgeführt wird (echte Produktdaten verlassen
   erstmals das Supabase-Projekt).
2. **Lauf:**

   ```powershell
   npm run backup:run
   ```

3. **Ergebnis gegen diese Checkliste prüfen** (alles ✔ = Erfolg):
   - [ ] JSON-Output `status: backup-uploaded` mit `targets: 2`.
   - [ ] `targets[]` enthält `primary: ok` **und** `secondary: ok` (bei `partial` → Abschnitt „Teilerfolg" unten).
   - [ ] R2-Dashboard → Bucket → Objekte sichtbar unter `casino-recovery/<jahr>/<monat>/<tag>/`
         (3 `.enc`-Dateien + `manifest.json`).
   - [ ] B2-Dashboard → Bucket → dieselbe Struktur sichtbar.
   - [ ] **Integrität:** `npx tsx scripts/verify-backup-integrity.ts` → alle Artefakte `hashMatch: true, decryptOk: true` auf **beiden** Zielen.
   - [ ] **Restore-Drill vom Ziel:** `npx tsx scripts/restore-drill.ts --target=primary` **und** `--target=secondary` →
         jeweils `status: restore-drill-succeeded`.
4. **Notieren im Chat für den Abschlussbericht:** Datum, Manifest-`createdAt`, Artefakt-Größen (aus der JSON-Ausgabe).

## Teilerfolg (secondary fehlgeschlagen)

`status: partial` bedeutet: Primärziel ist **ok**, Sekundärziel fehlgeschlagen. Keine Panik — die Sicherung
am Primärziel ist vollständig. Vorgehen: Fehlermeldung in der JSON-Ausgabe lesen (typisch: falsche Region,
falsches Key-Prefix), Variablen korrigieren, Lauf wiederholen. Erst bei dauerhaft rotierendem Sekundärziel
im Chat melden.

## Kosten-Kurzschätzung (Stand 2026-09, in der Console verifizieren)

| Posten                     | Cloudflare R2 (primär)                                                                                                                                                                         | Backblaze B2 (sekundär)  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Free-Tier Speicher         | 10 GB/Monat                                                                                                                                                                                    | 10 GB                    |
| Free-Tier Requests         | 1 Mio. Schreibvorgänge (Class A), 10 Mio. Lesevorgänge (Class B)                                                                                                                               | ~3.000 API-Calls/Tag     |
| Egress                     | 0 USD (R2 hat keine Egress-Gebühren)                                                                                                                                                           | 1 GB/Tag kostenlos       |
| Aktuelles Datenvolumen     | Dev-Datenbank: Dump (schema.sql + data.sql) liegt typischerweise im **KB–niedrigen MB-Bereich**; das tatsächliche Volumen steht nach Schritt 4 in der JSON-Ausgabe (`artifactCount` × `bytes`) | identisch (zweite Kopie) |
| **Erwartete Monatskosten** | **0 USD**                                                                                                                                                                                      | **0 USD**                |

Anhaltspunkt: Bei täglichem Lauf wären das ~30 Dumps/Monat à wenige MB — zusammen maximal ein paar
Dutzend MB, weit unter beiden Free-Tier-Grenzen. Erst bei signifikantem Produktions-Datenwachstum
(einsehbar in der JSON-Ausgabe jedes Laufs) sind Paid-Kosten zu erwarten.

## Lifecycle-Regel: Abweichung zur 14/8/12-Tabelle (honest note)

Die Planung sah GFS-Tiers (14 täglich/8 wöchentlich/12 monatlich) vor. Der Runner (Stand N2) schreibt alle
Artefakte unter **einem** datumsbasierten Präfix (`casino-recovery/JJJJ/MM/TT/`) — Wochen-/Monats-Tiers
brauchten eigene Präfixe, die Lifecycle-Regeln nicht aus dem Haupt-Präfix herausfiltern kann. Umgesetzt ist
daher die **Superset-Regel „30 Tage"** (≥ 30 tägliche Wiederherstellungspunkte, deckt die 14-täglich-Ebene
voll ab und das kanonische „30 Tage Retention" aus `docs/database/09_backup_disaster_recovery.md`).
Die 8-wöchentlich-/12-monatlich-Tiers sind bewusst offen und werden erst relevant, wenn echtes Datenvolumen
(N7-Nachlauf) eine längere Historie rechtfertigt — dann erweitert ein kleines Runner-Feature (separate
Wochen-/Monats-Präfixe) die Tiers, bevor die Lifecycle-Regeln verlängert werden.

## Nach dem ersten erfolgreichen Lauf

- PITR-Entscheidung: **nichts tun** — erst bei `RPO ≤ 24h`-Unterschreitung oder den Schwellen in
  `docs/database/09_backup_disaster_recovery.md` §4 (1.000 € Echtgeldumsatz/Tag, 500 aktive Spieler) prüfen.
- Regelbetrieb übernimmt automatisch: `backup-freshness-check.yml` (täglich, Staleness-Alert via GitHub Issue)
  und `backup-drill.yml` (wöchentlicher Drill). N3/N4 sind ab Aktivierung sofort wirksam.
- Quartalsweise: Config-Inventar-Script (N5) läuft im Query-Performance-Audit-Cron mit.

---

_Erstellt: 2026-09-13 (Säule 9 N1, Execution-Lauf Database Hardening). Quelle: `T_DATABASE/05_database_backup_and_recovery.md` §3 N1._
