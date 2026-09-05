import path from 'path';

/**
 * Validiert, dass ein Asset-Name strikt kebab-case ist und keinerlei
 * Path-Traversal-Zeichen (wie `..`, `/`, `\`, Null-Bytes) enthält.
 */
export function validateSafeAssetName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Asset-Name darf nicht leer sein.');
  }

  // Verbiete Null-Bytes, Slashes und Backslashes explizit
  if (/[\0/\\]/.test(trimmed) || trimmed.includes('..')) {
    throw new Error(`Ungültiger Asset-Name: Path-Traversal-Zeichen erkannt in "${name}".`);
  }

  // Strikter Kebab-Case
  const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!kebabRegex.test(trimmed)) {
    throw new Error(
      `Ungültiger Asset-Name "${name}": Erlaubt sind nur Kleinbuchstaben, Ziffern und Bindestriche (kebab-case).`,
    );
  }

  return trimmed;
}

/**
 * Löst einen Dateipfad relativ zu einem Basisverzeichnis auf und garantiert,
 * dass der aufgelöste Pfad strikt innerhalb des Basisverzeichnisses liegt.
 * Verhindert Directory-Traversal (z. B. `../../etc/passwd` oder `C:\Windows\...`).
 */
export function resolveSafePath(baseDir: string, userPath: string): string {
  const normalizedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(normalizedBase, userPath);

  // Stelle sicher, dass resolvedTarget mit normalizedBase beginnt
  const relative = path.relative(normalizedBase, resolvedTarget);
  const isOutside = relative.startsWith('..') || path.isAbsolute(relative);

  if (isOutside) {
    throw new Error(
      `Sicherheitsverletzung: Zugriff außerhalb des erlaubten Pfades blockiert ("${userPath}").`,
    );
  }

  return resolvedTarget;
}

/**
 * Bereinigt Fehlermeldungen und Logs von OpenAI-API-Keys oder sensitiven Tokens.
 */
export function scrubSensitiveText(
  text: string,
  additionalSecrets: readonly string[] = [],
): string {
  let result = text;

  // 1. Bekannte Secrets explizit maskieren
  for (const secret of additionalSecrets) {
    if (secret && secret.length >= 4) {
      result = result.split(secret).join('[REDACTED_SECRET]');
    }
  }

  // 2. OpenAI API Keys matchen (sk-..., sk-proj-...)
  result = result.replace(/sk-(?:proj-)?[a-zA-Z0-9_-]{20,}/g, '[REDACTED_API_KEY]');

  // 3. Bearer Tokens matchen
  result = result.replace(/Bearer\s+[a-zA-Z0-9_.-]+/gi, 'Bearer [REDACTED_TOKEN]');

  return result;
}

/**
 * Sichere Redaction eines API-Keys für Status- und Debugausgaben.
 */
export function safeRedactApiKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return '[EMPTY_KEY]';
  if (trimmed.length < 8) return '***';
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-3)}`;
}
