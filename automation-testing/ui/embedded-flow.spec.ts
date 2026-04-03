import { test, expect } from "@playwright/test";

const accessCode = process.env["E2E_ACCESS_CODE"];

test.describe("embedded flow", () => {
  test.skip(
    !accessCode || accessCode.length !== 6,
    "Set E2E_ACCESS_CODE (6 chars) to run full UI flow against a real Counsel-backed server"
  );

  test("login, dashboard, chat iframe", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Access Code").fill(accessCode!);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: "Welcome back!" })
    ).toBeVisible({ timeout: 15_000 });

    await page.goto("/dashboard/chat");

    const frame = page.locator("iframe").first();
    await expect(frame).toBeVisible({ timeout: 30_000 });
    const src = await frame.getAttribute("src");
    expect(src).toBeTruthy();
    expect(src).toMatch(/^https?:\/\//);
  });
});
