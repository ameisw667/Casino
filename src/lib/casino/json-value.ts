import type { Json } from '@/types/database.types';

/**
 * Konvertiert einen JSON-kompatiblen Eingabewert in den generierten Supabase-
 * `Json`-Typ. Der JSON-Roundtrip entspricht exakt der Serialisierung, die
 * postgrest-js ohnehin an den Request-Body schreibt (undefinierte Properties
 * fallen weg), und garantiert die strukturelle Json-Kompatibilität zur Compile-
 * und Laufzeit. Alle Aufrufer übergeben Zod-validierte Objekte.
 */
export function toJsonValue(value: unknown): Json {
  return JSON.parse(JSON.stringify(value ?? null)) as Json;
}
