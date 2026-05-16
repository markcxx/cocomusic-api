import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/v1/:path*",
        destination: `${process.env.BACKEND_API_URL}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
