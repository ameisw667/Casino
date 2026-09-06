# 10 — Stufe A: Foundation — Vollständige Markdown-Wissensbasis & Zod-Validierung

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 / Royale Guide (`gpt-4o-mini`)**  
> Bezug: [`10_llm_erweiterung.md`](../../z_llm/10_llm_erweiterung.md) (Stufe A) & [`05_ZUKUNFTSPLANUNG.md`](file:///v:/VibeCoding/Casino/worldmap/05_ZUKUNFTSPLANUNG.md) (P12/2.6)  
> Scope: Trennung von Daten und Logik durch 10 strukturierte `.md`-Wissensdateien mit Frontmatter, robustem Parser, striktem Zod-Schema und 683/683 Unit-Tests grün.

---

## 1 — Übersicht für Jan

| Schritt | Meilenstein                               | Status      | Verifikation                                                                | Zuständigkeit |
| :------ | :---------------------------------------- | :---------- | :-------------------------------------------------------------------------- | :------------ |
| **1**   | **10 Markdown-Wissensdateien erstellen**  | 🟢 Executed | 10 `.md`-Dateien unter `src/lib/casino/guide-knowledge/content/`            | LLM           |
| **2**   | **Frontmatter-Parser implementieren**     | 🟢 Executed | Zero-Dependency YAML-Parser in `parser.ts` (100% isoliert)                  | LLM           |
| **3**   | **Zod-Validierungsschema erweitern**      | 🟢 Executed | Strikte Typen in `schema.ts`, Topic-Enum & Registry-Validation              | LLM           |
| **4**   | **Registry & Hilfsfunktionen verdrahten** | 🟢 Executed | `GUIDE_KNOWLEDGE_SOURCES`, `getKnowledgeDocById`, Lookup nach Topic/Tag     | LLM           |
| **5**   | **Core Integration (`chat-guide.ts`)**    | 🟢 Executed | Kontext-Version `2026-08-21`, Prompt-Builder & erweiterte Topic-Validierung | LLM           |
| **6**   | **Unit-Tests & Verifikation**             | 🟢 Executed | 81/81 Test-Dateien, 683/683 Tests grün, `typecheck`/`lint`/`build` grün     | LLM           |

> **Ampel-Definition:** 🔴 Geplant · 🟡 In Execution · 🟢 Executed (Verifiziert).

---

## 2 — Ziel und Leitplanken

- **Ziel:** Wissen liegt nicht mehr als hardcodierte Strings in TypeScript, sondern als sauber lesbare, erweiterbare Markdown-Dokumente im Repository vor.
- **Erreichte Leitplanken:**
  - Jedes Dokument besitzt standardisiertes YAML-Frontmatter (`id`, `version`, `topic`, `title`, `tags`, `owner`, `reviewedAt`, `status`).
  - Strikte Zod-Validierung verhindert fehlerhafte Metadaten oder leere Dokumente zur Compile- und Laufzeit.
  - 0 neue Runtime-Abhängigkeiten (eigener typisierter Frontmatter-Parser).
  - 100% Abwärtskompatibilität für bestehende API-Routen und Tests.

---

## 3 — Die 10 Wissensdokumente im Detail

| Nr. | ID                 | Topic        | Datei                                                                                                                  | Inhalt                                                                    |
| :-- | :----------------- | :----------- | :--------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| 1   | `guide-blackjack`  | `games`      | [`games-blackjack.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-blackjack.md)         | DEAL, HIT, STAND, DOUBLE, SPLIT, 3:2 Blackjack-Payout, Server-Validierung |
| 2   | `guide-crash`      | `games`      | [`games-crash.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-crash.md)                 | Multiplikator-Formel, Crash-Zeitpunkt, Cashout, 1% House Edge             |
| 3   | `guide-dice`       | `games`      | [`games-dice.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-dice.md)                   | 0–100 Bereich, Zielwert-Einstellung, Gewinnchance, Multiplikator          |
| 4   | `guide-roulette`   | `games`      | [`games-roulette.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-roulette.md)           | Europäisches Roulette (0–36), Farb-, Dutzend- und Einzelfeld-Auszahlungen |
| 5   | `guide-slots`      | `games`      | [`games-slots.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-slots.md)                 | 3 Walzen, Walzen-Indizes, Symbol-Gewinnstufen, Auszahlungslinien          |
| 6   | `guide-navigation` | `navigation` | [`platform-navigation.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/platform-navigation.md) | Routen: `/games`, `/history`, `/leaderboard`, `/vault`, `/stats`          |
| 7   | `guide-commands`   | `commands`   | [`platform-commands.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/platform-commands.md)     | Chat-Befehle: `/help`, `/stats`, `/tip` (Status: disabled)                |
| 8   | `guide-vip`        | `economy`    | [`economy-vip.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/economy-vip.md)                 | 5 VIP-Ränge (Bronze bis Diamond), XP-Gewinn je Wette, Rakeback-Stufen     |
| 9   | `guide-fairness`   | `economy`    | [`economy-fairness.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/economy-fairness.md)       | HMAC-SHA256(`serverSeed:clientSeed:nonce`), unhashed Server-Seed Reveal   |
| 10  | `guide-limits`     | `economy`    | [`economy-limits.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/economy-limits.md)           | $0.10 Min-Bet, $10,000 Max-Bet, 10 Req/60s Rate-Limit, Saldo-Snapshot     |

---

## 4 — Technische Architektur

```
src/lib/casino/guide-knowledge/
├── content/                     <-- 10 strukturierte .md Dateien
│   ├── games-blackjack.md
│   ├── games-crash.md
│   ├── games-dice.md
│   ├── games-roulette.md
│   ├── games-slots.md
│   ├── platform-navigation.md
│   ├── platform-commands.md
│   ├── economy-vip.md
│   ├── economy-fairness.md
│   └── economy-limits.md
├── content-raw.ts               <-- Gebündelte Raw-Strings (100% SSR/Serverless-stabil)
├── parser.ts                    <-- Typisierter Frontmatter-Parser
├── schema.ts                    <-- Zod-Schema für Dokumente & Registry
└── registry.ts                  <-- GUIDE_KNOWLEDGE_SOURCES & Lookup-Funktionen
```

---

## 5 — Verifikationsergebnisse

- **Vitest Suite:** 81/81 Test-Dateien passed, 683/683 Tests grün (`chat-guide.test.ts`, `guide-knowledge.test.ts`).
- **TypeScript Typecheck:** `tsc --noEmit` mit Exit-Code 0.
- **ESLint:** 0 Fehler.
- **Vibe-Check:** Exit-Code 0.
- **Next.js Production Build:** `next build` erfolgreich abgeschlossen (36/36 Seiten generiert).
