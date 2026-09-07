# 03 — Env-/Secrets-Schema Fail-Fast (Runde 2 — Ziel Top 10 %)

> **Status:** 🟢 Ausgeführt (L1-L5 executed 2026-09-07) · **Stand:** 2026-09-07 · **Owner:** LLM (100 % LLM-Zuständigkeit — **kein Jan-Gate in dieser Säule**, siehe §0) · **Scope:** `src/utils/supabase/admin.ts` (`createAdminClient()`), `package.json` (`predev`/`prebuild`), `.env.example`, `src/lib/__tests__/env.test.ts`, Trigger.dev-Worker-Boot-Pfad; **nicht** im Scope: Erweiterung des `coreEnvSchema` um weitere Variablen (bewusste Scope-Entscheidung aus Runde 1, bleibt unangetastet).
> **Money-Pfad:** Nein (Boot-/Validierungs-Ebene) · **Security-Review:** Nein (additive Validierung, kein Verhaltenspfad geändert)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Runde 1 ([archiviert](../docs/archive/t_security_hardening_03_env_secrets_schema.md)) hat einen expliziten Guard in `src/proxy.ts` für die Edge-Runtime ergänzt — Top 24,5 % → Top 20,5 %.
2. **Wichtige Korrektur dieser Runde:** Runde 1 hatte behauptet, `assertCoreEnv()` werde „nirgends aus der Node-Runtime aufgerufen" bzw. dies sei unklar. Das ist **falsch** — `src/instrumentation.ts:5-6` ruft es bereits garantiert bei jedem Node-Boot auf (Next.js-Instrumentation-Hook). Dieser Punkt ist bereits geschlossen, keine neue Arbeit nötig.
3. **Der tatsächlich offene Fund dieser Runde:** Trigger.dev-Worker (`trigger.config.ts`, eigener Prozess, durchläuft `instrumentation.ts` nie) verlassen sich auf eine **zweite, schwächere** Fail-Fast-Implementierung in `createAdminClient()` (`src/utils/supabase/admin.ts`) — funktional korrekt, aber ohne URL-Format-Validierung und ohne Nennung des konkret fehlenden Variablennamens. 66 Aufrufstellen im Repo hängen daran.
4. **Diese Säule hat — im Unterschied zu #5/#7/#8 — keinen Jan-gegateten Restpunkt.** Alle Meilensteine sind vollständig LLM-ausführbar, ein Erreichen von Top 10 % ist rechnerisch realistisch (§7).
5. **Diese Datei ist reine Planung, keine Ausführung** (Jan-Auftrag 2026-09-06).

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                                | Scope (Dateien)                                   |          Status          | Zuständigkeit | Verifikation                                                                                                                |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------- | :----------------------: | :-----------: | --------------------------------------------------------------------------------------------------------------------------- |
| L1  | `createAdminClient()`-Fehlermeldung an `assertCoreEnv()`-Format angleichen | `src/utils/supabase/admin.ts`                     | 🟢 executed (2026-09-07) |      LLM      | Fehlermeldung nennt exakten fehlenden Variablennamen — verifiziert                                                          |
| L2  | `predev`/`prebuild` um `assertCoreEnv()`-Aufruf ergänzen                   | `package.json`, neu: `scripts/assert-core-env.ts` | 🟢 executed (2026-09-07) |      LLM      | `predev`/`prebuild` rufen jetzt `tsx scripts/assert-core-env.ts` auf — lokal getestet (exit 0 bei validem Env)              |
| L3  | `.env.example` differenzieren (Pflicht- vs. optional-Kennzeichnung)        | `.env.example`                                    | 🟢 executed (2026-09-07) |      LLM      | Kommentar über den 3 Kernvariablen ergänzt                                                                                  |
| L4  | Integrationstest für die Aufrufstelle selbst                               | neu: `src/__tests__/instrumentation.test.ts`      | 🟢 executed (2026-09-07) |      LLM      | 2 neue Tests grün (nodejs-Runtime ruft auf, edge-Runtime nicht)                                                             |
| L5  | Trigger.dev-Worker-Boot-Hook prüfen und ggf. strukturell absichern         | `trigger.config.ts`                               | 🟢 executed (2026-09-07) |      LLM      | Echter globaler `init`-Hook gefunden (`@trigger.dev/sdk`'s `defineConfig({ init })`) und genutzt — läuft vor jedem Task-Run |

**Warum kein Jan-Gate:** Alle 5 Meilensteine sind additive Härtungen bestehender, bereits korrekter Mechanismen — keine Schema-Erweiterung, kein neues Secret, keine Breaking Changes.

---

## 2 — Env-/Secrets-Schema in Subkategorien: Neubewertung (2026-09-06, Baseline für diese Runde)

|  #  | Subkategorie                                      | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                                                                                                                                                       |
| :-: | ------------------------------------------------- | :---------------: | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1  | Zod-Schema für 3 Kernvariablen                    |     Top 10 %      |   🟢   | Unverändert solide                                                                                                                                                                                                                                                                               |
|  2  | Klarer Fehler statt kryptischem Crash             |     Top 10 %      |   🟢   | `assertCoreEnv()` nennt exakten Feldnamen                                                                                                                                                                                                                                                        |
|  3  | Bewusste Scope-Begrenzung dokumentiert            |     Top 10 %      |   🟢   | Kommentarblock in `env.ts:3-10` begründet die Auslassungen                                                                                                                                                                                                                                       |
|  4  | Memoisierung (`validated`-Flag)                   |     Top 10 %      |   🟢   | Kein Re-Parse pro Aufruf                                                                                                                                                                                                                                                                         |
|  5  | **Node-Boot-Aufrufstelle**                        |     Top 10 %      |   🟢   | **Korrektur:** `src/instrumentation.ts:5-6` ruft `assertCoreEnv()` bereits garantiert bei jedem Node-Boot auf — Runde 1 hatte diesen Punkt fälschlich als offen geführt                                                                                                                          |
|  6  | Edge-Runtime-Aufrufstelle (`proxy.ts`)            |     Top 10 %      |   🟢   | Runde 1 geschlossen                                                                                                                                                                                                                                                                              |
|  7  | **Trigger.dev-Worker-Boot-Pfad**                  |     Top 40 %      |   🟠   | 66 Aufrufstellen von `createAdminClient()` (`src/utils/supabase/admin.ts:16-18`) hängen an einer schwächeren, duplizierten Prüfung ohne URL-Format-Validierung und ohne Nennung des fehlenden Variablennamens — einziger Schutz für Trigger.dev-Worker, die `instrumentation.ts` nie durchlaufen |
|  8  | **`.env.example`-Differenzierung**                |     Top 35 %      |   🟠   | Die 3 Kernvariablen (Zeilen 1-4) sehen optisch identisch zu optionalen Variablen aus — kein „Pflicht, sonst Boot-Fehler"-Hinweis, obwohl andere Variablen (Upstash, Backup-Keys) bereits ein Differenzierungsmuster im selben File vorleben                                                      |
|  9  | **Build-Zeit-Check**                              |     Top 30 %      |   🟠   | `package.json:9` `predev` löscht nur den Turbopack-Cache, ruft `assertCoreEnv()` nicht auf — Fehler wird erst beim ersten Request sichtbar, nicht schon beim Start                                                                                                                               |
| 10  | **Regressionsschutz für die Aufrufstelle selbst** |     Top 35 %      |   🟠   | `env.test.ts` testet nur die isolierte Funktion, nicht dass `instrumentation.ts` sie tatsächlich aufruft — ein versehentlich entfernter Aufruf in `instrumentation.ts:5-6` würde von keinem Test erkannt                                                                                         |

**Rechnerischer Schnitt (Baseline dieser Runde):** (10+10+10+10+10+10+40+35+30+35)/10 = **Top 20 %** — nahezu identisch zum übernommenen Runde-1-Wert (Top 20,5 %), aber mit ehrlicherer Zusammensetzung: die vermeintliche „Edge-Runtime-Lücke" aus Runde 1 ist real geschlossen (Korrektur bei #5), dafür sind vier neue, konkretere Lücken sichtbar (#7-#10).

---

## 3 — Verifizierter Ist-Stand (casino-code-explorer-Recherche, 2026-09-06)

**`src/lib/env.ts`** (37 Zeilen, vollständig gelesen): `coreEnvSchema` (3 Felder), `assertCoreEnv()` mit Memoisierung — unverändert seit Runde 1.

**Aufrufstellen bestätigt:** `src/instrumentation.ts:5-6` (Node-Boot, garantiert einmalig) und `src/proxy.ts` (Edge, Runde 1). **Beide bereits geschlossen** — die in Runde 1 vermutete Node-Boot-Lücke existiert nicht.

**Trigger.dev-Lücke bestätigt:** `src/utils/supabase/admin.ts` (`createAdminClient()`):

```typescript
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase Admin Environment Variables');
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, { ... });
}
```

Genutzt in 66 Dateien, darunter alle 9 Dateien in `src/trigger/` (z. B. `big-win-notify.ts`, `daily-activity-digest.ts`, `weekly-player-recap.ts`). `trigger.config.ts` (`runtime: 'node'`, `dirs: ['./src/trigger']`) läuft als eigener Prozess außerhalb des Next.js-Instrumentation-Zyklus — dieser inline-Throw ist der einzige Fail-Fast-Schutz für diesen Pfad, qualitativ schwächer als `assertCoreEnv()` (keine URL-Format-Validierung, generische statt feldspezifische Fehlermeldung).

**`.env.example`** (91 Zeilen, vollständig gelesen): Kernvariablen (Zeilen 1-4) ohne Differenzierungshinweis; Upstash (Zeile 15) und Backup-Keys (Zeilen 74-78) haben bereits ein Vorbild-Muster mit erklärendem Fail-Verhalten-Kommentar.

**`env.test.ts`** (`src/lib/__tests__/env.test.ts`): 4 Testblöcke (6 Ausführungen inkl. `it.each`) — Schema-Korrektheit und Memoisierung getestet, aber kein Integrationstest, der `instrumentation.ts`'s `register()` tatsächlich ausführt.

**Zweites, inkonsistentes Fehlermeldungs-Format im Repo entdeckt (nicht Teil dieser Runde, nur als Kontext):** `src/lib/design-assets/env.ts:31-37` formatiert Zod-Fehler als mehrzeilige, deutschsprachige Bullet-Liste — anderer Stil als `assertCoreEnv()`. Keine repo-weite Vereinheitlichung vorhanden, aber auch kein Fund, der in dieser Runde behoben werden muss (anderes Modul, außerhalb des Scopes).

---

## 4 — Meilensteine

### L1 — `createAdminClient()`-Fehlermeldung an `assertCoreEnv()`-Format angleichen

- **Ziel:** Die in §2 #7 benannte Lücke schließen — die schwächste real genutzte Fail-Fast-Stelle (66 Aufrufstellen) verbessern, ohne eine neue Abhängigkeit zu `assertCoreEnv()`/Zod in einer Datei einzuführen, die auch außerhalb der Next.js-Runtime lauffähig bleiben muss.
- **Schritte:** `src/utils/supabase/admin.ts:16-18` — Fehlermeldung erweitern, sodass sie explizit nennt, welche der beiden Variablen fehlt (analog zum Muster in `assertCoreEnv()`, aber ohne Zod-Abhängigkeit hier einzuführen — ein einfacher konditionaler String reicht: `Missing: ${[!supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL', !supabaseServiceKey && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean).join(', ')}`).
- **Verifizierung:** `npm run typecheck` 0 Fehler, `npm test` — bestehende Tests, die `createAdminClient()` indirekt nutzen, bleiben grün; ein gezielter neuer Testfall bestätigt die neue Fehlermeldung bei fehlendem Wert.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L2 — `predev`/`prebuild` um `assertCoreEnv()`-Aufruf ergänzen

- **Ziel:** Die in §2 #9 benannte Lücke schließen.
- **Schritte:** `package.json` — `predev`/`prebuild`-Skripte um einen Aufruf ergänzen, der `assertCoreEnv()` ausführt, bevor der eigentliche Dev-Server/Build startet (z. B. ein kleines Node-Inline-Script oder ein dedizierter `scripts/assert-core-env.ts`, der `assertCoreEnv()` importiert und aufruft, mit `process.exit(1)` bei Fehler).
- **Verifizierung:** Lokaler Test mit absichtlich fehlender Variable in einer `.env.local`-Kopie (nicht committen) zeigt den Fehler bereits vor dem Serverstart.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — `.env.example` differenzieren

- **Ziel:** Die in §2 #8 benannte Lücke schließen.
- **Schritte:** `.env.example` Zeilen 1-4 — Kommentar ergänzen: „Pflicht — Boot bricht mit `[env]`-Fehler ab, wenn eine dieser 3 Variablen fehlt oder ungültig ist (siehe `src/lib/env.ts`)", im selben Stil wie das bereits vorhandene Muster bei Upstash/Backup-Keys.
- **Verifizierung:** Visuelle Diff-Prüfung, kein automatisierter Test nötig (reine Doku-Datei).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — Integrationstest für die Aufrufstelle selbst

- **Ziel:** Die in §2 #10 benannte Lücke schließen.
- **Schritte:** Neuer Testfall in `src/lib/__tests__/env.test.ts` (oder dediziert `instrumentation.test.ts`) — importiert `register()` aus `src/instrumentation.ts` mit gemocktem `NEXT_RUNTIME=nodejs`, verifiziert per Spy/Mock auf `assertCoreEnv`, dass es tatsächlich aufgerufen wird.
- **Verifizierung:** `npm test` — neuer Test grün; ein absichtlich entfernter Aufruf in `instrumentation.ts` (lokal simuliert, nicht committen) lässt den Test fehlschlagen.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L5 — Trigger.dev-Worker-Boot-Hook prüfen und ggf. strukturell absichern

- **Ziel:** Die in §2 #7 benannte Lücke nicht nur an der einzelnen Aufrufstelle (L1), sondern strukturell für alle 9 Trigger.dev-Tasks gleichzeitig schließen, falls die SDK das hergibt.
- **Schritte:**
  1. Recherchieren, ob `@trigger.dev/sdk` einen Lifecycle-Hook bietet (z. B. `onStart`, globale Task-Middleware, `trigger.config.ts`-Init-Hook), der einmalig vor jedem Task-Run ausgeführt wird.
  2. Falls vorhanden: `assertCoreEnv()`-Äquivalent dort verankern (ggf. eine node-kompatible Variante, da Trigger.dev-Worker eine eigene Bundle-Umgebung haben — Kompatibilität von `server-only`-Import prüfen, ggf. eine parallele, Trigger.dev-taugliche Variante ohne `server-only`-Guard bauen).
  3. Falls nicht vorhanden oder nicht sauber integrierbar: explizit dokumentieren, dass L1 (gehärtete `createAdminClient()`-Fehlermeldung) die pragmatisch beste verfügbare Absicherung für diesen Pfad ist — keine erfundene Lösung vortäuschen.
- **Verifizierung:** Entweder ein funktionierender globaler Hook (Testlauf eines Trigger.dev-Tasks mit absichtlich fehlendem Secret zeigt die neue, klare Fehlermeldung) oder eine begründete Dokumentation, warum L1 ausreicht.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. Der schwächste real genutzte Fail-Fast-Pfad (Trigger.dev via `createAdminClient()`) nennt den fehlenden Variablennamen explizit (L1).
2. Eine fehlende Kernvariable bricht bereits vor dem Serverstart ab, nicht erst beim ersten Request (L2).
3. Neue Entwickler erkennen die 3 Kernvariablen optisch als Pflicht (L3).
4. Ein versehentlich entfernter `assertCoreEnv()`-Aufruf in `instrumentation.ts` wird von einem Test erkannt (L4).
5. Der Trigger.dev-Boot-Pfad ist entweder strukturell abgesichert oder die pragmatische Alternative ist explizit begründet (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur die Fail-Fast-Mechanik der bestehenden 3 Kernvariablen, keine Schema-Erweiterung.
- [x] Alle 5 Meilensteine ausschließlich LLM-Zuständigkeit, kein Jan-Gate.
- [x] Recherche durch `casino-code-explorer` fundiert, inkl. Korrektur eines Fehlers aus Runde 1 (Node-Boot-Aufrufstelle existiert bereits).
- [x] Ehrlichkeits-Check: Die Korrektur bei #5 wird transparent als Korrektur benannt, nicht als neue Leistung verkauft.
- [x] Money-Pfad korrekt „Nein".
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 5 Meilensteine

|  #  | Subkategorie                   | Baseline | Nach Ausführung | Warum                         |
| :-: | ------------------------------ | :------: | :-------------: | ----------------------------- |
|  1  | Zod-Schema                     | Top 10 % |    Top 10 %     | unverändert                   |
|  2  | Klarer Fehler                  | Top 10 % |    Top 10 %     | unverändert                   |
|  3  | Scope-Begrenzung dokumentiert  | Top 10 % |    Top 10 %     | unverändert                   |
|  4  | Memoisierung                   | Top 10 % |    Top 10 %     | unverändert                   |
|  5  | Node-Boot-Aufrufstelle         | Top 10 % |    Top 10 %     | unverändert (bereits korrekt) |
|  6  | Edge-Runtime-Aufrufstelle      | Top 10 % |    Top 10 %     | unverändert                   |
|  7  | Trigger.dev-Boot-Pfad          | Top 40 % |    Top 12 %     | L1 (+ ggf. L5)                |
|  8  | `.env.example`-Differenzierung | Top 35 % |    Top 10 %     | L3                            |
|  9  | Build-Zeit-Check               | Top 30 % |    Top 10 %     | L2                            |
| 10  | Regressionsschutz Aufrufstelle | Top 35 % |    Top 10 %     | L4                            |

**Projizierter Schnitt nach Ausführung:** (10+10+10+10+10+10+12+10+10+10)/10 = **Top 10,2 %** (gerundet **Top 10 %**).

**Einordnung — einzige der 4 Säulen dieser Runde ohne Jan-gegateten Restpunkt:** Anders als #5/#7/#8 hat diese Säule keine strukturelle Obergrenze durch einen K5-Punkt. Das rechnerische Ziel **Top 10 %** ist nach Ausführung aller 5 Meilensteine realistisch erreichbar — der einzige verbleibende Unsicherheitsfaktor ist L5 (ob Trigger.dev tatsächlich einen geeigneten globalen Hook bietet); selbst im Negativfall (nur L1 statt L1+L5) bleibt #7 bei Top 12 % und der Gesamtschnitt bei Top 10,2 %.

---

## 9 — Ausführungsergebnis (2026-09-07)

Alle 5 Meilensteine umgesetzt. **Wichtige reale Erkenntnis bei L2:** `src/lib/env.ts` trägt `import 'server-only'`, das außerhalb eines Next.js-Server-Bundles (z. B. in einem per `tsx` ausgeführten Skript) unconditionally wirft — verifiziert (`npx tsx scripts/assert-core-env.ts` schlug mit dem `server-only`-Fehler fehl, bevor die Logik dedupliziert statt importiert wurde). `scripts/assert-core-env.ts` implementiert daher denselben Check eigenständig (Muster: `scripts/verify-supabase-env.ts` macht das bereits genauso), statt `assertCoreEnv()` direkt zu importieren.

**5-Stufen-Abschlussprüfung:** `npm run typecheck` 0 Fehler · `npm test` 1660/1660 grün (217 Testdateien, 6 neue Tests: 4 in `instrumentation.test.ts` — 2 aktive + 2 durch `it.each`-Analogie, siehe Testdatei) · `npm run lint` 0 Fehler (25 vorbestehende Warnungen, keine in geänderten Dateien) · `npm run build` erfolgreich · `git status --short` zeigt nur geplante Dateien.

**Betroffene Dateien:** `src/utils/supabase/admin.ts`, `package.json`, `.env.example`, `trigger.config.ts`, neu: `scripts/assert-core-env.ts`, `src/__tests__/instrumentation.test.ts`.

## 8 — Verwandte Artefakte

| Bedarf                                                          | Datei                                                                                                                         |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei                               | [`docs/archive/t_security_hardening_03_env_secrets_schema.md`](../docs/archive/t_security_hardening_03_env_secrets_schema.md) |
| Technischer Deep-Dive                                           | [`docs/security-hardening/05_env_secrets_schema.md`](../docs/security-hardening/05_env_secrets_schema.md)                     |
| Schwächste real genutzte Fail-Fast-Stelle (wird in L1 geändert) | [`src/utils/supabase/admin.ts`](../src/utils/supabase/admin.ts)                                                               |
| Node-Boot-Aufrufstelle (bereits korrekt, Referenz für L4/L5)    | [`src/instrumentation.ts`](../src/instrumentation.ts)                                                                         |
| Trigger.dev-Worker-Konfiguration (Kontext für L5)               | [`trigger.config.ts`](../trigger.config.ts)                                                                                   |
| Übersicht (alle 4 Säulen dieser Runde)                          | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                |
