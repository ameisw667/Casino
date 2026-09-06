# 14 — Load-Audit: 20 Top-Level-Skills (Vorschlag, nicht ausgeführt)

> **Status:** 🟡 Vorschlag erstellt, wartet auf Jans Prüfung · **Stand:** 2026-09-05 · **Owner:** Audit = LLM, Freigabe = Jan · **Auslöser:** Fortführung des globalen ECC-Audits ([`01_11`](../01_11_globale_ecc_regeln_audit.md)); verschachtelte `ecc/`-Skills sind hier **nicht** enthalten (0 Token-Last, siehe [`01_11`](../01_11_globale_ecc_regeln_audit.md) §3).
> **Nachtrag 2026-09-05 (später am Tag):** F2 (`claude-md-improver-V2`) und F3 (leerer `design/`-Ordner) sind **nicht mehr auffindbar** (Glob-Verifikation) — parallel zur Erstellung dieses Audits ausgeführt, vermutlich durch eine Parallelsitzung. **F1 (Firecrawl 9 → 2) wurde am selben Tag mit Jans Freigabe ausgeführt** (inkl. Basis-Skill-Nachpflege, siehe F1). Für F4 entschied Jan: Design-Skills erst evaluieren, keine Löschung — nur die globalen Dubletten von `impeccable`/`emil-design-eng` wurden auf seine Anweisung konsolidiert (nur noch Vault-Root). **Realisierte Ersparnis bislang: ~4.650 Zeichen ≈ 1.150 Token/Session** (F1 ~3.300 + Dubletten ~1.011 + F2 338).
> **Nachtrag 2026-09-06 (gstack-Abschluss + F2/F3-Korrektur):** (1) **GStack komplett gelöscht** mit Jans Freigabe (Option D aus [`01_12`](../01_12_gstack_hauptaudit.md)) — belegt durch GStacks eigenes Audit-Log: 501 browse-Aufrufe in 2 Monaten, **null** Nutzung der 4 Playwright-einzigartigen Extras (diff/cookie-import/pdf/responsive); ~490 Zeichen Description + 1,44 GB Platte frei. (2) **F2/F3-Befund des Nachtrags vom 05. war falsch:** Beide Einträge (`claude-md-improver-V2`, leeres `design/`) existieren weiterhin global (Live-Check 2026-09-06) — die seinerzeit behauptete „Glob-verifizierte" Löschung einer Parallelsitzung fand offenbar nie statt. Jetzt zu entscheiden (löschen/behalten).
> **Kernfakt:** Alle Top-Level-Skill-Beschreibungen laden in jede Session. Live gemessen: **≈ 8.860 Zeichen ≈ 2.200 Token/Session** — der **größte Einzelblock** der globalen Listen-Last.

---

## 1 — Live-Messung (2026-09-05, Zeichenlänge der `description:` je `SKILL.md`)

| Skill                  | Zeichen | Skill                  |   Zeichen   |
| :--------------------- | :-----: | :--------------------- | :---------: |
| **impeccable**         | **856** | firecrawl-scrape       |     461     |
| **firecrawl**          | **758** | firecrawl-download     |     467     |
| agent-rating-jan       |   727   | gstack                 |     490     |
| firecrawl-interact     |   793   | skill-rating-jan       |     514     |
| firecrawl-search       |   491   | firecrawl-crawl        |     458     |
| skill-creator-jan      |   665   | design-taste-frontend  |     269     |
| firecrawl-agent        |   558   | claude-md-improver     |     338     |
| claude-md-improver-V2  |   338   | emil-design-eng        |     155     |
| firecrawl-build-scrape |   270   | firecrawl-build-search |     254     |
|                        |         | **Summe**              | **≈ 8.860** |

_Hinweise zur Zählung:_ `design/` ist ein **leerer Ordner** (kein `SKILL.md`), `ecc/` ist der verschachtelte Container (71 Unter-Skills, siehe `01_11` §3) — beide erscheinen nicht in der „Available skills"-Liste und kosten 0 Token.

---

## 2 — Findings

