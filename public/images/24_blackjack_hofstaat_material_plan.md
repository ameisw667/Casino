# 24 — IMG-03: Blackjack Material und Bildkarten (Inkrementelles Hofstaat-Set & Tischfilz)

> **Status:** Execution-Ready · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Bereitstellung von 3 gravierten 3D-Hofstaat-Medaillons (Bube, Dame, König) im Quantum-Gold-Stil für Spieler- (`PlayingCard.tsx`) und Dealer-Karten (`BlackjackCard3D.tsx`) sowie Integration einer taktilen Kaschmir-Filztextur in `ClassicCasinoTableFelt.tsx`.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-05.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                          |   Status   | Nächster Schritt                                                                               | Zuständigkeit |
| :----: | :------------------------------------------------------------------- | :--------: | :--------------------------------------------------------------------------------------------- | :-----------: |
| **L0** | Pilot-Generierung: Hofstaat Bube (`card-face-jack-quantum-gold.png`) | 🔴 Geplant | Erstellung des ersten 3D-Medaillons (Obsidian-Gold-Relief eines noblen Buben)                  |      LLM      |
| **L1** | Pilot-Integration & Größenvergleich (88×124 vs. 68×96 px)            | 🔴 Geplant | Einbettung in `PlayingCard.tsx`; Prüfung bei voller Kartengröße und Split-Hands                |      LLM      |
| **L2** | Folge-Generierung: Dame & König                                      | 🔴 Geplant | Erstellung von `card-face-queen-quantum-gold.png` und `card-face-king-quantum-gold.png`        |      LLM      |
| **L3** | Deck-Synchronisation (Spieler & Dealer)                              | 🔴 Geplant | Einbindung in `PlayingCard.tsx` und `BlackjackCard3D.tsx` (inkl. 3D-Peeking & Flip)            |      LLM      |
| **L4** | Tischfilz-Texturierung & Typecheck                                   | 🔴 Geplant | Einbindung des nahtlosen Kaschmir-Gewebes in `ClassicCasinoTableFelt.tsx`, `npm run typecheck` |      LLM      |

---

## 2 — Ziel, Scope & Nicht-Scope

### 2.1 Ziel

Blackjack erhält das majestätische Flair eines exklusiven High-Roller-Tischs. Das aktuelle Vakuum bei Bildkarten (wo bei J, Q, K lediglich ein nackter Textbuchstabe wie `KING` im Zentrum steht) wird durch kunstvoll gravierte 3D-Hofstaat-Insignien im _Quantum-Gold_-Look aufgelöst. Der Tischfilz gewinnt spürbare textile Tiefe, ohne die Kantenbeleuchtung zu überladen.

### 2.2 In Scope

- **3 neue Hofstaat-Motive (1024×1024 Master PNG mit Alphatransparenz):**
  1. `card-face-jack-quantum-gold.png`: Edler Bube mit Degen und feinem Goldfiligran.
  2. `card-face-queen-quantum-gold.png`: Majestätische Dame mit gravierter Casino-Krone.
  3. `card-face-king-quantum-gold.png`: Prachtvoller König mit Zepter, angelehnt an das `/games`-Lobby-Leitbild.
- **Karten-Architektur (DOM + Bild-Hybrid):**
  - Kartenwerte (A, 2–10, J, Q, K) und Ecksymbole (♠, ♥, ♦, ♣) bleiben **100 % gestochen scharfe Vektoren** im DOM.
  - Die Zahlenkarten (A bis 10) behalten ihr klares, aufgeräumtes Layout.
  - Nur die Bildkarten (J, Q, K) betten das jeweilige Medaillon geschützt im Zentrum ein (48×64 px bei Standardgröße, 36×48 px bei Split-Hands).
- **Zwei synchrone Renderpfade:**
  - Spieler-Karten: [`PlayingCard.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/games/blackjack/PlayingCard.tsx)
  - Dealer-Karten: [`BlackjackCard3D.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/games/blackjack/BlackjackCard3D.tsx) (inklusive Kompatibilität mit der Peeking-Animation)
