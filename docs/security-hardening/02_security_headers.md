# 02 — Security-Header-Set (HSTS, COOP, CORP, Permissions-Policy)

> **Säule:** 2 von 10 · **Status:** 🟢 Committed (`1e75626`, 2026-08-30) · **Stand:** 2026-08-30
> **Datei:** `src/proxy.ts` Zeilen 173–200 · **Back:** [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Sieben verschiedene Response-Header, jeder gegen eine andere Angriffsklasse, alle in `src/proxy.ts` gesetzt statt verstreut über einzelne Routen — ein Missverständnis oder eine vergessene Route kann so keine einzelne Route ungeschützt lassen.

| Header                                | Schützt vor                                                                         | Wert in diesem Projekt                                   |
| :------------------------------------ | :---------------------------------------------------------------------------------- | :------------------------------------------------------- |
| `Strict-Transport-Security`           | Downgrade auf HTTP, SSL-Stripping                                                   | `max-age=63072000; includeSubDomains; preload` (2 Jahre) |
| `X-Frame-Options`                     | Clickjacking (Einbettung in fremden `<iframe>`)                                     | `SAMEORIGIN`                                             |
| `X-Content-Type-Options`              | MIME-Sniffing (Browser interpretiert Datei entgegen `Content-Type`)                 | `nosniff`                                                |
| `Referrer-Policy`                     | Leck sensibler URL-Pfade an Drittseiten über den `Referer`-Header                   | `origin-when-cross-origin`                               |
| `Cross-Origin-Opener-Policy` (COOP)   | Cross-Origin-`window.opener`-Zugriff von Popups/Tabs                                | `same-origin`                                            |
| `Cross-Origin-Resource-Policy` (CORP) | Einbettung dieser Responses durch fremde Origins via `no-cors` (`<img>`/`<script>`) | `same-origin`                                            |
| `Permissions-Policy`                  | Zugriff auf Browser-Features, die die App nicht nutzt                               | 21 Direktiven, siehe Abschnitt 3                         |

---

## 2 — Neue-Projekt-Checkliste (3 Schritte)

```
[ ] 1. Vor COOP=same-origin prüfen: nutzt ein OAuth-Flow window.opener (Popup-Flow)?
       Falls ja, bricht COOP diesen Flow. Hier unkritisch, weil Google-Sign-in per
       vollem Seiten-Redirect läuft (kein Popup).
[ ] 2. Permissions-Policy NICHT pauschal aus einer Vorlage kopieren — jede Direktive
       gegen echte Feature-Nutzung im Code grep-verifizieren, bevor sie verweigert wird
       (sonst bricht man z. B. Clipboard-Copy oder WebAuthn im eigenen Projekt).
[ ] 3. HSTS preload erst aktivieren, wenn HTTPS auf ALLEN Subdomains dauerhaft
       funktioniert — ein HSTS-Preload-Eintrag ist praktisch nicht kurzfristig rückgängig
       zu machen (Browser-Listen werden monatelang gecacht).
```

---

## 3 — Permissions-Policy: Grep-verifizierte Direktiven

```typescript
response.headers.set(
  'Permissions-Policy',
  'camera=(), microphone=(self), geolocation=(), payment=(), usb=(), fullscreen=(), ' +
    'gamepad=(), hid=(), serial=(), midi=(), magnetometer=(), gyroscope=(), accelerometer=(), ' +
    'display-capture=(), screen-wake-lock=(), xr-spatial-tracking=(), interest-cohort=(), ' +
    'browsing-topics=(), clipboard-write=(self), publickey-credentials-get=(self), ' +
    'publickey-credentials-create=(self)',
);
```

| Feature                                                                                                                    | Erlaubt für `self`? | Begründung (grep-verifiziert 2026-08-28)                                                                                       |
| :------------------------------------------------------------------------------------------------------------------------- | :-----------------: | :----------------------------------------------------------------------------------------------------------------------------- |
| `microphone`                                                                                                               |         Ja          | Guide-Sprachsteuerung, `src/lib/casino/voice-audio.ts`                                                                         |
| `clipboard-write`                                                                                                          |         Ja          | Copy-to-Clipboard in ~7 Komponenten (Referral-Codes, Deposit-Adresse, MFA-Secret, Bet-Belege)                                  |
| `publickey-credentials-get`/`-create`                                                                                      |         Ja          | WebAuthn-Passkeys via Supabase `experimental.passkey` ([`docs/auth/01_passkeys_webauthn.md`](../auth/01_passkeys_webauthn.md)) |
| Alle übrigen (Kamera, Geolocation, USB, Fullscreen, Gamepad, HID, Serial, MIDI, Sensoren, Screen-Capture, XR, FLoC/Topics) |        Nein         | 0 Codepfad-Treffer bei der Verifikation — bewusst verweigert statt „sicherheitshalber offen gelassen“                          |

**Warum das die gründlichste Einzelmaßnahme der zehn Säulen ist:** Die naive Alternative wäre, alles pauschal auf `()` zu setzen ohne zu prüfen, ob ein Feature aktiv gebraucht wird — das hätte hier stillschweigend Clipboard-Copy und Passkeys gebrochen. Stattdessen wurde jede Direktive einzeln gegen den tatsächlichen Code gegrept, bevor sie verweigert wurde.

---

## 4 — Sicherheits-Grenzen & Ehrliche Einschätzung

- **COOP-Annahme ist an einen konkreten Flow gebunden:** `same-origin` ist nur sicher, weil Google-Sign-in per `redirectTo`-Vollseiten-Flow läuft, nicht per Popup (`window.open`). Ein künftiges Popup-basiertes OAuth-Feature (z. B. ein zweiter Provider) würde diese Annahme brechen und müsste die COOP-Policy neu bewerten — nicht blind auf `unsafe-none` zurücksetzen.
- **HSTS-Preload ist bereits aktiv, aber nicht durch eigene Ingenieursleistung:** Siehe [`10_security_txt_hsts_preload.md`](./10_security_txt_hsts_preload.md) — die `.app`-TLD erzwingt HTTPS/HSTS unabhängig von diesem Header.
- **Live-Deploy-Stand unklar (siehe `00_SECURITY_OVERVIEW.md`):** Committed auf `main`, Produktionsverifikation (`curl -I`) nicht Teil dieser Dokumentationsaufgabe.

---

## 5 — Tests & Verifikation

Regressionsschutz besteht heute auf zwei Ebenen (`src/lib/security/__tests__/proxy-security-headers.test.ts`):

1. Source-String-Match gegen `src/proxy.ts` für jede `res.headers.set(...)`-Zeile.
2. Runtime-Test, der `applyBaselineSecurityHeaders()` gegen ein echtes `NextResponse`-Objekt aufruft und jeden Header-Wert per `response.headers.get(...)` prüft — deckt auch COOP, CORP und `X-Permitted-Cross-Domain-Policies` ab, nicht nur die ursprünglichen sieben.
3. Grep gegen `src/` für jede Permissions-Policy-Direktive (siehe Tabelle oben, Stand 2026-08-28).
4. Manuelle `curl -I`-Prüfung nach Deploy (siehe [`00_SECURITY_OVERVIEW.md`](00_SECURITY_OVERVIEW.md) „Definition of Done“) sowie der wöchentliche, nicht-blockierende `security-headers-drift-check.yml`-Workflow (`.github/workflows/`) gegen `PRODUCTION_URL`.

---

## 6 — COEP-`credentialless`-Entscheidungsgrundlage (für Jans künftige K5-Entscheidung)

> **Status:** COEP ist aktuell **nicht gesetzt** (weder `require-corp` noch `credentialless`). Dieser Abschnitt aktiviert nichts — er bereitet Jans Entscheidung vor, wenn er `Cross-Origin-Embedder-Policy` einführen will (typischerweise, um `crossOriginIsolated` für `SharedArrayBuffer`/hochauflösende Timer freizuschalten).

**Der historische Blocker war `require-corp`:** Mit `Cross-Origin-Embedder-Policy: require-corp` muss jede eingebettete Cross-Origin-Ressource (Bilder, Scripts, Fonts) selbst einen `Cross-Origin-Resource-Policy`-Header mitbringen, sonst blockiert der Browser das Laden. Drittanbieter, die dieses Projekt nicht kontrolliert, könnten diesen Header nicht liefern.

**Codebase-Verifikation (grep-verifiziert, aktueller Stand):** Alle Cross-Origin-Bildquellen in der App laufen über einfache `<img>`-Tags ohne `crossorigin`-Attribut und ohne Credentials (keine Cookies/Auth-Header an die Drittanbieter-Domain):

| Quelle                                      | Fundstelle(n)                                                                                                                                                           |
| :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.dicebear.com` (Avatare)                | `src/components/home/HeroSection.tsx:30,37,44,51,386`, `src/components/home/HeroSectionV2.tsx:111,145,152,159,166`, `src/components/home/DailyTournamentTeaser.tsx:136` |
| `cryptologos.cc` (Krypto-Icons)             | `src/components/home/HeroSection.tsx:291,299,307`                                                                                                                       |
| `www.gstatic.com` (Google-Logo, Onboarding) | `src/components/layout/OnboardingFlow.tsx:245`                                                                                                                          |

**Warum `credentialless` den Blocker wahrscheinlich entkräftet:** `Cross-Origin-Embedder-Policy: credentialless` verlangt für `no-cors`-Requests (wie ein einfaches `<img src="...">` ohne `crossorigin`-Attribut) **keinen** `Cross-Origin-Resource-Policy`-Header vom Drittanbieter — der Browser lädt die Ressource, entfernt dabei aber automatisch Credentials (Cookies) aus dem Request. Da keine der drei oben verifizierten Quellen Credentials benötigt (öffentliche, unauthentifizierte Asset-Endpunkte), verliert die App durch das Credential-Stripping keine Funktionalität.

**Browser-Support (Stand dieser Recherche):** Chrome/Edge seit 2021 (Chromium 96), Firefox seit 2023 (Version 117), Safari seit März 2024 (Safari 17.4) — für dieses Projekt praktisch flächendeckend nutzbar.

**Was diese Recherche nicht beantwortet (bleibt bei Jan):**

- Ob `crossOriginIsolated` (der eigentliche Nutzen von COEP) für ein konkretes Feature gebraucht wird — aktuell kein bekannter `SharedArrayBuffer`- oder High-Resolution-Timer-Bedarf im Repo.
- Ob künftige, noch nicht existierende Cross-Origin-Einbettungen (z. B. ein neues Drittanbieter-Widget) `credentialless`-kompatibel bleiben — bei jeder neuen Cross-Origin-Ressource erneut prüfen, ob sie Credentials braucht.
- Die COEP-Aktivierung selbst (`res.headers.set('Cross-Origin-Embedder-Policy', 'credentialless')` in `applyBaselineSecurityHeaders()`, `src/proxy.ts`) — bewusst nicht Teil dieser Doku-Runde, siehe `T_SECURITY_HARDENING/05_header_vollstaendigkeit.md` §0.
