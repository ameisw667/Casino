# 06 — Analytics-Kontext

> **Zweck:** Modulkarte für consent-gesteuerte PostHog-Produkt-Analytics. Änderungsablauf: [Workflow Analytics-Änderung](../xx_sop/08_analytics_posthog.md).

## 1 — Systemgrenze

- `src/lib/analytics/` misst Produktnutzung über PostHog. Es ist nicht die Admin-BI-Schicht (`src/lib/admin/analytics.ts`) und nicht Sentry- oder Guide-Telemetrie.
- Analytics bestimmt weder Spielausgänge noch Wallet-, Auth- oder UI-Abläufe. Fehler bleiben best-effort und dürfen den Aufrufer nicht beeinflussen.
- Lokale Quelldateien und Tests sind für Verhalten maßgeblich; `.env.example` benennt nur Konfigurationsnamen. Live- und Rollout-Status stehen in `worldmap/00_WORLDMAP_STATUS.md`.

## 2 — Laufzeitkette

1. `ConsentBanner` schreibt `granted` oder `denied` unter `consent.posthog.v1`.
2. `trackAllowedEvent()` validiert Name und Properties strikt und fordert erst danach den Client an.
3. `getAnalyticsClient()` initialisiert `posthog-js` nur bei `granted` und nur bei vorhandener öffentlicher Konfiguration.
4. `AnalyticsIdentityBootstrap` ruft nach Consent für angemeldete Nutzer `/api/analytics/identity` auf; die Route liefert ausschließlich eine HMAC-`distinctId`.
5. `posthog-erasure.ts` besitzt eine serverseitige Löschfunktion, hat aber keinen Aufrufer, solange kein Account-Löschpfad existiert.

## 3 — Module und Eigentümerschaft

- `consent.ts`: versionierter Local-Storage-Consent, Lese-/Schreibzugriff und Same-/Cross-Tab-Subscription.
- `posthog-client.ts`: consent-geschützter Lazy-Browser-Client und Teardown bei Widerruf.
- `events.ts`: einzige Capture-Grenze, Event-Union und strikte Zod-Allowlist.
- `identity-hmac.ts`: serverseitige HMAC-SHA-256-`distinctId`; benötigt mindestens 32 Bytes Secret.
- `identify.ts`: einmalige, best-effort Browser-Identifikation pro Session.
- `posthog-erasure.ts`: serverseitige Person-/Event-Löschung über die PostHog-Persons-API.
- `src/app/api/analytics/identity/route.ts`: Auth-, Rate-Limit- und No-Store-Grenze für die HMAC-Identität.
- `src/components/analytics/`: Consent-UI und Identitäts-Bootstrap; `MainLayout` und `ClientProviders` sind deren Einstiegspunkte.

## 4 — Privacy- und Client-Vertrag

- Ohne `granted` kein Client und kein Capture. Bei Widerruf wird ein vorhandener Client opt-out gesetzt und zurückgesetzt.
- Der Client deaktiviert IP-Option, Autocapture, Pageviews und Session Recording; URL-, Pfad- und Referrer-Properties stehen auf der Denylist.
- Die HMAC-Identität verlässt den Server nur als `distinctId`; Roh-User-ID, E-Mail, Wallet-/Zahlungsdaten, Secrets und IP-Adressen sind keine Event-Properties.
- `NEXT_PUBLIC_POSTHOG_KEY` und `NEXT_PUBLIC_POSTHOG_HOST` sind Browser-Konfiguration. `POSTHOG_DISTINCT_ID_HMAC_SECRET`, `POSTHOG_PROJECT_ID` und `POSTHOG_PERSONAL_API_KEY` bleiben serverseitig; Werte gehören nie in diese Datei.

## 5 — Event-Vertrag

- Zulässige Events: `landing_viewed`, `cta_play_now_clicked`, `sign_up_completed`, `first_game_started`, `stats_viewed`, `passkey_sign_in_completed`, `passkey_registered`, `mfa_totp_enrolled`, `mfa_totp_unenrolled`, `identity_linked`, `identity_unlinked`.
- Nur `first_game_started` trägt Properties: `game` ist genau `DICE`, `SLOTS`, `ROULETTE`, `CRASH` oder `BLACKJACK`.
- Die Deklaration in `events.ts` ist die vollständige Allowlist. Neue Namen oder Properties sind eine Produkt-, Privacy- und Dokumentationsänderung.

## 6 — Löschung, Tests und Drift

- `erasePostHogPerson()` löscht mit pseudonymer `distinctId`; ohne Serverkonfiguration gibt sie `skipped` zurück. Sie ist nicht an eine Kontolöschung angeschlossen.
- Tests liegen in `src/lib/analytics/__tests__/`; Route- und Call-Site-Verhalten wird zusätzlich in den jeweiligen Security-/Komponententests geprüft.
- Bei Modul-, Verantwortungs- oder Einstiegspunktänderungen diese Referenz und die SOP im selben Schritt aktualisieren. Historische Entscheidung und Go-Live-Nachweis bleiben im Archiv bzw. der Worldmap, nicht hier.
