# 05 — Service-Layer-Kontext

> **Zweck:** Modulkarte für `src/lib/casino/`. Änderungsablauf: [Workflow Service-Layer-Änderung](../xx_sop/06_service_layer_casino.md).

## 1 — Schichtgrenze

- Page- und UI-Komponenten verwalten Darstellung, lokale Eingabe und Animationen. Sie bestimmen keine Wett-, Wallet-, RNG- oder Settlement-Ergebnisse.
- Geschäftsregeln und gemeinsame Verträge liegen in `src/lib/casino/`. API-Routen behandeln Authentifizierung, Request-Validierung und Response-Transport.
- `src/store/useCasinoStore.ts` ist eine getrennte State-Schicht. Walletwerte stammen nur aus bestätigten Server-Snapshots.

## 2 — Geld, Ergebnisse und Verträge

- `casino-core.ts`, `provably-fair.ts`, `bet-validator.ts`: Spielrouting, Ergebnisberechnung, Seeds und Einsatzprüfung.
- `wallet.ts`, `wallet-contract.ts`, `big-win.ts`: Wallet-RPCs, Zod-Snapshots, Settlement-Contracts und Big-Win-Grenzen.
- Finanzielle Ergebnisse bleiben serverautoritativ; der Browser übermittelt keine Auszahlung oder Kontostandsentscheidung.

## 3 — Konfiguration und Progression

- `game-config.ts` und `game-config-server.ts`: Client-kompatible Defaults und serverseitiger Konfigurations-Cache.
- `vip-config.ts` und `vip-config-server.ts`: VIP-Tiers, Ränge und Server-Cache.
- `achievements-config.ts` und `achievements-config-server.ts`: Achievement-Bedingungen, Fortschritt und Server-Cache.

## 4 — Realtime und Spielzustand

- `crash-round.ts`: geteilter Crash-Rundenstatus, Scheduler-Helfer und öffentliche Zustandsprojektion.
- `realtime.ts` und `realtime-types.ts`: Server-Broadcasts und client-kompatible Crash-Payloads.
- `session.ts`, `daily-race.ts`, `stats-derivation.ts`, `seed-history-verification.ts`: Session-ID, Tagesrennen und abgeleitete Spielerdaten.

## 5 — Guide, Kommunikation und Benachrichtigungen

- `chat-guide.ts`, `guide-tools.ts`, `guide-live-leaderboard.ts`, `guide-feedback.ts`, `guide-telemetry.ts`: Guide-Antworten, Spieler-Tools und UI-Aktionspayloads, Live-Kontext, Feedback sowie Kosten-/Latenztelemetrie.
- `guide-knowledge/`: Wissensquellen, Parsing, Retrieval, Vektorsuche und Registry.
- `chat-bot.ts`, `telegram-api.ts`, `telegram-link.ts`, `telegram-notifier.ts`: Chat-Kommandos sowie Telegram-Versand und Account-Verknüpfung.

## 6 — Risiko, Sicherheit und Beobachtbarkeit

- `fraud-detection.ts`, `risk-signals.ts`, `risk-event-store.ts`, `network-fingerprint.ts`, `fraud-ml/`: Risikoerfassung, Persistenz, Netzwerkindikatoren und Offline-Anomalieanalyse.
- `logger.ts`, `sentry-scrub.ts`, `perf-monitor.ts`: strukturierte Logs, Sentry-Redaktion und Performance-Messungen.
- `sound-manager.ts`: Audio-Singleton für die UI; keine Geschäftsregel.

## 7 — Tests

- `__tests__/`: Unit- und Integrationstests für Service-Module; Testhelfer liegen in `__tests__/helpers/`.

## 8 — Quellregel

- Die tatsächlichen Dateien unter `src/lib/casino/` und deren Unterordner sind das lokale Inventar.
- Diese Referenz benennt Modulgruppen, nicht jede Implementierungszeile. Bei Datei- oder Verantwortungsänderung wird sie im selben Schritt angepasst.
- Lokale Dateien, Remote-Rollout und Live-Verhalten bleiben getrennte Aussagen.
