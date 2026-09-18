# 10 — `security.txt` / RFC 9116 (Runde 2 — Ziel Top 10 %)

> **Status:** 🟢 Ausgeführt (L1, 2026-09-18) · **Stand:** 2026-09-18 · **Owner:** LLM (100 % LLM-Zuständigkeit — neue optionale Felder (`Encryption`, `Acknowledgments`, `Policy`) sind **explizit nicht Teil dieser Runde**, siehe §0) · **Scope:** neuer CI-Reminder-Mechanismus vor Ablauf des `Expires`-Felds (Muster: Secret-Rotation-Fälligkeits-Tracking, Säule 8); **nicht** im Scope: `Encryption`/`Acknowledgments`/`Policy`/`Hiring`-Felder (Jan/K5 — erfordern jeweils eine noch nicht getroffene Entscheidung: PGP-Key, Hall-of-Fame, formale Disclosure-Policy-Seite).
> **Money-Pfad:** Nein (statische Datei + CI) · **Security-Review:** Nein (rein additiv, kein Verhaltenspfad geändert)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Diese Säule hat noch keine eigene Planungsdatei — nur einen archivierten Runde-1-Stand ([`docs/archive/t_security_hardening_10_security_txt_rfc9116.md`](../docs/archive/t_security_hardening_10_security_txt_rfc9116.md), 2026-08-30, Top 14-15 %). Gewicht dieser Säule ist mit 5 von 100 Punkten eines der niedrigsten aller 10.
2. **Frische `casino-code-explorer`-Recherche (2026-09-12)** bestätigt: **Kein Delta zum Archiv-Stand** — die Datei ist inhaltlich identisch zum dokumentierten Stand. `Expires: 2027-08-28T00:00:00.000Z` liegt noch ~11,5 Monate in der Zukunft (kein akutes Risiko). Die einzige reale, unadressierte Lücke ist strukturell dieselbe wie im Archiv bereits benannt: Es gibt keinen automatisierten Reminder-Mechanismus vor Ablauf dieses Datums — bei einer statischen Datei mit festem Ablaufdatum ist das ein reales, wenn auch langfristiges Wartungsrisiko (eine abgelaufene `security.txt` ist laut RFC 9116 ungültig, Sicherheitsforscher könnten sie ignorieren).
3. **Diese Datei ist reine Planung, keine Ausführung** (Jan-Auftrag 2026-09-12).
4. **Kein K5-Punkt für den einzigen geplanten Meilenstein (L1)** — die optionalen Zusatzfelder aus §0 Punkt „Scope" bleiben bewusst außerhalb, da sie jeweils eine echte Entscheidung von Jan brauchen (z. B. einen PGP-Key anlegen).

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                   | Scope (Dateien)                                                                                          |          Status          | Zuständigkeit | Verifikation                                                                                                              |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- | :----------------------: | :-----------: | ------------------------------------------------------------------------------------------------------------------------- |
| L1  | Automatisierter `Expires`-Reminder vor Ablauf | Neuer Workflow-Schritt (Muster: `check-secret-rotation`, Säule 8, L4), `public/.well-known/security.txt` | 🟢 executed (2026-09-18) |      LLM      | CI-Job-Summary zeigt die verbleibende Zeit bis `Expires`, eskaliert non-blocking ab einer definierten Restfrist (60 Tage) |

**Warum kein Jan-Gate:** Rein additive CI-Ergänzung, kein Secret, kein Blocking-Verhalten.

---

## 2 — `security.txt`/RFC-9116 in Subkategorien: Neubewertung (2026-09-12, Baseline für diese Runde)

|  #  | Subkategorie                                                     | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                 |
| :-: | ---------------------------------------------------------------- | :---------------: | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | `Contact`-Feld                                                   |     Top 10 %      |   🟢   | GitHub-Security-Advisories-Link — bewusste Wahl gegen exponierte private E-Mail                                                                            |
|  2  | `Expires`-Feld vorhanden und Pflicht-konform                     |     Top 10 %      |   🟢   | RFC-9116-Pflichtfeld erfüllt, aktuell nicht abgelaufen                                                                                                     |
|  3  | `Preferred-Languages`                                            |     Top 10 %      |   🟢   | `de, en`                                                                                                                                                   |
|  4  | `Canonical`-Zeile                                                |     Top 10 %      |   🟢   | Vorhanden, verweist auf exakte Datei-URL — RFC-9116-Empfehlung erfüllt                                                                                     |
|  5  | Middleware-Ausschluss (öffentlich erreichbar ohne Auth-Redirect) |     Top 10 %      |   🟢   | `src/proxy.ts:70` + automatisierter Test bestätigt öffentliche Erreichbarkeit                                                                              |
|  6  | **`Expires`-Ablauf-Reminder-Automatisierung**                    |     Top 40 %      |   🟠   | Kein CI-Check, keine automatisierte Erinnerung — einzige unadressierte Lücke, bereits im Archiv benannt                                                    |
|  7  | `Encryption`-Feld (PGP-Key)                                      |     Top 60 %      |   🟡   | Fehlt — bewusst K5, kein PGP-Key vorhanden                                                                                                                 |
|  8  | `Acknowledgments`-Feld (Hall-of-Fame)                            |     Top 60 %      |   🟡   | Fehlt — bewusst K5, keine Hall-of-Fame-Seite existiert                                                                                                     |
|  9  | `Policy`-Feld (Disclosure-Policy-Link)                           |     Top 60 %      |   🟡   | Fehlt — bewusst K5, keine formale Policy-Seite existiert                                                                                                   |
| 10  | Content-Type-Korrektheit (`text/plain; charset=utf-8`)           |     Top 30 %      |   🟡   | Nicht live verifizierbar in dieser read-only Session (kein `curl`-Zugriff) — plausibel korrekt via Next.js-Default für `public/`-Dateien, aber unbestätigt |

