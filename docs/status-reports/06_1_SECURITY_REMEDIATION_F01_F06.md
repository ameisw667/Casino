# Security Casino F-01 bis F-06 – Implementierungsplan und Ausführungsprotokoll

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` oder `superpowers:subagent-driven-development`. Schritte sind mit Checkboxen nachverfolgbar.
>
> **Scope:** ausschließlich die bestätigten Fixes F-01, F-02, F-03, F-04 und F-06 aus `worldmap/06-security-casino.md` §1.3; F-05 bleibt als bereits remote verifizierter Referenzfix enthalten. Befunde und Prüfungen bleiben in eigenen Tabellen der Roadmap.
>
> **Startstatus:** 2026-08-11 · F-01, F-02, F-03, F-04 und F-06 offen · F-05 remote verifiziert.

**Goal:** Alle bestätigten Security-Befunde aus §1.3 lokal testbar beheben, ohne Wallet- oder Seed-Autorität in den Browser zu verlagern; Remote-Änderungen bleiben als solche ausgewiesen.

**Architecture:** Browserrouten prüfen Origin vor dem Body-Parsing und leiten identitätsgebundene Schreibvorgänge ausschließlich an serverseitige Services weiter. Datenbank-Invarianten liegen in additiven `SECURITY DEFINER`-RPCs mit restriktiven Grants, row locks und eindeutigen Ledgern. Ein L1-Test beweist Quellcode und Verträge; L2 ist für PostgreSQL-Rollen, Migrationen und Parallelität zwingend.

**Tech Stack:** Next.js 16, TypeScript, Vitest, Zod 4, Supabase/PostgreSQL, SQL-Migrationen, npm audit.

## Globale Constraints

- Jede Wallet-Mutation bleibt atomar, auditierbar und ausschließlich serverseitig.
- `service_role` wird nie an Browser, Logs, Testartefakte oder Dokumentation ausgegeben.
- Eine `SECURITY DEFINER`-Funktion erhält `REVOKE ALL ... FROM PUBLIC, anon, authenticated` und ausschließlich den minimal nötigen `service_role`-Grant.
- Produktions-Origin-Policy ist fail-closed: fehlendes, ungültiges oder nicht konfiguriertes `APP_ORIGINS` ergibt HTTP 403.
- Migrationen sind additiv; Remote-Rollout erfolgt nur mit freigegebenem DDL-Zugang und wird nicht aus dem lokalen Arbeitsbaum behauptet.
- Fremde Worktree-Änderungen bleiben unverändert; vor und nach jeder Änderung sind `git status --short` und `git diff --check` auszuführen.
- Für Produktionscode gilt Red-Green: Test schreiben, erwarteten Fehlschlag sehen, Minimalfix, Test/Suite erneut ausführen.

---

## F-06 – Öffentliche Legacy-Seed-RPC sperren

**Befund / Priorität:** B-06 · 1. `public.get_or_create_user_seed(text)` ist `SECURITY DEFINER`, akzeptiert eine fremde `p_user_id` und war für `anon` sowie `authenticated` ausführbar.

**Zielzustand:** Nur der serverseitige `WalletService` über `createAdminClient()` darf die Legacy-Funktion verwenden. Browserrollen erhalten weder Execute noch eine indirekte Möglichkeit, den Seed einer anderen Person anzulegen oder zu ändern.

**Dateien und Schnittstellen:**

- Create: `supabase/migrations/022_lock_down_legacy_seed_rpc.sql`
- Create: `src/lib/casino/__tests__/security-remediation-migrations.test.ts` (F-06- und F-02-Migrationsverträge)
- Create: `scripts/verify-security-remediations-l2.sql` (rückrollbarer Rollen- und Promo-Nachweis)
- Read only: `src/lib/casino/wallet.ts`, `src/app/api/casino/seeds/route.ts`

**Abhängigkeiten:** Keine; muss vor einem weiteren Seed-Produktiv-Gate ausgerollt sein.

**Red-Green-Ausführung:**

- [ ] Einen statischen Migrationstest schreiben, der exakt diesen Vertrag verlangt:

```ts
expect(migration).toContain(
  'REVOKE ALL ON FUNCTION public.get_or_create_user_seed(TEXT) FROM PUBLIC, anon, authenticated;',
);
expect(migration).toContain(
  'GRANT EXECUTE ON FUNCTION public.get_or_create_user_seed(TEXT) TO service_role;',
);
```

- [ ] `npm test -- src/lib/casino/__tests__/security-remediation-migrations.test.ts` ausführen; der Test muss vor dem Erstellen der Migration wegen der fehlenden Klauseln fehlschlagen.
- [ ] Migration erstellen:

```sql
REVOKE ALL ON FUNCTION public.get_or_create_user_seed(TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_seed(TEXT) TO service_role;
```

- [ ] Den Test und die Seed-Suite erneut ausführen; der Test muss grün sein.
- [ ] Im zugelassenen Supabase SQL Editor Migration 022 anwenden und in `scripts/verify-security-remediations-l2.sql` Block A ausschließlich Grant-Metadaten prüfen:

```sql
SELECT
  NOT has_function_privilege('anon', 'public.get_or_create_user_seed(text)', 'EXECUTE') AS anon_blocked,
  NOT has_function_privilege('authenticated', 'public.get_or_create_user_seed(text)', 'EXECUTE') AS authenticated_blocked,
  has_function_privilege('service_role', 'public.get_or_create_user_seed(text)', 'EXECUTE') AS service_role_allowed;
```

**Fehlerbehandlung:**

| Ereignis                                   | Behandlung                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Migration trifft auf fehlende Funktion     | Rollout stoppen; Signatur über `pg_proc` prüfen. Kein unspezifisches `REVOKE` ergänzen.     |
| Service-Route liefert nach dem Rollout 5xx | Den Server-Client und die Funktionssignatur prüfen; Browser-Grant niemals wiederherstellen. |
| Keine Remote-DDL-Autorität                 | L1 als lokal umgesetzt dokumentieren; F-06 bleibt gelb bis der L2-Grant-Check vorliegt.     |

**Abnahme:** L1-Migrationstest grün; L2 meldet `anon_blocked = true`, `authenticated_blocked = true`, `service_role_allowed = true`; keine Seedwerte werden ausgegeben.

---

## F-01 – Guthaben-Reset aus dem Lesezugriff entfernen

**Befund / Priorität:** B-01 · 2. `WalletService.getWallet()` schreibt bei `balance <= 0` 10.000 zurück und macht damit einen GET-Read zur Guthabenmutation.

**Zielzustand:** `getWallet()` provisioniert einen noch nicht vorhandenen Nutzer einmalig via idempotentem Insert und gibt einen vorhandenen Nullsaldo unverändert zurück. Es findet im Read-Pfad kein `UPDATE users` statt.

**Dateien und Schnittstellen:**

- Modify: `src/lib/casino/wallet.ts`
- Modify: `src/lib/casino/__tests__/wallet.test.ts`
- Read only: `supabase/migrations/008_supabase_auth_bridge.sql`, `supabase/migrations/012_welcome_bonus.sql`, `src/app/api/user/balance/route.ts`

**Abhängigkeiten:** Keine. F-02 soll danach erfolgen, damit die Promo-RPC nicht implizit einen Nullsaldo-Reset verdeckt.

**Red-Green-Ausführung:**

- [ ] Test schreiben: Ein vorhandener Nutzer mit `balance: 0` liefert Snapshot-Balance `0` und löst keinen `update`-Aufruf aus. Der Test schützt vor der Produktionänderung „`if (currentBalance <= 0)` wieder einführen“.
- [ ] `npm test -- src/lib/casino/__tests__/wallet.test.ts` ausführen; der neue Test muss mit einer erwarteten `update`-Beobachtung fehlschlagen.
- [ ] Nur diesen Block aus `getWallet()` entfernen:

```ts
let currentBalance = Number(user.balance);
if (currentBalance <= 0) {
  currentBalance = 10000.0;
  await supabase.from('users').update({ balance: 10000.0 }).eq('id', userId);
}
```

und `balance: Number(user.balance)` direkt an `walletSnapshotSchema.parse()` geben.

- [ ] Den Wallet-Test erneut ausführen; anschließend alle Service-Tests starten.
- [ ] Für L2 einen nichtproduktiven Nutzer mit `balance = 0` anlegen, drei `GET /api/user/balance` ausführen und prüfen, dass der Wert und die Anzahl der Wallet-Transaktionen unverändert bleiben. Testdaten danach entfernen oder in einer Transaktion zurückrollen.

**Fehlerbehandlung:**

| Ereignis                              | Behandlung                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Neuer Auth-Nutzer erhält nicht 10.000 | Den Auth-Trigger/DB-Default als Provisionierungsursache prüfen; keinen Read-Reset zurückbringen.         |
| Bestehende negative Balance entdeckt  | Kein automatischer Ausgleich. Betroffenen Ledger prüfen und einen separaten Incident mit Owner eröffnen. |
| Upsert-Provisionierung schlägt fehl   | Route bleibt mit 503 fail-closed; keine lokale Ersatzbalance.                                            |

**Abnahme:** Ein Nullsaldo bleibt bei wiederholten Reads null; ein fehlender Nutzer wird genau einmal per `ON CONFLICT DO NOTHING` provisioniert; L2 bestätigt keine Read-Mutation.

---

## F-02 – Promo-Codes validieren, Ledger atomar und einmalig machen

**Befund / Priorität:** B-02 · 3. Die aktuelle RPC validiert Code, Ablauf und globales Limit, hat jedoch kein eindeutiges Ledger pro Nutzer und Code; ein zweiter erfolgreicher Redeem desselben Nutzers kann erneut gutschreiben.

**Zielzustand:** Eine gültige Redemption erzeugt in einer Transaktion genau einen `promo_code_redemptions`-Eintrag, genau eine Wallet-Transaktion und genau einen `used_count`-Anstieg. Derselbe Nutzer erhält denselben Code danach nie erneut gutgeschrieben.

**Dateien und Schnittstellen:**

- Create: `supabase/migrations/023_promo_redemption_ledger.sql`
- Create: `src/lib/casino/__tests__/security-remediation-migrations.test.ts` (gemeinsamer, statischer SQL-Vertrag)
- Modify: `src/lib/casino/wallet.ts`
- Modify: `src/app/api/casino/redeem-code/route.ts`
- Modify: `src/store/useCasinoStore.ts` (pro Redeem genau einen `crypto.randomUUID()`-Header erzeugen)
- Modify: `src/lib/casino/__tests__/wallet.test.ts`
- Modify: `src/store/__tests__/useCasinoStore.test.ts`

**Contract:** `redeem_promo_code(p_user_id TEXT, p_code TEXT, p_request_id UUID) -> JSONB`; die Route akzeptiert einen UUID-`Idempotency-Key` und lehnt fehlende/ungültige Keys mit 400 ab. Der Ledger trägt `user_id`, `code`, `request_id`, `amount`, `transaction_id`, `created_at`; `UNIQUE(user_id, code)` und `UNIQUE(user_id, request_id)` verhindern beide Wiederholungsformen.

**Abhängigkeiten:** F-01 empfohlen. Vor Migration 023 muss die Remote-Instanz `021_promo_codes.sql` (Katalog `promo_codes`) enthalten; zusätzlich setzt sie `wallet_transactions` voraus. Der SQL-Editor-Fehler `42P01` vom 2026-08-11 hat bestätigt, dass diese Voraussetzung remote noch fehlt.

**Red-Green-Ausführung:**

- [ ] Test schreiben, der in Migration 023 `CREATE TABLE public.promo_code_redemptions`, beide Unique-Constraints, `FOR UPDATE`, atomare Ledger- und Wallet-Insertions sowie die `service_role`-only-ACL verlangt.
- [ ] Test ausführen und erwarteten Rotzustand dokumentieren.
- [ ] Migration erstellen: Nach Code- und User-Lock zuerst nach `(user_id, request_id)` suchen und bei Replay die gespeicherte Antwort zurückgeben; dann nach `(user_id, code)` suchen und `PROMO_ALREADY_REDEEMED` zurückgeben; erst danach `used_count`, Nutzerbalance, Wallet-Audit und Ledger in derselben Transaktion schreiben.
- [ ] Service-Test zuerst für den erweiterten RPC-Contract schreiben und anschließend `WalletService.redeemPromoCode` auf `p_request_id` umstellen. Die Antwort mit `replayed` Zod-validieren.
- [ ] Route-Test schreiben: kein/ungültiger `Idempotency-Key` ergibt 400, ein gültiger Key wird als `requestId` an den Service übergeben, `PROMO_ALREADY_REDEEMED` wird ohne Betrag als 400 ausgegeben.
- [ ] Tests grün ausführen, danach die vollständige Casino- und Security-Suite.
- [ ] L2: Zuerst `scripts/verify-security-remediations-l2.sql` Block B als rückrollbaren Vertragsnachweis ausführen. Danach mit einem Testcode 20 parallele identische Requests mit derselben User-ID und unterschiedlichen UUIDs ausführen. Erwartung: ein Ledger, eine Wallet-Transaktion, ein `used_count`-Anstieg, eine erfolgreiche Antwort und 19 `PROMO_ALREADY_REDEEMED`; ein Retry mit derselben UUID ist `replayed: true` ohne weitere Mutation. Danach Testcode und Testnutzer zurückrollen.

**Fehlerbehandlung:**

| Ereignis                               | Behandlung                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Bestehende Doppelredemptions           | Keine Datenbereinigung in der Migration. Abweichung als Ledger-Incident exportieren und mit Buchhaltung abstimmen. |
| Unique-Verletzung unter Parallelität   | In der RPC als erwarteten Replay-/Already-Redeemed-Pfad behandeln; keine zweite Wallet-Transaktion erzeugen.       |
| Request-ID kollidiert mit anderem Code | `UNIQUE(user_id, request_id)` liefert `PROMO_REQUEST_CONFLICT`; Route meldet 409 und schreibt nichts.              |
| Remote-Migration nicht ausgerollt      | Route liefert fail-closed 503 über RPC-Fehler; der alte Read-Modify-Write-Pfad wird nicht reaktiviert.             |

**Abnahme:** Zufallscode mutiert nie; derselbe Code wird pro Nutzer höchstens einmal gutgeschrieben; Retry ist stabil; L2 belegt die vier Zähler-Invarianten.

---

## F-03 – Einheitliches Origin-/CSRF-Gate für Browsermutationen

**Befund / Priorität:** B-03 · 4. Aktive Mutationsrouten `POST /api/casino/seeds`, `POST /api/chat`, `POST /api/user/stats` und die als Browserroute verwendete Chat-Integration rufen den Origin-Guard nicht selbst auf.

**Zielzustand:** Jede aktive Browsermutation validiert vor Authentisierung, Rate Limit und `request.json()` eine identische Origin-Policy. Deaktivierte 410-Routen bleiben bewusst ohne Gate; der Clerk-Webhook bleibt 410.

**Dateien und Schnittstellen:**

- Modify: `src/app/api/casino/seeds/route.ts`
- Modify: `src/app/api/chat/route.ts`
- Modify: `src/app/api/user/stats/route.ts`
- Modify: `src/lib/security/__tests__/request-security.test.ts`
- Create: `src/lib/security/__tests__/mutation-origin-inventory.test.ts`
- Read only: bereits gegatete Routen `bet`, `blackjack`, `redeem-code`, `admin/users`, `admin/promo-codes`, `chat/bot-response`

**Abhängigkeiten:** Keine.

**Red-Green-Ausführung:**

- [ ] Parametrisierten Inventory-Test schreiben, der alle neun aktiven Browsermutationen auflistet und für die drei fehlenden Routen den Import und Aufruf `validateMutationOrigin(request)` vor dem ersten `try` bzw. Body-Parse verlangt. Die drei 410-Routen (`session-sync`, `migrate-session`, Clerk-Webhook) sind keine aktiven Mutation.
- [ ] Unit-Test für `validateMutationOrigin()` ergänzen: fehlender Origin, beschädigter Origin, Cross-Origin und leeres `APP_ORIGINS` in Produktion ergeben 403; nur ein exakter konfigurierter Origin ergibt `null`.
- [ ] Die Tests ausführen und den Rotzustand nur für die ungegateten Routen bestätigen.
- [ ] In jede aktive fehlende Route unmittelbar am POST-Beginn einsetzen:

```ts
const originFailure = validateMutationOrigin(request);
if (originFailure) return originFailure;
```

sowie den vorhandenen Import erweitern.

- [ ] Tests grün ausführen; danach ein Route-Test je betroffener Route mit Cross-Origin-Request, der 403 vor jeder Service-Mock-Interaktion beweist.
- [ ] L2: In Staging mit realer Session einen erlaubten Origin und einen fremden Origin gegen jede aktive Browsermutation testen; nur Status und keine personenbezogenen Bodies protokollieren.

**Fehlerbehandlung:**

| Ereignis                              | Behandlung                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Lokale Entwicklung ohne `APP_ORIGINS` | Nur außerhalb Produktion ist der Request-Origin erlaubt; Tests setzen `NODE_ENV` und ENV explizit zurück.            |
| Neue Mutation wird eingeführt         | Inventory-Test erweitern, bevor die Route gemergt wird.                                                              |
| Webhook benötigt fremden Origin       | Nur eine valide Signatur- und Replay-Prüfung darf eine Ausnahme begründen; die 410-Clerk-Route wird nicht erweitert. |
| Reverse Proxy verändert Host          | `APP_ORIGINS` auf die kanonische öffentliche Origin setzen; keine Host-Header-Relaxation programmieren.              |

**Abnahme:** Vollständiger Inventory-Test; Cross-/No-Origin 403 auf jeder aktiven Browsermutation; erlaubte Origin bleibt funktionsfähig; keine Security-Annahme hängt nur am Proxy.

---

## F-04 – High-Severity-Produktionsabhängigkeiten aktualisieren oder triagieren

**Befund / Priorität:** B-04 · 5. Der Phase-0-Lauf dokumentierte vier High-Advisories. Die frische, reproduzierbare Prüfung vom 2026-08-11 ist maßgeblich für die aktuelle Graph-Bewertung.

**Dateien und Schnittstellen:**

- Modify only if audit requires it: `package.json`, `package-lock.json`, die durch den Upgrade betroffenen Tests/Konfigurationen
- Modify: dieses Protokoll und `worldmap/06-security-casino.md` nach frischer Evidenz

**Abhängigkeiten:** Keine.

**Ausführung:**

- [ ] `npm audit --omit=dev --json` ausführen und nur `high`/`critical` sowie `via`-Ketten bewerten.
- [ ] Bei Advisories eine direkte, semver-kompatible Fixversion bestimmen, Upgrade isoliert anwenden und `npm audit --omit=dev --json`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` ausführen.
- [ ] Wenn kein Patch existiert, Advisory-ID, Pfad, Owner, kompensierende Kontrolle und Ablaufdatum dokumentieren; ohne diese Daten bleibt F-04 offen.
- [ ] Bei null High/Critical keine Dependency-Datei künstlich verändern; der frische Audit-Output ist die L1-Abnahme.

**Fehlerbehandlung:**

| Ereignis                            | Behandlung                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| npm Registry nicht erreichbar       | Status X mit Zeit und Fehlertext; kein „keine Advisories“-Claim.                                |
| Major-Upgrade nötig                 | Einen separaten Upgrade-Fix mit Kompatibilitätsmatrix öffnen; nicht im Security-Fix verstecken. |
| Test/Build nach Upgrade fehlschlägt | Upgrade zurücknehmen, Root Cause analysieren und erst nach isoliertem Repro erneut versuchen.   |

**Abnahme:** Frischer Audit zeigt null untriagierte High/Critical oder jede Ausnahme besitzt Owner, Datum und Kontrolle; vollständige Qualitätssuite belegt die Upgrade-Kompatibilität, falls es ein Upgrade gab.

---

## F-05 – `pgcrypto` als Seed-Ketten-Voraussetzung

**Befund / Status:** B-05 · remote verifiziert.

**Referenzartefakte:** `supabase/migrations/021_require_pgcrypto_for_seed_chain.sql`, `src/lib/casino/__tests__/pgcrypto-seed-migration.test.ts`, Phase-0-Protokoll §8 P0.5.

**Erhaltungsprüfung:** Die neue F-06-Migration darf weder die service-role-only-Grants für `consume_active_seed`/`rotate_user_seed` noch die qualifizierten `extensions.gen_random_bytes`/`extensions.digest`-Aufrufe verändern. Remote-Regression: `required_pgcrypto_installed = true`, erster Seed-Konsum nicht replayed, identischer Request replayed und gleiche Nonce.

---

## Plan-Selbstprüfung vor Execution

| Prüffrage                                                                                     | Ergebnis                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sind Befunde, Prüfungen und Fixes getrennt?                                                   | Ja: Scope begrenzt sich auf §1.3, Quellbefunde bleiben in §1.2, P0/P1/P2 bleiben unverändert.                                                                             |
| Hat jeder offene Fix Ziel, Dateien, Abhängigkeiten, Red-Green, Fehlerpfade und L1/L2-Abnahme? | Ja: F-06, F-01, F-02, F-03 und F-04 enthalten diese sechs Elemente.                                                                                                       |
| Ist die Reihenfolge sicher?                                                                   | Ja: F-06 sperrt zuerst die Seed-RPC; F-01 entfernt die Read-Mutation; F-02 baut danach das Promo-Ledger; F-03 und F-04 sind unabhängig.                                   |
| Werden Remote- und lokale Evidenz vermischt?                                                  | Nein: SQL-Rollen, Migration und Parallelität sind ausdrücklich L2; lokales Testen ist L1.                                                                                 |
| Erzeugt der Plan neue Browser-Wallet-Autorität oder Secret-Ausgabe?                           | Nein: alle Geld- und Seed-RPCs verbleiben service-role-only; Prüfung fragt nur Grant-Metadaten ab.                                                                        |
| Gibt es uneindeutige Replay-Semantik?                                                         | Nein: identische `(user_id, request_id)` liefert gespeicherte Antwort; anderer Key für bereits eingelösten Code ergibt `PROMO_ALREADY_REDEEMED`; Key-Konflikt ergibt 409. |

**Nachgeschärfte Ergänzungen:** Der Plan ergänzt gegenüber der Kurzübersicht die Request-ID-Idempotenz, `UNIQUE(user_id, request_id)`, Konfliktstatus 409, die Erhaltung von F-05 und eine explizite L2-Parallelinvariante.

## Execution-Protokoll

| Fix  | Status                                                | Evidenz                                                                                 | Ausführung / verbleibendes Gate                                                                                                                                                                                                                                                                                                                                          |
| ---- | ----------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F-06 | 🟢 Remote verifiziert                                 | Red: fehlender Grant-Vertrag; Green: Migrationstest grün                                | Migration 022 wurde am 2026-08-11 im SQL Editor erfolgreich ausgeführt. Der L2-Grant-Query meldete `anon_blocked`, `authenticated_blocked` und `service_role_allowed` jeweils `true`.                                                                                                                                                                                    |
| F-01 | 🟡 L1 umgesetzt                                       | Red: Nullsaldo wurde 10.000; Green: Nullsaldo ohne `update()`                           | `getWallet()` ist nach idempotenter Provisionierung lesend. L2-Dreifachread gegen einen echten Nullsaldo fehlt.                                                                                                                                                                                                                                                          |
| F-02 | 🟡 Remote ausgerollt, L2 teilweise verifiziert        | Red: kein Request-ID-Parameter/kein Ledger; Green: RPC-, Ledger- und Store-Vertrag grün | Der fehlende Promo-Katalog (021) sowie Ledger und idempotente RPC (023) wurden am 2026-08-11 im SQL Editor erfolgreich ausgeführt. Vertrags- und Rechteprüfung meldeten alle Invarianten `true`; nur die 20er-Parallelprobe steht noch aus.                                                                                                                              |
| F-03 | 🟡 L1 umgesetzt, lokale Runtime teilweise verifiziert | Red: drei Routen ohne Guard; Green: 9/9 aktive Browsermutationen im Inventory           | `seeds`, `chat` und `user/stats` validieren den Origin vor Auth und Body-Parse. Am 2026-08-12 ergaben drei fremde Origin-POSTs gegen die lokale Dev-Instanz jeweils 403; die erlaubte lokale Origin erreichte bei `seeds` und `user/stats` die Payload-Validierung (400). Für `chat` fehlt ohne echte Session der erlaubte-Origin-Pfad; die Staging-Matrix bleibt offen. |
| F-04 | 🟢 L1 verifiziert                                     | gezieltes Next.js-Upgrade, frischer Production-Audit                                    | Next.js und `eslint-config-next` wurden auf 16.3.0 aktualisiert; das neue Lockfile löst `postcss`, `sharp` und `nanoid` auf sichere Versionen. `npm audit --omit=dev --json` meldet 0 High, 0 Critical und 0 weitere Advisories.                                                                                                                                         |
| F-05 | 🟢 Remote verifiziert                                 | Phase-0 L1+L2                                                                           | Unverändert; Migration 021 und Remote-Idempotenz sind Referenzschutz für F-06.                                                                                                                                                                                                                                                                                           |

### Ausgeführte Verifikation

| Befehl                           | Ergebnis                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gezielte Nachprüfung, 2026-08-12 | 116/116 Tests grün: Wallet, Migrationsvertrag, Origin-Policy/-Inventar/-Routen und Store-Idempotenz.                                                                                                                           |
| Gezielter Red-Lauf               | 8 erwartete Fehlschläge: Nullsaldo-Reset, fehlender Promo-Request-Key, drei fehlende Guards, zwei fehlende SQL-Verträge, fehlender Store-Key.                                                                                  |
| Erweiterte Security-Suite        | 113/113 Tests grün.                                                                                                                                                                                                            |
| Vollständige Suite               | 343/343 Tests grün.                                                                                                                                                                                                            |
| `npm run typecheck`              | Exit 0.                                                                                                                                                                                                                        |
| `npm run build`                  | Exit 0, Next.js 16.3.0.                                                                                                                                                                                                        |
| `npm run vibe-check`             | Exit 0; die ausgegebenen Design-Hinweise liegen außerhalb dieses Security-Scopes.                                                                                                                                              |
| Zielgerichtetes ESLint           | 0 Errors; 2 vorbestehende Warnings (`chat`-GET-Parameter, `syncTimer`).                                                                                                                                                        |
| Vollständiges ESLint             | Exit 1 mit 37 Errors/1.687 Warnings außerhalb des F-Scopes, maßgeblich in `public/prototypes/lib/gsap.min.js` und UI-Dateien. Nicht verändert.                                                                                 |
| `npm audit --omit=dev --json`    | 0 High, 0 Critical.                                                                                                                                                                                                            |
| `git diff --check` für F-Dateien | Exit 0; nur CRLF-Hinweise des bestehenden Arbeitsbaums.                                                                                                                                                                        |
| F-03 lokale Runtime              | Fremd-Origin: `seeds`, `chat`, `user/stats` jeweils HTTP 403; erlaubte Origin: `seeds`/`user/stats` jeweils HTTP 400 für absichtlich ungültigen Body. `chat` leitet ohne Session durch den Proxy mit 307 zu `/sign-in` weiter. |

## Selbstprüfung der Execution

- [x] F-01 enthält keinen Balance-`UPDATE` mehr im Read-Pfad; der neue Test scheitert, wenn dieser Reset zurückkehrt.
- [x] F-02 übergibt einen UUID-Idempotency-Key aus dem Browser und speichert die atomare Antwort im eindeutigen SQL-Ledger.
- [x] F-03 deckt jede aktuell aktive Browsermutation ab und testet Production ohne `APP_ORIGINS` fail-closed.
- [x] F-03 besitzt zusätzlich einen lokalen Laufzeitnachweis für drei abgewehrte Fremd-Origin-POSTs; die Session-/Stagingmatrix ist ausdrücklich nicht vorweggenommen.
- [x] F-04 besitzt einen frischen Advisory-Output und ein kompatibel verifiziertes Upgrade auf Next.js 16.3.0 statt einer historischen Behauptung.
- [x] F-06 vergibt keinen Browser-Execute-Grant; die existierende Rollenmatrix fragt die Funktion bereits ab.
- [x] F-05 bleibt unverändert und schützt die benötigte `pgcrypto`-Basis.
- [x] Lokale und Remote-Evidenz bleiben getrennt; keine L2-Aussage wird vor Rollout, Rollencheck und Paralleltest als erfüllt markiert.

**Nächster externer Schritt:** Für F-02 eine Staging-Testidentität mit isoliertem Promo-Code für den 20er-Paralleltest bereitstellen; für F-01/F-03 eine echte Staging-Session für Nullsaldo-Dreifachread und erlaubte/fremde Origin-Matrix nutzen. Erst nach diesen Nachweisen F-01/F-02/F-03 auf 🟢 setzen; F-06 ist bereits remote verifiziert.
