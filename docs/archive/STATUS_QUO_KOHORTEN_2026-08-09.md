# 02 — Status quo nach Aufsichts-Kohorten

> **Marker-Datei.** 95 % LLM-Input / 5 % Jan-Übersicht.
> Messdatum: **2026-08-09** · Kohorten = die 9 Aufsichts-Rollen aus `AGENTS.md`.
> Alle Werte aus dieser Session ausgeführten Befehlen (Abschnitt 4), nicht aus dem Bauch.
> Vorgänger: [00_WORLDMAP_STATUS.md](../../worldmap/00_WORLDMAP_STATUS.md) (12 Kategorien, Stand 2026-08-09).

---

## 1 — Übersicht für Jan

**Gesamtbewertung:** Projekt ist produktionsreif über alle 12 Kategorien (Niveau Top 15–40 %). Aktuelle Dynamik ist **massiver v2-Redesign in flight** (Homepage + Slots + Login), teilweise verdrahtet, teilweise verwaist, mit zwei parallelen Tracks und Doku-Drift. Kein kritischer Prod-Blocker; alles wird gut **mit zwei Entscheidungen von dir** (v2-Track wählen; Migration 014 rollouten).

**Skala:** Top 1 % = Weltklasse (beste) → Top 100 % = schlechtestes Viertel (alles wäre besser). Risiko/Aufwand: Hoch/Mittel/Niedrig. Status: ✅ Abgeschlossen / 🟡 In Arbeit / 🔴 Offen / ⚪ Nicht begonnen.

| #   | Kohorte (Aufseher)              | Status               | Kennzahl (Session)                                                                                                                                                         | Blocker offen                                                          | Risiko  | Aufwand | Niveau       | Wird gut?             |
| --- | ------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------- | ------- | ------------ | --------------------- |
| 1   | Vibe-Architect (Orchestrierung) | 🟡 In Arbeit         | 65 uncommittete Pfade; 2 parallele v2-Tracks; 1 uncommittete Migration (014)                                                                                               | v2-Track-Entscheidung; Migration-014-Rollout                           | Mittel  | Mittel  | **Top 30 %** | Ja (mit Entscheid)    |
| 2   | Security-Auditor (Wallet/API)   | ✅ Bis Upstash/RLS   | 3/3 Supabase-ENV; 0/2 Upstash-ENV (fail-closed 503); 0 TS-Fehler                                                                                                           | Upstash-ENV setzen (P1)                                                | Niedrig | Niedrig | **Top 15 %** | Ja                    |
| 3   | Logic-Architect (Service/RNG)   | ✅ Bis Commit-Reveal | 5 Spiele server-autoritär; 231/231 Tests; 0 `Math.random` in Logik                                                                                                         | Commit-Reveal-Schema (optional)                                        | Niedrig | Mittel  | **Top 15 %** | Ja                    |
| 4   | Bug-Hunter (Edge-Cases)         | 🟡 In Arbeit         | 1 Stats-Bug gefixt (014, uncommittet); 231/231 Tests; 0 TS-Fehler                                                                                                          | Migration 014 rollout; Worker-Timeout-Flake beobachtet                 | Mittel  | Niedrig | **Top 25 %** | Ja                    |
| 5   | Design-Guardian (Kohärenz)      | 🟡 In Arbeit         | 33 Lint-Warnings (↑26); 2 verwaiste Komponenten; 9 Dateien >600 Zeilen (Max 1.680)                                                                                         | v2-Track-Entscheidung; Verwaiste entfernen/verdrahten; `no-img` in v2  | Niedrig | Mittel  | **Top 30 %** | Ja (mit v2-Entscheid) |
| 6   | UI-Animator (Motion/Win)        | 🟡 In Arbeit         | Crash +282/-50 visual tension; 8 Canvas/WebGL-Komponenten (6 verdrahtet, 2 verwaist); Reduced-Motion ✅                                                                    | Live-Visu-Verifikation offen (`document.hidden`)                       | Niedrig | Niedrig | **Top 20 %** | Ja                    |
| 7   | Growth-Hacker (XP/VIP)          | ✅ Abgeschlossen     | 5 VIP-Tiers + 5 Ranks remote; 27/27 Outsourcing-Tests; Feature-Stripdown 2026-08-08                                                                                        | Achievements-Auslagerung (Kat. 12 Rest)                                | Niedrig | Mittel  | **Top 20 %** | Ja                    |
| 8   | DevOps-Slayer (Build/SEO)       | ✅ Abgeschlossen     | 11/11 Routen mit Metadata (via `layout.tsx`, nicht `page.tsx` — Client-Seiten können kein `metadata` exportieren); 0 TS-Fehler; 33 `no-img`-Warnings; `format:check` 100 % | Build diese Session nicht neu gemessen; 33 `no-img`-Warnings (bewusst) | Niedrig | Niedrig | **Top 20 %** | Ja                    |
| 9   | Vibe-Cop (Pre-Commit)           | 🟡 In Arbeit         | Pre-Commit-Gate aktiv; 162 Dateien abweichend formatiert (doc)                                                                                                             | Review des v2-Stands; Formatierungslauf                                | Niedrig | Niedrig | **Top 30 %** | Ja                    |

