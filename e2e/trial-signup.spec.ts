import { expect, test } from "@playwright/test";
import { inactiveSessionResponse, mockGraphQL } from "./support/graphql";

test("signup explains the trial terms before account creation", async ({ page }) => {
  await page.goto("/sign-up");

  await expect(page.getByRole("heading", { level: 1, name: "Start your 7-day free trial" })).toBeVisible();
  await expect(page.getByText("No payment method required", { exact: true })).toBeVisible();
  await expect(page.getByText("Submit your business profile during the trial", { exact: false })).toBeVisible();
  await expect(page.locator("#sign-up-submit")).toHaveText("Sign up");
});

test("successful signup confirms that the seven-day trial started", async ({ page }) => {
  await mockGraphQL(page, {
    SignInSessionQuery: () => inactiveSessionResponse,
  });
  await page.goto("/sign-in?signUpOk=1");

  await expect(page).toHaveURL(/\/sign-in\?signUpOk=1$/);
  await expect(page.locator("#sign-up-success")).toHaveText(
    "Your 7-day trial has started. Use your email and password to sign in.",
  );
});
