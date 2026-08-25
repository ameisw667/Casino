export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  score: PasswordStrengthScore;
  label: 'Sehr schwach' | 'Schwach' | 'Mittel' | 'Stark' | 'Exzellent';
  color: string;
  feedback: string[];
  isStrongEnough: boolean;
}

const COMMON_PATTERNS = [
  /12345/i,
  /password/i,
  /passwort/i,
  /qwerty/i,
  /qwertz/i,
  /asdfgh/i,
  /abcdef/i,
  /(.)\1{2,}/, // 3+ identical consecutive chars (e.g. 'aaa', '111')
];

/**
 * Computes password entropy and strength client-side without external dependencies.
 * Returns a score between 0 and 4, localized label, brand color, and actionable tips.
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password || password.length === 0) {
    return {
      score: 0,
      label: 'Sehr schwach',
      color: '#ff3366',
      feedback: ['Bitte gib ein Passwort ein.'],
      isStrongEnough: false,
    };
  }

  const feedback: string[] = [];
  let points = 0;

  // 1. Length analysis
  const len = password.length;
  if (len < 8) {
    feedback.push('Mindestens 8 Zeichen verwenden.');
  } else {
    points += 1;
    if (len >= 12) points += 1;
    if (len >= 16) points += 1;
  }

  // 2. Character diversity
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const diversityCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (diversityCount >= 2) points += 1;
  if (diversityCount >= 3) points += 1;
  if (diversityCount === 4) points += 1;

  if (!hasUpper || !hasLower) {
    feedback.push('Groß- und Kleinbuchstaben kombinieren.');
  }
  if (!hasNumber) {
    feedback.push('Mindestens eine Zahl hinzufügen.');
  }
  if (!hasSymbol) {
    feedback.push('Sonderzeichen (z. B. !?#@$) hinzufügen.');
  }

  // 3. Pattern & repetition penalties
  let hasPattern = false;
  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(password)) {
      hasPattern = true;
      break;
    }
  }

  if (hasPattern) {
    points = Math.max(0, points - 1);
    feedback.push('Häufige Tastenmuster oder Wiederholungen vermeiden.');
  }

  // Calculate final clamped score
  let score: PasswordStrengthScore = 0;
  if (len < 8) {
    score = 0;
  } else if (points <= 2) {
    score = 1;
  } else if (points === 3) {
    score = 2;
  } else if (points === 4) {
    score = 3;
  } else {
    score = 4;
  }

  const SCORE_MAP: Record<
    PasswordStrengthScore,
    { label: PasswordStrengthResult['label']; color: string }
  > = {
    0: { label: 'Sehr schwach', color: '#ff3366' },
    1: { label: 'Schwach', color: '#ff5555' },
    2: { label: 'Mittel', color: '#ffaa00' },
    3: { label: 'Stark', color: '#D4AF37' },
    4: { label: 'Exzellent', color: '#00e676' },
  };

  return {
    score,
    label: SCORE_MAP[score].label,
    color: SCORE_MAP[score].color,
    feedback: score >= 4 ? ['Hervorragend abgesichert!'] : feedback.slice(0, 2),
    isStrongEnough: score >= 2 && len >= 8,
  };
}
