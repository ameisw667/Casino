# 16 — IMG-06: Spieler-Avatare vereinheitlichen (Deterministischer Client-Resolver)

> **Status:** Umgesetzt (lokal verifiziert) · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Deterministischer Client-Resolver für Spieler-Avatare über alle aktiven Ansichten (Leaderboard, Vault, Bento) mit 4 lokalen Obsidian-Gold-Porträts und Initialen-Fallback.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-05. Typecheck, 1.532 Tests, Lint, Build und scoped Diff-Check erfolgreich.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                     |    Status    | Nächster Schritt                                                                                              | Zuständigkeit |
| :----: | :---------------------------------------------- | :----------: | :------------------------------------------------------------------------------------------------------------ | :-----------: |
| **L0** | Asset-Bereitstellung: 4 Obsidian-Gold-Porträts  | 🟢 Umgesetzt | Vier lokale Obsidian-Gold-Porträts liegen in `public/images/avatars/` vor                                     |      LLM      |
| **L1** | Resolver-Utility & Hashing (`player-avatar.ts`) | 🟢 Umgesetzt | Deterministischer djb2-Resolver mit lokalen Quellen, Initialen und Custom-URL-Priorität; zwei Unit-Tests grün |      LLM      |
| **L2** | Integration in Bento-Turnier & Vault-Profil     | 🟢 Umgesetzt | Beide Ansichten beziehen den lokalen Resolver statt DiceBear                                                  |      LLM      |
| **L3** | Integration in Leaderboard (Podium & Tabelle)   | 🟢 Umgesetzt | Podium (48/42 px), Tabelle (34 px) und persönliche Rangzeile (32 px) nutzen lokale Porträts                   |      LLM      |
| **L4** | Verifikation, Fallback-Test & Typecheck         | 🟢 Umgesetzt | Typecheck, 1.532 Tests, Lint, Build und scoped Diff-Check erfolgreich; Sichtprüfung folgt im Gesamt-QA        |      LLM      |

---

## 2 — Ziel, Scope & Nicht-Scope

### 2.1 Ziel

Vollständige visuelle Harmonisierung der Spieler-Avatare im dunklen Luxus-Stil (_Obsidian & Quantum Gold_). Beseitigung des Stilbruchs durch externe DiceBear-Vektor-Cartoons und generische graue Initialen-Kreise.

### 2.2 In Scope

