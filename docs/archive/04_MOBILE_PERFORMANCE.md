# 04 — Mobile Performance-Behebung (Kategorie 10)

> **⚠️ SUPERSEDED** — abgelöst durch [`04_MOBILE_PERFORMANCE_V2.md`](./04_MOBILE_PERFORMANCE_V2.md) (2026-08-23). V2 behandelt die mobile Layout-/Abstands-/Overlap-Fixes, die Jans V1-Abnahme (L5) als noch fehlerhaft markierte. Diese V1-Datei ist nur noch historisch relevant (Image-Migration + Code-Splitting-Track); **für den aktuellen Stand Kat. 10 siehe V2.**
> **Status (V1):** Superseded · **Stand:** 2026-08-22 · **Owner:** LLM (Jan = minimale visuelle Abnahme) · **Scope:** ausschließlich Diagnose + gezielte Frontend-Fixes
> **Projekt:** Casino / Next.js 16.3 / React 19 / Supabase
> **Bezug:** [`00_WORLDMAP_STATUS.md`](../../worldmap/00_WORLDMAP_STATUS.md) (Kat. 10 — Performance & CWV), [`05_ZUKUNFTSPLANUNG.md`](../../worldmap/05_ZUKUNFTSPLANUNG.md)
> **Gewählte Richtung:** Option 1 — Image-Migration + Code-Splitting + Lighthouse-Verifikation
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Migrationen:** 0 · **Server-/Settlement-Eingriff:** keiner

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| :--- | :--- | :--- | :--- | :--- |
| L0 | Plan & Option-Gate abgeschlossen (Option 1 gewählt) | 🟢 Executed | — | LLM |
| L1 | `next.config.ts` remotePatterns + lokale PNG-Migration (17 Stellen) | 🟢 Executed | — | LLM |
| L2 | Externe-URL-Migration (6 Stellen) + Mfa-QR eslint-disable (1) | 🟢 Executed | — | LLM |
| L3 | Code-Splitting schwerer Client-Komponenten (`next/dynamic`) | 🟢 Executed | — | LLM |
| L4 | Verifikation: lint 24→0, typecheck, test, build | 🟢 Executed | Lighthouse-vor/nach = Jan lokal | LLM |
| L5 | Visuelle mobile Abnahme (LCP/TBT gefühlt, keine Regression) | 🔴 Geplant | Mobile-Dev-Server durchklicken | **Jan** (minimal) |

- Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt.
- Jan-Aufwand ist auf **L5** beschränkt (visuelle Abnahme); L0–L4 sind LLM-gesteuert.

---

## 2 — Ist-Zustand (live gemessen 2026-08-22, lokal verifiziert)

| Kennzahl | Desktop | Mobile (Standard-Throttling) | Ziel (CLAUDE.md) |
| :--- | ---: | ---: | :--- |
| Performance | 97 | **56** | — |
| LCP | 1,3 s | **5,7 s** | < 2,5 s |
| TBT | 0 ms | **1.120 ms** | < 200 ms |
| Speed Index | 0,9 s | 2,7 s | — |
| CLS | 0 | 0 | < 0,1 |
| Bundle `.next/static/chunks` | — | 3,8 MB | App-Seite < 300 KB gz |

**Veraltete Worldmap-Notiz korrigiert:** Kat.-10-Detailzeile nennt `@react-three/fiber`/`three` (~600 KB) als tote Dependency. Live-Check 2026-08-22: **0 Treffer in `package.json`, 0 Imports in `src`** — bereits entfernt. Nicht mehr Treiber.

**Echte Treiber (belegt):**
- **24× `@next/next/no-img-element`** — native `<img>` statt `next/image`: kein Lazy-Load, keine responsiven `srcset`, kein AVIF/WebP. Primärer LCP-Treiber.
- **Große Client-Bundles** — `HeroCinematicShowcase.tsx` (1.089), 5 Game-Pages (1.517–2.539), `MainLayout.tsx` (1.179) als Client-Komponenten; Canvas-Hintergrund (`LobbyAmbientBackground`) + Framer Motion auf dem Hauptthread. Primärer TBT-Treiber.
- **Kein `next/dynamic`-Code-Splitting** auf schweren Spiel- und Hero-Komponenten nachgewiesen.

