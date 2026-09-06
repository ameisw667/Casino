# 01 — Workflow-Jan Option-Gate (Casino Adapter)

> **Zweck:** Vor größeren Architekturentscheidungen genau 3 (min. 2) echte, distinkte Alternativen vorlegen.
> **Kanonischer Standard:** 🔗 [`xx_sop/shared/jan-option-gate/SKILL.md`](shared/jan-option-gate/SKILL.md)

---

## 1 — Standard-Workflow & Heuristik

Dieses Projekt folgt verbindlich dem universellen Jan Option-Gate Skill:

- **Kriterien:** `Lerneffekt 30 % · Aufwand/Komplexität 25 % · Risiko 25 % · Wartbarkeit 20 %` (aufgabenspezifisch anpassbar, 1 Zeile im Output).
- **Echte Trade-off-Achsen:** Keine Aufwands-Leiter, keine Strohmänner. Jede Option braucht einen plausiblen Kontext.
- **Scoring & Gegenprobe:** 1–5 Punkte mit konkreten Fakten belegt, Mindest-Bar > 3.0 / 5, Tie-Break entscheidet Risiko.
- **Pre-Mortem:** Genau 1 Satz für die Führungsoption (_„Scheitert diese Option in 6 Monaten, woran läge es?“_).
- **Format:** 30-Sekunden-Vergleichstabelle mit Labels **A / B / C** (niemals 1/2/3).

---

## 2 — Casino-Spezifische Invarianten & Besonderheiten

- **Money-Pfad-Gewichtung:** Berührt eine Option `src/lib/casino/`, Wallet, Auth, RNG oder Supabase-RPCs, erhöht sich das Kriterium **Risiko** auf 40 % (Tie-Break greift sofort).
- **Verbotene Optionen:** Client-authoritative Berechnungen von Guthaben oder Spielausgängen sind prinzipiell ungültig (Zero-Wallet-Autorität).
- **Design-System-Konsistenz:** UI-Optionen müssen zwingend Obsidian & Gold (`#0B0E14`, `#D4AF37`) und Monospace für dynamische Zahlen einhalten.

---

## 3 — Stopp & Übergabe

- Nach der Matrix **sofort anhalten** — keine Code-Edits vor Jans expliziter Wahl („Option A/B/C“).
- Nach Freigabe Übergabe an [`02_workflow_jan_execution.md`](./02_workflow_jan_execution.md).
