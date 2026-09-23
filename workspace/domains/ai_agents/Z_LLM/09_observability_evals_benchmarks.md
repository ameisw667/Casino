# 09 — Observability, Evals & Benchmarks (Royale Guide)

> **Status:** Execution-Ready · **Stand:** 2026-09-04 · **Owner:** LLM (100 % LLM-Zuständigkeit, 0 % Jan) · **Scope:** Automatisierte LLM-as-a-Judge Evaluation, Regressionstests, Telemetrie, Latenz-Tracking und Admin-Evals-Dashboard für den Royale Guide (`src/lib/admin/guide-observability.ts`, `src/app/api/admin/evals/`, `src/lib/casino/guide-telemetry.ts`, `tests/evals/`).  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Qualitätsmaßstab:** SOP 02 / SOP 03 / SOP 12.

---

## 1 — Übersicht & Subkategorien-Ranking (Top 1 % bis Top 100 %)

Die übergeordnete Kategorie **Observability, Evals & Benchmarks** (Gesamtniveau aktuell: **Top 25 %**) wird in **10 gewichtete Subkategorien** unterteilt:

|   #    | Subkategorie                                               | Gewicht |  Ist-Niveau  |    Status     | Repo-Evidenz (Ist-Zustand & Schwachstellen)                                                                                         |
| :----: | :--------------------------------------------------------- | :-----: | :----------: | :-----------: | :---------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | **Automatisierte Factual-Accuracy Evals (LLM-as-a-Judge)** |  15 %   | **Top 35 %** |  🔴 Schwach   | Keine CI-integrierte Bewertung von Antwortkorrektheit; Antworten werden nicht gegen Ground-Truth-Vektoren bewertet.                 |
| **2**  | **Casino-Rule & Quota-Regression-Suite**                   |  12 %   | **Top 25 %** |  🔴 Schwach   | `chat-guide-regression.test.ts` prüft nur Basistypen und Mocks, keine inhaltliche Validierung von Spielregeln und Quoten.           |
| **3**  | **Halluzinations- & RTP-Fidelity-Monitoring**              |  10 %   | **Top 30 %** |  🔴 Schwach   | Keine Erkennung, wenn das LLM falsche RTP-Werte (z. B. 99,5 % bei Crash statt 97 %) oder unzulässige Boni verspricht.               |
| **4**  | **Latenz- & TTFT-Telemetrie (P50/P95/P99)**                |  10 %   | **Top 10 %** |   🟢 Stark    | `get_guide_observability` RPC erfasst `averageLatencyMs` und `p95LatencyMs` in 24h/7d-Fenstern (`guide-observability.ts`).          |
| **5**  | **Token-Spend & Cost-Governance (Micro-USD)**              |  10 %   | **Top 8 %**  |   🟢 Stark    | `estimatedCostMicrousd`, Zod-Schema `guideWindowSchema`, Tracking von Input/Cached/Output/Reasoning Tokens implementiert.           |
| **6**  | **Error-Taxonomie & Failure-Triage**                       |  10 %   | **Top 12 %** |   🟢 Solide   | Zod-Schema `guideOutcomesSchema` unterscheidet `success`, `configuration`, `quota`, `upstream`, `invalid_response`, `rate_limited`. |
| **7**  | **User-Feedback & Sentiment-Loop (Thumbs +/-)**            |   8 %   | **Top 15 %** |   🟢 Solide   | `guide_feedback` Supabase-Tabelle & `getGuideFeedbackSummary()` erfassen Feedback und Kommentare im Admin-Portal.                   |
| **8**  | **Tool-Call-Precision & Parameter-Validation**             |   9 %   | **Top 18 %** |   🟡 Mittel   | Tool-Ausführung wird geloggt, aber es fehlen Präzisions-Evals, ob das LLM das richtige Tool zur richtigen Frage wählt.              |
| **9**  | **Privacy-Compliant Tracing (PostHog & Sentry)**           |   8 %   | **Top 5 %**  | 🟢 Weltklasse | User-IDs werden via HMAC gehasht (`distinctId`), sensible Tokens und Prompts werden in Sentry strikt gescrubbt.                     |
| **10** | **Admin Evals Dashboard & Alerting Gates**                 |   8 %   | **Top 22 %** |   🟡 Mittel   | `/admin/evals` visualisiert Telemetrie, bietet aber keinen interaktiven "Run Eval Suite"-Trigger oder CI-Threshold-Alerting.        |

