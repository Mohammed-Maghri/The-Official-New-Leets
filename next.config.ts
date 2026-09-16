import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production verification separate from a running development preview.
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.intra.42.fr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
