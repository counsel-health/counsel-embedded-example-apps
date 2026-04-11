import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.describe("POST /user/signUp", () => {
  test("rejects unknown access code without calling Counsel", async ({
    request,
  }) => {
    const response = await request.post("/user/signUp", {
      data: {
        accessCode: "ZZZZZZ",
        userId: randomUUID(),
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "Invalid access code" });
  });

  test("rejects invalid body when accessCode length is not 6", async ({
    request,
  }) => {
    const response = await request.post("/user/signUp", {
      data: {
        accessCode: "NO",
        userId: randomUUID(),
      },
    });
    // 422 Unprocessable Entity — Elysia Zod schema validation failure
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body).toMatchObject({
      errors: {
        message: "Invalid request body",
      },
    });
  });

  test("rejects empty JSON body", async ({ request }) => {
    const response = await request.post("/user/signUp", {
      data: {},
    });
    // 422 Unprocessable Entity — missing required accessCode field
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body).toMatchObject({
      errors: {
        message: "Invalid request body",
      },
    });
  });

  test("valid access code → 200 with expected fields", async ({ request }) => {
    test.skip(
      !process.env["E2E_ACCESS_CODE"],
      "E2E_ACCESS_CODE not set — skipping success path test"
    );
    const response = await request.post("/user/signUp", {
      data: { accessCode: process.env["E2E_ACCESS_CODE"] },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      token: expect.any(String),
      counselUserId: expect.any(String),
      userType: expect.stringMatching(/^(main|onboarding)$/),
      authType: expect.stringMatching(/^(apiKey|jwt)$/),
      navMode: expect.stringMatching(/^(standalone|integrated)$/),
    });
  });
});
