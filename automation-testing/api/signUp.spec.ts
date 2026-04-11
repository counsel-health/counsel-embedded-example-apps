import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

/**
 * Sign-up body validation can surface as:
 * - Elysia/Zod detail JSON (`type: "validation"`, `on: "body"`)
 * - Global onError shape `{ errors: { message: "Invalid request body" } }`
 * - Plain text when response-schema validation mangles the error body
 */
function assertSignUpBodyValidation422(raw: string): void {
  const text = raw.trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    expect(text).toBe("Invalid request body");
    return;
  }
  if (!parsed || typeof parsed !== "object" || parsed === null) {
    throw new Error("Expected object JSON for 422 body validation");
  }
  const o = parsed as Record<string, unknown>;
  if (o["type"] === "validation" && o["on"] === "body") {
    return;
  }
  expect(parsed).toMatchObject({
    errors: { message: "Invalid request body" },
  });
}

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
    // Elysia can surface UserFacingError as plain text when route `response` schema is success-only.
    expect((await response.text()).trim()).toBe("Invalid access code");
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
    assertSignUpBodyValidation422(await response.text());
  });

  test("rejects empty JSON body", async ({ request }) => {
    const response = await request.post("/user/signUp", {
      data: {},
    });
    // 422 Unprocessable Entity — missing required accessCode field
    expect(response.status()).toBe(422);
    assertSignUpBodyValidation422(await response.text());
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
