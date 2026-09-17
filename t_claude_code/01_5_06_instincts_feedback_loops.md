# 01.5.6 — Instincts- & Verhaltens-Lernschleifen (Subkategorie #6): Sub-Subkategorien-Aufschlüsselung

> **Status:** 🔵 Bewertung (Ebene 1) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Etablierung automatisierter Verhaltens- und Feedback-Schleifen, Nutzung der `instinct-*`-Werkzeugfamilie, dauerhafte Anpassung an Jans Präferenzen ohne Kontext-Aufblähung.
>
> **Referenz:** [`01_5_session_memory.md`](01_5_session_memory.md) Position 6 (Niveau: **Top 80 %**, Gewichtung: **8 %**).

---

## 1 — Kernaussage

In der Entwicklungsumgebung stehen hochentwickelte Werkzeuge für maschinelle Verhaltensinstinkte bereit (`instinct-status`, `instinct-import`, `instinct-export`, `promote`, `prune`). Trotz dieser Infrastruktur liegt das aktuelle Niveau bei **Top 80 %**: Für das Casino-Projekt ist **kein einziger Projekt-Instinkt** aktiv konfiguriert. Wenn Jan im Chat Korrekturen anbringt (z. B. zu Befehls-Flags, Formatierungs-Wünschen oder Testpfaden), werden diese zwar in der aktuellen Sitzung brav befolgt, diffundieren aber nach Sitzungsende ins Nichts, anstatt als gelernter Instinkt („Instinct with Confidence Score") dauerhaft persistiert zu werden.

**Rechnerischer Schnitt über 8 Sub-Subkategorien:** `(20×95 + 15×80 + 15×70 + 10×85 + 10×70 + 10×75 + 10×85 + 10×70) / 100` = **Top 80 %**.

---

## 2 — Kompaktübersicht der Sub-Subkategorien

|  #  | Sub-Subkategorie                                         | Gewichtung |    Niveau    | Befund & Beleg                                                                                                                    | Bottleneck? |
| :-: | :------------------------------------------------------- | :--------: | :----------: | :-------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | **`instinct-*`-Tooling-Nutzung im Projekt**              |    20 %    | **Top 95 %** | Werkzeuge sind technisch verfügbar, aber es existieren 0 konfigurierte Projekt-Instinkte für das Casino.                          |    🔴 JA    |
|  2  | **Systematische Feedback-Schleife nach Jan-Korrekturen** |    15 %    | **Top 80 %** | Korrekturen werden im Chat abgearbeitet, lösen aber keinen automatischen Lern-/Persistierungs-Trigger aus.                        |    🔴 JA    |
|  3  | **Abgrenzung: Instinkt vs. SOP vs. Memory**              |    15 %    | **Top 70 %** | Klare Trennung fehlt: Was ist unumstößliche SOP-Regel, was statischer Fakt (Memory), was flexibles Verhaltensmuster (Instinkt)?   |    Nein     |
|  4  | **Confidence-Scoring gelernter Gewohnheiten**            |    10 %    | **Top 85 %** | Es gibt keine quantitative Bewertung, wie sicher eine gelernte Vorliebe ist (z. B. 1× beobachtet vs. 5× bestätigt).               |    🔴 JA    |
|  5  | **Konfliktlösung mit `CLAUDE.md`**                       |    10 %    | **Top 70 %** | Unklarheit darüber, wie verfahren wird, wenn ein gelernter Instinkt im Widerspruch zu einer Textzeile in `CLAUDE.md` steht.       |    Nein     |
|  6  | **Schutz vor Überanpassung (Overfitting)**               |    10 %    | **Top 75 %** | Risiko, dass einmalige Ausnahme-Wünsche (z. B. temporäres Skip von Lints) irrtümlich als dauerhafter Instinkt gespeichert werden. |    🔴 JA    |
|  7  | **Auditierung & Pruning-Zyklus (`prune`)**               |    10 %    | **Top 85 %** | Kein Prozess vorgesehen, um veraltete oder überholte Instinkte auszumustern.                                                      |    🔴 JA    |
|  8  | **Transparenz & Repo-Dokumentation**                     |    10 %    | **Top 70 %** | Da Instinkte systemweit abgelegt werden, sind sie für Mitentwickler oder fremde Chats im Git-Repo unsichtbar.                     |    Nein     |

---

## 3 — Bottleneck-Identifikation & Hebel zur Anhebung auf Top 25 %

1. **Bottleneck 1 & 2: Der Feedback-zu-Instinkt-Trigger.** Etablierung einer einfachen Heuristik: Sobald Jan eine explizite Verhaltenskorrektur äußert (z. B. „nutze immer Flag X"), wird diese am Sitzungsende zur Übernahme als Instinkt vorgeschlagen.
2. **Bottleneck 3: Klare Taxonomie:**
   - **SOP (`xx_sop/*`):** Verbindliche Architektur-, Sicherheits- und Transaktions-Vorschriften.
   - **Memory (`~/.claude/.../memory/`):** Projektbezogene Fakten und einmalige Vereinbarungen.
   - **Instinkt:** Feingranulare Ausführungs-Gewohnheiten (z. B. `PAGER=cat`, bevorzugte Git-Befehlsketten).
3. **Bottleneck 4 & 7: Confidence- & Pruning-Routine.** Neue Instinkte starten mit Confidence 0.6; nach 3 erfolgreichen Anwendungen ohne Widerspruch Aufwertung auf 0.9.

---

## 4 — Vollständigkeits- & Ergänzungsprüfung

- [x] Nutzung des bestehenden Werkzeug-Ökosystems (`instinct-*`) voll integriert.
- [x] Schutz vor Overfitting und unberechtigtem Schreiben sichergestellt.
- [x] Nahtloser Übergang zwischen Mensch-Feedback und LLM-Verhalten.

---

## 5 — Verwandte Artefakte

- Master-Datei: [`01_5_session_memory.md`](01_5_session_memory.md) (Position 6)
- Planungsdatei: [`Planungsdateien/26_session_u6_instincts_feedback_plan.md`](Planungsdateien/26_session_u6_instincts_feedback_plan.md)
- Memory-Audit: [`01_6_memory_files.md`](01_6_memory_files.md)
