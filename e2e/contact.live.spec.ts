import { expect, test, type BrowserContext, type Locator, type Page } from "@playwright/test";

interface RowCounts {
  total: number;
  visible: number;
}

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const configured = Boolean(email && password);

let context: BrowserContext;
let page: Page;

test.describe.serial("contact page against a live backend", () => {
  test.skip(!configured, "Set E2E_EMAIL and E2E_PASSWORD to run the live contact suite.");

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    page.setDefaultTimeout(15_000);

    await signIn(page, email!, password!);
    await page.getByRole("link", { name: "Contacts", exact: true }).click();
    await page.waitForURL("**/contact");
    await expect(page.getByRole("heading", { name: "Contacts", exact: true })).toBeVisible();
    await expect.poll(() => dataRowCheckboxes(page).count()).toBeGreaterThan(1);
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test("sorts contacts", async () => {
    await page.getByRole("button", { name: /^Sort/ }).click();
    const dialog = visibleDialog(page, "Sort contacts");
    await expect(dialog).toBeVisible();

    await dialog.locator("select").nth(0).selectOption("phoneNumber");
    const removeSecondRule = dialog.getByRole("button", { name: "Remove sort rule 2", exact: true });
    if (await removeSecondRule.isVisible()) {
      await removeSecondRule.click();
    }

    await dialog.locator("select").nth(1).selectOption("ascending");
    await expect.poll(async () => isSorted(await visiblePhoneNumbers(page), "ascending")).toBe(true);

    await dialog.locator("select").nth(1).selectOption("descending");
    await expect.poll(async () => isSorted(await visiblePhoneNumbers(page), "descending")).toBe(true);
    const descendingPhones = await visiblePhoneNumbers(page);

    await dialog.locator("select").nth(1).selectOption("ascending");
    await expect.poll(async () => isSorted(await visiblePhoneNumbers(page), "ascending")).toBe(true);
    const ascendingPhones = await visiblePhoneNumbers(page);

    expect(descendingPhones).not.toEqual(ascendingPhones);
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
  });

  test("filters contacts", async () => {
    const targetPhone = (await visiblePhoneNumbers(page))[0];
    expect(targetPhone).toBeTruthy();

    const search = page.getByPlaceholder("Search contacts");
    await search.fill(targetPhone);
    await expect.poll(() => visiblePhoneNumbers(page)).toEqual([targetPhone]);
    await expect(tableStatus(page)).toHaveText("1 of 1 rows");

    await search.clear();
    await expect.poll(() => dataRowCheckboxes(page).count()).toBeGreaterThan(1);
  });

  test("loads more contacts while scrolling", async () => {
    const initialCounts = await rowCounts(page);
    expect(
      initialCounts.total,
      "Infinite-scroll coverage requires the tenant to have more contacts than the first table page.",
    ).toBeGreaterThan(initialCounts.visible);

    const initiallyVisiblePhones = await visiblePhoneNumbers(page);
    const scroller = page.locator("[data-table-root] div.overflow-auto");
    await scroller.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));

    await expect.poll(async () => (await rowCounts(page)).visible).toBeGreaterThan(initialCounts.visible);

    const loadedPhones = await visiblePhoneNumbers(page);
    expect(loadedPhones).toEqual(expect.arrayContaining(initiallyVisiblePhones));
  });
});

async function signIn(activePage: Page, accountEmail: string, accountPassword: string): Promise<void> {
  await activePage.goto("/sign-in");
  await activePage.getByLabel("E-mail").fill(accountEmail);
  await activePage.getByLabel("Password").fill(accountPassword);

  await Promise.all([
    activePage.waitForURL("**/dashboard", { timeout: 30_000 }),
    activePage.getByRole("button", { name: "Sign in", exact: true }).click(),
  ]);
}

async function visiblePhoneNumbers(activePage: Page): Promise<string[]> {
  const checkboxes = dataRowCheckboxes(activePage);
  const phones: string[] = [];

  for (let index = 0; index < (await checkboxes.count()); index += 1) {
    const row = checkboxes.nth(index).locator("xpath=../..");
    const phone = await row.locator(":scope > div").nth(2).innerText();
    phones.push(normalizePhoneNumber(phone));
  }

  return phones;
}

function isSorted(values: string[], direction: "ascending" | "descending"): boolean {
  return values.every((value, index) => {
    const nextValue = values[index + 1];
    if (typeof nextValue === "undefined") {
      return true;
    }

    const comparison = value.localeCompare(nextValue);
    return direction === "ascending" ? comparison <= 0 : comparison >= 0;
  });
}

async function rowCounts(activePage: Page): Promise<RowCounts> {
  const status = await tableStatus(activePage).innerText();
  const match = /^(\d+) of (\d+) rows$/.exec(status.trim());

  if (!match) {
    throw new Error(`Unexpected contact table status: ${status}`);
  }

  return {
    visible: Number(match[1]),
    total: Number(match[2]),
  };
}

function normalizePhoneNumber(value: string): string {
  return value.replace(/\D/g, "");
}

function dataRowCheckboxes(activePage: Page): Locator {
  return activePage.getByRole("checkbox", { name: /^Select row / });
}

function tableStatus(activePage: Page): Locator {
  return activePage.locator("[data-table-root]").getByText(/\d+ of \d+ rows/);
}

function visibleDialog(activePage: Page, label: string): Locator {
  return activePage.locator(`[role="dialog"][aria-label="${label}"]:visible`);
}
