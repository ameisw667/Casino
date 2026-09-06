import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // .gstack is created by the gstack browser-testing tool and is unreadable
    // by Node's fs.readdir (EPERM), which crashes ESLint's flat-config file walker.
    '.gstack/**',
    // Generated coverage reports — not source code, lint noise only.
    'coverage/**',
    // Vendored third-party minified bundles for the redesign prototypes —
    // not source code we own, and minified output trips rules like no-this-alias.
    'public/prototypes/lib/**',
    // Local Trigger.dev build cache (gitignored) — minified bundled output, not source.
    '.trigger/**',
    // Supabase CLI local runtime generated temp files (gitignored)
    'supabase/.temp/**',
    'supabase/.branches/**',
    // Research / documentation sub-repos
    'worldmap/**',
    // Agent evaluations & test fixtures
    '.claude/**',
  ]),
  {
    rules: {
      // Codebase convention: leading underscore marks an intentionally unused
      // binding (e.g. destructured placeholders for future migration logic).
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Scoped to src/ only — tests/**, scripts/**, and other Node/Playwright tooling outside
    // the shipped app are legitimately console-based and are not covered by this rule.
    // CasinoLogger (src/lib/casino/logger.ts) is the single sanctioned bridge to Sentry —
    // a raw console.error/warn/log/info silently bypasses redaction and vanishes entirely
    // in production (verified gap, fixed across 12 files in the 2026-09 Logger observability
    // audit: docs/observability/03_logger_error_capture.md). console.debug stays allowed for
    // lightweight, intentionally-ignorable dev-only instrumentation (e.g. perf-monitor.ts).
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-console': ['error', { allow: ['debug'] }],
    },
  },
  {
    // The one file allowed to touch console directly — it IS the CasinoLogger/Sentry bridge.
    files: ['src/lib/casino/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Internal QA/testing sandbox routes, not shipped production code paths.
    files: ['src/app/testing/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // WebGL (three/@react-three) ist auf die PULS-Sandbox beschränkt, damit die
    // 3D-Bundle-Größe niemals in App-Chunks landet (T_FRONTEND/02-4 §4.2).
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['three', 'three/*', '@react-three/*'],
              message: 'WebGL-Imports nur innerhalb src/app/lab/** (PULS-Sandbox).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/lab/**/*.ts', 'src/app/lab/**/*.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]);

export default eslintConfig;