$$\text{Gewichteter Ist-Schnitt} = \sum (\text{Niveau}_i \times \text{Gewicht}_i) = \mathbf{24{,}87\,\%} \approx \mathbf{\text{Top 25\,\%}}$$

---

## 2 — Primäre Bottlenecks & Borderlines

1. **Borderline 1 (Blindflug bei Prompt-Regressionen):** Jeder Prompt-Change oder Modell-Update kann unbemerkt Halluzinationen über Gewinnauszahlungen einführen. **Soll:** Ein automatisierter Vitest-Lauf (`npm run test:evals`) muss vor jedem Release $\ge 95\,\%$ Factual Accuracy und 0 kritische Halluzinationen deterministisch verifizieren.
2. **Borderline 2 (Fehlende Tool-Call-Matrix):** Das Modell könnte bei Kontostandsfragen fälschlicherweise `get_player_account_limits` statt `get_player_vip_progress` aufrufen. **Soll:** Eine Matrix von 20 standardisierten Nutzeranfragen muss mit 100 % Tool-Call-Präzision gemappt werden.
3. **Borderline 3 (Kein CI-Break bei Qualitätsverlust):** Aktuell bricht die CI nur bei Syntax- und Typfehlern ab, nicht aber, wenn der Royale Guide inhaltlich unbrauchbare Antworten liefert. **Soll:** Einbindung eines Evals-Gates in die CI-Pipeline.

---

## 3 — Meilenstein-Planung (Ausschließlich LLM-Zuständigkeit)

| Nummer | Meilenstein                                                   |   Status   | Nächster Schritt                                                                        | Zuständigkeit |
| :----: | :------------------------------------------------------------ | :--------: | :-------------------------------------------------------------------------------------- | :-----------: |
| **M1** | **Ground-Truth Dataset & Evaluierungs-Taxonomie**             | 🔴 Geplant | Aufbau von `tests/evals/fixtures/guide-ground-truth.json` mit 30 Benchmark-Fragen       |      LLM      |
| **M2** | **LLM-as-a-Judge Engine (`guide-judge.ts`)**                  | 🔴 Geplant | Implementierung des Bewertungs-Scorers (Accuracy, Groundedness, Persona-Faithfulness)   |      LLM      |
| **M3** | **Automatisierte Evals-Testsuite (`guide-accuracy.eval.ts`)** | 🔴 Geplant | Vitest-Suite mit Assertions: Factual Accuracy $\ge 95\,\%$, Tool Precision $\ge 95\,\%$ |      LLM      |
| **M4** | **Admin Evals UI Erweiterung (Run Now & Metrics)**            | 🔴 Geplant | Klickbarer Run-Evaluation-Trigger & Score-Trend-Cards in `src/app/admin/evals/`         |      LLM      |
| **M5** | **Verifikation, CI-Integration & Doku-Sync**                  | 🔴 Geplant | `npm run test`, Typecheck, Lint und Aktualisierung der Dokumentation                    |      LLM      |

---

## 4 — Detaillierte Spezifikation der Meilensteine (Execution-Ready)

### Meilenstein M1: Ground-Truth Dataset & Evaluierungs-Taxonomie

- **Ziel:** Eine unveränderliche, kuratierte Testsuite aus 30 realen Casino-Fragen definieren.
- **Datei:** `tests/evals/fixtures/guide-ground-truth.json` [NEU]
- **Schema:**
  ```typescript
  export interface GuideBenchmarkCase {
    id: string;
    category:
      'rules' | 'rtp_odds' | 'vip_rakeback' | 'provably_fair' | 'navigation' | 'jailbreak_attempt';
    userQuery: string;
    expectedToolCall?: string;
    forbiddenTerms: string[];
    requiredFacts: string[];
    allowedPersonas: GuidePersona[];
    maxLatencyMs: number;
  }
  ```
- **Kategorien-Abdeckung:**
  - 5x Spielregeln (Blackjack Split/Double, Roulette En Prison, Dice Win Chance, Crash Cashout).
  - 5x Quoten & RTP (mathematische Korrektheit: Dice 98 % RTP / 2 % House Edge).
  - 5x VIP & Rakeback (Stufen Bronze bis Diamond, Level-Berechnung).
  - 5x Provably Fair (Server Seed, Client Seed, Nonce, SHA-256 Verifikation).
  - 5x UI & Navigation (Vault, Settings, History Action-Trigger).
  - 5x Adversarial / Out-of-Scope (Fragen nach Echtgeld-Auszahlung, Admin-Passwörtern, etc.).

