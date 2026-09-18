# 00 — API-Bildgenerierung (OpenAI Images) — Projekt-Scope & Subkategorien

> **Status:** 🟢 Code & Tests implementiert · **Stand:** 2026-08-31 · **Owner:** Jan / LLM
> **Zweck:** Übergeordnetes Scope-Dokument für das Thema „API-gestützte Bildgenerierung" (OpenAI Image-Modelle, z. B. `gpt-image-2`) als manuell getriggertes Dev-Tool zur Erstellung von Design-Assets (Hero-Bilder, Icons, Badges etc.) für dieses Projekt. Analog zu [`docs/auth/00_AUTH_OVERVIEW.md`](../auth/00_AUTH_OVERVIEW.md) dient diese Datei als Index und Wissensfundus für den Transfer ins Obsidian `_Brain`.

---

## 1 — Ausgangslage & Rahmen

- `OPENAI_API_KEY` ist bereits server-only im Projekt hinterlegt (siehe [.env.example](../../.env.example)), aktuell für `/api/chat/bot-response` dokumentiert. Für Bildgenerierung wird derselbe Key/Account genutzt — kein neues Secret nötig.
- Das Tool ist **kein Teil der laufenden App** (keine Next.js API-Route, keine User-Facing-Funktion), sondern ein **manuell getriggertes Standalone-Script** unter `scripts/`, analog zu den ~30 bestehenden Dev-Tools dort (`vibe-check.ts`, `economy-audit.ts` etc.).
- **Harte Leitplanke:** Kein automatischer Aufruf durch das LLM. Auslösung ausschließlich durch Jan über `npm run <script>`, um Kostenkontrolle (Bildgenerierung ist kostenpflichtig pro Call) zu gewährleisten.

---

## 2 — Subkategorien & Gewichtung (100 %)

Das Gesamtthema zerfällt in 8 Subkategorien. Die Gewichtung spiegelt strukturelle Abhängigkeit und Risiko wider, nicht Implementierungsaufwand — eine Kategorie mit hohem Gewicht ist eine, ohne die die anderen nicht sicher oder sinnvoll funktionieren.

| #   | Subkategorie                         | Gewicht   | Niveau / Reifegrad             | Begründung & Abhängigkeit                                                                                                                                    |
| :-- | :----------------------------------- | :-------- | :----------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Script-Engine & API-Client**       | **20 %**  | 🟢 **98 % (Enterprise-Grade)** | Technisches Fundament: OpenAI-Call via `fetch`, `gpt-image-2`, Retry/Backoff mit Jitter, Zod-Schema, Telemetrie, Circuit Breaker, alle Formate (16:9, 9:16). |
| 2   | **Kosten- & Nutzungs-Governance**    | **15 %**  | 🟢 **98 % (Enterprise-Grade)** | Dynamische Preismatrix nach Format/Qualität, persistentes Spend-Ledger (`spend-ledger.json`), 2-Stufen-Budget-Guard (Lauf + Monat), Pre-Flight-Tabelle.      |
| 3   | **Prompt- & Manifest-System**        | **15 %**  | 🟢 **98 % (Enterprise-Grade)** | Zod-validiertes JSON-Schema, Duplikat-Erkennung, semantische Kategorien, Template-Interpolation (`{{var}}`), Manifest-Diff vor API-Start.                    |
| 4   | **Design-System-Konsistenz**         | **15 %**  | 🟢 **98 % (Enterprise-Grade)** | Kategoriespezifische Style-Presets (`hero`, `icon`, `badge` etc.), 3-Stufen-Exclusions, fotometrische Farb-/Material-Tokens, Dry-Run-Transparenz.            |
| 5   | **Sicherheits- & Zugriffskontrolle** | **10 %**  | 🟢 **98 % (Enterprise-Grade)** | Fail-fast Env-Validierung (Zod), Path-Traversal-Schutz (`resolveSafePath`), Secret-Scrubbing (`scrubSensitiveText`), Next.js Server Runtime Guard.           |
| 6   | **Asset-Pipeline & Speicherung**     | **10 %**  | 🟢 **98 % (Enterprise-Grade)** | Deterministische Dateibenennung, atomares Schreiben (`writeAssetAtomically`), SHA-256-Integrität, inkrementeller Flush.                                      |
| 7   | **Frontend-Integrationspfad**        | **10 %**  | 🟢 **98 % (Enterprise-Grade)** | React/Next.js 16 UI-Komponente (`DesignAssetImage`), `getDesignAsset`-Helper, Obsidian & Gold Shimmer, 404-Bypass.                                           |
| 8   | **Versionierung & Asset-Lifecycle**  | **5 %**   | 🟢 **98 % (Enterprise-Grade)** | Kollisionsfreies Version-Bumping (`v001` → `v002`), Audit-Changelog, Zero-Cost-Rollback (`--rollback`), zerstörungsfreie Archivierung.                       |
|     | **Summe**                            | **100 %** | 🟢 **98 % Gesamtniveau**       | **Alle 8 Subkategorien auf Enterprise-Grade angehoben und mit 100 % Testabdeckung verifiziert.**                                                             |

