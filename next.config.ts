import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

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
};

// org/project/authToken are read from SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN
// (see docs/architecture/05_1.9_ERROR_TRACKING_SENTRY.md, M1). A missing
// SENTRY_AUTH_TOKEN only skips source map upload, it does not fail the build.
export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  widenClientFileUpload: false,
});
