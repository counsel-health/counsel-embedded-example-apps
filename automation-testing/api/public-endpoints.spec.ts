import { expect, test } from "@playwright/test";

/**
 * Verifies unauthenticated public endpoints respond correctly.
 */

test.describe("public endpoints", () => {
  test("GET / returns welcome message", async ({ request }) => {
    const resp = await request.get("/");
    await expect(resp).toBeOK();
    const body = await resp.json();
    expect(body).toMatchObject({ message: expect.any(String) });
  });

  test("GET /.well-known/jwks.json returns a key set", async ({ request }) => {
    // Requires COUNSEL_PRIVATE_KEY_PEM to be configured (jwt auth flow only).
    // Skip gracefully in environments that use API key auth.
    test.skip(
      !process.env["COUNSEL_PRIVATE_KEY_PEM"],
      "JWT auth (COUNSEL_PRIVATE_KEY_PEM) not configured in this environment"
    );

    const resp = await request.get("/.well-known/jwks.json");
    await expect(resp).toBeOK();
    const body = await resp.json();
    expect(body).toMatchObject({ keys: expect.any(Array) });
    expect((body.keys as unknown[]).length).toBeGreaterThan(0);
    expect(body.keys[0]).toMatchObject({
      kty: "RSA",
      use: "sig",
      alg: "RS256",
    });
  });
});
