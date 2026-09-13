# 18.4.3 — 3D-PNG-Embleme: bewusste Nicht-Änderung (Dokumentations-Plan)

> **Status:** Executed (2026-09-08, L0–L2) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich die Entscheidung über die 16 bestehenden 3D-PNG-Embleme (§18.4 Zeile 3: Medallion, Trust-Shield, 5× VIP-Tiere, 9× Achievements). Kein neues Bild-Asset, kein Code-Change an den Assets selbst — daher regulär in `worldmap/` (Ausnahmeregel für Bild-Asset-Pläne aus `xx_sop/03_workflow_jan_planungsdateien.md` §2 greift nicht).
> **Kontext:** Der ursprüngliche §18.4-Befund lautete „gleiche Semantik existiert in PNG **und** Lucide auf denselben Seiten" (z. B. Vault: 3D-Trophy-Achievement-Kacheln + Lucide-`Trophy` im Achievements-Header). Diese Duplikat-Ursache wird bereits durch [`29_trophy_icon_konsolidierung_plan.md`](../public/images/29_trophy_icon_konsolidierung_plan.md) L3 behoben (Entfernung des redundanten Lucide-`Trophy`). Gewählt: **Option D** — die 16 PNGs bewusst unverändert lassen, da eine Auffrischung eine andere, unbelegte Frage („Stil-Freshness") beantworten würde, nicht die ursprünglich gestellte.
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine Dokumentations-Entscheidung, kein Code-Change)
> **Freigabe-Basis:** Option D im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.55/5, §5). Abhängigkeit: [`29_trophy_icon_konsolidierung_plan.md`](../public/images/29_trophy_icon_konsolidierung_plan.md) L3 muss tatsächlich umgesetzt werden, sonst ist die Prämisse dieses Plans hinfällig (siehe L0).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| L0 | Abhängigkeits-Verifikation | [`29_trophy_icon_konsolidierung_plan.md`](../public/images/29_trophy_icon_konsolidierung_plan.md) | 🟢 Erledigt (2026-09-08) | LLM | Trophy-Plan L3 (Achievements-Header-Entfernung) ist 🟢 Erledigt (2026-09-08) — Prämisse trifft zu |
| L1 | Dokumentations-Update | `ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.4 Zeile 3) | 🟢 Erledigt (2026-09-08) | LLM | Zeile trägt die bewusste Nicht-Änderung + Begründung + Verweis auf Trophy-Plan L3 |
| L2 | Abschluss-Verifikation | — (kein Code-Change) | 🟢 Erledigt (2026-09-08) | LLM | `git status` für alle 16 PNG-Dateien leer — keine der Dateien verändert |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Assets (unverändert, nur dokumentiert)

| Kategorie | Dateien |
| :--- | :--- |
| Medallion | `brand-medallion-3d.png` |
| Trust-Shield | `trust-shield-3d.png` |
| VIP-Tiere (5×) | `vip-bronze-3d.png`, `vip-silver-3d.png`, `vip-gold-3d.png`, `vip-platinum-3d.png`, `vip-diamond-3d.png` |
| Achievements (9×) | `ach-target-3d.png`, `ach-whale-3d.png`, `ach-clover-3d.png`, `ach-jackpot-chest-3d.png`, `ach-star-3d.png`, `ach-crown-3d.png`, `ach-rocket-3d.png`, `ach-flame-3d.png`, `ach-dice-seven-3d.png` |

### 2.2 Systemregeln & Invarianten

- Diese Entscheidung ist **kein** Freifahrtschein für „nie wieder anfassen" — sie beantwortet ausschließlich die in §18.4 gestellte Duplikat-Frage. Eine spätere, eigenständig begründete Stil-Auffrischung (Option C aus dem Option-Gate, 3.68/5) bleibt jederzeit als separater Vorschlag möglich, ist aber nicht Teil dieses Plans.
- Die Abhängigkeit zu Trophy-Plan L3 ist echt: Sollte Jan Trophy-Plan (29) später anders entscheiden (z. B. Achievements-Header-Trophy doch behalten), wird dieser Plan hinfällig und müsste neu bewertet werden.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Bildgenerierung, kein Ersetzen, keine Kompression oder sonstige Änderung an den 16 gelisteten PNG-Dateien.
- Keine Vorwegnahme der in Trophy-Plan (29) definierten Schritte — dieser Plan liest nur deren Status, ändert ihn nicht.
- Kein Anfassen der übrigen 18.4-Punkte (1, 2, 4 — eigene Pläne).

---

## 3 — Detaillierte Meilensteine

### L0 — Abhängigkeits-Verifikation
- **Ziel:** Sicherstellen, dass die Prämisse dieses Plans (Duplikat wird durch Trophy-Plan L3 gelöst) zum Zeitpunkt des Abschlusses noch zutrifft.
- **Schritte:** Status-Zeile von [`29_trophy_icon_konsolidierung_plan.md`](../public/images/29_trophy_icon_konsolidierung_plan.md) L3 prüfen.
- **Erwartetes Verhalten:** L3 ist mindestens `In Execution` (Asset-Generierung L0 kann parallel laufen, aber die Achievements-Header-Entfernung selbst muss real erfolgen, bevor dieser Plan als inhaltlich abgeschlossen gilt).
- **Abbruchkriterium:** Falls Trophy-Plan L3 gestrichen oder anders umgesetzt wird, Stopp + Rückfrage an Jan, ob 18.4.3 neu bewertet werden soll.

### L1 — Dokumentations-Update
- **Ziel:** §18.4-Zeile 3 in `ALLE_ICONS_BUTTONS_ANALYSE.md` trägt die Entscheidung samt Begründung.
- **Schritte:** Zelle „Entscheidung nötig" um die getroffene Wahl ergänzen, „Status" auf Execution-Ready, „Ergebnis" auf „—" (kein neues Bild), „Planungsdatei" auf diesen Plan verlinken.
- **Erwartetes Verhalten:** Tabelle zeigt transparent, dass eine bewusste Entscheidung getroffen wurde, keine offene Lücke.
- **Abbruchkriterium:** Keins.

### L2 — Abschluss-Verifikation
- **Ziel:** Bestätigen, dass tatsächlich keine der 16 Dateien angefasst wurde.
- **Schritte:** `git status`/`git diff` auf die in §2.1 gelisteten Dateien prüfen.
- **Erwartetes Verhalten:** Leerer Diff für alle 16 Dateien.
- **Abbruchkriterium:** Jede Abweichung (versehentliche Änderung) stoppt den Abschluss und wird rückgängig gemacht.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD, reduziert — kein Code-Change)

1. Typecheck: `npm run typecheck` — 0 Fehler (unverändert, da kein Code-Touch erwartet).
2. Tests: `npm test` — grün (unverändert).
3. Lint: `npm run lint` — 0 Errors (unverändert).
4. Build: `npm run build` — erfolgreich (unverändert).
5. Git Diff: Nur `ALLE_ICONS_BUTTONS_ANALYSE.md` §18.4-Zeile 3 — keine der 16 PNG-Dateien im Diff.

---

## 5 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option | Konzept | Score |
| :--- | :--- | :---: |
| A (ungeprüft) | Unverändert lassen | 3.55 |
| B | Alle 16 auffrischen | 3.12 |
| C | Nur die 9 Achievements auffrischen | 3.68 |
| **D (gewählt)** | Bewusst unverändert lassen — Duplikat-Ursache bereits durch Trophy-Plan L3 behoben | **4.55** |

Kein Tie-Break nötig (Abstand D–C = 0,87 > 0,3). Jan-Freigabe: **Option D**, 2026-09-06.
