import type { NextConfig } from "next";

const API_ORIGIN = process.env.API_PROXY_ORIGIN ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    // Proxies API calls through this same origin so the browser treats the
    // auth cookie as first-party — the frontend (Vercel) and API (Render)
    // are on different domains, and browsers increasingly block or drop
    // cross-site cookies (Safari, Firefox strict mode, Chrome rollout),
    // which broke login even with SameSite=None; Secure set correctly.
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
