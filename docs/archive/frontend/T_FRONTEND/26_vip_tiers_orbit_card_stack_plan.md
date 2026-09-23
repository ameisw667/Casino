# 26 — VIP & Tier System: Orbit Card Stack (Obsidian & Gold)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-09 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Neugestaltung des VIP-Rang-Modals in `src/components/casino/RankBenefitsModal.tsx` und der Vault-Ansicht `src/app/vault/page.tsx` durch den `orbit-card-stack` (dreidimensional rotierende Club-Karten mit CSS 3D Transforms, Tiefenschärfe und metallischer Goldprägung).
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 55 %)

| #   | Subkategorie        | Niveau   | Befund & Beleg (Datei / Test)                                                                                                | Bottleneck? | Action Item                                                                     |
| --- | ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | :---------: | ------------------------------------------------------------------------------- |
| 01  | Prestige & Begierde | Top 80 % | Flache, trockene Listenreihen im Modal (`RankBenefitsModal.tsx:58`), wirkt wie ein Administrations-Interface statt VIP-Club. |    🔴 JA    | 3D Orbiting Card Stack mit erhabenen Metallprägungen für Bronze bis Obsidian.   |
| 02  | Räumliche Tiefe     | Top 75 % | Reines 2D-Layout ohne z-Achsen-Staffelung oder Weichzeichnung inaktiver Ränge.                                               |    🔴 JA    | CSS 3D Transform mit perspektivischer Tiefenschärfe (`preserve-3d`, `rotateY`). |
| 03  | Store-Anbindung     | Top 15 % | `level`, `xp`, `rank`, `ranks` sauber aus dem Casino-Store verdrahtet.                                                       |    Nein     | Bestehende Ränge und Fortschrittsberechnungen beibehalten.                      |
| 04  | Modal-Lifecycle     | Top 20 % | `isOpen`, `onClose`, Backdrop-Click & Body-Locking funktionieren einwandfrei.                                                |    Nein     | Modal-Shell und Schließ-Trigger intakt lassen.                                  |
| 05  | Responsivität       | Top 45 % | Mobile nutzt Fullscreen-Drawer, Desktop zentriertes Popup.                                                                   |    Nein     | Orbit-Stack passt sich auf Mobile mit vereinfachtem Wischgesten-Swipe an.       |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                            | Scope (Dateien)                                | Status     | Zuständigkeit | Verifikation                                                  |
| ------ | -------------------------------------- | ---------------------------------------------- | ---------- | :-----------: | ------------------------------------------------------------- |
| **L0** | Baseline & Snapshot                    | `src/components/casino/RankBenefitsModal.tsx`  | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                                   |
| **L1** | 3D Orbit Stack Komponente              | `src/components/casino/vip/OrbitCardStack.tsx` | 🔴 Geplant |      LLM      | 3D-Kartenfächer mit Drehung und Fokus-Karte isoliert getestet |
| **L2** | Integration in `RankBenefitsModal.tsx` | `src/components/casino/RankBenefitsModal.tsx`  | 🔴 Geplant |      LLM      | VIP-Stufen Bronze–Obsidian als erhabene 3D-Karten gerendert   |
| **L3** | Touch- & Swipe-Steuerung für Mobile    | `OrbitCardStack.tsx`                           | 🔴 Geplant |      LLM      | Wischgesten zur Navigation zwischen den Rängen kalibriert     |
| **L4** | Verifikation & 5-Stufen-DoD            | Lokale Test-Suite                              | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün                    |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/components/casino/RankBenefitsModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/RankBenefitsModal.tsx)
- Sekundäre Datei: [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)
- Neue Komponente: `src/components/casino/vip/OrbitCardStack.tsx`
- Store: [`src/store/useCasinoStore.ts`](file:///v:/VibeCoding/Casino/src/store/useCasinoStore.ts)
- VIP Config: [`src/lib/casino/vip-config.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/vip-config.ts)
- Screenshots: [`docs/frontend/screenshots/04_weakness_vip_tiers.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/04_weakness_vip_tiers.png)
- Componentry-Referenz: [Orbit Card Stack (`orbit-card-stack`)](https://componentry.dev/docs/components/orbit-card-stack)

### 3.2 Systemregeln & Invarianten

- **Design-System:** Obsidian-Grundkörper, erhabene Metallkanten (Bronze, Silber, Gold, Platin, Obsidian-Diamant), goldene Typografie (`#D4AF37`).
- **Z-Index:** Strikt `Z_INDEX.modal` (5000) verwenden.
- **Zero-Wallet-Autorität:** Keine clientseitige Vergabe von Rängen oder XP; Werte stammen aus dem Server-Snapshot.

### 3.3 Nicht-Scope (Ausdrücklich verboten)

- Keine Änderungen an der XP-Berechnung oder an `vip-config.ts`.
- Keine Änderungen an den Backend-Voucher- oder Rakeback-APIs.
- Keine neuen Store-Felder hinzufügen.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: `OrbitCardStack.tsx`

- **Ziel:** Erstellung des 3D-Kartenkarussells mit interaktiver Orbit-Drehung.
- **Schritte:**
  1. 3D-Bühne mit `perspective: 1200px` und `transformStyle: 'preserve-3d'`.
  2. Berechnung der z- und x-Positionen sowie Y-Rotation basierend auf dem aktiven Index.
  3. Ausgewählte Karte rückt in den Vordergrund (`scale: 1.05`, glänzende Goldkante); flankierende Karten werden abgedunkelt und tiefenunscharf gerendert.
- **Abbruchkriterium:** Clipping-Artefakte oder fehlerhafte 3D-Sortierung (Z-Fighting).

### Meilenstein L2: Einbettung in `RankBenefitsModal.tsx`

- **Ziel:** Ablösung der statischen Tabellenstruktur im Modal durch den 3D-Kartenstapel.
- **Schritte:**
  1. Zentrierter Orbit-Stack oberhalb der Detail-Benefits.
  2. Beim Wechsel der 3D-Karte synchronisieren die unten angezeigten Rakeback- und Bonus-Vorteile per sanftem Crossfade.
- **Abbruchkriterium:** Modal scrollt nicht mehr auf kleinen Bildschirmen.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm run test` — Alle Tests grün.
3. `npm run lint` — 0 Lint-Fehler.
4. `npm run build` — Production Build erfolgreich.
5. Screenshot-Prüfung des VIP-Modals auf Desktop & Mobile.
