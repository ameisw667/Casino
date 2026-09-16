# 03a-R01 — Natürliche Slicing-Grenzen (Regel 1)

> **Status:** Executed (2026-09-14; L0–L4 ✅, Verifikation grün: typecheck 0 Fehler, 1846/1846 Tests; Rest-Hebel #5 wartet auf R03-Jan-Gate) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Abschnittsmarkierung + Grenz-Dokumentation + Ref-Bündelungs-Vorbereitung; keine Code-Logik-Änderung außer Kommentaren, kein wallet.ts-Methoden-Refactor (→ R03).
> **Money-Pfad:** Ja (`wallet.ts` wird berührt — ausschließlich Kommentar-Edits) · **Security-Review:** Pflicht (read-only Review vor Abschluss, erwartet PASS bei reinen Kommentaren)
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R1 (Niveau 65 %, Bottlenecks #4/#5/#7)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                                                       | Scope (Dateien)                                                                                    | Ausführung  | Status     | Zuständigkeit | Verifikation                                                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------- | --------------------------------------------------------------------- |
| L0     | Baseline & Diagnose: aktuelle Grenz-Zustände dokumentieren (wallet.ts ohne Abschnittsmarker, useCrashGameLoop mit 3 markierten Sektionen, Grenz-Entscheidungen undokumentiert)                                                                                                    | read-only: `src/lib/casino/wallet.ts`, `src/components/casino/games/crash/useCrashGameLoop.ts`     | Sequenziell | 🔴 Geplant | LLM           | Befundliste mit Z-Bereichen                                           |
| L1     | Abschnittsmarkierung `wallet.ts`: Kommentar-Header je Domänen-Cluster (Wallet/Settlement, Crash-Reconciliation, Seeds, Promo, Social/Chat, Gamification) — 0 Logikänderung                                                                                                        | `src/lib/casino/wallet.ts`                                                                         | Sequenziell | 🔴 Geplant | LLM           | `npm run typecheck` + `npm test` grün; diff zeigt nur Kommentarzeilen |
| L2     | Grenz-Dokumentations-Konvention: 3 Absätze im Regelkatalog §R1 + 1 Verweiszeile im Service-Layer-SOP — „Warum-Grenze" (wohnein wird geschnitten: Domäne > Zeilenzahl; Extraktion ab ~300 Z.; Abschnittsmarker ab > 500 Z.)                                                        | `../01_15_03a_code_modularisierung_regelkatalog.md` §R1, `../../xx_sop/06_service_layer_casino.md` | Sequenziell | 🔴 Geplant | LLM           | Konvention lesbar + konsistent mit `coding-style.md` 800-Max          |
| L3     | Ref-Bündelungs-Entwurf für `useCrashGameLoop`-Sektionen: Ref-Gruppen-Analyse (DOM-refs Z. 42, Data-refs Z. 49, Mirror-refs Z. 57) → Parameterobjekt-Skizze für Physics/Draw-Split; Ergebnis fließt in Option-Gate von [Plan 03 §2a](03_code_modularisierung_lesfootprint_plan.md) | read-only: `useCrashGameLoop.ts`, `useCrashMultiplayerGameLoop.ts`                                 | Sequenziell | 🔴 Geplant | LLM           | Skizze mit Ref-Zuordnungstabelle, kein Code-Edit                      |
| L4     | Niveau-Rückschreibung: §R1 Sub-Subs #4/#5/#7 re-raten nach L1–L3                                                                                                                                                                                                                  | `../01_15_03a_code_modularisierung_regelkatalog.md`                                                | Sequenziell | 🔴 Geplant | LLM           | Neuer R1-Schnitt dokumentiert                                         |

**Fan-out-Check (Kriterium 5):** L1 braucht L0, L3 braucht L0, L4 braucht alle — **kein Fan-out, sequenziell.** Kriterium 6: < 45 Min. gesamt.

## 2 — Self-Contained Kontext-Koffer

- **wallet.ts-Struktur (verifiziert 2026-09-14):** Imports Z. 1–12, 3 Zod-Schemas Z. 21–40, Typen Z. 42/47, `isFirstBetSignal` Z. 72, `WalletService`-Klasse Z. 77–865 (~26 statische Methoden, **keine Abschnittskommentare**). Domänen-Cluster: Settlement (getWallet Z. 78, settleBet Z. 113, startRound Z. 178, settleRound Z. 319, advanceBlackjackRound Z. 346), Crash-Reconciliation (Z. 241, 825, 842), Seeds (Z. 156, 585, 601, 619), Promo (Z. 381, 468), Social/Chat (Z. 637, 656, 676), Gamification (Z. 527, 567, 699, 714, 799). Klasse ist einzige Vertragsquelle der Geld-RPCs (Kommentar Z. 16–20).
- **useCrashGameLoop.ts (982 Z.):** 1 Hook (Z. 81) mit 3 Closure-Sektionen: Particle Physics Z. 118–434, Canvas Draw Z. 435–831, RAF-Loop Z. 832–982. Ref-Gruppen: DOM-refs Z. 42, Data-refs Z. 49, Mirror-refs Z. 57 (~15+ shared Refs).
- **Grenz-Muster extern belegt:** Extraktion ab ~300 Zeilen; Abschnittsmarker ab > 500 Zeilen; Domäne schlägt Zeilenzahl.
- **Money-Pfad-Hinweis:** L1 ist diff-seitig ein reiner Kommentar-Change; trotzdem Money-Pfad: Ja wegen Datei. Kein Methoden-Move in diesem Plan (→ R03 Option-Gate).

## 3 — Expliziter Nicht-Scope

- Kein wallet.ts-Methoden-Split (→ R03, Money-Pfad, Option-Gate).
- Keine Crash-Loop-Extraktion (→ Plan 03 Option B, Jan-Gate).
- Keine Lint-Regel (→ R10), keine Test-Aufteilung (→ R09), keine Fassaden (→ R04).

## 4 — Lebenszyklus

`Execution-Ready` → L0–L4 sequenziell → nach L4 `Executed (archiviert)`. Kein Jan-Gate in diesem Plan (Kommentar-Edits + Doku); Security-Review-Pflicht nach L1 erfüllt.

## 2a — L3-Ergebnis: Ref-Bündelungs-Skizze für useCrashGameLoop (2026-09-14)

**Ref-Gruppen (verifiziert, `useCrashGameLoop.ts` Z. 42–70):** Das Hook-Parameter-Objekt `CrashGameLoopParams` gruppiert bereits sauber in 3 Ref-Gruppen + 4 Callback-Setter:

- **DOM refs (5):** `canvasRef`, `multiplierDisplayRef`, `liveProfitDisplayRef`, `cashoutButtonRef`, `vignetteRef`, `cameraZoomRef` — Parent-owned, vom Loop mutiert.
- **Data refs (7):** `particlesRef`, `starsRef`, `pointsRef`, `lastUpdateRef`, `rocketImgRef`, `shakeRef`, `prngSeedRef` — interne Physik/Canvas-Zustände.
- **Mirror refs (15):** `statusRef` … `handleCashoutRef` — vom Parent aus State gespiegelt.
- **Setters/Callbacks (5):** `setStatus`, `setMultiplier`, `setMilestoneFlash`, `setBetAmount`, `settleCrashedRound`, `resetRiskVisuals`.

**Extraktions-Skizze (keine Code-Änderung in diesem Plan):** Da die 3 Gruppen bereits als Objekt-Slices existieren, erfordert ein Physics/Draw-Split **kein Ref-Bundling** — die Sektionen bekommen je ein Parameterobjekt `{ dataRefs, mirrorRefs, domRefs, setters }` (oder ein gemeinsames `loopRefs`-Objekt, das genau diese 3 Slices hält). Der kritische Punkt bleibt die Dep-Array-Stable-Handle-Semantik (`draw` = `[status]`, `gameLoop` = `[draw, settleCrashedRound, resetRiskVisuals]` — Dokumentation Z. 73–80): die extrahierten Pure Functions dürfen keine neuen Dep-Abhängigkeiten einführen. Diese Skizze fließt als Input in die Entscheidungsvorlage von [Plan 03a-R03](03a_r03_single_responsibility_plan.md) (dort Konsolidierung mit Plan-03-Optionen B/C/D).

## 5 — Execution-Log (2026-09-14)

- **L0:** ✅ Befundliste bestätigt: wallet.ts ohne Abschnittsmarker (26 Methoden, 6 Domänen, Cluster interleaved), useCrashGameLoop mit 3 markierten Sektionen + 3 Ref-Gruppen (Z. 42/49/57), Grenz-Entscheidungen undokumentiert.
- **L1:** ✅ 7 Abschnittsmarker + Domänen-Map in `wallet.ts` eingefügt (nur Kommentarzeilen: Domänen-Map nach `export class WalletService {`, Marker vor consumeActiveSeed, autoReconcileStaleCrashRound, redeemPromoCode, getUserStats, getUserSeeds, getChatMessages). Verifikation: `npm run typecheck` 0 Fehler, `npm test` **254/254 Dateien, 1846/1846 Tests grün** (2026-09-14). Diff-seitig 0 Logikänderung.
- **L2:** ✅ Grenz-Konvention (3 Regeln) im Regelkatalog §R1 + 1 Absatz in `xx_sop/06_service_layer_casino.md` §2.
- **L3:** ✅ Ref-Bündelungs-Skizze oben (§2a) — Ergebnis: kein Ref-Bundling nötig, Parameterobjekt aus bestehenden 3 Ref-Gruppen reicht; fließt in R03-Konsolidierung.
- **L4:** ✅ Re-Rating §R1 (siehe Regelkatalog): #4 40→85 (7 Marker + Domänen-Map live), #7 30→75 (Warum-Grenze als Konvention in SOP §2), #5 bleibt 45 (Skizze fertig, Extraktion wartet auf R03-Jan-Gate). Neuer R1-Schnitt: **77 %** (vorher 64 %; (75+90+75+85+45+95+75)/7 = 77,1).
