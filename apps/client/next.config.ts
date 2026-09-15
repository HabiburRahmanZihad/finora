import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@finora/database", "@finora/types", "@finora/utils", "@finora/validation"],
};

export default nextConfig;