**Rechnerischer Schnitt (Baseline dieser Runde):** (10+10+10+10+10+40+60+60+60+30)/10 = **Top 30 %** — dominiert von den drei bewusst K5-gehaltenen optionalen Feldern (#7-#9), die strukturell hoch gewichtet in den flachen 10er-Schnitt eingehen, obwohl keines davon RFC-Pflicht ist.

---

## 3 — Verifizierter Ist-Stand (casino-code-explorer-Recherche, 2026-09-12)

**`public/.well-known/security.txt`:** `Contact` (Zeile 1), `Expires: 2027-08-28T00:00:00.000Z` (Zeile 2), `Preferred-Languages: de, en` (Zeile 3), `Canonical: https://casino-xi-six.vercel.app/.well-known/security.txt` (Zeile 4). Inhaltlich identisch zum Archiv-Stand vom 2026-09-06 — kein Delta.

**`src/proxy.ts:70`:** `'/.well-known/(.*)'` in `PUBLIC_ROUTES`, zusätzlich automatisiert getestet in `src/lib/security/__tests__/proxy-routing.test.ts:72-74` (`isPublicRoute('/.well-known/security.txt') === true`).

**Kein CI-Reminder gefunden:** 0 Treffer in `.github/workflows/*` für `Expires`/`expir`/`reminder` — kein Mechanismus analog zum Secret-Rotation-Fälligkeits-Tracking (Säule 8, `check-secret-rotation-due.ts`).

**Content-Type nicht live verifizierbar** — kein `vercel.json`, keine `next.config`-Header-Regel für `.well-known/*` gefunden; Next.js liefert statische Dateien aus `public/` standardmäßig mit korrektem MIME-Type basierend auf der Dateiendung, aber `.security.txt` hat keine Standard-Endung — beim Ausführen per echtem `curl` gegen eine laufende Instanz verifizieren.

---

## 4 — Meilensteine

### L1 — Automatisierter `Expires`-Reminder vor Ablauf

- **Ziel:** Die in §2 #6 benannte Lücke schließen — verhindern, dass die Datei unbemerkt abläuft.
- **Schritte:**
  1. Neuer, nicht-blockierender Schritt in einem bereits regelmäßig laufenden, `schedule`-getriggerten Workflow (Muster: `migration-drift-check.yml` oder der in Säule 8/L4 ergänzte `check-secret-rotation`-Schritt in `security-staging.yml`) — parst das `Expires`-Datum aus `public/.well-known/security.txt`, berechnet die verbleibende Zeit, schreibt sie lesbar in `$GITHUB_STEP_SUMMARY`.
  2. Eskalationsmarkierung ab einer definierten Restfrist (Vorschlag: 60 Tage vor Ablauf — genug Vorlauf für Jan, um ein neues Ablaufdatum zu setzen, ohne dass die Datei zwischenzeitlich ungültig wird).
  3. Content-Type-Live-Check optional im selben Schritt ergänzen (`curl -sI` gegen die Produktions-URL, prüft `Content-Type: text/plain`), um §2 #10 gleich mit zu schließen.
- **Verifizierung:** Ein simulierter Lauf mit einem künstlich nahe gerücktem `Expires`-Datum zeigt die Eskalationsmarkierung im Job-Summary; der reguläre Lauf mit dem echten, weit in der Zukunft liegenden Datum zeigt nur die informative Restfrist ohne Eskalation.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. Ein zukünftiger `Expires`-Ablauf wird automatisch und rechtzeitig sichtbar, nicht erst wenn die Datei bereits ungültig ist (L1).
2. Der `Content-Type`-Header der ausgelieferten Datei ist bestätigt korrekt (L1, Zusatzschritt).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur der Reminder-Mechanismus, keine neuen optionalen RFC-9116-Felder (alle drei sind K5).
- [x] Der einzige Meilenstein ist ausschließlich LLM-Zuständigkeit, kein neues Secret, kein Blocking-Verhalten.
- [x] Recherche durch `casino-code-explorer` fundiert — kein Delta zum Archiv-Stand explizit bestätigt, nicht unterschlagen.
- [x] Ehrlichkeits-Check: Der hohe Baseline-Schnitt (Top 30 %) wird transparent auf die drei bewusst zurückgestellten K5-Felder zurückgeführt, nicht auf einen echten neuen Mangel.
- [x] Money-Pfad korrekt „Nein".
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung des einzigen Meilensteins

|  #  | Subkategorie                       | Baseline | Nach Ausführung | Warum                        |
| :-: | ---------------------------------- | :------: | :-------------: | ---------------------------- |
|  1  | `Contact`                          | Top 10 % |    Top 10 %     | unverändert                  |
|  2  | `Expires` vorhanden                | Top 10 % |    Top 10 %     | unverändert                  |
|  3  | `Preferred-Languages`              | Top 10 % |    Top 10 %     | unverändert                  |
|  4  | `Canonical`                        | Top 10 % |    Top 10 %     | unverändert                  |
|  5  | Middleware-Ausschluss              | Top 10 % |    Top 10 %     | unverändert                  |
|  6  | `Expires`-Reminder-Automatisierung | Top 40 % |    Top 10 %     | L1                           |
|  7  | `Encryption`                       | Top 60 % |    Top 60 %     | **unverändert — bewusst K5** |
|  8  | `Acknowledgments`                  | Top 60 % |    Top 60 %     | **unverändert — bewusst K5** |
|  9  | `Policy`                           | Top 60 % |    Top 60 %     | **unverändert — bewusst K5** |
| 10  | Content-Type                       | Top 30 % |    Top 10 %     | L1 (Zusatzschritt)           |

**Projizierter Schnitt nach Ausführung:** (10+10+10+10+10+10+60+60+60+10)/10 = **Top 25 %**.

**Ehrliche Einordnung:** Diese Säule bleibt strukturell weit über Top 10 %, weil drei der zehn Subkategorien bewusst K5-gehalten sind (jeweils Top 60 %) — das ist keine Planungsschwäche, sondern ein methodisches Artefakt der flachen 10er-Durchschnittsbildung bei einem niedrig gewichteten (5/100), aber breit aufgefächerten Item. Absolut betrachtet ist der einzige LLM-ausführbare, echte Fund (der Reminder-Mechanismus) vollständig geschlossen. Sollte Jan künftig `Encryption`/`Acknowledgments`/`Policy` entscheiden, sinkt der Schnitt deutlich unter Top 15 %.

---

## 9 — Ausführungsergebnis (2026-09-18)

**L1 umgesetzt:** Neue reine Funktionen [`src/lib/security/security-txt-expiry.ts`](../src/lib/security/security-txt-expiry.ts) (`parseSecurityTxtExpiry`, `computeExpiryStatus`) mit vollständiger Testabdeckung ([`src/lib/security/__tests__/security-txt-expiry.test.ts`](../src/lib/security/__tests__/security-txt-expiry.test.ts), 9 Tests: Parsing, fehlendes/kaputtes `Expires`, ok/warning/expired-Grenzfälle). Neues Script [`scripts/check-security-txt-expiry.ts`](../scripts/check-security-txt-expiry.ts) (`npm run check-security-txt-expiry`) spiegelt exakt das Secret-Rotation-Muster (Säule 8, `check-secret-rotation-due.ts`): liest die lokale `public/.well-known/security.txt`, meldet die verbleibende Zeit, eskaliert (Exit-Code 1, aber `|| true` im Workflow) ab 60 Tagen Restfrist oder bei Ablauf/fehlendem Feld — niemals blockierend.

**CI-Integration:** Neuer Schritt in [`.github/workflows/security-headers-drift-check.yml`](../.github/workflows/security-headers-drift-check.yml) (bereits wöchentlich `schedule`-getriggert, Säule 5/L5) — läuft unconditional (`if: always()`), da er nur die im Repo liegende Datei liest, nicht `PRODUCTION_URL` braucht. Zusatzschritt (§2 #10, Content-Type) im bestehenden Produktions-Check ergänzt: `HEAD`-Request gegen `.../.well-known/security.txt`, prüft `content-type` beginnt mit `text/plain`, schreibt in denselben Job-Summary-Block — läuft nur, wenn `PRODUCTION_URL` konfiguriert ist (wie der bestehende Header-Check).

**Lokal verifiziert:** `npx tsx scripts/check-security-txt-expiry.ts` gegen die echte `public/.well-known/security.txt` → `✅ security.txt läuft erst in 344 Tagen ab.`, Exit-Code 0.

**Kein K5-Rest für L1.** Die drei optionalen Felder (`Encryption`/`Acknowledgments`/`Policy`) bleiben wie geplant außerhalb des Scopes.

## 8 — Verwandte Artefakte

| Bedarf                                                       | Datei                                                                                                                             |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei                            | [`docs/archive/t_security_hardening_10_security_txt_rfc9116.md`](../docs/archive/t_security_hardening_10_security_txt_rfc9116.md) |
| Die geplante Datei selbst (wird in L1 indirekt referenziert) | [`public/.well-known/security.txt`](../public/.well-known/security.txt)                                                           |
| Middleware-Ausschluss (Referenz, unverändert)                | [`src/proxy.ts`](../src/proxy.ts)                                                                                                 |
| Referenzmuster für L1 (Fälligkeits-Tracking)                 | [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md) (L4)                                                           |
| Übersicht (alle 10 Säulen)                                   | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                    |
