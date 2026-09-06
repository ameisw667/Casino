# Enrichment — Referenz für Stufe C

> **Deckt ab:** Stufe C (fehlende Kontaktdaten ergänzen). **Recherche-Stand:** 2026-08-28 — dieser Baustein ist bewusst simpel gehalten (kein Enrichment-SaaS wie Clearbit/Hunter.io nötig für den Sandbox-Umfang), daher primär Architektur-/Robustheits-Hinweise statt externer API-Doku.

## 1 — Warum kein Enrichment-SaaS für die Sandbox

Dienste wie Hunter.io oder Clearbit liefern zuverlässigere Ergebnisse, brauchen aber einen weiteren API-Key und laufen bei kostenlosen Kontingenten schnell leer. Für 20–50 Test-Leads reicht ein simpler **Website-Crawl mit Regex-Extraktion** — und das ist zusätzlich der Baustein, der sich am direktesten auf ein späteres eigenes Produkt überträgt (dort wird man ohnehin oft eigene Heuristiken statt teurer Drittanbieter-APIs brauchen).

## 2 — Node-Design

1. **Input:** Lead-Datensatz aus Stufe B, gefiltert auf `email` ist leer/nicht vorhanden.
2. **HTTP-Request-Node:** `GET {website-url}` — falls `website` in den Apify-Daten leer ist, wird der Lead direkt als "nicht anreicherbar" markiert und übersprungen (kein Rate-Limit-Verbrauch für nichts).
3. **Zweiter Versuch bei Fehlschlag:** Übliche Kontakt-Pfade anhängen und einzeln probieren: `/kontakt`, `/contact`, `/impressum`, `/imprint`, `/about`. In n8n als kleine Schleife über ein Array dieser Suffixe, mit `continueOnFail: true` je Einzelversuch.
4. **Extraktion:** Regex in dieser Priorität:
   - Zuerst `mailto:` -Links aus dem HTML (`href="mailto:([^"?]+)"`) — deutlich zuverlässiger als Freitext-Regex, da explizit als Kontaktabsicht markiert.
   - Nur falls kein `mailto:`-Treffer: generische Email-Regex über den sichtbaren Text als Fallback, mit erhöhtem Risiko für False Positives (z. B. Bild-Dateinamen, die wie Emails aussehen) — Ergebnis in diesem Fall als "unsicher, Stichprobe prüfen" markieren statt automatisch zu übernehmen.
5. **Output:** Lead-Datensatz um `email` (falls gefunden) und `enrichmentSource` (`"mailto-link"` / `"regex-fallback"` / `"nicht gefunden"`) ergänzt.

## 3 — Rate-Limiting & Höflichkeit gegenüber Zielseiten

- Zwischen den HTTP-Requests eine kleine Verzögerung einbauen (z. B. 1–2 Sekunden über einen `Wait`-Node in der Schleife) — bei 20–50 Leads insgesamt vernachlässigbare Laufzeit, aber deutlich rücksichtsvoller gegenüber den Zielservern als paralleles Abfeuern.
- `robots.txt` wird für diesen einfachen Sandbox-Crawl nicht programmatisch ausgewertet — bei einem Übergang zu echtem, großskaligem Einsatz (Stufe K, Horizont 2) sollte das nachgerüstet werden.
- Timeout je Request niedrig ansetzen (z. B. 8–10 Sekunden) und `continueOnFail: true`, damit eine einzelne langsame/tote Website nicht den gesamten Lauf blockiert.

## 4 — Verifizierungskriterium (aus dem Hauptplan übernommen, hier präzisiert)

"Messbar höherer Anteil an Datensätzen mit vorhandener Email" heißt konkret: Anteil `email vorhanden` vor Stufe C (nur aus Apify-Daten) vs. nach Stufe C (inkl. Enrichment) wird als einfache Prozentzahl im Workflow-Output mitgeloggt — kein separates Reporting-Tool nötig, ein `Set`-Node mit einer Zusammenfassung am Ende reicht für den Sandbox-Umfang.