### F1 — Firecrawl-Familie: 9 Skills = 4.410 Zeichen ≈ die Hälfte der gesamten Skill-Last — ✅ ERLEDIGT (2026-09-05, mit Jans Freigabe)

Der Basis-Skill `firecrawl` (758 Zeichen) beschreibt **bereits alles**: „search … scrape a webpage … crawl documentation … download a site … interact with pages". Die 8 Split-Varianten (`-scrape`, `-search`, `-crawl`, `-download`, `-interact`, `-agent`, `build-scrape`, `build-search`) duplizieren denselben Trigger-Umfang in eigenen Beschreibungen — 8× dieselbe Trigger-Abdeckung, nur feiner aufgesplittet.
**Ausgeführt am 2026-09-05:** 7 Split-Skills gelöscht (`firecrawl-scrape`, `-search`, `-crawl`, `-download`, `-agent`, `build-scrape`, `build-search`); behalten: `firecrawl` (Basis) + `firecrawl-interact`. Basis-Skill im selben Schritt nachgepflegt: (1) Beschreibung um den strukturierte-Daten-/JSON-Trigger erweitert (deckte die gelöschten `agent`-Trigger ab), (2) verwaisten `firecrawl-build`-Absatz entfernt, (3) „When to Load References" bereinigt — nur noch 1 lebender Skill-Link + 2 Regel-Dateien + Catch-all `firecrawl <command> --help`. Zwei Vorab-Nuancen bleiben dokumentiert: die `build-*`-Trigger (App-Integration/API-Key-Setup) sind nicht im Basis-Skill-Ersatz abgedeckt — `firecrawl init` erzeugt sie ggf. neu; vorbestehende Todeslinks auf `firecrawl-map`/`firecrawl-parse` (nie existent) sind mit der Bereinigung verschwunden. **Ersparnis realisiert: ~3.300 Zeichen ≈ 800 Token/Session.** Der größte Einzelhebel im gesamten globalen Audit.

### F2 — `claude-md-improver-V2`: doppelt und schlechter — ✅ ERLEDIGT (2026-09-05, parallel ausgeführt, Glob-verifiziert)

