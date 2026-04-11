import { expect, test } from "@playwright/test";

/**
 * Verifies that unmatched routes return a consistent 404 error shape.
 * The shape { errors: { message: string } } must be preserved across the migration.
 */

test.describe("unknown routes → 404", () => {
  test("GET unknown path returns 404 with error shape", async ({ request }) => {
    const resp = await request.get(`/does-not-exist-${Date.now()}`);
    expect(resp.status()).toBe(404);
    const body = await resp.json();
    expect(body).toMatchObject({ errors: { message: expect.any(String) } });
  });

  test("POST unknown path returns 404 with error shape", async ({
    request,
  }) => {
    const resp = await request.post(`/does-not-exist-${Date.now()}`, {
      data: {},
    });
    expect(resp.status()).toBe(404);
    const body = await resp.json();
    expect(body).toMatchObject({ errors: { message: expect.any(String) } });
  });
});
