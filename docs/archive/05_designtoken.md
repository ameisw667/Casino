# 05 — Design-Token-Pipeline (P45/1.29)

> **Status:** Executed (archiviert) · **Stand:** 2026-08-28 · **Owner:** LLM · **Scope:** Style Dictionary als generierte Single-Source-of-Truth für Farben, Radii/Spacing und die **exakten, bereits dokumentierten** Z-Index-Werte aus `xx_sop/04_design_system_ui.md` — **kein** harter Cutover, **keine** Normalisierung der beiden Z-Index-_Bereiche_ (siehe Abschnitt 6, Nicht-Scope).
>
> **Bezug:** [`worldmap/05_ZUKUNFTSPLANUNG.md`](../../worldmap/05_zukunftsplanung.md) Punkt `P45`/`1.29` „Design-Token-Pipeline". Options-Gate am 2026-08-25 durchgeführt, Jan hat **Option 1 (Style Dictionary)** gewählt.

## 0 — Für die ausführende LLM-Session (Selbststart-Anleitung)

Diese Datei ist bewusst so geschrieben, dass eine **neue, unabhängige Konversation** sie ohne weiteren Chat-Kontext ausführen kann.

1. Repo-eigene `CLAUDE.md`/`AGENTS.md` lädt automatisch — kein weiteres Nachfragen nötig.
2. Das **Options-Gate ist bereits abgeschlossen**: Jan hat „Option 1 (Style Dictionary)" gewählt (Referenz-Tabelle in Abschnitt 5). **Nicht erneut fragen, direkt umsetzen.**
3. Vor der Umsetzung `xx_sop/02_workflow_jan_execution.md` lesen sowie `xx_sop/04_design_system_ui.md` (Quelle der zu erfassenden Werte).
4. **Wichtig:** Style Dictionary hat zwischen v3 und v4 die Config- und Token-Syntax geändert (CommonJS → ESM/TS, `value` → `$value`/`$type`). Vor dem Schreiben der Config die aktuell zu installierende Version per `docs-lookup`-Skill/Context7 (`resolve-library-id` → `style-dictionary`) oder `npm view style-dictionary version` verifizieren, statt eine Version aus Trainingsdaten zu raten. Der `AGENTS.md`-Hinweis „This is NOT the Next.js you know" gilt sinngemäß für jede neu hinzugefügte Library in diesem Repo.
5. Abschnitt 3 enthält die **exakten Werte** (keine Annahmen nötig) für die JSON-Tokenquelle — direkt aus `xx_sop/04_design_system_ui.md` und dem verifizierten Ist-Zustand von `src/app/globals.css` übernommen.
6. Nach Umsetzung: Abschnitt 7 (Verifizierung) vollständig abarbeiten, danach Statusupdate laut Abschnitt 8.

**Money-Pfad:** Nein · **Security-Review:** Nein (rein Build-/Design-seitig, kein neuer Schreib- oder Auth-Pfad, keine neue Datenklasse/API-Grenze).

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                                          | Status                                      | Nächster Schritt | Zuständigkeit |
| ------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------- | ------------- |
| L0     | Ist-Zustand-Analyse (Code-Lesung, kein Raten)                                                        | 🟢 Executed (2026-08-25)                    | —                | LLM           |
| L1     | Style Dictionary Setup + JSON-Tokenquelle (`design/tokens.json`)                                     | 🟢 Executed (lokal, 2026-08-28)             | —                | LLM           |
| L2     | Build-Wiring (`npm run tokens:build`, generierte CSS+TS-Dateien)                                     | 🟢 Executed (lokal, 2026-08-28)             | —                | LLM           |
| L3     | Konsum-Umstellung Kern: `globals.css` nutzt generierte Werte statt Literalen                         | 🟢 Executed (lokal, 2026-08-28)             | —                | LLM           |
| L4     | Pilot-Migration: 3 Komponenten mit den promintentesten Z-Index-Literalen auf TS-Konstanten umstellen | 🟢 Executed (lokal, 2026-08-28)             | —                | LLM           |
| L5     | Automatisierte Verifizierung + visuelle Stichprobe                                                   | 🟢 Executed (lokal verifiziert, 2026-08-28) | —                | LLM           |
| L6     | Doku-Abschluss (SOP §10, Roadmap-Status)                                                             | 🟢 Executed (archiviert, 2026-08-28)        | —                | LLM           |

Die LLM übernimmt auch L5 vollständig: automatisierte Verifizierung und lokale visuelle Stichprobe. Jan hat in dieser Initiative keine verbleibende Zuständigkeit.

## 1.1 — Ausführungsnachweis (lokal, 2026-08-28)

