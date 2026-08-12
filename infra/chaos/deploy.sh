#!/usr/bin/env bash
# Ein-Kommando-Deployment-Helfer für den Chaos-Stack (Initiative 1.10).
# AUSFÜHRUNG NUR DURCH JAN, DIREKT AUF DEM VPS — nicht Teil der autonomen Ausführung
# dieser Session (geteilte Produktiv-Infrastruktur, siehe worldmap/05_1.10 ...md Abschnitt 13).
#
# Bündelt die manuellen Schritte aus README.md (1-6), damit nur noch:
#   1. .env.chaos befüllen (Secrets generieren, siehe README Schritt 2)
#   2. dieses Skript ausführen
#   3. README Schritt 7 (SSH-Tunnel) + 9 (Chaos-Skripte) lokal ausführen
# nötig sind. Bricht bei jedem Fehler sofort ab (set -e) statt halbfertig weiterzulaufen.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "== 1/5: Voraussetzungen prüfen =="
if [ ! -f .env.chaos ]; then
  echo "FEHLER: .env.chaos fehlt. Aus .env.chaos.example kopieren und mit frisch generierten Secrets befüllen (README Schritt 2)."
  exit 1
fi
if grep -qE '^(POSTGRES_PASSWORD|JWT_SECRET|DASHBOARD_PASSWORD)=\s*$' .env.chaos; then
  echo "FEHLER: .env.chaos enthält leere Pflichtfelder (POSTGRES_PASSWORD/JWT_SECRET/DASHBOARD_PASSWORD)."
  exit 1
fi
command -v docker >/dev/null || { echo "FEHLER: docker nicht gefunden."; exit 1; }
docker compose version >/dev/null || { echo "FEHLER: docker compose (v2) nicht gefunden."; exit 1; }

echo "== 2/5: Firewall-Check (Chaos-Ports dürfen nicht extern erreichbar sein) =="
if command -v ufw >/dev/null; then
  for port in 15432 18000 18443 13000; do
    if ufw status | grep -qE "^${port}[/ ].*ALLOW"; then
      echo "FEHLER: Port ${port} ist laut 'ufw status' extern freigegeben. Vor dem Start 'ufw deny ${port}' ausführen."
      exit 1
    fi
  done
  echo "ufw-Check ok: keiner der Chaos-Ports ist per Firewall freigegeben."
else
  echo "WARNUNG: ufw nicht gefunden — Firewall-Status konnte nicht automatisch geprüft werden. Manuell verifizieren (README Schritt 3)."
fi

echo "== 3/5: Stack starten (projekt-scoped, -p casino-chaos) =="
docker compose -p casino-chaos --env-file .env.chaos up -d

echo "== 4/5: Auf 'healthy' warten (max. 60s) =="
for i in $(seq 1 12); do
  if docker compose -p casino-chaos ps --format '{{.Health}}' | grep -qv healthy; then
    sleep 5
  else
    break
  fi
done
docker compose -p casino-chaos ps

echo "== 5/5: Zusammenfassung =="
echo "Stack läuft unter Projekt 'casino-chaos'. Nächste Schritte (manuell, siehe README):"
echo "  - Externen Port-Scan von einer anderen Maschine ausführen (README Schritt 5)"
echo "  - Migrationen ausrollen (README Schritt 6)"
echo "  - SSH-Tunnel aufbauen + lokale .env.chaos befüllen (README Schritt 7)"
echo ""
echo "Rollback bei Bedarf: siehe README Abschnitt 'Rollback' (nicht nur 'down -v')."
