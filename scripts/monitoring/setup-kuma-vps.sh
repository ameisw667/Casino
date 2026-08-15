#!/usr/bin/env bash
# Idempotent Uptime Kuma rollout for Jan's existing VPS (05_1.13).
#
# Reuses the same idempotency pattern as the Local-LLM-Usage-Dashboard project's
# setup-vps.sh: never overwrite an existing config file, verify nginx before reload,
# check resource headroom before starting a new container, postcheck before declaring
# success. Runs Docker instead of a bare process, since Uptime Kuma ships as an image.
#
# This script is meant to be copied to the VPS and run there over SSH by Jan — it is
# not run from this machine (no SSH access to the VPS exists in this environment).
#
# SECURITY ORDERING (fixed after the independent security review, see 05_1.13 R6/finding
# 4): the nginx reverse-proxy step — the thing that makes Kuma reachable from the public
# internet — runs LAST, only after Jan confirms the Kuma first-run admin account is
# already created. Uptime Kuma has a documented unauthenticated-setup exposure window
# (CVE-2023-38646); publishing the public route before that account exists would let
# anyone who finds the URL first create it instead of Jan.
#
# Usage:
#   1. Edit KUMA_DOMAIN below (or export it before running) if you have a domain
#      pointed at this VPS. Leave empty to skip the nginx/TLS step entirely and access
#      Kuma only via an SSH tunnel (ssh -L 3001:127.0.0.1:3001 user@vps) — the safer
#      default if no domain is available yet.
#   2. scp this file to the VPS, then: chmod +x setup-kuma-vps.sh && ./setup-kuma-vps.sh
#   3. When prompted, open Kuma via the SSH tunnel (NOT the public domain, which isn't
#      live yet) and complete the first-run admin account setup, then return and press
#      Enter. Only then does the script expose Kuma publicly via nginx.

set -euo pipefail

KUMA_DOMAIN="${KUMA_DOMAIN:-}"
KUMA_CONTAINER_NAME="${KUMA_CONTAINER_NAME:-uptime-kuma}"
KUMA_HOST_PORT="${KUMA_HOST_PORT:-3001}"
KUMA_DATA_DIR="${KUMA_DATA_DIR:-/opt/uptime-kuma-data}"
NGINX_SITE_FILE="/etc/nginx/sites-available/uptime-kuma"
MIN_FREE_MEM_MB=200
MIN_FREE_DISK_MB=500