- `npm run tokens:build` erzeugte CSS- und TS-Artefakte deterministisch (identische SHA-256-Hashes nach erneutem Lauf).
- `npm run typecheck`, `npm run lint`, `npm run test` (**149 Dateien / 1.171 Tests**) und `npm run build` sind grün.
- Der finale Build lief mit leerem SENTRY_AUTH_TOKEN; Sentry bestätigte explizit: kein Release und kein Source-Map-Upload.
- Lokale Browser-Stichprobe: globale Grundfarben unverändert, keine Konsolenfehler und Prioritäts-Modal korrekt über Navigation/Inhalt (z-index: 5000).

## 2 — Ist-Zustand (verifiziert per Code-Lesung, 2026-08-25)

- **Kein Tailwind im Projekt:** `package.json` enthält nur `prettier-plugin-tailwindcss` (Formatierungs-Plugin), keine `tailwindcss`-Dependency, kein `tailwind.config.*`, kein `@theme`-Block. Das Styling läuft vollständig über plain CSS Custom Properties in [`src/app/globals.css`](../../src/app/globals.css) plus Inline-Styles in TSX. Frühere Doku-Stellen, die „Tailwind-Tokens `z-modal`" erwähnen, sind insofern veraltet — wird in Abschnitt 8 korrigiert.
- **Bereits vorhandene CSS-Var-Basis:** `globals.css:4-93` definiert einen `:root`-Block mit aktiv genutzten Tokens (`--primary`, `--bg-color`, `--success`, `--error`, `--radius-*`, `--space-*`, `--font-*` als HSL-Tripel bzw. Clamp-Werte) **und** einem zweiten, historischen Set (`--stealth-*`, Zeilen 9-17) parallel daneben.
- **89 Dateien** unter `src/` enthalten hartkodierte Hex-Literale der Kernfarben (`#D4AF37`, `#0B0E14`, `#10B981`, `#EF4444` u. Varianten) statt der vorhandenen CSS-Vars zu nutzen.
- **156 rohe `zIndex:`-Literale in 72 TSX-Dateien** (Inline-Styles) — reines CSS kann diese Stelle nicht abdecken, da es sich um JS-Werte handelt, keine CSS-Klassen.
- **Vier Z-Index-Werte sind laut `xx_sop/04_design_system_ui.md` §5 exakt spezifiziert** (nicht nur als Bereich): `1000` (Standard Modals), `5000` (Priority Modals: `WalletModal`, `PlayerProfileModal`, `RankBenefitsModal`), `9999` (`BigWinOverlay`), `99999` (`LoadingOverlay`). Zwei weitere Zonen sind nur als **Bereich** dokumentiert (`10–35` Game Stage, `40–50` Layout/Navigation) — siehe Nicht-Scope.

## 3 — JSON-Tokenquelle (exakte Werte für `design/tokens.json`)

Diese Werte sind 1:1 aus `xx_sop/04_design_system_ui.md` und dem verifizierten `globals.css`-Ist-Zustand übernommen — keine Interpretation nötig:

**Farben (aus SOP §1):**

| Token-Name             | Wert                    | Verwendung                  |
| ---------------------- | ----------------------- | --------------------------- |
| `color.canvas.base`    | `#0B0E14`               | Globaler App-Hintergrund    |
| `color.canvas.deep`    | `#05070A`               | Tiefe Ebenen                |
| `color.gold.primary`   | `#D4AF37`               | Primäre Buttons, VIP-Badges |
| `color.gold.secondary` | `#F59E0B`               | Gold-Gradient-Ende          |
| `color.success.base`   | `#10B981`               | Gewinn/Cashout              |
| `color.success.dark`   | `#059669`               | Gewinn-Gradient-Ende        |
| `color.error.base`     | `#EF4444`               | Verlust/Fehler              |
| `color.error.dark`     | `#DC2626`               | Fehler-Gradient-Ende        |
| `color.border.glass`   | `rgba(255,255,255,0.1)` | Glassmorphism-Kanten        |

**Z-Index (aus SOP §5, nur die exakt spezifizierten Werte):**

| Token-Name                     | Wert    | Reale Komponenten                                        |
| ------------------------------ | ------- | -------------------------------------------------------- |
| `zIndex.modal.standard`        | `1000`  | `SettingsModal`, `ProvablyFairModal`                     |
| `zIndex.modal.crashTutorial`   | `2000`  | `CrashTutorial`                                          |
| `zIndex.modal.priority`        | `5000`  | `WalletModal`, `PlayerProfileModal`, `RankBenefitsModal` |
| `zIndex.overlay.bigWin`        | `9999`  | `BigWinOverlay`                                          |
| `zIndex.overlay.loadingSplash` | `99999` | `LoadingOverlay`                                         |

