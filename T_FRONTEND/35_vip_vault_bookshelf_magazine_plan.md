# 35 — VIP Vault: Dreidimensionales Bookshelf Magazin (Obsidian & Gold)

> **Status:** In Execution · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Veredelung der VIP-Tier-Vorteile auf der Vault-Seite (`src/app/vault/page.tsx`) durch ein rotierendes, dreidimensionales Luxus-Bücherregal (`newsletter-bookshelf`), bei dem jedes VIP-Buch ein Mitgliedsbuch (Bronze bis Obsidian) mit haptischen Vorteilsseiten darstellt.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 50 %)

| # | Subkategorie | Niveau | Befund & Beleg (Datei / Test) | Bottleneck? | Action Item |
|---|---|---|---|:---:|---|
| 01 | VIP-Exklusivität & Haptik | Top 65 % | Flache Kacheln (`VaultTierShowcase`) wirken wie Standard-SaaS-Preistabellen statt Club-Bücher. | 🔴 JA | 3D-Buchrücken mit Goldprägung und Tiefenwirkung, die sich bei Auswahl nach vorne neigen. |
| 02 | Buchdeckel- & Seiten-Motion | Top 75 % | Kein haptisches Umblättern oder Aufklappen von Club-Vorteilen. | 🔴 JA | Framer Motion 3D-Fold-Animation beim Aufklappen der Rakeback- und Bonusdetails. |
| 03 | Status-Synchronisation | Top 25 % | `currentTier` und `vipTiers` sind im Store vollständig typisiert. | Nein | Aktiver Rang des Spielers ist automatisch als aufgeschlagenes Buch zentriert. |
| 04 | Barrierefreiheit & Lesbarkeit | Top 30 % | Vorteilstexte müssen auch ohne 3D voll lesbar bleiben. | Nein | Klare semantische Datenstruktur mit Tastatur-Fokussierbarkeit. |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|:---:|---|
| **L0** | Baseline & Snapshot | `src/app/vault/page.tsx` | 🔴 Geplant | LLM | Lint & Typecheck fehlerfrei |
| **L1** | Kernkomponente mit Motion-Physik | `src/app/vault/page.tsx` | 🔴 Geplant | LLM | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente | `src/app/vault/page.tsx` | 🔴 Geplant | LLM | State, Navigation & UI-Event-Fluss intakt |
| **L3** | Responsive & Performance-Tuning | `src/app/vault/page.tsx` | 🔴 Geplant | LLM | 60+ FPS Test & Mobile Fallback |
| **L4** | Verifikation & 5-Stufen-DoD | Lokale Test-Suite | 🔴 Geplant | LLM | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade
- Ziel-Datei: [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshots: [`docs/frontend/screenshots/13_weakness_newsletter_bookshelf.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/13_weakness_newsletter_bookshelf.png)
- Componentry-Referenz: [35 — VIP Vault: Dreidimensionales Bookshelf Magazin (Obsidian & Gold)](https://componentry.dev/docs/components/newsletter-bookshelf)

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
- **Ziel:** Erstellung von `src/components/casino/vault/VipBookshelfShowcase.tsx` mit 3D-CSS-Perspektive.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente
- **Ziel:** Ersatz bzw. Ergänzung von `VaultTierShowcase` in `src/app/vault/page.tsx`.
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
