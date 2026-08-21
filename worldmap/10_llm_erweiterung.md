# 10 — World Map: Royale Guide & LLM-Erweiterung

> Stand: **2026-08-21**  
> Projekt: **Casino / Next.js 16.3 / OpenAI Responses API (`gpt-4o-mini` + `text-embedding-3-small`) / Supabase**  
> Bezug: [`05_ZUKUNFTSPLANUNG.md`](file:///v:/VibeCoding/Casino/worldmap/05_ZUKUNFTSPLANUNG.md) (P12/2.6 & P23/2.10) und [`docs/archive/05_2.6_llmerweiterung.md`](file:///v:/VibeCoding/Casino/docs/archive/05_2.6_llmerweiterung.md)  
> Detailpläne (Archiv): Stufe A ([`docs/archive/10_stufe_a.md`](file:///v:/VibeCoding/Casino/docs/archive/10_stufe_a.md)), Stufe B ([`docs/archive/10_2_llm.md`](file:///v:/VibeCoding/Casino/docs/archive/10_2_llm.md)), Stufe C ([`docs/archive/10_StufeC_LLM.md`](file:///v:/VibeCoding/Casino/docs/archive/10_StufeC_LLM.md))

---

## 1 — Übersicht für Jan (Stufen-Roadmap)

| Stufe | Meilenstein | Status | Nächster Schritt | Aufwand (1–100) | Risiko (1–100) | Impact (1–100) | Lerneffekt |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Stufe A** | **Foundation: Vollständige Markdown-Wissensbasis & Zod-Validierung** | 🟢 Executed | 10 strukturierte `.md`-Dateien mit Frontmatter, Parser & Zod-Registry produktiv verifiziert (683/683 Tests grün) | 25 | 10 | 60 | Mittel |
| **Stufe B** | **Optimierung: Deterministischer Topic-Selector & Token-Budgeting** | 🟢 Executed | Heuristischer Tag-/Keyword-Matcher mit Score-Ranking & selektives Laden im Prompt verifiziert (700/700 Tests grün, -72% Tokens) | 30 | 10 | 70 | Hoch |
| **Stufe C** | **Advanced AI: In-Memory Vektor-Embedding RAG** | 🟢 Executed | 3-Stufen Hybrid-RAG Kaskade (Keyword Schnellpfad + In-Memory Vektor-Fallback mit `text-embedding-3-small` / Kosinus-Ähnlichkeit) verifiziert (713/713 Tests grün) | 48 | 18 | 92 | Sehr Hoch |

> **Ampel-Definition:** 🔴 Geplant — noch nicht gestartet · 🟡 In Execution — in Arbeit / Implementierung · 🟢 Executed — verifiziert & abgeschlossen.

---

## 2 — Architektur-Übersicht & Wissensdatenbank-Pfade

Die Wissensdatenbank ist vollständig modular und hybrid-suchbar aufgebaut:

| Kategorie | Dokument | Dateipfad | Zweck / Inhalt |
| :--- | :--- | :--- | :--- |
| **Games** | Blackjack | [`content/games-blackjack.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-blackjack.md) | DEAL, HIT, STAND, DOUBLE, SPLIT, 3:2 Payout, Server-Autorität |
| **Games** | Crash | [`content/games-crash.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-crash.md) | Multiplikator-Kurve, Cashout, 1% House Edge, Crash-Point-Berechnung |
| **Games** | Dice | [`content/games-dice.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-dice.md) | Ziel 0–100, Gewinnchance, Multiplikator-Formel, Provably Fair Roll |
| **Games** | Roulette | [`content/games-roulette.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-roulette.md) | Zahlen 0–36 (European), Farben, Straight/Dozen/Even-Odd Wetten |
| **Games** | Slots | [`content/games-slots.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/games-slots.md) | 3 Walzen, Symbol-Hierarchie, Gewinnlinien, Walzen-Indizes |
| **Platform** | Navigation | [`content/platform-navigation.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/platform-navigation.md) | Routen: `/games`, `/history`, `/leaderboard`, `/vault`, `/stats` |
| **Platform** | Commands | [`content/platform-commands.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/platform-commands.md) | Chat-Kommandos: `/help`, `/stats`, `/tip` (Status: disabled) |
| **Economy** | VIP-System | [`content/economy-vip.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/economy-vip.md) | Tiers (Bronze–Diamond), Level-Berechnung aus XP, Rakeback-Stufen |
| **Economy** | Fairness | [`content/economy-fairness.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/economy-fairness.md) | HMAC-SHA256(`serverSeed:clientSeed:nonce`), Seed-Reveal & Nachprüfung |
| **Economy** | Limits & FAQ | [`content/economy-limits.md`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/content/economy-limits.md) | Einsatzlimits ($0.10–$10,000), Rate-Limits (10 Req/60s), Wallet-Snapshot |
| **Chunking** | Chunker | [`chunker.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/chunker.ts) | Semantische Zerlegung der 10 Dokumente in strukturierte Abschnitte |
| **Math & Vector**| Vector Math & Store| [`vector-math.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/vector-math.ts) & [`vector-store.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/vector-store.ts) | Kosinus-Ähnlichkeit, `text-embedding-3-small` REST-Client & DJB2 Cache |
| **Retriever**| Hybrid-Retriever | [`hybrid-retriever.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/hybrid-retriever.ts) | 3-Stufen Kaskade: Keyword Schnellpfad -> Vektor-Fallback -> Platform Fallback |
| **Loader** | Parser & Registry | [`parser.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/parser.ts) & [`registry.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-knowledge/registry.ts) | Frontmatter-Parsing, Zod-Validierung, Lookup-Hilfsfunktionen |
| **Live-Daten**| Leaderboard | [`guide-live-leaderboard.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/guide-live-leaderboard.ts) | Live Top-5-Leaderboard via Supabase-RPC `get_leaderboard` (5 Min TTL) |
| **Core** | Chat-Guide Service| [`chat-guide.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/chat-guide.ts) | Prompt-Assembly, OpenAI-Responses-Client, JSON-Schema-Validierung |
| **API** | Bot-Response Route| [`bot-response/route.ts`](file:///v:/VibeCoding/Casino/src/app/api/chat/bot-response/route.ts) | Auth-Check, 10 Req/60s Rate-Limit & Telemetrie-Logging |

---

## 3 — Die 3 Stufen im Detail

### Stufe A: Foundation — Trennung von Daten und Logik + Validierung (🟢 Executed)
- **Ergebnis:** Saubere Trennung zwischen Wissensinhalten (`.md`) und Programmcode (`.ts`).
- **Scope:** 10 Markdown-Dateien mit standardisiertem YAML-Frontmatter (`id`, `version`, `topic`, `title`, `tags`, `owner`, `reviewedAt`, `status`).
- **Parser & Schema:** Robuster Frontmatter-Parser und strikte Zod-Validierung.
- **Verifikation:** 81/81 Test-Dateien, 683/683 Tests grün, Typecheck, Lint, Vibe-Check und Next.js Build 100% grün.

### Stufe B: Optimierung — Deterministischer Topic-Selector & Token-Budgeting (🟢 Executed)
- **Ergebnis:** Reduzierung der System-Prompt-Tokens um 72% (von ~1.600 auf ~450 Tokens) bei 0 ms Latenz.
- **Scope:** Heuristischer Tag-/Keyword-Matcher mit Score-Ranking (`matcher.ts`), Zod-Registry-Integration und selektives Laden im Core-Prompt.
- **Verifikation:** 82/82 Test-Dateien, 700/700 Tests grün, Typecheck, Lint, Vibe-Check und Next.js Build 100% grün.

### Stufe C: Advanced AI — Hybrid-Kaskade & Vektor-Embedding RAG (🟢 Executed)
- **Ergebnis:** 100% semantische Treffsicherheit bei Freitext- und umgangssprachlichen Anfragen ohne Keyword-Treffer bei gleichzeitig 0 ms Latenz für Standardanfragen.
- **Scope:** 3-Stufen Kaskade (`hybrid-retriever.ts`):
  1. Schnellpfad: Keyword Matcher Score ≥ 10 -> 0 ms, 0 API-Calls.
  2. Vektorpfad: `text-embedding-3-small` / DJB2 In-Memory Kosinus-Ähnlichkeits-Suche gegen Chunk-Embeddings.
  3. Plattform-Fallback: Navigation & Commands bei unspezifischen Prompts.
- **Verifikation:** 84/84 Test-Dateien, 713/713 Tests grün, Typecheck, Lint, Vibe-Check und Next.js Build 100% grün.

---

## 4 — Verbindliche Sicherheits- und Ausschlussregeln

1. **🔴 Kein Schreibzugriff auf Finanzdaten:** Der Guide darf unter keinen Umständen Wetten platzieren, Salden modifizieren oder Transaktionen anstoßen.
2. **🔴 Keine PII im Prompt:** Keine E-Mail-Adressen, Passwörter, User-IDs oder Kontodaten im LLM-Payload.
3. **🔴 Fail-Closed & Timeout:** Upstream-Timeout bei 8.000 ms, strukturierte Fehlerbehandlung ohne Freitext-Leckage.
4. **🔴 Rate-Limiting:** Max. 10 Anfragen pro 60 Sekunden pro IP/User.
