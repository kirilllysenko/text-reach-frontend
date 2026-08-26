import { expect, test } from "@playwright/test";
import { inactiveSessionResponse, mockGraphQL } from "./support/graphql";

const pageCases = [
  {
    path: "/trial-expired",
    title: "Your free trial has ended",
    eyebrow: "7-day trial complete",
    description: "Access to this workspace is paused now that the trial period is over.",
  },
  {
    path: "/account-suspended",
    title: "This account is suspended",
    eyebrow: "Account paused",
    description: "Your workspace is temporarily unavailable.",
  },
  {
    path: "/account-closed",
    title: "This account is no longer active",
    eyebrow: "Account closed",
    description: "The workspace has been closed and is not available for sign-in.",
  },
  {
    path: "/account-unavailable",
    title: "We can’t open this workspace",
    eyebrow: "Access unavailable",
    description: "Your session is valid, but it no longer has access to an active Text Reach workspace.",
  },
] as const;

for (const pageCase of pageCases) {
  test(`${pageCase.path} explains the access state without exposing workspace data`, async ({ page }) => {
    await page.goto(pageCase.path);

    await expect(page).toHaveTitle(`${pageCase.title} | Text Reach`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.getByRole("heading", { level: 1, name: pageCase.title })).toBeVisible();
    await expect(page.getByText(pageCase.eyebrow, { exact: true })).toBeVisible();
    await expect(page.getByText(pageCase.description, { exact: false })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "What you can do" })).toBeVisible();
    await expect(page.getByRole("listitem")).toHaveCount(3);
    await expect(page.getByText("Your workspace data is not shown on this page.", { exact: true })).toBeVisible();

    const returnLink = page.getByRole("link", { name: "Return to sign in" });
    await expect(returnLink).toHaveAttribute("href", /sign-in$/);
  });
}

test("the access-state action returns to a usable sign-in page", async ({ page }) => {
  await mockGraphQL(page, {
    SignInSessionQuery: () => inactiveSessionResponse,
  });
  await page.goto("/trial-expired");

  await page.getByRole("link", { name: "Return to sign in" }).click();

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
});

test("the expired-trial page has no horizontal overflow on a phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trial-expired");

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  await expect(page.getByRole("link", { name: "Return to sign in" })).toBeVisible();
});
