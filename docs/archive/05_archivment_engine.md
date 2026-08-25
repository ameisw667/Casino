# 05 — Achievement Engine: sichtbarer Fortschritt und UI-geheime Achievements

> **Status:** Executed (archiviert; lokal) · **Stand:** 2026-08-23 · **Owner:** Jan/LLM · **Scope:** Option 1: den vorhandenen Fortschritt sichtbar machen und UI-maskierte geheime Achievements deklarativ ergänzen; kein saisonales System und keine serverseitige Neu-Autorität.

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| --- | --- | --- | --- | --- |
| L0 | Ist-Zustand und Option-Gate | 🟢 Executed | Option 1 entschieden | LLM |
| L1 | Visibility-Datenmodell | 🟢 Executed (lokal) | Fokussierte Tests verifiziert | LLM |
| L2 | Vault-Präsentation | 🟢 Executed (lokal) | Sichtbare Zähler im lokalen Browser geprüft; Mystery-Zustand per Unit-Test geprüft | LLM |
| L3 | Doku, Archivierung, lokale Prüfung | 🟢 Executed (lokal) | Archiviert; globaler Lint war zum P42-Abschluss wegen eines parallelen P43-Fehlers offen | LLM |
| L4 | Remote-Rollout | 🔴 Geplant | Migration anwenden und als Spieler prüfen | Jan |

## 2 — Entscheidung und Scope

`public.user_achievements` bleibt die persistente Projektion pro Nutzer/Achievement (`progress`, `unlocked`, `updated_at`). `achievement_configs` erhält nur `visibility` mit `visible` oder `secret`. Ein gesperrtes geheimes Achievement zeigt im Vault keine Metadaten und keinen Fortschritt; nach dem Unlock wird die normale Karte gezeigt.

Als erster konfigurierter Geheimnisfall kommt `lucky_seven` hinzu: Dice-Multiplikator ≥ 7. Die Bedingung nutzt ausschließlich vorhandene Statistiken; es entstehen keine Wallet- oder Reward-Effekte.

### Verifizierte Fakten

- Migration 013 speichert Fortschritt bereits monoton in `user_achievements`.
- `applyAchievementProgress()` berechnet den Fortschritt bereits aus `progressStat`; der Vault zeigt bisher nur Balken ohne Zähler.
- `achievement_configs` ist öffentlich lesbar. „Secret“ bedeutet deshalb ausschließlich UI-Überraschung, nicht vertrauliche Bedingung oder Manipulationsschutz.

### Nicht-Scope

- Keine neue serverseitige Auswertung, kein Settlement-, Wallet-, Reward-, Auth- oder Idempotenzpfad.
- Kein Admin-Editor, keine RLS-/API-Änderung und kein saisonaler Reset.
- Kein Remote-/Live-Rollout ohne explizite externe Freigabe durch Jan.

## 3 — Datenmodell und Sicherheitsgrenzen

| Element | Änderung | Allowlist/Fallback | Negativtest |
| --- | --- | --- | --- |
| `achievement_configs.visibility` | `TEXT NOT NULL DEFAULT 'visible'` mit Check auf `visible`/`secret` | Bestehende Zeilen bleiben sichtbar | Unbekannter Loader-Wert wird zu `visible` normalisiert |
| `AchievementConfig.visibility` | Literaltyp `visible \| secret` | Jeder Default trägt einen expliziten Wert | Ungültiger Wert verbirgt keine Karte |
| `Achievement.visibility` | Aus der Config in die Client-Projektion übernehmen | Persistierter Progress/Unlock bleibt nach ID erhalten | Gesperrte Geheimnisse zeigen keine Metadaten/Zähler |
| `VaultAchievements` | Isolierte Vault-Komponente | Fortschritt auf `0..total` begrenzt, Monospace `progress / total` | Keine Division durch 0; Geheimnis bleibt vor Unlock maskiert |