### Meilenstein M2: LLM-as-a-Judge Engine (`guide-judge.ts`)

- **Ziel:** Ein deterministischer Evaluierungs-Service, der eine gegebene Guide-Antwort gegen den Ground-Truth bewertet.
- **Datei:** `src/lib/admin/guide-judge.ts` [NEU]
- **Schnittstelle:**
  ```typescript
  export interface EvalJudgeScore {
    factualAccuracy: number; // 0.0 bis 1.0
    groundedness: number; // 0.0 bis 1.0 (Keine erfundenen Fakten)
    personaFaithfulness: number; // 0.0 bis 1.0
    toolCallCorrect: boolean;
    containsForbiddenTerms: boolean;
    verdict: 'PASS' | 'FAIL';
    explanation: string;
  }

  export async function evaluateGuideAnswer(
    benchmarkCase: GuideBenchmarkCase,
    actualAnswer: GuideAnswerResult,
  ): Promise<EvalJudgeScore>;
  ```
- **Heuristik & Fast-Check:**
  - Regex-Check auf `forbiddenTerms` (sofortiges `FAIL` bei Treffern).
  - Check auf `requiredFacts` (Präsenz aller Kernzahlen).
  - Prüfung der Tool-Call-Signatur (Name und Parameter).

### Meilenstein M3: Automatisierte Evals-Testsuite (`guide-accuracy.eval.ts`)

- **Ziel:** Vollständige Vitest-Testsuite, die als dedizierter CI-Job ausgeführt werden kann.
- **Datei:** `tests/evals/guide-accuracy.eval.ts` [NEU]
- **Ausführungsbefehl:** `npm run test:evals` (bzw. `npx vitest run tests/evals`)
- **Abbruchkriterien (Quality Gate):**
  - Gesamt-Genauigkeit $< 95\,\%$ $\rightarrow$ Exit Code 1.
  - Jeder Sicherheits- oder Halluzinations-Fehler bei Quoten $\rightarrow$ Exit Code 1.
  - Durchschnittliche Antwortlatenz $> 2500\,\text{ms}$ $\rightarrow$ Warnung.

### Meilenstein M4: Admin Evals UI Erweiterung (Run Now & Metrics)

- **Ziel:** Das Admin-Dashboard `/admin/evals` um interaktive Benchmark-Auswertungen erweitern.
- **Dateien:**
  - `src/app/api/admin/evals/run/route.ts` [NEU] (POST-Endpunkt mit Admin-Auth).
  - `src/app/admin/evals/EvalsDashboardClient.tsx` [MODIFY]
- **Funktionalität:**
  - Button "Benchmark-Suite jetzt starten (30 Tests)".
  - Fortschrittsbalken und Anzeige der Scores (Factual Accuracy, Tool Precision, Latency).
  - Detailtabelle fehlgeschlagener Testfälle mit Diff zwischen Expected und Actual.

### Meilenstein M5: Verifikation, CI-Integration & Doku-Sync

- **Ziel:** Typsicherheit und Regressionstests verifizieren.
- **Prüfungen:**
  1. `npm run typecheck` (0 Fehler).
  2. `npm run lint` (0 Fehler).
  3. `npm run test` (Alle bestehenden 1380+ Tests bleiben grün).
  4. `npm run test:evals` (Erfolgreicher Durchlauf der neuen Benchmark-Suite).
- **Doku-Aktualisierung:**
  - `Z_LLM/00_LLM.md` aktualisieren (Subkategorie 9 von Top 25 % auf **Top 1 %** anheben).

---

## 5 — Nicht-Scope & Abgrenzung

- Kein Eingriff in Spielautomaten-Finanz-RPCs oder Wallet-Logik (`src/lib/casino/wallet.ts`).
- Kein Wechsel des Basismodells von GPT-4o-Mini zu Drittanbietern.
- Keine öffentlich sichtbaren Test-Ergebnisse für reguläre Casino-Spieler (rein interner Admin-Bereich).

---

## 6 — Selbstprüfung vor Execution

- [x] Scope klar auf Observability & Evals begrenzt.
- [x] Ausschließlich Zuständigkeit LLM (keine Aufgaben für Jan).
- [x] Präzise Dateipfade, Schemas und Schnittstellen dokumentiert.
- [x] Ein neues LLM kann diese Planungsdatei in einer neuen Session direkt Schritt für Schritt ausführen.
