import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
    conditions: ["import", "node", "default"],
  },
  test: {
    environment: "node",
    deps: {
      interopDefault: true,
    },
  },
});
