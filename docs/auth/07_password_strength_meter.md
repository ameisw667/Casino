# 07 — Passwort-Entropie-Scorer & Stärkemesser

> **Säule:** 7 von 9 · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27  
> **Archiv-Quelle:** `docs/archive/20_7_password_strength_meter.md` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Ein interaktiver 4-Segment-Leuchtbalken mit Glassmorphism-Design und Framer Motion Physik, der während der Passworteingabe live die kryptografische Stärke berechnet (Rot → Schwach → Bernstein → Smaragdgrün).

- **Vorteil:** Motiviert Nutzer zur Wahl starker Passwörter; 0 KB externe Bibliotheken (kein schweres 400 KB `zxcvbn`-Paket im Bundle).
- **Sicherheit:** $O(N)$ ReDoS-sicherer Algorithmus ohne gefährliche reguläre Ausdrücke.

---

## 2 — Neue-Projekt-Checkliste (2 Schritte)

```
[ ] 1. Algorithmus in src/lib/security/password-strength.ts kopieren (0 KB Dependencies)
[ ] 2. UI-Komponente PasswordStrengthMeter.tsx bei Registrierung & Passwort-Reset einbinden
```

---

## 3 — Berechnungs-Core (`src/lib/security/password-strength.ts`)

```typescript
export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  score: PasswordStrengthScore;
  label: 'Sehr schwach' | 'Schwach' | 'Mittel' | 'Stark' | 'Exzellent';
  color: string;
  feedback: string[];
  isStrongEnough: boolean;
}

const COMMON_PATTERNS = [
  /12345/i, /password/i, /passwort/i, /qwerty/i, /qwertz/i, /asdfgh/i, /abcdef/i,
];

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

  // 1. Längen-Analyse
  const len = password.length;
  if (len < 8) {
    feedback.push('Mindestens 8 Zeichen verwenden.');
  } else {
    points += 1;
    if (len >= 12) points += 1;
    if (len >= 16) points += 1;
  }

  // 2. Zeichenklassen-Diversität
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const diversityCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (diversityCount >= 2) points += 1;
  if (diversityCount >= 3) points += 1;
  if (diversityCount === 4) points += 1;

  if (!hasUpper || !hasLower) feedback.push('Groß- und Kleinbuchstaben kombinieren.');
  if (!hasNumber) feedback.push('Mindestens eine Zahl hinzufügen.');
  if (!hasSymbol) feedback.push('Sonderzeichen (z. B. !?#@$) hinzufügen.');

  // 3. Muster- & Wiederholungs-Strafen
  let hasPattern = false;
  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(password)) {
      hasPattern = true;
      break;
    }
  }
  // 3+ gleiche aufeinanderfolgende Zeichen (z. B. 'aaa', '111')
  if (/(.)\1{2,}/.test(password)) {
    hasPattern = true;
  }

  if (hasPattern) {
    points = Math.max(0, points - 1);
    feedback.push('Häufige Tastenmuster oder Wiederholungen vermeiden.');
  }

  // Score auf 0-4 clampen
  let score: PasswordStrengthScore = 0;
  if (len < 8) score = 0;
  else if (points <= 2) score = 1;
  else if (points === 3) score = 2;
  else if (points === 4) score = 3;
  else score = 4;

  const SCORE_MAP: Record<PasswordStrengthScore, { label: PasswordStrengthResult['label']; color: string }> = {
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
```

---

## 4 — UI-Komponente (`src/components/auth/PasswordStrengthMeter.tsx`)

- 4 gleich breite Segmente mit Farb-Übergängen
- Framer Motion Spring-Animation (`bounce: 0.4`)
- ARIA-Live-Region (`aria-live="polite"`) für Screenreader
- Dynamische Feedback-Tipps unterhalb des Balkens

---

## 5 — Code-Pfade

```
src/
├── lib/security/
│   ├── password-strength.ts           # ReDoS-sicherer Berechnungs-Core
│   └── __tests__/password-strength.test.ts # 100 % Unit-Testabdeckung
├── components/auth/
│   ├── PasswordStrengthMeter.tsx      # 4-Segment Leuchtbalken
│   └── AuthForm.tsx                   # Einbettung bei Registrierung
└── app/auth/reset-password/page.tsx   # Einbettung bei Passwort-Wiederherstellung
```

---

## 6 — Pitfalls

> **Pitfall 1 — ReDoS (Catastrophic Backtracking):** Komplexe Regex-Muster können bei langen Passworteingaben (z. B. 5.000 Zeichen durch Password Manager) den Browser einfrieren. Dieser Algorithmus nutzt einfache, lineare Prüfungen und ist $O(N)$-sicher.

> **Pitfall 2 — PII im DOM:** Niemals das rohe Passwort in `data-*`-Attribute oder ARIA-Labels rendern, da Browser-Extensions oder Screen-Recorder diese auslesen könnten. Nur der numerische Score (0–4) und das Label werden im DOM exponiert.

---

## 7 — Tests

- `src/lib/security/__tests__/password-strength.test.ts` — 100 % Testabdeckung (leere Strings, kurze Passwörter, Unicode, Wörterbuch-Wörter, maximale Stärke).
- **Security-Review:** PASS — ReDoS- und DOM-Sicherheit verifiziert.
