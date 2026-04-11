import { expect, test } from "@playwright/test";

/**
 * Verifies CORS and security headers are present on responses.
 * These headers are set by the framework-level middleware (Express helmet/CORS
 * → Elysia @elysiajs/cors + manual headers), so they're a key migration regression check.
 */

test.describe("CORS headers", () => {
  test("GET /health includes Access-Control-Allow-Origin: *", async ({
    request,
  }) => {
    const resp = await request.get("/health");
    expect(resp.headers()["access-control-allow-origin"]).toBe("*");
  });

  test("POST /user/signUp includes Access-Control-Allow-Origin: *", async ({
    request,
  }) => {
    const resp = await request.post("/user/signUp", { data: {} });
    // The request fails (400) but CORS headers should still be present
    expect(resp.headers()["access-control-allow-origin"]).toBe("*");
  });

  test("OPTIONS preflight on /health responds with CORS allow headers", async ({
    request,
  }) => {
    const resp = await request.fetch("/health", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3001",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization",
      },
    });
    // Express returns 204; Elysia cors plugin returns 200 — both acceptable
    expect([200, 204]).toContain(resp.status());
    expect(resp.headers()["access-control-allow-origin"]).toBe("*");
    const allowMethods = resp.headers()["access-control-allow-methods"] ?? "";
    expect(allowMethods.toUpperCase()).toContain("POST");
  });
});

test.describe("security headers", () => {
  test("GET /health includes X-Content-Type-Options: nosniff", async ({
    request,
  }) => {
    const resp = await request.get("/health");
    expect(resp.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("GET /health includes X-Frame-Options", async ({ request }) => {
    const resp = await request.get("/health");
    expect(resp.headers()["x-frame-options"]).toMatch(/SAMEORIGIN/i);
  });

  test("GET /health includes Cross-Origin-Resource-Policy: cross-origin", async ({
    request,
  }) => {
    const resp = await request.get("/health");
    expect(resp.headers()["cross-origin-resource-policy"]).toBe("cross-origin");
  });
});