- **Tischmaterial-Veredelung ([`ClassicCasinoTableFelt.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/games/blackjack/ClassicCasinoTableFelt.tsx)):**
  - Einbindung einer dezenten, nahtlosen Kaschmir-Gewebe-Textur (`felt-table-weave.png`) im Hintergrund der Tischauflage für alle drei Themen (Emerald, Obsidian, Burgundy).

### 2.3 Nicht-Scope (Explizit ausgeschlossen)

- Kein 52-teiliges Einzelkarten-Generierungspaket (Option B mit 12 separaten Farbvarianten wurde verworfen, um Prompt-Drift und unleserliche Indexe zu vermeiden).
- Keine Änderungen an der Blackjack-Regellogik, Split-Berechnung, Auszahlungsquoten (3:2) oder API-Routen.
- Keine Behinderung des bestehenden CSS-3D-Kartenflips.

---

## 3 — Technische Spezifikation

### 3.1 Zentrum-Rendering in `PlayingCard.tsx` & `BlackjackCard3D.tsx`

```tsx
{
  ['J', 'Q', 'K'].includes(card.value) ? (
    <div
      style={{
        position: 'relative',
        width: size === 'sm' ? '36px' : '52px',
        height: size === 'sm' ? '48px' : '70px',
      }}
    >
      <Image
        src={`/images/cards/card-face-${card.value === 'J' ? 'jack' : card.value === 'Q' ? 'queen' : 'king'}-quantum-gold.png`}
        alt={card.value}
        fill
        sizes="52px"
        style={{ objectFit: 'contain' }}
      />
    </div>
  ) : (
    /* Bestehende Zahlenkarten-Darstellung für A bis 10 */
    <span style={{ fontSize: size === 'sm' ? '1.8rem' : '2.4rem' }}>{suitIcon}</span>
  );
}
```

### 3.2 Größen-Matrix & Lesbarkeit

| Kartentyp                    | Standardgröße (`md`) | Split-Hand / Mobile (`sm`) | Große Ansicht (`lg`) |
| :--------------------------- | :------------------: | :------------------------: | :------------------: |
| **Kartenmaß**                |     88 × 124 px      |         68 × 96 px         |     104 × 148 px     |
| **Hofstaat-Medaillon**       |      52 × 70 px      |         36 × 48 px         |      64 × 86 px      |
| **Sicherheitsabstand Index** |   min. 16 px Rand    |      min. 12 px Rand       |   min. 20 px Rand    |

---

## 4 — Meilensteine im Detail

### L0: Pilot-Generierung Bube

- **Ziel:** Erstellung und Freistellung von `public/images/cards/card-face-jack-quantum-gold.png`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Warme Goldlinien auf transparentem Grund, kein überladener Rand, perfekte Symmetrie.

### L1: Pilot-Integration & Größenvergleich

- **Ziel:** Einbau in `PlayingCard.tsx`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Wert "J" und Farbsymbol bleiben links oben und rechts unten 100 % lesbar; Test bei 68×96 px erfolgreich.

### L2: Folge-Generierung Dame & König

- **Ziel:** Erstellung von `card-face-queen-quantum-gold.png` und `card-face-king-quantum-gold.png`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Identischer Zeichenstil, gleiche Beleuchtungswinkel und Strichstärken wie beim Piloten.

### L3: Dealer-Karten-Synchronisation

- **Ziel:** Einbindung in `BlackjackCard3D.tsx`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Dealer-Upcard zeigt Hofstaat; verdeckte Karte und Peeking-Animation laufen unverändert flüssig.

### L4: Tischfilz-Veredelung & Verifikation

- **Ziel:** Einbettung der Web-Textur in `ClassicCasinoTableFelt.tsx`.
- **Zuständigkeit:** LLM.
- **Kriterien:** `npm run typecheck` fehlerfrei, kein Ruckeln beim Austeilen der Karten.

---

## 5 — Selbstprüfung vor `Execution-Ready`

- [x] **Scope klar abgegrenzt:** Reines visuelles Karten- und Tisch-Upgrade; keine Spielablauf-Mutationen.
- [x] **LLM-Zuständigkeit:** Alle Schritte L0–L4 liegen vollständig beim LLM.
- [x] **Hofstaat-Fokus beachtet:** Zahlenkarten 2–10 und Ass bleiben typografisch klar; keine unnötige Überfüllung.
- [x] **Split-Hand-Schutz:** Sicherheitsabstände für das 68×96 px Miniaturformat sind fest verankert.
- [x] **Verknüpfung:** Verlinkt in [`00_bildgenerierung_uebersicht_jan.md`](../../T_IMAGE/00_bildgenerierung_uebersicht_jan.md) und [`02_bildgenerierung_top10_details.md#img-03`](../../T_IMAGE/02_bildgenerierung_top10_details.md#img-03).
