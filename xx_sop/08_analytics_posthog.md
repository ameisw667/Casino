# Workflow Analytics-Änderung

> **Zweck:** Consent-gesteuerte Produkt-Analytics unter `src/lib/analytics/` ändern. Kontext: [Analytics-Kontext](../xx_docs/06_analytics_context.md).

## 1 — Trigger und Start-Gate

- Gilt für PostHog-Events, Consent, Identität, Browser-Client, Erasure oder deren Aufrufer.
- Zuerst Kontextreferenz, betroffene Call-Sites und passende Tests lesen.
- Produkt-Analytics von Admin-BI (`src/lib/admin/analytics.ts`) sowie Fehler- und Guide-Telemetrie abgrenzen.
- Vor neuer Datenkategorie, neuem Event/Property, Provider-/Regionswechsel, automatischer Löschung oder externer Konfiguration Zweck, Empfänger und Nutzerwirkung mit Jan klären.

## 2 — Unverhandelbare Grenzen

- Jeder Capture-Pfad nutzt ausschließlich `trackAllowedEvent()` aus `events.ts`; keine direkte `posthog-js`-Nutzung in Komponenten oder Stores.
- Ohne `granted` im Consent-Key `consent.posthog.v1` darf kein Analytics-Client initialisieren oder Event gesendet werden.
- Events enthalten nur das Zod-Allowlist-Schema. Keine rohe User-ID, E-Mail, Wallet-/Zahlungsdaten, Secrets, IP-Adresse, URL oder Referrer.
- Identifikation nutzt nur die serverseitig erzeugte HMAC-`distinctId`; bei fehlendem oder ungültigem Secret schließt die Route mit 503 statt auf Rohdaten zurückzufallen.
- Analytics bleibt best-effort: Trackingfehler verändern weder Spiel-, Auth- noch Wallet-Ablauf.

## 3 — Umsetzung

- Neues oder geändertes Event als diskriminierte, strikte Zod-Variante in `events.ts` modellieren; Properties auf den minimalen Zweck begrenzen.
- Aufrufer über `trackAllowedEvent()` anbinden. Der Eventname allein ist kein Nachweis, dass der Aufrufer semantisch richtig platziert ist.
- Consent- oder Client-Änderungen erhalten Lazy-Init, Widerruf-Teardown sowie deaktiviertes Autocapture, Pageview und Session-Recording.
- Identitätsänderungen halten HMAC-Erzeugung serverseitig, den Identity-Endpunkt authentifiziert und dessen Antwort `private, no-store`.
- Erasure nur an einen ausdrücklich freigegebenen Account-Löschpfad anbinden; die Personal-API-Credential bleibt serverseitig und wird nie geloggt oder an den Browser geliefert.

## 4 — Verifikation und Dokumentation

- Betroffene Tests unter `src/lib/analytics/__tests__/` ausführen; bei Route-, Consent- oder Call-Site-Änderungen die zugehörigen Security- und Komponentenprüfungen ergänzen.
- Mindestens Typecheck und Lint ausführen; Build bei Client-Bundle-, Umgebungs- oder Routenänderungen.
- Negativfälle prüfen: kein Consent, ungültiges Event/Property, fehlendes HMAC-Secret und fehlerhafter Analytics-Import dürfen keinen Rohdatenversand oder Anwendungsausfall verursachen.
- `xx_docs/06_analytics_context.md` nur bei Zuständigkeits-, Modul- oder Einstiegspunktänderung aktualisieren. Live-Status bleibt in `worldmap/00_WORLDMAP_STATUS.md`.
