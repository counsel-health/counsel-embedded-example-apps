import { test, expect } from "@playwright/test";

test.describe("login smoke", () => {
  test("unknown access code shows error and stays on login", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.getByLabel("Access Code").fill("ZZZZZZ");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Invalid access code")).toBeVisible();
  });
});
