# 06_10 — Promo-/Bonus-Code-Abuse-Prevention: Umsetzungsplan

> **Status:** Execution-Ready · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Unterkategorie #5 aus [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md) (Top 18 %) — **letzter Plan dieser 8-teiligen Serie**, mit dem alle 10 Unterkategorien der Kategorie 06 eine eigene Planungsdatei haben. Alle Zuständigkeiten liegen beim LLM; kein Meilenstein ist auf eine Jan-Entscheidung während der Ausführung angewiesen. Diese Datei ist so geschrieben, dass eine komplett neue, kontextlose LLM-Konversation sie ohne Rückfragen ausführen kann.
> **Quellcode-Basis:** Alle Befunde unten wurden am 2026-09-05 durch einen read-only `casino-code-explorer`-Lauf verifiziert.
> **Wichtigster Fund, der NICHT hier behandelt wird:** Ein bestätigter Echtzeit-Gap (viele Accounts lösen denselben gültigen Code über eine gemeinsame IP ein, ohne dass irgendetwas das in Echtzeit stoppt) ist bereits vollständig durch `06_3` L1 abgedeckt — siehe Abschnitt 3.

## 0 — Kontext für die ausführende Session

`promo-guess-guard.ts` (aus `06_1`) zählt nur **fehlgeschlagene** Einlösungsversuche — ein gültiger Code, der von 50 verschiedenen Accounts erfolgreich eingelöst wird, berührt diesen Zähler nie. Die Multi-Account-Cluster-Erkennung (`detect_multi_account_clusters`) ist rein pull-basiert über das Admin-Dashboard, kein Echtzeit-Check beim Einlösen selbst. **Das ist bereits als L1 in `06_3_multi_account_abuse_prevention_plan.md` geplant** (Realtime-Cluster-Check vor Bonus-Vergabe) — dieser Plan hier dupliziert das nicht, sondern behandelt die verbleibenden, davon unabhängigen Lücken.

## 1 — Segmentierung: 10 Sub-Unterkategorien