**Radii & Spacing (aus dem bereits bestehenden `globals.css`-`:root`-Block, hier nur in die neue Quelle übernommen, keine Wertänderung):**

| Token-Name                                | Wert                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `radius.sm` / `md` / `lg` / `xl` / `full` | `4px` / `8px` / `12px` / `20px` / `9999px`                               |
| `space.xs` … `space.xl`                   | wie aktuell in `globals.css:88-92` (Clamp-Werte, unverändert übernehmen) |

Das veraltete `--stealth-*`-Set (`globals.css:9-17`) wird **nicht** in die neue Tokenquelle übernommen — es ist durch Grep-Befund unreferenziert (vor L3 per `grep -r "stealth-" src/` final bestätigen, dann entfernen).

## 4 — Umsetzungsschritte

### 4.1 Setup (L1)

- `style-dictionary` als `devDependency` hinzufügen (Version vorher per Schritt 0.4 verifizieren).
- `design/tokens.json` mit den Werten aus Abschnitt 3 anlegen, Struktur gemäß der zu diesem Zeitpunkt aktuellen Style-Dictionary-Syntax (v4: `$value`/`$type` pro Token).

### 4.2 Build-Wiring (L2)

- Style-Dictionary-Config (`style-dictionary.config.js` oder `.mjs`, je nach verifizierter Syntax) mit zwei Build-Targets:
  1. CSS Custom Properties → `src/styles/tokens.generated.css`
  2. Typisierte TS-Konstanten → `src/lib/design/tokens.generated.ts`
- Neues npm-Script `"tokens:build": "style-dictionary build"` in `package.json`.
- **Commit-Konvention (Annahme, reversibel):** Generierte Dateien werden **eingecheckt**, nicht `.gitignore`t — vermeidet einen zusätzlichen Build-Schritt in der bestehenden Vercel-GitHub-Integration. Bei Token-Änderungen: `npm run tokens:build` lokal ausführen, Diff der generierten Dateien mitcommitten. Falls Jan eine automatische Generierung im Build-Pipeline bevorzugt, ist das ein einzeiliger Change in `package.json` (`"build": "npm run tokens:build && next build"`) — kann jederzeit nachträglich umgestellt werden.

### 4.3 Konsum-Umstellung Kern (L3)

- `src/app/globals.css`: `@import '../styles/tokens.generated.css';` ergänzen; die manuell gepflegten Äquivalente im bestehenden `:root`-Block durch die generierten Custom Properties ersetzen (kein Wertunterschied — reine Quelle-Umstellung, visuell identisch).
- Verwaistes `--stealth-*`-Set entfernen (nach Grep-Bestätigung aus Abschnitt 3).

### 4.4 Pilot-Migration (L4)

Bewusst nur 3 Dateien als Konzeptnachweis (kein harter Cutover laut Roadmap-Vorgabe), ausgewählt weil sie die dokumentierten `5000`/`9999`-Werte 1:1 real nutzen:

- `src/components/casino/WalletModal.tsx` — `zIndex: 5000` → `zIndex: Z_INDEX.modal.priority`
- `src/components/casino/PlayerProfileModal.tsx` — `zIndex: 5000` → `zIndex: Z_INDEX.modal.priority`
- `src/components/casino/BigWinOverlay.tsx` — `zIndex: 9999` → `zIndex: Z_INDEX.overlay.bigWin`

(Exakter `old_string`/`new_string`-Anker muss die ausführende Session im jeweils aktuellen File-Stand suchen — Zeilennummern sind seit der Analyse in Abschnitt 2 nicht garantiert stabil.)

## 5 — Bereits abgeschlossenes Options-Gate (Referenz, nicht erneut ausführen)

| Option                 | Konzept                                                                                            | Status                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Option 1 (gewählt)** | Style Dictionary: eine JSON-Quelle generiert CSS Custom Properties + typisierte TS-Konstanten      | ✅ Gewählt von Jan (2026-08-25)                                                         |
| Option 2               | Kein neues Tool: manuelle CSS-Var-Konsolidierung + handgepflegte TS-Konstanten-Datei mit Sync-Test | ⚪ Nicht gewählt (Sync-Risiko zwischen zwei manuell gepflegten Quellen bleibt bestehen) |
| Option 3               | Nur Farben, Z-Index in dieser Runde ausklammern                                                    | ❌ Nicht gewählt (löst das in der SOP explizit dokumentierte Z-Index-Problem nicht)     |

## 6 — Nicht-Scope

