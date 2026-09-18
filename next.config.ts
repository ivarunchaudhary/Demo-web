import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // The spec's API lives at /assets/... . HTML pages share that path, so
    // clients that ask for JSON get routed to the handlers under /api.
    const json = [{ type: "header" as const, key: "accept", value: "(.*application/json.*)" }];
    return [
      { source: "/assets", has: json, destination: "/api/assets" },
      { source: "/assets/:asset", has: json, destination: "/api/assets/:asset" },
      { source: "/assets/:asset/:section", has: json, destination: "/api/assets/:asset/:section" },
    ];
  },
};

export default nextConfig;
