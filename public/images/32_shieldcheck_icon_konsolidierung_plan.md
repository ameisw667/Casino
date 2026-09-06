# 32 — Icon-Konsolidierung `ShieldCheck` (ein konsolidiertes Security-Glyph)

> **Status:** Execution-Ready · **Stand:** 2026-09-06 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `ShieldCheck` (37 Render-Stellen, häufigstes Icon der Seite, §18.3 Zeile 6). Keine anderen 18.3-Icons.
> **Kontext:** `ShieldCheck` ist — anders als Sparkles/Trophy/Crown/Star — kein Bedeutungs-Kollisions-Fall, sondern ein Konsistenz-Fall: alle 5 Kontexte (VERIFIED, Provably Fair, Consent, Trust, Passwort-Stärke) tragen dieselbe Kernaussage. Gewählt: **Option A** (ein konsolidiertes Glyph für alle 37 Stellen) aus dem Option-Gate vom 2026-09-06 (§6) — höchster Score aller 6 Cluster.
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine UI-Präsentation; die dahinterliegenden Trust-/Fairness-Aussagen selbst ändern sich nicht, nur das Icon)
> **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.41/5, §6). Marken-/Pipeline-Kontext siehe [`27_sparkles_icon_konsolidierung_plan.md#22`](27_sparkles_icon_konsolidierung_plan.md).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                      | Scope (Dateien)                                                                                                                                                                                              |   Status   | Zuständigkeit | Verifikation                                                                         |
| :----- | :--------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------: | :-----------: | :----------------------------------------------------------------------------------- |
| L0     | Asset-Generierung (1 Motiv, Stil-Referenz `trust-shield-3d.png`) | `public/images/icon-security-verified-quantum-gold.png`, `public/images/CHANGELOG.md`                                                                                                                        | 🔴 Geplant |      LLM      | PNG vorhanden, Alphakanal sauber, < 100 KB                                           |
| L1     | VERIFIED/Trust-Integration                                       | `VaultProfileBanner.tsx`, `MainSidebar.tsx` (Consent-Kontext, nicht die PNG-Stelle)                                                                                                                          | 🔴 Geplant |      LLM      | `npm run typecheck` grün                                                             |
| L2     | Provably-Fair-Integration (alle Sidebar-Footer + Karten)         | `ElevatedGameCard.tsx`, `DiceControlSidebar.tsx`, `CrashControlSidebar.tsx`, `RouletteControlSidebar.tsx`, `SlotsControlSidebar.tsx`, `BlackjackLeftSidebar.tsx`, `HistoryTableStream.tsx` (Quittung-Button) | 🔴 Geplant |      LLM      | `npm run typecheck` grün, alle 5 Sidebar-Footer + Karten-Badge zeigen dasselbe Asset |
| L3     | Consent + Passwort-Stärke-Integration                            | `ConsentBanner.tsx`, `PasswordStrengthMeter.tsx`                                                                                                                                                             | 🔴 Geplant |      LLM      | Farbcodierung des Passwort-Meters unverändert, nur Basis-Glyph getauscht             |
| L4     | Verifikation & Doku-Update                                       | `worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md`, `public/images/CHANGELOG.md`                                                                                                                                       | 🔴 Geplant |      LLM      | 5-Stufen-DoD grün, §18.3-Zeile aktualisiert                                          |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen

