# 25 — State & Persistence (Modul 03)

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich Testabdeckung für den bislang ungetesteten XP-Poll → Wallet-Snapshot-Pfad (Sub-Punkt #5 aus [`13_03_state_persistence_subkategorien.md`](../13_03_state_persistence_subkategorien.md)). **Keine** Architektur-Änderung (kein Ersatz der Polling-Mechanik durch Supabase Realtime — das ist eine Options-Gate-Entscheidung, siehe Nicht-Scope).
> **Money-Pfad:** Ja · **Security-Review:** Pflicht
> **Kontext:** Modul 03 ist laut `00_UEBERSICHT.md` „money-Pfad-nah" (0 % Client-Wallet-Autorität als Invariante). Der einzige Sub-Punkt schlechter als Top 15 % ist #5 (XP/Level Outbox-Polling, Top 30 %) — er ruft direkt `applyServerWalletSnapshot()` auf, der einzigen Mutationsgrenze für Finanzwerte im Store. Deshalb zwingend `Money-Pfad: Ja` + `Security-Review: Pflicht` nach `xx_sop/03_workflow_jan_planungsdateien.md` §2.

---

## 0 — Auswahlmethodik

|   #   | Sub-Punkt                              | Gewichtung |    Niveau    |           Bottleneck?           |
| :---: | :------------------------------------- | :--------: | :----------: | :-----------------------------: |
|   1   | `applyServerWalletSnapshot()`-Grenze   |     30     |   Top 3 %    |              Nein               |
|   2   | Zod `walletSnapshotSchema`-Validierung |     20     |   Top 5 %    |              Nein               |
|   3   | `partialize`-Sicherheitsfilter         |     20     |   Top 5 %    |              Nein               |
|   4   | Memoized Selektoren                    |     15     |   Top 8 %    |              Nein               |
| **5** | **XP/Level Outbox-Polling**            |   **15**   | **Top 30 %** | **🔴 JA (einziger Bottleneck)** |

Nur 1 Sub-Punkt liegt schlechter als Top 15 % — die Fallback-Regel „schwächste 2–3, falls alle darüber liegen" greift nicht, da die anderen 4 Sub-Punkte bereits deutlich besser sind. Dieser Plan hat entsprechend genau 1 fachlichen Meilenstein-Kern.

**Frisch verifiziert (2026-09-18):** `src/store/useCasinoStore.ts` ist inzwischen 511 Zeilen (Quelldatei nannte 485 — leichtes, unkritisches Wachstum). `XP_POLL_INTERVAL_MS = 1200` (Zeile 41), `XP_POLL_MAX_ATTEMPTS = 5`, gemeinsamer Timer über alle Bets hinweg (Zeilen 41–70), aufgerufen aus `processGameResult()` (Zeile 150, direkt nach der Dedup-Prüfung). Code-Kommentar (Zeilen 36–40) bestätigt: Übergangslösung, bis der `wallet_events`-Outbox-Consumer vollständig übernimmt (siehe `worldmap/05_OutboxWallet.md`).

**Bekannte Test-Lücke, real bestätigt (kein Treffer in `src/store/__tests__/`):** `grep -rn "XP_POLL|xpPoll|scheduleXpSync|/api/user/balance" src/store/__tests__/` → 0 Treffer. Der Pfad, der `applyServerWalletSnapshot()` mit ungetrusteten Fetch-Antworten füttert, hat aktuell **keine** automatisierte Verifikation von Fail-Closed-Verhalten bei fehlerhafter/böswilliger Server-Antwort.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                       | Scope (Dateien)                                                                                     | Ausführung  | Status     | Zuständigkeit                                                 | Verifikation                                                                                                                                          |
| ------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0     | Baseline & Diagnose                               | `src/store/useCasinoStore.ts` Zeilen 36–70, 148–150; `src/store/__tests__/helpers/store-fixture.ts` | Sequenziell | 🔴 Geplant | LLM                                                           | Bestätigt: 0 bestehende Tests für den Poller, Fixture-Helper (`makeSnapshot`, `setupTestEnv`) wiederverwendbar                                        |
| L1     | Testdatei `xp-poll-wallet-sync.test.ts` schreiben | neu: `src/store/__tests__/xp-poll-wallet-sync.test.ts`                                              | Sequenziell | 🔴 Geplant | LLM                                                           | Mind. 5 Fälle grün (siehe Abschnitt 3), 0 Änderung an Produktionscode nötig                                                                           |
| L2     | Security-Review (Pflicht laut Money-Pfad-Gate)    | `useCasinoStore.ts` Zeilen 36–70 + neue Testdatei                                                   | Sequenziell | 🔴 Geplant | LLM (als Review-Rolle, kein Jan-Gate nötig, da nur Test-Code) | Review bestätigt: Fail-Closed-Verhalten bei ungültigem Snapshot hält (Zod wirft, `.catch(() => {})` verschluckt Netzwerkfehler ohne Balance-Änderung) |
| L3     | Volle Verifikations-Suite                         | —                                                                                                   | Sequenziell | 🔴 Geplant | LLM                                                           | `npm run typecheck` / `npm test` / `npm run lint` / `npm run build` grün                                                                              |
| L4     | Abschluss: Doku-Update & Self-Audit               | `T_FRONTEND/00_UEBERSICHT.md`, `13_03_state_persistence_subkategorien.md`                           | Sequenziell | 🔴 Geplant | LLM                                                           | Planungsdatei-Spalte umgestellt                                                                                                                       |

**Kein Fan-out:** Ein einzelner, kohäsiver Testdatei-Meilenstein — kein unabhängiger Teilaufgaben-Cluster vorhanden.

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- [`src/store/useCasinoStore.ts`](../../../../../src/store/useCasinoStore.ts) Zeilen 36–70 (Poller-Implementierung), 104 (`applyServerWalletSnapshot`-Definition), 148–150 (Trigger-Stelle in `processGameResult`)
- [`src/lib/casino/wallet-contract.ts`](../../../../../src/lib/casino/wallet-contract.ts) — `walletSnapshotSchema` (Zod, Fail-Closed bei ungültigem Snapshot)
- [`src/store/__tests__/helpers/store-fixture.ts`](../../../../../src/store/__tests__/helpers/store-fixture.ts) — `makeSnapshot()`, `setupTestEnv()`, `teardownTestEnv()`
- [`src/store/__tests__/fail-closed-session.test.ts`](../../../../../src/store/__tests__/fail-closed-session.test.ts) — Referenzmuster für `fetch`-Mocking via `vi.mocked(fetch).mockResolvedValue(...)`
- [`xx_sop/09_security_wallet_invariants.md`](../../../../../xx_sop/09_security_wallet_invariants.md) — die 5 Finanz-Invarianten, gegen die das Review in L2 prüft

### 2.2 Systemregeln & Invarianten

- `applyServerWalletSnapshot()` ist die **einzige** Mutationsgrenze für `balance`/`xp`/`level`/`rank` (siehe `xx_docs/07_state_store_context.md`). Diese Testrunde darf diese Invariante nur **prüfen**, nicht verändern.
- 0 % Client-Wallet-Autorität: Der Poller darf niemals einen Snapshot anwenden, der nicht durch `walletSnapshotSchema.parse()` gelaufen ist.
- Bestehender Testfixture-Stil (AAA-Pattern, `@vitest-environment jsdom`, `vi.stubGlobal`) ist zu übernehmen, kein neues Test-Setup-Pattern einführen.

### 2.3 Nicht-Scope (Ausdrücklich verboten)

- **Keine** Migration von Polling zu Supabase Realtime — das ist eine Architektur-Entscheidung mit mehreren echten Optionen (Realtime-Channel-Design, RLS-Auswirkung auf Broadcast, Rollout-Reihenfolge) und gehört ins Options-Gate (`xx_sop/01_workflow_jan_option_gate.md`), nicht in diese 100 %-LLM-Runde.
- **Keine** Änderung an `XP_POLL_INTERVAL_MS`, `XP_POLL_MAX_ATTEMPTS` oder der Timer-Logik selbst — reine Testabdeckung des bestehenden Verhaltens.
- **Keine** neue exportierte Test-Hook-Funktion in `useCasinoStore.ts` nur um Modul-State (`xpPollTimer`, `xpPollAttemptsLeft`) zwischen Tests zurückzusetzen — siehe Abbruchkriterium L1, stattdessen `vi.resetModules()` + dynamischer Re-Import pro Testfall verwenden, um die Produktionsdatei nicht wegen reiner Testisolation anzufassen.
- **Keine** Änderung an `wallet.ts`, `wallet-contract.ts` oder anderen `src/lib/casino/`-Dateien.

---

## 3 — Detaillierte Meilensteine

### L1: Testdatei schreiben

- **Ziel:** Mindestens folgende 5 Fälle abdecken (AAA-Pattern, siehe `xx_sop/shared` Testkonvention):
  1. Nach `processGameResult()` mit gültigen Parametern startet ein Poll-Zyklus, der bei erfolgreicher `/api/user/balance`-Antwort `applyServerWalletSnapshot()` mit dem geparsten Snapshot aufruft.
  2. Eine `res.ok === false`-Antwort führt zu keinem Aufruf von `applyServerWalletSnapshot()` (kein Crash, kein Balance-Wechsel).
  3. Ein Netzwerkfehler (`fetch` rejected) wird durch `.catch(() => {})` verschluckt, ohne die Balance zu verändern (Fail-Closed).
  4. Eine Antwort mit ungültigem Snapshot (z. B. negativer `balance`-Wert) lässt `walletSnapshotSchema.parse()` innerhalb von `applyServerWalletSnapshot()` werfen — Test bestätigt, dass die Balance danach unverändert ist (bestehendes Verhalten aus `wallet-contract.ts`, hier erstmals über diesen konkreten Pfad abgesichert statt nur direkt gegen die Schema-Funktion).
  5. Nach `XP_POLL_MAX_ATTEMPTS` (5) Fehlschlägen stoppt der Timer (`clearInterval`) — kein unbegrenztes Polling.
- **Schritte:** 1. `vi.useFakeTimers()` für Timer-Kontrolle. 2. `vi.resetModules()` vor jedem Testfall + dynamischer `await import('../useCasinoStore')`, um das modul-scope-geteilte `xpPollTimer`/`xpPollAttemptsLeft` zwischen Fällen zu isolieren (siehe Nicht-Scope). 3. `fetch` je Fall mit `vi.mocked(fetch).mockResolvedValue(...)`/`mockRejectedValue(...)` stubben.
- **Abbruchkriterium:** Falls `vi.resetModules()` + dynamischer Re-Import den geteilten Modul-State nicht sauber isoliert (z. B. wegen Zustand-Store-Singleton-Verhalten über Re-Imports hinweg), stattdessen die Tests bewusst seriell mit vollständigem `XP_POLL_MAX_ATTEMPTS`-Ablauf pro Fall gestalten (jeder Test läuft den Timer bis zum Ende durch, bevor der nächste beginnt) statt eine neue Produktionscode-Testschnittstelle einzuführen.

### L2: Security-Review (Pflicht)

- **Ziel:** Bestätigen, dass die neue Testdatei tatsächlich die in `xx_sop/09_security_wallet_invariants.md` dokumentierten Invarianten abdeckt (insbesondere: kein `set({ balance: ... })` außerhalb von `applyServerWalletSnapshot()`, Fail-Closed bei ungültigem Server-Payload) und dass keine der 5 Testfälle versehentlich eine Lücke aufdeckt, die einen echten Produktionscode-Fix erfordert.
- **Abbruchkriterium:** Findet das Review eine echte Sicherheitslücke (z. B. Snapshot wird ohne Schema-Validierung angewendet), Fix **nicht** in dieser Testrunde vornehmen, sondern als CRITICAL-Fund in L4 dokumentieren und Jan informieren (K5-Grenze, echte Produktionscode-Änderung an Wallet-Logik braucht eigenen Plan/Freigabe).

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. **Typecheck:** `npm run typecheck` — 0 Fehler
2. **Tests:** `npm test` — neue Datei grün, alle bestehenden 1795+ Tests weiterhin grün
3. **Lint:** `npm run lint` — 0 neue Warnings
4. **Build:** `npm run build` — Production-Build erfolgreich
5. **Git Diff:** `git diff --stat` zeigt ausschließlich `src/store/__tests__/xp-poll-wallet-sync.test.ts` + Doku-Updates — **0 Änderungen** an `useCasinoStore.ts` oder anderen `src/lib/casino/`-Dateien

---

## 5 — Ehrliche Niveau-Projektion

| Sub-Punkt        |  Vorher  | Nach Ausführung (Projektion) | Begründung                                                                                                                                                                                                              |
| :--------------- | :------: | :--------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #5 XP-Polling    | Top 30 % |       **Top 20–22 %**        | Testabdeckung schließt die Verifikationslücke, aber die zugrunde liegende Architektur bleibt ein Übergangs-Polling-Mechanismus (kein Realtime-Ersatz in dieser Runde) — daher keine Top-10-%-Behauptung                 |
| **Modul-Gesamt** | Top 5 %  |        **≈ Top 5 %**         | Sub-Punkt #5 hat nur Gewichtung 15 von 100 im Modul; selbst eine Verbesserung um 8–10 Prozentpunkte bewegt den gewichteten Modul-Schnitt kaum sichtbar (Modul bleibt dominiert von den bereits starken Sub-Punkten 1–4) |

**Nicht schöngerechnet:** Keine Behauptung, dass Testabdeckung allein das Polling-Architekturproblem löst — das bleibt explizit als Options-Gate-Folgeaufgabe offen (siehe Nicht-Scope).

---

## 6 — Selbstprüfung (Kern-8-Rubrik)

|  #  | Kriterium                               | Score /3 | Begründung                                                                                                                            |
| :-: | :-------------------------------------- | :------: | :------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | Verifizierbarkeit gegen Repo-Realität   |    3     | Zeilenzahlen, Trigger-Stelle, 0-Treffer-Testlücke und bestehende Fixture-Helper frisch am 2026-09-18 verifiziert                      |
|  2  | Konkretheit der Handlungsanweisung      |    3     | 5 konkrete Testfälle mit exakten Zeilen-/Dateibezügen, konkrete Mocking-Strategie                                                     |
|  3  | Vollständigkeit des Lebenszyklus/Scopes |    3     | L0 Diagnose → L1 Test → L2 Security-Review → L3 Verifikation → L4 Abschluss                                                           |
|  4  | Bekannte-Probleme-Transparenz           |    3     | Modul-State-Isolationsproblem zwischen Testfällen explizit benannt inkl. Fallback-Strategie                                           |
|  5  | Cross-Referenz-Konsistenz               |    3     | Verweise auf `wallet-contract.ts`, `xx_sop/09`, bestehende Testfixtures — alle stichprobenartig gegengeprüft                          |
|  6  | Risiko-/Freigabeklassifizierung         |    3     | Money-Pfad: Ja + Security-Review: Pflicht korrekt gesetzt und begründet; K5-Grenze für einen hypothetischen echten Fund in L2 benannt |
|  7  | Lerneffekt-Tauglichkeit                 |    3     | Warum genau 1 Bottleneck (nicht 2–3) und warum Realtime-Migration explizit ausgeklammert bleibt, nachvollziehbar hergeleitet          |
|  8  | Aktualitäts-Check                       |    3     | Stand 2026-09-18, gegen aktuellen Code-Stand (511 statt 485 Zeilen) abgeglichen                                                       |

**Score: 24 / 24 → Tier Top 1 %.** Keine bewusste Lücke.