- **Keine Normalisierung** der beiden nur als Bereich dokumentierten Z-Index-Zonen (`10–35` Game Stage, `40–50` Layout/Navigation) auf einen einzigen kanonischen Wert — das wäre eine sichtbare, strukturelle Verhaltensänderung über viele Komponenten hinweg und bräuchte ein eigenes Options-Gate.
- **Keine vollständige Migration** aller 89 Farb-Literal-Dateien oder aller 156 Z-Index-Literale — nur die 3 Pilot-Dateien in L4, Rest folgt schrittweise in Folge-Sessions.
- **Kein Tailwind-Setup** — das Projekt nutzt aktuell kein Tailwind; diese Initiative fügt keins hinzu.
- **Keine Änderung an Framer-Motion-Spring-Configs** (`springTransition` in `xx_sop/04_design_system_ui.md` §4) — nur Farben/Radii/Spacing/Z-Index, wie im Roadmap-Scope benannt.
- **Kein CI-Staleness-Check** für generierte Dateien (z. B. „generierte Datei entspricht `tokens.json`") — bewusst als spätere, optionale Erweiterung offengelassen, um den Erst-Scope klein zu halten.

## 7 — Verifizierung

Automatisiert (LLM, in dieser Reihenfolge):

```bash
npm run tokens:build
npm run typecheck
npm run lint
npm run test
npm run build
```

Alle fünf müssen grün/fehlerfrei sein. Zusätzlich: `npm run tokens:build` zweimal hintereinander ausführen — der zweite Lauf darf keinen Diff erzeugen (Determinismus-Check).

Lokal-visuell (LLM):

- Prioritäts-Modal und globale Grundfarben in der lokalen App prüfen; zusätzlich die drei migrierten Komponenten gegen ihre unveränderten, generierten Z-Index-Werte prüfen. Layering/Optik muss identisch zum Stand vor dieser Initiative sein.
- Stichprobe der globalen Grundfarben (Hintergrund, Gold-Akzente, Erfolg/Fehler-Farben) auf einer beliebigen Seite — kein sichtbarer Farbsprung.

## 8 — Statusupdate nach erfolgreicher Verifizierung (L6, LLM)

Im selben Edit-Schritt zu aktualisieren, sobald L5 vollständig grün verifiziert ist:

1. Kopfstatus dieser Datei: `Execution-Ready` → `Executed (archiviert)`, Meilenstein-Tabelle in Abschnitt 1 auf 🟢 für alle Zeilen.
2. `xx_sop/04_design_system_ui.md` §10 „Bekannte offene Probleme": Eintrag 1 (Z-Index-Migration) um den Hinweis ergänzen, dass die vier exakt spezifizierten Werte jetzt aus `design/tokens.json` generiert werden; veraltete Tailwind-Erwähnung („Migration auf Tailwind-Tokens") korrigieren, da kein Tailwind im Projekt existiert.
3. `worldmap/05_ZUKUNFTSPLANUNG.md` Abschnitt 1 (Jan-Übersicht) Zeile `P45`/`1.29`: Status auf 🟢 „Ausgeführt" setzen; Abschnitt 3 `#### 1.29`-Block um einen Inline-Nachweis-Absatz ergänzen (Muster: siehe `1.19`/`1.22`).
4. Diese Datei danach gemäß `xx_sop/03_workflow_jan_planungsdateien.md` §2 nach `docs/archive/` verschieben.

## 9 — Selbstprüfung (laut `xx_sop/03_workflow_jan_planungsdateien.md` §4)

- Scope gegenüber `05_ZUKUNFTSPLANUNG.md`/`1.29` klar abgegrenzt (Pilot-Migration statt Vollmigration, keine Z-Index-Bereichs-Normalisierung). ✅
- Abhängigkeiten und Reihenfolge benannt; keine Jan-Entscheidung oder -Abnahme erforderlich. ✅
- Keine neue Datenklasse/API-Grenze/Schreiboperation → keine Allowlist/Negativtest/Fallback nötig. ✅ (N/A)
- Alle Statusbehauptungen in dieser Datei sind als **lokal** (Code-Lesung 2026-08-25) gekennzeichnet, keine Live-Behauptung. ✅
- Kein Inhalt doppelt als SOP/Kontextreferenz/Plan gepflegt — verlinkt auf `xx_sop/02_workflow_jan_execution.md` und `xx_sop/04_design_system_ui.md` statt sie zu kopieren. ✅
- Datei ist für eine neue, unabhängige LLM-Session ohne weiteren Chat-Kontext ausführbar (Abschnitt 0 + exakte Werte in Abschnitt 3, keine Rate-Notwendigkeit außer der bewusst offen gelassenen Library-Versions-Verifikation in Schritt 0.4). ✅