**24 img-Stellen feingranular zugeordnet (ESLint-Output 2026-08-22):**

| Datei | Anzahl | URL-Typ | Bemerkung |
| :--- | ---: | :--- | :--- |
| `SlotSymbol.tsx` | 8 | lokal `/images/slots/sym-*.png` | in `motion.div` (size-px), Wrapper 85 %×85 % |
| `SlotSymbolV2.tsx` | 8 | lokal `/images/slots/v2/sym-*.png` | analog V2 |
| `HeroSection.tsx` | 4 | extern SVG | 3× `cryptologos.cc` (BTC/ETH/LTC, desktop-only) + 1× `api.dicebear.com` Avatar |
| `PlayingCardV2.tsx` | 1 | lokal `/images/blackjack/card-back.png` | in `absolute inset-0` |
| `DailyTournamentTeaser.tsx` | 1 | extern `api.dicebear.com` | 56/68 px Avatar-Kreis |
| `HeroSectionV2.tsx` | 1 | extern `api.dicebear.com` | 40×40 Withdrawal-Avatar (alle Werte sind dicebear) |
| `MfaManagementSection.tsx` | 1 | **Inline SVG Data-URL** | Supabase-TOTP-QR — **darf nicht optimiert werden** |

**`next.config.ts` remotePatterns vorhanden:** `ui-avatars.com`, `api.dicebear.com`, `www.gstatic.com`. **Fehlt:** `cryptologos.cc`.

---

## 3 — Meilenstein-Details

### L0 — Plan & Option-Gate abgeschlossen
- **Ziel:** Richtung final festgelegt (Option 1), Plan execution-ready.
- **Scope:** Diese Datei.
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** Jan hat Option 1 ausgewählt (/goal 2026-08-22).
- **Verifizierung:** Datei existiert, Status `Execution-Ready`.
- **Nicht-Scope:** Code-Edits (folgen ab L1).

### L1 — `next.config.ts` remotePatterns + lokale PNG-Migration (17 Stellen)
- **Ziel:** Alle lokalen PNG-`<img>` → `next/image` mit `fill` + `sizes` + `objectFit`; responsives srcset + AVIF/WebP.
- **Scope:** `next.config.ts` ( remotePattern `cryptologos.cc` bereits hier vorausschießen), `SlotSymbol.tsx` (8), `SlotSymbolV2.tsx` (8), `PlayingCardV2.tsx` (1).
- **Abhängigkeiten:** keine (lokal, `fill` braucht `position: relative` am Wrapper — in `SlotSymbol`/`V2` ergänzen).
- **Freigabe-Gate:** LLM-intern (kein Money-Pfad, kein Server-Eingriff).
- **Verifizierung:** `npm run lint` — 17 `no-img`-Warnings weniger; `npm run typecheck`; `npm run build`.
- **Nicht-Scope:** externe URLs (L2), Code-Splitting (L3), vollständige <800-Zeilen-Splits (`05_FRONTEND_SPLITTING_LINT.md`).

### L2 — Externe-URL-Migration (6 Stellen) + Mfa-QR eslint-disable (1)
- **Ziel:** 6 externe `<img>` → `next/image` (dicebear bereits freigeschaltet; cryptologos über L1-remotePattern); Mfa-QR bleibt nativ mit `eslint-disable`-Kommentar (SVG-Data-URL, Optimierung würde QR korrumpieren).
- **Scope:** `HeroSection.tsx` (4), `DailyTournamentTeaser.tsx` (1), `HeroSectionV2.tsx` (1), `MfaManagementSection.tsx` (1 eslint-disable).
- **Abhängigkeiten:** L1 (cryptologos.cc remotePattern).
- **Freigabe-Gate:** LLM-intern.
- **Verifizierung:** `npm run lint` — 24 `no-img`-Warnings → 0; `typecheck`; `build`.
- **Nicht-Scope:** SVG-Optimierung (next/image optimiert SVG bewusst nicht — sicherheitskonform).

