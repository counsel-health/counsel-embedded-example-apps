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
    expect(response.status()).toBe(400);
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
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      errors: {
        message: expect.stringMatching(
          /Invalid request body|Missing request body/
        ),
      },
    });
  });
});
