# 18.2.4 — `CheckCircle2` (Status-Badge) vs. `Check` (Inline) konsolidieren

> **Status:** Executed (2026-09-08, Endabnahme via Ergebnis-Links) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `CheckCircle2`/`Check`/`CheckCheck` (§18.2 Zeile 4, zusammen die zwei höchsten Einzel-Häufigkeiten der gesamten §18.2-Tabelle: 29 + 11 Stellen). Kein neues Bild-Asset. Das Unicode-`✓` (Crash-Cashout) ist **nicht** Teil dieses Plans — siehe [`34_unicode_glyphen_token_system_plan.md`](../public/images/34_unicode_glyphen_token_system_plan.md) (18.4.4).
> **Execution-Befund 2026-09-08:** Vollinventur (Grep `src/`, außerhalb Admin/Testing/v2) ergab **0 Regel-Abweichungen** — alle 16 verifizierten `CheckCircle2`-Stellen (Auth, Vault, ProvablyFair, Toast, Hero-Trust-Badges, LoginHistory-Pill) sind Badges, alle 9 `Check`-Stellen (Modals, Copy-Buttons, Listen, Guide „Kopiert") sind Inline. Der einzige Code-Change ist damit L2 (`CheckCheck`→`Check`, `NotificationCenter.tsx:4,195`).
> **Kontext:** Gewählt: **Option A** (Semantik-Disziplin: `CheckCircle2` = Status-Badge, `Check` = Inline/Liste, `CheckCheck` entfällt zugunsten von `Check`) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.53/5, §6).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| L0 | Stichproben-Verifikation der Semantik-Regel | Repräsentative Stellen aus §2.1 (mind. 5 `CheckCircle2`- und 3 `Check`-Fundstellen) | 🟢 Erledigt (2026-09-08) | LLM | 8 Stichprobenstellen geprüft (`reset-password:204`, `ForgotPasswordView:42`, `VaultAchievements:129`, `VaultTierShowcase:147`, `ToastContainer:61`, `InsuranceModal:113`, `NotificationCenter:247`, `GuideMessageList:472`) — 0 Gegenbeispiele |
| L1 | Vollständige Inventur & Abweichungs-Korrektur | Alle Dateien mit `CheckCircle2`/`Check`-Import in `src/` (Admin/Testing/v2 ausgenommen) | 🟢 Erledigt (2026-09-08) | LLM | 16 `CheckCircle2`- + 9 `Check`-Render-Stellen einzeln geprüft: alle regelkonform, **keine Korrektur nötig** (inkl. Grenzfall `LoginHistorySection.tsx:326` — 10px-Icon sitzt in farbigem Pill-Badge mit Label = Badge, korrekt) |
| L2 | Migration `CheckCheck` → `Check` | `src/components/layout/NotificationCenter.tsx:195` | 🟢 Erledigt (2026-09-08) | LLM | Import + Render getauscht (`:4,195`), `size={16}` + `aria-label` unverändert — `npm run typecheck` grün, kein `CheckCheck`-Import mehr außerhalb Admin/Testing |
| L3 | Verifikation & Doku-Update | `ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.2 Zeile 4) | 🟢 Erledigt (2026-09-08) | LLM | `npm run typecheck` 0 Fehler, `npm run lint` 0 Errors; Zeile 4 aktualisiert; `npm test`/`npm run build` im Gesamt-DoD |

---

## 2 — Kontext-Koffer

### 2.1 Semantik-Regel & Beispielstellen

| Icon | Regel | Beispielstellen (aus Inventur, nicht erschöpfend — L1 prüft vollständig) |
| :--- | :--- | :--- |
| `CheckCircle2` (29×) | Status-/Erfolgs-Badge (eigenständiges visuelles Element, meist mit Farbe/Kreis-Rahmen) | `ForgotPasswordView.tsx:42` (E-Mail gesendet), `reset-password/page.tsx:204` (Passwort geändert), `VaultTierShowcase.tsx:147` (Tier freigeschaltet), `VaultAchievements.tsx:129` (Achievement freigeschaltet), `BetReceiptModal.tsx` (Copy-Erfolg) |
| `Check` (11×) | Inline-Bestätigung in Liste/Formular/Button (kein eigenständiges Badge) | `InsuranceModal.tsx:113` („Ja"-Button), `NotificationCenter.tsx:249` (Achievement-Kind-Icon in Liste) |
| `CheckCheck` (1×, entfällt) | „Alle gelesen" — zu selten für eigenes Icon | `NotificationCenter.tsx:195` |

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](../public/images/27_sparkles_icon_konsolidierung_plan.md).
- Die Regel ist eine **Disziplin-Regel für künftige Entwicklung**, nicht nur ein einmaliger Umbau — L1 muss echte Abweichungen finden und korrigieren, nicht nur die Beispielstellen aus der Ursprungsinventur bestätigen.
- `Check` in `NotificationCenter.tsx:195` (nach Migration) sitzt in einem `aria-label="Mark all notifications as read"`-Button — Barrierefreiheits-Label bleibt unverändert.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung am Unicode-`✓` (Crash-Cashout) — gehört zu Plan 18.4.4.
- Keine Änderung an Admin-, `/testing`- oder `/v2`-Stellen (bewusst zurückgestellt, §16).
- Keine Änderung an der Notification-„gelesen"-Logik selbst — nur das Icon.
- Keine Änderung an Modal-/Formular-Bestätigungslogik (z. B. `InsuranceModal.tsx`-Ja/Nein-Handler).

---

## 3 — Detaillierte Meilensteine

### L0 — Stichproben-Verifikation
- **Ziel:** Bestätigen, dass die Badge-vs-Inline-Regel an mindestens 8 verifizierten Stellen zutrifft, bevor der vollständige Rollout (L1) beginnt.
- **Schritte:** Die in §2.1 gelisteten Beispielstellen lesen und gegen die Regel prüfen.
- **Erwartetes Verhalten:** 0 Gegenbeispiele in der Stichprobe.
- **Abbruchkriterium:** Bei ≥ 2 Gegenbeispielen in der Stichprobe: Stopp, Regel mit Jan neu abstimmen statt blind auf alle 40 Stellen auszurollen.

### L1 — Vollständige Inventur & Korrektur
- **Ziel:** Alle `CheckCircle2`/`Check`-Stellen in `src/` (außerhalb Admin/Testing/v2) entsprechen der Regel.
- **Schritte:** Vollständige Grep-Liste aller Importe erstellen, jede Stelle gegen die Regel prüfen, Abweichungen korrigieren.
- **Erwartetes Verhalten:** Konsistente Anwendung über alle ~40 Stellen.
- **Abbruchkriterium:** Bei struktureller Unklarheit einer einzelnen Stelle (weder klar Badge noch klar Inline) diese einzeln dokumentieren und Jan zur Entscheidung vorlegen, statt zu raten.

### L2 — Migration `CheckCheck`
- **Ziel:** `NotificationCenter.tsx:195` nutzt `Check` statt `CheckCheck`.
- **Schritte:** Import austauschen, Größe (16px) unverändert.
- **Erwartetes Verhalten:** „Alle gelesen"-Button funktional identisch, visuell konsistent zu anderen Inline-Checks.
- **Abbruchkriterium:** Keins.

### L3 — Verifikation & Abschluss
- **Ziel:** DoD grün, §18.2-Zeile 4 aktualisiert.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, Zeile aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen (dies ist der größte Diff aller 18.2-Pläne — sorgfältige Review nötig).
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur Dateien mit tatsächlicher Regel-Abweichung (aus L1) + `NotificationCenter.tsx` + §18.2-Zeile 4 — `git diff --stat` vor Abschluss gegen die L1-Fundliste gegenprüfen.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Da dies der größte Diff der 18.2-Runde ist: Screenshot-Sammlung mit mindestens 1 Beispiel je betroffener Seite (Auth, Vault, Blackjack, Notifications) zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option | Konzept | Score |
| :--- | :--- | :---: |
| **A (gewählt)** | Semantik-Disziplin: `CheckCircle2` = Badge (29 Stellen), `Check` = Inline (11 Stellen), `CheckCheck` → `Check` | **4.53** |
| B | Custom `status.success` (gpt-image-2) für alle 29 `CheckCircle2`-Stellen | 4.25 |
| C | Icon-Paar: `status.success-badge` + `status.confirm-inline` (2 Assets, 40 Stellen) | 4.10 |

Kein Tie-Break nötig (A führt bereits klar). Jan-Freigabe: **Option A**, 2026-09-06.