| Bedeutung                                                          | Stellen                                                                                                                                                                                                                                                                    |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VERIFIED-Badge                                                     | `VaultProfileBanner.tsx:249`                                                                                                                                                                                                                                               |
| Provably Fair (Karten + alle 5 Sidebar-Footer)                     | `ElevatedGameCard.tsx:234`, `DiceControlSidebar.tsx:539`, `CrashControlSidebar.tsx:543`, `RouletteControlSidebar.tsx:525`, `SlotsControlSidebar.tsx:532`, `BlackjackLeftSidebar.tsx:407`, `HistoryTableStream.tsx:807` (Quittung-Button, mobil), `BetReceiptModal.tsx:345` |
| Consent                                                            | `ConsentBanner.tsx:59`                                                                                                                                                                                                                                                     |
| Passwort-Stärke (Score ≥3, gepaart mit `ShieldAlert` bei Score <3) | `PasswordStrengthMeter.tsx:94`                                                                                                                                                                                                                                             |

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2, Master-Prompt-Template, Batch-Vorgabe: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](27_sparkles_icon_konsolidierung_plan.md).
- **Stil-Referenz statt Ersatz:** `public/images/trust-shield-3d.png` (Sidebar-Footer „SECURE & FAIR / CERTIFIED", `MainSidebar.tsx:285-291`) dient als Vorlage für Material/Form des neuen Assets (spart Prompt-Iterationen, §6). Die PNG-Datei selbst bleibt unangetastet — siehe Nicht-Scope.
- Passwort-Stärke bleibt farbcodiert: `ShieldAlert` (Score <3) bleibt als separates Icon für den negativen Zustand bestehen, nur `ShieldCheck` (Score ≥3) wird zu `icon-security-verified`. Die Score-Logik selbst ändert sich nicht.
- Konsistente Größe/Farbe an allen 37 Stellen anstreben (Kern des §18.3-Vorschlags „EIN Security-Token mit fester Größe/Farbe") — pro Stelle die bisherige Lucide-`size` 1:1 übernehmen, keine Neuskalierung.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- **`public/images/trust-shield-3d.png` bleibt unverändert und wird nicht gelöscht/ersetzt** — es dient nur als Stil-Referenz (§2.2), keine belegte Render-Duplikation mit `ShieldCheck` wurde für diese konkrete Datei festgestellt; ein tatsächliches Retirement wäre eine eigene, hier nicht getroffene Entscheidung.
- Keine Änderung an `ShieldAlert` (negativer Passwort-Stärke-Zustand) — bleibt Lucide, nur der positive Zustand wird ersetzt.
- Keine Änderung an Consent-Logik, Cookie-Handling oder Password-Validierung — ausschließlich Icon-Austausch.
- Keine Änderung an Provably-Fair-Berechnungen oder deren Anzeige-Werten (RTP-%, Seed-Werte) — nur das Icon daneben.
- Kein Anfassen der übrigen 5 §18.3-Cluster.

---

## 3 — Detaillierte Meilensteine

### L0 — Asset-Generierung

- **Ziel:** 1 freigestelltes PNG, stilistisch an `trust-shield-3d.png` angelehnt.
- **Schritte:** Prompt aus Master-Template, Subjekt-Slot „Schild mit Haken-Gravur, Material/Licht analog `trust-shield-3d.png`" → `gpt-image-2`, `medium`, `1024×1024` → Freistellung → Ablage + CHANGELOG-Eintrag. Im selben Batch-Call wie [27](27_sparkles_icon_konsolidierung_plan.md)–[31](31_star_icon_konsolidierung_plan.md), sofern zeitgleich in Ausführung.
- **Erwartetes Verhalten:** Ein einziges, überall wiedererkennbares Sicherheitssignal, stilistisch harmonisch zum bestehenden Sidebar-Trust-Asset.
- **Abbruchkriterium:** Nach 2 Prompt-Iterationen kein zufriedenstellendes Ergebnis → Stopp, Rückfrage.

### L1 — VERIFIED/Trust-Integration

- **Ziel:** `VaultProfileBanner.tsx:249` zeigt das neue Asset; `MainSidebar.tsx`-Consent-Kontext (falls dort ein separates `ShieldCheck` neben dem PNG existiert) ebenfalls.
- **Schritte:** Reskin, Größe 11px (`VaultProfileBanner.tsx`) 1:1 übernehmen.
- **Erwartetes Verhalten:** VERIFIED-Badge visuell aufgewertet, Funktion unverändert.
- **Abbruchkriterium:** Keins.

### L2 — Provably-Fair-Integration

- **Ziel:** Alle 5 Sidebar-Footer + `ElevatedGameCard.tsx` + Quittung-/Receipt-Stellen zeigen dasselbe Asset.
- **Schritte:** 8 Dateien nacheinander, jeweils Lucide-Import ersetzen, Größe (11–20px je Stelle) 1:1 übernehmen.
- **Erwartetes Verhalten:** „Provably Fair" wirkt über alle 5 Spiele + Karten + Quittungen als ein einheitliches, wiedererkennbares Siegel.
- **Abbruchkriterium:** Keins — reiner 1:1-Bild-Tausch an strukturell identischen Stellen.

### L3 — Consent + Passwort-Stärke-Integration

- **Ziel:** `ConsentBanner.tsx:59` zeigt das neue Asset; `PasswordStrengthMeter.tsx:94` zeigt es nur im positiven Zustand (Score ≥3), `ShieldAlert` bleibt für Score <3.
- **Schritte:** Reskin an beiden Stellen, Score-Verzweigung in `PasswordStrengthMeter.tsx` unverändert lassen (nur das positive Icon-Element austauschen).
- **Erwartetes Verhalten:** Konsistentes Sicherheitssignal auch in Consent/Auth-Kontexten.
- **Abbruchkriterium:** Falls die Score-Verzweigung Icon-Komponente statt Icon-Referenz direkt inline hält, Stopp + Rückfrage, um die Farblogik nicht versehentlich zu brechen.

### L4 — Verifikation & Abschluss

- **Ziel:** DoD grün, Doku aktuell.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, §18.3-Zeile `ShieldCheck` aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen an Auth-/Consent-/Sidebar-Tests.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün, insbesondere `PasswordStrengthMeter`-bezogene Tests (Score-Farblogik unverändert).
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur die in §1 gelisteten Dateien + 1 neues PNG + `CHANGELOG.md` + §18.3-Zeile. `trust-shield-3d.png` bleibt unverändert im Diff.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshots Vault-VERIFIED-Badge, ein Sidebar-Footer-Beispiel, Consent-Banner und Passwort-Stärke-Meter (beide Zustände) zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option          | Konzept                                                                                    |  Score   |
| :-------------- | :----------------------------------------------------------------------------------------- | :------: |
| **A (gewählt)** | Ein konsolidiertes Security-Glyph für alle 37 Stellen, Stil-Referenz `trust-shield-3d.png` | **4.41** |
| B               | Leit-Icon + eigene Consent-Variante (nur 1 Stelle)                                         |   3.99   |
| C               | 2 Assets: `security.verified` + `security.strength`                                        |   4.00   |

Kein Tie-Break nötig (Abstand A–C = 0.41 > 0.3). Jan-Freigabe: **Option A**, 2026-09-06.