**Kennzahlen-Spalten:** Kennzahl (Session) = dieser Session gemessen · Blocker offen = zählbare offene Punkte · Risiko = Folgen bei Ignorieren · Aufwand = bis nächste Stufe.
**Wird gut?** = Ja/Nein, ob diese Kohorte ohne Eingreifen gut ausgeht. 9/9 = Ja; 4/9 mit Bedingung (v2-Track-Entscheidung bzw. Migration-014-Rollout).

---

## 2 — Gesamtbewertung

| Metrik                     | Wert                                                     | Quelle                                                                    |
| -------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| Tests                      | 231/231 grün, 24 Dateien, 0 Fehler                       | `npm run test`, sauberer Run                                              |
| TypeScript                 | 0 Fehler                                                 | `npm run typecheck`                                                       |
| ESLint                     | 0 Fehler, 33 Warnings                                    | `npm run lint`                                                            |
| Build                      | grün (nicht diese Session neu gemessen)                  | [02_BUILD_TOOLCHAIN.md](../status-reports/02_BUILD_TOOLCHAIN.md)          |
| Uncommittet                | 65 Pfade, ~1850 Einfügungen / 952 Löschungen, 43 Dateien | `git status --porcelain`                                                  |
| Prod-Ready (12 Kategorien) | 12/12 Ja, Niveau Top 15–40 %                             | [00_WORLDMAP_STATUS.md](../../worldmap/00_WORLDMAP_STATUS.md) Abschnitt 1 |
| Offene manuelle Schritte   | 2 (Migration 014 rollout; Upstash-ENV)                   | diese Datei                                                               |

**Stärken:** Server-autoritäres Wallet (atomare RPCs, Idempotenz), Provably-Fair-HMAC für 5 Spiele, Clerk vollständig entfernt, Auth live regressionsgetestet, Pre-Commit-Gate aktiv, 231 grüne Tests.

**Schwächen / aktive Risiken:**

1. **v2-Redesign ungebündelt** — zwei parallele Tracks (`/v2`-Route via `src/components/v2/*` UND in-place Homepage-Redesign via `src/components/home/*`), plus `/games/slots/v2`. Verwaiste Komponenten: `LiquidRippleCanvas`, `WebGlGlassMeshCanvas` (0 Imports). Kein klarer "welcher Track gewinnt".
2. **Migration 014 uncommittet/ungerollt** — fixt echten Bug: `get_user_stats` hatte 100 % Winrate (`amount < balance_after` war immer true). Betrifft angezeigte Lifetime-Stats. Fertig als SQL, wartet auf Ausführung im Supabase Dashboard.
3. **Doku-Drift** — CLAUDE.md referenziert 4× `/backend` (Seite gelöscht im Working Tree).
4. **SEO-Hygiene** — 11/18 `page.tsx` ohne `metadata`-Export, darunter Homepage `/`.
5. **Formatierung** — 162 Code-Dateien weichen vom Prettier-Standard ab (doc, kein `--write`-Lauf).

