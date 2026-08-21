# 04 — LLM-Qualität & Lesbarkeit: Matcher-Fix, Wissensdatenbank & Rich-Markdown

> Stand: **2026-08-21**  
> Status: 🟢 **Executed (Verifiziert)**  
> Projekt: **Casino / Next.js 16.3 / Royale Guide AI**  
> Verzeichnis: [`Z_LLM/`](file:///v:/VibeCoding/Casino/Z_LLM/)  
> Bezug: [`Z_LLM/10_llm_erweiterung.md`](file:///v:/VibeCoding/Casino/Z_LLM/10_llm_erweiterung.md)  
> Scope: Behebung der Guardrail-Fehlschläge bei Mindest-/Maximaleinsätzen und VIP-Stufen, Präzisierung der 1-Klick-Navigation, Entfernung des Zeilenumbruch-Sanitizers und Implementierung von Rich-Markdown mit Tabellen, Bullet-Points & Code-Pills.

---

## 1 — Übersicht für Jan

| Sektion | Meilenstein | Status | Verifikation | Zuständigkeit |
| :--- | :--- | :--- | :--- | :--- |
| **Sektion 1** | **Tokenizer & Sub-Word Compound Splitting** | 🟢 Executed | `matcher.ts` mit deutschem Präfix-Splitting (`mindest`, `maximal`, `einsatz`, `stufen`, `rakeback`) und Bindestrich-Zerlegung ausgestattet | LLM |
| **Sektion 2** | **Wissensdokumente-Aktualisierung (Punkte 8, 9, 10)** | 🟢 Executed | `economy-limits.md`, `economy-vip.md`, `platform-navigation.md` und `content-raw.ts` um deutsche Tags & 1-Klick-Navigationsangaben ergänzt | LLM |
| **Sektion 3** | **Sanitizer-Fix & Struktur-Prompting** | 🟢 Executed | `normalizeGuideAnswer` in `chat-guide.ts` erhält Newlines & Markdown; System-Prompt erzwingt Markdown-Tabellen & Bullet-Points | LLM |
| **Sektion 4** | **Rich-Markdown & Styling im Chat-UI** | 🟢 Executed | `MarkdownMessage` in `CasinoGuidePanel.tsx` rendert HTML-Tabellen mit Gold-Borders, strukturierte Listen, Bold-Highlights & Monospace-Code-Pills | LLM |
| **Sektion 5** | **Automatisierte Verifikation & Testlauf** | 🟢 Executed | 86/86 Vitest-Suites, 729/729 Tests, TypeScript & Next.js Build grün | LLM |
