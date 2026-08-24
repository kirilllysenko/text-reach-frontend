import { expect, test, type Page } from "@playwright/test";
import { accessFailureCases } from "./support/account-access";
import {
  activeSessionResponse,
  graphQLError,
  inactiveSessionResponse,
  mockGraphQL,
  profileResponse,
} from "./support/graphql";

const credentials = {
  email: "owner@example.com",
  password: "Password1",
};

async function submitSignIn(page: Page): Promise<void> {
  await page.getByLabel("E-mail").fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.locator("#sign-in-submit").click();
}

for (const failure of accessFailureCases) {
  test(`an existing session with ${failure.code} opens ${failure.path}`, async ({ page }) => {
    await mockGraphQL(page, {
      CheckSession: () => graphQLError(failure.code),
    });

    await page.goto("/dashboard");

    await expect(page).toHaveURL(new RegExp(`${failure.path}$`));
  });

  test(`loading sign-in with ${failure.code} opens ${failure.path}`, async ({ page }) => {
    await mockGraphQL(page, {
      SignInSessionQuery: () => graphQLError(failure.code),
    });

    await page.goto("/sign-in");

    await expect(page).toHaveURL(new RegExp(`${failure.path}$`));
  });

  test(`submitting sign-in with ${failure.code} opens ${failure.path}`, async ({ page }) => {
    await mockGraphQL(page, {
      SignInSessionQuery: () => inactiveSessionResponse,
      SignIn: () => graphQLError(failure.code),
    });
    await page.goto("/sign-in");

    await submitSignIn(page);

    await expect(page).toHaveURL(new RegExp(`${failure.path}$`));
  });
}

test("an unrelated session error keeps its sign-in warning flow", async ({ page }) => {
  await mockGraphQL(page, {
    CheckSession: () => graphQLError("SESSION_EXPIRED"),
    SignInSessionQuery: () => inactiveSessionResponse,
  });

  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/sign-in\?sessionError=SESSION_EXPIRED$/);
  await expect(page.getByText("Your session has expired. Please sign in again.", { exact: true })).toBeVisible();
});

test("an unrelated sign-in error stays inline", async ({ page }) => {
  await mockGraphQL(page, {
    SignInSessionQuery: () => inactiveSessionResponse,
    SignIn: () => graphQLError("INVALID_VALUE", "Invalid email or password"),
  });
  await page.goto("/sign-in");

  await submitSignIn(page);

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByText("Invalid email or password", { exact: true }).first()).toBeVisible();
});

test("an active session still proceeds to the app", async ({ page }) => {
  await mockGraphQL(page, {
    SignInSessionQuery: () => activeSessionResponse,
    CheckSession: () => activeSessionResponse,
    Profile: () => profileResponse,
  });

  await page.goto("/sign-in");

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Dashboard", { exact: true }).first()).toBeVisible();
});

test("successful sign-in still proceeds to the app", async ({ page }) => {
  let submittedInput: unknown;
  await mockGraphQL(page, {
    SignInSessionQuery: () => inactiveSessionResponse,
    SignIn: (variables) => {
      submittedInput = variables.input;
      return { data: { signIn: true } };
    },
    CheckSession: () => activeSessionResponse,
    Profile: () => profileResponse,
  });
  await page.goto("/sign-in");

  await submitSignIn(page);

  await expect(page).toHaveURL(/\/dashboard$/);
  expect(submittedInput).toEqual(credentials);
});