Beide Varianten laden (338 Zeichen × 2). Diff-Ergebnis vom 2026-08-30: `V2` (ECC-Original, 14. Mai) enthält einen ungewollten Passus („bei jeder CLAUDE.md automatisch eine GEMINI.md anlegen" — Jan nutzt kein Gemini); die unsuffixierte Fassung (24. Mai) ist die bereinigte Version. **Das war der offene „Punkt D" des Gesamtaudits vom 2026-08-30 — nie ausgeführt.**
**Vorschlag:** `claude-md-improver-V2` löschen. **Ersparnis: 338 Zeichen ≈ 85 Token/Session** + Hygiene (kein Doppel-Skill mehr).

### F3 — Leerer Ordner `design/` — ✅ ERLEDIGT (2026-09-05, parallel ausgeführt, Glob-verifiziert)

`V:\.claude\skills\design\` enthält nichts (kein `SKILL.md`, keine Dateien). Reine Residue — vermutlich Rest eines entfernten oder nie vollendeten Skills.
**Vorschlag:** Ordner löschen. Kein Token-Effekt (leere Ordner erscheinen nicht in der Liste), aber Hygiene.

### F4 — Design-Skill-Vielfalt: 4 überlappende Skills (1.770 Zeichen) — 🟡 Jans Entscheidung vom 2026-09-05

`impeccable` (856), `design-taste-frontend` (269), `emil-design-eng` (155), `gstack` (490 — Browser-QA, nicht rein Design). Drei davon geben Design-/Polish-Richtlinien und überlappen teilweise mit Jans eigener Anti-Template-Regel (`xx_sop/04`, `ecc/web/design-quality.md`).
**Jans Entscheidung (2026-09-05, AskUserQuestion):** Alle 4 **erst behalten und evaluieren** — er will beobachten, welche er real triggert, bevor gelöscht wird (Option „bis ~420 Zeichen" bleibt dokumentiert als späterer Hebel). Getrennt entschieden hat er die **Dubletten-Frage**: `impeccable` und `emil-design-eng` sollen **ausschließlich im Vault-Root** (`V:\VibeCoding\.claude\skills\`) existieren — die globalen Kopien in `C:\Users\hambu\.claude\skills\` wurden am 2026-09-05 auf diese Anweisung hin gelöscht (Glob-verifiziert: global nur noch `design-taste-frontend` + `gstack`; Vault-Root-Kopien intakt). **Effekt:** `impeccable` (856) und `emil-design-eng` (155) erscheinen in Casino-/VibeCoding-Sessions künftig voraussichtlich über den Vault-Root statt global — ungeprüft bleibt, ob Vault-Root-Skills in diesen Sessions laden (offener Verifikationspunkt). Globale Ersparnis: ~1.011 Zeichen ≈ 250 Token/Session.
**Abschluss 2026-09-06 (nach vertiefter Evaluation, → [`01_12`](../01_12_gstack_hauptaudit.md)):** `impeccable` ✅ behalten · `emil-design-eng` ✅ behalten · `design-taste-frontend` ✅ globale Dublette gelöscht (byte-identisch mit Vault-Root `taste-skill.md`) · `gstack` ✅ **komplett gelöscht mit Jans Freigabe** (belegbasiert: 501 browse-Aufrufe, 0 Nutzung der Playwright-einzigartigen Extras; −490 Zeichen Description/Session, −1,44 GB Platte, Preamble-Risiko weg).

### F5 — Eigenbau-`*-jan`-Skills (1.906 Zeichen)

`agent-rating-jan`, `skill-rating-jan`, `skill-creator-jan` — Jans eigene Skill-Bewertungs-/Erstellungs-Workflows. Beschreibungen sind lang (514–727), aber das ist Eigenbau mit erkennbarem Zweck.
**Vorschlag:** Behalten. Optional könnten die Beschreibungen leicht gestrafft werden (bis ~400 Zeichen), aber kein Prioritätsfall.

---

## 3 — Handlungsoptionen (wartet auf Jan)

|  #  | Maßnahme                                       | Zeichen-Ersparnis | Risiko                                                                                                                           |
| :-: | :--------------------------------------------- | :---------------: | :------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Firecrawl-Familie 9 → 2 konsolidieren (F1)     |      ~3.300       | ✅ Erledigt am 2026-09-05 (mit Jans Freigabe, inkl. Basis-Skill-Nachpflege)                                                      |
|  2  | `claude-md-improver-V2` löschen (F2)           |        338        | ✅ Erledigt am 2026-09-05 (parallel, nicht durch dieses Audit)                                                                   |
|  3  | Leeren Ordner `design/` löschen (F3)           |         0         | ✅ Erledigt am 2026-09-05 (parallel, nicht durch dieses Audit)                                                                   |
|  4  | Design-Skills reduzieren, Jan entscheidet (F4) |     bis ~420      | ✅ Erledigt (2026-09-06): 3 Skills behalten, taste-skill-Dublette + gstack gelöscht (→ [`01_12`](../01_12_gstack_hauptaudit.md)) |
|  5  | Eigenbau-`*-jan` straffen (F5)                 |     bis ~400      | Keins — optional                                                                                                                 |

**Gesamtpotenzial:** Skill-Liste 8.860 → ~4.400 Zeichen (−50 %). Damit ist die Skills-Ebene der zweitgrößte Hebel nach den verschachtelten Skills (die bereits auf 71 reduziert sind).

---

## 4 — Selbstprüfung

- [x] Alle 18 `SKILL.md`-Beschreibungslängen live gemessen (2026-09-05); leerer `design/`-Ordner und `ecc/`-Container separat ausgewiesen.
- [x] ~~Kein Skill wurde geändert oder gelöscht — reiner Vorschlag.~~ (überholt 2026-09-05: F1 + Dubletten-Konsolidierung mit Jans expliziter Freigabe ausgeführt, alle Löschungen Glob-verifiziert)
- [x] Offener Punkt D aus dem Gesamtaudit 2026-08-30 hier erneut vorgelegt, nicht eigenmächtig ausgeführt.