| #   | Sub-Unterkategorie                      | Niveau          | Status quo (verifiziert)                                                                                                                                                                                                                                                                                                                   | Beleg                                                                                                                                          |
| :-- | :-------------------------------------- | :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Normalisierungs-Konsistenz (Case/Trim)  | **Top 10 %** 🟢 | Redeem- und Admin-Create-Route nutzen identisch `UPPER(TRIM(code))` — client- und serverseitig doppelt konsistent, kein Silent-Mismatch-Risiko.                                                                                                                                                                                            | `redeem-code/route.ts:26,120`, `023_promo_redemption_ledger.sql:49`, `admin/promo-codes/route.ts:28,129`                                       |
| P2  | Idempotency-Key-Erzwingung              | **Top 12 %** 🟡 | UUID-Idempotency-Key serverseitig erzwungen, verhindert Doppel-Einlösung bei Netzwerk-Retries.                                                                                                                                                                                                                                             | `redeem-code/route.ts:39-42,101-108`                                                                                                           |
| P3  | 8-Zeichen-Entropie-Gate (06_1 executed) | **Top 15 %** 🟡 | Neue Codes brauchen min. 8 Zeichen, getestet (`admin-promo-create-route.test.ts:52-83`). Bestehende kürzere Codes bewusst unangetastet.                                                                                                                                                                                                    | `admin/promo-codes/route.ts:28`, `admin-promo-create-route.test.ts:52-83`                                                                      |
| P4  | Promo-Guess-Guard (06_1 executed)       | **Top 18 %** 🟡 | Zählt fehlgeschlagene Einlösungsversuche pro Code, `voucher_velocity`-Signal bei Schwellwert.                                                                                                                                                                                                                                              | `promo-guess-guard.ts` (Aufruf in `redeem-code/route.ts:135`)                                                                                  |
| P7  | Klartext-Code-Logging                   | **Top 40 %** 🟠 | Roh-Code wird in `CasinoLogger.info()`-Aufrufen im Klartext geloggt (Redeem- und Admin-Create-Route) sowie bewusst in Risk-Event-Evidence. Niedrige Sensitivität (Bonus-Voucher, kein Credential), aber echter Logging-Hygiene-Fund.                                                                                                       | `redeem-code/route.ts:166-170`, `admin/promo-codes/route.ts:156-159`, `promo-guess-guard.ts:74`                                                |
| P5  | Admin-Sichtbarkeit nur Rohtabelle       | **Top 45 %** 🟠 | `PromoCodesClient.tsx` zeigt nur `code/amount/max_uses/used_count/expires_at/active` als flache Tabelle — keine Redemption-Velocity, kein Zeitverlauf, kein aggregierter Gesamtwert.                                                                                                                                                       | `PromoCodesClient.tsx:257-339`                                                                                                                 |
| P8  | Kein proaktiver Expiry-Job              | **Top 50 %** 🟠 | `expires_at` wird nur reaktiv bei Einlösung geprüft — ein abgelaufener Code bleibt `active=true` mit veraltetem `used_count`, bis jemand ihn erneut versucht. Kein Cron-Job deaktiviert ihn proaktiv.                                                                                                                                      | `023_promo_redemption_ledger.sql:79-81`, kein Cron-/Trigger.dev-Treffer für Promo-Expiry                                                       |
| P9  | Keine Bulk-Code-Generierung             | **Top 55 %** 🟠 | Nur Einzel-Code-Erstellung über ein Formular — kein CSV-Import, kein Batch-Endpunkt. Betrifft eher Admin-Ergonomie als Sicherheit, aber bei vielen Codes fehleranfällig (copy-paste).                                                                                                                                                      | `admin/promo-codes/route.ts:22-33` (nur `createSchema` für 1 Code), `PromoCodesClient.tsx:52`                                                  |
| P6  | Kein Reversal-/Refund-Mechanismus       | **Top 70 %** 🔴 | Kein `reversePromoCode`/`clawback` irgendwo in `WalletService` — wird ein Bonus nachträglich als betrügerisch erkannt (z. B. via `06_3`-Multi-Account-Cluster), gibt es **keinen** Service-Layer-Weg, ihn zurückzubuchen; nur eine manuelle, unauditierte DB-Korrektur außerhalb jedes etablierten Pfads.                                  | Grep `reversePromo\|refundPromo\|clawback` in `src/lib/casino/` — 0 Treffer, `wallet.ts:367-443` (nur `redeemPromoCode`, keine Umkehrfunktion) |
| P10 | Viele-Accounts-ein-Code-Echtzeit-Lücke  | **Top 80 %** 🔴 | Bestätigt: `promo-guess-guard` zählt nur Fehlschläge, Multi-Account-Detection ist rein Pull/Batch — 50 Accounts auf einer IP können denselben gültigen Code ungehindert in Echtzeit einlösen (nur generisches 10/60s-Rate-Limit greift). **Bereits vollständig als `06_3` L1 geplant, hier kein eigener Meilenstein** (siehe Abschnitt 3). | `promo-guess-guard.ts` (nur `if (!outcome.ok)`-Zweig), `fraud-detection.ts:112-114`, `admin/fraud/route.ts:46`                                 |

**Marker-Konvention:** identisch zu `06_rate_limiting_abuse_prevention.md`.

**Rechnerischer Schnitt über alle 10 Positionen:** (10+12+15+18+70+80+40+50+55+45)/10 = **Top 39,5 %** (gerundet Top 40 %) — schlechter als der Top-18-%-Bestwert. Größte Einzellücke (P10) ist bereits durch `06_3` adressiert; die zweitgrößte (P6, fehlender Reversal-Mechanismus) ist neu und unabhängig.

## 2 — Übersicht für Jan

