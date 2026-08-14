// Vereinfachter Sicherheits-Guard (2026-08-14, nach Verwerfen des VPS-Ansatzes).
// Es gibt keine zweite Zielinstanz mehr, gegen die positiv geprüft werden könnte —
// die Fehler-Injection-Skripte setzen die kaputte Ziel-URL selbst hart (kein Env-Vertrauen
// nötig für den Fehlerteil). Dieser Guard ist die verbleibende Absicherung: verhindert
// versehentliches Ausführen in einer Produktionsumgebung und verlangt eine bewusste
// Bestätigung pro Lauf. Details: worldmap/05_1.10 ...md Abschnitt 5.

export function assertSafeToRunChaosTest() {
  if (process.env.NODE_ENV === 'production') {
    console.error('ABBRUCH: Chaos-Skripte laufen nie mit NODE_ENV=production.');
    process.exit(1);
  }

  if (process.env.CHAOS_CONFIRM !== 'yes') {
    console.error(
      'ABBRUCH: Setze CHAOS_CONFIRM=yes im Environment, um zu bestätigen, dass du diesen ' +
        'Testlauf bewusst startest (verhindert versehentliches Ausführen z. B. aus einem CI-Job).',
    );
    process.exit(1);
  }

  console.log('Sicherheitscheck bestanden — Chaos-Testlauf bestätigt.');
}
