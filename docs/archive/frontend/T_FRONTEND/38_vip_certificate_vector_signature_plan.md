# 38 — VIP Rangaufstieg: Animierte Gold-Signatur VIP-Urkunde (Obsidian & Gold)

> **Status:** Completed & Archived · **Stand:** 2026-09-10 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Erweiterung des VIP-Rang-Modals in `src/components/casino/RankBenefitsModal.tsx` um eine feierliche Royal Obsidian VIP-Urkunde mit animiertem Vektor-Unterschriftszug in flüssigem Gold (`signature`).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 50 %)

| #   | Subkategorie              | Niveau   | Befund & Beleg (Datei / Test)                                                   | Bottleneck? | Action Item                                                                               |
| --- | ------------------------- | -------- | ------------------------------------------------------------------------------- | :---------: | ----------------------------------------------------------------------------------------- |
| 01  | Feierlicher VIP-Abschluss | Top 70 % | Rangaufstiege wirken wie ein einfacher Dialog ohne bleibenden emotionalen Wert. |    🔴 JA    | VIP-Urkunde mit animierter handschriftlicher Signatur („Casino Royale Master of Tables“). |
| 02  | SVG-Pfad-Zeichenanimation | Top 60 % | Standard-Fades statt lebendiger Strichführung.                                  |    🔴 JA    | Framer Motion `pathLength: [0, 1]` mit dynamischem Gold-Gradient-Stroke.                  |
| 03  | Rang-Dynamik              | Top 25 % | Aktueller Rang und Fortschritt sind im Store vorhanden.                         |    Nein     | Urkunde passt Wappen, Titel und Siegel automatisch an den Spieler-Rang an.                |
| 04  | Modal-Performance         | Top 20 % | Modal schließt sauber bei Backdrop-Klick.                                       |    Nein     | Leichtes SVG ohne externe Vektor-Bibliotheken.                                            |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                      | Scope (Dateien)                               | Status      | Zuständigkeit | Verifikation                               |
| ------ | -------------------------------- | --------------------------------------------- | ----------- | :-----------: | ------------------------------------------ |
| **L0** | Baseline & Snapshot              | `src/components/casino/RankBenefitsModal.tsx` | 🟢 Erledigt |      LLM      | Lint & Typecheck fehlerfrei                |
| **L1** | Kernkomponente mit Motion-Physik | `src/components/casino/RankBenefitsModal.tsx` | 🟢 Erledigt |      LLM      | Isolierte Motion & Interaktivitäts-Prüfung |
| **L2** | Integration in Host-Komponente   | `src/components/casino/RankBenefitsModal.tsx` | 🟢 Erledigt |      LLM      | State, Navigation & UI-Event-Fluss intakt  |
| **L3** | Responsive & Performance-Tuning  | `src/components/casino/RankBenefitsModal.tsx` | 🟢 Erledigt |      LLM      | 60+ FPS Test & Mobile Fallback             |
| **L4** | Verifikation & 5-Stufen-DoD      | Lokale Test-Suite                             | 🟢 Erledigt |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/components/casino/RankBenefitsModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/RankBenefitsModal.tsx)
- Design-Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts), [`src/lib/design/motion-tokens.ts`](file:///v:/VibeCoding/Casino/src/lib/design/motion-tokens.ts)
- Screenshots: [`docs/frontend/screenshots/16_weakness_vip_certificate.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/16_weakness_vip_certificate.png)
- Componentry-Referenz: [38 — VIP Rangaufstieg: Animierte Gold-Signatur VIP-Urkunde (Obsidian & Gold)](https://componentry.dev/docs/components/signature)

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

- **Ziel:** Implementierung von `src/components/casino/vip/GoldVectorSignature.tsx`.
- **Schritte:**
  1. Erstellung der dedizierten Motion-/Canvas-Komponente mit Spring-Physik.
  2. Saubere Typisierung aller Props und Event-Callbacks.
  3. Dämpfung über Framer Motion Spring-Tokens (`stiffness: 400, damping: 28`).
- **Abbruchkriterium:** FPS-Drops unter 60 FPS bei kontinuierlicher Interaktion.

### Meilenstein L2: Verdrahtung in Host-Komponente

- **Ziel:** Integration als feierliches Zertifikat im `RankBenefitsModal.tsx`.
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
