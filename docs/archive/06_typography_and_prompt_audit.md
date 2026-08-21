# 06 — Typografie-Harmonisierung & Schnellzugriff-Audit

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 / Royale Guide (`CasinoGuidePanel.tsx` & `chat-guide.ts`)**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Bezug: Nutzer-Testlauf vom 2026-08-21 (Screenshots & Transkript)  
> Scope: Harmonisierung aller Schriftgrößen im Chat-UI, Behebung der `###`-Überschriften und `*kursiv*`-Darstellung, Bereinigung von Formel-Tags sowie Fixierung von Randfällen im Tokenizer (`Mindest-`).

---

## 1 — Audit der 10 Schnellzugriffe (Nutzer-Testlauf)

| Schnellzugriff | Testergebnis im Transkript | Analyse & Status | Optimierungsmaßnahme |
| :--- | :--- | :--- | :--- |
| **1. Blackjack Regeln** | 🟢 Inhaltlich exakt | `### Split` und `*teilen*` wurden als Rohtext gerendert | `###` als goldene `<h4>`-Überschrift und `*kursiv*` als `<em>` im Renderer implementiert |
| **2. Crash Multiplikator** | 🟢 100% präzise | 1.00x Start, exponentieller Anstieg, 1% House Edge, Server-Autorität | Typografie an Standard-Schriftgröße angepasst |
| **3. Roulette Quoten** | 🟢 100% korrekte Tabelle | Straight 35:1, Rot/Schwarz 1:1, Grüne 0 | Tabellenzellen-Schriftgröße mit Fließtext harmonisiert (`0.78rem`) |
| **4. Dice Wahrscheinlichkeit** | 🟢 Formel bereinigt | Mechanik und Formel `99 / WinChance` inhaltlich exakt | LaTeX-Klammern `\[ ... \]` im Renderer bereinigt und als Monospace-Card gerendert |
| **5. Slots Walzen & 7s** | 🟢 100% korrekte Tabelle | 7s (100x), Bell/Bar (10-25x), Früchte (2-5x), Auszahlungslinien | Tabellen-Padding und Zeilenabstand vereinheitlicht |
| **6. VIP Ränge & Rakeback** | 🟢 100% strukturierte Tabelle | Alle 5 Stufen (Bronze bis Diamond) mit Level 1-100+ und bis zu 15% Rakeback | Schriftgröße der VIP-Tabelle an Fließtext angeglichen |
| **7. Provably Fair Seed** | 🟢 100% vollständig | Server Seed (SHA-256), Client Seed, Nonce, HMAC-SHA256, Reveal | `HMAC_SHA256(...)` als Monospace-Pill hervorgehoben |
| **8. Mindest- & Maximaleinsätze** | 🟢 Tokenizer-Fix aktiv | Wort `"Mindest-"` hatte anhängenden Bindestrich $\rightarrow$ Tokenizer matchte nicht auf Tag `mindest` | Leading/Trailing Hyphens im Tokenizer getrimmt (`.replace(/^-+|-+$/g, '')`) |
| **9. Navigation (Historie/Tresor)** | 🟢 1-Klick Navigation aktiv | Transkript enthielt noch die alte Antwort vor Deployment des 1-Klick-Fixes | Durch neuen System-Prompt und 1-Klick-Tags im Code verankert |
| **10. Chat-Befehle** | 🟢 100% präzise | `/help`, `/stats`, `/leaderboard`, `/tip` (disabled) als Code-Pills | Bereits optimal formatiert |

---

## 2 — Schriftgrößen- & Typografie-Harmonisierung (Option A — Executed)

- **Basisschriftgröße:** Einheitlich **`0.80rem` (13px)** mit Zeilenhöhe `1.55` für alle Fließtexte, Listen und Antwortblöcke.
- **Überschriften (`### Heading`):** Rendern als `0.86rem` (14px) Gold-Header (`hsl(var(--primary))`) mit `font-weight: 700`.
- **Kursivtext (`*text*`):** Rendert sauber als `<em>` ohne sichtbare Asterisken.
- **Tabellen:** Header und Datenzellen einheitlich auf `0.78rem` mit `6px 10px` Padding und 1px Gold-Borders.
- **Mathematische Formeln:** LaTeX-Tags (`\[ ... \]`, `\text{...}`) werden bereinigt und in einer dezenten zentrierten Monospace-Box dargestellt.
- **Intro-Nachricht:** Wird über `MarkdownMessage` mit exakt denselben Typografie-Regeln gerendert.

---

## 3 — Verifikation & Testergebnisse

- **Vitest:** 95/95 Test-Dateien bestanden, 794/794 Tests grün.
- **TypeScript Typecheck:** `tsc --noEmit` mit Exit-Code 0.
- **Next.js Production Build:** `next build` erfolgreich (38/38 Seiten generiert).
