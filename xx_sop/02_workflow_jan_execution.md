# 02 — Workflow-Jan Execution (Casino Adapter)

> **Zweck:** Freigegebene Arbeit autonom vom Plan bis zur Verifikation ausführen.
> **Kanonischer Standard:** 🔗 [`xx_sop/shared/jan-execution/SKILL.md`](shared/jan-execution/SKILL.md)

---

## 1 — Start-Gate & Scope-Disziplin

- **Voraussetzung:** Der Plan liegt im Status `Execution-Ready` vor (oder Jan hat eine Option A/B/C explizit freigegeben).
- **Kontextprüfung:** Zuständige Kontextreferenz (`xx_docs/`) und SOP vor Schreibaktionen lesen.
- **Scope-Treue:** Keine unbeteiligten Nachbardateien refaktorisieren; keine fremden uncommitteten Änderungen anfassen.
- **Unsicherheit:** Bei unklarer Architektur, Migrationsreihenfolge oder K4/K5-Aktionen anhalten und nachfragen.

---

## 2 — Verbindliche Abschlussprüfung (DoD für Casino)

Vor jeder Erfolgsmeldung an Jan MÜSSEN die relevanten Prüfstufen lokal ausgeführt und bestanden sein:

| Stufe | Disziplin                         | Lokaler Casino-Befehl                   | Akzeptanzkriterium                                                                     |
| ----- | --------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| **1** | **Typecheck**                     | `npm run typecheck`                     | 0 TypeScript-Fehler                                                                    |
| **2** | **Automatisierte Tests**          | `npm test`                              | Betroffene und bestehende Tests 100 % grün                                             |
| **3** | **Linter & Hygiene**              | `npm run lint`                          | 0 ESLint-Errors                                                                        |
| **4** | **Production-Build**              | `npm run build`                         | Next.js Build Exit 0 (erfolgreich)                                                     |
| **5** | **Git Diff Audit**                | `git status --short`                    | Nur geplante Dateien modifiziert                                                       |
| **6** | **Visuelle Screenshot-Prüfung**   | Playwright / Screenshot-Script          | **Pflicht bei allen Frontend-/UI-Aufgaben**: Zugeschnittener Screenshot im Output     |

### Mandatorischer Frontend-Screenshot-Standard (Stufe 6)
- **Gültigkeit:** Gilt ausnahmslos für alle Änderungen mit UI-, CSS-, Tailwind-, Framer-Motion-, Layout- oder Komponenten-Bezug.
- **Vorgehen:**
  1. Live-Server auf Port 3015 ansteuern (`http://localhost:3015/...`).
  2. Per headless Playwright (oder passendem Screenshot-Script) einen fokussierten Screenshot aufnehmen.
  3. Den Screenshot präzise auf die geänderte Komponente zuschneiden (Bounding Box / Clip).
  4. Ablage unter `docs/frontend/screenshots/` oder `public/images/...`.
- **Output-Pflicht:** Der zugeschnittene Screenshot MUSS zwingend im Abschluss-Output an Jan eingebunden oder direkt verlinkt werden, damit Jan die visuelle Qualität sofort ohne manuellen Browseraufruf prüfen und abnehmen kann.

---

## 3 — Casino-Spezifische Invarianten

- **Security-Review-Pflicht:** Änderungen an `src/lib/casino/`, Supabase-RPCs, Wallet- oder Auth-Pfade erfordern zwingend ein dokumentiertes Sicherheits-Review vor Abschluss.
- **Zero-Wallet-Autorität:** Der Browser bestimmt niemals Guthabenstände; alle Mutationen erfolgen atomar über Supabase-RPCs.

---

## 4 — Dokumentation & Abschluss

- **Planstatus aktualisieren:** Vor Start `Execution-Ready`, während Umsetzung `In Execution`, nach Verifikation `Executed (archiviert)`.
- **Archivierung:** Abgeschlossenen Plan nach `docs/archive/` verschieben und Eintrag in `worldmap/00_WORLDMAP_STATUS.md` synchronisieren.