Der existierende clientseitige Achievement-Write bleibt der ausdrücklich kosmetische Vertrauensgrenzfall aus der Architektur der Condition-Engine. Diese Änderung erhöht keine Browser-Autorität und öffnet keinen Geldpfad.

## 4 — Ausführung (lokal)

### Task 1 — Visibility-Vertrag und Migration

- [x] Literaltyp `visible | secret`, zehnte Default-Config `lucky_seven`, Merge-Projektion und Loader-Allowlist implementiert.
- [x] Idempotente Migration `051_achievement_visibility.sql` mit Backfill, Check-Constraint und Seed angelegt.
- [x] 27 fokussierte Achievement-Tests prüfen Default, Fallback, Projektion, Mystery-Maske und Reveal.

### Task 2 — Vault-Zähler und Mystery-Karte

- [x] Vorschau und Modal nach `VaultAchievements` extrahiert.
- [x] Sichtbare, gesperrte Karten zeigen begrenzten Fortschritt und Monospace-`progress / total`.
- [x] Mystery-Karten zeigen vor Unlock keine Config-Metadaten; der Reveal-Zustand ist per Unit-Test geprüft.
- [x] Lokale Browser-Abnahme von `/vault`: sichtbare Zähler geprüft. Der Mystery-Zustand kann ohne Remote-Migration nicht aus der geladenen Remote-Config erscheinen.

### Task 3 — Dokumentation und Archiv

- [x] Architekturvertrag, Roadmap und Archivindex aktualisiert; aktiver Plan aus `worldmap/` entfernt.
- [x] Typecheck, Vitest-Gesamtsuite, Production-Build und Vibe-Check ausgeführt.
- [x] Globaler Lint-Fund außerhalb von P42 als unabhängiger P43-Fehler dokumentiert.

## 5 — Selbstprüfung vor Execution

- **Architektur:** Bestehende Tabelle und Condition-Engine werden erweitert, nicht ersetzt; ein Saisonmodell wird nicht vorweggenommen.
- **Security:** UI-Geheimnis ist ausdrücklich nicht vertraulich; es gibt keinen Geld-, Auth- oder neuen Browser-Schreibpfad.
- **UX:** Alle dynamischen Zähler sind Monospace; Mystery-Karten offenbaren vor Unlock keine Config-Metadaten.
- **Verifikation:** Unit-Tests decken Vertrag/Projektion ab; `/vault` deckt beide Darstellungszustände ab; Typprüfung, Lint, Suite, Build und Vibe-Check prüfen die Integration.


## 6 — Ausführungsnachweis (lokal, 2026-08-23)

- `npm run typecheck`, `npm run test` (130 Dateien / 1.000 Tests), `npm run build` und `npm run vibe-check` sind grün.
- Die sichtbaren Zähler wurden auf `http://localhost:3015/vault` im lokalen Browser geprüft. Der Remote-Config-Stand enthält die neue, lokal angelegte `lucky_seven`-Definition noch nicht; daher decken die 27 fokussierten Achievement-Tests die Mystery-/Reveal-Verzweigung ab.
- Zum P42-Abschluss war `npm run lint` wegen eines parallelen P43-Fehlers in `src/components/layout/NotificationCenter.tsx` rot; P42 erzeugte keinen Lint-Befund. Nach P43-Abschluss ist der globale Lint grün mit 0 Fehlern und 7 unabhängigen Warnungen.
- Die Migration `051_achievement_visibility.sql` ist ausschließlich lokal angelegt. L4 bleibt eine ausdrückliche Remote-Aufgabe für Jan; es wird kein Live-Status behauptet.
## 7 — Jan nach der LLM-Execution

1. `051_achievement_visibility.sql` im Casino-Projekt prüfen und nur mit eigener Freigabe remote anwenden.
2. Danach `/vault` eingeloggten prüfen: Zähler für sichtbare Achievements, Mystery vor Unlock, vollständige Karte danach.
3. Erst mit diesen Remote-Nachweisen den Status in `worldmap/00_WORLDMAP_STATUS.md` auf live ändern.
