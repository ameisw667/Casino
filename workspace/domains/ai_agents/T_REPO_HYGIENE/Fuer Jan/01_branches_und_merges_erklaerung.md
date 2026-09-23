# Branches & Merges — Erklärung für Jan

> **Temporär.** Diese Datei ist ausschließlich für Jan als Nutzer gedacht, steht in **keinem** Register (`00_REPO_HYGIENE_UEBERSICHT.md` wurde bewusst nicht angepasst) und wird nach dem Lesen **komplett gelöscht** — der ganze Ordner `T_REPO_HYGIENE/Fuer Jan/` kann weg.
> **Stand der Zahlen:** 2026-09-18 22:05 (Momentaufnahme; das Repo bewegt sich — HEAD lief heute schon zweimal weiter: 21:14 `c9a45eec` → 21:32 `6f72aecb`).
> **Kein Fachjargon ohne Erklärung.** Jeder Begriff wird beim ersten Auftauchen in einem Satz erklärt.
> **Gekürzt am 22:05** auf Landkarte, §3a (neu) und Tabellen. Was entfallen ist, steht am Ende der Datei.

---

## 1 — Die Kurzantwort auf dein Gefühl

Du verlierst **nicht** durch Branches. Dein Verlustrisiko sind vier andere Dinge:

| Risiko                                                                      | Größe heute                      | Warum das gefährlich ist                                    |
| --------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| **Uncommittetes Material** — Änderungen, die nirgends „unterschrieben" sind | **82 Einträge** in `git status`  | ein einziger Befehl (oder ein Checkout) kann sie vernichten |
| **Stashes** — Zettel in einer Schublade, von der keiner mehr weiß           | **3**                            | sie werden nie wieder angesehen                             |
| **Gemergte Branches, die niemand löscht**                                   | **11 von 12**                    | sie verlieren nichts, sie **verstecken** nur den Überblick  |
| **Arbeit ohne Push** — kein Server-Backup                                   | **86 Commits nur auf diesem PC** | Festplatten-, Ordner- oder Neuinstallations-Unfall = weg    |

Ein Branch-Kuddelmuddel ist also kein Wertverlust, sondern ein **Sichtbarkeitsproblem** (Zeile 3) plus ein **Backup-Problem** (Zeile 4). Beides ist reparierbar.

---

## 2 — Die Akteure (Alltagssprache ↔ Git)