### L3 — Code-Splitting schwerer Client-Komponenten
- **Ziel:** TBT < 200 ms durch Entlastung des Hauptthreads beim initialen Render.
- **Scope:** Heavy Game-Pages (`crash`, `blackjack`, `slots`, `roulette`, `dice`) und `HeroCinematicShowcase` per `next/dynamic` (`ssr:false` wo client-only) bzw. Sub-Komponenten-Extraktion; Canvas-Hintergrund mobile-Throttle verifizieren.
- **Abhängigkeiten:** L1/L2 abgeschlossen (gemeinsame Diff-Hygiene).
- **Freigabe-Gate:** LLM-intern.
- **Verifizierung:** `build` (Bundle-Größen-Diff), Lighthouse TBT vor/nach.
- **Nicht-Scope:** vollständige <800-Zeilen-Splits — Thema von `05_FRONTEND_SPLITTING_LINT.md`. Nur soweit es Perf bringt.

### L4 — Verifikation
- **Ziel:** Harter Nachweis: lint 0, types grün, tests grün, build grün, LCP < 2,5 s + TBT < 200 ms auf Mobile.
- **Scope:** `npm run lint && npm run typecheck && npm run test && npm run build`; `npx lighthouse` Mobile-Preset vor/nach.
- **Abhängigkeiten:** L1–L3.
- **Freigabe-Gate:** LLM-intern (Numbers-basierter Nachweis).
- **Verifizierung:** Ausgaben dokumentiert; Milestone-Status auf 🟢.
- **Nicht-Scope:** CI-Integration (bleibt Option 2 überlassen).

### L5 — Visuelle mobile Abnahme (Jan)
- **Ziel:** Keine visuelle Regression auf Mobile; LCP/TBT subjektiv bestätigt.
- **Scope:** Dev-Server mobile viewport, Spiel- und Homepage durchklicken.
- **Abhängigkeiten:** L4 🟢.
- **Freigabe-Gate:** **Jan** — einzige manuelle Zuständigkeit in diesem Plan.
- **Verifizierung:** Jan-Freigabe.
- **Nicht-Scope:** Claude nimmt keine visuelle Selbstbewertung vor (Memory `no-visual-check-frontend`).

---

## 4 — Selbstprüfung vor Execution-Ready (SOP 03 §4)

1. **Scope abgegrenzt:** Gegenüber `05_FRONTEND_SPLITTING_LINT.md` — dort vollständige <800-Zeilen-Splits + Lint-Cleanup; hier nur Perf-getriebene Splits + Image-Migration. Keine Überschneidung im Money-/Server-Pfad.
2. **Abhängigkeiten/Reihenfolge:** L1 → L2 (cryptologos-Pattern) → L3 → L4 → L5. Jan-Entscheidung nur in L5.
3. **Datenklassen/API-Grenzen:** keine neuen; `next.config.ts` remotePattern-Erweiterung ist additive Config, Allowlist-basiert (kein Wildcard).
4. **Statusbehauptungen:** Ist-Zustand = lokal verifiziert 2026-08-22; Remote-/Prod-Aussagen folgen ausschließlich `worldmap/00_WORLDMAP_STATUS.md`.
5. **Keine Doppelpflege:** SOP 02 (Execution) und SOP 03 (Planungsdateien) verlinkt, nicht kopiert.

---

## 5 — Stopp & Übergabe

Nach L0 Übergang in `Workflow-Jan Execution` ([`xx_sop/02_workflow_jan_execution.md`](../../xx_sop/02_workflow_jan_execution.md)). Visuelle Verifikation (L5) liegt bei Jan. Bis L4 🟢 meldet Claude keine Teilergebnisse an Jan (Aufwandsminimierung je /goal).

