import { test, expect } from "@playwright/test";

test.describe("demo server health", () => {
  test("GET /health returns ok", async ({ request }) => {
    const response = await request.get("/health");
    await expect(response).toBeOK();
    const body = await response.json();
    expect(body).toEqual({ message: "ok" });
  });
});
