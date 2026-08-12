# Chaos-Testing-Stack — Deployment-Anleitung

Gehört zu Initiative 1.10, Detailplan: [`worldmap/05_1.10 Resilience Chaos Testing.md`](../../worldmap/05_1.10%20Resilience%20Chaos%20Testing.md).

**Ziel-Umgebung:** Hostinger-VPS, auf dem bereits ein produktiver n8n-Container läuft. Jeder Schritt hier ist so geschrieben, dass er n8n nicht beeinträchtigt — bei Abweichung von dieser Anleitung ist das nicht mehr garantiert.

**Wichtig, bevor du anfängst:** Löse zuerst das Migrations-Nummern-Duplikat `021` (zwei Dateien in `supabase/migrations/` mit demselben Präfix — siehe Plan Abschnitt 14). Ohne das ist die Ausführungsreihenfolge der Migrationen nicht deterministisch.

**Abkürzung:** Schritte 1–6 unten (bis inkl. Firewall-Check und Stack-Start) sind in [`deploy.sh`](deploy.sh) gebündelt. Nach dem Befüllen von `.env.chaos` (Schritt 2) reicht `bash deploy.sh` auf dem VPS — bricht bei jedem Fehler sofort ab (`set -e`), keine Ausnahme. Die Schritte unten bleiben als Referenz/Fallback dokumentiert, falls du lieber einzeln vorgehen willst.

## 0. Voraussetzungen

- Root- oder Docker-Gruppen-Zugriff auf den VPS (Key-only-SSH empfohlen, nicht Passwort-Auth).
- `docker compose` (v2-Syntax) auf dem VPS installiert — laut Hostinger-Panel bereits vorhanden (Docker Manager, n8n läuft darüber).

## 1. Dateien auf den VPS kopieren

```bash
scp -r infra/chaos root@<VPS-IP>:/opt/casino-chaos
```

## 2. Secrets generieren (niemals aus `.env.local` kopieren)

Auf dem VPS, im Ordner `/opt/casino-chaos`:

```bash
cp .env.chaos.example .env.chaos
# Jeden Wert einzeln frisch generieren, NICHT wiederverwenden:
openssl rand -base64 32   # -> POSTGRES_PASSWORD
openssl rand -base64 32   # -> JWT_SECRET
openssl rand -base64 32   # -> REALTIME_SECRET_KEY_BASE
openssl rand -base64 24   # -> DASHBOARD_PASSWORD
```

`ANON_KEY`/`SERVICE_ROLE_KEY` müssen valide JWTs sein, signiert mit demselben `JWT_SECRET` (Rollenclaim `anon` bzw. `service_role`). Nutze dafür ein JWT-Erzeugungs-Tool deiner Wahl mit dem generierten `JWT_SECRET` — trag die fertigen Werte in `.env.chaos` ein.

`.env.chaos` in `.env.chaos` umbenennen/befüllen — **niemals** `.env.chaos.example` selbst mit echten Werten überschreiben und committen.

## 3. Firewall prüfen — vor dem ersten Start

```bash
ufw status verbose
```

Kein Chaos-Port (`15432`, `18000`, `18443`, `13000`) darf hier als `ALLOW` von außen gelistet sein. Falls doch: `ufw deny <port>` bevor du fortfährst. Diese Prüfung nach **jedem** Compose-Update wiederholen, nicht nur einmalig.

## 4. Stack starten

Immer projekt-scoped, nie mit host-weiten Docker-Befehlen (der Docker-Daemon ist mit n8n geteilt):

```bash
cd /opt/casino-chaos
docker compose -p casino-chaos --env-file .env.chaos up -d
docker compose -p casino-chaos ps   # alle Services healthy?
```

## 5. Externer Port-Scan (Bestätigung, kein Port ist öffentlich erreichbar)

Von einer **anderen** Maschine als dem VPS selbst (z. B. deinem lokalen Rechner):

```bash
nmap -Pn -p 15432,18000,18443,13000 <VPS-IP>
```

Erwartung: alle vier Ports `filtered`/`closed`, keiner `open`. Bei `open`: sofort `docker compose -p casino-chaos down`, Ursache klären (vermutlich `127.0.0.1`-Bindung in `docker-compose.yml` versehentlich entfernt).

## 6. Migrationen ausrollen

```bash
# Auf dem VPS, gegen die Chaos-DB über den internen Docker-Netzwerk-Namen:
for f in /pfad/zu/supabase/migrations/*.sql; do
  psql "postgresql://postgres:$POSTGRES_PASSWORD@127.0.0.1:15432/postgres" -f "$f"
done
```

Content-Hash-Ledger (R-C4) wird vom Chaos-Skript beim ersten Lauf automatisch angelegt (`chaos_migrations_ledger`-Tabelle) — bei künftigen Drift-Checks vergleicht `scripts/chaos/` die aktuellen Datei-Hashes dagegen.

## 7. SSH-Tunnel für lokalen Zugriff

```bash
ssh -N -L 15432:127.0.0.1:15432 -L 18000:127.0.0.1:18000 root@<VPS-IP>
```

Lokal in `.env.chaos` (Repo-Root, nicht auf dem VPS) eintragen:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:18000
SUPABASE_SERVICE_ROLE_KEY=<derselbe Wert wie auf dem VPS>
CHAOS_TARGET_CONFIRMED=true
```

## 8. Rollback (vollständig, nicht nur `down -v`)

Das offizielle `supabase/docker`-Repo nutzt teils Host-Bind-Mounts statt benannter Volumes — `down -v` allein lässt Daten auf Disk zurück:

```bash
docker compose -p casino-chaos down -v
docker network prune --filter "label=com.docker.compose.project=casino-chaos"
docker ps -a --filter "label=com.docker.compose.project=casino-chaos"   # muss leer sein
rm -rf /opt/casino-chaos/volumes   # nur falls vorhanden, nach Bestätigung
```

## Nicht aktivieren

Das Hostinger-Backup-Add-on (5,99 €/Monat) ist für diesen Stack nicht nötig — alle Daten sind synthetisch und jederzeit aus den Migrationsdateien reproduzierbar.
