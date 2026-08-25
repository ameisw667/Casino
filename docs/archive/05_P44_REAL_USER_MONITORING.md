# 1.28 — Real User Monitoring (Core Web Vitals)

> **Status:** Executed (archiviert) · lokal verifiziert · **Stand:** 2026-08-23 · **Owner:** LLM (Umsetzung/Prüfung), Jan (abschließende PostHog-Dashboard-Sichtprüfung) · **Scope:** Consent-gebundene LCP-, CLS- und INP-Feldmessung im bestehenden PostHog-Kanal; keine Laufzeit- oder Datenbankautorität verändert.

## Entscheidung und Grenzen

Gewählt wurde der Standard-Build von `web-vitals` 5.3.0 als direkte Dependency. Der neue Eventvertrag `web_vital_measured` erlaubt ausschließlich `metric` (`LCP`, `CLS`, `INP`), einen endlichen nicht-negativen `value` und `rating` (`good`, `needs-improvement`, `poor`).

Nicht umgesetzt wurden ein neuer Analytics-Anbieter, weitere Consent-Flächen, API-Routen, DB-Objekte, URL-/Referrer-/Geräte-/DOM-/IP-Properties, Session Replay oder Attribution-Selectors. Der Money-Pfad bleibt Nein.

## Umsetzung

- `src/lib/analytics/events.ts` enthält die strikte Zod-Allowlist; jeder Capture läuft weiterhin nur über `trackAllowedEvent()` und prüft Consent auch nach dem asynchronen Client-Laden.
- `src/lib/analytics/web-vitals.ts` lädt die Bibliothek erst nach `consent.posthog.v1 = granted`, registriert LCP/CLS/INP genau einmal und fällt bei ungültigen Werten, Widerruf oder Importfehlern best-effort geschlossen aus.
- `src/components/analytics/WebVitalsReporter.tsx` bindet die Messung einmalig an `ClientProviders` an und reagiert auf spätere Consent-Erteilung.
- `xx_docs/06_analytics_context.md` beschreibt Modul, Einstiegspunkt und Datenvertrag.

## Verifikation

- TDD-Nachweis: Der Eventvertrag schlug zunächst erwartbar mit keinem Capture fehl; der Reporter-Test zunächst mit fehlendem Modul. Danach grün.
- Unabhängiges Review: Die Consent-Widerrufs-Race nach dem Client-`await` wurde mit einer zweiten Consent-Prüfung und einem Deferred-Client-Regressionstest geschlossen. Parallelstarts und Widerruf beim Laden sind ebenfalls regressionsgetestet.
- `npm run test -- src/lib/analytics/__tests__`: 7 Dateien, 66/66 Tests grün, einschließlich ungültiger Werte (negativ, NaN, Infinity, unzulässige Metrik/Rating).
- `npm run typecheck`: vollständig grün.
- `npm run build`: vollständig grün (TypeScript, 49 statische Seiten und Routenabschluss).
- Headless-Browser-Smoke gegen `http://127.0.0.1:3015/`: mit verweigertem und erteiltem Consent ohne Page-Error grün; externe Hosts waren blockiert.
- `npm run lint`: P44-Dateien ohne Befund; der aktuelle Gesamtlauf ist durch einen fremden Fehler in `src/components/layout/NotificationCenter.tsx` rot (zusätzlich sieben vorbestehende Warnungen).

## Restlicher Jan-Check

Nach Deployment einmal Consent erteilen, eine Interaktion ausführen und den Tab verlassen. In PostHog muss `web_vital_measured` ausschließlich mit den drei erlaubten Properties erscheinen. Dies ist der noch offene Live-, nicht der lokale Implementierungsnachweis.