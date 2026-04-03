import type { NextConfig } from "next";
// Validate the environment variables
import "./src/envConfig";

const nextConfig: NextConfig = {
  output: "standalone",
  // Turbopack workspace root (silences multi-lockfile warning). Use cwd so the
  // compiled config avoids import.meta / mixed ESM-CJS issues in next.config.ts.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
