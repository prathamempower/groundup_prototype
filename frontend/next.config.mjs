/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === "production" ? ".next" : ".next-dev"),
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Prevent ChunkLoadError timeouts during heavy initial compilation on dev
      config.output = config.output || {};
      config.output.chunkLoadTimeout = 300000;
    }
    return config;
  },
};

export default nextConfig;
