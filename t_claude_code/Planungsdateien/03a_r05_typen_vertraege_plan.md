# 03a-R05 — Typen & Schemas als Vertrag (Regel 5)

> **Status:** Executed (2026-09-14; L0–L1 ✅, L2 entfällt — 2 echte `any` weit unter Schwellwert 50; R5 83→88 %) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Reine Messung (Any-Freiheit) + Bewahr-Protokoll; kein Umbau von Typen/Schemas.
> **Money-Pfad:** Nein (read-only Messung) · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R5 (Niveau 83 %, kein 🔴-Bottleneck)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                    | Scope (Dateien)                                         | Ausführung  | Status     | Zuständigkeit | Verifikation                                                          |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------- | ---------- | ------------- | --------------------------------------------------------------------- |
| L0     | Messung Any-Freiheit: Vorkommen von `any` (inkl. `as any`, `any[]`, implizites `any`) unter `src/**` per Grep zählen und Top-10-Dateien listen; `unknown` als korrekte Alternative mitzählen                                                   | read-only: `src/**`                                     | Sequenziell | 🔴 Geplant | LLM           | Zahl + Top-10-Liste dokumentiert in §R5 Sub-Sub #5                    |
| L1     | Messwert einschreiben + Bewahr-Zeile: Sub-Sub #5 Niveau auf Messbasis setzen; 1-Zeilen-Bewahr-Regel („Zod an allen Systemgrenzen bleibt Standard; `unknown` statt `any`; Contract-Module (`wallet-contract.ts`-Muster) für geteilte Verträge") | `../01_15_03a_code_modularisierung_regelkatalog.md` §R5 | Sequenziell | 🔴 Geplant | LLM           | R5-Schnitt aktualisiert, Regel konsistent mit `CLAUDE.md` § State/API |
| L2     | Falls Messung > 50 `any`-Treffer in Produktions-Code (nicht Tests/Generiertes): Fundliste als Option an Jan (aufräumen oder bewusst bewahren)                                                                                                  | Chat-Übergabe                                           | Sequenziell | 🔴 Bedingt | LLM           | Entscheidung = Jan-Gate, nur bei Schwellwert-Überschreitung           |

**Fan-out-Check (Kriterium 5):** L0→L1→L2 kausal — **kein Fan-out.** Kriterium 6: < 45 Min. gesamt.

## 2 — Self-Contained Kontext-Koffer

- **Stark belegt (verifiziert 2026-09-14):** Zod-Striktheit an API-Grenzen + Store (`walletSnapshotSchema`), generierte DB-Typen (`database.types.ts`), Contract-Module (`wallet-contract.ts`, `db-retry.ts`, `json-value.ts` aus `wallet.ts` Z. 3–12), 3 modullokale Zod-Schemas in `wallet.ts` Z. 21–40.
- **Extern belegt:** Strikte Typen/OpenAPI-Spezifikationen verhindern Halluzination von Feldern/Endpoints — der Agent muss Verträge nicht aus Implementierungsdetails raten.
- **Mess-Definition:** `any` zählt in Produktions-Code (`src/**` exkl. `__tests__`, `database.types.ts`, `.next`); `as unknown as` zählt als halber Treffer (Escape-Valve), separat gelistet.
- **Bewahr-Logik:** Regel 5 ist mit 83 % zweitstärkste Regel — hier ist Halten wertvoller als Umbauen; die Messung schließt nur die letzte unbewertete Lücke (#5).

## 3 — Expliziter Nicht-Scope

- Kein Typen-Umbau, keine Schema-Verschiebung, kein ESLint-`no-explicit-any`-Harden (separater Build-Toolchain-Themenbereich).
- Keine Änderung an `database.types.ts` (generiert, → R08).

## 4 — Lebenszyklus

`Execution-Ready` → L0–L1 → L2 nur bei Schwellwert-Überschreitung (Jan-Gate) → `Executed (archiviert)`.

## 5 — Execution-Log (2026-09-14)

- **L0:** ✅ Messung erhoben (Grep, `src/**` exkl. `__tests__`/`database.types.ts`): 2 echte `any`-Casts (`app/api/leaderboard/route.ts` Z. 101/138: `row.users as any`), 16 `as unknown as`-Halbtreffer (davon 9 legitime Browser-API-Narrowings in `voice-audio.ts`/`sound-manager.ts`/`DiceV2Audio.ts`), 142 `unknown`-Nutzungen. Ergebnis + Top-Liste in §R5 dokumentiert.
- **L1:** ✅ Sub-Sub #5 auf Messbasis gesetzt (70→95); Bewahr-Regel (1 Zeile) in §R5 verankert. Neuer R5-Schnitt: **88 %** (vorher 83 %; (90+90+85+80+95+85)/6 = 87,5).
- **L2:** ⚪ **Entfällt** — 2 echte `any` << Schwellwert 50; die 2 Treffer sind eng umgrenzte Supabase-Join-Casts in einer Route, kein Aufräum-Option-Gate nötig.