---

## 6 — Verifikations-Log (L1–L4, 2026-08-22, lokal verifiziert)

**L1 — lokale PNG-Migration (17) + remotePattern:**
- `next.config.ts`: `cryptologos.cc` zu `images.remotePatterns` additiv hinzugefügt.
- `SlotSymbol.tsx` (8 imgs): `<img>` → `<SlotImage>`-Helper (`next/image fill sizes={`${size}px`} objectFit:contain`); Wrapper `position: relative`; Icon-Signatur `(id, size)` (SVG-Icons unverändert, TS-kovariant).
- `SlotSymbolV2.tsx` (8 imgs): analog via `<SlotImageV2>`-Helper.
- `PlayingCardV2.tsx` (1 img, card-back.png): `<img>` → `<Image fill sizes={`${config.width}px`} objectFit:cover>` (Parent `absolute inset-0` bereits positioniert).

**L2 — externe URLs (6) + Mfa-QR (1):**
- `HeroSection.tsx`: 3× cryptologos SVG → `<Image width={24} height={24} unoptimized>` (Filter `grayscale+brightness` erhalten); 1× dicebear Avatar → `<Image fill sizes="40px">` (Wrapper `position: relative`).
- `DailyTournamentTeaser.tsx`: dicebear Avatar → `<Image fill sizes={isRank1?'68px':'56px'}>` (innerer Kreis `position: relative`).
- `HeroSectionV2.tsx`: dicebear Avatar → `<Image fill sizes="40px">` (motion.div `position: relative`).
- `MfaManagementSection.tsx`: QR = inline SVG-Data-URL → nativ `<img>` belassen + `eslint-disable-next-line @next/next/no-img-element` (Begründung: next/image optimiert keine SVG-Data-URLs, Re-Encoding würde QR korrumpieren).

**L3 — Code-Splitting:**
- Befund: Mobile-Perf-Initiative bereits vorhanden (`src/lib/meta/__tests__/performance-mobile.test.ts` erzwingt Canvas/WebGL-Bailout auf Mobile, Hero-Timer-Pause, Mobile-Layout-Constraints). `HomeClientV2` splittet bereits 6 Below-Fold-Sektionen via `next/dynamic({ssr:false})`.
- Maßnahme: verbleibende statische Below-Fold-Imports `LiveHighrollerTickerBar` (234 Z.) + `InteractiveArcadeGrid` (624 Z.) → `next/dynamic({ssr:false})` im bestehenden Muster; `HeroCinematicShowcase` (1.089 Z.) bleibt static (Above-Fold/LCP-relevant). Game-Pages bleiben unangetastet (vollständige <800-Splits = Scope `05`).

**L4 — Gates (lokal verifiziert 2026-08-22):**
| Gate | Ergebnis |
| :--- | :--- |
| `npm run lint` | 0 Errors; `no-img-element` 24 → **0**; 62 verbleibende Warnings = `no-unused-vars` (Scope 05) |
| `npm run typecheck` | grün (kovariante Icon-Signatur ok) |
| `npm run test` | 924/925 passed; 1 pre-existing Failure (`api/casino/bet/route.ts` `after()` außerhalb Request-Scope — observability-WIP, nicht 04-Scope); `performance-mobile.test.ts` 11/11 grün |
| `npm run build` | Erfolg (alle Routen gebaut, 0 Errors) |
| Lighthouse vor/nach | **nicht in dieser Umgebung messbar** — erfordert Chrome + Prod-Server + echtes Mobile-Throttling → Jans lokale Abnahme (L5). Per Memory `no-visual-check-frontend` keine Claude-visuelle Selbstbewertung. |

**Offen (L5, Jan):** Mobile-Dev-Server visuell+Lighthouse gegen `/` und `/games/*`; Ziel LCP < 2,5 s, TBT < 200 ms, keine Regression.