| Nummer | Meilenstein                                           | Status     | Nächster Schritt                                 | Zuständigkeit |
| ------ | ----------------------------------------------------- | ---------- | ------------------------------------------------ | ------------- |
| L0     | Reversal-/Refund-Mechanismus (P6, höchste Priorität)  | 🔴 Geplant | Neue `WalletService`-Funktion + Admin-Aktion     | LLM           |
| L1     | Proaktiver Expiry-Job (P8)                            | 🔴 Geplant | `pg_cron`-Job deaktiviert abgelaufene Codes      | LLM           |
| L2     | Admin-Redemption-Analytics (P5)                       | 🔴 Geplant | Velocity-/Aggregat-Ansicht in `PromoCodesClient` | LLM           |
| L3     | Klartext-Code-Logging reduzieren (P7)                 | 🔴 Geplant | Letzte 4 Zeichen maskieren in Logs               | LLM           |
| L4     | Dedizierte Redeem-Route-Tests (Testlücke aus Punkt 6) | 🔴 Geplant | Max-Uses/Expiry/Race-Tests ergänzen              | LLM           |
| L5     | Testabdeckung + Doku-Nachzug (Abschluss)              | 🔴 Geplant | Vollsuite grün, Kategorie-06-Datei aktualisieren | LLM           |

Ampel: 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. **P1–P4 haben keinen eigenen Meilenstein** — bereits solide. **P9 (Bulk-Generierung) hat keinen Bau-Meilenstein** — YAGNI-Kandidat, siehe Q2 unten. **P10 hat keinen Meilenstein hier** — vollständig durch `06_3` L1 abgedeckt.

## 3 — Abgrenzung zu verwandten Plänen