- **Asset-Ablage:** 4 stilisierte Porträts (`avatar-obsidian-01.png` bis `04.png`) in `public/images/avatars/` (Master 1024×1024, optimiert für Web-Darstellung).
- **Zentraler Resolver:** `src/lib/casino/player-avatar.ts` mit Funktion `resolvePlayerAvatar(username, customUrl?)`.
- **Deterministische Zuordnung:** Derselbe Spielername erhält an allen Stellen der Anwendung stets denselben Avatar (via djb2- oder FNV-1a-Hash auf den Namensstring).
- **Robuster Fallback:** Schlägt das Laden eines Bildes fehl (`onError`), schaltet die jeweilige Komponente verzögerungsfrei auf das bewährte Monogramm/Initialen-Element zurück.
- **Aktive Komponenten:**
  1. [`src/components/home/bento/BentoStripCells.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoStripCells.tsx) (Ersatz der DiceBear-URL)
  2. [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx) / [`VaultProfileBanner.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/vault/VaultProfileBanner.tsx) (Ersatz des DiceBear-Fallbacks)
  3. [`src/components/leaderboard/LeaderboardPodium.tsx`](file:///v:/VibeCoding/Casino/src/components/leaderboard/LeaderboardPodium.tsx) (Anzeige des Porträts mit Gold-Ring)
  4. [`src/components/leaderboard/LeaderboardStreamTable.tsx`](file:///v:/VibeCoding/Casino/src/components/leaderboard/LeaderboardStreamTable.tsx) (Porträt in Tabellenzeilen)
  5. [`src/components/leaderboard/PersonalRankBar.tsx`](file:///v:/VibeCoding/Casino/src/components/leaderboard/PersonalRankBar.tsx) (User-Bar am Seitenende)

### 2.3 Nicht-Scope (Explizit ausgeschlossen)

- Keine Änderungen am Datenbankschema (keine Supabase-Migrationen).
- Kein interaktiver Avatar-Picker oder Profil-Editor (Option B wurde verworfen).
- Keine Vermischung mit den Royale-Guide-Personas (`math_strategist.jpg` etc. in `public/images/personas/` bleiben unberührt).
- Keine externen Bild-API-Aufrufe zur Laufzeit (0 Latenz, 100 % lokal ausgeliefert).

---

## 3 — Technische Spezifikation & Architektur

### 3.1 Resolver-Schnittstelle (`src/lib/casino/player-avatar.ts`)

```typescript
export interface PlayerAvatarResult {
  src: string;
  initials: string;
  isCustom: boolean;
}

export function resolvePlayerAvatar(
  username: string | null | undefined,
  customAvatarUrl?: string | null,
): PlayerAvatarResult;
```

- **Logik:**
  1. Falls `customAvatarUrl` vorhanden und valide -> `src = customAvatarUrl`, `isCustom = true`.
  2. Andernfalls: Hash-Berechnung über `(username || 'VIP').toLowerCase().trim()`.
  3. Modulo 4 -> Auswahl aus `/images/avatars/avatar-obsidian-01.png` bis `04.png`.
  4. `initials` liefert parallel das berechnete 2-Buchstaben-Monogramm für den Fallback.

### 3.2 Bildstil & Vorgaben

- **Farbwelt:** Obsidian-Hintergrund (`#0B0E14`), warme Goldreflexion (`#D4AF37`), dezenter Glanz.
- **Motiv:** 4 stilisierte, elegante Figuren (z. B. 2 weiblich, 2 männlich / maskiert / High-Roller-Silhouetten), zentriert mit Sicherheitsabstand für den 1:1 Rund-Crop (`border-radius: 50%`).
- **Größe:** Master 1024×1024 PNG, Web-Ausgabe komprimiert (unter 80 KB pro Asset).

---

## 4 — Meilensteine im Detail

### L0: Asset-Bereitstellung

- **Ziel:** 4 konsistente Porträts in `public/images/avatars/` anlegen.
- **Zuständigkeit:** LLM.
- **Kriterien:** Bilddateien existieren lokal, haben transparenten/dunklen Rand und überstehen den 32-px-Downscale ohne Detailmatsch.

### L1: Resolver-Utility & Unit-Tests

- **Ziel:** `src/lib/casino/player-avatar.ts` und Test-Suite `src/lib/casino/__tests__/player-avatar.test.ts` implementieren.
- **Zuständigkeit:** LLM.
- **Kriterien:** 100 % deterministische Tests für bekannte Usernamen, korrekte Extraktion von Initialen, saubere Behandlung von `null`/`undefined`/Sonderzeichen.

### L2: Integration Bento-Turnier & Vault-Profil

- **Ziel:** Entfernung aller Verweise auf `api.dicebear.com`.
- **Zuständigkeit:** LLM.
- **Kriterien:** BentoStripCells rendert die neuen Porträts; Vault-Profil zeigt den aufgelösten Avatar ohne externe Netzwerkanfragen.

### L3: Integration Leaderboard (Podium, Tabelle, Personal Bar)

- **Ziel:** Leaderboard-UI mit Bilddarstellung und elegantem Gold-Rahmen anreichern.
- **Zuständigkeit:** LLM.
- **Kriterien:** `LeaderboardPodium` zeigt 48/42 px Avatare, `LeaderboardStreamTable` 34 px Avatare, `PersonalRankBar` 32 px. Text-Initialen greifen bei Bildladefehlern.

### L4: Verifikation & Abschluss

- **Ziel:** Vollständige Test- und Build-Freigabe.
- **Zuständigkeit:** LLM.
- **Kriterien:** `npm run typecheck` fehlerfrei, Vitest-Tests grün, kein Layout-Shift.

---

## 5 — Selbstprüfung vor `Execution-Ready`

- [x] **Scope klar abgegrenzt:** Reiner Frontend-Resolver und Bildablage; keine DB-Schreibpfade.
- [x] **LLM-Zuständigkeit:** Alle Schritte L0–L4 liegen vollständig beim LLM. Jan greift nur zur visuellen Endabnahme ein.
- [x] **Kein Single-Point-of-Failure:** Fällt ein Bild lokal aus, rendert die UI die gewohnten Initialen.
- [x] **Dokumenten-Verlinkung:** Verknüpft mit [`00_bildgenerierung_uebersicht_jan.md`](../T_IMAGE/00_bildgenerierung_uebersicht_jan.md) und [`02_bildgenerierung_top10_details.md#img-06`](../T_IMAGE/02_bildgenerierung_top10_details.md#img-06).
