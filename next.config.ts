import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,

  cacheLife: {
    github: {
      stale: 900,
      revalidate: 900,
      expire: 86400,
    },
    endorphins: {
      stale: 14400,
      revalidate: 14400,
      expire: 604800,
    },
  },
};

export default nextConfig;