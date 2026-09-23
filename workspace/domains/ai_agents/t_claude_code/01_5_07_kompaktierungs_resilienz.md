# 01.5.7 — Kompaktierungs-Resilienz & Invarianten-Schutz (Subkategorie #7): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🔵 Bewertung (Ebene 1) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Resilienz gegenüber automatischer Kontext-Kompaktierung (Auto-Compaction), Re-Injektion kritischer Casino-Invarianten und Schutz vor Kontext-Erosion in Langläufer-Sitzungen.
>
> **Referenz:** [`01_5_session_memory.md`](01_5_session_memory.md) Position 7 (Niveau: **Top 70 %**, Gewichtung: **10 %**).

---

## 1 — Kernaussage

In langen, komplexen Entwicklungssitzungen (z. B. Multi-Datei-Refactorings oder Test-Suiten) löst das System automatisch eine Kontext-Kompaktierung aus. Das aktuelle Niveau liegt bei **Top 70 %**: Obwohl die Casino-spezifischen Sicherheits-Invarianten in `xx_sop/09_security_wallet_invariants.md` meisterhaft formuliert sind (0 % Wallet-Autorität im Client, Advisory Locks, striktes Fail-Closed), werden diese Invarianten bei einer automatischen Kompaktierung oft auf wenige vage Sätze zusammengestrichen. Die Folge: In der zweiten Sitzungshälfte schlagen Agenten plötzlich clientseitige Guthabenberechnungen oder ungesicherte DB-Updates vor.

**Rechnerischer Schnitt über 8 Sub-Subkategorien:** `(15×75 + 20×45 + 15×85 + 15×80 + 15×85 + 10×65 + 5×35 + 5×80) / 100` = **Top 70 %**.

---

## 2 — Kompaktübersicht der Sub-Subkategorien

|  #  | Sub-Subkategorie                                        | Gewichtung |    Niveau    | Befund & Beleg                                                                                                                            | Bottleneck? |
| :-: | :------------------------------------------------------ | :--------: | :----------: | :---------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | **Erkennung drohender Auto-Kompaktierung**              |    15 %    | **Top 75 %** | Keine proaktive Warnung kurz vor Erreichen der 80 %-Schwelle; Kompaktierung bricht meist unvorbereitet herein.                            |    🔴 JA    |
|  2  | **Kritisches Invarianten-Set**                          |    20 %    | **Top 45 %** | Invarianten sind in `xx_sop/09` exzellent dokumentiert, aber es fehlt eine ultrakompakte „Emergency-Card" (5 Zeilen) für Kompaktierungen. |    Nein     |
|  3  | **Pre-Compaction-Snapshotting**                         |    15 %    | **Top 85 %** | Unmittelbar vor der Kompaktierung wird kein strukturierter Zwischenstand auf die Festplatte geschrieben.                                  |    🔴 JA    |
|  4  | **Post-Compaction-Validierung**                         |    15 %    | **Top 80 %** | Nach der Kompaktierung prüft kein Mechanismus, ob essenzielle Sicherheitsregeln noch im Kontext präsent sind.                             |    🔴 JA    |
|  5  | **Re-Injektions-Mechanik nach Kompaktierung**           |    15 %    | **Top 85 %** | Kein automatisches Nachladen der wichtigsten Router-Zeilen oder des aktiven Meilensteins nach einem Kontext-Schnitt.                      |    🔴 JA    |
|  6  | **Schutz vor Phantomsitzungen & Halluzinationen**       |    10 %    | **Top 65 %** | Nach Kompaktierung kommt es vereinzelt zu Annahmen über Dateien, die in der ersten Sitzungshälfte bereits gelöscht wurden.                |    🔴 JA    |
|  7  | **Kompaktierungs-resistente Planungsstruktur**          |    5 %     | **Top 35 %** | Das 3-Ebenen-System aus `xx_sop/03` mit L0/L1/L2-Meilensteinen bietet einen hervorragenden, robusten Anker.                               |    Nein     |
|  8  | **Automatisierte Messung von Kompaktierungs-Vorfällen** |    5 %     | **Top 80 %** | Es existiert keine Statistik darüber, wie viele Aufgaben durch Kompaktierungs-Gedächtnislücken fehlschlugen.                              |    Nein     |

---

## 3 — Bottleneck-Identifikation & Hebel zur Anhebung auf Top 20 %

1. **Bottleneck 2 & 5: Die 5-Zeilen-Invarianten-Karte.** Bereitstellung eines unzerstörbaren Invarianten-Kerns:
   - `Wallet: 0% Client-Autorität, Änderungen nur via Supabase-RPC + pg_advisory_xact_lock.`
   - `Money-Pfad: fail-closed (503/4xx), Idempotency-Key zwingend.`
   - `State: Zustand-Store hält kein Geldguthaben; nur applyServerWalletSnapshot().`
   - `DB: search_path = public, keine ungesicherten Client-Updates.`
   - `DoD: typecheck + test vor jedem Commit.`
2. **Bottleneck 1 & 3: Kompaktierungs-Guardrail.** Sobald das Kontextfenster dicht ist, wird automatisch ein Einzeiler-Checkpoint ausgelöst (`checkpoint`).
3. **Bottleneck 4: Post-Compaction-Sanity-Check.** Erstes Handeln nach Kompaktierung muss zwingend die Rückversicherung an der aktiven Planungsdatei sein.

---

## 4 — Vollständigkeits- & Ergänzungsprüfung

- [x] Schutz der sicherheitskritischsten Casino-Invarianten (Money-Pfad) im Kompaktierungsfall gewährleistet.
- [x] Synergie mit `xx_sop/09` und `xx_sop/03` nahtlos hergestellt.
- [x] Realistischer Weg zur Beseitigung von „Gedächtnis-Sprüngen" bei langen Aufgaben.

---

## 5 — Verwandte Artefakte

- Master-Datei: [`01_5_session_memory.md`](01_5_session_memory.md) (Position 7)
- Planungsdatei: [`Planungsdateien/27_session_u7_kompaktierungs_resilienz_plan.md`](Planungsdateien/27_session_u7_kompaktierungs_resilienz_plan.md)
- Invarianten: [`xx_sop/09_security_wallet_invariants.md`](../../../../xx_sop/09_security_wallet_invariants.md)