**Niveau-Gesamteinschätzung: Top 20 %.** Solide produktionsreif mit dokumentierten, nicht-kritischen Lücken. Die v2-Arbeit drückt aktuell aufs Niveau, weil sie ungebündelt ist — ist aber WIP, kein Endzustand.

---

## 3 — Kohorten-Bewertung (meine Sicht)

**Höchste Reife (Top 15 %): Security-Auditor + Logic-Architect.**
Beide auf Weltklasse-Niveau für ein Hobby-/Indie-Projekt. Server-autoritär, atomic, fail-closed, kein `Math.random` in Logik. Offene Punkte sind bewusst vertagt (Commit-Reveal = Zukunftsoption; RLS = nur bei künftigem Client-Pfad). Kein Eingreifen nötig.

**Solide, leichte Schulden (Top 20–25 %): Growth-Hacker + DevOps-Slayer + Bug-Hunter.**

- Growth-Hacker: Feature-Stripdown war aufräumend, VIP-Config sauber ausgelagert. Rest (Achievements-Auslagerung) ist Kosmetik.
- DevOps-Slayer: Build stabil, aber Metadata-Lücke ist ein echter SEO-Hygiene-Fehler, den die eigene Regel ("jedes page.tsx muss metadata exportieren") verletzt — schnell behebbar.
- Bug-Hunter: Migration 014 ist der **höchste Hebel pro Aufwand** — ein echter User-facing Stats-Bug, Fix liegt fertig als SQL.

**Aktive Baustellen (Top 30 %): Vibe-Architect + Design-Guardian + Vibe-Cop.**
Diese drei hängen an derselben Wurzel: dem ungebündelten v2-Redesign. Vibe-Architect muss den Track entscheiden; Design-Guardian muss Verwaiste aufräumen + `no-img`-Warnings; Vibe-Cop muss den v2-Stand reviewen + Formatierung laufen lassen. Erst wenn das entschieden ist, steigen alle drei.

**Bewegung im Fluss (Top 20 %): UI-Animator.**
Crash-Visual-Tension sauber umgesetzt (reduced-motion + mobile-throttling + deterministischer PRNG). 6/8 neue Canvas/WebGL-Komponenten verdrahtet. Einzige Lücke: pixelgenaue Live-Visu nicht verifizierbar (`document.hidden` pausiert rAF) — Code-seitig per Simulation bestätigt.

**Mein klares Bild:** Nichts ist kaputt. Die Hauptfrage ist nicht _ob_, sondern _welches v2_. Solange das offen ist, arbeitet ein Teil der Kohorten gegeneinander statt zusammen.

---

## 4 — Verifikation (diese Session ausgeführt)

| Befehl                                                       | Ergebnis                                                                                                                                |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                          | 0 Fehler                                                                                                                                |
| `npm run lint`                                               | 0 Fehler, 33 Warnings (↑26; fast alle `no-img-element` aus v2-`<img>`)                                                                  |
| `npm run test` (sauberer Run)                                | 24 Dateien, 231/231 grün, 0 Fehler                                                                                                      |
| `npm run test:coverage`                                      | **nicht vertrauenswürdig** — Store-Worker-Timeout unter paralleler Last (flaky, keine echte Regression); Coverage nicht sauber gemessen |
| `git status --porcelain \| wc -l`                            | 65                                                                                                                                      |
| `git diff --stat HEAD`                                       | 43 Dateien, +1850/−952                                                                                                                  |
| `grep -rl` der 8 neuen home-Komponenten                      | 6 in `HomeClientV2.tsx` importiert; `LiquidRippleCanvas` + `WebGlGlassMeshCanvas` = 0 Imports (verwaist)                                |
| `find src/app -name page.tsx` + `grep metadata`              | 7/18 mit Metadata-Export                                                                                                                |
| `grep -c /backend CLAUDE.md`                                 | 4 (Doku-Drift, Seite gelöscht)                                                                                                          |
| `find src/app/v2 src/components/v2 src/app/games/slots/v2`   | 2 parallele v2-Tracks + parallele Slots-v2-Route existieren                                                                             |
| Migration 014 (`supabase/migrations/014_fix_user_stats.sql`) | existiert, uncommittet; fixt Winrate-100%-Bug                                                                                           |

