import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  // Allows an isolated production build while next dev owns the default .next directory.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'www.gstatic.com' },
      { protocol: 'https', hostname: 'cryptologos.cc' },
    ],
  },
  devIndicators: {
    position: 'bottom-right',
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.178.34'],
  async rewrites() {
    return [
      {
        source: '/dice',
        destination: '/games/dice',
      },
      {
        source: '/dice/v2',
        destination: '/games/dice',
      },
    ];
  },
};

// org/project/authToken are read from SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN
// (see docs/architecture/05_1.9_ERROR_TRACKING_SENTRY.md, M1). A missing
// SENTRY_AUTH_TOKEN only skips source map upload, it does not fail the build.
const configWithSentry = withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  widenClientFileUpload: false,
  // Navigation tracing remains intentionally disabled until URL redaction has its own review.
  suppressOnRouterTransitionStartWarning: true,
});

// T_FRONTEND/Planungsdateien/01_performance_cwv_plan.md L1: opt-in bundle report,
// `ANALYZE=true npm run build` — never runs in a normal build/CI, adds no overhead there.
export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(configWithSentry);