- **`06_3` (Multi-Account, execution-ready):** L1 dort („Realtime-Cluster-Check vor Bonus-Vergabe") deckt P10 vollständig ab — **dieser Fund hier bestätigt und verschärft die Dringlichkeit von `06_3` L1 unabhängig**, da er von der Promo-Code-Seite aus dieselbe Lücke bestätigt, die `06_3` von der Multi-Account-Seite aus fand. Keine Dopplung, nur gegenseitige Bestätigung.
- **`06_9` (Admin Fraud Detection, execution-ready):** L0 dort (Telegram-Alert-Verdrahtung) würde auch für einen zukünftigen `balance_correction`-artigen Reversal-Vorgang aus L0 hier relevant — falls L0 hier einen Risk-Event bei jeder Rückbuchung erzeugt, profitiert das automatisch von der dort geplanten Alarmierung, sobald beide ausgeführt sind.
- **`06_1` (Bot-Detection, executed):** Ursprung von `promo-guess-guard.ts` und dem 8-Zeichen-Gate — dieser Plan ändert deren Code nicht, nur die hier neu gefundenen, unabhängigen Lücken.

## 4 — Meilensteine im Detail

### L0 — Reversal-/Refund-Mechanismus (P6, höchste Priorität)

**Ziel:** Ein nachträglich als betrügerisch erkannter Promo-Bonus kann sauber, auditierbar und über den etablierten Service-Layer zurückgebucht werden.
**Scope:** Neue Funktion `WalletService.reversePromoCode(userId, code, adminId, reason)` — analog zum bestehenden `redeemPromoCode()`-Muster (RPC unter Row-Lock), bucht den ursprünglich gewährten Betrag zurück (kann bei bereits verspieltem Guthaben zu negativem Saldo führen — **bewusste Design-Entscheidung, siehe Q1 unten**, nicht stillschweigend verhindert), erzeugt einen `wallet_transactions`-Eintrag vom Typ `'promo_reversal'` (neuer Typ, additive Migration) und einen `balance_correction`-Risk-Event (schließt damit gleichzeitig einen Teil der in `06_9` L1 offenen Frage nach dem Producer dieses Signaltyps — **Ausführungsreihenfolge-Hinweis: `06_9` L1 vor diesem Meilenstein ausführen**, damit die Entscheidung dort nicht doppelt getroffen wird). Neue Admin-Route `POST /api/admin/promo-codes/[code]/reverse` (Body: `{userId, reason}`), gleiches Auth/Rate-Limit-Muster wie bestehende Admin-Mutationen.
**Abhängigkeiten:** `06_9` L1 (Producer-Entscheidung für `balance_correction`, siehe Ausführungsreihenfolge-Hinweis).
**Freigabe-Gate:** `@migration-security-guard` PASS (neuer Transaktionstyp) + `security-reviewer` PASS (Geld-Pfad, neue Admin-Aktion mit Rückbuchungswirkung).
**Verifizierung:** Test bestätigt: Rückbuchung reduziert Balance korrekt (auch ins Negative, falls bereits verspielt), erzeugt `wallet_transactions`-Eintrag und Risk-Event, ist nur für Admins aufrufbar.
**Nicht-Scope:** Keine automatische Rückbuchung ohne explizite Admin-Aktion (immer Mensch-getriggert).
**Money-Pfad:** Ja · **Security-Review:** Pflicht.

### L1 — Proaktiver Expiry-Job (P8)

**Ziel:** Abgelaufene Codes werden proaktiv deaktiviert, statt nur reaktiv bei einem erneuten Einlöseversuch erkannt zu werden.
**Scope:** Neue `pg_cron`-Funktion `deactivate_expired_promo_codes()` (analog zu `purge_bet_network_fingerprints()` aus Kategorie-06-Präzedenz), täglich, setzt `active = false` für Codes mit `expires_at < now() AND active = true`. Rein aufräumend — ändert nichts an der bereits korrekten reaktiven RPC-Prüfung, die bleibt als zusätzliche Absicherung bestehen.
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** `@migration-security-guard` PASS.
**Verifizierung:** Test-Transaktion (ROLLBACK) bestätigt: abgelaufene aktive Codes werden deaktiviert, nicht-abgelaufene bleiben unangetastet.
**Nicht-Scope:** Keine Benachrichtigung an den Admin bei Deaktivierung (reine Hintergrund-Wartung).
**Money-Pfad:** Nein · **Security-Review:** Pflicht (Migration).

### L2 — Admin-Redemption-Analytics (P5)

**Ziel:** Ein Admin sieht Einlösungs-Geschwindigkeit und Gesamtwert eines Codes, nicht nur den rohen Zähler.
**Scope:** `PromoCodesClient.tsx` um eine kleine, zusätzliche Kennzahl je Code ergänzen: „X Einlösungen in den letzten 24h" (Query gegen `wallet_transactions` gefiltert auf den Code, analog zur bereits bestehenden Tages-Verlust-Query aus `06_2` L3 — gleiches Abfragemuster, andere Filterbedingung). Kein neues Chart/Zeitverlauf in dieser Ausbaustufe (YAGNI, reicht als Zahl).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Keins (reine Lese-Erweiterung).
**Verifizierung:** Kennzahl zeigt korrekte 24h-Einlösungszahl für einen Test-Code.
**Nicht-Scope:** Kein Zeitverlaufs-Chart, keine Export-Funktion.
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L3 — Klartext-Code-Logging reduzieren (P7)

**Ziel:** Promo-Codes erscheinen nicht mehr vollständig im Klartext in Logs, ohne die Fehlersuche unbrauchbar zu machen.
**Scope:** In `redeem-code/route.ts:166-170` und `admin/promo-codes/route.ts:156-159` den geloggten Code auf die letzten 4 Zeichen maskieren (z. B. `****ABCD` statt `SUMMER2024ABCD`) — ausreichend für Debugging-Korrelation (Admin kann den Code im Dashboard nachschlagen), aber kein vollständiger Klartext-Abdruck in einem Log-System mit potenziell breiterer Zugriffsberechtigung als der Promo-Code-Tabelle selbst. `promo-guess-guard.ts:74`s Risk-Event-Evidence bleibt bewusst **unverändert** (dort ist der volle Code für die Admin-Fraud-Review notwendig, engerer Zugriffskreis als allgemeine Logs).
**Abhängigkeiten:** Keine.
**Freigabe-Gate:** Keins (reine Logging-Änderung, kein neuer Datenpfad).
**Verifizierung:** Log-Ausgabe zeigt maskierten Code, Risk-Event-Evidence bleibt vollständig.
**Nicht-Scope:** Keine Änderung an Sentry-Redaction-Regeln (das ist Kategorie 05/Observability, nicht dieser Scope).
**Money-Pfad:** Nein · **Security-Review:** Nein.

### L4 — Dedizierte Redeem-Route-Tests (Testlücke)

**Ziel:** Die vier identifizierten ungetesteten Szenarien der Redemption-RPC sind durch echte Tests abgesichert, nicht nur implizit durch SQL-Logik.
**Scope:** Neue Testdatei `src/lib/security/__tests__/redeem-code-route.test.ts` (bislang keine dedizierte Route-Testdatei vorhanden): Max-Uses-Erschöpfung, abgelaufener Code (inkl. Interaktion mit L1s neuem Expiry-Job), bereits-eingelöst-Fall, simulierter Concurrent-Redemption-Race (zwei parallele Requests gegen denselben Code mit `max_uses=1`).
**Abhängigkeiten:** L1 (testet auch dessen Interaktion mit der reaktiven Prüfung).
**Freigabe-Gate:** Alle neuen Tests grün.
**Verifizierung:** `npx vitest run src/lib/security/__tests__/redeem-code-route.test.ts`.
**Nicht-Scope:** Keine Lasttest-artige Simulation vieler paralleler Nutzer (das wäre eher `06_3`/`06_4`-Scope).
**Money-Pfad:** Nein (nur Tests) · **Security-Review:** Nein.

### L5 — Testabdeckung + Doku-Nachzug (Abschluss)

**Ziel:** Vollständiger Regressionsnachweis, Kategorie-06-Datei aktualisiert — **letzter Meilenstein der gesamten 8-teiligen Planungsserie**.
**Scope:** Vollständiger `npm test`-Lauf, `npm run typecheck`, `npm run lint`. Danach: `06_rate_limiting_abuse_prevention.md` Unterkategorie #5 aktualisieren (Niveau-Neubewertung, Status von „Execution-Ready" auf „Executed"), `docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md` Zeile #5 nachziehen, `T_RATE_LIMITING_ABUSE_PREVENTION/00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md` Zeile #5 nachziehen — **damit haben alle 10 Zeilen beider Übersichtstabellen eine Planungsdatei**.
**Abhängigkeiten:** L0–L4.
**Freigabe-Gate:** Vollsuite grün, 0 TS-/Lint-Fehler.
**Verifizierung:** Testlauf-Zahlen im Ausführungsprotokoll dieser Datei dokumentieren.
**Nicht-Scope:** Keine Ausweitung auf andere Unterkategorien.
**Money-Pfad:** Nein · **Security-Review:** Nein.

## 5 — Selbstprüfung (durchgeführt 2026-09-05)

- ✅ Scope gegenüber `06_3` (P10 bereits dort abgedeckt) und `06_9` (Ausführungsreihenfolge für `balance_correction`) abgegrenzt (Abschnitt 3).
- ✅ Jeder Meilenstein hat Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung/Nicht-Scope/Money-Pfad/Security-Review.
- ✅ Alle Zuständigkeiten = LLM.
- ✅ P10 (der schwerwiegendste Einzelfund) wurde nicht dupliziert, sondern korrekt als „bereits durch `06_3` abgedeckt" markiert — verhindert doppelte Zählung/doppelte Umsetzung.
- ⚠️ **Nachträglich gefunden beim Selbst-Review:** L0 (Reversal) und `06_9` L1 (`balance_correction`-Producer) könnten beide denselben Signaltyp beanspruchen wollen — als Abhängigkeit und Ausführungsreihenfolge-Hinweis bereits in L0 vermerkt, nicht stillschweigend riskiert.
- ⚠️ **Nachträglich gefunden:** L0s Rückbuchung ins Negative (falls Guthaben bereits verspielt) ist eine echte Design-Entscheidung, keine reine Implementierungsdetail — als offene Frage Q1 zurückgegeben statt selbst entschieden.
- ✅ Kein Punkt doppelt als SOP/Kontextreferenz/Plan gepflegt.

## 6 — Offene Fragen für Jan (je 3 Antwortoptionen)

**Q1 — Soll L0 (Reversal) eine Rückbuchung ins negative Guthaben zulassen, falls der Bonus bereits verspielt wurde?**

- (a) Ja, negatives Guthaben zulassen — spiegelt ehrlich den tatsächlichen wirtschaftlichen Schaden wider, konsistent mit dem Prinzip „echte Zahlen zeigen, nicht beschönigen". _(Empfehlung)_
- (b) Nein, Rückbuchung auf minimal 0 begrenzen (Cap) — verhindert negative Zahlen in der UI, verschleiert aber den tatsächlichen Verlust.
- (c) Konfigurierbar per Admin-Entscheidung im Einzelfall (Checkbox „bis auf 0 begrenzen" bei der Rückbuchungs-Aktion).

**Q2 — Soll P9 (Bulk-Code-Generierung) als eigener Meilenstein nachgereicht werden?**

- (a) Nein — bei der aktuellen Nutzungsintensität (Play-Money-Casino, kleine Codemengen) ist Einzel-Erstellung ausreichend, kein Aufwand für ein selten benötigtes Feature. _(Empfehlung — YAGNI)_
- (b) Ja, als kleiner Folgeplan: CSV-Upload für Massen-Code-Erstellung mit serverseitiger Validierung jeder Zeile.
- (c) Ja, aber nur ein einfacher „N Codes mit demselben Präfix + Zufalls-Suffix generieren"-Button statt echtem CSV-Import — geringerer Aufwand als (b).

## 7 — Verwandte Artefakte

| Bedarf                                                                                              | Datei                                                                                                                   |
| :-------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| Vollständige Kategorie-06-Aufschlüsselung (Ursprung dieses Plans)                                   | [`06_rate_limiting_abuse_prevention.md`](06_rate_limiting_abuse_prevention.md)                                          |
| Kompakte Kategorie-Overview                                                                         | [`docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md`](../docs/rate-limiting/00_RATE_LIMITING_OVERVIEW.md)                 |
| Gewichtete Kategorie-Übersicht (dieser Ordner)                                                      | [`00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md`](00_RATE_LIMITING_ABUSE_PREVENTION_UEBERSICHT.md)                    |
| Schwester-Plan #10 (Multi-Account, execution-ready, deckt P10 bereits ab)                           | [`06_3_multi_account_abuse_prevention_plan.md`](06_3_multi_account_abuse_prevention_plan.md)                            |
| Schwester-Plan #4 (Admin Fraud Detection, execution-ready, teilt `balance_correction`-Entscheidung) | [`06_9_admin_fraud_detection_plan.md`](06_9_admin_fraud_detection_plan.md)                                              |
| Ausgeführter Plan Bot-Detection (Ursprung von `promo-guess-guard.ts`)                               | [`docs/archive/06_1_bot_automation_detection_plan.md`](../docs/archive/06_1_bot_automation_detection_plan.md)           |
| Ausgeführter Plan Responsible Gambling (Muster für L2s Query)                                       | [`docs/archive/06_2_responsible_gambling_controls_plan.md`](../docs/archive/06_2_responsible_gambling_controls_plan.md) |
| SOP Planungsdateien (Format dieses Plans)                                                           | [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md)                             |
| SOP Execution (nächster Schritt nach Freigabe)                                                      | [`xx_sop/02_workflow_jan_execution.md`](../xx_sop/02_workflow_jan_execution.md)                                         |
