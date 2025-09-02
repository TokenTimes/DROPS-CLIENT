/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE:
      process.env.NEXT_PUBLIC_API_BASE ||
      "https://copypools-production.up.railway.app",
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
      "737aa0f223832ad056c6a74e4644d9a2",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_BASE ||
          "https://copypools-production.up.railway.app"
        }/api/:path*`,
      },
    ];
  },
  outputFileTracingRoot: require("path").resolve(__dirname),
};

module.exports = nextConfig;
