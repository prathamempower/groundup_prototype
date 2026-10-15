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
  async redirects() {
    return [
      {
        source: "/auth/signup",
        destination: "/auth/sign-up",
        permanent: false,
      },
      {
        source: "/signup",
        destination: "/auth/sign-up",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const apiProxyUrl = process.env.API_PROXY_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/v1/sample-docs/:path*",
        destination: "/sample-docs/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyUrl}/api/v1/:path*`,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.output = config.output || {};
      config.output.chunkLoadTimeout = 300000;
    }
    return config;
  },
};

export default nextConfig;
