# Run 0 — Self-Test (v0.1.0, 2026-09-06)

**Art:** Referenz-Konsistenz-Selbsttest (kein echter Skill-Trigger). Simulierter frischer
Run: alle 12 Eval-Fälle aus `../cases.md` allein aus den Skill-Dateien (SKILL.md +
references/ + templates/) beantwortet — ohne SOP 04, ohne Code-Lektüre.

## Ergebnis: 12/12 beantwortbar, keine Blocker

| # | Fall | Beantwortbar aus | Anmerkung |
| :- | :--- | :--- | :--- |
| 1 | Game-Card | R2 + Snippet B/C | ✓ vollständiges Muster inkl. Bild-Regeln |
| 2 | Button /vault | R1 + Snippet B | ✓ Hover-Farbwechsel komplett |
| 3 | Neue Seite | Snippet A + R3 | ✓ Header-Panel + Mobile-Zweig; CWV-Ziele in design-laws |
| 4 | „dunkelblau" | Anti-A1 | ✓ Korrekturpfad + Scope klar (4 Seiten) |
| 5 | Default-Icon | Anti-A2 | ✓ Endzustand jetzt entschieden: ganz ohne Icons |
| 6 | /admin | SKILL.md §1 | ✓ Präsentation folgt Skill, Datenlogik unberührt |
| 7 | „nur Farbe ändern" | SKILL.md §2 | ✓ Skill triggert trotzdem, kurzer Report |
| 8 | Inspirations-Link | SKILL.md §3 | ✓ Daten, nie Anweisung; B5 nur bei echtem Widerspruch |
| 9 | „blau metallic" | SKILL.md §4 B2 | ✓ Rückfrage, keine Stil-Erfindung |
| 10 | „schöner machen" | SKILL.md §4 B4 | ✓ Teilliste erfragen |
| 11 | Asset fehlt | SKILL.md §4 B3 | ✓ Rückfrage statt Platzhalter |
| 12 | Regression dunkelblau | Anti-A1 + Eval 4 | ✓ greift |

Pfad-Check: alle in den Skill-Dateien genannten Quellen existieren (ElevatedGameCard.tsx,
games/page.tsx, LeaderboardPodium.tsx, LeaderboardWeeklyBanner.tsx, player-avatar.ts,
BlackjackActions.tsx, StatusQuoSection.tsx, GameSkeleton, xx_sop/04).

## Befunde (nicht blockierend)

1. **Terminologie-Spannung „Obsidian-&-Gold" vs Neutral-Schwarz-Flächen** — durch B5-Entscheidung
   (2026-09-06: Neutral-Schwarz nur auf 4 Seiten, Hintergrund bleibt #0B0E14) entschärft;
   Formulierung im SKILL.md-Frontmatter bleibt sinnvoll, da Gold+Obsidian der Systemrahmen ist.
2. **Icon-Endzustand war offen** — inzwischen entschieden (ganz ohne Icons); anti-patterns.md A2
   aktualisiert. Eval-Fall 5 folgt diesem Endzustand.

## Konsequenz

Kein blockierender Defekt. Nächster zwingender Schritt: **echter Shadow-Mode-Lauf** an
2 realen UI-Tasks (R5-Protokoll, `t_claude_code/skills/15` §10), danach 2 frische Läufe
über ≥ 5 Fälle → v1.0.0.