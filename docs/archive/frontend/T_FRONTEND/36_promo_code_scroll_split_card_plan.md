# 36 — Promo-Code Einlösung: Faltbare Scroll Split Card (Obsidian & Gold)

> **Status:** Completed & Archived · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Ersetzung des simplen Gutschein-Inputfelds in `src/components/casino/vault/VaultRedeemCard.tsx` durch eine 3-teilige faltbare Spalt-Karte (`scroll-split-card`), die sich bei Code-Eingabe und Validierung wie ein exklusiver Gold-Gutschein entfaltet.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 55 %)

| #   | Subkategorie                  | Niveau   | Befund & Beleg (Datei / Test)                                                  | Bottleneck? | Action Item                                                                               |
| --- | ----------------------------- | -------- | ------------------------------------------------------------------------------ | :---------: | ----------------------------------------------------------------------------------------- |
| 01  | Belohnungs-Inszenierung       | Top 70 % | Schlichtes graues HTML-Inputfeld mit GO-Button ohne festlichen VIP-Charakter.  |    🔴 JA    | 3-teiliges Klapp-Zertifikat mit Goldsiegel, das bei erfolgreichem Redeem aufspringt.      |
| 02  | Falt-Mechanik & Spring-Physik | Top 65 % | Reine lineare Button-Ladezustände ohne haptische Rückmeldung.                  |    🔴 JA    | Framer Motion 3D-Rotationswinkel (`rotateX: 180deg`) für oberen und unteren Kartenflügel. |
| 03  | Sicherheit & Validierung      | Top 10 % | Gutscheinprüfung läuft strikt fail-closed über Supabase-RPC und Rate-Limiting. |    Nein     | Bestehende `handleRedeem`-Logik und Security-Guards 1:1 beibehalten.                      |
| 04  | Audio-Begleitung              | Top 25 % | Soundeffekte im Casino vorhanden.                                              |    Nein     | Entfaltungs-Animation mit dezentem mechanischem Papier-/Tresor-Klick untermalen.          |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                                   | Status      | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | ------------------------------------------------- | ----------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/casino/vault/VaultRedeemCard.tsx` | 🟢 Erledigt |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/casino/vault/VaultRedeemCard.tsx` | 🟢 Erledigt |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/casino/vault/VaultRedeemCard.tsx` | 🟢 Erledigt |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/casino/vault/VaultRedeemCard.tsx` | 🟢 Erledigt |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                                 | 🟢 Erledigt |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/components/casino/vault/VaultRedeemCard.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/vault/VaultRedeemCard.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshots: [`docs/frontend/screenshots/14_weakness_promo_split_card.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/14_weakness_promo_split_card.png)
- Componentry-Referenz: [36 — Promo-Code Einlösung: Faltbare Scroll Split Card (Obsidian & Gold)](https://componentry.dev/docs/components/scroll-split-card)

### 3.2 Systemregeln & Invarianten

- **Design-System:** Obsidian (`#0B0E14`), Gold (`#D4AF37`), feiner Rand (`rgba(212, 175, 55, 0.2)`), Glass-Blur (`backdrop-filter: blur(20px)`).
- **Zero-Wallet-Autorität:** Keine State-Mutationen von Finanzwerten; reine UI-/Motion-Schicht.
- **Fail-Closed & Stabilität:** Keine Runtime-Crashes bei WebGL-/Canvas-Ausfall; elegante Fallbacks.

### 3.3 Nicht-Scope (Ausdrücklich verboten)

- Keine Änderungen an Backend-Routen oder Auth-Flows.
- Keine Mutationen von Bet-Logik oder Supabase-RPCs.
- Keine Zerstörung von bestehenden barrierefreien Attributen (`aria-*`).

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: Kernkomponente

- **Ziel:** Entwicklung von `src/components/casino/vault/PromoSplitCard.tsx` mit Faltkanten und Goldprägung.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Austausch in `VaultRedeemCard.tsx` unter Beibehaltung aller Props und Callbacks.
- **Schritte:**
  1. Nahtlose Einbettung in die Host-Datei unter Beibehaltung aller Callbacks.
  2. Prüfung von Active-States und Viewport-Skalierung.
- **Abbruchkriterium:** Layout-Shift oder funktionale Regressionen bestehender Features.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm test` — Alle bestehenden Tests laufen grün.
3. `npm run lint` — Keine neuen ESLint-Warnungen/Fehler.
4. `npm run build` — Next.js Production Build erfolgreich.
5. Visuelle Prüfung via Playwright Screenshot.
