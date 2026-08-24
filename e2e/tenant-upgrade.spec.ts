import { expect, test, type Page } from "@playwright/test";
import { activeSessionResponse, graphQLError, mockGraphQL, tenantLifecycleResponse } from "./support/graphql";

const writableProfileResponse = {
  data: {
    profile: {
      accessGroups: ["BUSINESS_PROFILE_READ", "BUSINESS_PROFILE_WRITE"],
      email: "owner@example.com",
      name: "Workspace Owner",
    },
  },
};

async function mockUpgradePage(page: Page, lifecycle: Parameters<typeof tenantLifecycleResponse>[0]): Promise<void> {
  await mockGraphQL(page, {
    CheckSession: () => activeSessionResponse,
    Profile: () => writableProfileResponse,
    TenantLifecycle: () => tenantLifecycleResponse(lifecycle),
  });
}

test("an unverified trial can start the full-access upgrade", async ({ page }) => {
  await mockUpgradePage(page, { businessVerification: "UNVERIFIED" });

  await page.goto("/upgrade");

  await expect(page).toHaveTitle("Upgrade to full access | Mega Texting");
  await expect(page.getByRole("heading", { name: "Submit your business information" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start upgrade" })).toHaveAttribute(
    "href",
    "/business/edit?returnTo=%2Fupgrade",
  );
  await expect(page.locator("#sidebar-nav-upgrade")).toContainText("Complete your business review");
});

test("a pending trial sees the review state and submitted details", async ({ page }) => {
  await mockUpgradePage(page, { businessVerification: "PENDING" });

  await page.goto("/upgrade");

  await expect(page.getByRole("heading", { name: "Your business is under review" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Review submitted details" })).toHaveAttribute("href", "/business");
  await expect(page.getByText("Updating your business information submits a new profile version")).toBeVisible();
  await expect(page.locator("#sidebar-nav-upgrade")).toContainText("Your business is under review");
});

test("a rejected trial is directed to update and resubmit", async ({ page }) => {
  await mockUpgradePage(page, { businessVerification: "REJECTED" });

  await page.goto("/upgrade");

  await expect(page.getByRole("heading", { name: "Update your business information" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Update and resubmit" })).toHaveAttribute(
    "href",
    "/business/edit?returnTo=%2Fupgrade",
  );
  await expect(page.locator("#sidebar-nav-upgrade")).toContainText("Update your business details");
});

test("a fully approved tenant sees completion without the trial sidebar entry", async ({ page }) => {
  await mockUpgradePage(page, { accessMode: "FULL", businessVerification: "VERIFIED" });

  await page.goto("/upgrade");

  await expect(page.getByRole("heading", { name: "Full access is active" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to dashboard" })).toHaveAttribute("href", "/dashboard");
  await expect(page.locator("#sidebar-nav-upgrade")).toHaveCount(0);
});

test("the upgrade page offers retry when lifecycle loading fails", async ({ page }) => {
  await mockGraphQL(page, {
    CheckSession: () => activeSessionResponse,
    Profile: () => writableProfileResponse,
    TenantLifecycle: () => graphQLError("INTERNAL_SERVER_ERROR"),
  });

  await page.goto("/upgrade");

  await expect(page.getByRole("heading", { name: "Unable to load upgrade status" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});
