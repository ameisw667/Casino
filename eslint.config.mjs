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
]);

export default eslintConfig;
