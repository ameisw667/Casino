# 01 — Spielfunktion: Spielerlebnis-Status quo (P38-Basis)

> **Erstellt:** 2026-08-30 · **Überarbeitet:** 2026-08-30 nach Jans Auswahl · **Status:** Analyse/Planung — keine Code- oder Runtime-Änderung durch diese Datei.
> **Anlass:** P38 (aktiver Punkt in [`worldmap/05_ZUKUNFTSPLANUNG.md`](../worldmap/05_ZUKUNFTSPLANUNG.md)) — Ziel: mehr Spaß im einzelnen Moment und ein Grund, wiederzukommen. Diese Datei ist die Faktenbasis und die Übersicht der von Jan aufgenommenen Kategorien.
> **Reduktion 2026-08-30 (Jans Entscheidung):** Aus den ursprünglich 10 Subkategorien wurden nur die von Jan aufgenommenen Kategorien (S1–S5, S7–S10) hier geführt entfernt — S6 (Wettbewerb & Sozial, Top 25 %, stärkste Fläche) wurde nicht aufgenommen und ist aus dieser Datei entfernt. Ebenfalls entfernt auf Jans Entscheidung: das Branchen-Kapitel (§1), die Evaluierung (§4) und die Vorschlagsliste (§5); die 15 Vorschläge aus der Chat-Zusammenfassung zu P38 bleiben dort dokumentiert und werden erst nach Freigabe als eigene `worldmap/0N_*.md`-Pläne geführt.
> **Bewertungsskala:** identisch zu [`worldmap/00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md) §1 — **Top 1 % = Weltklasse, Top 100 % = schlechtestes Viertel**, gemessen an vergleichbaren Hobby-/Indie-Webprojekten. Die Werte sind fundierte Schätzungen auf Code-/Feature-Ebene mit Pfad-Nachweisen, **keine** vermessene Nutzerdaten; visuelle Geschmacksqualität wird bewusst nicht bewertet (Jans Domäne).

---

## 1 — Übersicht für Jan

**Status-Legende:** 📌 Aufgenommen (Jan hat den Punkt explizit bestätigt, teils mit Ergänzung) · ✅ Relevant markiert (Jan hält den Punkt für relevant, Umsetzungsentscheidung noch offen) · 🔴 Offen (noch nichts umgesetzt) · 🟡 In Planung (nächster Schritt definiert, wartet auf Freigabe) · 🟢 Umgesetzt (nicht vorhanden — keiner der Punkte ist angegangen).

| Nr. | Kategorie                                     | Niveau aktuell | Jans Entscheidung (2026-08-30)                                                                                                                                     | Status                                                       | Klarer nächster Schritt                                                                                                                                                |
| --- | --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Onboarding & die ersten Minuten               | Top 35 %       | 📌 Aufgenommen — **mit Ergänzung:** Das Intro soll bleiben, aber **optional** sein: Der Nutzer muss es jederzeit mit einem einzigen Klick einfach schließen können | 🟢 Umgesetzt (2026-08-30, Mix A+B — Abnahme durch Jan offen) | Klick-Pfad prüfen (Schließen in allen 3 Phasen, „Play Now" nach Skip → direkt Anmeldung, Menüpunkt „So funktioniert es"); Optionen D/E vorgelegt, warten auf Jans Wahl |
| S2  | Belohnungs-Feedback im Moment                 | Top 30 %       | 📌 Aufgenommen („möchte ich angehen")                                                                                                                              | 🔴 Offen                                                     | Plan aufmachen: Streak-Ebene durchgängig + Gewinnton eskaliert mit Gewinnhöhe                                                                                          |
| S3  | Fortschritts-System (XP, Level, Rank, VIP)    | Top 40 %       | ✅ Relevant markiert                                                                                                                                               | 🔴 Offen                                                     | Kandidaten aus der Chat-Zusammenfassung: Aufstiegs-Moment (Overlay), XP-Mikro-Anzeige — noch ohne Jans Go                                                              |
| S4  | Erfolge & Sammelziele                         | Top 45 %       | ✅ Relevant markiert                                                                                                                                               | 🔴 Offen                                                     | Kandidat: Erfolgs-Freischaltung als sichtbarer Moment im Spiel — noch ohne Jans Go                                                                                     |
| S5  | Wiederkommen (Daily Bonus, Missions, Streaks) | Top 55 %       | ✅ Relevant markiert                                                                                                                                               | 🔴 Offen                                                     | Kandidaten, aber **Design-Decision nötig** (was/woher wird belohnt — Options-Gate + mögliche Migration)                                                                |
| S7  | Lobby & Orientierung                          | Top 25 %       | ✅ Relevant markiert                                                                                                                                               | 🔴 Offen                                                     | Teilweise durch P38-Teil 2 abgedeckt (mobile Ladezeit auf `/`); personalisierte Vorschläge als Kandidat                                                                |
| S8  | Spielgefühl je Spiel                          | Top 30 %       | ✅ Relevant markiert                                                                                                                                               | 🔴 Offen                                                     | Kandidat: einheitliche, immer sichtbare „letzte Ergebnisse"-Leiste über alle 5 Spiele                                                                                  |
| S9  | Personalisierung & Komfort                    | Top 25 %       | ✅ Relevant markiert                                                                                                                                               | 🔴 Offen                                                     | Kleinster Hebel — Feinschliff (z. B. Gewinn-Kurzanimationen abschaltbar); bewusst nachrangig                                                                           |
| S10 | Messbarkeit des Erlebens                      | Top 60 %       | ✅ Relevant markiert                                                                                                                                               | 🔴 Offen                                                     | **Voraussetzung für die Überprüfung aller anderen Punkte:** Engagement-Events für das Spielgeschehen ergänzen                                                          |

**Reihenfolge (Jans Entscheidung):** Jan startet mit S1 — das Option-Gate dazu steht in §2. Die vorherige Reihenfolge-Empfehlung (S10 zuerst) bleibt als Vorschlag im Raum, ist aber kein Beschluss; ohne S10-Messung bleibt der Erfolg aller Punkte nach dem Bau nicht überprüfbar.

**Wann wurde was angegangen?** **S1 ist seit 2026-08-30 umgesetzt** (Mix A+B, Umsetzungsdetails in §2.6); visuelle Abnahme durch Jan steht noch aus. Alle übrigen Kategorien sind weiterhin 🔴 Offen. Sobald ein Punkt in eine `worldmap/0N_*.md` überführt oder umgesetzt wird, wird hier ein Startdatum und Status-Update nachgetragen (gleiche Disziplin wie `00_WORLDMAP_STATUS.md`).

---

## 2 — Option-Gate: S1 „Onboarding & die ersten Minuten" (2026-08-30)

### 2.0 — Entscheidung (2026-08-30)

- **Jans Wahl: Mix aus Option A + Option B** — beides wird umgesetzt (A ist vollständiger Teil von B). Korrektur zur Begründung in Jans Entscheidung: Die Scores waren nicht beide 4.05, sondern A **4.20** und B **4.05**; der Mix ist trotzdem konsistent, weil Option A vollständig in Option B enthalten ist.
- **Option C (nicht-blockierender Umbau)** wurde auf Jans Entscheidung **gestrichen** und wird nicht weiter verfolgt.
- **Neu:** Option D und E sind als weitere Verbesserungswege vorgelegt (Status: ⏳ wartet auf Jans Wahl). Kein Code wurde dafür angefasst.
- **Umsetzung des Mixes A+B** folgt nach [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md) und ist unten dokumentiert.

### 2.1 — Fakten-Basis (Code-Verifizierung, nicht Annahme)

1. **Auslöser:** Das Intro öffnet sich automatisch bei einem neu eingeloggten Nutzer — aber nur nach Klick auf „Play Now" der Startseite (`HeroSection.tsx:209` / `HeroSectionV2.tsx:416` → `startOnboarding()` in `src/store/slices/settingsSlice.ts:65` → `WELCOME`). Standard-Zustand ist `NONE` (`settingsSlice.ts:34`).
2. **Ein-Klick-Schließen existiert bereits in allen 3 Phasen:** X-Button oben rechts in WELCOME (`OnboardingFlow.tsx:90`), LOGIN (`:201`) und TOUR_VAULT (`:309`, mit `aria-label="Skip onboarding"`); WELCOME zusätzlich der Text-Skip „I DON'T WANT FREE MONEY, SKIP THIS" (`:158`). Der Wunsch (1-Klick-Schließen) funktional bereits erfüllt — aber zu unauffällig: nur Icon, kein Label; für Jan nicht erkennbar genug.
3. **Skip wird nicht gemerkt:** Nach dem Schließen bleibt `NONE` persistiert, aber ein späterer „Play Now"-Klick startet das Intro wieder von vorn (kein „nie wieder zeigen"-Flag).
4. **Toter Schritt:** `OPEN_CASE` wird gesetzt (`OnboardingFlow.tsx:332,397`), aber von keiner Komponente gelesen.
5. **Sign-in überschreibt alles:** Beim Einloggen erzwingen parallele Effekte (`OnboardingFlow.tsx:42-45` und `MainLayout.tsx:126-134`) `COMPLETED`.

### 2.2 — Optionen-Matrix

| Option | Konzept & Architektur                                                                                                                                                                                                                                                                                   | Trade-off-Kontext (wann genau die beste Wahl)                                                                                                                      | Aufwand                                                                        | Score (gewichtet) |
| :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- | :---------------- |
| **A**  | **Eindeutig schließbar machen** — Das 3-Phasen-Modal bleibt; das Schließen wird einheitlich und sichtbar: beschriftetes „✕ Schließen" an derselben Stelle in jeder Phase, eine geteilte Schließen-Funktion statt drei Kopien, toter `OPEN_CASE`-Schritt entfernt                                        | Wenn die Grundstruktur (blockierendes Intro nach „Play Now"-Klick) konzeptionell richtig ist und nur die Schließbarkeit nicht erkennbar genug ist                  | 1 Datei (`OnboardingFlow.tsx`), 0 Migrationen                                  | **4.20 / 5**      |
| **B**  | **Skip merken („nie wieder")** — Option A plus persistentes `onboardingDismissed`-Flag im Store: Wer einmal geschlossen hat, landet bei erneutem „Play Now" direkt bei der Anmeldung statt im wiedereinsetzenden Intro; das Intro bleibt über einen expliziten „So funktioniert es"-Einstieg erreichbar | Wenn Rückkehrer das erneute Auftauchen des Intros als Ärger empfinden — also wenn „Play Now" für sie „spielen" bedeutet, nicht „Willkommen heißen"                 | 2–3 Dateien (`OnboardingFlow.tsx`, `settingsSlice.ts`, Tests), 0 Migrationen   | **4.05 / 5**      |
| **D**  | **Geführter erster Einsatz (S1-Kern-Lücke schließen)** — Der Flow endet nicht mehr nach der Vault-Ankunft: einmalige, jederzeit schließbare Hinweis-Chips in den Spielen lenken den neuen Spieler zum ersten realen Einsatz; Ziel: erster spürbarer Moment innerhalb weniger Sekunden nach Anmeldung    | Wenn das echte Problem nicht das Intro selbst ist, sondern der Stau danach: Spieler werden abgemeldet, sehen die Lobby und wissen nicht, womit sie anfangen sollen | Mehrere Dateien (Spiel-Views/HUD + Store-Hinweise-Flag + Tests), 0 Migrationen | **4.05 / 5**      |
| **E**  | **Flow-Kompression (3 Phasen → 2)** — WELCOME und LOGIN zu einer Karte verschmelzen (Anspruch + Anmelde-CTA in einer Ansicht), TOUR_VAULT-Spotlight bleibt; weniger Klicks, kürzere Blockierzeit                                                                                                        | Wenn das blockierende Erlebnis insgesamt als zu lang empfunden wird — weniger Klicks bis zum Wert, ohne den Flow neu zu erfinden                                   | 1 Datei (`OnboardingFlow.tsx` reorganisiert) + Tests, 0 Migrationen            | **3.85 / 5**      |

**Streichung (2026-08-30, Jans Entscheidung):** Option C (nicht-blockierender Umbau, Score 2.90/5) wurde nach Jans Wertung aus dem Gate entfernt und wird nicht weiter verfolgt.

### 2.3 — Scoring im Detail

**Kriterien:** Lerneffekt 30 % · Aufwand 25 % · Risiko 25 % · Wartbarkeit 20 %.

| Kriterium              | A (gew. Beitrag)                                                            | B (gew. Beitrag)                                                                                                                                                               | D (gew. Beitrag)                                                                                                | E (gew. Beitrag)                                                                                                                         |
| :--------------------- | :-------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Lerneffekt (30 %)**  | 3/5 → 0.90 — UI-Konsolidierung, kein neues Muster gelernt                   | 4.5/5 → 1.35 — Konversions-Logik: Skip-Gedächtnis + Intro-Ankoppelung an CTA sind ein echtes Produkt-Muster                                                                    | 4.5/5 → 1.35 — Progressive-Onboarding/In-Game-Hints ist ein neues, tiefes Muster                                | 4/5 → 1.20 — Konversions-Funnel-Kompression, sichtbar messbar an der Schrittanzahl                                                       |
| **Aufwand (25 %)**     | 5/5 → 1.25 — 1 Datei, bestehende onClick-Pfade unverändert                  | 4/5 → 1.00 — zusätzlich Flag + Branch in `startOnboarding()` + Test-Anpassung (`useCasinoStore.test.ts:103,944`)                                                               | 3/5 → 0.75 — Hinweis-Chips müssen in jede der 5 Spiel-Views oder zentral ins HUD                                | 4/5 → 1.00 — 1 Datei wird reorganisiert + Tests angepasst                                                                                |
| **Risiko (25 %)**      | 5/5 → 1.25 — kein Verhaltenswechsel, kein neuer Zustand, kein Persist-Drift | 4/5 → 1.00 — neue gemerkte Skip-Semantik ändert sichtbares Verhalten, aber ohne Geld-/Datenpfad; Persist-`partialize` nimmt das Flag automatisch mit (`useCasinoStore.ts:451`) | 4/5 → 1.00 — client-only, aber mehr bewegliche Teile über 5 Spiele; Hinweis-Persistenz muss einen Nerv schlagen | 4/5 → 1.00 — reine Restrukturierung in einer Datei, bestehende CTAs bleiben erhalten; Konversions-Wirkung ohne Daten nicht verifizierbar |
| **Wartbarkeit (20 %)** | 4/5 → 0.80 — dedupliziert 3 X-Buttons zu 1; entfernt toten `OPEN_CASE`      | 3.5/5 → 0.70 — ein Flag mehr, das dokumentiert und getestet werden muss                                                                                                        | 3.5/5 → 0.70 — Hinweis-Status je Spiel muss gepflegt werden                                                     | 4.5/5 → 0.90 — eine Phase weniger, weniger Code als heute                                                                                |
| **Summe**              | **4.20**                                                                    | **4.05**                                                                                                                                                                       | **4.05**                                                                                                        | **3.85**                                                                                                                                 |

**Mindest-Bar:** A, B, D und E liegen über 3.0 — alle sind tragfähig; C liegt (vor Streichung) darunter, weil der eigentliche Umbau nur bei einem mittel- bis langfristigen „geführten ersten Einsatz" gerechtfertigt wäre.
**Tie-Break (ursprüngliche Rangfindung):** A (4.20) und B (4.05) lagen 0.15 auseinander → nach SOP entschied das Kriterium **Risiko** für A. Jans Entscheidung übernimmt dennoch **beide** (Mix), was konsistent ist, weil A vollständig in B enthalten ist. D teilt B's Score (4.05), E liegt knapp darunter (3.85) — D und E stehen als weitere Wahl offen und sind in der Entscheidung von A+B nicht enthalten.

### 2.4 — Gegenprobe (Adversarial) & Pre-Mortem

- **Bewertung der B-Gegenprobe (entwertet durch Jans Entscheidung):** Die Adversarial-Annahme für B — „Rückkehrer empfinden das erneute Auftauchen als Frust, messbar über `cta_play_now_clicked` ohne `sign_up_completed` in derselben Session" — ist durch den Mix aus A+B abgedeckt und damit kein offenes Risiko mehr.
- **Wäre D doch die dringendere Wahl?** Ja, unter einer konkreten Annahme: Wenn die S10-Messung später zeigt, dass Spieler das Intro inzwischen problemlos schließen bzw. durchlaufen, aber nach der Anmeldung in der Lobby ins Stocken geraten (kein erster Einsatz), dann ist D der eigentliche S1-Hebel — der Mix aus A+B verbessert nur die Tür, nicht den Weg danach.
- **Wäre E doch die bessere Wahl?** Ja, wenn Jan das blockierende Erlebnis insgesamt als zu lang empfindet: Zwei Schritte weniger Blockierzeit erhöhen die Quote derer, die es komplett durchlaufen — ein Umbau von Grund auf wäre dafür nicht nötig, nur die Verschmelzung von WELCOME und LOGIN.
- **Pre-Mortem (Freigabe-Mix aus A+B):** Scheitert der Mix in 6 Monaten, dann am wahrscheinlichsten daran, dass das durch das Dismiss-Flag seltener gesehene Intro zugleich den einzigen „So funktioniert es"-Moment abdeckt: Spieler, die einmal schließen, sehen die Funktion nie wieder — die Entdeckbarkeit des Flows sinkt. Gegenmittel, das deshalb mit geliefert wird: der explizite „So funktioniert es"-Einstieg, mit dem sich das Intro jederzeit freiwillig wieder öffnen lässt.

### 2.5 — Selbstprüfung (SOP §5)

- [x] Lerneffekt benannt (je Option, siehe 2.3)
- [x] Nicht-Scope pro Option: A faßt **kein** Verhalten an (kein neuer Zustand, kein anderer Flow-Ablauf, CTA-Kopplung unverändert); B faßt die Flow-Ablauflogik an, aber **keine** Wallet-/Money-Komponente und keine DB; D würde zusätzlich 5 Spiel-Views bzw. das HUD angreifen; E würde die Phasenstruktur selbst anfassen. A+B sind freigegeben; D und E: **kein Code angefasst**, keine Migration, keine Security-Relevanz in allen vier (rein UI-seitig)
- [x] Dateien und Verifizierung angegeben: A → `src/components/layout/OnboardingFlow.tsx`; B → zusätzlich `src/store/slices/settingsSlice.ts` + `src/store/__tests__/useCasinoStore.test.ts`; D → Spiel-Views/HUD + Store-Hinweise-Flag + Tests; E → `OnboardingFlow.tsx` reorganisiert + Tests. Verifizierung je Option: `npm run test`, `npm run typecheck`, `npm run lint`, danach Klick-Pfad-Abnahme durch Jan (visuelle Beurteilung ist Jans Domäne; kein Selbst-Visual-Check im Rahmen dieser Regel)
- [x] Echte Trade-off-Achsen: Sichtbarkeit des Schließens (A) vs. dauerhaftes Skip-Gedächtnis (B) vs. Länge des Flows nach dem Intro (D) vs. Blockierzeit im Intro (E) — keine Aufwands-Leiter verkleidet
- [x] Score belegt (Dateien/Zustands-/Persist-Beweise), Adversarial nicht als Feigenblatt (je Option konkretes Szenario), Pre-Mortem vorhanden

**Ergebnis:** Jans Entscheidung (2026-08-30) = **Mix aus A + B**, C gestrichen. D und E stehen zur weiteren Bewertung offen.

### 2.6 — Umsetzung des Mixes A+B (2026-08-30, abgeschlossen)

**Verhalten (kinderleicht erklärt):** Wer das Intro mit „✕ Schließen" (oder dem Skip-Text) wegklickt, kann es beim nächsten „Play Now" **nicht wieder zufällig vor die Nase gesetzt bekommen** — statt der Willkommens-Karte landet er direkt bei der Anmeldung. Wer den Flow bewusst noch einmal sehen will, nutzt den neuen Menüpunkt **„So funktioniert es"** in der Seitenleiste: Dann öffnet sich die komplette Tour inklusive Willkommens-Karte erneut. In jeder der 3 Phasen sitzt derselbe beschriftete Schließen-Button — ein Klick genügt, wie von Jan gewünscht.

**Code-Änderungen (5 Dateien):**

| Datei                                      | Änderung                                                                                                                                                                                                                                                                    |
| :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/store/slices/types.ts`                | `OnboardingStep`-Union ohne toten `OPEN_CASE` (`'NONE' \| 'WELCOME' \| 'LOGIN' \| 'TOUR_VAULT' \| 'COMPLETED'`); `SettingsSlice` um `onboardingDismissed: boolean`, `startOnboarding(force?: boolean)` und `dismissOnboarding()` erweitert                                  |
| `src/store/slices/settingsSlice.ts`        | `dismissOnboarding()` setzt Step `NONE` + merkt `onboardingDismissed=true`; `startOnboarding()` (Play-Now-Default) lässt das Dismiss-Flag stehen; `startOnboarding(true)` (Menü-Einstieg) hebt es auf und öffnet die volle Tour                                             |
| `src/components/layout/OnboardingFlow.tsx` | Geteilter `OnboardingCloseButton` (beschriftetes „Schließen ✕") in **allen 3 Phasen** — ersetzt die 3 unauffälligen X-Icons; Skip-Text ruft ebenfalls `dismissOnboarding`; neuer Effect springt `WELCOME → LOGIN`, wenn dismissed; tote `OPEN_CASE`-Übergänge → `COMPLETED` |
| `src/store/useCasinoStore.ts`              | Persist-`version` 3 → **4**; Migration normalisiert persistierte Alt-Stände `onboardingStep: 'OPEN_CASE'` → `'COMPLETED'` (sonst bliebe der Flow für Bestandsnutzer unsichtbar hängen); `onboardingDismissed` wird via bestehendes `partialize` automatisch persistiert     |
| `src/components/layout/MainLayout.tsx`     | Neuer Menüpunkt **„So funktioniert es"** (`HelpCircle`-Icon) zwischen Stats und Settings → `startOnboarding(true)`                                                                                                                                                          |

**Tests (TDD, `src/store/__tests__/useCasinoStore.test.ts`):** 3 neue Tests im Block `dismissOnboarding — Intro-Skip merken`: (1) Schließen schließt Flow und merkt sich das Dismiss, (2) erneut „Play Now" respektiert das Dismiss, (3) `startOnboarding(true)` öffnet die volle Tour und löscht das Dismiss. RED (3× `dismissOnboarding is not a function`) → GREEN.

**Verifizierung (2026-08-30):**

- `npm run test` — **1281/1281 pass** (167 Dateien)
- `npm run typecheck` — 1 Fehler in `AdminOverviewClient.tsx:215`, der **vorbestehend auf HEAD identisch** existiert (per Stash-Vergleich geprüft); meine Änderungen erzeugen keinen neuen Fehler
- `npm run lint` — 1 Fehler in einem Agent-Eval-Testfixture (`.claude/agent-evals/11_residue_scout/...`), ebenfalls vorbestehend und nicht von dieser Änderung
- **Offen:** Visuelle Klick-Pfad-Abnahme durch Jan (Jans Domäne, kein Selbst-Visual-Check)

---

## 3 — Detail: die aufgenommenen Kategorien

### S1 — Onboarding & die ersten Minuten — **Top 35 %**

- **Branchen-Standard:** Erste Minuten fühlen: Willkommens-Choreografie, geführter erster Einsatz, „Aha"-Moment innerhalb von 60 Sekunden.
- **Ist-Zustand:** Blockierender Willkommens-Flow mit definierten Schritten (WELCOME → LOGIN → TOUR_VAULT → OPEN_CASE, `src/components/layout/OnboardingFlow.tsx`); Telegram-Begleitung an Tag 0/2/7 als Trigger.dev-Task (`src/trigger/player-onboarding-drip.ts`). Das ist für ein Indie-Projekt außergewöhnlich viel.
- **Lücke:** Der Flow endet vor dem ersten Gefühls-Moment (kein geführter erster Einsatz); mobil war die Registrierung auf iPhone 15 zeitweise blockiert (P38-Teil 1, behoben, L3-Abnahme offen) — der erste Eindruck auf dem wichtigsten Gerät ist damit gerade erst reparabel.
- **Jans Ergänzung (2026-08-30):** Der Flow wird aufgenommen, aber **optional**: Ein neu eingeloggter Nutzer bekommt das Intro weiterhin, muss es aber jederzeit mit **einem einzigen Klick** einfach schließen können. [→ Options-Gate-Vorbild: `xx_sop/01_workflow_jan_option_gate.md`](../xx_sop/01_workflow_jan_option_gate.md)
- **Option-Gate (2026-08-30):** Vollständig in §2 geführt — Entscheidung war der **Mix A+B**, umgesetzt am selben Tag (Umsetzung: §2.6).

### S2 — Belohnungs-Feedback im Moment — **Top 30 %**

- **Branchen-Standard:** Jedes Ergebnis gibt eine Gesten-, Ton- und Bildreaktion; große Gewinne eskalieren sichtbar.
- **Ist-Zustand:** Big-Win-Schwelle (20× oder 500 Auszahlung, `src/lib/casino/big-win.ts`) + `BigWinOverlay`; 19 Sound-Dateien im Bestand, je Spiel Win-/Loss-/Aktionstöne (`public/sounds/`), zentraler Sound-Manager (`src/lib/casino/sound-manager.ts`), Framer-Motion-Regeln im Design-System.
- **Lücke:** Die Streak-Ebene fehlt als durchgängiges Erlebnis (nur Dice zeigt den Win-Streak), und der Sound eskaliert nicht mit der Gewinnhöhe — ein 2×-Gewinn klingt fast wie ein 15×-Gewinn.
- **Jans Entscheidung (2026-08-30):** Diesen Punkt angehen.

### S3 — Fortschritts-System (XP, Level, Rank, VIP) — **Top 40 %**

- **Branchen-Standard:** Fortschritt überall sichtbar, Aufstieg als Feier, nächste Stufe immer im Blick.
- **Ist-Zustand:** Serverseitige Autorität (XP/Level/Rank im Wallet-Snapshot, `src/store/slices/walletSnapshotSlice.ts`, ausgelagert nach Supabase); `LevelProgress` im Header (`src/components/layout/LevelProgress.tsx`), VIP-Progression im Vault (`VaultVipProgression.tsx`, `VaultTierShowcase.tsx`), Rank-Vorteile einsehbar (`RankBenefitsModal.tsx`), Teaser auf der Startseite (`VipProgressTeaser.tsx`).
- **Lücke:** Es fehlt der Aufstiegs-Moment: Der Übergang auf ein neues Level/Rank ist kein Ereignis (kein Overlay, keine Vorteils-Vorschau), XP-Zuwachs nach einem Einsatz wird nicht angezeigt. Fortschritt existiert als Zustand, nicht als Erlebnis.

### S4 — Erfolge & Sammelziele — **Top 45 %**

- **Branchen-Standard:** Erfolgs-Freischaltung als lautstarker Moment + Sammeldrang (Anzahl X von Y, geheime Erfolge).
- **Ist-Zustand:** 10 definierte Erfolge inkl. Geheim-Erfolgen (`src/lib/casino/achievements-config.ts`: `first_bet`, `high_roller`, `lucky_streak`, `big_win`, `level_10`, `level_50`, `crash_master`, `daily_grinder`, `moon_shot`, `lucky_seven`), serverseitige Auswertung (`achievements-config-server.ts`), Fortschritts-Merge, Präsentations-Layer (`achievement-presentation.ts`), Anzeige im Vault.
- **Lücke:** Der Moment des Freischaltens ist unsichtbar (siehe S3-Lücke); die Erfolge leben in einem Ort (Vault), den ein Spieler im Spielalltag selten öffnet. Die Engine ist da — das Erlebnis rundum fehlt.

### S5 — Wiederkommen (Daily Bonus, Missions, Streaks) — **Top 55 %**

- **Branchen-Standard:** Täglicher Login-Bonus mit Streak-Kalender, 2–3 Tages-Missionen, Streak-Belohnungen. _Der_ Retention-Standard der Branche.
- **Ist-Zustand:** Der einzige tägliche Anker ist der Daily Race (Reset um UTC-Mitternacht, `src/lib/casino/daily-race.ts`, API `/api/tournaments/daily-race`, Teaser `DailyTournamentTeaser.tsx`) plus Telegram-Drip von außen.
- **Lücke:** Kein Daily-Bonus, keine Missions, keine Streak-Belohnung. Damit fehlt genau das Muster, das in der Branche als stärkster Hebel für Wiederkommen gilt.
- **Offenes Design-Decision (bewusst nicht entschieden):** Was wird belohnt und aus welcher Quelle (Wallet-/Guthaben-Design berühren?) — Options-Gate nötig, möglicherweise Migration.

### S7 — Lobby & Orientierung — **Top 25 %**

- **Branchen-Standard:** Die Einstiegsseite verkauft den nächsten Klick: Spielauswahl, Live-Beweis von Gewinnen, eigener Fortschritt.
- **Ist-Zustand:** Für ein Indie-Projekt ungewöhnlich reiche Lobby: Cinematic Hero, Bento-Layout, interaktives Spielraster, Ambient-Background, Neon-Arcade-Dashboard (`src/components/home/`), dazu Notification-Center, Command-Palette, Wallet-Modal.
- **Lücke:** Keine personalisierten Vorschläge („womit du zuletzt gespielt hast"); und die bekannte mobile Ladezeit-Lücke (LCP 5,7 s auf `/`, P38-Teil 2) untergräbt genau diesen ersten Eindruck technisch. Visuelle Qualität der Lobby ist bewusst nicht Teil dieser Bewertung.

### S8 — Spielgefühl je Spiel — **Top 30 %**

- **Branchen-Standard:** Wenige Klicks pro Runde, Auto-Wiederholung, Verlauf immer sichtbar, nachvollziehbare Gerechtigkeit.
- **Ist-Zustand:** Auto-Bet für Dice und Crash (`autoBetSettings` im Store, `src/store/slices/settingsSlice.ts`), Einsatz-Historie pro Spieler (HistorySlice), Lifetime-Statistik (`stats-derivation.ts`, `VaultLifetimeStats.tsx`), Provably-Fair-Werkzeug und -Modal (`ProvablyFairTool.tsx`/`ProvablyFairModal.tsx`) als Vertrauensmoment, zentrale Wett-Validierung (`bet-validator.ts`).
- **Lücke:** Auto-Bet und Statistik-Tiefe sind zwischen den 5 Spielen ungleich verteilt; eine einheitliche, immer sichtbare „letzte Ergebnisse"-Leiste fehlt. (Kein Bet-Replay — bewusst in [`05_ZUKUNFTSPLANUNG.md`](../worldmap/05_ZUKUNFTSPLANUNG.md) „Nicht Bestandteil".)

### S9 — Personalisierung & Komfort — **Top 25 %**

- **Branchen-Standard:** Der Spieler bestimmt Ton, Lautstärke, Geschwindigkeit, Mitteilungen.
- **Ist-Zustand:** Settings-Slice mit Lautstärke, Sound an/aus, Auto-Bet- und Provably-Fair-Voreinstellungen (`settingsSlice.ts`), Settings-Modal und -Popover, Notification-Center mit Digest (`NotificationCenter.tsx`, Digest-Task in Trigger.dev), Command-Palette.
- **Lücke:** Klein — diese Subkategorie ist funktional weit; der Resthebel liegt in Feinentwicklung (z. B. Gewinn-Kurzanimationen abschaltbar), nicht im Fehlen.

### S10 — Messbarkeit des Erlebens — **Top 60 %** _(schwächste Kategorie)_

- **Branchen-Standard:** Die Betreiber wissen für jeden Moment, was Spieler halten bleibt: Einsatz-Frequenz, Session-Länge, Reaktion auf Großgewinne, Wiederkomm-Rate.
- **Ist-Zustand:** PostHog-Stack solide aufgebaut (Consent, strikte Event-Zulassungsliste, BI-Dashboard `/admin/analytics`, Daily-Snapshot) — aber die Zulassungsliste (`src/lib/analytics/events.ts`) enthält vom Spielgeschehen nur `first_game_started` und `stats_viewed`. Was fehlt, ist nicht Infrastruktur, sondern Events.
- **Lücke:** Ohne Engagement-Events (Einsatz platziert, Großgewinn gesehen, Erfolg gelöst, Session begonnen/beendet, Race angesehen) ist jede Verbesserung aus dieser Datei nach dem Bau nicht überprüfbar. Das macht S10 zur Voraussetzung für alles andere.

---

## 4 — Verfahrensregel für Status-Updates

Sobald Jan eine Kategorie zur Umsetzung freigibt: eigene `worldmap/0N_*.md` nach [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) anlegen, danach in der Tabelle in §1 dieser Datei Status von 🔴 auf 🟡 setzen mit Startdatum — dieselbe Update-Disziplin wie in [`00_WORLDMAP_STATUS.md`](../worldmap/00_WORLDMAP_STATUS.md). Entfernte Original-Kapitel (S6, Branchen-Kapitel, Evaluierung, Vorschlagsliste) sind im Git-Verlauf dieser Datei dokumentiert und werden nicht still nachgezogen.