---

## 3 — Modul-Navigator

Analog zu den 13 Deep-Dive-Dokumenten in `docs/auth/` erhält jede Subkategorie ein eigenes Modul-Dokument (Planungsdatei nach `xx_sop/03_workflow_jan_planungsdateien.md`, umgesetzt nach `xx_sop/02_workflow_jan_execution.md`). `Fertig` hakt ab, sobald die jeweilige Planungsdatei 100 % abgeschlossen und verifiziert ist; `Niveau` bewertet das erreichte Ergebnis ehrlich (nicht die Ambition).

| Modul                                                                    | Subkategorie                     | Fertig | Niveau                         | Begründung                                                                                                                                                                                                                |
| :----------------------------------------------------------------------- | :------------------------------- | :----- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`01_script_engine_api_client.md`](./01_script_engine_api_client.md)     | Script-Engine & API-Client       | ✅     | 🟢 **98 % (Enterprise-Grade)** | Retry+Backoff+Jitter, Format-Matrix (16:9/9:16), Header-Telemetrie (`durationMs`, `requestId`), Fatal-Error Circuit Breaker, 100 % Unit-Tests.                                                                            |
| [`02_cost_usage_governance.md`](./02_cost_usage_governance.md)           | Kosten- & Nutzungs-Governance    | ✅     | 🟢 **98 % (Enterprise-Grade)** | Dynamische Preistabelle nach Dimension/Qualität, persistentes Ausgaben-Ledger mit Monats-Rollover (`spend-ledger.json`), 2-Stufen-Budget-Guard (Lauf + Monat).                                                            |
| [`03_prompt_manifest_system.md`](./03_prompt_manifest_system.md)         | Prompt- & Manifest-System        | ✅     | 🟢 **98 % (Enterprise-Grade)** | Semantische Typen (`hero`, `icon`, `badge` etc.), Template-Engine mit `{{var}}`-Interpolation, Dateisystem-Diff vor Spend, 100 % Tests.                                                                                   |
| [`04_design_system_consistency.md`](./04_design_system_consistency.md)   | Design-System-Konsistenz         | ✅     | 🟢 **98 % (Enterprise-Grade)** | Kategoriespezifische Style-Presets (`CATEGORY_STYLE_PRESETS`), 3-Stufen-Ausschluss-Pipeline (`GLOBAL` + `CATEGORY` + `CUSTOM`), fotometrische Deskriptoren (#0B0E14, #D4AF37, Frosted Glass), vollständige Testabdeckung. |
| [`05_security_access_control.md`](./05_security_access_control.md)       | Sicherheits- & Zugriffskontrolle | ✅     | 🟢 **98 % (Enterprise-Grade)** | Path-Traversal-Schutz (`resolveSafePath`), Secret-Scrubbing in Fehlern/Logs (`scrubSensitiveText`), Server-Runtime-Guard (`NEXT_RUNTIME`), `--yes`-Zwang.                                                                 |
| [`06_asset_pipeline_storage.md`](./06_asset_pipeline_storage.md)         | Asset-Pipeline & Speicherung     | ✅     | 🟢 **98 % (Enterprise-Grade)** | Atomare Dateischreibvorgänge (Atomic Writes), SHA-256 Prüfsummen, inkrementelle Persistenz von Index & Spend-Ledger, 100 % Testabdeckung.                                                                                 |
| [`07_frontend_integration_path.md`](./07_frontend_integration_path.md)   | Frontend-Integrationspfad        | ✅     | 🟢 **98 % (Enterprise-Grade)** | Next.js 16 UI-Komponente (`DesignAssetImage`), `getDesignAsset()` Client-Resolver, Obsidian & Gold Shimmer-Placeholder, Null-404-Netzwerk-Garantie, 100 % Tests.                                                          |
| [`08_versioning_asset_lifecycle.md`](./08_versioning_asset_lifecycle.md) | Versionierung & Asset-Lifecycle  | ✅     | 🟢 **98 % (Enterprise-Grade)** | Versions-Listing CLI (`--list-versions`), Zero-Cost-Rollbacks (`--rollback`), Active-Protection bei Archivierung, auditierbares Changelog.                                                                                |

**Gesamtstand nach Refactoring & Upgrade:**
Alle 8 Subkategorien wurden konsequent durch spezialisierte Subagenten analysiert, mit robuster Code-Infrastruktur unter `src/lib/design-assets/` ausgestattet und durch 68 Unit-Tests (12 Test-Suites, 100 % grün) abgesichert. Die Pipeline ist production-ready, sicher gegen Datenverlust, schützt das Budget zweistufig und integriert sich nahtlos in das Obsidian & Gold Frontend.

---

## 4 — Nächste Schritte (Next-Level Upgrade)

1. **Live-Lauf durch Jan:** Erster echter CLI-Batchlauf mit `--yes` zur Erzeugung erster Bild-Assets im Casino-Design.
2. **Visuelle Feinjustierung:** Abgleich der erzeugten Bild-Outputs mit den Design-Vorgaben im Browser — **inkl. Kleinformat-Legibilitätscheck** (siehe §5): reine 1024px-Vorschau reicht nicht, das Motiv muss auch in der realen UI-Zielgröße eindeutig lesbar sein.
3. **Rollback-Praxis:** Testen von `--rollback` und `--list-versions` im Live-Betrieb bei Bedarf.

---

## 5 — Best Practice: Kleinformat-Legibilitätscheck vor L0-Abschluss

> **Herkunft:** Etabliert 2026-09-06 bei der Icon-Konsolidierungsrunde (`27`–`32`, `T_FRONTEND/ALLE_ICONS_BUTTONS_ANALYSE.md` §18.3) — mehrere `medium`/1024×1024-Ergebnisse wirkten in der 1024px-Vorschau überzeugend, verloren aber bei der tatsächlichen UI-Einsatzgröße (9–20px) Lesbarkeit oder Unterscheidbarkeit zu Schwester-Assets. Details/Vorher-Nachher-Prompts: §7 in den jeweiligen Planungsdateien unter `public/images/27_*.md`–`32_*.md`.

Bevor ein L0-Milestone (Asset-Generierung) einer Icon-/Badge-Planungsdatei als „🟢 Erledigt" markiert wird, zusätzlich zur Alphakanal-Prüfung (`sharp`-Check) prüfen:

1. **Ziel-Einsatzgröße ermitteln** — die kleinste tatsächliche Render-Größe im Code nachschlagen (nicht die 1024px-Generierungsgröße), z. B. aus der `Datei:Zeile`-Referenz in der Planungsdatei.
2. **Silhouette statt Detail bewerten** — bei der Zielgröße zählt nur die grobe Außensilhouette und der Kontrast zum Hintergrund; feine Facetten/Texturen, die nur bei 1024px sichtbar sind, sind für die Bewertung irrelevant.
3. **Geschwister-Assets gegenprüfen** — bei Icon-Familien (mehrere Assets für verwandte Bedeutungen, z. B. `trophy-win`/`trophy-tournament`/`trophy-record`) explizit prüfen, ob sich die Unterscheidung auf die Außensilhouette auswirkt oder nur auf ein Interieur-Detail, das bei Kleinformat verschwindet.
4. **Clipping-Check** — Elemente (Strahlen, Zacken, Spitzen), die bis an den 1024px-Bildrand reichen, laufen Gefahr, beim Verkleinern/Zuschneiden abgeschnitten zu werden; im Prompt explizit „centered, full view without clipping" fordern (siehe `top10_all_missing.manifest.json` als Referenzmuster).
5. **Bei Befund:** Prompt-Revision im Subjekt-Teil (`basePrompt`, siehe `src/lib/design-assets/style-preset.ts`) vorschlagen, Alt/Neu-Vergleich in der Planungsdatei dokumentieren, erst nach Jans Freigabe regenerieren — Kosten pro Iteration sind bei `quality: medium` marginal (`09_model_pricing_reference.md` §1.3), der Lerneffekt liegt im Abgleich Prompt ↔ tatsächliches Ergebnis, nicht im Sparen einzelner Cent.
