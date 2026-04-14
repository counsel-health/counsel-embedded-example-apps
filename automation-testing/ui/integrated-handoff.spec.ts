import { expect, test, type Response } from "@playwright/test";

// Prefer a code with navMode: integrated; otherwise use the same JWT code as embedded-flow (CI sets E2E_ACCESS_CODE).
const accessCode =
  process.env["E2E_ACCESS_CODE_INTEGRATED"] ??
  process.env["E2E_ACCESS_CODE"] ??
  "AICHAT";

test.describe("integrated chat - connect to care handoff", () => {
  test("real Counsel API: signedAppUrl succeeds and Counsel iframe loads", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Access Code").fill(accessCode!);
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/(dashboard|integrated)/, {
      timeout: 15_000,
    });

    if (!page.url().includes("/integrated/chat")) {
      await page.goto("/integrated/chat");
    }
    await page.waitForLoadState("domcontentloaded");

    const chatInput = page.getByPlaceholder("Type a message…");
    await expect(chatInput).toBeVisible({ timeout: 10_000 });

    const triggerText = "I need to see a doctor about my symptoms";
    await chatInput.click();
    await chatInput.pressSequentially(triggerText, { delay: 30 });
    await page.getByRole("button", { name: "Send" }).click();

    await expect(
      page.getByRole("button", { name: "Connect to Counsel" })
    ).toBeVisible();

    // The handoff flow now creates a thread via API first, then opens it via signedAppUrl.
    const createThreadResponse = page.waitForResponse(
      (resp: Response) =>
        resp.url().includes("/threads") &&
        resp.request().method() === "POST" &&
        resp.request().resourceType() === "fetch"
    );
    const signedUrlResponse = page.waitForResponse(
      (resp: Response) =>
        resp.url().includes("/signedAppUrl") &&
        resp.request().method() === "POST" &&
        resp.request().resourceType() === "fetch"
    );

    await page.getByRole("button", { name: "Connect to Counsel" }).click();

    const threadResponse = await createThreadResponse;
    expect(
      threadResponse.ok(),
      `POST /threads failed: ${threadResponse.status()}`
    ).toBe(true);

    const response = await signedUrlResponse;
    expect(response.ok(), `signedAppUrl failed: ${response.status()}`).toBe(
      true
    );

    await expect(
      page.getByRole("button", { name: /Counsel chat/ })
    ).toBeVisible({ timeout: 15_000 });

    const iframe = page.getByTitle("Counsel App");
    await expect(iframe).toBeVisible({ timeout: 30_000 });
    const src = await iframe.getAttribute("src");
    expect(src).toBeTruthy();
    expect(src).toMatch(/^https?:\/\//);
  });
});
