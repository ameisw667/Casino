import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'www.gstatic.com' },
    ],
  },
  devIndicators: {
    position: 'bottom-right',
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.178.34'],
};

export default nextConfig;
