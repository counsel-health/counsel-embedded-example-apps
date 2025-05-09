import type { NextConfig } from "next";
// Validate the environment variables
import "./src/envConfig";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