**Hinweis zu Coverage:** Dokumentierte Werte (wallet 100 % Branches, store 66,2 %/85,05 %) konnten diese Session nicht reproduziert werden, weil der Coverage-Run unter paralleler Last den Store-Worker verlor. Sauberer `npm run test` (ohne Coverage) läuft fehlerfrei → Code-Regression ausgeschlossen, nur der Coverage-Messlauf ist zu wiederholen.

---

## 5 — Nächster Schritt

### ✅ Erledigt (2026-08-09, autonomous 4-Track-Execution)

| Track | Maßnahme                     | Ergebnis                                                                                                                                                                                                                                                                                                                     |
| ----- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A     | Verwaiste Canvas-Komponenten | `LiquidRippleCanvas.tsx` + `WebGlGlassMeshCanvas.tsx` **gelöscht** (0 Refs, Barrel safe). Begründung: `LobbyAmbientBackground` + `WebGlWaterRefractionCanvas` übernehmen die Ambient-Rolle; Glass-Mesh (50×50) ist GPU-teuer → bei Mobile-LCP 5,7s kein Verdrahten (YAGNI).                                                  |
| B     | Metadata-Exporte             | **Kein Code-Change nötig** — False Positive korrigiert: alle 11 Routen haben vollwertige Metadata auf `layout.tsx`-Ebene (Client-`page.tsx` kann kein `metadata` exportieren). `02statusquo.md` + `AGENTS.md`-DevOps-Regelwortlaut korrigiert.                                                                               |
| C     | CLAUDE.md `/backend`-Drift   | `/backend`-Sektion entfernt (Tombstone-Zeile); Zeile 94 korrigiert (`/v2`-Sandbox statt `/backend`; Modal-Liste ohne `DailyReward`/`Challenges` — beim Stripdown 2026-08-08 entfernt). `02_CLERK_SUPABASE.md` nur historische `/backend`-Referenzen → unangetastet.                                                          |
| D     | Formatierungslauf            | `npm run format` (prettier --write) über `src/`/`scripts/`/`tests/` → `format:check` 100 % konform. **2 brittle Source-String-Tests durch Format freigelegt und format-resilient gemacht** (`proxy-security-headers.test.ts`: Whitespace-normalisierte Assertionen; `performance-mobile.test.ts`: quote-agnostisches Regex). |

**Verifikation nach Execution:** typecheck 0 Fehler · lint 0 Fehler / 33 `no-img`-Warnings · test 24 Dateien 231/231 grün · `format:check` 100 % · CLAUDE.md `/backend` = 1 Tombstone.

### 🔴 Noch offen (brauchen Jan)

| Prio | Maßnahme                                                                          | Kohorte          | Typ           |
| ---- | --------------------------------------------------------------------------------- | ---------------- | ------------- |
| 1    | Migration 014 ausführen (Supabase Dashboard) — fixt echten Winrate-100%-Stats-Bug | Bug-Hunter       | manuell (Jan) |
| 2    | v2-Track entscheiden: in-place Homepage ODER `/v2`-Route, anderes archivieren     | Vibe-Architect   | Jan-Entscheid |
| 3    | Upstash-ENV setzen — aktiviert Rate-Limit in Production                           | Security-Auditor | manuell (Jan) |

**Empfehlung:** 1 (Migration 014) und 2 (v2-Track-Entscheidung) zuerst — beides blockiert bzw. entblockiert am meisten. 1 braucht deinen Supabase-Zugang, 2 braucht deine Entscheidung.
