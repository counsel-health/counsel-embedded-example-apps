import { expect, test } from "@playwright/test";

/**
 * Verifies that all JWT-protected endpoints correctly reject unauthorized requests.
 * These tests require no live Counsel API — they all fail at the auth layer.
 */

const PROTECTED: Array<{ method: "GET" | "POST"; path: string }> = [
  { method: "POST", path: "/user/signOut" },
  { method: "POST", path: "/user/signedAppUrl" },
  { method: "GET", path: "/user/threads" },
  { method: "POST", path: "/token" },
];

test.describe("auth middleware — no token", () => {
  for (const { method, path } of PROTECTED) {
    test(`${method} ${path} → 401`, async ({ request }) => {
      const resp =
        method === "GET"
          ? await request.get(path)
          : await request.post(path, { data: {} });
      expect(resp.status()).toBe(401);
      expect(await resp.json()).toEqual({ error: "No token provided" });
    });
  }
});

test.describe("auth middleware — invalid token", () => {
  for (const { method, path } of PROTECTED) {
    test(`${method} ${path} → 401`, async ({ request }) => {
      const headers = { Authorization: "Bearer this-is-not-a-valid-jwt" };
      const resp =
        method === "GET"
          ? await request.get(path, { headers })
          : await request.post(path, { data: {}, headers });
      expect(resp.status()).toBe(401);
      expect(await resp.json()).toEqual({ error: "Invalid token" });
    });
  }
});

test.describe("auth middleware — malformed header", () => {
  test("POST /user/signOut with no Bearer prefix → 401", async ({
    request,
  }) => {
    const resp = await request.post("/user/signOut", {
      data: {},
      headers: { Authorization: "not-a-bearer-token" },
    });
    expect(resp.status()).toBe(401);
    const body = await resp.json();
    expect(body).toMatchObject({ error: expect.any(String) });
  });
});
