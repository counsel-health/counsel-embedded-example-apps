import { defineConfig, devices } from "@playwright/test";

const isCi = process.env["CI"] === "true";

export default defineConfig({
  timeout: 2 * 60 * 1000,
  fullyParallel: true,
  expect: { timeout: 10_000 },
  reporter: [["html", { outputFolder: "reports/html" }], ["list"]],
  workers: isCi ? 2 : 5,
  testDir: ".",
  projects: [
    {
      name: "api",
      testMatch: "api/**/*.spec.ts",
      retries: isCi ? 1 : 0,
      use: {
        baseURL: process.env["API_BASE_URL"] ?? "http://127.0.0.1:4003",
      },
    },
    {
      name: "ui",
      testMatch: "ui/**/*.spec.ts",
      retries: isCi ? 1 : 0,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env["WEB_BASE_URL"] ?? "http://127.0.0.1:3001",
        actionTimeout: 20_000,
        navigationTimeout: 30_000,
        headless: isCi || process.env["HEADLESS"] === "true",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.81",
        permissions: ["clipboard-read", "clipboard-write"],
        testIdAttribute: "data-testid",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
    },
  ],
});