log() { printf '[kuma-setup] %s\n' "$1"; }
fail() { printf '[kuma-setup] FEHLER: %s\n' "$1" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || fail "Docker nicht gefunden. Erst installieren: https://docs.docker.com/engine/install/ (kein Auto-Install durch dieses Skript — kein curl|bash)."

log "Prüfe Ressourcen-Headroom vor Containerstart..."
free_mem_mb=$(free -m | awk '/^Mem:/{print $7}')
free_disk_mb=$(df -m "$(dirname "$KUMA_DATA_DIR")" 2>/dev/null | awk 'NR==2{print $4}' || df -m / | awk 'NR==2{print $4}')
if [ "${free_mem_mb:-0}" -lt "$MIN_FREE_MEM_MB" ]; then
  fail "Nur ${free_mem_mb:-0} MB freier RAM, mindestens ${MIN_FREE_MEM_MB} MB nötig — Abbruch statt halb-konfiguriertem Zustand (siehe R10 in 05_1.13)."
fi
if [ "${free_disk_mb:-0}" -lt "$MIN_FREE_DISK_MB" ]; then
  fail "Nur ${free_disk_mb:-0} MB freier Diskplatz, mindestens ${MIN_FREE_DISK_MB} MB nötig — Abbruch statt halb-konfiguriertem Zustand (siehe R10 in 05_1.13)."
fi
log "Ressourcen ausreichend (${free_mem_mb} MB RAM, ${free_disk_mb} MB Disk frei)."

mkdir -p "$KUMA_DATA_DIR"

if docker ps -a --format '{{.Names}}' | grep -qx "$KUMA_CONTAINER_NAME"; then
  log "Container '$KUMA_CONTAINER_NAME' existiert bereits — starte nur, falls gestoppt (idempotent, kein Neuanlegen)."
  docker start "$KUMA_CONTAINER_NAME" >/dev/null
else
  log "Lege neuen Container '$KUMA_CONTAINER_NAME' an, gebunden ausschließlich an 127.0.0.1 (R6-Mitigation, kein direkt exponierter Container-Port)."
  docker run -d \
    --name "$KUMA_CONTAINER_NAME" \
    --restart unless-stopped \
    -p 127.0.0.1:"$KUMA_HOST_PORT":3001 \
    -v "$KUMA_DATA_DIR":/app/data \
    -v /var/run/docker.sock:/var/run/docker.sock \
    louislam/uptime-kuma:1
fi

log "Postcheck: warte auf Kuma-Antwort auf 127.0.0.1:${KUMA_HOST_PORT}..."
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${KUMA_HOST_PORT}/" >/dev/null 2>&1; then
    log "Kuma antwortet lokal."
    break
  fi
  sleep 1
done
curl -fsS "http://127.0.0.1:${KUMA_HOST_PORT}/" >/dev/null 2>&1 || fail "Kuma antwortet nach 30s nicht — Container-Logs prüfen: docker logs $KUMA_CONTAINER_NAME"

echo
echo "=================================================================="
echo " Kuma läuft NUR lokal auf 127.0.0.1:${KUMA_HOST_PORT} — noch nicht"
echo " öffentlich erreichbar (nginx folgt erst nach dieser Bestätigung)."
echo
echo " JETZT von deinem eigenen Rechner aus, in einem zweiten Terminal:"
echo "   ssh -L ${KUMA_HOST_PORT}:127.0.0.1:${KUMA_HOST_PORT} <user>@<vps>"
echo " dann http://127.0.0.1:${KUMA_HOST_PORT} im Browser öffnen und den"
echo " Kuma-Erstsetup-Assistenten abschließen (Admin-Account anlegen)."
echo "=================================================================="
read -r -p "Erst-Setup abgeschlossen (Admin-Account existiert)? Enter zum Fortfahren... " _

if [ -z "$KUMA_DOMAIN" ]; then
  log "Kein KUMA_DOMAIN gesetzt — nginx/TLS-Schritt übersprungen."
  log "Zugriff bleibt ausschließlich per SSH-Tunnel (siehe oben)."
else
  if [ -f "$NGINX_SITE_FILE" ]; then
    log "nginx-Config existiert bereits unter $NGINX_SITE_FILE — wird nicht überschrieben (Idempotenz-Muster)."
  else
    log "Schreibe neue nginx-Config für $KUMA_DOMAIN..."
    cat > "$NGINX_SITE_FILE" <<EOF
server {
    listen 80;
    server_name ${KUMA_DOMAIN};
    location / {
        proxy_pass http://127.0.0.1:${KUMA_HOST_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOF
    ln -sf "$NGINX_SITE_FILE" "/etc/nginx/sites-enabled/uptime-kuma"
  fi

  nginx -t || fail "nginx-Config ungültig (nginx -t) — nicht reloaded, alter Zustand bleibt aktiv."
  systemctl reload nginx
  log "nginx reloaded. Kuma jetzt öffentlich unter http://${KUMA_DOMAIN} erreichbar — Admin-Account war vor diesem Schritt bereits angelegt."
  log "TLS: 'certbot --nginx -d ${KUMA_DOMAIN}' manuell ausführen, falls noch nicht vorhanden (nicht Teil dieses Skripts — Certbot braucht interaktive Bestätigung)."
fi

log "Fertig. Monitore 'Staging' und 'Production' laut 05_1.13 Abschnitt 5.5 manuell in der Kuma-UI anlegen (kein API-Provisioning in diesem Skript — Kuma-API-Token existiert erst nach dem Erstsetup)."
log "Staging-Monitor braucht den Custom-Header 'x-vercel-protection-bypass: <secret>' (05_1.13 Abschnitt 5.3a) — Secret in Vercel: Settings -> Deployment Protection -> Protection Bypass for Automation."