| Dein Alltag                                                                     | Git-Wort                | Was es wirklich ist                                                                                 |
| ------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------- |
| Das **saubere Aufsatzheft**, aus dem du anderen vorliest                        | **`main`** („Mainline") | Der Stand, den alle für „das Echte" halten                                                          |
| Eine **Fotokopie** des Hefts, auf der du herumschmierst                         | **Branch**              | Kein zweites Heft! Nur ein _Lesezeichen_: „Ich arbeite ab hier weiter, aber getrennt"               |
| Ein **Klebezettel mit Datum + Unterschrift**: „So soll es bleiben"              | **Commit**              | Ein eingefrorener Stand. Unterschrieben = nicht mehr veränderbar                                    |
| Der **ganze Stapel Klebezettel** in Reihenfolge                                 | **History / Log**       | Die nachvollziehbare Geschichte deiner Arbeit                                                       |
| Schmierzettel-Änderungen **ins Heft übertragen**                                | **Merge**               | Zusammenführen                                                                                      |
| Sagen: „Das Heft wurde nie angerührt — ab heute **ist** die Fotokopie das Heft" | **Fast-Forward**        | Sonderfall des Merges: kein Übertragen nötig, nur umbenennen                                        |
| Zwei Schmierzettel ändern **dieselbe Zeile** unterschiedlich                    | **Konflikt**            | Git kann nicht raten, wer recht hat → ein Mensch muss entscheiden                                   |
| Alles schnell **in die Schublade werfen**, ohne Unterschrift                    | **Stash**               | Zwischenlager. **Kein** Backup — Schubladen werden vergessen                                        |
| Änderungen liegen nur **auf dem Tisch**, nirgends unterschrieben                | **Uncommitted**         | Das Gefährlichste: „Tisch abräumen" = weg                                                           |
| Die Fotokopie **in die Druckerei** schicken                                     | **Push**                | Dein Stand geht auf GitHub (Server)                                                                 |
| Die Druckerei **holt** eine Version zu dir                                      | **Pull / Fetch**        | Stand vom Server holen                                                                              |
| Ein **zweites Heft auf demselben Schreibtisch**, mit derselben Kartei           | **Worktree**            | Zweites Arbeitsverzeichnis am selben Projekt — Profi-Werkzeug, bei dir gerade die Ursache von Chaos |

**Die zwei Sätze, die die ganze Idee tragen:**

1. Branches existieren für **genau einen** Zweck: Riskantes ausprobieren, ohne das Funktionierende kaputtzumachen. (Fotokopie statt Original — geht's schief, wirfst du die Kopie weg, das Original ist unberührt.)
2. **Fast-Forward** ist der Sonderfall, in dem am Original niemand gerührt hat. Dann musst du nichts übertragen, sondern sagst nur: „Die Kopie ist ab heute das Original." — **Genau dein Fall.**

---

## 3 — Was in deinem Casino-Repo gerade wirklich los ist

Alles gemessen am 2026-09-18 um 22:05 (rein lesend — ich habe nichts verändert).

### Die Landkarte

**Wichtig zuerst:** Es gibt „main" **zweimal** — einmal auf deinem PC, einmal auf GitHub. Beide sind alt, aber unterschiedlich alt.

```
DIE DREI STÄNDE, die es gerade gibt           (gemessen 2026-09-18 22:05)

main                    d8a99640   30.08. 20:16   ← „Hausrezept" auf DIESEM PC
origin/main             26503ed5   06.09. 21:56   ← „Hausrezept" auf GitHub
HEAD (Arbeitsbranch)    6f72aecb   18.09. 21:32   ← wo dein Projekt WIRKLICH steht

Abstand:  main .........→ HEAD  = 146 Commits
          origin/main ...→ HEAD  =  94 Commits
          HEAD ...→ origin/main   =   0 Commits   ← nichts fehlt, Fast-Forward möglich
```

```
codex/uncommitted-cohort-review   (6f72aecb, 18.09. 21:32)   ← DEIN PROJEKT

  ├─ angelegt: 31.08. 22:13:05, aus d8a99640 (= der Stand, auf dem main steht)
  ├─ auf GitHub: nur bis 8863b64f vom 09.09.  → 86 Commits existieren NUR auf diesem PC
  └─ enthält bereits:
        ├── codex/startseite-v2(-exec)         (60 Commits)
        ├── security-hardening-round2-merge     (65 Commits)
        ├── security-round3-final-merge         (81 Commits)
        │     └── round3-security-merge (79)
        │           └── hardening-ci-gate / -csp-reporting / -csrf / -csp-script (61–64)
        └── recovery-dropped-stash   ← gehört NICHT dazu (2 Commits, eigene Insel)
```

**Übersetzt:** „146 voraus, 0 dahinter" heißt: `main` ist ein **alter Vorfahre** von `codex/uncommitted-cohort-review`. Es fehlt in `main` nichts, was auf dem Branch wäre — umgekehrt fehlt alles. Deshalb kann man zusammenführen, indem man einfach sagt: **„ab heute ist der Branch das Hauptprojekt"** (Fast-Forward). Kein Konflikt möglich, kein Übertragen nötig.

### Was das für dich bedeutet

| Frage                                   | Antwort                                                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Ist Arbeit verloren?                    | **Nein.** Alles außer 82 Einträgen (uncommittet, nicht unterschrieben) + 3 Stashes ist committet.                   |
| Wo ist mein Projekt wirklich?           | Auf `codex/uncommitted-cohort-review`, **nicht** auf `main`. `main` ist nur ein Etikett.                            |
| Warum fühlt es sich chaotisch an?       | 12 lokale Branches + 5 Neben-Worktrees + 3 Stashes + mehrere LLM-Sessions im **selben** Ordner.                     |
| Kann ich einfach `main` mergen?         | Ja, ein Fast-Forward. Das ist die risikoärmste Git-Operation, die es gibt.                                          |
| Ist es schlimm, dass `main` so alt ist? | Für die Arbeit: **nein**, es fehlt dort nichts. Für den Überblick: **ja** — deshalb wirkt es, als läge etwas herum. |
| Was ist das **echte** Risiko?           | Nicht `main`. Sondern: 82 uncommittete Einträge und **86 Commits, die nur auf diesem PC existieren**.               |

---

## 3a — Die Struktur auf einen Blick: was gerade wo steht

Gleicher Zeitpunkt, rein lesend gemessen. Die Landkarte oben zeigt **Commits** — hier siehst du die **Ordnung dahinter**: welche Zonen dein Repo hat und was in welcher Zone gerade passiert.

### Ein Bild: dein Repo hat vier Zonen

```
V:\VibeCoding\Casino\
│
├─ 1  PRODUKT — das, was läuft
│      src/                        1.067 ts/tsx-Dateien (davon 59 API-Routen)
│      src/app/games/              7 Spiel-Ordner
│      supabase/migrations/        69 SQL-Migrationen
│      public/                     Bilder, Assets
│
├─ 2  STEUERUNG — das, was „was ist live?" beantwortet
│      worldmap/00_WORLDMAP_STATUS.md      ← die EINZIGE Live-Wahrheit (14 Dateien im Ordner)
│
├─ 3  ARBEIT — das, was gerade passiert
│      T_*/ (17 Themen-Ordner)             ← je Thema: Planungsdateien + eine Übersicht
│      t_claude_code/ (134 Dateien)        ← Session-Memory, Agenten, LLM-Pläne
│
└─ 4  KANON & AUTOMATIK — das, was sagt, wie es geht
       xx_docs/ (12) · xx_sop/ (22)        ← Systemkarte + verbindliche Verfahren
       docs/ (342)                         ← veröffentlichte Fassungen + Archiv
       .github/workflows/ (16)             ← CI; feuert nur bei Push/PR gegen `main`
```

**Der wichtigste Satz zur Struktur:** Arbeit wird in **Zone 3** geplant (`T_*/Planungsdateien/`), in **Zone 1** umgesetzt, in **Zone 4** zur Regel gemacht und in **Zone 2** als Status gemeldet. Ist Zone 2 (`worldmap`) alt, sieht es aus, als wäre nichts passiert — obwohl Zone 1 und 3 voll sind. Genau das ist bei dir passiert.

### Wo dein Projekt physisch liegt (4 Orte, 1 Arbeitstisch)

| Ort                                      | Was es ist                           | Stand heute                                      |
| ---------------------------------------- | ------------------------------------ | ------------------------------------------------ |
| `main` auf deinem PC                     | „Hausrezept" lokal                   | `d8a99640` · 30.08. — **146 Commits zurück**     |
| `origin/main` auf GitHub                 | „Hausrezept" auf dem Server          | `26503ed5` · 06.09. — **94 Commits zurück**      |
| `codex/uncommitted-cohort-review` (HEAD) | **dein echtes Projekt**              | `6f72aecb` · 18.09. 21:32                        |
| `origin/codex/…review`                   | dein Projekt **auf GitHub**          | `8863b64f` · 09.09. → **86 Commits fehlen dort** |
| Arbeitstisch (Arbeitsverzeichnis)        | was noch nirgends unterschrieben ist | **82 Einträge** in `git status`                  |

Drumherum: **12 lokale Branches · 5 Neben-Worktrees · 3 Stashes · 16 CI-Workflows.**

### Die 17 Themen-Ordner und ihr Stand

| Thema (Zone 3)                                                                                                                        | Übersicht | Letzte Überarbeitung | Einordnung                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------- | ----------------------------------------------------------------------------------------- |
| `T_REPO_HYGIENE`                                                                                                                      | ✅        | **18.09.**           | 🔥 **heute aktiv** — dieses Thema (Branch- + Wissens-Hygiene); Plan 04 läuft              |
| `T_SECURITY_HARDENING`                                                                                                                | ✅        | **18.09.**           | 🟢 **heute abgeschlossen** — 10 Säulen, gewichteter Schnitt 14,0 %, beide Merges erledigt |
| `T_IMAGE_CREATION`                                                                                                                    | ✅        | 14.09.               | 💤 ruht                                                                                   |
| `T_FRONTEND`                                                                                                                          | ✅        | 13.09.               | 💤 ruht — mit **33 Plänen** das größte Thema                                              |
| `T_API`                                                                                                                               | ✅        | 09.09.               | 💤 ruht                                                                                   |
| `T_RATE_LIMITING_ABUSE_PREVENTION`                                                                                                    | ✅        | 08.09.               | 💤 ruht                                                                                   |
| `T_LLM` · `T_MCP`                                                                                                                     | ✅        | 07.09.               | 💤 ruhen                                                                                  |
| `T_CLI`                                                                                                                               | ✅        | 06.09.               | 💤 ruht                                                                                   |
| `T_ANALYTICS_BUSINESS_INTELLIGENCE` · `T_AUTH_AUTHORIZATION` · `T_BACKGROUND_JOBS_SCHEDULING` · `T_OBSERVABILITY_ERROR_ALERT_LOGGING` | ✅        | 05.09.               | 💤 ruhen (4 Themen)                                                                       |
| `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG`                                                                                                 | ✅        | Status **„Geplant"** | ⏸ wartet — 12 Pläne liegen fertig, Umsetzung hängt an Gate **G8**                         |
| `T_BUGS` · `T_DATABASE` · `T_IMAGE`                                                                                                   | ❌ keine  | —                    | ⚪ ohne eigene Übersicht (Sammelordner bzw. Altbestand)                                   |

**Was die Tabelle sagt:** Nur **zwei** Themen sind heute in Bewegung (Repo-Hygiene, Security). Die anderen 15 sind committet und dokumentiert — sie „liegen herum", aber sie sind **nicht verloren**. Das ist genau der Unterschied zwischen „unordentlich" und „unsicher".

### Die vier Pläne, die den heutigen Stand erklären

| Plan                                      | Zeitraum   | Ergebnis                                                                                                                                                        | Was noch fehlt                                                                            |
| ----------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **01** — Runde 1 (K0–K9)                  | bis 14.09. | 🟢 10 Kohorten als je ein Commit; 3 Jan-Gates definiert                                                                                                         | Gate **G3** (Push/Merge) wurde **nie geöffnet** → deshalb hängt `main`                    |
| **02** — Runde 2 (K10–K16)                | bis 17.09. | 🟢 7 Kohorten; **K14** löste den latenten CI-Blocker (5 tote Doku-Links)                                                                                        | **K17** (Doku-Link-Gate) bleibt bei dir                                                   |
| **03** — Audit „uncommitted vs. unmerged" | 18.09.     | 🟡 Phase 1 fertig: Kat. A = 82 uncommittet + 3 Stashes · Kat. B = 146/94/86 Commits                                                                             | Phase 2 (= der Merge) ist an **Plan 04** übergeben                                        |
| **04** — Merge nach `main`                | 18.09. →   | 🟡 **läuft**: L0–L5 + Selbstprüfung grün (Typecheck, 273/273 Tests, Lint, Build alle Exit 0), 18 Konfliktauflösungen der beiden Security-Merges einzeln geprüft | wartet auf **deinen** Push-Satz (S0/S1), später auf **K4** (Merge) und **K5** (Aufräumen) |

### Wer gerade gleichzeitig arbeitet — der Grund für die Bewegung

- In **demselben Ordner** laufen mehrere LLM-Sessions. Beleg: HEAD wanderte 21:14 → 21:32. Und während des Audits hat eine andere Session `worldmap/00_WORLDMAP_STATUS.md` neu geschrieben (Arbeitskopie-Blob `66a926a2`, HEAD hat `98e6174b`).
- **Vier Doku-Dateien** (`T_SECURITY_HARDENING/01`, `02`, `04`, `06`) stehen gerade im Index als geändert — eine andere Session arbeitet daran.
- Folge für dich: **Jede Zahl hier ist eine Momentaufnahme mit Uhrzeit.** Deshalb wird vor jedem Schreibschritt neu gemessen (Plan 04, Schritt L0).

### Was als Nächstes an dir hängt (nichts bewegt sich von selbst)

| Gate                                                        | Was es auslöst                                                    | Was ohne es passiert                                            | Empfehlung                                         |
| ----------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------- |
| **S0/S1** — Push + PR gegen `main`                          | die 86 lokalen Commits landen auf GitHub, CI läuft sichtbar am PR | kein Backup; CI bleibt auf deinem Branch **blind**              | **Ja** (risikoarm, `main` bewegt sich dabei nicht) |
| **Quiet Window** — andere Session erst fertig werden lassen | ein Merge auf einen ruhigen Stand                                 | `main` ist sofort wieder hinterher (HEAD wanderte 2× in 18 Min) | **Warten**                                         |
| **Vercel-Blicke** (4 Checks, §3c)                           | du erfährst, ob ein Push direkt live geht                         | du entscheidest blind                                           | **Vor dem Merge**                                  |
| **K4** — Merge/Push nach `main`                             | Fast-Forward: „Branch ist ab heute `main`"                        | `main` bleibt 146 Commits alt                                   | **Nur mit deinem Satz** (SOP 11)                   |
| **K5** — Aufräumen (11 Branches, 5 Worktrees, 3 Stashes)    | Ordnung                                                           | nichts kaputt, nur unübersichtlich                              | **Später**, nach verifiziertem `main`              |

---

## 3b — Deine zwei offenen Fragen (direkt unter der Landkarte)

### Frage 1: „Seit dem 30.08. gab es 146 neue Commits — warum sind die nicht auf `main`?"

**Kurzantwort:** Weil ein Commit **immer** auf den Branch geht, der gerade ausgecheckt ist (`HEAD`) — und `main` wurde seit dem 30.08. nie wieder ausgecheckt oder weitergeschoben. `main` ist kein Ordner, in den neue Arbeit automatisch hineinfällt; es ist ein **Etikett**, das nur wandert, wenn jemand es ausdrücklich umsetzt.

| Beleg                       | Wert                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `main` steht auf            | `d8a99640`, datiert **30.08. 20:16:48** — genau der Commit, von dem dein Arbeitsbranch abgezweigt ist                       |
| `main..HEAD`                | **146** Commits (main hat 0, die HEAD nicht hat)                                                                            |
| Letzter Commit auf `main`   | derselbe `d8a99640` — seit 30.08. **kein einziger** weiterer                                                                |
| Branch-Protection in GitHub | **existiert nicht** (SOP 11: „erzwungene Branch Protection Rule steht noch aus") → nichts schiebt `main` automatisch weiter |

**Warum niemand `main` verschieben _durfte_:** Das ist kein Versehen, sondern eine Regel dieses Repos. In `xx_sop/11_cicd_deployment.md` steht:

> „**Merge in `main` & Production-Release-Freigabe** | **K4** | **Explizite Jan-Freigabe zwingend erforderlich.**"

Plan 01/02 hatten genau dafür ein Gate (`G3` bzw. „kein Push, kein Merge") — nie freigegeben. Die 146 Commits sind also **nicht verschwunden, sondern absichtlich zurückgehalten.** Sie warten auf einen einzigen Satz von dir.

**Nebenbefund:** Dein _lokales_ `main` ist noch älter als das auf GitHub:

| Ort                      | Stand      | Datum                    |
| ------------------------ | ---------- | ------------------------ |
| `main` auf deinem PC     | `d8a99640` | **30.08.** (19 Tage alt) |
| `origin/main` auf GitHub | `26503ed5` | **06.09.** (12 Tage alt) |

Auf GitHub sind **52 Commits** gelandet, die dein PC-`main` nicht kennt (`main..origin/main = 52`, `origin/main..main = 0`). Folge: dein lokales `main` lässt sich so **nicht** hochschieben — GitHub würde „non-fast-forward" ablehnen, weil ihm 52 Commits fehlen. Kein Hindernis, nur eine Reihenfolge: direkt auf `origin/main` aufsetzen (möglich, weil `origin/main` Vorfahre von HEAD ist).

### Frage 2: „Wie entstand `codex/uncommitted-cohort-review`? War das ein unnötiger Zwischenschritt?"

**Wie er entstand (Beleg, nicht Vermutung):** Das Reflog dieses Branches enthält die Zeile

```
d8a99640 codex/uncommitted-cohort-review@{2026-08-31 22:13:05 +0200}: branch: Created from HEAD
```

Am **31.08.2026 um 22:13:05** hat also ein Werkzeug diesen Branch angelegt — auf dem damaligen `main`-Stand. **Sechs Minuten später** (22:19:42, `7080872f`) kam der erste Commit. Du hast den Branch nicht selbst benannt; er wurde von einem Agenten erzeugt (Namensraum `codex/…` wie bei `codex/startseite-v2`, plus ein Worktree-Pfad unter `C:\Users\hambu\.codex\…`).

**Und ja — deine Kritik trifft einen echten Punkt.** Für dich als Solo-Entwickler wäre es sachlich fast dasselbe, direkt auf `main` zu committen:

| Dein Einwand                                      | Was dagegen spricht                                                                                                                                                                                                                |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| „Man hätte den Zwischenschritt weglassen können." | Richtig — **technisch** wäre direkt-auf-`main` für dich vertretbar.                                                                                                                                                                |
| …aber wer hätte das entscheiden dürfen?           | Der Agent **nicht**: „Merge in `main`" ist laut SOP 11 eine **K4-Aktion mit Jan-Freigabe**. Ein Agent, der direkt auf `main` schreibt, bräche genau die Regel, die dich schützen soll.                                             |
| …und warum gibt es die Regel?                     | Weil an `main` die **Automatik** hängt: `quality-ci.yml`, `codeql.yml`, `dependency-audit.yml` und der Vercel-Preview-Build feuern nur bei Push/PR gegen `main`. `main` ist bei dir die **Release-Linie**, nicht der Schreibtisch. |

**Der eigentliche Fehler ist ein anderer:** Nicht „ein Branch existiert", sondern **wie lange er gelebt hat**: 18 Tage, 146 Commits auf _einem_ Branch, 10 Geschwister-Branches, 86 Commits nicht einmal auf GitHub, und 12 Branches + 5 Worktrees + 3 Stashes bei einem einzigen Entwickler.

**Was ich dir stattdessen empfehle:**

> **Ein aktiver Arbeitsbranch. Nach jedem grünen Gate-Lauf nach `main` mergen (Fast-Forward). Alles Gemergte sofort löschen.** Und: **Push gehört zur Definition von „fertig"** — ein Commit, der nur auf deinem PC liegt, ist kein Backup.

**Meine Grenze:** Ich kann belegen, _wann_ und _von welchem Stand_ der Branch angelegt wurde — nicht, _welches Programm_ es getippt hat. „Codex-CLI-Agent" ist eine starke Schlussfolgerung, kein Beweis.

---

## 3c — Vercel: Was ist da eigentlich „live"?

**Kurzantwort:** Vercel hat **eine** Produktions-Linie, und die ist an **einen** Branch-Namen geknüpft (Standard: der Standard-Branch des Repos). Bei dir ist das `main` — nachgewiesen: `origin/HEAD → origin/main`. Der Branch `codex/uncommitted-cohort-review` ist für Vercel **nie** Produktion, sondern immer nur eine **Preview**.

### Drei Dinge, die alle „fertig" heißen — aber nicht dasselbe sind

| Begriff               | Wo es gilt                                               | Dein Stand heute                                       |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| **committet**         | Git (lokal)                                              | ✅ 146 Commits sind „unterschrieben"                   |
| **auf `main`**        | Git-Etikett **+** Vercel-Einstellung „Production Branch" | ❌ `main` ist 146 Commits zurück                       |
| **live / Production** | Vercel-Deployment, das die Domain bedient                | ❓ hängt an einem Deployment, das älter als beides ist |

### Wie Vercel zwei Sorten Deployment baut

| Sorte          | Auslöser                                                         | Bekommt die Domain?       |
| -------------- | ---------------------------------------------------------------- | ------------------------- |
| **Production** | Push auf den **einen** konfigurierten Production-Branch (`main`) | ja                        |
| **Preview**    | **jeder andere** Branch, jeder Push, jeder PR                    | nein — eigene Preview-URL |

Daraus folgt: Der Stand `8863b64f` vom **09.09.** hat (falls Vercel alle Branches baut) eine **Preview-URL**, aber **keine** Live-Schaltung. Die **86 Commits danach existieren nur auf deinem PC** — sie haben bei Vercel **gar kein** Deployment. Also: **Nein**, der Codex-Branch ist nicht die Live-Variante. Er würde es nur, wenn jemand in Vercel unter _Settings → Git → Production Branch_ genau diesen Namen einträgt.

**„Ist das nur eine Bezeichnung?" — Beides, auf zwei Ebenen:** In **Git** ja, reine Bezeichnung (`main` ist ein Klebezettel an einem Commit). In **Vercel** nein, ein echter Schalter: dort steht ein _eingetragener Name_, und du könntest `irgendwas` eintragen — dann wäre `irgendwas` deine Produktion. Der **Name** ist beliebig, die **Verweisung** darauf ist die Entscheidung.

### Was du im Dashboard selbst nachsehen solltest (4 Blicke)

| #   | Wo                                     | Was du prüfen willst                                                                             |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Settings → Git → **Production Branch** | Steht da wirklich `main`? Falls etwas anderes → deine „Live-Linie" ist eine andere als du denkst |
| 2   | Deployments-Liste                      | Welches Deployment trägt das Label **Production** und die Domain? Das ist der echte Live-Stand   |
| 3   | Dasselbe Deployment → Commit-Hash      | Passt er zu `26503ed5` (GitHub-`main`, 06.09.) oder ist er noch älter?                           |
| 4   | Settings → Git → Build-Settings        | Werden **alle** Branches gebaut (Preview) oder nur bestimmte?                                    |

**Warum das für den Übertrag zählt:** Der Push auf `main` folgt genau dieser Linie. Die Dokumentation beschreibt den Ablauf als **Preview → dein Freigabe-Gate → Production** (manuell), also mit Bremse. Ob dein Projekt wirklich so gebremst ist, steht **nicht** im Repo — das sind die 4 Blicke. Deshalb lautet mein Vorschlag „erst PR/Preview, dann Fast-Forward": der PR zeigt dir das Ergebnis, **ohne** dass die Produktions-Linie sich bewegt.

> **Nebenbefund (Doku vs. Wirklichkeit):** Die Übersicht zeigt ein „Staging Branch → `security-staging.yml`". Die Datei selbst feuert aber auf **`push: branches: [main]`** mit Pfadfilter `supabase/**` — einen Staging-Branch-Trigger gibt es nicht. Auch `quality-ci.yml`, `codeql.yml` und `dependency-audit.yml` kennen **nur** `main`. Praktisch heißt das: **Alles außer `main` wird von GitHub Actions nicht überwacht.**

---

## 4 — Die eine Regel, die 90 % des Chaos verhindert

> **Ein aktiver Arbeitsbranch. Ein Arbeitsverzeichnis. Eine LLM-Session.**
> Alles Gemergte wird gelöscht, sobald es gemergt ist. Push gehört zu „fertig".

**Wann ein Branch trotzdem Sinn hat:** riskantes Vorhaben · paralleles Arbeiten an _verschiedenen_ Themen · Vier-Augen-Prinzip vor dem Zusammenführen · sauberer Ein-Klick-Rückweg.
**Wann nicht:** kleine Doku-Fixes · sequenzielle Arbeit am _selben_ Thema (drei Branches hintereinander erzeugen genau deine Divergenz) · als Backup (ein Branch ist kein Backup) · „ein Branch pro Agenten" (das ist die Ursache deiner 12 Branches).

---

## 5 — Wie man Branches zusammenbringt (die 3 Wege)

| Weg              | Wann                                              | Was passiert                             | Risiko                                        |
| ---------------- | ------------------------------------------------- | ---------------------------------------- | --------------------------------------------- |
| **Fast-Forward** | Zielbranch wurde **nicht** verändert (dein Fall!) | Nur das Etikett wird weitergeschoben     | 🟢 null                                       |
| **Merge-Commit** | Beide Seiten haben sich weiterentwickelt          | Ein „Knoten" verbindet beide Geschichten | 🟡 Konflikte möglich                          |
| **Rebase**       | Man will eine gerade Linie ohne Knoten            | Commits werden neu „abgeschrieben"       | 🔴 schreibt Geschichte um — nur mit Erfahrung |

**Für dich heißt das konkret:** Dein Weg ist Fast-Forward (Weg 1). Nicht aus Glück, sondern weil `main` seit dem 30.08. **niemand** mehr angefasst hat.

**Die Security-Branches musst du nicht mehr zusammenbringen** — das ist am 18.09. um 21:07 (`caf95a5c`) und 21:14 (`c9a45eec`) passiert. Alle Branches außer `recovery-dropped-stash` sind heute Vorfahren deines Arbeitsbranches. Nach dem Fast-Forward nach `main` sind sie **Aufräummüll, kein Wert**. Merksatz: **Branch löschen ≠ Arbeit löschen** — beim Merge sind die Commits längst im Zielbranch enthalten; der Name verschwindet, die Arbeit bleibt.

---

## 6 — Vorurteile & Irrtümer (Mythen-Check)

| #   | Mythos                                                                                 | Wahrheit                                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | „Wenn ich einen Branch lösche, verliere ich Arbeit."                                   | Nur wenn er **nicht** gemergt war. Gemergte Branches sind Kopien eines Etiketts.                                                                                                                                                                         |
| 2   | „`main` ist mein Projekt."                                                             | `main` ist nur ein **Etikett an einem Stand**. Dein Projekt ist der Stand, den du gerade für „echt" hältst.                                                                                                                                              |
| 3   | „Viele Branches = viel geleistete Arbeit = Wert."                                      | Viele Branches = viel **Aufräumlast**. Der Wert steckt in den Commits, nicht in den Etiketten.                                                                                                                                                           |
| 4   | „Ein Branch ist eine Kopie meiner Dateien / braucht viel Platz."                       | Nein. Ein Branch ist ein Lesezeichen; Platz brauchen nur die Änderungen selbst, und die teilen sich alle Branches.                                                                                                                                       |
| 5   | „Ein Merge ist gefährlich."                                                            | 99 % der Merges laufen automatisch. Gefährlich sind nur **Konflikte** — und die entstehen, wenn zwei Stellen dieselbe Zeile anfassen.                                                                                                                    |
| 6   | „Push = Live-Schaltung."                                                               | Push heißt nur „auf GitHub hochladen". Die echte Production-Schaltung ist ein **manueller Schritt von dir im Vercel-Dashboard** (SOP 11, K4). Push ≠ live.                                                                                               |
| 7   | „Stash ist ein Backup."                                                                | Nein. Ein Stash ist die Schublade. Kein Register, keine Reihenfolge, kein Server, kein Schutz.                                                                                                                                                           |
| 8   | „Wenn GitHub grün ist, ist alles gut."                                                 | Bei dir läuft CI nur bei Push/PR gegen `main`. Auf einem Arbeitsbranch ist CI **blind** — der Doc-Link-Blocker aus Runde 2 war lokal grün und auf `main` rot.                                                                                            |
| 9   | „Die ~92.000 sind unfertige Arbeit."                                                   | Nein. Das ist der **Abstand** zwischen zwei Ständen (Branch vs. `main`) — vollständig committet, nur nicht zusammengeführt.                                                                                                                              |
| 10  | „Zwei Agenten gleichzeitig = doppelte Geschwindigkeit."                                | Im **selben Ordner** = doppeltes Chaos. Belegt: während eines 11-Minuten-Audits drei HEAD-Bewegungen, ein verschwundenes Stash-Paar, ein abgebrochener Merge.                                                                                            |
| 11  | „Der Arbeitsbranch war überflüssig — das hätte alles direkt auf `main` laufen können." | Für einen Solo-Entwickler **sachlich fast richtig**. Überflüssig war nicht der Branch, sondern seine **18 Tage Laufzeit**: 146 Commits, 10 Geschwister-Branches, 86 davon nicht gepusht. Und ein Agent _darf_ `main` bei dir nicht bewegen (SOP 11: K4). |
| 12  | „Wenn `main` alt ist, fehlt dort Arbeit."                                              | Nein. `main` ist ein **Vorfahre** deines Branchs — es fehlt dort nichts, was du hast. Kein Verlust, nur ein 146 Commits altes Schild.                                                                                                                    |

---

## 7 — Was dir die Branches gebracht und gekostet haben (dein Repo, heute)

| Gebracht ✅                                                                                           | Gekostet ❌                                                                                  |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Security-Arbeit konnte parallel zu Feature-Arbeit laufen                                              | **`main` ist 146 Commits veraltet** (GitHub: 94) — die zentrale Sichtbarkeit fehlt           |
| Die Merge-Knoten (`caf95a5c`, `c9a45eec`) halten nachvollziehbar fest, was wann zusammengeführt wurde | **86 Commits liegen nur auf diesem PC** — kein Server-Backup, kein zweiter Rechner, keine CI |
| Nichts ist verloren: Runde 1 + 2 sauber in Commits, Security gesichert                                | **5 Neben-Worktrees** mit eigener Konfliktlage; einer ist noch schmutzig                     |
| Riskantes blieb isoliert (der eigentliche Zweck)                                                      | **Unsichtbare CI-Blocker:** weil CI nur gegen `main` läuft, sammeln sich Fehler bis zum Push |

**Der Kern:** Dein Verlustrisiko steckt **nicht** in den Branches, sondern in (a) 82 uncommitteten Einträgen, (b) drei alten Stashes, (c) dem blinden Fleck „`main` hinkt hinterher", (d) 86 Commits ohne Push. Genau diese vier Punkte räumt Plan 04 ab.

---

## 8 — Dein Werkzeugkasten (gefahrlos, alles nur lesend)

| Befehl                                        | Was er dir sagt                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| `git status`                                  | Was ist uncommittet / unmerged — **der wichtigste Befehl überhaupt**             |
| `git log --oneline --graph --all \| head -30` | Die Landkarte aller Branches als Baum                                            |
| `git rev-list --count main..HEAD`             | Wie viele Commits ist mein Stand vor `main`? (heute: 146)                        |
| `git rev-list --count HEAD..main`             | Wie viele hat `main`, die ich nicht habe? (heute: 0 → Fast-Forward möglich)      |
| `git rev-list --count origin/main..HEAD`      | Dasselbe gegen **GitHub**-`main` (heute: 94) — der ehrlichere Vergleich          |
| `git rev-list --count origin/<branch>..HEAD`  | Wie viele Commits sind **noch nicht auf GitHub**? (heute: 86 → dein Backup-Loch) |
| `git reflog show <branch> \| tail -3`         | Wann und woraus wurde ein Branch angelegt?                                       |
| `git branch --merged main`                    | Welche Branches sind schon drin → Löschkandidaten                                |
| `git worktree list`                           | Welche Nebenarbeitsverzeichnisse existieren?                                     |
| `git stash list`                              | Welche Schubladen habe ich? (heute: 3)                                           |

**Faustregel:** Wenn `git status` **nichts** sagt und `git branch --merged main` alle Branches außer einem auflistet, ist dein Repo gesund.

---

## 9 — Mini-Glossar

| Begriff             | Ein Satz                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| **Repo**            | Das Projekt samt seiner ganzen Geschichte, in einem versteckten Ordner `.git`. |
| **main / Mainline** | Das Etikett am Stand, der als „echt" gilt.                                     |
| **Branch**          | Ein Lesezeichen für „ich arbeite ab hier getrennt weiter".                     |
| **Commit**          | Ein eingefrorener, kommentierter Stand.                                        |
| **Merge**           | Zwei Geschichten zusammenführen.                                               |
| **Fast-Forward**    | Merge-Sonderfall, bei dem nur das Etikett weitergeschoben wird.                |
| **Konflikt**        | Zwei Änderungen an derselben Stelle — ein Mensch entscheidet.                  |
| **Push / Pull**     | Zum Server schicken / vom Server holen.                                        |
| **Stash**           | Schnelles Zwischenlager. Kein Backup.                                          |
| **Worktree**        | Zweites Arbeitsverzeichnis zu demselben Projekt.                               |
| **Uncommitted**     | Arbeit, die noch nirgends steht — das einzige echte Verlustrisiko.             |

---

## 10 — Die Sätze, die du behalten solltest

1. **Ein Branch ist ein Lesezeichen, kein Ordner und kein Backup.**
2. **Verloren geht nur, was nicht committet ist — nicht, was in einem Branch liegt.**
3. **Dein Projekt ist nicht `main`, sondern der Stand, den du für aktuell hältst.** Wenn `main` 146 Commits hinterherhinkt, ist das ein Sichtbarkeitsproblem, kein Wertverlust — und ein Fast-Forward behebt es in einem Schritt.
4. **Nichts bewegt sich von selbst.** Die 146 Commits liegen nicht auf `main`, weil niemand sie dorthin geschoben hat — und niemand _durfte_, weil „Merge nach `main`" eine Freigabe von dir verlangt (K4). Der nächste Schritt ist keine technische Frage, sondern **ein Satz von dir**.

---

> **Was am 22:05 entfernt wurde** (dieser Datei-Version, auf deinen Wunsch „Rest auf ein Minimum"): die ausführlichen Metaphern-Erzählungen (Aufsatz-Heft-Szene, Bäckerei-Durchgang), die Prosa-Blöcke aus §4/§5/§7 und das lange Vor-/Nachteile-Kapitel. **Alle Tabellen sind vollständig erhalten.** Die Datei ist **nicht** in Git — entfernte Passagen sind also endgültig weg; sag Bescheid, wenn du einen Abschnitt zurückwillst, dann schreibe ich ihn neu.

> **Aufräum-Hinweis:** Wenn du diese Datei gelesen hast, kann der gesamte Ordner `T_REPO_HYGIENE/Fuer Jan/` gelöscht werden. Er ist in keinem Register eingetragen, hat also keine Folgeverweise.
