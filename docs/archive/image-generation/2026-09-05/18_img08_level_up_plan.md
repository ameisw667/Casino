# 18 — IMG-08: Level-Up verständlich inszenieren (Rich-Toast mit 3D-Gold-Siegel)

> **Status:** Umgesetzt (lokal verifiziert) · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Aufwertung der Level-Up-Benachrichtigung durch ein neutrales 3D-Obsidian-Gold-Siegel, dynamische Level-Zahl und sanften Audio-Impuls im GamificationProvider ohne Unterbrechung des Spielflusses.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-05. Typecheck, 1.529 Tests, Lint, Build und scoped Diff-Check erfolgreich.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                     |    Status    | Nächster Schritt                                                                                                      | Zuständigkeit |
| :----: | :---------------------------------------------- | :----------: | :-------------------------------------------------------------------------------------------------------------------- | :-----------: |
| **L0** | Asset-Bereitstellung: `badge-level-up-gold.png` | 🟢 Umgesetzt | Siegel liegt lokal vor und wird im Rich-Toast via `next/image` gerendert                                              |      LLM      |
| **L1** | Rich-Toast & Audio-Integration                  | 🟢 Umgesetzt | Siegel, dynamische Level-Zahl, Titel und Gewinn-Sound sind im vorhandenen Toast-System integriert                     |      LLM      |
| **L2** | Debounce- & Rapid-Level-Up-Schutz               | 🟢 Umgesetzt | Toasts mit Schlüssel `level-up` superseden den Vorgänger; der Test deckt Level 2 → 4 ab                               |      LLM      |
| **L3** | Verifikation, Reduced-Motion & Typecheck        | 🟢 Umgesetzt | Reduced Motion unterdrückt den Eintrittsimpuls; Typecheck, 1.529 Tests, Lint, Build und scoped Diff-Check erfolgreich |      LLM      |

---

## 2 — Ziel, Scope & Nicht-Scope

### 2.1 Ziel

Der Level-Aufstieg wird von einer schlichten Textnachricht (_"LEVEL UP! You are now Level X 🚀"_) zu einer edlen VIP-Benachrichtigung im _Obsidian & Quantum Gold_-Design transformiert. Ein plastisches 3D-Siegel mit dezentem Glanzimpuls feiert den Fortschritt, während das Spielgeschehen zu 100 % interaktiv und ununterbrochen weiterläuft.

### 2.2 In Scope

- **Asset-Bereitstellung:** 1 transparentes 1024×1024 Master-PNG (`public/images/badge-level-up-gold.png`).
  - _Motiv:_ Dreidimensional gewölbtes Casino-Royale-Siegel aus dunklem Obsidian mit warmen Champagner-Gold-Lichtkanten (`#D4AF37`) und Stern-/Lorbeer-Relief.
  - _Zahlenlos:_ Das Siegel enthält **keine** feste Zahl. Die erreichte Level-Ziffer wird scharf und dynamisch per DOM gerendert.
- **Provider-Logik:** [`src/providers/GamificationProvider.tsx`](file:///v:/VibeCoding/Casino/src/providers/GamificationProvider.tsx)
  - Übergabe von Siegel-Asset, Level-Badge und Sound-Trigger an das Toast-System.
  - Kopplung an den bestehenden [`soundManager.play('win')`](file:///v:/VibeCoding/Casino/src/lib/casino/sound-manager.ts) oder dezenten Glanz-Ton.
- **Toast-Präsentation:**
  - Kompakter Rich-Toast mit Siegel links, Level-Überschrift und dynamischem Fortschritts-Text.
  - Kurzer Skalierungs-/Glanz-Impuls beim Erscheinen (Framer Motion).
  - Automatisches Schließen nach 5–6 Sekunden oder per Klick.

### 2.3 Nicht-Scope (Explizit ausgeschlossen)

- Kein modales Vollbild-Overlay (Option B wurde verworfen, um den Spielfluss beim Wetten/Cashout nicht zu behindern).
- Keine Bindung an VIP-Tiers (Level 1–100 XP-Fortschritt ist unabhängig von den VIP-Rängen Bronze/Silber/Gold).
- Keine Datenbankschema-Änderungen oder RPC-Anpassungen.

---

## 3 — Technische Spezifikation

### 3.1 Asset-Vorgaben (`badge-level-up-gold.png`)

- **Format:** PNG mit Alphatransparenz, Web-komprimiert (unter 80 KB).
- **Zentrierung:** Vollständig kreisrund/symmetrisch für flexible CSS-Größen (48×48 px bis 64×64 px im Toast).
- **Farbpalette:** Obsidian (`#0B0E14`), Akzentgold (`#D4AF37`, `#F5D77F`), weicher Glanzfilter.

### 3.2 Toast-Struktur (Rich Component)

```typescript
interface LevelUpToastPayload {
  level: number;
  badgeSrc: string;
  title: string;
  subtitle: string;
}
```

- Bei schnellen Mehrfach-Levelaufstiegen ersetzt ein neues Level-Up den vorherigen Level-Toast sofort (`debounce / supersede`), um Toast-Spamming zu verhindern.

---

## 4 — Meilensteine im Detail

### L0: Asset-Bereitstellung

- **Ziel:** Erstellung und Ablage von `public/images/badge-level-up-gold.png`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Kanten ohne Halo-Artefakte, saubere Silhouette auch bei 48 px.

### L1: Rich-Toast & Audio-Anbindung

- **Ziel:** `GamificationProvider.tsx` aufwerten.
- **Zuständigkeit:** LLM.
- **Kriterien:** Bild wird geladen, Level-Zahl korrekt eingeblendet, Audio synchron ausgelöst.

### L2: Rapid-Level-Up Schutz

- **Ziel:** Verhindern, dass bei schnellen XP-Sprüngen mehrere Toasts gestapelt werden.
- **Zuständigkeit:** LLM.
- **Kriterien:** Bei Levelsprung 1 -> 3 wird nur die aktuellste Auszeichnung angezeigt.

### L3: Verifikation & Abschluss

- **Ziel:** Typprüfung und Motion-Check.
- **Zuständigkeit:** LLM.
- **Kriterien:** `npm run typecheck` fehlerfrei, `prefers-reduced-motion` deaktiviert Glanzimpuls sauber.

---

## 5 — Selbstprüfung vor `Execution-Ready`

- [x] **Scope klar abgegrenzt:** Reines Rich-Toast-Event; keine Sperrung des Spielbildschirms.
- [x] **LLM-Zuständigkeit:** Meilensteine L0–L3 liegen zu 100 % beim LLM.
- [x] **Fail-Safe:** Fällt das Laden des Bildes aus, bleibt der bisherige Text-Toast als robuster Fallback aktiv.
- [x] **Dokumenten-Verlinkung:** Verknüpft mit [`00_bildgenerierung_uebersicht_jan.md`](../T_IMAGE/00_bildgenerierung_uebersicht_jan.md) und [`02_bildgenerierung_top10_details.md#img-08`](../T_IMAGE/02_bildgenerierung_top10_details.md#img-08).
