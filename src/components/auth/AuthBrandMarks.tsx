// Google G SVG Logo — inline, no external dependency
export function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Bespoke jeweled crown emblem — gold gradient body, emerald/ruby accent gems
// (echoes the casino's own win/loss color language), diamond sparkle at the peak.
export function CrownEmblem() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crownGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE8A3" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A6412" />
        </linearGradient>
      </defs>
      <path
        d="M6 22 L6 13 L11 17 L16 7 L21 17 L26 13 L26 22 Z"
        fill="url(#crownGoldGrad)"
        stroke="#8A6412"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <rect
        x="6"
        y="22"
        width="20"
        height="4"
        rx="1"
        fill="url(#crownGoldGrad)"
        stroke="#8A6412"
        strokeWidth="0.6"
      />
      <circle cx="6" cy="13" r="1.6" fill="#00e676" />
      <circle cx="26" cy="13" r="1.6" fill="#ff3366" />
      <circle cx="16" cy="7" r="2" fill="#fffbe8" stroke="#D4AF37" strokeWidth="0.4" />
    </svg>
  );
}
